import { useState, useEffect, useRef } from 'react'
import { ArakanEmblem, FlagArakanCircle, FlagUKCircle } from '../components/ArakanEmblem'
import { AuthModal } from '../components/AuthModal'
import type { Language } from '../i18n'
import {
  Smartphone, ArrowRight, Apple,
  Send, X, CheckCircle,
  Radio, Search,
  Wallet, Check, QrCode, ShieldCheck, CreditCard, Mail,
  Lock, Trash2, Server, ExternalLink, Cpu, UserCheck,
  RefreshCw, Star, TrendingUp, Zap
} from 'lucide-react'

interface LandingPageProps {
  onEnterApp?: () => void
  onOpenBanking?: () => void
  lang?: Language
  setLang?: (lang: Language) => void
}

export default function LandingPage({
  onEnterApp,
  onOpenBanking,
  lang = 'ak',
  setLang,
}: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false)

  // AuthModal State
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login')

  // Search Bar State
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Interactive Currency Exchange Calculator State (Paysoft/Payno style)
  const [exchangeAmount, setExchangeAmount] = useState('500')
  const [fromCurr, setFromCurr] = useState<'AKD' | 'USD' | 'THB' | 'USDT'>('AKD')
  const [toCurr, setToCurr] = useState<'AKD' | 'USD' | 'THB' | 'USDT'>('THB')

  // Interactive Quick Transfer Simulator State
  const [p2pRecipient, setP2pRecipient] = useState('Ko Min Aung')
  const [p2pAmount, setP2pAmount] = useState('75.00')
  const [p2pTransferred, setP2pTransferred] = useState(false)

  // Interactive Monthly Bar Chart Active Month State
  const [activeChartMonth, setActiveChartMonth] = useState<number>(5)

  // Billing Period Toggle for Pricing Plans
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const chartData = [
    { month: 'Jan', volume: '₳ 12.4k', height: '35%' },
    { month: 'Feb', volume: '₳ 18.9k', height: '48%' },
    { month: 'Mar', volume: '₳ 27.5k', height: '62%' },
    { month: 'Apr', volume: '₳ 34.2k', height: '74%' },
    { month: 'May', volume: '₳ 45.8k', height: '88%' },
    { month: 'Jun', volume: '₳ 56.7k', height: '100%' },
  ]

  const getExchangeResult = () => {
    const amt = parseFloat(exchangeAmount) || 0
    let inAkd = amt
    if (fromCurr === 'THB') inAkd = amt / 35.8
    if (toCurr === 'THB') return (inAkd * 35.8).toFixed(2)
    return inAkd.toFixed(2)
  }

  const handleSimulateP2p = () => {
    setP2pTransferred(true)
    setTimeout(() => setP2pTransferred(false), 2200)
  }

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

  // Auto-scroll to target hash section on mount or hash change (e.g. #security)
  useEffect(() => {
    const handleHashScroll = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const id = window.location.hash.replace('#', '')
        const elem = document.getElementById(id)
        if (elem) {
          setTimeout(() => {
            elem.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 150)
        }
      }
    }

    handleHashScroll()
    window.addEventListener('hashchange', handleHashScroll)
    return () => window.removeEventListener('hashchange', handleHashScroll)
  }, [])

  const searchableItems = [
    { id: 'overview', title: lang === 'ak' ? 'ပင်မ ခြုံငုံသုံးသပ်ချက်' : 'Overview & Digital Banking', keywords: 'overview home balance usdt parity' },
    { id: 'features', title: lang === 'ak' ? 'ဒစ်ဂျစ်တယ် ဘဏ်ဝန်ဆောင်မှုများ' : 'Smart Financial Features', keywords: 'features transfer p2p instant zero fee gold' },
    { id: 'management', title: lang === 'ak' ? 'ဘဏ္ဍာရေး စီမံခန့်ခွဲမှု စနစ်' : 'Smart Financial Management', keywords: 'management chart exchange bento bills' },
    { id: 'tiers', title: lang === 'ak' ? 'အကောင့်အဆင့်များနှင့် နှုန်းထား' : 'Citizen Account Tiers', keywords: 'tiers pricing plan verified merchant' },
    { id: 'testimonials', title: lang === 'ak' ? 'သုံးစွဲသူများ၏ သဘောထား' : 'Customer Reviews & Stories', keywords: 'testimonials reviews feedback citizens' },
    { id: 'security', title: lang === 'ak' ? 'လုံခြုံရေးနှင့် ကိုယ်ရေးအချက်အလက် မူဝါဒ' : 'Security & Privacy Policy', keywords: 'security privacy policy google oauth data deletion encryption compliance' },
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
    { label: lang === 'ak' ? 'ပင်မ' : 'Home', href: '#overview' },
    { label: lang === 'ak' ? 'စွမ်းဆောင်ရည်' : 'Features', href: '#features' },
    { label: lang === 'ak' ? 'စီမံခန့်ခွဲမှု' : 'Management', href: '#management' },
    { label: lang === 'ak' ? 'အကောင့်အဆင့်' : 'Tiers', href: '#tiers' },
    { label: lang === 'ak' ? 'မှတ်ချက်များ' : 'Reviews', href: '#testimonials' },
    { label: lang === 'ak' ? 'လုံခြုံရေး' : 'Security', href: '#security' },
  ]

  return (
    <div className="min-h-screen text-slate-800 overflow-x-hidden selection:bg-amber-500/30 selection:text-slate-900 font-sans relative bg-fintech-gradient">

      {/* ── AMBIENT LUMINOUS PASTEL BACKDROP (BANK ONE & PAYNO STYLE) ────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-8%] left-[25%] w-[750px] h-[750px] rounded-full bg-gradient-to-br from-indigo-200/40 via-purple-100/35 to-transparent blur-[140px] animate-pulse-glow" />
        <div className="absolute top-[30%] right-[-5%] w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-sky-200/45 via-blue-100/30 to-transparent blur-[150px] animate-float-slow" />
        <div className="absolute bottom-[10%] left-[-10%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-amber-200/30 via-rose-100/30 to-transparent blur-[160px] animate-float-reverse" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.025)_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          STICKY FROSTED LIQUID GLASS NAVIGATION BAR (BANK ONE STYLE PILL)
      ═══════════════════════════════════════════════════════════════════ */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 shadow-sm'
          : 'bg-white/60 backdrop-blur-xl border-b border-white/60'
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
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-900 border border-amber-300/60">PAY</span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block font-sans -mt-0.5">
                {lang === 'ak' ? 'အာရက္ခဒစ်ဂျစ်တယ် ဘဏ္ဍာရေးကွန်ရက်' : 'Arakan Unified Digital Banking'}
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

          {/* Actions: Search Bar, Circular Flag Language Selector, Log In, Sign Up */}
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
                  className="text-slate-600 hover:text-slate-900 flex items-center justify-center shrink-0 cursor-pointer"
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
                        className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
                          className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-900 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer"
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

            {/* Circular Flag Language Selector */}
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
              className="px-4 py-2 rounded-xl text-xs font-bold font-mono text-slate-700 hover:text-slate-950 hover:bg-slate-100/90 transition-all border border-slate-200/80 shadow-sm cursor-pointer"
            >
              {lang === 'ak' ? 'အကောင့်ဝင်ရန်' : 'Log In'}
            </button>

            {/* Sign Up Button (Bank One deep style) */}
            <button
              onClick={() => openAuth('signup')}
              className="px-5 py-2 rounded-full text-xs font-bold font-mono bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              {lang === 'ak' ? 'အကောင့်ဖွင့်ရန်' : 'Sign Up'}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: HERO (BANK ONE PASTEL GLASS + PAYNO HANDHELD SMARTPHONE)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="overview" className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden payno-sky-gradient">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines, Social Proof & Partner Logos */}
            <div className="lg:col-span-7 space-y-6">
              {/* Compliance Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/80 shadow-sm text-xs font-mono font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{lang === 'ak' ? 'Arakan QR (AK QR) စံသတ်မှတ်ချက်ကိုက်ညီ' : 'Arakan QR (AK QR) Standard Compliant'}</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600 font-bold">1:1 USDT Parity</span>
              </div>

              {/* Main Headline (Bank One / Payno style) */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
                {lang === 'ak' ? (
                  <>
                    အာရက္ခဒေသတွင်း <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">ခေတ်မီ ဒစ်ဂျစ်တယ်ဘဏ်နှင့်</span> ငွေပေးချေမှုကွန်ရက်
                  </>
                ) : (
                  <>
                    Take Control of Your <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">Finances Today</span>
                  </>
                )}
              </h1>

              {/* Sub-paragraph */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                {lang === 'ak'
                  ? 'ငွေကြေးစီမံခန့်ခွဲမှု၊ စက္ကန့်ပိုင်းအတွင်း ချက်ချင်းငွေလွှဲခြင်းနှင့် ၁၀၀% ရွှေ/ဒေါ်လာ အာမခံဘဏ္ဍာတိုက်ဖြင့် ကျောထောက်နောက်ခံပြုထားသော နိုင်ငံသားဒစ်ဂျစ်တယ်ဘဏ်စနစ်။'
                  : 'Manage your money, grow your wealth, and transfer funds across Arakan and globally with zero peer fees, 100% reserve-backed security, and instant settlement.'}
              </p>

              {/* Dual CTAs (Bank One style) */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => openAuth('signup')}
                  className="px-7 py-4 rounded-full font-black text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-xl transition-all flex items-center gap-2 active:scale-[0.98] cursor-pointer"
                >
                  <span>{lang === 'ak' ? 'အကောင့် အခမဲ့ဖွင့်မည်' : 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleOpenBankingClick}
                  className="px-7 py-4 rounded-full font-bold text-sm bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{lang === 'ak' ? 'ဝဘ်ဘဏ်စနစ် စမ်းသပ်ရန်' : 'Try It Free'}</span>
                </button>
              </div>

              {/* Social Proof Row (Bank One style: Avatars + 4.9 Stars + Experience Stats) */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-8 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=70&auto=format&fit=crop&q=80" alt="Citizen 1" />
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=70&auto=format&fit=crop&q=80" alt="Citizen 2" />
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=70&auto=format&fit=crop&q=80" alt="Citizen 3" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">42,000+ Verified Citizens</div>
                    <div className="text-[11px] text-amber-600 flex items-center gap-1 font-mono">
                      <span>Reviews 4.9 out of 5</span>
                      <div className="flex text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-6 font-mono text-[11px]">
                  <div>
                    <div className="font-black text-slate-900 text-base">5+</div>
                    <div className="text-slate-400 uppercase tracking-wider text-[9px]">Years Rails</div>
                  </div>
                  <div>
                    <div className="font-black text-emerald-600 text-base">99.998%</div>
                    <div className="text-slate-400 uppercase tracking-wider text-[9px]">Uptime</div>
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-base">24/7</div>
                    <div className="text-slate-400 uppercase tracking-wider text-[9px]">Services</div>
                  </div>
                </div>
              </div>

              {/* Partner Logo Cloud (Bank One style) */}
              <div className="pt-3 flex flex-wrap items-center gap-6 opacity-60 text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
                <span>Arakan Treasury</span>
                <span>•</span>
                <span>Tether 1:1 Parity</span>
                <span>•</span>
                <span>SQLCipher 256-Bit</span>
                <span>•</span>
                <span>FIPS 140-2 HSM</span>
              </div>
            </div>

            {/* Right Column: Realistic Handheld Smartphone Showcase + Floating Live Widgets (Payno Style) */}
            <div className="lg:col-span-5 relative flex justify-center py-6">
              
              {/* Stacked 3D Iridescent Credit Cards (Bank One style in background) */}
              <div className="absolute top-2 -right-4 w-64 h-36 sxdx-credit-card rounded-2xl p-4 text-white shadow-xl rotate-12 opacity-85 pointer-events-none transform translate-x-4 -translate-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span>PeThar Card</span>
                  <span className="font-bold">VISA</span>
                </div>
                <div className="mt-8 font-mono text-sm tracking-widest">4829 •••• •••• 0921</div>
              </div>

              <div className="absolute top-12 -right-8 w-64 h-36 bg-slate-900 rounded-2xl p-4 text-white shadow-2xl rotate-6 opacity-75 pointer-events-none transform translate-x-6">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Titanium Black</span>
                  <span>VISA PLATINUM</span>
                </div>
                <div className="mt-8 font-mono text-sm tracking-widest text-slate-300">•••• •••• •••• 8891</div>
              </div>

              {/* Main Smartphone Frame (Payno Mobile UI Mockup) */}
              <div className="relative z-20 w-[300px] sm:w-[320px] phone-frame shadow-2xl">
                {/* Dynamic Island */}
                <div className="pt-2 px-6 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>9:41</span>
                  <div className="w-20 h-4 bg-black rounded-full mx-auto" />
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>5G</span>
                  </div>
                </div>

                {/* In-Phone Screen Content */}
                <div className="p-4 sm:p-5 text-slate-900 bg-white min-h-[520px] rounded-[36px] mt-2 flex flex-col justify-between">
                  <div>
                    {/* Welcome User Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80"
                          alt="Jack Halder"
                          className="w-9 h-9 rounded-full object-cover border border-amber-300"
                        />
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Welcome back 👋</div>
                          <div className="text-xs font-bold text-slate-900">Jack Halder</div>
                        </div>
                      </div>
                      <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs">
                        🔔
                      </span>
                    </div>

                    {/* Available Balance Spotlight */}
                    <div className="py-4">
                      <div className="text-[11px] text-slate-500 font-medium">Available Balance</div>
                      <div className="text-3xl font-black font-mono tracking-tight text-slate-950 mt-0.5">
                        ₳ 56,750.00
                      </div>
                      <div className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>+14.8% see last week trend</span>
                      </div>
                    </div>

                    {/* 4 Quick Action Round Buttons (Payno style) */}
                    <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-100 text-center">
                      <button
                        onClick={handleOpenBankingClick}
                        className="flex flex-col items-center gap-1 hover:opacity-80 transition cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-800">
                          <Send className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">Send</span>
                      </button>

                      <button
                        onClick={handleOpenBankingClick}
                        className="flex flex-col items-center gap-1 hover:opacity-80 transition cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-800">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">Add</span>
                      </button>

                      <button
                        onClick={handleOpenBankingClick}
                        className="flex flex-col items-center gap-1 hover:opacity-80 transition cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-800">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">Pay Bills</span>
                      </button>

                      <button
                        onClick={handleOpenBankingClick}
                        className="flex flex-col items-center gap-1 hover:opacity-80 transition cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-800">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">Transfer</span>
                      </button>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Recent transactions</span>
                        <span className="text-indigo-600 cursor-pointer">See All</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px]">
                            PP
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[11px]">Paypal Inward Wire</div>
                            <div className="text-[9px] text-slate-400">Today, 5:32 PM</div>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-emerald-600 text-xs">+₳ 80.89</div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px]">
                            G
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[11px]">Google Cloud Storage</div>
                            <div className="text-[9px] text-slate-400">Today, 2:40 PM</div>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-slate-800 text-xs">-₳ 10.99</div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px]">
                            ⚡
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[11px]">Starlink Satellite</div>
                            <div className="text-[9px] text-slate-400">Yesterday, 9:15 AM</div>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-slate-800 text-xs">-₳ 15.00</div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile App Bottom Nav Bar (Payno style) */}
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center px-2 text-[10px] text-slate-400">
                    <span className="font-bold text-indigo-600 flex flex-col items-center">🏠 Home</span>
                    <span className="flex flex-col items-center">💼 Wallet</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                      +
                    </div>
                    <span className="flex flex-col items-center">💳 Cards</span>
                    <span className="flex flex-col items-center">👤 Profile</span>
                  </div>
                </div>
              </div>

              {/* 4 Floating Glass Widgets Surrounding the Phone (Payno style!) */}
              {/* Widget 1: Top-Left Sparkline */}
              <div className="absolute top-10 -left-6 sm:-left-12 glass-widget rounded-2xl p-3 shadow-xl z-30 animate-float-slow hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-900">1,235 Visitors this month</span>
                </div>
                {/* SVG Mini Sparkline */}
                <svg className="w-32 h-6 mt-1 stroke-teal-500 fill-none" viewBox="0 0 100 20">
                  <polyline points="0,15 20,10 40,14 60,6 80,11 100,2" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Widget 2: Middle-Left Transaction Limit with Avatars */}
              <div className="absolute top-48 -left-8 sm:-left-14 glass-widget rounded-2xl p-3 shadow-xl z-30 animate-float-reverse hidden sm:block">
                <div className="text-[10px] text-slate-500 font-mono">Transaction Limit</div>
                <div className="text-sm font-black font-mono text-indigo-600">₳ 15k <span className="text-[10px] font-sans text-slate-500">Per Day</span></div>
                <div className="flex -space-x-1.5 mt-1">
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-[9px] text-white font-bold flex items-center justify-center border border-white">J</span>
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-[9px] text-white font-bold flex items-center justify-center border border-white">M</span>
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-[9px] text-white font-bold flex items-center justify-center border border-white">N</span>
                </div>
              </div>

              {/* Widget 3: Bottom-Left Instant Settlement Badge */}
              <div className="absolute -bottom-4 -left-4 sm:-left-8 glass-widget rounded-2xl p-3 shadow-xl z-30 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">&lt; 0.8s Settlement</div>
                  <div className="text-[10px] text-slate-500 font-mono">Byzantine Finality</div>
                </div>
              </div>

              {/* Widget 4: Right Asset Allocation Donut Chart (Payno style!) */}
              <div className="absolute top-36 -right-6 sm:-right-16 glass-widget rounded-2xl p-4 shadow-xl z-30 max-w-[190px] animate-float-slow hidden sm:block">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Reserve Backing</div>
                <div className="flex items-center gap-3">
                  {/* SVG Donut Chart */}
                  <svg className="w-12 h-12 transform -rotate-90 shrink-0" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E2E8F0" strokeWidth="4" />
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F59E0B" strokeWidth="4" strokeDasharray="40 60" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#4F46E5" strokeWidth="4" strokeDasharray="60 40" strokeDashoffset="-40" />
                  </svg>
                  <div className="text-[10px] space-y-1 font-mono">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-bold text-slate-800">40% Gold</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span className="font-bold text-slate-800">60% USD</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── CAPITECH MARQUEE FINTECH RAILS TICKER (IMAGE 5 STYLE) ── */}
      <div className="bg-slate-950 py-3.5 border-y border-slate-800 text-xs font-mono tracking-wider overflow-hidden relative select-none">
        <div className="animate-marquee flex items-center gap-8 text-slate-300">
          <span className="flex items-center gap-2 text-amber-400 font-bold"><Zap className="w-3.5 h-3.5" /> DeFi Banking</span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Instant Settlements (&lt;0.8s)</span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center gap-2 text-indigo-300 font-bold">1:1 USDT Parity Guaranteed</span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center gap-2">Seamless Multi-Device Integration</span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center gap-2 text-amber-400 font-bold"><ShieldCheck className="w-3.5 h-3.5" /> 100% Gold Backing</span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center gap-2"><Radio className="w-3.5 h-3.5 text-cyan-400" /> Offline BLE & NFC Mesh</span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center gap-2">Zero-Commission P2P Transfers</span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center gap-2 text-emerald-400 font-bold"><Lock className="w-3.5 h-3.5" /> Ed25519 Secure Enclave</span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center gap-2 text-amber-400 font-bold"><Zap className="w-3.5 h-3.5" /> DeFi Banking</span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Instant Settlements (&lt;0.8s)</span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center gap-2 text-indigo-300 font-bold">1:1 USDT Parity Guaranteed</span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center gap-2">Seamless Multi-Device Integration</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: FEATURE SPOTLIGHT (PAYNO IMAGE 3 SECTION 2)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 bg-white relative border-y border-slate-200/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              {lang === 'ak' ? 'လွယ်ကူရိုးရှင်းသော ဘဏ္ဍာရေး' : 'Simplicity & Scale'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
              {lang === 'ak'
                ? 'ငွေကြေးသုံးစွဲမှုမှ ရင်းနှီးမြှုပ်နှံမှုအထိ - အရာအားလုံးကို လက်တစ်ကမ်းတွင် ရရှိနိုင်ပါသည်'
                : "From Budgeting to Investing — We've Got You Covered"}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {lang === 'ak'
                ? 'ဖေ့သာဖြင့် သင်၏ငွေကြေးလွတ်လပ်ခွင့်ကို လုံခြုံစွာ တည်ဆောက်ပါ'
                : 'Getting ahead with your money has never been this simple, secure, and accessible.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Angled Perspective Device Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-amber-500/20 rounded-3xl blur-2xl" />
                <div className="relative bg-slate-950 rounded-[38px] p-4 border-4 border-slate-800 text-white shadow-2xl max-w-xs">
                  <div className="p-4 bg-slate-900 rounded-[28px] space-y-4">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                      <span>Offline Mesh Mode</span>
                      <span className="text-emerald-400 font-bold">ACTIVE ●</span>
                    </div>
                    <div className="text-center py-6 bg-slate-950/80 rounded-2xl border border-slate-800">
                      <Radio className="w-10 h-10 text-amber-400 mx-auto animate-pulse mb-2" />
                      <div className="text-xs font-bold text-white">BLE & NFC Peer Mesh</div>
                      <div className="text-[10px] text-slate-400 mt-1">Transact without Internet</div>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-slate-800 flex justify-between">
                        <span className="text-slate-400">Mesh Voucher:</span>
                        <span className="text-white font-bold">₳ 45.00 AKD</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800 flex justify-between">
                        <span className="text-slate-400">Signature:</span>
                        <span className="text-emerald-400 font-bold">Ed25519 Verified ✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 4 Clean Benefit Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-400/50 hover:bg-white hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-bold">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                  {lang === 'ak' ? '၀% P2P အခမဲ့ငွေလွှဲခြင်း' : 'Zero-Fee P2P Transfers'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {lang === 'ak'
                    ? 'မည်သည့်ကြားခံအခကြေးငွေမျှမရှိဘဲ ဖုန်းနံပါတ် သို့မဟုတ် PeThar ID ဖြင့် ချက်ချင်းငွေလွှဲနိုင်ပါသည်။'
                    : 'Send money instantly to anyone with a phone number or PeThar ID with zero network commission.'}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-amber-400/50 hover:bg-white hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                  {lang === 'ak' ? '၁၀၀% ရွှေနှင့် ဒေါ်လာ အာမခံ' : '100% Backed Reserves'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {lang === 'ak'
                    ? 'အာရက္ခဒေါ်လာတိုင်းကို စစ်တွေနှင့် လန်ဒန်ဘဏ္ဍာတိုက်ရှိ ရွှေတုံးနှင့် အမေရိကန်ဒေါ်လာဖြင့် ကျောထောက်နောက်ခံပြုထားပါသည်။'
                    : 'Every Arakan Dollar is 100% collateralized with physical gold bullion and Tier-1 liquid USD escrow.'}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400/50 hover:bg-white hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                  {lang === 'ak' ? 'Arakan QR ကုန်သည်စနစ်' : 'Unified Arakan QR POS'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {lang === 'ak'
                    ? 'ဆိုင်များ၊ ကုန်သည်များနှင့် ဟိုတယ်များတွင် စကင်ဖတ်ရုံဖြင့် စက္ကန့်ပိုင်းအတွင်း ငွေလက်ခံနိုင်ပါသည်။'
                    : 'Scan and pay at retail shops, seafood markets, and hotels with zero terminal rental fees.'}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-sky-400/50 hover:bg-white hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 font-bold">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                  {lang === 'ak' ? 'နိုင်ငံတကာ ဗီဇာကတ်' : 'Multi-Currency Visa Card'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {lang === 'ak'
                    ? 'ကမ္ဘာတစ်ဝှမ်း သန်းနှင့်ချီသော ဆိုင်များတွင် အာရက္ခဒေါ်လာဖြင့် တိုက်ရိုက်သုံးစွဲနိုင်သည့် ဗီဇာကတ်။'
                    : 'Shop globally and withdraw cash at millions of Visa ATMs worldwide with zero currency markups.'}
                </p>
              </div>

            </div>
          </div>

          {/* ── CAPITECH 6-CARD BENTO: "FLEX YOUR DIGITAL WEALTH WITH PETHAR" (IMAGE 5 STYLE) ── */}
          <div className="mt-20 pt-16 border-t border-slate-100">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-mono font-bold text-pink-600 uppercase tracking-wider bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                {lang === 'ak' ? 'ဒစ်ဂျစ်တယ် ကြွယ်ဝမှု' : 'Flex Your Digital Wealth'}
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
                {lang === 'ak' ? 'ဖေ့သာဖြင့် သင်၏ ဒစ်ဂျစ်တယ် ကြွယ်ဝမှုကို စီမံပါ' : 'Flex Your Digital Wealth with PeThar'}
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Universal sovereignty, institutional security, and effortless consumer payments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Versatile Use */}
              <div className="p-6 rounded-3xl bg-slate-50/90 border border-slate-200/90 hover:border-pink-300 hover:bg-white hover:shadow-lg transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base text-slate-900 group-hover:text-pink-600 transition-colors">
                      Versatile Use
                    </span>
                    <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-mono font-bold text-xs">
                      01
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Use your digital card for online purchases, in-store merchant checkouts, international wires, and ATM cash globally.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  <span>Online, In-Store & Contactless</span>
                </div>
              </div>

              {/* Card 2: Accepted Everywhere */}
              <div className="p-6 rounded-3xl bg-slate-50/90 border border-slate-200/90 hover:border-indigo-300 hover:bg-white hover:shadow-lg transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Accepted Everywhere
                    </span>
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-mono font-bold text-xs">
                      02
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Our digital card and Arakan QR standard are accepted at any retail cashier that supports Visa, Mastercard, or AK QR.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>National Interoperability</span>
                </div>
              </div>

              {/* Card 3: Effortlessly Spend */}
              <div className="p-6 rounded-3xl bg-slate-50/90 border border-slate-200/90 hover:border-emerald-300 hover:bg-white hover:shadow-lg transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Effortlessly Spend
                    </span>
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-mono font-bold text-xs">
                      03
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Spend your digital assets with maximum fluidity. Zero fees on peer transfers and real-time Byzantine consensus in under 0.8s.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Zero Commissions · Instant</span>
                </div>
              </div>

              {/* Card 4: Easy Management */}
              <div className="p-6 rounded-3xl bg-slate-50/90 border border-slate-200/90 hover:border-sky-300 hover:bg-white hover:shadow-lg transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base text-slate-900 group-hover:text-sky-600 transition-colors">
                      Easy Management
                    </span>
                    <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-mono font-bold text-xs">
                      04
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Manage virtual cards, set spending limits, track savings goals, and audit reserve balances through our intuitive apps.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Web Banking & Mobile Sync</span>
                </div>
              </div>

              {/* Card 5: 24/7 Concierge Support */}
              <div className="p-6 rounded-3xl bg-slate-50/90 border border-slate-200/90 hover:border-purple-300 hover:bg-white hover:shadow-lg transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base text-slate-900 group-hover:text-purple-600 transition-colors">
                      24/7 Security & Support
                    </span>
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-mono font-bold text-xs">
                      05
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Our dedicated human team is standing by on Telegram and encrypted ticket channels, backed by hardware-grade Secure Enclave keys.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Telegram Concierge @petharsupport</span>
                </div>
              </div>

              {/* Card 6: Cold Storage & Reserves */}
              <div className="p-6 rounded-3xl bg-slate-50/90 border border-slate-200/90 hover:border-amber-300 hover:bg-white hover:shadow-lg transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                      Cold Storage & Bullion
                    </span>
                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-mono font-bold text-xs">
                      06
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    100% audited physical gold bullion reserves stored in secure bank vaults in Sittwe & London, backed 1:1 with liquid USD escrow.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>100% Collateralized & Audited</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: SMART FINANCIAL MANAGEMENT BENTO GRID (PAYNO IMAGE 3 SECTION 3)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="management" className="py-20 bg-slate-50/60 relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Interactive Dashboard
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              {lang === 'ak' ? 'စမတ် ဘဏ္ဍာရေး စီမံခန့်ခွဲမှု' : 'Smart Financial Management Made Simple'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Interactive tools designed to give you effortless control over every transaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            
            {/* Bento Card 1: Interactive Monthly Spending Bar Chart (Payno style) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Monthly Net Settlement Volume</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time ledger postings across Arakan</p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xl font-black text-indigo-600">₳ 56,750.00</div>
                    <div className="text-[10px] text-emerald-600 font-bold">+28.4% vs last period</div>
                  </div>
                </div>

                {/* Interactive Bar Chart */}
                <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-slate-100">
                  {chartData.map((item, idx) => (
                    <div
                      key={item.month}
                      onClick={() => setActiveChartMonth(idx)}
                      className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <div className="w-full flex items-end justify-center h-32">
                        <div
                          style={{ height: item.height }}
                          className={`w-full max-w-[36px] rounded-t-xl transition-all ${
                            activeChartMonth === idx
                              ? 'bg-indigo-600 shadow-md shadow-indigo-500/30'
                              : 'bg-slate-200 hover:bg-indigo-300'
                          }`}
                        />
                      </div>
                      <span className={`text-[11px] font-mono font-bold ${
                        activeChartMonth === idx ? 'text-indigo-600' : 'text-slate-400'
                      }`}>
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center text-xs font-mono text-slate-500">
                <span>Selected: {chartData[activeChartMonth].month}</span>
                <span className="font-bold text-slate-900">Total Volume: {chartData[activeChartMonth].volume}</span>
              </div>
            </div>

            {/* Bento Card 2: Interactive Currency Converter Widget (Payno/Paysoft style) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Instant Currency Exchange</h3>
                    <p className="text-xs text-slate-400">Guaranteed 0% fee mid-market rates</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    Live Parity
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-slate-400">You send</div>
                      <input
                        type="number"
                        value={exchangeAmount}
                        onChange={(e) => setExchangeAmount(e.target.value)}
                        className="bg-transparent text-xl font-black font-mono text-slate-900 outline-none w-32"
                      />
                    </div>
                    <select
                      value={fromCurr}
                      onChange={(e) => setFromCurr(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs cursor-pointer"
                    >
                      <option value="AKD">AKD (₳)</option>
                      <option value="USD">USD ($)</option>
                      <option value="THB">THB (฿)</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>

                  <div className="flex justify-center -my-2 relative z-10">
                    <button
                      type="button"
                      onClick={() => {
                        const temp = fromCurr
                        setFromCurr(toCurr)
                        setToCurr(temp)
                      }}
                      className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md hover:rotate-180 transition-transform cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-slate-400">You receive (0% Fee)</div>
                      <div className="text-xl font-black font-mono text-emerald-600">
                        {getExchangeResult()}
                      </div>
                    </div>
                    <select
                      value={toCurr}
                      onChange={(e) => setToCurr(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs cursor-pointer"
                    >
                      <option value="THB">THB (฿)</option>
                      <option value="AKD">AKD (₳)</option>
                      <option value="USD">USD ($)</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleOpenBankingClick}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Convert on Web Banking
              </button>
            </div>

            {/* Bento Card 3: Quick P2P Transfer Simulator */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 mb-1">Quick Send Money</h3>
                <p className="text-xs text-slate-400 mb-4">Transfer to citizens in seconds with zero fees</p>

                {/* Recipient Picker */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {['Ko Min Aung', 'Daw Nilar Win', 'Sittwe Central'].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setP2pRecipient(name)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition truncate cursor-pointer ${
                        p2pRecipient === name
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">Amount (AKD)</span>
                  <div className="flex items-center font-mono font-black text-lg text-slate-900">
                    <span>₳</span>
                    <input
                      type="text"
                      value={p2pAmount}
                      onChange={(e) => setP2pAmount(e.target.value)}
                      className="w-20 text-right bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {p2pTransferred ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                    <CheckCircle className="w-4 h-4" />
                    <span>Sent ₳ {p2pAmount} to {p2pRecipient} successfully!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSimulateP2p}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Send Instantly (0 Fee)
                  </button>
                )}
              </div>
            </div>

            {/* Bento Card 4: Recent Bills & Clearances */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 mb-1">Scheduled Bills & Subscriptions</h3>
                <p className="text-xs text-slate-400 mb-4">Auto-cleared essential utility payments</p>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">⚡</span>
                      <div>
                        <div className="font-bold text-slate-900">Starlink Satellite High-Speed</div>
                        <div className="text-[10px] text-slate-400">Monthly auto-renewal</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-slate-900">₳ 45.00</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">☀️</span>
                      <div>
                        <div className="font-bold text-slate-900">Arakan Solar Grid Micro-Power</div>
                        <div className="text-[10px] text-slate-400">Fixed rate tier</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-slate-900">₳ 28.50</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-mono text-slate-400">
                <span>Auto-Pay: Enabled</span>
                <span className="text-emerald-600 font-bold">Next settlement: Tomorrow</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: FLEXIBLE ACCOUNT TIERS (PAYNO IMAGE 3 SECTION 5)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="tiers" className="py-20 bg-white relative border-t border-slate-200/80">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Citizenship & Plans
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              {lang === 'ak' ? 'လူတိုင်းအတွက် သင့်တော်သော အကောင့်အဆင့်များ' : 'Flexible Plans Built for Everyone Globally'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Choose the tier that matches your personal, commercial, or enterprise transaction needs
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex p-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-bold mt-2">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
                  billingPeriod === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
                  billingPeriod === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Yearly (20% Off)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Tier 1: Digital Citizen */}
            <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="font-bold text-base text-slate-900">Digital Citizen</div>
                <p className="text-xs text-slate-500 mt-1">For everyday peer transfers and shopping</p>
                
                <div className="my-6">
                  <span className="text-4xl font-black font-mono text-slate-900">₳ 0</span>
                  <span className="text-xs text-slate-500 font-mono"> / forever</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Instant 0-fee P2P transfers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Arakan QR payment scanner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Daily limit up to ₳ 1,000</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Offline Bluetooth vouchers</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openAuth('signup')}
                className="mt-8 w-full py-3 rounded-2xl border border-slate-300 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Get Started Free
              </button>
            </div>

            {/* Tier 2: Verified National (Highlighted / Most Popular) */}
            <div className="bg-indigo-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-500 shadow-2xl flex flex-col justify-between relative transform lg:-translate-y-2">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                Most Popular
              </span>

              <div>
                <div className="font-bold text-base text-white">Verified National</div>
                <p className="text-xs text-indigo-200 mt-1">For power users, diaspora remittances & cards</p>
                
                <div className="my-6">
                  <span className="text-4xl font-black font-mono text-white">
                    {billingPeriod === 'monthly' ? '₳ 5' : '₳ 48'}
                  </span>
                  <span className="text-xs text-indigo-300 font-mono"> / {billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                </div>

                <ul className="space-y-3 text-xs text-indigo-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>All Digital Citizen features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>International Visa Platinum card</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Daily limit up to ₳ 25,000</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>0% fee physical cash agent withdrawals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Priority Telegram/Email concierge</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openAuth('signup')}
                className="mt-8 w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer"
              >
                Join Verified National
              </button>
            </div>

            {/* Tier 3: Merchant & Enterprise */}
            <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="font-bold text-base text-slate-900">Merchant & Enterprise</div>
                <p className="text-xs text-slate-500 mt-1">For retailers, exporters & volume commerce</p>
                
                <div className="my-6">
                  <span className="text-4xl font-black font-mono text-slate-900">
                    {billingPeriod === 'monthly' ? '₳ 25' : '₳ 240'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono"> / {billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Unlimited transaction volume</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Smart Arakan QR POS cashier system</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Multi-cashier sub-accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>REST API & Webhooks developer access</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openAuth('signup')}
                className="mt-8 w-full py-3 rounded-2xl border border-slate-300 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Start Merchant Account
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: CUSTOMER REVIEWS & STORIES (PAYNO IMAGE 3 SECTION 6)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-20 bg-slate-50/60 relative">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Community Voices
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              {lang === 'ak' ? 'ပြည်သူများနှင့် ကုန်သည်များ၏ သဘောထား' : 'Trusted by Smart Investors and Everyday Savers'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Real stories from across Sittwe, Mrauk-U, Kyaukphyu, and our global diaspora
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "PeThar Pay completely revolutionized how we run our seafood wholesale shop in Sittwe. Zero fees on Arakan QR and instant funds mean we can pay fishermen on the spot."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                  alt="Ko Min Aung"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Ko Min Aung</div>
                  <div className="text-[10px] text-slate-400 font-mono">Seafood Wholesaler · Sittwe Port</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "During local internet cutoffs, the offline BLE mesh payment was a lifesaver. My customers can still pay their guest-house bills without waiting for telecom restoration."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80"
                  alt="Daw Nilar Win"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Daw Nilar Win</div>
                  <div className="text-[10px] text-slate-400 font-mono">Hotelier · Mrauk-U Heritage Resort</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "Sending money home from London took minutes instead of days through expensive bank wires. My family in Arakan received exact AKD backed 1:1 with USD."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
                  alt="U Kyaw Zan Hla"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">U Kyaw Zan Hla</div>
                  <div className="text-[10px] text-slate-400 font-mono">Diaspora Contributor · London UK</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: SECURITY & PRIVACY POLICY COMPLIANCE (id="security")
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="security" className="py-20 bg-white border-t border-slate-200/90 relative">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-bold border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official Regulatory & Privacy Compliance Disclosures</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {lang === 'ak'
                ? 'PeThar ကိုယ်ရေးအချက်အလက်နှင့် လုံခြုံရေး မူဝါဒ (Privacy Policy)'
                : 'PeThar Application Privacy Policy & Security Disclosures'}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {lang === 'ak'
                ? 'PeThar (ဖေ့သာ) သည် သုံးစွဲသူများ၏ ကိုယ်ရေးအချက်အလက်နှင့် ငွေကြေးလုံခြုံမှုကို အမြင့်ဆုံးကာကွယ်ထားပါသည်။ Google Sign-In ဖြင့် ဝင်ရောက်အသုံးပြုသူများ၏ ဒေတာရယူမှု၊ အသုံးပြုမှု၊ လုံခြုံရေးစာဝှက်စနစ်နှင့် ဒေတာဖျက်သိမ်းခွင့်များကို အောက်တွင် အသေးစိတ် ဖော်ပြထားပါသည်။'
                : 'PeThar ("PeThar Wallet", "PeThar Mobile", operated by PeThar Financial Technologies at pethar.co.uk) strictly protects user confidentiality, data integrity, and digital rights. This policy details how our application accesses, uses, protects, and deletes Google user data and account information in full compliance with the Google API Services User Data Policy.'}
            </p>

            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
              <div><strong className="text-slate-800">App Name:</strong> PeThar</div>
              <div><strong className="text-slate-800">Developer:</strong> PeThar Financial Technologies</div>
              <div><strong className="text-slate-800">Verified Domain:</strong> pethar.co.uk</div>
              <div><strong className="text-slate-800">Effective Date:</strong> October 14, 2026</div>
              <div><strong className="text-slate-800">Audit Status:</strong> Verified & Active</div>
            </div>
          </div>

          {/* Golden Notice Box - Google Limited Use Compliance */}
          <div className="bg-amber-500/10 rounded-2xl p-6 sm:p-8 border border-amber-500/30">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500 text-slate-950 rounded-xl font-black shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-amber-950">
                  Google API Services User Data Policy Compliance Statement
                </h3>
                <p className="text-sm text-amber-900 leading-relaxed font-sans">
                  <strong>PeThar's use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold text-amber-950 hover:text-amber-800 inline-flex items-center gap-1"
                  >
                    Google API Services User Data Policy
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>, including the Limited Use requirements.</strong>
                </p>
                <p className="text-xs text-amber-800/90 leading-relaxed">
                  All Google user data accessed by PeThar is used exclusively to provide and improve user-facing features (account sign-in, profile identification, and wallet security). We do not transfer, disclose, or sell Google user data to data brokers, advertising networks, or third parties for training non-personalized AI/ML models.
                </p>
              </div>
            </div>
          </div>

          {/* Cards Grid: Sections 1 to 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Card 1: Data Accessed & Collected */}
            <div className="liquid-glass-card-light rounded-2xl p-6 sm:p-7 border border-slate-200/90 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-700">
                  <UserCheck className="w-5 h-5 text-sky-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {lang === 'ak' ? '၁။ ရယူစုဆောင်းသော ဒေတာများ' : '1. Data Accessed & Collected'}
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li>
                  <strong className="text-slate-900">Google Account Profile:</strong> Display name, profile avatar URL, and verified primary email address accessed via Google OAuth 2.0 (<code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded font-mono">email</code> and <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded font-mono">profile</code> scopes).
                </li>
                <li>
                  <strong className="text-slate-900">Unique User Identifier:</strong> Immutable Google user identifier token (<code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded font-mono">sub</code> / Firebase UID) to authenticate sessions without storing user passwords.
                </li>
                <li>
                  <strong className="text-slate-900">Phone & Credentials:</strong> Phone number collected strictly for one-time SMS passcodes when Phone Authentication is selected.
                </li>
                <li>
                  <strong className="text-slate-900">Public Wallet Address & Ledger Records:</strong> Ed25519 public addresses and transaction records (amounts in AKD, USD, timestamps, and hashes). <span className="font-semibold text-emerald-800">Private keys never leave your device's Secure Enclave / Keystore.</span>
                </li>
              </ul>
            </div>

            {/* Card 2: How We Use Your Data */}
            <div className="liquid-glass-card-light rounded-2xl p-6 sm:p-7 border border-slate-200/90 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {lang === 'ak' ? '၂။ ဒေတာ အသုံးပြုမှု ရည်ရွယ်ချက်များ' : '2. Purpose of Data Processing'}
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li>
                  <strong className="text-slate-900">Authentication & Account Provisioning:</strong> Authenticating user identity, establishing encrypted sessions, and managing active wallet credentials.
                </li>
                <li>
                  <strong className="text-slate-900">Service Delivery & Sync:</strong> Displaying account balances, synchronizing peer-to-peer transfers, offline BLE mesh vouchers, and Arakan QR invoices.
                </li>
                <li>
                  <strong className="text-slate-900">Security & Anti-Fraud:</strong> Monitoring unauthorized login attempts, safeguarding user assets against phishing, and enforcing rate limiting.
                </li>
                <li>
                  <strong className="text-slate-900">Customer Support:</strong> Providing prompt responses to user support queries received at <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded font-mono">contact@pethar.co.uk</code> or <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded font-mono">pethar-app@protonmail.com</code>.
                </li>
              </ul>
            </div>

            {/* Card 3: Strict Prohibitions & Permitted Use Limits */}
            <div className="liquid-glass-card-light rounded-2xl p-6 sm:p-7 border border-slate-200/90 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-700">
                  <Lock className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {lang === 'ak' ? '၃။ တားမြစ်ချက်များနှင့် ကန့်သတ်ချက်များ' : '3. Strict Prohibitions & Limited Use'}
                </h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>No Data Brokers:</strong> We never sell, rent, or trade Google user data or personal data to data brokers or resellers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>No Targeted Advertising:</strong> We never use user data for targeted ads, personalized advertisements, or retargeting campaigns.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>No Credit Scoring:</strong> We never use Google user data to evaluate creditworthiness or for consumer lending.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>No Non-Personalized AI/ML:</strong> Data from Google APIs is never used to develop or train non-personalized AI/ML models.</span>
                </li>
              </ul>
            </div>

            {/* Card 4: Third-Party Disclosures & Sub-Processors */}
            <div className="liquid-glass-card-light rounded-2xl p-6 sm:p-7 border border-slate-200/90 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-700">
                  <Server className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {lang === 'ak' ? '၄။ ပြင်ပသို့ မျှဝေခြင်းနှင့် အခြေခံစနစ်' : '4. Third Parties & Sub-Processors'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                "We do not transfer or disclose your information to third parties for purposes other than providing the PeThar services." Data is transferred only to trusted infrastructure providers:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li>
                  <strong className="text-slate-900">Google Cloud & Firebase:</strong> Backend hosting, Firebase Authentication, Cloud Firestore databases, and Cloud Storage with enterprise SOC2/ISO 27001 data center certifications.
                </li>
                <li>
                  <strong className="text-slate-900">SMS Telecom Gateways:</strong> Exclusively for dispatching one-time OTP verification passcodes for phone login.
                </li>
                <li>
                  <strong className="text-slate-900">Legal Mandates:</strong> Disclosed only if required by a valid judicial subpoena or applicable law.
                </li>
              </ul>
            </div>

            {/* Card 5: Security & Cryptographic Mechanisms */}
            <div className="liquid-glass-card-light rounded-2xl p-6 sm:p-7 border border-slate-200/90 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700">
                  <Cpu className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {lang === 'ak' ? '၅။ စာဝှက်စနစ်နှင့် နည်းပညာလုံခြုံရေး' : '5. Security Procedures & Encryption'}
                </h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li>
                  <strong className="text-slate-900">Encryption in Transit:</strong> End-to-end TLS 1.3 / HTTPS encryption for all client-server communications.
                </li>
                <li>
                  <strong className="text-slate-900">Encryption at Rest:</strong> AES-256 cloud database encryption; local client databases secured via SQLCipher AES-256.
                </li>
                <li>
                  <strong className="text-slate-900">Hardware Keystore:</strong> Private keys generated and isolated inside Apple Secure Enclave & Android Keystore, guarded by biometric Face ID.
                </li>
                <li>
                  <strong className="text-slate-900">Access Control:</strong> Granular Firebase Security Rules ensuring tenant-isolated database access.
                </li>
              </ul>
            </div>

            {/* Card 6: Data Retention & User Deletion Rights */}
            <div className="liquid-glass-card-light rounded-2xl p-6 sm:p-7 border border-slate-200/90 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-700">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {lang === 'ak' ? '၆။ ဒေတာ ထိန်းသိမ်းခြင်းနှင့် ဖျက်သိမ်းခွင့်' : '6. Data Retention & Deletion Rights'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We retain your personal information only for the length of time needed to fulfill the purposes outlined in this privacy policy unless a longer retention period is required by law.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <div className="font-bold text-slate-900">How to Delete Your Account and Data:</div>
                <div>1. <strong>In-App:</strong> Navigate to <em>Profile → Settings → Delete Account</em>.</div>
                <div>2. <strong>By Email:</strong> Email <a href="mailto:privacy@pethar.co.uk" className="text-amber-700 font-bold underline">privacy@pethar.co.uk</a> with subject "Data Deletion Request".</div>
                <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-200/70">
                  <strong>Timeline:</strong> All Google user profile data is permanently purged from active Firebase Authentication and Firestore within <strong>30 days</strong>.
                </div>
              </div>
            </div>

          </div>

          {/* Standalone Link */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-600">
              Need a standalone official copy of our complete legal agreement and regulatory terms?
            </div>
            <a
              href="/privacy"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>View Standalone Privacy Page (/privacy)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7: TRUST METRICS & CTA BANNER (CAPITECH & PAYNO STYLE)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-white to-sky-50 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-16">
          
          {/* Capitech Global Trust Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 border-b border-slate-200/80 text-center font-mono">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900">50+</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">Arakan Townships</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900">50,000+</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">Ledger Transits</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900">3M+</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">Mesh Signatures</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center justify-center gap-1">
                5.0 <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">User Satisfaction</div>
            </div>
          </div>

          {/* Capitech GO DIGITAL NOW! Callout Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-14 border border-indigo-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-xl relative z-10 space-y-4">
              <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                GO DIGITAL NOW!
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {lang === 'ak' ? 'သင်၏ ဘဏ္ဍာရေး အနာဂတ်ကို ယခုပင် စတင်ထိန်းချုပ်ပါ' : 'Take Full Control of Your Financial Future'}
              </h2>
              <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed">
                Join tens of thousands of citizens, merchants, and diaspora families using PeThar for daily commerce and sovereign wealth protection.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => openAuth('signup')}
                  className="px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 cursor-pointer font-mono"
                >
                  Create Account Free →
                </button>
                <button
                  onClick={handleOpenBankingClick}
                  className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer font-mono"
                >
                  Launch Web Banking
                </button>
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 text-xs font-mono text-indigo-300">
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10">
                <Apple className="w-5 h-5 text-white" />
                <span>iOS App Store</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span>Android APK</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 8: EXPANSIVE FINTECH FOOTER WITH LARGE BRAND WATERMARK
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-200 bg-slate-100/90 pt-16 pb-12 text-xs text-slate-500 font-mono relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            
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
                <span>Ledger Operational & Audited</span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <div className="font-bold text-slate-800 mb-3 uppercase tracking-wider">{lang === 'ak' ? 'ဝန်ဆောင်မှုများ' : 'Product & Services'}</div>
              <ul className="space-y-2">
                <li><a href="#overview" className="hover:text-slate-900 transition-colors">Instant P2P Transfers</a></li>
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Arakan QR (AK QR)</a></li>
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Offline BLE Mesh Pay</a></li>
                <li><a href="#management" className="hover:text-slate-900 transition-colors">Currency Exchange</a></li>
                <li><a href="#tiers" className="hover:text-slate-900 transition-colors">Account Tiers</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <div className="font-bold text-slate-800 mb-3 uppercase tracking-wider">{lang === 'ak' ? 'လုံခြုံရေးနှင့် ဥပဒေ' : 'Security & Policy'}</div>
              <ul className="space-y-2">
                <li><a href="#security" className="hover:text-slate-900 transition-colors">Privacy Policy (#security)</a></li>
                <li><a href="#security" className="hover:text-slate-900 transition-colors">Google OAuth Disclosures</a></li>
                <li><a href="#security" className="hover:text-slate-900 transition-colors">Data Retention & Deletion</a></li>
                <li><a href="/privacy" className="hover:text-slate-900 transition-colors">Dedicated Policy (/privacy)</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <div className="font-bold text-slate-800 mb-3 uppercase tracking-wider">{lang === 'ak' ? 'ဆက်သွယ်ရန်' : 'Support & Contact'}</div>
              <div className="space-y-2.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Email:</span>
                  <a
                    href="mailto:pethar-app@protonmail.com"
                    className="text-amber-700 font-bold hover:underline flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>pethar-app@protonmail.com</span>
                  </a>
                </div>
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
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
            <div>© 2026 PeThar (ဖေ့သာ). All rights reserved.</div>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:text-slate-800">Privacy Policy</a>
              <span>•</span>
              <a href="#security" className="hover:text-slate-800">Limited Use Disclosures</a>
              <span>•</span>
              <a href="#security" className="hover:text-slate-800">Data Deletion</a>
            </div>
          </div>
        </div>

        {/* Large Brand Watermark at Bottom (Just like Payno in Image 3!) */}
        <div className="text-center pt-8 overflow-hidden">
          <div className="footer-watermark font-black tracking-tighter">
            PETHAR
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
