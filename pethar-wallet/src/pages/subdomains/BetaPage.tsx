import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';

interface BetaPageProps {
  lang: Language;
}

export const BetaPage = ({ lang }: BetaPageProps) => {
  const t = lang === 'ak'
    ? {
        heroTitle: 'Péthar Beta - Early Access Program',
        heroSubtitle: 'Get early access to new features and help shape the future of Péthar',
        feature1Title: 'New Features Preview',
        feature1Desc: 'Try upcoming features before they are released to the general public',
        feature2Title: 'Influence Development',
        feature2Desc: 'Provide feedback that directly impacts product roadmap and priorities',
        feature3Title: 'Exclusive Rewards',
        feature3Desc: 'Earn special rewards, bonuses, and recognition for your participation',
        feature4Title: 'Community Access',
        feature4Desc: 'Connect with other beta testers and the Péthar development team',
        ctaLearnMore: 'How Beta Program Works',
        ctaGetStarted: 'Join the Beta Program',
      }
    : {
        heroTitle: 'Péthar Beta - Early Access Program',
        heroSubtitle: 'Get early access to new features and help shape the future of Péthar',
        feature1Title: 'New Features Preview',
        feature1Desc: 'Try upcoming features before they are released to the general public',
        feature2Title: 'Influence Development',
        feature2Desc: 'Provide feedback that directly impacts product roadmap and priorities',
        feature3Title: 'Exclusive Rewards',
        feature3Desc: 'Earn special rewards, bonuses, and recognition for your participation',
        feature4Title: 'Community Access',
        feature4Desc: 'Connect with other beta testers and the Péthar development team',
        ctaLearnMore: 'How Beta Program Works',
        ctaGetStarted: 'Join the Beta Program',
      };

  return (
    <BaseLayout
      title={t.heroTitle}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      {/* Hero Section */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t.heroTitle}
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105"
            >
              {t.ctaGetStarted}
            </button>
            <button
              className="border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-300 text-gray-700 dark:text-gray-300 py-3 px-8 rounded-lg transition-transform hover:scale-105"
            >
              {t.ctaLearnMore}
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'Beta ပရိုဂရမ် အလုပ်လုပ်ဆောင်ပုံ' : 'How the Beta Program Works'}
          </h2>
          <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {lang === 'ak'
              ? 'အဆင့်ဆင့် အလုပ်လုပ်ဆောင်ပုံနှင့် အသုံးပြုနည်း ရှင်းလင်းချက်'
              : 'Get early access to new features and help us improve Péthar'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">1. Apply for Access</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Join our beta program to get early access to upcoming features and improvements
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-red-50 dark:bg-red-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .891-3 2s1.343 2 3 2 3-.891 3-2-1.343-2-3-2zm0-2.5c1.378 0 2.5 1.122 2.5 2.5S15.878 13 12 13s-2.5-1.122-2.5-2.5S10.622 8 12 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">2. Test & Provide Feedback</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Use new features in real-world scenarios and share your thoughts and experiences
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-green-50 dark:bg-green-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">3. Earn Rewards & Influence</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get exclusive rewards and help shape the future development of Péthar based on your feedback
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'Beta ပရိုဂရမ်တွင် ပါဝင်ခြင်း၏ အကျိုးကျေးဇူးများ' : 'Benefits of Joining the Beta Program'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="w-16 h-16 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2.07L18 5a2 2 0 00-1.41-.59L12 1l-1.41.59A2 2 0 0010 5l-2 12a2 2 0 00-.59 1.41z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.feature1Title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.feature1Desc}
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="w-16 h-16 mb-4 bg-red-50 dark:bg-red-900/20 rounded-flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .891-3 2s1.343 2 3 2 3-.891 3-2-1.343-2-3-2zm0-2.5c1.378 0 2.5 1.122 2.5 2.5S15.878 13 12 13s-2.5-1.122-2.5-2.5S10.622 8 12 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.feature2Title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.feature2Desc}
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="w-16 h-16 mb-4 bg-green-50 dark:bg-green-900/20 rounded-flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.feature3Title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.feature3Desc}
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="w-16 h-16 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0L13.732 7.868l7.746 7.746c.3.921-.3 1.902-1.244 1.902H4.244c-.944 0-1.544-.98-1.244-1.902L3.303 7.868l7.746-7.746z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.feature4Title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.feature4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Beta Features Section */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'လက်ရှိ စမ်းသပ်နိုင်သော အင်္ဂါရပ်များ' : 'Current Beta Features'}
          </h2>
          <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {lang === 'ak'
              ? 'ဖေ့သာအကောင့်ကို လွယ်ကူလျင်မြန်စွာ ဖွင့်လှစ်ပြီး လုံခြုံစိတ်ချစွာ စတင်အသုံးပြုနိုင်ပါသည်'
              : 'Features currently available in our beta program'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Advanced Analytics Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered financial insights with predictive modeling and trend analysis
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Available to beta testers starting next month
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Multi-Sig Wallet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enhanced security with multi-signature wallet capabilities for shared accounts
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Currently in closed beta with select enterprise customers
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">International Remittance</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cross-border payments to 50+ countries with competitive FX rates
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Open beta - all users can apply for access
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Developer Sandbox</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Test environment with fake money for building and testing integrations
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Available now for all registered developers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center py-16 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {lang === 'ak' ? 'Beta ပရိုဂရမ်တွင် ပါဝင်ရန် အဆင်သင့်ဖြစ်ပြီလား' : 'Ready to Join the Beta Program?'}
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          {lang === 'ak'
            ? 'ဖေ့သာအကောင့်ကို လွယ်ကူလျင်မြန်စွာ ဖွင့်လှစ်ပြီး လုံခြုံစိတ်ချစွာ စတင်အသုံးပြုနိုင်ပါသည်'
            : 'Get early access to new features and help us build the future of Péthar'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            className="bg-white hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold py-3 px-8 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 12m-8 4v-8" />
            </svg>
            Join the Beta Program
          </button>
          <button
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            Learn More About Beta Benefits
          </button>
        </div>
      </section>
    </BaseLayout>
  );
};