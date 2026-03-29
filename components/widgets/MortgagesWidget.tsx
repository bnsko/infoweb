'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface MortgageRate {
  bank: string
  logo: string
  fix1y: number
  fix3y: number
  fix5y: number
  fix10y?: number
  note?: string
}

interface MortgageData {
  rates: MortgageRate[]
  bestRate: { bank: string; rate: number; fix: string }
  avgRate: number
  timestamp: number
}

export default function MortgagesWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<MortgageData>('/api/mortgages', 60 * 60 * 1000)

  return (
    <WidgetCard accent="cyan" title={lang === 'sk' ? 'Hypotéky SK' : 'Mortgages SK'} icon="🏠" onRefresh={refetch}
      badge={data ? `${data.avgRate}%` : undefined}>
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && data && (
        <div className="space-y-2">
          {data.bestRate && (
            <div className="px-2 py-1.5 rounded-lg bg-emerald-500/[0.07] border border-emerald-500/15 text-[9px]">
              ⭐ Najlepšia: <strong className="text-emerald-300">{data.bestRate.bank}</strong> — <strong className="text-emerald-300">{data.bestRate.rate}%</strong> ({data.bestRate.fix} fix)
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-[9px]">
              <thead>
                <tr className="text-slate-500 border-b border-white/5">
                  <th className="text-left py-1 font-semibold">Banka</th>
                  <th className="text-right py-1 font-semibold">1r</th>
                  <th className="text-right py-1 font-semibold">3r</th>
                  <th className="text-right py-1 font-semibold">5r</th>
                  <th className="text-right py-1 font-semibold">10r</th>
                </tr>
              </thead>
              <tbody>
                {data.rates.map(r => (
                  <tr key={r.bank} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-1.5 text-slate-300">
                      <span className="mr-1">{r.logo}</span>{r.bank}
                      {r.note && <span className="text-[7px] text-emerald-400 ml-1">{r.note}</span>}
                    </td>
                    <td className="text-right py-1.5 text-slate-400 tabular-nums">{r.fix1y}%</td>
                    <td className="text-right py-1.5 text-slate-400 tabular-nums">{r.fix3y}%</td>
                    <td className="text-right py-1.5 text-cyan-300 font-bold tabular-nums">{r.fix5y}%</td>
                    <td className="text-right py-1.5 text-slate-400 tabular-nums">{r.fix10y ? `${r.fix10y}%` : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
