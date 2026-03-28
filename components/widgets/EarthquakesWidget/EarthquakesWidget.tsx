'use client'

import { useWidget } from '@/hooks/useWidget'
import type { EarthquakesResponse } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

function magColor(mag: number): string {
  if (mag >= 4.5) return 'text-red-400'
  if (mag >= 3.0) return 'text-orange-400'
  if (mag >= 2.0) return 'text-yellow-400'
  return 'text-green-400'
}

function magBg(mag: number): string {
  if (mag >= 4.5) return 'bg-red-500/15 border-red-500/30'
  if (mag >= 3.0) return 'bg-orange-500/15 border-orange-500/30'
  if (mag >= 2.0) return 'bg-yellow-500/15 border-yellow-500/30'
  return 'bg-green-500/15 border-green-500/30'
}

export default function EarthquakesWidget() {
  const { t } = useLang()
  const { data, loading, error, refetch } = useWidget<EarthquakesResponse>('/api/earthquakes', 10 * 60 * 1000)

  return (
    <WidgetCard accent="orange" title={t('eq.title')} icon="🌍" className="h-full" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} cols={2} />}
      {!loading && (error || !data) && <WidgetError />}
      {!loading && data && (
        <>
          {data.earthquakes.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">
              <div className="text-2xl mb-1">✅</div>
              {t('eq.none')}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto">
              {data.earthquakes.map((eq) => (
                <a
                  key={eq.id}
                  href={eq.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:bg-white/3 rounded-lg p-1.5 transition-colors group"
                >
                  {/* Magnitude badge */}
                  <div
                    className={`flex-shrink-0 w-12 h-10 flex items-center justify-center rounded-lg border text-sm font-bold ${magBg(eq.mag)} ${magColor(eq.mag)}`}
                  >
                    M {eq.mag.toFixed(1)}
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-200 group-hover:text-white leading-snug line-clamp-1 transition-colors">
                      {eq.place}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500">
                        {new Date(eq.time).toLocaleString('sk-SK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-slate-600">{t('eq.depth')}: {eq.depth} km</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          <p className="text-[10px] text-slate-600 mt-2">{t('eq.source')}</p>
        </>
      )}
    </WidgetCard>
  )
}
