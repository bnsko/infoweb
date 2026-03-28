import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export const revalidate = 300

const FEEDS = [
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
]

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractItems(parsed: any, sourceName: string) {
  const raw = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? []
  const arr: unknown[] = Array.isArray(raw) ? raw : [raw]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arr.slice(0, 8).map((item: any) => ({
    title: (item.title?.['#text'] ?? item.title ?? '').trim(),
    link: item.link?.['@_href'] ?? item.link ?? item.guid ?? '',
    description: (item.description ?? item.summary ?? item['content:encoded'] ?? '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 200),
    pubDate: item.pubDate ?? item.updated ?? item.published ?? '',
    source: sourceName,
  }))
}

// Top AI tools
const AI_TOOLS = [
  { name: 'ChatGPT', desc: 'OpenAI conversational AI', url: 'https://chat.openai.com', cat: 'Chat', emoji: '💬', users: '300M+' },
  { name: 'Claude', desc: 'Anthropic AI assistant', url: 'https://claude.ai', cat: 'Chat', emoji: '🧠', users: '50M+' },
  { name: 'Gemini', desc: 'Google AI model', url: 'https://gemini.google.com', cat: 'Chat', emoji: '✨', users: '100M+' },
  { name: 'Midjourney', desc: 'AI image generation', url: 'https://midjourney.com', cat: 'Image', emoji: '🎨', users: '20M+' },
  { name: 'GitHub Copilot', desc: 'AI code assistant', url: 'https://github.com/features/copilot', cat: 'Code', emoji: '👨‍💻', users: '15M+' },
  { name: 'Cursor', desc: 'AI-first code editor', url: 'https://cursor.com', cat: 'Code', emoji: '⌨️', users: '5M+' },
  { name: 'Perplexity', desc: 'AI search engine', url: 'https://perplexity.ai', cat: 'Search', emoji: '🔍', users: '15M+' },
  { name: 'DALL-E 3', desc: 'OpenAI image generation', url: 'https://openai.com/dall-e-3', cat: 'Image', emoji: '🖼️', users: '50M+' },
  { name: 'Suno', desc: 'AI music generation', url: 'https://suno.com', cat: 'Music', emoji: '🎵', users: '10M+' },
  { name: 'Runway', desc: 'AI video generation', url: 'https://runwayml.com', cat: 'Video', emoji: '🎬', users: '5M+' },
  { name: 'Hugging Face', desc: 'Open AI model hub', url: 'https://huggingface.co', cat: 'Platform', emoji: '🤗', users: '5M+' },
  { name: 'Ollama', desc: 'Run LLMs locally', url: 'https://ollama.com', cat: 'Local', emoji: '🦙', users: '3M+' },
]

// LLM leaderboard (from LMSYS Chatbot Arena style)
const LLM_STATS = [
  { name: 'GPT-4o', provider: 'OpenAI', params: '~1.8T', context: '128k', score: '1287', emoji: '🟢' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', params: '~175B', context: '200k', score: '1271', emoji: '🟣' },
  { name: 'Gemini 1.5 Pro', provider: 'Google', params: '~540B', context: '2M', score: '1260', emoji: '🔵' },
  { name: 'Claude 3 Opus', provider: 'Anthropic', params: '~175B', context: '200k', score: '1257', emoji: '🟣' },
  { name: 'Llama 3.1 405B', provider: 'Meta', params: '405B', context: '128k', score: '1240', emoji: '🦙' },
  { name: 'Mistral Large', provider: 'Mistral', params: '~123B', context: '128k', score: '1220', emoji: '🟠' },
  { name: 'DeepSeek V3', provider: 'DeepSeek', params: '671B', context: '128k', score: '1215', emoji: '🔷' },
  { name: 'Qwen 2.5 72B', provider: 'Alibaba', params: '72B', context: '128k', score: '1200', emoji: '🔶' },
]

export async function GET() {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        next: { revalidate: 300 },
        headers: { 'User-Agent': 'Mozilla/5.0 InfoSK-Dashboard/1.0' },
        signal: AbortSignal.timeout(7000),
      })
      const text = await res.text()
      const parsed = parser.parse(text)
      return extractItems(parsed, feed.name)
    })
  )

  const items = results
    .filter((r): r is PromiseFulfilledResult<ReturnType<typeof extractItems>> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((i) => i.title)

  return NextResponse.json({ items, tools: AI_TOOLS, llmStats: LLM_STATS })
}
