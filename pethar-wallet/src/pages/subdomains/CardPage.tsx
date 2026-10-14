import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import { ArakanEmblem } from '../../components/ArakanEmblem';
import type { Language } from '../../i18n';
import {
  CreditCard, ShieldCheck, Zap, Globe, Radio,
  Lock, ArrowRight, Eye, EyeOff
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface CardPageProps {
  lang: Language;
}

export const CardPage = ({ lang }: CardPageProps) => {
  const [cardType, setCardType] = useState<'virtual' | 'physical'>('virtual');
  const [isFrozen, setIsFrozen] = useState(false);
  const [showNumber, setShowNumber] = useState(false);
  const [spendingLimit, setSpendingLimit] = useState(3000);

  const t = lang === 'ak'
    ? {
        heroTitle: 'PeThar ဒစ်ဂျစ်တယ်နှင့် ရုပ်ပိုင်းဆိုင်ရာ ကတ်များ',
        heroSubtitle: 'ကမ္ဘာတစ်ဝှမ်း မည်သည့်နေရာတွင်မဆို အာရက္ခဒေါ်လာဖြင့် လွယ်ကူစွာ သုံးစွဲနိုင်သော ဒက်ဘစ်ကတ်စနစ်',
        orderVirtual: 'ဒစ်ဂျစ်တယ်ကတ် ချက်ချင်းရယူမည်',
        orderPhysical: 'ရုပ်ပိုင်းဆိုင်ရာကတ် မှာယူမည်',
        cardHolder: 'ကတ်ပိုင်ရှင် အမည်',
        validThru: 'သက်တမ်းကုန်ဆုံးရက်',
        freezeLabel: 'ကတ် လုံခြုံရေး ပိတ်ထားခြင်း (Freeze)',
        unfreezeLabel: 'ကတ် ပုံမှန် အသုံးပြုနိုင်ခြင်း (Active)',
        limitLabel: 'လစဉ် အွန်လိုင်း သုံးစွဲခွင့် ကန့်သတ်ချက်',
        feature1Title: 'နိုင်ငံတကာ သုံးစွဲနိုင်မှု',
        feature1Desc: 'Apple Pay, Google Pay နှင့် ကမ္ဘာတစ်ဝှမ်း Visa ကုန်သည်များတွင် တိုက်ရိုက်ငွေပေးချေနိုင်ပါသည်',
        feature2Title: 'အလိုအလျောက် ငွေလဲလှယ်နှုန်း',
        feature2Desc: 'AKD မှ ဒေသတွင်းငွေကြေးများ (THB, SGD, USD, EUR) သို့ အနိမ့်ဆုံး စရိတ်ဖြင့် အလိုအလျောက် တွက်ချက်ပေးပါသည်',
        feature3Title: 'အက်ပ်အတွင်း ချက်ချင်းထိန်းချုပ်မှု',
        feature3Desc: 'ကတ် ပျောက်ဆုံးပါက စက္ကန့်ပိုင်းအတွင်း Freeze လုပ်နိုင်ပြီး သုံးစွဲခွင့် ပမာဏကို စိတ်ကြိုက် ပြင်ဆင်နိုင်ပါသည်',
        feature4Title: 'ချက်ချင်းထုတ်ပေးသော ဒစ်ဂျစ်တယ်ကတ်',
        feature4Desc: 'အကောင့်ဖွင့်ပြီးသည်နှင့် ချက်ချင်း စတင်သုံးစွဲနိုင်ပြီး လိပ်စာသို့ ရုပ်ပိုင်းဆိုင်ရာ ကတ်ကိုလည်း ပို့ဆောင်ပေးပါသည်',
      }
    : {
        heroTitle: 'PeThar Global Debit & Virtual Cards',
        heroSubtitle: 'Spend your Arakan Dollars anywhere in the world with Visa acceptance and Apple Pay',
        orderVirtual: 'Issue Instant Virtual Card',
        orderPhysical: 'Order Physical Card',
        cardHolder: 'CARD HOLDER NAME',
        validThru: 'VALID THRU',
        freezeLabel: 'Card Security Freeze',
        unfreezeLabel: 'Card Active & Protected',
        limitLabel: 'Monthly Spending Ceiling',
        feature1Title: 'Global Acceptance',
        feature1Desc: 'Accepted at over 80 million Visa terminals, online websites, and global ATMs worldwide',
        feature2Title: 'Dynamic FX Conversion',
        feature2Desc: 'Automatic real-time conversion from AKD to local currencies with zero hidden markups',
        feature3Title: 'In-App Security Controls',
        feature3Desc: 'Freeze and unfreeze in 1 click, toggle contactless payments, and adjust spending limits instantly',
        feature4Title: 'Instant Issuance + Physical Card',
        feature4Desc: 'Create ready-to-use virtual cards in 5 seconds and receive sleek NFC physical cards delivered to your door',
      };

  return (
    <BaseLayout
      title={t.heroTitle}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-12 max-w-6xl mx-auto">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-500/20 text-xs font-mono font-bold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
            <span>PeThar Card rails · Visa & Apple Pay</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => redirectToSubdomain('wallet')}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span>{t.orderVirtual}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => redirectToSubdomain('app')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs font-mono shadow-2xs transition-all"
            >
              {t.orderPhysical}
            </button>
          </div>
        </div>

        {/* Interactive Card Canvas (SxDx Bank & Revolut style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          
          {/* Left: 3D Iridescent Card Visualizer */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Card Type Selector Pills */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6 text-xs font-mono font-bold">
              <button
                onClick={() => setCardType('virtual')}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  cardType === 'virtual' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Virtual Card (Apple Pay)
              </button>
              <button
                onClick={() => setCardType('physical')}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  cardType === 'physical' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Physical Platinum Card
              </button>
            </div>

            {/* The SxDx Iridescent Credit Card */}
            <div className={`w-full max-w-[420px] rounded-3xl p-6 sm:p-7 text-white shadow-2xl transition-all duration-300 relative min-h-[240px] flex flex-col justify-between ${
              isFrozen
                ? 'bg-slate-800 grayscale opacity-80'
                : cardType === 'virtual'
                  ? 'sxdx-credit-card'
                  : 'bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 border border-amber-500/30'
            }`}>
              {/* Card Header: Chip, Contactless, Logo */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  {/* EMV Chip */}
                  <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-200 to-amber-400 border border-amber-300 shadow-inner flex items-center justify-center">
                    <div className="w-7 h-4 border border-amber-600/50 rounded-xs" />
                  </div>
                  <Radio size={20} className="text-white/90 rotate-90" />
                </div>
                <div className="flex items-center gap-2">
                  <ArakanEmblem size={26} variant="badge" />
                  <span className="font-mono text-xs font-extrabold tracking-wider text-white">PeThar Pay</span>
                </div>
              </div>

              {/* Card Number with Reveal Toggle */}
              <div className="my-5 flex items-center justify-between">
                <span className="font-mono text-lg sm:text-xl font-bold tracking-widest text-white drop-shadow-sm">
                  {showNumber ? '3829 4820 4629 5025' : '•••• •••• •••• 5025'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowNumber(!showNumber)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                  title="Toggle card number visibility"
                >
                  {showNumber ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Card Footer: Holder & Expiry */}
              <div className="flex items-end justify-between text-xs font-mono relative z-10">
                <div>
                  <div className="text-[9px] text-white/70 uppercase">{t.cardHolder}</div>
                  <div className="font-bold tracking-wider uppercase text-sm mt-0.5">JACK HALDER</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-white/70 uppercase">{t.validThru}</div>
                  <div className="font-bold tracking-wider mt-0.5">09/28</div>
                </div>
                <div className="text-base font-black italic tracking-tighter text-white">
                  VISA
                </div>
              </div>
            </div>

            {/* Frozen Notice */}
            {isFrozen && (
              <div className="mt-3 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-mono font-bold flex items-center gap-1.5">
                <Lock size={12} />
                <span>Card is temporarily frozen</span>
              </div>
            )}
          </div>

          {/* Right: Interactive Security & Spending Controls */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Real-Time Card Governance
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Instant cryptographic enclave parameter controls
              </p>
            </div>

            {/* Freeze Toggle Control */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">
                  {isFrozen ? t.freezeLabel : t.unfreezeLabel}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Block online and physical POS usage
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFrozen(!isFrozen)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isFrozen ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isFrozen ? 'translate-x-5' : ''
                }`} />
              </button>
            </div>

            {/* Spending Ceiling Slider */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 font-bold">{t.limitLabel}</span>
                <span className="font-black text-slate-900">${spendingLimit} AKD</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={spendingLimit}
                onChange={(e) => setSpendingLimit(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>$500 min</span>
                <span>$10,000 max</span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="space-y-2 text-xs font-mono text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Apple Secure Enclave & Android Keystore Binding</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Zero Foreign Transaction Surcharges</span>
              </div>
            </div>

            <button
              onClick={() => redirectToSubdomain('wallet')}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-mono transition shadow-sm text-center"
            >
              Manage Card in Web Banking
            </button>
          </div>

        </div>

        {/* 4 Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">{t.feature1Title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t.feature1Desc}</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">{t.feature2Title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t.feature2Desc}</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">{t.feature3Title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t.feature3Desc}</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">{t.feature4Title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t.feature4Desc}</p>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};