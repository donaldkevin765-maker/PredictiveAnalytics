from __future__ import annotations

import httpx
from loguru import logger
from typing import Any
from app.config import settings


class SupabaseDB:
    def __init__(self):
        self.url = settings.supabase_url
        self.service_key = settings.supabase_service_key
        self.headers = {
            "apikey": self.service_key or settings.supabase_anon_key or "",
            "Authorization": f"Bearer {self.service_key}" if self.service_key else "",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Prefer": "return=representation",
        }
        self.client = httpx.AsyncClient(timeout=30.0)

    def _table_url(self, table: str) -> str:
        return f"{self.url}/rest/v1/{table}"

    async def select(self, table: str, filters: dict | None = None, order: str | None = None, limit: int | None = None) -> list[dict]:
        params = {}
        if order:
            params["order"] = order
        if limit:
            params["limit"] = str(limit)
        resp = await self.client.get(
            self._table_url(table),
            headers=self.headers,
            params=params,
        )
        if resp.is_error:
            logger.error(f"Supabase select {table}: {resp.status_code} {resp.text}")
            return []
        result = resp.json()
        if filters:
            result = [r for r in result if all(r.get(k) == v for k, v in filters.items())]
        return result

    async def insert(self, table: str, data: dict) -> dict | None:
        resp = await self.client.post(
            self._table_url(table),
            headers=self.headers,
            json=data,
        )
        if resp.is_error:
            logger.error(f"Supabase insert {table}: {resp.status_code} {resp.text}")
            return None
        items = resp.json()
        return items[0] if items else None

    async def update(self, table: str, id: int, data: dict) -> dict | None:
        resp = await self.client.patch(
            self._table_url(table),
            headers={**self.headers, "Prefer": "return=representation"},
            params={"id": f"eq.{id}"},
            json=data,
        )
        if resp.is_error:
            logger.error(f"Supabase update {table}: {resp.status_code} {resp.text}")
            return None
        items = resp.json()
        return items[0] if items else None

    async def delete(self, table: str, id: int) -> bool:
        resp = await self.client.delete(
            self._table_url(table),
            headers=self.headers,
            params={"id": f"eq.{id}"},
        )
        if resp.is_error:
            logger.error(f"Supabase delete {table}: {resp.status_code} {resp.text}")
            return False
        return True

    async def get(self, table: str, id: int) -> dict | None:
        resp = await self.client.get(
            self._table_url(table),
            headers=self.headers,
            params={"id": f"eq.{id}"},
        )
        if resp.is_error or not resp.json():
            return None
        items = resp.json()
        return items[0] if items else None

    async def count(self, table: str, filters: dict | None = None) -> int:
        headers = {**self.headers, "Prefer": "count=exact"}
        resp = await self.client.get(
            self._table_url(table),
            headers=headers,
        )
        if resp.is_error:
            return 0
        count = resp.headers.get("content-range", "0-0/0").split("/")[-1]
        return int(count) if count.isdigit() else 0

    async def close(self):
        await self.client.aclose()


_supabase_db: SupabaseDB | None = None


def get_supabase_db() -> SupabaseDB:
    global _supabase_db
    if _supabase_db is None:
        _supabase_db = SupabaseDB()
    return _supabase_db
