'use client'

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'

export type Lang = 'sk' | 'en'

const T: Record<string, { sk: string; en: string }> = {
  subtitle: { sk: 'Slovenský prehľad', en: 'Slovak Dashboard' },
  holiday: { sk: 'Sviatok', en: 'Holiday' },
  live: { sk: 'Naživo', en: 'Live' },
  // Section labels
  'sec.slovensko': { sk: '🇸🇰 Slovensko', en: '🇸🇰 Slovakia' },
  'sec.financie': { sk: '💶 Financie', en: '💶 Finance' },
  'sec.finance': { sk: '💶 Financie', en: '💶 Finance' },
  'sec.transport': { sk: '🚗 Doprava', en: '🚗 Transport' },
  'sec.space': { sk: '🔭 Vesmír & Rakety', en: '🔭 Space & Rockets' },
  'sec.fun': { sk: '🎮 Zábava & Komunita', en: '🎮 Entertainment & Community' },
  'sec.history': { sk: '📖 História', en: '📖 History' },
  'sec.news': { sk: '📰 Správy z 18 odvetví', en: '📰 News from 18 Sectors' },
  'sec.realestate': { sk: '🏠 Nehnuteľnosti & Reštaurácie', en: '🏠 Real Estate & Restaurants' },
  'sec.prices': { sk: '💰 Ceny & Nákupy', en: '💰 Prices & Shopping' },
  'sec.tech': { sk: '💻 Tech & Nástroje', en: '💻 Tech & Tools' },
  'sec.counters': { sk: '📊 Živé štatistiky', en: '📊 Live Statistics' },
  'sec.crypto': { sk: '₿ Kryptomeny', en: '₿ Cryptocurrencies' },
  // Stats
  'stat.temp': { sk: 'Teplota BA', en: 'Temp BA' },
  'stat.air': { sk: 'Vzduch BA', en: 'Air BA' },
  'stat.flights': { sk: 'Lety nad SK', en: 'Flights over SK' },
  'stat.btc': { sk: 'BTC', en: 'BTC' },
  'stat.dayOfYear': { sk: 'Deň roka', en: 'Day of year' },
  'stat.sources': { sk: 'Zdroje', en: 'Sources' },
  'stat.online': { sk: 'Online', en: 'Online' },
  'stat.visits': { sk: 'Celkovo', en: 'Total' },
  'stat.unique': { sk: 'Unikátni', en: 'Unique' },
  'stat.uptime': { sk: 'Uptime', en: 'Uptime' },
  'stat.todayVisits': { sk: 'Dnes', en: 'Today' },
  // Nameday widget
  'nameday.title': { sk: 'Dátum & Meniny', en: 'Date & Namedays' },
  'nameday.today': { sk: 'Meniny dnes', en: 'Nameday today' },
  'nameday.tomorrow': { sk: 'Meniny zajtra', en: 'Nameday tomorrow' },
  'nameday.nextHoliday': { sk: 'Najbližší sviatok', en: 'Next holiday' },
  'nameday.moonPhase': { sk: 'Fáza mesiaca', en: 'Moon phase' },
  'nameday.illumination': { sk: 'Osvetlenie', en: 'Illumination' },
  'nameday.fullMoon': { sk: 'Spln', en: 'Full moon' },
  'nameday.inDays': { sk: 'Za', en: 'In' },
  'nameday.days': { sk: 'dní', en: 'days' },
  'nameday.week': { sk: 'Týždeň', en: 'Week' },
  'nameday.year': { sk: 'Rok', en: 'Year' },
  'nameday.done': { sk: 'hotový', en: 'done' },
  // Flights - kept in expanded section below
  // Real estate
  'realestate.title': { sk: 'Nehnuteľnosti · Byty', en: 'Real Estate · Apartments' },
  'realestate.allRegions': { sk: 'Všetky', en: 'All' },
  'realestate.rooms': { sk: 'izby', en: 'rooms' },
  // Webcams
  'webcams.title': { sk: 'Live kamery · Slovensko', en: 'Live cameras · Slovakia' },
  // Restaurants
  'restaurants.title': { sk: 'Odporúčané reštaurácie', en: 'Recommended Restaurants' },
  // On this day
  'onthisday.title': { sk: 'Dnes v histórii', en: 'Today in history' },
  'onthisday.onThisDay': { sk: 'V tento deň –', en: 'On this day –' },
  'onthisday.yearsAgo': { sk: 'r.', en: 'yrs' },
  'onthisday.source': { sk: 'Wikipedia · obnova 6 hod', en: 'Wikipedia · refresh 6 hr' },
  'onthisday.before': { sk: 'pred', en: '' },
  // Slovak Facts
  'facts.title': { sk: 'Zaujímavosti o Slovensku', en: 'Facts about Slovakia' },
  'facts.liveCounters': { sk: 'Živé počítadlá', en: 'Live counters' },
  'facts.factsAbout': { sk: 'Fakty o SR', en: 'Facts about SK' },
  'facts.castles': { sk: 'hradov', en: 'castles' },
  'facts.springs': { sk: 'prameňov', en: 'springs' },
  'facts.carsYear': { sk: 'áut/rok', en: 'cars/year' },
  'facts.sourceCounters': { sk: 'Odhad na základe ročných štatistík SR · obnovuje sa automaticky', en: 'Estimate from annual SK statistics · auto-refresh' },
  'facts.sourceFacts': { sk: 'Zaujímavosti o Slovensku · mení sa denne', en: 'Facts about Slovakia · changes daily' },
  // Weather
  'weather.title': { sk: 'Počasie · Bratislava', en: 'Weather · Bratislava' },
  'weather.feels': { sk: 'Pocit', en: 'Feels' },
  'weather.humidity': { sk: 'Vlhkosť', en: 'Humidity' },
  'weather.wind': { sk: 'Vietor', en: 'Wind' },
  'weather.precip': { sk: 'Zrážky', en: 'Precipitation' },
  'weather.maxMin': { sk: 'Max/Min', en: 'Max/Min' },
  'weather.today': { sk: 'Dnes', en: 'Today' },
  'weather.7days': { sk: '7 dní', en: '7 days' },
  'weather.14days': { sk: '14 dní', en: '14 days' },
  'weather.night': { sk: 'noc', en: 'night' },
  'weather.uvLow': { sk: 'Nízke', en: 'Low' },
  'weather.uvMed': { sk: 'Stredné', en: 'Medium' },
  'weather.uvHigh': { sk: 'Vysoké', en: 'High' },
  'weather.uvVeryHigh': { sk: 'Veľmi vysoké', en: 'Very high' },
  'weather.uvExtreme': { sk: 'Extrémne', en: 'Extreme' },
  // Forecast
  'forecast.title': { sk: '7-dňová predpoveď', en: '7-day forecast' },
  // Population
  'pop.sk': { sk: 'Populácia Slovenska', en: 'Population of Slovakia' },
  'pop.world': { sk: 'Populácia Sveta', en: 'World Population' },
  'pop.worldBtn': { sk: 'Svet', en: 'World' },
  'pop.current': { sk: 'Aktuálna populácia', en: 'Current population' },
  'pop.bornToday': { sk: 'Narodení dnes', en: 'Born today' },
  'pop.deathsToday': { sk: 'Úmrtia dnes', en: 'Deaths today' },
  'pop.bornYear': { sk: 'Narodení tento rok', en: 'Born this year' },
  'pop.deathsYear': { sk: 'Úmrtia tento rok', en: 'Deaths this year' },
  'pop.increase': { sk: 'Prirodzený prírastok dnes', en: 'Natural increase today' },
  'pop.source': { sk: 'Odhad na základe ročných štatistík', en: 'Estimate based on annual statistics' },
  // Events
  'events.title': { sk: 'Podujatia na Slovensku', en: 'Events in Slovakia' },
  'events.today': { sk: 'Dnes', en: 'Today' },
  'events.tomorrow': { sk: 'Zajtra', en: 'Tomorrow' },
  'events.concerts': { sk: 'koncerty', en: 'concerts' },
  'events.sport': { sk: 'šport', en: 'sport' },
  'events.culture': { sk: 'kultúra', en: 'culture' },
  'events.festivals': { sk: 'festivaly', en: 'festivals' },
  // Sports
  'sports.title': { sk: 'Šport Live', en: 'Sports Live' },
  'sports.halftime': { sk: 'Polčas', en: 'Halftime' },
  'sports.end': { sk: 'Koniec', en: 'End' },
  'sports.scheduled': { sk: 'Plán.', en: 'Sched.' },
  'sports.noMatches': { sk: 'Momentálne žiadne zápasy', en: 'No matches currently' },
  'sports.source': { sk: 'obnova 1 min', en: 'refresh 1 min' },
  // Flights
  'flights.title': { sk: 'Lety nad Slovenskom', en: 'Flights over Slovakia' },
  'flights.callsign': { sk: 'Volacia zn.', en: 'Callsign' },
  'flights.country': { sk: 'Krajina', en: 'Country' },
  'flights.alt': { sk: 'Výška', en: 'Altitude' },
  'flights.speed': { sk: 'Rýchlosť', en: 'Speed' },
  'flights.noFlights': { sk: 'Žiadne aktívne lety.', en: 'No active flights.' },
  'flights.source': { sk: 'OpenSky Network · aktualizácia 1 min', en: 'OpenSky Network · update 1 min' },
  // Traffic
  'traffic.title': { sk: 'Dopravné udalosti', en: 'Traffic incidents' },
  'traffic.error': { sk: 'Chyba načítania dopravných dát', en: 'Error loading traffic data' },
  'traffic.none': { sk: 'Žiadne aktuálne dopravné udalosti', en: 'No current traffic events' },
  'traffic.source': { sk: 'Waze · Polícia SR · obnova 2 min', en: 'Waze · Police SR · refresh 2 min' },
  // Currency / Crypto
  'currency.title': { sk: 'Kurzy mien · EUR', en: 'Currency Rates · EUR' },
  'crypto.title': { sk: 'Kryptomeny · EUR', en: 'Cryptocurrencies · EUR' },
  'crypto.source': { sk: 'CoinGecko · 24h zmena', en: 'CoinGecko · 24h change' },
  // Space
  'space.title': { sk: 'Vesmír & Ovzdušie', en: 'Space & Atmosphere' },
  'space.iss': { sk: 'ISS Stanica', en: 'ISS Station' },
  'space.airQuality': { sk: 'Kvalita Vzduchu BA', en: 'Air Quality BA' },
  'space.overEurope': { sk: 'Nad Európou', en: 'Over Europe' },
  'space.dataUnavailable': { sk: 'Dáta nedostupné', en: 'Data unavailable' },
  'space.lat': { sk: 'Šírka', en: 'Lat' },
  'space.lon': { sk: 'Dĺžka', en: 'Lon' },
  'space.alt': { sk: 'Výška', en: 'Alt' },
  'space.speed': { sk: 'Rýchlosť', en: 'Speed' },
  'space.europeanAQI': { sk: 'Európsky AQI', en: 'European AQI' },
  'space.ozone': { sk: 'Ozón', en: 'Ozone' },
  // Earthquakes
  'eq.title': { sk: 'Zemetrasenia · Karpaty', en: 'Earthquakes · Carpathians' },
  'eq.none': { sk: 'Žiadne zemetrasenia v poslednom čase.', en: 'No recent earthquakes.' },
  'eq.depth': { sk: 'hĺbka', en: 'depth' },
  'eq.source': { sk: 'USGS · min. M1.5 · obnova 10 min', en: 'USGS · min M1.5 · refresh 10 min' },
  // Launches
  'launches.title': { sk: 'Najbližšie štarty rakiet', en: 'Upcoming rocket launches' },
  'launches.none': { sk: 'Žiadne naplánované štarty.', en: 'No scheduled launches.' },
  'launches.justLaunched': { sk: 'Práve štartovalo', en: 'Just launched' },
  'launches.source': { sk: 'Launch Library 2 · obnova 1 hod', en: 'Launch Library 2 · refresh 1 hr' },
  // Metrics
  'metrics.title': { sk: 'Zaujímavé metriky', en: 'Interesting Metrics' },
  'metrics.sun': { sk: 'Slnko · Bratislava', en: 'Sun · Bratislava' },
  'metrics.sunrise': { sk: 'Východ', en: 'Sunrise' },
  'metrics.sunset': { sk: 'Západ', en: 'Sunset' },
  'metrics.daylight': { sk: 'Deň', en: 'Daylight' },
  'metrics.internet': { sk: 'Internet dnes', en: 'Internet today' },
  'metrics.emails': { sk: 'E-maily', en: 'Emails' },
  'metrics.google': { sk: 'Google', en: 'Google' },
  'metrics.tweets': { sk: 'Tweety', en: 'Tweets' },
  'metrics.hacked': { sk: 'Hacknutých', en: 'Hacked' },
  'metrics.wikiTitle': { sk: 'Top SK Wikipédia včera', en: 'Top SK Wikipedia yesterday' },
  // Reddit
  'reddit.title': { sk: 'r/Slovakia', en: 'r/Slovakia' },
  'reddit.new': { sk: 'Nové', en: 'New' },
  'reddit.source': { sk: 'obnova 5 min', en: 'refresh 5 min' },
  'reddit.noPosts': { sk: 'Žiadne príspevky k dispozícii', en: 'No posts available' },
  'reddit.globalTitle': { sk: 'Reddit Top 10 dnes', en: 'Reddit Top 10 today' },
  'reddit.topToday': { sk: 'top dnes', en: 'top today' },
  // Steam
  'steam.title': { sk: 'Steam · Najpredávanejšie', en: 'Steam · Top sellers' },
  'steam.new': { sk: 'Nové', en: 'New' },
  // News categories
  'news.slovakia': { sk: 'Slovensko', en: 'Slovakia' },
  'news.domestic': { sk: 'Správy z domova', en: 'Domestic news' },
  'news.world': { sk: 'Svet', en: 'World' },
  'news.sport': { sk: 'Šport', en: 'Sport' },
  'news.economy': { sk: 'Ekonomika', en: 'Economy' },
  'news.science': { sk: 'Veda', en: 'Science' },
  'news.health': { sk: 'Zdravie', en: 'Health' },
  'news.crypto': { sk: 'Krypto', en: 'Crypto' },
  'news.travel': { sk: 'Cestovanie', en: 'Travel' },
  'news.nature': { sk: 'Príroda', en: 'Nature' },
  'news.music': { sk: 'Hudba', en: 'Music' },
  'news.food': { sk: 'Jedlo', en: 'Food' },
  'news.education': { sk: 'Vzdelávanie', en: 'Education' },
  'news.history': { sk: 'História', en: 'History' },
  'news.tech': { sk: 'Technologické správy · Hacker News', en: 'Tech News · Hacker News' },
  'news.gaming': { sk: 'Herný svet', en: 'Gaming World' },
  'news.musicWorld': { sk: 'Hudobný svet', en: 'Music World' },
  // ISS
  'iss.title': { sk: 'ISS – Medzinárodná vesmírna stanica', en: 'ISS – International Space Station' },
  'iss.position': { sk: 'ISS – Poloha', en: 'ISS – Position' },
  'iss.lat': { sk: 'Zemepisná šírka', en: 'Latitude' },
  'iss.lon': { sk: 'Zem. dĺžka', en: 'Longitude' },
  'iss.alt': { sk: 'Nadmorská výška', en: 'Altitude' },
  'iss.speed': { sk: 'Rýchlosť', en: 'Speed' },
  'iss.overEurope': { sk: 'ISS je teraz nad Európou!', en: 'ISS is currently over Europe!' },
  'iss.source': { sk: 'wheretheiss.at · aktualizácia 30s', en: 'wheretheiss.at · update 30s' },
  // Weather tips
  'tips.storm': { sk: 'Búrka – vyhni sa otv. priestranstvu', en: 'Storm – avoid open areas' },
  'tips.snowShowers': { sk: 'Snehové prehánky – opatrne na cestách', en: 'Snow showers – careful on roads' },
  'tips.snow': { sk: 'Sneženie – počítaj so zdržaním na cestách', en: 'Snowfall – expect road delays' },
  'tips.heavyRain': { sk: 'Silný dážď – nezabudni dáždnik a bundu', en: 'Heavy rain – bring umbrella & jacket' },
  'tips.drizzle': { sk: 'Mrholenie – odporúčame ľahkú bundu', en: 'Drizzle – light jacket recommended' },
  'tips.nice': { sk: 'Pekné počasie! Ideálny čas na outdoor', en: 'Nice weather! Perfect for outdoors' },
  'tips.hot': { sk: 'Horúco – hydratácia, SPF 50+', en: 'Hot – hydrate, SPF 50+' },
  'tips.heavyFrost': { sk: 'Veľký mráz – obliekaj sa vo vrstvách', en: 'Heavy frost – dress in layers' },
  'tips.frost': { sk: 'Mráz – pozor na poľadovicu', en: 'Frost – watch for black ice' },
  'tips.wind': { sk: 'Silný vietor – dávaj pozor vonku', en: 'Strong wind – be careful outside' },
  'tips.pleasant': { sk: 'Nasledujúce dni vyzerajú príjemne – nič špeciálne si nepripravuj.', en: 'Next days look pleasant – no special prep needed.' },
  'tips.feelsLike': { sk: 'Pocitová teplota', en: 'Feels like' },
  // Common
  'refresh': { sk: 'Obnoviť', en: 'Refresh' },
  'loading': { sk: 'Načítanie...', en: 'Loading...' },
  'error': { sk: 'Chyba načítania', en: 'Loading error' },
  'noData': { sk: 'Žiadne dáta', en: 'No data' },
  'today': { sk: 'Dnes', en: 'Today' },
  'tomorrow': { sk: 'Zajtra', en: 'Tomorrow' },
  // Footer
  'footer.auto': { sk: 'Automatická obnova každých 30s–10 min. Všetky dáta sú verejne dostupné.', en: 'Auto-refresh every 30s–10 min. All data is publicly available.' },
}

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextValue>({
  lang: 'sk',
  setLang: () => {},
  t: (k: string) => k,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const value = useLangInternal()
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  return useContext(LangContext)
}

function useLangInternal(): LangContextValue {
  const [lang, setLangState] = useState<Lang>('sk')

  useEffect(() => {
    const stored = localStorage.getItem('infoweb-lang') as Lang
    if (stored === 'en' || stored === 'sk') {
      setLangState(stored)
    }
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem('infoweb-lang', l)
  }, [])

  const t = useCallback((key: string): string => {
    return T[key]?.[lang] ?? key
  }, [lang])

  return { lang, setLang, t }
}
