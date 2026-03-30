import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TIPS = [
  { icon: '💡', title: 'Živnosť vs s.r.o.', tip: 'Živnosť je jednoduchšia, ale s.r.o. chráni osobný majetok. Pri príjme nad 20 000 €/rok zvážte s.r.o.', category: 'právne' },
  { icon: '📊', title: 'Cash flow je kráľ', tip: 'Sledujte peniaze na účte, nie zisk na papieri. 60 % firiem zlyháva kvôli cash flow.', category: 'financie' },
  { icon: '🎯', title: 'Niche down', tip: 'Nesnažte sa predávať všetkým. Nájdite úzku špecializáciu a buďte v nej najlepší.', category: 'stratégia' },
  { icon: '📧', title: 'E-mail marketing', tip: 'E-mail má 36x vyšší ROI než sociálne siete. Budujte e-mail list od prvého dňa.', category: 'marketing' },
  { icon: '🤝', title: 'Networking', tip: 'Chodievajte na podujatia ako Startup Grind, Impact Hub alebo Slovak Startup Awards.', category: 'networking' },
  { icon: '💰', title: 'Paušálne výdavky', tip: 'Ak nemáte veľa nákladov, paušálne výdavky 60 % vám ušetria čas a často aj dane.', category: 'dane' },
  { icon: '🌍', title: 'Expandujte online', tip: 'Slovenský trh je malý. Ponúknite služby aj pre ČR, DE, AT — trh 100x väčší.', category: 'rast' },
  { icon: '📱', title: 'Automatizácia', tip: 'Používajte Zapier, Make.com alebo n8n na automatizáciu rutinných úloh.', category: 'efektivita' },
  { icon: '🏦', title: 'Odložte si 3 mesiace', tip: 'Majte vždy finančnú rezervu na 3 mesiace fixných nákladov firmy.', category: 'financie' },
  { icon: '📝', title: 'Fakturácia', tip: 'Fakturujte okamžite po dodaní. Čím skôr pošlete faktúru, tým skôr dostanete peniaze.', category: 'financie' },
  { icon: '🔍', title: 'SEO investícia', tip: 'Organická návštevnosť je zadarmo. Blog a SEO vám prinesú zákazníkov aj o 2 roky.', category: 'marketing' },
  { icon: '⚡', title: 'MVP prístup', tip: 'Neperfekcionizujte. Vydajte minimálny produkt, otestujte a zlepšujte podľa spätnej väzby.', category: 'produkt' },
  { icon: '🎓', title: 'Investujte do vzdelania', tip: 'Najlepšia investícia je do seba. Kurzy, knihy, mentoring — návratnosť je exponenciálna.', category: 'rozvoj' },
  { icon: '🤖', title: 'AI ako asistent', tip: 'Používajte ChatGPT, Claude alebo Gemini na texty, analýzy a brainstorming. Ušetríte hodiny.', category: 'efektivita' },
  { icon: '📈', title: 'Recurring revenue', tip: 'Predplatné modely sú najstabilnejší príjem. Premýšľajte, čo viete ponúknuť ako službu.', category: 'stratégia' },
  { icon: '🏠', title: 'Práca z domu', tip: 'Ušetríte na kancelárii 300-800 €/mesiac. Investujte do kvalitného domáceho pracoviska.', category: 'úspory' },
  { icon: '📋', title: 'Daňové termíny', tip: 'Štvrtročné zálohy na DPH, ročné daňové priznanie do 31.3. Automatizujte pripomienky.', category: 'dane' },
  { icon: '🌐', title: 'Viacjazyčný web', tip: 'Slovenský web v nemčine a angličtine vám otvorí dvere na európsky trh.', category: 'marketing' },
  { icon: '🔒', title: 'GDPR compliance', tip: 'Cookie banner, privacy policy a spracovateľská zmluva — povinné pre každý web.', category: 'právne' },
  { icon: '💳', title: 'Oddeľte financie', tip: 'Majte firemný a osobný účet oddelené. Zjednodušíte účtovníctvo a audit.', category: 'financie' },
  { icon: '🎥', title: 'Video obsah', tip: 'Krátke videá na TikTok/Reels majú organický dosah 10-100x vyšší než obrázky.', category: 'marketing' },
  { icon: '🧮', title: 'Flat tax 15 %', tip: 'Príjem do 49 790 €/rok zdaníte len 15 %. Nad to je sadzba 25 %.', category: 'dane' },
  { icon: '📦', title: 'Dropshipping', tip: 'Začnite bez skladu. Dodávateľ posiela priamo zákazníkovi. Nízke riziko, nízka marža.', category: 'model' },
  { icon: '🤝', title: 'Barter obchody', tip: 'Vymeňte služby bez peňazí. Web za účtovníctvo, design za marketing.', category: 'úspory' },
  { icon: '📊', title: 'KPI sledovanie', tip: 'Merajte 3-5 kľúčových metrík. Čo nemeriate, nemôžete zlepšiť.', category: 'manažment' },
  { icon: '🚀', title: 'Elevator pitch', tip: 'Viete opísať svoju firmu za 30 sekúnd? Precvičujte výťahový pitch.', category: 'networking' },
  { icon: '💡', title: 'Side hustle', tip: 'Začnite popri zamestnaní. Keď vedľajší príjem dosiahne 70 % platu, zvážte odchod.', category: 'začiatky' },
  { icon: '🏛️', title: 'Dotácie SBA', tip: 'Slovak Business Agency ponúka granty a poradenstvo pre začínajúcich podnikateľov.', category: 'financie' },
  { icon: '🔄', title: 'Pivot včas', tip: 'Ak niečo nefunguje 6 mesiacov, zmeňte stratégiu. Lepšie pivotnúť než zbankrotiť.', category: 'stratégia' },
  { icon: '📞', title: 'Cold calling', tip: 'Jeden telefonát denne = 250 potenciálnych zákazníkov ročne. Konzistencia víťazí.', category: 'predaj' },
]

