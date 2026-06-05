import { useEffect, useRef } from "react";
import type { FoodPlace } from "../../domain/types";
import { DEFAULT_CENTER } from "../../domain/types";
import { createMapProvider } from "../../map/createMapProvider";
import type { MapProviderAdapter } from "../../map/MapProviderAdapter";

interface Props {
  places: FoodPlace[];
  readonly?: boolean;
  focusedPlaceId?: string;
  onPlaceClick: (placeId: string) => void;
  onMapClick: (point: { longitude: number; latitude: number }) => void;
  notify: (text: string) => void;
}

export function MapCanvas({ places, readonly, focusedPlaceId, onPlaceClick, onMapClick, notify }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const providerRef = useRef<MapProviderAdapter | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const selection = createMapProvider();
    providerRef.current = selection.provider;
    selection.provider.onPlaceClick(onPlaceClick);
    selection.provider.onMapClick(onMapClick);
    void selection.provider
      .initialize(containerRef.current, { center: DEFAULT_CENTER, zoom: 12, readonly })
      .then(() => {
        selection.provider.setPlaces(places);
        if (selection.fallbackMessage) notify(selection.fallbackMessage);
      })
      .catch(() => notify("地图暂时无法加载，请检查网络或稍后重试。"));
    return () => selection.provider.destroy();
  }, []);

  useEffect(() => {
    providerRef.current?.setPlaces(places);
  }, [places]);

  useEffect(() => {
    if (focusedPlaceId) providerRef.current?.focusPlace(focusedPlaceId);
  }, [focusedPlaceId]);

  return (
    <div className="map-shell">
      <div ref={containerRef} className="map-canvas" data-testid={readonly ? "share-map" : "workspace-map"} />
    </div>
  );
}
