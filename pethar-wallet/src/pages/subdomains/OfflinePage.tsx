import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';

interface OfflinePageProps {
  lang: Language;
}

export const OfflinePage = ({ lang }: OfflinePageProps) => {
  const t = lang === 'ak'
    ? {
        heroTitle: 'PeThar Offline - Payments Without Internet',
        heroSubtitle: 'Secure offline payments using Bluetooth Low Energy and NFC technology',
        feature1Title: 'BLE & NFC Technology',
        feature1Desc: 'Transact without internet using device-to-device communication',
        feature2Title: 'Secure Offline Vouchers',
        feature2Desc: 'Cryptographically signed payment vouchers with expiry and replay protection',
        feature3Title: 'Automatic Sync',
        feature3Desc: 'Transactions sync automatically when internet connection is restored',
        feature4Title: 'Works Everywhere',
        feature4Desc: 'Ideal for areas with poor connectivity or during network outages',
        ctaLearnMore: 'How Offline Works',
        ctaGetStarted: 'Try Offline Payments',
      }
    : {
        heroTitle: 'PeThar Offline - Payments Without Internet',
        heroSubtitle: 'Secure offline payments using Bluetooth Low Energy and NFC technology',
        feature1Title: 'BLE & NFC Technology',
        feature1Desc: 'Transact without internet using device-to-device communication',
        feature2Title: 'Secure Offline Vouchers',
        feature2Desc: 'Cryptographically signed payment vouchers with expiry and replay protection',
        feature3Title: 'Automatic Sync',
        feature3Desc: 'Transactions sync automatically when internet connection is restored',
        feature4Title: 'Works Everywhere',
        feature4Desc: 'Ideal for areas with poor connectivity or during network outages',
        ctaLearnMore: 'How Offline Works',
        ctaGetStarted: 'Try Offline Payments',
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
            {lang === 'ak' ? 'PeThar Offline ��� how it works' : 'How PeThar Offline Works'}
          </h2>
          <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {lang === 'ak'
              ? 'PeThar Offline ��� how it works Dawlonлодх'
              : 'Secure offline transactions in three simple steps'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">1. Create Voucher</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create a cryptographically signed payment voucher offline
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-red-50 dark:bg-red-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .891-3 2s1.343 2 3 2 3-.891 3-2-1.343-2-3-2zm0-2.5c1.378 0 2.5 1.122 2.5 2.5S15.878 13 12 13s-2.5-1.122-2.5-2.5S10.622 8 12 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">2. Transfer Offline</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Transfer the voucher to another device via BLE/NFC
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-green-50 dark:bg-green-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">3. Sync Online</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Voucher settles automatically when back online
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'PeThar Offline ��� 특징' : 'PeThar Offline Features'}
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
            {lang === 'ak' ? 'PeThar Offline ��� use cases' : 'Offline Payment Use Cases'}
          </h2>
          <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {lang === 'ak'
              ? 'PeThar Offline ��� use cases Dawlonлодх'
              : 'Ideal scenarios for using PeThar Offline payments'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Rural Areas</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Perfect for villages and communities with limited internet connectivity
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Enables financial inclusion for underserved populations
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Emergency Situations</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Works during natural disasters, network outages, or power failures
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Critical for emergency response and humanitarian aid distribution
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Travel & Remote Work</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ideal for travelers, remote workers, and digital nomads
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                No need to worry about roaming charges or finding WiFi
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Market & Street Vendors</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Perfect for market stalls, street food vendors, and informal businesses
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Enables cashless transactions in cash-only environments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center py-16 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {lang === 'ak' ? 'ဒီဇһာနလာကြိမ် ပါဝင်ပါ' : 'Ready to Try Offline Payments?'}
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          {lang === 'ak'
            ? 'PeThar Offline ��� Dawlonлодх KYC စာဝ pliوفةမဲ့ နomyind တнуюponde လzii'
            : 'Experience the freedom of making payments anywhere, even without internet'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            className="bg-white hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold py-3 px-8 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 12m-8 4v-8" />
            </svg>
            Try Offline Demo
          </button>
          <button
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            Learn More About Offline Tech
          </button>
        </div>
      </section>
    </BaseLayout>
  );
};