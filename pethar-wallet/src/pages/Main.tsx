import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Send,
  ShieldCheck,
  Smartphone,
  WifiOff,
  Download,
  ExternalLink
} from 'lucide-react'
import { ArakanEmblem, FlagArakanCircle, FlagUKCircle } from '../components/ArakanEmblem'
import type { Language } from '../i18n'
import { goToAuth } from '../utils/subdomain'
import './Main.css'

interface MainProps {
  lang?: Language
  setLang?: (lang: Language) => void
}

export default function Main({ lang = 'ak', setLang }: MainProps) {
  const [balanceHidden, setBalanceHidden] = useState(false)
  const ak = lang === 'ak'

  useEffect(() => {
    document.title = ak
      ? 'Péthar (ဖေ့သာ) — 1 ₳ = 1 $ · Online + Offline Mode'
      : 'Péthar (ဖေ့သာ) — 1 ₳ = 1 $ · Online + Offline Mode'
    document.documentElement.lang = ak ? 'my' : 'en'
  }, [ak])

  const copy = ak
    ? {
        tagline: 'ဖေ့သာ — ဒစ်ဂျစ်တယ်ငွေကြေးစနစ်',
        navHome: 'ပင်မ',
        navHow: 'အလုပ်လုပ်ပုံ',
        navOffline: 'အော့ဖ်လိုင်းမုဒ်',
        navDownload: 'ဒေါင်းလုဒ်',
        navPrivacy: 'လုံခြုံရေး',
        login: 'အကောင့်ဝင်ရန်',
        signup: 'အကောင့်ဖွင့်ရန်',
        langAria: 'Switch to English',
        eyebrow: '● ၁ ₳ = ၁ $  ·  အွန်လိုင်း + အော့ဖ်လိုင်းမုဒ်',
        headline: 'အာရက္ခဒေါ်လာ (AKD) ဖြင့် ငွေကိုင်၊ ငွေလွှဲ။ အွန်လိုင်းရော အော့ဖ်လိုင်းမုဒ်ပါ သုံးနိုင်သည်။',
        subhead:
          'ဖေ့သာ (Péthar) သည် ၁ ₳ = ၁ $ တည်ငြိမ်ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ်ဖြစ်သည်။ ဝဘ်ဘရောက်ဆာတွင် အွန်လိုင်းသုံးနိုင်ပြီး Android နှင့် iOS ဖုန်းများတွင် အင်တာနက်မရှိဘဲ အော့ဖ်လိုင်းမုဒ်ဖြင့် ငွေလွှဲနိုင်သည်။',
        getStarted: 'စတင်အသုံးပြုမည်',
        downloadApk: 'Android APK ရယူမည်',
        downloadIos: 'iOS Profile ထည့်သွင်းမည်',
        howTitle: 'ဖေ့သာ အလုပ်လုပ်ပုံ',
        howIntro: 'လွယ်ကူရှင်းလင်းသော အဆင့် ၄ ဆင့်။ စတင်ရန် မည်သည့်စာရွက်စာတမ်းမှ မလိုပါ။',
        s1t: 'အကောင့်ဖွင့်ပါ',
        s1d: 'Google ဖြင့် ၁ ချက်နှိပ်၊ သို့မဟုတ် နာမည်၊ အီးမေးလ်၊ စကားဝှက်ဖြင့် စက္ကန့်ပိုင်းအတွင်း ဖွင့်နိုင်သည်။',
        s2t: 'AKD ကိုင်ပါ',
        s2d: 'လက်ကျန်ကို ₳ ဖြင့် ပြသည်။ ၁ ₳ သည် ၁ US ဒေါ်လာနှင့် အမြဲတမ်း တန်ဖိုးတူညီသည်။',
        s3t: 'ငွေလွှဲ၊ ငွေလက်ခံပါ',
        s3d: 'အွန်လိုင်းရှိပါက ချက်ချင်းငွေလွှဲနိုင်သည်။ ငွေစာရင်းရှင်းတမ်းများကို အချိန်နှင့်တစ်ပြေးညီ တွေ့ရမည်။',
        s4t: 'အင်တာနက်မရှိချိန် အော့ဖ်လိုင်းမုဒ်',
        s4d: 'Android နှင့် iOS အက်ပ်တွင် Cashu bearer cash ကဲ့သို့ ဖုန်းအချင်းချင်း ဒေတာလွှဲနိုင်သည်။ ပြန်လည်စင့်ခ်လုပ်ပေးသည်။',
        offTitle: 'အွန်လိုင်းရော အော့ဖ်လိုင်းမုဒ်ပါ စုံလင်သော စနစ်',
        offIntro:
          'Web ပေါ်တွင် အွန်လိုင်းသုံးစွဲနိုင်ပြီး မိုဘိုင်းဖုန်းများ (Android & iOS) တွင် အင်တာနက်မရှိဘဲ bearer cash ပုံစံဖြင့် ငွေလွှဲနိုင်အောင် တည်ဆောက်ထားသည်။',
        onCard: 'အွန်လိုင်း မုဒ် (Web & Mobile)',
        onBody: 'လက်ကျန်ငွေ အချိန်နှင့်တစ်ပြေးညီ စင့်ခ်ဖြစ်သည်။ ငွေပို့၊ ငွေလက်ခံနှင့် စာရင်းရှင်းတမ်း အပြည့်အစုံ ရရှိသည်။',
        offCard: 'အော့ဖ်လိုင်း မုဒ် (Android & iOS သီးသန့်)',
        offBody: 'ဖုန်းအချင်းချင်း ဒေတာအဖြစ် ပို့သည်။ Bluetooth/NFC/QR ဖြင့် လွှဲပြီး အင်တာနက်ပြန်ရချိန်တွင် ဗဟိုစာရင်းသို့ အလိုအလျောက် စင့်ခ်ဖြစ်သည်။',
        statReserves: '၁၀၀% အရန်ငွေ ကျောထောက်နောက်ခံ',
        statPeg: '၁ ₳ = ၁ $ USD တိကျသော တန်ဖိုး',
        statSecurity: 'Google Cloud / Firebase လုံခြုံရေး',
        privTitle: 'ကိုယ်ရေးအချက်အလက်နှင့် လုံခြုံရေး',
        privLead:
          'ဖေ့သာသည် Firebase Authentication ကို အသုံးပြုထားသည်။ နာမည်နှင့် အီးမေးလ်ကို အကောင့်ခွဲခြားရန်သာ သုံးပြီး ကြော်ငြာမလုပ်ပါ၊ ဒေတာမရောင်းပါ။',
        p1t: 'ရယူသော အချက်အလက်',
        p1d: 'အခြေခံ အီးမေးလ်၊ နာမည်နှင့် Google User ID (openid, email, profile) သာ။ Gmail သို့မဟုတ် Drive ဒေတာများကို မယူပါ။',
        p2t: 'အချက်အလက် အသုံးပြုပုံ',
        p2d: 'အကောင့်လုံခြုံရေး၊ လက်ကျန်ငွေပြသခြင်းနှင့် ငွေလွှဲမှတ်တမ်း ထိန်းသိမ်းရန်သာ အသုံးပြုသည်။',
        p3t: 'ဒေတာဖျက်ခွင့်',
        p3d: 'အကောင့်နှင့် ကိုယ်ရေးဒေတာများကို အချိန်မရွေး ဖျက်ပိုင်ခွင့်ရှိသည်။ privacy@pethar.co.uk သို့ ဆက်သွယ်နိုင်သည်။',
        faqTitle: 'မေးလေ့ရှိသော မေးခွန်းများ',
        faqs: [
          { q: 'AKD ဆိုသည်မှာ ဘာလဲ?', a: 'အာရက္ခဒေါ်လာ ဖြစ်သည်။ ဖေ့သာတွင် ၁ ₳ = ၁ USD အမြဲတမ်း ညီမျှသည်။' },
          { q: 'ငွေတန်ဖိုးကို ဘာနဲ့ အာမခံထားသလဲ?', a: 'အတွင်းပိုင်း Treasury တွင် USDT/USDC/USD1 အရန်ငွေများဖြင့် ၁၀၀% အပြည့်အဝ ထိန်းကျောင်းထားသည်။' },
          { q: 'အော့ဖ်လိုင်းမုဒ်ကို ဘယ်မှာ သုံးနိုင်သလဲ?', a: 'Android နှင့် iOS မိုဘိုင်းအက်ပ်များတွင် သီးသန့် အသုံးပြုနိုင်သည်။' },
          { q: 'အကောင့်ဖွင့်ရန် မှတ်ပုံတင်လိုသလား?', a: 'စတင်အသုံးပြုရန် မှတ်ပုံတင်၊ နိုင်ငံသားကတ် သို့မဟုတ် ဖုန်းနံပါတ် မလိုသေးပါ။' },
        ],
        ctaTitle: 'Péthar (ဖေ့သာ) ကို ယခုပင် စတင်သုံးစွဲပါ',
        ctaBody: 'Google ဖြင့် အလွယ်တကူ ဝင်ရောက်ပါ၊ သို့မဟုတ် မိုဘိုင်းအက်ပ်ကို တိုက်ရိုက် ဒေါင်းလုဒ်လုပ်ပါ။',
        mockWelcome: 'ပြန်လည်ကြိုဆိုပါသည်',
        mockAvail: 'ရရှိနိုင်သော လက်ကျန်',
        mockSend: 'ငွေပို့',
        mockRequest: 'ငွေတောင်း',
        mockOffline: 'အော့ဖ်လိုင်း အသင့်ရှိ',
        footer: 'Péthar (ဖေ့သာ) · pethar.co.uk · 1 ₳ = 1 $ · Online + Offline Mode',
      }
    : {
        tagline: 'Digital Cash for Arakan',
        navHome: 'Home',
        navHow: 'How It Works',
        navOffline: 'Offline Mode',
        navDownload: 'Download',
        navPrivacy: 'Privacy',
        login: 'Log in',
        signup: 'Sign up',
        langAria: 'ရခိုင်ဘာသာသို့ ပြောင်းမည်',
        eyebrow: '● 1 ₳ = 1 $  ·  Online + Offline Mode',
        headline: 'Hold and send money in AKD. Online and in Offline Mode.',
        subhead:
          'Péthar (ဖေ့သာ) is a stable digital wallet pegged 1 ₳ = 1 $. Manage your wallet online on the web, or use our mobile apps for Android and iOS with Offline Mode to transfer cash person-to-person.',
        getStarted: 'Open Wallet',
        downloadApk: 'Download Android APK',
        downloadIos: 'Install iOS Profile',
        howTitle: 'How Péthar Works',
        howIntro: 'Four simple steps. Zero paperwork or identity friction to start.',
        s1t: 'Create an Account',
        s1d: 'One-tap with Google or Name, Email, and Password in seconds.',
        s2t: 'Hold AKD',
        s2d: 'Your balance is denominated in ₳. One ₳ strictly equals one US dollar.',
        s3t: 'Send and Receive',
        s3d: 'Instant transfers online with full, transparent cashflow statements.',
        s4t: 'Offline Mode on Mobile',
        s4d: 'When disconnected, pass bearer tokens phone-to-phone on Android & iOS. Syncs automatically upon reconnection.',
        offTitle: 'Dual Connectivity: Online + Offline Mode',
        offIntro:
          'Access your wallet online from any desktop or mobile browser, and use our dedicated Android & iOS apps with Offline Mode during connectivity blackouts.',
        onCard: 'Online Mode (Web & Mobile)',
        onBody: 'Real-time cloud ledger sync, instant transfers, incoming receipts, and account management.',
        offCard: 'Offline Mode (Android & iOS Only)',
        offBody: 'Cashu-inspired bearer tokens transferred peer-to-peer over local data. Automatically settles to the cloud ledger.',
        statReserves: '100% USDT / USDC Backing',
        statPeg: '1 ₳ = $1.00 USD Parity',
        statSecurity: 'Google Cloud Security Standards',
        privTitle: 'Privacy and Security Standards',
        privLead:
          'Péthar uses Firebase Authentication on Google Cloud. Minimal scopes (openid, email, profile), zero advertising use, and no data reselling.',
        p1t: 'What We Access',
        p1d: 'Basic profile identity (Name, Email, Google UID). We never request or access Gmail, Google Drive, or Calendar.',
        p2t: 'How We Protect Data',
        p2d: 'Data is strictly used to authenticate your wallet and record your transaction ledgers.',
        p3t: 'Right to Deletion',
        p3d: 'Request complete account and data purging at privacy@pethar.co.uk anytime.',
        faqTitle: 'Frequently Asked Questions',
        faqs: [
          { q: 'What is AKD?', a: 'The Arakan Dollar. In Péthar, 1 ₳ = $1.00 USD at all times.' },
          { q: 'How is the value guaranteed?', a: 'Backed internally 1:1 by audited institutional USD stablecoin reserves (USDT, USDC, USD1).' },
          { q: 'Where does Offline Mode work?', a: 'Offline Mode is an exclusive feature of the Péthar mobile apps on Android and iOS.' },
          { q: 'Is citizenship or ID required?', a: 'No citizenship documents, ID cards, or photo KYC required to start.' },
        ],
        ctaTitle: 'Get Started with Péthar Today',
        ctaBody: 'Open your wallet on the web or download the mobile app for Android and iOS.',
        mockWelcome: 'Welcome back',
        mockAvail: 'Available Balance',
        mockSend: 'Send ₳',
        mockRequest: 'Receive',
        mockOffline: 'Offline Ready',
        footer: 'Péthar (ဖေ့သာ) · pethar.co.uk · 1 ₳ = 1 $ · Online + Offline Mode',
      }

  return (
    <div lang={ak ? 'my' : 'en'} className="fl">
      {/* Floating Ambient Blobs */}
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />

      {/* Navigation Header */}
      <nav className="glass nav z">
        <a href="#home" className="logo">
          <ArakanEmblem size={32} variant="badge" />
          <span>Péthar</span>
        </a>

        <div className="navl">
          <a href="#how">{copy.navHow}</a>
          <a href="#offline">{copy.navOffline}</a>
          <a href="/ios.html">iOS</a>
          <a href="/download">{copy.navDownload}</a>
          <a href="#privacy">{copy.navPrivacy}</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => setLang?.(ak ? 'en' : 'ak')}
            style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
            aria-label={copy.langAria}
          >
            {ak ? <FlagUKCircle size={30} /> : <FlagArakanCircle size={30} />}
          </button>
          <button
            type="button"
            onClick={() => goToAuth('login')}
            className="pill-outline"
            style={{ height: 38, padding: '0 16px', fontSize: 13 }}
          >
            {copy.login}
          </button>
          <button
            type="button"
            onClick={() => goToAuth('signup')}
            className="pill-btn"
            style={{ height: 38, padding: '0 18px', fontSize: 13 }}
          >
            {copy.signup}
          </button>
        </div>
      </nav>

      <div className="wrap z">
        {/* Hero Section */}
        <section id="home">
          <div className="glass hero">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
                <span>{copy.eyebrow}</span>
              </div>
              <h1>{copy.headline}</h1>
              <p className="muted" style={{ marginTop: 18, fontSize: 16, lineHeight: 1.6, maxWidth: 540 }}>
                {copy.subhead}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
                <button
                  type="button"
                  onClick={() => goToAuth('signup')}
                  className="pill-btn"
                >
                  <span>{copy.getStarted}</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
                <a
                  href="/ios.html"
                  className="pill-outline"
                >
                  <span> {copy.downloadIos}</span>
                </a>
                <a
                  href="/pethar-release.apk"
                  download
                  className="pill-outline"
                >
                  <Download style={{ width: 15, height: 15 }} />
                  <span>{copy.downloadApk}</span>
                </a>
              </div>
            </div>

            {/* Mobile Device Mockup */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="phone">
                <div className="notch" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArakanEmblem size={22} variant="badge" />
                    <span style={{ fontWeight: 800, fontSize: 12 }}>Péthar</span>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                    {copy.mockOffline}
                  </span>
                </div>

                <div className="bal">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.75, fontSize: 11 }}>
                    <span>{copy.mockAvail}</span>
                    <button
                      type="button"
                      onClick={() => setBalanceHidden(!balanceHidden)}
                      style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer' }}
                    >
                      {balanceHidden ? <Eye style={{ width: 14, height: 14 }} /> : <EyeOff style={{ width: 14, height: 14 }} />}
                    </button>
                  </div>
                  <b>{balanceHidden ? '₳ ••••••' : '₳ 1,250.00'}</b>
                  <span style={{ fontSize: 10, opacity: 0.75, display: 'block', marginTop: 2 }}>≈ $1,250.00 USD</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: '#f59e0b', color: '#0b1026', padding: '10px 0', borderRadius: 14, textAlign: 'center', fontWeight: 800, fontSize: 11 }}>
                    {copy.mockSend}
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#fff', padding: '10px 0', borderRadius: 14, textAlign: 'center', fontWeight: 800, fontSize: 11 }}>
                    {copy.mockRequest}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.1)', padding: 12, marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: 0.65, marginBottom: 4 }}>
                    <span>Recent Activity</span>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>Bearer Cash</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>P2P Transfer · Sittwe</div>
                  <div style={{ fontSize: 10, color: '#34d399', fontWeight: 700 }}>+ ₳ 20.00 (Offline Verified)</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Pillars / Trust Stats */}
        <div className="glass trust">
          <div>
            <div className="stat">1 ₳ = 1 $</div>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{copy.statPeg}</p>
          </div>
          <div>
            <div className="stat">100% USDT / USDC</div>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{copy.statReserves}</p>
          </div>
          <div>
            <div className="stat">Online + Offline</div>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{copy.statSecurity}</p>
          </div>
        </div>

        {/* How It Works */}
        <section id="how">
          <div className="label">Simplicity First</div>
          <h2>{copy.howTitle}</h2>
          <p className="muted" style={{ marginBottom: 32, maxWidth: 600 }}>{copy.howIntro}</p>

          <div className="grid c4">
            {[
              { n: '01', t: copy.s1t, d: copy.s1d },
              { n: '02', t: copy.s2t, d: copy.s2d },
              { n: '03', t: copy.s3t, d: copy.s3d },
              { n: '04', t: copy.s4t, d: copy.s4d },
            ].map(s => (
              <div key={s.n} className="glass card">
                <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: 13, marginBottom: 12 }}>{s.n}</div>
                <h3>{s.t}</h3>
                <p className="muted" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Offline Mode Showcase */}
        <section id="offline">
          <div className="label">Connectivity Architecture</div>
          <h2>{copy.offTitle}</h2>
          <p className="muted" style={{ marginBottom: 32, maxWidth: 640 }}>{copy.offIntro}</p>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="glass card">
              <Smartphone style={{ width: 28, height: 28, color: '#34d399', marginBottom: 16 }} />
              <h3>{copy.onCard}</h3>
              <p className="muted" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>{copy.onBody}</p>
            </div>
            <div className="glass card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
              <WifiOff style={{ width: 28, height: 28, color: '#fbbf24', marginBottom: 16 }} />
              <h3>{copy.offCard}</h3>
              <p className="muted" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>{copy.offBody}</p>
              <div style={{ marginTop: 18 }}>
                <a href="/ios.html" style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span>iOS Configuration Profile Guide</span>
                  <ExternalLink style={{ width: 12, height: 12 }} />
                </a>
              </div>
            </div>
          </div>
        </section>
 
        {/* Adaptive Device Themes Showcase */}
        <section id="themes">
          <div className="label">Device Experience</div>
          <h2>{lang === 'ak' ? 'စနစ်အလိုက် အလိုအလျောက် ပြောင်းလဲသော အက်ပ်ပုံစံ' : 'Adaptive App Icon Theming'}</h2>
          <p className="muted" style={{ marginBottom: 32, maxWidth: 640 }}>
            {lang === 'ak'
              ? 'iOS 18 နှင့် Android 14+ တို့၏ Light Mode၊ Dark Mode နှင့် Tinted Theme များနှင့် လိုက်လျောညီထွေစွာ ပြောင်းလဲပေးသည့် Péthar တံဆိပ်။'
              : 'Seamlessly matching your OS appearance in iOS 18 and Android Material You: Light, Dark, and Tinted monochrome.'}
          </p>

          <div className="grid c3">
            <div className="glass card" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <img
                src="/icon-light.png"
                alt="Light Mode Icon"
                style={{ width: 100, height: 100, margin: '0 auto 18px', display: 'block', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.45))' }}
              />
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                Light Mode
              </span>
              <h3 style={{ fontSize: 16 }}>{lang === 'ak' ? 'နေ့ခင်းအလင်းရောင်မုဒ်' : 'Clean Daylight'}</h3>
              <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                {lang === 'ak' ? 'ဖြူစင်ကြည်လင်သော မျက်နှာပြင်ပေါ်တွင် မူရင်းအနီရောင် သရဖူတံဆိပ်' : 'Pure white surface with vivid crimson emblem for daylight clarity'}
              </p>
            </div>

            <div className="glass card" style={{ textAlign: 'center', padding: '32px 20px', borderColor: 'rgba(244,63,94,0.3)' }}>
              <img
                src="/icon-dark.png"
                alt="Dark Mode Icon"
                style={{ width: 100, height: 100, margin: '0 auto 18px', display: 'block', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.65))' }}
              />
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(24,24,27,0.85)', border: '1px solid rgba(255,255,255,0.15)', color: '#fb7185', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                Dark Mode
              </span>
              <h3 style={{ fontSize: 16 }}>{lang === 'ak' ? 'အမှောင်ရောင်စဉ်မုဒ်' : 'OLED Obsidian'}</h3>
              <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                {lang === 'ak' ? 'OLED မျက်နှာပြင်များအတွက် နက်မှောင်သောအနက်နှင့် တောက်ပသောအနီ' : 'Deep matte obsidian with luminous high-contrast emblem'}
              </p>
            </div>

            <div className="glass card" style={{ textAlign: 'center', padding: '32px 20px', borderColor: 'rgba(99,102,241,0.3)' }}>
              <img
                src="/icon-tinted.png"
                alt="Tinted Mode Icon"
                style={{ width: 100, height: 100, margin: '0 auto 18px', display: 'block', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.55))' }}
              />
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', color: '#c7d2fe', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                Tinted (iOS 18)
              </span>
              <h3 style={{ fontSize: 16 }}>{lang === 'ak' ? 'စနစ်ကာလာအရောင်တင်မုဒ်' : 'Metallic Tint'}</h3>
              <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                {lang === 'ak' ? 'iOS 18 နှင့် Android တွင် သင့်စိတ်ကြိုက် အရောင်အသွေးအလိုက် လိုက်ဖက်ညီစွာ ပြောင်းလဲပေးသည့် ပုံစံ' : 'Monochrome metallic luminance gradient adapting to your OS accent tint'}
              </p>
            </div>
          </div>
        </section>

        {/* Privacy & Security */}
        <section id="privacy">
          <div className="label">Security &amp; Standards</div>
          <h2>{copy.privTitle}</h2>
          <p className="muted" style={{ marginBottom: 32, maxWidth: 640 }}>{copy.privLead}</p>

          <div className="grid c3">
            <div className="glass card">
              <ShieldCheck style={{ width: 24, height: 24, color: '#60a5fa', marginBottom: 12 }} />
              <h3>{copy.p1t}</h3>
              <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>{copy.p1d}</p>
            </div>
            <div className="glass card">
              <Lock style={{ width: 24, height: 24, color: '#34d399', marginBottom: 12 }} />
              <h3>{copy.p2t}</h3>
              <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>{copy.p2d}</p>
            </div>
            <div className="glass card">
              <Send style={{ width: 24, height: 24, color: '#fbbf24', marginBottom: 12 }} />
              <h3>{copy.p3t}</h3>
              <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>{copy.p3d}</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faq">
          <div className="label">Support</div>
          <h2>{copy.faqTitle}</h2>
          <div className="grid" style={{ gap: 14 }}>
            {copy.faqs.map(f => (
              <div key={f.q} className="glass" style={{ padding: '20px 24px', borderRadius: 18 }}>
                <h3 style={{ fontSize: 15, margin: 0, color: '#fbbf24' }}>{f.q}</h3>
                <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Box */}
        <section>
          <div className="glass card" style={{ textAlign: 'center', padding: '56px 24px', borderRadius: 32 }}>
            <h2 style={{ fontSize: 32, marginBottom: 12 }}>{copy.ctaTitle}</h2>
            <p className="muted" style={{ maxWidth: 540, margin: '0 auto 28px', fontSize: 15 }}>{copy.ctaBody}</p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
              <button
                type="button"
                onClick={() => goToAuth('signup')}
                className="pill-btn"
              >
                <span>{copy.getStarted}</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
              <a
                href="/ios.html"
                className="pill-outline"
              >
                <span> {copy.downloadIos}</span>
              </a>
              <a
                href="/download"
                className="pill-outline"
              >
                <span>{ak ? 'ဒေါင်းလုဒ် အားလုံး' : 'All Downloads'}</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Minimal Enterprise Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)', padding: '36px 24px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
        <p>{copy.footer}</p>
      </footer>
    </div>
  )
}
