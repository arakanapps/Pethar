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
  Settings as SettingsIcon,
  HelpCircle,
  MessageSquare,
  Info,
  LogOut,
  Power,
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
  AlertTriangle,
  CheckCircle2,
  Headphones,
  KeyRound,
  Lock,
  Send as SendIcon,
  QrCode,
  Landmark,
  Bell,
  Download,
  Filter,
  Camera,
  Pencil,
  Fingerprint,
  ShieldCheck,
  User,
  Search,
  X,
  Ticket,
  Bug,
  Trash2,
  Wifi,
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
import { initialUserProfile, wallets, contacts, type UserProfile, type Txn } from '../../data'
import {
  fetchTransactionsFromDb,
  insertTransactionToDb,
  fetchUserProfileFromDb,
  updateUserBalanceInDb,
  fetchFavoriteContactsFromDb,
  subscribeToTransactions,
} from '../../services/walletDatabase'
import type { Language } from '../../i18n'
import { WalletMinimalIcon } from '@/components/WalletMinimalIcon'

interface MobileWalletPageProps {
  lang: Language
  setLang?: (lang: Language) => void
}

type MobileTab = Screen | 'financial'
type AccountSubScreen =
  | 'main'
  | 'personal_info'
  | 'app_settings'
  | 'security_checkup'
  | 'device_management'
  | 'privacy'
  | 'cards'
type FinancialSubView =
  | 'wallet_main'
  | 'deposit'
  | 'withdraw'
  | 'tx_history'
  | 'spending'
  | 'wallet_security_phrase'

const DOCK_TABS: MobileTab[] = ['home', 'financial', 'scan', 'services', 'account', 'settings', 'receive']

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
    balance: 0.00,
    usdValue: 0.00,
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

const PROMO_ADS = [
  {
    id: 1,
    bgGradient: 'from-white to-rose-50/70',
    borderColor: 'border-rose-200/80',
    accentBg: 'bg-rose-100 text-[#D91624] border-rose-200',
    icon: SendIcon,
    titleEn: 'Péthar Zero-Fee Global Remittance',
    titleAk: 'ဖေ့သာ ၀% ဝန်ဆောင်ခ အထူးအစီအစဉ်',
    descEn: 'Instant transfers & zero network gas fees',
    descAk: 'နယ်စပ်ဖြတ်ကျော် ငွေလွှဲခမဲ့နှင့် လက်ငင်းလွှဲပို့ခြင်း',
  },
  {
    id: 2,
    bgGradient: 'from-white to-emerald-50/70',
    borderColor: 'border-emerald-200/80',
    accentBg: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    icon: Ticket,
    titleEn: 'Arakan Merchant 5% Cashback',
    titleAk: 'ကုန်သည်ဆိုင်များတွင် ၅% ပြန်အမ်းငွေ',
    descEn: 'Earn 5% cashback at verified partner merchants',
    descAk: 'အတည်ပြုစတိုးဆိုင်များတွင် QR ဖြင့် ပေးချေပါ',
  },
  {
    id: 3,
    bgGradient: 'from-white to-indigo-50/70',
    borderColor: 'border-indigo-200/80',
    accentBg: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    icon: Smartphone,
    titleEn: 'Péthar Offline Bearer eCash',
    titleAk: 'အင်တာနက်မလိုဘဲ ငွေသားကဲ့သို့ ပေးချေခြင်း',
    descEn: 'NFC & soundwave offline tap-to-pay anywhere',
    descAk: 'အသံလှိုင်းနှင့် NFC ဖြင့် အင်တာနက်မဲ့ သုံးစွဲနိုင်သည်',
  },
  {
    id: 4,
    bgGradient: 'from-white to-amber-50/70',
    borderColor: 'border-amber-200/80',
    accentBg: 'bg-amber-100 text-amber-600 border-amber-200',
    icon: ShieldCheck,
    titleEn: '100% Gold-Backed AKD Vault',
    titleAk: 'ရွှေအာမခံ ၁၀၀% အပြည့်ဖြင့် ထိန်းသိမ်းထားသော ငွေကြေး',
    descEn: 'Audited sovereign reserve backed 1:1 by physical gold',
    descAk: 'ရုပ်ပိုင်းဆိုင်ရာ ရွှေနှင့် ဒေါ်လာဖြင့် အပြည့်အဝ အာမခံထားသည်',
  },
]

