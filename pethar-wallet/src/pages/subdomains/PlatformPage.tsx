import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  ShieldAlert, Database, Key
} from 'lucide-react';

interface PlatformPageProps {
  lang: Language;
}

export const PlatformPage = ({ lang }: PlatformPageProps) => {
  const [activeTab, setActiveTab] = useState<'treasury' | 'nodes' | 'compliance' | 'security'>('treasury');

  const t = lang === 'ak'
    ? {
        title: 'ဖေ့သာ ကုမ္ပဏီတွင်း လုပ်ငန်းသုံး ပလက်ဖောင်း',
        badge: 'ကုမ္ပဏီတွင်း သီးသန့် အသုံးပြုရန် (Internal Only)',
        subtitle: 'အာရက္ခဒေါ်လာ ဗဟိုရှင်းလင်းရေး၊ ဘဏ္ဍာတိုက် အရန်ရွှေ/ဒေါ်လာ ထိန်းချုပ်ရေးနှင့် လုံခြုံရေး စီမံခန့်ခွဲမှု',
        tabTreasury: 'ဘဏ္ဍာတိုက်နှင့် အရန်ငွေ',
        tabNodes: 'ကွန်ရက် နုတ်ဒ်များ',
        tabCompliance: 'KYC အတည်ပြုရေး စာရင်း',
        tabSecurity: 'လုံခြုံရေးနှင့် HSM',
        vaultTitle: 'အာရက္ခဒေါ်လာ ၁၀၀% အာမခံ ဘဏ္ဍာတိုက်',
        vaultDesc: 'ရွှေတုံးနှင့် တင်းပြည့် အမေရိကန်ဒေါ်လာဖြင့် အပြည့်အဝ ကျောထောက်နောက်ခံပြုထားသော ဗဟိုအရန်ငွေ',
        totalReserve: 'စုစုပေါင်း ဗဟိုအရန်ငွေ တန်ဖိုး',
        circulatingSupply: 'လက်ရှိ လည်ပတ်နေသော AKD ပမာဏ',
        reserveRatio: 'အာမခံထားရှိမှု အချိုးအစား (Reserve Coverage)',
        multisigStatus: 'ကုမ္ပဏီ အဆင့်မြင့် Multi-Sig လက်မှတ် (၃/၅ ဖွဲ့စည်းပုံ)',
        nodeStatusTitle: 'ဗဟိုဘဏ် ငွေပေးချေမှု နုတ်ဒ်စနစ်များ',
        nodeUptime: 'စနစ် လည်ပတ်မှု ပုံမှန်ရှိခြင်း',
        kycQueueTitle: 'နိုင်ငံသား အဆင့် ၂ KYC စစ်ဆေးအတည်ပြုရန် တန်းစီဇယား',
        kycApprovedNotice: 'မှတ်ပုံတင်နှင့် နိုင်ငံသားစိစစ်မှု ပြီးစီးပြီးဖြစ်ပါသည်',
        securityTitle: 'Hardware Security Module (HSM) နှင့် Secure Enclave',
        securityDesc: 'FIPS 140-2 Level 3 စံချိန်မီ ဟာ့ဒ်ဝဲ လုံခြုံရေးစနစ်ဖြင့် ကိုယ်ရေးကိုယ်တာနှင့် ငွေကြေးဒေတာများကို ကာကွယ်ထားပါသည်',
      }
    : {
        title: 'PeThar Internal Platform',
        badge: 'Internal Company Use Only',
        subtitle: 'Core banking settlement rails, multi-sig treasury vault, and infrastructure administration',
        tabTreasury: 'Treasury & Reserves',
        tabNodes: 'Network Nodes',
        tabCompliance: 'KYC Compliance',
        tabSecurity: 'Security & HSM',
        vaultTitle: '100% Backed Central Reserves Vault',
        vaultDesc: 'Physical gold bullion and USD-denominated Tier-1 institutional collateral backing AKD',
        totalReserve: 'Total Backed Reserve Value',
        circulatingSupply: 'Current Circulating AKD Supply',
        reserveRatio: 'Reserve Coverage Ratio',
        multisigStatus: 'Multi-Sig Governance (3-of-5 Authorized Signers Active)',
        nodeStatusTitle: 'Core Settlement Nodes Status',
        nodeUptime: 'System Uptime (Last 30 Days)',
        kycQueueTitle: 'Tier-2 Citizen KYC Verification Queue',
        kycApprovedNotice: 'National ID and biometric documents verified',
        securityTitle: 'Hardware Security Module (HSM) & Secure Enclave',
        securityDesc: 'FIPS 140-2 Level 3 hardware modules protecting cryptographic keys and private ledgers',
      };

  return (
    <BaseLayout
      title={t.title}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-8">
        {/* Internal Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider mb-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t.badge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {t.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                {t.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-400">
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>

          {/* Metric Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <div className="text-xs text-slate-400 mb-1">{t.totalReserve}</div>
              <div className="text-2xl font-black font-mono text-amber-400">
                $1,560,000 USD
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lang === 'ak' ? 'ရွှေတန်ဖိုး ၄၀% + ဒေါ်လာ ၆၀%' : '40% Physical Gold · 60% Liquid USD'}
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <div className="text-xs text-slate-400 mb-1">{t.circulatingSupply}</div>
              <div className="text-2xl font-black font-mono text-white">
                1,485,000 ₳
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                {t.reserveRatio}: 105.05%
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <div className="text-xs text-slate-400 mb-1">{t.nodeUptime}</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                99.998%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lang === 'ak' ? 'ရပ်တန့်မှုမရှိသော ငွေပေးချေမှုကွန်ရက်' : 'Zero-downtime consensus'}
              </div>
            </div>
          </div>
        </div>

        {/* Platform Module Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('treasury')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'treasury'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.tabTreasury}
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'nodes'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.tabNodes}
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'compliance'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.tabCompliance}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.tabSecurity}
          </button>
        </div>

        {/* Tab 1: Treasury & Reserves */}
        {activeTab === 'treasury' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {t.vaultTitle}
                  </h3>
                  <p className="text-xs text-slate-500">{t.vaultDesc}</p>
                </div>
              </div>
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">{lang === 'ak' ? 'ရွှေအရန်သိုလှောင်မှု' : 'Physical Gold Reserve'}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">250.00 oz (99.99% Fine Gold)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">{lang === 'ak' ? 'ဒေါ်လာ အရန်ငွေ' : 'Liquid USD Reserves'}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">$935,000.00 USD</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">{lang === 'ak' ? 'စစ်ဆေးချက် အတည်ပြုသည့်ရက်' : 'Last Certified Audit'}</span>
                  <span className="font-mono font-bold text-emerald-600">Today · Verified</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">{lang === 'ak' ? 'အုပ်ချုပ်မှုပုံစံ' : 'Governance'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{t.multisigStatus}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {lang === 'ak' ? 'ကုမ္ပဏီ ဗဟိုငွေစာရင်း ထိန်းချုပ်ခွင့်' : 'Treasury Multi-Signature Signers'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'ak' ? 'ငွေကြေးလွှဲပြောင်းမှုတိုင်း အနည်းဆုံး လက်မှတ် ၃ ခု လိုအပ်ပါသည်' : '3 signatures required to authorize liquidity adjustments'}
                  </p>
                </div>
              </div>
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Executive Key 1 (Sittwe Vault)</div>
                    <div className="text-[10px] font-mono text-slate-500">0x74a...92b1</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">ONLINE</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Executive Key 2 (Mrauk-U Station)</div>
                    <div className="text-[10px] font-mono text-slate-500">0x81e...38d2</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">ONLINE</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Executive Key 3 (London HQ Operations)</div>
                    <div className="text-[10px] font-mono text-slate-500">0x12c...94a7</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Network Nodes */}
        {activeTab === 'nodes' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {t.nodeStatusTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Node 01: Sittwe Core</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-slate-500 space-y-1 font-mono">
                  <div>Latency: 14ms</div>
                  <div>Blocks: 2,491,012</div>
                  <div>Sync: 100%</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Node 02: Mrauk-U Relay</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-slate-500 space-y-1 font-mono">
                  <div>Latency: 22ms</div>
                  <div>Blocks: 2,491,012</div>
                  <div>Sync: 100%</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Node 03: Kyaukphyu Gateway</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-slate-500 space-y-1 font-mono">
                  <div>Latency: 18ms</div>
                  <div>Blocks: 2,491,012</div>
                  <div>Sync: 100%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Compliance & KYC */}
        {activeTab === 'compliance' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t.kycQueueTitle}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'ak'
                ? 'နိုင်ငံသားများ၏ အာရက္ခဒေါ်လာ အကောင့်များကို တရားဝင် စိစစ်အတည်ပြုခြင်း'
                : 'Reviewing customer identity documents and Tier-2 citizen credentials'}
            </p>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Jack Halder</div>
                  <div className="text-slate-500 font-mono">ARAK-8891-JACK · Sittwe</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  APPROVED ✓
                </span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Daw Nilar Win</div>
                  <div className="text-slate-500 font-mono">ARAK-9042-NLW · Mrauk-U</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                  UNDER REVIEW
                </span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">U Kyaw Zan Hla</div>
                  <div className="text-slate-500 font-mono">ARAK-3811-KZH · Kyaukphyu</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  APPROVED ✓
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Security & HSM */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.securityTitle}
            </h3>
            <p className="text-xs text-slate-500">{t.securityDesc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-500 block mb-1">ENCRYPTION PROTOCOL</span>
                <span className="font-bold text-slate-900 dark:text-white">AES-256-GCM + Ed25519</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-500 block mb-1">KEY STORAGE ENCLAVE</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">HARDWARE SECURE ENCLAVE</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};