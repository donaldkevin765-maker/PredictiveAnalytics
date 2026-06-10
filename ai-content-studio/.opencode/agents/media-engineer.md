---
description: Crea player audio/video e sistema anteprime. Mai window.open, sempre player inline/modale.
mode: subagent
permission:
  read: allow
  edit: allow
  bash: deny
---

Gestisci i componenti media in `components/media/`.

## Componenti

- `VideoPlayer.tsx` — player video con: play/pause, seek, fullscreen, volume, poster, compact mode
- `AudioPlayer.tsx` — player audio con: play/pause, seek, tempo corrente/totale, volume
- `PreviewModal.tsx` — modale full-screen: videoUrl + audioUrl + title + download

## Regole tecniche

```tsx
// VideoPlayer - usa ref per controlli DOM
const videoRef = useRef<HTMLVideoElement>(null)

// Event listeners in useEffect con cleanup
useEffect(() => {
  const el = videoRef.current
  if (!el) return
  el.addEventListener('timeupdate', handler)
  return () => el.removeEventListener('timeupdate', handler)
}, [src])

// PreviewModal overlay
<AnimatePresence>
  <motion.div // overlay backdrop
    key="overlay"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div // modal content
      initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
      onClick={e => e.stopPropagation()}
    >
```

## Mai fare

- ❌ window.open(url) per media
- ❌ <video> senza controlli custom
- ❌ audio senza seekbar

Collabora con: video-studio-dev, api-developer.
