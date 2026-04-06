'use client'
import PageShell from '@/components/PageShell'
import SectionLabel from '@/components/SectionLabel'
import AINewsWidget from '@/components/widgets/AINewsWidget'
import GitHubTrendingWidget from '@/components/widgets/GitHubTrendingWidget'
import HackerNewsWidget from '@/components/widgets/HackerNewsWidget'
import TwitterWidget from '@/components/widgets/TwitterWidget'
import RedditGlobalWidget from '@/components/widgets/RedditGlobalWidget'
import CloudflareRadarWidget from '@/components/widgets/CloudflareRadarWidget'
import InternetServicesWidget from '@/components/widgets/InternetServicesWidget'
import SKCertWidget from '@/components/widgets/SKCertWidget'
import NBUAlertsWidget from '@/components/widgets/NBUAlertsWidget'
import KrimiWidget from '@/components/widgets/KrimiWidget'
import StolenVehiclesWidget from '@/components/widgets/StolenVehiclesWidget'

export default function TechPage() {
  return (
    <PageShell>
      {/* AI */}
      <SectionLabel icon="🤖" label="Umelá inteligencia" />
      <AINewsWidget />

      {/* Dev & Komunita — merged */}
      <SectionLabel icon="💻" label="Dev & Komunita" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GitHubTrendingWidget />
        <HackerNewsWidget />
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
      <SectionLabel icon="🔐" label="Kybernetická & Verejná bezpečnosť" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SKCertWidget />
        <NBUAlertsWidget />
        <KrimiWidget />
        <StolenVehiclesWidget />
      </div>
    </PageShell>
  )
}
