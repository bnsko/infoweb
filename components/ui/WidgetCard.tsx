'use client'

import { type ReactNode, useState } from 'react'
import clsx from 'clsx'

interface Props {
  children: ReactNode
  className?: string
  accent?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'rose' | 'yellow' | 'none'
  title?: string
  icon?: string
  badge?: string | number
  onRefresh?: () => void
}

const accentMap: Record<string, { border: string; glow: string; title: string }> = {
  blue: { border: 'border-blue-500/20', glow: 'glow-blue', title: 'text-blue-400' },
  green: { border: 'border-green-500/20', glow: 'glow-green', title: 'text-green-400' },
  purple: { border: 'border-purple-500/20', glow: 'glow-purple', title: 'text-purple-400' },
  orange: { border: 'border-orange-500/20', glow: 'glow-orange', title: 'text-orange-400' },
  cyan: { border: 'border-cyan-500/20', glow: 'glow-cyan', title: 'text-cyan-400' },
  rose: { border: 'border-rose-500/20', glow: '', title: 'text-rose-400' },
  yellow: { border: 'border-yellow-500/20', glow: '', title: 'text-yellow-400' },
  none: { border: 'border-white/5', glow: '', title: 'text-slate-400' },
}

export default function WidgetCard({ children, className, accent = 'none', title, icon, badge, onRefresh }: Props) {
  const a = accentMap[accent]
  const [spinning, setSpinning] = useState(false)

  const handleRefresh = () => {
    if (!onRefresh) return
    setSpinning(true)
    onRefresh()
    setTimeout(() => setSpinning(false), 800)
  }

  return (
    <div
      className={clsx(
        'widget-card h-full card-entrance',
        a.border,
        a.glow,
        className
      )}
    >
      {(title || icon) && (
        <div className="widget-title">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
          {badge !== undefined && (
            <span className={clsx('ml-auto text-xs px-1.5 py-0.5 rounded-full bg-white/5', a.title)}>
              {badge}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              className={clsx(
                'ml-auto w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all',
                badge !== undefined && '!ml-2'
              )}
              title="Obnovit"
            >
              <svg
                className={clsx('w-3.5 h-3.5', spinning && 'animate-spin')}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
