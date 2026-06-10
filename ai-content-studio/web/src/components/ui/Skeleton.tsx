'use client'

import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer rounded-lg', className)} />
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <Skeleton className="mb-3 h-4 w-20" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  )
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
