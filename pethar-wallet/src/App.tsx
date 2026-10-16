import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { Language } from './i18n'
import { getSubdomain, getRedirectMap, redirectToSubdomain } from './utils/subdomain'
import { signOutFirebase } from './lib/firebase'

// Import all subdomain pages
import { LoginPage } from './pages/subdomains/LoginPage'
import { SignupPage } from './pages/subdomains/SignupPage'
import { PayPage } from './pages/subdomains/PayPage'
import { CardPage } from './pages/subdomains/CardPage'
import { MerchantPage } from './pages/subdomains/MerchantPage'
import { IBankingPage } from './pages/subdomains/IBankingPage'
import { AccountsPage } from './pages/subdomains/AccountsPage'
import { SupportPage } from './pages/subdomains/SupportPage'
import { HelpPage } from './pages/subdomains/HelpPage'
import { DeveloperPage } from './pages/subdomains/DeveloperPage'
import { ApiPage } from './pages/subdomains/ApiPage'
import { DocsPage } from './pages/subdomains/DocsPage'
import { WalletPage } from './pages/subdomains/WalletPage'
import Main from './pages/Main'
import DashboardPage from './pages/DashboardPage'
import { OfflinePage } from './pages/subdomains/OfflinePage'
import { OnlinePage } from './pages/subdomains/OnlinePage'
import { AdminPage } from './pages/subdomains/AdminPage'
import { CloudPage } from './pages/subdomains/CloudPage'
import { BetaPage } from './pages/subdomains/BetaPage'
import { RootPage } from './pages/subdomains/RootPage'
import { P2MPage } from './pages/subdomains/P2MPage'
import { P2CPage } from './pages/subdomains/P2CPage'
import { C2CPage } from './pages/subdomains/C2CPage'
import { P2PPage } from './pages/subdomains/P2PPage'
import { M2MPage } from './pages/subdomains/M2MPage'
import { Web3Page } from './pages/subdomains/Web3Page'
import { TradePage } from './pages/subdomains/TradePage'
import { ExchangePage } from './pages/subdomains/ExchangePage'
import { GlobalPage } from './pages/subdomains/GlobalPage'
import { DataPage } from './pages/subdomains/DataPage'
import { SearchPage } from './pages/subdomains/SearchPage'
import { InfoPage } from './pages/subdomains/InfoPage'
import { CareersPage } from './pages/subdomains/CareersPage'
import { AdsPage } from './pages/subdomains/AdsPage'
import { ChatPage } from './pages/subdomains/ChatPage'
import { ConnectPage } from './pages/subdomains/ConnectPage'
import { DownloadPage } from './pages/subdomains/DownloadPage'
import { DemoPage } from './pages/subdomains/DemoPage'
import { PrivacyPage } from './pages/subdomains/PrivacyPage'

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // Dynamically force browser tab favicon refresh to the new 3D White & Crimson Péthar icon
  useEffect(() => {
    if (typeof document === 'undefined') return
    const cacheBust = '20261017-2'
    const existingIcons = document.head.querySelectorAll(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="alternate icon"], link[rel="apple-touch-icon"]'
    )
    existingIcons.forEach((el) => el.parentNode?.removeChild(el))

    const favicons: Array<{ rel: string; type?: string; sizes?: string; href: string }> = [
      { rel: 'icon', type: 'image/svg+xml', href: `/pethar-logo-red-white.svg?v=${cacheBust}` },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: `/favicon-32x32.png?v=${cacheBust}` },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: `/favicon-16x16.png?v=${cacheBust}` },
      { rel: 'shortcut icon', type: 'image/x-icon', href: `/favicon.ico?v=${cacheBust}` },
      { rel: 'apple-touch-icon', sizes: '180x180', href: `/apple-touch-icon.png?v=${cacheBust}` },
    ]

    favicons.forEach(({ rel, type, sizes, href }) => {
      const link = document.createElement('link')
      link.rel = rel
      if (type) link.type = type
      if (sizes) link.sizes = sizes
      link.href = href
      document.head.appendChild(link)
    })
  }, [])

  // Reactively determine current subdomain from URL or hostname
  const subdomain = useMemo(
    () => getSubdomain(),
    [location.pathname, location.search]
  )

  const [savedLang, setSavedLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pethar_lang') as Language | null
      if (stored === 'en' || stored === 'ak') return stored
    }
    return 'en'
  })

  // Check for subdomain redirects (only for actual hostname subdomains)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const redirectMap = getRedirectMap()
      const redirectTarget = redirectMap[subdomain]
      const hostParts = window.location.hostname.split('.')
      if (redirectTarget && redirectTarget !== subdomain && hostParts[0] === subdomain) {
        const currentHost = window.location.hostname
        const newHostname = currentHost.replace(/^[^.]+\./, `${redirectTarget}.`)
        window.location.href = `${window.location.protocol}//${newHostname}${location.pathname}${location.search}`
      }
    }
  }, [subdomain, location.pathname, location.search])

  // Determine language from URL pathname segments (/en/..., /ak/..., /download/en/..., /download/ak/...)
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
      searchParams.get('dashboard') === 'true' ||
      searchParams.get('subdomain') === 'app' ||
      searchParams.get('subdomain') === 'dashboard'
    return (
      location.pathname.includes('/banking') ||
      location.pathname.includes('/dashboard') ||
      location.pathname.endsWith('/app') ||
      location.pathname.startsWith('/app') ||
      paramBanking
    )
  }, [location.pathname, location.search])

  // Normalize unprefixed main landing routes to /en/... or /ak/... while allowing /privacy and /terms at domain/privacy and domain/terms
  useEffect(() => {
    const pathname = location.pathname
    if (pathname === '/banking') {
      navigate(`/${currentLang}/dashboard${location.search}${location.hash}`, { replace: true })
      return
    }
    if (!subdomain || subdomain === 'www') {
      if (pathname === '/' || pathname === '') {
        navigate(`/${currentLang}${location.search}${location.hash}`, { replace: true })
      } else if (
        pathname.startsWith('/features') ||
        pathname.startsWith('/about') ||
        pathname.startsWith('/faq')
      ) {
        navigate(`/${currentLang}${pathname}${location.search}${location.hash}`, { replace: true })
      }
    }
  }, [location.pathname, location.search, location.hash, subdomain, currentLang, navigate])

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
    signOutFirebase().catch(() => {})
    navigate(`/${currentLang}${location.search}${location.hash}`)
  }

  if (location.pathname === '/pethar' || location.pathname.startsWith('/pethar/')) {
    return <Main lang={currentLang} setLang={handleSetLang} />
  }

  if (!isBanking) {
    switch (subdomain) {
      case 'wallet':
        return <WalletPage lang={currentLang} />
      case 'dashboard':
      case 'app':
        return (
          <DashboardPage
            lang={currentLang}
            setLang={handleSetLang}
            theme="light"
            setTheme={() => {}}
            onExit={() => redirectToSubdomain('', { path: `/${currentLang}`, search: '' })}
          />
        )
      case 'auth':
      case 'login':
      case 'signup': {
        const authMode = new URLSearchParams(location.search).get('mode')
        const showSignup = subdomain === 'signup' || authMode === 'signup'
        return showSignup ? <SignupPage lang={currentLang} /> : <LoginPage lang={currentLang} />
      }
      case 'pay':
        return <PayPage lang={currentLang} />
      case 'card':
        return <CardPage lang={currentLang} />
      case 'merchant':
        return <MerchantPage lang={currentLang} />
      case 'ibanking':
        return <IBankingPage lang={currentLang} />
      case 'accounts':
        return <AccountsPage lang={currentLang} />
      case 'support':
        return <SupportPage lang={currentLang} />
      case 'help':
        return <HelpPage lang={currentLang} />
      case 'developer':
        return <DeveloperPage lang={currentLang} />
      case 'api':
        return <ApiPage lang={currentLang} />
      case 'trade':
        return <TradePage lang={currentLang} />
      case 'data':
        return <DataPage lang={currentLang} />
      case 'exchange':
        return <ExchangePage lang={currentLang} />
      case 'global':
        return <GlobalPage lang={currentLang} />
      case 'docs':
        return <DocsPage lang={currentLang} />
      case 'offline':
        return <OfflinePage lang={currentLang} />
      case 'online':
        return <OnlinePage lang={currentLang} />
      case 'platform':
        return (
          <DashboardPage
            lang={currentLang}
            setLang={handleSetLang}
            initialTab="treasury"
            onExit={() => redirectToSubdomain('', { search: '' })}
          />
        )
      case 'admin':
        return <AdminPage lang={currentLang} />
      case 'cloud':
        return <CloudPage lang={currentLang} />
      case 'beta':
        return <BetaPage lang={currentLang} />
      case 'root':
        return <RootPage lang={currentLang} />
      case 'p2m':
        return <P2MPage lang={currentLang} />
      case 'p2c':
        return <P2CPage lang={currentLang} />
      case 'c2c':
        return <C2CPage lang={currentLang} />
      case 'p2p':
        return <P2PPage lang={currentLang} />
      case 'm2m':
        return <M2MPage lang={currentLang} />
      case 'web3':
        return <Web3Page lang={currentLang} />
      case 'ads':
        return <AdsPage lang={currentLang} />
      case 'chat':
        return <ChatPage lang={currentLang} />
      case 'connect':
        return <ConnectPage lang={currentLang} />
      case 'careers':
        return <CareersPage lang={currentLang} />
      case 'demo':
        return <DemoPage lang={currentLang} />
      case 'download':
        return <DownloadPage lang={currentLang} />
      case 'info':
        return <InfoPage lang={currentLang} />
      case 'search':
        return <SearchPage lang={currentLang} />
      case 'security':
        return <PrivacyPage lang={currentLang} />
      case 'www':
      case '':
      default:
        // Main domain - public multi-page website (/en, /ak, /en/features, /ak/features, /en/about, /ak/about, /en/faq, /ak/faq, /privacy, /terms)
        return <Main lang={currentLang} setLang={handleSetLang} />
    }
  }

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
