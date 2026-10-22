import React, { useState, useEffect } from 'react'
import {
  ArrowUpRight, ArrowDownLeft, QrCode, CreditCard,
  ShieldCheck, Send, CheckCircle, Search,
  Eye, EyeOff, Lock, Unlock, Copy,
  Building2, Sparkles, Check, Layers, Play,
  Cpu, Globe, ArrowRight, CheckCircle2, ArrowLeft
} from 'lucide-react'
import QRCode from 'qrcode'
import { ArakanEmblem } from '../components/ArakanEmblem'
import { TransactionSlip } from '../components/TransactionSlip'
import type { Language } from '../i18n'
import { initialUserProfile, type Txn } from '../data'
import { fetchTransactionsFromDb, fetchUserProfileFromDb, insertTransactionToDb, updateUserBalanceInDb } from '../services/walletDatabase'

export interface AppPageProps {
  lang?: Language
  setLang?: (lang: Language) => void
  onBack?: () => void
}

export const AppPage: React.FC<AppPageProps> = ({
  lang = 'ak',
  setLang,
  onBack,
}) => {
  const isAk = lang === 'ak'

  // Top Section Mode: 'transfers' | 'web3' | 'overview'
  const [activePortalTab, setActivePortalTab] = useState<'transfers' | 'web3' | 'overview'>('transfers')

  // Balances & Profile state
  const [balance, setBalance] = useState<number>(12500.0)
  const [balanceHidden, setBalanceHidden] = useState<boolean>(false)
  const [profile, setProfile] = useState(initialUserProfile)
  const [txList, setTxList] = useState<Txn[]>([])
  const [selectedTxn, setSelectedTxn] = useState<Txn | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Transfer Modals & Forms
  const [showSendModal, setShowSendModal] = useState<boolean>(false)
  const [showQrModal, setShowQrModal] = useState<boolean>(false)
  const [sendRecipient, setSendRecipient] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendSuccess, setSendSuccess] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [qrRequestAmount, setQrRequestAmount] = useState('0.00')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copiedId, setCopiedId] = useState(false)

  // Card Controls
  const [isCardFrozen, setIsCardFrozen] = useState(false)
  const [showCardNumber, setShowCardNumber] = useState(false)

  // Web3 Multi-Chain Bridge Simulator State
  const [selectedChain, setSelectedChain] = useState<'polygon' | 'bsc' | 'arbitrum'>('polygon')
  const [bridgeAmount, setBridgeAmount] = useState('500.00')
  const [bridgeSimulating, setBridgeSimulating] = useState(false)
  const [bridgeComplete, setBridgeComplete] = useState(false)

  // Load User & Transactions
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
        }))
      }
    })

    fetchTransactionsFromDb().then((txs) => {
      if (isMounted && txs.length > 0) setTxList(txs)
    })

    return () => { isMounted = false }
  }, [])

  // Generate QR Data URL
  useEffect(() => {
    const payload = `pethar://pay?to=${encodeURIComponent(profile.petharId)}&name=${encodeURIComponent(profile.name)}&amount=${qrRequestAmount}&curr=AKD`
    QRCode.toDataURL(payload, {
      margin: 1,
      width: 280,
      color: { dark: '#0a0f1d', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
      .then(setQrDataUrl)
      .catch(() => {})
  }, [profile.petharId, profile.name, qrRequestAmount])

  // Multi-currency accounts
  const currencyAccounts = [
    { code: 'AKD', symbol: '₳', name: 'Arakan Dollar', amount: balance, flag: '🇲🇲' },
    { code: 'USD', symbol: '$', name: 'United States Dollar (Escrow)', amount: balance, flag: '🇺🇸' },
    { code: 'USDT', symbol: '₮', name: 'Tether TRC-20 / ERC-20', amount: balance, flag: '🌐' },
    { code: 'USDC', symbol: '₵', name: 'USD Coin (Native)', amount: balance, flag: '🌐' },
  ]

  const quickRecipients = [
    { name: 'Ko Min Aung', id: '202610190002', avatar: 'M' },
    { name: 'Daw Nilar Win', id: '202610190003', avatar: 'N' },
    { name: 'Sittwe Central Agent', id: 'AGENT-AK-042', avatar: 'A' },
  ]

  // Filtered transactions
  const filteredTxns = txList.filter((tx) => {
    const matchesCat = filterCategory === 'all' || tx.category === filterCategory
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      tx.title.toLowerCase().includes(q) ||
      tx.titleMm.includes(q) ||
      tx.counterparty.toLowerCase().includes(q)
    return matchesCat && matchesSearch
  })

  const handleCopyId = () => {
    navigator.clipboard?.writeText(profile.petharId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  // Execute instant transfer
  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(sendAmount)
    if (!sendRecipient || isNaN(amt) || amt <= 0 || amt > balance) return

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
        setShowSendModal(false)
        setSendRecipient('')
        setSendAmount('')
        setSelectedTxn(newTx)
      }, 900)
    }, 450)
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
    }, 1100)
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans flex flex-col">
      {/* ── TOP HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <ArakanEmblem size={32} variant="badge" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-950">Péthar</span>
                <span className="text-xs font-bold text-amber-600">Customer Portal</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {isAk ? 'Web3 တံတား & ချက်ချင်းငွေလွှဲစနစ်' : 'Web3 Multi-Chain & Instant Transfers'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-2">
          {setLang && (
            <button
              onClick={() => setLang(isAk ? 'en' : 'ak')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200"
            >
              {isAk ? 'AK · အာရက္ခ' : 'EN · English'}
            </button>
          )}
          <a
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition shadow-2xs"
          >
            {isAk ? 'ဒက်ရှ်ဘုတ်' : 'Dashboard'}
          </a>
        </div>
      </header>

      {/* ── MAIN PORTAL BODY ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Customer Header Spotlight Card */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            {/* Identity */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 border-white/20">
                {profile.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {isAk ? 'မင်္ဂလာပါ' : 'Welcome back'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Citizen Tier-2</span>
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                  {profile.name}
                </h1>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                  <span>Péthar ID:</span>
                  <button
                    onClick={handleCopyId}
                    className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                  >
                    <span>{profile.petharId}</span>
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowSendModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isAk ? 'ငွေလွှဲမည်' : 'Send Money'}</span>
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition active:scale-95 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>{isAk ? 'ငွေလက်ခံ QR' : 'Receive QR'}</span>
              </button>
              <button
                onClick={() => setActivePortalTab('web3')}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition active:scale-95 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-purple-400" />
                <span>{isAk ? 'Web3 တံတား' : 'Web3 Bridge'}</span>
              </button>
            </div>
          </div>

          {/* Balance Spotlight */}
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{isAk ? 'အာရက္ခဒေါ်လာ လက်ကျန်ငွေ' : 'Total AKD Balance'}</span>
                <button onClick={() => setBalanceHidden(!balanceHidden)} className="hover:text-white">
                  {balanceHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                <span className="text-[#FF6B00]">₳</span>
                <span>{balanceHidden ? '••••••' : balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>≈ ${balanceHidden ? '••••' : balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD Liquid Parity</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-center">
              <div className="text-xs text-slate-400 mb-1">Fixed USD Peg Parity</div>
              <div className="text-base font-bold text-emerald-400 font-mono">1.00 ₳ = 1.00 USDT = $1.00 USD</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span>100% USDT / USDC Collateralized</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-center">
              <div className="text-xs text-slate-400 mb-1">Web3 Bridge Status</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Polygon · BNB · Arbitrum Connected</span>
              </div>
              <div className="text-[11px] text-amber-400 mt-1 font-mono">0% Slippage · Sponsored Gas</div>
            </div>
          </div>
        </div>

        {/* ── MODE TABS: TRANSFERS & PAYMENTS | WEB3 DEFI RAILS | CARDS & ACCOUNTS ── */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-200/80 border border-slate-300 max-w-md mx-auto text-xs font-bold">
          <button
            onClick={() => setActivePortalTab('transfers')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activePortalTab === 'transfers'
                ? 'bg-white text-slate-950 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send size={14} className="text-[#FF6B00]" />
            <span>{isAk ? 'ငွေလွှဲ & ငွေလက်ခံ' : 'Transfers'}</span>
          </button>
          <button
            onClick={() => setActivePortalTab('web3')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activePortalTab === 'web3'
                ? 'bg-white text-slate-950 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={14} className="text-purple-600" />
            <span>{isAk ? 'Web3 တံတား' : 'Web3 Bridge'}</span>
          </button>
          <button
            onClick={() => setActivePortalTab('overview')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activePortalTab === 'overview'
                ? 'bg-white text-slate-950 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard size={14} className="text-indigo-600" />
            <span>{isAk ? 'ကတ် & အကောင့်များ' : 'Card & Accounts'}</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 1: TRANSFERS & ATOMIC PAYMENTS (FROM TRANSFERPAGE & APPPAGE)
           ═══════════════════════════════════════════════════════════════════ */}
        {activePortalTab === 'transfers' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Quick 2 Action Cards: Pay & Receive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setShowSendModal(true)}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-[#FF6B00] cursor-pointer transition space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                  <ArrowUpRight size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{isAk ? 'ငွေလွှဲပို့ရန် (Pay / Send)' : 'Instant Send / Pay'}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAk
                      ? 'မည်သည့် Péthar ID သို့မဟုတ် ဖုန်းနံပါတ်သို့မဆို ဝန်ဆောင်ခ ၀% ဖြင့် ချက်ချင်းငွေလွှဲပါ'
                      : 'Transfer directly to any UID, phone, or QR code. 0% user fee, instant finality.'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#FF6B00]">
                  <span>Initiate Send</span>
                  <ArrowRight size={14} />
                </div>
              </div>

              <div
                onClick={() => setShowQrModal(true)}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500 cursor-pointer transition space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                  <ArrowDownLeft size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{isAk ? 'ငွေလက်ခံရန် (Receive QR)' : 'Receive Payment QR'}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAk
                      ? 'သင့် Arakan QR ကုဒ်ကို ပြသ၍ အာရက္ခဒေါ်လာကို ချက်ချင်း လက်ခံပါ'
                      : 'Show your scannable Arakan QR code or UID to receive instant payments.'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <span>Open My QR</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>

            {/* Recent Transaction Postings */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-base text-slate-900">
                    {isAk ? 'လတ်တလော ငွေလွှဲ မှတ်တမ်းများ' : 'Recent Transfer Postings'}
                  </h3>
                  <div className="flex p-1 rounded-xl bg-slate-100 text-[11px] font-bold">
                    {(['all', 'transfer', 'crypto'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg capitalize transition ${
                          filterCategory === cat ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transfers..."
                    className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredTxns.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No transfers found</div>
                ) : (
                  filteredTxns.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTxn(tx)}
                      className="py-3 flex items-center justify-between hover:bg-slate-50 px-3 rounded-2xl transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {isAk ? tx.titleMm : tx.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {tx.counterparty} · {tx.time}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-black font-mono ${
                          tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'
                        }`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} ₳
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 2: WEB3 BRIDGE & DEFI RAILS (FROM WEB3PAGE)
           ═══════════════════════════════════════════════════════════════════ */}
        {activePortalTab === 'web3' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Cross-Chain Bridge Visualizer */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                    Cross-Chain EVM Bridge Simulator
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">EVM Multi-Chain Liquidity Peg-In (0% Slippage)</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Lock ERC-20 / BEP-20 USDT into multi-sig smart contracts and receive instant 1:1 Arakan Dollars (AKD) directly in your Péthar wallet.
                  </p>
                </div>

                {/* Chain Selector */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                  {(['polygon', 'bsc', 'arbitrum'] as const).map((chain) => (
                    <button
                      key={chain}
                      onClick={() => setSelectedChain(chain)}
                      className={`px-3 py-1 rounded-lg capitalize transition ${
                        selectedChain === chain ? 'bg-[#FF6B00] text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {chain === 'bsc' ? 'BNB Chain' : chain}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                {/* Source Chain */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300 capitalize">{selectedChain} Mainnet</span>
                    <span className="text-[10px] font-mono text-slate-400">Lock Contract</span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <input
                      type="number"
                      value={bridgeAmount}
                      onChange={(e) => setBridgeAmount(e.target.value)}
                      className="text-xl font-black text-white bg-transparent border-b border-slate-700 focus:outline-none w-32"
                    />
                    <span className="text-xs font-bold text-emerald-400">USDT</span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500">Contract: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F</p>
                </div>

                {/* Arrow */}
                <div className="md:col-span-1 text-center">
                  <ArrowRight className="w-5 h-5 text-amber-400 mx-auto transform rotate-90 md:rotate-0" />
                </div>

                {/* Destination */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300">Péthar Ledger</span>
                    <span className="text-[10px] font-mono text-amber-400">1:1 Mint Guarantee</span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-xl font-black text-amber-400">{bridgeAmount || '0.00'}</span>
                    <span className="text-xs font-bold text-amber-400">₳ (AKD)</span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500">Recipient: {profile.petharId} (Enclave Wallet)</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-900 text-xs font-mono">
                <div className="text-slate-400 space-y-0.5">
                  <p>Bridge Gas Fee: <span className="text-emerald-400 font-bold">$0.00 (Sponsored by Reserve)</span></p>
                  <p>Estimated Finality: <span className="text-white">~ 12 Seconds</span></p>
                </div>

                <button
                  onClick={handleSimulateBridge}
                  disabled={bridgeSimulating}
                  className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] disabled:opacity-50 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Play size={14} className="fill-current" />
                  <span>{bridgeSimulating ? 'Validating Proofs...' : 'Execute Cross-Chain Bridge'}</span>
                </button>
              </div>

              {bridgeComplete && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bridge Transit Settled! ({bridgeAmount} AKD Minted & Verified on Block #2,491,048)</span>
                </div>
              )}
            </div>

            {/* zk-DID Decentralized Identity Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-amber-700 font-mono font-bold text-xs uppercase">
                  <Lock className="w-4 h-4" />
                  <span>Zero-Knowledge Identity (zk-DID)</span>
                </div>
                <h3 className="text-lg font-black text-slate-950">Decentralized Citizen Identity Without Surveillance</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  W3C-compliant Decentralized Identifiers allowing cryptographic citizen verification without exposing real names, phone numbers, or private coordinates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1.5" />
                  <h4 className="font-bold text-slate-950">Zero-Knowledge Proofs</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Prove you are a verified citizen over 18 without revealing birthdate.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs">
                  <Cpu className="w-5 h-5 text-amber-600 mb-1.5" />
                  <h4 className="font-bold text-slate-950">W3C Verifiable Credentials</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Interoperable with international digital identity specifications.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs">
                  <Globe className="w-5 h-5 text-sky-600 mb-1.5" />
                  <h4 className="font-bold text-slate-950">Hardware Security</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Stored inside your mobile device Secure Enclave with Ed25519 signing.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 3: CARDS & CONNECTED CURRENCY ACCOUNTS
           ═══════════════════════════════════════════════════════════════════ */}
        {activePortalTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Multi-Currency Balances */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#FF6B00]" />
                <span>Connected Currency Accounts</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currencyAccounts.map((acc) => (
                  <div key={acc.code} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span>{acc.flag}</span>
                        <span className="text-xs font-mono font-bold text-slate-900">{acc.code}</span>
                      </div>
                      <div className="text-sm font-black font-mono text-slate-900">
                        {acc.symbol} {acc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{acc.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Virtual Debit Card */}
            <div className="max-w-md mx-auto sxdx-credit-card rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ArakanEmblem size={28} variant="badge" />
                  <span className="font-black tracking-wider text-sm">Péthar Card</span>
                </div>
                <button
                  onClick={() => setIsCardFrozen(!isCardFrozen)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/15 text-white border border-white/20 hover:bg-white/25 flex items-center gap-1"
                >
                  {isCardFrozen ? <Lock size={12} /> : <Unlock size={12} />}
                  <span>{isCardFrozen ? 'Unfreeze' : 'Freeze Card'}</span>
                </button>
              </div>

              <div className="font-mono text-lg tracking-widest text-white mb-4 flex items-center gap-3">
                <span>{showCardNumber ? '4829 9014 2819 0921' : '4829 •••• •••• 0921'}</span>
                <button onClick={() => setShowCardNumber(!showCardNumber)} className="text-white/70 hover:text-white">
                  {showCardNumber ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <div className="flex justify-between items-end text-xs">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-white/70">CARDHOLDER</div>
                  <div className="font-bold font-mono text-white">{profile.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-white/70">EXPIRES</div>
                  <div className="font-mono font-bold text-white">12/29</div>
                </div>
                <div className="font-black italic text-lg tracking-tighter text-white">VISA</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL: QUICK SEND MONEY ── */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-3">
              {isAk ? 'ချက်ချင်း ငွေလွှဲပို့မည်' : 'Instant Customer Transfer'}
            </h3>

            {sendSuccess ? (
              <div className="py-6 text-center text-emerald-600 font-bold flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10" />
                <span>Transfer Settled Successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSendSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {isAk ? 'မကြာခဏ ငွေလွှဲသူများ' : 'Frequent Recipients'}
                  </label>
                  <div className="flex gap-2">
                    {quickRecipients.map((rec) => (
                      <button
                        key={rec.id}
                        type="button"
                        onClick={() => setSendRecipient(rec.id)}
                        className="flex-1 p-2 rounded-xl bg-slate-50 border border-slate-200 text-left hover:border-[#FF6B00] transition text-[11px]"
                      >
                        <div className="font-bold text-slate-800 truncate">{rec.name}</div>
                        <div className="font-mono text-slate-400 text-[9px] truncate">{rec.id}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient ID / Phone</label>
                  <input
                    type="text"
                    required
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    placeholder="e.g. 202610190002"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount in AKD (₳)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSendModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex-1 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs transition cursor-pointer"
                  >
                    {isSending ? 'Sending...' : 'Confirm Send'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: RECEIVE ARAKAN QR ── */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <h3 className="text-base font-black text-slate-900">
              {isAk ? 'ငွေလက်ခံရန် Arakan QR' : 'My Arakan QR Payment'}
            </h3>
            <p className="text-xs text-slate-500">Show this QR to sender to receive instant 1:1 AKD payments</p>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Request Amount (AKD)</label>
              <input
                type="text"
                value={qrRequestAmount}
                onChange={(e) => setQrRequestAmount(e.target.value)}
                className="w-28 text-center py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold font-mono focus:outline-none focus:border-[#FF6B00] mx-auto"
              />
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-200 inline-block">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Arakan QR" className="w-48 h-48 block mx-auto" />
              ) : (
                <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-xl" />
              )}
            </div>

            <div className="font-mono text-xs font-bold text-slate-700">{profile.petharId}</div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: VERIFIED RECEIPT SLIP ── */}
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
