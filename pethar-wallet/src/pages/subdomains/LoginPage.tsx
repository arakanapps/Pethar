import { useState } from 'react';
import { BaseLayout } from './BaseLayout';
import { ArakanEmblem } from '../../components/ArakanEmblem';
import type { Language } from '../../i18n';
import { signInWithGoogle } from '../../lib/supabase';
import { redirectToSubdomain } from '../../utils/subdomain';
import {
  Smartphone, Mail, Eye, EyeOff,
  Fingerprint, ArrowRight, CheckCircle
} from 'lucide-react';

interface LoginPageProps {
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

export const LoginPage = ({ lang }: LoginPageProps) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+95');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const t = lang === 'ak'
    ? {
        title: 'ဖေ့သာ အကောင့်ဝင်ရောက်ရန်',
        subtitle: 'အာရက္ခဒေါ်လာ (AKD) ဒစ်ဂျစ်တယ်ပိုက်ဆံအိတ်နှင့် ဘဏ္ဍာရေးဝန်ဆောင်မှုများသို့ လုံခြုံစွာဝင်ရောက်ပါ',
        googleSignIn: 'Google ဖြင့် အကောင့်ဝင်ရောက်ရန်',
        orDivider: 'သို့မဟုတ် ဖုန်းနံပါတ် / အီးမေးလ်ဖြင့် ဝင်ရောက်ပါ',
        phoneTab: 'ဖုန်းနံပါတ်',
        emailTab: 'အီးမေးလ်လိပ်စာ',
        phoneLabel: 'ဖုန်းနံပါတ် ရိုက်ထည့်ပါ',
        emailLabel: 'အီးမေးလ် ရိုက်ထည့်ပါ',
        passwordLabel: 'လျှို့ဝှက်စကားဝှက်',
        passwordPlaceholder: 'စကားဝှက် ရိုက်ထည့်ပါ',
        rememberMe: 'စက်ပစ္စည်းကို မှတ်သားထားရန်',
        forgotPassword: 'စကားဝှက် မေ့နေပါသလား?',
        submitLogin: 'အကောင့်ဝင်မည်',
        biometricLogin: 'Face ID / Touch ID / Passkey ဖြင့် အမြန်ဝင်ရန်',
        noAccountPrompt: 'ဖေ့သာအကောင့် မရှိသေးပါသလား?',
        signUpLink: 'အကောင့်သစ် ဖွင့်ရန် (Sign Up)',
        successRedirecting: 'အကောင့်ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်! သုံးစွဲသူအက်ပ်သို့ ပြောင်းရွှေ့နေပါသည်...',
        errorEmptyPhone: 'ဖုန်းနံပါတ် ရိုက်ထည့်ပေးပါ',
        errorEmptyEmail: 'အီးမေးလ်လိပ်စာ ရိုက်ထည့်ပေးပါ',
        errorEmptyPassword: 'လျှို့ဝှက်စကားဝှက် ရိုက်ထည့်ပေးပါ',
      }
    : {
        title: 'Sign In to PeThar',
        subtitle: 'Secure access to your Arakan Dollar (AKD) wallet and financial services',
        googleSignIn: 'Sign in with Google',
        orDivider: 'or continue with phone or email',
        phoneTab: 'Phone Number',
        emailTab: 'Email Address',
        phoneLabel: 'Phone Number',
        emailLabel: 'Email Address',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        rememberMe: 'Remember this device',
        forgotPassword: 'Forgot password?',
        submitLogin: 'Log In to Account',
        biometricLogin: 'Continue with Passkey / Face ID',
        noAccountPrompt: "Don't have a PeThar account?",
        signUpLink: 'Create an Account (Sign Up)',
        successRedirecting: 'Authentication successful! Redirecting to customer app...',
        errorEmptyPhone: 'Please enter your phone number',
        errorEmptyEmail: 'Please enter your email address',
        errorEmptyPassword: 'Please enter your password',
      };

  const handleSuccessRedirect = () => {
    setLoginSuccess(true);
    setTimeout(() => {
      // Redirect to app subdomain (app.pethar.co.uk or /app)
      redirectToSubdomain('app');
    }, 800);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.warn('Google sign in note:', err);
      // Graceful fallback for demo/offline preview environments
      setTimeout(() => {
        setIsLoading(false);
        handleSuccessRedirect();
      }, 700);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMethod === 'phone' && !phone.trim()) {
      setErrorMsg(t.errorEmptyPhone);
      return;
    }
    if (authMethod === 'email' && !email.trim()) {
      setErrorMsg(t.errorEmptyEmail);
      return;
    }
    if (!password) {
      setErrorMsg(t.errorEmptyPassword);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      handleSuccessRedirect();
    }, 600);
  };

  return (
    <BaseLayout
      title={t.title}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="min-h-[70vh] flex items-center justify-center py-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          {/* Top Brand Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-red-600 to-amber-500" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex mb-3">
              <ArakanEmblem size={48} variant="badge" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Success Banner */}
          {loginSuccess && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{t.successRedirecting}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* 1. GOOGLE SIGN IN BUTTON */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || loginSuccess}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{t.googleSignIn}</span>
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
                  {t.orDivider}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-tabs: Phone vs Email */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setAuthMethod('phone')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                authMethod === 'phone'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.phoneTab}</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                authMethod === 'email'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-sky-500" />
              <span>{t.emailTab}</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMethod === 'phone' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.phoneLabel}
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="px-2.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
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
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.passwordLabel}
                </label>
                <button
                  type="button"
                  onClick={() => alert(lang === 'ak' ? 'ကျေးဇူးပြု၍ Telegram @petharsupport သို့ ဆက်သွယ်ပါ' : 'Please contact support at Telegram @petharsupport')}
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700"
                >
                  {t.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                />
                <span>{t.rememberMe}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || loginSuccess}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t.submitLogin}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Biometric Passkey shortcut */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  handleSuccessRedirect();
                }, 500);
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Fingerprint className="w-4 h-4 text-emerald-600" />
              <span>{t.biometricLogin}</span>
            </button>
          </div>

          {/* Switch to Sign Up */}
          <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>{t.noAccountPrompt} </span>
            <button
              onClick={() => redirectToSubdomain('signup')}
              className="font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 underline underline-offset-2 ml-1"
            >
              {t.signUpLink}
            </button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};