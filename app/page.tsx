'use client'

import Header from '@/components/Header'
import StatsWidget from '@/components/widgets/StatsWidget'
import NewsFeedWidget from '@/components/widgets/NewsFeedWidget'
import RedditWidget from '@/components/widgets/RedditWidget'
import OnThisDayWidget from '@/components/widgets/OnThisDayWidget'
import CurrencyWidget from '@/components/widgets/CurrencyWidget'
import CryptoWidget from '@/components/widgets/CryptoWidget'
import FlightsWidget from '@/components/widgets/FlightsWidget'
import SpaceEnvWidget from '@/components/widgets/SpaceEnvWidget'
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
import RestaurantsWidget from '@/components/widgets/RestaurantsWidget'
import HackerNewsWidget from '@/components/widgets/HackerNewsWidget'
import TwitterWidget from '@/components/widgets/TwitterWidget'
import FuelPricesWidget from '@/components/widgets/FuelPricesWidget'
import GroceriesWidget from '@/components/widgets/GroceriesWidget'
import AINewsWidget from '@/components/widgets/AINewsWidget'
import FinanceNewsWidget from '@/components/widgets/FinanceNewsWidget'
import DaySummaryWidget from '@/components/widgets/DaySummaryWidget'
import GitHubTrendingWidget from '@/components/widgets/GitHubTrendingWidget'
import FearGreedWidget from '@/components/widgets/FearGreedWidget'
import EnergyWidget from '@/components/widgets/EnergyWidget'
import InvestmentWidget from '@/components/widgets/InvestmentWidget'
import FlashNewsWidget from '@/components/widgets/FlashNewsWidget'
import LotteryWidget from '@/components/widgets/LotteryWidget'
import HealthAlertsWidget from '@/components/widgets/HealthAlertsWidget'
import JobsWidget from '@/components/widgets/JobsWidget'
import DealsWidget from '@/components/widgets/DealsWidget'
import PodcastWidget from '@/components/widgets/PodcastWidget'
import ViralVideosWidget from '@/components/widgets/ViralVideosWidget'
import SpeedtestWidget from '@/components/widgets/SpeedtestWidget'
import OfficeWaitWidget from '@/components/widgets/OfficeWaitWidget'
import InflationWidget from '@/components/widgets/InflationWidget'
import SportSuggestionsWidget from '@/components/widgets/SportSuggestionsWidget'
import DailyQuoteWidget from '@/components/widgets/DailyQuoteWidget'
import MHDWidget from '@/components/widgets/MHDWidget'
import SettingsPanel from '@/components/SettingsPanel'
import { useLang } from '@/hooks/useLang'
import { usePrefs } from '@/hooks/usePrefs'

export default function Home() {
  const { t, lang } = useLang()
  const { isWidgetVisible } = usePrefs()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-root)', backgroundImage: 'var(--theme-bg-image, none)' }}>
      <Header />

      <main className="max-w-[1680px] mx-auto px-4 pt-4 pb-10 space-y-6">

        {/* Day summary + quick nav + speedtest */}
        {isWidgetVisible('daysummary') && (
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <div className="flex-1 w-full"><DaySummaryWidget /></div>
            <SpeedtestWidget />
          </div>
        )}

        {/* Flash News - breaking news ticker */}
        {isWidgetVisible('flashnews') && <FlashNewsWidget />}

        {/* Stats bar + City Weather (Moon & Sky popup is inside) */}
        {isWidgetVisible('stats') && (
          <div id="sec-weather">
            <StatsWidget />
          </div>
        )}

        {/* Denný citát & Fakt */}
        {isWidgetVisible('extras') && <DailyQuoteWidget />}

        {/* Správy (full width) */}
        {isWidgetVisible('news') && (
          <div id="sec-news">
            <SectionLabel label={t('sec.news')} />
            <NewsFeedWidget />
          </div>
        )}

        {/* ── SLOVENSKO ── */}
        {isWidgetVisible('slovensko') && (
          <div id="sec-slovensko">
            <SectionLabel label={lang === 'sk' ? '🇸🇰 Slovensko' : '🇸🇰 Slovakia'} />

            {/* Health alerts */}
            <HealthAlertsWidget />

            {/* Transport & Flights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <TrafficWidget />
              <FlightsWidget />
              <MHDWidget />
              <OfficeWaitWidget />
            </div>

            {/* Events, Jobs, Sport suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <EventsWidget />
              <JobsWidget />
              <SportSuggestionsWidget />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FuelPricesWidget />
              <GroceriesWidget />
            </div>

            {/* Lottery, Deals, Nameday, Population */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <LotteryWidget />
              <DealsWidget />
              <NamedayWidget />
              <PopulationWidget />
            </div>

            {/* Sports */}
            <div className="mt-4">
              <SportsWidget />
            </div>
          </div>
        )}

        {/* ── FINANCIE ── */}
        {isWidgetVisible('financie') && (
          <div id="sec-financie">
            <SectionLabel label={lang === 'sk' ? '💶 Financie' : '💶 Finance'} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CurrencyWidget />
              <CryptoWidget />
              <FearGreedWidget />
              <InflationWidget />
            </div>
            <div className="mt-4">
              <FinanceNewsWidget />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InvestmentWidget />
              <EnergyWidget />
            </div>
            <div className="mt-4">
              <CountersWidget />
            </div>
          </div>
        )}

        {/* Vesmír & Rakety */}
        {isWidgetVisible('space') && (
          <div id="sec-space">
            <SectionLabel label={t('sec.space')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SpaceEnvWidget />
              <LaunchesWidget />
            </div>
          </div>
        )}

        {/* Zábava & Komunita */}
        {isWidgetVisible('fun') && (
          <div id="sec-fun">
            <SectionLabel label={t('sec.fun')} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SteamWidget />
              <RedditWidget />
              <RedditGlobalWidget />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <TwitterWidget />
              <HackerNewsWidget />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <PodcastWidget />
              <ViralVideosWidget />
            </div>
          </div>
        )}

        {/* Reštaurácie */}
        {isWidgetVisible('restaurants') && (
          <div id="sec-restaurants">
            <SectionLabel label={lang === 'sk' ? '🍽️ Reštaurácie' : '🍽️ Restaurants'} />
            <RestaurantsWidget />
          </div>
        )}

        {/* AI & Tech */}
        {isWidgetVisible('ai') && (
          <div id="sec-ai">
            <SectionLabel label={lang === 'sk' ? '🤖 AI & Tech' : '🤖 AI & Tech'} />
            <AINewsWidget />
          </div>
        )}

        {/* Objavy & GitHub */}
        {isWidgetVisible('extras') && (
          <div id="sec-extras">
            <SectionLabel label={lang === 'sk' ? '🔭 Objavy' : '🔭 Discover'} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GitHubTrendingWidget />
              <WikiWidget />
            </div>
          </div>
        )}

        {/* História */}
        {isWidgetVisible('history') && (
          <div id="sec-history">
            <SectionLabel label={t('sec.history')} />
            <OnThisDayWidget />
          </div>
        )}

      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
        <p>
          Slovakia Info © {new Date().getFullYear()} · Dáta: OpenMeteo · ECB · CoinGecko · Steam · ESPN · SME · Aktuality · TASR · Pravda · BBC · Reuters · Reddit · Waze · OpenSky · Launch Library 2 · Wikimedia · CNBC · AP + ďalšie
        </p>
        <p className="mt-1">{t('footer.auto')}</p>
      </footer>

      <SettingsPanel />
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
