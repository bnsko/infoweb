'use client'
import PageShell from '@/components/PageShell'
import SectionLabel from '@/components/SectionLabel'
import CurrencyWidget from '@/components/widgets/CurrencyWidget'
import CryptoWidget from '@/components/widgets/CryptoWidget'
import FearGreedWidget from '@/components/widgets/FearGreedWidget'
import InflationWidget from '@/components/widgets/InflationWidget'
import FinanceNewsWidget from '@/components/widgets/FinanceNewsWidget'
import InvestmentWidget from '@/components/widgets/InvestmentWidget'
import VUBRatesWidget from '@/components/widgets/VUBRatesWidget'
import JobMarketWidget from '@/components/widgets/JobMarketWidget'
import FinstatWidget from '@/components/widgets/FinstatWidget'
import SKDebtWidget from '@/components/widgets/SKDebtWidget'
import BankruptcyRegisterWidget from '@/components/widgets/BankruptcyRegisterWidget'
import PublicProcurementWidget from '@/components/widgets/PublicProcurementWidget'
import RentalPricesWidget from '@/components/widgets/RentalPricesWidget'
import ConstructionPricesWidget from '@/components/widgets/ConstructionPricesWidget'
import APVVGrantsWidget from '@/components/widgets/APVVGrantsWidget'
import EUGrantsWidget from '@/components/widgets/EUGrantsWidget'

export default function FinanciePage() {
  return (
    <PageShell>
      {/* Trhy */}
      <SectionLabel icon="📈" label="Trhy & Meny" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CurrencyWidget />
        <CryptoWidget />
        <FearGreedWidget />
        <InflationWidget />
      </div>

      {/* Správy */}
      <SectionLabel icon="📰" label="Finančné správy" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FinanceNewsWidget />
        <InvestmentWidget />
      </div>

      {/* Banky & Sadzby */}
      <SectionLabel icon="🏦" label="Banky & Úrokové sadzby" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VUBRatesWidget />
        <SKDebtWidget />
      </div>

      {/* Trh práce */}
      <SectionLabel icon="💼" label="Trh práce & Firmy" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <JobMarketWidget />
        <FinstatWidget />
      </div>

      {/* Nehnuteľnosti */}
      <SectionLabel icon="🏠" label="Nehnuteľnosti & Stavebníctvo" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RentalPricesWidget />
        <ConstructionPricesWidget />
      </div>

      {/* Insolvencia & Obstarávanie */}
      <SectionLabel icon="⚖️" label="Insolvencia & Verejné obstarávanie" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BankruptcyRegisterWidget />
        <PublicProcurementWidget />
      </div>

      {/* Granty */}
      <SectionLabel icon="🎓" label="Granty & Dotácie" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <APVVGrantsWidget />
        <EUGrantsWidget />
      </div>
    </PageShell>
  )
}
