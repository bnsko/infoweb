'use client'

import { useState, useEffect, useCallback } from 'react'

interface AdminStats {
  visitors: {
    totalPageViews: number
    uniqueVisitors: number
    activeSessions: number
  }
  config: AdminConfig
  banList?: Record<string, { attempts: number; lastAttempt: number; banned: boolean; shadowBanned: boolean }>
}

interface AdminConfig {
  siteName: string
  announcement: string
  maintenanceMode: boolean
  enabledWidgets: string[]
}

const ALL_WIDGETS = [
  { id: 'weather', label: '🌤️ Počasie' },
  { id: 'stats', label: '📊 Štatistiky' },
  { id: 'currency', label: '💱 Meny' },
  { id: 'crypto', label: '₿ Krypto' },
  { id: 'flights', label: '✈️ Lety' },
  { id: 'iss', label: '🛰️ ISS & Vzduch' },
  { id: 'earthquakes', label: '🌍 Zemetrasenia' },
  { id: 'launches', label: '🚀 Štarty' },
  { id: 'reddit', label: '🟠 Reddit' },
  { id: 'onthisday', label: '📖 Dnes v histórii' },
  { id: 'news', label: '📰 Správy' },
  { id: 'population', label: '🌍 Populácia' },
  { id: 'nameday', label: '🎂 Meniny' },
  { id: 'steam', label: '🎮 Steam' },
  { id: 'epic', label: '🎁 Epic Free' },
  { id: 'sports', label: '⚽ Šport Live' },
  { id: 'ainews', label: '🤖 AI Správy' },
  { id: 'slovakfacts', label: '🇸🇰 SK Infografika' },
  { id: 'redditglobal', label: '📈 Reddit Top 10' },
]

