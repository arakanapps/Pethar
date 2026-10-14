import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';

interface C2CPageProps {
  lang: Language;
}

export const C2CPage = ({ lang }: C2CPageProps) => {
  const t = lang === 'ak'
    ? {
        heroTitle: 'Péthar C2C - Consumer to Consumer Marketplace',
        heroSubtitle: 'Buy and sell goods and services directly with other Péthar users',
        feature1Title: 'Peer-to-Peer Marketplace',
        feature1Desc: 'Buy and sell items, services, and digital goods with trusted users',
        feature2Title: 'Escrow Protection',
        feature2Desc: 'Secure transactions with holding funds until both parties confirm satisfaction',
        feature3Title: 'User Ratings & Reviews',
        feature3Desc: 'Build reputation through verified transactions and community feedback',
        feature4Title: 'Local & Global Reach',
        feature4Desc: 'Connect with buyers and sellers nearby or around the world',
        ctaLearnMore: 'How C2C Works',
        ctaGetStarted: 'Buy or Sell Something',
      }
    : {
        heroTitle: 'Péthar C2C - Consumer to Consumer Marketplace',
        heroSubtitle: 'Buy and sell goods and services directly with other Péthar users',
        feature1Title: 'Peer-to-Peer Marketplace',
        feature1Desc: 'Buy and sell items, services, and digital goods with trusted users',
        feature2Title: 'Escrow Protection',
        feature2Desc: 'Secure transactions with holding funds until both parties confirm satisfaction',
        feature3Title: 'User Ratings & Reviews',
        feature3Desc: 'Build reputation through verified transactions and community feedback',
        feature4Title: 'Local & Global Reach',
        feature4Desc: 'Connect with buyers and sellers nearby or around the world',
        ctaLearnMore: 'How C2C Works',
        ctaGetStarted: 'Buy or Sell Something',
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
            {lang === 'ak' ? 'Péthar C2C အလုပ်လုပ်ဆောင်ပုံ' : 'How Péthar C2C Works'}
          </h2>
          <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {lang === 'ak'
              ? 'အဆင့်ဆင့် အလုပ်လုပ်ဆောင်ပုံနှင့် အသုံးပြုနည်း ရှင်းလင်းချက်'
              : 'Buy and sell safely with other Péthar users in our secure marketplace'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">1. List Item or Browse</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sell something you own or browse items others are selling in your community
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-red-50 dark:bg-red-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .891-3 2s1.343 2 3 2 3-.891 3-2-1.343-2-3-2zm0-2.5c1.378 0 2.5 1.122 2.5 2.5S15.878 13 12 13s-2.5-1.122-2.5-2.5S10.622 8 12 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">2. Agree on Terms</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Negotiate price, arrange pickup/delivery, and agree on transaction terms
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-green-50 dark:bg-green-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">3. Secure Transaction</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Payment held in escrow until both parties confirm the transaction is complete
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'Péthar C2C အင်္ဂါရပ်များနှင့် လုပ်ဆောင်ချက်များ' : 'Péthar C2C Features'}
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
            {lang === 'ak' ? 'C2C အသုံးပြုနိုင်သည့် နယ်ပယ်များ' : 'C2C Use Cases'}
          </h2>
          <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {lang === 'ak'
              ? 'လက်တွေ့နယ်ပယ်အသီးသီးတွင် အကျိုးရှိစွာ အသုံးချနိုင်သည့် နည်းလမ်းများ'
              : 'Ideal scenarios for Consumer-to-Consumer transactions with Péthar'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Secondhand Goods</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Buy and sell used clothing, electronics, furniture, and more
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Extend the life of items and reduce waste in your community
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Handmade Crafts</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sell your handmade crafts, art, and creations to appreciative buyers
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Perfect for artisans, hobbyists, and creative entrepreneurs
              </p>
            </div>
          </div>
        </div>
      </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
              {lang === 'ak' ? 'Péthar C2C ၏ အကျိုးကျေးဇူးများ' : 'Benefits of Péthar C2C'}
            </h2>
            <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
              {lang === 'ak'
                ? 'အသုံးပြုသူများအတွက် အထူးသင့်လျော်သော အကျိုးကျေးဇူးများ'
                : 'Why choose Péthar for your Consumer-to-Consumer transactions'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Secure & Trusted</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Escrow protection and verified user profiles ensure safe transactions
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Low Fees</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Minimal transaction fees compared to traditional marketplaces
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Wide Reach</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect with buyers and sellers across regions and countries
                </p>
              </div>
            </div>
          </div>
        </section>
      </BaseLayout>
    );
  };