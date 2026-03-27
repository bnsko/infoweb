'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { getAQIInfo } from '@/lib/utils'
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

export default function StatsWidget() {
  const { data, loading, refetch } = useWidget<StatsData>('/api/stats', 60 * 1000)
  const [uptime, setUptime] = useState('00:00:00')
  const [serverStart, setServerStart] = useState<number | null>(null)
  const [visitors, setVisitors] = useState<{ totalPageViews: number; uniqueVisitors: number; activeNow: number; todayPageViews: number } | null>(null)

  // Get server start time from stats
  useEffect(() => {
    if (data?.serverStartTime && !serverStart) {
      setServerStart(data.serverStartTime)
    }
  }, [data, serverStart])

  const tick = useCallback(() => {
    if (!serverStart) return
    const elapsed = Math.floor((Date.now() - serverStart) / 1000)
    const h = Math.floor(elapsed / 3600).toString().padStart(2, '0')
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0')
    const s = (elapsed % 60).toString().padStart(2, '0')
    setUptime(`${h}:${m}:${s}`)
  }, [serverStart])

  useEffect(() => {
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [tick])

  // Track visitors
  useEffect(() => {
    const sid = getSessionId()
    fetch(`/api/visitors?action=visit&sid=${sid}`)
      .then(r => r.json())
      .then(setVisitors)
      .catch(() => {})
    const ping = setInterval(() => {
      fetch(`/api/visitors?action=ping&sid=${sid}`)
        .then(r => r.json())
        .then(setVisitors)
        .catch(() => {})
    }, 2 * 60 * 1000)
    return () => clearInterval(ping)
  }, [])

  const aqi = data?.aqi ?? null
  const aqiInfo = aqi !== null ? getAQIInfo(aqi) : null

  return (
    <div className="widget-card !py-3 !px-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-amber-500/10 card-entrance relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/3 via-transparent to-transparent pointer-events-none" />
      <div className="relative flex flex-wrap items-center gap-x-5 gap-y-2 w-full">
        <Stat icon="🌡️" label="Teplota BA" value={loading ? '...' : data?.tempBA != null ? `${data.tempBA}°C` : 'N/A'} color="text-blue-300" />
        <Stat icon="💨" label="Vzduch BA" value={loading ? '...' : aqi != null ? `AQI ${aqi}` : 'N/A'} colorHex={aqiInfo?.color} badge={aqiInfo?.label} />
        <Stat icon="✈️" label="Lety nad SK" value={loading ? '...' : data?.flightsCount != null ? String(data.flightsCount) : 'N/A'} color="text-cyan-400" />
        <Stat icon="₿" label="BTC" value={loading ? '...' : data?.btcEur != null ? `€${data.btcEur.toLocaleString('sk-SK')}` : 'N/A'} color="text-amber-400" />
        <Stat icon="📅" label="Deň roka" value={loading ? '...' : `${data?.dayOfYear ?? '?'}/${data?.daysInYear ?? 365}`} color="text-slate-400" />
        <Stat icon="🔄" label="Zdroje" value={`${SOURCES}/${SOURCES}`} color="text-emerald-400" />
        <Stat icon="👥" label="Online" value={visitors ? String(visitors.activeNow) : '...'} color="text-yellow-400" />
        <Stat icon="👁️" label="Návštevy" value={visitors ? visitors.totalPageViews.toLocaleString('sk-SK') : '...'} color="text-pink-400" />
        <Stat icon="📊" label="Dnes" value={visitors ? String(visitors.todayPageViews) : '...'} color="text-orange-300" />
        <Stat icon="🧑" label="Unikátni" value={visitors ? String(visitors.uniqueVisitors) : '...'} color="text-emerald-300" />
        <Stat icon="⏱️" label="Uptime" value={uptime} color="text-slate-400" mono />

        <div className="ml-auto flex items-center gap-3">
          <button onClick={refetch} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all" title="Obnovit">
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
    </div>
  )
}

function Stat({ icon, label, value, color, colorHex, mono = false, badge }: {
  icon: string; label: string; value: string; color?: string; colorHex?: string; mono?: boolean; badge?: string
}) {
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
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
