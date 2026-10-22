import React, { useState, useEffect } from 'react'
import {
  X, Eye, EyeOff, ShieldCheck, Mail,
  KeyRound, AlertCircle, CheckCircle2, ArrowRight,
  ArrowLeft, RefreshCw, Clock, User, Check
} from 'lucide-react'
import { ArakanEmblem } from './ArakanEmblem'
import type { Language } from '../i18n'
import {
  authenticateWithEmailAndPin,
  registerWithEmailAndPin,
  generateOtpForEmail,
  verifyEmailOtp,
  resetPinWithEmail,
  type DbUserProfile,
} from '../services/walletDatabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user?: DbUserProfile) => void
  initialMode?: 'login' | 'signup' | 'forgot_pin'
  lang: Language
}

type AuthFlowMode = 'login' | 'signup' | 'forgot_pin'

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  lang,
}) => {
  const [mode, setMode] = useState<AuthFlowMode>(initialMode)
  const isAk = lang === 'ak'

  // Form states
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)

  // Sign up profile step states (KYC Level 1)
  const [signUpStep, setSignUpStep] = useState<'credentials' | 'otp' | 'profile'>('credentials')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')

  // Forgot password states
  const [forgotStep, setForgotStep] = useState<'enter_email' | 'otp' | 'new_pin'>('enter_email')
  const [newPin, setNewPin] = useState('')
  const [confirmNewPin, setConfirmNewPin] = useState('')

  // OTP & Timer states (10 min expiry)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [generatedOtpHint, setGeneratedOtpHint] = useState<string | null>(null)
  const [timerSeconds, setTimerSeconds] = useState(600) // 10 minutes = 600s
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [isOtpExpired, setIsOtpExpired] = useState(false)

  // Status & Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successToast, setSuccessToast] = useState('')

  // Reset state when opening/mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setErrorMsg('')
      setSuccessToast('')
      setSignUpStep('credentials')
      setForgotStep('enter_email')
      setOtpCode(['', '', '', '', '', ''])
    }
  }, [isOpen, initialMode])

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

  if (!isOpen) return null

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

  // Handle OTP box inputs
  const handleOtpBoxChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1]
    const updated = [...otpCode]
    updated[index] = val
    setOtpCode(updated)

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`)
      prevInput?.focus()
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. LOGIN SUBMIT HANDLER
  // ─────────────────────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessToast('')

    const cleanEmail = email.trim()
    const cleanPin = pin.trim()

    if (!cleanEmail) {
      setErrorMsg(isAk ? 'အီးမေးလ် ထည့်သွင်းပါ' : 'Please enter your email address')
      return
    }
    if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      setErrorMsg(isAk ? '၆ လုံး ဂဏန်း PIN ကုဒ် ထည့်သွင်းပါ' : 'Please enter a valid 6-digit PIN code')
      return
    }

    setIsLoading(true)
    try {
      const result = await authenticateWithEmailAndPin(cleanEmail, cleanPin)
      if (result.success && result.user) {
        setSuccessToast(isAk ? 'အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ' : 'Login successful! Redirecting to app...')
        setTimeout(() => {
          setIsLoading(false)
          onSuccess(result.user)
        }, 600)
      } else {
        setIsLoading(false)
        setErrorMsg(
          isAk
            ? 'အီးမေးလ် သို့မဟုတ် ၆ လုံး PIN ကုဒ် မှားယွင်းနေပါသည်။'
            : 'Incorrect email address or 6-digit PIN code. Please check and try again.'
        )
      }
    } catch {
      setIsLoading(false)
      setErrorMsg(
        isAk
          ? 'အီးမေးလ် သို့မဟုတ် ၆ လုံး PIN ကုဒ် မှားယွင်းနေပါသည်။'
          : 'Incorrect email address or 6-digit PIN code. Please check and try again.'
      )
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. SIGN UP FLOW (Credentials -> OTP verification -> Name & Username = KYC 1)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSignUpCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const cleanEmail = email.trim()
    const cleanPin = pin.trim()
    const cleanConfirm = confirmPin.trim()

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg(isAk ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter a valid email address')
      return
    }
    if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      setErrorMsg(isAk ? 'PIN ကုဒ်သည် ဂဏန်း ၆ လုံး ဖြစ်ရပါမည်' : 'PIN code must be exactly 6 digits')
      return
    }
    if (cleanPin !== cleanConfirm) {
      setErrorMsg(isAk ? 'PIN ကုဒ် နှစ်ခု မတူညီပါ' : 'PIN codes do not match')
      return
    }

    // Generate 10-minute OTP
    const code = generateOtpForEmail(cleanEmail)
    setGeneratedOtpHint(code)
    startOtpCountdown()
    setOtpCode(['', '', '', '', '', ''])
    setSignUpStep('otp')
  }

  const handleSignUpOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const enteredOtp = otpCode.join('')
    if (enteredOtp.length !== 6) {
      setErrorMsg(isAk ? 'ဂဏန်း ၆ လုံး OTP ကုဒ် အပြည့်အစုံ ရိုက်ထည့်ပါ' : 'Please enter the complete 6-digit OTP code')
      return
    }

    if (isOtpExpired) {
      setErrorMsg(isAk ? 'OTP ကုဒ် သက်တမ်းကုန်ဆုံးသွားပါပြီ။ အသစ်ပြန်ပို့ပါ' : 'OTP code has expired after 10 minutes. Please resend.')
      return
    }

    const verifyRes = verifyEmailOtp(email, enteredOtp)
    if (!verifyRes.valid) {
      setErrorMsg(
        verifyRes.reason === 'expired'
          ? isAk ? 'OTP ကုဒ် သက်တမ်းကုန်ဆုံးသွားပါပြီ' : 'OTP code has expired (10 min limit). Please resend.'
          : isAk ? 'OTP ကုဒ် မှားယွင်းနေပါသည်' : 'Incorrect OTP verification code. Please check your email.'
      )
      return
    }

    // OTP Verified! Advance to Name & Username setup (completes KYC Level 1)
    setSignUpStep('profile')
  }

  const handleSignUpProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!fullName.trim()) {
      setErrorMsg(isAk ? 'သင့်အမည် အပြည့်အစုံ ရိုက်ထည့်ပါ' : 'Please enter your full name')
      return
    }
    if (!username.trim()) {
      setErrorMsg(isAk ? 'အသုံးပြုသူ အမည် (Username) ရိုက်ထည့်ပါ' : 'Please choose a username')
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

      if (regRes.success && regRes.user) {
        setSuccessToast(isAk ? 'အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ KYC Level 1 စတင်ပါပြီ' : 'Account created with KYC Level 1 (Email Verified)!')
        setTimeout(() => {
          setIsLoading(false)
          onSuccess(regRes.user)
        }, 700)
      } else {
        setIsLoading(false)
        setErrorMsg(regRes.error || (isAk ? 'အကောင့်ဖွင့်၍ မရပါ။ ပြန်လည်ကြိုးစားပါ' : 'Failed to create account. Please retry.'))
      }
    } catch (err: any) {
      setIsLoading(false)
      setErrorMsg(err.message || 'Registration failed')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. FORGOT PASSWORD / PIN FLOW (Email -> 10min OTP -> New PIN -> Back to Login)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleForgotEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(isAk ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter a valid registered email address')
      return
    }

    const code = generateOtpForEmail(email.trim())
    setGeneratedOtpHint(code)
    startOtpCountdown()
    setOtpCode(['', '', '', '', '', ''])
    setForgotStep('otp')
  }

  const handleForgotOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const enteredOtp = otpCode.join('')
    if (enteredOtp.length !== 6) {
      setErrorMsg(isAk ? 'ဂဏန်း ၆ လုံး OTP ကုဒ် အပြည့်အစုံ ရိုက်ထည့်ပါ' : 'Please enter the 6-digit OTP code')
      return
    }

    if (isOtpExpired) {
      setErrorMsg(isAk ? 'OTP ကုဒ် သက်တမ်းကုန်ဆုံးသွားပါပြီ။ အသစ်ပြန်ပို့ပါ' : 'OTP code has expired after 10 minutes. Please resend.')
      return
    }

    const verifyRes = verifyEmailOtp(email, enteredOtp)
    if (!verifyRes.valid) {
      setErrorMsg(
        verifyRes.reason === 'expired'
          ? isAk ? 'OTP ကုဒ် သက်တမ်းကုန်ဆုံးသွားပါပြီ (၁၀ မိနစ်)' : 'OTP code expired after 10 minutes. Please resend.'
          : isAk ? 'OTP ကုဒ် မှားယွင်းနေပါသည်' : 'Incorrect verification code. Please check your email.'
      )
      return
    }

    setForgotStep('new_pin')
  }

  const handleForgotNewPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const cleanNewPin = newPin.trim()
    const cleanConfirm = confirmNewPin.trim()

    if (cleanNewPin.length !== 6 || !/^\d{6}$/.test(cleanNewPin)) {
      setErrorMsg(isAk ? 'PIN ကုဒ်အသစ်သည် ဂဏန်း ၆ လုံး ဖြစ်ရပါမည်' : 'New PIN must be exactly 6 digits')
      return
    }
    if (cleanNewPin !== cleanConfirm) {
      setErrorMsg(isAk ? 'PIN ကုဒ်အသစ် နှစ်ခု မတူညီပါ' : 'PIN confirmation does not match')
      return
    }

    setIsLoading(true)
    try {
      const resetRes = await resetPinWithEmail(email.trim(), cleanNewPin)
      setIsLoading(false)
      if (resetRes.success) {
        setSuccessToast(isAk ? 'PIN အသစ် သတ်မှတ်ပြီးပါပြီ။ ကျေးဇူးပြု၍ ပြန်လည်ဝင်ရောက်ပါ' : 'PIN successfully reset! Please log in with your new PIN.')
        setPin('')
        setNewPin('')
        setConfirmNewPin('')
        setTimeout(() => {
          setMode('login')
          setForgotStep('enter_email')
        }, 1200)
      } else {
        setErrorMsg(resetRes.error || (isAk ? 'PIN ပြောင်းလဲ၍ မရပါ' : 'Could not reset PIN'))
      }
    } catch (err: any) {
      setIsLoading(false)
      setErrorMsg(err.message || 'Error updating PIN')
    }
  }

  const handleResendOtp = () => {
    setErrorMsg('')
    const code = generateOtpForEmail(email.trim())
    setGeneratedOtpHint(code)
    startOtpCountdown()
    setOtpCode(['', '', '', '', '', ''])
    setSuccessToast(isAk ? 'OTP ကုဒ်အသစ် အီးမေးလ်သို့ ပို့ပြီးပါပြီ (၁၀ မိနစ် သက်တမ်းရှိ)' : 'New OTP sent to your email (valid for 10 minutes)!')
    setTimeout(() => setSuccessToast(''), 3000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-[440px] w-full relative shadow-2xl border border-zinc-100 overflow-hidden text-zinc-900">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D91624] via-amber-500 to-[#D91624]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <ArakanEmblem size={34} variant="badge" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-zinc-900 tracking-tight text-lg">Péthar</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold border border-amber-200/80 uppercase">
                Secure Wallet
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              {isAk ? 'အာရက္ခဒစ်ဂျစ်တယ် ဘဏ္ဍာရေးကွန်ရက်' : 'Arakan Digital Financial Network'}
            </p>
          </div>
        </div>

        {/* Alerts / Feedback */}
        {successToast && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#D91624] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Simulated OTP Hint banner for smooth local testing */}
        {generatedOtpHint && (mode === 'signup' && signUpStep === 'otp' || mode === 'forgot_pin' && forgotStep === 'otp') && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <span className="font-medium text-[11px]">{isAk ? 'အတည်ပြု OTP ကုဒ်:' : 'Verification OTP:'}</span>
            <span className="font-mono font-black text-sm tracking-widest text-[#D91624]">{generatedOtpHint}</span>
          </div>
        )}

        {/* Top Mode Tabs: Log In | Sign Up (Only shown when on primary credentials screens) */}
        {mode !== 'forgot_pin' && (signUpStep === 'credentials' || mode === 'login') && (
          <div className="flex border-b border-zinc-200 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setErrorMsg('')
              }}
              className={`flex-1 pb-3 text-center text-sm font-extrabold transition relative cursor-pointer ${
                mode === 'login' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {isAk ? 'အကောင့်ဝင်ရန်' : 'Log In'}
              {mode === 'login' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D91624] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setSignUpStep('credentials')
                setErrorMsg('')
              }}
              className={`flex-1 pb-3 text-center text-sm font-extrabold transition relative cursor-pointer ${
                mode === 'signup' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {isAk ? 'အကောင့်ဖွင့်ရန်' : 'Sign Up'}
              {mode === 'signup' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D91624] rounded-full" />
              )}
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MODE A: LOGIN (Email + 6-digit PIN)
        ═══════════════════════════════════════════════════════════════════ */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">
                {isAk ? 'အီးမေးလ် လိပ်စာ' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-3 pl-10 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-[#D91624]"
                  autoComplete="email"
                  required
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">
                {isAk ? '၆ လုံး ဂဏန်း PIN ကုဒ်' : '6-Digit Security PIN'}
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="w-full px-3.5 py-3 pl-10 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-mono font-bold tracking-widest text-zinc-900 focus:outline-none focus:border-[#D91624]"
                  autoComplete="current-password"
                  required
                />
                <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#D91624] hover:bg-[#B8121E] text-white font-extrabold text-sm shadow-md active:scale-98 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <span>{isAk ? 'အကောင့်ဝင်ရန်' : 'Log In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Forgot Password / PIN Button - right under credentials */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('')
                  setForgotStep('enter_email')
                  setMode('forgot_pin')
                }}
                className="text-xs font-bold text-[#D91624] hover:underline cursor-pointer inline-flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isAk ? 'စကားဝှက် / PIN မေ့နေပါသလား?' : 'Forgot Password / PIN?'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MODE B: SIGN UP (Step 1: Credentials -> Step 2: OTP -> Step 3: Name & Username)
        ═══════════════════════════════════════════════════════════════════ */}
        {mode === 'signup' && (
          <div>
            {/* Step 1: Enter Email and set 6-digit PIN */}
            {signUpStep === 'credentials' && (
              <form onSubmit={handleSignUpCredentialsSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">
                    {isAk ? 'အီးမေးလ် လိပ်စာ' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-3 pl-10 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-[#D91624]"
                      required
                    />
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">
                    {isAk ? '၆ လုံး PIN ကုဒ် သတ်မှတ်ပါ' : 'Create 6-Digit Security PIN'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className="w-full px-3.5 py-3 pl-10 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-mono font-bold tracking-widest text-zinc-900 focus:outline-none focus:border-[#D91624]"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPin((v) => !v)}
                      className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">
                    {isAk ? 'PIN ကုဒ် ထပ်ရိုက်အတည်ပြုပါ' : 'Confirm 6-Digit PIN'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      maxLength={6}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className="w-full px-3.5 py-3 pl-10 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-mono font-bold tracking-widest text-zinc-900 focus:outline-none focus:border-[#D91624]"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin((v) => !v)}
                      className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 rounded-full bg-[#D91624] hover:bg-[#B8121E] text-white font-extrabold text-sm shadow-md active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isAk ? 'အီးမေးလ် အတည်ပြုရန် ရှေ့ဆက်ပါ' : 'Continue to Email OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification (10-minute expiry with resend button) */}
            {signUpStep === 'otp' && (
              <form onSubmit={handleSignUpOtpSubmit} className="space-y-4">
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-extrabold text-zinc-900">
                    {isAk ? 'အီးမေးလ်သို့ ပို့ထားသော OTP ထည့်ပါ' : 'Verify Email Address'}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {isAk ? `${email} သို့ ၆ လုံး ဂဏန်းကုဒ် ပို့ထားပါသည်` : `We sent a 6-digit OTP code to ${email}`}
                  </p>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex justify-between gap-2 my-3">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-box-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-13 text-center text-lg font-mono font-black rounded-xl bg-zinc-50 border-2 border-zinc-200 focus:border-[#D91624] focus:outline-none"
                    />
                  ))}
                </div>

                {/* 10 Min Expiry Countdown Timer */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAk ? 'သက်တမ်းကုန်ဆုံးချိန်:' : 'Code expires in:'}</span>
                    <span className="font-mono font-bold text-zinc-800">{formatTimer(timerSeconds)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-xs font-bold text-[#D91624] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isAk ? 'အီးမေးလ် ပြန်ပို့ရန်' : 'Resend Email'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignUpStep('credentials')}
                    className="py-3 rounded-full border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-50 cursor-pointer"
                  >
                    {isAk ? 'ပြန်ပြင်မည်' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    className="py-3 rounded-full bg-[#D91624] text-white font-extrabold text-xs shadow-md hover:bg-[#B8121E] cursor-pointer"
                  >
                    {isAk ? 'အတည်ပြုမည်' : 'Verify Code'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Complete Name & Username (Activates KYC Level 1) */}
            {signUpStep === 'profile' && (
              <form onSubmit={handleSignUpProfileSubmit} className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-emerald-900">
                      {isAk ? 'KYC Level 1 (အီးမေးလ် အတည်ပြုပြီး)' : 'KYC Level 1 · Email Verified'}
                    </div>
                    <div className="text-[11px] text-emerald-700 leading-tight">
                      {isAk ? 'နာမည်နှင့် အသုံးပြုသူအမည် ထည့်သွင်းပြီး အကောင့်ကို အပြီးသတ်ပါ' : 'Set your name and username to activate your wallet'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">
                    {isAk ? 'အမည် အပြည့်အစုံ' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isAk ? 'အမည် အပြည့်အစုံ ရိုက်ထည့်ပါ' : 'Enter full name'}
                      className="w-full px-3.5 py-3 pl-10 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-[#D91624]"
                      required
                    />
                    <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">
                    {isAk ? 'အသုံးပြုသူ အမည် (Username)' : 'Username'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                      placeholder="username"
                      className="w-full px-3.5 py-3 pl-10 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-[#D91624]"
                      required
                    />
                    <span className="text-zinc-400 font-bold absolute left-3.5 top-3.5">@</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md active:scale-98 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <span>{isAk ? 'အကောင့်ဖွင့်ခြင်း ပြီးစီးပါပြီ' : 'Complete Registration'}</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MODE C: FORGOT PASSWORD / PIN FLOW
        ═══════════════════════════════════════════════════════════════════ */}
        {mode === 'forgot_pin' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setErrorMsg('')
                }}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-extrabold text-zinc-900">
                {isAk ? 'PIN ကုဒ် ပြန်လည်သတ်မှတ်ရန်' : 'Reset 6-Digit PIN'}
              </h3>
            </div>

            {/* Step 1: Enter Email */}
            {forgotStep === 'enter_email' && (
              <form onSubmit={handleForgotEmailSubmit} className="space-y-3.5">
                <p className="text-xs text-zinc-500">
                  {isAk
                    ? 'မှတ်ပုံတင်ထားသော အီးမေးလ်သို့ ၁၀ မိနစ် သက်တမ်းရှိ OTP အတည်ပြုကုဒ် ပို့ပေးပါမည်'
                    : 'Enter your registered email address. We will send a 10-minute OTP verification code.'}
                </p>

                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">
                    {isAk ? 'အီးမေးလ် လိပ်စာ' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-3 pl-10 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-[#D91624]"
                      required
                    />
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#D91624] hover:bg-[#B8121E] text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isAk ? 'OTP ကုဒ် ပို့မည်' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 2: Enter OTP Code */}
            {forgotStep === 'otp' && (
              <form onSubmit={handleForgotOtpSubmit} className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-xs text-zinc-500">
                    {isAk ? `${email} သို့ ပို့ထားသော ၆ လုံး ဂဏန်းကုဒ် ရိုက်ထည့်ပါ` : `Enter the 6-digit OTP code sent to ${email}`}
                  </p>
                </div>

                <div className="flex justify-between gap-2 my-3">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-box-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-13 text-center text-lg font-mono font-black rounded-xl bg-zinc-50 border-2 border-zinc-200 focus:border-[#D91624] focus:outline-none"
                    />
                  ))}
                </div>

                {/* 10 Min Expiry Countdown Timer */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAk ? 'သက်တမ်း:' : 'Expires in:'}</span>
                    <span className="font-mono font-bold text-zinc-800">{formatTimer(timerSeconds)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-xs font-bold text-[#D91624] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isAk ? 'အီးမေးလ် ပြန်ပို့ရန်' : 'Resend Email'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#D91624] text-white font-extrabold text-sm shadow-md hover:bg-[#B8121E] cursor-pointer"
                >
                  {isAk ? 'OTP အတည်ပြုမည်' : 'Verify Code'}
                </button>
              </form>
            )}

            {/* Step 3: Enter New 6-digit PIN and Confirm */}
            {forgotStep === 'new_pin' && (
              <form onSubmit={handleForgotNewPinSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">
                    {isAk ? '၆ လုံး PIN ကုဒ်အသစ်' : 'Create New 6-Digit PIN'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className="w-full px-3.5 py-3 pl-10 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-mono font-bold tracking-widest text-zinc-900 focus:outline-none focus:border-[#D91624]"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPin((v) => !v)}
                      className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">
                    {isAk ? 'PIN ကုဒ်အသစ် ထပ်ရိုက်အတည်ပြုပါ' : 'Confirm New 6-Digit PIN'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      maxLength={6}
                      value={confirmNewPin}
                      onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className="w-full px-3.5 py-3 pl-10 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-mono font-bold tracking-widest text-zinc-900 focus:outline-none focus:border-[#D91624]"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin((v) => !v)}
                      className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <span>{isAk ? 'PIN အသစ် သိမ်းဆည်းမည်' : 'Save New PIN'}</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthModal
