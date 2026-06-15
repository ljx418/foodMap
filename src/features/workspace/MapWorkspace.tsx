import { useEffect, useMemo, useState } from "react";
import { Download, Filter, List, PanelRightOpen, Plus, Share2, SlidersHorizontal, Sparkles, Upload, X } from "lucide-react";
import { useFoodMapAgentBridge } from "../../agent/FoodMapAgentBridge";
import { EmptyState } from "../../components/EmptyState";
import { EMPTY_FILTER, isPendingCalibrationPlace } from "../../domain/filters";
import { getExternalMapCandidatesForPlace } from "../../domain/externalMapCandidates";
import { searchAmapPlaceCandidates } from "../../domain/liveMapSearch";
import { applyManualPinMove, canManuallyMovePlace } from "../../domain/manualPinMove";
import { buildCalibrationCandidates, candidateSolidifiesPrecisePlace } from "../../domain/placeCalibration";
import type { PlaceCandidate } from "../../domain/placeRecognition";
import { DEFAULT_CENTER, type FoodPlace } from "../../domain/types";
import { normalizeTags, nowIso } from "../../domain/validators";
import {
  DINGTUYI_SHARE_LAYER,
  DINGTUYI_WUHAN_FOOD_MARKERS,
  dingtuyiMarkerToMapPlace,
  sourceIdFromDingtuyiMapId
} from "../../externalShares/dingtuyiWuhanFoodShare";
import { placeRepository } from "../../persistence/placeRepository";
import { photoRepository } from "../../persistence/photoRepository";
import { importPersonalFavoritePins } from "../../persistence/personalFavoriteSeed";
import { FilterPanel } from "./FilterPanel";
import { HomeMapControlDock } from "./HomeMapControlDock";
import { ImportExportDialog } from "./ImportExportDialog";
import { LayerPanel } from "./LayerPanel";
import { MapCanvas } from "./MapCanvas";
import { MapPosterDialog } from "./MapPosterDialog";
import { PlaceDetailDrawer } from "./PlaceDetailDrawer";
import { PlaceList } from "./PlaceList";
import { PlaceEditorModal } from "./PlaceEditorModal";
import { RecommendationPanel } from "./RecommendationPanel";
import { ShareSnapshotDialog } from "./ShareSnapshotDialog";
import { useFoodMapData } from "./useFoodMapData";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { AMAP_WUHAN_SCANLIST } from "../../recommendations/amapWuhanScanlist";
import { filterRecommendations } from "../../recommendations/filters";
import { evaluateRecommendation, getMappableRecommendations, getPinCandidateRecommendations } from "../../recommendations/verification";
import {
  RECOMMENDATION_LAYER,
  recommendationMapId,
  recommendationToFoodPlace,
  recommendationToMapPlace,
  sourceIdFromMapId
} from "../../recommendations/recommendationUtils";

type MobilePanelMode = "layers" | "places" | "detail" | "tools";
type WorkspaceUiMode = "idle" | "display" | "list" | "detail" | "recommendation" | "dingtuyi" | "tools" | "create" | "edit" | "filter" | "importExport" | "share" | "poster";
type RightPanelView = "list" | "detail" | "recommendations" | "dingtuyi";

