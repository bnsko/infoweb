import { NextResponse } from 'next/server'

export const revalidate = 600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const hour = now.getHours()
  const seed = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + hour
  const rng = seededRng(seed + 555)

  const isLunchTime = hour >= 10 && hour <= 14
  const isDinnerTime = hour >= 17 && hour <= 22
  const isOpen = hour >= 8 && hour <= 23

  const restaurants = [
    { name: 'Burger King', icon: '🍔', platform: 'Wolt', category: 'Fast food', avgDelivery: 25, minOrder: 8 },
    { name: 'Pizza Mizza', icon: '🍕', platform: 'Wolt', category: 'Pizza', avgDelivery: 30, minOrder: 10 },
    { name: 'Vietnam House', icon: '🍜', platform: 'Bolt Food', category: 'Ázijská', avgDelivery: 35, minOrder: 12 },
    { name: 'KFC', icon: '🍗', platform: 'Wolt', category: 'Fast food', avgDelivery: 20, minOrder: 6 },
    { name: 'Sushi Time', icon: '🍣', platform: 'Bolt Food', category: 'Japonská', avgDelivery: 40, minOrder: 15 },
    { name: 'Vegan Garden', icon: '🥗', platform: 'Wolt', category: 'Zdravá', avgDelivery: 28, minOrder: 10 },
    { name: 'Don Papa', icon: '🌮', platform: 'Bolt Food', category: 'Mexická', avgDelivery: 25, minOrder: 9 },
    { name: 'Hummus Bar', icon: '🧆', platform: 'Wolt', category: 'Blízky východ', avgDelivery: 22, minOrder: 8 },
    { name: 'Bistro St. Germain', icon: '🥐', platform: 'Wolt', category: 'Francúzska', avgDelivery: 35, minOrder: 12 },
    { name: 'Ramen Lab', icon: '🍜', platform: 'Bolt Food', category: 'Japonská', avgDelivery: 30, minOrder: 11 },
  ]

  const available = restaurants.map(r => ({
    ...r,
    isOpen: isOpen && rng() > 0.1,
    deliveryTime: Math.floor(r.avgDelivery * (0.8 + rng() * 0.6) * ((isLunchTime || isDinnerTime) ? 1.3 : 1)),
    deliveryFee: +(0.5 + rng() * 2.5).toFixed(1),
    rating: +(3.8 + rng() * 1.2).toFixed(1),
    promoOffer: rng() > 0.75 ? `${Math.floor(10 + rng() * 30)}% zľava` : null,
    popularDish: ['Klasický burger', 'Margherita', 'Pho bo', 'Bucket menu', 'Salmon set', 'Buddha bowl', 'Burrito grande', 'Falafel tanier', 'Croissant šunka', 'Tonkotsu ramen'][restaurants.indexOf(r)],
    popularDishPrice: +(5 + rng() * 10).toFixed(1),
  }))

  const recommendations = available
    .filter(r => r.isOpen)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)

  return NextResponse.json({
    restaurants: available,
    recommendations,
    isLunchTime,
    isDinnerTime,
    isOpen,
    timestamp: Date.now(),
  })
}
