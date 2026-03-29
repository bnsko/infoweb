'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Outage {
  provider: string; region: string; type: string; status: string; affected: string; since: string; eta?: string
}

interface ServiceStatus {
  name: string; icon: string; status: 'ok' | 'issues' | 'down'; detail?: string
}

interface OutageData {
  outages: Outage[]; services?: ServiceStatus[]; totalActive: number; allClear: boolean; timestamp: number
}

type Tab = 'isp' | 'services'

export default function OutagesWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('isp')
  const { data, loading, error, refetch } = useWidget<OutageData>('/api/outages', 5 * 60 * 1000)

  const issueServices = (data?.services ?? []).filter(s => s.status !== 'ok')

  return (
    <WidgetCard accent="orange" title={lang === 'sk' ? 'Výpadky' : 'Outages'} icon="📡"
      onRefresh={refetch} badge={data && (data.totalActive + issueServices.length > 0) ? `${data.totalActive + issueServices.length}` : undefined}>
      {/* Tabs */}
      <div className="flex gap-0.5 mb-2 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        <button onClick={() => setTab('isp')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${tab === 'isp' ? 'bg-orange-500/15 text-orange-300' : 'text-slate-500 hover:text-slate-300'}`}>
          🌐 ISP
        </button>
        <button onClick={() => setTab('services')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${tab === 'services' ? 'bg-orange-500/15 text-orange-300' : 'text-slate-500 hover:text-slate-300'}`}>
          🔧 Služby {issueServices.length > 0 && <span className="text-[8px] opacity-60 ml-0.5">({issueServices.length})</span>}
        </button>
      </div>

      {loading && <SkeletonRows rows={3} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}

      {/* ISP tab */}
      {!loading && data && tab === 'isp' && (
        <>
          {data.allClear ? (
            <div className="text-center py-4"><span className="text-lg">✅</span><p className="text-[11px] text-emerald-400 mt-1">Všetko funguje</p></div>
          ) : (
            <div className="space-y-1 max-h-[240px] overflow-y-auto scrollbar-hide">
              {data.outages.map((o, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span className="text-sm">{o.type === 'Internet' ? '🌐' : o.type === 'Mobil' ? '📱' : '📺'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-200">{o.provider}</span>
                      <span className="text-[8px] px-1 py-0.5 rounded bg-orange-500/15 text-orange-300">{o.type}</span>
                    </div>
                    <span className="text-[9px] text-slate-500">{o.region} · od {o.since} · ~{o.affected}</span>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${o.status === 'fixing' ? 'bg-yellow-500/15 text-yellow-300' : 'bg-red-500/15 text-red-300'}`}>
                    {o.status === 'fixing' ? '🔧' : '🔍'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Services tab */}
      {!loading && data && tab === 'services' && (
        <div className="space-y-0.5 max-h-[240px] overflow-y-auto scrollbar-hide">
          {(data.services ?? []).map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.03] transition-colors">
              <span className="text-sm">{s.icon}</span>
              <span className="text-[10px] text-slate-300 flex-1">{s.name}</span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                s.status === 'ok' ? 'bg-green-500/15 text-green-300' :
                s.status === 'issues' ? 'bg-yellow-500/15 text-yellow-300' : 'bg-red-500/15 text-red-300'
              }`}>
                {s.status === 'ok' ? '✅ OK' : s.status === 'issues' ? '⚠️ Pomalé' : '❌ Down'}
              </span>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
