'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { getAQIInfo } from '@/lib/utils'
import type { ISSData, AirQualityData } from '@/lib/types'
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

export default function SpaceEnvWidget() {
  const { t } = useLang()
  const iss = useWidget<ISSData>('/api/iss', 30 * 1000)
  const aq = useWidget<AirQualityData>('/api/airquality', 10 * 60 * 1000)
  const [passes, setPasses] = useState<{ time: string; type: string; direction: string; duration: string }[]>([])

  const handleRefresh = () => { iss.refetch(); aq.refetch() }

  const issData = iss.data
  const aqData = aq.data?.current
  const aqiInfo = aqData ? getAQIInfo(aqData.european_aqi) : null

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
    <WidgetCard accent="purple" title={t('space.title')} icon={'🌌'} onRefresh={handleRefresh}>
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

        {/* Air Quality Section */}
        <div className="rounded-xl p-3" style={{ background: aqiInfo ? aqiInfo.bg : 'rgba(255,255,255,0.03)', borderWidth: 1, borderStyle: 'solid', borderColor: aqiInfo ? aqiInfo.color + '30' : 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{'💨'}</span>
            <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wide">{t('space.airQuality')}</span>
          </div>
          {aq.loading ? (
            <div className="grid grid-cols-2 gap-2">
              {[1,2,3,4].map(i => <div key={i} className="skeleton h-8 rounded-lg" />)}
            </div>
          ) : aqData && aqiInfo ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{ color: aqiInfo.color }}>{aqData.european_aqi}</span>
                  <span className="text-xs font-semibold" style={{ color: aqiInfo.color }}>{aqiInfo.label}</span>
                </div>
                <span className="text-[10px] text-slate-500">{t('space.europeanAQI')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MiniStat label="PM2.5" value={`${aqData.pm2_5?.toFixed(1)} µg/m³`} />
                <MiniStat label="PM10" value={`${aqData.pm10?.toFixed(1)} µg/m³`} />
                <MiniStat label={t('space.ozone')} value={`${aqData.ozone?.toFixed(0)} µg/m³`} />
                <MiniStat label={`NO₂`} value={`${aqData.nitrogen_dioxide?.toFixed(1)} µg/m³`} />
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500">{t('space.dataUnavailable')}</p>
          )}
        </div>
      </div>
      <p className="text-[10px] text-slate-600 mt-2">WhereIsISS + OpenMeteo AQ</p>
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
