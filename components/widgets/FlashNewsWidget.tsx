'use client'

import { useState, useEffect, useRef } from 'react'
import { useWidget } from '@/hooks/useWidget'

interface FlashItem {
  title: string
  source: string
  link: string
  timestamp: number
  ago: string
}

interface FlashData {
  items: FlashItem[]
  summary?: string
  timestamp: number
}

const SOURCE_COLORS: Record<string, string> = {
  'SME.sk': '#ef4444',
  'Denník N': '#6366f1',
  'BBC World': '#f59e0b',
  'NYTimes': '#e5e7eb',
  'Aktuality': '#3b82f6',
}

export default function FlashNewsWidget() {
  const { data, loading } = useWidget<FlashData>('/api/flashnews', 2 * 60 * 1000)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const tickerRef = useRef<HTMLDivElement>(null)

  const items = data?.items ?? []

  useEffect(() => {
    if (items.length === 0 || isPaused) return
    const iv = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % items.length)
    }, 5000)
    return () => clearInterval(iv)
  }, [items.length, isPaused])

  if (loading || items.length === 0) return null

  const current = items[currentIdx]
  const sourceColor = SOURCE_COLORS[current?.source ?? ''] ?? '#94a3b8'

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-red-500/15 card-entrance"
      style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.06) 0%, rgba(10,12,18,0.95) 30%, rgba(10,12,18,0.95) 70%, rgba(239,68,68,0.03) 100%)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div ref={tickerRef} className="flex items-center gap-3 px-4 py-2">
        {/* Live dot + label */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Flash</span>
        </div>

        <div className="w-px h-4 bg-red-500/20 shrink-0" />

        {/* Rotating headline */}
        <a
          href={current?.link ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0 flex items-center gap-2 group"
        >
          <span
            key={currentIdx}
            className="text-[11px] text-slate-200 group-hover:text-white font-medium truncate transition-all animate-[fadeSlide_0.4s_ease-out]"
          >
            {current?.title}
          </span>
        </a>

        {/* Source badge */}
        <span
          className="text-[8px] font-bold shrink-0 px-1.5 py-0.5 rounded-md border"
          style={{ color: sourceColor, borderColor: `${sourceColor}30`, backgroundColor: `${sourceColor}10` }}
        >
          {current?.source}
        </span>

        {/* Time ago */}
        <span className="text-[9px] text-slate-600 font-mono shrink-0 tabular-nums">{current?.ago}</span>

        {/* Counter */}
        <span className="text-[9px] text-slate-600 shrink-0 tabular-nums">{currentIdx + 1}/{items.length}</span>
      </div>

      <style jsx>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
