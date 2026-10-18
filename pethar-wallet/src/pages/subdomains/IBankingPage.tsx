import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  Building2, ShieldCheck, ArrowRight, CheckCircle2, Play,
  Users, RefreshCw, Lock, Zap
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface IBankingPageProps {
  lang: Language;
}

export const IBankingPage = ({ lang }: IBankingPageProps) => {
  const [batchSimulating, setBatchSimulating] = useState(false);
  const [batchSettled, setBatchSettled] = useState(false);

  const t = lang === 'ak'
    ? {
        badge: 'Péthar ကော်ပိုရိတ် အင်တာနက်ဘဏ်လုပ်ငန်း · Corporate Banking Portal',
        heroTitle: 'အာရက္ခ စီးပွားရေးလုပ်ငန်းများအတွက် အင်တာနက်ဘဏ်စနစ်',
        heroSubtitle: 'လစာပေးချေမှု အစုလိုက်ဆောင်ရွက်ခြင်း၊ ဝန်ထမ်းများ၏ ဝင်ရောက်ခွင့် အဆင့်ဆင့်သတ်မှတ်ခြင်းနှင့် နိုင်ငံတကာ ငွေလွှဲမှုများကို တစ်နေရာတည်းတွင် စီမံပါ',
        ctaLogin: 'ကော်ပိုရိတ် အကောင့်ဝင်ရောက်မည်',
        ctaAccounts: 'ငွေစာရင်းများ စစ်ဆေးမည်',
        batchTitle: 'လစာနှင့် ကုန်သည် အစုလိုက် ငွေပေးချေမှု (Batch Payroll Engine)',
        batchDesc: 'ကလစ်တစ်ချက်ဖြင့် ဝန်ထမ်းများနှင့် ကုန်သည်များအားလုံးထံသို့ ကော်မရှင်ခ သုညဖြင့် တပြိုင်နက် ငွေလွှဲပေးချေပါ',
        runBatch: 'လစာ အစုလိုက်ပေးချေမှု စမ်းသပ်မည်',
        batchSettledMsg: 'အောင်မြင်စွာ ပေးချေပြီးပါပြီ (၁၄ ဦး၊ စုစုပေါင်း ₳ 38,450.00)',
        rbacTitle: 'အဖွဲ့အစည်းတွင်း တာဝန်ခွဲဝေမှု (Role-Based Permissions)',
      }
    : {
        badge: 'Corporate Internet Banking Portal · Multi-Entity Rails',
        heroTitle: 'Commercial & Institutional Internet Banking',
        heroSubtitle: 'Enterprise batch payroll dispatches, automated Nostro cash-sweeping, and granular role-based Maker-Checker access controls',
        ctaLogin: 'Launch Corporate Portal',
        ctaAccounts: 'View Treasury Accounts',
        batchTitle: 'Commercial Batch Payroll & Supplier Settlements',
        batchDesc: 'Dispatch simultaneous atomic transfers to hundreds of employees and suppliers in under 800 milliseconds with zero gas fees',
        runBatch: 'Execute Batch Settlement Simulation',
        batchSettledMsg: 'Batch Settlement Executed (14 Recipients · ₳ 38,450.00 Total Settled)',
        rbacTitle: 'Granular Role-Based Access Control (RBAC)',
      };

  const payrollBatch = [
    { name: 'Sittwe General Hospital Clinical Staff (8x)', amount: '₳ 18,500.00', status: 'ready' },
    { name: 'Kyaukphyu Port Terminal Engineering (4x)', amount: '₳ 12,800.00', status: 'ready' },
    { name: 'Yangon & Mae Sot Logistics Corridor (2x)', amount: '₳ 7,150.00', status: 'ready' },
  ];

  const handleSimulateBatch = () => {
    setBatchSimulating(true);
    setBatchSettled(false);
    setTimeout(() => {
      setBatchSimulating(false);
      setBatchSettled(true);
    }, 900);
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
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
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
              <span>{t.ctaLogin}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => redirectToSubdomain('accounts')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs font-mono shadow-2xs transition-all"
            >
              {t.ctaAccounts}
            </button>
          </div>
        </div>

        {/* Batch Payroll Simulator */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-700 font-mono text-xs font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>{t.batchTitle}</span>
              </div>
              <h3 className="text-xl font-black text-slate-950">Monthly Payroll Run · Batch ID #PAY-2026-10</h3>
              <p className="text-xs text-slate-500 max-w-xl">{t.batchDesc}</p>
            </div>
            <button
              onClick={handleSimulateBatch}
              disabled={batchSimulating}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{batchSimulating ? 'Settling Transfers...' : t.runBatch}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50">
            {payrollBatch.map((batch, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-mono font-bold text-xs">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{batch.name}</h4>
                    <p className="text-[11px] font-mono text-slate-400">Direct Arakan Dollar Ledger Transit</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:text-right">
                  <span className="text-xs font-mono font-bold text-slate-900">{batch.amount}</span>
                  {batchSettled ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Settled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Queued
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {batchSettled && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.batchSettledMsg}</span>
            </div>
          )}
        </div>

        {/* Role-Based Permissions Matrix */}
        <div className="p-8 rounded-3xl bg-slate-950 text-white space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>{t.rbacTitle}</span>
            </div>
            <h3 className="text-xl font-black text-white">Hierarchical Enterprise Governance</h3>
            <p className="text-xs text-slate-400">
              Assign strict organizational capabilities with multi-factor biometric authentication requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold">
                  Level 3
                </span>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Chief Treasurer / Owner</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full authority to manage vault keys, configure quorum policies, and sign multi-million dollar bullion redemptions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold">
                  Level 2
                </span>
                <RefreshCw className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Treasury Operator / Maker</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prepare batch payroll, initiate supplier invoices, and swap operational currencies within defined daily caps.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-sky-400/20 text-sky-300 text-[10px] font-mono font-bold">
                  Level 1
                </span>
                <ShieldCheck className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-white">External Auditor / Viewer</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Read-only access to verify reserve balances, export tax statements, and validate cryptographic node blocks.
              </p>
            </div>
          </div>
        </div>

        {/* Corporate Features Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <Zap className="w-6 h-6 text-amber-600 mb-2" />
            <h4 className="text-base font-black text-slate-950">Automated Cash Sweeping</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consolidate end-of-day store balances from regional branch accounts directly into the central Arakan treasury.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
            <h4 className="text-base font-black text-slate-950">Multi-Factor Hardware Enclave</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every wire above $10,000 mandates biometric Touch ID/Face ID verification or FIDO2 physical security keys.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <Building2 className="w-6 h-6 text-sky-600 mb-2" />
            <h4 className="text-base font-black text-slate-950">Virtual IBANs & Routing</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dedicated Euro and UK clearing accounts to receive settlements directly into Péthar.
            </p>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};