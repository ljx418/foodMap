import { searchPlaceCandidates, type MapProviderSearchResult } from "./placeSearch";
import type { PlaceCandidate } from "./placeRecognition";
import { toGcj02Point } from "./coordinates";
import type { FoodPlace } from "./types";

export const AMAP_WEB_SERVICE_KEY_STORAGE = "foodmap.amap.webServiceKey";

interface AmapSearchOptions {
  apiKey: string;
  query: string;
  place?: FoodPlace;
  historyPlaces?: FoodPlace[];
  limit?: number;
}

interface AmapPoi {
  id?: string;
  name?: string;
  address?: string | unknown[];
  location?: string;
  cityname?: string;
  adname?: string;
  type?: string;
}

interface AmapPlaceTextResponse {
  status?: string;
  info?: string;
  infocode?: string;
  pois?: AmapPoi[];
}

export function getStoredAmapWebServiceKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(AMAP_WEB_SERVICE_KEY_STORAGE) ?? "";
}

export function storeAmapWebServiceKey(key: string): void {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (trimmed) {
    window.localStorage.setItem(AMAP_WEB_SERVICE_KEY_STORAGE, trimmed);
  } else {
    window.localStorage.removeItem(AMAP_WEB_SERVICE_KEY_STORAGE);
  }
}

export async function searchAmapPlaceCandidates(options: AmapSearchOptions): Promise<PlaceCandidate[]> {
  const apiKey = options.apiKey.trim();
  const query = options.query.trim();
  if (!apiKey) throw new Error("请先填写高德 Web 服务 Key");
  if (!query) throw new Error("请输入店名、地址或商圈");

  const limit = Math.min(Math.max(options.limit ?? 10, 1), 20);
  const requestUrl = buildAmapPlaceSearchUrl({ apiKey, query, place: options.place, limit });
  const response = await requestAmapPlaceText(requestUrl);
  if (response.status !== "1") {
    throw new Error(response.info || `高德搜索失败 ${response.infocode ?? ""}`.trim());
  }

  const results = (response.pois ?? [])
    .map((poi, index) => amapPoiToMapProviderResult(poi, index, requestUrl))
    .filter((result): result is MapProviderSearchResult => Boolean(result));

  const ranked = searchPlaceCandidates({
    text: query,
    point: options.place ? { longitude: options.place.longitude, latitude: options.place.latitude } : undefined,
    historyPlaces: options.historyPlaces,
    mapProviderResults: results
  });

  return ranked.candidates
    .filter((candidate) => candidate.source === "map-provider")
    .slice(0, limit);
}

function buildAmapPlaceSearchUrl({
  apiKey,
  query,
  place,
  limit
}: {
  apiKey: string;
  query: string;
  place?: FoodPlace;
  limit: number;
}): string {
  const params = new URLSearchParams({
    key: apiKey,
    keywords: query,
    city: "武汉",
    citylimit: "true",
    offset: String(limit),
    page: "1",
    extensions: "base",
    output: "json"
  });
  if (place) {
    const point = toGcj02Point({ longitude: place.longitude, latitude: place.latitude }, place.coordinateSystem ?? "wgs84");
    params.set("location", `${point.longitude},${point.latitude}`);
  }
  return `https://restapi.amap.com/v3/place/text?${params.toString()}`;
}

async function requestAmapPlaceText(url: string): Promise<AmapPlaceTextResponse> {
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json() as AmapPlaceTextResponse;
  } catch (error) {
    if (typeof document === "undefined") throw error;
    return requestAmapPlaceTextByJsonp(url);
  }
}

function requestAmapPlaceTextByJsonp(url: string): Promise<AmapPlaceTextResponse> {
  return new Promise((resolve, reject) => {
    const callbackName = `foodMapAmapCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("高德搜索超时，请检查 Key 或网络"));
    }, 10000);

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      delete (window as unknown as Record<string, unknown>)[callbackName];
    }

    (window as unknown as Record<string, unknown>)[callbackName] = (data: AmapPlaceTextResponse) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("高德搜索请求失败"));
    };
    const separator = url.includes("?") ? "&" : "?";
    script.src = `${url}${separator}callback=${encodeURIComponent(callbackName)}`;
    document.head.appendChild(script);
  });
}

function amapPoiToMapProviderResult(poi: AmapPoi, index: number, sourceUrl: string): MapProviderSearchResult | undefined {
  const location = parseAmapLocation(poi.location);
  if (!poi.name || !location) return undefined;
  const address = Array.isArray(poi.address) ? undefined : poi.address;
  return {
    id: poi.id || `${poi.name}-${index}`,
    name: poi.name,
    address,
    city: poi.cityname || "武汉",
    provider: "amap",
    longitude: location.longitude,
    latitude: location.latitude,
    coordinateSystem: "gcj02",
    sourceUrl,
    evidenceLabel: "高德 Web 服务 POI 搜索",
    tags: ["高德搜索候选", poi.adname, poi.type].filter(Boolean) as string[],
    confidence: index === 0 ? 0.9 : Math.max(0.72, 0.88 - index * 0.025),
    coordinateAccuracy: "exact",
    reasons: [
      `高德搜索第 ${index + 1} 个候选`,
      poi.adname ? `行政区：${poi.adname}` : "城市限定：武汉",
      address ? "地址和坐标完整" : "坐标完整，地址待补"
    ]
  };
}

function parseAmapLocation(location?: string): { longitude: number; latitude: number } | undefined {
  if (!location) return undefined;
  const [lng, lat] = location.split(",").map(Number);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return undefined;
  return { longitude: lng, latitude: lat };
}
