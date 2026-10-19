import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ArakanEmblem } from '../../components/ArakanEmblem'
import type { Language } from '../../i18n'
import { goToDashboard, goToAuth } from '../../utils/subdomain'
import {
  generateOtpForEmail,
  verifyEmailOtp,
  registerWithEmailAndPin,
} from '../../services/walletDatabase'
import {
  Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound,
  Mail, ArrowRight, ArrowLeft, Clock, RefreshCw, User, Check, ShieldCheck
} from 'lucide-react'

interface SignupPageProps {
  lang: Language
}

export const SignupPage = ({ lang }: SignupPageProps) => {
  const navigate = useNavigate()
  const ak = lang === 'ak'

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
  const [isOtpExpired, setIsOtpExpired] = useState(false)

  // Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)

  // Auto redirect if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('pethar_logged_in') === 'true'
    if (isLoggedIn) {
      goToDashboard(lang, navigate)
    }
  }, [lang, navigate])

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

  // Step 1: Submit Credentials
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const cleanEmail = email.trim()
    const cleanPin = pin.trim()
    const cleanConfirm = confirmPin.trim()

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg(ak ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter a valid email address')
      return
    }
    if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      setErrorMsg(ak ? 'PIN ကုဒ်သည် ဂဏန်း ၆ လုံး ဖြစ်ရပါမည်' : 'PIN code must be exactly 6 digits')
      return
    }
    if (cleanPin !== cleanConfirm) {
      setErrorMsg(ak ? 'PIN ကုဒ် နှစ်ခု မတူညီပါ' : 'PIN codes do not match')
      return
    }

    const code = generateOtpForEmail(cleanEmail)
    setGeneratedOtpHint(code)
    startOtpCountdown()
    setOtpCode(['', '', '', '', '', ''])
    setStep('otp')
  }

  // Step 2: Submit OTP
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const enteredOtp = otpCode.join('')
    if (enteredOtp.length !== 6) {
      setErrorMsg(ak ? 'ဂဏန်း ၆ လုံး OTP ကုဒ် အပြည့်အစုံ ရိုက်ထည့်ပါ' : 'Please enter the complete 6-digit OTP code')
      return
    }

    if (isOtpExpired) {
      setErrorMsg(ak ? 'OTP ကုဒ် သက်တမ်းကုန်ဆုံးသွားပါပြီ (၁၀ မိနစ်)' : 'OTP code expired after 10 minutes. Please resend.')
      return
    }

    const verifyRes = verifyEmailOtp(email.trim(), enteredOtp)
    if (!verifyRes.valid) {
      setErrorMsg(
        verifyRes.reason === 'expired'
          ? ak ? 'OTP ကုဒ် သက်တမ်းကုန်ဆုံးသွားပါပြီ (၁၀ မိနစ်)' : 'OTP code has expired (10 min limit). Please resend.'
          : ak ? 'OTP ကုဒ် မှားယွင်းနေပါသည်' : 'Incorrect OTP verification code. Please check your email.'
      )
      return
    }

    // Advance to Step 3 Profile setup
    setStep('profile')
  }

  // Resend OTP
  const handleResendOtp = () => {
    setErrorMsg('')
    const code = generateOtpForEmail(email.trim())
    setGeneratedOtpHint(code)
    startOtpCountdown()
    setOtpCode(['', '', '', '', '', ''])
    setToastMsg(ak ? 'OTP ကုဒ် အသစ် ပို့ပြီးပါပြီ (၁၀ မိနစ် သက်တမ်းရှိ)' : 'New OTP code sent! Valid for 10 minutes.')
    setTimeout(() => setToastMsg(''), 3000)
  }

  // Step 3: Submit Profile (KYC Level 1 activation)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!fullName.trim()) {
      setErrorMsg(ak ? 'သင့်အမည် အပြည့်အစုံ ရိုက်ထည့်ပါ' : 'Please enter your full name')
      return
    }
    if (!username.trim()) {
      setErrorMsg(ak ? 'အသုံးပြုသူ အမည် (Username) ရိုက်ထည့်ပါ' : 'Please choose a username')
      return
    }

    setIsLoading(true)
    try {
      const regRes = await registerWithEmailAndPin({
        email: email.trim(),
        pin: pin.trim(),
        name: fullName.trim(),
        username: username.trim(),
      })

      if (regRes.success) {
        setSignupSuccess(true)
        localStorage.setItem('pethar_logged_in', 'true')
        setTimeout(() => {
          setIsLoading(false)
          goToDashboard(lang, navigate)
        }, 800)
      } else {
        setIsLoading(false)
        setErrorMsg(regRes.error || (ak ? 'အကောင့်ဖွင့်၍ မရပါ။ ပြန်လည်ကြိုးစားပါ' : 'Failed to register account. Please retry.'))
      }
    } catch (err: any) {
      setIsLoading(false)
      setErrorMsg(err.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col items-center justify-center px-4 py-12">
      <button
        type="button"
        onClick={() => (window.location.href = '/')}
        className="mb-8 flex items-center gap-2 cursor-pointer"
      >
        <ArakanEmblem size={36} variant="badge" />
        <span className="font-extrabold text-lg text-zinc-900">Péthar</span>
      </button>

      <div className="w-full max-w-md bg-white rounded-[1.75rem] border border-stone-200 p-7 sm:p-8 shadow-sm">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-5 border-b border-stone-100 mb-6">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                step === 'credentials'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {step !== 'credentials' ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <div className="w-8 h-0.5 bg-stone-200" />
            <span
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                step === 'otp'
                  ? 'bg-zinc-900 text-white'
                  : step === 'profile'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-stone-100 text-stone-400'
              }`}
            >
              {step === 'profile' ? <Check className="w-3.5 h-3.5" /> : '2'}
            </span>
            <div className="w-8 h-0.5 bg-stone-200" />
            <span
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                step === 'profile' ? 'bg-zinc-900 text-white' : 'bg-stone-100 text-stone-400'
              }`}
            >
              3
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>KYC Level 1</span>
          </div>
        </div>

        {signupSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{ak ? 'အကောင့်ဖွင့်ပြီးပါပြီ။ ဒက်ရှ်ဘုတ်သို့ ပို့နေသည်...' : 'Account created! Redirecting to dashboard…'}</span>
          </div>
        )}

        {toastMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#D91624] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#D91624]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Email & 6-Digit PIN */}
        {step === 'credentials' && (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-stone-900">
                {ak ? 'အကောင့်အသစ် ဖွင့်ရန်' : 'Create an Account'}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                {ak
                  ? 'အီးမေးလ်နှင့် လုံခြုံရေး ၆ လုံး PIN ကုဒ် ထည့်သွင်းပါ'
                  : 'Enter your email address and create a 6-digit PIN code'}
              </p>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {ak ? 'အီးမေးလ် လိပ်စာ' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {ak ? '၆ လုံး PIN ကုဒ် အသစ်' : 'Create 6-Digit PIN'}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium tracking-widest focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {ak ? 'PIN ကုဒ် အတည်ပြု ထပ်ရိုက်ပါ' : 'Confirm 6-Digit PIN'}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium tracking-widest focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm mt-2"
              >
                <span>{ak ? 'ဆက်လက်လုပ်ဆောင်ရန် (OTP ပို့ရန်)' : 'Continue to Email OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-sm text-stone-500 mt-6 pt-5 border-t border-stone-100">
              {ak ? 'အကောင့်ရှိပြီးသားလား?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => goToAuth('login')}
                className="font-bold text-zinc-900 hover:underline cursor-pointer"
              >
                {ak ? 'အကောင့်ဝင်ရန်' : 'Log in'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Email OTP Verification (10-minute validity) */}
        {step === 'otp' && (
          <div>
            <button
              type="button"
              onClick={() => {
                setStep('credentials')
                setErrorMsg('')
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{ak ? 'အီးမေးလ် ပြန်ပြင်ရန်' : 'Back to email'}</span>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-extrabold text-stone-900">
                {ak ? 'အီးမေးလ် အတည်ပြုကုဒ် ရိုက်ထည့်ပါ' : 'Verify Your Email'}
              </h1>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                {ak
                  ? `ဂဏန်း ၆ လုံးပါသော OTP ကုဒ်ကို ${email} သို့ ပို့ထားပါသည်`
                  : `Enter the 6-digit verification OTP code sent to ${email}`}
              </p>
            </div>

            {/* Simulated OTP banner */}
            {generatedOtpHint && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
                <span className="font-bold">{ak ? 'အီးမေးလ် အတည်ပြုကုဒ်:' : 'Verification OTP:'} </span>
                <span className="font-mono font-black text-sm tracking-widest">{generatedOtpHint}</span>
                <span className="text-blue-600 block mt-0.5 text-[11px]">
                  {ak ? '(၁၀ မိနစ်အတွင်း အသုံးပြုပါ)' : '(Valid for 10 minutes)'}
                </span>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 text-center mb-2">
                  {ak ? '၆ လုံး OTP ကုဒ်' : '6-Digit OTP Code'}
                </label>
                <div className="flex justify-center gap-2">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`signup-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                      className="w-11 h-13 text-center text-xl font-bold font-mono rounded-xl bg-stone-50 border-2 border-stone-200 focus:border-stone-900 focus:bg-white focus:outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* 10 Minute Timer Display */}
              <div className="flex items-center justify-center gap-1.5 text-xs py-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span className={`font-mono font-bold ${timerSeconds < 60 ? 'text-[#D91624]' : 'text-stone-600'}`}>
                  {formatTimer(timerSeconds)}
                </span>
                <span className="text-stone-400 text-[11px]">
                  {isOtpExpired
                    ? ak ? '(သက်တမ်းကုန်ဆုံးပါပြီ)' : '(Expired)'
                    : ak ? '(၁၀ မိနစ် သက်တမ်း)' : '(10 min limit)'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isOtpExpired || otpCode.join('').length !== 6}
                className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-40"
              >
                <span>{ak ? 'အတည်ပြုပြီး အမည်ဖြည့်ရန်' : 'Verify & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{ak ? 'အီးမေးလ်သို့ ကုဒ် ပြန်ပို့ပါ' : 'Resend OTP to Email'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Full Name & Username (KYC Level 1) */}
        {step === 'profile' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-extrabold text-stone-900">
                {ak ? 'ပရိုဖိုင် အချက်အလက် ဖြည့်ပါ' : 'Setup Your Profile'}
              </h1>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                {ak
                  ? 'အီးမေးလ် အတည်ပြုပြီးပါပြီ။ နာမည်နှင့် Username ဖြည့်ပြီး KYC Level 1 စတင်ပါ'
                  : 'Email verified! Enter your name and username to complete KYC Level 1.'}
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {ak ? 'အမည် အပြည့်အစုံ' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {ak ? 'အသုံးပြုသူ အမည် (Username)' : 'Username'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    required
                    placeholder="username"
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>{ak ? 'KYC အဆင့် အချက်အလက်များ' : 'KYC Tier Structure'}</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  {ak
                    ? '• KYC Level 1 (အီးမေးလ် စစ်ဆေးပြီး) ကို ဤအဆင့်ပြီးပါက ချက်ချင်း ရရှိပါမည်။\n• KYC Level 2 (နိုင်ငံသား မှတ်ပုံတင်) အတွက် ပင်မစာမျက်နှာမှတစ်ဆင့် လျှောက်ထားနိုင်ပါသည်။'
                    : '• Level 1 (Email Verified): Granted immediately upon completing this step.\n• Level 2 (National ID Verified): Requires ID submission under Settings/Dashboard.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || signupSuccess}
                className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{ak ? 'အကောင့်ဖွင့်ပြီး ဝင်ရောက်ရန်' : 'Complete Registration'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
