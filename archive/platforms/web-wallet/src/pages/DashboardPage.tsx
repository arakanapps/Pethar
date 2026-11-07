import React, { useState, useMemo, useEffect } from 'react'
import { ArakanEmblem } from '../components/ArakanEmblem'
import { TransactionSlip } from '../components/TransactionSlip'
import { ReceiveQRCard } from '../components/ReceiveQRCard'
import {
  LayoutGrid, Wallet, CreditCard, History, TrendingUp, Settings,
  Send, QrCode, Search, Sparkles,
  Eye, EyeOff, ShieldAlert,
  ExternalLink,
  ArrowUpRight, ArrowDownLeft,
  Sun, Moon
} from 'lucide-react'
import { initialUserProfile, type UserProfile, type Txn } from '../data'
import {
  fetchTransactionsFromDb,
  insertTransactionToDb,
  fetchUserProfileFromDb,
  updateUserBalanceInDb,
  subscribeToTransactions,
} from '../services/walletDatabase'
import type { Language } from '../i18n'
import { auth } from '../lib/firebase'
import { AdminNavBar } from '../components/admin/AdminNavBar'
import { AdminOverviewDesk } from '../components/admin/AdminOverviewDesk'
import { AdminKycDesk } from '../components/admin/AdminKycDesk'
import { AdminApprovalsDesk } from '../components/admin/AdminApprovalsDesk'
import { AdminTreasuryDesk } from '../components/admin/AdminTreasuryDesk'
import { AdminSecurityAml } from '../components/admin/AdminSecurityAml'
import { fetchAdminSnapshot, reviewAdminApproval, adminUpdateKyc, adminUpdateKycProfile, adminFreezeUser, type AdminUserRow, type AdminTransactionRow, type AdminApprovalRow } from '../services/adminDatabase'

