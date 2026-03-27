// WMO weather codes → Slovak label + emoji
const WMO: Record<number, { label: string; emoji: string }> = {
  0: { label: 'Jasná obloha', emoji: '☀️' },
  1: { label: 'Prevažne jasno', emoji: '🌤️' },
  2: { label: 'Čiastočná oblačnosť', emoji: '⛅' },
  3: { label: 'Zamračené', emoji: '☁️' },
  45: { label: 'Hmla', emoji: '🌫️' },
  48: { label: 'Hmla s námrazou', emoji: '🌫️' },
  51: { label: 'Slabé mrholenie', emoji: '🌦️' },
  53: { label: 'Mrholenie', emoji: '🌦️' },
  55: { label: 'Husté mrholenie', emoji: '🌦️' },
  61: { label: 'Slabý dážď', emoji: '🌧️' },
  63: { label: 'Dážď', emoji: '🌧️' },
  65: { label: 'Silný dážď', emoji: '🌧️' },
  71: { label: 'Slabý sneh', emoji: '❄️' },
  73: { label: 'Sneh', emoji: '❄️' },
  75: { label: 'Silný sneh', emoji: '❄️' },
  77: { label: 'Snehové vločky', emoji: '🌨️' },
  80: { label: 'Prehánky', emoji: '🌦️' },
  81: { label: 'Silné prehánky', emoji: '🌦️' },
  82: { label: 'Búrkové prehánky', emoji: '⛈️' },
  85: { label: 'Snehové prehánky', emoji: '🌨️' },
  86: { label: 'Silné snehové prehánky', emoji: '🌨️' },
  95: { label: 'Búrka', emoji: '⛈️' },
  96: { label: 'Búrka s krúpami', emoji: '⛈️' },
  99: { label: 'Silná búrka s krúpami', emoji: '⛈️' },
}

export function getWeatherInfo(code: number) {
  return WMO[code] ?? { label: 'Neznáme', emoji: '🌡️' }
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('sk-SK', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp * 1000
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  if (minutes < 1) return 'práve teraz'
  if (minutes < 60) return `pred ${minutes} min`
  if (hours < 24) return `pred ${hours} hod`
  return `pred ${Math.floor(hours / 24)} d`
}

export function getAQIInfo(aqi: number): { label: string; color: string; bg: string } {
  if (aqi <= 20) return { label: 'Výborná', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' }
  if (aqi <= 40) return { label: 'Dobrá', color: '#86efac', bg: 'rgba(134,239,172,0.1)' }
  if (aqi <= 60) return { label: 'Priemerná', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' }
  if (aqi <= 80) return { label: 'Slabá', color: '#f97316', bg: 'rgba(249,115,22,0.1)' }
  if (aqi <= 100) return { label: 'Zlá', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
  return { label: 'Veľmi zlá', color: '#dc2626', bg: 'rgba(220,38,38,0.15)' }
}

export function formatPrice(price: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency,
    maximumFractionDigits: price > 1000 ? 0 : price > 1 ? 2 : 4,
  }).format(price)
}

export function formatLargeNumber(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  return n.toLocaleString('sk-SK')
}

export function degreesToDirection(deg: number | null): string {
  if (deg === null) return '—'
  const dirs = ['S', 'SSV', 'SV', 'VSV', 'V', 'VJV', 'JV', 'JJV', 'J', 'JJZ', 'JZ', 'ZJZ', 'Z', 'ZSZ', 'SZ', 'SSZ']
  return dirs[Math.round(deg / 22.5) % 16]
}
