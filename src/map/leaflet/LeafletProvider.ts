import L, { type DivIcon, type LeafletMouseEvent, type Map as LeafletMap, type Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { gcj02ToWgs84, toGcj02Point, toMapDisplayPoint } from "../../domain/coordinates";
import type { FoodPlace, MapViewportBounds } from "../../domain/types";
import { DINGTUYI_SHARE_LAYER_ID } from "../../externalShares/dingtuyiWuhanFoodShare";
import { PERSONAL_FAVORITE_LAYER_ID } from "../../personalFavorites/wuhanPersonalFavorites";
import type { MapInitializeOptions, MapProviderAdapter, MapSearchResult } from "../MapProviderAdapter";

interface MarkerRecord {
  marker: Marker;
  place: FoodPlace;
  iconKey: string;
  positionKey: string;
  popupKey: string;
}

export class LeafletProvider implements MapProviderAdapter {
  name = "leaflet";
  private map?: LeafletMap;
  private places: FoodPlace[] = [];
  private markers = new Map<string, MarkerRecord>();
  private fallbackOverlay?: L.ImageOverlay;
  private placeClick?: (placeId: string) => void;
  private mapClick?: (point: { longitude: number; latitude: number }) => void;
  private placeMove?: (placeId: string, point: { longitude: number; latitude: number }) => void;
  private viewportChange?: (bounds: MapViewportBounds) => void;
  private hiddenLayers = new Set<string>();
  private draggablePlaceIds = new Set<string>();
  private readonly = false;
  private center = { longitude: 114.3055, latitude: 30.5928 };
  private iconUpdateFrame?: number;
  private zoomEndFrame?: number;
  private container?: HTMLElement;
  private zoomStartLevel = 12;
  private lastIconModeKey = "";
  private selectedPlaceId?: string;

  async initialize(container: HTMLElement, options: MapInitializeOptions): Promise<void> {
    this.readonly = Boolean(options.readonly);
    this.center = options.center;
    this.container = container;
    container.classList.add("leaflet-map");

    const displayCenter = toGcj02Point(options.center, "wgs84");
    this.map = L.map(container, {
      center: [displayCenter.latitude, displayCenter.longitude],
      zoom: options.zoom,
      zoomControl: true,
      attributionControl: true
    });

    this.map.createPane("wuhanFallbackPane");
    const fallbackPane = this.map.getPane("wuhanFallbackPane");
    if (fallbackPane) {
      fallbackPane.style.zIndex = "245";
      fallbackPane.style.pointerEvents = "none";
    }

    this.fallbackOverlay = L.imageOverlay(createWuhanFallbackMapUrl(), [
      [30.34, 113.88],
      [30.86, 114.72]
    ], {
      interactive: false,
      opacity: 1,
      className: "wuhan-fallback-overlay",
      pane: "wuhanFallbackPane"
    }).addTo(this.map);

    const tileLayer = L.tileLayer("https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", {
      subdomains: ["1", "2", "3", "4"],
      maxZoom: 19,
      attribution: "高德地图"
    });
    tileLayer.once("load", () => {
      this.fallbackOverlay?.remove();
      this.fallbackOverlay = undefined;
    });
    tileLayer.addTo(this.map);

    this.map.on("click", this.handleMapClick);
    this.map.on("zoomstart", this.handleZoomStart);
    this.map.on("zoom", this.handleZoom);
    this.map.on("zoomend", this.handleZoomEnd);
    this.map.on("zoomend moveend resize", this.handleViewportChanged);
    this.syncMarkers();
    window.setTimeout(() => {
      this.map?.invalidateSize();
      this.emitViewportBounds();
    }, 0);
    this.emitViewportBounds();
  }

  destroy(): void {
    this.map?.off("click", this.handleMapClick);
    this.map?.off("zoomstart", this.handleZoomStart);
    this.map?.off("zoom", this.handleZoom);
    this.map?.off("zoomend", this.handleZoomEnd);
    this.map?.off("zoomend moveend resize", this.handleViewportChanged);
    if (this.iconUpdateFrame !== undefined) {
      window.cancelAnimationFrame(this.iconUpdateFrame);
      this.iconUpdateFrame = undefined;
    }
    if (this.zoomEndFrame !== undefined) {
      window.cancelAnimationFrame(this.zoomEndFrame);
      this.zoomEndFrame = undefined;
    }
    this.map?.remove();
    this.map = undefined;
    this.container?.classList.remove("is-zooming", "is-zooming-out");
    this.container = undefined;
    this.markers.clear();
  }

  setPlaces(places: FoodPlace[]): void {
    this.places = places;
    this.syncMarkers();
  }

  setSelectedPlace(placeId?: string): void {
    this.selectedPlaceId = placeId;
    this.markers.forEach((record, markerPlaceId) => {
      const element = record.marker.getElement();
      if (!element) return;
      element.classList.toggle("is-selected", markerPlaceId === placeId);
    });
  }

  setDraggablePlaces(placeIds: string[]): void {
    this.draggablePlaceIds = new Set(placeIds);
    this.markers.forEach((record) => this.applyMarkerDragState(record));
  }

  resize(): void {
    window.requestAnimationFrame(() => {
      this.map?.invalidateSize({ pan: false });
    });
  }

  focusPlace(placeId: string): void {
    const record = this.markers.get(placeId);
    if (!record || !this.map) return;
    this.setSelectedPlace(placeId);
    this.map.flyTo(record.marker.getLatLng(), Math.max(this.map.getZoom(), 15), { duration: 0.45 });
    this.map.closePopup();
  }

  setLayerVisibility(layerId: string, visible: boolean): void {
    if (visible) this.hiddenLayers.delete(layerId);
    else this.hiddenLayers.add(layerId);
    this.syncMarkers();
  }

  async searchPlaces(keyword: string): Promise<MapSearchResult[]> {
    const query = keyword.trim();
    if (!query) return [];
    return [
      {
        id: `wuhan-${query}`,
        name: query,
        longitude: this.center.longitude,
        latitude: this.center.latitude,
        address: "武汉市，可在保存前调整精确位置",
        city: "武汉",
        provider: this.name,
        coordinateSystem: "wgs84"
      }
    ];
  }

  async locateByCoordinates(longitude: number, latitude: number): Promise<MapSearchResult> {
    return {
      id: `coord-${longitude}-${latitude}`,
      name: "地图选点",
      longitude,
      latitude,
      address: `武汉附近 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      city: "武汉",
      provider: this.name,
      coordinateSystem: "wgs84"
    };
  }

  onPlaceClick(callback: (placeId: string) => void): void {
    this.placeClick = callback;
  }

  onMapClick(callback: (point: { longitude: number; latitude: number }) => void): void {
    this.mapClick = callback;
  }

  onPlaceMove(callback: (placeId: string, point: { longitude: number; latitude: number }) => void): void {
    this.placeMove = callback;
  }

  onViewportChange(callback: (bounds: MapViewportBounds) => void): void {
    this.viewportChange = callback;
    this.emitViewportBounds();
  }

  private handleMapClick = (event: LeafletMouseEvent): void => {
    if (this.readonly) return;
    this.setSelectedPlace(undefined);
    const point = gcj02ToWgs84({ longitude: event.latlng.lng, latitude: event.latlng.lat });
    this.mapClick?.({
      longitude: Number(point.longitude.toFixed(6)),
      latitude: Number(point.latitude.toFixed(6))
    });
  };

  private handleZoomStart = (): void => {
    this.zoomStartLevel = this.map?.getZoom() ?? this.zoomStartLevel;
    this.container?.classList.add("is-zooming");
    this.container?.classList.remove("is-zooming-out");
  };

  private handleZoom = (): void => {
    if (!this.map || !this.container) return;
    const isZoomingOut = this.map.getZoom() < this.zoomStartLevel - 0.02;
    this.container.classList.toggle("is-zooming-out", isZoomingOut);
  };

  private handleZoomEnd = (): void => {
    if (this.zoomEndFrame !== undefined) window.cancelAnimationFrame(this.zoomEndFrame);
    this.zoomEndFrame = window.requestAnimationFrame(() => {
      this.container?.classList.remove("is-zooming", "is-zooming-out");
      this.zoomEndFrame = undefined;
    });
    this.zoomStartLevel = this.map?.getZoom() ?? this.zoomStartLevel;
  };

  private syncMarkers = (): void => {
    if (!this.map) return;
    const visiblePlaces = this.places.filter((place) => !this.hiddenLayers.has(place.layerId));
    const visibleIds = new Set(visiblePlaces.map((place) => place.id));
    const iconModes = getMarkerIconModes(this.map, visiblePlaces);
    this.lastIconModeKey = createIconModeKey(iconModes);

    this.markers.forEach((record, placeId) => {
      if (!visibleIds.has(placeId)) {
        record.marker.remove();
        this.markers.delete(placeId);
      }
    });
    if (this.selectedPlaceId && !visibleIds.has(this.selectedPlaceId)) {
      this.selectedPlaceId = undefined;
    }

    visiblePlaces.forEach((place) => {
      const iconInfo = createMarkerIconInfo(place, iconModes);
      const displayPoint = toMapDisplayPoint(place);
      const positionKey = createPositionKey(place);
      const popupKey = createPopupKey(place);
      const existing = this.markers.get(place.id);
      if (existing) {
        existing.place = place;
        if (existing.positionKey !== positionKey) {
          existing.marker.setLatLng([displayPoint.latitude, displayPoint.longitude]);
          existing.positionKey = positionKey;
        }
        if (existing.popupKey !== popupKey) {
          existing.marker.setPopupContent(createPopupHtml(place));
          existing.popupKey = popupKey;
        }
        if (existing.iconKey !== iconInfo.key) {
          existing.marker.setIcon(iconInfo.icon);
          existing.iconKey = iconInfo.key;
        }
        this.applyMarkerSelectionState(existing, place.id);
        this.applyMarkerDragState(existing);
        return;
      }

      const marker = L.marker([displayPoint.latitude, displayPoint.longitude], {
        icon: iconInfo.icon,
        draggable: this.draggablePlaceIds.has(place.id) && !this.readonly
      })
        .addTo(this.map!)
        .bindPopup(createPopupHtml(place));
      marker.on("click", () => {
        this.setSelectedPlace(place.id);
        this.placeClick?.(place.id);
        this.map?.closePopup();
      });
      marker.on("dragend", () => {
        const latLng = marker.getLatLng();
        const point = gcj02ToWgs84({ longitude: latLng.lng, latitude: latLng.lat });
        this.placeMove?.(place.id, {
          longitude: Number(point.longitude.toFixed(6)),
          latitude: Number(point.latitude.toFixed(6))
        });
      });
      const record = { marker, place, iconKey: iconInfo.key, positionKey, popupKey };
      this.markers.set(place.id, record);
      this.applyMarkerSelectionState(record, place.id);
      this.applyMarkerDragState(record);
    });
  };

  private updateMarkerIcons = (): void => {
    if (!this.map) return;
    const visiblePlaces = this.places.filter((place) => !this.hiddenLayers.has(place.layerId));
    const iconModes = getMarkerIconModes(this.map, visiblePlaces);
    const iconModeKey = createIconModeKey(iconModes);
    if (iconModeKey === this.lastIconModeKey) return;
    this.lastIconModeKey = iconModeKey;

    this.markers.forEach((record) => {
      const iconInfo = createMarkerIconInfo(record.place, iconModes);
      if (record.iconKey === iconInfo.key) return;
      record.marker.setIcon(iconInfo.icon);
      record.iconKey = iconInfo.key;
      this.applyMarkerSelectionState(record, record.place.id);
    });
  };

  private scheduleMarkerIconUpdate = (): void => {
    if (this.iconUpdateFrame !== undefined) return;
    this.iconUpdateFrame = window.requestAnimationFrame(() => {
      this.iconUpdateFrame = undefined;
      this.updateMarkerIcons();
    });
  };

  private handleViewportChanged = (): void => {
    this.scheduleMarkerIconUpdate();
    this.emitViewportBounds();
  };

  private emitViewportBounds(): void {
    if (!this.map || !this.viewportChange) return;
    const bounds = this.map.getBounds();
    const southWest = gcj02ToWgs84({ longitude: bounds.getWest(), latitude: bounds.getSouth() });
    const northEast = gcj02ToWgs84({ longitude: bounds.getEast(), latitude: bounds.getNorth() });
    const west = Math.min(southWest.longitude, northEast.longitude);
    const east = Math.max(southWest.longitude, northEast.longitude);
    const south = Math.min(southWest.latitude, northEast.latitude);
    const north = Math.max(southWest.latitude, northEast.latitude);
    this.viewportChange({
      west: Number(west.toFixed(6)),
      south: Number(south.toFixed(6)),
      east: Number(east.toFixed(6)),
      north: Number(north.toFixed(6)),
      coordinateSystem: "wgs84"
    });
  }

  private applyMarkerSelectionState(record: MarkerRecord, placeId: string): void {
    const element = record.marker.getElement();
    if (!element) return;
    element.classList.toggle("is-selected", placeId === this.selectedPlaceId);
  }

  private applyMarkerDragState(record: MarkerRecord): void {
    const shouldDrag = this.draggablePlaceIds.has(record.place.id) && !this.readonly;
    if (!record.marker.dragging) return;
    if (shouldDrag) record.marker.dragging.enable();
    else record.marker.dragging.disable();
    const element = record.marker.getElement();
    element?.classList.toggle("is-draggable", shouldDrag);
  }
}

interface MarkerIconModes {
  recommendationPins: boolean;
  dingtuyiPins: boolean;
}

function createMarkerIconInfo(place: FoodPlace, iconModes: MarkerIconModes): { icon: DivIcon; key: string } {
  const isRecommendation = place.id.startsWith("recommendation:");
  if (isDingtuyiSharePlace(place)) {
    const mode = iconModes.dingtuyiPins ? "pin" : "dot";
    return {
      icon: createDingtuyiShareIcon(mode),
      key: `dingtuyi-share:${mode}`
    };
  }
  if (isPersonalFavoritePlace(place)) {
    return {
      icon: createPersonalFavoriteIcon(place, "pin"),
      key: `personal-favorite:${place.mapAccuracy ?? "exact"}:pin`
    };
  }
  if (!isRecommendation) {
    return { icon: createFoodIcon(place.rating), key: `food:${place.rating}` };
  }
  const mode = getRecommendationMarkerMode(place, iconModes.recommendationPins);
  return {
    icon: createRecommendationIcon(place, mode),
    key: `recommendation:${place.mapLabel ?? place.rating}:${place.mapAccuracy ?? "exact"}:${mode}`
  };
}

function createPopupHtml(place: FoodPlace): string {
  const accuracyLabel = isPendingCoordinatePlace(place) ? " · 待校准位置" : "";
  return `<div class="food-map-popup"><strong>${escapeHtml(place.name)}</strong><span>${escapeHtml(place.city || "武汉")} · ${place.rating} 星${accuracyLabel}</span></div>`;
}

function createPopupKey(place: FoodPlace): string {
  return [place.name, place.city ?? "", place.rating].join("|");
}

function createPositionKey(place: FoodPlace): string {
  const displayPoint = toMapDisplayPoint(place);
  return `${displayPoint.longitude.toFixed(6)},${displayPoint.latitude.toFixed(6)},${place.coordinateSystem ?? ""}`;
}

function createIconModeKey(iconModes: MarkerIconModes): string {
  return `${iconModes.recommendationPins ? "rec-pin" : "rec-dot"}:${iconModes.dingtuyiPins ? "dty-pin" : "dty-dot"}:fav-pin`;
}

function createFoodIcon(rating: number): DivIcon {
  return getCachedIcon(`food:${rating}`, () => L.divIcon({
    className: "food-leaflet-marker",
    html: `<span>${rating}</span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -38]
  }));
}

