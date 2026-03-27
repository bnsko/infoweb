'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { sk } from 'date-fns/locale'
import { getNameday, getTomorrowNameday, getHoliday, getNextHoliday } from '@/lib/namedays'
import { calculateMoonPhase, nextFullMoon } from '@/lib/moon'
import WidgetCard from '@/components/ui/WidgetCard'

const SK_MONTHS = [
  'január', 'február', 'marec', 'apríl', 'máj', 'jún',
  'júl', 'august', 'september', 'október', 'november', 'december',
]

// Days until next holiday or event
function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = Number(d) - Number(start)
  return Math.floor(diff / 86400000)
}

export default function NamedayWidget() {
  const now = useMemo(() => new Date(), [])
  const today = getNameday(now)
  const tomorrow = getTomorrowNameday(now)
  const holiday = getHoliday(now)
  const nextHoliday = getNextHoliday(now)
  const moon = calculateMoonPhase(now)
  const fullMoonDate = nextFullMoon(now)
  const dayOfYear = getDayOfYear(now)
  const isLeap = new Date(now.getFullYear(), 1, 29).getDate() === 29
  const daysInYear = isLeap ? 366 : 365
  const yearProgress = Math.round((dayOfYear / daysInYear) * 100)

  const dateLabel = format(now, 'd. MMMM yyyy', { locale: sk })
  const weekday = format(now, 'EEEE', { locale: sk })
  const weekNum = format(now, 'w', { locale: sk })
  const fullMoonLabel = format(fullMoonDate, 'd. MMMM', { locale: sk })

  return (
    <WidgetCard accent="yellow" className="h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
      <div className="relative space-y-3">
        {/* Today */}
        <div>
          <div className="widget-title">
            <span>📅</span>
            <span>Dátum & Meniny</span>
          </div>
          <div className="text-xl font-bold text-white capitalize">{weekday}</div>
          <div className="text-sm text-slate-400">{dateLabel}</div>
          <div className="text-xs text-slate-600 mt-0.5">Týždeň {weekNum}</div>
        </div>

        {/* Nameday today */}
        {today && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
            <div className="text-[10px] text-yellow-600 uppercase tracking-wide mb-0.5">Meniny dnes</div>
            <div className="text-lg font-bold text-yellow-300">🎂 {today}</div>
          </div>
        )}

        {/* Holiday */}
        {holiday && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
            <div className="text-[10px] text-rose-600 uppercase tracking-wide mb-0.5">Sviatok</div>
            <div className="text-sm font-semibold text-rose-300">🎉 {holiday}</div>
          </div>
        )}

        {/* Moon phase */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
          <div className="text-[10px] text-purple-500 uppercase tracking-wide mb-1">Fáza mesiaca</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl leading-none">{moon.emoji}</div>
              <div className="text-xs font-semibold text-purple-300 mt-1">{moon.name}</div>
              <div className="text-[10px] text-slate-500">Osvetlenie: {moon.illumination}%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Spln:</div>
              <div className="text-xs font-bold text-yellow-300">{fullMoonLabel}</div>
              <div className="text-[10px] text-slate-500 mt-1">Za {moon.daysToFull} dní</div>
            </div>
          </div>
          {/* Illumination bar */}
          <div className="mt-2 bg-white/5 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-purple-400 to-yellow-300 h-1 rounded-full transition-all"
              style={{ width: `${moon.illumination}%` }}
            />
          </div>
        </div>

        {/* Next holiday */}
        {!holiday && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
            <div className="text-[10px] text-emerald-600 uppercase tracking-wide mb-0.5">Najbližší sviatok</div>
            <div className="text-sm font-semibold text-emerald-300">🗓️ {nextHoliday.name}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              za {nextHoliday.daysUntil} {nextHoliday.daysUntil === 1 ? 'deň' : nextHoliday.daysUntil < 5 ? 'dni' : 'dní'}
              {' · '}
              {format(nextHoliday.date, 'd. MMMM', { locale: sk })}
            </div>
          </div>
        )}

        {/* Tomorrow */}
        <div className="border-t border-white/5 pt-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wide">Meniny zajtra</div>
          <div className="text-sm font-semibold text-slate-300 mt-0.5">🎂 {tomorrow}</div>
        </div>

        {/* Year progress */}
        <div className="border-t border-white/5 pt-2">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Rok {now.getFullYear()}</span>
            <span>{yearProgress}% hotový</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full transition-all"
              style={{ width: `${yearProgress}%` }}
            />
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}