export function MapWorkspace({ notify }: { notify: (text: string) => void }) {
  const { places, layers, photos, filter, loading, visiblePlaces, setFilter, reload } = useFoodMapData();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [editingPlace, setEditingPlace] = useState<FoodPlace | undefined>();
  const [draftPoint, setDraftPoint] = useState<{ longitude: number; latitude: number } | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [draftInitialText, setDraftInitialText] = useState<string | undefined>();
  const [mobilePanel, setMobilePanel] = useState<MobilePanelMode | undefined>();
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightView, setRightView] = useState<RightPanelView>("list");
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(false);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | undefined>();
  const [recommendationLayerVisible, setRecommendationLayerVisible] = useState(false);
  const [dingtuyiLayerVisible, setDingtuyiLayerVisible] = useState(false);
  const [selectedDingtuyiId, setSelectedDingtuyiId] = useState<string | undefined>();
  const [manualMovePlaceId, setManualMovePlaceId] = useState<string | undefined>();

  const selectedPlace = useMemo(() => places.find((place) => place.id === selectedId), [places, selectedId]);
  const displayLayers = useMemo(() => [...layers, DINGTUYI_SHARE_LAYER], [layers]);
  const dingtuyiAllPlaces = useMemo(() => DINGTUYI_WUHAN_FOOD_MARKERS.map(dingtuyiMarkerToMapPlace), []);
  const dingtuyiVisiblePlaces = useMemo(() => {
    if (!dingtuyiLayerVisible || (filter.source && filter.source !== "all")) return [];
    const keyword = filter.keyword.trim().toLowerCase();
    const layerIds = new Set(filter.layerIds);
    return dingtuyiAllPlaces.filter((place) => {
      if (layerIds.size > 0 && !layerIds.has(place.layerId)) return false;
      if (filter.minRating && place.rating < filter.minRating) return false;
      if (filter.city && place.city !== filter.city) return false;
      if (filter.visitedFrom && place.visitedAt < filter.visitedFrom) return false;
      if (filter.visitedTo && place.visitedAt > filter.visitedTo) return false;
      if (filter.tags.length > 0 && !filter.tags.every((tag) => place.tags.includes(tag))) return false;
      if (filter.reviewTags?.length && !filter.reviewTags.every((tag) => place.tags.includes(tag))) return false;
      if (filter.cuisineTags?.length && !filter.cuisineTags.every((tag) => place.tags.includes(tag))) return false;
      if (filter.district && ![place.city, place.address, place.notes, ...place.tags].join(" ").includes(filter.district)) return false;
      if (!keyword) return true;
      return [place.name, place.address, place.city, place.notes, ...place.tags].join(" ").toLowerCase().includes(keyword);
    });
  }, [dingtuyiAllPlaces, dingtuyiLayerVisible, filter]);
  const selectedDingtuyiPlace = useMemo(
    () => selectedDingtuyiId ? dingtuyiAllPlaces.find((place) => sourceIdFromDingtuyiMapId(place.id) === selectedDingtuyiId) : undefined,
    [dingtuyiAllPlaces, selectedDingtuyiId]
  );
  const selectedCalibrationCandidates = useMemo(
    () => selectedPlace ? buildCalibrationCandidates({
      place: selectedPlace,
      places,
      mapProviderResults: getExternalMapCandidatesForPlace(selectedPlace)
    }) : [],
    [places, selectedPlace]
  );
  const editorOpen = Boolean(editingPlace || draftPoint);
  const activeFilterCount = useMemo(() => {
    return [
      filter.city,
      filter.minRating,
      filter.visitedFrom,
      filter.visitedTo,
      filter.source && filter.source !== "all" ? filter.source : undefined,
      filter.district,
      filter.verificationStatus && filter.verificationStatus !== "all" ? filter.verificationStatus : undefined,
      filter.distanceKm,
      filter.layerIds.length > 0 ? filter.layerIds.length : undefined,
      filter.tags.length > 0 ? filter.tags.length : undefined,
      filter.visitStatuses?.length ? filter.visitStatuses.length : undefined,
      filter.reviewTags?.length ? filter.reviewTags.length : undefined,
      filter.cuisineTags?.length ? filter.cuisineTags.length : undefined
    ].filter(Boolean).length;
  }, [filter]);
  const quickFilterGroupCount = useMemo(() => {
    return [
      filter.visitStatuses?.length ? filter.visitStatuses.length : undefined,
      filter.reviewTags?.length ? filter.reviewTags.length : undefined,
      filter.cuisineTags?.length ? filter.cuisineTags.length : undefined
    ].filter(Boolean).length;
  }, [filter.cuisineTags, filter.reviewTags, filter.visitStatuses]);
  const structuralFilterCount = Math.max(activeFilterCount - quickFilterGroupCount, 0);
  const hiddenLayerCount = useMemo(() => layers.filter((layer) => !layer.visible).length, [layers]);
  const visibleRecommendations = useMemo(
    () => (recommendationsLoaded && recommendationLayerVisible ? AMAP_WUHAN_SCANLIST : []),
    [recommendationsLoaded, recommendationLayerVisible]
  );
  const filteredRecommendations = useMemo(() => filterRecommendations(visibleRecommendations, filter), [visibleRecommendations, filter]);
  const mappableAllRecommendations = useMemo(() => getMappableRecommendations(AMAP_WUHAN_SCANLIST), []);
  const approximateRecommendationCount = useMemo(
    () => mappableAllRecommendations.filter((item) => item.locationAccuracy === "approximate").length,
    [mappableAllRecommendations]
  );
  const recommendationPinCandidates = useMemo(() => getPinCandidateRecommendations(filteredRecommendations), [filteredRecommendations]);
  const recommendationMapPlaces = useMemo(() => recommendationPinCandidates.map(recommendationToMapPlace), [recommendationPinCandidates]);
  const mapPlaces = useMemo(
    () => [...visiblePlaces, ...recommendationMapPlaces, ...dingtuyiVisiblePlaces],
    [visiblePlaces, recommendationMapPlaces, dingtuyiVisiblePlaces]
  );
  const scanlistVisible = recommendationsLoaded && recommendationLayerVisible;
  const pendingPlaceCount = useMemo(() => places.filter(isPendingCalibrationPlace).length, [places]);
  const highRiskPlaceCount = useMemo(() => places.filter((place) => place.tags.includes("位置高风险")).length, [places]);
  const selectedCanMovePin = canManuallyMovePlace(selectedPlace);
  const selectedDingtuyiCanSave = Boolean(selectedDingtuyiId && !places.some((place) => place.id === `personal-favorite:dingtuyi-${selectedDingtuyiId}`));

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
      setSelectedDingtuyiId(undefined);
      setSelectedRecommendationId(recommendationSourceId);
      setRightPanelOpen(true);
      setRightView("recommendations");
      if (isMobileViewport()) setMobilePanel("places");
      else setMobilePanel(undefined);
      return;
    }
    const dingtuyiSourceId = sourceIdFromDingtuyiMapId(placeId);
    if (dingtuyiSourceId) {
      setSelectedId(placeId);
      setSelectedRecommendationId(undefined);
      setSelectedDingtuyiId(dingtuyiSourceId);
      setRightPanelOpen(true);
      setRightView("dingtuyi");
      if (isMobileViewport()) setMobilePanel("detail");
      else setMobilePanel(undefined);
      return;
    }
    setSelectedId(placeId);
    setSelectedRecommendationId(undefined);
    setSelectedDingtuyiId(undefined);
    setRightPanelOpen(true);
    setRightView("detail");
    if (isMobileViewport()) setMobilePanel("detail");
    else setMobilePanel(undefined);
  }

  function clearSelection() {
    setSelectedId(undefined);
    setSelectedRecommendationId(undefined);
    setSelectedDingtuyiId(undefined);
    setManualMovePlaceId(undefined);
  }

  function closeDetailPanel() {
    clearSelection();
    setRightPanelOpen(false);
    setRightView("list");
  }

  function closeMobilePanel() {
    if (mobilePanel === "detail") {
      clearSelection();
      setRightView("list");
    }
    if (isMobileViewport()) setRightPanelOpen(false);
    setMobilePanel(undefined);
  }

  function loadRecommendations() {
    if (scanlistVisible) {
      setScanlistVisible(false);
      notify("已隐藏高德扫街榜图层");
      return;
    }
    setScanlistVisible(true);
    if (isMobileViewport()) setMobilePanel("places");
    notify("已显示高德扫街榜图层");
  }

  function setScanlistVisible(visible: boolean) {
    if (visible) {
      setRecommendationsLoaded(true);
      setRecommendationLayerVisible(true);
      setRightView("recommendations");
      setSelectedRecommendationId((current) => current ?? AMAP_WUHAN_SCANLIST[0]?.sourceId);
      return;
    }
    setRecommendationLayerVisible(false);
    setSelectedRecommendationId(undefined);
    setSelectedId(undefined);
  }

  function openRecommendationsPanel() {
    setRecommendationsLoaded(true);
    setRecommendationLayerVisible(true);
    setRightPanelOpen(true);
    setRightView("recommendations");
    setSelectedRecommendationId((current) => current ?? AMAP_WUHAN_SCANLIST[0]?.sourceId);
    if (isMobileViewport()) setMobilePanel("places");
  }

  function openPendingPlaces() {
    setFilter({ ...filter, source: "personal", verificationStatus: "pending" });
    setSelectedRecommendationId(undefined);
    setRightPanelOpen(true);
    setRightView("list");
    if (isMobileViewport()) setMobilePanel("places");
  }

  function openMobileList() {
    if (recommendationsLoaded && recommendationLayerVisible && visibleRecommendations.length > 0) {
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
    if (!recommendation) {
      throw new Error("推荐项不存在");
    }
    if (!evaluateRecommendation(recommendation).mappable) {
      notify("该推荐未通过坐标核验，不能收藏为地图地点");
      throw new Error("推荐项未通过坐标核验，不能收藏为地图地点");
    }
    const personalLayer = layers.find((layer) => layer.name === "我的收藏") ?? layers.find((layer) => layer.name === "想去清单") ?? layers[0] ?? RECOMMENDATION_LAYER;
    const savedPlace = recommendationToFoodPlace(recommendation, personalLayer.id);
    await placeRepository.save(savedPlace);
    await reload();
    setSelectedId(savedPlace.id);
    setSelectedRecommendationId(undefined);
    setRightPanelOpen(true);
    setRightView("detail");
    if (isMobileViewport()) setMobilePanel("detail");
    notify("已加入我的收藏");
  }

  async function saveDingtuyiPlace() {
    if (!selectedDingtuyiPlace || !selectedDingtuyiId) return;
    const personalLayer = layers.find((layer) => layer.name === "我的收藏") ?? layers.find((layer) => layer.name === "想去清单") ?? layers[0] ?? DINGTUYI_SHARE_LAYER;
    const savedId = `personal-favorite:dingtuyi-${selectedDingtuyiId}`;
    const savedPlace: FoodPlace = {
      ...selectedDingtuyiPlace,
      id: savedId,
      layerId: personalLayer.id,
      tags: normalizeTags([
        ...selectedDingtuyiPlace.tags.filter((tag) => tag !== "钉图易分享"),
        "我的收藏",
        "已核验",
        "钉图易导入"
      ]),
      notes: [
        selectedDingtuyiPlace.notes,
        "用户操作：从钉图易分享图层加入个人收藏。"
      ].join("\n\n"),
      mapAccuracy: "exact",
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    await placeRepository.save(savedPlace);
    await reload();
    setSelectedId(savedId);
    setSelectedDingtuyiId(undefined);
    setRightPanelOpen(true);
    setRightView("detail");
    if (isMobileViewport()) setMobilePanel("detail");
    notify("已从钉图易图层加入我的收藏");
  }

  async function updateSelectedPlaceTags(tags: string[]) {
    if (!selectedPlace) return;
    await placeRepository.save({ ...selectedPlace, tags, updatedAt: nowIso() });
    await reload();
    notify("已更新标签");
  }

  async function confirmSelectedCalibrationCandidate(candidate: PlaceCandidate) {
    if (!selectedPlace) return;
    const precise = candidateSolidifiesPrecisePlace(candidate);
    const staleCalibrationTags = new Set(["待校准", "近似坐标", "默认候选"]);
    const baseTags = selectedPlace.tags.filter((tag) => !staleCalibrationTags.has(tag));
    const tags = normalizeTags([
      ...baseTags,
      ...candidate.tags.filter((tag) => !staleCalibrationTags.has(tag)),
      precise ? "已核验" : "待校准",
      precise ? "精确坐标" : "近似坐标",
      candidate.sourceLabel
    ]);
    const notes = [
      selectedPlace.notes,
      [
        `候选确认固化：${candidate.name}`,
        candidate.address ? `候选地址：${candidate.address}` : undefined,
        `候选来源：${candidate.sourceLabel}`,
        `候选置信度：${Math.round(candidate.confidence * 100)}%`,
        precise ? "固化结果：已替换为精确坐标，可打开地图导航。" : "固化结果：仍需校准；候选仍非精确坐标，继续保留待校准状态。"
      ].filter(Boolean).join("\n")
    ].filter(Boolean).join("\n\n");
    const next: FoodPlace = {
      ...selectedPlace,
      name: candidate.name || selectedPlace.name,
      address: candidate.address ?? selectedPlace.address,
      city: candidate.city ?? selectedPlace.city ?? "武汉",
      longitude: typeof candidate.longitude === "number" ? candidate.longitude : selectedPlace.longitude,
      latitude: typeof candidate.latitude === "number" ? candidate.latitude : selectedPlace.latitude,
      coordinateSystem: candidate.coordinateSystem ?? selectedPlace.coordinateSystem ?? "wgs84",
      tags,
      notes,
      mapAccuracy: precise ? "exact" : "approximate",
      updatedAt: nowIso()
    };
    await placeRepository.save(next);
    await reload();
    setSelectedId(next.id);
    notify(precise ? "已固化为精确地点" : "已保存候选，仍需校准");
  }

  async function searchSelectedMapCandidates(query: string, apiKey: string): Promise<PlaceCandidate[]> {
    if (!selectedPlace) return [];
    return searchAmapPlaceCandidates({
      apiKey,
      query,
      place: selectedPlace,
      historyPlaces: places,
      limit: 10
    });
  }

  async function movePlaceManually(placeId: string, point: { longitude: number; latitude: number }) {
    const place = places.find((item) => item.id === placeId);
    if (!place || manualMovePlaceId !== placeId || !canManuallyMovePlace(place)) {
      notify("当前图钉不可手动挪动");
      return;
    }
    const next = applyManualPinMove(place, point);
    await placeRepository.save(next);
    await reload();
    setSelectedId(placeId);
    setManualMovePlaceId(undefined);
    if (isMobileViewport()) setMobilePanel("detail");
    notify("已手动校准图钉位置");
  }

  function startManualMove(placeId: string) {
    setManualMovePlaceId(placeId);
    setSelectedId(placeId);
    setFilterOpen(false);
    if (isMobileViewport()) {
      setMobilePanel(undefined);
      setRightPanelOpen(false);
    }
  }

  function openCreateDraft(point = DEFAULT_CENTER, initialText?: string) {
    setMobilePanel(undefined);
    setFilterOpen(false);
    setShareOpen(false);
    setPosterOpen(false);
    setImportOpen(false);
    setDraftInitialText(initialText);
    setSelectedDingtuyiId(undefined);
    setDraftPoint(point);
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
      saveRecommendation,
      clickedPoint: draftPoint,
      scanlistVisible
    }),
    [places, visiblePlaces, layers, photos, filter, selectedId, setFilter, reload, draftPoint, scanlistVisible]
  );
  useFoodMapAgentBridge(bridgeOptions);

  useEffect(() => {
    if (manualMovePlaceId && selectedId !== manualMovePlaceId) {
      setManualMovePlaceId(undefined);
    }
  }, [manualMovePlaceId, selectedId]);

  useEffect(() => {
    function closeTopLayer(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (editorOpen) {
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
      if (posterOpen) {
        setPosterOpen(false);
        return;
      }
      if (mobilePanel) {
        closeMobilePanel();
        return;
      }
    }
    window.addEventListener("keydown", closeTopLayer);
    return () => window.removeEventListener("keydown", closeTopLayer);
  }, [editorOpen, filterOpen, importOpen, mobilePanel, posterOpen, shareOpen]);

  const noFiltered = !loading && places.length > 0 && mapPlaces.length === 0;
  const desktopRightPanelOpen = !isMobileViewport() && rightPanelOpen;
  const desktopViewport = !isMobileViewport();
  const uiMode: WorkspaceUiMode = editorOpen
    ? (editingPlace ? "edit" : "create")
    : filterOpen
      ? "filter"
      : importOpen
        ? "importExport"
        : posterOpen
          ? "poster"
          : shareOpen
            ? "share"
            : mobilePanel === "layers" || leftPanelOpen
            ? "display"
            : mobilePanel === "places" || (desktopRightPanelOpen && rightView === "list")
              ? "list"
              : mobilePanel === "tools"
                ? "tools"
              : mobilePanel === "detail" || (desktopRightPanelOpen && rightView === "detail")
                ? "detail"
                : desktopRightPanelOpen && rightView === "dingtuyi"
                  ? "dingtuyi"
                : desktopRightPanelOpen && rightView === "recommendations"
                  ? "recommendation"
                  : "idle";
  const mapStatusVisible = !manualMovePlaceId && (uiMode === "idle" || uiMode === "filter" || activeFilterCount > 0 || (desktopViewport && uiMode === "recommendation"));
  const filterSummaryVisible = desktopViewport && mapStatusVisible && (structuralFilterCount > 0 || hiddenLayerCount > 0);
  const mobileActionBarVisible = !manualMovePlaceId && ["idle", "display", "list"].includes(uiMode);
  const movingPlace = manualMovePlaceId ? places.find((place) => place.id === manualMovePlaceId) : undefined;

  return (
    <main className={manualMovePlaceId ? "workspace is-moving-pin" : "workspace"}>
      <WorkspaceHeader
        keyword={filter.keyword}
        onKeywordChange={(keyword) => setFilter({ ...filter, keyword })}
        onSearchAdd={(text) => openCreateDraft(DEFAULT_CENTER, text)}
        onAdd={() => openCreateDraft()}
        onFilter={() => {
          setMobilePanel(undefined);
          setFilterOpen(true);
        }}
        onShare={() => setShareOpen(true)}
        onExport={() => setPosterOpen(true)}
        onImport={() => setImportOpen(true)}
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
                  onVisibleChange: setScanlistVisible
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
                setRightView(recommendationsLoaded && recommendationLayerVisible ? "recommendations" : selectedId ? "detail" : "list");
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
            draggablePlaceIds={manualMovePlaceId ? [manualMovePlaceId] : []}
            onPlaceClick={selectPlace}
            onMapClick={(point) => {
              if (manualMovePlaceId) {
                void movePlaceManually(manualMovePlaceId, point);
                return;
              }
              setSelectedId(undefined);
              setSelectedDingtuyiId(undefined);
              setManualMovePlaceId(undefined);
              openCreateDraft(point);
            }}
            onPlaceMove={(placeId, point) => void movePlaceManually(placeId, point)}
            notify={notify}
          />
          {manualMovePlaceId ? (
            <div className="map-move-banner" data-testid="manual-move-banner">
              <span>
                <strong>校准图钉位置</strong>
                {movingPlace ? <small>{movingPlace.name}</small> : null}
                <em>拖动图钉，或点击地图上的真实位置后自动保存。</em>
              </span>
              <button type="button" onClick={() => setManualMovePlaceId(undefined)}>取消挪动</button>
            </div>
          ) : null}
          {mapStatusVisible ? (
            <HomeMapControlDock
              visiblePlacesCount={visiblePlaces.length}
              totalPlacesCount={places.length}
              scanlistVisible={scanlistVisible}
              scanlistCount={mappableAllRecommendations.length}
              dingtuyiVisible={dingtuyiLayerVisible}
              dingtuyiCount={DINGTUYI_WUHAN_FOOD_MARKERS.length}
              pendingCount={pendingPlaceCount}
              highRiskCount={highRiskPlaceCount}
              filter={filter}
              onFilterChange={setFilter}
              onScanlistVisibleChange={(visible) => {
                setScanlistVisible(visible);
                notify(visible ? "已显示高德扫街榜图层" : "已隐藏高德扫街榜图层");
              }}
              onDingtuyiVisibleChange={(visible) => {
                setDingtuyiLayerVisible(visible);
                if (!visible && selectedDingtuyiId) clearSelection();
                notify(visible ? "已显示钉图易分享图层" : "已隐藏钉图易分享图层");
              }}
              onOpenPendingPlaces={openPendingPlaces}
              onOpenFullFilter={() => setFilterOpen(true)}
              onOpenSharePoster={() => setPosterOpen(true)}
            />
          ) : null}
          {filterSummaryVisible ? (
            <div className="map-filter-summary" data-testid="map-filter-summary">
              <span>
                当前显示 {visiblePlaces.length} / {places.length} 个地点
                {structuralFilterCount > 0 ? `，${structuralFilterCount} 组筛选生效` : ""}
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
              <button type="button" className="side-panel-close side-panel-close--right" onClick={closeDetailPanel} aria-label="收起详情">
                <X size={16} />
              </button>
              {rightView === "recommendations" ? (
                <RecommendationPanel
                  recommendations={filteredRecommendations}
                  selectedId={selectedRecommendationId}
                  onSelect={selectRecommendation}
                  onSave={saveRecommendation}
                />
              ) : rightView === "detail" && selectedPlace ? (
                <PlaceDetailDrawer
                  place={selectedPlace}
                  layers={layers}
                  photos={photos}
                  onAdd={() => openCreateDraft()}
                  onEdit={() => setEditingPlace(selectedPlace)}
                  onDelete={deleteSelected}
                  onBack={() => setRightView("list")}
                  onTagsChange={updateSelectedPlaceTags}
                  calibrationCandidates={selectedCalibrationCandidates}
                  onConfirmCalibrationCandidate={confirmSelectedCalibrationCandidate}
                  onSearchMapCandidates={searchSelectedMapCandidates}
                  canMovePin={selectedCanMovePin}
                  movingPin={manualMovePlaceId === selectedPlace.id}
                  onStartMovePin={() => startManualMove(selectedPlace.id)}
                  onCancelMovePin={() => setManualMovePlaceId(undefined)}
                />
              ) : rightView === "dingtuyi" && selectedDingtuyiPlace ? (
                <PlaceDetailDrawer
                  readonly
                  place={selectedDingtuyiPlace}
                  layers={displayLayers}
                  photos={[]}
                  onBack={() => setRightView("list")}
                  readonlyActions={
                    <button type="button" className="primary-button" onClick={() => void saveDingtuyiPlace()} disabled={!selectedDingtuyiCanSave}>
                      {selectedDingtuyiCanSave ? "加入我的收藏" : "已在我的收藏"}
                    </button>
                  }
                />
              ) : (
                <PlaceList
                  places={visiblePlaces}
                  layers={layers}
                  photos={photos}
                  selectedId={selectedId}
                  onSelect={selectPlace}
                  onAdd={() => openCreateDraft()}
                  onImport={() => setImportOpen(true)}
                  pendingMode={filter.verificationStatus === "pending"}
                  onClearPending={() => setFilter({ ...filter, verificationStatus: "all" })}
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
      {mobileActionBarVisible ? (
        <div className="mobile-action-bar" data-testid="mobile-action-bar">
          <button
            type="button"
            className={mobilePanel === "layers" ? "mobile-nav-button is-active" : "mobile-nav-button"}
            onClick={() => setMobilePanel((panel) => panel === "layers" ? undefined : "layers")}
            aria-pressed={mobilePanel === "layers"}
          >
            <SlidersHorizontal size={19} />
            <span>图层</span>
          </button>
          <button
            type="button"
            className={filterOpen ? "mobile-nav-button is-active" : "mobile-nav-button"}
            onClick={() => {
              setMobilePanel(undefined);
              setFilterOpen(true);
            }}
            aria-pressed={filterOpen}
          >
            <Filter size={19} />
            <span>筛选</span>
          </button>
          <button
            type="button"
            className="mobile-nav-button mobile-nav-button--primary"
            onClick={() => {
              openCreateDraft();
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
        <div className="mobile-panel-backdrop" onClick={closeMobilePanel}>
          <section className="mobile-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-panel-title" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-panel__header">
              <h2 id="mobile-panel-title">{mobilePanel === "layers" ? "地图显示" : mobilePanel === "places" ? (rightView === "recommendations" ? "扫街榜清单" : "地点清单") : mobilePanel === "tools" ? "更多工具" : rightView === "dingtuyi" ? "钉图易地点" : "地点详情"}</h2>
              <button type="button" className="ghost-button" onClick={closeMobilePanel}>关闭</button>
            </div>
            {mobilePanel === "tools" ? (
              <div className="mobile-tools-grid">
                <button type="button" className="tool-button" onClick={() => { setMobilePanel(undefined); setImportOpen(true); }}>
                  <Upload size={18} /> 导入
                </button>
                <button type="button" className="tool-button" onClick={() => { setMobilePanel(undefined); setPosterOpen(true); }}>
                  <Download size={18} /> 导出分享图
                </button>
                <button type="button" className="tool-button" onClick={() => { setMobilePanel(undefined); setShareOpen(true); }}>
                  <Share2 size={18} /> 分享
                </button>
                <button type="button" className="tool-button" onClick={() => { setMobilePanel(undefined); loadRecommendations(); }}>
                  <Sparkles size={18} /> 扫街榜
                </button>
                <button type="button" className="tool-button" onClick={() => { setMobilePanel(undefined); openRecommendationsPanel(); }}>
                  <List size={18} /> 榜单清单
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
                  onVisibleChange: setScanlistVisible
                }}
              />
            ) : null}
            {mobilePanel === "places" ? (
              rightView === "recommendations" ? (
                <RecommendationPanel
                  recommendations={filteredRecommendations}
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
                  onAdd={() => openCreateDraft()}
                  onImport={() => setImportOpen(true)}
                  pendingMode={filter.verificationStatus === "pending"}
                  onClearPending={() => setFilter({ ...filter, verificationStatus: "all" })}
                />
              )
            ) : null}
            {mobilePanel === "detail" ? (
              <PlaceDetailDrawer
                readonly={rightView === "dingtuyi"}
                place={rightView === "dingtuyi" ? selectedDingtuyiPlace : selectedPlace}
                layers={rightView === "dingtuyi" ? displayLayers : layers}
                photos={photos}
                onAdd={() => openCreateDraft()}
                onEdit={rightView === "dingtuyi" ? undefined : () => setEditingPlace(selectedPlace)}
                onDelete={rightView === "dingtuyi" ? undefined : deleteSelected}
                onBack={() => setMobilePanel("places")}
                onTagsChange={rightView === "dingtuyi" ? undefined : updateSelectedPlaceTags}
                calibrationCandidates={rightView === "dingtuyi" ? [] : selectedCalibrationCandidates}
                onConfirmCalibrationCandidate={rightView === "dingtuyi" ? undefined : confirmSelectedCalibrationCandidate}
                onSearchMapCandidates={rightView === "dingtuyi" ? undefined : searchSelectedMapCandidates}
                canMovePin={rightView === "dingtuyi" ? false : Boolean(selectedPlace && canManuallyMovePlace(selectedPlace))}
                movingPin={rightView === "dingtuyi" ? false : selectedPlace ? manualMovePlaceId === selectedPlace.id : false}
                onStartMovePin={() => rightView !== "dingtuyi" && selectedPlace ? startManualMove(selectedPlace.id) : undefined}
                onCancelMovePin={() => setManualMovePlaceId(undefined)}
                readonlyActions={rightView === "dingtuyi" ? (
                  <button type="button" className="primary-button" onClick={() => void saveDingtuyiPlace()} disabled={!selectedDingtuyiCanSave}>
                    {selectedDingtuyiCanSave ? "加入我的收藏" : "已在我的收藏"}
                  </button>
                ) : undefined}
              />
            ) : null}
          </section>
        </div>
      ) : null}
      <PlaceEditorModal
        open={editorOpen}
        place={editingPlace}
        layers={layers}
        places={places}
        point={draftPoint}
        initialText={draftInitialText}
        onClose={() => {
          setEditingPlace(undefined);
          setDraftPoint(undefined);
          setDraftInitialText(undefined);
        }}
        onSaved={async (message, placeId) => {
          notify(message);
          setSelectedId(placeId);
          await reload();
        }}
      />
      <FilterPanel open={filterOpen} filter={filter} places={places} layers={displayLayers} onChange={setFilter} onClose={() => setFilterOpen(false)} />
      <ShareSnapshotDialog open={shareOpen} places={places} layers={layers} photos={photos} onClose={() => setShareOpen(false)} notify={notify} />
      <MapPosterDialog open={posterOpen} places={visiblePlaces} onClose={() => setPosterOpen(false)} notify={notify} />
      <ImportExportDialog
        open={importOpen}
        places={places}
        layers={layers}
        photos={photos}
        onClose={() => setImportOpen(false)}
        notify={notify}
        onImportPersonalFavorites={async () => {
          const count = await importPersonalFavoritePins();
          await reload();
          return count;
        }}
      />
    </main>
  );
}

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
}
