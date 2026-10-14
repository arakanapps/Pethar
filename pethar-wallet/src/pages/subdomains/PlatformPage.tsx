import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  ShieldAlert, Database, Key, Server, CheckCircle2,
  Activity, Lock, RefreshCw, Cpu, Check, ShieldCheck,
  Radio, HardDrive
} from 'lucide-react';

interface PlatformPageProps {
  lang: Language;
}

interface KycItem {
  id: string;
  name: string;
  petharId: string;
  township: string;
  docType: string;
  status: 'APPROVED' | 'UNDER_REVIEW';
  riskScore: string;
  submittedAt: string;
}

export const PlatformPage = ({ lang }: PlatformPageProps) => {
  const [activeTab, setActiveTab] = useState<'treasury' | 'nodes' | 'compliance' | 'security'>('treasury');
  const [isPinging, setIsPinging] = useState(false);
  const [multiSigSigned, setMultiSigSigned] = useState(false);

  // KYC queue interactive state
  const [kycQueue, setKycQueue] = useState<KycItem[]>([
    {
      id: 'KYC-8891',
      name: 'Jack Halder',
      petharId: 'ARAK-8891-JACK',
      township: 'Sittwe Central',
      docType: 'Arakan National ID + Biometrics',
      status: 'APPROVED',
      riskScore: 'Low (0.02)',
      submittedAt: 'Today · 09:15',
    },
    {
      id: 'KYC-9042',
      name: 'Daw Nilar Win',
      petharId: 'ARAK-9042-NLW',
      township: 'Mrauk-U Ancient District',
      docType: 'Biometric Passport',
      status: 'UNDER_REVIEW',
      riskScore: 'Low (0.05)',
      submittedAt: 'Today · 11:40',
    },
    {
      id: 'KYC-3811',
      name: 'U Kyaw Zan Hla',
      petharId: 'ARAK-3811-KZH',
      township: 'Kyaukphyu Port Zone',
      docType: 'Citizen Smart ID',
      status: 'APPROVED',
      riskScore: 'Low (0.01)',
      submittedAt: 'Yesterday · 16:20',
    },
    {
      id: 'KYC-4402',
      name: 'Ma Khin Hla',
      petharId: 'ARAK-4402-MKH',
      township: 'Thandwe Market Gateway',
      docType: 'Voter Registration + Photo',
      status: 'UNDER_REVIEW',
      riskScore: 'Medium (0.12)',
      submittedAt: 'Today · 13:05',
    },
  ]);

  const [kycFilter, setKycFilter] = useState<'all' | 'UNDER_REVIEW' | 'APPROVED'>('all');

  const handleApproveKyc = (id: string) => {
    setKycQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'APPROVED' } : item))
    );
  };

  const handlePingNodes = () => {
    setIsPinging(true);
    setTimeout(() => setIsPinging(false), 800);
  };

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
        refreshNodes: 'နုတ်ဒ်များ ပြန်လည်စစ်ဆေးမည်',
        signGovernance: 'အုပ်ချုပ်မှု လက်မှတ်ရေးထိုးမည်',
        signedSuccess: 'လက်မှတ်အတည်ပြုပြီး (၃/၃ အောင်မြင်)',
        approve: 'အတည်ပြုမည်',
        approvedBadge: 'အတည်ပြုပြီး ✓',
        reviewBadge: 'စစ်ဆေးဆဲ',
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
        refreshNodes: 'Ping Node Cluster',
        signGovernance: 'Authorize Multi-Sig Action',
        signedSuccess: 'Authorized (3/3 Consensus)',
        approve: 'Approve KYC',
        approvedBadge: 'Approved ✓',
        reviewBadge: 'Under Review',
      };

  const filteredKyc = kycQueue.filter(
    (item) => kycFilter === 'all' || item.status === kycFilter
  );

  return (
    <BaseLayout
      title={t.title}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-8">
        {/* Internal Banner (DNA Payments + Institutional styling) */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

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
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-emerald-400">
                  ALL SYSTEMS OPERATIONAL
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Ledger Block #2,491,012
                </div>
              </div>
            </div>
          </div>

          {/* Metric KPI Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                <span>{t.totalReserve}</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">+4.2%</span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-400">
                $1,560,000 USD
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                {lang === 'ak' ? 'ရွှေတန်ဖိုး ၄၀% + ဒေါ်လာ ၆၀%' : '40% Physical Gold · 60% Escrow USD'}
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <div className="text-xs text-slate-400 mb-1">{t.circulatingSupply}</div>
              <div className="text-2xl font-black font-mono text-white">
                1,485,000 ₳
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{t.reserveRatio}: 105.05%</span>
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <div className="text-xs text-slate-400 mb-1">
                {lang === 'ak' ? '၂၄ နာရီ စာရင်းရှင်းလင်းမှု' : '24h Net Settlement'}
              </div>
              <div className="text-2xl font-black font-mono text-sky-400">
                ₳ 219,450.00
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                1,842 operations settled
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <div className="text-xs text-slate-400 mb-1">{t.nodeUptime}</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                99.998%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lang === 'ak' ? 'ရပ်တန့်မှုမရှိသော ကွန်ရက်' : 'Zero-downtime consensus'}
              </div>
            </div>
          </div>
        </div>

        {/* Platform Module Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('treasury')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'treasury'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.tabTreasury}
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'nodes'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.tabNodes}
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'compliance'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.tabCompliance}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
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

              {/* Reserve Breakdown Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-amber-500">Gold Bullion (40%)</span>
                  <span className="text-sky-500">Liquid USD Escrow (60%)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-amber-500 h-full w-[40%]" />
                  <div className="bg-sky-500 h-full w-[60%]" />
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
                  <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Today · Verified</span>
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">{lang === 'ak' ? 'အုပ်ချုပ်မှုပုံစံ' : 'Governance'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{t.multisigStatus}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
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
                </div>

                <div className="space-y-2.5 pt-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Executive Key 1 (Sittwe Vault)</div>
                      <div className="text-[10px] font-mono text-slate-500">0x74a...92b1 · Master Vault</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">SIGNED ✓</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Executive Key 2 (Mrauk-U Station)</div>
                      <div className="text-[10px] font-mono text-slate-500">0x81e...38d2 · Node Custodian</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">SIGNED ✓</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Executive Key 3 (London HQ Operations)</div>
                      <div className="text-[10px] font-mono text-slate-500">0x12c...94a7 · PeThar Ltd UK</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                      multiSigSigned
                        ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950'
                        : 'text-amber-600 bg-amber-100 dark:bg-amber-950'
                    }`}>
                      {multiSigSigned ? 'SIGNED ✓' : 'READY TO SIGN'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMultiSigSigned(!multiSigSigned)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer"
              >
                {multiSigSigned ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                <span>{multiSigSigned ? t.signedSuccess : t.signGovernance}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Network Nodes */}
        {activeTab === 'nodes' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-500" />
                  <span>{t.nodeStatusTitle}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'ak' ? 'သီးခြားစီ လည်ပတ်နေသော ဗဟိုရှင်းလင်းရေး ကွန်ရက်နုတ်ဒ် ၄ ခု' : '4 geo-distributed Byzantine-fault-tolerant validator clusters'}
                </p>
              </div>
              <button
                onClick={handlePingNodes}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{t.refreshNodes}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Node 01: Sittwe Core</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-xs text-slate-500 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Latency:</span>
                    <span className="text-emerald-500 font-bold">{isPinging ? '...' : '14 ms'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Height:</span>
                    <span className="text-slate-900 dark:text-white font-bold">2,491,012</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TPS:</span>
                    <span className="text-sky-500 font-bold">42 tx/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sync:</span>
                    <span className="text-emerald-500 font-bold">100% (Leader)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Node 02: Mrauk-U Relay</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-slate-500 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Latency:</span>
                    <span className="text-emerald-500 font-bold">{isPinging ? '...' : '22 ms'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Height:</span>
                    <span className="text-slate-900 dark:text-white font-bold">2,491,012</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TPS:</span>
                    <span className="text-sky-500 font-bold">39 tx/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sync:</span>
                    <span className="text-emerald-500 font-bold">100%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Node 03: Kyaukphyu Gateway</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-slate-500 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Latency:</span>
                    <span className="text-emerald-500 font-bold">{isPinging ? '...' : '18 ms'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Height:</span>
                    <span className="text-slate-900 dark:text-white font-bold">2,491,012</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TPS:</span>
                    <span className="text-sky-500 font-bold">41 tx/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sync:</span>
                    <span className="text-emerald-500 font-bold">100%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Node 04: London Hub (UK)</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-slate-500 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Latency:</span>
                    <span className="text-emerald-500 font-bold">{isPinging ? '...' : '68 ms'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Height:</span>
                    <span className="text-slate-900 dark:text-white font-bold">2,491,012</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TPS:</span>
                    <span className="text-sky-500 font-bold">36 tx/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sync:</span>
                    <span className="text-emerald-500 font-bold">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Compliance & KYC Queue */}
        {activeTab === 'compliance' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>{t.kycQueueTitle}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'ak'
                    ? 'နိုင်ငံသားများ၏ အာရက္ခဒေါ်လာ အကောင့်များကို တရားဝင် စိစစ်အတည်ပြုခြင်း'
                    : 'Reviewing citizen identity credentials and verifying biometric documents'}
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setKycFilter('all')}
                  className={`px-3 py-1 rounded-lg transition ${
                    kycFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  All ({kycQueue.length})
                </button>
                <button
                  onClick={() => setKycFilter('UNDER_REVIEW')}
                  className={`px-3 py-1 rounded-lg transition ${
                    kycFilter === 'UNDER_REVIEW'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Pending ({kycQueue.filter((x) => x.status === 'UNDER_REVIEW').length})
                </button>
                <button
                  onClick={() => setKycFilter('APPROVED')}
                  className={`px-3 py-1 rounded-lg transition ${
                    kycFilter === 'APPROVED'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Approved ({kycQueue.filter((x) => x.status === 'APPROVED').length})
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredKyc.map((item) => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40">
                        {item.petharId}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {item.township} · {item.docType} · Submitted: {item.submittedAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-400">
                      Risk: {item.riskScore}
                    </span>
                    {item.status === 'APPROVED' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                        {t.approvedBadge}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                          {t.reviewBadge}
                        </span>
                        <button
                          onClick={() => handleApproveKyc(item.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                        >
                          {t.approve}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Security & HSM */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>{t.securityTitle}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.securityDesc}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500 mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-500" />
                  <span>CIPHER SUITE</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">AES-256-GCM</span>
                <div className="text-[10px] text-emerald-500 mt-1">Authenticated Hardware Engine</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500 mb-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                  <span>KEY GENERATION</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">Ed25519 Curves</span>
                <div className="text-[10px] text-emerald-500 mt-1">FIPS 140-2 Level 3 HSM</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500 mb-1 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                  <span>DATABASE STORAGE</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">SQLCipher Page-Level</span>
                <div className="text-[10px] text-emerald-500 mt-1">PBKDF2 HMAC-SHA512 (256k runs)</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500 mb-1 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-500" />
                  <span>CONSENSUS TIMELOCK</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">2,500ms Block Time</span>
                <div className="text-[10px] text-emerald-500 mt-1">Tamper-Proof Audit Stream</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Hardware enclave status: Verified authentic. No tamper alerts in last 90 days.</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-600 font-bold">ALL GREEN</span>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};