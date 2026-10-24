import React, { useState, useEffect, useMemo } from 'react'
import {
  ArrowUpRight, ArrowDownLeft, QrCode, CreditCard,
  ShieldCheck, Send, Search,
  Eye, EyeOff, Lock, Unlock, Copy,
  Sparkles, Layers, Globe, ArrowRight, CheckCircle2, ArrowLeft,
  Sun, Moon, Radio, MessageSquare, RefreshCw, AlertCircle
} from 'lucide-react'
import QRCode from 'qrcode'
import { ArakanEmblem } from '../components/ArakanEmblem'
import { TransactionSlip } from '../components/TransactionSlip'
import type { Language } from '../i18n'
import { initialUserProfile, type Txn, type UserProfile } from '../data'
import {
  fetchTransactionsFromDb,
  fetchUserProfileFromDb,
  insertTransactionToDb,
  updateUserBalanceInDb,
} from '../services/walletDatabase'

export interface AppPageProps {
  lang?: Language
  setLang?: (lang: Language) => void
  onBack?: () => void
}

export type CustomerPortalTab =
  | 'overview'
  | 'send'
  | 'receive'
  | 'card'
  | 'web3'
  | 'offline'
  | 'support'

export interface ChatMessage {
  id: string
  sender: 'user' | 'operator'
  text: string
  time: string
  channel: 'mobilewallet' | 'android' | 'web'
}

const CHAT_STORAGE_KEY = 'pethar_customer_chat_messages'

