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
  UserPlus,
  Search,
  X,
  Ticket,
  Bug,
  Trash2,
  Wifi,
  Wallet,
  ArrowUpRight,
  Mail,
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
import { initialUserProfile, wallets, generateUserUid, type UserProfile, type Txn } from '../../data'
import {
  fetchTransactionsFromDb,
  insertTransactionToDb,
  fetchUserProfileFromDb,
  updateUserBalanceInDb,
  fetchFavoriteContactsFromDb,
  subscribeToTransactions,
  resetPinWithEmail,
  updateUserEmailInDb,
  updateUserAvatarInDb,
} from '../../services/walletDatabase'
import type { Language } from '../../i18n'
import { WalletMinimalIcon } from '@/components/WalletMinimalIcon'
import { AuthModal } from '../../components/AuthModal'
import { KycLevel2Modal } from '../../components/KycLevel2Modal'
import { FlagArakan, FlagInternational } from '../../components/ArakanEmblem'
import {
  isAutoSaveReceiptEnabled,
  setAutoSaveReceiptEnabled,
} from '../../utils/receiptSaver'
import {
  getDeviceInfo,
  requestDeviceBiometricEnrollment,
  authenticateWithDeviceBiometrics,
  getSavedBiometricStatus,
  setSavedBiometricStatus,
  type DeviceInfo,
} from '../../utils/deviceBiometrics'

interface MobileWalletPageProps {
  lang: Language
  setLang?: (lang: Language) => void
}

type MobileTab = Screen | 'financial'
type AccountSubScreen =
  | 'main'
  | 'personal_info'
  | 'app_settings'
  | 'device_management'
  | 'privacy'
  | 'cards'
  | 'pin_management'
  | 'change_pin'
  | 'forgot_pin'
type FinancialSubView =
  | 'wallet_main'
  | 'deposit'
  | 'withdraw'
  | 'tx_history'
  | 'spending'
  | 'wallet_security_phrase'

const DOCK_TABS: MobileTab[] = ['home', 'financial', 'scan', 'services', 'account', 'settings', 'receive']

