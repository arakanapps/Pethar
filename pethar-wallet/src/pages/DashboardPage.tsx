import React, { useState, useMemo, useEffect } from 'react'
import { ArakanEmblem } from '../components/ArakanEmblem'
import { TransactionSlip } from '../components/TransactionSlip'
import { ReceiveQRCard } from '../components/ReceiveQRCard'
import {
  LayoutGrid, Wallet, CreditCard, History, TrendingUp, Radio, Settings,
  ShieldCheck, Zap, Send, QrCode, Search, Download, Sparkles,
  Eye, EyeOff, Check, Copy,
  Lock, Unlock, Plus, ExternalLink,
  Store, Layers, Wifi, ArrowUpRight, ArrowDownLeft,
  User, Sun, Moon
} from 'lucide-react'
import { initialUserProfile, type UserProfile, type Txn } from '../data'
import {
  fetchTransactionsFromDb,
  insertTransactionToDb,
  fetchUserProfileFromDb,
  updateUserBalanceInDb,
  fetchFavoriteContactsFromDb,
  subscribeToTransactions,
} from '../services/walletDatabase'
import type { Language } from '../i18n'
import { auth, onAuthStateChange } from '../lib/firebase'
import { supabase } from '../lib/supabase'

export type NavTabType = 'home' | 'wallet' | 'cards' | 'transactions' | 'financial' | 'offline' | 'settings'

export interface DashboardPageProps {
  lang?: Language
  setLang?: (lang: Language) => void
  initialTab?: string
  theme?: string
  setTheme?: (theme: string) => void
  onExit?: () => void
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

