import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  HelpCircle, Search, ChevronDown, ChevronUp, MessageSquare,
  ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface HelpPageProps {
  lang: Language;
}

export const HelpPage = ({ lang }: HelpPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const t = lang === 'ak'
    ? {
        badge: 'Péthar အကူအညီနှင့် မေးလေ့ရှိသော မေးခွန်းများ · 24/7 Knowledge Base',
        heroTitle: 'အာရက္ခ Péthar အသုံးပြုသူ အကူအညီပေးရေး ဗဟိုဌာန',
        heroSubtitle: 'ပိုက်ဆံအိတ် လုံခြုံရေး၊ အော့ဖ်လိုင်း ငွေလွှဲခြင်း၊ ရွှေအာမခံစနစ်နှင့် အကောင့်စီမံခန့်ခွဲမှု ဆိုင်ရာ မေးခွန်းများ၏ အဖြေများကို ရှာဖွေပါ',
        searchPlaceholder: 'မေးခွန်း သို့မဟုတ် အကြောင်းအရာ ရှာဖွေပါ...',
        faqTitle: 'မကြာခဏ မေးလေ့ရှိသော မေးခွန်းများနှင့် အဖြေများ',
        askSupport: 'အကူအညီ တိုက်ရိုက်ရယူမည်',
        contactUs: '၂၄/၇ Support Chat စတင်မည်',
      }
    : {
        badge: 'Péthar Help Center & Knowledge Base · 24/7 FAQ',
        heroTitle: 'How Can We Assist You Today?',
        heroSubtitle: 'Instant answers to cryptographic key recovery, 1:1 bullion reserve audits, offline BLE mesh payments, and corporate treasury management',
        searchPlaceholder: 'Search FAQs, offline mesh, gold audits, debit cards...',
        faqTitle: 'Frequently Answered Questions',
        askSupport: 'Need Direct Assistance?',
        contactUs: 'Launch Live 24/7 Chat',
      };

  const faqItems = [
    {
      q: lang === 'ak' ? 'Péthar ပိုက်ဆံအိတ်ကို မည်သို့ စတင်အသုံးပြုရမည်နည်း။' : 'How do I initialize and secure my Péthar Wallet?',
      a: lang === 'ak'
        ? 'Péthar အက်ပ်ကို ဒေါင်းလုဒ်လုပ်ပြီး မိနစ်ပိုင်းအတွင်း အကောင့်ဖွင့်နိုင်ပါသည်။ သင့်ဖုန်း၏ Hardware Secure Enclave ထဲတွင် Ed25519 သော့တွဲကို အလိုအလျောက် ထုတ်ယူပေးပြီး ဆာဗာသို့ သော့မပို့သောကြောင့် ၁၀၀% လုံခြုံမှုရှိပါသည်။'
        : 'Download Péthar from the official App Store, Google Play, or direct signed APK. During setup, your smartphone\'s Secure Enclave locally generates an Ed25519 keypair. Your private keys never touch Péthar servers.'
    },
    {
      q: lang === 'ak' ? 'အင်တာနက်နှင့် ဖုန်းလိုင်း ပြတ်တောက်နေချိန်တွင် မည်သို့ ငွေလွှဲနိုင်ပါသလဲ။' : 'How do offline payments function during internet blackouts?',
      a: lang === 'ak'
        ? 'Péthar တွင် Bluetooth Low Energy (BLE) နှင့် NFC mesh နည်းပညာ ပါဝင်သောကြောင့် အင်တာနက်မရှိချိန်တွင်လည်း ဖုန်းအချင်းချင်း ထိတွေ့ကာ သော့လက်မှတ်ထိုးထားသော ပြေစာများ ဖလှယ်နိုင်ပါသည်။ အင်တာနက် ပြန်လည်ရရှိချိန်တွင် Ledger နှင့် အလိုအလျောက် စာရင်းရှင်းပေးပါသည်။'
        : 'Péthar uses localized BLE (2.4GHz) and NFC pulses to broadcast cryptographically signed payment vouchers up to 10 meters. The recipient\'s hardware validates the monotonic counter locally, and the transaction is automatically gossiped to the main ledger once any nearby node connects to satellite or cell signals.'
    },
    {
      q: lang === 'ak' ? 'Arakan Dollar (AKD) ၏ တန်ဖိုးတည်ငြိမ်မှုနှင့် ရွှေအာမခံစနစ်က မည်သို့ရှိသနည်း။' : 'How does the 1:1 parity and gold bullion backing work?',
      a: lang === 'ak'
        ? 'ဖေ့သာရှိ AKD တိုင်းသည် 1:1 USDT အရန်ငွေကြေးနှင့် လန်ဒန်/ဘန်ကောက်ရှိ စစ်ဆေးပြီး ရွှေစင်ရွှေတုံး 999.9 တို့ဖြင့် အပြည့်အဝ အာမခံထားရှိပါသည်။ နိုင်ငံတကာ စစ်ဆေးရေးအဖွဲ့များ၏ Audit အထောက်အထားများကို /accounts နှင့် /data တွင် ပွင့်လင်းမြင်သာစွာ ကြည့်ရှုနိုင်ပါသည်။'
        : 'Every minted Arakan Dollar (AKD) is mathematically anchored 1:1 to audited USDT reserves and London physical gold bullion (999.9 purity). Real-time custody certificates and proof-of-reserves can be publicly inspected at any time on /data and /accounts.'
    },
    {
      q: lang === 'ak' ? 'ထိုင်း၊ မလေးရှား၊ စင်ကာပူမှ မိသားစုထံသို့ ငွေလွှဲပေးပို့ရာတွင် မည်မျှကြာသနည်း။' : 'How fast are remittances from Thailand, Singapore, and Europe?',
      a: lang === 'ak'
        ? 'Péthar ကွန်ရက်တွင် PromptPay, KPay, PayNow တို့ဖြင့် ချိတ်ဆက်ထားသောကြောင့် နယ်စပ်ဖြတ်ကျော် ငွေလွှဲမှုများသည် စက္ကန့် ၆၀ အတွင်း မိသားစု၏ ပိုက်ဆံအိတ်ထဲသို့ ကော်မရှင်ခ အနိမ့်ဆုံးဖြင့် တိုက်ရိုက်ရောက်ရှိပါသည်။'
        : 'Cross-border corridors (THB PromptPay, SGD PayNow, GBP FPS) settle into the recipient\'s Péthar Wallet in under 60 seconds with 0% hidden FX spread and instantaneous Arakan Dollar parity.'
    }
  ];

  const filteredFaqs = faqItems.filter(f => 
    searchQuery === '' ||
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <BaseLayout
      title={t.heroTitle}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-16 max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-500/20 text-xs font-mono font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Quick Category Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => redirectToSubdomain('wallet')}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400/50 cursor-pointer transition-all space-y-2 group"
          >
            <ShieldCheck className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-slate-950">Keys & Security</h4>
            <p className="text-[11px] text-slate-500">How to backup your seed phrase and enclave biometrics.</p>
          </div>

          <div
            onClick={() => redirectToSubdomain('offline')}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400/50 cursor-pointer transition-all space-y-2 group"
          >
            <Zap className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-slate-950">Offline Mesh</h4>
            <p className="text-[11px] text-slate-500">Transacting during network blackouts via BLE pulses.</p>
          </div>

          <div
            onClick={() => redirectToSubdomain('chat')}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400/50 cursor-pointer transition-all space-y-2 group"
          >
            <MessageSquare className="w-6 h-6 text-sky-600 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-slate-950">Live Support</h4>
            <p className="text-[11px] text-slate-500">Chat with a verified support officer 24/7.</p>
          </div>
        </div>

        {/* Accordion FAQ Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-950">{t.faqTitle}</h2>

          <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="transition-colors">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-6 flex items-center justify-between gap-4 font-bold text-xs text-slate-900 hover:text-amber-600 transition-colors"
                  >
                    <span className="text-sm font-black">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs text-slate-600 leading-relaxed font-sans border-t border-slate-50 pt-2 animate-in fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 24/7 Contact Banner */}
        <div className="p-8 rounded-3xl bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-black text-white">{t.askSupport}</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Need immediate resolution for a payment, card authorization, or account verification inquiry?
            </p>
          </div>
          <button
            onClick={() => redirectToSubdomain('chat')}
            className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xs transition-transform active:scale-95 flex items-center gap-2 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.contactUs}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </BaseLayout>
  );
};