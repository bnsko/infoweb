'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

/* ── Reservoirs ── */
interface Reservoir { name: string; river: string; region: string; capacity: number; level: string; trend: string; volume_mil_m3: number; maxVolume_mil_m3: number }
interface ReservoirData { reservoirs: Reservoir[]; avgCapacity: number; droughtWarning: boolean; droughtCount: number; timestamp: number }

/* ── Water Quality ── */
interface WaterCity { city: string; quality: string; source: string; chlorine: number; hardness: number; hardnessText: string; nitrates: number; ph: number; lastTest: string }
interface WaterData { cities: WaterCity[]; allGood: boolean; timestamp: number }

/* ── Noise ── */
interface NoiseCity { city: string; overall: number; traffic: number; construction: number; nightAvg: number; level: string; zones: { name: string; db: number }[] }
interface NoiseData { cities: NoiseCity[]; timestamp: number }

/* ── Waste ── */
interface WasteSchedule { city: string; mixed: string[]; plastic: string[]; paper: string[]; glass: string[]; bio: string[]; nextPickup: { type: string; date: string; daysUntil: number } }
interface WasteData { schedules: WasteSchedule[]; timestamp: number }

type Tab = 'reservoirs' | 'water' | 'noise' | 'waste'

const TABS: { key: Tab; icon: string; sk: string }[] = [
  { key: 'reservoirs', icon: '💧', sk: 'Nádrže' },
  { key: 'water', icon: '🚰', sk: 'Voda' },
  { key: 'noise', icon: '🔊', sk: 'Hluk' },
  { key: 'waste', icon: '🗑️', sk: 'Odpad' },
]

const WASTE_TYPES = [
  { key: 'mixed', label: 'Zmesový', emoji: '🗑️', color: 'bg-slate-500/15 text-slate-300' },
  { key: 'plastic', label: 'Plasty', emoji: '♻️', color: 'bg-yellow-500/15 text-yellow-300' },
  { key: 'paper', label: 'Papier', emoji: '📰', color: 'bg-blue-500/15 text-blue-300' },
  { key: 'glass', label: 'Sklo', emoji: '🫙', color: 'bg-green-500/15 text-green-300' },
  { key: 'bio', label: 'Bio', emoji: '🌿', color: 'bg-emerald-500/15 text-emerald-300' },
]

const NOISE_COLORS: Record<string, string> = {
  'nízky': 'text-green-400', 'stredný': 'text-yellow-400', 'vysoký': 'text-orange-400', 'veľmi vysoký': 'text-red-400',
}

