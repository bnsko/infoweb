# 🇸🇰 Slovakia Info Dashboard

A comprehensive, real-time information dashboard focused on Slovakia. Built with Next.js 14, React 18, TypeScript and Tailwind CSS. Aggregates data from 70+ API sources into 40+ interactive widgets covering weather, news, finance, sports, traffic, history, entertainment, and more.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss)

---

## Features

### 🌤️ Weather & Environment
- **StatsWidget** — Real-time weather for 8 Slovak cities (temperature, feels-like, wind, humidity, air quality AQI), sunrise/sunset, multi-city grid with detail popups
- **HealthAlertsWidget** — Active health warnings and alerts for Slovakia

### 📰 News & Media
- **NewsFeedWidget** — Aggregated Slovak news from SME, Aktuality, TASR, Pravda, Dennik N
- **FlashNewsWidget** — Breaking news ticker with 15-minute freshness filter, auto-translated to Slovak
- **AINewsWidget** — AI & technology news aggregation
- **FinanceNewsWidget** — Financial and economic news
- **HackerNewsWidget** — Top stories from Hacker News
- **TwitterWidget** — Trending topics and tweets
- **PodcastWidget** — Slovak podcast episodes from major shows (Dobré ráno, Index, SME Svet, Startitup, etc.)

### 🇸🇰 Slovakia
- **TrafficWidget** — Split view: traffic incidents (left) + road restrictions & speed cameras (right), 14 known Slovak speed camera locations
- **FlightsWidget** — Live flights over Slovakia via OpenSky
- **MHDWidget** — Public transport information
- **OfficeWaitWidget** — Government office wait times
- **EventsWidget** — Upcoming events in Slovak cities
- **JobsWidget** — Job listings
- **SportSuggestionsWidget** — Outdoor activity suggestions
- **FuelPricesWidget** — Current fuel prices across Slovakia
- **GroceriesWidget** — Grocery price tracking
- **LotteryWidget** — Results for 6 Slovak lottery games (Loto, Joker, Eurojackpot, Keno 10, Šťastných 10, Euromilióny)
- **DealsWidget** — Current deals and promotions
- **NamedayWidget** — Slovak nameday calendar ("Dnes má meniny...")
- **PopulationWidget** — Slovak population counter with live estimates
- **SportsWidget** — Live sports, results, and upcoming matches with clear LIVE/Results/Upcoming separation
- **RestaurantsWidget** — Restaurant recommendations by city with cuisine-based emoji avatars

### 💶 Finance
- **CurrencyWidget** — Live EUR exchange rates from ECB
- **CryptoWidget** — Cryptocurrency prices from CoinGecko
- **FearGreedWidget** — Crypto Fear & Greed Index
- **InflationWidget** — Slovak and EU inflation data
- **InvestmentWidget** — Investment insights
- **EnergyWidget** — Energy prices and data
- **CountersWidget** — Global economic counters (debt, gold, oil)

### 🎮 Entertainment & Community
- **SteamWidget** — Most played Steam games
- **RedditWidget** — Slovak Reddit (r/Slovakia) posts
- **RedditGlobalWidget** — Global trending Reddit posts
- **TwitterWidget** — Trending Twitter content

### 📚 History
- **OnThisDayWidget** — Wikipedia "on this day" events, births, deaths with tabs, year-ago labels
- **YearsAgoWidget** — "Pred X rokmi" — what happened 5, 10, 25, 50, 100+ years ago today
- **SlovakHistoryWidget** — Interactive Slovak history timeline (623 AD – 2009) with era filtering
- **HistoryNumbersWidget** — Today in numbers: day of year, season, moon phase, daylight hours, seconds elapsed

### 🔭 Discovery
- **GitHubTrendingWidget** — Trending GitHub repositories
- **WikiWidget** — Top Wikipedia articles by views (SK/EN)

