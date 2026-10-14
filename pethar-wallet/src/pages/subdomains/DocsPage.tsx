import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  BookOpen, Search, ArrowRight,
  Layers, Smartphone, Download, Zap, Lock, Copy, Check
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface DocsPageProps {
  lang: Language;
}

export const DocsPage = ({ lang }: DocsPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'currency' | 'offline' | 'mobile' | 'security' | 'api'>('all');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const ak = lang === 'ak';

  const t = ak
    ? {
        badge: 'Pe Thar နည်းပညာ စာရွက်စာတမ်းများ · Knowledge Base',
        heroTitle: 'ဖေ့သာ နည်းပညာနှင့် စနစ်အသုံးပြုမှု လမ်းညွှန်',
        heroSubtitle: '၁ ₳ = ၁ $ ငွေကြေးပုံစံ၊ Android နှင့် iOS အော့ဖ်လိုင်းမုဒ်၊ Direct APK/iOS Profile ထည့်သွင်းနည်းနှင့် လုံခြုံရေး စည်းမျဉ်းများ',
        searchPlaceholder: 'စာရွက်စာတမ်းများ၊ အော့ဖ်လိုင်းမုဒ်၊ APK၊ APIs ရှာဖွေပါ...',
        filterAll: 'အားလုံး',
        filterCurrency: '၁ ₳ = ၁ $ ငွေကြေး',
        filterOffline: 'အော့ဖ်လိုင်းမုဒ်',
        filterMobile: 'APK နှင့် iOS ထည့်သွင်းနည်း',
        filterSecurity: 'လုံခြုံရေးနှင့် Privacy',
        filterApi: 'API နှင့် Integration',
        readGuide: 'လမ်းညွှန်ဖတ်မည်',
        closeModal: 'ပိတ်မည်',
        copied: 'ကူးယူပြီး',
        copy: 'ကူးယူရန်',
      }
    : {
        badge: 'Pe Thar Technical Docs · System Architecture v2.0',
        heroTitle: 'Pe Thar System & Developer Documentation',
        heroSubtitle: 'Complete architecture for 1 ₳ = 1 $, offline mode for Android & iOS, direct APK/iOS profile installation, and security standards',
        searchPlaceholder: 'Search topics: 1 ₳ = 1 $, Offline Mode, APK install, Firebase Auth, APIs...',
        filterAll: 'All Docs',
        filterCurrency: '1 ₳ = 1 $ Economics',
        filterOffline: 'Offline Mode (Mobile)',
        filterMobile: 'Mobile Installation',
        filterSecurity: 'Security & Privacy',
        filterApi: 'APIs & Webhooks',
        readGuide: 'Read Document',
        closeModal: 'Close',
        copied: 'Copied',
        copy: 'Copy',
      };

  const docArticles = [
    {
      id: 'doc-currency',
      category: 'currency',
      title: ak ? '၁ ₳ = ၁ $ ငွေကြေးတည်ငြိမ်မှု စနစ်' : '1 ₳ = 1 $ Currency Peg & Reserve Mechanics',
      desc: ak 
        ? 'ဖေ့သာတွင် ၁ ₳ (AKD) သည် ၁ US Dollar နှင့် ညီမျှပုံ၊ Backend တွင် USDT/USDC/USD1 တို့ဖြင့် ၁:၁ အပြည့်အဝ ထိန်းကျောင်းထားပုံ။'
        : 'How Pe Thar maintains 1 ₳ AKD = $1.00 USD parity, backed 1:1 internally by institutional stablecoin reserves (USDT, USDC, USD1).',
      tag: ak ? 'ငွေကြေး' : 'Economics',
      readTime: '5 min read',
      content: {
        overview: ak
          ? 'ဖေ့သာ (Pe Thar) သည် သုံးစွဲသူများအတွက် ၁ ₳ (AKD) = ၁ USD ဖြင့် သတ်မှတ်ထားသော တည်ငြိမ်ဒစ်ဂျစ်တယ်ငွေကြေးစနစ် ဖြစ်သည်။'
          : 'Pe Thar operates on an absolute 1:1 parity where 1 ₳ (Arakan Dollar) equals $1.00 USD. Retail users hold stable purchasing power without cryptocurrency volatility.',
        points: ak ? [
          '၁ ₳ သည် အမြဲတမ်း ၁ USD နှင့် တန်ဖိုးတူညီသည်။',
          'သုံးစွဲသူများဘက်တွင် Crypto နည်းပညာ ရှုပ်ထွေးမှုများ မမြင်ရဘဲ ရိုးရှင်းသော ဒစ်ဂျစ်တယ်ဒေါ်လာအဖြစ် သုံးနိုင်သည်။',
          'အတွင်းပိုင်း Treasury စနစ်တွင် USDT, USDC နှင့် USD1 တို့ဖြင့် အရန်ငွေ (Reserve) ၁၀၀% အပြည့်အဝ ထားရှိသည်။',
          'ငွေသွင်း/ငွေထုတ်များကို အတည်ပြုထားသော ဒေသတွင်း ကုန်သည်များနှင့် တရားဝင် ချိတ်ဆက်မှုများဖြင့် စီမံသည်။',
        ] : [
          'Guaranteed 1:1 purchasing parity: 1 ₳ AKD = $1.00 USD.',
          'Zero crypto jargon exposed to end-users; frictionless digital cash experience.',
          'Internal multi-chain treasury vaults holding audited USDT (TRC-20, ERC-20), USDC (Base, Solana), and USD1.',
          'Double-entry append-only accounting ledger ensuring every token minted matches verified collateral.',
        ],
        codeSnippet: `// Treasury Reserve Invariant
const Invariant = {
  CirculatingAKD: "2,450,000.00 ₳",
  TreasuryUSDCollateral: "$2,450,000.00 USD",
  ReserveRatio: "100.00%",
  BackingAssets: ["USDT", "USDC", "USD1"]
};`
      }
    },
    {
      id: 'doc-offline',
      category: 'offline',
      title: ak ? 'Android နှင့် iOS အတွက် အော့ဖ်လိုင်းမုဒ်' : 'Offline Mode Architecture (Android & iOS)',
      desc: ak
        ? 'အင်တာနက်မရှိချိန်တွင် Cashu ကဲ့သို့ Bearer Token ဖြင့် ဖုန်းအချင်းချင်း ဒေတာလွှဲပြောင်းပုံနှင့် အလိုအလျောက် စင့်ခ်လုပ်ပုံ။'
        : 'Cashu-inspired bearer e-cash tokens for offline peer-to-peer data transfers without internet, cellular networks, or SIM cards.',
      tag: ak ? 'အော့ဖ်လိုင်း' : 'Offline P2P',
      readTime: '8 min read',
      content: {
        overview: ak
          ? 'အော့ဖ်လိုင်းမုဒ်သည် Android နှင့် iOS မိုဘိုင်းအက်ပ်များတွင်သာ သီးသန့် အလုပ်လုပ်သည်။ အင်တာနက်လုံးဝမရှိသည့် အခြေအနေတွင်ပင် ဖုန်းနှစ်လုံးအကြား ငွေလွှဲနိုင်သည်။'
          : 'Offline Mode is an exclusive capability of Pe Thar on native Android and iOS apps. It empowers citizens and merchants to transact during network blackouts.',
        points: ak ? [
          'Cashu e-cash စနစ်ကဲ့သို့ ငွေကြေးတန်ဖိုးကို စက်ထဲတွင် လုံခြုံသော Bearer Token အဖြစ် သိမ်းဆည်းသည်။',
          'ဖုန်းအချင်းချင်း Bluetooth Low Energy (BLE)၊ NFC Tap သို့မဟုတ် Animated QR ကုဒ်ဖြင့် ဒေတာပို့နိုင်သည်။',
          'ငွေလွှဲသည့်အချိန်တွင်သာ ဖုန်း၏ သက်ဆိုင်ရာ Permission (ခွင့်ပြုချက်) ကို အက်ပ်က တောင်းခံသည်။',
          'စက်တစ်လုံးလုံး အင်တာနက် (သို့မဟုတ် Starlink) ပြန်ရသည်နှင့် တစ်ပြိုင်နက် ဗဟိုစာရင်းသို့ အလိုအလျောက် စင့်ခ် (Sync) လုပ်သည်။',
        ] : [
          'Cryptographic bearer notes stored in on-device encrypted hardware storage (StrongBox / Secure Enclave).',
          'P2P data transfer channels: Bluetooth Low Energy (BLE), NFC tap-to-pay, and offline animated QR camera scanner.',
          'Contextual OS permissions: Prompts only when "Send Offline" is initiated.',
          'Automatic reconciliation: As soon as either phone reconnects to internet, the transaction settles to the cloud ledger.',
        ],
        codeSnippet: `// Offline Bearer Envelope Payload
{
  "protocol": "PeThar-Bearer-v1",
  "amount_akd": 20.00,
  "currency": "AKD",
  "nonce": "9a7f3b8c2d1e0f4a",
  "signature": "ed25519_sig_88291a...fe81",
  "timestamp": 1728919200
}`
      }
    },
    {
      id: 'doc-mobile-install',
      category: 'mobile',
      title: ak ? 'Direct APK နှင့် iOS Configuration Profile ထည့်သွင်းနည်း' : 'Direct Mobile Installation (Android APK & iOS Profile)',
      desc: ak
        ? 'App Store နှင့် Play Store အားမကိုးဘဲ Android တွင် တိုက်ရိုက် APK၊ iPhone တွင် Configuration Profile ဖြင့် ထည့်သွင်းနည်း။'
        : 'Step-by-step guides for installing Pe Thar via direct Android APK and iOS Configuration Profile (.mobileconfig) without app store friction.',
      tag: ak ? 'ထည့်သွင်းနည်း' : 'Installation',
      readTime: '4 min read',
      content: {
        overview: ak
          ? 'ဒေသတွင်း အင်တာနက် အကန့်အသတ်များနှင့် App Store အတားအဆီးများကို ကျော်လွှားရန် Pe Thar ကို တိုက်ရိုက် ရယူနိုင်အောင် စီစဉ်ထားသည်။'
          : 'To bypass app store censorship, regional sanctions, or connectivity delays, Pe Thar provides direct installation packages.',
        points: ak ? [
          'Android: pethar.co.uk/download မှ တိုက်ရိုက် APK ကို ဒေါင်းလုဒ်ဆွဲပြီး Install လုပ်နိုင်သည်။',
          'Android Integrity: အတုအပ ကာကွယ်ရန် တရားဝင် SHA-256 Checksum ကို တိုက်ဆိုင်စစ်ဆေးနိုင်သည်။',
          'iOS: Safari မှတဆင့် Pe Thar Configuration Profile (.mobileconfig) ကို ဒေါင်းလုဒ်ဆွဲပြီး Settings > Profile Downloaded > Install ဖြင့် ထည့်သွင်းနိုင်သည်။',
          'Web App: ကွန်ပျူတာ သို့မဟုတ် ဘရောက်ဇာများတွင် app.pethar.co.uk သို့ တိုက်ရိုက်ဝင်ရောက် သုံးစွဲနိုင်သည်။',
        ] : [
          'Android: Download the universal APK directly from pethar.co.uk/download with one tap.',
          'Integrity verification: SHA-256 checksums are published on the download page for tamper-proofing.',
          'iOS: Download the signed Configuration Profile (.mobileconfig) in Safari, open iOS Settings > Profile Downloaded > Tap Install.',
          'Universal Web Access: Desktop and laptop users can instantly access full banking at app.pethar.co.uk.',
        ],
        codeSnippet: `// SHA-256 Release Checksum
File: pethar-release-v1.0.apk
SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
      }
    },
    {
      id: 'doc-auth-privacy',
      category: 'security',
      title: ak ? 'Authentication နှင့် Google Cloud Console လုံခြုံရေး' : 'Authentication & Google Cloud OAuth Compliance',
      desc: ak
        ? 'Google Sign-In နှင့် Email/Password ဖြင့် လျင်မြန်စွာ အကောင့်ဖွင့်ပုံ၊ အချက်အလက် ကာကွယ်မှုနှင့် Privacy မူဝါဒ။'
        : 'Firebase Auth integration, minimal OAuth scope declarations (openid, email, profile), zero ads, and data privacy governance.',
      tag: ak ? 'လုံခြုံရေး' : 'Security',
      readTime: '6 min read',
      content: {
        overview: ak
          ? 'Pe Thar သည် သုံးစွဲသူများ၏ လွတ်လပ်မှုနှင့် ကိုယ်ရေးအချက်အလက် လုံခြုံရေးကို အမြင့်ဆုံး ကာကွယ်ထားသည်။'
          : 'Pe Thar follows strict data minimization principles and Google API Services User Data Policy standards.',
        points: ak ? [
          'အကောင့်ဖွင့်ရာတွင် Google Sign-In သို့မဟုတ် နာမည်၊ အီးမေးလ်၊ စကားဝှက်ဖြင့် စက္ကန့်ပိုင်းအတွင်း ဖွင့်နိုင်သည်။',
          'စတင်သုံးစွဲရန် မှတ်ပုံတင်၊ နိုင်ငံသားကတ်၊ ဖုန်းနံပါတ် သို့မဟုတ် ဓာတ်ပုံ KYC မလိုသေးပါ။',
          'Google Cloud အသုံးပြုခွင့်တွင် အခြေခံ အီးမေးလ်နှင့် ပရိုဖိုင် (openid, email, profile) ကိုသာ ယူပြီး Drive, Gmail တို့ကို လုံးဝ မယူပါ။',
          'ဒေတာများကို ကြော်ငြာအတွက် အသုံးမပြုဘဲ အကောင့်ဖျက်လိုပါက privacy@pethar.co.uk သို့ အချိန်မရွေး တောင်းဆိုနိုင်သည်။',
        ] : [
          'Frictionless onboarding: Google 1-tap sign-in or Name, Email, and Password.',
          'No premature KYC: Zero citizen tier gates, national ID uploads, or phone SMS hurdles required to start.',
          'Strict Google OAuth scopes: Only openid, email, and profile are requested. Never requests Gmail, Drive, or Calendar.',
          'Zero data reselling or ad-tracking. Full account and data deletion available at privacy@pethar.co.uk.',
        ],
        codeSnippet: `// Firebase Authentication Config
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');`
      }
    },
    {
      id: 'doc-subdomains',
      category: 'api',
      title: ak ? 'Subdomain Architecture နှင့် စနစ်လည်ပတ်ပုံ' : 'Subdomain Architecture & Route Orchestration',
      desc: ak
        ? 'pethar.co.uk, auth., app., admin., docs. နှင့် download. subdomain များ ချိတ်ဆက် အလုပ်လုပ်ပုံ။'
        : 'Enterprise multi-tenant domain routing: landing page, auth gateway, customer dashboard, admin treasury, and docs.',
      tag: ak ? 'ကွန်ရက်' : 'Architecture',
      readTime: '7 min read',
      content: {
        overview: ak
          ? 'Pe Thar စနစ်တစ်ခုလုံးကို အဆင့်မြင့် Enterprise အဆင့် subdomain များနှင့် ခွဲခြား ထိန်းချုပ်ထားသည်။'
          : 'Pe Thar partitions services across dedicated subdomains for high availability, security isolation, and clean routing.',
        points: ak ? [
          'pethar.co.uk: အများပြည်သူသုံး ပင်မစာမျက်နှာ၊ ၁ ₳ = ၁ $ နှင့် စနစ်မိတ်ဆက်။',
          'auth.pethar.co.uk: အကောင့်ဝင်ရန်နှင့် အကောင့်ဖွင့်ရန် သီးသန့် Gateway (ပြီးလျှင် app. သို့ ပို့သည်)။',
          'app.pethar.co.uk: သုံးစွဲသူများ ငွေကိုင်၊ ငွေလွှဲ ပြုလုပ်ရာ ပိုက်ဆံအိတ် Dashboard။',
          'admin.pethar.co.uk: အတွင်းပိုင်း အရန်ငွေ (USDT/USDC) ထိန်းကျောင်းရေးနှင့် အော့ဖ်လိုင်း စာရင်းစစ် ဗဟိုဌာန။',
          'download.pethar.co.uk: Android APK နှင့် iOS Profile များ တိုက်ရိုက် ရယူနိုင်သော နေရာ။',
        ] : [
          'pethar.co.uk: Public marketing portal, 1 ₳ = 1 $ presentation, and feature guides.',
          'auth.pethar.co.uk: Dedicated authentication portal for Google OAuth and email sign-in.',
          'app.pethar.co.uk: Authenticated consumer wallet dashboard replacing previous sandbox demos.',
          'admin.pethar.co.uk: Internal treasury operations, reserve monitoring, and offline settlement audit.',
          'download.pethar.co.uk: Direct distribution center for Android APK and iOS Configuration Profile.',
        ],
        codeSnippet: `// Subdomain Resolution Mapping
const SubdomainRoutes = {
  "": "Main (pethar.co.uk)",
  "auth": "AuthGateway (auth.pethar.co.uk)",
  "app": "WalletDashboard (app.pethar.co.uk)",
  "admin": "TreasuryAdmin (admin.pethar.co.uk)",
  "docs": "Documentation (docs.pethar.co.uk)",
  "download": "MobileDownload (download.pethar.co.uk)"
};`
      }
    },
    {
      id: 'doc-api-merchant',
      category: 'api',
      title: ak ? 'Merchant API နှင့် QR Invoicing စနစ်' : 'Merchant Integration & Rapid Invoicing APIs',
      desc: ak
        ? 'ဒေသတွင်း ဆိုင်များနှင့် ကုန်သည်များ Pe Thar ဖြင့် ငွေလက်ခံနိုင်ရန် REST API နှင့် Dynamic QR စနစ်များ။'
        : 'Accepting ₳ payments, generating dynamic QR invoices, webhook notifications, and automated cashflow reporting.',
      tag: ak ? 'ကုန်သည်' : 'Merchant Rails',
      readTime: '6 min read',
      content: {
        overview: ak
          ? 'ဒေသတွင်း ကုန်သည်များသည် Pe Thar ငွေပေးချေမှုများကို အလွယ်တကူ လက်ခံနိုင်ပြီး အင်တာနက်မရှိချိန်တွင်လည်း အော့ဖ်လိုင်း လက်ခံနိုင်သည်။'
          : 'Merchants can integrate Pe Thar checkout flows online or process payments offline using the merchant mobile terminal.',
        points: ak ? [
          'REST API မှတဆင့် စက္ကန့်ပိုင်းအတွင်း ₳ ငွေပေးချေမှု Invoice များ ထုတ်ပေးနိုင်သည်။',
          'အွန်လိုင်းရော အော့ဖ်လိုင်းပါ အသုံးပြုနိုင်သော Dynamic QR ကုဒ် စနစ်။',
          'ငွေဝင်ရောက်မှုများကို Webhook ဖြင့် အချိန်နှင့်တစ်ပြေးညီ သတိပေးချက် ရရှိနိုင်သည်။',
          'ငွေစာရင်းရှင်းတမ်း (Settlement) များကို နေ့စဉ် အလိုအလျောက် ထုတ်ယူနိုင်သည်။',
        ] : [
          'Create instant ₳ payment invoices via simple REST API calls.',
          'Support for both online scan-to-pay and offline bearer token receipts.',
          'Cryptographically signed webhooks for real-time payment confirmation.',
          'Automated daily reconciliation and CSV statement downloads.',
        ],
        codeSnippet: `// Create Payment Invoice
POST https://api.pethar.co.uk/v1/invoices
{
  "amount": 35.50,
  "currency": "AKD",
  "memo": "Grocery Order #10842",
  "callback_url": "https://merchant.com/webhook"
}`
      }
    }
  ];

  const filteredArticles = docArticles.filter(art => {
    const matchesCategory = activeCategory === 'all' || art.category === activeCategory;
    const matchesQuery = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const selectedArticle = docArticles.find(a => a.id === selectedDocId);

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <BaseLayout
      title={t.heroTitle}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-14 max-w-6xl mx-auto py-4">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-500/20 text-xs font-mono font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
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

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {(['all', 'currency', 'offline', 'mobile', 'security', 'api'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat === 'all' && t.filterAll}
              {cat === 'currency' && t.filterCurrency}
              {cat === 'offline' && t.filterOffline}
              {cat === 'mobile' && t.filterMobile}
              {cat === 'security' && t.filterSecurity}
              {cat === 'api' && t.filterApi}
            </button>
          ))}
        </div>

        {/* Documentation Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              onClick={() => setSelectedDocId(art.id)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-mono font-bold uppercase">
                    {art.tag}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{art.readTime}</span>
                </div>
                <h3 className="text-base font-black text-slate-950 group-hover:text-amber-600 transition-colors">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {art.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                <span>{t.readGuide}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Article Detail Modal / Reader */}
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-xs font-mono font-bold uppercase">
                    {selectedArticle.tag}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{selectedArticle.readTime}</span>
                </div>
                <button
                  onClick={() => setSelectedDocId(null)}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  {t.closeModal}
                </button>
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                  {selectedArticle.title}
                </h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {selectedArticle.content.overview}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                  {ak ? 'အဓိက အချက်များ' : 'Key Specifications'}
                </h4>
                <ul className="space-y-2">
                  {selectedArticle.content.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedArticle.content.codeSnippet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>{ak ? 'နမူနာ ကုဒ် / ဒေတာ' : 'Specification / Code Snippet'}</span>
                    <button
                      onClick={() => handleCopy(selectedArticle.content.codeSnippet)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
                    >
                      {copiedCode === selectedArticle.content.codeSnippet ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">{t.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{t.copy}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-amber-300 font-mono text-xs overflow-x-auto leading-relaxed">
                    {selectedArticle.content.codeSnippet}
                  </pre>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedDocId(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800"
                >
                  {t.closeModal}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links Footer Banner */}
        <div className="p-8 rounded-3xl bg-slate-950 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-2.5 py-1 rounded bg-amber-400/20 text-amber-400 text-[10px] font-mono font-bold uppercase">
                {ak ? 'တိုက်ရိုက် ဒေါင်းလုဒ်စင်တာ' : 'Direct Mobile Installation'}
              </span>
              <h3 className="text-xl font-black text-white">
                {ak ? 'Pe Thar မိုဘိုင်းအက်ပ် ရယူလိုပါသလား?' : 'Get Pe Thar on Android & iOS'}
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                {ak 
                  ? 'အော့ဖ်လိုင်းမုဒ် ပါဝင်သော တရားဝင် Android APK နှင့် iOS Configuration Profile ကို download.pethar.co.uk တွင် ရယူပါ။'
                  : 'Download the official Android APK and iOS Configuration Profile directly to experience full Offline Mode.'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => redirectToSubdomain('download')}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{ak ? 'ဒေါင်းလုဒ် ရယူရန်' : 'Open Download Hub'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Architectural Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs font-mono text-xs">
            <Layers className="w-5 h-5 text-amber-600 mb-2" />
            <h4 className="font-bold text-slate-950">1 ₳ = 1 $ Pegged</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              {ak ? '၁ ₳ သည် ၁ USD နှင့် တန်ဖိုးတူညီပြီး USDT/USDC ဖြင့် အပြည့်အဝ ထိန်းကျောင်းသည်။' : 'Every ₳ is strictly backed 1:1 by audited institutional USD stablecoin reserves.'}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs font-mono text-xs">
            <Zap className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="font-bold text-slate-950">Offline Mode (Mobile)</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              {ak ? 'Android နှင့် iOS တွင် အင်တာနက်မရှိဘဲ ဖုန်းအချင်းချင်း ဒေတာလွှဲနိုင်သည်။' : 'Cashu-inspired bearer e-cash allows P2P transfers during network blackouts.'}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs font-mono text-xs">
            <Smartphone className="w-5 h-5 text-sky-600 mb-2" />
            <h4 className="font-bold text-slate-950">Direct APK & iOS Profile</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              {ak ? 'App Store နှောင့်နှေးမှု မရှိဘဲ တိုက်ရိုက် ရယူ ထည့်သွင်းနိုင်သည်။' : 'Instant installation via direct APK and Apple Configuration Profile (.mobileconfig).'}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs font-mono text-xs">
            <Lock className="w-5 h-5 text-purple-600 mb-2" />
            <h4 className="font-bold text-slate-950">Google Cloud Security</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              {ak ? 'Google OAuth ဖြင့် လုံခြုံစွာ အကောင့်ဖွင့်နိုင်ပြီး ဒေတာ ရောင်းချခြင်း မရှိပါ။' : 'Minimal OAuth scopes (openid, email, profile) with zero ad targeting.'}
            </p>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};