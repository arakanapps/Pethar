import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ArakanEmblem } from '../../components/ArakanEmblem'
import type { Language } from '../../i18n'
import { goToDashboard, goToAuth } from '../../utils/subdomain'
import {
  authenticateWithEmailAndPin,
  generateOtpForEmail,
  verifyEmailOtp,
  resetPinWithEmail,
} from '../../services/walletDatabase'
import {
  Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound,
  Mail, ArrowRight, ArrowLeft, Clock, RefreshCw, Check
} from 'lucide-react'

interface LoginPageProps {
  lang: Language
}

export const LoginPage = ({ lang }: LoginPageProps) => {
  const navigate = useNavigate()
  const ak = lang === 'ak'

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

  // 10-minute timer for OTP
  const [timerSeconds, setTimerSeconds] = useState(600)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [isOtpExpired, setIsOtpExpired] = useState(false)
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
    setTimeout(() => goToDashboard(lang, navigate), 500)
  }

  // 1. Log In Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!email.trim()) {
      setErrorMsg(ak ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email address')
      return
    }
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setErrorMsg(ak ? '၆ လုံး PIN ကုဒ် ရိုက်ထည့်ပါ' : 'Enter your 6-digit security PIN')
      return
    }

    setIsLoading(true)
    try {
      const res = await authenticateWithEmailAndPin(email.trim(), pin.trim())
      setIsLoading(false)
      if (res.success) {
        finishLogin()
      } else {
        setErrorMsg(
          ak
            ? 'အီးမေးလ် သို့မဟုတ် ၆ လုံး PIN မှားယွင်းနေပါသည်။'
            : 'Incorrect email address or 6-digit PIN code. Please check and try again.'
        )
      }
    } catch {
      setIsLoading(false)
      setErrorMsg(
        ak
          ? 'အီးမေးလ် သို့မဟုတ် ၆ လုံး PIN မှားယွင်းနေပါသည်။'
          : 'Incorrect email address or 6-digit PIN code. Please check and try again.'
      )
    }
  }

  // 2. Forgot Password -> Send OTP
  const handleSendForgotOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setErrorMsg(ak ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter a valid registered email address')
      return
    }

    const code = generateOtpForEmail(forgotEmail.trim())
    setGeneratedOtpHint(code)
    startOtpTimer()
    setOtpCode(['', '', '', '', '', ''])
    setView('forgot_otp')
  }

  // 3. Verify OTP
  const handleVerifyForgotOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const entered = otpCode.join('')
    if (entered.length !== 6) {
      setErrorMsg(ak ? '၆ လုံး OTP အပြည့်အစုံ ရိုက်ထည့်ပါ' : 'Enter the complete 6-digit OTP code')
      return
    }
    if (isOtpExpired) {
      setErrorMsg(ak ? 'OTP သက်တမ်းကုန်ဆုံးသွားပါပြီ (၁၀ မိနစ်)' : 'OTP code has expired after 10 minutes. Please resend.')
      return
    }

    const verifyRes = verifyEmailOtp(forgotEmail, entered)
    if (!verifyRes.valid) {
      setErrorMsg(
        verifyRes.reason === 'expired'
          ? ak ? 'OTP ကုဒ် သက်တမ်းကုန်သွားပါပြီ' : 'OTP code expired after 10 minutes. Please resend.'
          : ak ? 'OTP ကုဒ် မှားယွင်းနေပါသည်' : 'Incorrect OTP code. Please check your email.'
      )
      return
    }

    setView('forgot_new_pin')
  }

  // 4. Save New PIN
  const handleSaveNewPin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setErrorMsg(ak ? 'PIN အသစ်သည် ဂဏန်း ၆ လုံး ဖြစ်ရပါမည်' : 'New PIN must be exactly 6 digits')
      return
    }
    if (newPin !== confirmNewPin) {
      setErrorMsg(ak ? 'PIN ကုဒ် နှစ်ခု မတူညီပါ' : 'PIN codes do not match')
      return
    }

    setIsLoading(true)
    try {
      const res = await resetPinWithEmail(forgotEmail.trim(), newPin.trim())
      setIsLoading(false)
      if (res.success) {
        setToastMsg(ak ? 'PIN ကုဒ် အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။ ကျေးဇူးပြု၍ ပြန်လည်ဝင်ရောက်ပါ' : 'PIN reset successfully! Please log in with your new PIN.')
        setEmail(forgotEmail)
        setPin('')
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
        {loginSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{ak ? 'အကောင့်ဝင်ပြီးပါပြီ။ ဒက်ရှ်ဘုတ်သို့ ပို့နေသည်...' : 'Signed in. Redirecting to dashboard…'}</span>
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
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {generatedOtpHint && (view === 'forgot_otp') && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <span className="font-semibold text-[11px]">{ak ? 'အတည်ပြု OTP ကုဒ်:' : 'Verification OTP:'}</span>
            <span className="font-mono font-black text-sm tracking-widest text-[#D91624]">{generatedOtpHint}</span>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            VIEW 1: LOGIN (EMAIL + 6-DIGIT PIN)
        ═════════════════════════════════════════════════════════════════ */}
        {view === 'login' && (
          <>
            <h1 className="text-2xl font-black text-center text-zinc-900">
              {ak ? 'ဖေ့သာ အကောင့်ဝင်ရန်' : 'Log In to Péthar'}
            </h1>
            <p className="text-xs text-stone-500 text-center mt-1 mb-6">
              {ak ? 'အီးမေးလ်နှင့် ၆ လုံး ဂဏန်း PIN ကုဒ် ရိုက်ထည့်ပါ' : 'Enter your registered email and 6-digit security PIN'}
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  {ak ? 'အီးမေးလ်' : 'Email Address'}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-3 pl-10 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold focus:outline-none focus:border-[#D91624]"
                    autoComplete="email"
                    required
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  {ak ? '၆ လုံး ဂဏန်း PIN' : '6-Digit Security PIN'}
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="w-full px-3.5 py-3 pl-10 pr-10 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono font-bold tracking-widest focus:outline-none focus:border-[#D91624]"
                    autoComplete="current-password"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || loginSuccess}
                className="w-full py-3.5 rounded-xl bg-[#D91624] hover:bg-[#B8121E] text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>{ak ? 'အကောင့်ဝင်ရန်' : 'Log In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Forgot Password / PIN Button right under login credentials */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('')
                    setForgotEmail(email)
                    setView('forgot_email')
                  }}
                  className="text-xs font-bold text-[#D91624] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{ak ? 'စကားဝှက် / PIN မေ့နေပါသလား?' : 'Forgot Password / PIN?'}</span>
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-stone-500 mt-6 pt-4 border-t border-stone-100">
              {ak ? 'အကောင့်မရှိသေးပါသလား?' : 'No account yet?'}{' '}
              <button
                type="button"
                onClick={() => goToAuth('signup')}
                className="font-bold text-[#D91624] hover:underline cursor-pointer"
              >
                {ak ? 'အကောင့်ဖွင့်ရန်' : 'Sign up'}
              </button>
            </p>
          </>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            VIEW 2: FORGOT PIN - ENTER EMAIL
        ═════════════════════════════════════════════════════════════════ */}
        {view === 'forgot_email' && (
          <form onSubmit={handleSendForgotOtp} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setView('login')}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-black text-zinc-900">
                {ak ? 'PIN ကုဒ် ပြန်လည်သတ်မှတ်ရန်' : 'Reset Security PIN'}
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              {ak
                ? 'မှတ်ပုံတင်ထားသော အီးမေးလ်သို့ ၁၀ မိနစ် သက်တမ်းရှိ OTP အတည်ပြုကုဒ် ပို့ပေးပါမည်'
                : 'Enter your registered email address. We will send a 10-minute OTP verification code.'}
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                {ak ? 'အီးမေးလ် လိပ်စာ' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-3 pl-10 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold focus:outline-none focus:border-[#D91624]"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#D91624] hover:bg-[#B8121E] text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{ak ? 'OTP ကုဒ် ပို့မည်' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            VIEW 3: FORGOT PIN - ENTER OTP (10 MIN EXPIRY)
        ═════════════════════════════════════════════════════════════════ */}
        {view === 'forgot_otp' && (
          <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
            <h2 className="text-xl font-black text-center text-zinc-900">
              {ak ? 'အတည်ပြုကုဒ် ရိုက်ထည့်ပါ' : 'Enter OTP Verification Code'}
            </h2>
            <p className="text-xs text-stone-500 text-center">
              {ak ? `${forgotEmail} သို့ ပို့ထားသော ၆ လုံး ဂဏန်းကုဒ် ရိုက်ထည့်ပါ` : `Enter the 6-digit code sent to ${forgotEmail}`}
            </p>

            <div className="flex justify-between gap-2 my-4">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`login-otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                  className="w-12 h-14 text-center text-xl font-mono font-black rounded-xl bg-stone-50 border-2 border-stone-200 focus:border-[#D91624] focus:outline-none"
                />
              ))}
            </div>

            {/* 10-Minute Countdown Timer & Resend */}
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-1.5 text-stone-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{ak ? 'သက်တမ်း:' : 'Expires in:'}</span>
                <span className="font-mono font-bold text-stone-900">{formatTimer(timerSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                className="text-xs font-bold text-[#D91624] hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{ak ? 'အီးမေးလ် ပြန်ပို့ရန်' : 'Resend Email'}</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#D91624] hover:bg-[#B8121E] text-white font-extrabold text-sm shadow-md transition cursor-pointer"
            >
              {ak ? 'OTP အတည်ပြုမည်' : 'Verify Code'}
            </button>
          </form>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            VIEW 4: CREATE NEW PIN AND CONFIRM
        ═════════════════════════════════════════════════════════════════ */}
        {view === 'forgot_new_pin' && (
          <form onSubmit={handleSaveNewPin} className="space-y-4">
            <h2 className="text-xl font-black text-center text-zinc-900">
              {ak ? 'PIN ကုဒ်အသစ် သတ်မှတ်ပါ' : 'Create New 6-Digit PIN'}
            </h2>
            <p className="text-xs text-stone-500 text-center">
              {ak ? 'သင့်အကောင့်အတွက် ၆ လုံး PIN ကုဒ်အသစ် သတ်မှတ်ပြီး အတည်ပြုပါ' : 'Enter and confirm your new 6-digit security PIN'}
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                {ak ? '၆ လုံး PIN အသစ်' : 'New 6-Digit PIN'}
              </label>
              <div className="relative">
                <input
                  type={showNewPin ? 'text' : 'password'}
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="w-full px-3.5 py-3 pl-10 pr-10 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono font-bold tracking-widest focus:outline-none focus:border-[#D91624]"
                  required
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowNewPin((v) => !v)}
                  className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                {ak ? 'PIN အသစ် ထပ်ရိုက်အတည်ပြုပါ' : 'Confirm New 6-Digit PIN'}
              </label>
              <div className="relative">
                <input
                  type={showNewPin ? 'text' : 'password'}
                  maxLength={6}
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="w-full px-3.5 py-3 pl-10 pr-10 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono font-bold tracking-widest focus:outline-none focus:border-[#D91624]"
                  required
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <span>{ak ? 'PIN အသစ် သိမ်းဆည်းမည်' : 'Save New PIN & Log In'}</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default LoginPage
