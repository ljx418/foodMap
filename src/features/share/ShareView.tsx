import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { filterPlaces } from "../../domain/filters";
import type { FoodFilterState, ShareSnapshot } from "../../domain/types";
import { navigateToMap } from "../../app/router";
import { snapshotRepository } from "../../persistence/snapshotRepository";
import { LayerPanel } from "../workspace/LayerPanel";
import { MapCanvas } from "../workspace/MapCanvas";
import { PlaceDetailDrawer } from "../workspace/PlaceDetailDrawer";

export function ShareView({ snapshotId, notify }: { snapshotId: string; notify: (text: string) => void }) {
  const [snapshot, setSnapshot] = useState<ShareSnapshot | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [filter] = useState<FoodFilterState>({ keyword: "", layerIds: [], tags: [] });

  useEffect(() => {
    setLoading(true);
    void snapshotRepository.get(snapshotId).then((item) => {
      setSnapshot(item);
      setSelectedId(item?.places[0]?.id);
      setLoading(false);
    });
  }, [snapshotId]);

  const visiblePlaces = useMemo(() => snapshot ? filterPlaces(snapshot.places, snapshot.layers, filter) : [], [snapshot, filter]);
  const selectedPlace = useMemo(() => snapshot?.places.find((place) => place.id === selectedId), [snapshot, selectedId]);

  if (!loading && !snapshot) {
    return (
      <main className="share-shell" data-testid="share-view">
        <EmptyState
          title="没有找到这个本地分享快照。如果你是从其他设备打开，请先导入对应的 .foodmap.json 文件。"
          actions={<button type="button" className="primary-button" onClick={navigateToMap}>返回工作台</button>}
        />
      </main>
    );
  }

  return (
    <main className="workspace share-shell" data-testid="share-view">
      <header className="workspace-header">
        <div className="brand">
          <span>{snapshot?.title ?? "美食地图分享"}</span>
          <small>只读快照</small>
        </div>
        <button type="button" className="ghost-button" onClick={navigateToMap}>返回工作台</button>
      </header>
      <div className="workspace-body">
        <LayerPanel layers={snapshot?.layers ?? []} places={snapshot?.places ?? []} readonly />
        <section className="map-stage">
          <MapCanvas
            readonly
            places={visiblePlaces}
            onPlaceClick={setSelectedId}
            onMapClick={() => undefined}
            notify={notify}
          />
        </section>
        <PlaceDetailDrawer
          readonly
          place={selectedPlace}
          layers={snapshot?.layers ?? []}
          photos={(snapshot?.photos ?? []).map((photo) => ({ ...photo, blob: new Blob() }))}
        />
      </div>
    </main>
  );
}
