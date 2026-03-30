'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Service { name: string; icon: string; url: string; description: string; category: string }
interface EGovData { egov: Service[]; useful: Service[]; timestamp: number }

type Tab = 'egov' | 'useful'

export default function EGovWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('egov')
  const { data, loading, refetch } = useWidget<EGovData>('/api/egov', 60 * 60 * 1000)

  const items = tab === 'egov' ? (data?.egov ?? []) : (data?.useful ?? [])

  return (
    <WidgetCard accent="blue" title={lang === 'sk' ? 'eGov & Užitočné SK' : 'eGov & Useful SK'} icon="🏛️" onRefresh={refetch}>
      <div className="flex gap-0.5 mb-2 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {([
          { key: 'egov' as Tab, label: '🏛️ eGovernment' },
          { key: 'useful' as Tab, label: '🔗 Užitočné SK' },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 text-[9px] font-semibold py-1.5 rounded-md transition-all ${
              tab === t.key ? 'bg-blue-500/15 text-blue-300' : 'text-slate-500 hover:text-slate-300'
            }`}>{t.label}</button>
        ))}
      </div>
      {loading && <SkeletonRows rows={4} />}
      {!loading && data && (
        <div className="grid grid-cols-2 gap-1 max-h-[250px] overflow-y-auto scrollbar-hide">
          {items.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-blue-500/15 transition-all">
              <span className="text-sm shrink-0">{s.icon}</span>
              <div className="min-w-0">
                <div className="text-[9px] text-slate-200 font-semibold truncate">{s.name}</div>
                <div className="text-[7px] text-slate-500 truncate">{s.description}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
