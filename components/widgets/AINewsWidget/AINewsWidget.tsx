'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'

interface NewsItem { title: string; link: string; description: string; pubDate: string; source: string }
interface AITool { name: string; desc: string; url: string; cat: string; emoji: string; users: string }
interface LLMStat { name: string; provider: string; params: string; context: string; score: string; emoji: string }
interface AIData { items: NewsItem[]; tools: AITool[]; llmStats: LLMStat[] }

type Tab = 'news' | 'tools' | 'llm'

const CAT_COLORS: Record<string, string> = {
  Chat: 'bg-blue-500/15 text-blue-300', Code: 'bg-green-500/15 text-green-300',
  Image: 'bg-purple-500/15 text-purple-300', Search: 'bg-amber-500/15 text-amber-300',
  Music: 'bg-pink-500/15 text-pink-300', Video: 'bg-red-500/15 text-red-300',
  Platform: 'bg-indigo-500/15 text-indigo-300', Local: 'bg-emerald-500/15 text-emerald-300',
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export default function AINewsWidget() {
  const [tab, setTab] = useState<Tab>('news')
  const { data, loading, refetch } = useWidget<AIData>('/api/ainews', 5 * 60 * 1000)

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'news', icon: '📰', label: 'Správy' },
    { key: 'tools', icon: '🛠️', label: 'AI Nástroje' },
    { key: 'llm', icon: '🧠', label: 'LLM Rebríček' },
  ]

  return (
    <WidgetCard accent="purple" title="🤖 AI & Tech" icon="" onRefresh={refetch}>
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === tb.key ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{tb.icon}</span>
            <span className="hidden sm:inline">{tb.label}</span>
          </button>
        ))}
      </div>

      {loading && <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>}

      {/* AI News */}
      {!loading && tab === 'news' && (
        <div className="space-y-1 max-h-[380px] overflow-y-auto scrollbar-hide">
          {(data?.items ?? []).length === 0 && <p className="text-xs text-slate-500 text-center py-4">Žiadne novinky</p>}
          {(data?.items ?? []).slice(0, 12).map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
               className="block rounded-xl p-2.5 bg-white/[0.02] border border-white/5 hover:border-purple-500/15 hover:bg-white/[0.04] transition-all group">
              <p className="text-[11px] font-medium text-slate-200 group-hover:text-white leading-snug line-clamp-2">{item.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-purple-400 font-semibold">{item.source}</span>
                {item.pubDate && <span className="text-[9px] text-slate-600">{timeAgo(item.pubDate)}</span>}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* AI Tools */}
      {!loading && tab === 'tools' && (
        <div className="space-y-1.5 max-h-[380px] overflow-y-auto scrollbar-hide">
          {(data?.tools ?? []).map((tool, i) => (
            <a key={i} href={tool.url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2.5 rounded-xl p-2.5 bg-white/[0.02] border border-white/5 hover:border-purple-500/15 hover:bg-white/[0.04] transition-all group">
              <span className="text-lg shrink-0">{tool.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-white group-hover:text-purple-200 transition-colors">{tool.name}</span>
                  <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${CAT_COLORS[tool.cat] ?? 'bg-slate-500/15 text-slate-300'}`}>{tool.cat}</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">{tool.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-bold text-emerald-400">{tool.users}</div>
                <div className="text-[8px] text-slate-600">users</div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* LLM Leaderboard */}
      {!loading && tab === 'llm' && (
        <div className="space-y-1.5 max-h-[380px] overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between text-[9px] text-slate-600 px-2 pb-1 border-b border-white/5">
            <span className="w-6">#</span>
            <span className="flex-1">Model</span>
            <span className="w-14 text-center">Params</span>
            <span className="w-12 text-center">Context</span>
            <span className="w-12 text-right">Score</span>
          </div>
          {(data?.llmStats ?? []).map((llm, i) => (
            <div key={i} className={`flex items-center gap-1 rounded-lg px-2 py-2 border transition-all ${
              i === 0 ? 'bg-yellow-500/8 border-yellow-500/15' : 'bg-white/[0.02] border-white/5'
            }`}>
              <span className={`w-6 text-[10px] font-bold ${i < 3 ? 'text-yellow-400' : 'text-slate-600'}`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs">{llm.emoji}</span>
                  <span className="text-[11px] font-semibold text-slate-200 truncate">{llm.name}</span>
                </div>
                <span className="text-[9px] text-slate-500">{llm.provider}</span>
              </div>
              <span className="w-14 text-center text-[9px] text-slate-400 font-mono">{llm.params}</span>
              <span className="w-12 text-center text-[9px] text-slate-400 font-mono">{llm.context}</span>
              <span className="w-12 text-right text-[11px] font-bold text-purple-300 font-mono">{llm.score}</span>
            </div>
          ))}
          <p className="text-[9px] text-slate-600 text-center mt-2">
            <a href="https://lmarena.ai/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">
              Zdroj: LMSYS Chatbot Arena ↗
            </a>
          </p>
        </div>
      )}

      <p className="text-[10px] text-slate-600 mt-2">The Verge · MIT Tech Review · TechCrunch</p>
    </WidgetCard>
  )
}
