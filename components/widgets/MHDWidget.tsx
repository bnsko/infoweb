'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Departure {
  line: string; type: 'bus' | 'tram' | 'trolley' | 'train'
  direction: string; departure: string; delay: number
}

interface MHDData {
  cityName: string
  stops: { id: string; name: string }[]
  selectedStop?: { id: string; name: string }
  departures: Departure[]
}

const TYPE_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  tram: { bg: 'bg-red-500/15', text: 'text-red-400', icon: '🚋' },
  trolley: { bg: 'bg-blue-500/15', text: 'text-blue-400', icon: '🚎' },
  bus: { bg: 'bg-green-500/15', text: 'text-green-400', icon: '🚌' },
  train: { bg: 'bg-purple-500/15', text: 'text-purple-400', icon: '🚆' },
}

const CITIES = [
  { key: 'bratislava', label: 'Bratislava', flag: '🏙️' },
  { key: 'kosice', label: 'Košice', flag: '🏰' },
  { key: 'zilina', label: 'Žilina', flag: '🏔️' },
  { key: 'presov', label: 'Prešov', flag: '🏛️' },
  { key: 'bystrica', label: 'B. Bystrica', flag: '⛰️' },
]

export default function MHDWidget() {
  const { lang } = useLang()
  const [city, setCity] = useState('bratislava')
  const [stopId, setStopId] = useState('')

  const apiUrl = `/api/mhd?city=${city}${stopId ? `&stop=${stopId}` : ''}`
  const { data, loading, refetch } = useWidget<MHDData>(apiUrl, 60 * 1000)

  return (
    <WidgetCard accent="cyan" title={lang === 'sk' ? 'MHD · Odchody' : 'Public Transport'} icon="🚋" onRefresh={refetch}>
      {/* City selector */}
      <div className="flex flex-wrap gap-1 mb-2">
        {CITIES.map(c => (
          <button key={c.key} onClick={() => { setCity(c.key); setStopId('') }}
            className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition-all ${
              city === c.key ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/5'
            }`}>
            {c.flag} {c.label}
          </button>
        ))}
      </div>

      {/* Stop selector */}
      {data?.stops && data.stops.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {data.stops.map(s => (
            <button key={s.id} onClick={() => setStopId(s.id)}
              className={`text-[9px] font-semibold px-2 py-1 rounded-md transition-all ${
                (stopId === s.id || (!stopId && data.selectedStop?.id === s.id))
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/5'
              }`}>
              📍 {s.name}
            </button>
          ))}
        </div>
      )}

      {loading && <SkeletonRows rows={6} />}

      {!loading && data && data.departures.length > 0 && (
        <div className="space-y-0.5 max-h-[340px] overflow-y-auto scrollbar-hide">
          {data.departures.map((dep, i) => {
            const tc = TYPE_COLORS[dep.type] ?? TYPE_COLORS.bus
            return (
              <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-all">
                {/* Line badge */}
                <div className={`w-10 h-7 rounded-lg ${tc.bg} flex items-center justify-center shrink-0`}>
                  <span className={`text-[11px] font-bold font-mono ${tc.text}`}>{dep.line}</span>
                </div>
                {/* Direction */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px]">{tc.icon}</span>
                    <span className="text-[11px] text-slate-200 truncate font-medium">{dep.direction}</span>
                  </div>
                </div>
                {/* Time + delay */}
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-white font-bold font-mono">{dep.departure}</span>
                  {dep.delay > 0 && (
                    <span className="text-[9px] text-red-400 ml-1">+{dep.delay}′</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && data && data.departures.length === 0 && (
        <p className="text-[11px] text-slate-500 text-center py-6">
          {lang === 'sk' ? 'Žiadne odchody' : 'No departures'}
        </p>
      )}

      <p className="text-[10px] text-slate-600 mt-2">{lang === 'sk' ? 'Obnova 1 min · simulované dáta' : 'Refresh 1 min · simulated data'}</p>
    </WidgetCard>
  )
}
