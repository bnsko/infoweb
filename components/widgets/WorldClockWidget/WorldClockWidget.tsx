'use client'
import { useState, useEffect } from 'react'

interface CityTZ {
  city: string
  country: string
  flag: string
  tz: string
}

const CITIES: CityTZ[] = [
  { city: 'New York', country: 'USA', flag: '🇺🇸', tz: 'America/New_York' },
  { city: 'Londýn', country: 'UK', flag: '🇬🇧', tz: 'Europe/London' },
  { city: 'Bratislava', country: 'SK', flag: '🇸🇰', tz: 'Europe/Bratislava' },
  { city: 'Dubai', country: 'UAE', flag: '🇦🇪', tz: 'Asia/Dubai' },
  { city: 'Bombaj', country: 'India', flag: '🇮🇳', tz: 'Asia/Kolkata' },
  { city: 'Singapur', country: 'SG', flag: '🇸🇬', tz: 'Asia/Singapore' },
  { city: 'Tokio', country: 'Japan', flag: '🇯🇵', tz: 'Asia/Tokyo' },
  { city: 'Sydney', country: 'AU', flag: '🇦🇺', tz: 'Australia/Sydney' },
]

const FMT_TIME = (tz: string, date: Date) =>
  new Intl.DateTimeFormat('sk-SK', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)

const FMT_DATE = (tz: string, date: Date) =>
  new Intl.DateTimeFormat('sk-SK', {
    timeZone: tz,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)

const GET_HOUR = (tz: string, date: Date) =>
  parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(date),
    10,
  )

function isDaytime(tz: string, date: Date) {
  const h = GET_HOUR(tz, date)
  return h >= 6 && h < 20
}

function ClockIcon({ day }: { day: boolean }) {
  return (
    <span className={`text-xs ${day ? 'text-yellow-400' : 'text-indigo-300'}`}>
      {day ? '☀️' : '🌙'}
    </span>
  )
}

export default function WorldClockWidget() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // UTC offset label
  const UTC_OFFSET = (tz: string) => {
    const offset = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    }).formatToParts(now)
    return offset.find(p => p.type === 'timeZoneName')?.value ?? ''
  }

  return (
    <div className="widget-card h-full flex flex-col">
      <h2 className="widget-title mb-3">🌍 Svetový čas</h2>

      <div className="flex-1 grid grid-cols-2 gap-2">
        {CITIES.map(c => {
          const day = isDaytime(c.tz, now)
          return (
            <div
              key={c.tz}
              className={`rounded-xl p-2 flex flex-col gap-0.5 border transition-colors ${
                c.city === 'Bratislava'
                  ? 'bg-primary/10 border-primary/30'
                  : day
                  ? 'bg-yellow-500/5 border-yellow-500/10'
                  : 'bg-indigo-500/5 border-indigo-500/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{c.flag} <span className="font-medium text-xs">{c.city}</span></span>
                <ClockIcon day={day} />
              </div>
              <p className="font-mono text-lg font-bold leading-none tracking-tight">
                {FMT_TIME(c.tz, now)}
              </p>
              <p className="text-xs text-muted">{FMT_DATE(c.tz, now)}</p>
              <p className="text-xs text-muted opacity-60">{UTC_OFFSET(c.tz)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
