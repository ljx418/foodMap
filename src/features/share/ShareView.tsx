import { useEffect, useMemo, useRef, useState } from "react";
import { Layers, List, MapPinned, Upload, X } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { useIsMobileViewport } from "../../components/useIsMobileViewport";
import { filterPlaces } from "../../domain/filters";
import type { FoodFilterState, FoodLayer, ShareSnapshot } from "../../domain/types";
import { navigateToMap, navigateToShare } from "../../app/router";
import { importSnapshotText, validateSnapshotPackageText } from "../../persistence/importExportCodec";
import { snapshotRepository } from "../../persistence/snapshotRepository";
import { LayerPanel } from "../workspace/LayerPanel";
import { MapCanvas } from "../workspace/MapCanvas";
import { PlaceDetailDrawer } from "../workspace/PlaceDetailDrawer";

type ShareMobilePanel = "layers" | "list" | "detail";

export function ShareView({ snapshotId, notify }: { snapshotId: string; notify: (text: string) => void }) {
  const [snapshot, setSnapshot] = useState<ShareSnapshot | undefined>();
  const [shareLayers, setShareLayers] = useState<FoodLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [mobilePanel, setMobilePanel] = useState<ShareMobilePanel | undefined>();
  const [mobileDetailExpanded, setMobileDetailExpanded] = useState(false);
  const [importError, setImportError] = useState("");
  const [filter] = useState<FoodFilterState>({ keyword: "", layerIds: [], tags: [] });
  const missingImportRef = useRef<HTMLInputElement | null>(null);
  const isMobile = useIsMobileViewport();

  useEffect(() => {
    setLoading(true);
    setMobilePanel(undefined);
    setMobileDetailExpanded(false);
    setImportError("");
    void snapshotRepository.get(snapshotId).then((item) => {
      setSnapshot(item);
      setShareLayers(item?.layers ?? []);
      setSelectedId(item?.places[0]?.id);
      setLoading(false);
    });
  }, [snapshotId]);

  const visiblePlaces = useMemo(() => snapshot ? filterPlaces(snapshot.places, shareLayers, filter) : [], [snapshot, shareLayers, filter]);
  const selectedPlace = useMemo(() => snapshot?.places.find((place) => place.id === selectedId), [snapshot, selectedId]);
  const sharePhotos = useMemo(() => (snapshot?.photos ?? []).map((photo) => ({ ...photo, blob: new Blob() })), [snapshot?.photos]);

  function selectPlace(placeId: string) {
    setSelectedId(placeId);
    if (isMobile) {
      setMobileDetailExpanded(false);
      setMobilePanel("detail");
    }
  }

  async function importMissingSnapshot(file?: File) {
    if (!file) return;
    setImportError("");
    try {
      const text = await file.text();
      const validation = validateSnapshotPackageText(text);
      if (!validation.ok) throw new Error(validation.errors.join("；"));
      const imported = await importSnapshotText(text);
      notify("已导入本地只读分享快照");
      navigateToShare(imported.id);
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : "文件格式不正确，未导入任何数据";
      setImportError(message);
      notify("文件格式不正确，未导入任何数据");
    } finally {
      if (missingImportRef.current) missingImportRef.current.value = "";
    }
  }

  if (!loading && !snapshot) {
    return (
      <main className="share-shell" data-testid="share-view">
        <div className="share-missing-panel" data-testid="share-missing-snapshot">
          <EmptyState
            title="没有找到这个本地分享快照。如果你是从其他设备打开，请先导入对应的 .foodmap.json 文件。"
            actions={(
              <>
                <button type="button" className="primary-button" onClick={() => missingImportRef.current?.click()}>
                  <Upload size={16} /> 导入 .foodmap.json
                </button>
                <button type="button" className="ghost-button" onClick={navigateToMap}>返回工作台</button>
                <input
                  ref={missingImportRef}
                  hidden
                  type="file"
                  accept=".json,.foodmap.json,application/json"
                  onChange={(event) => void importMissingSnapshot(event.target.files?.[0])}
                />
              </>
            )}
          />
          <div className="share-missing-recovery" data-testid="share-missing-recovery">
            <strong>本地只读快照没有公网副本</strong>
            <p>分享链接只定位当前浏览器里的本地 snapshot；换手机、清缓存或刷新到缺失快照时，需要导入对应 `.foodmap.json`。导入只写入本地只读 snapshots，不会同步云端，也不会修改你的个人图钉。</p>
          </div>
          {importError ? <p className="inline-error" data-testid="import-error-message">{importError}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="workspace share-shell share-layout" data-testid="share-view">
      <header className="share-header">
        <div className="brand">
          <span>{snapshot?.title ?? "美食地图分享"}</span>
          <small>只读快照</small>
        </div>
        <div className="share-meta">
          <strong>{visiblePlaces.length} 个可见地点</strong>
          {snapshot?.exportedAt ? <span>{new Date(snapshot.exportedAt).toLocaleString("zh-CN")}</span> : null}
        </div>
        <p className="share-readonly-notice" data-testid="share-readonly-notice">
          这是本地只读快照，只能查看地图、图层和地点详情；不能新增、编辑、删除、上传、保存或生成公网链接。
        </p>
        <button type="button" className="ghost-button" onClick={navigateToMap}>返回工作台</button>
      </header>
      <div className="share-body">
        <aside className="share-side-panel share-side-panel--layers">
          <LayerPanel
            layers={shareLayers}
            places={snapshot?.places ?? []}
            readonly
            onLayerVisibleChange={(layerId, visible) => {
              setShareLayers((current) => current.map((layer) => layer.id === layerId ? { ...layer, visible } : layer));
            }}
          />
        </aside>
        <section className="map-stage">
          <MapCanvas
            readonly
            places={visiblePlaces}
            focusedPlaceId={selectedId}
            onPlaceClick={selectPlace}
            onMapClick={() => undefined}
            notify={notify}
          />
        </section>
        <aside className="share-side-panel share-side-panel--detail">
          <PlaceDetailDrawer
            readonly
            testId="share-place-detail"
            place={selectedPlace}
            layers={shareLayers}
            photos={sharePhotos}
          />
        </aside>
      </div>
      <nav className="share-mobile-bar" aria-label="只读分享导航">
        <button type="button" onClick={() => setMobilePanel("layers")} aria-pressed={mobilePanel === "layers"}>
          <Layers size={18} /> 图层
        </button>
        <button type="button" onClick={() => setMobilePanel("list")} aria-pressed={mobilePanel === "list"}>
          <List size={18} /> 清单
        </button>
        <button type="button" onClick={() => setMobilePanel("detail")} aria-pressed={mobilePanel === "detail"} disabled={!selectedPlace}>
          <MapPinned size={18} /> 详情
        </button>
      </nav>
      {mobilePanel ? (
        <div className="mobile-panel-backdrop share-mobile-panel-backdrop" onClick={() => setMobilePanel(undefined)}>
          <section
            className={[
              "mobile-panel",
              "share-mobile-panel",
              mobilePanel === "detail" ? "share-mobile-panel--detail" : "",
              mobilePanel === "detail" && !mobileDetailExpanded ? "share-mobile-panel--summary" : ""
            ].filter(Boolean).join(" ")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-mobile-panel-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-panel__header">
              <h2 id="share-mobile-panel-title">{mobilePanel === "layers" ? "分享图层" : mobilePanel === "list" ? "地点清单" : "地点详情"}</h2>
              <button type="button" className="icon-button" onClick={() => setMobilePanel(undefined)} aria-label="关闭">
                <X size={18} />
              </button>
            </div>
            {mobilePanel === "layers" ? (
              <LayerPanel
                layers={shareLayers}
                places={snapshot?.places ?? []}
                readonly
                onLayerVisibleChange={(layerId, visible) => {
                  setShareLayers((current) => current.map((layer) => layer.id === layerId ? { ...layer, visible } : layer));
                }}
              />
            ) : null}
            {mobilePanel === "list" ? (
              <div className="share-place-list" data-testid="share-place-list">
                {visiblePlaces.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    className={place.id === selectedId ? "place-list__item is-active" : "place-list__item"}
                    onClick={() => {
                      setSelectedId(place.id);
                      setMobileDetailExpanded(false);
                      setMobilePanel("detail");
                    }}
                  >
                    <span className="place-list__swatch" />
                    <span className="place-list__content">
                      <strong>{place.name}</strong>
                      <small>{place.address || place.city}</small>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
            {mobilePanel === "detail" ? (
              <div className={mobileDetailExpanded ? "share-mobile-detail is-expanded" : "share-mobile-detail"} data-testid="share-mobile-panel">
                {!mobileDetailExpanded ? (
                  <div className="share-mobile-detail-summary" data-testid="share-mobile-detail-summary">
                    {selectedPlace ? (
                      <>
                        <div>
                          <p className="eyebrow">当前选中</p>
                          <h3>{selectedPlace.name}</h3>
                          <p>{selectedPlace.address || selectedPlace.city || "暂无地址"}</p>
                          {selectedPlace.tags.length > 0 ? (
                            <div className="share-mobile-detail-summary__tags" aria-label="地点标签">
                              {selectedPlace.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
                            </div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="primary-button"
                          data-testid="share-mobile-detail-expand"
                          onClick={() => setMobileDetailExpanded(true)}
                        >
                          查看完整详情
                        </button>
                      </>
                    ) : (
                      <EmptyState title="还没有选中地点" />
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="ghost-button share-mobile-detail-collapse"
                      data-testid="share-mobile-detail-collapse"
                      onClick={() => setMobileDetailExpanded(false)}
                    >
                      收起到摘要
                    </button>
                    <PlaceDetailDrawer
                      readonly
                      testId="share-place-detail"
                      place={selectedPlace}
                      layers={shareLayers}
                      photos={sharePhotos}
                    />
                  </>
                )}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </main>
  );
}
