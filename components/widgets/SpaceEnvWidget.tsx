'use client'

import { useWidget } from '@/hooks/useWidget'
import { getAQIInfo } from '@/lib/utils'
import type { ISSData, AirQualityData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import { useLang } from '@/hooks/useLang'

function formatCoord(val: number, posLabel: string, negLabel: string) {
  return `${Math.abs(val).toFixed(2)}° ${val >= 0 ? posLabel : negLabel}`
}

export default function SpaceEnvWidget() {
  const { t } = useLang()
  const iss = useWidget<ISSData>('/api/iss', 30 * 1000)
  const aq = useWidget<AirQualityData>('/api/airquality', 10 * 60 * 1000)

  const handleRefresh = () => {
    iss.refetch()
    aq.refetch()
  }

  const issData = iss.data
  const aqData = aq.data?.current
  const aqiInfo = aqData ? getAQIInfo(aqData.european_aqi) : null

  const lat = issData ? Number(issData.latitude) : null
  const lon = issData ? Number(issData.longitude) : null
  const nearEurope = lat !== null && lon !== null && lat > 30 && lat < 75 && lon > -20 && lon < 50

  return (
    <WidgetCard accent="purple" title={t('space.title')} icon={'🌌'} onRefresh={handleRefresh}>
      <div className="space-y-3">
        {/* ISS Section */}
        <div className="bg-purple-500/8 border border-purple-500/15 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg animate-spin-slow">{'🛰️'}</span>
            <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide">{t('space.iss')}</span>
            {nearEurope && (
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
              {/* Mini world map */}
              <ISSMiniMap lat={lat!} lon={lon!} />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <MiniStat label={t('space.lat')} value={formatCoord(lat!, 'S', 'J')} />
                <MiniStat label={t('space.lon')} value={formatCoord(lon!, 'V', 'Z')} />
                <MiniStat label={t('space.alt')} value={`${Math.round(issData.altitude)} km`} accent />
                <MiniStat label={t('space.speed')} value={`${Math.round(issData.velocity)} km/h`} />
              </div>
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

function ISSMiniMap({ lat, lon }: { lat: number; lon: number }) {
  // Simple equirectangular projection: map lat/lon to SVG coords
  const w = 240, h = 120
  const x = ((lon + 180) / 360) * w
  const y = ((90 - lat) / 180) * h

  // Simplified continent outlines (very rough polygons for visual effect)
  const continents = [
    // North America
    'M48,28 L52,22 L62,20 L72,22 L78,28 L80,36 L72,46 L62,50 L58,48 L52,42 L48,34Z',
    // South America
    'M68,54 L74,50 L80,54 L82,62 L78,76 L72,82 L66,74 L64,62Z',
    // Europe
    'M110,22 L118,18 L126,20 L130,26 L126,32 L118,34 L112,30Z',
    // Africa
    'M112,36 L120,34 L130,38 L134,50 L130,64 L122,72 L114,66 L108,52 L110,42Z',
    // Asia
    'M130,14 L150,10 L172,14 L186,22 L190,34 L182,42 L168,44 L156,38 L140,36 L130,28Z',
    // Australia
    'M174,58 L186,54 L196,58 L198,66 L190,72 L178,70 L174,64Z',
  ]

  return (
    <div className="rounded-lg overflow-hidden bg-[#0a0d14] border border-white/5">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 80 }}>
        {/* Grid lines */}
        <line x1={0} y1={h/2} x2={w} y2={h/2} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
        <line x1={w/2} y1={0} x2={w/2} y2={h} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
        <line x1={0} y1={h/4} x2={w} y2={h/4} stroke="rgba(255,255,255,0.02)" strokeWidth={0.3} strokeDasharray="2 4" />
        <line x1={0} y1={3*h/4} x2={w} y2={3*h/4} stroke="rgba(255,255,255,0.02)" strokeWidth={0.3} strokeDasharray="2 4" />
        {/* Continents */}
        {continents.map((d, i) => (
          <path key={i} d={d} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
        ))}
        {/* ISS position */}
        <circle cx={x} cy={y} r={6} fill="rgba(168,85,247,0.2)" />
        <circle cx={x} cy={y} r={3} fill="#a855f7" />
        <circle cx={x} cy={y} r={3} fill="#a855f7" opacity={0.6}>
          <animate attributeName="r" from="3" to="8" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
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
