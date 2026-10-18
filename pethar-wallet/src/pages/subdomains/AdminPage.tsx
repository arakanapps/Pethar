import { useState, useEffect } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  ShieldAlert, Users, Activity,
  Sliders,
  Lock, UserCheck, Eye
} from 'lucide-react';
import type { Txn } from '../../data';
import { fetchTransactionsFromDb } from '../../services/walletDatabase';

interface AdminPageProps {
  lang: Language;
}

export const AdminPage = ({ lang }: AdminPageProps) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'kyc' | 'policy' | 'nodes'>('audit');
  const [kycFilter, setKycFilter] = useState<'pending' | 'approved'>('pending');
  const [txList, setTxList] = useState<Txn[]>([]);

  useEffect(() => {
    fetchTransactionsFromDb().then((txs) => {
      if (txs.length > 0) setTxList(txs);
    });
  }, []);

  const [kycQueue, setKycQueue] = useState([
    { id: 'KYC-801', name: 'Ko Hlaing Min', township: 'Sittwe · Strand Rd', idCard: 'ARAK-NAT-99102', submitted: '12 mins ago', status: 'Pending' },
    { id: 'KYC-802', name: 'Ma Khin Thet', township: 'Mrauk-U · Palace Rd', idCard: 'ARAK-NAT-44120', submitted: '45 mins ago', status: 'Pending' },
    { id: 'KYC-803', name: 'U San Kyaw', township: 'Kyaukphyu · Port Area', idCard: 'ARAK-NAT-33019', submitted: '1 hour ago', status: 'Pending' },
    { id: 'KYC-804', name: 'Daw Mya Nwe', township: 'Thandwe · Market', idCard: 'ARAK-NAT-12904', submitted: '2 hours ago', status: 'Pending' },
  ]);

  const handleApproveKyc = (id: string) => {
    setKycQueue(prev => prev.map(k => k.id === id ? { ...k, status: 'Approved' } : k));
  };

  const t = lang === 'ak'
    ? {
        title: 'ဖေ့သာ စီမံခန့်ခွဲရေးနှင့် စာရင်းစစ် ဗဟိုဌာန',
        badge: 'အဆင့်မြင့် အုပ်ချုပ်သူ သီးသန့်စနစ် (Super-Admin)',
        subtitle: 'အာရက္ခဒစ်ဂျစ်တယ် စာရင်းစစ်ဆေးရေး၊ KYC စိစစ်အတည်ပြုမှုနှင့် ကွန်ရက်နုတ်ဒ်များ စီမံခန့်ခွဲရေး',
        tabAudit: 'စာရင်းစစ်နှင့် အရောင်းအဝယ်များ',
        tabKyc: 'KYC အတည်ပြုရေး တန်းစီဇယား',
        tabPolicy: 'ငွေကြေးစည်းမျဉ်းနှင့် နှုန်းထား',
        tabNodes: 'ကွန်ရက်နုတ်ဒ် ကျန်းမာရေး',
      }
    : {
        title: 'Péthar Operations & Administration Hub',
        badge: 'Authorized Personnel Only (Super-Admin)',
        subtitle: 'Central ledger audit trails, citizen Tier-2 KYC governance, and network consensus orchestration',
        tabAudit: 'Ledger Audit Trails',
        tabKyc: 'Citizen KYC Queue',
        tabPolicy: 'Fee & Limit Policies',
        tabNodes: 'Node Telemetry',
      };

  return (
    <BaseLayout
      title={t.title}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-6">
        
        {/* Admin Executive Header Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
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
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs font-mono">
                <span className="text-slate-400">SESSION: </span>
                <span className="font-bold text-emerald-400">ROOT-OPERATOR-01</span>
              </div>
            </div>
          </div>

          {/* DNA Payments Style Admin Metrics Row */}
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-mono">24h Net Settlement</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-1">
                ₳ 1,248,500
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">↑ 14.8% vs yesterday</div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-mono">Verified Citizens</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                142,850
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">+412 enrolled today</div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-mono">KYC Verification Queue</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
                {kycQueue.filter(k => k.status === 'Pending').length} Pending
              </div>
              <div className="text-[10px] text-amber-400 font-mono mt-0.5">Under 15 min review target</div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-mono">Consensus Nodes</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
                42 / 42 Online
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">100% regional coverage</div>
            </div>
          </div>
        </div>

        {/* Administration Navigation Tabs */}
        <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'audit' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.tabAudit}</span>
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'kyc' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.tabKyc}</span>
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'policy' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.tabPolicy}</span>
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'nodes' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t.tabNodes}</span>
          </button>
        </div>

        {/* Tab 1: Ledger Audit Trails */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Ledger Master Audit Trail</h3>
                <p className="text-xs text-slate-400 font-mono">Immutable cryptographic journal of transactions</p>
              </div>
              <button
                onClick={() => alert('Exporting full 24h ledger in CSV format')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-mono font-bold text-slate-700 transition"
              >
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="pb-3 font-semibold">TRANSACTION ID</th>
                    <th className="pb-3 font-semibold">COUNTERPARTY</th>
                    <th className="pb-3 font-semibold">TYPE</th>
                    <th className="pb-3 font-semibold">TIMESTAMP</th>
                    <th className="pb-3 font-semibold text-right">AMOUNT</th>
                    <th className="pb-3 font-semibold text-right">CONSENSUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {txList.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <span className="font-bold text-slate-900 block">{tx.refId}</span>
                        <span className="text-[10px] text-slate-400 block">{tx.hash}</span>
                      </td>
                      <td className="py-3 text-slate-600">{tx.counterparty}</td>
                      <td className="py-3 uppercase text-slate-500">{tx.category}</td>
                      <td className="py-3 text-slate-400">{tx.time}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{tx.amount.toFixed(2)} AKD</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: KYC Queue */}
        {activeTab === 'kyc' && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Tier-2 Citizen Verification Queue</h3>
                <p className="text-xs text-slate-400 font-mono">Biometric ID and proof of residence reviews</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setKycFilter('pending')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                    kycFilter === 'pending' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Pending ({kycQueue.filter(k => k.status === 'Pending').length})
                </button>
                <button
                  onClick={() => setKycFilter('approved')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                    kycFilter === 'approved' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Approved ({kycQueue.filter(k => k.status === 'Approved').length})
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {kycQueue.filter(k => kycFilter === 'pending' ? k.status === 'Pending' : k.status === 'Approved').map((k) => (
                <div key={k.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 font-bold flex items-center justify-center">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{k.name}</div>
                      <div className="text-slate-400 text-[11px]">{k.township} • {k.idCard}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">{k.submitted}</span>
                    {k.status === 'Pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => alert(`Reviewing identity documents for ${k.name}`)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={() => handleApproveKyc(k.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-2xs"
                        >
                          Approve Tier 2
                        </button>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Verified & Enrolled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Policies */}
        {activeTab === 'policy' && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Monetary & Fee Schedules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">P2P Transfer Fee Ceiling</div>
                <div className="text-2xl font-black text-emerald-600">0.00% (FREE)</div>
                <p className="text-slate-500 text-[11px]">Enforced across all citizen accounts.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Merchant AK QR Transaction Fee</div>
                <div className="text-2xl font-black text-emerald-600">0.00% (FREE)</div>
                <p className="text-slate-500 text-[11px]">Zero payment surcharge for registered retailers.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Offline BLE Mesh Voucher Limit</div>
                <div className="text-2xl font-black text-amber-600">250.00 AKD</div>
                <p className="text-slate-500 text-[11px]">Maximum risk exposure per offline air-gapped cycle.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Reserve Backing Mandate</div>
                <div className="text-2xl font-black text-slate-900">100.00% (1:1 USDT)</div>
                <p className="text-slate-500 text-[11px]">Zero fractional lending permitted by charter.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Nodes Telemetry */}
        {activeTab === 'nodes' && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Core Consensus & Relay Nodes</h3>
            <div className="space-y-3 font-mono text-xs">
              {[
                { name: 'Sittwe Central Ledger Engine #01', region: 'Sittwe Central', ping: '12ms', uptime: '99.999%', state: 'Active Master' },
                { name: 'Mrauk-U Ancient City Relay #02', region: 'Mrauk-U Station', ping: '24ms', uptime: '99.995%', state: 'Active Validator' },
                { name: 'Kyaukphyu Deep Seaport Node #03', region: 'Kyaukphyu Port', ping: '18ms', uptime: '99.998%', state: 'Active Validator' },
                { name: 'Thandwe Beach Gateway Relay #04', region: 'Thandwe Regional', ping: '28ms', uptime: '99.991%', state: 'Active Validator' },
              ].map((node, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">{node.name}</div>
                    <div className="text-slate-400 text-[11px]">{node.region} • Latency: {node.ping}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">Uptime: {node.uptime}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {node.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </BaseLayout>
  );
};