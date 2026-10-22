import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Language } from '../i18n'

/* ─── NON-DRAGGABLE ARAKAN FLAG & UK FLAG ICONS (MATCHING HOME PAGE) ──────── */
function NonDraggableArakanFlag({ size = 20 }: { size?: number }) {
  return (
    <span
      role="img"
      aria-label="အာရက္ခ"
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      className="inline-block rounded-full overflow-hidden shrink-0 border border-current/20 select-none pointer-events-none bg-[#ec201c]"
      style={
        {
          width: size,
          height: size,
          backgroundImage: 'url(/united-league-of-arakan-flag.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          WebkitUserDrag: 'none',
          userSelect: 'none',
        } as React.CSSProperties
      }
    />
  )
}

function NonDraggableEnglishFlag({ size = 20 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className="rounded-full shrink-0 overflow-hidden border border-current/20 select-none pointer-events-none"
      style={{ width: size, height: size }}
      aria-label="English"
    >
      <rect width="60" height="60" fill="#012169" />
      <path d="M0,0 L60,60 M60,0 L0,60" stroke="#fff" strokeWidth="10" />
      <path d="M0,0 L60,60 M60,0 L0,60" stroke="#C8102E" strokeWidth="5" />
      <path d="M30,0 v60 M0,30 h60" stroke="#fff" strokeWidth="16" />
      <path d="M30,0 v60 M0,30 h60" stroke="#C8102E" strokeWidth="9" />
    </svg>
  )
}

const LANGUAGES: {
  code: Language
  label: string
}[] = [
  { code: 'en', label: 'English' },
  { code: 'ak', label: 'အာရက္ခ' },
]

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

declare global {
  interface Window {
    __petharDeferredInstallPrompt?: BeforeInstallPromptEvent | null
  }
}

interface DownloadPageProps {
  lang: Language
}

