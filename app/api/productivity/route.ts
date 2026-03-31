import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const PRODUCTIVITY_TIPS = [
  { icon: '🎯', title: 'Pravidlo 80/20', tip: '20 % aktivít prináša 80 % výsledkov. Identifikujte a sústreďte sa na tie najdôležitejšie.', category: 'prioritizácia' },
  { icon: '⏰', title: 'Pomodoro technika', tip: '25 minút práca, 5 minút prestávka. Po 4 cykloch 15-30 min prestávka.', category: 'čas' },
  { icon: '🐸', title: 'Eat the Frog', tip: 'Ráno urobte najťažšiu úlohu. Zvyšok dňa bude ľahší.', category: 'prioritizácia' },
  { icon: '📝', title: 'Eisenhowerova matica', tip: 'Dôležité + urgentné → robte. Dôležité + nie urgentné → plánujte. Nie dôležité → delegujte/zmažte.', category: 'prioritizácia' },
  { icon: '🧘', title: 'Deep Work', tip: '2-4 hodiny bez prerušenia = viac ako 8 hodín s notifikáciami.', category: 'sústredenie' },
  { icon: '📱', title: 'Digital Detox', tip: 'Vypnite notifikácie od 9:00-12:00. Najproduktívnejšie ráno bez rušenia.', category: 'sústredenie' },
  { icon: '✅', title: '3 MIT denne', tip: 'Most Important Tasks — vyberte 3 kľúčové úlohy na deň a splňte ich.', category: 'prioritizácia' },
  { icon: '🔄', title: 'Batch processing', tip: 'Zoskupte podobné úlohy (e-maily, telefonáty, admin) do blokov. Menej prepínania = viac práce.', category: 'efektivita' },
  { icon: '📊', title: 'Time tracking', tip: 'Sledujte čas cez Toggl alebo Clockify. Uvedomíte si, kam odchádza.', category: 'čas' },
  { icon: '🌅', title: 'Ranný rituál', tip: '5 minút meditácia, 10 minút plánovanie, 15 minút čítanie = perfektný štart dňa.', category: 'návyky' },
  { icon: '💤', title: 'Spánok je investícia', tip: '7-8 hodín spánku zvyšuje produktivitu o 20-30 %. Nikdy ho neobetujte.', category: 'zdravie' },
  { icon: '🏋️', title: 'Pohyb = energie', tip: '30 minút cvičenia denne = viac energie, lepšia nálada, ostrejšie myslenie.', category: 'zdravie' },
  { icon: '📚', title: 'Čítajte 30 min denne', tip: '30 min denne = 20-25 kníh ročne. Exponenciálny rast vedomostí.', category: 'rozvoj' },
  { icon: '🎵', title: 'Focus music', tip: 'Lo-fi, ambient alebo brown noise zlepšujú sústredenie o 15-20 %.', category: 'sústredenie' },
]

export async function GET() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  const todayTip = PRODUCTIVITY_TIPS[dayOfYear % PRODUCTIVITY_TIPS.length]

  return NextResponse.json({
    todayTip,
    allTips: PRODUCTIVITY_TIPS.slice(0, 5),
    timestamp: Date.now(),
  })
}
