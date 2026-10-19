import {
  wallets, contacts, agents,
  initialUserProfile, type UserProfile
} from './data'
import {
  ArrowUpRight, ArrowDownLeft, QrCode, Store, Eye, EyeOff,
  ChevronRight, Copy, Check,
  Fingerprint, ScanLine, Globe, Coins, Flashlight, ImagePlus,
  Clock, CreditCard, Lock, Shield,
  Plus, X, LogOut,
  Download,
  Receipt, User, Sun, KeyRound, ShieldCheck,
  Bell, ArrowLeftRight, Share2, PieChart,
  ChevronLeft, BellOff, Sparkles, CheckCheck, Trash2, MoreVertical, RotateCcw,
  History as HistoryIcon,
  Search, SmartphoneCharging, Send as SendIcon, Heart, Landmark, Layers, MonitorSmartphone
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { FakeQR } from './components/FakeQR'
import { ArakanEmblem, FlagArakan, FlagInternational } from './components/ArakanEmblem'
import { TransactionSlip } from './components/TransactionSlip'
import {
  isAutoSaveReceiptEnabled,
  setAutoSaveReceiptEnabled,
} from './utils/receiptSaver'
import {
  useNotifications, markAllRead, markRead,
  deleteNotification, clearAllNotifications, resetDemoNotifications,
  type NotiItem
} from './notifications'
import type { Language } from './i18n'
import { translations } from './i18n'
import { WalletMinimalIcon } from './components/WalletMinimalIcon'

export type ThemeMode = 'dark' | 'light'

// Shared theme-aware surface helpers (strictly light theme)
export const th = {
  root: (_theme?: ThemeMode) => 'bg-[#F4F5F8] text-gray-900',
  card: (_theme?: ThemeMode) => 'bg-white border-gray-200 text-gray-900 shadow-sm',
  cardHover: (_theme?: ThemeMode) => 'hover:bg-gray-50',
  textMain: (_theme?: ThemeMode) => 'text-gray-900',
  textSub: (_theme?: ThemeMode) => 'text-gray-500',
  divide: (_theme?: ThemeMode) => 'divide-gray-100',
}

export type Screen =
  | 'home'
  | 'account'
  | 'services'
  | 'settings'
  | 'send'
  | 'receive'
  | 'scan'
  | 'cashout'
  | 'intl'
  | 'crypto'
  | 'pos'
  | 'notifications'
  | 'pay'
  | 'history'
  | 'topup'
  | 'bills'
  | 'favourites'
  | 'financial'

// ── Shared Header ───────────────────────────────────────────────────────
export function ScreenHeader({
  title,
  subtitle,
  centerTitle = false,
  theme = 'light',
}: {
  title: string
  subtitle?: string
  centerTitle?: boolean
  theme?: ThemeMode
}) {
  const isLight = theme === 'light'
  return (
    <div className={`px-5 pt-4 pb-3 border-b backdrop-blur-md ${isLight ? 'border-gray-200 bg-white/85' : 'border-white/10 bg-[#090D14]/80'
      }`}>
      <div className={centerTitle ? 'text-center' : undefined}>
        <div className={`text-[15px] font-bold tracking-wide ${isLight ? 'text-gray-900' : 'text-white'}`}>{title}</div>
        {subtitle && <div className={`text-[11px] font-medium ${isLight ? 'text-amber-600' : 'text-amber-300'}`}>{subtitle}</div>}
      </div>
    </div>
  )
}

export function Keypad({
  value,
  onChange,
  symbol = '₳',
  theme = 'light',
}: {
  value: string
  onChange: (v: string) => void
  symbol?: string
  theme?: ThemeMode
}) {
  const isLight = theme === 'light'
  const press = (k: string) => {
    if (k === '⌫') onChange(value.slice(0, -1))
    else if (k === '.' && value.includes('.')) return
    else if (value === '0' && k !== '.') onChange(k)
    else if (value.length < 10) onChange(value + k)
  }

  return (
    <div>
      <div className="flex items-baseline justify-center gap-1.5 py-4">
        <span className={`text-2xl font-bold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>{symbol}</span>
        <span className={`text-4xl font-extrabold font-mono tabular-nums ${isLight ? 'text-gray-900' : 'text-white'}`}>{value || '0.00'}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 px-6 pb-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className={`h-12 rounded-xl text-lg font-bold transition active:scale-95 border ${isLight
                ? 'text-gray-900 bg-white hover:bg-gray-50 border-gray-200 shadow-sm'
                : 'text-white bg-white/[0.08] hover:bg-white/[0.12] border-white/5'
              }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  )
}

export function OtpDots({ len }: { len: number }) {
  return (
    <div className="flex justify-center gap-2.5 py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`flex h-11 w-9 items-center justify-center rounded-xl text-xl font-bold text-white transition-all ${i === len
              ? 'border-2 border-amber-400 bg-amber-400/10'
              : 'border border-white/10 bg-white/5'
            }`}
        >
          {len > i ? '●' : ''}
        </div>
      ))}
    </div>
  )
}

// ── HOME SCREEN (Inspired by Krungthai NEXT modern layout) ─────────────────
export function Home({
  go,
  lang,
  profile,
  theme = 'light',
}: {
  go: (s: Screen) => void
  lang: Language
  _onOpenLegal?: (doc: 'terms' | 'privacy' | 'guidelines' | 'fx') => void
  profile?: UserProfile
  theme?: ThemeMode
}) {
  const [hidden, setHidden] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggedOutToast, setLoggedOutToast] = useState(false)
  const { unread } = useNotifications()
  const isAk = lang === 'ak'
  const w = wallets[0]
  const currentProfile = profile || initialUserProfile

  const primaryActions = [
    { id: 'scan' as Screen, label: isAk ? 'ငွေပေးချေ' : 'Pay', icon: WalletMinimalIcon },
    { id: 'receive' as Screen, label: isAk ? 'ငွေလက်ခံ' : 'Receive', icon: QrCode },
    { id: 'crypto' as Screen, label: isAk ? 'ငွေသွင်း' : 'Deposit', icon: ArrowDownLeft },
    { id: 'cashout' as Screen, label: isAk ? 'ငွေထုတ်' : 'Withdraw', icon: ArrowUpRight },
  ]

  const secondaryServices = [
    { id: 'topup' as Screen, label: isAk ? 'ငွေဖြည့်' : 'Topup', icon: Plus },
    { id: 'bills' as Screen, label: isAk ? 'ဘေလ်ဆောင်' : 'Bill payment', icon: Receipt },
    { id: 'account' as Screen, label: isAk ? 'ငွေစာရင်း' : 'Account', icon: CreditCard },
    { id: 'history' as Screen, label: isAk ? 'မှတ်တမ်း' : 'History', icon: Clock },
  ]

  const favorites = [
    { name: 'user', mm: 'အသုံးပြုသူ', id: '202610190002', initials: 'U', bg: 'bg-sky-600' },
    { name: 'User', mm: 'မြတ်စိုး', id: '202610190003', initials: 'U', bg: 'bg-blue-600' },
    { name: 'TONY', mm: 'တိုနီ', id: '202610190004', initials: 'TN', bg: 'bg-emerald-600' },
    { name: 'KO MIN AUNG', mm: 'မင်းအောင်', id: '202610190005', initials: 'MA', bg: 'bg-amber-600' },
  ]

  const [adIdx, setAdIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setAdIdx((prev) => (prev + 1) % 4)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const promoAds = [
    {
      titleEn: 'Péthar Zero-Fee Global Remittance',
      titleAk: 'ဖေ့သာ ၀% ဝန်ဆောင်ခ အထူးအစီအစဉ်',
      descEn: 'Instant transfers & zero network gas fees',
      descAk: 'နယ်စပ်ဖြတ်ကျော် ငွေလွှဲခမဲ့နှင့် လက်ငင်းလွှဲပို့ခြင်း',
      gradient: 'from-zinc-900 via-zinc-800 to-[#7A1020]',
      icon: ArrowLeftRight,
      accentBg: 'bg-red-500/20 text-red-400',
    },
    {
      titleEn: 'Arakan Merchant 5% Cashback',
      titleAk: 'ကုန်သည်ဆိုင်များတွင် ၅% ပြန်အမ်းငွေ',
      descEn: 'Earn 5% cashback at verified partner merchants',
      descAk: 'အတည်ပြုစတိုးဆိုင်များတွင် QR ဖြင့် ပေးချေပါ',
      gradient: 'from-slate-900 via-slate-800 to-emerald-900',
      icon: Store,
      accentBg: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      titleEn: 'Péthar Offline Bearer eCash',
      titleAk: 'အင်တာနက်မလိုဘဲ ငွေသားကဲ့သို့ ပေးချေခြင်း',
      descEn: 'NFC & soundwave offline tap-to-pay anywhere',
      descAk: 'အသံလှိုင်းနှင့် NFC ဖြင့် အင်တာနက်မဲ့ သုံးစွဲနိုင်သည်',
      gradient: 'from-indigo-950 via-slate-900 to-slate-800',
      icon: Globe,
      accentBg: 'bg-indigo-500/20 text-indigo-400',
    },
    {
      titleEn: '100% Gold-Backed AKD Vault',
      titleAk: 'ရွှေအာမခံ ၁၀၀% အပြည့်ဖြင့် ထိန်းသိမ်းထားသော ငွေကြေး',
      descEn: 'Audited reserve backed 1:1 by gold',
      descAk: 'ရုပ်ပိုင်းဆိုင်ရာ ရွှေနှင့် ဒေါ်လာဖြင့် အပြည့်အဝ အာမခံထားသည်',
      gradient: 'from-amber-950 via-stone-900 to-stone-800',
      icon: ShieldCheck,
      accentBg: 'bg-amber-500/20 text-amber-400',
    },
  ]

  return (
    <div className={`flex h-full flex-col overflow-y-auto ${th.root(theme)} pb-8`}>
      {/* 1. Top Header Row: (User Photo) | (App Logo) | (Noti Bell) | (Logout & Close) */}
      <div className="px-4 pt-3.5 pb-2 relative flex items-center justify-between">
        <button
          onClick={() => go('settings')}
          className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#D91624]/30 bg-white shadow-xs flex items-center justify-center active:scale-95 transition shrink-0 z-10"
          title={currentProfile.name || 'Profile'}
        >
          {currentProfile.avatarUrl ? (
            <img
              src={currentProfile.avatarUrl}
              alt={currentProfile.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={20} className="text-[#D91624]" />
          )}
        </button>

        <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={() => go('home')}
            className="pointer-events-auto w-10 h-10 flex items-center justify-center active:scale-95 transition bg-transparent border-0 shadow-none hover:bg-transparent"
            aria-label="Home"
          >
            <ArakanEmblem size={34} variant="badge" />
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            onClick={() => go('notifications')}
            className="relative w-10 h-10 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center text-gray-700 hover:text-[#D91624] transition active:scale-95"
            title={isAk ? 'အသိပေးချက်များ' : 'Notifications'}
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-[#D91624] text-white text-[9px] font-black flex items-center justify-center border border-white">
                {unread}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-xs text-gray-700 hover:text-[#D91624] hover:border-red-200 flex items-center justify-center transition active:scale-95"
            title={isAk ? 'အကောင့်ထွက်ရန်' : 'Logout and close'}
            aria-label="Logout and close"
          >
            <LogOut size={15} className="text-[#D91624]" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-2 space-y-3.5">
        {/* 2. Welcome Back Card */}
        <div className="bg-white rounded-[22px] px-4 py-3.5 border border-gray-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-gray-500 font-semibold">
              {isAk ? 'ပြန်လည်ကြိုဆိုပါသည်' : 'Welcome back'}
            </div>
            <div className="text-base font-extrabold text-gray-900 truncate mt-0.5">
              {currentProfile.name}
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full border border-sky-500/40 bg-sky-50 text-sky-700 text-xs font-bold inline-flex items-center gap-1.5 shrink-0">
            <ShieldCheck size={14} className="text-sky-600" />
            <span>{isAk ? 'အတည်ပြုပြီး' : 'Verified'}</span>
          </span>
        </div>

        {/* 3. Primary 4-Action Card: Pay | Receive | Deposit | Withdraw */}
        <div className="bg-white rounded-[22px] px-3 py-4 border border-gray-200/80 shadow-xs">
          <div className="grid grid-cols-4 gap-2">
            {primaryActions.map((act, i) => (
              <button
                key={i}
                onClick={() => go(act.id)}
                className="flex flex-col items-center gap-2 active:scale-95 transition"
              >
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200/70 text-[#D91624] flex items-center justify-center shadow-2xs">
                  <act.icon size={20} strokeWidth={2.2} />
                </div>
                <span className="text-xs font-bold text-gray-900">{act.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Wallet Balance (AKD) Card */}
        <div className="bg-white rounded-[22px] px-4 py-4 border border-gray-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
            <span>{isAk ? 'ပိုက်ဆံအိတ် လက်ကျန်ငွေ (AKD)' : 'Wallet Balance (AKD)'}</span>
            <button onClick={() => setHidden(!hidden)} className="text-gray-500 hover:text-gray-900 transition">
              {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div className="mt-2 flex items-baseline font-mono tracking-tight tabular-nums">
            {hidden ? (
              <span className="text-2xl font-black text-gray-900 tracking-widest">••••••••</span>
            ) : (
              <>
                <span className="text-2xl font-black text-[#D91624] mr-1.5">{w.symbol}</span>
                <span className="text-2xl sm:text-3xl font-black text-gray-950">
                  {w.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 5. Secondary 4-Service Card: Topup | Bill payment | Account | History */}
        <div className="bg-white rounded-[22px] px-3 py-4 border border-gray-200/80 shadow-xs">
          <div className="grid grid-cols-4 gap-2">
            {secondaryServices.map((qs, i) => (
              <button
                key={i}
                onClick={() => go(qs.id)}
                className="flex flex-col items-center gap-2 active:scale-95 transition"
              >
                <div className="w-11 h-11 rounded-full bg-gray-50 border border-gray-200 text-[#D91624] flex items-center justify-center shadow-2xs">
                  <qs.icon size={20} strokeWidth={2.2} />
                </div>
                <span className="text-[11px] font-bold text-gray-800 text-center leading-tight">
                  {qs.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Favourites Row */}
        <div>
          <div className="flex items-center justify-between pb-2 px-1">
            <span className="text-xs font-extrabold text-gray-800">
              {isAk ? 'စိတ်ကြိုက် လွှဲသူများ' : 'Favourites'}
            </span>
            <button onClick={() => go('pay')} className="text-xs font-bold text-[#D91624] hover:underline">
              {isAk ? 'အားလုံးကြည့်ရန်' : 'view all'}
            </button>
          </div>

          <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
            {favorites.map((fav, i) => (
              <button
                key={i}
                onClick={() => go('pay')}
                className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition"
              >
                <div className={`w-11 h-11 rounded-full ${fav.bg} flex items-center justify-center font-bold text-xs text-white shadow-xs border-2 border-white`}>
                  {fav.initials === 'U' ? <User size={18} /> : fav.initials}
                </div>
                <span className="text-[11px] font-semibold truncate w-14 text-center text-gray-700">
                  {isAk ? fav.mm : fav.name}
                </span>
              </button>
            ))}

            <button
              onClick={() => go('pay')}
              className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition"
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-dashed bg-white hover:bg-gray-50 text-gray-600 border-gray-300">
                <Plus size={18} />
              </div>
              <span className="text-[11px] font-semibold text-gray-500">Add</span>
            </button>
          </div>
        </div>

        {/* 7. 4 Moving Ads Banner (NO "ADS" TEXT) */}
        <div className="space-y-2">
          <div className={`p-3.5 rounded-[20px] bg-gradient-to-r ${promoAds[adIdx].gradient} text-white flex items-center justify-between gap-3 shadow-xs transition-all duration-500`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-full ${promoAds[adIdx].accentBg} flex items-center justify-center shrink-0`}>
                {(() => {
                  const Icon = promoAds[adIdx].icon
                  return <Icon size={18} />
                })()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold truncate">
                  {isAk ? promoAds[adIdx].titleAk : promoAds[adIdx].titleEn}
                </div>
                <div className="text-[11px] text-gray-300 truncate mt-0.5">
                  {isAk ? promoAds[adIdx].descAk : promoAds[adIdx].descEn}
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 py-0.5">
            {promoAds.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAdIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === adIdx ? 'w-5 bg-[#D91624]' : 'w-1.5 bg-gray-300'
                  }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── LOGOUT CONFIRMATION MODAL ─────────────────────────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs rounded-3xl p-5 shadow-2xl border bg-[#101724] border-red-500/30 text-white text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
              <LogOut size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isAk ? 'အကောင့်မှ ထွက်မည်လား?' : 'Log out of Péthar?'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {isAk
                  ? 'လုံခြုံရေးအရ သင်၏ စက်တွင်း session အား ပိတ်သိမ်းပါမည်။'
                  : 'Your active session will be ended securely.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-300 transition"
              >
                {isAk ? 'မထွက်ပါ' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false)
                  setLoggedOutToast(true)
                  setTimeout(() => setLoggedOutToast(false), 3000)
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg transition"
              >
                {isAk ? 'ထွက်မည်' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logged Out Toast */}
      {loggedOutToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-red-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-red-400">
          <Check size={14} />
          <span>{isAk ? 'အကောင့်ထွက်ပြီးပါပြီ' : 'Logged out securely'}</span>
        </div>
      )}
    </div>
  )
}

// ── MINI PIE / DONUT CHART SVG COMPONENT ───────────────────────────────
function MiniDonutChart({
  slices,
  size = 64,
  strokeWidth = 9,
  centerContent,
}: {
  slices: { percent: number; color: string }[]
  size?: number
  strokeWidth?: number
  centerContent?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let accumulated = 0

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {slices.map((slice, i) => {
          const dash = (slice.percent / 100) * circumference
          const offset = (accumulated / 100) * circumference
          accumulated += slice.percent
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      {centerContent && (
        <div className="absolute inset-0 flex items-center justify-center">
          {centerContent}
        </div>
      )}
    </div>
  )
}

// ── ACCOUNT SCREEN (Second Tab in Bottom Dock & Secondary Service) ───────
export function AccountScreen({
  go,
  lang,
  theme = 'light',
}: {
  go: (s: Screen) => void
  lang: Language
  theme?: ThemeMode
}) {
  const [copiedAddr, setCopiedAddr] = useState(false)
  const [copiedUid, setCopiedUid] = useState(false)

  const isLight = theme === 'light'
  const isAk = lang === 'ak'

  // Account Balances
  const akdBal = wallets.length > 0 ? wallets[0].balance : 0.00
  const akdPending = 0.00
  const akdTotal = akdBal + akdPending

  const usdBal = 0.00
  const usdPending = 0.00
  const usdTotal = usdBal + usdPending

  const totalAmount = akdBal + usdBal
  const akdPercent = totalAmount > 0 ? (akdBal / totalAmount) * 100 : 50
  const usdPercent = totalAmount > 0 ? (usdBal / totalAmount) * 100 : 50

  const userUid = initialUserProfile.uid || '202610190001'

  const copyAddress = () => {
    navigator.clipboard.writeText('0x36a8F492C109bE742819aBcD8391048291045f19')
    setCopiedAddr(true)
    setTimeout(() => setCopiedAddr(false), 2000)
  }

  const copyUid = () => {
    navigator.clipboard.writeText(userUid)
    setCopiedUid(true)
    setTimeout(() => setCopiedUid(false), 2000)
  }

  return (
    <div className={`flex h-full flex-col overflow-y-auto ${th.root(theme)}`}>
      {/* ── TOP APP BAR: Accounts in middle, & Balances, History button on right ── */}
      <div className={`px-4 pt-4 pb-3 border-b flex items-center justify-between ${
        isLight ? 'border-gray-200 bg-white' : 'border-white/10 bg-[#090D14]'
      }`}>
        <button
          onClick={() => go('home')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition active:scale-95"
          aria-label="Back to home"
        >
          <ChevronRight size={20} className="rotate-180" />
        </button>

        <div className="text-center">
          <div className={`text-base font-bold tracking-wide ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {isAk ? 'ငွေစာရင်းများ' : 'Accounts'}
          </div>
          <div className="text-[11px] text-gray-500 font-semibold">
            {isAk ? '& လက်ကျန်ငွေများ' : '& Balances'}
          </div>
        </div>

        <button
          onClick={() => go('history')}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-950 transition active:scale-95 bg-white shadow-2xs"
          title={isAk ? 'မှတ်တမ်း' : 'History'}
        >
          <HistoryIcon size={17} />
        </button>
      </div>

      <div className="p-4 space-y-4 pb-12">
        {/* ═════════════════════════════════════════════════════════════════════
           1. FIRST OVERVIEW TOTAL AMOUNT CARD (RED & YELLOW PIE CHART)
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0B192C] via-[#1E2A38] to-[#101726] border border-blue-400/30 text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-500/25 flex items-center justify-center text-blue-300">
              <PieChart size={15} />
            </div>
            <span className="text-xs font-bold text-gray-300">
              {isAk ? 'အကျဉ်းချုပ် (Overview)' : 'Overview'}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-[11px] text-gray-400 font-medium">
              {isAk ? 'စုစုပေါင်း ပမာဏ (Total Amount)' : 'Total Amount'}
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-white flex items-baseline mt-1">
              <span className="text-[#E11D48] mr-1 text-2xl font-bold">₳</span>
              <span>{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Red & Yellow Donut Chart + Legend */}
          <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
            <MiniDonutChart
              slices={[
                { percent: akdPercent, color: '#E11D48' },
                { percent: usdPercent, color: '#F59E0B' },
              ]}
              size={68}
              strokeWidth={10}
              centerContent={<ArakanEmblem size={22} />}
            />
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] shrink-0" />
                <span className="font-semibold text-gray-200">
                  Wallet: ₳ {akdBal.toFixed(2)} ({akdPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                <span className="font-semibold text-gray-200">
                  USD: $ {usdBal.toFixed(2)} ({usdPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
           2. PETHAR WALLET (AKD) CARD
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="p-4 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArakanEmblem size={26} variant="badge" />
              <div>
                <div className="text-xs font-bold text-gray-900">
                  {isAk ? 'ဖေ့သာ ပိုက်ဆံအိတ် (akd)' : 'Pethar wallet (akd)'}
                </div>
                <div className="text-[11px] text-gray-500 font-mono font-semibold flex items-center gap-1.5 mt-0.5">
                  <span>{userUid}</span>
                  <button
                    onClick={copyUid}
                    className="text-gray-400 hover:text-gray-600 active:scale-90 transition p-0.5"
                    title="Copy UID"
                  >
                    {copiedUid ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ACTIVE
            </span>
          </div>

          {/* Middle Row: Balances on Left, Small Pie Chart on Right */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                {isAk ? 'လက်ကျန်ငွေ' : 'Available Balance'}
              </div>
              <div className="text-2xl font-black font-mono text-gray-950 mt-0.5 flex items-baseline">
                <span className="text-[#D91624] mr-1">₳</span>
                <span>{akdBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Small Pie Chart (Green Available, Yellow Pending) */}
            <MiniDonutChart
              slices={[
                { percent: 100, color: '#10B981' },
                { percent: 0, color: '#F59E0B' },
              ]}
              size={60}
              strokeWidth={8}
              centerContent={
                <span className="text-sm font-black text-[#D91624]">₳</span>
              }
            />
          </div>

          {/* Green dot Available, Yellow dot Pending, Blue dot Total */}
          <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-[10px] font-semibold text-gray-700">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Available: ₳ {akdBal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span>Pending: ₳ {akdPending.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              <span className="font-bold">Total: ₳ {akdTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
           3. USD ACCOUNT CARD
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="p-4 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm">
                $
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">
                  {isAk ? 'ယူအက်စ်ဒီ အကောင့်' : 'USD Account'}
                </div>
                <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                  <span>0x36...5f19</span>
                  <button onClick={copyAddress} className="text-gray-400 hover:text-gray-600 active:scale-90 transition p-0.5" title="Copy Wallet Address">
                    {copiedAddr ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              ACTIVE
            </span>
          </div>

          {/* Middle Row: Balances on Left, Small Pie Chart on Right */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                {isAk ? 'လက်ကျန်ငွေ' : 'Available Balance'}
              </div>
              <div className="text-2xl font-black font-mono text-gray-950 mt-0.5 flex items-baseline">
                <span className="text-emerald-600 mr-1">$</span>
                <span>{usdBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Small Pie Chart (Green Available, Yellow Pending) */}
            <MiniDonutChart
              slices={[
                { percent: 100, color: '#10B981' },
                { percent: 0, color: '#F59E0B' },
              ]}
              size={60}
              strokeWidth={8}
              centerContent={
                <span className="text-sm font-black text-emerald-600">$</span>
              }
            />
          </div>

          {/* Green dot Available, Yellow dot Pending, Blue dot Total */}
          <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-[10px] font-semibold text-gray-700">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Available: $ {usdBal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span>Pending: $ {usdPending.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              <span className="font-bold">Total: $ {usdTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── SERVICES SCREEN (Comprehensive, Premium Financial Directory) ────────
export function ServicesScreen({
  go,
  lang,
  theme = 'light',
}: {
  go: (s: Screen) => void
  lang: Language
  theme?: ThemeMode
}) {
  const isAk = lang === 'ak'
  const isLight = theme === 'light'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'payments' | 'topup_bills' | 'banking' | 'crypto_pos' | 'security'
  >('all')

  const serviceCategories = [
    {
      id: 'payments' as const,
      titleEn: 'Payments & Transfers',
      titleMm: 'ငွေလွှဲနှင့် ငွေပေးချေမှုစနစ်များ',
      descEn: 'Instant P2P, merchant QR payment, and recipient lists',
      descMm: 'ချက်ချင်းငွေလွှဲ၊ ဆိုင်ငွေပေးချေမှုနှင့် စိတ်ကြိုက်စာရင်းများ',
      items: [
        {
          id: 'send' as Screen,
          nameEn: 'P2P Send Money',
          nameMm: 'ငွေလွှဲမည် (P2P Transfer)',
          descEn: 'Send instantly to phone number, Account ID, or Arakan UID',
          descMm: 'မည်သည့် ဖုန်းနံပါတ်၊ အကောင့်နံပါတ် သို့မဟုတ် ရခိုင် UID သို့မဆို ချက်ချင်းငွေလွှဲပါ',
          tagEn: 'Instant',
          tagMm: 'ချက်ချင်း',
          icon: SendIcon,
          color: 'from-emerald-500 to-teal-600',
          badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
        },
        {
          id: 'receive' as Screen,
          nameEn: 'Receive Money & QR',
          nameMm: 'ငွေလက်ခံမည် (Receive & QR)',
          descEn: 'Generate personal QR code, Arakan ID address, or payment link',
          descMm: 'ကိုယ်ပိုင် QR ကုဒ်၊ ရခိုင် ID လိပ်စာ သို့မဟုတ် ငွေလက်ခံလင့်ခ် ထုတ်ယူပါ',
          tagEn: 'QR & Link',
          tagMm: 'QR ကုဒ်',
          icon: QrCode,
          color: 'from-blue-500 to-cyan-600',
          badgeColor: 'bg-blue-50 text-blue-600 border-blue-200/60',
        },
        {
          id: 'pay' as Screen,
          nameEn: 'Scan & Merchant Pay',
          nameMm: 'စကင်ဖတ်၍ ငွေချေမည် (Scan & Pay)',
          descEn: 'Scan store QR codes, bill invoices, or merchant counters across Arakan',
          descMm: 'ရခိုင်ပြည်နယ်အတွင်း ဆိုင်များနှင့် မိတ်ဆွေများ၏ QR ကုဒ်ကို စကင်ဖတ်၍ ငွေချေပါ',
          tagEn: 'Merchant Pay',
          tagMm: 'ဆိုင်ငွေချေ',
          icon: ScanLine,
          color: 'from-red-500 to-rose-600',
          badgeColor: 'bg-red-50 text-red-600 border-red-200/60',
        },
        {
          id: 'favourites' as Screen,
          nameEn: 'Saved Recipients',
          nameMm: 'စိတ်ကြိုက် စာရင်းများ (Favourites)',
          descEn: 'Fast 1-tap transfers to frequent friends, family, and merchant contacts',
          descMm: 'ပုံမှန်ငွေလွှဲနေကျ မိသားစု၊ မိတ်ဆွေများနှင့် ဆိုင်များသို့ တစ်ချက်နှိပ်ရုံဖြင့် လွှဲနိုင်သည်',
          tagEn: 'Quick Send',
          tagMm: 'အမြန်လွှဲ',
          icon: Heart,
          color: 'from-pink-500 to-rose-500',
          badgeColor: 'bg-pink-50 text-pink-600 border-pink-200/60',
        },
      ],
    },
    {
      id: 'topup_bills' as const,
      titleEn: 'Airtime & Utility Bills',
      titleMm: 'ဖုန်းဘေလ်ဖြည့်နှင့် အသုံးစရိတ်ပေးဆောင်မှု',
      descEn: 'Mobile packages, electricity, water supply, fiber internet and TV',
      descMm: 'ဖုန်းလိုင်းအားလုံး၊ မီးဘေလ်၊ ရေဘေလ်၊ ဖိုင်ဘာအင်တာနက်နှင့် ရုပ်သံလိုင်းများ',
      items: [
        {
          id: 'topup' as Screen,
          nameEn: 'Mobile Top-Up & Data',
          nameMm: 'ဖုန်းဘေလ်နှင့် ဒေတာဖြည့်ရန်',
          descEn: 'MPT, ATOM, Ooredoo & MyTel instant airtime reload and data packs',
          descMm: 'MPT, ATOM, Ooredoo, MyTel ဖုန်းဘေလ်နှင့် အထူးဒေတာပက်ကေ့ချ်များ ချက်ချင်းဖြည့်ပါ',
          tagEn: 'All Telcos',
          tagMm: 'လိုင်းအားလုံး',
          icon: SmartphoneCharging,
          color: 'from-violet-500 to-purple-600',
          badgeColor: 'bg-violet-50 text-violet-600 border-violet-200/60',
        },
        {
          id: 'bills' as Screen,
          nameEn: 'Utility & Bill Payments',
          nameMm: 'ဘေလ်ပေးဆောင်ရန် (Bills)',
          descEn: 'Electricity, municipal water, high-speed fiber internet, and streaming TV',
          descMm: 'လျှပ်စစ်မီးဘေလ်၊ စည်ပင်ရေဘေလ်၊ ဖိုင်ဘာအင်တာနက်လိုင်းများနှင့် ရုပ်သံလိုင်းများ ဘေလ်ဆောင်ပါ',
          tagEn: 'Zero Fee',
          tagMm: 'အခမဲ့',
          icon: Receipt,
          color: 'from-amber-500 to-orange-600',
          badgeColor: 'bg-amber-50 text-amber-600 border-amber-200/60',
        },
      ],
    },
    {
      id: 'banking' as const,
      titleEn: 'Cash & Multi-Currency Banking',
      titleMm: 'ငွေသားထုတ်ယူမှုနှင့် နိုင်ငံခြားငွေစာရင်း',
      descEn: 'Agent network cash settlement, multi-currency accounts and statements',
      descMm: 'အေးဂျင့်ငွေသားထုတ်ယူမှု၊ နိုင်ငံခြားငွေစာရင်းနှင့် ငွေစာရင်းရှင်းတမ်းများ',
      items: [
        {
          id: 'cashout' as Screen,
          nameEn: 'Agent Cash-Out & Cash-In',
          nameMm: 'အေးဂျင့်မှ ငွေသားထုတ်ယူ / ငွေသွင်း',
          descEn: 'Physical cash at verified agents across Sittwe, Mrauk-U, Kyaukpyu & Ramree',
          descMm: 'စစ်တွေ၊ မြောက်ဦး၊ ကျောက်ဖြူ၊ ရမ်းဗြဲမြို့နယ်များရှိ အေးဂျင့်များတွင် ငွေသားထုတ်/သွင်းနိုင်သည်',
          tagEn: 'Physical Cash',
          tagMm: 'ငွေသား',
          icon: Store,
          color: 'from-emerald-500 to-teal-600',
          badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
        },
        {
          id: 'financial' as Screen,
          nameEn: 'USD & Foreign Accounts',
          nameMm: 'USD နှင့် နိုင်ငံခြားငွေစာရင်း',
          descEn: 'Multi-currency balances, USD virtual debit cards, conversions and yields',
          descMm: 'USD ဒေါ်လာစာရင်း၊ ဗာချူရယ်ကတ်များ၊ နိုင်ငံခြားငွေလဲလှယ်မှုနှင့် အတိုးနှုန်းများ',
          tagEn: 'USD Account',
          tagMm: 'နိုင်ငံခြားငွေ',
          icon: CreditCard,
          color: 'from-blue-600 to-indigo-700',
          badgeColor: 'bg-blue-50 text-blue-600 border-blue-200/60',
        },
        {
          id: 'history' as Screen,
          nameEn: 'Statements & Verified Slips',
          nameMm: 'ငွေစာရင်းရှင်းတမ်းနှင့် ပြေစာများ',
          descEn: 'Official digital transaction slips, PDF receipts, and monthly activity ledger',
          descMm: 'တရားဝင် ဒစ်ဂျစ်တယ်ပြေစာများ၊ PDF ထုတ်ယူမှုနှင့် လစဉ် ငွေစာရင်းမှတ်တမ်းများ',
          tagEn: 'Verified Ledger',
          tagMm: 'မှတ်တမ်း',
          icon: HistoryIcon,
          color: 'from-slate-600 to-zinc-700',
          badgeColor: 'bg-zinc-100 text-zinc-700 border-zinc-200/60',
        },
      ],
    },
    {
      id: 'crypto_pos' as const,
      titleEn: 'Digital Assets & Merchant Retail',
      titleMm: 'ဒစ်ဂျစ်တယ်ဒင်္ဂါးနှင့် အရောင်းစနစ်',
      descEn: 'Web3 bridges, cryptocurrency gateway and retail merchant terminal',
      descMm: 'Binance / MEXC ချိတ်ဆက်မှု၊ ဒစ်ဂျစ်တယ်ဒင်္ဂါးနှင့် အရောင်းဆိုင်စနစ်',
      items: [
        {
          id: 'crypto' as Screen,
          nameEn: 'Binance & MEXC Bridge',
          nameMm: 'Binance / MEXC ချိတ်ဆက်မှု',
          descEn: 'Direct 0-fee cryptocurrency deposit & withdrawal bridge (USDT/USDC/BTC)',
          descMm: 'အခမဲ့ ချက်ချင်း အပ်နှံ/ထုတ်ယူနိုင်သော Binance နှင့် MEXC USDT ခရစ်ပတိုတံတား',
          tagEn: '0% Web3 Bridge',
          tagMm: '၀% ဝန်ဆောင်ခ',
          icon: Coins,
          color: 'from-purple-600 to-violet-700',
          badgeColor: 'bg-purple-50 text-purple-600 border-purple-200/60',
        },
        {
          id: 'pos' as Screen,
          nameEn: 'Merchant POS Terminal',
          nameMm: 'အရောင်းစနစ် ကောင်တာ (Merchant POS)',
          descEn: 'Arakan retail merchant point-of-sale terminal for shops and local businesses',
          descMm: 'ရခိုင်ဒေသတွင်း ဆိုင်များနှင့် စီးပွားရေးလုပ်ငန်းများအတွက် အရောင်းကောင်တာစနစ်',
          tagEn: 'Retail POS',
          tagMm: 'အရောင်းဆိုင်',
          icon: MonitorSmartphone,
          color: 'from-teal-600 to-cyan-700',
          badgeColor: 'bg-teal-50 text-teal-600 border-teal-200/60',
        },
      ],
    },
    {
      id: 'security' as const,
      titleEn: 'Security & System Alerts',
      titleMm: 'လုံခြုံရေးနှင့် အသိပေးချက်များ',
      descEn: 'Biometric locks, PIN protection, notifications and official notices',
      descMm: 'လက်ဗွေ/မျက်နှာ လုံခြုံရေး၊ PIN နံပါတ်နှင့် တရားဝင် အသိပေးချက်များ',
      items: [
        {
          id: 'settings' as Screen,
          nameEn: 'Security Center & PIN',
          nameMm: 'လုံခြုံရေး စင်တာနှင့် PIN',
          descEn: 'Manage 2FA authentication, biometric Touch/Face ID, and transaction limits',
          descMm: '2FA နှစ်ဆင့်လုံခြုံရေး၊ မျက်နှာ/လက်ဗွေစနစ်နှင့် ငွေလွှဲကန့်သတ်ချက်များ စီမံပါ',
          tagEn: 'Protected',
          tagMm: 'လုံခြုံရေး',
          icon: ShieldCheck,
          color: 'from-emerald-600 to-green-700',
          badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
        },
        {
          id: 'notifications' as Screen,
          nameEn: 'Notifications & Alerts',
          nameMm: 'အသိပေးချက်များ (Notifications)',
          descEn: 'Real-time transaction alerts, payment confirmations, and system announcements',
          descMm: 'အချိန်နှင့်တပြေးညီ ငွေလွှဲအသိပေးချက်များ၊ ပြေစာများနှင့် အရေးကြီးသတင်းများ',
          tagEn: 'Live Alerts',
          tagMm: 'အသိပေးချက်',
          icon: Bell,
          color: 'from-red-500 to-rose-600',
          badgeColor: 'bg-red-50 text-red-600 border-red-200/60',
        },
      ],
    },
  ]

  const categoryTabs = [
    { id: 'all' as const, labelEn: 'All Services', labelMm: 'အားလုံး', icon: Layers },
    { id: 'payments' as const, labelEn: 'Transfers & Pay', labelMm: 'ငွေလွှဲ/ငွေချေ', icon: ArrowLeftRight },
    { id: 'topup_bills' as const, labelEn: 'Top-Up & Bills', labelMm: 'ဘေလ်/ဖုန်း', icon: SmartphoneCharging },
    { id: 'banking' as const, labelEn: 'Cash & Banking', labelMm: 'ငွေသား/ဘဏ်', icon: Landmark },
    { id: 'crypto_pos' as const, labelEn: 'Digital Assets & POS', labelMm: 'ဒစ်ဂျစ်တယ်/အရောင်း', icon: Coins },
    { id: 'security' as const, labelEn: 'Security', labelMm: 'လုံခြုံရေး', icon: ShieldCheck },
  ]

  // Filter categories and items based on search query and active tab
  const filteredCategories = serviceCategories
    .map((cat) => {
      if (selectedCategory !== 'all' && cat.id !== selectedCategory) {
        return null
      }
      const q = searchQuery.trim().toLowerCase()
      if (!q) {
        return cat
      }
      const matchingItems = cat.items.filter(
        (it) =>
          it.nameEn.toLowerCase().includes(q) ||
          it.nameMm.toLowerCase().includes(q) ||
          it.descEn.toLowerCase().includes(q) ||
          it.descMm.toLowerCase().includes(q) ||
          cat.titleEn.toLowerCase().includes(q) ||
          cat.titleMm.toLowerCase().includes(q)
      )
      if (matchingItems.length === 0) return null
      return { ...cat, items: matchingItems }
    })
    .filter(Boolean) as typeof serviceCategories

  const totalResults = filteredCategories.reduce(
    (acc, cat) => acc + cat.items.length,
    0
  )

  return (
    <div
      className={`flex h-full flex-col overflow-y-auto pb-32 transition-colors ${
        isLight ? 'bg-[#F4F5F8] text-zinc-900' : 'bg-[#090D14] text-white'
      }`}
    >
      {/* ── Top Hero Header with Red Brand Gradient & Search Bar ── */}
      <div className="relative bg-gradient-to-br from-[#D91624] via-[#C0121F] to-[#990D18] text-white pt-5 pb-6 px-4 rounded-b-[32px] shadow-[0_12px_32px_rgba(217,22,36,0.22)] overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-16 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-lg mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wide text-white/95 mb-2 shadow-xs">
            <Sparkles size={12} className="text-amber-300" />
            <span>
              {isAk ? 'ရခိုင်ဘဏ္ဍာရေး ဝန်ဆောင်မှု ကွန်ရက်' : 'PÉTHAR ECOSYSTEM DIRECTORY'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black tracking-tight text-white">
            {isAk ? 'ဘဏ္ဍာရေး ဝန်ဆောင်မှုများ' : 'All Financial Services'}
          </h1>
          <p className="text-xs text-white/85 font-medium mt-1 leading-relaxed">
            {isAk
              ? 'လွယ်ကူလျင်မြန်ပြီး လုံခြုံစိတ်ချရသော ပြည်တွင်းငွေလွှဲ၊ ဘေလ်ဆောင်၊ ငွေသားထုတ်ယူမှုနှင့် ဒစ်ဂျစ်တယ်ဒင်္ဂါးစနစ်'
              : 'Fast, secure local transfers, utility bills, agent cashout, and Web3 crypto gateway.'}
          </p>

          {/* Search Input Box */}
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Search size={17} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAk
                  ? 'ဝန်ဆောင်မှု၊ ဘေလ်၊ ငွေဖြည့်၊ ဒစ်ဂျစ်တယ်ဒင်္ဂါး ရှာဖွေပါ...'
                  : 'Search services, top-up, bills, cashout...'
              }
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white text-zinc-900 placeholder:text-zinc-400 text-xs font-semibold border-0 shadow-[0_8px_24px_rgba(0,0,0,0.12)] focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="p-4 space-y-6 max-w-lg mx-auto w-full">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
          {categoryTabs.map((tab) => {
            const active = selectedCategory === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  active
                    ? 'bg-[#D91624] text-white shadow-[0_4px_14px_rgba(217,22,36,0.32)] border border-transparent'
                    : isLight
                    ? 'bg-white text-zinc-700 border border-zinc-200/80 hover:bg-zinc-50 shadow-2xs'
                    : 'bg-[#151D2A] text-zinc-300 border border-white/10 hover:bg-[#1D2838]'
                }`}
              >
                <Icon size={14} className={active ? 'text-white' : 'text-zinc-400'} />
                <span>{isAk ? tab.labelMm : tab.labelEn}</span>
              </button>
            )
          })}
        </div>

        {/* ── Quick Spotlight Grid (Only when not searching) ── */}
        {!searchQuery && selectedCategory === 'all' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-zinc-500">
                {isAk ? 'လူသုံးအများဆုံး ဝန်ဆောင်မှုများ' : 'Featured Quick Access'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#D91624] border border-red-100">
                {isAk ? '၀% ဝန်ဆောင်ခ' : 'Fast & Free'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {[
                {
                  id: 'topup' as Screen,
                  titleEn: 'Top-Up',
                  titleMm: 'ငွေဖြည့်',
                  subEn: 'Telcos',
                  subMm: 'ဖုန်းဘေလ်',
                  badge: '24/7',
                  icon: SmartphoneCharging,
                  gradient: 'from-violet-500 to-purple-600',
                },
                {
                  id: 'bills' as Screen,
                  titleEn: 'Bills',
                  titleMm: 'ဘေလ်ဆောင်',
                  subEn: 'Utility',
                  subMm: 'မီး/ရေ/လိုင်း',
                  badge: '0% Fee',
                  icon: Receipt,
                  gradient: 'from-amber-500 to-orange-600',
                },
                {
                  id: 'cashout' as Screen,
                  titleEn: 'Cash Out',
                  titleMm: 'ငွေထုတ်ယူ',
                  subEn: 'Agents',
                  subMm: 'စစ်တွေ/မြောက်ဦး',
                  badge: 'Cash',
                  icon: Store,
                  gradient: 'from-emerald-500 to-teal-600',
                },
                {
                  id: 'crypto' as Screen,
                  titleEn: 'Crypto',
                  titleMm: 'ဒစ်ဂျစ်တယ်',
                  subEn: 'MEXC/Binance',
                  subMm: 'USDT တံတား',
                  badge: 'Web3',
                  icon: Coins,
                  gradient: 'from-purple-600 to-indigo-600',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => go(item.id)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer relative group active:scale-95 ${
                    isLight
                      ? 'bg-white border border-zinc-200/70 shadow-2xs hover:shadow-md hover:border-[#D91624]/30'
                      : 'bg-[#121926] border border-white/10 hover:border-[#D91624]/40'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-xs mb-1.5 group-hover:scale-105 transition-transform`}
                  >
                    <item.icon size={20} />
                  </div>
                  <div
                    className={`text-[11px] font-bold truncate max-w-full leading-tight ${
                      isLight ? 'text-zinc-900' : 'text-white'
                    }`}
                  >
                    {isAk ? item.titleMm : item.titleEn}
                  </div>
                  <div className="text-[9px] text-zinc-400 font-medium truncate max-w-full">
                    {isAk ? item.subMm : item.subEn}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Search Match Header if Searching ── */}
        {searchQuery && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-zinc-600">
              {isAk
                ? `"${searchQuery}" အတွက် ဝန်ဆောင်မှု ${totalResults} ခု တွေ့ရှိပါသည်`
                : `Found ${totalResults} services matching "${searchQuery}"`}
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-[#D91624] hover:underline cursor-pointer"
            >
              {isAk ? 'ရှာဖွေမှု ဖျက်မည်' : 'Clear'}
            </button>
          </div>
        )}

        {/* ── Service Categories & Cards ── */}
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div key={category.id} className="space-y-2.5">
              {/* Category Header */}
              <div className="flex items-center justify-between px-1 pt-1">
                <div>
                  <h2
                    className={`text-xs font-black uppercase tracking-wider font-mono ${
                      isLight ? 'text-zinc-800' : 'text-zinc-200'
                    }`}
                  >
                    {isAk ? category.titleMm : category.titleEn}
                  </h2>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {isAk ? category.descMm : category.descEn}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200/70 text-zinc-600">
                  {category.items.length}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {category.items.map((item) => {
                  const Icon = item.icon as React.ComponentType<{ size?: number; className?: string }>
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => go(item.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group active:scale-[0.99] cursor-pointer ${
                        isLight
                          ? 'bg-white border-zinc-200/80 shadow-2xs hover:shadow-md hover:border-[#D91624]/40 hover:bg-white'
                          : 'bg-[#121926] border-white/10 hover:border-[#D91624]/40 hover:bg-[#162030]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                        {/* Squircle Gradient Icon Badge */}
                        <div
                          className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200`}
                        >
                          <Icon size={22} />
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span
                              className={`text-xs font-bold leading-tight ${
                                isLight ? 'text-zinc-900' : 'text-white'
                              }`}
                            >
                              {isAk ? item.nameMm : item.nameEn}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                            >
                              {isAk ? item.tagMm : item.tagEn}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 line-clamp-1 leading-snug">
                            {isAk ? item.descMm : item.descEn}
                          </div>
                        </div>
                      </div>

                      {/* Right Action Chevron */}
                      <div className="w-8 h-8 rounded-full bg-zinc-100/80 flex items-center justify-center text-zinc-400 group-hover:text-[#D91624] group-hover:bg-red-50 group-hover:translate-x-0.5 transition-all shrink-0">
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          /* Empty Search Results State */
          <div
            className={`p-8 rounded-3xl border text-center space-y-3 ${
              isLight
                ? 'bg-white border-zinc-200/80 shadow-xs'
                : 'bg-[#121926] border-white/10'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-[#D91624] mx-auto flex items-center justify-center">
              <Search size={22} />
            </div>
            <div>
              <h3
                className={`text-sm font-bold ${
                  isLight ? 'text-zinc-900' : 'text-white'
                }`}
              >
                {isAk ? 'ရှာဖွေတွေ့ရှိမှု မရှိပါ' : 'No services found'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                {isAk
                  ? `"${searchQuery}" နှင့် ကိုက်ညီသော ဘဏ္ဍာရေးဝန်ဆောင်မှု မရှိပါ။`
                  : `We couldn't find any financial services matching "${searchQuery}".`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="px-4 py-2 rounded-xl bg-[#D91624] text-white text-xs font-bold hover:brightness-105 active:scale-95 transition cursor-pointer"
            >
              {isAk ? 'ဝန်ဆောင်မှု အားလုံး ပြန်ကြည့်ရန်' : 'View All Services'}
            </button>
          </div>
        )}

        {/* ── Arakan Sovereign Financial Security Guarantee Card ── */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white border border-zinc-800 shadow-md space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldCheck size={16} />
            </div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-300 font-mono">
              {isAk ? 'ရခိုင်ဘဏ္ဍာရေး အာမခံချက်' : 'Arakan Sovereign Protocol'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {isAk
              ? 'ငွေလွှဲ၊ ငွေသွင်း၊ ငွေထုတ်နှင့် ကုန်သွယ်မှု အားလုံးကို 256-bit စစ်တပ်အဆင့် လုံခြုံရေးဖြင့် ကာကွယ်ထားပြီး မြို့နယ်အလိုက် အေးဂျင့်များဖြင့် ချက်ချင်းငွေသား အာမခံပါသည်။'
              : 'All operations are protected by 256-bit cryptographic security and real-time sovereign ledger settlement with physical cash guarantees.'}
          </p>
          <div className="flex items-center gap-3 pt-1 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isAk ? 'စနစ် ပုံမှန်လည်ပတ်နေသည်' : 'All systems operational'}
            </span>
            <span>•</span>
            <span>{isAk ? '၂၄ နာရီ အသင့်' : '24/7 Availability'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SETTINGS SCREEN (Matched to user reference design) ──────────────────
export function SettingsScreen({
  go,
  lang,
  setLang,
  theme = 'light',
  profile,
  setProfile,
}: {
  go: (s: Screen) => void
  lang: Language
  setLang?: (l: Language) => void
  theme?: 'dark' | 'light'
  setTheme?: (t: 'dark' | 'light') => void
  profile?: UserProfile
  setProfile?: (p: UserProfile) => void
}) {
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile || initialUserProfile)
  const currentProfile = profile || localProfile

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editFirstName, setEditFirstName] = useState(currentProfile.firstName || '')
  const [editLastName, setEditLastName] = useState(currentProfile.lastName || '')
  const [editNickname, setEditNickname] = useState(currentProfile.nickname || '')
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentProfile.avatarUrl || '')
  const [editEmail, setEditEmail] = useState(currentProfile.email)
  const [editPhone, setEditPhone] = useState(currentProfile.phone)
  const [editAddress, setEditAddress] = useState(currentProfile.address || currentProfile.location)
  const [editPin, setEditPin] = useState('')
  const [currentPinInput, setCurrentPinInput] = useState('')
  const [otpStage, setOtpStage] = useState<'idle' | 'email_otp' | 'phone_otp' | 'name_otp' | 'pin_otp'>('idle')
  const [otpInput, setOtpInput] = useState('')
  const [simulatedOtp, setSimulatedOtp] = useState('123456')
  const [saveToast, setSaveToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const [autoSaveSlip, setAutoSaveSlip] = useState<boolean>(() => isAutoSaveReceiptEnabled())
  const [twoFactorAuth, setTwoFactorAuth] = useState(true)

  const t = translations[lang]

  const syncProfileState = () => {
    setEditFirstName(currentProfile.firstName || '')
    setEditLastName(currentProfile.lastName || '')
    setEditNickname(currentProfile.nickname || '')
    setEditAvatarUrl(currentProfile.avatarUrl || '')
    setEditEmail(currentProfile.email)
    setEditPhone(currentProfile.phone)
    setEditAddress(currentProfile.address || currentProfile.location)
    setEditPin('')
    setCurrentPinInput('')
    setOtpStage('idle')
    setOtpInput('')
  }

  const handleStartSave = (e: React.FormEvent) => {
    e.preventDefault()
    // 1. If email changed -> requires verified OTP
    if (editEmail.trim() !== currentProfile.email) {
      setSimulatedOtp('654321')
      setOtpStage('email_otp')
      return
    }
    // 2. If phone changed -> requires email verified OTP
    if (editPhone.trim() !== currentProfile.phone) {
      setSimulatedOtp('987654')
      setOtpStage('phone_otp')
      return
    }
    // 3. If first or last name changed -> requires review & email OTP
    if (
      editFirstName.trim() !== currentProfile.firstName ||
      editLastName.trim() !== currentProfile.lastName
    ) {
      setSimulatedOtp('123456')
      setOtpStage('name_otp')
      return
    }
    // 4. If pin changed
    if (editPin.trim().length === 6) {
      if (!currentPinInput && currentProfile.pin) {
        setSimulatedOtp('456789')
        setOtpStage('pin_otp')
        return
      }
    }
    commitProfileUpdate()
  }

  const commitProfileUpdate = (extraMsg?: string) => {
    const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim() || currentProfile.name
    const updated: UserProfile = {
      ...currentProfile,
      name: fullName,
      firstName: editFirstName.trim() || currentProfile.firstName,
      lastName: editLastName.trim() || currentProfile.lastName,
      nickname: editNickname.trim() || currentProfile.nickname,
      email: editEmail.trim() || currentProfile.email,
      phone: editPhone.trim() || currentProfile.phone,
      address: editAddress.trim() || currentProfile.address,
      location: editAddress.trim() || currentProfile.location,
      avatarUrl: editAvatarUrl.trim() || currentProfile.avatarUrl,
      pin: editPin.trim().length === 6 ? editPin.trim() : currentProfile.pin,
      // Immutable fields are strictly preserved
      username: currentProfile.username,
      uid: currentProfile.uid || '202610190001',
      walletAddress: currentProfile.uid || '202610190001',
      usdAccountWalletAddress: currentProfile.usdAccountWalletAddress,
      nationalIdNo: currentProfile.nationalIdNo,
      dob: currentProfile.dob,
      akdWalletBalance: currentProfile.akdWalletBalance,
      usdAccountBalance: currentProfile.usdAccountBalance,
      totalBalance: currentProfile.akdWalletBalance + currentProfile.usdAccountBalance,
    }

    if (setProfile) {
      setProfile(updated)
    }
    setLocalProfile(updated)
    setEditModalOpen(false)
    setOtpStage('idle')
    setToastMessage(extraMsg || t.profileUpdated || 'Profile updated successfully')
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 3500)
  }

  const handleVerifyOtp = () => {
    if (otpInput.trim().length !== 6) {
      alert('Please enter a valid 6-digit OTP code')
      return
    }
    if (otpStage === 'name_otp') {
      commitProfileUpdate('Name change submitted for administrative review & verified via OTP (PENDING_REVIEW)')
    } else if (otpStage === 'email_otp') {
      commitProfileUpdate(`Email successfully verified & updated to ${editEmail}`)
    } else if (otpStage === 'phone_otp') {
      commitProfileUpdate(`Phone number verified via Email OTP & updated to ${editPhone}`)
    } else if (otpStage === 'pin_otp') {
      commitProfileUpdate('Security PIN successfully reset & updated')
    } else {
      commitProfileUpdate()
    }
  }

  const isLight = theme === 'light'

  return (
    <div className={`flex h-full flex-col overflow-y-auto ${isLight ? 'bg-[#F4F5F8] text-gray-900' : 'bg-[#090D14] text-white'}`}>
      {/* ── TOP HERO PROFILE BANNER (Vibrant Gradient from Reference) ── */}
      <div
        className="px-5 pt-8 pb-6 relative overflow-hidden shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #2D1B69 0%, #D83A56 50%, #FF6B35 100%)',
        }}
      >
        <div className="flex items-center gap-4">
          {/* Circular avatar — shows profile photo when available */}
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl shrink-0 border-2 border-white/30 overflow-hidden">
            {currentProfile.avatarUrl ? (
              <img src={currentProfile.avatarUrl} alt={currentProfile.name} className="w-full h-full object-cover" />
            ) : (
              <User size={34} className="text-[#32195F]" />
            )}
          </div>

          {/* User Name, Email, and Badge */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate tracking-wide">
              {currentProfile.name}
            </h1>
            <div className="text-xs text-white/90 truncate font-mono mt-0.5">
              {currentProfile.email}
            </div>
            <div className="mt-1.5 inline-block px-3 py-0.5 rounded-full border border-white/50 text-[10px] font-semibold text-white tracking-wider backdrop-blur-sm bg-white/15">
              {currentProfile.accountTier || 'Normal'}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification on Successful Profile Update */}
      {saveToast && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage || t.profileUpdated}</span>
        </div>
      )}

      <div className="p-4 space-y-5">
        {/* ── SECTION 1: ACCOUNT SETTING ──────────────────────────────── */}
        <div>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 px-1 ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>
            {t.accountSetting}
          </h2>

          <div className={`rounded-3xl border overflow-hidden shadow-sm divide-y ${isLight
              ? 'bg-white border-gray-100 divide-gray-100'
              : 'bg-[#131B26] border-white/5 divide-white/5'
            }`}>
            {/* 1. Profile Information -> opens Edit Personal Data modal */}
            <button
              onClick={() => {
                syncProfileState()
                setEditModalOpen(true)
              }}
              className={`w-full p-4 flex items-center justify-between text-left transition ${isLight ? 'hover:bg-gray-50 active:bg-gray-100' : 'hover:bg-white/5 active:bg-white/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {t.profileInfo}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {currentProfile.petharId} · {currentProfile.phone}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>

            {/* 2. Language -> Direct Language Change Buttons in App */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Globe size={18} />
                </div>
                <div className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {t.languageSetting}
                </div>
              </div>

              {/* Direct in-app Language Selection Buttons */}
              <div className={`flex items-center p-1 rounded-xl border gap-1 ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-black/40 border-white/10'
                }`}>
                <button
                  type="button"
                  onClick={() => setLang && setLang('ak')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none ${lang === 'ak'
                      ? 'bg-red-700 text-white shadow-sm'
                      : isLight ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  title="အာရက္ခ (Arakan)"
                  aria-label="အာရက္ခ"
                >
                  <FlagArakan size={16} />
                  <span>အာရက္ခ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLang && setLang('en')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none ${lang === 'en'
                      ? 'bg-blue-800 text-white shadow-sm'
                      : isLight ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  title="English"
                  aria-label="English"
                >
                  <FlagInternational size={16} />
                  <span>English</span>
                </button>
              </div>
            </div>

            {/* 3. Auto Save Receipt -> custom orange toggle matching screenshot */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Download size={18} />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {t.autoSaveSlipSetting}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {t.autoSaveSlipDesc}
                  </div>
                </div>
              </div>

              {/* Orange toggle switch */}
              <button
                onClick={() => {
                  const next = !autoSaveSlip
                  setAutoSaveSlip(next)
                  setAutoSaveReceiptEnabled(next)
                }}
                className={`w-12 h-6 rounded-full transition-colors duration-200 p-0.5 flex items-center shrink-0 ${autoSaveSlip ? 'bg-[#FF5722] justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
                  }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* 4. Theme Display (Light Mode Only) */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Sun size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    {t.themeSetting}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {t.lightMode}
                  </div>
                </div>
              </div>

              <div className="flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-800 border border-amber-500/30">
                <span>Light Mode</span>
              </div>
            </div>

            {/* 5. Billing Management */}
            <button
              onClick={() => go('account')}
              className={`w-full p-4 flex items-center justify-between text-left transition ${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <CreditCard size={18} />
                </div>
                <div className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {t.billingManagement}
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* ── SECTION 2: SECURITY ─────────────────────────────────────── */}
        <div>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 px-1 ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>
            {t.securitySetting}
          </h2>

          <div className={`rounded-3xl border overflow-hidden shadow-sm divide-y ${isLight
              ? 'bg-white border-gray-100 divide-gray-100'
              : 'bg-[#131B26] border-white/5 divide-white/5'
            }`}>
            {/* 1. Change PIN */}
            <button
              onClick={() => alert(lang === 'ak' ? '၆ လုံး လျှို့ဝှက်ကုဒ် (PIN) အသစ် ပြောင်းလဲရန် ညွှန်ကြားချက် ပို့ပြီးပါပြီ' : 'Instructions sent to reset your 6-digit transaction PIN')}
              className={`w-full p-4 flex items-center justify-between text-left transition ${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <KeyRound size={18} />
                </div>
                <div className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {t.changePin}
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>

            {/* 3. Two-Factor Authentication with red ON badge */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {t.twoFactorAuth}
                </div>
              </div>

              <button
                onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition tracking-wider ${twoFactorAuth
                    ? 'text-red-500 bg-red-500/10 border border-red-500/30'
                    : 'text-gray-400 bg-gray-500/10 border border-gray-500/30'
                  }`}
              >
                {twoFactorAuth ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── EDIT PERSONAL DATA MODAL (WITH FULL GOVERNANCE & OTP) ────── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
          <div className={`w-full max-w-md max-h-[90vh] flex flex-col rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl border ${isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#101724] border-white/10 text-white'
            }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-orange-500" />
                <h3 className="font-bold text-sm">
                  {otpStage !== 'idle' ? 'Security Verification' : 'User & Profile Settings'}
                </h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* OTP VERIFICATION STEP */}
            {otpStage !== 'idle' ? (
              <div className="py-4 space-y-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-medium">
                  {otpStage === 'email_otp' && (
                    <p>
                      <strong>Email Update:</strong> A verification code has been sent to{' '}
                      <span className="font-mono underline">{editEmail}</span>.
                    </p>
                  )}
                  {otpStage === 'phone_otp' && (
                    <p>
                      <strong>Phone Update:</strong> For security, a 6-digit OTP code has been sent to your registered email{' '}
                      <span className="font-mono underline">{currentProfile.email}</span>.
                    </p>
                  )}
                  {otpStage === 'name_otp' && (
                    <p>
                      <strong>Legal Name Review:</strong> Updating first/last name requires administrative review & OTP verification. Code sent to{' '}
                      <span className="font-mono underline">{currentProfile.email}</span>.
                    </p>
                  )}
                  {otpStage === 'pin_otp' && (
                    <p>
                      <strong>Forgot PIN Verification:</strong> A PIN reset OTP code has been sent to{' '}
                      <span className="font-mono underline">{currentProfile.email}</span>.
                    </p>
                  )}
                  <p className="mt-1 text-[11px] font-mono font-bold text-amber-400">
                    [Demo Simulator OTP: {simulatedOtp}]
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Enter 6-digit OTP Code:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className={`w-full text-center tracking-widest text-lg font-mono font-bold px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 ${
                      isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpStage('idle')}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white font-bold text-xs shadow-md transition"
                  >
                    Verify & Confirm
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleStartSave} className="flex-1 overflow-y-auto space-y-4 py-3 text-xs pr-1">
                {/* 1. Immutable Core Identifiers */}
                <div className="p-3 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                      <Lock size={12} /> Immutable Identifiers
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold uppercase">
                      Cant Change
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <div className="text-gray-400 text-[10px]">Username:</div>
                      <div className="font-bold truncate">{currentProfile.username || '@user'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-[10px]">UID / Wallet Address:</div>
                      <div className="font-mono font-bold truncate">{currentProfile.uid}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-[10px]">National ID No:</div>
                      <div className="font-bold truncate">{currentProfile.nationalIdNo || '---'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-[10px]">Date of Birth (DOB):</div>
                      <div className="font-bold truncate">{currentProfile.dob || '---'}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-[10px]">USD Account Wallet Address:</div>
                    <div className="font-mono text-[10px] truncate text-gray-500">
                      {currentProfile.usdAccountWalletAddress}
                    </div>
                  </div>
                </div>

                {/* 2. Account Balances & Total Balance */}
                <div className="p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                      <Coins size={12} /> Account Balances
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                      Total Balance Change
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <div className="text-gray-400 text-[10px]">AKD Wallet Balance:</div>
                      <div className="font-bold text-gray-400">
                        {currentProfile.akdWalletBalance.toFixed(2)} AKD
                      </div>
                      <div className="text-[9px] text-gray-500">Cant change directly</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-[10px]">USD Account Balance:</div>
                      <div className="font-bold text-gray-400">
                        ${currentProfile.usdAccountBalance.toFixed(2)} USD
                      </div>
                      <div className="text-[9px] text-gray-500">Cant change directly</div>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-emerald-500/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Total Balance (Dynamic Sum):</span>
                    <span className="text-sm font-extrabold text-emerald-400">
                      ${(currentProfile.akdWalletBalance + currentProfile.usdAccountBalance).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* 3. Verified OTP Required Fields */}
                <div className="space-y-3 pt-1">
                  <div className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                    <ShieldCheck size={13} className="text-blue-500" />
                    Security & Verified Credentials
                  </div>

                  {/* Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-gray-400">User Email</label>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold">
                        Needs Verified OTP
                      </span>
                    </div>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-semibold ${
                        isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                      }`}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-gray-400">Phone Number (ph no)</label>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-bold">
                        Needs Email Verified OTP
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-sky-500 font-semibold font-mono ${
                        isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                      }`}
                      required
                    />
                  </div>

                  {/* Legal Name */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-gray-400">First Name</label>
                      </div>
                      <input
                        type="text"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 font-semibold ${
                          isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-gray-400">Last Name</label>
                      </div>
                      <input
                        type="text"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 font-semibold ${
                          isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-amber-500 font-medium">
                    * First & last name change requires review and email OTP
                  </div>

                  {/* PIN */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-gray-400">Security PIN</label>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold">
                        Needs current PIN or Email OTP
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="Current PIN"
                        value={currentPinInput}
                        onChange={(e) => setCurrentPinInput(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-purple-500 font-mono text-center ${
                          isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                        }`}
                      />
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="New PIN (6-digit)"
                        value={editPin}
                        onChange={(e) => setEditPin(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-purple-500 font-mono text-center ${
                          isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Freely Editable Profile Fields */}
                <div className="space-y-3 pt-2">
                  <div className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                    <User size={13} className="text-emerald-500" />
                    Freely Editable Profile Fields
                  </div>

                  {/* Profile Pic URL */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-gray-400">User Profile Pic URL</label>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                        Can Change
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                        isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* Nickname */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-gray-400">Nickname</label>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                        Can Change
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 font-semibold ${
                        isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-gray-400">Address</label>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                        Can Change
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                        isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-3 flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition"
                  >
                    {lang === 'ak' ? 'မလုပ်တော့ပါ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white font-bold text-xs shadow-md transition"
                  >
                    {t.saveChanges || 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── SEND MONEY SCREEN ───────────────────────────────────────────────────
export function Send({
  go,
  lang,
  theme = 'light',
  onSent,
}: {
  go: (s: Screen) => void
  lang: Language
  theme?: ThemeMode
  onSent?: (amt: number) => void
}) {
  const t = translations[lang]
  const [step, setStep] = useState<'who' | 'amount' | 'pin' | 'done'>('who')
  const [contact, setContact] = useState<(typeof contacts)[0] | null>(null)
  const [amount, setAmount] = useState('')
  const [pin, setPin] = useState('')
  const [customRecipient, setCustomRecipient] = useState('')
  const [slipRefId, setSlipRefId] = useState('')

  const handleSelectContact = (c: (typeof contacts)[0]) => {
    setContact(c)
    setStep('amount')
  }

  const handleCustomContinue = () => {
    if (!customRecipient) return
    setContact({
      name: customRecipient,
      mm: customRecipient,
      id: customRecipient.startsWith('ARAK') ? customRecipient : 'ARAK-8899',
      location: 'Arakan Network',
      phone: customRecipient,
      initials: 'AK',
    })
    setStep('amount')
  }

  const handleAuthorizePin = (digit: string) => {
    if (digit === '⌫') {
      setPin(pin.slice(0, -1))
    } else if (pin.length < 6) {
      const nextPin = pin + digit
      setPin(nextPin)
      if (nextPin.length === 6) {
        setTimeout(() => {
          setSlipRefId(`ARAK-TRANSFER-${Date.now().toString().slice(-6)}`)
          setStep('done')
          if (onSent) {
            onSent(parseFloat(amount || '0'))
          }
        }, 600)
      }
    }
  }

  return (
    <div className={`flex h-full flex-col ${th.root(theme)}`}>
      <ScreenHeader
        title={t.sendTitle}
        subtitle={lang === 'ak' ? 'အာရက္ခဒေါ်လာ လွှဲပို့ခြင်း' : 'Zero-fee Arakan Transfer'}
        theme={theme}
      />

      {/* STEP 1: Select Recipient */}
      {step === 'who' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="p-3 rounded-2xl bg-[#131B26] border border-[#283852]">
            <input
              type="text"
              placeholder={t.sendRecipientPlaceholder}
              value={customRecipient}
              onChange={(e) => setCustomRecipient(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            {customRecipient && (
              <button
                onClick={handleCustomContinue}
                className="mt-2 w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
              >
                {t.sendContinue}
              </button>
            )}
          </div>

          <div>
            <div className="text-xs font-bold text-amber-400 mb-2">{t.sendRecentContacts}</div>
            <div className="space-y-1.5">
              {contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectContact(c)}
                  className="w-full p-3 rounded-2xl bg-[#131B26] hover:bg-[#1A2536] border border-white/5 hover:border-amber-500/40 text-left transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center font-bold text-white text-xs">
                      {c.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {lang === 'ak' ? c.mm : c.name}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {c.id} • {c.location}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Keypad Amount */}
      {step === 'amount' && contact && (
        <div className="flex flex-1 flex-col justify-between">
          <div className="p-4">
            <div className="p-3 rounded-2xl bg-[#131B26] border border-[#283852] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                {contact.initials}
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white">
                  {lang === 'ak' ? contact.mm : contact.name}
                </div>
                <div className="text-[10px] text-gray-400">{contact.id}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                VERIFIED
              </span>
            </div>
          </div>

          <Keypad value={amount} onChange={setAmount} symbol="₳" />

          <div className="flex gap-2 px-6 pb-2">
            {[25, 50, 100, 500].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-amber-300 border border-white/5 transition"
              >
                ₳ {v}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-400 px-2">
              <span>{t.sendFeeLabel}:</span>
              <span className="text-emerald-400 font-bold">{t.sendFeeFree}</span>
            </div>

            <button
              disabled={!amount || parseFloat(amount) <= 0}
              onClick={() => setStep('pin')}
              className="w-full py-3.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg hover:brightness-110 active:scale-[0.99] transition disabled:opacity-40"
            >
              {t.sendContinue} (₳ {amount || '0'})
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: 6-Digit PIN Authorization */}
      {step === 'pin' && (
        <div className="flex flex-1 flex-col items-center justify-between p-4">
          <div className="text-center pt-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <Fingerprint size={24} />
            </div>
            <h3 className="text-sm font-bold text-white">{t.sendEnterPin}</h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Transfer ₳ {amount} to {contact?.name}
            </p>
            <div className="mt-4">
              <OtpDots len={pin.length} />
            </div>
          </div>

          <div className="w-full max-w-[280px] grid grid-cols-3 gap-2 pb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
              <button
                key={i}
                disabled={!k}
                onClick={() => handleAuthorizePin(k)}
                className="h-12 rounded-xl text-lg font-bold text-white transition active:scale-95 bg-white/[0.08] hover:bg-white/[0.12] disabled:opacity-0"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Success Transaction e-Slip (Auto-Saved to Photos) */}
      {step === 'done' && contact && (
        <div className="flex-1 overflow-y-auto">
          <TransactionSlip
            lang={lang}
            refId={slipRefId || 'ARAK-TRANSFER-984210'}
            amount={parseFloat(amount) || 0}
            recipientName={contact.name}
            recipientId={contact.id}
            senderName="User"
            senderId={initialUserProfile.uid || '202610190001'}
            fee={0.0}
            autoSaved={isAutoSaveReceiptEnabled()}
            onClose={() => go('home')}
          />
        </div>
      )}
    </div>
  )
}

// ── RECEIVE SCREEN (Matched to user's hand-drawn Receive layout) ────────
export function Receive({
  go,
  lang,
  profile,
  embedded = false,
  theme = 'light',
}: {
  go?: (s: Screen) => void
  lang: Language
  profile?: UserProfile
  embedded?: boolean
  theme?: ThemeMode
}) {
  const [copiedUid, setCopiedUid] = useState(false)
  const [savedQr, setSavedQr] = useState(false)
  const [sharedQr, setSharedQr] = useState(false)
  const isAk = lang === 'ak'
  const currentProfile = profile || initialUserProfile
  const usernameHandle = `@${currentProfile.name.toLowerCase().replace(/\s+/g, '') || 'username'}`
  const uidNumber = currentProfile.uid || '202610190001'

  const handleCopyUid = () => {
    navigator.clipboard?.writeText(uidNumber)
    setCopiedUid(true)
    setTimeout(() => setCopiedUid(false), 2000)
  }

  const handleSaveQr = () => {
    localStorage.setItem('pethar-receive-qr', `pethar://pay?uid=${uidNumber}&user=${usernameHandle}&curr=AKD`)
    setSavedQr(true)
    setTimeout(() => setSavedQr(false), 2000)
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Péthar Receive QR',
      text: `${currentProfile.name} (${usernameHandle}) · Wallet Address: ${uidNumber}`,
      url: `pethar://pay?uid=${uidNumber}&user=${usernameHandle}&curr=AKD`,
    }
    try {
      if (navigator.share) await navigator.share(shareData)
      else await navigator.clipboard?.writeText(shareData.text)
    } catch {
      // User cancelled share sheet
    }
    setSharedQr(true)
    setTimeout(() => setSharedQr(false), 2000)
  }

  return (
    <div className={`flex h-full flex-col ${th.root(theme)} text-zinc-900`}>
      {/* Top Header: < | Receive (centered) | (Share) */}
      {!embedded && (
        <div className="bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-200/80 sticky top-0 z-20 relative">
          <button
            type="button"
            onClick={() => go && go('home')}
            aria-label="Back"
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-800 hover:bg-zinc-100 transition cursor-pointer z-10"
          >
            <ChevronRight size={22} className="rotate-180" />
          </button>

          <h1 className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-zinc-900 tracking-tight pointer-events-none">
            {isAk ? 'ငွေလက်ခံရန်' : 'Receive'}
          </h1>

          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-full border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 inline-flex items-center gap-1.5 shadow-2xs active:scale-95 transition cursor-pointer z-10"
          >
            <Share2 size={13} className="text-[#D91624]" />
            <span>{sharedQr ? (isAk ? 'မျှဝေပြီး' : 'Shared') : isAk ? 'မျှဝေရန်' : 'Share'}</span>
          </button>
        </div>
      )}

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-2.5 pb-6 text-center space-y-2.5 overflow-y-auto">
        {/* 1. App Logo + App Name (No container under logo) */}
        <div className="flex flex-col items-center space-y-0.5">
          <img
            src="/pethar-logo-red-white.svg"
            alt="Péthar Logo"
            className="w-10 h-10 object-contain"
          />
          <div className="text-xs font-extrabold text-zinc-900 tracking-tight">
            Péthar
          </div>
        </div>

        {/* 2. User Name & @username */}
        <div className="space-y-0.5">
          <div className="text-base font-extrabold text-zinc-900 leading-tight">
            {currentProfile.name}
          </div>
          <div className="text-[11px] font-semibold text-zinc-500 font-mono">
            {usernameHandle}
          </div>
        </div>

        {/* 3. QR Box */}
        <div className="p-3.5 bg-white rounded-2xl border-2 border-zinc-200/90 shadow-[0_8px_24px_rgba(15,23,42,0.06)] flex items-center justify-center">
          <FakeQR size={164} value={`pethar://pay?uid=${uidNumber}&user=${usernameHandle}&curr=AKD`} />
        </div>

        {/* 4. Wallet Address */}
        <div>
          <div className="text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider">
            {isAk ? 'ပိုက်ဆံအိတ် လိပ်စာ' : 'Wallet Address'}
          </div>
          <div className="text-base font-extrabold font-mono tracking-widest text-zinc-900 mt-0.5 tabular-nums">
            {uidNumber}
          </div>
        </div>

        {/* 5. Bottom Buttons: [ Copy ] & [ Save ] */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] pt-1">
          <button
            type="button"
            onClick={handleCopyUid}
            className="py-2 px-4 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            {copiedUid ? (
              <Check size={15} className="text-emerald-600" />
            ) : (
              <Copy size={15} className="text-zinc-700" />
            )}
            <span>{copiedUid ? (isAk ? 'ကူးယူပြီး' : 'Copied') : isAk ? 'ကူးယူရန်' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveQr}
            className="py-2 px-4 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            {savedQr ? (
              <Check size={15} className="text-emerald-600" />
            ) : (
              <Download size={15} className="text-zinc-700" />
            )}
            <span>{savedQr ? (isAk ? 'သိမ်းပြီး' : 'Saved') : isAk ? 'သိမ်းမည်' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SCAN / MYQR SCREEN ──────────────────────────────────────────────────
export function Scan({
  go,
  lang,
  profile,
  theme = 'light',
}: {
  go?: (s: Screen) => void
  lang: Language
  profile?: UserProfile
  theme?: ThemeMode
}) {
  const [tab, setTab] = useState<'scan' | 'myqr'>('scan')
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [photoSelected, setPhotoSelected] = useState(false)
  const [sharedQr, setSharedQr] = useState(false)
  const isAk = lang === 'ak'
  const currentProfile = profile || initialUserProfile
  const usernameHandle = `@${currentProfile.name.toLowerCase().replace(/\s+/g, '') || 'username'}`
  const uidNumber = currentProfile.uid || '202610190001'

  const handleShareQr = async () => {
    const shareData = {
      title: 'Péthar Receive QR',
      text: `${currentProfile.name} (${usernameHandle}) · Wallet Address: ${uidNumber}`,
      url: `pethar://pay?uid=${uidNumber}&user=${usernameHandle}&curr=AKD`,
    }
    try {
      if (navigator.share) await navigator.share(shareData)
      else await navigator.clipboard?.writeText(shareData.text)
    } catch {
      // Share cancelled
    }
    setSharedQr(true)
    setTimeout(() => setSharedQr(false), 2000)
  }

  return (
    <div className={`flex h-full flex-col relative ${tab === 'scan' ? 'bg-zinc-700 text-white' : th.root(theme)}`}>
      {/* Top Header: < | Scan/MyQR | Torch or Share */}
      <div
        className={`px-4 pt-4 pb-3 flex items-center justify-between border-b ${tab === 'scan'
            ? 'bg-zinc-800/90 border-white/10 text-white'
            : 'bg-white border-zinc-200/80 text-zinc-900'
          }`}
      >
        <button
          type="button"
          onClick={() => go && go('home')}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
        >
          <ChevronRight size={22} className="rotate-180" />
        </button>

        <h1 className="text-base font-extrabold tracking-tight">Scan/MyQR</h1>

        {tab === 'scan' ? (
          <button
            type="button"
            onClick={() => setFlashEnabled(!flashEnabled)}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition cursor-pointer ${flashEnabled
                ? 'bg-[#D91624] border-white text-white'
                : 'bg-black/30 border-white/40 text-white'
              }`}
          >
            <Flashlight size={17} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleShareQr}
            className="px-3.5 py-1.5 rounded-full border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Share2 size={13} className="text-[#D91624]" />
            <span>{sharedQr ? 'Shared' : 'Share'}</span>
          </button>
        )}
      </div>

      {/* Main Content: Scan Viewfinder OR Receive (MyQR) */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {tab === 'scan' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-6 relative">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {flashEnabled && <div className="absolute inset-0 rounded-3xl bg-white/15" />}
              {[
                'top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl',
                'top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl',
                'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl',
                'bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl',
              ].map((pos) => (
                <div key={pos} className={`absolute w-10 h-10 border-white ${pos}`} />
              ))}
              <div
                className="w-full h-0.5 bg-white animate-pulse"
                style={{ boxShadow: '0 0 14px rgba(217,22,36,0.9)' }}
              />
            </div>

            <p className="text-xs text-white/90 font-medium">
              {isAk
                ? 'QR ကုဒ် သို့မဟုတ် ဘားကုဒ်ကို ဘောင်အတွင်း ထားရှိပါ'
                : 'Place the QR code or barcode within the frame.'}
            </p>

            <label
              htmlFor="qr-photo-upload"
              className="px-5 py-2.5 rounded-full bg-black/55 border border-white/25 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer hover:bg-black/70 transition"
            >
              <ImagePlus size={16} />
              <span>
                {photoSelected
                  ? isAk
                    ? 'QR ပုံ ရွေးချယ်ပြီးပါပြီ'
                    : 'QR Image Selected'
                  : isAk
                    ? 'ပုံပြခန်းမှ ရွေးချယ်ရန်'
                    : 'Select from Gallery'}
              </span>
            </label>
            <input
              id="qr-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setPhotoSelected(Boolean(event.target.files?.length))}
            />
          </div>
        ) : (
          <Receive go={go} lang={lang} profile={currentProfile} embedded theme={theme} />
        )}
      </div>

      {/* Bottom Toggle Bar: Scan | MyQR */}
      <div className="h-20 bg-white border-t border-zinc-200 grid grid-cols-2 shrink-0">
        <button
          type="button"
          onClick={() => setTab('scan')}
          className="flex flex-col items-center justify-center gap-1 cursor-pointer"
        >
          <ScanLine
            size={22}
            className={tab === 'scan' ? 'text-[#D91624]' : 'text-zinc-800'}
          />
          <span
            className={`text-xs font-bold ${tab === 'scan' ? 'text-[#D91624]' : 'text-zinc-800'
              }`}
          >
            {isAk ? 'စကင်ဖတ်' : 'Scan'}
          </span>
          <span
            className={`w-9 h-0.5 rounded-full ${tab === 'scan' ? 'bg-[#D91624]' : 'bg-transparent'
              }`}
          />
        </button>

        <button
          type="button"
          onClick={() => setTab('myqr')}
          className="flex flex-col items-center justify-center gap-1 cursor-pointer"
        >
          <QrCode
            size={22}
            className={tab === 'myqr' ? 'text-[#D91624]' : 'text-zinc-800'}
          />
          <span
            className={`text-xs font-bold ${tab === 'myqr' ? 'text-[#D91624]' : 'text-zinc-800'
              }`}
          >
            MyQR
          </span>
          <span
            className={`w-9 h-0.5 rounded-full ${tab === 'myqr' ? 'bg-[#D91624]' : 'bg-transparent'
              }`}
          />
        </button>
      </div>
    </div>
  )
}

// ── AGENT CASH OUT SCREEN ───────────────────────────────────────────────
export function CashOut({ go, lang, theme = 'light' }: { go: (s: Screen) => void; lang: Language; theme?: ThemeMode }) {
  const t = translations[lang]
  const [selectedAgent, setSelectedAgent] = useState<(typeof agents)[0] | null>(null)
  const [showTotp, setShowTotp] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(30)
  const [dynamicOtp, setDynamicOtp] = useState('719 402')

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (showTotp) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setDynamicOtp(
              Math.floor(100 + Math.random() * 900) + ' ' + Math.floor(100 + Math.random() * 900)
            )
            return 30
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [showTotp])

  return (
    <div className={`flex h-full flex-col ${th.root(theme)}`}>
      <ScreenHeader
        title={t.cashOutTitle}
        subtitle={lang === 'ak' ? 'တရားဝင် အာရက္ခအေးဂျင့်များ' : 'Verified Agent Branch Network'}
        theme={theme}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!showTotp ? (
          <>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              <span className="font-bold">{t.cashOutSubtitle}</span>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-300 mb-2">{t.cashOutNearbyAgents}</div>
              <div className="space-y-2">
                {agents.map((agt) => (
                  <button
                    key={agt.code}
                    onClick={() => {
                      setSelectedAgent(agt)
                      setShowTotp(true)
                    }}
                    className="w-full p-3.5 rounded-2xl bg-[#131B26] hover:bg-[#1A2536] border border-white/5 hover:border-amber-500/40 text-left transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600/30 to-amber-600/30 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Store size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {lang === 'ak' ? agt.mm : agt.name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {agt.code} • {lang === 'ak' ? agt.townshipMm : agt.township}
                        </div>
                        <div className="text-[9px] text-amber-300 font-mono mt-0.5">
                          {agt.distance} • {lang === 'ak' ? agt.floatStatusMm : `${agt.floatStatus} Cash Float`}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="p-5 rounded-3xl bg-gradient-to-b from-[#1C2530] to-[#101724] border border-amber-500/40 text-center space-y-4">
            <div className="text-xs font-bold text-white">
              {lang === 'ak' ? selectedAgent?.mm : selectedAgent?.name}
            </div>

            <div>
              <div className="text-[10px] text-gray-400">{t.cashOutTokenLabel}</div>
              <div className="text-4xl font-extrabold font-mono tracking-widest text-amber-400 mt-2">
                {dynamicOtp}
              </div>
              <div className="text-[10px] text-gray-400 mt-1.5 flex items-center justify-center gap-1">
                <Clock size={12} className="text-amber-400" />
                <span>
                  {t.cashOutTokenValidFor}: <strong className="text-white">{secondsLeft}s</strong>
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl inline-block shadow-xl">
              <FakeQR size={140} value={`pethar://cashout?agent=${selectedAgent?.code}&totp=${dynamicOtp}`} />
            </div>

            <p className="text-[11px] text-gray-300 max-w-xs mx-auto">
              {lang === 'ak'
                ? 'အေးဂျင့်ထံ ဤကုဒ်ပြသ၍ ငွေသားထုတ်ယူပါ။ တစ်ခါသုံးကုဒ်ဖြစ်သဖြင့် လုံခြုံစိတ်ချရပါသည်'
                : 'Show dynamic code to agent counter to withdraw physical Arakan banknotes'}
            </p>

            <button
              onClick={() => {
                alert(lang === 'ak' ? 'ငွေသားထုတ်ယူမှု အောင်မြင်ပါသည်!' : 'Cash-out withdrawal settled!')
                go('home')
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
            >
              {lang === 'ak' ? 'ငွေသားလက်ခံရရှိပါပြီ' : 'Confirm Cash Received'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── NOTIFICATIONS SCREEN (store-driven, synced with home bell) ─────────────
export function NotificationsScreen({
  go,
  lang = 'ak',
  theme = 'light',
}: {
  go?: (s: Screen) => void
  lang?: Language
  theme?: ThemeMode
}) {
  const [filter, setFilter] = useState<'all' | 'transaction' | 'system' | 'promotion'>('all')
  const [selectedNoti, setSelectedNoti] = useState<NotiItem | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { list, unread } = useNotifications()
  const isAk = lang === 'ak'

  const filtered = list.filter((n) => filter === 'all' || n.type === filter)
  const groups = [...new Set(filtered.map((n) => n.dateGroup))]

  const getPillCount = (id: typeof filter) => {
    if (id === 'all') return list.length
    return list.filter((n) => n.type === id).length
  }

  const pills = [
    { id: 'all' as const, label: 'All', mm: 'အားလုံး', icon: Bell },
    { id: 'transaction' as const, label: 'Transactions', mm: 'ငွေလွှဲ', icon: ArrowLeftRight },
    { id: 'system' as const, label: 'System', mm: 'စနစ်', icon: ShieldCheck },
    { id: 'promotion' as const, label: 'Offers', mm: 'ပရိုမိုးရှင်း', icon: Sparkles },
  ]

  const typeConfig = (type: NotiItem['type']) => {
    switch (type) {
      case 'transaction':
        return {
          gradient: 'from-emerald-500 to-teal-600',
          shadow: 'shadow-emerald-500/20',
          bgSoft: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
          tag: isAk ? 'ငွေလွှဲ' : 'TRANSACTION',
          icon: ArrowLeftRight,
        }
      case 'system':
        return {
          gradient: 'from-amber-500 to-orange-500',
          shadow: 'shadow-amber-500/20',
          bgSoft: 'bg-amber-50 text-amber-700 border-amber-200/60',
          tag: isAk ? 'စနစ်' : 'SYSTEM',
          icon: ShieldCheck,
        }
      case 'promotion':
      default:
        return {
          gradient: 'from-indigo-500 to-purple-600',
          shadow: 'shadow-purple-500/20',
          bgSoft: 'bg-purple-50 text-purple-700 border-purple-200/60',
          tag: isAk ? 'ပရိုမိုးရှင်း' : 'OFFER',
          icon: Sparkles,
        }
    }
  }

  const handleCardClick = (n: NotiItem) => {
    if (!n.read) {
      markRead(n.id)
    }
    setSelectedNoti(n)
  }

  return (
    <div className={`relative flex h-full flex-col overflow-y-auto select-none ${th.root(theme)}`}>
      {/* ── App Bar / Header ── */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b backdrop-blur-md bg-white/95 border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          {go && (
            <button
              onClick={() => go('home')}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition active:scale-95 shadow-xs"
              title="Back"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-gray-900 leading-tight">
              {isAk ? 'အသိပေးချက်များ' : 'Notifications'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              {unread > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {isAk ? `${unread} ခု အသစ်` : `${unread} unread`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <Check size={10} strokeWidth={3} />
                  {isAk ? 'အားလုံး ဖတ်ပြီး' : 'All caught up'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="relative flex items-center gap-1">
          {unread > 0 && (
            <button
              onClick={() => markAllRead()}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
              title={isAk ? 'အားလုံး ဖတ်ပြီးဟု မှတ်သား' : 'Mark all as read'}
            >
              <CheckCheck size={14} />
              <span>{isAk ? 'ဖတ်ပြီးမှတ်' : 'Mark read'}</span>
            </button>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition"
            title="Options"
          >
            <MoreVertical size={18} />
          </button>

          {/* Overflow Menu */}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl bg-white border border-gray-200 shadow-xl p-1.5 text-xs font-semibold animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    markAllRead()
                    setMenuOpen(false)
                  }}
                  disabled={unread === 0}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                    unread === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CheckCheck size={15} className="text-blue-600" />
                  <span>{isAk ? 'အားလုံး ဖတ်ပြီးဟု မှတ်သား' : 'Mark all as read'}</span>
                </button>
                <button
                  onClick={() => {
                    clearAllNotifications()
                    setMenuOpen(false)
                  }}
                  disabled={list.length === 0}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                    list.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <Trash2 size={15} />
                  <span>{isAk ? 'အားလုံး ရှင်းလင်းမည်' : 'Clear all'}</span>
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={() => {
                    resetDemoNotifications()
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-gray-700 hover:bg-gray-100 transition"
                >
                  <RotateCcw size={15} className="text-gray-500" />
                  <span>{isAk ? 'မူလ သရုပ်ပြ အသိပေးချက်များ ပြန်ယူမည်' : 'Reset demo alerts'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Filter Pills Bar ── */}
      <div className="px-4 pt-3.5 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {pills.map((p) => {
          const Icon = p.icon
          const count = getPillCount(p.id)
          const active = filter === p.id
          return (
            <button
              key={p.id}
              onClick={() => setFilter(p.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition active:scale-95 shrink-0 ${
                active
                  ? 'bg-gradient-to-r from-[#1B4DFF] to-[#0A2EB0] text-white shadow-[0_4px_12px_rgba(27,77,255,0.28)]'
                  : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-gray-50 shadow-2xs'
              }`}
            >
              <Icon size={14} className={active ? 'text-white' : 'text-gray-500'} />
              <span>{isAk ? p.mm : p.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Grouped Feed ── */}
      <div className="px-4 py-2 space-y-4 flex-1">
        {groups.map((group) => {
          const groupItems = filtered.filter((n) => n.dateGroup === group)
          if (groupItems.length === 0) return null

          return (
            <div key={group} className="space-y-2">
              <div className="flex items-center gap-2 pt-2 pb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  {group}
                </span>
                <div className="flex-1 h-px bg-gray-200/60" />
              </div>

              <div className="space-y-2.5">
                {groupItems.map((n) => {
                  const cfg = typeConfig(n.type)
                  const TypeIcon = cfg.icon

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleCardClick(n)}
                      className={`group relative rounded-2xl p-3.5 border transition cursor-pointer select-none ${
                        !n.read
                          ? 'bg-white border-blue-200/90 shadow-[0_3px_12px_rgba(27,77,255,0.06)]'
                          : 'bg-white/90 border-gray-200/70 shadow-2xs hover:border-gray-300'
                      }`}
                    >
                      {/* Glow indicator on left edge for unread */}
                      {!n.read && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#1B4DFF]" />
                      )}

                      <div className="flex items-start gap-3">
                        {/* Squircle gradient icon */}
                        <div
                          className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${cfg.gradient} text-white flex items-center justify-center shrink-0 shadow-md ${cfg.shadow}`}
                        >
                          <TypeIcon size={19} strokeWidth={2.2} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${cfg.bgSoft}`}
                              >
                                {cfg.tag}
                              </span>
                              {!n.read && (
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-2xs">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono">
                              <Clock size={11} />
                              <span>{n.time}</span>
                            </div>
                          </div>

                          <h3
                            className={`text-sm leading-snug line-clamp-1 ${
                              !n.read ? 'font-black text-gray-950' : 'font-bold text-gray-800'
                            }`}
                          >
                            {isAk ? n.titleMm : n.titleEn}
                          </h3>

                          <p className="text-xs text-gray-600 leading-relaxed mt-1 line-clamp-2">
                            {isAk ? n.bodyMm : n.bodyEn}
                          </p>
                        </div>

                        {/* Delete action button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(n.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-rose-600 flex items-center justify-center transition shrink-0"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* ── Empty State ── */}
        {filtered.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
            {/* Multi-tier concentric glow rings */}
            <div className="relative w-28 h-28 rounded-full bg-blue-50/70 border border-blue-100 flex items-center justify-center mb-5 shadow-inner">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100/70 flex items-center justify-center shadow-xs">
                <BellOff size={34} className="text-blue-600" />
              </div>
            </div>

            <h3 className="text-base font-black text-gray-900 tracking-tight">
              {isAk ? 'အသိပေးချက် မရှိပါ' : 'All caught up!'}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed">
              {isAk
                ? 'ဤအမျိုးအစားတွင် အသိပေးချက် အသစ်များ မရှိသေးပါ။'
                : 'No notifications found in this category. You are up to date on all wallet activity.'}
            </p>

            <button
              onClick={() => resetDemoNotifications()}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition active:scale-95 border border-blue-200/60"
            >
              <RotateCcw size={14} />
              <span>{isAk ? 'သရုပ်ပြ အသိပေးချက်များ ပြန်ဖွင့်မည်' : 'Load Demo Notifications'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Detail Modal Bottom Sheet ── */}
      {selectedNoti && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-gray-100 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-5 sm:hidden" />

            {/* Header info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${
                    typeConfig(selectedNoti.type).gradient
                  } text-white flex items-center justify-center shadow-md`}
                >
                  {(() => {
                    const Icon = typeConfig(selectedNoti.type).icon
                    return <Icon size={22} strokeWidth={2.2} />
                  })()}
                </div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                      typeConfig(selectedNoti.type).bgSoft
                    }`}
                  >
                    {typeConfig(selectedNoti.type).tag}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mt-1">
                    <Clock size={12} />
                    <span>
                      {selectedNoti.dateGroup} • {selectedNoti.time}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedNoti(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5">
              <h2 className="text-base font-extrabold text-gray-950 leading-snug">
                {isAk ? selectedNoti.titleMm : selectedNoti.titleEn}
              </h2>
              <div className="mt-3 p-4 rounded-2xl bg-gray-50 border border-gray-200/60 text-xs text-gray-700 leading-relaxed font-medium">
                {isAk ? selectedNoti.bodyMm : selectedNoti.bodyEn}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => {
                  deleteNotification(selectedNoti.id)
                  setSelectedNoti(null)
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition active:scale-95"
              >
                <Trash2 size={15} />
                <span>{isAk ? 'ဖျက်မည်' : 'Delete'}</span>
              </button>

              <button
                onClick={() => setSelectedNoti(null)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#1B4DFF] to-[#0A2EB0] text-white text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95"
              >
                {isAk ? 'နားလည်ပါပြီ' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-8" />
    </div>
  )
}

