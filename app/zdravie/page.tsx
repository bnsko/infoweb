'use client'
import PageShell from '@/components/PageShell'
import SectionLabel from '@/components/SectionLabel'
import SunriseSunsetWidget from '@/components/widgets/SunriseSunsetWidget'
import HealthWidget from '@/components/widgets/HealthWidget'
import SurgeryWaitlistWidget from '@/components/widgets/SurgeryWaitlistWidget'
import HealthStatsWidget from '@/components/widgets/HealthStatsWidget'
import NCZIWidget from '@/components/widgets/NCZIWidget'

export default function ZdraviePage() {
  return (
    <PageShell>
      <SunriseSunsetWidget />

      {/* Aktuálny stav */}
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
    </PageShell>
  )
}

