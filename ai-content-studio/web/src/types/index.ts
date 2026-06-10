export interface Project {
  id: string
  name: string
  description?: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  thumbnail?: string
  metadata?: Record<string, unknown>
}

export interface Video {
  id: string
  projectId: string
  title: string
  status: 'queued' | 'generating_script' | 'generating_audio' | 'generating_video' | 'completed' | 'failed'
  progress: number
  script?: string
  audioUrl?: string
  videoUrl?: string
  duration?: number
  createdAt: string
  updatedAt: string
  error?: string
}

export interface Scene {
  id: string
  videoId: string
  order: number
  content: string
  duration: number
  mediaUrl?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface ServiceStatus {
  name: string
  status: 'online' | 'offline' | 'degraded'
  type: 'llm' | 'tts' | 'image' | 'video' | 'audio' | 'storage'
  latency?: number
  error?: string
  fallbackAvailable?: boolean
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  uptime: number
  services: ServiceStatus[]
}

export interface ScriptRequest {
  topic: string
  style?: string
  duration?: number
  language?: string
}

export interface RenderRequest {
  videoId: string
  quality?: 'draft' | 'standard' | 'high'
  format?: 'mp4' | 'webm'
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface SocialAccount {
  id: number
  platform: 'youtube' | 'instagram' | 'tiktok'
  platform_user_id: string
  platform_username: string
  connected: boolean
  token_expiry: string | null
  created_at: string
  updated_at: string
}

export interface SocialAuthUrl {
  url: string
  state: string
}

export interface SocialPublishRequest {
  video_id: number
  account_id: number
  title?: string
  description?: string
}

export interface SocialPublishResponse {
  success: boolean
  platform_post_id?: string
  url?: string
  error?: string
}

export interface PlatformVideo {
  id: string
  title: string
  thumbnail: string
  url: string
  published_at: string
  privacy?: string
  media_type?: string
}
