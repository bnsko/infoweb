import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Server-side: generate a payload for download speed test and measure server response time
export async function GET() {
  const start = Date.now()
  // Generate 500KB of random-ish data for download test
  const size = 500 * 1024
  const data = Buffer.alloc(size, 'x')
  const serverTime = Date.now() - start

  return new NextResponse(data, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(size),
      'X-Server-Time': String(serverTime),
      'Cache-Control': 'no-store',
    },
  })
}

export async function POST() {
  // Upload speed test: just measure how fast client can send data
  const start = Date.now()
  const elapsed = Date.now() - start
  return NextResponse.json({ elapsed, timestamp: Date.now() })
}
