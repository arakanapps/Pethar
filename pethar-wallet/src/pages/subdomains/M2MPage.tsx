import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';

interface M2MPageProps {
  lang: Language;
}

export const M2MPage = ({ lang }: M2MPageProps) => {
  const t = lang === 'ak'
    ? {
        heroTitle: 'Péthar M2M - Machine-to-Machine Payments',
        heroSubtitle: 'Automated payments and financial transactions between devices and systems',
        feature1Title: 'IoT Device Payments',
        feature1Desc: 'Enable smart devices to automatically pay for services, data, or resources',
        feature2Title: 'API-to-API Transactions',
        feature2Desc: 'Programmatic financial transactions between software systems and services',
        feature3Title: 'Subscription & Usage Billing',
        feature3Desc: 'Automated recurring payments based on usage metrics or time periods',
        feature4Title: 'Machine Wallets',
        feature4Desc: 'Secure wallets for machines, devices, and automated systems with programmable controls',
        ctaLearnMore: 'How M2M Works',
        ctaGetStarted: 'Enable M2M Payments',
      }
    : {
        heroTitle: 'Péthar M2M - Machine-to-Machine Payments',
        heroSubtitle: 'Automated payments and financial transactions between devices and systems',
        feature1Title: 'IoT Device Payments',
        feature1Desc: 'Enable smart devices to automatically pay for services, data, or resources',
        feature2Title: 'API-to-API Transactions',
        feature2Desc: 'Programmatic financial transactions between software systems and services',
        feature3Title: 'Subscription & Usage Billing',
        feature3Desc: 'Automated recurring payments based on usage metrics or time periods',
        feature4Title: 'Machine Wallets',
        feature4Desc: 'Secure wallets for machines, devices, and automated systems with programmable controls',
        ctaLearnMore: 'How M2M Works',
        ctaGetStarted: 'Enable M2M Payments',
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
            {lang === 'ak' ? 'Péthar M2M အလုပ်လုပ်ဆောင်ပုံ' : 'How Péthar M2M Works'}
          </h2>
          <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {lang === 'ak'
              ? 'အဆင့်ဆင့် အလုပ်လုပ်ဆောင်ပုံနှင့် အသုံးပြုနည်း ရှင်းလင်းချက်'
              : 'Enable machines and devices to transact autonomously with Péthar'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">1. Register Device</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Register your IoT device, machine, or system with a Péthar Machine Wallet
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-red-50 dark:bg-red-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .891-3 2s1.343 2 3 2 3-.891 3-2-1.343-2-3-2zm0-2.5c1.378 0 2.5 1.122 2.5 2.5S15.878 13 12 13s-2.5-1.122-2.5-2.5S10.622 8 12 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">2. Set Rules</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Define spending limits, approved merchants, and transaction triggers for your device
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-green-50 dark:bg-green-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">3. Transact Automatically</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Devices autonomously transact based on predefined rules and conditions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'Péthar M2M အင်္ဂါရပ်များ' : 'Péthar M2M Features'}
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

      {/* Use Cases Section */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'M2M အသုံးပြုနိုင်သည့် နယ်ပယ်များ' : 'M2M Use Cases'}
          </h2>
          <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {lang === 'ak'
              ? 'လက်တွေ့နယ်ပယ်အသီးသီးတွင် အကျိုးရှိစွာ အသုံးချနိုင်သည့် နည်းလမ်းများ'
              : 'Ideal scenarios for Machine-to-Machine payments with Péthar'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Smart Utilities</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Smart meters automatically pay for electricity, water, or gas based on usage
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Eliminates billing disputes and enables real-time resource management
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Connected Vehicles</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cars automatically pay for tolls, parking, charging, or maintenance services
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Seamless transportation experience without stopping for payments
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Industrial Automation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Machines automatically order supplies, pay for services, or settle accounts
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Lights-out manufacturing with autonomous financial operations
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Digital Services</h3>
              <p className="text-gray-600 dark:text-gray-400">
                APIs and microservices automatically pay for data, computing resources, or third-party services
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Programmable money for software-to-software transactions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center py-16 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {lang === 'ak' ? 'M2M ငွေပေးချေမှုကို စတင်အသုံးပြုရန် အဆင်သင့်ဖြစ်ပြီလား' : 'Ready to Enable M2M Payments?'}
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          {lang === 'ak'
            ? 'ဖေ့သာအကောင့်ကို လွယ်ကူလျင်မြန်စွာ ဖွင့်လှစ်ပြီး လုံခြုံစိတ်ချစွာ စတင်အသုံးပြုနိုင်ပါသည်'
            : 'Enable your devices and systems to transact autonomously with secure machine wallets'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            className="bg-white hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold py-3 px-8 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 12m-8 4v-8" />
            </svg>
            Enable M2M Payments
          </button>
          <button
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            Learn More About M2M Capabilities
          </button>
        </div>
      </section>
    </BaseLayout>
  );
};