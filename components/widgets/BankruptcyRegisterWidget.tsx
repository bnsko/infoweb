'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'

interface BankruptcyEntry {
  id: string
  companyName: string
  ico: string
  datePublished: string
  type: string
  administrator: string
  court: string
  url: string
}

interface RegionCount {
  region: string
  count: number
}

interface BankruptcyData {
  recentEntries: BankruptcyEntry[]
  stats: { totalActive: number; newThisMonth: number; byType: { konkurz: number; restrukturalizacia: number; likvidacia: number }; byRegion: RegionCount[] }
  updatedAt: string
}

const TYPE_COLOR: Record<string, string> = {
  konkurz: 'bg-red-500/20 text-red-400 border-red-500/30',
  reštrukturalizácia: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  likvidácia: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  exekúcia: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'dnes'
  if (d === 1) return 'včera'
  return `pred ${d}d`
}

export default function BankruptcyRegisterWidget() {
  const { data, loading, refetch } = useWidget<BankruptcyData>('/api/bankruptcy-register', 3600 * 1000)

  return (
    <WidgetCard accent="rose" title="Register úpadcov" icon="⚖️" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-rose-400">{data.stats.totalActive.toLocaleString('sk-SK')}</div>
              <div className="text-[9px] text-slate-500">aktívnych</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-orange-400">{data.stats.newThisMonth}</div>
              <div className="text-[9px] text-slate-500">tento mesiac</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-red-400">{data.stats.byType.konkurz.toLocaleString('sk-SK')}</div>
              <div className="text-[9px] text-slate-500">konkurzov</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Najnovšie zápisy</div>
            {data.recentEntries.map(e => (
              <div key={e.id} className="flex items-start gap-2 bg-slate-700/30 rounded-lg p-2.5">
                <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium border shrink-0 ${TYPE_COLOR[e.type] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                  {e.type}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-200 font-medium truncate">{e.companyName}</div>
                  <div className="text-[10px] text-slate-500">IČO {e.ico} · {e.court.replace('Krajský súd ', '')} · {timeAgo(e.datePublished)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[9px] text-slate-600 text-right">
            <a href="https://ru.justice.sk" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">ru.justice.sk</a>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
