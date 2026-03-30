'use client'

import { useState, useCallback, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

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
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20))) } catch {}
}

function Sparkline({ values, color, max }: { values: number[]; color: string; max: number }) {
  if (values.length < 2) return null
  const h = 28, w = 100
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - (v / (max || 1)) * h * 0.85
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} className="opacity-50">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GaugeArc({ value, max, color, label, unit, active }: {
  value: number | null; max: number; color: string; label: string; unit: string; active: boolean
}) {
  const pct = value !== null ? Math.min(value / max, 1) : 0
  const r = 36
  const circ = Math.PI * r
  const offset = circ - pct * circ
  return (
    <div className="flex flex-col items-center">
      <svg width="84" height="48" viewBox="0 0 84 48">
        <path d="M 6 44 A 36 36 0 0 1 78 44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 6 44 A 36 36 0 0 1 78 44" fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round"
          strokeDasharray={`${circ}`} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out" style={{ opacity: active ? 0.4 : 0.85 }} />
      </svg>
      <div className="-mt-5 text-center">
        <div className={`text-base font-bold font-mono tabular-nums leading-none ${active ? 'animate-pulse text-slate-500' : ''}`} style={{ color: active ? undefined : color }}>
          {value !== null ? value : '—'}
        </div>
        <div className="text-[7px] text-slate-500 uppercase mt-0.5">{unit}</div>
      </div>
      <div className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider mt-1">{label}</div>
    </div>
  )
}

export default function SpeedtestWidget() {
  const { lang } = useLang()
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<SpeedResult>({ download: null, upload: null, ping: null, jitter: null, timestamp: 0 })
  const [phase, setPhase] = useState('')
  const [history, setHistory] = useState<SpeedResult[]>([])

  useEffect(() => { setHistory(loadHistory()) }, [])

  const runTest = useCallback(async () => {
    setTesting(true)
    setResult({ download: null, upload: null, ping: null, jitter: null, timestamp: 0 })

    try {
      setPhase('Ping...')
      const pings: number[] = []
      for (let i = 0; i < 5; i++) {
        const start = performance.now()
        await fetch('/api/speedtest', { method: 'HEAD', cache: 'no-store' })
        pings.push(performance.now() - start)
      }
      const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length
      const jitter = pings.length > 1 ? pings.slice(1).reduce((sum, p, i) => sum + Math.abs(p - pings[i]), 0) / (pings.length - 1) : 0
      setResult(prev => ({ ...prev, ping: Math.round(avgPing), jitter: Math.round(jitter * 10) / 10 }))

      setPhase('Download...')
      const dlStart = performance.now()
      const dlRes = await fetch('/api/speedtest', { cache: 'no-store' })
      const dlBlob = await dlRes.blob()
      const dlTime = (performance.now() - dlStart) / 1000
      const dlMbps = (dlBlob.size * 8) / (dlTime * 1_000_000)
      setResult(prev => ({ ...prev, download: Math.round(dlMbps * 10) / 10 }))

      setPhase('Upload...')
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

      const newHistory = [finalResult, ...loadHistory()].slice(0, 20)
      saveHistory(newHistory)
      setHistory(newHistory)
    } catch {
      setPhase('Chyba')
    } finally {
      setTesting(false)
    }
  }, [])

  const last = history[0]
  const dlVals = history.filter(h => h.download != null).map(h => h.download!).reverse()
  const ulVals = history.filter(h => h.upload != null).map(h => h.upload!).reverse()
  const pingVals = history.filter(h => h.ping != null).map(h => h.ping!).reverse()

  return (
    <WidgetCard accent="cyan" title="Speedtest" icon="📶">
      {/* Gauges */}
      <div className="flex items-center justify-around mb-3">
        <GaugeArc value={result.download ?? last?.download ?? null} max={200} color="#22c55e" label="Download" unit="Mbps" active={testing && phase.includes('Download')} />
        <GaugeArc value={result.upload ?? last?.upload ?? null} max={100} color="#3b82f6" label="Upload" unit="Mbps" active={testing && phase.includes('Upload')} />
        <GaugeArc value={result.ping ?? last?.ping ?? null} max={200} color="#06b6d4" label="Ping" unit="ms" active={testing && phase.includes('Ping')} />
      </div>

      {/* Jitter + ISP info + button */}
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-0.5">
          <span className="text-[9px] text-slate-500 block">
            Jitter: <span className="text-purple-400 font-mono font-bold">{result.jitter ?? last?.jitter ?? '—'} ms</span>
          </span>
          {last && (
            <span className="text-[8px] text-slate-600 block">
              Posledné: {new Date(last.timestamp).toLocaleString('sk-SK', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <button onClick={runTest} disabled={testing}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/25 text-cyan-300 font-bold text-[10px] hover:from-cyan-500/25 hover:to-blue-500/25 transition-all disabled:opacity-50">
          {testing ? `⏳ ${phase}` : '▶ Merať'}
        </button>
      </div>

      {/* Sparklines row */}
      {dlVals.length > 1 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-white/[0.02] rounded-lg p-1.5 border border-white/5 text-center">
            <div className="text-[7px] text-green-500/60 uppercase font-semibold mb-0.5">⬇ Download</div>
            <Sparkline values={dlVals} color="#22c55e" max={Math.max(100, ...dlVals)} />
          </div>
          <div className="bg-white/[0.02] rounded-lg p-1.5 border border-white/5 text-center">
            <div className="text-[7px] text-blue-500/60 uppercase font-semibold mb-0.5">⬆ Upload</div>
            <Sparkline values={ulVals} color="#3b82f6" max={Math.max(50, ...ulVals)} />
          </div>
          <div className="bg-white/[0.02] rounded-lg p-1.5 border border-white/5 text-center">
            <div className="text-[7px] text-cyan-500/60 uppercase font-semibold mb-0.5">📡 Ping</div>
            <Sparkline values={pingVals} color="#06b6d4" max={Math.max(100, ...pingVals)} />
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-0.5 max-h-[80px] overflow-y-auto scrollbar-hide">
          {history.slice(0, 6).map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-[8px] py-0.5 px-1 rounded hover:bg-white/[0.03]">
              <span className="text-slate-600 font-mono w-12 shrink-0">
                {new Date(h.timestamp).toLocaleString('sk-SK', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-green-400 font-bold font-mono w-12">⬇{h.download}</span>
              <span className="text-blue-400 font-mono w-10">⬆{h.upload}</span>
              <span className="text-cyan-400 font-mono">{h.ping}ms</span>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}

/* ── Mini speedtest for main panel ── */
export function SpeedtestMini(props: { onOpenChange?: (open: boolean) => void }) {
  const { onOpenChange } = props
  const [open, setOpen] = useState(false)
  useEffect(() => { onOpenChange?.(open) }, [open, onOpenChange])
  const [history] = useState<SpeedResult[]>(() => loadHistory())
  const last = history[0]

  return (
    <>
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border shrink-0 ${
          open ? 'bg-cyan-500/15 border-cyan-500/25 text-cyan-300' : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/20'
        }`}>
        <span>📶</span>
        {last ? (
          <span className="font-mono tabular-nums">
            <span className="text-green-400">⬇{last.download}</span>
            <span className="text-slate-600 mx-0.5">/</span>
            <span className="text-blue-400">⬆{last.upload}</span>
            <span className="text-slate-600 mx-0.5">/</span>
            <span className="text-cyan-400">{last.ping}ms</span>
          </span>
        ) : (
          <span className="text-slate-500">Merať</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[480px]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-slate-800 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm">✕</button>
            <SpeedtestWidget />
          </div>
        </div>
      )}
    </>
  )
}
