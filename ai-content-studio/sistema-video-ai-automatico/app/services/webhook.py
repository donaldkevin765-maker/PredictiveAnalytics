from __future__ import annotations
import hashlib
import hmac
import httpx
from loguru import logger
from app.config import settings


class WebhookService:
    def __init__(self):
        self.url = settings.webhook_url
        self.secret = settings.webhook_secret

    async def notify(self, event: str, payload: dict):
        if not self.url:
            return

        data = {"event": event, **payload}
        headers = {"Content-Type": "application/json"}

        if self.secret:
            import json
            body = json.dumps(data, sort_keys=True)
            signature = hmac.new(self.secret.encode(), body.encode(), hashlib.sha256).hexdigest()
            headers["X-Webhook-Signature"] = signature

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(self.url, json=data, headers=headers)
                logger.info(f"Webhook {event} inviato: {resp.status_code}")
        except Exception as e:
            logger.warning(f"Errore webhook {event}: {e}")

    async def video_completed(self, video_id: int, output_url: str, duration: float):
        await self.notify("video.completed", {
            "video_id": video_id,
            "output_url": output_url,
            "duration": duration,
        })

    async def video_error(self, video_id: int, error: str):
        await self.notify("video.error", {
            "video_id": video_id,
            "error": error,
        })
