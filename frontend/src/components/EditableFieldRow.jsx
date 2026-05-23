import { useState } from "react";

export function EditableFieldRow({ field, selected, onToggle, onRename }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(field.display_name);

  async function commit() {
    setEditing(false);
    const nextValue = value.trim();
    if (!nextValue || nextValue === field.display_name) {
      setValue(field.display_name);
      return;
    }
    await onRename(field, nextValue);
  }

  return (
    <div className="list-row editable-row">
      <span>
        <input type="checkbox" checked={selected} onChange={() => onToggle(field.id)} />
      </span>
      <span className="strong" onDoubleClick={() => setEditing(true)}>
        {editing ? (
          <input
            autoFocus
            className="inline-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setValue(field.display_name);
                setEditing(false);
              }
            }}
          />
        ) : field.display_name}
      </span>
      <span>{field.data_type}</span>
      <span><code>{field.field_key}</code></span>
    </div>
  );
}
