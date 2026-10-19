import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { Copy, Check, Download, ShieldCheck, X } from 'lucide-react'
import { ArakanEmblem } from './ArakanEmblem'
import type { Language } from '../i18n'

interface ReceiveQRCardProps {
  lang?: Language
  name?: string
  petharId?: string
  amount?: number
  onClose?: () => void
}

export const ReceiveQRCard: React.FC<ReceiveQRCardProps> = ({
  lang = 'ak',
  name = 'User',
  petharId = '202610190001',
  amount,
  onClose,
}) => {
  const ak = lang === 'ak'
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const paymentPayload = `pethar://pay?to=${encodeURIComponent(petharId)}&name=${encodeURIComponent(name)}${amount ? `&amount=${amount}` : ''}`

  useEffect(() => {
    QRCode.toDataURL(paymentPayload, {
      margin: 1,
      width: 320,
      color: {
        dark: '#0a0f1d',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err))
  }, [paymentPayload])

  const handleCopy = () => {
    navigator.clipboard?.writeText(petharId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `pethar-qr-${petharId}.png`
    a.click()
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  return (
    <div className="w-full max-w-sm mx-auto select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Outer Card Styled to match ref_03.jpg */}
      <div className="rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* 1. Warm Orange Gradient Top Header */}
        <div className="bg-gradient-to-r from-[#FF6B00] via-[#FA5A00] to-[#FF8500] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ArakanEmblem size={32} variant="badge" />
            <span className="text-white font-black text-xl tracking-tight">
              péthar<span className="text-amber-200 text-xs ml-1 font-bold">pay</span>
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/15 text-white hover:bg-black/25 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 2. Navy Blue Banner (Matching ref_03.jpg THAI QR PAYMENT banner) */}
        <div className="bg-[#0A2540] text-white py-2.5 px-4 text-center flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[9px] font-bold">
            ₳
          </div>
          <span className="font-extrabold text-xs tracking-wider uppercase">
            PÉTHAR QR PAYMENT
          </span>
        </div>

        {/* 3. Center QR Code Container with Péthar Logo */}
        <div className="p-6 text-center bg-white space-y-4">
          <div className="inline-block px-3 py-1 rounded-md border border-slate-300 font-extrabold text-[11px] text-[#0A2540] tracking-wide">
            AKD Instant Pay
          </div>

          <div className="relative w-56 h-56 mx-auto bg-white p-2 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Receive Payment QR" className="w-full h-full block" />
            ) : (
              <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" />
            )}

            {/* Embedded Center Emblem */}
            <div className="absolute inset-0 m-auto w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-slate-200 flex items-center justify-center">
              <ArakanEmblem size={24} />
            </div>
          </div>

          {/* Account Details */}
          <div>
            <h3 className="font-black text-lg text-slate-900 tracking-tight">{name}</h3>
            <p className="font-mono text-sm text-slate-500 font-bold mt-0.5">{petharId}</p>
            {amount && (
              <div className="mt-2 text-2xl font-black font-mono text-amber-600">
                ₳ {amount.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* 4. Footer Security Shield (Matching ref_03.jpg) */}
        <div className="bg-[#FFF4E5] border-t border-amber-200/80 px-4 py-3 flex items-center justify-center gap-2 text-amber-900 text-xs font-semibold">
          <ShieldCheck size={16} className="text-[#FF6B00] shrink-0" />
          <span>Pay with confidence. Secured by Péthar.</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        <button
          onClick={handleCopy}
          className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-white/10 shadow-xs"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? (ak ? 'ကူးယူပြီး' : 'Copied') : ak ? 'အကောင့်နံပါတ်ကူးရန်' : 'Copy ID'}</span>
        </button>

        <button
          onClick={handleDownload}
          className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-white/10 shadow-xs"
        >
          {downloaded ? <Check size={14} className="text-emerald-400" /> : <Download size={14} />}
          <span>{downloaded ? (ak ? 'သိမ်းဆည်းပြီး' : 'Saved') : ak ? 'QR သိမ်းဆည်းရန်' : 'Save QR'}</span>
        </button>
      </div>
    </div>
  )
}
