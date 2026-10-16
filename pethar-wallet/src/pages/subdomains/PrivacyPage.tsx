import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';

export const PrivacyPage = ({ lang }: { lang: Language }) => {
  return (
    <BaseLayout
      title={lang === 'ak' ? 'ကိုယ်ရေးအချက်အလက် ကာကွယ်ရေး မူဝါဒ' : 'Péthar Website Privacy Policy'}
      lang={lang}
    >
      <div className="max-w-4xl mx-auto py-8 space-y-6 text-slate-800 text-sm leading-relaxed">
        <p className="text-xs font-mono text-slate-500">Last updated April 15, 2024</p>
        <p>
          At pethar.co.uk, Péthar is committed to protecting the privacy and confidentiality of any
          personal data we collect when you use our sites. If you have any questions, please contact
          us at <a href="mailto:pethar-app@protonmail.com" className="underline font-semibold">pethar-app@protonmail.com</a>.
        </p>
      </div>
    </BaseLayout>
  );
};
