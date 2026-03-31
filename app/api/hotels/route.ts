import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed + 777)

  const hotels = [
    { name: 'Hotel Devín', stars: 4, area: 'Staré Mesto', amenities: ['WiFi', 'Raňajky', 'Wellness'] },
    { name: 'Radisson Blu', stars: 5, area: 'Hviezdoslavovo nám.', amenities: ['WiFi', 'Pool', 'Gym', 'Raňajky'] },
    { name: 'Lindner Hotel Gallery', stars: 4, area: 'Záhradnícka', amenities: ['WiFi', 'Raňajky', 'Bar'] },
    { name: 'Hotel Tatra', stars: 4, area: 'Námestie 1. mája', amenities: ['WiFi', 'Raňajky', 'Parking'] },
    { name: 'Grand Hotel River Park', stars: 5, area: 'Dvořákovo nábrežie', amenities: ['WiFi', 'Spa', 'Pool', 'Restaurant'] },
    { name: 'Hostel Blues', stars: 2, area: 'Špitálska', amenities: ['WiFi', 'Bar', 'Kitchen'] },
    { name: 'Mama\'s Design & Boutique', stars: 3, area: 'Vysoká', amenities: ['WiFi', 'Raňajky'] },
    { name: 'Austria Trend Bratislava', stars: 4, area: 'Vysoká', amenities: ['WiFi', 'Raňajky', 'Fitness'] },
    { name: 'Hotel Marrol\'s', stars: 5, area: 'Tobrucká', amenities: ['WiFi', 'Spa', 'Raňajky', 'Parking'] },
    { name: 'Ibis Bratislava Centrum', stars: 2, area: 'Zámocká', amenities: ['WiFi', 'Bar'] },
  ]

  const listings = hotels.map(h => {
    const basePrice = h.stars === 5 ? 150 : h.stars === 4 ? 85 : h.stars === 3 ? 55 : 25
    const price = Math.floor(basePrice * (0.8 + rng() * 0.6))
    const rating = +(7 + rng() * 2.5).toFixed(1)
    const reviews = Math.floor(200 + rng() * 2000)
    return {
      ...h,
      pricePerNight: price,
      rating,
      reviews,
      availability: rng() > 0.15,
      freeCancel: rng() > 0.4,
      deal: rng() > 0.7 ? `${Math.floor(10 + rng() * 30)}% zľava` : null,
    }
  }).sort((a, b) => a.pricePerNight - b.pricePerNight)

  return NextResponse.json({ hotels: listings, city: 'Bratislava', timestamp: Date.now() })
}
