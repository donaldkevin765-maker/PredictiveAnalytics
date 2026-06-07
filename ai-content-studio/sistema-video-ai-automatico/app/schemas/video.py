import datetime
from pydantic import BaseModel, Field
from typing import Optional


class VideoCreate(BaseModel):
    project_id: int
    title: str = Field(..., min_length=1, max_length=255)


class VideoResponse(BaseModel):
    id: int
    project_id: int
    title: str
    script: str
    status: str
    duration: float
    output_path: str
    error_message: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}


class GenerateScriptRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    duration_seconds: int = Field(default=60, ge=10, le=600)
    style: str = Field(default="informativo", pattern=r"^(informativo|divertente|serio|motivazionale|didattico)$")


class GenerateScriptResponse(BaseModel):
    video_id: int
    script: str
    scenes: list[dict]
