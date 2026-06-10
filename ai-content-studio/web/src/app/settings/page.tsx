'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Save, Eye, EyeOff, Key, Palette, Globe, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { useStore } from '@/store'
import { motion } from 'framer-motion'

const tabs = [
  { id: 'preferenze', label: 'Preferenze', icon: Palette },
  { id: 'api', label: 'API', icon: Key },
  { id: 'notifiche', label: 'Notifiche', icon: Bell },
]

const API_CONFIG_KEY = 'ai-content-studio-api-config'

interface ApiConfig {
  url: string
  key: string
}

function getStoredConfig(): ApiConfig {
  if (typeof window === 'undefined') return { url: '', key: '' }
  try {
    const stored = localStorage.getItem(API_CONFIG_KEY)
    return stored ? JSON.parse(stored) : { url: '', key: '' }
  } catch {
    return { url: '', key: '' }
  }
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useStore()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('preferenze')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiUrl, setApiUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [language, setLanguage] = useState('it')

  useEffect(() => {
    const config = getStoredConfig()
    setApiUrl(config.url || process.env.NEXT_PUBLIC_API_URL || '')
    setApiKey(config.key || process.env.NEXT_PUBLIC_AUTH_TOKEN || '')
  }, [])

  const handleSaveApi = () => {
    const config: ApiConfig = { url: apiUrl, key: apiKey }
    localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-config-changed', { detail: config }))
    }
    toast({
      type: 'success',
      title: 'Configurazione API salvata',
      message: 'Le modifiche sono state applicate. Ricarica la pagina per usarle.',
    })
    setTimeout(() => window.location.reload(), 1500)
  }

  const handleSavePreferences = () => {
    toast({
      type: 'success',
      title: 'Preferenze salvate',
      message: 'Le modifiche sono state applicate con successo.',
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">Impostazioni</h1>
        <p className="mt-1 text-sm text-gray-500">Configura l&apos;applicazione secondo le tue preferenze</p>
      </motion.div>

      <div className="flex gap-1 rounded-xl bg-white/[0.03] border border-white/[0.06] p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'preferenze' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-brand-400" />
                  <CardTitle>Aspetto</CardTitle>
                </div>
                <CardDescription>Personalizza l&apos;interfaccia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20">
                        <Moon className="h-5 w-5 text-indigo-400" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20">
                        <Sun className="h-5 w-5 text-amber-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">Tema</p>
                      <p className="text-xs text-gray-500">
                        {theme === 'dark' ? 'Modalit&agrave; scura' : 'Modalit&agrave; chiara'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    Cambia
                  </Button>
                </div>
                <Select
                  label="Lingua"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  options={[
                    { value: 'it', label: 'Italiano' },
                    { value: 'en', label: 'English' },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-brand-400" />
                  <CardTitle>Regione</CardTitle>
                </div>
                <CardDescription>Impostazioni regionali</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Fuso Orario"
                  value="Europe/Rome"
                  options={[
                    { value: 'Europe/Rome', label: 'Europe/Rome (UTC+1)' },
                    { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
                    { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
                    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
                  ]}
                />
                <Select
                  label="Formato Data"
                  value="it"
                  options={[
                    { value: 'it', label: 'DD/MM/YYYY' },
                    { value: 'en', label: 'MM/DD/YYYY' },
                    { value: 'iso', label: 'YYYY-MM-DD' },
                  ]}
                />
                <Button onClick={handleSavePreferences}>
                  <Save className="h-4 w-4" />
                  Salva Preferenze
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'api' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-brand-400" />
                <CardTitle>Configurazione API</CardTitle>
              </div>
              <CardDescription>Connessione al backend Video Studio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 max-w-xl">
              <Input
                label="API URL"
                placeholder="https://sistema-video-ai.vercel.app"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                helperText="URL di base del backend API. Salva e ricarica la pagina per applicare."
              />
              <div className="relative">
                <Input
                  label="Auth Token"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="Inserisci il token di autenticazione..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  helperText="Token opzionale per richieste autenticate"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-white transition-colors"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-3">
                <p className="text-xs text-blue-400">
                  <strong>Nota:</strong> Le modifiche vengono salvate nel browser e applicate al ricaricamento della pagina. 
                  I dati non vengono inviati a server esterni.
                </p>
              </div>
              <Button onClick={handleSaveApi} className="w-full sm:w-auto">
                <Save className="h-4 w-4" />
                Salva e Ricarica
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notifiche' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-brand-400" />
                <CardTitle>Notifiche</CardTitle>
              </div>
              <CardDescription>Gestisci le tue preferenze di notifica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              {[
                { label: 'Completamento video', desc: 'Ricevi una notifica quando un video viene completato' },
                { label: 'Errori di generazione', desc: 'Ricevi una notifica quando una generazione fallisce' },
                { label: 'Servizi offline', desc: 'Ricevi una notifica quando un servizio AI va offline' },
                { label: 'Aggiornamenti sistema', desc: 'Ricevi notifiche sugli aggiornamenti della piattaforma' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.06] p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" defaultChecked />
                    <div className="h-6 w-11 rounded-full bg-white/[0.08] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white" />
                  </label>
                </div>
              ))}
              <Button onClick={handleSavePreferences}>
                <Save className="h-4 w-4" />
                Salva Preferenze
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
