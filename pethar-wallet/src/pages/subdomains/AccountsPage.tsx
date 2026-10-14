import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  Briefcase, ShieldCheck, ArrowRight, Download, CheckCircle2,
  Clock, FileText, Plus, ChevronRight
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface AccountsPageProps {
  lang: Language;
}

interface AccountItem {
  id: string;
  name: string;
  accountNumber: string;
  type: string;
  balance: string;
  fiatEquiv: string;
  status: 'active' | 'cold_storage' | 'multisig';
  currency: string;
}

export const AccountsPage = ({ lang }: AccountsPageProps) => {
  const accounts: AccountItem[] = [
    {
      id: 'acc-1',
      name: 'Arakan Sovereign Treasury Master',
      accountNumber: 'AKD-8820-1940-1049',
      type: 'Cold Vault • Multi-Sig 3/5',
      balance: '2,450,810.00 ₳',
      fiatEquiv: '$2,450,810.00 USD',
      status: 'multisig',
      currency: 'AKD'
    },
    {
      id: 'acc-2',
      name: 'London Physical Bullion Depository',
      accountNumber: 'GLD-VAULT-BOE-0084',
      type: '100% Allocated Gold 999.9',
      balance: '84.50 kg Au',
      fiatEquiv: '$7,182,500.00 USD',
      status: 'cold_storage',
      currency: 'GOLD'
    },
    {
      id: 'acc-3',
      name: 'Merchant Settlement Clearing Line',
      accountNumber: 'AKD-0041-9921-8812',
      type: 'Operational Liquidity Pool',
      balance: '185,420.50 ₳',
      fiatEquiv: '$185,420.50 USD',
      status: 'active',
      currency: 'AKD'
    },
    {
      id: 'acc-4',
      name: 'Bangkok Regional Corridor Pool',
      accountNumber: 'THB-NOSTRO-BKK-01',
      type: 'Cross-Border Thai Baht Nostro',
      balance: '12,500,000.00 ฿',
      fiatEquiv: '$339,210.00 USD',
      status: 'active',
      currency: 'THB'
    }
  ];

  const [selectedAcc, setSelectedAcc] = useState<AccountItem>(accounts[0]);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const t = lang === 'ak'
    ? {
        badge: 'PeThar အဖွဲ့အစည်းဆိုင်ရာ ငွေစာရင်းများ · Institutional Treasury',
        heroTitle: 'အာရက္ခ အဖွဲ့အစည်းနှင့် စီးပွားရေး ငွေစာရင်းများ စီမံခန့်ခွဲမှု',
        heroSubtitle: 'Multi-Sig 3-of-5 လုံခြုံရေး၊ ရွှေတုံး အရန်ငွေကြေးများနှင့် နယ်စပ်ဖြတ်ကျော် ငွေစာရင်းများကို တစ်နေရာတည်းတွင် ကြည့်ရှုစစ်ဆေးပါ',
        ctaOpenAccount: 'ငွေစာရင်းအသစ် ဖွင့်လှစ်မည်',
        ctaPortal: 'အင်တာနက်ဘဏ်လုပ်ငန်းသို့ ဝင်မည်',
        statementTitle: 'လစဉ်နှင့် နှစ်စဉ် ငွေစာရင်းရှင်းတမ်း ထုတ်ယူရန်',
        downloadPdf: 'PDF အစီရင်ခံစာ ဒေါင်းလုဒ်',
        downloadCsv: 'CSV စာရင်းဇယား',
        pendingApprovals: 'အတည်ပြုရန် ကျန်ရှိသော လွှဲပြောင်းမှုများ (Quorum Approvals)',
        activeTag: 'တက်ကြွသည်',
        coldTag: 'Cold Storage Vault',
        multisigTag: 'Multi-Sig 3/5',
      }
    : {
        badge: 'Institutional Treasury & Accounts Command · Multi-Sig 3/5',
        heroTitle: 'Sovereign Multi-Account Treasury Architecture',
        heroSubtitle: 'Enterprise segregated sub-accounts, audited gold bullion vaults, Nostro clearing corridors, and granular Maker-Checker governance',
        ctaOpenAccount: 'Open Sub-Account',
        ctaPortal: 'Launch Internet Banking Portal',
        statementTitle: 'Institutional Audit Statements & Tax Exports',
        downloadPdf: 'Export Official PDF Statement',
        downloadCsv: 'Export CSV / OFX Raw Ledger',
        pendingApprovals: 'Pending Multi-Sig Quorum Approvals',
        activeTag: 'Active Clearing',
        coldTag: 'Cold Vault Depository',
        multisigTag: 'Multi-Sig Quorum',
      };

  const handleDownload = (format: string) => {
    setDownloadingFormat(format);
    setTimeout(() => {
      setDownloadingFormat(null);
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
            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
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
              onClick={() => redirectToSubdomain('ibanking')}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span>{t.ctaPortal}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => redirectToSubdomain('wallet')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs font-mono shadow-2xs transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>{t.ctaOpenAccount}</span>
            </button>
          </div>
        </div>

        {/* Multi-Account Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => setSelectedAcc(acc)}
              className={`p-6 rounded-3xl bg-white border cursor-pointer transition-all ${
                selectedAcc.id === acc.id
                  ? 'border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                      {acc.type}
                    </span>
                    {acc.status === 'multisig' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold">
                        {t.multisigTag}
                      </span>
                    )}
                    {acc.status === 'cold_storage' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                        {t.coldTag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-950 pt-1">{acc.name}</h3>
                  <p className="text-xs font-mono text-slate-400">{acc.accountNumber}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] font-mono text-slate-500">Available Liquid Balance</p>
                  <p className="text-xl font-black text-slate-950 font-mono">{acc.balance}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-mono text-slate-500">Parity Valuation</p>
                  <p className="text-xs font-bold text-emerald-600 font-mono">{acc.fiatEquiv}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Maker-Checker Multi-Sig Quorum Approval Strip */}
        <div className="p-8 rounded-3xl bg-slate-950 text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>{t.pendingApprovals}</span>
              </div>
              <h3 className="text-xl font-black text-white">Vendor Payout: Sittwe Solar Microgrid Project</h3>
              <p className="text-xs text-slate-400">Transaction ID: tx_quorum_904128 · Target: 45,000.00 AKD ($45,000.00)</p>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 font-mono text-xs font-bold border border-amber-400/30 shrink-0">
              Quorum: 2 of 3 Confirmed
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Keyholder 1</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                </span>
              </div>
              <p className="text-xs font-bold text-white">Chief Financial Controller</p>
              <p className="text-[10px] font-mono text-slate-500">Signed with Ed25519 Enclave Key</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Keyholder 2</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                </span>
              </div>
              <p className="text-xs font-bold text-white">Sovereign Reserve Trustee</p>
              <p className="text-[10px] font-mono text-slate-500">Signed with Hardware Ledger YubiKey</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300">Keyholder 3</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Pending Sign
                </span>
              </div>
              <p className="text-xs font-bold text-white">Enterprise Audit Officer</p>
              <p className="text-[10px] font-mono text-amber-200/70">Awaiting Biometric Authorization</p>
            </div>
          </div>
        </div>

        {/* Audit Statement Downloads */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-950">{t.statementTitle}</h3>
            <p className="text-xs text-slate-500">
              Download cryptographic proof-of-settlement statements stamped with validator node signatures.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloadingFormat === 'pdf'}
              className="px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{downloadingFormat === 'pdf' ? 'Generating PDF...' : t.downloadPdf}</span>
            </button>
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloadingFormat === 'csv'}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>{downloadingFormat === 'csv' ? 'Exporting CSV...' : t.downloadCsv}</span>
            </button>
          </div>
        </div>

        {/* Security Architecture Notice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="font-bold text-slate-950">Segregated Accounts</h4>
            <p className="text-[11px] text-slate-500 mt-1">Operational funds are mathematically separated from capital bullion reserves.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
            <Briefcase className="w-5 h-5 text-amber-600 mb-2" />
            <h4 className="font-bold text-slate-950">Maker-Checker Controls</h4>
            <p className="text-[11px] text-slate-500 mt-1">High-value outflows require dual independent authorization before dispatch.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
            <FileText className="w-5 h-5 text-sky-600 mb-2" />
            <h4 className="font-bold text-slate-950">Automated Accounting</h4>
            <p className="text-[11px] text-slate-500 mt-1">Direct exports formatted for QuickBooks, Xero, and institutional ERPs.</p>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};