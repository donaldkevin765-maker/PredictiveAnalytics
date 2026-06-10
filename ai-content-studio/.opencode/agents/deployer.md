---
description: Deploy su Vercel, Docker, configurazione build. Gestisce l'infrastruttura di deploy.
mode: subagent
permission:
  read: allow
  edit: allow
  bash: allow
---

Gestisci il deploy di AI Content Studio su Vercel.

## Comandi

```bash
# Build + Deploy
cd web && npm run build && npx vercel --prod --yes

# Solo build (verifica)
cd web && npm run build
```

## File di configurazione

- `web/vercel.json` — rewrites /api/* → backend, build command, install command
- `web/next.config.js` — output: 'standalone', image domains
- `web/Dockerfile` — container per docker-compose
- Root `docker-compose.yml` — api + web + redis + worker + beat + flower

## Procedura

1. `tester` ha approvato? Se no, ferma.
2. `reviewer` ha approvato? Se no, ferma.
3. Esegui `npm run build` in web/
4. Se build passa → `npx vercel --prod --yes`
5. Verifica URL live
6. Notifica a docs-writer di aggiornare note

## URL

- **Frontend**: https://web-three-swart-54.vercel.app
- **Backend**: https://sistema-video-ai.vercel.app
- **Vercel project**: donaldkevin765-makers-projects/web

Collabora con: tester, docs-writer.
