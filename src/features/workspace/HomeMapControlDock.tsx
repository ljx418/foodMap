import { useMemo, useState } from "react";
import { ChevronDown, Filter, ImageDown, RotateCcw } from "lucide-react";
import type { FoodFilterState, VisitStatusTag } from "../../domain/types";
import { CUISINE_TAG_PRESETS, REVIEW_TAG_PRESETS, VISIT_STATUS_LABELS } from "../../domain/tagGroups";
import { RECOMMENDATION_CUISINE_FILTERS, RECOMMENDATION_REVIEW_FILTERS } from "../../recommendations/tags";

interface HomeMapControlDockProps {
  visiblePlacesCount: number;
  totalPlacesCount: number;
  scanlistVisible: boolean;
  scanlistCount: number;
  dingtuyiVisible: boolean;
  dingtuyiCount: number;
  pendingCount: number;
  highRiskCount: number;
  filter: FoodFilterState;
  onFilterChange: (filter: FoodFilterState) => void;
  onScanlistVisibleChange: (visible: boolean) => void;
  onDingtuyiVisibleChange: (visible: boolean) => void;
  onOpenPendingPlaces: () => void;
  onOpenFullFilter: () => void;
  onOpenSharePoster: () => void;
}

const STATUS_FILTERS: VisitStatusTag[] = ["want", "eaten", "revisit", "avoid"];
const REVIEW_FILTERS = uniqueTags([...RECOMMENDATION_REVIEW_FILTERS, ...REVIEW_TAG_PRESETS]).slice(0, 5);
const CUISINE_FILTERS = uniqueTags([...RECOMMENDATION_CUISINE_FILTERS, ...CUISINE_TAG_PRESETS]).slice(0, 10);

