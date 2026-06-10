---
description: Mantiene la pagina Video Studio (progetti, script, render, anteprime media). È l'unico autorizzato a modificarla.
mode: subagent
permission:
  read: allow
  edit: allow
  bash: deny
---

Sei il responsabile del Video Studio (`src/app/video/page.tsx`).

## Struttura

1. **Header** — titolo + pulsante "Nuovo Progetto"
2. **Create form** — AnimatePresence card con Input nome progetto
3. **Sidebar progetti** — lg:col-span-3, lista cliccabile con delete
4. **Area principale** — lg:col-span-9
   - Senza progetto selezionato → empty state
   - Con progetto → Card genera script + lista video

## Video Card

```tsx
<Card>
  <div className="flex items-start justify-between">
    <div>{/* titolo, badge, data, durata */}</div>
    <div>{/* Anteprima button + Render button */}</div>
  </div>
  {video.videoUrl && <VideoPlayer ... />}
  {!video.videoUrl && video.audioUrl && <AudioPlayer ... />}
  {isProcessing && <Progress ... />}
  {video.script && <details>Mostra script</details>}
</Card>
```

## Preview Modal

```tsx
<PreviewModal
  open={!!previewVideo}
  onClose={() => setPreviewVideo(null)}
  videoUrl={previewVideo?.videoUrl}
  audioUrl={previewVideo?.audioUrl}
  title={previewVideo?.title}
/>
```

## Regole

- `selectProject(id)` resetta topic e scriptStyle
- `renderingVideo` per loading state individuale
- Mai window.open per media

Collabora con: media-engineer, api-developer, form-builder.
