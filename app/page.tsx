'use client'

import Header from '@/components/Header'
import StatsWidget from '@/components/widgets/StatsWidget'
import WeatherPanel from '@/components/widgets/WeatherPanel'
import NewsFeedWidget from '@/components/widgets/NewsFeedWidget'
import RedditWidget from '@/components/widgets/RedditWidget'
import OnThisDayWidget from '@/components/widgets/OnThisDayWidget'
import CurrencyWidget from '@/components/widgets/CurrencyWidget'
import CryptoWidget from '@/components/widgets/CryptoWidget'
import FlightsWidget from '@/components/widgets/FlightsWidget'
import SpaceEnvWidget from '@/components/widgets/SpaceEnvWidget'
import EarthquakesWidget from '@/components/widgets/EarthquakesWidget'
import LaunchesWidget from '@/components/widgets/LaunchesWidget'
import NamedayWidget from '@/components/widgets/NamedayWidget'
import PopulationWidget from '@/components/widgets/PopulationWidget'
import SteamWidget from '@/components/widgets/SteamWidget'
import SportsWidget from '@/components/widgets/SportsWidget'
import RedditGlobalWidget from '@/components/widgets/RedditGlobalWidget'
import TrafficWidget from '@/components/widgets/TrafficWidget'
import EventsWidget from '@/components/widgets/EventsWidget'
import CountersWidget from '@/components/widgets/CountersWidget'
import WikiWidget from '@/components/widgets/WikiWidget'
import RealEstateWidget from '@/components/widgets/RealEstateWidget'
import RestaurantsWidget from '@/components/widgets/RestaurantsWidget'
import SlovakCultureWidget from '@/components/widgets/SlovakCultureWidget'
import { useLang } from '@/hooks/useLang'

export default function Home() {
  const { t } = useLang()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-root)', backgroundImage: 'var(--theme-bg-image, none)' }}>
      <Header />

      <main className="max-w-[1680px] mx-auto px-4 pt-4 pb-10 space-y-6">

        {/* Stats bar */}
        <StatsWidget />

        {/* Weather (full width) */}
        <WeatherPanel />

        {/* Správy (full width) - under weather */}
        <div>
          <SectionLabel label={t('sec.news')} />
          <NewsFeedWidget />
        </div>

        {/* Slovensko & Financie */}
        <div>
          <SectionLabel label={t('sec.finance')} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NamedayWidget />
            <PopulationWidget />
            <CurrencyWidget />
            <CryptoWidget />
          </div>
        </div>

        {/* Doprava & Šport & Podujatia */}
        <div>
          <SectionLabel label={t('sec.transport')} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TrafficWidget />
            <FlightsWidget />
            <SportsWidget />
            <EventsWidget />
          </div>
        </div>

        {/* Vesmír, ISS & Prírodné javy */}
        <div>
          <SectionLabel label={t('sec.space')} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SpaceEnvWidget />
            <div className="space-y-4">
              <EarthquakesWidget />
              <LaunchesWidget />
            </div>
            <CountersWidget />
          </div>
        </div>

        {/* Zábava & Komunita */}
        <div>
          <SectionLabel label={t('sec.fun')} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SteamWidget />
            <RedditWidget />
            <RedditGlobalWidget />
          </div>
        </div>

        {/* Nehnuteľnosti & Reštaurácie */}
        <div>
          <SectionLabel label={t('sec.realestate')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RealEstateWidget />
            <RestaurantsWidget />
          </div>
        </div>

        {/* Dnes v histórii & Slovensko & Wiki */}
        <div>
          <SectionLabel label={t('sec.history')} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <OnThisDayWidget />
            <SlovakCultureWidget />
            <WikiWidget />
          </div>
        </div>

      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
        <p>
          InfoSK © {new Date().getFullYear()} · Dáta: OpenMeteo · ECB · CoinGecko · Steam · ESPN · SME · Aktuality · BBC · Reuters · Reddit · Waze · OpenSky · USGS · Launch Library 2 · Wikimedia + ďalšie
        </p>
        <p className="mt-1">{t('footer.auto')}</p>
      </footer>
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-2">
      <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--color-faint)' }}>{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
    </div>
  )
}
