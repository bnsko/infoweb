import { NextResponse } from 'next/server'

export const revalidate = 3600

interface CertAlert { id: string; title: string; severity: 'critical' | 'high' | 'medium' | 'low'; date: string; category: string; description: string; url: string }

const MOCK_ALERTS: CertAlert[] = [
  { id: 'cert-2025-001', title: 'Kritická zraniteľnosť v Apache HTTP Server', severity: 'critical', date: new Date(Date.now() - 2 * 86400000).toISOString(), category: 'Webový server', description: 'Zraniteľnosť CVE-2025-0001 umožňuje vzdialené spustenie kódu. Aktualizujte na verziu 2.4.59 alebo novšiu.', url: 'https://www.sk-cert.sk/sk/aktuality' },
  { id: 'cert-2025-002', title: 'Phishingová kampaň cielená na slovenské banky', severity: 'high', date: new Date(Date.now() - 1 * 86400000).toISOString(), category: 'Phishing', description: 'Útočníci napodobňujú stránky Tatra banky a VÚB. Neklikajte na podozrivé emaily.', url: 'https://www.sk-cert.sk/sk/aktuality' },
  { id: 'cert-2025-003', title: 'Ransomvér útok na nemocnice v SR', severity: 'high', date: new Date(Date.now() - 3 * 86400000).toISOString(), category: 'Ransomvér', description: 'Evidujeme nárast ransomvér útokov na zdravotnícke zariadenia. Zálohovanie je kľúčové.', url: 'https://www.sk-cert.sk/sk/aktuality' },
  { id: 'cert-2025-004', title: 'Zraniteľnosť v MS Windows Print Spooler', severity: 'medium', date: new Date(Date.now() - 5 * 86400000).toISOString(), category: 'Operačný systém', description: 'PrintNightmare variant. Aplikujte záplaty z Windows Update.', url: 'https://www.sk-cert.sk/sk/aktuality' },
  { id: 'cert-2025-005', title: 'Informácia o bezpečnosti Outlook kalendarizačných funkcií', severity: 'low', date: new Date(Date.now() - 7 * 86400000).toISOString(), category: 'Email', description: 'Odporúčame aktualizovať MS Office na najnovšiu verziu.', url: 'https://www.sk-cert.sk/sk/aktuality' },
]

export async function GET() {
  const now = new Date()
  const stats = {
    criticalCount: MOCK_ALERTS.filter(a => a.severity === 'critical').length,
    highCount: MOCK_ALERTS.filter(a => a.severity === 'high').length,
    totalThisMonth: 12,
    lastUpdated: now.toISOString(),
  }
  return NextResponse.json({ alerts: MOCK_ALERTS, stats, source: 'SK-CERT', disclaimer: 'Demo dáta - pozri sk-cert.sk pre aktuálne upozornenia' })
}
