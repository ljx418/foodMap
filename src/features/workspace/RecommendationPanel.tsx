import { BookmarkPlus, ChevronDown, ListOrdered, MapPin, Star } from "lucide-react";
import { useMemo, useState } from "react";
import type { AmapScanlistRecommendation } from "../../recommendations/types";
import { evaluateRecommendation } from "../../recommendations/verification";

interface Props {
  recommendations: AmapScanlistRecommendation[];
  selectedId?: string;
  onSelect: (sourceId: string) => void;
  onSave: (sourceId: string) => void;
}

export function RecommendationPanel({ recommendations, selectedId, onSelect, onSave }: Props) {
  const [district, setDistrict] = useState("");
  const [listExpanded, setListExpanded] = useState(!selectedId);
  const districts = useMemo(() => Array.from(new Set(recommendations.map((item) => item.district))).sort(), [recommendations]);
  const visible = useMemo(() => {
    return recommendations
      .filter((item) => !district || item.district === district)
      .sort((a, b) => b.score - a.score);
  }, [recommendations, district]);
  const selected = recommendations.find((item) => item.sourceId === selectedId);
  const selectedQuality = selected ? evaluateRecommendation(selected) : undefined;
  const selectedHasCoordinate = typeof selected?.longitude === "number" && typeof selected?.latitude === "number";

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
          {selected.coverImageUrl ? (
            <figure className="recommendation-media">
              <img src={selected.coverImageUrl} alt={selected.coverImageAlt || selected.name} loading="lazy" />
              <figcaption>高德公开榜单图片 · 已核对门店名称</figcaption>
            </figure>
          ) : null}
          <h2>{selected.name}</h2>
          <div className="recommendation-score"><Star size={16} /> 榜单分 {selected.score}</div>
          <p>{selected.summaryReview}</p>
          <div className="meta-list">
            <span><MapPin size={15} /> {selected.address}</span>
            <span>{selectedHasCoordinate ? (selected.locationAccuracy === "exact" ? "精确坐标，可上图" : "近似位置，建议收藏后手动校准") : "未通过坐标核验，暂不上图"}</span>
            {selectedQuality ? <span>核验 {selectedQuality.status} · 置信度 {Math.round(selectedQuality.confidence * 100)}%</span> : null}
          </div>
          {selectedQuality && selectedQuality.warnings.length > 0 ? (
            <div className="verification-warning">
              {selectedQuality.warnings.map((warning) => <span key={warning}>{warning}</span>)}
            </div>
          ) : null}
          <div className="chip-list">
            {selected.tags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
          </div>
          {selected.publicReviewSnippets.length > 0 ? (
            <div className="review-snippets">
              {selected.publicReviewSnippets.map((snippet) => <blockquote key={snippet}>{snippet}</blockquote>)}
            </div>
          ) : null}
          <button type="button" className="primary-button" onClick={() => onSave(selected.sourceId)} disabled={!selectedQuality?.mappable}>
            <BookmarkPlus size={17} /> {selectedQuality?.mappable ? "收藏为个人记录" : "未核验，不能收藏为地点"}
          </button>
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
                <small>{item.district} · {item.score} 分 · {item.tags.slice(0, 2).join(" / ")}</small>
                <small>核验 {evaluateRecommendation(item).status}</small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
