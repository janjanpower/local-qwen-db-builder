from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .commands import extract_field_rename, is_tool_list_query, parse_add, parse_delete
from .config import OLLAMA_MODEL, USE_OLLAMA
from .db import init_db
from .models import ApplyPlanResponse, ChatParseRequest, RenameFieldRequest, SchemaSuggestion
from .qwen import qwen_schema
from .repositories import (
    add_field,
    add_record,
    all_tools,
    apply_plan,
    delete_field,
    delete_tool,
    delete_tool,
    rename_context_field,
    rename_tool_field_by_id,
    save_plan,
)
from .schema_utils import fallback_schema

app = FastAPI(title="Local Qwen DB Builder API", version="0.3.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"ok": True, "use_ollama": USE_OLLAMA, "model": OLLAMA_MODEL}


@app.post("/api/chat/parse")
async def parse_chat(req: ChatParseRequest) -> dict[str, Any]:
    text = req.message.strip()
    rename_request = extract_field_rename(text)
    if rename_request:
        return rename_context_field(rename_request["old_name"], rename_request["new_name"])

    if is_tool_list_query(text):
        return {"action": "tool.list", "message": "已整理目前建立的資料庫工具。", "tools": all_tools()}

    added = parse_add(text)
    if added:
        return add_field(None, added)

    deleted = parse_delete(text)
    if deleted:
        return delete_field(None, deleted)

    model_source = "fallback"
    if USE_OLLAMA:
        try:
            raw_schema = await qwen_schema(text)
            model_source = "qwen_ollama"
        except Exception as exc:
            raw_schema = fallback_schema(text)
            model_source = f"fallback_after_ollama_error: {type(exc).__name__}"
    else:
        raw_schema = fallback_schema(text)

    try:
        schema = SchemaSuggestion.model_validate(raw_schema)
    except Exception:
        schema = SchemaSuggestion.model_validate(fallback_schema(text))
        model_source = f"{model_source} -> fallback_after_schema_validation"

    plan_id = save_plan(text, schema)
    return {
        "plan_id": plan_id,
        "model_source": model_source,
        "message": f"已產生「{schema.tool_name}」待確認資料庫規格。",
        "schema": schema.model_dump(mode="json"),
    }


@app.post("/api/schema-plans/{plan_id}/apply", response_model=ApplyPlanResponse)
def apply_schema_plan(plan_id: str) -> ApplyPlanResponse:
    tool_id = apply_plan(plan_id)
    return ApplyPlanResponse(plan_id=plan_id, tool_id=tool_id, status="applied")


@app.get("/api/tools")
def list_tools() -> list[dict[str, Any]]:
    return all_tools()


@app.delete("/api/tools/{tool_id}")
def api_delete_tool(tool_id: str) -> dict[str, Any]:
    return delete_tool(tool_id)


@app.post("/api/tools/{tool_id}/fields")
def api_add_field(tool_id: str, body: RenameFieldRequest) -> dict[str, Any]:
    return add_field(tool_id, body.display_name)


@app.patch("/api/tools/{tool_id}/fields/{field_id}")
def api_rename_field(tool_id: str, field_id: str, body: RenameFieldRequest) -> dict[str, Any]:
    return rename_tool_field_by_id(tool_id, field_id, body.display_name)


@app.delete("/api/tools/{tool_id}/fields/{field_id}")
def api_delete_field(tool_id: str, field_id: str) -> dict[str, Any]:
    return delete_field(tool_id, field_id)


@app.post("/api/tools/{tool_id}/records")
def api_add_record(tool_id: str) -> dict[str, Any]:
    return add_record(tool_id)
