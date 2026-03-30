'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Rate { role: string; icon: string; hourlyMin: number; hourlyMax: number; monthlyAvg: number; demand: string }
interface Platform { name: string; icon: string; focus: string; fee: string; url: string }
interface FreelanceData { rates: Rate[]; platforms: Platform[]; avgFreelanceIncomeSK: number; timestamp: number }

export default function FreelanceWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<FreelanceData>('/api/freelance', 60 * 60 * 1000)

  const demandColor = { high: 'text-emerald-400', medium: 'text-amber-400', low: 'text-red-400' }

  return (
    <WidgetCard accent="green" title={lang === 'sk' ? 'Freelance SK' : 'Freelance SK'} icon="💻" onRefresh={refetch}
      badge={data ? `Ø ${data.avgFreelanceIncomeSK}€` : undefined}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && data && (
        <div className="space-y-3">
          <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-hide">
            {data.rates.map((r, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <span className="text-sm">{r.icon}</span>
                <span className="text-[9px] text-slate-200 font-medium flex-1">{r.role}</span>
                <span className="text-[8px] text-slate-500">{r.hourlyMin}-{r.hourlyMax}€/h</span>
                <span className={`text-[7px] font-bold ${demandColor[r.demand as keyof typeof demandColor] ?? 'text-slate-400'}`}>
                  {r.demand === 'high' ? '🔥' : '📊'} {r.demand}
                </span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Platformy</div>
            <div className="grid grid-cols-2 gap-1">
              {data.platforms.map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <span>{p.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[8px] text-slate-200 font-semibold">{p.name}</div>
                    <div className="text-[7px] text-slate-500">{p.fee}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
