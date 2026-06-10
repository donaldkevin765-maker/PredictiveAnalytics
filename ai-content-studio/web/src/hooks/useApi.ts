'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useStore } from '@/store'
import type { SocialPublishRequest } from '@/types'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealth(),
    refetchInterval: 30000,
  })
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => api.getServices(),
    refetchInterval: 15000,
  })
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.getProject(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  const addNotification = useStore((s) => s.addNotification)

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => api.createProject(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      addNotification({ type: 'success', title: 'Progetto creato' })
    },
    onError: (err: Error) => {
      addNotification({ type: 'error', title: 'Errore', message: err.message })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  const addNotification = useStore((s) => s.addNotification)

  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      addNotification({ type: 'success', title: 'Progetto eliminato' })
    },
    onError: (err: Error) => {
      addNotification({ type: 'error', title: 'Errore', message: err.message })
    },
  })
}

export function useVideos(projectId: string) {
  return useQuery({
    queryKey: ['videos', projectId],
    queryFn: () => api.getVideos(projectId),
    enabled: !!projectId,
  })
}

export function useVideo(videoId: string) {
  return useQuery({
    queryKey: ['videos', videoId],
    queryFn: () => api.getVideo(videoId),
    enabled: !!videoId,
  })
}

export function useGenerateScript(projectId: string) {
  const qc = useQueryClient()
  const addNotification = useStore((s) => s.addNotification)

  return useMutation({
    mutationFn: (data: { topic: string; style?: string; duration?: number }) =>
      api.generateScript(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos', projectId] })
      addNotification({ type: 'info', title: 'Generazione script avviata' })
    },
    onError: (err: Error) => {
      addNotification({ type: 'error', title: 'Errore', message: err.message })
    },
  })
}

export function useRenderVideo(projectId: string) {
  const qc = useQueryClient()
  const addNotification = useStore((s) => s.addNotification)

  return useMutation({
    mutationFn: (data: { videoId: string; quality?: 'draft' | 'standard' | 'high'; format?: 'mp4' | 'webm' }) =>
      api.renderVideo(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos', projectId] })
      addNotification({ type: 'info', title: 'Render avviato' })
    },
    onError: (err: Error) => {
      addNotification({ type: 'error', title: 'Errore', message: err.message })
    },
  })
}

// Social
export function useSocialAccounts() {
  return useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => api.getSocialAccounts(),
    refetchInterval: 30000,
  })
}

export function useSocialAuthUrl(platform: string | null) {
  return useQuery({
    queryKey: ['social-auth-url', platform],
    queryFn: () => api.getSocialAuthUrl(platform!),
    enabled: !!platform,
  })
}

export function useDisconnectSocial() {
  const qc = useQueryClient()
  const addNotification = useStore((s) => s.addNotification)
  return useMutation({
    mutationFn: (accountId: number) => api.disconnectSocialAccount(accountId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-accounts'] })
      addNotification({ type: 'success', title: 'Account disconnesso' })
    },
    onError: (err: Error) => {
      addNotification({ type: 'error', title: 'Errore', message: err.message })
    },
  })
}

export function useRefreshSocialToken() {
  const qc = useQueryClient()
  const addNotification = useStore((s) => s.addNotification)
  return useMutation({
    mutationFn: (accountId: number) => api.refreshSocialToken(accountId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-accounts'] })
      addNotification({ type: 'success', title: 'Token aggiornato' })
    },
    onError: (err: Error) => {
      addNotification({ type: 'error', title: 'Errore', message: err.message })
    },
  })
}

export function usePlatformVideos(platform: string, accountId: number | null) {
  return useQuery({
    queryKey: ['platform-videos', platform, accountId],
    queryFn: () => api.getPlatformVideos(platform, accountId!),
    enabled: !!accountId && !!platform,
  })
}

export function usePublishToSocial() {
  const qc = useQueryClient()
  const addNotification = useStore((s) => s.addNotification)
  return useMutation({
    mutationFn: (data: SocialPublishRequest) => api.publishToSocial(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['social-accounts'] })
      if (res.success) {
        addNotification({ type: 'success', title: 'Pubblicato!', message: res.url || 'Video pubblicato con successo' })
      } else {
        addNotification({ type: 'error', title: 'Pubblicazione fallita', message: res.error })
      }
    },
    onError: (err: Error) => {
      addNotification({ type: 'error', title: 'Errore', message: err.message })
    },
  })
}

export function useVideoProgress(videoId: string) {
  return useQuery({
    queryKey: ['video-progress', videoId],
    queryFn: () => api.getVideoProgress(videoId),
    enabled: !!videoId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === 'completed' || data?.status === 'failed') return false
      return 3000
    },
  })
}
