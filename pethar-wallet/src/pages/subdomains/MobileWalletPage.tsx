import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Check,
  Shield,
  Smartphone,
  MapPin,
  Clock,
  Eye,
  EyeOff,
  Store,
  Tag,
  FileText,
  Navigation,
  Image as ImageIcon,
  BookUser,
  Mic,
  CreditCard,
  Settings as SettingsIcon,
  Link2,
  HelpCircle,
  MessageSquare,
  Info,
  LogOut,
  Globe,
  AppWindow,
  MoreHorizontal,
  Copy,
  Share2,
  RefreshCw,
  Plus,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  Repeat,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Headphones,
  KeyRound,
  Lock,
  Send as SendIcon,
  QrCode,
  Landmark,
} from 'lucide-react'
import {
  AccountScreen,
  ServicesScreen,
  Send,
  Receive,
  CashOut,
  NotificationsScreen,
  type Screen,
  type ThemeMode,
} from '../../screens'
import { InternationalBanking } from '../../components/InternationalBanking'
import { CryptoGateway } from '../../components/CryptoGateway'
import { POSTerminal } from '../../components/POSTerminal'
import { TransactionSlip } from '../../components/TransactionSlip'
import { FakeQR } from '../../components/FakeQR'
import { initialUserProfile, transactions, contacts, type UserProfile, type Txn } from '../../data'
import type { Language } from '../../i18n'

interface MobileWalletPageProps {
  lang: Language
  setLang?: (lang: Language) => void
}

type MobileTab = Screen | 'financial'
type AccountSubScreen = 'main' | 'security_checkup' | 'device_management' | 'privacy' | 'cards'
type FinancialSubView =
  | 'wallet_main'
  | 'deposit'
  | 'withdraw'
  | 'tx_history'
  | 'spending'
  | 'wallet_security_phrase'

const DOCK_TABS: MobileTab[] = ['home', 'financial', 'scan', 'services', 'account', 'settings']

const SINGLE_WALLET_ACCOUNT = {
  name: 'USD Account',
  shortAddress: '0x36...5f19',
  fullAddress: '0x36a8F492C109bE742819aBcD8391048291045f19',
  recoveryPhrase: [
    'sovereign',
    'arakan',
    'crimson',
    'harbor',
    'shield',
    'ledger',
    'velvet',
    'anchor',
    'crystal',
    'beacon',
    'meadow',
    'fortune',
  ],
}

interface UsdStablecoin {
  symbol: 'USDT' | 'USDC' | 'USD1' | 'FDUSD' | 'PYUSD' | 'DAI'
  name: string
  price: string
  balance: number
  usdValue: number
  bg: string
  badgeText: string
}

const USD_BACKED_TOKENS: UsdStablecoin[] = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    price: '$0.9985',
    balance: 12500,
    usdValue: 12500.0,
    bg: 'bg-[#26A17B]',
    badgeText: '₮',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    price: '$1.00',
    balance: 0,
    usdValue: 0.0,
    bg: 'bg-[#2775CA]',
    badgeText: '$',
  },
  {
    symbol: 'USD1',
    name: 'World Liberty USD1',
    price: '$0.999',
    balance: 0,
    usdValue: 0.0,
    bg: 'bg-[#D4AF37]',
    badgeText: '1',
  },
  {
    symbol: 'FDUSD',
    name: 'First Digital USD',
    price: '$1.00',
    balance: 0,
    usdValue: 0.0,
    bg: 'bg-[#00C389]',
    badgeText: 'F',
  },
  {
    symbol: 'PYUSD',
    name: 'PayPal USD',
    price: '$1.00',
    balance: 0,
    usdValue: 0.0,
    bg: 'bg-[#003087]',
    badgeText: 'P',
  },
  {
    symbol: 'DAI',
    name: 'Multi-Collateral DAI',
    price: '$1.00',
    balance: 0,
    usdValue: 0.0,
    bg: 'bg-[#F5AC37]',
    badgeText: '◈',
  },
]

/* ─── CUSTOM SVG ICONS MATCHING SCREENSHOT NAVBAR ─────────────────────────── */
function NavHomeIcon({ active }: { active: boolean }) {
  return active ? (
    <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.03 2.59a1.5 1.5 0 0 1 1.94 0l7.5 6.363A1.5 1.5 0 0 1 21 10.097V19.5A2.5 2.5 0 0 1 18.5 22h-4a1 1 0 0 1-1-1v-4.5a1.5 1.5 0 0 0-3 0V21a1 1 0 0 1-1 1h-4A2.5 2.5 0 0 1 3 19.5v-9.403c0-.44.194-.859.53-1.144l7.5-6.363Z" />
    </svg>
  ) : (
    <svg
      className="w-[22px] h-[22px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.2 12 3l9 7.2V20a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-6v6H4.5A1.5 1.5 0 0 1 3 20v-9.8Z" />
    </svg>
  )
}

function NavFinancialIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="w-[22px] h-[22px]"
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={active ? '1.6' : '1.9'}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9.2" fill={active ? 'currentColor' : 'none'} />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="11.5"
        fontWeight="800"
        fill={active ? '#ffffff' : 'currentColor'}
        stroke="none"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        $
      </text>
    </svg>
  )
}

function NavScanBracketIcon({ className = 'w-7 h-7 text-white' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 10.5V8.8C6.5 7.25 7.75 6 9.3 6h9.4c1.55 0 2.8 1.25 2.8 2.8v1.7" />
      <line x1="6.5" y1="14" x2="21.5" y2="14" />
      <path d="M6.5 17.5v1.7c0 1.55 1.25 2.8 2.8 2.8h9.4c1.55 0 2.8-1.25 2.8-2.8v-1.7" />
    </svg>
  )
}

function NavServicesIcon({ active }: { active: boolean }) {
  return active ? (
    <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="8" height="8" rx="2.5" />
      <rect x="13" y="3" width="8" height="8" rx="2.5" />
      <rect x="3" y="13" width="8" height="8" rx="2.5" />
      <circle cx="17" cy="17" r="4" />
    </svg>
  ) : (
    <svg
      className="w-[22px] h-[22px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <circle cx="17" cy="17" r="3.5" />
    </svg>
  )
}

function NavAccountIcon({ active }: { active: boolean }) {
  return active ? (
    <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="8" r="4.2" />
      <path d="M4.5 20.2c0-3.6 3.36-6.2 7.5-6.2s7.5 2.6 7.5 6.2a.8.8 0 0 1-.8.8H5.3a.8.8 0 0 1-.8-.8Z" />
    </svg>
  ) : (
    <svg
      className="w-[22px] h-[22px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.3 3.1-5.8 7-5.8s7 2.5 7 5.8" />
    </svg>
  )
}

