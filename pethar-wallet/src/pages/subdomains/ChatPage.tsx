import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  MessageSquare, ShieldCheck, Send, CheckCircle2, Lock,
  ArrowRight, Clock
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface ChatPageProps {
  lang: Language;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

export const ChatPage = ({ lang }: ChatPageProps) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'm1',
      sender: 'agent',
      text: lang === 'ak'
        ? 'မင်္ဂလာပါ။ Péthar တရားဝင် သတင်းအချက်အလက်နှင့် နည်းပညာအကူအညီပေးရေးမှ ကြိုဆိုပါသည်။ မည်သည့်အရာကို သိရှိလိုပါသလဲခင်ဗျာ။'
        : 'Welcome to Péthar Sovereign Support. All communications are end-to-end encrypted with your hardware Ed25519 key. How may we assist you today?',
      time: '14:30'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const t = lang === 'ak'
    ? {
        badge: 'Péthar လုံခြုံရေးမြင့်မားသော စကားပြောခန်း · End-to-End Encrypted',
        heroTitle: 'လုံခြုံစိတ်ချရသော ၂၄/၇ Péthar အကူအညီနှင့် ဆက်သွယ်ရေး',
        heroSubtitle: 'Signal Protocol စံနှုန်းအတိုင်း သော့ခတ်ထားသော ဆက်သွယ်ရေးစနစ်ဖြင့် Péthar အဖွဲ့သားများနှင့် တိုက်ရိုက် စကားပြောဆိုနိုင်ပါသည်',
        ctaWebWallet: 'ပိုက်ဆံအိတ်သို့ သွားမည်',
        activeChannel: 'Péthar တရားဝင် အကူအညီပေးရေး ဗဟိုဌာန',
        onlineStatus: 'အွန်လိုင်းရှိသည် • ပျမ်းမျှ ပြန်ကြားချိန် < ၁ မိနစ်',
        placeholder: 'မေးခွန်း သို့မဟုတ် မက်ဆေ့ခ်ျ ရိုက်ထည့်ပါ...',
        quickQ1: 'ရွှေအရန်ငွေကြေး မည်သို့ စစ်ဆေးရမလဲ?',
        quickQ2: 'အော့ဖ်လိုင်း BLE ငွေလွှဲခြင်း ဘယ်လို အလုပ်လုပ်သလဲ?',
      }
    : {
        badge: 'End-to-End Encrypted Support Rails · Signal Protocol',
        heroTitle: 'Sovereign 24/7 Support & Direct Messaging',
        heroSubtitle: 'Direct cryptographic channels protected by Ed25519 authentication with zero server-side plaintext logging',
        ctaWebWallet: 'Open Péthar Wallet',
        activeChannel: 'Péthar Sovereign Support Desk',
        onlineStatus: 'Online • Average Response Time < 60s',
        placeholder: 'Type your inquiry or transaction ID...',
        quickQ1: 'How do I audit the 100% Gold Reserves?',
        quickQ2: 'How does offline BLE mesh function?',
      };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: MessageItem = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text,
      time: 'Just now'
    };

    setMessages(prev => [...prev, newMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply = lang === 'ak'
        ? 'ကျေးဇူးပြု၍ စောင့်ဆိုင်းပေးပါ။ သင်၏ မေးမြန်းချက်ကို စိစစ်ပြီး လိုအပ်သော အချက်အလက်များကို ချက်ချင်း ဖြေကြားပေးပါမည်။'
        : 'Thank you for your message. Your inquiry has been matched with our verification ledger. You can inspect continuous audits directly on /trade and /accounts.';

      if (text.includes('Gold') || text.includes('ရွှေ')) {
        reply = lang === 'ak'
          ? 'ဖေ့သာရှိ AKD တိုင်းသည် လန်ဒန်နှင့် ဘန်ကောက်ရှိ စစ်ဆေးပြီး ရွှေတုံး 999.9 နှင့် 1:1 USDT အပြည့်အဝ အာမခံထားရှိပါသည်။ /accounts စာမျက်နှာတွင် စစ်ဆေးနိုင်ပါသည်။'
          : 'All Arakan Dollars (AKD) maintain verifiable 100% reserve backing in London allocated bullion (999.9 Fine Gold) and 1:1 USDT reserves. View certificates under /accounts.';
      } else if (text.includes('BLE') || text.includes('အော့ဖ်လိုင်း')) {
        reply = lang === 'ak'
          ? 'အော့ဖ်လိုင်း BLE ငွေလွှဲခြင်းသည် အင်တာနက်မလိုဘဲ ဖုန်းအချင်းချင်း 10m အကွာအဝေးအတွင်း Cryptographic Vouchers ဖလှယ်ပြီး အင်တာနက်ရချိန်တွင် ပြန်လည်စာရင်းရှင်းပေးပါသည်။'
          : 'Péthar Offline BLE Mesh uses peer-to-peer 2.4GHz pulses up to 10 meters. Signed receipts are cached in the Secure Enclave and reconciled when connectivity returns.';
      }

      setMessages(prev => [...prev, {
        id: `m-reply-${Date.now()}`,
        sender: 'agent',
        text: reply,
        time: 'Just now'
      }]);
    }, 700);
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
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => redirectToSubdomain('wallet')}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span>{t.ctaWebWallet}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Encrypted Messenger Sandbox */}
        <div className="max-w-3xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
          
          {/* Messenger Header Bar */}
          <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                PT
              </div>
              <div>
                <h3 className="text-xs font-black text-white">{t.activeChannel}</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{t.onlineStatus}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>E2EE 256-bit</span>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="p-6 space-y-4 min-h-[320px] max-h-[440px] overflow-y-auto bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed space-y-1 ${
                  m.sender === 'user'
                    ? 'bg-amber-400 text-slate-950 font-medium rounded-br-xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                }`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] font-mono text-right ${
                    m.sender === 'user' ? 'text-amber-900/60' : 'text-slate-400'
                  }`}>
                    {m.time}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="p-3 bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs text-xs font-mono text-slate-400 flex items-center gap-1.5 shadow-xs">
                  <Clock className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>Péthar Support is typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions Strip */}
          <div className="px-6 py-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-2">
            <button
              onClick={() => handleSend(t.quickQ1)}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors"
            >
              {t.quickQ1}
            </button>
            <button
              onClick={() => handleSend(t.quickQ2)}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors"
            >
              {t.quickQ2}
            </button>
          </div>

          {/* Chat Input Field */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.placeholder}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 font-mono"
            />
            <button
              onClick={() => handleSend()}
              className="p-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-transform active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Security Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
            <h4 className="text-base font-black text-slate-950">Zero Plaintext Logging</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Messages are encrypted on your local device before transmission. No employee or server administrator can inspect chat content.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <Lock className="w-6 h-6 text-amber-600 mb-2" />
            <h4 className="text-base font-black text-slate-950">Disappearing Messages</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Set ephemeral timers on peer-to-peer discussions to ensure sensitive settlement negotiations evaporate after completion.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <CheckCircle2 className="w-6 h-6 text-sky-600 mb-2" />
            <h4 className="text-base font-black text-slate-950">Direct Arbiter Escalation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an escrow dispute arises, bring certified chamber arbiters into a cryptographically signed multi-party thread instantly.
            </p>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};