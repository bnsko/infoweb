'use client'
import PageShell from '@/components/PageShell'
import SectionLabel from '@/components/SectionLabel'
import SteamWidget from '@/components/widgets/SteamWidget'
import RedditWidget from '@/components/widgets/RedditWidget'
import TwitterWidget from '@/components/widgets/TwitterWidget'
import DealsWidget from '@/components/widgets/DealsWidget'
import StreamingWidget from '@/components/widgets/StreamingWidget'
import ViralVideosWidget from '@/components/widgets/ViralVideosWidget'
import PodcastWidget from '@/components/widgets/PodcastWidget'

export default function GamingPage() {
  return (
    <PageShell>
      {/* Steam & hry */}
      <SectionLabel icon="🎮" label="Steam & PC hry" />
      <SteamWidget />

      {/* Gaming komunita */}
      <SectionLabel icon="💬" label="Gaming komunita & Reddit" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RedditWidget />
        <TwitterWidget />
      </div>

      {/* Akcie & Zľavy */}
      <SectionLabel icon="🏷️" label="Akcie & Zľavy na hry" />
      <DealsWidget />

      {/* Streaming & Video */}
      <SectionLabel icon="📺" label="Streaming & Video" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StreamingWidget />
        <ViralVideosWidget />
      </div>

      {/* Podcasty */}
      <SectionLabel icon="🎙️" label="Podcasty & Zábava" />
      <PodcastWidget />
    </PageShell>
  )
}
