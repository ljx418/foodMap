import { Copy, Download } from "lucide-react";
import { useState } from "react";
import type { FoodLayer, FoodPlace, PhotoAsset, ShareSnapshot } from "../../domain/types";
import { createSnapshot, downloadSnapshot } from "../../persistence/importExportCodec";
import { snapshotRepository } from "../../persistence/snapshotRepository";
import { navigateToShare } from "../../app/router";

interface Props {
  open: boolean;
  places: FoodPlace[];
  layers: FoodLayer[];
  photos: PhotoAsset[];
  onClose: () => void;
  notify: (text: string) => void;
}

export function ShareSnapshotDialog({ open, places, layers, photos, onClose, notify }: Props) {
  const [snapshot, setSnapshot] = useState<ShareSnapshot | undefined>();
  if (!open) return null;

  async function generate() {
    const next = createSnapshot("我的美食地图", places, layers, photos);
    await snapshotRepository.save(next);
    setSnapshot(next);
    notify("已生成分享快照");
  }

  return (
    <div className="modal-backdrop">
      <section className="modal compact" data-testid="share-snapshot-dialog">
        <div className="modal__header">
          <h2>分享快照</h2>
          <button type="button" onClick={onClose}>关闭</button>
        </div>
        <p className="help-text">生成一个本地只读快照链接，并可导出 .foodmap.json 供其他设备导入。</p>
        <button type="button" className="primary-button" onClick={generate}>生成快照</button>
        {snapshot ? (
          <div className="share-link-box">
            <code>{`${window.location.origin}${window.location.pathname}#/share/${snapshot.id}`}</code>
            <div className="row-actions">
              <button type="button" className="ghost-button" onClick={() => navigateToShare(snapshot.id)}>
                <Copy size={16} /> 打开
              </button>
              <button type="button" className="ghost-button" onClick={() => { downloadSnapshot(snapshot); notify("已导出文件"); }}>
                <Download size={16} /> 导出
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
