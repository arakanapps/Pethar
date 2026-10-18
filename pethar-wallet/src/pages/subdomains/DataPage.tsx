import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  BarChart3, TrendingUp, ShieldCheck, Download, ArrowRight,
  Activity, DollarSign, Layers
} from 'lucide-react';
import { redirectToSubdomain } from '../../utils/subdomain';

interface DataPageProps {
  lang: Language;
}

export const DataPage = ({ lang }: DataPageProps) => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '1y'>('30d');
  const [downloading, setDownloading] = useState(false);

  const t = lang === 'ak'
    ? {
        badge: 'Péthar ပွင့်လင်းမြင်သာသော စီးပွားရေး စာရင်းအင်း · On-Chain Analytics',
        heroTitle: 'အာရက္ခ ဒစ်ဂျစ်တယ် စီးပွားရေးနှင့် စာရင်းအင်း အချက်အလက်များ',
        heroSubtitle: 'စုစုပေါင်း အာမခံထားသော ပိုင်ဆိုင်မှုများ၊ နေ့စဉ် ငွေလွှဲပြောင်းမှု ပမာဏနှင့် ဒေသတွင်း စီးပွားရေး တိုးတက်မှု ညွှန်းကိန်းများကို အချိန်နှင့်တပြေးညီ ကြည့်ရှုနိုင်ပါသည်',
        ctaApi: 'Data API စာရွက်စာတမ်း',
        ctaDownload: 'CSV စာရင်းအင်း အချက်အလက် ရယူမည်',
        tvlLabel: 'လည်ပတ်နေသော စုစုပေါင်း အာမခံပိုင်ဆိုင်မှု (TVL)',
        volumeLabel: '၂၄ နာရီ ငွေလွှဲပြောင်းမှု ပမာဏ (24h Volume)',
        goldLabel: 'သီးသန့်သိမ်းဆည်းထားသော ရွှေတုံး အရန်ပမာဏ',
        circulatingLabel: 'လည်ပတ်နေသော ဖေ့သာဒေါ်လာ (AKD Supply)',
        parityLabel: '1:1 USDT Peg တည်ငြိမ်မှု',
        townshipTitle: 'မြို့နယ်အလိုက် ဒစ်ဂျစ်တယ် စီးပွားရေး တိုးတက်မှု ညွှန်းကိန်း',
      }
    : {
        badge: 'Public Economic Intelligence & Macro Ledger Analytics',
        heroTitle: 'Macroeconomic & On-Chain Intelligence',
        heroSubtitle: 'Real-time transparent verification of physical bullion reserves, 1:1 USDT peg stability, transaction velocity, and regional commerce indices',
        ctaApi: 'Developer Data API',
        ctaDownload: 'Download Open Data CSV',
        tvlLabel: 'Total Value Locked & Reserve Assets (TVL)',
        volumeLabel: '24-Hour Settlement Volume',
        goldLabel: 'Allocated Physical Bullion Custody',
        circulatingLabel: 'Circulating Arakan Dollars (AKD)',
        parityLabel: '1:1 USDT Peg Stability Index',
        townshipTitle: 'Regional Commerce Velocity by Township',
      };

  const townshipMetrics = [
    { name: 'Sittwe Commercial & Logistics Port', growth: '+14.2%', volume: '$680,400', status: 'high' },
    { name: 'Kyaukphyu Deep Water Hub', growth: '+18.7%', volume: '$420,100', status: 'high' },
    { name: 'Mrauk-U Cultural & Agriculture District', growth: '+6.4%', volume: '$215,800', status: 'steady' },
    { name: 'Maungdaw Border Trade Station', growth: '+11.1%', volume: '$345,900', status: 'steady' },
    { name: 'Thandwe & Ngapali Coastline', growth: '+4.8%', volume: '$178,200', status: 'steady' },
  ];

  const handleDownloadCsv = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
    }, 1000);
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
            <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
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
              <span>{t.ctaApi}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadCsv}
              disabled={downloading}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs font-mono shadow-2xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>{downloading ? 'Preparing CSV...' : t.ctaDownload}</span>
            </button>
          </div>
        </div>

        {/* Top 4 Core Macro Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono font-bold">{t.tvlLabel}</span>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-950 font-mono">$38,450,810</p>
            <p className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4% this quarter
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono font-bold">{t.volumeLabel}</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-950 font-mono">$1,840,290</p>
            <p className="text-[11px] font-mono text-slate-500">
              18,412 transactions settled today
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono font-bold">{t.goldLabel}</span>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-950 font-mono">84.50 kg Au</p>
            <p className="text-[11px] font-mono text-amber-700 font-bold">
              100% Fine Gold 999.9 Audited
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono font-bold">{t.parityLabel}</span>
              <Layers className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-2xl font-black text-slate-950 font-mono">1.00 ₳ = $1.00</p>
            <p className="text-[11px] font-mono text-emerald-600 font-bold">
              0.00% Peg Deviation
            </p>
          </div>
        </div>

        {/* Volume & Settlement Chart Mockup */}
        <div className="p-8 rounded-3xl bg-slate-950 text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase">Macro Settlement History</span>
              <h3 className="text-xl font-black text-white">Consolidated Ledger Volume</h3>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              {(['24h', '7d', '30d', '1y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg uppercase transition-colors ${
                    timeframe === tf
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6 pb-2">
            <div className="flex items-end justify-between gap-2 h-48 border-b border-slate-800 pb-2">
              {[45, 62, 58, 80, 72, 95, 88, 110, 105, 128, 140, 165].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div
                    style={{ height: `${(val / 165) * 100}%` }}
                    className="w-full rounded-t-lg bg-linear-to-t from-amber-500/20 to-amber-400 group-hover:to-amber-300 transition-all duration-300"
                  ></div>
                  <span className="text-[10px] font-mono text-slate-500">{`W${idx + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Township Velocity Index Table */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-950">{t.townshipTitle}</h3>
            <p className="text-xs text-slate-500">
              Aggregated settlement volume and commerce velocity across primary townships.
            </p>
          </div>

          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
            {townshipMetrics.map((town, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">{town.name}</h4>
                  <p className="text-[10px] font-mono text-slate-400">Township Commerce Node</p>
                </div>
                <div className="flex items-center gap-6 sm:text-right font-mono text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400">Monthly Volume</p>
                    <p className="font-bold text-slate-900">{town.volume}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">MoM Growth</p>
                    <p className="font-bold text-emerald-600">{town.growth}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};