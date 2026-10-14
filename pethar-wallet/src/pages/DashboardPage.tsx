import React, { useState, useMemo } from 'react'
import { ArakanEmblem } from '../components/ArakanEmblem'
import {
  Send, QrCode, Coins, Search, LogOut, CheckCircle,
  Copy, Eye, EyeOff, X, RefreshCw, Zap
} from 'lucide-react'
import {
  transactions, initialUserProfile,
  type UserProfile
} from '../data'
import type { Language } from '../i18n'

export type DashboardTabType =
  | 'overview'
  | 'transfers'
  | 'cards'
  | 'pos'
  | 'remittance'
  | 'treasury'
  | 'nodes'
  | 'compliance'
  | 'security'
  | 'settings'

export interface DashboardPageProps {
  lang: Language
  setLang?: (lang: Language) => void
  theme?: 'dark' | 'light'
  setTheme?: (theme: 'dark' | 'light') => void
  onExit?: () => void
  initialTab?: DashboardTabType
}

interface KycItem {
  id: string
  name: string
  petharId: string
  township: string
  docType: string
  status: 'APPROVED' | 'UNDER_REVIEW'
  riskScore: string
  submittedAt: string
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  lang = 'ak',
  setLang,
  onExit,
  initialTab = 'overview',
}) => {
  const ak = lang === 'ak'

  const [activeTab, setActiveTab] = useState<DashboardTabType>(initialTab)
  const [profile] = useState<UserProfile>(initialUserProfile)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Internet payment limit slider
  const [paymentLimit, setPaymentLimit] = useState(2500)

  // Savings Tracker State
  const [savingsBalance, setSavingsBalance] = useState(2400.0)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveDepositAmount, setSaveDepositAmount] = useState('200')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Modals
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  // Send Money form state
  const [recipient, setRecipient] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendMemo, setSendMemo] = useState('')
  const [sendSuccess, setSendSuccess] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Platform State (from PlatformPage)
  const [isPinging, setIsPinging] = useState(false)
  const [kycFilter, setKycFilter] = useState<'all' | 'UNDER_REVIEW' | 'APPROVED'>('all')
  const [kycQueue, setKycQueue] = useState<KycItem[]>([
    {
      id: 'ACC-8891',
      name: 'Jack Halder',
      petharId: 'AKD-8891-JACK',
      township: 'Sittwe Central',
      docType: 'Verified Identity + Secure Enclave',
      status: 'APPROVED',
      riskScore: 'Low (0.02)',
      submittedAt: 'Today · 09:15',
    },
    {
      id: 'ACC-9042',
      name: 'Daw Nilar Win',
      petharId: 'AKD-9042-NLW',
      township: 'Mrauk-U District',
      docType: 'Merchant Account Registration',
      status: 'UNDER_REVIEW',
      riskScore: 'Low (0.05)',
      submittedAt: 'Today · 11:40',
    },
    {
      id: 'ACC-3811',
      name: 'U Kyaw Zan Hla',
      petharId: 'AKD-3811-KZH',
      township: 'Kyaukphyu Port Zone',
      docType: 'Business Agent Credential',
      status: 'APPROVED',
      riskScore: 'Low (0.01)',
      submittedAt: 'Yesterday · 16:20',
    },
    {
      id: 'ACC-4402',
      name: 'Ma Khin Hla',
      petharId: 'AKD-4402-MKH',
      township: 'Thandwe Market',
      docType: 'Basic Account Verification',
      status: 'UNDER_REVIEW',
      riskScore: 'Medium (0.12)',
      submittedAt: 'Today · 13:05',
    },
  ])

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.titleMm.includes(searchQuery) ||
        tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.refId.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [searchQuery])

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
      }, 1500)
    }, 600)
  }

  const handleApproveKyc = (id: string) => {
    setKycQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'APPROVED' } : item))
  }

  const handlePingNodes = () => {
    setIsPinging(true)
    setTimeout(() => setIsPinging(false), 800)
  }

  const handleSaveDeposit = () => {
    const amt = parseFloat(saveDepositAmount) || 0
    if (amt > 0) {
      setSavingsBalance(prev => prev + amt)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        setSaveModalOpen(false)
      }, 1200)
    }
  }

  const labels = ak
    ? {
        portalTitle: 'Pe Thar (ဖေ့သာ) ဘဏ္ဍာရေးနှင့် ပလက်ဖောင်း စီမံခန့်ခွဲမှု',
        tabOverview: 'အကျဉ်းချုပ်',
        tabTransfers: 'ငွေလွှဲ / ငွေပို့',
        tabCards: 'ဒစ်ဂျစ်တယ်ကတ်',
        tabPos: 'ကုန်သည် POS',
        tabRemittance: 'နိုင်ငံတကာငွေလွှဲ',
        tabTreasury: 'ဘဏ္ဍာတိုက် (Reserves)',
        tabNodes: 'ကွန်ရက် နုတ်ဒ်များ',
        tabCompliance: 'စိစစ်အတည်ပြုချက် (KYC)',
        tabSecurity: 'လုံခြုံရေး & Multi-Sig',
        tabSettings: 'ဆက်တင်',
        availableBalance: 'လက်ရှိ ရရှိနိုင်သော လက်ကျန်',
        currencyPeg: '၁ ₳ = ၁ $ USD · ၁၀၀% အရန်ငွေ',
        sendMoney: 'ငွေလွှဲမည်',
        receiveMoney: 'ငွေလက်ခံမည်',
        saveMoney: 'စုဘူးထဲထည့်မည်',
        activityTitle: 'ငွေလွှဲမှတ်တမ်းနှင့် စာရင်းရှင်းတမ်း',
        searchPlaceholder: 'အမည်၊ မှတ်တမ်းအိုင်ဒီဖြင့် ရှာဖွေပါ...',
        offlineCardTitle: 'မိုဘိုင်းဖုန်းတွင် အော့ဖ်လိုင်းမုဒ် သုံးမည်',
        offlineCardDesc: 'Android APK နှင့် iPhone Configuration Profile ဖြင့် အင်တာနက်မရှိချိန်တွင်လည်း ငွေလွှဲနိုင်ပါသည်။',
      }
    : {
        portalTitle: 'Pe Thar Financial & Platform Dashboard',
        tabOverview: 'Overview',
        tabTransfers: 'Transfers',
        tabCards: 'Cards',
        tabPos: 'Merchant POS',
        tabRemittance: 'Remittance',
        tabTreasury: 'Treasury & Reserves',
        tabNodes: 'Network Nodes',
        tabCompliance: 'Verification Queue',
        tabSecurity: 'Multi-Sig & HSM',
        tabSettings: 'Settings',
        availableBalance: 'Total Available Balance',
        currencyPeg: '1 ₳ = $1.00 USD · 100% Backed',
        sendMoney: 'Send ₳',
        receiveMoney: 'Receive',
        saveMoney: 'Add to Vault',
        activityTitle: 'Recent Cashflow & Transactions',
        searchPlaceholder: 'Search by name, ID, or reference...',
        offlineCardTitle: 'Offline Mode on Mobile',
        offlineCardDesc: 'Carry bearer cash with our direct Android APK and iOS Configuration Profile without internet.',
      }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onExit ? onExit() : (window.location.href = '/')}
              className="flex items-center gap-2.5 font-black text-slate-950 text-base"
            >
              <ArakanEmblem size={32} variant="badge" />
              <span>Pe Thar</span>
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] font-mono font-bold">
              1 ₳ = 1 $
            </span>
          </div>

          {/* Center Tab Navigation */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-mono font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'overview' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {labels.tabOverview}
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'transfers' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {labels.tabTransfers}
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'cards' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {labels.tabCards}
            </button>
            <button
              onClick={() => setActiveTab('treasury')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'treasury' ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {labels.tabTreasury}
            </button>
            <button
              onClick={() => setActiveTab('nodes')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'nodes' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {labels.tabNodes}
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'compliance' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {labels.tabCompliance}
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang?.(ak ? 'en' : 'ak')}
              className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              {ak ? 'EN' : 'AK'}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline text-slate-600 font-bold">ONLINE</span>
            </div>
            {onExit && (
              <button
                onClick={onExit}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">

        {/* Top Responsive Tab Pills for Mobile */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 text-xs font-mono font-bold">
          {(['overview', 'transfers', 'cards', 'treasury', 'nodes', 'compliance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-slate-950 text-white'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & WALLET CASHFLOW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Hero Balance & Actions */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Balance Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white relative overflow-hidden shadow-xl border border-slate-800">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>{labels.availableBalance}</span>
                      <button
                        onClick={() => setBalanceVisible(!balanceVisible)}
                        className="text-slate-400 hover:text-white"
                      >
                        {balanceVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
                      {balanceVisible ? '₳ 1,248.50' : '₳ ••••••'}
                    </div>
                    <div className="text-xs font-mono text-amber-400 mt-1">
                      {labels.currencyPeg}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyId}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-slate-200 flex items-center gap-1.5 transition-all"
                    >
                      <Copy className="w-3 h-3 text-amber-400" />
                      <span>{copiedId ? 'COPIED!' : profile.petharId}</span>
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="relative z-10 grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => setSendModalOpen(true)}
                    className="py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>{labels.sendMoney}</span>
                  </button>
                  <button
                    onClick={() => setReceiveModalOpen(true)}
                    className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{labels.receiveMoney}</span>
                  </button>
                  <button
                    onClick={() => setSaveModalOpen(true)}
                    className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>{labels.saveMoney}</span>
                  </button>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-extrabold text-slate-950 text-base">
                    {labels.activityTitle}
                  </h3>
                  <div className="relative flex items-center max-w-xs w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={labels.searchPlaceholder}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-y border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Transaction</th>
                        <th className="py-2.5 px-3">Counterparty</th>
                        <th className="py-2.5 px-3">Reference</th>
                        <th className="py-2.5 px-3 text-right">Amount (AKD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredTransactions.slice(0, 7).map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-950">{ak ? tx.titleMm : tx.title}</div>
                            <div className="text-[10px] text-slate-400">{tx.time}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{tx.counterparty}</td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{tx.refId}</td>
                          <td className="py-3 px-3 text-right font-bold">
                            <span className={tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}>
                              {tx.amount > 0 ? `+ ₳ ${tx.amount.toFixed(2)}` : `- ₳ ${Math.abs(tx.amount).toFixed(2)}`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Offline Mode Card & Quick Insights */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Mobile Offline Card */}
              <div className="p-6 rounded-3xl bg-linear-to-br from-amber-500/10 via-amber-500/5 to-slate-100 border border-amber-500/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-950 text-sm">{labels.offlineCardTitle}</h4>
                    <span className="text-[10px] font-mono font-bold text-amber-700">CASHU BEARER P2P</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {labels.offlineCardDesc}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a
                    href="/ios.html"
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-center font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span> iOS Profile</span>
                  </a>
                  <a
                    href="/pethar-release.apk"
                    download
                    className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-center font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Android APK</span>
                  </a>
                </div>
              </div>

              {/* Savings Vault Summary */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <h4 className="font-extrabold text-slate-950 text-sm">Emergency Vault</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600">4.5% APY</span>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-950 font-mono">
                    ₳ {savingsBalance.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">Automated compounding daily</div>
                </div>
                <button
                  onClick={() => setSaveModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-xs transition-all"
                >
                  Deposit into Vault
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: TREASURY & RESERVES (from PlatformPage) */}
        {activeTab === 'treasury' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white relative overflow-hidden shadow-xl border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs font-bold uppercase mb-2">
                    100% Backed Reserves
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Central Treasury Collateral</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                    Every 1 ₳ in circulation is fully collateralized by audited USD stablecoins (USDT, USDC, USD1).
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-400">Total Treasury Collateral</div>
                  <div className="text-3xl font-black text-amber-400 font-mono mt-0.5">$2,450,000 USD</div>
                  <div className="text-xs font-mono text-emerald-400">Coverage: 100.00%</div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-mono">USDT (TRC-20 / ERC-20)</div>
                  <div className="text-xl font-black text-white font-mono mt-1">$1,470,000</div>
                  <div className="text-[10px] text-slate-500 font-mono">60% of total backing</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-mono">USDC (Solana / Base)</div>
                  <div className="text-xl font-black text-white font-mono mt-1">$735,000</div>
                  <div className="text-[10px] text-slate-500 font-mono">30% of total backing</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-mono">USD1 / Cash Reserves</div>
                  <div className="text-xl font-black text-white font-mono mt-1">$245,000</div>
                  <div className="text-[10px] text-slate-500 font-mono">10% of total backing</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NETWORK NODES (from PlatformPage) */}
        {activeTab === 'nodes' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-950">Core Settlement Nodes Telemetry</h3>
                <p className="text-xs text-slate-500 font-mono">Low-latency cluster nodes for cloud ledger replication</p>
              </div>
              <button
                onClick={handlePingNodes}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'Pinging...' : 'Ping Cluster'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-950 text-sm">Node-SIT-01 (Sittwe)</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">ACTIVE · 14ms</span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-2">Block #2,491,012 · 99.98% Uptime</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-950 text-sm">Node-MRK-02 (Mrauk-U)</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">ACTIVE · 18ms</span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-2">Block #2,491,012 · 99.95% Uptime</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-950 text-sm">Node-KYK-03 (Kyaukphyu)</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">ACTIVE · 22ms</span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-2">Block #2,491,012 · 99.99% Uptime</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPLIANCE & VERIFICATION QUEUE (from PlatformPage) */}
        {activeTab === 'compliance' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-950">Identity &amp; Account Governance</h3>
                <p className="text-xs text-slate-500 font-mono">Review agent and merchant account applications</p>
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'UNDER_REVIEW', 'APPROVED'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setKycFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      kycFilter === f ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-50 text-slate-500 border-y border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Applicant Name</th>
                    <th className="py-2.5 px-3">ID / Handle</th>
                    <th className="py-2.5 px-3">Township</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {kycQueue.filter(item => kycFilter === 'all' || item.status === kycFilter).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-bold text-slate-950">{item.name}</td>
                      <td className="py-3 px-3 text-slate-500">{item.petharId}</td>
                      <td className="py-3 px-3 text-slate-600">{item.township}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {item.status !== 'APPROVED' ? (
                          <button
                            onClick={() => handleApproveKyc(item.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Verified ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CARDS & LIMITS */}
        {activeTab === 'cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 space-y-6">
              {/* Virtual Card Rendering */}
              <div className="p-8 rounded-3xl bg-linear-to-tr from-slate-950 via-slate-900 to-amber-900/60 text-white border border-slate-800 shadow-2xl relative min-h-[220px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArakanEmblem size={28} variant="badge" />
                    <span className="font-extrabold text-sm">Pe Thar Card</span>
                  </div>
                  <span className="font-mono text-xs text-amber-400 font-bold">AKD DEBIT</span>
                </div>

                <div className="font-mono text-lg tracking-widest text-slate-200 my-4">
                  4921 •••• •••• 8892
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-400">CARDHOLDER</div>
                    <div className="font-bold">{profile.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">EXPIRES</div>
                    <div className="font-bold">12/29</div>
                  </div>
                </div>
              </div>

              {/* Spending Limit Slider */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-950 text-sm">Online Spending Limit</h4>
                  <span className="font-mono font-bold text-amber-600 text-sm">₳ {paymentLimit}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={paymentLimit}
                  onChange={(e) => setPaymentLimit(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>₳ 100</span>
                  <span>₳ 5,000</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <h4 className="font-bold text-slate-950 text-base">Card Security &amp; Controls</h4>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <b className="text-slate-950 text-sm block">Contactless NFC Payments</b>
                    <span className="text-xs text-slate-500">Allow tap payments on mobile terminals</span>
                  </div>
                  <span className="text-emerald-600 font-mono font-bold text-xs">ENABLED</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <b className="text-slate-950 text-sm block">Offline ATM Withdrawals</b>
                    <span className="text-xs text-slate-500">Withdraw physical cash at authorized agents</span>
                  </div>
                  <span className="text-emerald-600 font-mono font-bold text-xs">ENABLED</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* SEND MODAL */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-950 text-base">Send AKD (1 ₳ = 1 $)</h3>
              <button onClick={() => setSendModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {sendSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-950">Transfer Successful</h4>
                <p className="text-xs text-slate-500">₳ {sendAmount} sent to {recipient}</p>
              </div>
            ) : (
              <form onSubmit={handleExecuteSend} className="space-y-3">
                <div>
                  <label className="text-xs font-mono font-bold text-slate-600 block mb-1">Recipient ID / Handle</label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. AKD-8891-JACK or email"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-slate-600 block mb-1">Amount (₳)</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-slate-600 block mb-1">Memo (Optional)</label>
                  <input
                    type="text"
                    value={sendMemo}
                    onChange={(e) => setSendMemo(e.target.value)}
                    placeholder="e.g. Lunch or supplies"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 font-bold text-xs text-slate-950 font-mono transition-all"
                  >
                    {isSending ? 'Sending Transfer...' : 'Confirm & Send ₳'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* RECEIVE MODAL */}
      {receiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setReceiveModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-48 h-48 mx-auto bg-slate-900 p-4 rounded-2xl flex flex-col items-center justify-center text-white">
              <QrCode className="w-24 h-24 text-amber-400 mb-2" />
              <span className="text-[10px] font-mono text-slate-300">SCAN TO PAY</span>
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400">Your Wallet Address</div>
              <div className="text-sm font-black text-slate-950 font-mono mt-0.5">{profile.petharId}</div>
            </div>
            <button
              onClick={handleCopyId}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-xs"
            >
              {copiedId ? 'Copied to Clipboard!' : 'Copy Wallet ID'}
            </button>
          </div>
        </div>
      )}

      {/* SAVE / VAULT DEPOSIT MODAL */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-950 text-base">Add to Vault</h3>
              <button onClick={() => setSaveModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            {saveSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-950">Deposited into Vault</h4>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Earn 4.5% APY while maintaining instant liquidity in ₳ (1 ₳ = 1 $).
                </p>
                <div>
                  <label className="text-xs font-mono font-bold text-slate-600 block mb-1">Deposit Amount (₳)</label>
                  <input
                    type="number"
                    value={saveDepositAmount}
                    onChange={(e) => setSaveDepositAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 font-bold"
                  />
                </div>
                <button
                  onClick={handleSaveDeposit}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono"
                >
                  Confirm Vault Deposit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default DashboardPage
