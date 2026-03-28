import { NextResponse } from 'next/server'

export const revalidate = 3600

interface GitHubRepo {
  id: number; name: string; full_name: string; description: string | null
  html_url: string; language: string | null; stargazers_count: number
  forks_count: number; topics: string[]
}

// Fallback trending list (when GitHub API rate-limits)
const FALLBACK: GitHubRepo[] = [
  { id: 1, name: 'ollama', full_name: 'ollama/ollama', description: 'Get up and running with large language models locally', html_url: 'https://github.com/ollama/ollama', language: 'Go', stargazers_count: 91200, forks_count: 7100, topics: ['llm', 'ai', 'go'] },
  { id: 2, name: 'claude.ai', full_name: 'anthropics/anthropic-sdk-python', description: 'Official Anthropic Python SDK', html_url: 'https://github.com/anthropics/anthropic-sdk-python', language: 'Python', stargazers_count: 4200, forks_count: 430, topics: ['ai', 'python'] },
  { id: 3, name: 'cursor', full_name: 'getcursor/cursor', description: 'The AI-first code editor', html_url: 'https://www.cursor.com', language: 'TypeScript', stargazers_count: 28300, forks_count: 1800, topics: ['ai', 'editor'] },
  { id: 4, name: 'deno', full_name: 'denoland/deno', description: 'A modern runtime for JavaScript and TypeScript', html_url: 'https://github.com/denoland/deno', language: 'Rust', stargazers_count: 95800, forks_count: 5300, topics: ['runtime', 'javascript', 'typescript'] },
  { id: 5, name: 'shadcn-ui', full_name: 'shadcn-ui/ui', description: 'Beautifully designed components that you can copy and paste', html_url: 'https://github.com/shadcn-ui/ui', language: 'TypeScript', stargazers_count: 78400, forks_count: 5100, topics: ['ui', 'react', 'components'] },
  { id: 6, name: 'transformers.js', full_name: 'xenova/transformers.js', description: 'State-of-the-art Machine Learning for the web', html_url: 'https://github.com/xenova/transformers.js', language: 'JavaScript', stargazers_count: 12100, forks_count: 780, topics: ['ai', 'ml', 'javascript'] },
  { id: 7, name: 'mise', full_name: 'jdx/mise', description: 'dev tools, env vars, task runner', html_url: 'https://github.com/jdx/mise', language: 'Rust', stargazers_count: 11200, forks_count: 390, topics: ['devtools', 'rust'] },
  { id: 8, name: 'wxt', full_name: 'wxt-dev/wxt', description: 'Vite-powered Web Extension Framework', html_url: 'https://github.com/wxt-dev/wxt', language: 'TypeScript', stargazers_count: 5800, forks_count: 222, topics: ['browser-extension', 'vite', 'framework'] },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lang = searchParams.get('lang') ?? 'all'

  const since = new Date()
  since.setDate(since.getDate() - 7)
  const sinceStr = since.toISOString().slice(0, 10)

  const langQuery = lang !== 'all' ? `+language:${lang}` : ''
  const url = `https://api.github.com/search/repositories?q=created:>${sinceStr}${langQuery}&sort=stars&order=desc&per_page=10`

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'InfoSK-Dashboard/1.0',
        Accept: 'application/vnd.github+json',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json({ repos: FALLBACK })
    }

    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repos: GitHubRepo[] = (data.items ?? []).slice(0, 10).map((r: any) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      html_url: r.html_url,
      language: r.language,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      topics: r.topics ?? [],
    }))

    return NextResponse.json({ repos: repos.length ? repos : FALLBACK })
  } catch {
    return NextResponse.json({ repos: FALLBACK })
  }
}