### 📊 Dashboard Features
- **DaySummaryWidget** — Master control bar: live clock, nameday, horoscope, ISS passes, meteor showers, aurora alerts, quick navigation, visitor stats (online / today / unique / total)
- **SpeedtestWidget** — Internet speed test with animated SVG gauges (download/upload/ping), sparkline history charts
- **SettingsPanel** — Widget visibility toggles, theme selection, language switching (SK/EN)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| UI | [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| Data Fetching | Next.js API Routes (72 endpoints) + `useWidget` custom hook |
| Visitor Tracking | [Upstash Redis](https://upstash.com/) (Vercel KV) |
| XML Parsing | [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) |
| Date Utils | [date-fns](https://date-fns.org/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## Project Structure

```
infoweb2/
├── app/
│   ├── page.tsx                 # Main dashboard layout (sections & widget grid)
│   ├── admin/page.tsx           # Admin panel
│   ├── layout.tsx               # Root layout
│   └── api/                     # 72 API route handlers
│       ├── visitors/route.ts    #   Upstash Redis visitor tracking
│       ├── weather/route.ts     #   OpenMeteo weather data
│       ├── news/route.ts        #   Slovak news aggregation
│       ├── traffic/route.ts     #   Traffic incidents + restrictions
│       ├── lottery/route.ts     #   Lottery results scraping
│       ├── sports/route.ts      #   Live sports data
│       ├── onthisday/route.ts   #   Wikipedia on-this-day
│       ├── yearsago/route.ts    #   Historical milestones
│       └── ...                  #   60+ more endpoints
├── components/
│   ├── Header.tsx               # Dashboard header
│   ├── SettingsPanel.tsx        # Settings sidebar
│   ├── Providers.tsx            # Context providers
│   ├── ui/                      # Reusable UI components
│   │   ├── WidgetCard.tsx       #   Standard widget wrapper
│   │   ├── WidgetError.tsx      #   Error state display
│   │   └── SkeletonRows.tsx     #   Loading skeleton
│   └── widgets/                 # 49 widget components
│       ├── DaySummaryWidget.tsx  #   Master dashboard bar
│       ├── StatsWidget.tsx       #   Weather for 8 cities
│       ├── SportsWidget/         #   LIVE/Results/Upcoming sports
│       ├── TrafficWidget.tsx     #   Incidents + restrictions
│       └── ...                   #   45+ more widgets
├── hooks/
│   ├── useWidget.ts             # Generic data-fetching hook with auto-refresh
│   ├── useLang.tsx              # i18n (SK/EN) with translation function
│   ├── usePrefs.tsx             # Widget visibility preferences
│   └── useTheme.ts              # Theme management
├── lib/
│   ├── types.ts                 # Shared TypeScript interfaces
│   ├── utils.ts                 # Utility functions
│   ├── namedays.ts              # Slovak nameday data
│   └── moon.ts                  # Moon phase calculations
├── next.config.mjs              # Next.js config (API caching headers)
├── tailwind.config.ts           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies & scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Upstash Redis** account (free tier works) — for visitor tracking

### Installation

```bash
git clone <repo-url>
cd infoweb2
npm install
```

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEWSAPI_KEY` | API key from [NewsAPI.org](https://newsapi.org/) (optional, enhances news) |
| `KV_REST_API_URL` | Upstash Redis REST API URL |
| `KV_REST_API_TOKEN` | Upstash Redis REST API token |
| `KV_REST_API_READ_ONLY_TOKEN` | Upstash Redis read-only token |

> **Vercel deployment**: If using Vercel KV, these variables are auto-populated when you link an Upstash Redis database through the Vercel dashboard.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Architecture

### Widget Pattern

Every widget follows a consistent pattern:

1. **API Route** (`app/api/<name>/route.ts`) — server-side data fetching, caching, transformation
2. **Widget Component** (`components/widgets/<Name>Widget.tsx`) — client-side rendering with `useWidget` hook
3. **WidgetCard wrapper** — consistent styling with accent colors, headers, icons

```tsx
// Typical widget structure
export default function ExampleWidget() {
  const { data, loading, error } = useWidget<DataType>('/api/example', 5 * 60 * 1000)

  return (
    <WidgetCard accent="cyan" title="Example" icon="📊">
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <WidgetError />}
      {!loading && data && (
        // render data
      )}
    </WidgetCard>
  )
}
```

### Data Flow

```
External APIs (OpenMeteo, CoinGecko, ESPN, Wikipedia, RSS feeds, ...)
        ↓
Next.js API Routes (server-side, cached via s-maxage headers)
        ↓
useWidget() hook (client-side, auto-refresh at configurable intervals)
        ↓
Widget Components (React, Tailwind CSS)
```

### Visitor Tracking (Upstash Redis)

Visitor metrics are stored in Upstash Redis for persistence across deployments:

| Redis Key | Type | Description |
|-----------|------|-------------|
| `visitors:total_views` | String (counter) | Lifetime page views |
| `visitors:unique_ips` | Set | All-time unique visitor hashes |
| `visitors:daily:YYYY-MM-DD` | String (counter) | Today's page views (auto-expires) |
| `visitors:daily_unique:YYYY-MM-DD` | Set | Today's unique visitors (auto-expires) |
| `visitors:session:<sid>` | String | Active session marker (2min TTL) |

Metrics displayed: **Online now** · **Today views** · **Today unique** · **Total views**

### Internationalization

Two languages supported: Slovak (default) and English. Managed via `useLang()` hook with `t('key')` translation function. Language persisted in localStorage.

### Preferences

Widget visibility and dashboard sections can be toggled via the Settings panel. Stored in localStorage via `usePrefs()` hook.

---

## API Endpoints

The dashboard provides 72 API routes under `/api/`. Key endpoints:

| Endpoint | Source | Refresh |
|----------|--------|---------|
| `/api/weather` | OpenMeteo | 1 min |
| `/api/news` | SME, Aktuality, TASR, Pravda | 5 min |
| `/api/flashnews` | Multiple RSS feeds | 5 min |
| `/api/traffic` | Waze, custom | 5 min |
| `/api/sports` | ESPN | 2 min |
| `/api/crypto` | CoinGecko | 3 min |
| `/api/currency` | ECB | 1 hour |
| `/api/lottery` | tipos.sk scraping | 6 hours |
| `/api/onthisday` | Wikipedia | 6 hours |
| `/api/yearsago` | Wikipedia | 6 hours |
| `/api/visitors` | Upstash Redis | 1 min (ping) |
| `/api/flights` | OpenSky Network | 30 sec |
| `/api/steam` | Steam API | 5 min |
| `/api/reddit` | Reddit API | 5 min |
| `/api/podcasts` | RSS feeds | 30 min |
| `/api/restaurants` | curated data | 1 hour |

All API responses are cached server-side with `s-maxage=300, stale-while-revalidate=600` headers.

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add Upstash Redis via Vercel Marketplace → auto-populates `KV_*` env vars
4. Add `NEWSAPI_KEY` in project settings (optional)
5. Deploy

### Self-Hosted

```bash
npm run build
npm start
# Runs on port 3000 by default
```

Ensure `KV_REST_API_URL` and `KV_REST_API_TOKEN` env vars are set for Redis connectivity.

---

## Data Sources

This dashboard aggregates data from numerous free and public APIs:

- **Weather**: [Open-Meteo](https://open-meteo.com/)
- **Currency**: [ECB Exchange Rates](https://www.ecb.europa.eu/)
- **Crypto**: [CoinGecko](https://www.coingecko.com/)
- **News**: SME.sk, Aktuality.sk, TASR, Pravda.sk, BBC, Reuters, AP
- **Sports**: ESPN
- **Traffic**: Waze, custom speed camera database
- **Flights**: [OpenSky Network](https://opensky-network.org/)
- **Space**: [Launch Library 2](https://thespacedevs.com/)
- **History**: [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/)
- **Gaming**: [Steam Web API](https://steamcommunity.com/dev)
- **Social**: Reddit API
- **Podcasts**: Direct RSS feeds
- **Visitor tracking**: [Upstash Redis](https://upstash.com/)

---

## License

Private project. Not licensed for redistribution.
