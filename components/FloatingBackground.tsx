'use client'
import { useEffect, useRef } from 'react'

const ICONS = [
  '🇸🇰', '⛰️', '🏰', '🌲', '⚽', '☀️', '🌧️', '❄️',
  '🚗', '✈️', '🚂', '🏔️', '🎿', '🍺', '🎭', '📰',
  '💶', '📊', '🔐', '🤖', '🌍', '⚡', '🛰️', '🏛️',
]

interface Particle {
  el: HTMLSpanElement
  duration: number
}

export default function FloatingBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const particles = useRef<Particle[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function spawn() {
      if (!container) return
      const el = document.createElement('span')
      el.textContent = ICONS[Math.floor(Math.random() * ICONS.length)]
      el.style.cssText = [
        'position:absolute',
        `left:${Math.random() * 100}vw`,
        `font-size:${Math.random() * 14 + 10}px`,
        'line-height:1',
        'pointer-events:none',
        'user-select:none',
        'will-change:transform,opacity',
      ].join(';')

      const dur = Math.random() * 20 + 16
      el.style.animation = `floatUp ${dur}s linear forwards`
      el.style.opacity = '0'
      container.appendChild(el)

      const p: Particle = { el, duration: dur }
      particles.current.push(p)

      setTimeout(() => {
        el.remove()
        particles.current = particles.current.filter(x => x !== p)
      }, dur * 1000 + 500)
    }

    // Stagger initial spawn
    for (let i = 0; i < 10; i++) {
      setTimeout(spawn, i * 600)
    }
    const iv = setInterval(spawn, 1400)

    return () => {
      clearInterval(iv)
      particles.current.forEach(p => p.el.remove())
      particles.current = []
    }
  }, [])

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 0; }
          8%   { opacity: 0.12; }
          88%  { opacity: 0.06; }
          100% { transform: translateY(-110vh) rotate(180deg); opacity: 0; }
        }
      `}</style>
      <div
        ref={containerRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
        style={{ bottom: '-80px' }}
      />
    </>
  )
}
