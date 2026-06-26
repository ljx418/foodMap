import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, GitMerge, History, Inbox, Upload } from "lucide-react";
import type { DuplicateDecisionKind, DuplicateDecisionPreview, DuplicateSuggestion, GovernanceActionKind, GovernanceBatchPlan, GovernanceIssue, GovernanceIssueGroup, ImportConflictPlan, ImportConflictStrategy } from "../../domain/governance";
import { deriveGovernanceReport, downloadGovernanceReport, planGovernanceBatchAction, previewDuplicateDecision, setImportConflictStrategy, suggestDuplicatePlaces } from "../../domain/governance";
import type { FoodPlace, GovernanceJournalEntry } from "../../domain/types";

interface Props {
  places: FoodPlace[];
  issueGroups: GovernanceIssueGroup[];
  importPlan?: ImportConflictPlan;
  journal: GovernanceJournalEntry[];
  onFocusPlace: (placeId: string) => void;
  onCommitBatch: (plan: GovernanceBatchPlan) => Promise<void>;
  onDuplicateDecision: (preview: DuplicateDecisionPreview) => Promise<void>;
  onCommitImportPlan: (plan: ImportConflictPlan) => Promise<void>;
  onImportPlanChange: (plan: ImportConflictPlan) => void;
  onCancelImportPlan: () => void;
  onOpenImport: () => void;
}

