import random
from pathlib import Path
from loguru import logger
from app.config import settings


class ImageGenerator:
    async def generate(self, prompt: str, output_path: str) -> str:
        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)

        if settings.use_local_sd:
            return await self._local_sd(prompt, str(out))
        else:
            return await self._placeholder(prompt, str(out))

    async def _local_sd(self, prompt: str, output_path: str) -> str:
        try:
            import torch
            from diffusers import StableDiffusionPipeline

            pipe = StableDiffusionPipeline.from_pretrained(
                settings.sd_model_id,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            )
            if torch.cuda.is_available():
                pipe = pipe.to("cuda")

            image = pipe(prompt, width=settings.video_width, height=settings.video_height).images[0]
            image.save(output_path)
            logger.info(f"Immagine SD generata: {output_path}")
            return output_path
        except ImportError:
            logger.warning("diffusers/torch non installato, genero placeholder")
            return await self._placeholder(prompt, output_path)
        except Exception as e:
            logger.error(f"Errore Stable Diffusion: {e}")
            return await self._placeholder(prompt, output_path)

    async def _placeholder(self, prompt: str, output_path: str) -> str:
        try:
            from PIL import Image, ImageDraw, ImageFont

            w, h = settings.video_width, settings.video_height
            img = Image.new("RGB", (w, h), self._random_color())
            draw = ImageDraw.Draw(img)

            try:
                font = ImageFont.truetype(str(settings.FONTS_DIR / "NotoSans-Regular.ttf"), 36)
            except Exception:
                font = ImageFont.load_default()

            lines = self._wrap_text(prompt, 60)
            y = h // 2 - (len(lines) * 25)
            for line in lines:
                bbox = draw.textbbox((0, 0), line, font=font)
                x = (w - (bbox[2] - bbox[0])) // 2
                draw.text((x, y), line, fill="white", font=font)
                y += 50

            img.save(output_path, quality=85)
            logger.info(f"Placeholder generato: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Errore generazione placeholder: {e}")
            raise

    def _random_color(self):
        rng = random.Random()
        return (rng.randint(20, 60), rng.randint(20, 60), rng.randint(60, 100))

    def _wrap_text(self, text: str, max_chars: int) -> list[str]:
        words = text.split()
        lines = []
        current = ""
        for word in words:
            if len(current) + len(word) + 1 <= max_chars:
                current += (" " if current else "") + word
            else:
                lines.append(current)
                current = word
        if current:
            lines.append(current)
        return lines or [text]
