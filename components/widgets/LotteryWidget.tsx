'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface LotteryResult {
  game: string
  date: string
  numbers: number[]
  bonus?: number[]
  jackpot: string
  drawn: boolean
  link?: string
}

interface LotteryData {
  results: LotteryResult[]
  timestamp: number
}

const GAME_COLORS: Record<string, { bg: string; border: string; text: string; ball: string }> = {
  'Loto': { bg: 'from-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', ball: '#fbbf24' },
  'Eurojackpot': { bg: 'from-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', ball: '#818cf8' },
  'Šanca': { bg: 'from-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', ball: '#34d399' },
  'Keno': { bg: 'from-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', ball: '#f472b6' },
}

function getStyle(game: string) {
  for (const [key, style] of Object.entries(GAME_COLORS)) {
    if (game.toLowerCase().includes(key.toLowerCase())) return style
  }
  return { bg: 'from-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', ball: '#94a3b8' }
}

export default function LotteryWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<LotteryData>('/api/lottery', 5 * 60 * 1000)

  // Only show first 3 games
  const results = (data?.results ?? []).slice(0, 3)

  return (
    <WidgetCard
      accent="yellow"
      title={lang === 'sk' ? 'Lotéria · Tipos' : 'Lottery · Tipos'}
      icon="🎰"
      onRefresh={refetch}
    >
      {loading && <SkeletonRows rows={3} />}
      {!loading && error && <p className="text-xs text-slate-500">{lang === 'sk' ? 'Chyba' : 'Error'}</p>}
      {!loading && data && (
        <div className="space-y-2">
          {results.map((result, i) => {
            const style = getStyle(result.game)
            const link = result.link || `https://www.tipos.sk/loterie/${result.game.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
            return (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`block rounded-xl border ${style.border} bg-gradient-to-r ${style.bg} to-transparent p-3 cursor-pointer transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${style.text}`}>{result.game}</span>
                    {result.date && (
                      <span className="text-[9px] text-slate-500">{result.date}</span>
                    )}
                  </div>
                  {result.jackpot && (
                    <span className={`text-xs font-bold ${style.text} bg-black/20 px-2 py-0.5 rounded-lg`}>
                      💰 {result.jackpot}
                    </span>
                  )}
                </div>

                {result.drawn && result.numbers.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {result.numbers.map((num, j) => (
                      <span
                        key={j}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${style.ball}, ${style.ball}88)`, boxShadow: `0 2px 8px ${style.ball}40` }}
                      >
                        {num}
                      </span>
                    ))}
                    {result.bonus && result.bonus.length > 0 && (
                      <>
                        <span className="text-slate-600 mx-1">+</span>
                        {result.bonus.map((num, j) => (
                          <span
                            key={`b${j}`}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border-2 text-slate-300"
                            style={{ borderColor: style.ball }}
                          >
                            {num}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic">
                    {lang === 'sk' ? 'Čaká sa na žrebovanie...' : 'Waiting for draw...'}
                  </div>
                )}
              </a>
            )
          })}
        </div>
      )}
      <p className="text-[9px] text-slate-600 mt-2">{lang === 'sk' ? 'obnova 5 min' : 'refresh 5 min'}</p>
    </WidgetCard>
  )
}
