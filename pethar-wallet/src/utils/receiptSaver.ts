import html2canvas from 'html2canvas'
import QRCode from 'qrcode'

export interface ReceiptData {
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
  currency?: string
  lang?: 'ak' | 'en'
}

/**
 * Check if the auto-save receipt setting is enabled in localStorage (defaults to true).
 */
export function isAutoSaveReceiptEnabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const saved = localStorage.getItem('pethar_auto_save_receipt')
    if (saved !== null) {
      return saved === 'true'
    }
  } catch (err) {
    console.warn('Could not read auto-save setting:', err)
  }
  return true
}

/**
 * Update the auto-save receipt setting in localStorage.
 */
export function setAutoSaveReceiptEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('pethar_auto_save_receipt', String(enabled))
    window.dispatchEvent(
      new CustomEvent('pethar_auto_save_changed', { detail: { enabled } })
    )
  } catch (err) {
    console.warn('Could not save auto-save setting:', err)
  }
}

/**
 * Capture an existing DOM element (like #pethar-verified-slip) using html2canvas at Retina scale.
 */
export async function captureSlipElementToBlob(
  element: HTMLElement
): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 3, // 3x for ultra-crisp 300 DPI print/gallery quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 5000,
  })

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to convert canvas to blob'))
      }
    }, 'image/png', 1.0)
  })
}

/**
 * Direct Canvas 2D fallback renderer to guarantee high-resolution receipt PNG generation
 * even if DOM styles, animations, or cross-origin fonts fail.
 */
