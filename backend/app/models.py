import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator

AllowedDataType = Literal["text", "number", "date", "datetime", "boolean", "enum", "json"]


class ChatParseRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class FieldSuggestion(BaseModel):
    field_key: str
    display_name: str
    data_type: AllowedDataType
    standard_field: str
    required: bool = False
    searchable: bool = True

    @field_validator("field_key")
    @classmethod
    def validate_key(cls, value: str) -> str:
        if not re.fullmatch(r"[a-z][a-z0-9_]{1,60}", value):
            raise ValueError("field_key must be safe snake_case")
        return value


class SchemaSuggestion(BaseModel):
    intent: Literal["tool.create"]
    industry: str
    tool_name: str
    table_name: str
    fields: list[FieldSuggestion]
    recommended_tools: list[str]
    requires_confirmation: bool = True

    @field_validator("table_name")
    @classmethod
    def validate_table(cls, value: str) -> str:
        if not re.fullmatch(r"[a-z][a-z0-9_]{1,60}", value):
            raise ValueError("table_name must be safe snake_case")
        return value


class ApplyPlanResponse(BaseModel):
    plan_id: str
    tool_id: str
    status: str


class RenameFieldRequest(BaseModel):
    display_name: str
