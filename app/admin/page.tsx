'use client'

import { useState, useEffect, useCallback } from 'react'

interface VisitorStats {
  totalPageViews: number
  todayPageViews: number
  weekPageViews: number
  monthPageViews: number
  activeSessions: number
}

interface AdminStats {
  visitors: VisitorStats
  config: AdminConfig
  banList?: Record<string, { attempts: number; lastAttempt: number; banned: boolean; shadowBanned: boolean }>
}

interface AdminConfig {
  siteName: string; announcement: string; maintenanceMode: boolean; enabledWidgets: string[]
}

interface ApiTestResult { api: string; status: number; ok: boolean; ms: number }
interface HistoryEntry { date: string; views: number }
interface VisitorLogEntry { ts: number; ip: string; browser: string; path: string }

const ALL_WIDGETS = [
  { id: 'daysummary', label: '🕐 Hlavný panel' },
  { id: 'flashnews', label: '📢 Flash správy' },
  { id: 'stats', label: '🌤️ Počasie & Prehľad' },
  { id: 'news', label: '📰 Správy' },
  { id: 'slovensko', label: '🇸🇰 Slovensko' },
  { id: 'financie', label: '💶 Financie' },
  { id: 'podnikanie', label: '💼 Podnikanie' },
  { id: 'fun', label: '🎮 Zábava' },
  { id: 'restaurants', label: '🍽️ Reštaurácie' },
  { id: 'ai', label: '🤖 AI & Tech' },
  { id: 'extras', label: '🔭 Objavy' },
  { id: 'history', label: '📚 História' },
]

