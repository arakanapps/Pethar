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
    <div className="min-h-screen bg-gradient-to-b from-[#CFE5FC] via-[#E3F0FD] to-[#F5FAFE] text-slate-900 font-sans relative overflow-x-hidden selection:bg-blue-500/20">
      
      {/* Ambient Cloud Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] left-[20%] w-[600px] h-[600px] rounded-full bg-white/45 blur-[120px]" />
        <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] rounded-full bg-white/35 blur-[120px]" />
      </div>

      {showHeader && (
        <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-white/80 shadow-xs transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-18 items-center gap-4">
              
              {/* Brand Logo & Title (Payno-style clean organic feel) */}
              <div 
                onClick={() => redirectToSubdomain('')}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <ArakanEmblem size={36} variant="badge" className="drop-shadow-xs group-hover:scale-105 transition-transform" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-slate-950 font-sans">
                      pethar
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20">
                      PAY
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500 -mt-0.5">
                    {lang === 'ak' ? 'အာရက္ခဒစ်ဂျစ်တယ် ဘဏ္ဍာရေးကွန်ရက်' : 'Arakan Digital Financial Infrastructure'}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-bold text-slate-600">
                <button
                  onClick={() => redirectToSubdomain('')}
                  className="px-3.5 py-2 rounded-full hover:bg-white/80 hover:text-slate-950 transition-all font-semibold"
                >
                  {lang === 'ak' ? 'ပင်မ / အကြောင်း' : 'Home'}
                </button>
                <button
                  onClick={() => redirectToSubdomain('wallet')}
                  className="px-3.5 py-2 rounded-full hover:bg-white/80 hover:text-slate-950 transition-all font-semibold"
                >
                  {lang === 'ak' ? 'ပိုက်ဆံအိတ်' : 'Wallet'}
                </button>
                <button
                  onClick={() => redirectToSubdomain('app')}
                  className="px-3.5 py-2 rounded-full hover:bg-white/80 hover:text-slate-950 transition-all font-semibold"
                >
                  {lang === 'ak' ? 'သုံးစွဲသူ အက်ပ်' : 'Mobile App'}
                </button>
                <button
                  onClick={() => redirectToSubdomain('platform')}
                  className="px-3.5 py-2 rounded-full hover:bg-white/80 hover:text-slate-950 transition-all font-semibold"
                >
                  {lang === 'ak' ? 'ကုမ္ပဏီ ပလက်ဖောင်း' : 'Platform'}
                </button>
              </nav>

              {/* Actions & Switchers (Payno white pill buttons) */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => redirectToSubdomain('login')}
                  className="text-xs font-bold px-3.5 py-2 rounded-full text-slate-700 hover:bg-white/80 transition-all"
                >
                  {lang === 'ak' ? 'အကောင့်ဝင်ရန်' : 'Log In'}
                </button>
                <button
                  onClick={() => redirectToSubdomain('signup')}
                  className="text-xs font-bold px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-950 shadow-xs border border-white/90 transition-all active:scale-[0.98]"
                >
                  {lang === 'ak' ? 'အကောင့်ဖွင့်ရန်' : 'Get Started'}
                </button>

                {/* Language Switcher */}
                <button
                  type="button"
                  onClick={() => handleSetLang(lang === 'ak' ? 'en' : 'ak')}
                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden hover:opacity-85 transition-opacity shadow-xs border border-white"
                  aria-label={lang === 'ak' ? 'Switch to English' : 'Switch to Arakanese'}
                  title={lang === 'ak' ? 'Switch to English' : 'Switch to Arakanese'}
                >
                  {lang === 'ak' ? <FlagUKCircle size={32} /> : <FlagArakanCircle size={32} />}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {showFooter && (
        <footer className="border-t border-white/80 bg-white/60 backdrop-blur-xl relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-slate-600">
              <div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm font-sans">
                  {lang === 'ak' ? 'ဖေ့သာ ကွန်ရက်' : 'PeThar Network'}
                </h3>
                <ul className="space-y-2">
                  <li><button onClick={() => redirectToSubdomain('')} className="hover:text-blue-600 transition">{lang === 'ak' ? 'ဖေ့သာ အကြောင်း' : 'About PeThar'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('wallet')} className="hover:text-blue-600 transition">{lang === 'ak' ? 'ဒစ်ဂျစ်တယ် ပိုက်ဆံအိတ်' : 'PeThar Wallet'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('app')} className="hover:text-blue-600 transition">{lang === 'ak' ? 'သုံးစွဲသူ အက်ပ်' : 'Customer App'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('platform')} className="hover:text-blue-600 transition">{lang === 'ak' ? 'ကုမ္ပဏီတွင်း ပလက်ဖောင်း' : 'Internal Platform'}</button></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm font-sans">
                  {lang === 'ak' ? 'ဝန်ဆောင်မှုများ' : 'Services'}
                </h3>
                <ul className="space-y-2">
                  <li><button onClick={() => redirectToSubdomain('pay')} className="hover:text-blue-600 transition">{lang === 'ak' ? 'Arakan QR ငွေပေးချေမှု' : 'Arakan QR Payments'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('card')} className="hover:text-blue-600 transition">{lang === 'ak' ? 'ဒစ်ဂျစ်တယ် ဒက်ဘစ်ကတ်' : 'Digital Debit Card'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('merchant')} className="hover:text-blue-600 transition">{lang === 'ak' ? 'ကုန်သည် POS စနစ်' : 'Merchant POS'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('exchange')} className="hover:text-blue-600 transition">{lang === 'ak' ? 'ဒင်္ဂါး လဲလှယ်ရေး' : 'Crypto Exchange'}</button></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm font-sans">
                  {lang === 'ak' ? 'လုံခြုံရေးနှင့် စည်းမျဉ်း' : 'Security & Legal'}
                </h3>
                <ul className="space-y-2">
                  <li><button onClick={() => redirectToSubdomain('privacy')} className="hover:text-blue-600 transition">{lang === 'ak' ? 'ကိုယ်ရေးအချက်အလက် မူဝါဒ' : 'Privacy Policy'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('docs')} className="hover:text-blue-600 transition">{lang === 'ak' ? 'နည်းပညာ စာရွက်စာတမ်း' : 'Documentation'}</button></li>
                  <li><button onClick={() => redirectToSubdomain('support')} className="hover:text-blue-600 transition">{lang === 'ak' ? 'အရန်ငွေကြေး အာမခံ' : 'Proof of Reserves'}</button></li>
                  <li><span className="text-emerald-600 font-semibold">{lang === 'ak' ? '၁၀၀% ရွှေ/ဒေါ်လာ အာမခံ' : '100% Backed by Reserves'}</span></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm font-sans">
                  {lang === 'ak' ? 'အကူအညီနှင့် ဆက်သွယ်ရန်' : 'Support & Contact'}
                </h3>
                <ul className="space-y-2">
                  <li><button onClick={() => redirectToSubdomain('help')} className="hover:text-blue-600 transition">{lang === 'ak' ? 'မေးလေ့ရှိသော မေးခွန်းများ' : 'Help & FAQ'}</button></li>
                  <li><a href="https://t.me/petharsupport" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">Telegram: @petharsupport</a></li>
                  <li><a href="mailto:pethar-app@protonmail.com" className="hover:text-blue-600 transition">Email: pethar-app@protonmail.com</a></li>
                  <li><span>Main Domain: pethar.co.uk</span></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/80 text-center text-xs text-slate-500">
              © 2026 PeThar (ဖေ့သာ) · Arakan National Financial Infrastructure · pethar.co.uk
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
