# AI Content Studio

Piattaforma unificata per la creazione di video con AI. Include:

- **web/** - Dashboard Next.js 14 (Tailwind, TanStack Query, Zustand, Framer Motion, Recharts)
- **sistema-video-ai-automatico/** - Backend Python/FastAPI con celery workers

## Quick Start

```bash
# Frontend
cd web && npm install && npm run dev

# Backend (in un altro terminale)
cd sistema-video-ai-automatico && pip install -e . && uvicorn app.main:app --reload --port 8000
```

## Docker

```bash
docker-compose up -d
```

## Deploy

- **Frontend**: su Vercel (collega `web/`)
- **Backend**: su Vercel (collega `sistema-video-ai-automatico/`)

## Stack

- **Frontend**: Next.js 14, Tailwind CSS, TanStack Query, Zustand, Framer Motion, Recharts
- **Backend**: FastAPI, Celery, Redis, SQLite/PostgreSQL
- **AI**: gTTS, MoviePy, OpenCV, Deep Translator
