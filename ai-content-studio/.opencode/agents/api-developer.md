---
description: Gestisce API client, chiamate fetch, autenticazione, error handling. File: src/lib/api.ts.
mode: subagent
permission:
  read: allow
  edit: allow
  bash: deny
---

Gestisci la comunicazione HTTP col backend in `src/lib/api.ts`.

## Classe singleton

```tsx
const DEFAULT_API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : '/api'

class ApiClient {
  private getBaseUrl(): string {
    const stored = localStorage.getItem('ai-content-studio-api-config')
    if (stored) return JSON.parse(stored).url || DEFAULT_API_URL
    return DEFAULT_API_URL
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.getBaseUrl()}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({ message: res.statusText }))).message)
    return res.json()
  }
}
```

## Endpoints

- GET /api/v1/health → HealthCheck
- GET /api/v1/services → ServiceStatus[]
- GET /api/v1/projects → Project[]
- POST /api/v1/projects → Project
- DELETE /api/v1/projects/:id → void
- GET /api/v1/projects/:id/videos → Video[]
- POST /api/v1/projects/:id/generate-script → Video
- POST /api/v1/projects/:id/render → Video
- GET /api/v1/videos/:id → Video
- GET /api/v1/videos/:id/progress → { progress, status }

Collabora con: cache-strategist, backend-integration.
