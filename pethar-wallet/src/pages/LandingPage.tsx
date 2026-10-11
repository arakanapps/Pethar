import { useState, useEffect, useRef } from 'react'
import { ArakanEmblem, FlagArakan, FlagInternational } from '../components/ArakanEmblem'
import type { Language } from '../i18n'
import {
  Shield, Globe, Smartphone,
  ArrowRight, Download, Apple, Lock,
  QrCode, TrendingUp, ChevronDown,
  Send, Sun, Moon,
  Menu, X, Sparkles, Building2, Store, Terminal, CheckCircle,
  PhoneCall, Zap, Receipt, Radio, MessageSquare, ArrowUpRight,
  ExternalLink, Layers, Wallet
} from 'lucide-react'

interface LandingPageProps {
  onEnterApp?: () => void
  onOpenBanking?: () => void
  lang?: Language
  setLang?: (lang: Language) => void
  theme?: 'dark' | 'light'
  setTheme?: (theme: 'dark' | 'light') => void
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

/* ─── Metric Stat Card ────────────────────────────────────────────────── */
function StatCard({
  value,
  label,
  colorClass = 'text-white',
  formatValue,
}: {
  value: number
  label: string
  colorClass?: string
  formatValue?: (val: number) => string
}) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="liquid-glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
      <div className={`text-[clamp(1.75rem,3.2vw,2.5rem)] font-extrabold font-mono tracking-tight ${colorClass}`}>
        {formatValue ? formatValue(count) : `${count.toLocaleString()}+`}
      </div>
      <div className="text-[11px] font-mono text-white/50 uppercase tracking-wider mt-1 font-medium">
        {label}
      </div>
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
    MAIN MTB PAY STYLE + LIQUID GLASS LANDING PAGE
═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage({
  onEnterApp,
  onOpenBanking,
  lang = 'arak',
  setLang,
  theme = 'dark',
  setTheme,
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeFeatureTab, setActiveFeatureTab] = useState<'consumer' | 'agent' | 'merchant' | 'remittance'>('consumer')
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPin, setLoginPin] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
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
    { label: lang === 'arak' ? 'ပင်မ' : 'Home', href: '#hero' },
    { label: lang === 'arak' ? 'လုပ်ဆောင်ချက်များ' : 'Features', href: '#features' },
    { label: lang === 'arak' ? 'ဝန်ဆောင်မှုများ' : 'Services', href: '#services' },
    { label: lang === 'arak' ? 'မိတ်ဖက်များ' : 'Partners', href: '#partners' },
    { label: lang === 'arak' ? 'အရန်ရံပုံငွေ' : 'Reserves', href: '#reserves' },
    { label: lang === 'arak' ? 'ဒေါင်းလုဒ်' : 'Download', href: '#download' },
    { label: lang === 'arak' ? 'လုံခြုံရေး' : 'Security', href: '#security' },
  ]

  // MTB Pay Style Features Matrix Data
  const featureTabsData = {
    consumer: {
      title: lang === 'arak' ? 'ပြည်သူလူထု သုံးစွဲမှု' : 'Consumer Wallet',
      description: lang === 'arak'
        ? 'နေ့စဉ် ငွေပေးချေမှု၊ အခမဲ့ ငွေလွှဲခြင်းနှင့် ဖုန်းဘေလ်ဖြည့်သွင်းမှုများကို လက်ကိုင်ဖုန်းဖြင့် အလွယ်တကူ ဆောင်ရွက်နိုင်ပါသည်'
        : 'Daily payments, zero-fee peer-to-peer transfers, and instant bill payments in the palm of your hand.',
      features: [
        {
          title: lang === 'arak' ? 'အခမဲ့ ချက်ချင်းငွေလွှဲ' : 'Instant 0-Fee Transfer',
          desc: lang === 'arak' ? 'အာရက္ခဒေါ်လာ (AKD) ကို ဖုန်းနံပါတ် သို့မဟုတ် Citizen ID ဖြင့် ၂၅၀ မီလီစက္ကန့်အတွင်း အခမဲ့ လွှဲပို့နိုင်ပါသည်' : 'Send Arakan Dollar (AKD) to any citizen ID or phone number in sub-second finality with zero transfer fees.',
          icon: <Send className="w-5 h-5 text-amber-400" />,
        },
        {
          title: lang === 'arak' ? 'ArakanPay QR ငွေပေးချေမှု' : 'ArakanPay QR Checkout',
          desc: lang === 'arak' ? 'ဈေးဆိုင်၊ စားသောက်ဆိုင်နှင့် ကုန်တိုက်များတွင် Dynamic QR စကင်ဖတ်၍ လျင်မြန်စွာ ငွေပေးချေပါ' : 'Scan ArakanPay QR codes at participating retail merchants and food stalls for instant settlement.',
          icon: <QrCode className="w-5 h-5 text-cyan-400" />,
        },
        {
          title: lang === 'arak' ? 'အော့ဖ်လိုင်း ဘောက်ချာ (NFC/BLE)' : 'Offline Mesh Vouchers',
          desc: lang === 'arak' ? 'အင်တာနက်နှင့် ဖုန်းလိုင်း ပြတ်တောက်နေချိန်တွင် Ed25519 လက်မှတ်ရေးထိုးထားသော ဘောက်ချာဖြင့် ပေးချေပါ' : 'Transact during telecom blackouts via Ed25519 digitally signed vouchers over NFC or Bluetooth mesh.',
          icon: <Radio className="w-5 h-5 text-red-400" />,
        },
        {
          title: lang === 'arak' ? 'ဘေလ်ဆောင်နှင့် မိုဘိုင်းငွေဖြည့်' : 'Bill Payment & Top-Up',
          desc: lang === 'arak' ? 'လျှပ်စစ်မီတာခ၊ အင်တာနက်ဖိုင်ဘာနှင့် ဖုန်းဘေလ်များကို ၂၄ နာရီ စက္ကန့်ပိုင်းအတွင်း ဆောင်ရွက်ပါ' : 'Pay electricity bills, satellite internet bandwidth, and cellular airtime 24/7 without queueing.',
          icon: <Zap className="w-5 h-5 text-emerald-400" />,
        },
      ],
      previewHeadline: '₳ 14,850.00 AKD',
      previewSub: lang === 'arak' ? 'အာရက္ခနိုင်ငံတော် လက်ကျန်ငွေ' : 'Available Sovereign Balance',
      previewBadge: lang === 'arak' ? '✓ အတည်ပြုပြီး' : '✓ KYC Verified Tier 2',
    },
    agent: {
      title: lang === 'arak' ? 'အေးဂျင့် ကောင်တာများ' : 'Cash Agents',
      description: lang === 'arak'
        ? 'စစ်တွေ၊ မြောက်ဦး၊ ကျောက်ဖြူနှင့် မြို့နယ်အသီးသီးရှိ အတည်ပြု အေးဂျင့် ၃၄၀ ကျော်မှတစ်ဆင့် ငွေသားသွင်း/ထုတ်နိုင်ပါသည်'
        : 'Over 340 verified physical cash counters across Arakan townships providing instant deposit and withdrawal.',
      features: [
        {
          title: lang === 'arak' ? '၁၅၀ bps ကော်မရှင် အကျိုးခံစားခွင့်' : '150 bps Agent Commission',
          desc: lang === 'arak' ? 'အေးဂျင့်များသည် ငွေသွင်း/ငွေထုတ် ပမာဏတိုင်းအတွက် ၁.၅% တိုက်ရိုက် ကော်မရှင် ချက်ချင်းရရှိပါသည်' : 'Verified agents earn attractive 1.50% liquidity commissions credited in real-time to their float account.',
          icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
        },
        {
          title: lang === 'arak' ? '၃၀ စက္ကန့် TOTP လိမ်လည်မှုကာကွယ်ရေး' : '30-Sec Dynamic TOTP Token',
          desc: lang === 'arak' ? 'ငွေသားထုတ်ယူတိုင်း ၃၀ စက္ကန့်တစ်ကြိမ် ပြောင်းလဲသော TOTP ကုဒ်ဖြင့် လုံခြုံစွာ အတည်ပြုပါသည်' : 'Zero fraud risk with dynamic 30-second single-use TOTP challenge codes verified at the counter.',
          icon: <Shield className="w-5 h-5 text-cyan-400" />,
        },
        {
          title: lang === 'arak' ? 'ငွေသား စာရင်း အလိုအလျောက် ချိန်ညှိမှု' : 'Automated Float Settlement',
          desc: lang === 'arak' ? 'ဗဟိုဘဏ် စာရင်းစနစ်နှင့် အချိန်နှင့်တပြေးညီ ချိတ်ဆက်ထားပြီး ငွေသားပြတ်လပ်မှု ကာကွယ်ပေးပါသည်' : 'Automatic rebalancing with central reserve float accounts to guarantee counter liquidity.',
          icon: <Building2 className="w-5 h-5 text-amber-400" />,
        },
        {
          title: lang === 'arak' ? 'အော့ဖ်လိုင်း ငွေသား ထုတ်ပေးမှု' : 'Offline Voucher Clearing',
          desc: lang === 'arak' ? 'အင်တာနက် မရှိသည့် အခြေအနေတွင်လည်း ဒစ်ဂျစ်တယ် ဘောက်ချာကို အေးဂျင့်မှ လက်ခံငွေထုတ်ပေးနိုင်ပါသည်' : 'Honor cryptographic offline customer vouchers offline and reconcile upon hub reconnection.',
          icon: <CheckCircle className="w-5 h-5 text-red-400" />,
        },
      ],
      previewHeadline: '₳ 50,000.00 Float',
      previewSub: lang === 'arak' ? 'အေးဂျင့် ငွေသားလှည့်လည်မှု' : 'Agent Daily Liquidity Float',
      previewBadge: lang === 'arak' ? '● စစ်တွေ ဗဟိုအေးဂျင့် #AK-09' : '● Sittwe Central Agent #AK-09',
    },
    merchant: {
      title: lang === 'arak' ? 'ကုန်သည်နှင့် POS စနစ်' : 'Merchants & POS',
      description: lang === 'arak'
        ? 'လက်လီဆိုင်များ၊ စားသောက်ဆိုင်များနှင့် စီးပွားရေးလုပ်ငန်းများအတွက် အထူးပြု Point of Sale ငွေရှင်းကောင်တာ'
        : 'Enterprise and retail point-of-sale registers with instant customer settlement and thermal receipt printing.',
      features: [
        {
          title: lang === 'arak' ? 'Dynamic POS ကောင်တာ စနစ်' : 'Touchscreen POS Register',
          desc: lang === 'arak' ? 'ဆန်၊ လောင်စာဆီ၊ ဆိုလာဘက်ထရီ၊ ဆေးဝါးနှင့် ကုန်ပစ္စည်း စာရင်းများကို တစ်ချက်နှိပ် ငွေရှင်းပါ' : 'Speedy cashier checkout with fast retail presets, tax computation, and custom charge keypad.',
          icon: <Terminal className="w-5 h-5 text-cyan-400" />,
        },
        {
          title: lang === 'arak' ? '၀% ငွေလွှဲခနှင့် ချက်ချင်းစာရင်းဝင်' : '0% Merchant Processing Fee',
          desc: lang === 'arak' ? 'ခရက်ဒစ်ကတ်များကဲ့သို့ ၃% ဖြတ်တောက်ခြင်းမရှိဘဲ ရောင်းရငွေ အပြည့်အဝ ချက်ချင်းဝင်ရောက်ပါသည်' : 'Retain 100% of sales revenue with 0 transaction swipe fees and instantaneous account settlement.',
          icon: <Sparkles className="w-5 h-5 text-amber-400" />,
        },
        {
          title: lang === 'arak' ? 'တရားဝင် အီလက်ထရောနစ် ပြေစာ' : 'Printable & Digital e-Receipt',
          desc: lang === 'arak' ? 'ဖောက်သည်ထံသို့ QR ပြေစာ ပေးပို့နိုင်သည့်အပြင် Thermal Printer ဖြင့် စာရွက်ပြေစာ ထုတ်ပေးနိုင်ပါသည်' : 'Automatic digital SMS/QR receipts with optional Bluetooth 58mm thermal paper printing.',
          icon: <Receipt className="w-5 h-5 text-emerald-400" />,
        },
        {
          title: lang === 'arak' ? 'နေ့စဉ် ရောင်းအား စာရင်းချုပ်' : 'Daily Sales Telemetry & Ledger',
          desc: lang === 'arak' ? 'အာရက္ခဒေါ်လာဖြင့် ရောင်းရငွေများကို နေ့စဉ်/လစဉ် စာရင်းရှင်းတမ်း အလိုအလျောက် ထုတ်ယူပါ' : 'Export auditable double-entry accounting journals directly for bookkeeping and taxes.',
          icon: <Layers className="w-5 h-5 text-red-400" />,
        },
      ],
      previewHeadline: '₳ 8,940.50 Today',
      previewSub: lang === 'arak' ? 'ယနေ့ စုစုပေါင်း ရောင်းအား' : 'Today Total Register Sales',
      previewBadge: lang === 'arak' ? 'POS Terminal #AK-POS-042' : 'POS Terminal #AK-POS-042',
    },
    remittance: {
      title: lang === 'arak' ? 'နိုင်ငံတကာနှင့် ဒစ်ဂျစ်တယ်ဒင်္ဂါး' : 'Diaspora & Crypto',
      description: lang === 'arak'
        ? 'ထိုင်း၊ မလေးရှား၊ စင်ကာပူရောက် အာရက္ခသားများထံမှ နေရပ်သို့ အခမဲ့ တိုက်ရိုက် ငွေလွှဲပို့ခြင်းနှင့် USDT ချိတ်ဆက်မှု'
        : 'Instant diaspora remittance from Thailand, Malaysia, Singapore, and global USDT stablecoin bridge.',
      features: [
        {
          title: lang === 'arak' ? 'ထိုင်း၊ မလေး၊ စင်ကာပူ တိုက်ရိုက်' : 'PromptPay / DuitNow Corridors',
          desc: lang === 'arak' ? 'ထိုင်း PromptPay၊ မလေး DuitNow၊ စင်ကာပူ PayNow တို့မှတစ်ဆင့် ဒေသတွင်းဘဏ်အတိုင်း လွှဲနိုင်ပါသည်' : 'Direct integration with ASEAN real-time gross settlement payment rails without black-market Hundi fees.',
          icon: <Globe className="w-5 h-5 text-cyan-400" />,
        },
        {
          title: lang === 'arak' ? 'USDT ၁:၁ တိကျသော Parity' : 'USDT 1:1 Stablecoin Parity',
          desc: lang === 'arak' ? 'TRC-20, ERC-20, TON, Polygon မှတစ်ဆင့် USDT သွင်း/ထုတ်မှုများကို ၁:၁ တန်ဖိုးအပြည့် လဲလှယ်ပေးပါသည်' : 'Direct on-chain deposit addresses for TRC-20 and ERC-20 with guaranteed 1 USDT = 1.00 AKD parity.',
          icon: <Wallet className="w-5 h-5 text-emerald-400" />,
        },
        {
          title: lang === 'arak' ? 'Binance & MEXC Bridge' : 'Binance Pay & MEXC Bridge',
          desc: lang === 'arak' ? 'Binance Pay ID သို့မဟုတ် MEXC UID မှတစ်ဆင့် ကမ္ဘာ့မည်သည့်နေရာမှမဆို အခမဲ့ ငွေဖြည့်သွင်းပါ' : 'Zero-fee inward wire directly using Binance Pay and MEXC exchange user identifiers.',
          icon: <ExternalLink className="w-5 h-5 text-amber-400" />,
        },
        {
          title: lang === 'arak' ? 'ငွေကြေးဖောင်းပွမှု ကာကွယ်ရေး' : 'Zero Inflation Exposure',
          desc: lang === 'arak' ? 'တန်ဖိုးကျဆင်းနေသော မြန်မာကျပ်ငွေအစား ခိုင်မာသော အာရက္ခဒေါ်လာဖြင့် တန်ဖိုးမပျက် သိမ်းဆည်းပါ' : 'Protect hard-earned foreign labor earnings from local currency depreciation and banking freezes.',
          icon: <Shield className="w-5 h-5 text-red-400" />,
        },
      ],
      previewHeadline: '1 USDT = ₳ 1.00',
      previewSub: lang === 'arak' ? 'အာရက္ခဗဟိုဘဏ် အာမခံနှုန်း' : 'Central Bank Guaranteed Parity',
      previewBadge: lang === 'arak' ? 'Wise / Swift API Linked' : 'Wise / Swift API Linked',
    },
  }

  const currentTabInfo = featureTabsData[activeFeatureTab]

  return (
    <div className={`min-h-screen text-[#F1F0E0] overflow-x-hidden selection:bg-red-700/60 selection:text-white font-sans relative ${
      theme === 'light' ? 'bg-[#F4F6FB] text-neutral-900' : 'bg-[#06090E] text-[#F1F0E0]'
    }`}>

      {/* ── AMBIENT LIQUID GLASS ORBS BACKGROUND ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[650px] h-[650px] rounded-full bg-red-600/[0.12] blur-[150px] animate-pulse-glow" />
        <div className="absolute top-[35%] right-[-5%] w-[550px] h-[550px] rounded-full bg-amber-500/[0.08] blur-[140px] animate-float-slow" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-600/[0.07] blur-[160px] animate-float-reverse" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MTB PAY STYLE TOP HOTLINE & LANGUAGE BAR
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-50 border-b border-white/[0.08] bg-black/60 backdrop-blur-xl text-[11px] font-mono tracking-wider py-1.5 px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Hotline & Official Authority */}
          <div className="flex items-center gap-4 text-white/70">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white/40 font-bold uppercase">{lang === 'arak' ? 'အကူအညီ ဖုန်း' : 'Hotline'} :</span>
              <a href="tel:+959798112334" className="text-white hover:text-amber-300 transition-colors font-bold">+95 9 798 112 334</a>
            </div>
            <div className="hidden md:inline-block w-[1px] h-3 bg-white/20" />
            <div className="hidden md:flex items-center gap-1.5 text-white/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{lang === 'arak' ? 'အာရက္ခဗဟိုဘဏ် တရားဝင် စာရင်းစနစ်' : 'Official Platform of the Bank of Arakan'}</span>
            </div>
          </div>

          {/* Right: Live FX Ticker + Bilingual Switcher + Theme Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-[10px] text-white/60 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/10">
              <span className="text-emerald-400 font-bold">1 AKD = 1.00 USD</span>
              <span className="text-white/30">•</span>
              <span className="text-amber-400">THB 35.80</span>
              <span className="text-white/30">•</span>
              <span className="text-cyan-400">1 USDT = 1.00 AKD</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-white/[0.06] border border-white/10 rounded-full p-0.5">
              <button
                onClick={() => setLang && setLang('arak')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  lang === 'arak' ? 'bg-red-700 text-white shadow-sm' : 'text-white/60 hover:text-white'
                }`}
                title="ရခိုင်ဘာသာ"
              >
                <FlagArakan size={13} />
                <span>ရခိုင်</span>
              </button>
              <button
                onClick={() => setLang && setLang('en')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  lang === 'en' ? 'bg-blue-700 text-white shadow-sm' : 'text-white/60 hover:text-white'
                }`}
                title="English"
              >
                <FlagInternational size={13} />
                <span>EN</span>
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme && setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/70 transition-colors"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          STICKY LIQUID GLASS NAVIGATION BAR (MTB Pay Structure)
      ═══════════════════════════════════════════════════════════════════ */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#090D14]/85 backdrop-blur-2xl border-b border-white/[0.12] shadow-2xl shadow-black/70'
          : 'bg-[#090D14]/50 backdrop-blur-md border-b border-white/[0.05]'
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-[74px] flex items-center justify-between">
          {/* Logo Brand with Liquid Glass Glow */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-600/40 blur-lg group-hover:scale-125 transition-transform" />
              <ArakanEmblem size={38} variant="badge" className="relative drop-shadow-md" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black tracking-tight text-white font-sans">PeThar</span>
                <span className="text-xs font-mono font-bold text-amber-400">AKD</span>
                <span className="hidden sm:inline-block text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
                  SOVEREIGN
                </span>
              </div>
              <p className="text-[10px] text-white/40 hidden sm:block font-sans -mt-0.5">
                {lang === 'arak' ? 'အာရက္ခအမျိုးသား ဒစ်ဂျစ်တယ်ဘဏ်' : 'Bank of Arakan Mobile Platform'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-mono text-[12px] tracking-wide">
            {navMenuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative px-3.5 py-2 text-white/60 hover:text-white transition-colors group rounded-xl hover:bg-white/[0.03]"
              >
                <span>{item.label}</span>
                <span className="absolute bottom-1 left-3.5 right-3.5 h-[1.5px] bg-gradient-to-r from-red-500 to-amber-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowLoginModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/70 hover:text-white px-3 py-2 rounded-xl border border-white/10 hover:bg-white/[0.05] transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'arak' ? 'အကောင့်ဝင်ရန်' : 'Login'}</span>
            </button>

            <button
              onClick={handleOpenBankingClick}
              className="liquid-glass-pill px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 shadow-lg group active:scale-95"
            >
              <span>{lang === 'arak' ? 'ဝဘ်ဘဏ်လုပ်ငန်း' : 'Web Banking'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white rounded-xl bg-white/[0.05]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
                {lang === 'arak' ? 'အကောင့်ဝင်ရန်' : 'Portal Login'}
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleOpenBankingClick() }}
                className="w-full py-3 text-center bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold rounded-xl"
              >
                {lang === 'arak' ? 'ဝဘ်ဘဏ်လုပ်ငန်း စတင်ရန်' : 'Launch Online Banking'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: HERO MONUMENT (MTB Pay Banner + Liquid Glass Showcase)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative pt-12 pb-24 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left 7 Columns: Hero Text & Download Suite */}
            <div className="lg:col-span-7 text-left space-y-6">
              <RevealSection delay={0}>
                {/* Government Status Capsule */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full liquid-glass-pill border border-white/15 text-xs font-mono tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/80 font-bold">ARAKAN CENTRAL DIGITAL LEDGER</span>
                  <span className="text-white/30">•</span>
                  <span className="text-amber-300 font-bold">1:1 USD PARITY</span>
                </div>
              </RevealSection>

              <RevealSection delay={100}>
                {/* Monumental Headline */}
                <h1 className="text-[clamp(2.5rem,5.5vw,4.75rem)] font-extrabold tracking-[-0.03em] leading-[1.05]">
                  <span className="block text-white">
                    {lang === 'arak' ? 'အာရက္ခအမျိုးသား' : 'The Sovereign'}
                  </span>
                  <span className="block bg-gradient-to-r from-red-500 via-amber-300 to-amber-500 bg-clip-text text-transparent font-serif italic font-normal text-[clamp(2.75rem,6.2vw,5.25rem)] -mt-1">
                    {lang === 'arak' ? 'ဒစ်ဂျစ်တယ်ငွေပေးချေမှုစနစ်' : 'Mobile Banking Super App'}
                  </span>
                </h1>
              </RevealSection>

              <RevealSection delay={200}>
                <p className="text-base sm:text-lg text-white/65 max-w-xl leading-relaxed">
                  {lang === 'arak'
                    ? 'ဖေ့သာ (PeThar) သည် အာရက္ခဒေါ်လာ (AKD) အခြေပြု တရားဝင် မိုဘိုင်းငွေပေးချေမှုစနစ် ဖြစ်ပြီး ၁:၁ အမေရိကန်ဒေါ်လာ အရန်ငွေနှင့် ရွှေဒင်္ဂါးတန်ဖိုး အပြည့်အဝ ကျောထောက်နောက်ခံ ပြုထားပါသည်။ ဆက်သွယ်ရေးပြတ်တောက်ချိန်တွင်လည်း အော့ဖ်လိုင်း ဆက်လက် အသုံးပြုနိုင်ပါသည်။'
                    : 'PeThar is the sovereign financial infrastructure for Arakan. 100% reserve-backed, zero inflation loss, sub-second domestic finality, and cryptographically resilient through telecommunication blackouts.'}
                </p>
              </RevealSection>

              {/* MTB Pay Style App Download Badges with Liquid Glass */}
              <RevealSection delay={300}>
                <div className="pt-2">
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-3 flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'arak' ? 'မိုဘိုင်းအက်ပ် ဒေါင်းလုဒ်ရယူရန်' : 'Download Official Mobile App'}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Google Play */}
                    <a
                      href="#download"
                      className="liquid-glass-pill px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/15 hover:border-white/30 transition-all hover:scale-105 active:scale-95 group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                        <Smartphone size={18} />
                      </div>
                      <div className="text-left font-mono">
                        <div className="text-[9px] text-white/40 uppercase leading-none">GET IT ON</div>
                        <div className="text-xs font-bold text-white leading-tight">Google Play</div>
                      </div>
                    </a>

                    {/* Apple App Store */}
                    <a
                      href="#download"
                      className="liquid-glass-pill px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/15 hover:border-white/30 transition-all hover:scale-105 active:scale-95 group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                        <Apple size={18} />
                      </div>
                      <div className="text-left font-mono">
                        <div className="text-[9px] text-white/40 uppercase leading-none">DOWNLOAD ON</div>
                        <div className="text-xs font-bold text-white leading-tight">App Store</div>
                      </div>
                    </a>

                    {/* Direct Signed APK */}
                    <a
                      href="#download"
                      className="liquid-glass-pill px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/15 hover:border-white/30 transition-all hover:scale-105 active:scale-95 group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                        <Download size={18} />
                      </div>
                      <div className="text-left font-mono">
                        <div className="text-[9px] text-white/40 uppercase leading-none">DIRECT DOWNLOAD</div>
                        <div className="text-xs font-bold text-white leading-tight">Android APK</div>
                      </div>
                    </a>
                  </div>
                </div>
              </RevealSection>

              {/* MTB Pay Style Community Viber / Telegram Join Bar */}
              <RevealSection delay={400}>
                <div className="liquid-glass-card rounded-2xl p-3.5 border border-white/10 max-w-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {lang === 'arak' ? 'PeThar တရားဝင် တယ်လီဂရမ်နှင့် ဗိုက်ဘာ အဖွဲ့' : 'Join PeThar Official Community & Support'}
                      </p>
                      <p className="text-[10px] text-white/40 font-mono">
                        {lang === 'arak' ? 'နေ့စဉ် ငွေလဲနှုန်းနှင့် အသိပေးချက်များ ရယူပါ' : 'Live exchange rates, agent alerts & updates'}
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <span>{lang === 'arak' ? 'ဝင်ရောက်ရန်' : 'Join Now'}</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </RevealSection>
            </div>

            {/* Right 5 Columns: Liquid Glass Floating Device & Benefit Badges */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <RevealSection delay={200} className="relative w-full max-w-[420px]">

                {/* Central Liquid Glass Mockup Chassis */}
                <div className="liquid-glass-card rounded-[44px] p-4 border border-white/20 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                  {/* Glass Gloss Sheen */}
                  <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

                  {/* Device Header */}
                  <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-white/10 text-xs">
                    <div className="flex items-center gap-2">
                      <ArakanEmblem size={24} variant="badge" />
                      <span className="font-bold text-white">PeThar Pay</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      CONNECTED
                    </span>
                  </div>

                  {/* Inside Mock Wallet Display */}
                  <div className="p-4 space-y-4">
                    {/* Balance Card in Liquid Glass */}
                    <div className="liquid-glass p-5 rounded-3xl border border-white/15 text-center relative overflow-hidden">
                      <div className="text-[11px] font-mono uppercase text-white/50 tracking-wider">
                        {lang === 'arak' ? 'အာရက္ခဒေါ်လာ လက်ကျန်ငွေ' : 'Arakan Dollar Balance'}
                      </div>
                      <div className="text-3xl font-black text-amber-300 font-mono tracking-tight mt-1">
                        ₳ 14,850.00
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 mt-1">
                        ≈ $14,850.00 USD (100% Reserve Backed)
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10">
                        <button onClick={handleOpenBankingClick} className="py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex flex-col items-center gap-0.5 transition">
                          <Send size={14} className="text-amber-400" />
                          <span>{lang === 'arak' ? 'လွှဲမည်' : 'Send'}</span>
                        </button>
                        <button onClick={handleOpenBankingClick} className="py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex flex-col items-center gap-0.5 transition">
                          <QrCode size={14} className="text-cyan-400" />
                          <span>{lang === 'arak' ? 'လက်ခံ' : 'Receive'}</span>
                        </button>
                        <button onClick={handleOpenBankingClick} className="py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex flex-col items-center gap-0.5 transition">
                          <Building2 size={14} className="text-emerald-400" />
                          <span>{lang === 'arak' ? 'ထုတ်ယူ' : 'Cash Out'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Services Icons */}
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-white/70 font-mono">
                      <div className="p-2 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center gap-1">
                        <Zap size={16} className="text-amber-400" />
                        <span>{lang === 'arak' ? 'မီတာခ' : 'Bills'}</span>
                      </div>
                      <div className="p-2 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center gap-1">
                        <Radio size={16} className="text-red-400" />
                        <span>{lang === 'arak' ? 'အော့ဖ်လိုင်း' : 'Mesh'}</span>
                      </div>
                      <div className="p-2 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center gap-1">
                        <Globe size={16} className="text-cyan-400" />
                        <span>{lang === 'arak' ? 'Wise ပြည်ပ' : 'Wire'}</span>
                      </div>
                      <div className="p-2 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center gap-1">
                        <Wallet size={16} className="text-purple-400" />
                        <span>{lang === 'arak' ? 'USDT' : 'Crypto'}</span>
                      </div>
                    </div>

                    {/* Recent Transaction Item */}
                    <div className="liquid-glass p-3 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                          ↓
                        </div>
                        <div>
                          <div className="font-bold text-white">Ko Min Aung (ARAK-9042)</div>
                          <div className="text-[10px] text-white/40 font-mono">Just now · P2P Settled</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        + ₳ 500.00
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Liquid Glass Benefit Card 1 (like MTB Pay's "Quick Transfer" badge) */}
                <div className="absolute -left-6 top-16 liquid-glass-card rounded-2xl p-3 border border-white/20 shadow-2xl flex items-center gap-3 animate-float-slow max-w-[200px] z-20">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Send size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {lang === 'arak' ? 'ချက်ချင်းငွေလွှဲ' : 'Quick Transfer'}
                    </h4>
                    <p className="text-[9px] text-white/50 leading-tight mt-0.5">
                      {lang === 'arak' ? '၀% ငွေလွှဲခ၊ ၂၅၀ မီလီစက္ကန့်' : '0% fee, instant settlement'}
                    </p>
                  </div>
                </div>

                {/* Floating Liquid Glass Benefit Card 2 (like MTB Pay's "Pay Bills" badge) */}
                <div className="absolute -right-6 bottom-16 liquid-glass-card rounded-2xl p-3 border border-white/20 shadow-2xl flex items-center gap-3 animate-float-reverse max-w-[210px] z-20">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Radio size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {lang === 'arak' ? 'အော့ဖ်လိုင်း မက်ရှ်' : 'Blackout Mesh'}
                    </h4>
                    <p className="text-[9px] text-white/50 leading-tight mt-0.5">
                      {lang === 'arak' ? 'အင်တာနက်မလို NFC ဖြင့် ပေးချေ' : 'Ed25519 signed tap-to-pay'}
                    </p>
                  </div>
                </div>
              </RevealSection>
            </div>

          </div>
        </div>
      </section>

      {/* ─── LIQUID GLASS PARTNERS MARQUEE BAR ───────────────────────────── */}
      <div className="border-y border-white/[0.08] bg-black/40 backdrop-blur-xl py-4 overflow-hidden">
        <Marquee speed={32}>
          <div className="flex items-center gap-12 font-mono text-xs text-white/50 uppercase tracking-widest px-6">
            <span className="flex items-center gap-2 text-white/80 font-bold">
              <ArakanEmblem size={18} variant="badge" /> Bank of Arakan
            </span>
            <span>•</span>
            <span className="text-amber-400 font-bold">Sittwe Central Vault</span>
            <span>•</span>
            <span>Mrauk-U Sovereign Bullion</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">PromptPay Thailand Direct</span>
            <span>•</span>
            <span>DuitNow Malaysia Wire</span>
            <span>•</span>
            <span className="text-cyan-400 font-bold">Binance Pay 1:1 Bridge</span>
            <span>•</span>
            <span>MEXC Global Corridor</span>
            <span>•</span>
            <span className="text-purple-400 font-bold">USDT TRC-20 Liquidity Vault</span>
            <span>•</span>
            <span>Starlink Blackout Mesh</span>
            <span>•</span>
          </div>
        </Marquee>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: ABOUT PETHAR (Matching MTB Pay About Structure)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative border-t border-b border-white/[0.08] bg-black/40">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left 6 Columns: Interactive Visual Presentation Card */}
            <div className="lg:col-span-6">
              <RevealSection>
                <div className="liquid-glass-card rounded-[32px] p-8 border border-white/15 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <ArakanEmblem size={44} variant="badge" />
                      <div>
                        <h3 className="text-lg font-bold text-white">Bank of Arakan</h3>
                        <p className="text-xs text-amber-400 font-mono">Central Monetary Authority</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                      105% OVER-BACKED
                    </span>
                  </div>

                  <div className="space-y-4 text-sm text-white/70">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-medium">1:1 USD Liquid Asset Reserve</strong>
                        <span className="text-xs text-white/50">Guaranteed parity with US Treasuries and Swiss-vaulted physical gold bullion. Zero fractional reserve lending.</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-medium">Double-Entry Cryptographic Ledger</strong>
                        <span className="text-xs text-white/50">Every transfer is recorded to an append-only PostgreSQL ledger with row-level locking and SHA-256 tamper-evident hash chaining.</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-medium">Secure Enclave Hardware Keystore</strong>
                        <span className="text-xs text-white/50">Biometric Face ID / Touch ID hardware authorization and emergency distress panic PIN (999999) protection.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealSection>
            </div>

            {/* Right 6 Columns: Narrative & CTA */}
            <div className="lg:col-span-6 space-y-6">
              <RevealSection delay={150}>
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  <Sparkles size={14} />
                  <span>{lang === 'arak' ? 'ဖေ့သာအကြောင်း သိကောင်းစရာ' : 'About PeThar Platform'}</span>
                </div>

                <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-tight text-white leading-tight">
                  {lang === 'arak' ? 'အာရက္ခပြည်သူများအတွက် ခေတ်မီ ဒစ်ဂျစ်တယ်ဘဏ်စနစ်' : 'Effortless Sovereign Banking, 24/7 Directly from Your Smartphone.'}
                </h2>

                <p className="text-white/60 leading-relaxed text-base">
                  {lang === 'arak'
                    ? 'အာရက္ခဗဟိုဘဏ်မှ တရားဝင် ထုတ်ဝေသော ဖေ့သာ (PeThar) သည် မြန်မာကျပ်ငွေ တန်ဖိုးကျဆင်းမှုနှင့် ဘဏ်များ ငွေထုတ်ကန့်သတ်မှု ဒုက္ခများမှ လွတ်မြောက်စေရန် အာရက္ခပြည်သူများနှင့် ကမ္ဘာတစ်ဝှမ်းရှိ ရွှေ့ပြောင်းလုပ်သားများအတွက် တည်ဆောက်ထားသော ခိုင်မာသည့် ဘဏ္ဍာရေး အခြေခံအဆောက်အအုံ ဖြစ်ပါသည်။'
                    : 'PeThar, powered by the Bank of Arakan, offers citizens and businesses effortless access to sovereign financial services directly from their smartphones. Whether connecting to merchant POS registers, cashing out at verified neighborhood agents, or receiving family remittances from abroad, transactions flow freely without banking hour limits.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    onClick={handleOpenBankingClick}
                    className="liquid-glass-pill px-7 py-3.5 rounded-2xl font-bold text-sm text-white flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition"
                  >
                    <span>{lang === 'arak' ? 'အသေးစိတ် လေ့လာရန်' : 'Explore Platform Details'}</span>
                    <ArrowRight size={16} />
                  </button>

                  <a
                    href="#download"
                    className="px-6 py-3.5 rounded-2xl border border-white/15 hover:bg-white/[0.05] text-white/80 font-mono text-xs uppercase tracking-wider transition"
                  >
                    {lang === 'arak' ? 'အက်ပ် ဒေါင်းလုဒ်' : 'Get The App'}
                  </a>
                </div>
              </RevealSection>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: MTB PAY STYLE INTERACTIVE FEATURE MATRIX
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-28 relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <RevealSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-red-400 font-bold mb-3">
                <span>◆ COMPREHENSIVE FINANCIAL ENGINE ◆</span>
              </div>
              <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-extrabold text-white tracking-tight">
                {lang === 'arak' ? 'ဖေ့သာ ၏ အဓိက လုပ်ဆောင်ချက်များ' : "PeThar's Core Features"}
              </h2>
              <p className="text-white/50 text-base mt-3">
                {lang === 'arak'
                  ? 'ပြည်သူလူထု၊ အေးဂျင့်၊ ကုန်သည်နှင့် ပြည်ပရောက် အာရက္ခသားများအတွက် ကဏ္ဍအလိုက် အထူးပြု စနစ်များ'
                  : 'Engineered specifically for households, cash counters, merchant checkout, and global diaspora remittances.'}
              </p>

              {/* Segmented Liquid Glass Category Switcher */}
              <div className="mt-8 inline-flex p-1.5 rounded-full liquid-glass border border-white/15 max-w-full overflow-x-auto">
                {(['consumer', 'agent', 'merchant', 'remittance'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveFeatureTab(tab)
                      setSelectedFeatureIndex(0)
                    }}
                    className={`px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap font-bold ${
                      activeFeatureTab === tab
                        ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-lg'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {featureTabsData[tab].title}
                  </button>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* 3-Column Interactive Layout matching MTB Pay Feature Box */}
          <div className="grid lg:grid-cols-12 gap-8 items-center">

            {/* Left Column: Features 0 & 1 */}
            <div className="lg:col-span-4 space-y-4">
              {currentTabInfo.features.slice(0, 2).map((feat, idx) => (
                <div
                  key={feat.title}
                  onClick={() => setSelectedFeatureIndex(idx)}
                  className={`liquid-glass-card p-6 rounded-3xl border transition-all cursor-pointer ${
                    selectedFeatureIndex === idx
                      ? 'border-amber-400/60 bg-white/[0.08] shadow-2xl shadow-amber-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                      {feat.icon}
                    </div>
                    <h3 className="text-base font-bold text-white">{feat.title}</h3>
                  </div>
                  <p className="text-xs text-white/55 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>

            {/* Center Column: Liquid Glass Interactive Smartphone Mockup */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="liquid-glass-card rounded-[44px] p-5 border border-white/25 w-full max-w-[340px] shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                {/* Specular Glare */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                {/* Device Pill */}
                <div className="w-24 h-4 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>

                <div className="text-center py-4 px-2 space-y-3">
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/30 inline-block">
                    {currentTabInfo.previewBadge}
                  </span>

                  <div className="text-2xl font-black font-mono text-white tracking-tight">
                    {currentTabInfo.previewHeadline}
                  </div>

                  <p className="text-[11px] text-white/50 font-mono">
                    {currentTabInfo.previewSub}
                  </p>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2 mt-4">
                    <div className="text-xs font-bold text-amber-300">
                      {currentTabInfo.features[selectedFeatureIndex].title}
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      {currentTabInfo.features[selectedFeatureIndex].desc}
                    </p>
                  </div>

                  <button
                    onClick={handleOpenBankingClick}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-mono text-xs font-bold shadow-lg"
                  >
                    {lang === 'arak' ? 'စနစ် အသုံးပြုရန်' : 'Open in App'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Features 2 & 3 */}
            <div className="lg:col-span-4 space-y-4">
              {currentTabInfo.features.slice(2, 4).map((feat, idx) => (
                <div
                  key={feat.title}
                  onClick={() => setSelectedFeatureIndex(idx + 2)}
                  className={`liquid-glass-card p-6 rounded-3xl border transition-all cursor-pointer ${
                    selectedFeatureIndex === idx + 2
                      ? 'border-amber-400/60 bg-white/[0.08] shadow-2xl shadow-amber-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                      {feat.icon}
                    </div>
                    <h3 className="text-base font-bold text-white">{feat.title}</h3>
                  </div>
                  <p className="text-xs text-white/55 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: SERVICES SUITE (Matching MTB Pay Services Section)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="services" className="py-24 border-t border-b border-white/[0.08] bg-[#05080E]/70">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <RevealSection>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-red-400 font-bold">
                  {lang === 'arak' ? 'နေ့စဉ် ဝန်ဆောင်မှုများ' : 'Everyday Convenience'}
                </span>
                <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] font-bold text-white tracking-tight mt-1">
                  {lang === 'arak' ? 'ဖေ့သာ ၏ ဝန်ဆောင်မှု ကဏ္ဍများ' : 'All Everyday Services'}
                </h2>
              </div>
              <p className="text-white/50 text-sm max-w-md mt-4 md:mt-0">
                {lang === 'arak'
                  ? 'အိမ်သုံးလျှပ်စစ်မီတာခ၊ ဖုန်းဘေလ်၊ ကုန်စုံဆိုင်များနှင့် ကူးတို့သင်္ဘောလက်မှတ်များကို ဖေ့သာဖြင့် အချိန်မရွေး ပေးချေနိုင်ပါသည်'
                  : 'Pay utility bills, cellular internet data, merchant retail goods, and inter-township transit anytime, anywhere.'}
              </p>
            </div>
          </RevealSection>

          {/* 6-Card Services Grid with Liquid Glass */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: lang === 'arak' ? 'လျှပ်စစ်မီတာနှင့် ရေဘေလ်' : 'Electricity & Utility Bills',
                desc: lang === 'arak' ? 'စစ်တွေ၊ မြောက်ဦး လျှပ်စစ်ဓာတ်အားခများကို မီတာဘောက်နံပါတ်ဖြင့် ၂၄ နာရီ ချက်ချင်း ပေးချေပါ' : 'Instant 24/7 settlement for regional electricity boards, solar grid cooperatives, and municipal utilities.',
                icon: <Zap className="w-6 h-6 text-amber-400" />,
                badge: 'INSTANT PAY',
              },
              {
                title: lang === 'arak' ? 'မိုဘိုင်းဖုန်းနှင့် အင်တာနက် ဒေတာ' : 'Mobile Airtime & Starlink Data',
                desc: lang === 'arak' ? 'MPT, ATOM, Mytel, Ooredoo နှင့် ဂြိုဟ်တု အင်တာနက် bandwidth ဘေလ်များကို အထူးလျှော့ဈေးဖြင့် ဖြည့်ပါ' : 'Top up cellular phone credits and satellite internet data packages with exclusive cash-back rewards.',
                icon: <Radio className="w-6 h-6 text-cyan-400" />,
                badge: '0% MARKUP',
              },
              {
                title: lang === 'arak' ? 'ခရီးသွားနှင့် ကူးတို့သင်္ဘော လက်မှတ်' : 'Travel & Ferry Ticketing',
                desc: lang === 'arak' ? 'စစ်တွေ-ကျောက်ဖြူ၊ ရမ်းဗြဲ ကူးတို့သင်္ဘောနှင့် အဝေးပြေးကား လက်မှတ်များကို ကြိုတင် ဝယ်ယူပါ' : 'Book inter-township coastal express ferries, speedboats, and regional highway bus tickets online.',
                icon: <Globe className="w-6 h-6 text-emerald-400" />,
                badge: 'E-TICKET',
              },
              {
                title: lang === 'arak' ? 'ပြည်ပ ရွှေ့ပြောင်းလုပ်သား ငွေလွှဲ' : 'Worker Remittances (TH/MY/SG)',
                desc: lang === 'arak' ? 'ထိုင်း PromptPay၊ မလေး DuitNow မှတစ်ဆင့် ငွေလွှဲပါက မြို့နယ်ရှိ မိသားစုထံ စက္ကန့်ပိုင်းအတွင်း ရောက်ရှိပါသည်' : 'Fast and transparent cross-border money transfers direct from Thailand, Malaysia, and Singapore without Hundi cuts.',
                icon: <Send className="w-6 h-6 text-purple-400" />,
                badge: 'REAL-TIME',
              },
              {
                title: lang === 'arak' ? 'USDT & Crypto Gateway' : '1:1 USDT Crypto Vault',
                desc: lang === 'arak' ? 'TRC-20, ERC-20, Binance Pay မှတစ်ဆင့် USDT ကို ၁:၁ အာရက္ခဒေါ်လာသို့ အခမဲ့ ချက်ချင်းလဲလှယ်ပါ' : 'Direct on-chain stablecoin swap bridge with Binance Pay and MEXC exchange integration at parity.',
                icon: <Wallet className="w-6 h-6 text-amber-400" />,
                badge: 'PARITY 1:1',
              },
              {
                title: lang === 'arak' ? 'ကုန်သည် အရောင်း POS စနစ်' : 'Merchant Point of Sale',
                desc: lang === 'arak' ? 'အရောင်းဆိုင်သုံး Touchscreen POS စနစ်ဖြင့် ဖောက်သည်ထံမှ QR ငွေလက်ခံပြီး ပြေစာ ထုတ်ပေးပါ' : 'Complete register solution with custom commodity catalogs, QR payment receipt, and daily sales accounting.',
                icon: <Store className="w-6 h-6 text-red-400" />,
                badge: 'RETAIL READY',
              },
            ].map((srv, i) => (
              <RevealSection key={srv.title} delay={i * 80}>
                <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {srv.icon}
                      </div>
                      <span className="font-mono text-[9px] font-bold px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/70">
                        {srv.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{srv.title}</h3>
                    <p className="text-xs text-white/55 leading-relaxed">{srv.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-white/40 group-hover:text-amber-300 transition-colors">
                    <span>{lang === 'arak' ? 'စတင်သုံးစွဲရန်' : 'USE SERVICE'}</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: BE A PARTNER (MTB Pay Partner Cards Structure)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="partners" className="py-24 relative">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <RevealSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400 font-bold">
                PARTNERSHIP ECOSYSTEM
              </span>
              <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] font-bold text-white tracking-tight mt-1">
                {lang === 'arak' ? 'ဖေ့သာ နှင့် လက်တွဲပူးပေါင်းရန်' : 'Grow With PeThar Network'}
              </h2>
              <p className="text-white/50 text-base mt-2">
                {lang === 'arak'
                  ? 'အာရက္ခတစ်ခွင် ငွေသားကောင်တာ အေးဂျင့် သို့မဟုတ် ကုန်သည် POS လက်ခံသူအဖြစ် ပါဝင်ပါ'
                  : 'Join hundreds of active agents and authorized retail merchants building Arakan prosperity.'}
              </p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Partner Card 1: Agents */}
            <RevealSection delay={100}>
              <div className="liquid-glass-card rounded-[36px] p-8 sm:p-10 border border-amber-500/30 relative overflow-hidden h-full flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6">
                    <Building2 size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {lang === 'arak' ? 'ငွေသားကောင်တာ အေးဂျင့်ဖြစ်ရန်' : 'Become a Cash Agent'}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-6">
                    {lang === 'arak'
                      ? 'ရပ်ကွက်၊ ကျေးရွာများတွင် ပြည်သူများ ငွေသွင်း/ငွေထုတ် ပြုလုပ်နိုင်ရန် တရားဝင် အေးဂျင့်အဖြစ် မှတ်ပုံတင်ပြီး လစဉ် ပုံမှန် ကော်မရှင် ဝင်ငွေ ရယူပါ။'
                      : 'Serve as an authorized cash counter in your township. Provide cash-in and cash-out liquidity to citizens and earn guaranteed commissions.'}
                  </p>

                  <ul className="space-y-3 text-xs font-mono text-white/80 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={15} className="text-emerald-400" />
                      <span>150 bps (1.50%) direct liquidity commission</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={15} className="text-emerald-400" />
                      <span>Dynamic 30-second TOTP token prevents fraud</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={15} className="text-emerald-400" />
                      <span>Dedicated Central Bank float credit line</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleOpenBankingClick}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider font-mono transition shadow-lg"
                >
                  {lang === 'arak' ? 'အေးဂျင့် လျှောက်ထားရန်' : 'Apply as Cash Agent'}
                </button>
              </div>
            </RevealSection>

            {/* Partner Card 2: Merchants */}
            <RevealSection delay={200}>
              <div className="liquid-glass-card rounded-[36px] p-8 sm:p-10 border border-red-500/30 relative overflow-hidden h-full flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center mb-6">
                    <Store size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {lang === 'arak' ? 'ကုန်သည်နှင့် ဆိုင်ရှင်များ' : 'Become a Merchant Partner'}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-6">
                    {lang === 'arak'
                      ? 'သင်၏ ဈေးဆိုင်တွင် ArakanPay QR စနစ် တပ်ဆင်၍ ငွေသားကိုင်တွယ်ရသည့် အန္တရာယ်နှင့် ငွေအတုပြဿနာများကို အပြီးတိုင် ရှင်းထုတ်လိုက်ပါ။'
                      : 'Accept ArakanPay QR payments at your stores with zero transaction fees, instant checkout settlement, and digital audit reporting.'}
                  </p>

                  <ul className="space-y-3 text-xs font-mono text-white/80 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={15} className="text-emerald-400" />
                      <span>0% transaction swipe fee (keep 100% of sales)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={15} className="text-emerald-400" />
                      <span>Dynamic cashier POS touchscreen interface</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={15} className="text-emerald-400" />
                      <span>Instant sub-second settlement directly to wallet</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleOpenBankingClick}
                  className="w-full py-4 rounded-2xl bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider font-mono transition shadow-lg"
                >
                  {lang === 'arak' ? 'ကုန်သည်အဖြစ် စာရင်းသွင်းရန်' : 'Register Merchant Terminal'}
                </button>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: PROOF OF RESERVES & TELEMETRY
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="reserves" className="py-20 border-t border-b border-white/[0.08] bg-black/60 relative">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <RevealSection>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400 font-bold">
                  REAL-TIME NETWORK METROLOGY
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {lang === 'arak' ? 'အရန်ရံပုံငွေ တိုက်ရိုက် စာရင်းစစ်တမ်း' : 'Real-Time Proof of Reserves'}
                </h3>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Audited Block #948,124</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                value={14850}
                label={lang === 'arak' ? 'အကောင့်ပိုင်ရှင် ဦးရေ' : 'Citizens & Wallets'}
                colorClass="text-white"
              />

              <StatCard
                value={4800000}
                label={lang === 'arak' ? 'AKD လှည့်လည်ငွေ' : 'AKD Circulating Supply'}
                colorClass="text-amber-400"
                formatValue={(count) => `₳ ${(count / 1000000).toFixed(1)}M`}
              />

              <StatCard
                value={340}
                label={lang === 'arak' ? 'အတည်ပြု အေးဂျင့် ကောင်တာ' : 'Verified Cash Counters'}
                colorClass="text-cyan-400"
                formatValue={(count) => `${count} Counters`}
              />

              <StatCard
                value={105}
                label={lang === 'arak' ? 'အရန်ငွေ ကျောထောက်နောက်ခံ' : 'Collateral Coverage'}
                colorClass="text-emerald-400"
                formatValue={(count) => `${count}%`}
              />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7: DOWNLOAD SUITE (Complete Platforms Hub)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="download" className="py-28 relative">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <RevealSection>
            <div className="liquid-glass-card rounded-[40px] p-8 sm:p-14 border border-white/20 relative overflow-hidden text-center">
              <div className="max-w-2xl mx-auto space-y-4">
                <span className="px-4 py-1.5 rounded-full bg-red-600/20 text-red-300 font-mono text-xs font-bold border border-red-500/30 inline-block">
                  CROSS-PLATFORM ECOSYSTEM
                </span>

                <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-extrabold text-white tracking-tight">
                  {lang === 'arak' ? 'ဖေ့သာ အက်ပ် ရယူပါ' : 'Get PeThar on All Devices'}
                </h2>

                <p className="text-white/60 text-base leading-relaxed">
                  {lang === 'arak'
                    ? 'Android, iOS နှင့် ကွန်ပျူတာ ဝဘ်ဘရောင်ဇာတိုင်းတွင် တစ်ပြိုင်နက် ချိတ်ဆက် အသုံးပြုနိုင်ပါသည်။'
                    : 'Download the native mobile client for Android or iOS, or access the desktop banking workstation directly in your web browser.'}
                </p>

                <div className="pt-6 grid sm:grid-cols-3 gap-4">
                  {/* Google Play Button */}
                  <a
                    href="#download"
                    className="liquid-glass-pill p-4 rounded-2xl border border-white/15 flex items-center justify-center gap-3 hover:border-white/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <Smartphone className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div className="text-left font-mono">
                      <div className="text-[9px] text-white/40 uppercase">Google Play</div>
                      <div className="text-xs font-bold text-white">Android 9.0+</div>
                    </div>
                  </a>

                  {/* App Store Button */}
                  <a
                    href="#download"
                    className="liquid-glass-pill p-4 rounded-2xl border border-white/15 flex items-center justify-center gap-3 hover:border-white/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <Apple className="w-6 h-6 text-white shrink-0" />
                    <div className="text-left font-mono">
                      <div className="text-[9px] text-white/40 uppercase">App Store</div>
                      <div className="text-xs font-bold text-white">iOS 16+</div>
                    </div>
                  </a>

                  {/* Direct Signed APK */}
                  <a
                    href="#download"
                    className="liquid-glass-pill p-4 rounded-2xl border border-white/15 flex items-center justify-center gap-3 hover:border-white/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <Download className="w-6 h-6 text-amber-400 shrink-0" />
                    <div className="text-left font-mono">
                      <div className="text-[9px] text-white/40 uppercase">Signed APK</div>
                      <div className="text-xs font-bold text-white">Direct Download</div>
                    </div>
                  </a>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleOpenBankingClick}
                    className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300 underline underline-offset-4"
                  >
                    <span>{lang === 'arak' ? 'ဝဘ်ဘရောင်ဇာမှ တိုက်ရိုက် ဘဏ်စာရင်း ဝင်မည် →' : 'Launch Desktop Web Banking Portal directly →'}</span>
                  </button>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 8: SECURITY & EMERGENCY FAQ
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="security" className="py-20 border-t border-white/[0.08] bg-black/40">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold">
                SECURITY & CRISIS PROTOCOLS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1">
                {lang === 'arak' ? 'မကြာခဏ မေးလေ့ရှိသော မေးခွန်းများ' : 'Frequently Asked Questions'}
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: lang === 'arak' ? 'အာရက္ခဒေါ်လာ (AKD) ကို မည်ကဲ့သို့ တန်ဖိုးသတ်မှတ်ထားသနည်း?' : 'What is the Arakan Dollar (AKD) and how is it backed?',
                  a: lang === 'arak'
                    ? 'အာရက္ခဒေါ်လာ (AKD / ₳) သည် ၁:၁ အမေရိကန်ဒေါ်လာတန်ဖိုး အပြည့်အဝ ချိတ်ဆက်ထားပြီး အမေရိကန်ဘဏ္ဍာတိုက်ငွေတိုက်စာချုပ်၊ ဆွစ်ဇာလန်မြေအောက်ခန်းရှိ ရွှေဒင်္ဂါးများနှင့် ကျောထောက်နောက်ခံ ပြုထားပါသည်။'
                    : 'Each AKD is strictly pegged 1:1 with the United States Dollar and backed by 105% liquid collateral consisting of short-term US Treasury bills, audited physical gold bullion vault holdings, and regulated fiat stablecoins.',
                },
                {
                  q: lang === 'arak' ? 'အင်တာနက်နှင့် ဖုန်းလိုင်း ပြတ်တောက်ချိန်တွင် မည်သို့ အသုံးပြုရသနည်း?' : 'How does PeThar operate during telecom blackout emergencies?',
                  a: lang === 'arak'
                    ? 'PeThar တွင် အော့ဖ်လိုင်း ဘောက်ချာ စနစ် ပါဝင်ပါသည်။ စက်တွင်း Ed25519 ဒစ်ဂျစ်တယ်လက်မှတ်ဖြင့် ကာကွယ်ထားသော ဘောက်ချာများကို NFC သို့မဟုတ် Bluetooth ဖြင့် လွှဲပြောင်းပေးနိုင်ပြီး အင်တာနက် ပြန်ရချိန်တွင် အလိုအလျောက် စာရင်းရှင်းပါမည်။'
                    : 'PeThar incorporates an offline mesh verification protocol. Devices generate cryptographically signed, tamper-proof offline vouchers using Ed25519 asymmetric signatures. When connectivity returns, transactions reconcile automatically with anti-replay guarantees.',
                },
                {
                  q: lang === 'arak' ? 'အရေးပေါ် အကြပ်ကိုင်ခံရချိန် (Duress PIN) မည်သို့ အလုပ်လုပ်သနည်း?' : 'What is the Duress Distress PIN (999999)?',
                  a: lang === 'arak'
                    ? 'စစ်ဆေးရေးဂိတ် သို့မဟုတ် အကျပ်ကိုင်ခံရချိန်တွင် ပုံမှန် PIN အစား ၉၉၉၉၉၉ ကို ရိုက်ထည့်ပါက သာမန်ငွေပမာဏ အနည်းငယ်သာရှိသော Decoy မျက်နှာပြင်ကို ပြသပေးပြီး နောက်ကွယ်မှ အသံတိတ် အကူအညီတောင်းခံမှု ပေးပို့ပါမည်။'
                    : 'In high-risk checkpoints or duress extortion scenarios, entering the emergency PIN (999999) displays a benign decoy balance while silently broadcasting a distress signal to community monitors.',
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
          FOOTER (Matching MTB Pay Official Banking Footer)
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.08] bg-[#03060A] text-white/60 text-xs py-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Col 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ArakanEmblem size={32} variant="badge" />
                <span className="text-lg font-bold text-white">PeThar (ဖေ့သာ)</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed font-sans">
                {lang === 'arak'
                  ? 'အာရက္ခဗဟိုဘဏ်မှ တရားဝင် ထုတ်ဝေသော အချုပ်အခြာအာဏာပိုင် ဒစ်ဂျစ်တယ်ဘဏ္ဍာရေး အခြေခံအဆောက်အအုံ။'
                  : 'Sovereign Digital Financial Infrastructure issued by the Central Monetary Authority of Arakan.'}
              </p>
              <div className="text-[11px] font-mono text-emerald-400 font-bold">
                1 AKD = 1.00 USD (105% Liquid Reserve Ratio)
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h5 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
                {lang === 'arak' ? 'မြန်ဆန်လမ်းညွှန်' : 'Navigation'}
              </h5>
              <ul className="space-y-2 font-mono text-xs text-white/50">
                <li><a href="#hero" className="hover:text-white transition">Home</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#services" className="hover:text-white transition">Everyday Services</a></li>
                <li><a href="#partners" className="hover:text-white transition">Be an Agent</a></li>
                <li><a href="#reserves" className="hover:text-white transition">Proof of Reserves</a></li>
              </ul>
            </div>

            {/* Col 3: Services */}
            <div>
              <h5 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
                {lang === 'arak' ? 'ဝန်ဆောင်မှုများ' : 'Services'}
              </h5>
              <ul className="space-y-2 font-mono text-xs text-white/50">
                <li><a href="#services" className="hover:text-white transition">Bill Payments</a></li>
                <li><a href="#services" className="hover:text-white transition">Mobile Top-Up</a></li>
                <li><a href="#services" className="hover:text-white transition">Ferry & Transit Tickets</a></li>
                <li><a href="#services" className="hover:text-white transition">Worker Remittance</a></li>
                <li><a href="#services" className="hover:text-white transition">USDT 1:1 Swap</a></li>
              </ul>
            </div>

            {/* Col 4: Contact & Hotlines */}
            <div className="space-y-3 font-mono text-xs text-white/50">
              <h5 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
                {lang === 'arak' ? 'ဆက်သွယ်ရန်' : 'Support & Hotline'}
              </h5>
              <div>Hotline: <a href="tel:+959798112334" className="text-white hover:text-amber-400 font-bold">+95 9 798 112 334</a></div>
              <div>Telegram: <a href="https://t.me" className="text-white hover:text-cyan-400">@PeTharSupport</a></div>
              <div>Headquarters: Sittwe Central Financial District</div>
              <div className="text-[10px] text-white/30 pt-2">Emergency Distress PIN: 999999</div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/40">
            <div>
              © 2026 PeThar (ဖေ့သာ). All Sovereign Monetary Rights Reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Charter</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>AML / CFT Compliance</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════
          LOGIN PORTAL MODAL DIALOG (Liquid Glass)
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
              <ArakanEmblem size={44} variant="badge" className="mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white">PeThar Web Banking</h3>
              <p className="text-xs text-white/50 font-mono mt-1">
                {lang === 'arak' ? 'အာရက္ခဒေါ်လာ ဝဘ်ဘဏ်လုပ်ငန်းသို့ ဝင်ရောက်ပါ' : 'Sign in to your sovereign online ledger account'}
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
                  {lang === 'arak' ? 'ဖုန်းနံပါတ် သို့မဟုတ် Citizen ID' : 'Phone Number or Citizen ID'}
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
                  {lang === 'arak' ? '၆ လုံး PIN ကုဒ်' : '6-Digit Security PIN'}
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
                {lang === 'arak' ? 'ဘဏ်စာရင်း ဖွင့်မည်' : 'Authorize & Open Banking'}
              </button>

              <div className="text-center text-[10px] text-white/40 font-mono pt-2">
                Protected by Ed25519 Hardware Keystore · Duress PIN 999999
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
