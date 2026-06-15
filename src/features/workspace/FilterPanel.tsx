import { collectCities, collectGroupedTags, collectTags } from "../../domain/filters";
import type { FoodFilterState, FoodLayer, FoodPlace, FoodRating, VisitStatusTag } from "../../domain/types";
import { VISIT_STATUS_LABELS } from "../../domain/tagGroups";
import { AMAP_WUHAN_SCANLIST } from "../../recommendations/amapWuhanScanlist";
import { collectRecommendationDistricts } from "../../recommendations/filters";
import { collectRecommendationGroupedTags } from "../../recommendations/tags";

interface Props {
  open: boolean;
  filter: FoodFilterState;
  places: FoodPlace[];
  layers: FoodLayer[];
  onChange: (filter: FoodFilterState) => void;
  onClose: () => void;
}

export function FilterPanel({ open, filter, places, layers, onChange, onClose }: Props) {
  if (!open) return null;
  const tags = collectTags(places);
  const personalGroupedTags = collectGroupedTags(places);
  const recommendationGroupedTags = collectRecommendationGroupedTags(AMAP_WUHAN_SCANLIST);
  const groupedTags = {
    review: mergeTags(personalGroupedTags.review, recommendationGroupedTags.review),
    cuisine: mergeTags(personalGroupedTags.cuisine, recommendationGroupedTags.cuisine)
  };
  const cities = collectCities(places);
  const districts = collectRecommendationDistricts(AMAP_WUHAN_SCANLIST);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" data-testid="filter-panel" role="dialog" aria-modal="true" aria-labelledby="filter-panel-title" onClick={(event) => event.stopPropagation()}>
      <div className="sheet__header">
        <h2 id="filter-panel-title">筛选</h2>
        <button type="button" onClick={onClose}>完成</button>
      </div>
      <div className="form-grid">
        <label>
          来源
          <select value={filter.source ?? "all"} onChange={(event) => onChange({ ...filter, source: event.target.value as FoodFilterState["source"] })}>
            <option value="all">全部来源</option>
            <option value="personal">个人记录</option>
            <option value="recommendation">推荐图钉</option>
          </select>
        </label>
        <label>
          城市
          <select value={filter.city ?? ""} onChange={(event) => onChange({ ...filter, city: event.target.value || undefined })}>
            <option value="">全部城市</option>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
        <label>
          最低评分
          <select
            value={filter.minRating ?? ""}
            onChange={(event) => onChange({ ...filter, minRating: event.target.value ? (Number(event.target.value) as FoodRating) : undefined })}
          >
            <option value="">不限</option>
            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} 星以上</option>)}
          </select>
        </label>
        <label>
          商圈/区域
          <select value={filter.district ?? ""} onChange={(event) => onChange({ ...filter, district: event.target.value || undefined })}>
            <option value="">全部区域</option>
            {districts.map((district) => <option key={district} value={district}>{district}</option>)}
          </select>
        </label>
        <label>
          核验状态
          <select value={filter.verificationStatus ?? "all"} onChange={(event) => onChange({ ...filter, verificationStatus: event.target.value as FoodFilterState["verificationStatus"] })}>
            <option value="all">全部状态</option>
            <option value="verified">已核验可上图</option>
            <option value="approximate">近似坐标</option>
            <option value="conflict">冲突</option>
            <option value="pending">待核验</option>
          </select>
        </label>
        <label>
          地图中心距离
          <select
            value={filter.distanceKm ?? ""}
            onChange={(event) => onChange({
              ...filter,
              distanceKm: event.target.value ? Number(event.target.value) : undefined,
              distanceCenter: event.target.value ? { longitude: 114.3055, latitude: 30.5928 } : undefined
            })}
          >
            <option value="">不限</option>
            <option value="1">1 公里内</option>
            <option value="3">3 公里内</option>
            <option value="5">5 公里内</option>
            <option value="10">10 公里内</option>
          </select>
        </label>
        <label>
          开始到访
          <input type="date" value={filter.visitedFrom ?? ""} onChange={(event) => onChange({ ...filter, visitedFrom: event.target.value || undefined })} />
        </label>
        <label>
          结束到访
          <input type="date" value={filter.visitedTo ?? ""} onChange={(event) => onChange({ ...filter, visitedTo: event.target.value || undefined })} />
        </label>
      </div>
      <div className="chip-section">
        <strong>图层</strong>
        <div className="chip-list">
          {layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              className={filter.layerIds.includes(layer.id) ? "chip is-active" : "chip"}
              onClick={() => {
                const selected = filter.layerIds.includes(layer.id)
                  ? filter.layerIds.filter((id) => id !== layer.id)
                  : [...filter.layerIds, layer.id];
                onChange({ ...filter, layerIds: selected });
              }}
            >
              {layer.name}
            </button>
          ))}
        </div>
      </div>
      <div className="chip-section">
        <strong>标签</strong>
        <div className="chip-list">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={filter.tags.includes(tag) ? "chip is-active" : "chip"}
              onClick={() => {
                const selected = filter.tags.includes(tag) ? filter.tags.filter((item) => item !== tag) : [...filter.tags, tag];
                onChange({ ...filter, tags: selected });
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="chip-section">
        <strong>吃没吃过</strong>
        <div className="chip-list">
          {Object.entries(VISIT_STATUS_LABELS).map(([status, label]) => (
            <button
              key={status}
              type="button"
              className={filter.visitStatuses?.includes(status as VisitStatusTag) ? "chip is-active" : "chip"}
              onClick={() => {
                const current = filter.visitStatuses ?? [];
                const selected = current.includes(status as VisitStatusTag) ? current.filter((item) => item !== status) : [...current, status as VisitStatusTag];
                onChange({ ...filter, visitStatuses: selected });
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="chip-section">
        <strong>评价标签</strong>
        <div className="chip-list">
          {groupedTags.review.map((tag) => (
            <button
              key={tag}
              type="button"
              className={filter.reviewTags?.includes(tag) ? "chip is-active" : "chip"}
              onClick={() => {
                const current = filter.reviewTags ?? [];
                const selected = current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag];
                onChange({ ...filter, reviewTags: selected });
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="chip-section">
        <strong>食物种类</strong>
        <div className="chip-list">
          {groupedTags.cuisine.map((tag) => (
            <button
              key={tag}
              type="button"
              className={filter.cuisineTags?.includes(tag) ? "chip is-active" : "chip"}
              onClick={() => {
                const current = filter.cuisineTags ?? [];
                const selected = current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag];
                onChange({ ...filter, cuisineTags: selected });
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="ghost-button" onClick={() => onChange({ keyword: filter.keyword, layerIds: [], tags: [], visitStatuses: [], reviewTags: [], cuisineTags: [], source: "all", verificationStatus: "all" })}>
        清空筛选
      </button>
      </div>
    </div>
  );
}

function mergeTags(primary: string[], secondary: string[]): string[] {
  return Array.from(new Set([...primary, ...secondary])).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}
