'use client'

import { Video, Cpu, Activity, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { useHealth, useProjects, useServices } from '@/hooks/useApi'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const AreaChartCard = dynamic(() => import('@/components/charts/AreaChart'), { ssr: false })

export default function DashboardPage() {
  const { data: health, isLoading: healthLoading } = useHealth()
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: services, isLoading: servicesLoading } = useServices()

  const onlineServices = services?.filter((s) => s.status === 'online').length ?? 0
  const totalServices = services?.length ?? 0
  const completedProjects = projects?.filter((p) => p.status === 'completed').length ?? 0

  const today = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">Panoramica</h1>
            <div className="flex h-6 items-center rounded-full bg-green-500/10 px-2.5 text-xs font-medium text-green-400 border border-green-500/20">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50 animate-pulse-glow" />
              Sistema attivo
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Benvenuto in AI Content Studio &middot; {today}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {projectsLoading ? (
          <>
            <Skeleton className="h-[124px] rounded-2xl" />
            <Skeleton className="h-[124px] rounded-2xl" />
            <Skeleton className="h-[124px] rounded-2xl" />
            <Skeleton className="h-[124px] rounded-2xl" />
          </>
        ) : (
          <>
            <StatCard
              icon={<Video className="h-5 w-5" />}
              label="Progetti Totali"
              value={projects?.length ?? 0}
              sublabel={projects?.length ? 'Tutti i progetti creati' : 'Nessun progetto ancora'}
              variant="brand"
            />
            <StatCard
              icon={<BarChart3 className="h-5 w-5" />}
              label="Completati"
              value={completedProjects}
              sublabel={completedProjects ? 'Progetti completati con successo' : 'Nessun progetto completato'}
              variant="success"
            />
            <StatCard
              icon={<Cpu className="h-5 w-5" />}
              label="Servizi Online"
              value={`${onlineServices}/${totalServices}`}
              sublabel={totalServices > 0 ? `${Math.round((onlineServices / totalServices) * 100)}% operativi` : 'Backend non connesso'}
              variant={totalServices === 0 ? 'default' : onlineServices === totalServices ? 'success' : 'warning'}
            />
            <StatCard
              icon={<Activity className="h-5 w-5" />}
              label="Stato Sistema"
              value={health?.status === 'healthy' ? 'Salute' : health?.status === 'degraded' ? 'Degradato' : health?.status ? health.status : '---'}
              sublabel={health ? `v${health.version ?? '--'}` : 'In attesa di connessione...'}
              variant={!health ? 'default' : health.status === 'healthy' ? 'success' : health.status === 'degraded' ? 'warning' : 'error'}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <AreaChartCard />

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Servizi AI</CardTitle>
                <p className="text-sm text-gray-500">Stato in tempo reale</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !services || services.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Cpu className="mb-3 h-10 w-10 text-gray-600" />
                <p className="text-sm font-medium text-gray-400">Nessun servizio disponibile</p>
                <p className="mt-1 text-xs text-gray-600 text-center">Collega il backend nelle Impostazioni</p>
              </div>
            ) : (
              <div className="space-y-2">
                {services.map((service, i) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3.5 py-2.5 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${
                        service.status === 'online'
                          ? 'bg-green-500 shadow-sm shadow-green-500/50'
                          : service.status === 'degraded'
                          ? 'bg-yellow-500 shadow-sm shadow-yellow-500/50'
                          : 'bg-red-500 shadow-sm shadow-red-500/50'
                      }`} />
                      <span className="text-sm text-white">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {service.latency && (
                        <span className="text-xs text-gray-600">{service.latency}ms</span>
                      )}
                      <Badge
                        variant={
                          service.status === 'online' ? 'success' :
                          service.status === 'degraded' ? 'warning' : 'error'
                        }
                        size="sm"
                      >
                        {service.status === 'online' ? 'Attivo' : service.status === 'degraded' ? 'Degradato' : 'Offline'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Progetti Recenti</CardTitle>
              <p className="text-sm text-gray-500">Gli ultimi progetti creati sulla piattaforma</p>
            </div>
            <Badge variant="info" size="sm">
              {projects?.length ?? 0} totale
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Video className="mb-4 h-12 w-12 text-gray-600" />
              <p className="text-base font-medium text-gray-400">Nessun progetto ancora</p>
              <p className="mt-1 text-sm text-gray-600 text-center max-w-sm">
                Inizia creando il tuo primo progetto nella sezione Video Studio
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 5).map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-600/20 border border-brand-500/10">
                      <Video className="h-5 w-5 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{project.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(project.createdAt)}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      project.status === 'completed' ? 'success' :
                      project.status === 'processing' ? 'warning' :
                      project.status === 'failed' ? 'error' : 'info'
                    }
                    size="sm"
                  >
                    {project.status === 'completed' ? 'Completato' :
                     project.status === 'processing' ? 'In elaborazione' :
                     project.status === 'failed' ? 'Fallito' : 'Bozza'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
