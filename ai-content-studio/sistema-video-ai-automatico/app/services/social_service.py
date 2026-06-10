from __future__ import annotations

import secrets
import httpx
from loguru import logger
from urllib.parse import urlencode
from typing import Optional

from app.config import settings


OAUTH_STATES: dict[str, str] = {}


class SocialProvider:
    def __init__(self, platform: str):
        self.platform = platform
        self.client_id = ""
        self.client_secret = ""
        self.redirect_uri = ""
        self.auth_url = ""
        self.token_url = ""
        self.scopes = ""
        self.api_base = ""

    def get_auth_url(self, state: str) -> str:
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": self.scopes,
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
        return f"{self.auth_url}?{urlencode(params)}"

    async def exchange_code(self, code: str) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                self.token_url,
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                    "grant_type": "authorization_code",
                },
                headers={"Accept": "application/json"},
            )
            if resp.is_error:
                logger.error(f"Token exchange failed for {self.platform}: {resp.text}")
                raise Exception(f"Token exchange failed: {resp.status_code}")
            return resp.json()

    async def refresh_access_token(self, refresh_token: str) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                self.token_url,
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token",
                },
                headers={"Accept": "application/json"},
            )
            if resp.is_error:
                logger.error(f"Token refresh failed for {self.platform}: {resp.text}")
                raise Exception(f"Token refresh failed: {resp.status_code}")
            return resp.json()

    async def get_user_info(self, access_token: str) -> dict:
        raise NotImplementedError

    async def upload_video(self, access_token: str, video_url: str, title: str, description: str) -> dict:
        raise NotImplementedError


class YouTubeProvider(SocialProvider):
    def __init__(self):
        super().__init__("youtube")
        self.client_id = settings.youtube_client_id or ""
        self.client_secret = settings.youtube_client_secret or ""
        base = settings.social_callback_base or "http://localhost:8000"
        self.redirect_uri = f"{base}/api/v1/social/callback/youtube"
        self.auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        self.token_url = "https://oauth2.googleapis.com/token"
        self.scopes = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly"
        self.api_base = "https://www.googleapis.com/youtube/v3"

    async def get_user_info(self, access_token: str) -> dict:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{self.api_base}/channels",
                params={"part": "snippet", "mine": "true"},
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if resp.is_error:
                raise Exception(f"Failed to get YouTube channel: {resp.text}")
            items = resp.json().get("items", [])
            if not items:
                return {"id": "", "name": ""}
            return {"id": items[0]["id"], "name": items[0]["snippet"]["title"]}

    async def upload_video(self, access_token: str, video_url: str, title: str, description: str) -> dict:
        async with httpx.AsyncClient(timeout=600.0) as client:
            snippet = {
                "snippet": {
                    "title": title,
                    "description": description,
                    "categoryId": "22",
                },
                "status": {"privacyStatus": "public"},
            }
            resp = await client.post(
                f"{self.api_base}/videos?part=snippet,status&uploadType=resumable",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                    "X-Upload-Content-Type": "video/*",
                },
                json=snippet,
            )
            if resp.is_error:
                raise Exception(f"YouTube upload init failed: {resp.text}")
            upload_url = resp.headers.get("Location", "")
            if not upload_url:
                raise Exception("No upload URL returned from YouTube")
            video_resp = await client.put(upload_url, content=b"")
            if video_resp.is_error:
                raise Exception(f"YouTube upload failed: {video_resp.text}")
            data = video_resp.json()
            return {
                "success": True,
                "platform_post_id": data.get("id", ""),
                "url": f"https://www.youtube.com/watch?v={data.get('id', '')}",
            }

    async def list_videos(self, access_token: str, max_results: int = 10) -> list[dict]:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{self.api_base}/videos",
                params={
                    "part": "snippet,status",
                    "mine": "true",
                    "maxResults": max_results,
                    "order": "date",
                },
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if resp.is_error:
                raise Exception(f"Failed to list YouTube videos: {resp.text}")
            items = resp.json().get("items", [])
            return [
                {
                    "id": item["id"],
                    "title": item["snippet"]["title"],
                    "thumbnail": item["snippet"]["thumbnails"].get("high", {}).get("url", ""),
                    "url": f"https://www.youtube.com/watch?v={item['id']}",
                    "published_at": item["snippet"]["publishedAt"],
                    "privacy": item["status"]["privacyStatus"],
                }
                for item in items
            ]


