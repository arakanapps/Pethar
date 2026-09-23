import {
  transactions, wallets, contacts, agents, inboundConversionRails,
  initialUserProfile, type UserProfile
} from './data'
import {
  ArrowUpRight, ArrowDownLeft, QrCode, Store, Eye, EyeOff,
  ChevronLeft, ChevronRight, Copy, Check,
  Fingerprint, ScanLine, Globe, Coins, Settings as SettingsIcon,
  Clock, Sparkles, Terminal, CreditCard, Lock,
  Plus, X, LogOut, Shield, HelpCircle,
  TrendingUp, FileText, RefreshCw, Download,
  Receipt, Wallet, User, Sun, Moon, KeyRound, ShieldCheck
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { FakeQR } from './components/FakeQR'
import { ArakanEmblem } from './components/ArakanEmblem'
import { TransactionSlip } from './components/TransactionSlip'
import type { Language } from './i18n'
import { translations } from './i18n'

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

// ── Shared Header ───────────────────────────────────────────────────────
export function ScreenHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string
  subtitle?: string
  onBack: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-white/10 bg-[#090D14]/80 backdrop-blur-md">
      <button
        onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-xl transition active:scale-95 bg-white/10 hover:bg-white/15 text-white"
      >
        <ChevronLeft size={18} />
      </button>
      <div>
        <div className="text-[15px] font-bold text-white tracking-wide">{title}</div>
        {subtitle && <div className="text-[11px] text-amber-300 font-medium">{subtitle}</div>}
      </div>
    </div>
  )
}

