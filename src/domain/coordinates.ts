import type { CoordinateSystem, FoodPlace } from "./types";

export interface GeoPoint {
  longitude: number;
  latitude: number;
}

const PI = Math.PI;
const AXIS = 6378245.0;
const OFFSET = 0.00669342162296594323;

export function isInChina(point: GeoPoint): boolean {
  return point.longitude >= 72.004 && point.longitude <= 137.8347 && point.latitude >= 0.8293 && point.latitude <= 55.8271;
}

export function wgs84ToGcj02(point: GeoPoint): GeoPoint {
  if (!isInChina(point)) return point;
  let deltaLat = transformLat(point.longitude - 105.0, point.latitude - 35.0);
  let deltaLng = transformLng(point.longitude - 105.0, point.latitude - 35.0);
  const radLat = point.latitude / 180.0 * PI;
  let magic = Math.sin(radLat);
  magic = 1 - OFFSET * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  deltaLat = (deltaLat * 180.0) / ((AXIS * (1 - OFFSET)) / (magic * sqrtMagic) * PI);
  deltaLng = (deltaLng * 180.0) / (AXIS / sqrtMagic * Math.cos(radLat) * PI);
  return {
    longitude: point.longitude + deltaLng,
    latitude: point.latitude + deltaLat
  };
}

export function gcj02ToWgs84(point: GeoPoint): GeoPoint {
  if (!isInChina(point)) return point;
  const gcj = wgs84ToGcj02(point);
  return {
    longitude: point.longitude * 2 - gcj.longitude,
    latitude: point.latitude * 2 - gcj.latitude
  };
}

export function inferCoordinateSystem(place: Pick<FoodPlace, "id" | "layerId" | "tags" | "notes" | "coordinateSystem">): CoordinateSystem {
  if (isLegacySavedScanlistPlace(place)) return "wgs84";
  if (place.coordinateSystem) return place.coordinateSystem;
  if (place.id.startsWith("recommendation:")) return "gcj02";
  if (place.id.startsWith("dingtuyi-share:")) return "gcj02";
  if (place.layerId === "recommendation-amap-scanlist") return "gcj02";
  if (place.layerId === "external-dingtuyi-wuhan-food") return "gcj02";
  if (place.tags.includes("高德扫街榜")) return "gcj02";
  if (place.tags.includes("钉图易分享")) return "gcj02";
  if (place.notes.includes("来源：高德扫街榜")) return "gcj02";
  if (place.notes.includes("来源：钉图易公开分享图层")) return "gcj02";
  return "wgs84";
}

function isLegacySavedScanlistPlace(place: Pick<FoodPlace, "notes" | "tags">): boolean {
  return place.notes.includes("来源：高德扫街榜") && place.notes.includes("来源链接：") && place.tags.includes("高德扫街榜");
}

export function toGcj02Point(point: GeoPoint, coordinateSystem: CoordinateSystem = "wgs84"): GeoPoint {
  return coordinateSystem === "gcj02" ? point : wgs84ToGcj02(point);
}

export function toWgs84Point(point: GeoPoint, coordinateSystem: CoordinateSystem = "wgs84"): GeoPoint {
  return coordinateSystem === "wgs84" ? point : gcj02ToWgs84(point);
}

export function toMapDisplayPoint(place: Pick<FoodPlace, "id" | "layerId" | "tags" | "notes" | "longitude" | "latitude" | "coordinateSystem">): GeoPoint {
  return toGcj02Point(
    { longitude: place.longitude, latitude: place.latitude },
    inferCoordinateSystem(place)
  );
}

function transformLat(x: number, y: number): number {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}
