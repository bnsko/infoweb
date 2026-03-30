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

type Tab = 'pollen' | 'flu' | 'doctors'

const POLLEN_INFO: Record<string, string> = {
  'Trávy': 'Najčastejší alergén na SK. Sezóna máj-august.',
  'Breza': 'Silný jarný alergén (marec-máj). Peľ sa šíri vetrom.',
  'Ambrózia': 'Agresívny letný/jesenný alergén (aug-okt).',
  'Palina': 'Letný alergén (júl-sept).',
  'Lieska': 'Prvý jarný alergén (feb-mar). Krížová reakcia s brezou.',
  'Jelša': 'Skorý jarný alergén (feb-apr).',
}

const FLU_LEVEL_INFO: Record<string, { desc: string; advice: string }> = {
  'epidémia': { desc: 'Epidemický prah prekročený.', advice: '⚠️ Noste rúška, umývajte si ruky, vyhýbajte sa davom.' },
  'zvýšená': { desc: 'Zvýšená aktivita chrípkových vírusov.', advice: '💡 Odporúčame zvýšenú hygienu a odpočinok.' },
  'bežná': { desc: 'Bežná chrípková aktivita. V norme.', advice: '✅ Bežná prevencia — výživa, pohyb, spánok.' },
  'nízka': { desc: 'Nízka aktivita. Sporadický výskyt.', advice: '✅ Bez zvláštnych opatrení.' },
}

