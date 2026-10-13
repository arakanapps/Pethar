import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import { ArakanEmblem } from '../../components/ArakanEmblem';
import type { Language } from '../../i18n';
import { transactions, initialUserProfile, liveFxRates } from '../../data';
import { redirectToSubdomain } from '../../utils/subdomain';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, QrCode, CreditCard,
  ShieldCheck, Send, CheckCircle, Search, User, LogOut,
  Eye, EyeOff
} from 'lucide-react';

interface AppPageProps {
  lang: Language;
}

export const AppPage = ({ lang }: AppPageProps) => {
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [filterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  const profile = initialUserProfile;
  const balance = 14850.0;

  const t = lang === 'ak'
    ? {
        portalTitle: 'ဖေ့သာ သုံးစွဲသူ ပေါ်တယ်',
        customerBadge: 'အတည်ပြုပြီး သုံးစွဲသူ',
        welcome: 'မင်္ဂလာပါ',
        idLabel: 'ဖေ့သာ ID',
        balanceLabel: 'အာရက္ခဒေါ်လာ စုစုပေါင်း လက်ကျန်ငွေ',
        reserveVerified: '၁၀၀% ရွှေနှင့် ဒေါ်လာ အာမခံဘဏ္ဍာတိုက် အတည်ပြုပြီး',
        quickActions: 'ငွေကြေးလုပ်ဆောင်ချက်များ',
        actionSend: 'ငွေလွှဲမည်',
        actionReceive: 'ငွေလက်ခံ QR',
        actionWallet: 'ဝဘ်ပိုက်ဆံအိတ် သုံးရန်',
        actionCard: 'ဒစ်ဂျစ်တယ်ကတ်',
        actionPlatform: 'ကုမ္ပဏီစနစ်',
        recentTransactions: 'လတ်တလော ငွေစာရင်းမှတ်တမ်းများ',
        allCategories: 'အားလုံး',
        searchPlaceholder: 'မှတ်တမ်း ရှာဖွေရန်...',
        noTransactions: 'ငွေစာရင်းမှတ်တမ်း မတွေ့ပါ',
        connectedCard: 'ဖေ့သာ ဗီဇာ/မာစတာကတ်',
        cardHolder: 'ကတ်ပိုင်ရှင်',
        accountOverview: 'အကောင့်အချက်အလက်',
        township: 'နေရပ်ဒေသ',
        phone: 'ဖုန်းနံပါတ်',
        email: 'အီးမေးလ်',
        tier: 'အကောင့်အဆင့်',
        logout: 'အကောင့်ထွက်မည်',
        sendModalTitle: 'သုံးစွဲသူ အချင်းချင်း ငွေလွှဲပို့ခြင်း',
        recipientPlaceholder: 'ဖုန်း သို့မဟုတ် PeThar ID (ဥပမာ ARAK-8891)',
        amountPlaceholder: 'ငွေပမာဏ (AKD)',
        sendButton: 'ချက်ချင်းငွေလွှဲမည်',
        sendSuccessNotice: 'ငွေလွှဲခြင်း အောင်မြင်ပြီးစီးပါသည်!',
        close: 'ပိတ်မည်',
        qrModalTitle: 'ငွေလက်ခံရန် Arakan QR ကုဒ်',
        qrScanHint: 'ငွေလွှဲပို့သူအား ဤ QR ကုဒ်ကို စကင်ဖတ်စေပြီး တိုက်ရိုက်ငွေလက်ခံပါ',
      }
    : {
        portalTitle: 'PeThar Customer Portal',
        customerBadge: 'Verified Citizen Customer',
        welcome: 'Welcome back',
        idLabel: 'PeThar ID',
        balanceLabel: 'Total Arakan Dollar (AKD) Balance',
        reserveVerified: '100% Backed by Tier-1 Gold & USD Reserves',
        quickActions: 'Quick Financial Services',
        actionSend: 'Send Money',
        actionReceive: 'Receive QR',
        actionWallet: 'Launch Wallet',
        actionCard: 'Digital Card',
        actionPlatform: 'Platform Ops',
        recentTransactions: 'Recent Ledger Postings',
        allCategories: 'All Categories',
        searchPlaceholder: 'Search transactions...',
        noTransactions: 'No transactions found',
        connectedCard: 'PeThar International Card',
        cardHolder: 'Cardholder',
        accountOverview: 'Customer Account Details',
        township: 'Township / Region',
        phone: 'Phone Number',
        email: 'Email Address',
        tier: 'Citizen Tier',
        logout: 'Log Out',
        sendModalTitle: 'Transfer to Customer',
        recipientPlaceholder: 'Enter Phone or PeThar ID',
        amountPlaceholder: 'Amount in AKD',
        sendButton: 'Transfer Immediately',
        sendSuccessNotice: 'Transfer settled successfully!',
        close: 'Close',
        qrModalTitle: 'My Arakan QR Payment Code',
        qrScanHint: 'Show this QR to the sender to receive instant AKD payments',
      };

  const filteredTxns = transactions.filter((tx) => {
    const matchesCat = filterCategory === 'all' || tx.category === filterCategory;
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.titleMm.includes(searchQuery) ||
      tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendRecipient || !sendAmount) return;
    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setShowSendModal(false);
      setSendRecipient('');
      setSendAmount('');
    }, 1500);
  };

  return (
    <BaseLayout
      title={t.portalTitle}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-8">
        {/* Customer Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 dark:from-slate-900 dark:to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            {/* Customer Identity */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg border-2 border-white/20">
                {profile.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {t.welcome}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {t.customerBadge}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                  {profile.name}
                </h1>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                  <span>{t.idLabel}:</span>
                  <span className="font-bold text-amber-400">{profile.petharId}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Logout */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => redirectToSubdomain('wallet')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition"
              >
                <Wallet className="w-4 h-4" />
                <span>{t.actionWallet}</span>
              </button>
              <button
                onClick={() => redirectToSubdomain('login')}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-white/10 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          </div>

          {/* Balance Spotlight */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{t.balanceLabel}</span>
                <button
                  onClick={() => setBalanceHidden(!balanceHidden)}
                  className="hover:text-white transition"
                  aria-label="Toggle balance visibility"
                >
                  {balanceHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                <span>₳</span>
                <span>{balanceHidden ? '••••••' : balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[11px] font-mono text-amber-400 mt-1">
                ≈ ${balanceHidden ? '••••' : balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-center">
              <div className="text-xs text-slate-400 mb-1">
                {lang === 'ak' ? 'အာရက္ခဒေါ်လာ ငွေလဲလှယ်နှုန်း' : 'Official Exchange Peg'}
              </div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                1.00 ₳ = 1.0000 USDT = $1.00 USD
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span>{t.reserveVerified}</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-center">
              <div className="text-xs text-slate-400 mb-1">
                {lang === 'ak' ? 'လက်မှတ်ရ အေးဂျင့်ကွန်ရက်' : 'Arakan Agent Access'}
              </div>
              <div className="text-sm font-bold text-white">
                Sittwe Central · Mrauk-U · Kyaukphyu
              </div>
              <div className="text-[11px] text-amber-400 mt-1">
                {lang === 'ak' ? 'ငွေသား အချိန်မရွေး ထုတ်ယူနိုင်ပါသည်' : '0% fee domestic physical cash withdrawal'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setShowSendModal(true)}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-lg transition flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Send className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {t.actionSend}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ak' ? 'ဖုန်း/ID ဖြင့် လွှဲမည်' : 'P2P zero-fee transfer'}
            </span>
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-lg transition flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {t.actionReceive}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ak' ? 'မိမိ၏ QR ကုဒ်' : 'My Arakan QR'}
            </span>
          </button>

          <button
            onClick={() => redirectToSubdomain('card')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-lg transition flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {t.actionCard}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ak' ? 'နိုင်ငံတကာ ဒက်ဘစ်ကတ်' : 'Multi-currency Visa'}
            </span>
          </button>

          <button
            onClick={() => redirectToSubdomain('wallet')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-lg transition flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {t.actionWallet}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ak' ? 'အပြည့်အစုံ ဖွင့်မည်' : 'Full Banking Suite'}
            </span>
          </button>
        </div>

        {/* Customer Details & Connected Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              <span>{t.accountOverview}</span>
            </h2>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t.idLabel}</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{profile.petharId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t.phone}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{profile.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t.email}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{profile.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t.township}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{profile.location}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">{t.tier}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Tier 2 Verified ✓</span>
              </div>
            </div>
          </div>

          {/* Virtual Card Graphic */}
          <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-6 border border-amber-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ArakanEmblem size={28} variant="badge" />
                  <span className="font-black tracking-wider text-sm">PeThar Debit</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-amber-300 border border-white/10">
                  VISA PLATINUM
                </span>
              </div>
              <div className="font-mono text-lg tracking-widest text-slate-200 mb-4">
                4829 •••• •••• 9014
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end text-xs">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">{t.cardHolder}</div>
                  <div className="font-bold font-mono text-white mt-0.5">{profile.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">EXPIRES</div>
                  <div className="font-mono font-bold text-white mt-0.5">12/29</div>
                </div>
              </div>
            </div>
          </div>

          {/* Currency Peg & Foreign Corridors */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                {lang === 'ak' ? 'နိုင်ငံတကာ ငွေလွှဲစင်္ကြံများ' : 'Cross-Border Corridors'}
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                {lang === 'ak'
                  ? 'ထိုင်း၊ မလေးရှား၊ စင်ကာပူ၊ အမေရိကန်တို့မှ အာရက္ခဒေါ်လာသို့ တိုက်ရိုက်လက်ခံနိုင်ပါသည်'
                  : 'Direct inward wires from Wise, Payoneer, PayPal, and regional bank corridors'}
              </p>
              <div className="space-y-2 text-xs font-mono">
                {liveFxRates.slice(0, 3).map((fx) => (
                  <div key={fx.pair} className="flex justify-between items-center py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{fx.pair}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{fx.rate}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => redirectToSubdomain('global')}
              className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
            >
              {lang === 'ak' ? 'ငွေလဲနှုန်းများ အားလုံးကြည့်ရန်' : 'View Global Rates'}
            </button>
          </div>
        </div>

        {/* Recent Ledger Postings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {t.recentTransactions}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'ak' ? 'လုံခြုံစိတ်ချရသော အာရက္ခဒေါ်လာ စာရင်းမှတ်တမ်း' : 'Real-time settled ledger transactions'}
              </p>
            </div>

            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Transactions List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTxns.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {t.noTransactions}
              </div>
            ) : (
              filteredTxns.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.amount > 0 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 'bg-red-50 dark:bg-red-950/40 text-red-600'
                    }`}>
                      {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {lang === 'ak' ? tx.titleMm : tx.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {tx.counterparty} · {tx.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-black font-mono ${
                      tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} ₳
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              {t.sendModalTitle}
            </h3>

            {sendSuccess ? (
              <div className="py-8 text-center text-emerald-600 font-bold flex flex-col items-center gap-2">
                <CheckCircle className="w-12 h-12" />
                <span>{t.sendSuccessNotice}</span>
              </div>
            ) : (
              <form onSubmit={handleSendSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'ak' ? 'လွှဲမည့်သူ' : 'Recipient'}
                  </label>
                  <input
                    type="text"
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    placeholder={t.recipientPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'ak' ? 'ငွေပမာဏ' : 'Amount'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder={t.amountPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSendModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    {t.close}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition"
                  >
                    {t.sendButton}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* My QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
              {t.qrModalTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {t.qrScanHint}
            </p>
            {/* Visual QR Code Display */}
            <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200 inline-block mb-3">
              <div className="w-48 h-48 bg-slate-950 rounded-xl p-3 flex flex-col justify-between text-white">
                <div className="flex justify-between items-center text-[10px] font-bold text-amber-400">
                  <span>ARAKAN QR</span>
                  <span>AKD</span>
                </div>
                <div className="flex items-center justify-center">
                  <ArakanEmblem size={64} variant="badge" />
                </div>
                <div className="text-[10px] font-mono text-center text-slate-300">
                  {profile.petharId}
                </div>
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mb-4">
              {profile.petharId}
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </BaseLayout>
  );
};