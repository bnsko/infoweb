'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface SKEvent {
  title: string; date: string; venue: string; city: string
  category: string; emoji: string; url?: string; source: 'events' | 'goout'
  time?: string; price?: string; soldOut?: boolean; country?: string
}
interface EventsData { events: SKEvent[]; today: string }
interface GoOutEvent {
  id: number; name: string; category: string; venue: string; city: string
  date: string; time: string; price: string; soldOut: boolean
}
interface GoOutData { events: GoOutEvent[]; timestamp: number }

const COUNTRY_TABS = [
  { key: 'SK', flag: '🇸🇰', label: 'Slovensko' },
  { key: 'CZ', flag: '🇨🇿', label: 'Česko' },
  { key: 'HU', flag: '🇭🇺', label: 'Maďarsko' },
  { key: 'AT', flag: '🇦🇹', label: 'Rakúsko' },
  { key: 'PL', flag: '🇵🇱', label: 'Poľsko' },
  { key: 'UA', flag: '🇺🇦', label: 'Ukrajina' },
]

const CITY_MAP: Record<string, { label: string; flag: string; lat: number; lng: number }> = {
  Bratislava: { label: 'Bratislava', flag: '🏙️', lat: 48.148, lng: 17.107 },
  Košice:     { label: 'Košice',     flag: '🏰', lat: 48.721, lng: 21.261 },
  Žilina:     { label: 'Žilina',     flag: '🏔️', lat: 49.221, lng: 18.740 },
  Nitra:      { label: 'Nitra',      flag: '🌾', lat: 48.307, lng: 18.086 },
  'Banská Bystrica': { label: 'B. Bystrica', flag: '⛰️', lat: 48.736, lng: 19.146 },
  Trnava:     { label: 'Trnava',     flag: '⛪', lat: 48.378, lng: 17.587 },
  Trenčín:    { label: 'Trenčín',    flag: '🏯', lat: 48.894, lng: 18.044 },
  Prešov:     { label: 'Prešov',     flag: '🏛️', lat: 49.001, lng: 21.239 },
}

const GOOUT_CITY_MAP: Record<string, string> = {
  BA: 'Bratislava', KE: 'Košice', BB: 'Banská Bystrica', ZA: 'Žilina',
}

const CAT_ICONS: Record<string, string> = {
  concert: '🎵', Koncert: '🎵', sport: '⚽', culture: '🎭', Divadlo: '🎭',
  festival: '🎪', Festival: '🎪', Film: '🎬', 'Stand-up': '😂', Workshop: '🔧',
  Prednáška: '🎓', Výstava: '🖼️', other: '📅',
}

const CAT_COLORS: Record<string, string> = {
  concert: 'bg-purple-500/12 text-purple-300 border-purple-500/20',
  Koncert: 'bg-purple-500/12 text-purple-300 border-purple-500/20',
  sport: 'bg-green-500/12 text-green-300 border-green-500/20',
  culture: 'bg-amber-500/12 text-amber-300 border-amber-500/20',
  Divadlo: 'bg-amber-500/12 text-amber-300 border-amber-500/20',
  festival: 'bg-rose-500/12 text-rose-300 border-rose-500/20',
  Festival: 'bg-rose-500/12 text-rose-300 border-rose-500/20',
  Film: 'bg-cyan-500/12 text-cyan-300 border-cyan-500/20',
  'Stand-up': 'bg-yellow-500/12 text-yellow-300 border-yellow-500/20',
  default: 'bg-slate-500/12 text-slate-400 border-slate-500/20',
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function formatDate(dateStr: string): { day: number; weekday: string; month: string; isToday: boolean; isTomorrow: boolean } {
  const d = new Date(dateStr)
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const tmrStr = new Date(now.getTime() + 86400000).toISOString().slice(0, 10)
  return {
    day: d.getDate(),
    weekday: d.toLocaleDateString('sk-SK', { weekday: 'short' }),
    month: d.toLocaleDateString('sk-SK', { month: 'short' }),
    isToday: dateStr.startsWith(todayStr),
    isTomorrow: dateStr.startsWith(tmrStr),
  }
}

/* ── International events panel for non-SK countries ── */
function IntlEventsPanel({ country }: { country: string }) {
  const { data, loading } = useWidget<EventsData>(`/api/events?country=${country}`, 60 * 60 * 1000)

  if (loading) return <SkeletonRows rows={6} />

  const events = data?.events ?? []
  if (events.length === 0) {
    const info = COUNTRY_TABS.find(c => c.key === country)
    return (
      <div className="text-center py-10 space-y-3">
        <div className="text-3xl">{info?.flag}</div>
        <p className="text-sm font-semibold text-slate-300">{info?.label}</p>
        <p className="text-[11px] text-slate-500">Podujatia z tejto krajiny nie sú momentálne dostupné.</p>
        <p className="text-[9px] text-slate-600">API podpora pre túto krajinu môže byť v príprave.</p>
      </div>
    )
  }

  const now = new Date().toISOString().slice(0, 10)
  const todayEvents = events.filter(e => e.date.startsWith(now))
  const upcoming = events.filter(e => !e.date.startsWith(now))

  return (
    <div className="space-y-3">
      {todayEvents.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] font-bold text-green-300 uppercase tracking-wider">Dnes</span>
            <div className="flex-1 h-px bg-green-500/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {todayEvents.slice(0, 4).map((e, i) => <EventCard key={i} event={e} highlight />)}
          </div>
        </div>
      )}
      {upcoming.length > 0 && (
        <div className="space-y-1 max-h-[380px] overflow-y-auto scrollbar-hide">
          {upcoming.slice(0, 20).map((e, i) => <EventCard key={i} event={e} />)}
        </div>
      )}
    </div>
  )
}

