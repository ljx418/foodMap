import { Download, Filter, MoreHorizontal, Plus, Search, Share2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSearchAdd: (value: string) => void;
  onAdd: () => void;
  onFilter: () => void;
  onShare: () => void;
  onExport: () => void;
  onImport: () => void;
  onMore: () => void;
}

export function WorkspaceHeader({ keyword, onKeywordChange, onSearchAdd, onAdd, onFilter, onShare, onExport, onImport, onMore }: Props) {
  const trimmedKeyword = keyword.trim();
  const [compactCopy, setCompactCopy] = useState(() => typeof window !== "undefined" ? window.matchMedia("(max-width: 520px)").matches : false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 520px)");
    const update = () => setCompactCopy(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return (
    <header className="workspace-header">
      <div className="brand">
        <span>FoodMap</span>
        <small>美食地图</small>
      </div>
      <div className="search-box">
        <Search size={18} />
        <input
          data-testid="workspace-search"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || trimmedKeyword.length === 0) return;
            event.preventDefault();
            onSearchAdd(trimmedKeyword);
          }}
          placeholder={compactCopy ? "搜索 / 新增店名" : "搜索地点，输入店名或链接新增"}
        />
        {trimmedKeyword.length > 0 ? (
          <button type="button" className="search-add-button" onClick={() => onSearchAdd(trimmedKeyword)} data-testid="search-add-place">
            新增
          </button>
        ) : null}
      </div>
      <div className="header-actions">
        <button type="button" className="tool-button header-filter-button" onClick={onFilter} aria-label="筛选">
          <Filter size={18} />
          <span>筛选</span>
        </button>
        <button type="button" className="tool-button header-secondary-tool" onClick={onImport} aria-label="导入">
          <Upload size={18} />
          <span>导入</span>
        </button>
        <button type="button" className="tool-button header-secondary-tool" onClick={onExport} aria-label="导出">
          <Download size={18} />
          <span>导出</span>
        </button>
        <button type="button" className="tool-button header-secondary-tool" onClick={onShare} aria-label="分享">
          <Share2 size={18} />
          <span>分享</span>
        </button>
        <button type="button" className="tool-button mobile-more-button" onClick={onMore} aria-label="更多工具">
          <MoreHorizontal size={18} />
          <span>更多</span>
        </button>
        <button type="button" className="primary-button" onClick={onAdd} data-testid="workspace-add-place">
          <Plus size={18} />
          新增
        </button>
      </div>
    </header>
  );
}
