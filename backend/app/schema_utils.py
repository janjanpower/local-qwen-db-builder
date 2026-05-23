import re
from typing import Any


def safe_key(name: str, prefix: str = "field") -> str:
    mapping = {
        "姓名": "name", "名字": "name", "客戶姓名": "customer_name", "客人": "customer_name",
        "電話": "phone", "手機": "phone", "生日": "birthday", "備註": "note",
        "金額": "amount", "消費金額": "spending_amount", "最後到店日": "last_visit_date",
        "預約日期": "appointment_date", "日期": "date", "時間": "time",
        "服務項目": "service_name", "設計師": "staff_name",
        "品牌": "brand", "供應商": "supplier", "型號": "model", "尺寸": "size",
        "顏色": "color", "成本": "cost", "售價": "price", "價格": "price",
        "庫存": "stock_quantity", "庫存數量": "stock_quantity",
        "藥品名稱": "drug_name", "藥品代碼": "drug_code", "批號": "batch_no",
        "效期": "expiry_date", "儲位": "location",
        "香調": "fragrance_family", "前調": "top_notes", "中調": "middle_notes",
        "後調": "base_notes", "濃度": "concentration", "版本": "version",
        "保存期限": "expiry_date", "寵物名稱": "pet_name", "寵物名字": "pet_name",
        "飼主姓名": "owner_name", "聯絡電話": "phone", "特殊注意事項": "special_note",
    }
    cleaned = name.strip().replace(" ", "").replace("　", "")
    if cleaned in mapping:
        return mapping[cleaned]

    ascii_key = re.sub(r"[^a-zA-Z0-9_]+", "_", cleaned).strip("_").lower()
    if ascii_key and re.fullmatch(r"[a-z][a-z0-9_]{1,60}", ascii_key):
        return ascii_key
    return f"{prefix}_{abs(hash(cleaned)) % 100000}"


def infer_data_type(display_name: str) -> str:
    if any(word in display_name for word in ["日期", "生日", "到店日", "效期", "時間", "保存期限"]):
        return "date"
    if any(word in display_name for word in ["金額", "價格", "售價", "成本", "數量", "庫存", "費用", "濃度", "水溫", "投料量", "溶氧量"]):
        return "number"
    if any(word in display_name for word in ["是否", "啟用"]):
        return "boolean"
    return "text"


def infer_standard_field(display_name: str, field_key: str) -> str:
    mapping = {
        "姓名": "customer.name", "電話": "customer.phone", "生日": "customer.birthday",
        "備註": "record.note", "消費金額": "payment.amount", "最後到店日": "customer.last_visit_date",
        "品牌": "product.brand", "供應商": "supplier.name", "成本": "product.cost",
        "售價": "product.price", "庫存數量": "inventory.stock_quantity",
        "香調": "perfume.fragrance_family", "前調": "perfume.top_notes",
        "中調": "perfume.middle_notes", "後調": "perfume.base_notes",
        "濃度": "perfume.concentration", "版本": "record.version",
        "保存期限": "record.expiry_date", "寵物名稱": "pet.name", "寵物名字": "pet.name",
        "飼主姓名": "pet.owner_name", "聯絡電話": "customer.phone",
        "特殊注意事項": "record.special_note",
    }
    return mapping.get(display_name.strip(), f"custom.{field_key}")


def infer_tool_name(text: str) -> str:
    for pattern in [r"建立一個(.+?)，", r"建立(.+?)，", r"新增一個(.+?)，", r"新增(.+?)，"]:
        match = re.search(pattern, text)
        if match and match.group(1).strip():
            return match.group(1).strip()
    return "自訂資料工具"


def infer_table_name(tool_name: str) -> str:
    if "客戶" in tool_name:
        return "customers"
    if "預約" in tool_name:
        return "appointments"
    if "庫存" in tool_name:
        return "inventory_items"
    if "商品" in tool_name:
        return "products"
    return "custom_records"


def extract_fields(text: str) -> list[str]:
    target = ""
    for marker in ["要有", "包含", "記錄", "欄位有", "欄位包含"]:
        if marker in text:
            target = text.split(marker, 1)[1]
            break
    if not target:
        return []
    target = target.replace("。", "").replace(".", "").replace("，", "、").replace(",", "、").replace("和", "、").replace("以及", "、")
    fields: list[str] = []
    for item in target.split("、"):
        item = item.strip().replace("等等", "").replace("等", "")
        if item and item not in fields:
            fields.append(item)
    return fields


def fallback_schema(text: str) -> dict[str, Any]:
    fields = extract_fields(text) or ["名稱"]
    tool_name = infer_tool_name(text)
    used: set[str] = set()
    normalized_fields: list[dict[str, Any]] = []
    for index, display_name in enumerate(fields):
        field_key = safe_key(display_name)
        original_key = field_key
        suffix = 2
        while field_key in used:
            field_key = f"{original_key}_{suffix}"
            suffix += 1
        used.add(field_key)
        normalized_fields.append({
            "field_key": field_key,
            "display_name": display_name,
            "data_type": infer_data_type(display_name),
            "standard_field": infer_standard_field(display_name, field_key),
            "required": index == 0,
            "searchable": True,
        })
    return {
        "intent": "tool.create",
        "industry": "custom",
        "tool_name": tool_name,
        "table_name": infer_table_name(tool_name),
        "fields": normalized_fields,
        "recommended_tools": [f"新增{tool_name}", f"查詢{tool_name}", f"修改{tool_name}", f"匯出{tool_name}"],
        "requires_confirmation": True,
    }