class InstagramProvider(SocialProvider):
    def __init__(self):
        super().__init__("instagram")
        self.client_id = settings.instagram_client_id or ""
        self.client_secret = settings.instagram_client_secret or ""
        base = settings.social_callback_base or "http://localhost:8000"
        self.redirect_uri = f"{base}/api/v1/social/callback/instagram"
        self.auth_url = "https://www.facebook.com/v19.0/dialog/oauth"
        self.token_url = "https://graph.facebook.com/v19.0/oauth/access_token"
        self.scopes = "instagram_basic,instagram_content_publish,pages_read_engagement"
        self.api_base = "https://graph.facebook.com/v19.0"

    async def get_user_info(self, access_token: str) -> dict:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{self.api_base}/me/accounts",
                params={"access_token": access_token, "fields": "id,name,instagram_business_account"},
            )
            if resp.is_error:
                raise Exception(f"Failed to get Instagram account: {resp.text}")
            data = resp.json().get("data", [])
            for page in data:
                ig = page.get("instagram_business_account")
                if ig:
                    ig_resp = await client.get(
                        f"{self.api_base}/{ig['id']}",
                        params={"access_token": access_token, "fields": "id,username,name"},
                    )
                    if ig_resp.is_success:
                        ig_data = ig_resp.json()
                        return {"id": ig_data.get("id", ""), "name": ig_data.get("username", ig_data.get("name", ""))}
            return {"id": "", "name": ""}

    async def upload_video(self, access_token: str, video_url: str, title: str, description: str) -> dict:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                user_resp = await client.get(
                    f"{self.api_base}/me/accounts",
                    params={"access_token": access_token, "fields": "id,instagram_business_account"},
                )
                if user_resp.is_error:
                    raise Exception("Instagram: cannot find business account")
                data = user_resp.json().get("data", [])
                ig_id = ""
                for page in data:
                    ig = page.get("instagram_business_account")
                    if ig:
                        ig_id = ig["id"]
                        break
                if not ig_id:
                    raise Exception("Instagram: no business account found. Connect a Facebook Page with Instagram Business.")

                creation_resp = await client.post(
                    f"{self.api_base}/{ig_id}/media",
                    params={"access_token": access_token},
                    json={
                        "media_type": "VIDEO",
                        "video_url": video_url,
                        "caption": f"{title}\n\n{description}" if description else title,
                    },
                )
                if creation_resp.is_error:
                    raise Exception(f"Instagram media creation failed: {creation_resp.text}")
                container_id = creation_resp.json().get("id")
                if not container_id:
                    raise Exception("Instagram: no container ID returned")

                publish_resp = await client.post(
                    f"{self.api_base}/{ig_id}/media_publish",
                    params={"access_token": access_token},
                    json={"creation_id": container_id},
                )
                if publish_resp.is_error:
                    raise Exception(f"Instagram publish failed: {publish_resp.text}")
                media_id = publish_resp.json().get("id", "")
                return {
                    "success": True,
                    "platform_post_id": media_id,
                    "url": f"https://www.instagram.com/p/{media_id}/",
                }
        except Exception as e:
            logger.error(f"Instagram upload error: {e}")
            raise

    async def list_media(self, access_token: str, max_results: int = 10) -> list[dict]:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                user_resp = await client.get(
                    f"{self.api_base}/me/accounts",
                    params={"access_token": access_token, "fields": "id,instagram_business_account"},
                )
                data = user_resp.json().get("data", [])
                ig_id = ""
                for page in data:
                    ig = page.get("instagram_business_account")
                    if ig:
                        ig_id = ig["id"]
                        break
                if not ig_id:
                    return []
                media_resp = await client.get(
                    f"{self.api_base}/{ig_id}/media",
                    params={
                        "access_token": access_token,
                        "fields": "id,caption,media_type,media_url,thumbnail_url,timestamp",
                        "limit": max_results,
                    },
                )
                if media_resp.is_error:
                    return []
                items = media_resp.json().get("data", [])
                return [
                    {
                        "id": item["id"],
                        "title": item.get("caption", "")[:100],
                        "thumbnail": item.get("thumbnail_url", item.get("media_url", "")),
                        "url": f"https://www.instagram.com/p/{item['id']}/",
                        "published_at": item.get("timestamp", ""),
                        "media_type": item.get("media_type", ""),
                    }
                    for item in items
                ]
        except Exception as e:
            logger.error(f"Instagram list error: {e}")
            return []


