'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Deal {
  title: string
  price: string
  originalPrice?: string
  discount?: string
  store: string
  link: string
}

interface DealsData {
  deals: Deal[]
  timestamp: number
}

export default function DealsWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<DealsData>('/api/deals', 15 * 60 * 1000)

  return (
    <WidgetCard
      accent="green"
      title={lang === 'sk' ? 'Zľavy dnes' : 'Deals Today'}
      icon="🏷️"
      onRefresh={refetch}
    >
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">{lang === 'sk' ? 'Chyba' : 'Error'}</p>}
      {!loading && data && data.deals.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-6">{lang === 'sk' ? 'Žiadne aktuálne zľavy' : 'No current deals'}</p>
      )}
      {!loading && data && data.deals.length > 0 && (
        <div className="space-y-1 max-h-[380px] overflow-y-auto scrollbar-hide">
          {data.deals.map((deal, i) => (
            <a
              key={i}
              href={deal.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 rounded-xl p-2 hover:bg-white/[0.04] transition-all group border border-transparent hover:border-white/5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-200 group-hover:text-white leading-snug line-clamp-2 font-medium">{deal.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[12px] font-bold text-emerald-400">{deal.price}</span>
                  {deal.originalPrice && (
                    <span className="text-[10px] text-slate-600 line-through">{deal.originalPrice}</span>
                  )}
                  {deal.discount && (
                    <span className="text-[10px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded-md">{deal.discount}</span>
                  )}
                  <span className="text-[9px] text-slate-600 ml-auto">{deal.store}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">Alza · Heureka · AI odporúčania · {lang === 'sk' ? 'obnova 15 min' : 'refresh 15 min'}</p>
    </WidgetCard>
  )
}
