'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Carrier { name: string; trackingUrl: string }
interface PackageData {
  packages: { id: string; carrier: string; status: string; lastUpdate: string; location: string; eta?: string }[]
  carriers: Carrier[]
  timestamp: number
}

export default function PackageTrackingWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<PackageData>('/api/packages', 5 * 60 * 1000)

  const carriers = data?.carriers ?? []

  return (
    <WidgetCard accent="yellow" title={lang === 'sk' ? 'Sledovanie balíkov' : 'Package Tracking'} icon="📦" onRefresh={refetch}>
      {loading && <SkeletonRows rows={3} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && data && (
        <div className="space-y-3">
          {data.packages.map((p, i) => (
            <div key={i} className="px-2 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-sm">📦</span>
                <span className="text-[10px] font-bold text-slate-200">{p.carrier}</span>
                <span className="text-[9px] text-slate-500 font-mono">{p.id}</span>
                {p.eta && <span className="ml-auto text-[9px] text-emerald-400 font-bold">{p.eta}</span>}
              </div>
              <div className="flex items-center gap-2 mt-1 pl-6">
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-semibold">{p.status}</span>
                <span className="text-[9px] text-slate-500">{p.location}</span>
                <span className="text-[8px] text-slate-600 ml-auto">{p.lastUpdate}</span>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-white/5">
            <p className="text-[9px] text-slate-500 mb-1.5">{lang === 'sk' ? 'Sledovať na:' : 'Track at:'}</p>
            <div className="flex flex-wrap gap-1.5">
              {carriers.map(c => (
                <a key={c.name} href={c.trackingUrl} target="_blank" rel="noopener noreferrer"
                  className="text-[8px] px-2 py-1 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5">
                  {c.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
