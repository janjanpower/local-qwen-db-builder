import { Database, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function DatabaseDock({ collapsed, setCollapsed, onOpen, toolCount }) {
  return (
    <aside className={`database-dock ${collapsed ? "collapsed" : ""}`}>
      <div className="dock-brand">
        <button className="dock-toggle" onClick={() => setCollapsed(!collapsed)} title="收合/展開">
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        {!collapsed && (
          <div className="dock-title">
            <strong>Workspace</strong>
            <span>本地資料工具</span>
          </div>
        )}
      </div>

      <button className="database-icon-button" onClick={onOpen} title="資料庫">
        <span className="database-icon-main">
          <Database size={22} />
        </span>
        {!collapsed && (
          <span className="database-action-text">
            <strong>資料庫</strong>
            <small>{toolCount > 0 ? `${toolCount} 個 TABLE` : "尚未建立 TABLE"}</small>
          </span>
        )}
        {toolCount > 0 && <span className="database-count">{toolCount}</span>}
      </button>

      {!collapsed && (
        <div className="dock-note">
          <span>靜態前端模式</span>
          <small>資料暫存在目前頁面狀態</small>
        </div>
      )}
    </aside>
  );
}
