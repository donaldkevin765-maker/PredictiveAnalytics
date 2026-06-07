import asyncio
from pathlib import Path
from sqlalchemy import text, select
from loguru import logger

from app.workers.celery_app import celery_app
from app.database import async_session
from app.models.video import Video
from app.models.scene import Scene
from app.services.text_to_speech import TextToSpeechService
from app.services.image_generator import ImageGenerator
from app.services.video_compiler import VideoCompiler
from app.services.subtitle_generator import SubtitleGenerator
from app.utils.file_utils import audio_output_path, image_output_path, video_output_path
from app.supabase_client import supabase_storage


def run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def generate_video_task(self, video_id: int):
    logger.info(f"Avvio generazione video {video_id}")
    run_async(_generate_video(video_id, self))


async def _generate_video(video_id: int, task):
    tts = TextToSpeechService()
    img_gen = ImageGenerator()
    compiler = VideoCompiler()
    sub_gen = SubtitleGenerator()

    async with async_session() as db:
        result = await db.execute(select(Video).where(Video.id == video_id))
        video = result.scalar_one_or_none()
        if not video:
            logger.error(f"Video {video_id} non trovato")
            return

        result = await db.execute(
            select(Scene).where(Scene.video_id == video_id).order_by(Scene.order)
        )
        scenes = result.scalars().all()

        if not scenes:
            logger.error(f"Nessuna scena per video {video_id}")
            video.status = "error"
            video.error_message = "Nessuna scena trovata"
            await db.commit()
            return

        try:
            image_paths = []
            audio_paths = []
            durations = []
            scene_texts = []

            for i, scene in enumerate(scenes):
                content = scene.content
                img_prompt = scene.image_prompt or content
                scene_texts.append(content)

                aud_path = audio_output_path(f"scene_{video_id}_{i}.mp3")
                await tts.generate(content, aud_path)
                audio_paths.append(aud_path)

                img_path = image_output_path(f"scene_{video_id}_{i}.png")
                await img_gen.generate(img_prompt, img_path)
                image_paths.append(img_path)

                durations.append(float(scene.duration))

            srt_path = str(Path(video_output_path()).parent / f"subtitles_{video_id}.srt")
            sub_gen.generate_srt(scene_texts, durations, srt_path)

            output_path = video_output_path(f"video_{video_id}.mp4")
            await compiler.compile(image_paths, audio_paths, srt_path, output_path, durations)

            supabase_url = await supabase_storage.upload_file(output_path, f"videos/video_{video_id}.mp4")

            video.status = "completed"
            video.output_path = supabase_url or output_path
            video.duration = sum(durations)
            await db.commit()
            logger.info(f"Video {video_id} completato con successo")

        except Exception as e:
            logger.error(f"Errore generazione video {video_id}: {e}")
            video.status = "error"
            video.error_message = str(e)
            await db.commit()
            raise


@celery_app.task
def cleanup_old_outputs():
    import shutil
    from datetime import datetime, timedelta

    cutoff = datetime.now() - timedelta(days=7)
    output_base = Path("./output")

    for subdir in ["videos", "audio", "images"]:
        target = output_base / subdir
        if not target.exists():
            continue
        for f in target.iterdir():
            if f.is_file() and f.suffix in {".mp4", ".mp3", ".wav", ".png", ".jpg", ".srt"}:
                mtime = datetime.fromtimestamp(f.stat().st_mtime)
                if mtime < cutoff:
                    f.unlink()
                    logger.info(f"Pulito file vecchio: {f}")
