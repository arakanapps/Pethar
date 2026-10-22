import React, { useState } from 'react'
import type { Language } from '../i18n'
import { ArakanEmblem } from '../components/ArakanEmblem'
import {
  RefreshCw, ShieldCheck, Zap,
  CheckCircle, ArrowLeft
} from 'lucide-react'

export interface ExchangePageProps {
  lang?: Language
  setLang?: (lang: Language) => void
  onBack?: () => void
}

export const ExchangePage: React.FC<ExchangePageProps> = ({
  lang = 'ak',
  setLang,
  onBack,
}) => {
  const [sellAmount, setSellAmount] = useState('1000')
  const [fromPair, setFromPair] = useState<'AKD' | 'USDT' | 'USDC' | 'USD'>('AKD')
  const [toPair, setToPair] = useState<'AKD' | 'USDT' | 'USDC' | 'USD'>('USD')
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapSuccess, setSwapSuccess] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '24H' | '7D' | '1M'>('24H')

  const getRate = (from: string, to: string) => {
    if (from === to) return 1.0
    if (from === 'AKD' && to === 'USD') return 1.00
    if (from === 'USD' && to === 'AKD') return 1.00
    if (from === 'AKD' && (to === 'USDT' || to === 'USDC')) return 1.00
    if ((from === 'USDT' || from === 'USDC') && to === 'AKD') return 1.00
    return 1.0
  }

  const currentRate = getRate(fromPair, toPair)
  const calculatedReceive = (parseFloat(sellAmount || '0') * currentRate).toFixed(2)

  const handleSwapPairs = () => {
    const prevFrom = fromPair
    setFromPair(toPair)
    setToPair(prevFrom)
  }

  const handleExecuteSwap = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSwapping(true)
    setTimeout(() => {
      setIsSwapping(false)
      setSwapSuccess(true)
      setTimeout(() => setSwapSuccess(false), 2400)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <ArakanEmblem size={32} variant="badge" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-950">Péthar</span>
                <span className="text-xs font-bold text-amber-600">Exchange</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {lang === 'ak' ? 'ဒစ်ဂျစ်တယ်ငွေကြေး ဖလှယ်ရေးစနစ်' : 'Instant Liquidity & Currency Swap'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {setLang && (
            <button
              onClick={() => setLang(lang === 'ak' ? 'en' : 'ak')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200"
            >
              {lang === 'ak' ? 'AK · အာရက္ခ' : 'EN · English'}
            </button>
          )}
          <a
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition shadow-2xs"
          >
            Dashboard
          </a>
        </div>
      </header>

      {/* Main Terminal */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Ticker Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs font-mono">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Fixed 1:1 Peg: 1 ₳ (AKD) = 1.00 USDT = $1.00 USD</span>
          </div>
          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold border border-amber-200 flex items-center gap-1">
            <ShieldCheck size={12} />
            100% USDT / USDC Collateral Backed
          </span>
        </div>

        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold mb-2">
              <Zap size={13} className="text-amber-600" />
              <span>{lang === 'ak' ? 'အာရက္ခဒစ်ဂျစ်တယ် ငွေကြေးဖလှယ်မှု' : 'Fixed-Rate Instant Swap'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {lang === 'ak' ? 'ဖေ့သာ ဒစ်ဂျစ်တယ်ငွေကြေး ဖလှယ်ရေး' : 'Péthar Instant Currency Swap'}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Currencies: AKD, USD, USDC, USDT · Zero Slippage
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold">
            {(['1H', '24H', '7D', '1M'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedTimeframe === tf ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Swap Card */}
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4">
          {swapSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <span>Swap settled successfully! Received {calculatedReceive} {toPair}.</span>
            </div>
          )}

          <form onSubmit={handleExecuteSwap} className="space-y-4">
            {/* You Pay */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>You Pay</span>
                <span>Rate: 1.00</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  step="0.01"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="bg-transparent text-2xl font-black font-mono text-slate-900 outline-none w-36"
                  required
                />
                <select
                  value={fromPair}
                  onChange={(e) => setFromPair(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs text-slate-900 cursor-pointer shadow-2xs"
                >
                  <option value="AKD">AKD (₳)</option>
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                type="button"
                onClick={handleSwapPairs}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition active:scale-95 shadow-sm"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {/* You Receive */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>You Receive</span>
                <span>Zero Spread</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-2xl font-black font-mono text-emerald-600">
                  {calculatedReceive}
                </div>
                <select
                  value={toPair}
                  onChange={(e) => setToPair(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs text-slate-900 cursor-pointer shadow-2xs"
                >
                  <option value="AKD">AKD (₳)</option>
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSwapping}
              className="w-full py-3.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSwapping ? 'Swapping...' : `Swap ${fromPair} for ${toPair}`}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default ExchangePage