export default function AdminPage() {
  const [code, setCode] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [config, setConfig] = useState<AdminConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [tab, setTab] = useState<'overview' | 'widgets' | 'settings' | 'security' | 'advanced'>('overview')
  const [initializing, setInitializing] = useState(true)

  // Restore auth from localStorage on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('admin-code')
    if (savedCode) {
      setCode(savedCode)
      // Verify the saved code is still valid
      fetch(`/api/admin?code=${savedCode}&action=stats`)
        .then(r => {
          if (r.ok) return r.json()
          throw new Error('Invalid')
        })
        .then((data: AdminStats) => {
          setStats(data)
          setConfig(data.config)
          setAuthenticated(true)
        })
        .catch(() => {
          localStorage.removeItem('admin-code')
        })
        .finally(() => setInitializing(false))
    } else {
      setInitializing(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    const res = await fetch(`/api/admin?code=${code}&action=stats`)
    if (!res.ok) {
      // If auth fails, log out
      if (res.status === 401 || res.status === 403) {
        setAuthenticated(false)
        localStorage.removeItem('admin-code')
      }
      return
    }
    const data: AdminStats = await res.json()
    setStats(data)
    setConfig(data.config)
  }, [code])

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin?code=${code}&action=stats`)
      if (res.ok) {
        const data: AdminStats = await res.json()
        setStats(data)
        setConfig(data.config)
        setAuthenticated(true)
        localStorage.setItem('admin-code', code)
      } else {
        setMessage('❌ Neplatný kód')
      }
    } catch {
      setMessage('❌ Chyba pripojenia')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!authenticated) return
    const t = setInterval(fetchStats, 30_000)
    return () => clearInterval(t)
  }, [authenticated, fetchStats])

  const updateConfig = async (updates: Partial<AdminConfig>) => {
    const res = await fetch(`/api/admin?code=${code}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateConfig', ...updates }),
    })
    if (res.ok) {
      const data = await res.json()
      setConfig(data.config)
      setMessage('✅ Uložené')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const resetVisitors = async () => {
    if (!confirm('Naozaj chcete resetovať štatistiky návštevníkov?')) return
    await fetch(`/api/admin?code=${code}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resetVisitors' }),
    })
    setMessage('✅ Štatistiky resetované')
    fetchStats()
    setTimeout(() => setMessage(''), 2000)
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0e14' }}>
        <div className="text-slate-500 text-sm">Načítavam...</div>
      </div>
    )
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
          <input
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Prístupový kód..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg tracking-widest focus:outline-none focus:border-blue-500/50 transition-all"
          />
          <button
            onClick={handleLogin}
            disabled={loading || !code}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
          >
            {loading ? 'Overujem...' : 'Prihlásiť'}
          </button>
          {message && <p className="text-center text-sm mt-3 text-red-400">{message}</p>}
          <a href="/" className="block text-center text-sm text-slate-500 hover:text-slate-300 mt-4 transition-colors">
            ← Späť na dashboard
          </a>
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
            <div>
              <h1 className="text-lg font-bold text-white">Slovakia Info Admin</h1>
              <p className="text-[10px] text-slate-500">Správa dashboardu</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              📊 Dashboard
            </a>
            <button onClick={() => { setAuthenticated(false); localStorage.removeItem('admin-code') }} className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-white/5">
              🔒 Odhlásiť
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {message && (
          <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 text-sm text-green-400">
            {message}
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto">
          {[
            { key: 'overview', label: '📊 Prehľad', icon: '' },
            { key: 'widgets', label: '🧩 Widgety', icon: '' },
            { key: 'settings', label: '⚙️ Nastavenia', icon: '' },
            { key: 'security', label: '🛡️ Bezpečnosť', icon: '' },
            { key: 'advanced', label: '🔧 Pokročilé', icon: '' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                tab === t.key
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
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
                <div className="bg-white/3 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500">Framework</div>
                  <div className="font-semibold text-white">Next.js 14</div>
                </div>
                <div className="bg-white/3 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500">API Routes</div>
                  <div className="font-semibold text-white">21+</div>
                </div>
                <div className="bg-white/3 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500">Widgety</div>
                  <div className="font-semibold text-white">{config?.enabledWidgets.length ?? 0}</div>
                </div>
                <div className="bg-white/3 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500">Status</div>
                  <div className="font-semibold text-green-400">{config?.maintenanceMode ? '🔧 Údržba' : '✅ Online'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Widgets Tab */}
        {tab === 'widgets' && config && (
          <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Aktívne widgety</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ALL_WIDGETS.map(w => {
                const enabled = config.enabledWidgets.includes(w.id)
                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      const newWidgets = enabled
                        ? config.enabledWidgets.filter(id => id !== w.id)
                        : [...config.enabledWidgets, w.id]
                      updateConfig({ enabledWidgets: newWidgets })
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      enabled
                        ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300'
                        : 'bg-white/3 border border-white/5 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${enabled ? 'bg-blue-400' : 'bg-slate-600'}`} />
                    {w.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && config && (
          <div className="space-y-4">
            <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Základné nastavenia</h3>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Názov stránky</label>
                <input
                  type="text"
                  value={config.siteName}
                  onChange={e => setConfig({ ...config, siteName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Oznámenie (zobrazí sa na dashboarde)</label>
                <textarea
                  value={config.announcement}
                  onChange={e => setConfig({ ...config, announcement: e.target.value })}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateConfig({ maintenanceMode: !config.maintenanceMode })}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    config.maintenanceMode
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {config.maintenanceMode ? '🔧 Režim údržby: ZAP' : '✅ Režim údržby: VYP'}
                </button>
              </div>

              <button
                onClick={() => updateConfig({ siteName: config.siteName, announcement: config.announcement })}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-xl transition-all"
              >
                💾 Uložiť zmeny
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {tab === 'security' && stats && (
          <div className="space-y-4">
            <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">🛡️ IP Ban & Shadow Ban</h3>
              <p className="text-xs text-slate-500 mb-4">
                Po 3 neúspešných pokusoch o prihlásenie je IP automaticky zablokovaná na 24h. Shadow ban robí, že sa zdanlivo dá prihlásiť, ale vždy vráti &quot;Neplatný kód&quot;.
              </p>
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
                          <button
                            onClick={async () => {
                              await fetch(`/api/admin?code=${code}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'shadowBan', ipHash }),
                              })
                              setMessage('✅ Shadow ban aktivovaný')
                              fetchStats()
                              setTimeout(() => setMessage(''), 2000)
                            }}
                            className="text-[11px] bg-purple-500/15 text-purple-400 px-2.5 py-1.5 rounded-lg hover:bg-purple-500/25 transition-all"
                          >
                            👻 Shadow Ban
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            await fetch(`/api/admin?code=${code}`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'unban', ipHash }),
                            })
                            setMessage('✅ Odblokované')
                            fetchStats()
                            setTimeout(() => setMessage(''), 2000)
                          }}
                          className="text-[11px] bg-green-500/15 text-green-400 px-2.5 py-1.5 rounded-lg hover:bg-green-500/25 transition-all"
                        >
                          ✅ Odblokovať
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-4">Žiadne zablokované IP adresy</p>
              )}
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {tab === 'advanced' && (
          <div className="space-y-4">
            <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Pokročilé akcie</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={resetVisitors}
                  className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-left hover:bg-red-500/15 transition-all"
                >
                  <span className="text-2xl">🗑️</span>
                  <div>
                    <div className="text-sm font-semibold text-red-400">Resetovať návštevníkov</div>
                    <div className="text-[11px] text-slate-500">Vymaže všetky údaje o návštevách</div>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    await fetch(`/api/admin?code=${code}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'clearCache' }),
                    })
                    setMessage('✅ Cache vymazaný')
                    setTimeout(() => setMessage(''), 2000)
                  }}
                  className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-left hover:bg-blue-500/15 transition-all"
                >
                  <span className="text-2xl">🔄</span>
                  <div>
                    <div className="text-sm font-semibold text-blue-400">Vymazať cache</div>
                    <div className="text-[11px] text-slate-500">Vynúti nové načítanie dát</div>
                  </div>
                </button>

                <button
                  onClick={fetchStats}
                  className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-left hover:bg-green-500/15 transition-all"
                >
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="text-sm font-semibold text-green-400">Obnoviť štatistiky</div>
                    <div className="text-[11px] text-slate-500">Načítať aktuálne údaje</div>
                  </div>
                </button>

                <a
                  href="/"
                  className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-left hover:bg-purple-500/15 transition-all"
                >
                  <span className="text-2xl">🔗</span>
                  <div>
                    <div className="text-sm font-semibold text-purple-400">Otvoriť dashboard</div>
                    <div className="text-[11px] text-slate-500">Zobraziť verejnú stránku</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-[#13161f] border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">API Endpoints</h3>
              <div className="space-y-1 text-xs font-mono text-slate-500">
                {['/api/weather', '/api/news', '/api/worldnews', '/api/sportnews', '/api/gamingnews',
                  '/api/musicnews', '/api/historynews', '/api/hacknews', '/api/reddit', '/api/currency',
                  '/api/crypto', '/api/flights', '/api/iss', '/api/airquality', '/api/earthquakes',
                  '/api/launches', '/api/onthisday', '/api/stats', '/api/visitors', '/api/admin',
                  '/api/steam', '/api/epicfree', '/api/sportscore', '/api/ainews', '/api/redditglobal', '/api/slovakfacts',
                ].map(ep => (
                  <div key={ep} className="flex items-center gap-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {ep}
                  </div>
                ))}
              </div>
            </div>
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
