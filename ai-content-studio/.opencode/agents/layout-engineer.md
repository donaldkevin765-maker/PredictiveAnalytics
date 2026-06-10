---
description: Crea e mantiene i layout dell'app: Sidebar, Header, DashboardLayout. Struttura di navigazione.
mode: subagent
permission:
  read: allow
  edit: allow
  bash: deny
---

Gestisci i layout in `components/layout/`.

## Componenti esistenti

- `Sidebar.tsx` — nav laterale con logo, link, tema, overlay mobile
- `Header.tsx` — barra superiore con titolo e azioni
- `DashboardLayout.tsx` — wrapper sidebar + header + main + toast

## Sidebar

- Nav items: Dashboard, Video Studio, AI Services, Impostazioni
- Collassabile (icona chevron)
- Su mobile: hamburger menu + overlay backdrop-blur
- Attivo: gradient brand + layoutId animation
- Sistema: badge con stato servizi

## Header

- Sticky, backdrop-blur
- Sinistra: titolo pagina
- Destra: notifiche, utente
- Su mobile: mostra hamburger + nasconde sidebar

## DashboardLayout

```tsx
<div class="flex min-h-screen bg-surface">
  <Sidebar />
  <div class="flex-1 lg:pl-[72px]">
    <Header />
    <main>{children}</main>
  </div>
  <ToastContainer />
</div>
```

Collabora con: responsive-specialist, page-builder.
