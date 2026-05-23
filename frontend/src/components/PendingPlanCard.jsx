function Badge({ children, tone = "default" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function PendingPlanCard({ plan, onApply, loading }) {
  if (!plan?.schema) return null;
  const schema = plan.schema;
  return (
    <div className="pending-card">
      <div className="pending-card-header">
        <div>
          <div className="badges">
            <Badge tone="warning">待確認</Badge>
          </div>
          <h3>{schema.tool_name}</h3>
          <p>Qwen 建議資料表：<strong>{schema.table_name}</strong></p>
        </div>
        <button className="primary-button" onClick={onApply} disabled={loading}>確認建立</button>
      </div>
      <div className="striped-list compact">
        <div className="list-row list-head pending-row">
          <span>欄位</span>
          <span>型別</span>
          <span>key</span>
        </div>
        {schema.fields.map((field) => (
          <div className="list-row pending-row" key={field.field_key}>
            <span className="strong">{field.display_name}</span>
            <span>{field.data_type}</span>
            <span><code>{field.field_key}</code></span>
          </div>
        ))}
      </div>
    </div>
  );
}