export const AppPage: React.FC<AppPageProps> = ({
  lang = 'ak',
  setLang,
  onBack,
}) => {
  const isAk = lang === 'ak'

  // Theme Mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pethar_theme')
      if (stored === 'dark' || stored === 'light') return stored
    }
    return 'light'
  })

  const isDark = theme === 'dark'

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('pethar_theme', next)
  }

  // Active customer tab
  const [activeTab, setActiveTab] = useState<CustomerPortalTab>('overview')

  // User Profile & Balances
  const [profile, setProfile] = useState<UserProfile>(initialUserProfile)
  const [balance, setBalance] = useState<number>(12500.0)
  const [balanceHidden, setBalanceHidden] = useState<boolean>(false)
  const [txList, setTxList] = useState<Txn[]>([])
  const [selectedTxn, setSelectedTxn] = useState<Txn | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  // Send Money Form
  const [sendRecipient, setSendRecipient] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendNote, setSendNote] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [sendError, setSendError] = useState('')

  // Receive QR Form
  const [qrRequestAmount, setQrRequestAmount] = useState('0.00')
  const [qrDataUrl, setQrDataUrl] = useState('')

  // Virtual Card Controls
  const [isCardFrozen, setIsCardFrozen] = useState(false)
  const [showCardNumber, setShowCardNumber] = useState(false)
  const [onlineEnabled, setOnlineEnabled] = useState(true)
  const [dailyLimit, setDailyLimit] = useState(500)

  // Web3 Cross-Chain Bridge
  const [selectedChain, setSelectedChain] = useState<'polygon' | 'bsc' | 'arbitrum'>('polygon')
  const [bridgeAmount, setBridgeAmount] = useState('500.00')
  const [bridgeSimulating, setBridgeSimulating] = useState(false)
  const [bridgeComplete, setBridgeComplete] = useState(false)

  // Offline BLE Tap
  const [offlineSyncing, setOfflineSyncing] = useState(false)
  const [offlineTokenReady, setOfflineTokenReady] = useState(false)

  // Customer Chat Messages (Synced with internal company dashboard via localStorage)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(CHAT_STORAGE_KEY)
        if (stored) return JSON.parse(stored)
      } catch {}
    }
    return [
      {
        id: 'msg-init-1',
        sender: 'operator',
        channel: 'mobilewallet',
        text: isAk
          ? 'မင်္ဂလာပါ! Péthar ဖောက်သည်ဝန်ဆောင်မှုဌာနမှ ကြိုဆိုပါသည်။ ငွေလွှဲခြင်း၊ 1:1 ဒေါ်လာဖလှယ်ခြင်းနှင့် စာရွက်စာတမ်းစိစစ်ခြင်းများကို ကူညီပေးနိုင်ပါသည်။'
          : 'Welcome to Péthar Customer Support! How can we assist with your wallet, 1:1 USD exchange, or verification today?',
        time: '10:00 AM',
      },
    ]
  })

  // Load User Profile and Transactions from DB
  useEffect(() => {
    let isMounted = true
    fetchUserProfileFromDb().then((up) => {
      if (isMounted && up) {
        setBalance(up.balance)
        setProfile((prev) => ({
          ...prev,
          name: up.name || prev.name,
          phone: up.phone || prev.phone,
          petharId: up.uid || prev.petharId,
          uid: up.uid || prev.uid || '',
          nationalIdNo: up.nationalIdNo || prev.nationalIdNo,
        }))
      }
    })

    fetchTransactionsFromDb().then((txs) => {
      if (isMounted && txs.length > 0) setTxList(txs)
    })

    return () => {
      isMounted = false
    }
  }, [])

  // Sync Customer Chat Messages across tabs and storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CHAT_STORAGE_KEY && e.newValue) {
        try {
          setChatMessages(JSON.parse(e.newValue))
        } catch {}
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Generate dynamic Arakan QR Code
  useEffect(() => {
    const payload = `pethar://pay?to=${encodeURIComponent(profile.petharId)}&name=${encodeURIComponent(
      profile.name
    )}&amount=${qrRequestAmount}&curr=AKD`
    QRCode.toDataURL(payload, {
      margin: 1,
      width: 260,
      color: { dark: '#0a0f1d', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
      .then(setQrDataUrl)
      .catch(() => {})
  }, [profile.petharId, profile.name, qrRequestAmount])

  // Multi-currency balances
  const currencyAccounts = [
    { code: 'AKD', symbol: '₳', name: isAk ? 'အာရက္ခဒေါ်လာ' : 'Arakan Dollar', amount: balance, flag: '🇲🇲' },
    { code: 'USD', symbol: '$', name: isAk ? 'အမေရိကန်ဒေါ်လာ (Crypto Gateway)' : 'United States Dollar (Crypto Gateway)', amount: balance, flag: '🇺🇸' },
    { code: 'USDT', symbol: '₮', name: 'Tether TRC-20 / ERC-20', amount: balance, flag: '🌐' },
    { code: 'USDC', symbol: '₵', name: 'USD Coin (Native)', amount: balance, flag: '🌐' },
  ]

  // Frequent Contact shortcuts
  const quickRecipients = [
    { name: 'Ko Min Aung', id: '202610190002', avatar: 'M' },
    { name: 'Daw Nilar Win', id: '202610190003', avatar: 'N' },
    { name: 'U Kyaw Zeya', id: '202610190004', avatar: 'K' },
    { name: 'Ma Aye Aye', id: '202610190005', avatar: 'A' },
  ]

  // Filtered transactions
  const filteredTxns = useMemo(() => {
    return txList.filter((tx) => {
      const matchesCat = filterCategory === 'all' || tx.category === filterCategory
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        tx.title.toLowerCase().includes(q) ||
        tx.titleMm.includes(q) ||
        tx.counterparty.toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })
  }, [txList, filterCategory, searchQuery])

  // Copy helper
  const handleCopyId = () => {
    navigator.clipboard?.writeText(profile.petharId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(profile.walletAddress || 'akd_node_99a820fc')
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  // Execute instant transfer
  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSendError('')

    const amt = parseFloat(sendAmount)
    if (!sendRecipient) {
      setSendError(isAk ? 'လက်ခံသူ ထည့်သွင်းပါ' : 'Please specify a recipient')
      return
    }
    if (isNaN(amt) || amt <= 0) {
      setSendError(isAk ? 'ပမာဏ မှန်ကန်စွာ ထည့်သွင်းပါ' : 'Please enter a valid amount')
      return
    }
    if (amt > balance) {
      setSendError(isAk ? 'လက်ကျန်ငွေ မလုံလောက်ပါ' : 'Insufficient balance')
      return
    }

    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      const newRef = `${Math.floor(50000000000000 + Math.random() * 900000000000)}`
      const newTx: Txn = {
        id: `TX-${Date.now().toString().slice(-4)}`,
        refId: newRef,
        title: `Transfer to ${sendRecipient}`,
        titleMm: `${sendRecipient} သို့ ငွေလွှဲခြင်း`,
        category: 'transfer',
        amount: -amt,
        currency: 'AKD',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'VERIFIED',
        counterparty: sendRecipient,
        counterpartyMm: sendRecipient,
        fee: 0.0,
        hash: `0x${Math.random().toString(16).slice(2, 12)}`,
      }

      const updated = Math.max(0, balance - amt)
      setBalance(updated)
      setTxList((prev) => [newTx, ...prev])
      insertTransactionToDb(newTx)
      updateUserBalanceInDb(updated)

      setSendSuccess(true)
      setTimeout(() => {
        setSendSuccess(false)
        setSendRecipient('')
        setSendAmount('')
        setSendNote('')
        setSelectedTxn(newTx)
      }, 700)
    }, 500)
  }

  // Simulate Web3 Cross-Chain Bridge
  const handleSimulateBridge = () => {
    setBridgeSimulating(true)
    setBridgeComplete(false)
    setTimeout(() => {
      setBridgeSimulating(false)
      setBridgeComplete(true)
      const bridgeAmt = parseFloat(bridgeAmount) || 500
      const newBal = balance + bridgeAmt
      setBalance(newBal)
      updateUserBalanceInDb(newBal)

      const bridgeTx: Txn = {
        id: `TX-BR-${Date.now().toString().slice(-4)}`,
        refId: `${Math.floor(50000000000000 + Math.random() * 900000000000)}`,
        title: `Web3 Bridge from ${selectedChain.toUpperCase()}`,
        titleMm: `${selectedChain.toUpperCase()} မှ Web3 တံတား ငွေသွင်းခြင်း`,
        category: 'crypto',
        amount: bridgeAmt,
        currency: 'AKD',
        time: 'Just now',
        status: 'VERIFIED',
        counterparty: `Lock Contract (${bridgeAmt} USDT)`,
        counterpartyMm: `Web3 စမတ်ကန်ထရိုက်`,
        fee: 0.0,
        hash: `0x${Math.random().toString(16).slice(2, 14)}`,
      }
      setTxList((prev) => [bridgeTx, ...prev])
      insertTransactionToDb(bridgeTx)
    }, 1000)
  }

  // Send Customer Chat Message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      channel: 'mobilewallet',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const updated = [...chatMessages, newMsg]
    setChatMessages(updated)
    setChatInput('')
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated))

    // Automated simulated response if no operator responds in 2.5 seconds
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'operator',
        channel: 'mobilewallet',
        text: isAk
          ? 'သင်၏ မက်ဆေ့ခ်ျကို လက်ခံရရှိပါသည်။ တာဝန်ကျ အော်ပရေတာက စစ်ဆေးနေပါသည် (Ref ID: ' +
            Math.floor(100000 + Math.random() * 900000) +
            ')'
          : 'Thank you for reaching out. A compliance officer has received your inquiry and is reviewing your ledger record (Ref ID: ' +
            Math.floor(100000 + Math.random() * 900000) +
            ').',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      const withReply = [...updated, autoReply]
      setChatMessages(withReply)
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(withReply))
    }, 1800)
  }

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-[#0B0F19] text-white' : 'bg-[#F8FAFC] text-slate-900'
      } font-sans flex flex-col transition-colors duration-200`}
    >
      {/* ── TOP CITIZEN / CUSTOMER HEADER ── */}
      <header
        className={`sticky top-0 z-40 px-4 sm:px-8 py-3.5 border-b backdrop-blur-md flex items-center justify-between transition-colors ${
          isDark
            ? 'bg-[#111827]/90 border-slate-800'
            : 'bg-white/95 border-slate-200/90 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className={`p-2 rounded-xl transition ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8500] p-1.5 shadow-md flex items-center justify-center shrink-0">
              <ArakanEmblem size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-slate-950 dark:text-white">Péthar</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/25">
                  {isAk ? 'သုံးစွဲသူ ဝေါလက်' : 'Customer Wallet'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isAk ? 'အာရက္ခဒေါ်လာ & 1:1 ဒစ်ဂျစ်တယ်ငွေကြေးစနစ်' : 'Arakan Dollar • 1:1 Sovereign Digital Currency'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Navigation & Customer Profile Pill */}
        <div className="flex items-center gap-2.5">
          {/* Peg Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>1 ₳ = $1.00 USD</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Language Switcher */}
          {setLang && (
            <button
              onClick={() => setLang(isAk ? 'en' : 'ak')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {isAk ? 'AK · အာရက္ခ' : 'EN · English'}
            </button>
          )}

          {/* Customer Profile Pill */}
          <div
            className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold leading-tight">{profile.name}</div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 justify-end">
                <span>UID: {profile.petharId}</span>
                <button
                  onClick={handleCopyId}
                  className="hover:text-amber-500 transition cursor-pointer"
                  title="Copy UID"
                >
                  <Copy size={10} />
                </button>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-[#FF6B00] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {profile.name.charAt(0)}
            </div>
          </div>

          {/* Direct Link to Company Internal Portal */}
          <a
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold transition hover:opacity-90 shadow-2xs hidden lg:flex items-center gap-1.5"
            title="Internal Staff Only"
          >
            <ShieldCheck size={14} className="text-[#FF6B00]" />
            <span>{isAk ? 'ကုမ္ပဏီ ဒက်ရှ်ဘုတ်' : 'Staff Portal'}</span>
          </a>
        </div>
      </header>

      {/* ── CUSTOMER NAVIGATION PILLS ── */}
      <nav
        className={`px-4 sm:px-8 py-2.5 border-b sticky top-[65px] z-30 overflow-x-auto no-scrollbar flex items-center gap-2 transition-colors ${
          isDark ? 'bg-[#0E1526]/90 border-slate-800/80' : 'bg-white/80 border-slate-200/80 backdrop-blur-md'
        }`}
      >
        {[
          { id: 'overview', label: isAk ? 'အကျဉ်းချုပ်' : 'Overview', icon: Layers },
          { id: 'send', label: isAk ? 'ငွေလွှဲရန်' : 'Send & Pay', icon: Send },
          { id: 'receive', label: isAk ? 'ငွေလက်ခံ QR' : 'Receive QR', icon: QrCode },
          { id: 'card', label: isAk ? 'ဗီဇာကတ်ပြား' : 'Virtual Card', icon: CreditCard },
          { id: 'web3', label: isAk ? 'Web3 တံတား' : 'Web3 Bridge', icon: Globe },
          { id: 'offline', label: isAk ? 'အော့ဖ်လိုင်း Tap' : 'Offline Beam', icon: Radio },
          { id: 'support', label: isAk ? 'အကူအညီ ရယူရန်' : 'Live Support', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CustomerPortalTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#FF6B00] text-white shadow-sm shadow-[#FF6B00]/25'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* TAB 1: OVERVIEW & WALLET */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Net Worth Hero Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1E293B] text-white p-7 sm:p-8 shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <ArakanEmblem size={220} />
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-500">
                        {isAk ? 'အာရက္ခ ပင်မအကောင့်' : 'Arakan Citizen Account'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        VERIFIED TIER 2
                      </span>
                    </div>
                    <button
                      onClick={() => setBalanceHidden(!balanceHidden)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      title={balanceHidden ? 'Show Balance' : 'Hide Balance'}
                    >
                      {balanceHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-1">
                      {isAk ? 'စုစုပေါင်း လက်ကျန်ငွေ' : 'Total Available Balance'}
                    </div>
                    <div className="flex items-baseline gap-2 font-mono">
                      <span className="text-2xl font-black text-amber-500">₳</span>
                      <span className="text-4xl sm:text-5xl font-black tracking-tight">
                        {balanceHidden
                          ? '••••••'
                          : balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-slate-400 font-sans font-bold">
                        {balanceHidden ? '' : `≈ $${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Shortcuts */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveTab('send')}
                      className="px-5 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-[#FF6B00]/30 cursor-pointer"
                    >
                      <ArrowUpRight size={16} />
                      <span>{isAk ? 'ငွေလွှဲမည်' : 'Send Money'}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('receive')}
                      className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/10 cursor-pointer"
                    >
                      <QrCode size={16} />
                      <span>{isAk ? 'လက်ခံ QR' : 'Receive QR'}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('web3')}
                      className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/10 cursor-pointer"
                    >
                      <Sparkles size={16} className="text-amber-400" />
                      <span>{isAk ? 'Web3 တံတား' : 'Deposit USDT'}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('card')}
                      className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/10 cursor-pointer"
                    >
                      <CreditCard size={16} />
                      <span>{isAk ? 'ဗီဇာကတ်' : 'Virtual Card'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Citizen ID Card Preview */}
              <div
                className={`rounded-3xl p-6 border flex flex-col justify-between ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <span className="font-bold text-xs uppercase tracking-wider">
                        {isAk ? 'နိုင်ငံသား စိစစ်ရေး' : 'Citizen Digital ID'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">W3C DID</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 space-y-2">
                    <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Official Citizen Name</div>
                    <div className="text-base font-black tracking-tight">{profile.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">ID: {profile.nationalIdNo || 'ARAK-ID-992140'}</div>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">UID:</span>
                      <span className="font-bold">{profile.petharId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Township:</span>
                      <span className="font-bold">Sittwe Central</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Reserve Backing:</span>
                      <span className="text-emerald-500 font-bold">100% USDT Pegged</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCopyAddress}
                  className={`w-full mt-4 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    isDark
                      ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Copy size={13} />
                  <span>{copiedAddress ? 'Address Copied!' : 'Copy Wallet Address'}</span>
                </button>
              </div>
            </div>

            {/* Multi-Currency Balances Row */}
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 font-mono">
                {isAk ? 'ငွေကြေးအကောင့်များ (1:1 PEG)' : 'Multi-Currency Accounts (1:1 Peg)'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currencyAccounts.map((acc) => (
                  <div
                    key={acc.code}
                    className={`p-5 rounded-2xl border transition hover:shadow-md ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{acc.flag}</span>
                        <div>
                          <div className="font-black text-sm">{acc.code}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{acc.name}</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-500">{acc.symbol}</span>
                    </div>
                    <div className="font-mono text-xl font-black">
                      {acc.symbol} {acc.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contacts Pay */}
            <div
              className={`p-6 rounded-3xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {isAk ? 'မကြာခဏ ငွေလွှဲသူများ' : 'Frequent Contacts'}
                  </h3>
                  <p className="text-xs text-slate-400">One-click instant payment to verified citizens</p>
                </div>
                <button
                  onClick={() => setActiveTab('send')}
                  className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{isAk ? 'အားလုံးကြည့်ရန်' : 'New Transfer'}</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quickRecipients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSendRecipient(c.id)
                      setActiveTab('send')
                    }}
                    className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                      isDark
                        ? 'border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/50'
                        : 'border-slate-200/90 hover:border-amber-500/50 hover:bg-amber-500/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 font-black flex items-center justify-center shrink-0">
                      {c.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{c.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{c.id}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Transaction Activity */}
            <div
              className={`rounded-3xl border overflow-hidden ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
              }`}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isAk ? 'ငွေလွှဲမှတ်တမ်းများ' : 'Verified Ledger Activity'}
                  </h3>
                  <p className="text-xs text-slate-400">Cryptographically signed on the Péthar sovereign ledger</p>
                </div>

                {/* Filter and Search */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-8 pr-3 py-1.5 rounded-xl text-xs font-medium border outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">All Categories</option>
                    <option value="transfer">Transfers</option>
                    <option value="crypto">Web3 Bridge</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredTxns.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    {isAk ? 'ငွေလွှဲမှတ်တမ်း မရှိသေးပါ' : 'No transactions found'}
                  </div>
                ) : (
                  filteredTxns.slice(0, 8).map((tx) => {
                    const isOutflow = tx.amount < 0
                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTxn(tx)}
                        className={`p-4 sm:px-6 flex items-center justify-between cursor-pointer transition ${
                          isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                              isOutflow
                                ? 'bg-rose-500/10 text-rose-500'
                                : 'bg-emerald-500/10 text-emerald-500'
                            }`}
                          >
                            {isOutflow ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {isAk && tx.titleMm ? tx.titleMm : tx.title}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                              <span>{tx.time}</span>
                              <span>•</span>
                              <span>Ref: {tx.refId}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-mono text-xs sm:text-sm font-black ${
                              isOutflow ? 'text-slate-900 dark:text-white' : 'text-emerald-500'
                            }`}
                          >
                            {isOutflow ? '-' : '+'}₳ {Math.abs(tx.amount).toFixed(2)}
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 font-mono">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SEND MONEY */}
        {activeTab === 'send' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}
            >
              <div className="text-center space-y-1 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#FF6B00] mx-auto flex items-center justify-center font-bold mb-2">
                  <Send size={22} />
                </div>
                <h2 className="text-xl font-black">{isAk ? 'ချက်ချင်း ငွေလွှဲမည်' : 'Send Instant Payment'}</h2>
                <p className="text-xs text-slate-400">Zero fee • Instant settlement on Arakan sovereign ledger</p>
              </div>

              {sendError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{sendError}</span>
                </div>
              )}

              <form onSubmit={handleSendSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase font-mono mb-1.5">
                    {isAk ? 'လက်ခံသူ (UID / ဖုန်း / လိပ်စာ)' : 'Recipient (UID / Phone / Address)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 202610190002 or +959798221001"
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl text-sm font-mono font-medium border outline-none focus:border-[#FF6B00] transition ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase font-mono">
                      {isAk ? 'ငွေပမာဏ (AKD)' : 'Amount (AKD)'}
                    </label>
                    <span className="text-xs font-mono text-slate-400">
                      Balance: ₳{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-lg font-black text-amber-500">₳</span>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xl font-mono font-black border outline-none focus:border-[#FF6B00] transition ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Percentage shortcuts */}
                  <div className="flex gap-2 mt-2">
                    {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setSendAmount((balance * pct).toFixed(2))}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold font-mono transition border cursor-pointer ${
                          isDark
                            ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                            : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {pct === 1.0 ? 'MAX' : `${pct * 100}%`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase font-mono mb-1.5">
                    {isAk ? 'မှတ်ချက် (ရွေးချယ်ရန်)' : 'Note / Purpose (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rice supply payment"
                    value={sendNote}
                    onChange={(e) => setSendNote(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-2xl text-xs font-medium border outline-none focus:border-[#FF6B00] transition ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Transfer Fee:</span>
                    <span className="text-emerald-500 font-bold">0.00 AKD (Free)</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Exchange Rate:</span>
                    <span className="font-bold">1 AKD = 1.00 USD</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-4 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-sm font-black transition shadow-lg shadow-[#FF6B00]/30 disabled:opacity-50 cursor-pointer"
                >
                  {isSending ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Confirming on Ledger...</span>
                    </span>
                  ) : sendSuccess ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>Payment Sent!</span>
                    </span>
                  ) : (
                    <span>{isAk ? 'ငွေလွှဲ အတည်ပြုမည်' : 'Authorize & Send Money'}</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: RECEIVE QR */}
        {activeTab === 'receive' && (
          <div className="max-w-md mx-auto space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border text-center shadow-xl space-y-5 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}
            >
              <div>
                <h2 className="text-lg font-black">{isAk ? 'ငွေလက်ခံရန် Arakan QR' : 'My Arakan QR Payment'}</h2>
                <p className="text-xs text-slate-400">Scan to pay instantly with 0% transaction fee</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1">
                  Request Specific Amount (AKD)
                </label>
                <input
                  type="text"
                  value={qrRequestAmount}
                  onChange={(e) => setQrRequestAmount(e.target.value)}
                  className={`w-32 text-center py-1.5 border rounded-xl text-base font-black font-mono outline-none focus:border-[#FF6B00] mx-auto ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* QR Image Box */}
              <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-inner inline-block">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Arakan QR" className="w-56 h-56 block mx-auto" />
                ) : (
                  <div className="w-56 h-56 bg-slate-100 animate-pulse rounded-2xl" />
                )}
              </div>

              <div className="space-y-2">
                <div className="font-mono text-xs font-bold text-amber-500">UID: {profile.petharId}</div>
                <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs mx-auto">
                  {profile.walletAddress || 'akd_node_99a820fc338290'}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyId}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Copy size={13} />
                  <span>{copiedId ? 'Copied UID' : 'Copy UID'}</span>
                </button>

                <button
                  onClick={handleCopyAddress}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Copy size={13} />
                  <span>{copiedAddress ? 'Copied Address' : 'Copy Address'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VIRTUAL CARD */}
        {activeTab === 'card' && (
          <div className="max-w-xl mx-auto space-y-6">
            {/* 3D Platinum Card */}
            <div className="relative rounded-3xl overflow-hidden p-7 text-white shadow-2xl bg-gradient-to-tr from-slate-950 via-zinc-900 to-amber-950 border border-amber-500/30">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <ArakanEmblem size={32} />
                  <span className="font-black text-lg tracking-tight">Péthar Platinum</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                  {isCardFrozen ? 'CARD FROZEN' : 'ACTIVE'}
                </span>
              </div>

              <div className="my-8 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded-md bg-amber-300/80 shadow-inner flex items-center justify-center text-[10px] text-zinc-900 font-bold">
                    CHIP
                  </div>
                  <Radio size={16} className="text-slate-400" />
                </div>
                <div className="font-mono text-xl sm:text-2xl font-black tracking-widest text-slate-100">
                  {showCardNumber ? '4026 8812 9043 7719' : '•••• •••• •••• 7719'}
                </div>
              </div>

              <div className="flex justify-between items-end text-xs font-mono">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">Cardholder</div>
                  <div className="font-bold text-sm tracking-wide">{profile.name}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">Expires</div>
                  <div className="font-bold">12/29</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">CVV</div>
                  <div className="font-bold">{showCardNumber ? '821' : '•••'}</div>
                </div>
              </div>
            </div>

            {/* Card Controls */}
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}
            >
              <h3 className="text-sm font-black uppercase tracking-wider font-mono text-slate-400">
                Card Security Controls
              </h3>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  {showCardNumber ? <EyeOff size={18} className="text-amber-500" /> : <Eye size={18} className="text-slate-400" />}
                  <div>
                    <div className="text-xs font-bold">Reveal Card Details</div>
                    <div className="text-[10px] text-slate-400">Show 16-digit PAN & CVV</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCardNumber(!showCardNumber)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FF6B00] text-white text-xs font-bold cursor-pointer"
                >
                  {showCardNumber ? 'Hide' : 'Reveal'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  {isCardFrozen ? <Lock size={18} className="text-rose-500" /> : <Unlock size={18} className="text-emerald-500" />}
                  <div>
                    <div className="text-xs font-bold">Freeze Virtual Card</div>
                    <div className="text-[10px] text-slate-400">Block all incoming card authorization charges</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsCardFrozen(!isCardFrozen)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isCardFrozen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {isCardFrozen ? 'Unfreeze' : 'Freeze Card'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-indigo-500" />
                  <div>
                    <div className="text-xs font-bold">Online & International Payments</div>
                    <div className="text-[10px] text-slate-400">Allow e-commerce transactions</div>
                  </div>
                </div>
                <button
                  onClick={() => setOnlineEnabled(!onlineEnabled)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    onlineEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'
                  }`}
                >
                  {onlineEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span>Daily Spending Limit</span>
                  <span className="font-mono text-amber-500">${dailyLimit} USD</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full accent-[#FF6B00] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WEB3 BRIDGE */}
        {activeTab === 'web3' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}
            >
              <div className="text-center space-y-1 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center font-bold mb-2">
                  <Globe size={22} />
                </div>
                <h2 className="text-xl font-black">{isAk ? 'Web3 တံတား ငွေသွင်းစနစ်' : 'Web3 Multi-Chain Bridge'}</h2>
                <p className="text-xs text-slate-400">
                  Convert external USDT/USDC directly into 1:1 backed Arakan Dollars
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase font-mono mb-2">
                    Source Blockchain Network
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'polygon', name: 'Polygon PoS', fee: '$0.02' },
                      { id: 'bsc', name: 'BNB Chain', fee: '$0.15' },
                      { id: 'arbitrum', name: 'Arbitrum One', fee: '$0.08' },
                    ].map((chain) => (
                      <button
                        key={chain.id}
                        type="button"
                        onClick={() => setSelectedChain(chain.id as any)}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                          selectedChain === chain.id
                            ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00] font-bold'
                            : isDark
                            ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
                            : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="text-xs font-black">{chain.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Fee: {chain.fee}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase font-mono mb-1.5">
                    Deposit Amount (USDT)
                  </label>
                  <input
                    type="number"
                    value={bridgeAmount}
                    onChange={(e) => setBridgeAmount(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl font-mono text-lg font-black border outline-none focus:border-[#FF6B00] ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Receive Amount:</span>
                    <span className="font-black text-amber-500">₳ {parseFloat(bridgeAmount || '0').toFixed(2)} AKD</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Peg Guarantee:</span>
                    <span className="text-emerald-500 font-bold">1 USDT = 1 AKD</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateBridge}
                  disabled={bridgeSimulating}
                  className="w-full py-3.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-black transition disabled:opacity-50 cursor-pointer shadow-lg shadow-[#FF6B00]/30"
                >
                  {bridgeSimulating ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Locking on Smart Contract & Minting AKD...</span>
                    </span>
                  ) : bridgeComplete ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={14} />
                      <span>Bridge Settled Successfully!</span>
                    </span>
                  ) : (
                    <span>Execute Bridge Deposit</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: OFFLINE BEAM TAP */}
        {activeTab === 'offline' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border text-center shadow-xl space-y-5 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}
            >
              <div className="w-14 h-14 rounded-3xl bg-cyan-500/10 text-cyan-500 mx-auto flex items-center justify-center font-bold">
                <Radio size={28} className={offlineSyncing ? 'animate-pulse' : ''} />
              </div>

              <div>
                <h2 className="text-xl font-black">{isAk ? 'အော့ဖ်လိုင်း BLE Mesh ငွေပေးချေမှု' : 'Offline BLE Mesh Payment'}</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Make peer-to-peer payments even when cellular networks and internet cables are completely offline.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs font-mono text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Offline Vault Balance:</span>
                  <span className="font-bold text-cyan-500">₳ 250.00 AKD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cryptographic Nonce:</span>
                  <span className="font-bold">#BLE-88219-SEC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Protocol:</span>
                  <span className="font-bold">Arakan Mesh v2</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOfflineSyncing(true)
                  setTimeout(() => {
                    setOfflineSyncing(false)
                    setOfflineTokenReady(true)
                  }, 1200)
                }}
                className="w-full py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition cursor-pointer shadow-md"
              >
                {offlineSyncing ? 'Broadcasting Ultrasonic & BLE Beacon...' : offlineTokenReady ? 'Token Ready • Tap Device Now' : 'Generate Offline Voucher Token'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: LIVE CUSTOMER SUPPORT */}
        {activeTab === 'support' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div
              className={`rounded-3xl border overflow-hidden shadow-xl flex flex-col h-[560px] ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}
            >
              {/* Support Header */}
              <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center font-bold">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black">Péthar Customer Care</div>
                    <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Company Operator Desk Connected</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  Ticket #CS-{profile.petharId.slice(-4)}
                </span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                {chatMessages.map((msg) => {
                  const isUser = msg.sender === 'user'
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-sm p-3.5 rounded-2xl text-xs space-y-1 shadow-2xs ${
                          isUser
                            ? 'bg-[#FF6B00] text-white rounded-br-xs font-medium'
                            : isDark
                            ? 'bg-slate-800 text-white border border-slate-700 rounded-bl-xs'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] opacity-75 font-mono gap-2">
                          <span>{isUser ? 'You (Customer)' : 'Company Officer'}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question about your balance, verification, or transfers..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-medium border outline-none focus:border-[#FF6B00] ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ── TRANSACTION RECEIPT MODAL ── */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <TransactionSlip
              lang={lang}
              refId={selectedTxn.refId}
              amount={Math.abs(selectedTxn.amount)}
              recipientName={selectedTxn.counterparty}
              recipientId={selectedTxn.counterparty}
              senderName={profile.name}
              senderId={profile.petharId}
              fee={selectedTxn.fee || 0}
              timestamp={selectedTxn.time}
              onClose={() => setSelectedTxn(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AppPage
