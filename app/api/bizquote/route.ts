import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const QUOTES = [
  { quote: 'Najlepší čas na začatie bolo pred 20 rokmi. Druhý najlepší čas je teraz.', author: 'Čínske príslovie', emoji: '🌱' },
  { quote: 'Neúspech nie je opak úspechu. Je to súčasť úspechu.', author: 'Arianna Huffington', emoji: '📈' },
  { quote: 'Vaši najnespokojnejší zákazníci sú vaším najväčším zdrojom učenia.', author: 'Bill Gates', emoji: '💡' },
  { quote: 'Riziko je nevedieť, čo robíte.', author: 'Warren Buffett', emoji: '🎯' },
  { quote: 'Najlepšia investícia je do seba.', author: 'Warren Buffett', emoji: '📚' },
  { quote: 'Nevzdávaj sa. Začiatky sú vždy najťažšie.', author: 'anonym', emoji: '💪' },
  { quote: 'Robte to, čo milujete, a nebudete musieť pracovať ani jeden deň.', author: 'Konfucius', emoji: '❤️' },
  { quote: 'Úspech je ísť od neúspechu k neúspechu bez straty entuziazmu.', author: 'Winston Churchill', emoji: '🚀' },
  { quote: 'Ak ľudia nepania na vašich ambíciách, pravdepodobne nesnívate dosť veľko.', author: 'Mark Zuckerberg', emoji: '🌟' },
  { quote: 'Jednoduchosť je najvyšší stupeň sofistikovanosti.', author: 'Leonardo da Vinci', emoji: '✨' },
  { quote: 'Ideas are worthless. Execution is everything.', author: 'Scott Adams', emoji: '⚡' },
  { quote: 'Lepšie hotové, ako dokonalé.', author: 'Sheryl Sandberg', emoji: '✅' },
  { quote: 'Stay hungry, stay foolish.', author: 'Steve Jobs', emoji: '🍎' },
  { quote: 'Robte veci, ktoré sa neškálujú.', author: 'Paul Graham', emoji: '🏗️' },
  { quote: 'Budúcnosť patrí tým, ktorí sa pripravujú na ňu dnes.', author: 'Malcolm X', emoji: '🔮' },
]

export async function GET() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  const todayQuote = QUOTES[dayOfYear % QUOTES.length]

  return NextResponse.json({
    todayQuote,
    timestamp: Date.now(),
  })
}
