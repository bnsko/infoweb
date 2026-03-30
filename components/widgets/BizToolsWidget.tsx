'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Tool { name: string; icon: string; category: string; description: string; url: string; price: string }
interface ToolsData { tools: Tool[]; categories: string[]; freeCount: number; totalCount: number; timestamp: number }

export default function BizToolsWidget() {
  const { lang } = useLang()
  const [cat, setCat] = useState<string>('all')
  const { data, loading, refetch } = useWidget<ToolsData>('/api/biztools', 60 * 60 * 1000)

  const filtered = cat === 'all' ? (data?.tools ?? []) : (data?.tools ?? []).filter(t => t.category === cat)

  return (
    <WidgetCard accent="cyan" title={lang === 'sk' ? 'Nástroje pre podnikateľov' : 'Biz Tools'} icon="🧰" onRefresh={refetch}
      badge={data ? `${data.totalCount} nástrojov` : undefined}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && data && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <button onClick={() => setCat('all')}
              className={`text-[8px] px-2 py-0.5 rounded-full font-semibold transition-colors ${cat === 'all' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-500 hover:text-slate-300'}`}>
              Všetky ({data.totalCount})
            </button>
            {data.categories.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`text-[8px] px-2 py-0.5 rounded-full font-semibold transition-colors ${cat === c ? 'bg-teal-500/20 text-teal-300' : 'text-slate-500 hover:text-slate-300'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-[250px] overflow-y-auto scrollbar-hide">
            {filtered.map((t, i) => (
              <a key={i} href={t.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-teal-500/15 transition-all">
                <span className="text-sm shrink-0">{t.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] text-slate-200 font-semibold truncate">{t.name}</div>
                  <div className="text-[7px] text-slate-500 truncate">{t.description}</div>
                  <div className="text-[7px] text-teal-400 font-bold">{t.price}</div>
                </div>
              </a>
            ))}
          </div>
          <div className="text-[8px] text-slate-600 text-center">💡 {data.freeCount} nástrojov zadarmo</div>
        </div>
      )}
    </WidgetCard>
  )
}
