import React, { useState, useMemo, useEffect } from 'react'
import { ArakanEmblem } from '../components/ArakanEmblem'
import { TransactionSlip } from '../components/TransactionSlip'
import { ReceiveQRCard } from '../components/ReceiveQRCard'
import {
  LayoutGrid, Wallet, CreditCard, History, TrendingUp, Radio, Settings,
  ShieldCheck, Send, QrCode, Search, Sparkles,
  Eye, EyeOff, Check, Copy, AlertTriangle, ShieldAlert, Users,
  Plus, ExternalLink, X,
  ArrowUpRight, ArrowDownLeft,
  Sun, Moon, MessageSquare, Terminal, Play, Download
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

export type NavTabType =
  | 'home'
  | 'wallet'
  | 'cards'
  | 'transactions'
  | 'financial'
  | 'offline'
  | 'settings'
  // Dev Admin Role Tabs
  | 'admin-kyc'
  | 'admin-chat'
  | 'admin-ads'
  | 'admin-api'
  | 'admin-fraud'
  | 'admin-users'

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
  category: 'remittance' | 'cashback' | 'offline' | 'reserves'
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
      const stored = localStorage.getItem('pethar_dev_admin_mode')
      if (stored === 'true') return true
    }
    return initialTab?.startsWith('admin') || false
  })

  // Navigation Tab State
  const [navTab, setNavTab] = useState<NavTabType>(() => {
    if (initialTab === 'admin-kyc' || initialTab === 'kyc') return 'admin-kyc'
    if (initialTab === 'admin-chat' || initialTab === 'chat') return 'admin-chat'
    if (initialTab === 'admin-ads' || initialTab === 'ads') return 'admin-ads'
    if (initialTab === 'admin-api' || initialTab === 'api') return 'admin-api'
    if (initialTab === 'admin-fraud' || initialTab === 'fraud') return 'admin-fraud'
    if (initialTab === 'admin-users' || initialTab === 'users') return 'admin-users'
    if (initialTab === 'treasury' || initialTab === 'financial') return 'financial'
    if (initialTab === 'history' || initialTab === 'transactions') return 'transactions'
    if (initialTab === 'wallet') return 'wallet'
    if (initialTab === 'cards') return 'cards'
    if (initialTab === 'offline') return 'offline'
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
  const [txCategoryFilter, setTxCategoryFilter] = useState<'all' | 'transfer' | 'inflow' | 'merchant' | 'offline'>('all')
  const [monthlyInflow] = useState(3420.0)
  const [monthlyOutflow] = useState(1150.0)
  const [offlineBalance] = useState(250.0)

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
  const [offlineBeamModalOpen, setOfflineBeamModalOpen] = useState(false)

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
      occupation: 'Merchant Trader',
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
  const [userFilter, setUserFilter] = useState<'all' | 'ACTIVE' | 'SUSPENDED' | 'FROZEN'>('all')
  const [userSearch, setUserSearch] = useState('')

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
      } catch {}
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
        text: 'Greetings, I downloaded the new Android signed APK and offline BLE mesh is working great in Sittwe.',
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
        } catch {}
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
      titleEn: 'Arakan Merchant 5% Cashback',
      titleAk: 'ကုန်သည်ဆိုင်များတွင် ၅% ပြန်အမ်းငွေ',
      descEn: 'Earn 5% cashback at verified partner merchants',
      descAk: 'အတည်ပြုစတိုးဆိုင်များတွင် QR ဖြင့် ပေးချေပါ',
      gradient: 'from-slate-900 via-slate-800 to-emerald-900',
      accentBg: 'bg-emerald-500/20 text-emerald-400',
      active: true,
      impressions: 32100,
      clicks: 2150,
      category: 'cashback',
    },
    {
      id: 'ad-3',
      titleEn: 'Péthar Offline Bearer eCash',
      titleAk: 'အင်တာနက်မလိုဘဲ ငွေသားကဲ့သို့ ပေးချေခြင်း',
      descEn: 'NFC & soundwave offline tap-to-pay anywhere',
      descAk: 'အသံလှိုင်းနှင့် NFC ဖြင့် အင်တာနက်မဲ့ သုံးစွဲနိုင်သည်',
      gradient: 'from-indigo-950 via-slate-900 to-slate-800',
      accentBg: 'bg-indigo-500/20 text-indigo-400',
      active: true,
      impressions: 21050,
      clicks: 1420,
      category: 'offline',
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
      id: 'escrow',
      method: 'POST',
      path: '/v1/escrow/create',
      category: 'Escrow',
      description: 'Lock fiat collateral into an immutable 2-of-3 multisig smart escrow contract.',
      requestBody: JSON.stringify({ buyer_id: 'akd_buyer', seller_id: 'akd_seller', collateral_amount: 50.0, timelock_hours: 72 }, null, 2),
      responseBody: JSON.stringify({ escrow_id: 'esc_88201a4f', state: 'funded_locked', timelock_expires_in: 72 }, null, 2),
      latency: '36ms',
    },
    {
      id: 'mesh',
      method: 'POST',
      path: '/v1/mesh/relay',
      category: 'Offline Mesh',
      description: 'Ingest store-and-forward BLE/NFC transaction packets signed during telecom blackouts.',
      requestBody: JSON.stringify({ raw_packet: 'base64_packet_pulse...', mesh_hop_count: 3 }, null, 2),
      responseBody: JSON.stringify({ status: 'reconciled', reconciled_transactions: 14, conflict: false }, null, 2),
      latency: '45ms',
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
      if (txCategoryFilter === 'merchant') return tx.category === 'pos'
      if (txCategoryFilter === 'offline') return tx.counterparty.toLowerCase().includes('offline')
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
    } catch {}
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
    } catch {}
    if (next) {
      setNavTab('admin-kyc')
    } else {
      setNavTab('home')
    }
  }

  void theme
  void setTheme

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0B0F19] text-white' : 'bg-[#F4F6F9] text-slate-900'} font-sans flex transition-colors duration-200`}>
      {/* ══════════════════════════════════════════════════════════════════════
          1. LEFT SIDEBAR (CITIZEN WALLET & DEV ADMIN ROLE CONSOLE)
         ══════════════════════════════════════════════════════════════════════ */}
      <aside className={`hidden lg:flex flex-col w-64 xl:w-72 border-r shrink-0 p-5 space-y-5 ${
        isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
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
            className={`flex-1 py-1.5 rounded-xl transition text-center ${
              !isDevAdminMode
                ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {ak ? 'သုံးစွဲသူ' : 'Citizen'}
          </button>
          <button
            onClick={() => { setIsDevAdminMode(true); setNavTab('admin-kyc'); }}
            className={`flex-1 py-1.5 rounded-xl transition text-center flex items-center justify-center gap-1 ${
              isDevAdminMode
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
              { id: 'offline', label: ak ? 'အော့ဖ်လိုင်း ကွန်ရက်' : 'Offline Bearer Mesh', icon: Radio, badge: 'BLE' },
              { id: 'settings', label: ak ? 'လုံခြုံရေး & ဆက်တင်' : 'Security & Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon
              const isActive = navTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setNavTab(item.id as NavTabType)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                    isActive
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
                  {item.badge && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500">
                      {item.badge}
                    </span>
                  )}
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
                { id: 'admin-kyc', label: ak ? 'KYC စိစစ်အတည်ပြုရေး' : 'Citizen KYC Control', icon: UserCheckIcon, badge: `${kycQueue.filter((k) => k.status === 'Pending').length}` },
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
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                      isActive
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
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive ? 'bg-white/20 text-white' : 'bg-red-500/10 text-red-500'
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
            className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              circuitBreakerActive
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/20'
            }`}
          >
            <AlertTriangle size={14} />
            <span>{circuitBreakerActive ? 'SETTLEMENT FROZEN' : 'Emergency Kill-Switch'}</span>
          </button>
        )}

        {/* User Mini Footer */}
        <div className={`pt-3 border-t flex items-center justify-between ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
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
        <header className={`hidden lg:flex items-center justify-between px-8 py-3.5 border-b sticky top-0 z-30 backdrop-blur-md ${
          isDarkMode ? 'bg-[#111827]/90 border-slate-800' : 'bg-white/90 border-slate-200/80 shadow-2xs'
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
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition ${
                isDevAdminMode
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
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                    cardLocked
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
              {/* 4 Metric KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Liquid Net Worth */}
                <div className={`p-5 rounded-3xl border shadow-xs space-y-2.5 ${isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{ak ? 'စုစုပေါင်း လက်ကျန်ငွေ' : 'Total Net Worth'}</span>
                    <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-slate-400 hover:text-slate-600">
                      {balanceVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1">
                    <span className="text-xl text-[#FF6B00]">₳</span>
                    <span>{balanceVisible ? walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '••••••'}</span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    100% USDT Pegged (≈ ${walletBalance.toFixed(2)} USD)
                  </div>
                </div>

                {/* Monthly Inflow */}
                <div className={`p-5 rounded-3xl border shadow-xs space-y-2.5 ${isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{ak ? 'လစဉ် ဝင်ငွေ' : 'Monthly Inflow'}</span>
                    <ArrowDownLeft size={16} className="text-emerald-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    +₳ {monthlyInflow.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-400">14 transfers settled</div>
                </div>

                {/* Monthly Outflow */}
                <div className={`p-5 rounded-3xl border shadow-xs space-y-2.5 ${isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{ak ? 'လစဉ် သုံးစွဲမှု' : 'Monthly Outflow'}</span>
                    <ArrowUpRight size={16} className="text-rose-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                    -₳ {monthlyOutflow.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-400">Zero hidden fees</div>
                </div>

                {/* Offline Bearer Reserves */}
                <div className={`p-5 rounded-3xl border shadow-xs space-y-2.5 ${isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{ak ? 'အော့ဖ်လိုင်း တိုကင်များ' : 'Offline Bearer Tokens'}</span>
                    <Radio size={16} className="text-amber-500 animate-pulse" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                    ₳ {offlineBalance.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-emerald-500 font-mono font-bold">BLE Mesh Tap Ready</div>
                </div>
              </div>

              {/* Quick Services Tiles */}
              <div className={`p-6 rounded-3xl border shadow-xs space-y-4 ${isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'}`}>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  {ak ? 'ဝန်ဆောင်မှုများ & ငွေပေးချေမှု' : 'Payments & Financial Services'}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
                  {[
                    { label: ak ? 'ငွေလွှဲ' : 'Transfer', icon: Send, color: 'bg-purple-500/10 text-purple-600', action: () => setSendModalOpen(true) },
                    { label: ak ? 'ငွေလက်ခံ' : 'Receive QR', icon: QrCode, color: 'bg-emerald-500/10 text-emerald-600', action: () => setReceiveModalOpen(true) },
                    { label: ak ? 'ငွေသွင်း' : 'Top Up', icon: Sparkles, color: 'bg-amber-500/10 text-amber-600', action: () => setTopUpModalOpen(true) },
                    { label: ak ? 'အော့ဖ်လိုင်း' : 'BLE Tap', icon: Radio, color: 'bg-cyan-500/10 text-cyan-600', action: () => setOfflineBeamModalOpen(true) },
                    { label: ak ? 'ကတ်များ' : 'Card Center', icon: CreditCard, color: 'bg-indigo-500/10 text-indigo-600', action: () => setNavTab('cards') },
                    { label: ak ? 'အကူအညီ' : 'Support Desk', icon: MessageSquare, color: 'bg-rose-500/10 text-rose-600', action: () => window.location.href = '/support' },
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={s.action}
                      className={`p-3.5 rounded-2xl flex flex-col items-center gap-2 border transition hover:scale-105 active:scale-95 ${
                        isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50 shadow-2xs'
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
                    {(['all', 'transfer', 'inflow', 'merchant', 'offline'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTxCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium capitalize transition cursor-pointer ${
                          txCategoryFilter === cat
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
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
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
                        <div className={`text-sm font-black font-mono ${
                          tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
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

          {/* ═════════════════════════════════════════════════════════════════
              VIEW B1: DEV ADMIN ROLE - KYC CONTROL
             ═════════════════════════════════════════════════════════════════ */}
          {navTab === 'admin-kyc' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheckIcon className="w-5 h-5 text-[#FF6B00]" />
                    <span>{ak ? 'နိုင်ငံသား Tier-2 KYC စိစစ်အတည်ပြုရေးဌာန' : 'Citizen Tier-2 KYC Verification Hub'}</span>
                  </h2>
                  <p className="text-xs text-slate-500">Review National ID card documents, face match scores, and elevate citizens.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">
                    Pending: {kycQueue.filter((k) => k.status === 'Pending').length}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                    Approved: {kycQueue.filter((k) => k.status === 'Approved').length}
                  </span>
                </div>
              </div>

              {/* Applicants Table */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {kycQueue.map((applicant) => (
                    <div key={applicant.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                          {applicant.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">{applicant.name}</span>
                            <span className="text-xs text-slate-400 font-mono">({applicant.nameMm})</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              applicant.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' :
                              applicant.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600' :
                              'bg-amber-500/10 text-amber-600'
                            }`}>
                              {applicant.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            NRIC: {applicant.idCard} · Township: {applicant.township} · Face Match: {applicant.faceMatchScore}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {applicant.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveKyc(applicant)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                            >
                              <Check size={14} />
                              <span>{ak ? 'အတည်ပြုမည်' : 'Approve'}</span>
                            </button>
                            <button
                              onClick={() => { setSelectedApplicant(applicant); setRejectModalOpen(true); }}
                              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                            >
                              <X size={14} />
                              <span>{ak ? 'ပယ်ချမည်' : 'Reject'}</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-mono text-slate-400">Processed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              VIEW B2: DEV ADMIN ROLE - CUSTOMER CHAT DESK (OPERATOR DESK)
             ═════════════════════════════════════════════════════════════════ */}
          {navTab === 'admin-chat' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#FF6B00]" />
                    <span>{ak ? 'ဖောက်သည် စကားပြောခန်း အော်ပရေတာ စားပွဲ' : 'Customer Chat Support Operator Console'}</span>
                  </h2>
                  <p className="text-xs text-slate-500">Live dual-rail operator desk connected to Mobile Wallet Chat Support and Android App Chat Support.</p>
                </div>

                {/* Channel Filter */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono">
                  {(['all', 'mobilewallet', 'android'] as const).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setOperatorChannelFilter(ch)}
                      className={`px-3 py-1 rounded-lg capitalize transition ${
                        operatorChannelFilter === ch ? 'bg-[#FF6B00] text-white font-bold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {ch === 'all' ? 'All Rails' : ch === 'mobilewallet' ? 'Mobile Wallet' : 'Android App'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Thread Interface */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl">
                <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black">Operator Dispatch Desk (Duty Officer: ROOT-01)</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Listening on {operatorChannelFilter} channel rail</p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    CONNECTED
                  </span>
                </div>

                {/* Chat Log */}
                <div className="p-5 space-y-3.5 min-h-[320px] max-h-[440px] overflow-y-auto bg-slate-50/60 dark:bg-slate-950/40">
                  {customerMessages
                    .filter((m) => operatorChannelFilter === 'all' || m.channel === operatorChannelFilter)
                    .map((msg) => {
                      const isOp = msg.sender === 'operator'
                      return (
                        <div key={msg.id} className={`flex ${isOp ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-md p-4 rounded-2xl text-xs space-y-1 shadow-xs ${
                            isOp
                              ? 'bg-[#FF6B00] text-white rounded-br-xs font-medium'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                          }`}>
                            <div className="flex items-center justify-between text-[10px] opacity-75 font-mono">
                              <span>{isOp ? 'Operator (You)' : `Customer [${msg.channel}]`}</span>
                              <span>{msg.time}</span>
                            </div>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      )
                    })}
                </div>

                {/* Operator Canned Quick Replies */}
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap gap-2 text-[11px]">
                  <button
                    onClick={() => handleSendOperatorReply('Your transaction hash is verified on the Arakan ledger.')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono"
                  >
                    + Confirm Ledger Hash
                  </button>
                  <button
                    onClick={() => handleSendOperatorReply('Please submit your Tier-2 National ID for review.')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono"
                  >
                    + Request KYC Document
                  </button>
                  <button
                    onClick={() => handleSendOperatorReply('Your issue has been resolved successfully by our operator.')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono"
                  >
                    + Issue Resolved
                  </button>
                </div>

                {/* Reply Input Bar */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <input
                    type="text"
                    value={operatorReplyText}
                    onChange={(e) => setOperatorReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOperatorReply()}
                    placeholder="Type official operator response to customer..."
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                  <button
                    onClick={() => handleSendOperatorReply()}
                    className="px-5 py-3 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Send size={15} />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              VIEW B3: DEV ADMIN ROLE - ADS & CAMPAIGNS CONTROL
             ═════════════════════════════════════════════════════════════════ */}
          {navTab === 'admin-ads' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>{ak ? 'ကြော်ငြာများ & အရောင်းမြှင့်တင်ရေး စီမံခန့်ခွဲမှု' : 'Ads & Promotions Control'}</span>
                  </h2>
                  <p className="text-xs text-slate-500">Configure promotional spotlight banners and partner campaigns shown to customers.</p>
                </div>
                <button
                  onClick={() => setNewAdModalOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Create Campaign</span>
                </button>
              </div>

              {/* Ads Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-slate-500">Total Active Campaigns</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {promoAds.filter((a) => a.active).length} / {promoAds.length}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-slate-500">Total Customer Impressions</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {promoAds.reduce((acc, a) => acc + a.impressions, 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-slate-500">Average Click-Through (CTR)</span>
                  <div className="text-2xl font-black text-emerald-500 font-mono">6.8%</div>
                </div>
              </div>

              {/* Campaigns Table */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
                {promoAds.map((ad) => (
                  <div key={ad.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">{ad.titleEn}</span>
                        <span className="text-xs text-slate-400 font-mono">({ad.titleAk})</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ad.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {ad.active ? 'ACTIVE' : 'PAUSED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{ad.descEn}</p>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Impressions: {ad.impressions.toLocaleString()} · Clicks: {ad.clicks.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleAd(ad.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                          ad.active ? 'bg-amber-500/15 text-amber-600 hover:bg-amber-500/25' : 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25'
                        }`}
                      >
                        {ad.active ? 'Pause Campaign' : 'Activate Ad'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              VIEW B4: DEV ADMIN ROLE - API CONTROL CENTER
             ═════════════════════════════════════════════════════════════════ */}
          {navTab === 'admin-api' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#FF6B00]" />
                    <span>{ak ? 'အဆင့်မြင့် REST API ထိန်းချုပ်ရေးစနစ်' : 'Developer API & Gateway Control'}</span>
                  </h2>
                  <p className="text-xs text-slate-500">Live API inspection, request body simulation, and rate limit quotas.</p>
                </div>
                <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                  99.995% Uptime SLA · 1,000 req/s Quota
                </div>
              </div>

              {/* API Endpoints & Interactive Playground */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 space-y-2">
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Core Endpoints
                  </div>
                  {apiEndpoints.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => setActiveApiEndpoint(ep)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition ${
                        activeApiEndpoint.id === ep.id
                          ? 'bg-white dark:bg-slate-800 border-[#FF6B00] shadow-xs'
                          : 'bg-white/80 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                          ep.method === 'POST' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {ep.method}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{ep.path}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{ep.description}</p>
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-8 rounded-3xl bg-slate-950 text-slate-200 border border-slate-800 shadow-2xl overflow-hidden">
                  <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">
                      https://api.pethar.co.uk{activeApiEndpoint.path}
                    </span>
                    <button
                      onClick={() => {
                        setApiSimulating(true)
                        setTimeout(() => setApiSimulating(false), 400)
                      }}
                      className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold font-mono transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Play size={13} />
                      <span>{apiSimulating ? 'Executing...' : 'Test Endpoint'}</span>
                    </button>
                  </div>

                  {activeApiEndpoint.requestBody && (
                    <div className="p-4 border-b border-slate-800 font-mono text-xs">
                      <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">Request JSON Payload</div>
                      <pre className="text-slate-300 p-3 rounded-xl bg-slate-900/60 overflow-x-auto text-[11px]">
                        {activeApiEndpoint.requestBody}
                      </pre>
                    </div>
                  )}

                  <div className="p-4 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between text-emerald-400">
                      <span className="text-[10px] font-bold uppercase">Response Payload (200 OK • {activeApiEndpoint.latency})</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activeApiEndpoint.responseBody)
                          setCopiedApiJson(true)
                          setTimeout(() => setCopiedApiJson(false), 2000)
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedApiJson ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <pre className="text-emerald-400 p-3 rounded-xl bg-slate-900/80 overflow-x-auto text-[11px]">
                      {activeApiEndpoint.responseBody}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              VIEW B5: DEV ADMIN ROLE - FRAUD DETECTION & AML MONITORING
             ═════════════════════════════════════════════════════════════════ */}
          {navTab === 'admin-fraud' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <span>{ak ? 'ငွေလွှဲ လိမ်လည်မှု စစ်ဆေးရေးနှင့် AML စနစ်' : 'Real-Time Fraud Detection & AML Monitor'}</span>
                  </h2>
                  <p className="text-xs text-slate-500">Automated heuristic fraud risk scoring, velocity checks, and wallet restriction controls.</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono">
                    {(['all', 'flagged', 'clean'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFraudFilter(f)}
                        className={`px-3 py-1 rounded-lg capitalize transition ${
                          fraudFilter === f ? 'bg-red-600 text-white font-bold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {f === 'all' ? 'All Transactions' : f === 'flagged' ? 'Suspicious Flagged' : 'Normal / Low Risk'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transactions Fraud Table */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFraudTxs.map((tx) => (
                  <div key={tx.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs ${
                        tx.risk === 'High' ? 'bg-red-500/15 text-red-600' :
                        tx.risk === 'Medium' ? 'bg-amber-500/15 text-amber-600' :
                        'bg-emerald-500/15 text-emerald-600'
                      }`}>
                        {tx.risk === 'High' ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">{tx.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tx.risk === 'High' ? 'bg-red-500/20 text-red-600 animate-pulse font-mono' :
                            tx.risk === 'Medium' ? 'bg-amber-500/20 text-amber-600 font-mono' :
                            'bg-emerald-500/10 text-emerald-600 font-mono'
                          }`}>
                            Risk: {tx.risk}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          Ref: {tx.refId} · Counterparty: {tx.counterparty} · Amount: {tx.amount} ₳
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Trigger Reason: <span className="font-mono text-slate-600 dark:text-slate-300">{tx.flagReason}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {tx.risk === 'High' && (
                        <button
                          onClick={async () => {
                            await updateUserStatusInDb(tx.counterparty, 'FROZEN', 'Automated fraud risk flag hold')
                            alert(`Security Hold placed on ${tx.counterparty}. Account frozen.`)
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          Freeze Account
                        </button>
                      )}
                      <button
                        onClick={() => { setSelectedTx(tx); setReceiptModalOpen(true); }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition hover:bg-slate-200"
                      >
                        Inspect Slip
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* System Audit Trail */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <History size={16} className="text-slate-400" />
                    <span>Real-Time Operator Audit Trail</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{auditLogs.length} events logged</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">[{log.timestamp}] {log.action}:</span>{' '}
                        <span className="text-slate-500">{log.details}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              VIEW B6: DEV ADMIN ROLE - CITIZEN USERS DIRECTORY & CSV EXPORTS
             ═════════════════════════════════════════════════════════════════ */}
          {navTab === 'admin-users' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#FF6B00]" />
                    <span>{ak ? 'နိုင်ငံသား သုံးစွဲသူများ စာရင်းနှင့် ထိန်းချုပ်မှု' : 'Citizen Directory & Controls'}</span>
                  </h2>
                  <p className="text-xs text-slate-500">Manage registered citizen accounts, adjust transfer limits, and export CSV files.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const csv = 'UID,Name,Phone,AKD_Balance,USD_Balance,Status\n' + usersList.map((u) => `${u.uid},${u.name},${u.phone},${u.akdBalance},${u.usdBalance},${u.status}`).join('\n')
                      const blob = new Blob([csv], { type: 'text/csv' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `pethar-citizens-${new Date().toISOString().slice(0, 10)}.csv`
                      a.click()
                    }}
                    className="px-4 py-2 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold font-mono transition flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search citizen by name, phone or UID..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono">
                  {(['all', 'ACTIVE', 'SUSPENDED', 'FROZEN'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setUserFilter(st)}
                      className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer ${
                        userFilter === st ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {st.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Directory Table */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
                {usersList
                  .filter((u) => {
                    const matchFilter = userFilter === 'all' || u.status === userFilter
                    const q = userSearch.toLowerCase()
                    const matchSearch =
                      u.name.toLowerCase().includes(q) ||
                      (u.phone && u.phone.includes(q)) ||
                      u.uid.toLowerCase().includes(q)
                    return matchFilter && matchSearch
                  })
                  .slice(0, 15)
                  .map((user) => (
                  <div key={user.uid} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">{user.name}</span>
                          <span className="text-xs text-slate-400 font-mono">{user.username}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            Tier {user.kycTier}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          UID: {user.uid} · Phone: {user.phone || 'N/A'} · Balance: ₳ {user.akdBalance.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const next = user.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN'
                          await updateUserStatusInDb(user.uid, next, 'Operator toggle')
                          setUsersList((prev) => prev.map((u) => (u.uid === user.uid ? { ...u, status: next } : u)))
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          user.status === 'FROZEN' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-red-500/15 text-red-600'
                        }`}
                      >
                        {user.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: SEND MONEY MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">{ak ? 'ငွေလွှဲပို့မည်' : 'Send Money'}</h3>
              <button onClick={() => setSendModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
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
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: RECEIVE QR MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {receiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <ReceiveQRCard
            lang={lang}
            name={profile.name}
            petharId={profile.petharId}
            onClose={() => setReceiveModalOpen(false)}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3: TOP UP MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {topUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">{ak ? 'ငွေသွင်းမည် (USDT/USDC)' : 'Top Up (USDT / USDC)'}</h3>
              <button onClick={() => setTopUpModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
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
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        topUpAsset === a ? 'bg-[#FF6B00] text-white border-[#FF6B00]' : 'bg-slate-50 text-slate-700 border-slate-200'
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
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 4: EMERGENCY CIRCUIT BREAKER PIN OVERRIDE
         ══════════════════════════════════════════════════════════════════════ */}
      {circuitBreakerOpen && (
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
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleCircuitBreaker}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg"
              >
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 5: OFFLINE BLE MESH BEAM MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {offlineBeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-slate-950 border border-cyan-500/40 text-white shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/30">
              <Radio size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base">BLE Mesh Tap & Pay</h3>
              <p className="text-xs text-slate-400 mt-1">
                Holding offline reserves of ₳ {offlineBalance.toFixed(2)}. Bring device close to another Péthar terminal to transfer bearer tokens.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
              Broadcasting encrypted offline mesh signal...
            </div>
            <button
              onClick={() => setOfflineBeamModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 6: REJECT KYC VERIFICATION MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {rejectModalOpen && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">Reject KYC Application</h3>
              <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
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
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
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
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 7: CREATE PROMOTIONAL CAMPAIGN MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {newAdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">Create New Promotional Campaign</h3>
              <button onClick={() => setNewAdModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
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
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
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
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 8: VERIFIED TRANSACTION RECEIPT SLIP
         ══════════════════════════════════════════════════════════════════════ */}
      {receiptModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <TransactionSlip
              refId={selectedTx.refId}
              amount={Math.abs(selectedTx.amount)}
              recipientName={selectedTx.counterparty}
              recipientId={selectedTx.counterpartyMm}
              senderName={profile.name || 'Citizen'}
              senderId={profile.petharId}
              fee={selectedTx.fee || 0}
              timestamp={selectedTx.time}
              lang={lang}
              onClose={() => { setReceiptModalOpen(false); setSelectedTx(null); }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function UserCheckIcon(props: any) {
  return <Users {...props} />
}

export default DashboardPage
