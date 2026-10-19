import { useState, useEffect } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  Search, ShieldCheck, CheckCircle2, ArrowRight,
  User, Hash, Box
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';
import { fetchTransactionsFromDb, fetchAllUsersForAdmin } from '../../services/walletDatabase';

interface SearchPageProps {
  lang: Language;
}

interface SearchResultItem {
  id: string;
  type: 'tx' | 'node' | 'block' | 'gold_serial';
  title: string;
  subtitle: string;
  timestamp: string;
  status: string;
  link: string;
}

export const SearchPage = ({ lang }: SearchPageProps) => {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'tx' | 'node' | 'block'>('all');
  const [ledgerRecords, setLedgerRecords] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [txs, users] = await Promise.all([
          fetchTransactionsFromDb(),
          fetchAllUsersForAdmin(),
        ]);
        if (!isMounted) return;
        const items: SearchResultItem[] = [];
        (txs || []).forEach((tx) => {
          items.push({
            id: tx.id,
            type: 'tx',
            title: tx.hash || tx.refId || tx.id,
            subtitle: `${tx.title}: ${tx.amount} ${tx.currency} • ${tx.counterparty}`,
            timestamp: tx.time,
            status: tx.status,
            link: 'wallet',
          });
        });
        (users || []).forEach((u) => {
          items.push({
            id: u.uid,
            type: 'node',
            title: `akd_node_${u.uid}`,
            subtitle: `${u.name} • Tier-${u.kyc_tier || 1} Enclave Node`,
            timestamp: 'Active Node',
            status: `Verified Tier-${u.kyc_tier || 1}`,
            link: 'accounts',
          });
        });
        setLedgerRecords(items);
      } catch (err) {
        console.warn('Error loading search ledger records:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const t = lang === 'ak'
    ? {
        badge: 'Péthar Universal Explorer & Search · Ledger',
        heroTitle: 'အာရက္ခ ဒစ်ဂျစ်တယ် Ledger အချက်အလက် ရှာဖွေရေး',
        heroSubtitle: 'ငွေလွှဲပြေစာ Hash၊ နိုင်ငံသား အကောင့်နံပါတ်၊ ရွှေတုံး အမှတ်စဉ်နှင့် Ledger Block များကို ပွင့်လင်းမြင်သာစွာ တိုက်ရိုက် ရှာဖွေပါ',
        placeholder: 'Transaction Hash, Node ID (akd_...), Block #, သို့မဟုတ် ရွှေအမှတ်စဉ်...',
        filterAll: 'အားလုံး',
        filterTx: 'ငွေလွှဲပြေစာများ (Tx)',
        filterNodes: 'အကောင့်များ (Nodes)',
        filterBlocks: 'Blocks',
        noResults: 'ရှာဖွေမှု မတွေ့ရှိပါ။ ကျေးဇူးပြု၍ Hash သို့မဟုတ် အကောင့် ID ကို ပြန်လည်စစ်ဆေးပါ',
      }
    : {
        badge: 'Péthar Universal Explorer & Search · Ledger',
        heroTitle: 'Universal Ledger Search',
        heroSubtitle: 'Search any transaction hash, citizen enclave node, bullion custody certificate, or ledger block with deterministic proof verification',
        placeholder: 'Search Transaction Hash, Node ID (akd_...), Block #, or Bullion Serial...',
        filterAll: 'All Categories',
        filterTx: 'Transactions (Tx)',
        filterNodes: 'Citizen Nodes',
        filterBlocks: 'Ledger Blocks',
        noResults: 'No records matched your search term. Verify the hash or node identifier.',
      };

  const filteredResults = ledgerRecords.filter((item) => {
    const matchesCategory = activeType === 'all' || item.type === activeType;
    const matchesQuery = query === '' || 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.status.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

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
            <Search className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.placeholder}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap justify-center gap-2">
          {(['all', 'tx', 'node', 'block'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeType === type
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {type === 'all' && t.filterAll}
              {type === 'tx' && t.filterTx}
              {type === 'node' && t.filterNodes}
              {type === 'block' && t.filterBlocks}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 font-mono text-xs">
              {t.noResults}
            </div>
          ) : (
            filteredResults.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-amber-400/50 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    {item.type === 'tx' && <Hash className="w-5 h-5" />}
                    {item.type === 'node' && <User className="w-5 h-5" />}
                    {item.type === 'block' && <Box className="w-5 h-5" />}
                    {item.type === 'gold_serial' && <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-mono font-bold text-slate-950 group-hover:text-amber-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600">{item.subtitle}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-mono text-slate-400">{item.timestamp}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {item.status}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => redirectToSubdomain(item.link)}
                  className="px-4 py-2 rounded-xl bg-slate-100 group-hover:bg-amber-400 group-hover:text-slate-950 text-slate-700 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 self-end sm:self-center"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Verification Guarantee */}
        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-black text-slate-950">100% Cryptographic Traceability</h4>
            <p className="text-xs text-slate-500">Every ledger transaction is provably signed by the sender's local hardware enclave.</p>
          </div>
          <button
            onClick={() => redirectToSubdomain('developer')}
            className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold text-xs shrink-0"
          >
            Ledger RPC Docs
          </button>
        </div>

      </div>
    </BaseLayout>
  );
};