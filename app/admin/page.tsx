'use client'

import { useState, useEffect, useCallback } from 'react'

interface AdminStats {
  visitors: { totalPageViews: number; uniqueVisitors: number; activeSessions: number }
  config: AdminConfig
  banList?: Record<string, { attempts: number; lastAttempt: number; banned: boolean; shadowBanned: boolean }>
}

interface AdminConfig {
  siteName: string; announcement: string; maintenanceMode: boolean; enabledWidgets: string[]
}

interface ApiTestResult {
  api: string; status: number; ok: boolean; ms: number
}

const ALL_WIDGETS = [
  { id: 'daysummary', label: '🕐 Hlavný panel' },
  { id: 'flashnews', label: '📢 Flash správy' },
  { id: 'stats', label: '🌤️ Počasie & Prehľad' },
  { id: 'news', label: '📰 Správy' },
  { id: 'slovensko', label: '🇸🇰 Slovensko' },
  { id: 'financie', label: '💶 Financie' },
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
  const [tab, setTab] = useState<'overview' | 'widgets' | 'settings' | 'security' | 'apis' | 'actions'>('overview')
  const [initializing, setInitializing] = useState(true)
  const [apiResults, setApiResults] = useState<ApiTestResult[] | null>(null)
  const [testingApis, setTestingApis] = useState(false)

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
        setMessage(err?.error ?? '❌ Neplatný kód')
      }
    } catch { setMessage('❌ Chyba pripojenia') }
    setLoading(false)
  }

  useEffect(() => {
    if (!authenticated) return
    const t = setInterval(fetchStats, 30_000)
    return () => clearInterval(t)
  }, [authenticated, fetchStats])

  const updateConfig = async (updates: Partial<AdminConfig>) => {
    const res = await fetch(`/api/admin?code=${encodeURIComponent(code)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateConfig', ...updates }),
    })
    if (res.ok) { const data = await res.json(); setConfig(data.config); showMsg('✅ Uložené') }
  }

  const showMsg = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000) }

  const resetVisitors = async () => {
    if (!confirm('Naozaj chcete resetovať štatistiky návštevníkov?')) return
    await fetch(`/api/admin?code=${encodeURIComponent(code)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resetVisitors' }),
    })
    showMsg('✅ Štatistiky resetované')
    fetchStats()
  }

  const clearCache = async () => {
    await fetch(`/api/admin?code=${encodeURIComponent(code)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clearCache' }),
    })
    showMsg('✅ Cache vymazaný')
  }

  const testApis = async () => {
    setTestingApis(true); setApiResults(null)
    try {
      const res = await fetch(`/api/admin?code=${encodeURIComponent(code)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'testApis' }),
      })
      if (res.ok) { const data = await res.json(); setApiResults(data.results) }
    } catch { showMsg('❌ Test zlyhal') }
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
      <div className="border-b border-white/5 backdrop-blur-xl" style={{ background: 'rgba(12, 14, 20, 0.88)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div><h1 className="text-lg font-bold text-white">Slovakia Info Admin</h1><p className="text-[10px] text-slate-500">Správa dashboardu</p></div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">📊 Dashboard</a>
            <button onClick={() => { setAuthenticated(false); localStorage.removeItem('admin-code') }} className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-white/5">🔒 Odhlásiť</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {message && <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 text-sm text-green-400">{message}</div>}

        {/* Tab navigation */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto">
          {[
            { key: 'overview', label: '📊 Prehľad' },
            { key: 'actions', label: '⚡ Akcie' },
            { key: 'apis', label: '🔌 API Test' },
            { key: 'widgets', label: '🧩 Widgety' },
            { key: 'settings', label: '⚙️ Nastavenia' },
            { key: 'security', label: '🛡️ Bezpečnosť' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                tab === t.key ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}>{t.label}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon="👁️" label="Zobrazenia stránky" value={stats.visitors.totalPageViews.toLocaleString('sk-SK')} color="text-blue-400" />
              <StatCard icon="🧑" label="Unikátni návštevníci" value={String(stats.visitors.uniqueVisitors)} color="text-emerald-400" />
              <StatCard icon="🟢" label="Teraz online" value={String(stats.visitors.activeSessions)} color="text-yellow-400" />
            </div>
            <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Systém</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <InfoCard label="Framework" value="Next.js 14" />
                <InfoCard label="API Routes" value="25+" />
                <InfoCard label="Widgety" value={`${config?.enabledWidgets?.length ?? 0} sekcií`} />
                <InfoCard label="Status" value={config?.maintenanceMode ? '🔧 Údržba' : '✅ Online'} green={!config?.maintenanceMode} />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {tab === 'actions' && (
          <div className="space-y-4">
            <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Rýchle akcie</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ActionButton icon="🗑️" title="Resetovať návštevníkov" desc="Vymaže všetky údaje o návštevách" color="red" onClick={resetVisitors} />
                <ActionButton icon="🔄" title="Vymazať cache" desc="Vynúti nové načítanie dát" color="blue" onClick={clearCache} />
                <ActionButton icon="📊" title="Obnoviť štatistiky" desc="Načítať aktuálne údaje" color="green" onClick={fetchStats} />
                <ActionButton icon="🔌" title="Test všetkých API" desc="Overí dostupnosť endpointov" color="purple" onClick={testApis} loading={testingApis} />
              </div>
            </div>
            <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Údržba</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ActionButton icon="🔧" title={config?.maintenanceMode ? 'Vypnúť údržbu' : 'Zapnúť údržbu'} desc="Režim údržby dashboardu" color="yellow"
                  onClick={() => updateConfig({ maintenanceMode: !config?.maintenanceMode })} />
                <a href="/" className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4 text-left hover:bg-white/[0.05] transition-all">
                  <span className="text-2xl">🔗</span>
                  <div><div className="text-sm font-semibold text-slate-300">Otvoriť dashboard</div><div className="text-[11px] text-slate-500">Zobraziť verejnú stránku</div></div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* API Test */}
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

        {/* Widgets */}
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

        {/* Settings */}
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

        {/* Security */}
        {tab === 'security' && stats && (
          <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">🛡️ IP Ban & Shadow Ban</h3>
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
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
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

function ActionButton({ icon, title, desc, color, onClick, loading }: { icon: string; title: string; desc: string; color: string; onClick: () => void; loading?: boolean }) {
  const colors: Record<string, string> = {
    red: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15',
    blue: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15',
    green: 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15',
    purple: 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/15',
  }
  const titleColors: Record<string, string> = { red: 'text-red-400', blue: 'text-blue-400', green: 'text-green-400', purple: 'text-purple-400', yellow: 'text-yellow-400' }
  return (
    <button onClick={onClick} disabled={loading}
      className={`flex items-center gap-3 border rounded-xl p-4 text-left transition-all disabled:opacity-50 ${colors[color]}`}>
      <span className="text-2xl">{loading ? '⏳' : icon}</span>
      <div><div className={`text-sm font-semibold ${titleColors[color]}`}>{title}</div><div className="text-[11px] text-slate-500">{desc}</div></div>
    </button>
  )
}
