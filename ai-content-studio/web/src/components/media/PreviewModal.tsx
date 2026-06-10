'use client'

import { useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoPlayer } from './VideoPlayer'
import { AudioPlayer } from './AudioPlayer'

interface PreviewModalProps {
  open: boolean
  onClose: () => void
  videoUrl?: string
  audioUrl?: string
  title?: string
}

export function PreviewModal({ open, onClose, videoUrl, audioUrl, title }: PreviewModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const hasVideo = !!videoUrl
  const hasAudio = !!audioUrl

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-card border border-white/[0.06] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/[0.06] bg-surface-card/90 backdrop-blur-xl">
              <div>
                <h3 className="text-sm font-semibold text-white">{title || 'Anteprima'}</h3>
                <p className="text-xs text-gray-500">
                  {hasVideo && hasAudio ? 'Video + Audio' : hasVideo ? 'Solo video' : 'Solo audio'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {videoUrl && (
                  <a
                    href={videoUrl}
                    download
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {hasVideo && (
                <VideoPlayer
                  src={videoUrl}
                  title={title}
                />
              )}
              {hasAudio && (
                <AudioPlayer
                  src={audioUrl}
                  title={hasVideo ? 'Traccia audio separata' : title}
                />
              )}
              {!hasVideo && !hasAudio && (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-sm text-gray-500">Nessun file disponibile per l&apos;anteprima</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
