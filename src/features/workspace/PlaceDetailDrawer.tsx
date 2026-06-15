import { ArrowLeft, CalendarDays, CheckCircle2, Copy, Edit, ExternalLink, MapPin, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { EmptyState } from "../../components/EmptyState";
import { RatingStars } from "../../components/RatingStars";
import { assessCoordinateRisk } from "../../domain/coordinateRisk";
import { buildExternalMapLink, placeToExternalMapTarget } from "../../domain/externalMapLinks";
import { getStoredAmapWebServiceKey, storeAmapWebServiceKey } from "../../domain/liveMapSearch";
import { getLocationStatusBadges, getUserFacingTags } from "../../domain/locationStatus";
import type { PlaceCandidate } from "../../domain/placeRecognition";
import type { FoodLayer, FoodPlace, PhotoAsset } from "../../domain/types";
import { normalizeTags } from "../../domain/validators";

interface Props {
  place?: FoodPlace;
  layers: FoodLayer[];
  photos: PhotoAsset[];
  readonly?: boolean;
  readonlyActions?: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  onBack?: () => void;
  onTagsChange?: (tags: string[]) => void | Promise<void>;
  calibrationCandidates?: PlaceCandidate[];
  onConfirmCalibrationCandidate?: (candidate: PlaceCandidate) => void | Promise<void>;
  onSearchMapCandidates?: (query: string, apiKey: string) => Promise<PlaceCandidate[]>;
  canMovePin?: boolean;
  movingPin?: boolean;
  onStartMovePin?: () => void;
  onCancelMovePin?: () => void;
}

export function PlaceDetailDrawer({
  place,
  layers,
  photos,
  readonly,
  readonlyActions,
  onEdit,
  onDelete,
  onAdd,
  onBack,
  onTagsChange,
  calibrationCandidates = [],
  onConfirmCalibrationCandidate,
  onSearchMapCandidates,
  canMovePin,
  movingPin,
  onStartMovePin,
  onCancelMovePin
}: Props) {
  const [copyState, setCopyState] = useState("");
  const [tagText, setTagText] = useState("");
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [savingTags, setSavingTags] = useState(false);
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const [savingCandidateId, setSavingCandidateId] = useState<string | undefined>();
  const [amapKey, setAmapKey] = useState(() => getStoredAmapWebServiceKey());
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [liveCandidates, setLiveCandidates] = useState<PlaceCandidate[]>([]);
  const [mapSearchStatus, setMapSearchStatus] = useState("");
  const [mapSearchLoading, setMapSearchLoading] = useState(false);
  useEffect(() => {
    setLocalTags(place?.tags ?? []);
  }, [place?.id, place?.tags]);
  useEffect(() => {
    setTagText("");
    setCalibrationOpen(false);
    setSavingCandidateId(undefined);
    setMapSearchQuery([place?.name, place?.address].filter(Boolean).join(" "));
    setLiveCandidates([]);
    setMapSearchStatus("");
  }, [place?.id]);
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
  const mapLink = buildExternalMapLink(placeToExternalMapTarget(place));
  const coordinateRisk = assessCoordinateRisk(place);
  const navigationNeedsCalibration = place.mapAccuracy === "approximate" || localTags.includes("待校准");
  const canCalibrate = !readonly && navigationNeedsCalibration && Boolean(onConfirmCalibrationCandidate);
  const canLiveSearch = !readonly && Boolean(onSearchMapCandidates && onConfirmCalibrationCandidate);
  const statusBadges = getLocationStatusBadges({ ...place, tags: localTags });
  const userFacingTags = getUserFacingTags(localTags);
  async function copyFallback() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(mapLink.fallbackText);
      setCopyState("已复制");
    } catch {
      setCopyState("复制失败");
    }
  }
  async function updateTags(tags: string[]) {
    const normalized = normalizeTags(tags);
    setLocalTags(normalized);
    if (!onTagsChange || readonly) return;
    setSavingTags(true);
    try {
      await onTagsChange(normalized);
    } finally {
      setSavingTags(false);
    }
  }
  async function addTags() {
    const additions = normalizeTags(tagText);
    if (additions.length === 0) return;
    setTagText("");
    await updateTags([...localTags, ...additions]);
  }
  async function removeTag(tag: string) {
    await updateTags(localTags.filter((item) => item !== tag));
  }
  async function confirmCandidate(candidate: PlaceCandidate) {
    if (!onConfirmCalibrationCandidate || readonly) return;
    setSavingCandidateId(candidate.id);
    try {
      await onConfirmCalibrationCandidate(candidate);
      setCalibrationOpen(false);
    } finally {
      setSavingCandidateId(undefined);
    }
  }
  async function searchLiveMapCandidates() {
    if (!onSearchMapCandidates || readonly) return;
    setMapSearchLoading(true);
    setMapSearchStatus("");
    try {
      storeAmapWebServiceKey(amapKey);
      const candidates = await onSearchMapCandidates(mapSearchQuery, amapKey);
      setLiveCandidates(candidates);
      setMapSearchStatus(candidates.length > 0 ? `找到 ${candidates.length} 个高德候选` : "没有搜到可用武汉候选，请补充分店/商圈/道路");
    } catch (error) {
      setLiveCandidates([]);
      setMapSearchStatus(error instanceof Error ? error.message : "地图搜索失败");
    } finally {
      setMapSearchLoading(false);
    }
  }
  const allCalibrationCandidates = [...liveCandidates, ...calibrationCandidates.filter((candidate) => !liveCandidates.some((live) => live.id === candidate.id))];
  return (
    <aside className="detail-drawer" data-testid="place-detail">
      <div className="detail-drawer__topbar">
        <div className="detail-drawer__nav">
          {onBack ? (
            <button type="button" className="ghost-button detail-back-button" onClick={onBack} aria-label="返回清单">
              <ArrowLeft size={16} /> 清单
            </button>
          ) : null}
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
      <div className="detail-drawer__identity">
        <div className="eyebrow" style={{ color: layer?.color }}>{layer?.name ?? "未分组"}</div>
        <h2>{place.name}</h2>
      </div>
      {readonlyActions ? <div className="detail-readonly-actions">{readonlyActions}</div> : null}
      <div className="detail-tags-editor" aria-label="地点标签">
        {statusBadges.length > 0 ? (
          <div className="location-status-strip" aria-label="地点状态">
            {statusBadges.map((badge) => (
              <span key={`${badge.tone}-${badge.label}`} className={`location-status-badge is-${badge.tone}`}>{badge.label}</span>
            ))}
          </div>
        ) : null}
        <div className="chip-list detail-priority-tags">
          {userFacingTags.length > 0 ? userFacingTags.map((tag) => (
            readonly || !onTagsChange ? (
              <span key={tag} className="chip">{tag}</span>
            ) : (
              <button key={tag} type="button" className="chip chip-editable" onClick={() => void removeTag(tag)} title={`移除 ${tag}`}>
                {tag}<span aria-hidden="true">×</span>
              </button>
            )
          )) : <span className="tag-empty-hint">暂无自定义标签</span>}
        </div>
        {!readonly && onTagsChange ? (
          <div className="tag-edit-row">
            <input
              value={tagText}
              onChange={(event) => setTagText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void addTags();
                }
              }}
              placeholder="添加标签，逗号分隔"
              aria-label="添加自定义标签"
            />
            <button type="button" className="ghost-button" onClick={() => void addTags()} disabled={savingTags || tagText.trim().length === 0}>
              {savingTags ? "保存中" : "添加"}
            </button>
          </div>
        ) : null}
      </div>
      {placePhotos.length > 0 ? (
        <div className="detail-hero-photos">
          {placePhotos.slice(0, 3).map((photo) => <img key={photo.id} src={photo.thumbnailDataUrl} alt={photo.fileName} />)}
        </div>
      ) : (
        <div className="detail-photo-placeholder">暂无照片</div>
      )}
      <RatingStars value={place.rating} readonly />
      <div className="meta-list">
        <span><CalendarDays size={15} /> {place.visitedAt}</span>
        {place.city ? <span><MapPin size={15} /> {place.city}</span> : null}
        {place.address ? <span><MapPin size={15} /> {place.address}</span> : null}
      </div>
      {coordinateRisk.level !== "ok" ? (
        <section className={coordinateRisk.level === "blocked" ? "coordinate-risk-card is-blocked" : "coordinate-risk-card"} data-testid="coordinate-risk-card">
          <strong>{coordinateRisk.level === "blocked" ? "坐标风险" : "近似坐标提醒"}</strong>
          {coordinateRisk.reasons.map((reason) => <span key={reason}>{reason}</span>)}
        </section>
      ) : null}
      <div className="external-map-actions" data-testid="external-map-actions">
        {mapLink.primaryHref && !navigationNeedsCalibration ? (
          <a className="primary-button" href={mapLink.primaryHref} target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> {mapLink.primaryLabel}
          </a>
        ) : (
          <button type="button" className="primary-button" disabled title={navigationNeedsCalibration ? "该地点仍待校准，暂不提供精确导航" : mapLink.disabledReason}>
            <ExternalLink size={16} /> {navigationNeedsCalibration ? "待校准，暂不导航" : mapLink.primaryLabel}
          </button>
        )}
        <button type="button" className="ghost-button" onClick={() => void copyFallback()}>
          <Copy size={16} /> {copyState || mapLink.fallbackLabel}
        </button>
        {mapLink.secondaryLinks.map((link) => (
          <a key={link.label} className="ghost-button" href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
        ))}
        {navigationNeedsCalibration ? <span className="map-action-hint">确认地点后解锁地图导航</span> : null}
      </div>
      {canMovePin ? (
        <section className="pin-move-card" data-testid="pin-move-card">
          <div>
            <strong>图钉位置</strong>
            <span>{navigationNeedsCalibration ? "当前点位仍待校准，可以直接挪到真实门店位置。" : "如果图钉和真实门店有偏差，可以随时重新调整。"}</span>
          </div>
          {movingPin ? (
            <button type="button" className="ghost-button" onClick={onCancelMovePin}>取消挪动</button>
          ) : (
            <button type="button" className="ghost-button" onClick={onStartMovePin}>手动挪动图钉</button>
          )}
        </section>
      ) : null}
      {canLiveSearch ? (
        <section className="live-map-search-card" data-testid="live-map-search-card">
          <div>
            <strong>搜索高德校准</strong>
            <span>纯前端调用高德 Web 服务。Key 只保存在本机浏览器，点击候选后才会覆盖图钉坐标。</span>
          </div>
          <label>
            高德 Web 服务 Key
            <input
              value={amapKey}
              onChange={(event) => setAmapKey(event.target.value)}
              placeholder="输入你的高德 Web 服务 Key"
              autoComplete="off"
            />
          </label>
          <div className="live-map-search-card__row">
            <input
              value={mapSearchQuery}
              onChange={(event) => setMapSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void searchLiveMapCandidates();
                }
              }}
              placeholder="店名 / 分店 / 商场 / 道路"
              aria-label="高德地点搜索关键词"
            />
            <button type="button" className="primary-button" onClick={() => void searchLiveMapCandidates()} disabled={mapSearchLoading}>
              <Search size={16} /> {mapSearchLoading ? "搜索中" : "搜索"}
            </button>
          </div>
          {mapSearchStatus ? <span className="live-map-search-card__status">{mapSearchStatus}</span> : null}
          {liveCandidates.length > 0 ? (
            <div className="candidate-list" data-testid="live-map-candidate-list">
              {liveCandidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  className="candidate-card candidate-card--confirm"
                  onClick={() => void confirmCandidate(candidate)}
                  disabled={Boolean(savingCandidateId)}
                >
                  <strong>{candidate.name}</strong>
                  <small>{candidate.address || "高德候选缺少地址"}</small>
                  <span className="candidate-card__meta">
                    {candidate.sourceLabel} · {coordinateAccuracyLabel(candidate.coordinateAccuracy)} · {Math.round(candidate.confidence * 100)}%
                    {typeof candidate.distanceMeters === "number" ? ` · ${formatDistance(candidate.distanceMeters)}` : ""}
                  </span>
                  <span>{candidate.reasons.join(" · ")}</span>
                  <em><CheckCircle2 size={14} /> {savingCandidateId === candidate.id ? "固化中" : "挪到此地点"}</em>
                </button>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
      {canCalibrate ? (
        <section className="calibration-card" data-testid="calibration-card">
          <div>
            <strong>待确认店家</strong>
            <span>当前点位仍待校准。先从候选店家里确认具体门店，再解锁导航和精确分享。</span>
          </div>
          <button
            type="button"
            className="primary-button calibration-primary-button"
            onClick={() => setCalibrationOpen((open) => !open)}
            aria-expanded={calibrationOpen}
            data-testid="calibration-open-candidates"
          >
            <Search size={16} /> {calibrationOpen ? "收起候选" : `确认地点 · ${allCalibrationCandidates.length} 个候选`}
          </button>
          {calibrationOpen ? (
            <div className="calibration-candidate-sheet" role="dialog" aria-label="待确认店家候选" data-testid="calibration-candidate-list">
              <div className="calibration-candidate-sheet__header">
                <strong>候选店家</strong>
                <small>按置信度、坐标精度、历史/榜单命中排序；实时地图搜索可通过 provider 接入。</small>
                <small className="candidate-source-note">来源说明：候选来自本地收藏、榜单线索、文本识别或 Agent 提交的结构化结果，确认前不会覆盖原始记录。</small>
              </div>
              {allCalibrationCandidates.length > 0 ? (
                <div className="candidate-list">
                  {allCalibrationCandidates.map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      className="candidate-card candidate-card--confirm"
                      onClick={() => void confirmCandidate(candidate)}
                      disabled={Boolean(savingCandidateId)}
                    >
                      <strong>{candidate.name}</strong>
                      <small>{candidate.address || "缺少地址，确认后仍保持待校准"}</small>
                      <span className="candidate-card__meta">
                        {candidate.sourceLabel} · {coordinateAccuracyLabel(candidate.coordinateAccuracy)} · {Math.round(candidate.confidence * 100)}%
                        {typeof candidate.distanceMeters === "number" ? ` · ${formatDistance(candidate.distanceMeters)}` : ""}
                      </span>
                      <span>{candidate.reasons.join(" · ")}</span>
                      {candidate.evidenceUrl ? (
                        <span className="candidate-card__evidence">
                          证据：{candidate.evidenceLabel ?? "网页地图搜索"}
                        </span>
                      ) : null}
                      {candidate.screenshotPath ? (
                        <span className="candidate-card__evidence">截图：{candidate.screenshotPath}</span>
                      ) : null}
                      <em><CheckCircle2 size={14} /> {savingCandidateId === candidate.id ? "固化中" : "确认此门店"}</em>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="notes is-muted">暂无可用候选。请先补充分店、商场、道路或地图链接，再由 Agent 提交结构化候选。</p>
              )}
            </div>
          ) : null}
        </section>
      ) : null}
      {place.notes ? <p className="notes">{place.notes}</p> : <p className="notes is-muted">还没有文字记录。</p>}
    </aside>
  );
}

function coordinateAccuracyLabel(value: PlaceCandidate["coordinateAccuracy"]): string {
  if (value === "exact") return "精确坐标";
  if (value === "approximate") return "近似坐标";
  if (value === "inferred") return "推断坐标";
  return "待补坐标";
}

function formatDistance(distance: number): string {
  return distance >= 1000 ? `${(distance / 1000).toFixed(1)} 公里` : `${Math.round(distance)} 米`;
}
