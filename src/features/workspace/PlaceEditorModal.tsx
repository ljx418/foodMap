import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RatingStars } from "../../components/RatingStars";
import { SAMPLE_TAGS } from "../../domain/sampleData";
import { findDuplicatePlaceWarning } from "../../domain/duplicates";
import { DEFAULT_CENTER, type FoodLayer, type FoodPlace, type FoodRating, type VisitStatusTag } from "../../domain/types";
import type { PlaceCandidate } from "../../domain/placeRecognition";
import { searchPlaceCandidates } from "../../domain/placeSearch";
import { describeUserLocation, IDLE_USER_LOCATION, requestUserLocation, userLocationToPoint, type UserLocationSnapshot } from "../../domain/userLocation";
import {
  CUISINE_TAG_PRESETS,
  groupsFromTags,
  REVIEW_TAG_PRESETS,
  tagsFromGroups,
  VISIT_STATUS_LABELS
} from "../../domain/tagGroups";
import { createId, normalizeTags, nowIso, validatePlaceDraft } from "../../domain/validators";
import { photoRepository } from "../../persistence/photoRepository";
import { placeRepository } from "../../persistence/placeRepository";
import { filesToPhotoAssets } from "./photoUtils";

interface Props {
  open: boolean;
  place?: FoodPlace;
  layers: FoodLayer[];
  places: FoodPlace[];
  point?: { longitude: number; latitude: number };
  initialText?: string;
  onClose: () => void;
  onSaved: (message: string, placeId: string) => void;
}