export function HomeMapControlDock({
  visiblePlacesCount,
  totalPlacesCount,
  scanlistVisible,
  scanlistCount,
  dingtuyiVisible,
  dingtuyiCount,
  pendingCount,
  highRiskCount,
  filter,
  onFilterChange,
  onScanlistVisibleChange,
  onDingtuyiVisibleChange,
  onOpenPendingPlaces,
  onOpenFullFilter,
  onOpenSharePoster
}: HomeMapControlDockProps) {
  const [expanded, setExpanded] = useState(false);
  const [quickSheetOpen, setQuickSheetOpen] = useState(false);
  const activeLabels = useMemo(() => {
    const statusLabels = (filter.visitStatuses ?? []).map((status) => VISIT_STATUS_LABELS[status]);
    const verificationLabels = filter.verificationStatus === "pending" ? ["待确认"] : [];
    return [...verificationLabels, ...statusLabels, ...(filter.reviewTags ?? []), ...(filter.cuisineTags ?? [])];
  }, [filter.cuisineTags, filter.reviewTags, filter.verificationStatus, filter.visitStatuses]);
  const activeQuickFilterCount = activeLabels.length;
  const referenceLayerSummary = [
    scanlistVisible ? `榜单 ${scanlistCount}` : undefined,
    dingtuyiVisible ? `钉图易 ${dingtuyiCount}` : undefined
  ].filter(Boolean).join(" · ");
  const visibleScopeText = `${visiblePlacesCount}/${totalPlacesCount} 个人地点`;
  const activeFilterSummary = activeLabels.length > 0 ? activeLabels.slice(0, 4).join("、") : "未启用标签筛选";
  const hiddenReferenceLayers = [
    scanlistVisible ? undefined : "榜单已隐藏",
    dingtuyiVisible ? undefined : "参考已隐藏"
  ].filter(Boolean);
  const filterSummary = [
    visibleScopeText,
    activeFilterSummary,
    referenceLayerSummary ? `参考层：${referenceLayerSummary}` : hiddenReferenceLayers.join("、")
  ].filter(Boolean).join(" · ");

  function toggleVisitStatus(status: VisitStatusTag) {
    onFilterChange({ ...filter, visitStatuses: toggleArrayValue(filter.visitStatuses ?? [], status) });
  }

  function toggleReviewTag(tag: string) {
    onFilterChange({ ...filter, reviewTags: toggleArrayValue(filter.reviewTags ?? [], tag) });
  }

  function toggleCuisineTag(tag: string) {
    onFilterChange({ ...filter, cuisineTags: toggleArrayValue(filter.cuisineTags ?? [], tag) });
  }

  function clearQuickFilters() {
    onFilterChange({ ...filter, visitStatuses: [], reviewTags: [], cuisineTags: [], verificationStatus: "all" });
  }

  function togglePendingPlaces() {
    if (filter.verificationStatus === "pending") {
      onFilterChange({ ...filter, verificationStatus: "all" });
      return;
    }
    onOpenPendingPlaces();
  }

  function toggleQuickFilters() {
    if (isMobileViewport()) {
      setQuickSheetOpen(true);
      return;
    }
    setExpanded((current) => !current);
  }

  function renderQuickFilterControls() {
    return (
      <>
        <div className="quick-switch-group" aria-label="到访状态">
          <span className="quick-switch-group__label">状态</span>
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              className={filter.visitStatuses?.includes(status) ? "quick-switch is-active" : "quick-switch"}
              onClick={() => toggleVisitStatus(status)}
              aria-pressed={filter.visitStatuses?.includes(status) ?? false}
            >
              {VISIT_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
        <div className="quick-switch-group" aria-label="评价">
          <span className="quick-switch-group__label">评价</span>
          {REVIEW_FILTERS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={filter.reviewTags?.includes(tag) ? "quick-switch is-active" : "quick-switch"}
              onClick={() => toggleReviewTag(tag)}
              aria-pressed={filter.reviewTags?.includes(tag) ?? false}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="quick-switch-group" aria-label="菜系">
          <span className="quick-switch-group__label">菜系</span>
          {CUISINE_FILTERS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={filter.cuisineTags?.includes(tag) ? "quick-switch is-active" : "quick-switch"}
              onClick={() => toggleCuisineTag(tag)}
              aria-pressed={filter.cuisineTags?.includes(tag) ?? false}
            >
              {tag}
            </button>
          ))}
        </div>
        {activeQuickFilterCount > 0 ? (
          <button type="button" className="quick-switch quick-switch--muted" onClick={clearQuickFilters}>
            <RotateCcw size={14} aria-hidden="true" />
            清空
          </button>
        ) : null}
      </>
    );
  }

  return (
    <section
      className={expanded ? "home-filter-dock is-expanded" : "home-filter-dock"}
      data-testid="home-filter-dock"
      aria-label="首页筛选和图层开关"
      onKeyDown={(event) => {
        if (event.key === "Escape" && quickSheetOpen) {
          setQuickSheetOpen(false);
          return;
        }
        if (event.key === "Escape" && expanded) {
          setExpanded(false);
        }
      }}
    >
      <div className="home-filter-dock__main">
        <div className="home-filter-dock__title">
          <span>首页筛选</span>
          <small>
            {visiblePlacesCount}/{totalPlacesCount} 个人
            {referenceLayerSummary ? ` · ${referenceLayerSummary}` : ""}
          </small>
        </div>
        <button
          type="button"
          className={scanlistVisible ? "quick-switch quick-switch--scanlist is-active" : "quick-switch quick-switch--scanlist"}
          onClick={() => onScanlistVisibleChange(!scanlistVisible)}
          aria-pressed={scanlistVisible}
          data-testid="quick-scanlist-toggle"
        >
          榜单
          <span>{scanlistCount}</span>
        </button>
        <button
          type="button"
          className={dingtuyiVisible ? "quick-switch quick-switch--dingtuyi is-active" : "quick-switch quick-switch--dingtuyi"}
          onClick={() => onDingtuyiVisibleChange(!dingtuyiVisible)}
          aria-pressed={dingtuyiVisible}
          aria-label="参考图层：钉图易分享"
          data-testid="quick-dingtuyi-toggle"
          title="显示或隐藏钉图易分享图层"
        >
          参考
          <span>{dingtuyiCount}</span>
        </button>
        {pendingCount > 0 ? (
          <button
            type="button"
            className={filter.verificationStatus === "pending" ? "quick-switch quick-switch--pending is-active" : "quick-switch quick-switch--pending"}
            onClick={togglePendingPlaces}
            aria-pressed={filter.verificationStatus === "pending"}
            data-testid="quick-pending-toggle"
            title={highRiskCount > 0 ? `待确认 ${pendingCount} 个，其中高风险位置 ${highRiskCount} 个` : `待确认 ${pendingCount} 个`}
          >
            待确认
            <span>{pendingCount}</span>
            {highRiskCount > 0 ? <em>高风险 {highRiskCount}</em> : null}
          </button>
        ) : null}
        {activeQuickFilterCount > 0 ? (
          <div className="home-filter-dock__active" aria-label="已启用快捷筛选">
            {activeLabels.slice(0, 3).map((label) => (
              <span key={label}>{label}</span>
            ))}
            {activeQuickFilterCount > 3 ? <span>+{activeQuickFilterCount - 3}</span> : null}
          </div>
        ) : (
          <span className="home-filter-dock__hint">按标签筛选地图</span>
        )}
        <div className="home-filter-dock__actions">
          <button
            type="button"
            className="quick-switch quick-switch--more"
            onClick={toggleQuickFilters}
            aria-expanded={expanded || quickSheetOpen}
            data-testid="home-filter-expand"
          >
            <ChevronDown size={15} aria-hidden="true" />
            <span className="quick-switch__desktop-label">{expanded ? "收起" : "展开"}</span>
            <span className="quick-switch__mobile-label">{activeQuickFilterCount > 0 ? `标签 ${activeQuickFilterCount}` : "标签"}</span>
          </button>
          <button
            type="button"
            className="quick-switch quick-switch--more quick-switch--icon quick-switch--full-filter"
            onClick={onOpenFullFilter}
            aria-label="打开完整筛选"
            data-testid="home-full-filter"
          >
            <Filter size={15} aria-hidden="true" />
            <span className="quick-switch__text">更多</span>
          </button>
          <button
            type="button"
            className="quick-switch quick-switch--more quick-switch--icon quick-switch--share"
            onClick={onOpenSharePoster}
            data-testid="home-share-poster"
            aria-label="分享图"
            title="分享图"
          >
            <ImageDown size={15} aria-hidden="true" />
            <span className="quick-switch__text">分享图</span>
          </button>
        </div>
      </div>
      <div className="home-filter-dock__summary" data-testid="home-filter-summary" title={filterSummary}>
        {filterSummary}
      </div>
      <div className="home-filter-dock__legend" data-testid="map-pin-legend" aria-label="图钉颜色说明">
        <span><i className="legend-dot legend-dot--verified" aria-hidden="true" />已核验</span>
        <span><i className="legend-dot legend-dot--pending" aria-hidden="true" />待确认</span>
        <span><i className="legend-dot legend-dot--scanlist" aria-hidden="true" />榜单</span>
        <span><i className="legend-dot legend-dot--dingtuyi" aria-hidden="true" />钉图易</span>
      </div>
      {expanded ? (
        <div className="home-filter-dock__expanded">
          {renderQuickFilterControls()}
        </div>
      ) : null}
      {quickSheetOpen ? (
        <div className="sheet-backdrop quick-filter-sheet-backdrop" onClick={() => setQuickSheetOpen(false)}>
          <div className="sheet quick-filter-sheet" data-testid="quick-filter-sheet" role="dialog" aria-modal="true" aria-labelledby="quick-filter-title" onClick={(event) => event.stopPropagation()}>
            <div className="sheet__header">
              <h2 id="quick-filter-title">快捷标签</h2>
              <button type="button" onClick={() => setQuickSheetOpen(false)}>完成</button>
            </div>
            <div className="quick-filter-sheet__body">
              {activeQuickFilterCount > 0 ? (
                <div className="quick-filter-sheet__active" aria-label="当前快捷筛选">
                  {activeLabels.map((label) => <span key={label}>{label}</span>)}
                </div>
              ) : null}
              {renderQuickFilterControls()}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
}

function toggleArrayValue<T>(items: T[], value: T): T[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

function uniqueTags(tags: string[]): string[] {
  return Array.from(new Set(tags));
}