  // Navigation Tab State
  const [navTab, setNavTab] = useState<NavTabType>(() => {
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
    if (typeof window !== 'undefined' && auth.currentUser) {
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

  // Sync profile when Supabase or Firebase login completes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user
      if (u) {
        setProfile((prev) => ({
          ...prev,
          name: (u.user_metadata?.full_name as string) || u.email?.split('@')[0] || prev.name,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          avatarUrl: (u.user_metadata?.avatar_url as string) || prev.avatarUrl,
        }))
      }
    }).catch(() => {})

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      if (u) {
        setProfile((prev) => ({
          ...prev,
          name: (u.user_metadata?.full_name as string) || u.email?.split('@')[0] || prev.name,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          avatarUrl: (u.user_metadata?.avatar_url as string) || prev.avatarUrl,
        }))
      }
    })

    if (auth.currentUser) {
      const u = auth.currentUser
      setProfile((prev) => ({
        ...prev,
        name: u.displayName || prev.name,
        email: u.email || prev.email,
        phone: u.phoneNumber || prev.phone,
        avatarUrl: u.photoURL || prev.avatarUrl,
      }))
    }

    const unsubscribe = onAuthStateChange((u) => {
      if (u) {
        setProfile((prev) => ({
          ...prev,
          name: u.displayName || prev.name,
          email: u.email || prev.email,
          phone: u.phoneNumber || prev.phone,
          avatarUrl: u.photoURL || prev.avatarUrl,
        }))
      }
    })

    return () => {
      subscription.unsubscribe()
      unsubscribe()
    }
  }, [])

  // Live Database Sync with Supabase (Replaces file-based storage)
  useEffect(() => {
    let isMounted = true

    fetchTransactionsFromDb().then((txs) => {
      if (isMounted && txs.length > 0) {
        setTxList(txs)
      }
    })

    fetchUserProfileFromDb().then((up) => {
      if (isMounted && up) {
        setWalletBalance(up.balance)
        setProfile((prev) => ({
          ...prev,
          name: up.name || prev.name,
          phone: up.phone || prev.phone,
          uid: up.uid || prev.uid || '202610190001',
        }))
      }
    })

    fetchFavoriteContactsFromDb().then((fc) => {
      if (isMounted && fc.length > 0) {
        setContactsList(
          fc.map((c: any) => ({
            id: c.uid || c.id,
            name: c.name,
            initials: c.initials || c.name.slice(0, 2).toUpperCase(),
            location: c.category || 'Arakan',
            phone: c.phone || '',
          }))
        )
      }
    })

    const unsubRealtime = subscribeToTransactions((newTx) => {
      if (isMounted) {
        setTxList((prev) => {
          if (prev.some((t) => t.id === newTx.id || t.refId === newTx.refId)) {
            return prev
          }
          return [newTx, ...prev]
        })
      }
    })

    return () => {
      isMounted = false
      unsubRealtime()
    }
  }, [])
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [txCategoryFilter, setTxCategoryFilter] = useState<'all' | 'transfer' | 'inflow' | 'merchant' | 'offline'>('all')

  // Balances
  const [walletBalance, setWalletBalance] = useState(0.00)
  const [monthlyInflow] = useState(0.00)
  const [monthlyOutflow] = useState(0.00)
  const [offlineBalance] = useState(0.00)
  const [coinsBalance, setCoinsBalance] = useState<number>(0)

  // Virtual Card Controls
  const [cardLocked, setCardLocked] = useState(false)
  const [cardDetailsVisible, setCardDetailsVisible] = useState(false)
  const [internetLimit, setInternetLimit] = useState(200)
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(true)

  // Analytics View Filter
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('week')

  // Transactions & Contacts State - loaded live from Supabase
  const [txList, setTxList] = useState<Txn[]>([])
  const [contactsList, setContactsList] = useState<any[]>([])

  // Modals
  const [selectedTx, setSelectedTx] = useState<Txn | null>(null)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [topUpModalOpen, setTopUpModalOpen] = useState(false)
  const [offlineBeamModalOpen, setOfflineBeamModalOpen] = useState(false)
  const [allServicesModalOpen, setAllServicesModalOpen] = useState(false)

  // Send Money form state
  const [recipientInput, setRecipientInput] = useState('')
  const [recipientNameInput, setRecipientNameInput] = useState('')
  const [sendAmountInput, setSendAmountInput] = useState('')
  const [sendMemoInput, setSendMemoInput] = useState('')
  const [sendMethod, setSendMethod] = useState<'instant' | 'offline'>('instant')
  const [isSending, setIsSending] = useState(false)

  // Top Up form state
  const [topUpAmount, setTopUpAmount] = useState('0.00')
  const [topUpAsset, setTopUpAsset] = useState<'USDT' | 'USDC' | 'USD1'>('USDT')
  const [copiedAddress, setCopiedAddress] = useState(false)

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return txList.filter((tx) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        tx.title.toLowerCase().includes(q) ||
        tx.titleMm.includes(q) ||
        tx.counterparty.toLowerCase().includes(q) ||
        tx.refId.toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (txCategoryFilter === 'transfer') return tx.category === 'p2p'
      if (txCategoryFilter === 'inflow') return tx.amount > 0
      if (txCategoryFilter === 'merchant') return tx.category === 'pos'
      if (txCategoryFilter === 'offline') return tx.counterparty.toLowerCase().includes('offline') || tx.title.toLowerCase().includes('offline')

      return true
    })
  }, [txList, searchQuery, txCategoryFilter])

  // Open transaction receipt
  const handleOpenReceipt = (tx: Txn) => {
    setSelectedTx(tx)
    setReceiptModalOpen(true)
  }

  // Pre-fill Send modal from contact avatar click
  const handleSelectContactForSend = (contact: { name: string; id: string }) => {
    setRecipientInput(contact.id)
    setRecipientNameInput(contact.name)
    setSendModalOpen(true)
  }

  // Handle Send Money execution -> Generates verifiable e-Receipt with scannable QR
  const handleExecuteSend = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(sendAmountInput)
    if (!recipientInput || isNaN(amt) || amt <= 0 || amt > walletBalance) return

    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      const newRef = `${Math.floor(50000000000000 + Math.random() * 900000000000)}`
      const targetName = recipientNameInput || recipientInput
      const newTx: Txn = {
        id: `TX-${Date.now().toString().slice(-4)}`,
        refId: newRef,
        title: `Transfer to ${targetName}`,
        titleMm: `${targetName} သို့ ငွေလွှဲခြင်း`,
        category: 'p2p',
        amount: -amt,
        currency: 'AKD',
        time: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        status: 'VERIFIED',
        counterparty: `${targetName} (${recipientInput})`,
        counterpartyMm: `${targetName} (ဖေ့သာ)`,
        fee: 0.0,
        hash: `0x${Math.random().toString(16).slice(2, 12)}${Math.random().toString(16).slice(2, 10)}`,
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
      setSendMemoInput('')

      // Automatically open the verified receipt with QR!
      setSelectedTx(newTx)
      setReceiptModalOpen(true)
    }, 500)
  }

  // Handle Top Up execution
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

  void theme
  void setTheme

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0B0F19] text-white' : 'bg-[#F4F6F9] text-slate-900'} font-sans flex transition-colors duration-200`}>
      {/* ══════════════════════════════════════════════════════════════════════
          1. DESKTOP / ENTERPRISE LEFT SIDEBAR (Matching digital-wallet-dashboard & Dompet)
         ══════════════════════════════════════════════════════════════════════ */}
      <aside className={`hidden lg:flex flex-col w-64 xl:w-72 border-r shrink-0 p-5 space-y-6 ${
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
              {ak ? 'ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ်' : 'Digital Wallet'}
            </p>
          </div>
        </div>

        {/* Currency Peg Badge */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-medium space-y-1">
          <div className="flex items-center justify-between font-mono font-bold">
            <span>1 ₳ (AKD) = $1.00 USD</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-sans font-bold">1:1 PEG</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            {ak ? 'USDT/USDC ကျောထောက်နောက်ခံပြုထားသည်' : '100% USDT / USDC Collateralized'}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 font-medium text-xs">
          {[
            { id: 'home', label: ak ? 'ပင်မ စာမျက်နှာ' : 'Overview', icon: LayoutGrid },
            { id: 'wallet', label: ak ? 'ပိုက်ဆံအိတ်' : 'My Wallet', icon: Wallet },
            { id: 'cards', label: ak ? 'ကတ်များ စီမံခန့်ခွဲမှု' : 'Cards Center', icon: CreditCard },
            { id: 'transactions', label: ak ? 'ငွေလွှဲ မှတ်တမ်းများ' : 'Transactions & Invoices', icon: History },
            { id: 'financial', label: ak ? 'ဘဏ္ဍာရေး စာရင်းများ' : 'Treasury & Analytics', icon: TrendingUp },
            { id: 'offline', label: ak ? 'အော့ဖ်လိုင်း ကွန်ရက်' : 'Offline Bearer Mesh', icon: Radio, badge: '100% BLE' },
            { id: 'settings', label: ak ? 'လုံခြုံရေး & ဆက်တင်' : 'Security & Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon
            const isActive = navTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setNavTab(item.id as NavTabType)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8500] text-white font-bold shadow-md shadow-orange-500/20'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Support / Help Card (Matching fintech-app reference) */}
        <div className={`p-4 rounded-3xl border space-y-2 text-xs relative overflow-hidden ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-gradient-to-br from-orange-50 to-amber-50/50 border-orange-100 text-slate-700'
        }`}>
          <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">{ak ? 'အကူအညီ' : 'Support'}</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {ak ? 'အင်တာနက်ပြတ်တောက်ချိန် Starlink မက်ရှ်ဖြင့် ဆက်သွယ်နိုင်ပါသည်' : 'Starlink emergency mesh & offline radio'}
            </p>
          </div>
          <button
            onClick={() => setOfflineBeamModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[11px] font-bold shadow-2xs hover:bg-slate-50 transition border border-slate-200/60 dark:border-slate-700"
          >
            {ak ? 'အော့ဖ်လိုင်းမုဒ် ဖွင့်မည်' : 'Launch Offline Mesh'}
          </button>
        </div>

        {/* User Profile Mini Footer */}
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ExternalLink size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          2. MAIN CONTENT AREA (Responsive Desktop + Mobile)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* ── TOP NAV BAR (Desktop) ── */}
        <header className={`hidden lg:flex items-center justify-between px-8 py-4 border-b sticky top-0 z-30 backdrop-blur-md ${
          isDarkMode ? 'bg-[#111827]/90 border-slate-800' : 'bg-white/90 border-slate-200/80 shadow-2xs'
        }`}>
          {/* Search Input with Category Filters (Matching digital-wallet-dashboard) */}
          <div className="relative w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={ak ? 'ရှာဖွေရန် (ငွေလွှဲ၊ ပြေစာအမှတ်၊ အမည်)...' : 'Search transactions, accounts, ref ID...'}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium border focus:outline-none transition ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#FF6B00]'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF6B00] focus:bg-white'
              }`}
            />
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            {/* Direct Send Action */}
            <button
              onClick={() => setSendModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Send size={14} />
              <span>{ak ? 'ငွေလွှဲ' : 'Send'}</span>
            </button>

            {/* Direct Receive Action */}
            <button
              onClick={() => setReceiveModalOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition border cursor-pointer active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
            >
              <QrCode size={14} />
              <span>{ak ? 'ငွေလက်ခံ QR' : 'Receive QR'}</span>
            </button>

            {/* Offline Beam Action */}
            <button
              onClick={() => setOfflineBeamModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold transition cursor-pointer active:scale-95"
            >
              <Radio size={14} />
              <span>{ak ? 'အော့ဖ်လိုင်း' : 'Offline Beam'}</span>
            </button>

            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={() => setIsDarkMode((v) => !v)}
              className={`p-2 rounded-2xl border transition ${
                isDarkMode ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Language Switcher */}
            {setLang && (
              <button
                onClick={() => setLang(ak ? 'en' : 'ak')}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition ${
                  isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-100 text-slate-800'
                }`}
              >
                {ak ? 'AK · ရခိုင်' : 'EN · English'}
              </button>
            )}

            {/* Coin Badge */}
            <button
              onClick={() => setCoinsBalance((c) => c + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20"
            >
              <Sparkles size={13} />
              <span>{coinsBalance} ₳ Coin</span>
            </button>
          </div>
        </header>

        {/* ── MOBILE TOP ORANGE GRADIENT FINTECH HEADER (Matching TrueMoney ref_04) ── */}
        <div className="lg:hidden bg-gradient-to-r from-[#FF6B00] via-[#FA5A00] to-[#FF8500] text-white pt-3 pb-20 px-4 relative overflow-hidden shadow-lg">
          <div className="relative z-10 space-y-3.5">
            {/* Top Bar Mobile */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md p-1 border border-white/30 flex items-center justify-center">
                  <ArakanEmblem size={24} />
                </div>
                <div>
                  <div className="font-black text-sm tracking-tight">Péthar (ဖေ့သာ)</div>
                  <div className="text-[10px] text-white/80 font-mono">1 ₳ = $1.00 USD</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDarkMode((v) => !v)}
                  className="p-2 rounded-full bg-white/15 text-white text-xs"
                >
                  {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                {setLang && (
                  <button
                    onClick={() => setLang(ak ? 'en' : 'ak')}
                    className="px-2.5 py-1 rounded-full bg-white/15 text-xs font-bold"
                  >
                    {ak ? 'AK' : 'EN'}
                  </button>
                )}
              </div>
            </div>

            {/* Search Input Mobile */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={ak ? 'ရှာဖွေရန် (ငွေလွှဲ၊ ပြေစာအမှတ်)...' : 'Search transactions, services...'}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md text-white placeholder-white/70 text-xs font-medium border border-white/20 focus:outline-none focus:bg-white/25 transition"
              />
            </div>

            {/* 4 Core Quick Actions Mobile */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <button
                onClick={() => setSendModalOpen(true)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xs active:scale-95 transition">
                  <Send size={20} />
                </div>
                <span className="text-[10px] font-bold text-white/90">{ak ? 'ငွေလွှဲ' : 'Transfer'}</span>
              </button>

              <button
                onClick={() => setReceiveModalOpen(true)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xs active:scale-95 transition">
                  <Download size={20} className="rotate-180" />
                </div>
                <span className="text-[10px] font-bold text-white/90">{ak ? 'ငွေလက်ခံ' : 'Receive'}</span>
              </button>

              <button
                onClick={() => setOfflineBeamModalOpen(true)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xs active:scale-95 transition">
                  <Radio size={20} />
                </div>
                <span className="text-[10px] font-bold text-white/90">{ak ? 'အော့ဖ်လိုင်း' : 'Tap to Pay'}</span>
              </button>

              <button
                onClick={() => setReceiveModalOpen(true)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xs active:scale-95 transition">
                  <QrCode size={20} />
                </div>
                <span className="text-[10px] font-bold text-white/90">{ak ? 'စကင်န်ဖတ်' : 'Pay / QR'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── CORE DASHBOARD CONTENT CONTAINER ── */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 -mt-12 lg:mt-0 max-w-7xl w-full mx-auto pb-24">
          {/* ══════════════════════════════════════════════════════════════════
              3. 4 STAT METRIC CARDS (Matching Dompet & Paycent)
             ══════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Liquid Net Worth */}
            <div className={`p-5 rounded-3xl border shadow-sm space-y-3 relative overflow-hidden ${
              isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {ak ? 'စုစုပေါင်း လက်ကျန်ငွေ' : 'Total Net Worth'}
                </span>
                <button
                  onClick={() => setBalanceVisible((v) => !v)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {balanceVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1">
                  <span className="text-xl text-[#FF6B00]">₳</span>
                  <span>{balanceVisible ? walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '••••••'}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>+8.4%</span>
                  <span className="text-slate-400 font-normal">≈ ${walletBalance.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">100% USDT Pegged</span>
                <button
                  onClick={() => setTopUpModalOpen(true)}
                  className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>{ak ? 'ငွေသွင်း' : 'Top Up'}</span>
                </button>
              </div>
            </div>

            {/* Card 2: Monthly Inflow */}
            <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
              isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {ak ? 'လစဉ် ဝင်ငွေ / ငွေသွင်း' : 'Monthly Inflow'}
                </span>
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ArrowDownLeft size={16} />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                  +₳ {monthlyInflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">
                  {ak ? 'USDT & P2P စာရင်းသွင်းမှုများ' : '+14.2% higher than last month'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                12 Inflow transactions settled
              </div>
            </div>

            {/* Card 3: Monthly Outflow */}
            <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
              isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {ak ? 'လစဉ် သုံးစွဲမှု / ငွေလွှဲ' : 'Monthly Outflow'}
                </span>
                <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  -₳ {monthlyOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">
                  {ak ? 'ကုန်သည် & ဝန်ဆောင်ခ ပေးချေမှုများ' : '32 transactions settled'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                Budget limit: ₳ 5,000.00
              </div>
            </div>

            {/* Card 4: Offline Bearer Reserves */}
            <div className={`p-5 rounded-3xl border shadow-sm space-y-3 relative overflow-hidden ${
              isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {ak ? 'အော့ဖ်လိုင်း တိုကင်များ' : 'Offline Bearer Tokens'}
                  </span>
                </div>
                <Radio size={16} className="text-amber-500" />
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400">
                  ₳ {offlineBalance.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {ak ? 'Chaumian Blind Mint (အင်တာနက်မလို)' : 'Chaumian Mint · Zero Internet'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-emerald-500 font-bold">BLE + NFC Ready</span>
                <button
                  onClick={() => setOfflineBeamModalOpen(true)}
                  className="text-xs font-bold text-[#FF6B00] hover:underline"
                >
                  {ak ? 'လွှဲမည် ›' : 'Beam ›'}
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              4. MAIN TWO-COLUMN WORKSPACE (Left: Actions & Charts; Right: Card & Stats)
             ══════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* ── LEFT WORKSPACE (Col 8) ── */}
            <div className="lg:col-span-8 space-y-6">
              {/* SECTION A: QUICK PAYMENT SERVICE TILES (Matching digital-wallet-dashboard) */}
              <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${
                isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                      {ak ? 'ငွေပေးချေမှု & ဝန်ဆောင်မှုများ' : 'Payments & Services'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {ak ? 'တိုက်ရိုက်လွှဲပြောင်းရန် အောက်ပါတို့ကို ရွေးချယ်ပါ' : 'Select a service to start an instant transaction'}
                    </p>
                  </div>
                  <button
                    onClick={() => setAllServicesModalOpen(true)}
                    className="text-xs font-bold text-[#FF6B00] hover:underline"
                  >
                    {ak ? 'အားလုံးကြည့်ရန် ›' : 'View All ›'}
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
                  {[
                    { id: 'transfer', label: ak ? 'ငွေလွှဲ' : 'Transfer', icon: Send, color: 'bg-purple-500/10 text-purple-600', action: () => setSendModalOpen(true) },
                    { id: 'receive', label: ak ? 'ငွေလက်ခံ' : 'Receive QR', icon: QrCode, color: 'bg-emerald-500/10 text-emerald-600', action: () => setReceiveModalOpen(true) },
                    { id: 'offline', label: ak ? 'အော့ဖ်လိုင်း' : 'BLE Tap', icon: Radio, color: 'bg-amber-500/10 text-amber-600', action: () => setOfflineBeamModalOpen(true) },
                    { id: 'starlink', label: ak ? 'စတားလင့်ခ်' : 'Starlink', icon: Wifi, color: 'bg-cyan-500/10 text-cyan-600', action: () => alert('Starlink Arakan Mesh Gateway Active') },
                    { id: 'merchant', label: ak ? 'ကုန်သည်' : 'Merchants', icon: Store, color: 'bg-rose-500/10 text-rose-600', action: () => setAllServicesModalOpen(true) },
                    { id: 'utilities', label: ak ? 'လျှပ်စစ်/ဆိုလာ' : 'Utilities', icon: Zap, color: 'bg-indigo-500/10 text-indigo-600', action: () => setAllServicesModalOpen(true) },
                  ].map((service) => {
                    const Svg = service.icon
                    return (
                      <button
                        key={service.id}
                        onClick={service.action}
                        className={`p-3.5 rounded-2xl flex flex-col items-center gap-2 transition hover:scale-105 active:scale-95 border ${
                          isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50 shadow-2xs'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-2xl ${service.color} flex items-center justify-center font-bold`}>
                          <Svg size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {service.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* SECTION B: QUICK TRANSFER TO CONTACTS (Matching Dompet & Novera) */}
              <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${
                isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                      {ak ? 'အမြန်ငွေလွှဲရန် အဆက်အသွယ်များ' : 'Quick Transfer to Contacts'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {ak ? 'ချက်ချင်းငွေလွှဲရန် မိတ်ဆွေကို နှိပ်ပါ' : 'Click a contact to pre-fill 1-click instant transfer'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSendModalOpen(true)}
                    className="text-xs font-bold text-[#FF6B00] hover:underline"
                  >
                    {ak ? '+ အသစ်ထည့်မည်' : '+ Add Recipient'}
                  </button>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {contactsList.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectContactForSend(c)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition hover:border-[#FF6B00] shrink-0 min-w-[84px] text-center ${
                        isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF6B00] to-amber-400 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {c.initials}
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[76px]">
                        {c.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 truncate max-w-[76px]">
                        {c.id}
                      </span>
                    </button>
                  ))}

                  <button
                    onClick={() => setSendModalOpen(true)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 border-dashed transition shrink-0 min-w-[84px] text-center ${
                      isDarkMode ? 'border-slate-700 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <Plus size={20} />
                    </div>
                    <span className="text-[11px] font-bold">{ak ? 'အသစ်' : 'New'}</span>
                  </button>
                </div>
              </div>

              {/* SECTION C: INTERACTIVE CASHFLOW & SPENDING ANALYTICS (Matching digital-wallet-dashboard & bc892d21) */}
              <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${
                isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                      {ak ? 'ငွေကြေးစီးဆင်းမှု & သုံးစွဲမှု သရုပ်ပြပုံ' : 'Cashflow & Activity Analytics'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {ak ? 'ဝင်ငွေ (စိမ်းပြာ) နှင့် ထွက်ငွေ (ခရမ်းရောင်) တိုက်ဆိုင်ချက်' : 'Inflow (Cyan) vs Outflow (Purple) comparison'}
                    </p>
                  </div>

                  {/* Period Filter Switcher */}
                  <div className={`inline-flex p-1 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}>
                    {(['week', 'month', 'year'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setChartPeriod(p)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition capitalize ${
                          chartPeriod === p
                            ? 'bg-[#FF6B00] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key Metric Highlights */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{ak ? 'စုစုပေါင်း သုံးစွဲမှု' : 'Total Spent'}</span>
                    <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white mt-0.5">₳ 99.00</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{ak ? 'နေ့စဉ် ပျမ်းမျှ' : 'Daily Average'}</span>
                    <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white mt-0.5">₳ 14.14</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{ak ? 'အမြင့်ဆုံးနေ့' : 'Peak Day'}</span>
                    <div className="text-base sm:text-lg font-black font-mono text-[#FF6B00] mt-0.5">Wednesday</div>
                  </div>
                </div>

                {/* Dual-Bar Capsule Chart (Matching digital-wallet-dashboard & ref_10) */}
                <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 items-end h-40 text-center font-mono text-xs">
                  {[
                    { day: 'Mon', inH: '60%', outH: '25%', inAmt: '₳ 50', outAmt: '₳ 5' },
                    { day: 'Tue', inH: '40%', outH: '15%', inAmt: '₳ 30', outAmt: '₳ 0' },
                    { day: 'Wed', inH: '90%', outH: '85%', inAmt: '₳ 120', outAmt: '₳ 94' },
                    { day: 'Thu', inH: '35%', outH: '20%', inAmt: '₳ 20', outAmt: '₳ 0' },
                    { day: 'Fri', inH: '70%', outH: '40%', inAmt: '₳ 80', outAmt: '₳ 0' },
                    { day: 'Sat', inH: '25%', outH: '15%', inAmt: '₳ 10', outAmt: '₳ 0' },
                    { day: 'Sun', inH: '20%', outH: '10%', inAmt: '₳ 5', outAmt: '₳ 0' },
                  ].map((col) => (
                    <div key={col.day} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="flex items-end gap-1 w-full justify-center h-28">
                        {/* Inflow bar (Cyan) */}
                        <div
                          style={{ height: col.inH }}
                          className="w-2.5 sm:w-4 rounded-full bg-cyan-500 group-hover:bg-cyan-400 transition-all"
                          title={`Inflow: ${col.inAmt}`}
                        />
                        {/* Outflow bar (Purple / Orange) */}
                        <div
                          style={{ height: col.outH }}
                          className="w-2.5 sm:w-4 rounded-full bg-purple-500 group-hover:bg-purple-400 transition-all"
                          title={`Outflow: ${col.outAmt}`}
                        />
                      </div>
                      <span className="font-bold text-[10px] text-slate-500">{col.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION D: RECENT TRANSACTIONS TABLE & VERIFIED RECEIPTS (Matching Paycent & Dompet) */}
              <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${
                isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                      {ak ? 'မကြာသေးမီက ငွေလွှဲစာရင်းများ' : 'Recent Transactions & Ledger'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {ak ? 'တိုက်ဆိုင်စစ်ဆေးပြီးသော ပြေစာနှင့် QR ကုဒ်ကို ကြည့်ရန် နှိပ်ပါ' : 'Click any transaction to open verifiable e-Receipt with QR'}
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    {(['all', 'transfer', 'inflow', 'merchant', 'offline'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTxCategoryFilter(filter)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition capitalize whitespace-nowrap ${
                          txCategoryFilter === filter
                            ? 'bg-[#FF6B00] text-white shadow-xs'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-400 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transactions List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransactions.map((tx) => {
                    const isPositive = tx.amount > 0
                    return (
                      <div
                        key={tx.id}
                        onClick={() => handleOpenReceipt(tx)}
                        className={`py-3.5 px-3 -mx-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition ${
                          isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Direction Indicator */}
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isPositive
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isPositive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                          </div>

                          <div className="min-w-0">
                            <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                              {ak ? tx.titleMm : tx.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                              {ak ? tx.counterpartyMm : tx.counterparty} · {tx.time}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`font-mono font-black text-sm ${
                              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {isPositive ? '+' : ''}₳{' '}
                            {Math.abs(tx.amount).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <ShieldCheck size={11} className="text-emerald-500" />
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── RIGHT WORKSPACE (Col 4) ── */}
            <div className="lg:col-span-4 space-y-6">
              {/* SECTION E: VIRTUAL CARD (Matching digital-wallet-dashboard & SxDx Bank) */}
              <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${
                isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                    {ak ? 'ဒစ်ဂျစ်တယ်ကတ်' : 'Card'}
                  </h3>
                  <button
                    onClick={() => setCardLocked((l) => !l)}
                    className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition ${
                      cardLocked
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {cardLocked ? <Lock size={12} /> : <Unlock size={12} />}
                    <span>{cardLocked ? (ak ? 'ပိတ်ထားသည်' : 'Locked') : ak ? 'အသုံးပြုနိုင်' : 'Active'}</span>
                  </button>
                </div>

                {/* Holographic Gradient Card Presentation */}
                <div className="w-full aspect-[1.58/1] rounded-3xl p-5 text-white bg-gradient-to-tr from-slate-900 via-indigo-950 to-orange-700 shadow-xl relative overflow-hidden flex flex-col justify-between border border-white/10 group">
                  {/* Hologram sheen */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                  {/* Card Top Row */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <ArakanEmblem size={24} />
                      <span className="font-mono text-xs font-bold tracking-widest text-amber-300">
                        PÉTHAR
                      </span>
                    </div>
                    <Radio size={18} className="text-white/80" />
                  </div>

                  {/* EMV Chip */}
                  <div className="w-10 h-8 rounded-lg bg-gradient-to-tr from-amber-300 to-amber-100 border border-amber-400/80 shadow-xs z-10 flex items-center justify-center">
                    <div className="w-6 h-5 border border-amber-600/40 rounded-sm" />
                  </div>

                  {/* Card Number */}
                  <div className="z-10 font-mono text-base sm:text-lg font-black tracking-wider text-slate-100 flex items-center justify-between">
                    <span>{cardDetailsVisible ? '3453 4262 7310 3728' : '•••• •••• •••• 3728'}</span>
                    <button
                      onClick={() => setCardDetailsVisible((v) => !v)}
                      className="text-white/60 hover:text-white"
                    >
                      {cardDetailsVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Card Bottom Row */}
                  <div className="flex items-end justify-between z-10 text-[11px] font-mono">
                    <div>
                      <div className="text-[8px] text-white/60 uppercase">Card Holder</div>
                      <div className="font-bold tracking-wide uppercase">{profile.name}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-white/60 uppercase">Expires</div>
                      <div className="font-bold">02/30</div>
                    </div>
                    <div className="font-black text-sm italic tracking-widest text-amber-400">
                      VISA
                    </div>
                  </div>
                </div>

                {/* Card Controls & Limit Slider (Matching SxDx Bank reference) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500 dark:text-slate-400">{ak ? 'အင်တာနက် သုံးစွဲမှု ကန့်သတ်ချက်' : 'Online Payment Limit'}</span>
                    <span className="font-mono text-[#FF6B00]">₳ {internetLimit} / ₳ 1,000</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={internetLimit}
                    onChange={(e) => setInternetLimit(parseInt(e.target.value))}
                    className="w-full accent-[#FF6B00] cursor-pointer"
                  />

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{ak ? 'အွန်လိုင်း ဈေးဝယ်ခွင့်' : 'E-Commerce Transactions'}</span>
                    <button
                      onClick={() => setOnlinePaymentsEnabled((v) => !v)}
                      className={`w-10 h-6 rounded-full transition-colors p-1 ${
                        onlinePaymentsEnabled ? 'bg-[#FF6B00]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        onlinePaymentsEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION F: EXPENSE & ASSET ALLOCATION BREAKDOWN (Matching digital-wallet-dashboard & bc892d21) */}
              <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${
                isDarkMode ? 'bg-[#1F2937] border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                    {ak ? 'ပိုင်ဆိုင်မှု & အသုံးစရိတ် ခွဲဝေမှု' : 'Asset & Expense Allocation'}
                  </h3>
                  <span className="text-xs font-mono font-bold text-slate-400">100% USDT Peg</span>
                </div>

                <div className="space-y-3">
                  {[
                    { label: ak ? 'တိုက်ရိုက်လွှဲပြောင်းမှုများ (P2P)' : 'P2P Instant Transfers', pct: 35, color: 'bg-[#FF6B00]', amt: '₳ 4,375.00' },
                    { label: ak ? 'Starlink ကွန်ရက် & ဝန်ဆောင်မှု' : 'Starlink Mesh & Telecom', pct: 25, color: 'bg-cyan-500', amt: '₳ 3,125.00' },
                    { label: ak ? 'ဒေသတွင်း ကုန်သည် & အစားအစာ' : 'Merchant Food & Retail', pct: 25, color: 'bg-purple-500', amt: '₳ 3,125.00' },
                    { label: ak ? 'အော့ဖ်လိုင်း ဘဲရားရက်စ် တိုကင်များ' : 'Offline Bearer Tokens (Cashu)', pct: 15, color: 'bg-amber-400', amt: '₳ 1,875.00' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{item.pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div style={{ width: `${item.pct}%` }} className={`h-full rounded-full ${item.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION G: STARLINK MESH & OFFLINE VAULT WIDGET */}
              <div className={`p-5 rounded-3xl border space-y-3 ${
                isDarkMode ? 'bg-gradient-to-br from-slate-900 to-amber-950/40 border-slate-800' : 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border-amber-200/80'
              }`}>
                <div className="flex items-center gap-2">
                  <Wifi size={18} className="text-[#FF6B00]" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {ak ? 'ရခိုင် စတားလင့်ခ် ကွန်ရက် အခြေအနေ' : 'Arakan Mesh Node'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {ak
                    ? 'အင်တာနက် အဆက်အသွယ်လုံးဝ ပြတ်တောက်သွားပါက အနီးဆုံး BLE / NFC စက်ပစ္စည်းများဖြင့် အော့ဖ်လိုင်း ငွေလွှဲပြောင်းနိုင်ပါသည်။'
                    : 'When telecommunications are severed, transfer peer-to-peer bearer tokens with zero internet via Bluetooth & NFC.'}
                </p>
                <button
                  onClick={() => setOfflineBeamModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition shadow-xs"
                >
                  {ak ? 'အော့ဖ်လိုင်း တိုကင် ထုတ်ယူမည်' : 'Mint & Beam Offline Cashu'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          5. MOBILE BOTTOM DOCK (Liquid Glass Pill Navbar with Red Effect)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-3 left-0 right-0 z-40 px-3 max-w-lg mx-auto pointer-events-none">
        <nav
          aria-label="Mobile Navigation"
          className={`pointer-events-auto h-[68px] px-2 rounded-full backdrop-blur-2xl saturate-180 border flex items-center justify-between transition-all duration-300 ${
            isDarkMode
              ? 'bg-[#121620]/80 border-white/15 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.22),inset_0_-1px_2px_rgba(217,22,36,0.18),0_16px_40px_rgba(0,0,0,0.7)]'
              : 'bg-white/80 border-white/90 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.95),inset_0_-1px_2px_rgba(217,22,36,0.06),0_14px_34px_rgba(15,23,42,0.14)]'
          }`}
        >
          {/* 1. Home */}
          <button
            onClick={() => setNavTab('home')}
            className={`flex-1 h-[54px] rounded-full flex flex-col items-center justify-center gap-0.5 text-[11px] transition-all cursor-pointer ${
              navTab === 'home'
                ? 'bg-gradient-to-b from-[#D91624]/[0.15] to-[#D91624]/[0.06] text-[#D91624] dark:text-[#FF3B47] border border-[#D91624]/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_4px_12px_rgba(217,22,36,0.15)] font-extrabold'
                : 'text-slate-700 dark:text-slate-300 font-medium'
            }`}
          >
            <LayoutGrid size={20} />
            <span>{ak ? 'ပင်မ' : 'Home'}</span>
          </button>

          {/* 2. Financial (Combines Financial Analytics & History) */}
          <button
            onClick={() => setNavTab(navTab === 'financial' ? 'transactions' : 'financial')}
            className={`flex-1 h-[54px] rounded-full flex flex-col items-center justify-center gap-0.5 text-[11px] transition-all cursor-pointer ${
              navTab === 'financial' || navTab === 'transactions'
                ? 'bg-gradient-to-b from-[#D91624]/[0.15] to-[#D91624]/[0.06] text-[#D91624] dark:text-[#FF3B47] border border-[#D91624]/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_4px_12px_rgba(217,22,36,0.15)] font-extrabold'
                : 'text-slate-700 dark:text-slate-300 font-medium'
            }`}
          >
            <span className="w-[21px] h-[21px] rounded-full border-[1.8px] border-current flex items-center justify-center text-[11px] font-extrabold leading-none">
              ₳
            </span>
            <span>{ak ? 'ဘဏ္ဍာရေး' : 'Financial'}</span>
          </button>

          {/* 3. Center Red Scan Button */}
          <div className="px-1.5 flex items-center justify-center">
            <button
              onClick={() => setReceiveModalOpen(true)}
              aria-label="Scan QR"
              className="w-[58px] h-[58px] rounded-full bg-gradient-to-b from-[#FF2A38] via-[#D91624] to-[#B00E1A] text-white flex items-center justify-center shadow-[inset_0_2px_2px_rgba(255,255,255,0.45),0_8px_22px_rgba(217,22,36,0.55)] active:scale-95 transition border border-white/35 cursor-pointer"
            >
              <QrCode size={25} />
            </button>
          </div>

          {/* 4. Services (Replaces History tab) */}
          <button
            onClick={() => setAllServicesModalOpen(true)}
            className={`flex-1 h-[54px] rounded-full flex flex-col items-center justify-center gap-0.5 text-[11px] transition-all cursor-pointer ${
              allServicesModalOpen
                ? 'bg-gradient-to-b from-[#D91624]/[0.15] to-[#D91624]/[0.06] text-[#D91624] dark:text-[#FF3B47] border border-[#D91624]/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_4px_12px_rgba(217,22,36,0.15)] font-extrabold'
                : 'text-slate-700 dark:text-slate-300 font-medium'
            }`}
          >
            <Layers size={20} />
            <span>{ak ? 'ဝန်ဆောင်မှု' : 'Services'}</span>
          </button>

          {/* 5. Account */}
          <button
            onClick={() => setNavTab('settings')}
            className={`flex-1 h-[54px] rounded-full flex flex-col items-center justify-center gap-0.5 text-[11px] transition-all cursor-pointer ${
              navTab === 'settings'
                ? 'bg-gradient-to-b from-[#D91624]/[0.15] to-[#D91624]/[0.06] text-[#D91624] dark:text-[#FF3B47] border border-[#D91624]/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_4px_12px_rgba(217,22,36,0.15)] font-extrabold'
                : 'text-slate-700 dark:text-slate-300 font-medium'
            }`}
          >
            <User size={20} />
            <span>{ak ? 'အကောင့်' : 'Account'}</span>
          </button>
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: VERIFIED E-RECEIPT WITH SCANNABLE QR (ref_01 & ref_02)
         ══════════════════════════════════════════════════════════════════════ */}
      {receiptModalOpen && selectedTx && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setReceiptModalOpen(false)}
        >
          <div
            className="w-full max-w-sm my-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <TransactionSlip
              lang={lang}
              refId={selectedTx.refId}
              amount={Math.abs(selectedTx.amount)}
              recipientName={selectedTx.counterparty}
              recipientId={selectedTx.id}
              recipientType={selectedTx.category === 'p2p' ? 'Péthar Instant Pay' : 'Offline Mode Token'}
              senderName={profile.name || 'User'}
              senderId={`Péthar Wallet ${profile.petharId}`}
              fee={selectedTx.fee}
              timestamp={selectedTx.time}
              location="Sittwe, Arakan"
              notes="Payment"
              autoSaved={true}
              onClose={() => setReceiptModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: RECEIVE QR PAYMENT CARD (ref_03)
         ══════════════════════════════════════════════════════════════════════ */}
      {receiveModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setReceiveModalOpen(false)}
        >
          <div
            className="w-full max-w-sm my-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <ReceiveQRCard
              lang={lang}
              name={profile.name || 'User'}
              petharId={profile.petharId || '140-********* -295'}
              onClose={() => setReceiveModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3: TRANSFER / SEND MONEY FORM (Produces Verified QR Receipt)
         ══════════════════════════════════════════════════════════════════════ */}
      {sendModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSendModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-white space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send size={18} className="text-[#FF6B00]" />
                <h3 className="font-black text-lg">{ak ? 'ငွေလွှဲမည်' : 'Send Money'}</h3>
              </div>
              <button
                onClick={() => setSendModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteSend} className="space-y-4">
              {/* Payment Mode Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSendMethod('instant')}
                  className={`py-2 rounded-xl transition ${
                    sendMethod === 'instant' ? 'bg-[#FF6B00] text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {ak ? 'အွန်လိုင်း ချက်ချင်းလွှဲ' : 'Instant Online'}
                </button>
                <button
                  type="button"
                  onClick={() => setSendMethod('offline')}
                  className={`py-2 rounded-xl transition ${
                    sendMethod === 'offline' ? 'bg-[#FF6B00] text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {ak ? 'အော့ဖ်လိုင်း ဘဲရားရက်စ်' : 'Offline Bearer'}
                </button>
              </div>

              {/* Recipient Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {ak ? 'ငွေလက်ခံသူ (Péthar ID သို့မဟုတ် အမည်)' : 'Recipient Péthar ID or Name'}
                </label>
                <input
                  type="text"
                  required
                  value={recipientInput}
                  onChange={(e) => {
                    setRecipientInput(e.target.value)
                    setRecipientNameInput(e.target.value)
                  }}
                  placeholder="e.g. ARAK-8891 or Ko Min Aung"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {ak ? 'ငွေပမာဏ (₳ AKD)' : 'Amount (₳ AKD)'}
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    Balance: ₳ {walletBalance.toFixed(2)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-black text-amber-500 text-lg">
                    ₳
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={walletBalance}
                    required
                    value={sendAmountInput}
                    onChange={(e) => setSendAmountInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-14 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xl font-mono font-black focus:outline-none focus:border-[#FF6B00]"
                  />
                  <button
                    type="button"
                    onClick={() => setSendAmountInput(walletBalance.toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-orange-500/10 text-[#FF6B00] text-[10px] font-bold"
                  >
                    MAX
                  </button>
                </div>
                <p className="text-[10px] font-mono text-slate-400">
                  1 ₳ = $1.00 USD · Fee: 0.00 ₳ (Free Instant Settle)
                </p>
              </div>

              {/* Memo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {ak ? 'မှတ်ချက် (ရွေးချယ်နိုင်သည်)' : 'Note / Memo (Optional)'}
                </label>
                <input
                  type="text"
                  value={sendMemoInput}
                  onChange={(e) => setSendMemoInput(e.target.value)}
                  placeholder="e.g. For solar equipment or local trade"
                  className="w-full px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <button
                type="submit"
                disabled={isSending || !sendAmountInput || !recipientInput}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#FF8500] text-white font-bold text-xs shadow-md hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 cursor-pointer"
              >
                {isSending
                  ? (ak ? 'ငွေလွှဲပြောင်းနေပါသည်...' : 'Processing Transaction...')
                  : (ak ? 'ငွေလွှဲမည် (ပြေစာနှင့် QR ရယူမည်)' : 'Confirm & Get Verified Slip with QR')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 4: TOP UP / DEPOSIT (1 ₳ = $1.00 USD with USDT / USDC)
         ══════════════════════════════════════════════════════════════════════ */}
      {topUpModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setTopUpModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-white space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#FF6B00]" />
                <h3 className="font-black text-lg">{ak ? 'ငွေဖြည့်မည် (Top Up)' : 'Top Up Wallet'}</h3>
              </div>
              <button
                onClick={() => setTopUpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
              <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">1 ₳ AKD = 1.00 USD</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                {ak
                  ? 'USDT (TRC-20) သို့မဟုတ် USDC ဖြင့် ၁:၁ တန်ဖိုး တိုက်ရိုက်ငွေသွင်းနိုင်ပါသည်။'
                  : 'Deposit USDT/USDC directly into treasury smart contract with instant 1:1 issuance.'}
              </p>
            </div>

            {/* Asset Selector */}
            <div className="grid grid-cols-3 gap-2">
              {(['USDT', 'USDC', 'USD1'] as const).map((asset) => (
                <button
                  key={asset}
                  type="button"
                  onClick={() => setTopUpAsset(asset)}
                  className={`py-2 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    topUpAsset === asset
                      ? 'border-[#FF6B00] bg-orange-500/10 text-[#FF6B00]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>{asset}</span>
                </button>
              ))}
            </div>

            {/* Amount Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {ak ? 'သွင်းမည့် ပမာဏ' : 'Deposit Amount'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['50', '100', '250', '500'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                      topUpAmount === amt
                        ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Mock Deposit Address */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-1.5">
              <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">
                Deposit Address (TRC-20 / Arbitrum):
              </div>
              <div className="text-slate-900 dark:text-slate-200 break-all text-[11px] font-bold">
                TX9q...77F3ArakanTreasuryPeg91
              </div>
              <button
                type="button"
                onClick={() => {
                  setCopiedAddress(true)
                  setTimeout(() => setCopiedAddress(false), 2000)
                }}
                className="inline-flex items-center gap-1 text-[11px] text-[#FF6B00] hover:underline font-bold"
              >
                {copiedAddress ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copiedAddress ? 'Copied' : 'Copy Address'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleExecuteTopUp}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#FF8500] text-white font-bold text-xs shadow-md hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
            >
              {ak ? `₳ ${topUpAmount} စာရင်းသွင်းမည်` : `Simulate Deposit (+₳ ${topUpAmount})`}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 5: OFFLINE BEAM / TAP TO PAY (Cashu Chaumian Mint)
         ══════════════════════════════════════════════════════════════════════ */}
      {offlineBeamModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setOfflineBeamModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 text-white space-y-4 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl animate-pulse">
              📶
            </div>
            <div>
              <h3 className="font-black text-lg text-white">
                {ak ? 'အော့ဖ်လိုင်းမုဒ် (Offline Mode)' : 'Tap to Pay (Offline Mesh)'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {ak
                  ? 'အင်တာနက်လုံးဝ မလိုအပ်ဘဲ Bluetooth သို့မဟုတ် NFC ဖြင့် ငွေလွှဲနိုင်ပါသည်။'
                  : 'Bearer Cashu token beam via Bluetooth Low Energy & NFC.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Bearer Tokens:</span>
                <span className="text-emerald-400 font-bold">₳ {offlineBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transport:</span>
                <span className="text-slate-200">BLE + NFC Tap</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security:</span>
                <span className="text-slate-200">Chaumian Blind Mint</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert(ak ? 'ဖုန်းနှစ်လုံးကို အနီးကပ်ထားပြီး ငွေလွှဲနိုင်ပါပြီ!' : 'Ready! Bring devices close to transfer offline.')
                setOfflineBeamModalOpen(false)
              }}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs"
            >
              {ak ? 'အော့ဖ်လိုင်းငွေလွှဲ စတင်မည်' : 'Initiate Offline Transfer'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 6: ALL SERVICES SHEET
         ══════════════════════════════════════════════════════════════════════ */}
      {allServicesModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
          onClick={() => setAllServicesModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto p-6 text-slate-900 dark:text-white space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-lg">{ak ? 'ဝန်ဆောင်မှု အားလုံး' : 'All Services'}</h3>
              <button
                onClick={() => setAllServicesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-extrabold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                  {ak ? 'ငွေကြေး & လွှဲပြောင်းမှုများ' : 'Financial & Transfer'}
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div
                    onClick={() => { setAllServicesModalOpen(false); setSendModalOpen(true); }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition"
                  >
                    <Send size={20} className="text-[#FF6B00]" />
                    <span className="text-[10px] font-semibold">{ak ? 'ငွေလွှဲ' : 'Transfer'}</span>
                  </div>
                  <div
                    onClick={() => { setAllServicesModalOpen(false); setReceiveModalOpen(true); }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition"
                  >
                    <QrCode size={20} className="text-emerald-500" />
                    <span className="text-[10px] font-semibold">{ak ? 'ငွေလက်ခံ' : 'Receive'}</span>
                  </div>
                  <div
                    onClick={() => { setAllServicesModalOpen(false); setTopUpModalOpen(true); }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition"
                  >
                    <Sparkles size={20} className="text-amber-500" />
                    <span className="text-[10px] font-semibold">{ak ? 'ငွေဖြည့်' : 'Top Up'}</span>
                  </div>
                  <div
                    onClick={() => { setAllServicesModalOpen(false); setOfflineBeamModalOpen(true); }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition"
                  >
                    <Radio size={20} className="text-indigo-500" />
                    <span className="text-[10px] font-semibold">{ak ? 'အော့ဖ်လိုင်း' : 'BLE Tap'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                  {ak ? 'ဒေသတွင်း ကုန်သည် & အခြေခံအဆောက်အအုံ' : 'Local Merchants & Mesh Infrastructure'}
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center gap-1.5 cursor-pointer">
                    <Store size={20} className="text-rose-500" />
                    <span className="text-[10px] font-semibold">Sittwe POS</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center gap-1.5 cursor-pointer">
                    <Wifi size={20} className="text-cyan-500" />
                    <span className="text-[10px] font-semibold">Starlink Mesh</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center gap-1.5 cursor-pointer">
                    <Zap size={20} className="text-amber-500" />
                    <span className="text-[10px] font-semibold">Solar Bill</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center gap-1.5 cursor-pointer">
                    <Layers size={20} className="text-purple-500" />
                    <span className="text-[10px] font-semibold">Cross-Bridge</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
