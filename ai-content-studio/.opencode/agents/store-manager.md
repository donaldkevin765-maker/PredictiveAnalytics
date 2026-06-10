---
description: Gestisce lo stato globale con Zustand (tema, sidebar, notifiche). Persiste preferenze in localStorage.
mode: subagent
permission:
  read: allow
  edit: allow
  bash: deny
---

Gestisci lo stato globale in `src/store/index.ts`.

## Store attuale

```tsx
interface AppState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  notifications: Notification[]
  setTheme, toggleTheme, toggleSidebar, setSidebarOpen
  addNotification, removeNotification, clearNotifications
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      notifications: [],
      // ...azioni
    }),
    {
      name: 'ai-content-studio',
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    }
  )
)
```

## Regole

- persist solo theme e sidebarOpen (non notifiche)
- max 50 notifiche (slice)
- Azioni sincrone, niente side effects
- TypeScript strict
- Non duplicare stato che arriva da TanStack Query

Collabora con: layout-engineer, settings-dev.
