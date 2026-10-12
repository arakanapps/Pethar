import { useState, useEffect, useRef } from 'react'
import { ArakanEmblem, FlagArakanCircle, FlagUKCircle } from '../components/ArakanEmblem'
import { AuthModal } from '../components/AuthModal'
import type { Language } from '../i18n'
import {
  Smartphone, ArrowRight, Download, Apple,
  ChevronDown, Send, Menu, X, CheckCircle,
  Radio, Search,
  Wallet, Check, QrCode, ShieldCheck, CreditCard
} from 'lucide-react'

interface LandingPageProps {
  onEnterApp?: () => void
  onOpenBanking?: () => void
  lang?: Language
  setLang?: (lang: Language) => void
}

/* ─── Animated Counter Hook ──────────────────────────────────────────── */
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!startOnView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()
          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * end))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.25 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration, startOnView])

  return { count, ref }
}

/* ─── Metric Stat Card ────────────────────────────────────────────────── */
function MetricCard({
  value,
  label,
  sublabel,
  colorClass = 'text-slate-900',
  formatValue,
}: {
  value: number
  label: string
  sublabel?: string
  colorClass?: string
  formatValue?: (val: number) => string
}) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="liquid-glass-card-light rounded-2xl p-6 border border-white/90 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
      <div className={`text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold font-mono tracking-tight ${colorClass}`}>
        {formatValue ? formatValue(count) : count.toLocaleString()}
      </div>
      <div className="text-xs font-bold text-slate-800 mt-1">
        {label}
      </div>
      {sublabel && (
        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
          {sublabel}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
    PROFESSIONAL FINTECH PLATFORM WEBSITE (LIGHT THEME LIQUID GLASS)
═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage({
  onEnterApp,
  onOpenBanking,
  lang = 'ak',
  setLang,
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Binance-style AuthModal State
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login')

  // Search Bar State
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchableItems = [
    { id: 'overview', title: lang === 'ak' ? 'ပင်မ ခြုံငုံသုံးသပ်ချက်' : 'Overview & Digital Banking', keywords: 'overview home balance usdt parity' },
    { id: 'services', title: lang === 'ak' ? 'ဒစ်ဂျစ်တယ် ဘဏ်ဝန်ဆောင်မှုများ' : 'Instant Transfers & Services', keywords: 'services transfer p2p instant zero fee' },
    { id: 'merchants', title: lang === 'ak' ? 'Arakan QR (AK QR) ကုန်သည်စနစ်' : 'Arakan QR (AK QR) Merchants', keywords: 'qr merchants ak qr pos payments' },
    { id: 'offline', title: lang === 'ak' ? 'အော့ဖ်လိုင်း မက်ရှ် ကွန်ရက်' : 'Offline BLE Mesh Protocol', keywords: 'offline ble mesh mesh payments ed25519' },
    { id: 'currency', title: lang === 'ak' ? '၁:၁ USDT တည်ငြိမ်ငွေကြေး' : '1:1 USDT Treasury Parity', keywords: 'usdt currency treasury akd parity' },
    { id: 'download', title: lang === 'ak' ? 'မိုဘိုင်းအက်ပ် ဒေါင်းလုဒ်' : 'Download Mobile App', keywords: 'download app ios android mobile apple' },
    { id: 'security', title: lang === 'ak' ? 'လုံခြုံရေးနှင့် စည်းမျဉ်းများ' : 'SQLCipher & Enclave Security', keywords: 'security sqlcipher enclave 256-bit encryption' },
    { id: 'faq', title: lang === 'ak' ? 'မေးလေ့ရှိသော မေးခွန်းများ (FAQ)' : 'Frequently Asked Questions (FAQ)', keywords: 'faq questions help' },
  ]

  const filteredItems = searchQuery.trim()
    ? searchableItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const handleSelectSearchItem = (id: string) => {
    setSearchOpen(false)
    setSearchQuery('')
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleOpenBankingClick = () => {
    if (onOpenBanking) {
      onOpenBanking()
    } else if (onEnterApp) {
      onEnterApp()
    }
  }

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  const navMenuItems = [
    { label: lang === 'ak' ? 'ပင်မ' : 'Overview', href: '#overview' },
    { label: lang === 'ak' ? 'ဝန်ဆောင်မှုများ' : 'Services', href: '#services' },
    { label: lang === 'ak' ? 'ကုန်သည်စနစ်' : 'Merchants', href: '#merchants' },
    { label: lang === 'ak' ? 'အော့ဖ်လိုင်းစနစ်' : 'Offline Protocol', href: '#offline' },
    { label: lang === 'ak' ? 'ငွေကြေးစနစ်' : 'Treasury & Parity', href: '#currency' },
    { label: lang === 'ak' ? 'ဒေါင်းလုဒ်' : 'Download', href: '#download' },
    { label: lang === 'ak' ? 'လုံခြုံရေး' : 'Security', href: '#security' },
  ]

  return (
    <div className="min-h-screen text-slate-800 overflow-x-hidden selection:bg-amber-500/30 selection:text-slate-900 font-sans relative bg-[#F8FAFC]">

      {/* ── AMBIENT LIQUID GLASS LIGHT BACKDROP ───────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] left-[20%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-amber-200/30 via-red-100/25 to-transparent blur-[130px] animate-pulse-glow" />
        <div className="absolute top-[35%] right-[-5%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-sky-200/30 via-emerald-100/20 to-transparent blur-[140px] animate-float-slow" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-rose-200/25 via-amber-100/30 to-transparent blur-[150px] animate-float-reverse" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          STICKY LIQUID GLASS NAVIGATION BAR (MTB PAY INSPIRED)
      ═══════════════════════════════════════════════════════════════════ */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 shadow-md shadow-slate-200/40'
          : 'bg-white/65 backdrop-blur-xl border-b border-slate-200/50'
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-[74px] flex items-center justify-between">
          {/* Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md group-hover:scale-110 transition-transform" />
              <ArakanEmblem size={38} variant="badge" className="relative drop-shadow-sm" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 font-sans">PeThar</span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200/60">PAY</span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block font-sans -mt-0.5">
                {lang === 'ak' ? 'အာရက္ခဒစ်ဂျစ်တယ် ဘဏ္ဍာရေးကွန်ရက်' : 'Arakan Unified Digital Payment System'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 font-mono text-[13px] tracking-wide text-slate-600">
            {navMenuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 rounded-xl hover:text-slate-950 hover:bg-slate-100/80 transition-all font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions: Search Bar, Circular Flag Language Selector (MTB Pay inspired), Log In, Sign Up */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Search Bar / Search Button */}
            <div ref={searchRef} className="relative">
              <div className={`flex items-center transition-all duration-300 rounded-full border ${
                searchOpen
                  ? 'w-48 sm:w-56 bg-white border-amber-400 shadow-sm px-3 py-1.5'
                  : 'w-9 h-9 bg-slate-100/80 hover:bg-slate-200/80 border-slate-200/80 justify-center cursor-pointer'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(!searchOpen)
                    if (!searchOpen) {
                      setTimeout(() => searchInputRef.current?.focus(), 100)
                    }
                  }}
                  className="text-slate-600 hover:text-slate-900 flex items-center justify-center shrink-0"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
                {searchOpen && (
                  <div className="flex items-center flex-1 ml-2">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && filteredItems.length > 0) {
                          handleSelectSearchItem(filteredItems[0].id)
                        } else if (e.key === 'Escape') {
                          setSearchOpen(false)
                        }
                      }}
                      placeholder={lang === 'ak' ? 'ရှာဖွေရန်...' : 'Search...'}
                      className="w-full text-xs font-mono bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchOpen && searchQuery.trim() && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-slate-200/80 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">
                    {lang === 'ak' ? 'ရှာဖွေတွေ့ရှိချက်များ' : 'Quick Navigation'}
                  </div>
                  {filteredItems.length > 0 ? (
                    <div className="space-y-1 mt-1 max-h-56 overflow-y-auto">
                      {filteredItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSearchItem(item.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-900 text-xs font-medium transition-colors flex items-center justify-between"
                        >
                          <span>{item.title}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-3 text-xs text-slate-400 text-center font-mono">
                      {lang === 'ak' ? 'ရလဒ် မတွေ့ပါ' : 'No matching sections'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Circular Flag Language Selector (Single Button, Zero Borders, Zero Shake) */}
            <button
              type="button"
              onClick={() => setLang?.(lang === 'ak' ? 'en' : 'ak')}
              className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden cursor-pointer shrink-0 shadow-sm hover:opacity-85 active:opacity-75 transition-opacity select-none"
              title={lang === 'ak' ? 'Switch to English (/en)' : 'ရခိုင်ဘာသာသို့ ပြောင်းမည် (/ak)'}
              aria-label={lang === 'ak' ? 'Switch to English' : 'Switch to Arakanese'}
            >
              {lang === 'ak' ? (
                <FlagArakanCircle size={32} />
              ) : (
                <FlagUKCircle size={32} />
              )}
            </button>

            {/* Log In Button */}
            <button
              onClick={() => openAuth('login')}
              className="px-4 py-2 rounded-xl text-xs font-bold font-mono text-slate-700 hover:text-slate-950 hover:bg-slate-100/90 transition-all border border-slate-200/80 shadow-sm"
            >
              {lang === 'ak' ? 'အကောင့်ဝင်ရန်' : 'Log In'}
            </button>

            {/* Sign Up Button */}
            <button
              onClick={() => openAuth('signup')}
              className="px-4.5 py-2 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 hover:shadow-md transition-all active:scale-[0.98]"
            >
              {lang === 'ak' ? 'အကောင့်ဖွင့်ရန်' : 'Sign Up'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 p-4 space-y-3 font-mono text-sm shadow-xl">
            {/* Mobile Search Bar */}
            <div className="relative">
              <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredItems.length > 0) {
                      handleSelectSearchItem(filteredItems[0].id)
                      setMobileMenuOpen(false)
                    }
                  }}
                  placeholder={lang === 'ak' ? 'ရှာဖွေရန်...' : 'Search...'}
                  className="w-full text-xs font-mono bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {searchQuery.trim() && filteredItems.length > 0 && (
                <div className="mt-1 bg-white rounded-xl p-2 border border-slate-200 shadow-md space-y-1">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleSelectSearchItem(item.id)
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-slate-700 text-xs font-medium flex items-center justify-between"
                    >
                      <span>{item.title}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Language Selector: Single button to change */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-sans">{lang === 'ak' ? 'ဘာသာစကား' : 'Language'}</span>
              <button
                type="button"
                onClick={() => setLang?.(lang === 'ak' ? 'en' : 'ak')}
                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden hover:opacity-85 active:opacity-75 transition-opacity cursor-pointer shrink-0 select-none shadow-sm"
                title={lang === 'ak' ? 'Switch to English (/en)' : 'ရခိုင်ဘာသာသို့ ပြောင်းမည် (/ak)'}
                aria-label={lang === 'ak' ? 'Switch to English' : 'Switch to Arakanese'}
              >
                {lang === 'ak' ? (
                  <FlagArakanCircle size={32} />
                ) : (
                  <FlagUKCircle size={32} />
                )}
              </button>
            </div>

            {navMenuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  openAuth('login')
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 text-center"
              >
                {lang === 'ak' ? 'အကောင့်ဝင်ရန်' : 'Log In'}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  openAuth('signup')
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 text-center"
              >
                {lang === 'ak' ? 'အကောင့်ဖွင့်ရန်' : 'Sign Up'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: HERO (MTB PAY INSPIRED LIGHT LIQUID GLASS)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="overview" className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Vision & Actions */}
            <div className="lg:col-span-7 space-y-6">
              {/* Institutional Compliance Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill-light border border-slate-200 shadow-sm text-xs font-mono font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{lang === 'ak' ? 'Arakan QR (AK QR) စံသတ်မှတ်ချက်ကိုက်ညီ' : 'Arakan QR (AK QR) National Standard Compliant'}</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-700 font-bold">1:1 USDT Parity</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
                {lang === 'ak' ? (
                  <>
                    အာရက္ခဒေသတွင်း <span className="bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 bg-clip-text text-transparent">ခေတ်မီ ဒစ်ဂျစ်တယ်ဘဏ်နှင့်</span> ငွေပေးချေမှုကွန်ရက်
                  </>
                ) : (
                  <>
                    Next-Generation <span className="bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 bg-clip-text text-transparent">Digital Banking</span> for Arakan
                  </>
                )}
              </h1>

              {/* Sub-paragraph */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                {lang === 'ak'
                  ? 'စက္ကန့်ပိုင်းအတွင်း လွယ်ကူလျင်မြန်သော ငွေလွှဲပြောင်းမှုများ၊ အင်တာနက်လိုင်းမရှိချိန်တွင်လည်း အသုံးပြုနိုင်သော အော့ဖ်လိုင်းစနစ်၊ Arakan QR (AK QR) ကုန်သည်ငွေပေးချေမှုနှင့် ၁:၁ USDT တည်ငြိမ်ငွေကြေးစနစ်။'
                  : 'Empowering communities and commerce across Arakan with instant zero-fee peer transfers, offline mesh payments via BLE & NFC, unified Arakan QR merchant acceptance, and an auditable 1:1 USDT parity financial ledger.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => openAuth('signup')}
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex items-center gap-2 active:scale-[0.98]"
                >
                  <span>{lang === 'ak' ? 'အကောင့် အခမဲ့ဖွင့်မည်' : 'Get Started (Sign Up)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#download"
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-sm transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-amber-600" />
                  <span>{lang === 'ak' ? 'မိုဘိုင်းအက်ပ် ဒေါင်းလုဒ်' : 'Download Mobile App'}</span>
                </a>

                <a
                  href="https://t.me/petharsupport"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 shadow-sm transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4 fill-sky-600" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.75-.56 2.95-1.28 4.92-2.13 5.92-2.54 2.81-1.17 3.4-1.38 3.78-1.38.08 0 .28.02.4.12.1.08.13.19.14.27-.01.06.01.23 0 .38z"/>
                  </svg>
                  <span>Telegram (@petharsupport)</span>
                </a>
              </div>

              {/* App Store Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-slate-800" />
                  <span>iOS 16+ (Apple Secure Enclave)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Android 10+ (Keystore Auth)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>256-bit SQLCipher Encrypted</span>
                </div>
              </div>
            </div>

            {/* Right Column: Liquid Glass Interactive Financial Showcase (MTB Pay Banner Style) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[440px]">
                {/* Glow ring */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-red-500/20 rounded-3xl blur-2xl transform rotate-1" />

                {/* Main Card: PeThar Super App Liquid Glass Showcase */}
                <div className="liquid-glass-card-light rounded-3xl p-6 sm:p-7 border border-white/95 relative shadow-2xl">
                  {/* Account Header */}
                  <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-sm">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-500 uppercase">PeThar Primary Vault</div>
                        <div className="text-sm font-extrabold text-slate-900">U Kyaw Min Htin</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Tier 2 KYC Verified
                    </span>
                  </div>

                  {/* Balance Display */}
                  <div className="py-6 space-y-1">
                    <div className="text-xs font-mono text-slate-500">{lang === 'ak' ? 'လက်ကျန်ငွေ' : 'Total Available Balance'}</div>
                    <div className="text-4xl font-extrabold font-mono text-slate-950 tracking-tight flex items-baseline gap-2">
                      <span>42,850.00</span>
                      <span className="text-amber-600 text-lg">AKD</span>
                    </div>
                    <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5 pt-1">
                      <span>≈ 42,850.00 USDT</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-600 font-bold">+1,250.00 (7d)</span>
                    </div>
                  </div>

                  {/* 4 Quick Financial Action Pills (MTB Pay inspired) */}
                  <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-100">
                    <button
                      onClick={handleOpenBankingClick}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 flex items-center justify-center mb-1">
                        <Send className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">{lang === 'ak' ? 'လွှဲမည်' : 'Send'}</span>
                    </button>

                    <button
                      onClick={handleOpenBankingClick}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 flex items-center justify-center mb-1">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">AK QR</span>
                    </button>

                    <button
                      onClick={handleOpenBankingClick}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 flex items-center justify-center mb-1">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">{lang === 'ak' ? 'ဘေလ်' : 'Bills'}</span>
                    </button>

                    <button
                      onClick={handleOpenBankingClick}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 flex items-center justify-center mb-1">
                        <Radio className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">{lang === 'ak' ? 'အော့ဖ်လိုင်း' : 'Offline'}</span>
                    </button>
                  </div>

                  {/* Recent Activity Mini Item */}
                  <div className="pt-4 space-y-2.5">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase">Recent Clearances</div>
                    
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">Sittwe Merchant Terminal #04</div>
                          <div className="text-[10px] font-mono text-slate-400">Arakan QR POS • Instant</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-emerald-600">+125.00 AKD</div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">Offline BLE Peer Voucher</div>
                          <div className="text-[10px] font-mono text-slate-400">Ed25519 Signed • Mrauk-U</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-700">-45.00 AKD</div>
                    </div>
                  </div>
                </div>

                {/* Floating Trust Badge */}
                <div className="absolute -bottom-5 -left-4 sm:-left-6 liquid-glass-pill-light px-4 py-2.5 rounded-2xl shadow-lg border border-white flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">100% Backed Reserves</div>
                    <div className="text-[10px] font-mono text-slate-500">Auditable On-Chain & Off-Chain</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: 4-PILLAR SERVICES ROW (MTB PAY INSPIRED SERVICES)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="services" className="py-16 bg-white/70 border-y border-slate-200/70 relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">
              {lang === 'ak' ? 'ဘဏ္ဍာရေးဝန်ဆောင်မှုများ' : 'Core Financial Services'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-1">
              {lang === 'ak' ? 'PeThar ၏ အဓိက ငွေပေးချေမှုစနစ်များ' : 'Engineered for Everyday Financial Freedom'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Instant P2P Transfer */}
            <div className="liquid-glass-card-light rounded-2xl p-6 border border-white relative group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {lang === 'ak' ? 'ချက်ချင်းငွေလွှဲခြင်း' : 'Instant P2P Transfers'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {lang === 'ak'
                  ? 'ဖုန်းနံပါတ် သို့မဟုတ် PeThar ID ဖြင့် မည်သည့်နေရာမှမဆို အခမဲ့ စက္ကန့်ပိုင်းအတွင်း ငွေလွှဲနိုင်ပါသည်။'
                  : 'Send and receive funds in seconds using just phone numbers or PeThar IDs with 0% peer transfer fees.'}
              </p>
            </div>

            {/* Card 2: Arakan QR (AK QR) Merchant Checkout */}
            <div className="liquid-glass-card-light rounded-2xl p-6 border border-white relative group">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Arakan QR (AK QR)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {lang === 'ak'
                  ? 'ဆိုင်များ၊ စတိုးဆိုင်များနှင့် စီးပွားရေးလုပ်ငန်းများတွင် တစ်ခုတည်းသော AK QR ကုဒ်ဖြင့် စကင်ဖတ်ငွေပေးချေနိုင်ပါသည်။'
                  : 'Scan and pay at merchants across Arakan with the unified AK QR interoperable payment specification.'}
              </p>
            </div>

            {/* Card 3: Offline Device-to-Device Protocol */}
            <div className="liquid-glass-card-light rounded-2xl p-6 border border-white relative group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {lang === 'ak' ? 'အော့ဖ်လိုင်းငွေပေးချေမှု' : 'Offline Device Protocol'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {lang === 'ak'
                  ? 'အင်တာနက်လုံးဝမရှိသည့်အချိန်တွင်လည်း BLE နှင့် NFC နည်းပညာဖြင့် ဖုန်းအချင်းချင်း ငွေပေးချေနိုင်ပါသည်။'
                  : 'Transact without internet connectivity via Bluetooth Low Energy and NFC cryptographic payment vouchers.'}
              </p>
            </div>

            {/* Card 4: Bills & Utility Payments */}
            <div className="liquid-glass-card-light rounded-2xl p-6 border border-white relative group">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:bg-sky-100 transition-colors">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {lang === 'ak' ? 'ဘေလ်နှင့် လျှပ်စစ်မီတာခ' : 'Bill & Utility Clearance'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {lang === 'ak'
                  ? 'ဖုန်းဘေလ်ဖြည့်ခြင်း၊ လျှပ်စစ်မီတာခပေးဆောင်ခြင်းနှင့် နိုင်ငံတကာလုပ်သားငွေလွှဲစနစ်များကို လွယ်ကူစွာ ဆောင်ရွက်ပါ။'
                  : 'Seamlessly top up telecom, pay electric utilities, and process regional worker remittances from Thailand & Malaysia.'}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: METRICS & RESILIENT LEDGER ARCHITECTURE
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="currency" className="py-20 relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Financial Architecture Explainer */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-wider">
                {lang === 'ak' ? 'ငွေကြေးစနစ်နှင့် တည်ငြိမ်မှု' : 'Reserve & Ledger Architecture'}
              </span>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                {lang === 'ak' ? (
                  <>၁ AKD = ၁ USDT တည်ငြိမ်မှုစနစ်ဖြင့် <span className="text-amber-600">အာမခံထားသော ဘဏ္ဍာရေးအခြေခံ</span></>
                ) : (
                  <>1 AKD = 1 USDT Parity Architecture with <span className="text-amber-600">Auditable Reserves</span></>
                )}
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {lang === 'ak'
                  ? 'Arakan Dollar (AKD) သည် တည်ငြိမ်သော ဒစ်ဂျစ်တယ်ငွေကြေးဖြစ်ပြီး ၁:၁ USDT တန်ဖိုးတူညီမှု ရည်မှန်းချက်ဖြင့် လည်ပတ်ပါသည်။ နှစ်ထပ်ငွေပေးချေမှု မဖြစ်ပေါ်စေရန်နှင့် ငွေကြေးတည်ငြိမ်မှုရှိစေရန် PostgreSQL စာရင်းဇယား (Ledger) ဖြင့် အတိအကျ ထိန်းချုပ်ထားပါသည်။'
                  : 'Arakan Dollar (AKD) is anchored to a 1:1 parity target with USDT, backed by verifiable multi-signature treasury reserves. Online ledger entries execute atomically with Row Level Security, ensuring strict double-entry balancing and fraud resistance.'}
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{lang === 'ak' ? 'အပြည့်အဝ စာရင်းစစ်ဆေးခံနိုင်ခြင်း' : 'Fully Auditable Server-Side Ledger'}</h4>
                    <p className="text-xs text-slate-500">{lang === 'ak' ? 'ငွေလွှဲမှုတိုင်းအတွက် နှစ်ထပ်စာရင်းကိုင်စနစ်ဖြင့် မှတ်တမ်းတင်ပါသည်' : 'Atomic posting functions with cryptographic idempotency keys.'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{lang === 'ak' ? 'လုံခြုံစိတ်ချရသော ကုန်သည်စနစ်' : 'Instant Merchant Settlement'}</h4>
                    <p className="text-xs text-slate-500">{lang === 'ak' ? 'ကုန်သည်များထံသို့ ချက်ချင်း ငွေစာရင်းဝင်ရောက်ပါသည်' : 'Real-time reconciliation for physical POS and online vendors.'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Metrics Grid */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <MetricCard
                value={100}
                label={lang === 'ak' ? 'အရန်ငွေကြေး အာမခံချက်' : 'Reserve Backing Ratio'}
                sublabel="1:1 USDT Target"
                colorClass="text-amber-600"
                formatValue={(v) => `${v}%`}
              />
              <MetricCard
                value={0}
                label={lang === 'ak' ? 'ငွေလွှဲခ' : 'Peer Transfer Fee'}
                sublabel="Permanent P2P Zero Fee"
                colorClass="text-emerald-600"
                formatValue={() => '0.0%'}
              />
              <MetricCard
                value={1200}
                label={lang === 'ak' ? 'ငွေလွှဲပြီးမြောက်ချိန်' : 'Transaction Finality'}
                sublabel="Sub-Second Settlement"
                colorClass="text-blue-600"
                formatValue={() => '< 1.2s'}
              />
              <MetricCard
                value={250}
                label={lang === 'ak' ? 'အော့ဖ်လိုင်း ကန့်သတ်ချက်' : 'Offline Voucher Cap'}
                sublabel="Risk-Engine Enforced"
                colorClass="text-slate-900"
                formatValue={(v) => `$${v} AKD`}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: DOWNLOAD APP (MTB PAY INSPIRED CLEAN SECTION)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="download" className="py-20 bg-gradient-to-b from-white to-slate-100/80 border-t border-slate-200/80 relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="liquid-glass-modal-light rounded-3xl p-8 sm:p-12 border border-white shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">
                  {lang === 'ak' ? 'မိုဘိုင်းအက်ပ် ရယူပါ' : 'Experience PeThar On Mobile'}
                </span>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                  {lang === 'ak' ? 'Android နှင့် iOS အတွက် အခုပဲ ဒေါင်းလုဒ်လုပ်ပါ' : 'Download PeThar for iOS & Android'}
                </h2>

                <p className="text-sm sm:text-base text-slate-600 max-w-xl">
                  {lang === 'ak'
                    ? 'စမတ်ဖုန်းတစ်လုံးရှိရုံဖြင့် အချိန်မရွေး၊ နေရာမရွေး လွယ်ကူလျင်မြန်စွာ ငွေပေးချေနိုင်ပါပြီ။ စက္ကန့်ပိုင်းအတွင်း အကောင့်ဖွင့်ပြီး စတင်အသုံးပြုနိုင်ပါသည်။'
                    : 'Manage your assets, scan Arakan QR codes, and pay offline without internet. Available for immediate installation on iPhone and Android devices.'}
                </p>

                {/* Download Store Buttons (MTB Pay Style) */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault()
                      alert(lang === 'ak' ? 'iOS App Store build မကြာမီ ထွက်ရှိပါမည်' : 'iOS TestFlight build is queued for App Store distribution.')
                    }}
                    className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-2.5 shadow-md transition-all"
                  >
                    <Apple className="w-5 h-5 text-white" />
                    <div className="text-left">
                      <div className="text-[9px] uppercase text-slate-400 leading-none">Download on</div>
                      <div className="text-xs font-bold leading-none mt-1">App Store</div>
                    </div>
                  </a>

                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault()
                      alert(lang === 'ak' ? 'Google Play Store build မကြာမီ ထွက်ရှိပါမည်' : 'Google Play release is pending staging verification.')
                    }}
                    className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-2.5 shadow-md transition-all"
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div className="text-left">
                      <div className="text-[9px] uppercase text-slate-400 leading-none">Get it on</div>
                      <div className="text-xs font-bold leading-none mt-1">Google Play</div>
                    </div>
                  </a>

                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault()
                      alert(lang === 'ak' ? 'Android APK တိုက်ရိုက်ဒေါင်းလုဒ်စနစ် ပြင်ဆင်နေပါသည်' : 'Android APK direct package will be generated via ./apps/android/build-apk.sh')
                    }}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>Direct APK</span>
                  </a>
                </div>
              </div>

              {/* QR Code Scan (MTB Pay style) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center">
                <div className="w-36 h-36 bg-white p-3 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-center mb-3">
                  <QrCode className="w-28 h-28 text-slate-900" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {lang === 'ak' ? 'မိုဘိုင်းအက်ပ် ရယူရန် စကင်ဖတ်ပါ' : 'Scan to Download'}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">iOS & Android Compatible</div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: FAQ & INSTITUTIONAL TRUST
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-[900px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">
              {lang === 'ak' ? 'မကြာခဏ မေးလေ့ရှိသော မေးခွန်းများ' : 'Frequently Asked Questions'}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-1">
              {lang === 'ak' ? 'အမေးများသော အချက်အလက်များ' : 'Everything You Need to Know'}
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: lang === 'ak' ? 'PeThar ကို အင်တာနက်မရှိချိန်တွင် အသုံးပြုနိုင်ပါသလား?' : 'Can I use PeThar without internet connection?',
                a: lang === 'ak'
                  ? 'ဟုတ်ကဲ့၊ အသုံးပြုနိုင်ပါသည်။ PeThar တွင် ပါရှိသော Bluetooth Low Energy (BLE) နှင့် NFC အော့ဖ်လိုင်းငွေပေးချေမှုစနစ်ဖြင့် ဖုန်းအချင်းချင်း ဒစ်ဂျစ်တယ်လက်မှတ် (Digital Signature) ထိုးကာ လုံခြုံစွာ ငွေပေးချေနိုင်ပါသည်။ အင်တာနက်လိုင်း ပြန်ရချိန်တွင် ဗဟိုစနစ်သို့ အလိုအလျောက် ပေးပို့အတည်ပြုပါမည်။'
                  : 'Yes. PeThar incorporates an advanced device-to-device offline payment protocol utilizing BLE and NFC. Transactions are cryptographically signed with Ed25519 keys and synchronized as soon as connectivity is restored.'
              },
              {
                q: lang === 'ak' ? '၁ AKD နှင့် ၁ USDT တန်ဖိုးတူညီမှု မည်သို့အလုပ်လုပ်သနည်း?' : 'How is the 1 AKD = 1 USDT parity maintained?',
                a: lang === 'ak'
                  ? 'PeThar သည် ၁ AKD လျှင် ၁ USDT တန်ဖိုးတူညီမှု ရည်မှန်းချက်ဖြင့် လည်ပတ်ပြီး တရားဝင်အရန်ငွေကြေး ထိန်းသိမ်းမှုစနစ်နှင့် ပေါင်းစပ်ထားပါသည်။ ပြင်ပငွေကြေးဈေးကွက်များနှင့် တိုက်ရိုက်လဲလှယ်နိုင်ရန် ဘဏ္ဍာရေးစာရင်းစစ်ဆေးမှုများ ဆောင်ရွက်ထားပါသည်။'
                  : '1 AKD is pegged to 1 USDT as a target parity standard, reinforced by multi-sig treasury reserves and verified double-entry ledger audits.'
              },
              {
                q: lang === 'ak' ? 'Arakan QR (AK QR) ကို မည်သည့်နေရာများတွင် သုံးနိုင်သနည်း?' : 'Where can Arakan QR (AK QR) be used?',
                a: lang === 'ak'
                  ? 'အာရက္ခဒေသတစ်ဝှမ်းရှိ စတိုးဆိုင်များ၊ လက်လီအရောင်းဆိုင်များ၊ စားသောက်ဆိုင်များနှင့် ကုန်စည်ပို့ဆောင်ရေးလုပ်ငန်းများတွင် စကင်ဖတ်ငွေပေးချေနိုင်ပါသည်။'
                  : 'Arakan QR (AK QR) can be scanned at participating retail merchants, grocery markets, service points, and online checkout portals.'
              },
              {
                q: lang === 'ak' ? 'အကောင့်လုံခြုံရေးအတွက် မည်သည့်နည်းပညာများ သုံးထားသနည်း?' : 'What security protections guard my account and data?',
                a: lang === 'ak'
                  ? 'စမတ်ဖုန်း၏ Apple Secure Enclave / Android Keystore ဖြင့် ထိန်းချုပ်ထားသော Face ID / လက်ဗွေလော့ခ်စနစ်၊ AES-256 SQLCipher စာဝှက်စနစ်နှင့် Supabase PostgreSQL RLS လုံခြုံရေးစည်းမျဉ်းများဖြင့် ကာကွယ်ထားပါသည်။'
                  : 'Your funds are secured with hardware-backed key storage (Apple Secure Enclave and Android Keystore), biometric Face ID authentication, AES-256 SQLCipher local encryption, and server-side PostgreSQL Row Level Security.'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="liquid-glass-card-light rounded-2xl border border-slate-200/80 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between gap-4 text-sm sm:text-base hover:text-amber-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-amber-600' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: INSTITUTIONAL FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-200 bg-slate-100/90 py-12 text-xs text-slate-500 font-mono">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ArakanEmblem size={28} variant="badge" />
                <span className="text-base font-black text-slate-900 font-sans">PeThar Pay</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                {lang === 'ak'
                  ? 'အာရက္ခဒေသတွင်း ဘဏ္ဍာရေးလွတ်လပ်ခွင့်နှင့် ခေတ်မီငွေပေးချေမှုကွန်ရက်'
                  : 'Independent, resilient, and inclusive digital financial infrastructure for Arakan.'}
              </p>
              <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Ledger Operational & Verified</span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <div className="font-bold text-slate-800 mb-3 uppercase tracking-wider">{lang === 'ak' ? 'ဝန်ဆောင်မှုများ' : 'Services'}</div>
              <ul className="space-y-2">
                <li><a href="#services" className="hover:text-slate-900 transition-colors">Instant Transfers</a></li>
                <li><a href="#merchants" className="hover:text-slate-900 transition-colors">Arakan QR (AK QR)</a></li>
                <li><a href="#offline" className="hover:text-slate-900 transition-colors">Offline BLE Mesh Pay</a></li>
                <li><a href="#currency" className="hover:text-slate-900 transition-colors">USDT Parity Ledger</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <div className="font-bold text-slate-800 mb-3 uppercase tracking-wider">{lang === 'ak' ? 'လုံခြုံရေး' : 'Security & Legal'}</div>
              <ul className="space-y-2">
                <li><a href="#security" className="hover:text-slate-900 transition-colors">Secure Enclave Bridge</a></li>
                <li><a href="#security" className="hover:text-slate-900 transition-colors">SQLCipher AES-256</a></li>
                <li><a href="#security" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#security" className="hover:text-slate-900 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <div className="font-bold text-slate-800 mb-3 uppercase tracking-wider">{lang === 'ak' ? 'ဆက်သွယ်ရန်' : 'Contact Support'}</div>
              <div className="space-y-2.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Telegram:</span>
                  <a
                    href="https://t.me/petharsupport"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 font-bold hover:underline flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 fill-sky-600" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.75-.56 2.95-1.28 4.92-2.13 5.92-2.54 2.81-1.17 3.4-1.38 3.78-1.38.08 0 .28.02.4.12.1.08.13.19.14.27-.01.06.01.23 0 .38z"/>
                    </svg>
                    <span>@petharsupport</span>
                  </a>
                </div>
                <div>Web: <a href="https://www.pethar.co.uk" target="_blank" rel="noopener noreferrer" className="text-slate-800 font-bold hover:underline">www.pethar.co.uk</a></div>
                <div className="pt-1 text-[10px] text-slate-400">
                  {lang === 'ak' ? 'တရားဝင် အကူအညီအတွက် Telegram တွင် ဆက်သွယ်ပါ' : 'Official 24/7 customer assistance via Telegram'}
                </div>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-200/80 text-center text-xs text-slate-500 font-mono">
            <div>© 2026 PeThar (ဖေ့သာ). All rights reserved.</div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════
          BINANCE-STYLE AUTHENTICATION MODAL (LOG IN / SIGN UP)
      ═══════════════════════════════════════════════════════════════════ */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          setAuthModalOpen(false)
          handleOpenBankingClick()
        }}
        lang={lang}
      />

    </div>
  )
}
