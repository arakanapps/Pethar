import React, { useState } from 'react'
import {
  ArakanEmblem, FlagArakan, FlagInternational
} from '../components/ArakanEmblem'
import {
  LayoutDashboard, ArrowUpRight, ArrowDownLeft, Send, QrCode,
  Globe, Coins, ShieldCheck, History, CreditCard,
  Search, Bell, LogOut, CheckCircle,
  Copy, Sun, Moon, Sparkles, Building2,
  ChevronRight, Lock, Eye, EyeOff
} from 'lucide-react'
import {
  transactions, liveFxRates, contacts, initialUserProfile,
  type UserProfile
} from '../data'
import { type Language, translations } from '../i18n'

interface WebBankingDashboardProps {
  lang: Language
  setLang: (lang: Language) => void
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
  onExit: () => void
}

type TabType = 'overview' | 'transfers' | 'remittance' | 'cards' | 'reserves' | 'settings'

export const WebBankingDashboard: React.FC<WebBankingDashboardProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  onExit,
}) => {
  const t = translations[lang]
  const isLight = theme === 'light'

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [profile] = useState<UserProfile>(initialUserProfile)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Modals & Quick Action States
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
  const filteredTransactions = transactions.filter((tx) => {
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.titleMm.includes(searchQuery) ||
      tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
      }, 1800)
    }, 800)
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight ? 'bg-[#F4F6F9] text-slate-900' : 'bg-[#06090E] text-slate-100'
      }`}
    >
      {/* ── TOP INSTITUTIONAL COMMAND BAR ───────────────────────────── */}
      <header
        className={`sticky top-0 z-30 h-16 border-b px-4 lg:px-8 flex items-center justify-between backdrop-blur-xl ${
          isLight
            ? 'bg-white/90 border-slate-200/80 shadow-sm'
            : 'bg-[#090D14]/90 border-white/[0.08] shadow-2xl'
        }`}
      >
        {/* Left Brand Identifier */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <ArakanEmblem size={32} variant="badge" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight font-sans">
                  {lang === 'arak' ? 'ဖေ့သာ အွန်လိုင်းဘဏ်' : 'PeThar Online Banking'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  ARAKAN CENTRAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                {lang === 'arak' ? 'ဒစ်ဂျစ်တယ်ဘဏ်စနစ် ပေါ်တယ်' : 'Institutional Banking Portal · Tier 2 Verified'}
              </p>
            </div>
          </div>
        </div>

        {/* Center Live Rates Pill (Desktop) */}
        <div
          className={`hidden xl:flex items-center gap-4 px-4 py-1.5 rounded-full border text-xs font-mono ${
            isLight
              ? 'bg-slate-100/80 border-slate-200 text-slate-600'
              : 'bg-white/[0.03] border-white/10 text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            1 AKD = 1.00 USD
          </span>
          <span className="text-slate-500">|</span>
          <span>THB {liveFxRates.find(r => r.pair.includes('THB'))?.rate}</span>
          <span className="text-slate-500">|</span>
          <span>USDT 1.00</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-semibold">{t.reserveBacked.slice(0, 20)}...</span>
        </div>

        {/* Right User Status & Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div
            className={`flex items-center p-0.5 rounded-xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/[0.04] border-white/10'
            }`}
          >
            <button
              onClick={() => setLang('arak')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                lang === 'arak'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="ရခိုင်ဘာသာ"
            >
              <FlagArakan size={13} />
              <span className="text-[11px]">ရခိုင်</span>
            </button>
            <button
              onClick={() => setLang('en')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                lang === 'en'
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="English"
            >
              <FlagInternational size={13} />
              <span className="text-[11px]">EN</span>
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            className={`p-2 rounded-xl border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300'
            }`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <Moon size={15} /> : <Sun size={15} className="text-amber-400" />}
          </button>

          {/* Notifications */}
          <button
            className={`p-2 rounded-xl border relative transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300'
            }`}
            title="Notifications"
          >
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {/* Exit / Return to Public Website */}
          <button
            onClick={onExit}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition ${
              isLight
                ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                : 'border-white/15 hover:bg-white/10 text-slate-300'
            }`}
            title="Return to Public Website"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">{lang === 'arak' ? 'ပင်မစာမျက်နှာသို့' : 'Website'}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE: SIDEBAR + CONTENT ────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION (Desktop & Tablet) */}
        <aside
          className={`w-64 shrink-0 border-r hidden md:flex flex-col justify-between p-4 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#070B11] border-white/[0.06]'
          }`}
        >
          {/* User Profile Mini Card */}
          <div className="space-y-4">
            <div
              className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {profile.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm truncate">{profile.name}</div>
                  <div className="text-[11px] font-mono text-slate-400 truncate flex items-center gap-1">
                    <span>{profile.petharId}</span>
                    <button
                      onClick={handleCopyId}
                      className="hover:text-amber-400 transition"
                      title="Copy PeThar ID"
                    >
                      {copiedId ? <CheckCircle size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-white/10 flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <ShieldCheck size={12} /> {t.tierVerified}
                </span>
                <span className="text-slate-400">{profile.location}</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {[
                { id: 'overview' as TabType, label: lang === 'arak' ? 'ပင်မဘဏ်စာမျက်နှာ' : 'Account Overview', icon: LayoutDashboard },
                { id: 'transfers' as TabType, label: lang === 'arak' ? 'ငွေစာရင်းနှင့် မှတ်တမ်း' : 'Ledger & Transfers', icon: History },
                { id: 'remittance' as TabType, label: lang === 'arak' ? 'နိုင်ငံတကာငွေလွှဲ / FX' : 'Global Wire & FX', icon: Globe },
                { id: 'cards' as TabType, label: lang === 'arak' ? 'ဒစ်ဂျစ်တယ်ကတ်များ' : 'Cards & Spending', icon: CreditCard },
                { id: 'reserves' as TabType, label: lang === 'arak' ? 'အာမခံဘဏ္ဍာတိုက် (Reserves)' : 'Proof of Reserves', icon: Coins },
                { id: 'settings' as TabType, label: lang === 'arak' ? 'လုံခြုံရေးနှင့် ဆက်တင်' : 'Security & Settings', icon: Lock },
              ].map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? isLight
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white text-black font-bold shadow-lg'
                        : isLight
                        ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isActive ? (isLight ? 'text-amber-400' : 'text-red-700') : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={14} />}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Bottom Security Capsule */}
          <div
            className={`p-3.5 rounded-2xl border text-xs ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2 mb-1 text-slate-400 font-mono text-[11px]">
              <Lock size={12} className="text-amber-400" />
              <span>Ed25519 Enclave Auth</span>
            </div>
            <p className="text-[10px] leading-relaxed">
              {lang === 'arak'
                ? 'ငွေကြေးလွှဲပြောင်းမှုများကို အဆင့်မြင့် လျှို့ဝှက်ကုဒ်စနစ်ဖြင့် ကာကွယ်ထားပါသည်'
                : 'Session anchored to cryptographic secure hardware enclave. Zero telemetry tracking.'}
            </p>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Top Hero Balance Matrix */}
              <div
                className={`relative rounded-3xl overflow-hidden p-6 sm:p-8 border shadow-xl ${
                  isLight
                    ? 'bg-gradient-to-br from-slate-900 via-[#1e2738] to-[#141b24] text-white border-slate-700'
                    : 'bg-gradient-to-br from-[#1a080c] via-[#0d121c] to-[#070b12] text-white border-white/10'
                }`}
              >
                {/* Background Arakan Watermark */}
                <div className="absolute right-0 top-0 opacity-10 p-6 pointer-events-none translate-x-12 -translate-y-8">
                  <ArakanEmblem size={300} variant="emblem-only" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {t.currencyLabel} (AKD / ₳)
                      </span>
                      <button
                        onClick={() => setBalanceVisible(!balanceVisible)}
                        className="text-white/60 hover:text-white p-1 transition"
                        title={balanceVisible ? 'Hide balance' : 'Show balance'}
                      >
                        {balanceVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                    </div>

                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white flex items-baseline gap-2">
                      <span>{balanceVisible ? '₳ 14,850.00' : '₳ ••••••••'}</span>
                      <span className="text-sm font-sans font-normal text-emerald-400">
                        ≈ $ 14,850.00 USD
                      </span>
                    </div>

                    <p className="text-xs text-white/60 mt-2 flex items-center gap-1.5 font-sans">
                      <Sparkles size={13} className="text-amber-400 shrink-0" />
                      <span>{t.reserveBacked}</span>
                    </p>
                  </div>

                  {/* Primary Desk Action Triggers */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                    <button
                      onClick={() => setSendModalOpen(true)}
                      className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
                    >
                      <ArrowUpRight size={16} />
                      <span>{t.navSend}</span>
                    </button>

                    <button
                      onClick={() => setReceiveModalOpen(true)}
                      className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition backdrop-blur-md"
                    >
                      <ArrowDownLeft size={16} />
                      <span>{t.navReceive}</span>
                    </button>

                    <button
                      onClick={() => setDepositModalOpen(true)}
                      className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition"
                    >
                      <Coins size={16} />
                      <span>{lang === 'arak' ? 'USDT ငွေသွင်း' : 'Deposit USDT'}</span>
                    </button>
                  </div>
                </div>

                {/* Submetrics row */}
                <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Pending Inflow</span>
                    <span className="font-bold text-white mt-0.5 block">₳ 350.00</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">30-Day Volume</span>
                    <span className="font-bold text-white mt-0.5 block">₳ 8,920.00</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Settlement Speed</span>
                    <span className="font-bold text-emerald-400 mt-0.5 block">Instant (&lt; 250ms)</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Network Collateral</span>
                    <span className="font-bold text-amber-400 mt-0.5 block">105.0% Over-Collateralized</span>
                  </div>
                </div>
              </div>

              {/* Grid: Live FX Ticker + Quick Contacts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* FX Rates Table */}
                <div
                  className={`p-5 rounded-3xl border ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#090D14] border-white/[0.08]'
                  } shadow-md`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Globe size={15} className="text-amber-400" />
                      <span>{lang === 'arak' ? 'တရားဝင် ငွေလဲလှယ်နှုန်းများ' : 'Official Arakan FX Board'}</span>
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400">Live Synced</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                    {liveFxRates.slice(0, 5).map((fx) => (
                      <div key={fx.pair} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold">{fx.pair}</span>
                          <span className="text-[10px] text-slate-400 block">{lang === 'arak' ? fx.nameMm : fx.name}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold">{fx.rate}</span>
                          <span
                            className={`text-[10px] ml-1.5 ${
                              fx.trend === 'up' ? 'text-emerald-500' : fx.trend === 'down' ? 'text-red-500' : 'text-slate-400'
                            }`}
                          >
                            {fx.change24h}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Frequent Transfer Contacts */}
                <div
                  className={`lg:col-span-2 p-5 rounded-3xl border ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#090D14] border-white/[0.08]'
                  } shadow-md flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <Send size={15} className="text-amber-400" />
                        <span>{t.sendRecentContacts}</span>
                      </h3>
                      <button
                        onClick={() => setSendModalOpen(true)}
                        className="text-xs text-amber-400 hover:underline font-mono"
                      >
                        {lang === 'arak' ? 'အသစ်လွှဲရန်' : '+ New Transfer'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {contacts.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setRecipient(c.id)
                            setSendModalOpen(true)
                          }}
                          className={`p-3 rounded-2xl border text-left transition group ${
                            isLight
                              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                              : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-300 flex items-center justify-center font-bold text-xs">
                              {c.initials}
                            </div>
                            <div className="overflow-hidden">
                              <span className="text-xs font-bold block truncate">
                                {lang === 'arak' ? c.mm : c.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block truncate">
                                {c.id}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {c.location}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Institutional Quick Advice */}
                  <div
                    className={`mt-4 p-3 rounded-2xl border flex items-center justify-between text-xs font-mono ${
                      isLight ? 'bg-amber-50/60 border-amber-200 text-amber-900' : 'bg-amber-500/[0.05] border-amber-500/20 text-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={16} />
                      <span>{lang === 'arak' ? 'အာရက္ခအေးဂျင့်ကွန်ရက် ဖွင့်လှစ်ထားပါသည်' : '340+ Verified Cash Agents Active Across Arakan'}</span>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-bold">100% ONLINE</span>
                  </div>
                </div>
              </div>

              {/* Recent Ledger Entries (Full Desktop Table) */}
              <div
                className={`p-6 rounded-3xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#090D14] border-white/[0.08]'
                } shadow-md`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <History size={18} className="text-amber-400" />
                      <span>{t.recentTransactions}</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Double-entry immutable cryptographic ledger
                    </p>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={lang === 'arak' ? 'ရှာဖွေရန်...' : 'Search ledger...'}
                        className={`pl-8 pr-3 py-1.5 rounded-xl text-xs border outline-none font-mono ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-red-500'
                            : 'bg-white/[0.04] border-white/10 text-white focus:border-red-500'
                        }`}
                      />
                    </div>

                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs border outline-none font-mono ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900'
                          : 'bg-white/[0.04] border-white/10 text-white'
                      }`}
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

                {/* Ledger Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-slate-400'}`}>
                        <th className="pb-3 font-semibold">REF / HASH</th>
                        <th className="pb-3 font-semibold">DESCRIPTION</th>
                        <th className="pb-3 font-semibold">COUNTERPARTY</th>
                        <th className="pb-3 font-semibold">DATE & TIME</th>
                        <th className="pb-3 font-semibold text-right">AMOUNT (AKD)</th>
                        <th className="pb-3 font-semibold text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                      {filteredTransactions.map((tx) => {
                        const isCredit = tx.amount > 0
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                            <td className="py-3.5 pr-4">
                              <span className="font-bold text-slate-900 dark:text-white block">{tx.refId}</span>
                              <span className="text-[10px] text-slate-400 block">{tx.hash}</span>
                            </td>
                            <td className="py-3.5 pr-4 font-sans font-medium text-slate-800 dark:text-slate-200">
                              {lang === 'arak' ? tx.titleMm : tx.title}
                            </td>
                            <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 font-sans">
                              {lang === 'arak' ? tx.counterpartyMm : tx.counterparty}
                            </td>
                            <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400">
                              {tx.time}
                            </td>
                            <td className="py-3.5 pr-4 text-right font-bold text-sm">
                              <span className={isCredit ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}>
                                {isCredit ? '+' : ''}{tx.amount.toFixed(2)} ₳
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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

          {/* TAB 2: TRANSFERS / SEND */}
          {activeTab === 'transfers' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div
                className={`p-6 sm:p-8 rounded-3xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#090D14] border-white/[0.08]'
                } shadow-xl`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-sans">
                      {lang === 'arak' ? 'အာရက္ခဒေါ်လာ တိုက်ရိုက်ငွေလွှဲခြင်း' : 'Direct Arakan Dollar Transfer'}
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
                      {lang === 'arak' ? 'လက်ခံသူ ဖုန်းနံပါတ် သို့မဟုတ် PeThar ID' : 'Recipient Phone Number or PeThar ID'}
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. ARAK-8891 or +95 9 881 204 991"
                      className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono outline-none ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-red-500'
                          : 'bg-white/[0.04] border-white/10 text-white focus:border-red-500'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      {lang === 'arak' ? 'ငွေလွှဲမည့်ပမာဏ (AKD / ₳)' : 'Transfer Amount (AKD / ₳)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full px-4 py-3 text-lg font-bold font-mono rounded-2xl border outline-none ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-red-500'
                            : 'bg-white/[0.04] border-white/10 text-white focus:border-red-500'
                        }`}
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-bold text-amber-400">
                        AKD
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      {lang === 'arak' ? 'မှတ်စု (ရွေးချယ်ရန်)' : 'Transaction Memo (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={sendMemo}
                      onChange={(e) => setSendMemo(e.target.value)}
                      placeholder="e.g. Trade settlement, supplies, family remittance"
                      className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-red-500'
                          : 'bg-white/[0.04] border-white/10 text-white focus:border-red-500'
                      }`}
                    />
                  </div>

                  <div className={`p-4 rounded-2xl border text-xs font-mono space-y-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/10'
                  }`}>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Network Fee:</span>
                      <span className="font-bold text-emerald-400">0.00 ₳ (Free Internal Ledger)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Settlement Guarantee:</span>
                      <span className="text-slate-300">105% US T-Bill & Gold Vault</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:brightness-110 text-white font-bold font-mono text-sm uppercase tracking-wider shadow-xl transition active:scale-95 disabled:opacity-50"
                  >
                    {isSending
                      ? 'Signing Ed25519 Cryptographic Authorization...'
                      : lang === 'arak'
                      ? 'ငွေလွှဲချက် အတည်ပြုမည်'
                      : 'Authorize & Settle Transfer'}
                  </button>
                </form>

                {sendSuccess && (
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-center font-mono text-xs flex items-center justify-center gap-2">
                    <CheckCircle size={16} />
                    <span>Transaction successfully recorded and settled on Arakan Central Ledger!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GLOBAL REMITTANCE & FX */}
          {activeTab === 'remittance' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div
                className={`p-6 sm:p-8 rounded-3xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#090D14] border-white/[0.08]'
                } shadow-xl`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="text-amber-400" size={24} />
                  <h2 className="text-xl font-bold font-sans">
                    {lang === 'arak' ? 'နိုင်ငံတကာ ငွေလွှဲစင်္ကြံများ' : 'Global Remittance Corridors'}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-mono mb-8">
                  Direct rails connecting Bangkok, Kuala Lumpur, Singapore, Dubai, and USA with zero inflation loss.
                </p>

                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    { country: 'Thailand', corridor: 'THB → AKD', rail: 'PromptPay / Kasikorn / SCB', time: 'Instant (~30s)', fee: '0.0% spread' },
                    { country: 'Malaysia', corridor: 'MYR → AKD', rail: 'DuitNow / Maybank', time: 'Instant (~45s)', fee: '0.0% spread' },
                    { country: 'Singapore', corridor: 'SGD → AKD', rail: 'PayNow / DBS / UOB', time: 'Instant (~20s)', fee: '0.0% spread' },
                    { country: 'USA & EU', corridor: 'USD / EUR → AKD', rail: 'Wise / SWIFT / Fedwire', time: 'Same-day', fee: 'Fixed $2.50' },
                    { country: 'Global Crypto', corridor: 'USDT / USDC → AKD', rail: 'Binance Pay / TRC20 / TON', time: 'Instant (1 block)', fee: '0.0%' },
                    { country: 'Physical Cash', corridor: 'Cash Float In/Out', rail: '340+ Authorized Arakan Agents', time: 'In Person', fee: 'Max 0.5%' },
                  ].map((r) => (
                    <div
                      key={r.country}
                      className={`p-5 rounded-2xl border ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm">{r.country}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          {r.time}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-bold text-amber-400 mb-1">{r.corridor}</div>
                      <div className="text-[11px] text-slate-400 mb-3">{r.rail}</div>
                      <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Corridor Fee:</span>
                        <span className="font-bold text-emerald-400">{r.fee}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CARDS */}
          {activeTab === 'cards' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div
                className={`p-6 sm:p-8 rounded-3xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#090D14] border-white/[0.08]'
                } shadow-xl`}
              >
                <h2 className="text-xl font-bold font-sans mb-1">
                  {lang === 'arak' ? 'ဖေ့သာ နိုင်ငံတကာ ဒစ်ဂျစ်တယ်ဒက်ဘစ်ကတ်' : 'PeThar Multi-Currency Debit Card'}
                </h2>
                <p className="text-xs text-slate-400 font-mono mb-6">
                  Virtual Visa Debit with instant freeze and dynamic 3D-Secure
                </p>

                {/* Credit Card Graphic */}
                <div className="max-w-md mx-auto aspect-[1.586] rounded-3xl p-6 sm:p-8 bg-gradient-to-tr from-[#990000] via-[#590000] to-[#1a080c] text-white shadow-2xl border border-red-500/40 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute right-0 top-0 opacity-15 p-4 pointer-events-none">
                    <ArakanEmblem size={180} variant="emblem-only" />
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <ArakanEmblem size={28} variant="badge" />
                      <span className="font-bold tracking-wider text-sm font-sans">PeThar Platinum</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-300">DEBIT</span>
                  </div>

                  <div className="relative z-10 space-y-1">
                    <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Card Number</div>
                    <div className="text-lg sm:text-xl font-mono font-bold tracking-[0.2em]">
                      4109 •••• •••• 8842
                    </div>
                  </div>

                  <div className="flex items-end justify-between relative z-10 text-xs font-mono">
                    <div>
                      <div className="text-[9px] text-white/50 uppercase">Cardholder</div>
                      <div className="font-bold tracking-wider">{profile.name.toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-white/50 uppercase">Expires</div>
                      <div className="font-bold">09/29</div>
                    </div>
                    <div className="text-base font-bold italic tracking-tighter">VISA</div>
                  </div>
                </div>

                <div className="mt-8 grid sm:grid-cols-3 gap-3">
                  <button className="py-3 rounded-2xl border border-slate-300 dark:border-white/15 text-xs font-mono font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition">
                    Freeze Card
                  </button>
                  <button className="py-3 rounded-2xl border border-slate-300 dark:border-white/15 text-xs font-mono font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition">
                    Reveal Full CVV
                  </button>
                  <button className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono transition">
                    + Order Metal Card
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROOF OF RESERVES */}
          {activeTab === 'reserves' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div
                className={`p-6 sm:p-8 rounded-3xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#090D14] border-white/[0.08]'
                } shadow-xl`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Coins className="text-amber-400" size={24} />
                  <h2 className="text-xl font-bold font-sans">
                    {lang === 'arak' ? 'အာမခံဘဏ္ဍာတိုက်နှင့် အရန်ငွေကြေး ပွင့်လင်းမြင်သာမှု' : '105% Liquid Reserve Transparency'}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-mono mb-8">
                  Zero fractional reserve banking. Every Arakan Dollar in circulation is backed by liquid audited reserves.
                </p>

                <div className="grid md:grid-cols-3 gap-5 mb-8">
                  <div className={`p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/10'}`}>
                    <span className="text-xs font-mono text-slate-400 uppercase">US Treasury Bills</span>
                    <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">$ 3,250,000</div>
                    <p className="text-[11px] text-slate-400 mt-1">Short-term &lt; 90 day notes</p>
                  </div>

                  <div className={`p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/10'}`}>
                    <span className="text-xs font-mono text-slate-400 uppercase">Audited Physical Gold</span>
                    <div className="text-2xl font-bold font-mono text-amber-400 mt-2">$ 1,180,000</div>
                    <p className="text-[11px] text-slate-400 mt-1">Allocated bullion vaults in Switzerland & Singapore</p>
                  </div>

                  <div className={`p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/10'}`}>
                    <span className="text-xs font-mono text-slate-400 uppercase">Collateral Ratio</span>
                    <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">105.4 %</div>
                    <p className="text-[11px] text-slate-400 mt-1">Strict anti-dilution threshold</p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border text-xs font-mono ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/[0.03] border-white/10'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Merkle Tree Root Hash:</span>
                    <span className="text-slate-200 font-bold truncate max-w-xs">0x9a83...4f21e89b</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
                    <span className="text-slate-400">Independent Cryptographic Attestation:</span>
                    <span className="text-emerald-400 font-bold">VERIFIED (12 mins ago)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div
                className={`p-6 sm:p-8 rounded-3xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#090D14] border-white/[0.08]'
                } shadow-xl space-y-6`}
              >
                <h2 className="text-xl font-bold font-sans">
                  {lang === 'arak' ? 'အကောင့်ဆက်တင်နှင့် လုံခြုံရေး' : 'Security & Account Governance'}
                </h2>

                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/10'
                  }`}>
                    <div>
                      <div className="font-bold text-sm">{lang === 'arak' ? 'အရေးပေါ် Panic PIN' : 'Emergency Duress / Panic PIN'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {lang === 'arak' ? 'အတင်းအဓမ္မ ဖိအားပေးခံရချိန်တွင် ရိုက်ထည့်ရန် (၉၉၉၉၉၉)' : 'Configure silent distress broadcast pin (default: 999999)'}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-amber-400 font-bold">CONFIGURED</span>
                  </div>

                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/10'
                  }`}>
                    <div>
                      <div className="font-bold text-sm">{lang === 'arak' ? 'အဆင့်နှစ်ဆင့် အတည်ပြုမှု (2FA)' : 'Hardware Keystore / 2FA'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {lang === 'arak' ? 'Ed25519 Secure Enclave ဖြင့် အတည်ပြုခြင်း' : 'Ed25519 signature validation on all outward transfers'}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">ACTIVE</span>
                  </div>

                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/10'
                  }`}>
                    <div>
                      <div className="font-bold text-sm">{lang === 'arak' ? 'အော့ဖ်လိုင်းဘောက်ချာ လုံခြုံရေး' : 'Offline Mesh Voucher Cache'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {lang === 'arak' ? 'ဖုန်းလိုင်းပြတ်တောက်ချိန်တွင် လွှဲပြောင်းနိုင်မှု' : 'Local encrypted buffer for blackout resilient transactions'}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">ENABLED</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────────── */}

      {/* SEND MODAL */}
      {sendModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setSendModalOpen(false)}
        >
          <div
            className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl relative ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0A0E17] border-white/20'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold font-sans mb-1">{t.sendTitle}</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">PeThar Instant Settlement Rail</p>

            <form onSubmit={handleExecuteSend} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Recipient</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="PeThar ID or Phone"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10 text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Amount (AKD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono font-bold outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10 text-white'
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs uppercase tracking-wider font-mono shadow-lg transition active:scale-95 disabled:opacity-50"
              >
                {isSending ? 'Signing & Dispatching...' : 'Confirm Transfer'}
              </button>
            </form>

            {sendSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-center font-mono text-xs">
                Transfer Settled!
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECEIVE MODAL */}
      {receiveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setReceiveModalOpen(false)}
        >
          <div
            className={`w-full max-w-sm p-6 sm:p-8 rounded-3xl border shadow-2xl relative text-center ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0A0E17] border-white/20'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold font-sans mb-1">{t.receiveTitle}</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">{profile.petharId}</p>

            {/* QR Mockup */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-inner border flex flex-col items-center justify-center">
              <QrCode size={160} className="text-slate-900" />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={handleCopyId}
                className="px-4 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                <Copy size={13} />
                <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEPOSIT MODAL */}
      {depositModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setDepositModalOpen(false)}
        >
          <div
            className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl relative ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0A0E17] border-white/20'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold font-sans mb-1">
              {lang === 'arak' ? 'USDT တိုက်ရိုက်ငွေသွင်းရန်' : 'Deposit USDT (TRC-20 / TON)'}
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">1 USDT = 1.00 AKD (Zero Slippage)</p>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border font-mono text-xs break-all mb-4">
              <span className="text-slate-400 block text-[10px]">Your Dedicated TRC20 Address:</span>
              <span className="font-bold text-amber-400">TF4u91zKaK902LmPeTharTreasuryX91</span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard?.writeText('TF4u91zKaK902LmPeTharTreasuryX91')
                setDepositModalOpen(false)
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs uppercase"
            >
              Copy TRC20 Address
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WebBankingDashboard
