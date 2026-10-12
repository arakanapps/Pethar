import React, { useState } from 'react'
import {
  X, Eye, EyeOff, ShieldCheck, Smartphone, Mail,
  Fingerprint, ArrowRight, Check, KeyRound
} from 'lucide-react'
import { ArakanEmblem } from './ArakanEmblem'
import type { Language } from '../i18n'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialMode?: 'login' | 'signup'
  lang: Language
}

const COUNTRY_CODES = [
  { code: '+95', country: 'Arakan / MM', flag: '🇲🇲' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
]

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  lang,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone')
  const [selectedCountryCode, setSelectedCountryCode] = useState('+95')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [referralId, setReferralId] = useState('')
  const [showReferral, setShowReferral] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(true)

  // OTP Verification Step
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  // Password validation checks
  const hasMinLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasUpper = /[A-Z]/.test(password)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (authMethod === 'phone' && !phone) {
      setErrorMsg(lang === 'ak' ? 'ဖုန်းနံပါတ် ထည့်သွင်းပါ' : 'Please enter your phone number')
      return
    }
    if (authMethod === 'email' && !email) {
      setErrorMsg(lang === 'ak' ? 'အီးမေးလ် ထည့်သွင်းပါ' : 'Please enter your email address')
      return
    }
    if (!password) {
      setErrorMsg(lang === 'ak' ? 'စကားဝှက် ထည့်သွင်းပါ' : 'Please enter your password')
      return
    }
    if (mode === 'signup' && (!hasMinLength || !hasNumber)) {
      setErrorMsg(lang === 'ak' ? 'စကားဝှက် လုံခြုံရေးစည်းကမ်းချက်များကို ပြည့်စုံအောင် ဖြည့်ပါ' : 'Password must meet all security requirements')
      return
    }
    if (mode === 'signup' && !agreedToTerms) {
      setErrorMsg(lang === 'ak' ? 'စည်းကမ်းသတ်မှတ်ချက်များကို သဘောတူညီရန် လိုအပ်ပါသည်' : 'You must agree to the Terms of Service')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      // Switch to 6-digit OTP verification for instant security
      setStep('otp')
    }, 600)
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onSuccess()
    }, 700)
  }

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0]
    const updated = [...otpCode]
    updated[index] = val
    setOtpCode(updated)

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      nextInput?.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="liquid-glass-modal-light rounded-3xl p-6 sm:p-8 max-w-[460px] w-full relative shadow-2xl border border-white/80 overflow-hidden">
        {/* Decorative specular sheen */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-red-500 to-amber-500" />
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <ArakanEmblem size={32} variant="badge" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">PeThar</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                FINTECH
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {lang === 'ak' ? 'အာရက္ခဒစ်ဂျစ်တယ် ဘဏ္ဍာရေးကွန်ရက်' : 'Arakan Digital Financial Network'}
            </p>
          </div>
        </div>

        {step === 'credentials' ? (
          <>
            {/* Binance Style Top Tabs: Log In | Sign Up */}
            <div className="flex border-b border-slate-200/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setErrorMsg('')
                }}
                className={`flex-1 pb-3 text-center text-sm font-bold transition-all relative ${
                  mode === 'login'
                    ? 'text-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {lang === 'ak' ? 'အကောင့်ဝင်ရန်' : 'Log In'}
                {mode === 'login' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setErrorMsg('')
                }}
                className={`flex-1 pb-3 text-center text-sm font-bold transition-all relative ${
                  mode === 'signup'
                    ? 'text-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {lang === 'ak' ? 'အကောင့်ဖွင့်ရန်' : 'Sign Up'}
                {mode === 'signup' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Sub-tab: Phone vs Email */}
            <div className="flex p-1 bg-slate-100/90 rounded-xl mb-5 border border-slate-200/50">
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  authMethod === 'phone'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'ak' ? 'ဖုန်းနံပါတ်' : 'Phone Number'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  authMethod === 'email'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-sky-500" />
                <span>{lang === 'ak' ? 'အီးမေးလ်' : 'Email Address'}</span>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/60 text-red-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone or Email Input */}
              {authMethod === 'phone' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'ak' ? 'ဖုန်းနံပါတ်' : 'Phone Number'}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="liquid-glass-input-light px-2.5 py-2.5 rounded-xl text-xs font-mono font-medium text-slate-800 border focus:outline-none shrink-0"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9798112334"
                      className="liquid-glass-input-light flex-1 px-3.5 py-2.5 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 border focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'ak' ? 'အီးမေးလ်' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="liquid-glass-input-light w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 border focus:outline-none"
                  />
                </div>
              )}

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === 'ak' ? 'စကားဝှက်' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => window.open('https://t.me/petharsupport', '_blank')}
                      className="text-[11px] font-medium text-amber-600 hover:text-amber-700 transition-colors"
                      title={lang === 'ak' ? 'Telegram @petharsupport သို့ ဆက်သွယ်ပါ' : 'Contact Telegram @petharsupport'}
                    >
                      {lang === 'ak' ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="liquid-glass-input-light w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 border focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password requirements for Sign Up */}
              {mode === 'signup' && (
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      hasMinLength ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <span className={hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                      {lang === 'ak' ? 'အနည်းဆုံး စာလုံး ၈ လုံး' : 'At least 8 characters'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      hasNumber ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <span className={hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                      {lang === 'ak' ? 'အနည်းဆုံး ဂဏန်း ၁ လုံး' : 'At least 1 number'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      hasUpper ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <span className={hasUpper ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                      {lang === 'ak' ? 'အနည်းဆုံး စာလုံးကြီး ၁ လုံး' : 'At least 1 uppercase letter'}
                    </span>
                  </div>
                </div>
              )}

              {/* Sign up optional referral ID */}
              {mode === 'signup' && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowReferral(!showReferral)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <span>{lang === 'ak' ? 'မိတ်ဆက်ကုဒ် (ရွေးချယ်ရန်)' : 'Referral ID (Optional)'}</span>
                    <span className="text-slate-400">{showReferral ? '▲' : '▼'}</span>
                  </button>
                  {showReferral && (
                    <input
                      type="text"
                      value={referralId}
                      onChange={(e) => setReferralId(e.target.value)}
                      placeholder="REF-AKD-2026"
                      className="liquid-glass-input-light w-full mt-2 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 border focus:outline-none"
                    />
                  )}
                </div>
              )}

              {/* Checkboxes */}
              {mode === 'login' ? (
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                    />
                    <span>{lang === 'ak' ? 'စက်ပစ္စည်းကို မှတ်သားထားရန်' : 'Remember this device'}</span>
                  </label>
                </div>
              ) : (
                <div className="text-xs text-slate-600">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                    />
                    <span>
                      {lang === 'ak'
                        ? 'PeThar ၏ ဝန်ဆောင်မှုစည်းကမ်းများနှင့် ကိုယ်ရေးအချက်အလက်မူဝါဒကို သဘောတူပါသည်'
                        : "I agree to PeThar's Terms of Service and Privacy Policy"}
                    </span>
                  </label>
                </div>
              )}

              {/* Primary Submit Button (Binance Yellow/Amber Gradient) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login'
                        ? (lang === 'ak' ? 'အကောင့်ဝင်မည်' : 'Log In')
                        : (lang === 'ak' ? 'အကောင့်ဖန်တီးမည်' : 'Create Account')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick biometric passkey login */}
            <div className="mt-5 pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true)
                  setTimeout(() => {
                    setIsLoading(false)
                    onSuccess()
                  }, 600)
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Fingerprint className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ak' ? 'Face ID / Passkey ဖြင့် အမြန်ဝင်ရန်' : 'Continue with Passkey / Face ID'}</span>
              </button>
            </div>
          </>
        ) : (
          /* Step 2: 6-Digit OTP SMS Verification (Binance Verification Pattern) */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center mx-auto mb-3 text-amber-600">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {lang === 'ak' ? 'လုံခြုံရေး အတည်ပြုကုဒ်' : 'Security Verification'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'ak'
                  ? `${selectedCountryCode} ${phone || '•••••••'} သို့ ပို့ထားသော ဂဏန်း ၆ လုံး ကုဒ်ကို ထည့်ပါ`
                  : `Enter the 6-digit code sent to ${authMethod === 'phone' ? `${selectedCountryCode} ${phone}` : email}`}
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-10 sm:w-11 h-12 text-center text-lg font-bold font-mono text-slate-900 rounded-xl liquid-glass-input-light border focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                ))}
              </div>

              <div className="text-center text-xs text-slate-500">
                <span>{lang === 'ak' ? 'ကုဒ်မရောက်ပါက ' : "Didn't receive code? "}</span>
                <button
                  type="button"
                  onClick={() => alert(lang === 'ak' ? 'ကုဒ်အသစ် ပို့ပြီးပါပြီ' : 'New code has been dispatched via SMS.')}
                  className="font-bold text-amber-600 hover:text-amber-700"
                >
                  {lang === 'ak' ? 'ကုဒ်ပြန်လည်တောင်းဆိုရန်' : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{lang === 'ak' ? 'အတည်ပြုပြီး ဝင်ရောက်မည်' : 'Verify & Continue'}</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
              >
                {lang === 'ak' ? '← နောက်သို့ ပြန်သွားရန်' : '← Back to credentials'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
export default AuthModal
