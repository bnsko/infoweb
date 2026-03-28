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
  // Equirectangular projection
  const w = 280, h = 140
  const x = Math.max(0, Math.min(w, ((lon + 180) / 360) * w))
  const y = Math.max(0, Math.min(h, ((90 - lat) / 180) * h))

  // Improved continent outlines (w=280, h=140)
  // toSvg(lon, lat) = x=(lon+180)/360*280, y=(90-lat)/180*140
  const continents = [
    // North America
    'M 10,29 L 40,22 L 64,17 L 80,23 L 88,34 L 80,38 L 79,51 L 70,57 L 63,52 L 58,46 L 52,36 L 48,33 L 40,34 L 36,29 Z',
    // South America
    'M 76,60 L 81,52 L 88,56 L 92,68 L 90,82 L 86,97 L 80,103 L 74,95 L 71,82 L 72,70 Z',
    // Europe
    'M 128,24 L 136,19 L 148,21 L 156,27 L 150,32 L 142,35 L 132,32 Z',
    // Africa
    'M 128,39 L 140,36 L 154,41 L 160,55 L 158,74 L 148,90 L 136,96 L 124,87 L 119,68 L 122,52 Z',
    // Asia (simplified to avoid overlap with Europe)
    'M 156,16 L 200,12 L 232,16 L 258,28 L 260,44 L 240,52 L 220,56 L 200,54 L 186,48 L 170,44 L 158,34 L 156,24 Z',
    // Australia
    'M 218,70 L 240,66 L 258,70 L 260,82 L 252,90 L 232,93 L 220,86 Z',
    // Greenland (small blob)
    'M 84,10 L 96,8 L 102,14 L 96,22 L 84,22 Z',
  ]

  return (
    <div className="rounded-lg overflow-hidden bg-[#060912] border border-white/5">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 100 }}>
        {/* Latitude guides */}
        <line x1={0} y1={h/2}  x2={w} y2={h/2}  stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
        <line x1={0} y1={h/4}  x2={w} y2={h/4}  stroke="rgba(255,255,255,0.025)" strokeWidth={0.4} strokeDasharray="3 5" />
        <line x1={0} y1={3*h/4} x2={w} y2={3*h/4} stroke="rgba(255,255,255,0.025)" strokeWidth={0.4} strokeDasharray="3 5" />
        {/* Prime meridian */}
        <line x1={w/2} y1={0} x2={w/2} y2={h} stroke="rgba(255,255,255,0.03)" strokeWidth={0.4} />
        {/* Continents */}
        {continents.map((d, i) => (
          <path key={i} d={d} fill="rgba(148,163,184,0.12)" stroke="rgba(148,163,184,0.22)" strokeWidth={0.6} />
        ))}
        {/* ISS orbit track hint */}
        <circle cx={x} cy={y} r={10} fill="rgba(168,85,247,0.18)" />
        {/* ISS position dot */}
        <circle cx={x} cy={y} r={4} fill="#a855f7" />
        <circle cx={x} cy={y} r={3} fill="#d8b4fe" />
        {/* Pulsing ring */}
        <circle cx={x} cy={y} r={4} fill="none" stroke="#a855f7" strokeWidth={1.5} opacity={0.7}>
          <animate attributeName="r"       from="4"   to="12"  dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.7" to="0"   dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Coordinates label */}
        <text x={4} y={h - 4} fontSize={7.5} fill="rgba(148,163,184,0.45)" fontFamily="monospace">
          {lat >= 0 ? lat.toFixed(1) + '°N' : (-lat).toFixed(1) + '°S'}
          {' '}
          {lon >= 0 ? lon.toFixed(1) + '°E' : (-lon).toFixed(1) + '°W'}
        </text>
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
