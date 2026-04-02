'use client'
import Header from '@/components/Header'
import DashboardNav from '@/components/DashboardNav'
import SettingsPanel from '@/components/SettingsPanel'
import { SpeedtestMini } from '@/components/widgets/SpeedtestWidget'
import { useLang } from '@/hooks/useLang'

export default function PageShell({ children }: { children: React.ReactNode }) {
  const { t } = useLang()
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-root)', backgroundImage: 'var(--theme-bg-image, none)' }}>
      <Header />
      <DashboardNav />
      <main className="max-w-[1680px] mx-auto px-4 pt-4 pb-10 space-y-6">
        {children}
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
        <div className="flex items-center justify-center gap-4 mb-2">
          <SpeedtestMini />
        </div>
        <p>
          Slovakia Info © {new Date().getFullYear()} · Dáta: OpenMeteo · ECB · CoinGecko · Steam · ESPN · SME · Aktuality · TASR · BBC · Reuters · Reddit · OpenSky + ďalšie
        </p>
        <p className="mt-1">{t('footer.auto')}</p>
      </footer>
      <SettingsPanel />
    </div>
  )
}
