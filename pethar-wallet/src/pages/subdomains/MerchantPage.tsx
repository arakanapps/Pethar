import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import { ArakanEmblem } from '../../components/ArakanEmblem';
import type { Language } from '../../i18n';
import {
  QrCode, CheckCircle2,
  TrendingUp, Code2, Copy, Check, Download,
  Smartphone, Zap, Sliders, Play, RotateCcw
} from 'lucide-react';

interface MerchantPageProps {
  lang: Language;
}

export const MerchantPage = ({ lang }: MerchantPageProps) => {
  // POS Simulator State
  const [invoiceAmount, setInvoiceAmount] = useState('85.00');
  const [invoiceCurrency, setInvoiceCurrency] = useState<'AKD' | 'USD' | 'THB' | 'USDT'>('AKD');
  const [invoiceNote, setInvoiceNote] = useState('Sittwe Seafood Market #882');
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fee Calculator Slider
  const [monthlyVolume, setMonthlyVolume] = useState<number>(15000);

  // Code snippet tab
  const [apiTab, setApiTab] = useState<'curl' | 'node' | 'python'>('node');
  const [copiedCode, setCopiedCode] = useState(false);

  // Traditional fee: 3.5% + $0.30 per transaction (assuming ~300 transactions)
  const traditionalFees = monthlyVolume * 0.035 + (monthlyVolume / 50) * 0.30;
  const petharFees = 0; // 0% on PeThar QR domestic settlement
  const annualSavings = (traditionalFees - petharFees) * 12;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
    }, 1200);
  };

  const handleResetPos = () => {
    setIsPaid(false);
    setIsProcessing(false);
  };

  const codeSnippets = {
    curl: `curl -X POST https://api.pethar.co.uk/v1/invoices \\
  -H "Authorization: Bearer sec_live_9014arakan" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": ${invoiceAmount},
    "currency": "${invoiceCurrency}",
    "order_id": "ORD-2026-9014",
    "customer_note": "${invoiceNote}"
  }'`,
    node: `import { PeTharClient } from '@pethar/sdk';

const pethar = new PeTharClient({ apiKey: process.env.PETHAR_KEY });

const invoice = await pethar.invoices.create({
  amount: ${invoiceAmount},
  currency: '${invoiceCurrency}',
  orderId: 'ORD-2026-9014',
  webhookUrl: 'https://store.arakan.io/api/pethar-webhook'
});

console.log('Arakan QR Code URL:', invoice.qrCodeUrl);`,
    python: `from pethar import PeTharClient

client = PeTharClient(api_key="sec_live_9014arakan")

invoice = client.invoices.create(
    amount=${invoiceAmount},
    currency="${invoiceCurrency}",
    order_id="ORD-2026-9014",
    customer_note="${invoiceNote}"
)

print(f"Arakan QR Payload: {invoice.qr_payload}")`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[apiTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const t = lang === 'ak'
    ? {
        badge: 'စီးပွားရေးနှင့် ကုန်သည်များအတွက်',
        heroTitle: 'ဖေ့သာ ကုန်သည်ဝန်ဆောင်မှုနှင့် စမတ် POS',
        heroSubtitle: 'အာရက္ခကုန်သည်များအတွက် ၀% ဝန်ဆောင်ခဖြင့် အခမဲ့ငွေလက်ခံခြင်း၊ Arakan QR နှင့် ချက်ချင်းငွေစာရင်းရှင်းလင်းမှု စနစ်',
        simulatorTitle: 'အာရက္ခ QR ငွေကောက်ခံစက် စမ်းသပ်ရန်',
        simulatorDesc: 'ငွေပမာဏရိုက်ထည့်ပြီး ဖောက်သည်စကင်ဖတ်ငွေပေးချေမှုကို တိုက်ရိုက်စမ်းသပ်ပါ',
        amountLabel: 'ကျသင့်ငွေပမာဏ',
        noteLabel: 'အော်ဒါမှတ်ချက်',
        simulatePayBtn: 'ဖောက်သည်ငွေပေးချေမှု စမ်းသပ်မည်',
        processing: 'ငွေပေးချေမှုကို စိစစ်နေပါသည်...',
        paidSuccess: 'ငွေလက်ခံရရှိပြီးဖြစ်ပါသည်!',
        receiptTitle: 'အရောင်းပြေစာ',
        resetBtn: 'နောက်ထပ် အရောင်းအသစ်',
        calcTitle: 'ကုန်သည်များအတွက် ကုန်ကျစရိတ် သက်သာမှု တွက်ချက်စက်',
        calcDesc: 'ရိုးရာခရက်ဒစ်ကတ် (၃.၅%) နှင့် ဖေ့သာ (၀%) နှိုင်းယှဉ်ချက်',
        monthlyTurnover: 'လစဉ် အရောင်းပမာဏ',
        traditionalCost: 'ရိုးရာဘဏ်/ကတ် ဝန်ဆောင်ခ',
        petharCost: 'ဖေ့သာ ကုန်သည်ဝန်ဆောင်ခ',
        annualSavings: 'တစ်နှစ်လျှင် စုစုပေါင်း သက်သာငွေ',
        featuresTitle: 'လုပ်ငန်းရှင်များအတွက် အားသာချက်များ',
        f1Title: '၀% ဝန်ဆောင်ခ',
        f1Desc: 'ပြည်တွင်း အာရက္ခဒေါ်လာ QR စနစ်ဖြင့် ငွေလက်ခံရာတွင် မည်သည့် ကော်မရှင်ခမျှ မပေးရပါ',
        f2Title: 'ချက်ချင်းငွေရောက်ရှိခြင်း',
        f2Desc: 'စက္ကန့်ပိုင်းအတွင်း သင့်ဖေ့သာပိုက်ဆံအိတ်သို့ ငွေတိုက်ရိုက်ဝင်ရောက်ပါသည်',
        f3Title: 'အင်တာနက်လိုင်းပြတ်ချိန် သုံးစွဲနိုင်မှု',
        f3Desc: 'အော့ဖ်လိုင်း ဘလူးတုသ်/NFC ဖြင့် စာရင်းမှတ်တမ်းများကို လုံခြုံစွာသိမ်းဆည်းနိုင်ပါသည်',
        f4Title: 'နိုင်ငံတကာ ငွေလွှဲလက်ခံနိုင်မှု',
        f4Desc: 'ထိုင်းဘတ်၊ အမေရိကန်ဒေါ်လာနှင့် USDT တို့ဖြင့် တိုက်ရိုက် ငွေကောက်ခံနိုင်ပါသည်',
        apiTitle: 'နည်းပညာရှင်များနှင့် ဆော့ဖ်ဝဲလ် ချိတ်ဆက်ရန်',
      }
    : {
        badge: 'For Retailers & Enterprises',
        heroTitle: 'PeThar Merchant & Smart POS Suite',
        heroSubtitle: 'Zero transaction fees, unified Arakan QR terminals, and instant settlement for local & international commerce',
        simulatorTitle: 'Arakan QR POS Cashier Simulator',
        simulatorDesc: 'Enter a bill amount to generate an instant dynamic QR invoice and test simulated settlement',
        amountLabel: 'Bill Amount',
        noteLabel: 'Order Reference',
        simulatePayBtn: 'Simulate Customer Payment',
        processing: 'Authorizing Transaction...',
        paidSuccess: 'Payment Received Successfully!',
        receiptTitle: 'Merchant Sales Slip',
        resetBtn: 'New Sale',
        calcTitle: 'Merchant Processing Cost Savings Calculator',
        calcDesc: 'Compare legacy card processors (3.5% + $0.30) against PeThar zero-fee domestic rails',
        monthlyTurnover: 'Estimated Monthly Card Sales',
        traditionalCost: 'Legacy Processor Fees',
        petharCost: 'PeThar QR Processing Fee',
        annualSavings: 'Net Annual Business Savings',
        featuresTitle: 'Enterprise Merchant Benefits',
        f1Title: 'Zero Commission',
        f1Desc: '0.00% fees on domestic Arakan QR transactions. Keep 100% of your business revenues.',
        f2Title: 'Instant Settlement',
        f2Desc: 'Immediate ledger credit in seconds. No T+3 settlement delays or frozen holds.',
        f3Title: 'Offline Resilience',
        f3Desc: 'Process secure encrypted NFC/Bluetooth vouchers even during telecommunication blackouts.',
        f4Title: 'Multi-Currency Corridors',
        f4Desc: 'Invoice in AKD, USD, Thai Baht, or USDT with automated liquidity conversion.',
        apiTitle: 'Developer Integration & Webhooks',
      };

  return (
    <BaseLayout
      title={t.heroTitle}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t.heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-2xl leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-800 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>0.00% Merchant Fee</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-amber-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Unified Arakan QR</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sky-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Instant Bank Sweeps</span>
              </span>
            </div>
          </div>
        </div>

        {/* Interactive POS Simulator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {t.simulatorTitle}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                {t.simulatorDesc}
              </p>

              {/* Form Controls */}
              <div className="space-y-4">
                {/* Currency selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Currency Rail
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['AKD', 'USD', 'THB', 'USDT'] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setInvoiceCurrency(curr)}
                        className={`py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                          invoiceCurrency === curr
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.amountLabel}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-mono font-bold text-slate-400">
                      {invoiceCurrency === 'AKD' ? '₳' : invoiceCurrency === 'USD' ? '$' : invoiceCurrency === 'THB' ? '฿' : '₮'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl text-sm font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Preset quick buttons */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                    Quick Preset Bills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Seafood Box (85 ₳)', amt: '85.00', note: 'Sittwe Seafood Port' },
                      { label: 'Hotel Booking (140 ₳)', amt: '140.00', note: 'Mrauk-U Heritage Resort' },
                      { label: 'Generator Fuel (45 ₳)', amt: '45.00', note: 'Kyaukphyu Logistics Depot' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setInvoiceAmount(item.amt);
                          setInvoiceNote(item.note);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500 border border-transparent transition cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.noteLabel}
                  </label>
                  <input
                    type="text"
                    value={invoiceNote}
                    onChange={(e) => setInvoiceNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {isPaid ? (
                <button
                  onClick={handleResetPos}
                  className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.resetBtn}</span>
                </button>
              ) : (
                <button
                  disabled={isProcessing}
                  onClick={handleSimulatePayment}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>{t.processing}</span>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{t.simulatePayBtn}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* POS Terminal & QR Display Column */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm bg-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <ArakanEmblem size={24} variant="badge" />
                  <span className="font-bold text-xs tracking-wider text-amber-400">ARAKAN SMART POS</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>

              {isPaid ? (
                /* Payment Success Slip */
                <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{t.paidSuccess}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{invoiceNote}</p>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-4 text-xs font-mono space-y-2 text-left border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Settled:</span>
                      <span className="font-bold text-emerald-400">{invoiceCurrency} {invoiceAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Processing Fee:</span>
                      <span className="font-bold text-amber-400">0.00 ₳ (0%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Txn Hash:</span>
                      <span className="text-slate-300 text-[10px]">0x38e1...99bc</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Settlement Time:</span>
                      <span className="text-slate-300">Instant (0.8s)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => alert('Merchant receipt exported to PDF.')}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Receipt</span>
                  </button>
                </div>
              ) : (
                /* Dynamic Arakan QR Terminal Screen */
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-xs text-slate-400 font-mono">Invoice Amount</div>
                    <div className="text-3xl font-black font-mono text-white mt-1">
                      {invoiceCurrency} {Number(invoiceAmount || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-amber-400 font-medium mt-0.5">
                      {invoiceNote}
                    </div>
                  </div>

                  {/* QR Graphic */}
                  <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
                    <div className="w-52 h-52 bg-slate-950 rounded-xl p-3 flex flex-col justify-between text-white">
                      <div className="flex justify-between items-center text-[10px] font-bold text-amber-400">
                        <span>ARAKAN QR</span>
                        <span>{invoiceCurrency}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <ArakanEmblem size={72} variant="badge" />
                      </div>
                      <div className="text-[10px] font-mono text-center text-slate-300 truncate">
                        PETHAR-POS-882
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-mono">
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>Scan with PeThar Wallet, Visa, or PromptPay</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DNA Payments Style Fee Comparison Calculator */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>ROI Calculator</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t.calcTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t.calcDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Slider Column */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.monthlyTurnover}</span>
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                    ${monthlyVolume.toLocaleString('en-US')} USD
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1.5">
                  <span>$2,000 / mo</span>
                  <span>$50,000 / mo</span>
                  <span>$100,000 / mo</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                  <div className="text-rose-600 dark:text-rose-400 font-bold mb-1">{t.traditionalCost} (3.5% + $0.30)</div>
                  <div className="text-2xl font-black font-mono text-rose-700 dark:text-rose-300">
                    ${traditionalFees.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Paid to middlemen every month</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold mb-1">{t.petharCost} (0.00%)</div>
                  <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                    $0.00
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Kept in your business treasury</div>
                </div>
              </div>
            </div>

            {/* Savings Result Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-3">
                <div className="text-xs uppercase font-bold tracking-wider text-amber-400">
                  {t.annualSavings}
                </div>
                <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                  +${annualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Re-invest in staff, inventory, or equipment rather than foreign interchange networks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Merchant Features */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
            {t.featuresTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold mb-4">
                0%
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{t.f1Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t.f1Desc}</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{t.f2Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t.f2Desc}</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center font-bold mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{t.f3Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t.f3Desc}</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{t.f4Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t.f4Desc}</p>
            </div>
          </div>
        </div>

        {/* Developer Integration Section */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-black text-white">{t.apiTitle}</h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex p-1 bg-slate-900 rounded-xl text-xs font-mono">
                {(['node', 'curl', 'python'] as const).map((langKey) => (
                  <button
                    key={langKey}
                    onClick={() => setApiTab(langKey)}
                    className={`px-3 py-1 rounded-lg transition uppercase cursor-pointer ${
                      apiTab === langKey
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {langKey}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
            {codeSnippets[apiTab]}
          </pre>
        </div>
      </div>
    </BaseLayout>
  );
};