export function Keypad({
  value,
  onChange,
  symbol = '₳',
}: {
  value: string
  onChange: (v: string) => void
  symbol?: string
}) {
  const press = (k: string) => {
    if (k === '⌫') onChange(value.slice(0, -1))
    else if (k === '.' && value.includes('.')) return
    else if (value === '0' && k !== '.') onChange(k)
    else if (value.length < 10) onChange(value + k)
  }

  return (
    <div>
      <div className="flex items-baseline justify-center gap-1.5 py-4">
        <span className="text-2xl font-bold text-amber-400">{symbol}</span>
        <span className="text-4xl font-extrabold text-white font-mono tabular-nums">{value || '0'}</span>
        <span className="text-xs text-amber-300/80 font-bold ml-1">AKD</span>
      </div>
      <div className="grid grid-cols-3 gap-2 px-6 pb-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className="h-12 rounded-xl text-lg font-bold text-white transition active:scale-95 bg-white/[0.08] hover:bg-white/[0.12] border border-white/5"
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

const fmtAkd = (n: number) => `₳ ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ── HOME SCREEN (Inspired by Krungthai NEXT modern layout) ─────────────────
export function Home({
  go,
  lang,
  onOpenLegal,
}: {
  go: (s: Screen) => void
  lang: Language
  onOpenLegal: (doc: 'terms' | 'privacy' | 'guidelines' | 'fx') => void
}) {
  const t = translations[lang]
  const [hidden, setHidden] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(true)
  const w = wallets[0]

  // 8 Quick Service items (mirroring Krungthai NEXT 8-service layout)
  const quickServices = [
    { id: 'send' as Screen, label: lang === 'arak' ? 'ငွေလွှဲ' : 'Transfer', icon: ArrowUpRight, color: 'bg-blue-600/30 text-blue-400' },
    { id: 'intl' as Screen, label: lang === 'arak' ? 'ငွေဖြည့်' : 'Top Up', icon: Plus, color: 'bg-amber-500/30 text-amber-400' },
    { id: 'pos' as Screen, label: lang === 'arak' ? 'ဘေလ်ဆောင်' : 'Pay Bills', icon: Receipt, color: 'bg-red-500/30 text-red-400' },
    { id: 'cashout' as Screen, label: lang === 'arak' ? 'ငွေသားထုတ်' : 'Cash Out', icon: Store, color: 'bg-emerald-500/30 text-emerald-400' },
    { id: 'crypto' as Screen, label: lang === 'arak' ? 'ဒင်္ဂါးဘဏ္ဍာ' : 'Crypto Vault', icon: Coins, color: 'bg-purple-500/30 text-purple-400' },
    { id: 'account' as Screen, label: lang === 'arak' ? 'ငွေစာရင်း' : 'Account', icon: Wallet, color: 'bg-cyan-500/30 text-cyan-400' },
    { id: 'pos' as Screen, label: lang === 'arak' ? 'ကုန်သည် POS' : 'Merchant POS', icon: Terminal, color: 'bg-orange-500/30 text-orange-400' },
    { id: 'receive' as Screen, label: lang === 'arak' ? 'မိမိ QR' : 'My QR', icon: QrCode, color: 'bg-rose-500/30 text-rose-400' },
  ]

  // Krungthai NEXT style favorites contacts
  const favorites = [
    { name: 'MYAT SOE', mm: 'မြတ်စိုး', id: 'ARAK-1024', initials: 'MS', bg: 'bg-blue-600' },
    { name: 'TONY', mm: 'တိုနီ', id: 'ARAK-9921', initials: 'TN', bg: 'bg-emerald-600' },
    { name: 'CIMB WIRE', mm: 'စီအိုင်အမ်ဘီ', id: 'ARAK-5501', initials: 'CB', bg: 'bg-red-600' },
    { name: 'KO MIN AUNG', mm: 'မင်းအောင်', id: 'ARAK-8891', initials: 'MA', bg: 'bg-amber-600' },
  ]

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#090D14] text-white">
      {/* Top Header Card */}
      <div className="px-5 pb-5 pt-3 bg-gradient-to-b from-[#2A080C] via-[#1A0A10] to-[#0E1522] rounded-b-[32px] border-b border-red-950/60 shadow-xl">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <ArakanEmblem size={34} variant="badge" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-wider">{t.appName}</span>
                <span className="rounded-full px-2 py-0.5 text-[8px] font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {t.tierVerified}
                </span>
              </div>
              <div className="text-[10px] text-red-200/70">{t.appSubtitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => go('settings')}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-gray-300 transition"
              title="Settings"
            >
              <SettingsIcon size={16} />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="pt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-300">
            <span>{lang === 'arak' ? w.labelMm : w.labelEn}</span>
            <button onClick={() => setHidden(!hidden)} className="text-gray-400 hover:text-white transition">
              {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>

          <div className="pt-1 text-[32px] font-black text-white font-mono tracking-tight tabular-nums drop-shadow">
            {hidden ? (
              '• • • • • •'
            ) : (
              <>
                <span className="text-amber-400 text-2xl font-bold mr-1">{w.symbol}</span>
                {w.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xs font-bold text-amber-400/90 ml-1.5">{w.currency}</span>
              </>
            )}
          </div>

          {/* AKD Only Sovereign Vault Badge */}
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-semibold">
            <Sparkles size={12} className="text-amber-400" />
            <span>{t.autoConvertBadge}</span>
          </div>
        </div>
      </div>

      {/* Auto-Convert Notice Banner */}
      <div className="mx-4 mt-3 p-3 rounded-2xl bg-[#121A28] border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
        <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 text-[11px] leading-relaxed">
          <strong className="text-amber-300 font-bold block mb-0.5">
            {lang === 'arak' ? 'အာရက္ခဒေါ်လာ (AKD) သီးသန့် သိုလှောင်ခြင်း' : 'AKD Sovereign Single-Currency Vault'}
          </strong>
          {t.autoConvertNotice}
        </div>
      </div>

      {/* Krungthai NEXT style Announcement Banner */}
      {bannerVisible && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
          <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px] leading-relaxed">
            <strong className="text-amber-300 font-bold block mb-0.5">
              {lang === 'arak' ? 'အာရက္ခဗဟိုဘဏ် အသိပေးချက်' : 'Bank of Arakan Notice'}
            </strong>
            {lang === 'arak'
              ? 'စက်တင်ဘာ ၂၄ ရက် နံနက် ၀၁:၀၀-၀၆:၀၀ တွင် စာရင်းစနစ် အဆင့်မြှင့်မည်ဖြစ်ပါသည်။ အော့ဖ်လိုင်းဘောက်ချာများ အသုံးပြုနိုင်ပါသည်။'
              : 'PeThar will undergo sovereign ledger upgrade on 24 Sep 2026 from 01:00-06:00 AM. Offline vouchers remain active.'}
          </div>
          <button onClick={() => setBannerVisible(false)} className="text-amber-400/80 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Krungthai NEXT style 8-Services Grid */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-2.5">
          {quickServices.map((qs, i) => (
            <button
              key={i}
              onClick={() => go(qs.id)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-white/5 active:scale-95 transition"
            >
              <div className={`w-11 h-11 rounded-2xl ${qs.color} flex items-center justify-center shadow-md`}>
                <qs.icon size={20} strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-semibold text-gray-200 text-center leading-tight">
                {qs.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Krungthai NEXT style Favorites Row */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-bold text-gray-300">
            {lang === 'arak' ? 'စိတ်ကြိုက် လွှဲသူများ' : 'Favorites'}
          </span>
          <button onClick={() => go('send')} className="text-[11px] font-bold text-amber-400 hover:underline">
            {lang === 'arak' ? 'အားလုံး' : 'View all'}
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {favorites.map((fav, i) => (
            <button
              key={i}
              onClick={() => go('send')}
              className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition"
            >
              <div className={`w-12 h-12 rounded-full ${fav.bg} flex items-center justify-center font-bold text-xs text-white shadow-md border-2 border-[#131B26] group-hover:brightness-110`}>
                {fav.initials}
              </div>
              <span className="text-[10px] text-gray-300 font-medium truncate w-14 text-center">
                {lang === 'arak' ? fav.mm : fav.name}
              </span>
            </button>
          ))}

          {/* Add New Favorite Button */}
          <button
            onClick={() => go('send')}
            className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white border-2 border-dashed border-white/20">
              <Plus size={18} />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Add</span>
          </button>
        </div>
      </div>

      {/* Recent Ledger Postings */}
      <div className="px-4 pt-4 pb-6">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-bold text-gray-400">{t.recentTransactions}</span>
          <button
            onClick={() => onOpenLegal('fx')}
            className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            {lang === 'arak' ? 'ငွေလဲနှုန်းဘုတ်' : 'FX Board'}
          </button>
        </div>

        <div className="rounded-2xl bg-[#131B26] border border-white/5 overflow-hidden divide-y divide-white/5">
          {transactions.map((txn) => (
            <div key={txn.id} className="p-3 flex items-center justify-between hover:bg-white/[0.02] transition">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    txn.amount > 0
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : txn.category === 'cashout'
                      ? 'bg-amber-500/20 text-amber-400'
                      : txn.category === 'crypto'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {txn.amount > 0 ? (
                    <ArrowDownLeft size={16} />
                  ) : txn.category === 'cashout' ? (
                    <Store size={16} />
                  ) : txn.category === 'crypto' ? (
                    <Coins size={16} />
                  ) : (
                    <ArrowUpRight size={16} />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white line-clamp-1">
                    {lang === 'arak' ? txn.titleMm : txn.title}
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <span>{txn.time}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono text-[9px]">{txn.status}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-xs font-bold font-mono ${
                    txn.amount > 0 ? 'text-emerald-400' : 'text-white'
                  }`}
                >
                  {txn.amount > 0 ? '+' : ''}
                  {fmtAkd(txn.amount)}
                </div>
                <div className="text-[9px] text-gray-500 font-mono">{txn.hash}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── ACCOUNT SCREEN (Second Tab in Bottom Dock) ───────────────────────────
export function AccountScreen({
  go,
  lang,
}: {
  go: (s: Screen) => void
  lang: Language
}) {
  const [cardFrozen, setCardFrozen] = useState(false)
  const [showCvv, setShowCvv] = useState(false)
  const t = translations[lang]

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#090D14] text-white">
      <ScreenHeader
        title={lang === 'arak' ? 'မိမိ ငွေစာရင်းများနှင့် ကတ်များ' : 'My Accounts & Cards'}
        subtitle="Sovereign Arakan Dollar Enclave"
        onBack={() => go('home')}
      />

      <div className="p-4 space-y-4">
        {/* Primary Account Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2D0A0E] via-[#1A1218] to-[#111A28] border border-amber-500/40 shadow-xl">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span className="font-bold flex items-center gap-1.5">
              <Wallet size={14} />
              {lang === 'arak' ? 'အာရက္ခဒေါ်လာ အဓိကစာရင်း' : 'Arakan Dollar Sovereign Account'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
              ACTIVE
            </span>
          </div>

          <div className="mt-3">
            <div className="text-[10px] text-gray-400 font-mono">ARAK-8891-JACK</div>
            <div className="text-3xl font-extrabold font-mono text-white mt-0.5">
              ₳ 14,850.00 <span className="text-xs text-amber-400 font-sans">AKD</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-1">
              ≈ $ 14,850.00 USD (100% Reserve Backed)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => go('send')}
              className="py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-1.5 transition"
            >
              <ArrowUpRight size={14} />
              {lang === 'arak' ? 'ငွေလွှဲမည်' : 'Send Money'}
            </button>
            <button
              onClick={() => go('receive')}
              className="py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white flex items-center justify-center gap-1.5 transition"
            >
              <ArrowDownLeft size={14} />
              {lang === 'arak' ? 'ငွေလက်ခံမည်' : 'Deposit'}
            </button>
          </div>
        </div>

        {/* PeThar Sovereign Visa Debit Card Widget */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <CreditCard size={14} className="text-amber-400" />
              {lang === 'arak' ? 'ဖေ့သာ ဒစ်ဂျစ်တယ်ကတ်' : 'PeThar Sovereign Debit Card'}
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
                <span className="font-bold text-white text-xs tracking-wider">PETHAR SOVEREIGN</span>
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

        {/* Inbound Multi-Currency Auto-Conversion Engine */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <RefreshCw size={14} className="text-amber-400" />
              {lang === 'arak' ? 'နိုင်ငံခြားငွေနှင့် ဒင်္ဂါး အလိုအလျောက်လဲလှယ်စနစ်' : 'Inbound Auto-Conversion Engine'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              0% Fee
            </span>
          </div>

          <div className="p-3 mb-2 rounded-2xl bg-[#131B26] border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
            {t.autoConvertNotice}
          </div>

          <div className="space-y-2">
            {inboundConversionRails.map((rail) => (
              <div
                key={rail.asset}
                className="p-3 rounded-2xl bg-[#131B26] border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                    {rail.asset}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {lang === 'arak' ? rail.nameMm : rail.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">{rail.network}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-emerald-400">
                    {lang === 'arak' ? rail.rateTextMm : rail.rateText}
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono">
                    {rail.settlementSpeed}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bank of Arakan Global Routing / IBAN info */}
        <div className="p-4 rounded-2xl bg-[#131B26] border border-[#283852] space-y-2 font-mono text-xs">
          <div className="text-xs font-bold text-amber-400 font-sans flex items-center gap-1.5">
            <Globe size={14} />
            {lang === 'arak' ? 'အာရက္ခ နိုင်ငံတကာ IBAN စာရင်း' : 'Bank of Arakan Global IBAN'}
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-[11px]">
            <div className="text-[9px] text-gray-400 font-sans">IBAN</div>
            <div className="text-white font-bold">AK89 ARAK 0001 2345 6789 01</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <div className="text-[9px] text-gray-400 font-sans">SWIFT / BIC</div>
              <div className="text-white font-bold">ARAKMMXX</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <div className="text-[9px] text-gray-400 font-sans">Bank</div>
              <div className="text-white font-bold truncate">Bank of Arakan</div>
            </div>
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
}: {
  go: (s: Screen) => void
  lang: Language
}) {
  const serviceCategories = [
    {
      titleEn: 'Money Movement & Cash',
      titleMm: 'ငွေလွှဲနှင့် ငွေသားဝန်ဆောင်မှုများ',
      items: [
        { id: 'send' as Screen, nameEn: 'P2P Transfer', nameMm: 'ဖေ့သာအချင်းချင်း ငွေလွှဲ', desc: 'Instant 0-fee domestic transfers', icon: ArrowUpRight, color: 'text-blue-400 bg-blue-500/20' },
        { id: 'cashout' as Screen, nameEn: 'Agent Cash-Out', nameMm: 'အေးဂျင့်မှ ငွေသားထုတ်ယူ', desc: 'Physical cash at Sittwe, Mrauk-U, Kyaukpyu', icon: Store, color: 'text-emerald-400 bg-emerald-500/20' },
        { id: 'receive' as Screen, nameEn: 'My ArakanPay QR', nameMm: 'မိမိ QR ဖြင့် ငွေလက်ခံ', desc: 'Personal and merchant receiving code', icon: QrCode, color: 'text-amber-400 bg-amber-500/20' },
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
      titleEn: 'Digital Assets & Sovereign Retail',
      titleMm: 'ဒစ်ဂျစ်တယ်ဒင်္ဂါးနှင့် အရောင်းစနစ်',
      items: [
        { id: 'crypto' as Screen, nameEn: 'Binance & MEXC Bridge', nameMm: 'Binance / MEXC ချိတ်ဆက်မှု', desc: 'Direct 0-fee crypto deposit and withdrawal', icon: Coins, color: 'text-purple-400 bg-purple-500/20' },
        { id: 'crypto' as Screen, nameEn: 'Instant AKD Swap', nameMm: 'USDT မှ AKD သို့ ချက်ချင်းလဲလှယ်', desc: '1:1 Guaranteed sovereign liquidity parity', icon: RefreshCw, color: 'text-amber-400 bg-amber-500/20' },
        { id: 'pos' as Screen, nameEn: 'Merchant POS Terminal', nameMm: 'ကုန်သည် POS အရောင်းစနစ်', desc: 'Register with dynamic QR and thermal receipt', icon: Terminal, color: 'text-orange-400 bg-orange-500/20' },
      ],
    },
  ]

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#090D14] text-white">
      <ScreenHeader
        title={lang === 'arak' ? 'ဘဏ္ဍာရေး ဝန်ဆောင်မှုများ' : 'All Financial Services'}
        subtitle="PeThar Sovereign Platform Directory"
        onBack={() => go('home')}
      />

      <div className="p-4 space-y-5">
        {serviceCategories.map((cat, i) => (
          <div key={i} className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
              {lang === 'arak' ? cat.titleMm : cat.titleEn}
            </h3>
            <div className="space-y-2">
              {cat.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => go(item.id)}
                  className="w-full p-3 rounded-2xl bg-[#131B26] hover:bg-[#1A2536] border border-white/5 hover:border-amber-500/30 text-left transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {lang === 'arak' ? item.nameMm : item.nameEn}
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
  theme = 'dark',
  setTheme,
  profile,
  setProfile,
  onOpenLegal,
}: {
  go: (s: Screen) => void
  lang: Language
  setLang?: (l: Language) => void
  theme?: 'dark' | 'light'
  setTheme?: (t: 'dark' | 'light') => void
  profile?: UserProfile
  setProfile?: (p: UserProfile) => void
  onOpenLegal: (doc: 'terms' | 'privacy' | 'guidelines' | 'fx') => void
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
          {/* Circular avatar with user icon */}
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl shrink-0 border-2 border-white/30">
            <User size={34} className="text-[#32195F]" />
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
                  onClick={() => setLang && setLang('arak')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                    lang === 'arak'
                      ? 'bg-red-700 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span>ရခိုင်</span>
                </button>
                <button
                  onClick={() => setLang && setLang('en')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                    lang === 'en'
                      ? 'bg-blue-800 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
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
                onClick={() => setAutoSaveSlip(!autoSaveSlip)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 p-0.5 flex items-center shrink-0 ${
                  autoSaveSlip ? 'bg-[#FF5722] justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* 4. Dark / Light Mode Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  {isLight ? <Sun size={18} /> : <Moon size={18} />}
                </div>
                <div>
                  <div className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {t.themeSetting}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {isLight ? t.lightMode : t.darkMode}
                  </div>
                </div>
              </div>

              {/* Dark / Light Mode Segmented Toggle Buttons */}
              <div className={`flex items-center p-1 rounded-xl border ${
                isLight ? 'bg-gray-100 border-gray-200' : 'bg-black/40 border-white/10'
              }`}>
                <button
                  onClick={() => setTheme && setTheme('light')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    isLight
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="Light Mode"
                >
                  <Sun size={13} />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setTheme && setTheme('dark')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    !isLight
                      ? 'bg-[#1F2937] text-amber-300 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="Dark Mode"
                >
                  <Moon size={13} />
                  <span>Dark</span>
                </button>
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
            {/* 1. Change Password */}
            <button
              onClick={() => alert(lang === 'arak' ? 'စကားဝှက်အသစ် ပြောင်းလဲရန် SMS ကုဒ် ပို့ပေးထားပါသည်' : 'Password change OTP sent to your registered phone')}
              className={`w-full p-4 flex items-center justify-between text-left transition ${
                isLight ? 'hover:bg-gray-50' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Lock size={18} />
                </div>
                <div className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {t.changePassword}
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>

            {/* 2. Change PIN */}
            <button
              onClick={() => alert(lang === 'arak' ? '၆ လုံး လျှို့ဝှက်ကုဒ် (PIN) အသစ် ပြောင်းလဲရန် ညွှန်ကြားချက် ပို့ပြီးပါပြီ' : 'Instructions sent to reset your 6-digit transaction PIN')}
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

        {/* ── SECTION 3: LEGAL & POLICIES ─────────────────────────────── */}
        <div className={`p-4 rounded-3xl border space-y-2 text-xs ${
          isLight ? 'bg-white border-gray-100 shadow-sm' : 'bg-[#131B26] border-white/5'
        }`}>
          <h3 className={`text-xs font-bold uppercase font-mono mb-2 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
            {lang === 'arak' ? 'ဥပဒေနှင့် စည်းမျဉ်းများ' : 'Legal & Compliance'}
          </h3>

          <button
            onClick={() => onOpenLegal('terms')}
            className={`w-full flex items-center justify-between py-2 border-b text-xs ${
              isLight ? 'border-gray-100 text-gray-700 hover:text-black' : 'border-white/5 text-gray-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-amber-500" />
              <span>{lang === 'arak' ? 'အသုံးပြုမှု စည်းမျဉ်းများ' : 'Terms & Conditions'}</span>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </button>

          <button
            onClick={() => onOpenLegal('privacy')}
            className={`w-full flex items-center justify-between py-2 border-b text-xs ${
              isLight ? 'border-gray-100 text-gray-700 hover:text-black' : 'border-white/5 text-gray-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-emerald-500" />
              <span>{lang === 'arak' ? 'ကိုယ်ရေးအချက်အလက် ကာကွယ်ရေး' : 'Personal Data Protection'}</span>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </button>

          <button
            onClick={() => onOpenLegal('guidelines')}
            className={`w-full flex items-center justify-between py-2 border-b text-xs ${
              isLight ? 'border-gray-100 text-gray-700 hover:text-black' : 'border-white/5 text-gray-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle size={14} className="text-blue-500" />
              <span>{lang === 'arak' ? 'အက်ပ်အသုံးပြုနည်းနှင့် လုံခြုံရေး' : 'Application Guidelines'}</span>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </button>

          <button
            onClick={() => onOpenLegal('fx')}
            className={`w-full flex items-center justify-between py-2 text-xs ${
              isLight ? 'text-gray-700 hover:text-black' : 'text-gray-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-cyan-500" />
              <span>{lang === 'arak' ? 'အထူးနိုင်ငံခြားငွေလဲနှုန်းများ' : 'Official FX Rates Board'}</span>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </button>
        </div>

        {/* App Info & Sign Out */}
        <div className={`p-4 rounded-3xl border flex items-center justify-between text-xs ${
          isLight ? 'bg-white border-gray-100 text-gray-500 shadow-sm' : 'bg-[#131B26] border-white/5 text-gray-400'
        }`}>
          <div>
            <div className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>PeThar Sovereign v2.4.0</div>
            <div className="text-[10px]">Build 902 • Arakan Digital Authority</div>
          </div>
          <button
            onClick={() => alert(lang === 'arak' ? 'အကောင့်ထွက်ပြီးပါပြီ' : 'Logged out securely')}
            className="px-3 py-1.5 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20 flex items-center gap-1.5 hover:bg-red-600/20 transition text-xs font-bold"
          >
            <LogOut size={13} />
            {lang === 'arak' ? 'ထွက်ရန်' : 'Sign Out'}
          </button>
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
                  {lang === 'arak' ? 'မလုပ်တော့ပါ' : 'Cancel'}
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
  onSent,
}: {
  go: (s: Screen) => void
  lang: Language
  onSent?: (amt: number) => void
}) {
  const t = translations[lang]
  const [step, setStep] = useState<'who' | 'amount' | 'pin' | 'done'>('who')
  const [contact, setContact] = useState<(typeof contacts)[0] | null>(null)
  const [amount, setAmount] = useState('')
  const [pin, setPin] = useState('')
  const [customRecipient, setCustomRecipient] = useState('')

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
          setStep('done')
          if (onSent) {
            onSent(parseFloat(amount || '0'))
          }
        }, 600)
      }
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#090D14] text-white">
      <ScreenHeader
        title={t.sendTitle}
        subtitle={lang === 'arak' ? 'အာရက္ခဒေါ်လာ လွှဲပို့ခြင်း' : 'Zero-fee Sovereign Transfer'}
        onBack={() => {
          if (step === 'who' || step === 'done') go('home')
          else if (step === 'amount') setStep('who')
          else if (step === 'pin') setStep('amount')
        }}
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
                        {lang === 'arak' ? c.mm : c.name}
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
                  {lang === 'arak' ? contact.mm : contact.name}
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
              {t.sendContinue} (₳ {amount || '0'} AKD)
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
              Transfer ₳ {amount} AKD to {contact?.name}
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
            refId={`ARAK-P2P-${Date.now().toString().slice(-6)}`}
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

// ── RECEIVE SCREEN ──────────────────────────────────────────────────────
export function Receive({ go, lang }: { go: (s: Screen) => void; lang: Language }) {
  const t = translations[lang]
  const [copied, setCopied] = useState(false)
  const myId = 'ARAK-8891-JACK'

  const copyId = () => {
    navigator.clipboard?.writeText(myId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-full flex-col bg-[#090D14] text-white">
      <ScreenHeader
        title={t.receiveTitle}
        subtitle={lang === 'arak' ? 'ArakanPay စနစ်ဖြင့် လက်ခံရန်' : 'ArakanPay Verified QR'}
        onBack={() => go('home')}
      />

      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 bg-white rounded-3xl shadow-2xl">
          <FakeQR size={170} value={`pethar://pay?to=${myId}&curr=AKD`} />
        </div>

        <div>
          <div className="text-base font-bold text-white">Jack Halder</div>
          <div className="text-xs font-mono text-amber-400 mt-0.5">{myId}</div>
          <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
            {lang === 'arak'
              ? 'ဤ QR ကုဒ်ကို ပေးပို့သူအား ပြသ၍ အာရက္ခဒေါ်လာ တိုက်ရိုက်လက်ခံပါ'
              : 'Scan with PeThar Mobile to send Arakan Dollars instantly'}
          </p>
        </div>

        <button
          onClick={copyId}
          className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          {copied ? t.receiveIdCopied : t.receiveCopyId}
        </button>
      </div>
    </div>
  )
}

// ── SCAN SCREEN ─────────────────────────────────────────────────────────
export function Scan({ go, lang }: { go: (s: Screen) => void; lang: Language }) {
  const t = translations[lang]
  const [simulated, setSimulated] = useState(false)

  return (
    <div className="flex h-full flex-col bg-black text-white relative">
      <ScreenHeader
        title={t.navScan}
        subtitle={lang === 'arak' ? 'ကင်မရာ စကင်ဖတ်ရန်' : 'Scan ArakanPay or EMVCo'}
        onBack={() => go('home')}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {!simulated ? (
          <div className="space-y-6">
            <div className="relative w-64 h-64 border-2 border-dashed border-amber-400 rounded-3xl flex items-center justify-center">
              <ScanLine size={48} className="text-amber-400 animate-pulse" />
            </div>

            <p className="text-xs text-gray-400 max-w-xs">
              {lang === 'arak'
                ? 'ဆိုင် သို့မဟုတ် မိတ်ဆွေ၏ PeThar QR ကုဒ်ကို ဘောင်အတွင်းချိန်ပါ'
                : 'Align ArakanPay merchant or friend QR within frame'}
            </p>

            <button
              onClick={() => setSimulated(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition"
            >
              {lang === 'arak' ? 'စကင်ဖတ်ခြင်း သရုပ်ပြရန်' : 'Simulate QR Scan Detection'}
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-[#131B26] border border-amber-500/40 text-center space-y-3 max-w-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Store size={24} />
            </div>
            <h4 className="text-sm font-bold text-white">Shwe Sittwe Merchant Point</h4>
            <div className="text-xs font-mono text-gray-400">Terminal #AK-001 • Sittwe Strand</div>
            <button
              onClick={() => go('send')}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
            >
              {lang === 'arak' ? 'ငွေပေးချေရန် ဆက်လုပ်ပါ' : 'Proceed to Pay Merchant'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── AGENT CASH OUT SCREEN ───────────────────────────────────────────────
export function CashOut({ go, lang }: { go: (s: Screen) => void; lang: Language }) {
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
    <div className="flex h-full flex-col bg-[#090D14] text-white">
      <ScreenHeader
        title={t.cashOutTitle}
        subtitle={lang === 'arak' ? 'တရားဝင် အာရက္ခအေးဂျင့်များ' : 'Verified Agent Branch Network'}
        onBack={() => {
          if (showTotp) setShowTotp(false)
          else go('home')
        }}
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
                          {lang === 'arak' ? agt.mm : agt.name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {agt.code} • {lang === 'arak' ? agt.townshipMm : agt.township}
                        </div>
                        <div className="text-[9px] text-amber-300 font-mono mt-0.5">
                          {agt.distance} • {lang === 'arak' ? agt.floatStatusMm : `${agt.floatStatus} Cash Float`}
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
              {lang === 'arak' ? selectedAgent?.mm : selectedAgent?.name}
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
              {lang === 'arak'
                ? 'အေးဂျင့်ထံ ဤကုဒ်ပြသ၍ ငွေသားထုတ်ယူပါ။ တစ်ခါသုံးကုဒ်ဖြစ်သဖြင့် လုံခြုံစိတ်ချရပါသည်'
                : 'Show dynamic code to agent counter to withdraw physical sovereign banknotes'}
            </p>

            <button
              onClick={() => {
                alert(lang === 'arak' ? 'ငွေသားထုတ်ယူမှု အောင်မြင်ပါသည်!' : 'Cash-out withdrawal settled!')
                go('home')
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
            >
              {lang === 'arak' ? 'ငွေသားလက်ခံရရှိပါပြီ' : 'Confirm Cash Received'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
