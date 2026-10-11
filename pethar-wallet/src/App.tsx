import { useState } from 'react'
import type { Language } from './i18n'
import LandingPage from './pages/LandingPage'
import WebBankingDashboard from './pages/WebBankingDashboard'

type AppView = 'landing' | 'banking'

export default function App() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const paramApp = searchParams?.get('app') === 'true' || searchParams?.get('banking') === 'true' || searchParams?.get('portal') === 'true'

  const [currentView, setCurrentView] = useState<AppView>(paramApp ? 'banking' : 'landing')
  const [lang, setLang] = useState<Language>('en')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  if (currentView === 'landing') {
    return (
      <LandingPage
        onOpenBanking={() => setCurrentView('banking')}
        onEnterApp={() => setCurrentView('banking')}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
      />
    )
  }

  return (
    <WebBankingDashboard
      lang={lang}
      setLang={setLang}
      theme={theme}
      setTheme={setTheme}
      onExit={() => setCurrentView('landing')}
    />
  )
}
