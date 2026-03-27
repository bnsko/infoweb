import { NextResponse } from 'next/server'

export const revalidate = 3600

// ECB Data API – latest EUR exchange rates
const CURRENCIES = [
  { code: 'USD', name: 'Americký dolár', flag: '🇺🇸' },
  { code: 'GBP', name: 'Britská libra', flag: '🇬🇧' },
  { code: 'CZK', name: 'Česká koruna', flag: '🇨🇿' },
  { code: 'PLN', name: 'Poľský zlotý', flag: '🇵🇱' },
  { code: 'CHF', name: 'Švajčiarsky frank', flag: '🇨🇭' },
  { code: 'HUF', name: 'Maďarský forint', flag: '🇭🇺' },
  { code: 'SEK', name: 'Švédska koruna', flag: '🇸🇪' },
  { code: 'NOK', name: 'Nórska koruna', flag: '🇳🇴' },
]

export async function GET() {
  try {
    const codes = CURRENCIES.map((c) => c.code).join('+')
    const url = `https://data-api.ecb.europa.eu/service/data/EXR/D.${codes}.EUR.SP00.A?format=jsondata&lastNObservations=1`

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`ECB API ${res.status}`)
    const json = await res.json()

    // Parse ECB SDMX-JSON format
    const series = json.dataSets?.[0]?.series ?? {}
    const dimensions = json.structure?.dimensions?.series ?? []
    const currencyDim = dimensions.find((d: { id: string }) => d.id === 'CURRENCY')
    const currencyValues = currencyDim?.values ?? []

    const rates = CURRENCIES.map((cur) => {
      // Find series key for this currency
      const idx = currencyValues.findIndex((v: { id: string }) => v.id === cur.code)
      // Series keys format: "0:0:0:0:0" where position 1 = currency index
      const seriesKey = Object.keys(series).find((k) => k.split(':')[1] === String(idx))
      const observations = seriesKey ? series[seriesKey]?.observations : null
      const rate = observations ? Object.values(observations)[0] as number[] : null

      return {
        code: cur.code,
        name: cur.name,
        flag: cur.flag,
        rate: rate?.[0] ?? null,
      }
    }).filter((r) => r.rate !== null)

    const date = json.structure?.dimensions?.observation?.[0]?.values?.slice(-1)?.[0]?.name ?? ''

    return NextResponse.json({ base: 'EUR', date, rates })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Currency fetch failed' },
      { status: 500 }
    )
  }
}
