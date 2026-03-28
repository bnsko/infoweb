'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface EpicGame {
  title: string
  description: string
  isFreeNow: boolean
  startDate: string | null
  endDate: string | null
  originalPrice: string | null
  image: string | null
  slug: string | null
}

interface EpicData {
  games: EpicGame[]
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' })
  } catch { return '' }
}

export default function EpicFreeWidget() {
  const { data, loading, error, refetch } = useWidget<EpicData>('/api/epicfree', 30 * 60 * 1000)

  return (
    <WidgetCard accent="cyan" title="Epic Free Games" icon="🎁" onRefresh={refetch}>
      {loading && <SkeletonRows rows={3} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba načítania</p>}
      {!loading && data && (
        <div className="space-y-2">
          {data.games.map((game, i) => (
            <a
              key={i}
              href={game.slug ? `https://store.epicgames.com/p/${game.slug}` : 'https://store.epicgames.com/free-games'}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl p-2.5 border border-white/5 hover:bg-white/4 transition-all group"
            >
              <div className="flex items-center gap-3">
                {game.image && (
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-14 h-8 rounded object-cover shrink-0"
                    loading="lazy"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-white line-clamp-1 transition-colors">
                    {game.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {game.isFreeNow ? (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold border border-green-500/20">
                        🎉 ZADARMO TERAZ
                      </span>
                    ) : (
                      <span className="text-[10px] bg-yellow-500/15 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold">
                        ⏰ Čoskoro
                      </span>
                    )}
                    {game.originalPrice && (
                      <span className="text-[10px] text-slate-500 line-through">{game.originalPrice}</span>
                    )}
                    {game.endDate && (
                      <span className="text-[10px] text-slate-500">do {formatDate(game.endDate)}</span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ))}
          {data.games.length === 0 && (
            <p className="text-xs text-slate-500 py-2">Momentálne žiadne free hry</p>
          )}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">store.epicgames.com</p>
    </WidgetCard>
  )
}
