import { useState, useEffect, useRef } from 'react'
import { ArakanEmblem, FlagArakan, FlagInternational } from '../components/ArakanEmblem'
import type { Language } from '../i18n'
import {
  Globe, Smartphone, ArrowRight, Download, Apple, Lock,
  ChevronDown, Send, Menu, X,
  Building2, Store, Terminal, CheckCircle,
  PhoneCall, Radio, ArrowUpRight,
  Wallet, Database, KeyRound, FileText, Check
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
  colorClass = 'text-white',
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
    <div ref={ref} className="liquid-glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/5 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
      <div className={`text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold font-mono tracking-tight ${colorClass}`}>
        {formatValue ? formatValue(count) : count.toLocaleString()}
      </div>
      <div className="text-xs font-bold text-white/90 mt-1">
        {label}
      </div>
      {sublabel && (
        <div className="text-[11px] font-mono text-white/45 mt-0.5">
          {sublabel}
        </div>
      )}
    </div>
  )
}

/* ─── Scroll Reveal Hook ─────────────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

/* ─── Section Reveal Wrapper ─────────────────────────────────────────── */
function RevealSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number
}) {
  const { ref, isVisible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ─── Marquee Component ──────────────────────────────────────────────── */
function Marquee({ children, speed = 35 }: { children: React.ReactNode; speed?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap mask-marquee">
      <div
        className="inline-flex animate-marquee items-center"
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        {children}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
    PROFESSIONAL FINTECH PLATFORM WEBSITE
═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage({
  onEnterApp,
  onOpenBanking,
  lang = 'ak',
  setLang,
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState<'transfers' | 'merchants' | 'remittance' | 'offline'>('transfers')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPin, setLoginPin] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleOpenBankingClick = () => {
    if (onOpenBanking) {
      onOpenBanking()
    } else if (onEnterApp) {
      onEnterApp()
    }
  }

  const navMenuItems = [
    { label: lang === 'ak' ? 'ပင်မ' : 'Overview', href: '#overview' },
    { label: lang === 'ak' ? 'ဘဏ္ဍာရေးဝန်ဆောင်မှုများ' : 'Services', href: '#services' },
    { label: lang === 'ak' ? 'ကုန်သည်စနစ်' : 'Merchants', href: '#merchants' },
    { label: lang === 'ak' ? 'အော့ဖ်လိုင်းနည်းပညာ' : 'Offline Protocol', href: '#offline' },
    { label: lang === 'ak' ? 'ငွေကြေးစနစ်' : 'Currency & Ledger', href: '#currency' },
    { label: lang === 'ak' ? 'ဒေါင်းလုဒ်' : 'Download', href: '#download' },
    { label: lang === 'ak' ? 'လုံခြုံရေး' : 'Security', href: '#security' },
  ]

  return (
    <div className="min-h-screen text-[#F1F0E0] overflow-x-hidden selection:bg-red-700/60 selection:text-white font-sans relative bg-[#06090E]">

      {/* ── AMBIENT RESTRAINED GLASS GRADIENT BACKDROP ───────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[25%] w-[600px] h-[600px] rounded-full bg-red-700/[0.08] blur-[160px] animate-pulse-glow" />
        <div className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-500/[0.06] blur-[150px] animate-float-slow" />
        <div className="absolute bottom-[10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-blue-600/[0.05] blur-[170px] animate-float-reverse" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ENTERPRISE COMMUNICATIONS & NOTICE BAR
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-50 border-b border-white/[0.08] bg-black/70 backdrop-blur-xl text-[11px] font-mono tracking-wider py-1.5 px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Support Line & Inquiries */}
          <div className="flex items-center gap-4 text-white/70">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white/40 font-bold uppercase">{lang === 'ak' ? 'အကူအညီ' : 'Support'}:</span>
              <a href="tel:+959798112334" className="text-white hover:text-amber-300 transition-colors font-bold">+95 9 798 112 334</a>
            </div>
            <div className="hidden md:inline-block w-[1px] h-3 bg-white/20" />
            <div className="hidden md:flex items-center gap-1.5 text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{lang === 'ak' ? 'အာရက္ခဒေသတွင်း ဘဏ္ဍာရေးနည်းပညာစနစ်' : 'PeThar Financial Infrastructure Platform'}</span>
            </div>
          </div>

          {/* Currency Reference + Language Selector + Theme Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-[10px] text-white/60 bg-white/[0.04] px-3 py-0.5 rounded-full border border-white/10">
              <span className="text-amber-400 font-bold">1 AKD = 1.00 USDT (Target Parity)</span>
              <span className="text-white/30">•</span>
              <span className="text-emerald-400">THB 35.80</span>
              <span className="text-white/30">•</span>
              <span className="text-cyan-400">MYR 4.72</span>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center bg-white/[0.06] border border-white/10 rounded-full p-0.5">
              <button
                onClick={() => setLang && setLang('ak')}
                className={`flex items-center justify-center p-1.5 rounded-full transition-all ${
                  lang === 'ak' ? 'bg-red-700 text-white shadow-sm' : 'text-white/60 hover:text-white'
                }`}
                title="ရခိုင်ဘာသာ"
                aria-label="ရခိုင်ဘာသာ"
              >
                <FlagArakan size={15} />
              </button>
              <button
                onClick={() => setLang && setLang('en')}
                className={`flex items-center justify-center p-1.5 rounded-full transition-all ${
                  lang === 'en' ? 'bg-blue-700 text-white shadow-sm' : 'text-white/60 hover:text-white'
                }`}
                title="English"
                aria-label="English"
              >
                <FlagInternational size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          STICKY LIQUID GLASS NAVIGATION BAR
      ═══════════════════════════════════════════════════════════════════ */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#090D14]/90 backdrop-blur-2xl border-b border-white/[0.12] shadow-2xl shadow-black/60'
          : 'bg-[#090D14]/60 backdrop-blur-md border-b border-white/[0.05]'
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-[72px] flex items-center justify-between">
          {/* Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-600/30 blur-md group-hover:scale-110 transition-transform" />
              <ArakanEmblem size={36} variant="badge" className="relative drop-shadow" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black tracking-tight text-white font-sans">PeThar</span>
                <span className="text-xs font-mono font-bold text-amber-400">FINTECH</span>
              </div>
              <p className="text-[10px] text-white/45 hidden sm:block font-sans -mt-0.5">
                {lang === 'ak' ? 'အာရက္ခဒစ်ဂျစ်တယ် ဘဏ္ဍာရေးကွန်ရက်' : 'Arakan Digital Financial Infrastructure'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 font-mono text-[12px] tracking-wide">
            {navMenuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative px-3.5 py-2 text-white/65 hover:text-white transition-colors group rounded-xl hover:bg-white/[0.04]"
              >
                <span>{item.label}</span>
                <span className="absolute bottom-1 left-3.5 right-3.5 h-[1.5px] bg-gradient-to-r from-red-500 to-amber-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/75 hover:text-white px-3.5 py-2 rounded-xl border border-white/10 hover:bg-white/[0.06] transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ak' ? 'အကောင့်ဝင်ရန်' : 'Portal Login'}</span>
            </button>

            <button
              onClick={handleOpenBankingClick}
              className="liquid-glass-pill px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 shadow-lg active:scale-95 group"
            >
              <span>{lang === 'ak' ? 'ဝဘ်ဘဏ်လုပ်ငန်း' : 'Web Banking'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white rounded-xl bg-white/[0.05]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A0D14]/95 backdrop-blur-2xl border-b border-white/[0.1] px-6 py-6 space-y-3 font-mono text-xs">
            {navMenuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 text-white/70 hover:text-white border-b border-white/[0.04]"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); setShowLoginModal(true) }}
                className="w-full py-3 text-center border border-white/10 rounded-xl text-white/80"
              >
                {lang === 'ak' ? 'အကောင့်ဝင်ရန်' : 'Portal Login'}
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleOpenBankingClick() }}
                className="w-full py-3 text-center bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold rounded-xl"
              >
                {lang === 'ak' ? 'ဝဘ်ဘဏ်လုပ်ငန်း စတင်ရန်' : 'Launch Online Banking'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: HERO MONUMENT (FINTECH BRAND ARCHITECTURE)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="overview" className="relative pt-16 pb-24 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left 7 Columns: Product Statement & Actions */}
            <div className="lg:col-span-7 text-left space-y-6">
              <RevealSection delay={0}>
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full liquid-glass-pill border border-white/15 text-xs font-mono tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white/80 font-bold">DIGITAL FINANCIAL RAILS FOR ARAKAN</span>
                  <span className="text-white/30">•</span>
                  <span className="text-amber-300 font-bold">ONLINE & OFFLINE RESILIENT</span>
                </div>
              </RevealSection>

              <RevealSection delay={100}>
                <h1 className="text-[clamp(2.5rem,5.2vw,4.5rem)] font-extrabold tracking-[-0.03em] leading-[1.08]">
                  <span className="block text-white">
                    {lang === 'ak' ? 'အာရက္ခဒေသတွင်း ခေတ်မီ' : 'Modern Financial Rails'}
                  </span>
                  <span className="block bg-gradient-to-r from-red-500 via-amber-300 to-amber-500 bg-clip-text text-transparent font-serif italic font-normal text-[clamp(2.75rem,5.8vw,5rem)]">
                    {lang === 'ak' ? 'ဒစ်ဂျစ်တယ်ငွေပေးချေမှုစနစ်' : 'for Families, Merchants & Enterprise'}
                  </span>
                </h1>
              </RevealSection>

              <RevealSection delay={200}>
                <p className="text-base sm:text-lg text-white/65 max-w-xl leading-relaxed">
                  {lang === 'ak'
                    ? 'ဖေ့သာ (PeThar) သည် မြန်ဆန်၍ လုံခြုံစိတ်ချရသော ဒစ်ဂျစ်တယ်ငွေလွှဲခြင်း၊ ဈေးဆိုင်သုံး Arakan QR (AK QR) ငွေရှင်းစနစ်၊ ဒေသတွင်းငွေလွှဲစင်္ကြံများနှင့် ဆက်သွယ်ရေးပြတ်တောက်ချိန်တွင် အသုံးပြုနိုင်သည့် အော့ဖ်လိုင်းငွေပေးချေမှု နည်းပညာများကို ထောက်ပံ့ပေးပါသည်။'
                    : 'PeThar provides reliable digital payment infrastructure across Arakan. Enabling instant peer-to-peer transfers, zero-fee merchant QR checkout, regional remittance corridors, and cryptographic offline transaction resilience.'}
                </p>
              </RevealSection>

              {/* Primary Call to Action Buttons */}
              <RevealSection delay={300}>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={handleOpenBankingClick}
                    className="liquid-glass-pill px-7 py-4 rounded-2xl text-sm font-bold text-white flex items-center gap-2.5 shadow-xl hover:scale-105 active:scale-95 transition"
                  >
                    <span>{lang === 'ak' ? 'ဝဘ်ဘဏ်လုပ်ငန်း စတင်ရန်' : 'Open Online Banking Portal'}</span>
                    <ArrowRight size={17} className="text-amber-400" />
                  </button>

                  <a
                    href="#download"
                    className="px-6 py-4 rounded-2xl border border-white/15 hover:bg-white/[0.05] text-white/85 font-mono text-xs uppercase tracking-wider transition flex items-center gap-2"
                  >
                    <Download size={15} />
                    <span>{lang === 'ak' ? 'အက်ပ် ရယူရန်' : 'Download Mobile App'}</span>
                  </a>
                </div>
              </RevealSection>

              {/* Trust Indicators */}
              <RevealSection delay={400}>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.08] max-w-lg font-mono">
                  <div>
                    <div className="text-sm font-bold text-emerald-400">&lt; 250 ms</div>
                    <div className="text-[10px] text-white/40 uppercase mt-0.5">Instant Finality</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-400">0% Domestic Fees</div>
                    <div className="text-[10px] text-white/40 uppercase mt-0.5">P2P & Merchant QR</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-cyan-400">Ed25519 Signed</div>
                    <div className="text-[10px] text-white/40 uppercase mt-0.5">Offline Vouchers</div>
                  </div>
                </div>
              </RevealSection>
            </div>

            {/* Right 5 Columns: Desktop Platform Architecture Card (NOT a mobile phone mockup) */}
            <div className="lg:col-span-5">
              <RevealSection delay={200}>
                <div className="liquid-glass-card rounded-[32px] p-6 sm:p-7 border border-white/15 relative overflow-hidden shadow-2xl backdrop-blur-2xl">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-5 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
                        <Terminal size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">PeThar Settlement Core</div>
                        <div className="text-[10px] font-mono text-white/40">Append-Only Double-Entry Ledger</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      OPERATIONAL
                    </span>
                  </div>

                  {/* Multi-Currency Board */}
                  <div className="py-5 space-y-3 font-mono">
                    <div className="text-[10px] uppercase text-white/40 tracking-wider">
                      Settlement Unit Configuration
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <div>
                          <div className="text-xs font-bold text-white">Arakan Dollar (AKD)</div>
                          <div className="text-[10px] text-white/40">Primary Digital Accounting Unit</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-amber-300">1.00 USDT</div>
                        <div className="text-[9px] text-emerald-400">Target Peg</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div>
                          <div className="text-xs font-bold text-white">Thailand PromptPay Corridor</div>
                          <div className="text-[10px] text-white/40">Direct Regional Settlement</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-white">35.80 THB</div>
                        <div className="text-[9px] text-white/40">Live Spot</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <div>
                          <div className="text-xs font-bold text-white">Offline Mesh Relay</div>
                          <div className="text-[10px] text-white/40">NFC & BLE Protocol Buffer</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-cyan-300">Active</div>
                        <div className="text-[9px] text-white/40">Anti-Replay</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Bar */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-white/40">Node Sync: Block #948,124</span>
                    <button
                      onClick={handleOpenBankingClick}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
                    >
                      <span>Launch Dashboard</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </RevealSection>
            </div>

          </div>
        </div>
      </section>

      {/* ─── REGIONAL HUBS & CORRIDORS MARQUEE ───────────────────────────── */}
      <div className="border-y border-white/[0.08] bg-black/50 backdrop-blur-xl py-3.5 overflow-hidden">
        <Marquee speed={32}>
          <div className="flex items-center gap-12 font-mono text-xs text-white/50 uppercase tracking-widest px-6">
            <span className="flex items-center gap-2 text-white/80 font-bold">
              <ArakanEmblem size={16} variant="badge" /> PeThar Network
            </span>
            <span>•</span>
            <span className="text-amber-400 font-bold">Sittwe Central Hub</span>
            <span>•</span>
            <span>Mrauk-U Regional Desk</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">Kyaukpyu Port Corridor</span>
            <span>•</span>
            <span>Thandwe & Ramree Outlets</span>
            <span>•</span>
            <span className="text-cyan-400 font-bold">PromptPay Thailand Direct</span>
            <span>•</span>
            <span>Malaysia DuitNow Corridor</span>
            <span>•</span>
            <span className="text-purple-400 font-bold">USDT Liquidity Integration</span>
            <span>•</span>
            <span>Starlink Blackout Bridge</span>
            <span>•</span>
          </div>
        </Marquee>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: FOUR CORE FINANCIAL PILLARS
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="services" className="py-24 relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <RevealSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-red-400 font-bold">
                FINANCIAL TECHNOLOGY SERVICES
              </span>
              <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] font-extrabold text-white tracking-tight mt-1">
                {lang === 'ak' ? 'အဓိက ဘဏ္ဍာရေးဝန်ဆောင်မှုများ' : 'Comprehensive Financial Services'}
              </h2>
              <p className="text-white/50 text-base mt-2">
                {lang === 'ak'
                  ? 'ပြည်တွင်းငွေလွှဲခြင်း၊ ဈေးဆိုင်ငွေရှင်းစနစ်၊ နိုင်ငံတကာငွေလွှဲနှင့် အော့ဖ်လိုင်း ဆက်သွယ်ရေးပြတ်တောက်မှု ကာကွယ်ရေး'
                  : 'Practical, low-latency financial tools designed for day-to-day transactions and business growth.'}
              </p>

              {/* Pillar Category Tabs */}
              <div className="mt-8 inline-flex p-1.5 rounded-full liquid-glass border border-white/15 max-w-full overflow-x-auto">
                {[
                  { id: 'transfers' as const, label: lang === 'ak' ? 'ငွေလွှဲစနစ်' : 'P2P Transfers' },
                  { id: 'merchants' as const, label: lang === 'ak' ? 'ကုန်သည် POS' : 'Merchant POS' },
                  { id: 'remittance' as const, label: lang === 'ak' ? 'နိုင်ငံတကာငွေလွှဲ' : 'Cross-Border' },
                  { id: 'offline' as const, label: lang === 'ak' ? 'အော့ဖ်လိုင်းစနစ်' : 'Offline Protocol' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-bold transition ${
                      activeTab === t.id
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* Service Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: P2P Transfers */}
            <RevealSection delay={0}>
              <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                    <Send size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {lang === 'ak' ? 'ချက်ချင်း ငွေလွှဲခြင်း' : 'Instant P2P Transfers'}
                  </h3>
                  <p className="text-xs text-white/55 leading-relaxed">
                    {lang === 'ak'
                      ? 'ဖုန်းနံပါတ် သို့မဟုတ် PeThar ID ဖြင့် စက္ကန့်ပိုင်းအတွင်း ၀% ငွေလွှဲခဖြင့် ချက်ချင်း လွှဲပို့နိုင်ပါသည်'
                      : 'Send Arakan Dollars instantly to any phone number or citizen identifier with zero transaction fees.'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-amber-400">
                  Sub-second settlement
                </div>
              </div>
            </RevealSection>

            {/* Card 2: Merchant Solutions */}
            <RevealSection delay={100}>
              <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-5">
                    <Store size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {lang === 'ak' ? 'Arakan QR ကုန်သည်စနစ်' : 'Merchant POS & AK QR'}
                  </h3>
                  <p className="text-xs text-white/55 leading-relaxed">
                    {lang === 'ak'
                      ? 'လက်လီဆိုင်များနှင့် လုပ်ငန်းများအတွက် ၀% ကတ်ဖြတ်ခနှင့် ချက်ချင်း စာရင်းဝင်သည့် POS စနစ်'
                      : 'Touchscreen cashier terminals and static QR stands with zero card processing fees for retailers.'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-red-400">
                  0% Swipe Fee
                </div>
              </div>
            </RevealSection>

            {/* Card 3: Regional Remittance */}
            <RevealSection delay={200}>
              <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                    <Globe size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {lang === 'ak' ? 'ဒေသတွင်း နိုင်ငံတကာငွေလွှဲ' : 'Regional Remittance'}
                  </h3>
                  <p className="text-xs text-white/55 leading-relaxed">
                    {lang === 'ak'
                      ? 'ထိုင်း PromptPay၊ မလေး DuitNow နှင့် စင်ကာပူတို့မှတစ်ဆင့် မြို့နယ်ရှိ မိသားစုထံ တိုက်ရိုက်ငွေလွှဲပါ'
                      : 'Direct worker remittance corridors from Thailand, Malaysia, and Singapore with live transparent rates.'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-cyan-400">
                  PromptPay / DuitNow Direct
                </div>
              </div>
            </RevealSection>

            {/* Card 4: Offline Resilience */}
            <RevealSection delay={300}>
              <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                    <Radio size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {lang === 'ak' ? 'အော့ဖ်လိုင်း ဆက်သွယ်ရေးကာကွယ်မှု' : 'Offline Payment Protocol'}
                  </h3>
                  <p className="text-xs text-white/55 leading-relaxed">
                    {lang === 'ak'
                      ? 'ဖုန်းလိုင်းနှင့် အင်တာနက် ပြတ်တောက်နေချိန်တွင် NFC နှင့် Bluetooth ဖြင့် အတည်ပြု ပေးချေနိုင်ပါသည်'
                      : 'Cryptographically signed vouchers enable device-to-device payments during telecommunication blackouts.'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400">
                  Ed25519 & Replay Resistant
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: CURRENCY ARCHITECTURE & AKD-USDT DISCLOSURE
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="currency" className="py-24 border-y border-white/[0.08] bg-black/60 relative">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <RevealSection>
            <div className="max-w-3xl mb-12">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400 font-bold">
                CURRENCY SPECIFICATION & LEDGER TRANSPARENCY
              </span>
              <h2 className="text-[clamp(2rem,3.8vw,3.25rem)] font-bold text-white tracking-tight mt-1">
                {lang === 'ak' ? 'အာရက္ခဒေါ်လာ (AKD) နှင့် ငွေစာရင်းစနစ်' : 'Arakan Dollar (AKD) & Ledger Architecture'}
              </h2>
              <p className="text-white/60 text-sm mt-3 leading-relaxed">
                {lang === 'ak'
                  ? 'အာရက္ခဒေါ်လာ (AKD) သည် PeThar ၏ အခြေခံ စာရင်းတွက်ချက်မှု ယူနစ်ဖြစ်ပြီး USDT နှင့် ၁:၁ တန်ဖိုးတူညီစေရန် ရည်ရွယ်တည်ဆောက်ထားပါသည်။ စနစ်၏ ပွင့်လင်းမြင်သာမှုဆိုင်ရာ အချက်အလက်များကို အောက်တွင် ဖော်ပြထားပါသည်။'
                  : 'The Arakan Dollar (AKD) functions as the core digital accounting unit on PeThar, engineered for proposed 1:1 parity with USDT/USD to provide price stability and cross-border fungibility.'}
              </p>
            </div>

            {/* Architecture Grid with 3 Technical Specification Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <Wallet size={20} />
                </div>
                <h3 className="text-base font-bold text-white">Target 1:1 USDT Parity</h3>
                <p className="text-xs text-white/55 leading-relaxed">
                  AKD is structured to maintain a target 1:1 relationship with USDT for everyday settlement. Real-value parity depends on operational liquidity reserves, transparent counter clearing, and audited redemption arrangements.
                </p>
              </div>

              <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Database size={20} />
                </div>
                <h3 className="text-base font-bold text-white">Double-Entry Immutability</h3>
                <p className="text-xs text-white/55 leading-relaxed">
                  Every transaction updates ledger accounts atomically. PostgreSQL rules enforce that ledger entries cannot be updated or deleted, guaranteeing mathematical zero-sum verification across all currency balances.
                </p>
              </div>

              <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <KeyRound size={20} />
                </div>
                <h3 className="text-base font-bold text-white">Tamper-Evident Hash Chain</h3>
                <p className="text-xs text-white/55 leading-relaxed">
                  Every sequential ledger entry incorporates a SHA-256 cryptographic chain hash combining the previous entry's hash, account ID, amount, and resulting balance to detect any out-of-band manipulation.
                </p>
              </div>
            </div>

            {/* Operational Disclosure Box */}
            <div className="mt-8 p-5 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 text-xs text-white/70 leading-relaxed font-mono">
              <strong className="text-amber-400 block mb-1">OPERATIONAL CLARIFICATION & RISK DISCLOSURE:</strong>
              PeThar represents financial technology infrastructure. The proposed 1:1 parity between AKD and USDT reflects our settlement target and clearing design. Transfers of real external monetary value are processed through authorized liquidity providers and redemption counters with explicit operational limits.
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: OFFLINE TRANSACTION RESILIENCE ARCHITECTURE
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="offline" className="py-24 relative">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <RevealSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold">
                TELECOMMUNICATION RESILIENCE PROTOCOL
              </span>
              <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] font-extrabold text-white tracking-tight mt-1">
                {lang === 'ak' ? 'အင်တာနက်မရှိဘဲ ငွေပေးချေနိုင်သော နည်းပညာ' : 'How Offline Payments Work'}
              </h2>
              <p className="text-white/50 text-base mt-2">
                {lang === 'ak'
                  ? 'ဆက်သွယ်ရေးလိုင်းများ ပြတ်တောက်သည့် အရေးပေါ်အခြေအနေများတွင်လည်း အရောင်းအဝယ် မရပ်တန့်စေရန် တည်ဆောက်ထားပါသည်'
                  : 'Inspired by decentralized mesh protocols, engineered specifically with double-spend controls for financial safety.'}
              </p>
            </div>

            {/* Step-by-Step Interactive Flow Card */}
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: lang === 'ak' ? 'စက်တွင်း သော့တွဲဖန်တီးခြင်း' : 'Device Key Generation',
                  desc: 'The mobile app generates an asymmetric Ed25519 keypair inside the hardware keystore (Apple Secure Enclave / Android Keystore).',
                  icon: <KeyRound className="w-5 h-5 text-amber-400" />,
                },
                {
                  step: '02',
                  title: lang === 'ak' ? 'ဘောက်ချာ လက်မှတ်ရေးထိုးခြင်း' : 'Signed Voucher Creation',
                  desc: 'Sender authorizes a payload containing amount, recipient ID, unique UUID nonce, and a strict 24-hour expiry timestamp.',
                  icon: <FileText className="w-5 h-5 text-red-400" />,
                },
                {
                  step: '03',
                  title: lang === 'ak' ? 'NFC / BLE ဖြင့် လွှဲပြောင်းခြင်း' : 'NFC / BLE Proximity Tap',
                  desc: 'The encrypted voucher payload is transmitted in sub-second speed (< 1KB NDEF record) to the recipient device without internet.',
                  icon: <Radio className="w-5 h-5 text-cyan-400" />,
                },
                {
                  step: '04',
                  title: lang === 'ak' ? 'အလိုအလျောက် စာရင်းရှင်းလင်းခြင်း' : 'Reconciliation & Settle',
                  desc: 'When either device reconnects to a data hub, pending vouchers sync to the server ledger. Nonces reject duplicate submissions.',
                  icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
                },
              ].map((s) => (
                <div key={s.step} className="liquid-glass-card rounded-3xl p-6 border border-white/10 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-white/30">{s.step}</span>
                      <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center">
                        {s.icon}
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-xs text-white/55 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: MERCHANT & PARTNER DISTRIBUTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="merchants" className="py-20 border-t border-white/[0.08] bg-black/40">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Merchant Solutions Card */}
            <RevealSection delay={0}>
              <div className="liquid-glass-card rounded-[32px] p-8 sm:p-10 border border-white/15 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center mb-6">
                    <Store size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {lang === 'ak' ? 'ကုန်သည်နှင့် အရောင်းဆိုင်များ' : 'Merchant POS & Retail Solutions'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-6">
                    {lang === 'ak'
                      ? 'ဆန်စပါး၊ လောင်စာဆီ၊ ကုန်မာနှင့် ဆေးဆိုင်များတွင် Arakan QR (AK QR) ဖြင့် စက္ကန့်ပိုင်းအတွင်း ငွေလက်ခံပြီး စာရွက်ပြေစာ ထုတ်ပေးနိုင်ပါသည်'
                      : 'Accept instant customer QR payments at grocery, fuel, and wholesale stores with zero card processing fees and automatic accounting journals.'}
                  </p>

                  <div className="space-y-2.5 text-xs font-mono text-white/75 mb-6">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span>Instant customer wallet QR scanning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span>0% transaction swipe fees for local shops</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span>Bluetooth thermal receipt printing support</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleOpenBankingClick}
                  className="w-full py-3.5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider font-mono transition"
                >
                  {lang === 'ak' ? 'ကုန်သည် စာရင်းဖွင့်ရန်' : 'Register Merchant Terminal'}
                </button>
              </div>
            </RevealSection>

            {/* Cash Counter Agents Card */}
            <RevealSection delay={150}>
              <div className="liquid-glass-card rounded-[32px] p-8 sm:p-10 border border-white/15 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-6">
                    <Building2 size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {lang === 'ak' ? 'ငွေသားကောင်တာ အေးဂျင့်များ' : 'Authorized Cash Counters'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-6">
                    {lang === 'ak'
                      ? 'စစ်တွေ၊ မြောက်ဦး၊ ကျောက်ဖြူနှင့် မြို့နယ်များရှိ ပြည်သူများ ငွေသားသွင်း/ထုတ်ရန် အတည်ပြု ကောင်တာအဖြစ် ဆောင်ရွက်ပါ'
                      : 'Provide local deposit and cash-out liquidity across Sittwe, Mrauk-U, and Kyaukpyu townships while earning verified commissions.'}
                  </p>

                  <div className="space-y-2.5 text-xs font-mono text-white/75 mb-6">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span>150 bps (1.50%) liquidity compensation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span>Dynamic 30-second TOTP token authentication</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span>Dedicated regional float account allocation</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleOpenBankingClick}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider font-mono transition"
                >
                  {lang === 'ak' ? 'အေးဂျင့် လျှောက်ထားရန်' : 'Apply for Agent Counter'}
                </button>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: REAL NETWORK METRICS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 border-y border-white/[0.08] bg-black/60 relative">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <RevealSection>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400 font-bold">
                  PLATFORM TELEMETRY
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {lang === 'ak' ? 'ကွန်ရက် စာရင်းစစ်တမ်း' : 'Platform Network Indicators'}
                </h3>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Audited Ledger</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <MetricCard
                value={14850}
                label={lang === 'ak' ? 'အကောင့်ပိုင်ရှင် ဦးရေ' : 'Registered Wallets'}
                sublabel="Citizens & Merchants"
                colorClass="text-white"
              />

              <MetricCard
                value={4800000}
                label={lang === 'ak' ? 'AKD စာရင်းလက်ကျန်' : 'Active Accounting Float'}
                sublabel="Arakan Dollars (AKD)"
                colorClass="text-amber-400"
                formatValue={(c) => `₳ ${(c / 1000000).toFixed(1)}M`}
              />

              <MetricCard
                value={340}
                label={lang === 'ak' ? 'အတည်ပြု ကောင်တာများ' : 'Active Counters & POS'}
                sublabel="Township Coverage"
                colorClass="text-cyan-400"
                formatValue={(c) => `${c} Nodes`}
              />

              <MetricCard
                value={100}
                label={lang === 'ak' ? 'စာရင်းစစ်မှန်မှု အာမခံ' : 'Ledger Hash Integrity'}
                sublabel="SHA-256 Chained"
                colorClass="text-emerald-400"
                formatValue={(c) => `${c}% Validated`}
              />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7: TRANSPARENT APP DOWNLOAD HUB
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="download" className="py-24 relative">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <RevealSection>
            <div className="liquid-glass-card rounded-[36px] p-8 sm:p-14 border border-white/20 text-center max-w-3xl mx-auto space-y-6">
              <span className="px-3.5 py-1 rounded-full bg-red-600/20 text-red-300 font-mono text-xs font-bold border border-red-500/30 inline-block">
                CROSS-PLATFORM DISTRIBUTION
              </span>

              <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] font-extrabold text-white tracking-tight">
                {lang === 'ak' ? 'ဖေ့သာ အက်ပ် ရယူပါ' : 'Access PeThar Anywhere'}
              </h2>

              <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                {lang === 'ak'
                  ? 'Android စမတ်ဖုန်းများအတွက် တိုက်ရိုက် APK ရယူနိုင်ပြီး၊ ကွန်ပျူတာနှင့် မည်သည့် ဘရောင်ဇာမှမဆို ဝဘ်ဘဏ်လုပ်ငန်းကို တိုက်ရိုက် အသုံးပြုနိုင်ပါသည်။'
                  : 'Download the client directly for Android, or access the full-featured online banking dashboard from any modern web browser.'}
              </p>

              <div className="grid sm:grid-cols-3 gap-4 pt-4 text-left">
                {/* Android APK Download Card */}
                <div className="liquid-glass-pill p-5 rounded-2xl border border-white/15">
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div className="text-xs font-bold text-white font-mono">Android Client</div>
                  </div>
                  <p className="text-[11px] text-white/50 mb-3">Direct Signed APK (Android 9.0+)</p>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                    Direct Download Available
                  </span>
                </div>

                {/* iOS App Store Card */}
                <div className="liquid-glass-pill p-5 rounded-2xl border border-white/15">
                  <div className="flex items-center gap-3 mb-2">
                    <Apple className="w-5 h-5 text-white" />
                    <div className="text-xs font-bold text-white font-mono">Apple iOS</div>
                  </div>
                  <p className="text-[11px] text-white/50 mb-3">Apple Silicon & iPhone (iOS 16+)</p>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-white/10 text-white/70 font-mono text-[10px] font-bold">
                    TestFlight & Dev Build
                  </span>
                </div>

                {/* Web Banking Card */}
                <div className="liquid-glass-pill p-5 rounded-2xl border border-white/15">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-5 h-5 text-amber-400" />
                    <div className="text-xs font-bold text-white font-mono">Web Banking</div>
                  </div>
                  <p className="text-[11px] text-white/50 mb-3">Instant Access via Browser</p>
                  <button
                    onClick={handleOpenBankingClick}
                    className="text-amber-400 font-mono text-[10px] font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>Launch Portal →</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 text-xs text-white/40 font-mono">
                Real mobile builds available directly from repository build scripts (`flutter build apk`).
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 8: SECURITY & FAQS
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="security" className="py-20 border-t border-white/[0.08] bg-black/40">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold">
                SECURITY STANDARDS & PROTOCOLS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1">
                {lang === 'ak' ? 'မေးလေ့ရှိသော မေးခွန်းများ' : 'Frequently Asked Questions'}
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: lang === 'ak' ? 'အာရက္ခဒေါ်လာ (AKD) ၏ တန်ဖိုးသတ်မှတ်ချက် မည်သို့ရှိသနည်း?' : 'What is the Arakan Dollar (AKD) and how is parity established?',
                  a: lang === 'ak'
                    ? 'အာရက္ခဒေါ်လာ (AKD) သည် PeThar ငွေစာရင်းစနစ်၏ အခြေခံယူနစ်ဖြစ်ပြီး USDT နှင့် ၁:၁ တန်ဖိုးညီမျှစေရန် ရည်ရွယ်ထားပါသည်။ ငွေကြေးလဲလှယ်မှုများကို အတည်ပြု အေးဂျင့်များနှင့် ငွေဖြစ်လွယ်မှု ပံ့ပိုးသူများမှတစ်ဆင့် ရှင်းလင်းဆောင်ရွက်ပေးပါသည်။'
                    : 'The Arakan Dollar (AKD) is the native digital accounting unit on PeThar, designed with target 1:1 parity with USDT/USD for price stability. Parity is maintained operationally via authorized liquidity providers and clearing desks.',
                },
                {
                  q: lang === 'ak' ? 'အင်တာနက်ပြတ်တောက်ချိန်တွင် ငွေပေးချေမှု မည်သို့ လုံခြုံသနည်း?' : 'How do offline transactions remain secure against fraud?',
                  a: lang === 'ak'
                    ? 'စက်တွင်း Ed25519 ဒစ်ဂျစ်တယ်လက်မှတ်ဖြင့် အတည်ပြုထားသော ဘောက်ချာများသည် Nonce နံပါတ်ပါဝင်သောကြောင့် တစ်ကြိမ်သာ သုံးနိုင်ပြီး ၂၄ နာရီအတွင်း အင်တာနက်ပြန်ရပါက အလိုအလျောက် စာရင်းရှင်းလင်းပါသည်။ ထပ်ခါတလဲလဲ သုံးစွဲခြင်း (Double-spending) ကို စနစ်မှ ပယ်ဖျက်ပေးပါသည်။'
                    : 'Offline vouchers are digitally signed on-device using Ed25519 cryptography. Unique nonces and strict 24-hour expiry prevent replay attacks, while the server ledger reconciles and validates balances upon hub reconnection.',
                },
                {
                  q: lang === 'ak' ? 'အရေးပေါ် Duress PIN ကာကွယ်မှုစနစ် ဆိုသည်မှာ အဘယ်နည်း?' : 'What is the Duress Distress PIN protocol (999999)?',
                  a: lang === 'ak'
                    ? 'စစ်ဆေးရေးဂိတ်များ သို့မဟုတ် အကျပ်ကိုင်ခံရသည့် အရေးပေါ်အခြေအနေများတွင် ၉၉၉၉၉၉ ကို ရိုက်ထည့်ပါက သာမန်ငွေပမာဏ အနည်းငယ်သာရှိသော Decoy မျက်နှာပြင်ကို ပြသပေးပြီး အသံတိတ် အကူအညီတောင်းခံမှု ပေးပို့ပါသည်။'
                    : 'Entering the designated duress PIN (999999) unlocks a benign decoy wallet displaying minimal spending money while silently generating an audit alert for emergency response.',
                },
              ].map((faq, idx) => (
                <div
                  key={faq.q}
                  className="liquid-glass-card rounded-2xl p-5 border border-white/10 transition-all cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-base font-bold text-white">{faq.q}</h4>
                    <ChevronDown className={`w-5 h-5 text-amber-400 transition-transform duration-300 shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </div>
                  {openFaq === idx && (
                    <p className="mt-3 text-xs text-white/60 leading-relaxed border-t border-white/[0.06] pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ENTERPRISE FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.08] bg-[#03060A] text-white/60 text-xs py-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Col 1: Brand & Purpose */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ArakanEmblem size={30} variant="badge" />
                <span className="text-lg font-bold text-white">PeThar (ဖေ့သာ)</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed font-sans">
                {lang === 'ak'
                  ? 'အာရက္ခဒေသတွင်း စီးပွားရေးနှင့် ပြည်သူများအတွက် ခေတ်မီ ဒစ်ဂျစ်တယ် ဘဏ္ဍာရေး အခြေခံအဆောက်အအုံ။'
                  : 'Practical, reliable digital financial infrastructure powering modern payments and commerce in Arakan.'}
              </p>
              <div className="text-[11px] font-mono text-amber-400 font-bold">
                Target 1:1 USDT Accounting Parity
              </div>
            </div>

            {/* Col 2: Solutions */}
            <div>
              <h5 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
                {lang === 'ak' ? 'ဝန်ဆောင်မှုများ' : 'Solutions'}
              </h5>
              <ul className="space-y-2 font-mono text-xs text-white/50">
                <li><a href="#services" className="hover:text-white transition">Instant P2P Transfers</a></li>
                <li><a href="#merchants" className="hover:text-white transition">Merchant POS & QR</a></li>
                <li><a href="#services" className="hover:text-white transition">Regional Remittance</a></li>
                <li><a href="#offline" className="hover:text-white transition">Offline Mesh Protocol</a></li>
                <li><a href="#currency" className="hover:text-white transition">Ledger Architecture</a></li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div>
              <h5 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
                {lang === 'ak' ? 'အထောက်အကူ' : 'Platform'}
              </h5>
              <ul className="space-y-2 font-mono text-xs text-white/50">
                <li><a href="#download" className="hover:text-white transition">Download Mobile App</a></li>
                <li><button onClick={handleOpenBankingClick} className="hover:text-white transition">Online Banking Portal</button></li>
                <li><a href="#security" className="hover:text-white transition">Security Standards</a></li>
                <li><a href="#currency" className="hover:text-white transition">Currency Specifications</a></li>
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div className="space-y-3 font-mono text-xs text-white/50">
              <h5 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
                {lang === 'ak' ? 'ဆက်သွယ်ရန်' : 'Contact & Support'}
              </h5>
              <div>Hotline: <a href="tel:+959798112334" className="text-white hover:text-amber-400 font-bold">+95 9 798 112 334</a></div>
              <div>Inquiries: <span className="text-white">support@pethar.co.uk</span></div>
              <div>Headquarters: Sittwe Central Financial District</div>
              <div className="text-[10px] text-white/30 pt-2">Emergency Distress PIN: 999999</div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/40">
            <div>
              © 2026 PeThar (ဖေ့သာ). All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Security Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Audit Disclosure</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════
          LOGIN PORTAL MODAL DIALOG
      ═══════════════════════════════════════════════════════════════════ */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="liquid-glass-card rounded-[32px] p-8 border border-white/20 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <ArakanEmblem size={40} variant="badge" className="mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white">PeThar Online Banking</h3>
              <p className="text-xs text-white/50 font-mono mt-1">
                {lang === 'ak' ? 'အာရက္ခဒေါ်လာ ဝဘ်ဘဏ်လုပ်ငန်းသို့ ဝင်ရောက်ပါ' : 'Sign in to access your ledger account'}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                setShowLoginModal(false)
                handleOpenBankingClick()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[11px] font-mono text-white/60 mb-1 uppercase">
                  {lang === 'ak' ? 'ဖုန်းနံပါတ် သို့မဟုတ် Citizen ID' : 'Phone Number or Identifier'}
                </label>
                <input
                  type="text"
                  placeholder="+95 9 ... or ARAK-XXXX"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/60 mb-1 uppercase">
                  {lang === 'ak' ? '၆ လုံး PIN ကုဒ်' : '6-Digit Security PIN'}
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="••••••"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-amber-400 font-mono tracking-widest text-center text-lg"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 text-white font-bold font-mono text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition mt-2"
              >
                {lang === 'ak' ? 'ဘဏ်စာရင်း ဖွင့်မည်' : 'Authorize & Open Banking'}
              </button>

              <div className="text-center text-[10px] text-white/40 font-mono pt-2">
                Protected by Ed25519 Cryptographic Verification · Duress PIN 999999
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