export const MobileWalletPage: React.FC<MobileWalletPageProps> = ({ lang, setLang }) => {
  // 1. App Opening Splash Screen
  const [showSplash, setShowSplash] = useState<boolean>(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false)
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [])

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true)
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false)
  const [loginEmail, setLoginEmail] = useState<string>('')
  const [loginPassword, setLoginPassword] = useState<string>('')
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false)
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false)
  const [loginError, setLoginError] = useState<string>('')
  const [screen, setScreen] = useState<MobileTab>('home')
  const [theme] = useState<ThemeMode>('light')
  const [profile, setProfile] = useState<UserProfile>({
    ...initialUserProfile,
    name: 'User',
  })

  // Verification State: Verified vs Unverified + Verification Required Modal
  const [isVerified, setIsVerified] = useState<boolean>(true)
  const [verifyPromptModal, setVerifyPromptModal] = useState<{
    open: boolean
    featureName: string
  }>({ open: false, featureName: '' })
  const [kycFlowModalOpen, setKycFlowModalOpen] = useState<boolean>(false)

  // Support Chat Modal State (Intercom / Concierge Support Hub + Live Chat)
  const [chatModalOpen, setChatModalOpen] = useState<boolean>(false)
  const [supportView, setSupportView] = useState<'hub' | 'chat' | 'help'>('hub')
  const [supportTicketTopic, setSupportTicketTopic] = useState<string>('General Support')
  const [helpSearchQuery, setHelpSearchQuery] = useState<string>('')
  const [chatInput, setChatInput] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'bot' | 'user'; text: string }>
  >([
    {
      sender: 'bot',
      text: 'Hi there! Welcome to Péthar Support. Our AI Agent and team are here 24/7 — how can we help you today?',
    },
  ])

  // Home & Crypto Wallet Balance Visibility
  const [homeBalanceHidden, setHomeBalanceHidden] = useState<boolean>(false)
  const [walletBalanceHidden, setWalletBalanceHidden] = useState<boolean>(false)
  const [akdBalance, setAkdBalance] = useState<number>(0.00)
  const [usdAccountBalance, setUsdAccountBalance] = useState<number>(0.00)

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

  // Dedicated History Screen States
  const [historyTab, setHistoryTab] = useState<'all' | 'inflow' | 'outflow'>('all')
  const [historyMonth, setHistoryMonth] = useState<string>('October – 2026')
  const [selectedHistoryTx, setSelectedHistoryTx] = useState<{
    id: string
    title: string
    time: string
    amount: number
    type: 'bill' | 'transfer'
    category: string
    refNo: string
  } | null>(null)
  const [historyMonthModalOpen, setHistoryMonthModalOpen] = useState<boolean>(false)
  const [historyFilterModalOpen, setHistoryFilterModalOpen] = useState<boolean>(false)
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<'all' | 'transfer' | 'bill'>('all')
  const [historyExportToast, setHistoryExportToast] = useState<string | null>(null)

  // Live Database State from Supabase (avoids static file storage)
  const [liveTransactions, setLiveTransactions] = useState<Txn[]>([])

  useEffect(() => {
    let isMounted = true

    // 1. Fetch transactions from Supabase table
    fetchTransactionsFromDb().then((txs) => {
      if (isMounted && txs.length > 0) {
        setLiveTransactions(txs)
      }
    })

    // 2. Fetch live user profile & balance
    fetchUserProfileFromDb().then((up) => {
      if (isMounted && up) {
        setUsdAccountBalance(up.balance)
        setAkdBalance(up.balance)
        setProfile((prev) => ({
          ...prev,
          name: up.name,
          phone: up.phone,
          akId: up.ak_id,
        }))
      }
    })

    // 3. Fetch favorite contacts from Supabase table
    fetchFavoriteContactsFromDb().then((dbContacts) => {
      if (isMounted && dbContacts.length > 0) {
        setRecentPayContacts(
          dbContacts.map((c) => ({
            id: c.id,
            name: c.name,
            username: c.username,
            uid: c.uid,
            category: (c.category || 'friends') as any,
            initials: c.initials || c.name.slice(0, 2).toUpperCase(),
            avatarUrl: c.avatar_url || '',
          }))
        )
      }
    })

    // 4. Subscribe to Realtime Supabase changes
    const unsubscribe = subscribeToTransactions((newTx) => {
      if (isMounted) {
        setLiveTransactions((prev) => {
          if (prev.some((t) => t.id === newTx.id || t.refId === newTx.refId)) {
            return prev
          }
          return [newTx, ...prev]
        })
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

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

  // Pay Interface (Picture 1 & Picture 2 Layout) States
  const [payStep, setPayStep] = useState<'input' | 'detail' | 'success'>('input')
  const [payRecipient, setPayRecipient] = useState({
    id: 'REC-1',
    name: 'Zaw Myo Htet',
    username: '@zawmyo',
    uid: '882194012345',
    category: 'family' as 'family' | 'friends' | 'other',
    initials: 'ZH',
    avatarUrl: '',
  })
  const [payToInput, setPayToInput] = useState<string>('')
  const [payAmount, setPayAmount] = useState<string>('')
  const [payNote, setPayNote] = useState<string>('')
  const [payCategoryTab, setPayCategoryTab] = useState<'all' | 'family' | 'friends' | 'other'>('all')
  const [paySearchQuery, setPaySearchQuery] = useState<string>('')
  const [payDeleteMode, setPayDeleteMode] = useState<boolean>(false)
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % PROMO_ADS.length)
    }, 4000)
    return () => window.clearInterval(timer)
  }, [])

  const [recentPayContacts, setRecentPayContacts] = useState([
    { id: 'REC-1', name: 'Zaw Myo Htet', username: '@zawmyo', uid: '882194012345', category: 'family' as const, initials: 'ZH', avatarUrl: '' },
    { id: 'REC-2', name: 'Ko Min Aung', username: '@minaung', uid: '198273560912', category: 'friends' as const, initials: 'MA', avatarUrl: '' },
    { id: 'REC-3', name: 'Ma Hnin Nu', username: '@hninnu', uid: '440211987654', category: 'friends' as const, initials: 'HN', avatarUrl: '' },
    { id: 'REC-4', name: 'Daw Saw Mya', username: '@sawmya', uid: '771902345678', category: 'family' as const, initials: 'SM', avatarUrl: '' },
    { id: 'REC-5', name: 'U Ba Thein', username: '@bathein', uid: '550182390124', category: 'other' as const, initials: 'BT', avatarUrl: '' },
    { id: 'REC-6', name: 'Ko Kyaw Sein', username: '@kyawsein', uid: '330549123456', category: 'other' as const, initials: 'KS', avatarUrl: '' },
  ])
  const [paySuccessTx, setPaySuccessTx] = useState<Txn | null>(null)

  // Topup screen states
  const [topupPhone, setTopupPhone] = useState<string>('09795220917')
  const [topupActiveTab, setTopupActiveTab] = useState<'phoneTopup' | 'packages'>('phoneTopup')
  const [topupHeaderStyle, setTopupHeaderStyle] = useState<'crossborder' | 'royalBlue'>('crossborder')
  const [topupSelectedCategory, setTopupSelectedCategory] = useState<string>('All')
  const [topupSelectedAmount, setTopupSelectedAmount] = useState<number>(500)
  const [topupSelectedPackageId, setTopupSelectedPackageId] = useState<string>('pkg_1')
  const [topupContactsModalOpen, setTopupContactsModalOpen] = useState<boolean>(false)
  const [topupReviewModalOpen, setTopupReviewModalOpen] = useState<boolean>(false)
  const [topupSuccessModalOpen, setTopupSuccessModalOpen] = useState<boolean>(false)
  const [topupLastSuccessInfo, setTopupLastSuccessInfo] = useState<{
    phone: string
    operator: string
    title: string
    thb: number
    akd: number
  } | null>(null)

  // Bill payment states (Screenshots 1, 2, 3)
  const [billsRegion, setBillsRegion] = useState<'myanmar' | 'thailand'>('myanmar')
  const [billsSearchQuery, setBillsSearchQuery] = useState<string>('')
  const [billsDismissBanner, setBillsDismissBanner] = useState<boolean>(false)
  const [selectedBiller, setSelectedBiller] = useState<{
    id: string
    name: string
    category: string
    section?: string
    defaultAccount: string
    accountLabel: string
    defaultAmountMmk: number
    defaultAmountThb: number
    primaryColor: string
    initials: string
    hasKyoPhyae?: boolean
  } | null>(null)
  const [billerAccountInput, setBillerAccountInput] = useState<string>('')
  const [isBillFetched, setIsBillFetched] = useState<boolean>(false)
  const [billsSuccessModalOpen, setBillsSuccessModalOpen] = useState<boolean>(false)
  const [lastBillSuccess, setLastBillSuccess] = useState<{
    billerName: string
    accountNo: string
    amountMmk: number
    amountThb: number
    amountAkd: number
    refId: string
  } | null>(null)

  // Favourites Management States
  const [favouriteList, setFavouriteList] = useState<Array<{
    id: string
    name: string
    fullName: string
    mm: string
    phone: string
    initials: string
    bg: string
    bank: string
    category: 'Personal' | 'Family' | 'Friends' | 'Business'
  }>>([
    {
      id: 'ARAK-1024',
      name: 'user',
      fullName: 'user',
      mm: 'အသုံးပြုသူ',
      phone: '09795220917',
      initials: 'U',
      bg: 'from-[#38BDF8] to-[#0284C7]',
      bank: 'Péthar Wallet',
      category: 'Personal',
    },
    {
      id: 'ARAK-8891',
      name: 'User',
      fullName: 'User',
      mm: 'မြတ်စိုး',
      phone: '09951234567',
      initials: 'MS',
      bg: 'from-blue-500 to-indigo-600',
      bank: 'KBZPay',
      category: 'Family',
    },
    {
      id: 'ARAK-9921',
      name: 'TONY',
      fullName: 'Tony',
      mm: 'တိုနီ',
      phone: '09781122334',
      initials: 'TN',
      bg: 'from-emerald-500 to-teal-600',
      bank: 'Wave Money',
      category: 'Friends',
    },
    {
      id: 'ARAK-5501',
      name: 'CIMB WIRE',
      fullName: 'CIMB Wire',
      mm: 'စီအိုင်အမ်ဘီ',
      phone: '+66 81 234 5678',
      initials: 'CB',
      bg: 'from-rose-500 to-[#D91624]',
      bank: 'CIMB Bank',
      category: 'Business',
    },
    {
      id: 'ARAK-3305',
      name: 'KO MIN AUNG',
      fullName: 'Ko Min Aung',
      mm: 'မင်းအောင်',
      phone: '09440112233',
      initials: 'MA',
      bg: 'from-amber-500 to-orange-600',
      bank: 'AYA Pay',
      category: 'Business',
    },
  ])

  const [favSearchQuery, setFavSearchQuery] = useState<string>('')
  const [favCategoryFilter, setFavCategoryFilter] = useState<string>('All')
  const [favPinModalOpen, setFavPinModalOpen] = useState<boolean>(false)
  const [favPinAction, setFavPinAction] = useState<{
    title: string
    description: string
    onConfirm: () => void
  } | null>(null)
  const [favPinInput, setFavPinInput] = useState<string>('')
  const [favPinError, setFavPinError] = useState<string>('')
  const [favSuccessToast, setFavSuccessToast] = useState<string>('')

  const [favEditModalOpen, setFavEditModalOpen] = useState<boolean>(false)
  const [editingFavIndex, setEditingFavIndex] = useState<number | null>(null)
  const [favFormName, setFavFormName] = useState<string>('')
  const [favFormMm, setFavFormMm] = useState<string>('')
  const [favFormPhone, setFavFormPhone] = useState<string>('')
  const [favFormBank, setFavFormBank] = useState<string>('Péthar Wallet')
  const [favFormCategory, setFavFormCategory] = useState<'Personal' | 'Family' | 'Friends' | 'Business'>('Friends')
  const [favFormBg, setFavFormBg] = useState<string>('from-blue-500 to-indigo-600')

  const [favDeleteTarget, setFavDeleteTarget] = useState<{ contact: any; index: number } | null>(null)

  // Account & Privacy / Security / Device Management / Sign Out States
  const [accountSubScreen, setAccountSubScreen] = useState<AccountSubScreen>('main')
  const [showSignOutModal, setShowSignOutModal] = useState<boolean>(false)
  const [showQuitAppModal, setShowQuitAppModal] = useState<boolean>(false)
  const [hideInfoToggle, setHideInfoToggle] = useState<boolean>(true)
  const [showReceivingProfileToggle, setShowReceivingProfileToggle] = useState<boolean>(true)
  const [biometricConsentToggle, setBiometricConsentToggle] = useState<boolean>(true)
  const [photosAccessAllowed, setPhotosAccessAllowed] = useState<boolean>(true)
  const [showAllProfileInfo, setShowAllProfileInfo] = useState<boolean>(true)
  const [passportEditModalOpen, setPassportEditModalOpen] = useState<boolean>(false)
  const [addressEditModalOpen, setAddressEditModalOpen] = useState<boolean>(false)
  const [autoSaveReceipt, setAutoSaveReceipt] = useState<boolean>(true)
  const [faceIdEnabled, setFaceIdEnabled] = useState<boolean>(true)
  const [biometricLoginEnabled, setBiometricLoginEnabled] = useState<boolean>(true)
  const [settingsNoticeToast, setSettingsNoticeToast] = useState<string | null>(null)
  const [profileDetails] = useState({
    firstName: 'Firstname',
    lastName: 'Lastname',
    passportNumber: '123456789',
    dob: '13 May 2003',
    mobile: '095-126-8295',
    email: 'example@email.com',
  })
  const [profileAddress, setProfileAddress] = useState({
    subdistrict: 'Sittwe',
    street: 'Building C,A Rd',
  })

  const triggerSettingsToast = (msg: string) => {
    setSettingsNoticeToast(msg)
    window.setTimeout(() => setSettingsNoticeToast(null), 2400)
  }

  const isLight = theme === 'light'
  const isAk = lang === 'ak'
  const isSubScreen = !DOCK_TABS.includes(screen)

  // Guard helper: if user is logged out, open Sign in/Sign up modal; if Unverified, tell them to verify
  const requireVerified = (featureName: string, action: () => void) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }
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
              videoRef.current.play().catch(() => { })
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
      return liveTransactions.filter((tx) => tx.category === 'p2p' || tx.category === 'crypto')
    }
    if (historyCategoryTab === 'qr_pay') {
      return liveTransactions.filter((tx) => tx.category === 'pos')
    }
    return liveTransactions
  }, [historyCategoryTab, liveTransactions])

  /* ═══════════════════════════════════════════════════════════════════════════
     1. OPENING SPLASH SCREEN WITH PÉTHAR LOGO
  ═══════════════════════════════════════════════════════════════════════════ */
  if (showSplash) {
    return (
      <div
        onClick={() => setShowSplash(false)}
        className="min-h-screen w-full flex justify-center bg-[#E2E8F0] select-none cursor-pointer"
      >
        <div className="w-full max-w-[480px] min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="flex flex-col items-center justify-center space-y-4 px-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-28 h-28 flex items-center justify-center">
              <img
                src="/pethar-logo-red-white.svg"
                alt="Péthar Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="text-4xl font-black text-[#D91624]">Péthar</span>
              <span className="text-4xl font-light text-zinc-900 ml-1">wallet</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderWelcomeSignInCard = () => (
    <div className="bg-white rounded-[28px] p-6 shadow-[0_12px_32px_rgba(15,23,42,0.06)] border border-zinc-100 text-center space-y-4">
      <div className="space-y-1.5">
        <h2 className="text-lg font-extrabold text-zinc-900">
          {isAk ? 'ဖေ့သာမှ ကြိုဆိုပါသည်' : 'Welcome to Péthar'}
        </h2>
        <p className="text-xs text-zinc-500">
          {isAk
            ? 'အက်ပ်ကို အသုံးပြုရန် အကောင့်ဝင်ပါ သို့မဟုတ် အကောင့်သစ်ဖွင့်ပါ။'
            : 'Please sign in or sign up to use the app.'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setAuthModalOpen(true)}
        className="px-7 py-2.5 rounded-full bg-[#D91624] hover:bg-[#B8121E] text-white font-bold text-sm shadow-[0_6px_18px_rgba(217,22,36,0.3)] active:scale-95 transition cursor-pointer"
      >
        {isAk ? 'အကောင့်ဝင်ရန် / အကောင့်ဖွင့်ရန်' : 'Sign in/Sign up'}
      </button>
    </div>
  )

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
        icon: () => <WalletMinimalIcon size={21} color="#000000" className="text-black" />,
        action: () =>
          requireVerified(isAk ? 'ငွေပေးချေရန် (Pay)' : 'Pay', () => {
            setPayStep('input')
            setScreen('pay')
          }),
      },
      {
        id: 'receive',
        label: isAk ? 'ငွေလက်ခံ' : 'Receive',
        icon: () => <QrCode size={21} className="text-[#D91624]" />,
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
            <Landmark size={20} className="text-[#D91624]" />
            <ArrowDown
              size={10}
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
            <Landmark size={20} className="text-[#D91624]" />
            <ArrowUp
              size={10}
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

    const secondaryActions = [
      {
        id: 'topup',
        label: isAk ? 'ငွေဖြည့်' : 'Topup',
        icon: () => <Plus size={22} className="text-[#D91624]" strokeWidth={2.4} />,
        action: () =>
          requireVerified(isAk ? 'ငွေဖြည့်ရန် (Topup)' : 'Topup', () =>
            setScreen('topup')
          ),
      },
      {
        id: 'bill_payment',
        label: isAk ? 'ဘေလ်ဆောင်' : 'Bill payment',
        icon: () => <FileText size={20} className="text-[#D91624]" strokeWidth={2.2} />,
        action: () =>
          requireVerified(isAk ? 'ဘေလ်ဆောင်ရန် (Bill payment)' : 'Bill payment', () =>
            setScreen('bills')
          ),
      },
      {
        id: 'account',
        label: isAk ? 'ငွေစာရင်း' : 'Account',
        icon: () => <AppWindow size={20} className="text-[#D91624]" strokeWidth={2.2} />,
        action: () => {
          setAccountSubScreen('cards')
          setScreen('account')
        },
      },
      {
        id: 'history',
        label: isAk ? 'မှတ်တမ်း' : 'History',
        icon: () => <Clock size={20} className="text-[#D91624]" strokeWidth={2.2} />,
        action: () => {
          setScreen('history')
        },
      },
    ]

    const favouriteUsers = favouriteList

    return (
      <div className="min-h-full bg-gradient-to-b from-[#FFF5F5] via-[#F8FAFC] to-[#F4F6F9] text-zinc-900 pb-10">
        {/* 1. TOP HEADER BAR: (User Photo) | (App Logo) | (Noti Bell) | (Logout & Close) */}
        <div className="px-4 pt-3.5 pb-2 relative flex items-center justify-between">
          {/* Left: Circular User Photo */}
          <button
            type="button"
            onClick={() => {
              setAccountSubScreen('main')
              setScreen('account')
            }}
            aria-label="User Profile Photo"
            title={profile.name || 'User Profile'}
            className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#D91624]/30 bg-white shadow-xs flex items-center justify-center active:scale-95 transition cursor-pointer shrink-0 z-10"
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white font-black text-sm">
                {profile.name ? profile.name.charAt(0).toUpperCase() : <User size={18} />}
              </div>
            )}
          </button>

          {/* Center: App Logo */}
          <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
            <button
              type="button"
              onClick={() => setScreen('home')}
              aria-label="Péthar App Logo"
              className="pointer-events-auto w-10 h-10 flex items-center justify-center active:scale-95 transition cursor-pointer bg-transparent border-0 shadow-none hover:bg-transparent"
            >
              <img
                src="/pethar-logo-red-white.svg"
                alt="Péthar"
                className="w-full h-full object-contain"
              />
            </button>
          </div>

          {/* Right: (Noti Bell) + (Logout and Close) */}
          <div className="flex items-center gap-2 shrink-0 z-10">
            <button
              type="button"
              onClick={() => setScreen('notifications')}
              aria-label="Notifications"
              title={isAk ? 'အသိပေးချက်များ' : 'Notifications'}
              className="relative w-10 h-10 rounded-full bg-white shadow-xs border border-zinc-200/80 flex items-center justify-center text-zinc-700 hover:border-[#D91624]/40 hover:text-[#D91624] active:scale-95 transition cursor-pointer"
            >
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D91624] text-white text-[9px] font-black flex items-center justify-center border border-white">
                2
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowQuitAppModal(true)}
              aria-label="Quit app"
              title={isAk ? 'အက်ပ်မှ ထွက်ရန်' : 'Quit App'}
              className="w-10 h-10 rounded-full bg-white shadow-xs border border-zinc-200/80 hover:border-[#D91624]/40 hover:bg-[#FFF1F2] text-zinc-700 hover:text-[#D91624] flex items-center justify-center active:scale-95 transition cursor-pointer"
            >
              <Power size={17} className="text-[#D91624]" />
            </button>
          </div>
        </div>

        <div className="px-4 pt-2 space-y-3.5">
          {/* 2. WELCOME BACK CARD: Welcome back + User name (left) | Verified badge (right) */}
          {isAuthenticated ? (
            <>
              <div className="bg-white rounded-[22px] px-4 py-3.5 shadow-[0_6px_20px_rgba(15,23,42,0.04)] border border-zinc-200/80 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-zinc-500 font-semibold">
                    {isAk ? 'ပြန်လည်ကြိုဆိုပါသည်' : 'Welcome back'}
                  </div>
                  <div className="text-base font-extrabold text-zinc-900 truncate mt-0.5">
                    {profile.name}
                  </div>
                </div>

                {isVerified ? (
                  <button
                    type="button"
                    onClick={() => setKycFlowModalOpen(true)}
                    className="px-4 py-1.5 rounded-full border border-[#0284C7]/50 bg-[#F0F9FF] text-[#0284C7] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <CheckCircle2 size={15} className="fill-[#0284C7] text-white" />
                    <span>{isAk ? 'အတည်ပြုပြီး' : 'Verified'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setKycFlowModalOpen(true)}
                    className="px-4 py-1.5 rounded-full border border-[#D91624] bg-[#FFF1F2] text-[#D91624] text-xs font-extrabold inline-flex items-center gap-1.5 shrink-0 shadow-[0_4px_12px_rgba(217,22,36,0.18)] animate-pulse cursor-pointer"
                  >
                    <AlertCircle size={15} />
                    <span>{isAk ? 'အတည်မပြုရသေး' : 'Unverified'}</span>
                  </button>
                )}
              </div>

              {!isVerified && (
                <div className="p-3 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={17} className="text-[#D91624] shrink-0 mt-0.5" />
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
            </>
          ) : (
            renderWelcomeSignInCard()
          )}

          {/* 3. PRIMARY 4-ACTION BOX: (Pay) | (Receive) | (Deposit) | (Withdraw) */}
          <div className="bg-white rounded-[22px] px-3 py-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] border border-zinc-200/80">
            <div className="grid grid-cols-4 gap-2">
              {homeCoreActions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="flex flex-col items-center gap-2 group active:scale-95 transition cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FFF1F2] border border-[#FECDD3]/80 flex items-center justify-center shadow-2xs group-hover:bg-[#FFE4E6] transition">
                    {item.icon()}
                  </div>
                  <span className="text-xs font-bold text-zinc-900 leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. WALLET BALANCE BOX: Wallet Balance (AKD) + Eye Icon | ₳ 0.00 */}
          <div className="bg-white rounded-[22px] px-4 py-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] border border-zinc-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                <span>
                  {isAk ? 'ပိုက်ဆံအိတ် လက်ကျန်ငွေ (AKD)' : 'Wallet Balance (AKD)'}
                </span>
                <button
                  type="button"
                  onClick={() => setHomeBalanceHidden((h) => !h)}
                  aria-label="Toggle Wallet Balance Visibility"
                  className="p-1 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
                >
                  {homeBalanceHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-baseline font-mono tracking-tight">
              {homeBalanceHidden ? (
                <span className="text-2xl font-black text-zinc-900 tracking-widest">
                  ••••••••
                </span>
              ) : (
                <>
                  <span className="text-2xl font-black text-[#D91624] mr-1.5">
                    ₳
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-zinc-950 tabular-nums">
                    {(isAuthenticated ? akdBalance : 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </>
              )}
            </div>

          </div>

          {/* 5. SECONDARY 4-SERVICE BOX: (+) Topup | (Bill) Bill payment | (Card) Account | (Clock) History */}
          <div className="bg-white rounded-[22px] px-3 py-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] border border-zinc-200/80">
            <div className="grid grid-cols-4 gap-2">
              {secondaryActions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="flex flex-col items-center gap-2 group active:scale-95 transition cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-zinc-50 border border-zinc-200/90 flex items-center justify-center shadow-2xs group-hover:border-[#D91624]/40 group-hover:bg-[#FFF1F2] transition">
                    {item.icon()}
                  </div>
                  <span className="text-[11px] font-bold text-zinc-800 text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 6. FAVOURITES SECTION: Favourites + view all | (User) user + (+) */}
          <div className="pt-0.5">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-extrabold text-zinc-800">
                {isAk ? 'စိတ်ကြိုက် လွှဲသူများ' : 'Favourites'}
              </span>
              <button
                type="button"
                onClick={() =>
                  requireVerified(isAk ? 'စိတ်ကြိုက် လွှဲသူများ' : 'Favourites', () => {
                    setScreen('favourites')
                  })
                }
                className="text-xs font-bold text-[#D91624] hover:underline cursor-pointer"
              >
                {isAk ? 'အားလုံးကြည့်ရန်' : 'view all'}
              </button>
            </div>

            <div className="flex items-start gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
              {favouriteUsers.map((fav) => (
                <button
                  key={fav.id}
                  type="button"
                  onClick={() =>
                    requireVerified(isAk ? 'ငွေပေးချေရန်' : 'Pay', () => {
                      const matchedRecent = recentPayContacts.find(
                        (c) => c.name.toLowerCase() === fav.name.toLowerCase()
                      )
                      const hash12 = (
                        Math.abs(
                          fav.name
                            .split('')
                            .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
                        ).toString() + '987654321000'
                      ).slice(0, 12)
                      setPayRecipient({
                        id: fav.id,
                        name: fav.name,
                        username: matchedRecent
                          ? matchedRecent.username
                          : `@${fav.name.toLowerCase().replace(/\s+/g, '_')}`,
                        uid: matchedRecent ? matchedRecent.uid : hash12,
                        category: 'friends',
                        initials: fav.initials,
                        avatarUrl: '',
                      })
                      setPayToInput(
                        matchedRecent
                          ? matchedRecent.username
                          : `@${fav.name.toLowerCase().replace(/\s+/g, '_')}`
                      )
                      setPayStep('detail')
                      setScreen('pay')
                    })
                  }
                  className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition cursor-pointer"
                >
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-b ${fav.bg} flex items-center justify-center text-white font-extrabold text-xs shadow-xs border-2 border-white`}
                  >
                    {fav.initials === 'U' ? <User size={18} /> : fav.initials}
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-700 max-w-[56px] truncate">
                    {fav.name}
                  </span>
                </button>
              ))}

              {/* Add (+) Favourite Button -> Go to Favourites */}
              <button
                type="button"
                onClick={() =>
                  requireVerified(isAk ? 'စိတ်ကြိုက် လွှဲသူများ' : 'Favourites', () => {
                    setScreen('favourites')
                  })
                }
                aria-label="Add Favourite User"
                className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-white border-2 border-dashed border-zinc-300 group-hover:border-[#D91624] flex items-center justify-center text-zinc-600 group-hover:text-[#D91624] shadow-2xs transition">
                  <Plus size={18} strokeWidth={2.4} />
                </div>
                <span className="text-[11px] font-semibold text-zinc-500">
                  {isAk ? 'ထည့်ရန်' : 'Add'}
                </span>
              </button>
            </div>
          </div>

          {/* 7. 4 MOVING ADS BANNER CAROUSEL (NO "ADS" TEXT) */}
          <div className="space-y-2">
            <div
              className={`bg-gradient-to-r ${PROMO_ADS[currentAdIndex].bgGradient} rounded-[20px] p-3 text-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] border ${PROMO_ADS[currentAdIndex].borderColor} flex items-center justify-between gap-3 transition-all duration-500`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full ${PROMO_ADS[currentAdIndex].accentBg} border flex items-center justify-center shrink-0`}
                >
                  {React.createElement(PROMO_ADS[currentAdIndex].icon, {
                    size: 18,
                    strokeWidth: 2.2,
                  })}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 truncate">
                    {isAk
                      ? PROMO_ADS[currentAdIndex].titleAk
                      : PROMO_ADS[currentAdIndex].titleEn}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {isAk
                      ? PROMO_ADS[currentAdIndex].descAk
                      : PROMO_ADS[currentAdIndex].descEn}
                  </div>
                </div>
              </div>
            </div>

            {/* Indicator Dots for 4 Moving Ads */}
            <div className="flex items-center justify-center gap-1.5 py-0.5">
              {PROMO_ADS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentAdIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentAdIndex ? 'w-5 bg-[#D91624]' : 'w-1.5 bg-zinc-300'
                    }`}
                  aria-label={`Slide ${idx + 1}`}
                />
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
                  className={`grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-50 border border-zinc-200 transition ${phraseRevealed ? '' : 'blur-sm select-none'
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
                  className={`w-12 h-7 rounded-full p-0.5 transition cursor-pointer ${autoLockWallet ? 'bg-[#D91624]' : 'bg-zinc-300'
                    }`}
                >
                  <span
                    className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${autoLockWallet ? 'translate-x-5' : 'translate-x-0'
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
                  className={`w-12 h-7 rounded-full p-0.5 transition cursor-pointer ${biometricSigning ? 'bg-[#D91624]' : 'bg-zinc-300'
                    }`}
                >
                  <span
                    className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${biometricSigning ? 'translate-x-5' : 'translate-x-0'
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
                  className={`w-12 h-7 rounded-full p-0.5 transition cursor-pointer ${hideInfoToggle ? 'bg-[#D91624]' : 'bg-zinc-300'
                    }`}
                >
                  <span
                    className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${hideInfoToggle ? 'translate-x-5' : 'translate-x-0'
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
                      className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer ${t.symbol === selectedDepositToken
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
                  <div className="w-8 h-8 rounded-full bg-[#D91624] text-white flex items-center justify-center font-black text-sm shadow-xs">
                    $
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
                    className={`pb-2.5 border-b-2 transition cursor-pointer ${withdrawTab === 'your_account'
                      ? 'border-[#D91624] text-[#D91624]'
                      : 'border-transparent text-zinc-500'
                      }`}
                  >
                    Your Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawTab('contacts')}
                    className={`pb-2.5 border-b-2 transition cursor-pointer ${withdrawTab === 'contacts'
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

    // SUB-VIEW C: TRANSACTION HISTORY (Redirect to dedicated standalone History Screen)
    if (financialSubView === 'tx_history') {
      return renderHistoryScreen()
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
                className={`py-2 rounded-full text-xs font-bold cursor-pointer ${isWeekly ? 'bg-white text-[#D91624] shadow-xs' : 'text-zinc-500'
                  }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setSpendingPeriod('monthly')}
                className={`py-2 rounded-full text-xs font-bold cursor-pointer ${!isWeekly ? 'bg-white text-[#D91624] shadow-xs' : 'text-zinc-500'
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
        <div className="px-4 pt-5 space-y-5">
          {/* USD Account Header Row:
              - Left: USD symbol ($) + "USD Account" (NO "USD-Backed" text, NO top logo on non-Home pages)
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

            {/* Total USD Account Balance or Logged-Out Welcome Prompt */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`font-black font-mono text-zinc-950 tracking-tight truncate ${
                    walletBalanceHidden
                      ? 'text-3xl'
                      : usdAccountBalance >= 1_000_000_000
                      ? 'text-xl sm:text-2xl'
                      : usdAccountBalance >= 1_000_000
                      ? 'text-2xl'
                      : 'text-3xl'
                  }`}
                  title={
                    walletBalanceHidden
                      ? undefined
                      : `$${usdAccountBalance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                  }
                >
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
                  className="text-zinc-400 hover:text-zinc-700 cursor-pointer shrink-0"
                >
                  {walletBalanceHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            ) : (
              <div className="py-2 text-center space-y-3 border-y border-zinc-100">
                <div className="space-y-1">
                  <div className="text-base font-extrabold text-zinc-900">
                    {isAk ? 'ဖေ့သာမှ ကြိုဆိုပါသည်' : 'Welcome to Péthar'}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {isAk
                      ? 'အက်ပ်ကို အသုံးပြုရန် အကောင့်ဝင်ပါ သို့မဟုတ် အကောင့်သစ်ဖွင့်ပါ။'
                      : 'Please sign in or sign up to use the app.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-2 rounded-full bg-[#D91624] hover:bg-[#B8121E] text-white font-bold text-xs shadow-[0_6px_18px_rgba(217,22,36,0.28)] active:scale-95 transition cursor-pointer"
                >
                  {isAk ? 'အကောင့်ဝင်ရန် / အကောင့်ဖွင့်ရန်' : 'Sign in/Sign up'}
                </button>
              </div>
            )}

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
                    className={`pb-2.5 border-b-2 transition cursor-pointer ${walletTab === t.id
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
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${historyCategoryTab === f.id
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
                          className={`text-xs font-extrabold font-mono ${isPos ? 'text-emerald-600' : 'text-zinc-900'
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
     3. CAMERA SCAN SCREEN (SCAN QR / BARCODE OR SELECT FROM GALLERY)
  ═══════════════════════════════════════════════════════════════════════════ */
  const renderCameraScanScreen = () => {
    const usernameHandle = `@${profile.name.toLowerCase().replace(/\s+/g, '') || 'username'}`
    const uidNumber = '000000000000'

    const handleShareMyQr = async () => {
      const shareData = {
        title: 'Péthar Receive QR',
        text: `${profile.name} (${usernameHandle}) · UID: ${uidNumber}`,
        url: `pethar://pay?uid=${uidNumber}&user=${usernameHandle}&curr=AKD`,
      }
      try {
        if (navigator.share) await navigator.share(shareData)
        else await navigator.clipboard?.writeText(shareData.text)
      } catch {
        // Share sheet cancelled
      }
      triggerSettingsToast(isAk ? 'မျှဝေရန် ကူးယူပြီးပါပြီ' : 'Copied Receive QR link to share')
    }

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
                className={`absolute inset-0 w-full h-full object-cover ${cameraReady ? 'opacity-100' : 'opacity-0'
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

                <span className="text-base font-extrabold tracking-wide drop-shadow">
                  Scan/MyQR
                </span>

                <button
                  type="button"
                  onClick={handleToggleFlash}
                  aria-label="Toggle Flashlight"
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer ${flashOn
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
                          const zawMyo = recentPayContacts.find((c) => c.uid.includes('882194')) || recentPayContacts[0]
                          setPayRecipient(zawMyo)
                          setPayToInput(zawMyo.username)
                          setPayStep('detail')
                          setScreen('pay')
                        }}
                        className="flex-1 py-2 rounded-full bg-[#D91624] text-white font-bold text-xs cursor-pointer"
                      >
                        {isAk ? 'ငွေပေးချေမည်' : 'Proceed to Pay'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative z-10 pb-7 px-6 flex flex-col items-center gap-3">
                <p className="text-xs sm:text-sm font-medium text-white drop-shadow text-center">
                  {isAk
                    ? 'QR ကုဒ် သို့မဟုတ် ဘားကုဒ်ကို ဘောင်အတွင်း ထားရှိပါ'
                    : 'Place recipient QR code within the frame.'}
                </p>

                {/* Instant Fetch Recipient QR & Go to Pay */}
                <button
                  type="button"
                  onClick={() => {
                    const zawMyo = recentPayContacts.find((c) => c.uid.includes('882194')) || recentPayContacts[0]
                    setPayRecipient(zawMyo)
                    setPayToInput(zawMyo.username)
                    setPayStep('detail')
                    setScreen('pay')
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF2A38] to-[#D91624] text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
                >
                  <SendIcon size={16} />
                  <span>{isAk ? 'QR ကုဒ်ဖတ်ပြီး ငွေလွှဲမည် (@zawmyo)' : 'Fetch Recipient QR (@zawmyo • 882194012345)'}</span>
                </button>

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
                  className="px-6 py-2.5 rounded-full bg-black/55 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg border border-white/15 transition active:scale-95 cursor-pointer"
                >
                  <ImageIcon size={16} />
                  <span>
                    {isAk ? 'ပုံပြခန်းမှ ရွေးချယ်ရန် (Select from Gallery)' : 'Select from Gallery'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-[#F4F5F8] text-zinc-900 flex flex-col overflow-y-auto">
              {/* Top Header: < | Scan/MyQR | Share */}
              <div className="bg-white px-4 pt-5 pb-3 flex items-center justify-between border-b border-zinc-200/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setScreen('home')}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-800 hover:bg-zinc-100 transition cursor-pointer"
                >
                  <ChevronLeft size={24} />
                </button>
                <span className="text-base font-extrabold tracking-tight text-zinc-900">
                  Scan/MyQR
                </span>
                <button
                  type="button"
                  onClick={handleShareMyQr}
                  className="px-3.5 py-1.5 rounded-full border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 inline-flex items-center gap-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
                >
                  <Share2 size={13} className="text-[#D91624]" />
                  <span>{isAk ? 'မျှဝေရန်' : 'Share'}</span>
                </button>
              </div>

              {/* Embedded Receive Function */}
              <div className="flex-1 flex flex-col">
                <Receive go={setScreen} lang={lang} profile={profile} embedded theme={theme} />
              </div>
            </div>
          )}

          {/* Bottom Toggle Bar: Scan | MyQR */}
          <div className="bg-white h-20 px-6 grid grid-cols-2 border-t border-zinc-200 shrink-0">
            <button
              type="button"
              onClick={() => setScanBottomTab('scan')}
              className="flex flex-col items-center justify-center gap-1 relative cursor-pointer"
            >
              <NavScanBracketIcon
                className={`w-6 h-6 ${scanBottomTab === 'scan' ? 'text-[#D91624]' : 'text-zinc-700'
                  }`}
              />
              <span
                className={`text-xs font-bold ${scanBottomTab === 'scan' ? 'text-[#D91624]' : 'text-zinc-800'
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
              <QrCode
                size={23}
                className={scanBottomTab === 'pay' ? 'text-[#D91624]' : 'text-zinc-700'}
              />
              <span
                className={`text-xs font-bold ${scanBottomTab === 'pay' ? 'text-[#D91624]' : 'text-zinc-800'
                  }`}
              >
                MyQR
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
     4. PAY INTERFACE (Picture 1 & Picture 2 Layouts matching user wireframes)
  ═══════════════════════════════════════════════════════════════════════════ */
  const renderPayInterfaceScreen = () => {
    // Filter contacts based on active tab and search query
    const filteredContacts = recentPayContacts.filter((c) => {
      const matchesTab = payCategoryTab === 'all' || c.category === payCategoryTab
      const matchesSearch =
        c.name.toLowerCase().includes(paySearchQuery.toLowerCase()) ||
        c.username.toLowerCase().includes(paySearchQuery.toLowerCase())
      return matchesTab && matchesSearch
    })

    const handleSelectRecentUser = (contact: (typeof recentPayContacts)[0]) => {
      setPayRecipient(contact)
      setPayToInput(contact.username)
      setPayStep('detail')
    }

    const handleNextFromInput = () => {
      const trimmed = payToInput.trim()
      if (trimmed) {
        const clean = trimmed.replace(/\s+/g, '').toLowerCase()
        const match = recentPayContacts.find(
          (c) =>
            c.username.toLowerCase() === trimmed.toLowerCase() ||
            c.name.toLowerCase() === trimmed.toLowerCase() ||
            c.uid.replace(/\s+/g, '').toLowerCase() === clean ||
            c.username.toLowerCase() === `@${trimmed.toLowerCase()}`
        )
        if (match) {
          setPayRecipient(match)
        } else {
          const hash12 = (
            Math.abs(
              trimmed
                .split('')
                .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
            ).toString() + '102938475612'
          ).slice(0, 12)
          setPayRecipient({
            id: `USR-${hash12.slice(-4)}`,
            name: trimmed,
            username: trimmed.startsWith('@')
              ? trimmed
              : `@${trimmed.toLowerCase().replace(/\s+/g, '_')}`,
            uid: hash12,
            category: 'other',
            initials: trimmed.slice(0, 2).toUpperCase(),
            avatarUrl: '',
          })
        }
      } else if (recentPayContacts.length > 0) {
        setPayRecipient(recentPayContacts[0])
      }
      setPayStep('detail')
    }

    const handleExecutePay = () => {
      const amt = parseFloat(payAmount)
      if (isNaN(amt) || amt <= 0 || amt < 0.01) {
        triggerSettingsToast(isAk ? 'အနည်းဆုံး 0.01 AKD လွှဲရပါမည် (At least 0.01)' : 'Amount must be at least 0.01 AKD')
        return
      }
      if (amt > usdAccountBalance) {
        triggerSettingsToast(isAk ? 'လက်ကျန်ငွေထက် ကျော်လွန်နေပါသည် (Over balance)' : 'Over balance: Transfer amount exceeds available balance')
        return
      }
      if (!payNote.trim()) {
        triggerSettingsToast(isAk ? 'မှတ်ချက် ရေးရန် လိုအပ်ပါသည်' : 'Notes is mandatory')
        return
      }

      const nextBal = Math.max(0, usdAccountBalance - amt)
      setUsdAccountBalance(nextBal)
      setAkdBalance(nextBal)
      updateUserBalanceInDb(nextBal)

      const newTx: Txn = {
        id: `TX-PAY-${Date.now().toString().slice(-6)}`,
        refId: `ARAK-PAY-${Date.now().toString().slice(-6)}`,
        title: `Payment to ${payRecipient.name}`,
        titleMm: `${payRecipient.name} သို့ ငွေပေးချေခြင်း`,
        category: 'p2p',
        currency: 'AKD',
        time: 'Just now',
        status: 'SETTLED',
        counterparty: `${payRecipient.name} (${payRecipient.username})`,
        counterpartyMm: payRecipient.name,
        hash: `0x${Math.random().toString(16).slice(2, 10)}...pay`,
        amount: -amt,
        fee: 0.0,
      }
      setLiveTransactions((prev) => [newTx, ...prev])
      insertTransactionToDb(newTx)
      setPaySuccessTx(newTx)
      setPayStep('success')
    }

    const handleDeleteContact = (id: string) => {
      setRecentPayContacts((prev) => prev.filter((c) => c.id !== id))
    }

    const quickNoteChips = ['Salary', 'Payment', 'Bill', 'Family & Friends']

    // ── Payment Success Screen ──
    if (payStep === 'success' && paySuccessTx) {
      return (
        <div className="min-h-full bg-[#F4F5F8] flex flex-col text-zinc-900 pb-16">
          <div className="bg-white px-4 pt-5 pb-3.5 flex items-center justify-between border-b border-zinc-200">
            <button
              type="button"
              onClick={() => {
                setPayStep('input')
                setScreen('home')
              }}
              className="w-9 h-9 flex items-center justify-center text-zinc-800 cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-base font-bold text-zinc-900">
              {isAk ? 'ငွေပေးချေမှု အောင်မြင်သည်' : 'Payment Success'}
            </h1>
            <button
              type="button"
              onClick={() => setScreen('history')}
              className="px-3.5 py-1 rounded-full border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              History
            </button>
          </div>

          <div className="p-4 flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
            <div className="w-full bg-white rounded-3xl p-6 border border-zinc-200 shadow-md text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Payment Completed
                </span>
                <h2 className="text-2xl font-black font-mono text-zinc-900 mt-1">
                  ₳ {parseFloat(payAmount).toFixed(2)} AKD
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Paid to {payRecipient.name} ({payRecipient.username})
                </p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-3.5 border border-zinc-100 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Note</span>
                  <span className="font-semibold text-zinc-800">{payNote}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ref ID</span>
                  <span className="font-mono font-medium text-zinc-800">{paySuccessTx.refId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date</span>
                  <span className="text-zinc-800">Just now</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status</span>
                  <span className="font-bold text-emerald-600">SETTLED</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setPayAmount('')
                    setPayNote('')
                    setPayStep('input')
                    setScreen('home')
                  }}
                  className="w-full py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-zinc-800 transition cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPayStep('input')
                    setScreen('history')
                  }}
                  className="w-full py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition cursor-pointer"
                >
                  View in History
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // ── Screen 2: Amount & Pay Screen (Picture 2: media_1792312005578_2310f939.jpg) ──
    if (payStep === 'detail') {
      const parsedAmt = parseFloat(payAmount)
      const isPayOverBalance = !isNaN(parsedAmt) && parsedAmt > usdAccountBalance
      const isPayUnderMin = !isNaN(parsedAmt) && parsedAmt > 0 && parsedAmt < 0.01

      return (
        <div className="min-h-full bg-[#F4F5F8] flex flex-col text-zinc-900 pb-16">
          {/* Header matching Picture 2: Back (<) | Pay | History */}
          <div className="bg-white px-4 pt-5 pb-3.5 flex items-center justify-between border-b border-zinc-200/80 sticky top-0 z-20">
            <button
              type="button"
              onClick={() => setPayStep('input')}
              className="w-9 h-9 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-base font-extrabold text-zinc-900 tracking-tight">Pay</h1>
            <button
              type="button"
              onClick={() => {
                setFinancialSubView('tx_history')
                setScreen('financial')
              }}
              className="px-3.5 py-1 rounded-full border border-zinc-400 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
            >
              History
            </button>
          </div>

          <div className="p-4 space-y-4 max-w-md mx-auto w-full">
            {/* Recipient Profile Banner (User Pic + User Name + @username) */}
            <div className="flex flex-col items-center justify-center py-2 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md border-2 border-white mb-2 overflow-hidden">
                {payRecipient.avatarUrl ? (
                  <img src={payRecipient.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{payRecipient.initials || payRecipient.name.charAt(0)}</span>
                )}
              </div>
              <h2 className="text-base font-extrabold text-zinc-900 mt-1">{payRecipient.name}</h2>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10.5px] font-bold border border-emerald-200/60 mt-1">
                <CheckCircle2 size={11} className="text-emerald-600" />
                <span>Verified Recipient</span>
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-1">{payRecipient.username}</p>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">{payRecipient.uid}</p>
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-base font-bold font-mono text-zinc-900 focus:outline-none focus:border-black focus:bg-white"
                  />
                </div>
                <div className="flex items-center justify-between text-[11.5px] mt-1.5 font-medium">
                  <span className="text-zinc-500">
                    {isAk ? 'လက်ကျန်ငွေ' : 'Balance'}: {usdAccountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {isPayOverBalance ? (
                    <span className="text-red-600 font-extrabold flex items-center gap-1">
                      <AlertCircle size={12} />
                      {isAk ? 'လက်ကျန်ထက် ကျော်လွန်ပါသည်' : 'Over balance'}
                    </span>
                  ) : isPayUnderMin ? (
                    <span className="text-amber-600 font-extrabold flex items-center gap-1">
                      <AlertCircle size={12} />
                      {isAk ? 'အနည်းဆုံး 0.01' : 'At least 0.01'}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Add Notes (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Add Notes (Mandatory)
                </label>
                <input
                  type="text"
                  placeholder="Please Add Notes"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              {/* Quick Note Tag Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {quickNoteChips.map((chip) => {
                  const isActive = payNote === chip
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setPayNote(chip)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${isActive
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}
                    >
                      {chip}
                    </button>
                  )
                })}
              </div>

              {/* Over balance and Minimum amount alert banners */}
              {isPayOverBalance && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0 text-red-600" />
                  <span>
                    {isAk
                      ? 'လက်ကျန်ငွေထက် ကျော်လွန်နေပါသည် (Over balance)'
                      : 'Over balance: Amount exceeds available balance'}
                  </span>
                </div>
              )}
              {isPayUnderMin && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0 text-amber-600" />
                  <span>
                    {isAk
                      ? 'အနည်းဆုံး 0.01 AKD လွှဲရပါမည် (At least 0.01)'
                      : 'At least 0.01: Minimum transfer amount is 0.01 AKD'}
                  </span>
                </div>
              )}

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleExecutePay}
                disabled={!payAmount || parseFloat(payAmount) <= 0 || isPayOverBalance || isPayUnderMin || !payNote.trim()}
                className={`w-full py-3.5 rounded-xl ${isPayOverBalance
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-black hover:bg-zinc-800'
                  } disabled:opacity-40 text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer mt-2 flex items-center justify-center gap-2 group`}
              >
                <WalletMinimalIcon size={18} color="#FFFFFF" className="text-white shrink-0" />
                <span>
                  {isPayOverBalance
                    ? (isAk ? 'လက်ကျန်ထက် ကျော်လွန်ပါသည် (Over Balance)' : 'Over Balance')
                    : (isAk ? 'ငွေပေးချေမည်' : 'Pay')}
                </span>
              </button>
            </div>

            {/* Important Warning Box */}
            <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80 text-xs text-amber-950 space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs mb-1">
                <AlertTriangle size={14} className="text-amber-700" />
                <span>{isAk ? 'အရေးကြီး သတိပေးချက်' : 'Important Warning'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  {isAk
                    ? 'ငွေမလွှဲမီ လက်ခံသူ၏ 12-digit ID သာမက username နှင့် Name of user (အမည်) ကိုပါ သေချာစွာ စစ်ဆေးပါ။ အတည်ပြုပြီးသော ငွေလွှဲမှုများကို ပြန်လည်ဖျက်သိမ်း၍ မရပါ။'
                    : 'Verify not only the recipient\'s 12-digit ID, but also username and Name of user before sending. Transactions on Péthar cannot be reversed once confirmed.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  {isAk
                    ? 'လုံခြုံရေးစည်းမျဉ်းနှင့် စာရင်းစစ်မှတ်တမ်းများအတွက် မှတ်စု (Add Notes) ရေးသားရန် မဖြစ်မနေ လိုအပ်ပါသည်။'
                    : 'Adding a clear note is required for compliance, audit trails, and payment verification.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // ── Screen 1: Initial Pay Screen (Picture 1: media_1792311901292_26857504.jpg) ──
    return (
      <div className="min-h-full bg-[#F4F5F8] flex flex-col text-zinc-900 pb-20">
        {/* Header matching Picture 1: Back (<) | Pay | History */}
        <div className="bg-white px-4 pt-5 pb-3.5 flex items-center justify-between border-b border-zinc-200/80 sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setScreen('home')}
            className="w-9 h-9 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-base font-extrabold text-zinc-900 tracking-tight">Pay</h1>
          <button
            type="button"
            onClick={() => setScreen('history')}
            className="px-3.5 py-1 rounded-full border border-zinc-400 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
          >
            History
          </button>
        </div>

        <div className="p-4 space-y-4 max-w-md mx-auto w-full">
          {/* Section: From */}
          <div>
            <div className="text-xs font-bold text-zinc-600 px-1 mb-1.5">From</div>
            <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#29B6F6] to-[#0288D1] text-white font-extrabold text-sm flex items-center justify-center shadow-xs overflow-hidden border-2 border-white shrink-0">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-extrabold text-zinc-900 truncate">
                    {profile.name}
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-200/60">
                    <CheckCircle2 size={10} className="text-sky-600" />
                    <span>Verified</span>
                  </div>
                </div>
                <div className="text-xs text-zinc-500 font-medium mt-1">
                  Available balance:{' '}
                  <span className="font-mono font-bold text-zinc-900">
                    ₳ {usdAccountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: To */}
          <div>
            <div className="text-xs font-bold text-zinc-600 px-1 mb-1.5">To</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="enter 12-digit ID or username"
                value={payToInput}
                onChange={(e) => setPayToInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNextFromInput()
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-zinc-200 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black shadow-xs"
              />
              <button
                type="button"
                onClick={() => {
                  setScanBottomTab('scan')
                  setScreen('scan')
                }}
                className="px-3.5 py-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <QrCode size={16} />
                <span>Scan</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextFromInput}
              className="w-full mt-3 py-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              Next
            </button>
          </div>

          {/* Section: Recent Transfers */}
          <div className="pt-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-sm font-extrabold text-zinc-900">Recent Transfers</h3>
              <button
                type="button"
                onClick={() => setPayDeleteMode(!payDeleteMode)}
                className={`text-xs font-bold transition cursor-pointer ${payDeleteMode ? 'text-red-600' : 'text-zinc-500 hover:text-zinc-800'
                  }`}
              >
                {payDeleteMode ? 'Done' : 'Delete'}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-3 space-y-3">
              {/* Filter Tabs: All | Family | Friends | other */}
              <div className="flex items-center border-b border-zinc-100 pb-2">
                {(['all', 'family', 'friends', 'other'] as const).map((tab) => {
                  const isActive = payCategoryTab === tab
                  const label =
                    tab === 'all'
                      ? 'All'
                      : tab === 'family'
                        ? 'Family'
                        : tab === 'friends'
                          ? 'Friends'
                          : 'other'
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPayCategoryTab(tab)}
                      className={`px-3 py-1 text-xs font-bold transition relative cursor-pointer ${isActive
                        ? 'text-black'
                        : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                    >
                      {label}
                      {isActive && (
                        <span className="absolute bottom-[-9px] left-3 right-3 h-[2px] bg-black rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="search"
                  value={paySearchQuery}
                  onChange={(e) => setPaySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              {/* Contacts List */}
              <div className="divide-y divide-zinc-100 max-h-60 overflow-y-auto">
                {filteredContacts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-400">No transfers found</div>
                ) : (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="py-2.5 flex items-center justify-between hover:bg-zinc-50/80 rounded-xl px-2 transition group cursor-pointer"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectRecentUser(contact)}
                        className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                          {contact.avatarUrl ? (
                            <img src={contact.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{contact.initials}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-zinc-900 truncate">
                            {contact.name}
                          </div>
                          <div className="text-xs text-zinc-400 font-mono">
                            {contact.username} • {contact.uid}
                          </div>
                        </div>
                      </button>

                      {payDeleteMode ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectRecentUser(contact)}
                          className="p-1 text-zinc-400 group-hover:text-zinc-700 cursor-pointer"
                        >
                          <ChevronRight size={18} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     4.5. DEDICATED HISTORY SCREEN (MATCHING SPECIFIED SCREENSHOT)
  ═══════════════════════════════════════════════════════════════════════════ */
  const renderHistoryScreen = () => {
    // Dynamic history mapped directly from the app transactions database
    const historyData = liveTransactions.map((t, idx) => {
      const isBill =
        t.category.toLowerCase().includes('bill') ||
        t.title.toLowerCase().includes('bill') ||
        t.category.toLowerCase().includes('top')
      return {
        id: t.id || `tx_${idx}`,
        title: t.title,
        time: t.time || 'Today',
        amount: t.amount,
        type: isBill ? ('bill' as const) : ('transfer' as const),
        category: t.category,
        refNo: t.refId || t.id,
      }
    })

    const totalInflow = historyData.filter((i) => i.amount > 0).reduce((sum, i) => sum + i.amount, 0)
    const totalOutflow = historyData.filter((i) => i.amount < 0).reduce((sum, i) => sum + Math.abs(i.amount), 0)

    const filtered = historyData.filter((item) => {
      if (historyTab === 'inflow' && item.amount <= 0) return false
      if (historyTab === 'outflow' && item.amount >= 0) return false
      if (historyCategoryFilter !== 'all' && item.type !== historyCategoryFilter) return false
      return true
    })

    const formatAmount = (num: number) => {
      const formatted = Math.abs(num).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      return num > 0 ? `+${formatted}` : `–${formatted}`
    }

    return (
      <div className="min-h-full bg-[#F4F5F8] text-slate-900 flex flex-col pb-12">
        {/* Top App Bar: Clean White */}
        <div className="bg-white text-slate-900 border-b border-slate-200 px-4 pt-4 pb-3 flex items-center justify-between shadow-xs sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setScreen('home')}
            className="w-9 h-9 flex items-center justify-center text-slate-800 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <ChevronLeft size={26} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">History</h1>
          <div className="w-9" />
        </div>

        {/* Sub-header Tabs & Action Buttons (White Background) */}
        <div className="bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-[57px] z-20">
          {/* Tabs: All | Inflow | Outflow */}
          <div className="flex items-center space-x-6">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'inflow', label: 'Inflow' },
                { id: 'outflow', label: 'Outflow' },
              ] as const
            ).map((tab) => {
              const isActive = historyTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHistoryTab(tab.id)}
                  className="py-3 relative font-semibold text-[15px] cursor-pointer transition flex flex-col items-center"
                >
                  <span className={isActive ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 w-8 h-[3px] bg-[#9E1B32] rounded-full" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Right Action Icons: Filter | Calendar | Download */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setHistoryFilterModalOpen(true)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              title="Filter"
            >
              <Filter size={15} />
            </button>
            <button
              type="button"
              onClick={() => setHistoryMonthModalOpen(true)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              title="Calendar"
            >
              <Calendar size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                setHistoryExportToast(`Exported e-Statement for ${historyMonth} (PDF)`)
                setTimeout(() => setHistoryExportToast(null), 3000)
              }}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              title="Download statement"
            >
              <Download size={15} />
            </button>
          </div>
        </div>

        {/* Toast */}
        {historyExportToast && (
          <div className="mx-4 mt-3 p-3 bg-slate-900 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>{historyExportToast}</span>
          </div>
        )}

        {/* Scrollable Container */}
        <div className="p-4 space-y-3 max-w-lg mx-auto w-full">
          {/* Monthly Summary Banner Card (Clean White) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs relative overflow-hidden">
            <h2 className="text-base font-bold text-slate-900 tracking-tight mb-3">
              {historyMonth}
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-medium">Inflow</div>
                <div className="text-[15px] font-bold text-slate-900 mt-0.5">
                  {totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AKD
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium">Outflow</div>
                <div className="text-[15px] font-bold text-slate-900 mt-0.5">
                  –{totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AKD
                </div>
              </div>
            </div>
          </div>

          {/* Transaction List Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedHistoryTx(item)}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Category Icon */}
                  {item.type === 'bill' ? (
                    <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD]/60 flex items-center justify-center shrink-0 relative">
                      <FileText size={20} className="text-[#0284C7]" />
                      <span className="absolute bottom-1.5 right-1.5 text-[8px] font-black text-[#0284C7] leading-none">$</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0 text-white">
                      <div className="flex items-center justify-center -space-x-0.5">
                        <span className="text-[10px] font-bold">◀</span>
                        <span className="w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center text-[7.5px] font-black leading-none mx-0.5">$</span>
                        <span className="text-[10px] font-bold">▶</span>
                      </div>
                    </div>
                  )}

                  {/* Title & Time */}
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-900 leading-snug truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-normal">
                      {item.time}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0 pl-3">
                  <span className="text-[15px] font-bold text-slate-900 tracking-tight">
                    {formatAmount(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Detail Slip Modal */}
        {selectedHistoryTx && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Transaction Details</h3>
                <button
                  type="button"
                  onClick={() => setSelectedHistoryTx(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <div className="text-xs text-slate-500 font-medium">Transaction Completed</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {formatAmount(selectedHistoryTx.amount)} AKD
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient / Title</span>
                  <span className="font-semibold text-slate-900">{selectedHistoryTx.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category</span>
                  <span className="font-medium text-slate-900">{selectedHistoryTx.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time</span>
                  <span className="text-slate-900">{selectedHistoryTx.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Reference No.</span>
                  <div className="flex items-center space-x-1.5 font-mono text-slate-900 font-medium">
                    <span>{selectedHistoryTx.refNo}</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(selectedHistoryTx.refNo)}
                      className="text-slate-700 hover:text-slate-900"
                      title="Copy Ref"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Fee</span>
                  <span className="font-semibold text-emerald-600">0.00 AKD (Free)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHistoryTx(null)}
                className="w-full py-3 rounded-xl bg-[#9E1B32] text-white font-bold text-sm hover:bg-[#831629] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Month Selector Modal */}
        {historyMonthModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Select Statement Month</h3>
                <button
                  type="button"
                  onClick={() => setHistoryMonthModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                {['October – 2026', 'September – 2026', 'August – 2026', 'July – 2026'].map((m) => {
                  const isSel = historyMonth === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setHistoryMonth(m)
                        setHistoryMonthModalOpen(false)
                      }}
                      className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition cursor-pointer ${isSel ? 'bg-rose-50 text-[#9E1B32] font-bold' : 'hover:bg-slate-50 text-slate-800'
                        }`}
                    >
                      <span className="text-sm">{m}</span>
                      {isSel && <Check size={18} className="text-[#9E1B32]" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filter Category Modal */}
        {historyFilterModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Filter Transactions</h3>
                <button
                  type="button"
                  onClick={() => setHistoryFilterModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'all', label: 'All Transactions' },
                  { id: 'transfer', label: 'Transfers (P2P)' },
                  { id: 'bill', label: 'Bills & Utilities' },
                ].map((cat) => {
                  const isSel = historyCategoryFilter === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setHistoryCategoryFilter(cat.id as any)
                        setHistoryFilterModalOpen(false)
                      }}
                      className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition cursor-pointer ${isSel ? 'bg-rose-50 text-[#9E1B32] font-bold' : 'hover:bg-slate-50 text-slate-800'
                        }`}
                    >
                      <span className="text-sm">{cat.label}</span>
                      {isSel && <Check size={18} className="text-[#9E1B32]" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     4.6. TOP UP SCREEN (MATCHING USER'S 5 REFERENCE SCREENSHOTS)
  ═══════════════════════════════════════════════════════════════════════════ */
  const renderTopupScreen = () => {
    const isAk = lang === 'ak'
    const thbRate = 115.0
    const akdRate = 4500.0

    const topupAmounts = [
      500, 1000, 2000, 2500, 3000, 5000, 6000, 7500, 10000, 15000, 20000, 30000, 50000,
    ]

    const topupPackages = [
      {
        id: 'pkg_1',
        name: 'Shal Suboo 195 MB (7Days)',
        category: 'Data',
        mmkPrice: 799,
        thbPrice: 6.95,
        validity: '7 Days',
        quota: '195 MB',
        isHot: false,
      },
      {
        id: 'pkg_2',
        name: 'Shal Suboo 263 MB (10Days)',
        category: 'Data',
        mmkPrice: 999,
        thbPrice: 8.69,
        validity: '10 Days',
        quota: '263 MB',
        isHot: false,
      },
      {
        id: 'pkg_3',
        name: 'Shal Suboo 421 MB (30Days)',
        category: 'Data',
        mmkPrice: 1599,
        thbPrice: 13.90,
        validity: '30 Days',
        quota: '421 MB',
        isHot: false,
      },
      {
        id: 'pkg_4',
        name: 'Shal Suboo 526 MB (30Days)',
        category: 'Data',
        mmkPrice: 1999,
        thbPrice: 17.38,
        validity: '30 Days',
        quota: '526 MB',
        isHot: false,
      },
      {
        id: 'pkg_5',
        name: 'Asia 9 Countries 1200MB (3 Days)',
        category: 'Data Roaming',
        mmkPrice: 14599,
        thbPrice: 126.95,
        validity: '3 Days',
        quota: '1200 MB',
        isHot: true,
      },
      {
        id: 'pkg_6',
        name: 'Asia 5 Data Saver (2.5 GB) (5 Days)',
        category: 'Data Roaming',
        mmkPrice: 19997,
        thbPrice: 173.88,
        validity: '5 Days',
        quota: '2.5 GB',
        isHot: true,
      },
      {
        id: 'pkg_7',
        name: 'Super Pack 1.5GB (30 Days)',
        category: 'Super Pack',
        mmkPrice: 3500,
        thbPrice: 30.43,
        validity: '30 Days',
        quota: '1.5 GB',
        isHot: false,
      },
      {
        id: 'pkg_8',
        name: 'Super Pack 3.0GB (30 Days)',
        category: 'Super Pack',
        mmkPrice: 6500,
        thbPrice: 56.52,
        validity: '30 Days',
        quota: '3.0 GB',
        isHot: false,
      },
    ]

    const sampleContacts = [
      { name: 'User (Self)', phone: '09795220917', op: 'ATOM' },
      { name: 'Ko Min Aung', phone: '09251998791', op: 'MPT' },
      { name: 'Daw Hla Hla', phone: '09691234567', op: 'mytel' },
      { name: 'Mg Zaw Myo', phone: '09971234567', op: 'U9' },
    ]

    const detectOperator = (num: string) => {
      const clean = num.replace(/[^0-9]/g, '')
      if (clean.length < 3) return ''
      if (clean.startsWith('097')) return 'ATOM'
      if (
        clean.startsWith('092') ||
        clean.startsWith('094') ||
        clean.startsWith('095') ||
        clean.startsWith('098')
      ) {
        return 'MPT'
      }
      if (clean.startsWith('096')) return 'mytel'
      if (clean.startsWith('099') || clean.startsWith('093')) return 'U9'
      return 'ATOM'
    }

    const currentOperator = detectOperator(topupPhone)
    const hasInput = topupPhone.trim().length >= 4

    const selectedPkg =
      topupPackages.find((p) => p.id === topupSelectedPackageId) || topupPackages[0]

    const calculatedThb =
      topupActiveTab === 'phoneTopup'
        ? topupSelectedAmount / thbRate
        : selectedPkg.thbPrice

    const calculatedAkd =
      topupActiveTab === 'phoneTopup'
        ? topupSelectedAmount / akdRate
        : selectedPkg.mmkPrice / akdRate

    const productTitle =
      topupActiveTab === 'phoneTopup'
        ? `${topupSelectedAmount.toLocaleString()} MMK Phone Topup`
        : selectedPkg.name

    const filteredPackages =
      topupSelectedCategory === 'All'
        ? topupPackages
        : topupPackages.filter((p) => p.category === topupSelectedCategory)

    const renderMiniOpBadge = (op: string) => {
      switch (op) {
        case 'ATOM':
          return (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-black bg-[#0284C7] text-white">
              ATOM
            </span>
          )
        case 'MPT':
          return (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-black bg-[#EAB308] text-slate-900">
              MPT
            </span>
          )
        case 'mytel':
          return (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-black bg-[#EA580C] text-white">
              mytel
            </span>
          )
        case 'U9':
          return (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-black bg-[#D97706] text-white">
              U9
            </span>
          )
        default:
          return null
      }
    }

    const handleExecuteTopup = () => {
      const costAkd = calculatedAkd
      setAkdBalance((b) => Math.max(0, b - costAkd))

      const nowStr = Date.now().toString()
      const newTx: Txn = {
        id: `TOPUP-${nowStr.slice(-6)}`,
        refId: `REF${nowStr}`,
        title: `${currentOperator || 'Mobile'} Topup: ${topupPhone}`,
        titleMm: `${currentOperator || 'မိုဘိုင်း'} ဖုန်းငွေဖြည့်: ${topupPhone}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: -costAkd,
        currency: 'AKD',
        category: 'p2p',
        status: 'SETTLED',
        counterparty: `${currentOperator || 'Mobile'} Telecom`,
        counterpartyMm: `${currentOperator || 'မိုဘိုင်း'} ဆက်သွယ်ရေး`,
        fee: 0,
        hash: `0x${nowStr.slice(-8)}...`,
      }
      // Update live transactions and sync with Supabase database
      setLiveTransactions((prev) => [newTx, ...prev])
      insertTransactionToDb(newTx)
      updateUserBalanceInDb(Math.max(0, usdAccountBalance - costAkd))

      setTopupLastSuccessInfo({
        phone: topupPhone,
        operator: currentOperator || 'Mobile',
        title: productTitle,
        thb: calculatedThb,
        akd: calculatedAkd,
      })

      setTopupReviewModalOpen(false)
      setTopupSuccessModalOpen(true)
    }

    return (
      <div className="min-h-full bg-[#F8F9FA] text-slate-800 flex flex-col pb-12">
        {/* HEADER: CLEAN WHITE (matching all app pages) */}
        {topupHeaderStyle === 'royalBlue' ? (
          <div className="bg-white text-slate-900 border-b border-slate-200 px-4 pt-4 pb-6 transition-all">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setScreen('home')}
                className="flex items-center space-x-1.5 cursor-pointer font-bold text-base text-slate-900 hover:opacity-80 transition"
              >
                <ChevronLeft size={24} className="text-slate-800" />
                <span>Top Up</span>
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setTopupHeaderStyle('crossborder')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  ⇄ Crossborder
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <MoreHorizontal size={18} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                  {currentOperator || 'ATOM'}
                </div>
                <div className="text-2xl font-black tracking-tight mt-0.5 text-slate-900">
                  {topupPhone || '09795220917'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTopupContactsModalOpen(true)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition text-slate-700"
                title="Select Saved Contact"
              >
                <BookUser size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 transition-all">
            <button
              type="button"
              onClick={() => setScreen('home')}
              className="p-1 -ml-1 text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-base font-extrabold text-slate-900 tracking-tight">
              Péthar Myanmar | Crossborder
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setTopupHeaderStyle('royalBlue')}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                title="Switch Header Style"
              >
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                  ATOM style
                </span>
              </button>
              <button
                type="button"
                onClick={() => setScreen('home')}
                className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* BODY CONTAINER */}
        <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full bg-white">
          {/* Mobile No Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Mobile No</label>
            <div className="relative flex items-center">
              <input
                type="tel"
                value={topupPhone}
                onChange={(e) => setTopupPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
                className="w-full pl-3.5 pr-20 py-3 rounded-xl border border-slate-300 text-[15px] font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
              />
              <div className="absolute right-2 flex items-center space-x-1">
                {topupPhone.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTopupPhone('')}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setTopupContactsModalOpen(true)}
                  className="p-2 rounded-lg bg-[#9E1B32] text-white hover:bg-[#801426] transition cursor-pointer shadow-sm"
                  title="Select Contact"
                >
                  <BookUser size={15} />
                </button>
              </div>
            </div>

            {/* Operator Detected Subtitle */}
            {hasInput && currentOperator && (
              <div className="flex items-center space-x-1.5 pt-1 text-xs font-bold text-slate-800 animate-in fade-in">
                <span className="w-4 h-4 rounded-full bg-[#9E1B32] text-white flex items-center justify-center text-[8px]">
                  ▶
                </span>
                <span>
                  {currentOperator}{' '}
                  {topupActiveTab === 'phoneTopup' ? 'Eload' : 'DataPack'}
                </span>
              </div>
            )}
          </div>

          {/* Segmented Pill Tabs: Phone Topup vs Packages (Screenshots 2-5) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-full">
            <button
              type="button"
              onClick={() => setTopupActiveTab('phoneTopup')}
              className={`py-2.5 rounded-full text-xs font-bold transition cursor-pointer text-center ${topupActiveTab === 'phoneTopup'
                ? 'bg-[#FF7A00] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Phone Topup
            </button>
            <button
              type="button"
              onClick={() => setTopupActiveTab('packages')}
              className={`py-2.5 rounded-full text-xs font-bold transition cursor-pointer text-center ${topupActiveTab === 'packages'
                ? 'bg-[#FF7A00] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Packages
            </button>
          </div>

          {/* TAB 1: PHONE TOPUP */}
          {topupActiveTab === 'phoneTopup' && (
            <div className="space-y-4 pt-1">
              <div className="text-xs font-bold text-slate-700">Select Amount (MMK)</div>

              {/* 3-Column Amount Denomination Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {topupAmounts.map((amt) => {
                  const isSelected = topupSelectedAmount === amt
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupSelectedAmount(amt)}
                      className={`py-3.5 px-1 rounded-xl text-center font-bold text-sm transition cursor-pointer border ${isSelected
                        ? 'bg-[#FF7A00] text-white border-[#FF7A00] shadow-sm'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {amt.toLocaleString()}
                    </button>
                  )
                })}
              </div>

              {/* Exchange Rate Card (Screenshots 2-5) */}
              <div className="bg-[#E8F1FC] border border-[#BFDBFE] rounded-xl px-4 py-3 text-xs font-bold text-slate-800">
                Exchange rate: 1 THB = 115 MMK
              </div>

              {/* Dynamic Calculation Subtext */}
              {hasInput && topupSelectedAmount > 0 && (
                <div className="text-center text-xs font-medium text-slate-700">
                  Your total is{' '}
                  <span className="font-extrabold text-[#EA580C]">
                    {(topupSelectedAmount / thbRate).toFixed(2)} THB
                  </span>{' '}
                  for {topupSelectedAmount.toLocaleString()} MMK
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PACKAGES */}
          {topupActiveTab === 'packages' && (
            <div className="space-y-4 pt-1">
              {/* Category Pills (Screenshot 1) */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'Data Roaming', 'Super Pack', 'Data'].map((cat) => {
                  const isSel = topupSelectedCategory === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTopupSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 border ${isSel
                        ? 'bg-[#9E1B32] text-white border-[#9E1B32]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {cat !== 'All' && <Wifi size={12} />}
                      <span>{cat}</span>
                    </button>
                  )
                })}
              </div>

              <div className="text-xs font-bold text-slate-700">Select Package (MMK)</div>

              {/* Exchange Rate Banner */}
              <div className="bg-[#E8F1FC] border border-[#BFDBFE] rounded-xl px-4 py-3 text-xs font-bold text-slate-800">
                Exchange rate: 1 THB = 115 MMK
              </div>

              {/* Package Cards List (Screenshots 1 & 5) */}
              <div className="space-y-2.5">
                {filteredPackages.map((pkg) => {
                  const isSelected = topupSelectedPackageId === pkg.id
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setTopupSelectedPackageId(pkg.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${isSelected
                        ? 'border-[#FF7A00] bg-[#FFF7ED] ring-1 ring-[#FF7A00]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{pkg.name}</span>
                          {pkg.isHot && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[#EF4444] text-white tracking-wider">
                              HOT
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Validity: {pkg.validity} • Quota: {pkg.quota}
                        </div>
                      </div>

                      <div className="text-right space-y-1 shrink-0 pl-2">
                        <div className="text-xs font-bold text-slate-900">
                          {pkg.mmkPrice.toLocaleString()} MMK
                        </div>
                        <div className="inline-block px-2.5 py-0.5 rounded-full border border-[#FF7A00] text-[11px] font-bold text-[#EA580C] bg-white">
                          {pkg.thbPrice.toFixed(2)} THB
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Package Selected Subtext */}
              {hasInput && selectedPkg && (
                <div className="text-center text-xs font-medium text-slate-700">
                  Selected package:{' '}
                  <span className="font-extrabold text-[#EA580C]">
                    {selectedPkg.thbPrice.toFixed(2)} THB
                  </span>{' '}
                  ({selectedPkg.mmkPrice.toLocaleString()} MMK)
                </div>
              )}
            </div>
          )}

          {/* Action Button: Review Topup Details (Screenshots 2-5) */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!hasInput}
              onClick={() => setTopupReviewModalOpen(true)}
              className={`w-full py-3.5 rounded-full text-sm font-black transition cursor-pointer shadow-md ${hasInput
                ? 'bg-[#FF7A00] hover:bg-[#EA6C00] text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
            >
              {isAk ? 'အချက်အလက် စစ်ဆေးမည်' : 'Review Topup Details'}
            </button>
          </div>

          {/* Operator Logos Row (ATOM, MPT, mytel, U9) */}
          <div className="pt-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'ATOM', phone: '09795220917', color: 'text-[#0284C7]' },
                { name: 'MPT', phone: '09251998791', color: 'text-[#EAB308]' },
                { name: 'mytel', phone: '09691234567', color: 'text-[#EA580C]' },
                { name: 'U9', phone: '09971234567', color: 'text-[#D97706]' },
              ].map((op) => {
                const isActive = currentOperator.toLowerCase() === op.name.toLowerCase()
                return (
                  <button
                    key={op.name}
                    type="button"
                    onClick={() => setTopupPhone(op.phone)}
                    className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center space-y-0.5 ${isActive
                      ? 'border-[#9E1B32] bg-red-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                  >
                    <span className={`text-[12px] font-black ${op.color}`}>{op.name}</span>
                    <span className="text-[9px] text-slate-400 font-medium">Auto-test</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Copyright Footer (Screenshots 2-5) */}
          <div className="pt-4 text-center text-[11px] text-slate-400">
            Copyright © TrueMoney / Péthar Myanmar 2026
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
           MODAL 1: SAVED CONTACTS PICKER
        ═══════════════════════════════════════════════════════════════════════ */}
        {topupContactsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Select Saved Contact</h3>
                <button
                  type="button"
                  onClick={() => setTopupContactsModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                {sampleContacts.map((c) => (
                  <button
                    key={c.phone}
                    type="button"
                    onClick={() => {
                      setTopupPhone(c.phone)
                      setTopupContactsModalOpen(false)
                    }}
                    className="w-full p-3 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 flex items-center justify-between transition cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-sm">
                        {c.name.substring(0, 1)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{c.phone}</div>
                      </div>
                    </div>
                    {renderMiniOpBadge(c.op)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
           MODAL 2: REVIEW TOPUP DETAILS BOTTOM SHEET (MATCHING SCREENSHOT 3 & 4)
        ═══════════════════════════════════════════════════════════════════════ */}
        {topupReviewModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  {isAk ? 'ငွေဖြည့်အချက်အလက် စစ်ဆေးရန်' : 'Review Topup Details'}
                </h3>
                <button
                  type="button"
                  onClick={() => setTopupReviewModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Recipient & Operator Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Mobile Number</span>
                  <span className="font-extrabold text-slate-900 font-mono text-sm">
                    {topupPhone}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Operator</span>
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    {renderMiniOpBadge(currentOperator)}
                    <span>
                      {currentOperator}{' '}
                      {topupActiveTab === 'phoneTopup' ? 'Eload' : 'DataPack'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Product / Plan</span>
                  <span className="font-bold text-slate-900 text-right truncate max-w-[180px]">
                    {productTitle}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Exchange Rate</span>
                  <span className="font-bold text-slate-900">1 THB = 115 MMK</span>
                </div>
              </div>

              {/* Total Amount Box */}
              <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-[#C2410C]">Total Amount to Pay</div>
                  <div className="text-xl font-black text-[#EA580C] mt-0.5">
                    {calculatedThb.toFixed(2)} THB
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white border border-[#FDBA74] text-xs font-black text-[#C2410C]">
                  ≈ {calculatedAkd.toFixed(3)} AKD
                </div>
              </div>

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleExecuteTopup}
                className="w-full py-3.5 rounded-full bg-[#FF7A00] hover:bg-[#EA6C00] text-white font-extrabold text-sm transition cursor-pointer shadow-md"
              >
                {isAk ? 'အတည်ပြုပြီး ငွေဖြည့်မည်' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
           MODAL 3: TOPUP SUCCESS RECEIPT
        ═══════════════════════════════════════════════════════════════════════ */}
        {topupSuccessModalOpen && topupLastSuccessInfo && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Top Up Successful!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Successfully sent {topupLastSuccessInfo.title} to{' '}
                  <span className="font-bold text-slate-800">
                    {topupLastSuccessInfo.phone}
                  </span>{' '}
                  ({topupLastSuccessInfo.operator}).
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Charged</span>
                  <span className="font-black text-slate-900">
                    {topupLastSuccessInfo.thb.toFixed(2)} THB (
                    {topupLastSuccessInfo.akd.toFixed(3)} AKD)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Status</span>
                  <span className="font-bold text-[#10B981]">Instant Completed</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTopupSuccessModalOpen(false)
                  setScreen('home')
                }}
                className="w-full py-3.5 rounded-full bg-[#FF7A00] hover:bg-[#EA6C00] text-white font-extrabold text-sm transition cursor-pointer shadow-md"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     BILL PAYMENT SCREEN (SCREENSHOTS 1, 2, 3: MYANMAR & THAILAND UTILITY BILLS)
  ═══════════════════════════════════════════════════════════════════════════ */
  const renderBillPaymentScreen = () => {
    const isAk = lang === 'ak'
    const thbRate = 115.0
    const akdRate = 4500.0

    // 9 Myanmar Billers (Screenshot 2)
    const myanmarBillers = [
      {
        id: 'mm_aia',
        name: 'AIA Myanmar Life Insurance',
        category: 'Insurance',
        defaultAccount: 'POL-982140021',
        accountLabel: 'Policy Number',
        defaultAmountMmk: 45000,
        defaultAmountThb: 391.3,
        primaryColor: '#D91624',
        initials: 'AIA',
        hasKyoPhyae: true,
      },
      {
        id: 'mm_alliance',
        name: 'Alliance Microfinance',
        category: 'Microfinance',
        defaultAccount: 'ALN-501923',
        accountLabel: 'Customer / Loan ID',
        defaultAmountMmk: 30000,
        defaultAmountThb: 260.87,
        primaryColor: '#0D9488',
        initials: 'ALN',
      },
      {
        id: 'mm_atom',
        name: 'ATOM Broadband & Smart Device',
        category: 'Broadband & Device',
        defaultAccount: '09795220917',
        accountLabel: 'Account ID / Mobile No',
        defaultAmountMmk: 32000,
        defaultAmountThb: 278.26,
        primaryColor: '#0284C7',
        initials: 'ATOM',
      },
      {
        id: 'mm_aya',
        name: 'AYA SOMPO Insurance',
        category: 'General Insurance',
        defaultAccount: 'AYS-771209',
        accountLabel: 'Policy No / Vehicle Reg',
        defaultAmountMmk: 50000,
        defaultAmountThb: 434.78,
        primaryColor: '#E11D48',
        initials: 'AYA',
      },
      {
        id: 'mm_moee',
        name: 'Electricity Bill (Bago)',
        category: 'Utilities & Power',
        defaultAccount: 'BGO-E-10294',
        accountLabel: 'Meter Box / Consumer No',
        defaultAmountMmk: 65600,
        defaultAmountThb: 570.43,
        primaryColor: '#1D4ED8',
        initials: 'MOEE',
      },
      {
        id: 'mm_capital',
        name: 'Capital Taiyo Life Insurance',
        category: 'Life Insurance',
        defaultAccount: 'CTL-441029',
        accountLabel: 'Policy Number',
        defaultAmountMmk: 28000,
        defaultAmountThb: 243.48,
        primaryColor: '#2563EB',
        initials: 'CTL',
      },
      {
        id: 'mm_city',
        name: 'City Rewards',
        category: 'Retail & Supermarket',
        defaultAccount: 'CR-889102',
        accountLabel: 'Member ID / Phone',
        defaultAmountMmk: 15000,
        defaultAmountThb: 130.43,
        primaryColor: '#9333EA',
        initials: 'CR',
      },
      {
        id: 'mm_excise',
        name: 'Excise Revenue (NayPyiTaw)',
        category: 'Government Tax & Revenue',
        defaultAccount: 'NPT-EX-3041',
        accountLabel: 'Assessment / Tax ID',
        defaultAmountMmk: 20000,
        defaultAmountThb: 173.91,
        primaryColor: '#DC2626',
        initials: 'EXC',
      },
      {
        id: 'mm_hana',
        name: 'Hana Microfinance Limited',
        category: 'Microfinance & Loans',
        defaultAccount: 'HNA-19283',
        accountLabel: 'Contract / Account No',
        defaultAmountMmk: 25000,
        defaultAmountThb: 217.39,
        primaryColor: '#059669',
        initials: 'HNA',
      },
    ]

    // Thailand Utility Billers (Screenshot 1)
    const thailandBillers = [
      {
        id: 'th_dtac',
        name: 'Dtac (Postpaid)',
        category: 'Telecom',
        section: 'Dtac Bills',
        defaultAccount: '0812345678',
        accountLabel: 'Mobile / Account No',
        defaultAmountMmk: 68885,
        defaultAmountThb: 599.0,
        primaryColor: '#0284C7',
        initials: 'DTAC',
      },
      {
        id: 'th_true',
        name: 'TrueMove H/Online/Visions/True Group',
        category: 'Telecom & TV',
        section: 'True Bills',
        defaultAccount: '0958765432',
        accountLabel: 'Subscriber / Service No',
        defaultAmountMmk: 91885,
        defaultAmountThb: 799.0,
        primaryColor: '#EF4444',
        initials: 'TRUE',
      },
      {
        id: 'th_mea',
        name: 'Metropolitan Electricity',
        category: 'Electricity',
        section: 'Utility',
        defaultAccount: 'CA-100293847',
        accountLabel: 'MEA CA / Account No',
        defaultAmountMmk: 143750,
        defaultAmountThb: 1250.0,
        primaryColor: '#EA580C',
        initials: 'MEA',
      },
      {
        id: 'th_pea',
        name: 'Provincial Electricity',
        category: 'Electricity',
        section: 'Utility',
        defaultAccount: 'PEA-9920145',
        accountLabel: 'PEA CA No',
        defaultAmountMmk: 112700,
        defaultAmountThb: 980.0,
        primaryColor: '#7C3AED',
        initials: 'PEA',
      },
      {
        id: 'th_mwa',
        name: 'Metropolitan Water Authority',
        category: 'Waterworks',
        section: 'Utility',
        defaultAccount: 'MWA-4412098',
        accountLabel: 'Customer Code',
        defaultAmountMmk: 27600,
        defaultAmountThb: 240.0,
        primaryColor: '#0284C7',
        initials: 'MWA',
      },
      {
        id: 'th_pwa',
        name: 'Provincial Waterworks',
        category: 'Waterworks',
        section: 'Utility',
        defaultAccount: 'PWA-6651203',
        accountLabel: 'User ID',
        defaultAmountMmk: 21275,
        defaultAmountThb: 185.0,
        primaryColor: '#0369A1',
        initials: 'PWA',
      },
      {
        id: 'th_dlt',
        name: 'Motor Vehicle Tax',
        category: 'Transport & Tax',
        section: 'Utility',
        defaultAccount: '9กก-8821',
        accountLabel: 'License Plate / Chassis No',
        defaultAmountMmk: 172500,
        defaultAmountThb: 1500.0,
        primaryColor: '#9333EA',
        initials: 'DLT',
      },
      {
        id: 'th_rd',
        name: 'Tax (Revenue Dept.)',
        category: 'Government Tax',
        section: 'Utility',
        defaultAccount: 'TAX-1102938475',
        accountLabel: 'Taxpayer ID / Ref No',
        defaultAmountMmk: 230000,
        defaultAmountThb: 2000.0,
        primaryColor: '#D97706',
        initials: 'RD',
      },
      {
        id: 'th_easypass',
        name: 'Easy Pass',
        category: 'Toll & Expressway',
        section: 'Utility',
        defaultAccount: 'OBU-88192039',
        accountLabel: 'Smart Card No / OBU ID',
        defaultAmountMmk: 57500,
        defaultAmountThb: 500.0,
        primaryColor: '#1D4ED8',
        initials: 'PASS',
      },
    ]

    const handleSelectBiller = (biller: typeof myanmarBillers[0]) => {
      setSelectedBiller(biller)
      setBillerAccountInput(biller.defaultAccount)
      setIsBillFetched(true)
    }

    const handleConfirmBillPayment = () => {
      if (!selectedBiller) return
      const isMm = billsRegion === 'myanmar'
      const mmkAmount = isMm ? selectedBiller.defaultAmountMmk : selectedBiller.defaultAmountThb * thbRate
      const thbAmount = isMm ? selectedBiller.defaultAmountMmk / thbRate : selectedBiller.defaultAmountThb
      const akdAmount = mmkAmount / akdRate

      // Deduct balance
      setAkdBalance((prev) => Math.max(0, prev - akdAmount))
      if (wallets.length > 0) {
        wallets[0].balance = Math.max(0, wallets[0].balance - akdAmount)
      }

      // Add to transactions
      const newTx: Txn = {
        id: `TXN-BILL-${Date.now()}`,
        refId: billerAccountInput || selectedBiller.defaultAccount,
        title: `Bill Payment - ${selectedBiller.name}`,
        titleMm: `${selectedBiller.name} ဘေလ်ပေးချေခြင်း`,
        category: 'pos',
        amount: akdAmount,
        currency: 'AKD',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'SETTLED',
        counterparty: selectedBiller.name,
        counterpartyMm: selectedBiller.name,
        fee: 0,
        hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      }
      // Update live transactions and sync with Supabase database
      setLiveTransactions((prev) => [newTx, ...prev])
      insertTransactionToDb(newTx)
      updateUserBalanceInDb(Math.max(0, usdAccountBalance - akdAmount))

      setLastBillSuccess({
        billerName: selectedBiller.name,
        accountNo: billerAccountInput || selectedBiller.defaultAccount,
        amountMmk: mmkAmount,
        amountThb: thbAmount,
        amountAkd: akdAmount,
        refId: newTx.id,
      })
      setBillsSuccessModalOpen(true)
    }

    // ── IF BILLER DETAIL VIEW IS OPEN (SCREENSHOT 3) ─────────────────────────
    if (selectedBiller) {
      const isMm = billsRegion === 'myanmar'
      const mmkAmount = isMm ? selectedBiller.defaultAmountMmk : selectedBiller.defaultAmountThb * thbRate
      const thbAmount = isMm ? selectedBiller.defaultAmountMmk / thbRate : selectedBiller.defaultAmountThb
      const akdAmount = mmkAmount / akdRate

      return (
        <div className="min-h-full bg-[#F4F5F8] flex flex-col">
          {/* Header Bar: Clean White */}
          <div className="bg-white text-slate-900 border-b border-slate-200 pt-4 pb-4 px-4 sticky top-0 z-30">
            <div className="flex items-center space-x-3 mb-3">
              <button
                type="button"
                onClick={() => setSelectedBiller(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-base font-bold text-slate-900 truncate flex-1">
                {selectedBiller.name}
              </h1>
            </div>

            {/* Embedded Rounded Pill Input with Green Circular Search Button [🔍] */}
            <div className="bg-slate-50 rounded-full px-4 py-1.5 flex items-center justify-between border border-slate-200 shadow-xs">
              <input
                type="text"
                value={billerAccountInput}
                onChange={(e) => setBillerAccountInput(e.target.value)}
                placeholder={`Enter ${selectedBiller.accountLabel}`}
                className="w-full text-slate-800 font-semibold text-sm outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setIsBillFetched(true)}
                className="w-9 h-9 rounded-full bg-[#00A859] hover:bg-[#008f4c] text-white flex items-center justify-center shrink-0 cursor-pointer transition shadow-sm"
              >
                <Search size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4">
            {/* Info Hint */}
            <div className="flex items-start space-x-2 text-slate-700 text-xs font-semibold px-1">
              <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <span>How to make bill payment for {selectedBiller.name}</span>
            </div>

            {/* 3-Step Guide Card (Screenshot 3) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
              <div>
                <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                  STEP 1
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Please enter Customer Policy Number and click "Next".
                </div>
              </div>

              <div>
                <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                  STEP 2
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Choose bill you would like to pay.
                </div>
              </div>

              <div>
                <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                  STEP 3
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Click "Pay" and enter PIN to complete the payment.
                </div>
              </div>
            </div>

            {/* Bill Statement Card */}
            {isBillFetched && (
              <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-bold text-slate-800">
                    Bill Statement (Oct 2026)
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Due in 7 days
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Name</span>
                    <span className="font-bold text-slate-800">User</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account / Policy</span>
                    <span className="font-mono font-bold text-slate-800">
                      {billerAccountInput || selectedBiller.defaultAccount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Billing Cycle</span>
                    <span className="font-semibold text-slate-800">
                      01/10/2026 - 31/10/2026
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Fee</span>
                    <span className="font-bold text-emerald-600">0.00 (Free)</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      Outstanding Bill
                    </span>
                    <span className="text-lg font-black text-[#FF7A00]">
                      {isMm
                        ? `${mmkAmount.toLocaleString()} MMK`
                        : `${thbAmount.toFixed(2)} THB`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold text-sky-600 mt-0.5">
                    <span>≈ {thbAmount.toFixed(2)} THB</span>
                    <span>≈ {akdAmount.toFixed(3)} AKD</span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm & Pay Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmBillPayment}
                className="w-full py-4 rounded-2xl bg-[#FF7A00] hover:bg-[#EA6C00] text-white font-extrabold text-sm transition cursor-pointer shadow-lg active:scale-98"
              >
                Confirm & Pay Bill ({akdAmount.toFixed(3)} AKD)
              </button>
            </div>
          </div>

          {/* Success Dialog Modal */}
          {billsSuccessModalOpen && lastBillSuccess && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
              <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Bill Paid Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Payment for {lastBillSuccess.billerName} has been processed.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 text-left border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account / Ref</span>
                    <span className="font-mono font-bold text-slate-800">
                      {lastBillSuccess.accountNo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Paid</span>
                    <span className="font-bold text-slate-900">
                      {lastBillSuccess.amountMmk.toLocaleString()} MMK
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Charged</span>
                    <span className="font-bold text-[#FF7A00]">
                      ≈ {lastBillSuccess.amountAkd.toFixed(3)} AKD
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setBillsSuccessModalOpen(false)
                    setSelectedBiller(null)
                    setScreen('home')
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#9E1B32] hover:bg-[#801426] text-white font-extrabold text-sm transition cursor-pointer shadow-md"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }

    // ── MAIN BILL LIST VIEW (SCREENSHOT 1 & SCREENSHOT 2) ───────────────────
    const filteredThailandBillers = thailandBillers.filter(
      (b) =>
        b.name.toLowerCase().includes(billsSearchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(billsSearchQuery.toLowerCase()) ||
        b.section.toLowerCase().includes(billsSearchQuery.toLowerCase())
    )

    const filteredMyanmarBillers = myanmarBillers.filter(
      (b) =>
        b.name.toLowerCase().includes(billsSearchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(billsSearchQuery.toLowerCase())
    )

    return (
      <div className="min-h-full bg-[#F4F5F8] flex flex-col">
        {/* Top Region Toggle Pill Bar */}
        <div className="bg-white px-4 pt-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center bg-slate-100 p-1 rounded-full">
            <button
              type="button"
              onClick={() => {
                setBillsRegion('myanmar')
                setBillsSearchQuery('')
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${billsRegion === 'myanmar'
                ? 'bg-[#9E1B32] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Myanmar Bills
            </button>
            <button
              type="button"
              onClick={() => {
                setBillsRegion('thailand')
                setBillsSearchQuery('')
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${billsRegion === 'thailand'
                ? 'bg-[#9E1B32] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Crossborder (Thailand)
            </button>
          </div>
        </div>

        {/* ── MYANMAR BILLS VIEW (SCREENSHOT 2) ──────────────────────────────── */}
        {billsRegion === 'myanmar' && (
          <div>
            {/* Header: Clean White with < Bills Payment and History on Right */}
            <div className="bg-white text-slate-900 border-b border-slate-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setScreen('home')}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <ChevronLeft size={24} />
                </button>
                <h1 className="text-base font-bold text-slate-900">
                  {isAk ? 'ဘေလ်ပေးချေခြင်း' : 'Bills Payment'}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setScreen('history')}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-full border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                {isAk ? 'မှတ်တမ်း' : 'History'}
              </button>
            </div>

            {/* List of 9 Myanmar Billers (Screenshot 2) */}
            <div className="p-4 space-y-2.5">
              {filteredMyanmarBillers.map((biller) => (
                <div
                  key={biller.id}
                  onClick={() => handleSelectBiller(biller)}
                  className="relative bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-slate-300 hover:shadow-sm transition cursor-pointer active:scale-99"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center font-black text-xs shrink-0"
                      style={{ color: biller.primaryColor }}
                    >
                      {biller.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {biller.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {biller.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Floating Pill for Kyo Phyae badge on AIA (Screenshot 2) */}
                    {biller.hasKyoPhyae && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-white text-[10px] font-bold shadow-xs flex items-center space-x-1">
                        <span>Kyo Phyae &gt;</span>
                      </span>
                    )}
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── THAILAND UTILITY BILLS VIEW (SCREENSHOT 1) ────────────────────── */}
        {billsRegion === 'thailand' && (
          <div>
            {/* Header: Clean White Header < Pay Utility Bills */}
            <div className="bg-white border-b border-slate-100 px-4 py-3.5 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setScreen('home')}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-800 cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-base font-extrabold text-slate-900">
                Pay Utility Bills
              </h1>
            </div>

            {/* Rounded Search Bar */}
            <div className="p-4 bg-white border-b border-slate-100">
              <div className="bg-slate-100 rounded-full px-4 py-2 flex items-center space-x-2">
                <Search size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={billsSearchQuery}
                  onChange={(e) => setBillsSearchQuery(e.target.value)}
                  placeholder="Search utility bill"
                  className="w-full text-xs text-slate-800 font-medium outline-none bg-transparent"
                />
                {billsSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setBillsSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Thai Red Cross Charity Banner (Screenshot 1) */}
            {!billsDismissBanner && (
              <div className="m-4 p-3.5 rounded-2xl bg-[#FFF9E6] border border-amber-200/80 shadow-xs relative flex items-center justify-between">
                <div className="flex items-center space-x-3 pr-6">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <span className="text-lg">❤️</span>
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#D91624]">
                      ร่วมสมทบทุน สภากาชาดไทย
                    </div>
                    <div className="text-[11px] text-amber-900 mt-0.5">
                      ช่วยเหลือผู้ป่วยปลูกถ่ายอวัยวะและดวงตา
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBillsDismissBanner(true)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer absolute top-2 right-2"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Categorized Sections: Dtac Bills, True Bills, Utility (Screenshot 1) */}
            <div className="space-y-4 pb-6">
              {['Dtac Bills', 'True Bills', 'Utility'].map((sec) => {
                const secBillers = filteredThailandBillers.filter((b) => b.section === sec)
                if (secBillers.length === 0) return null

                return (
                  <div key={sec} className="space-y-1">
                    {/* Light Grey Divider Section Header */}
                    <div className="bg-slate-200/70 px-4 py-1.5 text-xs font-bold text-slate-700">
                      {sec}
                    </div>

                    <div className="bg-white divide-y divide-slate-100">
                      {secBillers.map((biller) => (
                        <div
                          key={biller.id}
                          onClick={() => handleSelectBiller(biller)}
                          className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0"
                              style={{ color: biller.primaryColor }}
                            >
                              {biller.initials}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {biller.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {biller.category}
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     4.7. FAVOURITES MANAGEMENT SCREEN (CRUD + 6-DIGIT PIN AUTHORIZATION)
  ═══════════════════════════════════════════════════════════════════════════ */
  const renderFavouritesScreen = () => {
    const isAk = lang === 'ak'
    const query = favSearchQuery.trim().toLowerCase()
    const filteredList = favouriteList
      .map((item, idx) => ({ item, originalIndex: idx }))
      .filter(({ item }) => {
        const matchesCategory =
          favCategoryFilter === 'All' ||
          item.category.toLowerCase() === favCategoryFilter.toLowerCase()
        const matchesQuery =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.fullName.toLowerCase().includes(query) ||
          item.mm.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          item.phone.toLowerCase().includes(query) ||
          item.bank.toLowerCase().includes(query)
        return matchesCategory && matchesQuery
      })

    const avatarGradients = [
      'from-[#38BDF8] to-[#0284C7]', // Blue
      'from-blue-500 to-indigo-600', // Royal Blue
      'from-emerald-500 to-teal-600', // Emerald
      'from-rose-500 to-[#D91624]', // Crimson
      'from-amber-500 to-orange-600', // Amber
      'from-purple-500 to-violet-700', // Purple
      'from-teal-500 to-emerald-700', // Teal
    ]

    const banksList = [
      'Péthar Wallet',
      'KBZPay',
      'Wave Money',
      'AYA Pay',
      'CB Pay',
      'CIMB Bank',
      'Other',
    ]

    const categoriesList: Array<'Personal' | 'Family' | 'Friends' | 'Business'> = [
      'Personal',
      'Family',
      'Friends',
      'Business',
    ]

    const openAddModal = () => {
      setEditingFavIndex(null)
      setFavFormName('')
      setFavFormMm('')
      setFavFormPhone('')
      setFavFormBank('Péthar Wallet')
      setFavFormCategory('Friends')
      setFavFormBg('from-blue-500 to-indigo-600')
      setFavEditModalOpen(true)
    }

    const openEditModal = (contact: (typeof favouriteList)[0], index: number) => {
      setEditingFavIndex(index)
      setFavFormName(contact.name)
      setFavFormMm(contact.mm)
      setFavFormPhone(contact.phone || contact.id)
      setFavFormBank(contact.bank || 'Péthar Wallet')
      setFavFormCategory(contact.category || 'Friends')
      setFavFormBg(contact.bg || 'from-blue-500 to-indigo-600')
      setFavEditModalOpen(true)
    }

    const requestPinAuthorization = (
      title: string,
      description: string,
      onConfirm: () => void
    ) => {
      setFavPinAction({ title, description, onConfirm })
      setFavPinInput('')
      setFavPinError('')
      setFavPinModalOpen(true)
    }

    const handlePinDigit = (digit: string) => {
      if (digit === '.') return
      if (favPinInput.length < 6) {
        const next = favPinInput + digit
        setFavPinInput(next)
        setFavPinError('')

        if (next.length === 6) {
          if (next === '123456' || next === '000000') {
            setTimeout(() => {
              if (favPinAction) {
                favPinAction.onConfirm()
              }
              setFavPinModalOpen(false)
              setFavPinAction(null)
              setFavPinInput('')
              setFavSuccessToast(
                isAk
                  ? 'အပြောင်းအလဲ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ'
                  : 'Action authorized and saved successfully!'
              )
              setTimeout(() => setFavSuccessToast(''), 3000)
            }, 250)
          } else {
            setFavPinError('Incorrect PIN. Try 123456')
            setFavPinInput('')
          }
        }
      }
    }

    const handlePinDelete = () => {
      if (favPinInput.length > 0) {
        setFavPinInput(favPinInput.slice(0, -1))
        setFavPinError('')
      }
    }

    const handleSaveContact = (e: React.FormEvent) => {
      e.preventDefault()
      if (!favFormName.trim() || !favFormPhone.trim()) return

      const name = favFormName.trim()
      const mm = favFormMm.trim() || name
      const phoneOrId = favFormPhone.trim()
      const initials = name
        .split(' ')
        .map((p) => (p ? p[0] : ''))
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()

      const newContact = {
        id: phoneOrId.startsWith('ARAK') ? phoneOrId : `ARAK-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        fullName: name,
        mm,
        phone: phoneOrId,
        initials: initials || 'U',
        bg: favFormBg,
        bank: favFormBank,
        category: favFormCategory,
      }

      setFavEditModalOpen(false)

      if (editingFavIndex !== null) {
        requestPinAuthorization(
          isAk ? 'အချက်အလက် ပြင်ဆင်ရန် အတည်ပြုပါ' : 'Authorize Edit Contact',
          isAk
            ? `"${name}" ၏ အချက်အလက်များကို ပြင်ဆင်ရန် PIN ၆ လုံး ရိုက်ထည့်ပါ`
            : `Enter your 6-digit PIN to update recipient "${name}"`,
          () => {
            setFavouriteList((prev) => {
              const updated = [...prev]
              updated[editingFavIndex] = newContact
              return updated
            })
          }
        )
      } else {
        requestPinAuthorization(
          isAk ? 'စိတ်ကြိုက်အသစ် ထည့်ရန် အတည်ပြုပါ' : 'Authorize Add Contact',
          isAk
            ? `"${name}" ကို စိတ်ကြိုက်စာရင်းသို့ ထည့်ရန် PIN ၆ လုံး ရိုက်ထည့်ပါ`
            : `Enter your 6-digit PIN to add recipient "${name}"`,
          () => {
            setFavouriteList((prev) => [...prev, newContact])
          }
        )
      }
    }

    const handleDeleteContact = () => {
      if (!favDeleteTarget) return
      const { contact, index } = favDeleteTarget
      setFavDeleteTarget(null)

      requestPinAuthorization(
        isAk ? 'ဖျက်ပစ်ရန် အတည်ပြုပါ' : 'Authorize Delete',
        isAk
          ? `"${contact.name}" ကို စိတ်ကြိုက်စာရင်းမှ ဖျက်ပစ်ရန် PIN ၆ လုံး ရိုက်ထည့်ပါ`
          : `Enter your 6-digit PIN to delete "${contact.name}"`,
        () => {
          setFavouriteList((prev) => prev.filter((_, idx) => idx !== index))
        }
      )
    }

    return (
      <div className="min-h-full bg-[#F8FAFC] flex flex-col text-zinc-900 pb-16 relative">
        {/* Success Toast */}
        {favSuccessToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-zinc-700 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{favSuccessToast}</span>
          </div>
        )}

        {/* 1. TOP APP BAR */}
        <div className="bg-white px-4 py-3 border-b border-zinc-200 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScreen('home')}
              className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 text-zinc-700 transition cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-zinc-900 leading-tight">
                {isAk ? 'စိတ်ကြိုက် လွှဲသူများ' : 'Favourites'}
              </h1>
              <p className="text-[11px] font-medium text-zinc-500">
                {isAk
                  ? 'အချက်အလက် ပြင်ဆင်ရန်နှင့် အသစ်ထည့်ရန်'
                  : 'Manage recipients & quick contacts'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-[#D91624] border border-rose-200 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>{isAk ? 'အသစ်ထည့်ရန်' : 'Add New'}</span>
          </button>
        </div>

        {/* 2. SEARCH BAR & CATEGORY FILTER */}
        <div className="bg-white px-4 pt-2.5 pb-3 border-b border-zinc-200/80 space-y-2.5">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={favSearchQuery}
              onChange={(e) => setFavSearchQuery(e.target.value)}
              placeholder={
                isAk
                  ? 'အမည် သို့မဟုတ် ဖုန်းနံပါတ်ဖြင့် ရှာဖွေပါ...'
                  : 'Search by name, phone or Arakan ID...'
              }
              className="w-full h-10 pl-10 pr-9 bg-zinc-100/80 rounded-xl text-xs font-medium text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#D91624]/20 border border-transparent focus:border-[#D91624]/30"
            />
            {favSearchQuery && (
              <button
                type="button"
                onClick={() => setFavSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {['All', 'Personal', 'Family', 'Friends', 'Business'].map((cat) => {
              const isSelected = cat === favCategoryFilter
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFavCategoryFilter(cat)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 transition cursor-pointer ${isSelected
                    ? 'bg-zinc-900 text-white shadow-2xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                >
                  {cat === 'All' ? `All (${favouriteList.length})` : cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. RECIPIENT CARDS LIST */}
        <div className="p-4 space-y-3 flex-1">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                <Search size={28} />
              </div>
              <p className="text-sm font-bold text-zinc-800">
                {isAk ? 'ရှာဖွေမှု မတွေ့ရှိပါ' : 'No Favourites Found'}
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                {isAk
                  ? 'အခြားအချက်အလက်ဖြင့် ရှာဖွေပါ သို့မဟုတ် အသစ်ထည့်ပါ'
                  : 'Try searching with a different name or add a new favourite recipient.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setFavSearchQuery('')
                  setFavCategoryFilter('All')
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition"
              >
                {isAk ? 'မူလအတိုင်း ပြန်ကြည့်မည်' : 'Clear Filter'}
              </button>
            </div>
          ) : (
            filteredList.map(({ item, originalIndex }) => {
              const catColors: Record<string, string> = {
                Personal: 'bg-indigo-50 text-indigo-600 border-indigo-200',
                Family: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                Friends: 'bg-blue-50 text-blue-600 border-blue-200',
                Business: 'bg-amber-50 text-amber-600 border-amber-200',
              }
              const catBadge = catColors[item.category] || 'bg-zinc-100 text-zinc-600 border-zinc-200'

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 border border-zinc-200/90 shadow-2xs space-y-3 hover:border-zinc-300 transition"
                >
                  <div className="flex items-center gap-3">
                    {/* Circle Avatar */}
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-b ${item.bg} flex items-center justify-center text-white font-extrabold text-sm shadow-xs border-2 border-white shrink-0`}
                    >
                      {item.initials === 'U' ? <User size={20} /> : item.initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-zinc-900 truncate">
                          {item.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catBadge}`}
                        >
                          {item.category}
                        </span>
                      </div>
                      {item.mm && item.mm !== item.name && (
                        <p className="text-[11px] font-semibold text-zinc-500 truncate">
                          {item.mm}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 font-medium">
                        <span className="font-semibold text-zinc-700">{item.bank}</span>
                        <span>·</span>
                        <span>{item.phone || item.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center gap-2">
                    {/* Quick Pay Button */}
                    <button
                      type="button"
                      onClick={() =>
                        requireVerified(isAk ? 'ငွေပေးချေရန်' : 'Pay', () => {
                          const matchedRecent = recentPayContacts.find(
                            (c) => c.name.toLowerCase() === item.name.toLowerCase()
                          )
                          setPayRecipient({
                            id: item.id,
                            name: item.name,
                            username: matchedRecent
                              ? matchedRecent.username
                              : `@${item.name.toLowerCase().replace(/\s+/g, '_')}`,
                            uid: item.phone || item.id,
                            category: (item.category.toLowerCase() === 'family'
                              ? 'family'
                              : item.category.toLowerCase() === 'friends'
                                ? 'friends'
                                : 'other') as 'family' | 'friends' | 'other',
                            initials: item.initials,
                            avatarUrl: '',
                          })
                          setPayToInput(
                            matchedRecent
                              ? matchedRecent.username
                              : `@${item.name.toLowerCase().replace(/\s+/g, '_')}`
                          )
                          setPayStep('detail')
                          setScreen('pay')
                        })
                      }
                      className="flex-1 h-9 rounded-xl bg-[#9E1B32] hover:bg-[#801426] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <SendIcon size={13} />
                      <span>{isAk ? 'ငွေလွှဲမည်' : 'Quick Pay'}</span>
                    </button>

                    {/* Edit Pencil Button */}
                    <button
                      type="button"
                      onClick={() => openEditModal(item, originalIndex)}
                      className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition cursor-pointer"
                      title="Edit Contact"
                    >
                      <Pencil size={15} />
                    </button>

                    {/* Delete Trash Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setFavDeleteTarget({ contact: item, index: originalIndex })
                      }
                      className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#D91624] flex items-center justify-center transition cursor-pointer"
                      title="Delete Contact"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Floating Add Favourite Action Button */}
        <button
          type="button"
          onClick={openAddModal}
          className="fixed bottom-6 right-6 px-4 py-3 rounded-full bg-[#D91624] hover:bg-[#b0101b] text-white text-xs font-extrabold shadow-lg flex items-center gap-2 cursor-pointer transition active:scale-95 z-20"
        >
          <Plus size={18} />
          <span>{isAk ? 'အသစ်ထည့်မည်' : 'Add Favourite'}</span>
        </button>

        {/* ── MODAL 1: ADD / EDIT FAVOURITE BOTTOM SHEET ── */}
        {favEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto" />

              <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                <div>
                  <h2 className="text-base font-extrabold text-zinc-900">
                    {editingFavIndex !== null
                      ? isAk
                        ? 'အချက်အလက် ပြင်ဆင်ရန်'
                        : 'Edit Favourite'
                      : isAk
                        ? 'စိတ်ကြိုက်အသစ် ထည့်ရန်'
                        : 'Add New Favourite'}
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    {isAk
                      ? 'အတည်ပြုရန် ၆ လုံး PIN လိုအပ်ပါသည်'
                      : 'PIN verification required to save changes'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFavEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center hover:bg-zinc-200"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Avatar Live Preview & Color Selector */}
              <div className="flex flex-col items-center py-2 space-y-2.5">
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-b ${favFormBg} flex items-center justify-center text-white font-black text-base shadow-md border-2 border-white`}
                >
                  {favFormName.trim()
                    ? favFormName
                      .trim()
                      .split(' ')
                      .map((p) => p[0] || '')
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                    : 'U'}
                </div>

                <div className="flex items-center gap-2">
                  {avatarGradients.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFavFormBg(g)}
                      className={`w-6 h-6 rounded-full bg-gradient-to-b ${g} transition ${favFormBg === g ? 'ring-2 ring-zinc-900 ring-offset-2' : ''
                        }`}
                    />
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveContact} className="space-y-3.5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    {isAk ? 'အမည် (အင်္ဂလိပ်)' : 'Recipient Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={favFormName}
                    onChange={(e) => setFavFormName(e.target.value)}
                    placeholder="e.g. User"
                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Burmese Name */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    {isAk ? 'မြန်မာအမည် / မှတ်ချက်' : 'Burmese Name / Note (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={favFormMm}
                    onChange={(e) => setFavFormMm(e.target.value)}
                    placeholder="e.g. မြတ်စိုး"
                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Phone / Account ID */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    {isAk ? 'ဖုန်းနံပါတ် သို့မဟုတ် Péthar ID' : 'Phone Number or Account ID'}
                  </label>
                  <input
                    type="text"
                    required
                    value={favFormPhone}
                    onChange={(e) => setFavFormPhone(e.target.value)}
                    placeholder="e.g. 09951234567 or ARAK-1024"
                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Bank / Method */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    {isAk ? 'ဘဏ် / ငွေပေးချေမှုစနစ်' : 'Bank / Payment Method'}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {banksList.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setFavFormBank(b)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition ${favFormBank === b
                          ? 'bg-[#9E1B32] text-white border-[#9E1B32]'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                          }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    {isAk ? 'အမျိုးအစား' : 'Category'}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {categoriesList.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFavFormCategory(cat)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg border transition ${favFormCategory === cat
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-[#D91624] hover:bg-[#b0101b] text-white font-extrabold text-xs shadow-md transition cursor-pointer"
                  >
                    {editingFavIndex !== null
                      ? isAk
                        ? 'ပြင်ဆင်မှု သိမ်းဆည်းမည် (PIN စစ်မည်)'
                        : 'Save Changes (Verify PIN)'
                      : isAk
                        ? 'အသစ်ထည့်မည် (PIN စစ်မည်)'
                        : 'Add Contact (Verify PIN)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL 2: DELETE CONFIRMATION DIALOG ── */}
        {favDeleteTarget && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-3.5 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-[#D91624] flex items-center justify-center mx-auto">
                <Trash2 size={22} />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-zinc-900">
                  {isAk ? 'စိတ်ကြိုက်စာရင်းမှ ဖျက်ရန်' : 'Delete Favourite'}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {isAk
                    ? `"${favDeleteTarget.contact.name}" ကို စိတ်ကြိုက်စာရင်းမှ ဖျက်ပစ်ရန် သေချာပါသလား? အတည်ပြုရန် လျှို့ဝှက်နံပါတ် ရိုက်ထည့်ရပါမည်။`
                    : `Are you sure you want to remove "${favDeleteTarget.contact.name}" from your favourites? You will need to enter your 6-digit PIN to confirm.`}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFavDeleteTarget(null)}
                  className="flex-1 h-10 rounded-xl bg-zinc-100 text-zinc-700 font-bold text-xs hover:bg-zinc-200 transition cursor-pointer"
                >
                  {isAk ? 'မလုပ်တော့ပါ' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteContact}
                  className="flex-1 h-10 rounded-xl bg-[#D91624] text-white font-bold text-xs hover:bg-[#b0101b] transition cursor-pointer shadow-xs"
                >
                  {isAk ? 'ဖျက်မည်' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL 3: 6-DIGIT PIN CODE AUTHORIZATION SHEET (MANDATORY REQUIREMENT) ── */}
        {favPinModalOpen && favPinAction && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto" />

              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-rose-50 border-2 border-rose-100 text-[#D91624] flex items-center justify-center mx-auto">
                  <Shield size={26} />
                </div>
                <h3 className="text-lg font-black text-zinc-900">
                  {favPinAction.title}
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  {favPinAction.description}
                </p>
              </div>

              {/* 6 OTP Dots */}
              <div className="flex items-center justify-center gap-3 py-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const isFilled = idx < favPinInput.length
                  const isActive = idx === favPinInput.length
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${isFilled
                        ? 'bg-[#D4AF37] border-[#D4AF37] scale-110'
                        : isActive
                          ? 'border-[#D4AF37]'
                          : 'border-zinc-300'
                        }`}
                    />
                  )
                })}
              </div>

              {/* Error or Hint */}
              <div className="text-center h-4">
                {favPinError ? (
                  <span className="text-xs font-bold text-[#D91624]">
                    {favPinError}
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Default PIN: 123456
                  </span>
                )}
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map(
                  (keyVal) => (
                    <button
                      key={keyVal}
                      type="button"
                      onClick={() => handlePinDigit(keyVal)}
                      className="h-13 rounded-2xl bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 text-xl font-bold text-zinc-900 flex items-center justify-center transition cursor-pointer"
                    >
                      {keyVal}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={handlePinDelete}
                  className="h-13 rounded-2xl bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 text-zinc-700 flex items-center justify-center transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setFavPinModalOpen(false)
                    setFavPinAction(null)
                    setFavPinInput('')
                  }}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-800 cursor-pointer"
                >
                  {isAk ? 'မလုပ်တော့ပါ' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
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
                      iOS | iPhone 14 Pro Max (User’s iPhone)
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
                  className={`w-12 h-7 rounded-full p-0.5 transition cursor-pointer ${hideInfoToggle ? 'bg-[#3B82F6]' : 'bg-zinc-300'
                    }`}
                >
                  <span
                    className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${hideInfoToggle ? 'translate-x-5' : 'translate-x-0'
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
                    className={`w-12 h-7 rounded-full p-0.5 transition shrink-0 cursor-pointer ${showReceivingProfileToggle ? 'bg-[#3B82F6]' : 'bg-zinc-300'
                      }`}
                  >
                    <span
                      className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${showReceivingProfileToggle ? 'translate-x-5' : 'translate-x-0'
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
                    className={`w-12 h-7 rounded-full p-0.5 transition shrink-0 cursor-pointer ${biometricConsentToggle ? 'bg-[#3B82F6]' : 'bg-zinc-300'
                      }`}
                  >
                    <span
                      className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${biometricConsentToggle ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>

                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText size={19} className="text-zinc-700 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-zinc-900 leading-snug">
                      Services I consent to use my personal data
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-zinc-400 shrink-0" />
                </div>

                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText size={19} className="text-zinc-700 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-zinc-900 leading-snug">
                      Data use consent for analytics and marketing purposes
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-zinc-400 shrink-0" />
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

    if (accountSubScreen === 'personal_info') {
      return (
        <div className="min-h-full bg-[#F4F5F8] flex flex-col text-zinc-900 pb-10">
          {/* Top Bar */}
          <div className="bg-white px-4 pt-5 pb-3.5 flex items-center justify-between border-b border-zinc-200/80 sticky top-0 z-20">
            <button
              type="button"
              onClick={() => setAccountSubScreen('main')}
              className="w-8 h-8 flex items-center justify-center text-zinc-800 cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-base font-bold text-zinc-900">
              {isAk ? 'ကိုယ်ရေးအချက်အလက် (Profile)' : 'Profile'}
            </h1>
            <div className="w-8" />
          </div>

          {/* Top Avatar Banner */}
          <div className="bg-[#F1F2F4] py-7 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-amber-300 via-orange-400 to-zinc-800 flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-white">
                    {profile.name.charAt(0)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerSettingsToast(
                    isAk
                      ? 'ပရိုဖိုင်ပုံ ပြောင်းလဲရန် အသင့်ဖြစ်ပါပြီ'
                      : 'Profile photo upload ready'
                  )
                }
                className="w-8 h-8 rounded-full bg-white shadow-md border border-zinc-200 flex items-center justify-center text-zinc-700 absolute bottom-0 right-0 cursor-pointer"
              >
                <Camera size={15} />
              </button>
            </div>
          </div>

          {/* Show all information toggle row */}
          <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-zinc-100">
            <span className="text-sm font-medium text-zinc-800">
              {isAk ? 'အချက်အလက်အားလုံး ဖော်ပြမည်' : 'Show all information'}
            </span>
            <button
              type="button"
              onClick={() => setShowAllProfileInfo((v) => !v)}
              className={`w-12 h-7 rounded-full p-0.5 transition cursor-pointer ${showAllProfileInfo ? 'bg-[#2563EB]' : 'bg-zinc-300'
                }`}
            >
              <span
                className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${showAllProfileInfo ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          {/* Basic information */}
          <div className="bg-white mt-2.5 px-5 py-5 space-y-4">
            <h2 className="text-base font-bold text-zinc-900">
              {isAk ? 'အခြေခံ အချက်အလက်' : 'Basic information'}
            </h2>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-zinc-500">
                <Smartphone size={15} className="text-zinc-400" />
                <span>{isAk ? 'ဖုန်းနံပါတ်' : 'Mobile number'}</span>
              </div>
              <span className="font-semibold text-zinc-900">
                {showAllProfileInfo ? profileDetails.mobile : '095-***-8295'}
              </span>
            </div>
          </div>

          {/* Personal information */}
          <div className="bg-white mt-2.5 px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">
                {isAk ? 'ကိုယ်ရေး အချက်အလက်' : 'Personal information'}
              </h2>
              <button
                type="button"
                onClick={() => setPassportEditModalOpen(true)}
                className="text-sm font-semibold text-[#0284C7] hover:underline cursor-pointer"
              >
                {isAk ? 'ပြင်ဆင်ရန်' : 'Edit'}
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">{isAk ? 'အမည်' : 'Name'}</span>
                <span className="font-medium text-zinc-900">
                  {profileDetails.firstName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">
                  {isAk ? 'မျိုးရိုးအမည်' : 'Last name'}
                </span>
                <span className="font-medium text-zinc-900">
                  {profileDetails.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">
                  {isAk ? 'နိုင်ငံကူးလက်မှတ် အမှတ်' : 'Passport number'}
                </span>
                <span className="font-medium text-zinc-900">
                  {showAllProfileInfo ? profileDetails.passportNumber : 'MJ3***66'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">
                  {isAk ? 'မွေးသက္ကရာဇ်' : 'Date of birth'}
                </span>
                <span className="font-medium text-zinc-900">
                  {showAllProfileInfo ? profileDetails.dob : '** May 2003'}
                </span>
              </div>
            </div>
          </div>

          {/* Current address */}
          <div className="bg-white mt-2.5 px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">
                {isAk ? 'လက်ရှိ နေရပ်လိပ်စာ' : 'Current address'}
              </h2>
              <button
                type="button"
                onClick={() => setAddressEditModalOpen(true)}
                className="text-sm font-semibold text-[#0284C7] hover:underline cursor-pointer"
              >
                {isAk ? 'ပြင်ဆင်ရန်' : 'Edit'}
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="text-zinc-500 leading-snug">
                  Subdistrict, district, province, postal code
                </span>
                <span className="font-medium text-zinc-900 text-right leading-snug">
                  {profileAddress.subdistrict}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-zinc-500">{isAk ? 'လိပ်စာ' : 'Address'}</span>
                <span className="font-medium text-zinc-900 text-right leading-snug max-w-[220px]">
                  {profileAddress.street}
                </span>
              </div>
            </div>
          </div>

          {/* How to edit your personal information (Passport Modal) */}
          {passportEditModalOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-5 animate-in fade-in"
              onClick={() => setPassportEditModalOpen(false)}
            >
              <div
                className="w-full max-w-sm bg-white rounded-[28px] p-6 text-center space-y-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Passport Graphic Illustration */}
                <div className="py-2 flex items-center justify-center gap-3">
                  <div className="w-24 h-32 rounded-xl bg-[#1E3A8A] text-white p-3 flex flex-col items-center justify-between shadow-md">
                    <span className="text-[9px] font-extrabold tracking-widest text-amber-200">
                      PASSPORT
                    </span>
                    <div className="w-11 h-11 rounded-full border border-amber-200/80 flex items-center justify-center">
                      <Globe size={22} className="text-amber-200" />
                    </div>
                    <div className="w-5 h-2.5 rounded-xs border border-amber-200/80" />
                  </div>

                  <div className="w-40 h-32 rounded-xl bg-[#F0F9FF] border-2 border-emerald-500 p-2.5 flex flex-col justify-between text-left shadow-sm relative">
                    <div className="text-[8px] font-bold text-[#1E3A8A] tracking-wider">
                      PASSPORT · VERIFIED
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-11 rounded-md bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-black text-xs shrink-0">
                        M
                      </div>
                      <div className="text-[7px] text-zinc-700 font-mono leading-tight space-y-0.5">
                        <div className="font-bold text-zinc-900">User</div>
                        <div>NO: MJ310666</div>
                        <div>DOB: 13 MAY 2003</div>
                      </div>
                    </div>
                    <div className="text-[6px] font-mono text-zinc-400 truncate">
                      P&lt;MMR&lt;USER&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-zinc-900">
                    {isAk
                      ? 'ကိုယ်ရေးအချက်အလက် ပြင်ဆင်နည်း'
                      : 'How to edit your personal information'}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {isAk
                      ? 'ဤအချက်အလက်များသည် သင်၏ နိုင်ငံကူးလက်မှတ်မှ ဖြစ်ပါသည်။ ပြင်ဆင်လိုပါက Document Update စာမျက်နှာသို့ သွား၍ သင်၏ ပတ်စ်ပို့ကို စကင်ဖတ်ပေးပါ။'
                      : 'This info is from your passport. To edit it, please go to the Document Update page and scan your passport. Once approved, your details will be updated automatically.'}
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPassportEditModalOpen(false)
                      setKycFlowModalOpen(true)
                    }}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#F97316] text-white font-bold text-sm shadow-md hover:brightness-105 transition cursor-pointer"
                  >
                    {isAk ? 'စာရွက်စာတမ်း အသစ်တင်ရန်' : 'Go to Document Update'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassportEditModalOpen(false)}
                    className="w-full py-3 rounded-full border border-[#F97316] text-[#F97316] font-bold text-sm hover:bg-orange-50 transition cursor-pointer"
                  >
                    {isAk ? 'ပိတ်မည်' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Address Modal */}
          {addressEditModalOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-5 animate-in fade-in"
              onClick={() => setAddressEditModalOpen(false)}
            >
              <div
                className="w-full max-w-sm bg-white rounded-[28px] p-6 space-y-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-base font-extrabold text-zinc-900">
                  {isAk ? 'လက်ရှိ နေရပ်လိပ်စာ ပြင်ဆင်ရန်' : 'Edit Current Address'}
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-500 font-semibold block mb-1">
                      Subdistrict, District, Province, Postal Code
                    </label>
                    <input
                      type="text"
                      value={profileAddress.subdistrict}
                      onChange={(e) =>
                        setProfileAddress((prev) => ({
                          ...prev,
                          subdistrict: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 font-medium text-zinc-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-500 font-semibold block mb-1">
                      Street / Building Address
                    </label>
                    <input
                      type="text"
                      value={profileAddress.street}
                      onChange={(e) =>
                        setProfileAddress((prev) => ({
                          ...prev,
                          street: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 font-medium text-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddressEditModalOpen(false)}
                    className="py-2.5 rounded-full border border-zinc-300 text-zinc-700 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressEditModalOpen(false)
                      triggerSettingsToast('Address updated successfully')
                    }}
                    className="py-2.5 rounded-full bg-[#0D9488] text-white font-bold text-xs cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (accountSubScreen === 'app_settings') {
      return (
        <div className="min-h-full bg-[#F4F5F8] flex flex-col text-zinc-900 pb-10">
          <div className="bg-white px-4 pt-5 pb-3.5 flex items-center justify-between border-b border-zinc-200/80 sticky top-0 z-20">
            <button
              type="button"
              onClick={() => setAccountSubScreen('main')}
              className="w-8 h-8 flex items-center justify-center text-zinc-800 cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-base font-bold text-zinc-900">
              {isAk ? 'အက်ပ် ဆက်တင်များ' : 'Application Settings'}
            </h1>
            <div className="w-8" />
          </div>

          <div className="p-4 space-y-2.5">
            <h2 className="text-xs font-bold text-zinc-600 px-1">
              {isAk ? 'အက်ပ် စိတ်ကြိုက်ပြင်ဆင်မှု' : 'Customize app'}
            </h2>

            <div className="bg-white rounded-2xl divide-y divide-zinc-100 border border-zinc-200/70 shadow-2xs">
              <button
                type="button"
                onClick={() => setLang && setLang(isAk ? 'en' : 'ak')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Globe size={20} className="text-zinc-800" />
                  <span className="text-sm font-medium text-zinc-900">
                    {isAk ? 'ဘာသာစကား (Language)' : 'Language'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                  <span>{isAk ? 'ရခိုင် (AK)' : 'English'}</span>
                  <ChevronRight size={18} className="text-zinc-400" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScreen('notifications')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Bell size={20} className="text-zinc-800" />
                  <span className="text-sm font-medium text-zinc-900">
                    {isAk ? 'အသိပေးချက်များ (Notification)' : 'Notification'}
                  </span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </button>

              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 flex-1">
                  <Download size={20} className="text-zinc-800 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-zinc-900">
                      {isAk ? 'ပြေစာ အလိုအလျောက် သိမ်းဆည်းမည်' : 'Auto-save receipt'}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {isAk
                        ? 'ငွေလွှဲပြီးတိုင်း ပြေစာကို ဖုန်းထဲသို့ အလိုအလျောက် သိမ်းဆည်းပေးမည်'
                        : 'Allow automatic receipt saving after transfers and payments'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSaveReceipt((v) => !v)}
                  className={`w-12 h-7 rounded-full p-0.5 transition shrink-0 cursor-pointer ${autoSaveReceipt ? 'bg-[#2563EB]' : 'bg-zinc-300'
                    }`}
                >
                  <span
                    className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${autoSaveReceipt ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
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

    const isAndroidDevice =
      typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)

    return (
      <div className="min-h-full bg-[#F4F5F8] text-zinc-900 pb-12">

        {/* Toast Feedback Banner */}
        {settingsNoticeToast && (
          <div className="mx-4 mt-3 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold text-center shadow-md animate-in fade-in">
            {settingsNoticeToast}
          </div>
        )}

        <div className="p-4 space-y-5">
          {/* ── Top Profile Card or Welcome Sign-In Card when logged out ── */}
          {!isAuthenticated ? (
            renderWelcomeSignInCard()
          ) : (
            <div className="bg-white rounded-[28px] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] border border-zinc-100 relative">
              {/* Centered Avatar with Edit Pencil Badge */}
              <div className="flex flex-col items-center text-center pt-1">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountSubScreen('personal_info')}
                    className="w-20 h-20 rounded-full bg-gradient-to-b from-[#29B6F6] to-[#0288D1] flex items-center justify-center text-white shadow-md overflow-hidden border-2 border-white cursor-pointer"
                  >
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={40} className="text-white" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountSubScreen('personal_info')}
                    aria-label="Edit Personal Information"
                    className="w-7 h-7 rounded-full bg-[#10B981] text-white border-2 border-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 shadow-xs cursor-pointer"
                  >
                    <Pencil size={12} />
                  </button>
                </div>

                {/* Name + User Badge */}
                <div className="mt-3.5 flex items-center justify-center gap-2">
                  <h2 className="text-base font-extrabold text-zinc-900">
                    {profile.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-xs font-semibold">
                    User
                  </span>
                </div>

                {/* Email */}
                <p className="text-xs text-zinc-400 mt-1">
                  {profileDetails.email}
                </p>

                {/* ID Verification Status Row */}
                <div className="mt-4 pt-3.5 border-t border-zinc-100 w-full flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck size={16} />
                    </div>
                    <span className="text-sm font-bold text-zinc-900">
                      {isAk ? 'မှတ်ပုံတင် အတည်ပြုချက်' : 'ID Verification'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setKycFlowModalOpen(true)}
                    className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${isVerified
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-[#D91624] border border-rose-200'
                      }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>{isVerified ? 'Verified' : 'Unverified'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 1: Account Setting (matches wireframe) ── */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-zinc-500 px-1">
              {isAk ? 'အကောင့် ဆက်တင်များ' : 'Account Setting'}
            </h3>
            <div className="bg-white rounded-2xl divide-y divide-zinc-100 border border-zinc-100 shadow-[0_4px_16px_rgba(15,23,42,0.03)]">
              <button
                type="button"
                onClick={() => setAccountSubScreen('personal_info')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <span className="text-sm font-bold text-zinc-900">
                    {isAk ? 'ကိုယ်ရေးအချက်အလက်နှင့် လိပ်စာ' : 'Personal Information'}
                  </span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => setLang && setLang(isAk ? 'en' : 'ak')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center">
                    <Globe size={18} />
                  </div>
                  <span className="text-sm font-bold text-zinc-900">
                    {isAk ? 'ဘာသာစကား' : 'Language'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-zinc-500">
                  <span>{isAk ? 'ရခိုင်' : 'English'}</span>
                  <ChevronRight size={18} className="text-zinc-400" />
                </div>
              </button>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center">
                    <Download size={18} />
                  </div>
                  <span className="text-sm font-bold text-zinc-900">
                    {isAk ? 'ပြေစာ အလိုအလျောက် သိမ်းဆည်းမည်' : 'Auto save receipt'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSaveReceipt((v) => !v)}
                  className={`w-12 h-7 rounded-full p-0.5 transition cursor-pointer ${autoSaveReceipt ? 'bg-[#2563EB]' : 'bg-zinc-300'
                    }`}
                >
                  <span
                    className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${autoSaveReceipt ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Security Settings (matches wireframe) ── */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-zinc-500 px-1">
              {isAk ? 'လုံခြုံရေး ဆက်တင်များ' : 'Security Settings'}
            </h3>
            <div className="bg-white rounded-2xl divide-y divide-zinc-100 border border-zinc-100 shadow-[0_4px_16px_rgba(15,23,42,0.03)]">
              <button
                type="button"
                onClick={() => {
                  if (isAndroidDevice) {
                    setBiometricLoginEnabled((v) => !v)
                    triggerSettingsToast(
                      biometricLoginEnabled
                        ? (isAk ? 'လက်ဗွေ ပိတ်ထားသည်' : 'Biometric login disabled')
                        : (isAk ? 'လက်ဗွေ ဖွင့်ထားသည်' : 'Biometric login enabled')
                    )
                  } else {
                    setFaceIdEnabled((v) => !v)
                    triggerSettingsToast(
                      faceIdEnabled
                        ? (isAk ? 'Face ID ပိတ်ထားသည်' : 'Face ID disabled')
                        : (isAk ? 'Face ID ဖွင့်ထားသည်' : 'Face ID enabled')
                    )
                  }
                }}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center">
                    <Fingerprint size={18} />
                  </div>
                  <span className="text-sm font-bold text-zinc-900">
                    {isAk ? 'လက်ဗွေနှင့် မျက်နှာမှတ်သား' : 'Fingerprint & Face ID'}
                  </span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() =>
                  triggerSettingsToast(
                    isAk
                      ? '၆ လုံး လျှို့ဝှက် PIN ပြောင်းလဲရန် OTP ပေးပို့ပြီးပါပြီ'
                      : '6-digit PIN reset instructions sent to your verified email'
                  )
                }
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center">
                    <Lock size={18} />
                  </div>
                  <span className="text-sm font-bold text-zinc-900">
                    {isAk ? 'PIN စီမံခန့်ခွဲမှု' : 'PIN Management'}
                  </span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => setAccountSubScreen('security_checkup')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="text-sm font-bold text-zinc-900">
                    {isAk ? 'လုံခြုံရေး စစ်ဆေးချက်' : 'Security Checkup'}
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
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center">
                    <Smartphone size={18} />
                  </div>
                  <span className="text-sm font-bold text-zinc-900">
                    {isAk ? 'စက်ပစ္စည်း စီမံခန့်ခွဲမှု' : 'Device Management'}
                  </span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => setChatModalOpen(true)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-[#0284C7] flex items-center justify-center">
                    <Headphones size={18} />
                  </div>
                  <span className="text-sm font-bold text-zinc-900">
                    {isAk ? 'Péthar အကူအညီနှင့် ချက်တင်' : 'Chat with Support'}
                  </span>
                </div>
                <ChevronRight size={18} className="text-zinc-400" />
              </button>
            </div>
          </div>

          {/* ── Bottom Log Out Button & Footer (Dropped Switch Account) ── */}
          <div className="space-y-3 pt-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setShowSignOutModal(true)}
                className="w-full py-3.5 rounded-2xl bg-[#FDECEC] hover:bg-[#FBD8D8] text-[#D91624] font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut size={17} />
                <span>{isAk ? 'အကောင့်မှ ထွက်မည်' : 'Log Out'}</span>
              </button>
            )}

            <div className="pt-2 text-center text-xs font-medium text-zinc-400">
              ©Péthar App - Version:{' '}
              <span className="text-[#2A8B9D] font-bold">1.0.0</span>
            </div>
          </div>
        </div>

        {/* Quit App Confirmation Modal (Home Screen) */}
        {showQuitAppModal && (
          <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-5 animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-full bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center mx-auto text-[#D91624]">
                <Power size={26} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-zinc-900">
                  {isAk ? 'အက်ပ်မှ ထွက်လိုပါသလား?' : 'Quit Péthar App?'}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {isAk
                    ? 'အက်ပ်ကို ပိတ်ပြီး ထွက်ခွာပါမည်။ သင့်အကောင့် ဆက်လက်ဝင်ရောက်ထားမည်ဖြစ်ပါသည်။'
                    : 'Are you sure you want to exit and quit the app? Your account remains signed in.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowQuitAppModal(false)}
                  className="py-3 rounded-full border border-zinc-200 text-zinc-700 font-bold text-sm hover:bg-zinc-50 transition cursor-pointer"
                >
                  {isAk ? 'မထွက်ပါ' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuitAppModal(false)
                    if (window.history.length > 1) {
                      window.history.back()
                    } else {
                      window.close()
                    }
                  }}
                  className="py-3 rounded-full bg-[#D91624] text-white font-bold text-sm shadow-[0_6px_18px_rgba(217,22,36,0.3)] hover:brightness-105 transition cursor-pointer"
                >
                  {isAk ? 'ထွက်မည်' : 'Quit App'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sign Out Confirmation Modal (Matching Screenshot 8.21.47 AM) */}
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
                  className="py-3 rounded-full border border-[#F97316] text-[#F97316] font-bold text-sm hover:bg-orange-50 transition cursor-pointer"
                >
                  {isAk ? 'မထွက်ပါ' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSignOutModal(false)
                    localStorage.removeItem('pethar_logged_in')
                    import('../../lib/supabase').then((m) => m.signOut()).catch(() => { })
                    setIsAuthenticated(false)
                    setScreen('home')
                  }}
                  className="py-3 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#F97316] text-white font-bold text-sm shadow-[0_6px_18px_rgba(249,115,22,0.35)] hover:brightness-105 transition cursor-pointer"
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

  if (screen === 'pay') {
    return renderPayInterfaceScreen()
  }

  if (screen === 'history') {
    return renderHistoryScreen()
  }

  if (screen === 'topup') {
    return renderTopupScreen()
  }

  if (screen === 'bills') {
    return renderBillPaymentScreen()
  }

  if (screen === 'favourites') {
    return renderFavouritesScreen()
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
        return <Receive go={setScreen} lang={lang} profile={profile} theme={theme} />
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
        ? 'bg-gradient-to-b from-[#D91624]/[0.14] to-[#D91624]/[0.06] text-[#D91624] border border-[#D91624]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_4px_12px_rgba(217,22,36,0.12)] font-bold'
        : 'bg-gradient-to-b from-[#D91624]/25 to-[#D91624]/10 text-[#FF3B47] border border-[#D91624]/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_14px_rgba(217,22,36,0.28)] font-bold'
    }
    return isLight
      ? 'border border-transparent text-zinc-800 hover:text-[#D91624] font-semibold'
      : 'border border-transparent text-zinc-300 hover:text-white font-semibold'
  }

  return (
    <div
      className={`h-[100dvh] max-h-[100dvh] w-full flex justify-center overflow-hidden ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#05070B]'
        }`}
    >
      <div
        className={`w-full max-w-[480px] h-[100dvh] max-h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden ${isLight ? 'bg-[#F4F5F8] text-gray-900' : 'bg-[#090D14] text-white'
          }`}
      >
        {/* Sub-screen Back Bar (No Logo on non-Home pages) */}
        {isSubScreen && (
          <div
            className={`px-4 py-2.5 flex items-center justify-between border-b shrink-0 ${isLight
              ? 'bg-white border-gray-200 text-gray-900'
              : 'bg-[#0E1522] border-white/10 text-white'
              }`}
          >
            <button
              type="button"
              onClick={() => setScreen('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#D91624]/12 text-[#D91624] hover:bg-[#D91624]/20 transition-colors cursor-pointer"
            >
              <ChevronLeft size={15} />
              <span>{isAk ? 'ပင်မသို့' : 'Back to Wallet'}</span>
            </button>
          </div>
        )}

        {/* Active Mobile Screen Content */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain pb-28">{renderScreen()}</div>

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
            SUPPORT HUB & LIVE CHAT SHEET (MATCHING REFERENCE SCREENSHOT)
           ═══════════════════════════════════════════════════════════════════ */}
        {chatModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end justify-center animate-in fade-in"
            onClick={() => {
              setChatModalOpen(false)
              setSupportView('hub')
            }}
          >
            <div
              className="w-full max-w-[480px] h-[92dvh] rounded-t-[34px] overflow-hidden shadow-2xl text-white flex flex-col bg-gradient-to-b from-[#1CA3B8] via-[#135E6B] via-42% to-[#0D0F12] border-t border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar: App Badge / Back on Left + Agent Avatar & Close X on Right */}
              <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
                {supportView === 'hub' ? (
                  <img
                    src="/pethar-logo-red-white.svg"
                    alt="Péthar"
                    className="w-9 h-9 object-contain"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setSupportView('hub')}
                    className="h-10 px-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 inline-flex items-center gap-1.5 text-xs font-bold text-white transition cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    <span>{isAk ? 'နောက်သို့' : 'Back'}</span>
                  </button>
                )}

                <div className="flex items-center gap-2.5">
                  {/* Support Concierge Avatar */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#38BDF8] to-[#0284C7] border-2 border-white/40 flex items-center justify-center shadow-md overflow-hidden">
                    <Headphones size={20} className="text-white" />
                  </div>

                  {/* Circular Close Button */}
                  <button
                    type="button"
                    aria-label="Close Support"
                    onClick={() => {
                      setChatModalOpen(false)
                      setSupportView('hub')
                    }}
                    className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 flex items-center justify-center text-white transition cursor-pointer"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              {supportView === 'hub' && (
                <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4 space-y-3.5">
                  {/* Greeting Header */}
                  <div className="px-2 pb-3">
                    <div className="text-2xl font-extrabold text-white/75 tracking-tight flex items-center gap-2">
                      <span>{isAk ? 'မင်္ဂလာပါ' : 'Hi there'}</span>
                      <span>👋</span>
                    </div>
                    <h2 className="text-[28px] leading-tight font-extrabold text-white mt-1 tracking-tight">
                      {isAk ? 'မည်သို့ ကူညီပေးရမလဲ?' : 'How can we help?'}
                    </h2>
                  </div>

                  {/* Card 1: Messages & Help */}
                  <div className="bg-[#171A1F]/95 rounded-2xl border border-white/10 divide-y divide-white/10 shadow-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setSupportTicketTopic('Messages')
                        setSupportView('chat')
                      }}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition cursor-pointer"
                    >
                      <span className="text-[15px] font-bold text-white">
                        {isAk ? 'မက်ဆေ့ချ်များ (Messages)' : 'Messages'}
                      </span>
                      <MessageSquare size={18} className="text-[#29B6F6] fill-[#29B6F6]/20" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSupportView('help')}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition cursor-pointer"
                    >
                      <span className="text-[15px] font-bold text-white">
                        {isAk ? 'အကူအညီ (Help)' : 'Help'}
                      </span>
                      <HelpCircle size={19} className="text-[#29B6F6]" />
                    </button>
                  </div>

                  {/* Card 2: Create a ticket */}
                  <div className="bg-[#171A1F]/95 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                    <div className="px-5 pt-4 pb-2">
                      <h3 className="text-base font-extrabold text-white">
                        {isAk ? 'အကူအညီ လက်မှတ်ဖွင့်ရန်' : 'Create a ticket'}
                      </h3>
                    </div>

                    <div className="divide-y divide-white/10">
                      {[
                        {
                          label: isAk ? 'ဆုလာဘ်နှင့် မစ်ရှင်များ' : 'Mission Rewards',
                          icon: Ticket,
                        },
                        {
                          label: isAk ? 'QR စကင် ငွေပေးချေမှု ပြဿနာ' : 'Scan to Pay Issues',
                          icon: AlertCircle,
                        },
                        {
                          label: isAk ? 'အကောင့် အတည်ပြုချက် (KYC) ပြဿနာ' : 'KYC Issues',
                          icon: BookUser,
                        },
                        {
                          label: isAk
                            ? 'စနစ်ချို့ယွင်းချက်နှင့် အကြံပြုချက်'
                            : 'Bug Report - Enhancement',
                          icon: Bug,
                        },
                      ].map((item) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              setSupportTicketTopic(item.label)
                              setChatMessages((prev) => [
                                ...prev,
                                {
                                  sender: 'bot',
                                  text: `Ticket category selected: "${item.label}". Please describe your issue below and our specialist team will resolve it promptly.`,
                                },
                              ])
                              setSupportView('chat')
                            }}
                            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition cursor-pointer"
                          >
                            <span className="text-[15px] font-medium text-zinc-100">
                              {item.label}
                            </span>
                            <Icon size={18} className="text-[#29B6F6] shrink-0" />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Card 3: Search for help */}
                  <button
                    type="button"
                    onClick={() => setSupportView('help')}
                    className="w-full bg-[#171A1F]/95 rounded-2xl border border-white/10 px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 shadow-xl transition cursor-pointer"
                  >
                    <span className="text-[15px] font-bold text-white">
                      {isAk ? 'အကူအညီ ရှာဖွေရန်' : 'Search for help'}
                    </span>
                    <Search size={18} className="text-[#29B6F6]" />
                  </button>

                  {/* Card 4: Send us a message */}
                  <button
                    type="button"
                    onClick={() => {
                      setSupportTicketTopic('Live Concierge')
                      setSupportView('chat')
                    }}
                    className="w-full bg-[#171A1F]/95 rounded-2xl border border-white/10 px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 shadow-xl transition cursor-pointer"
                  >
                    <div>
                      <div className="text-[15px] font-bold text-white">
                        {isAk ? 'မက်ဆေ့ချ် ပေးပို့ရန်' : 'Send us a message'}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {isAk
                          ? 'AI အေးဂျင့်နှင့် အဖွဲ့မှ ကူညီပေးပါမည်'
                          : 'AI Agent and team can help'}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#38BDF8] to-[#0284C7] border-2 border-[#171A1F] flex items-center justify-center text-white text-xs font-black">
                        AI
                      </div>
                      <div className="w-8 h-8 rounded-full bg-teal-600 border-2 border-[#171A1F] -ml-2 flex items-center justify-center text-white">
                        <User size={14} />
                      </div>
                      <HelpCircle size={17} className="text-[#29B6F6] ml-2" />
                    </div>
                  </button>
                </div>
              )}

              {supportView === 'help' && (
                <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2 space-y-3.5">
                  <div className="bg-[#171A1F] rounded-2xl border border-white/15 px-4 py-3 flex items-center gap-2.5">
                    <Search size={17} className="text-[#29B6F6] shrink-0" />
                    <input
                      type="text"
                      value={helpSearchQuery}
                      onChange={(e) => setHelpSearchQuery(e.target.value)}
                      placeholder="Search help articles (KYC, QR Pay, USD)..."
                      className="w-full bg-transparent text-sm text-white placeholder-zinc-400 focus:outline-none"
                    />
                  </div>

                  <div className="bg-[#171A1F]/95 rounded-2xl border border-white/10 divide-y divide-white/10 overflow-hidden">
                    {[
                      {
                        q: 'How to verify my passport (KYC)?',
                        a: 'Go to Profile > ID Verification or Personal Information > Edit to scan your passport and unlock all wallet functions.',
                      },
                      {
                        q: 'How do Scan to Pay and Receive QR work?',
                        a: 'Tap the center Scan button or Pay on Home to scan any merchant or peer QR code with zero fees.',
                      },
                      {
                        q: 'How does the 1:1 USD / AKD parity work?',
                        a: '1 AKD (₳) is backed 1:1 by USD stablecoins (USDT, USDC, USD1) and can be converted or transferred anytime.',
                      },
                    ]
                      .filter(
                        (item) =>
                          !helpSearchQuery.trim() ||
                          item.q.toLowerCase().includes(helpSearchQuery.toLowerCase()) ||
                          item.a.toLowerCase().includes(helpSearchQuery.toLowerCase())
                      )
                      .map((item) => (
                        <div key={item.q} className="p-4 space-y-1.5">
                          <div className="text-sm font-bold text-white">{item.q}</div>
                          <div className="text-xs text-zinc-400 leading-relaxed">
                            {item.a}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {supportView === 'chat' && (
                <div className="flex-1 flex flex-col min-h-0 px-4 pb-5 pt-1">
                  <div className="px-2 pb-2 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-extrabold text-white">
                        {supportTicketTopic}
                      </div>
                      <div className="text-[11px] text-white/75">
                        AI Agent &amp; Specialist Team · Online
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-4 rounded-2xl bg-[#171A1F]/95 border border-white/10 overflow-y-auto space-y-3">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        <div
                          className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user'
                            ? 'bg-[#1CA3B8] text-white rounded-br-xs font-medium'
                            : 'bg-[#242933] border border-white/10 text-zinc-100 rounded-bl-xs'
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
                          text: 'Thank you! Our AI Agent and support team have logged your message and are assisting you right away.',
                        },
                      ])
                    }}
                    className="mt-3 p-2 rounded-full bg-[#171A1F] border border-white/15 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={isAk ? 'မက်ဆေ့ချ် ရိုက်ထည့်ပါ...' : 'Send us a message...'}
                      className="flex-1 px-3.5 py-2 bg-transparent text-xs text-white placeholder-zinc-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="w-9 h-9 rounded-full bg-[#1CA3B8] hover:bg-[#178E9F] text-white flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <SendIcon size={15} />
                    </button>
                  </form>
                </div>
              )}
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
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isVerified
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
            SIGN IN / SIGN UP MODAL (TRIGGERED FROM WELCOME CARD OR LOGGED-OUT ACTIONS)
        ═══════════════════════════════════════════════════════════════════ */}
        {authModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-5 animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/pethar-logo-red-white.svg"
                    alt="Péthar"
                    className="w-8 h-8 object-contain"
                  />
                  <h3 className="text-base font-extrabold text-zinc-900">
                    {isSignUpMode
                      ? isAk
                        ? 'ဖေ့သာ အကောင့်သစ်ဖွင့်ရန်'
                        : 'Create Péthar Account'
                      : isAk
                        ? 'ဖေ့သာ အကောင့်ဝင်ရန်'
                        : 'Sign in to Péthar'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-[#D91624] flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                    {isAk ? 'အီးမေးလ် သို့မဟုတ် ဖုန်းနံပါတ်' : 'Email or Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="[EMAIL_ADDRESS]"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-[#D91624]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                    {isAk ? 'စကားဝှက် သို့မဟုတ် PIN' : 'Password / PIN'}
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-[#D91624]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLoginError('')
                    setIsAuthenticated(true)
                    setAuthModalOpen(false)
                  }}
                  className="w-full py-3 rounded-full bg-[#D91624] hover:bg-[#B8121E] text-white font-bold text-sm shadow-md active:scale-95 transition cursor-pointer"
                >
                  {isSignUpMode
                    ? isAk
                      ? 'အကောင့်ဖွင့်မည်'
                      : 'Sign Up'
                    : isAk
                      ? 'အကောင့်ဝင်မည်'
                      : 'Sign In'}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUpMode((m) => !m)
                      setLoginError('')
                    }}
                    className="text-xs font-bold text-[#D91624] hover:underline cursor-pointer"
                  >
                    {isSignUpMode
                      ? isAk
                        ? 'အကောင့်ရှိပြီးသားလား? အကောင့်ဝင်ရန်'
                        : 'Already have an account? Sign In'
                      : isAk
                        ? 'အကောင့်မရှိသေးဘူးလား? အကောင့်သစ်ဖွင့်ရန်'
                        : 'New to Péthar? Create an account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            LIQUID GLASS FLOATING PILL NAVBAR WITH RED EFFECT
            (Home | Financial [USD Account] | Scan | Services | Account)
            Locked inside the fixed-height shell with zero layout shift
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="absolute bottom-3 left-3 right-3 z-40 pointer-events-none transform-gpu">
          <nav
            aria-label="Mobile Wallet Navigation"
            className={`pointer-events-auto relative h-[68px] px-2 rounded-full backdrop-blur-2xl saturate-180 border flex items-center justify-between transition-colors duration-150 ${isLight
              ? 'bg-white/85 border-white/90 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.95),inset_0_-1px_2px_rgba(217,22,36,0.06),0_14px_34px_rgba(15,23,42,0.14)]'
              : 'bg-[#121620]/85 border-white/15 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.22),inset_0_-1px_2px_rgba(217,22,36,0.18),0_16px_40px_rgba(0,0,0,0.7)]'
              }`}
          >
            {/* 1. Home */}
            <button
              type="button"
              onClick={() => setScreen('home')}
              className={`flex-1 basis-0 min-w-0 h-[54px] rounded-full flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 cursor-pointer select-none ${getTabClasses(
                isHomeActive
              )}`}
            >
              <span className="w-6 h-6 flex items-center justify-center shrink-0">
                <NavHomeIcon active={isHomeActive} />
              </span>
              <span className="text-[11px] h-3.5 leading-[14px] tracking-tight truncate">
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
              className={`flex-1 basis-0 min-w-0 h-[54px] rounded-full flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 cursor-pointer select-none ${getTabClasses(
                isFinancialActive
              )}`}
            >
              <span className="w-6 h-6 flex items-center justify-center shrink-0">
                <NavFinancialIcon active={isFinancialActive} />
              </span>
              <span className="text-[11px] h-3.5 leading-[14px] tracking-tight truncate">
                {isAk ? 'ဘဏ္ဍာရေး' : 'Financial'}
              </span>
            </button>

            {/* 3. Center Red Liquid Glass Scan Button */}
            <div className="px-1.5 shrink-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() =>
                  requireVerified('QR Scanner', () => {
                    setScanBottomTab('scan')
                    setScreen('scan')
                  })
                }
                aria-label="Scan QR"
                className="w-[58px] h-[58px] shrink-0 rounded-full bg-gradient-to-b from-[#FF2A38] via-[#D91624] to-[#B00E1A] text-white flex items-center justify-center transition-transform duration-150 active:scale-95 cursor-pointer border border-white/35 shadow-[inset_0_2px_2px_rgba(255,255,255,0.45),0_8px_22px_rgba(217,22,36,0.55)] hover:brightness-105"
              >
                <NavScanBracketIcon />
              </button>
            </div>

            {/* 4. Services */}
            <button
              type="button"
              onClick={() => setScreen('services')}
              className={`flex-1 basis-0 min-w-0 h-[54px] rounded-full flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 cursor-pointer select-none ${getTabClasses(
                isServicesActive
              )}`}
            >
              <span className="w-6 h-6 flex items-center justify-center shrink-0">
                <NavServicesIcon active={isServicesActive} />
              </span>
              <span className="text-[11px] h-3.5 leading-[14px] tracking-tight truncate">
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
              className={`flex-1 basis-0 min-w-0 h-[54px] rounded-full flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 cursor-pointer select-none ${getTabClasses(
                isAccountActive
              )}`}
            >
              <span className="w-6 h-6 flex items-center justify-center shrink-0">
                <NavAccountIcon active={isAccountActive} />
              </span>
              <span className="text-[11px] h-3.5 leading-[14px] tracking-tight truncate">
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
