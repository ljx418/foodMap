import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import type { FoodPlace } from "../../domain/types";
import { downloadMapPoster } from "../../domain/mapPoster";

interface Props {
  open: boolean;
  places: FoodPlace[];
  onClose: () => void;
  notify: (text: string) => void;
}

export function MapPosterDialog({ open, places, onClose, notify }: Props) {
  const [title, setTitle] = useState("我的美食地图");
  const tagSummary = useMemo(
    () => Array.from(new Set(places.flatMap((place) => place.tags))).slice(0, 8),
    [places]
  );

  if (!open) return null;

  async function exportPoster() {
    if (places.length === 0) {
      notify("当前筛选下没有可生成分享图的个人图钉");
      return;
    }
    const posterTitle = title.trim() || "我的美食地图";
    try {
      await downloadMapPoster(places, {
        title: posterTitle,
        subtitle: `${places.length} 个当前筛选个人图钉`,
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
            <button type="button" className="quick-switch is-active" aria-pressed="true">当前筛选</button>
            <button type="button" className="quick-switch" disabled title="当前版本未接入地图视野边界">当前视野</button>
          </div>
          <strong>{places.length} 个当前筛选个人图钉</strong>
          <span>分享图会使用当前筛选结果生成 PNG，适合保存后发朋友圈；榜单和参考图层不会混入个人图钉统计。</span>
          <span>{tagSummary.length > 0 ? `标签摘要：${tagSummary.map((tag) => `#${tag}`).join(" ")}` : "标签摘要：暂无标签"}</span>
        </div>
        <div className="dialog-actions">
          <button type="button" className="primary-button" onClick={exportPoster} disabled={places.length === 0} data-testid="export-map-poster">
            <Download size={16} /> 生成地图分享图 PNG
          </button>
        </div>
      </section>
    </div>
  );
}
