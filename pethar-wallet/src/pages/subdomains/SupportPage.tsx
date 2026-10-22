import React, { useState, useMemo } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import { redirectToSubdomain } from '../../utils/subdomain';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  LifeBuoy,
  Mail,
  MapPin,
  CheckCircle2,
  Send,
  Lock,
  Clock,
  Ticket,
  Layers,
} from 'lucide-react';

export type SupportTab = 'all' | 'faq' | 'chat' | 'ticket';

export interface SupportPageProps {
  lang: Language;
  initialTab?: SupportTab;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

interface FaqItem {
  id: string;
  category: 'security' | 'offline' | 'reserves' | 'remittance' | 'general';
  q: string;
  a: string;
}

export const SupportPage: React.FC<SupportPageProps> = ({
  lang = 'ak',
  initialTab = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<SupportTab>(initialTab);

  // ─── FAQ SEARCH & ACCORDION STATE ───
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');

  // ─── LIVE CHAT STATE ───
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'm1',
      sender: 'agent',
      text:
        lang === 'ak'
          ? 'မင်္ဂလာပါ။ Péthar တရားဝင် သတင်းအချက်အလက်နှင့် နည်းပညာအကူအညီပေးရေးမှ ကြိုဆိုပါသည်။ မည်သည့်အရာကို သိရှိလိုပါသလဲခင်ဗျာ။'
          : 'Welcome to Péthar Support. All communications are end-to-end encrypted with your hardware Ed25519 key. How may we assist you today?',
      time: '14:30',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // ─── TICKET FORM STATE ───
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const isAk = lang === 'ak';

  // ─── LOCALIZED STRINGS ───
  const t = useMemo(() => {
    if (isAk) {
      return {
        badge: 'Péthar တရားဝင် အကူအညီပေးရေးနှင့် အမေးအဖြေ ဗဟိုဌာန · 24/7 Rails',
        heroTitle: 'အာရက္ခ Péthar အကူအညီနှင့် ဝန်ဆောင်မှု ဗဟိုဌာန',
        heroSubtitle:
          'အကောင့်လုံခြုံရေး၊ အော့ဖ်လိုင်း ငွေလွှဲခြင်း၊ ရွှေအရန်ငွေကြေးနှင့် နည်းပညာဆိုင်ရာ အခက်အခဲများကို ၂၄ နာရီပတ်လုံး တိုက်ရိုက်ကူညီဖြေရှင်းပေးပါသည်',
        tabAll: 'အားလုံး (Overview)',
        tabFaq: 'မေးလေ့ရှိသော မေးခွန်းများ (FAQ)',
        tabChat: 'တိုက်ရိုက် Chat (E2EE)',
        tabTicket: 'တောင်းဆိုလွှာ ပေးပို့ရန် (Ticket)',
        searchPlaceholder: 'မေးခွန်း သို့မဟုတ် အကြောင်းအရာ ရှာဖွေပါ...',
        filterAll: 'အားလုံး',
        filterSecurity: 'သော့နှင့် လုံခြုံရေး',
        filterOffline: 'အော့ဖ်လိုင်း BLE',
        filterReserves: '၁:၁ ရွှေအရန်ငွေကြေး',
        filterRemittance: 'နယ်စပ်ဖြတ်ကျော် ငွေလွှဲ',
        ctaWebWallet: 'ပိုက်ဆံအိတ်သို့ သွားမည်',
        ctaChat: '၂၄/၇ Live Chat စတင်မည်',
        activeChannel: 'Péthar တရားဝင် အကူအညီပေးရေး ဗဟိုဌာန',
        onlineStatus: 'အွန်လိုင်းရှိသည် • ပျမ်းမျှ ပြန်ကြားချိန် < ၁ မိနစ်',
        chatPlaceholder: 'မေးခွန်း သို့မဟုတ် မက်ဆေ့ခ်ျ ရိုက်ထည့်ပါ...',
        quickQ1: 'ရွှေအရန်ငွေကြေး မည်သို့ စစ်ဆေးရမလဲ?',
        quickQ2: 'အော့ဖ်လိုင်း BLE ငွေလွှဲခြင်း ဘယ်လို အလုပ်လုပ်သလဲ?',
        quickQ3: 'သော့တွဲကို မည်သို့ သိမ်းဆည်းရမည်နည်း?',
        quickQ4: 'နိုင်ငံတကာ ငွေလွှဲမှု မည်မျှကြာသနည်း?',
        channelChatTitle: 'အက်ပ်အတွင်း တိုက်ရိုက် Chat',
        channelChatDesc: 'ပျမ်းမျှ တုံ့ပြန်ချိန် < ၆၀ စက္ကန့်၊ End-to-End Encrypted လုံခြုံရေး',
        channelEmailTitle: 'တရားဝင် အီးမေးလ် ပံ့ပိုးမှု',
        channelEmailDesc: 'realjackhalder@gmail.com (PGP လက်မှတ်ဖြင့် စစ်ဆေးနိုင်ပါသည်)',
        channelDeskTitle: 'ကိုယ်စားလှယ် ရုံးခန်းများ',
        channelDeskDesc: 'စစ်တွေ၊ မဲဆောက် နှင့် ဘန်ကောက်မြို့များရှိ လူကိုယ်တိုင် ဆက်သွယ်နိုင်သော ဗဟိုဌာနများ',
        ticketTitle: 'အကူအညီ တောင်းဆိုလွှာ (Support Ticket) တင်သွင်းရန်',
        submitBtn: 'တောင်းဆိုလွှာ ပေးပို့မည်',
        ticketSuccess: 'သင်၏ အကူအညီတောင်းဆိုလွှာကို လက်ခံရရှိပါပြီ! လက်မှတ်နံပါတ်:',
        askSupport: 'အကူအညီ တိုက်ရိုက်ရယူမည်',
        contactUs: '၂၄/၇ Support Chat စတင်မည်',
        typingText: 'Péthar Support မှ စာရိုက်နေပါသည်...',
        noFaqMatches: 'သင်ရှာဖွေသော အကြောင်းအရာနှင့် ကိုက်ညီသည့် မေးခွန်း မတွေ့ရှိပါ။',
        securityGuarantee:
          'Péthar အကူအညီပေးရေး အဖွဲ့သားများသည် သင့်လျှို့ဝှက်စကားစု (Seed phrase) သို့မဟုတ် PIN နံပါတ်ကို မည်သည့်အခါမျှ တောင်းဆိုမည် မဟုတ်ပါ။',
      };
    }
    return {
      badge: 'Official Péthar Support & Assistance · 24/7 Rails',
      heroTitle: 'How Can Our Global Support Assist You?',
      heroSubtitle:
        'Dedicated assistance for cryptographic security, 1:1 bullion reserve audits, offline BLE mesh payments, and corporate treasury management.',
      tabAll: 'Overview',
      tabFaq: 'Knowledge Base (FAQ)',
      tabChat: 'Live Chat (E2EE)',
      tabTicket: 'Priority Ticket & Contact',
      searchPlaceholder: 'Search FAQs, transfers, reserve disclosures, BLE mesh...',
      filterAll: 'All Topics',
      filterSecurity: 'Keys & Security',
      filterOffline: 'Offline BLE Mesh',
      filterReserves: '1:1 Parity & Reserves',
      filterRemittance: 'Global Remittances',
      ctaWebWallet: 'Open Péthar Wallet',
      ctaChat: 'Launch Live Encrypted Chat',
      activeChannel: 'Péthar Support Desk',
      onlineStatus: 'Online • Average Response Time < 60s',
      chatPlaceholder: 'Type your inquiry or transaction ID...',
      quickQ1: 'How do I audit the reserves?',
      quickQ2: 'How does offline BLE mesh function?',
      quickQ3: 'How do I backup my seed phrase?',
      quickQ4: 'How fast are global remittances?',
      channelChatTitle: 'In-App Live Chat',
      channelChatDesc: 'Average response time < 60 seconds with hardware-encrypted privacy',
      channelEmailTitle: 'Official Support Email',
      channelEmailDesc: 'realjackhalder@gmail.com (PGP key: 0x48FA_ED25519)',
      channelDeskTitle: 'Physical Assistance Hubs',
      channelDeskDesc: 'Walk-in desks in Sittwe, Mae Sot, Bangkok, and London',
      ticketTitle: 'Submit an Escalated Support Ticket',
      submitBtn: 'Submit Priority Ticket',
      ticketSuccess: 'Ticket successfully logged to support dispatch! Ticket ID:',
      askSupport: 'Need Direct Assistance?',
      contactUs: 'Launch Live 24/7 Chat',
      typingText: 'Péthar Support is typing...',
      noFaqMatches: 'No questions matched your search query. Try typing another keyword.',
      securityGuarantee:
        'Péthar support agents will NEVER ask for your private seed phrase, enclave pin, or password.',
    };
  }, [isAk]);

  // ─── FAQ KNOWLEDGE BASE DATA ───
  const faqItems: FaqItem[] = useMemo(
    () => [
      {
        id: 'faq-1',
        category: 'security',
        q: isAk
          ? 'Péthar ပိုက်ဆံအိတ်ကို မည်သို့ စတင်အသုံးပြုပြီး လုံခြုံအောင် ထိန်းသိမ်းရမည်နည်း။'
          : 'How do I initialize and secure my Péthar Wallet?',
        a: isAk
          ? 'Péthar အက်ပ်ကို ဒေါင်းလုဒ်လုပ်ပြီး မိနစ်ပိုင်းအတွင်း အကောင့်ဖွင့်နိုင်ပါသည်။ သင့်ဖုန်း၏ Hardware Secure Enclave ထဲတွင် Ed25519 သော့တွဲကို အလိုအလျောက် ထုတ်ယူပေးပြီး ဆာဗာသို့ သော့မပို့သောကြောင့် ၁၀၀% လုံခြုံမှုရှိပါသည်။ လျှို့ဝှက်စကားစု (12/24 words) ကို စာရွက်ပေါ်တွင် သေချာကူးရေး၍ လုံခြုံသောနေရာတွင် သိမ်းဆည်းပါ။'
          : "Download Péthar from the official App Store, Google Play, or direct signed APK. During setup, your smartphone's Secure Enclave locally generates an Ed25519 keypair. Your private keys never touch Péthar servers. Always write down your recovery seed phrase on physical paper and store it in a secure location.",
      },
      {
        id: 'faq-2',
        category: 'offline',
        q: isAk
          ? 'အင်တာနက်နှင့် ဖုန်းလိုင်း ပြတ်တောက်နေချိန်တွင် မည်သို့ ငွေလွှဲနိုင်ပါသလဲ။'
          : 'How do offline payments function during internet blackouts?',
        a: isAk
          ? 'Péthar တွင် Bluetooth Low Energy (BLE 2.4GHz) နှင့် NFC mesh နည်းပညာ ပါဝင်သောကြောင့် အင်တာနက်မရှိချိန်တွင်လည်း ဖုန်းအချင်းချင်း ၁၀ မီတာ အကွာအဝေးအတွင်း သော့လက်မှတ်ထိုးထားသော ပြေစာများ ဖလှယ်နိုင်ပါသည်။ အင်တာနက် ပြန်လည်ရရှိချိန်တွင် Ledger နှင့် အလိုအလျောက် စာရင်းရှင်းပေးပါသည်။'
          : "Péthar uses localized BLE (2.4GHz) and NFC pulses to broadcast cryptographically signed payment vouchers up to 10 meters. The recipient's hardware validates the monotonic counter locally, and the transaction is automatically gossiped to the main ledger once any nearby node connects to satellite or cell signals.",
      },
      {
        id: 'faq-3',
        category: 'reserves',
        q: isAk
          ? 'အာရက္ခဒေါ်လာ (AKD) ၏ ၁:၁ ပုံသေနှုန်းနှင့် ငွေရန်ပုံငွေ အာမခံစနစ်က မည်သို့ရှိသနည်း။'
          : 'How does the 1:1 parity and reserve backing work?',
        a: isAk
          ? 'ဖေ့သာရှိ AKD တိုင်းသည် 1:1 USD/USDT အရန်ငွေကြေးနှင့် လန်ဒန်/ဘန်ကောက်ရှိ စစ်ဆေးပြီး ရွှေစင်ရွှေတုံး 999.9 တို့ဖြင့် အပြည့်အဝ အာမခံထားရှိပါသည်။ နိုင်ငံတကာ စစ်ဆေးရေးအဖွဲ့များ၏ Audit အထောက်အထားများကို /data နှင့် /accounts တွင် ပွင့်လင်းမြင်သာစွာ အချိန်နှင့်တပြေးညီ ကြည့်ရှုနိုင်ပါသည်။'
          : 'Every Arakan Dollar (AKD) is defined at a fixed 1:1 peg to the US dollar. Reserves are backed by verified liquid USD/USDT reserves and allocated physical 999.9 gold bullion stored in audited vaults in London and Bangkok. Reserve disclosures are published transparently on /data and /accounts.',
      },
      {
        id: 'faq-4',
        category: 'remittance',
        q: isAk
          ? 'နိုင်ငံတကာမှ မိသားစုထံသို့ ငွေလွှဲပေးပို့ရာတွင် မည်မျှကြာသနည်း။'
          : 'How fast are global remittances?',
        a: isAk
          ? 'Péthar ကွန်ရက်တွင် ကမ္ဘာတစ်ဝှမ်း ချိတ်ဆက်ထားသောကြောင့် နယ်စပ်ဖြတ်ကျော် ငွေလွှဲမှုများသည် စက္ကန့် ၆၀ အတွင်း မိသားစု၏ ပိုက်ဆံအိတ်ထဲသို့ ကော်မရှင်ခ အနိမ့်ဆုံးဖြင့် တိုက်ရိုက်ရောက်ရှိပါသည်။'
          : "Cross-border corridors settle into the recipient's Péthar Wallet in under 60 seconds with 0% hidden FX spread and instantaneous Arakan Dollar parity.",
      },
      {
        id: 'faq-5',
        category: 'security',
        q: isAk
          ? 'ဖုန်းပျောက်ဆုံးခြင်း သို့မဟုတ် ပျက်စီးသွားပါက ပိုက်ဆံအိတ်ကို မည်သို့ ပြန်လည်ရယူနိုင်သနည်း။'
          : 'What should I do if my smartphone is lost, stolen, or damaged?',
        a: isAk
          ? 'ဖုန်းအသစ်တွင် Péthar အက်ပ်ကို ထည့်သွင်းပြီး "Restore Wallet" ကို နှိပ်ကာ အကောင့်ဖွင့်စဉ်က ရရှိခဲ့သော ၁၂ လုံးပါ လျှို့ဝှက်စကားစု (Seed Phrase) ကို ရိုက်ထည့်ရုံဖြင့် လက်ကျန်ငွေနှင့် စာရင်းအားလုံးကို ပြန်လည်ရရှိမည် ဖြစ်ပါသည်။'
          : 'Install the Péthar app on a new device, select "Restore Existing Wallet", and enter your 12-word cryptographic seed phrase. Your account state, deterministic addresses, and full balance will restore immediately.',
      },
      {
        id: 'faq-6',
        category: 'general',
        q: isAk
          ? 'Arakan QR ဖြင့် အရောင်းအဝယ် ပြုလုပ်ရာတွင် ကုန်သည်များအတွက် မည်သည့် အကျိုးကျေးဇူးများ ရှိသနည်း။'
          : 'What are the benefits of Arakan QR for merchants and POS terminals?',
        a: isAk
          ? 'Arakan QR သည် ကုန်သည်များအတွက် အခမဲ့ POS terminal စနစ်၊ အော့ဖ်လိုင်းငွေပေးချေမှု အထောက်အပံ့၊ နှင့် ငွေလွှဲခ ၀% ဖြင့် ချက်ချင်းငွေစာရင်းရှင်းပေးနိုင်သောကြောင့် စီးပွားရေးလုပ်ငန်းရှင်များအတွက် အထူးသင့်လျော်ပါသည်။'
          : 'Arakan QR offers merchants zero hardware lease fees, zero gateway delays, offline Bluetooth acceptance, and instant zero-fee settlement in 1:1 pegged AKD.',
      },
    ],
    [isAk]
  );

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqItems.filter((item) => {
      const matchCat =
        selectedCategory === 'all' || item.category === selectedCategory;
      const qLower = item.q.toLowerCase();
      const aLower = item.a.toLowerCase();
      const queryLower = searchQuery.toLowerCase().trim();
      const matchQuery =
        queryLower === '' ||
        qLower.includes(queryLower) ||
        aLower.includes(queryLower);
      return matchCat && matchQuery;
    });
  }, [faqItems, selectedCategory, searchQuery]);

