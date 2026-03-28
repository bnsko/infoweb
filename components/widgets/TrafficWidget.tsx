'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

interface TrafficItem {
  title: string; link: string; description: string; pubDate: string; source: string
}

type Tab = 'map' | 'incidents'

function formatTime(iso: string): string {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString('sk-SK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

function getIcon(title: string): string {
  if (title.includes('Nehoda') || title.includes('🚗')) return '🚗'
  if (title.includes('Zápcha') || title.includes('🚦')) return '🚦'
  if (title.includes('Uzávierka') || title.includes('🚧')) return '🚧'
  return '⚠️'
}

export default function TrafficWidget() {
  const { t, lang } = useLang()
  const [tab, setTab] = useState<Tab>('incidents')
  const { data, loading, error, refetch } = useWidget<{ items: TrafficItem[] }>('/api/traffic', 2 * 60 * 1000)

  return (
    <WidgetCard accent="rose" title={t('traffic.title')} icon="🚗" onRefresh={refetch}>
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        <button onClick={() => setTab('map')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
            tab === 'map' ? 'bg-rose-500/15 text-rose-300' : 'text-slate-500 hover:text-slate-300'
          }`}>
          🗺️ {lang === 'sk' ? 'Mapa BA' : 'Map BA'}
        </button>
        <button onClick={() => setTab('incidents')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
            tab === 'incidents' ? 'bg-rose-500/15 text-rose-300' : 'text-slate-500 hover:text-slate-300'
          }`}>
          ⚠️ {lang === 'sk' ? 'Udalosti' : 'Incidents'} {data?.items?.length ? `(${data.items.length})` : ''}
        </button>
      </div>

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

      {tab === 'incidents' && (
        <>
          {loading && <SkeletonRows rows={5} />}
          {!loading && error && <p className="text-xs text-slate-500">{t('traffic.error')}</p>}
          {!loading && data && (
            <div className="space-y-0.5 max-h-[260px] overflow-y-auto scrollbar-hide">
              {data.items.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-2xl block mb-1">✅</span>
                  <p className="text-xs text-slate-500">{t('traffic.none')}</p>
                </div>
              ) : (
                data.items.map((item, i) => (
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
                ))
              )}
            </div>
          )}
        </>
      )}
      <p className="text-[10px] text-slate-600 mt-2">{t('traffic.source')}</p>
    </WidgetCard>
  )
}
