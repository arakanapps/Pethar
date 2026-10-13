import { useEffect } from 'react';
import { ArakanEmblem, FlagArakanCircle, FlagUKCircle } from '../../components/ArakanEmblem';
import type { Language } from '../../i18n';
import { redirectToSubdomain } from '../../utils/subdomain';

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
  useEffect(() => {
    if (typeof document !== 'undefined' && title) {
      document.title = `${title} | PeThar`;
    }
  }, [title]);

  const handleSetLang = (newLang: Language) => {
    localStorage.setItem('pethar_lang', newLang);
    setLang?.(newLang);
    // Reload or trigger url change if needed
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.pathname.startsWith('/en')) {
        url.pathname = url.pathname.replace(/^\/en/, `/${newLang}`);
      } else if (url.pathname.startsWith('/ak')) {
        url.pathname = url.pathname.replace(/^\/ak/, `/${newLang}`);
      }
      window.location.href = url.toString();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCFF] text-slate-900 font-sans">
      {showHeader && (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center gap-4">
              {/* Brand Logo & Title */}
              <div 
                onClick={() => redirectToSubdomain('')}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <ArakanEmblem size={34} variant="badge" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-tight text-slate-950">
                      PeThar
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/20">
                      ဖေ့သာ
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">
                    {lang === 'ak' ? 'အာရက္ခဒေါ်လာ ဘဏ္ဍာရေးကွန်ရက်' : 'Arakan Financial Network'}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-bold text-slate-600">
                <button
                  onClick={() => redirectToSubdomain('')}
                  className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  {lang === 'ak' ? 'ပင်မ / အကြောင်း' : 'About / Home'}
                </button>
                <button
                  onClick={() => redirectToSubdomain('wallet')}
                  className="px-3 py-1.5 rounded-lg hover:bg-amber-500/10 text-amber-700 transition"
                >
                  {lang === 'ak' ? 'ပိုက်ဆံအိတ် (Wallet)' : 'Wallet'}
                </button>
                <button
                  onClick={() => redirectToSubdomain('app')}
                  className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  {lang === 'ak' ? 'သုံးစွဲသူ အက်ပ် (App)' : 'Customer App'}
                </button>
                <button
                  onClick={() => redirectToSubdomain('platform')}
                  className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  {lang === 'ak' ? 'ကုမ္ပဏီ ပလက်ဖောင်း' : 'Platform (Internal)'}
                </button>
              </nav>

              {/* Actions & Switchers */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => redirectToSubdomain('login')}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition"
                >
                  {lang === 'ak' ? 'အကောင့်ဝင်ရန်' : 'Log In'}
                </button>
                <button
                  onClick={() => redirectToSubdomain('signup')}
                  className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition"
                >
                  {lang === 'ak' ? 'အကောင့်ဖွင့်ရန်' : 'Sign Up'}
                </button>

                {/* Language Switcher */}
                <button
                  onClick={() => handleSetLang(lang === 'ak' ? 'en' : 'ak')}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                  aria-label={lang === 'ak' ? 'Switch to English' : 'Switch to Arakanese'}
                  title={lang === 'ak' ? 'Switch to English' : 'Switch to Arakanese'}
                >
                  {lang === 'ak' ? <FlagUKCircle size={18} /> : <FlagArakanCircle size={18} />}
                  <span>{lang === 'ak' ? 'EN' : 'ရခိုင်'}</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {showFooter && (
        <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-slate-600">
              <div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm">
                  {lang === 'ak' ? 'ဖေ့သာ ကွန်ရက်' : 'PeThar Network'}
                </h3>
                <ul className="space-y-2">
                  <li><button onClick={() => redirectToSubdomain('')} className="hover:text-amber-600 transition">{lang === 'ak' ? 'ဖေ့သာ အကြောင်း သိကောင်းစရာ' : 'About PeThar'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('wallet')} className="hover:text-amber-600 transition">{lang === 'ak' ? 'ဒစ်ဂျစ်တယ် ပိုက်ဆံအိတ်' : 'PeThar Wallet'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('app')} className="hover:text-amber-600 transition">{lang === 'ak' ? 'သုံးစွဲသူ အက်ပ်' : 'Customer App'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('platform')} className="hover:text-amber-600 transition">{lang === 'ak' ? 'ကုမ္ပဏီတွင်း ပလက်ဖောင်း' : 'Internal Platform'}</button></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm">
                  {lang === 'ak' ? 'ဝန်ဆောင်မှုများ' : 'Services'}
                </h3>
                <ul className="space-y-2">
                  <li><button onClick={() => redirectToSubdomain('pay')} className="hover:text-amber-600 transition">{lang === 'ak' ? 'Arakan QR ငွေပေးချေမှု' : 'Arakan QR Payments'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('card')} className="hover:text-amber-600 transition">{lang === 'ak' ? 'ဒစ်ဂျစ်တယ် ဒက်ဘစ်ကတ်' : 'Digital Debit Card'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('merchant')} className="hover:text-amber-600 transition">{lang === 'ak' ? 'ကုန်သည် POS စနစ်' : 'Merchant POS'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('exchange')} className="hover:text-amber-600 transition">{lang === 'ak' ? 'ဒင်္ဂါး လဲလှယ်ရေး' : 'Crypto Exchange'}</button></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm">
                  {lang === 'ak' ? 'လုံခြုံရေးနှင့် စည်းမျဉ်း' : 'Security & Reserves'}
                </h3>
                <ul className="space-y-2">
                  <li><button onClick={() => redirectToSubdomain('docs')} className="hover:text-amber-600 transition">{lang === 'ak' ? 'နည်းပညာ စာရွက်စာတမ်း' : 'Documentation'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('support')} className="hover:text-amber-600 transition">{lang === 'ak' ? 'လုံခြုံရေး မူဝါဒ' : 'Proof of Reserves'}</button></li>
                  <li><span className="text-emerald-600 font-semibold">{lang === 'ak' ? '၁၀၀% ရွှေ/ဒေါ်လာ အာမခံ' : '100% Backed by Reserves'}</span></li>
                  <li><span>{lang === 'ak' ? 'လိုင်စင်ရ ငွေကြေးအဖွဲ့အစည်း' : 'Regulated Financial Authority'}</span></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm">
                  {lang === 'ak' ? 'အကူအညီနှင့် ဆက်သွယ်ရန်' : 'Support & Contact'}
                </h3>
                <ul className="space-y-2">
                  <li><button onClick={() => redirectToSubdomain('help')} className="hover:text-amber-600 transition">{lang === 'ak' ? 'မေးလေ့ရှိသော မေးခွန်းများ' : 'Help & FAQ'}</button></li>
                  <li><a href="https://t.me/petharsupport" target="_blank" rel="noreferrer" className="hover:text-amber-600 transition">Telegram: @petharsupport</a></li>
                  <li><a href="mailto:pethar-app@protonmail.com" className="hover:text-amber-600 transition">Email: pethar-app@protonmail.com</a></li>
                  <li><span>Main Domain: pethar.co.uk</span></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
              © 2026 PeThar (ဖေ့သာ) · Arakan National Financial Infrastructure · pethar.co.uk
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};