export function GovernanceWorkbench({
  places,
  issueGroups,
  importPlan,
  journal,
  onFocusPlace,
  onCommitBatch,
  onDuplicateDecision,
  onCommitImportPlan,
  onImportPlanChange,
  onCancelImportPlan,
  onOpenImport
}: Props) {
  const [selectedKind, setSelectedKind] = useState(issueGroups[0]?.kind ?? "pending");
  const [batchPlan, setBatchPlan] = useState<GovernanceBatchPlan | undefined>();
  const [duplicatePreview, setDuplicatePreview] = useState<DuplicateDecisionPreview | undefined>();
  const [busy, setBusy] = useState(false);
  const duplicates = useMemo(() => suggestDuplicatePlaces(places), [places]);
  const activeGroup = issueGroups.find((group) => group.kind === selectedKind) ?? issueGroups[0];
  const progressCount = issueGroups.reduce((total, group) => total + group.issues.length, 0);
  const report = useMemo(() => deriveGovernanceReport(issueGroups, duplicates, journal, importPlan), [duplicates, importPlan, issueGroups, journal]);
  const writableImportCount = useMemo(
    () => importPlan?.items.filter((item) => item.strategy === "create" || item.strategy === "update").length ?? 0,
    [importPlan]
  );
  const skippedImportCount = importPlan ? importPlan.items.length - writableImportCount : 0;

  async function commitBatch() {
    if (!batchPlan) return;
    setBusy(true);
    try {
      await onCommitBatch(batchPlan);
      setBatchPlan(undefined);
    } finally {
      setBusy(false);
    }
  }

  async function commitDuplicateDecision() {
    if (!duplicatePreview) return;
    setBusy(true);
    try {
      await onDuplicateDecision(duplicatePreview);
      setDuplicatePreview(undefined);
    } finally {
      setBusy(false);
    }
  }

  async function commitImport() {
    if (!importPlan) return;
    setBusy(true);
    try {
      await onCommitImportPlan(importPlan);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="governance-workbench" data-testid="governance-workbench">
      <header className="governance-workbench__header">
        <span className="eyebrow">P20 个人数据治理</span>
        <h2>{progressCount > 0 ? `${progressCount} 个治理问题` : "暂无待治理问题"}</h2>
        <p>所有批处理、合并和导入都会先生成预览；确认前不会写入本地数据。</p>
      </header>

      <div className="governance-tabs" aria-label="治理分组">
        {issueGroups.map((group) => (
          <button key={group.kind} type="button" className={group.kind === selectedKind ? "is-active" : ""} onClick={() => setSelectedKind(group.kind)} data-testid="governance-group-tab">
            {group.title}<span>{group.issues.length}</span>
          </button>
        ))}
        <button type="button" onClick={onOpenImport} data-testid="governance-open-import"><Upload size={14} /> 导入预览</button>
        <button type="button" onClick={() => downloadGovernanceReport(report)} data-testid="governance-report-export"><Download size={14} /> 导出治理报告</button>
      </div>

      {activeGroup ? (
        <div className="governance-queue" data-testid="governance-queue">
          <div className="governance-queue__toolbar">
            <strong>{activeGroup.title}</strong>
            <BatchButton action="add-to-queue" issues={activeGroup.issues} onPlan={setBatchPlan} label="加入处理队列" />
            <BatchButton action="mark-skipped" issues={activeGroup.issues} onPlan={setBatchPlan} label="标记暂时跳过" />
            <BatchButton action="apply-tag" issues={activeGroup.issues} onPlan={setBatchPlan} label="应用治理标签" />
            <BatchButton action="mark-reviewed" issues={activeGroup.issues} onPlan={setBatchPlan} label="标记已复核" />
          </div>
          {activeGroup.issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} duplicates={duplicates} onFocusPlace={onFocusPlace} onPreviewDecision={setDuplicatePreview} />
          ))}
        </div>
      ) : (
        <div className="governance-empty" data-testid="governance-empty"><Inbox size={18} /> 暂无治理问题</div>
      )}

      {batchPlan ? (
        <section className="governance-preview" data-testid="governance-batch-preview">
          <h3>{batchPlan.title}</h3>
          <p>{batchPlan.summary}</p>
          <p>风险：{batchPlan.risk === "high" ? "高，需要单项处理" : "低，可确认写入"}</p>
          <p data-testid="governance-write-summary">确认后只写入维护标签和治理历史；取消会保持个人地点、图层、照片和 snapshots 不变。</p>
          <div className="dialog-actions">
            <button type="button" className="ghost-button" onClick={() => setBatchPlan(undefined)}>取消，无写入</button>
            <button type="button" className="primary-button" onClick={() => void commitBatch()} disabled={!batchPlan.canCommit || busy}>确认写入</button>
          </div>
        </section>
      ) : null}

      {duplicatePreview ? (
        <section className="governance-preview" data-testid={duplicatePreview.decision === "merge" ? "duplicate-merge-preview" : "duplicate-decision-preview"}>
          <h3>{duplicatePreview.title}</h3>
          <p>{duplicatePreview.summary}</p>
          {duplicatePreview.retained ? <p>保留：{duplicatePreview.retained.name}</p> : null}
          {duplicatePreview.removed ? <p>{duplicatePreview.decision === "merge" ? "移除" : "另一条"}：{duplicatePreview.removed.name}</p> : null}
          {duplicatePreview.merged ? <p>合并后标签：{duplicatePreview.merged.tags.join("、")}</p> : null}
          {duplicatePreview.merged ? <p>照片：{duplicatePreview.merged.photoIds.length} 张；评分：{duplicatePreview.merged.rating}</p> : null}
          <p data-testid="governance-write-summary">
            {duplicatePreview.decision === "merge"
              ? "确认后会保留一条合并记录、移除重复记录并写入维护历史；取消不会修改任何地点。"
              : "确认后只记录处理决策，不会删除地点或改坐标；取消不会写入。"}
          </p>
          <div className="dialog-actions">
            <button type="button" className="ghost-button" onClick={() => setDuplicatePreview(undefined)}>取消，无写入</button>
            <button type="button" className="primary-button" onClick={() => void commitDuplicateDecision()} disabled={busy}>{duplicatePreview.decision === "merge" ? "确认合并" : "确认决策"}</button>
          </div>
        </section>
      ) : null}

      {importPlan ? (
        <section className="governance-preview" data-testid="import-conflict-preview">
          <h3>导入冲突预览：{importPlan.title}</h3>
          <p>新增 {importPlan.counts.create}，更新 {importPlan.counts.update}，重复 {importPlan.counts.duplicate}，风险 {importPlan.counts.risk}</p>
          <p data-testid="import-write-summary">
            当前策略将写入 {writableImportCount} 项，跳过 {skippedImportCount} 项；确认前不会写入个人图钉，取消会保持 IndexedDB 不变。
          </p>
          <div className="governance-import-items">
            {importPlan.items.slice(0, 8).map((item) => (
              <label key={`${item.decision}-${item.imported.id}`}>
                <span>{item.imported.name}：{item.reason}</span>
                <select
                  aria-label={`${item.imported.name} 导入策略`}
                  value={item.strategy}
                  onChange={(event) => onImportPlanChange(setImportConflictStrategy(importPlan, item.imported.id, event.target.value as ImportConflictStrategy))}
                >
                  <option value="create" disabled={item.decision !== "create"}>创建</option>
                  <option value="update" disabled={!item.existing}>更新</option>
                  <option value="skip">跳过</option>
                </select>
              </label>
            ))}
          </div>
          <div className="dialog-actions">
            <button type="button" className="ghost-button" onClick={onCancelImportPlan}>取消导入，无写入</button>
            <button type="button" className="ghost-button" onClick={onOpenImport}>重新选择文件</button>
            <button type="button" className="primary-button" onClick={() => void commitImport()} disabled={busy}>确认导入可写项</button>
          </div>
        </section>
      ) : null}

      <section className="governance-history-summary" data-testid="governance-history-summary">
        <h3><History size={16} /> 最近维护历史</h3>
        {journal.length > 0 ? journal.slice(0, 5).map((entry) => (
          <article key={entry.id}>
            <strong>{entry.summary}</strong>
            <span>{entry.createdAt.slice(0, 10)}</span>
            <p>{entry.detail}</p>
          </article>
        )) : <p>暂无维护历史。</p>}
      </section>
    </section>
  );
}

