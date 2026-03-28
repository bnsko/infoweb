'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface OfficeData {
  offices: {
    id: string; name: string; type: string; city: string; isOpen: boolean
    departments: { key: string; label: string; icon: string; estimatedWait: number; queueLength: number }[]
  }[]
  tips: string[]
  isOpen: boolean
}

export default function OfficeWaitWidget() {
  const { lang } = useLang()
  const [selectedCity, setSelectedCity] = useState('ba')
  const { data, loading, refetch } = useWidget<OfficeData>('/api/office-wait', 5 * 60 * 1000)

  const cities = [
    { key: 'ba', label: 'BA', flag: '🏙️' }, { key: 'ke', label: 'KE', flag: '🏰' },
    { key: 'za', label: 'ZA', flag: '🏔️' }, { key: 'bb', label: 'BB', flag: '⛰️' },
    { key: 'nr', label: 'NR', flag: '🌾' }, { key: 'po', label: 'PO', flag: '🏛️' },
    { key: 'tt', label: 'TT', flag: '⛪' }, { key: 'tn', label: 'TN', flag: '🏯' },
  ]

  const office = data?.offices?.find(o => o.id.includes(selectedCity))
  const waitColor = (mins: number) => mins > 60 ? 'text-red-400' : mins > 30 ? 'text-yellow-400' : 'text-green-400'
  const waitBg = (mins: number) => mins > 60 ? 'bg-red-500/10 border-red-500/15' : mins > 30 ? 'bg-yellow-500/10 border-yellow-500/15' : 'bg-green-500/10 border-green-500/15'

  return (
    <WidgetCard accent="orange" title={lang === 'sk' ? 'Čakacie doby · Úrady' : 'Office Wait Times'} icon="🏛️" onRefresh={refetch}>
      {/* City selector */}
      <div className="flex flex-wrap gap-1 mb-3">
        {cities.map(c => (
          <button key={c.key} onClick={() => setSelectedCity(c.key)}
            className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition-all ${
              selectedCity === c.key ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/5'
            }`}>
            {c.flag} {c.label}
          </button>
        ))}
      </div>

      {/* Status */}
      {data && (
        <div className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg text-[10px] font-semibold border ${data.isOpen ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          <span className={`w-2 h-2 rounded-full ${data.isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          {data.isOpen ? (lang === 'sk' ? 'Úrady otvorené' : 'Offices open') : (lang === 'sk' ? 'Úrady zatvorené' : 'Offices closed')}
        </div>
      )}

      {loading && <SkeletonRows rows={4} />}

      {!loading && office && (
        <div className="space-y-1.5">
          {office.departments.map(dept => (
            <div key={dept.key} className={`rounded-xl p-2.5 border transition-all ${waitBg(dept.estimatedWait)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{dept.icon}</span>
                  <span className="text-[11px] text-slate-200 font-medium">{dept.label}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold font-mono ${waitColor(dept.estimatedWait)}`}>
                    {data?.isOpen ? `~${dept.estimatedWait} min` : '—'}
                  </span>
                  {data?.isOpen && dept.queueLength > 0 && (
                    <div className="text-[9px] text-slate-500">{dept.queueLength} {lang === 'sk' ? 'v rade' : 'in queue'}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {data?.tips && data.tips.length > 0 && (
        <div className="mt-3 px-2 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <p className="text-[9px] text-blue-300">💡 {data.tips[0]}</p>
        </div>
      )}

      <p className="text-[10px] text-slate-600 mt-2">{lang === 'sk' ? 'Odhad · obnova 5 min' : 'Estimate · refresh 5 min'}</p>
    </WidgetCard>
  )
}
