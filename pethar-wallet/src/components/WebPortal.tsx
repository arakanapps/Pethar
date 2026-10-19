import React, { useState, useEffect } from 'react'
import {
  ArrowUpRight, ArrowDownLeft, Store, Globe, Coins,
  TrendingUp, Search, Sparkles, Send, CheckCircle
} from 'lucide-react'
import type { Txn, FxRateItem } from '../data'
import {
  fetchTransactionsFromDb,
  fetchFxRatesFromDb,
  fetchFavoriteContactsFromDb,
  fetchUserProfileFromDb,
  insertTransactionToDb,
} from '../services/walletDatabase'
import { ArakanEmblem } from './ArakanEmblem'
import type { Language } from '../i18n'
import { translations } from '../i18n'

interface WebPortalProps {
  lang: Language
  theme?: 'dark' | 'light'
  onOpenModule: (mod: 'send' | 'receive' | 'cashout' | 'intl' | 'crypto' | 'pos') => void
}

export const WebPortal: React.FC<WebPortalProps> = ({
  lang,
  theme = 'light',
  onOpenModule,
}) => {
  const t = translations[lang]
  const isLight = theme === 'light'
  const [filterCat, setFilterCat] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [quickSendAmount, setQuickSendAmount] = useState('0.00')
  const [quickSendContact, setQuickSendContact] = useState('')
  const [quickSentSuccess, setQuickSentSuccess] = useState(false)
  const [txList, setTxList] = useState<Txn[]>([])
  const [fxList, setFxList] = useState<FxRateItem[]>([])
  const [contactList, setContactList] = useState<any[]>([])
  const [walletBalance, setWalletBalance] = useState(0.00)

  useEffect(() => {
    let active = true

    fetchTransactionsFromDb().then((txs) => {
      if (active && txs.length > 0) setTxList(txs)
    })

    fetchFxRatesFromDb().then((fxs) => {
      if (active && fxs.length > 0) setFxList(fxs)
    })

    fetchFavoriteContactsFromDb().then((contactsData) => {
      if (active && contactsData.length > 0) {
        setContactList(contactsData)
        setQuickSendContact(contactsData[0]?.uid || contactsData[0]?.id || '')
      }
    })

    fetchUserProfileFromDb().then((up) => {
      if (active && up) setWalletBalance(up.balance)
    })

    return () => {
      active = false
    }
  }, [])

  const filteredTxns = txList.filter((tx) => {
    const matchesCat = filterCat === 'all' || tx.category === filterCat
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.titleMm.includes(searchQuery) ||
      tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(quickSendAmount) || 0
    if (amt <= 0) return

    const selectedContactObj = contactList.find(c => c.uid === quickSendContact || c.id === quickSendContact)
    const newTx: Txn = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      refId: `ARAK-P2P-${Date.now().toString().slice(-6)}`,
      title: `Transfer to ${selectedContactObj?.name || 'Contact'}`,
      titleMm: `${selectedContactObj?.name || 'မိတ်ဆွေ'} ထံသို့ ငွေလွှဲခြင်း`,
      category: 'p2p',
      amount: -amt,
      currency: 'AKD',
      time: 'Just now',
      status: 'SETTLED',
      counterparty: selectedContactObj?.name || 'Arakan Citizen',
      counterpartyMm: selectedContactObj?.name || 'အာရက္ခပြည်သူ',
      fee: 0,
      hash: `0x${Math.random().toString(16).slice(2, 10)}...`,
    }

    setTxList(prev => [newTx, ...prev])
    setWalletBalance(prev => Math.max(0, prev - amt))
    insertTransactionToDb(newTx)

    setQuickSentSuccess(true)
    setTimeout(() => setQuickSentSuccess(false), 3000)
  }

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto ${isLight ? 'bg-[#F4F5F8] text-gray-900' : 'bg-[#090D14] text-white'}`}>
      {/* Top Banner / Ticker */}
      <div className="bg-[#121A28] border-b border-[#283852] px-6 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5">
          <span className="font-bold text-amber-400 flex items-center gap-1.5 shrink-0">
            <TrendingUp size={13} />
            {lang === 'ak' ? 'တရားဝင်ငွေလဲနှုန်း' : 'Arakan FX Ticker'}:
          </span>
          {fxList.slice(0, 4).map((fx) => (
            <div key={fx.pair} className="flex items-center gap-1 shrink-0 font-mono text-[11px]">
              <span className="text-gray-300 font-semibold">{fx.pair}</span>
              <span className="text-white font-bold">{fx.rate}</span>
              <span className={fx.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}>
                {fx.change24h}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Balance Overview */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-[#2D0A0E] via-[#1A1218] to-[#111A28] border border-red-950/80 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 p-6 pointer-events-none">
              <ArakanEmblem size={220} variant="emblem-only" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {t.currencyLabel}
                </span>
                <h1 className="text-3xl lg:text-4xl font-black text-white font-mono mt-3 tracking-tight">
                  ₳ {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  {t.reserveBacked}
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">Total Net Worth (USD Eq.)</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  $ {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">Tier 2 Arakan Citizen Enclave</div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              <button
                onClick={() => onOpenModule('send')}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <ArrowUpRight size={16} />
                {t.navSend}
              </button>
              <button
                onClick={() => onOpenModule('receive')}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition flex items-center justify-center gap-2"
              >
                <ArrowDownLeft size={16} />
                {t.navReceive}
              </button>
              <button
                onClick={() => onOpenModule('intl')}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition flex items-center justify-center gap-2"
              >
                <Globe size={16} className="text-blue-400" />
                {t.navInternational}
              </button>
              <button
                onClick={() => onOpenModule('crypto')}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition flex items-center justify-center gap-2"
              >
                <Coins size={16} className="text-amber-400" />
                {t.navCrypto}
              </button>
            </div>
          </div>

          {/* Quick Transfer Widget */}
          <div className="p-6 rounded-3xl bg-[#131B26] border border-[#283852] shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Send size={15} className="text-amber-400" />
                  {lang === 'ak' ? 'အမြန်ငွေလွှဲ' : 'Instant Transfer'}
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  0% Fee
                </span>
              </div>

              <form onSubmit={handleQuickSend} className="space-y-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">
                    {lang === 'ak' ? 'လက်ခံသူ ရွေးပါ' : 'Select Recipient'}
                  </label>
                  <select
                    value={quickSendContact}
                    onChange={(e) => setQuickSendContact(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {contactList.map((c) => (
                      <option key={c.uid || c.id} value={c.uid || c.id}>
                        {c.name} ({c.uid || c.id}) · {c.category || 'Arakan'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">
                    {lang === 'ak' ? 'ပမာဏ' : 'Amount'}
                  </label>
                  <input
                    type="number"
                    value={quickSendAmount}
                    onChange={(e) => setQuickSendAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black shadow-md transition"
                >
                  {lang === 'ak' ? 'ချက်ချင်းလွှဲပို့ရန်' : 'Execute Instant P2P Transfer'}
                </button>
              </form>

              {quickSentSuccess && (
                <div className="mt-3 p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  <span>Settled ₳ {quickSendAmount} instantly via Ed25519 hash chain!</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
              <span>{lang === 'ak' ? 'အေးဂျင့်ငွေထုတ်ရန်' : 'Need cash?'}</span>
              <button
                onClick={() => onOpenModule('cashout')}
                className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Store size={12} />
                {lang === 'ak' ? 'အနီးဆုံးအေးဂျင့်ရှာရန်' : 'Find Agent Branch'}
              </button>
            </div>
          </div>
        </div>


        {/* Ledger Transactions Table with Filters & Search */}
        <div className="p-6 rounded-3xl bg-[#131B26] border border-[#283852] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div>
              <h3 className="font-bold text-white text-base">{t.recentTransactions}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {lang === 'ak'
                  ? 'အာရက္ခဒေါ်လာ စာရင်းချုပ်မှတ်တမ်းအပြည့်အစုံ'
                  : 'Immutable append-only double-entry ledger postings'}
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder={lang === 'ak' ? 'စာရင်းရှာဖွေရန်...' : 'Search ledger...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 w-44"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'p2p', 'crypto', 'remittance', 'cashout', 'pos'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                      filterCat === cat
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat === 'all' ? (lang === 'ak' ? 'အားလုံး' : 'All') : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-white/5 font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Transaction</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Counterparty</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">
                        {lang === 'ak' ? txn.titleMm : txn.title}
                      </div>
                      <div className="text-[10px] font-mono text-gray-500">{txn.refId}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/5 text-gray-300">
                        {txn.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      {lang === 'ak' ? txn.counterpartyMm || txn.counterparty : txn.counterparty}
                    </td>
                    <td className="py-3 px-3 text-gray-400">{txn.time}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={txn.amount > 0 ? 'text-emerald-400' : 'text-white'}>
                        {txn.amount > 0 ? '+' : ''}
                        ₳ {txn.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
