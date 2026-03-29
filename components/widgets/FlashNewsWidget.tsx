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
  const { data, loading } = useWidget<FlashData>('/api/flashnews', 60 * 1000)
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  const items = data?.items ?? []

  // Continuous scroll via CSS animation - calculate duration based on content width
  useEffect(() => {
    const el = trackRef.current
    if (!el || items.length === 0) return
    const scrollW = el.scrollWidth / 2 // half because we duplicate
    const speed = 60 // px per second
    const dur = scrollW / speed
    el.style.animationDuration = `${dur}s`
  }, [items])

  if (loading || items.length === 0) return null

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-red-500/15 card-entrance"
      style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.06) 0%, rgba(10,12,18,0.95) 15%, rgba(10,12,18,0.95) 85%, rgba(239,68,68,0.03) 100%)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center min-h-[40px]">
        {/* FLASH label - fixed on left */}
        <div className="flex items-center gap-1.5 shrink-0 px-3 sm:px-4 z-10 bg-[rgba(10,12,18,0.97)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Flash</span>
          <div className="w-px h-4 bg-red-500/20 ml-1" />
        </div>

        {/* Scrolling ticker track */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={trackRef}
            className={`flash-scroll-track inline-flex items-center whitespace-nowrap ${isPaused ? 'paused' : ''}`}
          >
            {/* Duplicate items for seamless loop */}
            {[...items, ...items].map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-[11px] sm:text-[12px] text-slate-200 hover:text-white font-medium transition-colors shrink-0"
              >
                <span className="text-red-400/60">●</span>
                <span>{item.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Counter - fixed on right */}
        <div className="shrink-0 px-3 z-10 bg-[rgba(10,12,18,0.97)]">
          <span className="text-[9px] text-slate-600 tabular-nums">{items.length}</span>
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
