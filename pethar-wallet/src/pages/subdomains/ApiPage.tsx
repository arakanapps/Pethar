import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  Terminal, Play, Copy, Check, CheckCircle2, ArrowRight,
  ShieldCheck, Zap, Globe, BookOpen
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface ApiPageProps {
  lang: Language;
}

interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: string;
  description: string;
  requestBody?: string;
  responseBody: string;
  latency: string;
}

export const ApiPage = ({ lang }: ApiPageProps) => {
  const endpoints: Endpoint[] = [
    {
      id: 'transfers',
      method: 'POST',
      path: '/v1/transfers',
      category: 'Payments',
      description: 'Execute instant atomic transfer between two citizen or merchant accounts with Ed25519 cryptographic authorization.',
      requestBody: JSON.stringify({
        recipient: "akd_node_99a820fc",
        amount: 320.00,
        currency: "AKD",
        memo: "Inventory Batch #109",
        idempotency_key: "idem_901248102"
      }, null, 2),
      responseBody: JSON.stringify({
        id: "tx_01ja892e01",
        status: "settled",
        amount: 320.00,
        currency: "AKD",
        fee: 0.00,
        sender: "akd_node_self",
        recipient: "akd_node_99a820fc",
        block_height: 2491032,
        block_hash: "0x4fe8a0...12ca",
        settled_at: "2026-10-14T07:30:12Z"
      }, null, 2),
      latency: '24ms'
    },
    {
      id: 'rates',
      method: 'GET',
      path: '/v1/rates/live',
      category: 'Market',
      description: 'Stream continuous institutional FX quotes backed by 1:1 USDT reserves and London physical gold bullion.',
      responseBody: JSON.stringify({
        base: "AKD",
        timestamp: 1728901200,
        pairs: {
          "USDT": { rate: 1.00, spread_bps: 0, status: "pegged" },
          "THB": { rate: 36.85, spread_bps: 2, status: "live" },
          "GBP": { rate: 0.7720, spread_bps: 3, status: "live" },
          "XAU_GRAM": { rate: 0.01234, spread_bps: 0, status: "bullion_backed" }
        }
      }, null, 2),
      latency: '12ms'
    },
    {
      id: 'escrow',
      method: 'POST',
      path: '/v1/escrow/create',
      category: 'Escrow',
      description: 'Lock fiat or gold collateral into an immutable 2-of-3 multisig smart escrow contract for cross-border trade.',
      requestBody: JSON.stringify({
        buyer_id: "akd_node_buyer",
        seller_id: "akd_node_seller",
        arbiter: "pethar_chamber",
        collateral_asset: "GOLD_GRAMS",
        collateral_amount: 15.0,
        timelock_hours: 72
      }, null, 2),
      responseBody: JSON.stringify({
        escrow_id: "esc_88201a4f",
        state: "funded_locked",
        multisig_contract: "0x7a819b...44de",
        timelock_expires_at: "2026-10-17T07:30:12Z",
        required_signatures: 2
      }, null, 2),
      latency: '36ms'
    },
    {
      id: 'mesh',
      method: 'POST',
      path: '/v1/mesh/relay',
      category: 'Offline Mesh',
      description: 'Ingest store-and-forward BLE/NFC transaction packets signed during telecom blackouts.',
      requestBody: JSON.stringify({
        raw_packet: "base64_packet_pulse_99014...",
        mesh_hop_count: 3,
        signature: "ed25519_sig_901aef..."
      }, null, 2),
      responseBody: JSON.stringify({
        status: "reconciled",
        reconciled_transactions: 14,
        conflict_detected: false,
        chain_merged_at_height: 2491033
      }, null, 2),
      latency: '45ms'
    }
  ];

  const [activeEndpoint, setActiveEndpoint] = useState<Endpoint>(endpoints[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);

  const t = lang === 'ak'
    ? {
        badge: 'Péthar တရားဝင် REST API · v1 Core Reference',
        heroTitle: 'အာရက္ခ ဒစ်ဂျစ်တယ်ဘဏ္ဍာရေး စနစ်၏ API ဗဟိုချက်',
        heroSubtitle: 'စီးပွားရေးလုပ်ငန်းများနှင့် အက်ပ်များအတွက် တိုက်ရိုက်ချိတ်ဆက်နိုင်သော လုံခြုံစိတ်ချရသည့် ငွေပေးချေမှုနှင့် ငွေလဲလှယ်မှု API များ',
        tryCall: 'API စမ်းသပ်မှု ပြုလုပ်မည်',
        copied: 'ကူးယူပြီးပါပြီ!',
        requestHeader: 'တောင်းဆိုမှု Request',
        responseHeader: 'တုံ့ပြန်မှု Response (200 OK)',
        rateLimitTitle: 'Rate Limits နှင့် စွမ်းဆောင်ရည်',
        uptimeStat: '99.995% Uptime SLA',
        tpsStat: '1,000 req/sec Tier-1 Quota',
        latencyStat: '< 40ms Median Latency',
      }
    : {
        badge: 'Official Péthar REST API · v1 Core Reference',
        heroTitle: 'The Financial API Reference',
        heroSubtitle: 'Programmatic high-speed access to atomic transfers, bullion custody, real-time FX order books, and store-and-forward mesh rails',
        tryCall: 'Simulate API Call',
        copied: 'Copied!',
        requestHeader: 'HTTP Request Body',
        responseHeader: 'Live Response Payload (200 OK)',
        rateLimitTitle: 'Global Performance & Rate Limits',
        uptimeStat: '99.995% Uptime SLA',
        tpsStat: '1,000 req/sec Tier-1 Quota',
        latencyStat: '< 40ms Median Latency',
      };

  const handleSimulate = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 450);
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
            <Terminal className="w-3.5 h-3.5 text-amber-600" />
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
              onClick={() => redirectToSubdomain('developer')}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span>Get API Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => redirectToSubdomain('docs')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs font-mono shadow-2xs transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Integration Guides</span>
            </button>
          </div>
        </div>

        {/* Global SLA Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-500">Service Level Guarantee</p>
              <p className="text-sm font-black text-slate-950">{t.uptimeStat}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-500">Global Throughput</p>
              <p className="text-sm font-black text-slate-950">{t.tpsStat}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-500">Ledger Finality</p>
              <p className="text-sm font-black text-slate-950">{t.latencyStat}</p>
            </div>
          </div>
        </div>

        {/* Interactive API Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Endpoint List Navigation */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200/60 font-mono text-xs font-bold text-slate-700">
              CORE REST ENDPOINTS
            </div>

            <div className="space-y-2">
              {endpoints.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setActiveEndpoint(ep)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    activeEndpoint.id === ep.id
                      ? 'bg-white border-amber-400 shadow-xs ring-2 ring-amber-400/20'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                      ep.method === 'POST' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900">{ep.path}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{ep.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Console & Playground */}
          <div className="lg:col-span-8 rounded-3xl bg-slate-950 border border-slate-800 text-slate-200 shadow-2xl overflow-hidden space-y-0">
            {/* Console Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-black ${
                  activeEndpoint.method === 'POST' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-400 text-slate-950'
                }`}>
                  {activeEndpoint.method}
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  https://api.pethar.co.uk{activeEndpoint.path}
                </span>
              </div>

              <button
                onClick={handleSimulate}
                disabled={isRunning}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 disabled:opacity-50 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? 'Processing...' : t.tryCall}</span>
              </button>
            </div>

            {/* Headers Preview */}
            <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800/80 font-mono text-[11px] text-slate-400 flex flex-wrap items-center gap-4">
              <span>Authorization: Bearer sec_live_...</span>
              <span>X-Ed25519-Sig: sig_7f...</span>
              <span>Accept: application/json</span>
            </div>

            {/* Request Body (if POST) */}
            {activeEndpoint.requestBody && (
              <div className="p-6 border-b border-slate-800/60 font-mono text-xs space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  {t.requestHeader}
                </div>
                <pre className="text-slate-300 overflow-x-auto leading-relaxed bg-slate-900/60 p-4 rounded-xl">
                  {activeEndpoint.requestBody}
                </pre>
              </div>
            )}

            {/* Response Body */}
            <div className="p-6 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-[11px] uppercase tracking-wider font-bold">
                    {t.responseHeader}
                  </span>
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                    HTTP 200 OK • {activeEndpoint.latency}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeEndpoint.responseBody);
                    setCopiedRes(true);
                    setTimeout(() => setCopiedRes(false), 2000);
                  }}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Copy JSON"
                >
                  {copiedRes ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <pre className="text-emerald-400 overflow-x-auto leading-relaxed bg-slate-900/80 p-4 rounded-xl text-[11px]">
                {activeEndpoint.responseBody}
              </pre>
            </div>
          </div>
        </div>

        {/* Security & Authentication Protocol */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-amber-700 font-mono font-bold text-xs uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Authentication Architecture</span>
            </div>
            <h3 className="text-xl font-black text-slate-950">Ed25519 Asymmetric Signatures & Replay Prevention</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              All mutating API requests require an asymmetric Ed25519 signature generated with your hardware key. Each request must contain an ISO-8601 millisecond timestamp and a unique idempotency key. Any replay attempt outside a 30-second window is rejected at the edge gateway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
              <p className="font-bold text-slate-900 mb-1">1. Generate Nonce</p>
              <p className="text-[11px] text-slate-500">Unique cryptographic nonce prevents double executions</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
              <p className="font-bold text-slate-900 mb-1">2. Sign Canonical Body</p>
              <p className="text-[11px] text-slate-500">Sign payload using ed25519_sign(privateKey, payload)</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
              <p className="font-bold text-slate-900 mb-1">3. Transmit in Headers</p>
              <p className="text-[11px] text-slate-500">Deliver signature via X-Péthar-Signature header</p>
            </div>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};