import { useRef } from "react";
import type { FoodLayer, FoodPlace, PhotoAsset } from "../../domain/types";
import { createSnapshot, downloadSnapshot, importSnapshotText } from "../../persistence/importExportCodec";

interface Props {
  open: boolean;
  places: FoodPlace[];
  layers: FoodLayer[];
  photos: PhotoAsset[];
  onClose: () => void;
  notify: (text: string) => void;
}

export function ImportExportDialog({ open, places, layers, photos, onClose, notify }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  if (!open) return null;

  async function exportFile() {
    downloadSnapshot(createSnapshot("我的美食地图", places, layers, photos));
    notify("已导出文件");
  }

  async function importFile(file?: File) {
    if (!file) return;
    try {
      await importSnapshotText(await file.text());
      notify("已导入快照");
      onClose();
    } catch {
      notify("文件格式不正确，未导入任何数据");
    }
  }

  return (
    <div className="modal-backdrop">
      <section className="modal compact" data-testid="import-export-dialog">
        <div className="modal__header">
          <h2>导入导出</h2>
          <button type="button" onClick={onClose}>关闭</button>
        </div>
        <div className="dialog-actions">
          <button type="button" className="primary-button" onClick={exportFile}>导出 .foodmap.json</button>
          <button type="button" className="ghost-button" onClick={() => inputRef.current?.click()}>导入 .foodmap.json</button>
        </div>
        <input ref={inputRef} hidden type="file" accept=".json,.foodmap.json,application/json" onChange={(event) => void importFile(event.target.files?.[0])} />
      </section>
    </div>
  );
}
