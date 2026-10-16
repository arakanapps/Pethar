import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop' | 'pos'>('mobile');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const pathLower = location.pathname.toLowerCase();
  const targetPlatform: 'ios' | 'android' | 'all' = pathLower.includes('/ios')
    ? 'ios'
    : pathLower.includes('/android') || pathLower.includes('/andrioid')
      ? 'android'
      : 'all';

  useEffect(() => {
    if (targetPlatform === 'ios' || targetPlatform === 'android') {
      setActiveTab('mobile');
      const el = document.getElementById(`download-${targetPlatform}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [targetPlatform]);

  const ak = lang === 'ak';

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const t = ak
    ? {
        badge: 'Péthar တရားဝင် ဆော့ဖ်ဝဲ · 1 ₳ = 1 $ · Online + Offline Mode',
        heroTitle:
          targetPlatform === 'ios'
            ? 'Péthar (ဖေ့သာ) iOS အက်ပ် ဒေါင်းလုဒ်ရယူရန်'
            : targetPlatform === 'android'
              ? 'Péthar (ဖေ့သာ) Android အက်ပ် ဒေါင်းလုဒ်ရယူရန်'
              : 'Péthar (ဖေ့သာ) ဆော့ဖ်ဝဲ တိုက်ရိုက် ရယူပါ',
        heroSubtitle: 'Android တွင် တိုက်ရိုက် APK၊ iPhone တွင် Configuration Profile ဖြင့် အလွယ်တကူ ထည့်သွင်းနိုင်ပါသည်။',
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
        badge: 'Official Péthar Suite · 1 ₳ = 1 $ · Online + Offline Mode',
        heroTitle:
          targetPlatform === 'ios'
            ? 'Download Péthar for iOS'
            : targetPlatform === 'android'
              ? 'Download Péthar for Android'
              : 'Download Péthar Direct Across Devices',
        heroSubtitle: 'Direct installation via Android APK and Apple Configuration Profile (.mobileconfig).',
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
        scanQr: 'Scan with your smartphone camera to install Péthar mobile app',
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
      filename: 'Péthar-macOS-universal.dmg',
      size: '64.2 MB',
      sha256: '5f33e08119a71bd670c538bc9a022ee719283f089693998b5a19149f12ab7834',
    },
    {
      platform: 'Windows 10/11 x64',
      version: 'v1.0.4',
      filename: 'Péthar-Setup-x64.msi',
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
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/10 text-slate-900 border border-slate-900/20 text-xs font-mono font-bold uppercase tracking-wider">
            <Download className="w-3.5 h-3.5" />
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
              className="px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <span>{t.openWebWallet}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/ios.html"
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold text-xs font-mono shadow-xs transition-all flex items-center gap-2"
            >
              <span> {ak ? 'iOS တိုက်ရိုက် စာမျက်နှာ' : 'Dedicated iOS Portal'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all cursor-pointer ${
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all cursor-pointer ${
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all cursor-pointer ${
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

        {activeTab === 'mobile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              {/* iOS Direct Card */}
              <div
                id="download-ios"
                className={`p-6 sm:p-7 rounded-3xl bg-white border transition-all space-y-5 ${
                  targetPlatform === 'ios'
                    ? 'border-slate-950 ring-2 ring-slate-950/15 shadow-lg'
                    : 'border-slate-200/90 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-2xl shadow-md">
                      
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-950">Péthar for iOS</h3>
                      <p className="text-xs text-slate-500 font-mono">Apple Configuration Profile (.mobileconfig) • iPhone &amp; iPad</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Direct Install
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-mono font-bold">
                          <Zap className="w-3 h-3" /> Offline Mode
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
              </div>

              {/* Android Card */}
              <div
                id="download-android"
                className={`p-6 sm:p-7 rounded-3xl bg-white border transition-all ${
                  targetPlatform === 'android'
                    ? 'border-slate-950 ring-2 ring-slate-950/15 shadow-lg'
                    : 'border-slate-200/90 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-md">
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-950">Péthar for Android</h3>
                      <p className="text-xs text-slate-500 font-mono">Direct APK • Android 9.0+ • Google Play Ready</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Signed Release
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-mono font-bold">
                          <Zap className="w-3 h-3" /> Offline Mode
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <a
                      href="/pethar-release.apk"
                      download
                      className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
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
              <div className="p-8 rounded-3xl bg-slate-100 border border-slate-200 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-950">
                  {ak ? 'ဖုန်းဖြင့် တိုက်ရိုက် ရယူရန်' : 'Instant Mobile Install'}
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  {t.scanQr}
                </p>
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-slate-300 shadow-sm flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-xl flex flex-col items-center justify-center text-white p-4 text-center">
                    <QrCode className="w-20 h-20 text-white mb-2" />
                    <span className="text-[10px] font-mono text-slate-300">SCAN TO INSTALL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'desktop' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                  
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">macOS</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Universal Binary • Apple Silicon &amp; Intel</p>
                </div>
              </div>
              <button
                onClick={() => redirectToSubdomain('app')}
                className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadMac}</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">Windows</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Windows 10 / 11 (64-bit)</p>
                </div>
              </div>
              <button
                onClick={() => redirectToSubdomain('app')}
                className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadWin}</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">Linux</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">AppImage &amp; Debian (.deb)</p>
                </div>
              </div>
              <button
                onClick={() => redirectToSubdomain('app')}
                className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadLinux}</span>
              </button>
            </div>
          </div>
        )}

        <div id="checksum-table" className="space-y-4 pt-6">
          <div>
            <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-900" />
              <span>{t.checksumTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {t.checksumSubtitle}
            </p>
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
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors cursor-pointer"
                            title="Copy SHA-256"
                          >
                            {copiedHash === rel.sha256 ? (
                              <Check className="w-3.5 h-3.5 text-slate-950" />
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
