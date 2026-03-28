'use client'

import { useState, useCallback, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'

interface SpeedResult {
  download: number | null
  upload: number | null
  ping: number | null
  jitter: number | null
  timestamp: number
}

const HISTORY_KEY = 'infoweb-speedtest-history'

function loadHistory(): SpeedResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHistory(h: SpeedResult[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 10))) } catch { /* ignore */ }
}

export default function SpeedtestWidget() {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<SpeedResult>({ download: null, upload: null, ping: null, jitter: null, timestamp: 0 })
  const [phase, setPhase] = useState('')
  const [history, setHistory] = useState<SpeedResult[]>([])

  useEffect(() => { setHistory(loadHistory()) }, [])

  const runTest = useCallback(async () => {
    setTesting(true)
    setOpen(true)
    setResult({ download: null, upload: null, ping: null, jitter: null, timestamp: 0 })

    try {
      setPhase(lang === 'sk' ? 'Ping...' : 'Ping...')
      const pings: number[] = []
      for (let i = 0; i < 5; i++) {
        const start = performance.now()
        await fetch('/api/speedtest', { method: 'HEAD', cache: 'no-store' })
        pings.push(performance.now() - start)
      }
      const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length
      const jitter = pings.length > 1 ? pings.slice(1).reduce((sum, p, i) => sum + Math.abs(p - pings[i]), 0) / (pings.length - 1) : 0
      setResult(prev => ({ ...prev, ping: Math.round(avgPing), jitter: Math.round(jitter * 10) / 10 }))

      setPhase(lang === 'sk' ? '⬇ Download...' : '⬇ Download...')
      const dlStart = performance.now()
      const dlRes = await fetch('/api/speedtest', { cache: 'no-store' })
      const dlBlob = await dlRes.blob()
      const dlTime = (performance.now() - dlStart) / 1000
      const dlMbps = (dlBlob.size * 8) / (dlTime * 1_000_000)
      setResult(prev => ({ ...prev, download: Math.round(dlMbps * 10) / 10 }))

      setPhase(lang === 'sk' ? '⬆ Upload...' : '⬆ Upload...')
      const uploadData = new Blob([new ArrayBuffer(256 * 1024)])
      const ulStart = performance.now()
      await fetch('/api/speedtest', { method: 'POST', body: uploadData, cache: 'no-store' })
      const ulTime = (performance.now() - ulStart) / 1000
      const ulMbps = (uploadData.size * 8) / (ulTime * 1_000_000)

      const finalResult: SpeedResult = {
        download: Math.round(dlMbps * 10) / 10,
        upload: Math.round(ulMbps * 10) / 10,
        ping: Math.round(avgPing),
        jitter: Math.round(jitter * 10) / 10,
        timestamp: Date.now(),
      }
      setResult(finalResult)
      setPhase('')

      // Save to history
      const newHistory = [finalResult, ...loadHistory()].slice(0, 10)
      saveHistory(newHistory)
      setHistory(newHistory)
    } catch {
      setPhase(lang === 'sk' ? 'Chyba' : 'Failed')
    } finally {
      setTesting(false)
    }
  }, [lang])

  const lastResult = history[0]

  return (
    <div className="relative">
      {/* Compact trigger button */}
      <button
        onClick={() => open ? setOpen(false) : setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] transition-all text-[10px]"
      >
        <span>📶</span>
        <span className="text-slate-400 font-semibold">{lang === 'sk' ? 'Rýchlosť' : 'Speed'}</span>
        {lastResult && (
          <span className="text-green-400 font-bold font-mono">{lastResult.download} Mbps</span>
        )}
        <span className={`text-slate-600 text-[8px] transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* Expandable panel */}
      {open && (
        <div className="absolute top-full left-0 mt-1 z-40 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-3">
          {/* Run test button */}
          <div className="text-center mb-3">
            <button
              onClick={runTest}
              disabled={testing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] hover:from-cyan-500/30 hover:to-blue-500/30 transition-all disabled:opacity-50"
            >
              {testing ? phase : (lang === 'sk' ? '▶ Spustiť test' : '▶ Start Test')}
            </button>
          </div>

          {/* Current result */}
          {(result.ping !== null || result.download !== null) && (
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              <MiniMetric label="Ping" value={result.ping} unit="ms" color="text-cyan-400" />
              <MiniMetric label="Jitter" value={result.jitter} unit="ms" color="text-purple-400" />
              <MiniMetric label="⬇" value={result.download} unit="Mbps" color="text-green-400" />
              <MiniMetric label="⬆" value={result.upload} unit="Mbps" color="text-blue-400" />
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                {lang === 'sk' ? 'História meraní' : 'Test History'}
              </div>
              <div className="space-y-0.5 max-h-[160px] overflow-y-auto scrollbar-hide">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] py-1 px-1.5 rounded-md hover:bg-white/[0.03]">
                    <span className="text-slate-600 font-mono w-14 shrink-0">
                      {new Date(h.timestamp).toLocaleString('sk-SK', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-green-400 font-bold font-mono w-14">⬇{h.download}</span>
                    <span className="text-blue-400 font-mono w-14">⬆{h.upload}</span>
                    <span className="text-cyan-400 font-mono">{h.ping}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MiniMetric({ label, value, unit, color }: { label: string; value: number | null; unit: string; color: string }) {
  return (
    <div className="bg-white/[0.03] rounded-lg p-1.5 text-center border border-white/5">
      <div className="text-[8px] text-slate-500 uppercase">{label}</div>
      <div className={`text-[12px] font-bold font-mono ${color}`}>
        {value !== null ? value : '—'}
      </div>
      <div className="text-[7px] text-slate-600">{unit}</div>
    </div>
  )
}
