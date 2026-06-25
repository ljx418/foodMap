import { assessCoordinateRisk } from "./coordinateRisk";
import { findDuplicatePlaceWarning, normalizeDuplicateName } from "./duplicates";
import { derivePersonalDataHealthReport } from "./locationStatus";
import type { FoodPlace, GovernanceJournalEntry, ShareSnapshot } from "./types";
import { createId, normalizeTags, nowIso } from "./validators";

export type GovernanceIssueKind = "pending" | "high-risk" | "manual-adjusted" | "skipped" | "stale-reference" | "duplicate" | "import-conflict";
export type GovernanceActionKind = "mark-reviewed" | "add-to-queue" | "mark-skipped" | "apply-tag" | "ignore-duplicate" | "keep-duplicate" | "merge-duplicate" | "import-create" | "import-update" | "import-skip";
export type DuplicateDecisionKind = "ignore" | "keep" | "merge";
export type ImportConflictStrategy = "create" | "update" | "skip";

export interface GovernanceIssue {
  id: string;
  kind: GovernanceIssueKind;
  placeIds: string[];
  title: string;
  reason: string;
  severity: "info" | "warning" | "danger";
}

export interface GovernanceIssueGroup {
  kind: GovernanceIssueKind;
  title: string;
  issues: GovernanceIssue[];
}

export interface DuplicateSuggestion {
  id: string;
  primary: FoodPlace;
  duplicate: FoodPlace;
  distanceMeters: number;
  score: number;
  evidence: string[];
  ignored: boolean;
}

export interface MergePreview {
  suggestionId: string;
  retained: FoodPlace;
  removed: FoodPlace;
  merged: FoodPlace;
  journalEntries: GovernanceJournalEntry[];
  warnings: string[];
}

export interface DuplicateDecisionPreview {
  suggestionId: string;
  decision: DuplicateDecisionKind;
  affectedPlaceIds: string[];
  title: string;
  summary: string;
  retained?: FoodPlace;
  removed?: FoodPlace;
  merged?: FoodPlace;
  journalEntries: GovernanceJournalEntry[];
  warnings: string[];
}

export interface GovernanceBatchPlan {
  id: string;
  action: GovernanceActionKind;
  issueIds: string[];
  affectedPlaceIds: string[];
  title: string;
  summary: string;
  risk: "low" | "medium" | "high";
  canCommit: boolean;
  entries: GovernanceJournalEntry[];
}

export interface ImportConflictItem {
  imported: FoodPlace;
  existing?: FoodPlace;
  decision: "create" | "update" | "duplicate" | "skip" | "risk";
  strategy: ImportConflictStrategy;
  reason: string;
}

export interface ImportConflictPlan {
  id: string;
  title: string;
  snapshot: ShareSnapshot;
  items: ImportConflictItem[];
  counts: Record<ImportConflictItem["decision"], number>;
}

export interface GovernanceReport {
  generatedAt: string;
  issueGroups: Array<{ kind: GovernanceIssueKind; title: string; count: number }>;
  issueCount: number;
  duplicateSuggestions: Array<{ id: string; primaryName: string; duplicateName: string; evidence: string[] }>;
  importSummary?: ImportConflictPlan["counts"];
  journal: Array<Pick<GovernanceJournalEntry, "action" | "summary" | "detail" | "createdAt">>;
}

export function deriveGovernanceIssueGroups(places: FoodPlace[], importPlan?: ImportConflictPlan): GovernanceIssueGroup[] {
  const health = derivePersonalDataHealthReport(places);
  const duplicateSuggestions = suggestDuplicatePlaces(places);
  const groups: GovernanceIssueGroup[] = [
    {
      kind: "pending",
      title: "待确认地点",
      issues: health.pending.map((place) => issueFromPlace("pending", place, "坐标仍是近似值或待校准状态", "warning"))
    },
    {
      kind: "high-risk",
      title: "高风险位置",
      issues: health.highRisk.map((place) => issueFromPlace("high-risk", place, "位置存在高风险标签或坐标风险", "danger"))
    },
    {
      kind: "skipped",
      title: "暂时跳过",
      issues: health.skipped.map((place) => issueFromPlace("skipped", place, "此前被暂时跳过，仍需后续处理", "warning"))
    },
    {
      kind: "manual-adjusted",
      title: "手动校准",
      issues: health.manualAdjusted.map((place) => issueFromPlace("manual-adjusted", place, "该地点有手动校准记录，可复核历史", "info"))
    },
    {
      kind: "stale-reference",
      title: "过期参考",
      issues: deriveStaleReferenceIssues(places)
    },
    {
      kind: "duplicate",
      title: "重复地点建议",
      issues: duplicateSuggestions.map((suggestion) => ({
        id: suggestion.id,
        kind: "duplicate",
        placeIds: [suggestion.primary.id, suggestion.duplicate.id],
        title: `${suggestion.primary.name} / ${suggestion.duplicate.name}`,
        reason: suggestion.evidence.join("；"),
        severity: "warning"
      }))
    }
  ];

  if (importPlan) {
    groups.push({
      kind: "import-conflict",
      title: "导入冲突",
      issues: importPlan.items.filter((item) => item.decision !== "create").map((item) => ({
        id: `import:${item.imported.id}`,
        kind: "import-conflict",
        placeIds: item.existing ? [item.existing.id, item.imported.id] : [item.imported.id],
        title: item.imported.name,
        reason: item.reason,
        severity: item.decision === "risk" ? "danger" : "warning"
      }))
    });
  }

  return groups.filter((group) => group.issues.length > 0);
}

