import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  Terminal, Code2, Cpu, CheckCircle2, Copy, Check, Play,
  Key, ArrowRight, BookOpen, Layers
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface DeveloperPageProps {
  lang: Language;
}

export const DeveloperPage = ({ lang }: DeveloperPageProps) => {
  const [activeSdk, setActiveSdk] = useState<'ts' | 'python' | 'go' | 'rust'>('ts');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simOutput, setSimOutput] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<'transfer' | 'escrow' | 'swap'>('transfer');

  const testApiKey = 'pk_sandbox_akd_89a02fbca837102e';

  const t = lang === 'ak'
    ? {
        badge: 'Péthar ဆော့ဖ်ဝဲလ် အင်ဂျင်နီယာများ ဗဟိုဌာန · v1.4.0 Engine',
        heroTitle: 'အာရက္ခ ဒစ်ဂျစ်တယ်ဘဏ္ဍာရေး စနစ်အတွက် API နှင့် SDK များ',
        heroSubtitle: 'Ed25519 cryptographic authentication နှင့် ပေါ့ပါးသော REST & WebSocket APIs များဖြင့် သင်၏ ငွေပေးချေမှုစနစ်များကို အဆင်သင့်ချိတ်ဆက်ပါ',
        ctaConsole: 'Developer Console သို့ ဝင်မည်',
        ctaDocs: 'API စာရွက်စာတမ်း ဖတ်မည်',
        sandboxTitle: 'Sandbox စမ်းသပ်မှု ပတ်ဝန်းကျင်',
        sandboxDesc: 'တကယ့် ငွေကြေး မသုံးဘဲ Testnet ပေါ်တွင် 10,000 tAKD Faucet ဖြင့် စမ်းသပ်ပါ',
        copyApiKey: 'စမ်းသပ် API Key ကူးယူမည်',
        copied: 'ကူးယူပြီးပါပြီ!',
        runSimulation: 'Sandbox Call စမ်းသပ်မည်',
        webhookTitle: 'Real-time Webhook သတိပေးချက်များ',
        webhookDesc: 'ငွေလွှဲခြင်းနှင့် လဲလှယ်မှု အခြေအနေများကို HMAC-SHA256 လုံခြုံရေးဖြင့် လက်ခံရယူပါ',
      }
    : {
        badge: 'Péthar Developer Core · v1.4.0 Engine · Ed25519 Native',
        heroTitle: 'Build Financial Rails on Péthar',
        heroSubtitle: 'Next-generation payment infrastructure powered by Ed25519 hardware cryptography, sub-second settlements, and offline-first mesh APIs',
        ctaConsole: 'Open Developer Console',
        ctaDocs: 'Read Full Documentation',
        sandboxTitle: 'Zero-Risk Sandbox Environment',
        sandboxDesc: 'Instant testnet keys loaded with 10,000.00 tAKD test faucet for rapid local development',
        copyApiKey: 'Copy Test API Key',
        copied: 'Copied to clipboard!',
        runSimulation: 'Execute Sandbox Call',
        webhookTitle: 'Real-time Webhook Events',
        webhookDesc: 'Instant push notifications delivered with cryptographic HMAC-SHA256 signature validation',
      };

  const codeSnippets = {
    ts: `import { PétharClient } from '@pethar/sdk';

const pethar = new PétharClient({
  apiKey: process.env.PETHAR_SECRET_KEY,
  environment: 'sandbox' // or 'production'
});

// Execute instant zero-fee settlement
const transfer = await pethar.transfers.create({
  recipient: 'akd_node_7f81a92e10bc',
  amount: 450.00,
  currency: 'AKD',
  memo: 'Wholesale Invoice #8921',
  idempotencyKey: 'idem_901248102'
});

console.log('Transit Hash:', transfer.txHash);
console.log('Settlement State:', transfer.status); // 'settled_instant'`,

    python: `from pethar import PétharClient

client = PétharClient(
    api_key="pk_sandbox_akd_89a02fbca837102e",
    network="sandbox"
)

# Broadcast instant payment
transit = client.transfers.create(
    recipient="akd_node_7f81a92e10bc",
    amount=450.00,
    currency="AKD",
    memo="Wholesale Invoice #8921"
)

print(f"Verified Block: {transit.block_height}")
print(f"Receipt Hash: {transit.tx_hash}")`,

    go: `package main

import (
    "context"
    "fmt"
    "github.com/pethar/pethar-go"
)

func main() {
    client := pethar.NewClient("pk_sandbox_akd_89a02fbca837102e")
    
    tx, err := client.Transfers.Create(context.Background(), &pethar.TransferParams{
        Recipient: "akd_node_7f81a92e10bc",
        Amount:    450.00,
        Currency:  "AKD",
        Memo:      "Wholesale Invoice #8921",
    })
    if err != nil {
        panic(err)
    }
    fmt.Printf("Settled in %d ms | Hash: %s\\n", tx.LatencyMs, tx.TxHash)
}`,

    rust: `use pethar_sdk::prelude::*;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = PétharClient::builder()
        .api_key("pk_sandbox_akd_89a02fbca837102e")
        .sandbox()
        .build()?;

    let transfer = client.transfers().create(TransferRequest {
        recipient: "akd_node_7f81a92e10bc".into(),
        amount: rust_decimal_macros::dec!(450.00),
        currency: Currency::AKD,
    }).await?;

    println!("Signature valid: {}", transfer.ed25519_verified);
    Ok(())
}`
  };

  const webhookPayloads = {
    transfer: {
      id: "evt_tr_980124a91b2c",
      object: "event",
      type: "transfer.settled",
      created: 1728901244,
      data: {
        id: "tx_akd_01j9a82e1",
        amount: 450.00,
        currency: "AKD",
        sender: "akd_node_104a991b",
        recipient: "akd_node_7f81a92e10bc",
        fee: 0.00,
        status: "settled",
        ledger_block: 2491024,
        ed25519_signature: "sig_ed25519_7f8b91a0c029...912a"
      }
    },
    escrow: {
      id: "evt_escrow_88192a01",
      object: "event",
      type: "escrow.locked",
      created: 1728901180,
      data: {
        escrow_id: "esc_99104fa2",
        fiat_amount: 15000.00,
        currency: "THB",
        gold_collateral_grams: 5.42,
        timelock_expires_at: 1728987580,
        status: "bonded_active"
      }
    },
    swap: {
      id: "evt_swap_6619024f",
      object: "event",
      type: "exchange.order_filled",
      created: 1728901050,
      data: {
        pair: "AKD/USDT",
        side: "buy",
        executed_qty: 1200.00,
        rate: 1.00,
        slippage: "0.00%",
        maker_fee: 0.00
      }
    }
  };

  const handleRunSimulation = () => {
    setSimulating(true);
    setSimOutput(null);
    setTimeout(() => {
      setSimulating(false);
      setSimOutput(JSON.stringify({
        status: "success",
        http_status: 200,
        latency: "38ms",
        txHash: "0x8fa912c00e1b...99a1",
        block: 2491025,
        fee: "0.00 AKD",
        cryptographic_proof: "Ed25519 hardware enclave validated"
      }, null, 2));
    }, 800);
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
              onClick={() => redirectToSubdomain('api')}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xs transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span>{t.ctaConsole}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => redirectToSubdomain('docs')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs font-mono shadow-2xs transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>{t.ctaDocs}</span>
            </button>
          </div>
        </div>

        {/* Sandbox Quick-Credentials Box */}
        <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">{t.sandboxTitle}</span>
              </div>
              <h3 className="text-lg font-black text-white">Instant Sandbox API Credentials</h3>
              <p className="text-xs text-slate-400 max-w-xl">{t.sandboxDesc}</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700 font-mono text-xs">
              <Key className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
              <span className="text-slate-200 truncate max-w-[200px] sm:max-w-xs">{testApiKey}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(testApiKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs shrink-0 flex items-center gap-1.5 transition-all"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? t.copied : t.copyApiKey}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive SDK Code Sandbox */}
        <div className="rounded-3xl bg-slate-950 border border-slate-800 text-slate-200 shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-slate-300">Quickstart SDK Implementation</span>
            </div>

            {/* SDK Language Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              {(['ts', 'python', 'go', 'rust'] as const).map((sdk) => (
                <button
                  key={sdk}
                  onClick={() => setActiveSdk(sdk)}
                  className={`px-3 py-1 rounded-lg transition-colors capitalize ${
                    activeSdk === sdk
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sdk === 'ts' ? 'TypeScript' : sdk}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeSnippets[activeSdk]);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleRunSimulation}
                disabled={simulating}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{simulating ? 'Broadcasting...' : t.runSimulation}</span>
              </button>
            </div>
          </div>

          {/* Code Preview */}
          <div className="p-6 font-mono text-xs overflow-x-auto bg-slate-950 leading-relaxed text-slate-300">
            <pre>
              <code>{codeSnippets[activeSdk]}</code>
            </pre>
          </div>

          {/* Simulated Terminal Output */}
          {simOutput && (
            <div className="p-6 border-t border-slate-800 bg-slate-900/90 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bold">Transaction Successfully Broadcast to Sandbox Ledger</span>
                </div>
                <span className="text-[10px] text-slate-400">HTTP 200 OK • 38ms</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300 overflow-x-auto text-[11px]">
                {simOutput}
              </pre>
            </div>
          )}
        </div>

        {/* Webhook Events Explorer */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-950">{t.webhookTitle}</h2>
            <p className="text-xs text-slate-600">{t.webhookDesc}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Event Selector List */}
            <div className="lg:col-span-4 space-y-2">
              <button
                onClick={() => setSelectedEvent('transfer')}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedEvent === 'transfer'
                    ? 'bg-amber-50 border-amber-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900">transfer.settled</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">200 OK</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Fires when P2P or merchant payment clears</p>
              </button>

              <button
                onClick={() => setSelectedEvent('escrow')}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedEvent === 'escrow'
                    ? 'bg-amber-50 border-amber-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900">escrow.locked</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">Bonded</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Fires when gold or fiat deposit locks in multi-sig</p>
              </button>

              <button
                onClick={() => setSelectedEvent('swap')}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedEvent === 'swap'
                    ? 'bg-amber-50 border-amber-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900">exchange.order_filled</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold">Executed</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Fires when order book matches currency pair</p>
              </button>
            </div>

            {/* Webhook JSON Visualizer */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-950 text-slate-300 font-mono text-xs border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-400">
                <span>POST https://yourdomain.com/api/pethar-webhook</span>
                <span className="text-amber-400">X-Péthar-Signature: v1,hmac_sha256_...</span>
              </div>
              <pre className="overflow-x-auto text-emerald-400 leading-relaxed text-[11px]">
                {JSON.stringify(webhookPayloads[selectedEvent], null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Developer Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Cpu className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-base font-black text-slate-950">Sub-Second Finality</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consensus engine completes Ed25519 signature validations and balances updates in under 420 milliseconds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-black text-slate-950">Zero-Gas P2P Rails</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Native transfers between verified citizen IDs have zero network fees, funded sustainably by institutional bullion settlements.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-base font-black text-slate-950">Store-and-Forward Mesh</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full offline capability built into client SDKs. Transactions queue locally via BLE and propagate when connectivity is restored.
            </p>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};