const MONEY_IDEAS = [
  { icon: '💻', idea: 'Freelance programovanie', potential: '2000-8000 €/mes', difficulty: 'stredná', description: 'React, Python, Node.js — najžiadanejšie technológie na SK trhu.' },
  { icon: '📝', idea: 'Copywriting / AI writing', potential: '800-3000 €/mes', difficulty: 'nízka', description: 'Texty pre weby, blogy, reklamy. S AI nástrojmi zvládnete 3x viac.' },
  { icon: '🎨', idea: 'Grafický dizajn', potential: '1000-4000 €/mes', difficulty: 'stredná', description: 'Canva, Figma — loga, bannery, sociálne médiá pre firmy.' },
  { icon: '📦', idea: 'E-shop s print-on-demand', potential: '500-5000 €/mes', difficulty: 'nízka', description: 'Tričká, hrnčeky s vlastným dizajnom. Žiadny sklad, žiadne riziko.' },
  { icon: '🏠', idea: 'Správa Airbnb', potential: '300-1500 €/nehnuteľnosť', difficulty: 'nízka', description: 'Spravujte Airbnb iným ľuďom za 20-30 % z príjmu.' },
  { icon: '📱', idea: 'SMM - Social Media', potential: '500-2500 €/mes', difficulty: 'nízka', description: 'Spravujte Instagram/Facebook pre lokálne firmy. 3-5 klientov na začiatok.' },
  { icon: '🎓', idea: 'Online kurzy', potential: '1000-10000 €/mes', difficulty: 'vysoká', description: 'Naučte čokoľvek — Udemy, Skillshare alebo vlastná platforma.' },
  { icon: '🔧', idea: 'IT podpora / konzultácie', potential: '1500-5000 €/mes', difficulty: 'stredná', description: 'Pomáhajte malým firmám s IT, cloudmi a bezpečnosťou.' },
]

export async function GET() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  const todayTip = TIPS[dayOfYear % TIPS.length]
  const tomorrowTip = TIPS[(dayOfYear + 1) % TIPS.length]
  const todayIdea = MONEY_IDEAS[dayOfYear % MONEY_IDEAS.length]

  return NextResponse.json({
    todayTip,
    tomorrowTip,
    todayIdea,
    allTips: TIPS.slice(0, 5),
    allIdeas: MONEY_IDEAS,
    timestamp: Date.now(),
  })
}
