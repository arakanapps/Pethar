import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  Users, ShieldCheck, CheckCircle2, Lock,
  Star, ChevronRight, Zap
} from 'lucide-react';

interface P2PPageProps {
  lang: Language;
}

interface P2POffer {
  id: string;
  trader: string;
  rating: string;
  tradesCount: number;
  type: 'buy' | 'sell';
  fiatCurrency: string;
  rate: string;
  limit: string;
  methods: string[];
}

export const P2PPage = ({ lang }: P2PPageProps) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [selectedOffer, setSelectedOffer] = useState<P2POffer | null>(null);
  const [escrowStep, setEscrowStep] = useState<'idle' | 'locked' | 'confirmed'>('idle');

  const offers: P2POffer[] = [
    {
      id: 'p2p-1',
      trader: 'Ko Kyaw Zin (Bangkok Direct)',
      rating: '99.8%',
      tradesCount: 1420,
      type: 'buy',
      fiatCurrency: 'THB',
      rate: '36.85 THB / ₳',
      limit: '1,000 - 50,000 THB',
      methods: ['KBank', 'SCB Easy', 'PromptPay']
    },
    {
      id: 'p2p-2',
      trader: 'Daw Nilar Win (Mae Sot Hub)',
      rating: '100%',
      tradesCount: 890,
      type: 'buy',
      fiatCurrency: 'THB',
      rate: '36.88 THB / ₳',
      limit: '5,000 - 150,000 THB',
      methods: ['PromptPay', 'Cash Mae Sot']
    },
    {
      id: 'p2p-3',
      trader: 'U Aung Kyaw (Sittwe Port Exchange)',
      rating: '99.4%',
      tradesCount: 2310,
      type: 'buy',
      fiatCurrency: 'MMK',
      rate: '4,450 MMK / ₳',
      limit: '500,000 - 30,000,000 MMK',
      methods: ['KPay', 'WavePay', 'Cash In-Person']
    },
    {
      id: 'p2p-4',
      trader: 'Arakan Global SG Desk',
      rating: '100%',
      tradesCount: 540,
      type: 'sell',
      fiatCurrency: 'SGD',
      rate: '1.34 SGD / ₳',
      limit: '200 - 10,000 SGD',
      methods: ['PayNow', 'DBS Fast']
    }
  ];

  const filteredOffers = offers.filter(o => o.type === activeTab);

  const t = lang === 'ak'
    ? {
        badge: 'PeThar P2P လွတ်လပ်သော ငွေလဲလှယ်ရေးကွန်ရက် · 0% Intermediary Fee',
        heroTitle: 'အာရက္ခသား အချင်းချင်း တိုက်ရိုက် အရောင်းအဝယ် ပြုလုပ်ပါ',
        heroSubtitle: 'ကြားခံပွဲစားမလိုဘဲ ရွှေအာမခံ multi-sig escrow စနစ်ဖြင့် လုံခြုံစိတ်ချစွာ ဘတ်၊ ကျပ်၊ စင်ကာပူဒေါ်လာများဖြင့် တိုက်ရိုက် လဲလှယ်နိုင်ပါသည်',
        tabBuy: '₳ (AKD) ဝယ်ယူမည်',
        tabSell: '₳ (AKD) ရောင်းချမည်',
        trader: 'ကုန်သည် အမည်',
        rate: 'လဲလှယ်နှုန်း',
        limits: 'ကန့်သတ် ပမာဏ',
        paymentMethods: 'ငွေပေးချေမှု နည်းလမ်းများ',
        actionTrade: 'တိုက်ရိုက် လဲလှယ်မည်',
        escrowNoticeTitle: '100% Multi-Sig Escrow အကာအကွယ်',
        escrowNoticeDesc: 'အရောင်းအဝယ်ပြုလုပ်ချိန်တွင် ရောင်းချသူ၏ ငွေကြေးကို စမတ်ကန်ထရိုက်ထဲတွင် သော့ခတ်ထားပြီး ဝယ်သူ ငွေလွှဲလက်ခံရရှိမှသာ လွှဲပြောင်းပေးပါသည်',
        simulateTrade: 'Escrow စမ်းသပ်မှု စတင်မည်',
        tradeLocked: 'ငွေကြေးများကို Escrow Vault တွင် သော့ခတ်ထားပါပြီ',
        tradeCompleted: 'အရောင်းအဝယ် အောင်မြင်စွာ ပြီးမြောက်ပါပြီ!',
      }
    : {
        badge: 'PeThar Direct Peer-to-Peer Protocol · Zero Platform Fees',
        heroTitle: 'Decentralized Peer-to-Peer Trading Desk',
        heroSubtitle: 'Trade Arakan Dollars directly with verified diaspora and regional merchants with 100% smart contract escrow protection',
        tabBuy: 'Buy ₳ (AKD)',
        tabSell: 'Sell ₳ (AKD)',
        trader: 'Merchant',
        rate: 'Unit Rate',
        limits: 'Trading Limits',
        paymentMethods: 'Payment Rails',
        actionTrade: 'Initiate P2P Swap',
        escrowNoticeTitle: 'Cryptographic Multi-Sig Escrow Lock',
        escrowNoticeDesc: 'The seller\'s Arakan Dollars are locked into an on-chain escrow contract before you transfer fiat. Funds are only released upon mutual confirmation or dispute arbitration.',
        simulateTrade: 'Simulate Escrow Trade',
        tradeLocked: 'Escrow Lock Engaged: Funds Secured in Vault',
        tradeCompleted: 'Trade Successfully Settled to Wallet!',
      };

  const handleStartTrade = (offer: P2POffer) => {
    setSelectedOffer(offer);
    setEscrowStep('locked');
    setTimeout(() => {
      setEscrowStep('confirmed');
    }, 1500);
  };

  return (
    <BaseLayout
      title={t.heroTitle}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-16 max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-500/20 text-xs font-mono font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex justify-center pt-2">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => { setActiveTab('buy'); setSelectedOffer(null); setEscrowStep('idle'); }}
                className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                  activeTab === 'buy'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.tabBuy}
              </button>
              <button
                onClick={() => { setActiveTab('sell'); setSelectedOffer(null); setEscrowStep('idle'); }}
                className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                  activeTab === 'sell'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.tabSell}
              </button>
            </div>
          </div>
        </div>

        {/* Escrow Active Modal / Simulation Banner */}
        {selectedOffer && (
          <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
                  <Lock className="w-4 h-4" />
                  <span>Escrow Active · Order #P2P-90148</span>
                </div>
                <h3 className="text-lg font-black text-white">Trading with {selectedOffer.trader}</h3>
                <p className="text-xs text-slate-400 font-mono">Rate: {selectedOffer.rate} • Limit: {selectedOffer.limit}</p>
              </div>
              <div className="flex items-center gap-2">
                {escrowStep === 'locked' && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 font-mono text-xs font-bold border border-amber-400/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    <span>{t.tradeLocked}</span>
                  </span>
                )}
                {escrowStep === 'confirmed' && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.tradeCompleted}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* P2P Order Book Listing */}
        <div className="space-y-4">
          <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/60 transition-colors"
              >
                {/* Trader Info */}
                <div className="space-y-1.5 max-w-xs">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-950">{offer.trader}</h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {offer.rating}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400">{offer.tradesCount} completed settlements (100% dispute free)</p>
                </div>

                {/* Rate & Limits */}
                <div className="space-y-1">
                  <p className="text-xs font-mono text-slate-500">{t.rate}</p>
                  <p className="text-lg font-black text-slate-950 font-mono">{offer.rate}</p>
                  <p className="text-[11px] font-mono text-slate-400">{t.limits}: {offer.limit}</p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-1.5">
                  <p className="text-xs font-mono text-slate-500">{t.paymentMethods}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {offer.methods.map((method, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleStartTrade(offer)}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 shrink-0"
                >
                  <span>{t.actionTrade}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Escrow Guarantee Banner */}
        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-900 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-950">{t.escrowNoticeTitle}</h3>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed mt-0.5">
                {t.escrowNoticeDesc}
              </p>
            </div>
          </div>
        </div>

        {/* P2P Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <Zap className="w-6 h-6 text-amber-600 mb-2" />
            <h4 className="text-base font-black text-slate-950">Zero Platform Gas</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Neither buyer nor seller pays transaction commission. Network operates peer-to-peer at true zero fee.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <Lock className="w-6 h-6 text-emerald-600 mb-2" />
            <h4 className="text-base font-black text-slate-950">Timelock Protection</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trades are protected by 15-minute countdown locks with automatic dispute referral to sovereign arbiters if needed.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <Users className="w-6 h-6 text-sky-600 mb-2" />
            <h4 className="text-base font-black text-slate-950">Diaspora Mesh</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct settlement liquidity between Arakan, Thailand, Malaysia, Singapore, and Europe without banking friction.
            </p>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};