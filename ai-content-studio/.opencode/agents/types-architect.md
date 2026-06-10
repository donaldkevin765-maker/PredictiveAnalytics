---
description: Definisce interfacce TypeScript, tipi, enum. Single source of truth per i tipi del progetto.
mode: subagent
permission:
  read: allow
  edit: allow
  bash: deny
---

Gestisci i tipi in `src/types/index.ts`.

## Tipi esistenti

```tsx
Project { id, name, description?, status, createdAt, updatedAt, thumbnail?, metadata? }
Video { id, projectId, title, status, progress, script?, audioUrl?, videoUrl?, duration?, createdAt, updatedAt, error? }
Scene { id, videoId, order, content, duration, mediaUrl?, status }
ServiceStatus { name, status, type, latency?, error?, fallbackAvailable? }
HealthCheck { status, version, uptime, services }
ScriptRequest { topic, style?, duration?, language? }
RenderRequest { videoId, quality?, format? }
ApiError { message, code?, status? }
```

## Regole

- interface per oggetti, type per union/enum
- Campi opzionali con ?, mai `| undefined`
- status campi come union di stringhe letterali
- Record<string, unknown> per dati generici
- Esporta tutto con export
- Non duplicare tipi esistenti in altri file

Quando aggiungi un tipo, verifica che sia usato. Se non lo è dopo 2 sessioni, rimuovilo.

Collabora con: api-developer, tutti i page-dev.
