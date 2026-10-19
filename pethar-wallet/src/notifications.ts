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

const seed: NotiItem[] = []

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

