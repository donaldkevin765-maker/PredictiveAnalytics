'use client'

import { useState, createElement } from 'react'
import {
  Youtube,
  Instagram,
  Music2,
  Link2,
  Link2Off,
  RefreshCw,
  Send,
  Globe,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Video,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  useSocialAccounts,
  useDisconnectSocial,
  useRefreshSocialToken,
  usePlatformVideos,
  usePublishToSocial,
  useProjects,
  useVideos,
} from '@/hooks/useApi'
import type { SocialAccount, PlatformVideo } from '@/types'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

const platformConfig: Record<string, { label: string; color: string; icon: typeof Youtube }> = {
  youtube: { label: 'YouTube', color: 'from-red-600 to-red-500', icon: Youtube },
  instagram: { label: 'Instagram', color: 'from-fuchsia-600 to-pink-500', icon: Instagram },
  tiktok: { label: 'TikTok', color: 'from-zinc-800 to-zinc-700', icon: Music2 },
}

export default function SocialPage() {
  const { data: accounts, isLoading: accountsLoading } = useSocialAccounts()
  const { data: projects } = useProjects()
  const disconnectSocial = useDisconnectSocial()
  const refreshToken = useRefreshSocialToken()
  const publishToSocial = usePublishToSocial()

  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [publishAccountId, setPublishAccountId] = useState<number | null>(null)
  const [publishProjectId, setPublishProjectId] = useState<string>('')
  const [publishVideoId, setPublishVideoId] = useState<string>('')
  const [publishTitle, setPublishTitle] = useState('')
  const [publishDescription, setPublishDescription] = useState('')

  const { data: platformVideos } = usePlatformVideos(selectedPlatform ?? '', selectedAccountId)

  const connectedAccounts = accounts?.filter(a => a.connected) ?? []
  const disconnectedAccounts = accounts?.filter(a => !a.connected) ?? []

  const hasYouTube = accounts?.some(a => a.platform === 'youtube' && a.connected)
  const hasInstagram = accounts?.some(a => a.platform === 'instagram' && a.connected)
  const hasTikTok = accounts?.some(a => a.platform === 'tiktok' && a.connected)

  const publishAccount = connectedAccounts.find(a => a.id === publishAccountId)
  const { data: publishVideos } = useVideos(publishProjectId)

  const handleConnect = async (platform: string) => {
    try {
      const res = await fetch(`/api/v1/social/auth-url/${platform}`)
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (e) {
      console.error('Failed to get auth URL:', e)
    }
  }

  const handlePublish = () => {
    if (!publishAccountId || !publishVideoId) return
    publishToSocial.mutate({
      account_id: publishAccountId,
      video_id: parseInt(publishVideoId),
      title: publishTitle || undefined,
      description: publishDescription || undefined,
    })
  }

  const handleShowVideos = (account: SocialAccount) => {
    setSelectedPlatform(account.platform)
    setSelectedAccountId(account.id)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Social Media Manager</h1>
          <p className="mt-1 text-sm text-gray-500">
            Collegati ai tuoi canali social per pubblicare video direttamente dalla dashboard
          </p>
        </div>
      </motion.div>

      {/* Account Connessi */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Account Connessi</h2>
          <Badge variant="info" size="sm">{connectedAccounts.length} connessi</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accountsLoading ? (
            <>
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </>
          ) : (
            ['youtube', 'instagram', 'tiktok'].map((platform) => {
              const cfg = platformConfig[platform]
              const Icon = cfg.icon
              const account = accounts?.find(a => a.platform === platform && a.connected)
              const disconnected = accounts?.find(a => a.platform === platform && !a.connected)
              const isConnected = !!account

              return (
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`overflow-hidden ${isConnected ? 'gradient-border' : ''}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${cfg.color} opacity-[0.03]`} />
                    <CardContent className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.color} shadow-lg`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{cfg.label}</p>
                          {isConnected ? (
                            <p className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Connesso
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">Non connesso</p>
                          )}
                        </div>
                      </div>

                      {isConnected && account ? (
                        <div className="space-y-3">
                          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5">
                            <p className="text-xs text-gray-500">Account</p>
                            <p className="text-sm font-medium text-white truncate">
                              {account.platform_username || account.platform_user_id || cfg.label}
                            </p>
                          </div>
                          {account.token_expiry && (
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Scadenza token:</span>
                              <span>{formatDate(account.token_expiry)}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleShowVideos(account)}
                            >
                              <Video className="h-3.5 w-3.5" />
                              Contenuti
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => refreshToken.mutate(account.id)}
                              loading={refreshToken.isPending}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => disconnectSocial.mutate(account.id)}
                              loading={disconnectSocial.isPending}
                            >
                              <LogOut className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-600">
                            {disconnected
                              ? 'Token scaduto o non valido. Ricollega l\'account.'
                              : 'Connetti il tuo account per pubblicare video direttamente.'}
                          </p>
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={() => handleConnect(platform)}
                          >
                            <Link2 className="h-4 w-4" />
                            {disconnected ? 'Ricollega' : 'Connetti'} {cfg.label}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </div>
      </section>

      {/* Pubblica Video */}
      {connectedAccounts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Send className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">Pubblica Video</h2>
          </div>
          <Card>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/3 via-transparent to-purple-500/3" />
            <CardContent className="relative space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Account Social"
                  placeholder="Seleziona account..."
                  value={publishAccountId?.toString() ?? ''}
                  onChange={(e) => {
                    setPublishAccountId(e.target.value ? parseInt(e.target.value) : null)
                    setPublishTitle('')
                    setPublishDescription('')
                  }}
                  options={connectedAccounts.map(a => ({
                    value: a.id.toString(),
                    label: `${platformConfig[a.platform]?.label || a.platform} — ${a.platform_username || 'Connesso'}`,
                  }))}
                />
                <Select
                  label="Progetto"
                  placeholder="Seleziona progetto..."
                  value={publishProjectId}
                  onChange={(e) => {
                    setPublishProjectId(e.target.value)
                    setPublishVideoId('')
                  }}
                  options={(projects ?? []).map(p => ({
                    value: p.id,
                    label: p.name,
                  }))}
                />
              </div>

              {publishProjectId && (
                <Select
                  label="Video da pubblicare"
                  placeholder="Seleziona video..."
                  value={publishVideoId}
                  onChange={(e) => setPublishVideoId(e.target.value)}
                  options={(publishVideos ?? []).map(v => ({
                    value: v.id,
                    label: `${v.title} (${v.status})`,
                  }))}
                />
              )}

              {publishVideoId && publishAccount && (
                <>
                  <Input
                    label="Titolo (opzionale)"
                    placeholder={`Titolo predefinito: ${publishVideos?.find(v => v.id === publishVideoId)?.title || ''}`}
                    value={publishTitle}
                    onChange={(e) => setPublishTitle(e.target.value)}
                  />
                  <Textarea
                    label="Descrizione (opzionale)"
                    placeholder="Descrivi il contenuto del video..."
                    value={publishDescription}
                    onChange={(e) => setPublishDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handlePublish}
                      loading={publishToSocial.isPending}
                      size="lg"
                    >
                      <Send className="h-4 w-4" />
                      Pubblica su {platformConfig[publishAccount.platform]?.label || publishAccount.platform}
                    </Button>
                  </div>
                </>
              )}

              {!publishAccountId && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Send className="mb-3 h-10 w-10 text-gray-600" />
                  <p className="text-sm text-gray-400">Seleziona un account social e un progetto</p>
                  <p className="mt-1 text-xs text-gray-600">Scegli quali video pubblicare e su quale piattaforma</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Contenuti pubblicati sulla piattaforma */}
      {selectedPlatform && selectedAccountId && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {createElement(platformConfig[selectedPlatform]?.icon || Video, { className: 'h-5 w-5 text-gray-400' })}
              <h2 className="text-lg font-semibold text-white">
                I tuoi contenuti su {platformConfig[selectedPlatform]?.label || selectedPlatform}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedPlatform(null); setSelectedAccountId(null) }}
            >
              Chiudi
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!platformVideos ? (
              <>
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </>
            ) : platformVideos.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Video className="mb-3 h-10 w-10 text-gray-600" />
                    <p className="text-sm text-gray-400">Nessun contenuto trovato su questa piattaforma</p>
                    <p className="mt-1 text-xs text-gray-600">Pubblica il tuo primo video!</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              platformVideos.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden group">
                    <div className="relative aspect-video bg-white/[0.02] overflow-hidden">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Video className="h-8 w-8 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 right-2">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3.5">
                      <p className="text-sm font-medium text-white truncate">{video.title || 'Senza titolo'}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {video.published_at ? formatDate(video.published_at) : ''}
                        {video.privacy && ` · ${video.privacy}`}
                        {video.media_type && ` · ${video.media_type}`}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Stato vuoto se nessun account */}
      {!accountsLoading && accounts?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-purple-600/10 border border-brand-500/10">
              <Globe className="h-10 w-10 text-brand-400" />
            </div>
            <p className="text-xl font-semibold text-white">Nessun account social collegato</p>
            <p className="mt-2 text-sm text-gray-500 text-center max-w-md">
              Connetti YouTube, Instagram o TikTok per pubblicare i tuoi video direttamente dalla dashboard
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
