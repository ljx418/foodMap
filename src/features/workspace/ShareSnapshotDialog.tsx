import { Copy, Download } from "lucide-react";
import { useState } from "react";
import type { FoodLayer, FoodPlace, PhotoAsset, ShareSnapshot } from "../../domain/types";
import { createSnapshot, downloadSnapshot, summarizeSnapshot } from "../../persistence/importExportCodec";
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
  const [title, setTitle] = useState("我的美食地图");
  if (!open) return null;

  async function generate() {
    const next = createSnapshot(title, places, layers, photos);
    await snapshotRepository.save(next);
    setSnapshot(next);
    notify("已生成分享快照");
  }

  const preview = summarizeSnapshot(snapshot ?? createSnapshot(title, places, layers, photos));

  return (
    <div className="modal-backdrop">
      <section className="modal compact" data-testid="share-snapshot-dialog">
        <div className="modal__header">
          <h2>分享快照</h2>
          <button type="button" onClick={onClose}>关闭</button>
        </div>
        <p className="help-text">生成一个本地只读快照链接，并可导出 .foodmap.json 供其他设备导入。本链接不是公网永久链接，其他浏览器需要先导入同一文件。</p>
        <label className="field">
          <span>快照标题</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="我的美食地图" />
        </label>
        <div className="snapshot-summary" data-testid="snapshot-portability-summary">
          <strong>{snapshot ? "已生成本地只读快照" : "将生成本地只读快照"}</strong>
          <dl>
            <div><dt>标题</dt><dd>{preview.title}</dd></div>
            <div><dt>地点</dt><dd>{preview.placeCount} 个</dd></div>
            <div><dt>图层</dt><dd>{preview.layerCount} 个</dd></div>
            <div><dt>缩略图</dt><dd>{preview.thumbnailCount} 张</dd></div>
            <div><dt>生成时间</dt><dd>{snapshot ? new Date(preview.exportedAt).toLocaleString("zh-CN") : "确认后生成"}</dd></div>
          </dl>
          <p>导出包只包含本地只读查看所需数据，不包含账号、云同步、公网链接或原图远程资源。</p>
        </div>
        <button type="button" className={snapshot ? "ghost-button" : "primary-button"} onClick={generate}>
          {snapshot ? "重新生成本地只读快照" : "确认生成本地只读快照"}
        </button>
        {snapshot ? (
          <div className="share-link-box">
            <code>{`${window.location.origin}${window.location.pathname}#/share/${snapshot.id}`}</code>
            <div className="row-actions">
              <button type="button" className="ghost-button" onClick={() => navigateToShare(snapshot.id)}>
                <Copy size={16} /> 打开
              </button>
              <button type="button" className="ghost-button" data-testid="export-foodmap-json" onClick={() => { downloadSnapshot(snapshot); notify("已导出文件"); }}>
                <Download size={16} /> 导出
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
