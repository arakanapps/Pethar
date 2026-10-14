import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Send,
  ShieldCheck,
  Smartphone,
  Trash2,
  WifiOff,
} from 'lucide-react'
import { ArakanEmblem, FlagArakanCircle, FlagUKCircle } from '../components/ArakanEmblem'
import type { Language } from '../i18n'
import { goToAuth } from '../utils/subdomain'

interface LandingPageProps {
  lang?: Language
  setLang?: (lang: Language) => void
}

export default function LandingPage({ lang = 'ak', setLang }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false)
  const [balanceHidden, setBalanceHidden] = useState(false)
  const ak = lang === 'ak'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.title = ak
      ? 'Pe Thar (ဖေ့သာ) — AKD ပိုက်ဆံအိတ်'
      : 'Pe Thar (ဖေ့သာ) — AKD wallet'
    document.documentElement.lang = ak ? 'my' : 'en'
  }, [ak])

  const copy = ak
    ? {
        tagline: 'ဖေ့သာ — ရခိုင့်အဓိပ္ပာယ်ဖြင့် ငွေ',
        navHome: 'ပင်မ',
        navHow: 'အလုပ်လုပ်ပုံ',
        navOffline: 'အွန်လိုင်း + အော့ဖ်လိုင်း',
        navPrivacy: 'လုံခြုံရေး',
        login: 'အကောင့်ဝင်ရန်',
        signup: 'အကောင့်ဖွင့်ရန်',
        langAria: 'Switch to English',
        eyebrow: 'အွန်လိုင်း + အော့ဖ်လိုင်း  ·  ၁ ₳ = ၁ USD',
        headline: 'အာရက္ခဒေါ်လာ (AKD) ဖြင့် ငွေကိုင်၊ ငွေလွှဲ။',
        subhead:
          'ဖေ့သာသည် AKD ပိုက်ဆံအိတ်ဖြစ်သည်။ ၁ ₳ သည် ၁ ဒေါ်လာနှင့် ညီသည်။ အင်တာနက်ရှိလည်း သုံးနိုင်၊ မရှိလည်း လူအချင်းချင်း ပို့နိုင်သည်။',
        howTitle: 'ဖေ့သာ အလုပ်လုပ်ပုံ',
        howIntro: 'အဆင့်လေးဆင့်။ ဝဘ်ဘဏ်ခလုတ် မလို။',
        s1t: 'အကောင့်ဖွင့်ပါ',
        s1d: 'Google၊ သို့မဟုတ် နာမည်၊ အီးမေးလ်၊ စကားဝှက်။',
        s2t: 'AKD ကိုင်ပါ',
        s2d: 'လက်ကျန်ကို ₳ ဖြင့် ပြသည်။ ၁ ₳ = ၁ ဒေါ်လာ။',
        s3t: 'ပို့ပါ',
        s3d: 'ဖေ့သာသုံးသူထံ လူအချင်းချင်း လွှဲသည်။ ငွေဝင်ငွေထွက်တွင် မြင်ရမည်။',
        s4t: 'အင်တာနက်မရှိ? အော့ဖ်လိုင်းမုဒ်',
        s4d: 'ငွေကို ဒေတာအဖြစ် စက်နှစ်လုံးအကြား ပို့သည်။ အွန်လိုင်းပြန်ရလျှင် စင့်ခ်ဖြစ်သည်။',
        offTitle: 'တစ်အက်ပ်။ အွန်လိုင်းနှင့် အော့ဖ်လိုင်း။',
        offIntro:
          'Cashu ကဲ့သို့ — ငွေကို သင့်စက်ထဲတွင် ကိုင်ထားသော bearer cash အဖြစ် သိမ်းသည်။ အင်တာနက်ပြတ်လျှင် လူအချင်းချင်း ဒေတာပို့ရုံ။ လိုအပ်သည့်အခါ အက်ပ်က ခွင့်ပြုချက် တောင်းမည်။',
        onCard: 'အွန်လိုင်း',
        onBody: 'လက်ကျန် အချိန်နှင့်တစ်ပြေးညီ။ ပို့၊ လက်ခံ။ ငွေဝင်ငွေထွက် အပြည့်။',
        offCard: 'အော့ဖ်လိုင်းမုဒ်',
        offBody: 'လူအချင်းချင်း။ လွှဲမှုကို စက်ထဲတွင် သိမ်းပြီး စင့်ခ်လုပ်နိုင်သည့်အခါ ပြီးစီးသည်။',
        nowTitle: 'အက်ပ်တွင် ယခု',
        nowItems: [
          'AKD လက်ကျန်',
          'ပို့နှင့် လက်ခံ',
          'ငွေဝင်ငွေထွက်',
          'အော့ဖ်လိုင်း bearer cash',
          'နာမည်နှင့် အီးမေးလ်',
        ],
        later:
          'အိုင်ဒီ၊ ဖုန်း၊ ကတ်များသည် နောက်မှ။ စတင်ရန် မလို။',
        privTitle: 'ကိုယ်ရေးအချက်အလက်နှင့် လုံခြုံရေး',
        privLead:
          'ဖေ့သာသည် Firebase Authentication သုံးသည်။ Google သို့မဟုတ် အီးမေးလ်နှင့် စကားဝှက်။ Google မှ နာမည်နှင့် အီးမေးလ်ကို အကောင့်ဖွင့်ရန်သာ သုံးသည်။',
        p1t: 'ဘာကို စုသလဲ',
        p1d: 'နာမည်၊ အီးမေးလ်၊ Google ဝင်လျှင် Google အိုင်ဒီ။ တိုက်ရိုက်ဖွင့်လျှင် စကားဝှက်။ ပိုက်ဆံအိတ် လွှဲမှတ်တမ်း။',
        p2t: 'ဘာကြောင့်',
        p2d: 'အကောင့်ဝင်ရန်၊ လက်ကျန်ပြရန်၊ ငွေလွှဲရန်၊ လုံခြုံရေးသတိပေးရန်။ ကြော်ငြာ မလုပ်။ ဒေတာ မရောင်း။',
        p3t: 'ဘယ်သူက ထိန်းသလဲ',
        p3d: 'Pe Thar · pethar.co.uk · Firebase / Google Cloud တွင် လက်ခံထားသည်။',
        p4t: 'ဖျက်ပိုင်ခွင့်',
        p4d: 'အကောင့်နှင့် ကိုယ်ရေးဒေတာ ဖျက်ခိုင်းနိုင်သည်။ privacy@pethar.co.uk',
        faqTitle: 'မေးလေ့ရှိသော မေးခွန်းများ',
        faqs: [
          { q: 'AKD ဆိုသည်မှာ?', a: 'အာရက္ခဒေါ်လာ။ ဖေ့သာတွင် ၁ ₳ = ၁ USD။' },
          { q: 'အကောင့်ဘယ်လိုဖွင့်မလဲ?', a: 'Google၊ သို့မဟုတ် နာမည် + အီးမေးလ် + စကားဝှက်။ ပြီးလျှင် ပိုက်ဆံအိတ်သို့ ရောက်သည်။' },
          { q: 'အင်တာနက်မရှိရင် သုံးလို့ရသလား?', a: 'ရသည်။ အော့ဖ်လိုင်းမုဒ်သည် လူအချင်းချင်း bearer cash။ အွန်လိုင်းပြန်ရလျှင် စင့်ခ်ဖြစ်သည်။' },
          { q: 'စတင်ရန် အိုင်ဒီလိုသလား?', a: 'ယခု မလိုသေး။' },
        ],
        ctaTitle: 'ဖေ့သာ ပိုက်ဆံအိတ် ဖွင့်ပါ',
        ctaBody: 'နာမည်၊ အီးမေးလ်၊ စကားဝှက် — သို့မဟုတ် Google။',
        mockWelcome: 'ပြန်လည်ကြိုဆိုပါသည်',
        mockAvail: 'လက်ရှိလက်ကျန်',
        mockSend: 'ပို့ရန်',
        mockRequest: 'တောင်းရန်',
        mockOffline: 'အော့ဖ်လိုင်းမုဒ်',
        mockToken: 'Bearer cash',
        mockRecent: 'နောက်ဆုံး လှုပ်ရှားမှု',
        footer: 'Pe Thar (ဖေ့သာ) · AKD ပိုက်ဆံအိတ်',
      }
    : {
        tagline: 'Money, in Arakanese',
        navHome: 'Home',
        navHow: 'How it works',
        navOffline: 'Online + Offline',
        navPrivacy: 'Privacy',
        login: 'Log in',
        signup: 'Sign up',
        langAria: 'ရခိုင်ဘာသာသို့ ပြောင်းမည်',
        eyebrow: 'Online + Offline  ·  1 ₳ = 1 USD',
        headline: 'Hold and send money in AKD.',
        subhead:
          'Pe Thar (ဖေ့သာ) is a wallet for the Arakan Dollar. One ₳ equals one US dollar. Use it with internet — and pass cash as data when you have none.',
        howTitle: 'How Pe Thar works',
        howIntro: 'Four steps. No try-the-bank button. After you sign in, you are in the wallet.',
        s1t: 'Create an account',
        s1d: 'Google, or your name, email, and password.',
        s2t: 'Hold AKD',
        s2d: 'Your balance is in ₳. One ₳ is one US dollar.',
        s3t: 'Send',
        s3d: 'Person to person, to another Pe Thar user. It shows in your cashflow.',
        s4t: 'No internet? Offline mode',
        s4d: 'Pass a token between two phones, like Cashu. It syncs when you are back online.',
        offTitle: 'One app. Online and offline.',
        offIntro:
          'Like Cashu — spendable balance as bearer cash on the device. When the network is down, you still move a token person to person. The app asks for permission only when you send that way.',
        onCard: 'Online',
        onBody: 'Live balance. Send and receive. Full cashflow.',
        offCard: 'Offline mode',
        offBody: 'Person to person. The token sits on the phones until it can sync.',
        nowTitle: 'In the app now',
        nowItems: [
          'AKD balance',
          'Send and receive',
          'Cashflow',
          'Offline bearer cash',
          'Name and email',
        ],
        later: 'ID, phone, and cards come later. Not required to start.',
        privTitle: 'Privacy and security',
        privLead:
          'Pe Thar uses Firebase Authentication on Google Cloud. You sign in with Google, or with email and password. We use your Google name and email only to open and identify your wallet.',
        p1t: 'What we collect',
        p1d: 'Name, email, and a Google user id if you use Google Sign-In. Password if you register with email. Wallet amounts and timestamps.',
        p2t: 'Why',
        p2d: 'To sign you in, show your balance, send AKD, and protect the account. We do not sell data. We do not use Google data for ads.',
        p3t: 'Who runs this',
        p3d: 'Pe Thar at pethar.co.uk. Auth and data sit on Firebase / Google Cloud.',
        p4t: 'Delete your data',
        p4d: 'Ask us to delete your account and personal data. privacy@pethar.co.uk',
        faqTitle: 'Questions',
        faqs: [
          { q: 'What is AKD?', a: 'The Arakan Dollar. In Pe Thar, 1 ₳ = 1 USD.' },
          { q: 'How do I sign up?', a: 'Google, or name + email + password. Then you land in the wallet at app.pethar.co.uk.' },
          { q: 'Does it work without internet?', a: 'Yes. Offline mode is person-to-person bearer cash. It syncs when you are back online.' },
          { q: 'Do I need an ID to start?', a: 'Not now.' },
        ],
        ctaTitle: 'Open a Pe Thar wallet',
        ctaBody: 'Name, email, password — or Google.',
        mockWelcome: 'Welcome back',
        mockAvail: 'Available',
        mockSend: 'Send',
        mockRequest: 'Request',
        mockOffline: 'Offline mode',
        mockToken: 'Bearer cash',
        mockRecent: 'Activity',
        footer: 'Pe Thar (ဖေ့သာ) · AKD wallet',
      }

  const nav = [
    { href: '#home', label: copy.navHome },
    { href: '#how', label: copy.navHow },
    { href: '#offline', label: copy.navOffline },
    { href: '#privacy', label: copy.navPrivacy },
  ]

  return (
    <div
      lang={ak ? 'my' : 'en'}
      className="min-h-screen bg-[#F4F1EA] text-slate-900 overflow-x-hidden font-sans"
    >
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#F4F1EA]/90 backdrop-blur-xl border-b border-stone-200/80'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <a href="#home" className="flex items-center gap-2.5 min-w-0">
            <ArakanEmblem size={34} variant="badge" />
            <div className="min-w-0">
              <div className="text-[15px] font-extrabold tracking-tight leading-none">Pe Thar</div>
              <div className="text-[10px] text-stone-500 truncate">{copy.tagline}</div>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-stone-600">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-full hover:bg-white/80 hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang?.(ak ? 'en' : 'ak')}
              className="w-8 h-8 rounded-full overflow-hidden shrink-0"
              aria-label={copy.langAria}
            >
              {ak ? <FlagUKCircle size={32} /> : <FlagArakanCircle size={32} />}
            </button>
            <button
              type="button"
              onClick={() => goToAuth('login')}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold text-stone-700 hover:bg-white"
            >
              {copy.login}
            </button>
            <button
              type="button"
              onClick={() => goToAuth('signup')}
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-[13px] font-bold bg-[#111] text-white hover:bg-stone-800"
            >
              {copy.signup}
            </button>
          </div>
        </div>
      </header>

      <section id="home" className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20 md:pt-16 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 text-[11px] font-semibold text-stone-600 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {copy.eyebrow}
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] text-slate-950">
              {copy.headline}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
              {copy.subhead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => goToAuth('signup')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111] text-white font-bold text-sm hover:bg-stone-800"
              >
                {copy.signup}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => goToAuth('login')}
                className="inline-flex items-center px-6 py-3 rounded-full bg-white border border-stone-200 font-bold text-sm text-slate-800 hover:border-stone-400"
              >
                {copy.login}
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[340px]">
            <div className="absolute -inset-8 bg-amber-300/25 blur-3xl rounded-full pointer-events-none" />
            <div className="relative rounded-[2.2rem] bg-[#111] text-white p-5 shadow-2xl shadow-stone-900/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ArakanEmblem size={28} variant="badge" />
                  <div>
                    <div className="text-[10px] text-stone-400">{copy.mockWelcome}</div>
                    <div className="text-sm font-bold">Pe Thar</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  {copy.mockOffline}
                </span>
              </div>
              <div className="text-[11px] text-stone-400 mb-1">{copy.mockAvail}</div>
              <div className="flex items-center justify-between mb-6">
                <div className="text-3xl font-extrabold tracking-tight">
                  {balanceHidden ? '₳ •••••' : '₳ 0.00'}
                </div>
                <button
                  type="button"
                  onClick={() => setBalanceHidden((v) => !v)}
                  className="p-2 rounded-full bg-white/10"
                  aria-label="Toggle balance"
                >
                  {balanceHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="rounded-2xl bg-amber-400 text-slate-950 py-3 text-center text-sm font-bold">
                  {copy.mockSend}
                </div>
                <div className="rounded-2xl bg-white/10 py-3 text-center text-sm font-bold">
                  {copy.mockRequest}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="flex items-center justify-between text-[11px] text-stone-400 mb-2">
                  <span>{copy.mockRecent}</span>
                  <span className="text-amber-300 font-semibold">{copy.mockToken}</span>
                </div>
                <div className="text-sm text-stone-200">—</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{copy.howTitle}</h2>
        <p className="mt-2 text-stone-600">{copy.howIntro}</p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { n: '1', t: copy.s1t, d: copy.s1d },
            { n: '2', t: copy.s2t, d: copy.s2d },
            { n: '3', t: copy.s3t, d: copy.s3d },
            { n: '4', t: copy.s4t, d: copy.s4d },
          ].map((s) => (
            <div key={s.n} className="rounded-3xl bg-white border border-stone-200 p-5">
              <div className="text-xs font-bold text-amber-600 mb-3">{s.n}</div>
              <h3 className="font-bold text-slate-900 mb-2">{s.t}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="offline" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{copy.offTitle}</h2>
        <p className="mt-3 text-stone-600 max-w-2xl leading-relaxed">{copy.offIntro}</p>
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white border border-stone-200 p-6">
            <Smartphone className="w-5 h-5 text-emerald-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">{copy.onCard}</h3>
            <p className="text-sm text-stone-600">{copy.onBody}</p>
          </div>
          <div className="rounded-3xl bg-[#111] text-white p-6">
            <WifiOff className="w-5 h-5 text-amber-400 mb-3" />
            <h3 className="font-bold text-lg mb-2">{copy.offCard}</h3>
            <p className="text-sm text-stone-300">{copy.offBody}</p>
          </div>
        </div>
      </section>

      <section id="now" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{copy.nowTitle}</h2>
        <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {copy.nowItems.map((item) => (
            <li
              key={item}
              className="rounded-2xl bg-white border border-stone-200 px-4 py-3 text-sm font-semibold"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-stone-500">{copy.later}</p>
      </section>

      <section id="privacy" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{copy.privTitle}</h2>
        <p className="mt-3 text-stone-600 max-w-2xl leading-relaxed">{copy.privLead}</p>
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {[
            { icon: ShieldCheck, t: copy.p1t, d: copy.p1d },
            { icon: Lock, t: copy.p2t, d: copy.p2d },
            { icon: Send, t: copy.p3t, d: copy.p3d },
            { icon: Trash2, t: copy.p4t, d: copy.p4d },
          ].map((b) => (
            <div key={b.t} className="rounded-3xl bg-white border border-stone-200 p-5">
              <b.icon className="w-4 h-4 text-stone-700 mb-3" />
              <h3 className="font-bold mb-1.5">{b.t}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{copy.faqTitle}</h2>
        <div className="mt-6 space-y-3">
          {copy.faqs.map((f) => (
            <div key={f.q} className="rounded-2xl bg-white border border-stone-200 p-5">
              <h3 className="font-bold mb-1">{f.q}</h3>
              <p className="text-sm text-stone-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="rounded-[2rem] bg-[#111] text-white px-6 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold">{copy.ctaTitle}</h2>
          <p className="mt-3 text-stone-400">{copy.ctaBody}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => goToAuth('signup')}
              className="px-6 py-3 rounded-full bg-amber-400 text-slate-950 font-bold text-sm"
            >
              {copy.signup}
            </button>
            <button
              type="button"
              onClick={() => goToAuth('login')}
              className="px-6 py-3 rounded-full bg-white/10 font-bold text-sm"
            >
              {copy.login}
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-500">
        {copy.footer}
      </footer>
    </div>
  )
}
