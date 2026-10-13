import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';

interface CloudPageProps {
  lang: Language;
}

export const CloudPage = ({ lang }: CloudPageProps) => {
  const t = lang === 'ak'
    ? {
        heroTitle: 'PeThar Cloud - Financial Services Infrastructure',
        heroSubtitle: 'Secure, scalable cloud infrastructure for banking and fintech applications',
        feature1Title: 'Banking-Grade Security',
        feature1Desc: 'HIPAA, SOC 2, ISO 27001 compliant infrastructure with end-to-end encryption',
        feature2Title: 'High Availability',
        feature2Desc: '99.99% uptime SLA with multi-region deployment and automatic failover',
        feature3Title: 'Scalable Architecture',
        feature3Desc: 'Auto-scaling containers and serverless functions handle any workload',
        feature4Title: 'Developer Friendly',
        feature4Desc: 'REST APIs, SDKs, and comprehensive documentation for rapid integration',
        ctaLearnMore: 'Cloud Infrastructure Docs',
        ctaGetStarted: 'Request Cloud Access',
      }
    : {
        heroTitle: 'PeThar Cloud - Financial Services Infrastructure',
        heroSubtitle: 'Secure, scalable cloud infrastructure for banking and fintech applications',
        feature1Title: 'Banking-Grade Security',
        feature1Desc: 'HIPAA, SOC 2, ISO 27001 compliant infrastructure with end-to-end encryption',
        feature2Title: 'High Availability',
        feature2Desc: '99.99% uptime SLA with multi-region deployment and automatic failover',
        feature3Title: 'Scalable Architecture',
        feature3Desc: 'Auto-scaling containers and serverless functions handle any workload',
        feature4Title: 'Developer Friendly',
        feature4Desc: 'REST APIs, SDKs, and comprehensive documentation for rapid integration',
        ctaLearnMore: 'Cloud Infrastructure Docs',
        ctaGetStarted: 'Request Cloud Access',
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
            {lang === 'ak' ? 'PeThar Cloud ��� how it works' : 'How PeThar Cloud Works'}
          </h2>
          <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {lang === 'ak'
              ? 'PeThar Cloud ��� how it works Dawlonлодх'
              : 'Secure cloud infrastructure purpose-built for financial services applications'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">1. Secure Foundation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Banking-grade security controls and compliance frameworks built into the infrastructure
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-red-50 dark:bg-red-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .891-3 2s1.343 2 3 2 3-.891 3-2-1.343-2-3-2zm0-2.5c1.378 0 2.5 1.122 2.5 2.5S15.878 13 12 13s-2.5-1.122-2.5-2.5S10.622 8 12 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">2. Reliable Operations</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Multi-region deployment with automatic failover ensures continuous service availability
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-green-50 dark:bg-green-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">3. Instant Scaling</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Resources automatically scale based on demand to handle peak loads and quiet periods
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            {lang === 'ak' ? 'PeThar Cloud ��� 특징' : 'PeThar Cloud Features'}
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
            {lang === 'ak' ? 'PeThar Cloud ��� use cases' : 'Cloud Use Cases'}
          </h2>
          <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {lang === 'ak'
              ? 'PeThar Cloud ��� use cases Dawlonлодх'
              : 'Ideal scenarios for leveraging PeThar Cloud infrastructure'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Digital Banks</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Deploy full-stack banking applications with banking-grade security and compliance
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Focus on product innovation while we handle infrastructure and regulatory requirements
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Payment Processors</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Handle high-volume transaction processing with guaranteed uptime and performance
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Scale to millions of transactions per day with sub-second latency
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Fintech Applications</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Build and launch innovative financial products quickly and securely
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Access banking infrastructure services through simple APIs and SDKs
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">RegTech Solutions</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Deploy compliance and regulatory reporting solutions with built-in audit trails
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Automate KYC/AML processes and regulatory reporting with our compliant infrastructure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center py-16 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {lang === 'ak' ? 'ဒီဇһာနလာကြိမ် ပါဝင်ပါ' : 'Ready to Move to the Cloud?'}
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          {lang === 'ak'
            ? 'PeThar Cloud ��� Dawlonлодх KYC စာဝ pliوفةမဲ့ နomyind တнуюponde လzii'
            : 'Leverage banking-grade cloud infrastructure for your financial services applications'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            className="bg-white hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold py-3 px-8 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 12m-8 4v-8" />
            </svg>
            Request Cloud Access
          </button>
          <button
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            View Cloud Infrastructure Details
          </button>
        </div>
      </section>
    </BaseLayout>
  );
};