'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface WaterCity {
  city: string
  quality: string
  source: string
  chlorine: number
  hardness: number
  hardnessText: string
  nitrates: number
  ph: number
  lastTest: string
}

interface WaterData {
  cities: WaterCity[]
  allGood: boolean
  timestamp: number
}

export default function WaterQualityWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<WaterData>('/api/waterquality', 60 * 60 * 1000)

  return (
    <WidgetCard accent="blue" title={lang === 'sk' ? 'Kvalita vody' : 'Water Quality'} icon="🚰" onRefresh={refetch}
      badge={data?.allGood ? '✅' : undefined}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && data && (
        <div className="space-y-1">
          {data.cities.map((c, i) => (
            <div key={i} className="px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-200 flex-1">{c.city}</span>
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${c.quality === 'vyhovujúca' ? 'bg-green-500/15 text-green-300' : c.quality === 'podmienečne vyhovujúca' ? 'bg-yellow-500/15 text-yellow-300' : 'bg-red-500/15 text-red-300'}`}>
                  {c.quality}
                </span>
              </div>
              <div className="flex gap-3 mt-0.5 text-[8px] text-slate-500">
                <span>pH {c.ph}</span>
                <span>Cl {c.chlorine} mg/l</span>
                <span>Tvrdosť: {c.hardnessText}</span>
                <span>NO₃ {c.nitrates} mg/l</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
