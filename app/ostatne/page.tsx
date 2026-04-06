'use client'
import PageShell from '@/components/PageShell'
import SectionLabel from '@/components/SectionLabel'
import KindergartensWidget from '@/components/widgets/KindergartensWidget'
import SchoolsWidget from '@/components/widgets/SchoolsWidget'
import OfficeWaitWidget from '@/components/widgets/OfficeWaitWidget'
import PetitionsWidget from '@/components/widgets/PetitionsWidget'
import WaterQualityWidget from '@/components/widgets/WaterQualityWidget'
import LotteryWidget from '@/components/widgets/LotteryWidget'

export default function OstatнePage() {
  return (
    <PageShell>
      {/* Školy & vzdelávanie */}
      <SectionLabel icon="🏫" label="Školy & Vzdelávanie" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KindergartensWidget />
        <SchoolsWidget />
      </div>

      {/* Úrady & Služby */}
      <SectionLabel icon="🏛️" label="Úrady & Verejné služby" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OfficeWaitWidget />
        <PetitionsWidget />
      </div>

      {/* Rôzne */}
      <SectionLabel icon="🎲" label="Rôzne" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WaterQualityWidget />
        <LotteryWidget />
      </div>
    </PageShell>
  )
}
