import httpx
from loguru import logger
from app.config import settings


class SupabaseStorage:
    def __init__(self):
        self.url = settings.supabase_url
        self.service_key = settings.supabase_service_key
        self.bucket = settings.supabase_bucket
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=f"{self.url}/storage/v1",
                headers={
                    "apikey": self.service_key,
                    "Authorization": f"Bearer {self.service_key}",
                },
                timeout=120.0,
            )
        return self._client

    async def upload_file(self, local_path: str, remote_path: str) -> str | None:
        if not self.url or not self.service_key:
            logger.warning("Supabase non configurato, salto upload")
            return None
        client = await self._get_client()
        with open(local_path, "rb") as f:
            resp = await client.post(
                f"/object/{self.bucket}/{remote_path}",
                content=f.read(),
                headers={"content-type": "application/octet-stream"},
            )
        if resp.is_success:
            public_url = f"{self.url}/storage/v1/object/public/{self.bucket}/{remote_path}"
            logger.info(f"File caricato su Supabase: {public_url}")
            return public_url
        logger.error(f"Errore upload Supabase: {resp.status_code} {resp.text}")
        return None

    async def delete_file(self, remote_path: str) -> bool:
        if not self.url or not self.service_key:
            return False
        client = await self._get_client()
        resp = await client.delete(f"/object/{self.bucket}/{remote_path}")
        return resp.is_success

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None


supabase_storage = SupabaseStorage()
