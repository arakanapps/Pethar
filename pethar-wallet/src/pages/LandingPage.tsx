import { useState, useEffect, useRef } from 'react'
import { ArakanEmblem, FlagArakan } from '../components/ArakanEmblem'
import {
  Shield, Globe, Smartphone, Monitor, CreditCard,
  ArrowRight, Download, Apple, Eye, EyeOff, Lock,
  QrCode, TrendingUp, ChevronDown,
  BadgeCheck, Fingerprint, Send, ArrowUpRight,
  Menu, X, Sparkles, Building2, Store, Terminal, RefreshCw
} from 'lucide-react'

interface LandingPageProps {
  onEnterApp: () => void
}

/* ─── Animated Counter Hook ──────────────────────────────────────────── */
function useCountUp(end: number, duration = 2200, startOnView = true) {
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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
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
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10'
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
    MAIN NDS-STYLE LANDING PAGE
═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const [showLogin, setShowLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginId, setLoginId] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [audienceTab, setAudienceTab] = useState<'citizens' | 'merchants' | 'institutions'>('citizens')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [bannerOpen, setBannerOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    onEnterApp()
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    setTimeout(() => {
      setEmail('')
      setSubscribed(false)
    }, 4000)
  }

  const navLinks = [
    { label: '01 / Mission', href: '#mission' },
    { label: '02 / Architecture', href: '#architecture' },
    { label: '03 / Reserves', href: '#reserves' },
    { label: '04 / Platforms', href: '#platforms' },
    { label: '05 / Security', href: '#security' },
  ]

  const stats = [
    useCountUp(14850),
    useCountUp(4800000),
    useCountUp(340),
    useCountUp(105),
  ]

  const faqs = [
    {
      q: 'What is the Arakan Dollar (AKD) and how is it pegged?',
      a: 'The Arakan Dollar (AKD / ₳) is the sovereign digital currency unit of Arakan. Each AKD is strictly pegged 1:1 with the United States Dollar and backed by 105% liquid collateral consisting of short-term US Treasury bills, audited physical gold bullion vault holdings, and regulated fiat stablecoins. Fractional reserve lending is prohibited by design.',
    },
    {
      q: 'Why has the Myanmar Kyat (MMK) been deprecated?',
      a: 'MMK has suffered catastrophic currency depreciation, hyperinflation, physical banknote degradation, and severe cross-border restrictions. PeThar provides a transparent, sovereign double-entry ledger that enables merchants, households, and overseas workers to transact without losing value to arbitrary inflation or capital controls.',
    },
    {
      q: 'How does PeThar function during regional telecommunication blackouts?',
      a: 'PeThar incorporates an offline mesh verification protocol. Devices generate cryptographically signed, tamper-proof offline vouchers using Ed25519 asymmetric signatures. When connectivity returns through satellite terminals or local mesh hubs, transactions reconcile automatically with anti-replay guarantees.',
    },
    {
      q: 'How do international transfers and diaspora remittances work?',
      a: 'Arakanese communities in Thailand, Malaysia, Singapore, and worldwide can send funds home directly using local bank apps (PromptPay, DuitNow, PayNow) or stablecoin gateways (USDT/USDC). PeThar settles instantly into the recipient’s AKD balance with transparent zero-spread rates and instant cash-out through local verified agents.',
    },
    {
      q: 'What security protections are built into the PeThar wallet?',
      a: 'All balances are anchored to an append-only cryptographic double-entry ledger. User endpoints leverage hardware keystores (Secure Enclave on iOS, Android Keystore) and biometric verification. In high-risk scenarios, PeThar includes a duress/panic PIN (999999) that displays a benign decoy balance while silently broadcasting a distress signal to community safety monitors.',
    },
  ]

  return (
    <div className="min-h-screen bg-black text-[#F1F0E0] overflow-x-hidden selection:bg-red-700/60 selection:text-white font-sans">

      {/* ── Custom CSS for NDS Government Polish ───────────────────────── */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .mask-marquee {
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        .hero-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .hero-grid-dense {
          background-image:
            linear-gradient(rgba(217, 22, 36, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(217, 22, 36, 0.08) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .hairline-b {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .hairline-t {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .hairline-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.015);
          backdrop-filter: blur(16px);
        }
        .hairline-card:hover {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.03);
        }
        .pill-button {
          border-radius: 9999px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pill-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px -10px rgba(255, 255, 255, 0.25);
        }
        .metallic-text {
          background: linear-gradient(180deg, #FFFFFF 0%, #D4D4D8 60%, #8E8E93 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gold-metallic-text {
          background: linear-gradient(180deg, #FFF6D6 0%, #F5C542 50%, #C49018 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .editorial-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 20%, rgba(255, 255, 255, 0.15) 80%, transparent 100%);
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════
          OFFICIAL GOVERNMENT BANNER RIBBON (NDS Standard across all sites)
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#05070A] border-b border-white/[0.06] text-[11px] text-white/50 tracking-wider py-1.5 px-4 sm:px-8 relative z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono">
            <span className="inline-flex items-center justify-center w-4 h-3 rounded-[2px] overflow-hidden border border-white/20 shrink-0">
              <FlagArakan size={16} />
            </span>
            <span className="uppercase tracking-[0.08em] font-medium text-white/70">
              An Official Platform of the Arakan National Authority
            </span>
          </div>

          <button
            onClick={() => setBannerOpen(!bannerOpen)}
            className="hidden md:flex items-center gap-1.5 font-mono text-[10px] text-white/40 hover:text-white/80 transition-colors uppercase"
          >
            <span>Here's how you know</span>
            <ChevronDown size={12} className={`transition-transform duration-300 ${bannerOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {bannerOpen && (
          <div className="max-w-[1400px] mx-auto pt-3 pb-2 text-[11px] font-mono text-white/50 border-t border-white/[0.05] mt-1.5 grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Official cryptographic ledger:</strong> Every PeThar transaction is authenticated by Ed25519 digital signatures and backed by verifiable reserves.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Zero fractional reserves:</strong> AKD holdings are maintained at a 105% minimum collateral ratio with third-party verified custodial vaults.</span>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          STICKY TOP COMMAND BAR (NDS Floating Pill Style)
      ═══════════════════════════════════════════════════════════════════ */}
      <header className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-black/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl shadow-black/80'
          : 'bg-black/40 backdrop-blur-md border-b border-white/[0.04]'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-[68px] flex items-center justify-between">
          {/* Brand Mark with Arakan Emblem */}
          <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-600/30 blur-md group-hover:scale-125 transition-transform" />
              <ArakanEmblem size={30} variant="badge" className="relative drop-shadow" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">PeThar</span>
              <span className="text-[11px] font-mono text-amber-400 tracking-wider">AKD</span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-white/30 border border-white/10 px-1.5 py-0.5 rounded">
                v2.4 SOVEREIGN
              </span>
            </div>
          </div>

          {/* Center Links (National Design Studio Monospace Indicators) */}
          <nav className="hidden lg:flex items-center gap-1 font-mono text-[12px] tracking-wide">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative px-3.5 py-2 text-white/45 hover:text-white transition-colors group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-1 left-3.5 right-3.5 h-[1px] bg-red-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogin(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/60 hover:text-white transition-colors px-3 py-2"
            >
              <Lock size={12} className="text-amber-400" />
              <span>Portal Login</span>
            </button>

            <button
              onClick={onEnterApp}
              className="pill-button px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 flex items-center gap-1.5 shadow-lg shadow-white/5 active:scale-95"
            >
              <span>Launch Wallet</span>
              <ArrowUpRight size={14} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/60 hover:text-white"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A0D14] border-b border-white/[0.08] px-6 py-6 space-y-3 font-mono text-xs">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 text-white/70 hover:text-white border-b border-white/[0.04]"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); setShowLogin(true) }}
                className="w-full py-3 text-center border border-white/10 rounded-xl text-white/80"
              >
                Portal Login
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onEnterApp() }}
                className="w-full py-3 text-center bg-white text-black font-semibold rounded-xl"
              >
                Open PeThar Wallet
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION (The NDS Monumental Architecture)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center overflow-hidden pt-12 pb-24">
        {/* Background Visual Engineering */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 hero-grid opacity-30" />
          <div className="absolute inset-0 hero-grid-dense opacity-10" />

          {/* Deep Sovereign Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-red-600/[0.09] blur-[160px]" />
          <div className="absolute bottom-10 left-1/3 w-[600px] h-[400px] rounded-full bg-amber-500/[0.05] blur-[140px]" />
          <div className="absolute top-10 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-600/[0.04] blur-[120px]" />

          {/* Top and Bottom Fades */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="relative max-w-[1240px] mx-auto px-6 text-center z-10">
          {/* Status Capsule */}
          <RevealSection delay={0}>
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-10 rounded-full border border-white/[0.12] bg-white/[0.02] backdrop-blur-xl text-xs font-mono tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80">ARAKAN CENTRAL LEDGER ACTIVE</span>
              <span className="text-white/30">•</span>
              <span className="text-amber-300 font-semibold">1:1 USD PARITY GUARANTEED</span>
            </div>
          </RevealSection>

          {/* Sacred Emblem & Sovereign Title */}
          <RevealSection delay={100}>
            <div className="flex justify-center mb-8">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-red-600/30 via-amber-500/20 to-red-600/30 blur-2xl group-hover:scale-125 transition-all duration-700 opacity-70" />
                <ArakanEmblem size={96} variant="badge" className="relative drop-shadow-[0_20px_40px_rgba(217,22,36,0.35)] transition-transform duration-500 group-hover:scale-105" />
              </div>
            </div>
          </RevealSection>

          {/* Monumental Headline (NDS Signature: Bold Display Sans + Italic Instrument Serif) */}
          <RevealSection delay={200}>
            <h1 className="text-[clamp(2.75rem,7.5vw,6.5rem)] font-extrabold tracking-[-0.035em] leading-[1.02] mb-6">
              <span className="metallic-text block">THE SOVEREIGN</span>
              <span className="font-serif italic font-normal gold-metallic-text block text-[clamp(3rem,8.5vw,7.25rem)] -mt-2">
                Arakan Dollar Network.
              </span>
            </h1>
          </RevealSection>

          {/* Narrative Subtitle */}
          <RevealSection delay={300}>
            <p className="text-[clamp(1.05rem,2vw,1.35rem)] text-white/50 max-w-[740px] mx-auto leading-relaxed mb-4 font-normal">
              PeThar (ဖေ့သာ) is the digital monetary infrastructure for the 4 million people of Arakan and their global diaspora.
              100% reserve-backed, zero inflation loss, and resilient through telecommunication blackouts.
            </p>
            <p className="text-sm font-mono text-white/35 max-w-xl mx-auto mb-12">
              အာရက္ခအမျိုးသား ဒစ်ဂျစ်တယ်ဘဏ္ဍာရေးကွန်ရက်နှင့် အချုပ်အခြာအာဏာပိုင် ငွေကြေးစနစ်
            </p>
          </RevealSection>

          {/* Primary Action Buttons */}
          <RevealSection delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <button
                onClick={onEnterApp}
                className="pill-button px-8 py-4 text-sm font-semibold tracking-wider uppercase bg-white text-black hover:bg-neutral-100 flex items-center gap-3 shadow-2xl shadow-white/20 active:scale-95"
              >
                <span>Launch Web Terminal</span>
                <ArrowRight size={16} />
              </button>

              <a
                href="#platforms"
                className="pill-button px-8 py-4 text-sm font-semibold tracking-wider uppercase border border-white/[0.14] bg-white/[0.03] text-white/80 hover:text-white hover:bg-white/[0.08] backdrop-blur-xl flex items-center gap-2.5"
              >
                <Download size={16} className="text-white/50" />
                <span>Get Mobile App</span>
              </a>
            </div>
          </RevealSection>

          {/* Live Proof of Reserves Stats Bar (NDS Monospace Metrology) */}
          <RevealSection delay={500}>
            <div className="max-w-[1040px] mx-auto hairline-card rounded-2xl p-6 sm:p-8">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center justify-between">
                <span>Real-Time Network Telemetry</span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Synced Block #948,124
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                <div ref={stats[0].ref} className="border-l border-white/10 pl-4">
                  <div className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-white font-mono tracking-tight">
                    {stats[0].count.toLocaleString()}+
                  </div>
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mt-1">
                    Citizens & Wallets
                  </div>
                </div>

                <div ref={stats[1].ref} className="border-l border-white/10 pl-4">
                  <div className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-amber-400 font-mono tracking-tight">
                    ₳ {(stats[1].count / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mt-1">
                    AKD Circulating Supply
                  </div>
                </div>

                <div ref={stats[2].ref} className="border-l border-white/10 pl-4">
                  <div className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-white font-mono tracking-tight">
                    {stats[2].count} Counters
                  </div>
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mt-1">
                    Verified Cash Agents
                  </div>
                </div>

                <div ref={stats[3].ref} className="border-l border-white/10 pl-4">
                  <div className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-emerald-400 font-mono tracking-tight">
                    {stats[3].count}%
                  </div>
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mt-1">
                    Collateral Coverage Ratio
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          INFINITE LOGO & CORRIDOR MARQUEE (NDS Standard: Genesis / TrumpRx)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="hairline-t hairline-b py-8 bg-[#040609]">
        <div className="max-w-[1400px] mx-auto px-6 mb-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30 font-medium">
            Multi-Rail Interoperability & Global Corridor Partners
          </span>
        </div>
        <Marquee speed={45}>
          {[
            'VISA INTERNATIONAL',
            'MASTERCARD 3D-SECURE',
            'BINANCE PAY 0% FEE',
            'MEXC GLOBAL UID BRIDGE',
            'PROMPTPAY THAILAND',
            'DUITNOW MALAYSIA',
            'PAYNOW SINGAPORE',
            'SWIFT: ARAKMMXX',
            'USDT TRC-20 & ERC-20',
            'POLYGON MESH',
            'US TREASURY BACKED',
            'PHYSICAL GOLD BULLION VAULT',
          ].map((partner) => (
            <span
              key={partner}
              className="inline-flex items-center gap-3 px-8 text-xs font-mono uppercase tracking-wider text-white/20 hover:text-white/50 transition-colors"
            >
              <span>◆</span>
              <span>{partner}</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION I: THE SOVEREIGN MONETARY PILLARS (Roman Numeral Style)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="mission" className="py-32 relative">
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
          {/* NDS Header Style: Roman Numeral + Thin Rule */}
          <RevealSection>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-mono text-sm text-red-500 font-bold">I.</span>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">Sovereign Monetary Policy</span>
              <div className="flex-1 editorial-rule" />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
              <div>
                <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold tracking-tight leading-[1.08] mb-6">
                  <span className="text-white">Deprecating Kyat.</span>
                  <br />
                  <span className="font-serif italic font-normal text-amber-300">
                    Restoring Arakan Prosperity.
                  </span>
                </h2>
                <p className="text-white/55 leading-relaxed text-base mb-6">
                  For decades, communities across Arakan have endured the forced adoption of depreciating Myanmar Kyat (MMK),
                  arbitrary demonetizations, cash withdrawal quotas, and predatory transaction taxes.
                </p>
                <p className="text-white/55 leading-relaxed text-base">
                  PeThar replaces broken paper with the <strong className="text-white">Arakan Dollar (AKD)</strong> — a cryptographic,
                  double-entry ledger backed 1:1 by liquid US dollar reserves and physical gold bullion. Every citizen owns their balance directly.
                </p>
              </div>

              {/* High-Impact Manifesto Card */}
              <div className="hairline-card p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="font-mono text-xs uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
                  <Sparkles size={14} />
                  <span>The Arakan Currency Standard</span>
                </div>
                <div className="space-y-4 text-sm text-white/70">
                  <div className="border-b border-white/[0.06] pb-3">
                    <span className="font-mono text-xs text-white/40 block mb-1">UNIT OF ACCOUNT</span>
                    <strong className="text-white text-base">1 AKD = 100 Cents (ပြား) = 1.00 USD</strong>
                  </div>
                  <div className="border-b border-white/[0.06] pb-3">
                    <span className="font-mono text-xs text-white/40 block mb-1">RESERVE AUDITING</span>
                    <span>105% over-collateralized in US Treasuries and Swiss-vaulted physical gold bullion.</span>
                  </div>
                  <div className="border-b border-white/[0.06] pb-3">
                    <span className="font-mono text-xs text-white/40 block mb-1">SETTLEMENT SPEED</span>
                    <span>Sub-second domestic P2P finality with zero transaction fees.</span>
                  </div>
                  <div>
                    <span className="font-mono text-xs text-white/40 block mb-1">LEGAL STATUS</span>
                    <span>Sovereign national legal tender across all liberated Arakan townships.</span>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Three Pillar Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Peer-to-Peer Mobility',
                desc: 'Transfer AKD instantly using phone numbers, Arakan IDs (ARAK-XXXX), or ArakanPay QR codes. Free forever.',
                icon: <Send size={20} className="text-red-400" />,
              },
              {
                num: '02',
                title: 'Blackout-Proof Mesh',
                desc: 'Signed offline vouchers let merchants and citizens trade during telecom cutoffs, reconciling safely upon reconnection.',
                icon: <Shield size={20} className="text-cyan-400" />,
              },
              {
                num: '03',
                title: 'Physical Cash Counters',
                desc: 'Over 340 verified counters in Sittwe, Mrauk-U, Kyaukpyu, and Thandwe with TOTP 30-second fraud prevention.',
                icon: <Building2 size={20} className="text-amber-400" />,
              },
            ].map((pillar, i) => (
              <RevealSection key={pillar.num} delay={i * 120}>
                <div className="hairline-card p-8 rounded-2xl h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-xs text-white/30 font-bold">{pillar.num}</span>
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] group-hover:scale-110 transition-transform">
                        {pillar.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                    <p className="text-sm text-white/45 leading-relaxed">{pillar.desc}</p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/[0.04] flex items-center justify-between font-mono text-[11px] text-white/30 group-hover:text-white/60 transition-colors">
                    <span>EXPLORE SPEC</span>
                    <span>↗</span>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION II: COMPARATIVE RESERVE PROOF (The TrumpRx/RealFood Chart)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="reserves" className="py-28 bg-[#030508] relative">
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
          <RevealSection>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-mono text-sm text-red-500 font-bold">II.</span>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">Proof of Value & Inflation Defense</span>
              <div className="flex-1 editorial-rule" />
            </div>

            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-tight mb-4">
                <span className="text-white">Why Every Citizen Is Switching to </span>
                <span className="font-serif italic font-normal text-amber-300">PeThar.</span>
              </h2>
              <p className="text-white/50 text-base">
                A quantitative comparison between holding deprecated military junta fiat (MMK) and the sovereign Arakan Dollar.
              </p>
            </div>
          </RevealSection>

          {/* Comparative Data Grid (Inspired by TrumpRx Price Cards) */}
          <RevealSection delay={150}>
            <div className="grid lg:grid-cols-3 gap-6 mb-16">
              {/* Card 1: MMK */}
              <div className="hairline-card p-8 rounded-3xl border-red-900/30 bg-red-950/[0.04]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-red-400 font-bold uppercase tracking-wider">Myanmar Kyat (MMK)</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-mono">DEPRECATING</span>
                </div>
                <div className="text-4xl font-extrabold text-red-400 font-mono mb-2">-74%</div>
                <div className="text-xs font-mono text-white/40 mb-6">Purchasing power collapse (2021–2026)</div>
                <ul className="space-y-3 text-xs text-white/50 font-mono">
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span> Unbacked paper printing without reserves
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span> Bank run queues and cash withdrawal limits
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span> Frozen mobile wallets and arbitrary seizure
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span> 8–15% unofficial black-market money changer fees
                  </li>
                </ul>
              </div>

              {/* Card 2: PE THAR (Featured Center) */}
              <div className="hairline-card p-8 rounded-3xl border-amber-500/30 bg-amber-950/[0.08] relative scale-[1.02] shadow-2xl shadow-amber-950/20">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-black font-mono text-[10px] font-bold uppercase tracking-widest shadow-md">
                  RECOMMENDED STANDARD
                </div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="font-mono text-xs text-amber-300 font-bold uppercase tracking-wider">Arakan Dollar (AKD)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">STABLE 1:1 USD</span>
                </div>
                <div className="text-4xl font-extrabold text-amber-300 font-mono mb-2">₳ 1.00 = $1.00</div>
                <div className="text-xs font-mono text-white/40 mb-6">100% US Treasury & Gold Bullion Reserve</div>
                <ul className="space-y-3 text-xs text-white/80 font-mono">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> 0% domestic transfer fees forever
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Cryptographic proof of reserves on-chain
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Works offline with signed QR vouchers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> 30-sec TOTP dynamic agent cash-out security
                  </li>
                </ul>
              </div>

              {/* Card 3: Informal Hundi */}
              <div className="hairline-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-white/40 font-bold uppercase tracking-wider">Informal Hundi / Hawala</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white/50 text-[10px] font-mono">HIGH RISK</span>
                </div>
                <div className="text-4xl font-extrabold text-white/70 font-mono mb-2">8% to 12%</div>
                <div className="text-xs font-mono text-white/40 mb-6">Average cross-border commission fee</div>
                <ul className="space-y-3 text-xs text-white/50 font-mono">
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span> Zero legal recourse or deposit safeguarding
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span> Days to settle across Thailand/Malaysia corridors
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span> Frequent extortion and interception by authorities
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span> Opacity in exchange rates and spread markups
                  </li>
                </ul>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION III: AUDIENCE SELECTOR (The TrumpCard.gov Tabs Model)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="architecture" className="py-28 relative">
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
          <RevealSection>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-mono text-sm text-red-500 font-bold">III.</span>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">Ecosystem Architecture</span>
              <div className="flex-1 editorial-rule" />
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-tight">
                  Tailored for Every Rail.
                </h2>
                <p className="text-white/50 text-base mt-2">
                  Select your profile to view platform capabilities.
                </p>
              </div>

              {/* Segmented Switcher (NDS Pill Tab Switcher) */}
              <div className="inline-flex p-1 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-xl mt-6 md:mt-0">
                <button
                  onClick={() => setAudienceTab('citizens')}
                  className={`pill-button px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
                    audienceTab === 'citizens'
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Citizens & Diaspora
                </button>
                <button
                  onClick={() => setAudienceTab('merchants')}
                  className={`pill-button px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
                    audienceTab === 'merchants'
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Merchants & POS
                </button>
                <button
                  onClick={() => setAudienceTab('institutions')}
                  className={`pill-button px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
                    audienceTab === 'institutions'
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Treasury & Agents
                </button>
              </div>
            </div>
          </RevealSection>

          {/* Tab Content Display */}
          <div className="hairline-card p-8 sm:p-12 rounded-3xl">
            {audienceTab === 'citizens' && (
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6">
                    <Smartphone size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Instant Mobile Payments</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Send funds in seconds using just a phone number or contact ID. Works cleanly on both Android and iPhone devices.
                  </p>
                  <span className="font-mono text-xs text-amber-400">Zero fees on domestic P2P</span>
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                    <CreditCard size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Virtual Visa Debit Card</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Shop online anywhere Visa and Mastercard are accepted. Instant freeze/unfreeze controls directly from your wallet.
                  </p>
                  <span className="font-mono text-xs text-cyan-400">3D-Secure Protected</span>
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                    <Globe size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Global Remittance Rails</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Send money home from Thailand, Malaysia, Singapore, and 18+ corridors with transparent exchange rates and zero hidden spread.
                  </p>
                  <span className="font-mono text-xs text-emerald-400">Instant Corridor Settlement</span>
                </div>
              </div>
            )}

            {audienceTab === 'merchants' && (
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                    <Store size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Touchscreen Cashier POS</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Turn any Android tablet, iPad, or laptop into a fast retail checkout counter with preset amounts and sound confirmation.
                  </p>
                  <span className="font-mono text-xs text-amber-400">Instant QR Generation</span>
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                    <QrCode size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Thermal Bluetooth Receipts</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Print verified customer receipts directly over Bluetooth thermal printers or SMS a digital receipt URL instantly.
                  </p>
                  <span className="font-mono text-xs text-purple-400">ESC/POS Compatible</span>
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                    <TrendingUp size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Daily Automated Settlement</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Consolidate register takings into your master merchant vault each evening with automatic revenue analytics.
                  </p>
                  <span className="font-mono text-xs text-emerald-400">Zero Chargeback Risk</span>
                </div>
              </div>
            )}

            {audienceTab === 'institutions' && (
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                    <Terminal size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Multi-Column Desktop Workstation</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Full-screen management portal for finance officers, accountants, and treasury agents to audit double-entry ledger batches.
                  </p>
                  <span className="font-mono text-xs text-blue-400">PostgreSQL Audit Engine</span>
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                    <RefreshCw size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Agent Cash-In / Cash-Out</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Verified branch counters handle physical cash liquidity. Dynamic 30-second TOTP tokens prevent unauthorized withdrawals.
                  </p>
                  <span className="font-mono text-xs text-emerald-400">Fraud Prevention Guaranteed</span>
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Hardware-Backed Vaults</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Multi-signature threshold approval for treasury disbursements and national infrastructure funding allocations.
                  </p>
                  <span className="font-mono text-xs text-amber-400">Ed25519 Cryptographic Signatures</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION IV: MULTI-PLATFORM DOWNLOAD MATRIX (NDS App Suite)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="platforms" className="py-28 bg-[#040609] relative">
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
          <RevealSection>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-mono text-sm text-red-500 font-bold">IV.</span>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">Multi-Platform Ecosystem</span>
              <div className="flex-1 editorial-rule" />
            </div>

            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-tight mb-4">
                Available Everywhere.
              </h2>
              <p className="text-white/50 text-base">
                Single sign-on across mobile, web, POS, and desktop workstation.
              </p>
            </div>
          </RevealSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                platform: 'Android Client',
                tag: 'Google Pixel / Samsung',
                desc: 'Native Material 3 UI with camera QR scanner, biometric keystore, and low-bandwidth fallback.',
                icon: <Smartphone size={24} />,
                accent: 'text-emerald-400',
              },
              {
                platform: 'iOS Application',
                tag: 'iPhone & iPad',
                desc: 'Apple Silicon optimized, Dynamic Island skin, Face ID authentication, and Secure Enclave storage.',
                icon: <Apple size={24} />,
                accent: 'text-blue-400',
              },
              {
                platform: 'Desktop Workstation',
                tag: 'macOS, Windows, Linux',
                desc: 'Standalone multi-column desktop application for institutional treasury and cash agent operations.',
                icon: <Monitor size={24} />,
                accent: 'text-purple-400',
              },
              {
                platform: 'Merchant POS Terminal',
                tag: 'Retail & Grocery',
                desc: 'Touchscreen cashier register with dual-display customer QR codes and thermal receipt output.',
                icon: <Terminal size={24} />,
                accent: 'text-amber-400',
              },
              {
                platform: 'Offline Mesh Protocol',
                tag: 'Resilience Layer',
                desc: 'Signed offline vouchers with replay protection, expiring securely during regional telecom blackouts.',
                icon: <Shield size={24} />,
                accent: 'text-cyan-400',
              },
              {
                platform: 'Web Banking Portal',
                tag: 'Instant Browser Access',
                desc: 'No installation required. Access your full Arakan Dollar wallet securely from any modern web browser.',
                icon: <Globe size={24} />,
                accent: 'text-red-400',
                isAction: true,
              },
            ].map((p, i) => (
              <RevealSection key={p.platform} delay={i * 80}>
                {p.isAction ? (
                  <button
                    onClick={onEnterApp}
                    className="hairline-card p-8 rounded-3xl text-left border-red-500/30 bg-red-950/[0.08] hover:bg-red-950/[0.16] hover:border-red-500/50 transition-all group flex flex-col justify-between h-full w-full"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`p-3 rounded-2xl bg-white/[0.05] ${p.accent}`}>
                          {p.icon}
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-red-400 font-bold">
                          LAUNCH NOW
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{p.platform}</h3>
                      <span className="font-mono text-[11px] text-white/40 block mb-3">{p.tag}</span>
                      <p className="text-xs text-white/60 leading-relaxed">{p.desc}</p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-white group-hover:text-amber-300 transition-colors">
                      <span>OPEN WEB WALLET</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ) : (
                  <div className="hairline-card p-8 rounded-3xl flex flex-col justify-between h-full group">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`p-3 rounded-2xl bg-white/[0.03] ${p.accent}`}>
                          {p.icon}
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">
                          READY
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{p.platform}</h3>
                      <span className="font-mono text-[11px] text-white/40 block mb-3">{p.tag}</span>
                      <p className="text-xs text-white/50 leading-relaxed">{p.desc}</p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono text-white/30 group-hover:text-white/60 transition-colors">
                      <span>SPECIFICATION</span>
                      <span>↗</span>
                    </div>
                  </div>
                )}
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION V: SECURITY & DEFENSE SPECIFICATIONS
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="security" className="py-28 relative">
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
          <RevealSection>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-mono text-sm text-red-500 font-bold">V.</span>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">Zero-Trust Security</span>
              <div className="flex-1 editorial-rule" />
            </div>

            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-tight mb-4">
                <span className="text-white">Built for High-Threat</span>{' '}
                <span className="font-serif italic font-normal text-amber-300">Environments.</span>
              </h2>
              <p className="text-white/50 text-base">
                Engineering defense in depth for a population living through telecom surveillance and financial coercion.
              </p>
            </div>
          </RevealSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Lock size={20} />,
                title: 'AES-256-GCM Ledger',
                desc: 'All ledger journal entries, transfer metadata, and balance slips are encrypted at rest with hardware keys.',
              },
              {
                icon: <Fingerprint size={20} />,
                title: 'Biometric Keystores',
                desc: 'Keys stay inside the device Secure Enclave. Private key material never leaves your physical hardware.',
              },
              {
                icon: <Shield size={20} />,
                title: 'Duress PIN (999999)',
                desc: 'Entering 999999 reveals a realistic ₳ 25 balance while silently dispatching an SOS ping to safety responders.',
              },
              {
                icon: <BadgeCheck size={20} />,
                title: 'Tiered KYC Guard',
                desc: 'Tier 0 anonymous low-limit everyday payments up to Tier 3 corporate cross-border verified accounts.',
              },
            ].map((sec, i) => (
              <RevealSection key={sec.title} delay={i * 100}>
                <div className="hairline-card p-6 rounded-2xl h-full text-left">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/[0.15] flex items-center justify-center text-emerald-400 mb-5">
                    {sec.icon}
                  </div>
                  <h3 className="font-bold text-sm text-white mb-2">{sec.title}</h3>
                  <p className="text-xs text-white/45 leading-relaxed">{sec.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION VI: FREQUENTLY ASKED QUESTIONS (NDS Rotating + / × Style)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#030508] relative">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
          <RevealSection>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-mono text-sm text-red-500 font-bold">VI.</span>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">Inquiries & Governance</span>
              <div className="flex-1 editorial-rule" />
            </div>

            <div className="mb-12">
              <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-tight mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-white/50 text-sm">
                Direct disclosures regarding sovereign backing, legal status, and offline security.
              </p>
            </div>
          </RevealSection>

          {/* Accordion List with Rotating + to × Icons */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <RevealSection key={faq.q} delay={index * 60}>
                  <div className="hairline-card rounded-2xl overflow-hidden transition-colors">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 group"
                    >
                      <span className="text-sm sm:text-base font-semibold text-white/90 group-hover:text-white transition-colors">
                        {faq.q}
                      </span>
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 text-white/50 group-hover:text-white transition-all">
                        <span className={`text-base font-mono transition-transform duration-300 inline-block ${isOpen ? 'rotate-45 text-amber-400' : ''}`}>
                          +
                        </span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-white/55 leading-relaxed border-t border-white/[0.04]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                </RevealSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MONUMENTAL FOOTER (NDS Standard: Genesis / ndstudio.gov / TechForce)
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="relative overflow-hidden bg-black text-white pt-24 pb-12 border-t border-white/[0.08]">
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">

          {/* Monumental Mission Statement */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <RevealSection>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-950/20 text-red-400 text-[11px] font-mono uppercase tracking-widest mb-6">
                <span>The Sovereign Era</span>
              </div>
              <h2 className="text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold tracking-tight leading-[1.05] mb-4">
                The Next Financial Era Begins Now.
              </h2>
              <p className="font-serif italic font-normal text-amber-300 text-[clamp(2.5rem,6vw,4.75rem)] -mt-2 mb-8">
                Follow The Mission.
              </p>
            </RevealSection>

            {/* Email Dispatch Capsule (Genesis.energy.gov Style) */}
            <RevealSection delay={150}>
              <form onSubmit={handleSubscribe} className="max-w-md mx-auto mb-4">
                <div className="rounded-full border border-white/20 bg-white/[0.02] backdrop-blur-2xl p-1.5 flex items-center gap-2 focus-within:border-white/50 transition-colors">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email for sovereign updates"
                    className="bg-transparent px-4 text-xs font-mono text-white placeholder:text-white/30 outline-none flex-1"
                  />
                  <button
                    type="submit"
                    className="pill-button px-5 py-2.5 bg-white text-black font-mono text-xs uppercase tracking-wider font-semibold hover:bg-neutral-200 shrink-0"
                  >
                    {subscribed ? 'Subscribed ✓' : 'Subscribe'}
                  </button>
                </div>
              </form>
              <p className="text-[11px] font-mono text-white/30">
                Encrypted dispatch. No third-party tracking. Unsubscribe at any time.
              </p>
            </RevealSection>
          </div>

          {/* Colossal Watermark Wordmark */}
          <div className="select-none pointer-events-none my-12 text-center overflow-hidden">
            <span className="text-[clamp(4.5rem,14vw,11rem)] font-black tracking-[0.25em] text-white/[0.03] uppercase font-sans inline-block whitespace-nowrap">
              P E T H A R
            </span>
          </div>

          {/* Directory & Policies Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-white/[0.06] text-xs font-mono">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <ArakanEmblem size={22} variant="badge" />
                <span className="font-bold text-white text-sm">PeThar (ဖေ့သာ)</span>
              </div>
              <p className="text-white/40 leading-relaxed mb-4">
                The Sovereign Digital Wallet & Financial Network of the Arakan Nation.
              </p>
              <div className="text-[11px] text-amber-400">
                Arakan Dollar (AKD) 1:1 USD Parity
              </div>
            </div>

            <div>
              <span className="text-white/30 uppercase tracking-widest block mb-4">Platforms</span>
              <ul className="space-y-2.5 text-white/50">
                <li><button onClick={onEnterApp} className="hover:text-white transition-colors">Web Banking Portal</button></li>
                <li><a href="#platforms" className="hover:text-white transition-colors">Android Mobile APK</a></li>
                <li><a href="#platforms" className="hover:text-white transition-colors">iOS TestFlight</a></li>
                <li><a href="#platforms" className="hover:text-white transition-colors">Merchant POS Register</a></li>
                <li><a href="#platforms" className="hover:text-white transition-colors">macOS & Electron</a></li>
              </ul>
            </div>

            <div>
              <span className="text-white/30 uppercase tracking-widest block mb-4">Governance</span>
              <ul className="space-y-2.5 text-white/50">
                <li><a href="#reserves" className="hover:text-white transition-colors">Proof of Reserves Audit</a></li>
                <li><a href="#mission" className="hover:text-white transition-colors">Monetary Policy Charter</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Blackout Mesh Protocol</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Tiered AML / KYC Rules</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Agent Counter Agreement</a></li>
              </ul>
            </div>

            <div>
              <span className="text-white/30 uppercase tracking-widest block mb-4">Sovereign Contact</span>
              <p className="text-white/50 leading-relaxed mb-2">
                Sittwe National Treasury Enclave
              </p>
              <p className="text-white/50 font-mono text-[11px] mb-4">
                SWIFT Routing: ARAKMMXX
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Regional Mesh Relays Online</span>
              </div>
            </div>
          </div>

          {/* Unified Attribution Bar (The NDS Stamp) */}
          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono text-white/40">
            <div>
              © 2026 PeThar (ဖေ့သာ). Authorized by the Arakan National Authority.
            </div>

            {/* Signature Signature matching ndstudio.gov / genesis.energy.gov */}
            <div className="text-center md:text-right text-white/60">
              Designed & Engineered in Sittwe & D.C. by Arakan National Design Studio
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: SECURE PORTAL LOGIN
      ═══════════════════════════════════════════════════════════════════ */}
      {showLogin && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="relative w-full max-w-md p-8 sm:p-10 rounded-3xl hairline-card bg-[#080B10] shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <ArakanEmblem size={32} variant="badge" />
              <div>
                <h3 className="text-base font-bold text-white font-sans">PeThar Secure Access</h3>
                <span className="text-[11px] font-mono text-white/40">Arakan Central Ledger Enclave</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                  PeThar ID or Verified Phone
                </label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="ARAK-XXXX or +66..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 text-sm font-mono outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                  6-Digit Master Security PIN
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="● ● ● ● ● ●"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 text-sm font-mono tracking-[0.3em] outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="pill-button w-full py-3.5 bg-white text-black font-mono text-xs uppercase tracking-wider font-semibold hover:bg-neutral-200 mt-2 shadow-lg"
              >
                Authenticate & Enter
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-white/30">Need a sovereign account? </span>
                <button
                  type="button"
                  onClick={() => { setShowLogin(false); onEnterApp() }}
                  className="text-xs font-mono text-amber-400 hover:underline"
                >
                  Create Wallet Instantly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