export default function EventsCombinedWidget() {
  const eventsData = useWidget<EventsData>('/api/events', 60 * 60 * 1000)
  const gooutData = useWidget<GoOutData>('/api/goout', 60 * 60 * 1000)

  const [filterCountry, setFilterCountry] = useState<string>('SK')
  const [filterCity, setFilterCity] = useState<string>('all')
  const [filterCat, setFilterCat] = useState<string>('all')
  const [userCity, setUserCity] = useState<string | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        let nearest = 'Bratislava'
        let minDist = Infinity
        for (const [city, info] of Object.entries(CITY_MAP)) {
          const d = haversine(latitude, longitude, info.lat, info.lng)
          if (d < minDist) { minDist = d; nearest = city }
        }
        setUserCity(nearest)
        setFilterCity(nearest)
        setGeoLoading(false)
      },
      () => setGeoLoading(false),
      { timeout: 5000 }
    )
  }, [])

  useEffect(() => { detectLocation() }, [detectLocation])

  // Merge both data sources
  const allEvents: SKEvent[] = []
  if (eventsData.data?.events) {
    for (const e of eventsData.data.events) {
      allEvents.push({ ...e, source: 'events', time: '20:00', price: undefined })
    }
  }
  if (gooutData.data?.events) {
    for (const e of gooutData.data.events) {
      const city = GOOUT_CITY_MAP[e.city] ?? e.city
      allEvents.push({
        title: e.name, date: e.date, venue: e.venue, city,
        category: e.category, emoji: CAT_ICONS[e.category] ?? '📅',
        source: 'goout', time: e.time, price: e.price, soldOut: e.soldOut,
      })
    }
  }
  const seen = new Set<string>()
  const unique = allEvents.filter(e => {
    const k = `${e.title}|${e.date}|${e.venue}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  }).sort((a, b) => a.date.localeCompare(b.date))

  const filtered = unique.filter(e => {
    if (filterCity !== 'all' && e.city !== filterCity) return false
    if (filterCat !== 'all' && e.category !== filterCat) return false
    return true
  })

  const todayEvents = filtered.filter(e => formatDate(e.date).isToday)
  const upcomingEvents = filtered.filter(e => !formatDate(e.date).isToday)

  const categories = Array.from(new Set(unique.map(e => e.category))).slice(0, 8)
  const isLoading = eventsData.loading && gooutData.loading
  const refetchAll = () => { eventsData.refetch(); gooutData.refetch() }

  return (
    <WidgetCard accent="purple" title="Podujatia & GoOut" icon="🎪" onRefresh={refetchAll}>
      {/* Country tabs */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto scrollbar-hide pb-0.5">
        {COUNTRY_TABS.map(ct => (
          <button key={ct.key} onClick={() => setFilterCountry(ct.key)}
            className={`flex items-center gap-1 text-[9px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all shrink-0 ${
              filterCountry === ct.key
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/5'
            }`}>
            <span>{ct.flag}</span>
            <span className="hidden sm:inline">{ct.label}</span>
            <span className="inline sm:hidden">{ct.key}</span>
          </button>
        ))}
      </div>

      {/* Non-SK countries */}
      {filterCountry !== 'SK' && <IntlEventsPanel country={filterCountry} />}

      {/* SK content */}
      {filterCountry === 'SK' && (
        isLoading ? <SkeletonRows rows={8} /> : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl border" style={{ background: 'rgba(168,85,247,0.04)', borderColor: 'rgba(168,85,247,0.1)' }}>
              <div className="text-center">
                <div className="text-[15px] font-bold text-purple-300">{todayEvents.length}</div>
                <div className="text-[7px] text-slate-500">Dnes</div>
              </div>
              <div className="w-px h-6 bg-white/5" />
              <div className="text-center">
                <div className="text-[15px] font-bold text-white">{unique.length}</div>
                <div className="text-[7px] text-slate-500">Spolu</div>
              </div>
              <div className="flex-1" />
              {userCity && (
                <div className="flex items-center gap-1 text-[9px] text-purple-300">
                  <span>📍</span>
                  <span className="font-semibold">{CITY_MAP[userCity]?.label ?? userCity}</span>
                </div>
              )}
              {geoLoading && <span className="text-[9px] text-slate-500 animate-pulse">📍 Hľadám...</span>}
            </div>

            {/* City filter */}
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setFilterCity('all')} className={`text-[8px] px-2.5 py-1 rounded-full font-semibold transition-all border ${filterCity === 'all' ? 'bg-purple-500/15 text-purple-300 border-purple-500/25' : 'bg-white/[0.02] text-slate-500 border-white/5 hover:text-slate-300'}`}>Všetky</button>
              {Object.entries(CITY_MAP).map(([city, info]) => (
                <button key={city} onClick={() => setFilterCity(city)} className={`text-[8px] px-2.5 py-1 rounded-full font-semibold transition-all border ${filterCity === city ? 'bg-purple-500/15 text-purple-300 border-purple-500/25' : 'bg-white/[0.02] text-slate-500 border-white/5 hover:text-slate-300'}`}>
                  {info.flag} {info.label}
                  {city === userCity && <span className="ml-0.5">•</span>}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setFilterCat('all')} className={`text-[7px] px-2 py-0.5 rounded-full transition-all border ${filterCat === 'all' ? 'bg-white/8 text-white border-white/10' : 'text-slate-600 border-white/4 hover:text-slate-400'}`}>Všetky kategórie</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)} className={`text-[7px] px-2 py-0.5 rounded-full transition-all border ${filterCat === cat ? (CAT_COLORS[cat] ?? CAT_COLORS.default) + ' border-opacity-50' : 'text-slate-600 border-white/4 hover:text-slate-400'}`}>
                  {CAT_ICONS[cat] ?? '📅'} {cat}
                </button>
              ))}
            </div>

            {todayEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[9px] font-bold text-green-300 uppercase tracking-wider">Dnes</span>
                  <div className="flex-1 h-px bg-green-500/10" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {todayEvents.slice(0, 4).map((e, i) => (
                    <EventCard key={`today-${i}`} event={e} highlight />
                  ))}
                </div>
              </div>
            )}

            {upcomingEvents.length > 0 && (
              <div>
                {todayEvents.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Najbližšie</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                )}
                <div className="space-y-1 max-h-[380px] overflow-y-auto scrollbar-hide">
                  {upcomingEvents.slice(0, 20).map((e, i) => (
                    <EventCard key={`upcoming-${i}`} event={e} />
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-[11px]">Žiadne podujatia pre vybraný filter</div>
            )}
          </div>
        )
      )}
      <p className="text-[8px] text-slate-600 mt-2">GoOut.net · Ticketportal · Ticketmaster · Hodie</p>
    </WidgetCard>
  )
}

function EventCard({ event, highlight }: { event: SKEvent; highlight?: boolean }) {
  const { day, weekday, month, isTomorrow } = formatDate(event.date)
  const catColor = CAT_COLORS[event.category] ?? CAT_COLORS.default
  const catIcon = CAT_ICONS[event.category] ?? '📅'
  const cityInfo = CITY_MAP[event.city]
  const content = (
    <div className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-all hover:scale-[1.01] ${event.soldOut ? 'opacity-50 bg-red-500/5 border-red-500/8' : highlight ? 'bg-purple-500/5 border-purple-500/12 hover:bg-purple-500/8' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}>
      {/* Date badge */}
      <div className={`shrink-0 text-center rounded-lg px-2 py-1.5 min-w-[38px] ${highlight ? 'bg-green-500/10 border border-green-500/15' : 'bg-white/[0.03] border border-white/5'}`}>
        <div className="text-[9px] text-slate-500 font-semibold">{weekday}</div>
        <div className={`text-[16px] font-bold leading-none ${highlight ? 'text-green-300' : 'text-white'}`}>{day}</div>
        <div className="text-[8px] text-slate-500">{month}</div>
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5 mb-0.5">
          <span className="text-base leading-none mt-0.5">{catIcon}</span>
          <p className="text-[11px] font-bold text-slate-200 line-clamp-1 leading-tight flex-1">{event.title}</p>
        </div>
        <div className="text-[8px] text-slate-500">
          📍 {event.venue}{cityInfo ? ` · ${cityInfo.flag} ${cityInfo.label}` : ''}
          {event.time && event.source === 'goout' && <span className="ml-1">· {event.time}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-[7px] px-1.5 py-0.5 rounded-full border font-semibold ${catColor}`}>{event.category}</span>
          {isTomorrow && !highlight && <span className="text-[7px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/20 font-bold">Zajtra</span>}
          {event.soldOut && <span className="text-[7px] bg-red-500/15 text-red-300 px-1.5 py-0.5 rounded-full font-bold">Vypredané</span>}
          {event.price && <span className={`text-[8px] font-bold ${event.price === 'Zadarmo' ? 'text-green-400' : 'text-amber-400'}`}>{event.price}</span>}
          <span className={`text-[7px] px-1.5 py-0.5 rounded-full ${event.source === 'goout' ? 'bg-purple-500/8 text-purple-400' : 'bg-slate-500/8 text-slate-500'}`}>{event.source === 'goout' ? 'GoOut' : 'Hodie'}</span>
        </div>
      </div>
    </div>
  )
  if (event.url) return <a href={event.url} target="_blank" rel="noopener noreferrer">{content}</a>
  return content
}
