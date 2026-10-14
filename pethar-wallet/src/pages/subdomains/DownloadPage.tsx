import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  Download, Smartphone, Monitor, ShieldCheck, CheckCircle2,
  Copy, Check, Terminal, QrCode, Cpu, ArrowRight, ExternalLink,
  Zap
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface DownloadPageProps {
  lang: Language;
}

export const DownloadPage = ({ lang }: DownloadPageProps) => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop' | 'pos'>('mobile');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const ak = lang === 'ak';

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const t = ak
    ? {
        badge: 'Pe Thar တရားဝင် ဆော့ဖ်ဝဲ · 1 ₳ = 1 $ · Online + Offline Mode',
        heroTitle: 'Pe Thar (ဖေ့သာ) ဆော့ဖ်ဝဲ တိုက်ရိုက် ရယူပါ',
        heroSubtitle: 'App Store နှင့် Play Store အားမကိုးဘဲ Android တွင် တိုက်ရိုက် APK၊ iPhone တွင် Configuration Profile ဖြင့် ထည့်သွင်းနိုင်ပါသည်။',
        tabMobile: 'မိုဘိုင်းလ် (iOS & Android)',
        tabDesktop: 'ဒက်စ်တော့ပ် (Mac & PC)',
        tabPOS: 'ကုန်သည် POS & ဟာ့ဒ်ဝဲ',
        downloadIosProfile: 'iOS Profile ဒေါင်းလုဒ် (.mobileconfig)',
        viewIosGuide: 'iOS ထည့်သွင်းနည်း လမ်းညွှန်ကြည့်မည်',
        downloadApk: 'Android APK တိုက်ရိုက်ရယူမည်',
        downloadMac: 'macOS DMG ဒေါင်းလုဒ်',
        downloadWin: 'Windows 64-bit Installer (.msi)',
        downloadLinux: 'Linux AppImage',
        checksumTitle: 'လုံခြုံရေး လက်မှတ်နှင့် SHA-256 Checksum စစ်ဆေးရန်',
        checksumSubtitle: 'ဒေါင်းလုဒ်လုပ်ထားသော ဖိုင်များကို တရားဝင် cryptographic hash ဖြင့် တိုက်ဆိုင်စစ်ဆေးပါ',
        scanQr: 'ဖုန်းကင်မရာဖြင့် QR Code ဖတ်ပြီး ချက်ချင်းဒေါင်းလုဒ်လုပ်ပါ',
        openWebWallet: 'ဝဘ်ပိုက်ဆံအိတ် ဖွင့်မည် (app.pethar.co.uk)',
      }
    : {
        badge: 'Official Pe Thar Suite · 1 ₳ = 1 $ · Online + Offline Mode',
        heroTitle: 'Download Pe Thar Direct Across Devices',
        heroSubtitle: 'Direct installation via Android APK and Apple Configuration Profile (.mobileconfig) without App Store restrictions.',
        tabMobile: 'Mobile (iOS & Android)',
        tabDesktop: 'Desktop (macOS & Windows)',
        tabPOS: 'Merchant POS & Terminals',
        downloadIosProfile: 'Download iOS Profile (.mobileconfig)',
        viewIosGuide: 'View iOS Step-by-Step Guide',
        downloadApk: 'Download Android APK (Direct)',
        downloadMac: 'Download for macOS (Universal)',
        downloadWin: 'Download Windows 64-bit (.msi)',
        downloadLinux: 'Download Linux AppImage',
        checksumTitle: 'Cryptographic Checksum & Signature Verification',
        checksumSubtitle: 'Verify the authenticity and integrity of all client binaries using our official SHA-256 hashes',
        scanQr: 'Scan with your smartphone camera to install Pe Thar mobile app',
        openWebWallet: 'Open Web Wallet (app.pethar.co.uk)',
      };

  const releases = [
    {
      platform: 'iOS Configuration Profile (.mobileconfig)',
      version: 'v1.0 (Managed WebClip / Standalone)',
      filename: 'pethar.mobileconfig',
      size: '22 KB',
      sha256: '9a77f2231b089c19024f2b1d09e86c051a87799e69cba45089fceb9a897210bc',
    },
    {
      platform: 'Android APK (Universal Release)',
      version: 'v1.0.4 (ARM64 / v7a)',
      filename: 'pethar-release.apk',
      size: '28.4 MB',
      sha256: 'e89a42cf891b0c954e33918a2d1098ef7321b4a9b590e816a1b89947c01a2ef3',
    },
    {
      platform: 'macOS (Universal DMG)',
      version: 'v1.0.4',
      filename: 'PeThar-macOS-universal.dmg',
      size: '64.2 MB',
      sha256: '5f33e08119a71bd670c538bc9a022ee719283f089693998b5a19149f12ab7834',
    },
    {
      platform: 'Windows 10/11 x64',
      version: 'v1.0.4',
      filename: 'PeThar-Setup-x64.msi',
      size: '58.1 MB',
      sha256: '10bc931288fa719245bbcca910817349182390a887198ba16894aa9203847599',
    },
  ];

  return (
    <BaseLayout
      title={t.heroTitle}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-16 max-w-6xl mx-auto py-6">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-500/20 text-xs font-mono font-bold uppercase tracking-wider">
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => redirectToSubdomain('app')}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span>{t.openWebWallet}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/ios.html"
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-mono shadow-xs transition-all flex items-center gap-2"
            >
              <span> {ak ? 'iOS တိုက်ရိုက် စာမျက်နှာ' : 'Dedicated iOS Portal'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all ${
                activeTab === 'mobile'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{t.tabMobile}</span>
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all ${
                activeTab === 'desktop'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>{t.tabDesktop}</span>
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all ${
                activeTab === 'pos'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>{t.tabPOS}</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Content */}
        {activeTab === 'mobile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              
              {/* iOS Direct Card */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-amber-400/50 transition-all space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-2xl shadow-md">
                      
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-950">Pe Thar for iOS</h3>
                      <p className="text-xs text-slate-500 font-mono">Apple Configuration Profile (.mobileconfig) • iPhone & iPad</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3" /> No App Store Lock
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-mono font-bold">
                          <Zap className="w-3 h-3 text-amber-600" /> Offline Mode
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <a
                      href="/pethar.mobileconfig"
                      download
                      className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloadIosProfile}</span>
                    </a>
                    <a
                      href="/ios.html"
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>{ak ? 'အဆင့် ၇ ဆင့် လမ်းညွှန်' : 'Visual Guide'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* iOS Step-by-Step Visual Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
                    <span>{ak ? 'iOS တိုက်ရိုက် ထည့်သွင်းနည်း အကျဉ်းချုပ်' : 'iOS Installation Preview (Safari)'}</span>
                    <span className="text-amber-600 font-bold">7 Steps</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-600">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <b className="text-amber-600 block">1. Download</b>
                      <span>Tap Continue on Safari prompt</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <b className="text-amber-600 block">2. Settings</b>
                      <span>Open iPhone Settings app</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <b className="text-amber-600 block">3. Profile</b>
                      <span>Tap Profile Downloaded</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <b className="text-emerald-600 block">4. Install</b>
                      <span>Enter Passcode & Confirm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Android Card */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-amber-400/50 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md">
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-950">Pe Thar for Android</h3>
                      <p className="text-xs text-slate-500 font-mono">Direct APK • Android 9.0+ • Offline Bearer Mesh</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Signed Release
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-mono font-bold">
                          <Zap className="w-3 h-3 text-amber-600" /> Offline Mode
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <a
                      href="/pethar-release.apk"
                      download
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloadApk}</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* QR Code Panel */}
            <div className="lg:col-span-5">
              <div className="p-8 rounded-3xl bg-linear-to-br from-amber-500/10 via-amber-500/5 to-slate-100 border border-amber-500/20 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-950">
                  {ak ? 'ဖုန်းဖြင့် တိုက်ရိုက် ရယူရန်' : 'Instant Mobile Install'}
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  {t.scanQr}
                </p>
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-dashed border-amber-300 shadow-sm flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-4 text-center">
                    <QrCode className="w-20 h-20 text-amber-400 mb-2" />
                    <span className="text-[10px] font-mono text-slate-300">SCAN TO INSTALL</span>
                  </div>
                </div>
                <div className="pt-2">
                  <a
                    href="/ios.html"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700 hover:text-amber-800 underline"
                  >
                    <span> {ak ? 'iOS တိုက်ရိုက် Install စာမျက်နှာဖွင့်မည်' : 'Open iOS Installation Page'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Adaptive Device Themes (iOS 18 & Android) */}
            <div className="lg:col-span-12 mt-4 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                    <span>iOS 18 &amp; Android Material You</span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {ak ? 'စနစ်အလင်းအမှောင်အလိုက် ပြောင်းလဲသော အက်ပ်ပုံစံ' : 'Device-Adaptive App Icon Theming'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    {ak
                      ? 'သင့်ဖုန်းမျက်နှာပြင်၏ Light၊ Dark နှင့် Tinted မုဒ်များအလိုက် အလိုအလျောက် သဟဇာတဖြစ်အောင် ချိန်ညှိပေးပါသည်။'
                      : 'Pe Thar dynamically adapts to your OS home screen mode: Light, Dark, or iOS 18 Tinted with custom accent styling.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/ios.html"
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>{ak ? 'iOS စမ်းသပ်ကြည့်မည်' : 'Interactive iOS Preview'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Light Mode */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-3 hover:border-slate-700 transition-all">
                  <img
                    src="/icon-light.png"
                    alt="Light Theme Icon"
                    className="w-20 h-20 mx-auto drop-shadow-xl hover:scale-105 transition-transform"
                  />
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-mono font-bold uppercase">
                      Light Mode
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1.5">{ak ? 'နေ့ခင်းအလင်းရောင်မုဒ်' : 'Clean Daylight'}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {ak ? 'ဖြူစင်ကြည်လင်သော မျက်နှာပြင်ပေါ်တွင် မူရင်းအနီရောင် သရဖူတံဆိပ်' : 'Pure white surface with vivid crimson emblem'}
                    </p>
                  </div>
                </div>

                {/* Dark Mode */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-3 hover:border-rose-500/40 transition-all">
                  <img
                    src="/icon-dark.png"
                    alt="Dark Theme Icon"
                    className="w-20 h-20 mx-auto drop-shadow-xl hover:scale-105 transition-transform"
                  />
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-mono font-bold uppercase">
                      Dark Mode
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1.5">{ak ? 'အမှောင်ရောင်စဉ်မုဒ်' : 'OLED Obsidian'}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {ak ? 'OLED မျက်နှာပြင်များအတွက် နက်မှောင်သောအနက်နှင့် တောက်ပသောအနီ' : 'Deep obsidian with luminous high-contrast mark'}
                    </p>
                  </div>
                </div>

                {/* Tinted Mode */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-3 hover:border-indigo-500/40 transition-all">
                  <img
                    src="/icon-tinted.png"
                    alt="Tinted Theme Icon"
                    className="w-20 h-20 mx-auto drop-shadow-xl hover:scale-105 transition-transform"
                  />
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold uppercase">
                      Tinted (iOS 18)
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1.5">{ak ? 'စနစ်ကာလာအရောင်တင်မုဒ်' : 'Metallic Monochrome'}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {ak ? 'သင့်ဖုန်း စိတ်ကြိုက်အရောင်အလိုက် လိုက်ဖက်ညီစွာ ပြောင်းလဲပေးသည့် ပုံစံ' : 'Metallic silver gradient adapting to custom OS tints'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Tab Content */}
        {activeTab === 'desktop' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* macOS */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                  
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">macOS</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Universal Binary • Apple Silicon M1-M4 & Intel</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fast desktop wallet workstation with local encrypted vault and multi-monitor support.
                </p>
              </div>
              <button
                onClick={() => redirectToSubdomain('app')}
                className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadMac}</span>
              </button>
            </div>

            {/* Windows */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">Windows</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Windows 10 / 11 (64-bit)</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Native Windows desktop financial terminal with instant background notifications.
                </p>
              </div>
              <button
                onClick={() => redirectToSubdomain('app')}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadWin}</span>
              </button>
            </div>

            {/* Linux */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">Linux</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">AppImage & Debian (.deb)</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Standalone sandbox AppImage with verified GPG developer signatures.
                </p>
              </div>
              <button
                onClick={() => redirectToSubdomain('app')}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadLinux}</span>
              </button>
            </div>

          </div>
        )}

        {/* Checksum Verification Table */}
        <div id="checksum-table" className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>{t.checksumTitle}</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {t.checksumSubtitle}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-3 px-4 font-bold">Platform / Target</th>
                    <th className="py-3 px-4 font-bold">File Package</th>
                    <th className="py-3 px-4 font-bold">Size</th>
                    <th className="py-3 px-4 font-bold">SHA-256 Checksum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {releases.map((rel) => (
                    <tr key={rel.filename} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-950">{rel.platform}</td>
                      <td className="py-3.5 px-4 text-slate-600">{rel.filename}</td>
                      <td className="py-3.5 px-4 text-slate-500">{rel.size}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-800 truncate max-w-[220px]">
                            {rel.sha256}
                          </code>
                          <button
                            onClick={() => copyToClipboard(rel.sha256)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                            title="Copy SHA-256"
                          >
                            {copiedHash === rel.sha256 ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};