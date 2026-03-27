import { NextResponse } from 'next/server'

export const revalidate = 86400 // refresh daily

interface Tool {
  name: string
  description: string
  descriptionSk: string
  category: 'ai' | 'cli' | 'saas' | 'devtool' | 'design'
  url: string
  emoji: string
  tags: string[]
}

// Curated list of interesting tools - one per day rotation
const TOOLS: Tool[] = [
  { name: 'Cursor', description: 'AI-powered code editor built on VS Code', descriptionSk: 'AI editor kódu postavený na VS Code', category: 'ai', url: 'https://cursor.sh', emoji: '🖥️', tags: ['AI', 'Editor', 'Coding'] },
  { name: 'Vercel v0', description: 'AI-powered UI generation from text prompts', descriptionSk: 'AI generovanie UI z textových promptov', category: 'ai', url: 'https://v0.dev', emoji: '🎨', tags: ['AI', 'UI', 'React'] },
  { name: 'Raycast', description: 'Blazingly fast launcher for macOS with AI', descriptionSk: 'Bleskovo rýchly launcher pre macOS s AI', category: 'devtool', url: 'https://raycast.com', emoji: '🚀', tags: ['macOS', 'Productivity'] },
  { name: 'Warp', description: 'AI-powered terminal for the modern developer', descriptionSk: 'AI terminál pre moderného vývojára', category: 'cli', url: 'https://warp.dev', emoji: '⚡', tags: ['Terminal', 'AI'] },
  { name: 'Linear', description: 'Streamlined project management for software teams', descriptionSk: 'Efektívny projektový manažment pre tímy', category: 'saas', url: 'https://linear.app', emoji: '📋', tags: ['Project', 'SaaS'] },
  { name: 'Supabase', description: 'Open source Firebase alternative with Postgres', descriptionSk: 'Open source alternatíva k Firebase s Postgres', category: 'saas', url: 'https://supabase.com', emoji: '🗄️', tags: ['Database', 'Backend'] },
  { name: 'Turborepo', description: 'High-performance build system for JS/TS monorepos', descriptionSk: 'Vysokovýkonný build systém pre monorepos', category: 'devtool', url: 'https://turbo.build', emoji: '🏎️', tags: ['Build', 'Monorepo'] },
  { name: 'Fig / Amazon Q', description: 'AI terminal autocomplete and CLI development', descriptionSk: 'AI autocomplete pre terminál', category: 'cli', url: 'https://fig.io', emoji: '🧠', tags: ['CLI', 'AI'] },
  { name: 'Perplexity', description: 'AI-powered search engine with citations', descriptionSk: 'AI vyhľadávač s citáciami zdrojov', category: 'ai', url: 'https://perplexity.ai', emoji: '🔍', tags: ['AI', 'Search'] },
  { name: 'Excalidraw', description: 'Virtual whiteboard for hand-drawn diagrams', descriptionSk: 'Virtuálna tabuľa pre ručne kreslené diagramy', category: 'design', url: 'https://excalidraw.com', emoji: '✏️', tags: ['Design', 'Collaboration'] },
  { name: 'Bun', description: 'All-in-one JS runtime, bundler, test runner', descriptionSk: 'All-in-one JS runtime, bundler, test runner', category: 'cli', url: 'https://bun.sh', emoji: '🍞', tags: ['Runtime', 'JavaScript'] },
  { name: 'Tailscale', description: 'Zero-config VPN built on WireGuard', descriptionSk: 'Bezúdržbová VPN postavená na WireGuard', category: 'devtool', url: 'https://tailscale.com', emoji: '🔐', tags: ['VPN', 'Network'] },
  { name: 'Notion', description: 'All-in-one workspace with AI integration', descriptionSk: 'All-in-one pracovný priestor s AI', category: 'saas', url: 'https://notion.so', emoji: '📝', tags: ['Notes', 'Wiki', 'AI'] },
  { name: 'Zed', description: 'High-performance multiplayer code editor', descriptionSk: 'Vysokovýkonný multiplayer editor kódu', category: 'devtool', url: 'https://zed.dev', emoji: '⚡', tags: ['Editor', 'Rust'] },
  { name: 'Ollama', description: 'Run large language models locally on your machine', descriptionSk: 'Spúšťajte AI modely lokálne na vašom počítači', category: 'ai', url: 'https://ollama.ai', emoji: '🦙', tags: ['AI', 'Local', 'LLM'] },
  { name: 'Coolify', description: 'Open-source self-hostable Heroku/Vercel alternative', descriptionSk: 'Open-source self-hosted alternatíva k Heroku', category: 'devtool', url: 'https://coolify.io', emoji: '❄️', tags: ['DevOps', 'Self-host'] },
  { name: 'Hoppscotch', description: 'Open source API development ecosystem', descriptionSk: 'Open source ekosystém pre vývoj API', category: 'devtool', url: 'https://hoppscotch.io', emoji: '🦗', tags: ['API', 'Testing'] },
  { name: 'Resend', description: 'Modern email API for developers', descriptionSk: 'Moderné email API pre vývojárov', category: 'saas', url: 'https://resend.com', emoji: '📧', tags: ['Email', 'API'] },
  { name: 'Biome', description: 'Fast formatter and linter for JS/TS/JSON', descriptionSk: 'Rýchly formátovač a linter pre JS/TS', category: 'cli', url: 'https://biomejs.dev', emoji: '🌿', tags: ['Linter', 'Formatter'] },
  { name: 'Arc Browser', description: 'Chromium browser reimagined for the AI era', descriptionSk: 'Chromium prehliadač pre éru AI', category: 'devtool', url: 'https://arc.net', emoji: '🌐', tags: ['Browser', 'Productivity'] },
  { name: 'Deno', description: 'Modern TypeScript-first runtime with built-in tools', descriptionSk: 'Moderný TypeScript-first runtime', category: 'cli', url: 'https://deno.com', emoji: '🦕', tags: ['Runtime', 'TypeScript'] },
  { name: 'tldraw', description: 'Infinite canvas SDK for creative applications', descriptionSk: 'SDK pre kreatívne aplikácie s nekonečným plátnom', category: 'design', url: 'https://tldraw.com', emoji: '🎯', tags: ['Canvas', 'SDK'] },
  { name: 'n8n', description: 'Workflow automation with AI capabilities', descriptionSk: 'Automatizácia workflow s AI schopnosťami', category: 'saas', url: 'https://n8n.io', emoji: '🔄', tags: ['Automation', 'AI'] },
  { name: 'Fly.io', description: 'Deploy app servers close to your users globally', descriptionSk: 'Nasaďte servery blízko vašich používateľov', category: 'saas', url: 'https://fly.io', emoji: '✈️', tags: ['Deploy', 'Edge'] },
  { name: 'Pocketbase', description: 'Open source backend in a single Go binary', descriptionSk: 'Open source backend v jednom Go binári', category: 'devtool', url: 'https://pocketbase.io', emoji: '📦', tags: ['Backend', 'SQLite'] },
  { name: 'Mermaid', description: 'Create diagrams from markdown-like text', descriptionSk: 'Vytvárajte diagramy z textu', category: 'devtool', url: 'https://mermaid.js.org', emoji: '🧜', tags: ['Diagrams', 'Docs'] },
  { name: 'Neon', description: 'Serverless Postgres with branching', descriptionSk: 'Serverless Postgres s vetvením', category: 'saas', url: 'https://neon.tech', emoji: '💚', tags: ['Database', 'Serverless'] },
  { name: 'Astro', description: 'Content-first web framework with islands', descriptionSk: 'Webový framework pre obsah s ostrovmi', category: 'devtool', url: 'https://astro.build', emoji: '🚀', tags: ['Framework', 'SSG'] },
  { name: 'Mise', description: 'Polyglot tool version manager (formerly rtx)', descriptionSk: 'Polyglotný správca verzií nástrojov', category: 'cli', url: 'https://mise.jdx.dev', emoji: '🔧', tags: ['CLI', 'DevTools'] },
  { name: 'Claude Code', description: 'AI coding agent in the terminal', descriptionSk: 'AI kódovací agent v termináli', category: 'ai', url: 'https://claude.ai', emoji: '🤖', tags: ['AI', 'Coding'] },
]

