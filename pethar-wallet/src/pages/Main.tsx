import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Copy,
  Check,
  DollarSign,
  Eye,
  EyeOff,
  Fingerprint,
  Home,
  Layers,
  Menu,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
  X,
  Zap,
  Calculator,
  Clock,
  RefreshCw,
} from 'lucide-react'
import type { Language } from '../i18n'

interface MainProps {
  lang?: Language
  setLang?: (lang: Language) => void
}

/* ─── GLOWING "P" PETHAR BRAND LOGO (MATCHING MOCKUP) ─────────────────────── */
function PeTharLogo({ size = 36, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none group">
      <div
        className="relative flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#10B981]/40 via-[#4ADE80]/30 to-[#FACC15]/40 blur-md opacity-80 group-hover:opacity-100 transition-opacity" />
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_4px_12px_rgba(74,222,128,0.35)]"
        >
          <defs>
            <linearGradient id="petharRibbonTop" x1="8" y1="6" x2="40" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="55%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
            <linearGradient id="petharRibbonStem" x1="10" y1="18" x2="26" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="petharRibbonInner" x1="14" y1="14" x2="34" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#064E3B" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>
          {/* Vertical stem of the 3D ribbon P */}
          <path
            d="M11 14C11 10.6863 13.6863 8 17 8H21V37C21 40.3137 18.3137 43 15 43H11V14Z"
            fill="url(#petharRibbonStem)"
          />
          {/* Inner fold shadow */}
          <path
            d="M11 24L21 19V30L11 35V24Z"
            fill="url(#petharRibbonInner)"
            opacity="0.65"
          />
          {/* Top loop of the 3D ribbon P */}
          <path
            d="M11 11C11 8.79086 12.7909 7 15 7H29C35.6274 7 41 12.3726 41 19C41 25.6274 35.6274 31 29 31H17C13.6863 31 11 28.3137 11 25V22H28.5C30.9853 22 33 19.9853 33 17.5C33 15.0147 30.9853 13 28.5 13H11V11Z"
            fill="url(#petharRibbonTop)"
          />
          {/* Subtle glass highlight on loop */}
          <path
            d="M14 9.5H28.5C33.7467 9.5 38 13.7533 38 19"
            stroke="white"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showText && (
        <span className="text-2xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[#4ADE80] to-[#6EE7B7] bg-clip-text text-transparent">Pe</span>
          <span className="text-white">Thar</span>
        </span>
      )}
    </div>
  )
}

/* ─── SCANNABLE SVG QR CODE GRAPHIC ───────────────────────────────────────── */
function QrCodeGraphic({ size = 52 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-lg bg-white p-1.5 shadow-inner shrink-0"
    >
      {/* Top-left finder */}
      <rect x="4" y="4" width="18" height="18" rx="2" stroke="#0A1114" strokeWidth="3.5" />
      <rect x="9" y="9" width="8" height="8" rx="1" fill="#0A1114" />
      {/* Top-right finder */}
      <rect x="42" y="4" width="18" height="18" rx="2" stroke="#0A1114" strokeWidth="3.5" />
      <rect x="47" y="9" width="8" height="8" rx="1" fill="#0A1114" />
      {/* Bottom-left finder */}
      <rect x="4" y="42" width="18" height="18" rx="2" stroke="#0A1114" strokeWidth="3.5" />
      <rect x="9" y="47" width="8" height="8" rx="1" fill="#0A1114" />
      {/* Data matrix cells */}
      <rect x="26" y="4" width="4" height="4" fill="#0A1114" />
      <rect x="34" y="4" width="4" height="4" fill="#0A1114" />
      <rect x="26" y="12" width="8" height="4" fill="#0A1114" />
      <rect x="30" y="18" width="8" height="4" fill="#0A1114" />
      <rect x="4" y="26" width="8" height="4" fill="#0A1114" />
      <rect x="16" y="26" width="6" height="6" fill="#0A1114" />
      <rect x="26" y="26" width="12" height="12" rx="2" fill="#10B981" />
      <rect x="30" y="30" width="4" height="4" fill="white" />
      <rect x="42" y="26" width="6" height="4" fill="#0A1114" />
      <rect x="52" y="26" width="8" height="4" fill="#0A1114" />
      <rect x="4" y="34" width="4" height="4" fill="#0A1114" />
      <rect x="12" y="34" width="8" height="4" fill="#0A1114" />
      <rect x="42" y="34" width="8" height="4" fill="#0A1114" />
      <rect x="54" y="34" width="6" height="8" fill="#0A1114" />
      <rect x="26" y="42" width="6" height="4" fill="#0A1114" />
      <rect x="36" y="42" width="4" height="8" fill="#0A1114" />
      <rect x="44" y="44" width="8" height="8" rx="1" fill="#0A1114" />
      <rect x="26" y="50" width="8" height="4" fill="#0A1114" />
      <rect x="26" y="56" width="12" height="4" fill="#0A1114" />
      <rect x="42" y="56" width="8" height="4" fill="#0A1114" />
      <rect x="54" y="52" width="6" height="8" fill="#0A1114" />
    </svg>
  )
}

/* ─── STORE BADGES (APP STORE & GOOGLE PLAY) ──────────────────────────────── */
function AppStoreButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#070C0E]/90 hover:bg-white/10 border border-white/25 hover:border-[#4ADE80]/60 transition-all duration-200 shadow-lg cursor-pointer"
    >
      <svg className="w-7 h-7 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.79-.96 2.84 1.04.08 2.08-.52 2.72-1.3z" />
      </svg>
      <div className="text-left leading-tight">
        <div className="text-[10px] font-medium text-white/75 tracking-wide">Download on the</div>
        <div className="text-base font-bold text-white tracking-tight">App Store</div>
      </div>
    </button>
  )
}

function GooglePlayButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#070C0E]/90 hover:bg-white/10 border border-white/25 hover:border-[#4ADE80]/60 transition-all duration-200 shadow-lg cursor-pointer"
    >
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M3.61 1.814L13.793 12 3.61 22.186a1.75 1.75 0 01-.61-1.33V3.144c0-.518.227-.996.61-1.33z" fill="#38BDF8" />
        <path d="M17.208 8.585L13.793 12l3.415 3.415 3.854-2.203c.88-.503.88-1.921 0-2.424l-3.854-2.203z" fill="#FACC15" />
        <path d="M3.61 22.186L13.793 12l3.415 3.415-11.97 6.84c-.618.353-1.267.265-1.628-.069z" fill="#F43F5E" />
        <path d="M3.61 1.814c.361-.334 1.01-.422 1.628-.069l11.97 6.84L13.793 12 3.61 1.814z" fill="#4ADE80" />
      </svg>
      <div className="text-left leading-tight">
        <div className="text-[10px] font-medium text-white/75 uppercase tracking-wider">GET IT ON</div>
        <div className="text-base font-bold text-white tracking-tight">Google Play</div>
      </div>
    </button>
  )
}