export function planGovernanceBatchAction(action: GovernanceActionKind, issues: GovernanceIssue[]): GovernanceBatchPlan {
  const now = nowIso();
  const affectedPlaceIds = Array.from(new Set(issues.flatMap((issue) => issue.placeIds)));
  const config = getBatchActionConfig(action);
  const entries = affectedPlaceIds.map((placeId) => ({
    id: createId("journal"),
    placeIds: [placeId],
    action: config.journalAction,
    summary: config.journalSummary,
    detail: `来源：P20 治理工作台；影响问题：${issues.map((issue) => issue.title).join("，")}`,
    createdAt: now,
    actor: "user" as const
  }));
  const highRisk = issues.some((issue) => issue.severity === "danger" || issue.kind === "high-risk");
  return {
    id: createId("governance-plan"),
    action,
    issueIds: issues.map((issue) => issue.id),
    affectedPlaceIds,
    title: config.title,
    summary: `将处理 ${issues.length} 个问题，影响 ${affectedPlaceIds.length} 个地点。确认前不会写入本地数据。`,
    risk: highRisk ? "high" : "low",
    canCommit: !highRisk || config.allowHighRisk,
    entries
  };
}

export function applyGovernanceBatchPlan(places: FoodPlace[], plan: GovernanceBatchPlan): FoodPlace[] {
  if (!plan.canCommit) return places;
  if (!["mark-reviewed", "add-to-queue", "mark-skipped", "apply-tag"].includes(plan.action)) return places;
  const ids = new Set(plan.affectedPlaceIds);
  const tagByAction: Partial<Record<GovernanceActionKind, string>> = {
    "mark-reviewed": "已复核",
    "add-to-queue": "治理队列",
    "mark-skipped": "暂时跳过",
    "apply-tag": "治理标签"
  };
  const tag = tagByAction[plan.action];
  return places.map((place) => {
    if (!ids.has(place.id)) return place;
    return {
      ...place,
      tags: normalizeTags(tag ? [...place.tags, tag] : place.tags),
      updatedAt: nowIso()
    };
  });
}

export function suggestDuplicatePlaces(places: FoodPlace[]): DuplicateSuggestion[] {
  const suggestions: DuplicateSuggestion[] = [];
  const seen = new Set<string>();
  for (const place of places) {
    const warning = findDuplicatePlaceWarning(place, places, place.id);
    if (!warning) continue;
    const pair = [place.id, warning.place.id].sort().join(":");
    if (seen.has(pair)) continue;
    seen.add(pair);
    const nameA = normalizeDuplicateName(place.name);
    const nameB = normalizeDuplicateName(warning.place.name);
    const evidence = [
      nameA === nameB ? "名称标准化后相同" : "名称高度相似",
      `距离约 ${Math.round(warning.distanceMeters)} 米`
    ];
    if (place.address && warning.place.address && place.address === warning.place.address) evidence.push("地址相同");
    if (sharedTags(place, warning.place).length > 0) evidence.push(`共享标签：${sharedTags(place, warning.place).slice(0, 3).join("、")}`);
    suggestions.push({
      id: `duplicate:${pair}`,
      primary: newerPlace(place, warning.place),
      duplicate: newerPlace(place, warning.place).id === place.id ? warning.place : place,
      distanceMeters: warning.distanceMeters,
      score: Math.max(0.55, 1 - warning.distanceMeters / 1000),
      evidence,
      ignored: place.tags.includes("重复建议已忽略") || warning.place.tags.includes("重复建议已忽略")
    });
  }
  return suggestions.filter((item) => !item.ignored).sort((a, b) => b.score - a.score);
}

