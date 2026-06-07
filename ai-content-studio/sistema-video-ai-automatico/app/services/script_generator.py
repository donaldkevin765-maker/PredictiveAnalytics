import json
import os
import httpx
from loguru import logger
from app.config import settings


class ScriptGenerator:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")

    def _get_enabled_providers(self):
        providers = []
        if self.gemini_key:
            providers.append("gemini")
        if self.openai_key:
            providers.append("openai")
        if self.anthropic_key:
            providers.append("anthropic")
        return providers

    async def generate(self, topic: str, duration_sec: int = 60, style: str = "informativo") -> dict:
        logger.info(f"Generazione script AI: topic={topic}, durata={duration_sec}s, stile={style}")

        enabled = self._get_enabled_providers()
        if not enabled:
            logger.warning("Nessuna chiave AI configurata, uso template locale")
            from app.services.script_generator_templates import ScriptGenerator as Fallback
            return Fallback().generate(topic, duration_sec, style)

        prompt = (
            f"Sei un creative director e video scriptwriter professionista. "
            f"Genera uno script video completo per il tema: \"{topic}\".\n\n"
            f"Durata: circa {duration_sec} secondi.\n"
            f"Stile: {style}.\n\n"
            f"Rispondi SOLO con un JSON valido (senza markdown):\n"
            f"{{\n"
            f'  "full_script": "Testo completo dello script unendo tutte le scene",\n'
            f'  "scenes": [\n'
            f"    {{\n"
            f'      "content": "Testo voiceover per questa scena",\n'
            f'      "image_prompt": "Descrizione per generare immagine di sfondo",\n'
            f'      "subtitle_text": "Testo sottotitoli per questa scena",\n'
            f'      "duration": 10.0\n'
            f"    }}\n"
            f"  ]\n"
            f"}}\n\n"
            f"REQUISITI:\n"
            f"- Crea tra 4 e 8 scene\n"
            f"- La durata totale deve essere circa {duration_sec} secondi\n"
            f"- Il content deve essere testo voiceover naturale\n"
            f"- L'image_prompt deve descrivere un'immagine/visual per accompagnare la scena\n"
            f"- Sii creativo e professionale\n"
            f"- Rispondi in Italiano"
        )

        for provider in enabled:
            try:
                result = await self._call_provider(provider, prompt)
                if result:
                    parsed = self._parse_response(result)
                    if parsed:
                        return parsed
            except Exception as e:
                logger.warning(f"Provider {provider} fallito: {e}")

        logger.warning("Tutti i provider AI falliti, uso template locale")
        from app.services.script_generator_templates import ScriptGenerator as Fallback
        return Fallback().generate(topic, duration_sec, style)

    async def _call_provider(self, provider: str, prompt: str) -> str | None:
        async with httpx.AsyncClient(timeout=60.0) as client:
            if provider == "gemini":
                resp = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent"
                    f"?key={self.gemini_key}",
                    json={"contents": [{"parts": [{"text": prompt}]}]},
                )
                if resp.is_success:
                    data = resp.json()
                    return data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")

            elif provider == "openai":
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.openai_key}"},
                    json={"model": "gpt-4o", "messages": [{"role": "user", "content": prompt}], "temperature": 0.7},
                )
                if resp.is_success:
                    data = resp.json()
                    return data.get("choices", [{}])[0].get("message", {}).get("content")

            elif provider == "anthropic":
                resp = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": self.anthropic_key, "anthropic-version": "2023-06-01"},
                    json={"model": "claude-3-opus-20240229", "max_tokens": 4096,
                          "messages": [{"role": "user", "content": prompt}]},
                )
                if resp.is_success:
                    data = resp.json()
                    return data.get("content", [{}])[0].get("text")
        return None

    def _parse_response(self, text: str) -> dict | None:
        try:
            clean = text.replace("```json", "").replace("```", "").strip()
            start = clean.find("{")
            end = clean.rfind("}")
            if start == -1 or end == -1:
                return None
            parsed = json.loads(clean[start:end + 1])
            if "scenes" in parsed and isinstance(parsed["scenes"], list) and len(parsed["scenes"]) > 0:
                for s in parsed["scenes"]:
                    s.setdefault("subtitle_text", s.get("content", ""))
                    s.setdefault("image_prompt", "")
                    s.setdefault("duration", 10.0)
                if "full_script" not in parsed:
                    parsed["full_script"] = "\n\n".join(s["content"] for s in parsed["scenes"])
                return parsed
        except Exception as e:
            logger.warning(f"Errore parsing risposta AI: {e}")
        return None
