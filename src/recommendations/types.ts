import type { CoordinateSystem } from "../domain/types";

export type RecommendationSource = "amap-scanlist";
export type RecommendationLocationAccuracy = "exact" | "approximate";
export type RecommendationVerificationStatus = "unverified" | "single_source" | "verified" | "multi_source_verified" | "conflict";
export type RecommendationCoordinateTrust = "none" | "low" | "medium" | "high";

export interface RecommendationCoordinateEvidence {
  longitude: number;
  latitude: number;
  coordinateSystem?: CoordinateSystem;
  accuracy?: RecommendationLocationAccuracy;
}

export interface RecommendationSourceEvidence {
  source: "amap-ranking" | "amap-poi" | "web-search" | "manual-review";
  url?: string;
  observedName: string;
  observedDistrict?: string;
  observedAddress?: string;
  observedCoordinate?: RecommendationCoordinateEvidence;
  observedAt: string;
  independentSourceGroup: "amap" | "open-web" | "manual";
}

export interface RecommendationVerification {
  canonicalKey: string;
  duplicateGroupId: string;
  status: RecommendationVerificationStatus;
  confidence: number;
  coordinateTrust: RecommendationCoordinateTrust;
  evidence: RecommendationSourceEvidence[];
  warnings: string[];
}

export interface AmapRankingEvidence {
  source: "amap-ranking";
  url: string;
  poiId: string;
  rank: number;
  name: string;
  score: number;
  tags: string[];
  summary?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMatched?: boolean;
  observedAt: string;
}

export interface AmapImageEvidence {
  source: "amap-ranking-image";
  url: string;
  imageUrl: string;
  imageAlt: string;
  observedName: string;
  matched: boolean;
  observedAt: string;
  evidenceStatus?: "verified" | "missing" | "broken" | "mismatch" | "stale";
}

export interface AmapPoiEvidence {
  source: "amap-poi-detail";
  poiId: string;
  name: string;
  city?: string;
  district?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  coordinateSystem?: CoordinateSystem;
  rawStatus?: string;
  rawInfo?: string;
  observedAt: string;
}

export interface AmapScanlistRecommendation {
  source: RecommendationSource;
  sourceId: string;
  poiId: string;
  name: string;
  score: number;
  rank: number;
  district: string;
  address: string;
  longitude?: number;
  latitude?: number;
  coordinateSystem?: CoordinateSystem;
  locationAccuracy: RecommendationLocationAccuracy;
  tags: string[];
  summaryReview: string;
  publicReviewSnippets: string[];
  coverImageUrl?: string;
  coverImageAlt?: string;
  imageEvidence?: AmapImageEvidence;
  sourceUrl: string;
  crawledAt: string;
  rankingEvidence: AmapRankingEvidence;
  poiEvidence?: AmapPoiEvidence;
  verification: RecommendationVerification;
}
