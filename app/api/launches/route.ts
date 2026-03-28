import { NextResponse } from 'next/server'

// Launch Library 2 free tier: 15 req/hour unauthenticated – 1h cache is safe
export const revalidate = 3600

export async function GET() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    const url =
      'https://ll.thespacedevs.com/2.2.0/launch/upcoming/' +
      '?format=json&limit=8&ordering=net&mode=list'

    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'InfoSK-Dashboard/1.0',
        Accept: 'application/json',
      },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`Launch Library ${res.status}`)
    const json = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (json.results ?? []).map((l: any) => ({
      id: l.id,
      name: l.name,
      statusName: l.status?.name ?? '—',
      statusAbbrev: l.status?.abbrev ?? '—',
      net: l.net,
      provider: l.launch_service_provider?.name ?? '—',
      rocket: l.rocket?.configuration?.name ?? l.name.split('|')[0]?.trim() ?? '—',
      pad: l.pad?.location?.name ?? '—',
      missionDesc: l.mission?.description?.slice(0, 180) ?? null,
      imageUrl: l.image ?? null,
      infoUrl: l.infoURLs?.[0]?.url ?? l.vidURLs?.[0]?.url ?? null,
      launchLibraryUrl: `https://ll.thespacedevs.com/2.2.0/launch/${l.id}/`,
      webcastUrl: l.vidURLs?.[0]?.url ?? null,
    }))

    return NextResponse.json({ results })
  } catch (err) {
    clearTimeout(timer)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Launches fetch failed' },
      { status: 500 }
    )
  }
}
