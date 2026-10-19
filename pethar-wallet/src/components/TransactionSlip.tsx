import React, { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import {
  CheckCircle2, Download, Share2, Check, Copy, ShieldCheck,
  ExternalLink, ChevronDown, Sparkles
} from 'lucide-react'
import { ArakanEmblem } from './ArakanEmblem'
import type { Language } from '../i18n'
import {
  generateReceiptBlob,
  saveReceiptImageToGallery,
  isAutoSaveReceiptEnabled,
} from '../utils/receiptSaver'

export interface TransactionSlipProps {
  lang?: Language
  refId: string
  amount: number
  recipientName: string
  recipientId: string
  recipientType?: string
  senderName?: string
  senderId?: string
  fee?: number
  timestamp?: string
  location?: string
  notes?: string
  autoSaved?: boolean
  onClose?: () => void
}

export const TransactionSlip: React.FC<TransactionSlipProps> = ({
  lang = 'ak',
  refId,
  amount,
  recipientName,
  recipientId,
  recipientType = 'Péthar Pay',
  senderName = 'User',
  senderId = 'Péthar Wallet ***-***-8295',
  fee = 0.0,
  timestamp = '14 Oct 2026 17:35:10',
  location = 'Sittwe, Arakan',
  notes = 'Payment',
  autoSaved = true,
  onClose,
}) => {
  const ak = lang === 'ak'
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copiedRef, setCopiedRef] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [shared, setShared] = useState(false)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)

  // Auto-save state
  const [autoSavedDone, setAutoSavedDone] = useState(false)
  const [saveStatusText, setSaveStatusText] = useState<string>('')
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null)
  const autoSavedRef = useRef<string | null>(null)

  // Verification URL that will be encoded in the QR code
  const verificationUrl = `https://app.pethar.co.uk/verify/${refId}`

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 280,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate receipt QR:', err))
  }, [verificationUrl])

  // Automatically save receipt into Phone Gallery upon transaction completion
  useEffect(() => {
    // Only auto-save if autoSaved is true and the user's setting in localStorage is enabled
    const settingEnabled = isAutoSaveReceiptEnabled()
    const shouldAutoSave = autoSaved !== false && settingEnabled
    if (!shouldAutoSave) return

    // Ensure we auto-save only once per transaction refId
    if (autoSavedRef.current === refId) return
    autoSavedRef.current = refId

    const timer = setTimeout(async () => {
      try {
        const slipEl = document.getElementById('pethar-verified-slip')
        const blob = await generateReceiptBlob(slipEl, {
          refId,
          amount,
          recipientName,
          recipientId,
          recipientType,
          senderName,
          senderId,
          fee,
          timestamp,
          location,
          notes,
          currency: 'AKD',
          lang,
        })
        setCachedBlob(blob)
        await saveReceiptImageToGallery(
          blob,
          `pethar-receipt-${refId}.png`,
          `Péthar E-Receipt - ${refId}`,
          false
        )
        setAutoSavedDone(true)
        setSaveStatusText(
          ak
            ? 'ပြေစာကို ဖုန်း Gallery ထဲသို့ အလိုအလျောက် သိမ်းဆည်းပြီးပါပြီ ✓'
            : 'Receipt Auto-Saved to Phone Gallery ✓'
        )
      } catch (err) {
        console.warn('Auto save receipt failed, continuing safely:', err)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [
    refId,
    autoSaved,
    ak,
    amount,
    recipientName,
    recipientId,
    recipientType,
    senderName,
    senderId,
    fee,
    timestamp,
    location,
    notes,
    lang,
  ])

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(refId)
    setCopiedRef(true)
    setTimeout(() => setCopiedRef(false), 2000)
  }

  // Manual save to phone gallery
  const handleDownload = async () => {
    try {
      setDownloaded(true)
      let blob = cachedBlob
      if (!blob) {
        const slipEl = document.getElementById('pethar-verified-slip')
        blob = await generateReceiptBlob(slipEl, {
          refId,
          amount,
          recipientName,
          recipientId,
          recipientType,
          senderName,
          senderId,
          fee,
          timestamp,
          location,
          notes,
          currency: 'AKD',
          lang,
        })
        setCachedBlob(blob)
      }

      await saveReceiptImageToGallery(
        blob,
        `pethar-receipt-${refId}.png`,
        `Péthar E-Receipt - ${refId}`,
        true // allow mobile share sheet on manual user gesture so user can tap "Save Image to Photos"
      )

      setAutoSavedDone(true)
      setSaveStatusText(
        ak
          ? 'ဖုန်း Gallery ထဲသို့ သိမ်းဆည်းပြီးပါပြီ ✓'
          : 'Saved to Phone Gallery ✓'
      )
    } catch (err) {
      console.error('Manual save receipt error:', err)
    } finally {
      setTimeout(() => setDownloaded(false), 3000)
    }
  }

  const handleShare = async () => {
    setShared(true)
    setTimeout(() => setShared(false), 2000)

    let blob = cachedBlob
    if (!blob) {
      const slipEl = document.getElementById('pethar-verified-slip')
      blob = await generateReceiptBlob(slipEl, {
        refId,
        amount,
        recipientName,
        recipientId,
        recipientType,
        senderName,
        senderId,
        fee,
        timestamp,
        location,
        notes,
        currency: 'AKD',
        lang,
      }).catch(() => null)
      if (blob) setCachedBlob(blob)
    }

    if (
      typeof navigator !== 'undefined' &&
      navigator.share &&
      blob &&
      navigator.canShare &&
      navigator.canShare({
        files: [
          new File([blob], `pethar-receipt-${refId}.png`, {
            type: 'image/png',
          }),
        ],
      })
    ) {
      const file = new File([blob], `pethar-receipt-${refId}.png`, {
        type: 'image/png',
      })
      navigator
        .share({
          title: 'Péthar Transaction E-Receipt',
          text: `Péthar E-Receipt: ₳ ${amount.toFixed(2)} to ${recipientName}. Ref: ${refId}. Verify at ${verificationUrl}`,
          files: [file],
        })
        .catch(() => {})
    } else if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: 'Péthar Transaction E-Receipt',
          text: `Péthar E-Receipt: ₳ ${amount.toFixed(2)} to ${recipientName}. Ref: ${refId}. Verify at ${verificationUrl}`,
          url: verificationUrl,
        })
        .catch(() => {})
    } else {
      navigator.clipboard?.writeText(verificationUrl)
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Auto-saved notification badge */}
      {(autoSavedDone || (autoSaved && isAutoSaveReceiptEnabled())) && (
        <div className="mb-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 shadow-xs animate-in fade-in slide-in-from-top-1">
          <Check size={13} className="text-emerald-600" />
          <span>
            {saveStatusText ||
              (ak
                ? 'ပြေစာကို ဖုန်း Gallery ထဲသို့ အလိုအလျောက် သိမ်းဆည်းပြီးပါပြီ'
                : 'Receipt Auto-Saved to Phone Gallery')}
          </span>
        </div>
      )}

      {/* Main E-Receipt Card (Matching TrueMoney & KBZPay ref_01 & ref_02) */}
      <div
        id="pethar-verified-slip"
        className="w-full bg-white rounded-3xl shadow-2xl border border-slate-200/90 text-slate-800 relative overflow-hidden"
      >
        {/* Subtle Watermark Guilloche Security Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#ec201c_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* 1. Brand Top Header */}
        <div className="pt-6 pb-4 px-6 text-center border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArakanEmblem size={30} variant="badge" />
            <span className="font-black text-lg tracking-tight text-[#ff2e37]">
              péthar<span className="text-slate-900 font-extrabold text-xs ml-1">wallet</span>
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
            E-Receipt
          </span>
        </div>

        {/* 2. Amount Display */}
        <div className="py-6 px-6 text-center bg-linear-to-b from-white to-slate-50/60">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-950 flex items-baseline justify-center gap-1.5">
            <span className="text-2xl text-slate-500 font-bold">₳</span>
            <span>{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] font-bold text-emerald-600">
            <CheckCircle2 size={13} className="fill-emerald-600 text-white" />
            <span>{ak ? 'ငွေလွှဲပြောင်းမှု အောင်မြင်ပါသည်' : 'Transaction Successful'}</span>
          </div>
        </div>

        {/* 3. Sender & Recipient Flow Box */}
        <div className="px-6 py-4 space-y-3 bg-white border-t border-slate-100">
          {/* Sender Row */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              {senderName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-sm text-slate-900 truncate">{senderName}</div>
              <div className="text-[11px] text-slate-500 font-mono truncate">{senderId}</div>
              <div className="text-[10px] text-slate-400 font-medium">{ak ? 'ပိုက်ဆံအိတ်မှ' : 'From wallet'}</div>
            </div>
          </div>

          {/* Triple Downward Chevrons */}
          <div className="pl-4.5 flex flex-col items-start -my-1 text-amber-500/80">
            <ChevronDown size={14} className="-mb-1.5" />
            <ChevronDown size={14} className="-mb-1.5" />
            <ChevronDown size={14} />
          </div>

          {/* Recipient Row */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white font-bold text-[10px] flex flex-col items-center justify-center shadow-xs shrink-0 mt-0.5 border border-slate-800">
              <span className="text-[9px] text-amber-400 font-black">AKD</span>
              <span className="text-[8px] font-mono">PAY</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-sm text-slate-900 truncate">{recipientName}</div>
              <div className="text-[11px] text-slate-500 font-mono truncate">{recipientId}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">{recipientType}</div>
            </div>
          </div>
        </div>

        {/* 4. Ticket Perforation Line with Scalloped Side Cutouts */}
        <div className="relative py-3">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0b0f19] border-r border-slate-700/40" />
          <div className="w-full border-t-2 border-dashed border-slate-200" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0b0f19] border-l border-slate-700/40" />
        </div>

        {/* 5. Transaction Details Metadata */}
        <div className="px-6 py-2 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span>{ak ? 'ငွေလွှဲချိန်' : 'Transaction date'}</span>
            <span className="font-mono text-slate-800 font-semibold">{timestamp}</span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span>{ak ? 'ပြေစာအမှတ်' : 'Reference number'}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-950 font-bold">{refId}</span>
              <button
                type="button"
                onClick={handleCopyRef}
                className="text-slate-400 hover:text-slate-700 transition-colors"
                title="Copy Reference ID"
              >
                {copiedRef ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span>{ak ? 'ငွေလွှဲအမျိုးအစား' : 'Transaction type'}</span>
            <span className="text-slate-800 font-medium">{ak ? 'တိုက်ရိုက်လွှဲပြောင်းမှု' : 'Direct Transfer'}</span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span>{ak ? 'တည်နေရာ / ကွန်ရက်' : 'Location'}</span>
            <span className="text-slate-800 font-medium">{location}</span>
          </div>

          {notes && (
            <div className="flex items-center justify-between text-slate-500">
              <span>{ak ? 'မှတ်ချက်' : 'Notes'}</span>
              <span className="text-slate-800 font-medium">{notes}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-500">
            <span>{ak ? 'ဝန်ဆောင်ခ' : 'Fee'}</span>
            <span className="text-emerald-700 font-bold font-mono">
              {fee === 0 ? (ak ? 'အခမဲ့ (၀.၀၀ ₳)' : 'Free (0.00 ₳)') : `₳ ${fee.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* 6. BOTTOM VERIFICATION SECTION WITH REAL SCANNABLE QR CODE */}
        <div className="mt-4 p-5 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-1 text-slate-900 font-extrabold text-xs">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>{ak ? 'ငွေလွှဲပြေစာ စစ်ဆေးရန်' : 'Scan this QR code'}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {ak
                ? 'ပြေစာ၏ မှန်ကန်မှုကို ကွင်းဆက်ပေါ်တွင် အချိန်မရွေး တိုက်ဆိုင်စစ်ဆေးနိုင်ပါသည်။'
                : 'to see the transaction details and cryptographic ledger proof.'}
            </p>
            <button
              type="button"
              onClick={() => setVerifyModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-600 hover:text-amber-700 underline mt-1 cursor-pointer"
            >
              <span>{ak ? 'ကွင်းဆက်ပေါ်တွင် စစ်မည်' : 'Verify on Ledger'}</span>
              <ExternalLink size={10} />
            </button>
          </div>

          {/* Real Scannable Verification QR Code */}
          <div
            onClick={() => setVerifyModalOpen(true)}
            className="p-2 rounded-2xl bg-white border border-slate-200 shadow-sm shrink-0 cursor-pointer hover:border-amber-400 transition-all hover:scale-105"
            title="Scan or tap to verify transaction"
          >
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Transaction Verification QR" className="w-20 h-20 block" />
            ) : (
              <div className="w-20 h-20 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-mono">
                QR...
              </div>
            )}
            <span className="block text-[8px] font-mono text-center text-slate-400 mt-1 font-bold">
              TAP TO VERIFY
            </span>
          </div>
        </div>
      </div>

      {/* Slip Actions */}
      <div className="grid grid-cols-2 gap-2.5 w-full mt-3">
        <button
          type="button"
          onClick={handleDownload}
          className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/10 shadow-xs active:scale-95 cursor-pointer"
        >
          {downloaded ? <Check size={14} className="text-emerald-400" /> : <Download size={14} />}
          <span>
            {downloaded
              ? ak
                ? 'သိမ်းဆည်းပြီး ✓'
                : 'Saved ✓'
              : ak
              ? 'ဖုန်း Gallery သို့ သိမ်းရန်'
              : 'Save to Gallery'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/10 shadow-xs active:scale-95 cursor-pointer"
        >
          {shared ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          <span>{shared ? (ak ? 'လင့်ခ်ကူးယူပြီး' : 'Shared ✓') : ak ? 'မျှဝေရန်' : 'Share Slip'}</span>
        </button>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2.5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md active:scale-98 cursor-pointer"
        >
          {ak ? 'ပြီးပါပြီ' : 'Done'}
        </button>
      )}

      {/* Cryptographic Ledger Verification Sheet Modal */}
      {verifyModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setVerifyModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 text-white space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="font-black text-sm text-white">
                  {ak ? 'ပြေစာ စိစစ်အတည်ပြုချက်' : 'Ledger Verification'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setVerifyModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{ak ? 'တရားဝင် စာရင်းသွင်းပြီးစီးမှု စစ်ဆေးအောင်မြင်ပါသည်' : 'Cryptographic Signature & Proof Validated'}</span>
              </div>

              <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ref ID:</span>
                  <span className="text-slate-200 font-bold">{refId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="text-amber-400 font-bold">₳ {amount.toFixed(2)} ($ {amount.toFixed(2)} USD)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Block Height:</span>
                  <span className="text-slate-300">#108,492</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Collateral:</span>
                  <span className="text-emerald-400 font-bold">100% Backed (USDT/USDC)</span>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Signed Hash:</span>
                  <span className="text-[9px] text-slate-400 break-all block">
                    0x8a91f4c2901bfa829471de990c7412ae8b7244ef0182c81
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setVerifyModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
            >
              {ak ? 'ပိတ်မည်' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