export default function HealthWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('pollen')
  const [doctorType, setDoctorType] = useState<string>('all')
  const [doctorCity, setDoctorCity] = useState<string>('all')
  const [pharmFilter, setPharmFilter] = useState<'all' | 'emergency' | 'night'>('all')

  const pharmacies = useWidget<PharmacyData>('/api/pharmacies', 10 * 60 * 1000)
  const pollen = useWidget<PollenData>('/api/pollen', 60 * 60 * 1000)
  const flu = useWidget<FluResponse>('/api/flu', 60 * 60 * 1000)
  const doctors = useWidget<DoctorData>('/api/doctors', 60 * 60 * 1000)

  const refetchAll = () => { pharmacies.refetch(); pollen.refetch(); flu.refetch(); doctors.refetch() }

  const cities = Object.keys(pharmacies.data?.pharmacies ?? {})
  const [city, setCity] = useState('')
  const allPharmacies = pharmacies.data?.pharmacies?.[city || cities[0]] ?? []
  const emergencyPharmacies = allPharmacies.filter(p => p.isEmergency || p.isNight)
  const filteredPharmacies = pharmFilter === 'emergency' ? allPharmacies.filter(p => p.isEmergency) :
    pharmFilter === 'night' ? allPharmacies.filter(p => p.isNight) : allPharmacies

  const allDoctors = doctors.data?.doctors ?? []
  const doctorCities = Array.from(new Set(allDoctors.map(d => d.city))).sort()
  const filteredDoctors = allDoctors
    .filter(d => doctorType === 'all' || d.type === doctorType)
    .filter(d => doctorCity === 'all' || d.city === doctorCity)

  const TABS: { key: Tab; icon: string; sk: string }[] = [
    { key: 'pollen', icon: '🌿', sk: 'Peľ' },
    { key: 'flu', icon: '🤒', sk: 'Chrípka' },
    { key: 'doctors', icon: '🩺', sk: 'Lekári' },
  ]

  return (
    <WidgetCard accent="green" title={lang === 'sk' ? 'Zdravie' : 'Health'} icon="🏥" onRefresh={refetchAll}>
      {/* ── Pharmacies & Emergency — always visible ── */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm">💊</span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Lekárne & Pohotovosť</span>
          {emergencyPharmacies.length > 0 && <span className="text-[8px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold bg-red-500/15 text-red-300">{emergencyPharmacies.length}</span>}
          <div className="flex-1 h-px bg-white/5" />
        </div>
        {pharmacies.loading ? <SkeletonRows rows={2} /> : !pharmacies.data ? null : (
          <>
            <div className="flex gap-1 mb-2">
              {([
                { key: 'all' as const, label: '📋 Všetky' },
                { key: 'emergency' as const, label: '🚨 Pohotovosť' },
                { key: 'night' as const, label: '🌙 Nočné' },
              ] as const).map(f => (
                <button key={f.key} onClick={() => setPharmFilter(f.key)}
                  className={`text-[9px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                    pharmFilter === f.key ? 'bg-green-500/20 text-green-300' : 'text-slate-500 hover:text-slate-300'
                  }`}>{f.label}</button>
              ))}
            </div>
            {cities.length > 1 && (
              <select value={city || cities[0]} onChange={e => setCity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 mb-2 focus:outline-none">
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <div className="space-y-0.5 max-h-[160px] overflow-y-auto scrollbar-hide">
              {filteredPharmacies.length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center py-2">Žiadne lekárne v tejto kategórii</p>
              ) : filteredPharmacies.slice(0, 6).map((p, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg p-1.5 widget-item-hover">
                  <span className="text-sm shrink-0 mt-0.5">{p.isEmergency ? '🚨' : '💊'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-200 font-medium line-clamp-1">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-slate-500">📍 {p.address}</span>
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
      </div>

      {/* ── Tabs: Pollen, Flu, Doctors ── */}
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

      {/* Pollen extensive */}
      {tab === 'pollen' && (
        <>
          {pollen.loading && <SkeletonRows rows={4} />}
          {!pollen.loading && pollen.data && (
            <div className="space-y-2 max-h-[340px] overflow-y-auto scrollbar-hide">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10 text-[9px]">
                🌿 <span className="text-green-300 font-bold">Sezóna: {pollen.data.season}</span>
                <span className="text-slate-500">{pollen.data.activeCount > 0 ? `${pollen.data.activeCount} aktívnych alergénov` : 'Mimo sezóny'}</span>
              </div>
              {pollen.data.activeCount === 0 ? (
                <div className="text-center py-4">
                  <span className="text-xl">🌨️</span>
                  <p className="text-[10px] text-slate-500 mt-1">Mimo peľovej sezóny</p>
                </div>
              ) : pollen.data.allergens.map((a, i) => {
                const colors = ['bg-slate-500/30', 'bg-emerald-500/50', 'bg-yellow-500/50', 'bg-orange-500/50', 'bg-red-500/50']
                const info = POLLEN_INFO[a.allergen] ?? ''
                return (
                  <div key={i} className="rounded-lg p-2 border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{a.emoji}</span>
                      <span className="text-[10px] font-semibold text-slate-200 flex-1">{a.allergen}</span>
                      <div className="flex gap-0.5">
                        {[0, 1, 2, 3].map(l => (
                          <div key={l} className={`w-3 h-1.5 rounded-full ${l < a.level ? colors[a.level] : 'bg-white/5'}`} />
                        ))}
                      </div>
                      <span className="text-[9px] text-slate-500 w-14 text-right font-semibold">{a.levelText}</span>
                    </div>
                    {info && <p className="text-[8px] text-slate-500 mt-1 pl-7">{info}</p>}
                    {a.forecast && <p className="text-[8px] text-amber-400/60 mt-0.5 pl-7">📊 {a.forecast}</p>}
                  </div>
                )
              })}
              <div className="px-2 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[8px] text-amber-300/80">
                💡 Peľ najviac lieta ráno (5-10h) a za suchého vetra. Po daždi je vzduch čistejší.
              </div>
            </div>
          )}
        </>
      )}

      {/* Flu extensive */}
      {tab === 'flu' && (
        <>
          {flu.loading && <SkeletonRows rows={4} />}
          {!flu.loading && flu.data?.flu && (() => {
            const f = flu.data!.flu
            const levelInfo = FLU_LEVEL_INFO[f.level] ?? FLU_LEVEL_INFO['bežná']
            return (
              <div className="space-y-2 max-h-[340px] overflow-y-auto scrollbar-hide">
                <div className={`rounded-xl p-3 border space-y-1.5 ${
                  f.level === 'epidémia' ? 'bg-red-500/8 border-red-500/20' :
                  f.level === 'zvýšená' ? 'bg-orange-500/8 border-orange-500/20' : 'bg-green-500/5 border-green-500/15'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      f.level === 'epidémia' ? 'bg-red-500/15 text-red-300' :
                      f.level === 'zvýšená' ? 'bg-orange-500/15 text-orange-300' :
                      f.level === 'bežná' ? 'bg-yellow-500/15 text-yellow-300' : 'bg-green-500/15 text-green-300'
                    }`}>{f.level.toUpperCase()}</span>
                    <span className="text-[10px] text-slate-400">{f.trend === 'up' ? '📈 Stúpa' : f.trend === 'down' ? '📉 Klesá' : '➡️ Stabilná'}</span>
                  </div>
                  <p className="text-[9px] text-slate-400">{levelInfo.desc}</p>
                  <p className="text-[9px] font-medium">{levelInfo.advice}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2 text-center">
                    <p className="text-[14px] font-bold text-rose-300">{f.incidence}</p>
                    <p className="text-[8px] text-slate-500">na 100k obyv.</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2 text-center">
                    <p className="text-[14px] font-bold text-cyan-300">{f.vaccinated}%</p>
                    <p className="text-[8px] text-slate-500">zaočkovaných</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2 text-center">
                    <p className="text-[12px] font-bold text-amber-300">{f.dominant}</p>
                    <p className="text-[8px] text-slate-500">dominantný</p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">Chorobnosť podľa krajov</p>
                {f.regions.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1">
                    <span className="text-[10px] text-slate-300 flex-1">{r.name}</span>
                    <div className="w-20 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, r.incidence / 30 * 100)}%`, background: r.incidence > 20 ? '#ef4444' : r.incidence > 10 ? '#f59e0b' : '#22c55e' }} />
                    </div>
                    <span className={`text-[10px] font-bold tabular-nums w-10 text-right ${r.incidence > 20 ? 'text-red-400' : r.incidence > 10 ? 'text-orange-400' : 'text-emerald-400'}`}>{r.incidence}</span>
                  </div>
                ))}
              </div>
            )
          })()}
        </>
      )}

      {/* Doctors with city filter */}
      {tab === 'doctors' && (
        <>
          {doctors.loading && <SkeletonRows rows={4} />}
          {!doctors.loading && doctors.data && (
            <>
              <div className="flex flex-wrap gap-1 mb-2">
                {[{ key: 'all', icon: '📋', label: 'Všetci' }, { key: 'vseobecny', icon: '🩺', label: 'Všeobecní' }, { key: 'zubar', icon: '🦷', label: 'Zubári' }, { key: 'detsky', icon: '👶', label: 'Detskí' }, { key: 'veterinar', icon: '🐾', label: 'Veterinári' }].map(t => (
                  <button key={t.key} onClick={() => setDoctorType(t.key)}
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold transition-colors ${doctorType === t.key ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              {doctorCities.length > 0 && (
                <select value={doctorCity} onChange={e => setDoctorCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 mb-2 focus:outline-none">
                  <option value="all">📍 Všetky mestá</option>
                  {doctorCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              <div className="space-y-0.5 max-h-[240px] overflow-y-auto scrollbar-hide">
                {filteredDoctors.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-4">Žiadni lekári</p>
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
