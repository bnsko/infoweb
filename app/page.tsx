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
import EpicFreeWidget from '@/components/widgets/EpicFreeWidget'
import SportsWidget from '@/components/widgets/SportsWidget'
import RedditGlobalWidget from '@/components/widgets/RedditGlobalWidget'
import SlovakFactsWidget from '@/components/widgets/SlovakFactsWidget'
import TrafficWidget from '@/components/widgets/TrafficWidget'
import EventsWidget from '@/components/widgets/EventsWidget'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-root)' }}>
      <Header />

      <main className="max-w-[1680px] mx-auto px-4 pt-4 pb-10 space-y-5">

        {/* Stats bar */}
        <StatsWidget />

        {/* Weather (full width) */}
        <WeatherPanel />

        {/* Slovensko & Financie */}
        <div>
          <SectionLabel label="🇸🇰 Slovensko & Financie" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NamedayWidget />
            <PopulationWidget />
            <CurrencyWidget />
            <CryptoWidget />
          </div>
        </div>

        {/* Doprava & Šport & Podujatia */}
        <div>
          <SectionLabel label="🚗 Doprava, Šport & Podujatia" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TrafficWidget />
            <FlightsWidget />
            <SportsWidget />
            <EventsWidget />
          </div>
        </div>

        {/* Vesmír & Príroda */}
        <div>
          <SectionLabel label="🌍 Vesmír & Príroda" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SpaceEnvWidget />
            <EarthquakesWidget />
            <LaunchesWidget />
          </div>
        </div>

        {/* Zábava & Komunita */}
        <div>
          <SectionLabel label="🎮 Zábava & Komunita" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SteamWidget />
            <EpicFreeWidget />
            <RedditWidget />
            <RedditGlobalWidget />
          </div>
        </div>

        {/* Dnes & Slovensko */}
        <div>
          <SectionLabel label="📖 Dnes v histórii & Zaujímavosti" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OnThisDayWidget />
            <SlovakFactsWidget />
          </div>
        </div>

        {/* Správy (full width) */}
        <div>
          <SectionLabel label="📰 Správy z 18 odvetví" />
          <NewsFeedWidget />
        </div>

      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
        <p>
          InfoSK © {new Date().getFullYear()} · Dáta: OpenMeteo · ECB · CoinGecko · Steam · Epic · ESPN · SME · Aktuality · BBC · Reuters · Reddit · Waze · HackerNews · OpenSky · USGS · Launch Library 2 · Wikipedia + ďalšie
        </p>
        <p className="mt-1">Automatická obnova každých 30s–10 min. Všetky dáta sú verejne dostupné.</p>
        <a href="/admin" className="inline-block mt-2 text-slate-700 hover:text-slate-400 transition-colors text-[10px]">
          ⚙️ Admin
        </a>
      </footer>
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-sm font-semibold text-slate-400">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-white/8 to-transparent" />
    </div>
  )
}