export const MobileWalletPage: React.FC<MobileWalletPageProps> = ({ lang, setLang }) => {
  // 1. App Opening Splash Screen
  const [showSplash, setShowSplash] = useState<boolean>(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false)
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [])

  const [screen, setScreen] = useState<MobileTab>('home')
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [profile, setProfile] = useState<UserProfile>({
    ...initialUserProfile,
    name: 'Myat Soe Paing',
  })

  // Verification State: Verified vs Unverified + Verification Required Modal
  const [isVerified, setIsVerified] = useState<boolean>(true)
  const [verifyPromptModal, setVerifyPromptModal] = useState<{
    open: boolean
    featureName: string
  }>({ open: false, featureName: '' })
  const [kycFlowModalOpen, setKycFlowModalOpen] = useState<boolean>(false)

  // Support Chat Modal State (replaces "Switch to Unverified" button on top right)
  const [chatModalOpen, setChatModalOpen] = useState<boolean>(false)
  const [chatInput, setChatInput] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'bot' | 'user'; text: string }>
  >([
    {
      sender: 'bot',
      text: 'Mingalaba! Welcome to Péthar Support. How can we help with your AKD or USD Account today?',
    },
  ])

  // Home & Crypto Wallet Balance Visibility
  const [homeBalanceHidden, setHomeBalanceHidden] = useState<boolean>(false)
  const [walletBalanceHidden, setWalletBalanceHidden] = useState<boolean>(false)
  const [akdBalance, setAkdBalance] = useState<number>(12500.0)
  const [usdAccountBalance, setUsdAccountBalance] = useState<number>(12500.0)

  // Financial Tab (Single-Account USD Account — NO NFT) States
  const [financialSubView, setFinancialSubView] = useState<FinancialSubView>('wallet_main')
  const [walletTab, setWalletTab] = useState<'tokens' | 'activity' | 'refund'>('tokens')
  const [isRefreshingWallet, setIsRefreshingWallet] = useState<boolean>(false)
  const [selectedDepositToken, setSelectedDepositToken] = useState<UsdStablecoin['symbol']>('USDT')
  const [depositTokenDropdownOpen, setDepositTokenDropdownOpen] = useState<boolean>(false)
  const [withdrawRecipientAddress, setWithdrawRecipientAddress] = useState<string>('')
  const [withdrawTab, setWithdrawTab] = useState<'your_account' | 'contacts'>('your_account')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('50.00')
  const [withdrawStep, setWithdrawStep] = useState<'address' | 'confirm'>('address')
  const [copiedWalletAddr, setCopiedWalletAddr] = useState<boolean>(false)
  const [historyCategoryTab, setHistoryCategoryTab] = useState<'all' | 'wallet' | 'qr_pay'>('all')
  const [spendingPeriod, setSpendingPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [selectedSlipTxn, setSelectedSlipTxn] = useState<Txn | null>(null)

  // Convert & Transfer Modals inside Financial USD Account
  const [convertModalOpen, setConvertModalOpen] = useState<boolean>(false)
  const [convertFromToken, setConvertFromToken] = useState<'USDT' | 'USDC' | 'USD1'>('USDT')
  const [convertToToken, setConvertToToken] = useState<'AKD' | 'USDC' | 'USDT' | 'USD1'>('AKD')
  const [convertAmount, setConvertAmount] = useState<string>('100.00')
  const [convertSuccessToast, setConvertSuccessToast] = useState<boolean>(false)

  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false)
  const [transferDirection, setTransferDirection] = useState<'usd_to_akd' | 'akd_to_usd'>('usd_to_akd')
  const [transferAmount, setTransferAmount] = useState<string>('250.00')
  const [transferSuccessToast, setTransferSuccessToast] = useState<boolean>(false)

  // Secret Recovery Phrase states inside Financial Settings
  const [phraseRevealed, setPhraseRevealed] = useState<boolean>(false)
  const [phraseCopied, setPhraseCopied] = useState<boolean>(false)
  const [autoLockWallet, setAutoLockWallet] = useState<boolean>(true)
  const [biometricSigning, setBiometricSigning] = useState<boolean>(true)

  // Camera Scan / Flash / Gallery States
  const [scanBottomTab, setScanBottomTab] = useState<'scan' | 'pay'>('scan')
  const [flashOn, setFlashOn] = useState<boolean>(false)
  const [cameraReady, setCameraReady] = useState<boolean>(false)
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(null)
  const [scannedQrNotice, setScannedQrNotice] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)

  // Account & Privacy / Security / Device Management / Sign Out States
  const [accountSubScreen, setAccountSubScreen] = useState<AccountSubScreen>('main')
  const [showSignOutModal, setShowSignOutModal] = useState<boolean>(false)
  const [hideInfoToggle, setHideInfoToggle] = useState<boolean>(true)
  const [showReceivingProfileToggle, setShowReceivingProfileToggle] = useState<boolean>(true)
  const [biometricConsentToggle, setBiometricConsentToggle] = useState<boolean>(true)
  const [photosAccessAllowed, setPhotosAccessAllowed] = useState<boolean>(true)

  const isLight = theme === 'light'
  const isAk = lang === 'ak'
  const isSubScreen = !DOCK_TABS.includes(screen)

  // Guard helper: if user is Unverified, block function execution and tell them to verify
  const requireVerified = (featureName: string, action: () => void) => {
    if (!isVerified) {
      setVerifyPromptModal({ open: true, featureName })
      return
    }
    action()
  }

  // Start / Stop real device camera when entering or leaving the Scan screen
  useEffect(() => {
    if (screen === 'scan' && scanBottomTab === 'scan') {
      let cancelled = false
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
          })
          .then((stream) => {
            if (cancelled) {
              stream.getTracks().forEach((t) => t.stop())
              return
            }
            streamRef.current = stream
            setCameraReady(true)
            if (videoRef.current) {
              videoRef.current.srcObject = stream
              videoRef.current.play().catch(() => {})
            }
          })
          .catch(() => {
            setCameraReady(false)
          })
      }
      return () => {
        cancelled = true
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
          streamRef.current = null
        }
        setCameraReady(false)
        setFlashOn(false)
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      setCameraReady(false)
      setFlashOn(false)
    }
  }, [screen, scanBottomTab])

  const handleToggleFlash = async () => {
    const nextFlash = !flashOn
    setFlashOn(nextFlash)
    try {
      const stream = streamRef.current
      if (stream) {
        const track = stream.getVideoTracks()[0]
        if (track && 'applyConstraints' in track) {
          await track.applyConstraints({
            advanced: [{ torch: nextFlash } as MediaTrackConstraintSet],
          })
        }
      }
    } catch {
      // Fallback visual screen torch stays active
    }
  }

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      setGalleryImagePreview(result)
      setScannedQrNotice(
        isAk
          ? `Gallery မှ QR ပုံ (${file.name}) ကို ဖတ်ရှုပြီးပါပြီ — ငွေလွှဲရန် အသင့်ဖြစ်ပါပြီ`
          : `QR code recognized from "${file.name}" — Ready to pay`
      )
    }
    reader.readAsDataURL(file)
  }

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(SINGLE_WALLET_ACCOUNT.fullAddress)
    setCopiedWalletAddr(true)
    setTimeout(() => setCopiedWalletAddr(false), 2000)
  }

  const handleCopyRecoveryPhrase = () => {
    navigator.clipboard?.writeText(SINGLE_WALLET_ACCOUNT.recoveryPhrase.join(' '))
    setPhraseCopied(true)
    setTimeout(() => setPhraseCopied(false), 2000)
  }

  const handleRefreshWallet = () => {
    setIsRefreshingWallet(true)
    setTimeout(() => setIsRefreshingWallet(false), 700)
  }

  const filteredHistoryTxns = useMemo(() => {
    if (historyCategoryTab === 'wallet') {
      return transactions.filter((tx) => tx.category === 'p2p' || tx.category === 'crypto')
    }
    if (historyCategoryTab === 'qr_pay') {
      return transactions.filter((tx) => tx.category === 'pos')
    }
    return transactions
  }, [historyCategoryTab])

  /* ─── SHARED TOP LOGO BAR (LOGO ONLY BY DEFAULT; LIVE CHAT ONLY ON HOME, NO BELL, NO BLACK HOVER/BOX ON LOGO) ─── */
  const renderTopLogoHeader = (showChat = false) => (
    <div className="px-4 pt-4 pb-2 flex items-center justify-between">
      {/* Left: Clean Péthar Logo without black box or black hover */}
      <button
        type="button"
        onClick={() => setScreen('home')}
        aria-label="Péthar Home"
        className="w-10 h-10 flex items-center justify-center bg-transparent hover:bg-transparent active:scale-95 transition cursor-pointer"
      >
        <img
          src="/pethar-logo-red-white.svg"
          alt="Péthar"
          className="w-10 h-10 object-contain"
        />
      </button>

      {/* Right: Live Chat Support Button ONLY on Home (No Notification Bell) */}
      {showChat && (
        <button
          type="button"
          onClick={() => setChatModalOpen(true)}
          aria-label="Live Chat Support"
          className="h-10 px-3.5 rounded-full bg-white shadow-xs border border-zinc-200/80 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-800 hover:border-[#D91624]/40 hover:text-[#D91624] transition cursor-pointer"
        >
          <Headphones size={16} className="text-[#D91624]" />
          <span>{isAk ? 'ချက်တင်' : 'Chat'}</span>
        </button>
      )}
    </div>
  )

  /* ═══════════════════════════════════════════════════════════════════════════
     1. OPENING SPLASH SCREEN WITH PÉTHAR LOGO
  ═══════════════════════════════════════════════════════════════════════════ */
  if (showSplash) {
    return (
      <div
        onClick={() => setShowSplash(false)}
        className="min-h-screen w-full flex justify-center bg-[#E2E8F0] select-none cursor-pointer"
      >
        <div className="w-full max-w-[480px] min-h-screen bg-white flex flex-col justify-between items-center relative overflow-hidden shadow-2xl">
          <div className="h-12" />

          <div className="flex flex-col items-center justify-center space-y-4 px-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-28 h-28 flex items-center justify-center">
              <img
                src="/pethar-logo-red-white.svg"
                alt="Péthar Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="text-4xl font-black text-[#D91624]">péthar</span>
              <span className="text-4xl font-light text-zinc-900 ml-0.5">wallet</span>
            </div>
          </div>

          <div className="w-full flex flex-col items-center">
            <div className="flex items-center justify-center gap-4 pb-7 px-6">
              <div className="px-2.5 py-1 border border-[#1E3A8A] rounded-[4px] flex items-center">
                <span className="text-[11px] font-black tracking-tight bg-[#1E3A8A] text-white px-1 mr-1">
                  AK
                </span>
                <span className="text-[11px] font-extrabold text-[#1E3A8A]">Pay</span>
              </div>
              <span className="text-lg font-black italic tracking-tighter text-[#1434CB]">
                VISA
              </span>
              <div className="flex items-center">
                <span className="w-5 h-5 rounded-full bg-[#EB001B] inline-block" />
                <span className="w-5 h-5 rounded-full bg-[#F79E1B]/90 -ml-2 inline-block" />
              </div>
              <div className="flex items-center gap-1 text-[#00A0E9] font-extrabold text-sm">
                <span>USDT</span>
                <span className="text-zinc-300 font-light">|</span>
                <span>USDC</span>
              </div>
            </div>

            <div className="w-32 h-1.5 rounded-full bg-zinc-900 mb-2" />
            <div className="w-full h-2 bg-gradient-to-r from-[#D91624] via-[#FF2A38] to-[#D91624]" />
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     2. HOME SCREEN:
        - Top: Just Logo + Bell + Chat button (No "Home" title bar, no "PÉTHAR USD WALLET" text)
        - Welcome back, Name + Verified / Unverified badge
        - Wallet Balance with AKD symbol (₳)
        - Replaced below cards with Pay, Receive, Deposit, Withdraw + Exchange Rates
          (Matching photo 8.22.23 AM)
  ═══════════════════════════════════════════════════════════════════════════ */
  const renderHomeScreen = () => {
    const homeCoreActions = [
      {
        id: 'pay',
        label: isAk ? 'ငွေပေးချေ' : 'Pay',
        icon: () => <NavScanBracketIcon className="w-6 h-6 text-[#D91624]" />,
        action: () =>
          requireVerified(isAk ? 'ငွေပေးချေရန် (Pay)' : 'Pay', () => {
            setScanBottomTab('scan')
            setScreen('scan')
          }),
      },
      {
        id: 'receive',
        label: isAk ? 'ငွေလက်ခံ' : 'Receive',
        icon: () => <QrCode size={23} className="text-[#D91624]" />,
        action: () =>
          requireVerified(isAk ? 'ငွေလက်ခံရန် (Receive)' : 'Receive', () =>
            setScreen('receive')
          ),
      },
      {
        id: 'deposit',
        label: isAk ? 'ငွေသွင်း' : 'Deposit',
        icon: () => (
          <div className="relative flex items-center justify-center">
            <Landmark size={22} className="text-[#D91624]" />
            <ArrowDown
              size={11}
              className="text-[#D91624] bg-white rounded-full absolute -bottom-1 -right-1 stroke-[3]"
            />
          </div>
        ),
        action: () =>
          requireVerified(isAk ? 'ငွေသွင်းရန် (Deposit)' : 'Deposit', () => {
            setFinancialSubView('deposit')
            setScreen('financial')
          }),
      },
      {
        id: 'withdraw',
        label: isAk ? 'ငွေထုတ်' : 'Withdraw',
        icon: () => (
          <div className="relative flex items-center justify-center">
            <Landmark size={22} className="text-[#D91624]" />
            <ArrowUp
              size={11}
              className="text-[#D91624] bg-white rounded-full absolute -bottom-1 -right-1 stroke-[3]"
            />
          </div>
        ),
        action: () =>
          requireVerified(isAk ? 'ငွေထုတ်ရန် (Withdraw)' : 'Withdraw', () => {
            setFinancialSubView('withdraw')
            setScreen('financial')
          }),
      },
    ]

    const exchangeRates = [
      {
        code: 'AKD',
        flag: '₳',
        flagBg: 'bg-[#D91624] text-white font-black',
        buy: '1.00',
        sell: '1.00',
      },
      {
        code: 'USD',
        flag: '🇺🇸',
        flagBg: 'bg-zinc-100',
        buy: '1.00',
        sell: '1.00',
      },
      {
        code: 'USDT',
        flag: '₮',
        flagBg: 'bg-[#26A17B] text-white font-black',
        buy: '0.9985',
        sell: '1.0000',
      },
      {
        code: 'SGD',
        flag: '🇸🇬',
        flagBg: 'bg-zinc-100',
        buy: '0.7420',
        sell: '0.7485',
      },
    ]

    return (
      <div className="min-h-full bg-gradient-to-b from-[#FFF5F5] via-[#F8FAFC] to-[#F4F6F9] text-zinc-900 pb-8">
        {/* Top Header: Péthar Logo + Live Chat Button (only on Home, no Bell) */}
        {renderTopLogoHeader(true)}

        <div className="px-4 pt-2 space-y-5">
          {/* Welcome Back Name + Verified / Unverified Pill Card */}
          <div className="bg-white rounded-[26px] p-3.5 shadow-[0_8px_26px_rgba(15,23,42,0.05)] border border-zinc-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white font-black text-lg shrink-0 shadow-xs">
                {profile.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-zinc-400 font-medium">
                  {isAk ? 'ပြန်လည်ကြိုဆိုပါသည်၊' : 'Welcome back,'}
                </div>
                <div className="text-base font-extrabold text-zinc-900 truncate mt-0.5">
                  {profile.name}
                </div>
              </div>
            </div>

            {/* Verified or Unverified Badge Button */}
            {isVerified ? (
              <button
                type="button"
                onClick={() => setKycFlowModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full border border-[#0284C7]/50 bg-[#F0F9FF] text-[#0284C7] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <CheckCircle2 size={15} className="fill-[#0284C7] text-white" />
                <span>{isAk ? 'အတည်ပြုပြီး (Verified)' : 'Verified'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setKycFlowModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full border border-[#D91624] bg-[#FFF1F2] text-[#D91624] text-xs font-extrabold inline-flex items-center gap-1.5 shrink-0 shadow-[0_4px_12px_rgba(217,22,36,0.18)] animate-pulse cursor-pointer"
              >
                <AlertCircle size={15} />
                <span>{isAk ? 'အတည်မပြုရသေး (Unverified)' : 'Unverified'}</span>
              </button>
            )}
          </div>

          {/* Unverified Warning Banner when account is not verified */}
          {!isVerified && (
            <div className="p-3.5 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="text-[#D91624] shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-800 leading-relaxed">
                  <span className="font-extrabold text-[#D91624] block">
                    {isAk ? 'အကောင့်အတည်ပြုရန် လိုအပ်ပါသည်' : 'Account Verification Required'}
                  </span>
                  {isAk
                    ? 'ငွေပေးချေခြင်း၊ လက်ခံခြင်း၊ ငွေသွင်း/ငွေထုတ် လုပ်ဆောင်ချက်များကို အသုံးပြုရန် သင့်အကောင့်ကို အတည်ပြုပေးပါ။'
                    : 'Please verify your identity to unlock Pay, Receive, Deposit, and Withdraw.'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setKycFlowModalOpen(true)}
                className="px-3 py-1.5 rounded-full bg-[#D91624] text-white text-[11px] font-bold shrink-0 cursor-pointer"
              >
                {isAk ? 'အတည်ပြုမည်' : 'Verify'}
              </button>
            </div>
          )}

          {/* Unified Action & AKD Balance Card (Pay | Receive | Deposit | Withdraw + ₳ Balance) */}
          <div className="bg-white rounded-[28px] shadow-[0_12px_32px_rgba(15,23,42,0.06)] border border-zinc-100 overflow-hidden">
            {/* Top 4 Actions Row: Pay | Receive | Deposit | Withdraw */}
            <div className="grid grid-cols-4 gap-2 px-4 pt-6 pb-5 border-b border-zinc-100">
              {homeCoreActions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="flex flex-col items-center gap-2.5 group active:scale-95 transition cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] flex items-center justify-center shadow-2xs group-hover:bg-[#FFE4E6] transition">
                    {item.icon()}
                  </div>
                  <span className="text-xs font-bold text-zinc-900">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Bottom AKD Wallet Balance Section */}
            <div className="px-5 py-4 bg-zinc-50/50 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                  <span>
                    {isAk
                      ? 'ပိုက်ဆံအိတ် လက်ကျန်ငွေ (AKD)'
                      : 'Wallet Balance (AKD)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHomeBalanceHidden((h) => !h)}
                    className="text-zinc-500 hover:text-zinc-900 cursor-pointer"
                  >
                    {homeBalanceHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <div className="mt-1.5 flex items-baseline font-mono tracking-tight">
                  {homeBalanceHidden ? (
                    <span className="text-2xl font-black text-zinc-900 tracking-widest">
                      ******
                    </span>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-[#D91624] mr-1.5">
                        ₳
                      </span>
                      <span className="text-3xl font-black text-zinc-950">
                        {akdBalance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFinancialSubView('wallet_main')
                  setScreen('financial')
                }}
                className="text-xs font-bold text-[#D91624] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{isAk ? 'အသေးစိတ်' : 'View more'}</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Exchange Rates Section (Matching photo 8.22.23 AM) */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-extrabold text-zinc-900">
                    {isAk ? 'ငွေလဲလှယ်နှုန်းများ' : 'Exchange rates'}
                  </h2>
                  <RefreshCw size={14} className="text-zinc-400" />
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Last updated: October 17, 2026 · 1 ₳ = $1.00 USD
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  requireVerified('Convert', () => setConvertModalOpen(true))
                }
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                {isAk ? 'လဲလှယ်ရန်' : 'Convert'}
              </button>
            </div>

            <div className="grid grid-cols-3 px-4 py-1 text-xs font-semibold text-zinc-400">
              <span>Currencies</span>
              <span className="text-right">Buy (AKD)</span>
              <span className="text-right">Sell (AKD)</span>
            </div>

            <div className="space-y-2">
              {exchangeRates.map((item) => (
                <div
                  key={item.code}
                  className="bg-white rounded-2xl px-4 py-3.5 border border-zinc-100 shadow-2xs grid grid-cols-3 items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-full ${item.flagBg} flex items-center justify-center text-xs shrink-0`}
                    >
                      {item.flag}
                    </span>
                    <span className="text-sm font-bold text-zinc-900">
                      {item.code}
                    </span>
                  </div>
                  <div className="text-right font-mono text-sm font-bold text-zinc-900">
                    {item.buy}
                  </div>
                  <div className="text-right font-mono text-sm font-bold text-zinc-900">
                    {item.sell}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     3. FINANCIAL TAB — USD ACCOUNT CRYPTO WALLET
        - Top: Just Péthar Logo + Bell + Chat (No "Wallet" page header)
        - Header Row: USD symbol ($) + "USD Account" (dropped "USD-Backed" text)
        - Right functions: ONLY Refresh button & Setting button (opens Security & Privacy with Secret Recovery Phrase)
        - Below Amount ($12,500.00): Receive, Send, Convert, Transfer
        - Sub-tabs: Tokens | Activity | Refund (Strictly NO NFT)
  ═══════════════════════════════════════════════════════════════════════════ */
  const renderFinancialCryptoWalletScreen = () => {
    // SUB-VIEW 0: WALLET SECURITY & PRIVACY WITH SECRET RECOVERY PHRASE
    if (financialSubView === 'wallet_security_phrase') {
      return (
        <div className="min-h-full bg-[#F8FAFC] text-zinc-900 flex flex-col pb-8">
          <div className="bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-100">
            <button
              type="button"
              onClick={() => setFinancialSubView('wallet_main')}
              className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-base font-extrabold text-zinc-900">
              {isAk ? 'လုံခြုံရေးနှင့် လျှို့ဝှက်စကားစု' : 'Security & Privacy'}
            </h1>
            <div className="w-9" />
          </div>

          <div className="p-4 space-y-5">
            {/* Account Summary Banner */}
            <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D91624] text-white flex items-center justify-center font-black text-base">
                  $
                </div>
                <div>
                  <div className="text-sm font-extrabold text-zinc-900">
                    {SINGLE_WALLET_ACCOUNT.name}
                  </div>
                  <div className="text-xs font-mono text-zinc-500">
                    {SINGLE_WALLET_ACCOUNT.shortAddress}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold">
                Self-Custodial
              </span>
            </div>

            {/* Secret Recovery Phrase Card */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <KeyRound size={20} className="text-[#D91624] shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-sm font-extrabold text-zinc-900">
                      {isAk
                        ? 'လျှို့ဝှက် ပြန်လည်ရယူရေး စကားစု (Secret Recovery Phrase)'
                        : 'Secret Recovery Phrase'}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                      {isAk
                        ? 'ဤစကားလုံး ၁၂ လုံးသည် သင်၏ USD Crypto ပိုက်ဆံအိတ်၏ မာစတာသော့ချက်ဖြစ်သည်။ မည်သူ့ကိုမျှ မမျှဝေပါနှင့်။'
                        : 'Your 12-word Secret Recovery Phrase grants full access to your USD Account. Never share it with anyone.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 12-Word Grid (Blurred until revealed) */}
              <div className="relative">
                <div
                  className={`grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-50 border border-zinc-200 transition ${
                    phraseRevealed ? '' : 'blur-sm select-none'
                  }`}
                >
                  {SINGLE_WALLET_ACCOUNT.recoveryPhrase.map((word, index) => (
                    <div
                      key={word}
                      className="px-2.5 py-2 rounded-xl bg-white border border-zinc-200/80 text-xs font-mono flex items-center gap-1.5"
                    >
                      <span className="text-zinc-400 font-bold">{index + 1}.</span>
                      <span className="font-bold text-zinc-900">{word}</span>
                    </div>
                  ))}
                </div>

                {!phraseRevealed && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setPhraseRevealed(true)}
                      className="px-4 py-2.5 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
                    >
                      <Eye size={15} />
                      <span>
                        {isAk ? 'စကားစု ဖော်ပြရန်' : 'Tap to Reveal Phrase'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPhraseRevealed((v) => !v)}
                  className="py-2.5 rounded-full border border-zinc-300 text-xs font-bold text-zinc-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {phraseRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span>{phraseRevealed ? 'Hide Phrase' : 'Show Phrase'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyRecoveryPhrase}
                  className="py-2.5 rounded-full bg-[#D91624] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {phraseCopied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{phraseCopied ? 'Copied!' : 'Copy Phrase'}</span>
                </button>
              </div>
            </div>

            {/* Security & Privacy Toggles */}
            <div className="bg-white rounded-3xl divide-y divide-zinc-100 border border-zinc-200/80 shadow-xs">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock size={19} className="text-zinc-700" />
                  <div>
                    <div className="text-sm font-bold text-zinc-900">
                      Auto-Lock USD Wallet
                    </div>
                    <div className="text-xs text-zinc-400">
                      Require PIN after 5 minutes of inactivity
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoLockWallet((v) => !v)}
                  className={`w-12 h-7 rounded-full p-0.5 transition cursor-pointer ${
                    autoLockWallet ? 'bg-[#D91624]' : 'bg-zinc-300'
                  }`}
                >
                  <span
                    className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${
                      autoLockWallet ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={19} className="text-zinc-700" />
                  <div>
                    <div className="text-sm font-bold text-zinc-900">
                      Biometric Transaction Signing
                    </div>
                    <div className="text-xs text-zinc-400">
                      Confirm Send, Convert & Transfer with biometrics
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBiometricSigning((v) => !v)}
                  className={`w-12 h-7 rounded-full p-0.5 transition cursor-pointer ${
                    biometricSigning ? 'bg-[#D91624]' : 'bg-zinc-300'
                  }`}
                >
                  <span
                    className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${
                      biometricSigning ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <EyeOff size={19} className="text-zinc-700" />
                  <div>
                    <div className="text-sm font-bold text-zinc-900">
                      Privacy Mode (Hide Address Preview)
                    </div>
                    <div className="text-xs text-zinc-400">
                      Mask public address on shared receipts
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHideInfoToggle((v) => !v)}
                  className={`w-12 h-7 rounded-full p-0.5 transition cursor-pointer ${
                    hideInfoToggle ? 'bg-[#D91624]' : 'bg-zinc-300'
                  }`}
                >
                  <span
                    className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${
                      hideInfoToggle ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // SUB-VIEW A: DEPOSIT USD STABLECOIN
    if (financialSubView === 'deposit') {
      const activeToken =
        USD_BACKED_TOKENS.find((t) => t.symbol === selectedDepositToken) ||
        USD_BACKED_TOKENS[0]

      return (
        <div className="min-h-full bg-[#F8FAFC] text-zinc-900 flex flex-col pb-8">
          <div className="bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-100">
            <button
              type="button"
              onClick={() => setFinancialSubView('wallet_main')}
              className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-base font-extrabold text-zinc-900">
              {isAk ? 'ငွေသွင်းရန် (Deposit)' : 'Deposit'}
            </h1>
            <button
              type="button"
              onClick={() => setFinancialSubView('tx_history')}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              title="Transaction History"
            >
              <FileText size={19} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-zinc-100/90 rounded-2xl p-2 flex items-center justify-between relative">
              <button
                type="button"
                onClick={() => setDepositTokenDropdownOpen((o) => !o)}
                className="px-3.5 py-2 rounded-xl bg-white shadow-xs flex items-center gap-2 text-xs font-extrabold text-zinc-900 cursor-pointer"
              >
                <span
                  className={`w-6 h-6 rounded-full ${activeToken.bg} text-white flex items-center justify-center text-xs font-black`}
                >
                  {activeToken.badgeText}
                </span>
                <span>{activeToken.symbol}</span>
                <ChevronDown size={14} className="text-zinc-500" />
              </button>

              <div className="pr-2 text-xs font-semibold text-zinc-700">
                <span className="font-bold text-zinc-900">
                  {SINGLE_WALLET_ACCOUNT.name}
                </span>{' '}
                <span className="font-mono text-zinc-500">
                  {SINGLE_WALLET_ACCOUNT.shortAddress}
                </span>
              </div>

              {depositTokenDropdownOpen && (
                <div className="absolute left-2 top-14 w-52 bg-white rounded-2xl shadow-xl border border-zinc-200 p-1.5 z-30">
                  {USD_BACKED_TOKENS.map((t) => (
                    <button
                      key={t.symbol}
                      type="button"
                      onClick={() => {
                        setSelectedDepositToken(t.symbol)
                        setDepositTokenDropdownOpen(false)
                      }}
                      className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer ${
                        t.symbol === selectedDepositToken
                          ? 'bg-[#D91624]/10 text-[#D91624]'
                          : 'text-zinc-800 hover:bg-zinc-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full ${t.bg} text-white flex items-center justify-center text-[10px] font-black`}
                        >
                          {t.badgeText}
                        </span>
                        <span>{t.symbol}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-normal">
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-[0_12px_32px_rgba(15,23,42,0.06)] border border-zinc-100 overflow-hidden relative">
              <div className="px-5 py-4 flex items-center justify-between border-b border-dashed border-zinc-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <img
                      src="/pethar-logo-red-white.svg"
                      alt="Péthar"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm font-extrabold text-zinc-900">
                    {SINGLE_WALLET_ACCOUNT.name}
                  </span>
                </div>
                <ExternalLink size={16} className="text-zinc-400" />
              </div>

              <div className="p-6 flex flex-col items-center space-y-4">
                <div className="p-3 bg-white rounded-2xl border border-zinc-100 shadow-xs">
                  <FakeQR
                    size={200}
                    value={`${SINGLE_WALLET_ACCOUNT.fullAddress}?token=${selectedDepositToken}`}
                  />
                </div>

                <div className="text-sm font-mono font-bold text-zinc-800">
                  {SINGLE_WALLET_ACCOUNT.shortAddress}
                </div>

                <div className="flex items-center justify-center">
                  <span className="w-6 h-6 rounded-full bg-[#627EEA] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    ♦
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#F3BA2F] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white -ml-1.5">
                    ❖
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#28A0F0] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white -ml-1.5">
                    A
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#8247E5] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white -ml-1.5">
                    ∞
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 border-t border-zinc-100 bg-zinc-50/70">
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="py-4 flex items-center justify-center gap-2 text-sm font-bold text-zinc-800 hover:bg-zinc-100 transition cursor-pointer"
                >
                  {copiedWalletAddr ? (
                    <Check size={17} className="text-emerald-600" />
                  ) : (
                    <Copy size={17} className="text-[#D91624]" />
                  )}
                  <span>{copiedWalletAddr ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="py-4 flex items-center justify-center gap-2 text-sm font-bold text-zinc-800 hover:bg-zinc-100 border-l border-zinc-200/70 transition cursor-pointer"
                >
                  <Share2 size={17} className="text-[#D91624]" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // SUB-VIEW B: WITHDRAW / SEND USD STABLECOIN
    if (financialSubView === 'withdraw') {
      return (
        <div className="min-h-full bg-white text-zinc-900 flex flex-col justify-between pb-8">
          <div>
            <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setWithdrawStep('address')
                  setFinancialSubView('wallet_main')
                }}
                className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-base font-extrabold text-zinc-900">
                {isAk ? 'ပေးပို့ရန် / ငွေထုတ် (Send)' : 'Send / Withdraw'}
              </h1>
              <button
                type="button"
                onClick={() => setFinancialSubView('tx_history')}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                title="Transaction History"
              >
                <FileText size={19} />
              </button>
            </div>

            <div className="p-4 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800">From</label>
                <div className="p-3.5 rounded-2xl border border-zinc-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D91624] text-white font-black text-xs flex items-center justify-center shrink-0">
                    $
                  </div>
                  <span className="text-sm font-bold text-zinc-900">
                    {SINGLE_WALLET_ACCOUNT.name}
                  </span>
                  <span className="text-sm font-mono text-zinc-500">
                    {SINGLE_WALLET_ACCOUNT.shortAddress}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800">
                  Recipient address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={withdrawRecipientAddress}
                    onChange={(e) => setWithdrawRecipientAddress(e.target.value)}
                    placeholder="Enter address (0x...)"
                    className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-zinc-100 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#D91624]/30"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScanBottomTab('scan')
                      setScreen('scan')
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D91624] p-1 cursor-pointer"
                  >
                    <NavScanBracketIcon className="w-5 h-5 text-[#D91624]" />
                  </button>
                </div>
              </div>

              {withdrawStep === 'confirm' && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Asset</span>
                    <span className="font-extrabold text-zinc-900">
                      USDT / USDC / USD1
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-base font-extrabold font-mono text-zinc-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="grid grid-cols-2 border-b border-zinc-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setWithdrawTab('your_account')}
                    className={`pb-2.5 border-b-2 transition cursor-pointer ${
                      withdrawTab === 'your_account'
                        ? 'border-[#D91624] text-[#D91624]'
                        : 'border-transparent text-zinc-500'
                    }`}
                  >
                    Your Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawTab('contacts')}
                    className={`pb-2.5 border-b-2 transition cursor-pointer ${
                      withdrawTab === 'contacts'
                        ? 'border-[#D91624] text-[#D91624]'
                        : 'border-transparent text-zinc-500'
                    }`}
                  >
                    Contacts
                  </button>
                </div>

                <div className="pt-3 space-y-2">
                  {withdrawTab === 'your_account' ? (
                    <button
                      type="button"
                      onClick={() =>
                        setWithdrawRecipientAddress(SINGLE_WALLET_ACCOUNT.fullAddress)
                      }
                      className="w-full p-3.5 rounded-2xl border border-zinc-200 flex items-center justify-between hover:border-[#D91624]/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D91624] text-white font-black text-xs flex items-center justify-center shrink-0">
                          $
                        </div>
                        <span className="text-sm font-bold text-zinc-900">
                          {SINGLE_WALLET_ACCOUNT.name}
                        </span>
                      </div>
                      <span className="text-sm font-mono text-zinc-500">
                        {SINGLE_WALLET_ACCOUNT.shortAddress}
                      </span>
                    </button>
                  ) : (
                    contacts.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          setWithdrawRecipientAddress(`0x8F492C109bE742819aBcD${c.id.slice(-4)}`)
                        }
                        className="w-full p-3.5 rounded-2xl border border-zinc-200 flex items-center justify-between hover:border-[#D91624]/40 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#D91624]/10 text-[#D91624] font-bold text-xs flex items-center justify-center">
                            {c.initials}
                          </div>
                          <span className="text-sm font-bold text-zinc-900">
                            {c.name}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-zinc-500">
                          0x8F4...{c.id.slice(-4)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 pt-4">
            <button
              type="button"
              onClick={() => {
                if (!withdrawRecipientAddress.trim()) {
                  setWithdrawRecipientAddress(SINGLE_WALLET_ACCOUNT.fullAddress)
                  return
                }
                if (withdrawStep === 'address') {
                  setWithdrawStep('confirm')
                } else {
                  setWithdrawStep('address')
                  setFinancialSubView('tx_history')
                }
              }}
              className="w-full py-3.5 rounded-2xl bg-[#D91624] hover:bg-[#B00E1A] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(217,22,36,0.3)] transition cursor-pointer"
            >
              {withdrawStep === 'address' ? 'Next' : `Confirm Send ($${withdrawAmount})`}
            </button>
          </div>
        </div>
      )
    }

    // SUB-VIEW C: TRANSACTION HISTORY
    if (financialSubView === 'tx_history') {
      return (
        <div className="min-h-full bg-white text-zinc-900 flex flex-col pb-8">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-100">
            <button
              type="button"
              onClick={() => setFinancialSubView('wallet_main')}
              className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-base font-extrabold text-zinc-900">
              {isAk ? 'ငွေစာရင်း မှတ်တမ်း' : 'Transaction History'}
            </h1>
            <button
              type="button"
              onClick={() => setHistoryCategoryTab('all')}
              className="w-9 h-9 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 border-b border-zinc-200 text-xs font-bold text-center">
            {(
              [
                { id: 'all', label: isAk ? 'အားလုံး' : 'All' },
                { id: 'wallet', label: isAk ? 'ပိုက်ဆံအိတ်' : 'Wallet' },
                { id: 'qr_pay', label: 'QR Pay' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setHistoryCategoryTab(t.id)}
                className={`py-3 border-b-2 transition cursor-pointer ${
                  historyCategoryTab === t.id
                    ? 'border-[#D91624] text-[#D91624]'
                    : 'border-transparent text-zinc-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="divide-y divide-zinc-100">
            {filteredHistoryTxns.map((tx) => {
              const isPos = tx.amount > 0
              return (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => setSelectedSlipTxn(tx)}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-zinc-50 text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full border border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] font-black text-zinc-900">
                        {tx.category === 'pos' ? 'QR' : 'USD'}
                      </span>
                      <span className="text-[8px] font-bold text-[#D91624]">
                        {tx.category === 'pos' ? 'Pay' : 'USDT'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-zinc-900 truncate">
                        {isAk ? tx.titleMm : tx.title}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">
                        {tx.time}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-extrabold font-mono shrink-0 ${
                      isPos ? 'text-emerald-600' : 'text-zinc-900'
                    }`}
                  >
                    {isPos ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    // SUB-VIEW D: TOTAL SPENDING ANALYTICS
    if (financialSubView === 'spending') {
      const isWeekly = spendingPeriod === 'weekly'
      return (
        <div className="min-h-full bg-[#F8FAFC] text-zinc-900 flex flex-col pb-8">
          <div className="bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-100">
            <button
              type="button"
              onClick={() => setFinancialSubView('wallet_main')}
              className="w-8 h-8 flex items-center justify-center text-zinc-700 cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-base font-extrabold">Total Spending</h1>
            <Calendar size={18} className="text-zinc-500" />
          </div>

          <div className="bg-gradient-to-b from-[#D91624] to-[#F97316] pt-4 pb-20 px-4">
            <div className="bg-zinc-100 p-1 rounded-full grid grid-cols-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setSpendingPeriod('weekly')}
                className={`py-2 rounded-full text-xs font-bold cursor-pointer ${
                  isWeekly ? 'bg-white text-[#D91624] shadow-xs' : 'text-zinc-500'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setSpendingPeriod('monthly')}
                className={`py-2 rounded-full text-xs font-bold cursor-pointer ${
                  !isWeekly ? 'bg-white text-[#D91624] shadow-xs' : 'text-zinc-500'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="px-4 -mt-16 space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-md border border-zinc-100 space-y-3">
              <div className="text-base font-extrabold">
                {isWeekly ? '12-18 October 2026' : 'October 2026'}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-500">Total spending</div>
                  <div className="text-base font-extrabold font-mono">
                    {isWeekly ? '$97.00' : '$227.00'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Average spending</div>
                  <div className="text-base font-extrabold font-mono">
                    {isWeekly ? '$32.33' : '$28.38'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // MAIN FINANCIAL VIEW: USD ACCOUNT CRYPTO WALLET
    return (
      <div className="min-h-full bg-gradient-to-b from-[#FFF5F5] via-[#F8FAFC] to-white text-zinc-900 flex flex-col pb-8">
        {/* Top Header: Just Péthar Logo + Bell + Chat (No "Wallet" title bar) */}
        {renderTopLogoHeader()}

        <div className="px-4 pt-2 space-y-5">
          {/* USD Account Header Row:
              - Left: USD symbol ($) + "USD Account" (NO "USD-Backed" text)
              - Right: ONLY Refresh button & Setting button (for Security & Privacy with Secret Recovery Phrase) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D91624] text-white flex items-center justify-center font-black text-sm shadow-xs">
                $
              </div>
              <span className="text-base font-extrabold text-zinc-900">
                {SINGLE_WALLET_ACCOUNT.name}
              </span>
            </div>

            <div className="flex items-center gap-2 text-zinc-700">
              <button
                type="button"
                onClick={handleRefreshWallet}
                title="Refresh USD Account"
                className="w-9 h-9 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center hover:text-[#D91624] transition cursor-pointer"
              >
                <RefreshCw
                  size={17}
                  className={isRefreshingWallet ? 'animate-spin text-[#D91624]' : ''}
                />
              </button>
              <button
                type="button"
                onClick={() =>
                  requireVerified('Security & Secret Recovery Phrase', () =>
                    setFinancialSubView('wallet_security_phrase')
                  )
                }
                title="Security & Privacy (Secret Recovery Phrase)"
                className="w-9 h-9 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center hover:text-[#D91624] transition cursor-pointer"
              >
                <SettingsIcon size={17} />
              </button>
            </div>
          </div>

          {/* Main USD Account Card */}
          <div className="bg-white rounded-[28px] p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] border border-zinc-100 space-y-5">
            {/* Address + Copy */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-zinc-500">
                {SINGLE_WALLET_ACCOUNT.shortAddress}
              </span>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                title="Copy Wallet Address"
              >
                {copiedWalletAddr ? (
                  <Check size={15} className="text-emerald-500" />
                ) : (
                  <Copy size={15} />
                )}
              </button>
            </div>

            {/* Total USD Account Balance */}
            <div className="flex items-center gap-2.5">
              <div className="text-3xl font-black font-mono text-zinc-950 tracking-tight">
                {walletBalanceHidden
                  ? '••••••'
                  : `$${usdAccountBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
              </div>
              <button
                type="button"
                onClick={() => setWalletBalanceHidden((h) => !h)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                {walletBalanceHidden ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* 4 Functions Below Amount: Receive | Send | Convert | Transfer */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <button
                type="button"
                onClick={() =>
                  requireVerified('Receive', () => setFinancialSubView('deposit'))
                }
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] text-[#D91624] flex items-center justify-center group-active:scale-95 transition">
                  <ArrowDown size={20} />
                </div>
                <span className="text-xs font-bold text-zinc-900">
                  {isAk ? 'လက်ခံရန်' : 'Receive'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  requireVerified('Send', () => setFinancialSubView('withdraw'))
                }
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] text-[#D91624] flex items-center justify-center group-active:scale-95 transition">
                  <ArrowUp size={20} />
                </div>
                <span className="text-xs font-bold text-zinc-900">
                  {isAk ? 'ပေးပို့ရန်' : 'Send'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  requireVerified('Convert', () => setConvertModalOpen(true))
                }
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] text-[#D91624] flex items-center justify-center group-active:scale-95 transition">
                  <Repeat size={19} />
                </div>
                <span className="text-xs font-bold text-zinc-900">
                  {isAk ? 'လဲလှယ်ရန်' : 'Convert'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  requireVerified('Transfer', () => setTransferModalOpen(true))
                }
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] text-[#D91624] flex items-center justify-center group-active:scale-95 transition">
                  <ArrowLeftRight size={19} />
                </div>
                <span className="text-xs font-bold text-zinc-900">
                  {isAk ? 'လွှဲပြောင်း' : 'Transfer'}
                </span>
              </button>
            </div>
          </div>

          {/* Wallet Sub-Tabs: Tokens | Activity | Refund (Strictly NO NFT tab!) */}
          <div>
            <div className="flex items-center justify-between border-b border-zinc-200">
              <div className="flex items-center gap-6 text-sm font-bold">
                {(
                  [
                    { id: 'tokens', label: isAk ? 'ဒေါ်လာဒင်္ဂါးများ (Tokens)' : 'Tokens' },
                    { id: 'activity', label: isAk ? 'မှတ်တမ်း (Activity)' : 'Activity' },
                    { id: 'refund', label: isAk ? 'ပြန်အမ်းငွေ (Refund)' : 'Refund' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setWalletTab(t.id)}
                    className={`pb-2.5 border-b-2 transition cursor-pointer ${
                      walletTab === t.id
                        ? 'border-[#D91624] text-[#D91624]'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  requireVerified('Deposit USD Stablecoin', () =>
                    setFinancialSubView('deposit')
                  )
                }
                className="p-1.5 text-zinc-600 hover:text-[#D91624] cursor-pointer"
                title="Manage USD Stablecoins"
              >
                <Plus size={19} />
              </button>
            </div>

            {/* TAB 1: USD CRYPTO CURRENCIES (USDT, USDC, USD1, FDUSD, PYUSD, DAI) */}
            {walletTab === 'tokens' && (
              <div className="pt-3 space-y-2.5">
                {USD_BACKED_TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    type="button"
                    onClick={() =>
                      requireVerified(`${token.symbol}`, () => {
                        setSelectedDepositToken(token.symbol)
                        setFinancialSubView('deposit')
                      })
                    }
                    className="w-full p-4 rounded-2xl bg-zinc-50/90 hover:bg-zinc-100/80 border border-zinc-100 flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <div
                          className={`w-11 h-11 rounded-full ${token.bg} text-white flex items-center justify-center font-black text-lg shadow-xs`}
                        >
                          {token.badgeText}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-zinc-900 text-[#D4AF37] border border-white flex items-center justify-center text-[8px] font-black">
                          $
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-extrabold text-zinc-900">
                          {token.symbol}
                        </div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">
                          {token.price} · {token.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-sm font-extrabold text-zinc-900">
                        {walletBalanceHidden
                          ? '••••'
                          : `${token.balance.toLocaleString()} ${token.symbol}`}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {walletBalanceHidden
                          ? '••••'
                          : `$${token.usdValue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* TAB 2: ACTIVITY (TRANSACTION HISTORY & SPENDING ANALYTICS) */}
            {walletTab === 'activity' && (
              <div className="pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {(
                      [
                        { id: 'all', label: 'All' },
                        { id: 'wallet', label: 'Wallet' },
                        { id: 'qr_pay', label: 'QR Pay' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setHistoryCategoryTab(f.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                          historyCategoryTab === f.id
                            ? 'bg-[#D91624] text-white'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFinancialSubView('spending')}
                    className="text-xs font-bold text-[#D91624] hover:underline cursor-pointer"
                  >
                    {isAk ? 'သုံးစွဲမှု စာရင်းချုပ် ›' : 'Spending Chart ›'}
                  </button>
                </div>

                <div className="divide-y divide-zinc-100 bg-white rounded-2xl border border-zinc-100">
                  {filteredHistoryTxns.map((tx) => {
                    const isPos = tx.amount > 0
                    return (
                      <button
                        key={tx.id}
                        type="button"
                        onClick={() => setSelectedSlipTxn(tx)}
                        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-bold text-zinc-900">
                            {isAk ? tx.titleMm : tx.title}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                            {tx.time}
                          </div>
                        </div>
                        <div
                          className={`text-xs font-extrabold font-mono ${
                            isPos ? 'text-emerald-600' : 'text-zinc-900'
                          }`}
                        >
                          {isPos
                            ? `+${tx.amount.toFixed(2)} USDT`
                            : `-${Math.abs(tx.amount).toFixed(2)} USDT`}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: REFUND */}
            {walletTab === 'refund' && (
              <div className="py-12 text-center space-y-2 text-zinc-400">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 mx-auto flex items-center justify-center text-zinc-400">
                  <RefreshCw size={24} />
                </div>
                <div className="text-xs font-semibold">
                  {isAk
                    ? 'ပြန်အမ်းငွေ တောင်းခံထားသော မှတ်တမ်း မရှိပါ'
                    : 'No pending USD stablecoin refunds'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verifiable E-Receipt Modal */}
        {selectedSlipTxn && (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedSlipTxn(null)}
          >
            <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <TransactionSlip
                lang={lang}
                refId={selectedSlipTxn.refId}
                amount={Math.abs(selectedSlipTxn.amount)}
                recipientName={
                  isAk ? selectedSlipTxn.counterpartyMm : selectedSlipTxn.counterparty
                }
                recipientId={selectedSlipTxn.refId}
                timestamp={selectedSlipTxn.time}
                fee={selectedSlipTxn.fee}
                onClose={() => setSelectedSlipTxn(null)}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     4. CAMERA SCAN + FLASHLIGHT + SELECT FROM GALLERY SCREEN
  ═══════════════════════════════════════════════════════════════════════════ */
  const renderCameraScanScreen = () => {
    return (
      <div className="fixed inset-0 z-50 flex justify-center bg-black select-none">
        <div className="w-full max-w-[480px] h-full flex flex-col relative overflow-hidden bg-zinc-800">
          {scanBottomTab === 'scan' ? (
            <div className="flex-1 relative flex flex-col justify-between overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${
                  cameraReady ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {!cameraReady && (
                <div
                  className="absolute inset-0 bg-gradient-to-b from-zinc-600 via-zinc-500 to-zinc-700"
                  style={{
                    backgroundImage:
                      'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 0)',
                    backgroundSize: '12px 12px',
                  }}
                />
              )}

              {flashOn && (
                <div className="absolute inset-0 bg-white/20 pointer-events-none transition-opacity" />
              )}

              <div className="relative z-10 px-4 pt-5 pb-3 flex items-center justify-between text-white">
                <button
                  type="button"
                  onClick={() => setScreen('home')}
                  aria-label="Back"
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/25 transition cursor-pointer"
                >
                  <ChevronLeft size={26} />
                </button>

                <span className="text-base font-bold tracking-wide drop-shadow">
                  {isAk ? 'စကင်ဖတ်ရန်' : 'Scan'}
                </span>

                <button
                  type="button"
                  onClick={handleToggleFlash}
                  aria-label="Toggle Flashlight"
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer ${
                    flashOn
                      ? 'bg-[#D91624] border-white text-white shadow-[0_0_20px_rgba(217,22,36,0.9)]'
                      : 'bg-black/25 border-white/80 text-white hover:bg-black/40'
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3h8l-2 6v10a2 2 0 0 1-4 0V9L8 3Z" />
                    <line x1="8" y1="3" x2="16" y2="3" />
                    <circle cx="12" cy="13" r="1" fill="currentColor" />
                  </svg>
                </button>
              </div>

              <div className="relative z-10 my-auto px-8">
                <div className="relative w-full h-8 flex items-center">
                  <div className="w-full h-[2px] bg-white shadow-[0_4px_16px_rgba(217,22,36,0.95)]" />
                  <div className="absolute left-2 right-2 top-1/2 h-3 bg-gradient-to-b from-[#D91624]/60 to-transparent blur-[2px]" />
                </div>

                {scannedQrNotice && (
                  <div className="mt-6 p-3.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 text-white text-xs space-y-2.5 shadow-2xl">
                    {galleryImagePreview && (
                      <img
                        src={galleryImagePreview}
                        alt="Selected QR"
                        className="w-20 h-20 object-cover rounded-xl mx-auto border border-white/20"
                      />
                    )}
                    <p className="text-center font-semibold">{scannedQrNotice}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setScannedQrNotice(null)
                          setGalleryImagePreview(null)
                        }}
                        className="flex-1 py-2 rounded-full bg-white/15 text-white font-bold text-xs cursor-pointer"
                      >
                        {isAk ? 'ပယ်ဖျက်' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setScannedQrNotice(null)
                          setGalleryImagePreview(null)
                          setFinancialSubView('withdraw')
                          setScreen('financial')
                        }}
                        className="flex-1 py-2 rounded-full bg-[#D91624] text-white font-bold text-xs cursor-pointer"
                      >
                        {isAk ? 'ငွေပေးချေမည်' : 'Proceed to Pay'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative z-10 pb-7 px-6 flex flex-col items-center gap-4">
                <p className="text-xs sm:text-sm font-medium text-white drop-shadow text-center">
                  {isAk
                    ? 'QR ကုဒ် သို့မဟုတ် ဘားကုဒ်ကို ဘောင်အတွင်း ထားရှိပါ'
                    : 'Place the QR code or barcode within the frame.'}
                </p>

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryFileChange}
                />

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="px-6 py-3 rounded-full bg-black/55 hover:bg-black/70 backdrop-blur-md text-white text-sm font-bold flex items-center gap-2.5 shadow-lg border border-white/15 transition active:scale-95 cursor-pointer"
                >
                  <ImageIcon size={18} />
                  <span>
                    {isAk ? 'ပုံပြခန်းမှ ရွေးချယ်ရန် (Select from Gallery)' : 'Select from Gallery'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-[#F8FAFC] text-zinc-900 flex flex-col">
              <div className="bg-white px-4 pt-5 pb-3 flex items-center justify-between border-b border-zinc-200">
                <button
                  type="button"
                  onClick={() => setScreen('home')}
                  className="w-9 h-9 flex items-center justify-center text-zinc-800 cursor-pointer"
                >
                  <ChevronLeft size={24} />
                </button>
                <span className="text-base font-bold">
                  {isAk ? 'QR ဖြင့် ငွေပေးချေရန်' : 'Pay with QR'}
                </span>
                <div className="w-9" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-xs bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#D91624] to-[#B00E1A] px-5 py-3.5 text-white flex items-center justify-between">
                    <span className="text-xs font-extrabold tracking-wide uppercase">
                      Péthar QR Pay
                    </span>
                    <span className="text-[11px] font-mono">
                      {SINGLE_WALLET_ACCOUNT.shortAddress}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col items-center space-y-4">
                    <div className="p-3 bg-white rounded-2xl border border-zinc-200 shadow-xs">
                      <FakeQR
                        size={180}
                        value={SINGLE_WALLET_ACCOUNT.fullAddress}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-extrabold text-zinc-900">
                        {profile.name}
                      </div>
                      <div className="text-xs font-mono text-zinc-500 mt-0.5">
                        {SINGLE_WALLET_ACCOUNT.name} · {SINGLE_WALLET_ACCOUNT.shortAddress}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white h-20 px-6 grid grid-cols-2 border-t border-zinc-200 shrink-0">
            <button
              type="button"
              onClick={() => setScanBottomTab('scan')}
              className="flex flex-col items-center justify-center gap-1 relative cursor-pointer"
            >
              <NavScanBracketIcon
                className={`w-6 h-6 ${
                  scanBottomTab === 'scan' ? 'text-[#D91624]' : 'text-zinc-700'
                }`}
              />
              <span
                className={`text-xs font-bold ${
                  scanBottomTab === 'scan' ? 'text-[#D91624]' : 'text-zinc-800'
                }`}
              >
                {isAk ? 'စကင်ဖတ်' : 'Scan'}
              </span>
              {scanBottomTab === 'scan' && (
                <span className="absolute bottom-2 w-10 h-1 rounded-full bg-[#D91624]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setScanBottomTab('pay')}
              className="flex flex-col items-center justify-center gap-1 relative cursor-pointer"
            >
              <svg
                className={`w-6 h-6 ${
                  scanBottomTab === 'pay' ? 'text-[#D91624]' : 'text-zinc-700'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14v2" />
              </svg>
              <span
                className={`text-xs font-bold ${
                  scanBottomTab === 'pay' ? 'text-[#D91624]' : 'text-zinc-800'
                }`}
              >
                {isAk ? 'ငွေပေးချေ' : 'Pay'}
              </span>
              {scanBottomTab === 'pay' && (
                <span className="absolute bottom-2 w-10 h-1 rounded-full bg-[#D91624]" />
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     5. ACCOUNT & SETTINGS + PRIVACY + DEVICE MANAGEMENT + SECURITY CHECKUP
  ═══════════════════════════════════════════════════════════════════════════ */
  const renderAccountScreen = () => {
    if (accountSubScreen === 'security_checkup') {
      return (
        <div className="min-h-full bg-white flex flex-col text-zinc-900">
          <div className="bg-[#2BB686] text-white px-4 pt-5 pb-10">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAccountSubScreen('main')}
                className="w-8 h-8 flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-base font-bold">
                {isAk ? 'လုံခြုံရေး စစ်ဆေးချက်' : 'Security Checkup'}
              </h1>
              <Info size={20} className="opacity-90" />
            </div>

            <div className="mt-8 flex flex-col items-center text-center space-y-2">
              <div className="w-20 h-20 rounded-2xl bg-white/15 border-2 border-white flex items-center justify-center shadow-lg">
                <Shield size={42} className="text-white" />
              </div>
              <h2 className="text-lg font-extrabold pt-2">
                {isAk ? 'လုံခြုံစိတ်ချရပြီး အသုံးပြုရန် အသင့်ရှိပါသည်' : 'Secured & ready to use'}
              </h2>
              <p className="text-xs text-white/90">
                {isAk
                  ? 'သင်၏ စနစ်နှင့် စက်ပစ္စည်းကို စစ်ဆေးပြီးပါပြီ။'
                  : "We've checked your system and device."}
              </p>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-t-3xl -mt-5 px-5 pt-4 divide-y divide-zinc-100">
            {[
              {
                icon: MoreHorizontal,
                title: isAk ? 'Péthar စနစ် ဝင်ရောက်မှု' : 'Péthar system login',
                sub: isAk ? 'PIN လုံခြုံရေးကုဒ် သတ်မှတ်ထားပြီး' : 'PIN authentication set up',
              },
              {
                icon: AppWindow,
                title: isAk ? 'အက်ပ်လီကေးရှင်းများ' : 'Applications',
                sub: isAk
                  ? 'အန္တရာယ်ရှိသော အက်ပ်များ မတွေ့ရှိပါ'
                  : 'No risky applications affecting Péthar usage found',
              },
              {
                icon: Globe,
                title: isAk ? 'ကွန်ရက် ချိတ်ဆက်မှု' : 'Network',
                sub: isAk
                  ? 'လုံခြုံသော ကွန်ရက်ချိတ်ဆက်မှု ဖြစ်ပါသည်'
                  : 'No risky connections according to Péthar database found',
              },
              {
                icon: Smartphone,
                title: isAk ? 'စက်ပစ္စည်း (Device)' : 'Device',
                sub: isAk ? 'Péthar နှင့် အပြည့်အဝ ကိုက်ညီမှုရှိသည်' : 'Compatible with Péthar',
              },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="py-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <Icon size={20} className="text-zinc-800 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{item.title}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                        {item.sub}
                      </div>
                    </div>
                  </div>
                  <Check size={20} className="text-[#16A34A] shrink-0 mt-1" />
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    if (accountSubScreen === 'device_management') {
      return (
        <div className="min-h-full bg-[#F8FAFC] flex flex-col text-zinc-900">
          <div className="bg-white px-4 pt-5 pb-3.5 flex items-center justify-between border-b border-zinc-200/80">
            <button
              type="button"
              onClick={() => setAccountSubScreen('main')}
              className="w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-base font-bold">
              {isAk ? 'စက်ပစ္စည်း စီမံခန့်ခွဲမှု' : 'Device Management'}
            </h1>
            <div className="w-8" />
          </div>

          <div className="p-4 space-y-6">
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold text-zinc-600 px-1">
                {isAk ? 'လက်ရှိ အသုံးပြုနေသော စက်' : 'Current device'}
              </h2>
              <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs space-y-3">
                <div className="flex items-start gap-3">
                  <Smartphone size={22} className="text-zinc-500 mt-0.5 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="text-sm font-bold text-zinc-900">
                      iOS | iPhone 14 Pro Max (Jack’s iPhone)
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock size={13} />
                      <span>Last signed in: 17 Oct 2026, 07:56</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <MapPin size={13} />
                      <span>Bangkok, Thailand</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSignOutModal(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>{isAk ? 'အကောင့်ထွက်မည်' : 'Sign Out'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-bold text-zinc-600 px-1">
                {isAk ? 'အခြားစက်များမှ ဝင်ရောက်ထားမှု' : 'Active sign-in from other devices'}
              </h2>
              <div className="py-12 px-6 text-center space-y-2 text-zinc-400">
                <Smartphone size={28} className="mx-auto opacity-50" />
                <p className="text-xs leading-relaxed">
                  No other devices are currently signed in. We&apos;ll notify you immediately and display the details here if we detect any new sign-in activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (accountSubScreen === 'privacy') {
      return (
        <div className="min-h-full bg-[#F8FAFC] flex flex-col text-zinc-900 pb-10">
          <div className="bg-white px-4 pt-5 pb-3.5 flex items-center justify-between border-b border-zinc-200/80 sticky top-0 z-20">
            <button
              type="button"
              onClick={() => setAccountSubScreen('main')}
              className="w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-base font-bold">
              {isAk ? 'ကိုယ်ရေးလုံခြုံမှု (Privacy)' : 'Privacy'}
            </h1>
            <div className="w-8" />
          </div>

          <div className="p-4 space-y-5">
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-zinc-600 px-1">
                Manage display setting
              </h2>
              <div className="bg-white rounded-2xl p-4 border border-zinc-200/70 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <EyeOff size={19} className="text-zinc-700 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      Hide information
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Example: ***-***-1234
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHideInfoToggle(!hideInfoToggle)}
                  className={`w-12 h-7 rounded-full p-0.5 transition cursor-pointer ${
                    hideInfoToggle ? 'bg-[#D91624]' : 'bg-zinc-300'
                  }`}
                >
                  <span
                    className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${
                      hideInfoToggle ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xs font-bold text-zinc-600 px-1">
                Manage receiving profile info
              </h2>
              <div className="bg-white rounded-2xl divide-y divide-zinc-100 border border-zinc-200/70">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Store size={19} className="text-zinc-700 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        My Receiving Profile
                      </div>
                      <span className="text-xs text-blue-600 font-medium">
                        See More ›
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-400" />
                </div>

                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Tag size={19} className="text-zinc-700 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        Show receiving profile info
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Enable to show your account age & number of people who sent money to you on the transfer page.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setShowReceivingProfileToggle(!showReceivingProfileToggle)
                    }
                    className={`w-12 h-7 rounded-full p-0.5 transition shrink-0 cursor-pointer ${
                      showReceivingProfileToggle ? 'bg-[#D91624]' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${
                        showReceivingProfileToggle ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xs font-bold text-zinc-600 px-1">
                Manage consents
              </h2>
              <div className="bg-white rounded-2xl divide-y divide-zinc-100 border border-zinc-200/70">
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText size={19} className="text-zinc-700 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 leading-snug">
                        Allow Péthar to collect, process, and use your biometric data.
                      </div>
                      <span className="text-xs text-blue-600 font-medium inline-block mt-1">
                        See More ›
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBiometricConsentToggle(!biometricConsentToggle)}
                    className={`w-12 h-7 rounded-full p-0.5 transition shrink-0 cursor-pointer ${
                      biometricConsentToggle ? 'bg-[#D91624]' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${
                        biometricConsentToggle ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xs font-bold text-zinc-600 px-1">
                Manage access
              </h2>
              <div className="bg-white rounded-2xl divide-y divide-zinc-100 border border-zinc-200/70">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Navigation size={19} className="text-zinc-700" />
                    <span className="text-sm font-medium text-zinc-900">Location</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <span>Only while usin...</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPhotosAccessAllowed(!photosAccessAllowed)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <ImageIcon size={19} className="text-zinc-700" />
                    <span className="text-sm font-medium text-zinc-900">Photos</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 font-semibold">
                    <span>{photosAccessAllowed ? 'Allow' : 'Ask'}</span>
                    <ChevronRight size={16} />
                  </div>
                </button>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookUser size={19} className="text-zinc-700" />
                    <span className="text-sm font-medium text-zinc-900">Contacts</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <span>Do not allow</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mic size={19} className="text-zinc-700" />
                    <span className="text-sm font-medium text-zinc-900">Microphone</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <span>Do not allow</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (accountSubScreen === 'cards') {
      return (
        <div className="flex flex-col min-h-full">
          <div className="bg-white px-4 py-3 border-b border-zinc-200 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAccountSubScreen('main')}
              className="w-8 h-8 flex items-center justify-center text-zinc-800 cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
            <span className="text-sm font-bold text-zinc-900">
              {isAk ? 'ကတ်များနှင့် ငွေစာရင်း' : 'Credit / Debit Cards'}
            </span>
          </div>
          <div className="flex-1">
            <AccountScreen go={setScreen} lang={lang} theme={theme} />
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-full bg-[#F4F5F8] text-zinc-900 pb-10">
        {renderTopLogoHeader()}

        <div className="mx-4 mt-2 rounded-3xl bg-gradient-to-r from-[#8B0E18] via-[#D91624] to-[#E11D48] text-white p-5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center font-black text-xl">
                {profile.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold">{profile.name}</h1>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isVerified
                        ? 'bg-emerald-500/25 text-emerald-100 border border-emerald-300/40'
                        : 'bg-amber-400 text-zinc-950'
                    }`}
                  >
                    {isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className="text-xs text-white/85 font-mono mt-0.5">
                  {SINGLE_WALLET_ACCOUNT.name} · {SINGLE_WALLET_ACCOUNT.shortAddress}
                </div>
              </div>
            </div>
            {setLang && (
              <button
                type="button"
                onClick={() => setLang(isAk ? 'en' : 'ak')}
                className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold cursor-pointer"
              >
                {isAk ? 'English' : 'ရခိုင်'}
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-5">
          <div className="bg-white rounded-2xl divide-y divide-zinc-100 border border-zinc-200/60 shadow-2xs">
            <button
              type="button"
              onClick={() =>
                requireVerified('Credit/Debit Cards', () =>
                  setAccountSubScreen('cards')
                )
              }
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <CreditCard size={20} className="text-zinc-700" />
                <span className="text-sm font-medium text-zinc-900">
                  Credit/Debit Cards
                </span>
              </div>
              <ChevronRight size={18} className="text-zinc-400" />
            </button>
            <button
              type="button"
              onClick={() => setKycFlowModalOpen(true)}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <CheckCircle2
                  size={20}
                  className={isVerified ? 'text-emerald-600' : 'text-[#D91624]'}
                />
                <span className="text-sm font-medium text-zinc-900">
                  Identity Verification ({isVerified ? 'Verified' : 'Unverified — Tap to Verify'})
                </span>
              </div>
              <ChevronRight size={18} className="text-zinc-400" />
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-bold text-zinc-600 px-1">
              Manage account settings & connected services
            </h2>
            <div className="bg-white rounded-2xl divide-y divide-zinc-100 border border-zinc-200/60 shadow-2xs">
              <button
                type="button"
                onClick={() => setAccountSubScreen('security_checkup')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Shield size={20} className="text-emerald-600" />
                  <span className="text-sm font-medium text-zinc-900">
                    Security Checkup
                  </span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => setAccountSubScreen('device_management')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Smartphone size={20} className="text-zinc-700" />
                  <span className="text-sm font-medium text-zinc-900">
                    Device Management
                  </span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => setAccountSubScreen('privacy')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <SettingsIcon size={20} className="text-zinc-700" />
                  <span className="text-sm font-medium text-zinc-900">
                    Privacy & Permissions
                  </span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => setTheme(isLight ? 'dark' : 'light')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Link2 size={20} className="text-zinc-700" />
                  <span className="text-sm font-medium text-zinc-900">
                    Application Theme ({isLight ? 'Light' : 'Dark'})
                  </span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-bold text-zinc-600 px-1">General usage</h2>
            <div className="bg-white rounded-2xl divide-y divide-zinc-100 border border-zinc-200/60 shadow-2xs">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <HelpCircle size={20} className="text-zinc-700" />
                  <span className="text-sm font-medium text-zinc-900">How to Use</span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </div>
              <button
                type="button"
                onClick={() => setChatModalOpen(true)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <MessageSquare size={20} className="text-zinc-700" />
                  <span className="text-sm font-medium text-zinc-900">
                    Help & Support
                  </span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </button>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <Info size={20} className="text-zinc-700" />
                  <span className="text-sm font-medium text-zinc-900">
                    About Péthar
                  </span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-2xs">
            <button
              type="button"
              onClick={() => setShowSignOutModal(true)}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <LogOut size={20} className="text-zinc-700" />
                <span className="text-sm font-medium text-zinc-900">
                  {isAk ? 'အကောင့်မှ ထွက်ရန် (Sign Out)' : 'Sign Out'}
                </span>
              </div>
              <ChevronRight size={18} className="text-zinc-400" />
            </button>
          </div>
        </div>

        {showSignOutModal && (
          <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-5 animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-5 shadow-2xl">
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-zinc-900">
                  {isAk ? 'အကောင့်မှ ထွက်လိုပါသလား?' : 'Do you want to sign out?'}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {isAk
                    ? 'နောက်တစ်ကြိမ် ဝန်ဆောင်မှုများကို အသုံးပြုလိုသည့်အခါ အကောင့်ပြန်လည်ဝင်ရောက်ရပါမည်။'
                    : "The next time you want to use our services, you'll have to sign in again."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSignOutModal(false)}
                  className="py-3 rounded-full border border-[#D91624] text-[#D91624] font-bold text-sm hover:bg-[#D91624]/5 transition cursor-pointer"
                >
                  {isAk ? 'မထွက်ပါ' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSignOutModal(false)
                    setShowSplash(true)
                    setScreen('home')
                  }}
                  className="py-3 rounded-full bg-gradient-to-r from-[#FF2A38] to-[#D91624] text-white font-bold text-sm shadow-[0_6px_18px_rgba(217,22,36,0.35)] hover:brightness-105 transition cursor-pointer"
                >
                  {isAk ? 'ထွက်မည်' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (screen === 'scan') {
    return renderCameraScanScreen()
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return renderHomeScreen()
      case 'financial':
        return renderFinancialCryptoWalletScreen()
      case 'services':
        return (
          <div className="min-h-full bg-[#F4F5F8]">
            {renderTopLogoHeader()}
            <ServicesScreen
              go={(target) =>
                requireVerified(target.toUpperCase(), () => setScreen(target))
              }
              lang={lang}
              theme={theme}
            />
          </div>
        )
      case 'account':
      case 'settings':
        return renderAccountScreen()
      case 'send':
        return <Send go={setScreen} lang={lang} theme={theme} />
      case 'receive':
        return <Receive lang={lang} theme={theme} />
      case 'cashout':
        return <CashOut go={setScreen} lang={lang} theme={theme} />
      case 'notifications':
        return <NotificationsScreen lang={lang} theme={theme} />
      case 'intl':
        return <InternationalBanking lang={lang} theme={theme} />
      case 'crypto':
        return <CryptoGateway lang={lang} theme={theme} />
      case 'pos':
        return <POSTerminal lang={lang} theme={theme} />
      default:
        return renderHomeScreen()
    }
  }

  const isHomeActive = screen === 'home'
  const isFinancialActive = screen === 'financial'
  const isServicesActive = screen === 'services'
  const isAccountActive = screen === 'account' || screen === 'settings'

  const getTabClasses = (active: boolean) => {
    if (active) {
      return isLight
        ? 'bg-gradient-to-b from-[#D91624]/[0.14] to-[#D91624]/[0.06] text-[#D91624] border border-[#D91624]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_4px_12px_rgba(217,22,36,0.12)] font-extrabold'
        : 'bg-gradient-to-b from-[#D91624]/25 to-[#D91624]/10 text-[#FF3B47] border border-[#D91624]/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_14px_rgba(217,22,36,0.28)] font-extrabold'
    }
    return isLight
      ? 'text-zinc-800 hover:text-[#D91624] font-medium'
      : 'text-zinc-300 hover:text-white font-medium'
  }

  return (
    <div
      className={`min-h-screen w-full flex justify-center ${
        isLight ? 'bg-[#E2E8F0]' : 'bg-[#05070B]'
      }`}
    >
      <div
        className={`w-full max-w-[480px] min-h-screen flex flex-col relative shadow-2xl overflow-hidden ${
          isLight ? 'bg-[#F4F5F8] text-gray-900' : 'bg-[#090D14] text-white'
        }`}
      >
        {/* Sub-screen Back Bar */}
        {isSubScreen && (
          <div
            className={`px-4 py-2.5 flex items-center justify-between border-b shrink-0 ${
              isLight
                ? 'bg-white border-gray-200 text-gray-900'
                : 'bg-[#0E1522] border-white/10 text-white'
            }`}
          >
            <button
              type="button"
              onClick={() => setScreen('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#D91624]/12 text-[#D91624] hover:bg-[#D91624]/20 transition cursor-pointer"
            >
              <ChevronLeft size={15} />
              <span>{isAk ? 'ပင်မသို့' : 'Back to Wallet'}</span>
            </button>
            <img
              src="/pethar-logo-red-white.svg"
              alt="Péthar"
              className="w-6 h-6 object-contain"
            />
          </div>
        )}

        {/* Active Mobile Screen Content */}
        <div className="flex-1 overflow-y-auto pb-28">{renderScreen()}</div>

        {/* ═══════════════════════════════════════════════════════════════════
            CONVERT MODAL (1:1 USDT / USDC / USD1 <-> AKD)
           ═══════════════════════════════════════════════════════════════════ */}
        {convertModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setConvertModalOpen(false)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl text-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold">
                  {isAk ? 'ချက်ချင်း ငွေလဲလှယ်ရန် (Convert)' : 'Convert Stablecoins'}
                </h3>
                <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  1 : 1 Parity · 0% Fee
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <div className="text-zinc-400 font-semibold">From</div>
                    <input
                      type="number"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      className="mt-1 w-32 bg-transparent text-lg font-extrabold font-mono text-zinc-900 focus:outline-none"
                    />
                  </div>
                  <select
                    value={convertFromToken}
                    onChange={(e) =>
                      setConvertFromToken(e.target.value as 'USDT' | 'USDC' | 'USD1')
                    }
                    className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 font-extrabold text-zinc-900"
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                    <option value="USD1">USD1</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <div className="text-zinc-400 font-semibold">To (Receive)</div>
                    <div className="mt-1 text-lg font-extrabold font-mono text-emerald-600">
                      {convertAmount || '0.00'}
                    </div>
                  </div>
                  <select
                    value={convertToToken}
                    onChange={(e) =>
                      setConvertToToken(
                        e.target.value as 'AKD' | 'USDC' | 'USDT' | 'USD1'
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 font-extrabold text-zinc-900"
                  >
                    <option value="AKD">AKD (₳)</option>
                    <option value="USDC">USDC ($)</option>
                    <option value="USDT">USDT ($)</option>
                    <option value="USD1">USD1 ($)</option>
                  </select>
                </div>
              </div>

              {convertSuccessToast && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold text-center">
                  Converted {convertAmount} {convertFromToken} to {convertAmount}{' '}
                  {convertToToken}!
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setConvertModalOpen(false)}
                  className="py-2.5 rounded-full border border-zinc-300 text-xs font-bold text-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConvertSuccessToast(true)
                    setTimeout(() => {
                      setConvertSuccessToast(false)
                      setConvertModalOpen(false)
                    }, 1000)
                  }}
                  className="py-2.5 rounded-full bg-[#D91624] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Confirm Convert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TRANSFER MODAL (USD ACCOUNT <-> AKD WALLET)
           ═══════════════════════════════════════════════════════════════════ */}
        {transferModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setTransferModalOpen(false)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl text-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold">
                  {isAk ? 'အကောင့်အချင်းချင်း လွှဲပြောင်းရန်' : 'Transfer Funds'}
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setTransferDirection((d) =>
                      d === 'usd_to_akd' ? 'akd_to_usd' : 'usd_to_akd'
                    )
                  }
                  className="text-xs font-bold text-[#D91624] inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeftRight size={13} />
                  <span>Switch</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">From</span>
                  <span className="font-extrabold text-zinc-900">
                    {transferDirection === 'usd_to_akd'
                      ? 'USD Account ($)'
                      : 'AKD Main Wallet (₳)'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-200/70 pt-2">
                  <span className="text-zinc-400">To</span>
                  <span className="font-extrabold text-[#D91624]">
                    {transferDirection === 'usd_to_akd'
                      ? 'AKD Main Wallet (₳)'
                      : 'USD Account ($)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-semibold block mb-1">
                  Transfer Amount
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 text-base font-extrabold font-mono text-zinc-900 focus:outline-none"
                />
              </div>

              {transferSuccessToast && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold text-center">
                  Transferred {transferAmount} instant 1:1!
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="py-2.5 rounded-full border border-zinc-300 text-xs font-bold text-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const amt = parseFloat(transferAmount || '0')
                    if (amt > 0) {
                      if (transferDirection === 'usd_to_akd') {
                        setUsdAccountBalance((b) => Math.max(0, b - amt))
                        setAkdBalance((b) => b + amt)
                      } else {
                        setAkdBalance((b) => Math.max(0, b - amt))
                        setUsdAccountBalance((b) => b + amt)
                      }
                    }
                    setTransferSuccessToast(true)
                    setTimeout(() => {
                      setTransferSuccessToast(false)
                      setTransferModalOpen(false)
                    }, 900)
                  }}
                  className="py-2.5 rounded-full bg-[#D91624] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Transfer Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            LIVE SUPPORT CHAT MODAL (FROM TOP-RIGHT CHAT BUTTON)
           ═══════════════════════════════════════════════════════════════════ */}
        {chatModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setChatModalOpen(false)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl text-zinc-900 flex flex-col h-[420px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#D91624] to-[#B00E1A] text-white px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Headphones size={18} />
                  <div>
                    <div className="text-sm font-extrabold">Péthar Live Support</div>
                    <div className="text-[10px] text-white/80">24/7 Concierge</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChatModalOpen(false)}
                  className="text-white/85 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-zinc-50">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#D91624] text-white rounded-br-xs'
                          : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!chatInput.trim()) return
                  const userMsg = chatInput.trim()
                  setChatInput('')
                  setChatMessages((prev) => [
                    ...prev,
                    { sender: 'user', text: userMsg },
                    {
                      sender: 'bot',
                      text: 'Thank you! Our Péthar support specialist has received your message and is assisting you right away.',
                    },
                  ])
                }}
                className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isAk ? 'မက်ဆေ့ချ် ရိုက်ထည့်ပါ...' : 'Type a message...'}
                  className="flex-1 px-3.5 py-2 rounded-full bg-zinc-100 text-xs text-zinc-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-[#D91624] text-white flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <SendIcon size={14} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            VERIFICATION REQUIRED GATE MODAL (WHEN USER IS UNVERIFIED)
           ═══════════════════════════════════════════════════════════════════ */}
        {verifyPromptModal.open && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5 animate-in fade-in"
            onClick={() => setVerifyPromptModal({ open: false, featureName: '' })}
          >
            <div
              className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl text-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-[#FFF1F2] text-[#D91624] mx-auto flex items-center justify-center border border-[#FECDD3]">
                <AlertCircle size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-zinc-900">
                  {isAk
                    ? 'အကောင့် အတည်ပြုရန် လိုအပ်ပါသည်'
                    : 'Identity Verification Required'}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {isAk
                    ? `သင်၏ အကောင့်သည် အတည်မပြုရသေးပါ (Unverified)။ "${verifyPromptModal.featureName}" နှင့် ငွေကြေးလုပ်ဆောင်ချက်များကို အသုံးပြုရန် အကောင့်အတည်ပြုပေးပါ။`
                    : `Your account is currently Unverified. Please verify your identity to unlock "${verifyPromptModal.featureName}" and all wallet functions.`}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setVerifyPromptModal({ open: false, featureName: '' })
                  }
                  className="py-2.5 rounded-full border border-zinc-300 text-zinc-700 font-bold text-xs cursor-pointer"
                >
                  {isAk ? 'နောက်မှ' : 'Later'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVerifyPromptModal({ open: false, featureName: '' })
                    setKycFlowModalOpen(true)
                  }}
                  className="py-2.5 rounded-full bg-[#D91624] text-white font-bold text-xs shadow-[0_6px_16px_rgba(217,22,36,0.35)] cursor-pointer"
                >
                  {isAk ? 'ယခု အတည်ပြုမည်' : 'Verify Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KYC Identity Verification Modal */}
        {kycFlowModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5 animate-in fade-in"
            onClick={() => setKycFlowModalOpen(false)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-4 shadow-2xl text-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold">
                  {isAk ? 'အကောင့် အတည်ပြုချက် (KYC)' : 'Account Verification'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isVerified
                      ? 'bg-emerald-500/15 text-emerald-700'
                      : 'bg-rose-500/15 text-[#D91624]'
                  }`}
                >
                  {isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 font-bold text-zinc-900 focus:outline-none"
                  />
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <div className="font-bold text-zinc-800">
                    {SINGLE_WALLET_ACCOUNT.name}
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500">
                    {SINGLE_WALLET_ACCOUNT.fullAddress}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerified(false)
                    setKycFlowModalOpen(false)
                  }}
                  className="py-2.5 rounded-full border border-zinc-300 text-zinc-700 font-bold text-xs cursor-pointer"
                >
                  {isAk ? 'Unverified ထားမည်' : 'Set Unverified'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsVerified(true)
                    setKycFlowModalOpen(false)
                  }}
                  className="py-2.5 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  {isAk ? 'အတည်ပြုမည် (Verify)' : 'Complete Verify'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            LIQUID GLASS FLOATING PILL NAVBAR WITH RED EFFECT
            (Home | Financial [USD Account] | Scan | Services | Account)
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-3 z-40 pointer-events-none">
          <nav
            aria-label="Mobile Wallet Navigation"
            className={`pointer-events-auto relative h-[68px] px-2 rounded-full backdrop-blur-2xl saturate-180 border flex items-center justify-between transition-all duration-300 ${
              isLight
                ? 'bg-white/80 border-white/90 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.95),inset_0_-1px_2px_rgba(217,22,36,0.06),0_14px_34px_rgba(15,23,42,0.14)]'
                : 'bg-[#121620]/80 border-white/15 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.22),inset_0_-1px_2px_rgba(217,22,36,0.18),0_16px_40px_rgba(0,0,0,0.7)]'
            }`}
          >
            {/* 1. Home */}
            <button
              type="button"
              onClick={() => setScreen('home')}
              className={`flex-1 h-[54px] rounded-full flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-pointer select-none ${getTabClasses(
                isHomeActive
              )}`}
            >
              <NavHomeIcon active={isHomeActive} />
              <span className="text-[11px] leading-tight tracking-tight">
                {isAk ? 'ပင်မ' : 'Home'}
              </span>
            </button>

            {/* 2. Financial (USD Account) */}
            <button
              type="button"
              onClick={() => {
                setFinancialSubView('wallet_main')
                setScreen('financial')
              }}
              className={`flex-1 h-[54px] rounded-full flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-pointer select-none ${getTabClasses(
                isFinancialActive
              )}`}
            >
              <NavFinancialIcon active={isFinancialActive} />
              <span className="text-[11px] leading-tight tracking-tight">
                {isAk ? 'ဘဏ္ဍာရေး' : 'Financial'}
              </span>
            </button>

            {/* 3. Center Red Liquid Glass Scan Button */}
            <div className="px-1.5 flex items-center justify-center">
              <button
                type="button"
                onClick={() =>
                  requireVerified('QR Scanner', () => {
                    setScanBottomTab('scan')
                    setScreen('scan')
                  })
                }
                aria-label="Scan QR"
                className="w-[58px] h-[58px] rounded-full bg-gradient-to-b from-[#FF2A38] via-[#D91624] to-[#B00E1A] text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer border border-white/35 shadow-[inset_0_2px_2px_rgba(255,255,255,0.45),0_8px_22px_rgba(217,22,36,0.55)] hover:brightness-105"
              >
                <NavScanBracketIcon />
              </button>
            </div>

            {/* 4. Services */}
            <button
              type="button"
              onClick={() => setScreen('services')}
              className={`flex-1 h-[54px] rounded-full flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-pointer select-none ${getTabClasses(
                isServicesActive
              )}`}
            >
              <NavServicesIcon active={isServicesActive} />
              <span className="text-[11px] leading-tight tracking-tight">
                {isAk ? 'ဝန်ဆောင်မှု' : 'Services'}
              </span>
            </button>

            {/* 5. Account */}
            <button
              type="button"
              onClick={() => {
                setAccountSubScreen('main')
                setScreen('account')
              }}
              className={`flex-1 h-[54px] rounded-full flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-pointer select-none ${getTabClasses(
                isAccountActive
              )}`}
            >
              <NavAccountIcon active={isAccountActive} />
              <span className="text-[11px] leading-tight tracking-tight">
                {isAk ? 'အကောင့်' : 'Account'}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default MobileWalletPage
