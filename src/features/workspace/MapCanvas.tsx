import { useEffect, useRef } from "react";
import type { FoodPlace } from "../../domain/types";
import { DEFAULT_CENTER } from "../../domain/types";
import { createMapProvider } from "../../map/createMapProvider";
import type { MapProviderAdapter } from "../../map/MapProviderAdapter";

interface Props {
  places: FoodPlace[];
  readonly?: boolean;
  focusedPlaceId?: string;
  draggablePlaceIds?: string[];
  onPlaceClick: (placeId: string) => void;
  onMapClick: (point: { longitude: number; latitude: number }) => void;
  onPlaceMove?: (placeId: string, point: { longitude: number; latitude: number }) => void;
  notify: (text: string) => void;
}

export function MapCanvas({ places, readonly, focusedPlaceId, draggablePlaceIds = [], onPlaceClick, onMapClick, onPlaceMove, notify }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const providerRef = useRef<MapProviderAdapter | null>(null);
  const onPlaceClickRef = useRef(onPlaceClick);
  const onMapClickRef = useRef(onMapClick);
  const onPlaceMoveRef = useRef(onPlaceMove);

  useEffect(() => {
    onPlaceClickRef.current = onPlaceClick;
  }, [onPlaceClick]);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    onPlaceMoveRef.current = onPlaceMove;
  }, [onPlaceMove]);

  useEffect(() => {
    if (!containerRef.current) return;
    const selection = createMapProvider();
    providerRef.current = selection.provider;
    selection.provider.onPlaceClick((placeId) => onPlaceClickRef.current(placeId));
    selection.provider.onMapClick((point) => onMapClickRef.current(point));
    selection.provider.onPlaceMove((placeId, point) => onPlaceMoveRef.current?.(placeId, point));
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
    if (!containerRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => providerRef.current?.resize?.());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    providerRef.current?.setPlaces(places);
  }, [places]);

  useEffect(() => {
    providerRef.current?.setDraggablePlaces(draggablePlaceIds);
  }, [draggablePlaceIds.join("|")]);

  useEffect(() => {
    providerRef.current?.setSelectedPlace(focusedPlaceId);
    if (focusedPlaceId) providerRef.current?.focusPlace(focusedPlaceId);
  }, [focusedPlaceId]);

  return (
    <div className="map-shell">
      <div ref={containerRef} className="map-canvas" data-testid={readonly ? "share-map" : "workspace-map"} />
    </div>
  );
}
