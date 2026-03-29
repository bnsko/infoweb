'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

/* ── Pharmacies ── */
interface Pharmacy { name: string; city: string; address: string; phone: string; isNight: boolean; isEmergency: boolean; openUntil: string }
interface PharmacyData { pharmacies: Record<string, Pharmacy[]>; timestamp: number }

/* ── Pollen ── */
interface PollenLevel { allergen: string; emoji: string; level: number; levelText: string; forecast: string }
interface PollenData { allergens: PollenLevel[]; activeCount: number; maxLevel: number; season: string; timestamp: number }

/* ── Flu ── */
interface FluData { week: string; incidence: number; trend: string; level: string; regions: { name: string; incidence: number }[]; dominant: string; vaccinated: number }
interface FluResponse { flu: FluData; timestamp: number }

/* ── Doctors ── */
interface Doctor { name: string; type: string; city: string; address: string; phone: string; acceptsNew: boolean; waitDays: number; openHours: string; note: string }
interface DoctorData { doctors: Doctor[]; stats: Record<string, number>; timestamp: number }

type Tab = 'pharmacies' | 'pollen' | 'flu' | 'doctors'

const TABS: { key: Tab; icon: string; sk: string }[] = [
  { key: 'pharmacies', icon: '💊', sk: 'Lekárne' },
  { key: 'pollen', icon: '🌿', sk: 'Peľ' },
  { key: 'flu', icon: '🤒', sk: 'Chrípka' },
  { key: 'doctors', icon: '🩺', sk: 'Lekári' },
]

