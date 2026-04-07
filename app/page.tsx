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
import FuelPricesWidget from '@/components/widgets/FuelPricesWidget'
import EnvironmentWidget from '@/components/widgets/EnvironmentWidget'
import ForestsFloodsWidget from '@/components/widgets/ForestsFloodsWidget'
import TourismWidget from '@/components/widgets/TourismWidget'

export default function HomePage() {
  return (
    <PageShell>
      <DaySummaryWidget />
      <SunriseSunsetWidget />
      <FlashNewsWidget />

      <SectionLabel icon="📊" label="Sumarizácia" />
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

      <SectionLabel icon="⛽" label="Ceny pohonných hmôt" />
      <FuelPricesWidget />

      <SectionLabel icon="🌿" label="Prostredie & Turistika" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <EnvironmentWidget />
        <ForestsFloodsWidget />
        <TourismWidget />
      </div>
    </PageShell>
  )
}

