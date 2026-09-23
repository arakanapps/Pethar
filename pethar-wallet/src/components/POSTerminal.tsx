import React, { useState } from 'react'
import {
  Store, Printer, CheckCircle, RefreshCw, ShoppingCart,
  QrCode, Plus, Trash2, Sparkles
} from 'lucide-react'
import { quickPosItems } from '../data'
import { FakeQR } from './FakeQR'
import { ArakanEmblem } from './ArakanEmblem'
import type { Language } from '../i18n'
import { translations } from '../i18n'

interface POSTerminalProps {
  lang: Language
  onPaymentSettled?: (amount: number) => void
}

interface CartItem {
  id: string
  name: string
  nameMm: string
  price: number
  qty: number
}

export const POSTerminal: React.FC<POSTerminalProps> = ({ lang, onPaymentSettled }) => {
  const t = translations[lang]
  const [cart, setCart] = useState<CartItem[]>([
    { id: '1', name: quickPosItems[0].name, nameMm: quickPosItems[0].nameMm, price: quickPosItems[0].price, qty: 1 },
  ])
  const [customAmount, setCustomAmount] = useState('')
  const [viewState, setViewState] = useState<'checkout' | 'waiting' | 'paid' | 'receipt'>('checkout')
  const [paidTxnId, setPaidTxnId] = useState('')

  const totalAmount =
    cart.reduce((acc, item) => acc + item.price * item.qty, 0) +
    (parseFloat(customAmount) || 0)

  const addItem = (item: (typeof quickPosItems)[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const triggerPaymentPrompt = () => {
    if (totalAmount <= 0) return
    setViewState('waiting')
  }

  const simulateCustomerScan = () => {
    const txId = 'ARAK-POS-' + Math.floor(100000 + Math.random() * 900000)
    setPaidTxnId(txId)
    setViewState('paid')
    if (onPaymentSettled) {
      onPaymentSettled(totalAmount)
    }
  }

  const resetRegister = () => {
    setCart([])
    setCustomAmount('')
    setViewState('checkout')
  }

  return (
    <div className="flex flex-col h-full bg-[#090D14] text-white overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-gradient-to-b from-[#1C2530] to-[#090D14] border-b border-[#283852] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Store size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">{t.posTitle}</h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/10 text-amber-300">
                TERMINAL #AK-092
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {lang === 'arak' ? 'မြောက်ဦးတော်ဝင် ကုန်မာနှင့် စတိုးဆိုင်' : 'Mrauk-U Sovereign Merchant Register'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-gray-400">{lang === 'arak' ? 'ယနေ့ရောင်းရငွေ' : 'Daily Sales'}</div>
          <div className="text-xs font-mono font-bold text-emerald-400">₳ 4,890.50 AKD</div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* CHECKOUT STATE */}
        {viewState === 'checkout' && (
          <div className="space-y-4">
            {/* Quick Catalog */}
            <div>
              <div className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                <ShoppingCart size={13} className="text-amber-400" />
                {t.posQuickItems}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickPosItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="p-2.5 rounded-xl bg-[#131B26] hover:bg-[#1A2638] border border-white/5 hover:border-amber-500/40 text-left transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-medium text-white line-clamp-1">
                        {lang === 'arak' ? item.nameMm : item.name}
                      </div>
                      <div className="text-[10px] text-gray-400">{item.category}</div>
                    </div>
                    <div className="text-xs font-bold font-mono text-amber-400 mt-2 flex items-center justify-between">
                      <span>₳ {item.price.toFixed(2)}</span>
                      <Plus size={14} className="text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Keypad Input */}
            <div className="p-3 rounded-2xl bg-[#131B26] border border-[#283852]">
              <label className="text-[10px] text-gray-400 block mb-1">
                {lang === 'arak' ? 'အခြား ပမာဏ ရိုက်ထည့်ရန် (AKD)' : 'Add Custom Charge (AKD)'}
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-black/40 px-3 py-2 text-sm font-mono font-bold text-white rounded-xl border border-white/10 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Current Bill List */}
            <div className="p-3.5 rounded-2xl bg-[#101724] border border-[#283852] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300 pb-2 border-b border-white/10">
                <span>{lang === 'arak' ? 'ရွေးချယ်ထားသော ပစ္စည်းများ' : 'Cart Summary'}</span>
                <span>{cart.length} items</span>
              </div>

              {cart.length === 0 && !customAmount ? (
                <div className="py-4 text-center text-xs text-gray-500">
                  {lang === 'arak' ? 'ပစ္စည်း ရွေးချယ်ထားခြင်း မရှိသေးပါ' : 'No items added yet'}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs text-gray-300">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={12} />
                        </button>
                        <span>
                          {lang === 'arak' ? item.nameMm : item.name} (x{item.qty})
                        </span>
                      </div>
                      <span className="font-mono text-white font-semibold">
                        ₳ {(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {parseFloat(customAmount) > 0 && (
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span>{lang === 'arak' ? 'အခြားကျသင့်ငွေ' : 'Custom Charge'}</span>
                      <span className="font-mono text-white font-semibold">
                        ₳ {parseFloat(customAmount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Total Due Display */}
              <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
                <span className="text-xs font-bold text-gray-400">{t.posAmountDue}:</span>
                <span className="text-2xl font-bold font-mono text-amber-400">
                  ₳ {totalAmount.toFixed(2)} <span className="text-xs font-normal">AKD</span>
                </span>
              </div>

              <button
                onClick={triggerPaymentPrompt}
                disabled={totalAmount <= 0}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg hover:brightness-110 active:scale-[0.99] transition disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
              >
                <QrCode size={14} />
                {lang === 'arak' ? 'ငွေကောက်ခံရန် QR ကုဒ်ပြသပါ' : 'Generate ArakanPay Charge QR'}
              </button>
            </div>
          </div>
        )}

        {/* WAITING FOR CUSTOMER QR SCAN */}
        {viewState === 'waiting' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#172235] to-[#101724] border border-amber-500/40 text-center space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {lang === 'arak' ? 'ဝယ်ယူသူ စကင်ဖတ်ရန် စောင့်ဆိုင်းနေပါသည်...' : 'Awaiting Customer Scan...'}
              </span>

              <div className="text-3xl font-bold font-mono text-white mt-2">
                ₳ {totalAmount.toFixed(2)} <span className="text-xs text-amber-400">AKD</span>
              </div>

              <div className="p-3 bg-white rounded-2xl inline-block shadow-2xl my-2">
                <FakeQR size={170} value={`pethar://pay?to=POS-AK-092&amount=${totalAmount}&curr=AKD`} />
              </div>

              <p className="text-xs text-gray-400">
                {lang === 'arak'
                  ? 'ဝယ်ယူသူ၏ ဖေ့သာ အက်ပ်မှ Scan ကို ဖွင့်၍ ငွေပေးချေပါ'
                  : 'Customer should open PeThar Camera / QR scanner to complete'}
              </p>

              {/* Simulation Helper Button */}
              <div className="pt-2">
                <button
                  onClick={simulateCustomerScan}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} />
                  {lang === 'arak' ? 'ဝယ်ယူသူ ငွေရှင်းပြီးကြောင်း သရုပ်ပြရန်' : 'Simulate Customer Payment Confirmation'}
                </button>

                <button
                  onClick={() => setViewState('checkout')}
                  className="w-full mt-2 py-1.5 text-xs text-gray-400 hover:text-white transition"
                >
                  {lang === 'arak' ? 'ပယ်ဖျက်ရန်' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT SETTLED NOTIFICATION */}
        {viewState === 'paid' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                <CheckCircle size={32} />
              </div>

              <h3 className="text-lg font-bold text-white">
                {lang === 'arak' ? 'ငွေပေးချေမှု အောင်မြင်ပါသည်!' : 'Payment Received & Settled!'}
              </h3>

              <div className="text-3xl font-bold font-mono text-emerald-400">
                + ₳ {totalAmount.toFixed(2)} AKD
              </div>

              <p className="text-xs text-gray-300 font-mono">
                TxID: {paidTxnId}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  onClick={() => setViewState('receipt')}
                  className="py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-gray-100 transition flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} />
                  {t.posPrintReceipt}
                </button>
                <button
                  onClick={resetRegister}
                  className="py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={14} />
                  {lang === 'arak' ? 'နောက်ထပ် အရောင်းသစ်' : 'New Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* THERMAL RECEIPT VIEW */}
        {viewState === 'receipt' && (
          <div className="space-y-4">
            {/* Paper Thermal Receipt Simulator */}
            <div className="p-6 rounded-xl bg-white text-black font-mono text-xs shadow-2xl space-y-3 border border-gray-300">
              <div className="text-center space-y-1">
                <div className="flex justify-center mb-1">
                  <ArakanEmblem size={30} variant="badge" />
                </div>
                <div className="font-bold text-sm tracking-wide">PETHAR SOVEREIGN POS</div>
                <div className="text-[10px] text-gray-600">MRAUK-U ROYAL STORE #092</div>
                <div className="text-[9px] text-gray-500">Arakan Sovereign Monetary Network</div>
                <div className="border-b border-dashed border-gray-400 my-2" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span>DATE: 2026-09-23 15:52</span>
                  <span>REF: {paidTxnId}</span>
                </div>
                <div className="border-b border-dashed border-gray-300 my-1" />
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.name} (x{item.qty})</span>
                    <span>₳ {(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                {parseFloat(customAmount) > 0 && (
                  <div className="flex justify-between">
                    <span>CUSTOM CHARGE</span>
                    <span>₳ {parseFloat(customAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-b border-dashed border-gray-300 my-1" />
                <div className="flex justify-between font-bold text-sm pt-1">
                  <span>TOTAL PAID (AKD)</span>
                  <span>₳ {totalAmount.toFixed(2)}</span>
                </div>
                <div className="text-[9px] text-gray-500 text-center pt-2">
                  * 100% Guaranteed by Arakan Dollar Reserves *
                </div>
              </div>

              <div className="pt-2 text-center">
                <div className="font-mono text-[9px] tracking-widest text-gray-400">||| | |||| || ||| ||||| |||</div>
                <div className="text-[8px] text-gray-500 mt-0.5">AUTH: 0x8a91bf204e90</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => alert(lang === 'arak' ? 'အရောင်းပြေစာ ပရင်တာသို့ ပို့ဆောင်ပြီးပါပြီ!' : 'Thermal Receipt sent to Bluetooth Printer!')}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center gap-1.5 transition"
              >
                <Printer size={14} />
                {lang === 'arak' ? 'ပရင်တာ ထုတ်ရန်' : 'Print Receipt'}
              </button>
              <button
                onClick={resetRegister}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw size={14} />
                {lang === 'arak' ? 'စာရင်းချုပ်ရန်' : 'Next Sale'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
