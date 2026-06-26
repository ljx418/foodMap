import { useRef, useState } from "react";
import type { FoodLayer, FoodPlace, PhotoAsset } from "../../domain/types";
import { navigateToShare } from "../../app/router";
import type { ImportConflictPlan } from "../../domain/governance";
import { planImportConflicts } from "../../domain/governance";
import { createSnapshot, decodeSnapshotFile, downloadSnapshot, importSnapshotText, validateSnapshotPackageText } from "../../persistence/importExportCodec";

interface Props {
  open: boolean;
  places: FoodPlace[];
  layers: FoodLayer[];
  photos: PhotoAsset[];
  onClose: () => void;
  notify: (text: string) => void;
  onImportPersonalFavorites?: () => Promise<number>;
  onImportPlan?: (plan: ImportConflictPlan) => void;
}

export function ImportExportDialog({ open, places, layers, photos, onClose, notify, onImportPersonalFavorites, onImportPlan }: Props) {
  const governanceInputRef = useRef<HTMLInputElement | null>(null);
  const readonlyInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  if (!open) return null;

  async function exportFile() {
    downloadSnapshot(createSnapshot("我的美食地图", places, layers, photos));
    notify("已导出文件");
  }

  async function importReadonlySnapshot(file?: File) {
    if (!file) return;
    setError("");
    try {
      const text = await file.text();
      const validation = validateSnapshotPackageText(text);
      if (!validation.ok) throw new Error(validation.errors.join("；"));
      const snapshot = await importSnapshotText(text);
      notify("已导入本地只读分享快照");
      onClose();
      navigateToShare(snapshot.id);
    } catch (importError) {
      const message = importError instanceof Error && importError.message ? importError.message : "文件格式不正确，未导入任何数据";
      setError(message);
      notify("文件格式不正确，未导入任何数据");
    }
  }

  async function previewGovernanceImport(file?: File) {
    if (!file || !onImportPlan) return;
    setError("");
    try {
      const text = await file.text();
      const snapshot = decodeSnapshotFile(text);
      const plan = planImportConflicts(snapshot, places);
      onImportPlan(plan);
      notify("已生成导入冲突预览，确认前不会写入");
      onClose();
    } catch (importError) {
      const message = importError instanceof Error && importError.message ? importError.message : "文件格式不正确，未导入任何数据";
      setError(message);
      notify("文件格式不正确，未导入任何数据");
    }
  }

  async function importPersonalFavorites() {
    if (!onImportPersonalFavorites) return;
    const count = await onImportPersonalFavorites();
    notify(`已导入 ${count} 个我的收藏图钉`);
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <section className="modal compact" data-testid="import-export-dialog">
        <div className="modal__header">
          <h2>数据包</h2>
          <button type="button" onClick={onClose}>关闭</button>
        </div>
        <div className="dialog-actions">
          <button type="button" className="primary-button" data-testid="export-foodmap-json" onClick={exportFile}>导出数据包 .foodmap.json</button>
          <button type="button" className="ghost-button" onClick={() => readonlyInputRef.current?.click()} data-testid="import-readonly-snapshot">只读查看数据包</button>
          {onImportPlan ? (
            <button type="button" className="ghost-button" onClick={() => governanceInputRef.current?.click()} data-testid="import-governance-preview">合并到我的地图</button>
          ) : null}
          {onImportPersonalFavorites ? (
            <button type="button" className="ghost-button" onClick={() => void importPersonalFavorites()} data-testid="import-personal-favorites">导入我的收藏清单</button>
          ) : null}
        </div>
        <div className="import-export-intent" data-testid="import-export-intent">
          <p><strong>只读查看</strong>：只写入本地 snapshots，用来打开分享视图，不会改变个人地点。</p>
          <p><strong>合并到我的地图</strong>：先进入冲突治理预览，确认前不会写入个人图钉、坐标或标签。</p>
          <p><strong>导出数据包</strong>：生成 `.foodmap.json`，这是跨设备携带路线，不是云同步或永久公网分享。</p>
        </div>
        {error ? <p className="inline-error" data-testid="import-error-message">{error}</p> : null}
        <input ref={governanceInputRef} hidden type="file" accept=".json,.foodmap.json,application/json" onChange={(event) => void previewGovernanceImport(event.target.files?.[0])} />
        <input ref={readonlyInputRef} hidden type="file" accept=".json,.foodmap.json,application/json" onChange={(event) => void importReadonlySnapshot(event.target.files?.[0])} />
      </section>
    </div>
  );
}
