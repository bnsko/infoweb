'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'

interface QuoteData {
  quote: { text: string; author: string; category: string }
  fact: { text: string; emoji: string; category: string }
}

interface HoroscopeSign {
  name: string; nameEn: string; emoji: string; stars: number
  luckyNumber: number; focus: string; prediction: string
}
interface HoroscopeData {
  currentSign: number; horoscopes: HoroscopeSign[]; date: string
}

/* ── Mini expandable widget for daily quote ── */
function QuoteMini() {
  const { lang } = useLang()
  const { data } = useWidget<QuoteData>('/api/daily-quote', 60 * 60 * 1000)
  const [open, setOpen] = useState(false)

  if (!data) return null

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
          open ? 'bg-purple-500/15 border-purple-500/25 text-purple-300' : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-purple-300 hover:border-purple-500/20'
        }`}>
        <span>💬</span>
        <span className="hidden sm:inline">{lang === 'sk' ? 'Citát' : 'Quote'}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm bg-slate-900 border border-purple-500/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-purple-300">💬 {lang === 'sk' ? 'Denný citát' : 'Daily Quote'}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
            </div>
            <div className="relative bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/15 rounded-xl p-4">
              <span className="absolute top-2 left-3 text-3xl text-purple-500/20 font-serif">&ldquo;</span>
              <p className="text-[12px] text-slate-200 leading-relaxed italic pl-4 pr-2">{data.quote.text}</p>
              <div className="flex items-center justify-between mt-2 pl-4">
                <span className="text-[10px] text-purple-400 font-semibold">— {data.quote.author}</span>
                <span className="text-[8px] text-slate-600 uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-white/5">{data.quote.category}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Mini expandable widget for horoscope ── */
function HoroscopeMini(props: { onOpenChange?: (open: boolean) => void }) {
  const { onOpenChange } = props
  const { lang } = useLang()
  const { data } = useWidget<HoroscopeData>('/api/horoscope', 60 * 60 * 1000)
  const [open, setOpen] = useState(false)
  const [selectedSign, setSelectedSign] = useState<number | null>(null)
  useEffect(() => { onOpenChange?.(open) }, [open, onOpenChange])

  if (!data) return null

  const current = data.horoscopes[data.currentSign]
  const viewing = selectedSign !== null ? data.horoscopes[selectedSign] : current

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
          open ? 'bg-indigo-500/15 border-indigo-500/25 text-indigo-300' : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/20'
        }`}>
        <span>{current?.emoji}</span>
        <span className="hidden sm:inline">{current?.name}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-[var(--bg-card)] border border-indigo-500/20 rounded-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-indigo-300">✨ {lang === 'sk' ? 'Denný horoskop' : 'Daily Horoscope'}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
            </div>
            {/* Sign selector - beautiful grid */}
            <div className="grid grid-cols-6 gap-1.5 mb-4">
              {data.horoscopes.map((s, i) => (
                <button key={i} onClick={() => setSelectedSign(i)}
                  className={`flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all ${
                    (selectedSign ?? data.currentSign) === i
                      ? 'bg-indigo-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                      : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05] hover:border-white/10'
                  }`} title={s.name}>
                  <span className="text-xl">{s.emoji}</span>
                  <span className={`text-[7px] font-semibold ${(selectedSign ?? data.currentSign) === i ? 'text-indigo-300' : 'text-slate-500'}`}>{s.name}</span>
                </button>
              ))}
            </div>
            {/* Selected sign detail */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/15 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{viewing.emoji}</span>
                <div className="flex-1">
                  <p className="text-lg font-bold text-white">{viewing.name}</p>
                  <p className="text-[10px] text-slate-500">{viewing.nameEn}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-0.5 justify-end">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`text-sm ${i < viewing.stars ? 'text-yellow-400' : 'text-slate-700'}`}>★</span>
                    ))}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Šťastné číslo</div>
                  <div className="text-xl font-bold text-indigo-300 font-mono">{viewing.luckyNumber}</div>
                </div>
              </div>
              <p className="text-[12px] text-slate-200 leading-relaxed">{viewing.prediction}</p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full font-semibold">🎯 {viewing.focus}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Inline fact display ── */
function RandomFact() {
  const { lang } = useLang()
  const { data } = useWidget<QuoteData>('/api/daily-quote', 60 * 60 * 1000)
  if (!data) return null
  return (
    <div className="hidden xl:flex items-center gap-1.5 min-w-0 max-w-md">
      <span className="text-[10px]">{data.fact.emoji}</span>
      <span className="text-[9px] text-slate-500 font-medium">{lang === 'sk' ? 'Vedeli ste?' : 'Did you know?'}</span>
      <span className="text-[9px] text-slate-400 truncate">{data.fact.text}</span>
    </div>
  )
}

/* ── Mini expandable widget for daily fact ── */
function FactMini() {
  const { lang } = useLang()
  const { data } = useWidget<QuoteData>('/api/daily-quote', 60 * 60 * 1000)
  const [open, setOpen] = useState(false)

  if (!data) return null

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
          open ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300' : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/20'
        }`}>
        <span>{data.fact.emoji}</span>
        <span className="hidden sm:inline">{lang === 'sk' ? 'Fakt' : 'Fact'}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-emerald-300">{data.fact.emoji} {lang === 'sk' ? 'Denný fakt' : 'Daily Fact'}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/15 rounded-xl p-4">
              <p className="text-[12px] text-slate-200 leading-relaxed">{data.fact.text}</p>
              <div className="mt-2">
                <span className="text-[8px] text-slate-600 uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-white/5">{data.fact.category}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { QuoteMini, HoroscopeMini, RandomFact, FactMini }

export default function DailyQuoteWidget() {
  return null
}
