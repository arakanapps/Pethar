import {
  wallets, contacts, agents,
  initialUserProfile, type UserProfile
} from './data'
import {
  ArrowUpRight, ArrowDownLeft, QrCode, Store, Eye, EyeOff,
  ChevronRight, Copy, Check,
  Fingerprint, ScanLine, Globe, Flashlight, ImagePlus,
  Clock, CreditCard, Shield,
  Plus, X, LogOut,
  Download,
  Receipt, User, Sun, KeyRound, ShieldCheck, Camera,
  Bell, ArrowLeftRight, Share2, PieChart,
  ChevronLeft, BellOff, Sparkles, CheckCheck, Trash2, MoreVertical,
  History as HistoryIcon,
  Layers, Radio
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { FakeQR } from './components/FakeQR'
import { ArakanEmblem, FlagArakan, FlagInternational } from './components/ArakanEmblem'
import { TransactionSlip } from './components/TransactionSlip'
import {
  isAutoSaveReceiptEnabled,
  setAutoSaveReceiptEnabled,
} from './utils/receiptSaver'
import {
  useNotifications, markAllRead, markRead,
  deleteNotification, clearAllNotifications,
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
  | 'offlinePayment'

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
  onUpdateProfile,
}: {
  go: (s: Screen) => void
  lang: Language
  _onOpenLegal?: (doc: 'terms' | 'privacy' | 'guidelines' | 'fx') => void
  profile?: UserProfile
  theme?: ThemeMode
  onUpdateProfile?: (p: UserProfile) => void
}) {
  const [hidden, setHidden] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggedOutToast, setLoggedOutToast] = useState(false)
  const [showChangePhotoModal, setShowChangePhotoModal] = useState(false)
  const [avatarToast, setAvatarToast] = useState(false)
  const homeCameraInputRef = useRef<HTMLInputElement | null>(null)
  const homeGalleryInputRef = useRef<HTMLInputElement | null>(null)
  const { unread } = useNotifications()
  const isAk = lang === 'ak'
  const w = wallets[0]
  const [currentProfileState, setCurrentProfileState] = useState<UserProfile>(() => {
    const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('pethar_user_avatar') || '' : ''
    return {
      ...(profile || initialUserProfile),
      avatarUrl: savedAvatar || (profile || initialUserProfile).avatarUrl,
    }
  })
  const currentProfile = currentProfileState

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = typeof reader.result === 'string' ? reader.result : ''
      if (!base64) return
      if (typeof window !== 'undefined') {
        localStorage.setItem('pethar_user_avatar', base64)
      }
      const updated = { ...currentProfile, avatarUrl: base64 }
      setCurrentProfileState(updated)
      if (onUpdateProfile) {
        onUpdateProfile(updated)
      }
      setAvatarToast(true)
      setTimeout(() => setAvatarToast(false), 3000)
      setShowChangePhotoModal(false)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

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
      titleEn: 'Ledger-Backed Arakan Dollar',
      titleAk: 'စာရင်းမှ အာမခံထားသော အာရက္ခဒေါ်လာ',
      descEn: 'Fixed 1:1 peg to the US dollar',
      descAk: 'အမေရိကန်ဒေါ်လာနှင့် ၁:၁ ပုံသေနှုန်း ချိတ်ဆက်ထားသည်',
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
          type="button"
          onClick={() => setShowChangePhotoModal(true)}
          className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#D91624]/30 bg-white shadow-xs flex items-center justify-center active:scale-95 transition shrink-0 z-10 cursor-pointer"
          title={isAk ? 'ပရိုဖိုင်ဓာတ်ပုံ ပြောင်းရန်' : 'Change profile photo'}
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

      {/* Avatar Updated Toast */}
      {avatarToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400">
          <Check size={14} />
          <span>{isAk ? 'ပရိုဖိုင်ဓာတ်ပုံ အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ' : 'Profile photo updated successfully!'}</span>
        </div>
      )}

      {/* Change Profile Photo Modal Popup */}
      {showChangePhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowChangePhotoModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[28px] p-6 shadow-2xl border border-zinc-100 flex flex-col animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator */}
            <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-4 sm:hidden" />

            {/* Title Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">
                  {isAk ? 'ပရိုဖိုင်ဓာတ်ပုံ ပြောင်းရန်' : 'Change profile photo'}
                </h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  {isAk ? 'ကင်မရာ သို့မဟုတ် ဖုန်းပြခန်းမှ ရွေးချယ်ပါ' : 'Select an option to update your photo'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePhotoModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={homeCameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleProfilePhotoChange}
            />
            <input
              ref={homeGalleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePhotoChange}
            />

            {/* Options List */}
            <div className="space-y-2.5 pt-4">
              {/* 1. Take Photo */}
              <button
                type="button"
                onClick={() => homeCameraInputRef.current?.click()}
                className="w-full p-3.5 rounded-2xl bg-zinc-50 hover:bg-red-50/60 border border-zinc-200/80 hover:border-[#D91624]/40 flex items-center justify-between group active:scale-[0.98] transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-red-100 text-[#D91624] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Camera size={20} strokeWidth={2.2} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-zinc-900 group-hover:text-[#D91624] transition-colors">
                      {isAk ? 'ကင်မရာဖြင့် ဓာတ်ပုံရိုက်မည်' : 'Take Photo'}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {isAk ? 'ဖုန်းကင်မရာ ဖွင့်ရန်' : 'Open camera to capture'}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-zinc-400 group-hover:text-[#D91624] transition-colors" />
              </button>

              {/* 2. Choose Photo */}
              <button
                type="button"
                onClick={() => homeGalleryInputRef.current?.click()}
                className="w-full p-3.5 rounded-2xl bg-zinc-50 hover:bg-sky-50/60 border border-zinc-200/80 hover:border-sky-500/40 flex items-center justify-between group active:scale-[0.98] transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-sky-100 text-[#0284C7] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <ImagePlus size={20} strokeWidth={2.2} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-zinc-900 group-hover:text-[#0284C7] transition-colors">
                      {isAk ? 'ဖုန်းပြခန်းမှ ဓာတ်ပုံရွေးမည်' : 'Choose Photo'}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {isAk ? 'ပြခန်းမှ ဓာတ်ပုံ ရွေးချယ်ရန်' : 'Select from photo library'}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-zinc-400 group-hover:text-[#0284C7] transition-colors" />
              </button>
            </div>

            {/* 3. Cancel */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setShowChangePhotoModal(false)}
                className="w-full py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm transition cursor-pointer active:scale-[0.98]"
              >
                {isAk ? 'မလုပ်တော့ပါ' : 'Cancel'}
              </button>
            </div>
          </div>
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

  const userUid = initialUserProfile.uid

  const copyAddress = () => {
    navigator.clipboard.writeText(initialUserProfile.usdAccountWalletAddress || '')
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

// ── SERVICES SCREEN (Product & Service - Centered, 4 Core Items) ────────
export function ServicesScreen({
  go: _go,
  lang,
  theme = 'light',
}: {
  go: (s: Screen) => void
  lang: Language
  theme?: ThemeMode
}) {
  void _go
  const isAk = lang === 'ak'
  const isLight = theme === 'light'
  const [giftCardOpen, setGiftCardOpen] = useState(false)
  const [miniAppsOpen, setMiniAppsOpen] = useState(false)
  const [giftTab, setGiftTab] = useState<'all' | 'games' | 'itunes' | 'viber'>('all')
  const [selectedGiftCard, setSelectedGiftCard] = useState<any | null>(null)
  const [selectedGiftPkg, setSelectedGiftPkg] = useState<string>('')
  const [playerId, setPlayerId] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showComingSoon = (title: string) => {
    setToastMsg(isAk ? `${title} - မကြာမီ လာမည်ဖြစ်ပါသည်` : `${title} is Coming Soon...`)
    setTimeout(() => {
      setToastMsg((prev) => (prev ? null : prev))
    }, 2500)
  }

  // Partner Apps State
  const [partnerApps, setPartnerApps] = useState([
    {
      name: 'Sittwe Fresh Mart',
      category: 'E-Commerce & Food',
      desc: 'Local fresh groceries & produce delivered to your door',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      name: 'Arakan Express Bus',
      category: 'Travel & Ticketing',
      desc: 'Inter-town express bus tickets (Sittwe, Mrauk-U, Kyaukpyu)',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      name: 'Rakhine Health & Med',
      category: 'Healthcare & Pharmacy',
      desc: 'Digital prescriptions, clinic appointments & telehealth',
      color: 'from-red-500 to-rose-600',
    },
    {
      name: 'Arakan Cinema Club',
      category: 'Entertainment & Events',
      desc: 'Movie tickets booking & local cultural showtimes',
      color: 'from-purple-500 to-violet-600',
    },
  ])
  const [createAppModalOpen, setCreateAppModalOpen] = useState(false)
  const [newAppName, setNewAppName] = useState('')
  const [newAppCompany, setNewAppCompany] = useState('')
  const [newAppCategory, setNewAppCategory] = useState('E-Commerce')
  const [newAppUrl, setNewAppUrl] = useState('')
  const [newAppContact, setNewAppContact] = useState('')

  const giftCards = [
    {
      id: 'mlbb',
      category: 'games',
      title: 'Mobile Legends: Bang Bang',
      subtitle: 'Diamonds & Weekly Diamond Pass',
      price: 'From ₳ 3.50',
      packages: ['50 Diamonds (₳ 3.50)', '250 Diamonds (₳ 16.00)', 'Weekly Pass (₳ 6.50)', '500 Diamonds (₳ 31.00)'],
    },
    {
      id: 'pubg',
      category: 'games',
      title: 'PUBG Mobile',
      subtitle: 'Unknown Cash (UC) Direct Top-Up',
      price: 'From ₳ 4.20',
      packages: ['60 UC (₳ 4.20)', '325 UC (₳ 19.50)', '660 UC (₳ 37.00)', '1800 UC (₳ 85.00)'],
    },
    {
      id: 'freefire',
      category: 'games',
      title: 'Garena Free Fire',
      subtitle: 'Diamonds & Monthly Membership',
      price: 'From ₳ 2.80',
      packages: ['100 Diamonds (₳ 2.80)', '310 Diamonds (₳ 8.50)', '520 Diamonds (₳ 14.00)'],
    },
    {
      id: 'itunes',
      category: 'itunes',
      title: 'Apple iTunes / App Store',
      subtitle: 'US & Global Digital Gift Card',
      price: 'From ₳ 15.50',
      packages: ['$5 USD Card (₳ 15.50)', '$10 USD Card (₳ 30.50)', '$25 USD Card (₳ 76.00)', '$50 USD Card (₳ 152.00)'],
    },
    {
      id: 'viberplus',
      category: 'viber',
      title: 'Viber Plus Premium',
      subtitle: 'Exclusive Badge, No Ads, Stealth Mode',
      price: 'From ₳ 6.00',
      packages: ['1 Month Subscription (₳ 6.00)', '1 Year Subscription (₳ 55.00)', 'Viber Out $5 Calling (₳ 15.50)'],
    },
    {
      id: 'steam',
      category: 'games',
      title: 'Steam Wallet USD',
      subtitle: 'PC Games & Steam Community Market',
      price: 'From ₳ 16.00',
      packages: ['$5 Steam Code (₳ 16.00)', '$10 Steam Code (₳ 31.00)', '$20 Steam Code (₳ 62.00)'],
    },
  ]

  const filteredGiftCards = giftTab === 'all'
    ? giftCards
    : giftCards.filter((g) => g.category === giftTab)

  return (
    <div
      className={`flex h-full flex-col overflow-y-auto pb-32 transition-colors ${
        isLight ? 'bg-[#F4F5F8] text-zinc-900' : 'bg-[#090D14] text-white'
      }`}
    >
      {/* ── Top Bar Header (Centered "Product & Service") ── */}
      <div className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-20 shadow-xs">
        <h1 className="text-base font-extrabold text-zinc-900 text-center tracking-tight">
          {isAk ? 'ထုတ်ကုန်နှင့် ဝန်ဆောင်မှု' : 'Product & Service'}
        </h1>
      </div>

      {/* ── Main List Container ── */}
      <div className="p-4 space-y-3 max-w-lg mx-auto w-full">
        {/* Toast Alert */}
        {toastMsg && (
          <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center shadow-md animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* 1. Agent Cash-Out */}
        <button
          type="button"
          onClick={() => showComingSoon(isAk ? 'အေးဂျင့်မှ ငွေသားထုတ်ယူ' : 'Agent Cash-Out')}
          className="w-full p-4 rounded-2xl border border-zinc-200 bg-white shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all flex items-center justify-between group active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Store size={22} />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-bold text-zinc-900">
                {isAk ? 'အေးဂျင့်မှ ငွေသားထုတ်ယူ' : 'Agent Cash-Out'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold shrink-0">
                {isAk ? 'မကြာမီ' : 'Coming Soon'}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 transition-colors">
            <ChevronRight size={18} />
          </div>
        </button>

        {/* 2. Offline Pay (Renamed from Offline NFC & Bluetooth Mesh) */}
        <button
          type="button"
          onClick={() => showComingSoon(isAk ? 'အော့ဖ်လိုင်း ငွေပေးချေမှု' : 'Offline Pay')}
          className="w-full p-4 rounded-2xl border border-zinc-200 bg-white shadow-2xs hover:shadow-md hover:border-teal-500/40 transition-all flex items-center justify-between group active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
              <Radio size={22} />
            </div>
            <div className="flex flex-col text-left flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900">
                  {isAk ? 'အော့ဖ်လိုင်း ငွေပေးချေမှု' : 'Offline Pay'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold shrink-0">
                  {isAk ? 'မကြာမီ' : 'Coming Soon'}
                </span>
              </div>
              <span className="text-xs text-zinc-400 mt-0.5">
                {isAk
                  ? 'အင်တာနက်မရှိဘဲ တိုက်ရိုက်ထိ၍ ငွေပေးချေပါ'
                  : 'Offline tap & mesh pay without internet'}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-teal-600 transition-colors">
            <ChevronRight size={18} />
          </div>
        </button>

        {/* 3. Gift Card (To top up games, iTunes, Viber Plus) */}
        <button
          type="button"
          onClick={() => showComingSoon(isAk ? 'လက်ဆောင်ကတ်များ' : 'Gift Card')}
          className="w-full p-4 rounded-2xl border border-zinc-200 bg-white shadow-2xs hover:shadow-md hover:border-purple-500/40 transition-all flex items-center justify-between group active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Sparkles size={22} />
            </div>
            <div className="flex flex-col text-left flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900">
                  {isAk ? 'လက်ဆောင်ကတ်များ' : 'Gift Card'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold shrink-0">
                  {isAk ? 'မကြာမီ' : 'Coming Soon'}
                </span>
              </div>
              <span className="text-xs text-zinc-400 mt-0.5">
                {isAk
                  ? 'ဂိမ်း၊ iTunes၊ Viber Plus နှင့် ဒစ်ဂျစ်တယ်ကတ်များ ဖြည့်ရန်'
                  : 'Top up games, iTunes, Viber Plus & digital cards'}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-purple-600 transition-colors">
            <ChevronRight size={18} />
          </div>
        </button>

        {/* 4. Mini Apps (For partner companies to create app) */}
        <button
          type="button"
          onClick={() => showComingSoon(isAk ? 'မိတ်ဖက် မီနီအက်ပ်များ' : 'Mini Apps')}
          className="w-full p-4 rounded-2xl border border-zinc-200 bg-white shadow-2xs hover:shadow-md hover:border-blue-500/40 transition-all flex items-center justify-between group active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Layers size={22} />
            </div>
            <div className="flex flex-col text-left flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900">
                  {isAk ? 'မိတ်ဖက် မီနီအက်ပ်များ' : 'Mini Apps'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold shrink-0">
                  {isAk ? 'မကြာမီ' : 'Coming Soon'}
                </span>
              </div>
              <span className="text-xs text-zinc-400 mt-0.5">
                {isAk
                  ? 'မိတ်ဖက်ကုမ္ပဏီများအတွက် အက်ပ်ဖန်တီးနိုင်သော ပလက်ဖောင်း'
                  : 'Partner platform for companies to create apps'}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-blue-600 transition-colors">
            <ChevronRight size={18} />
          </div>
        </button>
      </div>

      {/* ── GIFT CARD MODAL ── */}
      {giftCardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">
                    {isAk ? 'လက်ဆောင်ကတ်များ' : 'Gift Card & Top-Up'}
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    {isAk ? 'ဂိမ်း၊ iTunes၊ Viber Plus ဘောက်ချာများ' : 'Games, iTunes, Viber Plus vouchers'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGiftCardOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="p-3 border-b border-zinc-100 flex gap-2 overflow-x-auto">
              {[
                { id: 'all', label: isAk ? 'အားလုံး' : 'All' },
                { id: 'games', label: isAk ? 'ဂိမ်းများ' : 'Games' },
                { id: 'itunes', label: 'iTunes' },
                { id: 'viber', label: 'Viber Plus' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGiftTab(tab.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 cursor-pointer ${
                    giftTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Cards List */}
            <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
              {filteredGiftCards.map((card) => (
                <div
                  key={card.id}
                  className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900">{card.title}</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{card.subtitle}</p>
                    <p className="text-[11px] font-bold text-emerald-600 mt-1">{card.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGiftCard(card)
                      setSelectedGiftPkg(card.packages[0])
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer"
                  >
                    {isAk ? 'ဝယ်ယူရန်' : 'Top-Up'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gift Card Purchase Dialog */}
      {selectedGiftCard && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">{selectedGiftCard.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedGiftCard(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                {isAk ? 'အကောင့် / Player ID / Phone:' : 'User ID / Player ID / Phone:'}
              </label>
              <input
                type="text"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="e.g. 12345678"
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                {isAk ? 'ပက်ကေ့ချ် ရွေးပါ:' : 'Select Package:'}
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedGiftCard.packages.map((pkg: string) => (
                  <button
                    key={pkg}
                    type="button"
                    onClick={() => setSelectedGiftPkg(pkg)}
                    className={`w-full p-2.5 rounded-xl text-xs text-left border cursor-pointer ${
                      selectedGiftPkg === pkg
                        ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    {pkg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedGiftCard(null)}
                className="flex-1 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold"
              >
                {isAk ? 'မလုပ်တော့ပါ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedGiftCard(null)
                  setGiftCardOpen(false)
                  setToastMsg(
                    isAk
                      ? `${selectedGiftCard.title} - ${selectedGiftPkg} အတွက် ငွေဖြည့်မှု အောင်မြင်ပါသည်!`
                      : `Successfully topped up ${selectedGiftCard.title} - ${selectedGiftPkg}!`
                  )
                  setTimeout(() => setToastMsg(null), 4000)
                }}
                className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                {isAk ? 'အတည်ပြုမည်' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MINI APPS MODAL ── */}
      {miniAppsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">
                    {isAk ? 'မိတ်ဖက် မီနီအက်ပ်များ' : 'Mini Apps Platform'}
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    {isAk ? 'မိတ်ဖက်ကုမ္ပဏီများအတွက် အက်ပ်ဖန်တီးနိုင်သော ပလက်ဖောင်း' : 'Partner companies platform to create & deploy apps'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMiniAppsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scroll Content */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Partner Callout Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 text-white space-y-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-200">
                  {isAk ? 'မိတ်ဖက်ကုမ္ပဏီများအတွက်' : 'For Partner Companies'}
                </span>
                <p className="text-xs text-blue-100 leading-relaxed">
                  {isAk
                    ? 'သင့်လုပ်ငန်းအတွက် မီနီအက်ပ်ကို ဖေ့သာ ပလက်ဖောင်းပေါ်တွင် တိုက်ရိုက်ဖန်တီးပြီး သုံးစွဲသူများထံ ချက်ချင်းရောက်ရှိပါစေ။'
                    : 'Build & launch your company mini-app inside Péthar Wallet with instant payment rails.'}
                </p>
                <button
                  type="button"
                  onClick={() => setCreateAppModalOpen(true)}
                  className="mt-2 px-3.5 py-2 rounded-xl bg-white text-blue-900 text-xs font-bold hover:bg-blue-50 transition cursor-pointer"
                >
                  {isAk ? 'မီနီအက်ပ် အသစ်ဖန်တီးမည်' : '+ Create / Register App'}
                </button>
              </div>

              {/* Active Partner Apps */}
              <div>
                <h3 className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                  {isAk ? 'လက်ရှိ မိတ်ဖက်အက်ပ်များ' : 'Active Partner Mini Apps'}
                </h3>
                <div className="space-y-2">
                  {partnerApps.map((app) => (
                    <div
                      key={app.name}
                      className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-900">{app.name}</h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                            Verified
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-blue-600 mt-0.5">{app.category}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{app.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setToastMsg(`Launching ${app.name} Mini App...`)
                          setTimeout(() => setToastMsg(null), 3000)
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
                      >
                        {isAk ? 'ဖွင့်မည်' : 'Open'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Partner App Dialog */}
      {createAppModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">
                {isAk ? 'မီနီအက်ပ် ဖန်တီးရန် မှတ်ပုံတင်ပါ' : 'Register Partner Mini App'}
              </h3>
              <button
                type="button"
                onClick={() => setCreateAppModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Company / Partner Name:</label>
              <input
                type="text"
                value={newAppCompany}
                onChange={(e) => setNewAppCompany(e.target.value)}
                placeholder="e.g. Arakan Logistics Ltd."
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Mini App Name:</label>
              <input
                type="text"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                placeholder="e.g. Rakhine Quick Delivery"
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Category:</label>
              <select
                value={newAppCategory}
                onChange={(e) => setNewAppCategory(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs"
              >
                <option value="E-Commerce">E-Commerce & Retail</option>
                <option value="Food & Dining">Food & Dining Delivery</option>
                <option value="Travel">Travel & Transportation</option>
                <option value="Healthcare">Healthcare & Pharmacy</option>
                <option value="Utilities">Utilities & Local Services</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">App URL / Webhook Endpoint:</label>
              <input
                type="text"
                value={newAppUrl}
                onChange={(e) => setNewAppUrl(e.target.value)}
                placeholder="https://partner.company.com/app"
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Developer Contact / Email:</label>
              <input
                type="text"
                value={newAppContact}
                onChange={(e) => setNewAppContact(e.target.value)}
                placeholder="developer@company.com"
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreateAppModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold"
              >
                {isAk ? 'မလုပ်တော့ပါ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newAppName.trim()) return
                  setPartnerApps([
                    {
                      name: newAppName,
                      category: newAppCategory,
                      desc: 'Newly registered partner mini-app sandbox',
                      color: 'from-blue-600 to-indigo-700',
                    },
                    ...partnerApps,
                  ])
                  setCreateAppModalOpen(false)
                  setToastMsg(
                    isAk
                      ? `${newAppName} အတွက် မီနီအက်ပ် လျှောက်ထားမှု အောင်မြင်ပါသည်။ API Key ထုတ်ပေးပြီးပါပြီ!`
                      : `Successfully registered ${newAppName}! Sandbox API Client Key issued.`
                  )
                  setTimeout(() => setToastMsg(null), 4000)
                }}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                {isAk ? 'ဖန်တီးမည်' : 'Submit & Register'}
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [editGender, setEditGender] = useState(currentProfile.gender || 'Male')
  const [editIdType, setEditIdType] = useState(currentProfile.idType || 'National ID')
  const [editIdNumber, setEditIdNumber] = useState(currentProfile.nationalIdNo || '')
  const [editDob, setEditDob] = useState(currentProfile.dob || '')
  const [showSensitiveDetails, setShowSensitiveDetails] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editPin, setEditPin] = useState('')
  const [currentPinInput, setCurrentPinInput] = useState('')
  const [otpStage, setOtpStage] = useState<'idle' | 'email_otp' | 'phone_otp' | 'name_otp' | 'pin_otp'>('idle')
  const [otpInput, setOtpInput] = useState('')
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
    setEditGender(currentProfile.gender || 'Male')
    setEditIdType(currentProfile.idType || 'National ID')
    setEditIdNumber(currentProfile.nationalIdNo || '')
    setEditDob(currentProfile.dob || '')
    setEditPin('')
    setCurrentPinInput('')
    setOtpStage('idle')
    setOtpInput('')
  }

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setEditAvatarUrl(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return '••••••@••••.com'
    const [name, domain] = email.split('@')
    return `${name.slice(0, 2)}••••@${domain}`
  }

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 6) return '••••••••'
    return `${phone.slice(0, 4)}••••${phone.slice(-3)}`
  }

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length <= 12) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleStartSave = (e: React.FormEvent) => {
    e.preventDefault()
    // 1. If email changed -> requires verified OTP
    if (editEmail.trim() !== currentProfile.email) {
      setOtpStage('email_otp')
      return
    }
    // 2. If phone changed -> requires email verified OTP
    if (editPhone.trim() !== currentProfile.phone) {
      setOtpStage('phone_otp')
      return
    }
    // 3. If first or last name changed -> requires review & email OTP
    if (
      editFirstName.trim() !== currentProfile.firstName ||
      editLastName.trim() !== currentProfile.lastName
    ) {
      setOtpStage('name_otp')
      return
    }
    // 4. If pin changed
    if (editPin.trim().length === 6) {
      if (!currentPinInput && currentProfile.pin) {
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
      gender: editGender || currentProfile.gender || 'Male',
      idType: editIdType || currentProfile.idType || 'National ID',
      nationalIdNo: editIdNumber.trim() || currentProfile.nationalIdNo,
      dob: editDob.trim() || currentProfile.dob,
      pin: editPin.trim().length === 6 ? editPin.trim() : currentProfile.pin,
      // Immutable fields are strictly preserved
      username: currentProfile.username,
      uid: currentProfile.uid,
      walletAddress: currentProfile.uid,
      usdAccountWalletAddress: currentProfile.usdAccountWalletAddress,
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
                    {lang === 'ak' ? 'ကျွန်ုပ်၏ ပရိုဖိုင်' : 'My Profile'}
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

      {/* ── MY PROFILE MODAL (NO BALANCES, NO BADGES, 10 FIELDS IN ORDER) ────── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
          <div className={`w-full max-w-md max-h-[90vh] flex flex-col rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl border ${isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#101724] border-white/10 text-white'
            }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-orange-500" />
                <h3 className="font-bold text-sm">
                  {otpStage !== 'idle' ? 'Security Verification' : (lang === 'ak' ? 'ကျွန်ုပ်၏ ပရိုဖိုင်' : 'My Profile')}
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
                {/* ── TOP AVATAR & PHOTO UPLOAD + USER NICK NAME WITH VERIFIED BADGE ── */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-sky-600 border-2 border-white/20 shadow-md overflow-hidden flex items-center justify-center text-white text-2xl font-black">
                      {editAvatarUrl ? (
                        <img src={editAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>
                          {((editNickname.trim() || `${editFirstName} ${editLastName}`.trim() || currentProfile.name || currentProfile.username || 'U')).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Camera button: triggers gallery picker from device */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center justify-center shadow-lg border border-white cursor-pointer transition"
                      title="Upload photo from phone gallery"
                    >
                      <Camera size={14} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                    />
                  </div>

                  {/* User Nick Name (No verified badge; defaults to full name until user made change) */}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white">
                      {editNickname.trim() || `${editFirstName} ${editLastName}`.trim() || currentProfile.name || currentProfile.username || 'User'}
                    </span>
                  </div>
                </div>

                {/* ── SHOW SENSITIVE DETAILS TOGGLE ── */}
                <div className={`flex items-center justify-between p-3 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex items-center gap-2">
                    {showSensitiveDetails ? (
                      <Eye size={16} className="text-[#0284C7]" />
                    ) : (
                      <EyeOff size={16} className="text-gray-400" />
                    )}
                    <span className="text-xs font-semibold">
                      {lang === 'ak' ? 'အချက်အလက်အားလုံး ဖော်ပြမည်' : 'Show sensitive details'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSensitiveDetails(!showSensitiveDetails)}
                    className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer ${showSensitiveDetails ? 'bg-[#2563EB]' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${showSensitiveDetails ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

                {/* ── EXACT 10 FIELDS IN SPECIFIED ORDER (NO BALANCES, NO BADGES) ── */}
                <div className="space-y-3 pt-1">
                  {/* 1. Full Name */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">Full Name</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-semibold ${
                          isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-semibold ${
                          isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* 2. username (Click to copy, no copy button, no >) */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">username</label>
                    <div
                      onClick={() => handleCopy(currentProfile.username || 'user', 'username')}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border cursor-pointer hover:border-blue-500 transition ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/40 border-white/10'}`}
                    >
                      <span className="font-bold text-xs">{currentProfile.username || 'user'}</span>
                      {copiedKey === 'username' && (
                        <span className="text-[11px] text-emerald-500 font-semibold">{lang === 'ak' ? 'ကူးယူပြီးပါပြီ' : 'Copied!'}</span>
                      )}
                    </div>
                  </div>

                  {/* 3. Wallet Address (Click to copy, no copy button, no >) */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">Wallet Address</label>
                    <div
                      onClick={() => handleCopy(currentProfile.walletAddress || currentProfile.uid, 'walletAddress')}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border cursor-pointer hover:border-blue-500 transition ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/40 border-white/10'}`}
                    >
                      <span className="font-mono text-xs font-semibold truncate">
                        {showSensitiveDetails ? (currentProfile.walletAddress || currentProfile.uid) : truncateAddress(currentProfile.walletAddress || currentProfile.uid)}
                      </span>
                      {copiedKey === 'walletAddress' && (
                        <span className="text-[11px] text-emerald-500 font-semibold shrink-0 ml-2">{lang === 'ak' ? 'ကူးယူပြီးပါပြီ' : 'Copied!'}</span>
                      )}
                    </div>
                  </div>

                  {/* 4. Email */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">Email</label>
                    <input
                      type="text"
                      value={showSensitiveDetails ? editEmail : maskEmail(editEmail)}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-semibold ${
                        isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* 5. Mobile No */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">Mobile No</label>
                    <input
                      type="text"
                      value={showSensitiveDetails ? editPhone : maskPhone(editPhone)}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-semibold font-mono ${
                        isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* 6. Gender */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">Gender</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setEditGender(g)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                            editGender === g
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                              : isLight ? 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100' : 'bg-black/40 border-white/10 text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 7. ID Type */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">ID Type</label>
                    <select
                      value={editIdType}
                      onChange={(e) => setEditIdType(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-semibold ${
                        isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                      }`}
                    >
                      <option value="National ID">National ID</option>
                      <option value="Passport">Passport</option>
                      <option value="Citizenship Card">Citizenship Card</option>
                      <option value="Driver's License">Driver's License</option>
                    </select>
                  </div>

                  {/* 8. ID Number */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">ID Number</label>
                    <input
                      type="text"
                      value={showSensitiveDetails ? editIdNumber : (editIdNumber ? '••••••••' : '---')}
                      onChange={(e) => setEditIdNumber(e.target.value)}
                      placeholder="e.g. 12/KAMAYA(N)123456"
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-semibold ${
                        isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* 9. Date of Birth */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">Date of Birth</label>
                    <input
                      type={showSensitiveDetails ? 'date' : 'text'}
                      value={showSensitiveDetails ? editDob : (editDob ? '••••-••-••' : '---')}
                      onChange={(e) => setEditDob(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-semibold ${
                        isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* 10. My Address */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">My Address</label>
                    <textarea
                      rows={2}
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="Enter residential address"
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-medium ${
                        isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* Nickname update field */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">User Nick Name</label>
                    <input
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      placeholder="Enter nickname"
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-semibold ${
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
            senderId={initialUserProfile.uid}
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
  const uidNumber = currentProfile.uid

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
      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-12 pb-8 text-center space-y-4 overflow-y-auto">
        {/* 1. App Logo + App Name (No container under logo) */}
        <div className="flex flex-col items-center space-y-1.5">
          <img
            src="/pethar-logo-red-white.svg"
            alt="Péthar Logo"
            className="w-11.5 h-11.5 object-contain"
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
          <div className="text-xs font-semibold text-zinc-500 font-mono">
            {usernameHandle}
          </div>
        </div>

        {/* 3. QR Box */}
        <div className="p-4 bg-white rounded-2xl border-2 border-zinc-200/90 shadow-[0_9px_26px_rgba(15,23,42,0.06)] flex items-center justify-center">
          <FakeQR size={170} value={`pethar://pay?uid=${uidNumber}&user=${usernameHandle}&curr=AKD`} />
        </div>

        {/* 4. Wallet Address */}
        <div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            {isAk ? 'ပိုက်ဆံအိတ် လိပ်စာ' : 'Wallet Address'}
          </div>
          <div className="text-base font-extrabold font-mono tracking-widest text-zinc-900 mt-0.5 tabular-nums">
            {uidNumber}
          </div>
        </div>

        {/* 5. Bottom Buttons: [ Copy ] & [ Save ] */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] pt-2">
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
  const uidNumber = currentProfile.uid

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

