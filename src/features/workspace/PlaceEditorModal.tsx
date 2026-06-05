import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RatingStars } from "../../components/RatingStars";
import { SAMPLE_TAGS } from "../../domain/sampleData";
import { DEFAULT_CENTER, type FoodLayer, type FoodPlace, type FoodRating } from "../../domain/types";
import { createId, normalizeTags, nowIso, validatePlaceDraft } from "../../domain/validators";
import { photoRepository } from "../../persistence/photoRepository";
import { placeRepository } from "../../persistence/placeRepository";
import { filesToPhotoAssets } from "./photoUtils";

interface Props {
  open: boolean;
  place?: FoodPlace;
  layers: FoodLayer[];
  point?: { longitude: number; latitude: number };
  onClose: () => void;
  onSaved: (message: string, placeId: string) => void;
}

export function PlaceEditorModal({ open, place, layers, point, onClose, onSaved }: Props) {
  const firstLayerId = layers.find((layer) => layer.visible)?.id ?? layers[0]?.id ?? "";
  const [draft, setDraft] = useState<Partial<FoodPlace>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [positionOpen, setPositionOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().slice(0, 10);
    setDraft(
      place ?? {
        name: "",
        longitude: point?.longitude ?? DEFAULT_CENTER.longitude,
        latitude: point?.latitude ?? DEFAULT_CENTER.latitude,
        city: point ? "武汉" : "",
        layerId: firstLayerId,
        rating: 4,
        visitedAt: today,
        tags: [],
        notes: "",
        photoIds: []
      }
    );
    setFiles([]);
    setErrors([]);
    setPositionOpen(false);
  }, [open, place, point, firstLayerId]);

  const tagText = useMemo(() => (draft.tags ?? []).join("，"), [draft.tags]);
  if (!open) return null;

  const hasDraftChanges = Boolean(
    !place &&
      (draft.name?.trim() ||
        draft.address?.trim() ||
        draft.notes?.trim() ||
        draft.tags?.length ||
        files.length > 0)
  );

  function closeWithDraftGuard() {
    if (hasDraftChanges && !window.confirm("当前记录还没有保存，确定关闭吗？")) return;
    onClose();
  }

  async function save() {
    const now = nowIso();
    const id = draft.id ?? createId("place");
    const next: FoodPlace = {
      id,
      name: draft.name?.trim() ?? "",
      longitude: Number(draft.longitude),
      latitude: Number(draft.latitude),
      address: draft.address?.trim() || undefined,
      city: draft.city?.trim() || undefined,
      layerId: draft.layerId ?? firstLayerId,
      tags: draft.tags ?? [],
      rating: (draft.rating ?? 4) as FoodRating,
      visitedAt: draft.visitedAt ?? now.slice(0, 10),
      notes: draft.notes ?? "",
      photoIds: draft.photoIds ?? [],
      createdAt: draft.createdAt ?? now,
      updatedAt: now
    };
    const validation = validatePlaceDraft(next);
    if (validation.length > 0) {
      setErrors(validation);
      return;
    }
    const newPhotos = await filesToPhotoAssets(files, id);
    await Promise.all(newPhotos.map((photo) => photoRepository.save(photo)));
    await placeRepository.save({ ...next, photoIds: [...next.photoIds, ...newPhotos.map((photo) => photo.id)] });
    onSaved(place ? "已更新地点" : "已保存地点", id);
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <section className="modal" data-testid="place-editor" role="dialog" aria-modal="true" aria-labelledby="place-editor-title">
        <div className="modal__header">
          <h2 id="place-editor-title">{place ? "编辑地点" : "新增地点"}</h2>
          <button type="button" className="icon-button" onClick={closeWithDraftGuard} aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        {errors.length > 0 ? <div className="error-box">{errors.join("，")}</div> : null}
        {!place && point ? (
          <div className="form-callout">
            <strong>已使用地图点击位置</strong>
            <span>
              经度 {point.longitude.toFixed(6)}，纬度 {point.latitude.toFixed(6)}
            </span>
          </div>
        ) : null}
        <div className="editor-section">
          <div className="editor-section__title">基础信息</div>
          <div className="form-grid">
            <label>
              名称
              <input value={draft.name ?? ""} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="例如：粮道街热干面" autoFocus />
            </label>
            <label>
              图层
              <select value={draft.layerId ?? ""} onChange={(event) => setDraft({ ...draft, layerId: event.target.value })}>
                {layers.map((layer) => <option key={layer.id} value={layer.id}>{layer.name}</option>)}
              </select>
            </label>
            <label>
              评分
              <RatingStars value={(draft.rating ?? 4) as FoodRating} onChange={(rating) => setDraft({ ...draft, rating })} />
            </label>
            <label>
              到访时间
              <input type="date" value={draft.visitedAt ?? ""} onChange={(event) => setDraft({ ...draft, visitedAt: event.target.value })} />
            </label>
          </div>
        </div>
        <div className="editor-section">
          <div className="editor-section__title">体验记录</div>
          <label className="stack-label">
            标签
            <input value={tagText} onChange={(event) => setDraft({ ...draft, tags: normalizeTags(event.target.value) })} placeholder={SAMPLE_TAGS.slice(0, 4).join("，")} />
          </label>
          <label className="stack-label">
            文字记录
            <textarea value={draft.notes ?? ""} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={4} />
          </label>
          <label className="photo-uploader" data-testid="photo-uploader">
            <span>添加照片</span>
            <input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
          </label>
          {files.length > 0 ? (
            <div className="pending-photos">
              {files.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}</span>)}
            </div>
          ) : null}
        </div>
        <details className="position-details" open={positionOpen} onToggle={(event) => setPositionOpen(event.currentTarget.open)}>
          <summary>位置详情</summary>
          <div className="form-grid">
            <label>
              城市
              <input value={draft.city ?? ""} onChange={(event) => setDraft({ ...draft, city: event.target.value })} />
            </label>
            <label>
              地址
              <input value={draft.address ?? ""} onChange={(event) => setDraft({ ...draft, address: event.target.value })} />
            </label>
          </div>
          <div className="form-grid">
            <label>
              经度
              <input type="number" step="0.000001" value={draft.longitude ?? ""} onChange={(event) => setDraft({ ...draft, longitude: Number(event.target.value) })} />
            </label>
            <label>
              纬度
              <input type="number" step="0.000001" value={draft.latitude ?? ""} onChange={(event) => setDraft({ ...draft, latitude: Number(event.target.value) })} />
            </label>
          </div>
        </details>
        <div className="modal__footer">
          <button type="button" className="ghost-button" onClick={closeWithDraftGuard}>取消</button>
          <button type="button" className="primary-button" onClick={save}>保存</button>
        </div>
      </section>
    </div>
  );
}
