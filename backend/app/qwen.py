import json
from typing import Any

import httpx

from .config import OLLAMA_BASE_URL, OLLAMA_MODEL


def extract_json_object(raw: str) -> dict[str, Any]:
    try:
        return json.loads(raw.strip())
    except Exception:
        pass
    start = raw.find("{")
    end = raw.rfind("}")
    if start < 0 or end <= start:
        raise ValueError("No JSON object found")
    return json.loads(raw[start : end + 1])


async def qwen_schema(text: str) -> dict[str, Any]:
    prompt = '''你是地端資料庫工具建立助理。只能輸出 JSON，不要 markdown，不要 SQL。
格式必須是：{"intent":"tool.create","industry":"custom","tool_name":"中文工具名稱","table_name":"安全 snake_case 英文表名，不確定用 custom_records","fields":[{"field_key":"英文 snake_case","display_name":"中文欄位名稱","data_type":"text|number|date|datetime|boolean|enum|json","standard_field":"語意欄位","required":true,"searchable":true}],"recommended_tools":["中文工具名稱"],"requires_confirmation":true}。fields 最多 12 個。'''
    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": text},
        ],
        "options": {"temperature": 0.1},
    }
    async with httpx.AsyncClient(timeout=90) as client:
        res = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
        res.raise_for_status()
        return extract_json_object(res.json()["message"]["content"])
