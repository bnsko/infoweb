'use client'

import { useState, useMemo } from 'react'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface CultureItem { icon: string; title: { sk: string; en: string }; desc: { sk: string; en: string }; tag?: string }

const TRADITIONS: CultureItem[] = [
  { icon: '🎄', title: { sk: 'Vianoce', en: 'Christmas' }, desc: { sk: 'Kapustnica, kapor, oblátky s medom – tradičná slovenská Štedrá večera', en: 'Cabbage soup, carp, wafers with honey – traditional Slovak Christmas Eve' }, tag: 'zvyk' },
  { icon: '🥚', title: { sk: 'Veľká noc', en: 'Easter' }, desc: { sk: 'Šibačka a oblievačka – chlapci šibú dievčatá vŕbovým prútom', en: 'Whipping and water pouring – boys whip girls with willow sticks' }, tag: 'zvyk' },
  { icon: '🔥', title: { sk: 'Jánska noc', en: 'Midsummer Night' }, desc: { sk: 'Pálenie vatier na sviatok sv. Jána, skok cez oheň', en: 'Bonfires on St. John\'s feast, jumping over fire' }, tag: 'zvyk' },
  { icon: '👰', title: { sk: 'Slovenská svadba', en: 'Slovak Wedding' }, desc: { sk: 'Čepčenie, družbovský tanec, svadobné piesne a zvyky', en: 'Capping ceremony, best man dance, wedding songs and customs' }, tag: 'zvyk' },
  { icon: '🪦', title: { sk: 'Dušičky', en: 'All Souls\' Day' }, desc: { sk: '2. november – navštevovanie hrobov, zapaľovanie sviečok', en: 'November 2 – visiting graves, lighting candles' }, tag: 'zvyk' },
]

const FOLKLORE: CultureItem[] = [
  { icon: '💃', title: { sk: 'Čardáš', en: 'Czardas' }, desc: { sk: 'Rýchly ľudový tanec zo strednej Európy, populárny na Slovensku', en: 'Fast folk dance from Central Europe, popular in Slovakia' }, tag: 'tanec' },
  { icon: '🎻', title: { sk: 'Ľudové piesne', en: 'Folk Songs' }, desc: { sk: '\"Tancuj, tancuj, vykrúcaj\" – jedna z najznámejších slovenských piesní', en: '\"Dance, dance, twirl\" – one of the most famous Slovak songs' }, tag: 'hudba' },
  { icon: '👗', title: { sk: 'Kroje', en: 'Folk Costumes' }, desc: { sk: 'Každý región má vlastný kroj – Detva, Čičmany, Východná', en: 'Each region has its own costume – Detva, Čičmany, Východná' }, tag: 'tradícia' },
  { icon: '🏔️', title: { sk: 'Jánošík', en: 'Jánošík' }, desc: { sk: 'Legendárny slovenský zbojník – \"bohatým bral, chudobným dával\"', en: 'Legendary Slovak outlaw – \"took from the rich, gave to the poor\"' }, tag: 'legenda' },
]

const CUISINE: CultureItem[] = [
  { icon: '🥟', title: { sk: 'Bryndzové halušky', en: 'Bryndzové halušky' }, desc: { sk: 'Národné jedlo – zemiakové halušky s bryndzou a slaninou', en: 'National dish – potato dumplings with sheep cheese and bacon' }, tag: 'jedlo' },
  { icon: '🧀', title: { sk: 'Bryndza', en: 'Bryndza cheese' }, desc: { sk: 'Chránená ovčia bryndza – vyrába sa len na Slovensku', en: 'Protected sheep cheese – made only in Slovakia' }, tag: 'jedlo' },
  { icon: '🫓', title: { sk: 'Lokše', en: 'Lokše' }, desc: { sk: 'Tenké zemiakové placky so slanou alebo sladkou plnkou', en: 'Thin potato flatbreads with savory or sweet filling' }, tag: 'jedlo' },
  { icon: '🍷', title: { sk: 'Tokajské víno', en: 'Tokaj wine' }, desc: { sk: 'Slovenská tokajská oblasť – výroba vína od 13. storočia', en: 'Slovak Tokaj region – winemaking since the 13th century' }, tag: 'nápoj' },
  { icon: '🥃', title: { sk: 'Slivovica', en: 'Slivovica' }, desc: { sk: 'Tradičný slivkový destilát – symbol slovenského pohostinstva', en: 'Traditional plum brandy – symbol of Slovak hospitality' }, tag: 'nápoj' },
]

type Category = 'traditions' | 'folklore' | 'cuisine'

export default function SlovakCultureWidget() {
  const { lang } = useLang()
  const [cat, setCat] = useState<Category>('traditions')

  const items = useMemo(() => {
    switch (cat) {
      case 'traditions': return TRADITIONS
      case 'folklore': return FOLKLORE
      case 'cuisine': return CUISINE
    }
  }, [cat])

  const cats: { key: Category; icon: string; label: { sk: string; en: string } }[] = [
    { key: 'traditions', icon: '🎭', label: { sk: 'Zvyky', en: 'Customs' } },
    { key: 'folklore', icon: '🎻', label: { sk: 'Folklór', en: 'Folklore' } },
    { key: 'cuisine', icon: '🍽️', label: { sk: 'Kuchyňa', en: 'Cuisine' } },
  ]

  return (
    <WidgetCard accent="orange" title={lang === 'sk' ? 'Slovenská kultúra' : 'Slovak Culture'} icon="🇸🇰">
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {cats.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)}
            className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${cat === c.key ? 'bg-amber-500/15 text-amber-300' : 'text-slate-500 hover:text-slate-300'}`}>
            {c.icon} {c.label[lang]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5 hover:border-amber-500/15 transition-all">
            <div className="flex items-start gap-2">
              <span className="text-xl shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[12px] font-semibold text-white">{item.title[lang]}</span>
                  {item.tag && (
                    <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">{item.tag}</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc[lang]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
