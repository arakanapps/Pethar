import React, { useState, useEffect } from 'react'
import {
  MessageSquare, HelpCircle, LifeBuoy, ShieldCheck, Send, CheckCircle2,
  Clock, Search, ChevronDown, ChevronUp, Mail, MapPin,
  Smartphone, Wallet, ArrowLeft
} from 'lucide-react'
import { ArakanEmblem } from '../components/ArakanEmblem'
import type { Language } from '../i18n'

export interface SupportPageProps {
  lang?: Language
  setLang?: (lang: Language) => void
  initialTab?: 'chat' | 'help' | 'ticket'
  onBack?: () => void
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'operator'
  text: string
  time: string
  channel: 'mobilewallet' | 'android' | 'web'
}

const STORAGE_KEY = 'pethar_customer_chat_messages'

export const SupportPage: React.FC<SupportPageProps> = ({
  lang = 'ak',
  setLang,
  initialTab = 'chat',
  onBack,
}) => {
  const isAk = lang === 'ak'
  const [activeTab, setActiveTab] = useState<'chat' | 'help' | 'ticket'>(initialTab)

  // Chat channel state: connected to Mobile Wallet, Android App, or General Web
  const [chatChannel, setChatChannel] = useState<'mobilewallet' | 'android' | 'web'>('mobilewallet')
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) return JSON.parse(stored)
      } catch {}
    }
    return [
      {
        id: 'msg-init-1',
        sender: 'operator',
        channel: 'mobilewallet',
        text: isAk
          ? 'မင်္ဂလာပါ။ Péthar မိုဘိုင်းပိုက်ဆံအိတ်နှင့် Android အက်ပ် အကူအညီပေးရေးမှ ကြိုဆိုပါသည်။ Operator တာဝန်ကျအရာရှိနှင့် တိုက်ရိုက် ဆက်သွယ်ထားပါသည်။ မည်သည့်အရာကို ကူညီပေးရပါသလဲခင်ဗျာ။'
          : 'Welcome to Péthar Official Support Desk. Connected live with duty operator. All communications are end-to-end encrypted with your hardware Ed25519 key. How may we assist you today?',
        time: 'Just now',
      },
    ]
  })

  const [inputText, setInputText] = useState('')
  const [isOperatorTyping, setIsOperatorTyping] = useState(false)

  // Help FAQ state
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Support Ticket Form state
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketEmail, setTicketEmail] = useState('')
  const [ticketDesc, setTicketDesc] = useState('')
  const [ticketTxHash, setTicketTxHash] = useState('')
  const [submittingTicket, setSubmittingTicket] = useState(false)
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null)

  // Sync messages to localStorage for Admin Dashboard operator desk
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  // Listen for operator replies from localStorage storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setMessages(JSON.parse(e.newValue))
        } catch {}
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Send Customer message
  const handleSendMessage = (customText?: string) => {
    const textToSend = (customText || inputText).trim()
    if (!textToSend) return

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      channel: chatChannel,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const updated = [...messages, newMsg]
    setMessages(updated)
    if (!customText) setInputText('')
    setIsOperatorTyping(true)

    // Automated smart operator response simulation
    setTimeout(() => {
      setIsOperatorTyping(false)
      let replyText = isAk
        ? 'မေးမြန်းမှုအတွက် ကျေးဇူးတင်ပါသည်။ သင်၏ မေးခွန်းကို တာဝန်ကျ အော်ပရေတာက လက်ခံရရှိပြီး စိစစ်နေပါပြီ။'
        : 'Thank you for contacting Péthar Support. An on-duty operator is reviewing your inquiry.'

      const lower = textToSend.toLowerCase()
      if (lower.includes('reserve') || lower.includes('usd') || lower.includes('အာမခံ') || lower.includes('ဒေါ်လာ')) {
        replyText = isAk
          ? 'အာရက္ခဒေါ်လာ (AKD) တိုင်းသည် အမေရိကန်ဒေါ်လာနှင့် ၁:၁ ပုံသေနှုန်းထားဖြင့် 100% USDT/USDC အပြည့်အဝ ကျောထောက်နောက်ခံပြုထားပါသည်။ စာရင်းစစ်မှတ်တမ်းများကို Dashboard တွင် အချိန်နှင့်တစ်ပြေးညီ စစ်ဆေးနိုင်ပါသည်။'
          : 'Every Arakan Dollar (AKD) is 100% collateralized with USDT/USDC at a strict 1:1 USD peg. Real-time reserves disclosures are verifiable directly on the Dashboard.'
      } else if (lower.includes('ble') || lower.includes('mesh') || lower.includes('offline') || lower.includes('အော့ဖ်လိုင်း')) {
        replyText = isAk
          ? 'Péthar အော့ဖ်လိုင်း BLE Mesh စနစ်သည် အင်တာနက်မရှိချိန်တွင် Bluetooth Low Energy ဖြင့် ဖုန်းအချင်းချင်း ၁၀ မီတာအတွင်း လက်မှတ်ထိုးထားသော တိုကင်များ ဖလှယ်ပေးပြီး အင်တာနက်ပြန်ရချိန်တွင် Ledger နှင့် အလိုအလျောက် စာရင်းရှင်းပေးပါသည်။'
          : 'Péthar Offline BLE Mesh facilitates peer-to-peer 2.4GHz voucher transfers up to 10 meters without cell tower or internet connection. Signed receipts sync upon network reconnection.'
      } else if (lower.includes('android') || lower.includes('apk') || lower.includes('app')) {
        replyText = isAk
          ? 'Android အက်ပ်အတွက် တရားဝင် signed APK ကို download စာမျက်နှာမှ တိုက်ရိုက် ရယူနိုင်ပါသည်။ လက်ရှိ ဗားရှင်း v1.0.0 ဖြစ်ပြီး Biometric Enclave နှင့် BLE mesh အပြည့်အဝ အထောက်အပံ့ပေးထားပါသည်။'
          : 'The official signed Android APK is available on /download. It includes biometric secure enclave integration and BLE offline mesh support.'
      } else if (lower.includes('wallet') || lower.includes('ပိုက်ဆံအိတ်') || lower.includes('transfer') || lower.includes('ငွေလွှဲ')) {
        replyText = isAk
          ? 'ဖေ့သာပိုက်ဆံအိတ်တွင် အသုံးပြုသူအချင်းချင်း ငွေလွှဲခ ၀% ဖြစ်ပြီး ချက်ချင်း ရောက်ရှိပါသည်။ လိုအပ်ပါက သင့် Péthar ID သို့မဟုတ် Transaction Ref ID ပေးပို့ပေးပါခင်ဗျာ။'
          : 'User-to-user transfers in Péthar Wallet are instant with 0% fee. If you need transaction tracing, please provide your Péthar UID or Ref ID.'
      }

      const operatorMsg: ChatMessage = {
        id: `msg-op-${Date.now()}`,
        sender: 'operator',
        channel: chatChannel,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, operatorMsg])
    }, 850)
  }

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketSubject || !ticketEmail) return

    setSubmittingTicket(true)
    setTimeout(() => {
      setSubmittingTicket(false)
      const newId = `PT-TICK-${Math.floor(100000 + Math.random() * 900000)}`
      setSubmittedTicketId(newId)
      setTicketSubject('')
      setTicketEmail('')
      setTicketDesc('')
      setTicketTxHash('')
    }, 700)
  }

  const faqItems = [
    {
      q: isAk ? 'Péthar ပိုက်ဆံအိတ်ကို မည်သို့ စတင်အသုံးပြုရမည်နည်း။' : 'How do I initialize and secure my Péthar Wallet?',
      a: isAk
        ? 'Péthar အက်ပ်ကို ဒေါင်းလုဒ်လုပ်ပြီး မိနစ်ပိုင်းအတွင်း အကောင့်ဖွင့်နိုင်ပါသည်။ သင့်ဖုန်း၏ Hardware Secure Enclave ထဲတွင် Ed25519 သော့တွဲကို အလိုအလျောက် ထုတ်ယူပေးပြီး ဆာဗာသို့ သော့မပို့သောကြောင့် ၁၀၀% လုံခြုံမှုရှိပါသည်။'
        : 'Download Péthar from the official App Store, Google Play, or direct signed APK. During setup, your smartphone Secure Enclave locally generates an Ed25519 keypair. Your private keys never touch servers.',
    },
    {
      q: isAk ? 'အင်တာနက်နှင့် ဖုန်းလိုင်း ပြတ်တောက်နေချိန်တွင် မည်သို့ ငွေလွှဲနိုင်ပါသလဲ။' : 'How do offline payments function during internet blackouts?',
      a: isAk
        ? 'Péthar တွင် Bluetooth Low Energy (BLE) နှင့် NFC mesh နည်းပညာ ပါဝင်သောကြောင့် အင်တာနက်မရှိချိန်တွင်လည်း ဖုန်းအချင်းချင်း ထိတွေ့ကာ သော့လက်မှတ်ထိုးထားသော ပြေစာများ ဖလှယ်နိုင်ပါသည်။ အင်တာနက် ပြန်လည်ရရှိချိန်တွင် Ledger နှင့် အလိုအလျောက် စာရင်းရှင်းပေးပါသည်။'
        : 'Péthar uses localized BLE (2.4GHz) and NFC pulses to broadcast cryptographically signed payment vouchers up to 10 meters. Signed vouchers are verified locally and settle to the ledger once connected.',
    },
    {
      q: isAk ? 'အာရက္ခဒေါ်လာ (AKD) ၏ ၁:၁ ပုံသေနှုန်းနှင့် ငွေရန်ပုံငွေ အာမခံစနစ်က မည်သို့ရှိသနည်း။' : 'How does the 1:1 parity and reserve backing work?',
      a: isAk
        ? 'ဖေ့သာရှိ AKD တိုင်းသည် 1:1 USDT/USDC အရန်ငွေကြေးတို့ဖြင့် အပြည့်အဝ အာမခံထားရှိပါသည်။ အမေရိကန်ဒေါ်လာနှင့် ၁:၁ ပုံသေနှုန်းထားဖြင့် သတ်မှတ်ထားပြီး အချိန်နှင့်တစ်ပြေးညီ စစ်ဆေးနိုင်ပါသည်။'
        : 'Every Arakan Dollar (AKD) is defined at a fixed 1:1 peg to the US dollar, backed by collateral reserves in USDT and USDC.',
    },
    {
      q: isAk ? 'နိုင်ငံတကာမှ မိသားစုထံသို့ ငွေလွှဲပေးပို့ရာတွင် မည်မျှကြာသနည်း။' : 'How fast are global remittances?',
      a: isAk
        ? 'Péthar ကွန်ရက်တွင် ကမ္ဘာတစ်ဝှမ်း ချိတ်ဆက်ထားသောကြောင့် နယ်စပ်ဖြတ်ကျော် ငွေလွှဲမှုများသည် စက္ကန့် ၆၀ အတွင်း မိသားစု၏ ပိုက်ဆံအိတ်ထဲသို့ ကော်မရှင်ခ အနိမ့်ဆုံးဖြင့် တိုက်ရိုက်ရောက်ရှိပါသည်။'
        : 'Cross-border transfers settle into the recipient Péthar Wallet in under 60 seconds with 0% hidden FX spread and instantaneous Arakan Dollar parity.',
    },
    {
      q: isAk ? 'Android အက်ပ်နှင့် Mobile Wallet Chat Support သို့ မည်သို့ ဆက်သွယ်ရမည်နည်း။' : 'How do I get live assistance for Mobile Wallet or Android app?',
      a: isAk
        ? 'ဤ Support စာမျက်နှာရှိ Live Chat tab တွင် "Mobile Wallet Chat" သို့မဟုတ် "Android App Chat" channel ကို ရွေးချယ်ပြီး တာဝန်ကျ အော်ပရေတာနှင့် တိုက်ရိုက် စကားပြောဆိုနိုင်ပါသည်။'
        : 'Switch between "Mobile Wallet Chat" or "Android App Chat" on the Live Chat tab above to connect directly with the dedicated technical support operator.',
    },
  ]

  const filteredFaqs = faqItems.filter(
    (f) =>
      !searchQuery ||
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans flex flex-col">
      {/* ── TOP HEADER BAR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <ArakanEmblem size={32} variant="badge" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-950">Péthar</span>
                <span className="text-xs font-bold text-amber-600">Support Hub</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {isAk ? '၂၄/၇ တရားဝင် အကူအညီနှင့် စကားပြောခန်း' : '24/7 Official Assistance & Live Chat'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Nav & Language Switch */}
        <div className="flex items-center gap-2">
          {setLang && (
            <button
              onClick={() => setLang(isAk ? 'en' : 'ak')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200"
            >
              {isAk ? 'AK · အာရက္ခ' : 'EN · English'}
            </button>
          )}
          <a
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition shadow-2xs"
          >
            {isAk ? 'ဒက်ရှ်ဘုတ်' : 'Dashboard'}
          </a>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-500/20 text-xs font-mono font-bold uppercase tracking-wider">
            <LifeBuoy className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {isAk
                ? 'Péthar အကူအညီ & စကားပြောခန်း ဗဟိုဌာန'
                : 'Péthar Official Support & Live Desk'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            {isAk
              ? 'သင့်အတွက် ၂၄/၇ တိုက်ရိုက် အကူအညီပေးရေး'
              : 'How Can Our Support Desk Assist You?'}
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            {isAk
              ? 'မိုဘိုင်းပိုက်ဆံအိတ်၊ Android အက်ပ် နှင့် နယ်စပ်ဖြတ်ကျော် ငွေလွှဲပြောင်းမှုဆိုင်ရာ အကူအညီများကို တာဝန်ကျအော်ပရေတာများနှင့် တိုက်ရိုက် ဆက်သွယ်ရယူနိုင်ပါသည်'
              : 'Instant encrypted live chat with operators for mobile wallet users, Android app support, and transaction assistance'}
          </p>

          {/* Core Mode Tabs: Live Chat | Help Center & FAQ | Support Ticket */}
          <div className="flex items-center justify-center p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300 max-w-md mx-auto mt-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare size={14} className="text-[#FF6B00]" />
              <span>{isAk ? 'တိုက်ရိုက် Chat' : 'Live Chat'}</span>
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'help'
                  ? 'bg-white text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle size={14} className="text-amber-600" />
              <span>{isAk ? 'အမေးအဖြေ & လမ်းညွှန်' : 'Help & FAQ'}</span>
            </button>
            <button
              onClick={() => setActiveTab('ticket')}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'ticket'
                  ? 'bg-white text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail size={14} className="text-sky-600" />
              <span>{isAk ? 'အကူအညီတောင်းလွှာ' : 'Ticket'}</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 1: LIVE ENCRYPTED CHAT (CONNECTED TO ANDROID & MOBILE WALLET)
           ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in">
            {/* Top Bar with Channel Selector */}
            <div className="px-5 py-4 bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center font-black text-sm shadow-xs">
                  PT
                </div>
                <div>
                  <h3 className="text-xs font-black text-white flex items-center gap-2">
                    <span>
                      {chatChannel === 'android'
                        ? 'Android App Support Rail'
                        : chatChannel === 'mobilewallet'
                        ? 'Mobile Wallet Support Rail'
                        : 'Péthar General Operator Desk'}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    Duty Operator Online • &lt; 60s reply • E2EE Ed25519
                  </div>
                </div>
              </div>

              {/* Connected Support Channel Pill Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono">
                <button
                  onClick={() => setChatChannel('mobilewallet')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                    chatChannel === 'mobilewallet'
                      ? 'bg-[#FF6B00] text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wallet size={12} />
                  <span>Mobile Wallet</span>
                </button>
                <button
                  onClick={() => setChatChannel('android')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                    chatChannel === 'android'
                      ? 'bg-[#FF6B00] text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone size={12} />
                  <span>Android App</span>
                </button>
              </div>
            </div>

            {/* Sub-channel banner notice */}
            <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] font-mono text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-amber-600 shrink-0" />
                <span>
                  {chatChannel === 'android'
                    ? (isAk ? 'Android အက်ပ်သုံးစွဲသူ အကူအညီပေးရေး လိုင်းသို့ ချိတ်ဆက်ထားပါသည်' : 'Connected to Android App Technical Support Channel')
                    : (isAk ? 'မိုဘိုင်းပိုက်ဆံအိတ် ငွေပေးချေမှု အကူအညီပေးရေး လိုင်းသို့ ချိတ်ဆက်ထားပါသည်' : 'Connected to Mobile Wallet Payment & Account Support Channel')}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            {/* Chat Messages Body */}
            <div className="p-5 space-y-3.5 min-h-[340px] max-h-[460px] overflow-y-auto bg-slate-50/70">
              {messages.map((m) => {
                const isUser = m.sender === 'user'
                return (
                  <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed space-y-1.5 shadow-xs ${
                        isUser
                          ? 'bg-[#FF6B00] text-white rounded-br-xs font-medium'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] opacity-75 font-mono">
                        <span>{isUser ? 'You' : 'Péthar Operator (Officer Min)'}</span>
                        <span>{m.channel}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <p className={`text-[10px] font-mono text-right ${isUser ? 'text-white/80' : 'text-slate-400'}`}>
                        {m.time}
                      </p>
                    </div>
                  </div>
                )
              })}

              {isOperatorTyping && (
                <div className="flex justify-start">
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-bl-xs text-xs font-mono text-slate-500 flex items-center gap-2 shadow-xs">
                    <Clock size={13} className="animate-spin text-[#FF6B00]" />
                    <span>Operator is typing reply...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions Strip */}
            <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  handleSendMessage(
                    isAk
                      ? 'အာရက္ခဒေါ်လာ (AKD) ၁:၁ အမေရိကန်ဒေါ်လာ အရန်ငွေ မည်သို့ စစ်ဆေးရမလဲ?'
                      : 'How do I audit the 1:1 USD reserves for Arakan Dollar?'
                  )
                }
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition active:scale-95"
              >
                {isAk ? '၁:၁ အရန်ငွေကြေး' : '1:1 USD Reserves'}
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    isAk
                      ? 'အင်တာနက်မရှိဘဲ BLE mesh ဖြင့် ငွေလွှဲခြင်း ဘယ်လို လုပ်ဆောင်ရသလဲ?'
                      : 'How does offline BLE mesh transfer work during internet blackouts?'
                  )
                }
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition active:scale-95"
              >
                {isAk ? 'အော့ဖ်လိုင်း BLE Mesh' : 'Offline BLE Mesh'}
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    isAk
                      ? 'Android အက်ပ် apk အသစ် မည်သည့်နေရာတွင် ရယူနိုင်ပါသလဲ?'
                      : 'Where can I download the latest Android signed APK?'
                  )
                }
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition active:scale-95"
              >
                {isAk ? 'Android APK ရယူရန်' : 'Android APK Download'}
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2.5">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  isAk
                    ? 'အော်ပရေတာထံသို့ မေးခွန်း သို့မဟုတ် Ref ID ရိုက်ထည့်ပါ...'
                    : 'Type message or transaction Ref ID to operator...'
                }
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#FF6B00] font-sans"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-3 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 2: HELP CENTER & KNOWLEDGE BASE FAQ
           ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'help' && (
          <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAk
                    ? 'မေးခွန်း သို့မဟုတ် အကြောင်းအရာ ရှာဖွေပါ (ဥပမာ အရန်ငွေ၊ BLE၊ လုံခြုံရေး)...'
                    : 'Search help articles, reserve audits, offline mesh, remittances...'
                }
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            {/* Quick 3 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setActiveTab('chat')}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition space-y-1.5"
              >
                <Smartphone className="w-5 h-5 text-amber-600" />
                <h4 className="text-xs font-bold text-slate-950">Android & Mobile Support</h4>
                <p className="text-[11px] text-slate-500">Live operator assistance directly for app users.</p>
              </div>

              <div
                onClick={() => setOpenFaq(1)}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 cursor-pointer transition space-y-1.5"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-950">Keys & Security</h4>
                <p className="text-[11px] text-slate-500">How hardware enclave backup and biometrics work.</p>
              </div>

              <div
                onClick={() => setOpenFaq(2)}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-400 cursor-pointer transition space-y-1.5"
              >
                <CheckCircle2 className="w-5 h-5 text-sky-600" />
                <h4 className="text-xs font-bold text-slate-950">1:1 USD Reserves</h4>
                <p className="text-[11px] text-slate-500">USDT/USDC collateral backing verification.</p>
              </div>
            </div>

            {/* Accordion List */}
            <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div key={idx} className="transition-colors">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-xs text-slate-900 hover:text-[#FF6B00] transition-colors"
                    >
                      <span className="text-sm font-black">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#FF6B00] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed font-sans border-t border-slate-50 pt-2.5 animate-in fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 3: PRIORITY SUPPORT TICKET & PHYSICAL HUBS
           ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ticket' && (
          <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
            {/* Ticket Form Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  {isAk ? 'အရေးပေါ် အကူအညီ တောင်းဆိုလွှာ (Support Ticket)' : 'Submit an Escalated Support Ticket'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAk
                    ? 'ငွေလွှဲပြေစာ စိစစ်ရန် သို့မဟုတ် အကောင့်ဆိုင်ရာ ကိစ္စရပ်များအတွက် ဦးစားပေး တောင်းဆိုနိုင်ပါသည်'
                    : 'For transaction reconciliations, card issues, or institutional onboarding inquiries'}
                </p>
              </div>

              {submittedTicketId && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    {isAk
                      ? `သင်၏ အကူအညီတောင်းခံလွှာကို လက်ခံရရှိပါပြီ။ လက်မှတ်နံပါတ်: `
                      : `Ticket successfully logged to operator dispatch! Ticket ID: `}
                    <span className="underline text-emerald-950">{submittedTicketId}</span>
                  </span>
                </div>
              )}

              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      required
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      placeholder="citizen@pethar.co.uk"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Subject / Category</label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Mobile Wallet transfer or KYC verification"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Transaction ID / Hash (Optional)</label>
                  <input
                    type="text"
                    value={ticketTxHash}
                    onChange={(e) => setTicketTxHash(e.target.value)}
                    placeholder="e.g. 0x8a92... or TX-4921"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#FF6B00] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Detailed Inquiry</label>
                  <textarea
                    rows={4}
                    required
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    placeholder="Describe your issue with device model, Android version, or recipient details..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-6 py-3 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <Send size={14} />
                  <span>{submittingTicket ? 'Submitting...' : isAk ? 'တောင်းဆိုလွှာ ပေးပို့မည်' : 'Submit Priority Ticket'}</span>
                </button>
              </form>
            </div>

            {/* Physical Walk-In Hubs */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <MapPin size={16} />
                <span>{isAk ? 'လူကိုယ်တိုင် ဆက်သွယ်နိုင်သော ရုံးခန်းများ' : 'Physical Walk-In Assistance Hubs'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <div className="font-bold text-white">Sittwe Central Hub</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Main Port Road, Sittwe</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <div className="font-bold text-white">Mae Sot Border Desk</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Tak Province, Thailand</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <div className="font-bold text-white">Bangkok Liaison Office</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Silom Road, Bangkok</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER SECURITY GUARANTEE ── */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-2 font-medium">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>
            {isAk
              ? 'လုံခြုံရေး အာမခံချက်: Péthar ဝန်ထမ်းများသည် သင်၏ PIN သို့မဟုတ် လျှို့ဝှက်သော့ကို မည်သည့်အခါမျှ တောင်းခံမည်မဟုတ်ပါ။'
              : 'Security Assurance: Péthar operators will NEVER ask for your private recovery phrase, PIN, or password.'}
          </span>
        </div>
      </footer>
    </div>
  )
}

export default SupportPage