export function previewPlaceMerge(suggestion: DuplicateSuggestion): MergePreview {
  const preview = previewDuplicateDecision(suggestion, "merge");
  if (!preview.retained || !preview.removed || !preview.merged) {
    throw new Error("Merge preview is incomplete");
  }
  return {
    suggestionId: preview.suggestionId,
    retained: preview.retained,
    removed: preview.removed,
    merged: preview.merged,
    warnings: preview.warnings,
    journalEntries: preview.journalEntries
  };
}

export function previewDuplicateDecision(suggestion: DuplicateSuggestion, decision: DuplicateDecisionKind): DuplicateDecisionPreview {
  const now = nowIso();
  const retained = suggestion.primary;
  const removed = suggestion.duplicate;
  if (decision === "ignore" || decision === "keep") {
    const action = decision === "ignore" ? "duplicate-ignored" : "duplicate-kept";
    const title = decision === "ignore" ? "忽略重复建议" : "保留两条记录";
    return {
      suggestionId: suggestion.id,
      decision,
      affectedPlaceIds: [retained.id, removed.id],
      title,
      summary: decision === "ignore" ? "本次建议会被标记为已忽略，两条地点记录都会保留。" : "确认两条记录不是同一地点或都需要保留，不会删除任何记录。",
      retained,
      removed,
      warnings: ["该决策不会删除地点，也不会修改坐标。"],
      journalEntries: [{
        id: createId("journal"),
        placeIds: [retained.id, removed.id],
        action,
        summary: `${title}：${retained.name} / ${removed.name}`,
        detail: `证据：${suggestion.evidence.join("；")}。`,
        createdAt: now,
        actor: "user"
      }]
    };
  }
  const merged: FoodPlace = {
    ...retained,
    address: retained.address || removed.address,
    city: retained.city || removed.city,
    tags: normalizeTags([...retained.tags, ...removed.tags, "合并记录"]),
    rating: Math.max(retained.rating, removed.rating),
    notes: [retained.notes, removed.notes, `P20 合并预览：将「${removed.name}」合并到「${retained.name}」。`].filter(Boolean).join("\n\n"),
    photoIds: Array.from(new Set([...retained.photoIds, ...removed.photoIds])),
    updatedAt: now,
    mapAccuracy: retained.mapAccuracy === "exact" || removed.mapAccuracy === "exact" ? "exact" : retained.mapAccuracy
  };
  return {
    suggestionId: suggestion.id,
    decision: "merge",
    affectedPlaceIds: [retained.id, removed.id],
    title: "合并重复地点",
    summary: `将「${removed.name}」合并到「${retained.name}」。`,
    retained,
    removed,
    merged,
    warnings: ["合并会删除重复记录，但不会自动执行；必须用户确认。"],
    journalEntries: [{
      id: createId("journal"),
      placeIds: [retained.id, removed.id],
      action: "duplicate-merged",
      summary: `合并重复地点：${removed.name} -> ${retained.name}`,
      detail: `证据：${suggestion.evidence.join("；")}。保留地点 ${retained.id}，移除重复地点 ${removed.id}。`,
      createdAt: now,
      actor: "user"
    }]
  };
}

export function planImportConflicts(snapshot: ShareSnapshot, existingPlaces: FoodPlace[]): ImportConflictPlan {
  const items = snapshot.places.map((imported) => {
    const existingById = existingPlaces.find((place) => place.id === imported.id);
    const duplicate = existingById ? undefined : findDuplicatePlaceWarning(imported, existingPlaces);
    const risk = assessCoordinateRisk(imported);
    if (risk.level === "blocked") return { imported, decision: "risk" as const, strategy: "skip" as const, reason: risk.reasons.join("；") || "坐标风险较高" };
    if (imported.tags.includes("暂时跳过")) return { imported, decision: "skip" as const, strategy: "skip" as const, reason: "导入地点带有暂时跳过状态，默认不写入" };
    if (existingById) return { imported, existing: existingById, decision: "update" as const, strategy: "update" as const, reason: "导入文件包含已有地点 ID，确认后更新" };
    if (duplicate) return { imported, existing: duplicate.place, decision: "duplicate" as const, strategy: "skip" as const, reason: duplicate.message };
    return { imported, decision: "create" as const, strategy: "create" as const, reason: "新地点，确认后创建" };
  });
  const counts: ImportConflictPlan["counts"] = { create: 0, update: 0, duplicate: 0, skip: 0, risk: 0 };
  for (const item of items) counts[item.decision] += 1;
  return {
    id: createId("import-plan"),
    title: snapshot.title,
    snapshot,
    items,
    counts
  };
}

