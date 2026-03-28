'use client'
import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'

interface Repo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  topics: string[]
}

interface Data { repos: Repo[] }

const LANG_OPTIONS = [
  { key: 'all', label: 'Všetky' },
  { key: 'typescript', label: 'TypeScript' },
  { key: 'python', label: 'Python' },
  { key: 'go', label: 'Go' },
  { key: 'rust', label: 'Rust' },
]

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f7df1e', Python: '#3572a5', Go: '#00add8',
  Rust: '#dea584', Java: '#b07219', 'C++': '#f34b7d', C: '#555', Ruby: '#701516',
  Swift: '#f05138', Kotlin: '#a97bff', Dart: '#00b4ab', Shell: '#89e051',
  HTML: '#e34c26', CSS: '#563d7c', Nix: '#7e7eff',
}

export default function GitHubTrendingWidget() {
  const [lang, setLang] = useState('all')
  const { data, loading, error, refetch } = useWidget<Data>(
    `/api/github-trending?lang=${lang}`, 3600
  )

  return (
    <div className="widget-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="widget-title">🐙 GitHub Trending</h2>
        <button onClick={refetch} className="text-xs text-muted hover:text-primary transition-colors">↻</button>
      </div>

      {/* Language filter */}
      <div className="flex gap-1 flex-wrap mb-3">
        {LANG_OPTIONS.map(o => (
          <button
            key={o.key}
            onClick={() => setLang(o.key)}
            className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
              lang === o.key
                ? 'bg-primary text-white'
                : 'bg-surface2 text-muted hover:text-primary'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-muted text-sm animate-pulse">Načítavam trendy…</span>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 text-center py-4">Chyba načítania</div>
      )}

      {data && (
        <ul className="flex-1 overflow-y-auto space-y-2 text-sm">
          {data.repos.map((repo, i) => (
            <li key={repo.id} className="group">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-surface2 transition-colors"
              >
                <span className="text-muted font-mono text-xs w-4 shrink-0 pt-0.5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-primary group-hover:underline truncate">
                      {repo.full_name}
                    </span>
                    {repo.language && (
                      <span className="flex items-center gap-1 text-xs text-muted shrink-0">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ background: LANG_COLORS[repo.language] ?? '#888' }}
                        />
                        {repo.language}
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-muted text-xs mt-0.5 line-clamp-2">{repo.description}</p>
                  )}
                  <div className="flex gap-3 mt-1 text-xs text-muted">
                    <span>⭐ {repo.stargazers_count.toLocaleString()}</span>
                    <span>🍴 {repo.forks_count.toLocaleString()}</span>
                    {repo.topics.slice(0, 3).map(t => (
                      <span key={t} className="bg-blue-500/10 text-blue-400 px-1 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
