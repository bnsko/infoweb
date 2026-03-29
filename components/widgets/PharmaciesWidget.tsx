'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useState } from 'react'

interface Pharmacy {
  name: string
  city: string
  address: string
  phone: string
  isNight: boolean
  isEmergency: boolean
  openUntil: string
}

interface PharmacyData {
  pharmacies: Record<string, Pharmacy[]>
  timestamp: number
}

export default function PharmaciesWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<PharmacyData>('/api/pharmacies', 10 * 60 * 1000)
  const cities = data ? Object.keys(data.pharmacies) : []
  const [city, setCity] = useState('Bratislava')

  const list = data?.pharmacies[city] ?? []

  return (
    <WidgetCard accent="green" title={lang === 'sk' ? 'Lekárne a pohotovosti' : 'Pharmacies'} icon="💊" onRefresh={refetch}
      headerRight={
        <select value={city} onChange={e => setCity(e.target.value)}
          className="text-[9px] bg-white/5 border border-white/10 rounded px-1 py-0.5 text-slate-300 outline-none">
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      }>
      {loading && <SkeletonRows rows={3} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && list.length > 0 && (
        <div className="space-y-1">
          {list.map((p, i) => (
            <div key={i} className={`px-2 py-2 rounded-lg transition-colors ${p.isNight ? 'bg-emerald-500/[0.07] border border-emerald-500/15' : 'hover:bg-white/[0.03]'}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{p.isEmergency ? '🏥' : p.isNight ? '🌙' : '💊'}</span>
                <span className="text-[10px] font-semibold text-slate-200 flex-1 truncate">{p.name}</span>
                {p.isNight && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">24h</span>}
                {p.isEmergency && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold">Pohotovosť</span>}
              </div>
              <div className="flex items-center gap-2 mt-0.5 pl-6">
                <span className="text-[9px] text-slate-500">{p.address}</span>
                <span className="text-[9px] text-slate-600">·</span>
                <span className="text-[9px] text-slate-500">do {p.openUntil}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
