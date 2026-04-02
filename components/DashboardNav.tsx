'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const DASHBOARD_TABS = [
  { id: 'home',     href: '/',          icon: '🏠', label: 'Hlavný' },
  { id: 'daily',    href: '/daily',     icon: '📅', label: 'Denný' },
  { id: 'doprava',  href: '/doprava',   icon: '🚗', label: 'Doprava' },
  { id: 'zdravie',  href: '/zdravie',   icon: '🏥', label: 'Zdravie' },
  { id: 'financie', href: '/financie',  icon: '💶', label: 'Financie' },
  { id: 'tech',     href: '/tech',      icon: '🤖', label: 'Tech' },
] as const

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="sticky top-0 z-30 w-full border-b border-white/[0.06] backdrop-blur-md"
      style={{ background: 'rgba(10,10,10,0.85)' }}>
      <div className="max-w-[1680px] mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1.5">
          {DASHBOARD_TABS.map(tab => {
            const active = pathname === tab.href
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all duration-150 shrink-0',
                  active
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]',
                ].join(' ')}
              >
                <span className="text-sm leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
