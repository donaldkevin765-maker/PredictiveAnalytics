---
agents: 15
agent_dir: .opencode/agents/
last_updated: '2026-06-10'
status: in_development
---
# AI Content Studio

> Fase 1 completata (10/06/2026): Supabase + Auth + Login + Gemini attivo. Prossimo: registrare app OAuth social.

url: https://web-three-swart-54.vercel.app
repo: /Users/kevindonald/Desktop/PredictiveAnalytics/ai-content-studio
backend_live: https://sistema-video-ai.vercel.app

## Stack

- **Frontend**: Next.js 14 `web/` — Tailwind, TanStack Query, Zustand, Framer Motion, Recharts
- **Backend**: Python/FastAPI `sistema-video-ai-automatico/` — Celery, Redis, SQLite/PostgreSQL

## Struttura

```
ai-content-studio/
├── web/                    # Next.js dashboard
│   ├── src/app/            # Pages (dashboard, video, ai-services, settings)
│   ├── src/components/     # UI, layout, media, charts
│   ├── src/hooks/          # TanStack Query hooks
│   ├── src/lib/            # API client, utils
│   ├── src/store/          # Zustand store
│   └── src/types/          # TypeScript types
├── sistema-video-ai-automatico/  # Backend Python
├── docker-compose.yml      # Root compose (api + web + redis)
└── package.json            # Root workspaces
```

## Regole per lo Sviluppo

### Ogni sessione:
1. **Leggere questo file** prima di iniziare
2. **Buildare e deployare** alla fine di ogni sessione
3. **Aggiornare questo file** con decisioni importanti, problemi, TODO
4. **Verificare URL live** dopo ogni deploy

