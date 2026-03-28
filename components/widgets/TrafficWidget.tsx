'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

interface TrafficItem {
  title: string; link: string; description: string; pubDate: string; source: string
}

interface TrafficStats {
  accidents: number; jams: number; closures: number; total: number; congestion: string
}

interface HistoryItem extends TrafficItem {
  seenAt: number
}

type Tab = 'incidents' | 'history' | 'map'

function formatTime(iso: string): string {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString('sk-SK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

function timeAgo(ms: number): string {
  const diff = Math.floor((Date.now() - ms) / 60000)
  if (diff < 1) return 'práve'
  if (diff < 60) return `${diff}m`
  if (diff < 1440) return `${Math.floor(diff / 60)}h`
  return `${Math.floor(diff / 1440)}d`
}

function getIcon(title: string): string {
  if (title.includes('Nehoda') || title.includes('🚗')) return '🚗'
  if (title.includes('Zápcha') || title.includes('🚦')) return '🚦'
  if (title.includes('Uzávierka') || title.includes('🚧')) return '🚧'
  return '⚠️'
}

const HISTORY_KEY = 'traffic-history-v1'
const MAX_HISTORY = 30

export default function TrafficWidget() {
  const { t, lang } = useLang()
  const [tab, setTab] = useState<Tab>('incidents')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const { data, loading, error, refetch } = useWidget<{ items: TrafficItem[]; stats?: TrafficStats }>('/api/traffic', 2 * 60 * 1000)

  // Load history from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY)
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
  }, [])

  // Add new incidents to history
  const updateHistory = useCallback((items: TrafficItem[]) => {
    setHistory(prev => {
      const prevTitles = new Set(prev.map(h => h.title))
      const newItems: HistoryItem[] = items
        .filter(item => !prevTitles.has(item.title))
        .map(item => ({ ...item, seenAt: Date.now() }))
      if (newItems.length === 0) return prev
      const updated = [...newItems, ...prev].slice(0, MAX_HISTORY)
      try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  useEffect(() => {
    if (data?.items?.length) updateHistory(data.items)
  }, [data, updateHistory])

  const TABS = [
    { key: 'incidents' as Tab, icon: '⚠️', label: lang === 'sk' ? 'Udalosti' : 'Incidents', badge: data?.items?.length },
    { key: 'history' as Tab,   icon: '📋', label: lang === 'sk' ? 'História' : 'History',   badge: history.length },
    { key: 'map' as Tab,       icon: '🗺️', label: lang === 'sk' ? 'Mapa BA' : 'Map BA' },
  ]

  return (
    <WidgetCard accent="rose" title={t('traffic.title')} icon="🚗" onRefresh={refetch}>
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === tb.key ? 'bg-rose-500/15 text-rose-300' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{tb.icon}</span>
            <span>{tb.label}</span>
            {tb.badge ? <span className="ml-0.5 text-[9px] opacity-70">({tb.badge})</span> : null}
          </button>
        ))}
      </div>

      {/* Congestion stats bar */}
      {data?.stats && (
        <div className="flex flex-wrap items-center gap-2 mb-3 px-1">
          <CongestionBadge level={data.stats.congestion} lang={lang} />
          <span className="text-[9px] text-slate-500">🚗 {data.stats.accidents}</span>
          <span className="text-[9px] text-slate-500">🚦 {data.stats.jams}</span>
          <span className="text-[9px] text-slate-500">🚧 {data.stats.closures}</span>
        </div>
      )}

      {tab === 'incidents' && (
        <>
          {loading && <SkeletonRows rows={5} />}
          {!loading && error && <p className="text-xs text-slate-500">{t('traffic.error')}</p>}
          {!loading && data && (
            <div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-hide">
              {data.items.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-2xl block mb-1">✅</span>
                  <p className="text-xs text-slate-500">{t('traffic.none')}</p>
                </div>
              ) : (
                data.items.map((item, i) => (
                  item.link ? (
                    <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                       className="flex items-start gap-2 rounded-lg p-1.5 widget-item-hover hover:border-rose-500/15 cursor-pointer group">
                      <span className="text-sm shrink-0 mt-0.5">{getIcon(item.title)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-slate-200 leading-snug line-clamp-2 group-hover:text-white">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-rose-400/70 font-medium">{item.source}</span>
                          {item.pubDate && <span className="text-[9px] text-slate-600">{formatTime(item.pubDate)}</span>}
                        </div>
                      </div>
                      <span className="text-slate-600 group-hover:text-slate-400 shrink-0 text-[10px]">↗</span>
                    </a>
                  ) : (
                    <div key={i} className="flex items-start gap-2 rounded-lg p-1.5 widget-item-hover">
                      <span className="text-sm shrink-0 mt-0.5">{getIcon(item.title)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-slate-200 leading-snug line-clamp-2">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-rose-400/70 font-medium">{item.source}</span>
                          {item.pubDate && <span className="text-[9px] text-slate-600">{formatTime(item.pubDate)}</span>}
                        </div>
                      </div>
                    </div>
                  )
                ))
              )}
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-hide">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-2xl block mb-1">📋</span>
              <p className="text-xs text-slate-500">{lang === 'sk' ? 'Zatiaľ žiadna história' : 'No history yet'}</p>
            </div>
          ) : (
            history.map((item, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg p-1.5 hover:bg-white/[0.03] transition-colors">
                <span className="text-sm shrink-0 mt-0.5">{getIcon(item.title)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-slate-600">{item.source}</span>
                    <span className="text-[9px] text-slate-500">🕐 {timeAgo(item.seenAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'map' && (
        <div className="rounded-xl overflow-hidden border border-white/5" style={{ height: 280 }}>
          <iframe
            src="https://embed.waze.com/iframe?zoom=12&lat=48.1486&lon=17.1077&ct=livemap&pin=1"
            width="100%" height="100%"
            style={{ border: 'none' }}
            loading="lazy"
            title="Waze Bratislava"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}

      <p className="text-[10px] text-slate-600 mt-2">{t('traffic.source')}</p>
    </WidgetCard>
  )
}

function CongestionBadge({ level, lang }: { level: string; lang: string }) {
  const map: Record<string, { color: string; label: string; labelEn: string }> = {
    low:      { color: '#22c55e', label: 'Nízka', labelEn: 'Low' },
    moderate: { color: '#eab308', label: 'Stredná', labelEn: 'Moderate' },
    high:     { color: '#f97316', label: 'Vysoká', labelEn: 'High' },
    severe:   { color: '#ef4444', label: 'Kritická', labelEn: 'Severe' },
  }
  const info = map[level] ?? map.low
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: info.color + '20', color: info.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: info.color }} />
      {lang === 'sk' ? info.label : info.labelEn}
    </span>
  )
}
