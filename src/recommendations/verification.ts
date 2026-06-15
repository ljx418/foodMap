import type {
  AmapScanlistRecommendation,
  RecommendationCoordinateTrust,
  RecommendationVerification,
  RecommendationVerificationStatus
} from "./types";

const BRANCH_PATTERN = /[（(][^）)]*(店|总店|分店|旗舰店|馆|路|街|城|广场|中心|商圈)[^）)]*[）)]/g;
const GENERIC_WORD_PATTERN = /(武汉市|餐厅|饭店|酒楼|小吃|特色|品质|国际|美食|百汇|世家|老店|总店|分店|店)/g;

export interface VerificationDecision {
  status: RecommendationVerificationStatus;
  confidence: number;
  coordinateTrust: RecommendationCoordinateTrust;
  warnings: string[];
  mappable: boolean;
}

export function normalizePlaceName(name: string): string {
  return name
    .replace(BRANCH_PATTERN, "")
    .replace(GENERIC_WORD_PATTERN, "")
    .replace(/[·・\-_\s]/g, "")
    .trim()
    .toLowerCase();
}

export function normalizeBranchName(name: string): string {
  return name
    .replace(/[·・\-_\s]/g, "")
    .replace(/[（）()]/g, "")
    .trim()
    .toLowerCase();
}

export function canonicalPlaceKey(name: string, district?: string, address?: string): string {
  const baseName = normalizePlaceName(name);
  const branchName = normalizeBranchName(name);
  const locationToken = [district, address]
    .filter(Boolean)
    .join("")
    .replace(/(武汉市|湖北省|附近|片区|商圈)/g, "")
    .replace(/[^\u4e00-\u9fa5a-z0-9]/gi, "")
    .slice(0, 12);
  return [baseName || branchName, locationToken].filter(Boolean).join("@");
}

export function getRecommendationVerification(recommendation: AmapScanlistRecommendation): RecommendationVerification {
  return recommendation.verification ?? {
    canonicalKey: canonicalPlaceKey(recommendation.name, recommendation.district, recommendation.address),
    duplicateGroupId: `pending:${normalizePlaceName(recommendation.name)}`,
    status: "unverified",
    confidence: 0.2,
    coordinateTrust: "low",
    evidence: [],
    warnings: ["缺少多信源核验元数据，不能作为确定图钉上图。"]
  };
}

export function evaluateRecommendation(recommendation: AmapScanlistRecommendation): VerificationDecision {
  const verification = getRecommendationVerification(recommendation);
  const sourceGroups = new Set(verification.evidence.map((item) => item.independentSourceGroup));
  const hasIndependentSources = sourceGroups.size >= 1;
  const hasCoordinateEvidence = verification.evidence.some((item) => item.observedCoordinate);
  const isVerified = verification.status === "verified" || verification.status === "multi_source_verified";
  const hasConflict = verification.status === "conflict" || verification.warnings.some((item) => /冲突|不一致|错/.test(item));
  const mappable = (
    isVerified &&
    verification.confidence >= 0.78 &&
    hasIndependentSources &&
    hasCoordinateEvidence &&
    verification.coordinateTrust !== "none" &&
    verification.coordinateTrust !== "low" &&
    !hasConflict
  );

  return {
    status: verification.status,
    confidence: verification.confidence,
    coordinateTrust: verification.coordinateTrust,
    warnings: verification.warnings,
    mappable
  };
}

export function getMappableRecommendations(recommendations: AmapScanlistRecommendation[]): AmapScanlistRecommendation[] {
  return recommendations.filter((item) => evaluateRecommendation(item).mappable);
}

export function getPinCandidateRecommendations(recommendations: AmapScanlistRecommendation[]): AmapScanlistRecommendation[] {
  return getMappableRecommendations(recommendations);
}

export function findSemanticDuplicateGroups(recommendations: AmapScanlistRecommendation[]): Map<string, AmapScanlistRecommendation[]> {
  const groups = new Map<string, AmapScanlistRecommendation[]>();
  for (const recommendation of recommendations) {
    const verification = getRecommendationVerification(recommendation);
    const key = verification.duplicateGroupId || `pending:${normalizePlaceName(recommendation.name)}`;
    groups.set(key, [...(groups.get(key) ?? []), recommendation]);
  }
  return new Map(Array.from(groups.entries()).filter(([, items]) => items.length > 1));
}
