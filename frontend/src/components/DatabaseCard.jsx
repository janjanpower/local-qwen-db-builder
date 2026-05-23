import { useMemo, useState } from "react";
import { Plus, RefreshCw, Trash2, X } from "lucide-react";
import { EditableFieldRow } from "./EditableFieldRow";

function Badge({ children, tone = "default" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function DatabaseCard({
  tools,
  onClose,
  onRefresh,
  onRenameField,
  onDeleteFields,
  onAddField,
  onAddRecord,
  onDeleteTool,
}) {
  const [activeToolId, setActiveToolId] = useState(tools[0]?.id || null);
  const [newFieldName, setNewFieldName] = useState("");
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);

  const activeTool = useMemo(() => tools.find((tool) => tool.id === activeToolId) || tools[0] || null, [tools, activeToolId]);

  function selectTool(toolId) {
    setActiveToolId(toolId);
    setSelectedFieldIds([]);
  }

  function toggleField(fieldId) {
    setSelectedFieldIds((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
    );
  }

  async function addField() {
    const name = newFieldName.trim();
    if (!name || !activeTool) return;
    await onAddField(activeTool.id, name);
    setNewFieldName("");
  }

  async function deleteSelectedFields() {
    if (!activeTool || selectedFieldIds.length === 0) return;
    await onDeleteFields(activeTool.id, selectedFieldIds);
    setSelectedFieldIds([]);
  }

  async function deleteCurrentTool(e, toolId) {
    e.stopPropagation();
    await onDeleteTool(toolId);
    setSelectedFieldIds([]);
    const nextTool = tools.find((tool) => tool.id !== toolId);
    setActiveToolId(nextTool?.id || null);
  }

  if (!activeTool) {
    return (
      <div className="floating-card-backdrop">
        <section className="floating-card small">
          <header className="floating-card-header">
            <h2>資料庫</h2>
            <button className="icon-button" onClick={onClose}><X size={18} /></button>
          </header>
          <div className="empty-database">目前尚未建立任何 TABLE。</div>
        </section>
      </div>
    );
  }

  const activeFields = activeTool.fields || [];
  const activeRecords = activeTool.records || [];

  return (
    <div className="floating-card-backdrop">
      <section className="floating-card">
        <header className="floating-card-header">
          <div>
            <div className="badges">
              <Badge tone="success">{activeTool.db_connected ? "active" : "offline"}</Badge>
            </div>
            <h2>資料庫 TABLE</h2>
            <p>左側保留資料庫入口；多個 TABLE 集中在這張卡片分頁。</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </header>

        <div className="table-toolbar">
          <div>
            <h3>{activeTool.tool_name}</h3>
            <p>目前 TABLE：{activeTool.table_name}</p>
          </div>
          <button className="primary-button" onClick={() => onAddRecord(activeTool.id)}>
            <Plus size={15} /> 新增 1 筆資料
          </button>
        </div>

        <div className="add-field-bar">
          <input
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addField(); }}
            placeholder="新增欄位，例如：保存期限"
          />
          <button className="square-action" onClick={addField} title="新增欄位"><Plus size={18} /></button>
          <button className="square-action" onClick={onRefresh} title="重新整理"><RefreshCw size={18} /></button>
          <button
            className="square-action danger"
            onClick={deleteSelectedFields}
            disabled={selectedFieldIds.length === 0}
            title="移除已勾選欄位"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="table-tabs">
          {tools.map((tool) => (
            <button key={tool.id} className={activeTool.id === tool.id ? "active" : ""} onClick={() => selectTool(tool.id)}>
              <span className="tab-title">{tool.table_name}</span>
              <span className="tab-remove" onClick={(e) => deleteCurrentTool(e, tool.id)}>×</span>
            </button>
          ))}
        </div>

        <div className="record-count-bar">
          <span>資料筆數：<strong>{activeTool.record_count || 0}</strong></span>
          <span>欄位：<strong>{activeTool.field_count ?? activeFields.length}</strong></span>
        </div>

        <div className="floating-card-body">
          <div className="section-title">欄位資料</div>
          <div className="striped-list">
            <div className="list-row list-head editable-row">
              <span>選取</span>
              <span>欄位名稱</span>
              <span>型別</span>
              <span>field_key</span>
            </div>
            {activeFields.map((field) => (
              <EditableFieldRow
                key={field.id}
                field={field}
                selected={selectedFieldIds.includes(field.id)}
                onToggle={toggleField}
                onRename={(targetField, nextName) => onRenameField(activeTool.id, targetField.id, nextName)}
              />
            ))}
          </div>

          <div className="section-title record-section-title">資料內容</div>
          <div className="record-table-wrap">
            <table className="record-table">
              <thead>
                <tr>
                  <th>#</th>
                  {activeFields.map((field) => <th key={field.id}>{field.display_name}</th>)}
                </tr>
              </thead>
              <tbody>
                {activeRecords.length === 0 ? (
                  <tr>
                    <td colSpan={activeFields.length + 1} className="empty-record-cell">
                      尚未新增任何資料。
                    </td>
                  </tr>
                ) : (
                  activeRecords.map((record, index) => (
                    <tr key={record.id}>
                      <td>{index + 1}</td>
                      {activeFields.map((field) => (
                        <td key={field.id}>
                          {record.payload?.[field.field_key] || <span className="empty-cell">空白</span>}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
