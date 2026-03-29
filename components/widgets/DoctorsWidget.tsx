'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useState } from 'react'

interface Doctor {
  name: string
  type: 'vseobecny' | 'zubar' | 'veterinar'
  city: string
  address: string
  phone: string
  acceptsNew: boolean
  waitDays: number
  openHours: string
  note?: string
}

interface DoctorData {
  doctors: Doctor[]
  stats: Record<string, { total: number; acceptsNew: number }>
  timestamp: number
}

const TYPE_INFO: Record<string, { label: string; emoji: string; color: string }> = {
  vseobecny: { label: 'Všeobecný lekár', emoji: '🩺', color: 'text-blue-300' },
  zubar: { label: 'Zubár', emoji: '🦷', color: 'text-cyan-300' },
  veterinar: { label: 'Veterinár', emoji: '🐾', color: 'text-green-300' },
}

export default function DoctorsWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<DoctorData>('/api/doctors', 60 * 60 * 1000)
  const [tab, setTab] = useState<'vseobecny' | 'zubar' | 'veterinar'>('vseobecny')

  const list = (data?.doctors ?? []).filter(d => d.type === tab)

  return (
    <WidgetCard accent="cyan" title={lang === 'sk' ? 'Lekári a veterinári' : 'Doctors & Vets'} icon="🏥" onRefresh={refetch}
      headerRight={
        <div className="flex gap-1">
          {(['vseobecny', 'zubar', 'veterinar'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold transition-colors ${tab === t ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}>
              {TYPE_INFO[t].emoji}
            </button>
          ))}
        </div>
      }>
      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && data && (
        <div className="space-y-1">
          <div className="text-[9px] text-slate-500 px-2 mb-2">
            {TYPE_INFO[tab].label}: <strong className={TYPE_INFO[tab].color}>{data.stats[tab].acceptsNew}/{data.stats[tab].total}</strong> prijíma nových
          </div>
          {list.map((d, i) => (
            <div key={i} className={`px-2 py-2 rounded-lg transition-colors ${d.acceptsNew ? 'hover:bg-white/[0.03]' : 'opacity-60'}`}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-200 flex-1">{d.name}</span>
                {d.acceptsNew ? (
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold">Prijíma</span>
                ) : (
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-300 font-bold">Plný</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-500">
                <span>📍 {d.city}, {d.address}</span>
                <span>· ⏱️ {d.waitDays}d</span>
                <span>· 🕐 {d.openHours}</span>
              </div>
              {d.note && <span className="text-[8px] text-emerald-400 mt-0.5 block">{d.note}</span>}
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
