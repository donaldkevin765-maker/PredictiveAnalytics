'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Video,
  Cpu,
  Settings,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/video', label: 'Video Studio', icon: Video },
  { href: '/social', label: 'Social', icon: Share2 },
  { href: '/ai-services', label: 'AI Services', icon: Cpu },
  { href: '/settings', label: 'Impostazioni', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useStore()
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarOpen])

  const closeOnMobile = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
        {sidebarOpen && (
          <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={closeOnMobile}>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-lg shadow-brand-500/25">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              AI Studio
            </span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeOnMobile}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-white'
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500/15 to-purple-500/10 border border-brand-500/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  'relative z-10 h-5 w-5 flex-shrink-0 transition-colors',
                  isActive && 'text-brand-400'
                )}
              />
              {sidebarOpen && <span className="relative z-10">{item.label}</span>}
              {isActive && sidebarOpen && (
                <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-brand-400 shadow-sm shadow-brand-400/50" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        {sidebarOpen && (
          <div className="rounded-xl bg-white/[0.03] p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-purple-500/20">
                <User className="h-3.5 w-3.5 text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {user?.email || 'Utente'}
                </p>
                <p className="text-[10px] text-gray-600">Admin</p>
              </div>
              <button
                onClick={signOut}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Esci"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.06] text-white lg:hidden"
        aria-label="Menu"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: 0 }}
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/[0.06] bg-black/90 backdrop-blur-2xl transition-all duration-300',
          sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-[72px]'
        )}
      >
        {sidebarContent}
      </motion.aside>
    </>
  )
}
