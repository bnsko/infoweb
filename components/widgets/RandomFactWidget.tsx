'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Fact {
  text: string
  source: string
  category: string
  emoji: string
}

interface FactData {
  today: Fact
  yesterday: Fact
  timestamp: number
}

export default function RandomFactWidget() {
  const { lang } = useLang()
  const [current, setCurrent] = useState<Fact | null>(null)
  const [history, setHistory] = useState<Fact[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFact = useCallback(() => {
    fetch(`/api/randomfact?_t=${Date.now()}`)
      .then(r => r.json())
      .then((d: FactData) => {
        if (d.today) {
          setCurrent(prev => {
            if (prev && prev.text !== d.today.text) {
              setHistory(h => [prev, ...h].slice(0, 10))
            }
            return d.today
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchFact()
    const iv = setInterval(fetchFact, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [fetchFact])

  return (
    <WidgetCard accent="yellow" title={lang === 'sk' ? 'Zaujímavosti' : 'Fun Facts'} icon="💡" onRefresh={fetchFact}>
      {loading && <SkeletonRows rows={3} />}
      {!loading && current && (
        <div className="space-y-3">
          <div className="px-3 py-3 rounded-xl bg-yellow-500/[0.07] border border-yellow-500/15">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-base">{current.emoji}</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-500">{current.category}</span>
              <span className="text-[8px] text-yellow-400/50 ml-auto">obnova 5 min</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">{current.text}</p>
            <p className="text-[8px] text-slate-500 mt-1.5">Zdroj: {current.source}</p>
          </div>
          {history.length > 0 && (
            <div className="space-y-1 max-h-[200px] overflow-y-auto scrollbar-hide">
              <p className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">Predchádzajúce</p>
              {history.map((f, i) => (
                <div key={i} className="px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-sm">{f.emoji}</span>
                    <span className="text-[8px] text-slate-600">{f.category}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{f.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  )
}
