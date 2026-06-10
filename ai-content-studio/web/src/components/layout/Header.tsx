'use client'

import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-black/20 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">AI Content Studio</h2>
          <p className="text-[11px] text-gray-500">Piattaforma di creazione video AI</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500 shadow-sm shadow-brand-500/50" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-[18px] w-[18px]" />
        </Button>
      </div>
    </header>
  )
}
