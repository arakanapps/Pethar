import { BaseLayout } from './BaseLayout';
import { AuthModal } from '../../components/AuthModal';
import type { Language } from '../../i18n';
import { useState } from 'react';

interface SignupPageProps {
  lang: Language;
}

export const SignupPage = ({ lang }: SignupPageProps) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');

  const t = lang === 'ak'
    ? {
        heroTitle: 'Join PeThar',
        heroSubtitle: 'Create your free PeThar Wallet and start transacting today',
        feature1Title: 'Free to Use',
        feature1Desc: 'No monthly fees, no minimum balance requirements',
        feature2Title: 'Instant Setup',
        feature2Desc: 'Create account and start using in under 5 minutes',
        feature3Title: 'Secure & Private',
        feature3Desc: 'Bank-level security with privacy-first design',
        ctaLogin: 'Already have an account? Log In',
        ctaSignup: 'Sign Up',
      }
    : {
        heroTitle: 'Join PeThar',
        heroSubtitle: 'Create your free PeThar Wallet and start transacting today',
        feature1Title: 'Free to Use',
        feature1Desc: 'No monthly fees, no minimum balance requirements',
        feature2Title: 'Instant Setup',
        feature2Desc: 'Create account and start using in under 5 minutes',
        feature3Title: 'Secure & Private',
        feature3Desc: 'Bank-level security with privacy-first design',
        ctaLogin: 'Already have an account? Log In',
        ctaSignup: 'Sign Up',
      };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <BaseLayout
        title={t.heroTitle}
        lang={lang}
        showHeader={false} // No header for signup page - cleaner look
        showFooter={true}
      >
        {/* Hero Section */}
        <section className="mb-16 min-h-[calc(100vh-200px)] flex items-center">
          <div className="max-w-4xl mx-auto w-full text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t.heroTitle}
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button
                onClick={() => handleOpenAuth('login')}
                className="border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-300 text-gray-700 dark:text-gray-300 py-3 px-8 rounded-lg transition-transform hover:scale-105"
              >
                {t.ctaLogin}
              </button>
              <button
                onClick={() => handleOpenAuth('signup')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105"
              >
                {t.ctaSignup}
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
              {lang === 'ak' ? 'PeThar ��� 특징' : 'Why Join PeThar?'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            </div>
          </div>
        </section>
      </BaseLayout>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          setAuthModalOpen(false);
          // Redirect to banking dashboard after successful signup
          if (typeof window !== 'undefined') {
            window.location.href = '/banking';
          }
        }}
        lang={lang}
      />
    </>
  );
};