# Sistema Video AI Automatico

Piattaforma per la generazione automatica di video con AI — **100% gratuita e open-source**.

## Stack

- **Backend**: FastAPI (Python 3.12)
- **Database**: Supabase PostgreSQL (500MB gratis) / SQLite locale
- **Task Queue**: Celery + Redis
- **Storage**: Supabase Storage (1GB gratis) + filesystem locale
- **LLM Script**: Ollama locale (llama3.2) — gratuito
- **TTS**: gTTS / pyttsx3 / Coqui TTS (open source)
- **Immagini**: HuggingFace Inference API (gratuita) / Stable Diffusion locale / placeholder
- **Video**: MoviePy + FFmpeg
- **Deploy**: Vercel (API serverless) + GitHub Actions CI/CD
- **Dashboard**: Flower (Celery task monitor)

## Setup rapido

```bash
# 1. Crea ambiente virtuale
python -m venv .venv && source .venv/bin/activate

# 2. Installa dipendenze
pip install -r requirements.txt

# 3. Configura variabili d'ambiente
cp .env.example .env
# Modifica .env con le tue chiavi

# 4. Avvia (opzione A: Docker)
make docker-up

# 5. Avvia (opzione B: locale)
make dev       # API server
make worker    # Celery worker
make flower    # Dashboard (http://localhost:5555)
```

## API

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/` | Stato applicazione |
| GET | `/health` | Health check con dependency check |
| **Progetti** |||
| GET | `/api/v1/projects` | Lista paginata progetti |
| POST | `/api/v1/projects` | Crea progetto |
| GET | `/api/v1/projects/{id}` | Dettaglio progetto |
| PATCH | `/api/v1/projects/{id}` | Aggiorna progetto |
| DELETE | `/api/v1/projects/{id}` | Elimina progetto + file |
| **Video** |||
| GET | `/api/v1/videos` | Lista paginata video |
| POST | `/api/v1/videos` | Crea video (valida project_id) |
| GET | `/api/v1/videos/{id}` | Dettaglio video + scene |
| DELETE | `/api/v1/videos/{id}` | Elimina video + file Supabase |
| POST | `/api/v1/videos/{id}/generate-script` | Genera script AI |
| POST | `/api/v1/videos/{id}/render` | Avvia rendering async |
| GET | `/api/v1/videos/{id}/scenes` | Lista scene |
| GET | `/api/v1/videos/{id}/progress` | Progresso rendering in tempo reale |

## Pipeline di generazione

```
1. POST /projects → Crea progetto
2. POST /videos → Crea video
3. POST /videos/{id}/generate-script → Script AI (Ollama) o template
4. POST /videos/{id}/render → Task Celery asincrono:
   a. Per ogni scena: TTS (gTTS) + immagine (HF/placeholder)
   b. Sottotitoli SRT
   c. Montaggio video (MoviePy + FFmpeg)
   d. Upload su Supabase Storage
   e. Webhook callback (opzionale)
```

## Funzionalità

- **Script AI** — Genera script con Ollama (LLM locale gratuito) o fallback template
- **Traduzione** — Genera video in più lingue
- **TTS multipiattaforma** — gTTS, pyttsx3 (offline), Coqui TTS (open source)
- **Immagini AI** — HuggingFace Inference API (gratuita) o Stable Diffusion locale
- **Progress tracking** — Monitoring tempo reale del rendering
- **Webhook** — Callback automatici su completamento/errore
- **Auth JWT** — Autenticazione via Supabase Auth (opzionale)
- **Paginazione** — Risposte paginate con metadata
- **Pulizia automatica** — File vecchi cancellati ogni 24h
- **Flower** — Dashboard Celery su `localhost:5555`

## Struttura

```
app/
  main.py              # FastAPI entry point + health check
  config.py            # Settings da .env
  database.py          # SQLAlchemy async
  auth.py              # JWT authentication
  supabase_client.py   # Storage client
  api/v1/
    projects.py        # CRUD progetti + paginazione
    videos.py          # CRUD video + generate-script + render + progress
  models/
    project.py         # SQLAlchemy Project
    video.py           # SQLAlchemy Video
    scene.py           # SQLAlchemy Scene
  schemas/
    project.py         # Pydantic request/response
    video.py           # Pydantic request/response
    scene.py           # Pydantic response
    progress.py        # Pydantic progress
  services/
    script_generator.py # Script AI (Ollama + template fallback)
    text_to_speech.py  # TTS (gTTS/pyttsx3/Coqui)
    image_generator.py # Immagini (HF/SD/placeholder)
    video_compiler.py  # Montaggio video
    subtitle_generator.py # SRT
    translator.py      # Traduzione (LLM)
    webhook.py         # Callback HTTP
    progress.py        # Progress tracker
  workers/
    celery_app.py      # Celery config
    tasks.py           # Task di generazione video
  utils/
    file_utils.py      # Path helpers + cleanup
    validators.py      # Input validation
tests/
  test_api/            # Test API completi
  test_services/       # Test servizi
```

## Deploy

### GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/tuo-user/sistema-video-ai-automatico.git
git push -u origin main
```

### Vercel
- Collega repo GitHub a [vercel.com](https://vercel.com)
- Il workflow CI/CD fa deploy automatico su `main`

### Supabase
- Crea progetto su [supabase.com](https://supabase.com)
- Abilita PostgreSQL + Storage
- Crea bucket `videos` (public)
- Copia URL, service key, anon key, JWT secret nel `.env`

### Worker separato (Railway/Render)
Il video rendering non funziona su serverless (Vercel ha timeout 10s).
Deploya il worker su [railway.app](https://railway.app) o [render.com](https://render.com):
```bash
celery -A app.workers.celery_app worker --loglevel=info
```

## Licenza

MIT