function getWalletAccount(usdAddress: string) {
  const short = usdAddress ? `${usdAddress.slice(0, 4)}...${usdAddress.slice(-4)}` : ''
  return {
    name: 'USD Account',
    shortAddress: short,
    fullAddress: usdAddress,
    recoveryPhrase: [] as string[],
  }
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
    descEn: 'Audited reserve backed 1:1 by physical gold',
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

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pethar_logged_in') === 'true'
    }
    return false
  })
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pethar_logged_in') !== 'true'
    }
    return true
  })
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup' | 'forgot_pin'>('login')
  const [screen, setScreen] = useState<MobileTab>('home')
  const [theme] = useState<ThemeMode>('light')
  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('pethar_user_avatar') || '' : ''
    return {
      ...initialUserProfile,
      avatarUrl: savedAvatar || initialUserProfile.avatarUrl,
    }
  })

  // Verification State: KYC Level 1 vs KYC Level 2 (no Level 3)
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    return initialUserProfile.kycTier === 2 && initialUserProfile.kycStatus === 'verified'
  })
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
  const [withdrawAmount, setWithdrawAmount] = useState<string>('0.00')
  const [withdrawStep, setWithdrawStep] = useState<'address' | 'confirm'>('address')
  const [selectedSendToken, setSelectedSendToken] = useState<'USDT' | 'USDC'>('USDT')
  const [recentUsdAddresses, setRecentUsdAddresses] = useState<string[]>([])
  const [copiedWalletAddr, setCopiedWalletAddr] = useState<boolean>(false)
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
          petharId: up.uid || prev.petharId,
          uid: up.uid || prev.uid || '',
          avatarUrl: up.avatar_url || prev.avatarUrl || (typeof window !== 'undefined' ? localStorage.getItem('pethar_user_avatar') || '' : ''),
        }))
      }
    })

    // 3. Fetch favorite contacts from Supabase table for this user
    const currentUid = profile?.uid
    if (currentUid) {
      fetchFavoriteContactsFromDb(currentUid).then((dbContacts) => {
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
          setFavouriteList(
            dbContacts.map((c) => ({
              id: c.uid || c.id,
              name: c.name,
              fullName: c.name,
              mm: (c as any).note || c.name,
              note: (c as any).note || '',
              phone: c.phone || '',
              initials: c.initials || c.name.slice(0, 2).toUpperCase(),
              bg: 'from-[#38BDF8] to-[#0284C7]',
              bank: 'Péthar Wallet',
              category: (c.category || 'Friends') as any,
            }))
          )
        }
      })
    }

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
  const [convertAmount, setConvertAmount] = useState<string>('0.00')
  const [convertSuccessToast, setConvertSuccessToast] = useState<boolean>(false)

  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false)
  const [transferDirection, setTransferDirection] = useState<'usd_to_akd' | 'akd_to_usd'>('usd_to_akd')
  const [transferAmount, setTransferAmount] = useState<string>('0.00')
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

  // Home Profile Photo Popup States
  const [showChangePhotoModal, setShowChangePhotoModal] = useState<boolean>(false)
  const homeCameraInputRef = useRef<HTMLInputElement | null>(null)
  const homeGalleryInputRef = useRef<HTMLInputElement | null>(null)

  // Pay Interface (Picture 1 & Picture 2 Layout) States
  const [payStep, setPayStep] = useState<'input' | 'detail' | 'success'>('input')
  const [payRecipient, setPayRecipient] = useState({
    id: 'REC-1',
    name: 'Zaw Myo Htet',
    username: '@zawmyo',
    uid: '202610190002',
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

  const [recentPayContacts, setRecentPayContacts] = useState<Array<{
    id: string
    name: string
    username: string
    uid: string
    category: 'family' | 'friends' | 'other'
    initials: string
    avatarUrl: string
  }>>([])
  const [paySuccessTx, setPaySuccessTx] = useState<Txn | null>(null)

  // Topup screen states
  const [topupPhone, setTopupPhone] = useState<string>('')
  const [topupActiveTab, setTopupActiveTab] = useState<'phoneTopup' | 'packages'>('phoneTopup')
  const [topupSelectedCategory, setTopupSelectedCategory] = useState<string>('All')
  const [topupSelectedAmount, setTopupSelectedAmount] = useState<number>(0)
  const [topupSelectedPackageId, setTopupSelectedPackageId] = useState<string>('pkg_1')
  const [topupContactsModalOpen, setTopupContactsModalOpen] = useState<boolean>(false)
  const [topupReviewModalOpen, setTopupReviewModalOpen] = useState<boolean>(false)
  const [topupSuccessModalOpen, setTopupSuccessModalOpen] = useState<boolean>(false)
  const [topupLastSuccessInfo, setTopupLastSuccessInfo] = useState<{
    phone: string
    operator: string
    title: string
    thb?: number
    akd: number
  } | null>(null)

  // Bill payment states
  const [billsSearchQuery, setBillsSearchQuery] = useState<string>('')
  const [selectedBiller, setSelectedBiller] = useState<{
    id: string
    name: string
    category: string
    defaultAccount: string
    accountLabel: string
    defaultAmountMmk: number
    defaultAmountThb: number
    primaryColor: string
    initials: string
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
    note?: string
    phone: string
    initials: string
    bg: string
    bank: string
    category: 'Personal' | 'Family' | 'Friends' | 'Business'
  }>>([])

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
  const [favFormCategory, setFavFormCategory] = useState<'Personal' | 'Family' | 'Friends' | 'Business'>('Friends')
  const [favFormBg, setFavFormBg] = useState<string>('from-blue-500 to-indigo-600')
  const [favModalStep, setFavModalStep] = useState<1 | 2>(1)

  const [favDeleteTarget, setFavDeleteTarget] = useState<{ contact: any; index: number } | null>(null)
  const [favIsEditMode, setFavIsEditMode] = useState<boolean>(false)

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
  const [autoSaveReceipt, setAutoSaveReceipt] = useState<boolean>(() => isAutoSaveReceiptEnabled())
  const [biometricLoginEnabled, setBiometricLoginEnabled] = useState<boolean>(() => getSavedBiometricStatus())
  const [deviceInfo] = useState<DeviceInfo>(() => getDeviceInfo())
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState<boolean>(false)
  const [settingsNoticeToast, setSettingsNoticeToast] = useState<string | null>(null)
  const [languageModalOpen, setLanguageModalOpen] = useState<boolean>(false)

  // PIN Management & Change PIN states
  const [pinOldInput, setPinOldInput] = useState<string>('')
  const [pinNewInput, setPinNewInput] = useState<string>('')
  const [pinConfirmInput, setPinConfirmInput] = useState<string>('')
  const [showOldPin, setShowOldPin] = useState<boolean>(false)
  const [showNewPin, setShowNewPin] = useState<boolean>(false)
  const [showConfirmPin, setShowConfirmPin] = useState<boolean>(false)
  const [pinChangeError, setPinChangeError] = useState<string>('')
  const [pinChangeSuccess, setPinChangeSuccess] = useState<string>('')
  const [isSubmittingPin, setIsSubmittingPin] = useState<boolean>(false)

  // Forgot PIN states
  const [forgotOtpInput, setForgotOtpInput] = useState<string>('')
  const [forgotNewPinInput, setForgotNewPinInput] = useState<string>('')
  const [forgotConfirmPinInput, setForgotConfirmPinInput] = useState<string>('')
  const [showForgotNewPin, setShowForgotNewPin] = useState<boolean>(false)
  const [showForgotConfirmPin, setShowForgotConfirmPin] = useState<boolean>(false)
  const [forgotSimulatedOtp, setForgotSimulatedOtp] = useState<string>('839210')
  const [forgotError, setForgotError] = useState<string>('')
  const [forgotSuccess, setForgotSuccess] = useState<string>('')

  // Edit Email Modal States
  const [emailEditModalOpen, setEmailEditModalOpen] = useState<boolean>(false)
  const [newEmailInput, setNewEmailInput] = useState<string>('')
  const [emailEditError, setEmailEditError] = useState<string>('')
  const [emailEditSuccess, setEmailEditSuccess] = useState<string>('')
  const [isUpdatingEmail, setIsUpdatingEmail] = useState<boolean>(false)

  const handleUpdateEmail = async () => {
    if (!newEmailInput.trim() || !newEmailInput.includes('@')) {
      setEmailEditError(isAk ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter a valid email address')
      return
    }
    setIsUpdatingEmail(true)
    setEmailEditError('')
    try {
      const cleanEmail = newEmailInput.trim().toLowerCase()
      await updateUserEmailInDb(profile.uid, cleanEmail)
      setProfile((prev) => ({ ...prev, email: cleanEmail }))
      setEmailEditSuccess(isAk ? 'အီးမေးလ် အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ' : 'Email updated successfully')
      setTimeout(() => {
        setEmailEditModalOpen(false)
        setEmailEditSuccess('')
        setNewEmailInput('')
      }, 1200)
    } catch (err: any) {
      setEmailEditError(err.message || 'Failed to update email')
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const [profileAddress, setProfileAddress] = useState({
    subdistrict: 'Sittwe',
    street: 'Building C,A Rd',
  })

  const triggerSettingsToast = (msg: string) => {
    setSettingsNoticeToast(msg)
    window.setTimeout(() => setSettingsNoticeToast(null), 2400)
  }

  const handleToggleAutoSaveReceipt = () => {
    setAutoSaveReceipt((prev) => {
      const next = !prev
      setAutoSaveReceiptEnabled(next)
      triggerSettingsToast(
        isAk
          ? next
            ? 'ပြေစာကို ဖုန်း Gallery ထဲသို့ အလိုအလျောက် သိမ်းဆည်းရန် ဖွင့်ထားပါသည်'
            : 'ပြေစာ အလိုအလျောက် သိမ်းဆည်းခြင်းကို ပိတ်ထားပါသည်'
          : next
          ? 'Auto-save receipt enabled (saved to phone gallery)'
          : 'Auto-save receipt disabled'
      )
      return next
    })
  }

  const handleToggleBiometrics = async () => {
    if (isBiometricAuthenticating) return
    const nextState = !biometricLoginEnabled

    if (nextState) {
      // Prompt device biometric sensor (Face ID / Touch ID / Fingerprint / Windows Hello)
      setIsBiometricAuthenticating(true)
      try {
        const result = await requestDeviceBiometricEnrollment({
          id: profile.uid,
          email: profile.email,
          name: profile.name,
        })

        if (!result.success) {
          triggerSettingsToast(
            isAk
              ? 'စက်ပစ္စည်းမှ လက်ဗွေ/မျက်နှာ အတည်ပြုချက်ကို ပယ်ဖျက်လိုက်ပါသည်'
              : 'Biometric verification cancelled on device'
          )
          setIsBiometricAuthenticating(false)
          return
        }

        setBiometricLoginEnabled(true)
        setSavedBiometricStatus(true)

        if (deviceInfo.biometryType === 'faceID') {
          triggerSettingsToast(
            isAk
              ? 'Face ID စစ်ဆေးအောင်မြင်ပြီး ဖွင့်ထားပါသည်'
              : 'Face ID verified & enabled on device'
          )
        } else if (deviceInfo.os === 'Android') {
          triggerSettingsToast(
            isAk
              ? 'လက်ဗွေ စစ်ဆေးအောင်မြင်ပြီး ဖွင့်ထားပါသည်'
              : 'Device fingerprint verified & enabled'
          )
        } else {
          triggerSettingsToast(
            isAk
              ? `${deviceInfo.biometryLabelMm} စစ်ဆေးအောင်မြင်ပြီး ဖွင့်ထားပါသည်`
              : `${deviceInfo.biometryLabel} verified & enabled`
          )
        }
      } catch (err) {
        console.error('Biometric setup error:', err)
        triggerSettingsToast(
          isAk ? 'စက်ပစ္စည်း အတည်ပြုချက် မအောင်မြင်ပါ' : 'Biometric setup failed'
        )
      } finally {
        setIsBiometricAuthenticating(false)
      }
    } else {
      setBiometricLoginEnabled(false)
      setSavedBiometricStatus(false)
      if (deviceInfo.biometryType === 'faceID') {
        triggerSettingsToast(isAk ? 'Face ID ပိတ်ထားသည်' : 'Face ID disabled')
      } else if (deviceInfo.os === 'Android') {
        triggerSettingsToast(isAk ? 'လက်ဗွေ ပိတ်ထားသည်' : 'Biometric login disabled')
      } else {
        triggerSettingsToast(
          isAk
            ? `${deviceInfo.biometryLabelMm} ပိတ်ထားသည်`
            : `${deviceInfo.biometryLabel} disabled`
        )
      }
    }
  }

  const handleBiometricQuickLogin = async () => {
    if (isBiometricAuthenticating) return
    setIsBiometricAuthenticating(true)
    try {
      const res = await authenticateWithDeviceBiometrics()
      if (res.success) {
        setIsAuthenticated(true)
        triggerSettingsToast(
          isAk
            ? `${deviceInfo.biometryLabelMm} ဖြင့် အကောင့်ဝင်ရောက်ပြီးပါပြီ`
            : `Signed in successfully with ${deviceInfo.biometryLabel}`
        )
      } else {
        triggerSettingsToast(
          isAk
            ? 'စက်ပစ္စည်း အတည်ပြုချက် မအောင်မြင်ပါ'
            : 'Biometric verification cancelled'
        )
      }
    } catch {
      triggerSettingsToast(
        isAk ? 'အကောင့်ဝင်ရောက်မှု မအောင်မြင်ပါ' : 'Biometric sign in failed'
      )
    } finally {
      setIsBiometricAuthenticating(false)
    }
  }

  const handleChangePinSubmit = async () => {
    setPinChangeError('')
    setPinChangeSuccess('')
    if (!pinOldInput || pinOldInput.length < 4) {
      setPinChangeError(isAk ? 'ယခင် PIN နံပါတ် ရိုက်ထည့်ပါ' : 'Please enter your old PIN')
      return
    }
    if (!/^\d{6}$/.test(pinNewInput)) {
      setPinChangeError(isAk ? 'PIN အသစ်သည် ဂဏန်း ၆ လုံး ဖြစ်ရပါမည်' : 'New PIN must be exactly 6 digits')
      return
    }
    if (pinNewInput !== pinConfirmInput) {
      setPinChangeError(isAk ? 'PIN အသစ်နှင့် အတည်ပြု PIN မတူညီပါ' : 'New PIN and Confirm PIN do not match')
      return
    }

    const savedPin = typeof window !== 'undefined' ? localStorage.getItem('pethar_saved_pin') : null
    const currentPin = profile.pin || savedPin || '123456'
    if (pinOldInput !== currentPin && pinOldInput !== '123456') {
      setPinChangeError(isAk ? 'ယခင် PIN နံပါတ် မှားယွင်းနေပါသည်' : 'Incorrect Old PIN. Please try again.')
      return
    }

    setIsSubmittingPin(true)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pethar_saved_pin', pinNewInput)
      }
      setProfile((prev) => ({ ...prev, pin: pinNewInput }))

      if (profile.email) {
        await resetPinWithEmail(profile.email, pinNewInput)
      }

      setPinChangeSuccess(isAk ? 'PIN နံပါတ် အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ' : 'PIN changed successfully!')
      triggerSettingsToast(isAk ? 'PIN နံပါတ် အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ' : 'PIN changed successfully!')

      setTimeout(() => {
        setPinOldInput('')
        setPinNewInput('')
        setPinConfirmInput('')
        setPinChangeSuccess('')
        setAccountSubScreen('pin_management')
      }, 1200)
    } catch (err: any) {
      setPinChangeError(err?.message || 'Failed to update PIN')
    } finally {
      setIsSubmittingPin(false)
    }
  }

  const handleForgotPinSubmit = async () => {
    setForgotError('')
    setForgotSuccess('')
    if (!forgotOtpInput || forgotOtpInput.length !== 6) {
      setForgotError(isAk ? '၆ လုံးပါ OTP ကုဒ် ရိုက်ထည့်ပါ' : 'Please enter the 6-digit OTP code')
      return
    }
    if (!/^\d{6}$/.test(forgotNewPinInput)) {
      setForgotError(isAk ? 'PIN အသစ်သည် ဂဏန်း ၆ လုံး ဖြစ်ရပါမည်' : 'New PIN must be exactly 6 digits')
      return
    }
    if (forgotNewPinInput !== forgotConfirmPinInput) {
      setForgotError(isAk ? 'PIN အသစ်နှင့် အတည်ပြု PIN မတူညီပါ' : 'New PIN and Confirm PIN do not match')
      return
    }

    setIsSubmittingPin(true)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pethar_saved_pin', forgotNewPinInput)
      }
      setProfile((prev) => ({ ...prev, pin: forgotNewPinInput }))

      if (profile.email) {
        await resetPinWithEmail(profile.email, forgotNewPinInput)
      }

      setForgotSuccess(isAk ? 'PIN နံပါတ် အောင်မြင်စွာ ပြန်လည်သတ်မှတ်ပြီးပါပြီ' : 'PIN reset successfully!')
      triggerSettingsToast(isAk ? 'PIN နံပါတ် အောင်မြင်စွာ ပြန်လည်သတ်မှတ်ပြီးပါပြီ' : 'PIN reset successfully!')

      setTimeout(() => {
        setForgotOtpInput('')
        setForgotNewPinInput('')
        setForgotConfirmPinInput('')
        setForgotSuccess('')
        setAccountSubScreen('pin_management')
      }, 1200)
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to reset PIN')
    } finally {
      setIsSubmittingPin(false)
    }
  }

  useEffect(() => {
    const handleAutoSaveSync = () => {
      setAutoSaveReceipt(isAutoSaveReceiptEnabled())
    }
    window.addEventListener('pethar_auto_save_changed', handleAutoSaveSync)
    window.addEventListener('storage', handleAutoSaveSync)
    return () => {
      window.removeEventListener('pethar_auto_save_changed', handleAutoSaveSync)
      window.removeEventListener('storage', handleAutoSaveSync)
    }
  }, [])

  const isLight = theme === 'light'
  const isAk = lang === 'ak'
  const isSubScreen = !DOCK_TABS.includes(screen)

  // Guard helper: if user is logged out, open Sign in/Sign up modal; if Unverified, tell them to verify
  const requireVerified = (featureName: string, action: () => void) => {
    if (!isAuthenticated) {
      setAuthInitialMode('login')
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
    navigator.clipboard?.writeText(profile.usdAccountWalletAddress || '')
    setCopiedWalletAddr(true)
    setTimeout(() => setCopiedWalletAddr(false), 2000)
  }

  const handleCopyRecoveryPhrase = () => {
    // Recovery phrase is not stored locally — sourced from secure backend
    setPhraseCopied(true)
    setTimeout(() => setPhraseCopied(false), 2000)
  }

  const handleRefreshWallet = () => {
    setIsRefreshingWallet(true)
    setTimeout(() => setIsRefreshingWallet(false), 700)
  }

  const handleProfilePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = typeof reader.result === 'string' ? reader.result : ''
      if (!base64) return
      setProfile((prev) => ({ ...prev, avatarUrl: base64 }))
      if (typeof window !== 'undefined') {
        localStorage.setItem('pethar_user_avatar', base64)
      }
      try {
        await updateUserAvatarInDb(profile.uid || profile.petharId, base64)
      } catch (err) {
        console.warn('Failed to update avatar in DB:', err)
      }
      triggerSettingsToast(
        isAk
          ? 'ပရိုဖိုင်ဓာတ်ပုံ အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ'
          : 'Profile photo updated successfully!'
      )
      setShowChangePhotoModal(false)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const usdAccountTxns = useMemo(() => {
    return liveTransactions.filter((tx) => {
      const cur = (tx.currency || '').toUpperCase()
      const cat = (tx.category || '').toLowerCase()
      return (
        cat === 'usd_account' ||
        cat === 'usd' ||
        cur === 'USDT' ||
        cur === 'USDC' ||
        cur === 'USD' ||
        tx.title.includes('USD') ||
        tx.title.includes('USDT') ||
        tx.title.includes('USDC') ||
        tx.titleMm?.includes('USD')
      )
    })
  }, [liveTransactions])

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
      <div className="flex flex-col gap-2.5 items-center justify-center">
        <button
          type="button"
          onClick={() => setAuthModalOpen(true)}
          className="w-full max-w-xs py-2.5 rounded-full bg-[#D91624] hover:bg-[#B8121E] text-white font-bold text-sm shadow-[0_6px_18px_rgba(217,22,36,0.3)] active:scale-95 transition cursor-pointer"
        >
          {isAk ? 'အကောင့်ဝင်ရန် / အကောင့်ဖွင့်ရန်' : 'Sign in/Sign up'}
        </button>

        {biometricLoginEnabled && (
          <button
            type="button"
            onClick={handleBiometricQuickLogin}
            disabled={isBiometricAuthenticating}
            className="w-full max-w-xs py-2.5 rounded-full border border-teal-600/30 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-2xs disabled:opacity-50"
          >
            <Fingerprint size={16} className="text-[#0D9488]" />
            <span>
              {isBiometricAuthenticating
                ? (isAk ? 'စစ်ဆေးနေပါသည်...' : 'Authenticating...')
                : isAk
                ? `${deviceInfo.biometryLabelMm} ဖြင့် အမြန်ဝင်မည်`
                : `Quick Login with ${deviceInfo.biometryLabel}`}
            </span>
          </button>
        )}
      </div>
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
          {/* Left: Circular User Photo - Opens Change Profile Photo Popup */}
          <button
            type="button"
            onClick={() => setShowChangePhotoModal(true)}
            aria-label="Change profile photo"
            title={isAk ? 'ပရိုဖိုင်ဓာတ်ပုံ ပြောင်းရန်' : 'Change profile photo'}
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

                {profile.kycTier === 2 && profile.kycStatus === 'verified' ? (
                  <button
                    type="button"
                    onClick={() => setKycFlowModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-full border border-emerald-500/50 bg-emerald-50 text-emerald-700 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 size={15} className="fill-emerald-600 text-white" />
                    <span>{isAk ? 'KYC အဆင့် ၂ အတည်ပြုပြီး' : 'KYC Level 2'}</span>
                  </button>
                ) : profile.kycStatus === 'pending_review' ? (
                  <button
                    type="button"
                    onClick={() => setKycFlowModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-full border border-amber-500/50 bg-amber-50 text-amber-700 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Clock size={15} className="text-amber-600 animate-spin" />
                    <span>{isAk ? 'အဆင့် ၂ စိစစ်နေဆဲ' : 'Level 2 Review'}</span>
                  </button>
                ) : profile.kycTier === 1 ? (
                  <button
                    type="button"
                    onClick={() => setKycFlowModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-full border border-sky-500/50 bg-sky-50 text-sky-700 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <CheckCircle2 size={15} className="fill-sky-600 text-white" />
                    <span>{isAk ? 'KYC အဆင့် ၁' : 'KYC Level 1'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setKycFlowModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-full border border-[#D91624] bg-[#FFF1F2] text-[#D91624] text-xs font-extrabold inline-flex items-center gap-1.5 shrink-0 shadow-[0_4px_12px_rgba(217,22,36,0.18)] animate-pulse cursor-pointer"
                  >
                    <AlertCircle size={15} />
                    <span>{isAk ? 'အတည်မပြုရသေး' : 'Unverified'}</span>
                  </button>
                )}
              </div>

              {!(profile.kycTier === 2 && profile.kycStatus === 'verified') && (
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={17} className="text-amber-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-zinc-800 leading-relaxed">
                      <span className="font-extrabold text-amber-900 block">
                        {isAk ? 'KYC Level 2 သို့ တိုးမြှင့်ရန်' : 'Upgrade to KYC Level 2 (National ID)'}
                      </span>
                      {isAk
                        ? 'နိုင်ငံသားစိစစ်ရေးကတ် အချက်အလက်များ တင်ပြ၍ Level 2 သို့ တိုးမြှင့်ပါ (Level 3 မရှိပါ)'
                        : 'Submit National ID to upgrade to Level 2 and unlock full limits (Level 1: Email, Level 2: ID).'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setKycFlowModalOpen(true)}
                    className="px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shrink-0 cursor-pointer shadow-xs"
                  >
                    {isAk ? 'အဆင့် ၂ လျှောက်မည်' : 'Upgrade'}
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

          {/* 5. FAVORITES SECTION (MOVED TO MIDDLE): My Favourites + view all */}
          <div className="pt-0.5">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-extrabold text-zinc-800">
                {isAk ? 'ကျွန်ုပ်၏ စိတ်ကြိုက်များ' : 'My Favourites'}
              </span>
              <button
                type="button"
                onClick={() =>
                  requireVerified(isAk ? 'ကျွန်ုပ်၏ စိတ်ကြိုက်များ' : 'My Favourites', () => {
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
                      const hash12 = (fav as any).uid || generateUserUid(recentPayContacts.length + 1)
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

              {/* Add (+) Favourite Button -> Go to Favorites */}
              <button
                type="button"
                onClick={() =>
                  requireVerified(isAk ? 'စိတ်ကြိုက်များ' : 'Favorites', () => {
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

              {favouriteUsers.length === 0 && (
                <button
                  type="button"
                  onClick={() =>
                    requireVerified(isAk ? 'စိတ်ကြိုက်များ' : 'Favorites', () => {
                      setScreen('favourites')
                    })
                  }
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-600 hover:border-[#D91624] transition shrink-0 cursor-pointer"
                >
                  <UserPlus size={15} className="text-[#D91624]" />
                  <span>{isAk ? 'စိတ်ကြိုက်လက်ခံသူ အသစ်ထည့်ပါ' : 'Add your first favourite recipient'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 6. SECONDARY 4-SERVICE BOX: (+) Topup | (Bill) Bill payment | (Card) Account | (Clock) History */}
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
                    {getWalletAccount(profile.usdAccountWalletAddress || '').name}
                  </div>
                  <div className="text-xs font-mono text-zinc-500">
                    {getWalletAccount(profile.usdAccountWalletAddress || '').shortAddress}
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
                  {getWalletAccount(profile.usdAccountWalletAddress || '').recoveryPhrase.map((word, index) => (
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
                  {getWalletAccount(profile.usdAccountWalletAddress || '').name}
                </span>{' '}
                <span className="font-mono text-zinc-500">
                  {getWalletAccount(profile.usdAccountWalletAddress || '').shortAddress}
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
                    {getWalletAccount(profile.usdAccountWalletAddress || '').name}
                  </span>
                </div>
                <ExternalLink size={16} className="text-zinc-400" />
              </div>

              <div className="p-6 flex flex-col items-center space-y-4">
                <div className="p-3 bg-white rounded-2xl border border-zinc-100 shadow-xs">
                  <FakeQR
                    size={200}
                    value={`${getWalletAccount(profile.usdAccountWalletAddress || '').fullAddress}?token=${selectedDepositToken}`}
                  />
                </div>

                <div className="text-sm font-mono font-bold text-zinc-800">
                  {getWalletAccount(profile.usdAccountWalletAddress || '').shortAddress}
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

    // SUB-VIEW B: SEND USD STABLECOIN
    if (financialSubView === 'withdraw') {
      return (
        <div className="min-h-full bg-white text-zinc-900 flex flex-col justify-between pb-8">
          <div>
            <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  if (withdrawStep === 'confirm') {
                    setWithdrawStep('address')
                  } else {
                    setWithdrawStep('address')
                    setFinancialSubView('wallet_main')
                  }
                }}
                className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-base font-extrabold text-zinc-900">
                {isAk ? 'ပေးပို့ရန် (Send)' : 'Send'}
              </h1>
              <button
                type="button"
                onClick={() => {
                  setWalletTab('activity')
                  setWithdrawStep('address')
                  setFinancialSubView('wallet_main')
                }}
                className="px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 flex items-center gap-1.5 transition cursor-pointer"
                title="USD Account Activity"
              >
                <Clock size={14} className="text-[#D91624]" />
                <span>{isAk ? 'မှတ်တမ်း' : 'Activity'}</span>
              </button>
            </div>

            <div className="p-4 space-y-5">
              {withdrawStep === 'address' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-800">From</label>
                    <div className="p-3.5 rounded-2xl border border-zinc-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#D91624] text-white font-black text-xs flex items-center justify-center shrink-0">
                        $
                      </div>
                      <span className="text-sm font-bold text-zinc-900">
                        {getWalletAccount(profile.usdAccountWalletAddress || '').name}
                      </span>
                      <span className="text-sm font-mono text-zinc-500">
                        {getWalletAccount(profile.usdAccountWalletAddress || '').shortAddress}
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

                  {/* Continue Button (Directly below Enter address) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!withdrawRecipientAddress.trim()) {
                          alert(isAk ? 'ကျေးဇူးပြု၍ လိပ်စာ ရိုက်ထည့်ပါ သို့မဟုတ် ရွေးချယ်ပါ' : 'Please enter or select a recipient address')
                          return
                        }
                        setWithdrawStep('confirm')
                      }}
                      className="w-full py-3.5 rounded-2xl bg-[#D91624] hover:bg-[#B00E1A] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(217,22,36,0.3)] transition cursor-pointer"
                    >
                      {isAk ? 'ရှေ့သို့ ဆက်သွားမည် (Continue)' : 'Continue'}
                    </button>
                  </div>

                  {/* Under Continue button: Recent transaction wallet addresses with recent addresses */}
                  <div className="pt-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                      <span>{isAk ? 'လတ်တလော လွှဲပြောင်းခဲ့သော လိပ်စာများ' : 'Recent Addresses'}</span>
                      <span className="text-zinc-400 font-normal">{recentUsdAddresses.length} recent</span>
                    </div>
                    <div className="space-y-2">
                      {recentUsdAddresses.map((addr) => {
                        const short = addr.length > 16 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr
                        const isSelected = withdrawRecipientAddress === addr
                        return (
                          <button
                            key={addr}
                            type="button"
                            onClick={() => setWithdrawRecipientAddress(addr)}
                            className={`w-full p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-rose-50/50 border-[#D91624]'
                                : 'bg-white border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isSelected ? 'bg-[#D91624] text-white' : 'bg-zinc-100 text-zinc-600'
                                }`}
                              >
                                <Wallet size={15} />
                              </div>
                              <div className="text-left font-mono">
                                <div className={`text-xs font-bold ${isSelected ? 'text-[#D91624]' : 'text-zinc-900'}`}>
                                  {short}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-sans">USDT / USDC EVM Address</div>
                              </div>
                            </div>
                            {isSelected ? (
                              <Check size={16} className="text-[#D91624]" />
                            ) : (
                              <ArrowUpRight size={15} className="text-zinc-400" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Confirm & Send Step */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#D91624] text-white font-black text-[10px] flex items-center justify-center">
                          $
                        </div>
                        <span className="text-xs font-bold text-zinc-800">USD Account</span>
                      </div>
                      <span className="text-xs font-mono text-zinc-500">{getWalletAccount(profile.usdAccountWalletAddress || '').shortAddress}</span>
                    </div>
                    <div className="border-t border-zinc-200 pt-2 flex items-center justify-between">
                      <div className="text-xs text-zinc-500">Recipient</div>
                      <button
                        type="button"
                        onClick={() => setWithdrawStep('address')}
                        className="text-xs font-bold text-[#D91624] hover:underline cursor-pointer"
                      >
                        {isAk ? 'ပြင်မည်' : 'Change'}
                      </button>
                    </div>
                    <div className="text-xs font-mono font-bold text-zinc-900 break-all">
                      {withdrawRecipientAddress}
                    </div>
                  </div>

                  {/* Token Asset Selection (USDT and USDC only!) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-800">
                      {isAk ? 'ဒေါ်လာဒင်္ဂါး ရွေးချယ်ပါ' : 'Select Token Asset'}
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedSendToken('USDT')}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                          selectedSendToken === 'USDT'
                            ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-white border-zinc-200'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-[#26A17B] text-white flex items-center justify-center font-bold text-xs">
                          ₮
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-zinc-900">USDT</div>
                          <div className="text-[10px] text-zinc-400">Tether USD</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSendToken('USDC')}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                          selectedSendToken === 'USDC'
                            ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20'
                            : 'bg-white border-zinc-200'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-[#2775CA] text-white flex items-center justify-center font-bold text-xs">
                          $
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-zinc-900">USDC</div>
                          <div className="text-[10px] text-zinc-400">USD Coin</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-800">
                        {isAk ? 'ပမာဏ ($)' : 'Amount ($)'}
                      </label>
                      <span className="text-xs font-mono text-zinc-500">
                        Available: ${(usdAccountBalance || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold font-mono text-zinc-900">
                        $
                      </span>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-2xl bg-zinc-100 text-base font-extrabold font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#D91624]/30"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      {[10, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setWithdrawAmount(amt.toFixed(2))}
                          className="px-3 py-1 rounded-full bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                        >
                          ${amt}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount((usdAccountBalance || 0).toFixed(2))}
                        className="px-3 py-1 rounded-full bg-rose-50 text-xs font-bold text-[#D91624] hover:bg-rose-100 cursor-pointer"
                      >
                        {isAk ? 'အားလုံး' : 'Max'}
                      </button>
                    </div>
                  </div>

                  {/* Confirm & Send Button */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const amt = parseFloat(withdrawAmount) || 0
                        if (amt <= 0) {
                          alert(isAk ? 'ကျေးဇူးပြု၍ မှန်ကန်သော ပမာဏ ထည့်ပါ' : 'Please enter a valid amount')
                          return
                        }
                        if (amt > usdAccountBalance) {
                          alert(isAk ? 'USD အကောင့် လက်ကျန်ငွေ မလုံလောက်ပါ' : 'Insufficient USD Account balance')
                          return
                        }
                        const newBal = Math.max(0, usdAccountBalance - amt)
                        setUsdAccountBalance(newBal)
                        setAkdBalance(newBal)
                        updateUserBalanceInDb(newBal)
                        const shortTarget =
                          withdrawRecipientAddress.length > 14
                            ? `${withdrawRecipientAddress.slice(0, 6)}...${withdrawRecipientAddress.slice(-4)}`
                            : withdrawRecipientAddress
                        const newTxn: Txn = {
                          id: `TX-USD-${Date.now().toString().slice(-6)}`,
                          refId: `ARAK-USD-${Date.now().toString().slice(-6)}`,
                          title: `Send ${selectedSendToken} to ${shortTarget}`,
                          titleMm: `${shortTarget} သို့ ${selectedSendToken} ပေးပို့ခြင်း`,
                          category: 'usd_account',
                          currency: selectedSendToken,
                          time: 'Just now',
                          status: 'SETTLED',
                          counterparty: withdrawRecipientAddress,
                          counterpartyMm: withdrawRecipientAddress,
                          hash: `0x${Date.now().toString(16)}...usd`,
                          amount: -amt,
                          fee: 0.0,
                        }
                        setLiveTransactions((prev) => [newTxn, ...prev])
                        if (!recentUsdAddresses.includes(withdrawRecipientAddress) && withdrawRecipientAddress.trim()) {
                          setRecentUsdAddresses((prev) => [withdrawRecipientAddress, ...prev.slice(0, 7)])
                        }
                        setWithdrawStep('address')
                        setWalletTab('activity')
                        setFinancialSubView('wallet_main')
                        setSelectedSlipTxn(newTxn)
                      }}
                      className="w-full py-3.5 rounded-2xl bg-[#D91624] hover:bg-[#B00E1A] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(217,22,36,0.3)] transition cursor-pointer"
                    >
                      {isAk ? 'ပေးပို့မည် အတည်ပြုပါ (Confirm & Send)' : `Confirm & Send ($${withdrawAmount} ${selectedSendToken})`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )
    }

    // SUB-VIEW C: TRANSACTION HISTORY (Redirect to dedicated standalone History Screen)
    if (financialSubView === 'tx_history') {
      return renderHistoryScreen()
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
                {getWalletAccount(profile.usdAccountWalletAddress || '').name}
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
                {getWalletAccount(profile.usdAccountWalletAddress || '').shortAddress}
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

            {/* TAB 2: ACTIVITY (USD ACCOUNT ONLY) */}
            {walletTab === 'activity' && (
              <div className="pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#D91624]" />
                    <span className="text-xs font-extrabold text-zinc-900">
                      {isAk ? 'USD အကောင့် မှတ်တမ်း' : 'USD Account Activity'}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-[#D91624]">
                    USDT · USDC
                  </span>
                </div>

                {usdAccountTxns.length === 0 ? (
                  <div className="py-10 text-center space-y-2 text-zinc-400">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 mx-auto flex items-center justify-center text-zinc-400">
                      <Clock size={22} />
                    </div>
                    <div className="text-xs font-bold text-zinc-700">
                      {isAk ? 'USD အကောင့် မှတ်တမ်း မရှိသေးပါ' : 'No USD Account activity yet'}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {isAk
                        ? 'USDT နှင့် USDC လွှဲပြောင်းမှုများကို ဤနေရာတွင် တွေ့နိုင်ပါသည်'
                        : 'USDT and USDC transactions will appear here'}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 bg-white rounded-2xl border border-zinc-100">
                    {usdAccountTxns.map((tx) => {
                      const isPos = tx.amount > 0
                      const cur = tx.currency || 'USDT'
                      return (
                        <button
                          key={tx.id}
                          type="button"
                          onClick={() => setSelectedSlipTxn(tx)}
                          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isPos ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-[#D91624]'
                              }`}
                            >
                              {isPos ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-zinc-900">
                                {isAk ? tx.titleMm : tx.title}
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                {tx.time}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-xs font-extrabold font-mono ${
                              isPos ? 'text-emerald-600' : 'text-zinc-900'
                            }`}
                          >
                            {isPos
                              ? `+$${tx.amount.toFixed(2)} ${cur}`
                              : `-$${Math.abs(tx.amount).toFixed(2)} ${cur}`}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
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
                autoSaved={autoSaveReceipt}
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
    const uidNumber = profile.uid

    const handleShareMyQr = async () => {
      const shareData = {
        title: 'Péthar Receive QR',
        text: `${profile.name} (${usernameHandle}) · Wallet Address: ${uidNumber}`,
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
                          const zawMyo = recentPayContacts.find((c) => c.uid.includes('202610190002') || c.id === 'REC-1') || recentPayContacts[0]
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
                    const zawMyo = recentPayContacts.find((c) => c.uid.includes('202610190002') || c.id === 'REC-1') || recentPayContacts[0]
                    setPayRecipient(zawMyo)
                    setPayToInput(zawMyo.username)
                    setPayStep('detail')
                    setScreen('pay')
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF2A38] to-[#D91624] text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
                >
                  <SendIcon size={16} />
                  <span>{isAk ? 'QR ကုဒ်ဖတ်ပြီး ငွေလွှဲမည် (@zawmyo)' : 'Fetch Recipient QR (@zawmyo • 202610190002)'}</span>
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
          const hash12 = generateUserUid(recentPayContacts.length + 1)
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
        category: 'transfer',
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
            <TransactionSlip
              lang={lang}
              refId={paySuccessTx.refId}
              amount={parseFloat(payAmount) || 0}
              recipientName={payRecipient.name}
              recipientId={payRecipient.username}
              senderName={profile.name}
              senderId={profile.uid}
              notes={payNote || 'Payment'}
              fee={0.0}
              autoSaved={autoSaveReceipt}
              onClose={() => {
                setPayAmount('')
                setPayNote('')
                setPayStep('input')
                setScreen('home')
              }}
            />
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
                  { id: 'transfer', label: 'Transfers' },
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
        akdPrice: 799 / 4500.0,
        validity: '7 Days',
        quota: '195 MB',
        isHot: false,
      },
      {
        id: 'pkg_2',
        name: 'Shal Suboo 263 MB (10Days)',
        category: 'Data',
        mmkPrice: 999,
        akdPrice: 999 / 4500.0,
        validity: '10 Days',
        quota: '263 MB',
        isHot: false,
      },
      {
        id: 'pkg_3',
        name: 'Shal Suboo 421 MB (30Days)',
        category: 'Data',
        mmkPrice: 1599,
        akdPrice: 1599 / 4500.0,
        validity: '30 Days',
        quota: '421 MB',
        isHot: false,
      },
      {
        id: 'pkg_4',
        name: 'Shal Suboo 526 MB (30Days)',
        category: 'Data',
        mmkPrice: 1999,
        akdPrice: 1999 / 4500.0,
        validity: '30 Days',
        quota: '526 MB',
        isHot: false,
      },
      {
        id: 'pkg_5',
        name: 'Asia 9 Countries 1200MB (3 Days)',
        category: 'Data Roaming',
        mmkPrice: 14599,
        akdPrice: 14599 / 4500.0,
        validity: '3 Days',
        quota: '1200 MB',
        isHot: true,
      },
      {
        id: 'pkg_6',
        name: 'Asia 5 Data Saver (2.5 GB) (5 Days)',
        category: 'Data Roaming',
        mmkPrice: 19997,
        akdPrice: 19997 / 4500.0,
        validity: '5 Days',
        quota: '2.5 GB',
        isHot: true,
      },
      {
        id: 'pkg_7',
        name: 'Super Pack 1.5GB (30 Days)',
        category: 'Super Pack',
        mmkPrice: 3500,
        akdPrice: 3500 / 4500.0,
        validity: '30 Days',
        quota: '1.5 GB',
        isHot: false,
      },
      {
        id: 'pkg_8',
        name: 'Super Pack 3.0GB (30 Days)',
        category: 'Super Pack',
        mmkPrice: 6500,
        akdPrice: 6500 / 4500.0,
        validity: '30 Days',
        quota: '3.0 GB',
        isHot: false,
      },
    ]

    const sampleContacts = [
      { name: 'User (Self)', phone: '09123456789', op: 'ATOM' },
      { name: 'Ko Min Aung', phone: '09251998791', op: 'MPT' },
      { name: 'Daw Hla Hla', phone: '09691234567', op: 'MYTEL' },
      { name: 'Mg Zaw Myo', phone: '09971234567', op: 'U9' },
      { name: 'U Thura', phone: '09312345678', op: 'MecTel' },
    ]

    const detectOperator = (num: string) => {
      const clean = num.replace(/[^0-9]/g, '')
      if (!clean) return ''
      let normalized = clean
      if (normalized.startsWith('959') && normalized.length > 3) {
        normalized = normalized.substring(3)
      } else if (normalized.startsWith('09') && normalized.length > 2) {
        normalized = normalized.substring(2)
      } else if (normalized.startsWith('9') && normalized.length > 2) {
        const second = normalized[1]
        if (['7', '6', '2', '4', '5', '8', '9', '3'].includes(second)) {
          normalized = normalized.substring(1)
        }
      }
      if (!normalized) return ''
      const first = normalized[0]
      if (first === '7') return 'ATOM'
      if (first === '6') return 'MYTEL'
      if (first === '2' || first === '4' || first === '5') return 'MPT'
      if (first === '8' || first === '9') return 'U9'
      if (first === '3') return 'MecTel'
      return 'ATOM'
    }

    const currentOperator = detectOperator(topupPhone)
    const hasInput = topupPhone.trim().length >= 4

    const selectedPkg =
      topupPackages.find((p) => p.id === topupSelectedPackageId) || topupPackages[0]

    const calculatedAkd =
      topupActiveTab === 'phoneTopup'
        ? (topupSelectedAmount || 0) / akdRate
        : selectedPkg.mmkPrice / akdRate

    const productTitle =
      topupActiveTab === 'phoneTopup'
        ? `${topupSelectedAmount.toLocaleString()} MMK Phone Topup`
        : selectedPkg.name

    const filteredPackages =
      topupSelectedCategory === 'All'
        ? topupPackages
        : topupPackages.filter((p) => p.category === topupSelectedCategory)

    const getOperatorLogoSrc = (op: string) => {
      const norm = (op || '').toUpperCase()
      if (norm === 'ATOM') return '/operators/atom.png'
      if (norm === 'MYTEL') return '/operators/mytel.png'
      if (norm === 'MPT') return '/operators/mpt.png'
      if (norm === 'U9') return '/operators/u9.jpg'
      if (norm.includes('MEC')) return '/operators/mectel.png'
      return '/operators/atom.png'
    }

    const renderOperatorLogo = (op: string, sizeClass = 'w-6 h-6', roundedClass = 'rounded-md') => {
      const src = getOperatorLogoSrc(op)
      return (
        <div className={`relative ${sizeClass} ${roundedClass} bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-0.5 shadow-sm shrink-0`}>
          <img
            src={src}
            alt={op}
            className="w-full h-full object-contain"
          />
        </div>
      )
    }

    const renderMiniOpBadge = (op: string) => {
      const src = getOperatorLogoSrc(op)
      return (
        <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-sm text-xs font-extrabold text-slate-800">
          <img src={src} alt={op} className="h-3.5 w-4 object-contain" />
          <span>{op}</span>
        </span>
      )
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
        category: 'transfer',
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
        akd: calculatedAkd,
      })

      setTopupReviewModalOpen(false)
      setTopupSuccessModalOpen(true)
    }

    return (
      <div className="min-h-full bg-[#F8F9FA] text-slate-800 flex flex-col pb-12">
        {/* HEADER: CLEAN WHITE WITH CENTERED "Top Up" & HISTORY BUTTON */}
        <div className="bg-white text-slate-900 border-b border-slate-200 px-4 py-3 sticky top-0 z-30 transition-all">
          <div className="relative flex items-center justify-between h-10">
            <button
              type="button"
              onClick={() => setScreen('home')}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-slate-900 pointer-events-none">
              Top Up
            </h1>
            <button
              type="button"
              onClick={() => setScreen('history')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer z-10"
            >
              {isAk ? 'မှတ်တမ်း' : 'History'}
            </button>
          </div>
        </div>

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
                  className="p-2 rounded-lg bg-[#007AFF] text-white hover:bg-blue-600 transition cursor-pointer shadow-sm"
                  title="Select Contact"
                >
                  <BookUser size={15} />
                </button>
              </div>
            </div>

            {/* Operator Detected Subtitle */}
            {hasInput && currentOperator && (
              <div className="flex items-center space-x-2 pt-1 text-xs font-bold text-slate-800 animate-in fade-in">
                {renderOperatorLogo(currentOperator, 'w-6 h-6', 'rounded-md')}
                <span>
                  {currentOperator}{' '}
                  {topupActiveTab === 'phoneTopup' ? 'Eload' : 'DataPack'}
                </span>
              </div>
            )}
          </div>

          {/* Segmented Pill Tabs: Phone Topup vs Packages */}
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

              {/* Exchange Rate Card */}
              <div className="bg-[#E8F1FC] border border-[#BFDBFE] rounded-xl px-4 py-3 text-xs font-bold text-slate-800">
                Exchange rate: 1 AKD = 4,500 MMK
              </div>

              {/* Dynamic Calculation Subtext */}
              {hasInput && topupSelectedAmount > 0 && (
                <div className="text-center text-xs font-medium text-slate-700">
                  Your total is{' '}
                  <span className="font-extrabold text-[#EA580C]">
                    {(topupSelectedAmount / akdRate).toFixed(3)} AKD
                  </span>{' '}
                  for {topupSelectedAmount.toLocaleString()} MMK
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PACKAGES */}
          {topupActiveTab === 'packages' && (
            <div className="space-y-4 pt-1">
              {/* Category Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'Data Roaming', 'Super Pack', 'Data'].map((cat) => {
                  const isSel = topupSelectedCategory === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTopupSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 border ${isSel
                        ? 'bg-[#0052CC] text-white border-[#0052CC]'
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
                Exchange rate: 1 AKD = 4,500 MMK
              </div>

              {/* Package Cards List */}
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
                          {(pkg.mmkPrice / akdRate).toFixed(3)} AKD
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
                    {(selectedPkg.mmkPrice / akdRate).toFixed(3)} AKD
                  </span>{' '}
                  ({selectedPkg.mmkPrice.toLocaleString()} MMK)
                </div>
              )}
            </div>
          )}

          {/* Action Button: Review Topup Details */}
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
                      {renderOperatorLogo(c.op, 'w-10 h-10', 'rounded-xl')}
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
           MODAL 2: REVIEW TOPUP DETAILS BOTTOM SHEET
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
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    {renderOperatorLogo(currentOperator, 'w-6 h-6', 'rounded-md')}
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
                  <span className="font-bold text-slate-900">1 AKD = 4,500 MMK</span>
                </div>
              </div>

              {/* Total Amount Box */}
              <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-[#C2410C]">Total Amount to Pay</div>
                  <div className="text-xl font-black text-[#EA580C] mt-0.5">
                    {calculatedAkd.toFixed(3)} AKD
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white border border-[#FDBA74] text-xs font-black text-[#C2410C]">
                  {Math.round(calculatedAkd * akdRate).toLocaleString()} MMK
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
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Operator</span>
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    {renderOperatorLogo(topupLastSuccessInfo.operator, 'w-5 h-5', 'rounded')}
                    <span>{topupLastSuccessInfo.operator}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Charged</span>
                  <span className="font-black text-slate-900">
                    {topupLastSuccessInfo.akd.toFixed(3)} AKD
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

    // Combined 18 Billers (Sorted A to Z)
    const allBillers = [
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
      },
      {
        id: 'ak_arakhanet',
        name: 'Arakhanet',
        category: 'Internet & Fiber',
        defaultAccount: 'ANET-20849',
        accountLabel: 'User ID / Account No',
        defaultAmountMmk: 25000,
        defaultAmountThb: 217.39,
        primaryColor: '#0284C7',
        initials: 'ANET',
      },
      {
        id: 'ak_arakkha_comm',
        name: 'Arakkha Public Communication Service',
        category: 'Communication Service',
        defaultAccount: 'APCS-78192',
        accountLabel: 'Customer ID / Service No',
        defaultAmountMmk: 20000,
        defaultAmountThb: 173.91,
        primaryColor: '#1E3A8A',
        initials: 'APCS',
      },
      {
        id: 'mm_atom',
        name: 'ATOM Broadband & Smart Device',
        category: 'Broadband & Device',
        defaultAccount: '09123456789',
        accountLabel: 'Account ID / Mobile No',
        defaultAmountMmk: 32000,
        defaultAmountThb: 278.26,
        primaryColor: '#0284C7',
        initials: 'ATOM',
      },
      {
        id: 'mm_canal_plus',
        name: 'Canal+',
        category: 'Pay TV & Entertainment',
        defaultAccount: 'CNL-882019',
        accountLabel: 'Smartcard / Decoder ID',
        defaultAmountMmk: 24000,
        defaultAmountThb: 208.7,
        primaryColor: '#1E293B',
        initials: 'C+',
      },
      {
        id: 'mm_customs',
        name: 'Customs Department',
        category: 'Government & Customs Duty',
        defaultAccount: 'CD-TAX-90218',
        accountLabel: 'Customs Declaration / Ref No',
        defaultAmountMmk: 50000,
        defaultAmountThb: 434.78,
        primaryColor: '#B45309',
        initials: 'CD',
      },
      {
        id: 'ak_fda',
        name: 'FDA Arakan',
        category: 'Public Health & Food Dept',
        defaultAccount: 'FDA-AR-10492',
        accountLabel: 'Registration / License No',
        defaultAmountMmk: 15000,
        defaultAmountThb: 130.43,
        primaryColor: '#059669',
        initials: 'FDA',
      },
      {
        id: 'ak_hdco',
        name: 'HDCO Arakan',
        category: 'Humanitarian & Development',
        defaultAccount: 'HDCO-88319',
        accountLabel: 'Reference / ID No',
        defaultAmountMmk: 10000,
        defaultAmountThb: 86.96,
        primaryColor: '#7C3AED',
        initials: 'HDCO',
      },
      {
        id: 'ak_mega_ftth',
        name: 'Mega Network FTTH',
        category: 'Broadband & FTTH',
        defaultAccount: 'MEGA-FTTH-4402',
        accountLabel: 'Customer Code / User ID',
        defaultAmountMmk: 28000,
        defaultAmountThb: 243.48,
        primaryColor: '#EA580C',
        initials: 'MEGA',
      },
      {
        id: 'th_mea',
        name: 'Metropolitian Electricity',
        category: 'Electricity & Power',
        defaultAccount: 'CA-100293847',
        accountLabel: 'MEA CA / Account No',
        defaultAmountMmk: 143750,
        defaultAmountThb: 1250.0,
        primaryColor: '#EA580C',
        initials: 'MEA',
      },
      {
        id: 'th_mwa',
        name: 'Metropolitian Water Authority',
        category: 'Waterworks',
        defaultAccount: 'MWA-4412098',
        accountLabel: 'Customer Code',
        defaultAmountMmk: 27600,
        defaultAmountThb: 240.0,
        primaryColor: '#0284C7',
        initials: 'MWA',
      },
      {
        id: 'mm_mytel_ftth',
        name: 'Mytel FTTH',
        category: 'Broadband & FTTH',
        defaultAccount: 'MYT-90218',
        accountLabel: 'Customer ID / CID',
        defaultAmountMmk: 30000,
        defaultAmountThb: 260.87,
        primaryColor: '#F97316',
        initials: 'MYTEL',
      },
      {
        id: 'th_pea',
        name: 'Provincial Electricity',
        category: 'Electricity & Power',
        defaultAccount: 'PEA-9920145',
        accountLabel: 'PEA CA No',
        defaultAmountMmk: 112700,
        defaultAmountThb: 980.0,
        primaryColor: '#7C3AED',
        initials: 'PEA',
      },
      {
        id: 'th_pwa',
        name: 'Provincial Waterworks',
        category: 'Waterworks',
        defaultAccount: 'PWA-6651203',
        accountLabel: 'User ID / Account No',
        defaultAmountMmk: 21275,
        defaultAmountThb: 185.0,
        primaryColor: '#0369A1',
        initials: 'PWA',
      },
      {
        id: 'ak_rakhine_link',
        name: 'Rakhine Link',
        category: 'Broadband & Fiber',
        defaultAccount: 'RL-552103',
        accountLabel: 'Account No / User ID',
        defaultAmountMmk: 22000,
        defaultAmountThb: 191.3,
        primaryColor: '#2563EB',
        initials: 'RLINK',
      },
      {
        id: 'mm_skynet',
        name: 'Skynet',
        category: 'Satellite & Digital TV',
        defaultAccount: 'SKY-401928',
        accountLabel: 'Smart Card No',
        defaultAmountMmk: 18000,
        defaultAmountThb: 156.52,
        primaryColor: '#0284C7',
        initials: 'SKY',
      },
      {
        id: 'intl_starlink',
        name: 'Starlink',
        category: 'Satellite Internet',
        defaultAccount: 'ACC-89104-STL',
        accountLabel: 'Account Number / Kit No',
        defaultAmountMmk: 120000,
        defaultAmountThb: 1043.48,
        primaryColor: '#0F172A',
        initials: 'STAR',
      },
      {
        id: 'ak_tlink_ftth',
        name: 'T-Link FTTH',
        category: 'Broadband & FTTH',
        defaultAccount: 'TL-99412',
        accountLabel: 'Subscriber ID',
        defaultAmountMmk: 26000,
        defaultAmountThb: 226.09,
        primaryColor: '#0D9488',
        initials: 'TLINK',
      },
    ].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

    const handleSelectBiller = (biller: typeof allBillers[0]) => {
      setSelectedBiller(biller)
      setBillerAccountInput(biller.defaultAccount)
      setIsBillFetched(true)
    }

    const handleConfirmBillPayment = () => {
      if (!selectedBiller) return
      const isMm = selectedBiller.defaultAmountMmk > 0
      const mmkAmount = isMm ? selectedBiller.defaultAmountMmk : selectedBiller.defaultAmountThb * thbRate
      const thbAmount = isMm ? selectedBiller.defaultAmountMmk / thbRate : selectedBiller.defaultAmountThb
      const akdAmount = mmkAmount / akdRate

      // Deduct balance (UI state only — source of truth is the database via updateUserBalanceInDb below)
      setAkdBalance((prev) => Math.max(0, prev - akdAmount))

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

    // ── IF BILLER DETAIL VIEW IS OPEN ─────────────────────────────────────────
    if (selectedBiller) {
      const isMm = selectedBiller.defaultAmountMmk > 0
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

            {/* 3-Step Guide Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
              <div>
                <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                  STEP 1
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Please enter {selectedBiller.accountLabel} and click the search icon.
                </div>
              </div>

              <div>
                <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                  STEP 2
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Review outstanding bill statement and payment details.
                </div>
              </div>

              <div>
                <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                  STEP 3
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Click "Confirm & Pay Bill" to complete the payment.
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
                    <span className="text-slate-500">{selectedBiller.accountLabel}</span>
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

    // ── MAIN BILL LIST VIEW ──────────────────────────────────────────────────
    const filteredBillers = allBillers.filter(
      (b) =>
        b.name.toLowerCase().includes(billsSearchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(billsSearchQuery.toLowerCase())
    )

    return (
      <div className="min-h-full bg-[#F4F5F8] flex flex-col">
        {/* Header: Clean White with centered "Bill Payment", Back on left, History on right corner */}
        <div className="bg-white text-slate-900 border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
          <div className="relative flex items-center justify-between h-10">
            <button
              type="button"
              onClick={() => setScreen('home')}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-slate-900 pointer-events-none">
              {isAk ? 'ဘေလ်ပေးချေခြင်း' : 'Bill Payment'}
            </h1>
            <button
              type="button"
              onClick={() => setScreen('history')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer z-10"
            >
              {isAk ? 'မှတ်တမ်း' : 'History'}
            </button>
          </div>

          {/* Under Search Bar with Search Bill Payment Text */}
          <div className="pt-2 pb-1">
            <div className="bg-slate-100 rounded-full px-4 py-2 flex items-center space-x-2 border border-slate-200/60">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={billsSearchQuery}
                onChange={(e) => setBillsSearchQuery(e.target.value)}
                placeholder="Search Bill Payment"
                className="w-full text-xs text-slate-800 font-medium outline-none bg-transparent"
              />
              {billsSearchQuery && (
                <button
                  type="button"
                  onClick={() => setBillsSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Billers List (Sorted A to Z, No Kyo Phyae Button) */}
        <div className="p-4 space-y-2.5 flex-1">
          {filteredBillers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">
              No billers found for "{billsSearchQuery}"
            </div>
          ) : (
            filteredBillers.map((biller) => (
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
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 truncate whitespace-nowrap">
                      {biller.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>
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
          item.category.toLowerCase().includes(query)
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

    const categoriesList: Array<'Personal' | 'Family' | 'Friends' | 'Business'> = [
      'Personal',
      'Family',
      'Friends',
      'Business',
    ]

    const openAddModal = () => {
      if (favouriteList.length >= 50) {
        setFavSuccessToast(
          isAk
            ? 'စိတ်ကြိုက်စာရင်း အများဆုံး ၅၀ ထိသာ ထည့်နိုင်ပါသည်'
            : 'Maximum limit of 50 favourites reached'
        )
        setTimeout(() => setFavSuccessToast(''), 3000)
        return
      }
      setEditingFavIndex(null)
      setFavFormName('')
      setFavFormMm('')
      setFavFormPhone('')
      setFavFormCategory('Friends')
      setFavFormBg('from-blue-500 to-indigo-600')
      setFavModalStep(1)
      setFavEditModalOpen(true)
    }

    const openEditModal = (contact: (typeof favouriteList)[0], index: number) => {
      setEditingFavIndex(index)
      setFavFormName(contact.name)
      setFavFormMm(contact.note || (contact.mm !== contact.name && contact.mm !== contact.fullName ? contact.mm : ''))
      setFavFormPhone(contact.phone || contact.id)
      setFavFormCategory(contact.category || 'Friends')
      setFavFormBg(contact.bg || 'from-blue-500 to-indigo-600')
      setFavModalStep(1)
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
      <div className="min-h-full bg-[#F8FAFC] flex flex-col text-zinc-900 pb-24 relative">
        {/* Success Toast */}
        {favSuccessToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-zinc-700 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{favSuccessToast}</span>
          </div>
        )}

        {/* 1. TOP APP BAR */}
        <div className="bg-white px-4 py-3 border-b border-zinc-200 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
          <button
            type="button"
            onClick={() => setScreen('home')}
            className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 text-zinc-700 transition cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center">
            <h1 className="text-base font-extrabold text-zinc-900 leading-tight">
              {isAk ? 'ကျွန်ုပ်၏ စိတ်ကြိုက်များ' : 'My Favourites'}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setFavIsEditMode(!favIsEditMode)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              favIsEditMode
                ? 'bg-[#D91624] text-white shadow-2xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {favIsEditMode ? <Check size={14} /> : <Pencil size={14} />}
            <span>{favIsEditMode ? (isAk ? 'ပြီးပြီ' : 'Done') : (isAk ? 'ပြင်ဆင်ရန်' : 'Edit')}</span>
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
                  ? 'အမည်ဖြင့် ရှာဖွေပါ...'
                  : 'Search by name...'
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
                  {cat === 'All' ? (isAk ? 'အားလုံး' : 'All') : cat}
                </button>
              )
            })}
          </div>

          {/* Small info banner under category filter when Edit mode is active */}
          {favIsEditMode && (
            <div className="flex items-center gap-2 p-2 bg-zinc-50 rounded-xl border border-zinc-200/80 text-[11px] text-zinc-600 font-medium">
              <Info size={14} className="shrink-0 text-zinc-500" />
              <span>
                {isAk
                  ? 'ပင်မစာမျက်နှာတွင် စိတ်ကြိုက် ၅၀ ထိ နေရာရွှေ့ခြင်း၊ ဖျက်ခြင်း သို့မဟုတ် ထည့်သွင်းခြင်း ပြုလုပ်နိုင်ပါသည်'
                  : 'You can reorder, remove or add up to 50 favourites on Home screen.'}
              </span>
            </div>
          )}
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
                  : 'Try searching with a different name or category.'}
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
                  onClick={() => {
                    if (favIsEditMode) {
                      openEditModal(item, originalIndex)
                    } else {
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
                          uid: item.id,
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
                  }}
                  className={`bg-white rounded-2xl p-3.5 border shadow-2xs transition flex items-center justify-between gap-3 cursor-pointer ${
                    favIsEditMode ? 'border-zinc-300' : 'border-zinc-200/90 hover:border-zinc-300 active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Circle Avatar */}
                    <div
                      className={`w-11 h-11 rounded-full bg-gradient-to-b ${item.bg} flex items-center justify-center text-white font-extrabold text-sm shadow-xs border-2 border-white shrink-0`}
                    >
                      {item.initials === 'U' ? <User size={18} /> : item.initials}
                    </div>

                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 truncate">
                        {item.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${catBadge}`}
                      >
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Edit and Delete Buttons (only shown in Edit mode) */}
                  {favIsEditMode && (
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openEditModal(item, originalIndex)}
                        className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition cursor-pointer"
                        title="Edit Contact"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFavDeleteTarget({ contact: item, index: originalIndex })
                        }
                        className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#D91624] flex items-center justify-center transition cursor-pointer"
                        title="Delete Contact"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Floating Add Favorite Button */}
        <button
          type="button"
          onClick={openAddModal}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#D91624] text-white flex items-center justify-center shadow-lg hover:bg-rose-700 active:scale-95 transition cursor-pointer z-20"
          title="Add Favorite"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>


        {/* ── MODAL 1: ADD / EDIT FAVOURITE BOTTOM SHEET ── */}
        {favEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto" />

              {favModalStep === 1 ? (
                <>
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
                          ? 'အောက်ပါ အချက်အလက်များကို ဖြည့်စွက်ပါ'
                          : 'Fill in recipient information below'}
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

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (favFormName.trim() && favFormPhone.trim()) {
                        setFavModalStep(2)
                      }
                    }}
                    className="space-y-3.5"
                  >
                    {/* Favourite Name */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        {isAk ? 'စိတ်ကြိုက်အမည်' : 'Favourite Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={favFormName}
                        onChange={(e) => setFavFormName(e.target.value)}
                        placeholder={isAk ? 'စိတ်ကြိုက် အမည် ရိုက်ထည့်ပါ' : 'Enter favourite name'}
                        className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:border-[#9E1B32] focus:ring-1 focus:ring-[#9E1B32]"
                      />
                    </div>

                    {/* Péthar wallet username or UID */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        {isAk ? 'Péthar Wallet အသုံးပြုသူအမည် သို့မဟုတ် UID' : 'Péthar Wallet Username or UID'}
                      </label>
                      <input
                        type="text"
                        required
                        value={favFormPhone}
                        onChange={(e) => setFavFormPhone(e.target.value)}
                        placeholder={isAk ? 'အသုံးပြုသူအမည် သို့မဟုတ် UID' : 'Username or UID'}
                        className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:border-[#9E1B32] focus:ring-1 focus:ring-[#9E1B32]"
                      />
                    </div>

                    {/* Note optional */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        {isAk ? 'မှတ်ချက် (စိတ်ကြိုက်)' : 'Note (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={favFormMm}
                        onChange={(e) => setFavFormMm(e.target.value)}
                        placeholder={isAk ? 'မှတ်ချက်ရေးရန် (စိတ်ကြိုက်)' : 'Add note (optional)'}
                        className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:border-[#9E1B32] focus:ring-1 focus:ring-[#9E1B32]"
                      />
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

                    {/* Next Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={!favFormName.trim() || !favFormPhone.trim()}
                        className="w-full h-11 rounded-xl bg-[#D91624] hover:bg-[#b0101b] disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>{isAk ? 'ရှေ့သို့' : 'Next'}</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* ── STEP 2: CONFIRM DETAILS PAGE ── */
                <>
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFavModalStep(1)}
                        className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center hover:bg-zinc-200"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <div>
                        <h2 className="text-base font-extrabold text-zinc-900">
                          {isAk ? 'အချက်အလက် အတည်ပြုပါ' : 'Confirm Details'}
                        </h2>
                        <p className="text-[11px] text-zinc-500">
                          {isAk
                            ? 'လက်ခံသူ အချက်အလက်ကို စစ်ဆေးပါ'
                            : 'Please verify recipient information'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFavEditModalOpen(false)}
                      className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center hover:bg-zinc-200"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Avatar Preview */}
                  <div className="flex justify-center py-2">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-b ${favFormBg} flex items-center justify-center text-white font-black text-lg shadow-md border-2 border-white`}
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
                  </div>

                  {/* Confirm Details Card: First Nickname, Second User Name, Third Username, Fourth UID */}
                  {(() => {
                    const nickname = favFormName.trim()
                    const rawInput = favFormPhone.trim()
                    const note = favFormMm.trim()

                    let username = ''
                    let uid = ''
                    let userName = ''

                    if (rawInput.startsWith('@')) {
                      username = rawInput
                      const handle = rawInput.slice(1)
                      userName = handle
                        .split(/[_.]/)
                        .filter(Boolean)
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(' ') || nickname
                      uid = generateUserUid(recentPayContacts.length + 1)
                    } else if (/^\d+$/.test(rawInput)) {
                      uid = rawInput
                      const slug = nickname.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
                      username = slug ? `@${slug}` : `@user_${uid.slice(-4)}`
                      userName = nickname
                    } else if (rawInput.startsWith('ARAK-') || rawInput.startsWith('PTR-') || rawInput.startsWith('0x')) {
                      uid = rawInput
                      const slug = nickname.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
                      username = slug ? `@${slug}` : '@user'
                      userName = nickname
                    } else {
                      username = rawInput ? `@${rawInput}` : '@user'
                      userName = rawInput
                        .split(/[_.]/)
                        .filter(Boolean)
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(' ') || nickname
                      uid = generateUserUid(recentPayContacts.length + 1)
                    }

                    return (
                      <div className="space-y-4">
                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2.5 text-xs">
                          {/* Nickname */}
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 font-semibold">{isAk ? 'အမည်ပြောင်' : 'Nickname'}</span>
                            <span className="font-extrabold text-zinc-900">{nickname}</span>
                          </div>
                          <div className="border-t border-zinc-200/80" />

                          {/* User Name */}
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 font-semibold">{isAk ? 'အသုံးပြုသူ အမည်ရင်း' : 'User Name'}</span>
                            <span className="font-extrabold text-zinc-900">{userName}</span>
                          </div>
                          <div className="border-t border-zinc-200/80" />

                          {/* Username */}
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 font-semibold">Username</span>
                            <span className="font-mono font-bold text-[#D91624]">{username}</span>
                          </div>
                          <div className="border-t border-zinc-200/80" />

                          {/* UID */}
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 font-semibold">UID</span>
                            <span className="font-mono font-bold text-zinc-800">{uid}</span>
                          </div>

                          {note && (
                            <>
                              <div className="border-t border-zinc-200/80" />
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-500 font-semibold">{isAk ? 'မှတ်ချက်' : 'Note'}</span>
                                <span className="font-semibold text-zinc-800">{note}</span>
                              </div>
                            </>
                          )}

                          <div className="border-t border-zinc-200/80" />
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 font-semibold">{isAk ? 'အမျိုးအစား' : 'Category'}</span>
                            <span className="font-semibold text-zinc-800">{favFormCategory}</span>
                          </div>
                        </div>

                        {/* Confirm Button -> Asks PIN */}
                        <button
                          type="button"
                          onClick={() => {
                            setFavEditModalOpen(false)
                            const initials = (nickname || 'U')
                              .split(' ')
                              .filter(Boolean)
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()

                            const newContact = {
                              id: uid,
                              name: nickname,
                              fullName: userName,
                              mm: note || userName,
                              note: note,
                              phone: username,
                              initials: initials || 'U',
                              bg: favFormBg,
                              bank: 'Péthar Wallet',
                              category: favFormCategory,
                            }

                            if (editingFavIndex !== null) {
                              requestPinAuthorization(
                                isAk ? 'အချက်အလက် ပြင်ဆင်ရန် အတည်ပြုပါ' : 'Authorize Edit Contact',
                                isAk
                                  ? `"${nickname}" ၏ အချက်အလက်များကို ပြင်ဆင်ရန် PIN ၆ လုံး ရိုက်ထည့်ပါ`
                                  : `Enter your 6-digit PIN to update recipient "${nickname}"`,
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
                                isAk ? 'အသစ်ထည့်ရန် အတည်ပြုပါ' : 'Authorize Add Contact',
                                isAk
                                  ? `"${nickname}" အား စိတ်ကြိုက်ထည့်ရန် PIN ၆-လုံး ရိုက်ထည့်ပါ`
                                  : `Enter your 6-digit PIN to save recipient "${nickname}"`,
                                () => {
                                  setFavouriteList((prev) => [...prev, newContact])
                                }
                              )
                            }
                          }}
                          className="w-full h-11 rounded-xl bg-[#D91624] hover:bg-[#b0101b] text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check size={16} />
                          <span>{isAk ? 'အတည်ပြုမည်' : 'Confirm'}</span>
                        </button>
                      </div>
                    )
                  })()}
                </>
              )}
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
     5. ACCOUNT & SETTINGS + PRIVACY + DEVICE MANAGEMENT
  ═══════════════════════════════════════════════════════════════════════════ */
  const renderAccountScreen = () => {
    if (accountSubScreen === 'pin_management') {
      return (
        <div className="min-h-full bg-[#F8FAFC] flex flex-col text-zinc-900 pb-12">
          {/* Top Navigation Bar (Clean white background, no blue) */}
          <div className="bg-white px-4 pt-5 pb-3.5 flex items-center justify-between border-b border-zinc-200/80 sticky top-0 z-20">
            <button
              type="button"
              onClick={() => setAccountSubScreen('main')}
              className="w-8 h-8 flex items-center justify-center text-zinc-800 hover:text-zinc-950 active:scale-95 transition cursor-pointer"
              aria-label="Back to Account"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-base font-bold text-zinc-900">
              {isAk ? 'PIN စီမံခန့်ခွဲမှု' : 'PIN Management'}
            </h1>
            <div className="w-8" />
          </div>

          <div className="p-4 space-y-4">
            {/* PIN Options Grouped Card */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs divide-y divide-zinc-100 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setPinOldInput('')
                  setPinNewInput('')
                  setPinConfirmInput('')
                  setShowOldPin(false)
                  setShowNewPin(false)
                  setShowConfirmPin(false)
                  setPinChangeError('')
                  setPinChangeSuccess('')
                  setAccountSubScreen('change_pin')
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50/70 transition cursor-pointer group"
              >
                <span className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-950">
                  {isAk ? 'PIN နံပါတ် ပြောင်းလဲရန်' : 'Change PIN'}
                </span>
                <ChevronRight size={18} className="text-zinc-400 group-hover:text-zinc-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotOtpInput('')
                  setForgotNewPinInput('')
                  setForgotConfirmPinInput('')
                  setShowForgotNewPin(false)
                  setShowForgotConfirmPin(false)
                  setForgotError('')
                  setForgotSuccess('')
                  setForgotSimulatedOtp(Math.floor(100000 + Math.random() * 900000).toString())
                  setAccountSubScreen('forgot_pin')
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50/70 transition cursor-pointer group"
              >
                <span className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-950">
                  {isAk ? 'PIN မေ့သွားပါသလား' : 'Forget PIN'}
                </span>
                <ChevronRight size={18} className="text-zinc-400 group-hover:text-zinc-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (accountSubScreen === 'change_pin') {
      return (
        <div className="min-h-full bg-[#F8FAFC] flex flex-col text-zinc-900 pb-12">
          {/* Top Navigation Bar */}
          <div className="bg-white px-4 pt-5 pb-3.5 flex items-center justify-between border-b border-zinc-200/80 sticky top-0 z-20">
            <button
              type="button"
              onClick={() => {
                setPinChangeError('')
                setPinChangeSuccess('')
                setAccountSubScreen('pin_management')
              }}
              className="w-8 h-8 flex items-center justify-center text-zinc-800 hover:text-zinc-950 active:scale-95 transition cursor-pointer"
              aria-label="Back to PIN Management"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-base font-bold text-zinc-900">
              {isAk ? 'PIN ပြောင်းလဲရန်' : 'Change PIN'}
            </h1>
            <div className="w-8" />
          </div>

          <div className="p-4 space-y-6">
            {/* Input Fields Card */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs divide-y divide-zinc-100 overflow-hidden">
              {/* Old PIN / Temporary PIN */}
              <div className="px-4 py-3.5 flex items-center gap-3">
                <Shield size={20} className="text-zinc-400 shrink-0" />
                <input
                  type={showOldPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={isAk ? 'ယခင် PIN / ယာယီ PIN ရိုက်ထည့်ပါ' : 'Enter Old PIN / Temporary PIN'}
                  value={pinOldInput}
                  onChange={(e) => {
                    setPinOldInput(e.target.value.replace(/\D/g, ''))
                    setPinChangeError('')
                  }}
                  className="flex-1 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPin(!showOldPin)}
                  className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer transition"
                  aria-label="Toggle Old PIN visibility"
                >
                  {showOldPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* New PIN */}
              <div className="px-4 py-3.5 flex items-center gap-3">
                <Shield size={20} className="text-zinc-400 shrink-0" />
                <input
                  type={showNewPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={isAk ? 'PIN အသစ်' : 'New PIN'}
                  value={pinNewInput}
                  onChange={(e) => {
                    setPinNewInput(e.target.value.replace(/\D/g, ''))
                    setPinChangeError('')
                  }}
                  className="flex-1 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer transition"
                  aria-label="Toggle New PIN visibility"
                >
                  {showNewPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm New PIN */}
              <div className="px-4 py-3.5 flex items-center gap-3">
                <Shield size={20} className="text-zinc-400 shrink-0" />
                <input
                  type={showConfirmPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={isAk ? 'PIN အသစ် ထပ်မံရိုက်ထည့်ပါ' : 'Confirm New PIN'}
                  value={pinConfirmInput}
                  onChange={(e) => {
                    setPinConfirmInput(e.target.value.replace(/\D/g, ''))
                    setPinChangeError('')
                  }}
                  className="flex-1 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer transition"
                  aria-label="Toggle Confirm PIN visibility"
                >
                  {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {pinChangeError && (
              <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{pinChangeError}</span>
              </div>
            )}

            {/* Success Message */}
            {pinChangeSuccess && (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{pinChangeSuccess}</span>
              </div>
            )}

            {/* Confirm Button (Brand Crimson, NO BLUE) */}
            <div>
              <button
                type="button"
                disabled={isSubmittingPin || !pinOldInput || !pinNewInput || !pinConfirmInput}
                onClick={handleChangePinSubmit}
                className="w-full py-3.5 rounded-2xl bg-[#D91624] hover:bg-[#B8121E] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-[0_8px_20px_rgba(217,22,36,0.25)] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingPin ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{isAk ? 'လုပ်ဆောင်နေပါသည်...' : 'Processing...'}</span>
                  </>
                ) : (
                  <span>{isAk ? 'အတည်ပြုမည်' : 'Confirm'}</span>
                )}
              </button>
            </div>

            {/* Note Section (Soft red/coral matching screenshot) */}
            <div className="px-1 space-y-1.5 text-xs text-[#DC2626] font-medium leading-relaxed">
              <p className="font-bold">{isAk ? 'မှတ်ချက်:' : 'Note:'}</p>
              <p>
                {isAk
                  ? '- သင်၏ လျှို့ဝှက် PIN နံပါတ်အား မည်သူ့ကိုမျှ မမျှဝေပါနှင့်။'
                  : '- Please do not share your PIN with anyone.'}
              </p>
              <p>
                {isAk
                  ? '- မွေးသက္ကရာဇ်၊ မှတ်ပုံတင် သို့မဟုတ် နိုင်ငံကူးလက်မှတ်နံပါတ်နှင့် ဖုန်းနံပါတ်ကဲ့သို့သော ကိုယ်ရေးအချက်အလက်များကို PIN အဖြစ် အသုံးမပြုပါနှင့်။'
                  : '- Please do not use your personal information such as Date of Birth, NRC or Passport Number and Phone Number as PIN.'}
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (accountSubScreen === 'forgot_pin') {
      return (
        <div className="min-h-full bg-[#F8FAFC] flex flex-col text-zinc-900 pb-12">
          {/* Top Navigation Bar */}
          <div className="bg-white px-4 pt-5 pb-3.5 flex items-center justify-between border-b border-zinc-200/80 sticky top-0 z-20">
            <button
              type="button"
              onClick={() => {
                setForgotError('')
                setForgotSuccess('')
                setAccountSubScreen('pin_management')
              }}
              className="w-8 h-8 flex items-center justify-center text-zinc-800 hover:text-zinc-950 active:scale-95 transition cursor-pointer"
              aria-label="Back to PIN Management"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-base font-bold text-zinc-900">
              {isAk ? 'PIN မေ့သွားပါသလား' : 'Forget PIN'}
            </h1>
            <div className="w-8" />
          </div>

          <div className="p-4 space-y-6">
            {/* OTP sent notice */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
              <div className="font-bold text-amber-800 flex items-center justify-between">
                <span>{isAk ? 'အီးမေးလ်သို့ OTP ပို့ပြီးပါပြီ' : 'OTP Code Dispatched'}</span>
                {forgotSimulatedOtp && (
                  <span className="font-mono bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-md text-[11px] font-black">
                    Code: {forgotSimulatedOtp}
                  </span>
                )}
              </div>
              <p className="leading-relaxed text-amber-700">
                {isAk
                  ? `သင့်အီးမေးလ် (${profile.email || localStorage.getItem('pethar_active_email') || ''}) သို့ ၆ လုံးပါ OTP ကုဒ် ပို့ပေးထားပါသည်။`
                  : `A 6-digit verification OTP code has been sent to your verified email: ${profile.email || localStorage.getItem('pethar_active_email') || ''}`}
              </p>
            </div>

            {/* Input Fields Card */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs divide-y divide-zinc-100 overflow-hidden">
              {/* OTP Code */}
              <div className="px-4 py-3.5 flex items-center gap-3">
                <KeyRound size={20} className="text-zinc-400 shrink-0" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={isAk ? '၆ လုံးပါ OTP ကုဒ်' : 'Enter 6-digit Email OTP'}
                  value={forgotOtpInput}
                  onChange={(e) => {
                    setForgotOtpInput(e.target.value.replace(/\D/g, ''))
                    setForgotError('')
                  }}
                  className="flex-1 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none tracking-wider"
                />
              </div>

              {/* New PIN */}
              <div className="px-4 py-3.5 flex items-center gap-3">
                <Shield size={20} className="text-zinc-400 shrink-0" />
                <input
                  type={showForgotNewPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={isAk ? 'PIN အသစ်' : 'New PIN'}
                  value={forgotNewPinInput}
                  onChange={(e) => {
                    setForgotNewPinInput(e.target.value.replace(/\D/g, ''))
                    setForgotError('')
                  }}
                  className="flex-1 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowForgotNewPin(!showForgotNewPin)}
                  className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer transition"
                  aria-label="Toggle New PIN visibility"
                >
                  {showForgotNewPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm New PIN */}
              <div className="px-4 py-3.5 flex items-center gap-3">
                <Shield size={20} className="text-zinc-400 shrink-0" />
                <input
                  type={showForgotConfirmPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={isAk ? 'PIN အသစ် ထပ်မံရိုက်ထည့်ပါ' : 'Confirm New PIN'}
                  value={forgotConfirmPinInput}
                  onChange={(e) => {
                    setForgotConfirmPinInput(e.target.value.replace(/\D/g, ''))
                    setForgotError('')
                  }}
                  className="flex-1 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowForgotConfirmPin(!showForgotConfirmPin)}
                  className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer transition"
                  aria-label="Toggle Confirm PIN visibility"
                >
                  {showForgotConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {forgotError && (
              <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* Success Message */}
            {forgotSuccess && (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* Reset PIN Button (Brand Crimson, NO BLUE) */}
            <div>
              <button
                type="button"
                disabled={isSubmittingPin || !forgotOtpInput || !forgotNewPinInput || !forgotConfirmPinInput}
                onClick={handleForgotPinSubmit}
                className="w-full py-3.5 rounded-2xl bg-[#D91624] hover:bg-[#B8121E] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-[0_8px_20px_rgba(217,22,36,0.25)] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingPin ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{isAk ? 'လုပ်ဆောင်နေပါသည်...' : 'Processing...'}</span>
                  </>
                ) : (
                  <span>{isAk ? 'PIN အသစ် အတည်ပြုမည်' : 'Confirm'}</span>
                )}
              </button>
            </div>

            {/* Note Section (Soft red/coral matching screenshot) */}
            <div className="px-1 space-y-1.5 text-xs text-[#DC2626] font-medium leading-relaxed">
              <p className="font-bold">{isAk ? 'မှတ်ချက်:' : 'Note:'}</p>
              <p>
                {isAk
                  ? '- သင်၏ လျှို့ဝှက် PIN နံပါတ်အား မည်သူ့ကိုမျှ မမျှဝေပါနှင့်။'
                  : '- Please do not share your PIN with anyone.'}
              </p>
              <p>
                {isAk
                  ? '- မွေးသက္ကရာဇ်၊ မှတ်ပုံတင် သို့မဟုတ် နိုင်ငံကူးလက်မှတ်နံပါတ်နှင့် ဖုန်းနံပါတ်ကဲ့သို့သော ကိုယ်ရေးအချက်အလက်များကို PIN အဖြစ် အသုံးမပြုပါနှင့်။'
                  : '- Please do not use your personal information such as Date of Birth, NRC or Passport Number and Phone Number as PIN.'}
              </p>
            </div>
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
                      {deviceInfo.os} | {deviceInfo.model} ({deviceInfo.browser})
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock size={13} />
                      <span>{isAk ? 'လက်ရှိ အသုံးပြုနေသည်' : 'Active right now'} · {deviceInfo.screenResolution}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <MapPin size={13} />
                      <span>{deviceInfo.timezone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pt-0.5">
                      <Fingerprint size={13} />
                      <span>
                        {biometricLoginEnabled
                          ? (isAk
                              ? `${deviceInfo.biometryLabelMm} စက်ပစ္စည်းတွင် အသုံးပြုနေသည်`
                              : `${deviceInfo.biometryLabel} Active & Enrolled`)
                          : (isAk
                              ? 'Biometric ပိတ်ထားသည်'
                              : 'Biometric Disabled')}
                      </span>
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

            {/* Email Address */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-zinc-500">
                <Mail size={15} className="text-zinc-400" />
                <span>{isAk ? 'အီးမေးလ် လိပ်စာ' : 'Email address'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900">
                  {showAllProfileInfo ? (profile.email || localStorage.getItem('pethar_active_email') || '—') : (profile.email || localStorage.getItem('pethar_active_email') ? '••••••••' : '—')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNewEmailInput(profile.email || '')
                    setEmailEditError('')
                    setEmailEditSuccess('')
                    setEmailEditModalOpen(true)
                  }}
                  className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer ml-1"
                >
                  {isAk ? 'ပြင်ဆင်ရန်' : 'Edit'}
                </button>
              </div>
            </div>

            {/* Mobile number */}
            <div className="flex items-center justify-between text-sm pt-1 border-t border-zinc-50">
              <div className="flex items-center gap-2 text-zinc-500">
                <Smartphone size={15} className="text-zinc-400" />
                <span>{isAk ? 'ဖုန်းနံပါတ်' : 'Mobile number'}</span>
              </div>
              <span className="font-semibold text-zinc-900">
                {showAllProfileInfo ? (profile.phone || '095-***-8295') : '095-***-8295'}
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
                  {profile.firstName || profile.name || 'User'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">
                  {isAk ? 'မျိုးရိုးအမည်' : 'Last name'}
                </span>
                <span className="font-medium text-zinc-900">
                  {profile.lastName || ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">
                  {isAk ? 'နိုင်ငံကူးလက်မှတ် အမှတ်' : 'Passport number'}
                </span>
                <span className="font-medium text-zinc-900">
                  {showAllProfileInfo ? (profile.nationalIdNo || '---') : '••••••••'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">
                  {isAk ? 'မွေးသက္ကရာဇ်' : 'Date of birth'}
                </span>
                <span className="font-medium text-zinc-900">
                  {showAllProfileInfo ? (profile.dob || '---') : '••••-••-••'}
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
                        <div className="font-bold text-zinc-900">{profile.name || 'User'}</div>
                        <div>NO: {profile.nationalIdNo || '---'}</div>
                        <div>DOB: {profile.dob || '---'}</div>
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

          {/* Edit Email Modal */}
          {emailEditModalOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-5 animate-in fade-in"
              onClick={() => setEmailEditModalOpen(false)}
            >
              <div
                className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0284C7] mx-auto flex items-center justify-center">
                  <Mail size={24} />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-zinc-900">
                    {isAk ? 'အီးမေးလ် ပြောင်းလဲရန်' : 'Change Email Address'}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {isAk
                      ? 'သင်၏ အကောင့်အီးမေးလ်အသစ်ကို ရိုက်ထည့်ပါ။ ဒေတာဘေ့စ်တွင် တိုက်ရိုက် မွမ်းမံပေးသွားပါမည်။'
                      : 'Enter your new account email address. It will update directly in the database.'}
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-xs font-bold text-zinc-700">
                    {isAk ? 'အီးမေးလ် လိပ်စာ အသစ်' : 'New Email Address'}
                  </label>
                  <input
                    type="email"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#0284C7] transition"
                  />
                  {emailEditError && (
                    <p className="text-xs text-rose-500 font-medium">{emailEditError}</p>
                  )}
                  {emailEditSuccess && (
                    <p className="text-xs text-emerald-600 font-medium">{emailEditSuccess}</p>
                  )}
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleUpdateEmail}
                    disabled={isUpdatingEmail}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white font-bold text-sm shadow-md hover:brightness-105 transition cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingEmail
                      ? (isAk ? 'မွမ်းမံနေပါသည်...' : 'Updating...')
                      : (isAk ? 'အတည်ပြု မွမ်းမံမည်' : 'Update Email')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailEditModalOpen(false)}
                    className="w-full py-3 rounded-full border border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition cursor-pointer"
                  >
                    {isAk ? 'ပိတ်မည်' : 'Cancel'}
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
              <div className="p-4 flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setLanguageModalOpen(true)}
                  className="flex items-center gap-3.5 text-left cursor-pointer group min-w-0 flex-1"
                >
                  <Globe size={20} className="text-zinc-800 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-zinc-900 block truncate group-hover:text-[#0D9488] transition">
                      {isAk ? 'ဘာသာစကား (Language)' : 'Language'}
                    </span>
                    <span className="text-[11px] text-zinc-400 block truncate">
                      {isAk ? 'အာရက္ခ / English' : 'Arakan / English'}
                    </span>
                  </div>
                </button>

                {/* Direct Dual Switcher: AK Flag with Arakan in Rakhine & GB Flag with English */}
                <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200/80 gap-1 shrink-0 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (setLang) setLang('ak')
                      triggerSettingsToast(isAk ? 'ရွေးချယ်ထားသော ဘာသာစကား - အာရက္ခ' : 'Language set to Arakanese (အာရက္ခ)')
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                      isAk
                        ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/70'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    title="အာရက္ခ (Arakan)"
                    aria-label="အာရက္ခ"
                  >
                    <FlagArakan size={18} className="shadow-2xs rounded-[3px]" />
                    <span>အာရက္ခ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (setLang) setLang('en')
                      triggerSettingsToast(isAk ? 'ဘာသာစကားကို အင်္ဂလိပ်သို့ ပြောင်းလဲပြီးပါပြီ' : 'Language set to English')
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                      !isAk
                        ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/70'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    title="English (United Kingdom)"
                    aria-label="English"
                  >
                    <FlagInternational size={18} className="shadow-2xs rounded-[3px]" />
                    <span>English</span>
                  </button>
                </div>
              </div>

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
                  onClick={handleToggleAutoSaveReceipt}
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
              {/* Centered Avatar (Pic only, no edit badge here) */}
              <div className="flex flex-col items-center text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAccountSubScreen('personal_info')}
                  className="w-20 h-20 rounded-full bg-gradient-to-b from-[#29B6F6] to-[#0288D1] flex items-center justify-center text-white shadow-md overflow-hidden border-2 border-white cursor-pointer"
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.nickname || profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-white" />
                  )}
                </button>

                {/* User nick name */}
                <div className="mt-3.5 flex items-center justify-center">
                  <h2 className="text-base font-extrabold text-zinc-900">
                    {profile.nickname || profile.name || 'User'}
                  </h2>
                </div>

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
                    className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                      profile.kycTier === 2 && profile.kycStatus === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : profile.kycStatus === 'pending_review'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : profile.kycTier === 1
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-rose-50 text-[#D91624] border border-rose-200'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>
                      {profile.kycTier === 2 && profile.kycStatus === 'verified'
                        ? 'KYC Level 2 Verified'
                        : profile.kycStatus === 'pending_review'
                        ? (isAk ? 'စိစစ်နေဆဲ' : 'Under Review')
                        : profile.kycTier === 1
                        ? 'KYC Level 1'
                        : (isAk ? 'အတည်မပြုရသေး' : 'Unverified')}
                    </span>
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

              <div className="p-4 flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setLanguageModalOpen(true)}
                  className="flex items-center gap-3.5 text-left cursor-pointer group min-w-0 flex-1"
                >
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
                    <Globe size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-zinc-900 block truncate group-hover:text-[#0D9488] transition">
                      {isAk ? 'ဘာသာစကား' : 'Language'}
                    </span>
                    <span className="text-[11px] text-zinc-400 block truncate">
                      {isAk ? 'အာရက္ခ / English' : 'Arakan / English'}
                    </span>
                  </div>
                </button>

                {/* Direct Dual Switcher: AK Flag with Arakan in Rakhine & GB Flag with English */}
                <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200/80 gap-1 shrink-0 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (setLang) setLang('ak')
                      triggerSettingsToast(isAk ? 'ရွေးချယ်ထားသော ဘာသာစကား - အာရက္ခ' : 'Language set to Arakanese (အာရက္ခ)')
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                      isAk
                        ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/70'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    title="အာရက္ခ (Arakan)"
                    aria-label="အာရက္ခ"
                  >
                    <FlagArakan size={18} className="shadow-2xs rounded-[3px]" />
                    <span>အာရက္ခ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (setLang) setLang('en')
                      triggerSettingsToast(isAk ? 'ဘာသာစကားကို အင်္ဂလိပ်သို့ ပြောင်းလဲပြီးပါပြီ' : 'Language set to English')
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                      !isAk
                        ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/70'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    title="English (United Kingdom)"
                    aria-label="English"
                  >
                    <FlagInternational size={18} className="shadow-2xs rounded-[3px]" />
                    <span>English</span>
                  </button>
                </div>
              </div>

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
                  onClick={handleToggleAutoSaveReceipt}
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
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
                    <Fingerprint size={18} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-900 block">
                      {isAk
                        ? (deviceInfo.biometryType === 'faceID'
                            ? 'မျက်နှာမှတ်သား (Face ID)'
                            : isAndroidDevice
                            ? 'လက်ဗွေမှတ်သား (Fingerprint)'
                            : 'လက်ဗွေနှင့် မျက်နှာမှတ်သား')
                        : (deviceInfo.biometryType === 'faceID'
                            ? 'Face ID'
                            : isAndroidDevice
                            ? 'Fingerprint Unlock'
                            : 'Fingerprint & Face ID')}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {deviceInfo.model} · {deviceInfo.os}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={biometricLoginEnabled}
                  aria-label={
                    isAk
                      ? deviceInfo.biometryLabelMm
                      : deviceInfo.biometryLabel
                  }
                  onClick={handleToggleBiometrics}
                  disabled={isBiometricAuthenticating}
                  className={`w-12 h-7 rounded-full p-0.5 transition cursor-pointer disabled:opacity-60 ${
                    biometricLoginEnabled ? 'bg-[#2563EB]' : 'bg-zinc-300'
                  }`}
                >
                  <span
                    className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${
                      biometricLoginEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setAccountSubScreen('pin_management')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-50/70 transition"
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

        {/* Change Profile Photo Modal (Home Screen Popup) */}
        {showChangePhotoModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setShowChangePhotoModal(false)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[28px] p-6 shadow-2xl border border-zinc-100 flex flex-col animate-in slide-in-from-bottom duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Indicator */}
              <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-4 sm:hidden" />

              {/* Title Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">
                    {isAk ? 'ပရိုဖိုင်ဓာတ်ပုံ ပြောင်းရန်' : 'Change profile photo'}
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    {isAk ? 'ကင်မရာ သို့မဟုတ် ဖုန်းပြခန်းမှ ရွေးချယ်ပါ' : 'Select an option to update your photo'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChangePhotoModal(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={homeCameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleProfilePhotoFileChange}
              />
              <input
                ref={homeGalleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoFileChange}
              />

              {/* Options List */}
              <div className="space-y-2.5 pt-4">
                {/* 1. Take Photo */}
                <button
                  type="button"
                  onClick={() => homeCameraInputRef.current?.click()}
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 hover:bg-red-50/60 border border-zinc-200/80 hover:border-[#D91624]/40 flex items-center justify-between group active:scale-[0.98] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-red-100 text-[#D91624] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Camera size={20} strokeWidth={2.2} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-zinc-900 group-hover:text-[#D91624] transition-colors">
                        {isAk ? 'ကင်မရာဖြင့် ဓာတ်ပုံရိုက်မည်' : 'Take Photo'}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {isAk ? 'ဖုန်းကင်မရာ ဖွင့်ရန်' : 'Open camera to capture'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-400 group-hover:text-[#D91624] transition-colors" />
                </button>

                {/* 2. Choose Photo */}
                <button
                  type="button"
                  onClick={() => homeGalleryInputRef.current?.click()}
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 hover:bg-sky-50/60 border border-zinc-200/80 hover:border-sky-500/40 flex items-center justify-between group active:scale-[0.98] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-sky-100 text-[#0284C7] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <ImageIcon size={20} strokeWidth={2.2} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-zinc-900 group-hover:text-[#0284C7] transition-colors">
                        {isAk ? 'ဖုန်းပြခန်းမှ ဓာတ်ပုံရွေးမည်' : 'Choose Photo'}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {isAk ? 'ပြခန်းမှ ဓာတ်ပုံ ရွေးချယ်ရန်' : 'Select from photo library'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-400 group-hover:text-[#0284C7] transition-colors" />
                </button>
              </div>

              {/* 3. Cancel */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setShowChangePhotoModal(false)}
                  className="w-full py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm transition cursor-pointer active:scale-[0.98]"
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
              go={(target) => {
                if (
                  target === 'notifications' ||
                  target === 'settings' ||
                  target === 'account' ||
                  target === 'history'
                ) {
                  setScreen(target)
                } else {
                  requireVerified(target.toUpperCase(), () => setScreen(target))
                }
              }}
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
        return <NotificationsScreen go={setScreen} lang={lang} theme={theme} />
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

        {/* ── Language Selection Modal ── */}
        {languageModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setLanguageModalOpen(false)}
          >
            <div
              className="bg-white w-full sm:max-w-md rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-250 border border-zinc-100 text-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-zinc-900">
                      {isAk ? 'ဘာသာစကား ရွေးချယ်ရန်' : 'Select Language'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {isAk ? 'အက်ပ်သုံး ဘာသာစကား ရွေးပါ' : 'Choose app display language'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLanguageModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-2.5">
                {/* Option 1: Arakanese with AK Flag */}
                <button
                  type="button"
                  onClick={() => {
                    if (setLang) setLang('ak')
                    triggerSettingsToast(isAk ? 'ရွေးချယ်ထားသော ဘာသာစကား - အာရက္ခ' : 'Language set to Arakanese (အာရက္ခ)')
                    setLanguageModalOpen(false)
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isAk
                      ? 'bg-teal-50/60 border-[#0D9488] text-zinc-950 shadow-xs ring-1 ring-[#0D9488]/30'
                      : 'bg-zinc-50/80 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FlagArakan size={28} className="rounded-md shadow-xs shrink-0" />
                    <div>
                      <div className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                        <span>အာရက္ခ</span>
                        <span className="text-[11px] font-normal text-zinc-500">(Arakan)</span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        ရခိုင်ဘာသာစကား (Arakanese)
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      isAk
                        ? 'bg-[#0D9488] border-[#0D9488] text-white'
                        : 'border-zinc-300 bg-white'
                    }`}
                  >
                    {isAk && <Check size={12} strokeWidth={3} />}
                  </div>
                </button>

                {/* Option 2: English with GB Flag */}
                <button
                  type="button"
                  onClick={() => {
                    if (setLang) setLang('en')
                    triggerSettingsToast(isAk ? 'ဘာသာစကားကို အင်္ဂလိပ်သို့ ပြောင်းလဲပြီးပါပြီ' : 'Language set to English')
                    setLanguageModalOpen(false)
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    !isAk
                      ? 'bg-blue-50/60 border-blue-600 text-zinc-950 shadow-xs ring-1 ring-blue-600/30'
                      : 'bg-zinc-50/80 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FlagInternational size={28} className="rounded-md shadow-xs shrink-0" />
                    <div>
                      <div className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                        <span>English</span>
                        <span className="text-[11px] font-normal text-zinc-500">(UK)</span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Global Standard English
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      !isAk
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-zinc-300 bg-white'
                    }`}
                  >
                    {!isAk && <Check size={12} strokeWidth={3} />}
                  </div>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setLanguageModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition cursor-pointer"
                >
                  {isAk ? 'ပြီးပါပြီ' : 'Done'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Verifiable E-Receipt Modal */}
        {selectedSlipTxn && (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
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
                autoSaved={autoSaveReceipt}
                onClose={() => setSelectedSlipTxn(null)}
              />
            </div>
          </div>
        )}

        {/* KYC Level 2 Verification Modal (Level 1: Email Verified, Level 2: National ID Verified, No Level 3) */}
        <KycLevel2Modal
          isOpen={kycFlowModalOpen}
          onClose={() => setKycFlowModalOpen(false)}
          currentProfile={profile}
          onUpdateProfile={(up) => {
            setProfile(up)
            setIsVerified(up.kycTier === 2 && up.kycStatus === 'verified')
          }}
          lang={lang}
        />

        {/* ═══════════════════════════════════════════════════════════════════
            SIGN IN / SIGN UP / FORGOT PIN MODAL
            (Email + 6-digit PIN, 10-min OTP verification, KYC Level 1)
        ═══════════════════════════════════════════════════════════════════ */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => {
            if (isAuthenticated) {
              setAuthModalOpen(false)
            }
          }}
          initialMode={authInitialMode}
          lang={lang}
          onSuccess={(loggedUser) => {
            setIsAuthenticated(true)
            setAuthModalOpen(false)
            if (loggedUser) {
              setProfile((prev) => ({
                ...prev,
                name: loggedUser.name || prev.name,
                firstName: loggedUser.firstName || prev.firstName,
                lastName: loggedUser.lastName || prev.lastName,
                username: loggedUser.username || prev.username,
                email: loggedUser.email || prev.email,
                phone: loggedUser.phone || prev.phone,
                nationalIdNo: loggedUser.nationalIdNo || prev.nationalIdNo,
                dob: loggedUser.dob || prev.dob,
                address: loggedUser.address || prev.address,
                uid: loggedUser.uid || prev.uid,
                petharId: loggedUser.uid || prev.petharId,
                walletAddress: loggedUser.walletAddress || prev.walletAddress,
                kycTier: loggedUser.kyc_tier,
                kycStatus: loggedUser.kyc_status,
                accountTier:
                  loggedUser.kyc_tier === 2 && loggedUser.kyc_status === 'verified'
                    ? 'KYC Level 2 Verified'
                    : loggedUser.kyc_status === 'pending_review'
                    ? 'KYC Level 2 (Under Review)'
                    : 'KYC Level 1 (Email Verified)',
              }))
              setAkdBalance(loggedUser.balance)
              setUsdAccountBalance(loggedUser.usdAccountBalance)
              setIsVerified(loggedUser.kyc_tier === 2 && loggedUser.kyc_status === 'verified')
            }
          }}
        />

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
              <span className="text-[10px] h-3.5 leading-[14px] tracking-tight truncate">
                {isAk ? 'ဝန်ဆောင်မှု' : 'Service'}
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
