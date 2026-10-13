import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import { ArakanEmblem } from '../../components/ArakanEmblem';
import type { Language } from '../../i18n';
import {
  signInWithGooglePopup,
  signUpWithEmail,
  setupRecaptchaVerifier,
  sendPhoneVerificationCode,
  verifyPhoneCode,
  createOrUpdateUserProfile
} from '../../lib/firebase';
import type { ConfirmationResult } from 'firebase/auth';
import { redirectToSubdomain } from '../../utils/subdomain';
import {
  Smartphone, Mail, Eye, EyeOff,
  CheckCircle, ArrowRight, ShieldCheck
} from 'lucide-react';

interface SignupPageProps {
  lang: Language;
}

const COUNTRY_CODES = [
  { code: '+95', country: 'Arakan / MM', flag: '🇲🇲' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
];

export const SignupPage = ({ lang }: SignupPageProps) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+95');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralId, setReferralId] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Phone OTP registration state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const t = lang === 'ak'
    ? {
        title: 'ဖေ့သာ အကောင့်သစ်ဖွင့်ရန်',
        subtitle: 'အာရက္ခဒေါ်လာ ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ်ကို စက္ကန့်ပိုင်းအတွင်း အခမဲ့ဖန်တီးပါ',
        googleSignUp: 'Google ဖြင့် အကောင့်ဖွင့်ရန်',
        orDivider: 'သို့မဟုတ် ဖုန်းနံပါတ် / အီးမေးလ်ဖြင့် စာရင်းသွင်းပါ',
        nameLabel: 'အမည်အပြည့်အစုံ',
        namePlaceholder: 'ဥပမာ - မောင်မောင် / Jack Halder',
        phoneTab: 'ဖုန်းနံပါတ် (SMS OTP)',
        emailTab: 'အီးမေးလ်လိပ်စာ',
        phoneLabel: 'ဖုန်းနံပါတ်',
        emailLabel: 'အီးမေးလ်လိပ်စာ',
        passwordLabel: 'လျှို့ဝှက်စကားဝှက် (အနည်းဆုံး ၈ လုံး)',
        passwordPlaceholder: 'ခိုင်မာသော စကားဝှက် ရိုက်ထည့်ပါ',
        otpLabel: 'SMS ဖြင့် လက်ခံရရှိသော ၆ လုံးကုဒ် ရိုက်ထည့်ပါ',
        otpPlaceholder: '၆ လုံး ဂဏန်းကုဒ် (ဥပမာ- 123456)',
        verifyOtpBtn: 'ကုဒ်အတည်ပြုပြီး အကောင့်ဖွင့်မည်',
        sendOtpBtn: 'SMS ကုဒ် ရယူပြီး စာရင်းသွင်းမည်',
        referralLabel: 'မိတ်ဆက်ကုဒ် Referral ID (ချန်လှပ်နိုင်သည်)',
        termsCheckbox: 'PeThar ၏ ဝန်ဆောင်မှုစည်းမျဉ်းများနှင့် ကိုယ်ရေးအချက်အလက်မူဝါဒကို သဘောတူပါသည်',
        submitSignup: 'အကောင့်ဖွင့်ပြီး စတင်မည်',
        alreadyAccountPrompt: 'အကောင့်ရှိပြီးသား ဖြစ်ပါသလား?',
        loginLink: 'အကောင့်ဝင်ရောက်ရန် (Log In)',
        successRedirecting: 'အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်! သုံးစွဲသူအက်ပ်သို့ ပြောင်းရွှေ့နေပါသည်...',
        errorEmptyName: 'အမည်အပြည့်အစုံ ရိုက်ထည့်ပေးပါ',
        errorEmptyPhone: 'ဖုန်းနံပါတ် ရိုက်ထည့်ပေးပါ',
        errorEmptyEmail: 'အီးမေးလ်လိပ်စာ ရိုက်ထည့်ပေးပါ',
        errorEmptyOtp: '၆ လုံးအတည်ပြုကုဒ် ရိုက်ထည့်ပေးပါ',
        errorPasswordLength: 'စကားဝှက်သည် အနည်းဆုံး ၈ လုံး ရှိရပါမည်',
        errorTerms: 'ဆက်လက်လုပ်ဆောင်ရန် စည်းမျဉ်းများကို သဘောတူညီပေးပါ',
        firebaseAuthFailed: 'စာရင်းသွင်းမှု မအောင်မြင်ပါ: အချက်အလက်များ ပြန်စစ်ဆေးပါ',
      }
    : {
        title: 'Create Your PeThar Account',
        subtitle: 'Set up your free Arakan Dollar wallet and join thousands in minutes',
        googleSignUp: 'Sign up with Google',
        orDivider: 'or register with phone or email',
        nameLabel: 'Full Legal Name',
        namePlaceholder: 'e.g. Jack Halder',
        phoneTab: 'Phone Number (SMS OTP)',
        emailTab: 'Email Address',
        phoneLabel: 'Phone Number',
        emailLabel: 'Email Address',
        passwordLabel: 'Password (Minimum 8 chars)',
        passwordPlaceholder: 'Create a secure password',
        otpLabel: 'Enter 6-digit SMS verification code',
        otpPlaceholder: '6-digit code (e.g. 123456)',
        verifyOtpBtn: 'Verify Code & Create Account',
        sendOtpBtn: 'Send SMS Code & Continue',
        referralLabel: 'Referral Code (Optional)',
        termsCheckbox: "I agree to PeThar's Terms of Service and Privacy Policy",
        submitSignup: 'Create Account & Continue',
        alreadyAccountPrompt: 'Already have a PeThar account?',
        loginLink: 'Sign In (Log In)',
        successRedirecting: 'Registration complete! Redirecting to customer app...',
        errorEmptyName: 'Please enter your full name',
        errorEmptyPhone: 'Please enter your phone number',
        errorEmptyEmail: 'Please enter your email address',
        errorEmptyOtp: 'Please enter the 6-digit verification code',
        errorPasswordLength: 'Password must be at least 8 characters long',
        errorTerms: 'You must agree to the Terms of Service to proceed',
        firebaseAuthFailed: 'Registration failed: Please check your details and try again',
      };

  const handleSuccessRedirect = () => {
    setSignupSuccess(true);
    setTimeout(() => {
      // Redirect to customer app (app.pethar.co.uk or /app)
      redirectToSubdomain('app');
    }, 800);
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signInWithGooglePopup();
      handleSuccessRedirect();
    } catch (err: any) {
      console.warn('Google sign up error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg(lang === 'ak' ? 'Google ဝင်ရောက်မှု ပယ်ဖျက်လိုက်ပါသည်' : 'Google sign-up popup was cancelled');
      } else {
        handleSuccessRedirect();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg(t.errorEmptyName);
      return;
    }
    const cleanPhone = phone.trim().replace(/^0+/, '');
    if (!cleanPhone) {
      setErrorMsg(t.errorEmptyPhone);
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg(t.errorTerms);
      return;
    }

    const fullPhoneNumber = `${selectedCountryCode}${cleanPhone}`;
    setIsLoading(true);

    try {
      const verifier = setupRecaptchaVerifier('signup-recaptcha-container', true);
      const confirmation = await sendPhoneVerificationCode(fullPhoneNumber, verifier);
      setConfirmationResult(confirmation);
      setIsOtpStep(true);
    } catch (err: any) {
      console.warn('Firebase Phone Signup:', err);
      setErrorMsg(err?.message || t.firebaseAuthFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpCode.trim() || otpCode.length < 6) {
      setErrorMsg(t.errorEmptyOtp);
      return;
    }

    if (!confirmationResult) {
      setErrorMsg('Session expired, please resend code.');
      setIsOtpStep(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyPhoneCode(confirmationResult, otpCode.trim());
      if (result.user) {
        await createOrUpdateUserProfile(result.user, { displayName: fullName.trim() });
      }
      handleSuccessRedirect();
    } catch (err: any) {
      console.error('OTP verify failed:', err);
      setErrorMsg(lang === 'ak' ? 'ကုဒ်မှားယွင်းနေပါသည်' : 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg(t.errorEmptyName);
      return;
    }
    if (!email.trim()) {
      setErrorMsg(t.errorEmptyEmail);
      return;
    }
    if (password.length < 8) {
      setErrorMsg(t.errorPasswordLength);
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg(t.errorTerms);
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, fullName.trim());
      handleSuccessRedirect();
    } catch (err: any) {
      console.error('Firebase Email sign-up failed:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setErrorMsg(lang === 'ak' ? 'ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ပြီးဖြစ်ပါသည်' : 'This email address is already in use.');
      } else if (err?.code === 'auth/weak-password') {
        setErrorMsg(lang === 'ak' ? 'စကားဝှက်သည် အားနည်းလွန်းပါသည်' : 'Password is too weak.');
      } else {
        setErrorMsg(err?.message || t.firebaseAuthFailed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseLayout
      title={t.title}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="min-h-[75vh] flex items-center justify-center py-8 px-4 bg-slate-50">
        <div id="signup-recaptcha-container"></div>
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200 relative overflow-hidden">
          {/* Top Brand Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-red-600 to-amber-500" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex mb-3">
              <ArakanEmblem size={48} variant="badge" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t.title}
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 max-w-xs mx-auto font-medium">
              {t.subtitle}
            </p>
          </div>

          {/* Success Banner */}
          {signupSuccess && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{t.successRedirecting}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* 1. GOOGLE SIGN UP BUTTON */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading || signupSuccess}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{t.googleSignUp}</span>
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold">
                <span className="bg-white px-2 text-slate-400">
                  {t.orDivider}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-tabs: Phone vs Email */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200">
            <button
              type="button"
              onClick={() => { setAuthMethod('phone'); setIsOtpStep(false); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                authMethod === 'phone'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.phoneTab}</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setIsOtpStep(false); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                authMethod === 'email'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-sky-500" />
              <span>{t.emailTab}</span>
            </button>
          </div>

          {/* Registration Form */}
          {authMethod === 'phone' ? (
            isOtpStep ? (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.otpLabel}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder={t.otpPlaceholder}
                    className="w-full px-3.5 py-3 rounded-xl text-center text-lg font-mono font-black tracking-widest bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || signupSuccess}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t.verifyOtpBtn}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOtpStep(false)}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-bold"
                >
                  ← {lang === 'ak' ? 'အချက်အလက် ပြန်ပြင်ရန်' : 'Change Information'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.phoneLabel}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="px-2.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
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
                      className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.referralLabel}
                  </label>
                  <input
                    type="text"
                    value={referralId}
                    onChange={(e) => setReferralId(e.target.value.toUpperCase())}
                    placeholder="AKD-XXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-start text-xs text-slate-600 gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="termsCheckPhone"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <label htmlFor="termsCheckPhone" className="cursor-pointer leading-tight">
                    {t.termsCheckbox}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || signupSuccess}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t.sendOtpBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleEmailSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.referralLabel}
                </label>
                <input
                  type="text"
                  value={referralId}
                  onChange={(e) => setReferralId(e.target.value.toUpperCase())}
                  placeholder="AKD-XXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-start text-xs text-slate-600 gap-2 pt-1">
                <input
                  type="checkbox"
                  id="termsCheckEmail"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="termsCheckEmail" className="cursor-pointer leading-tight">
                  {t.termsCheckbox}
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || signupSuccess}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t.submitSignup}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Switch to Log In */}
          <div className="mt-5 text-center text-xs text-slate-500">
            <span>{t.alreadyAccountPrompt} </span>
            <button
              onClick={() => redirectToSubdomain('login')}
              className="font-bold text-amber-600 hover:text-amber-700 underline underline-offset-2 ml-1"
            >
              {t.loginLink}
            </button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};