export async function drawReceiptToCanvasBlob(
  data: ReceiptData
): Promise<Blob> {
  const width = 1080
  const height = 1760
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D canvas context')

  const isAk = data.lang === 'ak'
  const currencySymbol = data.currency === 'USD' ? '$' : '₳'
  const verificationUrl = `https://app.pethar.co.uk/verify/${data.refId}`

  // 1. Background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  // Decorative border
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 4
  ctx.strokeRect(16, 16, width - 32, height - 32)

  // Subtle Guilloche Security Dot Grid Pattern
  ctx.fillStyle = 'rgba(236, 32, 28, 0.035)'
  for (let x = 32; x < width - 32; x += 28) {
    for (let y = 32; y < height - 32; y += 28) {
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 2. Top Header Brand Bar
  ctx.fillStyle = '#D91624'
  ctx.beginPath()
  ctx.roundRect(48, 48, 64, 64, 16)
  ctx.fill()

  // Emblem "P" or Star inside Red badge
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('P', 80, 80)

  // Brand Name
  ctx.textAlign = 'left'
  ctx.fillStyle = '#D91624'
  ctx.font = '900 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('péthar', 128, 76)
  ctx.fillStyle = '#0f172a'
  ctx.font = '800 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('wallet', 268, 76)

  // E-Receipt Pill Badge
  ctx.fillStyle = '#f1f5f9'
  ctx.beginPath()
  ctx.roundRect(width - 240, 56, 192, 48, 12)
  ctx.fill()
  ctx.fillStyle = '#475569'
  ctx.font = 'bold 20px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('E-RECEIPT', width - 144, 80)

  // Horizontal Header Divider
  ctx.strokeStyle = '#f1f5f9'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(48, 136)
  ctx.lineTo(width - 48, 136)
  ctx.stroke()

  // 3. Amount Display Box
  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.roundRect(48, 160, width - 96, 200, 24)
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.fillStyle = '#64748b'
  ctx.font = '600 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(
    isAk ? 'လွှဲပြောင်းငွေပမာဏ' : 'TRANSFER AMOUNT',
    width / 2,
    205
  )

  ctx.fillStyle = '#0f172a'
  ctx.font = '900 68px monospace'
  const formattedAmount = `${currencySymbol} ${data.amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
  ctx.fillText(formattedAmount, width / 2, 280)

  // Transaction Successful Badge
  ctx.fillStyle = '#059669'
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(
    isAk ? '✓ ငွေလွှဲပြောင်းမှု အောင်မြင်ပါသည်' : '✓ Transaction Successful',
    width / 2,
    332
  )

  // 4. Sender & Recipient Box
  let yOffset = 390
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(48, yOffset, width - 96, 260, 24)
  ctx.fill()
  ctx.strokeStyle = '#f1f5f9'
  ctx.lineWidth = 2
  ctx.stroke()

  // Sender Avatar
  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.arc(104, yOffset + 56, 32, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(
    (data.senderName || 'U').charAt(0).toUpperCase(),
    104,
    yOffset + 66
  )

  // Sender Text
  ctx.textAlign = 'left'
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(data.senderName || 'User', 156, yOffset + 48)
  ctx.fillStyle = '#64748b'
  ctx.font = '500 20px monospace'
  ctx.fillText(data.senderId || 'Péthar Wallet', 156, yOffset + 76)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(isAk ? 'ပိုက်ဆံအိတ်မှ (Sender)' : 'From Wallet (Sender)', 156, yOffset + 100)

  // Direction Chevrons
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 22px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('▼', 104, yOffset + 130)

  // Recipient Badge
  ctx.fillStyle = '#0f172a'
  ctx.beginPath()
  ctx.roundRect(72, yOffset + 154, 64, 64, 16)
  ctx.fill()
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('AKD', 104, yOffset + 180)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 14px monospace'
  ctx.fillText('PAY', 104, yOffset + 202)

  // Recipient Text
  ctx.textAlign = 'left'
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(data.recipientName, 156, yOffset + 172)
  ctx.fillStyle = '#64748b'
  ctx.font = '500 20px monospace'
  ctx.fillText(data.recipientId, 156, yOffset + 200)
  ctx.fillStyle = '#059669'
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(data.recipientType || 'Péthar Pay', 156, yOffset + 224)

  // 5. Perforated Ticket Line
  const perfY = 680
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 3
  ctx.setLineDash([12, 10])
  ctx.beginPath()
  ctx.moveTo(70, perfY)
  ctx.lineTo(width - 70, perfY)
  ctx.stroke()
  ctx.setLineDash([]) // reset

  // Left notch
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(48, perfY, 20, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 3
  ctx.stroke()

  // Right notch
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(width - 48, perfY, 20, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 3
  ctx.stroke()

  // 6. Metadata Table
  const metaRows: [string, string][] = [
    [isAk ? 'ငွေလွှဲချိန်' : 'Transaction Date', data.timestamp || new Date().toLocaleString()],
    [isAk ? 'ပြေစာအမှတ်' : 'Reference Number', data.refId],
    [isAk ? 'ငွေလွှဲအမျိုးအစား' : 'Transaction Type', isAk ? 'တိုက်ရိုက်လွှဲပြောင်းမှု' : 'Direct Transfer'],
    [isAk ? 'တည်နေရာ / ကွန်ရက်' : 'Location / Network', data.location || ''],
    [isAk ? 'မှတ်ချက်' : 'Notes / Memo', data.notes || 'Payment Transfer'],
    [
      isAk ? 'ဝန်ဆောင်ခ' : 'Fee',
      data.fee === 0 || !data.fee
        ? isAk
          ? 'အခမဲ့ (၀.၀၀ ₳)'
          : 'Free (0.00 ₳)'
        : `${currencySymbol} ${data.fee.toFixed(2)}`,
    ],
  ]

  let metaY = 730
  ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  for (const [label, val] of metaRows) {
    ctx.textAlign = 'left'
    ctx.fillStyle = '#64748b'
    ctx.fillText(label, 64, metaY)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#0f172a'
    ctx.font = label.includes('Reference') || label.includes('ပြေစာအမှတ်') ? 'bold 24px monospace' : 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText(val, width - 64, metaY)
    metaY += 56
    ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }

  // 7. Bottom Verification QR Code Section
  const qrSectionY = 1110
  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.roundRect(48, qrSectionY, width - 96, 360, 24)
  ctx.fill()
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 2
  ctx.stroke()

  // QR Code generation directly to image
  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 240,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
    const qrImg = new Image()
    qrImg.src = qrDataUrl
    await new Promise((res) => {
      qrImg.onload = res
      qrImg.onerror = res
    })

    // Draw QR white border card
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(width - 320, qrSectionY + 36, 240, 240, 20)
    ctx.fill()
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.drawImage(qrImg, width - 310, qrSectionY + 46, 220, 220)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 16px monospace'
    ctx.fillText('SCAN TO VERIFY', width - 200, qrSectionY + 306)
  } catch (err) {
    console.error('Failed to draw QR code on canvas:', err)
  }

  // Verification Explanation Text
  ctx.textAlign = 'left'
  ctx.fillStyle = '#0f172a'
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(
    isAk ? '🛡️ တရားဝင် ပြေစာ စစ်ဆေးချက်' : '🛡️ Sovereign Proof & QR',
    80,
    qrSectionY + 68
  )

  ctx.fillStyle = '#64748b'
  ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  const line1 = isAk
    ? 'ဤပြေစာ၏ မှန်ကန်မှုကို ကွင်းဆက်ပေါ်တွင်'
    : 'Scan this QR code with any camera'
  const line2 = isAk
    ? 'အချိန်မရွေး တိုက်ဆိုင်စစ်ဆေးနိုင်ပါသည်။'
    : 'to verify on Arakan Sovereign Ledger.'
  ctx.fillText(line1, 80, qrSectionY + 114)
  ctx.fillText(line2, 80, qrSectionY + 146)

  ctx.fillStyle = '#D91624'
  ctx.font = 'bold 20px monospace'
  ctx.fillText(
    `Ledger Hash: 0x${data.refId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}...`,
    80,
    qrSectionY + 204
  )

  ctx.fillStyle = '#059669'
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('✓ 100% Backed Reserves & Settled', 80, qrSectionY + 244)

  // 8. Footer Bank Watermark
  ctx.textAlign = 'center'
  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(
    'BANK OF ARAKAN · CENTRAL SOVEREIGN FINANCIAL NETWORK',
    width / 2,
    height - 110
  )
  ctx.font = '16px monospace'
  ctx.fillText(
    'Official Electronic Slip · Automatically saved to device gallery',
    width / 2,
    height - 80
  )

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate canvas blob'))
      }
    }, 'image/png', 1.0)
  })
}

/**
 * Generate a complete high-resolution receipt PNG blob.
 * Tries DOM element capture with html2canvas first; if unavailable or fails,
 * falls back to pixel-perfect Canvas 2D engine.
 */
export async function generateReceiptBlob(
  slipElement: HTMLElement | null,
  data: ReceiptData
): Promise<Blob> {
  if (slipElement) {
    try {
      const blob = await captureSlipElementToBlob(slipElement)
      if (blob && blob.size > 1000) {
        return blob
      }
    } catch (err) {
      console.warn('html2canvas capture failed, using canvas 2D fallback:', err)
    }
  }
  return drawReceiptToCanvasBlob(data)
}

/**
 * Programmatically save/download the image to the phone's gallery/storage.
 * On Android, downloading a PNG automatically stores it in Downloads/Pictures
 * where the Android MediaScanner immediately adds it to the Phone Gallery / Google Photos app!
 * On iOS, when triggered manually, Web Share API allows saving directly to Camera Roll.
 */
export async function saveReceiptImageToGallery(
  blob: Blob,
  filename: string,
  title = 'Péthar E-Receipt',
  triggerShareIfAvailable = false
): Promise<{ success: boolean; method: 'share' | 'download' }> {
  const file = new File([blob], filename, { type: 'image/png' })

  // 1. If manual user click and navigator.canShare supports files (iOS Safari / Android Chrome),
  // present the native OS share sheet so user can tap "Save Image" / "Save to Photos"!
  if (
    triggerShareIfAvailable &&
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        title,
        text: `${title} - Saved from Péthar Wallet`,
        files: [file],
      })
      return { success: true, method: 'share' }
    } catch (shareErr: unknown) {
      const err = shareErr as { name?: string }
      // If user cancelled share sheet, don't throw; proceed with fallback download
      if (err?.name === 'AbortError') {
        return { success: true, method: 'share' }
      }
      console.warn('Navigator share error, falling back to download:', shareErr)
    }
  }

  // 2. Programmatic direct download:
  // On Android devices, this saves to storage and automatically indexes into Phone Gallery.
  // On iOS Safari / Chrome, this downloads the photo to device storage.
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl)
  }, 10000)

  return { success: true, method: 'download' }
}
