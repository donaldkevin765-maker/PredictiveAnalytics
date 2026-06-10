'use client'

import { useState, useRef } from 'react'
import { Play, Pause, Maximize2, Minimize2, Volume2, VolumeX, Film } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  className?: string
  compact?: boolean
}

export function VideoPlayer({ src, poster, title, className, compact }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [hovering, setHovering] = useState(false)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) { videoRef.current.pause(); setPlaying(false) }
    else { videoRef.current.play(); setPlaying(true) }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pct * duration
  }

  const toggleFS = async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
      setFullscreen(true)
    } else {
      await document.exitFullscreen()
      setFullscreen(false)
    }
  }

  const fmt = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative group rounded-xl overflow-hidden bg-black border border-white/[0.06]',
        compact ? 'max-w-sm' : 'w-full',
        className
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        className="w-full aspect-video object-contain bg-black cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) { setDuration(videoRef.current.duration); setLoaded(true) }
        }}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-brand-600/30 flex items-center justify-center animate-pulse">
              <Film className="h-6 w-6 text-brand-400" />
            </div>
            <p className="text-xs text-gray-500">Caricamento...</p>
          </div>
        </div>
      )}

      {!playing && loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="h-16 w-16 rounded-full bg-brand-600/80 flex items-center justify-center hover:bg-brand-500 transition-all shadow-xl shadow-brand-600/30">
            <Play className="h-7 w-7 text-white ml-1" />
          </div>
        </div>
      )}

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-8 transition-opacity',
          hovering || !playing ? 'opacity-100' : 'opacity-0'
        )}
      >
        {title && <p className="text-xs text-white/80 mb-2 truncate">{title}</p>}
        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="text-white hover:text-brand-400 transition-colors flex-shrink-0">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <div
            className="flex-1 h-1.5 rounded-full bg-white/20 cursor-pointer relative group/bar"
            onClick={seek}
          >
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-100"
              style={{ width: `${pct}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"
              style={{ left: `calc(${pct}% - 6px)` }}
            />
          </div>
          <span className="text-xs text-white/60 font-mono flex-shrink-0">
            {loaded ? fmt(currentTime) : '--:--'} / {loaded ? fmt(duration) : '--:--'}
          </span>
          <button onClick={() => setMuted(!muted)} className="text-white/60 hover:text-white transition-colors flex-shrink-0">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button onClick={toggleFS} className="text-white/60 hover:text-white transition-colors flex-shrink-0">
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
