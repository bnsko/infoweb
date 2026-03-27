'use client'

import { useWidget } from '@/hooks/useWidget'
import type { ISSData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'

function formatCoord(val: number, posLabel: string, negLabel: string) {
  return `${Math.abs(val).toFixed(2)}° ${val >= 0 ? posLabel : negLabel}`
}

export default function ISSWidget() {
  const { data, loading, error } = useWidget<ISSData>('/api/iss', 30 * 1000)

  if (loading) return (
    <WidgetCard accent="purple" title="ISS – Medzinárodná vesmírna stanica" icon="🛸">
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-4 rounded" />)}
      </div>
    </WidgetCard>
  )
  if (error || !data) return (
    <WidgetCard accent="purple" title="ISS – Medzinárodná vesmírna stanica" icon="🛸">
      <WidgetError />
    </WidgetCard>
  )

  const lat = Number(data.latitude)
  const lon = Number(data.longitude)
  // Rough check if ISS is "near" Slovakia (Europe area)
  const nearEurope = lat > 30 && lat < 75 && lon > -20 && lon < 50

  return (
    <WidgetCard accent="purple" title="ISS – Poloha" icon="🛸" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />
      <div className="relative">
        {/* ISS emoji spinning */}
        <div className="flex items-center justify-center mb-3">
          <span className="text-4xl animate-spin-slow select-none">🛰️</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <StatBox label="Zemepisná šírka" value={formatCoord(lat, 'S', 'J')} />
          <StatBox label="Zem. dĺžka" value={formatCoord(lon, 'V', 'Z')} />
          <StatBox label="Nadmorská výška" value={`${Math.round(data.altitude)} km`} />
          <StatBox label="Rýchlosť" value={`${Math.round(data.velocity / 3.6)} m/s`} />
        </div>

        {nearEurope && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 text-xs text-purple-300 text-center">
            🇪🇺 ISS je teraz nad Európou!
          </div>
        )}
        <p className="text-[10px] text-slate-600 mt-2 text-center">wheretheiss.at · aktualizácia 30s</p>
      </div>
    </WidgetCard>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/3 rounded-lg p-2 text-center">
      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-xs font-mono font-bold text-purple-200 mt-0.5">{value}</div>
    </div>
  )
}
