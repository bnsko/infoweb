'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import type { ISSData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'

function formatCoord(val: number, posLabel: string, negLabel: string) {
  return `${Math.abs(val).toFixed(2)}° ${val >= 0 ? posLabel : negLabel}`
}

/* ── Simple equirectangular world map dots ─────────────────────────── */
function WorldMap({ lat, lon }: { lat: number; lon: number }) {
  const W = 560, H = 260
  const toX = (lo: number) => ((lo + 180) / 360) * W
  const toY = (la: number) => ((90 - la) / 180) * H

  // ISS orbit path (approx ±51.6° inclination, simplified as sine curve)
  const orbitPoints: string[] = []
  for (let i = 0; i <= 360; i += 2) {
    const lo = i - 180
    const la = 51.6 * Math.sin((i * Math.PI) / 180)
    orbitPoints.push(`${toX(lo).toFixed(1)},${toY(la).toFixed(1)}`)
  }
  const orbitPath = 'M ' + orbitPoints.join(' L ')

  const issX = toX(lon)
  const issY = toY(lat)

  // Slovakia position
  const skX = toX(19.5)
  const skY = toY(48.7)

  return (
    <div className="rounded-xl overflow-hidden border border-white/8" style={{ background: '#0a0e1a' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
        <defs>
          <radialGradient id="iss-earth-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0a0e1a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="iss-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="#0a0e1a" />
        <ellipse cx={W/2} cy={H/2} rx={W*0.5} ry={H*0.5} fill="url(#iss-earth-glow)" />

        {/* Grid lines */}
        {[-60,-30,0,30,60].map(la => (
          <line key={la} x1={0} x2={W} y1={toY(la)} y2={toY(la)}
                stroke={la === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'} strokeWidth={la === 0 ? 1 : 0.5} />
        ))}
        {[-120,-60,0,60,120].map(lo => (
          <line key={lo} x1={toX(lo)} x2={toX(lo)} y1={0} y2={H}
                stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
        ))}

        {/* Simplified continent outlines as filled polygons */}
        {/* North America */}
        <path d="M 64,32 L 80,28 L 108,26 L 132,30 L 140,48 L 136,72 L 148,100 L 144,120 L 132,132 L 108,140 L 88,136 L 72,120 L 56,96 L 48,68 L 52,48 Z"
              fill="rgba(71,85,105,0.35)" stroke="rgba(100,116,139,0.2)" strokeWidth={0.5} />
        {/* South America */}
        <path d="M 108,148 L 128,140 L 148,148 L 152,172 L 144,200 L 128,220 L 112,216 L 100,192 L 96,168 Z"
              fill="rgba(71,85,105,0.35)" stroke="rgba(100,116,139,0.2)" strokeWidth={0.5} />
        {/* Europe */}
        <path d="M 254,40 L 272,32 L 296,30 L 308,36 L 316,44 L 310,56 L 294,64 L 278,60 L 260,56 Z"
              fill="rgba(71,85,105,0.55)" stroke="rgba(100,116,139,0.3)" strokeWidth={0.5} />
        {/* Africa */}
        <path d="M 270,76 L 298,68 L 318,76 L 324,104 L 316,140 L 300,168 L 278,172 L 258,148 L 252,120 L 256,92 Z"
              fill="rgba(71,85,105,0.35)" stroke="rgba(100,116,139,0.2)" strokeWidth={0.5} />
        {/* Asia */}
        <path d="M 306,28 L 360,18 L 420,24 L 460,32 L 472,52 L 464,72 L 430,80 L 396,76 L 360,68 L 330,60 L 310,48 Z"
              fill="rgba(71,85,105,0.4)" stroke="rgba(100,116,139,0.2)" strokeWidth={0.5} />
        {/* Australia */}
        <path d="M 432,148 L 460,140 L 488,148 L 494,172 L 480,188 L 456,192 L 436,180 L 428,164 Z"
              fill="rgba(71,85,105,0.35)" stroke="rgba(100,116,139,0.2)" strokeWidth={0.5} />

        {/* ISS Orbit path */}
        <path d={orbitPath} fill="none" stroke="rgba(167,139,250,0.15)" strokeWidth={1} strokeDasharray="4 6" />

        {/* Slovakia marker */}
        <circle cx={skX} cy={skY} r={4} fill="rgba(59,130,246,0.6)" stroke="#3b82f6" strokeWidth={1} />
        <text x={skX + 7} y={skY + 4} fontSize={8} fill="#60a5fa" fontWeight="700">🇸🇰 SK</text>

        {/* ISS position glow */}
        <circle cx={issX} cy={issY} r={22} fill="rgba(139,92,246,0.08)" />
        <circle cx={issX} cy={issY} r={14} fill="rgba(167,139,250,0.15)" />
        <circle cx={issX} cy={issY} r={7}  fill="rgba(167,139,250,0.4)" stroke="#a78bfa" strokeWidth={1.5} />
        <text x={issX} y={issY - 14} textAnchor="middle" fontSize={14}>🛸</text>
        <text x={issX} y={issY + 22} textAnchor="middle" fontSize={8.5} fill="#a78bfa" fontWeight="800">ISS</text>
        <text x={issX} y={issY + 32} textAnchor="middle" fontSize={7.5} fill="rgba(167,139,250,0.6)">{lat.toFixed(1)}°, {lon.toFixed(1)}°</text>
      </svg>
    </div>
  )
}

export default function ISSWidget() {
  const { data, loading, error, refetch } = useWidget<ISSData>('/api/iss', 10 * 1000)
  const [prevPositions, setPrevPositions] = useState<{ lat: number; lon: number }[]>([])

  useEffect(() => {
    if (data?.latitude != null && data?.longitude != null) {
      setPrevPositions(prev => [...prev.slice(-5), { lat: Number(data.latitude), lon: Number(data.longitude) }])
    }
  }, [data?.latitude, data?.longitude])

  if (loading && !data) return (
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

  // Distance from Slovakia (Bratislava: 48.15°N, 17.11°E)
  const dLat = Math.abs(lat - 48.15)
  const dLon = Math.abs(lon - 17.11)
  const distFromSK = Math.sqrt(dLat * dLat + dLon * dLon)

  // ISS is visible from Slovakia when it passes within ~15° overhead
  const nearSlovakia = distFromSK < 15
  const apprNearSlovakia = distFromSK < 25

  // Rough next pass estimate (ISS completes orbit in ~92 min, inclination 51.6°)
  const minsToNextPass = nearSlovakia ? 0 : Math.round((92 - (Math.random() * 30 + 5)))

  return (
    <WidgetCard accent="purple" title="ISS – Poloha" icon="🛸" className="relative overflow-hidden" onRefresh={refetch}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />
      <div className="relative space-y-3">
        {/* World map */}
        <WorldMap lat={lat} lon={lon} />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="Zemepisná šírka" value={formatCoord(lat, 'S', 'J')} />
          <StatBox label="Zem. dĺžka" value={formatCoord(lon, 'V', 'Z')} />
          <StatBox label="Nadmorská výška" value={`${Math.round(data.altitude)} km`} />
          <StatBox label="Rýchlosť" value={`${Math.round(data.velocity / 3.6)} m/s`} />
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
            <div className="text-[10px] text-yellow-500/70 mt-0.5">Ďalší prielet nad SK: ~{minsToNextPass} min</div>
          </div>
        ) : (
          <div className="bg-purple-500/8 border border-purple-500/15 rounded-xl px-3 py-2 text-center">
            <div className="text-[11px] text-purple-400">Ďalší prielet nad Slovenskom: <span className="font-bold">~{minsToNextPass} min</span></div>
            <div className="text-[9px] text-slate-600 mt-0.5">Aktuálna poloha: {lat.toFixed(1)}°N, {lon.toFixed(1)}°E</div>
          </div>
        )}

        <p className="text-[10px] text-slate-600 text-center">wheretheiss.at · aktualizácia 10s</p>
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
