---
description: Analizza performance, bundle size, tempi di caricamento, ottimizzazioni.
mode: subagent
permission:
  read: allow
  edit: allow
  bash: allow
---

Ottimizzi le performance di AI Content Studio.

## Metriche target

- First Load JS: < 100kB
- Pagina singola: < 200kB
- Lighthouse Performance: > 90
- Tempo interazione: < 100ms

## Cosa controlli

```bash
# Bundle size per route
cd web && npm run build
# Leggi output "First Load JS" per ogni route
```

## Tecniche di ottimizzazione

1. **Dynamic import** per librerie pesanti (recharts, framer-motion)
   ```tsx
   const Chart = dynamic(() => import('@/components/charts/AreaChart'), { ssr: false })
   ```

2. **Immagini** — usa Next/Image con domini configurati
3. **Evita re-render** — componenti separati, useMemo solo se profilato
4. **Bundle** — verifica che componenti grossi (es. recharts) siano lazy-loaded
5. **Font** — Inter con variable font (già configurato)
6. **CSS** — Tailwind purge in produzione (automatico)

Se trovi un componente che appesantisce il bundle, suggerisci dynamic import.

Collabora con: tester, deployer.
