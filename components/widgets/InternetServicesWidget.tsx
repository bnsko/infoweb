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

  return (
    <WidgetCard accent="purple" title={lang === 'sk' ? 'Internet & služby' : 'Internet & Services'} icon="🌐" onRefresh={internet.refetch}>
      {internet.loading ? <SkeletonRows rows={4} /> : (
        <div className="space-y-3">
          {/* Overall status bar */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: internet.data?.allGood ? '#22c55e' : '#f97316' }} />
              <span className="text-[10px] font-bold" style={{ color: internet.data?.allGood ? '#22c55e' : '#f97316' }}>
                {internet.data?.allGood ? 'Všetko OK' : `${issues.length} problém${issues.length > 1 ? 'y' : ''}`}
              </span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-[9px]">
              <span className="text-green-400 font-bold">{services.filter(s => s.status === 'up').length} ✅</span>
              {services.filter(s => s.status === 'issues').length > 0 && <span className="text-amber-400 font-bold">{services.filter(s => s.status === 'issues').length} ⚠️</span>}
              {services.filter(s => s.status === 'down').length > 0 && <span className="text-red-400 font-bold">{services.filter(s => s.status === 'down').length} 🔴</span>}
            </div>
          </div>

          {/* Issues highlighted */}
          {issues.length > 0 && (
            <div className="space-y-1">
              {issues.map((s, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${s.status === 'down' ? 'bg-red-500/8 border-red-500/15' : 'bg-amber-500/8 border-amber-500/15'}`}>
                  <span className="text-base">{s.icon}</span>
                  <div className="flex-1">
                    <span className="text-[10px] font-semibold text-white">{s.name}</span>
                    {s.lastIssue && <span className="text-[8px] text-slate-500 ml-2">{s.lastIssue}</span>}
                  </div>
                  <span className="text-[8px] text-slate-500">{s.reports > 0 ? `${s.reports} hlásení` : ''}</span>
                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${s.status === 'down' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {s.status === 'down' ? '🔴 Down' : '🟡 Problémy'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* SK Internet Providers */}
          {skInternet.length > 0 && (
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">🇸🇰 SK Internet & Telco</div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                {skInternet.map((s, i) => {
                  const dot = s.status === 'up' ? 'bg-green-400' : s.status === 'issues' ? 'bg-amber-400' : 'bg-red-400'
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors" title={`${s.name}: ${s.status}`}>
                      <span className="text-lg leading-none">{s.icon}</span>
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        <span className="text-[8px] text-slate-400 font-medium">{s.name}</span>
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
              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">🌍 Sociálne siete & služby</div>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-0.5">
                {socialServices.map((s, i) => {
                  const dot = s.status === 'up' ? 'bg-green-400' : s.status === 'issues' ? 'bg-amber-400' : 'bg-red-400'
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 bg-white/[0.015] hover:bg-white/[0.04] transition-colors" title={`${s.name}: ${s.status}`}>
                      <span className="text-sm leading-none">{s.icon}</span>
                      <div className="flex items-center gap-0.5">
                        <span className={`w-1 h-1 rounded-full ${dot}`} />
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
      <p className="text-[8px] text-slate-600 mt-2">Zdroj: DownDetector · Simulácia</p>
    </WidgetCard>
  )
}
