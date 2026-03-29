'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import type { ISSData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import { useLang } from '@/hooks/useLang'

function formatCoord(val: number, posLabel: string, negLabel: string) {
  return `${Math.abs(val).toFixed(2)}° ${val >= 0 ? posLabel : negLabel}`
}

function computeNextPasses(currentLat: number, currentLon: number): { time: string; type: string; direction: string; duration: string }[] {
  const now = Date.now()
  const orbitPeriodMs = 92.68 * 60 * 1000
  const SK_LAT = 48.7
  const SK_LON = 19.5
  const passes: { time: string; type: string; direction: string; duration: string }[] = []
  for (let i = 1; i <= 20 && passes.length < 3; i++) {
    const futureMs = now + i * orbitPeriodMs
    const lonShift = (i * 22.9) % 360
    const approxLon = ((currentLon - lonShift + 540) % 360) - 180
    const phase = (i * 2 * Math.PI) / (360 / 22.9)
    const approxLat = 51.6 * Math.sin(phase + Math.asin(Math.max(-1, Math.min(1, currentLat / 51.6))))
    const dLat = Math.abs(approxLat - SK_LAT)
    const dLon = Math.abs(approxLon - SK_LON)
    const dist = Math.sqrt(dLat * dLat + dLon * dLon * Math.cos(SK_LAT * Math.PI / 180) ** 2)
    if (dist < 18) {
      const d = new Date(futureMs)
      const h = d.getHours()
      const isVisible = (h >= 19 || h <= 5)
      passes.push({
        time: d.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('sk-SK', { weekday: 'short', day: 'numeric', month: 'short' }),
        type: isVisible ? '👁️ Viditeľný' : '🔭 Nad horizontom',
        direction: approxLon < SK_LON ? 'Z → V' : 'V → Z',
        duration: `~${Math.max(2, Math.round(6 - dist / 4))} min`,
      })
    }
  }
  return passes
}

