import { Coffee, Heart, MapPin, Soup, Star } from "lucide-react";
import type { FoodLayer, FoodPlace } from "../../domain/types";
import { layerRepository } from "../../persistence/layerRepository";

const iconMap = {
  pin: MapPin,
  star: Star,
  bowl: Soup,
  coffee: Coffee,
  heart: Heart
};

interface Props {
  layers: FoodLayer[];
  places: FoodPlace[];
  readonly?: boolean;
  onReload?: () => void;
  recommendationControl?: {
    visible: boolean;
    total: number;
    mappable: number;
    approximate: number;
    onVisibleChange: (visible: boolean) => void;
  };
}

export function LayerPanel({ layers, places, readonly, onReload, recommendationControl }: Props) {
  const visibleLayerIds = new Set(layers.filter((layer) => layer.visible).map((layer) => layer.id));
  const visiblePlaceCount = places.filter((place) => visibleLayerIds.has(place.layerId)).length;
  const hiddenLayerCount = layers.filter((layer) => !layer.visible).length;
  const hasPersonalPlaces = places.length > 0;

  return (
    <aside className="layer-panel" data-testid="layer-panel">
      <div className="panel-title">地图显示</div>
      <div className={recommendationControl ? "display-summary" : "display-summary display-summary--compact"}>
        <span>
          <strong>{visiblePlaceCount}</strong>
          <small>/ {places.length} 个人记录</small>
        </span>
        {recommendationControl ? (
          <span>
            <strong>{recommendationControl.visible ? recommendationControl.mappable : 0}</strong>
            <small>/ {recommendationControl.total} 扫街榜</small>
          </span>
        ) : null}
        <span>
          <strong>{hiddenLayerCount}</strong>
          <small>隐藏图层</small>
        </span>
      </div>
      {recommendationControl ? (
        <section className="display-section">
          <div className="display-section__header">
            <strong>推荐图钉</strong>
            <small>不计入个人记录，收藏后进入想去清单</small>
          </div>
          <label className="display-toggle-card">
            <span className="display-toggle-card__main">
              <span>高德扫街榜</span>
              <small>
                {recommendationControl.mappable} 个可上图，{recommendationControl.approximate} 个建议手动校准
              </small>
            </span>
            <input
              type="checkbox"
              checked={recommendationControl.visible}
              disabled={readonly}
              onChange={(event) => recommendationControl.onVisibleChange(event.target.checked)}
            />
          </label>
        </section>
      ) : null}
      <section className="display-section">
        <div className="display-section__header">
          <strong>个人记录</strong>
          <small>控制地图上是否显示，不改变筛选条件</small>
        </div>
        {hasPersonalPlaces ? (
          <div className="layer-list">
            {layers.map((layer) => {
              const Icon = iconMap[layer.icon];
              const count = places.filter((place) => place.layerId === layer.id).length;
              return (
                <label key={layer.id} className="layer-item">
                  <span className="layer-item__swatch" style={{ background: layer.color }}>
                    <Icon size={16} />
                  </span>
                  <span className="layer-item__main">
                    <span>{layer.name}</span>
                    <small>{count} 个地点</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    disabled={readonly}
                    onChange={async (event) => {
                      await layerRepository.save({ ...layer, visible: event.target.checked });
                      onReload?.();
                    }}
                  />
                </label>
              );
            })}
          </div>
        ) : (
          <div className="display-empty">
            新增或收藏地点后，可以在这里按图层控制个人记录的显示。
          </div>
        )}
      </section>
      <div className="display-note">更细的图层新建、改名、颜色和图标管理会在后续版本补齐。</div>
    </aside>
  );
}