type PersonalFavoriteMarkerMode = "pin" | "dot";
type RecommendationMarkerMode = "rank-pin" | "adaptive-pin" | "dot";
type DingtuyiMarkerMode = "pin" | "dot";

function createPersonalFavoriteIcon(place: FoodPlace, mode: PersonalFavoriteMarkerMode): DivIcon {
  const accuracyClass = place.mapAccuracy === "approximate" ? " is-approximate" : " is-exact";
  const modeClass = mode === "dot" ? " is-dot" : " is-pin";
  const key = `personal-favorite:${accuracyClass}:${modeClass}`;
  return getCachedIcon(key, () => L.divIcon({
    className: `personal-favorite-leaflet-marker${accuracyClass}${modeClass}`,
    html: `<span aria-label="我的收藏"><i></i></span>`,
    iconSize: mode === "dot" ? [18, 18] : [34, 40],
    iconAnchor: mode === "dot" ? [9, 9] : [17, 38],
    popupAnchor: mode === "dot" ? [0, -10] : [0, -34]
  }));
}

function createRecommendationIcon(place: FoodPlace, mode: RecommendationMarkerMode): DivIcon {
  const label = escapeHtml(place.mapLabel ?? String(place.rating));
  const isPin = mode !== "dot";
  const prominenceClass = mode === "rank-pin" ? " is-primary-rank" : mode === "adaptive-pin" ? " is-secondary-rank is-adaptive-pin" : " is-secondary-rank";
  const accuracyClass = place.mapAccuracy === "approximate" ? " is-approximate" : " is-exact";
  const key = `recommendation:${label}:${accuracyClass}:${prominenceClass}:${isPin ? "pin" : "dot"}`;
  return getCachedIcon(key, () => L.divIcon({
    className: `recommendation-leaflet-marker${accuracyClass}${prominenceClass}`,
    html: isPin
      ? `<span aria-label="扫街榜第 ${label} 名"><strong>${label}</strong></span>`
      : `<span aria-label="扫街榜第 ${label} 名" title="扫街榜第 ${label} 名"></span>`,
    iconSize: isPin ? [34, 40] : [18, 22],
    iconAnchor: isPin ? [17, 38] : [9, 20],
    popupAnchor: isPin ? [0, -34] : [0, -18]
  }));
}

