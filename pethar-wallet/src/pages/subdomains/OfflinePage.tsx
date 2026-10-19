import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  WifiOff, Radio, Smartphone, ShieldCheck, CheckCircle2,
  ArrowRight, Zap, RefreshCw, Cpu, Layers
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface OfflinePageProps {
  lang: Language;
}

export const OfflinePage = ({ lang }: OfflinePageProps) => {
  const [pulseActive, setPulseActive] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'pulsing' | 'synced'>('idle');

  const t = lang === 'ak'
    ? {
        badge: 'Péthar အော့ဖ်လိုင်း BLE/NFC ကွန်ရက် · Mesh Protocol v2.4',
        heroTitle: 'အင်တာနက်မရှိဘဲ လုံးဝအော့ဖ်လိုင်း ငွေလွှဲပေးချေနိုင်သည့် စနစ်',
        heroSubtitle: 'ဆက်သွယ်ရေးလိုင်းများ ပြတ်တောက်နေချိန်တွင်လည်း Bluetooth Low Energy (BLE) နှင့် NFC နည်းပညာဖြင့် ဖုန်းအချင်းချင်း ထိတွေ့ငွေလွှဲနိုင်ပါသည်',
        ctaTryMesh: 'အော့ဖ်လိုင်းစနစ် စမ်းသပ်မည်',
        ctaDownloadApp: 'မိုဘိုင်းလ်အက်ပ် ရယူမည်',
        simulatorTitle: 'အော့ဖ်လိုင်း Mesh ငွေလွှဲခြင်း စမ်းသပ်မှု Simulator',
        simulatorDesc: 'ဖုန်းအချင်းချင်း အင်တာနက်မပါဘဲ စက္ကန့်ပိုင်းအတွင်း သော့လက်မှတ်ရေးထိုးပြီး ငွေလွှဲပြေစာ ဖလှယ်ခြင်း',
        triggerPulse: 'BLE / NFC ဖုန်းအချင်းချင်း ထိတွေ့မည်',
        pulseRunning: 'အော့ဖ်လိုင်း Cryptographic Pulse ထုတ်လွှင့်နေသည်...',
        pulseComplete: 'အော့ဖ်လိုင်း ပြေစာ အောင်မြင်စွာ ဖလှယ်ပြီးပါပြီ! (အင်တာနက်ရချိန်တွင် အလိုအလျောက် စာရင်းရှင်းပါမည်)',
        protocolTitle: 'အော့ဖ်လိုင်း လုံခြုံရေး ဗိသုကာနှင့် တားဆီးကာကွယ်မှုများ',
      }
    : {
        badge: 'Offline BLE/NFC Mesh Engine · Zero-Internet Protocol',
        heroTitle: 'Transact Without Internet. Unstoppable Mesh.',
        heroSubtitle: 'Complete resilience during telecommunication blackouts. Broadcast cryptographic payment vouchers peer-to-peer using localized Bluetooth Low Energy and NFC pulses',
        ctaTryMesh: 'Simulate Offline Mesh Tap',
        ctaDownloadApp: 'Download Offline App',
        simulatorTitle: 'Interactive Peer-to-Peer Mesh Simulator',
        simulatorDesc: 'Experience how two disconnected smartphones sign, exchange, and store cryptographic payment receipts locally',
        triggerPulse: 'Initiate Offline Device Tap (BLE/NFC)',
        pulseRunning: 'Broadcasting Signed Local Voucher...',
        pulseComplete: 'Offline Receipt Signed & Cached! (Queued for Ledger Reconciliation)',
        protocolTitle: 'Cryptographic Guarantees of Offline Settlements',
      };

  const handleSimulatePulse = () => {
    setPulseActive(true);
    setSyncStatus('pulsing');
    setTimeout(() => {
      setPulseActive(false);
      setSyncStatus('synced');
    }, 1200);
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
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
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
              onClick={handleSimulatePulse}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span>{t.ctaTryMesh}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => redirectToSubdomain('download')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs font-mono shadow-2xs transition-all"
            >
              {t.ctaDownloadApp}
            </button>
          </div>
        </div>

        {/* Interactive Device-to-Device Simulator Box */}
        <div className="p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400 font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>{t.simulatorTitle}</span>
            </div>
            <p className="text-xs text-slate-400">{t.simulatorDesc}</p>
          </div>

          {/* Dual Phone Wire Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
            
            {/* Phone A (Sender) */}
            <div className="md:col-span-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-white">Citizen Node #A</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                  Offline • No 4G
                </span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <p className="text-slate-400 text-[11px]">Local Balance in Secure Enclave:</p>
                <p className="text-lg font-bold text-white">450.00 ₳</p>
                <p className="text-[10px] text-slate-500">Hardware Monotonic Nonce: #4012</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300">
                Voucher: Send 50.00 ₳ to Merchant
              </div>
            </div>

            {/* Mesh Beam Transfer Effect */}
            <div className="md:col-span-3 text-center space-y-3">
              <div className="relative flex items-center justify-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  pulseActive
                    ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg shadow-amber-400/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  <Radio className={`w-8 h-8 ${pulseActive ? 'animate-bounce' : ''}`} />
                </div>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                {pulseActive ? 'BLE Mesh Pulse Active (2.4 GHz)' : 'Offline Proximity Range: 10m'}
              </p>
            </div>

            {/* Phone B (Merchant Node) */}
            <div className="md:col-span-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-xs font-bold text-white">Merchant Node #B</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                  Offline • No Internet
                </span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <p className="text-slate-400 text-[11px]">Received Offline Invoices:</p>
                <p className="text-lg font-bold text-emerald-400">
                  {syncStatus === 'synced' ? '0.00 ₳ (Cached)' : '0.00 ₳ Pending'}
                </p>
                <p className="text-[10px] text-slate-500">Signature: Ed25519 Verified Locally</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300">
                Status: {syncStatus === 'synced' ? 'Receipt Cryptographically Valid' : 'Listening for Pulse...'}
              </div>
            </div>

          </div>

          {/* Interactive Trigger Button */}
          <div className="text-center pt-2">
            <button
              onClick={handleSimulatePulse}
              disabled={pulseActive}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{pulseActive ? t.pulseRunning : t.triggerPulse}</span>
            </button>
          </div>

          {syncStatus === 'synced' && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-2 text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.pulseComplete}</span>
            </div>
          )}
        </div>

        {/* Security Pillars */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-950">{t.protocolTitle}</h2>
            <p className="text-xs text-slate-600">
              How Péthar prevents double spending and fraudulent replays without requiring access to an online blockchain or server.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-base font-black text-slate-950">Hardware Monotonic Nonce</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Secure Enclave guarantees the voucher counter can only strictly increment. It is physically impossible to duplicate or roll back an offline voucher.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-black text-slate-950">Slashing & Collateral Bond</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Any attempted double-spend is automatically detected during reconciliation, resulting in immediate liquidation of the sender's bullion bond.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold">
                <RefreshCw className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-base font-black text-slate-950">Opportunistic Sync Hops</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When any device in the mesh reconnects via satellite (Starlink) or cellular, it carries and gossips pending offline blocks to the main ledger.
              </p>
            </div>
          </div>
        </div>

        {/* Townships Field Deployment Map Strip */}
        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-500 font-mono text-xs uppercase font-bold">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Field Deployment Status</span>
              </div>
              <h3 className="text-lg font-black text-slate-950">Active Relay Coverage in Arakan</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
              50+ Townships & Villages Online
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 font-mono text-xs text-slate-700">
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <p className="font-bold text-slate-900">Sittwe Central</p>
              <p className="text-[11px] text-emerald-600">34 Relay Beacons</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <p className="font-bold text-slate-900">Mrauk-U Heritage</p>
              <p className="text-[11px] text-emerald-600">22 Relay Beacons</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <p className="font-bold text-slate-900">Kyaukphyu Deep Port</p>
              <p className="text-[11px] text-emerald-600">18 Relay Beacons</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <p className="font-bold text-slate-900">Maungdaw Border</p>
              <p className="text-[11px] text-emerald-600">15 Relay Beacons</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <p className="font-bold text-slate-900">Thandwe Airport</p>
              <p className="text-[11px] text-emerald-600">12 Relay Beacons</p>
            </div>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};