  // ─── CHAT ACTIONS ───
  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: MessageItem = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply = isAk
        ? 'ကျေးဇူးပြု၍ စောင့်ဆိုင်းပေးပါ။ သင်၏ မေးမြန်းချက်ကို စိစစ်ပြီး လိုအပ်သော အချက်အလက်များကို ချက်ချင်း ဖြေကြားပေးပါမည်။'
        : 'Thank you for your message. Your inquiry has been matched with our verification ledger. You can inspect ledger information directly on /accounts.';

      const lower = text.toLowerCase();
      if (
        lower.includes('reserve') ||
        lower.includes('အာမခံ') ||
        lower.includes('ရွှေ') ||
        lower.includes('gold')
      ) {
        reply = isAk
          ? 'အာရက္ခဒေါ်လာ (AKD) သည် အမေရိကန်ဒေါ်လာနှင့် ၁:၁ ပုံသေနှုန်းဖြင့် သတ်မှတ်ထားပြီး 999.9 ရွှေစင်ရွှေတုံးများနှင့် USDT ရန်ပုံငွေဖြင့် အပြည့်အဝ အာမခံထားရှိပါသည်။ စာရင်းအသေးစိတ်ကို /data နှင့် /accounts တွင် ကြည့်နိုင်ပါသည်။'
          : 'The Arakan Dollar (AKD) is defined at a fixed 1:1 peg to the US dollar backed by audited 999.9 gold bullion reserves and liquid USD/USDT collateral. Ledger details are published on /accounts.';
      } else if (
        lower.includes('ble') ||
        lower.includes('အော့ဖ်လိုင်း') ||
        lower.includes('offline') ||
        lower.includes('mesh')
      ) {
        reply = isAk
          ? 'အော့ဖ်လိုင်း BLE ငွေလွှဲခြင်းသည် အင်တာနက်မလိုဘဲ ဖုန်းအချင်းချင်း ၁၀ မီတာ အကွာအဝေးအတွင်း Cryptographic Vouchers ဖလှယ်ပြီး အင်တာနက်ရချိန်တွင် အလိုအလျောက် စာရင်းရှင်းပေးပါသည်။'
          : 'Péthar Offline BLE Mesh uses peer-to-peer 2.4GHz pulses up to 10 meters. Cryptographically signed receipts are cached in the Secure Enclave and reconciled when connectivity returns.';
      } else if (
        lower.includes('seed') ||
        lower.includes('key') ||
        lower.includes('သော့') ||
        lower.includes('recovery')
      ) {
        reply = isAk
          ? 'သင့်ဖုန်း၏ Secure Enclave တွင် Ed25519 သော့တွဲကို သိမ်းဆည်းထားပါသည်။ သင်၏ ၁၂ လုံးပါ လျှို့ဝှက်စကားစု (Seed phrase) ကို မည်သူ့ကိုမျှ မမျှဝေပါနှင့်။'
          : 'Your Ed25519 private keys are anchored inside the hardware Secure Enclave. Never disclose your 12-word recovery seed phrase to anyone, including support staff.';
      } else if (
        lower.includes('remittance') ||
        lower.includes('ငွေလွှဲ') ||
        lower.includes('transfer')
      ) {
        reply = isAk
          ? 'Péthar ကွန်ရက်ဖြင့် နိုင်ငံတကာငွေလွှဲမှုများသည် စက္ကန့် ၆၀ အတွင်း ၁:၁ AKD ပုံသေနှုန်းဖြင့် တိုက်ရိုက်ရောက်ရှိပါသည်။'
          : 'Global remittances settle into any verified Péthar Wallet within 60 seconds at a guaranteed 1:1 AKD parity with 0% hidden intermediary fees.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-reply-${Date.now()}`,
          sender: 'agent',
          text: reply,
          time: 'Just now',
        },
      ]);
    }, 700);
  };

  // ─── TICKET SUBMISSION ───
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketEmail.trim()) return;

    setSubmittingTicket(true);
    setTimeout(() => {
      setSubmittingTicket(false);
      setSubmittedTicketId(
        `PT-TICK-${Math.floor(100000 + Math.random() * 900000)}`
      );
      setTicketSubject('');
      setTicketEmail('');
      setTicketDesc('');
    }, 800);
  };

  const switchTab = (tab: SupportTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <BaseLayout
      title={t.heroTitle}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-12 max-w-6xl mx-auto pb-12">
        {/* ─── HERO HEADER ─── */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-2">
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

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => switchTab('chat')}
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.ctaChat}</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('ticket')}
              className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-amber-600" />
              <span>{t.tabTicket}</span>
            </button>
            <button
              type="button"
              onClick={() => redirectToSubdomain('wallet')}
              className="px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <span>{t.ctaWebWallet}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* ─── NAVIGATION TABS BAR ─── */}
        <div className="flex justify-center border-b border-slate-200/80 px-2 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-3 pb-3">
            <button
              type="button"
              onClick={() => switchTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.tabAll}</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('chat')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.tabChat}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              type="button"
              onClick={() => switchTab('faq')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.tabFaq}</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('ticket')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ticket'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>{t.tabTicket}</span>
            </button>
          </div>
        </div>

        {/* ─── SUPPORT CHANNELS 3 CARDS ─── */}
        {(activeTab === 'all' || activeTab === 'ticket') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => switchTab('chat')}
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
        )}

        {/* ─── LIVE ENCRYPTED CHAT SANDBOX ─── */}
        {(activeTab === 'all' || activeTab === 'chat') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                    {t.tabChat}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  Hardware Ed25519 authenticated session with zero server plaintext logging
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-600">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Signal Protocol E2EE</span>
              </div>
            </div>

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
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
                    className={`flex ${
                      m.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed space-y-1 ${
                        m.sender === 'user'
                          ? 'bg-amber-400 text-slate-950 font-medium rounded-br-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      <p>{m.text}</p>
                      <p
                        className={`text-[10px] font-mono text-right ${
                          m.sender === 'user'
                            ? 'text-amber-900/60'
                            : 'text-slate-400'
                        }`}
                      >
                        {m.time}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs text-xs font-mono text-slate-400 flex items-center gap-1.5 shadow-xs">
                      <Clock className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>{t.typingText}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Questions Strip */}
              <div className="px-6 py-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSend(t.quickQ1)}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  {t.quickQ1}
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(t.quickQ2)}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  {t.quickQ2}
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(t.quickQ3)}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  {t.quickQ3}
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(t.quickQ4)}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  {t.quickQ4}
                </button>
              </div>

              {/* Chat Input Field */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t.chatPlaceholder}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  aria-label="Send Message"
                  className="p-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-transform active:scale-95 shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Security Pillars from ChatPage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
                <h4 className="text-base font-black text-slate-950">
                  {isAk ? 'ဆာဗာမှတ်တမ်း ကင်းမဲ့ခြင်း' : 'Zero Plaintext Logging'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAk
                    ? 'မက်ဆေ့ခ်ျများကို သင့်ဖုန်းတွင်ပင် Ed25519 ဖြင့် သော့ခတ်ပြီးမှ ပို့ဆောင်သောကြောင့် ဝန်ထမ်းများ သို့မဟုတ် ဆာဗာအုပ်ချုပ်သူများ မဖတ်ရှုနိုင်ပါ။'
                    : 'Messages are encrypted on your local device before transmission. No employee or server administrator can inspect chat content.'}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <Lock className="w-6 h-6 text-amber-600 mb-2" />
                <h4 className="text-base font-black text-slate-950">
                  {isAk ? 'အချိန်ကိုက် ဖျက်သိမ်းနိုင်သော စနစ်' : 'Disappearing Messages'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAk
                    ? 'ငွေကြေးလွှဲပြောင်းမှုနှင့် ဆွေးနွေးချက်များ ပြီးဆုံးပါက မက်ဆေ့ခ်ျများကို အလိုအလျောက် ပျောက်ကွယ်သွားစေရန် အချိန်သတ်မှတ်ထားနိုင်ပါသည်။'
                    : 'Set ephemeral timers on peer-to-peer discussions to ensure sensitive settlement negotiations evaporate after completion.'}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <CheckCircle2 className="w-6 h-6 text-sky-600 mb-2" />
                <h4 className="text-base font-black text-slate-950">
                  {isAk ? 'တရားဝင် ခုံသမာဓိ စနစ်' : 'Direct Arbiter Escalation'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAk
                    ? 'အငြင်းပွားမှု ဖြစ်ပေါ်ပါက တရားဝင် ခုံသမာဓိလူကြီးများကို လုံခြုံသော စကားပြောခန်းထဲသို့ တိုက်ရိုက်ခေါ်ယူ ဖြေရှင်းနိုင်ပါသည်။'
                    : 'If an escrow dispute arises, bring certified chamber arbiters into a cryptographically signed multi-party thread instantly.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── KNOWLEDGE BASE & FAQ SECTION (FROM HELPPAGE) ─── */}
        {(activeTab === 'all' || activeTab === 'faq') && (
          <div className="space-y-6 pt-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                {t.tabFaq}
              </h2>
              <p className="text-xs text-slate-500">
                {isAk
                  ? 'ပိုက်ဆံအိတ် စနစ်၊ အော့ဖ်လိုင်း BLE ငွေလွှဲခြင်းနှင့် ၁:၁ ရွှေအရန်ငွေကြေး ဆိုင်ရာ အဖြေများ'
                  : 'Answers to key recovery, 1:1 reserve disclosures, offline BLE mesh, and global settlements.'}
              </p>
            </div>

            {/* Search Input Box */}
            <div className="max-w-2xl">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all font-mono"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { id: 'all', label: t.filterAll },
                { id: 'security', label: t.filterSecurity },
                { id: 'offline', label: t.filterOffline },
                { id: 'reserves', label: t.filterReserves },
                { id: 'remittance', label: t.filterRemittance },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedCategory(chip.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                    selectedCategory === chip.id
                      ? 'bg-slate-950 text-white font-bold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Accordion FAQ List */}
            <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
              {filteredFaqs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  {t.noFaqMatches}
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div key={faq.id} className="transition-colors">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                        className="w-full text-left p-6 flex items-center justify-between gap-4 font-bold text-xs text-slate-900 hover:text-amber-600 transition-colors cursor-pointer"
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
                })
              )}
            </div>
          </div>
        )}

        {/* ─── PRIORITY TICKET DISPATCH FORM (FROM SUPPORTPAGE) ─── */}
        {(activeTab === 'all' || activeTab === 'ticket') && (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6 pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-600" />
                <h3 className="text-xl font-black text-slate-950">
                  {t.ticketTitle}
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                {isAk
                  ? 'ရှုပ်ထွေးသော ငွေလွှဲပြောင်းမှုများ သို့မဟုတ် ကုမ္ပဏီအကောင့် ဖွင့်လှစ်မှုများအတွက် တိုက်ရိုက်တင်သွင်းပါ'
                  : 'For complex transaction reconciliations, corporate onboarding, or security escalations.'}
              </p>
            </div>

            {submittedTicketId && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {t.ticketSuccess}{' '}
                  <span className="text-emerald-950 underline font-black">
                    {submittedTicketId}
                  </span>
                </span>
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-700">
                    {isAk ? 'သင့် အီးမေးလ် လိပ်စာ' : 'Your Email Address'}
                  </label>
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
                  <label className="text-xs font-mono font-bold text-slate-700">
                    {isAk ? 'အကြောင်းအရာ / အမျိုးအစား' : 'Subject / Category'}
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder={
                      isAk
                        ? 'ဥပမာ - ကတ်ထုတ်ယူခြင်း သို့မဟုတ် POS Terminal ပြဿနာ'
                        : 'e.g. Card Authorization or Merchant POS Setup'
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-700">
                  {isAk
                    ? 'အသေးစိတ် အချက်အလက် / Transaction Hash'
                    : 'Detailed Message / Transaction Hash'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder={
                    isAk
                      ? 'ငွေလွှဲအမှတ် (TXID: 0x...)၊ ပိုက်ဆံအိတ်လိပ်စာ သို့မဟုတ် သိလိုသည်များကို အသေးစိတ် ရေးသားပါ...'
                      : 'Include transaction ID (0x...), wallet address, or specific inquiries...'
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submittingTicket}
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {submittingTicket
                    ? isAk
                      ? 'ပေးပို့နေသည်...'
                      : 'Submitting...'
                    : t.submitBtn}
                </span>
              </button>
            </form>
          </div>
        )}

        {/* ─── SECURITY & CONFIDENTIALITY GUARANTEE NOTICE ─── */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4 text-xs font-mono text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{t.securityGuarantee}</span>
        </div>
      </div>
    </BaseLayout>
  );
};

/** Backwards-compatible exported ChatPage component using the unified file */
export const ChatPage: React.FC<{ lang: Language }> = ({ lang }) => (
  <SupportPage lang={lang} initialTab="chat" />
);

/** Backwards-compatible exported HelpPage component using the unified file */
export const HelpPage: React.FC<{ lang: Language }> = ({ lang }) => (
  <SupportPage lang={lang} initialTab="faq" />
);

export default SupportPage;
