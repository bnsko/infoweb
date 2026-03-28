// ─── Weather ──────────────────────────────────────────────────────────────────
export interface WeatherCurrent {
  temperature_2m: number
  apparent_temperature: number
  relative_humidity_2m: number
  wind_speed_10m: number
  wind_direction_10m: number
  weather_code: number
  precipitation: number
  cloud_cover: number
  surface_pressure: number
}

export interface WeatherDaily {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  weather_code: number[]
  precipitation_sum: number[]
  wind_speed_10m_max: number[]
  sunrise: string[]
  sunset: string[]
  uv_index_max: number[]
}

export interface WeatherHourly {
  time: string[]
  uv_index: number[]
}

export interface WeatherData {
  current: WeatherCurrent
  daily: WeatherDaily
  hourly: WeatherHourly
}

// ─── News ─────────────────────────────────────────────────────────────────────
export interface NewsItem {
  title: string
  link: string
  description?: string
  pubDate?: string
  source: string
}

export interface NewsResponse {
  items: NewsItem[]
}

// ─── Currency ─────────────────────────────────────────────────────────────────
export interface CurrencyRate {
  code: string
  name: string
  rate: number
  flag: string
}

export interface CurrencyResponse {
  base: string
  date: string
  rates: CurrencyRate[]
}

// ─── Crypto ───────────────────────────────────────────────────────────────────
export interface CryptoAsset {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  image: string
  total_volume: number
}

// ─── Flights ──────────────────────────────────────────────────────────────────
export interface Flight {
  icao24: string
  callsign: string
  origin_country: string
  longitude: number | null
  latitude: number | null
  altitude: number | null
  velocity: number | null
  true_track: number | null
  on_ground: boolean
}

export interface FlightsResponse {
  flights: Flight[]
  count: number
}

// ─── Air Quality ──────────────────────────────────────────────────────────────
export interface AirQualityData {
  current: {
    pm10: number
    pm2_5: number
    carbon_monoxide: number
    ozone: number
    european_aqi: number
    nitrogen_dioxide: number
  }
}

// ─── ISS ──────────────────────────────────────────────────────────────────────
export interface ISSData {
  name: string
  id: number
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  visibility: string
  timestamp: number
}

// ─── Hacker News ──────────────────────────────────────────────────────────────
export interface HNItem {
  id: number
  title: string
  url?: string
  score: number
  by: string
  time: number
  descendants?: number
}

export interface HNResponse {
  items: HNItem[]
}

// ─── Reddit ───────────────────────────────────────────────────────────────────
export interface RedditPost {
  id: string
  title: string
  url: string
  permalink: string
  score: number
  numComments: number
  author: string
  createdUtc: number
  flair?: string | null
  isSelf: boolean
  selftext?: string
  thumbnail?: string | null
}

export interface RedditResponse {
  posts: RedditPost[]
  sort: string
}

// ─── Earthquakes ──────────────────────────────────────────────────────────────
export interface Earthquake {
  id: string
  mag: number
  place: string
  time: number
  url: string
  depth: number
}

export interface EarthquakesResponse {
  earthquakes: Earthquake[]
}

// ─── Space Launches ───────────────────────────────────────────────────────────
export interface SpaceLaunch {
  id: string
  name: string
  statusName: string
  statusAbbrev: string
  net: string
  provider: string
  rocket: string
  pad: string
  missionDesc?: string | null
  imageUrl?: string | null
}

export interface LaunchesResponse {
  results: SpaceLaunch[]
}

// ─── On This Day ──────────────────────────────────────────────────────────────
export interface WikiEvent {
  year: number
  text: string
  pageTitle?: string | null
  pageUrl?: string | null
}

export interface OnThisDayResponse {
  events: WikiEvent[]
  month: number
  day: number
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export interface CityTemp { key: string; name: string; temp: number; humidity: number; windSpeed: number; windDir: number; pressure: number; weatherCode: number; feelsLike: number; sunrise: string; sunset: string; uvIndex: number; tempMax: number; tempMin: number }
export interface CityAQI  { key: string; name: string; aqi: number }

export interface StatsData {
  flightsCount: number | null
  tempBA: number | null
  aqi: number | null
  aqiSK?: number | null
  eurToUsd: number | null
  dayOfYear: number
  daysInYear: number
  timestamp: number
  cityTemps?: CityTemp[]
  cityAQI?: CityAQI[]
}

// ─── Population ───────────────────────────────────────────────────────────────
export interface PopulationStats {
  worldPopulation: number
  birthsToday: number
  deathsToday: number
  growthToday: number
  skPopulation: number
  skBirthsToday: number
  skDeathsToday: number
}
