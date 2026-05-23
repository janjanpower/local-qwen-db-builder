import json
from typing import Any
from uuid import uuid4

from fastapi import HTTPException

from .db import get_conn, now_iso
from .models import SchemaSuggestion
from .schema_utils import infer_data_type, infer_standard_field, safe_key


def log_event(event_type: str, payload: dict[str, Any]) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO tool_call_logs(id,event_type,payload_json,created_at) VALUES(?,?,?,?)",
            (str(uuid4()), event_type, json.dumps(payload, ensure_ascii=False), now_iso()),
        )


def save_plan(source_prompt: str, schema: SchemaSuggestion) -> str:
    plan_id = str(uuid4())
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO schema_plans(id,source_prompt,normalized_schema_json,status,created_at) VALUES(?,?,?,?,?)",
            (plan_id, source_prompt, json.dumps(schema.model_dump(mode="json"), ensure_ascii=False), "pending", now_iso()),
        )
    log_event("schema_plan.created", {"plan_id": plan_id, "schema": schema.model_dump(mode="json")})
    return plan_id



def all_tools() -> list[dict[str, Any]]:
    with get_conn() as conn:
        tool_rows = conn.execute("SELECT * FROM tools ORDER BY created_at DESC").fetchall()
        result: list[dict[str, Any]] = []

        for tool in tool_rows:
            fields = conn.execute(
                "SELECT * FROM tool_fields WHERE tool_id=? ORDER BY sort_order ASC",
                (tool["id"],),
            ).fetchall()

            record_rows = conn.execute(
                "SELECT * FROM tool_records WHERE tool_id=? ORDER BY created_at ASC",
                (tool["id"],),
            ).fetchall()

            field_list = [
                {
                    "id": f["id"],
                    "field_key": f["field_key"],
                    "display_name": f["display_name"],
                    "data_type": f["data_type"],
                    "standard_field": f["standard_field"],
                    "required": bool(f["required"]),
                    "searchable": bool(f["searchable"]),
                }
                for f in fields
            ]

            record_list = [
                {
                    "id": r["id"],
                    "payload": json.loads(r["payload_json"] or "{}"),
                    "created_at": r["created_at"],
                }
                for r in record_rows
            ]

            record_count = len(record_list)
            field_count = len(field_list)

            result.append(
                {
                    "id": tool["id"],
                    "plan_id": tool["plan_id"],
                    "industry": tool["industry"],
                    "tool_name": tool["tool_name"],
                    "table_name": tool["table_name"],
                    "status": tool["status"],
                    "db_connected": True,
                    "created_at": tool["created_at"],
                    "record_count": record_count,
                    "field_count": field_count,
                    "records": record_list,
                    "tables": [
                        {
                            "table_name": tool["table_name"],
                            "record_count": record_count,
                            "field_count": field_count,
                            "fields": field_list,
                            "records": record_list,
                        }
                    ],
                    "fields": field_list,
                }
            )

        return result

def apply_plan(plan_id: str) -> str:
    with get_conn() as conn:
        plan = conn.execute("SELECT * FROM schema_plans WHERE id=?", (plan_id,)).fetchone()
        if not plan:
            raise HTTPException(status_code=404, detail="找不到 schema plan")
        existing = conn.execute("SELECT id FROM tools WHERE plan_id=?", (plan_id,)).fetchone()
        if existing:
            return existing["id"]
        schema = SchemaSuggestion.model_validate_json(plan["normalized_schema_json"])
        tool_id = str(uuid4())
        conn.execute(
            "INSERT INTO tools(id,plan_id,industry,tool_name,table_name,status,created_at) VALUES(?,?,?,?,?,?,?)",
            (tool_id, plan_id, schema.industry, schema.tool_name, schema.table_name, "active", now_iso()),
        )
        for index, field in enumerate(schema.fields):
            conn.execute(
                "INSERT INTO tool_fields(id,tool_id,field_key,display_name,data_type,standard_field,required,searchable,sort_order,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
                (str(uuid4()), tool_id, field.field_key, field.display_name, field.data_type, field.standard_field, 1 if field.required else 0, 1 if field.searchable else 0, index, now_iso()),
            )
        conn.execute("UPDATE schema_plans SET status=?, applied_at=? WHERE id=?", ("applied", now_iso(), plan_id))
    return tool_id


def delete_tool(tool_id: str) -> dict[str, Any]:
    with get_conn() as conn:
        tool = conn.execute("SELECT * FROM tools WHERE id=?", (tool_id,)).fetchone()
        if not tool:
            raise HTTPException(status_code=404, detail="找不到資料庫分頁")
        conn.execute("DELETE FROM tool_fields WHERE tool_id=?", (tool_id,))
        conn.execute("DELETE FROM tool_records WHERE tool_id=?", (tool_id,))
        conn.execute("DELETE FROM tools WHERE id=?", (tool_id,))
    log_event("tool.deleted", {"tool_id": tool_id})
    return {"action": "tool.delete", "message": "已移除資料庫分頁。", "tools": all_tools()}


