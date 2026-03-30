import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SK_TOOLS = [
  { name: 'SuperFaktúra', icon: '📄', category: 'Fakturácia', description: 'Online fakturačný systém #1 na SK', url: 'https://superfaktura.sk', price: 'od 5€/mes' },
  { name: 'iDoklad', icon: '📋', category: 'Fakturácia', description: 'Fakturácia a účtovníctvo v cloude', url: 'https://idoklad.sk', price: 'od 0€' },
  { name: 'Pohoda', icon: '🧮', category: 'Účtovníctvo', description: 'Najrozšírenejší účtovný SW na SK', url: 'https://pohoda.sk', price: 'od 15€/mes' },
  { name: 'Money S3', icon: '💰', category: 'Účtovníctvo', description: 'Komplexný ekonomický systém', url: 'https://money.sk', price: 'od 20€/mes' },
  { name: 'Shoptet', icon: '🛒', category: 'E-shop', description: 'Najväčšia e-shop platforma v CZ/SK', url: 'https://shoptet.sk', price: 'od 10€/mes' },
  { name: 'WooCommerce', icon: '🔧', category: 'E-shop', description: 'Open-source riešenie na WordPress', url: 'https://woocommerce.com', price: 'zadarmo' },
  { name: 'GoPay', icon: '💳', category: 'Platby', description: 'Platobná brána pre e-shopy', url: 'https://gopay.com', price: '1.2-2.5%' },
  { name: 'Stripe', icon: '💎', category: 'Platby', description: 'Globálna platobná brána', url: 'https://stripe.com', price: '1.4% + 0.25€' },
  { name: 'Mailchimp', icon: '📧', category: 'E-mail', description: 'E-mail marketing a automatizácia', url: 'https://mailchimp.com', price: 'od 0€' },
  { name: 'Notion', icon: '📝', category: 'Produktivita', description: 'All-in-one workspace', url: 'https://notion.so', price: 'od 0€' },
  { name: 'Slack', icon: '💬', category: 'Komunikácia', description: 'Tímová komunikácia', url: 'https://slack.com', price: 'od 0€' },
  { name: 'Trello', icon: '📊', category: 'Projekty', description: 'Vizuálne riadenie projektov', url: 'https://trello.com', price: 'od 0€' },
  { name: 'Canva', icon: '🎨', category: 'Dizajn', description: 'Grafický dizajn bez dizajnéra', url: 'https://canva.com', price: 'od 0€' },
  { name: 'Calendly', icon: '📅', category: 'Plánovanie', description: 'Plánovanie stretnutí online', url: 'https://calendly.com', price: 'od 0€' },
]

export async function GET() {
  const categories = Array.from(new Set(SK_TOOLS.map(t => t.category))).sort()
  const freeTools = SK_TOOLS.filter(t => t.price.includes('0€') || t.price.includes('zadarmo'))

  return NextResponse.json({
    tools: SK_TOOLS,
    categories,
    freeCount: freeTools.length,
    totalCount: SK_TOOLS.length,
    timestamp: Date.now(),
  })
}
