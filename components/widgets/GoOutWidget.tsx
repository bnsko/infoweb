'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface GoOutEvent {
  id: number; name: string; category: string; venue: string; city: string
  date: string; time: string; price: string; soldOut: boolean; image: string | null
}
interface GoOutData { events: GoOutEvent[]; timestamp: number }

const CITY_LABELS: Record<string, string> = { BA: 'Bratislava', KE: 'Košice', BB: 'B. Bystrica', ZA: 'Žilina' }
const CAT_ICONS: Record<string, string> = { Koncert: '🎵', Divadlo: '🎭', Festival: '🎉', Výstava: '🖼️', Film: '🎬', 'Stand-up': '😂', Workshop: '🔧', Prednáška: '🎓' }

export default function GoOutWidget() {
  const { data, loading, refetch } = useWidget<GoOutData>('/api/goout', 60 * 60 * 1000)
  const [filterCity, setFilterCity] = useState<string | null>(null)

  const events = data?.events ?? []
  const filtered = filterCity ? events.filter(e => e.city === filterCity) : events

  return (
    <WidgetCard accent="purple" title="GoOut – Eventy" icon="🎪" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} />}
      {!loading && data && (
        <div className="space-y-2">
          {/* City filter */}
          <div className="flex items-center gap-1">
            <button onClick={() => setFilterCity(null)} className={`text-[8px] px-2 py-0.5 rounded-full transition-all ${!filterCity ? 'bg-purple-500/20 text-purple-300 font-bold' : 'bg-white/[0.03] text-slate-500 hover:text-slate-300'}`}>Všetky</button>
            {Object.entries(CITY_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => setFilterCity(key)} className={`text-[8px] px-2 py-0.5 rounded-full transition-all ${filterCity === key ? 'bg-purple-500/20 text-purple-300 font-bold' : 'bg-white/[0.03] text-slate-500 hover:text-slate-300'}`}>{label}</button>
            ))}
          </div>

          {/* Events list */}
          <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-hide">
            {filtered.slice(0, 10).map((e) => (
              <div key={e.id} className={`flex items-start gap-2 px-2 py-2 rounded-xl border transition-colors ${e.soldOut ? 'bg-red-500/5 border-red-500/10 opacity-60' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}>
                <div className="text-center shrink-0 w-10">
                  <div className="text-[8px] text-slate-500">{new Date(e.date).toLocaleDateString('sk-SK', { weekday: 'short' })}</div>
                  <div className="text-[14px] font-bold text-white">{new Date(e.date).getDate()}</div>
                  <div className="text-[7px] text-slate-600">{e.time}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-slate-200 line-clamp-1">{e.name}</div>
                  <div className="text-[8px] text-slate-500 mt-0.5">📍 {e.venue} · {CITY_LABELS[e.city] ?? e.city}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[7px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded-full">{CAT_ICONS[e.category] ?? '📌'} {e.category}</span>
                    <span className={`text-[8px] font-bold ${e.price === 'Zadarmo' ? 'text-green-400' : 'text-amber-400'}`}>{e.price}</span>
                  </div>
                </div>
                {e.soldOut && <span className="text-[7px] bg-red-500/15 text-red-300 px-1.5 py-0.5 rounded-full font-bold shrink-0">Vypredané</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">GoOut.net · Simulácia</p>
    </WidgetCard>
  )
}
