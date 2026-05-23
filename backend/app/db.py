import sqlite3
from pathlib import Path
from datetime import datetime, timezone

from .config import DATABASE_PATH


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_conn() -> sqlite3.Connection:
    Path(DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript(
            '''
            CREATE TABLE IF NOT EXISTS schema_plans (
                id TEXT PRIMARY KEY,
                source_prompt TEXT NOT NULL,
                normalized_schema_json TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                applied_at TEXT
            );

            CREATE TABLE IF NOT EXISTS tools (
                id TEXT PRIMARY KEY,
                plan_id TEXT NOT NULL,
                industry TEXT NOT NULL,
                tool_name TEXT NOT NULL,
                table_name TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS tool_fields (
                id TEXT PRIMARY KEY,
                tool_id TEXT NOT NULL,
                field_key TEXT NOT NULL,
                display_name TEXT NOT NULL,
                data_type TEXT NOT NULL,
                standard_field TEXT NOT NULL,
                required INTEGER NOT NULL,
                searchable INTEGER NOT NULL,
                sort_order INTEGER NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS tool_records (
                id TEXT PRIMARY KEY,
                tool_id TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS tool_call_logs (
                id TEXT PRIMARY KEY,
                event_type TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            '''
        )
