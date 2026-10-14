import React, { useState } from 'react'
import {
  Globe, CreditCard, Check, ArrowRightLeft,
  Lock, Eye, EyeOff, RefreshCw, Send, Sparkles
} from 'lucide-react'
import { ArakanEmblem } from './ArakanEmblem'
import type { Language } from '../i18n'
import { translations } from '../i18n'

interface InternationalBankingProps {
  lang: Language
  theme?: 'dark' | 'light'
  onTopUpSuccess?: (amount: number) => void
}

export const InternationalBanking: React.FC<InternationalBankingProps> = ({
  lang,
  theme = 'light',
  onTopUpSuccess,
}) => {
  const t = translations[lang]
  const isLight = theme === 'light'
  const [activeTab, setActiveTab] = useState<'remit' | 'topup' | 'card'>('remit')

  // Remittance state
  const [sendCorridor, setSendCorridor] = useState<'THB' | 'MYR' | 'SGD' | 'USD' | 'EUR'>('THB')
  const [foreignAmount, setForeignAmount] = useState('10000')

  // Card top-up state
  const [topUpAmount, setTopUpAmount] = useState('250')
  const [selectedMethod, setSelectedMethod] = useState<'visa' | 'mastercard' | 'amex' | 'paypal' | 'wise'>('visa')
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912')
  const [cardExpiry, setCardExpiry] = useState('08/29')
  const [cardCvv, setCardCvv] = useState('882')
  const [isProcessing, setIsProcessing] = useState(false)
  const [topUpSuccessMsg, setTopUpSuccessMsg] = useState(false)

  // Card controls
  const [cardFrozen, setCardFrozen] = useState(false)
  const [showCvv, setShowCvv] = useState(false)

  // FX calculation
  const fxRates: Record<string, number> = {
    THB: 35.8,
    MYR: 4.72,
    SGD: 1.34,
    USD: 1.0,
    EUR: 0.92,
  }

  const calculatedAkd = (parseFloat(foreignAmount || '0') / (fxRates[sendCorridor] || 1)).toFixed(2)

  const handleExecuteTopUp = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setTopUpSuccessMsg(true)
      if (onTopUpSuccess) {
        onTopUpSuccess(parseFloat(topUpAmount || '0'))
      }
      setTimeout(() => setTopUpSuccessMsg(false), 3000)
    }, 1200)
  }

  return (
    <div className={`flex flex-col h-full overflow-y-auto ${isLight ? 'bg-[#F4F5F8] text-gray-900' : 'bg-[#090D14] text-white'}`}>
      {/* Header */}
      <div className={`p-5 border-b ${isLight ? 'bg-white border-gray-200' : 'bg-gradient-to-b from-[#1C2530] to-[#090D14] border-[#283852]'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Globe size={22} />
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-wide ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.intlTitle}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t.intlSubtitle}</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-3 gap-1.5 mt-4 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('remit')}
            className={`py-2 text-[11px] font-semibold rounded-lg transition ${
              activeTab === 'remit'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {lang === 'ak' ? 'Wise ငွေလွှဲ' : 'Wise Remit'}
          </button>
          <button
            onClick={() => setActiveTab('topup')}
            className={`py-2 text-[11px] font-semibold rounded-lg transition ${
              activeTab === 'topup'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {lang === 'ak' ? 'ကတ်ဖြင့်ငွေသွင်း' : 'Card Top-Up'}
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`py-2 text-[11px] font-semibold rounded-lg transition ${
              activeTab === 'card'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {lang === 'ak' ? 'ဖေ့သာကတ်' : 'Péthar Card'}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Remittance Calculator (Wise-style) */}
        {activeTab === 'remit' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#131B26] border border-[#283852] space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">
                  {lang === 'ak' ? 'ပေးပို့မည့် နိုင်ငံခြားငွေကြေး ရွေးပါ' : 'Sender Corridor & Currency'}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['THB', 'MYR', 'SGD', 'USD', 'EUR'] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setSendCorridor(curr)}
                      className={`py-2 rounded-xl text-xs font-bold transition ${
                        sendCorridor === curr
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-black/40 text-gray-400 border border-white/5 hover:border-white/20'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[10px] text-gray-400">
                    {lang === 'ak' ? `ပြည်ပမှ လွှဲမည့်ပမာဏ (${sendCorridor})` : `Sending from abroad (${sendCorridor})`}
                  </div>
                  <input
                    type="number"
                    value={foreignAmount}
                    onChange={(e) => setForeignAmount(e.target.value)}
                    className="w-full bg-transparent text-xl font-bold font-mono text-white mt-1 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-center my-1">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <ArrowRightLeft size={14} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 to-black/60 border border-amber-500/40">
                  <div className="text-[10px] text-amber-400 font-semibold">
                    {lang === 'ak' ? 'အာရက္ခဒေါ်လာ လက်ခံရရှိမည့်ပမာဏ' : 'Arakan Recipient Gets'}
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    ₳ {calculatedAkd}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-400" />
                    <span>{`1 ₳ = ${fxRates[sendCorridor]} ${sendCorridor} · Zero markup`}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(lang === 'ak' ? 'နိုင်ငံတကာငွေလွှဲ အောင်မြင်စွာ ပို့ဆောင်ပြီးပါပြီ!' : 'Wise Remittance Corridor Settled Successfully!')
                }}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                <Send size={14} />
                {lang === 'ak' ? 'ယခုချက်ချင်း ငွေလွှဲအတည်ပြုရန်' : 'Initiate Guaranteed Remittance'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Card & Gateway Top-Up (Visa / Mastercard / AMEX / PayPal) */}
        {activeTab === 'topup' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#131B26] border border-[#283852] space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">
                  {lang === 'ak' ? 'ငွေသွင်းမည့် နည်းလမ်း ရွေးပါ' : 'Select Payment Method'}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['visa', 'mastercard', 'amex', 'paypal', 'wise'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setSelectedMethod(method)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold uppercase transition ${
                        selectedMethod === method
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-black/40 text-gray-400 border border-white/5 hover:border-white/20'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">
                    {lang === 'ak' ? 'ငွေသွင်းမည့်ပမာဏ' : 'Amount to Deposit'}
                  </label>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">
                    {lang === 'ak' ? 'ကတ်နံပါတ် (Card Number)' : 'Card Number'}
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">
                      {lang === 'ak' ? 'သက်တမ်းကုန်ရက် (MM/YY)' : 'Expiry (MM/YY)'}
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">
                      {lang === 'ak' ? 'လုံခြုံရေးကုဒ် (CVV)' : 'Security CVV'}
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleExecuteTopUp}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    {lang === 'ak' ? 'ကတ်ဖြင့် ငွေသွင်းနေပါသည်...' : 'Securing 3D-Secure Clearance...'}
                  </>
                ) : (
                  <>
                    <CreditCard size={14} />
                    {lang === 'ak'
                      ? `₳ ${topUpAmount} ချက်ချင်းငွေသွင်းရန်`
                      : `Top Up ₳ ${topUpAmount} Instantly`}
                  </>
                )}
              </button>

              {topUpSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>
                    {lang === 'ak'
                      ? `₳ ${topUpAmount} အကောင့်အတွင်းသို့ အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ!`
                      : `Successfully credited ₳ ${topUpAmount} via ${selectedMethod.toUpperCase()}!`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Péthar Debit Card Management */}
        {activeTab === 'card' && (
          <div className="space-y-4">
            {/* Card Graphic */}
            <div
              className={`p-5 rounded-2xl border transition-all duration-300 shadow-2xl relative overflow-hidden ${
                cardFrozen
                  ? 'bg-gray-800/80 border-gray-600 grayscale'
                  : 'bg-gradient-to-br from-[#730A12] via-[#A8131F] to-[#3B0206] border-amber-500/50'
              }`}
              style={{ minHeight: 180 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <ArakanEmblem size={32} variant="badge" />
                  <span className="font-bold text-white text-sm tracking-wide">
                    {lang === 'ak' ? 'ဖေ့သာ ဒစ်ဂျစ်တယ်ကတ်' : 'Péthar'}
                  </span>
                </div>
                <span className="font-mono text-xs text-amber-300 tracking-wider">VISA DEBIT</span>
              </div>

              <div className="mt-6 mb-4">
                <div className="font-mono text-lg tracking-widest text-white drop-shadow">
                  4219 •••• •••• 9924
                </div>
              </div>

              <div className="flex items-end justify-between font-mono text-xs text-gray-200">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-amber-200/80">Cardholder</div>
                  <div className="font-bold text-white tracking-wide">JACK HALDER</div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-amber-200/80">Expires</div>
                    <div className="font-bold text-white">09/30</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-amber-200/80">CVV</div>
                    <div className="font-bold text-white">{showCvv ? '418' : '•••'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCardFrozen(!cardFrozen)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                  cardFrozen
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-white/10 hover:bg-white/15 text-gray-200 border-white/10'
                }`}
              >
                <Lock size={14} />
                {cardFrozen
                  ? (lang === 'ak' ? 'ကတ်ပြန်ဖွင့်ရန်' : 'Unfreeze Card')
                  : (lang === 'ak' ? 'ကတ်ယာယီပိတ်ရန်' : 'Freeze Card')}
              </button>

              <button
                onClick={() => setShowCvv(!showCvv)}
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-gray-200 border border-white/10 transition flex items-center justify-center gap-2"
              >
                {showCvv ? <EyeOff size={14} /> : <Eye size={14} />}
                {showCvv
                  ? (lang === 'ak' ? 'CVV ဝှက်ရန်' : 'Hide CVV')
                  : (lang === 'ak' ? 'CVV ပြသရန်' : 'Show CVV')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
