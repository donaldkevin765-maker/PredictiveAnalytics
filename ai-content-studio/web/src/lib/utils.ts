import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDuration(seconds?: number): string {
  if (seconds === undefined || seconds === null) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'online':
    case 'healthy':
    case 'completed':
      return 'text-green-500'
    case 'degraded':
    case 'processing':
    case 'generating_script':
    case 'generating_audio':
    case 'generating_video':
      return 'text-yellow-500'
    case 'offline':
    case 'unhealthy':
    case 'failed':
      return 'text-red-500'
    case 'draft':
    case 'queued':
    case 'pending':
      return 'text-gray-500'
    default:
      return 'text-gray-400'
  }
}

export function truncate(str: string, len: number = 50): string {
  if (str.length <= len) return str
  return str.slice(0, len) + '...'
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
