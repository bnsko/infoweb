'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Petition {
  id: string; title: string; category: string; signatures: number; goal: number
  progressPct: number; startDate: string; endDate: string; daysLeft: number
  isActive: boolean; isAchieved: boolean; signaturesPerDay: number; url: string
}
interface PetitionStats {
  totalActivePetitions: number; successfulThisYear: number
  totalSignaturesThisYear: number; mostPopularCategory: string
}
interface PetitionsData {
  petitions: Petition[]; trending: Petition[]; stats: PetitionStats; sourceUrl: string; updatedAt: string
}

const CATEGORY_COLOR: Record<string, string> = {
  'zdravotníctvo': 'text-rose-400',
  'dane': 'text-amber-400',
  'životné prostredie': 'text-green-400',
  'doprava': 'text-blue-400',
  'vzdelávanie': 'text-purple-400',
  'ekonomika': 'text-cyan-400',
  'kultura': 'text-pink-400',
}

function fmtK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n)
}

export default function PetitionsWidget() {
  const { data, loading, refetch } = useWidget<PetitionsData>('/api/petitions', 60 * 60 * 1000)

  return (
    <WidgetCard accent="orange" title="Petície — peticie.com" icon="✍️" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={7} /> : (
        <div className="space-y-3">
          {data?.stats && (
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { label: 'Aktívnych', value: data.stats.totalActivePetitions, color: 'text-orange-400' },
                { label: 'Úspešných', value: data.stats.successfulThisYear, color: 'text-green-400' },
                { label: 'Podpisov', value: fmtK(data.stats.totalSignaturesThisYear), color: 'text-white' },
                { label: 'Top téma', value: '—', color: 'text-slate-400', subtitle: data.stats.mostPopularCategory },
              ]).map(s => (
                <div key={s.label} className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                  <span className={`text-[12px] font-bold ${s.color}`}>{s.value}</span>
                  <span className="text-[6.5px] text-slate-500 text-center leading-tight">{s.subtitle ?? s.label}</span>
                </div>
              ))}
            </div>
          )}

          {(data?.trending ?? []).length > 0 && (
            <div className="px-2.5 py-2 rounded-xl bg-orange-500/8 border border-orange-500/15">
              <span className="text-[7px] text-orange-400 uppercase tracking-wider">Trending</span>
              {data!.trending.map(p => (
                <div key={p.id} className="flex items-center gap-1.5 mt-1">
                  <span className="text-[8px] text-orange-300 font-semibold">+{p.signaturesPerDay}/deň</span>
                  <span className="text-[9px] text-white truncate flex-1">{p.title}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {(data?.petitions ?? []).map(p => (
              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                className="flex flex-col gap-1 px-2.5 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 transition-colors block">
                <div className="flex items-start gap-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium text-white leading-tight">{p.title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[7px] ${CATEGORY_COLOR[p.category] ?? 'text-slate-400'}`}>{p.category}</span>
                      {p.isAchieved && <span className="text-[7px] bg-green-500/20 text-green-400 px-1 rounded">splnená</span>}
                      {!p.isAchieved && p.isActive && p.daysLeft <= 7 && (
                        <span className="text-[7px] bg-amber-500/20 text-amber-400 px-1 rounded">{p.daysLeft}d zostáva</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-bold text-white">{fmtK(p.signatures)}</div>
                    <div className="text-[7px] text-slate-500">z {fmtK(p.goal)}</div>
                  </div>
                </div>
                <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${p.isAchieved ? 'bg-green-500/70' : 'bg-orange-500/60'}`}
                    style={{ width: `${p.progressPct}%` }} />
                </div>
              </a>
            ))}
          </div>

          <a href={data?.sourceUrl ?? 'https://www.peticie.com'} target="_blank" rel="noopener noreferrer"
            className="block text-center text-[8px] text-slate-500 hover:text-orange-400 transition-colors py-1 rounded-lg bg-slate-800/30">
            peticie.com &rarr;
          </a>
        </div>
      )}
    </WidgetCard>
  )
}
