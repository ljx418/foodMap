import { Download } from "lucide-react";
import type { FoodPlace } from "../../domain/types";
import { downloadMapPoster } from "../../domain/mapPoster";

interface Props {
  open: boolean;
  places: FoodPlace[];
  onClose: () => void;
  notify: (text: string) => void;
}

export function MapPosterDialog({ open, places, onClose, notify }: Props) {
  if (!open) return null;

  async function exportPoster() {
    if (places.length === 0) {
      notify("当前筛选下没有可生成分享图的个人图钉");
      return;
    }
    try {
      await downloadMapPoster(places, { title: "我的美食地图", subtitle: `${places.length} 个个人图钉` });
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
          <strong>{places.length} 个当前可见个人图钉</strong>
          <span>分享图会使用当前筛选结果生成 PNG，适合保存后发朋友圈；榜单参考不会混入个人图钉统计。</span>
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
