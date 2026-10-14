import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  Download, Smartphone, Monitor, ShieldCheck, CheckCircle2,
  Copy, Check, Terminal, QrCode, Cpu, ArrowRight, ExternalLink, HardDrive, RefreshCw
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface DownloadPageProps {
  lang: Language;
}

export const DownloadPage = ({ lang }: DownloadPageProps) => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop' | 'pos'>('mobile');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const t = lang === 'ak'
    ? {
        badge: 'ဖေ့သာ တရားဝင် ဆော့ဖ်ဝဲ · ဗားရှင်း v2.6.4 Stable',
        heroTitle: 'စက်ပစ္စည်းအားလုံးအတွက် PeThar ဆော့ဖ်ဝဲ ဒေါင်းလုဒ်ရယူပါ',
        heroSubtitle: 'iOS, Android, macOS, Windows နှင့် Linux ပလက်ဖောင်းများအတွက် Ed25519 ဟာ့ဒ်ဝဲလုံခြုံရေးပါဝင်သော ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ်',
        tabMobile: 'မိုဘိုင်းလ် (iOS & Android)',
        tabDesktop: 'ဒက်စ်တော့ပ် (Mac & PC)',
        tabPOS: 'ကုန်သည် POS & ဟာ့ဒ်ဝဲ',
        downloadIos: 'iOS App Store မှ ရယူမည်',
        downloadAndroid: 'Google Play မှ ရယူမည်',
        downloadApk: 'တိုက်ရိုက် APK (SHA-256 စိစစ်ပြီး)',
        downloadMac: 'macOS DMG ဒေါင်းလုဒ် (Apple Silicon & Intel)',
        downloadWin: 'Windows 64-bit Installer (.msi)',
        downloadLinux: 'Linux AppImage / Flatpak',
        checksumTitle: 'လုံခြုံရေး လက်မှတ်နှင့် SHA-256 Checksum စစ်ဆေးရန်',
        checksumSubtitle: 'ဒေါင်းလုဒ်လုပ်ထားသော ဖိုင်များကို တရားဝင် cryptographic hash ဖြင့် တိုက်ဆိုင်စစ်ဆေးပါ',
        scanQr: 'ဖုန်းကင်မရာဖြင့် QR Code ဖတ်ပြီး ချက်ချင်းဒေါင်းလုဒ်လုပ်ပါ',
        securityFeature1: 'Hardware Enclave & Secure Element ဖြင့် သော့များကို သိမ်းဆည်းခြင်း',
        securityFeature2: 'အင်တာနက်မရှိချိန် BLE & NFC Mesh ဖြင့် အော့ဖ်လိုင်း ငွေလွှဲနိုင်ခြင်း',
        securityFeature3: 'မည်သည့် တတိယပါတီ စောင့်ကြည့်မှုနှင့် Telemetry မှ မပါဝင်ခြင်း',
        openWebWallet: 'ဝဘ်ဘရောက်ဆာမှ တိုက်ရိုက်အသုံးပြုမည်',
      }
    : {
        badge: 'Official PeThar Client Suite · v2.6.4 Stable',
        heroTitle: 'Download PeThar Across All Your Devices',
        heroSubtitle: 'Native mobile & desktop applications engineered with Ed25519 secure enclave encryption and offline BLE/NFC mesh rails',
        tabMobile: 'Mobile (iOS & Android)',
        tabDesktop: 'Desktop (macOS & Windows)',
        tabPOS: 'Merchant POS & Terminals',
        downloadIos: 'Download on App Store',
        downloadAndroid: 'Get it on Google Play',
        downloadApk: 'Direct Android APK (Signed)',
        downloadMac: 'Download for macOS (Universal)',
        downloadWin: 'Download Windows 64-bit (.msi)',
        downloadLinux: 'Download Linux AppImage',
        checksumTitle: 'Cryptographic Checksum & Signature Verification',
        checksumSubtitle: 'Verify the authenticity and integrity of all client binaries using our official SHA-256 hashes',
        scanQr: 'Scan with your smartphone camera to install PeThar mobile app',
        securityFeature1: 'Hardware Enclave & Biometric Keychain Storage',
        securityFeature2: 'Zero-Internet Offline BLE & NFC Mesh Capability',
        securityFeature3: '100% Non-Custodial with Zero Third-Party Telemetry',
        openWebWallet: 'Launch Instant Web Banking',
      };

  const releases = [
    {
      platform: 'iOS (iPhone & iPad)',
      version: 'v2.6.4 (Build 412)',
      filename: 'PeThar-Wallet-2.6.4.ipa',
      size: '42.8 MB',
      sha256: 'e89a42cf891b0c954e33918a2d1098ef7321b4a9b590e816a1b89947c01a2ef3',
    },
    {
      platform: 'Android APK (Universal)',
      version: 'v2.6.4 (Build 412)',
      filename: 'PeThar-Wallet-2.6.4-release.apk',
      size: '38.4 MB',
      sha256: '9a77f2231b089c19024f2b1d09e86c051a87799e69cba45089fceb9a897210bc',
    },
    {
      platform: 'macOS (Universal DMG)',
      version: 'v2.6.4',
      filename: 'PeThar-Desktop-2.6.4-universal.dmg',
      size: '94.2 MB',
      sha256: '5f33e08119a71bd670c538bc9a022ee719283f089693998b5a19149f12ab7834',
    },
    {
      platform: 'Windows 10/11 x64',
      version: 'v2.6.4',
      filename: 'PeThar-Desktop-Setup-2.6.4-x64.msi',
      size: '88.1 MB',
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
      <div className="space-y-16 max-w-6xl mx-auto">
        
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
              onClick={() => redirectToSubdomain('wallet')}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span>{t.openWebWallet}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('checksum-table');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs font-mono shadow-2xs transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SHA-256 Signatures</span>
            </button>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              
              {/* iOS Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400/40 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-xl shadow-md">
                      
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-950">PeThar for iOS</h3>
                      <p className="text-xs text-slate-500 font-mono">Requires iOS 15.0 or later • iPhone, iPad, Apple Watch</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Secure Enclave
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-mono font-bold">
                          Apple Pay Ready
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => redirectToSubdomain('wallet')}
                    className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 shrink-0"
                  >
                    <span>{t.downloadIos}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Android Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400/40 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md">
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-950">PeThar for Android</h3>
                      <p className="text-xs text-slate-500 font-mono">Requires Android 9.0 (Pie) or higher • Knox / StrongBox</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Google Play Protect
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-mono font-bold">
                          Offline Mesh BLE
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <button
                      onClick={() => redirectToSubdomain('wallet')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
                    >
                      <span>{t.downloadAndroid}</span>
                    </button>
                    <button
                      onClick={() => redirectToSubdomain('wallet')}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <span>{t.downloadApk}</span>
                    </button>
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
                <h3 className="text-lg font-black text-slate-950">Instant Mobile Install</h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  {t.scanQr}
                </p>
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-dashed border-amber-300 shadow-sm flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-4 text-center">
                    <QrCode className="w-20 h-20 text-amber-400 mb-2" />
                    <span className="text-[10px] font-mono text-slate-300">SCAN WITH CAMERA</span>
                  </div>
                </div>
                <p className="text-[11px] font-mono text-slate-500">Universal Smart App Banner · iOS & Android</p>
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
                  Hardware Touch ID auth, native macOS menu bar ticker, and local SQLCipher encrypted vault.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 flex items-center justify-between">
                  <span>brew install pethar-wallet</span>
                  <Copy className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => copyToClipboard('brew install pethar-wallet')} />
                </div>
              </div>
              <button
                onClick={() => redirectToSubdomain('wallet')}
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
                  Windows Hello biometric integration, auto-updater daemon, and background system tray alerts.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 flex items-center justify-between">
                  <span>winget install PeThar.Wallet</span>
                  <Copy className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => copyToClipboard('winget install PeThar.Wallet')} />
                </div>
              </div>
              <button
                onClick={() => redirectToSubdomain('wallet')}
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
                  <p className="text-xs text-slate-500 font-mono mt-0.5">AppImage, Flatpak & Debian (.deb)</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Standalone sandbox AppImage with zero system dependencies and verified GPG developer signatures.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 flex items-center justify-between">
                  <span>flatpak install flathub co.uk.pethar</span>
                  <Copy className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => copyToClipboard('flatpak install flathub co.uk.pethar')} />
                </div>
              </div>
              <button
                onClick={() => redirectToSubdomain('wallet')}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadLinux}</span>
              </button>
            </div>

          </div>
        )}

        {/* POS Tab Content */}
        {activeTab === 'pos' && (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-mono font-bold text-[10px] uppercase">
                  Merchant Hardware Suite
                </span>
                <h3 className="text-2xl font-black text-slate-950">PeThar Terminal X1 & NFC Beacon</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Custom hardened Android POS firmware with integrated thermal printer, offline NFC tap reader, and dual-SIM 4G fallback for retail merchants across Arakan and border zones.
                </p>
              </div>
              <button
                onClick={() => redirectToSubdomain('merchant')}
                className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs shrink-0 flex items-center gap-2 shadow-xs"
              >
                <span>Order Terminal Hardware</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <HardDrive className="w-5 h-5 text-amber-600 mb-2" />
                <h4 className="text-xs font-black text-slate-950">Tamper-Proof Secure Enclave</h4>
                <p className="text-[11px] text-slate-500 mt-1">Automatic key erasure on physical intrusion attempt</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <RefreshCw className="w-5 h-5 text-emerald-600 mb-2" />
                <h4 className="text-xs font-black text-slate-950">Automatic Mesh Sync</h4>
                <p className="text-[11px] text-slate-500 mt-1">Syncs offline ledger receipts as soon as connectivity resumes</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <ShieldCheck className="w-5 h-5 text-sky-600 mb-2" />
                <h4 className="text-xs font-black text-slate-950">PCI-PTS & EMV Certified</h4>
                <p className="text-[11px] text-slate-500 mt-1">Accepts Visa, Mastercard, and PeThar QR contactless</p>
              </div>
            </div>
          </div>
        )}

        {/* SHA-256 Checksum Verification Table */}
        <div id="checksum-table" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-950">{t.checksumTitle}</h2>
              <p className="text-xs text-slate-500">{t.checksumSubtitle}</p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>GPG Public Key ID: 0x48FA_ED25519</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-bold">Platform / Target</th>
                  <th className="py-3 px-4 font-bold">Version</th>
                  <th className="py-3 px-4 font-bold">File Package</th>
                  <th className="py-3 px-4 font-bold">Size</th>
                  <th className="py-3 px-4 font-bold">SHA-256 Checksum</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {releases.map((rel) => (
                  <tr key={rel.filename} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{rel.platform}</td>
                    <td className="py-3.5 px-4 text-slate-500">{rel.version}</td>
                    <td className="py-3.5 px-4 text-amber-700">{rel.filename}</td>
                    <td className="py-3.5 px-4 text-slate-500">{rel.size}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[180px] text-slate-400">{rel.sha256}</span>
                        <button
                          onClick={() => copyToClipboard(rel.sha256)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                          title="Copy full hash"
                        >
                          {copiedHash === rel.sha256 ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => redirectToSubdomain('wallet')}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-all"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Assurance Banner */}
        <div className="p-8 rounded-3xl bg-slate-950 text-white relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="text-sm font-bold text-white">{t.securityFeature1}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Private keys are created on-device inside your hardware enclave and never touch our servers.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="text-sm font-bold text-white">{t.securityFeature2}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Continue transacting even during total internet blackouts via encrypted Bluetooth mesh pulses.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="text-sm font-bold text-white">{t.securityFeature3}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero telemetry, zero tracker scripts, and full independent open-source audit readiness.
              </p>
            </div>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};