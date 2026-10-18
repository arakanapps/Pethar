import {
  wallets, contacts, agents,
  initialUserProfile, type UserProfile
} from './data'
import {
  ArrowUpRight, ArrowDownLeft, QrCode, Store, Eye, EyeOff,
  ChevronRight, Copy, Check,
  Fingerprint, ScanLine, Globe, Coins, Flashlight, ImagePlus,
  Clock, Terminal, CreditCard, Lock,
  Plus, X, LogOut,
  RefreshCw, Download,
  Receipt, Wallet, User, Sun, KeyRound, ShieldCheck,
  Bell, AlarmClock, Megaphone, ArrowLeftRight, Share2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { FakeQR } from './components/FakeQR'
import { ArakanEmblem, FlagArakan, FlagInternational } from './components/ArakanEmblem'
import { TransactionSlip } from './components/TransactionSlip'
import { useNotifications, markAllRead, markRead, type NotiItem } from './notifications'
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
    <div className={`px-5 pt-4 pb-3 border-b backdrop-blur-md ${
      isLight ? 'border-gray-200 bg-white/85' : 'border-white/10 bg-[#090D14]/80'
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
        <span className={`text-4xl font-extrabold font-mono tabular-nums ${isLight ? 'text-gray-900' : 'text-white'}`}>{value || '0'}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 px-6 pb-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className={`h-12 rounded-xl text-lg font-bold transition active:scale-95 border ${
              isLight
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
          className={`flex h-11 w-9 items-center justify-center rounded-xl text-xl font-bold text-white transition-all ${
            i === len
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
    { id: 'intl' as Screen, label: isAk ? 'ငွေဖြည့်' : 'Topup', icon: Plus },
    { id: 'pos' as Screen, label: isAk ? 'ဘေလ်ဆောင်' : 'Bill payment', icon: Receipt },
    { id: 'account' as Screen, label: isAk ? 'ငွေစာရင်း' : 'Account', icon: CreditCard },
    { id: 'services' as Screen, label: isAk ? 'မှတ်တမ်း' : 'History', icon: Clock },
  ]

  const favorites = [
    { name: 'user', mm: 'အသုံးပြုသူ', id: 'ARAK-1024', initials: 'U', bg: 'bg-sky-600' },
    { name: 'MYAT SOE', mm: 'မြတ်စိုး', id: 'ARAK-1024', initials: 'MS', bg: 'bg-blue-600' },
    { name: 'TONY', mm: 'တိုနီ', id: 'ARAK-9921', initials: 'TN', bg: 'bg-emerald-600' },
    { name: 'KO MIN AUNG', mm: 'မင်းအောင်', id: 'ARAK-8891', initials: 'MA', bg: 'bg-amber-600' },
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
      descEn: 'Audited sovereign reserve backed 1:1 by gold',
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
                  {w.balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
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
            <ChevronRight size={16} className="text-white/70 shrink-0" />
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 py-0.5">
            {promoAds.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAdIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === adIdx ? 'w-5 bg-[#D91624]' : 'w-1.5 bg-gray-300'
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

// ── ACCOUNT SCREEN (Second Tab in Bottom Dock) ───────────────────────────
export function AccountScreen({
  go,
  lang,
  theme = 'light',
}: {
  go: (s: Screen) => void
  lang: Language
  theme?: ThemeMode
}) {
  const [cardFrozen, setCardFrozen] = useState(false)
  const [showCvv, setShowCvv] = useState(false)
  const isLight = theme === 'light'

  return (
    <div className={`flex h-full flex-col overflow-y-auto ${th.root(theme)}`}>
      <ScreenHeader
        title={lang === 'ak' ? 'မိမိ ငွေစာရင်းများနှင့် ကတ်များ' : 'My Accounts & Cards'}
        theme={theme}
      />

      <div className="p-4 space-y-4">
        {/* Primary Account Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2D0A0E] via-[#1A1218] to-[#111A28] border border-amber-500/40 shadow-xl">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span className="font-bold flex items-center gap-1.5">
              <Wallet size={14} />
              {lang === 'ak' ? 'အာရက္ခဒေါ်လာ အဓိကစာရင်း' : 'Arakan Dollar Account'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
              ACTIVE
            </span>
          </div>

          <div className="mt-3">
            <div className="text-[10px] text-gray-400 font-mono">ARAK-8891-JACK</div>
            <div className="text-3xl font-extrabold font-mono text-white mt-0.5">
              ₳ 14,850.00
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => go('send')}
              className="py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-1.5 transition"
            >
              <ArrowUpRight size={14} />
              {lang === 'ak' ? 'ငွေလွှဲမည်' : 'Send Money'}
            </button>
            <button
              onClick={() => go('receive')}
              className="py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white flex items-center justify-center gap-1.5 transition"
            >
              <ArrowDownLeft size={14} />
              {lang === 'ak' ? 'ငွေလက်ခံမည်' : 'Deposit'}
            </button>
          </div>
        </div>

        {/* Péthar Visa Debit Card Widget */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
              <CreditCard size={14} className="text-amber-400" />
              {lang === 'ak' ? 'ဖေ့သာ ဒစ်ဂျစ်တယ်ကတ်' : 'Péthar Debit Card'}
            </span>
            <span className="text-[10px] text-amber-400 font-mono">VISA DEBIT</span>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all duration-300 shadow-xl relative overflow-hidden ${
              cardFrozen
                ? 'bg-gray-800/90 border-gray-600 grayscale'
                : 'bg-gradient-to-br from-[#730A12] via-[#A8131F] to-[#3B0206] border-amber-500/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <ArakanEmblem size={28} variant="badge" />
                <span className="font-bold text-white text-xs tracking-wider">PETHAR</span>
              </div>
              <span className="text-[10px] font-mono text-amber-300">VISA</span>
            </div>

            <div className="my-4 font-mono text-sm tracking-widest text-white drop-shadow">
              4219 •••• •••• 9924
            </div>

            <div className="flex items-end justify-between font-mono text-[10px] text-gray-200">
              <div>
                <div className="text-[8px] uppercase text-amber-200/80">Cardholder</div>
                <div className="font-bold text-white">JACK HALDER</div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[8px] uppercase text-amber-200/80">Exp</div>
                  <div>09/30</div>
                </div>
                <div>
                  <div className="text-[8px] uppercase text-amber-200/80">CVV</div>
                  <div>{showCvv ? '418' : '•••'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => setCardFrozen(!cardFrozen)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                cardFrozen
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-white/10 hover:bg-white/15 text-gray-200 border-white/10'
              }`}
            >
              <Lock size={13} />
              {cardFrozen ? 'Unfreeze Card' : 'Freeze Card'}
            </button>
            <button
              onClick={() => setShowCvv(!showCvv)}
              className="py-2 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-gray-200 border border-white/10 flex items-center justify-center gap-1.5 transition"
            >
              {showCvv ? <EyeOff size={13} /> : <Eye size={13} />}
              {showCvv ? 'Hide CVV' : 'View CVV'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── SERVICES SCREEN (Full catalog of services from Krungthai style) ────────
export function ServicesScreen({
  go,
  lang,
  theme = 'light',
}: {
  go: (s: Screen) => void
  lang: Language
  theme?: ThemeMode
}) {
  const serviceCategories = [
    {
      titleEn: 'Money Movement & Cash',
      titleMm: 'ငွေလွှဲနှင့် ငွေသားဝန်ဆောင်မှုများ',
      items: [
        { id: 'send' as Screen, nameEn: 'P2P Transfer', nameMm: 'ဖေ့သာအချင်းချင်း ငွေလွှဲ', desc: 'Instant 0-fee domestic transfers', icon: ArrowUpRight, color: 'text-blue-400 bg-blue-500/20' },
        { id: 'cashout' as Screen, nameEn: 'Agent Cash-Out', nameMm: 'အေးဂျင့်မှ ငွေသားထုတ်ယူ', desc: 'Physical cash at Sittwe, Mrauk-U, Kyaukpyu', icon: Store, color: 'text-emerald-400 bg-emerald-500/20' },
        { id: 'receive' as Screen, nameEn: 'My Arakan QR (AK QR)', nameMm: 'မိမိ QR ဖြင့် ငွေလက်ခံ', desc: 'Personal and merchant receiving code', icon: QrCode, color: 'text-amber-400 bg-amber-500/20' },
      ],
    },
    {
      titleEn: 'Global Banking & Remittance',
      titleMm: 'နိုင်ငံတကာငွေလွှဲနှင့် ဘဏ်လုပ်ငန်း',
      items: [
        { id: 'intl' as Screen, nameEn: 'Wise Global Wire', nameMm: 'Wise ပြည်ပငွေလွှဲ', desc: 'Thailand, Malaysia, Singapore, USA, Europe', icon: Globe, color: 'text-cyan-400 bg-cyan-500/20' },
        { id: 'intl' as Screen, nameEn: 'Visa / Mastercard Top-Up', nameMm: 'နိုင်ငံတကာကတ်ဖြင့် ငွေသွင်း', desc: 'Top up with Visa, Master, AMEX, PayPal', icon: CreditCard, color: 'text-red-400 bg-red-500/20' },
      ],
    },
    {
      titleEn: 'Digital Assets & Arakan Retail',
      titleMm: 'ဒစ်ဂျစ်တယ်ဒင်္ဂါးနှင့် အရောင်းစနစ်',
      items: [
        { id: 'crypto' as Screen, nameEn: 'Binance & MEXC Bridge', nameMm: 'Binance / MEXC ချိတ်ဆက်မှု', desc: 'Direct 0-fee crypto deposit and withdrawal', icon: Coins, color: 'text-purple-400 bg-purple-500/20' },
        { id: 'crypto' as Screen, nameEn: 'Instant Swap', nameMm: 'USDT မှ ချက်ချင်းလဲလှယ်', desc: '1:1 Guaranteed liquidity parity', icon: RefreshCw, color: 'text-amber-400 bg-amber-500/20' },
        { id: 'pos' as Screen, nameEn: 'Merchant POS Terminal', nameMm: 'ကုန်သည် POS အရောင်းစနစ်', desc: 'Register with dynamic QR and thermal receipt', icon: Terminal, color: 'text-orange-400 bg-orange-500/20' },
      ],
    },
  ]

  return (
    <div className={`flex h-full flex-col overflow-y-auto ${th.root(theme)}`}>
      <ScreenHeader
        title={lang === 'ak' ? 'ဘဏ္ဍာရေး ဝန်ဆောင်မှုများ' : 'All Financial Services'}
        subtitle="Péthar Platform Directory"
        theme={theme}
      />

      <div className="p-4 space-y-5">
        {serviceCategories.map((cat, i) => (
          <div key={i} className="space-y-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              {lang === 'ak' ? cat.titleMm : cat.titleEn}
            </h3>
            <div className="space-y-2">
              {cat.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => go(item.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${th.card(theme)} ${th.cardHover(theme)} hover:border-amber-500/30`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${th.textMain(theme)}`}>
                        {lang === 'ak' ? item.nameMm : item.nameEn}
                      </div>
                      <div className="text-[10px] text-gray-400">{item.desc}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-500" />
                </button>
              ))}
            </div>
          </div>
        ))}
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
  const [editName, setEditName] = useState(currentProfile.name)
  const [editEmail, setEditEmail] = useState(currentProfile.email)
  const [editPhone, setEditPhone] = useState(currentProfile.phone)
  const [editPetharId, setEditPetharId] = useState(currentProfile.petharId)
  const [editLocation, setEditLocation] = useState(currentProfile.location)
  const [saveToast, setSaveToast] = useState(false)

  const [autoSaveSlip, setAutoSaveSlip] = useState(true)
  const [twoFactorAuth, setTwoFactorAuth] = useState(true)

  const t = translations[lang]

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    const updated: UserProfile = {
      name: editName.trim() || currentProfile.name,
      email: editEmail.trim() || currentProfile.email,
      phone: editPhone.trim() || currentProfile.phone,
      petharId: editPetharId.trim() || currentProfile.petharId,
      location: editLocation.trim() || currentProfile.location,
      accountTier: currentProfile.accountTier,
      avatarUrl: currentProfile.avatarUrl,
    }
    if (setProfile) {
      setProfile(updated)
    }
    setLocalProfile(updated)
    setEditModalOpen(false)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 3000)
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
          <span>{t.profileUpdated}</span>
        </div>
      )}

      <div className="p-4 space-y-5">
        {/* ── SECTION 1: ACCOUNT SETTING ──────────────────────────────── */}
        <div>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 px-1 ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>
            {t.accountSetting}
          </h2>

          <div className={`rounded-3xl border overflow-hidden shadow-sm divide-y ${
            isLight
              ? 'bg-white border-gray-100 divide-gray-100'
              : 'bg-[#131B26] border-white/5 divide-white/5'
          }`}>
            {/* 1. Profile Information -> opens Edit Personal Data modal */}
            <button
              onClick={() => {
                setEditName(currentProfile.name)
                setEditEmail(currentProfile.email)
                setEditPhone(currentProfile.phone)
                setEditPetharId(currentProfile.petharId)
                setEditLocation(currentProfile.location)
                setEditModalOpen(true)
              }}
              className={`w-full p-4 flex items-center justify-between text-left transition ${
                isLight ? 'hover:bg-gray-50 active:bg-gray-100' : 'hover:bg-white/5 active:bg-white/10'
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
              <div className={`flex items-center p-1 rounded-xl border ${
                isLight ? 'bg-gray-100 border-gray-200' : 'bg-black/40 border-white/10'
              }`}>
                <button
                  onClick={() => setLang && setLang('ak')}
                  className={`flex items-center justify-center p-1.5 rounded-lg transition ${
                    lang === 'ak'
                      ? 'bg-red-700 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="ရခိုင်ဘာသာ"
                  aria-label="ရခိုင်ဘာသာ"
                >
                  <FlagArakan size={15} />
                </button>
                <button
                  onClick={() => setLang && setLang('en')}
                  className={`flex items-center justify-center p-1.5 rounded-lg transition ${
                    lang === 'en'
                      ? 'bg-blue-800 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="English"
                  aria-label="English"
                >
                  <FlagInternational size={15} />
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
                onClick={() => setAutoSaveSlip(!autoSaveSlip)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 p-0.5 flex items-center shrink-0 ${
                  autoSaveSlip ? 'bg-[#FF5722] justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
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
              className={`w-full p-4 flex items-center justify-between text-left transition ${
                isLight ? 'hover:bg-gray-50' : 'hover:bg-white/5'
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

          <div className={`rounded-3xl border overflow-hidden shadow-sm divide-y ${
            isLight
              ? 'bg-white border-gray-100 divide-gray-100'
              : 'bg-[#131B26] border-white/5 divide-white/5'
          }`}>
            {/* 1. Change PIN */}
            <button
              onClick={() => alert(lang === 'ak' ? '၆ လုံး လျှို့ဝှက်ကုဒ် (PIN) အသစ် ပြောင်းလဲရန် ညွှန်ကြားချက် ပို့ပြီးပါပြီ' : 'Instructions sent to reset your 6-digit transaction PIN')}
              className={`w-full p-4 flex items-center justify-between text-left transition ${
                isLight ? 'hover:bg-gray-50' : 'hover:bg-white/5'
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
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition tracking-wider ${
                  twoFactorAuth
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

      {/* ── EDIT PERSONAL DATA MODAL ─────────────────────────────────── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl border ${
            isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#101724] border-white/10 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <User size={18} className="text-orange-500" />
                <h3 className="font-bold text-sm">{t.editProfile}</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 font-semibold ${
                    isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                  {t.emailAddress}
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 font-semibold ${
                    isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                  {t.phoneNumber}
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 font-semibold font-mono ${
                    isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                  {t.petharId}
                </label>
                <input
                  type="text"
                  value={editPetharId}
                  onChange={(e) => setEditPetharId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 font-semibold font-mono ${
                    isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                  {t.locationTownship}
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 font-semibold ${
                    isLight ? 'bg-gray-50 border-gray-200 text-black' : 'bg-black/40 border-white/10 text-white'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
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
                  {t.saveChanges}
                </button>
              </div>
            </form>
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
          setSlipRefId(`ARAK-P2P-${Date.now().toString().slice(-6)}`)
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
            refId={slipRefId || 'ARAK-P2P-984210'}
            amount={parseFloat(amount) || 0}
            recipientName={contact.name}
            recipientId={contact.id}
            senderName="Jack Halder"
            senderId="ARAK-8891-JACK"
            fee={0.0}
            autoSaved={true}
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
  const uidNumber = '000000000000'

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
      text: `${currentProfile.name} (${usernameHandle}) · UID: ${uidNumber}`,
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
      {/* Top Header: < | Receive | (Share) */}
      {!embedded && (
        <div className="bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-200/80 sticky top-0 z-20">
          <button
            type="button"
            onClick={() => go && go('home')}
            aria-label="Back"
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-800 hover:bg-zinc-100 transition cursor-pointer"
          >
            <ChevronRight size={22} className="rotate-180" />
          </button>

          <h1 className="text-base font-extrabold text-zinc-900 tracking-tight">
            {isAk ? 'ငွေလက်ခံရန်' : 'Receive'}
          </h1>

          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-full border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 inline-flex items-center gap-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <Share2 size={13} className="text-[#D91624]" />
            <span>{sharedQr ? (isAk ? 'မျှဝေပြီး' : 'Shared') : isAk ? 'မျှဝေရန်' : 'Share'}</span>
          </button>
        </div>
      )}

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-5 text-center space-y-4">
        {/* 1. App Logo (Circular) + App Name */}
        <div className="flex flex-col items-center space-y-1.5">
          <div className="w-14 h-14 rounded-full bg-white border border-zinc-200 shadow-xs flex items-center justify-center p-2">
            <img
              src="/pethar-logo-red-white.svg"
              alt="Péthar Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-sm font-extrabold text-zinc-900 tracking-tight">
            Péthar
          </div>
        </div>

        {/* 2. User Name & @username */}
        <div className="space-y-0.5">
          <div className="text-lg font-extrabold text-zinc-900 leading-tight">
            {currentProfile.name}
          </div>
          <div className="text-xs font-semibold text-zinc-500 font-mono">
            {usernameHandle}
          </div>
        </div>

        {/* 3. QR Box */}
        <div className="p-5 bg-white rounded-3xl border-2 border-zinc-200/90 shadow-[0_10px_28px_rgba(15,23,42,0.06)] flex items-center justify-center">
          <FakeQR size={184} value={`pethar://pay?uid=${uidNumber}&user=${usernameHandle}&curr=AKD`} />
        </div>

        {/* 4. UID Number */}
        <div className="pt-0.5">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            UID Number
          </div>
          <div className="text-base font-extrabold font-mono tracking-widest text-zinc-900 mt-0.5 tabular-nums">
            {uidNumber}
          </div>
        </div>

        {/* 5. Bottom Buttons: [ copy UID ] & [ Save ] */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] pt-2">
          <button
            type="button"
            onClick={handleCopyUid}
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            {copiedUid ? (
              <Check size={15} className="text-emerald-600" />
            ) : (
              <Copy size={15} className="text-zinc-700" />
            )}
            <span>{copiedUid ? (isAk ? 'ကူးယူပြီး' : 'Copied') : 'copy UID'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveQr}
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition cursor-pointer"
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
  const uidNumber = '000000000000'

  const handleShareQr = async () => {
    const shareData = {
      title: 'Péthar Receive QR',
      text: `${currentProfile.name} (${usernameHandle}) · UID: ${uidNumber}`,
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
        className={`px-4 pt-4 pb-3 flex items-center justify-between border-b ${
          tab === 'scan'
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
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition cursor-pointer ${
              flashEnabled
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
            className={`text-xs font-bold ${
              tab === 'scan' ? 'text-[#D91624]' : 'text-zinc-800'
            }`}
          >
            {isAk ? 'စကင်ဖတ်' : 'Scan'}
          </span>
          <span
            className={`w-9 h-0.5 rounded-full ${
              tab === 'scan' ? 'bg-[#D91624]' : 'bg-transparent'
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
            className={`text-xs font-bold ${
              tab === 'myqr' ? 'text-[#D91624]' : 'text-zinc-800'
            }`}
          >
            MyQR
          </span>
          <span
            className={`w-9 h-0.5 rounded-full ${
              tab === 'myqr' ? 'bg-[#D91624]' : 'bg-transparent'
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
  lang = 'ak',
  theme = 'light',
}: {
  lang?: Language
  theme?: ThemeMode
}) {
  const [filter, setFilter] = useState<'all' | 'transaction' | 'system' | 'promotion'>('all')
  const { list, unread } = useNotifications()
  const isLight = theme === 'light'

  const filtered = list.filter((n) => filter === 'all' || n.type === filter)
  const groups = [...new Set(filtered.map((n) => n.dateGroup))]

  const typeIcon = (n: NotiItem) => {
    const base = 'relative w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5'
    if (n.type === 'transaction')
      return (
        <div className={`${base} ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/15 border-emerald-500/30'}`}>
          <ArrowLeftRight size={15} className="text-emerald-500" />
          {!n.read && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />}
        </div>
      )
    if (n.type === 'system')
      return (
        <div className={`${base} ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/15 border-amber-500/30'}`}>
          <AlarmClock size={15} className="text-amber-500" />
          {!n.read && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />}
        </div>
      )
    return (
      <div className={`${base} ${isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/15 border-blue-500/30'}`}>
        <Megaphone size={15} className="text-blue-500" />
        {!n.read && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />}
      </div>
    )
  }

  const pills: { id: typeof filter; label: string; mm: string }[] = [
    { id: 'all', label: 'All', mm: 'အားလုံး' },
    { id: 'transaction', label: 'Transaction', mm: 'ငွေလွှဲ' },
    { id: 'system', label: 'System', mm: 'စနစ်' },
    { id: 'promotion', label: 'Promotion', mm: 'ပရိုမိုးရှင်း' },
  ]

  return (
    <div className={`flex h-full flex-col overflow-y-auto select-none ${th.root(theme)}`}>
      {/* Header */}
      <div className={`sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b backdrop-blur-md ${
        isLight ? 'bg-white/90 border-gray-200' : 'bg-[#090D14]/90 border-white/10'
      }`}>
        <h2 className={`text-base font-bold tracking-wide ${th.textMain(theme)}`}>
          {lang === 'ak' ? 'အသိပေးချက်များ' : 'Notifications'}
        </h2>

        {/* Live unread counter — synced with the home bell */}
        <div className={`min-w-[26px] h-6 px-1.5 rounded-lg border-2 flex items-center justify-center text-[10px] font-bold ${
          unread > 0
            ? 'border-red-500/70 text-red-500'
            : isLight ? 'border-gray-300 text-gray-400' : 'border-white/30 text-gray-400'
        }`}>
          {unread}
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-4 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {pills.map((p) => (
          <button
            key={p.id}
            onClick={() => setFilter(p.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 shrink-0 ${
              filter === p.id
                ? 'bg-amber-500 text-black shadow-sm'
                : isLight
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-white/[0.07] text-gray-300 hover:bg-white/10'
            }`}
          >
            {lang === 'ak' ? p.mm : p.label}
          </button>
        ))}
      </div>

      {/* Mark all as read */}
      <div className="px-4 pt-2.5 text-right">
        <button
          onClick={markAllRead}
          disabled={unread === 0}
          className={`text-xs font-semibold transition ${
            unread === 0 ? 'text-gray-500 cursor-default' : 'text-red-500 hover:underline'
          }`}
        >
          {lang === 'ak' ? 'အားလုံး ဖတ်ပြီးဟု မှတ်သား' : 'Mark all as read'}
        </button>
      </div>

      {/* Feed grouped by date */}
      {groups.map((g) => (
        <div key={g}>
          <div className={`px-4 pt-4 pb-2 text-sm font-bold tracking-tight ${th.textMain(theme)}`}>{g}</div>
          <div className={`divide-y ${th.divide(theme)} pb-2`}>
            {filtered
              .filter((n) => n.dateGroup === g)
              .map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full px-4 py-3 text-left transition ${
                    isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.03]'
                  } ${n.read ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {typeIcon(n)}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-bold leading-snug ${th.textMain(theme)}`}>
                        {lang === 'ak' ? n.titleMm : n.titleEn}
                      </h3>
                      <p className={`text-xs leading-relaxed mt-1 ${th.textSub(theme)}`}>
                        {lang === 'ak' ? n.bodyMm : n.bodyEn}
                      </p>
                      <div className="text-[11px] text-gray-500 mt-1.5 font-mono">{n.time}</div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className={`flex-1 flex flex-col items-center justify-center gap-2 py-16 ${th.textSub(theme)}`}>
          <Bell size={28} className="opacity-40" />
          <div className="text-xs font-semibold">
            {lang === 'ak' ? 'အသိပေးချက် မရှိပါ' : 'No notifications in this category'}
          </div>
        </div>
      )}

      <div className="pb-8" />
    </div>
  )
}
