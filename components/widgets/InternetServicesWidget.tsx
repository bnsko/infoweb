'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface ServiceStatus { name: string; icon: string; status: 'up' | 'issues' | 'down'; category: string; reports: number; lastIssue: string }
interface InternetOutagesData { services: ServiceStatus[]; issueCount: number; allGood: boolean; timestamp: number }

export default function InternetServicesWidget() {
  const { lang } = useLang()
  const internet = useWidget<InternetOutagesData>('/api/internetoutages', 5 * 60 * 1000)

  const services = internet.data?.services ?? []
  const skInternet = services.filter(s => ['isp', 'telecom'].includes(s.category))
  const socialServices = services.filter(s => !['isp', 'telecom'].includes(s.category))
  const issues = services.filter(s => s.status !== 'up')
  const upCount = services.filter(s => s.status === 'up').length
  const issueCount = services.filter(s => s.status === 'issues').length
  const downCount = services.filter(s => s.status === 'down').length

  return (
    <WidgetCard accent="blue" title={lang === 'sk' ? 'Internet & služby' : 'Internet & Services'} icon="🌐" onRefresh={internet.refetch}>
      {internet.loading ? <SkeletonRows rows={4} /> : (
        <div className="space-y-3">
          {/* Status hero bar */}
          <div className="relative overflow-hidden rounded-xl border" style={{ background: internet.data?.allGood ? 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(6,182,212,0.06) 100%)' : 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(239,68,68,0.06) 100%)', borderColor: internet.data?.allGood ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.15)' }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="relative">
                <span className="w-3 h-3 rounded-full block" style={{ background: internet.data?.allGood ? '#22c55e' : '#f97316', boxShadow: `0 0 12px ${internet.data?.allGood ? 'rgba(34,197,94,0.4)' : 'rgba(249,115,22,0.4)'}` }} />
                {internet.data?.allGood && <span className="absolute inset-0 w-3 h-3 rounded-full animate-ping" style={{ background: '#22c55e', opacity: 0.3 }} />}
              </div>
              <div>
                <div className="text-[12px] font-bold" style={{ color: internet.data?.allGood ? '#22c55e' : '#f97316' }}>
                  {internet.data?.allGood ? 'Všetko funguje' : `${issues.length} služ${issues.length > 1 ? 'ieb' : 'ba'} s problémami`}
                </div>
                <div className="text-[9px] text-slate-500">Monitorovaných: {services.length} služieb</div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <div className="text-center"><div className="text-[14px] font-bold text-green-400">{upCount}</div><div className="text-[7px] text-slate-600">OK</div></div>
                {issueCount > 0 && <div className="text-center"><div className="text-[14px] font-bold text-amber-400">{issueCount}</div><div className="text-[7px] text-slate-600">⚠️</div></div>}
                {downCount > 0 && <div className="text-center"><div className="text-[14px] font-bold text-red-400">{downCount}</div><div className="text-[7px] text-slate-600">🔴</div></div>}
              </div>
            </div>
            <div className="h-1 w-full flex">
              <div className="bg-green-500/40" style={{ width: `${services.length ? (upCount / services.length) * 100 : 100}%` }} />
              <div className="bg-amber-500/40" style={{ width: `${services.length ? (issueCount / services.length) * 100 : 0}%` }} />
              <div className="bg-red-500/40" style={{ width: `${services.length ? (downCount / services.length) * 100 : 0}%` }} />
            </div>
          </div>

          {/* Active issues */}
          {issues.length > 0 && (
            <div className="space-y-1">
              {issues.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-xl px-3 py-2 border" style={{ background: s.status === 'down' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)', borderColor: s.status === 'down' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)' }}>
                  <span className="text-xl">{s.icon}</span>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-white">{s.name}</div>
                    {s.lastIssue && <div className="text-[8px] text-slate-500 mt-0.5">{s.lastIssue}</div>}
                  </div>
                  {s.reports > 0 && <span className="text-[8px] text-slate-400">{s.reports} hlásení</span>}
                  <span className="text-[8px] px-2.5 py-1 rounded-full font-bold" style={{ background: s.status === 'down' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: s.status === 'down' ? '#fca5a5' : '#fcd34d' }}>
                    {s.status === 'down' ? '🔴 Výpadok' : '🟡 Problémy'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* SK Internet Providers */}
          {skInternet.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[9px]">🇸🇰</span>
                <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider">SK Internet & Telco</span>
                <div className="flex-1 h-px bg-blue-500/10" />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                {skInternet.map((s, i) => {
                  const isUp = s.status === 'up'
                  return (
                    <div key={i} className="group flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 border transition-all hover:scale-[1.02]" style={{ background: isUp ? 'rgba(6,182,212,0.04)' : s.status === 'down' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)', borderColor: isUp ? 'rgba(6,182,212,0.1)' : s.status === 'down' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)' }} title={`${s.name}: ${s.status}`}>
                      <span className="text-xl leading-none">{s.icon}</span>
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-green-400' : s.status === 'issues' ? 'bg-amber-400' : 'bg-red-400'}`} />
                        <span className="text-[8px] text-slate-300 font-medium">{s.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Social & Global Services */}
          {socialServices.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[9px]">🌍</span>
                <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider">Globálne služby</span>
                <div className="flex-1 h-px bg-blue-500/10" />
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-1">
                {socialServices.map((s, i) => {
                  const isUp = s.status === 'up'
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 border transition-all hover:scale-[1.03]" style={{ background: isUp ? 'rgba(6,182,212,0.02)' : 'rgba(245,158,11,0.04)', borderColor: isUp ? 'rgba(255,255,255,0.04)' : 'rgba(245,158,11,0.1)' }} title={`${s.name}: ${s.status}`}>
                      <span className="text-sm leading-none">{s.icon}</span>
                      <div className="flex items-center gap-0.5">
                        <span className={`w-1 h-1 rounded-full ${isUp ? 'bg-green-400' : s.status === 'issues' ? 'bg-amber-400' : 'bg-red-400'}`} />
                        <span className="text-[7px] text-slate-400 font-medium truncate max-w-[42px]">{s.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">DownDetector · IsItDownRightNow · 5 min</p>
    </WidgetCard>
  )
}
