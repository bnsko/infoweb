import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface WeatherSimple {
  temp: number
  weatherCode: number
  windSpeed: number
  precipitation: number
}

const WMO_OUTDOOR: Record<number, { ok: boolean; desc: string }> = {
  0: { ok: true, desc: 'jasno' }, 1: { ok: true, desc: 'prevažne jasno' },
  2: { ok: true, desc: 'polojasno' }, 3: { ok: false, desc: 'zamračené' },
  45: { ok: false, desc: 'hmla' }, 48: { ok: false, desc: 'námraza' },
  51: { ok: false, desc: 'mrholenie' }, 53: { ok: false, desc: 'mrholenie' },
  55: { ok: false, desc: 'silné mrholenie' }, 61: { ok: false, desc: 'dážď' },
  63: { ok: false, desc: 'dážď' }, 65: { ok: false, desc: 'silný dážď' },
  71: { ok: false, desc: 'sneženie' }, 73: { ok: false, desc: 'sneženie' },
  75: { ok: false, desc: 'silné sneženie' }, 80: { ok: false, desc: 'prehánky' },
  95: { ok: false, desc: 'búrka' },
}

function getSuggestions(w: WeatherSimple): { emoji: string; title: string; desc: string; intensity: string }[] {
  const suggestions: { emoji: string; title: string; desc: string; intensity: string }[] = []
  const code = WMO_OUTDOOR[w.weatherCode] ?? { ok: false, desc: 'neisté' }

  if (w.temp >= 25 && code.ok && w.precipitation < 1) {
    suggestions.push(
      { emoji: '🏊', title: 'Plávanie / kúpalisko', desc: `Pri ${w.temp}°C ideálne na vodné aktivity`, intensity: 'vysoká' },
      { emoji: '🚴', title: 'Cyklistika', desc: 'Perfektné podmienky na dlhšiu jazdu', intensity: 'stredná' },
      { emoji: '🏐', title: 'Plážový volejbal', desc: 'Vynikajúce počasie na outdoorové hry', intensity: 'vysoká' },
      { emoji: '🧗', title: 'Turistika / via ferrata', desc: 'Využite pekný deň v prírode', intensity: 'vysoká' },
      { emoji: '🏕️', title: 'Grilovanie & piknik', desc: 'Ideálne na relax vonku s rodinou', intensity: 'nízka' },
    )
  } else if (w.temp >= 15 && w.temp < 25 && code.ok && w.precipitation < 2) {
    suggestions.push(
      { emoji: '🚴', title: 'Cyklistika', desc: `Príjemných ${w.temp}°C, ideálne na bike`, intensity: 'stredná' },
      { emoji: '🏃', title: 'Beh / jogging', desc: 'Optimálna teplota na beh', intensity: 'vysoká' },
      { emoji: '⛳', title: 'Golf / disc golf', desc: 'Skvelé podmienky na hru', intensity: 'stredná' },
      { emoji: '🧗', title: 'Lezenie / bouldering', desc: 'Ideálna teplota na outdoor lezenie', intensity: 'vysoká' },
      { emoji: '🏸', title: 'Badminton / tenis', desc: 'Vhodné na raketové športy vonku', intensity: 'stredná' },
    )
  } else if (w.temp >= 5 && w.temp < 15 && w.precipitation < 3) {
    suggestions.push(
      { emoji: '🏃', title: 'Beh v prírode', desc: `${w.temp}°C - chladnejšie, ale skvelé na kardio`, intensity: 'vysoká' },
      { emoji: '🥾', title: 'Turistika', desc: 'Príjemné počasie na prechádzky v prírode', intensity: 'stredná' },
      { emoji: '⚽', title: 'Futbal / frisbee', desc: 'Dobré podmienky na tímové športy', intensity: 'vysoká' },
      { emoji: '🧘', title: 'Joga vonku', desc: 'Svieži vzduch pre outdoor cvičenie', intensity: 'nízka' },
      { emoji: '🎣', title: 'Rybolov', desc: 'Pokojné počasie ideálne na rybačku', intensity: 'nízka' },
    )
  } else if (w.temp >= -5 && w.temp < 5) {
    if (w.weatherCode >= 71 && w.weatherCode <= 77) {
      suggestions.push(
        { emoji: '⛷️', title: 'Lyžovanie / snowboard', desc: 'Čerstvý sneh! Ideálne na svah', intensity: 'vysoká' },
        { emoji: '🏂', title: 'Bežky / skialpinizmus', desc: 'Skvelé podmienky na zimné športy', intensity: 'vysoká' },
        { emoji: '⛸️', title: 'Korčuľovanie', desc: 'Mrazivé počasie na klzisko', intensity: 'stredná' },
        { emoji: '☃️', title: 'Stavanie snehuliaka', desc: 'Snehové radovánky pre celú rodinu', intensity: 'nízka' },
        { emoji: '🏊', title: 'Vnútorný bazén', desc: 'Zahrejte sa plaváním indoor', intensity: 'stredná' },
      )
    } else {
      suggestions.push(
        { emoji: '⛸️', title: 'Korčuľovanie', desc: `${w.temp}°C - ideálne na klzisko`, intensity: 'stredná' },
        { emoji: '🏃', title: 'Beh (s vrstvami)', desc: 'Chladné počasie, oblečte sa do vrstiev', intensity: 'vysoká' },
        { emoji: '🏋️', title: 'Posilňovňa', desc: 'Teplý indoor tréning', intensity: 'vysoká' },
        { emoji: '🧘', title: 'Indoor joga / pilates', desc: 'Relaxujte vo vnútri', intensity: 'nízka' },
        { emoji: '🏊', title: 'Vnútorný bazén / wellness', desc: 'Zahrejte sa wellness pobytom', intensity: 'stredná' },
      )
    }
  } else if (w.temp < -5) {
    suggestions.push(
      { emoji: '⛷️', title: 'Lyžovanie', desc: 'Mrazivé podmienky - perfektné na svah', intensity: 'vysoká' },
      { emoji: '🏋️', title: 'Posilňovňa', desc: 'Radšej tréning vnútri', intensity: 'vysoká' },
      { emoji: '🏊', title: 'Aquapark / wellness', desc: 'Zahrejte sa v teplej vode', intensity: 'stredná' },
      { emoji: '🎳', title: 'Bowling', desc: 'Indoor zábava pre skupinu', intensity: 'nízka' },
      { emoji: '🧗', title: 'Indoor lezecká stena', desc: 'Lezenie v teple', intensity: 'vysoká' },
    )
  } else {
    // Rainy/bad weather
    suggestions.push(
      { emoji: '🏋️', title: 'Posilňovňa', desc: `Vonku ${code.desc} - trénujte vnútri`, intensity: 'vysoká' },
      { emoji: '🏊', title: 'Krytý bazén', desc: 'Plávanie bez ohľadu na počasie', intensity: 'stredná' },
      { emoji: '🧘', title: 'Indoor joga', desc: 'Relaxačné cvičenie doma', intensity: 'nízka' },
      { emoji: '🎳', title: 'Bowling / stolný tenis', desc: 'Indoor aktivity pre skupiny', intensity: 'stredná' },
      { emoji: '🧗', title: 'Lezecká stena', desc: 'Indoor climbing centrum', intensity: 'vysoká' },
    )
  }

  return suggestions.slice(0, 5)
}

export async function GET() {
  // Fetch current Bratislava weather for suggestions
  let weather: WeatherSimple = { temp: 15, weatherCode: 0, windSpeed: 10, precipitation: 0 }
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=48.15&longitude=17.11&current=temperature_2m,weather_code,wind_speed_10m,precipitation&timezone=Europe%2FBratislava',
      { signal: AbortSignal.timeout(5000), next: { revalidate: 1800 } }
    )
    if (res.ok) {
      const data = await res.json()
      weather = {
        temp: Math.round(data.current?.temperature_2m ?? 15),
        weatherCode: data.current?.weather_code ?? 0,
        windSpeed: Math.round(data.current?.wind_speed_10m ?? 10),
        precipitation: data.current?.precipitation ?? 0,
      }
    }
  } catch { /* use defaults */ }

  const suggestions = getSuggestions(weather)

  return NextResponse.json({
    suggestions,
    weather,
    timestamp: Date.now(),
  })
}
