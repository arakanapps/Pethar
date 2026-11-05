import React, { useState, useMemo, useEffect } from 'react'
import { ArakanEmblem } from '../components/ArakanEmblem'
import { TransactionSlip } from '../components/TransactionSlip'
import { ReceiveQRCard } from '../components/ReceiveQRCard'
import {
  LayoutGrid, Wallet, CreditCard, History, TrendingUp, Settings,
  Send, QrCode, Search, Sparkles,
  Eye, EyeOff, AlertTriangle, ShieldAlert, Users,
  ExternalLink,
  ArrowUpRight, ArrowDownLeft,
  Sun, Moon, MessageSquare, Terminal
} from 'lucide-react'
import { initialUserProfile, type UserProfile, type Txn } from '../data'
import {
  fetchTransactionsFromDb,
  insertTransactionToDb,
  fetchUserProfileFromDb,
  updateUserBalanceInDb,
  subscribeToTransactions,
  fetchAllUsersForAdmin,
  updateUserStatusInDb,
  updateCitizenKycInDb,
} from '../services/walletDatabase'
import type { Language } from '../i18n'
import { auth } from '../lib/firebase'
import { AdminNavBar } from '../components/admin/AdminNavBar'
import { AdminKycDesk } from '../components/admin/AdminKycDesk'
import { AdminOpenDesk } from '../components/admin/AdminOpenDesk'
import { AdminCitizenDirectory } from '../components/admin/AdminCitizenDirectory'
import { AdminTreasuryDesk } from '../components/admin/AdminTreasuryDesk'
import { AdminSecurityAml } from '../components/admin/AdminSecurityAml'
import { AdminApiDesk } from '../components/admin/AdminApiDesk'
import { AdminCampaignsDesk } from '../components/admin/AdminCampaignsDesk'

export type NavTabType =
  | 'home'
  | 'wallet'
  | 'cards'
  | 'transactions'
  | 'financial'
  | 'settings'
  // Dev Admin Role Tabs
  | 'admin-kyc'
  | 'admin-chat'
  | 'admin-ads'
  | 'admin-api'
  | 'admin-fraud'
  | 'admin-users'
  | 'admin-treasury'

export interface DashboardPageProps {
  lang?: Language
  setLang?: (lang: Language) => void
  initialTab?: string
  theme?: string
  setTheme?: (theme: string) => void
  onExit?: () => void
}

export interface KycApplicant {
  id: string
  name: string
  nameMm: string
  fatherName: string
  township: string
  townshipMm: string
  idCard: string
  dob: string
  gender: 'Male' | 'Female'
  occupation: string
  phone: string
  email: string
  uid: string
  walletAddress: string
  submitted: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Flagged'
  riskScore: 'Low' | 'Medium' | 'High'
  faceMatchScore: number
  docQuality: string
  rejectionReason?: string
  complianceNotes?: string
}

export interface AdminUserRecord {
  uid: string
  name: string
  username: string
  phone: string
  email: string
  walletAddress: string
  akdBalance: number
  usdBalance: number
  kycTier: 1 | 2
  status: 'ACTIVE' | 'SUSPENDED' | 'FROZEN'
  dailyLimit: number
  dailyUsed: number
  registeredDate: string
  lastActive: string
  township: string
  complianceNotes: string
}

export interface SystemAuditLog {
  id: string
  timestamp: string
  operator: string
  category: 'KYC' | 'USER_CONTROL' | 'POLICY' | 'LEDGER' | 'SECURITY' | 'FRAUD'
  action: string
  details: string
  targetId: string
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL'
}

export interface PromoAdItem {
  id: string
  titleEn: string
  titleAk: string
  descEn: string
  descAk: string
  gradient: string
  accentBg: string
  active: boolean
  impressions: number
  clicks: number
  category: 'remittance' | 'cashback' | 'swap' | 'reserves'
}

export interface ApiEndpointItem {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  category: string
  description: string
  requestBody?: string
  responseBody: string
  latency: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'operator'
  text: string
  time: string
  channel: 'mobilewallet' | 'android' | 'web'
}

const CHAT_STORAGE_KEY = 'pethar_customer_chat_messages'

