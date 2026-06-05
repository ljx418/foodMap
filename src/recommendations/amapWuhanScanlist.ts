import { AMAP_WUHAN_SCANLIST as GENERATED_AMAP_WUHAN_SCANLIST } from "./amapWuhanScanlist.generated";
import { MANUAL_VERIFIED_AMAP_PINS } from "./manualVerifiedPins";
import { canonicalPlaceKey, normalizePlaceName } from "./verification";
import type { AmapScanlistRecommendation } from "./types";

export const AMAP_WUHAN_SCANLIST: AmapScanlistRecommendation[] = GENERATED_AMAP_WUHAN_SCANLIST.map((recommendation) => {
  const verifiedPin = MANUAL_VERIFIED_AMAP_PINS[recommendation.poiId];
  if (!verifiedPin) return recommendation;

  const rankingEvidence = {
    source: "amap-ranking" as const,
    url: recommendation.rankingEvidence.url,
    observedName: recommendation.name,
    observedAt: recommendation.rankingEvidence.observedAt,
    independentSourceGroup: "amap" as const
  };

  const coordinateEvidence = {
    source: verifiedPin.accuracy === "approximate" ? "manual-review" as const : "web-search" as const,
    url: verifiedPin.evidenceUrl,
    observedName: verifiedPin.evidenceName,
    observedDistrict: verifiedPin.district,
    observedAddress: verifiedPin.address,
    observedCoordinate: {
      longitude: verifiedPin.longitude,
      latitude: verifiedPin.latitude,
      accuracy: verifiedPin.accuracy ?? "exact"
    },
    observedAt: verifiedPin.observedAt,
    independentSourceGroup: verifiedPin.accuracy === "approximate" ? "manual" as const : "open-web" as const
  };

  return {
    ...recommendation,
    district: verifiedPin.district,
    address: verifiedPin.address,
    longitude: verifiedPin.longitude,
    latitude: verifiedPin.latitude,
    locationAccuracy: verifiedPin.accuracy ?? "exact",
    poiEvidence: {
      source: "amap-poi-detail",
      poiId: recommendation.poiId,
      name: recommendation.name,
      city: "武汉",
      district: verifiedPin.district,
      address: verifiedPin.address,
      longitude: verifiedPin.longitude,
      latitude: verifiedPin.latitude,
      rawStatus: verifiedPin.accuracy === "approximate" ? "manual-ranking-derived" : "manual-web-verified",
      rawInfo: `Coordinates verified from ${verifiedPin.evidenceUrl}`,
      observedAt: verifiedPin.observedAt
    },
    verification: {
      canonicalKey: canonicalPlaceKey(recommendation.name, verifiedPin.district, verifiedPin.address),
      duplicateGroupId: `verified:${normalizePlaceName(recommendation.name)}:${verifiedPin.district}`,
      status: "verified",
      confidence: verifiedPin.confidence ?? 0.88,
      coordinateTrust: verifiedPin.coordinateTrust ?? "high",
      evidence: [rankingEvidence, coordinateEvidence],
      warnings: verifiedPin.warnings ?? []
    }
  };
});