export function PlaceEditorModal({ open, place, layers, places, point, initialText, onClose, onSaved }: Props) {
  const firstLayerId = layers.find((layer) => layer.visible)?.id ?? layers[0]?.id ?? "";
  const [draft, setDraft] = useState<Partial<FoodPlace>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [positionOpen, setPositionOpen] = useState(false);
  const [duplicateConfirmed, setDuplicateConfirmed] = useState(false);
  const [recognitionText, setRecognitionText] = useState("");
  const [recognizedCandidates, setRecognizedCandidates] = useState<PlaceCandidate[]>([]);
  const [blockedCandidates, setBlockedCandidates] = useState<PlaceCandidate[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocationSnapshot>(IDLE_USER_LOCATION);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().slice(0, 10);
    setDraft(
      place ?? {
        longitude: point?.longitude ?? DEFAULT_CENTER.longitude,
        latitude: point?.latitude ?? DEFAULT_CENTER.latitude,
        coordinateSystem: "wgs84",
        city: point ? "武汉" : "",
        layerId: firstLayerId,
        name: initialText?.startsWith("http") ? "" : (initialText ?? ""),
        rating: 4,
        visitedAt: today,
        tags: [],
        notes: "",
        photoIds: [],
        tagGroups: groupsFromTags([])
      }
    );
    setFiles([]);
    setErrors([]);
    setPositionOpen(false);
    setDuplicateConfirmed(false);
    setRecognitionText(initialText ?? "");
    setRecognizedCandidates([]);
    setBlockedCandidates([]);
    setUserLocation(IDLE_USER_LOCATION);
    setLocating(false);
  }, [initialText, open, place, point]);

  useEffect(() => {
    if (!open || draft.layerId || !firstLayerId) return;
    setDraft((current) => ({ ...current, layerId: firstLayerId }));
  }, [draft.layerId, firstLayerId, open]);

  const tagText = useMemo(() => (draft.tags ?? []).join("，"), [draft.tags]);
  const tagGroups = useMemo(() => groupsFromTags(draft.tags ?? [], draft.tagGroups), [draft.tagGroups, draft.tags]);
  const duplicateWarning = useMemo(() => {
    if (!draft.name || typeof draft.longitude !== "number" || typeof draft.latitude !== "number") return undefined;
    return findDuplicatePlaceWarning(
      { name: draft.name, longitude: draft.longitude, latitude: draft.latitude },
      places,
      place?.id
    );
  }, [draft.latitude, draft.longitude, draft.name, place?.id, places]);

  useEffect(() => {
    setDuplicateConfirmed(false);
  }, [draft.latitude, draft.longitude, draft.name]);

  const hasDraftChanges = useMemo(() => {
    if (files.length > 0) return true;
    if (!place) {
      return Boolean(
        draft.name?.trim() ||
          draft.address?.trim() ||
          draft.notes?.trim() ||
          draft.tags?.length
      );
    }
    return JSON.stringify(toDraftSnapshot(draft, tagGroups)) !== JSON.stringify(toDraftSnapshot(place, groupsFromTags(place.tags ?? [], place.tagGroups)));
  }, [draft, files.length, place, tagGroups]);

  const closeWithDraftGuard = useCallback(() => {
    if (hasDraftChanges && !window.confirm("当前记录还没有保存，确定关闭吗？")) return;
    onClose();
  }, [hasDraftChanges, onClose]);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      closeWithDraftGuard();
    }
    window.addEventListener("keydown", closeOnEscape, { capture: true });
    return () => window.removeEventListener("keydown", closeOnEscape, { capture: true });
  }, [closeWithDraftGuard, open]);

  if (!open) return null;

  async function save() {
    const now = nowIso();
    const id = draft.id ?? createId("place");
    const next: FoodPlace = {
      id,
      name: draft.name?.trim() ?? "",
      longitude: Number(draft.longitude),
      latitude: Number(draft.latitude),
      coordinateSystem: draft.coordinateSystem ?? "wgs84",
      address: draft.address?.trim() || undefined,
      city: draft.city?.trim() || undefined,
      layerId: draft.layerId || firstLayerId,
      tags: draft.tags ?? [],
      rating: (draft.rating ?? 4) as FoodRating,
      visitedAt: draft.visitedAt ?? now.slice(0, 10),
      notes: draft.notes ?? "",
      photoIds: draft.photoIds ?? [],
      tagGroups,
      createdAt: draft.createdAt ?? now,
      updatedAt: now
    };
    next.tags = tagsFromGroups(next.tagGroups, draft.tags ?? []);
    const validation = validatePlaceDraft(next);
    if (validation.length > 0) {
      setErrors(validation);
      return;
    }
    if (duplicateWarning && !duplicateConfirmed) {
      setErrors([`${duplicateWarning.message} 如确认仍要保存，请再次点击保存。`]);
      setDuplicateConfirmed(true);
      return;
    }
    const newPhotos = await filesToPhotoAssets(files, id);
    await Promise.all(newPhotos.map((photo) => photoRepository.save(photo)));
    await placeRepository.save({ ...next, photoIds: [...next.photoIds, ...newPhotos.map((photo) => photo.id)] });
    onSaved(place ? "已更新地点" : "已保存地点", id);
    onClose();
  }

  async function requestLocationForRanking() {
    setLocating(true);
    const snapshot = await requestUserLocation();
    setUserLocation(snapshot);
    setLocating(false);
  }

  function runRecognition() {
    const result = searchPlaceCandidates({
      text: recognitionText,
      point,
      userLocation: userLocationToPoint(userLocation),
      historyPlaces: places
    });
    setRecognizedCandidates(result.candidates);
    setBlockedCandidates(result.blockedCandidates);
    if (result.candidates.length === 0) setErrors([result.blockedCandidates.length > 0 ? "候选被阻断，请补充地址或坐标后重试" : "没有识别到可用候选，请补充店名或地址"]);
    else setErrors([]);
  }

  function applyCandidate(candidate: PlaceCandidate) {
    const nextTags = normalizeTags([...candidate.tags, ...(draft.tags ?? [])]);
    setDraft({
      ...draft,
      name: candidate.name || draft.name,
      address: candidate.address ?? draft.address,
      city: candidate.city ?? draft.city ?? "武汉",
      longitude: candidate.longitude ?? draft.longitude,
      latitude: candidate.latitude ?? draft.latitude,
      coordinateSystem: candidate.coordinateSystem ?? draft.coordinateSystem ?? "wgs84",
      notes: [draft.notes, candidate.notes].filter(Boolean).join("\n\n"),
      tags: nextTags,
      tagGroups: groupsFromTags(nextTags, draft.tagGroups)
    });
    setPositionOpen(true);
  }

  function updateTagGroups(nextGroups: typeof tagGroups) {
    setDraft({
      ...draft,
      tagGroups: nextGroups,
      tags: tagsFromGroups(nextGroups, draft.tags ?? [])
    });
  }

  function toggleTag(group: "review" | "cuisine" | "custom", tag: string) {
    const current = tagGroups[group];
    const next = current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag];
    updateTagGroups({ ...tagGroups, [group]: next });
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
        {duplicateWarning ? (
          <div className="form-callout form-callout--warning" data-testid="duplicate-warning">
            <strong>可能重复</strong>
            <span>{duplicateWarning.message} 你可以返回详情编辑原记录，或再次点击保存继续创建。</span>
          </div>
        ) : null}
        {!place ? (
          <div className="editor-section">
            <div className="editor-section__title">智能识别</div>
            <label className="stack-label">
              简介板文本或网页链接
              <textarea
                value={recognitionText}
                onChange={(event) => setRecognitionText(event.target.value)}
                rows={4}
                placeholder="粘贴店铺简介、朋友推荐文本或网页链接。链接内容可由 Agent 解析后回填候选。"
              />
            </label>
            <div className="dialog-actions">
              <button type="button" className="ghost-button" onClick={runRecognition}>识别候选</button>
              <button type="button" className="ghost-button" onClick={() => void requestLocationForRanking()} disabled={locating}>
                {locating ? "定位中..." : "使用当前位置排序"}
              </button>
            </div>
            <div className="form-callout" data-testid="user-location-status">
              <strong>定位排序</strong>
              <span>{describeUserLocation(userLocation)}</span>
            </div>
            {recognizedCandidates.length > 0 ? (
              <div className="candidate-list" data-testid="place-candidate-list">
                {recognizedCandidates.map((candidate) => (
                  <button key={candidate.id} type="button" className="candidate-card" onClick={() => applyCandidate(candidate)}>
                    <strong>{candidate.name}</strong>
                    <small>{candidate.address || "使用地图点击位置"}</small>
                    <span className="candidate-card__meta">
                      {candidate.sourceLabel} · {coordinateAccuracyLabel(candidate.coordinateAccuracy)} · {Math.round(candidate.confidence * 100)}%
                      {typeof candidate.distanceMeters === "number" ? ` · ${formatDistance(candidate.distanceMeters)}` : ""}
                    </span>
                    <span>{candidate.reasons.join(" · ")}</span>
                  </button>
                ))}
              </div>
            ) : null}
            {blockedCandidates.length > 0 ? (
              <div className="form-callout form-callout--warning" data-testid="blocked-candidate-summary">
                <strong>已拦截 {blockedCandidates.length} 个不可直接保存的候选</strong>
                <span>{blockedCandidates.slice(0, 2).map((candidate) => `${candidate.name || "未命名"}：${candidate.blockers?.join("、")}`).join("；")}</span>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="editor-section">
          <div className="editor-section__title">体验记录</div>
          <div className="tag-group-grid">
            <label>
              吃没吃过
              <select
                value={tagGroups.visitStatus ?? ""}
                onChange={(event) => updateTagGroups({ ...tagGroups, visitStatus: (event.target.value || undefined) as VisitStatusTag | undefined })}
              >
                <option value="">未设置</option>
                {Object.entries(VISIT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <div className="quick-chip-field">
              <strong>评价</strong>
              <div className="chip-list">
                {REVIEW_TAG_PRESETS.map((tag) => (
                  <button key={tag} type="button" className={tagGroups.review.includes(tag) ? "chip is-active" : "chip"} onClick={() => toggleTag("review", tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="quick-chip-field">
              <strong>食物种类</strong>
              <div className="chip-list">
                {CUISINE_TAG_PRESETS.map((tag) => (
                  <button key={tag} type="button" className={tagGroups.cuisine.includes(tag) ? "chip is-active" : "chip"} onClick={() => toggleTag("cuisine", tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <label className="stack-label">
            自定义标签
            <input
              value={tagText}
              onChange={(event) => {
                const tags = normalizeTags(event.target.value);
                setDraft({ ...draft, tags, tagGroups: groupsFromTags(tags, draft.tagGroups) });
              }}
              placeholder={SAMPLE_TAGS.slice(0, 4).join("，")}
            />
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
              {files.map((file) => (
                <span key={`${file.name}-${file.size}`} className="pending-photo-chip">
                  <span className="pending-photo-thumb" aria-hidden="true" />
                  {file.name}
                </span>
              ))}
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

function coordinateAccuracyLabel(value: PlaceCandidate["coordinateAccuracy"]): string {
  return {
    exact: "精确坐标",
    approximate: "近似坐标",
    inferred: "点击点推断",
    unknown: "坐标待确认"
  }[value];
}

function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) return `约 ${distanceMeters} 米`;
  return `约 ${(distanceMeters / 1000).toFixed(1)} 公里`;
}

function toDraftSnapshot(draft: Partial<FoodPlace>, tagGroups: ReturnType<typeof groupsFromTags>) {
  return {
    name: draft.name?.trim() ?? "",
    address: draft.address?.trim() ?? "",
    city: draft.city?.trim() ?? "",
    longitude: typeof draft.longitude === "number" ? Number(draft.longitude.toFixed(6)) : undefined,
    latitude: typeof draft.latitude === "number" ? Number(draft.latitude.toFixed(6)) : undefined,
    layerId: draft.layerId ?? "",
    rating: draft.rating ?? 4,
    visitedAt: draft.visitedAt ?? "",
    notes: draft.notes ?? "",
    tags: draft.tags ?? [],
    tagGroups
  };
}