export default function HealthWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('pharmacies')
  const [doctorType, setDoctorType] = useState<string>('all')

  const pharmacies = useWidget<PharmacyData>('/api/pharmacies', 10 * 60 * 1000)
  const pollen = useWidget<PollenData>('/api/pollen', 60 * 60 * 1000)
  const flu = useWidget<FluResponse>('/api/flu', 60 * 60 * 1000)
  const doctors = useWidget<DoctorData>('/api/doctors', 60 * 60 * 1000)

  const refetchAll = () => { pharmacies.refetch(); pollen.refetch(); flu.refetch(); doctors.refetch() }

  const cities = Object.keys(pharmacies.data?.pharmacies ?? {})
  const [city, setCity] = useState('')
  const cityPharmacies = pharmacies.data?.pharmacies?.[city || cities[0]] ?? []

  const filteredDoctors = doctorType === 'all'
    ? (doctors.data?.doctors ?? [])
    : (doctors.data?.doctors ?? []).filter(d => d.type === doctorType)

  return (
    <WidgetCard accent="green" title={lang === 'sk' ? 'Zdravie' : 'Health'} icon="🏥" onRefresh={refetchAll}>
      {/* Tabs */}
      <div className="flex gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === t.key ? 'bg-green-500/15 text-green-300' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.sk}</span>
          </button>
        ))}
      </div>

      {/* Pharmacies */}
      {tab === 'pharmacies' && (
        <>
          {pharmacies.loading && <SkeletonRows rows={4} />}
          {!pharmacies.loading && pharmacies.data && (
            <>
              {cities.length > 1 && (
                <select
                  value={city || cities[0]}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 mb-2 focus:outline-none"
                >
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              <div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-hide">
                {cityPharmacies.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-4">Žiadne údaje</p>
                ) : cityPharmacies.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg p-1.5 widget-item-hover">
                    <span className="text-sm shrink-0 mt-0.5">💊</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-slate-200 font-medium line-clamp-1">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-slate-500">{p.address}</span>
                        {p.openUntil && <span className="text-[9px] text-slate-600">do {p.openUntil}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {p.isNight && <span className="text-[7px] px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">24h</span>}
                      {p.isEmergency && <span className="text-[7px] px-1 py-0.5 rounded bg-red-500/15 text-red-300 font-bold">Pohot.</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Pollen */}
      {tab === 'pollen' && (
        <>
          {pollen.loading && <SkeletonRows rows={4} />}
          {!pollen.loading && pollen.data && (
            <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-hide">
              {pollen.data.activeCount === 0 ? (
                <div className="text-center py-4">
                  <span className="text-xl">🌨️</span>
                  <p className="text-[10px] text-slate-500 mt-1">Mimo peľovej sezóny</p>
                </div>
              ) : pollen.data.allergens.map((a, i) => {
                const colors = ['bg-slate-500/30', 'bg-emerald-500/50', 'bg-yellow-500/50', 'bg-orange-500/50', 'bg-red-500/50']
                return (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03]">
                    <span className="text-base w-6 text-center">{a.emoji}</span>
                    <span className="text-[10px] text-slate-300 flex-1">{a.allergen}</span>
                    <div className="flex gap-0.5">
                      {[0, 1, 2, 3].map(l => (
                        <div key={l} className={`w-3 h-1.5 rounded-full ${l < a.level ? colors[a.level] : 'bg-white/5'}`} />
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-500 w-14 text-right">{a.levelText}</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Flu */}
      {tab === 'flu' && (
        <>
          {flu.loading && <SkeletonRows rows={4} />}
          {!flu.loading && flu.data?.flu && (
            <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-hide">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  flu.data.flu.level === 'epidémia' ? 'bg-red-500/15 text-red-300' :
                  flu.data.flu.level === 'zvýšená' ? 'bg-orange-500/15 text-orange-300' :
                  flu.data.flu.level === 'bežná' ? 'bg-yellow-500/15 text-yellow-300' : 'bg-green-500/15 text-green-300'
                }`}>{flu.data.flu.level}</span>
                <span className="text-[9px] text-slate-500">{flu.data.flu.trend === 'up' ? '📈' : flu.data.flu.trend === 'down' ? '📉' : '➡️'} {flu.data.flu.incidence}/100k</span>
              </div>
              {flu.data.flu.regions.map((r, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1">
                  <span className="text-[10px] text-slate-300 flex-1">{r.name}</span>
                  <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500/60" style={{ width: `${Math.min(100, r.incidence / 30 * 100)}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 w-12 text-right">{r.incidence}</span>
                </div>
              ))}
              <div className="text-[9px] text-slate-500 mt-1">
                💉 Zaočkovanosť: {flu.data.flu.vaccinated}% · Dominantný: {flu.data.flu.dominant}
              </div>
            </div>
          )}
        </>
      )}

      {/* Doctors */}
      {tab === 'doctors' && (
        <>
          {doctors.loading && <SkeletonRows rows={4} />}
          {!doctors.loading && doctors.data && (
            <>
              <div className="flex gap-1 mb-2">
                {[{ key: 'all', icon: '📋', label: 'Všetci' }, { key: 'vseobecny', icon: '🩺', label: 'Všeobecní' }, { key: 'zubar', icon: '🦷', label: 'Zubári' }, { key: 'veterinar', icon: '🐾', label: 'Veterinári' }].map(t => (
                  <button key={t.key} onClick={() => setDoctorType(t.key)}
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold transition-colors ${doctorType === t.key ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              <div className="space-y-0.5 max-h-[240px] overflow-y-auto scrollbar-hide">
                {filteredDoctors.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-4">Žiadne údaje</p>
                ) : filteredDoctors.map((d, i) => (
                  <div key={i} className={`flex items-start gap-2 rounded-lg p-1.5 widget-item-hover ${!d.acceptsNew ? 'opacity-50' : ''}`}>
                    <span className="text-sm shrink-0 mt-0.5">{d.type === 'zubar' ? '🦷' : d.type === 'veterinar' ? '🐾' : '🩺'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-slate-200 font-medium line-clamp-1">{d.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-slate-500">📍 {d.city}</span>
                        {d.waitDays > 0 && <span className="text-[9px] text-slate-600">⏳ {d.waitDays}d</span>}
                      </div>
                    </div>
                    {d.acceptsNew && <span className="text-[7px] px-1 py-0.5 rounded bg-green-500/15 text-green-300 font-bold shrink-0">Prijíma</span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </WidgetCard>
  )
}
