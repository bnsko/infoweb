'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Suggestion {
  emoji: string; title: string; desc: string; intensity: string
}

interface SportData {
  suggestions: Suggestion[]
  weather: { temp: number; feelsLike: number; weatherCode: number; windSpeed: number; precipitation: number; weatherDesc: string }
}

const INTENSITY_COLORS: Record<string, string> = {
  'vysoká': 'bg-red-500/15 text-red-400 border-red-500/20',
  'stredná': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  'nízka': 'bg-green-500/15 text-green-400 border-green-500/20',
}

export default function SportSuggestionsWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<SportData>('/api/sport-suggestions', 30 * 60 * 1000)

  return (
    <WidgetCard accent="green" title={lang === 'sk' ? 'Čo robiť dnes?' : 'What to do today?'} icon="🏃" onRefresh={refetch}>
      {/* Current weather badge */}
      {data?.weather && (
        <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-blue-500/8 border border-blue-500/15 text-[10px] flex-wrap">
          <span className="text-blue-300 font-semibold">🌡️ {data.weather.temp}°C</span>
          <span className="text-slate-500">·</span>
          <span className="text-cyan-300 font-semibold">🤒 pocit {data.weather.feelsLike}°C</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{data.weather.weatherDesc}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">💨 {data.weather.windSpeed} km/h</span>
          {data.weather.precipitation > 0 && (
            <>
              <span className="text-slate-500">·</span>
              <span className="text-blue-400">🌧️ {data.weather.precipitation} mm</span>
            </>
          )}
        </div>
      )}

      {loading && <SkeletonRows rows={4} />}

      {!loading && data && (
        <div className="space-y-1.5">
          {data.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl p-2.5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
              <span className="text-xl shrink-0 mt-0.5">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white font-semibold">{s.title}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-bold ${INTENSITY_COLORS[s.intensity] ?? INTENSITY_COLORS['stredná']}`}>
                    {s.intensity}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-600 mt-2">AI · {lang === 'sk' ? 'na základe počasia · obnova 30 min' : 'weather-based · refresh 30 min'}</p>
    </WidgetCard>
  )
}
