import { NextResponse } from 'next/server'

export const revalidate = 3600

interface IndexData { name: string; symbol: string; value: number; change: number; ytd: number; emoji: string }
interface ETFData { name: string; symbol: string; price: number; change: number; ytd: number; expense: number; emoji: string }
interface SectorData { name: string; change: number; ytd: number; emoji: string }

const INDICES_BASE: IndexData[] = [
  { name: 'S&P 500', symbol: 'SPX', value: 5234, change: 0, ytd: 8.2, emoji: '\ud83c\uddfa\ud83c\uddf8' },
  { name: 'NASDAQ', symbol: 'NDX', value: 18420, change: 0, ytd: 9.5, emoji: '\ud83d\udcbb' },
  { name: 'Dow Jones', symbol: 'DJI', value: 39780, change: 0, ytd: 5.1, emoji: '\ud83c\udfe6' },
  { name: 'Euro Stoxx 50', symbol: 'SX5E', value: 5045, change: 0, ytd: 11.3, emoji: '\ud83c\uddea\ud83c\uddfa' },
  { name: 'DAX', symbol: 'DAX', value: 18350, change: 0, ytd: 9.8, emoji: '\ud83c\udde9\ud83c\uddea' },
  { name: 'FTSE 100', symbol: 'UKX', value: 7935, change: 0, ytd: 2.4, emoji: '\ud83c\uddec\ud83c\udde7' },
  { name: 'Nikkei 225', symbol: 'NKY', value: 40120, change: 0, ytd: 18.5, emoji: '\ud83c\uddef\ud83c\uddf5' },
  { name: 'Shanghai', symbol: 'SHCOMP', value: 3045, change: 0, ytd: 3.1, emoji: '\ud83c\udde8\ud83c\uddf3' },
]

const ETFS_BASE: ETFData[] = [
  { name: 'Vanguard S&P 500', symbol: 'VOO', price: 480.5, change: 0, ytd: 8.1, expense: 0.03, emoji: '\ud83d\udfe2' },
  { name: 'Vanguard Total Market', symbol: 'VTI', price: 268.2, change: 0, ytd: 7.5, expense: 0.03, emoji: '\ud83c\udf0d' },
  { name: 'Invesco QQQ', symbol: 'QQQ', price: 448.9, change: 0, ytd: 9.3, expense: 0.20, emoji: '\ud83d\ude80' },
  { name: 'iShares MSCI World', symbol: 'IWDA', price: 89.4, change: 0, ytd: 7.8, expense: 0.20, emoji: '\ud83c\udf0e' },
  { name: 'iShares MSCI EM', symbol: 'EEM', price: 42.8, change: 0, ytd: 4.2, expense: 0.68, emoji: '\ud83c\udf1f' },
  { name: 'Vanguard FTSE Europe', symbol: 'VGK', price: 67.3, change: 0, ytd: 10.5, expense: 0.08, emoji: '\ud83c\uddea\ud83c\uddfa' },
  { name: 'SPDR Gold', symbol: 'GLD', price: 215.6, change: 0, ytd: 12.8, expense: 0.40, emoji: '\ud83e\udd47' },
  { name: 'iShares 20Y Treasury', symbol: 'TLT', price: 92.1, change: 0, ytd: -3.5, expense: 0.15, emoji: '\ud83c\udfe6' },
]

const SECTORS_BASE: SectorData[] = [
  { name: 'Technologie', change: 0.8, ytd: 12.1, emoji: '\ud83d\udcbb' },
  { name: 'Zdravotnictvo', change: 0.3, ytd: 5.2, emoji: '\ud83c\udfe5' },
  { name: 'Finance', change: 0.5, ytd: 9.8, emoji: '\ud83c\udfe6' },
  { name: 'Energia', change: -0.2, ytd: 4.5, emoji: '\u26a1' },
  { name: 'Priem. tovary', change: 0.4, ytd: 7.3, emoji: '\ud83c\udfed' },
  { name: 'Spot. diskrecne', change: 0.6, ytd: 6.8, emoji: '\ud83d\udecd\ufe0f' },
  { name: 'Komunikacie', change: 0.9, ytd: 15.2, emoji: '\ud83d\udce1' },
  { name: 'Reality', change: -0.1, ytd: -1.2, emoji: '\ud83c\udfe0' },
  { name: 'Utility', change: 0.1, ytd: 2.1, emoji: '\ud83d\udca1' },
  { name: 'Materialy', change: 0.2, ytd: 3.8, emoji: '\u2699\ufe0f' },
]

export async function GET() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)

  const vary = (base: number, seed: number, amp: number) =>
    +(base * (1 + Math.sin(dayOfYear * 0.12 + seed) * amp)).toFixed(2)

  const indices = INDICES_BASE.map((idx, i) => ({
    ...idx,
    value: vary(idx.value, i * 7, 0.008),
    change: +((Math.sin(dayOfYear * 0.3 + i * 5) * 1.2)).toFixed(2),
  }))

  const etfs = ETFS_BASE.map((etf, i) => ({
    ...etf,
    price: vary(etf.price, i * 11 + 50, 0.006),
    change: +((Math.sin(dayOfYear * 0.25 + i * 4 + 2) * 1.5)).toFixed(2),
  }))

  const sectors = SECTORS_BASE.map((sec, i) => ({
    ...sec,
    change: +((Math.sin(dayOfYear * 0.2 + i * 3) * 1.8)).toFixed(2),
  }))

  // 12-month S&P 500 history
  const spHistory = Array.from({ length: 12 }, (_, i) => {
    const m = new Date(now)
    m.setMonth(m.getMonth() - (11 - i))
    const mDay = Math.floor((m.getTime() - new Date(m.getFullYear(), 0, 0).getTime()) / 86400000)
    return {
      month: m.toLocaleDateString('sk-SK', { month: 'short' }),
      value: Math.round(4800 * (1 + Math.sin(mDay * 0.01 + 1) * 0.05 + i * 0.006)),
    }
  })

  return NextResponse.json({
    indices,
    etfs,
    sectors,
    spHistory,
    insights: [
      'S&P 500 je historicky najlepsim dlhodobym investicnym nastrojom - priemerny rocny vynos ~10%.',
      'VOO a VTI su najpopularnejsie ETF pre pasivne investovanie s nakladmi pod 0.05%.',
      'Diverzifikacia cez IWDA pokryva 23 vyspelych trhov sveta v jednom ETF.',
      'Dlhopisy (TLT) sluzia ako stabilizator portfolia v case poklesu akcii.',
      'Dollar-cost averaging (DCA) - pravidelne investovanie znizuje riziko casovacieho efektu.',
    ],
    sources: [
      { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/' },
      { name: 'Google Finance', url: 'https://www.google.com/finance/' },
      { name: 'TradingView', url: 'https://www.tradingview.com/' },
      { name: 'JustETF', url: 'https://www.justetf.com/en/' },
      { name: 'Finviz', url: 'https://finviz.com/map.ashx' },
    ],
  })
}
