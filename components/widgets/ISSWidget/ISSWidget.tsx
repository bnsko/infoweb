'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import type { ISSData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'

function formatCoord(val: number, posLabel: string, negLabel: string) {
  return `${Math.abs(val).toFixed(2)}° ${val >= 0 ? posLabel : negLabel}`
}

// ISS orbit period = ~92.68 min, incl = 51.6°
// Compute next approximate passes over Slovakia (lat ~48.7, lon ~19.5)
function computeNextPasses(currentLat: number, currentLon: number): { time: string; type: string; direction: string; duration: string }[] {
  const now = Date.now()
  const orbitPeriodMs = 92.68 * 60 * 1000
  const SK_LAT = 48.7
  const SK_LON = 19.5
  const passes: { time: string; type: string; direction: string; duration: string }[] = []

  // Simple heuristic: ISS passes over a given latitude when it's at the right
  // phase of its orbit. We simulate approximate passes in the next 48h.
  for (let i = 1; i <= 20 && passes.length < 5; i++) {
    const futureMs = now + i * orbitPeriodMs
    // Earth rotates ~22.9° per orbit period. Each orbit the ground track shifts west.
    const lonShift = (i * 22.9) % 360
    const approxLon = ((currentLon - lonShift + 540) % 360) - 180
    // ISS latitude oscillates ±51.6°. Approximate: lat = 51.6 * sin(phase)
    const phase = (i * 2 * Math.PI) / (360 / 22.9) // rough
    const approxLat = 51.6 * Math.sin(phase + Math.asin(currentLat / 51.6))

    const dLat = Math.abs(approxLat - SK_LAT)
    const dLon = Math.abs(approxLon - SK_LON)
    const dist = Math.sqrt(dLat * dLat + dLon * dLon * Math.cos(SK_LAT * Math.PI / 180) ** 2)

    if (dist < 18) {
      const d = new Date(futureMs)
      const h = d.getHours()
      const isVisible = (h >= 19 || h <= 5) // only visible at dusk/dawn/night
      passes.push({
        time: d.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }) + ' ' +
              d.toLocaleDateString('sk-SK', { weekday: 'short', day: 'numeric', month: 'short' }),
        type: isVisible ? '👁️ Viditeľný' : '🔭 Nad horizontom',
        direction: approxLon < SK_LON ? 'Z → V' : 'V → Z',
        duration: `~${Math.max(2, Math.round(6 - dist / 4))} min`,
      })
    }
  }
  return passes
}

export default function ISSWidget() {
  const { data, loading, error, refetch } = useWidget<ISSData>('/api/iss', 10 * 1000)
  const [passes, setPasses] = useState<{ time: string; type: string; direction: string; duration: string }[]>([])

  useEffect(() => {
    if (data?.latitude != null && data?.longitude != null) {
      setPasses(computeNextPasses(Number(data.latitude), Number(data.longitude)))
    }
  }, [data?.latitude, data?.longitude])

  if (loading && !data) return (
    <WidgetCard accent="purple" title="🛸 ISS – Medzinárodná vesmírna stanica" icon="">
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-4 rounded" />)}
      </div>
    </WidgetCard>
  )
  if (error || !data) return (
    <WidgetCard accent="purple" title="🛸 ISS – Medzinárodná vesmírna stanica" icon="">
      <WidgetError />
    </WidgetCard>
  )

  const lat = Number(data.latitude)
  const lon = Number(data.longitude)

  // Distance from Slovakia (Bratislava: 48.15°N, 17.11°E)
  const dLat = Math.abs(lat - 48.15)
  const dLon = Math.abs(lon - 17.11)
  const distFromSK = Math.sqrt(dLat * dLat + dLon * dLon)
  const nearSlovakia = distFromSK < 15
  const apprNearSlovakia = distFromSK < 25

  return (
    <WidgetCard accent="purple" title="🛸 ISS – Poloha" icon="" className="relative overflow-hidden" onRefresh={refetch}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />
      <div className="relative space-y-3">
        {/* Current position stats */}
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="Zemepisná šírka" value={formatCoord(lat, 'S', 'J')} />
          <StatBox label="Zem. dĺžka" value={formatCoord(lon, 'V', 'Z')} />
          <StatBox label="Nadmorská výška" value={`${Math.round(data.altitude)} km`} />
          <StatBox label="Rýchlosť" value={`${Math.round(data.velocity).toLocaleString()} km/h`} />
        </div>

        {/* Position indicator */}
        <div className="bg-white/[0.02] rounded-xl border border-white/5 p-3">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
            <span>🌍 Poloha nad Zemou</span>
            <span className="font-mono">{lat.toFixed(2)}°, {lon.toFixed(2)}°</span>
          </div>
          {/* Simple position bar */}
          <div className="relative h-6 rounded-full bg-slate-800/50 overflow-hidden">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-white/5" />
            </div>
            {/* ISS dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-500 shadow-lg shadow-purple-500/30 flex items-center justify-center text-[8px]"
              style={{ left: `${((lon + 180) / 360) * 100}%` }}
            >
              🛸
            </div>
            {/* Slovakia marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400"
              style={{ left: `${((17.11 + 180) / 360) * 100}%` }}
              title="Slovensko"
            />
          </div>
          <div className="flex justify-between text-[8px] text-slate-600 mt-1">
            <span>-180°</span>
            <span>🇸🇰</span>
            <span>+180°</span>
          </div>
        </div>

        {/* Slovakia visibility */}
        {nearSlovakia ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5 text-center">
            <div className="text-base mb-0.5">🇸🇰 🛸</div>
            <div className="text-[12px] font-bold text-green-400">ISS je viditeľná zo Slovenska!</div>
            <div className="text-[10px] text-green-500/70 mt-0.5">Hľadaj rýchly pohybujúci sa bod na oblohe</div>
          </div>
        ) : apprNearSlovakia ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2.5 text-center">
            <div className="text-base mb-0.5">🌍</div>
            <div className="text-[12px] font-bold text-yellow-400">ISS blízko Európy</div>
            <div className="text-[10px] text-yellow-500/70 mt-0.5">Vzdialenosť: ~{Math.round(distFromSK * 111)} km od SK</div>
          </div>
        ) : (
          <div className="bg-purple-500/8 border border-purple-500/15 rounded-xl px-3 py-2 text-center">
            <div className="text-[11px] text-purple-400">Vzdialenosť od SK: <span className="font-bold">~{Math.round(distFromSK * 111)} km</span></div>
          </div>
        )}

        {/* Upcoming SK passes */}
        {passes.length > 0 && (
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mb-2">
              🇸🇰 Najbližšie prielety nad Slovenskom
            </div>
            <div className="space-y-1.5">
              {passes.map((p, i) => (
                <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                  i === 0 ? 'bg-purple-500/10 border-purple-500/20' : 'bg-white/[0.02] border-white/5'
                }`}>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-200">{p.time}</div>
                    <div className="text-[9px] text-slate-500">{p.direction} · {p.duration}</div>
                  </div>
                  <span className={`text-[10px] font-semibold ${
                    p.type.includes('Viditeľný') ? 'text-green-400' : 'text-slate-400'
                  }`}>
                    {p.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-[10px] text-slate-600 text-center">
          <a href="https://wheretheiss.at" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">
            wheretheiss.at ↗
          </a>
          {' · '}aktualizácia 10s
        </p>
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
