import { BookmarkPlus, ChevronDown, Copy, ExternalLink, ListOrdered, MapPin, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildExternalMapLink, recommendationToExternalMapTarget } from "../../domain/externalMapLinks";
import { normalizeTags } from "../../domain/validators";
import { getImageEvidenceView } from "../../recommendations/evidence";
import { getRecommendationFilterTags } from "../../recommendations/tags";
import type { AmapScanlistRecommendation } from "../../recommendations/types";
import { evaluateRecommendation } from "../../recommendations/verification";

interface Props {
  recommendations: AmapScanlistRecommendation[];
  selectedId?: string;
  onSelect: (sourceId: string) => void;
  onSave: (sourceId: string) => void | Promise<void>;
}

export function RecommendationPanel({ recommendations, selectedId, onSelect, onSave }: Props) {
  const [district, setDistrict] = useState("");
  const [listExpanded, setListExpanded] = useState(!selectedId);
  const [copyState, setCopyState] = useState("");
  const [tagText, setTagText] = useState("");
  const [tagOverrides, setTagOverrides] = useState<Record<string, string[]>>(() => readRecommendationTagOverrides());
  const [savingSourceId, setSavingSourceId] = useState<string | undefined>();
  const districts = useMemo(() => Array.from(new Set(recommendations.map((item) => item.district))).sort(), [recommendations]);
  const visible = useMemo(() => {
    return recommendations
      .filter((item) => !district || item.district === district)
      .sort((a, b) => b.score - a.score);
  }, [recommendations, district]);
  const selected = recommendations.find((item) => item.sourceId === selectedId);
  const selectedQuality = selected ? evaluateRecommendation(selected) : undefined;
  const imageEvidence = selected ? getImageEvidenceView(selected) : undefined;
  const selectedTags = selected ? (tagOverrides[selected.sourceId] ?? getRecommendationFilterTags(selected)) : [];
  const selectedHasCoordinate = typeof selected?.longitude === "number" && typeof selected?.latitude === "number";
  const mapLink = selected ? buildExternalMapLink(recommendationToExternalMapTarget(selected)) : undefined;

  useEffect(() => {
    setTagText("");
  }, [selectedId]);

  async function copyFallback() {
    if (!mapLink) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(mapLink.fallbackText);
      setCopyState("已复制");
    } catch {
      setCopyState("复制失败");
    }
  }

  function updateSelectedTags(tags: string[]) {
    if (!selected) return;
    const normalized = normalizeTags(tags);
    const next = { ...tagOverrides, [selected.sourceId]: normalized };
    setTagOverrides(next);
    writeRecommendationTagOverrides(next);
  }

  function addSelectedTags() {
    const additions = normalizeTags(tagText);
    if (additions.length === 0) return;
    setTagText("");
    updateSelectedTags([...selectedTags, ...additions]);
  }

  function removeSelectedTag(tag: string) {
    updateSelectedTags(selectedTags.filter((item) => item !== tag));
  }

  async function saveSelected() {
    if (!selected || !selectedQuality?.mappable) return;
    setSavingSourceId(selected.sourceId);
    try {
      await onSave(selected.sourceId);
    } finally {
      setSavingSourceId(undefined);
    }
  }

  return (
    <div className="recommendation-panel" data-testid="recommendation-panel">
      <div className="recommendation-toolbar">
        <strong>高德扫街榜</strong>
        {listExpanded ? (
          <select value={district} onChange={(event) => setDistrict(event.target.value)} aria-label="扫街榜行政区">
            <option value="">全部区域</option>
            {districts.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        ) : null}
      </div>
      {selected ? (
        <section className="recommendation-detail" data-testid="recommendation-detail">
          <div className="eyebrow">#{selected.rank} · {selected.district}</div>
          <h2>{selected.name}</h2>
          <div className="recommendation-score"><Star size={16} /> 榜单分 {selected.score}</div>
          <div className="recommendation-primary-actions">
            <button type="button" className="primary-button" onClick={() => void saveSelected()} disabled={!selectedQuality?.mappable || savingSourceId === selected.sourceId}>
              <BookmarkPlus size={17} /> {selectedQuality?.mappable ? (savingSourceId === selected.sourceId ? "收藏中" : "加入我的收藏") : "未核验，不能收藏为地点"}
            </button>
          </div>
          <div className="detail-tags-editor" aria-label="扫街榜标签">
            <div className="chip-list detail-priority-tags">
              {selectedTags.length > 0 ? selectedTags.map((tag) => (
                <button key={tag} type="button" className="chip chip-editable" onClick={() => removeSelectedTag(tag)} title={`移除 ${tag}`}>
                  {tag}<span aria-hidden="true">×</span>
                </button>
              )) : <span className="tag-empty-hint">暂无标签</span>}
            </div>
            <div className="tag-edit-row">
              <input
                value={tagText}
                onChange={(event) => setTagText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSelectedTags();
                  }
                }}
                placeholder="添加自定义标签，用逗号分隔"
                aria-label="添加扫街榜自定义标签"
              />
              <button type="button" className="ghost-button" onClick={addSelectedTags} disabled={tagText.trim().length === 0}>添加</button>
            </div>
          </div>
          {imageEvidence?.imageUrl && imageEvidence.verified ? (
            <figure className="recommendation-media">
              <img src={imageEvidence.imageUrl} alt={imageEvidence.imageAlt || selected.name} loading="lazy" />
              <figcaption>{imageEvidence.label}</figcaption>
            </figure>
          ) : (
            <div className="recommendation-media-fallback" data-testid="image-evidence-fallback">
              {imageEvidence?.label ?? "暂无可核验公开图片"}
            </div>
          )}
          <p>{selected.summaryReview}</p>
          <div className="meta-list">
            <span><MapPin size={15} /> {selected.address}</span>
            <span>{selectedHasCoordinate ? (selected.locationAccuracy === "exact" ? "精确坐标，可上图" : "近似位置，建议收藏后手动校准") : "未通过坐标核验，暂不上图"}</span>
            {selectedQuality ? <span>核验 {selectedQuality.status} · 置信度 {Math.round(selectedQuality.confidence * 100)}%</span> : null}
            {imageEvidence ? <span>图片证据 {imageEvidence.status} · {imageEvidence.observedAt ? new Date(imageEvidence.observedAt).toLocaleDateString("zh-CN") : "无观测时间"}</span> : null}
          </div>
          {imageEvidence ? (
            <div className={imageEvidence.verified ? "evidence-box is-verified" : "evidence-box"} data-testid="image-evidence-status">
              <strong>{imageEvidence.verified ? "图片证据已匹配" : "图片证据未通过"}</strong>
              <span>{imageEvidence.label}</span>
              {imageEvidence.sourceUrl ? <a href={imageEvidence.sourceUrl} target="_blank" rel="noreferrer">查看公开来源</a> : null}
            </div>
          ) : null}
          {selectedQuality && selectedQuality.warnings.length > 0 ? (
            <div className="verification-warning">
              {selectedQuality.warnings.map((warning) => <span key={warning}>{warning}</span>)}
            </div>
          ) : null}
          {mapLink ? (
            <div className="external-map-actions" data-testid="recommendation-map-actions">
              {mapLink.primaryHref ? (
                <a className="primary-button" href={mapLink.primaryHref} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} /> {mapLink.primaryLabel}
                </a>
              ) : (
                <button type="button" className="primary-button" disabled title={mapLink.disabledReason}>
                  <ExternalLink size={16} /> {mapLink.primaryLabel}
                </button>
              )}
              <button type="button" className="ghost-button" onClick={() => void copyFallback()}>
                <Copy size={16} /> {copyState || mapLink.fallbackLabel}
              </button>
              {mapLink.secondaryLinks.map((link) => (
                <a key={link.label} className="ghost-button" href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
              ))}
            </div>
          ) : null}
          {selected.publicReviewSnippets.length > 0 ? (
            <div className="review-snippets">
              {selected.publicReviewSnippets.map((snippet) => <blockquote key={snippet}>{snippet}</blockquote>)}
            </div>
          ) : null}
        </section>
      ) : null}
      <button
        type="button"
        className={listExpanded ? "recommendation-list-toggle is-open" : "recommendation-list-toggle"}
        onClick={() => setListExpanded((expanded) => !expanded)}
        aria-expanded={listExpanded}
        data-testid="recommendation-list-toggle"
      >
        <span><ListOrdered size={16} /> {listExpanded ? "收起榜单" : `展开完整榜单 (${visible.length})`}</span>
        <ChevronDown size={16} />
      </button>
      {listExpanded ? (
        <div className="recommendation-list">
          {visible.map((item) => (
            <button
              type="button"
              key={item.sourceId}
              className={item.sourceId === selectedId ? "recommendation-item is-active" : "recommendation-item"}
              onClick={() => {
                onSelect(item.sourceId);
                setListExpanded(false);
              }}
            >
              <span className="recommendation-rank">{item.rank}</span>
              <span>
                <strong>{item.name}</strong>
                <small>{item.district} · {item.score} 分 · {getRecommendationFilterTags(item).slice(0, 2).join(" / ")}</small>
                <small>核验 {evaluateRecommendation(item).status}</small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const RECOMMENDATION_TAG_OVERRIDES_KEY = "foodmap.recommendationTagOverrides.v1";

function readRecommendationTagOverrides(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECOMMENDATION_TAG_OVERRIDES_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, value]) => Array.isArray(value))
        .map(([key, value]) => [key, normalizeTags(value as string[])])
    );
  } catch {
    return {};
  }
}

function writeRecommendationTagOverrides(value: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RECOMMENDATION_TAG_OVERRIDES_KEY, JSON.stringify(value));
}
