import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Compass,
  Copy,
  Cpu,
  DollarSign,
  Eye,
  EyeOff,
  FileBadge,
  Fingerprint,
  Home,
  Layers,
  Lock,
  Map,
  Menu,
  Minus,
  Moon,
  Plus,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Users,
  Wallet,
  WifiOff,
  X,
  Zap,
} from 'lucide-react'
import type { Language } from '../i18n'
import { redirectToSubdomain } from '../utils/subdomain'

interface MainProps {
  lang?: Language
  setLang?: (lang: Language) => void
}

type PageKey = 'home' | 'features' | 'about' | 'faq' | 'privacy' | 'terms'
type AboutSubKey = 'overview' | 'technology' | 'products' | 'awards' | 'roadmap'

/* ─── PREVIOUS PÉTHAR LOGO (PRESERVED — DO NOT DROP YET) ──────────────────── */
export function PreviousPetharLogo({
  size = 40,
  showText = true,
  isDark = true,
}: {
  size?: number
  showText?: boolean
  isDark?: boolean
}) {
  return (
    <div
      className="inline-flex items-center gap-3 select-none group"
      onDragStart={(e) => e.preventDefault()}
    >
      <div
        className="relative flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 pointer-events-none select-none"
        >
          <path
            d="M27 107C39 107 49 97 49 83V69H36C30 69 27 75 27 84V107Z"
            fill={isDark ? '#3F3F46' : '#52525B'}
          />
          <path
            d="M31 60C34 49 43 42 54 40C54 49 48 54 39 56C35 57 33 58.5 31 60Z"
            fill={isDark ? '#E4E4E7' : '#27272A'}
          />
          <path
            d="M84 23C95 30 99 42 96 54C92 67 80 73 64 73H48C38 73 33 78 31 88L27 107V78C27 63 36 55 51 55H66C75 55 81 50 81 42C81 35 76 30 67 29L84 23Z"
            fill={isDark ? '#71717A' : '#18181B'}
          />
          <path
            d="M24 16H68C86 16 98 27 98 44C98 60 85 71 66 71H48C36 71 29 78 27 92V76C27 62 36 55 51 55H66C76 55 82 50 82 42.5C82 35 76 31 66 31H42C31 31 25 25 24 16Z"
            fill={isDark ? '#FFFFFF' : '#09090B'}
          />
        </svg>
      </div>
      {showText && (
        <span
          className={`text-xl sm:text-2xl font-black tracking-tight ${
            isDark ? 'text-white' : 'text-zinc-950'
          }`}
        >
          Péthar
        </span>
      )}
    </div>
  )
}

/* ─── NEW WHITE & CRIMSON 3D LIQUID GLASS "P" LOGO (image6.png) ───────────── */
function PetharLogo({
  size = 42,
  showText = true,
  isDark = true,
}: {
  size?: number
  showText?: boolean
  isDark?: boolean
}) {
  return (
    <div
      className="inline-flex items-center gap-3 select-none group"
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="relative flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 select-none pointer-events-none"
        style={{ width: size, height: size }}
      >
        <img
          src="/pethar-logo-red-white.svg"
          alt="Péthar Logo"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="relative z-10 w-full h-full object-contain select-none pointer-events-none"
          style={{ WebkitUserDrag: 'none', userSelect: 'none' } as React.CSSProperties}
        />
      </div>

      {showText && (
        <span
          className={`text-xl sm:text-2xl font-black tracking-tight select-none ${
            isDark ? 'text-white' : 'text-zinc-950'
          }`}
        >
          Péthar
        </span>
      )}
    </div>
  )
}

/* ─── NON-DRAGGABLE ARAKAN FLAG & UK FLAG ICONS FOR LANGUAGE SELECTOR ─────── */
function NonDraggableArakanFlag({ size = 20 }: { size?: number }) {
  return (
    <span
      role="img"
      aria-label="ရခိုင်"
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      className="inline-block rounded-full overflow-hidden shrink-0 border border-current/20 select-none pointer-events-none bg-[#ec201c]"
      style={
        {
          width: size,
          height: size,
          backgroundImage: 'url(/united-league-of-arakan-flag.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          WebkitUserDrag: 'none',
          userSelect: 'none',
        } as React.CSSProperties
      }
    />
  )
}

function NonDraggableEnglishFlag({ size = 20 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className="rounded-full shrink-0 overflow-hidden border border-current/20 select-none pointer-events-none"
      style={{ width: size, height: size }}
      aria-label="English"
    >
      <rect width="60" height="60" fill="#012169" />
      <path d="M0,0 L60,60 M60,0 L0,60" stroke="#fff" strokeWidth="10" />
      <path d="M0,0 L60,60 M60,0 L0,60" stroke="#C8102E" strokeWidth="5" />
      <path d="M30,0 v60 M0,30 h60" stroke="#fff" strokeWidth="16" />
      <path d="M30,0 v60 M0,30 h60" stroke="#C8102E" strokeWidth="9" />
    </svg>
  )
}

/* ─── ONLY APP STORE & GOOGLE PLAY STORE BADGES (ROUTE TO download.domain/lang/ios|android) ─── */
function AppStoreBadge({
  onClick,
  isDark = true,
  isAk = false,
}: {
  onClick?: () => void
  isDark?: boolean
  isAk?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-200 cursor-pointer min-w-[175px] select-none ${
        isDark
          ? 'bg-white text-zinc-950 border-white hover:bg-zinc-200 shadow-[0_10px_30px_rgba(255,255,255,0.12)]'
          : 'bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800 shadow-[0_10px_25px_rgba(9,9,11,0.18)]'
      }`}
    >
      <svg className="w-6 h-6 shrink-0 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.79-.96 2.84 1.04.08 2.08-.52 2.72-1.3z" />
      </svg>
      <div className="text-left leading-tight">
        <div className="text-[10px] font-medium opacity-75">
          {isAk ? 'ဒေါင်းလုဒ်ရယူရန်' : 'Download on the'}
        </div>
        <div className="text-sm font-bold tracking-tight">App Store</div>
      </div>
    </button>
  )
}

function GooglePlayBadge({
  onClick,
  isDark = true,
  isAk = false,
}: {
  onClick?: () => void
  isDark?: boolean
  isAk?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-200 cursor-pointer min-w-[175px] backdrop-blur-xl select-none ${
        isDark
          ? 'bg-white/[0.07] hover:bg-white/[0.14] text-white border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
          : 'bg-white hover:bg-zinc-100 text-zinc-950 border-zinc-300 shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
      }`}
    >
      <svg className="w-6 h-6 shrink-0 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.61 1.814L13.793 12 3.61 22.186a1.75 1.75 0 01-.61-1.33V3.144c0-.518.227-.996.61-1.33zm10.89 10.89l2.708 2.708-11.39 6.508 8.682-9.216zm3.415-3.415l2.847 1.627c.88.503.88 1.921 0 2.424l-2.847 1.627-2.715-2.839 2.715-2.839zM5.818 2.088l11.39 6.508-2.708 2.708-8.682-9.216z" />
      </svg>
      <div className="text-left leading-tight">
        <div className="text-[10px] font-medium uppercase opacity-75">
          {isAk ? 'ရယူနိုင်သည့်နေရာ' : 'GET IT ON'}
        </div>
        <div className="text-sm font-bold tracking-tight">Google Play</div>
      </div>
    </button>
  )
}

