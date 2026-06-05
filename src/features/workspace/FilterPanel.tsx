import { collectCities, collectTags } from "../../domain/filters";
import type { FoodFilterState, FoodLayer, FoodPlace, FoodRating } from "../../domain/types";

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
  const cities = collectCities(places);

  return (
    <div className="sheet" data-testid="filter-panel">
      <div className="sheet__header">
        <h2>筛选</h2>
        <button type="button" onClick={onClose}>完成</button>
      </div>
      <div className="form-grid">
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
      <button type="button" className="ghost-button" onClick={() => onChange({ keyword: filter.keyword, layerIds: [], tags: [] })}>
        清空筛选
      </button>
    </div>
  );
}
