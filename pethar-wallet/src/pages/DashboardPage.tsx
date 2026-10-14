import React, { useState, useMemo } from 'react'
import { ArakanEmblem } from '../components/ArakanEmblem'
import { TransactionSlip } from '../components/TransactionSlip'
import { ReceiveQRCard } from '../components/ReceiveQRCard'
import {
  Send, QrCode, Search, CheckCircle2,
  Eye, EyeOff, Zap, Bell,
  ShieldCheck, Sparkles, Smartphone,
  Wallet, TrendingUp, History,
  User, Download, Globe, Radio,
  CreditCard, Store, Layers
} from 'lucide-react'
import { transactions as initialTransactions, initialUserProfile, type UserProfile, type Txn } from '../data'
import type { Language } from '../i18n'

export type NavTabType = 'home' | 'financial' | 'history' | 'account'

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

  // Navigation Tab State (Home, Financial, History, Account)
  const [navTab, setNavTab] = useState<NavTabType>(() => {
    if (initialTab === 'treasury' || initialTab === 'financial') return 'financial'
    if (initialTab === 'history') return 'history'
    if (initialTab === 'account') return 'account'
    return 'home'
  })
  const [profile] = useState<UserProfile>(initialUserProfile)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Balance & Vault State
  const [walletBalance, setWalletBalance] = useState(1250.0)
  const [offlineBalance] = useState(240.0)
  const [coinsBalance, setCoinsBalance] = useState<number>(14)
  void theme
  void setTheme
  void onExit

  // Transactions State
  const [txList, setTxList] = useState<Txn[]>([
    {
      id: 'TX-5001',
      refId: '50059261069021',
      title: 'Transfer to MR. MYAT S***',
      titleMm: 'ဦးမြတ်စိုး သို့ ငွေလွှဲခြင်း',
      category: 'p2p',
      amount: -5.0,
      currency: 'AKD',
      time: '11 Oct 2026 02:01:08',
      status: 'VERIFIED',
      counterparty: 'MR. MYAT SOE PAI**** (004-********* -689)',
      counterpartyMm: 'ဦးမြတ်စိုးပိုင် (PromptPay/PeThar)',
      fee: 0.0,
      hash: '0x8a91f4c2901bfa829471de990c7412ae8b7244ef0182c81',
    },
    {
      id: 'TX-5002',
      refId: '50059261069022',
      title: 'Receive money from MR. MYAT S...',
      titleMm: 'ဦးမြတ်စိုး ထံမှ ငွေလက်ခံရရှိခြင်း',
      category: 'p2p',
      amount: 20.0,
      currency: 'AKD',
      time: '11 Oct 2026 14:50:22',
      status: 'SETTLED',
      counterparty: 'MR. MYAT SOE PAING',
      counterpartyMm: 'ဦးမြတ်စိုးပိုင်',
      fee: 0.0,
      hash: '0x3e11f0a829141bfa829471de990c7412ae8b7244ef',
    },
    {
      id: 'TX-5003',
      refId: '50059261069023',
      title: 'Grab Local Transportation',
      titleMm: 'Grab ယာဉ်စီးခ ပေးချေခြင်း',
      category: 'pos',
      amount: -94.0,
      currency: 'AKD',
      time: '11 Oct 2026 02:00:15',
      status: 'SETTLED',
      counterparty: 'Grab Merchant Connect',
      counterpartyMm: 'Grab ကုန်သည်ဝန်ဆောင်မှု',
      fee: 0.0,
      hash: '0x4981fa12048bfa829471de990c7412ae8b7244ef',
    },
    ...initialTransactions,
  ])

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
  const [sendAmountInput, setSendAmountInput] = useState('')
  const [sendMemoInput, setSendMemoInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Top Up form state
  const [topUpAmount, setTopUpAmount] = useState('100')
  const [topUpAsset, setTopUpAsset] = useState<'USDT' | 'USDC' | 'USD1'>('USDT')

  // Filtered transactions for search
  const filteredTransactions = useMemo(() => {
    return txList.filter((tx) => {
      const q = searchQuery.toLowerCase()
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.titleMm.includes(q) ||
        tx.counterparty.toLowerCase().includes(q) ||
        tx.refId.toLowerCase().includes(q)
      )
    })
  }, [txList, searchQuery])

  // Handle open transaction receipt
  const handleOpenReceipt = (tx: Txn) => {
    setSelectedTx(tx)
    setReceiptModalOpen(true)
  }

  // Handle Send Money execution -> Immediately displays the verified receipt with QR!
  const handleExecuteSend = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(sendAmountInput)
    if (!recipientInput || isNaN(amt) || amt <= 0 || amt > walletBalance) return

    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      const newRef = `${Math.floor(50000000000000 + Math.random() * 900000000000)}`
      const newTx: Txn = {
        id: `TX-${Date.now().toString().slice(-4)}`,
        refId: newRef,
        title: `Transfer to ${recipientInput}`,
        titleMm: `${recipientInput} သို့ ငွေလွှဲခြင်း`,
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
        counterparty: `${recipientInput} (Pe Thar Instant)`,
        counterpartyMm: `${recipientInput} (ဖေ့သာ)`,
        fee: 0.0,
        hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      }

      setWalletBalance((prev) => prev - amt)
      setTxList((prev) => [newTx, ...prev])
      setSendModalOpen(false)
      setRecipientInput('')
      setSendAmountInput('')
      setSendMemoInput('')

      // Automatically open the verified receipt with QR!
      setSelectedTx(newTx)
      setReceiptModalOpen(true)
    }, 600)
  }

  // Handle Top Up execution
  const handleExecuteTopUp = () => {
    const amt = parseFloat(topUpAmount) || 0
    if (amt > 0) {
      setWalletBalance((prev) => prev + amt)
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
        hash: `0x${Math.random().toString(16).slice(2, 12)}`,
      }
      setTxList((prev) => [newTx, ...prev])
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans flex flex-col pb-24 md:pb-8">
      {/* ── TOP ORANGE GRADIENT FINTECH HEADER (Matching TrueMoney ref_04.jpg) ── */}
      <div className="bg-gradient-to-r from-[#FF6B00] via-[#FA5A00] to-[#FF8500] text-white pt-3 pb-24 px-4 sm:px-6 relative overflow-hidden shadow-lg">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Top Status & Brand Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => (onExit ? onExit() : (window.location.href = '/'))}
                className="flex items-center gap-2 bg-black/15 hover:bg-black/25 px-2.5 py-1 rounded-full transition-colors"
                title="Back to Landing Page"
              >
                <ArakanEmblem size={24} variant="badge" />
                <span className="font-black text-sm tracking-tight text-white">Pe Thar</span>
              </button>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-white/20 text-white">
                1 ₳ = 1 $
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Coin Badge (ref_04.jpg) */}
              <button
                onClick={() => setCoinsBalance((c) => c + 1)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 hover:bg-black/30 text-amber-300 text-xs font-bold transition shadow-xs"
              >
                <span className="text-amber-300 font-black">🪙</span>
                <span>{coinsBalance} ₳</span>
              </button>

              {/* Notification Bell with Badge (ref_04.jpg) */}
              <button className="relative w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition">
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[9px] font-bold flex items-center justify-center shadow-xs">
                  4
                </span>
              </button>

              {/* Language Switcher */}
              {setLang && (
                <button
                  onClick={() => setLang(ak ? 'en' : 'ak')}
                  className="px-2 py-1 rounded-full bg-black/20 text-[11px] font-bold"
                >
                  {ak ? 'AK' : 'EN'}
                </button>
              )}
            </div>
          </div>

          {/* Search Bar (Matching ref_04.jpg) */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={ak ? 'ရှာဖွေရန် (ငွေလွှဲ၊ ဝန်ဆောင်မှု၊ အမည်)...' : 'Search services, transactions, contacts...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md text-white placeholder-white/70 text-xs font-medium border border-white/20 focus:outline-none focus:bg-white/25 focus:border-white transition-all shadow-inner"
            />
          </div>

          {/* 4 CORE ACTION BUTTONS (Transfer, Receive, Tap to Pay, Pay - ref_04.jpg) */}
          <div className="grid grid-cols-4 gap-2 pt-2 text-center">
            {/* Transfer */}
            <button
              onClick={() => setSendModalOpen(true)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-13 h-13 rounded-2xl bg-white/20 group-hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm transition-transform active:scale-95">
                <Send size={22} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-[11px] font-bold tracking-tight text-white/95">
                {ak ? 'ငွေလွှဲ' : 'Transfer'}
              </span>
            </button>

            {/* Receive (ref_03.jpg) */}
            <button
              onClick={() => setReceiveModalOpen(true)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-13 h-13 rounded-2xl bg-white/20 group-hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm transition-transform active:scale-95">
                <Download size={22} className="rotate-180" />
              </div>
              <span className="text-[11px] font-bold tracking-tight text-white/95">
                {ak ? 'ငွေလက်ခံ' : 'Receive'}
              </span>
            </button>

            {/* Tap to Pay (Offline NFC/BLE) */}
            <button
              onClick={() => setOfflineBeamModalOpen(true)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-13 h-13 rounded-2xl bg-white/20 group-hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm transition-transform active:scale-95">
                <Radio size={22} className="text-amber-200" />
              </div>
              <span className="text-[11px] font-bold tracking-tight text-white/95">
                {ak ? 'တိုက်ရိုက်ပေး' : 'Tap to Pay'}
              </span>
            </button>

            {/* Pay / Scan QR */}
            <button
              onClick={() => setReceiveModalOpen(true)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-13 h-13 rounded-2xl bg-white/20 group-hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm transition-transform active:scale-95">
                <QrCode size={22} />
              </div>
              <span className="text-[11px] font-bold tracking-tight text-white/95">
                {ak ? 'QR ရှင်းမည်' : 'Pay'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER (Overlapping Floating Card) ── */}
      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 -mt-16 space-y-5 z-10 flex-1">
        {/* ── 1. FLOATING WALLET BALANCE CARD (ref_04.jpg) ── */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
              <Wallet size={16} className="text-[#FF6B00]" />
              <span>{ak ? 'ဖေ့သာ ပိုက်ဆံအိတ်' : 'Pe Thar Wallet'}</span>
              <button
                onClick={() => setBalanceVisible((v) => !v)}
                className="text-slate-400 hover:text-slate-700"
              >
                {balanceVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>

            <button
              onClick={() => setTopUpModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition shadow-xs active:scale-95 flex items-center gap-1"
            >
              <Sparkles size={12} />
              <span>{ak ? 'ငွေဖြည့်မည်' : 'Top Up'}</span>
            </button>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-950 flex items-baseline gap-1.5">
              <span className="text-2xl text-slate-400 font-bold">₳</span>
              <span>
                {balanceVisible
                  ? walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : '••••••'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              1 ₳ = $1.00 USD · 100% USDT/USDC Backed
            </p>
          </div>

          {/* Secondary Offline Balance Row */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{ak ? 'အော့ဖ်လိုင်း လက်ကျန်' : 'Offline Bearer Tokens'}:</span>
              <b className="font-mono text-slate-900">₳ {offlineBalance.toFixed(2)}</b>
            </div>
            <button
              onClick={() => setOfflineBeamModalOpen(true)}
              className="text-[#FF6B00] hover:underline font-bold text-[11px]"
            >
              {ak ? 'စီမံမည် ›' : 'Manage ›'}
            </button>
          </div>
        </div>

        {/* ── 2. QUICK SERVICES GRID (8 Tiles matching ref_04.jpg) ── */}
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-4">
          <div className="grid grid-cols-4 gap-y-5 gap-x-2 text-center">
            {/* Tile 1: Tap to Pay */}
            <button
              onClick={() => setOfflineBeamModalOpen(true)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] group-hover:bg-orange-100 flex items-center justify-center transition shadow-2xs">
                <Radio size={20} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {ak ? 'အော့ဖ်လိုင်း' : 'Tap to Pay'}
              </span>
            </button>

            {/* Tile 2: Redeem Coin */}
            <button
              onClick={() => alert(ak ? '၁ ₳ = ၁ $ အမှတ်များ စုဆောင်းပါ' : 'Redeem Pe Thar Reward Coins')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 flex items-center justify-center transition shadow-2xs">
                <span className="text-xl">🪙</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {ak ? 'အမှတ်လဲ' : 'Redeem Coin'}
              </span>
            </button>

            {/* Tile 3: Merchant Shop */}
            <button
              onClick={() => setNavTab('financial')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 flex items-center justify-center transition shadow-2xs">
                <Store size={20} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {ak ? 'ကုန်သည်ဆိုင်' : 'SME Shop'}
              </span>
            </button>

            {/* Tile 4: Transfer to Myanmar */}
            <button
              onClick={() => setSendModalOpen(true)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 flex items-center justify-center transition shadow-2xs">
                <Globe size={20} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {ak ? 'မြန်မာသို့လွှဲ' : 'Myanmar Pay'}
              </span>
            </button>

            {/* Tile 5: Crypto Gateway */}
            <button
              onClick={() => setTopUpModalOpen(true)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 flex items-center justify-center transition shadow-2xs">
                <Zap size={20} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {ak ? 'ဒေါ်လာလဲ' : 'USDT Swap'}
              </span>
            </button>

            {/* Tile 6: E-Receipt Verifier */}
            <button
              onClick={() => {
                if (txList.length > 0) handleOpenReceipt(txList[0])
              }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 flex items-center justify-center transition shadow-2xs">
                <ShieldCheck size={20} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {ak ? 'ပြေစာစစ်' : 'E-Receipt'}
              </span>
            </button>

            {/* Tile 7: Security & Keys */}
            <button
              onClick={() => setNavTab('account')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 flex items-center justify-center transition shadow-2xs">
                <CreditCard size={20} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {ak ? 'ကတ်/လုံခြုံရေး' : 'Security'}
              </span>
            </button>

            {/* Tile 8: See All (ref_07.jpg & ref_08.jpg) */}
            <button
              onClick={() => setAllServicesModalOpen(true)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 group-hover:bg-slate-200 flex items-center justify-center transition shadow-2xs">
                <Layers size={20} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {ak ? 'အားလုံး' : 'See All'}
              </span>
            </button>
          </div>
        </div>

        {/* ── 3. SMART ALERT BANNER (Matching ref_04.jpg) ── */}
        <div className="p-4 rounded-2xl bg-[#FFF5EB] border border-[#FFD9B3] flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            📢
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-xs text-slate-900">
              {ak ? 'အော့ဖ်လိုင်းမုဒ် အသင့်ရှိသည်' : 'Offline Mode Standby Ready'}
            </h4>
            <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
              {ak
                ? 'အင်တာနက် လုံးဝပြတ်တောက်နေချိန်တွင်လည်း Bluetooth နှင့် NFC ဖြင့် ငွေလွှဲနိုင်ပါသည်။'
                : 'Transact without internet via bearer token beam on Android & iOS.'}
            </p>
          </div>
          <button
            onClick={() => setOfflineBeamModalOpen(true)}
            className="text-xs font-bold text-[#FF6B00] hover:underline shrink-0"
          >
            {ak ? 'စမ်းမည် ›' : 'Try ›'}
          </button>
        </div>

        {/* ── 4. FINANCIAL SERVICES CAROUSEL (Matching ref_05.jpg) ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900 tracking-tight">
              {ak ? 'မြန်မာနှင့် ရခိုင်ဒေသအတွက် ဝန်ဆောင်မှုများ' : 'Services for Myanmar & Arakan Users'}
            </h3>
            <span className="text-[11px] font-bold text-[#FF6B00] hover:underline cursor-pointer">
              {ak ? 'အားလုံးကြည့်ရန်' : 'See All'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* KBZPay Bridge Card */}
            <div
              onClick={() => setSendModalOpen(true)}
              className="p-4 rounded-2xl bg-linear-to-br from-blue-900 to-blue-950 text-white cursor-pointer hover:shadow-md transition space-y-2 border border-blue-800"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-[10px] font-bold">KBZPay</span>
                <span className="text-xs font-mono font-bold text-blue-300">1 ₳ = 1 $</span>
              </div>
              <h4 className="font-extrabold text-xs">KBZPay သို့ငွေလွှဲပါ</h4>
              <p className="text-[10px] text-blue-200">လွယ်ကူမြန်ဆန် စိတ်ချရ</p>
            </div>

            {/* Offline Starlink Card */}
            <div
              onClick={() => setOfflineBeamModalOpen(true)}
              className="p-4 rounded-2xl bg-linear-to-br from-amber-600 to-orange-700 text-white cursor-pointer hover:shadow-md transition space-y-2 border border-amber-500"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-amber-800 text-[10px] font-bold">Offline</span>
                <span className="text-xs font-mono font-bold text-amber-200">Zero Internet</span>
              </div>
              <h4 className="font-extrabold text-xs">အော့ဖ်လိုင်းငွေသားလွှဲ</h4>
              <p className="text-[10px] text-amber-100">လူချင်းတိုက်ရိုက်လွှဲမည်</p>
            </div>
          </div>
        </div>

        {/* ── 5. RECENT TRANSACTIONS (Matching ref_10.jpg with E-Receipt click) ── */}
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-black text-sm text-slate-900 tracking-tight">
                {ak ? 'ငွေလွှဲမှတ်တမ်း' : 'Transaction History'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {ak ? 'ပြေစာနှင့် QR Code စစ်ဆေးရန် နှိပ်ပါ' : 'Tap any transaction to view Verified E-Receipt'}
              </p>
            </div>
            <button
              onClick={() => setNavTab('history')}
              className="text-xs font-bold text-[#FF6B00] hover:underline"
            >
              {ak ? 'အားလုံးကြည့်မည်' : 'See All'}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTransactions.slice(0, 5).map((tx) => {
              const isPositive = tx.amount > 0
              return (
                <div
                  key={tx.id}
                  onClick={() => handleOpenReceipt(tx)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                        isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isPositive ? '↓' : '↑'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs text-slate-900 truncate group-hover:text-[#FF6B00] transition-colors">
                        {ak ? tx.titleMm || tx.title : tx.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>{tx.time}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                          <CheckCircle2 size={10} /> QR Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono font-black text-sm ${
                        isPositive ? 'text-emerald-600' : 'text-slate-950'
                      }`}
                    >
                      {isPositive ? '+' : ''}₳{' '}
                      {Math.abs(tx.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">Ref: {tx.refId.slice(-6)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 6. WEEKLY SPENDING CHART (Matching ref_10.jpg) ── */}
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-slate-900 tracking-tight">
                {ak ? 'ဤအပတ် သုံးစွဲမှု' : "This week's spending"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {ak ? 'မနေ့ကအထိ စာရင်းတွက်ချက်ထားပါသည်' : 'Spending data updated in real-time'}
              </p>
            </div>
            <span className="text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer">
              {ak ? 'အသေးစိတ်' : 'See All'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{ak ? 'စုစုပေါင်း' : 'Total spending'}</span>
              <div className="text-lg font-black font-mono text-slate-900 mt-0.5">₳ 99.00</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{ak ? 'ပျမ်းမျှ' : 'Average spending'}</span>
              <div className="text-lg font-black font-mono text-slate-900 mt-0.5">₳ 14.14</div>
            </div>
          </div>

          {/* Bar Chart Bars (Mon to Sun) */}
          <div className="grid grid-cols-7 gap-2 pt-2 items-end h-28 text-center text-[10px] font-mono text-slate-500">
            {[
              { day: 'Mon', h: '35%', amt: '₳ 5' },
              { day: 'Tue', h: '20%', amt: '₳ 0' },
              { day: 'Wed', h: '80%', amt: '₳ 94' },
              { day: 'Thu', h: '15%', amt: '₳ 0' },
              { day: 'Fri', h: '25%', amt: '₳ 0' },
              { day: 'Sat', h: '10%', amt: '₳ 0' },
              { day: 'Sun', h: '10%', amt: '₳ 0' },
            ].map((col, idx) => (
              <div key={col.day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  style={{ height: col.h }}
                  className={`w-full rounded-full transition-all ${
                    idx === 2 ? 'bg-[#FF6B00]' : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                />
                <span className="font-bold text-[10px]">{col.day}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── BOTTOM NAVIGATION BAR (Matching ref_04.jpg, ref_09.jpg, ref_10.jpg) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-2xl py-2 px-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-around relative">
          {/* Home */}
          <button
            onClick={() => setNavTab('home')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              navTab === 'home' ? 'text-[#FF6B00]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Wallet size={20} />
            <span>{ak ? 'ပင်မ' : 'Home'}</span>
          </button>

          {/* Financial / Treasury (ref_09.jpg) */}
          <button
            onClick={() => setNavTab('financial')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              navTab === 'financial' ? 'text-[#FF6B00]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <TrendingUp size={20} />
            <span>{ak ? 'ဘဏ္ဍာရေး' : 'Financial'}</span>
          </button>

          {/* CENTER FLOATING ACTION BUTTON (SCAN QR / PAY - ref_04.jpg) */}
          <div className="relative -top-5">
            <button
              onClick={() => setReceiveModalOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#FF8500] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border-4 border-[#F4F6F9]"
              title="Pay / Scan QR"
            >
              <QrCode size={26} />
            </button>
          </div>

          {/* History (ref_10.jpg) */}
          <button
            onClick={() => setNavTab('history')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              navTab === 'history' ? 'text-[#FF6B00]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <History size={20} />
            <span>{ak ? 'မှတ်တမ်း' : 'History'}</span>
          </button>

          {/* Account */}
          <button
            onClick={() => setNavTab('account')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              navTab === 'account' ? 'text-[#FF6B00]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User size={20} />
            <span>{ak ? 'အကောင့်' : 'Account'}</span>
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          MODAL 1: VERIFIED E-RECEIPT WITH SCANNABLE QR (ref_01 & ref_02)
         ══════════════════════════════════════════════════════════════ */}
      {receiptModalOpen && selectedTx && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
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
              recipientType={selectedTx.category === 'p2p' ? 'Pe Thar Instant Pay' : 'Offline Mode Token'}
              senderName={profile.name || 'MYAT SOE P****'}
              senderId={`Pe Thar Wallet ${profile.petharId}`}
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

      {/* ══════════════════════════════════════════════════════════════
          MODAL 2: RECEIVE QR PAYMENT CARD (ref_03.jpg)
         ══════════════════════════════════════════════════════════════ */}
      {receiveModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setReceiveModalOpen(false)}
        >
          <div
            className="w-full max-w-sm my-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <ReceiveQRCard
              lang={lang}
              name={profile.name || 'MYAT SOE PAING'}
              petharId={profile.petharId || '140-********* -295'}
              onClose={() => setReceiveModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL 3: TRANSFER / SEND MONEY FORM (Generates Verified Receipt!)
         ══════════════════════════════════════════════════════════════ */}
      {sendModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSendModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="font-black text-base text-slate-950">
                  {ak ? 'ငွေလွှဲမည် (Transfer ₳)' : 'Send Money'}
                </h3>
              </div>
              <button
                onClick={() => setSendModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleExecuteSend} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  {ak ? 'လက်ခံသူ အကောင့် / ဖုန်း / အိုင်ဒီ' : 'Recipient Name / Phone / ID'}
                </label>
                <input
                  type="text"
                  required
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder="e.g. MR. MYAT SOE PAING / 004-9812"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  {ak ? 'လွှဲပို့ငွေပမာဏ (₳ AKD)' : 'Amount (1 ₳ = 1 $ USD)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₳</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={walletBalance}
                    required
                    value={sendAmountInput}
                    onChange={(e) => setSendAmountInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-black focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>{ak ? 'ရရှိနိုင်သော လက်ကျန်' : 'Available'}: ₳ {walletBalance.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => setSendAmountInput('50')}
                    className="text-[#FF6B00] font-bold hover:underline"
                  >
                    Quick 50
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  {ak ? 'မှတ်ချက် (ရွေးချယ်နိုင်သည်)' : 'Notes / Memo'}
                </label>
                <input
                  type="text"
                  value={sendMemoInput}
                  onChange={(e) => setSendMemoInput(e.target.value)}
                  placeholder="e.g. Payment for solar kit"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                {ak
                  ? 'ငွေလွှဲပြီးပါက တရားဝင်စစ်ဆေးနိုင်သော QR Code ပါသည့် E-Receipt ချက်ချင်း ထွက်လာပါမည်။'
                  : 'Upon transfer, a verified E-Receipt with scannable QR code will be generated.'}
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#FF8500] text-white font-black text-xs shadow-md transition-transform active:scale-98 disabled:opacity-50"
              >
                {isSending ? (ak ? 'ငွေလွှဲနေပါသည်...' : 'Processing...') : ak ? 'အတည်ပြုလွှဲမည်' : 'Confirm & Send'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL 4: TOP UP (USDT / USDC / USD1 Stablecoin Gateway)
         ══════════════════════════════════════════════════════════════ */}
      {topUpModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setTopUpModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="font-black text-base text-slate-950">
                  {ak ? 'ဒေါ်လာ အရန်ငွေဖြင့် ငွေဖြည့်မည်' : 'Top Up (1 ₳ = 1 $ USD)'}
                </h3>
              </div>
              <button
                onClick={() => setTopUpModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  {ak ? 'အရန်ငွေကြေး ရွေးချယ်ပါ' : 'Select Stablecoin Collateral'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['USDT', 'USDC', 'USD1'] as const).map((coin) => (
                    <button
                      key={coin}
                      type="button"
                      onClick={() => setTopUpAsset(coin)}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition ${
                        topUpAsset === coin
                          ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {coin}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  {ak ? 'ဖြည့်သွင်းငွေပမာဏ' : 'Deposit Amount'}
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-black"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Deposit:</span>
                  <span className="font-bold text-slate-900">${topUpAmount} {topUpAsset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Credit:</span>
                  <span className="font-bold text-[#FF6B00]">₳ {topUpAmount} AKD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rate:</span>
                  <span className="text-emerald-600 font-bold">1 ₳ = 1.00 USD (0% fee)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteTopUp}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#FF8500] text-white font-black text-xs shadow-md active:scale-98"
              >
                {ak ? 'ချက်ချင်း ငွေဖြည့်မည်' : 'Deposit Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL 5: TAP TO PAY / OFFLINE BEAM MODAL
         ══════════════════════════════════════════════════════════════ */}
      {offlineBeamModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setOfflineBeamModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 text-white space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl animate-pulse">
              📶
            </div>
            <div>
              <h3 className="font-black text-lg text-white">
                {ak ? 'အော့ဖ်လိုင်းမုဒ် (Offline Mode)' : 'Tap to Pay (Offline)'}
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

      {/* ══════════════════════════════════════════════════════════════
          MODAL 6: ALL SERVICES SHEET (Matching ref_07.jpg & ref_08.jpg)
         ══════════════════════════════════════════════════════════════ */}
      {allServicesModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
          onClick={() => setAllServicesModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white max-h-[85vh] overflow-y-auto p-6 text-slate-900 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-950">{ak ? 'ဝန်ဆောင်မှု အားလုံး' : 'All Services'}</h3>
              <button
                onClick={() => setAllServicesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Category 1: Services for Merchant and Business */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {ak ? 'ကုန်သည်နှင့် စီးပွားရေး ဝန်ဆောင်မှုများ' : 'Services for Merchant and Business'}
              </h4>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1.5 cursor-pointer hover:bg-slate-100">
                  <Store size={22} className="text-[#FF6B00]" />
                  <span className="text-[10px] font-semibold">Pe Thar Shop</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1.5 cursor-pointer hover:bg-slate-100">
                  <Download size={22} className="text-emerald-600" />
                  <span className="text-[10px] font-semibold">Receive Fee</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1.5 cursor-pointer hover:bg-slate-100">
                  <Sparkles size={22} className="text-amber-600" />
                  <span className="text-[10px] font-semibold">Top Up Fee</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1.5 cursor-pointer hover:bg-slate-100">
                  <Send size={22} className="text-blue-600" />
                  <span className="text-[10px] font-semibold">Transfer Fee</span>
                </div>
              </div>
            </div>

            {/* Category 2: Travel & Cross Border */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {ak ? 'နယ်စပ်ဖြတ်ကျော်နှင့် ခရီးသွား' : 'Travel & Remittance'}
              </h4>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1.5 cursor-pointer hover:bg-slate-100">
                  <Globe size={22} className="text-indigo-600" />
                  <span className="text-[10px] font-semibold">Overseas Pay</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1.5 cursor-pointer hover:bg-slate-100">
                  <Smartphone size={22} className="text-cyan-600" />
                  <span className="text-[10px] font-semibold">Roaming Pack</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1.5 cursor-pointer hover:bg-slate-100">
                  <CreditCard size={22} className="text-rose-600" />
                  <span className="text-[10px] font-semibold">Travel+</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1.5 cursor-pointer hover:bg-slate-100">
                  <Radio size={22} className="text-amber-600" />
                  <span className="text-[10px] font-semibold">Starlink Mesh</span>
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
