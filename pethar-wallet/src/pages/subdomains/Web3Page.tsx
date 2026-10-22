import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  Layers, ShieldCheck, ArrowRight, CheckCircle2, Play,
  Cpu, Globe, Lock, ExternalLink
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface Web3PageProps {
  lang: Language;
}

export const Web3Page = ({ lang }: Web3PageProps) => {
  const [bridgeSimulating, setBridgeSimulating] = useState(false);
  const [bridgeComplete, setBridgeComplete] = useState(false);
  const [selectedChain, setSelectedChain] = useState<'polygon' | 'bsc' | 'arbitrum'>('polygon');

  const t = lang === 'ak'
    ? {
        badge: 'Péthar Web3 တံတား · EVM & Multi-Chain Bridge Protocol',
        heroTitle: 'ဗဟိုမဲ့ ဘဏ္ဍာရေးနှင့် Multi-Chain ချိတ်ဆက်မှု စနစ်',
        heroSubtitle: 'BNB Chain, Polygon, Arbitrum တို့မှ USDT နှင့် ပိုင်ဆိုင်မှုများကို Péthar Ledger သို့ 1:1 တန်းတူ လဲလှယ်ကူးပြောင်းနိုင်ပါသည်',
        ctaBridge: 'Cross-Chain Bridge စမ်းသပ်မည်',
        ctaExplorer: 'Ledger Explorer ကြည့်မည်',
        bridgeTitle: 'Cross-Chain တံတား စမ်းသပ်မှု Simulator',
        bridgeDesc: 'EVM ကွင်းဆက်မှ USDT ပမာဏကို Péthar AKD အဖြစ် စမတ်ကန်ထရိုက်ဖြင့် သော့ခတ်လဲလှယ်ခြင်း',
        runBridge: 'Bridge လဲလှယ်မှု အတည်ပြုမည်',
        bridgeSuccess: 'Bridge အောင်မြင်စွာ ကူးပြောင်းပြီးပါပြီ! (1:1 AKD Minted to Enclave Wallet)',
        didTitle: 'Zero-Knowledge နိုင်ငံသား အထောက်အထား (zk-DID)',
        didDesc: 'ကိုယ်ရေးအချက်အလက် မဖော်ပြဘဲ အာရက္ခနိုင်ငံသားဖြစ်ကြောင်း သင်္ချာနည်းအရ သက်သေပြနိုင်သော W3C စံချိန်မီ DID စနစ်',
      }
    : {
        badge: 'Péthar Web3 Bridge Protocol · EVM & Multi-Chain Rails',
        heroTitle: 'Decentralized Liquidity & DeFi Rails',
        heroSubtitle: 'Seamlessly bridge USDT and stable assets between BNB Chain, Polygon, Arbitrum and Péthar\'s high-speed zero-gas ledger',
        ctaBridge: 'Simulate Cross-Chain Bridge',
        ctaExplorer: 'Explore Ledger',
        bridgeTitle: 'Live Cross-Chain Peg-In Bridge Simulator',
        bridgeDesc: 'Lock standard ERC-20 / BEP-20 USDT into multi-sig smart contracts and receive instant 1:1 Arakan Dollars (AKD) with zero slippage',
        runBridge: 'Execute Cross-Chain Bridge Call',
        bridgeSuccess: 'Bridge Transit Settled! (500.00 AKD Minted & Verified on Block #2,491,048)',
        didTitle: 'Zero-Knowledge Identity (zk-DID)',
        didDesc: 'W3C-compliant Decentralized Identifiers allowing cryptographic citizen verification without exposing real names or private coordinates',
      };

  const handleSimulateBridge = () => {
    setBridgeSimulating(true);
    setBridgeComplete(false);
    setTimeout(() => {
      setBridgeSimulating(false);
      setBridgeComplete(true);
    }, 1100);
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
            <Layers className="w-3.5 h-3.5 text-amber-600" />
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
              onClick={handleSimulateBridge}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span>{t.ctaBridge}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => redirectToSubdomain('developer')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs font-mono shadow-2xs transition-all flex items-center gap-2"
            >
              <span>{t.ctaExplorer}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Cross-Chain Bridge Visualizer */}
        <div className="p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase">{t.bridgeTitle}</span>
              <h3 className="text-xl font-black text-white">EVM Liquidity Peg-In (0% Slippage)</h3>
              <p className="text-xs text-slate-400 max-w-xl">{t.bridgeDesc}</p>
            </div>
            
            {/* Chain Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              {(['polygon', 'bsc', 'arbitrum'] as const).map((chain) => (
                <button
                  key={chain}
                  onClick={() => setSelectedChain(chain)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    selectedChain === chain
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {chain === 'bsc' ? 'BNB Chain' : chain}
                </button>
              ))}
            </div>
          </div>

          {/* Bridge Transfer Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center pt-2">
            
            {/* Source Chain */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300 capitalize">{selectedChain} Mainnet</span>
                <span className="text-[10px] font-mono text-slate-400">Lock Contract</span>
              </div>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xl font-black text-white">500.00</span>
                <span className="text-xs font-bold text-emerald-400">USDT</span>
              </div>
              <p className="text-[10px] font-mono text-slate-500">Contract: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F</p>
            </div>

            {/* Bridge Transit Arrow */}
            <div className="md:col-span-1 text-center">
              <ArrowRight className="w-5 h-5 text-amber-400 mx-auto transform rotate-90 md:rotate-0" />
            </div>

            {/* Destination Chain */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">Péthar Ledger</span>
                <span className="text-[10px] font-mono text-amber-400">1:1 Mint Guarantee</span>
              </div>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xl font-black text-amber-400">500.00</span>
                <span className="text-xs font-bold text-amber-400">₳ (AKD)</span>
              </div>
              <p className="text-[10px] font-mono text-slate-500">Recipient: akd_node_7f81a92e10bc (Enclave Wallet)</p>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-900">
            <div className="font-mono text-xs text-slate-400 space-y-0.5">
              <p>Bridge Gas Fee: <span className="text-emerald-400 font-bold">$0.00 (Sponsored by Reserve)</span></p>
              <p>Estimated Finality: <span className="text-white">~ 12 Seconds (EVM Block Confirms)</span></p>
            </div>

            <button
              onClick={handleSimulateBridge}
              disabled={bridgeSimulating}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{bridgeSimulating ? 'Validating Proofs...' : t.runBridge}</span>
            </button>
          </div>

          {bridgeComplete && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.bridgeSuccess}</span>
            </div>
          )}
        </div>

        {/* zk-DID Identity Section */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-amber-700 font-mono font-bold text-xs uppercase">
              <Lock className="w-4 h-4" />
              <span>{t.didTitle}</span>
            </div>
            <h3 className="text-xl font-black text-slate-950">Decentralized Identity Without Surveillance</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              {t.didDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
              <h4 className="font-bold text-slate-950">Zero-Knowledge Proofs</h4>
              <p className="text-[11px] text-slate-500 mt-1">Prove you are a verified citizen over 18 without revealing birthdate or name.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
              <Cpu className="w-5 h-5 text-amber-600 mb-2" />
              <h4 className="font-bold text-slate-950">W3C Verifiable Credentials</h4>
              <p className="text-[11px] text-slate-500 mt-1">Interoperable with digital passport and visa verification standards.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
              <Globe className="w-5 h-5 text-sky-600 mb-2" />
              <h4 className="font-bold text-slate-950">Decentralized Storage</h4>
              <p className="text-[11px] text-slate-500 mt-1">Identity documents are encrypted with your Ed25519 key on IPFS and local hardware.</p>
            </div>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};