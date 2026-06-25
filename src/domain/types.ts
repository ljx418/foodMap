export type FoodRating = number;

export type FoodLayerIcon = "pin" | "star" | "bowl" | "coffee" | "heart";

export type VisitStatusTag = "eaten" | "want" | "revisit" | "avoid";

export type CoordinateSystem = "wgs84" | "gcj02";

export interface FoodTagGroups {
  visitStatus?: VisitStatusTag;
  review: string[];
  cuisine: string[];
  custom: string[];
}

export interface FoodPlace {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  coordinateSystem?: CoordinateSystem;
  address?: string;
  city?: string;
  layerId: string;
  tags: string[];
  rating: FoodRating;
  visitedAt: string;
  notes: string;
  photoIds: string[];
  tagGroups?: FoodTagGroups;
  createdAt: string;
  updatedAt: string;
  mapLabel?: string;
  mapAccuracy?: "exact" | "approximate";
}

export interface MapViewportBounds {
  west: number;
  south: number;
  east: number;
  north: number;
  coordinateSystem?: CoordinateSystem;
}

export interface FoodLayer {
  id: string;
  name: string;
  color: string;
  icon: FoodLayerIcon;
  visible: boolean;
  sortOrder: number;
}

export interface PhotoAsset {
  id: string;
  placeId: string;
  fileName: string;
  mimeType: string;
  blob: Blob;
  thumbnailDataUrl: string;
  createdAt: string;
}

export interface SnapshotPhoto {
  id: string;
  placeId: string;
  fileName: string;
  mimeType: string;
  thumbnailDataUrl: string;
  createdAt: string;
}

export interface ShareSnapshot {
  id: string;
  title: string;
  places: FoodPlace[];
  layers: FoodLayer[];
  photos: SnapshotPhoto[];
  exportedAt: string;
}

export interface SnapshotPortabilitySummary {
  snapshotId: string;
  title: string;
  exportedAt: string;
  placeCount: number;
  layerCount: number;
  thumbnailCount: number;
  readonly: true;
}

export interface FoodMapPackageValidationResult {
  ok: boolean;
  schemaVersion?: number;
  snapshotId?: string;
  errors: string[];
  summary?: SnapshotPortabilitySummary;
}

export type GovernanceJournalAction =
  | "batch-tag"
  | "batch-queued"
  | "batch-skipped"
  | "batch-reviewed"
  | "duplicate-ignored"
  | "duplicate-kept"
  | "duplicate-merged"
  | "import-created"
  | "import-updated"
  | "import-skipped"
  | "candidate-confirmed"
  | "manual-pin-moved";

export interface GovernanceJournalEntry {
  id: string;
  placeIds: string[];
  action: GovernanceJournalAction;
  summary: string;
  detail: string;
  createdAt: string;
  actor: "user" | "system";
}

export interface FoodFilterState {
  keyword: string;
  city?: string;
  layerIds: string[];
  tags: string[];
  visitStatuses?: VisitStatusTag[];
  reviewTags?: string[];
  cuisineTags?: string[];
  minRating?: FoodRating;
  visitedFrom?: string;
  visitedTo?: string;
  source?: "all" | "personal" | "recommendation";
  district?: string;
  verificationStatus?: "all" | "verified" | "approximate" | "conflict" | "pending";
  distanceCenter?: { longitude: number; latitude: number };
  distanceKm?: number;
}

export interface FoodMapExportFile {
  schema: "foodmap.share";
  version: 1;
  exportedAt: string;
  snapshot: ShareSnapshot;
}

export const DEFAULT_CENTER = {
  longitude: 114.3055,
  latitude: 30.5928
};
