import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import type { Language } from '../../i18n'
import { goToDashboard, goToAuth } from '../../utils/subdomain'
import { ArakanEmblem, FlagArakan } from '../../components/ArakanEmblem'
import {
  generateOtpForEmail,
  verifyEmailOtp,
  registerWithEmailAndPin,
} from '../../services/walletDatabase'
import {
  Eye, EyeOff, CheckCircle2, AlertCircle,
  ArrowLeft, Clock, RefreshCw, Check
} from 'lucide-react'


// Great Britain Flag SVG
const FlagGB = ({ width = 18 }: { width?: number }) => {
  const height = Math.round((width * 2) / 3)
  return (
    <svg viewBox="0 0 60 40" width={width} height={height} className="rounded-xs shrink-0 overflow-hidden">
      <clipPath id="gb-flag-clip-signup">
        <path d="M0,0 v40 h60 v-40 z" />
      </clipPath>
      <clipPath id="gb-flag-diag-signup">
        <path d="M30,20 L60,40 H0 z M30,20 L60,0 H0 z" />
      </clipPath>
      <g clipPath="url(#gb-flag-clip-signup)">
        <path d="M0,0 v40 h60 v-40 z" fill="#012169" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
        <path d="M0,0 L60,40 M60,0 L0,40" clipPath="url(#gb-flag-diag-signup)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v40 M0,20 h60" stroke="#fff" strokeWidth="12" />
        <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  )
}

interface SignupPageProps {
  lang: Language
}

