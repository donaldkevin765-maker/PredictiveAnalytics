'use client'

import { TrendingUp } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { name: 'Lun', video: 4, audio: 3, script: 7 },
  { name: 'Mar', video: 7, audio: 5, script: 9 },
  { name: 'Mer', video: 5, audio: 8, script: 6 },
  { name: 'Gio', video: 9, audio: 6, script: 8 },
  { name: 'Ven', video: 11, audio: 9, script: 12 },
  { name: 'Sab', video: 6, audio: 4, script: 5 },
  { name: 'Dom', video: 3, audio: 2, script: 4 },
]

export default function AreaChartCard() {
  return (
    <div className="glass-card p-6 lg:col-span-4">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Attività Settimanale</h3>
          <p className="text-sm text-gray-500">Generazioni degli ultimi 7 giorni</p>
        </div>
        <TrendingUp className="h-5 w-5 text-brand-400" />
      </div>
      <div className="h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="video" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="audio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="script" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(18,18,24,0.95)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            />
            <Area type="monotone" dataKey="video" stroke="#6366f1" strokeWidth={2} fill="url(#video)" />
            <Area type="monotone" dataKey="audio" stroke="#a855f7" strokeWidth={2} fill="url(#audio)" />
            <Area type="monotone" dataKey="script" stroke="#06b6d4" strokeWidth={2} fill="url(#script)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
