import { useState } from 'react'
import { BaseLayout } from './BaseLayout'
import type { Language } from '../../i18n'
import {
  TrendingUp, TrendingDown, Zap,
  Send, ArrowDownLeft,
  ChevronRight, Award
} from 'lucide-react'

interface TradePageProps {
  lang: Language
}

type MarketTab = 'all' | 'commodities' | 'forex' | 'crypto'

export const TradePage = ({ lang }: TradePageProps) => {
  const [activeMarketTab, setActiveMarketTab] = useState<MarketTab>('all')
  const [tradeModalOpen, setTradeModalOpen] = useState(false)
  const [tradeAsset, setTradeAsset] = useState('24K Gold Bullion')
  const [tradeAmount, setTradeAmount] = useState('1000')

  const handleSimulateTrade = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Order filled: Allocated ₳ ${tradeAmount} to ${tradeAsset} with guaranteed 1:1 settlement.`)
    setTradeModalOpen(false)
  }

  return (
    <BaseLayout
      title={lang === 'ak' ? 'ဖေ့သာ ကုန်စည်နှင့် ဒစ်ဂျစ်တယ် အရောင်းအဝယ်' : 'Péthar Trade & Commodities Terminal'}
      lang={lang}
    >
      <div className="space-y-8 max-w-[1300px] mx-auto pb-16">
        
        {/* ── TOP HERO BANNER & MARKET TABS (NOVAPAY STYLE) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-xs font-mono font-bold mb-2">
              <Zap size={13} className="text-purple-600" />
              <span>{lang === 'ak' ? 'အာရက္ခ ဗဟိုကုန်သွယ်ရေး' : 'NovaPay Exchange Engine'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight font-sans">
              {lang === 'ak' ? 'ရွှေ၊ ကုန်စည်နှင့် ဒစ်ဂျစ်တယ်ငွေကြေး ကုန်သွယ်မှု' : 'Commodities & Digital Asset Exchange'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-mono">
              Direct physical bullion escrow, 1:1 USD liquidity rails, and energy trade clearing
            </p>
          </div>

          {/* Market Sector Tabs (NovaPay Style Pills) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-2xl text-xs font-mono font-bold text-white shadow-md">
            {[
              { id: 'all' as MarketTab, label: 'All Markets' },
              { id: 'commodities' as MarketTab, label: 'Gold & Commodities' },
              { id: 'forex' as MarketTab, label: 'Forex & THB' },
              { id: 'crypto' as MarketTab, label: 'Crypto & USDT' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMarketTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeMarketTab === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 4 LIVE ASSET METRIC CARDS (NOVAPAY HEADER STRIP) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: 24K Physical Bullion */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start text-xs font-mono text-slate-400">
              <span>Gold Bullion (oz)</span>
              <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                <TrendingUp size={12} /> +4.2%
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-400 mt-2">$2,642.50</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Sittwe Vault Allocated</div>
          </div>

          {/* Card 2: Arakan Dollar (AKD) */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start text-xs font-mono text-slate-400">
              <span>Arakan Dollar (AKD)</span>
              <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                <TrendingUp size={12} /> Parity
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-white mt-2">₳ 1.00</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">1:1 USD Escrow Peg</div>
          </div>

          {/* Card 3: Bitcoin (BTC) */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start text-xs font-mono text-slate-400">
              <span>Bitcoin (BTC)</span>
              <span className="flex items-center gap-0.5 text-red-400 font-bold">
                <TrendingDown size={12} /> -1.4%
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-white mt-2">฿ 64,850.00</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">24h Vol: $42.8M</div>
          </div>

          {/* Card 4: USDT Escrow */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start text-xs font-mono text-slate-400">
              <span>USDT Liquidity</span>
              <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                <TrendingUp size={12} /> +0.01%
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-2">$1.00</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">100% Backed Pool</div>
          </div>

        </div>

        {/* ── ROW 2: NOVAPAY NET WORTH + ASSET ALLOCATION DONUT + RECENT FILLS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 4 Cols: Net Worth & Quick Actions */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Total Trading Net Worth
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                $124,850.00
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                <TrendingUp size={13} />
                <span>+12.5% vs last month</span>
              </div>
            </div>

            <div className="my-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Available Liquid:</span>
                <span className="font-bold text-emerald-400">$84,650.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Physical Bullion Escrow:</span>
                <span className="font-bold text-amber-400">$40,200.00</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setTradeAsset('24K Physical Bullion')
                  setTradeModalOpen(true)
                }}
                className="py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Send size={13} />
                <span>Trade Now</span>
              </button>
              <button
                onClick={() => alert('Deposit allocation request dispatched to treasury.')}
                className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs font-mono border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowDownLeft size={13} />
                <span>Request</span>
              </button>
            </div>
          </div>

          {/* Center 4 Cols: NovaPay Semi-Circle Donut Asset Allocation */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col justify-between items-center text-center">
            <div className="w-full flex justify-between items-center text-xs font-mono text-slate-400">
              <span className="font-bold text-slate-300">Asset Allocation</span>
              <span className="text-emerald-400 font-bold">Audited</span>
            </div>

            {/* Semicircle Gauge Visualizer */}
            <div className="my-4 relative flex flex-col items-center">
              <svg className="w-52 h-28 transform" viewBox="0 0 200 110">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                {/* Purple segment (Fiat/Liquid 68%) */}
                <path
                  d="M 20 100 A 80 80 0 0 1 145 35"
                  fill="none"
                  stroke="#9333EA"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                {/* Emerald segment (Physical Bullion 32%) */}
                <path
                  d="M 148 37 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute bottom-1 text-center font-mono">
                <div className="text-[10px] text-slate-400 uppercase">Liquid Assets</div>
                <div className="text-xl font-black text-white">$124,850.00</div>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full flex justify-center items-center gap-6 text-xs font-mono pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600 shadow-xs" />
                <span className="text-slate-300">Liquid / USDT (68%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                <span className="text-slate-300">Bullion / Gold (32%)</span>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Recent Market Fills */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-4">
                <span className="font-bold text-slate-300">Recent Fills</span>
                <span className="text-purple-400 font-bold hover:underline cursor-pointer">View All</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">AU</span>
                    <div>
                      <div className="font-bold text-slate-200">24K Gold Bullion Spot</div>
                      <div className="text-[10px] text-slate-400">Today, 2:15 PM</div>
                    </div>
                  </div>
                  <div className="font-bold text-emerald-400">+₳ 5,000.00</div>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">TH</span>
                    <div>
                      <div className="font-bold text-slate-200">THB Remittance Swap</div>
                      <div className="text-[10px] text-slate-400">Today, 11:40 AM</div>
                    </div>
                  </div>
                  <div className="font-bold text-slate-300">-₳ 1,200.00</div>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">PO</span>
                    <div>
                      <div className="font-bold text-slate-200">Kyaukphyu Port Diesel</div>
                      <div className="text-[10px] text-slate-400">Yesterday, 4:20 PM</div>
                    </div>
                  </div>
                  <div className="font-bold text-emerald-400">+₳ 18,400.00</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] font-mono text-slate-500">
              <span>Double-entry ledger verified</span>
              <span className="text-emerald-400 font-bold">Block #2,491,012</span>
            </div>
          </div>

        </div>

        {/* ── ROW 3: FINANCIAL TRENDS DUAL BAR CHART + COMMODITIES EXPOSURE + VIRTUAL CARDS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 5 Cols: NovaPay Financial Trends Dual Bar Chart */}
          <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-slate-200 font-mono">Financial Trends</span>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-purple-400">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> Inflow
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Savings
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mb-4">Monthly inflows and savings breakdown</p>

              {/* Dual Direction Vertical Bars */}
              <div className="h-44 w-full flex items-center justify-between gap-2 pt-2 border-y border-slate-800 my-2">
                {[
                  { month: 'Jan', up: 45, down: 25 },
                  { month: 'Feb', up: 60, down: 35 },
                  { month: 'Mar', up: 85, down: 50 },
                  { month: 'Apr', up: 70, down: 40 },
                  { month: 'May', up: 95, down: 65 },
                  { month: 'Jun', up: 100, down: 75 },
                ].map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-center group">
                    {/* Upward Inflow Bar (Purple) */}
                    <div className="w-full flex items-end justify-center h-16">
                      <div
                        style={{ height: `${item.up}%` }}
                        className="w-3 rounded-t-sm bg-purple-500 group-hover:bg-purple-400 transition-all"
                      />
                    </div>
                    {/* Center Line Axis */}
                    <div className="w-full h-0.5 bg-slate-700 my-0.5" />
                    {/* Downward Savings Bar (Emerald) */}
                    <div className="w-full flex items-start justify-center h-16">
                      <div
                        style={{ height: `${item.down}%` }}
                        className="w-3 rounded-b-sm bg-emerald-500 group-hover:bg-emerald-400 transition-all"
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center font-mono">
              <div>
                <div className="text-[10px] text-slate-400">Net Flow</div>
                <div className="text-xs font-bold text-emerald-400">+₳ 8,420.50</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Target</div>
                <div className="text-xs font-bold text-purple-300">68%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">YTD Gains</div>
                <div className="text-xs font-bold text-white">₳ 32,450.00</div>
              </div>
            </div>
          </div>

          {/* Center 4 Cols: Sector Exposure Bars (NovaPay Spendings style) */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-slate-200 font-mono">Commodity Sectors</span>
                <span className="text-[10px] font-mono text-slate-400">Asset Overview</span>
              </div>

              <div className="space-y-4 pt-1 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">24K Gold Bullion</span>
                    <span className="text-purple-400 font-bold">75%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Fisheries & Agro Logistics</span>
                    <span className="text-purple-400 font-bold">85%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Diesel & Marine Energy</span>
                    <span className="text-purple-400 font-bold">55%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '55%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">THB / FX Reserves</span>
                    <span className="text-purple-400 font-bold">40%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Diversification Score:</span>
              <span className="text-emerald-400 font-bold">9.8 / 10 Excellent</span>
            </div>
          </div>

          {/* Right 3 Cols: Stacked Glowing Virtual Cards (NovaPay Style) */}
          <div className="lg:col-span-3 p-6 sm:p-7 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-sm text-slate-200 font-mono">Trading Cards</span>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div className="space-y-3">
                {/* Virtual Card 1 */}
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-900 via-indigo-900 to-purple-800 border border-purple-500/50 shadow-md font-mono space-y-2">
                  <div className="text-[10px] text-purple-200">NovaPay Virtual Balance</div>
                  <div className="text-xl font-black text-white">$3,200.00</div>
                  <div className="text-[11px] text-purple-300">•••• •••• 4587</div>
                </div>

                {/* Virtual Card 2 */}
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/40 shadow-md font-mono space-y-2">
                  <div className="text-[10px] text-indigo-300">Gold Escrow Pass</div>
                  <div className="text-xl font-black text-white">$1,450.00</div>
                  <div className="text-[11px] text-indigo-300">•••• •••• 9012</div>
                </div>
              </div>
            </div>

            {/* Upgrade Banner (NovaPay bottom-left style) */}
            <div className="mt-4 p-3 rounded-xl bg-purple-950/60 border border-purple-800 text-[11px] font-mono space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Award size={13} />
                <span>Upgrade to Premium</span>
              </div>
              <p className="text-slate-400 leading-snug">
                Zero-fee bullion vault delivery & custom laser metal card.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Quick Trade Simulation Modal */}
      {tradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-purple-500/50 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base font-mono">Allocate Position: {tradeAsset}</h3>
              <button onClick={() => setTradeModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSimulateTrade} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ALLOCATION AMOUNT (AKD)</label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-lg font-bold outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1 text-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span>Execution Price:</span>
                  <span className="text-white font-bold">$2,642.50 / oz</span>
                </div>
                <div className="flex justify-between">
                  <span>Trading Fee:</span>
                  <span className="text-emerald-400 font-bold">0.00 AKD (0%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Vault Storage:</span>
                  <span className="text-amber-400 font-bold">Sittwe Central Bullion Vault</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                Confirm Spot Allocation
              </button>
            </form>
          </div>
        </div>
      )}
    </BaseLayout>
  )
}

export default TradePage