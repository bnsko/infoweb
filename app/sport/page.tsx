'use client'
import PageShell from '@/components/PageShell'
import SectionLabel from '@/components/SectionLabel'
import SportsWidget from '@/components/widgets/SportsWidget'
import LotteryWidget from '@/components/widgets/LotteryWidget'
import SportSuggestionsWidget from '@/components/widgets/SportSuggestionsWidget'

export default function SportPage() {
  return (
    <PageShell>
      {/* Zápasy & výsledky */}
      <SectionLabel icon="⚽" label="Zápasy & Výsledky" />
      <SportsWidget />

      {/* Pohyb & aktivity */}
      <SectionLabel icon="🏃" label="Pohybové aktivity" />
      <SportSuggestionsWidget />

      {/* Lotérie & výhry */}
      <SectionLabel icon="🎰" label="Lotérie & Žrebovanie" />
      <LotteryWidget />
    </PageShell>
  )
}
