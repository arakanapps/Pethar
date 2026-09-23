import { useState } from 'react'
import { colors, initialUserProfile, type UserProfile } from './data'
import {
  Home, Send, Receive, Scan, CashOut, AccountScreen, ServicesScreen, SettingsScreen, NotificationsScreen, type Screen
} from './screens'
import { InternationalBanking } from './components/InternationalBanking'
import { CryptoGateway } from './components/CryptoGateway'
import { POSTerminal } from './components/POSTerminal'
import { LegalDocsModal } from './components/LegalDocsModal'
import { WebPortal } from './components/WebPortal'
import { ArakanEmblem, FlagArakan, FlagInternational } from './components/ArakanEmblem'
import { type Language, translations } from './i18n'
import {
  Wifi, Battery, Signal, Monitor, Terminal,
  FileText, QrCode, Sun, Moon,
  CreditCard, LayoutGrid, Settings as SettingsIcon, Home as HomeIcon
} from 'lucide-react'

type PlatformView = 'mobile' | 'web' | 'pos'

export default function App() {
  const [platform, setPlatform] = useState<PlatformView>('mobile')
  const [screen, setScreen] = useState<Screen>('home')
  const [lang, setLang] = useState<Language>('arak') // Default to Arakanese per prompt!
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [profile, setProfile] = useState<UserProfile>(initialUserProfile)
  const [legalModalOpen, setLegalModalOpen] = useState(false)
  const [legalDocType, setLegalDocType] = useState<'terms' | 'privacy' | 'guidelines' | 'fx'>('terms')

  const t = translations[lang]

  const openLegal = (doc: 'terms' | 'privacy' | 'guidelines' | 'fx') => {
    setLegalDocType(doc)
    setLegalModalOpen(true)
  }

  const handleMobileNav = (s: Screen) => {
    setScreen(s)
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #1A2230 0%, #0A0E17 80%)',
        color: '#FFFFFF',
      }}
    >
      {/* ── GLOBAL TOP COMMAND BAR ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-[#283852] bg-[#090D14]/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <ArakanEmblem size={36} variant="badge" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-white">
                {t.appName}
              </span>
              <span className="text-xs text-amber-400 font-semibold font-mono">
                {t.currencyUnit} (₳)
              </span>
              <span className="hidden sm:inline-block rounded-full bg-red-600/30 px-2 py-0.5 text-[9px] font-bold text-red-300 border border-red-500/40">
                ARAKAN SOVEREIGN
              </span>
            </div>
            <div className="text-[10px] text-gray-400 hidden sm:block">
              {t.appSubtitle}
            </div>
          </div>
        </div>

        {/* Platform Viewport Switcher */}
        <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setPlatform('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              platform === 'mobile'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Mobile Wallet (Android/iOS)"
          >
            <HomeIcon size={14} />
            <span className="hidden md:inline">Mobile (iOS/Android)</span>
          </button>

          <button
            onClick={() => setPlatform('web')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              platform === 'web'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Desktop Web Banking Portal"
          >
            <Monitor size={14} />
            <span className="hidden md:inline">Web Portal</span>
          </button>

          <button
            onClick={() => setPlatform('pos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              platform === 'pos'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Merchant Point-of-Sale Register"
          >
            <Terminal size={14} />
            <span className="hidden md:inline">Merchant POS</span>
          </button>
        </div>

        {/* Language & Tools Right Actions */}
        <div className="flex items-center gap-2">
          {/* Bilingual Language Switcher with Flags */}
          <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setLang('arak')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                lang === 'arak'
                  ? 'bg-red-700 text-white shadow-sm border border-red-500/50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="ရခိုင်ဘာသာ (Arakanese Language)"
            >
              <FlagArakan size={15} />
              <span className="text-[11px]">ရခိုင်</span>
            </button>

            <button
              onClick={() => setLang('en')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                lang === 'en'
                  ? 'bg-blue-800 text-white shadow-sm border border-blue-500/50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="English (International)"
            >
              <FlagInternational size={15} />
              <span className="text-[11px]">English</span>
            </button>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-amber-400" />
            ) : (
              <Moon size={16} className="text-indigo-400" />
            )}
          </button>

          {/* Legal Docs Trigger */}
          <button
            onClick={() => openLegal('terms')}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition"
            title="Legal & Compliance Policies"
          >
            <FileText size={16} />
          </button>
        </div>
      </header>

      {/* ── PLATFORM VIEWPORTS ────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4">
        {/* VIEWPORT 1: MOBILE CLIENT SIMULATOR (iOS / Android) */}
        {platform === 'mobile' && (
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative overflow-hidden rounded-[44px] shadow-2xl transition-all duration-300"
              style={{
                width: 385,
                height: 750,
                border: theme === 'light' ? '10px solid #D1D5DB' : '10px solid #0B0F14',
                background: theme === 'light' ? '#F4F5F8' : colors.obsidian,
                boxShadow:
                  '0 30px 90px rgba(0,0,0,0.8), 0 0 0 2px #283852, 0 0 40px rgba(217,22,36,0.15)',
              }}
            >
              {/* Dynamic Island / Status Bar */}
              <div className={`flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold relative z-30 transition-colors ${
                theme === 'light' ? 'text-gray-800 bg-white/95' : 'text-white bg-[#090D14]/90'
              }`}>
                <span className="font-mono">15:55</span>
                <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black flex items-center justify-end px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Signal size={12} />
                  <Wifi size={12} />
                  <Battery size={14} />
                </div>
              </div>

              {/* Mobile Screen Router */}
              <div className="h-[calc(100%-88px)] overflow-hidden">
                {screen === 'home' && (
                  <Home go={handleMobileNav} lang={lang} profile={profile} />
                )}
                {screen === 'account' && (
                  <AccountScreen go={handleMobileNav} lang={lang} />
                )}
                {screen === 'services' && (
                  <ServicesScreen go={handleMobileNav} lang={lang} />
                )}
                {screen === 'settings' && (
                  <SettingsScreen
                    go={handleMobileNav}
                    lang={lang}
                    setLang={setLang}
                    theme={theme}
                    setTheme={setTheme}
                    profile={profile}
                    setProfile={setProfile}
                    onOpenLegal={openLegal}
                  />
                )}
                {screen === 'send' && (
                  <Send go={handleMobileNav} lang={lang} />
                )}
                {screen === 'receive' && (
                  <Receive go={handleMobileNav} lang={lang} />
                )}
                {screen === 'scan' && (
                  <Scan go={handleMobileNav} lang={lang} />
                )}
                {screen === 'cashout' && (
                  <CashOut go={handleMobileNav} lang={lang} />
                )}
                {screen === 'intl' && (
                  <InternationalBanking lang={lang} />
                )}
                {screen === 'crypto' && (
                  <CryptoGateway lang={lang} />
                )}
                {screen === 'pos' && (
                  <POSTerminal lang={lang} />
                )}
                {screen === 'notifications' && (
                  <NotificationsScreen go={handleMobileNav} lang={lang} />
                )}
              </div>

              {/* Bottom Navigation Dock (Krungthai NEXT style: Home, Account, Scan, Services, Settings) */}
              <nav className={`h-[54px] border-t px-2 flex items-center justify-around text-[10px] transition-colors ${
                theme === 'light'
                  ? 'bg-white border-gray-200 text-gray-500'
                  : 'bg-[#090D14] border-white/10 text-gray-400'
              }`}>
                {/* 1. Home */}
                <button
                  onClick={() => setScreen('home')}
                  className={`flex flex-col items-center gap-0.5 transition ${
                    screen === 'home' ? 'text-amber-400 font-bold' : 'hover:text-white'
                  }`}
                >
                  <HomeIcon size={18} />
                  <span>{t.navHome}</span>
                </button>

                {/* 2. Account */}
                <button
                  onClick={() => setScreen('account')}
                  className={`flex flex-col items-center gap-0.5 transition ${
                    screen === 'account' ? 'text-amber-400 font-bold' : 'hover:text-white'
                  }`}
                >
                  <CreditCard size={18} />
                  <span>{t.navAccount}</span>
                </button>

                {/* 3. Scan (Center Elevated Button) */}
                <button
                  onClick={() => setScreen('scan')}
                  className="flex flex-col items-center -mt-5"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-950/50 flex items-center justify-center text-white border-4 border-[#0B0F14] transition transform active:scale-95">
                    <QrCode size={20} />
                  </div>
                  <span className="text-[9px] mt-0.5 font-bold text-gray-200">{t.navScan}</span>
                </button>

                {/* 4. Services */}
                <button
                  onClick={() => setScreen('services')}
                  className={`flex flex-col items-center gap-0.5 transition ${
                    screen === 'services' ? 'text-amber-400 font-bold' : 'hover:text-white'
                  }`}
                >
                  <LayoutGrid size={18} />
                  <span>{t.navServices}</span>
                </button>

                {/* 5. Settings */}
                <button
                  onClick={() => setScreen('settings')}
                  className={`flex flex-col items-center gap-0.5 transition ${
                    screen === 'settings' ? 'text-amber-400 font-bold' : 'hover:text-white'
                  }`}
                >
                  <SettingsIcon size={18} />
                  <span>{t.navSettings}</span>
                </button>
              </nav>
            </div>

            <div className="text-center text-xs text-gray-400">
              <span className="font-semibold text-white">PeThar (ဖေ့သာ)</span> · Sovereign Arakan Wallet (AKD)
            </div>
          </div>
        )}

        {/* VIEWPORT 2: DESKTOP WEB BANKING PORTAL */}
        {platform === 'web' && (
          <div className="w-full max-w-7xl h-[85vh] rounded-3xl overflow-hidden border border-[#283852] shadow-2xl flex flex-col">
            <WebPortal
              lang={lang}
              onOpenModule={(mod) => {
                setScreen(mod)
                setPlatform('mobile')
              }}
              onOpenLegal={openLegal}
            />
          </div>
        )}

        {/* VIEWPORT 3: MERCHANT POS TERMINAL */}
        {platform === 'pos' && (
          <div className="w-full max-w-2xl h-[85vh] rounded-3xl overflow-hidden border border-[#283852] shadow-2xl bg-[#090D14] flex flex-col">
            <POSTerminal lang={lang} />
          </div>
        )}
      </main>

      {/* ── LEGAL & POLICIES MODAL ─────────────────────────────────────── */}
      {legalModalOpen && (
        <LegalDocsModal
          lang={lang}
          initialDoc={legalDocType}
          onClose={() => setLegalModalOpen(false)}
        />
      )}
    </div>
  )
}
