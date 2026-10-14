import React, { useState, useMemo } from 'react'
import {
  ArakanEmblem, FlagArakan, FlagInternational
} from '../components/ArakanEmblem'
import {
  LayoutDashboard, ArrowUpRight, ArrowDownLeft, Send, QrCode,
  Globe, Coins, ShieldCheck, History, CreditCard,
  Search, Bell, LogOut, CheckCircle,
  Copy, Sparkles, Building2,
  ChevronRight, Lock, Eye, EyeOff, TrendingUp, TrendingDown,
  Plus, Check, SlidersHorizontal, ArrowRight, X,
  Radio, RefreshCw, Zap, Shield, Wallet
} from 'lucide-react'
import {
  transactions, liveFxRates, contacts, initialUserProfile,
  type UserProfile
} from '../data'
import { type Language, translations } from '../i18n'

interface WebBankingDashboardProps {
  lang: Language
  setLang: (lang: Language) => void
  theme?: 'dark' | 'light'
  setTheme?: (theme: 'dark' | 'light') => void
  onExit: () => void
}

type TabType = 'overview' | 'transfers' | 'remittance' | 'cards' | 'reserves' | 'settings'

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

  // Modals & Quick Action States
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [activeCardIndex, setActiveCardIndex] = useState(0)

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

  const quickContacts = contacts.slice(0, 5)

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8FAFC] text-slate-900 selection:bg-amber-500/20 selection:text-slate-900">
      
      {/* ── TOP INSTITUTIONAL COMMAND BAR (DNA Payments & Novera Inspired) ── */}
      <header className="sticky top-0 z-30 h-[70px] bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between shadow-xs">
        {/* Brand & Portal Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setActiveTab('overview')}
          >
            <ArakanEmblem size={34} variant="badge" className="drop-shadow-xs" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  {lang === 'ak' ? 'ဖေ့သာ အွန်လိုင်းဘဏ်' : 'PeThar Web Banking'}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  TIER 2 VERIFIED
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                {lang === 'ak' ? 'အာရက္ခ ဗဟိုဒစ်ဂျစ်တယ် စာရင်းစနစ် · 1:1 USDT Parity' : 'Arakan Central Ledger · Cryptographic Enclave Active'}
              </p>
            </div>
          </div>
        </div>

        {/* Live FX Ticker Strip (Desktop) */}
        <div className="hidden xl:flex items-center gap-3.5 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            1 AKD = 1.00 USD
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">THB {liveFxRates.find(r => r.pair.includes('THB'))?.rate}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">USDT 1.00</span>
          <span className="text-slate-300">|</span>
          <span className="text-amber-700 font-semibold flex items-center gap-1">
            <ShieldCheck size={12} className="text-amber-500" />
            100% Reserve Backed
          </span>
        </div>

        {/* Action Controls: Language, Notifications, Return to Website */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              onClick={() => setLang('ak')}
              className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
                lang === 'ak'
                  ? 'bg-white text-slate-900 shadow-xs'
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
                  ? 'bg-white text-slate-900 shadow-xs'
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
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-600 relative transition-all"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* Exit / Return to Public Website */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-all active:scale-[0.98]"
            title="Return to Public Website"
          >
            <LogOut size={13} className="text-slate-500" />
            <span className="hidden sm:inline">{lang === 'ak' ? 'ပင်မစာမျက်နှာ' : 'Public Website'}</span>
          </button>
        </div>
      </header>

      {/* ── WORKSPACE: SIDEBAR + DASHBOARD CANVAS ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION (DNA Payments / SxDx inspired clean light sidebar) */}
        <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 hidden md:flex flex-col justify-between p-4 shadow-2xs">
          <div className="space-y-4">
            
            {/* User Profile Mini Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-amber-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
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

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {[
                { id: 'overview' as TabType, label: lang === 'ak' ? 'ပင်မဘဏ်စာမျက်နှာ' : 'Account Overview', icon: LayoutDashboard },
                { id: 'transfers' as TabType, label: lang === 'ak' ? 'ငွေစာရင်းနှင့် မှတ်တမ်း' : 'Ledger & Transfers', icon: History },
                { id: 'remittance' as TabType, label: lang === 'ak' ? 'နိုင်ငံတကာငွေလွှဲ / FX' : 'Global Wire & FX', icon: Globe },
                { id: 'cards' as TabType, label: lang === 'ak' ? 'ဒစ်ဂျစ်တယ်ကတ်များ' : 'Cards & Spending', icon: CreditCard },
                { id: 'reserves' as TabType, label: lang === 'ak' ? 'အာမခံဘဏ္ဍာတိုက်' : 'Proof of Reserves', icon: Coins },
                { id: 'settings' as TabType, label: lang === 'ak' ? 'လုံခြုံရေးနှင့် ဆက်တင်' : 'Security & Settings', icon: Lock },
              ].map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-950'
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

          {/* Bottom Security Guarantee */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs">
            <div className="flex items-center gap-1.5 mb-1 text-amber-800 font-mono text-[11px] font-bold">
              <Lock size={12} className="text-amber-600" />
              <span>Ed25519 Enclave Auth</span>
            </div>
            <p className="text-[10px] text-amber-900/80 leading-relaxed font-sans">
              {lang === 'ak'
                ? 'လွှဲပြောင်းမှုတိုင်းကို သီးခြား Cryptographic Enclave ဖြင့် အတည်ပြုထားပါသည်'
                : 'Double-entry cryptographic ledger backed by hardware enclave. Zero telemetry tracking.'}
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* ════ TAB 1: OVERVIEW (NOVERA + DNA PAYMENTS + SXDX MASTER DASHBOARD) ════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              
              {/* Top Greeting & Action Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                    {lang === 'ak' ? 'မင်္ဂလာပါ Jack 👋' : 'Welcome back, Jack 👋'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {lang === 'ak'
                      ? 'ယနေ့ သင်၏ အာရက္ခဒေါ်လာ ဘဏ္ဍာရေးစာရင်း အခြေအနေ ခြုံငုံသုံးသပ်ချက်'
                      : "Here's what's happening across your PeThar accounts today."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSendModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xs flex items-center gap-1.5 active:scale-[0.98] transition-all"
                  >
                    <ArrowUpRight size={14} />
                    <span>{lang === 'ak' ? 'ငွေလွှဲမည်' : 'Send Money'}</span>
                  </button>

                  <button
                    onClick={() => setReceiveModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs flex items-center gap-1.5 active:scale-[0.98] transition-all"
                  >
                    <QrCode size={14} className="text-amber-600" />
                    <span>{lang === 'ak' ? 'လက်ခံ QR' : 'Receive QR'}</span>
                  </button>

                  <button
                    onClick={() => setDepositModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 shadow-2xs flex items-center gap-1.5 active:scale-[0.98] transition-all"
                  >
                    <Coins size={14} className="text-emerald-600" />
                    <span>{lang === 'ak' ? 'USDT သွင်းမည်' : 'Deposit USDT'}</span>
                  </button>
                </div>
              </div>

              {/* ROW 1: CORE FINANCIAL MATRIX (NOVERA & SXDX CARDS) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 7 Columns: Novera-Style Balance & Growth Chart */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-100/40 via-red-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

                  <div>
                    {/* Header with Title and Eye Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                          {t.currencyLabel} (AKD / ₳)
                        </span>
                        <button
                          onClick={() => setBalanceVisible(!balanceVisible)}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                          title={balanceVisible ? 'Hide balance' : 'Show balance'}
                        >
                          {balanceVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                      </div>

                      {/* 12% Month Growth Pill (Novera style) */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <TrendingUp size={13} className="text-emerald-600" />
                        +12.5% vs last month
                      </span>
                    </div>

                    {/* Giant Balance Typography */}
                    <div className="mt-3 flex items-baseline gap-3">
                      <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-950">
                        {balanceVisible ? '₳ 14,850.00' : '₳ ••••••••'}
                      </span>
                      <span className="text-base sm:text-lg font-sans font-bold text-slate-400">
                        ≈ $ 14,850.00 USD
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-sans">
                      <Sparkles size={13} className="text-amber-500" />
                      <span>{t.reserveBacked} · 100% 1:1 Treasury Parity</span>
                    </p>
                  </div>

                  {/* Novera-Style Smooth SVG Area Chart */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span>30-Day Growth Trajectory</span>
                      <span className="font-bold text-emerald-600">Peak: ₳ 15,200.00</span>
                    </div>

                    <div className="h-28 w-full relative">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="balanceGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area fill */}
                        <path
                          d="M 0,80 Q 80,65 140,55 T 260,45 T 380,25 T 500,10 L 500,100 L 0,100 Z"
                          fill="url(#balanceGlow)"
                        />
                        {/* Line curve */}
                        <path
                          d="M 0,80 Q 80,65 140,55 T 260,45 T 380,25 T 500,10"
                          fill="none"
                          stroke="#d97706"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        {/* Data dots */}
                        <circle cx="140" cy="55" r="4" fill="#ffffff" stroke="#d97706" strokeWidth="2.5" />
                        <circle cx="260" cy="45" r="4" fill="#ffffff" stroke="#d97706" strokeWidth="2.5" />
                        <circle cx="380" cy="25" r="4" fill="#ffffff" stroke="#d97706" strokeWidth="2.5" />
                        <circle cx="500" cy="10" r="5" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                      </svg>
                    </div>

                    <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                      <span>1 Sep</span>
                      <span>8 Sep</span>
                      <span>15 Sep</span>
                      <span>22 Sep</span>
                      <span className="font-bold text-slate-700">Today</span>
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: SxDx-Style Iridescent Credit/Debit Card */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{lang === 'ak' ? 'ဒစ်ဂျစ်တယ်ကတ်' : 'My Virtual Cards'}</h2>
                      <p className="text-[11px] text-slate-400 font-mono">Apple Pay & Google Pay ready</p>
                    </div>
                    <button
                      onClick={() => setCardModalOpen(true)}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 font-mono flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>{lang === 'ak' ? 'ကတ်အသစ်' : 'Add Card'}</span>
                    </button>
                  </div>

                  {/* Iridescent Card Preview (SxDx & Novera style) */}
                  <div className="relative rounded-2xl p-5 text-white shadow-lg overflow-hidden group cursor-pointer bg-gradient-to-tr from-[#991b1b] via-[#c2410c] to-[#d97706]">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                    
                    {/* Chip & Logo Row */}
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-6 rounded-md bg-amber-200/90 border border-amber-400/50 shadow-inner flex items-center justify-center">
                          <div className="w-5 h-4 border border-amber-600/40 rounded-sm" />
                        </div>
                        <Radio size={16} className="text-white/80 rotate-90" />
                      </div>
                      <div className="flex items-center gap-1.5 font-bold font-sans tracking-tight text-white">
                        <ArakanEmblem size={22} variant="badge" />
                        <span className="text-sm font-black">PeThar</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/20">PREMIUM</span>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="mt-8 font-mono text-base tracking-widest text-white/95 font-bold drop-shadow-xs">
                      •••• •••• •••• 4587
                    </div>

                    {/* Card Holder & Expiry */}
                    <div className="mt-4 flex items-end justify-between relative z-10 text-xs">
                      <div>
                        <div className="text-[9px] font-mono text-white/70 uppercase">Card Holder</div>
                        <div className="font-extrabold tracking-wide uppercase">JACK HALDER</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-mono text-white/70 uppercase">Expires</div>
                        <div className="font-mono font-bold">12/28</div>
                      </div>
                    </div>
                  </div>

                  {/* Spending Limit Progress (SxDx Bank inspired) */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="text-slate-500">Monthly Spending Limit</span>
                      <span className="font-bold text-slate-800">$1,612.87 / $5,000.00</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500" style={{ width: '32%' }} />
                    </div>
                  </div>
                </div>

              </div>

              {/* ROW 2: DNA PAYMENTS-STYLE 4 STAT METRICS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
                    <span>30-Day Volume</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ↑ 100%
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                    ₳ 8,920.00
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    1,234 verified ledger entries
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
                    <span>Pending Inflow</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Incoming
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                    ₳ 350.00
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Settles within &lt; 250ms
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
                    <span>Active Agents</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      100% Online
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                    340+ Points
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Sittwe, Mrauk-U, Kyaukpyu
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
                    <span>Treasury Backing</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      1:1 Parity
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                    105.0%
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Over-collateralized USDT reserve
                  </div>
                </div>

              </div>

              {/* ROW 3: QUICK TRANSFER (NOVERA STYLE) & BUDGET ALLOCATION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 6 Cols: Quick Transfer Avatar Row (Novera style) */}
                <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">{t.sendRecentContacts}</h2>
                        <p className="text-[11px] text-slate-400 font-mono">1-click direct transfer to verified users</p>
                      </div>
                      <button
                        onClick={() => {
                          setRecipient('')
                          setSendModalOpen(true)
                        }}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 font-mono"
                      >
                        + Custom Send
                      </button>
                    </div>

                    {/* Circular User Avatars Row (Novera style) */}
                    <div className="flex items-center gap-4 py-2 overflow-x-auto">
                      {quickContacts.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setRecipient(c.id)
                            setSendModalOpen(true)
                          }}
                          className="flex flex-col items-center group shrink-0"
                        >
                          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 group-hover:from-amber-100 group-hover:to-amber-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-sm text-slate-800 group-hover:text-amber-900 transition-all group-hover:scale-105">
                            {c.initials}
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 mt-1.5 truncate max-w-[70px]">
                            {lang === 'ak' ? c.mm.slice(0, 8) : c.name.split(' ')[0]}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {c.location.split('·')[0].trim()}
                          </span>
                        </button>
                      ))}

                      {/* Add new recipient pill */}
                      <button
                        onClick={() => {
                          setRecipient('')
                          setSendModalOpen(true)
                        }}
                        className="flex flex-col items-center group shrink-0"
                      >
                        <div className="w-13 h-13 rounded-full border-2 border-dashed border-slate-300 group-hover:border-amber-500 flex items-center justify-center text-slate-400 group-hover:text-amber-600 transition-all">
                          <Plus size={18} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 mt-1.5">Add</span>
                        <span className="text-[9px] font-mono text-slate-400">New</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-500" />
                      Zero Fee P2P Corridor
                    </span>
                    <span className="text-emerald-600 font-bold">250ms Finality</span>
                  </div>
                </div>

                {/* Right 6 Cols: Budget & Channels Allocation Breakdown */}
                <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">Spending & Channel Allocation</h2>
                        <p className="text-[11px] text-slate-400 font-mono">Monthly outflow categorization</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700">₳ 1,795.50 Total</span>
                    </div>

                    {/* Multi-segment progress bar */}
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex my-3">
                      <div className="bg-amber-500 h-full" style={{ width: '45%' }} title="P2P Transfers (45%)" />
                      <div className="bg-red-500 h-full" style={{ width: '28%' }} title="Agent Cash-Out (28%)" />
                      <div className="bg-sky-500 h-full" style={{ width: '17%' }} title="Merchant POS (17%)" />
                      <div className="bg-emerald-500 h-full" style={{ width: '10%' }} title="Crypto / USDT (10%)" />
                    </div>

                    {/* Breakdown Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>P2P</span>
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">45% (₳808)</div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span>Cash-Out</span>
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">28% (₳502)</div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-sky-500" />
                          <span>POS</span>
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">17% (₳305)</div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Crypto</span>
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">10% (₳180)</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>Target Budget: ₳ 5,000.00</span>
                    <span className="text-emerald-600 font-bold">64.1% Under Budget</span>
                  </div>
                </div>

              </div>

              {/* ROW 4: RECENT LEDGER TRANSACTIONS (DNA PAYMENTS TABLE) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
                
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <History size={18} className="text-amber-500" />
                      <span>{t.recentTransactions}</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Double-entry immutable cryptographic ledger · Instant audit trail
                    </p>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={lang === 'ak' ? 'ရှာဖွေရန်...' : 'Search ledger...'}
                        className="pl-8 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-amber-500 font-mono w-44 sm:w-56"
                      />
                    </div>

                    {/* Filter Pills */}
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-800 outline-none font-mono"
                    >
                      <option value="all">All Channels</option>
                      <option value="p2p">P2P Transfers</option>
                      <option value="crypto">Crypto & USDT</option>
                      <option value="cashout">Agent Cash-Out</option>
                      <option value="remittance">International Wire</option>
                      <option value="pos">Merchant POS</option>
                    </select>
                  </div>
                </div>

                {/* Clean Ledger Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400">
                        <th className="pb-3 font-semibold">REF / HASH</th>
                        <th className="pb-3 font-semibold">DESCRIPTION</th>
                        <th className="pb-3 font-semibold">COUNTERPARTY</th>
                        <th className="pb-3 font-semibold">DATE & TIME</th>
                        <th className="pb-3 font-semibold text-right">AMOUNT (AKD)</th>
                        <th className="pb-3 font-semibold text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTransactions.map((tx) => {
                        const isCredit = tx.amount > 0
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 pr-4">
                              <span className="font-bold text-slate-900 block">{tx.refId}</span>
                              <span className="text-[10px] text-slate-400 block">{tx.hash}</span>
                            </td>
                            <td className="py-3.5 pr-4 font-sans font-medium text-slate-800">
                              {lang === 'ak' ? tx.titleMm : tx.title}
                            </td>
                            <td className="py-3.5 pr-4 text-slate-500 font-sans">
                              {lang === 'ak' ? tx.counterpartyMm : tx.counterparty}
                            </td>
                            <td className="py-3.5 pr-4 text-slate-500">
                              {tx.time}
                            </td>
                            <td className="py-3.5 pr-4 text-right font-bold text-sm">
                              <span className={isCredit ? 'text-emerald-600' : 'text-slate-900'}>
                                {isCredit ? '+' : ''}{tx.amount.toFixed(2)} ₳
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* ════ TAB 2: TRANSFERS & LEDGER ════ */}
          {activeTab === 'transfers' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
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

                <form onSubmit={handleExecuteSend} className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      {lang === 'ak' ? 'လက်ခံသူ ဖုန်းနံပါတ် သို့မဟုတ် PeThar ID' : 'Recipient Phone Number or PeThar ID'}
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. ARAK-8891 or @username"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-mono outline-none focus:border-amber-500 text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      {lang === 'ak' ? 'ငွေပမာဏ (AKD)' : 'Amount (AKD)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-16 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-lg font-mono font-bold outline-none focus:border-amber-500 text-slate-900"
                        required
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₳</span>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 font-bold">AKD</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      {lang === 'ak' ? 'မှတ်ချက် / ရည်ရွယ်ချက်' : 'Payment Memo / Note'}
                    </label>
                    <input
                      type="text"
                      value={sendMemo}
                      onChange={(e) => setSendMemo(e.target.value)}
                      placeholder="e.g. Invoice settlement or family support"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-amber-500 text-slate-900"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Network Fee</span>
                      <span className="text-emerald-600 font-bold">0.00 AKD (Free)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cryptographic Finality</span>
                      <span className="text-slate-900 font-bold">&lt; 250 milliseconds</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    {isSending ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        <span>{lang === 'ak' ? 'ငွေလွှဲ အတည်ပြုမည်' : 'Confirm & Authorize Transfer'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ════ TAB 3: GLOBAL WIRE & FX ════ */}
          {activeTab === 'remittance' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
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
                    <div key={fx.pair} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
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

          {/* ════ TAB 4: CARDS & SPENDING ════ */}
          {activeTab === 'cards' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-sans text-slate-900">
                      {lang === 'ak' ? 'ဒစ်ဂျစ်တယ်နှင့် ရုပ်ပိုင်းဆိုင်ရာ ကတ်များ' : 'Virtual & Physical Cards Management'}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Contactless NFC payments, online subscriptions & ATM withdrawals
                    </p>
                  </div>
                  <CreditCard size={32} className="text-amber-500" />
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-tr from-[#991b1b] via-[#c2410c] to-[#d97706] text-white max-w-md mx-auto shadow-lg relative">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-lg">PeThar Platinum</span>
                    <Radio size={20} className="rotate-90 text-white/80" />
                  </div>
                  <div className="mt-8 font-mono text-xl tracking-widest font-bold">
                    •••• •••• •••• 4587
                  </div>
                  <div className="mt-6 flex justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-white/70">HOLDER</div>
                      <div className="font-bold">JACK HALDER</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/70">EXP</div>
                      <div className="font-bold">12/28</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ TAB 5: PROOF OF RESERVES ════ */}
          {activeTab === 'reserves' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
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
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
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

          {/* ════ TAB 6: SECURITY & SETTINGS ════ */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
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
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Ed25519 Secure Enclave</span>
                      <span className="text-slate-500 text-[11px]">Hardware-bound private key</span>
                    </div>
                    <span className="text-emerald-600 font-bold">Active</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono outline-none focus:border-amber-500 text-slate-900"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base font-mono font-bold outline-none focus:border-amber-500 text-slate-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
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
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all"
            >
              {copiedId ? 'Copied to Clipboard!' : 'Copy PeThar ID'}
            </button>
          </div>
        </div>
      )}

      {/* 3. DEPOSIT USDT MODAL */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Deposit USDT (1:1 AKD)</h3>
              <button onClick={() => setDepositModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800">
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
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
            >
              Copy TRC-20 Address
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default WebBankingDashboard
