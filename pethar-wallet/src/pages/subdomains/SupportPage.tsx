import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  LifeBuoy, MessageSquare, Mail, MapPin, CheckCircle2,
  ArrowRight, ShieldCheck, Send
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface SupportPageProps {
  lang: Language;
}

export const SupportPage = ({ lang }: SupportPageProps) => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const t = lang === 'ak'
    ? {
        badge: 'PeThar တရားဝင် အကူအညီပေးရေး ဝန်ဆောင်မှု · Global Assistance',
        heroTitle: 'အာရက္ခ PeThar သုံးစွဲသူများအတွက် တိုက်ရိုက်အကူအညီ',
        heroSubtitle: 'အကောင့်လုံခြုံရေး၊ ငွေလွှဲပြောင်းမှုနှင့် နည်းပညာဆိုင်ရာ အခက်အခဲများကို ၂၄ နာရီပတ်လုံး ဖြေရှင်းပေးရန် အဆင်သင့်ရှိပါသည်',
        ctaChat: '၂၄/၇ Live Chat စတင်မည်',
        channelChatTitle: 'အက်ပ်အတွင်း တိုက်ရိုက် Chat',
        channelChatDesc: 'ပျမ်းမျှ တုံ့ပြန်ချိန် < ၆၀ စက္ကန့်၊ End-to-End Encrypted လုံခြုံရေး',
        channelEmailTitle: 'တရားဝင် အီးမေးလ် ပံ့ပိုးမှု',
        channelEmailDesc: 'support@pethar.co.uk (PGP လက်မှတ်ဖြင့် စစ်ဆေးနိုင်ပါသည်)',
        channelDeskTitle: 'ကိုယ်စားလှယ် ရုံးခန်းများ',
        channelDeskDesc: 'စစ်တွေ၊ မဲဆောက် နှင့် ဘန်ကောက်မြို့များရှိ လူကိုယ်တိုင် ဆက်သွယ်နိုင်သော ဗဟိုဌာနများ',
        ticketTitle: 'အကူအညီ တောင်းဆိုလွှာ (Support Ticket) တင်သွင်းရန်',
        submitBtn: 'တောင်းဆိုလွှာ ပေးပို့မည်',
        ticketSuccess: 'သင်၏ အကူအညီတောင်းဆိုလွှာကို လက်ခံရရှိပါပြီ! လက်မှတ်နံပါတ်:',
      }
    : {
        badge: 'Official PeThar Support & Sovereign Assistance · 24/7 Rails',
        heroTitle: 'How Can Our Global Support Assist You?',
        heroSubtitle: 'Dedicated assistance for enclave security, remittance tracking, merchant POS hardware, and physical gold audits',
        ctaChat: 'Launch Live Encrypted Chat',
        channelChatTitle: 'In-App Live Chat',
        channelChatDesc: 'Average response time < 60 seconds with hardware-encrypted privacy',
        channelEmailTitle: 'Official Support Email',
        channelEmailDesc: 'support@pethar.co.uk (PGP key: 0x48FA_ED25519)',
        channelDeskTitle: 'Physical Assistance Hubs',
        channelDeskDesc: 'Walk-in desks in Sittwe, Mae Sot, Bangkok, and London',
        ticketTitle: 'Submit an Escalated Support Ticket',
        submitBtn: 'Submit Priority Ticket',
        ticketSuccess: 'Ticket successfully logged to sovereign support dispatch! Ticket ID:',
      };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketEmail) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedTicketId(`PT-TICK-${Math.floor(100000 + Math.random() * 900000)}`);
      setTicketSubject('');
      setTicketEmail('');
      setTicketDesc('');
    }, 800);
  };

  return (
    <BaseLayout
      title={t.heroTitle}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-16 max-w-5xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-500/20 text-xs font-mono font-bold uppercase tracking-wider">
            <LifeBuoy className="w-3.5 h-3.5 text-amber-600" />
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
              onClick={() => redirectToSubdomain('chat')}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.ctaChat}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Support Channels 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => redirectToSubdomain('chat')}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400/50 cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-base font-black text-slate-950">{t.channelChatTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.channelChatDesc}</p>
            <p className="text-xs font-mono font-bold text-amber-600 flex items-center gap-1 pt-1">
              <span>Start Instant Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Mail className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-black text-slate-950">{t.channelEmailTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.channelEmailDesc}</p>
            <p className="text-xs font-mono text-emerald-700 font-bold pt-1">Response time: ~ 2 Hours</p>
          </div>

          <div
            onClick={() => redirectToSubdomain('global')}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400/50 cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6 text-sky-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-base font-black text-slate-950">{t.channelDeskTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.channelDeskDesc}</p>
            <p className="text-xs font-mono font-bold text-sky-700 flex items-center gap-1 pt-1">
              <span>View Physical Hubs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </p>
          </div>
        </div>

        {/* Priority Ticket Dispatch Form */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-950">{t.ticketTitle}</h3>
            <p className="text-xs text-slate-500">
              For complex transaction reconciliations or institutional onboarding inquiries.
            </p>
          </div>

          {submittedTicketId && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.ticketSuccess} <span className="text-emerald-950 underline">{submittedTicketId}</span></span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-700">Your Email Address</label>
                <input
                  type="email"
                  required
                  value={ticketEmail}
                  onChange={(e) => setTicketEmail(e.target.value)}
                  placeholder="citizen@pethar.co.uk"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-700">Subject / Category</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Card Authorization or Merchant POS Setup"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-700">Detailed Message / Transaction Hash</label>
              <textarea
                rows={4}
                required
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                placeholder="Include transaction ID (0x...), wallet address, or specific questions..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono leading-relaxed"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : t.submitBtn}</span>
            </button>
          </form>
        </div>

        {/* Security & Confidentiality Guarantee */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4 text-xs font-mono text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>PeThar support agents will NEVER ask for your private seed phrase, enclave pin, or password.</span>
        </div>

      </div>
    </BaseLayout>
  );
};