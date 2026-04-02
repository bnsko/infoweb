'use client'
import PageShell from '@/components/PageShell'
import SectionLabel from '@/components/SectionLabel'
import DaySummaryWidget from '@/components/widgets/DaySummaryWidget'
import SunriseSunsetWidget from '@/components/widgets/SunriseSunsetWidget'
import FlashNewsWidget from '@/components/widgets/FlashNewsWidget'
import SummaryWidget from '@/components/widgets/SummaryWidget'
import HealthWidget from '@/components/widgets/HealthWidget'
import NewsFeedWidget from '@/components/widgets/NewsFeedWidget'
import EventsCombinedWidget from '@/components/widgets/EventsCombinedWidget'
import SportsWidget from '@/components/widgets/SportsWidget'
import CurrencyWidget from '@/components/widgets/CurrencyWidget'
import CryptoWidget from '@/components/widgets/CryptoWidget'
import FearGreedWidget from '@/components/widgets/FearGreedWidget'
import InflationWidget from '@/components/widgets/InflationWidget'
import EnvironmentWidget from '@/components/widgets/EnvironmentWidget'
import FuelPricesWidget from '@/components/widgets/FuelPricesWidget'
import TrendingSearchesWidget from '@/components/widgets/TrendingSearchesWidget'
import AINewsWidget from '@/components/widgets/AINewsWidget'
import RandomFactWidget from '@/components/widgets/RandomFactWidget'

export default function HomePage() {
  return (
    <PageShell>
      <DaySummaryWidget />
      <SunriseSunsetWidget />
      <FlashNewsWidget />

      <SectionLabel icon="🌤️" label="Počasie & Zdravie" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryWidget />
        <HealthWidget />
      </div>

      <SectionLabel icon="📰" label="Správy" />
      <NewsFeedWidget />

      <SectionLabel icon="📅" label="Udalosti" />
      <EventsCombinedWidget />

      <SectionLabel icon="⚽" label="Šport" />
      <SportsWidget />

      <SectionLabel icon="💶" label="Financie & Trhy" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CurrencyWidget />
        <CryptoWidget />
        <FearGreedWidget />
        <InflationWidget />
      </div>

      <SectionLabel icon="🌿" label="Prostredie & Palivo" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EnvironmentWidget />
        <FuelPricesWidget />
      </div>

      <SectionLabel icon="🔍" label="Čo ľudia hľadajú" />
      <TrendingSearchesWidget />

      <SectionLabel icon="🤖" label="AI & Tech správy" />
      <AINewsWidget />

      <SectionLabel icon="💡" label="Zaujímavosť dňa" />
      <RandomFactWidget />
    </PageShell>
  )
}