function createDingtuyiShareIcon(mode: DingtuyiMarkerMode): DivIcon {
  return getCachedIcon(`dingtuyi-share:${mode}`, () => L.divIcon({
    className: `dingtuyi-share-leaflet-marker is-${mode}`,
    html: `<span aria-label="钉图易分享地点"><i></i></span>`,
    iconSize: mode === "dot" ? [16, 16] : [30, 36],
    iconAnchor: mode === "dot" ? [8, 8] : [15, 34],
    popupAnchor: mode === "dot" ? [0, -10] : [0, -30]
  }));
}

const iconCache = new Map<string, DivIcon>();

function getCachedIcon(key: string, create: () => DivIcon): DivIcon {
  const cached = iconCache.get(key);
  if (cached) return cached;
  const icon = create();
  iconCache.set(key, icon);
  return icon;
}

function isPersonalFavoritePlace(place: FoodPlace): boolean {
  return place.layerId === PERSONAL_FAVORITE_LAYER_ID || place.id.startsWith("personal-favorite:");
}

function isDingtuyiSharePlace(place: FoodPlace): boolean {
  return place.layerId === DINGTUYI_SHARE_LAYER_ID || place.id.startsWith("dingtuyi-share:");
}

function isPendingCoordinatePlace(place: FoodPlace): boolean {
  return place.mapAccuracy === "approximate" || place.tags.includes("待校准") || place.tags.includes("近似坐标");
}

