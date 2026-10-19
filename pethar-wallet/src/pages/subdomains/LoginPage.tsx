import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import type { Language } from '../../i18n'
import { goToDashboard, goToAuth } from '../../utils/subdomain'
import { ArakanEmblem, FlagArakan } from '../../components/ArakanEmblem'
import {
  authenticateWithEmailAndPin,
  generateOtpForEmail,
  verifyEmailOtp,
  resetPinWithEmail,
} from '../../services/walletDatabase'
import {
  Eye, EyeOff, CheckCircle2, AlertCircle,
  ArrowLeft, Clock, RefreshCw
} from 'lucide-react'


// Great Britain Flag SVG
const FlagGB = ({ width = 18 }: { width?: number }) => {
  const height = Math.round((width * 2) / 3)
  return (
    <svg viewBox="0 0 60 40" width={width} height={height} className="rounded-xs shrink-0 overflow-hidden">
      <clipPath id="gb-flag-clip-login">
        <path d="M0,0 v40 h60 v-40 z" />
      </clipPath>
      <clipPath id="gb-flag-diag-login">
        <path d="M30,20 L60,40 H0 z M30,20 L60,0 H0 z" />
      </clipPath>
      <g clipPath="url(#gb-flag-clip-login)">
        <path d="M0,0 v40 h60 v-40 z" fill="#012169" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
        <path d="M0,0 L60,40 M60,0 L0,40" clipPath="url(#gb-flag-diag-login)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v40 M0,20 h60" stroke="#fff" strokeWidth="12" />
        <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  )
}

interface LoginPageProps {
  lang: Language
}

