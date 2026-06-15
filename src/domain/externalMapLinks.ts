import { inferCoordinateSystem, toGcj02Point, toWgs84Point } from "./coordinates";
import type { CoordinateSystem, FoodPlace } from "./types";
import type { AmapScanlistRecommendation } from "../recommendations/types";

export interface ExternalMapLink {
  primaryLabel: string;
  primaryHref?: string;
  fallbackLabel: string;
  fallbackText: string;
  disabledReason?: string;
  secondaryLinks: Array<{ label: string; href: string }>;
}

export interface ExternalMapTarget {
  name: string;
  address?: string;
  city?: string;
  longitude?: number;
  latitude?: number;
  coordinateSystem?: CoordinateSystem;
}

export function buildExternalMapLink(target: ExternalMapTarget): ExternalMapLink {
  const hasCoordinate = typeof target.longitude === "number" && typeof target.latitude === "number";
  const coordinateSystem = target.coordinateSystem ?? "wgs84";
  const fallbackPoint = hasCoordinate
    ? toWgs84Point({ longitude: target.longitude as number, latitude: target.latitude as number }, coordinateSystem)
    : undefined;
  const fallbackText = [
    target.name,
    target.address,
    fallbackPoint ? `${fallbackPoint.latitude.toFixed(6)},${fallbackPoint.longitude.toFixed(6)}` : undefined
  ].filter(Boolean).join(" ");

  if (!hasCoordinate) {
    return {
      primaryLabel: "打开地图/导航",
      fallbackLabel: target.address ? "复制地址" : "复制名称",
      fallbackText,
      disabledReason: "缺少可导航坐标",
      secondaryLinks: []
    };
  }

  const amapPoint = toGcj02Point({ longitude: target.longitude as number, latitude: target.latitude as number }, coordinateSystem);
  const wgsPoint = toWgs84Point({ longitude: target.longitude as number, latitude: target.latitude as number }, coordinateSystem);
  const encodedName = encodeURIComponent(target.name);
  const encodedAddress = encodeURIComponent(target.address || target.name);
  const amapUri = `amapuri://route/plan/?dlat=${amapPoint.latitude}&dlon=${amapPoint.longitude}&dname=${encodedName}&dev=0&t=0`;
  const amapWeb = `https://uri.amap.com/navigation?to=${amapPoint.longitude},${amapPoint.latitude},${encodedName}&mode=car&policy=1&src=foodmap&coordinate=gaode&callnative=1`;
  const appleMaps = `https://maps.apple.com/?ll=${wgsPoint.latitude},${wgsPoint.longitude}&q=${encodedName}`;
  const geo = `geo:${wgsPoint.latitude},${wgsPoint.longitude}?q=${wgsPoint.latitude},${wgsPoint.longitude}(${encodedAddress})`;

  return {
    primaryLabel: "打开地图/导航",
    primaryHref: amapWeb,
    fallbackLabel: "复制地址/坐标",
    fallbackText,
    secondaryLinks: [
      { label: "高德 App", href: amapUri },
      { label: "Apple Maps", href: appleMaps },
      { label: "通用 Geo", href: geo }
    ]
  };
}

export function placeToExternalMapTarget(place: FoodPlace): ExternalMapTarget {
  return {
    name: place.name,
    address: place.address,
    city: place.city,
    longitude: place.longitude,
    latitude: place.latitude,
    coordinateSystem: inferExternalMapCoordinateSystem(place)
  };
}

export function recommendationToExternalMapTarget(recommendation: AmapScanlistRecommendation): ExternalMapTarget {
  return {
    name: recommendation.name,
    address: recommendation.address,
    city: "武汉",
    longitude: recommendation.longitude,
    latitude: recommendation.latitude,
    coordinateSystem: recommendation.coordinateSystem ?? "gcj02"
  };
}

function inferExternalMapCoordinateSystem(place: FoodPlace): CoordinateSystem | undefined {
  return inferCoordinateSystem(place);
}