export const DashboardPage: React.FC<DashboardPageProps> = ({
  lang = 'ak',
  setLang,
  initialTab,
  theme = 'light',
  setTheme,
  onExit,
}) => {
  const ak = lang === 'ak'

  // Dev Admin Role Switcher
  const [isDevAdminMode, setIsDevAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const tabParam = searchParams.get('tab')
      if (tabParam === 'chat' || tabParam === 'support' || tabParam === 'admin-chat') return true
      if (window.location.pathname.includes('/support') || window.location.pathname.includes('/chat')) return true
      const stored = localStorage.getItem('pethar_dev_admin_mode')
      if (stored === 'true') return true
    }
    return initialTab?.startsWith('admin') || initialTab === 'chat' || initialTab === 'support' || false
  })

  // Navigation Tab State
  const [navTab, setNavTab] = useState<NavTabType>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const tabParam = searchParams.get('tab')
      if (tabParam === 'chat' || tabParam === 'support' || tabParam === 'admin-chat' || window.location.pathname.includes('/support') || window.location.pathname.includes('/chat')) return 'admin-chat'
    }
    if (initialTab === 'admin-kyc' || initialTab === 'kyc') return 'admin-kyc'
    if (initialTab === 'admin-chat' || initialTab === 'chat' || initialTab === 'support') return 'admin-chat'
    if (initialTab === 'admin-ads' || initialTab === 'ads') return 'admin-ads'
    if (initialTab === 'admin-api' || initialTab === 'api') return 'admin-api'
    if (initialTab === 'admin-fraud' || initialTab === 'fraud') return 'admin-fraud'
    if (initialTab === 'admin-users' || initialTab === 'users') return 'admin-users'
    if (initialTab === 'admin-treasury' || initialTab === 'treasury-admin') return 'admin-treasury'
    if (initialTab === 'treasury' || initialTab === 'financial') return 'financial'
    if (initialTab === 'history' || initialTab === 'transactions') return 'transactions'
    if (initialTab === 'wallet') return 'wallet'
    if (initialTab === 'cards') return 'cards'
    if (initialTab === 'settings') return 'settings'
    return 'home'
  })

  // Dark/Light mode local toggle
  const [isDarkMode, setIsDarkMode] = useState(false)

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined' && auth?.currentUser) {
      const u = auth.currentUser
      return {
        ...initialUserProfile,
        name: u.displayName || initialUserProfile.name,
        email: u.email || initialUserProfile.email,
        phone: u.phoneNumber || initialUserProfile.phone,
        avatarUrl: u.photoURL || initialUserProfile.avatarUrl,
      }
    }
    return initialUserProfile
  })

  // Balances
  const [walletBalance, setWalletBalance] = useState(12500.0)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [txCategoryFilter, setTxCategoryFilter] = useState<'all' | 'transfer' | 'inflow' | 'swap'>('all')

  // Virtual Card Controls
  const [cardLocked, setCardLocked] = useState(false)
  const [cardDetailsVisible, setCardDetailsVisible] = useState(false)
  const [internetLimit, setInternetLimit] = useState(200)
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(true)

  // Transactions State
  const [txList, setTxList] = useState<Txn[]>([])

  // Modals for Customer Wallet
  const [selectedTx, setSelectedTx] = useState<Txn | null>(null)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [topUpModalOpen, setTopUpModalOpen] = useState(false)

  // Send Money form state
  const [recipientInput, setRecipientInput] = useState('')
  const [recipientNameInput, setRecipientNameInput] = useState('')
  const [sendAmountInput, setSendAmountInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Top Up form state
  const [topUpAmount, setTopUpAmount] = useState('100.00')
  const [topUpAsset, setTopUpAsset] = useState<'USDT' | 'USDC' | 'USD1'>('USDT')

  // ════════════════════════════════════════════════════════════════════════
  // DEV ADMIN ROLE DATA STATES
  // ════════════════════════════════════════════════════════════════════════
  const [kycQueue, setKycQueue] = useState<KycApplicant[]>([
    {
      id: 'KYC-0091',
      name: 'Kyaw Myo Thu',
      nameMm: 'ကျော်မျိုးသူ',
      fatherName: 'U Ba Thein',
      township: 'Sittwe Central',
      townshipMm: 'စစ်တွေမြို့နယ်',
      idCard: 'ARAK-ID-992140',
      dob: '1994-06-12',
      gender: 'Male',
      occupation: 'Software Engineer',
      phone: '+959798221001',
      email: 'kyawmyothu@gmail.com',
      uid: '202610190001',
      walletAddress: 'akd_node_99a820fc',
      submitted: '10 mins ago',
      status: 'Pending',
      riskScore: 'Low',
      faceMatchScore: 98.4,
      docQuality: 'High Res OCR Validated',
    },
    {
      id: 'KYC-0092',
      name: 'Nilar Win',
      nameMm: 'နီလာဝင်း',
      fatherName: 'U Aung Kyaw',
      township: 'Mrauk-U',
      townshipMm: 'မြောက်ဦးမြို့နယ်',
      idCard: 'ARAK-ID-883102',
      dob: '1998-11-24',
      gender: 'Female',
      occupation: 'Retail Pharmacy',
      phone: '+959798221002',
      email: 'nilarwin@gmail.com',
      uid: '202610190002',
      walletAddress: 'akd_node_33d719ab',
      submitted: '35 mins ago',
      status: 'Pending',
      riskScore: 'Low',
      faceMatchScore: 96.1,
      docQuality: 'Clean Smart Scan',
    },
  ])

  const [selectedApplicant, setSelectedApplicant] = useState<KycApplicant | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedRejectReason, setSelectedRejectReason] = useState('Blurry photo / Unreadable NRIC ID document')
  const [customRejectNote, setCustomRejectNote] = useState('')

  // Users Directory State
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([])

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([
    {
      id: 'AUD-901',
      timestamp: '14:20',
      operator: 'ROOT-OPERATOR-01',
      category: 'SECURITY',
      action: 'SYSTEM_BOOT',
      details: 'All consensus nodes synced. 1:1 USD reserve ratio verified at 100.0%.',
      targetId: 'CONSENSUS_GLOBAL',
      status: 'SUCCESS',
    },
  ])

  // Customer Chat Operator Console State
  const [operatorChannelFilter, setOperatorChannelFilter] = useState<'all' | 'mobilewallet' | 'android'>('all')
  const [operatorReplyText, setOperatorReplyText] = useState('')
  const [customerMessages, setCustomerMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(CHAT_STORAGE_KEY)
        if (stored) return JSON.parse(stored)
      } catch { }
    }
    return [
      {
        id: 'msg-seed-1',
        sender: 'user',
        channel: 'mobilewallet',
        text: 'Hello operator, my transfer to Ko Min Aung settled instantly. Is the 1:1 USD backing verifiable?',
        time: '14:10',
      },
      {
        id: 'msg-seed-2',
        sender: 'operator',
        channel: 'mobilewallet',
        text: 'Yes! All Arakan Dollars are 100% USDT/USDC backed at fixed 1:1 parity.',
        time: '14:12',
      },
      {
        id: 'msg-seed-3',
        sender: 'user',
        channel: 'android',
        text: 'Greetings, I downloaded the new Android signed APK and P2P transfers are working great in Sittwe.',
        time: '14:22',
      },
    ]
  })

  // Sync Customer chat messages with localStorage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CHAT_STORAGE_KEY && e.newValue) {
        try {
          setCustomerMessages(JSON.parse(e.newValue))
        } catch { }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Ads Control State
  const [promoAds, setPromoAds] = useState<PromoAdItem[]>([
    {
      id: 'ad-1',
      titleEn: 'Péthar Zero-Fee Global Remittance',
      titleAk: 'ဖေ့သာ ၀% ဝန်ဆောင်ခ အထူးအစီအစဉ်',
      descEn: 'Instant transfers & zero network gas fees worldwide',
      descAk: 'နယ်စပ်ဖြတ်ကျော် ငွေလွှဲခမဲ့နှင့် လက်ငင်းလွှဲပို့ခြင်း',
      gradient: 'from-zinc-900 via-zinc-800 to-[#7A1020]',
      accentBg: 'bg-red-500/20 text-red-400',
      active: true,
      impressions: 48920,
      clicks: 3410,
      category: 'remittance',
    },
    {
      id: 'ad-2',
      titleEn: 'Arakan P2P Transfer Rewards',
      titleAk: 'အာရက္ခ P2P ငွေလွှဲ အထူးအစီအစဉ်',
      descEn: 'Enjoy zero fees and instant cashback on P2P consumer transfers',
      descAk: 'လူပုဂ္ဂိုလ်အချင်းချင်း ငွေလွှဲမှုတိုင်းအတွက် လက်ငင်းဆုလာဘ် ရယူပါ',
      gradient: 'from-slate-900 via-slate-800 to-emerald-900',
      accentBg: 'bg-emerald-500/20 text-emerald-400',
      active: true,
      impressions: 32100,
      clicks: 2150,
      category: 'cashback',
    },
    {
      id: 'ad-3',
      titleEn: '1:1 Web3 Stablecoin Swap',
      titleAk: '၁:၁ ခရစ်ပတို လဲလှယ်မှု စနစ်',
      descEn: 'Instant atomic swaps between USDT, USDC, and AKD',
      descAk: 'USDT, USDC နှင့် AKD အကြား ချက်ချင်းလဲလှယ်ပါ',
      gradient: 'from-indigo-950 via-slate-900 to-slate-800',
      accentBg: 'bg-indigo-500/20 text-indigo-400',
      active: true,
      impressions: 21050,
      clicks: 1420,
      category: 'swap',
    },
    {
      id: 'ad-4',
      titleEn: 'Ledger-Backed Arakan Dollar',
      titleAk: 'စာရင်းမှ အာမခံထားသော အာရက္ခဒေါ်လာ',
      descEn: 'Fixed 1:1 peg to the US dollar',
      descAk: 'အမေရိကန်ဒေါ်လာနှင့် ၁:၁ ပုံသေနှုန်း ချိတ်ဆက်ထားသည်',
      gradient: 'from-amber-950 via-stone-900 to-stone-800',
      accentBg: 'bg-amber-500/20 text-amber-400',
      active: true,
      impressions: 19400,
      clicks: 980,
      category: 'reserves',
    },
  ])

  // New Ad Campaign Modal
  const [newAdModalOpen, setNewAdModalOpen] = useState(false)
  const [newAdTitleEn, setNewAdTitleEn] = useState('')
  const [newAdTitleAk, setNewAdTitleAk] = useState('')
  const [newAdDescEn, setNewAdDescEn] = useState('')
  const [newAdDescAk, setNewAdDescAk] = useState('')

  // API Control State
  const apiEndpoints: ApiEndpointItem[] = [
    {
      id: 'transfers',
      method: 'POST',
      path: '/v1/transfers',
      category: 'Payments',
      description: 'Execute instant atomic transfer between two citizen accounts with Ed25519 authorization.',
      requestBody: JSON.stringify({ recipient: 'akd_node_99a820fc', amount: 320.0, currency: 'AKD', memo: 'Batch #109' }, null, 2),
      responseBody: JSON.stringify({ id: 'tx_01ja892e01', status: 'settled', amount: 320.0, currency: 'AKD', fee: 0.0, block_height: 2491032 }, null, 2),
      latency: '24ms',
    },
    {
      id: 'rates',
      method: 'GET',
      path: '/v1/rates/live',
      category: 'Market',
      description: 'Stream institutional FX quotes for AKD, USD, USDT, and USDC.',
      responseBody: JSON.stringify({ base: 'AKD', pairs: { USDT: { rate: 1.0, spread: 0 }, USD: { rate: 1.0, spread: 0 } } }, null, 2),
      latency: '12ms',
    },
    {
      id: 'swap',
      method: 'POST',
      path: '/v1/swap/crypto-to-akd',
      category: 'Crypto Gateway',
      description: 'Execute instant 1:1 in-app atomic swap between USDT/USDC and AKD ledger.',
      requestBody: JSON.stringify({ user_id: 'usr_202610190001', amount: 500.0, token: 'USDT' }, null, 2),
      responseBody: JSON.stringify({ tx_id: 'swap_99182a', status: 'completed', swapped_amount: '500.00', from: 'USDT', to: 'AKD', fee: '0.00' }, null, 2),
      latency: '18ms',
    },
    {
      id: 'deposit-gateway',
      method: 'POST',
      path: '/v1/crypto/deposit-webhook',
      category: 'Crypto Gateway',
      description: 'Listen for verified EVM smart contract USDT/USDC deposits and credit user crypto wallet.',
      requestBody: JSON.stringify({ tx_hash: '0x99201a4f...', deposit_address: '0x202610190001...', amount: 1000.0, token: 'USDC' }, null, 2),
      responseBody: JSON.stringify({ status: 'confirmed', confirmations: 12, credited: true }, null, 2),
      latency: '32ms',
    },
  ]

  const [activeApiEndpoint, setActiveApiEndpoint] = useState<ApiEndpointItem>(apiEndpoints[0])
  const [apiSimulating, setApiSimulating] = useState(false)
  const [copiedApiJson, setCopiedApiJson] = useState(false)

  // Fraud Detection State
  const [fraudFilter, setFraudFilter] = useState<'all' | 'flagged' | 'clean'>('all')
  const [circuitBreakerOpen, setCircuitBreakerOpen] = useState(false)
  const [circuitBreakerPin, setCircuitBreakerPin] = useState('')
  const [circuitBreakerActive, setCircuitBreakerActive] = useState(false)

  // Sync live transactions and users on Mount
  useEffect(() => {
    let isMounted = true

    fetchTransactionsFromDb().then((txs) => {
      if (isMounted && txs.length > 0) setTxList(txs)
    })

    fetchUserProfileFromDb().then((up) => {
      if (isMounted && up) {
        setWalletBalance(up.balance)
        setProfile((prev) => ({
          ...prev,
          name: up.name || prev.name,
          phone: up.phone || prev.phone,
          uid: up.uid || prev.uid,
        }))
      }
    })

    fetchAllUsersForAdmin().then((dbUsers) => {
      if (isMounted && dbUsers.length > 0) {
        setUsersList(
          dbUsers.map((u) => ({
            uid: u.uid,
            name: u.name || 'Citizen User',
            username: u.username || `@${(u.name || 'user').toLowerCase().replace(/\s+/g, '')}`,
            phone: u.phone || '',
            email: u.email || '',
            walletAddress: u.walletAddress || u.uid,
            akdBalance: u.akdWalletBalance || u.balance || 0,
            usdBalance: u.usdAccountBalance || 0,
            kycTier: u.kyc_tier || 1,
            status: 'ACTIVE',
            dailyLimit: 50000,
            dailyUsed: 0,
            registeredDate: '2026-10-19',
            lastActive: 'Active',
            township: u.address || 'Arakan',
            complianceNotes: 'Database citizen record',
          }))
        )
      }
    })

    const unsubRealtime = subscribeToTransactions((newTx) => {
      if (isMounted) {
        setTxList((prev) => {
          if (prev.some((t) => t.id === newTx.id || t.refId === newTx.refId)) return prev
          return [newTx, ...prev]
        })
      }
    })

    return () => {
      isMounted = false
      unsubRealtime()
    }
  }, [])

  // Filtered transactions for wallet
  const filteredTransactions = useMemo(() => {
    return txList.filter((tx) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        tx.title.toLowerCase().includes(q) ||
        tx.titleMm.includes(q) ||
        tx.counterparty.toLowerCase().includes(q) ||
        tx.refId.toLowerCase().includes(q)

      if (!matchesSearch) return false
      if (txCategoryFilter === 'transfer') return tx.category === 'transfer'
      if (txCategoryFilter === 'inflow') return tx.amount > 0
      if (txCategoryFilter === 'swap') return tx.category === 'crypto' || tx.category === 'swap'
      return true
    })
  }, [txList, searchQuery, txCategoryFilter])

  // Fraud Detection: Automated Risk Scoring for Transactions
  const scoredTransactions = useMemo(() => {
    return txList.map((tx) => {
      const isHighAmount = Math.abs(tx.amount) >= 5000
      const isOddHour = tx.time.includes('03:') || tx.time.includes('04:')
      const isSuspect = isHighAmount && isOddHour
      const risk: 'Low' | 'Medium' | 'High' = isSuspect ? 'High' : isHighAmount ? 'Medium' : 'Low'
      return {
        ...tx,
        risk,
        flagReason: isSuspect
          ? 'Velocity & anomalous timing trigger'
          : isHighAmount
            ? 'Large transfer threshold review'
            : 'Normal peer settlement',
      }
    })
  }, [txList])

  const filteredFraudTxs = useMemo(() => {
    if (fraudFilter === 'flagged') return scoredTransactions.filter((t) => t.risk === 'High' || t.risk === 'Medium')
    if (fraudFilter === 'clean') return scoredTransactions.filter((t) => t.risk === 'Low')
    return scoredTransactions
  }, [scoredTransactions, fraudFilter])

  // Send Money execution
  const handleExecuteSend = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(sendAmountInput)
    if (!recipientInput || isNaN(amt) || amt <= 0 || amt > walletBalance) return

    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      const targetName = recipientNameInput || recipientInput
      const newTx: Txn = {
        id: `TX-${Date.now().toString().slice(-4)}`,
        refId: `${Math.floor(50000000000000 + Math.random() * 900000000000)}`,
        title: `Transfer to ${targetName}`,
        titleMm: `${targetName} သို့ ငွေလွှဲခြင်း`,
        category: 'transfer',
        amount: -amt,
        currency: 'AKD',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'VERIFIED',
        counterparty: `${targetName} (${recipientInput})`,
        counterpartyMm: `${targetName} (ဖေ့သာ)`,
        fee: 0.0,
        hash: `0x${Math.random().toString(16).slice(2, 12)}`,
      }

      const updatedBalance = Math.max(0, walletBalance - amt)
      setWalletBalance(updatedBalance)
      setTxList((prev) => [newTx, ...prev])
      insertTransactionToDb(newTx)
      updateUserBalanceInDb(updatedBalance)

      setSendModalOpen(false)
      setRecipientInput('')
      setRecipientNameInput('')
      setSendAmountInput('')
      setSelectedTx(newTx)
      setReceiptModalOpen(true)
    }, 400)
  }

  // Top Up execution
  const handleExecuteTopUp = () => {
    const amt = parseFloat(topUpAmount) || 0
    if (amt > 0) {
      const updatedBalance = walletBalance + amt
      setWalletBalance(updatedBalance)
      setTopUpModalOpen(false)
      const newTx: Txn = {
        id: `TX-${Date.now().toString().slice(-4)}`,
        refId: `${Math.floor(50000000000000 + Math.random() * 900000000000)}`,
        title: `Top Up via ${topUpAsset}`,
        titleMm: `${topUpAsset} မှ ငွေသွင်းခြင်း`,
        category: 'crypto',
        amount: amt,
        currency: 'AKD',
        time: 'Just now',
        status: 'SETTLED',
        counterparty: `Treasury Gateway (${amt} ${topUpAsset})`,
        counterpartyMm: `ဘဏ္ဍာတိုက်ငွေသွင်း`,
        fee: 0.0,
        hash: `0x${Math.random().toString(16).slice(2, 14)}`,
      }
      setTxList((prev) => [newTx, ...prev])
      insertTransactionToDb(newTx)
      updateUserBalanceInDb(updatedBalance)
    }
  }

  // Admin: Approve KYC
  const handleApproveKyc = async (applicant: KycApplicant) => {
    setKycQueue((prev) => prev.map((k) => (k.id === applicant.id ? { ...k, status: 'Approved' } : k)))
    await updateCitizenKycInDb(applicant.uid, 'verified', 2)

    const newLog: SystemAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      operator: 'ROOT-OPERATOR-01',
      category: 'KYC',
      action: 'APPROVE_TIER_2',
      details: `Approved Tier-2 KYC verification for ${applicant.name} (${applicant.idCard}).`,
      targetId: applicant.uid,
      status: 'SUCCESS',
    }
    setAuditLogs((prev) => [newLog, ...prev])
    setSelectedApplicant(null)
  }

  // Admin: Reject KYC
  const handleConfirmRejectKyc = async () => {
    if (!selectedApplicant) return
    const reason = customRejectNote ? `${selectedRejectReason} (${customRejectNote})` : selectedRejectReason

    setKycQueue((prev) => prev.map((k) => (k.id === selectedApplicant.id ? { ...k, status: 'Rejected', rejectionReason: reason } : k)))
    await updateCitizenKycInDb(selectedApplicant.uid, 'rejected', 1, reason)

    const newLog: SystemAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      operator: 'ROOT-OPERATOR-01',
      category: 'KYC',
      action: 'REJECT_TIER_2',
      details: `Rejected KYC for ${selectedApplicant.name}. Reason: ${reason}`,
      targetId: selectedApplicant.uid,
      status: 'WARNING',
    }
    setAuditLogs((prev) => [newLog, ...prev])
    setRejectModalOpen(false)
    setSelectedApplicant(null)
    setCustomRejectNote('')
  }

  // Admin: Send Operator Reply in Customer Chat Desk
  const handleSendOperatorReply = (custom?: string) => {
    const text = (custom || operatorReplyText).trim()
    if (!text) return

    const newOpMsg: ChatMessage = {
      id: `msg-op-${Date.now()}`,
      sender: 'operator',
      channel: operatorChannelFilter === 'all' ? 'mobilewallet' : operatorChannelFilter,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const updated = [...customerMessages, newOpMsg]
    setCustomerMessages(updated)
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated))
    } catch { }
    if (!custom) setOperatorReplyText('')
  }

  // Admin: Toggle Ad Active / Paused
  const handleToggleAd = (id: string) => {
    setPromoAds((prev) => prev.map((ad) => (ad.id === id ? { ...ad, active: !ad.active } : ad)))
  }

  // Admin: Create Campaign
  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdTitleEn) return
    const newAd: PromoAdItem = {
      id: `ad-${Date.now()}`,
      titleEn: newAdTitleEn,
      titleAk: newAdTitleAk || newAdTitleEn,
      descEn: newAdDescEn || 'Official promotional spotlight',
      descAk: newAdDescAk || 'တရားဝင် အရောင်းမြှင့်တင်ရေး',
      gradient: 'from-slate-900 via-zinc-800 to-amber-900',
      accentBg: 'bg-amber-500/20 text-amber-400',
      active: true,
      impressions: 0,
      clicks: 0,
      category: 'remittance',
    }
    setPromoAds((prev) => [newAd, ...prev])
    setNewAdTitleEn('')
    setNewAdTitleAk('')
    setNewAdDescEn('')
    setNewAdDescAk('')
    setNewAdModalOpen(false)
  }

  // Admin: Emergency Kill Switch
  const handleToggleCircuitBreaker = () => {
    if (circuitBreakerPin !== '990011' && circuitBreakerPin.length !== 6) {
      alert(ak ? 'ကျေးဇူးပြု၍ ၆ လုံး PIN နံပါတ် အမှန်ထည့်ပါ (ဥပမာ 990011)' : 'Enter valid 6-digit administrative override PIN (e.g. 990011)')
      return
    }
    const nextState = !circuitBreakerActive
    setCircuitBreakerActive(nextState)
    setCircuitBreakerOpen(false)
    setCircuitBreakerPin('')

    const newLog: SystemAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      operator: 'ROOT-OPERATOR-01',
      category: 'SECURITY',
      action: nextState ? 'CIRCUIT_BREAKER_ENGAGED' : 'CIRCUIT_BREAKER_DISENGAGED',
      details: nextState ? 'EMERGENCY FREEZE ENGAGED: All outbound ledger transactions suspended.' : 'NORMAL SETTLEMENTS RESTORED.',
      targetId: 'CONSENSUS_GLOBAL',
      status: nextState ? 'CRITICAL' : 'SUCCESS',
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  // Toggle Dev Admin Mode
  const handleToggleAdminMode = () => {
    const next = !isDevAdminMode
    setIsDevAdminMode(next)
    try {
      localStorage.setItem('pethar_dev_admin_mode', String(next))
    } catch { }
    if (next) {
      setNavTab('admin-kyc')
    } else {
      setNavTab('home')
    }
  }

  void theme
  void setTheme

  // Additional Handlers for modern Admin components
  const handleSimulateAndroidMsg = () => {
    const newCustMsg: ChatMessage = {
      id: `msg-and-${Date.now()}`,
      sender: 'user',
      channel: 'android',
      text: 'Customer from Sittwe on Android APK: Help needed with P2P transfer confirmation and QR code display.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    const updated = [...customerMessages, newCustMsg]
    setCustomerMessages(updated)
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }

  const handleSimulateWalletMsg = () => {
    const newCustMsg: ChatMessage = {
      id: `msg-mw-${Date.now()}`,
      sender: 'user',
      channel: 'mobilewallet',
      text: 'Daw Nilar Win from Mobile Wallet: Can you confirm my ₳250 QR deposit on ledger?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    const updated = [...customerMessages, newCustMsg]
    setCustomerMessages(updated)
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }

  const handleFreezeAccountFromAml = async (counterparty: string) => {
    await updateUserStatusInDb(counterparty, 'FROZEN', 'Automated fraud risk flag hold')
    setUsersList((prev) =>
      prev.map((u) => (u.uid === counterparty || u.username === counterparty ? { ...u, status: 'FROZEN' } : u))
    )
    const newLog: SystemAuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      operator: 'ROOT-01',
      category: 'SECURITY',
      action: 'ACCOUNT_FROZEN',
      details: `Account ${counterparty} placed on security hold`,
      targetId: counterparty,
      status: 'WARNING',
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  const handleToggleUserStatus = async (uid: string, currentStatus: string) => {
    const next = currentStatus === 'FROZEN' ? 'ACTIVE' : 'FROZEN'
    await updateUserStatusInDb(uid, next, 'Operator toggle')
    setUsersList((prev) => prev.map((u) => (u.uid === uid ? { ...u, status: next } : u)))
    const newLog: SystemAuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      operator: 'ROOT-01',
      category: 'USER_CONTROL',
      action: next === 'FROZEN' ? 'ACCOUNT_FROZEN' : 'ACCOUNT_UNFROZEN',
      details: `Citizen ${uid} status changed to ${next}`,
      targetId: uid,
      status: 'SUCCESS',
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  const handleTestApiEndpoint = () => {
    setApiSimulating(true)
    setTimeout(() => setApiSimulating(false), 400)
  }

  const handleCopyApiJson = () => {
    try {
      navigator.clipboard.writeText(activeApiEndpoint.responseBody)
      setCopiedApiJson(true)
      setTimeout(() => setCopiedApiJson(false), 2000)
    } catch {}
  }

  // Modal Renderers to share between views
  const renderCircuitBreakerModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl p-6 bg-slate-950 border border-red-500/50 text-white shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="font-black text-base">
            {circuitBreakerActive ? 'Disengage Circuit Breaker' : 'Engage Emergency Kill-Switch'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Enter your 6-digit administrative override PIN to {circuitBreakerActive ? 'restore' : 'freeze'} ledger settlements.
          </p>
        </div>
        <input
          type="password"
          maxLength={6}
          value={circuitBreakerPin}
          onChange={(e) => setCircuitBreakerPin(e.target.value)}
          placeholder="••••••"
          className="w-full py-2.5 text-center text-xl tracking-widest font-mono bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCircuitBreakerOpen(false)}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleToggleCircuitBreaker}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg cursor-pointer"
          >
            Authorize
          </button>
        </div>
      </div>
    </div>
  )

  const renderRejectModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-black text-base text-slate-900 dark:text-white">Reject KYC Application</h3>
          <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Rejection Reason</label>
            <select
              value={selectedRejectReason}
              onChange={(e) => setSelectedRejectReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Blurry photo / Unreadable NRIC ID document">Blurry photo / Unreadable NRIC ID document</option>
              <option value="ID expired or mismatched name with registry">ID expired or mismatched name with registry</option>
              <option value="Duplicate citizen profile detected">Duplicate citizen profile detected</option>
              <option value="Suspected fraudulent document">Suspected fraudulent document</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Additional Note (Optional)</label>
            <input
              type="text"
              value={customRejectNote}
              onChange={(e) => setCustomRejectNote(e.target.value)}
              placeholder="Notes for applicant..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRejectKyc}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              Confirm Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNewAdModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-black text-base text-slate-900 dark:text-white">Create New Promotional Campaign</h3>
          <button onClick={() => setNewAdModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleCreateAd} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Campaign Title (English)</label>
            <input
              type="text"
              required
              value={newAdTitleEn}
              onChange={(e) => setNewAdTitleEn(e.target.value)}
              placeholder="e.g. Sittwe Festival Cashback"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Campaign Title (Arakanese/Burmese)</label>
            <input
              type="text"
              value={newAdTitleAk}
              onChange={(e) => setNewAdTitleAk(e.target.value)}
              placeholder="e.g. စစ်တွေပွဲတော် ငွေပြန်အမ်း အစီအစဉ်"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Description (English)</label>
            <input
              type="text"
              value={newAdDescEn}
              onChange={(e) => setNewAdDescEn(e.target.value)}
              placeholder="e.g. Enjoy 2% instant cashback on all QR payments"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Description (Arakanese/Burmese)</label>
            <input
              type="text"
              value={newAdDescAk}
              onChange={(e) => setNewAdDescAk(e.target.value)}
              placeholder="e.g. QR ငွေပေးချေမှုတိုင်းအတွက် ၂% ချက်ချင်းငွေပြန်အမ်း"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNewAdModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-xs font-bold text-white shadow-md cursor-pointer"
            >
              Publish Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const renderReceiptModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
        <TransactionSlip
          refId={selectedTx!.refId}
          amount={Math.abs(selectedTx!.amount)}
          recipientName={selectedTx!.counterparty}
          recipientId={selectedTx!.counterpartyMm}
          senderName={profile.name || 'Citizen'}
          senderId={profile.petharId}
          fee={selectedTx!.fee || 0}
          timestamp={selectedTx!.time}
          lang={lang}
          onClose={() => { setReceiptModalOpen(false); setSelectedTx(null); }}
        />
      </div>
    </div>
  )

  const renderSendModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-black text-base text-slate-900 dark:text-white">{ak ? 'ငွေလွှဲပို့မည်' : 'Send Money'}</h3>
          <button onClick={() => setSendModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleExecuteSend} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">{ak ? 'လက်ခံမည့်သူ UID / အမည်' : 'Recipient UID / Name'}</label>
            <input
              type="text"
              required
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              placeholder="202610190002"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">{ak ? 'ငွေပမာဏ (AKD)' : 'Amount (AKD)'}</label>
            <input
              type="number"
              step="0.01"
              required
              value={sendAmountInput}
              onChange={(e) => setSendAmountInput(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {isSending ? 'Sending...' : ak ? 'ချက်ချင်း လွှဲမည်' : 'Send Instant ₳'}
          </button>
        </form>
      </div>
    </div>
  )

  const renderReceiveModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <ReceiveQRCard
        lang={lang}
        name={profile.name}
        petharId={profile.petharId}
        onClose={() => setReceiveModalOpen(false)}
      />
    </div>
  )

  const renderTopUpModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-black text-base text-slate-900 dark:text-white">{ak ? 'ငွေသွင်းမည် (USDT/USDC)' : 'Top Up (USDT / USDC)'}</h3>
          <button onClick={() => setTopUpModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Asset</label>
            <div className="grid grid-cols-2 gap-2">
              {(['USDT', 'USDC'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setTopUpAsset(a)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${topUpAsset === a ? 'bg-[#FF6B00] text-white border-[#FF6B00]' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Amount</label>
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <button
            type="button"
            onClick={handleExecuteTopUp}
            className="w-full py-3 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Confirm 1:1 Top Up
          </button>
        </div>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════════════════
  // DEV ADMIN MODE CONSOLE VIEW (Modern Liquid-Glass & High Density)
  // ══════════════════════════════════════════════════════════════════════════
  if (isDevAdminMode) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#090D16] text-white' : 'bg-[#F4F6F9] text-slate-900'} font-sans flex flex-col transition-colors duration-200`}>
        {/* Liquid Glass Navigation Bar (Glisse & 23rd inspired) */}
        <AdminNavBar
          currentTab={navTab}
          onSelectTab={(tabId) => setNavTab(tabId as NavTabType)}
          isDevAdminMode={isDevAdminMode}
          onToggleAdminMode={handleToggleAdminMode}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((v) => !v)}
          lang={lang}
          onToggleLang={setLang ? () => setLang(ak ? 'en' : 'ak') : undefined}
          onExit={onExit}
          onOpenKillSwitch={() => setCircuitBreakerOpen(true)}
          circuitBreakerActive={circuitBreakerActive}
          kycPendingCount={kycQueue.filter((k) => k.status === 'Pending').length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Emergency Circuit Breaker Active Alert Banner */}
        {circuitBreakerActive && (
          <div className="mx-3 sm:mx-6 mt-2 p-3 sm:p-4 rounded-2xl bg-red-950 border-2 border-red-500 text-white flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-red-300">
                  CRITICAL: Emergency Circuit Breaker Engaged
                </div>
                <div className="text-xs text-red-200">
                  All ledger settlements across consensus nodes are paused for security review.
                </div>
              </div>
            </div>
            <button
              onClick={() => setCircuitBreakerOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono transition cursor-pointer"
            >
              Disengage
            </button>
          </div>
        )}

        {/* Main Admin Workspace (High Density & Less Text) */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
          {navTab === 'admin-kyc' && (
            <AdminKycDesk
              kycQueue={kycQueue}
              onApprove={handleApproveKyc}
              onOpenRejectModal={(applicant) => {
                setSelectedApplicant(applicant)
                setRejectModalOpen(true)
              }}
              isDarkMode={isDarkMode}
              lang={lang}
            />
          )}

          {navTab === 'admin-chat' && (
            <AdminOpenDesk
              messages={customerMessages}
              onSendMessage={handleSendOperatorReply}
              replyText={operatorReplyText}
              setReplyText={setOperatorReplyText}
              channelFilter={operatorChannelFilter}
              setChannelFilter={setOperatorChannelFilter}
              onSimulateAndroidMsg={handleSimulateAndroidMsg}
              onSimulateWalletMsg={handleSimulateWalletMsg}
              isDarkMode={isDarkMode}
            />
          )}

          {navTab === 'admin-users' && (
            <AdminCitizenDirectory
              usersList={usersList}
              onToggleUserStatus={handleToggleUserStatus}
              isDarkMode={isDarkMode}
            />
          )}

          {navTab === 'admin-fraud' && (
            <AdminSecurityAml
              filteredFraudTxs={filteredFraudTxs}
              fraudFilter={fraudFilter}
              setFraudFilter={setFraudFilter}
              onFreezeAccount={handleFreezeAccountFromAml}
              onInspectSlip={(tx) => {
                setSelectedTx(tx)
                setReceiptModalOpen(true)
              }}
              auditLogs={auditLogs}
              circuitBreakerActive={circuitBreakerActive}
              onOpenKillSwitch={() => setCircuitBreakerOpen(true)}
              isDarkMode={isDarkMode}
            />
          )}

          {navTab === 'admin-treasury' && (
            <AdminTreasuryDesk isDarkMode={isDarkMode} />
          )}

          {navTab === 'admin-api' && (
            <AdminApiDesk
              apiEndpoints={apiEndpoints}
              activeApiEndpoint={activeApiEndpoint}
              setActiveApiEndpoint={setActiveApiEndpoint}
              apiSimulating={apiSimulating}
              onTestEndpoint={handleTestApiEndpoint}
              copiedApiJson={copiedApiJson}
              onCopyJson={handleCopyApiJson}
              isDarkMode={isDarkMode}
            />
          )}

          {navTab === 'admin-ads' && (
            <AdminCampaignsDesk
              promoAds={promoAds}
              onToggleAd={handleToggleAd}
              onOpenCreateModal={() => setNewAdModalOpen(true)}
              isDarkMode={isDarkMode}
            />
          )}
        </main>

        {/* Shared Modals for Admin */}
        {circuitBreakerOpen && renderCircuitBreakerModal()}
        {rejectModalOpen && selectedApplicant && renderRejectModal()}
        {newAdModalOpen && renderNewAdModal()}
        {receiptModalOpen && selectedTx && renderReceiptModal()}
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0B0F19] text-white' : 'bg-[#F4F6F9] text-slate-900'} font-sans flex transition-colors duration-200`}>
      {/* ══════════════════════════════════════════════════════════════════════
          1. LEFT SIDEBAR (CITIZEN WALLET & DEV ADMIN ROLE CONSOLE)
         ══════════════════════════════════════════════════════════════════════ */}
      <aside className={`hidden lg:flex flex-col w-64 xl:w-72 border-r shrink-0 p-5 space-y-5 ${isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8500] p-1.5 shadow-md flex items-center justify-center shrink-0">
            <ArakanEmblem size={28} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-slate-950 dark:text-white">
                Péthar
              </span>
              <span className="text-xs font-bold text-[#FF6B00]">₳</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              {isDevAdminMode ? (ak ? 'အဆင့်မြင့် အုပ်ချုပ်ရေးဌာန' : 'Dev Admin Console') : (ak ? 'ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ်' : 'Digital Wallet')}
            </p>
          </div>
        </div>

        {/* Role Toggle Pill: Citizen Wallet <-> Dev Admin Console */}
        <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center text-xs font-bold">
          <button
            onClick={() => { setIsDevAdminMode(false); setNavTab('home'); }}
            className={`flex-1 py-1.5 rounded-xl transition text-center ${!isDevAdminMode
                ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
          >
            {ak ? 'သုံးစွဲသူ' : 'Citizen'}
          </button>
          <button
            onClick={() => { setIsDevAdminMode(true); setNavTab('admin-kyc'); }}
            className={`flex-1 py-1.5 rounded-xl transition text-center flex items-center justify-center gap-1 ${isDevAdminMode
                ? 'bg-[#FF6B00] text-white shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
          >
            <ShieldAlert size={12} />
            <span>{ak ? 'အုပ်ချုပ်သူ' : 'Dev Admin'}</span>
          </button>
        </div>

        {/* Pegged Currency Indicator */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-medium space-y-1">
          <div className="flex items-center justify-between font-mono font-bold">
            <span>1 ₳ = $1.00 USD</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-sans font-bold">1:1 PEG</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            100% USDT / USDC Collateralized
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 font-medium text-xs overflow-y-auto">
          {!isDevAdminMode ? (
            // ── CITIZEN WALLET TABS ──
            [
              { id: 'home', label: ak ? 'ပင်မ ခြုံငုံသုံးသပ်ချက်' : 'Wallet Overview', icon: LayoutGrid },
              { id: 'wallet', label: ak ? 'ပိုက်ဆံအိတ် ငွေစာရင်း' : 'My Accounts & Balances', icon: Wallet },
              { id: 'cards', label: ak ? 'ကတ်များ စီမံခန့်ခွဲမှု' : 'Cards Center', icon: CreditCard },
              { id: 'transactions', label: ak ? 'ငွေလွှဲ မှတ်တမ်းများ' : 'Transactions & Invoices', icon: History },
              { id: 'financial', label: ak ? 'ဘဏ္ဍာရေး စာရင်းများ' : 'Treasury & Analytics', icon: TrendingUp },
              { id: 'settings', label: ak ? 'လုံခြုံရေး & ဆက်တင်' : 'Security & Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon
              const isActive = navTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setNavTab(item.id as NavTabType)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${isActive
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8500] text-white font-bold shadow-md shadow-orange-500/20'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </div>
                </button>
              )
            })
          ) : (
            // ── DEV ADMIN ROLE TABS ──
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Admin Controls
              </div>
              {[
                { id: 'admin-kyc', label: ak ? 'KYC စိစစ်အတည်ပြုရေး' : 'Citizen KYC Control', icon: Users, badge: `${kycQueue.filter((k) => k.status === 'Pending').length}` },
                { id: 'admin-chat', label: ak ? 'ဖောက်သည် Chat စားပွဲ' : 'Customer Chat Desk', icon: MessageSquare, badge: 'Live' },
                { id: 'admin-ads', label: ak ? 'ကြော်ငြာများ စီမံခန့်ခွဲမှု' : 'Ads & Campaigns', icon: Sparkles },
                { id: 'admin-api', label: ak ? 'API ထိန်းချုပ်ရေးစနစ်' : 'Developer API Control', icon: Terminal },
                { id: 'admin-fraud', label: ak ? 'ငွေလွှဲ လိမ်လည်မှုစစ်ဆေး' : 'Fraud Detection & AML', icon: ShieldAlert, badge: 'AI' },
                { id: 'admin-users', label: ak ? 'နိုင်ငံသားများ စာရင်း' : 'Citizen Directory & CSV', icon: Users },
              ].map((item) => {
                const Icon = item.icon
                const isActive = navTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setNavTab(item.id as NavTabType)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${isActive
                        ? 'bg-[#FF6B00] text-white font-bold shadow-md shadow-orange-500/20'
                        : isDarkMode
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isActive ? 'bg-white/20 text-white' : 'bg-red-500/10 text-red-500'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </nav>

        {/* Emergency Kill-Switch Shortcut */}
        {isDevAdminMode && (
          <button
            onClick={() => setCircuitBreakerOpen(true)}
            className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer ${circuitBreakerActive
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/20'
              }`}
          >
            <AlertTriangle size={14} />
            <span>{circuitBreakerActive ? 'SETTLEMENT FROZEN' : 'Emergency Kill-Switch'}</span>
          </button>
        )}

        {/* User Mini Footer */}
        <div className={`pt-3 border-t flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-100'
          }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs truncate text-slate-900 dark:text-white">{profile.name}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{profile.petharId}</div>
            </div>
          </div>
          {onExit && (
            <button
              onClick={onExit}
              title="Exit to Main Site"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
            >
              <ExternalLink size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          2. MAIN WORKSPACE CONTENT
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Header */}
        <header className={`hidden lg:flex items-center justify-between px-8 py-3.5 border-b sticky top-0 z-30 backdrop-blur-md ${isDarkMode ? 'bg-[#111827]/90 border-slate-800' : 'bg-white/90 border-slate-200/80 shadow-2xs'
          }`}>
          {/* Status or Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={ak ? 'ရှာဖွေရန် (ငွေလွှဲ၊ ပြေစာအမှတ်၊ အမည်)...' : 'Search transactions, accounts, ref ID...'}
                className="w-full pl-10 pr-4 py-2 rounded-2xl text-xs font-medium border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
            {isDevAdminMode && (
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[11px] font-mono font-bold flex items-center gap-1.5">
                <ShieldAlert size={13} />
                <span>DEV ADMIN ROLE ACTIVE</span>
              </span>
            )}
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSendModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Send size={14} />
              <span>{ak ? 'ငွေလွှဲ' : 'Send'}</span>
            </button>

            <button
              onClick={() => setReceiveModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold transition border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95"
            >
              <QrCode size={14} />
              <span>{ak ? 'ငွေလက်ခံ QR' : 'Receive QR'}</span>
            </button>

            <button
              onClick={() => setIsDarkMode((v) => !v)}
              className="p-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {setLang && (
              <button
                onClick={() => setLang(ak ? 'en' : 'ak')}
                className="px-3 py-1.5 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white"
              >
                {ak ? 'AK' : 'EN'}
              </button>
            )}

            <button
              onClick={handleToggleAdminMode}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition ${isDevAdminMode
                  ? 'bg-red-500/10 text-red-600 border-red-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
            >
              {isDevAdminMode ? 'Exit Admin' : 'Admin Panel'}
            </button>
          </div>
        </header>

        {/* Mobile Top Header */}
        <div className="lg:hidden bg-gradient-to-r from-[#FF6B00] via-[#FA5A00] to-[#FF8500] text-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArakanEmblem size={24} />
              <span className="font-black text-sm">Péthar (ဖေ့သာ)</span>
            </div>
            <button
              onClick={handleToggleAdminMode}
              className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold"
            >
              {isDevAdminMode ? 'Admin Mode' : 'Citizen'}
            </button>
          </div>
        </div>

        {/* Emergency Circuit Breaker Active Alert Banner */}
        {circuitBreakerActive && (
          <div className="m-4 lg:m-8 mb-0 p-4 rounded-2xl bg-red-950 border-2 border-red-500 text-white flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-red-300">
                  CRITICAL: Emergency Circuit Breaker Engaged
                </div>
                <div className="text-xs text-red-200">
                  All ledger transfers across consensus nodes are paused for security review.
                </div>
              </div>
            </div>
            <button
              onClick={() => setCircuitBreakerOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition shrink-0"
            >
              Disengage
            </button>
          </div>
        )}

        {/* ── CONDITIONAL WORKSPACE BODY BASED ON TAB ── */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto pb-24">
          {/* ═════════════════════════════════════════════════════════════════
              VIEW A: CITIZEN WALLET OVERVIEW (When not in admin specific view)
             ═════════════════════════════════════════════════════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════
              VIEW A1: CITIZEN CARDS CENTER
             ═════════════════════════════════════════════════════════════════ */}
          {navTab === 'cards' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    <span>{ak ? 'Arakan UnionPay ဒစ်ဂျစ်တယ် ကတ်' : 'Péthar Digital Debit Card'}</span>
                  </h2>
                  <p className="text-xs text-slate-500">Manage virtual card controls, limits, and instant lock/freeze.</p>
                </div>
                <button
                  onClick={() => setCardLocked(!cardLocked)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${cardLocked
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  <ShieldAlert size={14} />
                  <span>{cardLocked ? 'Card Locked' : 'Lock Card'}</span>
                </button>
              </div>

              {/* Virtual Card Graphic */}
              <div className="max-w-md w-full p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-6 border border-indigo-500/30">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ArakanEmblem size={24} />
                    <span className="font-black text-xs tracking-wider">ARAKAN UNION</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-300">DEBIT</span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-mono">CARD NUMBER</div>
                  <div className="text-lg sm:text-xl font-mono tracking-widest font-black flex items-center justify-between">
                    <span>{cardDetailsVisible ? '4929 8812 0041 9918' : '•••• •••• •••• 9918'}</span>
                    <button
                      onClick={() => setCardDetailsVisible(!cardDetailsVisible)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      {cardDetailsVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-end text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-400">CARDHOLDER</div>
                    <div className="font-bold uppercase">{profile.name || 'ARAKAN CITIZEN'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">EXPIRES</div>
                    <div className="font-bold">12/29</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">CVV</div>
                    <div className="font-bold">{cardDetailsVisible ? '882' : '•••'}</div>
                  </div>
                </div>
              </div>

              {/* Card Security Settings */}
              <div className={`p-6 rounded-3xl border shadow-xs space-y-4 max-w-xl ${isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'}`}>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Security & Limit Controls</h3>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Online Transactions</div>
                    <div className="text-[11px] text-slate-400">Enable internet payments and e-commerce checkouts</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlinePaymentsEnabled}
                    onChange={(e) => setOnlinePaymentsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#FF6B00]"
                  />
                </div>

                <div className="space-y-2 py-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">Daily Online Spending Limit</span>
                    <span className="font-mono font-bold text-[#FF6B00]">₳ {internetLimit}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={internetLimit}
                    onChange={(e) => setInternetLimit(Number(e.target.value))}
                    className="w-full accent-[#FF6B00]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              VIEW A2: CITIZEN WALLET OVERVIEW (When not in admin / cards view)
             ═════════════════════════════════════════════════════════════════ */}
          {!navTab.startsWith('admin-') && navTab !== 'cards' && (
            <div className="space-y-6">
              {/* Dual-Wallet Architecture: Exactly Two Clean View Models */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Main AKD Database Wallet (Local Internal Digital Ledger) */}
                <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${isDarkMode
                    ? 'bg-gradient-to-br from-[#1C2533] via-[#151D28] to-[#0F1722] border-amber-500/30'
                    : 'bg-gradient-to-br from-white via-amber-50/20 to-white border-amber-500/20 shadow-md'
                  }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center font-bold">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {ak ? 'ပင်မ အာရက္ခ ပိုက်ဆံအိတ်' : 'Main AKD Database Wallet'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {ak ? 'တိုက်ရိုက် ဒစ်ဂျစ်တယ် စာရင်းအင်း' : 'Local Internal Digital Ledger · $0.00 Gas Fee'}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                      1 ₳ = $1.00 USD
                    </span>
                  </div>

                  <div className="py-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        {ak ? 'ရရှိနိုင်သော လက်ကျန်ငွေ' : 'Available Ledger Balance'}
                      </span>
                      <button
                        onClick={() => setBalanceVisible(!balanceVisible)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                      >
                        {balanceVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                    </div>
                    <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1.5">
                      <span className="text-2xl text-[#FF6B00]">₳</span>
                      <span>{balanceVisible ? walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '••••••'}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      <span>✓ 100% USDT Pegged (≈ ${walletBalance.toFixed(2)} USD)</span>
                    </div>
                  </div>

                  {/* Actions for Main AKD Database Wallet */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setSendModalOpen(true)}
                      className="w-full py-2.5 px-3 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Send size={14} />
                      <span>{ak ? 'ငွေလွှဲမည်' : 'Send P2P'}</span>
                    </button>
                    <button
                      onClick={() => setReceiveModalOpen(true)}
                      className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 active:scale-95 cursor-pointer"
                    >
                      <QrCode size={14} />
                      <span>{ak ? 'ငွေလက်ခံ QR' : 'Receive QR'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. USD Crypto Gateway Wallet (On-Chain Stablecoin Balances) */}
                <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${isDarkMode
                    ? 'bg-gradient-to-br from-[#1C2533] via-[#151D28] to-[#0F1722] border-cyan-500/30'
                    : 'bg-gradient-to-br from-white via-cyan-50/20 to-white border-cyan-500/20 shadow-md'
                  }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {ak ? 'USD ခရစ်ပတို ပိုက်ဆံအိတ်' : 'USD Crypto Gateway Wallet'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {ak ? 'ဘလော့ခ်ချိန်း ပိုင်ဆိုင်မှုများ' : 'On-Chain Stablecoin Balances · Web3 Gateway'}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                      USDT · USDC
                    </span>
                  </div>

                  <div className="py-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        {ak ? 'စုစုပေါင်း ခရစ်ပတို လက်ကျန်' : 'Total On-Chain Stablecoins'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        1:1 Swap Ready
                      </span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1.5">
                      <span className="text-2xl text-cyan-500">$</span>
                      <span>{balanceVisible ? walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '••••••'}</span>
                      <span className="text-xs text-slate-400 font-sans font-bold">USD</span>
                    </div>
                    <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <span>USDT: ${(walletBalance / 2).toFixed(2)}</span>
                      <span>·</span>
                      <span>USDC: ${(walletBalance / 2).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions for USD Crypto Gateway Wallet */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setTopUpModalOpen(true)}
                      className="w-full py-2.5 px-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <ArrowDownLeft size={14} />
                      <span>{ak ? 'ငွေသွင်းမည်' : 'Deposit USD'}</span>
                    </button>
                    <button
                      onClick={() => setTopUpModalOpen(true)}
                      className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 active:scale-95 cursor-pointer"
                    >
                      <Sparkles size={14} />
                      <span>{ak ? '1:1 လဲလှယ်မည်' : '1:1 Swap'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Services Tiles (Strictly Consumer Online P2P & Crypto Swaps) */}
              <div className={`p-6 rounded-3xl border shadow-xs space-y-4 ${isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'}`}>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  {ak ? 'ဝန်ဆောင်မှုများ & ငွေပေးချေမှု' : 'Payments & Financial Services'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {[
                    { label: ak ? 'P2P ငွေလွှဲ' : 'P2P Transfer', icon: Send, color: 'bg-purple-500/10 text-purple-600', action: () => setSendModalOpen(true) },
                    { label: ak ? 'ငွေလက်ခံ QR' : 'Receive QR', icon: QrCode, color: 'bg-emerald-500/10 text-emerald-600', action: () => setReceiveModalOpen(true) },
                    { label: ak ? '1:1 ငွေသွင်းလဲလှယ်' : 'Crypto Swap', icon: Sparkles, color: 'bg-amber-500/10 text-amber-600', action: () => setTopUpModalOpen(true) },
                    { label: ak ? 'ဒစ်ဂျစ်တယ်ကတ်' : 'Card Center', icon: CreditCard, color: 'bg-indigo-500/10 text-indigo-600', action: () => setNavTab('cards') },
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={s.action}
                      className={`p-3.5 rounded-2xl flex flex-col items-center gap-2 border transition hover:scale-105 active:scale-95 ${isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50 shadow-2xs'
                        }`}
                    >
                      <div className={`w-11 h-11 rounded-2xl ${s.color} flex items-center justify-center font-bold`}>
                        <s.icon size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Transactions List with Verified Slips */}
              <div className={`p-6 rounded-3xl border shadow-xs space-y-4 ${isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {ak ? 'လတ်တလော ငွေလွှဲ မှတ်တမ်းများ' : 'Recent Settled Transactions'}
                  </h3>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
                    {(['all', 'transfer', 'inflow', 'swap'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTxCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium capitalize transition cursor-pointer ${txCategoryFilter === cat
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => { setSelectedTx(tx); setReceiptModalOpen(true); }}
                      className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 px-3 rounded-2xl transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                          {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {ak ? tx.titleMm : tx.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {tx.counterparty} · {tx.time}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-black font-mono ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                          }`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} ₳
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Citizen View Shared Modals */}
      {sendModalOpen && renderSendModal()}
      {receiveModalOpen && renderReceiveModal()}
      {topUpModalOpen && renderTopUpModal()}
      {circuitBreakerOpen && renderCircuitBreakerModal()}
      {receiptModalOpen && selectedTx && renderReceiptModal()}
    </div>
  )
}

export default DashboardPage
