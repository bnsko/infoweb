'use client'

import { useRef, useEffect, useState } from 'react'
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

export default function FlashNewsWidget() {
  const { data, loading } = useWidget<FlashData>('/api/flashnews', 30 * 1000)
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  // Only show last 10 items
  const items = (data?.items ?? []).slice(0, 10)

  useEffect(() => {
    const el = trackRef.current
    if (!el || items.length === 0) return
    const scrollW = el.scrollWidth / 2
    const speed = 50
    const dur = scrollW / speed
    el.style.animationDuration = `${dur}s`
  }, [items])

  if (loading || items.length === 0) return null

  return (
    <div
      className="relative overflow-hidden rounded-lg card-entrance"
      style={{ background: 'rgba(10,12,18,0.6)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center min-h-[30px]">
        {/* Subtle FLASH dot + label */}
        <div className="flex items-center gap-1.5 shrink-0 px-3 z-10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
          </span>
          <span className="text-[9px] font-bold text-amber-500/70 uppercase tracking-widest">Správy</span>
        </div>

        {/* Scrolling ticker track */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={trackRef}
            className={`flash-scroll-track inline-flex items-center whitespace-nowrap ${isPaused ? 'paused' : ''}`}
          >
            {[...items, ...items].map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors shrink-0 group"
              >
                <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors shrink-0" />
                <span className="group-hover:underline decoration-slate-500/40 underline-offset-2">{item.title}</span>
                <span className="text-[8px] text-slate-600 font-normal">{item.ago}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes flashScrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .flash-scroll-track {
          animation: flashScrollLeft 60s linear infinite;
        }
        .flash-scroll-track.paused {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
