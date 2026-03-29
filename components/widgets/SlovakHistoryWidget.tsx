'use client'

import { useState } from 'react'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface HistoryEvent {
  year: number
  title: string
  detail: string
  emoji: string
  era: string
}

const SK_HISTORY: HistoryEvent[] = [
  { year: 623, title: 'Samova ríša', detail: 'Prvý štátny útvar Slovanov v strednej Európe pod vedením kupca Sama', emoji: '⚔️', era: 'early' },
  { year: 833, title: 'Veľká Morava', detail: 'Vznik Veľkomoravskej ríše – prvý význam. slovanský štát', emoji: '🏰', era: 'early' },
  { year: 863, title: 'Príchod Cyrila a Metoda', detail: 'Solúnski bratia priniesli písmo a kresťanstvo na Veľkú Moravu', emoji: '✝️', era: 'early' },
  { year: 907, title: 'Bitka pri Bratislave', detail: 'Posledná zmienka o Veľkej Morave, porážka od Maďarov', emoji: '⚔️', era: 'early' },
  { year: 1241, title: 'Tatársky vpád', detail: 'Mongolská invázia spustošila Slovensko, začala výstavba hradov', emoji: '🏹', era: 'medieval' },
  { year: 1467, title: 'Univerzita Istropolitana', detail: 'Prvá univerzita na Slovensku, založená v Bratislave', emoji: '📚', era: 'medieval' },
  { year: 1536, title: 'Bratislava hlavné mesto', detail: 'Bratislava sa stáva korunovačným mestom Uhorska', emoji: '👑', era: 'medieval' },
  { year: 1787, title: 'Bernolákovčina', detail: 'Anton Bernolák kodifikoval prvý slovenský spisovný jazyk', emoji: '📖', era: 'national' },
  { year: 1843, title: 'Štúrovčina', detail: 'Ľudovít Štúr kodifikoval moderný slovenský jazyk', emoji: '🖋️', era: 'national' },
  { year: 1848, title: 'Slovenské povstanie', detail: 'Žiadosti slovenského národa – prvý program Slovákov', emoji: '📜', era: 'national' },
  { year: 1918, title: 'Vznik Československa', detail: '28. októbra vznikla Československá republika', emoji: '🇨🇿', era: 'modern' },
  { year: 1939, title: 'Slovenský štát', detail: 'Vznik prvej Slovenskej republiky pod tlakom nacistov', emoji: '⚠️', era: 'modern' },
  { year: 1944, title: 'SNP', detail: 'Slovenské národné povstanie – najväčší akt odporu', emoji: '💪', era: 'modern' },
  { year: 1968, title: 'Pražská jar', detail: 'Dubčekova liberalizácia ukončená inváziou vojsk Varšavskej zmluvy', emoji: '🌸', era: 'modern' },
  { year: 1989, title: 'Nežná revolúcia', detail: '17. novembra padol komunistický režim', emoji: '🕯️', era: 'modern' },
  { year: 1993, title: 'Vznik Slovenskej republiky', detail: '1. januára vznikla samostatná Slovenská republika', emoji: '🇸🇰', era: 'contemporary' },
  { year: 2004, title: 'Vstup do EÚ a NATO', detail: 'Slovensko sa stalo členom EÚ aj NATO', emoji: '🇪🇺', era: 'contemporary' },
  { year: 2009, title: 'Euro', detail: 'Slovensko prijalo spoločnú európsku menu – euro', emoji: '💶', era: 'contemporary' },
]

const ERAS = [
  { key: 'all', label: 'Všetko', emoji: '🕰️' },
  { key: 'early', label: 'Stredovek', emoji: '⚔️' },
  { key: 'national', label: 'Národné', emoji: '📜' },
  { key: 'modern', label: '20. stor.', emoji: '🏛️' },
  { key: 'contemporary', label: 'Súčasnosť', emoji: '🇸🇰' },
]

export default function SlovakHistoryWidget() {
  const { lang } = useLang()
  const [era, setEra] = useState('all')

  const filtered = era === 'all' ? SK_HISTORY : SK_HISTORY.filter(e => e.era === era)

  return (
    <WidgetCard accent="orange" title={lang === 'sk' ? 'Dejiny Slovenska' : 'Slovak History'} icon="🏰">
      <div className="flex gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5 overflow-x-auto scrollbar-hide">
        {ERAS.map(e => (
          <button key={e.key} onClick={() => setEra(e.key)}
            className={`flex items-center gap-1 shrink-0 text-[10px] font-semibold px-2 py-1.5 rounded-md transition-all ${
              era === e.key ? 'bg-amber-500/15 text-amber-300' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{e.emoji}</span>
            <span>{e.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-0.5 max-h-[340px] overflow-y-auto scrollbar-hide">
        {filtered.map((ev, i) => (
          <div key={i} className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-white/[0.03] transition-colors group">
            <div className="flex flex-col items-center shrink-0 w-12">
              <span className="text-lg">{ev.emoji}</span>
              <span className="text-[11px] font-black text-amber-400 tabular-nums">{ev.year}</span>
            </div>
            <div className="flex-1 min-w-0 border-l-2 border-amber-500/10 pl-2.5">
              <p className="text-[11px] text-slate-200 font-bold">{ev.title}</p>
              <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{ev.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
