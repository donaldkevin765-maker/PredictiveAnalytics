'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  FileText,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Eye,
} from 'lucide-react'
import { Film, Music } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Progress } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { VideoPlayer } from '@/components/media/VideoPlayer'
import { AudioPlayer } from '@/components/media/AudioPlayer'
import { PreviewModal } from '@/components/media/PreviewModal'
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
  useVideos,
  useGenerateScript,
  useRenderVideo,
  useVideoProgress,
} from '@/hooks/useApi'
import type { Video } from '@/types'
import { formatDate, formatDuration } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const statusLabels: Record<string, string> = {
  queued: 'In coda',
  generating_script: 'Generazione script',
  generating_audio: 'Generazione audio',
  generating_video: 'Generazione video',
  completed: 'Completato',
  failed: 'Fallito',
}

export default function VideoStudioPage() {
  const [newProjectName, setNewProjectName] = useState('')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [topic, setTopic] = useState('')
  const [scriptStyle, setScriptStyle] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [renderingVideo, setRenderingVideo] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null)

  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: videos } = useVideos(selectedProject ?? '')
  const createProject = useCreateProject()
  const deleteProject = useDeleteProject()
  const generateScript = useGenerateScript(selectedProject ?? '')
  const renderVideo = useRenderVideo(selectedProject ?? '')

  const lastVideo = videos?.[videos.length - 1]
  const { data: progress } = useVideoProgress(lastVideo?.id ?? '')

  const selectProject = (id: string) => {
    setSelectedProject(id)
    setTopic('')
    setScriptStyle('')
  }

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return
    createProject.mutate(
      { name: newProjectName.trim() },
      { onSuccess: () => { setNewProjectName(''); setShowCreateForm(false) } }
    )
  }

  const handleGenerateScript = () => {
    if (!topic.trim() || !selectedProject) return
    generateScript.mutate({ topic: topic.trim(), style: scriptStyle || undefined })
  }

  const handleRender = (videoId: string) => {
    if (!selectedProject) return
    setRenderingVideo(videoId)
    renderVideo.mutate(
      { videoId },
      { onSettled: () => setRenderingVideo(null) }
    )
  }

  const isProcessing = lastVideo?.status === 'generating_script' ||
    lastVideo?.status === 'generating_audio' ||
    lastVideo?.status === 'generating_video'

  const selectedProjectData = projects?.find((p) => p.id === selectedProject)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Video Studio</h1>
          <p className="mt-1 text-sm text-gray-500">Crea e gestisci video con intelligenza artificiale</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4" />
          Nuovo Progetto
        </Button>
      </motion.div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
          >
            <Card className="overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-transparent to-purple-500/5" />
              <CardContent className="relative flex items-end gap-4">
                <div className="flex-1">
                  <Input
                    label="Nome Progetto"
                    placeholder="Es: Tutorial React, Video Promozionale..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  />
                </div>
                <Button onClick={handleCreateProject} loading={createProject.isPending}>
                  <Sparkles className="h-4 w-4" />
                  Crea Progetto
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Progetti</CardTitle>
              <CardDescription>
                {projects?.length ?? 0} progetti creati
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : !projects || projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Film className="mb-3 h-10 w-10 text-gray-600" />
                  <p className="text-sm text-gray-400 text-center">Nessun progetto</p>
                  <p className="mt-1 text-xs text-gray-600 text-center">Creane uno per iniziare</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {projects.map((project, i) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 transition-all ${
                        selectedProject === project.id
                          ? 'bg-gradient-to-r from-brand-500/15 to-purple-500/10 border border-brand-500/20'
                          : 'hover:bg-white/[0.03] border border-transparent'
                      }`}
                      onClick={() => selectProject(project.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            project.status === 'completed' ? 'bg-green-500' :
                            project.status === 'processing' ? 'bg-yellow-500' :
                            project.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                          <p className="truncate text-sm font-medium text-white">
                            {project.name}
                          </p>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-600">{formatDate(project.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {selectedProject === project.id && (
                          <ChevronRight className="h-4 w-4 text-brand-400" />
                        )}
                        <button
                          className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          onClick={(e) => { e.stopPropagation(); deleteProject.mutate(project.id) }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-9">
          {!selectedProject ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-purple-600/10 border border-brand-500/10">
                  <Film className="h-10 w-10 text-brand-400" />
                </div>
                <p className="text-xl font-semibold text-white">Seleziona un progetto</p>
                <p className="mt-2 text-sm text-gray-500 text-center max-w-sm">
                  Scegli un progetto dalla lista a sinistra per visualizzare i dettagli e iniziare a creare contenuti
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/3 via-transparent to-purple-500/3" />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedProjectData?.name ?? 'Progetto'}</CardTitle>
                        <CardDescription>Genera script AI per il tuo video</CardDescription>
                      </div>
                      <Badge variant={
                        selectedProjectData?.status === 'completed' ? 'success' :
                        selectedProjectData?.status === 'processing' ? 'warning' :
                        selectedProjectData?.status === 'failed' ? 'error' : 'info'
                      } size="sm">
                        {selectedProjectData?.status ?? 'bozza'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    <Textarea
                      label="Argomento del video"
                      placeholder="Descrivi cosa vuoi comunicare nel video... Es: 'Una guida passo-passo su come creare un sito web con Next.js'"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Select
                          label="Stile del video"
                          placeholder="Seleziona stile..."
                          value={scriptStyle}
                          onChange={(e) => setScriptStyle(e.target.value)}
                          options={[
                            { value: 'informativo', label: '📚 Informativo' },
                            { value: 'divertente', label: '😄 Divertente' },
                            { value: 'professionale', label: '💼 Professionale' },
                            { value: 'storytelling', label: '📖 Storytelling' },
                          ]}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={handleGenerateScript}
                          loading={generateScript.isPending}
                          disabled={!topic.trim()}
                          size="lg"
                        >
                          <FileText className="h-4 w-4" />
                          Genera Script AI
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {videos && videos.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Video Generati</h3>
                    <Badge variant="info" size="sm">{videos.length} video</Badge>
                  </div>
                  {videos.map((video, i) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="overflow-hidden">
                        <div className={`absolute inset-0 ${
                          video.status === 'completed' ? 'bg-gradient-to-r from-green-500/3 via-transparent to-transparent' :
                          video.status === 'failed' ? 'bg-gradient-to-r from-red-500/3 via-transparent to-transparent' :
                          'bg-gradient-to-r from-brand-500/3 via-transparent to-transparent'
                        }`} />
                        <CardContent className="relative">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <p className="font-medium text-white">{video.title}</p>
                                <Badge
                                  variant={
                                    video.status === 'completed' ? 'success' :
                                    video.status === 'failed' ? 'error' : 'warning'
                                  }
                                  size="sm"
                                >
                                  {statusLabels[video.status] || video.status}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs text-gray-600">
                                {formatDate(video.createdAt)}
                                {video.duration && ` · ${formatDuration(video.duration)}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                              {(video.videoUrl || video.audioUrl) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPreviewVideo(video)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Anteprima
                                </Button>
                              )}
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleRender(video.id)}
                                loading={renderingVideo === video.id}
                                disabled={renderingVideo === video.id || video.status === 'generating_video' || video.status === 'completed'}
                              >
                                {video.status === 'completed' ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <Sparkles className="h-3.5 w-3.5" />
                                )}
                                {video.status === 'completed' ? 'Completato' : 'Render'}
                              </Button>
                            </div>
                          </div>

                          {isProcessing && video.id === lastVideo?.id && progress && (
                            <div className="mt-4">
                              <Progress
                                value={progress.progress}
                                variant={progress.status === 'completed' ? 'success' : progress.status === 'failed' ? 'error' : 'default'}
                                showLabel
                                size="md"
                              />
                              <p className="mt-1.5 text-xs text-gray-500">
                                {statusLabels[progress.status] || progress.status}
                              </p>
                            </div>
                          )}

                          {video.videoUrl && (
                            <div className="mt-4">
                              <VideoPlayer
                                src={video.videoUrl}
                                title={video.title}
                                compact
                              />
                            </div>
                          )}
                          {!video.videoUrl && video.audioUrl && (
                            <div className="mt-4">
                              <AudioPlayer
                                src={video.audioUrl}
                                title="Anteprima audio"
                              />
                            </div>
                          )}
                          {video.script && (
                            <details className="mt-4 group">
                              <summary className="flex cursor-pointer items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors">
                                <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
                                Mostra script generato
                              </summary>
                              <div className="mt-3 rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans leading-relaxed">
                                  {video.script}
                                </pre>
                              </div>
                            </details>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <PreviewModal
        open={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
        videoUrl={previewVideo?.videoUrl}
        audioUrl={previewVideo?.audioUrl}
        title={previewVideo?.title}
      />
    </div>
  )
}
