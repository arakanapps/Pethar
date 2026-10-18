// ── Shared Notification Store ─────────────────────────────────────────────
// Single source of truth for the notification center and the home bell badge.
// Module-level store consumed via useSyncExternalStore so every screen stays
// in sync with the current read/unread state.

import { useSyncExternalStore } from 'react'

export type NotiType = 'transaction' | 'system' | 'promotion'

export interface NotiItem {
  id: string
  type: NotiType
  titleEn: string
  titleMm: string
  bodyEn: string
  bodyMm: string
  time: string
  dateGroup: string
  read: boolean
}

const seed: NotiItem[] = [
  {
    id: 'N-004',
    type: 'transaction',
    titleEn: 'P2P Transfer Sent',
    titleMm: 'ငွေလွှဲပို့ခြင်း အောင်မြင်ပါသည်',
    bodyEn: 'You sent ₳350.00 to Ko Min Aung (ARAK-8891). Settled instantly with zero fee.',
    bodyMm: 'ကိုမင်းအောင် (ARAK-8891) ထံ ₳350.00 ပို့လွှဲခြင်း ချက်ချင်းပြီးစီးပါသည်။',
    time: '2:22 PM',
    dateGroup: '23 Sep 2026',
    read: false,
  },
  {
    id: 'N-003',
    type: 'transaction',
    titleEn: 'Binance Pay USDT Inflow Received',
    titleMm: 'Binance မှ USDT ငွေသွင်း ရရှိပါသည်',
    bodyEn: '1,500 USDT converted 1:1 to ₳1,500.00 and credited to your vault.',
    bodyMm: 'USDT 1,500 ကို ၁:၁ နှုန်းဖြင့် ₳1,500.00 အဖြစ် သင့်စာရင်းသို့ သွင်းပြီးပါပြီ။',
    time: '11:05 AM',
    dateGroup: '23 Sep 2026',
    read: false,
  },
  {
    id: 'N-002',
    type: 'system',
    titleEn: 'Arakan Ledger Upgrade Window',
    titleMm: 'ဗဟိုစာရင်းစနစ် အဆင့်မြှင့်တင်ချိန်',
    bodyEn: 'Scheduled maintenance 24 Sep, 01:00–06:00 AM. Offline vouchers remain fully active.',
    bodyMm: 'စက်တင်ဘာ ၂၄ ရက် နံနက် ၀၁:၀၀–၀၆:၀၀ ထိန်းသိမ်းချိန်။ အော့ဖ်လိုင်းဘောက်ချာများ အသုံးပြုနိုင်ပါသည်။',
    time: '9:00 AM',
    dateGroup: '23 Sep 2026',
    read: false,
  },
  {
    id: 'N-001',
    type: 'promotion',
    titleEn: 'Zero-Fee THB Remittance Week',
    titleMm: 'ထိုင်းဘတ် ငွေလွှဲ အခမဲ့အပတ်စဉ်',
    bodyEn: 'Send THB corridor remittances with 0% markup until 30 Sep. Special FX rate locked.',
    bodyMm: 'စက်တင်ဘာ ၃၀ ရက်အထိ ထိုင်းဘတ်လမ်းကြောင်း ငွေလွှဲများ အခမဲ့။ အထူးငွေလဲနှုန်း သော့ခတ်ထားပါသည်။',
    time: '8:15 AM',
    dateGroup: '23 Sep 2026',
    read: true,
  },
]

let items: NotiItem[] = seed
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getItems() {
  return items
}

export function markAllRead() {
  items = items.map((n) => ({ ...n, read: true }))
  emit()
}

export function markRead(id: string) {
  items = items.map((n) => (n.id === id ? { ...n, read: true } : n))
  emit()
}

export function deleteNotification(id: string) {
  items = items.filter((n) => n.id !== id)
  emit()
}

export function clearAllNotifications() {
  items = []
  emit()
}

export function resetDemoNotifications() {
  items = [...seed]
  emit()
}

export function useNotifications() {
  const list = useSyncExternalStore(subscribe, getItems)
  const unread = list.filter((n) => !n.read).length
  return { list, unread }
}

