import React, { useState } from 'react'
import {
  Home as HomeIcon,
  CreditCard,
  QrCode,
  LayoutGrid,
  Settings as SettingsIcon,
  ArrowLeft,
} from 'lucide-react'
import {
  Home,
  AccountScreen,
  ServicesScreen,
  SettingsScreen,
  Send,
  Receive,
  Scan,
  CashOut,
  NotificationsScreen,
  type Screen,
  type ThemeMode,
} from '../../screens'
import { InternationalBanking } from '../../components/InternationalBanking'
import { CryptoGateway } from '../../components/CryptoGateway'
import { POSTerminal } from '../../components/POSTerminal'
import { initialUserProfile, type UserProfile } from '../../data'
import type { Language } from '../../i18n'

interface MobileWalletPageProps {
  lang: Language
  setLang?: (lang: Language) => void
}

const DOCK_TABS: Screen[] = ['home', 'account', 'scan', 'services', 'settings']

export const MobileWalletPage: React.FC<MobileWalletPageProps> = ({ lang, setLang }) => {
  const [screen, setScreen] = useState<Screen>('home')
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [profile, setProfile] = useState<UserProfile>(initialUserProfile)

  const isLight = theme === 'light'
  const isAk = lang === 'ak'
  const isSubScreen = !DOCK_TABS.includes(screen)

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <Home go={setScreen} lang={lang} profile={profile} theme={theme} />
      case 'account':
        return <AccountScreen go={setScreen} lang={lang} theme={theme} />
      case 'scan':
        return <Scan lang={lang} theme={theme} />
      case 'services':
        return <ServicesScreen go={setScreen} lang={lang} theme={theme} />
      case 'settings':
        return (
          <SettingsScreen
            go={setScreen}
            lang={lang}
            setLang={setLang}
            theme={theme}
            setTheme={setTheme}
            profile={profile}
            setProfile={setProfile}
          />
        )
      case 'send':
        return <Send go={setScreen} lang={lang} theme={theme} />
      case 'receive':
        return <Receive lang={lang} theme={theme} />
      case 'cashout':
        return <CashOut go={setScreen} lang={lang} theme={theme} />
      case 'notifications':
        return <NotificationsScreen lang={lang} theme={theme} />
      case 'intl':
        return <InternationalBanking lang={lang} theme={theme} />
      case 'crypto':
        return <CryptoGateway lang={lang} theme={theme} />
      case 'pos':
        return <POSTerminal lang={lang} theme={theme} />
      default:
        return <Home go={setScreen} lang={lang} profile={profile} theme={theme} />
    }
  }

  return (
    <div
      className={`min-h-screen w-full flex justify-center ${
        isLight ? 'bg-[#E2E8F0]' : 'bg-[#05070B]'
      }`}
    >
      <div
        className={`w-full max-w-[480px] min-h-screen flex flex-col relative shadow-2xl overflow-hidden ${
          isLight ? 'bg-[#F4F5F8] text-gray-900' : 'bg-[#090D14] text-white'
        }`}
      >
        {/* Sub-screen Back Bar */}
        {isSubScreen && (
          <div
            className={`px-4 py-2.5 flex items-center justify-between border-b shrink-0 ${
              isLight
                ? 'bg-white border-gray-200 text-gray-900'
                : 'bg-[#0E1522] border-white/10 text-white'
            }`}
          >
            <button
              type="button"
              onClick={() => setScreen('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{isAk ? 'ပင်မသို့' : 'Back to Wallet'}</span>
            </button>
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              m.pethar.co.uk
            </span>
          </div>
        )}

        {/* Active Mobile Screen Content */}
        <div className="flex-1 overflow-y-auto pb-20">{renderScreen()}</div>

        {/* 5-Dock Mobile Navigation Bar (Matching Flutter MainShell) */}
        <nav
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-16 px-3 border-t flex items-center justify-around z-40 ${
            isLight
              ? 'bg-white/95 border-gray-200 shadow-[0_-6px_24px_rgba(0,0,0,0.06)]'
              : 'bg-[#0B0F14]/95 border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]'
          } backdrop-blur-xl`}
        >
          {/* Tab 1: Home */}
          <button
            type="button"
            onClick={() => setScreen('home')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition cursor-pointer ${
              screen === 'home'
                ? 'text-amber-400 font-bold'
                : isLight
                  ? 'text-gray-500 hover:text-gray-900'
                  : 'text-gray-400 hover:text-white'
            }`}
          >
            <HomeIcon size={20} />
            <span className="text-[10px]">{isAk ? 'ပင်မ' : 'Home'}</span>
          </button>

          {/* Tab 2: Account */}
          <button
            type="button"
            onClick={() => setScreen('account')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition cursor-pointer ${
              screen === 'account'
                ? 'text-amber-400 font-bold'
                : isLight
                  ? 'text-gray-500 hover:text-gray-900'
                  : 'text-gray-400 hover:text-white'
            }`}
          >
            <CreditCard size={20} />
            <span className="text-[10px]">{isAk ? 'ငွေစာရင်း' : 'Account'}</span>
          </button>

          {/* Center Elevated Scan QR FAB */}
          <div className="relative -top-5">
            <button
              type="button"
              onClick={() => setScreen('scan')}
              aria-label="Scan QR"
              className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#00E5FF] via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(0,229,255,0.45)] border-4 transition active:scale-95 cursor-pointer ${
                isLight ? 'border-white' : 'border-[#090D14]'
              }`}
            >
              <QrCode size={24} />
            </button>
          </div>

          {/* Tab 4: Services */}
          <button
            type="button"
            onClick={() => setScreen('services')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition cursor-pointer ${
              screen === 'services'
                ? 'text-amber-400 font-bold'
                : isLight
                  ? 'text-gray-500 hover:text-gray-900'
                  : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={20} />
            <span className="text-[10px]">{isAk ? 'ဝန်ဆောင်မှု' : 'Services'}</span>
          </button>

          {/* Tab 5: Settings */}
          <button
            type="button"
            onClick={() => setScreen('settings')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition cursor-pointer ${
              screen === 'settings'
                ? 'text-amber-400 font-bold'
                : isLight
                  ? 'text-gray-500 hover:text-gray-900'
                  : 'text-gray-400 hover:text-white'
            }`}
          >
            <SettingsIcon size={20} />
            <span className="text-[10px]">{isAk ? 'ဆက်တင်' : 'Settings'}</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

export default MobileWalletPage
