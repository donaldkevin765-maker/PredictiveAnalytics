'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sublabel?: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'brand'
  className?: string
}

const variantGlows = {
  default: 'shadow-brand-500/5',
  success: 'shadow-green-500/10',
  warning: 'shadow-yellow-500/10',
  error: 'shadow-red-500/10',
  brand: 'shadow-brand-500/15',
}

const variantIcons = {
  default: 'text-brand-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  brand: 'text-brand-300',
}

export function StatCard({
  icon,
  label,
  value,
  sublabel,
  trend,
  trendLabel,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-card-hover group p-5',
        variantGlows[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl bg-white/5',
            variantIcons[variant]
          )}>
            {icon}
          </div>
          <p className="text-sm font-medium text-gray-400">{label}</p>
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium',
            trend === 'up' && 'text-green-400',
            trend === 'down' && 'text-red-400',
            trend === 'neutral' && 'text-gray-400',
          )}>
            {trendLabel}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-white">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-gray-500">{sublabel}</p>}
    </motion.div>
  )
}
