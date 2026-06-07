from pathlib import Path
from loguru import logger
from app.config import settings


class TextToSpeechService:
    async def generate(self, text: str, output_path: str, lang: str | None = None) -> str:
        engine = settings.tts_engine
        lang = lang or settings.tts_lang

        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)

        if engine == "gtts":
            return await self._gtts(text, str(out), lang)
        elif engine == "pyttsx3":
            return self._pyttsx3(text, str(out))
        else:
            logger.warning(f"TTS engine '{engine}' sconosciuto, uso gTTS")
            return await self._gtts(text, str(out), lang)

    async def _gtts(self, text: str, output_path: str, lang: str) -> str:
        try:
            from gtts import gTTS
            tts = gTTS(text=text, lang=lang, slow=False)
            tts.save(output_path)
            logger.info(f"Audio generato con gTTS: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Errore gTTS: {e}")
            raise

    def _pyttsx3(self, text: str, output_path: str) -> str:
        try:
            import pyttsx3
            engine = pyttsx3.init()
            engine.save_to_file(text, output_path)
            engine.runAndWait()
            logger.info(f"Audio generato con pyttsx3: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Errore pyttsx3: {e}")
            raise
