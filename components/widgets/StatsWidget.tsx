'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { getAQIInfo } from '@/lib/utils'
import { useLang } from '@/hooks/useLang'
import type { StatsData } from '@/lib/types'

const SOURCES = 32

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = sessionStorage.getItem('infosk-sid')
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('infosk-sid', sid)
  }
  return sid
}

interface VisitorData {
  lifetimeViews: number
  lifetimeUnique: number
  activeNow: number
  todayPageViews: number
  uptimeMs: number
}

export default function StatsWidget() {
  const { data, loading, refetch } = useWidget<StatsData>('/api/stats', 60 * 1000)
  const [uptime, setUptime] = useState('00:00:00')
  const [visitors, setVisitors] = useState<VisitorData | null>(null)
  const { t, lang } = useLang()

  const updateUptime = useCallback((v: VisitorData) => {
    const elapsed = Math.floor(v.uptimeMs / 1000)
    const d = Math.floor(elapsed / 86400)
    const h = Math.floor((elapsed % 86400) / 3600).toString().padStart(2, '0')
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0')
    const s = (elapsed % 60).toString().padStart(2, '0')
    setUptime(d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`)
  }, [])

  useEffect(() => {
    const sid = getSessionId()
    const doVisit = () => {
      fetch(`/api/visitors?action=visit&sid=${sid}`)
        .then(r => r.json())
        .then((v: VisitorData) => { setVisitors(v); updateUptime(v) })
        .catch(() => {})
    }
    const doPing = () => {
      fetch(`/api/visitors?action=ping&sid=${sid}`)
        .then(r => r.json())
        .then((v: VisitorData) => { setVisitors(v); updateUptime(v) })
        .catch(() => {})
    }
    doVisit()
    const ping = setInterval(doPing, 60 * 1000)
    return () => clearInterval(ping)
  }, [updateUptime])

  // Use SK-wide AQI if available, else BA AQI
  const aqi = data?.aqiSK ?? data?.aqi ?? null
  const aqiInfo = aqi !== null ? getAQIInfo(aqi) : null

  const cityTemps = data?.cityTemps ?? []
  const cityAQI   = data?.cityAQI  ?? []
  const sorted = [...cityTemps].sort((a, b) => b.temp - a.temp)
  const hottest = sorted[0]
  const coldest = sorted[sorted.length - 1]

  return (
    <div className="widget-card !py-3 !px-4 border-amber-500/10 card-entrance relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/3 via-transparent to-transparent pointer-events-none" />
      <div className="relative space-y-2">
        {/* Row 1: Main stats */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Stat icon="💨" label={lang === 'sk' ? 'Vzduch SK' : 'Air SK'}
            value={loading ? '...' : aqi != null ? `AQI ${aqi}` : 'N/A'}
            colorHex={aqiInfo?.color} badge={aqiInfo?.label} />
          <Stat icon="💶" label="EUR/USD" value={loading ? '...' : data?.eurToUsd != null ? `$${data.eurToUsd.toFixed(4)}` : 'N/A'} color="text-emerald-400" />
          <Stat icon="📅" label={t('stat.dayOfYear')} value={loading ? '...' : `${data?.dayOfYear ?? '?'}/${data?.daysInYear ?? 365}`} color="text-slate-400" />
          <Stat icon="🔄" label={t('stat.sources')} value={`${SOURCES}/${SOURCES}`} color="text-emerald-400" />
          <Stat icon="👥" label={t('stat.online')} value={visitors ? String(visitors.activeNow) : '...'} color="text-yellow-400" />
          <Stat icon="📊" label={t('stat.todayVisits')} value={visitors ? String(visitors.todayPageViews) : '...'} color="text-orange-300" />
          <Stat icon="🌐" label={lang === 'sk' ? 'Celkovo' : 'Lifetime'} value={visitors ? String(visitors.lifetimeViews) : '...'} color="text-emerald-300" />
          <Stat icon="⏱️" label={t('stat.uptime')} value={uptime} color="text-slate-400" mono />

          <div className="ml-auto flex items-center gap-3">
            <button onClick={refetch} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all" title={t('refresh')}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {data?.timestamp && (
              <div className="hidden xl:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 anim-pulse-dot" />
                <span className="text-[11px] text-green-400 font-medium">
                  {`Live · ${new Date(data.timestamp).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Combined city temp + AQI */}
        {cityTemps.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pt-1.5 border-t border-white/5">
            <span className="text-[10px] text-slate-500 shrink-0 mr-1">🗺️ {lang === 'sk' ? 'Mestá' : 'Cities'}:</span>
            {cityTemps.map(c => {
              const aqiData = cityAQI.find(a => a.key === c.key)
              const aqiInfo = aqiData ? getAQIInfo(aqiData.aqi) : null
              const tempColor = c.temp >= 25 ? '#f97316' : c.temp >= 15 ? '#fbbf24' : c.temp >= 5 ? '#60a5fa' : c.temp >= 0 ? '#818cf8' : '#c4b5fd'
              const isHottest = hottest?.key === c.key && hottest.key !== coldest?.key
              const isColdest = coldest?.key === c.key && hottest?.key !== coldest?.key
              return (
                <div key={c.key} className="flex items-center gap-1 bg-white/[0.03] border border-white/8 rounded-lg px-2 py-1 hover:bg-white/5 transition-colors">
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">{c.name}</span>
                  <span className="text-[11px] font-bold" style={{ color: tempColor }}>
                    {c.temp}°
                  </span>
                  {aqiData && aqiInfo && (
                    <>
                      <span className="text-white/15">·</span>
                      <span className="text-[9px] font-semibold" style={{ color: aqiInfo.color }}>💨{aqiData.aqi}</span>
                    </>
                  )}
                  {isHottest && <span className="text-sm leading-none">🔥</span>}
                  {isColdest && <span className="text-sm leading-none">🥶</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ icon, label, value, color, colorHex, mono = false, badge }: {
  icon: string; label: string; value: string; color?: string; colorHex?: string; mono?: boolean; badge?: string
}) {
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <span className="text-base shrink-0 leading-none">{icon}</span>
      <div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wide leading-none">{label}</div>
        <div className={`text-sm font-bold leading-tight mt-0.5 flex items-center gap-1 ${color ?? ''} ${mono ? 'font-mono tabular-nums' : ''}`} style={colorHex ? { color: colorHex } : {}}>
          {value}
          {badge && <span className="text-[10px] font-semibold" style={colorHex ? { color: colorHex } : {}}>({badge})</span>}
        </div>
      </div>
    </div>
  )
}
