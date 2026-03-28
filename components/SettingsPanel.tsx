'use client'

import { useState } from 'react'
import { usePrefs } from '@/hooks/usePrefs'
import { useLang } from '@/hooks/useLang'

const WIDGET_LIST = [
  { id: 'quicksummary', label: '⚡ Rýchly prehľad', labelEn: '⚡ Quick Summary' },
  { id: 'daysummary', label: '📅 Prehľad dňa', labelEn: '📅 Day Summary' },
  { id: 'flashnews', label: '🔴 Flash správy', labelEn: '🔴 Flash News' },
  { id: 'stats', label: '☀️ Počasie', labelEn: '☀️ Weather' },
  { id: 'news', label: '📰 Správy', labelEn: '📰 News' },
  { id: 'politics', label: '🏛️ Politika & Zdravie', labelEn: '🏛️ Politics & Health' },
  { id: 'finance', label: '💶 Financie', labelEn: '💶 Finance' },
  { id: 'transport', label: '🚗 Doprava & Šport', labelEn: '🚗 Transport & Sports' },
  { id: 'prices', label: '💰 Ceny', labelEn: '💰 Prices' },
  { id: 'counters', label: '📊 Štatistiky', labelEn: '📊 Statistics' },
  { id: 'space', label: '🔭 Vesmír', labelEn: '🔭 Space' },
  { id: 'fun', label: '🎮 Zábava', labelEn: '🎮 Entertainment' },
  { id: 'restaurants', label: '🍽️ Reštaurácie', labelEn: '🍽️ Restaurants' },
  { id: 'invest', label: '📈 Investície', labelEn: '📈 Investments' },
  { id: 'ai', label: '🤖 AI & Tech', labelEn: '🤖 AI & Tech' },
  { id: 'extras', label: '🔭 Objavy', labelEn: '🔭 Discover' },
  { id: 'history', label: '📚 História', labelEn: '📚 History' },
]

export default function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const { prefs, setPrefs, toggleWidget, isWidgetVisible, resetPrefs } = usePrefs()
  const { lang, setLang } = useLang()

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-800/90 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/90 transition-all shadow-lg backdrop-blur-sm"
        title={lang === 'sk' ? 'Nastavenia' : 'Settings'}
      >
        ⚙️
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">
            {lang === 'sk' ? '⚙️ Nastavenia' : '⚙️ Settings'}
          </h2>
          <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors text-xl">✕</button>
        </div>

        {/* Language */}
        <div className="mb-4">
          <div className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold mb-2">
            {lang === 'sk' ? 'Jazyk' : 'Language'}
          </div>
          <div className="flex gap-2">
            {(['sk', 'en'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                  lang === l
                    ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                    : 'border-white/8 text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {l === 'sk' ? '🇸🇰 Slovensky' : '🇬🇧 English'}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="mb-4">
          <div className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold mb-2">
            {lang === 'sk' ? 'Téma' : 'Theme'}
          </div>
          <div className="flex gap-2">
            {[
              { key: 'dark' as const, label: '🌙 Dark', color: '#0f172a' },
              { key: 'midnight' as const, label: '🌌 Midnight', color: '#020617' },
              { key: 'ocean' as const, label: '🌊 Ocean', color: '#0c1929' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setPrefs({ ...prefs, theme: t.key })}
                className={`text-xs px-3 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                  prefs.theme === t.key
                    ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                    : 'border-white/8 text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: t.color }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compact mode */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.compactMode}
              onChange={() => setPrefs({ ...prefs, compactMode: !prefs.compactMode })}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/50"
            />
            <span className="text-sm text-slate-300">
              {lang === 'sk' ? 'Kompaktný režim' : 'Compact mode'}
            </span>
          </label>
        </div>

        {/* Widget visibility */}
        <div className="mb-4">
          <div className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold mb-2">
            {lang === 'sk' ? 'Zobrazené widgety' : 'Visible widgets'}
          </div>
          <div className="space-y-1">
            {WIDGET_LIST.map(w => (
              <label key={w.id} className="flex items-center gap-3 cursor-pointer py-1 px-2 rounded-lg hover:bg-white/3 transition-all">
                <input
                  type="checkbox"
                  checked={isWidgetVisible(w.id)}
                  onChange={() => toggleWidget(w.id)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/50"
                />
                <span className="text-sm text-slate-300">{lang === 'sk' ? w.label : w.labelEn}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={resetPrefs}
          className="w-full text-sm text-slate-500 hover:text-red-400 py-2 rounded-lg border border-white/5 hover:border-red-500/20 transition-all"
        >
          {lang === 'sk' ? '🔄 Obnoviť predvolené' : '🔄 Reset to defaults'}
        </button>
      </div>
    </div>
  )
}
