'use client'

import { LangProvider } from '@/hooks/useLang'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <LangProvider>{children}</LangProvider>
}
