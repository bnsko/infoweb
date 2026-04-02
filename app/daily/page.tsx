'use client'
import PageShell from '@/components/PageShell'
import SectionLabel from '@/components/SectionLabel'
import DaySummaryWidget from '@/components/widgets/DaySummaryWidget'
import SunriseSunsetWidget from '@/components/widgets/SunriseSunsetWidget'
import FlashNewsWidget from '@/components/widgets/FlashNewsWidget'
import NamedayWidget from '@/components/widgets/NamedayWidget'
import EventsCombinedWidget from '@/components/widgets/EventsCombinedWidget'
import LunchMenuWidget from '@/components/widgets/LunchMenuWidget'
import RestaurantsWidget from '@/components/widgets/RestaurantsWidget'
import FoodDeliveryWidget from '@/components/widgets/FoodDeliveryWidget'
import RandomFactWidget from '@/components/widgets/RandomFactWidget'
import OnThisDayWidget from '@/components/widgets/OnThisDayWidget'
import YearsAgoWidget from '@/components/widgets/YearsAgoWidget'
import SlovakHistoryWidget from '@/components/widgets/SlovakHistoryWidget'
import TourismWidget from '@/components/widgets/TourismWidget'
import HotelWidget from '@/components/widgets/HotelWidget'
import SportSuggestionsWidget from '@/components/widgets/SportSuggestionsWidget'
import SteamWidget from '@/components/widgets/SteamWidget'
import WikiWidget from '@/components/widgets/WikiWidget'

export default function DailyPage() {
  return (
    <PageShell>
      {/* Deň */}
      <DaySummaryWidget />
      <SunriseSunsetWidget />
      <FlashNewsWidget />

      {/* Meno & udalosti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NamedayWidget />
        <RandomFactWidget />
      </div>

      {/* Čo robiť dnes */}
      <SectionLabel icon="🗓️" label="Udalosti & Čo robiť" />
      <EventsCombinedWidget />

      {/* Jedlo */}
      <SectionLabel icon="🍽️" label="Jedlo & Reštaurácie" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LunchMenuWidget />
        <FoodDeliveryWidget />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <RestaurantsWidget />
        <HotelWidget />
      </div>

      {/* Voľný čas */}
      <SectionLabel icon="🎮" label="Pauza & Záľuby" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SportSuggestionsWidget />
        <SteamWidget />
      </div>

      {/* Turizmus */}
      <SectionLabel icon="⛰️" label="Výlety & Turizmus" />
      <TourismWidget />

      {/* História */}
      <SectionLabel icon="📚" label="Tento deň v histórii" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OnThisDayWidget />
        <YearsAgoWidget />
      </div>
      <div className="mt-4">
        <SlovakHistoryWidget />
      </div>

      {/* Wikipedia */}
      <SectionLabel icon="🔭" label="Objavy" />
      <WikiWidget />
    </PageShell>
  )
}
