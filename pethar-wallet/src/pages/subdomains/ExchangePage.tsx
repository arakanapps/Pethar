import { useState, useEffect } from 'react'
import { BaseLayout } from './BaseLayout'
import type { Language } from '../../i18n'
import {
  RefreshCw, TrendingUp, ShieldCheck, Zap,
  CheckCircle, ArrowUpRight,
  DollarSign, Percent
} from 'lucide-react'
import { fetchFxRatesFromDb } from '../../services/walletDatabase'

interface ExchangePageProps {
  lang: Language
}

export const ExchangePage = ({ lang }: ExchangePageProps) => {
  const [sellAmount, setSellAmount] = useState('1000')
  const [fromPair, setFromPair] = useState<'AKD' | 'USDT' | 'THB' | 'USD'>('AKD')
  const [toPair, setToPair] = useState<'AKD' | 'USDT' | 'THB' | 'USD'>('THB')
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapSuccess, setSwapSuccess] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '24H' | '7D' | '1M'>('24H')
  const [fxRates, setFxRates] = useState<any[]>([])

  useEffect(() => {
    fetchFxRatesFromDb().then((rates) => {
      if (rates.length > 0) setFxRates(rates)
    })
  }, [])

  const getRate = (from: string, to: string) => {
    if (from === to) return 1.0
    if (from === 'AKD' && to === 'THB') return 35.80
    if (from === 'THB' && to === 'AKD') return 1 / 35.80
    if (from === 'AKD' && to === 'USD') return 1.00
    if (from === 'USD' && to === 'AKD') return 1.00
    if (from === 'AKD' && to === 'USDT') return 1.00
    if (from === 'USDT' && to === 'AKD') return 1.00
    if (from === 'USD' && to === 'THB') return 35.80
    if (from === 'THB' && to === 'USD') return 1 / 35.80
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

  const orderBookBids = [
    { price: '1.0002', amount: '24,500', total: '24,504.90', depth: '92%' },
    { price: '1.0001', amount: '18,200', total: '18,201.82', depth: '75%' },
    { price: '1.0000', amount: '150,000', total: '150,000.00', depth: '100%' },
    { price: '0.9999', amount: '35,000', total: '34,996.50', depth: '60%' },
    { price: '0.9998', amount: '12,400', total: '12,397.52', depth: '40%' },
  ]

  const orderBookAsks = [
    { price: '1.0008', amount: '8,500', total: '8,506.80', depth: '35%' },
    { price: '1.0006', amount: '14,200', total: '14,208.52', depth: '55%' },
    { price: '1.0005', amount: '28,000', total: '28,014.00', depth: '85%' },
    { price: '1.0004', amount: '42,000', total: '42,016.80', depth: '95%' },
    { price: '1.0003', amount: '19,500', total: '19,505.85', depth: '65%' },
  ]

  return (
    <BaseLayout
      title={lang === 'ak' ? 'ဖေ့သာ ဒစ်ဂျစ်တယ်ငွေကြေး ဖလှယ်ရေးစနစ်' : 'Péthar Exchange & Liquidity Terminal'}
      lang={lang}
    >
      <div className="space-y-8 max-w-[1300px] mx-auto pb-12">
        
        {/* ── TOP LIVE FX TICKER STRIP (PAYSOFT STYLE) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AKD/USDT 1.0000 (+0.00%)
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700">AKD/THB {fxRates.find(r => r.pair.includes('THB'))?.rate || '35.80'}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700">AKD/USD 1.00</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700">24h Vol: ₳ 1,428,900</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold border border-amber-200 flex items-center gap-1">
              <ShieldCheck size={12} />
              100% Backed Reserves
            </span>
          </div>
        </div>

        {/* ── HERO HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold mb-3">
              <Zap size={13} className="text-amber-600" />
              <span>{lang === 'ak' ? 'အာရက္ခဒစ်ဂျစ်တယ် ရင်းနှီးငွေကြေးဖလှယ်မှု' : 'Zero-Spread Institutional Order Book'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight font-sans">
              {lang === 'ak' ? 'ဖေ့သာ ဒစ်ဂျစ်တယ်ငွေကြေး ဖလှယ်ရေး' : 'Péthar Exchange & Instant Swap'}
            </h1>
            <p className="text-sm text-slate-500 font-mono mt-1">
              {lang === 'ak'
                ? 'အာရက္ခဒေါ်လာ (AKD)၊ USDT၊ ထိုင်းဘတ် နှင့် အမေရိကန်ဒေါ်လာများကို အခမဲ့ ချက်ချင်းဖလှယ်ပါ'
                : 'Trade Arakan Dollars with guaranteed 1:1 USD parity, zero slippage, and on-chain liquidity'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center text-xs font-mono font-bold">
              {(['1H', '24H', '7D', '1M'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedTimeframe === tf ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN INTERACTIVE EXCHANGE TERMINAL GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left 7 Columns: Order Depth & Chart Simulation (Paysoft/CentralPay inspired) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Depth Chart & Price Header */}
            <div className="dna-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs">
                    ₳
                  </div>
                  <div>
                    <div className="font-extrabold text-base text-slate-900 font-mono">AKD / USD Parity</div>
                    <div className="text-[11px] font-mono text-emerald-600 flex items-center gap-1">
                      <TrendingUp size={12} />
                      <span>1.0000 USD (0.00% 24h Volatility)</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xl font-black text-slate-900">₳ 1.00</div>
                  <div className="text-[10px] text-slate-400">Fixed Parity Reserve</div>
                </div>
              </div>

              {/* Graphical Depth Bar Visualizer */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>Market Depth & Order Flow</span>
                  <span className="text-emerald-700 font-bold">Liquid Escrow: $10,400,000</span>
                </div>
                
                {/* Visual Order Book Bars */}
                <div className="h-32 bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-end gap-1.5">
                  {[35, 42, 55, 68, 85, 95, 100, 92, 75, 60, 40, 25, 30, 48, 62, 78, 88, 98, 70, 52].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col justify-end h-full group relative">
                      <div
                        style={{ height: `${val}%` }}
                        className={`w-full rounded-t-xs transition-all ${
                          idx < 10 ? 'bg-emerald-500/80 group-hover:bg-emerald-600' : 'bg-amber-400/80 group-hover:bg-amber-500'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1">
                  <span className="text-emerald-600 font-bold">← Bids (Buy Depth 52%)</span>
                  <span className="text-amber-800 font-bold">Asks (Sell Depth 48%) →</span>
                </div>
              </div>

              {/* Order Book Depth Table */}
              <div className="pt-2">
                <div className="grid grid-cols-3 text-[10px] font-mono text-slate-400 font-bold uppercase pb-1.5 border-b border-slate-100">
                  <span>Price (USD)</span>
                  <span className="text-right">Size (AKD)</span>
                  <span className="text-right">Total (USD)</span>
                </div>
                <div className="space-y-1 pt-1.5 font-mono text-xs">
                  {orderBookAsks.slice(0, 3).map((ask, i) => (
                    <div key={`ask-${i}`} className="grid grid-cols-3 text-red-500 hover:bg-red-50/50 rounded px-1 py-0.5">
                      <span>{ask.price}</span>
                      <span className="text-right text-slate-700">{ask.amount}</span>
                      <span className="text-right text-slate-400">{ask.total}</span>
                    </div>
                  ))}
                  <div className="py-1 px-1 bg-slate-100/80 rounded font-bold text-center text-xs text-slate-900 border-y border-slate-200">
                    ── Spread: 0.0001 AKD (0.01%) ──
                  </div>
                  {orderBookBids.slice(0, 3).map((bid, i) => (
                    <div key={`bid-${i}`} className="grid grid-cols-3 text-emerald-600 hover:bg-emerald-50/50 rounded px-1 py-0.5">
                      <span>{bid.price}</span>
                      <span className="text-right text-slate-700">{bid.amount}</span>
                      <span className="text-right text-slate-400">{bid.total}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 3 Metric Cards Under Order Book */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] font-mono text-slate-400 uppercase">24H High</div>
                <div className="text-base font-black font-mono text-slate-900 mt-1">₳ 1.0002</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] font-mono text-slate-400 uppercase">24H Low</div>
                <div className="text-base font-black font-mono text-slate-900 mt-1">₳ 0.9998</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Settlement Time</div>
                <div className="text-base font-black font-mono text-emerald-700 mt-1">&lt; 0.25s</div>
              </div>
            </div>

          </div>

          {/* Right 5 Columns: Interactive Swap Order Box (Paysoft / Payno Inspired) */}
          <div className="lg:col-span-5 dna-card p-6 sm:p-7 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-extrabold text-base text-slate-900 font-mono">
                {lang === 'ak' ? 'ငွေကြေး ချက်ချင်းဖလှယ်မည်' : 'Instant Currency Swap'}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                0% Slippage
              </span>
            </div>

            {swapSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle size={32} />
                </div>
                <div className="font-bold text-lg text-slate-900">Exchange Executed!</div>
                <p className="text-xs text-slate-500 font-mono">
                  Converted {sellAmount} {fromPair} to {calculatedReceive} {toPair} with 0% network commission.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecuteSwap} className="space-y-4">
                
                {/* You Pay / Sell */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                    <span>You Pay</span>
                    <span>Balance: 14,850.00 {fromPair}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="number"
                      step="1"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      className="bg-transparent text-2xl font-black font-mono text-slate-900 outline-none w-36"
                      required
                    />
                    <select
                      value={fromPair}
                      onChange={(e) => setFromPair(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs text-slate-900 cursor-pointer shadow-2xs"
                    >
                      <option value="AKD">AKD (₳)</option>
                      <option value="USDT">USDT</option>
                      <option value="THB">THB (฿)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                {/* Flip Button */}
                <div className="flex justify-center -my-2 relative z-10">
                  <button
                    type="button"
                    onClick={handleSwapPairs}
                    className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md hover:bg-slate-800 transition-transform hover:rotate-180 cursor-pointer"
                    title="Swap Currencies"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                {/* You Receive */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                    <span>You Receive (Estimated)</span>
                    <span className="text-emerald-700 font-bold">Guaranteed Rate</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-2xl font-black font-mono text-emerald-600">
                      {calculatedReceive}
                    </div>
                    <select
                      value={toPair}
                      onChange={(e) => setToPair(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs text-slate-900 cursor-pointer shadow-2xs"
                    >
                      <option value="THB">THB (฿)</option>
                      <option value="AKD">AKD (₳)</option>
                      <option value="USDT">USDT</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                {/* Transaction Details Inspector */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2 text-xs font-mono text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exchange Rate:</span>
                    <span className="font-bold text-slate-800">1 {fromPair} = {currentRate} {toPair}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trading Commission:</span>
                    <span className="text-emerald-700 font-bold">0.00 AKD (0%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Execution Speed:</span>
                    <span className="text-slate-800 font-bold">&lt; 250ms Byzantine Finality</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reserve Backing:</span>
                    <span className="text-amber-800 font-bold">100% Physical Gold & Escrow</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSwapping}
                  className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mono transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  {isSwapping ? 'Executing On-Chain...' : `Swap ${fromPair} to ${toPair} Now`}
                </button>
              </form>
            )}

            <div className="pt-2 text-center">
              <a
                href="/wallet"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-800 hover:underline"
              >
                <span>Open Full Web Banking Dashboard</span>
                <ArrowUpRight size={13} />
              </a>
            </div>

          </div>

        </div>

        {/* ── 4 INSTITUTIONAL PILLARS OF PETHAR EXCHANGE ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-sm text-slate-900 font-sans">100% Collateralized</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Every token in the exchange is backed by Tier-1 liquid USD escrow and physical bullion in Sittwe & London vaults.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Percent size={20} />
            </div>
            <h3 className="font-bold text-sm text-slate-900 font-sans">Zero Hidden Markups</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Unlike legacy wire houses charging 5% to 8%, Péthar provides exact mid-market foreign exchange rates.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-sm text-slate-900 font-sans">Sub-Second Finality</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Double-entry cryptographic ledger verifies and settles currency conversions instantly with zero counterparty risk.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <DollarSign size={20} />
            </div>
            <h3 className="font-bold text-sm text-slate-900 font-sans">Universal Interoperability</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Directly wire funds to bank accounts in Thailand, Singapore, Malaysia, and the UK or withdraw cash at Arakan POS.
            </p>
          </div>
        </div>

      </div>
    </BaseLayout>
  )
}

export default ExchangePage