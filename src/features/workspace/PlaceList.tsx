import { Camera, Clock, MapPin, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import type { FoodLayer, FoodPlace, PhotoAsset } from "../../domain/types";

export type PlaceSortMode = "updatedAt" | "visitedAt" | "rating";

interface Props {
  places: FoodPlace[];
  layers: FoodLayer[];
  photos: PhotoAsset[];
  selectedId?: string;
  onSelect: (placeId: string) => void;
  onAdd: () => void;
  onImport?: () => void;
}

export function PlaceList({ places, layers, photos, selectedId, onSelect, onAdd, onImport }: Props) {
  const [sortMode, setSortMode] = useState<PlaceSortMode>("updatedAt");
  const sortedPlaces = useMemo(() => {
    return [...places].sort((a, b) => {
      if (sortMode === "rating") return b.rating - a.rating || b.updatedAt.localeCompare(a.updatedAt);
      if (sortMode === "visitedAt") return b.visitedAt.localeCompare(a.visitedAt) || b.updatedAt.localeCompare(a.updatedAt);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [places, sortMode]);

  if (places.length === 0) {
    return (
      <div className="place-list-shell" data-testid="place-list">
        <EmptyState
          title="还没有美食图钉"
          actions={
            <>
              <button type="button" className="primary-button" onClick={onAdd}>新增地点</button>
              {onImport ? <button type="button" className="ghost-button" onClick={onImport}>导入 .foodmap.json</button> : null}
            </>
          }
        />
      </div>
    );
  }

  return (
    <div className="place-list-shell" data-testid="place-list">
      <div className="place-list-toolbar">
        <strong>{places.length} 个地点</strong>
        <select value={sortMode} onChange={(event) => setSortMode(event.target.value as PlaceSortMode)} aria-label="清单排序">
          <option value="updatedAt">最近更新</option>
          <option value="visitedAt">到访时间</option>
          <option value="rating">评分最高</option>
        </select>
      </div>
      <div className="place-list">
        {sortedPlaces.map((place) => {
          const layer = layers.find((item) => item.id === place.layerId);
          const photoCount = photos.filter((photo) => place.photoIds.includes(photo.id)).length;
          const tags = place.tags.slice(0, 3);
          return (
            <button
              key={place.id}
              type="button"
              className={selectedId === place.id ? "place-list__item is-active" : "place-list__item"}
              onClick={() => onSelect(place.id)}
            >
              <span className="place-list__swatch" style={{ background: layer?.color }} />
              <span className="place-list__content">
                <strong>{place.name}</strong>
                <small>
                  <MapPin size={13} /> {[place.city, layer?.name].filter(Boolean).join(" · ") || "武汉"}
                </small>
                <small>
                  <Star size={13} /> {place.rating} 星
                  <Clock size={13} /> {place.visitedAt}
                  <Camera size={13} /> {photoCount}
                </small>
                {tags.length > 0 ? <span className="place-list__tags">{tags.map((tag) => `#${tag}`).join(" ")}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