/* ─── STATUS BAR FOR IPHONE MOCKUPS ───────────────────────────────────────── */
function PhoneStatusBar({ time = '9:41' }: { time?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-2 text-[10px] font-semibold text-white/90 select-none">
      <span>{time}</span>
      <div className="w-16 h-4 rounded-full bg-black border border-white/10 mx-auto" />
      <div className="flex items-center gap-1">
        <div className="flex items-end gap-[1.5px] h-2.5">
          <span className="w-[2px] h-1 bg-white/90 rounded-full" />
          <span className="w-[2px] h-1.5 bg-white/90 rounded-full" />
          <span className="w-[2px] h-2 bg-white/90 rounded-full" />
          <span className="w-[2px] h-2.5 bg-white/90 rounded-full" />
        </div>
        <div className="w-4 h-2.5 rounded-[3px] border border-white/80 p-[1px] flex items-center">
          <div className="w-full h-full bg-white rounded-[1px]" />
        </div>
      </div>
    </div>
  )
}

/* ─── MAIN LANDING PAGE COMPONENT ─────────────────────────────────────────── */
export default function Main(_props: MainProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)

  // Task 4: Interactive App Switcher (01 - 04 Flow)
  const [activeFlowTab, setActiveFlowTab] = useState<number>(0)
  const [previewBalanceVisible, setPreviewBalanceVisible] = useState(true)
  const [p2pRecipient, setP2pRecipient] = useState('@min')
  const [p2pSentToast, setP2pSentToast] = useState(false)

  // Task 5: Interactive Calculator & Fee Comparison
  const [calcTab, setCalcTab] = useState<'conversion' | 'withdrawal'>('conversion')
  const [conversionAmount, setConversionAmount] = useState<string>('250')
  const [conversionDirection, setConversionDirection] = useState<'usd_to_akd' | 'akd_to_usd'>('usd_to_akd')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('200')
  const [copiedHandle, setCopiedHandle] = useState(false)

  // Transparent small withdrawal fee rate (1.0%)
  const WITHDRAWAL_FEE_RATE = 0.01

  useEffect(() => {
    document.title = 'PeThar — Your Everyday Digital Wallet & Super App'
    document.documentElement.classList.add('dark')
  }, [])

  const parsedConversion = Math.max(0, Number.parseFloat(conversionAmount || '0') || 0)
  const parsedWithdraw = Math.max(0, Number.parseFloat(withdrawAmount || '0') || 0)
  const calculatedFee = +(parsedWithdraw * WITHDRAWAL_FEE_RATE).toFixed(2)
  const calculatedNetPayout = Math.max(0, +(parsedWithdraw - calculatedFee).toFixed(2))
  const traditionalFee = +(parsedWithdraw * 0.065 + 3.5).toFixed(2)
  const userSavings = Math.max(0, +(traditionalFee - calculatedFee).toFixed(2))

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const flowSteps = [
    {
      id: '01',
      badge: '01 Unified Balance',
      title: 'Unified Wallet Balance in One Clean View',
      description:
        'Open PeThar to see your complete balance denominated in Arakan Dollar at a fixed 1 Arakan Dollar = $1.00 USD value. Track incoming transfers, recent payouts, and quick actions from a single mobile dashboard.',
      highlights: [
        'Main Balance displayed clearly in Arakan Dollar',
        'Live 1 Arakan Dollar = $1.00 USD parity indicator',
        'One-tap access to Dashboard, Send, Assets, and Withdraw',
      ],
    },
    {
      id: '02',
      badge: '02 1:1 Arakan Dollar Function',
      title: 'Fixed 1 Arakan Dollar = $1.00 USD Value',
      description:
        'Every Arakan Dollar in your PeThar Wallet holds a fixed 1:1 US Dollar value. Convert and manage your everyday balance with zero mental math and zero surprise rate fluctuations.',
      highlights: [
        'Fixed 1 Arakan Dollar = $1.00 USD in-app rate',
        'Zero conversion fee inside your PeThar mobile wallet',
        'Instant balance clarity for everyday spending and saving',
      ],
    },
    {
      id: '03',
      badge: '03 Free User-to-User Send',
      title: 'Instant P2P Transfers with 0% Fee ($0.00)',
      description:
        'Send Arakan Dollar to any PeThar user by @username or personal QR code in under a second. Recipients receive 100% of what you send with a $0.00 user-to-user transfer fee.',
      highlights: [
        'Send to @min, @kyaw, or any PeThar handle instantly',
        '0% Fee ($0.00) on all user-to-user transfers',
        'Real-time push notification the moment funds arrive',
      ],
    },
    {
      id: '04',
      badge: '04 Low-Fee Withdrawal',
      title: 'Anytime Withdrawals with Transparent Low Fees',
      description:
        'Need to cash out? Enter your withdrawal amount anytime in the mobile app. A small, transparent transaction fee is calculated and deducted automatically before you confirm.',
      highlights: [
        'Withdraw anytime directly from your mobile wallet',
        'Small transaction fee shown upfront before confirmation',
        'Automatic fee deduction with exact net payout preview',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1114] via-[#0C161A] to-[#0E1A1F] text-white font-sans selection:bg-[#4ADE80] selection:text-[#0A1114] relative overflow-x-hidden">
      {/* ─── AMBIENT RADIAL GLOW GRADIENTS & FAINT DOT/GRID OVERLAY ────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[620px] h-[620px] rounded-full opacity-25 blur-[130px]"
          style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-12 right-[-10%] w-[760px] h-[760px] rounded-full opacity-30 blur-[140px]"
          style={{ background: 'radial-gradient(circle, #34D399 0%, #10B981 45%, transparent 75%)' }}
        />
        <div
          className="absolute top-44 right-[12%] w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]"
          style={{ background: 'radial-gradient(circle, #FDE047 0%, #EAB308 50%, transparent 75%)' }}
        />
        <div
          className="absolute top-[48%] left-[15%] w-[540px] h-[540px] rounded-full opacity-15 blur-[150px]"
          style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TASK 1: STICKY GLASS NAVBAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[#0A1114]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="focus:outline-none"
          >
            <PeTharLogo size={38} />
          </a>

          <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-white/80">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('arakan-dollar')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Arakan Dollar
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('fees')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Fees
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              How it Works
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSection('download')}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] text-[#0A1114] font-bold text-sm tracking-tight shadow-[0_0_28px_rgba(74,222,128,0.4)] hover:shadow-[0_0_36px_rgba(250,204,21,0.55)] hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 cursor-pointer"
            >
              Download App
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/90 hover:bg-white/10"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden bg-[#0C161A]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-5 space-y-3"
            >
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="block w-full text-left py-2 text-base font-medium text-white/85 hover:text-[#4ADE80]"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('arakan-dollar')}
                className="block w-full text-left py-2 text-base font-medium text-white/85 hover:text-[#4ADE80]"
              >
                Arakan Dollar
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('fees')}
                className="block w-full text-left py-2 text-base font-medium text-white/85 hover:text-[#4ADE80]"
              >
                Fees
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left py-2 text-base font-medium text-white/85 hover:text-[#4ADE80]"
              >
                How it Works
              </button>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('download')}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] text-[#0A1114] font-bold text-sm shadow-[0_0_24px_rgba(74,222,128,0.35)]"
                >
                  Download App
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          TASK 2: HERO SECTION (MATCHING MOCKUP)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="top" className="relative z-10 pt-10 pb-14 lg:pt-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT COLUMN */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              <div className="inline-block">
                <span className="text-6xl sm:text-7xl lg:text-[80px] font-extrabold tracking-tight leading-none bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] bg-clip-text text-transparent drop-shadow-[0_8px_30px_rgba(74,222,128,0.2)]">
                  PeThar
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-white tracking-tight leading-[1.12]">
                Your Everyday Digital Wallet &amp; Super App
              </h1>

              <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-xl font-normal">
                Manage your balance effortlessly in one mobile app. Convert at a fixed{' '}
                <span className="text-white font-semibold">1 Arakan Dollar = 1 US Dollar</span> rate,
                send to any PeThar user instantly for free, and withdraw anytime with a small fee.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <AppStoreButton onClick={() => scrollToSection('download')} />
                <GooglePlayButton onClick={() => scrollToSection('download')} />

                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-[#4ADE80]/60 transition-all duration-200 shadow-lg cursor-pointer group"
                >
                  <QrCodeGraphic size={46} />
                  <div className="text-left pr-1">
                    <div className="text-xs font-semibold text-white group-hover:text-[#4ADE80] transition-colors leading-snug">
                      Scan to
                      <br />
                      Download
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: 3 ANGLED 3D-STYLE IPHONE MOCKUPS SIDE-BY-SIDE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="lg:col-span-6 relative flex items-center justify-center min-h-[480px] sm:min-h-[540px]"
            >
              <div
                className="absolute inset-4 rounded-3xl opacity-35 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(74,222,128,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(74,222,128,0.16) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
              <div
                className="absolute right-2 bottom-4 w-44 h-44 opacity-40 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(rgba(74,222,128,0.5) 1.5px, transparent 1.5px)',
                  backgroundSize: '12px 12px',
                }}
              />

              <div className="relative w-full max-w-[650px] h-[470px] sm:h-[510px] flex items-center justify-center">
                {/* 1. LEFT PHONE: PeThar Wallet */}
                <div
                  className="w-[205px] sm:w-[225px] h-[420px] sm:h-[445px] rounded-[36px] bg-gradient-to-b from-[#16272E] via-[#0E1A1F] to-[#091114] p-[6px] shadow-[0_25px_60px_rgba(0,0,0,0.75)] border border-white/25 transition-transform duration-500 hover:translate-y-[-6px] z-10 shrink-0"
                  style={{
                    transform: 'perspective(1100px) rotateY(16deg) rotateZ(-5deg) translateX(26px) translateY(18px)',
                  }}
                >
                  <div className="w-full h-full rounded-[30px] bg-[#0B1519] overflow-hidden flex flex-col justify-between border border-white/10 relative">
                    <div>
                      <PhoneStatusBar time="9:41" />
                      <div className="flex items-center justify-between px-4 pt-1 pb-2.5">
                        <div className="text-xs font-bold tracking-tight">
                          <span className="text-[#4ADE80]">PeThar</span>{' '}
                          <span className="text-white">Wallet</span>
                        </div>
                        <div className="relative p-1 rounded-full bg-white/5 border border-white/10">
                          <Bell className="w-3.5 h-3.5 text-white/80" />
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
                        </div>
                      </div>

                      <div className="mx-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-white/12 via-white/[0.06] to-[#10B981]/15 backdrop-blur-xl border border-white/15 text-center shadow-inner">
                        <div className="text-[10px] text-white/70 font-medium">Main Balance:</div>
                        <div className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
                          250.00
                        </div>
                        <div className="text-[11px] font-semibold text-white/85">Arakan Dollar</div>
                        <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-black/35 border border-white/10 text-[9px] font-medium text-[#6EE7B7]">
                          1 Arakan Dollar = $1.00 USD
                        </div>
                      </div>

                      <div className="px-3.5 pt-3">
                        <div className="text-[10px] font-semibold text-white/75 mb-2">Dashboard</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#4ADE80]/20 to-[#FACC15]/15 border border-[#4ADE80]/40 flex flex-col justify-between h-16">
                            <div className="w-6 h-6 rounded-lg bg-[#4ADE80]/25 flex items-center justify-center">
                              <Wallet className="w-3.5 h-3.5 text-[#4ADE80]" />
                            </div>
                            <span className="text-[10px] font-semibold text-white">Dashboard</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between h-16">
                            <div className="w-6 h-6 rounded-lg bg-[#FACC15]/20 flex items-center justify-center">
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#FACC15]" />
                            </div>
                            <span className="text-[10px] font-semibold text-white/85">Send</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between h-16">
                            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                              <Layers className="w-3.5 h-3.5 text-white/75" />
                            </div>
                            <span className="text-[10px] font-semibold text-white/85">Assets</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between h-16">
                            <div className="w-6 h-6 rounded-lg bg-[#34D399]/20 flex items-center justify-center">
                              <ArrowDownLeft className="w-3.5 h-3.5 text-[#34D399]" />
                            </div>
                            <span className="text-[10px] font-semibold text-white/85">Withdraw</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-around">
                      <Home className="w-3.5 h-3.5 text-[#4ADE80]" />
                      <Compass className="w-3.5 h-3.5 text-white/45" />
                      <Wallet className="w-3.5 h-3.5 text-white/45" />
                      <Settings className="w-3.5 h-3.5 text-white/45" />
                    </div>
                  </div>
                </div>

                {/* 2. CENTER PHONE: P2P Send Screen + Floating Notification */}
                <div
                  className="w-[225px] sm:w-[248px] h-[455px] sm:h-[485px] rounded-[40px] bg-gradient-to-b from-[#243B44] via-[#112026] to-[#0A1114] p-[7px] shadow-[0_35px_80px_rgba(0,0,0,0.85)] border border-white/30 z-30 relative shrink-0 transition-transform duration-500 hover:scale-[1.02]"
                  style={{
                    transform: 'perspective(1100px) rotateY(-4deg) rotateZ(1deg) translateY(-8px)',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="absolute -top-3 -right-14 sm:-right-20 z-40 w-[210px] sm:w-[230px] p-3 rounded-2xl bg-[#1A2C32]/85 backdrop-blur-2xl border border-white/25 shadow-[0_20px_40px_rgba(0,0,0,0.65)]"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4ADE80]/30 to-[#FACC15]/30 border border-[#4ADE80]/40 flex items-center justify-center shrink-0">
                        <PeTharLogo size={22} showText={false} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white">Received</span>
                          <span className="text-[9px] text-white/60">now</span>
                        </div>
                        <div className="text-[11px] font-extrabold text-[#4ADE80] truncate">
                          50.00 Arakan Dollar
                        </div>
                        <div className="text-[10px] text-white/75 truncate">from @kyaw</div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="w-full h-full rounded-[33px] bg-gradient-to-b from-[#101F24] via-[#0C171B] to-[#091114] overflow-hidden flex flex-col justify-between border border-white/10 px-4 pb-5">
                    <div>
                      <PhoneStatusBar time="9:47" />
                      <div className="flex items-center gap-2 pt-2 pb-4">
                        <ChevronLeft className="w-4 h-4 text-white/75" />
                        <span className="text-xs font-bold text-white">P2P Send</span>
                      </div>

                      <div className="my-3 flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4ADE80]/20 via-white/5 to-[#FACC15]/20 border border-white/15 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                          <ArrowLeftRight className="w-7 h-7 text-[#A3E635]" />
                        </div>
                      </div>

                      <div className="text-center space-y-1.5 mt-4">
                        <div className="text-xs text-white/75 font-medium">
                          Send to <span className="text-[#4ADE80] font-semibold">@min</span>
                        </div>
                        <div className="flex items-center justify-center gap-0.5 pt-1">
                          <span className="text-4xl font-extrabold text-white tracking-tight">50.00</span>
                          <span className="w-[2px] h-7 bg-[#4ADE80] animate-pulse ml-0.5" />
                        </div>
                        <div className="text-xs text-white/70 font-medium">Arakan Dollar</div>
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-[10px] font-semibold text-[#4ADE80]">
                            1 Arakan Dollar = $1.00 USD
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => scrollToSection('how-it-works')}
                        className="w-full py-3 rounded-full bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] text-[#0A1114] font-extrabold text-xs shadow-[0_8px_25px_rgba(74,222,128,0.4)] cursor-pointer"
                      >
                        Send Instantly (0% Fee)
                      </button>
                      <div className="w-24 h-1 rounded-full bg-white/30 mx-auto" />
                    </div>
                  </div>
                </div>

                {/* 3. RIGHT PHONE: Withdrawal Screen */}
                <div
                  className="w-[200px] sm:w-[220px] h-[410px] sm:h-[435px] rounded-[36px] bg-gradient-to-b from-[#16272E] via-[#0E1A1F] to-[#091114] p-[6px] shadow-[0_25px_60px_rgba(0,0,0,0.75)] border border-white/25 transition-transform duration-500 hover:translate-y-[-6px] z-20 shrink-0"
                  style={{
                    transform: 'perspective(1100px) rotateY(-16deg) rotateZ(6deg) translateX(-22px) translateY(26px)',
                  }}
                >
                  <div className="w-full h-full rounded-[30px] bg-[#0B1519] overflow-hidden flex flex-col justify-between border border-white/10 px-3.5 pb-4">
                    <div>
                      <PhoneStatusBar time="9:41" />
                      <div className="flex items-center justify-between pt-1 pb-4">
                        <ChevronLeft className="w-4 h-4 text-white/75" />
                        <span className="text-xs font-bold text-white">Withdrawal</span>
                        <span className="w-4" />
                      </div>

                      <div className="mt-2 space-y-2 text-left">
                        <label className="text-[10px] font-medium text-white/70 block">
                          Withdrawal Amount
                        </label>
                        <div className="px-3 py-2.5 rounded-xl bg-black/45 border border-white/15 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-white">100.00</div>
                            <div className="text-[9px] text-white/55">Arakan Dollar</div>
                          </div>
                          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white/70 text-[10px]">
                            ⇅
                          </div>
                        </div>
                        <div className="text-[10px] text-white/60 pl-0.5">
                          Small transaction fee applies
                        </div>

                        <div className="mt-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5 text-[10px]">
                          <div className="flex justify-between text-white/65">
                            <span>Rate</span>
                            <span className="text-white font-medium">1:1 USD</span>
                          </div>
                          <div className="flex justify-between text-white/65">
                            <span>Transaction Fee</span>
                            <span className="text-[#FACC15] font-medium">1.0% ($1.00)</span>
                          </div>
                          <div className="flex justify-between text-white font-bold pt-1 border-t border-white/10">
                            <span>You Receive</span>
                            <span className="text-[#4ADE80]">$99.00 USD</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => scrollToSection('fees')}
                        className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] text-[#0A1114] font-extrabold text-xs shadow-md cursor-pointer"
                      >
                        Send
                      </button>
                      <div className="w-20 h-1 rounded-full bg-white/25 mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* BOTTOM HERO PILL BAR */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-10 lg:mt-12 w-full rounded-2xl lg:rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/15 px-6 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          >
            <div className="flex flex-wrap items-center justify-center lg:justify-between gap-y-2 gap-x-6 text-xs sm:text-sm md:text-base font-medium text-white/90">
              <span className="font-semibold text-white">1 Arakan Dollar = $1.00 USD</span>
              <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_10px_#4ADE80]" />
              <span>User-to-User Transfers: Instant &amp; Free</span>
              <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_10px_#4ADE80]" />
              <span>Seamless Mobile Wallet</span>
              <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_10px_#4ADE80]" />
              <span>Simple Low-Fee Withdrawals</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TASK 3: PERFORMANCE BAR & 4 CORE PILLARS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-16 lg:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                metric: '1 : 1',
                label: 'USD Value',
                sub: '1 Arakan Dollar = $1.00 USD fixed rate',
              },
              {
                metric: '< 1s',
                label: 'P2P Transfer Speed',
                sub: 'Instant user-to-user settlement',
              },
              {
                metric: '$0.00',
                label: 'User-to-User Fee',
                sub: '0% fee on every P2P transfer',
              },
              {
                metric: '24/7',
                label: 'Mobile App Access',
                sub: 'Always-on everyday wallet on iOS & Android',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#4ADE80]/40 transition-all duration-300 text-left group"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] bg-clip-text text-transparent">
                  {item.metric}
                </div>
                <div className="mt-2 text-base sm:text-lg font-bold text-white">{item.label}</div>
                <p className="mt-1 text-xs sm:text-sm text-white/65 leading-relaxed">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Core Live Functions
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for Everyday Mobile Money
            </h2>
            <p className="text-white/70 text-base sm:text-lg">
              Everything you need in one mobile-first digital wallet—from a unified 1:1 Arakan Dollar
              balance to instant free user-to-user transfers and simple withdrawals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Wallet,
                badge: '1:1 USD Value',
                title: 'Unified Wallet Balance',
                desc: 'View and manage your complete balance in Arakan Dollar at a fixed 1 Arakan Dollar = $1.00 USD value in one intuitive mobile screen.',
              },
              {
                icon: Send,
                badge: '0% Fee ($0.00)',
                title: 'Instant P2P Transfers',
                desc: 'Send Arakan Dollar to any PeThar user by @username or personal QR code in under a second with zero transaction fees.',
              },
              {
                icon: DollarSign,
                badge: 'Fixed Rate',
                title: '1 Arakan Dollar = $1.00 USD',
                desc: 'Enjoy complete price clarity across your everyday balance with a fixed 1:1 US Dollar rate and zero hidden in-app conversion spreads.',
              },
              {
                icon: ArrowDownLeft,
                badge: 'Anytime Access',
                title: 'Low-Fee Withdrawals',
                desc: 'Withdraw funds whenever you need with a small, transparent transaction fee automatically deducted and shown before you confirm.',
              },
            ].map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#4ADE80]/40 hover:bg-white/[0.07] transition-all duration-300 flex flex-col justify-between text-left group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4ADE80]/20 to-[#FACC15]/20 border border-[#4ADE80]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6 text-[#4ADE80]" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-[#A3E635]">
                        {card.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#4ADE80]">
                    <span>Live in Mobile App</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TASK 4: INTERACTIVE APP SWITCHER & 01–04 FLOW
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-16 lg:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] text-xs font-bold uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5" />
              Interactive Mobile Walkthrough
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How PeThar Works in 4 Simple Steps
            </h2>
            <p className="text-white/70 text-base sm:text-lg">
              Select any step below to preview the live mobile app experience.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {flowSteps.map((step, index) => {
              const isActive = activeFlowTab === index
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveFlowTab(index)}
                  className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#4ADE80]/20 via-[#A3E635]/15 to-[#FACC15]/20 border-[#4ADE80]/60 shadow-[0_0_25px_rgba(74,222,128,0.2)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-gradient-to-r from-[#4ADE80] to-[#FACC15] text-[#0A1114]'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {step.id}
                    </span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-1.5">
                    {step.badge.replace(/^0\d\s/, '')}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-[#FACC15]">
                {flowSteps[activeFlowTab].badge}
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {flowSteps[activeFlowTab].title}
              </h3>
              <p className="text-white/75 text-base sm:text-lg leading-relaxed">
                {flowSteps[activeFlowTab].description}
              </p>

              <ul className="space-y-3 pt-2">
                {flowSteps[activeFlowTab].highlights.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm sm:text-base text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-[#4ADE80] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveFlowTab((prev) => (prev - 1 + 4) % 4)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white cursor-pointer"
                >
                  ← Previous Step
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFlowTab((prev) => (prev + 1) % 4)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] text-[#0A1114] text-xs font-extrabold cursor-pointer"
                >
                  Next Step →
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-[270px] sm:w-[290px] h-[510px] rounded-[42px] bg-gradient-to-b from-[#223840] via-[#101E24] to-[#091114] p-[8px] shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-white/25">
                <div className="w-full h-full rounded-[34px] bg-[#0B1519] overflow-hidden flex flex-col justify-between border border-white/10 relative">
                  <PhoneStatusBar time="9:41" />

                  <AnimatePresence mode="wait">
                    {activeFlowTab === 0 && (
                      <motion.div
                        key="screen-01"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="flex-1 px-4 py-2 flex flex-col justify-between text-left"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">
                              <span className="text-[#4ADE80]">PeThar</span> Wallet
                            </span>
                            <button
                              type="button"
                              onClick={() => setPreviewBalanceVisible(!previewBalanceVisible)}
                              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/75 hover:text-white cursor-pointer"
                              aria-label="Toggle balance visibility"
                            >
                              {previewBalanceVisible ? (
                                <Eye className="w-3.5 h-3.5" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4ADE80]/20 via-white/5 to-[#FACC15]/15 border border-white/15 text-center">
                            <div className="text-[11px] text-white/70">Main Balance:</div>
                            <div className="text-3xl font-extrabold text-white mt-1">
                              {previewBalanceVisible ? '250.00' : '••••••'}
                            </div>
                            <div className="text-xs font-semibold text-white/85">Arakan Dollar</div>
                            <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-[10px] text-[#4ADE80] font-semibold">
                              1 Arakan Dollar = $1.00 USD
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {[
                              { label: 'Dashboard', icon: Wallet, target: 0 },
                              { label: 'Send', icon: ArrowUpRight, target: 2 },
                              { label: 'Assets', icon: Layers, target: 1 },
                              { label: 'Withdraw', icon: ArrowDownLeft, target: 3 },
                            ].map((btn) => {
                              const BtnIcon = btn.icon
                              return (
                                <button
                                  key={btn.label}
                                  type="button"
                                  onClick={() => setActiveFlowTab(btn.target)}
                                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <BtnIcon className="w-4 h-4 text-[#4ADE80]" />
                                  <span className="text-xs font-semibold text-white">{btn.label}</span>
                                </button>
                              )
                            })}
                          </div>

                          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-white/55">
                              Recent Mobile Activity
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <div className="font-semibold text-white">From @kyaw</div>
                                <div className="text-[10px] text-white/55">Instant P2P • 0% Fee</div>
                              </div>
                              <span className="font-bold text-[#4ADE80]">+50.00</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeFlowTab === 1 && (
                      <motion.div
                        key="screen-02"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="flex-1 px-4 py-2 flex flex-col justify-between text-left"
                      >
                        <div className="space-y-3.5">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>In-App 1:1 USD Value</span>
                            <span className="px-2 py-0.5 rounded-full bg-[#4ADE80]/20 text-[#4ADE80] text-[10px]">
                              Fixed 1:1
                            </span>
                          </div>

                          <div className="p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3">
                            <div className="flex items-center justify-between text-xs text-white/70">
                              <span>Arakan Dollar Balance</span>
                              <span className="font-bold text-white">250.00</span>
                            </div>
                            <div className="flex justify-center">
                              <div className="w-8 h-8 rounded-full bg-[#4ADE80]/20 border border-[#4ADE80]/40 flex items-center justify-center text-[#4ADE80] font-bold text-xs">
                                =
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-white/70">
                              <span>US Dollar Value</span>
                              <span className="font-bold text-[#4ADE80]">$250.00 USD</span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#4ADE80]/15 to-[#FACC15]/10 border border-[#4ADE80]/30 space-y-1.5">
                            <div className="text-xs font-bold text-white">
                              1 Arakan Dollar = $1.00 USD
                            </div>
                            <p className="text-[11px] text-white/75 leading-relaxed">
                              Your mobile wallet always maintains a fixed 1:1 US Dollar rate with $0.00
                              in-app conversion fee.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveFlowTab(2)}
                          className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] text-[#0A1114] font-extrabold text-xs cursor-pointer"
                        >
                          Try Free P2P Send →
                        </button>
                      </motion.div>
                    )}

                    {activeFlowTab === 2 && (
                      <motion.div
                        key="screen-03"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="flex-1 px-4 py-2 flex flex-col justify-between text-left"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">P2P Send</span>
                            <span className="px-2 py-0.5 rounded-full bg-[#4ADE80]/20 text-[#4ADE80] text-[10px] font-bold">
                              0% Fee ($0.00)
                            </span>
                          </div>

                          <div className="flex gap-1.5">
                            {['@min', '@kyaw', '@su'].map((handle) => (
                              <button
                                key={handle}
                                type="button"
                                onClick={() => {
                                  setP2pRecipient(handle)
                                  setP2pSentToast(false)
                                }}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                                  p2pRecipient === handle
                                    ? 'bg-[#4ADE80]/20 border-[#4ADE80] text-[#4ADE80]'
                                    : 'bg-white/5 border-white/10 text-white/70'
                                }`}
                              >
                                {handle}
                              </button>
                            ))}
                          </div>

                          <div className="p-4 rounded-2xl bg-white/5 border border-white/15 text-center space-y-1">
                            <div className="text-xs text-white/70">
                              Send to <span className="text-[#4ADE80] font-bold">{p2pRecipient}</span>
                            </div>
                            <div className="text-3xl font-extrabold text-white">50.00</div>
                            <div className="text-[11px] text-white/65">Arakan Dollar ($50.00 USD)</div>
                            <div className="pt-1 text-[10px] text-[#4ADE80] font-semibold">
                              Transfer Fee: $0.00 (0% Fee)
                            </div>
                          </div>

                          {p2pSentToast && (
                            <div className="p-2.5 rounded-xl bg-[#4ADE80]/20 border border-[#4ADE80]/40 text-[11px] text-white flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
                              <span>Sent 50.00 Arakan Dollar to {p2pRecipient} instantly!</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setP2pSentToast(true)}
                          className="w-full py-3 rounded-full bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] text-[#0A1114] font-extrabold text-xs shadow-lg cursor-pointer"
                        >
                          Send Instantly (0% Fee)
                        </button>
                      </motion.div>
                    )}

                    {activeFlowTab === 3 && (
                      <motion.div
                        key="screen-04"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="flex-1 px-4 py-2 flex flex-col justify-between text-left"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Withdrawal</span>
                            <span className="text-[10px] text-[#FACC15] font-semibold">
                              Anytime Cash Out
                            </span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/15 space-y-1">
                            <div className="text-[10px] text-white/65">Withdrawal Amount</div>
                            <div className="text-2xl font-extrabold text-white">100.00</div>
                            <div className="text-[10px] text-white/65">Arakan Dollar</div>
                          </div>

                          <div className="text-[11px] text-white/70">
                            Small transaction fee applies and is deducted automatically:
                          </div>

                          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                            <div className="flex justify-between text-white/70">
                              <span>Amount</span>
                              <span className="text-white font-semibold">100.00 Arakan Dollar</span>
                            </div>
                            <div className="flex justify-between text-white/70">
                              <span>Small Transaction Fee (1.0%)</span>
                              <span className="text-[#FACC15] font-semibold">-1.00 Arakan Dollar</span>
                            </div>
                            <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white">
                              <span>Net Payout</span>
                              <span className="text-[#4ADE80]">$99.00 USD</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => scrollToSection('fees')}
                          className="w-full py-3 rounded-full bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] text-[#0A1114] font-extrabold text-xs shadow-lg cursor-pointer"
                        >
                          Open Fee Calculator
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="py-3 flex justify-center">
                    <div className="w-24 h-1 rounded-full bg-white/25" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TASK 5: INTERACTIVE CALCULATOR & FEE COMPARISON
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="arakan-dollar" className="relative z-10 py-16 lg:py-24 border-t border-white/10">
        <div id="fees" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              1:1 Rate &amp; Transparent Fee Calculator
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Fixed 1:1 USD Value. Zero P2P Fees. Clear Withdrawals.
            </h2>
            <p className="text-white/70 text-base sm:text-lg">
              Test our interactive in-app 1:1 conversion and automatic withdrawal fee calculator below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col justify-between text-left">
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 mb-6">
                  <button
                    type="button"
                    onClick={() => setCalcTab('conversion')}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      calcTab === 'conversion'
                        ? 'bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] text-[#0A1114] shadow-md'
                        : 'text-white/75 hover:text-white'
                    }`}
                  >
                    In-App Conversion (1:1 USD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcTab('withdrawal')}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      calcTab === 'withdrawal'
                        ? 'bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] text-[#0A1114] shadow-md'
                        : 'text-white/75 hover:text-white'
                    }`}
                  >
                    Withdrawal Fee Calculator
                  </button>
                </div>

                {calcTab === 'conversion' ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                        Fixed In-App Rate: 1 Arakan Dollar = $1.00 USD
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setConversionDirection((d) =>
                            d === 'usd_to_akd' ? 'akd_to_usd' : 'usd_to_akd'
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4ADE80] hover:underline cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Swap Direction
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/15">
                      <label className="text-xs text-white/65 block mb-1">
                        {conversionDirection === 'usd_to_akd'
                          ? 'You Enter (US Dollar)'
                          : 'You Enter (Arakan Dollar)'}
                      </label>
                      <div className="flex items-center justify-between gap-4">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={conversionAmount}
                          onChange={(e) => setConversionAmount(e.target.value)}
                          className="w-full bg-transparent text-3xl font-extrabold text-white focus:outline-none"
                          placeholder="0.00"
                        />
                        <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-white shrink-0">
                          {conversionDirection === 'usd_to_akd' ? 'USD ($)' : 'Arakan Dollar'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {['25', '50', '100', '250', '500', '1000'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setConversionAmount(preset)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                            conversionAmount === preset
                              ? 'bg-[#4ADE80]/20 border-[#4ADE80] text-[#4ADE80]'
                              : 'bg-white/5 border-white/10 text-white/75 hover:bg-white/10'
                          }`}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#4ADE80]/15 via-white/5 to-[#FACC15]/15 border border-[#4ADE80]/35 space-y-2">
                      <div className="flex items-center justify-between text-xs text-white/75">
                        <span>Exact 1:1 Equivalent</span>
                        <span className="text-[#4ADE80] font-bold">0% Conversion Spread</span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-extrabold text-white">
                        {conversionDirection === 'usd_to_akd'
                          ? `${parsedConversion.toFixed(2)} Arakan Dollar`
                          : `$${parsedConversion.toFixed(2)} USD`}
                      </div>
                      <div className="text-xs text-white/70">
                        Guaranteed 1 Arakan Dollar = $1.00 USD inside your PeThar Wallet.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                        Transparent 1.0% Withdrawal Fee • Deducted Automatically
                      </span>
                      <span className="text-xs font-bold text-[#FACC15]">Anytime Cash Out</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/15">
                      <label className="text-xs text-white/65 block mb-1">
                        Withdrawal Amount (Arakan Dollar)
                      </label>
                      <div className="flex items-center justify-between gap-4">
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full bg-transparent text-3xl font-extrabold text-white focus:outline-none"
                          placeholder="100.00"
                        />
                        <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-white shrink-0">
                          Arakan Dollar
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {['50', '100', '200', '500', '1000'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setWithdrawAmount(preset)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                            withdrawAmount === preset
                              ? 'bg-[#4ADE80]/20 border-[#4ADE80] text-[#4ADE80]'
                              : 'bg-white/5 border-white/10 text-white/75 hover:bg-white/10'
                          }`}
                        >
                          {preset} Arakan Dollar
                        </button>
                      ))}
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.07] to-[#4ADE80]/10 border border-white/15 space-y-3 text-sm">
                      <div className="flex justify-between text-white/75">
                        <span>Withdrawal Amount (1:1 USD)</span>
                        <span className="font-semibold text-white">
                          {parsedWithdraw.toFixed(2)} Arakan Dollar (${parsedWithdraw.toFixed(2)} USD)
                        </span>
                      </div>
                      <div className="flex justify-between text-white/75">
                        <span>Small Transaction Fee (1.0% auto-deducted)</span>
                        <span className="font-semibold text-[#FACC15]">
                          -{calculatedFee.toFixed(2)} Arakan Dollar (-${calculatedFee.toFixed(2)})
                        </span>
                      </div>
                      <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-white/65">Exact Net Payout You Receive</div>
                          <div className="text-2xl sm:text-3xl font-extrabold text-[#4ADE80]">
                            ${calculatedNetPayout.toFixed(2)} USD
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#4ADE80]/20 border border-[#4ADE80]/40 text-xs font-bold text-[#4ADE80]">
                          99.0% Net Payout
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-white/65">
                <span>1 Arakan Dollar = $1.00 USD</span>
                <span>•</span>
                <span>User-to-User P2P Send: $0.00 (0% Fee)</span>
                <span>•</span>
                <span>No Hidden Spreads</span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col justify-between text-left">
              <div className="space-y-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-[#FACC15]/15 border border-[#FACC15]/30 text-[#FACC15] text-xs font-bold">
                    Fee Comparison
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-3">
                    Keep More of Every Dollar You Send &amp; Withdraw
                  </h3>
                  <p className="text-sm text-white/70 mt-1">
                    See how PeThar compares against traditional transfer platforms.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#4ADE80]/15 to-[#FACC15]/10 border border-[#4ADE80]/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">
                        PeThar User-to-User (P2P)
                      </span>
                      <span className="text-base font-extrabold text-[#4ADE80]">0% Fee ($0.00)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                      <div className="w-[4%] h-full rounded-full bg-gradient-to-r from-[#4ADE80] to-[#FACC15]" />
                    </div>
                    <div className="mt-1.5 text-xs text-white/75">
                      Instant mobile transfer • Recipient gets 100%
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/15">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">PeThar Anytime Withdrawal</span>
                      <span className="text-sm font-extrabold text-[#FACC15]">
                        Small 1.0% Fee (${calculatedFee.toFixed(2)})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                      <div className="w-[15%] h-full rounded-full bg-[#FACC15]" />
                    </div>
                    <div className="mt-1.5 text-xs text-white/65">
                      Deducted automatically with upfront net payout preview
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 opacity-80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white/75">
                        Traditional Transfer Apps
                      </span>
                      <span className="text-sm font-bold text-rose-400">
                        ~6.5% + FX Spread (${traditionalFee.toFixed(2)})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                      <div className="w-[78%] h-full rounded-full bg-rose-500/70" />
                    </div>
                    <div className="mt-1.5 text-xs text-white/55">
                      High transfer markups and delayed multi-day settlement
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-[#4ADE80]/10 border border-[#4ADE80]/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/70">Estimated Savings on ${parsedWithdraw.toFixed(0)}</div>
                  <div className="text-xl font-extrabold text-[#4ADE80]">
                    Save ${userSavings.toFixed(2)} USD
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToSection('download')}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#4ADE80] to-[#FACC15] text-[#0A1114] text-xs font-extrabold cursor-pointer"
                >
                  Get PeThar App
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TASK 6: 6-CARD SUPER APP BENTO GRID
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 lg:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              Super App Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Designed for Simplicity, Speed, and Mobile Security
            </h2>
            <p className="text-white/70 text-base sm:text-lg">
              Six core advantages that make PeThar your everyday digital wallet and super app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="md:col-span-3 p-7 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#4ADE80]/40 transition-all text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#4ADE80]/15 border border-[#4ADE80]/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#4ADE80]" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Unified Balance at 1 Arakan Dollar = $1.00 USD
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Your entire wallet balance is unified in Arakan Dollar with a fixed 1:1 US Dollar
                  value—eliminating confusing multi-balance clutter so you always know exactly what
                  you hold.
                </p>
              </div>
              <div className="mt-6 p-3.5 rounded-xl bg-black/35 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/70">In-App Fixed Value</span>
                <span className="text-sm font-extrabold text-[#4ADE80]">
                  1 Arakan Dollar = $1.00 USD
                </span>
              </div>
            </div>

            <div className="md:col-span-3 p-7 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#4ADE80]/40 transition-all text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#FACC15]/15 border border-[#FACC15]/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#FACC15]" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Instant @Username &amp; Personal QR Transfers
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Forget long account numbers. Send Arakan Dollar to friends and family in one tap
                  using their @username handle or personal QR code with a $0.00 (0%) transfer fee.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-2 p-3 rounded-xl bg-black/35 border border-white/10">
                <div className="text-xs text-white/85 font-mono">Send to: @min • @kyaw</div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText('@min')
                    setCopiedHandle(true)
                    setTimeout(() => setCopiedHandle(false), 2000)
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-semibold text-[#4ADE80] cursor-pointer"
                >
                  {copiedHandle ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedHandle ? 'Copied @min' : 'Copy @min'}
                </button>
              </div>
            </div>

            <div className="md:col-span-2 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#4ADE80]/40 transition-all text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#34D399]/15 border border-[#34D399]/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#34D399]" />
                </div>
                <h3 className="text-lg font-bold text-white">Everyday Simplicity</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Clean 2x2 quick-action navigation gives you instant access to Dashboard, Send,
                  Assets, and Withdraw from the moment you open the app.
                </p>
              </div>
              <div className="mt-5 text-xs font-semibold text-[#4ADE80]">Zero Clutter • Fast UI</div>
            </div>

            <div className="md:col-span-2 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#4ADE80]/40 transition-all text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/30 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#A3E635]" />
                </div>
                <h3 className="text-lg font-bold text-white">Real-Time Push Alerts</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Get instant mobile notifications the second funds arrive—like “Received 50.00
                  Arakan Dollar from @kyaw • now”.
                </p>
              </div>
              <div className="mt-5 text-xs font-semibold text-[#A3E635]">
                Sub-Second Activity Alerts
              </div>
            </div>

            <div className="md:col-span-2 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#4ADE80]/40 transition-all text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#4ADE80]/15 border border-[#4ADE80]/30 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-[#4ADE80]" />
                </div>
                <h3 className="text-lg font-bold text-white">Mobile-First Security</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Protected by device biometrics, hardware-backed encryption, and real-time
                  transaction verification on iOS and Android.
                </p>
              </div>
              <div className="mt-5 text-xs font-semibold text-[#4ADE80] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Biometric &amp; PIN Protected
              </div>
            </div>

            <div className="md:col-span-6 p-7 rounded-2xl bg-gradient-to-r from-white/5 via-[#10B981]/10 to-[#FACC15]/10 backdrop-blur-xl border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/20 border border-[#FACC15]/40 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-[#FACC15]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Anytime Withdrawals with Automatic Low-Fee Deduction
                  </h3>
                  <p className="text-sm text-white/75 mt-1 max-w-2xl leading-relaxed">
                    Withdraw your balance whenever you want directly from the PeThar mobile app. A
                    small, transparent transaction fee is calculated upfront and deducted
                    automatically so there are never any surprises.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCalcTab('withdrawal')
                  scrollToSection('fees')
                }}
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white shrink-0 cursor-pointer transition-colors"
              >
                Calculate Withdrawal →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TASK 7: DOWNLOAD HUB & 4-COLUMN STRUCTURED FOOTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="download" className="relative z-10 py-16 lg:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-gradient-to-br from-[#11242A] via-[#0D1A1F] to-[#14221B] border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.65)] relative overflow-hidden">
            <div
              className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full opacity-25 blur-[100px] pointer-events-none"
              style={{ background: 'radial-gradient(circle, #4ADE80 0%, #FACC15 60%, transparent 100%)' }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-8 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-[#4ADE80] text-xs font-bold uppercase tracking-wider">
                  Mobile App Available on iOS &amp; Android
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Download{' '}
                  <span className="bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] bg-clip-text text-transparent">
                    PeThar
                  </span>{' '}
                  Today
                </h2>
                <p className="text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed">
                  Experience your everyday digital wallet and super app. Hold and manage your
                  unified balance at <strong className="text-white">1 Arakan Dollar = $1.00 USD</strong>,
                  send to any user with <strong className="text-white">0% Fee ($0.00)</strong>, and
                  withdraw anytime with a small transparent fee.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <AppStoreButton onClick={() => setQrModalOpen(true)} />
                  <GooglePlayButton onClick={() => setQrModalOpen(true)} />
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/15 text-center space-y-3 max-w-[260px] w-full">
                  <div className="flex justify-center">
                    <QrCodeGraphic size={116} />
                  </div>
                  <div className="text-sm font-bold text-white">Scan to Download App</div>
                  <p className="text-xs text-white/65 leading-relaxed">
                    Point your phone camera at the QR code to install the PeThar mobile app on iOS
                    or Android.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-COLUMN STRUCTURED FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-[#070C0E]/90 backdrop-blur-xl pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10 text-left">
            <div className="lg:col-span-1 space-y-4">
              <PeTharLogo size={34} />
              <p className="text-xs text-white/65 leading-relaxed">
                PeThar: Your Everyday Digital Wallet &amp; Super App. Built for fast, transparent
                mobile money management.
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-[#4ADE80]">
                1 Arakan Dollar = $1.00 USD
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">
                Mobile Wallet
              </h4>
              <ul className="space-y-2 text-sm text-white/65">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('features')}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    Unified Balance
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('arakan-dollar')}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    Arakan Dollar (1:1 USD)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('how-it-works')}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    Instant P2P Transfers
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('fees')}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    Anytime Withdrawals
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">
                Calculators &amp; Flow
              </h4>
              <ul className="space-y-2 text-sm text-white/65">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCalcTab('conversion')
                      scrollToSection('arakan-dollar')
                    }}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    1:1 USD Conversion
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCalcTab('withdrawal')
                      scrollToSection('fees')
                    }}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    Withdrawal Fee Calculator
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('how-it-works')}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    01–04 App Switcher
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('fees')}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    0% P2P Fee Comparison
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">
                Security &amp; Trust
              </h4>
              <ul className="space-y-2 text-sm text-white/65">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('features')}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    Biometric Protection
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('fees')}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    Transparent Fee Schedule
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('how-it-works')}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    Real-Time Activity Alerts
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('download')}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    24/7 Mobile Support
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">
                Download App
              </h4>
              <ul className="space-y-2 text-sm text-white/65">
                <li>
                  <button
                    type="button"
                    onClick={() => setQrModalOpen(true)}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    iOS App Store
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setQrModalOpen(true)}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    Google Play Store
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setQrModalOpen(true)}
                    className="hover:text-[#4ADE80] transition-colors cursor-pointer"
                  >
                    Scan QR Code
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/55">
            <div>
              © {new Date().getFullYear()} PeThar — Your Everyday Digital Wallet &amp; Super App. All
              rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>1 Arakan Dollar = $1.00 USD</span>
              <span>•</span>
              <span>0% P2P Transfer Fee</span>
              <span>•</span>
              <span>iOS &amp; Android</span>
            </div>
          </div>
        </div>
      </footer>

      {/* QR CODE DOWNLOAD MODAL */}
      <AnimatePresence>
        {qrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0E1A1F] border border-white/20 shadow-2xl text-center space-y-5 relative"
            >
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex justify-center">
                <PeTharLogo size={40} />
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                Scan to Download PeThar Mobile App
              </h3>
              <p className="text-sm text-white/70">
                Scan with your phone camera to download PeThar on the App Store or Google Play.
              </p>
              <div className="flex justify-center py-2">
                <QrCodeGraphic size={148} />
              </div>
              <div className="text-xs font-semibold text-[#4ADE80]">
                1 Arakan Dollar = $1.00 USD • 0% Fee User-to-User Transfers
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#4ADE80] via-[#A3E635] to-[#FACC15] text-[#0A1114] font-extrabold text-sm cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