/* ─── STATUS BAR FOR IPHONE MOCKUPS ───────────────────────────────────────── */
function PhoneStatusBar({ time = '9:41', isDark = true }: { time?: string; isDark?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-5 pt-3 pb-2 text-[10px] font-semibold select-none ${
        isDark ? 'text-white/90' : 'text-zinc-900'
      }`}
    >
      <span>{time}</span>
      <div
        className={`w-16 h-4 rounded-full mx-auto ${
          isDark ? 'bg-black border border-white/10' : 'bg-zinc-950'
        }`}
      />
      <div className="flex items-center gap-1">
        <div className="flex items-end gap-[1.5px] h-2.5">
          <span className={`w-[2px] h-1 rounded-full ${isDark ? 'bg-white/90' : 'bg-zinc-900'}`} />
          <span className={`w-[2px] h-1.5 rounded-full ${isDark ? 'bg-white/90' : 'bg-zinc-900'}`} />
          <span className={`w-[2px] h-2 rounded-full ${isDark ? 'bg-white/90' : 'bg-zinc-900'}`} />
          <span className={`w-[2px] h-2.5 rounded-full ${isDark ? 'bg-white/90' : 'bg-zinc-900'}`} />
        </div>
        <div
          className={`w-4 h-2.5 rounded-[3px] border p-[1px] flex items-center ${
            isDark ? 'border-white/80' : 'border-zinc-900'
          }`}
        >
          <div className={`w-full h-full rounded-[1px] ${isDark ? 'bg-white' : 'bg-zinc-900'}`} />
        </div>
      </div>
    </div>
  )
}

/* ─── ABOUT US DROPDOWN ITEMS (MATCHING SCREENSHOT 1) ─────────────────────── */
const ABOUT_DROPDOWN_ITEMS: {
  key: AboutSubKey
  label: string
  labelAk: string
  path: string
  icon: typeof FileBadge
}[] = [
  { key: 'overview', label: 'About Us', labelAk: 'ကျွန်ုပ်တို့အကြောင်း', path: '/about', icon: FileBadge },
  { key: 'technology', label: 'Technology', labelAk: 'နည်းပညာ', path: '/about/technology', icon: Cpu },
  { key: 'products', label: 'Products', labelAk: 'ထုတ်ကုန်များ', path: '/about/products', icon: Box },
  { key: 'awards', label: 'Award & Recognition', labelAk: 'ဆုတံဆိပ်နှင့် အသိအမှတ်ပြုမှု', path: '/about/awards', icon: Award },
  { key: 'roadmap', label: 'Roadmap', labelAk: 'ရှေ့လုပ်ငန်းစဉ်', path: '/about/roadmap', icon: Map },
]

/* ─── ONLY ENGLISH AND ရခိုင် LANGUAGES ───────────────────────────────────── */
const LANGUAGES: {
  code: Language
  label: string
}[] = [
  { code: 'en', label: 'English' },
  { code: 'ak', label: 'ရခိုင်' },
]

export default function Main({ lang = 'en', setLang }: MainProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // Theme state: 'dark' or 'light' (White & Dark theme, no green)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pethar_site_theme')
      if (saved === 'light' || saved === 'dark') return saved
    }
    return 'dark'
  })
  const isDark = theme === 'dark'

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false)
  const aboutCloseTimerRef = useRef<number | null>(null)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [selectedLangCode, setSelectedLangCode] = useState<Language>(
    lang === 'ak' ? 'ak' : 'en'
  )

  // Interactive Features Page states
  const [activeFlowTab, setActiveFlowTab] = useState<number>(0)
  const [previewBalanceVisible, setPreviewBalanceVisible] = useState(true)
  const [transferRecipient, setTransferRecipient] = useState('')
  const [transferSentToast, setTransferSentToast] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0)

  // Smooth hover handlers for About Us dropdown with 450ms close delay so user can easily click
  const openAboutMenu = () => {
    if (aboutCloseTimerRef.current !== null) {
      window.clearTimeout(aboutCloseTimerRef.current)
      aboutCloseTimerRef.current = null
    }
    setAboutDropdownOpen(true)
  }

  const scheduleCloseAboutMenu = () => {
    if (aboutCloseTimerRef.current !== null) {
      window.clearTimeout(aboutCloseTimerRef.current)
    }
    aboutCloseTimerRef.current = window.setTimeout(() => {
      setAboutDropdownOpen(false)
      aboutCloseTimerRef.current = null
    }, 450)
  }

  useEffect(() => {
    return () => {
      if (aboutCloseTimerRef.current !== null) {
        window.clearTimeout(aboutCloseTimerRef.current)
      }
    }
  }, [])

  // Sync theme to document & localStorage
  useEffect(() => {
    localStorage.setItem('pethar_site_theme', theme)
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
      }
    }
  }, [theme])

  useEffect(() => {
    if (lang === 'en' || lang === 'ak') {
      setSelectedLangCode(lang)
    }
  }, [lang])

  const isAk = selectedLangCode === 'ak'

  // Resolve current page and About sub-section from URL pathname (/en/features, /ak/features, /privacy, /terms, etc.)
  const normalizedPath = location.pathname.replace(/^\/(en|ak)(?=\/|$)/, '') || '/'

  const currentPage: PageKey = (() => {
    if (normalizedPath.startsWith('/privacy')) return 'privacy'
    if (normalizedPath.startsWith('/terms')) return 'terms'
    if (normalizedPath.startsWith('/features')) return 'features'
    if (normalizedPath.startsWith('/about')) return 'about'
    if (normalizedPath.startsWith('/faq')) return 'faq'
    return 'home'
  })()

  const currentAboutSub: AboutSubKey = (() => {
    if (normalizedPath.includes('/technology')) return 'technology'
    if (normalizedPath.includes('/products')) return 'products'
    if (normalizedPath.includes('/awards')) return 'awards'
    if (normalizedPath.includes('/roadmap')) return 'roadmap'
    return 'overview'
  })()

  useEffect(() => {
    const pageTitles: Record<PageKey, string> = isAk
      ? {
          home: 'Péthar (ဖေ့သာ) — သင်၏ နေ့စဉ်သုံး ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ်',
          features: 'လုပ်ဆောင်ချက်များ — Péthar (ဖေ့သာ)',
          about: 'ကျွန်ုပ်တို့အကြောင်း — Péthar (ဖေ့သာ)',
          faq: 'အမေးများသောမေးခွန်းများ — Péthar (ဖေ့သာ)',
          privacy: 'Péthar Website Privacy Policy — pethar.co.uk',
          terms: 'Péthar Website Terms and Conditions — pethar.co.uk',
        }
      : {
          home: 'Péthar — Your Everyday Digital Wallet',
          features: 'Features — Péthar Digital Wallet',
          about: 'About Us — Péthar Digital Wallet',
          faq: 'FAQ — Péthar Digital Wallet',
          privacy: 'Péthar Website Privacy Policy — pethar.co.uk',
          terms: 'Péthar Website Terms and Conditions — pethar.co.uk',
        }
    document.title = pageTitles[currentPage]
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage, normalizedPath, isAk])

  // Navigate with language prefix (/en/features, /ak/features, etc.), or direct /privacy and /terms
  const goToPath = (targetPath: string) => {
    if (aboutCloseTimerRef.current !== null) {
      window.clearTimeout(aboutCloseTimerRef.current)
      aboutCloseTimerRef.current = null
    }
    setMobileMenuOpen(false)
    setAboutDropdownOpen(false)
    if (targetPath === '/privacy' || targetPath === '/terms') {
      navigate(targetPath)
      return
    }
    const cleanSuffix = targetPath === '/' ? '' : targetPath
    navigate(`/${selectedLangCode}${cleanSuffix}`)
  }

  // Navigate to download.domain/ak/ios or download.domain/en/ios or /android
  const goToDownloadPlatform = (platform: 'ios' | 'android') => {
    redirectToSubdomain('download', {
      path: `/${selectedLangCode}/${platform}`,
      search: '',
    })
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const coreStats = [
    {
      metric: '1 : 1',
      label: isAk ? 'အမေရိကန်ဒေါ်လာ တန်ဖိုး' : 'USD Value',
      sub: isAk
        ? '၁ အာရက္ခဒေါ်လာ = $1.00 USD ပုံသေနှုန်းထား'
        : '1 Arakan Dollar = $1.00 USD fixed rate',
    },
    {
      metric: '< 1s',
      label: isAk ? 'ငွေလွှဲမြန်နှုန်း' : 'Transfer Speed',
      sub: isAk
        ? 'အသုံးပြုသူအချင်းချင်း စက္ကန့်ပိုင်းအတွင်း ချက်ချင်းရောက်ရှိမှု'
        : 'Instant user-to-user settlement',
    },
    {
      metric: '$0.00',
      label: isAk ? 'အချင်းချင်း ငွေလွှဲခ' : 'User-to-User Fee',
      sub: isAk
        ? 'ငွေလွှဲမှုတိုင်းအတွက် ဝန်ဆောင်ခ 0% (အခမဲ့)'
        : '0% fee on every transfer',
    },
    {
      metric: '24/7',
      label: isAk ? 'မိုဘိုင်းအက်ပ် အသုံးပြုနိုင်မှု' : 'Mobile App Access',
      sub: isAk
        ? 'iOS နှင့် Android ပေါ်တွင် အချိန်မရွေး အသုံးပြုနိုင်သော ပိုက်ဆံအိတ်'
        : 'Always-on everyday wallet on iOS & Android',
    },
  ]

  const flowSteps = [
    {
      id: '01',
      badge: isAk ? '01 စုစည်းထားသော လက်ကျန်ငွေ' : '01 Unified Balance',
      title: isAk
        ? 'ရှင်းလင်းလွယ်ကူသော မျက်နှာပြင်တစ်ခုတည်းတွင် လက်ကျန်ငွေအားလုံးကို ကြည့်ရှုပါ'
        : 'Unified Wallet Balance in One Clean View',
      description: isAk
        ? 'Péthar အက်ပ်ကိုဖွင့်လိုက်သည်နှင့် ၁ အာရက္ခဒေါ်လာ = $1.00 USD ပုံသေနှုန်းထားဖြင့် သင်၏ လက်ကျန်ငွေအားလုံးကို ရှင်းလင်းစွာ မြင်တွေ့နိုင်ပါသည်။ ငွေဝင်/ငွေထွက်စာရင်းများနှင့် အဓိကလုပ်ဆောင်ချက်များကို တစ်နေရာတည်းတွင် စီမံနိုင်ပါသည်။'
        : 'Open Péthar to see your complete balance denominated in Arakan Dollar at a fixed 1 Arakan Dollar = $1.00 USD value. Track incoming transfers, recent payouts, and quick actions from a single mobile dashboard.',
      highlights: isAk
        ? [
            'အာရက္ခဒေါ်လာဖြင့် ရှင်းလင်းစွာ ပြသထားသော ပင်မလက်ကျန်ငွေ',
            '၁ အာရက္ခဒေါ်လာ = $1.00 USD တိုက်ရိုက်တန်ဖိုးတူညီမှု',
            'Dashboard၊ ငွေလွှဲရန်၊ ပိုင်ဆိုင်မှု နှင့် ငွေထုတ်ရန် တစ်ချက်နှိပ်ရုံဖြင့် အသုံးပြုနိုင်မှု',
          ]
        : [
            'Main Balance displayed clearly in Arakan Dollar',
            'Live 1 Arakan Dollar = $1.00 USD parity indicator',
            'One-tap access to Dashboard, Send, Assets, and Withdraw',
          ],
    },
    {
      id: '02',
      badge: isAk ? '02 1:1 အာရက္ခဒေါ်လာ စနစ်' : '02 1:1 Arakan Dollar Function',
      title: isAk
        ? 'ပုံသေ ၁ အာရက္ခဒေါ်လာ = $1.00 USD တန်ဖိုး'
        : 'Fixed 1 Arakan Dollar = $1.00 USD Value',
      description: isAk
        ? 'သင်၏ Péthar ပိုက်ဆံအိတ်အတွင်းရှိ အာရက္ခဒေါ်လာတိုင်းသည် အမေရိကန်ဒေါ်လာ ၁ ဒေါ်လာနှင့် ပုံသေ 1:1 တန်ဖိုးတူညီပါသည်။ စျေးနှုန်းအတက်အကျ စိုးရိမ်စရာမလိုဘဲ နေ့စဉ်ငွေကြေးကို စိတ်ချလက်ချ စီမံနိုင်ပါသည်။'
        : 'Every Arakan Dollar in your Péthar Wallet holds a fixed 1:1 US Dollar value. Convert and manage your everyday balance with zero mental math and zero surprise rate fluctuations.',
      highlights: isAk
        ? [
            'အက်ပ်အတွင်း ပုံသေ ၁ အာရက္ခဒေါ်လာ = $1.00 USD နှုန်းထား',
            'Péthar မိုဘိုင်းပိုက်ဆံအိတ်အတွင်း လဲလှယ်ခ 0% (အခမဲ့)',
            'နေ့စဉ်သုံးစွဲမှုနှင့် စုဆောင်းမှုအတွက် တိကျရှင်းလင်းသော လက်ကျန်ငွေ',
          ]
        : [
            'Fixed 1 Arakan Dollar = $1.00 USD in-app rate',
            'Zero conversion fee inside your Péthar mobile wallet',
            'Instant balance clarity for everyday spending and saving',
          ],
    },
    {
      id: '03',
      badge: isAk ? '03 အချင်းချင်း အခမဲ့ငွေလွှဲမှု' : '03 Free User-to-User Send',
      title: isAk
        ? 'ဝန်ဆောင်ခ 0% ($0.00) ဖြင့် ချက်ချင်း ငွေလွှဲခြင်း'
        : 'Instant Transfers with 0% Fee ($0.00)',
      description: isAk
        ? 'မည်သည့် Péthar အသုံးပြုသူထံသို့မဆို ပိုက်ဆံအိတ်လိပ်စာ (Wallet Address) သို့မဟုတ် ကိုယ်ပိုင် QR ကုဒ်ဖြင့် ၁ စက္ကန့်အောက်အတွင်း အာရက္ခဒေါ်လာ လွှဲပို့နိုင်ပါသည်။ အချင်းချင်း ငွေလွှဲခ $0.00 ဖြစ်၍ ပေးပို့သည့်ပမာဏအတိုင်း အပြည့်အဝ ရရှိပါသည်။'
        : 'Send Arakan Dollar to any Péthar user by wallet address or personal QR code in under a second. Recipients receive 100% of what you send with a $0.00 user-to-user transfer fee.',
      highlights: isAk
        ? [
            'မည်သည့် Péthar ပိုက်ဆံအိတ်လိပ်စာ (Wallet Address) သို့မဆို ချက်ချင်းငွေလွှဲနိုင်မှု',
            'အသုံးပြုသူအချင်းချင်း ငွေလွှဲမှုတိုင်းအတွက် ဝန်ဆောင်ခ 0% ($0.00)',
            'ငွေဝင်လာသည်နှင့် ချက်ချင်း ဖုန်းအသိပေးချက် (Push Notification) ရရှိမှု',
          ]
        : [
            'Send to any Péthar wallet address or QR code instantly',
            '0% Fee ($0.00) on all user-to-user transfers',
            'Real-time push notification the moment funds arrive',
          ],
    },
    {
      id: '04',
      badge: isAk ? '04 အချိန်မရွေး ငွေထုတ်ယူမှု' : '04 Low-Fee Withdrawal',
      title: isAk
        ? 'ပွင့်လင်းမြင်သာသော ဝန်ဆောင်ခဖြင့် အချိန်မရွေး ငွေထုတ်ယူနိုင်ခြင်း'
        : 'Anytime Withdrawals with Transparent Low Fees',
      description: isAk
        ? 'ငွေသားထုတ်ယူလိုပါသလား? မိုဘိုင်းအက်ပ်အတွင်းမှ အချိန်မရွေး ငွေထုတ်ယူနိုင်ပါသည်။ အတည်မပြုမီ သင့်တင့်သော ဝန်ဆောင်ခကို ကြိုတင်တွက်ချက်ပြသပေးပြီး အလိုအလျောက် နှုတ်ယူပေးပါသည်။'
        : 'Need to cash out? Enter your withdrawal amount anytime in the mobile app. A small, transparent transaction fee is calculated and deducted automatically before you confirm.',
      highlights: isAk
        ? [
            'မိုဘိုင်းပိုက်ဆံအိတ်မှ တိုက်ရိုက် အချိန်မရွေး ငွေထုတ်ယူနိုင်မှု',
            'အတည်မပြုမီ ဝန်ဆောင်ခကို ပွင့်လင်းမြင်သာစွာ ကြိုတင်ပြသပေးမှု',
            'အသားတင်ရရှိမည့် ငွေပမာဏကို အတိအကျ ကြိုတင်ကြည့်ရှုနိုင်မှု',
          ]
        : [
            'Withdraw anytime directly from your mobile wallet',
            'Small transaction fee shown upfront before confirmation',
            'Automatic fee deduction with exact net payout preview',
          ],
    },
  ]

  const faqItems = isAk
    ? [
        {
          q: 'Péthar မိုဘိုင်းပိုက်ဆံအိတ်ကို အသုံးပြုရတာ လုံခြုံပါသလား?',
          a: 'ဟုတ်ကဲ့၊ အပြည့်အဝ လုံခြုံစိတ်ချရပါသည်။ Péthar ကို အဆင့်မြင့် လုံခြုံရေးစနစ်များဖြင့် တည်ဆောက်ထားပါသည်-\n• ကိုယ်တိုင်ထိန်းချုပ်နိုင်သော ပိုက်ဆံအိတ် — သင်၏ ငွေလွှဲမှုများကို သင်ကိုယ်တိုင်သာ အတည်ပြုနိုင်ပါသည်\n• ဖုန်း Biometrics၊ ကုဒ်ဝှက်စနစ် (Encryption) နှင့် PIN လုံခြုံရေး\n• ငွေလွှဲမှုတိုင်းအတွက် အချိန်နှင့်တစ်ပြေးညီ စစ်ဆေးနိုင်သော ဒစ်ဂျစ်တယ်ပြေစာ (e-Receipt)\nသင်၏ လက်ကျန်ငွေကို သင်ကိုယ်တိုင် အမြဲတမ်း အပြည့်အဝ ထိန်းချုပ်နိုင်ပါသည်။',
        },
        {
          q: '၁ အာရက္ခဒေါ်လာ = $1.00 USD နှုန်းထားက မည်သို့အလုပ်လုပ်ပါသလဲ?',
          a: 'Péthar မိုဘိုင်းပိုက်ဆံအိတ်အတွင်း၌ ၁ အာရက္ခဒေါ်လာတိုင်းကို အမေရိကန်ဒေါ်လာ $1.00 USD နှင့် ပုံသေ 1:1 တန်ဖိုးတူညီအောင် ထိန်းသိမ်းထားပါသည်။ အက်ပ်အတွင်း လက်ကျန်ငွေကြည့်ရှုရာတွင် သို့မဟုတ် လဲလှယ်ရာတွင် ကွာဟချက် (Spread) လုံးဝမရှိပါ။',
        },
        {
          q: 'အသုံးပြုသူအချင်းချင်း ငွေလွှဲခြင်းက တကယ်ပဲ အခမဲ့လား?',
          a: 'ဟုတ်ကဲ့၊ အခမဲ့ဖြစ်ပါသည်။ မည်သည့် Péthar အသုံးပြုသူထံသို့မဆို ၎င်းတို့၏ ပိုက်ဆံအိတ်လိပ်စာ (Wallet Address) သို့မဟုတ် ကိုယ်ပိုင် QR ကုဒ်ဖြင့် ၁ စက္ကန့်အောက်အတွင်း ဝန်ဆောင်ခ $0.00 (0%) ဖြင့် အခမဲ့ လွှဲပို့နိုင်ပါသည်။',
        },
        {
          q: 'ငွေထုတ်ယူမှု (Withdrawal) က မည်သို့အလုပ်လုပ်ပါသလဲ?',
          a: 'Péthar မိုဘိုင်းအက်ပ်မှတစ်ဆင့် သင်၏ လက်ကျန်ငွေကို အချိန်မရွေး ထုတ်ယူနိုင်ပါသည်။ ပွင့်လင်းမြင်သာသော 1.0% ဝန်ဆောင်ခကို အတည်မပြုမီ ကြိုတင်ပြသပေးပြီး အသားတင်ရရှိမည့် ပမာဏကို အတိအကျ တွေ့မြင်နိုင်ပါသည်။',
        },
        {
          q: 'ကျွန်ုပ်၏ ကိုယ်ရေးအချက်အလက်များကို မည်သို့ကာကွယ်ပေးထားပါသလဲ?',
          a: 'ကျွန်ုပ်တို့သည် အချက်အလက်အနည်းဆုံးသိမ်းဆည်းမှုနှင့် End-to-End Encryption စံနှုန်းများကို တိကျစွာ လိုက်နာပါသည်။ သင်၏ လုံခြုံရေးသော့ချက်များသည် သင့်ဖုန်းအတွင်း၌သာ လုံခြုံစွာ ရှိနေပါသည်။',
        },
        {
          q: 'ငွေလွှဲနေစဉ် အင်တာနက်ပြတ်တောက်သွားပါက ဘာဖြစ်မလဲ?',
          a: 'Péthar ငွေလွှဲမှုတိုင်းသည် တိကျခိုင်မာသော စနစ်ဖြင့် အလုပ်လုပ်ပါသည်။ အတည်မပြုမီ လိုင်းပြတ်တောက်သွားပါက သင်၏ လက်ကျန်ငွေသည် ပိုက်ဆံအိတ်အတွင်း မပျောက်မပျက် အပြည့်အဝ ကျန်ရှိနေမည်ဖြစ်ပါသည်။',
        },
        {
          q: 'Péthar အက်ပ်ကို မည်သည့်နေရာတွင် ဒေါင်းလုဒ်ရယူနိုင်ပါသလဲ?',
          a: 'Péthar အက်ပ်ကို iOS အတွက် App Store ခလုတ်နှင့် Android အတွက် Google Play ခလုတ်တို့မှတစ်ဆင့် တိုက်ရိုက် ဒေါင်းလုဒ်ရယူနိုင်ပါသည်။',
        },
      ]
    : [
        {
          q: 'Is the Péthar mobile wallet safe to use?',
          a: 'Yes. Péthar is engineered with multi-layer security and user control:\n• Self-custodial wallet architecture — only you authorize your transfers\n• Device biometrics, hardware-backed encryption, and PIN verification\n• Real-time verifiable digital receipts for every transaction\nYou always have complete visibility and control over your balance.',
        },
        {
          q: 'How does the 1 Arakan Dollar = $1.00 USD rate work?',
          a: 'Inside your Péthar mobile wallet, every 1 Arakan Dollar is maintained at a fixed 1:1 US Dollar value ($1.00 USD). There is zero conversion spread when viewing or managing your balance in the app.',
        },
        {
          q: 'Are user-to-user transfers really free?',
          a: 'Yes. Sending Arakan Dollar to any other Péthar user via their wallet address or personal QR code is instant (< 1 second) and carries a $0.00 (0%) transfer fee.',
        },
        {
          q: 'How do withdrawals work?',
          a: 'You can withdraw your balance anytime directly from the Péthar mobile app. A small, transparent 1.0% transaction fee is shown upfront and deducted automatically so you see your exact net payout before confirming.',
        },
        {
          q: 'How is my personal information protected?',
          a: 'We follow strict data-minimization and end-to-end encryption standards. Your credentials and authorization keys remain protected on your device.',
        },
        {
          q: 'What happens if a transfer is interrupted?',
          a: 'Every Péthar transfer settles atomically. If connectivity drops before confirmation, your balance remains untouched in your wallet with zero loss of funds.',
        },
        {
          q: 'Where can I download the Péthar app?',
          a: 'Péthar is available for iOS via the App Store button and for Android via the Google Play button.',
        },
      ]

  const currentLangItem =
    LANGUAGES.find((l) => l.code === selectedLangCode) || LANGUAGES[0]

  // Shared theme classes (Strictly White & Dark — zero green)
  const cardSurface = isDark
    ? 'bg-white/[0.04] hover:bg-white/[0.06] border-white/12 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)]'
    : 'bg-white/90 hover:bg-white border-zinc-200/90 text-zinc-950 shadow-[0_12px_36px_rgba(0,0,0,0.05)]'

  const subtleSurface = isDark
    ? 'bg-white/[0.03] border-white/10 text-white'
    : 'bg-zinc-100/80 border-zinc-200/80 text-zinc-900'

  const mutedText = isDark ? 'text-zinc-400' : 'text-zinc-600'
  const pillBadge = isDark
    ? 'bg-white/10 border-white/20 text-white'
    : 'bg-zinc-900/[0.06] border-zinc-300 text-zinc-900'

  return (
    <div
      className={`min-h-screen font-sans relative overflow-x-hidden transition-colors duration-300 ${
        isDark
          ? 'bg-[#09090B] text-white selection:bg-white selection:text-[#09090B]'
          : 'bg-[#F8FAFC] text-zinc-950 selection:bg-zinc-950 selection:text-white'
      }`}
    >
      {/* ─── SUBTLE MONOCHROME AMBIENT GLOW & GRID OVERLAY ─────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`hidden md:block absolute -top-40 -left-40 w-[620px] h-[620px] rounded-full blur-[120px] ${
            isDark ? 'bg-white/[0.05]' : 'bg-zinc-400/20'
          }`}
        />
        <div
          className={`hidden md:block absolute top-20 right-[-10%] w-[680px] h-[680px] rounded-full blur-[120px] ${
            isDark ? 'bg-zinc-400/[0.06]' : 'bg-zinc-300/30'
          }`}
        />
        <div
          className={`absolute inset-0 ${isDark ? 'opacity-[0.04]' : 'opacity-[0.035]'}`}
          style={{
            backgroundImage: isDark
              ? 'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)'
              : 'linear-gradient(to right, rgba(9,9,11,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(9,9,11,0.4) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LIQUID GLASS NAVBAR (HOME, FEATURES, ABOUT US DROPDOWN, FAQ ONLY)
      ═══════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 lg:px-12 pt-4 pb-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo: Péthar */}
          <button
            type="button"
            onClick={() => goToPath('/')}
            className="focus:outline-none cursor-pointer"
          >
            <PetharLogo size={42} showText={true} isDark={isDark} />
          </button>

          {/* Center Floating Liquid Glass Navbar */}
          <nav
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-2 rounded-full backdrop-blur-2xl saturate-150 border transition-all duration-300 ${
              isDark
                ? 'bg-zinc-900/65 border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_40px_rgba(0,0,0,0.55)]'
                : 'bg-white/75 border-zinc-300/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_32px_rgba(0,0,0,0.08)]'
            }`}
          >
            {/* Home Tab */}
            <button
              type="button"
              onClick={() => goToPath('/')}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                currentPage === 'home'
                  ? isDark
                    ? 'bg-white text-zinc-950 shadow-[0_4px_16px_rgba(255,255,255,0.25)]'
                    : 'bg-zinc-950 text-white shadow-[0_4px_14px_rgba(9,9,11,0.2)]'
                  : isDark
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-900/[0.06]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{isAk ? 'ပင်မ' : 'Home'}</span>
            </button>

            {/* Features Tab */}
            <button
              type="button"
              onClick={() => goToPath('/features')}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                currentPage === 'features'
                  ? isDark
                    ? 'bg-white text-zinc-950 shadow-[0_4px_16px_rgba(255,255,255,0.25)]'
                    : 'bg-zinc-950 text-white shadow-[0_4px_14px_rgba(9,9,11,0.2)]'
                  : isDark
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-900/[0.06]'
              }`}
            >
              <span>{isAk ? 'လုပ်ဆောင်ချက်များ' : 'Features'}</span>
            </button>

            {/* About Us Dropdown Tab (With 450ms hover delay & zero-gap padding bridge) */}
            <div
              className="relative"
              onMouseEnter={openAboutMenu}
              onMouseLeave={scheduleCloseAboutMenu}
            >
              <button
                type="button"
                onClick={() => {
                  if (!aboutDropdownOpen) {
                    openAboutMenu()
                  } else {
                    goToPath('/about')
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  currentPage === 'about'
                    ? isDark
                      ? 'bg-white text-zinc-950 shadow-[0_4px_16px_rgba(255,255,255,0.25)]'
                      : 'bg-zinc-950 text-white shadow-[0_4px_14px_rgba(9,9,11,0.2)]'
                    : isDark
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-900/[0.06]'
                }`}
              >
                <span>{isAk ? 'ကျွန်ုပ်တို့အကြောင်း' : 'About Us'}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    aboutDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {aboutDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.16 }}
                    onMouseEnter={openAboutMenu}
                    onMouseLeave={scheduleCloseAboutMenu}
                    className="absolute left-0 top-full pt-3 w-64 z-50"
                  >
                    <div
                      className={`rounded-[26px] p-2.5 backdrop-blur-2xl saturate-150 border ${
                        isDark
                          ? 'bg-[#26292E]/95 border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_24px_60px_rgba(0,0,0,0.65)]'
                          : 'bg-white/95 border-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_20px_50px_rgba(0,0,0,0.12)]'
                      }`}
                    >
                      {ABOUT_DROPDOWN_ITEMS.map((item) => {
                        const ItemIcon = item.icon
                        const isActiveSub =
                          currentPage === 'about' && currentAboutSub === item.key
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => goToPath(item.path)}
                            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer text-left ${
                              isActiveSub
                                ? isDark
                                  ? 'bg-white/15 text-white'
                                  : 'bg-zinc-900/[0.08] text-zinc-950'
                                : isDark
                                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                                  : 'text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100'
                            }`}
                          >
                            <ItemIcon className="w-5 h-5 shrink-0 stroke-[1.8]" />
                            <span>{isAk ? item.labelAk : item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FAQ Tab */}
            <button
              type="button"
              onClick={() => goToPath('/faq')}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                currentPage === 'faq'
                  ? isDark
                    ? 'bg-white text-zinc-950 shadow-[0_4px_16px_rgba(255,255,255,0.25)]'
                    : 'bg-zinc-950 text-white shadow-[0_4px_14px_rgba(9,9,11,0.2)]'
                  : isDark
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-900/[0.06]'
              }`}
            >
              <span>{isAk ? 'အမေးအဖြေ' : 'FAQ'}</span>
            </button>
          </nav>

          {/* Right Controls: Theme Change Button + Language Change Button Right Beside It */}
          <div className="flex items-center gap-2.5">
            {/* Theme Change Button (Liquid Glass) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to White Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
              className={`h-11 px-3.5 rounded-full backdrop-blur-2xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer select-none ${
                isDark
                  ? 'bg-zinc-900/70 hover:bg-zinc-800 border-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.4)]'
                  : 'bg-white/85 hover:bg-white border-zinc-300 text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_rgba(0,0,0,0.06)]'
              }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span className="hidden sm:inline">{isAk ? 'အလင်း' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span className="hidden sm:inline">{isAk ? 'အမှောင်' : 'Dark'}</span>
                </>
              )}
            </button>

            {/* Language Change Button Right Beside Theme Change Button (Only English & ရခိုင် with Non-Draggable Arakan Flag) */}
            <div
              className="relative select-none"
              onDragStart={(e) => e.preventDefault()}
            >
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label="Change Language"
                className={`h-11 px-4 rounded-full backdrop-blur-2xl border inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none ${
                  isDark
                    ? 'bg-zinc-900/70 hover:bg-zinc-800 border-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.4)]'
                    : 'bg-white/85 hover:bg-white border-zinc-300 text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_rgba(0,0,0,0.06)]'
                }`}
              >
                {selectedLangCode === 'ak' ? (
                  <NonDraggableArakanFlag size={20} />
                ) : (
                  <NonDraggableEnglishFlag size={20} />
                )}
                <span>{currentLangItem.label}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 opacity-75 transition-transform ${
                    langMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute right-0 mt-2.5 w-44 rounded-2xl p-1.5 backdrop-blur-2xl border z-50 select-none ${
                      isDark
                        ? 'bg-[#18181B]/95 border-white/15 shadow-2xl text-white'
                        : 'bg-white/95 border-zinc-200 shadow-xl text-zinc-900'
                    }`}
                  >
                    {LANGUAGES.map((item) => {
                      const isSelected = selectedLangCode === item.code
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onDragStart={(e) => e.preventDefault()}
                          onClick={() => {
                            setSelectedLangCode(item.code)
                            setLangMenuOpen(false)
                            if (setLang) {
                              setLang(item.code)
                            }
                          }}
                          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-left select-none ${
                            isSelected
                              ? isDark
                                ? 'bg-white text-zinc-950'
                                : 'bg-zinc-900 text-white'
                              : isDark
                                ? 'text-white/85 hover:bg-white/10'
                                : 'text-zinc-700 hover:bg-zinc-100'
                          }`}
                        >
                          {item.code === 'ak' ? (
                            <NonDraggableArakanFlag size={18} />
                          ) : (
                            <NonDraggableEnglishFlag size={18} />
                          )}
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden w-11 h-11 rounded-full backdrop-blur-2xl border flex items-center justify-center cursor-pointer ${
                isDark
                  ? 'bg-zinc-900/70 border-white/15 text-white'
                  : 'bg-white/85 border-zinc-300 text-zinc-900'
              }`}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`md:hidden mt-3 rounded-3xl p-5 backdrop-blur-2xl border space-y-2 shadow-2xl ${
                isDark
                  ? 'bg-[#18181B]/95 border-white/15 text-white'
                  : 'bg-white/95 border-zinc-200 text-zinc-900'
              }`}
            >
              <button
                type="button"
                onClick={() => goToPath('/')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  currentPage === 'home'
                    ? isDark
                      ? 'bg-white text-zinc-950'
                      : 'bg-zinc-900 text-white'
                    : ''
                }`}
              >
                {isAk ? 'ပင်မ' : 'Home'}
              </button>
              <button
                type="button"
                onClick={() => goToPath('/features')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  currentPage === 'features'
                    ? isDark
                      ? 'bg-white text-zinc-950'
                      : 'bg-zinc-900 text-white'
                    : ''
                }`}
              >
                {isAk ? 'လုပ်ဆောင်ချက်များ' : 'Features'}
              </button>
              <div className="pt-1 pb-1">
                <div className={`px-4 py-1 text-xs font-bold uppercase tracking-wider ${mutedText}`}>
                  {isAk ? 'ကျွန်ုပ်တို့အကြောင်း' : 'About Us'}
                </div>
                <div className="space-y-1 mt-1 pl-2">
                  {ABOUT_DROPDOWN_ITEMS.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => goToPath(item.path)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium ${
                          isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4" />
                        <span>{isAk ? item.labelAk : item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => goToPath('/faq')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  currentPage === 'faq'
                    ? isDark
                      ? 'bg-white text-zinc-950'
                      : 'bg-zinc-900 text-white'
                    : ''
                }`}
              >
                {isAk ? 'အမေးအဖြေ (FAQ)' : 'FAQ'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 1: HOME PAGE (/en or /ak)
      ═══════════════════════════════════════════════════════════════════════ */}
      {currentPage === 'home' && (
        <main className="relative z-10">
          {/* HERO SECTION */}
          <section className="pt-8 pb-16 lg:pt-14 lg:pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                {/* LEFT COLUMN: EXACT REQUESTED COPY (TRANSLATED FOR EN & AK) */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="lg:col-span-6 space-y-6 text-left"
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase backdrop-blur-xl bg-white/[0.06] border-current/15">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAk ? 'ဖေ့သာ မိုဘိုင်းပိုက်ဆံအိတ်' : 'Péthar Mobile Wallet'}</span>
                  </div>

                  <div className="block">
                    <span
                      className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none ${
                        isDark
                          ? 'bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent'
                          : 'text-zinc-950'
                      }`}
                    >
                      Péthar
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-[50px] font-extrabold tracking-tight leading-[1.12]">
                    {isAk
                      ? 'သင်၏ နေ့စဉ်သုံး ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ်'
                      : 'Your Everyday Digital Wallet'}
                  </h1>

                  <p className={`text-base sm:text-lg leading-relaxed max-w-xl ${mutedText}`}>
                    {isAk ? (
                      <>
                        မိုဘိုင်းအက်ပ်တစ်ခုတည်းတွင် သင်၏ လက်ကျန်ငွေကို လွယ်ကူစွာ စီမံခန့်ခွဲပါ။ ပုံသေ{' '}
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                          ၁ အာရက္ခဒေါ်လာ = ၁ အမေရိကန်ဒေါ်လာ (1 Arakan Dollar = 1 US Dollar)
                        </span>{' '}
                        နှုန်းထားဖြင့် လဲလှယ်ပြီး မည်သည့် Péthar အသုံးပြုသူထံသို့မဆို အခမဲ့ ချက်ချင်းငွေလွှဲကာ အချိန်မရွေး ငွေထုတ်ယူနိုင်ပါသည်။
                      </>
                    ) : (
                      <>
                        Manage your balance effortlessly in one mobile app. Convert at a fixed{' '}
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                          1 Arakan Dollar = 1 US Dollar
                        </span>{' '}
                        rate, send to any Péthar user instantly for free, and withdraw anytime.
                      </>
                    )}
                  </p>

                  {/* Key Highlights List */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {(isAk
                      ? [
                          '၁ အာရက္ခဒေါ်လာ = $1 US Dollar',
                          'အချင်းချင်း ငွေလွှဲမှု: ချက်ချင်းနှင့် အခမဲ့',
                          'ချောမွေ့လွယ်ကူသော မိုဘိုင်းပိုက်ဆံအိတ်',
                        ]
                      : [
                          '1 Arakan Dollar = $1 US Dollar',
                          'User-to-User Transfers: Instant & Free',
                          'Seamless Mobile Wallet',
                        ]
                    ).map((point) => (
                      <div
                        key={point}
                        className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${subtleSurface}`}
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  {/* ONLY APP STORE & PLAY STORE BADGES -> download.domain/ak|en/ios|android */}
                  <div className="pt-2 flex flex-wrap items-center gap-3.5">
                    <AppStoreBadge
                      isDark={isDark}
                      isAk={isAk}
                      onClick={() => goToDownloadPlatform('ios')}
                    />
                    <GooglePlayBadge
                      isDark={isDark}
                      isAk={isAk}
                      onClick={() => goToDownloadPlatform('android')}
                    />
                  </div>
                </motion.div>

                {/* RIGHT COLUMN: 3 ANGLED IPHONE MOCKUPS IN WHITE & DARK THEME */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="lg:col-span-6 relative flex items-center justify-center min-h-[470px] sm:min-h-[520px]"
                >
                  <div className="relative w-full max-w-[650px] h-[460px] sm:h-[500px] flex items-center justify-center">
                    {/* 1. LEFT PHONE: Péthar Wallet Balance */}
                    <div
                      className={`w-[200px] sm:w-[220px] h-[415px] sm:h-[440px] rounded-[36px] p-[6px] border transition-transform duration-500 hover:-translate-y-1.5 z-10 shrink-0 ${
                        isDark
                          ? 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-white/25 shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
                          : 'bg-gradient-to-b from-zinc-200 via-zinc-100 to-white border-zinc-300 shadow-[0_25px_50px_rgba(0,0,0,0.14)]'
                      }`}
                      style={{
                        transform:
                          'perspective(1100px) rotateY(16deg) rotateZ(-5deg) translateX(26px) translateY(18px)',
                      }}
                    >
                      <div
                        className={`w-full h-full rounded-[30px] overflow-hidden flex flex-col justify-between border relative ${
                          isDark ? 'bg-[#0C0C0F] border-white/10' : 'bg-white border-zinc-200'
                        }`}
                      >
                        <div>
                          <PhoneStatusBar time="9:41" isDark={isDark} />
                          <div className="flex items-center justify-between px-4 pt-1 pb-2.5">
                            <div className="text-xs font-extrabold tracking-tight">
                              Péthar Wallet
                            </div>
                            <div
                              className={`relative p-1 rounded-full border ${
                                isDark ? 'bg-white/5 border-white/10' : 'bg-zinc-100 border-zinc-200'
                              }`}
                            >
                              <Bell className="w-3.5 h-3.5 opacity-80" />
                            </div>
                          </div>

                          <div
                            className={`mx-3.5 p-3.5 rounded-2xl border text-center ${
                              isDark
                                ? 'bg-white/[0.06] border-white/15'
                                : 'bg-zinc-950 text-white border-zinc-900'
                            }`}
                          >
                            <div className="text-[10px] opacity-70 font-medium">
                              {isAk ? 'ပင်မလက်ကျန်ငွေ' : 'Main Balance'}
                            </div>
                            <div className="text-2xl font-extrabold tracking-tight mt-0.5">
                              0.00
                            </div>
                            <div className="text-[11px] font-semibold opacity-85">
                              {isAk ? 'အာရက္ခဒေါ်လာ' : 'Arakan Dollar'}
                            </div>
                            <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-white/15 text-[9px] font-semibold">
                              1 Arakan Dollar = $1 US Dollar
                            </div>
                          </div>

                          <div className="px-3.5 pt-3">
                            <div className="text-[10px] font-semibold opacity-70 mb-2">
                              {isAk ? 'အဓိကလုပ်ဆောင်ချက်များ' : 'Quick Actions'}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { label: isAk ? 'ပင်မ' : 'Dashboard', icon: Wallet },
                                { label: isAk ? 'ငွေလွှဲရန်' : 'Send', icon: ArrowUpRight },
                                { label: isAk ? 'ပိုင်ဆိုင်မှု' : 'Assets', icon: Layers },
                                { label: isAk ? 'ငွေထုတ်ရန်' : 'Withdraw', icon: ArrowDownLeft },
                              ].map((act, idx) => {
                                const Icon = act.icon
                                return (
                                  <div
                                    key={act.label}
                                    className={`p-2.5 rounded-xl border flex flex-col justify-between h-16 ${
                                      idx === 0
                                        ? isDark
                                          ? 'bg-white text-zinc-950 border-white'
                                          : 'bg-zinc-900 text-white border-zinc-900'
                                        : isDark
                                          ? 'bg-white/5 border-white/10'
                                          : 'bg-zinc-100 border-zinc-200'
                                    }`}
                                  >
                                    <div className="w-6 h-6 rounded-lg bg-current/10 flex items-center justify-center">
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[10px] font-bold">{act.label}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`px-4 py-2.5 border-t flex items-center justify-around ${
                            isDark ? 'bg-black/40 border-white/10' : 'bg-zinc-50 border-zinc-200'
                          }`}
                        >
                          <Home className="w-3.5 h-3.5" />
                          <Compass className="w-3.5 h-3.5 opacity-45" />
                          <Wallet className="w-3.5 h-3.5 opacity-45" />
                          <Settings className="w-3.5 h-3.5 opacity-45" />
                        </div>
                      </div>
                    </div>

                    {/* 2. CENTER PHONE: Instant Free Transfer (from @user & wallet address) */}
                    <div
                      className={`w-[222px] sm:w-[244px] h-[450px] sm:h-[480px] rounded-[40px] p-[7px] border z-30 relative shrink-0 transition-transform duration-500 hover:scale-[1.02] ${
                        isDark
                          ? 'bg-gradient-to-b from-zinc-700 via-zinc-900 to-black border-white/30 shadow-[0_35px_80px_rgba(0,0,0,0.85)]'
                          : 'bg-gradient-to-b from-zinc-300 via-zinc-100 to-white border-zinc-400 shadow-[0_30px_70px_rgba(0,0,0,0.18)]'
                      }`}
                      style={{
                        transform: 'perspective(1100px) rotateY(-4deg) rotateZ(1deg) translateY(-8px)',
                      }}
                    >
                      <div
                        className={`w-full h-full rounded-[33px] overflow-hidden flex flex-col justify-between border px-4 pb-4 relative ${
                          isDark ? 'bg-[#101014] border-white/10' : 'bg-white border-zinc-200'
                        }`}
                      >
                        <div>
                          <PhoneStatusBar time="9:41" isDark={isDark} />

                          {/* In-app notification banner: Received 50.00 Arakan Dollar from @user • now */}
                          <div
                            className={`mt-1 p-2.5 rounded-2xl border flex items-center gap-2.5 ${
                              isDark
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-zinc-900 text-white border-zinc-800'
                            }`}
                          >
                            <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                              <Check className="w-4 h-4" />
                            </div>
                            <div className="text-left leading-tight">
                              <div className="text-[10px] font-bold">
                                {isAk ? 'ချက်ချင်း အခမဲ့ငွေလွှဲမှု' : 'Instant Transfer Free'}
                              </div>
                              <div className="text-[9px] opacity-80">
                                Received 50.00 Arakan Dollar from @user • now
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 text-center space-y-1">
                            <div className="text-[10px] font-semibold uppercase tracking-wider opacity-60">
                              {isAk ? 'ပိုက်ဆံအိတ်လိပ်စာသို့ ပေးပို့ရန်' : 'Send to Wallet Address'}
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-current/15 text-xs font-mono font-bold">
                              <span>@yourwallet</span>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          <div className="mt-5 text-center space-y-1">
                            <div className="text-4xl font-black tracking-tight">50.00</div>
                            <div className="text-xs font-semibold opacity-70">
                              {isAk ? 'အာရက္ခဒေါ်လာ' : 'Arakan Dollar'}
                            </div>
                            <div className="pt-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${pillBadge}`}
                              >
                                1 Arakan Dollar = $1 US Dollar
                              </span>
                            </div>
                          </div>

                          <div
                            className={`mt-4 p-2.5 rounded-xl border text-[10px] space-y-1 ${subtleSurface}`}
                          >
                            <div className="flex justify-between">
                              <span className="opacity-70">
                                {isAk ? 'ငွေလွှဲမြန်နှုန်း' : 'Transfer Speed'}
                              </span>
                              <span className="font-bold">
                                {isAk ? 'ချက်ချင်း (< 1s)' : 'Instant (< 1s)'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="opacity-70">
                                {isAk ? 'အချင်းချင်း ငွေလွှဲခ' : 'User-to-User Fee'}
                              </span>
                              <span className="font-bold">
                                {isAk ? 'အခမဲ့ ($0.00)' : 'Free ($0.00)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <button
                            type="button"
                            onClick={() => goToPath('/features')}
                            className={`w-full py-3 rounded-full font-extrabold text-xs cursor-pointer transition-opacity hover:opacity-90 ${
                              isDark ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
                            }`}
                          >
                            {isAk ? 'ချက်ချင်းပေးပို့မည် (0% ဝန်ဆောင်ခ)' : 'Send Instantly (0% Fee)'}
                          </button>
                          <div className="w-24 h-1 rounded-full bg-current/25 mx-auto" />
                        </div>
                      </div>
                    </div>

                    {/* 3. RIGHT PHONE: Anytime Withdrawal */}
                    <div
                      className={`w-[198px] sm:w-[218px] h-[410px] sm:h-[435px] rounded-[36px] p-[6px] border transition-transform duration-500 hover:-translate-y-1.5 z-20 shrink-0 ${
                        isDark
                          ? 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-white/25 shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
                          : 'bg-gradient-to-b from-zinc-200 via-zinc-100 to-white border-zinc-300 shadow-[0_25px_50px_rgba(0,0,0,0.14)]'
                      }`}
                      style={{
                        transform:
                          'perspective(1100px) rotateY(-16deg) rotateZ(6deg) translateX(-22px) translateY(26px)',
                      }}
                    >
                      <div
                        className={`w-full h-full rounded-[30px] overflow-hidden flex flex-col justify-between border px-3.5 pb-4 ${
                          isDark ? 'bg-[#0C0C0F] border-white/10' : 'bg-white border-zinc-200'
                        }`}
                      >
                        <div>
                          <PhoneStatusBar time="9:41" isDark={isDark} />
                          <div className="flex items-center justify-between pt-1 pb-3">
                            <ChevronLeft className="w-4 h-4 opacity-75" />
                            <span className="text-xs font-bold">
                              {isAk ? 'အချိန်မရွေး ငွေထုတ်ရန်' : 'Withdraw Anytime'}
                            </span>
                            <span className="w-4" />
                          </div>

                          <div className="mt-2 space-y-2 text-left">
                            <label className="text-[10px] font-medium opacity-70 block">
                              {isAk ? 'ထုတ်ယူမည့် ငွေပမာဏ' : 'Withdrawal Amount'}
                            </label>
                            <div
                              className={`px-3 py-2.5 rounded-xl border flex items-center justify-between ${subtleSurface}`}
                            >
                              <div>
                                <div className="text-sm font-bold">0.00</div>
                                <div className="text-[9px] opacity-60">
                                  {isAk ? 'အာရက္ခဒေါ်လာ' : 'Arakan Dollar'}
                                </div>
                              </div>
                              <div className="w-6 h-6 rounded-lg bg-current/10 flex items-center justify-center text-[10px] font-bold">
                                1:1
                              </div>
                            </div>

                            <div
                              className={`mt-3 p-2.5 rounded-xl border space-y-1.5 text-[10px] ${subtleSurface}`}
                            >
                              <div className="flex justify-between">
                                <span className="opacity-70">{isAk ? 'ပုံသေနှုန်း' : 'Fixed Rate'}</span>
                                <span className="font-semibold">1 Arakan Dollar = $1 USD</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-70">{isAk ? 'ဝန်ဆောင်ခ (1.0%)' : 'Fee (1.0%)'}</span>
                                <span className="font-semibold">$1.00 USD</span>
                              </div>
                              <div className="flex justify-between font-bold pt-1 border-t border-current/10">
                                <span>{isAk ? 'လက်ခံရရှိမည့်ငွေ' : 'You Receive'}</span>
                                <span>$99.00 USD</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => goToPath('/features')}
                            className={`w-full py-2.5 rounded-full font-extrabold text-xs cursor-pointer ${
                              isDark ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
                            }`}
                          >
                            {isAk ? 'အချိန်မရွေး ငွေထုတ်မည်' : 'Withdraw Anytime'}
                          </button>
                          <div className="w-20 h-1 rounded-full bg-current/25 mx-auto" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* BOTTOM HERO PILL BAR */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className={`mt-10 lg:mt-12 w-full rounded-2xl lg:rounded-full backdrop-blur-2xl border px-6 py-4 ${cardSurface}`}
              >
                <div className="flex flex-wrap items-center justify-center lg:justify-between gap-y-2 gap-x-6 text-xs sm:text-sm md:text-base font-semibold">
                  <span>
                    {isAk
                      ? '၁ အာရက္ခဒေါ်လာ = $1 US Dollar'
                      : '1 Arakan Dollar = $1 US Dollar'}
                  </span>
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                  <span>
                    {isAk
                      ? 'အချင်းချင်း ငွေလွှဲမှု: ချက်ချင်းနှင့် အခမဲ့'
                      : 'User-to-User Transfers: Instant & Free'}
                  </span>
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                  <span>
                    {isAk ? 'ချောမွေ့လွယ်ကူသော မိုဘိုင်းပိုက်ဆံအိတ်' : 'Seamless Mobile Wallet'}
                  </span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* 4 CORE METRIC CARDS + BUILT FOR EVERYDAY MOBILE MONEY */}
          <section
            className={`py-16 lg:py-24 border-t ${
              isDark ? 'border-white/10' : 'border-zinc-200'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {coreStats.map((item) => (
                  <div
                    key={item.label}
                    className={`p-7 rounded-3xl backdrop-blur-2xl border transition-all duration-300 text-left ${cardSurface}`}
                  >
                    <div
                      className={`text-4xl sm:text-5xl font-black tracking-tight ${
                        isDark
                          ? 'bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent'
                          : 'text-zinc-950'
                      }`}
                    >
                      {item.metric}
                    </div>
                    <div className="mt-3 text-lg font-extrabold">{item.label}</div>
                    <p className={`mt-1 text-xs sm:text-sm leading-relaxed ${mutedText}`}>
                      {item.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Core Live Functions Header */}
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${pillBadge}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isAk ? 'အဓိက တိုက်ရိုက်လုပ်ဆောင်ချက်များ' : 'Core Live Functions'}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                  {isAk
                    ? 'နေ့စဉ်သုံး မိုဘိုင်းငွေကြေးအတွက် အထူးတည်ဆောက်ထားသည်'
                    : 'Built for Everyday Mobile Money'}
                </h2>
                <p className={`text-base sm:text-lg leading-relaxed ${mutedText}`}>
                  {isAk
                    ? '1:1 အာရက္ခဒေါ်လာ လက်ကျန်ငွေစုစည်းမှုမှစ၍ အချင်းချင်း အခမဲ့ချက်ချင်းငွေလွှဲမှုနှင့် လွယ်ကူသော ငွေထုတ်ယူမှုအထိ သင်လိုအပ်သမျှကို မိုဘိုင်းပိုက်ဆံအိတ်တစ်ခုတည်းတွင် ရရှိနိုင်ပါသည်။'
                    : 'Everything you need in one mobile-first digital wallet—from a unified 1:1 Arakan Dollar balance to instant free user-to-user transfers and simple withdrawals.'}
                </p>
              </div>

              {/* 4 Core Function Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: Wallet,
                    badge: isAk ? '1:1 USD တန်ဖိုး' : '1:1 USD Value',
                    title: isAk ? 'စုစည်းထားသော လက်ကျန်ငွေ' : 'Unified Wallet Balance',
                    desc: isAk
                      ? '၁ အာရက္ခဒေါ်လာ = ၁ အမေရိကန်ဒေါ်လာ ပုံသေနှုန်းထားဖြင့် သင်၏ လက်ကျန်ငွေကို အက်ပ်တစ်ခုတည်းတွင် လွယ်ကူစွာ စီမံပါ။'
                      : 'Manage your balance effortlessly in one mobile app at a fixed 1 Arakan Dollar = 1 US Dollar rate.',
                  },
                  {
                    icon: Send,
                    badge: isAk ? 'ချက်ချင်းနှင့် အခမဲ့' : 'Instant & Free',
                    title: isAk ? 'အချင်းချင်း ငွေလွှဲခြင်း' : 'User-to-User Transfers',
                    desc: isAk
                      ? 'မည်သည့် Péthar အသုံးပြုသူထံသို့မဆို ပိုက်ဆံအိတ်လိပ်စာ (Wallet Address) သို့မဟုတ် QR ကုဒ်ဖြင့် ဝန်ဆောင်ခ $0.00 ဖြင့် ချက်ချင်းပေးပို့ပါ။'
                      : 'Send to any Péthar user instantly for free ($0.00 fee) using their wallet address or personal QR code.',
                  },
                  {
                    icon: DollarSign,
                    badge: isAk ? 'ပုံသေနှုန်းထား' : 'Fixed Rate',
                    title: '1 Arakan Dollar = $1 US Dollar',
                    desc: isAk
                      ? 'စျေးနှုန်းကွာဟချက် လုံးဝမရှိဘဲ တိကျခိုင်မာသော 1:1 အမေရိကန်ဒေါ်လာနှုန်းထားဖြင့် လဲလှယ်သိမ်းဆည်းပါ။'
                      : 'Convert and hold your everyday balance with a predictable 1:1 US Dollar rate and zero spread.',
                  },
                  {
                    icon: ArrowDownLeft,
                    badge: isAk ? 'အချိန်မရွေး' : 'Anytime Access',
                    title: isAk ? 'အချိန်မရွေး ငွေထုတ်ယူပါ' : 'Withdraw Anytime',
                    desc: isAk
                      ? 'ပွင့်လင်းမြင်သာသော ဝန်ဆောင်ခတွက်ချက်မှုဖြင့် သင်လိုအပ်သည့်အချိန်တိုင်း မိုဘိုင်းပိုက်ဆံအိတ်မှ တိုက်ရိုက်ငွေထုတ်ယူပါ။'
                      : 'Cash out whenever you need directly from your mobile wallet with clear, upfront fee calculation.',
                  },
                ].map((card) => {
                  const Icon = card.icon
                  return (
                    <div
                      key={card.title}
                      className={`p-6 rounded-3xl backdrop-blur-2xl border flex flex-col justify-between text-left transition-all ${cardSurface}`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${pillBadge}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full border text-[11px] font-bold ${pillBadge}`}
                          >
                            {card.badge}
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold">{card.title}</h3>
                        <p className={`text-sm leading-relaxed ${mutedText}`}>{card.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => goToPath('/features')}
                  className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                      : 'bg-zinc-950 text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>
                    {isAk ? 'လုပ်ဆောင်ချက်အားလုံးကို ကြည့်ရှုရန်' : 'Explore All Features'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 2: FEATURES PAGE (/en/features or /ak/features)
      ═══════════════════════════════════════════════════════════════════════ */}
      {currentPage === 'features' && (
        <main className="relative z-10 py-12 lg:py-20 space-y-24">
          {/* Top Section: 4 Metric Cards + Core Live Functions */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {coreStats.map((item) => (
                <div
                  key={item.label}
                  className={`p-7 rounded-3xl backdrop-blur-2xl border text-left ${cardSurface}`}
                >
                  <div
                    className={`text-4xl sm:text-5xl font-black tracking-tight ${
                      isDark
                        ? 'bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent'
                        : 'text-zinc-950'
                    }`}
                  >
                    {item.metric}
                  </div>
                  <div className="mt-3 text-lg font-extrabold">{item.label}</div>
                  <p className={`mt-1 text-xs sm:text-sm leading-relaxed ${mutedText}`}>
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${pillBadge}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isAk ? 'အဓိက တိုက်ရိုက်လုပ်ဆောင်ချက်များ' : 'Core Live Functions'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                {isAk
                  ? 'နေ့စဉ်သုံး မိုဘိုင်းငွေကြေးအတွက် အထူးတည်ဆောက်ထားသည်'
                  : 'Built for Everyday Mobile Money'}
              </h1>
              <p className={`text-base sm:text-lg leading-relaxed ${mutedText}`}>
                {isAk
                  ? '1:1 အာရက္ခဒေါ်လာ လက်ကျန်ငွေစုစည်းမှုမှစ၍ အချင်းချင်း အခမဲ့ချက်ချင်းငွေလွှဲမှုနှင့် လွယ်ကူသော ငွေထုတ်ယူမှုအထိ သင်လိုအပ်သမျှကို မိုဘိုင်းပိုက်ဆံအိတ်တစ်ခုတည်းတွင် ရရှိနိုင်ပါသည်။'
                  : 'Everything you need in one mobile-first digital wallet—from a unified 1:1 Arakan Dollar balance to instant free user-to-user transfers and simple withdrawals.'}
              </p>
            </div>

            {/* Interactive 01 - 04 App Walkthrough */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {flowSteps.map((step, idx) => {
                const isActive = activeFlowTab === idx
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveFlowTab(idx)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? isDark
                          ? 'bg-white text-zinc-950 border-white shadow-lg'
                          : 'bg-zinc-950 text-white border-zinc-950 shadow-lg'
                        : cardSurface
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold opacity-75">{step.id}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <div className="text-sm sm:text-base font-bold mt-1">
                      {step.badge.replace(/^0\d\s/, '')}
                    </div>
                  </button>
                )
              })}
            </div>

            <div
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-3xl p-6 sm:p-10 border backdrop-blur-2xl ${cardSurface}`}
            >
              <div className="lg:col-span-7 space-y-6 text-left">
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-bold ${pillBadge}`}
                >
                  {flowSteps[activeFlowTab].badge}
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {flowSteps[activeFlowTab].title}
                </h2>
                <p className={`text-base sm:text-lg leading-relaxed ${mutedText}`}>
                  {flowSteps[activeFlowTab].description}
                </p>

                <ul className="space-y-3 pt-2">
                  {flowSteps[activeFlowTab].highlights.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm sm:text-base font-medium">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveFlowTab((prev) => (prev - 1 + 4) % 4)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${subtleSurface}`}
                  >
                    {isAk ? '← ယခင်အဆင့်' : '← Previous Step'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFlowTab((prev) => (prev + 1) % 4)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                      isDark ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
                    }`}
                  >
                    {isAk ? 'နောက်တစ်ဆင့် →' : 'Next Step →'}
                  </button>
                </div>
              </div>

              {/* Interactive Phone Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div
                  className={`w-[275px] sm:w-[295px] h-[500px] rounded-[42px] p-[8px] border ${
                    isDark
                      ? 'bg-gradient-to-b from-zinc-700 via-zinc-900 to-black border-white/25 shadow-2xl'
                      : 'bg-gradient-to-b from-zinc-200 via-zinc-100 to-white border-zinc-300 shadow-xl'
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-[34px] overflow-hidden flex flex-col justify-between border relative ${
                      isDark ? 'bg-[#0C0C0F] border-white/10' : 'bg-white border-zinc-200'
                    }`}
                  >
                    <PhoneStatusBar time="9:41" isDark={isDark} />

                    <div className="flex-1 px-4 py-2 flex flex-col justify-between text-left">
                      {activeFlowTab === 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold">Péthar Wallet</span>
                            <button
                              type="button"
                              onClick={() => setPreviewBalanceVisible(!previewBalanceVisible)}
                              className={`p-1.5 rounded-lg border cursor-pointer ${subtleSurface}`}
                            >
                              {previewBalanceVisible ? (
                                <Eye className="w-3.5 h-3.5" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <div
                            className={`p-4 rounded-2xl border text-center ${
                              isDark ? 'bg-white/10 border-white/15' : 'bg-zinc-950 text-white border-zinc-900'
                            }`}
                          >
                            <div className="text-[11px] opacity-70">
                              {isAk ? 'ပင်မလက်ကျန်ငွေ' : 'Main Balance'}
                            </div>
                            <div className="text-3xl font-extrabold mt-1">
                              {previewBalanceVisible ? '0.00' : '••••••'}
                            </div>
                            <div className="text-xs font-semibold opacity-85">
                              {isAk ? 'အာရက္ခဒေါ်လာ' : 'Arakan Dollar'}
                            </div>
                            <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold">
                              1 Arakan Dollar = $1 US Dollar
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {[
                              { label: isAk ? 'ပင်မ' : 'Dashboard', icon: Wallet, target: 0 },
                              { label: isAk ? 'ငွေလွှဲရန်' : 'Send', icon: ArrowUpRight, target: 2 },
                              { label: isAk ? 'ပိုင်ဆိုင်မှု' : 'Assets', icon: Layers, target: 1 },
                              { label: isAk ? 'ငွေထုတ်ရန်' : 'Withdraw', icon: ArrowDownLeft, target: 3 },
                            ].map((btn) => {
                              const BtnIcon = btn.icon
                              return (
                                <button
                                  key={btn.label}
                                  type="button"
                                  onClick={() => setActiveFlowTab(btn.target)}
                                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer ${subtleSurface}`}
                                >
                                  <BtnIcon className="w-4 h-4" />
                                  <span className="text-xs font-semibold">{btn.label}</span>
                                </button>
                              )
                            })}
                          </div>

                          <div className={`p-3 rounded-xl border space-y-1.5 ${subtleSurface}`}>
                            <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                              {isAk ? 'လတ်တလော လှုပ်ရှားမှု' : 'Recent Activity'}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <div className="font-semibold">from @user</div>
                                <div className="text-[10px] opacity-65">Instant Transfer • 0% Fee</div>
                              </div>
                              <span className="font-bold">+50.00</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeFlowTab === 1 && (
                        <div className="space-y-3.5">
                          <div className="text-xs font-bold flex items-center justify-between">
                            <span>{isAk ? 'အက်ပ်အတွင်း 1:1 USD တန်ဖိုး' : 'In-App 1:1 USD Value'}</span>
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] ${pillBadge}`}>
                              Fixed 1:1
                            </span>
                          </div>
                          <div className={`p-4 rounded-2xl border space-y-3 ${subtleSurface}`}>
                            <div className="flex items-center justify-between text-xs">
                              <span className="opacity-70">{isAk ? 'အာရက္ခဒေါ်လာ' : 'Arakan Dollar'}</span>
                              <span className="font-bold">0.00</span>
                            </div>
                            <div className="flex justify-center">
                              <div className="w-7 h-7 rounded-full border border-current/20 flex items-center justify-center font-bold text-xs">
                                =
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="opacity-70">{isAk ? 'အမေရိကန်ဒေါ်လာ တန်ဖိုး' : 'US Dollar Value'}</span>
                              <span className="font-bold">$0.00 USD</span>
                            </div>
                          </div>
                          <p className={`text-[11px] leading-relaxed ${mutedText}`}>
                            {isAk
                              ? '၁ အာရက္ခဒေါ်လာ = ၁ အမေရိကန်ဒေါ်လာ ပုံသေနှုန်းထားဖြင့် ကွာဟချက် 0% ဖြင့် လဲလှယ်နိုင်ပါသည်။'
                              : 'Convert at a fixed 1 Arakan Dollar = 1 US Dollar rate with 0% spread.'}
                          </p>
                        </div>
                      )}

                      {activeFlowTab === 2 && (
                        <div className="space-y-3">
                          <div className="text-xs font-bold">
                            {isAk ? 'ပိုက်ဆံအိတ်လိပ်စာသို့ ချက်ချင်းငွေလွှဲရန်' : 'Instant Wallet Address Send'}
                          </div>
                          <input
                            type="text"
                            value={transferRecipient}
                            onChange={(event) => setTransferRecipient(event.target.value)}
                            placeholder={isAk ? 'ပိုက်ဆံအိတ်လိပ်စာ ထည့်ပါ' : 'Enter a wallet address'}
                            className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${subtleSurface}`}
                          />
                          <div className={`p-3.5 rounded-2xl border text-center ${subtleSurface}`}>
                            <div className="text-[10px] opacity-65 font-mono">
                              {isAk ? `ပေးပို့မည့်လိပ်စာ: ${transferRecipient}` : `Wallet Address: ${transferRecipient}`}
                            </div>
                            <div className="text-2xl font-black mt-1">50.00</div>
                            <div className="text-[10px] opacity-75">
                              {isAk ? 'အာရက္ခဒေါ်လာ • ဝန်ဆောင်ခ: $0.00' : 'Arakan Dollar • Fee: $0.00'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setTransferSentToast(true)
                              setTimeout(() => setTransferSentToast(false), 2000)
                            }}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer ${
                              isDark ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
                            }`}
                          >
                            {transferSentToast
                              ? isAk
                                ? 'ချက်ချင်း ပေးပို့ပြီးပါပြီ ✓'
                                : 'Sent Instantly ✓'
                              : isAk
                                ? 'အခမဲ့ ချက်ချင်းပေးပို့မည်'
                                : 'Send Free to Wallet Address'}
                          </button>
                        </div>
                      )}

                      {activeFlowTab === 3 && (
                        <div className="space-y-3">
                          <div className="text-xs font-bold">
                            {isAk ? 'အချိန်မရွေး ငွေထုတ်ယူမှု' : 'Anytime Withdrawal'}
                          </div>
                          <div className={`p-3.5 rounded-2xl border space-y-2 text-xs ${subtleSurface}`}>
                            <div className="flex justify-between">
                              <span className="opacity-70">{isAk ? 'ထုတ်ယူမည့်ပမာဏ' : 'Withdraw Amount'}</span>
                              <span className="font-bold">100.00 Arakan Dollar</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="opacity-70">{isAk ? 'နှုန်းထား' : 'Rate'}</span>
                              <span className="font-bold">1:1 USD</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="opacity-70">{isAk ? 'ဝန်ဆောင်ခ (1.0%)' : 'Fee (1.0%)'}</span>
                              <span className="font-bold">$1.00 USD</span>
                            </div>
                            <div className="flex justify-between pt-1.5 border-t border-current/10 font-extrabold">
                              <span>{isAk ? 'အသားတင်ရရှိမည့်ငွေ' : 'Net Payout'}</span>
                              <span>$99.00 USD</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="py-2 flex justify-center">
                        <div className="w-24 h-1 rounded-full bg-current/25" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6-Card Mobile Wallet Architecture Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${pillBadge}`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {isAk ? 'ချောမွေ့လွယ်ကူသော မိုဘိုင်းပိုက်ဆံအိတ်' : 'Seamless Mobile Wallet'}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {isAk
                  ? 'ရိုးရှင်းမှု၊ မြန်ဆန်မှုနှင့် မိုဘိုင်းလုံခြုံရေးအတွက် ဒီဇိုင်းထုတ်ထားသည်'
                  : 'Designed for Simplicity, Speed, and Mobile Security'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className={`md:col-span-3 p-7 rounded-3xl border text-left flex flex-col justify-between ${cardSurface}`}>
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${pillBadge}`}>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {isAk
                      ? '၁ အာရက္ခဒေါ်လာ = $1.00 USD ဖြင့် စုစည်းထားသော လက်ကျန်ငွေ'
                      : 'Unified Balance at 1 Arakan Dollar = $1.00 USD'}
                  </h3>
                  <p className={`text-sm leading-relaxed ${mutedText}`}>
                    {isAk
                      ? 'သင်၏ ပိုက်ဆံအိတ်လက်ကျန်ငွေအားလုံးကို ပုံသေ 1:1 အမေရိကန်ဒေါ်လာတန်ဖိုးရှိသော အာရက္ခဒေါ်လာဖြင့် တစ်နေရာတည်းတွင် ရှင်းလင်းစွာ စုစည်းထားပါသည်။'
                      : 'Your entire wallet balance is unified in Arakan Dollar with a fixed 1:1 US Dollar value—eliminating multi-balance clutter so you always know exactly what you hold.'}
                  </p>
                </div>
                <div className={`mt-6 p-3.5 rounded-xl border flex items-center justify-between text-xs ${subtleSurface}`}>
                  <span className="opacity-70">{isAk ? 'အက်ပ်အတွင်း ပုံသေတန်ဖိုး' : 'In-App Fixed Value'}</span>
                  <span className="font-extrabold">1 Arakan Dollar = $1.00 USD</span>
                </div>
              </div>

              <div className={`md:col-span-3 p-7 rounded-3xl border text-left flex flex-col justify-between ${cardSurface}`}>
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${pillBadge}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {isAk
                      ? 'ပိုက်ဆံအိတ်လိပ်စာ (Wallet Address) နှင့် QR ကုဒ်ဖြင့် ချက်ချင်းငွေလွှဲခြင်း'
                      : 'Instant Wallet Address & Personal QR Transfers'}
                  </h3>
                  <p className={`text-sm leading-relaxed ${mutedText}`}>
                    {isAk
                      ? 'မိတ်ဆွေများနှင့် မိသားစုထံသို့ ပိုက်ဆံအိတ်လိပ်စာ (Wallet Address) သို့မဟုတ် ကိုယ်ပိုင် QR ကုဒ်ဖြင့် ဝန်ဆောင်ခ $0.00 (0%) ဖြင့် တစ်ချက်နှိပ်ရုံဖြင့် ချက်ချင်းငွေလွှဲပို့ပါ။'
                      : 'Send Arakan Dollar to friends and family in one tap using their wallet address or personal QR code with a $0.00 (0%) transfer fee.'}
                  </p>
                </div>
                <div className={`mt-6 flex items-center justify-between gap-2 p-3 rounded-xl border ${subtleSurface}`}>
                  <div className="text-xs font-mono">
                    {isAk ? 'ပိုက်ဆံအိတ်လိပ်စာကို အက်ပ်ထဲတွင် ကြည့်ပါ' : 'Wallet address is shown in the app'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('')
                      setCopiedAddress(true)
                      setTimeout(() => setCopiedAddress(false), 2000)
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${pillBadge}`}
                  >
                    {copiedAddress ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedAddress
                      ? isAk
                        ? 'ကူးယူပြီးပါပြီ'
                        : 'Copied Address'
                      : isAk
                        ? 'လိပ်စာကူးယူရန်'
                        : 'Copy Address'}
                  </button>
                </div>
              </div>

              <div className={`md:col-span-2 p-6 rounded-3xl border text-left flex flex-col justify-between ${cardSurface}`}>
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${pillBadge}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">
                    {isAk ? 'နေ့စဉ်သုံး ရိုးရှင်းလွယ်ကူမှု' : 'Everyday Simplicity'}
                  </h3>
                  <p className={`text-sm leading-relaxed ${mutedText}`}>
                    {isAk
                      ? 'အက်ပ်ဖွင့်လိုက်သည်နှင့် Dashboard၊ ငွေလွှဲရန်၊ ပိုင်ဆိုင်မှုနှင့် ငွေထုတ်ရန် ခလုတ်များကို တစ်ချက်တည်းဖြင့် အလွယ်တကူ အသုံးပြုနိုင်ပါသည်။'
                      : 'Clean quick-action navigation gives you instant access to Dashboard, Send, Assets, and Withdraw from the moment you open the app.'}
                  </p>
                </div>
              </div>

              <div className={`md:col-span-2 p-6 rounded-3xl border text-left flex flex-col justify-between ${cardSurface}`}>
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${pillBadge}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">
                    {isAk ? 'အချိန်နှင့်တစ်ပြေးညီ အသိပေးချက်များ' : 'Real-Time Push Alerts'}
                  </h3>
                  <p className={`text-sm leading-relaxed ${mutedText}`}>
                    {isAk
                      ? 'ငွေဝင်လာသည်နှင့် ချက်ချင်း ဖုန်းအသိပေးချက် ရရှိနိုင်ပါသည် — ဥပမာ “Received 50.00 Arakan Dollar from @user • now”။'
                      : 'Get instant mobile notifications the second funds arrive—like “Received 50.00 Arakan Dollar from @user • now”.'}
                  </p>
                </div>
              </div>

              <div className={`md:col-span-2 p-6 rounded-3xl border text-left flex flex-col justify-between ${cardSurface}`}>
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${pillBadge}`}>
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">
                    {isAk ? 'မိုဘိုင်းဦးစားပေး လုံခြုံရေး' : 'Mobile-First Security'}
                  </h3>
                  <p className={`text-sm leading-relaxed ${mutedText}`}>
                    {isAk
                      ? 'iOS နှင့် Android ပေါ်တွင် Biometrics၊ Hardware Encryption နှင့် အချိန်နှင့်တစ်ပြေးညီ ငွေလွှဲစစ်ဆေးမှုများဖြင့် ကာကွယ်ထားပါသည်။'
                      : 'Protected by device biometrics, hardware-backed encryption, and real-time transaction verification on iOS and Android.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 3: ABOUT US PAGE (/en/about or /ak/about & sub-routes)
      ═══════════════════════════════════════════════════════════════════════ */}
      {currentPage === 'about' && (
        <main className="relative z-10 py-12 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Sub-navigation bar for the 5 About Us items */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {ABOUT_DROPDOWN_ITEMS.map((item) => {
              const ItemIcon = item.icon
              const active = currentAboutSub === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => goToPath(item.path)}
                  className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                    active
                      ? isDark
                        ? 'bg-white text-zinc-950 border-white shadow-lg'
                        : 'bg-zinc-950 text-white border-zinc-950 shadow-lg'
                      : cardSurface
                  }`}
                >
                  <ItemIcon className="w-4 h-4" />
                  <span>{isAk ? item.labelAk : item.label}</span>
                </button>
              )
            })}
          </div>

          {/* 1. ABOUT US OVERVIEW (/about) */}
          {currentAboutSub === 'overview' && (
            <div className="space-y-12">
              <div className="text-center max-w-4xl mx-auto space-y-5">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${pillBadge}`}
                >
                  <FileBadge className="w-3.5 h-3.5" />
                  <span>{isAk ? 'Péthar အကြောင်း' : 'About Péthar'}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                  {isAk
                    ? 'လွယ်ကူချောမွေ့သော မိုဘိုင်းငွေကြေးအတွက် သင်၏ နေ့စဉ်သုံး ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ်'
                    : 'Your Everyday Digital Wallet for Effortless Mobile Money'}
                </h1>
                <p className={`text-base sm:text-lg leading-relaxed max-w-3xl mx-auto ${mutedText}`}>
                  {isAk
                    ? 'Péthar သည် နေ့စဉ်သုံး ဒစ်ဂျစ်တယ်ငွေကြေးကို လူတိုင်းအတွက် ရိုးရှင်းပြီး တိကျခိုင်မာစေရန် တည်ဆောက်ထားခြင်းဖြစ်ပါသည်။ ၁ အာရက္ခဒေါ်လာ = ၁ အမေရိကန်ဒေါ်လာ ပုံသေနှုန်းထားဖြင့် လက်ကျန်ငွေကို စီမံပြီး မည်သည့် Péthar အသုံးပြုသူထံသို့မဆို အခမဲ့ ချက်ချင်းငွေလွှဲကာ အချိန်မရွေး ငွေထုတ်ယူနိုင်ပါသည်။'
                    : 'Péthar is built to make everyday digital money simple, predictable, and accessible for everyone. Hold and manage your balance at a fixed 1 Arakan Dollar = 1 US Dollar rate, send to any Péthar user instantly for free, and withdraw anytime from one seamless mobile app.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    label: isAk ? 'ပုံသေ 1:1 USD နှုန်းထား' : 'Fixed 1:1 USD Rate',
                    desc: isAk
                      ? 'သင်၏ မိုဘိုင်းပိုက်ဆံအိတ်အတွင်း ၁ အာရက္ခဒေါ်လာ = $1.00 USD ပုံသေနှုန်းထားဖြင့် ကွာဟချက်မရှိပါ။'
                      : '1 Arakan Dollar = $1.00 US Dollar inside your mobile wallet with zero spread.',
                    icon: DollarSign,
                  },
                  {
                    label: isAk ? 'ချက်ချင်းနှင့် အခမဲ့ ငွေလွှဲ' : 'Instant & Free Transfer',
                    desc: isAk
                      ? 'မည်သည့် Péthar အသုံးပြုသူထံသို့မဆို ဝန်ဆောင်ခ $0.00 ဖြင့် ၁ စက္ကန့်အောက်အတွင်း ငွေလွှဲပို့နိုင်ပါသည်။'
                      : 'Send money to any Péthar user in under a second with $0.00 user-to-user fees.',
                    icon: Zap,
                  },
                  {
                    label: isAk ? 'အသုံးပြုသူ ကိုယ်တိုင်ထိန်းချုပ်သော လုံခြုံရေး' : 'User-Controlled Security',
                    desc: isAk
                      ? 'Biometric လုံခြုံရေးနှင့် ငွေလွှဲမှုတိုင်းကို သင်ကိုယ်တိုင် အပြည့်အဝ ထိန်းချုပ်နိုင်ပါသည်။'
                      : 'Hardware-backed biometric security and full user control over every transaction.',
                    icon: ShieldCheck,
                  },
                  {
                    label: isAk ? 'iOS နှင့် Android အသင့်သုံး' : 'iOS & Android Ready',
                    desc: isAk
                      ? 'App Store နှင့် Google Play တို့တွင် နေ့စဉ် လွယ်ကူစွာ ဒေါင်းလုဒ်ရယူ အသုံးပြုနိုင်ပါသည်။'
                      : 'Designed for effortless everyday use on App Store and Google Play.',
                    icon: Smartphone,
                  },
                ].map((pillar) => {
                  const Icon = pillar.icon
                  return (
                    <div
                      key={pillar.label}
                      className={`p-6 rounded-3xl border text-left space-y-3 ${cardSurface}`}
                    >
                      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${pillBadge}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-extrabold">{pillar.label}</h3>
                      <p className={`text-sm leading-relaxed ${mutedText}`}>{pillar.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 2. TECHNOLOGY (/about/technology) */}
          {currentAboutSub === 'technology' && (
            <div className="space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${pillBadge}`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{isAk ? 'နည်းပညာ' : 'Technology'}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                  {isAk
                    ? 'စက္ကန့်ပိုင်းအတွင်း မြန်ဆန်မှုနှင့် လုံခြုံရေးအတွက် တည်ဆောက်ထားသည်'
                    : 'Engineered for Sub-Second Speed & Security'}
                </h1>
                <p className={`text-base sm:text-lg leading-relaxed ${mutedText}`}>
                  {isAk
                    ? 'Péthar သည် ခေတ်မီ ကုဒ်ဝှက်နည်းပညာ၊ ချက်ချင်းစာရင်းရှင်းလင်းမှုနှင့် Biometric လုံခြုံရေးတို့ကို ပေါင်းစပ်၍ မြန်ဆန်စိတ်ချရသော မိုဘိုင်းပိုက်ဆံအိတ် အတွေ့အကြုံကို ပေးစွမ်းပါသည်။'
                    : 'Péthar combines modern cryptography, atomic ledger settlement, and biometric hardware protection to deliver a fast, reliable mobile wallet experience.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Lock,
                    title: isAk ? 'ကိုယ်ပိုင်ဖုန်းဖြင့် တိုက်ရိုက်အတည်ပြုခြင်း' : 'Self-Custodial Device Authorization',
                    desc: isAk
                      ? 'ငွေလွှဲမှုတိုင်းကို သင်၏ မိုဘိုင်းဖုန်းပေါ်ရှိ လုံခြုံရေးသော့ချက်နှင့် Biometrics ဖြင့် တိုက်ရိုက် စစ်ဆေးအတည်ပြုပါသည်။'
                      : 'Every transfer is signed and verified directly on your mobile device using hardware-enclave keys and biometric authentication.',
                  },
                  {
                    icon: Zap,
                    title: isAk ? '၁ စက္ကန့်အောက် ချက်ချင်းစာရင်းရှင်းလင်းမှု' : 'Sub-Second Atomic Settlement',
                    desc: isAk
                      ? 'အသုံးပြုသူအချင်းချင်း ငွေလွှဲမှုများသည် ၁ စက္ကန့်အောက်အတွင်း ချက်ချင်းရောက်ရှိပြီး ဒစ်ဂျစ်တယ်ပြေစာ ထုတ်ပေးပါသည်။'
                      : 'User-to-user transfers settle in under 1 second with instant digital receipt verification and zero network congestion.',
                  },
                  {
                    icon: WifiOff,
                    title: isAk ? 'အင်တာနက်လိုင်းနည်းချိန်နှင့် Offline စနစ်' : 'Resilient Low-Bandwidth & Offline Mode',
                    desc: isAk
                      ? 'မိုဘိုင်းလိုင်းအားနည်းသည့် နေရာများတွင်ပင် လက်ကျန်ငွေစစ်ဆေးခြင်းနှင့် QR ငွေလွှဲခြင်းတို့ကို ချောမွေ့စွာ လုပ်ဆောင်နိုင်ပါသည်။'
                      : 'Optimized lightweight protocol ensures smooth balance checks and QR transfers even on weak mobile connections.',
                  },
                  {
                    icon: ShieldCheck,
                    title: isAk ? 'End-to-End ကုဒ်ဝှက်ထားသော စာရင်းစနစ်' : 'End-to-End Encrypted Ledger',
                    desc: isAk
                      ? 'ကိုယ်ရေးအချက်အလက်နှင့် ငွေလွှဲမှတ်တမ်းအားလုံးကို End-to-End Encryption ဖြင့် တင်းကျပ်စွာ ကာကွယ်ထားပါသည်။'
                      : 'All personal metadata and transaction history are protected with end-to-end encryption and strict privacy controls.',
                  },
                ].map((tech) => {
                  const Icon = tech.icon
                  return (
                    <div
                      key={tech.title}
                      className={`p-8 rounded-3xl border text-left space-y-4 ${cardSurface}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${pillBadge}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-extrabold">{tech.title}</h3>
                      <p className={`text-sm sm:text-base leading-relaxed ${mutedText}`}>
                        {tech.desc}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 3. PRODUCTS (/about/products) */}
          {currentAboutSub === 'products' && (
            <div className="space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${pillBadge}`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>{isAk ? 'ထုတ်ကုန်များ' : 'Products'}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                  {isAk ? 'Péthar ထုတ်ကုန်ဝန်ဆောင်မှုများ' : 'The Péthar Product Suite'}
                </h1>
                <p className={`text-base sm:text-lg leading-relaxed ${mutedText}`}>
                  {isAk
                    ? 'သင်၏ နေ့စဉ်လက်ကျန်ငွေကို သိမ်းဆည်းရန်၊ လဲလှယ်ရန်၊ ပေးပို့ရန်နှင့် ထုတ်ယူရန် လိုအပ်သမျှကို မိုဘိုင်းအတွေ့အကြုံတစ်ခုတည်းတွင် ရရှိနိုင်ပါသည်။'
                    : 'Everything you need to hold, convert, send, and withdraw your everyday balance in one cohesive mobile experience.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Smartphone,
                    tag: 'iOS & Android',
                    title: isAk ? 'Péthar မိုဘိုင်းပိုက်ဆံအိတ်' : 'Péthar Mobile Wallet',
                    desc: isAk
                      ? '၁ အာရက္ခဒေါ်လာ = $1 US Dollar လက်ကျန်ငွေ၊ Biometric လုံခြုံရေးနှင့် ချက်ချင်းအသိပေးချက်များ ပါဝင်သော သင်၏ နေ့စဉ်သုံး ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ်။'
                      : 'Your everyday digital wallet with a unified 1 Arakan Dollar = $1 US Dollar balance, biometric protection, and instant push notifications.',
                  },
                  {
                    icon: Send,
                    tag: isAk ? '0% ဝန်ဆောင်ခ ($0.00)' : '0% Fee ($0.00)',
                    title: isAk ? 'Péthar ချက်ချင်း ငွေလွှဲစနစ်' : 'Péthar Instant Transfer',
                    desc: isAk
                      ? 'ပိုက်ဆံအိတ်လိပ်စာ (Wallet Address) သို့မဟုတ် ကိုယ်ပိုင် QR ကုဒ်ဖြင့် ဝန်ဆောင်ခ လုံးဝမရှိဘဲ ၁ စက္ကန့်အောက်အတွင်း ငွေပေးပို့/လက်ခံနိုင်ပါသည်။'
                      : 'Send and receive Arakan Dollar in under a second via wallet address or scannable personal QR codes with zero fees.',
                  },
                  {
                    icon: ArrowDownLeft,
                    tag: '24/7 Liquidity',
                    title: isAk ? 'အချိန်မရွေး ငွေထုတ်ယူမှု' : 'Anytime Withdrawals',
                    desc: isAk
                      ? 'ပုံသေ 1:1 နှုန်းထားဖြင့် လဲလှယ်ပြီး ပွင့်လင်းမြင်သာသော ဝန်ဆောင်ခတွက်ချက်မှုဖြင့် အချိန်မရွေး ငွေထုတ်ယူနိုင်ပါသည်။'
                      : 'Convert at a fixed 1:1 rate and withdraw your balance whenever you need with transparent, automatic fee calculation.',
                  },
                ].map((prod) => {
                  const Icon = prod.icon
                  return (
                    <div
                      key={prod.title}
                      className={`p-7 rounded-3xl border text-left flex flex-col justify-between space-y-6 ${cardSurface}`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${pillBadge}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`px-3 py-1 rounded-full border text-xs font-bold ${pillBadge}`}>
                            {prod.tag}
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold">{prod.title}</h3>
                        <p className={`text-sm leading-relaxed ${mutedText}`}>{prod.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 4. AWARD & RECOGNITION (/about/awards) */}
          {currentAboutSub === 'awards' && (
            <div className="space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${pillBadge}`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{isAk ? 'ဆုတံဆိပ်နှင့် အသိအမှတ်ပြုမှု' : 'Award & Recognition'}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                  {isAk
                    ? 'မိုဘိုင်းပိုက်ဆံအိတ် စွမ်းဆောင်ရည်အတွက် အသိအမှတ်ပြုမှုများ'
                    : 'Recognized for Mobile Wallet Excellence'}
                </h1>
                <p className={`text-base sm:text-lg leading-relaxed ${mutedText}`}>
                  {isAk
                    ? 'အသုံးပြုရလွယ်ကူသော ဒီဇိုင်း၊ လုံခြုံရေးနှင့် အခမဲ့ နေ့စဉ်ငွေလွှဲမှုများအတွက် Péthar ၏ ကြိုးပမ်းအားထုတ်မှု အသိအမှတ်ပြုမှတ်တိုင်များ။'
                    : 'Milestones and industry recognition highlighting Péthar’s commitment to intuitive design, security, and zero-fee everyday transfers.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    year: '2026',
                    title: isAk ? 'အကောင်းဆုံး မိုဘိုင်းပိုက်ဆံအိတ် UX ဒီဇိုင်းဆု' : 'Excellence in Mobile Wallet UX',
                    org: 'Digital Finance Design Forum',
                    desc: isAk
                      ? 'ပိုက်ဆံအိတ်လိပ်စာ (Wallet Address) နှင့် QR ငွေလွှဲမှုများကို ရိုးရှင်းရှင်းလင်းစွာ အသုံးပြုနိုင်သော မိုဘိုင်းမျက်နှာပြင်အတွက် အသိအမှတ်ပြုခံရသည်။'
                      : 'Recognized for creating a clean, zero-clutter mobile wallet interface with instant wallet address and QR transfers.',
                  },
                  {
                    year: '2026',
                    title: isAk ? 'အကောင်းဆုံး အခမဲ့ ငွေပေးချေမှု အတွေ့အကြုံ' : 'Best Zero-Fee Payment Experience',
                    org: 'Fintech Innovation Awards',
                    desc: isAk
                      ? 'ဝန်ဆောင်ခ $0.00 နှင့် ပုံသေ 1:1 USD တန်ဖိုးဖြင့် စက္ကန့်ပိုင်းအတွင်း အချင်းချင်း ငွေလွှဲနိုင်မှုအတွက် ဂုဏ်ပြုချီးမြှင့်ခံရသည်။'
                      : 'Honored for delivering sub-second user-to-user settlements with a $0.00 transfer fee and fixed 1:1 USD parity.',
                  },
                  {
                    year: '2025',
                    title: isAk ? 'မိုဘိုင်းလုံခြုံရေးနှင့် ကိုယ်ရေးလုံခြုံမှု စံနှုန်းဆု' : 'Mobile Security & Privacy Standard',
                    org: 'Global Wallet Security Benchmark',
                    desc: isAk
                      ? 'Biometric အတည်ပြုချက်၊ End-to-End Encryption နှင့် စစ်ဆေးနိုင်သော e-Receipt စနစ်တို့အတွက် ဆုချီးမြှင့်ခံရသည်။'
                      : 'Awarded for hardware-backed biometric authentication, end-to-end encryption, and verifiable e-Receipts.',
                  },
                ].map((award) => (
                  <div
                    key={award.title}
                    className={`p-7 rounded-3xl border text-left space-y-4 ${cardSurface}`}
                  >
                    <div className="flex items-center justify-between">
                      <Award className="w-6 h-6" />
                      <span className={`px-3 py-1 rounded-full border text-xs font-bold ${pillBadge}`}>
                        {award.year}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold">{award.title}</h3>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-70">
                      {award.org}
                    </div>
                    <p className={`text-sm leading-relaxed ${mutedText}`}>{award.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ROADMAP (/about/roadmap) */}
          {currentAboutSub === 'roadmap' && (
            <div className="space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${pillBadge}`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>{isAk ? 'ရှေ့လုပ်ငန်းစဉ်' : 'Roadmap'}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                  {isAk ? 'Péthar ထုတ်ကုန် ရှေ့လုပ်ငန်းစဉ်' : 'Péthar Product Roadmap'}
                </h1>
                <p className={`text-base sm:text-lg leading-relaxed ${mutedText}`}>
                  {isAk
                    ? 'iOS နှင့် Android ပေါ်တွင် Péthar နေ့စဉ်သုံး ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ်ကို အဆင့်ဆင့် တိုးချဲ့သွားမည့် မှတ်တိုင်များ။'
                    : 'Our step-by-step milestones as we expand the Péthar everyday digital wallet on iOS and Android.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    phase: 'Phase 01',
                    status: isAk ? 'ပြီးစီးပြီ' : 'Completed',
                    title: isAk ? 'အခြေခံ 1:1 မိုဘိုင်းပိုက်ဆံအိတ်' : 'Core 1:1 Mobile Wallet',
                    items: isAk
                      ? [
                          '၁ အာရက္ခဒေါ်လာ = $1 US Dollar ပုံသေနှုန်းထား',
                          'စုစည်းထားသော မိုဘိုင်းလက်ကျန်ငွေ မျက်နှာပြင်',
                          'App Store နှင့် Google Play ထုတ်ဝေမှု',
                        ]
                      : [
                          '1 Arakan Dollar = $1 US Dollar fixed rate',
                          'Unified mobile balance dashboard',
                          'App Store & Google Play release',
                        ],
                  },
                  {
                    phase: 'Phase 02',
                    status: isAk ? 'လက်ရှိအသုံးပြုနိုင်ပြီ' : 'Live Now',
                    title: isAk ? 'အခမဲ့ ချက်ချင်း ငွေလွှဲမှု' : 'Instant Free Transfers',
                    items: isAk
                      ? [
                          'ဝန်ဆောင်ခ 0% ($0.00) အချင်းချင်း ငွေလွှဲမှု',
                          'ပိုက်ဆံအိတ်လိပ်စာနှင့် ကိုယ်ပိုင် QR ကုဒ်ဖြင့် ပေးပို့မှု',
                          'ချက်ချင်းအသိပေးချက်နှင့် e-Receipts',
                        ]
                      : [
                          '0% fee ($0.00) user-to-user transfers',
                          'Instant wallet address & personal QR send',
                          'Real-time push alerts & e-Receipts',
                        ],
                  },
                  {
                    phase: 'Phase 03',
                    status: isAk ? 'ဆောင်ရွက်ဆဲ' : 'In Progress',
                    title: isAk ? 'တိုးချဲ့ထားသော အချိန်မရွေး ငွေထုတ်ယူမှု' : 'Enhanced Anytime Withdrawals',
                    items: isAk
                      ? [
                          'တိုးချဲ့ထားသော ချက်ချင်းငွေထုတ်ယူမှု လမ်းကြောင်းများ',
                          'အလိုအလျောက် 1.0% ဝန်ဆောင်ခ တွက်ချက်မှုစနစ်',
                          'English နှင့် ရခိုင် နှစ်ဘာသာသုံး မျက်နှာပြင်',
                        ]
                      : [
                          'Expanded instant cash-out corridors',
                          'Automated 1.0% low-fee deduction',
                          'English & ရခိုင် wallet interface',
                        ],
                  },
                  {
                    phase: 'Phase 04',
                    status: isAk ? 'မကြာမီလာမည်' : 'Upcoming',
                    title: isAk ? 'မျိုးဆက်သစ် ပိုက်ဆံအိတ် လုပ်ဆောင်ချက်များ' : 'Next-Gen Wallet Capabilities',
                    items: isAk
                      ? [
                          'အင်တာနက်မလိုဘဲ ဖုန်းအချင်းချင်း QR ငွေလွှဲမှု',
                          'အချိန်ဇယားသတ်မှတ်၍ ပုံမှန် ငွေလွှဲမှု',
                          'အသုံးစရိတ် သုံးသပ်ချက် အစီရင်ခံစာများ',
                        ]
                      : [
                          'Offline device-to-device QR transfers',
                          'Recurring scheduled transfers',
                          'Advanced spending analytics',
                        ],
                  },
                ].map((step) => (
                  <div
                    key={step.phase}
                    className={`p-7 rounded-3xl border text-left space-y-4 ${cardSurface}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider opacity-70">
                        {step.phase}
                      </span>
                      <span className={`px-3 py-1 rounded-full border text-[11px] font-bold ${pillBadge}`}>
                        {step.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold">{step.title}</h3>
                    <ul className="space-y-2 pt-1">
                      {step.items.map((pt) => (
                        <li key={pt} className={`flex items-start gap-2 text-xs leading-relaxed ${mutedText}`}>
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 4: FAQ PAGE (/en/faq or /ak/faq)
      ═══════════════════════════════════════════════════════════════════════ */}
      {currentPage === 'faq' && (
        <main className="relative z-10 py-12 lg:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className={`p-8 sm:p-10 rounded-3xl border space-y-4 text-left ${cardSurface}`}>
            <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">
              {isAk ? 'အမေးများသော မေးခွန်းများ (FAQ)' : 'Frequently Asked Questions'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              {isAk
                ? 'သင်၏ နေ့စဉ်သုံး ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ်အကြောင်း ရှင်းလင်းသော အဖြေများ။'
                : 'Clear answers about your everyday digital wallet.'}
            </h1>
            <p className={`text-base leading-relaxed ${mutedText}`}>
              {isAk
                ? 'Péthar ကို ပွင့်လင်းရှင်းလင်းမှု အခြေခံဖြင့် တည်ဆောက်ထားပါသည်- ပုံသေ ၁ အာရက္ခဒေါ်လာ = $1 US Dollar နှုန်းထား၊ ချက်ချင်းနှင့် အခမဲ့ အချင်းချင်းငွေလွှဲမှု၊ နှင့် အချိန်မရွေး ငွေထုတ်ယူမှုတို့ ဖြစ်ပါသည်။'
                : 'Péthar is designed around clarity first: a fixed 1 Arakan Dollar = $1 US Dollar rate, instant and free user-to-user transfers, and anytime withdrawals.'}
            </p>
          </div>

          <div className="space-y-3.5 text-left">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div
                  key={item.q}
                  className={`rounded-2xl border overflow-hidden transition-colors ${cardSurface}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-bold pr-4">{item.q}</span>
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${pillBadge}`}
                    >
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`px-6 pb-5 text-sm sm:text-base whitespace-pre-line leading-relaxed border-t pt-4 ${
                          isDark ? 'border-white/10 text-zinc-300' : 'border-zinc-200 text-zinc-600'
                        }`}
                      >
                        {item.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </main>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 5: PRIVACY POLICY PAGE (domain/privacy)
      ═══════════════════════════════════════════════════════════════════════ */}
      {currentPage === 'privacy' && (
        <main className="relative z-10 py-12 lg:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`p-8 sm:p-12 rounded-3xl border space-y-8 text-left ${cardSurface}`}>
            <div className="space-y-2 border-b border-current/10 pb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Péthar Website Privacy Policy
              </h1>
              <p className={`text-xs sm:text-sm font-semibold ${mutedText}`}>
                Last updated April 15, 2024
              </p>
            </div>

            <div className={`space-y-6 text-sm sm:text-base leading-relaxed ${mutedText}`}>
              <p>
                At pethar.co.uk, Péthar is committed to protecting the privacy and confidentiality of
                any personal data we collect when you use our sites. This Privacy Policy describes
                the ways we collect information from and about you, and what we do with the
                information, so that you may decide whether or not to provide information to us. By
                accessing or using the website, you agree to be bound by the terms and conditions
                described in this document and also by any terms and conditions incorporated by
                reference. The following Privacy Policy pertains only to pethar.co.uk website
                (&quot;Website&quot;), and as such it is not applicable to Péthar Wallet software,
                which is governed by its own terms and privacy policy.
              </p>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  1. SCOPE AND DEFINITIONS
                </h2>
                <p>
                  This Privacy Policy applies to all information (including personal information)
                  collected through our website.
                </p>
                <p>
                  &quot;Visitor&quot; includes anyone using the Website, whether viewing pages or
                  uploading/downloading information directly from those sites using some other means.
                </p>
                <p>
                  &quot;Personal information&quot; means information that identifies you personally,
                  either alone or in combination with other information available to us.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  2. WHAT INFORMATION DO WE COLLECT?
                </h2>
                <h3 className={`text-base font-bold ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  Active Collection of Information
                </h3>
                <p>
                  We may collect certain information that you voluntarily provide to us which may
                  contain personal information. For example, if you opt in to receiving
                  communications from Péthar via email, we may collect your name and email address.
                  We retain this information until you ask to be unsubscribed from our list(s). We do
                  not sell or otherwise transmit any such actively-collected personal information to
                  third parties other than to third party service providers discussed in this
                  section.
                </p>

                <h3 className={`text-base font-bold pt-2 ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  Passive Collection of Information
                </h3>
                <p>
                  When you visit our sites, some information about your visit is automatically
                  collected. This information includes your IP address, access times, browser type
                  and language, and referring website addresses. We collect this information to
                  troubleshoot technical issues, understand how visitors use our website, provide an
                  experience relevant to the general location associated with your IP address, and to
                  make improvements to our website.
                </p>
                <p>
                  We may place a cookie on your hard drive during the web visit to help us identify
                  the number of unique visitors to our website, whether or not those visitors are
                  repeat visitors, and the source of the visits. If you do not want this information
                  to be collected, you may disable cookies in your web browser.
                </p>
                <p>
                  Additionally, we may use third-party analytics services to collect and analyze data
                  automatically collected from site users; the type and nature of those services may
                  change without notice. Data collected this way is governed by the terms and
                  conditions of those third party services.
                </p>

                <h3 className={`text-base font-bold pt-2 ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  Links to non-Péthar Websites
                </h3>
                <p>
                  Some projects, tools, forums, or other publicly-available resources associated with
                  Péthar may be hosted on third-party websites. Additionally, we may provide links to
                  third-party websites for informational purposes. The privacy practices of those
                  sites may differ from our practices, are not controlled by Péthar, and are not
                  covered by this Privacy Policy. We do not make any representations about
                  third-party websites. We encourage you to review their privacy policies before
                  submitting your personal data to such sites.
                </p>

                <h3 className={`text-base font-bold pt-2 ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  Sensitive Information
                </h3>
                <p>
                  We will not intentionally collect or maintain, and do not want you to provide, any
                  information regarding sensitive personal information.
                </p>
                <p>
                  Our services are not designed for or directed to children under the age of 13, and
                  we will not intentionally collect or maintain information about anyone under the
                  age of 13. If a child under 13 submits Personal Information to Péthar and we learn
                  that the Personal Information is the information of a child under 13, we will
                  attempt to delete the information as soon as possible. If you believe that we might
                  have any Personal Data from a child under 13, please contact us at{' '}
                  <a
                    href="mailto:realjackhalder@gmail.com"
                    className={`underline font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}
                  >
                    realjackhalder@gmail.com
                  </a>
                  .
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  3. WHAT DO WE USE THIS INFORMATION FOR?
                </h2>
                <p>
                  We use web visit information to measure interest in and develop our web pages and
                  marketing plans, customize the content you view on your web visits based on your
                  activity on past visits, diagnose technical problems, and to generally administer
                  our website.
                </p>
                <p>
                  Any information actively collected, such as names and email addresses, will be used
                  to provide you with information regarding Péthar, should you choose to sign up for
                  our mailing list.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  4. SECURITY OF YOUR INFORMATION
                </h2>
                <p>
                  We use various security measures to protect your personal information (including
                  preventing the loss, misuse, unauthorized access, disclosure, alteration and
                  destruction of your personal information). We store information you provide to us
                  on a computer system located in a controlled facility with limited access, and
                  require the same of any third-party we work with. However, we cannot guarantee the
                  absolute security and safety of your Personal Information.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  5. INQUIRIES OR COMPLAINTS
                </h2>
                <p>
                  If you have a question or complaint about this Privacy Policy or our information
                  collection practices, please contact us at{' '}
                  <a
                    href="mailto:realjackhalder@gmail.com"
                    className={`underline font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}
                  >
                    realjackhalder@gmail.com
                  </a>
                  .
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  6. WHAT RIGHTS YOU HAVE OVER YOUR DATA
                </h2>
                <p>
                  We may change this Privacy Policy from time to time. If we make a material
                  modification that diminishes the protections afforded to visitors to our website
                  then we will place a notification on our website, post the updated Privacy Policy
                  and change the effective date. If we have collected your email address, we will
                  also notify you by email. Any use of our website after the posted effective date is
                  subject to the updated Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 6: TERMS AND CONDITIONS PAGE (domain/terms)
      ═══════════════════════════════════════════════════════════════════════ */}
      {currentPage === 'terms' && (
        <main className="relative z-10 py-12 lg:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`p-8 sm:p-12 rounded-3xl border space-y-8 text-left ${cardSurface}`}>
            <div className="space-y-2 border-b border-current/10 pb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Péthar Website Terms and Conditions
              </h1>
              <p className={`text-xs sm:text-sm font-semibold ${mutedText}`}>
                Last updated April 17, 2025
              </p>
            </div>

            <div className={`space-y-6 text-sm sm:text-base leading-relaxed ${mutedText}`}>
              <p>
                Please read this terms of service agreement (the &quot;Terms of Service&quot;)
                carefully. The website pethar.co.uk (&quot;Website&quot;) belongs to Péthar, and as
                such the information on it is controlled by Péthar. These terms of service govern the
                use of the Website and apply to all internet users visiting the Website by access or
                using the Website in any way (&quot;Users&quot;), including using the services and
                resources available or enabled via the website (each a &quot;Service&quot; and
                collectively, the &quot;Services&quot;), with the exception of Péthar Wallet
                software, whose individual Terms of Service govern that software. The Website, the
                Services, and the information and content available on the Website are collectively
                referred to herein as the &quot;Péthar Properties&quot;. The term &quot;you&quot;
                refers to the individual or legal entity, as applicable, identified as the user when
                you interact with or register on the Website. If you do not agree to be bound by the
                terms of service, you may not access or use this Website or the Services. Our use of,
                and participation in, certain Services may be subject to additional terms
                (&quot;Supplemental Terms&quot;) and such Supplemental Terms will either be listed in
                the Terms of Service or will be presented to you for your acceptance when you sign up
                to use the supplemental Service. If the Terms of Service are inconsistent with the
                Supplemental Terms, the Supplemental Terms shall control with respect to such
                Service. The Terms of Service and any applicable Supplemental Terms are referred to
                herein as the &quot;Agreement&quot;.
              </p>

              <p>
                PLEASE NOTE THAT THE AGREEMENT IS SUBJECT TO CHANGE BY PÉTHAR IN ITS SOLE DISCRETION
                AT ANY TIME. When changes are made, Péthar will make a new copy of the Terms of
                Service available at the Website and any new Supplemental Terms will be made
                available from within, or through, the affected Service on the Website. We will also
                update the &quot;Last Updated&quot; date at the top of the Terms of Service. If you
                do not agree to any change(s) after receiving a notice of such change(s), you shall
                stop using the Website and/or the Services. Otherwise, your continued use of the
                Website and/or Services constitutes your acceptance of such change(s). PLEASE
                REGULARLY CHECK THE WEBSITE TO VIEW THE THEN-CURRENT AGREEMENT.
              </p>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  1. USE OF THE SERVICES AND PÉTHAR PROPERTIES
                </h2>
                <p>
                  The Website provides Users with content and information about our Services,
                  including Péthar Wallet software, albeit the latter being governed by its own
                  separate terms of service.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  2. TRADEMARKS
                </h2>
                <p>
                  The Péthar brand, and other related graphics, logos, service marks and trade names
                  used on or in connection with Péthar Properties or in connection with the Services
                  are Péthar trademarks and may not be used without permission in connection with any
                  third-party products or services. Other trademarks, service marks and trade names
                  that may appear on or in the Website or any Péthar Properties are the property of
                  their respective owners.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  3. USER CONDUCT
                </h2>
                <p>
                  As a condition of your use of the Péthar Properties, you agree not to use Péthar
                  Properties for any purpose that is prohibited by the Agreement or by applicable
                  law.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  4. THIRD-PARTY MATERIALS, WEBSITES, AND APPLICATIONS
                </h2>
                <p>
                  As part of Péthar Properties, you may have access to materials that are hosted by
                  another party. You agree that it is impossible for Péthar to monitor such materials
                  and that you access these materials at your own risk. Péthar Properties may contain
                  links to third-party websites (&quot;Third-Party Websites&quot;) and applications
                  (&quot;Third-Party Applications&quot;). When you click on a link to a Third-Party
                  Website or Third-Party Application, we will not warn you that you have left Péthar
                  Properties and are subject to the Agreement and conditions (including privacy
                  policies) of another website or destination. Such Third-Party Websites and
                  Third-Party Applications are not under the control of Péthar. Péthar is not
                  responsible for any Third-Party Websites or Third-Party Applications. Péthar
                  provides these Third-Party Websites or Third-Party Applications only as a
                  convenience and does not review, approve, monitor, endorse, warrant, or make any
                  representations with respect to Third-Party Websites or Third-Party Applications,
                  or their products or services. You use all links in Third-Party Websites or
                  Third-Party Applications at your own risk. When you leave our Website, this
                  Agreement and our policies no longer govern. You should review applicable terms and
                  policies, including privacy and data gathering practices, of any Third-Party
                  Websites or Third-Party Applications, and should make whatever investigation you
                  feel necessary or appropriate before proceeding with any transaction with any third
                  party.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  5. ANALYTICS
                </h2>
                <p>
                  By accessing or using the Péthar website, you acknowledge and agree that Péthar may
                  collect and utilize analytics to track and analyze user activity on the website.
                  This may include, but is not limited to, monitoring page views, clicks, navigation
                  patterns, and other interactions to improve our services and user experience. Such
                  data collection will be conducted in accordance with our Privacy Policy and
                  applicable laws.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  6. DISCLAIMER OF WARRANTIES AND CONDITIONS
                </h2>
                <h3 className={`text-base font-bold ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  6.1 As Is
                </h3>
                <p>
                  YOU EXPRESSLY UNDERSTAND AND AGREE THAT, TO THE EXTENT PERMITTED BY APPLICABLE LAW,
                  YOUR USE OF PÉTHAR PROPERTIES IS AT YOUR SOLE RISK, AND PÉTHAR PROPERTIES ARE
                  PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS, WITH ALL
                  FAULTS. PÉTHAR PARTIES EXPRESSLY DISCLAIM ALL WARRANTIES, REPRESENTATIONS, AND
                  CONDITIONS OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,
                  THE IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                  PURPOSE AND NON-INFRINGEMENT ARISING FROM USE OF THE WEBSITE.
                </p>
                <p>
                  (a) NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED FROM PÉTHAR OR
                  THROUGH PÉTHAR PROPERTIES WILL CREATE ANY WARRANTY NOT EXPRESSLY MADE HEREIN.
                </p>
                <h3 className={`text-base font-bold pt-2 ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  6.2 No Liability for Conduct of Third Parties
                </h3>
                <p>
                  YOU ACKNOWLEDGE AND AGREE THAT PÉTHAR PARTIES ARE NOT LIABLE, AND YOU AGREE NOT TO
                  SEEK TO HOLD PÉTHAR PARTIES LIABLE, FOR THE CONDUCT OF THIRD PARTIES ON THE
                  WEBSITE, INCLUDING OPERATORS OF EXTERNAL SITES, AND THAT THE RISK OF INJURY FROM
                  SUCH THIRD PARTIES RESTS ENTIRELY WITH YOU.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  7. LIMITATION OF LIABILITY
                </h2>
                <h3 className={`text-base font-bold ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  Disclaimer of Certain Damages
                </h3>
                <p>
                  YOU UNDERSTAND AND AGREE THAT IN NO EVENT SHALL PÉTHAR PARTIES BE LIABLE FOR ANY
                  LOSS OF PROFITS, REVENUE OR DATA, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL
                  DAMAGES ARISING OUT OF OR IN CONNECTION WITH PÉTHAR PROPERTIES, OR DAMAGES OR COSTS
                  DUE TO LOSS OF PRODUCTION OR USE, BUSINESS INTERRUPTION, WHETHER OR NOT PÉTHAR HAS
                  BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, ARISING OUT OF OR IN CONNECTION
                  WITH THE AGREEMENT, OR FROM ANY COMMUNICATIONS, INTERACTIONS OR MEETINGS WITH OTHER
                  USERS OF PÉTHAR PROPERTIES, WHETHER BASED ON WARRANTY, COPYRIGHT, CONTRACT, TORT
                  (INCLUDING NEGLIGENCE), PRODUCT LIABILITY OR ANY OTHER LEGAL THEORY.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  8. USERS
                </h2>
                <p>
                  Péthar Properties can be accessed from countries around the world and may contain
                  references to Services and content that are not available in your country. These
                  references do not imply that Péthar intends to announce such Services or content in
                  your country. Péthar Properties are controlled and offered by Péthar. Péthar makes
                  no representations that Péthar Properties are appropriate or available for use in
                  other locations. Those who access or use Péthar Properties from other jurisdictions
                  do so at their own volition and are responsible for compliance with local law.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  9. GENERAL PROVISIONS
                </h2>
                <h3 className={`text-base font-bold ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  9.1 Electronic Communications
                </h3>
                <p>
                  The communications between you and Péthar use electronic means, whether you visit
                  Péthar Properties or send e-mails to Péthar or pethar.co.uk, or whether Péthar
                  posts notices on Péthar Properties or communicates with you via e-mail. For
                  contractual purposes, you (1) consent to receive communications from Péthar and any
                  Péthar Properties in an electronic form; and (2) agree that all Agreement and
                  conditions, agreements, notices, disclosures, and other communications that Péthar
                  or any Péthar Properties provide to you electronically satisfy any legal
                  requirement that such communications would satisfy if it were to be in writing. The
                  foregoing does not affect your statutory rights.
                </p>

                <h3 className={`text-base font-bold pt-2 ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  9.2 Assignment
                </h3>
                <p>
                  The Agreement, and your rights and obligations hereunder, may not be assigned,
                  subcontracted, delegated or otherwise transferred by you without Péthar&apos;s
                  prior written consent, and any attempted assignment, subcontract, delegation, or
                  transfer in violation of the foregoing will be null and void.
                </p>

                <h3 className={`text-base font-bold pt-2 ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  9.3 Questions, Complaints, Claims
                </h3>
                <p>
                  If you have any questions, complaints or claims with respect to Péthar Properties,
                  please contact us at:{' '}
                  <a
                    href="mailto:realjackhalder@gmail.com"
                    className={`underline font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}
                  >
                    realjackhalder@gmail.com
                  </a>
                  . We will do our best to address your concerns. If you feel that your concerns have
                  been addressed incompletely, we invite you to let us know for further
                  investigation.
                </p>

                <h3 className={`text-base font-bold pt-2 ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  9.4 Governing Law
                </h3>
                <p>
                  THE AGREEMENT AND ANY ACTION RELATED THERETO WILL BE GOVERNED AND INTERPRETED IN
                  ACCORDANCE WITH APPLICABLE LAWS, WITHOUT GIVING EFFECT TO ANY PRINCIPLES THAT
                  PROVIDE FOR THE APPLICATION OF THE LAW OF ANOTHER JURISDICTION. THE UNITED NATIONS
                  CONVENTION ON CONTRACTS FOR THE SALE OF GOODS DOES NOT APPLY TO THIS
                  AGREEMENT OR ITS SUPPLEMENTAL TERMS.
                </p>

                <h3 className={`text-base font-bold pt-2 ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  9.5 Waiver
                </h3>
                <p>
                  Any waiver or failure to enforce any provision of the Agreement on one occasion
                  will not be deemed a waiver of any other provision or of such provision on any
                  other occasion.
                </p>

                <h3 className={`text-base font-bold pt-2 ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  9.6 Severability
                </h3>
                <p>
                  If any portion of this Agreement is held invalid or unenforceable, that portion
                  shall be construed in a manner to reflect, as nearly as possible, the original
                  intention of the parties, and the remaining portions shall remain in full force and
                  effect.
                </p>

                <h3 className={`text-base font-bold pt-2 ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>
                  9.7 Entire Agreement
                </h3>
                <p>
                  The Agreement is the final, complete and exclusive agreement of the parties with
                  respect to the subject matter hereof and supersedes and merges all prior
                  discussions between the parties with respect to such subject matter.
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER (INCLUDES PRIVACY POLICY & TERMS AND CONDITIONS LINKS — NOT IN NAVBAR)
      ═══════════════════════════════════════════════════════════════════════ */}
      <footer
        className={`relative z-10 border-t pt-16 pb-12 mt-16 ${
          isDark ? 'bg-[#060608] border-white/10' : 'bg-white border-zinc-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* App Download Banner (Only App Store & Google Play) */}
          <div
            className={`p-8 sm:p-12 rounded-[36px] border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 text-left ${cardSurface}`}
          >
            <div className="space-y-2 max-w-xl">
              <div className="text-xs font-bold uppercase tracking-widest opacity-70">
                {isAk ? 'ချောမွေ့လွယ်ကူသော မိုဘိုင်းပိုက်ဆံအိတ်' : 'Seamless Mobile Wallet'}
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold">
                {isAk ? 'Péthar ကို ယနေ့ပဲ ဒေါင်းလုဒ်ရယူပါ' : 'Download Péthar Today'}
              </h3>
              <p className={`text-sm sm:text-base ${mutedText}`}>
                {isAk
                  ? 'မိုဘိုင်းအက်ပ်တစ်ခုတည်းတွင် သင်၏ လက်ကျန်ငွေကို လွယ်ကူစွာ စီမံခန့်ခွဲပါ။ ပုံသေ ၁ အာရက္ခဒေါ်လာ = ၁ အမေရိကန်ဒေါ်လာ နှုန်းထားဖြင့် လဲလှယ်ပြီး မည်သည့် Péthar အသုံးပြုသူထံသို့မဆို အခမဲ့ ချက်ချင်းငွေလွှဲကာ အချိန်မရွေး ငွေထုတ်ယူနိုင်ပါသည်။'
                  : 'Manage your balance effortlessly in one mobile app. Convert at a fixed 1 Arakan Dollar = 1 US Dollar rate, send to any Péthar user instantly for free, and withdraw anytime.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <AppStoreBadge
                isDark={isDark}
                isAk={isAk}
                onClick={() => goToDownloadPlatform('ios')}
              />
              <GooglePlayBadge
                isDark={isDark}
                isAk={isAk}
                onClick={() => goToDownloadPlatform('android')}
              />
            </div>
          </div>

          {/* Multi-Column Institutional Footer (Navigation, Legal, Contact & Centered Copyright) */}
          <div
            className={`pt-10 border-t text-xs ${
              isDark ? 'border-white/10 text-zinc-400' : 'border-zinc-200 text-zinc-600'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 text-left">
              {/* Left Corner: Brand Summary (2 cols) */}
              <div className="sm:col-span-2 space-y-3.5">
                <button
                  type="button"
                  onClick={() => goToPath('/')}
                  className="inline-flex items-center gap-3 focus:outline-none cursor-pointer group"
                >
                  <PetharLogo size={34} showText={false} isDark={isDark} />
                  <span
                    className={`font-extrabold text-base sm:text-lg tracking-tight ${
                      isDark ? 'text-white' : 'text-zinc-950'
                    }`}
                  >
                    Péthar (ဖေ့သာ)
                  </span>
                </button>

                <p className={`text-xs max-w-sm leading-relaxed ${mutedText}`}>
                  {isAk
                    ? 'အာရက္ခဒေသတွင်း နေ့စဉ်သုံး ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ် — စက္ကန့်ပိုင်းအတွင်း အခမဲ့ ငွေလွှဲမှု၊ ပုံသေ ၁ အာရက္ခဒေါ်လာ = $1.00 USD တန်ဖိုးနှင့် လုံခြုံစိတ်ချရသော ငွေထုတ်ယူမှုစနစ်။'
                    : 'Your everyday digital wallet for Arakan. Fixed 1 Arakan Dollar = $1.00 USD parity, instant 0%-fee user-to-user transfers, and self-custodial mobile security.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-mono font-bold">
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      isDark ? 'text-zinc-200' : 'text-zinc-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 opacity-80" />
                    <span>{isAk ? '100% အာမခံ 1:1 USD' : '100% Reserve Backed'}</span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      isDark ? 'text-zinc-300' : 'text-zinc-700'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 opacity-80" />
                    <span>AES-256 Encrypted</span>
                  </span>
                </div>
              </div>

              {/* Col 1: Navigation */}
              <div>
                <h4
                  className={`font-bold mb-3.5 text-xs uppercase tracking-wider font-mono ${
                    isDark ? 'text-white' : 'text-zinc-950'
                  }`}
                >
                  {isAk ? 'ပင်မ လမ်းညွှန်' : 'Navigation'}
                </h4>
                <ul className="space-y-2.5">
                  <li>
                    <button
                      type="button"
                      onClick={() => goToPath('/')}
                      className={`transition-colors cursor-pointer ${
                        isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                      }`}
                    >
                      {isAk ? 'ပင်မစာမျက်နှာ' : 'Home'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToPath('/features')}
                      className={`transition-colors cursor-pointer ${
                        isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                      }`}
                    >
                      {isAk ? 'လုပ်ဆောင်ချက်များ' : 'Features'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToPath('/about')}
                      className={`transition-colors cursor-pointer ${
                        isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                      }`}
                    >
                      {isAk ? 'ကျွန်ုပ်တို့အကြောင်း' : 'About Péthar'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToPath('/faq')}
                      className={`transition-colors cursor-pointer ${
                        isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                      }`}
                    >
                      {isAk ? 'အမေးများသော မေးခွန်းများ' : 'FAQ'}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Col 2: Company & Ecosystem */}
              <div>
                <h4
                  className={`font-bold mb-3.5 text-xs uppercase tracking-wider font-mono ${
                    isDark ? 'text-white' : 'text-zinc-950'
                  }`}
                >
                  {isAk ? 'ကုမ္ပဏီနှင့် နည်းပညာ' : 'Company & Tech'}
                </h4>
                <ul className="space-y-2.5">
                  <li>
                    <button
                      type="button"
                      onClick={() => goToPath('/about/technology')}
                      className={`transition-colors cursor-pointer ${
                        isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                      }`}
                    >
                      {isAk ? 'နည်းပညာ' : 'Technology'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToPath('/about/products')}
                      className={`transition-colors cursor-pointer ${
                        isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                      }`}
                    >
                      {isAk ? 'ထုတ်ကုန်များ' : 'Products'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToPath('/about/awards')}
                      className={`transition-colors cursor-pointer ${
                        isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                      }`}
                    >
                      {isAk ? 'ဆုတံဆိပ်နှင့် အသိအမှတ်ပြုမှု' : 'Award & Recognition'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToPath('/about/roadmap')}
                      className={`transition-colors cursor-pointer ${
                        isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                      }`}
                    >
                      {isAk ? 'ရှေ့လုပ်ငန်းစဉ်' : 'Roadmap'}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Right Column: Legal & Contact (No Underline on Email & Telegram) */}
              <div>
                <h4
                  className={`font-bold mb-3.5 text-xs uppercase tracking-wider font-mono ${
                    isDark ? 'text-white' : 'text-zinc-950'
                  }`}
                >
                  {isAk ? 'မူဝါဒနှင့် ဆက်သွယ်ရန်' : 'Legal & Contact'}
                </h4>
                <ul className="space-y-2.5">
                  <li>
                    <button
                      type="button"
                      onClick={() => goToPath('/privacy')}
                      className={`transition-colors cursor-pointer ${
                        isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                      }`}
                    >
                      {isAk ? 'ကိုယ်ရေးအချက်အလက် မူဝါဒ' : 'Privacy Policy'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToPath('/terms')}
                      className={`transition-colors cursor-pointer ${
                        isDark ? 'hover:text-white' : 'hover:text-zinc-950'
                      }`}
                    >
                      {isAk ? 'စည်းကမ်းသတ်မှတ်ချက်များ' : 'Terms and Conditions'}
                    </button>
                  </li>
                  <li>
                    <a
                      href="https://t.me/petharsupport"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-bold no-underline transition-opacity hover:opacity-80 ${
                        isDark ? 'text-sky-400' : 'text-sky-700'
                      }`}
                    >
                      Telegram: @petharsupport
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:realjackhalder@gmail.com"
                      className={`font-bold no-underline transition-opacity hover:opacity-80 ${
                        isDark ? 'text-amber-300' : 'text-amber-800'
                      }`}
                    >
                      Contact: realjackhalder@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Divider: Only Copyright Text Centered */}
            <div
              className={`pt-6 border-t flex items-center justify-center text-center text-xs ${
                isDark ? 'border-white/10 text-zinc-500' : 'border-zinc-200/80 text-zinc-500'
              }`}
            >
              <div>© {new Date().getFullYear()} Péthar (ဖေ့သာ). All rights reserved.</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
