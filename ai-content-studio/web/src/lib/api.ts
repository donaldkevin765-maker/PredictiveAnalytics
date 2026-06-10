import type { HealthCheck, Project, ScriptRequest, ServiceStatus, Video, RenderRequest, SocialAccount, SocialAuthUrl, SocialPublishRequest, SocialPublishResponse, PlatformVideo } from '@/types'

const DEFAULT_API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : '/api'

function getApiConfig() {
  if (typeof window === 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL,
      token: process.env.NEXT_PUBLIC_AUTH_TOKEN || '',
    }
  }
  try {
    const stored = localStorage.getItem('ai-content-studio-api-config')
    if (stored) {
      const config = JSON.parse(stored)
      return {
        url: config.url || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL,
        token: config.key || process.env.NEXT_PUBLIC_AUTH_TOKEN || '',
      }
    }
  } catch {}
  return {
    url: process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL,
    token: process.env.NEXT_PUBLIC_AUTH_TOKEN || '',
  }
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const { token } = getApiConfig()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  private getBaseUrl(): string {
    return getApiConfig().url
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.getBaseUrl()}${path}`
    const res = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options?.headers,
      },
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(error.message || `Errore ${res.status}`)
    }
    return res.json()
  }

  async getHealth(): Promise<HealthCheck> {
    return this.request<HealthCheck>('/api/v1/health')
  }

  async getServices(): Promise<ServiceStatus[]> {
    return this.request<ServiceStatus[]>('/api/v1/services')
  }

  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/api/v1/projects')
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/v1/projects/${id}`)
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    return this.request<Project>('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/api/v1/projects/${id}`, {
      method: 'DELETE',
    })
  }

  async getVideos(projectId: string): Promise<Video[]> {
    return this.request<Video[]>(`/api/v1/projects/${projectId}/videos`)
  }

  async getVideo(videoId: string): Promise<Video> {
    return this.request<Video>(`/api/v1/videos/${videoId}`)
  }

  async generateScript(projectId: string, data: ScriptRequest): Promise<Video> {
    return this.request<Video>(`/api/v1/projects/${projectId}/generate-script`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async renderVideo(projectId: string, data: RenderRequest): Promise<Video> {
    return this.request<Video>(`/api/v1/projects/${projectId}/render`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getVideoProgress(videoId: string): Promise<{ progress: number; status: string }> {
    return this.request<{ progress: number; status: string }>(`/api/v1/videos/${videoId}/progress`)
  }

  // Social accounts
  async getSocialAccounts(): Promise<SocialAccount[]> {
    return this.request<SocialAccount[]>('/api/v1/social/accounts')
  }

  async getSocialAuthUrl(platform: string): Promise<SocialAuthUrl> {
    return this.request<SocialAuthUrl>(`/api/v1/social/auth-url/${platform}`)
  }

  async disconnectSocialAccount(accountId: number): Promise<void> {
    return this.request<void>(`/api/v1/social/accounts/${accountId}`, { method: 'DELETE' })
  }

  async refreshSocialToken(accountId: number): Promise<SocialAccount> {
    return this.request<SocialAccount>(`/api/v1/social/refresh/${accountId}`, { method: 'POST' })
  }

  async getPlatformVideos(platform: string, accountId: number): Promise<PlatformVideo[]> {
    return this.request<PlatformVideo[]>(`/api/v1/social/videos/${platform}?account_id=${accountId}`)
  }

  async publishToSocial(data: SocialPublishRequest): Promise<SocialPublishResponse> {
    return this.request<SocialPublishResponse>('/api/v1/social/publish', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient()
