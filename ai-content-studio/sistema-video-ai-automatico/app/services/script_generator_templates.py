import random
import time
from loguru import logger
from app.config import settings


SCRIPT_TEMPLATES = {
    "informativo": {
        "intro": "Oggi parleremo di {topic}.",
        "scene_patterns": [
            "Ecco cosa devi sapere su {topic}: {detail}.",
            "Un aspetto fondamentale di {topic} è {detail}.",
            "Molte persone non sanno che {detail}.",
            "Per approfondire: {detail}.",
        ],
        "outro": "Grazie per aver guardato questo video su {topic}. Iscriviti per altri contenuti!",
    },
    "divertente": {
        "intro": "Pronto per qualcosa di assurdo su {topic}?",
        "scene_patterns": [
            "Immagina questo: {detail}",
            "Non ci crederai, ma {detail}",
            "Ok, questa è buona: {detail}",
            "E la ciliegina sulla torta? {detail}",
        ],
        "outro": "Se hai riso, metti un like! Ci vediamo al prossimo video su {topic}.",
    },
    "didattico": {
        "intro": "In questo video imparerai i concetti fondamentali di {topic}.",
        "scene_patterns": [
            "Primo concetto: {detail}. È importante perché...",
            "Passiamo al secondo punto: {detail}.",
            "Ora vediamo come {detail} si collega al quadro generale.",
            "Esempio pratico: {detail}.",
        ],
        "outro": "Ricapitolando, oggi hai imparato le basi di {topic}. Esercitati e ci vediamo alla prossima lezione!",
    },
    "motivazionale": {
        "intro": "Oggi parliamo di {topic}. Un tema che può cambiare la tua vita.",
        "scene_patterns": [
            "Quando pensi a {topic}, ricordati che {detail}.",
            "La verità è che {detail}. Sta a te decidere.",
            "Non dimenticare mai: {detail}.",
            "Ecco il punto cruciale: {detail}.",
        ],
        "outro": "Se questo video ti ha ispirato, condividilo con chi ne ha bisogno. Vai e conquista i tuoi sogni!",
    },
    "serio": {
        "intro": "Benvenuto. Oggi affronteremo un tema importante: {topic}.",
        "scene_patterns": [
            "Analizziamo i dati: {detail}.",
            "Le ricerche mostrano che {detail}.",
            "Un punto critico da considerare: {detail}.",
            "In conclusione, {detail}.",
        ],
        "outro": "Spero questo approfondimento ti sia stato utile. Ci vediamo al prossimo video.",
    },
}


DETAILS_POOL = {
    "intelligenza artificiale": [
        "l'AI generativa sta trasformando ogni settore industriale",
        "i modelli linguistici hanno raggiunto capacità di ragionamento sorprendenti",
        "l'AI etica è una delle maggiori sfide del nostro tempo",
        "il machine learning richiede grandi quantità di dati di qualità",
        "le reti neurali profonde imitano il funzionamento del cervello umano",
        "l'AI può automatizzare compiti ripetitivi liberando creatività umana",
    ],
    "marketing digitale": [
        "i contenuti video generano 12 volte più engagement dei testi",
        "il SEO locale è essenziale per le piccole imprese",
        "l'email marketing ha un ROI medio del 4200%",
        "i micro-influencer hanno tassi di engagement molto più alti",
        "la personalizzazione aumenta le conversioni del 20%",
    ],
    "programmazione": [
        "Python è il linguaggio più richiesto per l'AI",
        "la programmazione funzionale sta vivendo una rinascita",
        "i framework web moderni usano il pattern MVC",
        "il testing automatico riduce i bug dell'80%",
        "la clean code è fondamentale per la manutenibilità",
    ],
}


DEFAULT_DETAILS = [
    "questo argomento sta rivoluzionando il modo in cui lavoriamo",
    "i numeri parlano chiaro: la crescita è esponenziale",
    "sempre più persone si stanno avvicinando a questo tema",
    "le possibilità sono infinite se sai dove guardare",
    "il futuro è già qui, e sta a noi coglierne le opportunità",
]


class ScriptGenerator:
    def generate(self, topic: str, duration_sec: int = 60, style: str = "informativo") -> dict:
        logger.info(f"Generazione script: topic={topic}, durata={duration_sec}s, stile={style}")
        rng = random.Random(settings.script_seed + hash(topic) + duration_sec)

        template = SCRIPT_TEMPLATES.get(style, SCRIPT_TEMPLATES["informativo"])
        details = DETAILS_POOL.get(topic.lower(), DEFAULT_DETAILS)

        num_scenes = max(2, min(8, duration_sec // 10))
        scene_duration = duration_sec / num_scenes

        topic_key = topic if len(topic) <= 50 else topic[:47] + "..."

        intro = template["intro"].format(topic=topic_key)
        outro = template["outro"].format(topic=topic_key)

        scenes = []
        selected = rng.sample(details, min(len(details), num_scenes))
        for i, detail in enumerate(selected):
            pattern = rng.choice(template["scene_patterns"])
            content = pattern.format(topic=topic_key, detail=detail)
            image_prompt = self._generate_image_prompt(topic_key, content, rng)
            scenes.append({
                "content": content,
                "image_prompt": image_prompt,
                "subtitle_text": content,
                "duration": round(scene_duration, 1),
            })

        full_script = f"{intro}\n\n" + "\n\n".join(s["content"] for s in scenes) + f"\n\n{outro}"

        return {
            "full_script": full_script,
            "scenes": scenes,
        }

    def _generate_image_prompt(self, topic: str, scene_text: str, rng: random.Random) -> str:
        adjectives = ["professionale", "moderna", "minimalista", "creativa", "dinamica"]
        adj = rng.choice(adjectives)
        return f"{topic}, {scene_text[:80]}, stile {adj}, illustration, 4k"
