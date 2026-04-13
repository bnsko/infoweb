'use client'
import PageShell from '@/components/PageShell'
import SectionLabel from '@/components/SectionLabel'
import NamedayWidget from '@/components/widgets/NamedayWidget'
import LunchMenuWidget from '@/components/widgets/LunchMenuWidget'
import RestaurantsWidget from '@/components/widgets/RestaurantsWidget'
import FoodDeliveryWidget from '@/components/widgets/FoodDeliveryWidget'
import HotelWidget from '@/components/widgets/HotelWidget'
import RandomFactWidget from '@/components/widgets/RandomFactWidget'
import TourismWidget from '@/components/widgets/TourismWidget'
import WikiWidget from '@/components/widgets/WikiWidget'

export default function DailyPage() {
  return (
    <PageShell>
      {/* Meno dňa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NamedayWidget />
        <RandomFactWidget />
      </div>

      {/* Jedlo & Reštaurácie — podľa polohy */}
      <SectionLabel icon="🍽️" label="Jedlo & Reštaurácie" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LunchMenuWidget />
        <FoodDeliveryWidget />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <RestaurantsWidget />
        <HotelWidget />
      </div>

      {/* Výlety & turistika */}
      <SectionLabel icon="🏔️" label="Výlety & Turistika" />
      <TourismWidget />

      {/* Wikipedia */}
      <SectionLabel icon="📖" label="Wikipedia dňa" />
      <WikiWidget />
    </PageShell>
  )
}