export const SignupPage = ({ lang }: SignupPageProps) => {
  const navigate = useNavigate()
  const [currentLang, setCurrentLang] = useState<Language>(lang)
  const ak = currentLang === 'ak'

  // Signup Multi-Step: 1. credentials -> 2. otp -> 3. profile (KYC Lvl 1)
  const [step, setStep] = useState<'credentials' | 'otp' | 'profile'>('credentials')

  // Form Fields
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)

  // Step 3 Profile Fields
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')

  // Step 2 OTP Fields
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [generatedOtpHint, setGeneratedOtpHint] = useState<string | null>(null)

  // 10-minute timer for OTP
  const [timerSeconds, setTimerSeconds] = useState(600) // 10 minutes = 600s
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [, setIsOtpExpired] = useState(false)

  // Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)

  // Auto redirect if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('pethar_logged_in') === 'true'
    if (isLoggedIn) {
      goToDashboard(currentLang, navigate)
    }
  }, [currentLang, navigate])

  // 10-minute OTP countdown timer
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

  const startOtpCountdown = () => {
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
      document.getElementById(`signup-otp-${idx + 1}`)?.focus()
    }
  }

  // STEP 1 SUBMIT: Validate Credentials -> Send OTP -> Step 2
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setErrorMsg(ak ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter a valid email address')
      return
    }
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setErrorMsg(ak ? 'PIN ကုဒ်သည် ၆ လုံး ဂဏန်း ဖြစ်ရပါမည်' : 'Security PIN must be exactly 6 digits')
      return
    }
    if (pin !== confirmPin) {
      setErrorMsg(ak ? 'PIN ကုဒ် နှစ်ကြိမ် ရိုက်ထည့်မှု မကိုက်ညီပါ' : 'PIN confirmation does not match')
      return
    }

    setErrorMsg('')
    const code = generateOtpForEmail(email.trim())
    setGeneratedOtpHint(code)
    startOtpCountdown()
    setStep('otp')
  }

  // STEP 2 SUBMIT: Verify OTP -> Step 3
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault()
    const entered = otpCode.join('')
    if (entered.length !== 6) {
      setErrorMsg(ak ? '၆ လုံး ဂဏန်း OTP ကုဒ် အပြည့်အစုံ ရိုက်ထည့်ပါ' : 'Please enter the complete 6-digit OTP code')
      return
    }

    const res = verifyEmailOtp(email.trim(), entered)
    if (res.valid) {
      setErrorMsg('')
      const derived = email.split('@')[0]
      setUsername(`@${derived}`)
      setFullName(derived.charAt(0).toUpperCase() + derived.slice(1))
      setStep('profile')
    } else {
      setErrorMsg(
        res.reason === 'expired'
          ? (ak ? 'OTP သက်တမ်းကုန်သွားပါပြီ' : 'OTP verification code has expired')
          : (ak ? 'OTP ကုဒ် မှားယွင်းနေပါသည်' : 'Invalid OTP verification code')
      )
    }
  }

  // Resend OTP
  const handleResendOtp = () => {
    setErrorMsg('')
    const code = generateOtpForEmail(email.trim())
    setGeneratedOtpHint(code)
    startOtpCountdown()
    setOtpCode(['', '', '', '', '', ''])
    setToastMsg(ak ? 'OTP အသစ် ပြန်ပို့ပြီးပါပြီ (၁၀ မိနစ် သက်တမ်းရှိ)' : 'New 10-minute OTP sent to your email!')
    setTimeout(() => setToastMsg(''), 3000)
  }

  // STEP 3 SUBMIT: Save Profile -> Complete KYC Lvl 1 -> Dashboard
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setErrorMsg(ak ? 'သင့်အမည် အပြည့်အစုံ ရိုက်ထည့်ပါ' : 'Please enter your full legal name')
      return
    }
    if (!username.trim()) {
      setErrorMsg(ak ? 'အသုံးပြုသူအမည် ရိုက်ထည့်ပါ' : 'Please choose a unique username')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    try {
      const res = await registerWithEmailAndPin({
        email: email.trim(),
        pin: pin.trim(),
        name: fullName.trim(),
        username: username.trim(),
      })

      setIsLoading(false)
      if (res.success) {
        setSignupSuccess(true)
        localStorage.setItem('pethar_logged_in', 'true')
        setTimeout(() => goToDashboard(currentLang, navigate), 800)
      } else {
        setErrorMsg(res.error || (ak ? 'အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ' : 'Failed to register account'))
      }
    } catch {
      setIsLoading(false)
      setErrorMsg(ak ? 'ဆာဗာ ချိတ်ဆက်မှု မအောင်မြင်ပါ' : 'Network error during registration')
    }
  }

  // PIN Criteria checks for Image 2 style
  const isPinLengthValid = pin.length === 6
  const isPinNumeric = /^\d+$/.test(pin)
  const isPinMatch = confirmPin.length > 0 && confirmPin === pin
  const canRegisterSubmit = email.includes('@') && isPinLengthValid && isPinNumeric && isPinMatch

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pb-12 font-sans">
      {/* 1. Curved Gradient Hero Banner */}
      <div className="w-full relative overflow-hidden bg-gradient-to-br from-[#280C48] via-[#86163C] to-[#DD3347] pb-10 pt-4 px-6 rounded-b-[42px] shadow-sm">
        <div className="max-w-md mx-auto relative z-10">
          {/* Top Row: Back button (if step > 1) & Language Toggle Pill on right */}
          <div className="flex items-center justify-between pb-5">
            {step !== 'credentials' ? (
              <button
                type="button"
                onClick={() => setStep(step === 'profile' ? 'otp' : 'credentials')}
                className="p-1 text-white hover:text-white/80 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-6" />
            )}

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
            <div className="p-1 rounded-full bg-white shadow-md">
              <ArakanEmblem size={44} />
            </div>
            <span className="text-white font-black tracking-tight text-3xl">
              Péthar
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="w-full max-w-md px-6 pt-6">
        {signupSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{ak ? 'အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်! ဒက်ရှ်ဘုတ်သို့ ပို့နေသည်...' : 'Account registered! Entering dashboard…'}</span>
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

        {/* STEP 1: CREDENTIALS (IMAGE 2) */}
        {step === 'credentials' && (
          <div>
            <h1 className="text-2xl font-extrabold text-center text-zinc-900 tracking-tight">
              {ak ? 'အကောင့်သစ်ဖွင့်ရန်' : 'Register Your Account'}
            </h1>
            <p className="text-sm text-zinc-500 text-center mt-1 mb-7 font-medium">
              {ak ? 'အကောင့်ရှိပြီးသားလား? ' : 'Already have an account? '}
              <button
                type="button"
                onClick={() => goToAuth('login')}
                className="font-bold text-[#F97316] hover:underline cursor-pointer ml-1"
              >
                {ak ? 'အကောင့်ဝင်မည်' : 'Log In'}
              </button>
            </p>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
                  {ak ? 'အီးမေးလ်' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ak ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email'}
                  className="w-full px-5 py-3.5 rounded-full bg-white border border-zinc-200 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#F97316]"
                  required
                />
              </div>

              {/* PIN (Image 2 style) */}
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
                    className={`w-full px-5 py-3.5 pr-12 rounded-full bg-white border text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#F97316] ${
                      pin.length === 0
                        ? 'border-zinc-200'
                        : isPinLengthValid
                        ? 'border-emerald-500'
                        : 'border-red-400'
                    }`}
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

                {/* Validation Checklist (Image 2 exact style) */}
                <div className="mt-2 text-xs space-y-1">
                  {pin.length === 0 && (
                    <div className="text-red-500 font-semibold pl-1">
                      {ak ? 'ပင်နံပါတ် လိုအပ်ပါသည်' : 'Required'}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 pl-1">
                    <span className={isPinLengthValid ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                      {isPinLengthValid ? '✓' : '✕'}
                    </span>
                    <span className={isPinLengthValid ? 'text-emerald-700' : 'text-zinc-500'}>
                      {ak ? 'ဂဏန်း ၆ လုံး တိကျစွာ' : 'Exactly 6 digits'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-1">
                    <span className={pin.length > 0 && isPinNumeric ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                      {pin.length > 0 && isPinNumeric ? '✓' : '✕'}
                    </span>
                    <span className={pin.length > 0 && isPinNumeric ? 'text-emerald-700' : 'text-zinc-500'}>
                      {ak ? 'ဂဏန်းများသာ (0-9)' : 'Numbers only (0-9)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
                  {ak ? 'ပင်နံပါတ် အတည်ပြုပါ' : 'Confirm PIN'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={ak ? 'ပင်နံပါတ် အတည်ပြုပါ' : 'Confirm PIN'}
                    className={`w-full px-5 py-3.5 pr-12 rounded-full bg-white border text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#F97316] ${
                      confirmPin.length === 0
                        ? 'border-zinc-200'
                        : isPinMatch
                        ? 'border-emerald-500'
                        : 'border-red-400'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin((v) => !v)}
                    className="absolute right-4 top-3.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPin.length > 0 && (
                  <div className="mt-1 pl-1 text-xs flex items-center gap-1.5">
                    <span className={isPinMatch ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                      {isPinMatch ? '✓' : '✕'}
                    </span>
                    <span className={isPinMatch ? 'text-emerald-700' : 'text-zinc-500'}>
                      {ak ? 'ပင်နံပါတ် ကိုက်ညီပါသည်' : 'PINs match'}
                    </span>
                  </div>
                )}
              </div>

              {/* Register Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={!canRegisterSubmit}
                  className={`w-full py-3.5 rounded-full text-white font-bold text-base transition shadow-sm cursor-pointer ${
                    canRegisterSubmit ? 'bg-[#F97316] hover:bg-[#ea580c]' : 'bg-[#FED7AA] cursor-not-allowed'
                  }`}
                >
                  <span>{ak ? 'အကောင့်ဖွင့်မည်' : 'Register'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
          <form onSubmit={handleStep2Submit} className="space-y-6 pt-2">
            <div>
              <h1 className="text-2xl font-extrabold text-center text-zinc-900 tracking-tight">
                {ak ? 'အီးမေးလ် အတည်ပြုရန်' : 'Verify Your Email'}
              </h1>
              <p className="text-xs text-zinc-500 text-center mt-1">
                {ak ? `${email} သို့ ပို့ထားသော ၆ လုံးပါ ကုဒ်ကို ရိုက်ထည့်ပါ` : `Enter the 6-digit code sent to ${email}`}
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
                  id={`signup-otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                  className="w-12 h-14 text-center text-xl font-mono font-black rounded-2xl bg-zinc-50 border-2 border-zinc-200 focus:border-[#F97316] focus:outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-base transition shadow-sm cursor-pointer"
            >
              {ak ? 'ကုဒ် အတည်ပြုမည်' : 'Verify Code'}
            </button>
          </form>
        )}

        {/* STEP 3: IDENTITY / KYC LEVEL 1 */}
        {step === 'profile' && (
          <form onSubmit={handleStep3Submit} className="space-y-5 pt-2">
            <div>
              <h1 className="text-2xl font-extrabold text-center text-zinc-900 tracking-tight">
                {ak ? 'အမည်နှင့် အသုံးပြုသူအမည်' : 'Complete Your Profile'}
              </h1>
              <p className="text-xs text-zinc-500 text-center mt-1">
                {ak ? 'အီးမေးလ် အတည်ပြုပြီးပါပြီ။ KYC Level 1 အတွက် အမည်ဖြည့်စွက်ပါ' : 'Email verified! Complete your profile to activate KYC Level 1.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
                {ak ? 'အမည် အပြည့်အစုံ' : 'Full Name'}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kyaw Min"
                className="w-full px-5 py-3.5 rounded-full bg-white border border-zinc-200 text-sm font-medium text-zinc-900 focus:outline-none focus:border-[#F97316]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
                {ak ? 'အသုံးပြုသူအမည်' : 'Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full px-5 py-3.5 rounded-full bg-white border border-zinc-200 text-sm font-medium text-zinc-900 focus:outline-none focus:border-[#F97316]"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-base transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>{ak ? 'အကောင့်ဖွင့်ခြင်း ပြီးစီးမည်' : 'Complete & Open Wallet'}</span>
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default SignupPage
