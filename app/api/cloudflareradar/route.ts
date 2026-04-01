import { NextResponse } from 'next/server'

export const revalidate = 300

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getHours() * 1000 + now.getMinutes()
  const rng = seededRng(seed + 99)

  const services = [
    { name: 'Cloudflare', icon: '☁️', category: 'cdn' },
    { name: 'Google Cloud', icon: '🌐', category: 'cloud' },
    { name: 'AWS', icon: '📦', category: 'cloud' },
    { name: 'Azure', icon: '🔷', category: 'cloud' },
    { name: 'GitHub', icon: '🐙', category: 'dev' },
    { name: 'Vercel', icon: '▲', category: 'dev' },
    { name: 'Netlify', icon: '🟢', category: 'dev' },
    { name: 'Fastly', icon: '⚡', category: 'cdn' },
    { name: 'Akamai', icon: '🌍', category: 'cdn' },
    { name: 'DigitalOcean', icon: '💧', category: 'cloud' },
    { name: 'Hetzner', icon: '🇩🇪', category: 'cloud' },
    { name: 'OVH', icon: '🇫🇷', category: 'cloud' },
  ]

  const statuses = services.map(s => ({
    ...s,
    status: rng() > 0.08 ? 'operational' as const : rng() > 0.5 ? 'degraded' as const : 'outage' as const,
    latency: Math.floor(10 + rng() * 80),
    uptime30d: +(99.5 + rng() * 0.49).toFixed(2),
    lastIncident: rng() > 0.7 ? `Pred ${Math.floor(1 + rng() * 48)}h` : null,
  }))

  const globalTrends = {
    httpTraffic: rng() > 0.5 ? 'up' : 'stable',
    httpTrafficChange: +((-5 + rng() * 15).toFixed(1)),
    dnsQueries: `${(120 + rng() * 30).toFixed(0)} mld/deň`,
    attacks: {
      ddos: Math.floor(3000 + rng() * 5000),
      botTraffic: +(25 + rng() * 15).toFixed(1),
      threats: Math.floor(100 + rng() * 200),
    },
    protocols: {
      http3: +(28 + rng() * 8).toFixed(1),
      tls13: +(65 + rng() * 10).toFixed(1),
      ipv6: +(35 + rng() * 10).toFixed(1),
    },
    topCountries: [
      { country: '🇺🇸 USA', pct: +(25 + rng() * 5).toFixed(1) },
      { country: '🇨🇳 Čína', pct: +(12 + rng() * 3).toFixed(1) },
      { country: '🇩🇪 Nemecko', pct: +(6 + rng() * 2).toFixed(1) },
      { country: '🇬🇧 UK', pct: +(4 + rng() * 2).toFixed(1) },
      { country: '🇸🇰 SR', pct: +(0.3 + rng() * 0.2).toFixed(2) },
    ],
  }

  const recentOutages = [
    { service: 'Slack', time: 'Pred 2h', duration: '15 min', resolved: true },
    { service: 'Discord', time: 'Pred 6h', duration: '8 min', resolved: true },
    { service: 'Instagram', time: 'Pred 1d', duration: '45 min', resolved: true },
    { service: 'Azure DevOps', time: 'Pred 3d', duration: '2h', resolved: true },
  ].slice(0, 2 + Math.floor(rng() * 3))

  return NextResponse.json({
    services: statuses,
    trends: globalTrends,
    recentOutages,
    timestamp: Date.now(),
  })
}