/* ── ISS pass mini widget for main panel ── */
export function ISSPassMini(props: { onOpenChange?: (open: boolean) => void }) {
  const { onOpenChange } = props
  const iss = useWidget<ISSData>('/api/iss', 30 * 1000)
  const [open, setOpen] = useState(false)
  useEffect(() => { onOpenChange?.(open) }, [open, onOpenChange])
  const [passes, setPasses] = useState<{ time: string; type: string; direction: string; duration: string }[]>([])

  const lat = iss.data ? Number(iss.data.latitude) : null
  const lon = iss.data ? Number(iss.data.longitude) : null
  const dLatSK = lat !== null ? Math.abs(lat - 48.15) : 999
  const dLonSK = lon !== null ? Math.abs(lon - 17.11) : 999
  const distFromSK = Math.sqrt(dLatSK * dLatSK + dLonSK * dLonSK)
  const nearSlovakia = distFromSK < 15

  useEffect(() => {
    if (lat !== null && lon !== null) setPasses(computeNextPasses(lat, lon))
  }, [lat, lon])

  const nextPass = passes[0]

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg border hover:opacity-80 transition-all text-[10px] shrink-0 ${
          nearSlovakia ? 'bg-green-500/10 border-green-500/20' : 'bg-purple-500/8 border-purple-500/15'
        }`}>
        <span>🛰️</span>
        <span className={`font-bold ${nearSlovakia ? 'text-green-300' : 'text-purple-300'}`}>
          {nearSlovakia ? '🇸🇰 ISS!' : nextPass ? nextPass.time.split(' ')[0] : 'ISS'}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[360px] bg-[var(--bg-card)] border border-purple-500/20 rounded-2xl shadow-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-purple-300">🛰️ ISS nad Slovenskom</span>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
            </div>
            {iss.data && (
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-white/[0.03] rounded-lg p-1.5"><span className="text-slate-500">Lat</span><div className="text-slate-200 font-mono font-bold">{formatCoord(lat!, 'S', 'J')}</div></div>
                <div className="bg-white/[0.03] rounded-lg p-1.5"><span className="text-slate-500">Lon</span><div className="text-slate-200 font-mono font-bold">{formatCoord(lon!, 'V', 'Z')}</div></div>
                <div className="bg-white/[0.03] rounded-lg p-1.5"><span className="text-slate-500">Výška</span><div className="text-purple-300 font-mono font-bold">{Math.round(iss.data.altitude)} km</div></div>
                <div className="bg-white/[0.03] rounded-lg p-1.5"><span className="text-slate-500">Rýchlosť</span><div className="text-slate-200 font-mono font-bold">{Math.round(iss.data.velocity)} km/h</div></div>
              </div>
            )}
            <div className="text-center text-[10px] text-purple-400">🇸🇰 Vzdialenosť: ~{Math.round(distFromSK * 111)} km</div>
            {passes.length > 0 && (
              <div className="space-y-1">
                <div className="text-[9px] text-slate-500 uppercase tracking-wide font-semibold">Prielety nad Slovenskom</div>
                {passes.map((p, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-lg px-2 py-1.5 border text-[10px] ${
                    i === 0 ? 'bg-purple-500/10 border-purple-500/20' : 'bg-white/[0.02] border-white/5'
                  }`}>
                    <div>
                      <div className="font-semibold text-slate-200">{p.time}</div>
                      <div className="text-[9px] text-slate-500">{p.direction} · {p.duration}</div>
                    </div>
                    <span className={`font-semibold ${p.type.includes('Viditeľný') ? 'text-green-400' : 'text-slate-400'}`}>{p.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default function SpaceEnvWidget() {
  const { t } = useLang()
  const iss = useWidget<ISSData>('/api/iss', 30 * 1000)
  const [passes, setPasses] = useState<{ time: string; type: string; direction: string; duration: string }[]>([])

  const issData = iss.data

  const lat = issData ? Number(issData.latitude) : null
  const lon = issData ? Number(issData.longitude) : null

  // Distance from Slovakia
  const dLatSK = lat !== null ? Math.abs(lat - 48.15) : 999
  const dLonSK = lon !== null ? Math.abs(lon - 17.11) : 999
  const distFromSK = Math.sqrt(dLatSK * dLatSK + dLonSK * dLonSK)
  const nearSlovakia = distFromSK < 15
  const nearEurope = lat !== null && lon !== null && lat > 30 && lat < 75 && lon > -20 && lon < 50

  useEffect(() => {
    if (lat !== null && lon !== null) {
      setPasses(computeNextPasses(lat, lon))
    }
  }, [lat, lon])

  return (
    <WidgetCard accent="purple" title={t('space.title')} icon={'🌌'} onRefresh={iss.refetch}>
      <div className="space-y-3">
        {/* ISS Section */}
        <div className="bg-purple-500/8 border border-purple-500/15 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{'🛰️'}</span>
            <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide">{t('space.iss')}</span>
            {nearSlovakia && (
              <span className="text-[9px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full border border-green-500/20 ml-auto">
                {'🇸🇰'} Nad Slovenskom!
              </span>
            )}
            {!nearSlovakia && nearEurope && (
              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-500/20 ml-auto">
                {'🇪🇺'} {t('space.overEurope')}
              </span>
            )}
          </div>
          {iss.loading ? (
            <div className="grid grid-cols-2 gap-2">
              {[1,2,3,4].map(i => <div key={i} className="skeleton h-8 rounded-lg" />)}
            </div>
          ) : issData ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <MiniStat label={t('space.lat')} value={formatCoord(lat!, 'S', 'J')} />
                <MiniStat label={t('space.lon')} value={formatCoord(lon!, 'V', 'Z')} />
                <MiniStat label={t('space.alt')} value={`${Math.round(issData.altitude)} km`} accent />
                <MiniStat label={t('space.speed')} value={`${Math.round(issData.velocity)} km/h`} />
              </div>
              {/* Distance to SK */}
              <div className="mt-2 text-center">
                <span className="text-[10px] text-purple-400">
                  🇸🇰 Vzdialenosť od SK: <span className="font-bold">~{Math.round(distFromSK * 111)} km</span>
                </span>
              </div>
              {/* Upcoming SK passes */}
              {passes.length > 0 && (
                <div className="mt-2">
                  <div className="text-[9px] text-slate-500 uppercase tracking-wide font-semibold mb-1.5">
                    🇸🇰 Prielety nad Slovenskom
                  </div>
                  <div className="space-y-1">
                    {passes.map((p, i) => (
                      <div key={i} className={`flex items-center justify-between rounded-lg px-2 py-1.5 border text-[10px] ${
                        i === 0 ? 'bg-purple-500/10 border-purple-500/20' : 'bg-white/[0.02] border-white/5'
                      }`}>
                        <div>
                          <div className="font-semibold text-slate-200">{p.time}</div>
                          <div className="text-[9px] text-slate-500">{p.direction} · {p.duration}</div>
                        </div>
                        <span className={`font-semibold ${p.type.includes('Viditeľný') ? 'text-green-400' : 'text-slate-400'}`}>
                          {p.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-500">{t('space.dataUnavailable')}</p>
          )}
        </div>
      </div>
      <p className="text-[10px] text-slate-600 mt-2">WhereIsISS · Live tracking</p>
    </WidgetCard>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white/3 rounded-lg px-2 py-1.5">
      <div className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={`text-[11px] font-mono font-bold mt-0.5 ${accent ? 'text-purple-300' : 'text-slate-200'}`}>{value}</div>
    </div>
  )
}
