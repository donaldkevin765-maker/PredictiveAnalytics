from __future__ import annotations

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.config import settings
from app.database import init_db
from app.api.v1 import projects, videos


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Inizializzazione database...")
    ok = await init_db()
    if ok:
        logger.info("Database pronto")
    else:
        logger.warning("Database non inizializzato (manca DATABASE_URL) - l'app funzionerà in modalità limitata")
    yield
    logger.info("Arresto")


app = FastAPI(
    title="Sistema Video AI Automatico",
    description="API per la generazione automatica di video con AI - 100% gratuita/open-source",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(videos.router, prefix="/api/v1/videos", tags=["videos"])


@app.get("/")
async def root():
    return {
        "status": "ok",
        "app": "Sistema Video AI Automatico",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "projects": "/api/v1/projects/",
            "videos": "/api/v1/videos/",
        },
        "note": "Serverless: for persistent storage set DATABASE_URL env var (Postgres)",
    }


@app.get("/health")
async def health():
    checks = {"database": "ok", "redis": "ok", "supabase": "ok"}
    issues = []

    try:
        from app.database import get_session_factory
        from sqlalchemy import text
        factory = get_session_factory()
        async with factory() as db:
            await db.execute(text("SELECT 1"))
    except Exception as e:
        checks["database"] = f"error: {e}"
        issues.append("database")

    try:
        from redis import Redis
        r = Redis.from_url(settings.celery_broker_url)
        r.ping()
        r.close()
    except Exception as e:
        checks["redis"] = f"error: {e}"
        issues.append("redis")

    if settings.supabase_url:
        try:
            import httpx
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{settings.supabase_url}/rest/v1/")
                if not resp.is_success:
                    checks["supabase"] = f"error: {resp.status_code}"
                    issues.append("supabase")
        except Exception as e:
            checks["supabase"] = f"error: {e}"
            issues.append("supabase")

    return {"status": "healthy" if not issues else "degraded", "checks": checks}


def run():
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