export default function EnvironmentWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('reservoirs')
  const [wasteCity, setWasteCity] = useState('Bratislava')

  const reservoirs = useWidget<ReservoirData>('/api/reservoirs', 60 * 60 * 1000)
  const water = useWidget<WaterData>('/api/waterquality', 60 * 60 * 1000)
  const noise = useWidget<NoiseData>('/api/noise', 60 * 60 * 1000)
  const waste = useWidget<WasteData>('/api/waste', 60 * 60 * 1000)

  const refetchAll = () => { reservoirs.refetch(); water.refetch(); noise.refetch(); waste.refetch() }

  const wasteCities = (waste.data?.schedules ?? []).map(s => s.city)
  const wasteSchedule = waste.data?.schedules.find(s => s.city === wasteCity)

  return (
    <WidgetCard accent="green" title={lang === 'sk' ? 'Životné prostredie' : 'Environment'} icon="🌍" onRefresh={refetchAll}
      badge={reservoirs.data ? `${reservoirs.data.avgCapacity}% nádrže` : undefined}>
      {/* Tabs */}
      <div className="flex gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === t.key ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.sk}</span>
          </button>
        ))}
      </div>

      {/* Reservoirs */}
      {tab === 'reservoirs' && (
        <>
          {reservoirs.loading && <SkeletonRows rows={5} />}
          {!reservoirs.loading && reservoirs.data && (
            <div className="space-y-1.5">
              {/* Summary bar */}
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <div className="text-center">
                  <p className="text-[16px] font-bold text-blue-300">{reservoirs.data.avgCapacity}%</p>
                  <p className="text-[8px] text-slate-500">priemer</p>
                </div>
                <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all bg-gradient-to-r from-blue-600 to-blue-400" style={{ width: `${reservoirs.data.avgCapacity}%` }} />
                </div>
                {reservoirs.data.droughtWarning && (
                  <span className="text-[8px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 font-bold shrink-0">
                    ⚠️ {reservoirs.data.droughtCount} pod 40%
                  </span>
                )}
              </div>
              <div className="space-y-0.5 max-h-[260px] overflow-y-auto scrollbar-hide">
                {reservoirs.data.reservoirs.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium text-slate-200 block truncate">{r.name}</span>
                      <span className="text-[8px] text-slate-500">{r.river} · {r.region}</span>
                    </div>
                    <div className="w-20 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${r.capacity}%`,
                        background: r.capacity > 70 ? '#3b82f6' : r.capacity > 40 ? '#f59e0b' : '#ef4444',
                      }} />
                    </div>
                    <span className={`text-[10px] font-bold tabular-nums w-8 text-right ${r.capacity > 70 ? 'text-blue-400' : r.capacity > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {r.capacity}%
                    </span>
                    <span className="text-[8px] w-4">{r.trend === 'stúpa' ? '📈' : r.trend === 'klesá' ? '📉' : '➡️'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Water Quality */}
      {tab === 'water' && (
        <>
          {water.loading && <SkeletonRows rows={4} />}
          {!water.loading && water.data && (
            <div className="space-y-1.5">
              {water.data.allGood && (
                <div className="px-2 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10 text-[9px] text-green-300">
                  ✅ Kvalita pitnej vody je vo všetkých mestách vyhovujúca
                </div>
              )}
              <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-hide">
                {water.data.cities.map((c, i) => (
                  <div key={i} className="rounded-lg p-2.5 border border-white/5 bg-white/[0.02] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-200 flex-1">{c.city}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                        c.quality === 'vyhovujúca' ? 'bg-green-500/15 text-green-300' :
                        c.quality === 'podmienečne vyhovujúca' ? 'bg-yellow-500/15 text-yellow-300' : 'bg-red-500/15 text-red-300'
                      }`}>{c.quality}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[8px]">
                      <div className="rounded bg-white/[0.03] p-1 text-center">
                        <p className="text-slate-500">pH</p>
                        <p className="font-bold text-slate-300">{c.ph}</p>
                      </div>
                      <div className="rounded bg-white/[0.03] p-1 text-center">
                        <p className="text-slate-500">Cl</p>
                        <p className="font-bold text-slate-300">{c.chlorine}</p>
                      </div>
                      <div className="rounded bg-white/[0.03] p-1 text-center">
                        <p className="text-slate-500">Tvrdosť</p>
                        <p className="font-bold text-slate-300">{c.hardnessText}</p>
                      </div>
                      <div className="rounded bg-white/[0.03] p-1 text-center">
                        <p className="text-slate-500">NO₃</p>
                        <p className="font-bold text-slate-300">{c.nitrates}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Noise */}
      {tab === 'noise' && (
        <>
          {noise.loading && <SkeletonRows rows={4} />}
          {!noise.loading && noise.data && (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-hide">
              {noise.data.cities.map((c, i) => (
                <div key={i} className="rounded-lg p-2.5 border border-white/5 bg-white/[0.02] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-200 flex-1">{c.city}</span>
                    <span className={`text-[13px] font-bold tabular-nums ${NOISE_COLORS[c.level] ?? 'text-slate-400'}`}>{c.overall} dB</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                      c.level === 'veľmi vysoký' ? 'bg-red-500/15 text-red-300' :
                      c.level === 'vysoký' ? 'bg-orange-500/15 text-orange-300' :
                      c.level === 'stredný' ? 'bg-yellow-500/15 text-yellow-300' : 'bg-green-500/15 text-green-300'
                    }`}>{c.level}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded bg-white/[0.03] p-1.5 text-center">
                      <p className="text-[8px] text-slate-500">🚗 Doprava</p>
                      <p className="text-[11px] font-bold text-slate-300">{c.traffic} dB</p>
                    </div>
                    <div className="flex-1 rounded bg-white/[0.03] p-1.5 text-center">
                      <p className="text-[8px] text-slate-500">🏗️ Stavba</p>
                      <p className="text-[11px] font-bold text-slate-300">{c.construction} dB</p>
                    </div>
                    <div className="flex-1 rounded bg-white/[0.03] p-1.5 text-center">
                      <p className="text-[8px] text-slate-500">🌙 Noc</p>
                      <p className="text-[11px] font-bold text-slate-300">{c.nightAvg} dB</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Waste */}
      {tab === 'waste' && (
        <>
          {waste.loading && <SkeletonRows rows={4} />}
          {!waste.loading && waste.data && (
            <div className="space-y-2">
              <select value={wasteCity} onChange={e => setWasteCity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none">
                {wasteCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {wasteSchedule && (
                <>
                  {wasteSchedule.nextPickup.daysUntil <= 1 && (
                    <div className="px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-[9px]">
                      ⏰ Najbližší odvoz: <strong className="text-emerald-300">{wasteSchedule.nextPickup.type}</strong> — {wasteSchedule.nextPickup.daysUntil === 0 ? 'Dnes!' : 'Zajtra'}
                    </div>
                  )}
                  {WASTE_TYPES.map(wt => {
                    const dates = wasteSchedule[wt.key as keyof typeof wasteSchedule] as string[]
                    if (!Array.isArray(dates)) return null
                    return (
                      <div key={wt.key} className="flex items-center gap-2 px-2 py-1">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${wt.color}`}>{wt.emoji} {wt.label}</span>
                        <div className="flex flex-wrap gap-1 flex-1">
                          {dates.map((d, i) => (
                            <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded ${i === 0 ? 'bg-white/10 text-white font-bold' : 'text-slate-500'}`}>{d}</span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </>
      )}

      <p className="text-[10px] text-slate-600 mt-2">SVP · ÚVZ · SHMÚ · Mestá SR</p>
    </WidgetCard>
  )
}
