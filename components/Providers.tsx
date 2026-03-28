'use client'

import { LangProvider } from '@/hooks/useLang'
import { PrefsProvider } from '@/hooks/usePrefs'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <PrefsProvider>{children}</PrefsProvider>
    </LangProvider>
  )
}
