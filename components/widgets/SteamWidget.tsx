'use client'

import { useState, useMemo } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface SteamGame {
  id: number; name: string; discountPercent: number
  originalPrice: string | null; finalPrice: string; headerImage: string | null
}
interface SteamNews {
  title: string; url: string; author: string; date: number; appid: number; feedlabel: string
}
interface DeckPrice { usd: string; eur: string }

interface SteamData {
  newReleases: SteamGame[]
  topSellers: SteamGame[]
  newsItems: SteamNews[]
  deckPrice: DeckPrice | null
}

type Tab = 'new' | 'top' | 'news' | 'deck'

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000 - ts)
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

const STEAM_DECK_CONFIGS = [
  { name: 'Steam Deck LCD 256GB', price: '399', currency: '€', url: 'https://store.steampowered.com/steamdeck' },
  { name: 'Steam Deck LCD 512GB', price: '449', currency: '€', url: 'https://store.steampowered.com/steamdeck' },
  { name: 'Steam Deck OLED 512GB', price: '549', currency: '€', url: 'https://store.steampowered.com/steamdeck' },
  { name: 'Steam Deck OLED 1TB', price: '649', currency: '€', url: 'https://store.steampowered.com/steamdeck' },
]

export default function SteamWidget() {
  const { data, loading, error, refetch } = useWidget<SteamData>('/api/steam', 10 * 60 * 1000)
  const [tab, setTab] = useState<Tab>('new')
  const { t, lang } = useLang()

  const gameItems = useMemo(() => {
    const raw = tab === 'new' ? data?.newReleases : tab === 'top' ? data?.topSellers : null
    if (!raw) return null
    const seen = new Set<number>()
    return raw.filter(g => { if (seen.has(g.id)) return false; seen.add(g.id); return true })
  }, [tab, data])

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'new',      icon: '🆕', label: lang === 'sk' ? 'Nové' : 'New' },
    { key: 'top',      icon: '🏆', label: 'Top' },
    { key: 'news',     icon: '📰', label: 'News' },
    { key: 'deck',     icon: '🎮', label: 'Deck' },
  ]

  return (
    <WidgetCard accent="purple" title="Steam" icon="🎮" onRefresh={refetch}>
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === tb.key ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{tb.icon}</span>
            <span className="hidden sm:inline">{tb.label}</span>
          </button>
        ))}
      </div>

      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">{t('error')}</p>}

      {/* Games list (new / top) */}
      {!loading && (tab === 'new' || tab === 'top') && gameItems && (
        <div className="space-y-1 max-h-[320px] overflow-y-auto scrollbar-hide">
          {gameItems.map((game, i) => (
            <a key={`${tab}-${game.id}`}
               href={`https://store.steampowered.com/app/${game.id}`}
               target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-white/4 transition-all group">
              <span className="text-[10px] text-slate-600 font-mono w-4 shrink-0">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-200 group-hover:text-white leading-snug line-clamp-1 transition-colors">{game.name}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {game.discountPercent > 0 && (
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">-{game.discountPercent}%</span>
                )}
                <span className="text-[11px] font-semibold text-white">
                  {game.finalPrice === '0.00' || game.finalPrice === 'Free' ? (lang === 'sk' ? 'Zadarmo' : 'Free') : `€${game.finalPrice}`}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Steam News */}
      {!loading && tab === 'news' && (
        <div className="space-y-1.5 max-h-[320px] overflow-y-auto scrollbar-hide">
          {(data?.newsItems ?? []).length === 0 && <p className="text-xs text-slate-500 text-center py-4">Žiadne novinky</p>}
          {(data?.newsItems ?? []).map((n, i) => (
            <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
               className="block rounded-xl p-2.5 bg-white/[0.02] border border-white/5 hover:border-purple-500/15 hover:bg-white/[0.04] transition-all group">
              <p className="text-[11px] font-medium text-slate-200 group-hover:text-white leading-snug line-clamp-2">{n.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-purple-400 font-semibold">{n.feedlabel}</span>
                {n.author && <span className="text-[9px] text-slate-600">by {n.author}</span>}
                <span className="text-[9px] text-slate-600 ml-auto">{timeAgo(n.date)}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Steam Deck Prices */}
      {!loading && tab === 'deck' && (
        <div className="space-y-2">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/15 p-3 text-center mb-2">
            <div className="text-2xl mb-1">🎮</div>
            <div className="text-[12px] font-bold text-white">Steam Deck</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Portable PC gaming by Valve</div>
          </div>
          {STEAM_DECK_CONFIGS.map((cfg, i) => (
            <a key={i} href={cfg.url} target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-between rounded-xl p-2.5 bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all group">
              <span className="text-[11px] text-slate-300 group-hover:text-white">{cfg.name}</span>
              <span className="text-[13px] font-bold text-indigo-300">{cfg.currency}{cfg.price}</span>
            </a>
          ))}
          <a href="https://store.steampowered.com/steamdeck" target="_blank" rel="noopener noreferrer"
             className="block text-center text-[10px] text-purple-400 hover:text-purple-300 mt-2 transition-colors">
            Kúpiť na store.steampowered.com ↗
          </a>
        </div>
      )}

      <p className="text-[10px] text-slate-600 mt-2">store.steampowered.com</p>
    </WidgetCard>
  )
}
