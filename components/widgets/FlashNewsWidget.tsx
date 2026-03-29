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
      className="relative overflow-hidden rounded-xl border border-red-500/20 card-entrance"
      style={{ background: 'linear-gradient(90deg, rgba(220,38,38,0.08) 0%, rgba(10,12,18,0.97) 12%, rgba(10,12,18,0.97) 88%, rgba(220,38,38,0.04) 100%)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center min-h-[42px]">
        {/* FLASH label */}
        <div className="flex items-center gap-2 shrink-0 px-4 z-10 bg-gradient-to-r from-red-950/90 to-red-950/0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-lg shadow-red-500/50" />
          </span>
          <span className="text-[11px] font-black text-red-400 uppercase tracking-[0.2em]">Flash</span>
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
                className="inline-flex items-center gap-2.5 px-5 py-2 text-[12px] text-slate-200 hover:text-white font-medium transition-colors shrink-0 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/60 group-hover:bg-red-400 transition-colors shrink-0" />
                <span className="group-hover:underline decoration-red-500/40 underline-offset-2">{item.title}</span>
                <span className="text-[9px] text-slate-600 font-normal">{item.ago}</span>
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
