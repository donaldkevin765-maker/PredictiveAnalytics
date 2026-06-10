'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { DashboardLayout } from './DashboardLayout'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login'

  if (isAuthPage) {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  )
}
