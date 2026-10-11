import React, { useState } from 'react'
import { CheckCircle, Download, Share2, Check } from 'lucide-react'
import { ArakanEmblem } from './ArakanEmblem'
import { FakeQR } from './FakeQR'
import type { Language } from '../i18n'

interface TransactionSlipProps {
  lang: Language
  refId: string
  amount: number
  recipientName: string
  recipientId: string
  senderName?: string
  senderId?: string
  fee?: number
  timestamp?: string
  autoSaved?: boolean
  onClose?: () => void
}

export const TransactionSlip: React.FC<TransactionSlipProps> = ({
  lang,
  refId,
  amount,
  recipientName,
  recipientId,
  senderName = 'Jack Halder',
  senderId = 'ARAK-8891-JACK',
  fee = 0.0,
  timestamp = '23 Sep 2026, 16:25',
  autoSaved = true,
  onClose,
}) => {
  const [downloaded, setDownloaded] = useState(autoSaved)
  const [shared, setShared] = useState(false)

  const handleDownload = () => {
    setDownloaded(true)
    setTimeout(() => {
      alert(
        lang === 'ak'
          ? 'ငွေလွှဲဖြတ်ပိုင်း (e-Slip) ကို ဖုန်း၏ Photos / Gallery ထဲသို့ သိမ်းဆည်းပြီးပါပြီ!'
          : 'Transaction e-Slip saved to Photos / Gallery!'
      )
    }, 200)
  }

  const handleShare = () => {
    setShared(true)
    setTimeout(() => setShared(false), 2000)
    if (navigator.share) {
      navigator.share({
        title: 'PeThar Transaction Slip',
        text: `PeThar e-Slip: Sent ₳ ${amount.toFixed(2)} to ${recipientName}. Ref: ${refId}`,
      }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(`PeThar e-Slip | Ref: ${refId} | Amount: ₳ ${amount.toFixed(2)} to ${recipientName}`)
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Auto-save notification pill (like Krungthai NEXT) */}
      {autoSaved && (
        <div className="mb-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1.5 animate-bounce">
          <Check size={12} className="text-emerald-400" />
          <span>
            {lang === 'ak'
              ? 'ဖြတ်ပိုင်းကို Photos ထဲသို့ အလိုအလျောက် သိမ်းဆည်းပြီးပါပြီ'
              : 'Slip Auto-Saved to Photos'}
          </span>
        </div>
      )}

      {/* The Authentic e-Slip Card */}
      <div
        id="pethar-e-slip"
        className="w-full rounded-3xl bg-gradient-to-b from-white via-[#FAF9F6] to-[#F2EFE9] text-gray-900 p-5 shadow-2xl border border-gray-200 relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <ArakanEmblem size={30} variant="badge" />
            <div>
              <div className="font-extrabold text-xs tracking-wider text-red-700">PETHAR</div>
              <div className="text-[9px] text-gray-500 font-medium">Bank of Arakan Electronic Slip</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
              <CheckCircle size={14} className="fill-emerald-600 text-white" />
              <span>{lang === 'ak' ? 'အောင်မြင်ပါသည်' : 'Successful'}</span>
            </div>
            <div className="text-[9px] text-gray-400 font-mono mt-0.5">{timestamp}</div>
          </div>
        </div>

        {/* Transfer Path Box */}
        <div className="my-4 space-y-3">
          {/* Sender */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              From
            </div>
            <div className="flex-1">
              <div className="font-bold text-xs text-gray-900">{senderName}</div>
              <div className="text-[10px] font-mono text-gray-500">{senderId}</div>
            </div>
          </div>

          {/* Dotted Line */}
          <div className="ml-3 border-l-2 border-dashed border-gray-300 h-3" />

          {/* Recipient */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              To
            </div>
            <div className="flex-1">
              <div className="font-bold text-xs text-gray-900">{recipientName}</div>
              <div className="text-[10px] font-mono text-gray-500">{recipientId}</div>
            </div>
          </div>
        </div>

        {/* Amount Box */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-center">
          <div className="text-[10px] uppercase tracking-wider text-amber-800 font-bold">
            {lang === 'ak' ? 'လွှဲပို့ငွေပမာဏ' : 'Transfer Amount'}
          </div>
          <div className="text-2xl font-black font-mono text-gray-900 mt-0.5">
            ₳ {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[9px] text-emerald-700 font-medium mt-0.5">
            {fee === 0 ? (lang === 'ak' ? 'ဝန်ဆောင်ခ အခမဲ့ (၀.၀၀ ₳)' : 'Fee: Free (0.00 ₳)') : `Fee: ₳ ${fee.toFixed(2)}`}
          </div>
        </div>

        {/* Details & Verification QR */}
        <div className="mt-4 pt-3 border-t border-dashed border-gray-300 flex items-center justify-between text-[10px]">
          <div>
            <div className="text-gray-400">Reference ID</div>
            <div className="font-mono font-bold text-gray-800 text-[11px]">{refId}</div>
            <div className="text-[8px] text-gray-400 mt-1 font-mono">
              HASH: 0x8a91...e420
            </div>
          </div>

          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm shrink-0">
            <FakeQR size={44} value={`pethar://verify?ref=${refId}&amount=${amount}`} />
          </div>
        </div>
      </div>

      {/* Slip Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 w-full mt-3">
        <button
          onClick={handleDownload}
          className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/10"
        >
          {downloaded ? <Check size={14} className="text-emerald-400" /> : <Download size={14} />}
          <span>
            {downloaded
              ? lang === 'ak'
                ? 'သိမ်းဆည်းပြီး ✓'
                : 'Slip Saved ✓'
              : lang === 'ak'
              ? 'ဖြတ်ပိုင်းသိမ်းရန်'
              : 'Save Slip'}
          </span>
        </button>

        <button
          onClick={handleShare}
          className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/10"
        >
          {shared ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          <span>{shared ? (lang === 'ak' ? 'ကူးယူပြီး' : 'Copied') : (lang === 'ak' ? 'မျှဝေရန်' : 'Share Slip')}</span>
        </button>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full mt-3 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition shadow-lg"
        >
          {lang === 'ak' ? 'ပြီးပါပြီ' : 'Done'}
        </button>
      )}
    </div>
  )
}
