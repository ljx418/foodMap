import L, { type DivIcon, type LeafletMouseEvent, type Map as LeafletMap, type Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FoodPlace } from "../../domain/types";
import type { MapInitializeOptions, MapProviderAdapter, MapSearchResult } from "../MapProviderAdapter";

export class LeafletProvider implements MapProviderAdapter {
  name = "leaflet";
  private map?: LeafletMap;
  private places: FoodPlace[] = [];
  private markers = new Map<string, Marker>();
  private fallbackOverlay?: L.ImageOverlay;
  private placeClick?: (placeId: string) => void;
  private mapClick?: (point: { longitude: number; latitude: number }) => void;
  private hiddenLayers = new Set<string>();
  private readonly = false;
  private center = { longitude: 114.3055, latitude: 30.5928 };

  async initialize(container: HTMLElement, options: MapInitializeOptions): Promise<void> {
    this.readonly = Boolean(options.readonly);
    this.center = options.center;
    container.classList.add("leaflet-map");

    this.map = L.map(container, {
      center: [options.center.latitude, options.center.longitude],
      zoom: options.zoom,
      zoomControl: true,
      attributionControl: true
    });

    this.fallbackOverlay = L.imageOverlay(createWuhanFallbackMapUrl(), [
      [30.34, 113.88],
      [30.86, 114.72]
    ], {
      interactive: false,
      opacity: 0.98,
      zIndex: 180
    }).addTo(this.map);

    let loadedTiles = 0;
    const tileLayer = L.tileLayer("https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", {
      subdomains: ["1", "2", "3", "4"],
      maxZoom: 19,
      attribution: "高德地图"
    });
    tileLayer.on("tileload", () => {
      loadedTiles += 1;
      if (loadedTiles >= 4 && this.fallbackOverlay) {
        this.fallbackOverlay.remove();
        this.fallbackOverlay = undefined;
      }
    });
    tileLayer.addTo(this.map);

    this.map.on("click", this.handleMapClick);
    this.map.on("zoomend moveend resize", this.renderMarkers);
    this.renderMarkers();
    window.setTimeout(() => this.map?.invalidateSize(), 0);
  }

  destroy(): void {
    this.map?.off("click", this.handleMapClick);
    this.map?.off("zoomend moveend resize", this.renderMarkers);
    this.map?.remove();
    this.map = undefined;
    this.markers.clear();
  }

  setPlaces(places: FoodPlace[]): void {
    this.places = places;
    this.renderMarkers();
  }

  focusPlace(placeId: string): void {
    const marker = this.markers.get(placeId);
    if (!marker || !this.map) return;
    this.map.flyTo(marker.getLatLng(), Math.max(this.map.getZoom(), 15), { duration: 0.45 });
    marker.openPopup();
  }

  setLayerVisibility(layerId: string, visible: boolean): void {
    if (visible) this.hiddenLayers.delete(layerId);
    else this.hiddenLayers.add(layerId);
    this.renderMarkers();
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
        provider: this.name
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
      provider: this.name
    };
  }

  onPlaceClick(callback: (placeId: string) => void): void {
    this.placeClick = callback;
  }

  onMapClick(callback: (point: { longitude: number; latitude: number }) => void): void {
    this.mapClick = callback;
  }

  private handleMapClick = (event: LeafletMouseEvent): void => {
    if (this.readonly) return;
    this.mapClick?.({
      longitude: Number(event.latlng.lng.toFixed(6)),
      latitude: Number(event.latlng.lat.toFixed(6))
    });
  };

  private renderMarkers = (): void => {
    if (!this.map) return;
    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();

    const visiblePlaces = this.places.filter((place) => !this.hiddenLayers.has(place.layerId));
    const recommendationPlaces = visiblePlaces.filter((place) => place.id.startsWith("recommendation:"));
    const visibleRecommendationCount = getVisibleRecommendationCount(this.map, recommendationPlaces);
    const adaptivePinThreshold = getAdaptivePinThreshold(this.map);
    const shouldPromoteDenseDots = visibleRecommendationCount <= adaptivePinThreshold;

    visiblePlaces.forEach((place) => {
        const isRecommendation = place.id.startsWith("recommendation:");
        const icon = isRecommendation
          ? createRecommendationIcon(place, getRecommendationMarkerMode(place, shouldPromoteDenseDots))
          : createFoodIcon(place.rating);
        const marker = L.marker([place.latitude, place.longitude], {
          icon
        })
          .addTo(this.map!)
          .bindPopup(`<strong>${escapeHtml(place.name)}</strong><br />${escapeHtml(place.city || "武汉")} · ${place.rating} 星`);
        marker.on("click", () => this.placeClick?.(place.id));
        this.markers.set(place.id, marker);
      });
  };
}

function createFoodIcon(rating: number): DivIcon {
  return L.divIcon({
    className: "food-leaflet-marker",
    html: `<span>${rating}</span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -38]
  });
}

type RecommendationMarkerMode = "rank-pin" | "adaptive-pin" | "dot";

function createRecommendationIcon(place: FoodPlace, mode: RecommendationMarkerMode): DivIcon {
  const label = escapeHtml(place.mapLabel ?? String(place.rating));
  const isPin = mode !== "dot";
  const prominenceClass = mode === "rank-pin" ? " is-primary-rank" : mode === "adaptive-pin" ? " is-secondary-rank is-adaptive-pin" : " is-secondary-rank";
  const accuracyClass = place.mapAccuracy === "approximate" ? " is-approximate" : " is-exact";
  return L.divIcon({
    className: `recommendation-leaflet-marker${accuracyClass}${prominenceClass}`,
    html: isPin
      ? `<span aria-label="扫街榜第 ${label} 名"><strong>${label}</strong></span>`
      : `<span aria-label="扫街榜第 ${label} 名" title="扫街榜第 ${label} 名"></span>`,
    iconSize: isPin ? [34, 40] : [18, 22],
    iconAnchor: isPin ? [17, 38] : [9, 20],
    popupAnchor: isPin ? [0, -34] : [0, -18]
  });
}

function getRecommendationMarkerMode(place: FoodPlace, shouldPromoteDenseDots: boolean): RecommendationMarkerMode {
  const rank = Number(place.mapLabel);
  if (Number.isFinite(rank) && rank <= 20) return "rank-pin";
  return shouldPromoteDenseDots ? "adaptive-pin" : "dot";
}

function getVisibleRecommendationCount(map: LeafletMap, places: FoodPlace[]): number {
  const bounds = map.getBounds();
  return places.filter((place) => bounds.contains([place.latitude, place.longitude])).length;
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
