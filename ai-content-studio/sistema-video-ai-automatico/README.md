# Sistema Video AI Automatico

Piattaforma per la generazione automatica di video con AI — **100% gratuita e open-source**.

## Architettura

```
FastAPI + Celery + Redis + PostgreSQL (Supabase) + FFmpeg
```

## Stack

- **Backend**: FastAPI (Python 3.12)
- **Database**: Supabase PostgreSQL (fino a 500MB gratis)
- **Task Queue**: Celery + Redis
- **Storage**: Supabase Storage (1GB gratis) + filesystem locale
- **TTS**: gTTS / pyttsx3 (offline, gratuito)
- **Immagini**: Stable Diffusion locale via diffusers (opzionale) / placeholder automatici
- **Video**: MoviePy + FFmpeg
- **Deploy**: Vercel (serverless) + GitHub Actions (CI/CD)
- **Sorgente**: GitHub

## Requisiti

- Python 3.11+
- FFmpeg (`brew install ffmpeg` / `apt install ffmpeg`)
- Redis (opzionale per Celery)

## Setup rapido

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
make dev
```

## API principali

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/` | Stato applicazione |
| GET | `/api/v1/projects` | Lista progetti |
| POST | `/api/v1/projects` | Crea progetto |
| POST | `/api/v1/videos` | Crea video |
| POST | `/api/v1/videos/{id}/generate-script` | Genera script AI |
| POST | `/api/v1/videos/{id}/render` | Avvia rendering video |

## Struttura

```
app/              # Codice applicazione
  api/v1/         # Endpoint REST
  models/         # SQLAlchemy ORM
  schemas/        # Pydantic validators
  services/       # Logica di business (script, TTS, immagini, video)
  workers/        # Task Celery asincroni
  utils/          # Utility varie
output/           # File generati (video, audio, immagini)
assets/           # Font e template
tests/            # Test automatici
```

## Deploy

### Vercel
```bash
npx vercel --prod
```

### Supabase
- Crea un progetto su [supabase.com](https://supabase.com)
- Copia `DATABASE_URL` e `SUPABASE_SERVICE_KEY` nel `.env`
- Crea un bucket pubblico chiamato `videos`

### GitHub Actions
Il workflow in `.github/workflows/ci.yml` esegue lint + test a ogni push e fa deploy su Vercel su `main`.

## Pipeline di generazione video

1. Crea un progetto → POST `/api/v1/projects`
2. Crea un video → POST `/api/v1/videos`
3. Genera script → POST `/api/v1/videos/{id}/generate-script` (topic, durata, stile)
4. Renderizza → POST `/api/v1/videos/{id}/render` (task asincrono Celery)
5. Scarica il video dall'URL in `output_path`
