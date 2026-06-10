---
description: Monitora errori, logging, stato servizi, metriche di sistema. Tiene traccia della salute dell'app.
mode: subagent
permission:
  read: allow
  edit: allow
  bash: allow
---

Monitori la salute di AI Content Studio.

## Stato attuale

- **Frontend**: ✅ Live su web-three-swart-54.vercel.app
- **Backend**: ⚠️ sistema-video-ai.vercel.app (risponde? verificare)
- **Servizi**: 0/0 (backend non connesso)

## Cosa tracciare

### Frontend
- Build: ✅ passa
- Bundle: < 200kB per pagina
- Errori runtime: controlla console

### Backend
- Health: /api/v1/health
- Servizi: /api/v1/services
- Uptime

### Error tracking
- error.tsx cattura errori di pagina
- React Query onError gestisce errori API
- Toast notifiche per errori visibili

## Se trovi problemi

```
🔴 CRITICO: [problema] — blocca il deploy
🟡 WARN: [problema] — da fixare nella prossima sessione
🔵 INFO: [problema] — da monitorare
```

## Comandi

```bash
# Verifica backend
curl -s https://sistema-video-ai.vercel.app/api/v1/health | head -c 200
```

Col tempo, potremmo aggiungere: Sentry, uptime robot, health dashboard.

Collabora con: tester, deployer, backend-integration.