function getRecommendationMarkerMode(place: FoodPlace, shouldPromoteDenseDots: boolean): RecommendationMarkerMode {
  const rank = Number(place.mapLabel);
  if (Number.isFinite(rank) && rank <= 20) return "rank-pin";
  return shouldPromoteDenseDots ? "adaptive-pin" : "dot";
}

function getMarkerIconModes(map: LeafletMap, places: FoodPlace[]): MarkerIconModes {
  const adaptivePinThreshold = getAdaptivePinThreshold(map);
  const recommendationPlaces = places.filter((place) => place.id.startsWith("recommendation:"));
  const dingtuyiPlaces = places.filter(isDingtuyiSharePlace);
  const visibleRecommendationCount = getVisibleMapPlaceCount(map, recommendationPlaces);
  const visibleDingtuyiCount = getVisibleMapPlaceCount(map, dingtuyiPlaces);
  return {
    recommendationPins: visibleRecommendationCount <= adaptivePinThreshold,
    dingtuyiPins: map.getZoom() >= 15 || visibleDingtuyiCount <= Math.max(8, Math.floor(adaptivePinThreshold * 0.75))
  };
}

function getVisibleMapPlaceCount(map: LeafletMap, places: FoodPlace[]): number {
  const bounds = map.getBounds();
  return places.filter((place) => {
    const displayPoint = toMapDisplayPoint(place);
    return bounds.contains([displayPoint.latitude, displayPoint.longitude]);
  }).length;
}