export function setImportConflictStrategy(plan: ImportConflictPlan, importedId: string, strategy: ImportConflictStrategy): ImportConflictPlan {
  return {
    ...plan,
    items: plan.items.map((item) => item.imported.id === importedId ? { ...item, strategy } : item)
  };
}

export function getWritableImportItems(plan: ImportConflictPlan): ImportConflictItem[] {
  return plan.items.filter((item) => item.strategy === "create" || item.strategy === "update");
}

export function journalEntryForImport(item: ImportConflictItem): GovernanceJournalEntry {
  const action = item.strategy === "update" ? "import-updated" : item.strategy === "create" ? "import-created" : "import-skipped";
  return {
    id: createId("journal"),
    placeIds: [item.existing?.id ?? item.imported.id],
    action,
    summary: `导入处理：${item.imported.name}`,
    detail: `${item.reason}；处理策略：${item.strategy}`,
    createdAt: nowIso(),
    actor: "user"
  };
}

export function deriveGovernanceReport(groups: GovernanceIssueGroup[], duplicateSuggestions: DuplicateSuggestion[], journal: GovernanceJournalEntry[], importPlan?: ImportConflictPlan): GovernanceReport {
  return {
    generatedAt: nowIso(),
    issueGroups: groups.map((group) => ({ kind: group.kind, title: group.title, count: group.issues.length })),
    issueCount: groups.reduce((total, group) => total + group.issues.length, 0),
    duplicateSuggestions: duplicateSuggestions.map((suggestion) => ({
      id: suggestion.id,
      primaryName: suggestion.primary.name,
      duplicateName: suggestion.duplicate.name,
      evidence: suggestion.evidence
    })),
    importSummary: importPlan?.counts,
    journal: journal.slice(0, 50).map((entry) => ({
      action: entry.action,
      summary: entry.summary,
      detail: entry.detail,
      createdAt: entry.createdAt
    }))
  };
}

export function downloadGovernanceReport(report: GovernanceReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `foodmap-governance-report-${report.generatedAt.slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function issueFromPlace(kind: GovernanceIssueKind, place: FoodPlace, reason: string, severity: GovernanceIssue["severity"]): GovernanceIssue {
  return {
    id: `${kind}:${place.id}`,
    kind,
    placeIds: [place.id],
    title: place.name,
    reason,
    severity
  };
}

function deriveStaleReferenceIssues(places: FoodPlace[]): GovernanceIssue[] {
  return places
    .filter((place) => {
      const haystack = `${place.tags.join(" ")} ${place.notes}`.toLowerCase();
      return place.tags.includes("过期参考") || place.tags.includes("证据过期") || haystack.includes("stale-reference") || haystack.includes("过期参考");
    })
    .map((place) => issueFromPlace("stale-reference", place, "该地点含过期参考或旧候选证据，需要复核", "warning"));
}

function getBatchActionConfig(action: GovernanceActionKind): {
  title: string;
  journalSummary: string;
  journalAction: GovernanceJournalEntry["action"];
  allowHighRisk: boolean;
} {
  switch (action) {
    case "add-to-queue":
      return { title: "加入处理队列", journalSummary: "治理工作台加入处理队列", journalAction: "batch-queued", allowHighRisk: true };
    case "mark-skipped":
      return { title: "标记暂时跳过", journalSummary: "治理工作台标记暂时跳过", journalAction: "batch-skipped", allowHighRisk: false };
    case "apply-tag":
      return { title: "应用治理标签", journalSummary: "治理工作台应用治理标签", journalAction: "batch-tag", allowHighRisk: true };
    case "mark-reviewed":
      return { title: "标记为已复核", journalSummary: "治理工作台标记已复核", journalAction: "batch-reviewed", allowHighRisk: false };
    case "ignore-duplicate":
      return { title: "忽略重复建议", journalSummary: "忽略重复地点建议", journalAction: "duplicate-ignored", allowHighRisk: true };
    case "keep-duplicate":
      return { title: "保留重复建议两条记录", journalSummary: "保留重复地点建议两条记录", journalAction: "duplicate-kept", allowHighRisk: true };
    default:
      return { title: "治理操作", journalSummary: "治理工作台操作", journalAction: "batch-tag", allowHighRisk: false };
  }
}

function sharedTags(a: FoodPlace, b: FoodPlace): string[] {
  const bTags = new Set(b.tags);
  return a.tags.filter((tag) => bTags.has(tag));
}

function newerPlace(a: FoodPlace, b: FoodPlace): FoodPlace {
  return a.updatedAt >= b.updatedAt ? a : b;
}