### Linee guida:
- Design SEMPRE glass/premium — gradienti, glow, glass-card, animazioni
- Dark theme di default — nero (#0a0a0c) con accenti brand (#6366f1)
- Tutte le pagine in italiano
- Componenti UI vanno in `components/ui/`
- Layout vanno in `components/layout/`
- API client in `lib/api.ts` — usa localStorage per override configurabile
- Mai `window.open()` per media — usare sempre VideoPlayer/AudioPlayer/PreviewModal
- Ogni pagina deve avere: loading skeleton, empty state, error state
- `npm run build` prima di ogni deploy

### Pagine:
- `/dashboard` — stats, grafico, servizi, progetti recenti
- `/video` — lista progetti, script gen, render, anteprime media
- `/ai-services` — tabella servizi AI
- `/settings` — preferenze (tema, lingua), API config, notifiche

## Anteprime Media

### Componenti creati:
- `components/media/VideoPlayer.tsx` — player video con controlli completi
- `components/media/AudioPlayer.tsx` — player audio con seekbar
- `components/media/PreviewModal.tsx` — modale full-screen per anteprime

### Flusso:
1. Utente clicca "Anteprima" sul video
2. Si apre PreviewModal con VideoPlayer e/o AudioPlayer
3. Se videoUrl presente → player video inline nella card + modale
4. Se solo audioUrl → player audio inline nella card + modale
5. Download disponibile dal modale

## Bug Fix Recenti (10 Giugno 2026)

- [x] Rimosso AreaChartWrapper.tsx (file morto)
- [x] Layout ora Server Component con metadati SEO
- [x] Aggiunto error.tsx, migliorato not-found.tsx
- [x] Sidebar non forza apertura su desktop
- [x] Pulsanti Render con loading state individuale
- [x] Form API Impostazioni salva su localStorage
- [x] topic/scriptStyle resettati al cambio progetto
- [x] formatDuration gestisce 0 secondi
- [x] Rimossi import/variabili inutilizzati
- [x] AnimatePresence con key obbligatoria
- [x] Header senza toast fake
- [x] API client dinamico (localStorage override)
- [x] CORS risolto con proxy Vercel (/api/*)

## Agents AI (30)

I 30 agent sono in `.opencode/agents/`. Riavvio necessario per usarli.

| Area | # | Agente | Ruolo |
|------|---|--------|-------|
| **Strategico** | 1 | `project-manager` | Coordina tutti, assegna task |
| | 2 | `architect` | Architettura, ADR, pattern |
| | 3 | `product-owner` | Requisiti, user story, criteri |
| | 4 | `scrum-master` | Sprint, flusso, priorità |
| | 5 | `tech-lead` | Decisioni tecniche finali |
| **Design** | 6 | `ui-designer` | Design system, colori, CSS |
| | 7 | `ux-critic` | UX, accessibilità, coerenza |
| | 8 | `animator` | Framer Motion, transizioni |
| | 9 | `responsive-specialist` | Mobile/tablet/desktop |
| **Componenti** | 10 | `ui-developer` | Componenti atomici (cva/cn) |
| | 11 | `layout-engineer` | Sidebar, Header, layout |
| | 12 | `media-engineer` | Video/Audio player, anteprime |
| | 13 | `chart-engineer` | Grafici Recharts |
| | 14 | `form-builder` | Input, Select, Textarea, form |
| **Pagine** | 15 | `page-builder` | Nuove pagine |
| | 16 | `dashboard-dev` | Dashboard (statistiche, chart) |
| | 17 | `video-studio-dev` | Video Studio (progetti, render) |
| | 18 | `settings-dev` | Impostazioni (tabs, API config) |
| **Dati** | 19 | `api-developer` | API client, fetch, auth |
| | 20 | `store-manager` | Zustand store, persist |
| | 21 | `types-architect` | TypeScript types |
| | 22 | `cache-strategist` | TanStack Query, caching |
| **Qualità** | 23 | `tester` | Bug, audit, test build |
| | 24 | `reviewer` | Code review, pattern check |
| | 25 | `performance-auditor` | Bundle, ottimizzazioni |
| | 26 | `security-specialist` | Auth, token, vulnerabilità |
| **Infrastruttura** | 27 | `deployer` | Vercel, Docker, build |
| | 28 | `backend-integration` | Proxy, CORS, API bridge |
| | 29 | `docs-writer` | README, note Obsidian |
| | 30 | `monitoring-specialist` | Health, error tracking |

### Flusso di collaborazione

```
Richiesta → product-owner (requisiti) → architect (impatto)
→ project-manager (assegna) → agenti implementazione
→ tester (QA) → reviewer (approva) → deployer (deploy)
→ docs-writer (documenta) → monitoring (verifica live)
```

## TODO

### 🔴 PRIORITÀ CRITICA — Registrare le 3 App OAuth
YouTube (Google Cloud), Instagram (Meta), TikTok (TikTok for Developers) — vedi guida nel README.
Dopo la registrazione, aggiornare le env su Vercel backend.

### 🟡 PRIORITÀ ALTA — Database persistente
Migrare da SQLite effimero a Supabase REST API. Il supabase_db.py è già pronto.
Basta chiamare `get_supabase_db()` invece di `get_db()` negli endpoint.

### 🟢 PRIORITÀ MEDIA
- [ ] Template video predefiniti (Tutorial, Recensione, Promo, Storytelling)
- [ ] Onboarding wizard 3-step (Crea → Genera → Pubblica)
- [ ] Pagina dettaglio progetto (/video/[id])
- [ ] Scene editor drag & drop
- [ ] Realtime progress (WebSocket/SSE)
- [ ] Playlist/queue di render
- [ ] Pexels/Groq/OpenRouter API keys
- [ ] Test E2E con Playwright
- [ ] PWA / service worker

## Comandi Rapidi

```bash
# Dev
cd web && npm run dev

# Build
cd web && npm run build

# Deploy
cd web && npx vercel --prod --yes

# Backend
cd sistema-video-ai-automatico && uvicorn app.main:app --reload --port 8000

# Docker
docker-compose up -d
```

## Deploy

- **URL**: https://web-three-swart-54.vercel.app
- **Backend**: https://sistema-video-ai.vercel.app
- **Vercel Project**: donaldkevin765-makers-projects/web
- **Proxy**: /api/* → backend (CORS free)
