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
    await init_db()
    logger.info("Database inizializzato")
    yield
    logger.info("Arresto applicazione")


app = FastAPI(
    title="Sistema Video AI Automatico",
    description="API per la generazione automatica di video con AI (gratuito/open-source)",
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
    return {"status": "ok", "app": "Sistema Video AI Automatico", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


def run():
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
