import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';

interface DocsPageProps {
  lang: Language;
}

export const DocsPage = ({ lang }: DocsPageProps) => {
  const t = lang === 'ak'
    ? {
        heroTitle: 'PeThar Documentation',
        heroSubtitle: 'Comprehensive guides, API references, and tutorials',
        feature1Title: 'Getting Started Guides',
        feature1Desc: 'Step-by-step tutorials for new users and developers',
        feature2Title: 'API Reference',
        feature2Desc: 'Complete documentation of all available endpoints',
        feature3Title: 'SDK Documentation',
        feature3Desc: 'Guides for using our official libraries and frameworks',
        feature4Title: 'Integration Tutorials',
        feature4Desc: 'Learn how to integrate PeThar into your applications',
        ctaGetStarted: 'Start Reading',
        ctaSearch: 'Search Documentation',
      }
    : {
        heroTitle: 'PeThar Documentation',
        heroSubtitle: 'Comprehensive guides, API references, and tutorials',
        feature1Title: 'Getting Started Guides',
        feature1Desc: 'Step-by-step tutorials for new users and developers',
        feature2Title: 'API Reference',
        feature2Desc: 'Complete documentation of all available endpoints',
        feature3Title: 'SDK Documentation',
        feature3Desc: 'Guides for using our official libraries and frameworks',
        feature4Title: 'Integration Tutorials',
        feature4Desc: 'Learn how to integrate PeThar into your applications',
        ctaGetStarted: 'Start Reading',
        ctaSearch: 'Search Documentation',
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
              {t.ctaSearch}
            </button>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'PeThar Documentation ��� sections' : 'Documentation Sections'}
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {t.feature1Title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.feature1Desc}
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {t.feature2Title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.feature2Desc}
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {t.feature3Title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.feature3Desc}
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {t.feature4Title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.feature4Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Guides Section */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'PeThar Documentation ��� popular guides' : 'Popular Guides & Tutorials'}
          </h2>
          <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {lang === 'ak'
              ? 'PeThar Documentation ��� popular guides Dawlonлодх'
              : 'Most viewed documentation and tutorials'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Wallet Setup Guide</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Step-by-step guide to creating and securing your PeThar Wallet
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Developer Quickstart</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Build your first application with PeThar API in 15 minutes
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Merchant Integration</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Accept PeThar payments in your online store or POS system
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Security Best Practices</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Keep your funds and data secure with these essential practices
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">API Reference</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete reference for all PeThar API endpoints and webhooks
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Mobile SDK Guide</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Integrate PeThar Wallet functionality into your mobile apps
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center py-16 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {lang === 'ak' ? 'ဒီဇһာနလာကြိမ် ပါဝင်ပါ' : 'Ready to Learn?'}
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          {lang === 'ak'
            ? 'PeThar Documentation ��� Dawlonлодх KYC စာဝ pliوفةမဲ့ နomyind တльнуюponde လzii'
            : 'Explore our comprehensive documentation to get the most out of PeThar'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            className="bg-white hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold py-3 px-8 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 12m-8 4v-8" />
            </svg>
            Getting Started Guide
          </button>
          <button
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            Browse All Documentation
          </button>
        </div>
      </section>
    </BaseLayout>
  );
};