import { useState } from 'react';
import { ArakanEmblem, FlagArakanCircle, FlagUKCircle } from '../../components/ArakanEmblem';
import type { Language } from '../../i18n';

interface BaseLayoutProps {
  children: React.ReactNode;
  title: string;
  lang?: Language;
  setLang?: (lang: Language) => void;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const BaseLayout = ({
  children,
  title,
  lang = 'ak',
  setLang,
  showHeader = true,
  showFooter = true,
}: BaseLayoutProps) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  const handleSetLang = (newLang: Language) => {
    localStorage.setItem('pethar_lang', newLang);
    setLang?.(newLang);
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:bg-gray-900 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      {showHeader && (
        <header className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-3">
                <ArakanEmblem size={32} variant="badge" />
                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {title}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PeThar Financial Infrastructure
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Language Switcher */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSetLang(lang === 'ak' ? 'en' : 'ak')}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    aria-label={lang === 'ak' ? 'Switch to English' : 'Switch to Arakanese'}
                  >
                    {lang === 'ak' ? <FlagUKCircle size={24} /> : <FlagArakanCircle size={24} />}
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {lang === 'ak' ? 'AK' : 'EN'}
                  </span>
                </div>

                {/* Theme Switcher */}
                <button
                  onClick={handleToggleTheme}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646l1.293 1.293A9 9 0 0012 21a9 9 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {children}
        </div>
      </main>

      {showFooter && (
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">PeThar Network</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">About PeThar</a></li>
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Careers</a></li>
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Press</a></li>
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Blog</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Products</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">PeThar Wallet</a></li>
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">PeThar Business</a></li>
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">PeThar Agent</a></li>
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">PeThar Exchange</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Documentation</a></li>
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Security</a></li>
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Fees</a></li>
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Limits</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Help Center</a></li>
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Contact Us</a></li>
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Telegram: @petharsupport</a></li>
                  <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Email: pethar-app@protonmail.com</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
              © 2026 PeThar (ဖေ့သာ). All rights reserved.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};