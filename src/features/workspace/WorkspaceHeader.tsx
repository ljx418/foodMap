import { Download, Filter, Plus, Search, Share2, Sparkles, Upload } from "lucide-react";

interface Props {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onAdd: () => void;
  onFilter: () => void;
  onShare: () => void;
  onExport: () => void;
  onImport: () => void;
  onLoadRecommendations: () => void;
}

export function WorkspaceHeader({ keyword, onKeywordChange, onAdd, onFilter, onShare, onExport, onImport, onLoadRecommendations }: Props) {
  return (
    <header className="workspace-header">
      <div className="brand">
        <span>FoodMap</span>
        <small>美食地图</small>
      </div>
      <label className="search-box">
        <Search size={18} />
        <input
          data-testid="workspace-search"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="搜索已保存地点、标签、城市"
        />
      </label>
      <div className="header-actions">
        <button type="button" className="tool-button" onClick={onFilter} aria-label="筛选">
          <Filter size={18} />
          <span>筛选</span>
        </button>
        <button type="button" className="tool-button" onClick={onImport} aria-label="导入">
          <Upload size={18} />
          <span>导入</span>
        </button>
        <button type="button" className="tool-button" onClick={onExport} aria-label="导出">
          <Download size={18} />
          <span>导出</span>
        </button>
        <button type="button" className="tool-button" onClick={onShare} aria-label="分享">
          <Share2 size={18} />
          <span>分享</span>
        </button>
        <button type="button" className="tool-button" onClick={onLoadRecommendations} aria-label="加载扫街榜" data-testid="load-recommendations">
          <Sparkles size={18} />
          <span>扫街榜</span>
        </button>
        <button type="button" className="primary-button" onClick={onAdd} data-testid="workspace-add-place">
          <Plus size={18} />
          新增
        </button>
      </div>
    </header>
  );
}
