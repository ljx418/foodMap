import type { AmapScanlistRecommendation } from "./types";
import { evaluateRecommendation, getRecommendationVerification, normalizePlaceName } from "./verification";

export type RefreshMode = "dry-run" | "apply";
export type RefreshDiffStatus = "unchanged" | "new" | "removed" | "renamed" | "moved" | "conflict" | "pending";

export interface RefreshAuditRow {
  sourceId: string;
  poiId: string;
  rank: number;
  name: string;
  normalizedName: string;
  duplicateGroupId: string;
  baselineStatus: "baseline" | "refreshed-only" | "missing-from-refresh";
  diffStatus: RefreshDiffStatus;
  sourceGroups: string[];
  coordinateTrust: string;
  locationAccuracy: string;
  baselineCoordinate?: { longitude: number; latitude: number };
  refreshedCoordinate?: { longitude: number; latitude: number };
  distanceMeters?: number;
  admissionDecision: "accepted" | "blocked" | "manual-review" | "kept-baseline";
  mapDataChanged: boolean;
  risk: string;
}

export function distanceMeters(
  a: { longitude: number; latitude: number },
  b: { longitude: number; latitude: number }
): number {
  const radius = 6371000;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const deltaLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const deltaLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return Math.round(radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

export function classifyRefreshDiff(
  baseline: AmapScanlistRecommendation | undefined,
  refreshed: AmapScanlistRecommendation | undefined,
  mode: RefreshMode = "dry-run"
): RefreshAuditRow {
  const candidate = refreshed ?? baseline;
  if (!candidate) throw new Error("baseline or refreshed recommendation is required");

  const verification = getRecommendationVerification(candidate);
  const sourceGroups = Array.from(new Set(verification.evidence.map((item) => item.independentSourceGroup)));
  const normalizedName = normalizePlaceName(candidate.name);
  const baselineCoordinate = toCoordinate(baseline);
  const refreshedCoordinate = toCoordinate(refreshed);
  const distance = baselineCoordinate && refreshedCoordinate ? distanceMeters(baselineCoordinate, refreshedCoordinate) : undefined;
  const decision = refreshed ? evaluateRecommendation(refreshed) : undefined;
  const nameChanged = Boolean(baseline && refreshed && normalizePlaceName(baseline.name) !== normalizePlaceName(refreshed.name));
  const branchChanged = Boolean(baseline && refreshed && baseline.name !== refreshed.name && !nameChanged);
  const hasConflict = Boolean(
    refreshed &&
      (refreshed.verification.status === "conflict" ||
        refreshed.verification.warnings.some((warning) => /冲突|不一致|超出|不属于|错/.test(warning)))
  );

  let diffStatus: RefreshDiffStatus = "unchanged";
  if (!baseline && refreshed) diffStatus = "new";
  else if (baseline && !refreshed) diffStatus = "removed";
  else if (!decision?.mappable || refreshed?.verification.status === "unverified" || refreshed?.verification.status === "single_source") diffStatus = "pending";
  else if (hasConflict) diffStatus = "conflict";
  else if (typeof distance === "number" && distance > 800) diffStatus = "moved";
  else if (nameChanged || branchChanged || (typeof distance === "number" && distance > 300)) diffStatus = "renamed";

  if (hasConflict) diffStatus = "conflict";

  const accepted = Boolean(refreshed && decision?.mappable && !["removed", "moved", "conflict", "pending"].includes(diffStatus));
  const mapDataChanged = mode === "apply" && accepted && diffStatus !== "unchanged";
  const admissionDecision: RefreshAuditRow["admissionDecision"] =
    diffStatus === "removed"
      ? "kept-baseline"
      : diffStatus === "moved" || diffStatus === "conflict"
        ? "manual-review"
        : accepted
          ? "accepted"
          : "blocked";

  return {
    sourceId: candidate.sourceId,
    poiId: candidate.poiId,
    rank: candidate.rank,
    name: candidate.name,
    normalizedName,
    duplicateGroupId: verification.duplicateGroupId,
    baselineStatus: baseline && refreshed ? "baseline" : refreshed ? "refreshed-only" : "missing-from-refresh",
    diffStatus,
    sourceGroups,
    coordinateTrust: verification.coordinateTrust,
    locationAccuracy: candidate.locationAccuracy,
    baselineCoordinate,
    refreshedCoordinate,
    distanceMeters: distance,
    admissionDecision,
    mapDataChanged,
    risk: buildRisk(diffStatus, decision?.warnings ?? verification.warnings)
  };
}

function toCoordinate(item?: AmapScanlistRecommendation): { longitude: number; latitude: number } | undefined {
  if (typeof item?.longitude !== "number" || typeof item.latitude !== "number") return undefined;
  return { longitude: item.longitude, latitude: item.latitude };
}

function buildRisk(status: RefreshDiffStatus, warnings: string[]): string {
  if (status === "unchanged") return "无变化";
  if (status === "new") return "新增候选，需确认准入后上图";
  if (status === "removed") return "刷新源缺失，保留基线等待人工复核";
  if (status === "renamed") return "名称、分店或轻微坐标变化，需要报告记录";
  if (status === "moved") return "坐标迁移超过阈值，禁止自动覆盖";
  if (status === "conflict") return warnings.join("；") || "来源、地址或坐标存在冲突";
  return warnings.join("；") || "证据不足，禁止上图";
}