const CATEGORY_LABELS: Record<string, { sk: string; en: string; emoji: string }> = {
  ai: { sk: 'AI Nástroj', en: 'AI Tool', emoji: '🤖' },
  cli: { sk: 'CLI Nástroj', en: 'CLI Tool', emoji: '⌨️' },
  saas: { sk: 'SaaS', en: 'SaaS', emoji: '☁️' },
  devtool: { sk: 'Dev Nástroj', en: 'Dev Tool', emoji: '🛠️' },
  design: { sk: 'Dizajn', en: 'Design', emoji: '🎨' },
}

export async function GET() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  const todayTool = TOOLS[dayOfYear % TOOLS.length]
  const yesterdayTool = TOOLS[(dayOfYear - 1 + TOOLS.length) % TOOLS.length]
  const tomorrowTool = TOOLS[(dayOfYear + 1) % TOOLS.length]

  // Also return 5 recent tools for the list view
  const recentTools = Array.from({ length: 5 }, (_, i) => {
    const idx = (dayOfYear - i + TOOLS.length) % TOOLS.length
    return { ...TOOLS[idx], daysAgo: i }
  })

  return NextResponse.json({
    today: todayTool,
    yesterday: yesterdayTool,
    tomorrow: tomorrowTool,
    recent: recentTools,
    categoryLabels: CATEGORY_LABELS,
  })
}
