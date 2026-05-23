import re


def extract_field_rename(text: str) -> dict[str, str] | None:
    cleaned_text = text.strip().replace("。", "").replace(".", "")
    patterns = [
        r"(?:但我要|我要)?(?:將|把)?(.+?)欄位名稱(?:改為|改成|改叫|變成)(.+)",
        r"(?:但我要|我要)?(?:將|把)?(.+?)欄位(?:改為|改成|改叫|變成)(.+)",
        r"(?:但我要|我要)?(?:將|把)?(.+?)(?:改為|改成|改叫|變成)(.+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, cleaned_text)
        if not match:
            continue
        old_name = match.group(1).strip()
        new_name = match.group(2).strip()
        if any(word in old_name for word in ["建立", "新增", "產生"]):
            continue
        old_name = old_name.replace("但我要", "").replace("我要", "").replace("將", "").replace("把", "").strip()
        new_name = new_name.replace("欄位", "").replace("名稱", "").strip()
        if old_name and new_name and len(old_name) <= 20 and len(new_name) <= 20:
            return {"old_name": old_name, "new_name": new_name}
    return None


def parse_add(text: str) -> str | None:
    match = re.search(r"(?:新增|加入|增加)一個(.+?)欄位", text) or re.search(r"(?:新增|加入|增加)(.+?)欄位", text)
    return match.group(1).replace("。", "").strip() if match else None


def parse_delete(text: str) -> str | None:
    match = re.search(r"(?:刪除|移除|不要)(.+?)欄位", text)
    return match.group(1).replace("。", "").strip() if match else None


def is_tool_list_query(text: str) -> bool:
    return any(k in text for k in ["查看工具", "工具清單", "有哪些工具", "目前工具", "資料庫清單"])
