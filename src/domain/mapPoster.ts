import { inferCoordinateSystem, toWgs84Point } from "./coordinates";
import type { FoodPlace, MapViewportBounds } from "./types";

export type PosterMode = "current-filter" | "current-viewport";

export interface PosterSourceResult {
  mode: PosterMode;
  places: FoodPlace[];
  count: number;
  unavailableReason?: string;
  emptyReason?: string;
}

export interface MapPosterOptions {
  title: string;
  subtitle?: string;
  includeRecommendationLayer?: boolean;
  generatedAt?: string;
  tagSummary?: string;
}

export function createMapPosterSvg(places: FoodPlace[], options: MapPosterOptions): string {
  const width = 1080;
  const height = 1440;
  const bounds = getBounds(places);
  const pins = places.map((place, index) => {
    const geoPoint = toPosterPoint(place);
    const point = project(geoPoint.longitude, geoPoint.latitude, bounds, width, height);
    const color = place.id.startsWith("recommendation:") ? "#1f6f7d" : "#2f8a59";
    return `<g transform="translate(${point.x} ${point.y})"><path d="M0 -28 C17 -28 30 -15 30 1 C30 23 0 44 0 44 C0 44 -30 23 -30 1 C-30 -15 -17 -28 0 -28Z" fill="${color}" stroke="#fff8ea" stroke-width="5"/><text y="8" text-anchor="middle" font-size="24" font-weight="800" fill="#fff">${index + 1}</text></g>`;
  }).join("");
  const generatedAt = options.generatedAt ?? formatGeneratedAt(new Date());
  const tagSummary = options.tagSummary ?? Array.from(new Set(places.flatMap((place) => place.tags))).slice(0, 8).map((tag) => `#${escapeXml(tag)}`).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#fff8ea"/>
    <rect x="56" y="56" width="968" height="1328" rx="36" fill="#fffdf7" stroke="#d8c5a5" stroke-width="3"/>
    <text x="100" y="150" font-size="54" font-weight="900" fill="#3b2b1f">${escapeXml(options.title || "我的美食地图")}</text>
    <text x="100" y="205" font-size="26" fill="#806b57">${escapeXml(options.subtitle || `${places.length} 个美食图钉`)}</text>
    <g transform="translate(80 260)">
      <rect width="920" height="870" rx="28" fill="#eadfc9" stroke="#d8c5a5" stroke-width="2"/>
      <path d="M-20 535 C130 480 240 470 382 505 C535 542 645 595 790 560 C900 535 984 482 960 482" fill="none" stroke="#8fb7c9" stroke-width="76" stroke-linecap="round"/>
      <path d="M260 -20 C285 140 305 260 390 404 C450 500 468 570 500 780" fill="none" stroke="#91bbce" stroke-width="54" stroke-linecap="round"/>
      <path d="M80 160 C240 105 410 120 560 180 C690 230 780 218 900 176" fill="none" stroke="#caa46f" stroke-width="12" opacity=".62"/>
      <path d="M120 720 C280 650 438 650 600 702 C726 744 820 724 902 674" fill="none" stroke="#caa46f" stroke-width="12" opacity=".62"/>
      <g>${pins}</g>
    </g>
    <text x="100" y="1205" font-size="30" font-weight="800" fill="#3b2b1f">标签</text>
    <text x="100" y="1255" font-size="25" fill="#6f7f47">${tagSummary || "暂无标签"}</text>
    <text x="100" y="1320" font-size="22" fill="#806b57">FoodMap 本地生成 · 个人记录默认导出 · 生成时间：${escapeXml(generatedAt)}</text>
  </svg>`;
}

export function buildPosterSourceSet(
  places: FoodPlace[],
  mode: PosterMode,
  viewportBounds?: MapViewportBounds
): PosterSourceResult {
  if (mode === "current-filter") {
    return {
      mode,
      places: excludeReferencePlaces(places),
      count: excludeReferencePlaces(places).length
    };
  }

  if (!viewportBounds) {
    return {
      mode,
      places: [],
      count: 0,
      unavailableReason: "当前地图视野尚未就绪"
    };
  }

  const viewportPlaces = filterPlacesByViewport(excludeReferencePlaces(places), viewportBounds);
  return {
    mode,
    places: viewportPlaces,
    count: viewportPlaces.length,
    emptyReason: viewportPlaces.length === 0 ? "当前地图视野内没有符合筛选条件的个人图钉" : undefined
  };
}

export function filterPlacesByViewport(places: FoodPlace[], bounds: MapViewportBounds): FoodPlace[] {
  const wgs84Bounds = normalizeBounds(bounds);
  return places.filter((place) => {
    const point = toWgs84Point({ longitude: place.longitude, latitude: place.latitude }, inferCoordinateSystem(place));
    return point.longitude >= wgs84Bounds.west
      && point.longitude <= wgs84Bounds.east
      && point.latitude >= wgs84Bounds.south
      && point.latitude <= wgs84Bounds.north;
  });
}

export function downloadMapPoster(places: FoodPlace[], options: MapPosterOptions): Promise<void> {
  const svg = createMapPosterSvg(places, options);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  const image = new Image();
  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1440;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context unavailable"));
        return;
      }
      context.fillStyle = "#fff8ea";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Poster blob unavailable"));
          return;
        }
        const pngUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = pngUrl;
        anchor.download = `${options.title || "foodmap-poster"}.png`;
        anchor.click();
        URL.revokeObjectURL(pngUrl);
        resolve();
      }, "image/png");
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Poster image failed to load"));
    };
    image.src = url;
  });
}

function getBounds(places: FoodPlace[]) {
  const points = places.map(toPosterPoint);
  const lngs = points.map((point) => point.longitude);
  const lats = points.map((point) => point.latitude);
  return {
    minLng: Math.min(...lngs, 113.88),
    maxLng: Math.max(...lngs, 114.72),
    minLat: Math.min(...lats, 30.34),
    maxLat: Math.max(...lats, 30.86)
  };
}

function excludeReferencePlaces(places: FoodPlace[]): FoodPlace[] {
  return places.filter((place) => !place.id.startsWith("recommendation:") && !place.id.startsWith("dingtuyi-share:"));
}

function normalizeBounds(bounds: MapViewportBounds): Required<Pick<MapViewportBounds, "west" | "south" | "east" | "north">> {
  const west = Math.min(bounds.west, bounds.east);
  const east = Math.max(bounds.west, bounds.east);
  const south = Math.min(bounds.south, bounds.north);
  const north = Math.max(bounds.south, bounds.north);
  return { west, south, east, north };
}

function toPosterPoint(place: FoodPlace) {
  return toWgs84Point({ longitude: place.longitude, latitude: place.latitude }, inferCoordinateSystem(place));
}

function project(longitude: number, latitude: number, bounds: ReturnType<typeof getBounds>, width: number, height: number) {
  const x = 80 + ((longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 920;
  const y = 260 + (1 - ((latitude - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1))) * 870;
  return {
    x: Math.max(120, Math.min(width - 120, x)),
    y: Math.max(320, Math.min(height - 350, y))
  };
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);
}

function formatGeneratedAt(date: Date): string {
  return date.toISOString().slice(0, 10);
}