def rename_pending_schema_field(old_name: str, new_name: str) -> dict[str, Any] | None:
    with get_conn() as conn:
        plan = conn.execute("SELECT * FROM schema_plans WHERE status='pending' ORDER BY created_at DESC LIMIT 1").fetchone()
        if not plan:
            return None
        schema_json = json.loads(plan["normalized_schema_json"])
        fields = schema_json.get("fields", [])
        matched = False
        for field in fields:
            if field.get("display_name") == old_name or field.get("field_key") == old_name:
                field["display_name"] = new_name
                field_key = field.get("field_key", safe_key(new_name))
                field["standard_field"] = infer_standard_field(new_name, field_key)
                matched = True
                break
        if not matched:
            return None
        conn.execute("UPDATE schema_plans SET normalized_schema_json=? WHERE id=?", (json.dumps(schema_json, ensure_ascii=False), plan["id"]))
    log_event("schema_plan_field.renamed", {"plan_id": plan["id"], "old": old_name, "new": new_name, "schema": schema_json})
    return {
        "action": "schema_plan.field.rename",
        "message": f"已先將待確認規格中的「{old_name}」欄位名稱改為「{new_name}」。",
        "plan_id": plan["id"],
        "schema": schema_json,
    }


def latest_tool_id() -> str:
    with get_conn() as conn:
        tool = conn.execute("SELECT * FROM tools ORDER BY created_at DESC LIMIT 1").fetchone()
        if not tool:
            raise HTTPException(status_code=404, detail="目前沒有已建立的工具")
        return tool["id"]


def rename_tool_field(tool_id: str, old_name: str, new_name: str) -> dict[str, Any]:
    with get_conn() as conn:
        field = conn.execute("SELECT * FROM tool_fields WHERE tool_id=? AND (display_name=? OR field_key=?) LIMIT 1", (tool_id, old_name, old_name)).fetchone()
        if not field:
            raise HTTPException(status_code=404, detail=f"找不到「{old_name}」欄位")
        conn.execute("UPDATE tool_fields SET display_name=? WHERE id=?", (new_name, field["id"]))
    log_event("tool_field.renamed", {"tool_id": tool_id, "old": old_name, "new": new_name})
    return {"action": "tool.field.rename", "message": f"已將「{old_name}」欄位名稱改為「{new_name}」。", "tools": all_tools()}


def rename_context_field(old_name: str, new_name: str) -> dict[str, Any]:
    pending = rename_pending_schema_field(old_name, new_name)
    if pending:
        return pending
    return rename_tool_field(latest_tool_id(), old_name, new_name)


def rename_tool_field_by_id(tool_id: str, field_id: str, new_name: str) -> dict[str, Any]:
    with get_conn() as conn:
        field = conn.execute("SELECT * FROM tool_fields WHERE tool_id=? AND id=?", (tool_id, field_id)).fetchone()
        if not field:
            raise HTTPException(status_code=404, detail="找不到欄位")
        conn.execute("UPDATE tool_fields SET display_name=?, standard_field=? WHERE id=?", (new_name, infer_standard_field(new_name, field["field_key"]), field_id))
    log_event("tool_field.renamed_by_id", {"tool_id": tool_id, "field_id": field_id, "new": new_name})
    return {"action": "tool.field.rename", "message": f"已更新欄位名稱為「{new_name}」。", "tools": all_tools()}


def add_field(tool_id: str | None, name: str) -> dict[str, Any]:
    tool_id = tool_id or latest_tool_id()
    with get_conn() as conn:
        sort_order = conn.execute("SELECT COUNT(*) AS c FROM tool_fields WHERE tool_id=?", (tool_id,)).fetchone()["c"]
        field_key = safe_key(name)
        original_key = field_key
        suffix = 2
        while conn.execute("SELECT 1 FROM tool_fields WHERE tool_id=? AND field_key=?", (tool_id, field_key)).fetchone():
            field_key = f"{original_key}_{suffix}"
            suffix += 1
        conn.execute(
            "INSERT INTO tool_fields(id,tool_id,field_key,display_name,data_type,standard_field,required,searchable,sort_order,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
            (str(uuid4()), tool_id, field_key, name, infer_data_type(name), infer_standard_field(name, field_key), 0, 1, sort_order, now_iso()),
        )
    log_event("tool_field.added", {"tool_id": tool_id, "name": name})
    return {"action": "tool.field.add", "message": f"已新增「{name}」欄位。", "tools": all_tools()}


def delete_field(tool_id: str | None, field_name_or_id: str) -> dict[str, Any]:
    tool_id = tool_id or latest_tool_id()
    with get_conn() as conn:
        field = conn.execute("SELECT * FROM tool_fields WHERE tool_id=? AND (id=? OR display_name=? OR field_key=?) LIMIT 1", (tool_id, field_name_or_id, field_name_or_id, field_name_or_id)).fetchone()
        if not field:
            raise HTTPException(status_code=404, detail=f"找不到「{field_name_or_id}」欄位")
        conn.execute("DELETE FROM tool_fields WHERE id=?", (field["id"],))
    log_event("tool_field.deleted", {"tool_id": tool_id, "field": field_name_or_id})
    return {"action": "tool.field.delete", "message": f"已刪除「{field['display_name']}」欄位。", "tools": all_tools()}



def add_record(tool_id: str) -> dict[str, Any]:
    with get_conn() as conn:
        fields = conn.execute(
            "SELECT field_key FROM tool_fields WHERE tool_id=? ORDER BY sort_order ASC",
            (tool_id,),
        ).fetchall()

        payload = {field["field_key"]: "" for field in fields}

        conn.execute(
            "INSERT INTO tool_records(id,tool_id,payload_json,created_at) VALUES(?,?,?,?)",
            (str(uuid4()), tool_id, json.dumps(payload, ensure_ascii=False), now_iso()),
        )

    log_event("tool_record.created", {"tool_id": tool_id})
    return {"action": "tool.record.add", "message": "已新增 1 筆資料。", "tools": all_tools()}

