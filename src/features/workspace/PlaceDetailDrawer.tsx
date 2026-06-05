import { ArrowLeft, CalendarDays, Edit, MapPin, Trash2 } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { RatingStars } from "../../components/RatingStars";
import type { FoodLayer, FoodPlace, PhotoAsset } from "../../domain/types";

interface Props {
  place?: FoodPlace;
  layers: FoodLayer[];
  photos: PhotoAsset[];
  readonly?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  onBack?: () => void;
}

export function PlaceDetailDrawer({ place, layers, photos, readonly, onEdit, onDelete, onAdd, onBack }: Props) {
  if (!place) {
    return (
      <aside className="detail-drawer" data-testid="place-detail">
        <EmptyState
          title={readonly ? "还没有选中地点" : "选择图钉查看详情，或在武汉地图上新增记录。"}
          actions={!readonly && onAdd ? <button type="button" className="primary-button" onClick={onAdd}>新增地点</button> : undefined}
        />
      </aside>
    );
  }
  const layer = layers.find((item) => item.id === place.layerId);
  const placePhotos = photos.filter((photo) => place.photoIds.includes(photo.id));
  return (
    <aside className="detail-drawer" data-testid="place-detail">
      <div className="detail-drawer__header">
        {onBack ? (
          <button type="button" className="icon-button" onClick={onBack} aria-label="返回清单">
            <ArrowLeft size={17} />
          </button>
        ) : null}
        <div>
          <div className="eyebrow" style={{ color: layer?.color }}>{layer?.name ?? "未分组"}</div>
          <h2>{place.name}</h2>
        </div>
        {!readonly ? (
          <div className="detail-actions">
            <button type="button" className="icon-button" onClick={onEdit} aria-label="编辑">
              <Edit size={17} />
            </button>
            <button type="button" className="icon-button danger" onClick={onDelete} aria-label="删除">
              <Trash2 size={17} />
            </button>
          </div>
        ) : null}
      </div>
      {placePhotos.length > 0 ? (
        <div className="detail-hero-photos">
          {placePhotos.slice(0, 3).map((photo) => <img key={photo.id} src={photo.thumbnailDataUrl} alt={photo.fileName} />)}
        </div>
      ) : (
        <div className="detail-photo-placeholder">还没有照片</div>
      )}
      <RatingStars value={place.rating} readonly />
      <div className="meta-list">
        <span><CalendarDays size={15} /> {place.visitedAt}</span>
        {place.city ? <span><MapPin size={15} /> {place.city}</span> : null}
        {place.address ? <span><MapPin size={15} /> {place.address}</span> : null}
      </div>
      {place.tags.length > 0 ? (
        <div className="chip-list">
          {place.tags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
        </div>
      ) : null}
      {place.notes ? <p className="notes">{place.notes}</p> : <p className="notes is-muted">还没有文字记录。</p>}
    </aside>
  );
}