export type NavTabType =
  | 'home'
  | 'wallet'
  | 'cards'
  | 'transactions'
  | 'financial'
  | 'settings'
  // Admin tabs
  | 'admin-overview'
  | 'admin-kyc'
  | 'admin-approvals'
  | 'admin-fraud'
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
  userId: string
  name: string
  email: string
  phone: string
  uid: string
  nationalIdNo: string
  address: string
  dob: string
  createdAt: string
  status: 'Pending' | 'Verified' | 'Rejected' | 'Unverified'
  kycTier: 1 | 2
  balance: number
  usdBalance: number
  rejectionReason?: string
  nricFrontUrl?: string
  nricBackUrl?: string
  selfieUrl?: string
  addressHouseNo?: string
  addressStreet?: string
  addressWard?: string
  addressSubDistrict?: string
  addressDistrict?: string
  addressProvince?: string
  addressCountry?: string
  addressPostalCode?: string
  kycSubmittedAt?: string
  kycReviewedAt?: string
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
  const [isDevAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const tabParam = searchParams.get('tab')
      if (tabParam?.startsWith('admin')) return true
      if (tabParam === 'chat' || tabParam === 'support' || tabParam === 'kyc' || tabParam === 'fraud' || tabParam === 'api' || tabParam === 'ads' || tabParam === 'treasury-admin') return true
      if (window.location.pathname.includes('/admin') || window.location.pathname.includes('/support') || window.location.pathname.includes('/chat')) return true
    }
    return initialTab?.startsWith('admin') || initialTab === 'chat' || initialTab === 'support' || false
  })

  // Navigation Tab State
  const [navTab, setNavTab] = useState<NavTabType>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const tabParam = searchParams.get('tab')
      if (tabParam === 'admin-kyc' || tabParam === 'kyc') return 'admin-kyc'
      if (tabParam === 'admin-approvals' || tabParam === 'approvals') return 'admin-approvals'
      if (tabParam === 'admin-fraud' || tabParam === 'transactions') return 'admin-fraud'
      if (tabParam === 'admin-treasury' || tabParam === 'treasury-admin') return 'admin-treasury'
      if (tabParam === 'admin-overview' || tabParam === 'overview') return 'admin-overview'
      if (window.location.pathname.includes('/admin')) return 'admin-overview'
    }
    if (initialTab === 'admin-overview') return 'admin-overview'
    if (initialTab === 'admin-kyc' || initialTab === 'kyc') return 'admin-kyc'
    if (initialTab === 'admin-approvals' || initialTab === 'approvals') return 'admin-approvals'
    if (initialTab === 'admin-fraud' || initialTab === 'transactions') return 'admin-fraud'
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
  // ADMIN LIVE DATA (Supabase)
  // ════════════════════════════════════════════════════════════════════════
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>([])
  const [adminTransactions, setAdminTransactions] = useState<AdminTransactionRow[]>([])
  const [adminApprovals, setAdminApprovals] = useState<AdminApprovalRow[]>([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [adminRefreshKey, setAdminRefreshKey] = useState(0)

  const [selectedApplicant, setSelectedApplicant] = useState<KycApplicant | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedRejectReason, setSelectedRejectReason] = useState('Identity document could not be verified')
  const [customRejectNote, setCustomRejectNote] = useState('')

  const [fraudFilter, setFraudFilter] = useState<'all' | 'flagged' | 'clean'>('all')

  const loadAdminData = async () => {
    setAdminLoading(true)
    setAdminError('')
    try {
      const snapshot = await fetchAdminSnapshot()
      setAdminUsers(snapshot.users)
      setAdminTransactions(snapshot.transactions)
      setAdminApprovals(snapshot.approvals)
      if (snapshot.users.length === 0 && snapshot.transactions.length === 0 && snapshot.approvals.length === 0) {
        setAdminError('No records were returned. Set SUPABASE_SERVICE_ROLE_KEY in .env to allow the admin console to read all database tables.')
      }
    } catch (error: any) {
      setAdminError(error?.message || 'Unable to load admin data.')
    } finally {
      setAdminLoading(false)
    }
  }

  useEffect(() => {
    if (isDevAdminMode) void loadAdminData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDevAdminMode, adminRefreshKey])

  const kycApplicants = useMemo<KycApplicant[]>(() => {
    return adminUsers
      .filter((user) => {
        const status = user.kycStatus
        return (
          status === 'pending_review' ||
          status === 'rejected' ||
          status === 'verified' ||
          (!!user.nationalIdNo && user.kycTier < 2)
        )
      })
      .map((user) => {
        const status: KycApplicant['status'] =
          user.kycStatus === 'verified' || user.kycTier === 2
            ? 'Verified'
            : user.kycStatus === 'rejected'
              ? 'Rejected'
              : user.kycStatus === 'pending_review' || user.nationalIdNo
                ? 'Pending'
                : 'Unverified'
        return {
          id: `KYC-${user.uid}`,
          userId: user.userId || user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          uid: user.uid,
          nationalIdNo: user.nationalIdNo,
          address: user.address,
          dob: user.dob,
          createdAt: user.createdAt,
          status,
          kycTier: user.kycTier,
          balance: user.balance,
          usdBalance: user.usdBalance,
          rejectionReason: user.rejectionReason,
          nricFrontUrl: user.nricFrontUrl,
          nricBackUrl: user.nricBackUrl,
          selfieUrl: user.selfieUrl,
          addressHouseNo: user.addressHouseNo,
          addressStreet: user.addressStreet,
          addressWard: user.addressWard,
          addressSubDistrict: user.addressSubDistrict,
          addressDistrict: user.addressDistrict,
          addressProvince: user.addressProvince,
          addressCountry: user.addressCountry,
          addressPostalCode: user.addressPostalCode,
          kycSubmittedAt: user.kycSubmittedAt,
          kycReviewedAt: user.kycReviewedAt,
        }
      })
  }, [adminUsers])

  const scoredAdminTransactions = useMemo(() => adminTransactions, [adminTransactions])

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

  // Admin: approve KYC in the database
  const handleApproveKyc = async (applicant: KycApplicant) => {
    await adminUpdateKyc(applicant.uid, 'verified', 2)
    setSelectedApplicant(null)
    setAdminRefreshKey((key) => key + 1)
  }

  // Admin: reject KYC in the database
  const handleConfirmRejectKyc = async () => {
    if (!selectedApplicant) return
    const reason = customRejectNote
      ? `${selectedRejectReason} (${customRejectNote})`
      : selectedRejectReason
    await adminUpdateKyc(selectedApplicant.uid, 'rejected', 1, reason)
    setRejectModalOpen(false)
    setSelectedApplicant(null)
    setCustomRejectNote('')
    setAdminRefreshKey((key) => key + 1)
  }

  // Admin: save edited identity and address fields
  const handleSaveKycProfile = async (applicant: KycApplicant, fields: Parameters<typeof adminUpdateKycProfile>[1]) => {
    await adminUpdateKycProfile(applicant.uid, fields)
    setAdminRefreshKey((key) => key + 1)
  }

  // Admin: resolve a pending approval and optionally mirror KYC changes
  const handleReviewApproval = async (
    approval: AdminApprovalRow,
    status: 'APPROVED' | 'REJECTED',
  ) => {
    await reviewAdminApproval(approval.id, status, `Reviewed by administrator`)
    if (approval.type === 'KYC_UPGRADE') {
      const user = adminUsers.find((item) => item.id === approval.userId || item.userId === approval.userId)
      if (user) {
        await adminUpdateKyc(
          user.uid,
          status === 'APPROVED' ? 'verified' : 'rejected',
          status === 'APPROVED' ? 2 : 1,
          status === 'REJECTED' ? 'Approval rejected by administrator' : undefined,
        )
      }
    }
    setAdminRefreshKey((key) => key + 1)
  }

  // Admin: freeze the account linked to a transaction
  const handleFreezeAccountFromAml = async (tx: AdminTransactionRow) => {
    const user = adminUsers.find(
      (item) => item.userId === tx.userId || item.id === tx.userId || item.uid === tx.counterparty,
    )
    if (!user) {
      setAdminError('Unable to resolve the account linked to this transaction.')
      return
    }
    await adminFreezeUser(user.uid, 'FROZEN', 'Flagged from transaction monitoring')
    setAdminRefreshKey((key) => key + 1)
  }

  const handleInspectAdminTransaction = (tx: AdminTransactionRow) => {
    setSelectedTx({
      id: tx.id,
      refId: tx.refId,
      title: tx.title,
      titleMm: '',
      category: tx.category,
      amount: tx.amount,
      currency: tx.currency,
      time: tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—',
      status: tx.status as Txn['status'],
      counterparty: tx.counterparty,
      counterpartyMm: '',
      fee: tx.fee,
      hash: tx.refId,
    })
    setReceiptModalOpen(true)
  }

  // Open the admin console
  const handleToggleAdminMode = () => {
    window.location.href = '/admin'
  }

  void theme
  void setTheme

  // Modal Renderers to share between views
  const renderRejectModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">Reject KYC application</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">{selectedApplicant?.name} · {selectedApplicant?.uid}</p>
          </div>
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
              <option value="Duplicate identity profile detected">Duplicate identity profile detected</option>
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

  const renderReceiptModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
        <TransactionSlip
          refId={selectedTx!.refId}
          amount={Math.abs(selectedTx!.amount)}
          recipientName={selectedTx!.counterparty}
          recipientId={selectedTx!.counterpartyMm}
          senderName={profile.name || 'Wallet'}
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
      <AdminNavBar
        currentTab={navTab}
        onSelectTab={(tabId) => setNavTab(tabId as NavTabType)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pendingKycCount={kycApplicants.filter((item) => item.status === 'Pending').length}
        pendingApprovalsCount={adminApprovals.filter((item) => item.status === 'PENDING').length}
        onRefresh={() => setAdminRefreshKey((key) => key + 1)}
        refreshing={adminLoading}
        onExit={onExit}
        dataError={adminError}
      >
        {navTab === 'admin-overview' && (
          <AdminOverviewDesk
            users={adminUsers}
            transactions={adminTransactions}
            approvals={adminApprovals}
            isDarkMode
            loading={adminLoading}
            error={adminError}
            onNavigate={(tab) => setNavTab(tab as NavTabType)}
          />
        )}

        {navTab === 'admin-kyc' && (
          <AdminKycDesk
            applicants={kycApplicants}
            onApprove={(applicant) => void handleApproveKyc(applicant)}
            onOpenRejectModal={(applicant) => {
              setSelectedApplicant(applicant)
              setRejectModalOpen(true)
            }}
            onSaveProfile={(applicant, fields) => handleSaveKycProfile(applicant, fields)}
            isDarkMode
            loading={adminLoading}
          />
        )}

        {navTab === 'admin-approvals' && (
          <AdminApprovalsDesk
            approvals={adminApprovals}
            users={adminUsers}
            isDarkMode
            loading={adminLoading}
            onReview={(approval, status) => void handleReviewApproval(approval, status)}
          />
        )}

        {navTab === 'admin-fraud' && (
          <AdminSecurityAml
            transactions={scoredAdminTransactions}
            fraudFilter={fraudFilter}
            setFraudFilter={setFraudFilter}
            onFreezeAccount={(tx) => void handleFreezeAccountFromAml(tx)}
            onInspectSlip={handleInspectAdminTransaction}
            isDarkMode
            loading={adminLoading}
            searchQuery={searchQuery}
          />
        )}

        {navTab === 'admin-treasury' && (
          <AdminTreasuryDesk
            users={adminUsers}
            transactions={adminTransactions}
            approvals={adminApprovals}
            isDarkMode
            loading={adminLoading}
          />
        )}

        {rejectModalOpen && selectedApplicant && renderRejectModal()}
        {receiptModalOpen && selectedTx && renderReceiptModal()}
      </AdminNavBar>
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
          {[
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
          })}
        </nav>

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
              {isDevAdminMode ? 'Admin Mode' : 'Wallet'}
            </button>
          </div>
        </div>

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
      {receiptModalOpen && selectedTx && renderReceiptModal()}
    </div>
  )
}

export default DashboardPage
