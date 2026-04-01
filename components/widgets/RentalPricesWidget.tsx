'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useState } from 'react'

interface District {
  district: string
  studio: number
  oneBR: number
  twoBR: number
  threeBR: number
}

interface CityRents {
  city: string
  districts: District[]
  trendPct: number
}

interface RentalPricesData {
  cities: CityRents[]
  overview: { nationalAvgOneBR: number; nationalAvgTwoBR: number; yearOnYearPct: number; mostExpensive: string; mostAffordable: string }
  updatedAt: string
}

type RoomType = 'studio' | 'oneBR' | 'twoBR' | 'threeBR'
const ROOM_LABEL: Record<RoomType, string> = { studio: 'Garsonka', oneBR: '1-izbový', twoBR: '2-izbový', threeBR: '3-izbový' }

export default function RentalPricesWidget() {
  const { data, loading, refetch } = useWidget<RentalPricesData>('/api/rental-prices', 3600 * 1000)
  const [roomType, setRoomType] = useState<RoomType>('twoBR')
  const [city, setCity] = useState('Bratislava')

  const currentCity = data?.cities.find(c => c.city === city)

  return (
    <WidgetCard accent="cyan" title="Ceny nájmov SR" icon="🏠" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{data.overview.nationalAvgTwoBR} €</div>
              <div className="text-[9px] text-slate-500">SR priem. 2-izb./mes.</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className={`text-lg font-bold ${data.overview.yearOnYearPct >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                +{data.overview.yearOnYearPct}%
              </div>
              <div className="text-[9px] text-slate-500">meziroční rast</div>
            </div>
          </div>

          <div className="flex gap-1 flex-wrap">
            {data.cities.map(c => (
              <button key={c.city} onClick={() => setCity(c.city)}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${city === c.city ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'border-slate-600 text-slate-500 hover:text-slate-300'}`}>
                {c.city}
              </button>
            ))}
          </div>

          <div className="flex gap-1 flex-wrap">
            {(Object.keys(ROOM_LABEL) as RoomType[]).map(r => (
              <button key={r} onClick={() => setRoomType(r)}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${roomType === r ? 'bg-slate-500/40 border-slate-400/60 text-slate-200' : 'border-slate-700 text-slate-600 hover:text-slate-400'}`}>
                {ROOM_LABEL[r]}
              </button>
            ))}
          </div>

          {currentCity && (
            <div className="space-y-1.5">
              {currentCity.districts.map(d => (
                <div key={d.district} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-3 py-2">
                  <span className="text-[11px] text-slate-300">{d.district}</span>
                  <span className="text-[13px] font-bold text-white">{d[roomType]} €<span className="text-[9px] text-slate-500 font-normal">/mes</span></span>
                </div>
              ))}
              <div className={`text-[10px] text-right mt-1 ${currentCity.trendPct >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {currentCity.city}: {currentCity.trendPct > 0 ? '+' : ''}{currentCity.trendPct}% rok/rok
              </div>
            </div>
          )}

          <div className="text-[9px] text-slate-600 text-right">NARKS · nehnutelnosti.sk · sreality.sk</div>
        </div>
      )}
    </WidgetCard>
  )
}
