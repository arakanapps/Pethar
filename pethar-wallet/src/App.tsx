import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { Language } from './i18n'
import { getSubdomain, getRedirectMap, redirectToSubdomain } from './utils/subdomain'
import Main from './pages/Main'

// Lazy-load secondary & subdomain pages so the main landing page loads fast on mobile browsers
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const LoginPage = lazy(() => import('./pages/subdomains/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('./pages/subdomains/SignupPage').then((m) => ({ default: m.SignupPage })))
const PayPage = lazy(() => import('./pages/subdomains/PayPage').then((m) => ({ default: m.PayPage })))
const CardPage = lazy(() => import('./pages/subdomains/CardPage').then((m) => ({ default: m.CardPage })))
const IBankingPage = lazy(() => import('./pages/subdomains/IBankingPage').then((m) => ({ default: m.IBankingPage })))
const AccountsPage = lazy(() => import('./pages/subdomains/AccountsPage').then((m) => ({ default: m.AccountsPage })))
const SupportPage = lazy(() => import('./pages/subdomains/SupportPage').then((m) => ({ default: m.SupportPage })))
const HelpPage = lazy(() => import('./pages/subdomains/HelpPage').then((m) => ({ default: m.HelpPage })))
const ApiPage = lazy(() => import('./pages/subdomains/ApiPage').then((m) => ({ default: m.ApiPage })))
const DocsPage = lazy(() => import('./pages/subdomains/DocsPage').then((m) => ({ default: m.DocsPage })))
const WalletPage = lazy(() => import('./pages/subdomains/WalletPage').then((m) => ({ default: m.WalletPage })))
const OfflinePage = lazy(() => import('./pages/subdomains/OfflinePage').then((m) => ({ default: m.OfflinePage })))
const OnlinePage = lazy(() => import('./pages/subdomains/OnlinePage').then((m) => ({ default: m.OnlinePage })))
const AdminPage = lazy(() => import('./pages/subdomains/AdminPage').then((m) => ({ default: m.AdminPage })))
const CloudPage = lazy(() => import('./pages/subdomains/CloudPage').then((m) => ({ default: m.CloudPage })))
const BetaPage = lazy(() => import('./pages/subdomains/BetaPage').then((m) => ({ default: m.BetaPage })))
const P2MPage = lazy(() => import('./pages/subdomains/P2MPage').then((m) => ({ default: m.P2MPage })))
const P2CPage = lazy(() => import('./pages/subdomains/P2CPage').then((m) => ({ default: m.P2CPage })))
const C2CPage = lazy(() => import('./pages/subdomains/C2CPage').then((m) => ({ default: m.C2CPage })))
const TransferPage = lazy(() => import('./pages/subdomains/TransfersPage').then((m) => ({ default: m.TransferPage })))
const M2MPage = lazy(() => import('./pages/subdomains/M2MPage').then((m) => ({ default: m.M2MPage })))
const Web3Page = lazy(() => import('./pages/subdomains/Web3Page').then((m) => ({ default: m.Web3Page })))
const ExchangePage = lazy(() => import('./pages/subdomains/ExchangePage').then((m) => ({ default: m.ExchangePage })))
const DataPage = lazy(() => import('./pages/subdomains/DataPage').then((m) => ({ default: m.DataPage })))
const SearchPage = lazy(() => import('./pages/subdomains/SearchPage').then((m) => ({ default: m.SearchPage })))
const InfoPage = lazy(() => import('./pages/subdomains/InfoPage').then((m) => ({ default: m.InfoPage })))
const AdsPage = lazy(() => import('./pages/subdomains/AdsPage').then((m) => ({ default: m.AdsPage })))
const ChatPage = lazy(() => import('./pages/subdomains/ChatPage').then((m) => ({ default: m.ChatPage })))
const ConnectPage = lazy(() => import('./pages/subdomains/ConnectPage').then((m) => ({ default: m.ConnectPage })))
const DownloadPage = lazy(() => import('./pages/subdomains/DownloadPage').then((m) => ({ default: m.DownloadPage })))
const PrivacyPage = lazy(() => import('./pages/subdomains/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const MobileWalletPage = lazy(() => import('./pages/subdomains/MobileWalletPage').then((m) => ({ default: m.MobileWalletPage })))

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
        window.history.replaceState(null, '', `/${currentLang}${location.search}${location.hash}`)
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
    import('./lib/firebase').then((m) => m.signOutFirebase()).catch(() => {})
    navigate(`/${currentLang}${location.search}${location.hash}`)
  }

  if (location.pathname === '/pethar' || location.pathname.startsWith('/pethar/')) {
    return <Main lang={currentLang} setLang={handleSetLang} />
  }

  const renderPage = () => {
    if (!isBanking) {
      switch (subdomain) {
        case 'm': {
          const pathLower = location.pathname.toLowerCase()
          if (
            pathLower.includes('/download') ||
            pathLower.includes('/ios') ||
            pathLower.includes('/android') ||
            pathLower.includes('/andriod')
          ) {
            return <DownloadPage lang={currentLang} />
          }
          const engine = new URLSearchParams(location.search).get('engine')
          // Optional fallback to legacy React Mobile Wallet if explicitly requested
          if (engine === 'react') {
            return <MobileWalletPage lang={currentLang} setLang={handleSetLang} />
          }
          // Default: Unified Flutter Mobile Web to match native Android & iOS apps 1:1
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
        case 'ibanking':
          return <IBankingPage lang={currentLang} />
        case 'accounts':
          return <AccountsPage lang={currentLang} />
        case 'support':
          return <SupportPage lang={currentLang} />
        case 'help':
          return <HelpPage lang={currentLang} />
        case 'api':
          return <ApiPage lang={currentLang} />
        case 'data':
          return <DataPage lang={currentLang} />
        case 'exchange':
          return <ExchangePage lang={currentLang} />
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
        case 'p2m':
          return <P2MPage lang={currentLang} />
        case 'p2c':
          return <P2CPage lang={currentLang} />
        case 'c2c':
          return <C2CPage lang={currentLang} />
        case 'transfer':
          return <TransferPage lang={currentLang} />
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

  return <Suspense fallback={<PageFallback />}>{renderPage()}</Suspense>
}
