import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import { ArrowDownLeft, ArrowUpRight, ShieldCheck, Wallet } from 'lucide-react';

interface TransferPageProps {
  lang: Language;
}

/**
 * Transfers in Péthar are performed from the wallet with two actions:
 * Receive (show your QR / UID) and Pay (scan a QR or enter a UID).
 * No listings, counterparties or demo balances are rendered here.
 */
export const TransferPage = ({ lang }: TransferPageProps) => {
  const t = lang === 'ak'
    ? {
        badge: 'Péthar ငွေလွှဲ',
        heroTitle: 'ငွေလွှဲခြင်းနှင့် ငွေလက်ခံခြင်း',
        heroSubtitle: 'AKD ပိုက်ဆံအိတ်မှ တိုက်ရိုက် ငွေလွှဲပါ။ ၁ ₳ = ၁ ဒေါ်လာ။',
        receive: 'ငွေလက်ခံရန်',
        receiveDesc: 'သင့် QR ကုဒ် သို့မဟုတ် UID ကို ပြပြီး ငွေလက်ခံပါ။',
        pay: 'ငွေပေးချေရန်',
        payDesc: 'QR ကို စကန်ဖတ်ပါ သို့မဟုတ် လက်ခံသူ UID ရိုက်ထည့်ပါ။',
        security: 'လုံခြုံရေး',
        securityDesc: 'ငွေလွှဲတိုင်းကို သင့် ၆ လုံး PIN ဖြင့် အတည်ပြုပြီး ဆာဗာဘက်တွင် မှတ်တမ်းတင်ပါသည်။',
        wallet: 'ပိုက်ဆံအိတ်ဖွင့်ရန်',
      }
    : {
        badge: 'Péthar Transfers',
        heroTitle: 'Send and receive money',
        heroSubtitle: 'Transfer directly from your AKD wallet. 1 ₳ = $1.00 USD.',
        receive: 'Receive',
        receiveDesc: 'Show your QR code or UID to receive money instantly.',
        pay: 'Pay',
        payDesc: 'Scan a QR code or enter the recipient UID to send money.',
        security: 'Protected by design',
        securityDesc: 'Every transfer is confirmed with your 6-digit PIN and recorded server-side.',
        wallet: 'Open wallet',
      };

  const cards = [
    { icon: ArrowDownLeft, title: t.receive, desc: t.receiveDesc, tone: 'text-emerald-600 bg-emerald-50' },
    { icon: ArrowUpRight, title: t.pay, desc: t.payDesc, tone: 'text-rose-600 bg-rose-50' },
    { icon: ShieldCheck, title: t.security, desc: t.securityDesc, tone: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <BaseLayout title={t.heroTitle} lang={lang} showHeader showFooter>
      <div className="mx-auto max-w-5xl space-y-12">
        <header className="space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-600">
            <Wallet className="h-4 w-4" />
            {t.badge}
          </span>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{t.heroTitle}</h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">{t.heroSubtitle}</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-3">
          {cards.map(({ icon: Icon, title, desc, tone }) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <a
            href="/app"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <Wallet className="h-4 w-4" />
            {t.wallet}
          </a>
        </div>
      </div>
    </BaseLayout>
  );
};

export default TransferPage;
