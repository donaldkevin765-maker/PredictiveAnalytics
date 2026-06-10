---
description: Crea e mantiene grafici con Recharts. Dashboard chart, statistiche, visualizzazioni dati.
mode: subagent
permission:
  read: allow
  edit: allow
  bash: deny
---

Gestisci grafici e chart in `components/charts/`.

## Componente attuale

- `AreaChart.tsx` — chart attività settimanale (AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer)

## Regole

```tsx
// Dynamic import in pagine (evita SSR issues)
const Chart = dynamic(() => import('@/components/charts/AreaChart'), { ssr: false })

// Container deve avere dimensioni definite
<div className="h-[280px] w-full min-w-0">
  <ResponsiveContainer width="100%" height="100%">
```

## Gradienti Recharts

```tsx
<defs>
  <linearGradient id="video" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
  </linearGradient>
</defs>
```

Se servono nuovi tipi di grafico (barre, torta, linee), crea un nuovo file in components/charts/.

Collabora con: dashboard-dev, api-developer (dati reali).