export const LoginPage = ({ lang }: LoginPageProps) => {
  const navigate = useNavigate()
  const [currentLang, setCurrentLang] = useState<Language>(lang)
  const ak = currentLang === 'ak'

  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Forgot Password / PIN Flow States
  const [view, setView] = useState<'login' | 'forgot_email' | 'forgot_otp' | 'forgot_new_pin'>('login')
  const [forgotEmail, setForgotEmail] = useState('')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [generatedOtpHint, setGeneratedOtpHint] = useState<string | null>(null)
  const [newPin, setNewPin] = useState('')
  const [confirmNewPin, setConfirmNewPin] = useState('')
  const [showNewPin, setShowNewPin] = useState(false)
  const [showConfirmNewPin, setShowConfirmNewPin] = useState(false)

  // 10-minute timer for OTP
  const [timerSeconds, setTimerSeconds] = useState(600)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [, setIsOtpExpired] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    let interval: any = null
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false)
            setIsOtpExpired(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerSeconds === 0) {
      setIsTimerActive(false)
      setIsOtpExpired(true)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerActive, timerSeconds])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const startOtpTimer = () => {
    setTimerSeconds(600) // 10 minutes
    setIsOtpExpired(false)
    setIsTimerActive(true)
  }

  const handleOtpBoxChange = (idx: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1]
    const updated = [...otpCode]
    updated[idx] = val
    setOtpCode(updated)

    if (val && idx < 5) {
      document.getElementById(`login-otp-${idx + 1}`)?.focus()
    }
  }

  const finishLogin = () => {
    setLoginSuccess(true)
    localStorage.setItem('pethar_logged_in', 'true')
    setTimeout(() => goToDashboard(currentLang, navigate), 500)
  }

  // 1. Log In Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setErrorMsg(ak ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter your email')
      return
    }
    if (!pin || pin.length !== 6) {
      setErrorMsg(ak ? '၆ လုံး ဂဏန်း PIN ကုဒ် ရိုက်ထည့်ပါ' : 'Please enter your 6-digit PIN')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    try {
      const res = await authenticateWithEmailAndPin(email.trim(), pin.trim())
      setIsLoading(false)
      if (res.success) {
        finishLogin()
      } else {
        setErrorMsg(res.error || (ak ? 'အီးမေးလ် သို့မဟုတ် PIN မှားယွင်းနေပါသည်' : 'Invalid email or PIN code'))
      }
    } catch {
      setIsLoading(false)
      setErrorMsg(ak ? 'ဝင်ရောက်ခြင်း မအောင်မြင်ပါ' : 'Login failed. Please try again.')
    }
  }

  // 2. Forgot PIN - Step 1: Request OTP
  const handleSendForgotOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setErrorMsg(ak ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter a valid email address')
      return
    }
    setErrorMsg('')
    const code = generateOtpForEmail(forgotEmail.trim())
    setGeneratedOtpHint(code)
    startOtpTimer()
    setOtpCode(['', '', '', '', '', ''])
    setView('forgot_otp')
  }

  // 3. Forgot PIN - Step 2: Verify OTP
  const handleVerifyForgotOtp = (e: React.FormEvent) => {
    e.preventDefault()
    const entered = otpCode.join('')
    if (entered.length !== 6) {
      setErrorMsg(ak ? '၆ လုံး ဂဏန်း OTP ကုဒ် အပြည့်အစုံ ရိုက်ထည့်ပါ' : 'Please enter the complete 6-digit OTP')
      return
    }
    const res = verifyEmailOtp(forgotEmail.trim(), entered)
    if (res.valid) {
      setErrorMsg('')
      setView('forgot_new_pin')
    } else {
      setErrorMsg(
        res.reason === 'expired'
          ? (ak ? 'OTP သက်တမ်းကုန်သွားပါပြီ' : 'OTP code has expired')
          : (ak ? 'OTP ကုဒ် မှားယွင်းနေပါသည်' : 'Invalid OTP code')
      )
    }
  }

  // 4. Forgot PIN - Step 3: Save New PIN
  const handleSaveNewPin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setErrorMsg(ak ? 'PIN ကုဒ်သည် ၆ လုံး ဂဏန်း ဖြစ်ရပါမည်' : 'PIN must be exactly 6 digits')
      return
    }
    if (newPin !== confirmNewPin) {
      setErrorMsg(ak ? 'PIN ကုဒ် နှစ်ကြိမ် ရိုက်ထည့်မှု မကိုက်ညီပါ' : 'PIN confirmation does not match')
      return
    }

    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await resetPinWithEmail(forgotEmail.trim(), newPin)
      setIsLoading(false)
      if (res.success) {
        setToastMsg(ak ? 'PIN အသစ် ပြောင်းလဲပြီးပါပြီ။ ကျေးဇူးပြု၍ ဝင်ရောက်ပါ' : 'PIN reset successfully! Please log in.')
        setEmail(forgotEmail)
        setPin(newPin)
        setTimeout(() => {
          setView('login')
          setToastMsg('')
        }, 1500)
      } else {
        setErrorMsg(res.error || 'Failed to update PIN')
      }
    } catch {
      setIsLoading(false)
      setErrorMsg('Failed to update PIN')
    }
  }

  const handleResendOtp = () => {
    setErrorMsg('')
    const code = generateOtpForEmail(forgotEmail.trim())
    setGeneratedOtpHint(code)
    startOtpTimer()
    setOtpCode(['', '', '', '', '', ''])
    setToastMsg(ak ? 'OTP အသစ် ပြန်ပို့ပြီးပါပြီ (၁၀ မိနစ် သက်တမ်းရှိ)' : 'New OTP code sent (valid for 10 minutes)!')
    setTimeout(() => setToastMsg(''), 3000)
  }

  const canLoginSubmit = email.length > 0 && pin.length === 6

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD FLOW (IMAGE 1)
  // ─────────────────────────────────────────────────────────────────────────
  if (view !== 'login') {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between max-w-md mx-auto px-6 py-6 font-sans">
        <div>
          {/* Top Bar: Back Arrow on left, Log In in orange on right */}
          <div className="flex items-center justify-between pt-2 pb-6">
            <button
              type="button"
              onClick={() => {
                if (view === 'forgot_new_pin') setView('forgot_otp')
                else if (view === 'forgot_otp') setView('forgot_email')
                else setView('login')
                setErrorMsg('')
              }}
              className="p-1 text-zinc-900 hover:text-zinc-600 cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => {
                setView('login')
                setErrorMsg('')
              }}
              className="text-[#F97316] font-bold text-[15px] cursor-pointer hover:underline"
            >
              {ak ? 'အကောင့်ဝင်မည်' : 'Log In'}
            </button>
          </div>

          {/* VIEW: FORGOT EMAIL (IMAGE 1) */}
          {view === 'forgot_email' && (
            <form onSubmit={handleSendForgotOtp} className="space-y-6 pt-2">
              <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                {ak ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forget Password?'}
              </h1>

              <div>
                <label className="block text-sm font-semibold text-zinc-800 mb-2">
                  {ak ? 'အီးမေးလ်' : 'Email'}
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder={ak ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email'}
                  className="w-full px-5 py-3.5 rounded-full bg-white border border-zinc-200 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#F97316]"
                  required
                />
              </div>

              {/* Information Grey Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-600 text-[13.5px] leading-relaxed">
                {ak
                  ? 'စကားဝှက်/ပင်နံပါတ် ပြန်လည်သတ်မှတ်ရန် လင့်ခ်/ကုဒ် ရရှိရန် သင့်အကောင့်နှင့် ချိတ်ဆက်ထားသော အီးမေးလ်လိပ်စာကို ရိုက်ထည့်ပါ။'
                  : 'Enter the email address associated with your account to receive a link to reset your password.'}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={!forgotEmail.includes('@') || isLoading}
                className={`w-full py-3.5 rounded-full text-white font-bold text-base transition shadow-sm cursor-pointer ${
                  forgotEmail.includes('@') ? 'bg-[#F97316] hover:bg-[#ea580c]' : 'bg-[#FED7AA] cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 mx-auto rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <span>{ak ? 'အတည်ပြုမည်' : 'Confirm'}</span>
                )}
              </button>
            </form>
          )}

          {/* VIEW: FORGOT OTP */}
          {view === 'forgot_otp' && (
            <form onSubmit={handleVerifyForgotOtp} className="space-y-6 pt-2">
              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                  {ak ? 'အတည်ပြုကုဒ် ရိုက်ထည့်ပါ' : 'Enter Verification Code'}
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  {ak ? `${forgotEmail} သို့ ပို့ထားသော ၆ လုံးပါ ကုဒ်ကို ရိုက်ထည့်ပါ` : `Enter the 6-digit code sent to ${forgotEmail}`}
                </p>
              </div>

              {/* 10-Minute Timer Badge */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{ak ? 'သက်တမ်းကုန်ဆုံးရန်: ' : 'Expires in: '}</span>
                  <span className="font-mono font-bold text-zinc-900">{formatTimer(timerSeconds)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-bold text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{ak ? 'အီးမေးလ် ပြန်ပို့မည်' : 'Resend Email'}</span>
                </button>
              </div>

              {generatedOtpHint && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-mono">
                  <span>Demo OTP:</span>
                  <span className="font-bold text-sm tracking-widest">{generatedOtpHint}</span>
                </div>
              )}

              <div className="flex justify-between gap-2">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`login-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-mono font-black rounded-2xl bg-zinc-50 border-2 border-zinc-200 focus:border-[#F97316] focus:outline-none"
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-center">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-base transition shadow-sm cursor-pointer"
              >
                {ak ? 'ကုဒ် အတည်ပြုမည်' : 'Verify Code'}
              </button>
            </form>
          )}

          {/* VIEW: FORGOT NEW PIN */}
          {view === 'forgot_new_pin' && (
            <form onSubmit={handleSaveNewPin} className="space-y-5 pt-2">
              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                  {ak ? 'ပင်နံပါတ်အသစ် သတ်မှတ်ပါ' : 'Create New PIN'}
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  {ak ? 'သင်၏ အကောင့်အတွက် ပင်နံပါတ် ၆ လုံး သတ်မှတ်ပါ' : 'Choose a new 6-digit PIN for your account'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
                  {ak ? 'ပင်နံပါတ်အသစ်' : 'New 6-Digit PIN'}
                </label>
                <div className="relative">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="w-full px-5 py-3.5 pr-12 rounded-full bg-white border border-zinc-200 text-sm font-mono font-bold tracking-widest focus:outline-none focus:border-[#F97316]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin((v) => !v)}
                    className="absolute right-4 top-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
                  {ak ? 'ပင်နံပါတ် အတည်ပြုပါ' : 'Confirm New PIN'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPin ? 'text' : 'password'}
                    maxLength={6}
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="w-full px-5 py-3.5 pr-12 rounded-full bg-white border border-zinc-200 text-sm font-mono font-bold tracking-widest focus:outline-none focus:border-[#F97316]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPin((v) => !v)}
                    className="absolute right-4 top-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showConfirmNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-center">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-base transition shadow-sm cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 mx-auto rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <span>{ak ? 'အတည်ပြုပြီး အကောင့်ဝင်မည်' : 'Confirm & Go to Login'}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOG IN VIEW (IMAGE 3 & 4)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pb-12 font-sans">
      {/* 1. Curved Gradient Hero Banner */}
      <div className="w-full relative overflow-hidden bg-gradient-to-br from-[#280C48] via-[#86163C] to-[#DD3347] pb-10 pt-4 px-6 rounded-b-[42px] shadow-sm">
        <div className="max-w-md mx-auto relative z-10">
          {/* Top Row: Language Toggle Pill on top right */}
          <div className="flex justify-end pb-5">
            <div className="flex items-center bg-[#140D2B]/65 border border-white/20 rounded-full p-1">
              <button
                type="button"
                onClick={() => setCurrentLang('ak')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  ak ? 'bg-[#F97316] text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                <FlagArakan size={18} />
                <span>AK</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentLang('en')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  !ak ? 'bg-[#F97316] text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                <FlagGB width={16} />
                <span>EN</span>
              </button>
            </div>
          </div>

          {/* Centered Péthar Branding */}
          <div className="flex items-center justify-center gap-3.5 pt-2 pb-4">
            <ArakanEmblem size={44} />
            <span className="text-white font-black tracking-tight text-3xl">
              Péthar
            </span>
          </div>
        </div>
      </div>

      {/* 2. Login Form Content Below Hero */}
      <div className="w-full max-w-md px-6 pt-6">
        <h1 className="text-2xl font-extrabold text-center text-zinc-900">
          {ak ? 'အကောင့်ဝင်ရန်' : 'Log In'}
        </h1>
        <p className="text-sm text-zinc-500 text-center mt-1 mb-7 font-medium">
          {ak ? 'ဖေ့သာ ဝေါလက်မှ ကြိုဆိုပါသည်' : 'Welcome to Pethar Wallet'}
        </p>

        {loginSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{ak ? 'အကောင့်ဝင်ပြီးပါပြီ။ ဒက်ရှ်ဘုတ်သို့ ပို့နေသည်...' : 'Signed in. Redirecting to dashboard…'}</span>
          </div>
        )}

        {toastMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
              {ak ? 'အီးမေးလ်' : 'Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ak ? 'သင်၏ အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email'}
              className="w-full px-5 py-3.5 rounded-full bg-white border border-zinc-200 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#F97316]"
              autoComplete="email"
              required
            />
          </div>

          {/* PIN */}
          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
              {ak ? '၆ လုံးပါ ပင်နံပါတ်' : 'PIN'}
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={ak ? 'ပင်နံပါတ် ၆ လုံး ရိုက်ထည့်ပါ' : 'Enter your PIN'}
                className="w-full px-5 py-3.5 pr-12 rounded-full bg-white border border-zinc-200 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#F97316]"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="absolute right-4 top-3.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forget Password link in orange on right */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('')
                setForgotEmail(email)
                setView('forgot_email')
              }}
              className="text-[#F97316] font-bold text-[13.5px] cursor-pointer hover:underline"
            >
              {ak ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forget Password?'}
            </button>
          </div>

          {/* Log In Button (Soft peach when empty, vibrant orange when ready) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || loginSuccess || !canLoginSubmit}
              className={`w-full py-3.5 rounded-full text-white font-bold text-base transition shadow-sm cursor-pointer ${
                canLoginSubmit ? 'bg-[#F97316] hover:bg-[#ea580c]' : 'bg-[#FED7AA] cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 mx-auto rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <span>{ak ? 'အကောင့်ဝင်မည်' : 'Log In'}</span>
              )}
            </button>
          </div>
        </form>

        {/* Don't have an account? Register */}
        <p className="text-center text-sm text-zinc-600 mt-7">
          {ak ? 'အကောင့်မရှိသေးပါသလား? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => goToAuth('signup')}
            className="font-bold text-[#F97316] hover:underline cursor-pointer ml-1"
          >
            {ak ? 'အကောင့်ဖွင့်မည်' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
