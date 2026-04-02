'use client'
import PageShell from '@/components/PageShell'
import SectionLabel from '@/components/SectionLabel'
import SunriseSunsetWidget from '@/components/widgets/SunriseSunsetWidget'
import HealthWidget from '@/components/widgets/HealthWidget'
import SurgeryWaitlistWidget from '@/components/widgets/SurgeryWaitlistWidget'
import HealthStatsWidget from '@/components/widgets/HealthStatsWidget'
import NCZIWidget from '@/components/widgets/NCZIWidget'
import EnvironmentWidget from '@/components/widgets/EnvironmentWidget'
import ForestsFloodsWidget from '@/components/widgets/ForestsFloodsWidget'
import KindergartensWidget from '@/components/widgets/KindergartensWidget'
import SportSuggestionsWidget from '@/components/widgets/SportSuggestionsWidget'
import TourismWidget from '@/components/widgets/TourismWidget'

export default function ZdraviePage() {
  return (
    <PageShell>
      <SunriseSunsetWidget />

      {/* Aktualny stav */}
      <SectionLabel icon="🏥" label="Zdravotný stav" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HealthWidget />
        <NCZIWidget />
      </div>

      {/* Čakacie doby & štatistiky */}
      <SectionLabel icon="📊" label="Čakacie doby & štatistiky" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SurgeryWaitlistWidget />
        <HealthStatsWidget />
      </div>

      {/* Životné prostredie */}
      <SectionLabel icon="🌿" label="Životné prostredie" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EnvironmentWidget />
        <ForestsFloodsWidget />
      </div>

      {/* Pohyb & Deti */}
      <SectionLabel icon="🏃" label="Pohyb & Rodina" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SportSuggestionsWidget />
        <KindergartensWidget />
      </div>

      {/* Cestovanie */}
      <SectionLabel icon="🏔️" label="Turistika & Rekreácia" />
      <TourismWidget />
    </PageShell>
  )
}