export default function AdminPage() {
  const [code, setCode] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [config, setConfig] = useState<AdminConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok')
  const [tab, setTab] = useState<'overview' | 'visitors' | 'counters' | 'widgets' | 'settings' | 'security' | 'apis'>('overview')
  const [initializing, setInitializing] = useState(true)
  const [apiResults, setApiResults] = useState<ApiTestResult[] | null>(null)
  const [testingApis, setTestingApis] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[] | null>(null)
  const [visitorLog, setVisitorLog] = useState<VisitorLogEntry[] | null>(null)
  const [loadingLog, setLoadingLog] = useState(false)
  const [setTotalVal, setSetTotalVal] = useState('')
  const [addViewsVal, setAddViewsVal] = useState('100')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const savedCode = localStorage.getItem('admin-code')
    if (savedCode) {
      setCode(savedCode)
      fetch(`/api/admin?code=${encodeURIComponent(savedCode)}&action=stats`)
        .then(r => { if (r.ok) return r.json(); throw new Error('Invalid') })
        .then((data: AdminStats) => { setStats(data); setConfig(data.config ? { ...data.config, enabledWidgets: data.config.enabledWidgets ?? [] } : null); setAuthenticated(true) })
        .catch(() => localStorage.removeItem('admin-code'))
        .finally(() => setInitializing(false))
    } else {
      setInitializing(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin?code=${encodeURIComponent(code)}&action=stats`)
      if (!res.ok) { if (res.status === 401 || res.status === 403) { setAuthenticated(false); localStorage.removeItem('admin-code') }; return }
      const data: AdminStats = await res.json()
      setStats(data)
      setConfig(data.config ? { ...data.config, enabledWidgets: data.config.enabledWidgets ?? [] } : null)
    } catch { /* ignore */ }
  }, [code])

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin?code=${encodeURIComponent(code)}&action=history`)
      if (res.ok) { const data = await res.json(); setHistory(data.history) }
    } catch { /* ignore */ }
  }, [code])

  const fetchVisitorLog = useCallback(async () => {
    setLoadingLog(true)
    try {
      const res = await fetch(`/api/admin?code=${encodeURIComponent(code)}&action=visitorsRecent`)
      if (res.ok) { const data = await res.json(); setVisitorLog(data.entries) }
    } catch { /* ignore */ }
    setLoadingLog(false)
  }, [code])

  const handleLogin = async () => {
    setLoading(true); setMessage('')
    try {
      const res = await fetch(`/api/admin?code=${encodeURIComponent(code)}&action=stats`)
      if (res.ok) {
        const data: AdminStats = await res.json()
        setStats(data); setConfig(data.config ? { ...data.config, enabledWidgets: data.config.enabledWidgets ?? [] } : null)
        setAuthenticated(true); localStorage.setItem('admin-code', code)
      } else {
        const err = await res.json().catch(() => null)
        setMessage(err?.error ?? '❌ Neplatný kód'); setMsgType('err')
      }
    } catch { setMessage('❌ Chyba pripojenia'); setMsgType('err') }
    setLoading(false)
  }

  useEffect(() => {
    if (!authenticated) return
    fetchHistory()
    const t = setInterval(fetchStats, 30_000)
    return () => clearInterval(t)
  }, [authenticated, fetchStats, fetchHistory])

  useEffect(() => {
    if (authenticated && tab === 'visitors') fetchVisitorLog()
  }, [authenticated, tab, fetchVisitorLog])

  const updateConfig = async (updates: Partial<AdminConfig>) => {
    const res = await fetch(`/api/admin?code=${encodeURIComponent(code)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateConfig', ...updates }),
    })
    if (res.ok) { const data = await res.json(); setConfig(data.config); showMsg('✅ Uložené') }
  }

  const showMsg = (msg: string, type: 'ok' | 'err' = 'ok') => { setMessage(msg); setMsgType(type); setTimeout(() => setMessage(''), 4000) }

  const postAction = async (action: string, extra: Record<string, unknown> = {}) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin?code=${encodeURIComponent(code)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) { showMsg('✅ ' + ((data as Record<string,string>).message ?? 'Hotovo')); fetchStats(); fetchHistory() }
      else showMsg('❌ ' + ((data as Record<string,string>).error ?? 'Chyba'), 'err')
    } catch { showMsg('❌ Chyba', 'err') }
    setActionLoading(false)
  }

  const testApis = async () => {
    setTestingApis(true); setApiResults(null)
    try {
      const res = await fetch(`/api/admin?code=${encodeURIComponent(code)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'testApis' }),
      })
      if (res.ok) { const data = await res.json(); setApiResults(data.results) }
    } catch { showMsg('❌ Test zlyhal', 'err') }
    setTestingApis(false)
  }

  if (initializing) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0e14' }}><div className="text-slate-500 text-sm">Načítavam...</div></div>
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0e14' }}>
        <div className="bg-[#13161f] border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-xl font-bold text-white">Slovakia Info Admin</h1>
            <p className="text-sm text-slate-500 mt-1">Zadajte prístupový kód</p>
          </div>
          <input type="password" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Prístupový kód..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg tracking-widest focus:outline-none focus:border-blue-500/50 transition-all" />
          <button onClick={handleLogin} disabled={loading || !code}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all">
            {loading ? 'Overujem...' : 'Prihlásiť'}
          </button>
          {message && <p className="text-center text-sm mt-3 text-red-400">{message}</p>}
          <a href="/" className="block text-center text-sm text-slate-500 hover:text-slate-300 mt-4 transition-colors">← Späť na dashboard</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0c0e14', color: '#d4d8e0' }}>
      {/* Header */}
      <div className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl" style={{ background: 'rgba(12,14,20,0.92)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div><h1 className="text-lg font-bold text-white">Slovakia Info Admin</h1><p className="text-[10px] text-slate-500">Správcovský panel</p></div>
          </div>
          <div className="flex items-center gap-2">
            {stats?.visitors && (
              <div className="hidden sm:flex items-center gap-3 mr-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /><span className="text-emerald-300 font-bold">{stats.visitors.activeSessions}</span><span className="text-slate-600">live</span></span>
                <span className="text-slate-700">|</span>
                <span className="text-orange-300 font-bold">{stats.visitors.todayPageViews}</span><span className="text-slate-600">dnes</span>
                <span className="text-slate-700">|</span>
                <span className="text-blue-300 font-bold">{stats.visitors.totalPageViews.toLocaleString('sk-SK')}</span><span className="text-slate-600">celkom</span>
              </div>
            )}
            <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">📋 Dashboard</a>
            <button onClick={() => { setAuthenticated(false); localStorage.removeItem('admin-code') }} className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-white/5">🔒 Odhlásiť</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {message && (
          <div className={`mb-4 rounded-xl px-4 py-2.5 text-sm font-semibold ${msgType === 'ok' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto scrollbar-hide">
          {[
            { key: 'overview',  label: '📊 Prehľad' },
            { key: 'visitors',  label: '👥 Návštevníci' },
            { key: 'counters',  label: '🔢 Počítadlá' },
            { key: 'widgets',   label: '🧩 Widgety' },
            { key: 'settings',  label: '⚙️ Nastavenia' },
            { key: 'security',  label: '🛡️ Bezpečnosť' },
            { key: 'apis',      label: '🔌 API Test' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                tab === t.key ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}>{t.label}</button>
          ))}
        </div>

        {/* ── PREHĽAD ── */}
        {tab === 'overview' && stats && (
          <div className="space-y-5">
            {/* Live stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard icon="🟢" label="Teraz online" value={String(stats.visitors.activeSessions)} color="text-emerald-400" pulse />
              <StatCard icon="📅" label="Dnes" value={stats.visitors.todayPageViews.toLocaleString('sk-SK')} color="text-orange-400" />
              <StatCard icon="📆" label="Tento týždeň" value={stats.visitors.weekPageViews.toLocaleString('sk-SK')} color="text-yellow-400" />
              <StatCard icon="🗓️" label="Tento mesiac" value={stats.visitors.monthPageViews.toLocaleString('sk-SK')} color="text-blue-400" />
              <StatCard icon="👁️" label="Celkom" value={stats.visitors.totalPageViews.toLocaleString('sk-SK')} color="text-purple-400" />
            </div>

            {/* History chart */}
            {history && history.length > 0 && (
              <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">História návštevnosti (30 dní)</h3>
                  <button onClick={fetchHistory} className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded-lg hover:bg-white/5">↺ Obnoviť</button>
                </div>
                <MiniBarChart data={history} />
              </div>
            )}

            {/* System info */}
            <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Systém</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <InfoCard label="Framework" value="Next.js 14" />
                <InfoCard label="Widgety" value={`${config?.enabledWidgets?.length ?? 0} sekcií`} />
                <InfoCard label="Status" value={config?.maintenanceMode ? '🔧 Údržba' : '✅ Online'} green={!config?.maintenanceMode} />
                <InfoCard label="Cache TTL" value="5–60 min" />
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Rýchle akcie</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => postAction('clearCache')} disabled={actionLoading}
                  className="text-[11px] bg-blue-500/15 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/25 transition-all disabled:opacity-50">🔄 Vymazať cache</button>
                <button onClick={() => updateConfig({ maintenanceMode: !config?.maintenanceMode })}
                  className={`text-[11px] px-3 py-1.5 rounded-lg transition-all ${config?.maintenanceMode ? 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                  🔧 {config?.maintenanceMode ? 'Vypnúť údržbu' : 'Zapnúť údržbu'}</button>
                <button onClick={() => { setTab('apis'); setTimeout(() => testApis(), 100) }}
                  className="text-[11px] bg-purple-500/15 text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-500/25 transition-all">🔌 Test API</button>
                <a href="/" target="_blank" className="text-[11px] bg-white/5 text-slate-400 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all">🔗 Otvoriť stránku</a>
              </div>
            </div>
          </div>
        )}

        {/* ── NÁVŠTEVNÍCI ── */}
        {tab === 'visitors' && (
          <div className="space-y-4">
            <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Posledné návštevy</h3>
                <div className="flex items-center gap-2">
                  <button onClick={fetchVisitorLog} disabled={loadingLog}
                    className="text-[11px] bg-blue-500/15 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/25 transition-all disabled:opacity-50">
                    {loadingLog ? '⏳ Načítavam...' : '↺ Obnoviť'}
                  </button>
                  <button onClick={() => postAction('clearLog')} disabled={actionLoading}
                    className="text-[11px] bg-red-500/15 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/25 transition-all disabled:opacity-50">
                    🗑️ Vymazať log
                  </button>
                </div>
              </div>

              {visitorLog === null ? (
                <div className="py-8 text-center text-sm text-slate-500">Kliknite &quot;Obnoviť&quot; pre načítanie logu</div>
              ) : visitorLog.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">Zatiaľ žiadne záznamy</div>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Záznamy', value: String(visitorLog.length) },
                      { label: 'Unique IPs', value: String(new Set(visitorLog.map(e => e.ip)).size) },
                      { label: 'Najpop. stránka', value: Array.from(visitorLog.reduce((m, e) => { m.set(e.path, (m.get(e.path) ?? 0) + 1); return m }, new Map<string, number>())).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-' },
                      { label: 'Chrome / Firefox', value: `${visitorLog.filter(e => e.browser === 'Chrome').length} / ${visitorLog.filter(e => e.browser === 'Firefox').length}` },
                    ].map(s => (
                      <div key={s.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                        <div className="text-[9px] text-slate-500 uppercase tracking-wide">{s.label}</div>
                        <div className="text-sm font-bold text-white mt-0.5 truncate">{s.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wide text-left">
                          <th className="pb-2 pr-4">Čas</th>
                          <th className="pb-2 pr-4">IP (maskovaná)</th>
                          <th className="pb-2 pr-4">Prehliadač</th>
                          <th className="pb-2">Stránka</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitorLog.map((e, i) => (
                          <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                            <td className="py-1.5 pr-4 text-slate-400 whitespace-nowrap font-mono">
                              {new Date(e.ts).toLocaleString('sk-SK', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-1.5 pr-4 text-slate-300 font-mono">{e.ip}</td>
                            <td className="py-1.5 pr-4">
                              <BrowserBadge browser={e.browser} />
                            </td>
                            <td className="py-1.5 text-blue-400 font-mono truncate max-w-[200px]">{e.path}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── POČÍTADLÁ ── */}
        {tab === 'counters' && (
          <div className="space-y-4">
            {/* Current values */}
            {stats?.visitors && (
              <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Aktuálne počítadlá</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Dnes', value: stats.visitors.todayPageViews, action: 'resetToday', color: 'text-orange-400', btnColor: 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25' },
                    { label: 'Tento týždeň', value: stats.visitors.weekPageViews, action: 'resetWeek', color: 'text-yellow-400', btnColor: 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25' },
                    { label: 'Tento mesiac', value: stats.visitors.monthPageViews, action: 'resetMonth', color: 'text-blue-400', btnColor: 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25' },
                    { label: 'Celkom', value: stats.visitors.totalPageViews, action: 'resetAll', color: 'text-purple-400', btnColor: 'bg-red-500/15 text-red-400 hover:bg-red-500/25' },
                  ].map(c => (
                    <div key={c.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{c.label}</div>
                      <div className={`text-xl font-bold tabular-nums ${c.color}`}>{c.value.toLocaleString('sk-SK')}</div>
                      <button onClick={() => { if (confirm(`Reset počítadla "${c.label}"?`)) postAction(c.action) }} disabled={actionLoading}
                        className={`w-full text-[10px] py-1 rounded-lg transition-all disabled:opacity-50 ${c.btnColor}`}>
                        🗑️ Reset
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pridať zobrazenia */}
            <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Upraviť hodnoty</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-2">Pridať zobrazenia (všetky počítadlá)</label>
                  <div className="flex gap-2">
                    <input type="number" value={addViewsVal} onChange={e => setAddViewsVal(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50" />
                    <button onClick={() => postAction('addViews', { value: Number(addViewsVal) })} disabled={actionLoading}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl transition-all">+ Pridať</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-2">Nastaviť celkový počet na</label>
                  <div className="flex gap-2">
                    <input type="number" value={setTotalVal} onChange={e => setSetTotalVal(e.target.value)} placeholder="napr. 1000"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50" />
                    <button onClick={() => { if (setTotalVal && !isNaN(Number(setTotalVal))) postAction('setTotal', { value: Number(setTotalVal) }) }} disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl transition-all">Nastaviť</button>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <button onClick={() => { if (confirm('Naozaj resetovať VŠETKY počítadlá?')) postAction('resetAll') }} disabled={actionLoading}
                  className="text-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 px-5 py-2 rounded-xl transition-all disabled:opacity-50">
                  ⚠️ Reset všetkých počítadiel
                </button>
              </div>
            </div>

            {/* History */}
            {history && history.length > 0 && (
              <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">História (30 dní)</h3>
                <MiniBarChart data={history} />
              </div>
            )}
          </div>
        )}

        {/* ── WIDGETS ── */}
        {tab === 'widgets' && config && (
          <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Sekcie dashboardu</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ALL_WIDGETS.map(w => {
                const enabled = config.enabledWidgets.includes(w.id)
                return (
                  <button key={w.id}
                    onClick={() => {
                      const newWidgets = enabled ? config.enabledWidgets.filter(id => id !== w.id) : [...config.enabledWidgets, w.id]
                      updateConfig({ enabledWidgets: newWidgets })
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      enabled ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300' : 'bg-white/3 border border-white/5 text-slate-500 hover:text-slate-300'
                    }`}>
                    <span className={`w-3 h-3 rounded-full ${enabled ? 'bg-blue-400' : 'bg-slate-600'}`} />
                    {w.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && config && (
          <div className="space-y-4">
            <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Základné nastavenia</h3>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Názov stránky</label>
                <input type="text" value={config.siteName} onChange={e => setConfig({ ...config, siteName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Oznámenie (zobrazí sa na dashboarde)</label>
                <textarea value={config.announcement} onChange={e => setConfig({ ...config, announcement: e.target.value })} rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50 resize-none" />
              </div>
              <button onClick={() => updateConfig({ siteName: config.siteName, announcement: config.announcement })}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-xl transition-all">💾 Uložiť zmeny</button>
            </div>
          </div>
        )}

        {/* ── SECURITY ── */}
        {tab === 'security' && stats && (
          <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">🛡️ IP Ban & Shadow Ban</h3>
            <p className="text-xs text-slate-500 mb-4">Po 3 neúspešných pokusoch o prihlásenie je IP automaticky zablokovaná na 24h.</p>
            {stats.banList && Object.keys(stats.banList).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.banList).map(([ipHash, record]) => (
                  <div key={ipHash} className="flex items-center justify-between bg-white/3 rounded-xl p-3">
                    <div>
                      <div className="text-sm font-mono text-slate-300">{ipHash}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500">Pokusy: {record.attempts}</span>
                        <span className="text-[10px] text-slate-500">Posledný: {new Date(record.lastAttempt).toLocaleString('sk-SK')}</span>
                        {record.banned && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">Zablokovaný</span>}
                        {record.shadowBanned && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">Shadow Ban</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!record.shadowBanned && (
                        <button onClick={async () => {
                          await fetch(`/api/admin?code=${encodeURIComponent(code)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'shadowBan', ipHash }) })
                          showMsg('✅ Shadow ban aktivovaný'); fetchStats()
                        }} className="text-[11px] bg-purple-500/15 text-purple-400 px-2.5 py-1.5 rounded-lg hover:bg-purple-500/25 transition-all">👻 Shadow Ban</button>
                      )}
                      <button onClick={async () => {
                        await fetch(`/api/admin?code=${encodeURIComponent(code)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'unban', ipHash }) })
                        showMsg('✅ Odblokované'); fetchStats()
                      }} className="text-[11px] bg-green-500/15 text-green-400 px-2.5 py-1.5 rounded-lg hover:bg-green-500/25 transition-all">✅ Odblokovať</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4">Žiadne zablokované IP adresy</p>
            )}
          </div>
        )}

        {/* ── API TEST ── */}
        {tab === 'apis' && (
          <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">API Endpoints</h3>
              <button onClick={testApis} disabled={testingApis}
                className="text-[11px] bg-blue-500/15 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/25 transition-all disabled:opacity-50">
                {testingApis ? '⏳ Testujem...' : '▶️ Spustiť test'}
              </button>
            </div>
            {apiResults ? (
              <div className="space-y-1">
                {apiResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <span className={`w-2 h-2 rounded-full ${r.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-mono text-slate-400 flex-1">{r.api}</span>
                    <span className={`text-[10px] font-mono ${r.ms < 500 ? 'text-green-400' : r.ms < 2000 ? 'text-yellow-400' : 'text-red-400'}`}>{r.ms}ms</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${r.ok ? 'bg-green-500/15 text-green-300' : 'bg-red-500/15 text-red-300'}`}>
                      {r.ok ? r.status : '❌ Fail'}
                    </span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-4 text-[10px]">
                  <span className="text-green-400">✅ {apiResults.filter(r => r.ok).length} OK</span>
                  <span className="text-red-400">❌ {apiResults.filter(r => !r.ok).length} Failed</span>
                  <span className="text-slate-500">⏱ Avg {Math.round(apiResults.reduce((a, r) => a + r.ms, 0) / apiResults.length)}ms</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">Kliknite &quot;Spustiť test&quot; pre otestovanie všetkých API endpointov</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function BrowserBadge({ browser }: { browser: string }) {
  const map: Record<string, string> = { Chrome: 'bg-green-500/20 text-green-300', Firefox: 'bg-orange-500/20 text-orange-300', Safari: 'bg-blue-500/20 text-blue-300', Edge: 'bg-sky-500/20 text-sky-300', 'Bot/Script': 'bg-red-500/20 text-red-300' }
  return <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${map[browser] ?? 'bg-slate-700 text-slate-400'}`}>{browser}</span>
}

function MiniBarChart({ data }: { data: HistoryEntry[] }) {
  const max = Math.max(...data.map(d => d.views), 1)
  const avg = Math.round(data.filter(d => d.views > 0).reduce((a, d) => a + d.views, 0) / (data.filter(d => d.views > 0).length || 1))
  const recent7 = data.slice(-7).reduce((a, d) => a + d.views, 0)
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-px" style={{ height: 64 }}>
        {data.map((d, i) => {
          const h = Math.max(2, Math.round((d.views / max) * 60))
          const isToday = i === data.length - 1
          const isWknd = [0, 6].includes(new Date(d.date + 'T00:00:00').getDay())
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative" style={{ height: 64 }}>
              <div className={`w-full rounded-sm ${isToday ? 'bg-blue-400' : isWknd ? 'bg-slate-600/70' : 'bg-slate-700 group-hover:bg-slate-500'} transition-colors`} style={{ height: h }} />
              <div className="absolute bottom-full mb-1 bg-slate-800 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                {d.date.slice(5)}: {d.views}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
        <span>Dátum: <span className="text-slate-300">{data[0]?.date.slice(5)} – {data[data.length - 1]?.date.slice(5)}</span></span>
        <span>Priemer/deň: <span className="text-blue-300">{avg}</span></span>
        <span>Max: <span className="text-emerald-300">{max}</span> ({data.find(d => d.views === max)?.date.slice(5)})</span>
        <span>Posl. 7 dní: <span className="text-orange-300">{recent7}</span></span>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, pulse }: { icon: string; label: string; value: string; color: string; pulse?: boolean }) {
  return (
    <div className="bg-[#13161f] border border-white/5 rounded-2xl p-4">
      <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <div className={`text-xl font-bold tabular-nums ${color} flex items-center gap-1`}>
          {pulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          {value}
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="bg-white/3 rounded-xl p-3">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className={`font-semibold ${green ? 'text-green-400' : 'text-white'}`}>{value}</div>
    </div>
  )
}
