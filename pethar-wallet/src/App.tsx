import { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { Language } from './i18n'
import LandingPage from './pages/LandingPage'
import WebBankingDashboard from './pages/WebBankingDashboard'

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // 1. Determine language from URL pathname: /en, /ak
  const currentLang: Language = useMemo(() => {
    if (location.pathname.startsWith('/en')) return 'en'
    if (location.pathname.startsWith('/ak')) return 'ak'
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('pethar_lang') as Language | null) : null
    return saved === 'en' ? 'en' : 'ak'
  }, [location.pathname])

  // 2. Determine view ('landing' or 'banking') from URL pathname or search params
  const isBanking = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const paramBanking =
      searchParams.get('app') === 'true' ||
      searchParams.get('banking') === 'true' ||
      searchParams.get('portal') === 'true'
    return location.pathname.includes('/banking') || paramBanking
  }, [location.pathname, location.search])

  const [theme, setTheme] = useState<'dark' | 'light'>('light')

  // 3. Handle root redirect or normalization: / -> /ak or /en
  useEffect(() => {
    const pathname = location.pathname
    if (pathname === '/' || pathname === '') {
      const saved = localStorage.getItem('pethar_lang') as Language | null
      const targetLang = saved === 'en' ? 'en' : 'ak'
      navigate(`/${targetLang}${location.search}${location.hash}`, { replace: true })
    } else if (pathname === '/banking') {
      const saved = localStorage.getItem('pethar_lang') as Language | null
      const targetLang = saved === 'en' ? 'en' : 'ak'
      navigate(`/${targetLang}/banking${location.search}${location.hash}`, { replace: true })
    }
  }, [location.pathname, location.search, location.hash, navigate])

  // Sync currentLang to localStorage
  useEffect(() => {
    if (location.pathname.startsWith('/en') || location.pathname.startsWith('/ak')) {
      localStorage.setItem('pethar_lang', currentLang)
    }
  }, [currentLang, location.pathname])

  // 4. Change language handler: updates URL path to /en or /ak
  const handleSetLang = (newLang: Language) => {
    localStorage.setItem('pethar_lang', newLang)
    const viewSuffix = isBanking ? '/banking' : ''
    navigate(`/${newLang}${viewSuffix}${location.search}${location.hash}`)
  }

  // 5. Open / Exit banking handlers
  const handleOpenBanking = () => {
    navigate(`/${currentLang}/banking${location.search}${location.hash}`)
  }

  const handleExitBanking = () => {
    navigate(`/${currentLang}${location.search}${location.hash}`)
  }

  if (!isBanking) {
    return (
      <LandingPage
        onOpenBanking={handleOpenBanking}
        onEnterApp={handleOpenBanking}
        lang={currentLang}
        setLang={handleSetLang}
      />
    )
  }

  return (
    <WebBankingDashboard
      lang={currentLang}
      setLang={handleSetLang}
      theme={theme}
      setTheme={setTheme}
      onExit={handleExitBanking}
    />
  )
}

