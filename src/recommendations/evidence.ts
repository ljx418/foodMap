import type { AmapImageEvidence, AmapScanlistRecommendation } from "./types";

export type ImageEvidenceStatus = "verified" | "missing" | "broken" | "mismatch" | "stale";

export interface ImageEvidenceView {
  status: ImageEvidenceStatus;
  sourceUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  observedName?: string;
  observedAt?: string;
  label: string;
  verified: boolean;
}

export function getImageEvidenceView(recommendation: AmapScanlistRecommendation): ImageEvidenceView {
  const evidence = recommendation.imageEvidence;
  if (!evidence) {
    return {
      status: "missing",
      label: "暂无可核验公开图片，详情不会将图片证据标记为已核验。",
      verified: false
    };
  }

  const status = normalizeEvidenceStatus(evidence);
  return {
    status,
    sourceUrl: evidence.url,
    imageUrl: evidence.imageUrl,
    imageAlt: evidence.imageAlt,
    observedName: evidence.observedName,
    observedAt: evidence.observedAt,
    label: evidenceLabel(status),
    verified: status === "verified"
  };
}

function normalizeEvidenceStatus(evidence: AmapImageEvidence): ImageEvidenceStatus {
  if (evidence.evidenceStatus) return evidence.evidenceStatus;
  if (!evidence.imageUrl) return "missing";
  if (!evidence.matched) return "mismatch";
  return "verified";
}

function evidenceLabel(status: ImageEvidenceStatus): string {
  if (status === "verified") return "公开图片与门店名称匹配";
  if (status === "broken") return "公开图片加载失败，不能作为已核验证据";
  if (status === "mismatch") return "公开图片与门店名称不匹配，不能作为已核验证据";
  if (status === "stale") return "公开图片证据可能过期，需刷新或人工复核";
  return "暂无可核验公开图片";
}
