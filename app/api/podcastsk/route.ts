import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed)

  const podcasts = [
    { name: 'Dobré ráno', author: 'Denník N', category: 'Správy', rank: 1 },
    { name: 'Svet Medúzy', author: 'SME', category: 'Spoločnosť', rank: 2 },
    { name: 'Pravda je niekde tam', author: 'Braňo Závodský', category: 'Spravodajstvo', rank: 3 },
    { name: 'Tech_FM', author: 'RTVS', category: 'Technológie', rank: 4 },
    { name: 'Klik', author: 'Refresher', category: 'Rozhovory', rank: 5 },
    { name: 'CzechCrunch Daily', author: 'CzechCrunch', category: 'Biznis', rank: 6 },
    { name: 'Slovenské príbehy', author: 'Podcast.sk', category: 'Storytelling', rank: 7 },
    { name: '#slusnilud', author: 'Ľuboš Blaha', category: 'Politika', rank: 8 },
    { name: 'Za školou', author: 'O2', category: 'Vzdelávanie', rank: 9 },
    { name: 'Pod lampou', author: 'Denník N', category: 'Diskusia', rank: 10 },
    { name: 'Startup podcast', author: 'SAPIE', category: 'Startupy', rank: 11 },
    { name: 'Na telo', author: 'RTVS', category: 'Politika', rank: 12 },
  ]

  // Shuffle slightly based on day
  const shuffled = podcasts.map(p => ({
    ...p,
    rank: p.rank + Math.floor((rng() - 0.5) * 3),
    listeners: Math.floor(5000 + rng() * 50000),
  })).sort((a, b) => a.rank - b.rank)

  return NextResponse.json({ podcasts: shuffled, timestamp: Date.now() })
}
