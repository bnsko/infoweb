'use client'

import { useWidget } from '@/hooks/useWidget'
import { getAQIInfo } from '@/lib/utils'
import { useLang } from '@/hooks/useLang'
import type { StatsData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'

export default function StatsWidget() {
  const { data, loading, refetch } = useWidget<StatsData>('/api/stats', 60 * 1000)
  const { lang } = useLang()

  const aqi = data?.aqiSK ?? data?.aqi ?? null
  const aqiInfo = aqi !== null ? getAQIInfo(aqi) : null
  const cityTemps = data?.cityTemps ?? []
  const cityAQI = data?.cityAQI ?? []
  const sorted = [...cityTemps].sort((a, b) => b.temp - a.temp)
  const hottest = sorted[0]
  const coldest = sorted[sorted.length - 1]

  return (
    <WidgetCard accent="blue" title={lang === 'sk' ? 'Počasie · Slovensko' : 'Weather · Slovakia'} icon="🌤️" onRefresh={refetch}
      badge={aqi != null && aqiInfo ? `AQI ${aqi} · ${aqiInfo.label}` : undefined}>
      {loading && (
        <div className="flex flex-wrap gap-2">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton h-10 rounded-lg flex-1 min-w-[120px]" />)}</div>
      )}
      {!loading && cityTemps.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {cityTemps.map(c => {
            const aqiData = cityAQI.find(a => a.key === c.key)
            const cAqi = aqiData ? getAQIInfo(aqiData.aqi) : null
            const tempColor = c.temp >= 25 ? '#f97316' : c.temp >= 15 ? '#fbbf24' : c.temp >= 5 ? '#60a5fa' : c.temp >= 0 ? '#818cf8' : '#c4b5fd'
            const isHottest = hottest?.key === c.key && hottest.key !== coldest?.key
            const isColdest = coldest?.key === c.key && hottest?.key !== coldest?.key
            return (
              <div key={c.key} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/8 rounded-lg px-2.5 py-1.5 hover:bg-white/5 transition-colors">
                <span className="text-[10px] text-slate-400 font-semibold">{c.name}</span>
                <span className="text-[12px] font-bold" style={{ color: tempColor }}>{c.temp}°</span>
                {aqiData && cAqi && (
                  <>
                    <span className="text-white/10">·</span>
                    <span className="text-[9px] font-semibold" style={{ color: cAqi.color }}>💨{aqiData.aqi}</span>
                  </>
                )}
                {isHottest && <span className="text-sm leading-none">🔥</span>}
                {isColdest && <span className="text-sm leading-none">🥶</span>}
              </div>
            )
          })}
        </div>
      )}
      {!loading && data?.eurToUsd != null && (
        <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-white/5">
          <span className="text-[10px] text-slate-500">💶 EUR/USD <span className="text-emerald-400 font-bold">${data.eurToUsd.toFixed(4)}</span></span>
          {aqi != null && aqiInfo && (
            <span className="text-[10px] text-slate-500">💨 Vzduch SK <span className="font-bold" style={{ color: aqiInfo.color }}>AQI {aqi} ({aqiInfo.label})</span></span>
          )}
        </div>
      )}
    </WidgetCard>
  )
}
