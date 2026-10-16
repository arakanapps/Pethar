import { useState, useEffect } from 'react';
import { ArakanEmblem, FlagArakanCircle, FlagUKCircle } from '../../components/ArakanEmblem';
import type { Language } from '../../i18n';
import { redirectToSubdomain, getSubdomain } from '../../utils/subdomain';
import {
  ShieldCheck, LayoutDashboard, Wallet, Smartphone, Building2,
  Lock, ArrowRight, Menu, X, ChevronDown, CheckCircle2,
  Server, Globe, CreditCard, QrCode, FileText
} from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subdomainSwitcherOpen, setSubdomainSwitcherOpen] = useState(false);
  const currentSubdomain = getSubdomain();

  useEffect(() => {
    if (typeof document !== 'undefined' && title) {
      document.title = `${title} | Péthar (ဖေ့သာ)`;
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

  const portalCategories = [
    {
      category: lang === 'ak' ? 'သုံးစွဲသူနှင့် ဝဘ်အက်ပ်' : 'Consumer & Wallet',
      items: [
        { id: '', label: lang === 'ak' ? 'ပင်မစာမျက်နှာ' : 'Official Portal', icon: Globe },
        { id: 'wallet', label: lang === 'ak' ? 'ဖေ့သာ ဝဘ်ဘဏ်' : 'Web Banking', icon: Wallet },
        { id: 'app', label: lang === 'ak' ? 'သုံးစွဲသူ အက်ပ်' : 'Customer Portal', icon: Smartphone },
        { id: 'pay', label: lang === 'ak' ? 'Arakan QR ငွေပေးချေမှု' : 'Arakan QR Pay', icon: QrCode },
        { id: 'card', label: lang === 'ak' ? 'ဒစ်ဂျစ်တယ်ကတ်' : 'Virtual Cards', icon: CreditCard },
      ]
    },
    {
      category: lang === 'ak' ? 'ကုမ္ပဏီတွင်းနှင့် စီမံခန့်ခွဲမှု' : 'Internal & Operations',
      items: [
        { id: 'platform', label: lang === 'ak' ? 'ဗဟိုဘဏ် ပလက်ဖောင်း' : 'Central Platform', icon: Building2 },
        { id: 'admin', label: lang === 'ak' ? 'အုပ်ချုပ်သူ အင်တာဖေ့စ်' : 'Admin Operations', icon: Server },
        { id: 'merchant', label: lang === 'ak' ? 'ကုန်သည် POS စနစ်' : 'Merchant Terminal', icon: LayoutDashboard },
        { id: 'offline', label: lang === 'ak' ? 'BLE အော့ဖ်လိုင်းစနစ်' : 'Offline Protocol', icon: ShieldCheck },
      ]
    },
    {
      category: lang === 'ak' ? 'နည်းပညာနှင့် လုံခြုံရေး' : 'Developers & Compliance',
      items: [
        { id: 'developer', label: lang === 'ak' ? 'ဆော့ဖ်ဝဲရေးသားသူများ' : 'Developer Hub', icon: FileText },
        { id: 'api', label: lang === 'ak' ? 'API စာရွက်စာတမ်း' : 'REST & RPC API', icon: Server },
        { id: 'privacy', label: lang === 'ak' ? 'လုံခြုံရေးနှင့် မူဝါဒ' : 'Privacy & Security', icon: Lock },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans relative overflow-x-hidden selection:bg-amber-500/20 selection:text-slate-900 flex flex-col">
      
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] left-[25%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-amber-200/25 via-red-100/20 to-transparent blur-[140px]" />
        <div className="absolute top-[35%] right-[-5%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-blue-200/25 via-emerald-100/20 to-transparent blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
      </div>

      {showHeader && (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-200/80 shadow-xs transition-all">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-[70px] items-center gap-4">
              
              {/* Brand Logo & Portal Selector */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div 
                  onClick={() => redirectToSubdomain('')}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-sm group-hover:scale-110 transition-transform" />
                    <ArakanEmblem size={36} variant="badge" className="relative drop-shadow-xs" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black tracking-tight text-slate-950 font-sans">
                        Péthar
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200/60 uppercase">
                        {currentSubdomain ? currentSubdomain : 'PAY'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans hidden sm:block -mt-0.5">
                      {lang === 'ak' ? 'အာရက္ခဒစ်ဂျစ်တယ် ဘဏ္ဍာရေးကွန်ရက်' : 'Arakan Unified Digital Payment System'}
                    </p>
                  </div>
                </div>

                {/* Subdomain Switcher Dropdown */}
                <div className="relative hidden xl:block">
                  <button
                    onClick={() => setSubdomainSwitcherOpen(!subdomainSwitcherOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-all"
                  >
                    <span className="text-slate-400 font-mono">Portals:</span>
                    <span className="capitalize font-bold text-slate-900">{currentSubdomain || 'Home'}</span>
                    <ChevronDown size={14} className={`text-slate-500 transition-transform ${subdomainSwitcherOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {subdomainSwitcherOpen && (
                    <div 
                      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-1"
                      onMouseLeave={() => setSubdomainSwitcherOpen(false)}
                    >
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 pb-1.5 border-b border-slate-100">
                        {lang === 'ak' ? 'စနစ် ကွန်ရက်ခွဲများ' : 'Subdomain Portals'}
                      </div>
                      <div className="space-y-3 pt-2 max-h-80 overflow-y-auto">
                        {portalCategories.map((group, idx) => (
                          <div key={idx}>
                            <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5">{group.category}</div>
                            <div className="grid grid-cols-1 gap-0.5 mt-0.5">
                              {group.items.map((item) => {
                                const Icon = item.icon;
                                const isCurrent = currentSubdomain === item.id;
                                return (
                                  <button
                                    key={item.id}
                                    onClick={() => {
                                      setSubdomainSwitcherOpen(false);
                                      redirectToSubdomain(item.id);
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                      isCurrent 
                                        ? 'bg-amber-50 text-amber-900 font-bold' 
                                        : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Icon size={14} className={isCurrent ? 'text-amber-600' : 'text-slate-400'} />
                                      <span>{item.label}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">/{item.id}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Central Nav Links */}
              <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-600">
                <button
                  onClick={() => redirectToSubdomain('')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    !currentSubdomain ? 'bg-slate-100 text-slate-950 font-bold' : 'hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {lang === 'ak' ? 'ခြုံငုံသုံးသပ်ချက်' : 'Overview'}
                </button>
                <button
                  onClick={() => redirectToSubdomain('wallet')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    currentSubdomain === 'wallet' ? 'bg-slate-100 text-slate-950 font-bold' : 'hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {lang === 'ak' ? 'ဝဘ်ဘဏ်' : 'Web Banking'}
                </button>
                <button
                  onClick={() => redirectToSubdomain('app')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    currentSubdomain === 'app' ? 'bg-slate-100 text-slate-950 font-bold' : 'hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {lang === 'ak' ? 'သုံးစွဲသူ အက်ပ်' : 'Customer Portal'}
                </button>
                <button
                  onClick={() => redirectToSubdomain('platform')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    currentSubdomain === 'platform' ? 'bg-slate-100 text-slate-950 font-bold' : 'hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {lang === 'ak' ? 'ကုမ္ပဏီ ပလက်ဖောင်း' : 'Internal Platform'}
                </button>
                <button
                  onClick={() => redirectToSubdomain('developer')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    currentSubdomain === 'developer' || currentSubdomain === 'api' ? 'bg-slate-100 text-slate-950 font-bold' : 'hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {lang === 'ak' ? 'နည်းပညာ' : 'Developer & API'}
                </button>
              </nav>

              {/* Status Pill & Action Buttons */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Active Ledger Status Badge */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-mono font-bold text-emerald-800 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ledger Online</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-amber-800 font-bold">1:1 USDT</span>
                </div>

                {/* Single Circular Flag Language Selector */}
                <button
                  type="button"
                  onClick={() => handleSetLang(lang === 'ak' ? 'en' : 'ak')}
                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden hover:opacity-85 active:opacity-75 transition-opacity shadow-xs border border-slate-200 select-none cursor-pointer shrink-0"
                  title={lang === 'ak' ? 'Switch to English (/en)' : 'ရခိုင်ဘာသာသို့ ပြောင်းမည် (/ak)'}
                  aria-label={lang === 'ak' ? 'Switch to English' : 'Switch to Arakanese'}
                >
                  {lang === 'ak' ? <FlagArakanCircle size={32} /> : <FlagUKCircle size={32} />}
                </button>

                {/* Login Button */}
                <button
                  onClick={() => redirectToSubdomain('login')}
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-all"
                >
                  {lang === 'ak' ? 'အကောင့်ဝင်ရန်' : 'Log In'}
                </button>

                {/* Primary CTA */}
                <button
                  onClick={() => redirectToSubdomain('wallet')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs shadow-amber-400/20 hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 font-mono"
                >
                  <span>{lang === 'ak' ? 'ဝဘ်ဘဏ် သုံးရန်' : 'Open Banking'}</span>
                  <ArrowRight size={13} />
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  aria-label="Toggle Navigation"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>

            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 px-4 py-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 font-mono uppercase">
                  {lang === 'ak' ? 'အဓိက စနစ်များ' : 'Navigation'}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ledger Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); redirectToSubdomain(''); }}
                  className="p-2.5 rounded-xl bg-slate-50 text-left text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  {lang === 'ak' ? 'ပင်မစာမျက်နှာ' : 'Home'}
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); redirectToSubdomain('wallet'); }}
                  className="p-2.5 rounded-xl bg-amber-50 text-left text-xs font-bold text-amber-950 hover:bg-amber-100"
                >
                  {lang === 'ak' ? 'ဖေ့သာ ဝဘ်ဘဏ်' : 'Web Banking'}
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); redirectToSubdomain('app'); }}
                  className="p-2.5 rounded-xl bg-slate-50 text-left text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  {lang === 'ak' ? 'သုံးစွဲသူ အက်ပ်' : 'Customer Portal'}
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); redirectToSubdomain('platform'); }}
                  className="p-2.5 rounded-xl bg-slate-50 text-left text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  {lang === 'ak' ? 'ကုမ္ပဏီ ပလက်ဖောင်း' : 'Internal Platform'}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); redirectToSubdomain('login'); }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-800 text-center"
                >
                  {lang === 'ak' ? 'အကောင့်ဝင်ရန်' : 'Log In'}
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); redirectToSubdomain('signup'); }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 text-xs font-bold text-slate-950 text-center font-mono"
                >
                  {lang === 'ak' ? 'အကောင့်ဖွင့်ရန်' : 'Get Started'}
                </button>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 py-8 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Modern Institutional Footer */}
      {showFooter && (
        <footer className="border-t border-slate-200/90 bg-white/80 backdrop-blur-xl relative z-10 text-xs text-slate-600 mt-auto">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
              
              {/* Brand Summary */}
              <div className="col-span-2 space-y-3">
                <div className="flex items-center gap-2.5">
                  <ArakanEmblem size={30} variant="badge" />
                  <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                    Péthar (ဖေ့သာ)
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  {lang === 'ak'
                    ? 'အာရက္ခဒေသတွင်း ဘဏ္ဍာရေးလွတ်လပ်ခွင့်၊ စက္ကန့်ပိုင်းအတွင်း ချက်ချင်းငွေလွှဲမှု၊ Arakan QR (AK QR) ကုန်သည်ငွေပေးချေမှုနှင့် ၁:၁ USDT တည်ငြိမ်ငွေကြေးစနစ်။'
                    : 'Unified national financial technology infrastructure for Arakan. Real-time settlement rails, offline cryptographic vouchers, and auditable 1:1 USD reserves.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    100% Reserve Backed
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={13} className="text-blue-600" />
                    AES-256 SQLCipher
                  </span>
                </div>
              </div>

              {/* Col 1: Consumer Services */}
              <div>
                <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider font-mono">
                  {lang === 'ak' ? 'သုံးစွဲသူ ဝန်ဆောင်မှု' : 'Consumer Rails'}
                </h4>
                <ul className="space-y-2">
                  <li><button onClick={() => redirectToSubdomain('')} className="hover:text-amber-700 transition">About Péthar</button></li>
                  <li><button onClick={() => redirectToSubdomain('wallet')} className="hover:text-amber-700 transition">Web Banking</button></li>
                  <li><button onClick={() => redirectToSubdomain('app')} className="hover:text-amber-700 transition">Mobile App Portal</button></li>
                  <li><button onClick={() => redirectToSubdomain('card')} className="hover:text-amber-700 transition">Virtual & Physical Card</button></li>
                  <li><button onClick={() => redirectToSubdomain('pay')} className="hover:text-amber-700 transition">Arakan QR Checkout</button></li>
                </ul>
              </div>

              {/* Col 2: Institutional & Internal */}
              <div>
                <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider font-mono">
                  {lang === 'ak' ? 'ကုမ္ပဏီနှင့် ကုန်သည်' : 'Merchant & Enterprise'}
                </h4>
                <ul className="space-y-2">
                  <li><button onClick={() => redirectToSubdomain('platform')} className="hover:text-amber-700 transition">Internal Platform</button></li>
                  <li><button onClick={() => redirectToSubdomain('admin')} className="hover:text-amber-700 transition">Administration Hub</button></li>
                  <li><button onClick={() => redirectToSubdomain('merchant')} className="hover:text-amber-700 transition">Merchant POS Terminal</button></li>
                  <li><button onClick={() => redirectToSubdomain('offline')} className="hover:text-amber-700 transition">BLE Mesh Protocol</button></li>
                  <li><button onClick={() => redirectToSubdomain('exchange')} className="hover:text-amber-700 transition">Crypto & FX Bridge</button></li>
                </ul>
              </div>

              {/* Col 3: Developers & Contact */}
              <div>
                <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider font-mono">
                  {lang === 'ak' ? 'နည်းပညာနှင့် အကူအညီ' : 'Developer & Support'}
                </h4>
                <ul className="space-y-2">
                  <li><button onClick={() => redirectToSubdomain('developer')} className="hover:text-amber-700 transition">Developer Docs</button></li>
                  <li><button onClick={() => redirectToSubdomain('api')} className="hover:text-amber-700 transition">API Reference</button></li>
                  <li><button onClick={() => redirectToSubdomain('privacy')} className="hover:text-amber-700 transition">Privacy & Security</button></li>
                  <li><a href="https://t.me/petharsupport" target="_blank" rel="noreferrer" className="text-sky-700 font-bold no-underline hover:opacity-80 transition-opacity">Telegram: @petharsupport</a></li>
                  <li><a href="mailto:pethar-app@protonmail.com" className="text-amber-800 font-bold no-underline hover:opacity-80 transition-opacity">Contact: pethar-app@protonmail.com</a></li>
                </ul>
              </div>

            </div>

            <div className="pt-6 border-t border-slate-200/80 flex items-center justify-center text-center text-[11px] font-mono text-slate-500">
              <div>© {new Date().getFullYear()} Péthar (ဖေ့သာ). All rights reserved.</div>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
};
