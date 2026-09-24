import React, { useState } from 'react'
import {
  Coins, ArrowRightLeft, Copy, Check, ShieldCheck,
  ExternalLink, Sparkles, RefreshCw
} from 'lucide-react'
import { FakeQR } from './FakeQR'
import type { Language } from '../i18n'
import { translations } from '../i18n'

interface CryptoGatewayProps {
  lang: Language
  theme?: 'dark' | 'light'
  onSwapSuccess?: (usdtAmount: number, akdAmount: number) => void
}

export const CryptoGateway: React.FC<CryptoGatewayProps> = ({
  lang,
  theme = 'dark',
  onSwapSuccess,
}) => {
  const t = translations[lang]
  const isLight = theme === 'light'
  const [activeTab, setActiveTab] = useState<'swap' | 'deposit' | 'exchanges' | 'por'>('swap')
  const [swapDirection, setSwapDirection] = useState<'usdt_to_akd' | 'akd_to_usdt'>('usdt_to_akd')
  const [swapAmount, setSwapAmount] = useState('500')
  const [selectedChain, setSelectedChain] = useState<'TRC20' | 'ERC20' | 'TON' | 'POLYGON'>('TRC20')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapSuccessMsg, setSwapSuccessMsg] = useState(false)

  const chainAddresses: Record<string, string> = {
    TRC20: 'TPeTharArakanVault992XyZ18kQ',
    ERC20: '0x71C9482Ac7B943A11C90eB892F91b0A4050e82D4',
    TON: 'EQDPeTharArakan_TON_Bridge_88921aZc99',
    POLYGON: '0x71C9482Ac7B943A11C90eB892F91b0A4050e82D4',
  }

  const copyText = (text: string, fieldId: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedField(fieldId)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSwap = () => {
    setIsSwapping(true)
    setTimeout(() => {
      setIsSwapping(false)
      setSwapSuccessMsg(true)
      const amt = parseFloat(swapAmount || '0')
      if (onSwapSuccess) {
        onSwapSuccess(amt, amt)
      }
      setTimeout(() => setSwapSuccessMsg(false), 3000)
    }, 1000)
  }

  return (
    <div className={`flex flex-col h-full overflow-y-auto ${isLight ? 'bg-[#F4F5F8] text-gray-900' : 'bg-[#090D14] text-white'}`}>
      {/* Header */}
      <div className={`p-5 border-b ${isLight ? 'bg-white border-gray-200' : 'bg-gradient-to-b from-[#1C2530] to-[#090D14] border-[#283852]'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Coins size={22} />
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-wide ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.cryptoTitle}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t.cryptoSubtitle}</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-4 gap-1.5 mt-4 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('swap')}
            className={`py-2 text-[11px] font-semibold rounded-lg transition ${
              activeTab === 'swap'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {lang === 'arak' ? 'ဒေါ်လာလဲလှယ်' : 'Dollar Swap'}
          </button>
          <button
            onClick={() => setActiveTab('deposit')}
            className={`py-2 text-[11px] font-semibold rounded-lg transition ${
              activeTab === 'deposit'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {lang === 'arak' ? 'USDT သွင်းရန်' : 'Deposit USDT'}
          </button>
          <button
            onClick={() => setActiveTab('exchanges')}
            className={`py-2 text-[11px] font-semibold rounded-lg transition ${
              activeTab === 'exchanges'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {lang === 'arak' ? 'Binance / MEXC' : 'Binance/MEXC'}
          </button>
          <button
            onClick={() => setActiveTab('por')}
            className={`py-2 text-[11px] font-semibold rounded-lg transition ${
              activeTab === 'por'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {lang === 'arak' ? 'အာမခံစစ်ဆေး' : 'Reserves PoR'}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Tab 1: Instant Dollar ⇄ USDT Swap */}
        {activeTab === 'swap' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#131B26] border border-[#283852] space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-medium">
                  {lang === 'arak' ? 'တိုက်ရိုက် လဲလှယ်မှုစနစ်' : 'Zero-Slippage Dollar Swap'}
                </span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles size={12} />
                  1 USDT = 1.00 ₳
                </span>
              </div>

              {/* Input 1 */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                <div className="text-[10px] text-gray-400 flex items-center justify-between">
                  <span>{swapDirection === 'usdt_to_akd' ? 'You Pay (USDT)' : 'You Pay (₳)'}</span>
                  <span className="text-amber-300">Balance: 2,450.00 USDT</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    className="bg-transparent text-xl font-bold font-mono text-white focus:outline-none w-2/3"
                  />
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {swapDirection === 'usdt_to_akd' ? 'USDT' : '₳'}
                  </span>
                </div>
              </div>

              {/* Direction Switcher */}
              <div className="flex justify-center -my-2">
                <button
                  onClick={() =>
                    setSwapDirection(
                      swapDirection === 'usdt_to_akd' ? 'akd_to_usdt' : 'usdt_to_akd'
                    )
                  }
                  className="w-8 h-8 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 flex items-center justify-center transition"
                >
                  <ArrowRightLeft size={14} />
                </button>
              </div>

              {/* Input 2 (Output) */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/30 to-black/50 border border-amber-500/40">
                <div className="text-[10px] text-amber-400 flex items-center justify-between">
                  <span>{swapDirection === 'usdt_to_akd' ? 'You Receive (₳)' : 'You Receive (USDT)'}</span>
                  <span className="text-emerald-400">Guaranteed Parity</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xl font-bold font-mono text-white">
                    {swapAmount || '0'}.00
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600/30 text-red-300 border border-red-500/40">
                    {swapDirection === 'usdt_to_akd' ? '₳' : 'USDT'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSwap}
                disabled={isSwapping}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                {isSwapping ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    {lang === 'arak' ? 'ချက်ချင်းလဲလှယ်နေပါသည်...' : 'Executing Dollar Settlement...'}
                  </>
                ) : (
                  <>
                    <Coins size={14} />
                    {lang === 'arak' ? 'ချက်ချင်း အာရက္ခဒေါ်လာသို့ လဲလှယ်ရန်' : 'Execute Instant 1:1 Swap'}
                  </>
                )}
              </button>

              {swapSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>
                    {lang === 'arak'
                      ? `${swapAmount} USDT မှ ${swapAmount} ₳ သို့ အောင်မြင်စွာ လဲလှယ်ပြီးပါပြီ!`
                      : `Successfully swapped ${swapAmount} USDT to ${swapAmount} ₳ at 1:1 parity!`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Multi-Chain USDT Deposit Addresses */}
        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#131B26] border border-[#283852] space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">
                  {lang === 'arak' ? 'ကွန်ရက် (Network / Chain) ရွေးချယ်ပါ' : 'Select Network / Chain'}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['TRC20', 'ERC20', 'TON', 'POLYGON'] as const).map((chain) => (
                    <button
                      key={chain}
                      onClick={() => setSelectedChain(chain)}
                      className={`py-2 rounded-xl text-xs font-bold transition ${
                        selectedChain === chain
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-black/40 text-gray-400 border border-white/5 hover:border-white/20'
                      }`}
                    >
                      {chain}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR and Address */}
              <div className="flex flex-col items-center p-4 rounded-2xl bg-black/50 border border-white/10">
                <div className="p-3 bg-white rounded-2xl shadow-xl">
                  <FakeQR size={140} value={chainAddresses[selectedChain]} />
                </div>

                <div className="w-full mt-4 space-y-2">
                  <div className="text-[10px] text-gray-400 text-center font-medium">
                    {lang === 'arak'
                      ? `သင်၏ PeThar ${selectedChain} USDT ငွေသွင်းလိပ်စာ`
                      : `Your Verified PeThar ${selectedChain} USDT Vault Address`}
                  </div>
                  <div className="font-mono text-xs text-white bg-white/5 p-2.5 rounded-xl border border-white/10 break-all select-all text-center">
                    {chainAddresses[selectedChain]}
                  </div>

                  <button
                    onClick={() => copyText(chainAddresses[selectedChain], 'addr')}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedField === 'addr' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedField === 'addr'
                      ? (lang === 'arak' ? 'လိပ်စာ ကူးယူပြီး' : 'Address Copied')
                      : (lang === 'arak' ? 'လိပ်စာ ကူးယူရန်' : 'Copy Vault Address')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Binance & MEXC Connect */}
        {activeTab === 'exchanges' && (
          <div className="space-y-4">
            {/* Binance Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1C1808] to-[#120F02] border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-black text-black text-xs">
                    BN
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Binance Pay Direct Connect</h3>
                    <p className="text-[10px] text-amber-300/80">Zero fees · Instant settlement</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-400">
                  CONNECTED
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="text-[9px] text-gray-400 font-sans">PeThar Binance Pay ID</div>
                  <div className="text-white font-bold">294819024</div>
                </div>
                <button
                  onClick={() => copyText('294819024', 'bn_id')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300"
                >
                  {copiedField === 'bn_id' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              <button
                onClick={() => alert('Binance Pay app gateway simulation opened!')}
                className="w-full py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink size={13} />
                {lang === 'arak' ? 'Binance Pay မှ တိုက်ရိုက်သွင်းရန်' : 'Deposit via Binance App'}
              </button>
            </div>

            {/* MEXC Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#061828] to-[#030E18] border border-blue-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-black text-white text-xs">
                    MX
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">MEXC Global UID Direct Bridge</h3>
                    <p className="text-[10px] text-blue-300/80">Fast P2P exchange corridor</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-400">
                  VERIFIED
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="text-[9px] text-gray-400 font-sans">PeThar MEXC Deposit UID</div>
                  <div className="text-white font-bold">81920448</div>
                </div>
                <button
                  onClick={() => copyText('81920448', 'mexc_id')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300"
                >
                  {copiedField === 'mexc_id' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              <button
                onClick={() => alert('MEXC Direct P2P transfer bridge simulation active!')}
                className="w-full py-2 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink size={13} />
                {lang === 'arak' ? 'MEXC မှ ငွေလွှဲလက်ခံရန်' : 'Bridge from MEXC'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Proof of Reserves (PoR) */}
        {activeTab === 'por' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#131B26] border border-[#283852] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    {t.cryptoProofOfReserves}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {lang === 'arak'
                      ? 'လွတ်လပ်သော နိုင်ငံတကာ စာရင်းစစ်အဖွဲ့မှ တိုက်ရိုက်စစ်ဆေးမှု'
                      : 'Real-time cryptographic audit backing all assets in circulation'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  105.0% Backed
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-gray-400">Total in Circulation</div>
                  <div className="text-base font-bold text-white font-mono mt-1">₳ 48,500,000</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-gray-400">Total Liquid Reserves</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-1">$ 50,925,000</div>
                </div>
              </div>

              {/* Asset Allocation Breakdown */}
              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <div className="text-[11px] font-semibold text-gray-300">Reserve Asset Breakdown:</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-gray-300">
                    <span>US Treasury Bills & Cash Escrow</span>
                    <span className="font-mono font-bold text-white">45% ($22.9M)</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '45%' }} />
                  </div>

                  <div className="flex justify-between items-center text-gray-300 pt-1">
                    <span>Physical Arakan Gold Bullion</span>
                    <span className="font-mono font-bold text-white">35% ($17.8M)</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '35%' }} />
                  </div>

                  <div className="flex justify-between items-center text-gray-300 pt-1">
                    <span>Liquid USDT / USDC Custody</span>
                    <span className="font-mono font-bold text-white">20% ($10.2M)</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