function BatchButton({ action, issues, onPlan, label }: { action: GovernanceActionKind; issues: GovernanceIssue[]; onPlan: (plan: GovernanceBatchPlan) => void; label: string }) {
  return (
    <button type="button" className="ghost-button" onClick={() => onPlan(planGovernanceBatchAction(action, issues))} disabled={issues.length === 0} data-testid="governance-batch-action">
      {label}
    </button>
  );
}

function IssueCard({
  issue,
  duplicates,
  onFocusPlace,
  onPreviewDecision
}: {
  issue: GovernanceIssue;
  duplicates: DuplicateSuggestion[];
  onFocusPlace: (placeId: string) => void;
  onPreviewDecision: (preview: DuplicateDecisionPreview) => void;
}) {
  const duplicate = issue.kind === "duplicate" ? duplicates.find((item) => item.id === issue.id) : undefined;
  return (
    <article className={`governance-issue is-${issue.severity}`} data-testid="governance-issue">
      <div>
        {issue.severity === "danger" ? <AlertTriangle size={16} /> : issue.kind === "duplicate" ? <GitMerge size={16} /> : <CheckCircle2 size={16} />}
        <strong>{issue.title}</strong>
      </div>
      <p>{issue.reason}</p>
      <div className="dialog-actions">
        {issue.placeIds.slice(0, 2).map((placeId) => (
          <button key={placeId} type="button" className="ghost-button" onClick={() => onFocusPlace(placeId)}>查看地点</button>
        ))}
        {duplicate ? (
          <>
            <DuplicateDecisionButton duplicate={duplicate} decision="ignore" onPreview={onPreviewDecision} label="忽略建议" />
            <DuplicateDecisionButton duplicate={duplicate} decision="keep" onPreview={onPreviewDecision} label="保留两条" />
            <DuplicateDecisionButton duplicate={duplicate} decision="merge" onPreview={onPreviewDecision} label="比较并预览合并" />
          </>
        ) : null}
      </div>
    </article>
  );
}

function DuplicateDecisionButton({ duplicate, decision, onPreview, label }: { duplicate: DuplicateSuggestion; decision: DuplicateDecisionKind; onPreview: (preview: DuplicateDecisionPreview) => void; label: string }) {
  return (
    <button type="button" className={decision === "merge" ? "primary-button" : "ghost-button"} onClick={() => onPreview(previewDuplicateDecision(duplicate, decision))} data-testid={`duplicate-${decision}-button`}>
      {label}
    </button>
  );
}
