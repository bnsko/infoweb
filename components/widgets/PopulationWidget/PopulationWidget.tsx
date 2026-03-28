'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLang } from '@/hooks/useLang'

// Annual rates (2024-2026 estimates)
const WORLD = {
  population: 8_100_000_000,
  birthsPerYear: 140_000_000,   // ~4.44/sec
  deathsPerYear: 61_000_000,    // ~1.93/sec
}
const SK = {
  population: 5_425_000,
  birthsPerYear: 55_000,        // ~150/day
  deathsPerYear: 58_000,        // ~159/day
}

function ratesPerMs(annual: number) { return annual / (365.25 * 24 * 3600 * 1000) }

function formatNum(n: number): string {
  return Math.floor(n).toLocaleString('sk-SK')
}

type Scope = 'sk' | 'world'

export default function PopulationWidget() {
  const { t } = useLang()
  const [scope, setScope] = useState<Scope>('sk')
  const [tick, setTick] = useState(0)
  const [yearStart] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0).getTime()
  })

  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const elapsed = (tick || Date.now()) - yearStart
  const src = scope === 'sk' ? SK : WORLD

  const birthsToday = ratesPerMs(src.birthsPerYear) * (elapsed % (24 * 3600 * 1000))
  const deathsToday = ratesPerMs(src.deathsPerYear) * (elapsed % (24 * 3600 * 1000))
  const birthsYear = ratesPerMs(src.birthsPerYear) * elapsed
  const deathsYear = ratesPerMs(src.deathsPerYear) * elapsed
  const currentPop = src.population + (birthsYear - deathsYear)

  return (
    <div className="widget-card h-full card-entrance border-rose-500/20 glow-rose relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-900/10 to-transparent pointer-events-none" />
      <div className="relative">
        {/* Header with toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="widget-title mb-0">
            <span>{'🌎'}</span>
            <span>{scope === 'sk' ? t('pop.sk') : t('pop.world')}</span>
          </div>
          <div className="flex items-center bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setScope('sk')}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                scope === 'sk' ? 'bg-rose-500/20 text-rose-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {'🇸🇰'} SK
            </button>
            <button
              onClick={() => setScope('world')}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                scope === 'world' ? 'bg-rose-500/20 text-rose-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {'🌍'} {t('pop.worldBtn')}
            </button>
          </div>
        </div>

        {/* Population counter */}
        <div className="text-center mb-4">
          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{t('pop.current')}</div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums tracking-tight pop-counter">
            {formatNum(currentPop)}
          </div>
        </div>

        {/* Today stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <CounterBox
            label={t('pop.bornToday')}
            value={Math.floor(birthsToday)}
            icon={'👶'}
            color="text-green-400"
            perSec={ratesPerMs(src.birthsPerYear) * 1000}
          />
          <CounterBox
            label={t('pop.deathsToday')}
            value={Math.floor(deathsToday)}
            icon={'⚔️'}
            color="text-red-400"
            perSec={ratesPerMs(src.deathsPerYear) * 1000}
          />
        </div>

        {/* Year stats */}
        <div className="grid grid-cols-2 gap-3">
          <CounterBox
            label={t('pop.bornYear')}
            value={Math.floor(birthsYear)}
            icon={'🎉'}
            color="text-green-400"
          />
          <CounterBox
            label={t('pop.deathsYear')}
            value={Math.floor(deathsYear)}
            icon={'🕊️'}
            color="text-red-400"
          />
        </div>

        {/* Net growth */}
        <div className="mt-3 bg-white/3 rounded-xl p-2 text-center">
          <div className="text-[10px] text-slate-500">{t('pop.increase')}</div>
          <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
            +{formatNum(birthsToday - deathsToday)}
          </div>
        </div>

        <p className="text-[10px] text-slate-600 mt-2 text-center">
          {t('pop.source')} {'·'} {scope === 'sk' ? 'ŠÚ SR' : 'UN/WHO'}
        </p>
      </div>
    </div>
  )
}

function CounterBox({ label, value, icon, color, perSec }: {
  label: string
  value: number
  icon: string
  color: string
  perSec?: number
}) {
  return (
    <div className="bg-white/3 rounded-xl p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-lg font-bold font-mono tabular-nums ${color}`}>
        {formatNum(value)}
      </div>
      {perSec != null && perSec > 0.01 && (
        <div className="text-[9px] text-slate-600 mt-0.5">
          ~{perSec >= 1 ? perSec.toFixed(1) : perSec.toFixed(4)}/s
        </div>
      )}
    </div>
  )
}
