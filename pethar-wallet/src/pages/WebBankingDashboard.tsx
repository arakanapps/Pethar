import React, { useState, useMemo } from 'react'
import {
  ArakanEmblem, FlagArakan, FlagInternational
} from '../components/ArakanEmblem'
import {
  LayoutDashboard, ArrowUpRight, Send, QrCode,
  Globe, Coins, ShieldCheck, History, CreditCard,
  Search, Bell, LogOut, CheckCircle,
  Copy, ChevronRight, Lock, Eye, EyeOff,
  Plus, Check, X, Radio, RefreshCw,
  Download
} from 'lucide-react'
import {
  transactions, liveFxRates, contacts, initialUserProfile,
  type UserProfile, type Txn
} from '../data'
import { type Language, translations } from '../i18n'

interface WebBankingDashboardProps {
  lang: Language
  setLang: (lang: Language) => void
  theme?: 'dark' | 'light'
  setTheme?: (theme: 'dark' | 'light') => void
  onExit: () => void
}

type TabType = 'overview' | 'pos' | 'transfers' | 'remittance' | 'cards' | 'reserves' | 'settings'

export const WebBankingDashboard: React.FC<WebBankingDashboardProps> = ({
  lang,
  setLang,
  onExit,
}) => {
  const t = translations[lang]

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [profile] = useState<UserProfile>(initialUserProfile)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [chartMetric, setChartMetric] = useState<'amount' | 'count'>('amount')

  // Selected Transaction for SxDx Bank "Payment Details" panel
  const [selectedTx, setSelectedTx] = useState<Txn | null>(transactions[0] || null)

  // Subscriptions interactive toggles (SxDx Bank inspired)
  const [subscriptionStates, setSubscriptionStates] = useState<Record<string, boolean>>({
    starlink: true,
    youtube: true,
    fee: false,
  })

  // Internet payment limit slider
  const [paymentLimit, setPaymentLimit] = useState(2500)

  // Active Card Index for Layered Multi-Card Stack (Novera inspired)
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  // CentralPay Inspired Savings Tracker State
  const [goldBalance, setGoldBalance] = useState(12087.0)
  const [emergencyBalance, setEmergencyBalance] = useState(2400.22)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveTarget, setSaveTarget] = useState<'gold' | 'emergency'>('gold')
  const [saveDepositAmount, setSaveDepositAmount] = useState('500')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Modals
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  // Send Money form state
  const [recipient, setRecipient] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendMemo, setSendMemo] = useState('')
  const [sendSuccess, setSendSuccess] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter
      const matchesSearch =
        tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.titleMm.includes(searchQuery) ||
        tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.refId.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [categoryFilter, searchQuery])

  const handleCopyId = () => {
    navigator.clipboard?.writeText(profile.petharId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2500)
  }

  const handleExecuteSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !sendAmount) return
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setSendSuccess(true)
      setTimeout(() => {
        setSendSuccess(false)
        setSendModalOpen(false)
        setRecipient('')
        setSendAmount('')
        setSendMemo('')
      }, 1600)
    }, 600)
  }

  const toggleSubscription = (key: string) => {
    setSubscriptionStates(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const quickContacts = contacts.slice(0, 5)

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8FAFC] text-slate-900 selection:bg-amber-500/20 selection:text-slate-900">
      
      {/* ── TOP INSTITUTIONAL COMMAND BAR (DNA Payments & SxDx Bank Inspired) ── */}
      <header className="sticky top-0 z-30 h-[72px] bg-white/95 backdrop-blur-2xl border-b border-slate-200/90 px-4 lg:px-8 flex items-center justify-between shadow-2xs">
        {/* Brand & Portal Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('overview')}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-sm group-hover:scale-110 transition-transform" />
              <ArakanEmblem size={36} variant="badge" className="relative drop-shadow-2xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                  {lang === 'ak' ? 'ဖေ့သာ ဗဟိုဘဏ်စနစ်' : 'PeThar Web Banking'}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  TIER 2 VERIFIED
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono hidden sm:block">
                {lang === 'ak' ? 'အာရက္ခ ဗဟိုဒစ်ဂျစ်တယ် စာရင်းစနစ် · 1:1 USDT Parity' : 'Arakan Double-Entry Core · Cryptographic Enclave Active'}
              </p>
            </div>
          </div>
        </div>

        {/* Live FX Ticker Strip (Desktop) */}
        <div className="hidden xl:flex items-center gap-3.5 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            1 AKD = 1.00 USD
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">THB {liveFxRates.find(r => r.pair.includes('THB'))?.rate}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">USDT 1.00</span>
          <span className="text-slate-300">|</span>
          <span className="text-amber-800 font-semibold flex items-center gap-1">
            <ShieldCheck size={13} className="text-amber-600" />
            100% Backed Reserves
          </span>
        </div>

        {/* Action Controls: Language, Notifications, Return to Website */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DNA Payments "+ New payment link" Style Primary Button */}
          <button
            onClick={() => setSendModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>{lang === 'ak' ? 'ငွေလွှဲအသစ်' : 'New Transfer'}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setLang('ak')}
              className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
                lang === 'ak'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="ရခိုင်ဘာသာ (/ak)"
              aria-label="ရခိုင်ဘာသာ"
            >
              <FlagArakan size={15} />
            </button>
            <button
              onClick={() => setLang('en')}
              className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
                lang === 'en'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="English (/en)"
              aria-label="English"
            >
              <FlagInternational size={15} />
            </button>
          </div>

          {/* Notifications */}
          <button
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-600 relative transition-all"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* User Mini Avatar */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              JH
            </div>
          </div>

          {/* Exit / Return to Public Website */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-all active:scale-[0.98]"
            title="Return to Public Website"
          >
            <LogOut size={13} className="text-slate-500" />
            <span className="hidden md:inline">{lang === 'ak' ? 'ပင်မစာမျက်နှာ' : 'Portal'}</span>
          </button>
        </div>
      </header>

      {/* ── WORKSPACE: SIDEBAR + DASHBOARD CANVAS ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION (DNA Payments / SxDx Bank Inspired) */}
        <aside className="w-64 shrink-0 bg-white border-r border-slate-200 hidden lg:flex flex-col justify-between p-4 shadow-2xs">
          <div className="space-y-4">
            
            {/* User Profile Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
                  {profile.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="font-extrabold text-sm text-slate-900 truncate">{profile.name}</div>
                  <div className="text-[11px] font-mono text-slate-500 truncate flex items-center gap-1">
                    <span>{profile.petharId}</span>
                    <button
                      onClick={handleCopyId}
                      className="hover:text-amber-600 transition-colors p-0.5"
                      title="Copy PeThar ID"
                    >
                      {copiedId ? <CheckCircle size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck size={12} /> {t.tierVerified}
                </span>
                <span className="text-slate-400 font-medium">{profile.location}</span>
              </div>
            </div>

            {/* Sidebar Navigation Section 1: Payment Services */}
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                {lang === 'ak' ? 'ငွေပေးချေမှု ဝန်ဆောင်မှုများ' : 'Payment Services'}
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'overview' as TabType, label: lang === 'ak' ? 'ပင်မ အကျဉ်းချုပ်' : 'Overview', icon: LayoutDashboard },
                  { id: 'pos' as TabType, label: lang === 'ak' ? 'Arakan QR & POS' : 'POS & QR Payments', icon: QrCode },
                  { id: 'transfers' as TabType, label: lang === 'ak' ? 'ငွေလွှဲနှင့် စာရင်း' : 'Transfers & Ledger', icon: History },
                  { id: 'remittance' as TabType, label: lang === 'ak' ? 'နိုင်ငံတကာငွေလွှဲ / FX' : 'Global Wire & FX', icon: Globe },
                  { id: 'cards' as TabType, label: lang === 'ak' ? 'ဒစ်ဂျစ်တယ်ကတ်များ' : 'Virtual Cards', icon: CreditCard },
                ].map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-slate-400" />}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Sidebar Navigation Section 2: Business & Institution */}
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                {lang === 'ak' ? 'ဘဏ္ဍာတိုက်နှင့် လုံခြုံရေး' : 'Institutional'}
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'reserves' as TabType, label: lang === 'ak' ? 'အာမခံဘဏ္ဍာတိုက်' : 'Proof of Reserves', icon: Coins },
                  { id: 'settings' as TabType, label: lang === 'ak' ? 'လုံခြုံရေး ဆက်တင်' : 'Security & Controls', icon: Lock },
                ].map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-slate-400" />}
                    </button>
                  )
                })}
              </nav>
            </div>

          </div>

          {/* SxDx Bank Inspired Bottom Help Center Widget with Gradient Glow */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-pink-500 text-white text-xs relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white mb-2">
              ?
            </div>
            <div className="font-extrabold text-sm">Help Center</div>
            <p className="text-[11px] text-white/80 mt-1 leading-snug">
              Having trouble with payments or offline sync?
            </p>
            <a
              href="https://t.me/petharsupport"
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-center py-1.5 rounded-xl bg-white text-slate-900 font-bold text-[11px] shadow-xs hover:bg-slate-50 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* ════ TAB 1: OVERVIEW (DNA PAYMENTS + SXDX BANK MASTERPIECE) ════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-[1400px] mx-auto">
              
              {/* DNA Payments Header Bar: "Overview", Sub-tabs "POS payments" / "Online payments", and Date Range */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans">
                      {lang === 'ak' ? 'အကျဉ်းချုပ် ခြုံငုံသုံးသပ်ချက်' : 'Overview'}
                    </h1>
                    <span className="text-xs text-emerald-700 font-mono font-bold cursor-pointer hover:underline">
                      See detail reports
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Welcome to PeThar. Real-time settlement rails & institutional liquidity.
                  </p>
                </div>

                {/* Sub-Tabs: POS payments / Online payments + Date Range Filter */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold font-mono">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className="px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-2xs"
                    >
                      Online payments
                    </button>
                    <button
                      onClick={() => setActiveTab('pos')}
                      className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900"
                    >
                      POS payments
                    </button>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-2xs flex items-center gap-2">
                    <span>This month</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-medium">Oct 1 - Oct 31, 2026</span>
                  </div>
                </div>
              </div>

              {/* 4 DNA PAYMENTS STAT METRICS (Charged, Pending, Rejected, Refunds) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Charged / Received */}
                <div className="dna-card p-5">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
                    <span className="font-bold">Charged</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                      ↑ 100%
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
                    ₳ 14,850.00
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Transactions: 1,234
                  </div>
                </div>

                {/* Metric 2: Pending */}
                <div className="dna-card p-5">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
                    <span className="font-bold">Pending</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                      ↑ 100%
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
                    ₳ 350.00
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Transactions: 4
                  </div>
                </div>

                {/* Metric 3: Rejected */}
                <div className="dna-card p-5">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
                    <span className="font-bold">Rejected</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      0%
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
                    ₳ 0.00
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Transactions: 0
                  </div>
                </div>

                {/* Metric 4: Refunds */}
                <div className="dna-card p-5">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
                    <span className="font-bold">Refunds</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                      ↓ 45%
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
                    ₳ 45.00
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Transactions: 1
                  </div>
                </div>

              </div>

              {/* ── ROW 1.5: NOVERA QUICK TRANSFERS & CENTRALPAY SAVES TRACKER ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 7 Columns: CentralPay Savings & Gold Reserve Tracker */}
                <div className="lg:col-span-7 dna-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Saves & Goals</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          CentralPay Vault Active
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-slate-500">
                          On Saves: <strong className="text-slate-900">₳ {(goldBalance + emergencyBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">
                          Free: <strong className="text-emerald-700">₳ 3,176.21</strong>
                        </span>
                      </div>
                    </div>

                    {/* Dual Progress Bars for Treasury Gold Backing & Reserve Goal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Save 1: Treasury Gold Backing */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-200/90 shadow-2xs">
                        <div className="flex items-center justify-between text-xs font-mono mb-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Treasury Gold Backing
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            {Math.round((goldBalance / 15000) * 100)}%
                          </span>
                        </div>
                        <div className="text-xl font-black font-mono text-slate-900">
                          ₳ {goldBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          <span className="text-xs text-slate-400 font-normal"> / ₳ 15k</span>
                        </div>
                        <div className="w-full bg-amber-100/70 rounded-full h-2 mt-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (goldBalance / 15000) * 100)}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>Return: <strong className="text-emerald-600">+22.4% APY</strong></span>
                          <span>24K Bullion</span>
                        </div>
                      </div>

                      {/* Save 2: Reserve & Emergency Goal */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50/80 to-white border border-cyan-200/90 shadow-2xs">
                        <div className="flex items-center justify-between text-xs font-mono mb-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-500" />
                            Reserve & Liquidity
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900">
                            {Math.round((emergencyBalance / 10000) * 100)}%
                          </span>
                        </div>
                        <div className="text-xl font-black font-mono text-slate-900">
                          ₳ {emergencyBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          <span className="text-xs text-slate-400 font-normal"> / ₳ 10k</span>
                        </div>
                        <div className="w-full bg-cyan-100/70 rounded-full h-2 mt-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (emergencyBalance / 10000) * 100)}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>Yield: <strong className="text-emerald-600">4.34% APY</strong></span>
                          <span>1:1 USDT Peg</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Actions for CentralPay Saves */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSaveModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono transition-all shadow-2xs flex items-center gap-1.5"
                    >
                      <Plus size={13} className="stroke-[3]" />
                      <span>Add New Save</span>
                    </button>
                    <span className="text-[11px] font-mono text-slate-400">
                      Auto-allocation active · Next audit in 14 days
                    </span>
                  </div>
                </div>

                {/* Right 5 Columns: Novera Quick Transfer Contact Circles */}
                <div className="lg:col-span-5 dna-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="font-bold text-sm text-slate-900">Quick Transfers</h2>
                        <p className="text-[11px] font-mono text-slate-400">1-click P2P transfer to trusted contacts</p>
                      </div>
                      <span className="text-xs font-mono text-amber-700 font-bold">0% Fee</span>
                    </div>

                    {/* Horizontal Avatar Circles (Novera style) */}
                    <div className="grid grid-cols-5 gap-2.5 py-2">
                      {quickContacts.slice(0, 4).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setRecipient(c.name)
                            setSendAmount('50.00')
                            setSendModalOpen(true)
                          }}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-all group text-center cursor-pointer"
                        >
                          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform ring-2 ring-transparent group-hover:ring-amber-400">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 truncate w-full">
                            {c.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}

                      {/* Add New Contact Button */}
                      <button
                        onClick={() => {
                          setRecipient('')
                          setSendAmount('')
                          setSendModalOpen(true)
                        }}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-all text-center cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-full border-2 border-dashed border-slate-300 text-slate-400 flex items-center justify-center text-xs hover:border-amber-400 hover:text-amber-600 transition-colors">
                          <Plus size={16} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">
                          Add
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Recent: Ko Min Aung (5m ago)</span>
                    <button
                      onClick={() => setActiveTab('transfers')}
                      className="font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      View All →
                    </button>
                  </div>
                </div>

              </div>

              {/* ── ROW 2: LAYERED MULTI-CARD STACK + SXDX TRANSACTIONS WITH TOGGLES ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 6 Columns: Novera Layered 3D Multi-Card Stack */}
                <div className="lg:col-span-6 dna-card p-6 flex flex-col justify-between">
                  <div>
                    {/* Header: Title + Card Selector Tabs */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Virtual Cards Stack</span>
                        <span className="text-[11px] text-slate-400 font-mono">• 3 Active</span>
                      </div>
                      
                      {/* Card Switcher Tabs */}
                      <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono font-bold">
                        <button
                          onClick={() => setActiveCardIndex(0)}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            activeCardIndex === 0 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Visa Debit
                        </button>
                        <button
                          onClick={() => setActiveCardIndex(1)}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            activeCardIndex === 1 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Gold Bullion
                        </button>
                        <button
                          onClick={() => setActiveCardIndex(2)}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            activeCardIndex === 2 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Citizen Node
                        </button>
                      </div>
                    </div>

                    {/* Novera-Style Layered Visualizer: Background Peeking Card Tops */}
                    <div className="relative pt-6">
                      
                      {/* Layer 2 (Back peeking top tab - Cyan) */}
                      <div className="absolute top-0 left-6 right-6 h-12 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 opacity-60 shadow-xs transform -translate-y-2" />
                      
                      {/* Layer 1 (Middle peeking top tab - Amber Gold) */}
                      <div className="absolute top-2 left-3 right-3 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 opacity-80 shadow-xs transform -translate-y-1" />

                      {/* Foreground Active Card */}
                      {activeCardIndex === 0 && (
                        <div className="sxdx-credit-card rounded-2xl p-6 text-white shadow-xl relative min-h-[200px] flex flex-col justify-between z-10 transition-all">
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-200 to-amber-400 border border-amber-300 shadow-inner flex items-center justify-center">
                                <div className="w-6 h-4 border border-amber-600/50 rounded-xs" />
                              </div>
                              <Radio size={18} className="text-white/90 rotate-90" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold tracking-widest text-white/90 uppercase">PeThar Debit</span>
                              <ArakanEmblem size={24} variant="badge" />
                            </div>
                          </div>

                          <div className="font-mono text-lg sm:text-xl font-black tracking-widest text-white/95 drop-shadow-sm my-4">
                            3829 4820 4629 5025
                          </div>

                          <div className="flex items-end justify-between text-xs relative z-10 font-mono">
                            <div>
                              <div className="text-[9px] text-white/70 uppercase">CARD HOLDER NAME</div>
                              <div className="font-bold tracking-wider uppercase text-sm">JACK HALDER</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] text-white/70 uppercase">VALID THRU</div>
                              <div className="font-bold tracking-wider">09/28</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeCardIndex === 1 && (
                        <div className="bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 rounded-2xl p-6 text-slate-950 shadow-xl relative min-h-[200px] flex flex-col justify-between z-10 transition-all">
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-7 rounded-md bg-white/70 border border-amber-800/40 shadow-inner flex items-center justify-center">
                                <div className="w-6 h-4 border border-amber-900/60 rounded-xs" />
                              </div>
                              <Radio size={18} className="text-slate-900 rotate-90" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black tracking-widest uppercase text-slate-950">24K Bullion Vault</span>
                              <ArakanEmblem size={24} variant="badge" />
                            </div>
                          </div>

                          <div className="font-mono text-lg sm:text-xl font-black tracking-widest text-slate-950 drop-shadow-xs my-4">
                            5241 8901 3341 9012
                          </div>

                          <div className="flex items-end justify-between text-xs relative z-10 font-mono text-slate-950">
                            <div>
                              <div className="text-[9px] opacity-75 uppercase font-bold">CARD HOLDER & TIER</div>
                              <div className="font-black tracking-wider uppercase text-sm">JACK HALDER • GOLD</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] opacity-75 uppercase font-bold">VALID THRU</div>
                              <div className="font-black tracking-wider">12/30</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeCardIndex === 2 && (
                        <div className="bg-gradient-to-tr from-cyan-700 via-teal-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl relative min-h-[200px] flex flex-col justify-between z-10 transition-all">
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-200 to-amber-400 border border-amber-300 shadow-inner flex items-center justify-center">
                                <div className="w-6 h-4 border border-amber-600/50 rounded-xs" />
                              </div>
                              <Radio size={18} className="text-white/90 rotate-90" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold tracking-widest text-white/90 uppercase">National Node</span>
                              <ArakanEmblem size={24} variant="badge" />
                            </div>
                          </div>

                          <div className="font-mono text-lg sm:text-xl font-black tracking-widest text-white/95 drop-shadow-sm my-4">
                            4912 6023 7712 4432
                          </div>

                          <div className="flex items-end justify-between text-xs relative z-10 font-mono">
                            <div>
                              <div className="text-[9px] text-white/70 uppercase">CARD HOLDER & NODE</div>
                              <div className="font-bold tracking-wider uppercase text-sm">JACK HALDER • SITTWE</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] text-white/70 uppercase">VALID THRU</div>
                              <div className="font-bold tracking-wider">06/29</div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Internet Payment Limit Bar & Slider (SxDx Bank) */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-slate-500 font-bold">Monthly Spending Ceiling</span>
                        <span className="font-bold text-slate-900">${paymentLimit} / $5,000</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="5000"
                        step="100"
                        value={paymentLimit}
                        onChange={(e) => setPaymentLimit(Number(e.target.value))}
                        className="w-full accent-fuchsia-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Quick Card Controls */}
                  <div className="mt-5 pt-3 flex items-center justify-between">
                    <button
                      onClick={() => alert('New virtual card created!')}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-mono transition-all shadow-2xs"
                    >
                      + Create New Card
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">
                        Balance:
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {balanceVisible ? '₳ 14,850.00' : '••••••••'}
                      </span>
                      <button
                        onClick={() => setBalanceVisible(!balanceVisible)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        {balanceVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right 6 Columns: SxDx Bank "All Transactions / Subscriptions" Widget with Toggles */}
                <div className="lg:col-span-6 dna-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-bold text-sm text-slate-900">All Transactions</h2>
                        <span className="text-[11px] font-mono text-slate-400">This Week Summary</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                          <ChevronRight size={14} className="rotate-180" />
                        </button>
                        <button className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Weekly Balance Metric (SxDx Bank style) */}
                    <div className="flex items-baseline justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                      <div>
                        <div className="text-xs font-mono text-slate-400">Weekly Total</div>
                        <div className="text-2xl font-black font-mono text-slate-900">
                          ₳ 113,650 <span className="text-xs font-normal text-slate-400">AKD</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono font-bold">
                        <span className="text-emerald-600">↑ 24,000 AKD</span>
                        <span className="text-red-500">↓ 5,324 AKD</span>
                      </div>
                    </div>

                    {/* Subscription & Recurring Items with Switches (SxDx Bank style) */}
                    <div className="space-y-2.5">
                      {/* Subscription 1: Starlink Satellite */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                            SL
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">Starlink Satellite Data</div>
                            <div className="text-[10px] text-slate-400 font-mono">Monthly Subscription</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-xs text-slate-900">-45.00 AKD</span>
                          <button
                            type="button"
                            onClick={() => toggleSubscription('starlink')}
                            className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
                              subscriptionStates.starlink ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          >
                            <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                              subscriptionStates.starlink ? 'translate-x-4' : ''
                            }`} />
                          </button>
                        </div>
                      </div>

                      {/* Subscription 2: YouTube Creator Payout */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                            YT
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">Youtube Payout</div>
                            <div className="text-[10px] text-slate-400 font-mono">Content Creator Remittance</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-xs text-emerald-600">+210.00 AKD</span>
                          <button
                            type="button"
                            onClick={() => toggleSubscription('youtube')}
                            className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
                              subscriptionStates.youtube ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          >
                            <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                              subscriptionStates.youtube ? 'translate-x-4' : ''
                            }`} />
                          </button>
                        </div>
                      </div>

                      {/* Subscription 3: College Fee / Tuition */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                            ED
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">Sittwe College Fee</div>
                            <div className="text-[10px] text-slate-400 font-mono">Academic Tuition</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-xs text-slate-900">-120.00 AKD</span>
                          <button
                            type="button"
                            onClick={() => toggleSubscription('fee')}
                            className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
                              subscriptionStates.fee ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          >
                            <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                              subscriptionStates.fee ? 'translate-x-4' : ''
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                    <button
                      onClick={() => setActiveTab('transfers')}
                      className="text-xs font-mono font-bold text-amber-600 hover:text-amber-700"
                    >
                      See All Transactions →
                    </button>
                  </div>
                </div>

              </div>

              {/* ── ROW 3: DNA PAYMENTS TRANSACTION COMPARISON BAR CHARTS ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 8 Cols: Charged Transactions Comparison Chart */}
                <div className="lg:col-span-8 dna-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-bold text-sm text-slate-900">Charged transactions comparison</h2>
                      <div className="text-[11px] font-mono text-slate-400">Feb 1 - Feb 28, 2026</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center p-0.5 rounded-lg bg-slate-100 text-xs font-mono font-bold">
                        <button
                          onClick={() => setChartMetric('amount')}
                          className={`px-3 py-1 rounded-md transition-all ${
                            chartMetric === 'amount' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Amount
                        </button>
                        <button
                          onClick={() => setChartMetric('count')}
                          className={`px-3 py-1 rounded-md transition-all ${
                            chartMetric === 'count' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Count
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* DNA Payments Styled Clean Bar Chart */}
                  <div className="h-44 w-full flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 border-b border-slate-100">
                    {[
                      { day: 1, val: 25 }, { day: 2, val: 40 }, { day: 3, val: 80 }, { day: 4, val: 35 },
                      { day: 5, val: 90 }, { day: 6, val: 45 }, { day: 7, val: 15 }, { day: 8, val: 60 },
                      { day: 9, val: 75 }, { day: 10, val: 40 }, { day: 11, val: 30 }, { day: 12, val: 85 },
                      { day: 13, val: 65 }, { day: 14, val: 100 }, { day: 15, val: 70 }, { day: 16, val: 75 },
                      { day: 17, val: 45 }, { day: 18, val: 50 }, { day: 19, val: 85 }, { day: 20, val: 30 },
                      { day: 21, val: 95 }, { day: 22, val: 60 }, { day: 23, val: 20 }, { day: 24, val: 70 },
                      { day: 25, val: 40 }, { day: 26, val: 15 }, { day: 27, val: 35 }, { day: 28, val: 50 }
                    ].map((item) => (
                      <div key={item.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className="w-full rounded-t-xs bg-emerald-500/80 group-hover:bg-emerald-600 transition-all"
                          style={{ height: `${item.val}%` }}
                        />
                        <span className="text-[8px] font-mono text-slate-400 hidden sm:block">
                          {item.day % 2 === 0 ? item.day : ''}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                        Current Period
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                        Previous Month
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">Total: ₳ 14,850.00 AKD</span>
                  </div>
                </div>

                {/* Right 4 Cols: DNA Payments Average Metrics + How It Works Banner */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Average Metrics Block */}
                  <div className="dna-card p-6">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3">
                      <span className="font-bold">Average metrics</span>
                      <span className="text-slate-400">ⓘ</span>
                    </div>

                    <div className="space-y-3 font-mono">
                      <div className="flex items-baseline justify-between">
                        <div className="text-xl font-black text-slate-900">₳ 500</div>
                        <div className="text-xs text-slate-500">Transactions value</div>
                      </div>
                      <div className="flex items-baseline justify-between border-t border-slate-100 pt-2">
                        <div className="text-xl font-black text-slate-900">₳ 1,500</div>
                        <div className="text-xs text-slate-500">Daily value</div>
                      </div>
                      <div className="flex items-baseline justify-between border-t border-slate-100 pt-2">
                        <div className="text-xl font-black text-slate-900">10</div>
                        <div className="text-xs text-slate-500">Transactions per day</div>
                      </div>
                    </div>
                  </div>

                  {/* DNA Payments "How it works?" Accent Card */}
                  <div className="dna-card p-6 bg-gradient-to-br from-amber-50 to-white border-amber-200 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 mb-1">
                      Payment Links
                    </div>
                    <h3 className="font-extrabold text-lg text-slate-900">How it works?</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      An online payment system, integrated directly to your website and physical point of sale.
                    </p>
                    <button
                      onClick={() => setActiveTab('pos')}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold font-mono text-amber-800 hover:text-amber-900"
                    >
                      <span>Explore Merchant POS</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>

              </div>

              {/* ── ROW 4: SXDX RECENT TRANSACTIONS + PAYMENT DETAILS INSPECTOR ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 8 Cols: Transaction Ledger List */}
                <div className="lg:col-span-8 dna-card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="font-bold text-sm text-slate-900">Recent Transactions</h2>
                      <p className="text-[11px] font-mono text-slate-400">Click a record to view details</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search..."
                          className="pl-7 pr-3 py-1 rounded-lg border border-slate-200 text-xs font-mono outline-none focus:border-amber-400 w-36 sm:w-44"
                        />
                      </div>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono outline-none"
                      >
                        <option value="all">All</option>
                        <option value="p2p">P2P</option>
                        <option value="crypto">USDT</option>
                        <option value="pos">POS</option>
                        <option value="remittance">Wire</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filteredTransactions.map((tx) => {
                      const isCredit = tx.amount > 0
                      const isSelected = selectedTx?.id === tx.id
                      return (
                        <div
                          key={tx.id}
                          onClick={() => setSelectedTx(tx)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                            isSelected
                              ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                              : 'bg-white hover:bg-slate-50 border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isCredit ? '↓' : '↑'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {lang === 'ak' ? tx.titleMm : tx.title}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {tx.counterparty} • {tx.time}
                              </div>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <div className={`font-bold ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {isCredit ? '+' : ''}{tx.amount.toFixed(2)} AKD
                            </div>
                            <div className="text-[10px] text-slate-400">{tx.status}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Right 4 Cols: SxDx Bank "Payment Details" Inspector */}
                <div className="lg:col-span-4 dna-card p-6 flex flex-col justify-between">
                  {selectedTx ? (
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                        <h3 className="font-bold text-sm text-slate-900">Payment Details</h3>
                        <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {selectedTx.status}
                        </span>
                      </div>

                      <div className="text-center py-3">
                        <div className="text-3xl font-black font-mono text-slate-900">
                          {selectedTx.amount > 0 ? '+' : ''}{selectedTx.amount.toFixed(2)} AKD
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          ≈ ${Math.abs(selectedTx.amount).toFixed(2)} USD
                        </div>
                      </div>

                      <div className="space-y-3 font-mono text-xs pt-3 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-400">From / Counterparty:</span>
                          <span className="font-bold text-slate-800 text-right truncate max-w-[170px]">
                            {selectedTx.counterparty}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Reference:</span>
                          <span className="font-bold text-slate-800">{selectedTx.refId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Channel / Type:</span>
                          <span className="font-bold uppercase text-slate-800">{selectedTx.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Timestamp:</span>
                          <span className="text-slate-800">{selectedTx.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Transaction Fee:</span>
                          <span className="text-emerald-600 font-bold">0.00 AKD (0%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Hash:</span>
                          <span className="text-slate-500 text-[11px] font-bold">{selectedTx.hash}</span>
                        </div>
                      </div>

                      {/* SxDx 3 Action Buttons: Manage, Invoice, Add as Recipient */}
                      <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => alert(`Managing transaction ${selectedTx.id}`)}
                          className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors text-center"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => alert(`Downloading formal receipt for ${selectedTx.refId}`)}
                          className="py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors text-center flex items-center justify-center gap-1"
                        >
                          <Download size={12} />
                          <span>Invoice</span>
                        </button>
                        <button
                          onClick={() => alert(`Added ${selectedTx.counterparty} to trusted address book!`)}
                          className="py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] transition-colors text-center font-mono"
                        >
                          Add Contact
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs font-mono">
                      Select a transaction to inspect verification details.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ════ TAB 2: POS & ARAKAN QR PAYMENTS ════ */}
          {activeTab === 'pos' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="dna-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-sans text-slate-900">
                      {lang === 'ak' ? 'Arakan QR (AK QR) ကုန်သည် စနစ်' : 'Arakan QR Merchant Terminal'}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      National standard interoperable QR code for physical POS and mobile merchants
                    </p>
                  </div>
                  <QrCode size={32} className="text-amber-500" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                    <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                      <QrCode size={150} className="text-slate-900" />
                    </div>
                    <div className="font-mono text-xs font-bold text-slate-800">
                      Merchant ID: POS-SITTWE-004
                    </div>
                    <button
                      onClick={() => alert('Arakan QR standard payload copied')}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono"
                    >
                      Export AK QR Code
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-mono text-slate-600">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="font-bold text-emerald-900">Zero Transaction Surcharge</div>
                      <p className="text-emerald-800 mt-0.5">Merchants receive 100% of the transacted value in real time.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-900">Offline BLE Mesh Fallback</div>
                      <p className="text-slate-500 mt-0.5">Accept payments without internet during telecom outages.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ TAB 3: TRANSFERS & LEDGER ════ */}
          {activeTab === 'transfers' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="dna-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-sans text-slate-900">
                      {lang === 'ak' ? 'အာရက္ခဒေါ်လာ တိုက်ရိုက်ငွေလွှဲခြင်း' : 'Direct Arakan Dollar Transfer'}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Zero fee · Settles within 250ms via Arakan Double-Entry Core
                    </p>
                  </div>
                  <ArakanEmblem size={36} variant="badge" />
                </div>

                {/* Quick Avatar Row */}
                <div className="mb-6">
                  <div className="text-xs font-mono font-bold text-slate-400 mb-2 uppercase">Recent Contacts</div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {quickContacts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setRecipient(c.id)}
                        className="flex flex-col items-center group shrink-0"
                      >
                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-amber-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800 group-hover:text-amber-900 transition-all">
                          {c.initials}
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 mt-1 truncate max-w-[65px]">{c.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleExecuteSend} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                      {lang === 'ak' ? 'လက်ခံသူ ဖုန်းနံပါတ် သို့မဟုတ် PeThar ID' : 'Recipient Phone Number or PeThar ID'}
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. ARAK-8891 or +959..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono outline-none focus:border-amber-400 text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                      {lang === 'ak' ? 'ငွေပမာဏ (AKD)' : 'Amount (AKD)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-16 py-3 rounded-xl border border-slate-200 bg-slate-50 text-base font-mono font-bold outline-none focus:border-amber-400 text-slate-900"
                        required
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₳</span>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 font-bold">AKD</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                      {lang === 'ak' ? 'မှတ်ချက် / ရည်ရွယ်ချက်' : 'Payment Memo / Note'}
                    </label>
                    <input
                      type="text"
                      value={sendMemo}
                      onChange={(e) => setSendMemo(e.target.value)}
                      placeholder="e.g. Rice supplies or family remittance"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-amber-400 text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3.5 rounded-xl font-bold text-xs font-mono bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    {isSending ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={15} />
                        <span>{lang === 'ak' ? 'ငွေလွှဲ အတည်ပြုမည်' : 'Authorize & Settle Transfer'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ════ TAB 4: GLOBAL WIRE & FX ════ */}
          {activeTab === 'remittance' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="dna-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-sans text-slate-900">
                      {lang === 'ak' ? 'တရားဝင် ငွေလဲလှယ်နှုန်းများနှင့် နိုင်ငံတကာငွေလွှဲ' : 'Official Arakan FX Rates & Global Wire'}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Direct border corridors: Thailand (THB), Malaysia (MYR), Singapore (SGD)
                    </p>
                  </div>
                  <Globe size={32} className="text-amber-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveFxRates.map((fx) => (
                    <div key={fx.pair} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-sm text-slate-900">{fx.pair}</div>
                        <div className="text-xs text-slate-500">{lang === 'ak' ? fx.nameMm : fx.name}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-base font-black text-slate-900">{fx.rate}</div>
                        <div className={`text-xs font-bold ${fx.trend === 'up' ? 'text-emerald-600' : fx.trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                          {fx.change24h}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ TAB 5: VIRTUAL & PHYSICAL CARDS ════ */}
          {activeTab === 'cards' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="dna-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-sans text-slate-900">
                      {lang === 'ak' ? 'ဒစ်ဂျစ်တယ်နှင့် ရုပ်ပိုင်းဆိုင်ရာ ကတ်များ' : 'Virtual & Physical Cards'}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Contactless NFC payments, online subscriptions & ATM withdrawals
                    </p>
                  </div>
                  <CreditCard size={32} className="text-amber-500" />
                </div>

                <div className="sxdx-credit-card rounded-2xl p-6 text-white max-w-md mx-auto shadow-xl relative min-h-[220px] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base tracking-wider">PeThar Platinum</span>
                    <Radio size={20} className="rotate-90 text-white/80" />
                  </div>
                  <div className="font-mono text-xl tracking-widest font-bold my-4">
                    3829 4820 4629 5025
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <div>
                      <div className="text-[9px] text-white/70">CARD HOLDER</div>
                      <div className="font-bold uppercase">JACK HALDER</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-white/70">EXPIRES</div>
                      <div className="font-bold">09/28</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ TAB 6: PROOF OF RESERVES ════ */}
          {activeTab === 'reserves' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="dna-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-sans text-slate-900">
                      {lang === 'ak' ? 'အရန်ငွေကြေး သက်သေပြချက် (Proof of Reserves)' : 'Cryptographic Proof of Reserves'}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      105.0% verified backing in USDT & physical gold reserves
                    </p>
                  </div>
                  <Coins size={32} className="text-amber-500" />
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={24} className="text-emerald-600" />
                      <div>
                        <div className="font-bold text-sm text-slate-900">1:1 USDT Treasury Safe</div>
                        <div className="text-xs text-slate-500">Audited via Merkle Tree proof on-chain</div>
                      </div>
                    </div>
                    <span className="font-mono font-black text-emerald-700 text-lg">105.0% BACKED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ TAB 7: SECURITY & SETTINGS ════ */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="dna-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-sans text-slate-900">
                      {lang === 'ak' ? 'လုံခြုံရေးနှင့် စာရင်း ဆက်တင်များ' : 'Security, Hardware Enclave & Profile'}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Biometric authorization, emergency duress PIN, and connected devices
                    </p>
                  </div>
                  <Lock size={32} className="text-amber-500" />
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Ed25519 Secure Enclave</span>
                      <span className="text-slate-500 text-[11px]">Hardware-bound private key</span>
                    </div>
                    <span className="text-emerald-600 font-bold">Active</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Duress Panic PIN</span>
                      <span className="text-slate-500 text-[11px]">Decoy $25 balance mode (PIN: 999999)</span>
                    </div>
                    <span className="text-amber-600 font-bold">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── ACTION MODALS ── */}
      {/* 1. SEND MONEY MODAL */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {lang === 'ak' ? 'ငွေလွှဲမည်' : 'Send Money (AKD)'}
              </h3>
              <button onClick={() => setSendModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            {sendSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check size={28} />
                </div>
                <div className="font-bold text-base text-slate-900">Transfer Completed!</div>
                <p className="text-xs text-slate-500 font-mono">
                  Settled instantly on the Arakan Central Double-Entry Ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecuteSend} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-1">RECIPIENT</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="PeThar ID or Phone"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono outline-none focus:border-amber-400 text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-1">AMOUNT (AKD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base font-mono font-bold outline-none focus:border-amber-400 text-slate-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono transition-all"
                >
                  {isSending ? 'Sending...' : 'Confirm Transfer'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. RECEIVE QR MODAL */}
      {receiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Your Arakan QR Code</h3>
              <button onClick={() => setReceiveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="w-52 h-52 mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner">
              <QrCode size={160} className="text-slate-900" />
            </div>

            <div className="font-mono text-xs font-bold text-slate-800 bg-slate-100 py-2 rounded-xl">
              {profile.petharId}
            </div>

            <button
              onClick={handleCopyId}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all font-mono"
            >
              {copiedId ? 'Copied to Clipboard!' : 'Copy PeThar ID'}
            </button>
          </div>
        </div>
      )}

      {/* 3. DEPOSIT USDT MODAL */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Deposit USDT (1:1 AKD)</h3>
              <button onClick={() => setDepositModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800">
              1 USDT = 1.00 AKD with zero slippage. Settled automatically upon 12 network confirmations.
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">TRC-20 DEPOSIT ADDRESS</label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs break-all text-slate-800">
                TQ7B3qKz5VwP9Lm2Nx8Ry1Z4Aa7Jc9Ee2F
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard?.writeText('TQ7B3qKz5VwP9Lm2Nx8Ry1Z4Aa7Jc9Ee2F')
                alert('USDT Address copied!')
              }}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm font-mono"
            >
              Copy TRC-20 Address
            </button>
          </div>
        </div>
      )}

      {/* 4. CENTRALPAY SAVE DEPOSIT MODAL */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {lang === 'ak' ? 'စုငွေ အသစ်ထည့်မည်' : 'Add New Save Deposit'}
              </h3>
              <button onClick={() => setSaveModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            {saveSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <div className="font-bold text-slate-900">Deposit Allocated!</div>
                <p className="text-xs text-slate-500 font-mono">
                  Your funds are now generating collateralized yield in the Arakan Vault.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const amt = parseFloat(saveDepositAmount) || 0
                  if (amt <= 0) return
                  if (saveTarget === 'gold') {
                    setGoldBalance(prev => prev + amt)
                  } else {
                    setEmergencyBalance(prev => prev + amt)
                  }
                  setSaveSuccess(true)
                  setTimeout(() => {
                    setSaveSuccess(false)
                    setSaveModalOpen(false)
                    setSaveDepositAmount('500')
                  }, 1200)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-1">SELECT SAVINGS VAULT</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSaveTarget('gold')}
                      className={`p-3 rounded-xl border text-xs font-bold font-mono transition-all text-left cursor-pointer ${
                        saveTarget === 'gold'
                          ? 'border-amber-400 bg-amber-50 text-amber-950 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Treasury Gold</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">24K Bullion (+22% APY)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaveTarget('emergency')}
                      className={`p-3 rounded-xl border text-xs font-bold font-mono transition-all text-left cursor-pointer ${
                        saveTarget === 'emergency'
                          ? 'border-cyan-400 bg-cyan-50 text-cyan-950 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span>Reserve Fund</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">1:1 USDT (4.34% APY)</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-1">AMOUNT TO DEPOSIT (AKD)</label>
                  <input
                    type="number"
                    step="10"
                    value={saveDepositAmount}
                    onChange={(e) => setSaveDepositAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-lg font-mono font-bold outline-none focus:border-amber-400 text-slate-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white font-mono transition-all shadow-xs cursor-pointer"
                >
                  Deposit to Vault
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default WebBankingDashboard
