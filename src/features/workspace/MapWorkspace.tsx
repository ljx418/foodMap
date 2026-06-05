import { useEffect, useMemo, useState } from "react";
import { Download, List, PanelRightOpen, Plus, Share2, SlidersHorizontal, Sparkles, Upload, X } from "lucide-react";
import { useFoodMapAgentBridge } from "../../agent/FoodMapAgentBridge";
import { EmptyState } from "../../components/EmptyState";
import { EMPTY_FILTER } from "../../domain/filters";
import { DEFAULT_CENTER, type FoodPlace } from "../../domain/types";
import { placeRepository } from "../../persistence/placeRepository";
import { photoRepository } from "../../persistence/photoRepository";
import { FilterPanel } from "./FilterPanel";
import { ImportExportDialog } from "./ImportExportDialog";
import { LayerPanel } from "./LayerPanel";
import { MapCanvas } from "./MapCanvas";
import { PlaceDetailDrawer } from "./PlaceDetailDrawer";
import { PlaceList } from "./PlaceList";
import { PlaceEditorModal } from "./PlaceEditorModal";
import { RecommendationPanel } from "./RecommendationPanel";
import { ShareSnapshotDialog } from "./ShareSnapshotDialog";
import { useFoodMapData } from "./useFoodMapData";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { AMAP_WUHAN_SCANLIST } from "../../recommendations/amapWuhanScanlist";
import { evaluateRecommendation, getMappableRecommendations, getPinCandidateRecommendations } from "../../recommendations/verification";
import {
  RECOMMENDATION_LAYER,
  recommendationMapId,
  recommendationToFoodPlace,
  recommendationToMapPlace,
  sourceIdFromMapId
} from "../../recommendations/recommendationUtils";

type MobilePanelMode = "layers" | "places" | "detail" | "tools";
type WorkspaceUiMode = "idle" | "display" | "list" | "detail" | "recommendation" | "tools" | "create" | "edit" | "filter" | "importExport" | "share";

