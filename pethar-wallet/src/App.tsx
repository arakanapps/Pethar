import { useEffect, useMemo } from 'react'
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
// New subdomain pages
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
// Additional subdomain pages
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

  // Get current subdomain
  const subdomain = useMemo(() => getSubdomain(), [])

  // Enforce Light Mode across all pages
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }, [])

  // Check for redirects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const redirectMap = getRedirectMap()
      const redirectTarget = redirectMap[subdomain]

      if (redirectTarget && redirectTarget !== subdomain) {
        // Perform redirect
        const currentHost = window.location.hostname
        const newHostname = currentHost.replace(/^[^.]+\./, `${redirectTarget}.`)
        window.location.href = `${window.location.protocol}//${newHostname}${window.location.pathname}${window.location.search}`
      }
    }
  }, [subdomain, navigate])

  // Determine language from URL pathname: /en, /ak
  const currentLang: Language = useMemo(() => {
    if (location.pathname.startsWith('/en')) return 'en'
    if (location.pathname.startsWith('/ak')) return 'ak'
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('pethar_lang') as Language | null) : null
    return saved === 'en' ? 'en' : 'ak'
  }, [location.pathname])

  // Determine view ('landing' or 'banking') from URL pathname or search params
  // Keep backward compatibility with existing ?app=true etc. parameters
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

  // Handle root redirect or normalization: / -> /ak or /en
  useEffect(() => {
    const pathname = location.pathname
    if (pathname === '/' || pathname === '') {
      const saved = localStorage.getItem('pethar_lang') as Language | null
      const targetLang = saved === 'en' ? 'en' : 'ak'
      navigate(`/${targetLang}${location.search}${location.hash}`, { replace: true })
    } else if (pathname === '/banking') {
      const saved = localStorage.getItem('pethar_lang') as Language | null
      const targetLang = saved === 'en' ? 'en' : 'ak'
      navigate(`/${targetLang}/dashboard${location.search}${location.hash}`, { replace: true })
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
    const viewSuffix = isBanking ? '/dashboard' : ''
    navigate(`/${newLang}${viewSuffix}${location.search}${location.hash}`)
  }

  const handleExitBanking = () => {
    localStorage.removeItem('pethar_logged_in')
    signOutFirebase().catch(() => {})
    navigate(`/${currentLang}${location.search}${location.hash}`)
  }

  // Subdomain-based routing for public pages
  // pethar landing page at /pethar
  if (location.pathname === '/pethar' || location.pathname.startsWith('/pethar/')) {
    return <Main lang={currentLang} setLang={handleSetLang} />
  }

  if (!isBanking) {
    // Route based on subdomain
    switch (subdomain) {
      case 'wallet':
        return (
          <WalletPage
            lang={currentLang}
          />
        )
      case 'dashboard':
      case 'app':
        return (
          <DashboardPage
            lang={currentLang}
            setLang={handleSetLang}
            theme="light"
            setTheme={() => {}}
            onExit={() => redirectToSubdomain('', { path: '/', search: '' })}
          />
        )
      case 'auth':
      case 'login':
      case 'signup': {
        const authMode = new URLSearchParams(location.search).get('mode')
        const showSignup =
          subdomain === 'signup' || authMode === 'signup'
        return showSignup ? (
          <SignupPage lang={currentLang} />
        ) : (
          <LoginPage lang={currentLang} />
        )
      }
      case 'pay':
        return (
          <PayPage
            lang={currentLang}
          />
        )
      case 'card':
        return (
          <CardPage
            lang={currentLang}
          />
        )
      case 'merchant':
        return (
          <MerchantPage
            lang={currentLang}
          />
        )
      case 'ibanking':
        return (
          <IBankingPage
            lang={currentLang}
          />
        )
      case 'accounts':
        return (
          <AccountsPage
            lang={currentLang}
          />
        )
      case 'support':
        return (
          <SupportPage
            lang={currentLang}
          />
        )
      case 'help':
      case 'faq':
        return (
          <HelpPage
            lang={currentLang}
          />
        )
      case 'developer':
        return (
          <DeveloperPage
            lang={currentLang}
          />
        )
      case 'api':
        return (
          <ApiPage
            lang={currentLang}
          />
        )
      case 'trade':
        return (
          <TradePage
            lang={currentLang}
          />
        )
      case 'data':
        return (
          <DataPage
            lang={currentLang}
          />
        )
      case 'exchange':
        return (
          <ExchangePage
            lang={currentLang}
          />
        )
      case 'global':
        return (
          <GlobalPage
            lang={currentLang}
          />
        )
      case 'docs':
        return (
          <DocsPage
            lang={currentLang}
          />
        )
      case 'offline':
        return (
          <OfflinePage
            lang={currentLang}
          />
        )
      case 'online':
        return (
          <OnlinePage
            lang={currentLang}
          />
        )
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
        return (
          <AdminPage
            lang={currentLang}
          />
        )
      case 'cloud':
        return (
          <CloudPage
            lang={currentLang}
          />
        )
      case 'beta':
        return (
          <BetaPage
            lang={currentLang}
          />
        )
      case 'root':
        return (
          <RootPage
            lang={currentLang}
          />
        )
      case 'p2m':
        return (
          <P2MPage
            lang={currentLang}
          />
        )
      case 'p2c':
        return (
          <P2CPage
            lang={currentLang}
          />
        )
      case 'c2c':
        return (
          <C2CPage
            lang={currentLang}
          />
        )
      case 'p2p':
        return (
          <P2PPage
            lang={currentLang}
          />
        )
      case 'm2m':
        return (
          <M2MPage
            lang={currentLang}
          />
        )
      case 'web3':
        return (
          <Web3Page
            lang={currentLang}
          />
        )
      // Additional subdomain pages
      case 'ads':
        return (
          <AdsPage
            lang={currentLang}
          />
        )
      case 'chat':
        return (
          <ChatPage
            lang={currentLang}
          />
        )
      case 'connect':
        return (
          <ConnectPage
            lang={currentLang}
          />
        )
      case 'careers':
        return (
          <CareersPage
            lang={currentLang}
          />
        )
      case 'demo':
        return (
          <DemoPage
            lang={currentLang}
          />
        )
      case 'download':
        return (
          <DownloadPage
            lang={currentLang}
          />
        )
      case 'info':
        return (
          <InfoPage
            lang={currentLang}
          />
        )
      case 'search':
        return (
          <SearchPage
            lang={currentLang}
          />
        )
      case 'privacy':
      case 'security':
      case 'legal':
      case 'terms':
        return (
          <PrivacyPage
            lang={currentLang}
          />
        )
      case 'www':
      case '':
      default:
        // Main domain pethar.co.uk & www - public landing page
        return (
          <Main
            lang={currentLang}
            setLang={handleSetLang}
          />
        )
    }
  }

  // Banking/authenticated route - show the unified dashboard
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