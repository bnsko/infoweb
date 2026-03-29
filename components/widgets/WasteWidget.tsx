'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useState } from 'react'

interface WasteSchedule {
  city: string
  mixed: string[]
  plastic: string[]
  paper: string[]
  glass: string[]
  bio: string[]
  nextPickup: { type: string; date: string; daysUntil: number }
}

interface WasteData {
  schedules: WasteSchedule[]
  timestamp: number
}

const WASTE_TYPES = [
  { key: 'mixed', label: 'Zmesový', emoji: '🗑️', color: 'bg-slate-500/15 text-slate-300' },
  { key: 'plastic', label: 'Plasty', emoji: '♻️', color: 'bg-yellow-500/15 text-yellow-300' },
  { key: 'paper', label: 'Papier', emoji: '📰', color: 'bg-blue-500/15 text-blue-300' },
  { key: 'glass', label: 'Sklo', emoji: '🫙', color: 'bg-green-500/15 text-green-300' },
  { key: 'bio', label: 'Bio', emoji: '🌿', color: 'bg-emerald-500/15 text-emerald-300' },
]

export default function WasteWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<WasteData>('/api/waste', 60 * 60 * 1000)
  const cities = (data?.schedules ?? []).map(s => s.city)
  const [city, setCity] = useState('Bratislava')

  const schedule = data?.schedules.find(s => s.city === city)

  return (
    <WidgetCard accent="green" title={lang === 'sk' ? 'Odvoz odpadu' : 'Waste Collection'} icon="🗑️" onRefresh={refetch}
      headerRight={
        <select value={city} onChange={e => setCity(e.target.value)}
          className="text-[9px] bg-white/5 border border-white/10 rounded px-1 py-0.5 text-slate-300 outline-none">
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      }>
      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && schedule && (
        <div className="space-y-2">
          {schedule.nextPickup.daysUntil <= 1 && (
            <div className="px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-[9px]">
              ⏰ Najbližší odvoz: <strong className="text-emerald-300">{schedule.nextPickup.type}</strong> — {schedule.nextPickup.daysUntil === 0 ? 'Dnes!' : 'Zajtra'}
            </div>
          )}
          {WASTE_TYPES.map(wt => {
            const dates = schedule[wt.key as keyof typeof schedule] as string[]
            return (
              <div key={wt.key} className="flex items-center gap-2 px-2 py-1">
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${wt.color}`}>{wt.emoji} {wt.label}</span>
                <div className="flex flex-wrap gap-1 flex-1">
                  {dates.map((d, i) => (
                    <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded ${i === 0 ? 'bg-white/10 text-white font-bold' : 'text-slate-500'}`}>{d}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </WidgetCard>
  )
}
