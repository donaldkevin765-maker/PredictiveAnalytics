import uuid
from pathlib import Path
from app.config import OUTPUT_DIR


def unique_filename(extension: str = ".mp4") -> str:
    return f"{uuid.uuid4().hex}{extension}"


def video_output_path(filename: str | None = None) -> str:
    return str(OUTPUT_DIR / "videos" / (filename or unique_filename(".mp4")))


def audio_output_path(filename: str | None = None) -> str:
    return str(OUTPUT_DIR / "audio" / (filename or unique_filename(".mp3")))


def image_output_path(filename: str | None = None) -> str:
    return str(OUTPUT_DIR / "images" / (filename or unique_filename(".png")))
