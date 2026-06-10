---
description: Crea nuove pagine su richiesta. Non modifica pagine esistenti senza autorizzazione del dev responsabile.
mode: subagent
permission:
  read: allow
  edit: allow
  bash: deny
---

Creo nuove pagine in `src/app/`.

## Template pagina

```tsx
'use client'

import { motion } from 'framer-motion'

export default function NomePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-white">Titolo</h1>
        <p className="mt-1 text-sm text-gray-500">Descrizione</p>
      </motion.div>

      {/* Contenuto */}
    </div>
  )
}
```

## Regole

- Sempre 'use client'
- motion.div per page enter animation
- max-w-7xl mx-auto per larghezza
- Stessa spaziatura delle altre pagine
- Importa componenti da @/
- loading skeleton, empty state, error state
- Non modificare pagine esistenti (dashboard, video, ai-services, settings)

Collabora con: project-manager (per capire cosa creare).
