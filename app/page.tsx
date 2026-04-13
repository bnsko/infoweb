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
import FuelPricesWidget from '@/components/widgets/FuelPricesWidget'
import EnvironmentWidget from '@/components/widgets/EnvironmentWidget'
import ForestsFloodsWidget from '@/components/widgets/ForestsFloodsWidget'
import TourismWidget from '@/components/widgets/TourismWidget'
import NamedayWidget from '@/components/widgets/NamedayWidget'
import RandomFactWidget from '@/components/widgets/RandomFactWidget'
import LunchMenuWidget from '@/components/widgets/LunchMenuWidget'
import FoodDeliveryWidget from '@/components/widgets/FoodDeliveryWidget'
import RestaurantsWidget from '@/components/widgets/RestaurantsWidget'
import WikiWidget from '@/components/widgets/WikiWidget'

export default function HomePage() {
  return (
    <PageShell>
      {/* Prehľad dňa */}
      <DaySummaryWidget />
      <SunriseSunsetWidget />
      <FlashNewsWidget />

      {/* Meno dňa + zaujímavosť */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NamedayWidget />
        <RandomFactWidget />
      </div>

      {/* Sumarizácia */}
      <SectionLabel icon="📊" label="Prehľad & Zdravie" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryWidget />
        <HealthWidget />
      </div>

      {/* Správy */}
      <SectionLabel icon="📰" label="Správy" />
      <NewsFeedWidget />

      {/* Udalosti */}
      <SectionLabel icon="📅" label="Udalosti" />
      <EventsCombinedWidget />

      {/* Jedlo & Reštaurácie */}
      <SectionLabel icon="🍽️" label="Jedlo & Reštaurácie" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LunchMenuWidget />
        <FoodDeliveryWidget />
      </div>
      <div className="mt-4">
        <RestaurantsWidget />
      </div>

      {/* Doprava — palivá */}
      <SectionLabel icon="⛽" label="Ceny pohonných hmôt" />
      <FuelPricesWidget />

      {/* Prostredie & Turistika */}
      <SectionLabel icon="🌿" label="Prostredie & Turistika" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <EnvironmentWidget />
        <ForestsFloodsWidget />
        <TourismWidget />
      </div>

      {/* Wikipedia dňa */}
      <SectionLabel icon="📖" label="Wikipedia dňa" />
      <WikiWidget />
    </PageShell>
  )
}