function getAdaptivePinThreshold(map: LeafletMap): number {
  const size = map.getSize();
  const viewportArea = size.x * size.y;
  return Math.max(8, Math.min(28, Math.floor(viewportArea / 42000)));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

function createWuhanFallbackMapUrl(): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
      <defs>
        <pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse">
          <path d="M54 0H0V54" fill="none" stroke="#d7c7a9" stroke-width="1" opacity=".55"/>
        </pattern>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#8b6f4f" flood-opacity=".14"/>
        </filter>
      </defs>
      <rect width="1200" height="760" fill="#eadfc9"/>
      <rect width="1200" height="760" fill="url(#grid)"/>
      <path d="M-40 455 C120 405 215 385 350 410 C485 434 598 510 755 486 C910 462 1008 380 1240 404"
        fill="none" stroke="#8fb7c9" stroke-width="68" stroke-linecap="round" opacity=".95"/>
      <path d="M-40 455 C120 405 215 385 350 410 C485 434 598 510 755 486 C910 462 1008 380 1240 404"
        fill="none" stroke="#d9eef3" stroke-width="18" stroke-linecap="round" opacity=".85"/>
      <path d="M330 -30 C360 88 345 198 405 290 C460 375 538 398 595 476"
        fill="none" stroke="#91bbce" stroke-width="48" stroke-linecap="round" opacity=".95"/>
      <path d="M330 -30 C360 88 345 198 405 290 C460 375 538 398 595 476"
        fill="none" stroke="#d9eef3" stroke-width="14" stroke-linecap="round" opacity=".85"/>
      <path d="M130 190 C270 138 438 138 560 194 C680 250 820 254 1040 202" fill="none" stroke="#caa46f" stroke-width="12" stroke-linecap="round" opacity=".58"/>
      <path d="M168 620 C306 546 454 534 612 574 C768 614 894 612 1078 548" fill="none" stroke="#caa46f" stroke-width="12" stroke-linecap="round" opacity=".58"/>
      <path d="M642 120 C628 262 656 380 724 520 C760 592 804 650 852 722" fill="none" stroke="#caa46f" stroke-width="10" stroke-linecap="round" opacity=".5"/>
      <path d="M248 88 L300 170 L252 230 L170 210 L142 132 Z" fill="#fff7e8" stroke="#d0b38e" stroke-width="2" filter="url(#shadow)" opacity=".9"/>
      <path d="M520 126 L680 162 L742 270 L646 356 L512 320 L462 212 Z" fill="#fff7e8" stroke="#d0b38e" stroke-width="2" filter="url(#shadow)" opacity=".86"/>
      <path d="M724 408 L950 372 L1048 476 L980 632 L760 648 L654 540 Z" fill="#fff7e8" stroke="#d0b38e" stroke-width="2" filter="url(#shadow)" opacity=".86"/>
      <path d="M238 394 L456 410 L554 512 L466 656 L232 646 L120 528 Z" fill="#fff7e8" stroke="#d0b38e" stroke-width="2" filter="url(#shadow)" opacity=".86"/>
      <g font-family="PingFang SC, Microsoft YaHei, sans-serif" fill="#4a3929">
        <text x="574" y="430" font-size="30" font-weight="800">武汉</text>
        <text x="316" y="300" font-size="22" fill="#5f7f91">汉江</text>
        <text x="760" y="454" font-size="24" fill="#5f7f91">长江</text>
        <text x="214" y="170" font-size="22" font-weight="700">汉口</text>
        <text x="338" y="540" font-size="22" font-weight="700">汉阳</text>
        <text x="840" y="526" font-size="22" font-weight="700">武昌</text>
        <text x="584" y="246" font-size="18">江汉路</text>
        <text x="760" y="360" font-size="18">武汉天地</text>
        <text x="852" y="612" font-size="18">楚河汉街</text>
        <text x="674" y="604" font-size="18">黄鹤楼</text>
        <text x="462" y="454" font-size="18">归元寺</text>
        <text x="962" y="258" font-size="18">东湖</text>
      </g>
      <g fill="#5f7f91" stroke="#fff7e8" stroke-width="3" opacity=".82">
        <circle cx="586" cy="266" r="7"/>
        <circle cx="760" cy="360" r="7"/>
        <circle cx="852" cy="612" r="7"/>
        <circle cx="674" cy="604" r="7"/>
        <circle cx="462" cy="454" r="7"/>
        <circle cx="962" cy="258" r="7"/>
      </g>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
