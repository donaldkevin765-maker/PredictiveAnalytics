from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./data/video_ai.db"
    database_pool_size: int = 10
    database_max_overflow: int = 20

    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"

    tts_engine: str = "gtts"
    tts_lang: str = "it"

    use_local_sd: bool = False
    sd_model_id: str = "stabilityai/stable-diffusion-2-1"

    video_width: int = 1920
    video_height: int = 1080
    video_fps: int = 30
    max_video_duration: int = 300
    subtitle_font: str = "assets/fonts/NotoSans-Regular.ttf"

    supabase_url: Optional[str] = None
    supabase_service_key: Optional[str] = None
    supabase_bucket: str = "videos"

    output_dir: str = "./output"
    assets_dir: str = "./assets"
    log_level: str = "INFO"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / settings.output_dir
ASSETS_DIR = BASE_DIR / settings.assets_dir
FONTS_DIR = ASSETS_DIR / "fonts"

DATA_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
(OUTPUT_DIR / "videos").mkdir(exist_ok=True)
(OUTPUT_DIR / "audio").mkdir(exist_ok=True)
(OUTPUT_DIR / "images").mkdir(exist_ok=True)
FONTS_DIR.mkdir(parents=True, exist_ok=True)