export function MapWorkspace({ notify }: { notify: (text: string) => void }) {
  const { places, layers, photos, filter, loading, visiblePlaces, setFilter, reload } = useFoodMapData();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [editingPlace, setEditingPlace] = useState<FoodPlace | undefined>();
  const [pendingPoint, setPendingPoint] = useState<{ longitude: number; latitude: number } | undefined>();
  const [draftPoint, setDraftPoint] = useState<{ longitude: number; latitude: number } | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanelMode | undefined>();
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightView, setRightView] = useState<"list" | "detail" | "recommendations">("list");
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(true);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | undefined>();
  const [recommendationLayerVisible, setRecommendationLayerVisible] = useState(true);

  const selectedPlace = useMemo(() => places.find((place) => place.id === selectedId), [places, selectedId]);
  const editorOpen = Boolean(editingPlace || draftPoint);
  const activeFilterCount = useMemo(() => {
    return [
      filter.city,
      filter.minRating,
      filter.visitedFrom,
      filter.visitedTo,
      filter.layerIds.length > 0 ? filter.layerIds.length : undefined,
      filter.tags.length > 0 ? filter.tags.length : undefined
    ].filter(Boolean).length;
  }, [filter]);
  const hiddenLayerCount = useMemo(() => layers.filter((layer) => !layer.visible).length, [layers]);
  const visibleRecommendations = useMemo(
    () => (recommendationsLoaded && recommendationLayerVisible ? AMAP_WUHAN_SCANLIST : []),
    [recommendationsLoaded, recommendationLayerVisible]
  );
  const mappableRecommendations = useMemo(() => getMappableRecommendations(visibleRecommendations), [visibleRecommendations]);
  const mappableAllRecommendations = useMemo(() => getMappableRecommendations(AMAP_WUHAN_SCANLIST), []);
  const approximateRecommendationCount = useMemo(
    () => mappableAllRecommendations.filter((item) => item.locationAccuracy === "approximate").length,
    [mappableAllRecommendations]
  );
  const recommendationPinCandidates = useMemo(() => getPinCandidateRecommendations(visibleRecommendations), [visibleRecommendations]);
  const recommendationMapPlaces = useMemo(() => recommendationPinCandidates.map(recommendationToMapPlace), [recommendationPinCandidates]);
  const mapPlaces = useMemo(() => [...visiblePlaces, ...recommendationMapPlaces], [visiblePlaces, recommendationMapPlaces]);

  async function deleteSelected() {
    if (!selectedPlace) return;
    await placeRepository.remove(selectedPlace.id);
    await photoRepository.removeByPlace(selectedPlace.id);
    setSelectedId(undefined);
    setMobilePanel(undefined);
    notify("已删除地点");
    await reload();
  }

  function selectPlace(placeId: string) {
    const recommendationSourceId = sourceIdFromMapId(placeId);
    if (recommendationSourceId) {
      setSelectedId(undefined);
      setSelectedRecommendationId(recommendationSourceId);
      setRightPanelOpen(true);
      setRightView("recommendations");
      setMobilePanel("places");
      return;
    }
    setSelectedId(placeId);
    setSelectedRecommendationId(undefined);
    setRightPanelOpen(true);
    setRightView("detail");
    setMobilePanel("detail");
  }

  function loadRecommendations() {
    setRecommendationsLoaded(true);
    setRecommendationLayerVisible(true);
    setRightPanelOpen(true);
    setRightView("recommendations");
    if (!selectedRecommendationId) {
      setSelectedRecommendationId(AMAP_WUHAN_SCANLIST[0]?.sourceId);
    }
    if (isMobileViewport()) setMobilePanel("places");
    notify("已加载高德扫街榜推荐");
  }

  function openMobileList() {
    if (recommendationsLoaded && visibleRecommendations.length > 0) {
      setRightView("recommendations");
      setSelectedRecommendationId(undefined);
    } else {
      setRightView(selectedId ? "detail" : "list");
    }
    setMobilePanel((panel) => panel === "places" ? undefined : "places");
  }

  function selectRecommendation(sourceId: string) {
    setSelectedRecommendationId(sourceId);
    setRightPanelOpen(true);
    setRightView("recommendations");
    setSelectedId(recommendationMapId(sourceId));
    if (isMobileViewport()) setMobilePanel("places");
  }

  async function saveRecommendation(sourceId: string) {
    const recommendation = AMAP_WUHAN_SCANLIST.find((item) => item.sourceId === sourceId);
    if (!recommendation) return;
    if (!evaluateRecommendation(recommendation).mappable) {
      notify("该推荐未通过坐标核验，不能收藏为地图地点");
      throw new Error("推荐项未通过坐标核验，不能收藏为地图地点");
    }
    const wishlistLayer = layers.find((layer) => layer.name === "想去清单") ?? layers[0] ?? RECOMMENDATION_LAYER;
    await placeRepository.save(recommendationToFoodPlace(recommendation, wishlistLayer.id));
    await reload();
    notify("已收藏为个人记录");
  }

  const bridgeOptions = useMemo(
    () => ({
      places,
      visiblePlaces,
      layers,
      photos,
      filter,
      selectedPlaceId: selectedId,
      setFilter,
      selectPlace,
      createDraft: setDraftPoint,
      reload,
      loadRecommendations,
      focusRecommendation: selectRecommendation,
      saveRecommendation
    }),
    [places, visiblePlaces, layers, photos, filter, selectedId, setFilter, reload]
  );
  useFoodMapAgentBridge(bridgeOptions);

  useEffect(() => {
    function closeTopLayer(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (editorOpen) {
        setEditingPlace(undefined);
        setDraftPoint(undefined);
        setPendingPoint(undefined);
        return;
      }
      if (filterOpen) {
        setFilterOpen(false);
        return;
      }
      if (shareOpen) {
        setShareOpen(false);
        return;
      }
      if (importOpen) {
        setImportOpen(false);
        return;
      }
      if (mobilePanel) {
        setMobilePanel(undefined);
        return;
      }
      if (pendingPoint) setPendingPoint(undefined);
    }
    window.addEventListener("keydown", closeTopLayer);
    return () => window.removeEventListener("keydown", closeTopLayer);
  }, [editorOpen, filterOpen, importOpen, mobilePanel, pendingPoint, shareOpen]);

  const noFiltered = !loading && places.length > 0 && visiblePlaces.length === 0;
  const uiMode: WorkspaceUiMode = editorOpen || pendingPoint
    ? (editingPlace ? "edit" : "create")
    : filterOpen
      ? "filter"
      : importOpen
        ? "importExport"
        : shareOpen
          ? "share"
          : mobilePanel === "layers" || leftPanelOpen
            ? "display"
            : mobilePanel === "places" || (rightPanelOpen && rightView === "list")
              ? "list"
              : mobilePanel === "tools"
                ? "tools"
              : mobilePanel === "detail" || (rightPanelOpen && rightView === "detail")
                ? "detail"
                : rightPanelOpen && rightView === "recommendations"
                  ? "recommendation"
                  : "idle";
  const mapStatusVisible = uiMode === "idle" || (!isMobileViewport() && uiMode === "recommendation");
  const mobileActionBarVisible = ["idle", "display", "list"].includes(uiMode);

  return (
    <main className="workspace">
      <WorkspaceHeader
        keyword={filter.keyword}
        onKeywordChange={(keyword) => setFilter({ ...filter, keyword })}
        onAdd={() => {
          setMobilePanel(undefined);
          setDraftPoint(DEFAULT_CENTER);
        }}
        onFilter={() => {
          setMobilePanel(undefined);
          setFilterOpen(true);
        }}
        onShare={() => setShareOpen(true)}
        onExport={() => setImportOpen(true)}
        onImport={() => setImportOpen(true)}
        onLoadRecommendations={loadRecommendations}
        onMore={() => setMobilePanel((panel) => panel === "tools" ? undefined : "tools")}
      />
      <div className={`workspace-body${leftPanelOpen ? " has-left-panel" : ""}${rightPanelOpen ? " has-right-panel" : ""}`}>
        <div className="desktop-panel-slot">
          {leftPanelOpen ? (
            <div className="desktop-side-panel">
              <button type="button" className="side-panel-close side-panel-close--left" onClick={() => setLeftPanelOpen(false)} aria-label="收起显示">
                <X size={16} />
              </button>
              <LayerPanel
                layers={layers}
                places={places}
                onReload={reload}
                recommendationControl={{
                  visible: recommendationLayerVisible,
                  total: AMAP_WUHAN_SCANLIST.length,
                  mappable: mappableAllRecommendations.length,
                  approximate: approximateRecommendationCount,
                  onVisibleChange: setRecommendationLayerVisible
                }}
              />
            </div>
          ) : null}
        </div>
        <section className="map-stage">
          {!leftPanelOpen ? (
            <button
              type="button"
              className="side-peek-button side-peek-button--left"
              data-testid="desktop-open-layers"
              onClick={() => setLeftPanelOpen(true)}
              aria-label="展开地图显示"
              title="展开地图显示"
            >
              <SlidersHorizontal size={20} />
            </button>
          ) : null}
          {!rightPanelOpen ? (
            <button
              type="button"
              className="side-peek-button side-peek-button--right"
              data-testid="desktop-open-detail"
              onClick={() => {
                setRightView(selectedId ? "detail" : "list");
                setRightPanelOpen(true);
              }}
              aria-label="展开清单"
              title="展开清单"
            >
              <PanelRightOpen size={20} />
            </button>
          ) : null}
          <MapCanvas
            places={mapPlaces}
            focusedPlaceId={selectedId}
            onPlaceClick={selectPlace}
            onMapClick={(point) => {
              setSelectedId(undefined);
              setPendingPoint(point);
            }}
            notify={notify}
          />
          {mapStatusVisible && (activeFilterCount > 0 || hiddenLayerCount > 0) ? (
            <div className="map-filter-summary" data-testid="map-filter-summary">
              <span>
                当前显示 {visiblePlaces.length} / {places.length} 个地点
                {activeFilterCount > 0 ? `，${activeFilterCount} 组筛选生效` : ""}
                {hiddenLayerCount > 0 ? `，${hiddenLayerCount} 个图层已隐藏` : ""}
              </span>
              <button type="button" onClick={() => setFilter({ ...EMPTY_FILTER, keyword: filter.keyword })}>清空筛选</button>
              <button type="button" onClick={() => setFilterOpen(true)}>调整</button>
              {recommendationsLoaded ? (
                <button type="button" onClick={() => setRecommendationLayerVisible((visible) => !visible)}>
                  {recommendationLayerVisible ? "隐藏扫街榜" : "显示扫街榜"}
                </button>
              ) : null}
            </div>
          ) : null}
          {mapStatusVisible && recommendationsLoaded && activeFilterCount === 0 && hiddenLayerCount === 0 ? (
            <div className="map-filter-summary" data-testid="recommendation-summary">
              <span className="summary-full">扫街榜 {visibleRecommendations.length} 条，已核验图钉 {mappableRecommendations.length} 个，待核验 {visibleRecommendations.length - mappableRecommendations.length} 个</span>
              <span className="summary-compact">扫街榜 {mappableRecommendations.length} 个图钉</span>
              <button type="button" onClick={() => setRecommendationLayerVisible((visible) => !visible)}>
                {recommendationLayerVisible ? "隐藏扫街榜" : "显示扫街榜"}
              </button>
            </div>
          ) : null}
          {pendingPoint ? (
            <div className="map-create-popover" data-testid="map-create-popover">
              <div>
                <strong>在这里新增美食地点</strong>
                <small>
                  {pendingPoint.longitude.toFixed(6)}, {pendingPoint.latitude.toFixed(6)}
                </small>
              </div>
              <div className="row-actions">
                <button type="button" className="ghost-button" onClick={() => setPendingPoint(undefined)}>取消</button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setDraftPoint(pendingPoint);
                    setPendingPoint(undefined);
                  }}
                >
                  新增
                </button>
              </div>
            </div>
          ) : null}
          {noFiltered ? (
            <div className="map-empty-overlay">
              <EmptyState
                title="没有找到符合条件的地点。试试放宽评分、标签或到访时间范围。"
                actions={<button type="button" className="ghost-button" onClick={() => setFilter({ ...EMPTY_FILTER, keyword: filter.keyword })}>清空筛选</button>}
              />
            </div>
          ) : null}
        </section>
        <div className="desktop-panel-slot">
          {rightPanelOpen ? (
            <div className="desktop-side-panel">
              <button type="button" className="side-panel-close side-panel-close--right" onClick={() => setRightPanelOpen(false)} aria-label="收起详情">
                <X size={16} />
              </button>
              {rightView === "recommendations" ? (
                <RecommendationPanel
                  recommendations={AMAP_WUHAN_SCANLIST}
                  selectedId={selectedRecommendationId}
                  onSelect={selectRecommendation}
                  onSave={saveRecommendation}
                />
              ) : rightView === "detail" && selectedPlace ? (
                <PlaceDetailDrawer
                  place={selectedPlace}
                  layers={layers}
                  photos={photos}
                  onAdd={() => setDraftPoint(DEFAULT_CENTER)}
                  onEdit={() => setEditingPlace(selectedPlace)}
                  onDelete={deleteSelected}
                  onBack={() => setRightView("list")}
                />
              ) : (
                <PlaceList
                  places={visiblePlaces}
                  layers={layers}
                  photos={photos}
                  selectedId={selectedId}
                  onSelect={selectPlace}
                  onAdd={() => setDraftPoint(DEFAULT_CENTER)}
                  onImport={() => setImportOpen(true)}
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
      {mobileActionBarVisible ? (
        <div className="mobile-action-bar">
          <button
            type="button"
            className={mobilePanel === "layers" ? "mobile-nav-button is-active" : "mobile-nav-button"}
            onClick={() => setMobilePanel((panel) => panel === "layers" ? undefined : "layers")}
            aria-pressed={mobilePanel === "layers"}
          >
            <SlidersHorizontal size={19} />
            <span>显示</span>
          </button>
          <button
            type="button"
            className="mobile-nav-button mobile-nav-button--primary"
            onClick={() => {
              setDraftPoint(DEFAULT_CENTER);
              setMobilePanel(undefined);
            }}
          >
            <Plus size={22} />
            <span>新增</span>
          </button>
          <button
            type="button"
            className={mobilePanel === "places" ? "mobile-nav-button is-active" : "mobile-nav-button"}
            onClick={openMobileList}
            aria-pressed={mobilePanel === "places"}
          >
            <List size={19} />
            <span>清单</span>
          </button>
        </div>
      ) : null}
      {mobilePanel ? (
        <div className="mobile-panel-backdrop" onClick={() => setMobilePanel(undefined)}>
          <section className="mobile-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-panel-title" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-panel__header">
              <h2 id="mobile-panel-title">{mobilePanel === "layers" ? "地图显示" : mobilePanel === "places" ? (rightView === "recommendations" ? "扫街榜清单" : "地点清单") : mobilePanel === "tools" ? "更多工具" : "地点详情"}</h2>
              <button type="button" className="ghost-button" onClick={() => setMobilePanel(undefined)}>关闭</button>
            </div>
            {mobilePanel === "tools" ? (
              <div className="mobile-tools-grid">
                <button type="button" className="tool-button" onClick={() => { setMobilePanel(undefined); setImportOpen(true); }}>
                  <Upload size={18} /> 导入
                </button>
                <button type="button" className="tool-button" onClick={() => { setMobilePanel(undefined); setImportOpen(true); }}>
                  <Download size={18} /> 导出
                </button>
                <button type="button" className="tool-button" onClick={() => { setMobilePanel(undefined); setShareOpen(true); }}>
                  <Share2 size={18} /> 分享
                </button>
                <button type="button" className="tool-button" onClick={() => { setMobilePanel(undefined); loadRecommendations(); }}>
                  <Sparkles size={18} /> 扫街榜
                </button>
              </div>
            ) : null}
            {mobilePanel === "layers" ? (
              <LayerPanel
                layers={layers}
                places={places}
                onReload={reload}
                recommendationControl={{
                  visible: recommendationLayerVisible,
                  total: AMAP_WUHAN_SCANLIST.length,
                  mappable: mappableAllRecommendations.length,
                  approximate: approximateRecommendationCount,
                  onVisibleChange: setRecommendationLayerVisible
                }}
              />
            ) : null}
            {mobilePanel === "places" ? (
              rightView === "recommendations" ? (
                <RecommendationPanel
                  recommendations={AMAP_WUHAN_SCANLIST}
                  selectedId={selectedRecommendationId}
                  onSelect={selectRecommendation}
                  onSave={saveRecommendation}
                />
              ) : (
                <PlaceList
                  places={visiblePlaces}
                  layers={layers}
                  photos={photos}
                  selectedId={selectedId}
                  onSelect={selectPlace}
                  onAdd={() => setDraftPoint(DEFAULT_CENTER)}
                  onImport={() => setImportOpen(true)}
                />
              )
            ) : null}
            {mobilePanel === "detail" ? (
              <PlaceDetailDrawer
                place={selectedPlace}
                layers={layers}
                photos={photos}
                onAdd={() => setDraftPoint(DEFAULT_CENTER)}
                onEdit={() => setEditingPlace(selectedPlace)}
                onDelete={deleteSelected}
                onBack={() => setMobilePanel("places")}
              />
            ) : null}
          </section>
        </div>
      ) : null}
      <PlaceEditorModal
        open={editorOpen}
        place={editingPlace}
        layers={layers}
        point={draftPoint}
        onClose={() => {
          setEditingPlace(undefined);
          setDraftPoint(undefined);
          setPendingPoint(undefined);
        }}
        onSaved={async (message, placeId) => {
          notify(message);
          setSelectedId(placeId);
          await reload();
        }}
      />
      <FilterPanel open={filterOpen} filter={filter} places={places} layers={layers} onChange={setFilter} onClose={() => setFilterOpen(false)} />
      <ShareSnapshotDialog open={shareOpen} places={places} layers={layers} photos={photos} onClose={() => setShareOpen(false)} notify={notify} />
      <ImportExportDialog open={importOpen} places={places} layers={layers} photos={photos} onClose={() => setImportOpen(false)} notify={notify} />
    </main>
  );
}

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
}
