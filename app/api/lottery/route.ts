import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface LotteryResult {
  game: string
  date: string
  numbers: number[]
  bonus?: number[]
  jackpot: string
  drawn: boolean
}

async function fetchTiposPage(): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []
  
  try {
    // Fetch Tipos.sk main page for latest results
    const res = await fetch('https://www.tipos.sk/api/v2/results/latest', {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const data = await res.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (Array.isArray(data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const item of data.slice(0, 6) as any[]) {
          results.push({
            game: item.gameName ?? item.name ?? 'Lotéria',
            date: item.drawDate ?? item.date ?? '',
            numbers: item.drawnNumbers ?? item.numbers ?? [],
            bonus: item.bonusNumbers ?? item.additionalNumbers ?? [],
            jackpot: item.jackpot ? `€${(item.jackpot / 100).toLocaleString('sk-SK')}` : '',
            drawn: true,
          })
        }
      }
    }
  } catch { /* fallback below */ }

  // Fallback: scrape HTML if API doesn't work
  if (results.length === 0) {
    try {
      const html = await fetch('https://www.tipos.sk/vysledky-zirebovani', {
        cache: 'no-store',
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(8000),
      }).then(r => r.text())

      // Parse Loto, Eurojackpot, Keno from HTML
      const games = [
        { name: 'Loto 5 z 35', pattern: /Loto[\s\S]*?(\d+[\s,]+\d+[\s,]+\d+[\s,]+\d+[\s,]+\d+)/ },
        { name: 'Eurojackpot', pattern: /Eurojackpot[\s\S]*?(\d+[\s,]+\d+[\s,]+\d+[\s,]+\d+[\s,]+\d+)/ },
        { name: 'Šanca', pattern: /[ŠS]anca[\s\S]*?(\d+[\s,]+\d+[\s,]+\d+[\s,]+\d+[\s,]+\d+[\s,]+\d+)/ },
      ]
      for (const game of games) {
        const match = html.match(game.pattern)
        if (match?.[1]) {
          const nums = match[1].match(/\d+/g)?.map(Number) ?? []
          if (nums.length >= 5) {
            results.push({ game: game.name, date: new Date().toISOString().slice(0, 10), numbers: nums, jackpot: '', drawn: true })
          }
        }
      }

      // Try to find jackpot amounts
      const jackpotMatch = html.match(/jackpot[\s\S]*?([\d\s,.]+)\s*€/i)
      if (jackpotMatch && results.length > 0) {
        results[0].jackpot = `€${jackpotMatch[1].trim()}`
      }
    } catch { /* ignore */ }
  }

  // If still nothing, provide static structure with placeholder
  if (results.length === 0) {
    results.push(
      { game: 'Loto 5 z 35', date: '', numbers: [], jackpot: '', drawn: false },
      { game: 'Eurojackpot', date: '', numbers: [], jackpot: '', drawn: false },
    )
  }

  return results
}

export async function GET() {
  const results = await fetchTiposPage()
  return NextResponse.json({ results, timestamp: Date.now() })
}
