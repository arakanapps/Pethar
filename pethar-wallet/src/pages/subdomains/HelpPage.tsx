import { BaseLayout } from './BaseLayout';
import type { Language } from '../i18n';

interface HelpPageProps {
  lang: Language;
}

export const HelpPage = ({ lang }: HelpPageProps) => {
  const t = lang === 'ak'
    ? {
        heroTitle: 'PeThar Help Center',
        heroSubtitle: 'Find answers to common questions about PeThar Wallet and services',
        feature1Title: 'Getting Started',
        feature1Desc: 'How to create your account and verify your identity',
        feature2Title: 'Sending & Receiving',
        feature2Desc: 'Learn how to send and receive funds with PeThar',
        feature3Title: 'Security & Safety',
        feature3Desc: 'How we protect your funds and personal information',
        feature4Title: 'Business Solutions',
        feature4Desc: 'Using PeThar for your business and merchant needs',
        ctaSearch: 'Search Help Center',
        ctaContact: 'Contact Support',
      }
    : {
        heroTitle: 'PeThar Help Center',
        heroSubtitle: 'Find answers to common questions about PeThar Wallet and services',
        feature1Title: 'Getting Started',
        feature1Desc: 'How to create your account and verify your identity',
        feature2Title: 'Sending & Receiving',
        feature2Desc: 'Learn how to send and receive funds with PeThar',
        feature3Title: 'Security & Safety',
        feature3Desc: 'How we protect your funds and personal information',
        feature4Title: 'Business Solutions',
        feature4Desc: 'Using PeThar for your business and merchant needs',
        ctaSearch: 'Search Help Center',
        ctaContact: 'Contact Support',
      };

  const faqItems = lang === 'ak' ? [
    {
      question: 'PeThar Wallet ��� Dawlonлодх KYC စာဝ pliوفةမဲ့ နomyind တльнуюponde လzii',
      answer: 'PeThar Wallet app ကို Apple Store � aimé Borneo Dawlonлодх, KYC စာဝ pliوفةမဲ့ နomyind တльнуюponde လzii,itsda ပして $10,000 AKD พร้อมใช้งานทันที'
    },
    {
      question: 'PeThar ��� Dawlonлодх KYC စာဝ pliوفةမဲ့ နomyind တnąیی муба МЫ МЫ',
      answer: 'PeThar ကို ইন্টারনেট�ရှိေ�временем zamanda도 траnsac 군ders 消费者采购祈愿师资格认定核定的文件'
    },
    {
      question: 'PeThar ��� Dawlonлодх KYC စာဝ pliوفةမဲ့ နomyind တнуюponde ลี้',
      answer: 'PeThar ถอนเงินได้ผ่านตัวแทนที่ได้รับอนุญาตหรือการโอนเงินผ่านธนาคารที่เชื่อมต่อกับระบบ PeThar'
    }
  ] : [
    {
      question: 'How do I download and set up the PeThar Wallet?',
      answer: 'You can download the PeThar Wallet from the App Store or Google Play. After installation, follow the on-screen instructions to create your account and complete the quick verification process.'
    },
    {
      question: 'Can I use PeThar without internet connection?',
      answer: 'Yes! PeThar features an offline payment protocol using Bluetooth Low Energy (BLE) and NFC technology, allowing you to transact even when you don\'t have internet access.'
    },
    {
      question: 'How do I withdraw money from my PeThar Wallet?',
      answer: 'You can withdraw funds through authorized PeThar agents or by transferring to a connected bank account. Withdrawals are typically processed within 1-2 business hours.'
    }
  ];

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
              {t.ctaSearch}
            </button>
            <button
              className="border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-300 text-gray-700 dark:text-gray-300 py-3 px-8 rounded-lg transition-transform hover:scale-105"
            >
              {t.ctaContact}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'PeThar Help Center ��� FAQ' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'PeThar Help Center ��� categories' : 'Help Categories'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2.07L18 5a2 2 0 00-1.41-.59L12 1l-1.41.59A2 2 0 0010 5l-2 12a2 2 0 00-.59 1.41z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Getting Started</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Account setup, verification, and basic usage guides
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .891-3 2s1.343 2 3 2 3-.891 3-2-1.343-2-3-2zm0-2.5c1.378 0 2.5 1.122 2.5 2.5S15.878 13 12 13s-2.5-1.122-2.5-2.5S10.622 8 12 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Transactions</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sending, receiving, and managing your payments
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Security</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Keeping your funds and personal information safe
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0L13.732 7.868l7.746 7.746c.3.921-.3 1.902-1.244 1.902H4.244c-.944 0-1.544-.98-1.244-1.902L3.303 7.868l7.746-7.746z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Business</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Using PeThar for your business and merchant needs
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
          {lang === 'ak' ? 'ဒီဇһာနလာကြိမ် ပါဝင်ပါ' : 'Still Need Help?'}
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          {lang === 'ak'
            ? 'PeThar Help Center ��� Dawlonлодх KYC စာဝ pliوفةမဲ့ နomyind တльнуюponde လzii'
            : 'Our support team is available 24/7 to help you with any questions or issues'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            className="bg-white hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold py-3 px-8 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 12m-8 4v-8" />
            </svg>
            Live Chat Support
          </button>
          <button
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            Browse All Help Articles
          </button>
        </div>
      </section>
    </BaseLayout>
  );
};