export const DownloadPage: React.FC<DownloadPageProps> = ({ lang }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const pathLower = location.pathname.toLowerCase()
  const isAndroidRoute =
    pathLower.includes('/android') ||
    pathLower.includes('/andriod') ||
    pathLower.includes('/andrioid')

  const [currentLang, setCurrentLang] = useState<Language>(lang === 'ak' ? 'ak' : 'en')
  const [langMenuOpen, setLangMenuOpen] = useState<boolean>(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    typeof window !== 'undefined' ? window.__petharDeferredInstallPrompt || null : null
  )
  const [showAndroidInstallModal, setShowAndroidInstallModal] = useState<boolean>(isAndroidRoute)
  const [androidDownloadStarted, setAndroidDownloadStarted] = useState<boolean>(false)
  const [iosProfilePromptShown, setIosProfilePromptShown] = useState<boolean>(false)
  const autoDownloadTriggeredRef = useRef<boolean>(false)

  useEffect(() => {
    setCurrentLang(lang === 'ak' ? 'ak' : 'en')
  }, [lang])

  const isAk = currentLang === 'ak'
  const currentLangItem =
    LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0]

  // Listen for Android Chrome/WebAPK beforeinstallprompt event
  useEffect(() => {
    const syncDeferredPrompt = () => {
      if (window.__petharDeferredInstallPrompt) {
        setDeferredPrompt(window.__petharDeferredInstallPrompt)
      }
    }
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      window.__petharDeferredInstallPrompt = promptEvent
      setDeferredPrompt(promptEvent)
    }

    syncDeferredPrompt()
    window.addEventListener('pethar-install-ready', syncDeferredPrompt)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('pethar-install-ready', syncDeferredPrompt)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Trigger instant APK download in browser when visiting /en/android, /ak/android, /en/andriod, or /ak/andriod
  const triggerAndroidApkDownload = () => {
    if (typeof document === 'undefined') return
    setAndroidDownloadStarted(true)
    setShowAndroidInstallModal(true)
    const link = document.createElement('a')
    link.href = '/pethar-release.apk'
    link.setAttribute('download', 'Pethar.apk')
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link)
    }, 1000)
  }

  useEffect(() => {
    if (isAndroidRoute && !autoDownloadTriggeredRef.current) {
      autoDownloadTriggeredRef.current = true
      setShowAndroidInstallModal(true)
      const timer = window.setTimeout(() => {
        triggerAndroidApkDownload()
      }, 250)
      return () => window.clearTimeout(timer)
    }
  }, [isAndroidRoute])

  // Trigger native Android "Install App" prompt (WebAPK beforeinstallprompt) or APK package installer
  const handleAndroidInstallApp = async () => {
    const promptEvent = deferredPrompt || window.__petharDeferredInstallPrompt
    if (promptEvent) {
      try {
        await promptEvent.prompt()
        await promptEvent.userChoice
        window.__petharDeferredInstallPrompt = null
        setDeferredPrompt(null)
        return
      } catch {
        // Fallback to direct APK download/install
      }
    }
    triggerAndroidApkDownload()
  }

  // Trigger iOS Configuration Profile (.mobileconfig) so iPhone Safari shows:
  // "Configuration profile available — Continue downloading a configuration profile from ...?"
  const handleIosDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    if (!isIOS) {
      // On desktop or non-iOS preview, also show the iOS "Configuration profile available" preview sheet
      e.preventDefault()
      setIosProfilePromptShown(true)
      return
    }
    // On real iPhone/iPad, allow direct navigation to /pethar.mobileconfig (Content-Type: application/x-apple-aspen-config)
    // which triggers the native iOS "Configuration profile available" alert sheet
  }

  const confirmIosProfileDownload = () => {
    setIosProfilePromptShown(false)
    window.location.href = '/pethar.mobileconfig'
  }

  const selectLanguage = (nextLang: Language) => {
    localStorage.setItem('pethar_lang', nextLang)
    setCurrentLang(nextLang)
    setLangMenuOpen(false)
    const updatedPath = location.pathname.replace(/\/(en|ak)(?=\/|$)/, `/${nextLang}`)
    if (updatedPath !== location.pathname) {
      navigate(`${updatedPath}${location.search}`)
    } else {
      const targetSuffix = isAndroidRoute ? 'android' : 'ios'
      navigate(`/download/${nextLang}/${targetSuffix}`)
    }
  }

  const handleBack = () => {
    navigate(`/${currentLang}`)
  }

  const currentDomain =
    typeof window !== 'undefined' && window.location.hostname
      ? window.location.hostname
      : 'download.pethar.co.uk'

  const renderLanguageButton = () => (
    <div
      className="relative select-none"
      onDragStart={(e) => e.preventDefault()}
    >
      <button
        type="button"
        onClick={() => setLangMenuOpen(!langMenuOpen)}
        aria-label="Change Language"
        className="h-11 px-4 rounded-full backdrop-blur-2xl border inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none bg-zinc-900/70 hover:bg-zinc-800 border-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.4)]"
      >
        {currentLang === 'ak' ? (
          <NonDraggableArakanFlag size={20} />
        ) : (
          <NonDraggableEnglishFlag size={20} />
        )}
        <span>{currentLangItem.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-75 transition-transform ${
            langMenuOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {langMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2.5 w-44 rounded-2xl p-1.5 backdrop-blur-2xl border z-50 select-none bg-[#18181B]/95 border-white/15 shadow-2xl text-white"
          >
            {LANGUAGES.map((item) => {
              const isSelected = currentLang === item.code
              return (
                <button
                  key={item.code}
                  type="button"
                  onDragStart={(e) => e.preventDefault()}
                  onClick={() => selectLanguage(item.code)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-left select-none ${
                    isSelected
                      ? 'bg-white text-zinc-950'
                      : 'text-white/85 hover:bg-white/10'
                  }`}
                >
                  {item.code === 'ak' ? (
                    <NonDraggableArakanFlag size={18} />
                  ) : (
                    <NonDraggableEnglishFlag size={18} />
                  )}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  /* ═══════════════════════════════════════════════════════════════════════════
     ANDROID INSTANT DOWNLOAD & INSTALL APP VIEW (/en/android, /ak/android, /andriod)
  ═══════════════════════════════════════════════════════════════════════════ */
  if (isAndroidRoute) {
    return (
      <div className="min-h-screen bg-[#0c0c0e] text-white font-sans selection:bg-white selection:text-black pb-16">
        <div className="max-w-[540px] mx-auto px-4 pt-5 space-y-8">
          {/* Top Bar: Back + Home Page Language Switcher */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="h-11 px-4 rounded-full backdrop-blur-2xl border inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none bg-zinc-900/70 hover:bg-zinc-800 border-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.4)]"
            >
              <span>←</span>
              <span>{isAk ? 'နောက်သို့' : 'Back'}</span>
            </button>

            {renderLanguageButton()}
          </div>

          {/* App Icon & Hero */}
          <div className="text-center space-y-3 pt-2">
            <div className="w-24 h-24 mx-auto rounded-[24px] bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/15 shadow-[0_14px_35px_rgba(0,0,0,0.75)] flex items-center justify-center p-3.5">
              <img
                src="/pethar-logo-red-white.svg"
                alt="Péthar"
                className="w-full h-full object-contain select-none pointer-events-none"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight pt-2">
              {isAk ? 'Android အက်ပ် ဒေါင်းလုဒ်နှင့် ထည့်သွင်းရန်' : 'Download Android App'}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
              {androidDownloadStarted
                ? isAk
                  ? 'Pethar.apk ကို သင့်ဘရောက်ဇာတွင် အလိုအလျောက် ဒေါင်းလုဒ်ဆွဲနေပါပြီ။ အောက်ပါ Install App ခလုတ်ကို နှိပ်၍ တိုက်ရိုက်ထည့်သွင်းပါ။'
                  : 'Pethar.apk is downloading automatically in your browser. Tap Install App below to open on your Android phone.'
                : isAk
                  ? 'အက်ပ်ကို သင့် Android ဖုန်းတွင် တိုက်ရိုက် ထည့်သွင်းရန် အောက်ပါခလုတ်ကို နှိပ်ပါ'
                  : 'Follow the prompt below to install Péthar on your Android phone'}
            </p>

            {/* Primary Install App & Download Buttons */}
            <div className="pt-3 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleAndroidInstallApp}
                className="w-full max-w-[360px] py-4 px-6 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-base shadow-[0_0_30px_rgba(255,255,255,0.28)] transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4396" />
                </svg>
                <span>{isAk ? 'Install App (အက်ပ် တိုက်ရိုက်ထည့်သွင်းရန်)' : 'Install App on Android'}</span>
              </button>

              <a
                href="/pethar-release.apk"
                download="Pethar.apk"
                onClick={() => setAndroidDownloadStarted(true)}
                className="w-full max-w-[360px] py-3 px-6 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 no-underline"
              >
                <span>
                  {isAk
                    ? 'Pethar.apk ကို ထပ်မံ ဒေါင်းလုဒ်ဆွဲရန် (Direct APK)'
                    : 'Download Pethar.apk Directly'}
                </span>
              </a>
            </div>
          </div>

          {/* Native-style Android Install App Card */}
          {showAndroidInstallModal && (
            <div className="bg-[#18181c] border border-white/15 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/15 p-2 flex items-center justify-center shrink-0">
                  <img
                    src="/pethar-logo-red-white.svg"
                    alt="Péthar"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-white">
                    {isAk ? 'Péthar (ဖေ့သာ) အက်ပ် ထည့်သွင်းမည်လား?' : 'Install Péthar (ဖေ့သာ) App?'}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {isAk
                      ? 'သင့် Android ဖုန်းတွင် Péthar ပိုက်ဆံအိတ်ကို ချက်ချင်း ထည့်သွင်းအသုံးပြုနိုင်ပါသည်'
                      : 'Add Péthar Digital Wallet directly to your Android phone home screen'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAndroidInstallModal(false)}
                  className="py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
                >
                  {isAk ? 'ပိတ်မည်' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleAndroidInstallApp}
                  className="py-2.5 rounded-full bg-[#00e5ff] hover:bg-[#00cce6] text-xs font-extrabold text-zinc-950 transition-colors cursor-pointer"
                >
                  {isAk ? 'Install (ထည့်သွင်းမည်)' : 'Install'}
                </button>
              </div>
            </div>
          )}

          {/* Android Installation Guide */}
          <div className="bg-[#141417] border border-white/[0.07] rounded-3xl p-4 sm:p-5 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-center text-white py-1">
              {isAk ? 'Android ထည့်သွင်းနည်း လမ်းညွှန်' : 'Android Installation Guide'}
            </h2>

            {[
              {
                step: 1,
                title: isAk
                  ? 'ဘရောက်ဇာတွင် Pethar.apk အလိုအလျောက် ဒေါင်းလုဒ်ဆွဲပါမည်'
                  : 'Browser automatically downloads Pethar.apk — tap Open when finished',
                screenLabel: 'Downloading Pethar.apk...',
                actionLabel: 'Open',
              },
              {
                step: 2,
                title: isAk
                  ? '"Do you want to install this app?" မေးလျှင် Install ကို နှိပ်ပါ'
                  : 'When Android prompts "Do you want to install this app?", tap Install',
                screenLabel: 'Do you want to install this app?',
                actionLabel: 'Install',
              },
              {
                step: 3,
                title: isAk
                  ? 'ထည့်သွင်းပြီးပါက Open ကို နှိပ်၍ Péthar ကို စတင်အသုံးပြုပါ'
                  : 'Tap Open to launch Péthar Digital Wallet on your Android phone',
                screenLabel: 'App installed.',
                actionLabel: 'Open',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#1c1c20] border border-white/[0.06] rounded-2xl p-3 pb-3.5 space-y-2.5"
              >
                <div className="bg-[#08080a] rounded-xl p-4 flex items-center justify-between gap-4 min-h-[170px]">
                  {/* Mini Android Screen */}
                  <div className="w-[145px] sm:w-[165px] rounded-[22px] border-2 border-zinc-600 bg-[#121216] p-3 space-y-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <img src="/pethar-logo-red-white.svg" alt="Péthar" className="w-6 h-6" />
                      <span className="text-[11px] font-bold text-white">Péthar</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-snug">{item.screenLabel}</div>
                    <div className="flex justify-end gap-2 pt-2">
                      <span className="px-2 py-1 rounded text-[9px] text-zinc-400 bg-white/5">
                        Cancel
                      </span>
                      <span className="px-2.5 py-1 rounded text-[9px] font-bold text-white bg-blue-600 border-2 border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.6)]">
                        {item.actionLabel}
                      </span>
                    </div>
                  </div>

                  {/* Pointer + Copy */}
                  <div className="flex-1 flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2 w-full">
                      <div className="h-[2px] flex-1 bg-[#00e5ff]" />
                      <span className="w-3.5 h-3.5 rounded-full bg-[#00e5ff] shadow-[0_0_10px_#00e5ff] shrink-0" />
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                      {item.title}
                    </p>
                  </div>
                </div>
                <div className="text-center text-xs font-semibold text-zinc-300">
                  Step {item.step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     iOS DOWNLOAD PAGE — MATCHING PROVIDED SCREENSHOTS 1 & 2
     (/en/ios, /ak/ios, /download/en/ios, /download/ak/ios)
  ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white font-sans selection:bg-white selection:text-black pb-16">
      <div className="max-w-[540px] mx-auto px-4 pt-5 space-y-7">
        {/* Top Bar: Left Back Button & Right Home Page Language Switcher */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="h-11 px-4 rounded-full backdrop-blur-2xl border inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none bg-zinc-900/70 hover:bg-zinc-800 border-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.4)]"
          >
            <span>←</span>
            <span>{isAk ? 'နောက်သို့' : 'Back'}</span>
          </button>

          {renderLanguageButton()}
        </div>

        {/* Center Hero: App Icon + Title + Subtitle + White Pill Download Button */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-24 h-24 mx-auto rounded-[24px] bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/15 shadow-[0_14px_35px_rgba(0,0,0,0.75)] flex items-center justify-center p-3.5">
            <img
              src="/pethar-logo-red-white.svg"
              alt="Péthar Logo"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight pt-2">
            {isAk ? 'iOS အက်ပ် ဒေါင်းလုဒ်ရယူရန်' : 'Download iOS App'}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
            {isAk
              ? 'အက်ပ်ကို ထည့်သွင်းရန် အောက်ပါအဆင့်များအတိုင်း လုပ်ဆောင်ပါ'
              : 'Please follow the steps below to install the app'}
          </p>

          <div className="pt-3 flex justify-center">
            <a
              href="/pethar.mobileconfig"
              onClick={handleIosDownloadClick}
              className="w-full max-w-[360px] py-4 px-8 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-base shadow-[0_0_32px_rgba(255,255,255,0.28)] transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 no-underline cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.79-.96 2.84 1.04.08 2.08-.52 2.72-1.3z" />
              </svg>
              <span>{isAk ? 'Download for iOS' : 'Download for iOS'}</span>
            </a>
          </div>
        </div>

        {/* Installation Guide Container (7 Visual Steps Matching Reference Image) */}
        <div className="bg-[#141417] border border-white/[0.06] rounded-[28px] p-3.5 sm:p-5 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-center text-white py-1.5">
            {isAk ? 'Installation Guide (ထည့်သွင်းနည်း လမ်းညွှန်)' : 'Installation Guide'}
          </h2>

          {/* STEP 1 */}
          <div className="bg-[#1e1e22] border border-white/[0.05] rounded-2xl p-3 pb-3.5 space-y-2.5">
            <div className="bg-[#070709] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 min-h-[260px] relative overflow-hidden">
              {/* iPhone Mockup — Step 1: Download for iOS Button */}
              <div className="w-[155px] sm:w-[170px] h-[245px] rounded-[26px] border-2 border-zinc-500/80 bg-[#101014] p-2.5 flex flex-col justify-between shrink-0 shadow-2xl">
                <div className="flex items-center justify-between text-[8px] text-zinc-400 px-1">
                  <span>11:43</span>
                  <div className="w-10 h-2.5 rounded-full bg-black border border-white/10" />
                  <span>5G 100%</span>
                </div>
                <div className="text-center space-y-2 my-auto px-1">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-zinc-800 p-1.5 flex items-center justify-center border border-white/10">
                    <img src="/pethar-logo-red-white.svg" alt="Péthar" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-[10px] font-bold text-white">Download App</div>
                  <div className="text-[7px] text-zinc-400">Click the button below to download</div>
                  <div className="relative py-1.5 px-2 rounded-full bg-white text-zinc-950 text-[8px] font-extrabold border-2 border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.75)]">
                     Download for iOS
                  </div>
                  <div className="py-1 px-2 rounded-full bg-white/10 text-zinc-300 text-[7px] font-semibold">
                    Download for Android
                  </div>
                </div>
                <div className="w-12 h-1 rounded-full bg-white/30 mx-auto" />
              </div>

              {/* Cyan Callout Pointer + Text */}
              <div className="flex-1 flex flex-col items-start pl-1">
                <div className="flex items-center w-full mb-2">
                  <div className="h-[2px] flex-1 bg-[#00e5ff]" />
                  <span className="w-4 h-4 rounded-full bg-[#00e5ff] shadow-[0_0_12px_#00e5ff] shrink-0" />
                </div>
                <p className="text-xs sm:text-sm font-black text-white leading-snug">
                  {isAk
                    ? 'iOS အတွက် Péthar အက်ပ် ဒေါင်းလုဒ်ဆွဲရန် ဤခလုတ်ကို နှိပ်ပါ'
                    : 'Click here to download the Péthar software on iOS'}
                </p>
              </div>
            </div>
            <div className="text-center text-xs sm:text-sm font-medium text-zinc-300">Step 1</div>
          </div>

          {/* STEP 2 */}
          <div className="bg-[#1e1e22] border border-white/[0.05] rounded-2xl p-3 pb-3.5 space-y-2.5">
            <div className="bg-[#070709] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 min-h-[260px] relative overflow-hidden">
              {/* iPhone Mockup — Step 2: Settings -> Profile Downloaded */}
              <div className="w-[155px] sm:w-[170px] h-[245px] rounded-[26px] border-2 border-zinc-500/80 bg-[#0d0d10] p-2.5 flex flex-col justify-between shrink-0 shadow-2xl">
                <div className="flex items-center justify-between text-[8px] text-zinc-400 px-1">
                  <span>17:15</span>
                  <div className="w-10 h-2.5 rounded-full bg-black border border-white/10" />
                  <span>5G</span>
                </div>
                <div className="space-y-1.5 my-auto px-0.5 text-left">
                  <div className="text-[10px] font-bold text-white text-center pb-0.5">Settings</div>
                  <div className="p-1.5 rounded-lg bg-[#1c1c1e] border-2 border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.65)] flex items-center justify-between">
                    <span className="text-[8px] font-bold text-white">Profile Downloaded</span>
                    <span className="text-[8px] text-zinc-400">›</span>
                  </div>
                  <div className="rounded-lg bg-[#1c1c1e] p-1.5 space-y-1 text-[7.5px] text-zinc-300">
                    <div className="flex justify-between"><span>✈️ Airplane Mode</span><span>Off</span></div>
                    <div className="flex justify-between"><span>📶 Wi-Fi</span><span className="text-zinc-500">Connected</span></div>
                    <div className="flex justify-between"><span>🔵 Bluetooth</span><span className="text-zinc-500">On</span></div>
                    <div className="flex justify-between"><span>📡 Cellular</span><span>›</span></div>
                    <div className="flex justify-between"><span>⚙️ General</span><span>›</span></div>
                  </div>
                </div>
                <div className="w-12 h-1 rounded-full bg-white/30 mx-auto" />
              </div>

              {/* Cyan Callout Pointer + Text */}
              <div className="flex-1 flex flex-col items-start pl-1">
                <div className="flex items-center w-full mb-2">
                  <div className="h-[2px] flex-1 bg-[#00e5ff]" />
                  <span className="w-4 h-4 rounded-full bg-[#00e5ff] shadow-[0_0_12px_#00e5ff] shrink-0" />
                </div>
                <p className="text-xs sm:text-sm font-black text-white leading-snug">
                  {isAk
                    ? 'iPhone Settings သို့သွားပြီး Profile Downloaded ကို နှိပ်ပါ'
                    : 'Download for iOS — Go to iPhone setting and Click the profile download'}
                </p>
              </div>
            </div>
            <div className="text-center text-xs sm:text-sm font-medium text-zinc-300">Step 2</div>
          </div>

          {/* STEP 3 */}
          <div className="bg-[#1e1e22] border border-white/[0.05] rounded-2xl p-3 pb-3.5 space-y-2.5">
            <div className="bg-[#070709] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 min-h-[260px] relative overflow-hidden">
              {/* iPhone Mockup — Step 3: Top-Right Install */}
              <div className="w-[155px] sm:w-[170px] h-[245px] rounded-[26px] border-2 border-zinc-500/80 bg-[#0d0d10] p-2.5 flex flex-col justify-between shrink-0 shadow-2xl">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[8px] text-zinc-400 px-1">
                    <span>17:15</span>
                    <div className="w-10 h-2.5 rounded-full bg-black border border-white/10" />
                    <span>5G</span>
                  </div>
                  <div className="flex items-center justify-between px-1 pt-1">
                    <span className="text-[8px] text-blue-400">Cancel</span>
                    <span className="text-[8.5px] font-bold text-white">Install Profile</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[8px] font-extrabold border-2 border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.75)]">
                      Install
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1c1c1e] flex items-center gap-2 text-left">
                    <img src="/pethar-logo-red-white.svg" alt="Péthar" className="w-6 h-6 shrink-0" />
                    <div>
                      <div className="text-[8px] font-bold text-white">Péthar (ဖေ့သာ)</div>
                      <div className="text-[6.5px] text-zinc-400">Signed · WebClip Profile</div>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-1 rounded-full bg-white/30 mx-auto" />
              </div>

              {/* Cyan Callout Pointer + Text */}
              <div className="flex-1 flex flex-col items-start pl-1">
                <div className="flex items-center w-full mb-2">
                  <div className="h-[2px] flex-1 bg-[#00e5ff]" />
                  <span className="w-4 h-4 rounded-full bg-[#00e5ff] shadow-[0_0_12px_#00e5ff] shrink-0" />
                </div>
                <p className="text-xs sm:text-sm font-black text-white leading-snug">
                  {isAk
                    ? 'ညာဘက်အပေါ်ထောင့်ရှိ Install ကို နှိပ်ပါ'
                    : 'Download for iOS — Click the Install'}
                </p>
              </div>
            </div>
            <div className="text-center text-xs sm:text-sm font-medium text-zinc-300">Step 3</div>
          </div>

          {/* STEP 4 */}
          <div className="bg-[#1e1e22] border border-white/[0.05] rounded-2xl p-3 pb-3.5 space-y-2.5">
            <div className="bg-[#070709] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 min-h-[260px] relative overflow-hidden">
              {/* iPhone Mockup — Step 4: Modal Install Confirmation */}
              <div className="w-[155px] sm:w-[170px] h-[245px] rounded-[26px] border-2 border-zinc-500/80 bg-[#0d0d10] p-2.5 flex flex-col justify-between shrink-0 shadow-2xl">
                <div className="flex items-center justify-between text-[8px] text-zinc-400 px-1">
                  <span>17:15</span>
                  <div className="w-10 h-2.5 rounded-full bg-black border border-white/10" />
                  <span>5G</span>
                </div>
                <div className="my-auto p-2.5 rounded-xl bg-[#252529] border border-white/10 text-center space-y-2">
                  <div className="text-[8.5px] font-bold text-white">Install Profile</div>
                  <div className="text-[7px] text-zinc-400 leading-tight">
                    Installing this profile will add Péthar to your iPhone.
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <span className="py-1 rounded-md bg-white/10 text-[7.5px] text-zinc-300">
                      Cancel
                    </span>
                    <span className="py-1 rounded-md bg-blue-500/25 text-blue-300 text-[7.5px] font-extrabold border-2 border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.75)]">
                      Install
                    </span>
                  </div>
                </div>
                <div className="w-12 h-1 rounded-full bg-white/30 mx-auto" />
              </div>

              {/* Cyan Callout Pointer + Text */}
              <div className="flex-1 flex flex-col items-start pl-1">
                <div className="flex items-center w-full mb-2">
                  <div className="h-[2px] flex-1 bg-[#00e5ff]" />
                  <span className="w-4 h-4 rounded-full bg-[#00e5ff] shadow-[0_0_12px_#00e5ff] shrink-0" />
                </div>
                <p className="text-xs sm:text-sm font-black text-white leading-snug">
                  {isAk ? 'Install ခလုတ်ကို ထပ်မံ နှိပ်ပါ' : 'Download for iOS — Click the Install'}
                </p>
              </div>
            </div>
            <div className="text-center text-xs sm:text-sm font-medium text-zinc-300">Step 4</div>
          </div>

          {/* STEP 5 */}
          <div className="bg-[#1e1e22] border border-white/[0.05] rounded-2xl p-3 pb-3.5 space-y-2.5">
            <div className="bg-[#070709] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 min-h-[260px] relative overflow-hidden">
              {/* iPhone Mockup — Step 5: Enter Passcode */}
              <div className="w-[155px] sm:w-[170px] h-[245px] rounded-[26px] border-2 border-zinc-500/80 bg-[#0d0d10] p-2.5 flex flex-col justify-between shrink-0 shadow-2xl">
                <div className="flex items-center justify-between text-[8px] text-zinc-400 px-1">
                  <span>17:15</span>
                  <div className="w-10 h-2.5 rounded-full bg-black border border-white/10" />
                  <span>5G</span>
                </div>
                <div className="my-auto text-center space-y-2 px-1">
                  <div className="text-blue-400 text-sm">🔒</div>
                  <div className="text-[8.5px] font-bold text-white">Enter your passcode</div>
                  <div className="text-[6.5px] text-zinc-400 leading-tight">
                    Enter the passcode you use to unlock this iPhone
                  </div>
                  <div className="py-1.5 px-2 rounded-full border-2 border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.75)] flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map((dot) => (
                      <span key={dot} className="w-2 h-2 rounded-full border border-zinc-400" />
                    ))}
                  </div>
                </div>
                <div className="w-12 h-1 rounded-full bg-white/30 mx-auto" />
              </div>

              {/* Cyan Callout Pointer + Text */}
              <div className="flex-1 flex flex-col items-start pl-1">
                <div className="flex items-center w-full mb-2">
                  <div className="h-[2px] flex-1 bg-[#00e5ff]" />
                  <span className="w-4 h-4 rounded-full bg-[#00e5ff] shadow-[0_0_12px_#00e5ff] shrink-0" />
                </div>
                <p className="text-xs sm:text-sm font-black text-white leading-snug">
                  {isAk
                    ? 'သင့် iPhone Passcode နံပါတ်ကို ရိုက်ထည့်ပါ'
                    : 'Enter your iPhone passcode number here'}
                </p>
              </div>
            </div>
            <div className="text-center text-xs sm:text-sm font-medium text-zinc-300">Step 5</div>
          </div>

          {/* STEP 6 */}
          <div className="bg-[#1e1e22] border border-white/[0.05] rounded-2xl p-3 pb-3.5 space-y-2.5">
            <div className="bg-[#070709] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 min-h-[260px] relative overflow-hidden">
              {/* iPhone Mockup — Step 6: Top-Right Install */}
              <div className="w-[155px] sm:w-[170px] h-[245px] rounded-[26px] border-2 border-zinc-500/80 bg-[#0d0d10] p-2.5 flex flex-col justify-between shrink-0 shadow-2xl">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[8px] text-zinc-400 px-1">
                    <span>17:15</span>
                    <div className="w-10 h-2.5 rounded-full bg-black border border-white/10" />
                    <span>5G</span>
                  </div>
                  <div className="flex items-center justify-between px-1 pt-1">
                    <span className="text-[8px] text-blue-400">Cancel</span>
                    <span className="text-[8.5px] font-bold text-white">Warning</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[8px] font-extrabold border-2 border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.75)]">
                      Install
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1c1c1e] text-left space-y-1">
                    <div className="text-[8px] font-bold text-white">Péthar Configuration</div>
                    <div className="text-[6.5px] text-zinc-400">Ready to install on Home Screen</div>
                  </div>
                </div>
                <div className="w-12 h-1 rounded-full bg-white/30 mx-auto" />
              </div>

              {/* Cyan Callout Pointer + Text */}
              <div className="flex-1 flex flex-col items-start pl-1">
                <div className="flex items-center w-full mb-2">
                  <div className="h-[2px] flex-1 bg-[#00e5ff]" />
                  <span className="w-4 h-4 rounded-full bg-[#00e5ff] shadow-[0_0_12px_#00e5ff] shrink-0" />
                </div>
                <p className="text-xs sm:text-sm font-black text-white leading-snug">
                  {isAk ? 'Install ကို ထပ်မံ နှိပ်ပါ' : 'Click the Install'}
                </p>
              </div>
            </div>
            <div className="text-center text-xs sm:text-sm font-medium text-zinc-300">Step 6</div>
          </div>

          {/* STEP 7 */}
          <div className="bg-[#1e1e22] border border-white/[0.05] rounded-2xl p-3 pb-3.5 space-y-2.5">
            <div className="bg-[#070709] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 min-h-[260px] relative overflow-hidden">
              {/* iPhone Mockup — Step 7: Final Install Confirmation */}
              <div className="w-[155px] sm:w-[170px] h-[245px] rounded-[26px] border-2 border-zinc-500/80 bg-[#0d0d10] p-2.5 flex flex-col justify-between shrink-0 shadow-2xl">
                <div className="flex items-center justify-between text-[8px] text-zinc-400 px-1">
                  <span>17:15</span>
                  <div className="w-10 h-2.5 rounded-full bg-black border border-white/10" />
                  <span>5G</span>
                </div>
                <div className="mt-auto mb-2 p-2.5 rounded-xl bg-[#252529] border border-white/10 text-center space-y-2">
                  <div className="text-[8.5px] font-bold text-white">Install Profile</div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <span className="py-1 rounded-md bg-white/10 text-[7.5px] text-zinc-300">
                      Cancel
                    </span>
                    <span className="py-1 rounded-md bg-blue-500/25 text-blue-300 text-[7.5px] font-extrabold border-2 border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.75)]">
                      Install
                    </span>
                  </div>
                </div>
                <div className="w-12 h-1 rounded-full bg-white/30 mx-auto" />
              </div>

              {/* Cyan Callout Pointer + Text */}
              <div className="flex-1 flex flex-col items-start pl-1">
                <div className="flex items-center w-full mb-2">
                  <div className="h-[2px] flex-1 bg-[#00e5ff]" />
                  <span className="w-4 h-4 rounded-full bg-[#00e5ff] shadow-[0_0_12px_#00e5ff] shrink-0" />
                </div>
                <p className="text-xs sm:text-sm font-black text-white leading-snug">
                  {isAk ? 'Install ကို နှိပ်၍ အတည်ပြုပါ' : 'Click the Install'}
                </p>
              </div>
            </div>
            <div className="text-center text-xs sm:text-sm font-medium text-zinc-300">Step 7</div>
          </div>
        </div>
      </div>

      {/* Native iOS "Configuration profile available" Dialog Sheet (Matching Screenshot 1) */}
      {iosProfilePromptShown && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-[320px] rounded-[28px] bg-[#6e6e73]/95 backdrop-blur-2xl border border-white/20 p-6 text-left shadow-2xl space-y-4 text-white">
            <div className="space-y-2 px-1">
              <h3 className="text-lg font-bold leading-snug tracking-tight text-white">
                Configuration
                <br />
                profile available
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Continue downloading a configuration profile from {currentDomain}?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIosProfilePromptShown(false)}
                className="py-2.5 rounded-full bg-white/20 hover:bg-white/25 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmIosProfileDownload}
                className="py-2.5 rounded-full bg-white/25 hover:bg-white/35 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DownloadPage
