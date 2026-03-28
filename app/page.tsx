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
import MoonPhaseWidget from '@/components/widgets/MoonPhaseWidget'
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

        {/* Day summary + quick nav */}
        {isWidgetVisible('daysummary') && <DaySummaryWidget />}

        {/* Flash News - breaking news ticker */}
        {isWidgetVisible('flashnews') && <FlashNewsWidget />}

        {/* Stats bar + City Weather */}
        {isWidgetVisible('stats') && (
          <div id="sec-weather">
            <StatsWidget />
          </div>
        )}

        {/* Správy (full width) */}
        {isWidgetVisible('news') && (
          <div id="sec-news">
            <SectionLabel label={t('sec.news')} />
            <NewsFeedWidget />
          </div>
        )}

        {/* Zdravotné varovania */}
        {isWidgetVisible('politics') && (
          <div>
            <HealthAlertsWidget />
          </div>
        )}

        {/* Slovensko & Financie */}
        {isWidgetVisible('finance') && (
          <div id="sec-finance">
            <SectionLabel label={t('sec.finance')} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <NamedayWidget />
              <PopulationWidget />
              <CurrencyWidget />
              <CryptoWidget />
            </div>
            <div className="mt-4">
              <FinanceNewsWidget />
            </div>
          </div>
        )}

        {/* Doprava, Šport & Podujatia */}
        {isWidgetVisible('transport') && (
          <div id="sec-transport">
            <SectionLabel label={t('sec.transport')} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TrafficWidget />
              <FlightsWidget />
              <div className="md:col-span-2">
                <SportsWidget />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <EventsWidget />
              <JobsWidget />
            </div>
          </div>
        )}

        {/* Ceny & Nákupy */}
        {isWidgetVisible('prices') && (
          <div id="sec-prices">
            <SectionLabel label={t('sec.prices')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FuelPricesWidget />
              <GroceriesWidget />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <LotteryWidget />
              <DealsWidget />
            </div>
          </div>
        )}

        {/* Živé štatistiky (full width) */}
        {isWidgetVisible('counters') && (
          <div>
            <SectionLabel label={t('sec.counters')} />
            <CountersWidget />
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
            <SectionLabel label={lang === 'sk' ? 'Reštaurácie v okolí' : 'Nearby Restaurants'} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RestaurantsWidget />
            </div>
          </div>
        )}

        {/* Investície & Trhy */}
        {isWidgetVisible('invest') && (
          <div id="sec-invest">
            <SectionLabel label={lang === 'sk' ? '📈 Investície & Trhy' : '📈 Investments & Markets'} />
            <InvestmentWidget />
          </div>
        )}

        {/* AI & Tech */}
        {isWidgetVisible('ai') && (
          <div id="sec-ai">
            <SectionLabel label={lang === 'sk' ? '🤖 AI & Tech' : '🤖 AI & Tech'} />
            <AINewsWidget />
          </div>
        )}

        {/* GitHub, Moon, Clock, FearGreed, Energy */}
        {isWidgetVisible('extras') && (
          <div id="sec-extras">
            <SectionLabel label={lang === 'sk' ? '🔭 Štatistiky & Objavy' : '🔭 Stats & Extras'} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GitHubTrendingWidget />
              <MoonPhaseWidget />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FearGreedWidget />
              <EnergyWidget />
            </div>
            <div className="mt-4">
              <SpeedtestWidget />
            </div>
          </div>
        )}

        {/* História & Objavuj */}
        {isWidgetVisible('history') && (
          <div id="sec-history">
            <SectionLabel label={t('sec.history')} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <OnThisDayWidget />
              <WikiWidget />
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
