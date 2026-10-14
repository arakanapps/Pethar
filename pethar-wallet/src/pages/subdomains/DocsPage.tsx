import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  BookOpen, Search, ShieldCheck, Terminal, Cpu, ArrowRight,
  Layers, Globe
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface DocsPageProps {
  lang: Language;
}

export const DocsPage = ({ lang }: DocsPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'basics' | 'crypto' | 'mesh' | 'merchant'>('all');

  const t = lang === 'ak'
    ? {
        badge: 'PeThar တရားဝင် နည်းပညာ စာရွက်စာတမ်းများ · Knowledge Base',
        heroTitle: 'အာရက္ခ ဒစ်ဂျစ်တယ် စီးပွားရေး လမ်းညွှန်နှင့် နည်းပညာဗဟုသုတ',
        heroSubtitle: 'အသုံးပြုသူများ၊ ကုန်သည်များနှင့် တည်ဆောက်သူများအတွက် အသေးစိတ် လမ်းညွှန်ချက်များ၊ Cryptographic protocols များနှင့် API နမူနာများ',
        searchPlaceholder: 'လမ်းညွှန်များ၊ သော့များ၊ APIs နှင့် Protocols ရှာဖွေပါ...',
        filterAll: 'အားလုံး',
        filterBasics: 'အခြေခံ အသုံးပြုနည်း',
        filterCrypto: 'Ed25519 လုံခြုံရေး',
        filterMesh: 'အော့ဖ်လိုင်း Mesh စနစ်',
        filterMerchant: 'ကုန်သည် စနစ်များ',
        readGuide: 'လမ်းညွှန်ဖတ်မည်',
      }
    : {
        badge: 'Official PeThar Knowledge Base · Protocol Spec v2.6',
        heroTitle: 'Comprehensive Protocol & Engineering Docs',
        heroSubtitle: 'Deep-dive architectural specifications, non-custodial key custody guides, offline mesh protocols, and institutional treasury APIs',
        searchPlaceholder: 'Search topics: Ed25519, BLE Mesh, Bullion Escrow, Webhooks...',
        filterAll: 'All Docs',
        filterBasics: 'Core Basics',
        filterCrypto: 'Cryptography',
        filterMesh: 'Offline Mesh',
        filterMerchant: 'Merchant Rails',
        readGuide: 'Read Specification',
      };

  const docArticles = [
    {
      id: 'doc-1',
      category: 'basics',
      title: 'Wallet Initialization & Biometric Enclave',
      desc: 'How PeThar derives Ed25519 keypairs inside iOS Secure Enclave and Android StrongBox with zero cloud exposure.',
      tag: 'Architecture',
      readTime: '6 min read'
    },
    {
      id: 'doc-2',
      category: 'crypto',
      title: 'Ed25519 Signature Standards & Verification',
      desc: 'Cryptographic proof mechanics, deterministic nonces, and sub-second validation across sovereign validator nodes.',
      tag: 'Security',
      readTime: '8 min read'
    },
    {
      id: 'doc-3',
      category: 'mesh',
      title: 'Store-and-Forward Offline BLE/NFC Protocol',
      desc: 'Transacting in disconnected environments: packet serialization, relay node incentives, and double-spend collision resolution.',
      tag: 'Protocol',
      readTime: '12 min read'
    },
    {
      id: 'doc-4',
      category: 'merchant',
      title: 'Merchant POS Integration & Dynamic QR Pay',
      desc: 'Integrating PeThar Terminal X1, EMV contactless rails, and generating instant settlement invoices with 0% merchant fees.',
      tag: 'Merchant',
      readTime: '5 min read'
    },
    {
      id: 'doc-5',
      category: 'basics',
      title: '1:1 USDT Parity & London Bullion Proof-of-Reserves',
      desc: 'Mathematical backing model ensuring Arakan Dollar (AKD) remains strictly redeemable 1:1 for USDT or physical gold grams.',
      tag: 'Economics',
      readTime: '7 min read'
    },
    {
      id: 'doc-6',
      category: 'merchant',
      title: 'Corporate Multi-Sig Treasury & Quorum Policies',
      desc: 'Configuring M-of-N signature rules, approval tiers, automated payroll dispatches, and immutable audit exports.',
      tag: 'Enterprise',
      readTime: '10 min read'
    }
  ];

  const filteredArticles = docArticles.filter(art => {
    const matchesCategory = activeCategory === 'all' || art.category === activeCategory;
    const matchesQuery = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tag.toLowerCase().includes(searchQuery.toLowerCase());
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
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {(['all', 'basics', 'crypto', 'mesh', 'merchant'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat === 'all' && t.filterAll}
              {cat === 'basics' && t.filterBasics}
              {cat === 'crypto' && t.filterCrypto}
              {cat === 'mesh' && t.filterMesh}
              {cat === 'merchant' && t.filterMerchant}
            </button>
          ))}
        </div>

        {/* Documentation Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-mono font-bold uppercase">
                    {art.tag}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{art.readTime}</span>
                </div>
                <h3 className="text-base font-black text-slate-950 group-hover:text-amber-600 transition-colors">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {art.desc}
                </p>
              </div>

              <button
                onClick={() => redirectToSubdomain('developer')}
                className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold text-slate-800 group-hover:text-amber-600 transition-colors"
              >
                <span>{t.readGuide}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Quick Links Footer Banner */}
        <div className="p-8 rounded-3xl bg-slate-950 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-2.5 py-1 rounded bg-amber-400/20 text-amber-400 text-[10px] font-mono font-bold uppercase">
                Developer Fast Track
              </span>
              <h3 className="text-xl font-black text-white">Need Live Endpoint Testing?</h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Jump directly into our interactive REST API playground with real-time response inspector and sandbox credentials.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => redirectToSubdomain('api')}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
              >
                <Terminal className="w-4 h-4" />
                <span>Open API Explorer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Architectural Principles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="font-bold text-slate-950">Non-Custodial</h4>
            <p className="text-[11px] text-slate-500 mt-1">Users retain 100% control of private keys on-device.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
            <Globe className="w-5 h-5 text-sky-600 mb-2" />
            <h4 className="font-bold text-slate-950">Censorship Resistant</h4>
            <p className="text-[11px] text-slate-500 mt-1">Direct peer-to-peer ledger propagation without centralized gateway choke points.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
            <Layers className="w-5 h-5 text-amber-600 mb-2" />
            <h4 className="font-bold text-slate-950">100% Backed</h4>
            <p className="text-[11px] text-slate-500 mt-1">Every Arakan Dollar has verifiable 1:1 collateral in audited bullion & USDT.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
            <Cpu className="w-5 h-5 text-purple-600 mb-2" />
            <h4 className="font-bold text-slate-950">Offline Resilient</h4>
            <p className="text-[11px] text-slate-500 mt-1">Bluetooth Low Energy mesh allows transacting during power and internet outages.</p>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};