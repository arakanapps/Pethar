import { BaseLayout } from './BaseLayout';
import type { Language } from '../i18n';

interface AdminPageProps {
  lang: Language;
}

export const AdminPage = ({ lang }: AdminPageProps) => {
  const t = lang === 'ak'
    ? {
        heroTitle: 'PeThar Admin - Banking Administration Portal',
        heroSubtitle: 'Secure administration and management tools for financial institutions',
        feature1Title: 'User Management',
        feature1Desc: 'Manage customer accounts, permissions, and access controls',
        feature2Title: 'Transaction Monitoring',
        feature2Desc: 'Real-time monitoring, audit trails, and suspicious activity detection',
        feature3Title: 'Compliance & Reporting',
        feature3Desc: 'Automated KYC/AML compliance, regulatory reporting, and audit tools',
        feature4Title: 'System Configuration',
        feature4Desc: 'Configure banking parameters, fees, limits, and service settings',
        ctaLearnMore: 'Admin Portal Features',
        ctaGetStarted: 'Request Admin Access',
      }
    : {
        heroTitle: 'PeThar Admin - Banking Administration Portal',
        heroSubtitle: 'Secure administration and management tools for financial institutions',
        feature1Title: 'User Management',
        feature1Desc: 'Manage customer accounts, permissions, and access controls',
        feature2Title: 'Transaction Monitoring',
        feature2Desc: 'Real-time monitoring, audit trails, and suspicious activity detection',
        feature3Title: 'Compliance & Reporting',
        feature3Desc: 'Automated KYC/AML compliance, regulatory reporting, and audit tools',
        feature4Title: 'System Configuration',
        feature4Desc: 'Configure banking parameters, fees, limits, and service settings',
        ctaLearnMore: 'Admin Portal Features',
        ctaGetStarted: 'Request Admin Access',
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
            {lang === 'ak' ? 'PeThar Admin ��� how it works' : 'How PeThar Admin Works'}
          </h2>
          <p className="text-center text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            {lang === 'ak'
              ? 'PeThar Admin ��� how it works Dawlonлодх'
              : 'Secure administration portal for managing financial services and compliance'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">1. Secure Access</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Role-based access control with multi-factor authentication and audit logging
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mb-4 bg-red-50 dark:bg-red-900/20 rounded-flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .891-3 2s1.343 2 3 2 3-.891 3-2-1.343-2-3-2zm0-2.5c1.378 0 2.5 1.122 2.5 2.5S15.878 13 12 13s-2.5-1.122-2.5-2.5S10.622 8 12 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">2. Comprehensive Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time overview of system health, transaction volumes, and key metrics
              </p