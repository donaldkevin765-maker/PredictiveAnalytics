import os
from pathlib import Path
from loguru import logger
from app.config import settings


class VideoCompiler:
    async def compile(
        self,
        image_paths: list[str],
        audio_paths: list[str],
        subtitle_path: str | None,
        output_path: str,
        durations: list[float],
    ) -> str:
        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)

        if len(image_paths) != len(audio_paths) or len(image_paths) != len(durations):
            raise ValueError("Mismatch tra numero di scene, audio e durate")

        if len(image_paths) == 1:
            return await self._single_scene_video(image_paths[0], audio_paths[0], output_path, durations[0])
        else:
            return await self._multi_scene_video(image_paths, audio_paths, durations, output_path, subtitle_path)

    async def _single_scene_video(self, image_path: str, audio_path: str, output_path: str, duration: float) -> str:
        try:
            from moviepy import VideoClip, AudioFileClip, ImageClip

            audio = AudioFileClip(audio_path)
            img = ImageClip(image_path, duration=duration)
            img = img.with_duration(duration)
            video = img.with_audio(audio)
            video.write_videofile(
                output_path,
                fps=settings.video_fps,
                codec="libx264",
                audio_codec="aac",
                logger=None,
            )
            video.close()
            audio.close()
            logger.info(f"Video singolo generato: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Errore compilazione video singolo: {e}")
            raise

    async def _multi_scene_video(
        self,
        image_paths: list[str],
        audio_paths: list[str],
        durations: list[float],
        output_path: str,
        subtitle_path: str | None,
    ) -> str:
        try:
            from moviepy import (
                VideoClip, AudioFileClip, ImageClip, CompositeVideoClip, concatenate_videoclips,
            )

            clips = []
            for i, (img_path, aud_path, dur) in enumerate(zip(image_paths, audio_paths, durations)):
                audio = AudioFileClip(aud_path)
                actual_dur = min(dur, audio.duration)
                img_clip = ImageClip(img_path, duration=actual_dur).with_audio(audio)
                clips.append(img_clip)

            final = concatenate_videoclips(clips, method="compose")

            if subtitle_path and os.path.exists(subtitle_path):
                try:
                    from moviepy import TextClip
                    subs = self._parse_subtitles(subtitle_path)
                    txt_clips = []
                    for start, end, text in subs:
                        txt = TextClip(
                            text=text,
                            font=str(settings.subtitle_font or settings.FONTS_DIR / "NotoSans-Regular.ttf"),
                            font_size=36,
                            color="white",
                            stroke_color="black",
                            stroke_width=2,
                        )
                        txt = txt.with_position(("center", "bottom")).with_duration(end - start).with_start(start)
                        txt_clips.append(txt)
                    if txt_clips:
                        final = CompositeVideoClip([final, *txt_clips])
                except Exception as e:
                    logger.warning(f"Errore aggiunta sottotitoli: {e}")

            final.write_videofile(
                output_path,
                fps=settings.video_fps,
                codec="libx264",
                audio_codec="aac",
                logger=None,
            )
            final.close()
            for c in clips:
                c.close()
            logger.info(f"Video multi-scena generato: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Errore compilazione video multi-scena: {e}")
            raise

    def _parse_subtitles(self, srt_path: str) -> list[tuple[float, float, str]]:
        import srt
        subs = []
        with open(srt_path, encoding="utf-8") as f:
            for sub in srt.parse(f.read()):
                subs.append((sub.start.total_seconds(), sub.end.total_seconds(), sub.content))
        return subs
