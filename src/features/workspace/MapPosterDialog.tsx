import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import type { FoodPlace, MapViewportBounds } from "../../domain/types";
import { buildPosterSourceSet, downloadMapPoster, type PosterMode } from "../../domain/mapPoster";

interface Props {
  open: boolean;
  places: FoodPlace[];
  viewportBounds?: MapViewportBounds;
  onClose: () => void;
  notify: (text: string) => void;
}

export function MapPosterDialog({ open, places, viewportBounds, onClose, notify }: Props) {
  const [title, setTitle] = useState("我的美食地图");
  const [mode, setMode] = useState<PosterMode>("current-filter");
  const source = useMemo(
    () => buildPosterSourceSet(places, mode, viewportBounds),
    [mode, places, viewportBounds]
  );
  const tagSummary = useMemo(
    () => Array.from(new Set(source.places.flatMap((place) => place.tags))).slice(0, 8),
    [source.places]
  );
  const sourceLabel = mode === "current-viewport" ? "当前视野个人图钉" : "当前筛选个人图钉";
  const canExport = source.count > 0 && !source.unavailableReason && !source.emptyReason;

  if (!open) return null;

  async function exportPoster() {
    if (!canExport) {
      notify(source.unavailableReason ?? source.emptyReason ?? "当前没有可生成分享图的个人图钉");
      return;
    }
    const posterTitle = title.trim() || "我的美食地图";
    try {
      await downloadMapPoster(source.places, {
        title: posterTitle,
        subtitle: `${source.count} 个${sourceLabel}`,
        tagSummary: tagSummary.map((tag) => `#${tag}`).join(" ")
      });
      notify("已生成地图分享图");
      onClose();
    } catch {
      notify("地图分享图生成失败，请稍后重试");
    }
  }

  return (
    <div className="modal-backdrop">
      <section className="modal compact" data-testid="map-poster-dialog" role="dialog" aria-modal="true" aria-labelledby="map-poster-title">
        <div className="modal__header">
          <h2 id="map-poster-title">生成分享图</h2>
          <button type="button" onClick={onClose}>关闭</button>
        </div>
        <div className="poster-dialog-body">
          <label className="poster-composer-field">
            分享标题
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="输入分享图标题"
              aria-label="分享图标题"
            />
          </label>
          <div className="poster-mode-row" aria-label="分享图模式">
            <button
              type="button"
              className={mode === "current-filter" ? "quick-switch is-active" : "quick-switch"}
              aria-pressed={mode === "current-filter"}
              onClick={() => setMode("current-filter")}
              data-testid="poster-mode-current-filter"
            >
              当前筛选
            </button>
            <button
              type="button"
              className={mode === "current-viewport" ? "quick-switch is-active" : "quick-switch"}
              aria-pressed={mode === "current-viewport"}
              disabled={!viewportBounds}
              title={viewportBounds ? "使用当前地图视野内的个人图钉" : "当前地图视野尚未就绪"}
              onClick={() => setMode("current-viewport")}
              data-testid="poster-mode-current-viewport"
            >
              当前视野
            </button>
          </div>
          <strong data-testid="poster-source-count">{source.count} 个{sourceLabel}</strong>
          {source.unavailableReason ? <span>{source.unavailableReason}</span> : null}
          {source.emptyReason ? <span data-testid="poster-empty-viewport">{source.emptyReason}</span> : null}
          <span>分享图会使用{mode === "current-viewport" ? "当前地图视野" : "当前筛选结果"}生成 PNG，适合保存后发朋友圈；榜单和参考图层不会混入个人图钉统计。</span>
          <span>{tagSummary.length > 0 ? `标签摘要：${tagSummary.map((tag) => `#${tag}`).join(" ")}` : "标签摘要：暂无标签"}</span>
        </div>
        <div className="dialog-actions">
          <button type="button" className="primary-button" onClick={exportPoster} disabled={!canExport} data-testid="export-map-poster">
            <Download size={16} /> 生成地图分享图 PNG
          </button>
        </div>
      </section>
    </div>
  );
}