class TikTokProvider(SocialProvider):
    def __init__(self):
        super().__init__("tiktok")
        self.client_id = settings.tiktok_client_key or ""
        self.client_secret = settings.tiktok_client_secret or ""
        base = settings.social_callback_base or "http://localhost:8000"
        self.redirect_uri = f"{base}/api/v1/social/callback/tiktok"
        self.auth_url = "https://www.tiktok.com/v2/auth/authorize/"
        self.token_url = "https://open.tiktokapis.com/v2/oauth/token/"
        self.scopes = "user.info.basic,video.upload,video.publish"
        self.api_base = "https://open.tiktokapis.com/v2"

    async def get_user_info(self, access_token: str) -> dict:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{self.api_base}/user/info/",
                params={"fields": "open_id,union_id,avatar_url,display_name"},
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if resp.is_error:
                raise Exception(f"Failed to get TikTok user: {resp.text}")
            data = resp.json().get("data", {})
            user = data.get("user", {})
            return {"id": user.get("open_id", ""), "name": user.get("display_name", "")}

    async def upload_video(self, access_token: str, video_url: str, title: str, description: str) -> dict:
        async with httpx.AsyncClient(timeout=600.0) as client:
            init_resp = await client.post(
                f"{self.api_base}/video/upload/init/",
                headers={"Authorization": f"Bearer {access_token}"},
                json={
                    "source_info": {
                        "source": "FILE_URL",
                        "video_url": video_url,
                    }
                },
            )
            if init_resp.is_error:
                raise Exception(f"TikTok upload init failed: {init_resp.text}")
            upload_url = init_resp.json().get("data", {}).get("upload_url", "")
            if not upload_url:
                raise Exception("No upload URL from TikTok")

            file_resp = await client.put(upload_url, content=b"")
            if file_resp.is_error:
                raise Exception(f"TikTok file upload failed: {file_resp.text}")

            publish_resp = await client.post(
                f"{self.api_base}/video/publish/",
                headers={"Authorization": f"Bearer {access_token}"},
                json={
                    "post_info": {
                        "title": title,
                        "description": description,
                        "privacy_level": "PUBLIC",
                    }
                },
            )
            if publish_resp.is_error:
                raise Exception(f"TikTok publish failed: {publish_resp.text}")
            data = publish_resp.json().get("data", {})
            post_id = data.get("publish_id", "")
            return {
                "success": True,
                "platform_post_id": post_id,
                "url": f"https://www.tiktok.com/@{post_id}",
            }


PROVIDERS: dict[str, SocialProvider] = {
    "youtube": YouTubeProvider(),
    "instagram": InstagramProvider(),
    "tiktok": TikTokProvider(),
}

VALID_PLATFORMS = {"youtube", "instagram", "tiktok"}


def get_provider(platform: str) -> SocialProvider:
    p = PROVIDERS.get(platform)
    if not p:
        raise ValueError(f"Platform '{platform}' not supported. Use: {', '.join(sorted(VALID_PLATFORMS))}")
    if not p.client_id:
        raise ValueError(f"{platform}: OAuth non configurato (manca client_id/.env)")
    return p


def create_oauth_state() -> str:
    state = secrets.token_urlsafe(32)
    OAUTH_STATES[state] = "pending"
    return state


def consume_oauth_state(state: str) -> bool:
    return OAUTH_STATES.pop(state, None) is not None
