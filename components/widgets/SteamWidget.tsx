'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface SteamGame {
  id: number
  name: string
  discountPercent: number
  originalPrice: string | null
  finalPrice: string
  headerImage: string | null
}

interface SteamData {
  newReleases: SteamGame[]
  topSellers: SteamGame[]
}

type Tab = 'new' | 'top'

export default function SteamWidget() {
  const { data, loading, error, refetch } = useWidget<SteamData>('/api/steam', 10 * 60 * 1000)
  const [tab, setTab] = useState<Tab>('new')

  const items = tab === 'new' ? data?.newReleases : data?.topSellers

  return (
    <WidgetCard accent="purple" title="Steam" icon="🎮" onRefresh={refetch}>
      <div className="flex items-center gap-1 mb-2">
        {[
          { key: 'new' as Tab, label: '🆕 Nové' },
          { key: 'top' as Tab, label: '🏆 Top' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition-all ${
              tab === t.key ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}>{t.label}</button>
        ))}
      </div>

      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba načítania</p>}
      {!loading && items && (
        <div className="space-y-1 max-h-[320px] overflow-y-auto">
          {items.map((game, i) => (
            <a
              key={game.id}
              href={`https://store.steampowered.com/app/${game.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-white/4 transition-all group"
            >
              <span className="text-[10px] text-slate-600 font-mono w-4 shrink-0">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-200 group-hover:text-white leading-snug line-clamp-1 transition-colors">
                  {game.name}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {game.discountPercent > 0 && (
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">
                    -{game.discountPercent}%
                  </span>
                )}
                <span className="text-[11px] font-semibold text-white">
                  {game.finalPrice === '0.00' ? 'Free' : `€${game.finalPrice}`}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">store.steampowered.com</p>
    </WidgetCard>
  )
}
