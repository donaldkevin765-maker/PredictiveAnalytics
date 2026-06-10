'use client'

import { Cpu, Activity, Wifi, WifiOff, Zap, Server, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { useServices, useHealth } from '@/hooks/useApi'

import { motion } from 'framer-motion'

const serviceTypeLabels: Record<string, string> = {
  llm: 'LLM',
  tts: 'Text-to-Speech',
  image: 'Generazione Immagini',
  video: 'Generazione Video',
  audio: 'Elaborazione Audio',
  storage: 'Storage',
}

const serviceTypeIcons: Record<string, typeof Cpu> = {
  llm: Zap,
  tts: Activity,
  image: Cpu,
  video: Server,
  audio: Activity,
  storage: Shield,
}

export default function AIServicesPage() {
  const { data: services, isLoading } = useServices()
  const { data: health } = useHealth()

  const total = services?.length ?? 0
  const online = services?.filter((s) => s.status === 'online').length ?? 0
  const degraded = services?.filter((s) => s.status === 'degraded').length ?? 0
  const offline = services?.filter((s) => s.status === 'offline').length ?? 0

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">AI Services</h1>
        <p className="mt-1 text-sm text-gray-500">Stato e configurazione dei servizi di intelligenza artificiale</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Server className="h-5 w-5" />}
          label="Stato Generale"
          value={health?.status === 'healthy' ? 'Salute' : health?.status === 'degraded' ? 'Degradato' : 'Sconosciuto'}
          sublabel={`v${health?.version ?? '--'}`}
          variant={health?.status === 'healthy' ? 'success' : health?.status === 'degraded' ? 'warning' : 'error'}
        />
        <StatCard
          icon={<Wifi className="h-5 w-5" />}
          label="Servizi Attivi"
          value={`${online}/${total}`}
          sublabel={total > 0 ? `${Math.round((online / total) * 100)}% operativi` : 'Nessun dato'}
          variant={online === total ? 'success' : 'warning'}
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Uptime"
          value={health?.uptime ? `${Math.floor(health.uptime / 3600)}h` : '--'}
          sublabel={health?.uptime ? `${Math.floor((health.uptime % 3600) / 60)}m` : 'Sconosciuto'}
          variant="default"
        />
        <StatCard
          icon={<Cpu className="h-5 w-5" />}
          label="Degradati / Offline"
          value={`${degraded}/${offline}`}
          sublabel={total === 0 ? 'Nessun servizio configurato' : degraded + offline > 0 ? 'Richiede attenzione' : 'Nessun problema'}
          variant={total === 0 ? 'default' : degraded + offline > 0 ? 'warning' : 'success'}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tutti i Servizi</CardTitle>
              <CardDescription>
                {total} servizi configurati &middot; {online} online &middot; {degraded} degradati &middot; {offline} offline
              </CardDescription>
            </div>
            <div className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium ${
              total === 0
                ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                : offline > 0
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : degraded > 0
                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                : 'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                total === 0 ? 'bg-gray-500' : offline > 0 ? 'bg-red-500' : degraded > 0 ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              {total === 0 ? 'Nessun dato' : offline > 0 ? 'Problemi rilevati' : degraded > 0 ? 'Attenzione' : 'Tutto OK'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : !services || services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-600/10 border border-red-500/10">
                <WifiOff className="h-10 w-10 text-red-400" />
              </div>
              <p className="text-xl font-semibold text-white">Nessun servizio disponibile</p>
              <p className="mt-2 text-sm text-gray-500 text-center max-w-sm">
                Il backend non è raggiungibile. Verifica che sistema-video-ai.vercel.app sia online.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {services.map((service, i) => {
                const IconComponent = serviceTypeIcons[service.type] || Cpu
                return (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3.5 hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.06]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        service.status === 'online'
                          ? 'bg-green-500/10 text-green-400'
                          : service.status === 'degraded'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{service.name}</p>
                          <span className="text-[10px] uppercase tracking-wider text-gray-600">
                            {serviceTypeLabels[service.type] || service.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className={`flex items-center gap-1.5 text-xs ${
                            service.status === 'online' ? 'text-green-500' :
                            service.status === 'degraded' ? 'text-yellow-500' :
                            'text-red-500'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              service.status === 'online' ? 'bg-green-500' :
                              service.status === 'degraded' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} />
                            {service.status === 'online' ? 'Online' : service.status === 'degraded' ? 'Degradato' : 'Offline'}
                          </span>
                          {service.latency && (
                            <span className="text-xs text-gray-600">{service.latency}ms</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {service.fallbackAvailable && (
                        <Badge variant="info" size="sm" className="hidden sm:inline-flex">
                          <Zap className="mr-1 h-3 w-3" />
                          Fallback
                        </Badge>
                      )}
                      <Badge
                        variant={
                          service.status === 'online'
                            ? 'success'
                            : service.status === 'degraded'
                            ? 'warning'
                            : 'error'
                        }
                        size="sm"
                      >
                        {service.status === 'online' ? 'Attivo' : service.status === 'degraded' ? 'Degradato' : 'Offline'}
                      </Badge>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
