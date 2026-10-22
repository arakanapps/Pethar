import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { Language } from './i18n'
import Main from './pages/Main'

// Lazy-load secondary pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'))

function PageFallback() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const [savedLang, setSavedLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pethar_lang') as Language | null
      if (stored === 'en' || stored === 'ak') return stored
    }
    return 'en'
  })

  // Determine language from URL pathname segments (/en/..., /ak/...)
  const currentLang: Language = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    if (segments.includes('en')) return 'en'
    if (segments.includes('ak')) return 'ak'
    return savedLang
  }, [location.pathname, savedLang])

  // Determine view ('landing' or 'banking') from URL pathname or search params
  const isBanking = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const paramBanking =
      searchParams.get('app') === 'true' ||
      searchParams.get('banking') === 'true' ||
      searchParams.get('portal') === 'true' ||
      searchParams.get('dashboard') === 'true'
    return (
      location.pathname.includes('/banking') ||
      location.pathname.includes('/dashboard') ||
      location.pathname.endsWith('/app') ||
      location.pathname.startsWith('/app') ||
      paramBanking
    )
  }, [location.pathname, location.search])

  // Normalize unprefixed main landing routes to /en/... or /ak/... while allowing /privacy and /terms
  useEffect(() => {
    const pathname = location.pathname
    if (pathname === '/banking') {
      navigate(`/${currentLang}/dashboard${location.search}${location.hash}`, { replace: true })
      return
    }
    if (pathname === '/' || pathname === '') {
      window.history.replaceState(null, '', `/${currentLang}${location.search}${location.hash}`)
    } else if (
      pathname.startsWith('/features') ||
      pathname.startsWith('/about') ||
      pathname.startsWith('/faq')
    ) {
      navigate(`/${currentLang}${pathname}${location.search}${location.hash}`, { replace: true })
    }
  }, [location.pathname, location.search, location.hash, currentLang, navigate])

  // Sync currentLang to localStorage
  useEffect(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    if (segments.includes('en') || segments.includes('ak')) {
      localStorage.setItem('pethar_lang', currentLang)
      setSavedLang(currentLang)
    }
  }, [currentLang, location.pathname])

  // Change language handler: updates /en <-> /ak in the current URL path (or in place on /privacy and /terms)
  const handleSetLang = (newLang: Language) => {
    localStorage.setItem('pethar_lang', newLang)
    setSavedLang(newLang)
    if (isBanking) {
      navigate(`/${newLang}/dashboard${location.search}${location.hash}`)
      return
    }
    const pathname = location.pathname
    if (pathname === '/privacy' || pathname === '/terms') {
      return
    }
    if (pathname === '/en' || pathname === '/ak' || pathname === '/') {
      navigate(`/${newLang}${location.search}${location.hash}`)
    } else if (/^\/(en|ak)(\/|$)/.test(pathname)) {
      const updated = pathname.replace(/^\/(en|ak)(?=\/|$)/, `/${newLang}`)
      navigate(`${updated}${location.search}${location.hash}`)
    } else if (/\/(en|ak)(\/|$)/.test(pathname)) {
      const updated = pathname.replace(/\/(en|ak)(?=\/|$)/, `/${newLang}`)
      navigate(`${updated}${location.search}${location.hash}`)
    } else {
      navigate(`/${newLang}${pathname}${location.search}${location.hash}`)
    }
  }

  const handleExitBanking = () => {
    localStorage.removeItem('pethar_logged_in')
    import('./lib/firebase').then((m) => m.signOutFirebase()).catch(() => {})
    navigate(`/${currentLang}${location.search}${location.hash}`)
  }

  if (location.pathname === '/pethar' || location.pathname.startsWith('/pethar/')) {
    return <Main lang={currentLang} setLang={handleSetLang} />
  }

  const renderPage = () => {
    // Support Flutter Mobile Web route
    const pathLower = location.pathname.toLowerCase()
    if (pathLower === '/m' || pathLower.startsWith('/m/') || pathLower.startsWith('/flutter')) {
      return (
        <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#0B0F19]">
          <iframe
            src={`/flutter/index.html${location.search}`}
            title="Péthar Flutter Mobile Web"
            className="w-full h-full border-0 block"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      )
    }

    if (isBanking) {
      return (
        <DashboardPage
          lang={currentLang}
          setLang={handleSetLang}
          theme="light"
          setTheme={() => {}}
          onExit={handleExitBanking}
        />
      )
    }

    return <Main lang={currentLang} setLang={handleSetLang} />
  }

  return <Suspense fallback={<PageFallback />}>{renderPage()}</Suspense>
}
