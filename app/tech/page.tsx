'use client'
import PageShell from '@/components/PageShell'
import SectionLabel from '@/components/SectionLabel'
import AINewsWidget from '@/components/widgets/AINewsWidget'
import GitHubTrendingWidget from '@/components/widgets/GitHubTrendingWidget'
import HackerNewsWidget from '@/components/widgets/HackerNewsWidget'
import TwitterWidget from '@/components/widgets/TwitterWidget'
import RedditGlobalWidget from '@/components/widgets/RedditGlobalWidget'
import SteamWidget from '@/components/widgets/SteamWidget'
import CloudflareRadarWidget from '@/components/widgets/CloudflareRadarWidget'
import InternetServicesWidget from '@/components/widgets/InternetServicesWidget'
import SKCertWidget from '@/components/widgets/SKCertWidget'
import NBUAlertsWidget from '@/components/widgets/NBUAlertsWidget'
import WikiWidget from '@/components/widgets/WikiWidget'

export default function TechPage() {
  return (
    <PageShell>
      {/* AI */}
      <SectionLabel icon="🤖" label="Umelá inteligencia" />
      <AINewsWidget />

      {/* Dev komunita */}
      <SectionLabel icon="💻" label="Developer komunita" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GitHubTrendingWidget />
        <HackerNewsWidget />
      </div>

      {/* Sociálne siete */}
      <SectionLabel icon="📣" label="Sociálne siete & Reddit" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TwitterWidget />
        <RedditGlobalWidget />
      </div>

      {/* Internet & Infraštruktúra */}
      <SectionLabel icon="🌐" label="Internet & Infraštruktúra" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CloudflareRadarWidget />
        <InternetServicesWidget />
      </div>

      {/* Bezpečnosť */}
      <SectionLabel icon="🔐" label="Kybernetická bezpečnosť" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SKCertWidget />
        <NBUAlertsWidget />
      </div>

      {/* Gaming & Kultúra */}
      <SectionLabel icon="🎮" label="Gaming & Tech kultúra" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SteamWidget />
        <WikiWidget />
      </div>
    </PageShell>
  )
}
