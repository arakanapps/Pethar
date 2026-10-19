import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import { ArakanEmblem } from '../../components/ArakanEmblem';
import type { Language } from '../../i18n';
import {
  Wallet, CreditCard, QrCode, CheckCircle2,
  Lock, Download, Zap, Globe, Repeat,
  ShieldCheck, Check, Sparkles, ChevronDown
} from 'lucide-react';

interface PayPageProps {
  lang: Language;
}

export const PayPage = ({ lang }: PayPageProps) => {
  // Checkout simulator state
  const [payMethod, setPayMethod] = useState<'balance' | 'card' | 'qr'>('balance');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const billAmount = 45.0;

  const handlePay = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setPaySuccess(true);
    }, 1200);
  };

  const handleReset = () => {
    setPaySuccess(false);
    setIsAuthorizing(false);
  };

  const t = lang === 'ak'
    ? {
        badge: 'လျင်မြန်သော ငွေပေးချေမှုစနစ်',
        heroTitle: 'ဖေ့သာ ပေး (Péthar Pay) - တစ်ချက်နှိပ် ချက်ချင်းငွေပေးချေမှု',
        heroSubtitle: 'ဖုန်း၊ ဝဘ်ဆိုက်နှင့် ဆိုင်များတွင် အာရက္ခဒေါ်လာဖြင့် ၀% ဝန်ဆောင်ခ အခမဲ့ စက္ကန့်ပိုင်းအတွင်း ငွေပေးချေနိုင်ပါသည်',
        demoTitle: 'ဖေ့သာ ပေး ငွေပေးချေမှု စမ်းသပ်ခန်း',
        demoDesc: 'အွန်လိုင်းစတိုးများတွင် ဖေ့သာဖြင့် လွယ်ကူလျင်မြန်စွာ ငွေရှင်းနည်းကို စမ်းသပ်ပါ',
        merchantName: 'အာရက္ခ ဆိုလာနှင့် ဂြိုဟ်တုဆက်သွယ်ရေး',
        orderDesc: 'စတားလင့်ခ် ဂြိုဟ်တုအင်တာနက် လစဉ်ကြေး',
        totalDue: 'ကျသင့်ငွေ စုစုပေါင်း',
        methodBalance: 'ဖေ့သာ လက်ကျန်ငွေဖြင့် ရှင်းမည် (အခမဲ့)',
        methodCard: 'ဖေ့သာ ဗီဇာကတ် (•••• 0921)',
        methodQr: 'Arakan QR ဖြင့် စကင်ဖတ်မည်',
        payButton: 'ဖေ့သာဖြင့် ချက်ချင်းငွေပေးချေမည်',
        authorizing: 'ဇီဝလုံခြုံရေးဖြင့် အတည်ပြုနေပါသည်...',
        paidSuccess: 'ငွေပေးချေမှု အောင်မြင်ပြီးစီးပါသည်!',
        downloadReceipt: 'ပြေစာ ဒေါင်းလုဒ်လုပ်မည်',
        resetDemo: 'နောက်ထပ် ငွေပေးချေမှု စမ်းသပ်ရန်',
        pillarsTitle: 'ဖေ့သာ ပေး ၏ အဓိက အင်္ဂါရပ် ၄ ချက်',
        p1Title: 'အခမဲ့ P2P ငွေလွှဲခြင်း',
        p1Desc: 'ဖုန်းနံပါတ် သို့မဟုတ် Péthar ID ဖြင့် မည်သည့်အခကြေးငွေမျှမရှိဘဲ ချက်ချင်းလွှဲပို့နိုင်ပါသည်',
        p2Title: 'နိုင်ငံတကာမှ တိုက်ရိုက်လက်ခံခြင်း',
        p2Desc: 'ထိုင်း (PromptPay)၊ မလေးရှားနှင့် ကမ္ဘာအရပ်ရပ်မှ အာရက္ခဒေါ်လာသို့ တိုက်ရိုက်ရောက်ရှိပါသည်',
        p3Title: 'လစဉ်ကြေးနှင့် အသုံးစရိတ်များ အလိုအလျောက်ပေးချေခြင်း',
        p3Desc: 'လျှပ်စစ်၊ ဆိုလာ၊ ရေနှင့် အင်တာနက်ကြေးများကို အချိန်မီ ပေးချေနိုင်ပါသည်',
        p4Title: 'လုံခြုံစိတ်ချရသော ကုန်သွယ်မှု အာမခံစနစ်',
        p4Desc: 'ငါး၊ ပုစွန်၊ စိုက်ပျိုးရေးနှင့် တန်ဖိုးကြီးကုန်ပစ္စည်းများအတွက် Smart Escrow ကာကွယ်မှု',
        faqTitle: 'မကြာခဏ မေးလေ့ရှိသော မေးခွန်းများ',
      }
    : {
        badge: 'Instant Digital Checkout',
        heroTitle: 'Péthar Pay - Frictionless One-Click Payments',
        heroSubtitle: 'Instant, zero-fee payment processing for web checkouts, mobile apps, and physical points of sale',
        demoTitle: 'Péthar Pay Interactive Checkout Demo',
        demoDesc: 'Experience how consumers pay merchants effortlessly across the Arakan digital economy',
        merchantName: 'Arakan Solar & Satellite Infrastructure Co.',
        orderDesc: 'Starlink High-Speed Satellite Monthly Access',
        totalDue: 'Total Amount Due',
        methodBalance: 'Péthar Account Balance (Instant · 0 Fee)',
        methodCard: 'Péthar Virtual Visa (•••• 0921)',
        methodQr: 'Arakan QR Scanner',
        payButton: 'Pay with Péthar',
        authorizing: 'Authenticating Biometrics & Enclave...',
        paidSuccess: 'Payment Authorized & Settled!',
        downloadReceipt: 'Download Tax Invoice',
        resetDemo: 'Simulate Another Checkout',
        pillarsTitle: 'The 4 Pillars of Péthar Pay',
        p1Title: 'Zero-Fee Citizen P2P',
        p1Desc: 'Instant person-to-person money transfers with zero network commissions using phone number or ID.',
        p2Title: 'Direct Inward Remittances',
        p2Desc: 'Seamlessly receive wires from Thailand (PromptPay), Malaysia, Singapore, UK, and US into AKD.',
        p3Title: 'Recurring Utility Auto-Pay',
        p3Desc: 'Automate essential billing for solar micro-grids, Starlink satellite data, and municipal water.',
        p4Title: 'Smart Escrow Protection',
        p4Desc: 'Cryptographically protected escrow for seafood exports, precious gemstones, and machinery.',
        faqTitle: 'Frequently Asked Questions',
      };

  const faqs = [
    {
      qEn: 'How quickly are payments settled with Péthar Pay?',
      qMm: 'ဖေ့သာ ပေး ဖြင့် ငွေပေးချေပါက မည်မျှမြန်ဆန်ပါသနည်း?',
      aEn: 'Every payment is finalized in under 1 second directly on the Byzantine-consensus ledger, providing immediate cleared funds to the merchant.',
      aMm: 'ငွေပေးချေမှုတိုင်းသည် ၁ စက္ကန့်အတွင်း ဗဟိုငွေစာရင်းတွင် ချက်ချင်းပြီးစီးပြီး ကုန်သည်ထံ တိုက်ရိုက်ငွေရောက်ရှိပါသည်။'
    },
    {
      qEn: 'Are there any hidden fees for customers or merchants?',
      qMm: 'သုံးစွဲသူ သို့မဟုတ် ကုန်သည်များအတွက် လျှို့ဝှက်ဝန်ဆောင်ခ ရှိပါသလား?',
      aEn: 'No. Domestic P2P and merchant payments in AKD have a 0.00% fee. Cross-border FX conversions use transparent mid-market rates without hidden spreads.',
      aMm: 'လုံးဝမရှိပါ။ ပြည်တွင်း AKD ငွေပေးချေမှုများသည် ၀.၀၀% ဝန်ဆောင်ခ အခမဲ့ဖြစ်ပြီး နိုင်ငံတကာငွေလဲလှယ်ရာတွင်လည်း ပွင့်လင်းမြင်သာသောနှုန်းထားများကိုသာ သုံးစွဲပါသည်။'
    },
    {
      qEn: 'Can I pay merchants if there is an internet or telecommunication outage?',
      qMm: 'အင်တာနက်လိုင်း ပြတ်တောက်နေချိန်တွင် ငွေပေးချေနိုင်ပါသလား?',
      aEn: 'Yes. Péthar Pay includes an encrypted Bluetooth/NFC offline mesh protocol allowing signed transaction vouchers to clear as soon as either device re-connects.',
      aMm: 'ပေးချေနိုင်ပါသည်။ အော့ဖ်လိုင်း ဘလူးတုသ်နှင့် NFC စနစ်ပါဝင်သောကြောင့် အင်တာနက်လိုင်းမရှိချိန်တွင်လည်း လုံခြုံစွာ ငွေရှင်းနိုင်ပါသည်။'
    }
  ];

  return (
    <BaseLayout
      title={t.heroTitle}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t.heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-2xl leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-800 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>&lt; 1s Finality</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-amber-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Zero Citizen Fees</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sky-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>100% Reserve Backed</span>
              </span>
            </div>
          </div>
        </div>

        {/* Interactive 1-Click Checkout Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Explanation Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.demoTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {t.demoDesc}
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Frictionless 1-Click Pay</div>
                  <div className="text-slate-500">No cumbersome 16-digit card typing or 3DS SMS lag</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Secure Enclave Authentication</div>
                  <div className="text-slate-500">Authorizes transactions via biometric TouchID/FaceID</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Instant Ledger Receipt</div>
                  <div className="text-slate-500">Cryptographically verifiable on the ledger</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Modal Widget Card */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              {paySuccess ? (
                /* Payment Success View */
                <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {t.paidSuccess}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {t.merchantName}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 text-xs font-mono space-y-2 text-left border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Paid:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{billAmount.toFixed(2)} ₳</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Method:</span>
                      <span className="font-bold text-amber-500 uppercase">{payMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ledger Hash:</span>
                      <span className="text-slate-500 text-[10px]">0x78ab...12cc</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-emerald-500 font-bold">SETTLED ✓</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      {t.resetDemo}
                    </button>
                    <button
                      onClick={() => alert('Tax invoice downloaded successfully.')}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloadReceipt}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Checkout Form View */
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <ArakanEmblem size={28} variant="badge" />
                      <span className="font-black text-sm tracking-wider text-slate-900 dark:text-white">Péthar Pay</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      256-BIT ENCLAVE
                    </span>
                  </div>

                  {/* Merchant & Order Summary */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="text-[11px] text-slate-400">{t.merchantName}</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{t.orderDesc}</div>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-medium">{t.totalDue}</span>
                      <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                        {billAmount.toFixed(2)} ₳
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Select Payment Method
                    </label>

                    <button
                      type="button"
                      onClick={() => setPayMethod('balance')}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        payMethod === 'balance'
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {t.methodBalance}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Available: 0.00 ₳
                          </div>
                        </div>
                      </div>
                      {payMethod === 'balance' && <Check className="w-4 h-4 text-amber-500" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayMethod('card')}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        payMethod === 'card'
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {t.methodCard}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Visa Platinum · Expires 12/29
                          </div>
                        </div>
                      </div>
                      {payMethod === 'card' && <Check className="w-4 h-4 text-amber-500" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayMethod('qr')}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        payMethod === 'qr'
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {t.methodQr}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Point device camera
                          </div>
                        </div>
                      </div>
                      {payMethod === 'qr' && <Check className="w-4 h-4 text-amber-500" />}
                    </button>
                  </div>

                  {/* Pay Button */}
                  <button
                    disabled={isAuthorizing}
                    onClick={handlePay}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {isAuthorizing ? (
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4 animate-spin" />
                        <span>{t.authorizing}</span>
                      </span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>{t.payButton} · {billAmount.toFixed(2)} ₳</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Pillars of Péthar Pay */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
            {t.pillarsTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold mb-4">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{t.p1Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t.p1Desc}</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center font-bold mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{t.p2Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t.p2Desc}</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold mb-4">
                <Repeat className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{t.p3Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t.p3Desc}</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{t.p4Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t.p4Desc}</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
            {t.faqTitle}
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center text-left text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{lang === 'ak' ? faq.qMm : faq.qEn}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed animate-in fade-in">
                    {lang === 'ak' ? faq.aMm : faq.aEn}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};