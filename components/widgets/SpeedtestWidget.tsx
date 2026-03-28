'use client'

import { useState, useCallback } from 'react'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface SpeedResult {
  download: number | null  // Mbps
  upload: number | null    // Mbps
  ping: number | null      // ms
  jitter: number | null    // ms
}

export default function SpeedtestWidget() {
  const { lang } = useLang()
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<SpeedResult>({ download: null, upload: null, ping: null, jitter: null })
  const [phase, setPhase] = useState<string>('')

  const runTest = useCallback(async () => {
    setTesting(true)
    setResult({ download: null, upload: null, ping: null, jitter: null })

    try {
      // Phase 1: Ping test (5 pings)
      setPhase(lang === 'sk' ? 'Meranie ping...' : 'Measuring ping...')
      const pings: number[] = []
      for (let i = 0; i < 5; i++) {
        const start = performance.now()
        await fetch('/api/speedtest', { method: 'HEAD', cache: 'no-store' })
        pings.push(performance.now() - start)
      }
      const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length
      const jitter = pings.length > 1
        ? pings.slice(1).reduce((sum, p, i) => sum + Math.abs(p - pings[i]), 0) / (pings.length - 1)
        : 0
      setResult(prev => ({ ...prev, ping: Math.round(avgPing), jitter: Math.round(jitter * 10) / 10 }))

      // Phase 2: Download test
      setPhase(lang === 'sk' ? 'Meranie sťahovania...' : 'Measuring download...')
      const dlStart = performance.now()
      const dlRes = await fetch('/api/speedtest', { cache: 'no-store' })
      const dlBlob = await dlRes.blob()
      const dlTime = (performance.now() - dlStart) / 1000 // seconds
      const dlBytes = dlBlob.size
      const dlMbps = (dlBytes * 8) / (dlTime * 1_000_000) // Mbps
      setResult(prev => ({ ...prev, download: Math.round(dlMbps * 10) / 10 }))

      // Phase 3: Upload test
      setPhase(lang === 'sk' ? 'Meranie nahrávania...' : 'Measuring upload...')
      const uploadData = new Blob([new ArrayBuffer(256 * 1024)]) // 256KB
      const ulStart = performance.now()
      await fetch('/api/speedtest', { method: 'POST', body: uploadData, cache: 'no-store' })
      const ulTime = (performance.now() - ulStart) / 1000
      const ulMbps = (uploadData.size * 8) / (ulTime * 1_000_000)
      setResult(prev => ({ ...prev, upload: Math.round(ulMbps * 10) / 10 }))

      setPhase('')
    } catch {
      setPhase(lang === 'sk' ? 'Chyba testu' : 'Test failed')
    } finally {
      setTesting(false)
    }
  }, [lang])

  return (
    <WidgetCard accent="cyan" title={lang === 'sk' ? 'Rýchlosť internetu' : 'Internet Speed'} icon="📶" onRefresh={runTest}>
      <div className="space-y-4">
        {/* Start button */}
        {!testing && result.download === null && (
          <div className="text-center py-6">
            <button
              onClick={runTest}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-sm hover:from-cyan-500/30 hover:to-blue-500/30 transition-all hover:scale-105"
            >
              {lang === 'sk' ? '▶ Spustiť test' : '▶ Start Test'}
            </button>
            <p className="text-[10px] text-slate-500 mt-2">
              {lang === 'sk' ? 'Zmeria ping, sťahovanie a nahrávanie' : 'Measures ping, download and upload'}
            </p>
          </div>
        )}

        {/* Testing animation */}
        {testing && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-cyan-400 text-sm font-semibold">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {phase}
            </div>
          </div>
        )}

        {/* Results */}
        {(result.ping !== null || result.download !== null || result.upload !== null) && (
          <div className="grid grid-cols-2 gap-3">
            {/* Ping */}
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center">
              <div className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">Ping</div>
              <div className="text-xl font-bold text-cyan-400 font-mono">
                {result.ping !== null ? result.ping : '—'}
              </div>
              <div className="text-[9px] text-slate-500">ms</div>
            </div>

            {/* Jitter */}
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center">
              <div className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">Jitter</div>
              <div className="text-xl font-bold text-purple-400 font-mono">
                {result.jitter !== null ? result.jitter : '—'}
              </div>
              <div className="text-[9px] text-slate-500">ms</div>
            </div>

            {/* Download */}
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center">
              <div className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">⬇️ {lang === 'sk' ? 'Sťahovanie' : 'Download'}</div>
              <div className="text-xl font-bold text-green-400 font-mono">
                {result.download !== null ? result.download : '—'}
              </div>
              <div className="text-[9px] text-slate-500">Mbps</div>
            </div>

            {/* Upload */}
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center">
              <div className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">⬆️ {lang === 'sk' ? 'Nahrávanie' : 'Upload'}</div>
              <div className="text-xl font-bold text-blue-400 font-mono">
                {result.upload !== null ? result.upload : '—'}
              </div>
              <div className="text-[9px] text-slate-500">Mbps</div>
            </div>
          </div>
        )}

        {/* Re-test button */}
        {!testing && result.download !== null && (
          <div className="text-center">
            <button onClick={runTest}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
              ↻ {lang === 'sk' ? 'Testovať znova' : 'Test again'}
            </button>
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-600 mt-2">{lang === 'sk' ? 'Lokálny test relatívne k serveru' : 'Local test relative to server'}</p>
    </WidgetCard>
  )
}
