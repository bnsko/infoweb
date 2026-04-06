'use client'
import PageShell from '@/components/PageShell'
import SectionLabel from '@/components/SectionLabel'
import SunriseSunsetWidget from '@/components/widgets/SunriseSunsetWidget'
import FuelPricesWidget from '@/components/widgets/FuelPricesWidget'
import BAParkingWidget from '@/components/widgets/BAParkingWidget'
import RideShareWidget from '@/components/widgets/RideShareWidget'
import NDSCameraWidget from '@/components/widgets/NDSCameraWidget'
import EVChargingWidget from '@/components/widgets/EVChargingWidget'
import TrainRoutesWidget from '@/components/widgets/TrainRoutesWidget'
import TransportIntensityWidget from '@/components/widgets/TransportIntensityWidget'
import MarineTrafficWidget from '@/components/widgets/MarineTrafficWidget'
import SummaryWidget from '@/components/widgets/SummaryWidget'

export default function DopravaPage() {
  return (
    <PageShell>
      {/* Počasie */}
      <SunriseSunsetWidget />
      <SummaryWidget />

      {/* Cesty */}
      <SectionLabel icon="⛽" label="Palivo & Elektrina" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FuelPricesWidget />
        <EVChargingWidget />
      </div>

      {/* Parkovanie */}
      <SectionLabel icon="🅿️" label="Parkoviská Bratislava" />
      <BAParkingWidget />

      {/* Zdieľanie auta */}
      <SectionLabel icon="🚗" label="Zdieľaná mobilita" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RideShareWidget />
        <NDSCameraWidget />
      </div>

      {/* Intenzita + Vlaky */}
      <SectionLabel icon="🚂" label="Železnica & Intenzita" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TrainRoutesWidget />
        <TransportIntensityWidget />
      </div>

      {/* Loďná doprava */}
      <SectionLabel icon="⚓" label="Loďná doprava" />
      <MarineTrafficWidget />
    </PageShell>
  )
}

