import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'InfoSK – Slovenský informačný dashboard',
  description:
    'Počasie, správy, kurzy mien, kryptomeny, letecká doprava a ďalšie aktuálne informácie o Slovensku na jednom mieste.',
  keywords: [
    'počasie Slovensko',
    'správy Slovakia',
    'kurzy mien EUR',
    'kryptomeny',
    'dashboard',
    'infoweb',
  ],
  openGraph: {
    title: 'InfoSK – Slovenský informačný dashboard',
    description: 'Všetky dôležité informácie na jednom mieste.',
    type: 'website',
    locale: 'sk_SK',
  },
}

export const viewport: Viewport = {
  themeColor: '#07090f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
