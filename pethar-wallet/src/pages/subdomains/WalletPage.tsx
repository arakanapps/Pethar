import { BaseLayout } from './BaseLayout';
import type { Language } from '../i18n';

interface WalletPageProps {
  lang: Language;
}

export const WalletPage = ({ lang }: WalletPageProps) => {
  const t = lang === 'ak'
    ? {
        heroTitle: 'PeThar Wallet - Secure Digital Wallet',
        heroSubtitle: 'Your Arakan Dollar wallet with bank-grade security',
        feature1Title: 'Multi-Currency Support',
        feature1Desc: 'Hold AKD, USDT, and other stablecoins',
        feature2Title: 'Instant P2P Transfers',
        feature2Desc: 'Send to anyone with just a phone number or PeThar ID',
        feature3Title: 'Arakan QR Payments',
        feature3Desc: 'Scan and pay at merchants across Arakan',
        feature4Title: 'Offline Mode',
        feature4Desc: 'Transact without internet using BLE & NFC',
        securityTitle: 'Bank-Level Security',
        securityDesc: 'Hardware-backed encryption & secure enclave protection',
        ctaDownload: 'Download Wallet',
        ctaLearn: 'Features Tour',
      }
    : {
        heroTitle: 'PeThar Wallet - Secure Digital Wallet',
        heroSubtitle: 'Your Arakan Dollar wallet with bank-grade security',
        feature1Title: 'Multi-Currency Support',
        feature1Desc: 'Hold AKD, USDT, and other stablecoins',
        feature2Title: 'Instant P2P Transfers',
        feature2Desc: 'Send to anyone with just a phone number or PeThar ID',
        feature3Title: 'Arakan QR Payments',
        feature3Desc: 'Scan and pay at merchants across Arakan',
        feature4Title: 'Offline Mode',
        feature4Desc: 'Transact without internet using BLE & NFC',
        securityTitle: 'Bank-Level Security',
        securityDesc: 'Hardware-backed encryption & secure enclave protection',
        ctaDownload: 'Download Wallet',
        ctaLearn: 'Features Tour',
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
              {t.ctaDownload}
            </button>
            <button
              className="border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-300 text-gray-700 dark:text-gray-300 py-3 px-8 rounded-lg transition-transform hover:scale-105"
            >
              {t.ctaLearn}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'PeThar Wallet ��� 특징' : 'Wallet Features'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="w-16 h-16 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .891-3 2s1.343 2 3 2 3-.891 3-2-1.343-2-3-2zm0-2.5c1.378 0 2.5 1.122 2.5 2.5S15.878 13 12 13s-2.5-1.122-2.5-2.5S10.622 8 12 8z" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2.07L18 5a2 2 0 00-1.41-.59L12 1l-1.41.59A2 2 0 0010 5l-2 12a2 2 0 00-.59 1.41z" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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

      {/* Security Section */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            {t.securityTitle}
          </h2>
          <p className="text-lg text-center mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {t.securityDesc}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .891-3 2s1.343 2 3 2 3-.891 3-2-1.343-2-3-2zm0-2.5c1.378 0 2.5 1.122 2.5 2.5S15.878 13 12 13s-2.5-1.122-2.5-2.5S10.622 8 12 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Hardware Security</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Secure Enclave & Keystore protection for private keys
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.25c-1.236 0-2.242 1.01-2.709 2.25a.75.75 0 010 1.207c2.756.007 4.987 2.244 4.987 5v.75c0 .414-.336.75-.75.75h-4.5a.75.75 0 010-1.5h4.5a.75.75 0 010-1.5h4.5c.414 0 .75-.336.75-.75v-2.25c0-2.757-2.243-4.992-4.987-5-.467 0-.888.221-1.082.582z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Encryption</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    AES-256 & SQLCipher for data at rest and in transit
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Audit & Compliance</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Regular security audits & compliance with financial regulations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center py-16 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {lang === 'ak' ? 'ဒီဇһανουလာကြိမ်ပါဝင်ပါ' : 'Join Thousands of Users'}
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          {lang === 'ak'
            ? 'PeTharWallet �стройки Dawlonлод်န KYC စာဝ pliẫuမဲ့ နomyind တльную၍ အသုံးပြုပါ'
            : 'Download PeThar Wallet, complete quick verification, and start transacting'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            className="bg-white hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold py-3 px-8 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 12m-8 4v-8" />
            </svg>
            Download on App Store
          </button>
          <button
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            Get on Google Play
          </button>
        </div>
      </section>
    </BaseLayout>
  );
};