from __future__ import annotations

import datetime
from pydantic import BaseModel
from typing import Optional


class SocialAccountResponse(BaseModel):
    id: int
    platform: str
    platform_user_id: str
    platform_username: str
    connected: bool
    token_expiry: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}


class SocialAuthUrlResponse(BaseModel):
    url: str
    state: str


class SocialPublishRequest(BaseModel):
    video_id: int
    account_id: int
    title: Optional[str] = None
    description: Optional[str] = None


class SocialPublishResponse(BaseModel):
    success: bool
    platform_post_id: Optional[str] = None
    url: Optional[str] = None
    error: Optional[str] = None
