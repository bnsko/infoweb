'use client'

import Header from '@/components/Header'
import StatsWidget from '@/components/widgets/StatsWidget'
import NewsFeedWidget from '@/components/widgets/NewsFeedWidget'
import RedditWidget from '@/components/widgets/RedditWidget'
import OnThisDayWidget from '@/components/widgets/OnThisDayWidget'
import CurrencyWidget from '@/components/widgets/CurrencyWidget'
import CryptoWidget from '@/components/widgets/CryptoWidget'
// FlightsWidget moved to DaySummary panel
// SpaceEnvWidget & LaunchesWidget moved to DaySummary panel
import NamedayWidget from '@/components/widgets/NamedayWidget'
// PopulationWidget moved to Header stats popup
import SteamWidget from '@/components/widgets/SteamWidget'
import SportsWidget from '@/components/widgets/SportsWidget'
import RedditGlobalWidget from '@/components/widgets/RedditGlobalWidget'
import EventsWidget from '@/components/widgets/EventsWidget'
// CountersWidget moved to Header stats popup
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
// LotteryWidget & DealsWidget moved to DaySummary panel
import PodcastWidget from '@/components/widgets/PodcastWidget'
import SpeedtestWidget from '@/components/widgets/SpeedtestWidget'
import SlovakHistoryWidget from '@/components/widgets/SlovakHistoryWidget'
import YearsAgoWidget from '@/components/widgets/YearsAgoWidget'
import HistoryNumbersWidget from '@/components/widgets/HistoryNumbersWidget'
// OfficeWaitWidget moved to DaySummary panel
import InflationWidget from '@/components/widgets/InflationWidget'
import SportSuggestionsWidget from '@/components/widgets/SportSuggestionsWidget'
// MHDWidget moved to DaySummary panel
// ToolOfTheDayWidget removed
import WebcamsWidget from '@/components/widgets/WebcamsWidget'
// TrainDelaysWidget moved to DaySummary panel
// OutagesWidget moved to SummaryWidget
import HighwayCamsWidget from '@/components/widgets/HighwayCamsWidget'
import MortgagesWidget from '@/components/widgets/MortgagesWidget'
import TrendingSearchesWidget from '@/components/widgets/TrendingSearchesWidget'
import StreamingWidget from '@/components/widgets/StreamingWidget'
import RandomFactWidget from '@/components/widgets/RandomFactWidget'
import EnvironmentWidget from '@/components/widgets/EnvironmentWidget'
import SummaryWidget from '@/components/widgets/SummaryWidget'
import HealthWidget from '@/components/widgets/HealthWidget'
import JobMarketWidget from '@/components/widgets/JobMarketWidget'
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

        {/* Day summary */}
        {isWidgetVisible('daysummary') && <DaySummaryWidget />}

        {/* Flash News - breaking news ticker */}
        {isWidgetVisible('flashnews') && <FlashNewsWidget />}

        {/* Stats bar + Summary + Health widgets */}
        {isWidgetVisible('stats') && (
          <div id="sec-weather" className="space-y-4">
            <StatsWidget />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SummaryWidget />
              <HealthWidget />
            </div>
          </div>
        )}

        {/* Denný citát & Fakt - now rendered as mini widgets in DaySummary */}

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

            {/* Events, Sport suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <EventsWidget />
              <SportSuggestionsWidget />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FuelPricesWidget />
              <GroceriesWidget />
            </div>

            {/* Highway cams + Webcams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <HighwayCamsWidget />
              <WebcamsWidget />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FinanceNewsWidget />
              <InvestmentWidget />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <EnergyWidget />
              <MortgagesWidget />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <JobMarketWidget />
            </div>

          </div>
        )}

        {/* Vesmír & Rakety — now embedded in DaySummary panel */}

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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <StreamingWidget />
              <TrendingSearchesWidget />
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
              <RandomFactWidget />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <GitHubTrendingWidget />
            </div>
            <div className="mt-4">
              <WikiWidget />
            </div>
          </div>
        )}

        {/* História */}
        {isWidgetVisible('history') && (
          <div id="sec-history">
            <SectionLabel label={t('sec.history')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <OnThisDayWidget />
              <YearsAgoWidget />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SlovakHistoryWidget />
              <HistoryNumbersWidget />
            </div>
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
