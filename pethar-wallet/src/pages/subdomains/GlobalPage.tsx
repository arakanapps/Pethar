import { useState } from 'react'
import { BaseLayout } from './BaseLayout'
import type { Language } from '../../i18n'
import {
  Globe, ArrowRight, ShieldCheck,
  CheckCircle, Clock, MapPin, Building2,
  DollarSign, RefreshCw
} from 'lucide-react'

interface GlobalPageProps {
  lang: Language
}

type Corridor = 'THB' | 'GBP' | 'USD' | 'MYR' | 'SGD'

export const GlobalPage = ({ lang }: GlobalPageProps) => {
  const [sendAmount, setSendAmount] = useState('10000')
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor>('THB')
  const [payoutMethod, setPayoutMethod] = useState<'wallet' | 'cash' | 'bank'>('wallet')
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationSent, setSimulationSent] = useState(false)

  const corridorRates: Record<Corridor, { rate: number; symbol: string; country: string; flag: string }> = {
    THB: { rate: 0.02793, symbol: '฿', country: 'Thailand', flag: '🇹🇭' },
    GBP: { rate: 1.28, symbol: '£', country: 'United Kingdom', flag: '🇬🇧' },
    USD: { rate: 1.00, symbol: '$', country: 'United States', flag: '🇺🇸' },
    MYR: { rate: 0.22, symbol: 'RM', country: 'Malaysia', flag: '🇲🇾' },
    SGD: { rate: 0.76, symbol: 'S$', country: 'Singapore', flag: '🇸🇬' },
  }

  const activeRate = corridorRates[selectedCorridor]
  const parsedAmt = parseFloat(sendAmount || '0')
  const calculatedAkd = (parsedAmt * activeRate.rate).toFixed(2)

  const handleExecuteSend = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSimulating(true)
    setTimeout(() => {
      setIsSimulating(false)
      setSimulationSent(true)
      setTimeout(() => setSimulationSent(false), 2400)
    }, 600)
  }

  return (
    <BaseLayout
      title={lang === 'ak' ? 'ဖေ့သာ နိုင်ငံတကာငွေလွှဲကွန်ရက်' : 'Péthar Global Cross-Border Remittance'}
      lang={lang}
    >
      <div className="space-y-10 max-w-[1300px] mx-auto pb-16">
        
        {/* ── TOP HERO BANNER (REVOLUT / PAYSOFT INSPIRED) ── */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-mono font-bold">
            <Globe size={13} className="text-indigo-600" />
            <span>{lang === 'ak' ? 'ကမ္ဘာလုံးဆိုင်ရာ ငွေလွှဲစင်္ကြံ' : 'Zero-Commission Diaspora Corridors'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-sans">
            {lang === 'ak'
              ? 'ကမ္ဘာတစ်ဝှမ်းမှ အာရက္ခသို့ မိနစ်ပိုင်းအတွင်း တိုက်ရိုက်ငွေလွှဲပါ'
              : 'Send Money to Arakan in Minutes with Zero Intermediary Fees'}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {lang === 'ak'
              ? 'ထိုင်း၊ မလေးရှား၊ စင်ကာပူ၊ ဗြိတိန်နှင့် အမေရိကန်တို့မှ မိသားစုများထံ တိုက်ရိုက် အာရက္ခဒေါ်လာ (AKD) ဖြင့် ငွေလွှဲနိုင်ပါပြီ။'
              : 'Direct cross-border remittances from Thailand, Malaysia, Singapore, UK, and USA straight to family wallets and local cash pickup agents.'}
          </p>
        </div>

        {/* ── INTERACTIVE REMITTANCE CALCULATOR & FEE COMPARISON ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left 7 Columns: Interactive Wire Calculator */}
          <div className="lg:col-span-7 dna-card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="font-extrabold text-lg text-slate-900 font-mono">
                    {lang === 'ak' ? 'ငွေလွှဲတွက်ချက်စက်' : 'Live Corridor Calculator'}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">Guaranteed mid-market rate locked for 30 minutes</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-mono font-bold border border-emerald-200">
                  Live FX Parity
                </span>
              </div>

              {/* Corridor Country Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(['THB', 'GBP', 'USD', 'MYR', 'SGD'] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      setSelectedCorridor(curr)
                      if (curr === 'THB') setSendAmount('10000')
                      if (curr === 'GBP') setSendAmount('300')
                      if (curr === 'USD') setSendAmount('500')
                      if (curr === 'MYR') setSendAmount('1500')
                      if (curr === 'SGD') setSendAmount('700')
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedCorridor === curr
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{corridorRates[curr].flag}</span>
                    <span>{corridorRates[curr].country} ({curr})</span>
                  </button>
                ))}
              </div>

              {simulationSent ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle size={32} />
                  </div>
                  <div className="font-bold text-lg text-slate-900">Wire Dispatched Successfully!</div>
                  <p className="text-xs text-slate-500 font-mono">
                    {sendAmount} {selectedCorridor} converted to ₳ {calculatedAkd} AKD. Recipient notified via SMS and Telegram.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleExecuteSend} className="space-y-4">
                  {/* Sender Field */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
                      <span>You Send from {activeRate.country}</span>
                      <span>Corridor Fee: $0.00</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold font-mono text-slate-400">{activeRate.symbol}</span>
                        <input
                          type="number"
                          step="1"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          className="bg-transparent text-2xl font-black font-mono text-slate-900 outline-none w-40"
                          required
                        />
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs text-slate-900 shadow-2xs">
                        {selectedCorridor}
                      </span>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <RefreshCw size={13} />
                    </div>
                  </div>

                  {/* Recipient Receives Field */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                    <div className="flex justify-between items-center text-xs font-mono text-emerald-800 mb-1">
                      <span>Recipient Receives in Arakan</span>
                      <span className="font-bold">Guaranteed Parity</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-2xl font-black font-mono text-emerald-700">
                        ₳ {calculatedAkd}
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 font-mono font-bold text-xs text-emerald-900 shadow-2xs">
                        AKD (Arakan Dollar)
                      </span>
                    </div>
                  </div>

                  {/* Payout Method Selection */}
                  <div className="pt-2">
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                      Delivery / Pickup Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('wallet')}
                        className={`p-3 rounded-xl border text-xs font-bold font-mono transition-all text-left cursor-pointer ${
                          payoutMethod === 'wallet'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">Péthar Wallet</div>
                        <div className="text-[10px] text-slate-400 font-normal">Instant (&lt; 0.8s)</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayoutMethod('cash')}
                        className={`p-3 rounded-xl border text-xs font-bold font-mono transition-all text-left cursor-pointer ${
                          payoutMethod === 'cash'
                            ? 'border-amber-400 bg-amber-50 text-amber-950 shadow-2xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">Cash Pickup</div>
                        <div className="text-[10px] text-slate-400 font-normal">Sittwe/Mrauk-U Agents</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayoutMethod('bank')}
                        className={`p-3 rounded-xl border text-xs font-bold font-mono transition-all text-left cursor-pointer ${
                          payoutMethod === 'bank'
                            ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-2xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">Local Bank Wire</div>
                        <div className="text-[10px] text-slate-400 font-normal">Same-day clearing</div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSimulating}
                    className="w-full mt-4 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mono transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    {isSimulating ? 'Processing Global Wire...' : `Transfer ${sendAmount} ${selectedCorridor} to Arakan`}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle size={13} />
                0% Hidden Foreign Exchange Surcharges
              </span>
              <span>100% Backed Reserves</span>
            </div>
          </div>

          {/* Right 5 Columns: Transparent Fee Comparison Matrix (Revolut Style) */}
          <div className="lg:col-span-5 dna-card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-sm text-slate-900 font-mono">Cost Comparison Matrix</h3>
                <span className="text-[10px] font-mono text-slate-400">Wire to Arakan</span>
              </div>

              <div className="space-y-4">
                {/* Péthar Box (Hero Winner) */}
                <div className="p-4 rounded-2xl bg-indigo-900 text-white border-2 border-indigo-500 shadow-lg relative">
                  <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                    Highest Value
                  </span>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-bold text-sm">Péthar Global Wire</span>
                    <span className="text-xl font-black font-mono text-amber-300">₳ {calculatedAkd}</span>
                  </div>
                  <div className="space-y-1 text-xs font-mono text-indigo-200">
                    <div className="flex justify-between">
                      <span>Transfer Fee:</span>
                      <span className="text-emerald-400 font-bold">$0.00 (Free)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FX Margin:</span>
                      <span className="text-emerald-400 font-bold">0% (Mid-Market)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Speed:</span>
                      <span className="text-white font-bold">&lt; 0.8 Seconds</span>
                    </div>
                  </div>
                </div>

                {/* Legacy Provider 1: Western Union */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 opacity-80">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-xs text-slate-800">Western Union</span>
                    <span className="text-base font-black font-mono text-slate-700">
                      ₳ {(parseFloat(calculatedAkd) * 0.92).toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono text-slate-500">
                    <div className="flex justify-between">
                      <span>Transfer Fee:</span>
                      <span className="text-red-500 font-bold">$18.00 - $35.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FX Spread:</span>
                      <span className="text-red-500 font-bold">4.8% Currency Markup</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Time:</span>
                      <span>2 - 4 Business Days</span>
                    </div>
                  </div>
                </div>

                {/* Legacy Provider 2: Traditional Bank SWIFT */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 opacity-80">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-xs text-slate-800">Traditional Bank Wire</span>
                    <span className="text-base font-black font-mono text-slate-700">
                      ₳ {(parseFloat(calculatedAkd) * 0.88).toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono text-slate-500">
                    <div className="flex justify-between">
                      <span>Transfer Fee:</span>
                      <span className="text-red-500 font-bold">$45.00 Intermediary Fee</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FX Spread:</span>
                      <span className="text-red-500 font-bold">5.5% Currency Spread</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Time:</span>
                      <span>3 - 7 Business Days</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-950 flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-600 shrink-0" />
              <span>You save an average of <strong>$42.50 per transfer</strong> compared to legacy wire brokers.</span>
            </div>
          </div>

        </div>

        {/* ── GLOBAL NETWORK PHYSICAL HUBS & DISPATCH RAILS ── */}
        <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl mb-8 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Physical Dispatch Infrastructure
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
              Global Financial Hubs Connected Directly to Arakan
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Certified settlement nodes operate in major diaspora centers for seamless in-person and digital deposits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <MapPin size={14} />
                <span>Bangkok & Mae Sot</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Direct PromptPay & Kasikornbank integration. Cash pickup available in 45 Arakan partner stores.
              </p>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active · 0% Surcharge
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Building2 size={14} />
                <span>London Node (UK)</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                UK Faster Payments & SEPA clearing with physical bullion vault escrow verification.
              </p>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active · Bank Clearing
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Clock size={14} />
                <span>Kuala Lumpur & Penang</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                DuitNow instant QR and Maybank integration for Arakan construction and hospitality diaspora.
              </p>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active · Instant Rails
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <DollarSign size={14} />
                <span>Singapore & USA</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                PayNow SGD & ACH USD institutional rails with automated 1:1 USDT conversion liquidity.
              </p>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active · Tier-1 Escrow
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 font-mono">
              Ready to send money to family in Sittwe, Mrauk-U, or Kyaukphyu?
            </div>
            <a
              href="/wallet"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2"
            >
              <span>Launch Web Banking Remittance</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

      </div>
    </BaseLayout>
  )
}

export default GlobalPage