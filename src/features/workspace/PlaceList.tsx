import { Camera, Clock, MapPin, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { isPendingCalibrationPlace } from "../../domain/filters";
import { getLocationStatusBadges, getUserFacingTags } from "../../domain/locationStatus";
import type { FoodLayer, FoodPlace, PhotoAsset } from "../../domain/types";

export type PlaceSortMode = "updatedAt" | "visitedAt" | "rating" | "calibration";

interface Props {
  places: FoodPlace[];
  layers: FoodLayer[];
  photos: PhotoAsset[];
  selectedId?: string;
  onSelect: (placeId: string) => void;
  onAdd: () => void;
  onImport?: () => void;
  pendingMode?: boolean;
  onClearPending?: () => void;
}

export function PlaceList({ places, layers, photos, selectedId, onSelect, onAdd, onImport, pendingMode, onClearPending }: Props) {
  const [sortMode, setSortMode] = useState<PlaceSortMode>("calibration");
  const calibrationCount = useMemo(() => places.filter(isPendingCalibrationPlace).length, [places]);
  const sortedPlaces = useMemo(() => {
    return [...places].sort((a, b) => {
      if (sortMode === "calibration") return Number(isPendingCalibrationPlace(b)) - Number(isPendingCalibrationPlace(a)) || b.updatedAt.localeCompare(a.updatedAt);
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
      {pendingMode ? (
        <div className="pending-workbench-banner" data-testid="pending-workbench-banner">
          <span>
            <strong>待确认工作台</strong>
            优先处理近似坐标，确认候选后再导航或分享。
          </span>
          {onClearPending ? <button type="button" onClick={onClearPending}>查看全部</button> : null}
        </div>
      ) : null}
      <div className="place-list-toolbar">
        <strong>
          {places.length} 个地点
          {calibrationCount > 0 ? <small>待确认 {calibrationCount}</small> : null}
        </strong>
        <select value={sortMode} onChange={(event) => setSortMode(event.target.value as PlaceSortMode)} aria-label="清单排序">
          <option value="calibration">待确认优先</option>
          <option value="updatedAt">最近更新</option>
          <option value="visitedAt">到访时间</option>
          <option value="rating">评分最高</option>
        </select>
      </div>
      <div className="place-list">
        {sortedPlaces.map((place) => {
          const layer = layers.find((item) => item.id === place.layerId);
          const photoCount = photos.filter((photo) => place.photoIds.includes(photo.id)).length;
          const tags = getUserFacingTags(place.tags).slice(0, 4);
          const statusBadges = getLocationStatusBadges(place).slice(0, 2);
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
                {statusBadges.length > 0 ? (
                  <span className="place-list__status-row">
                    {statusBadges.map((badge) => (
                      <span key={`${place.id}-${badge.label}`} className={`place-list__status is-${badge.tone}`}>{badge.label}</span>
                    ))}
                  </span>
                ) : isPendingCalibrationPlace(place) ? <span className="place-list__status">待确认位置</span> : null}
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
