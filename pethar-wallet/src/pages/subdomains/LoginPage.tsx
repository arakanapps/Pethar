import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ArakanEmblem } from '../../components/ArakanEmblem'
import type { Language } from '../../i18n'
import { auth, onAuthStateChange, signInWithGooglePopup, signInWithEmail } from '../../lib/firebase'
import { goToDashboard, goToAuth } from '../../utils/subdomain'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'

interface LoginPageProps {
  lang: Language
}

export const LoginPage = ({ lang }: LoginPageProps) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(false)
  const ak = lang === 'ak'

  // Auto-redirect to dashboard if user is authenticated with Google or email
  useEffect(() => {
    if (auth.currentUser) {
      goToDashboard(lang, navigate)
      return
    }

    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        goToDashboard(lang, navigate)
      }
    })
    return () => unsubscribe()
  }, [lang, navigate])

  const t = ak
    ? {
        title: 'ဖေ့သာ အကောင့်ဝင်ရန်',
        subtitle: 'အီးမေးလ်နှင့် စကားဝှက်၊ သို့မဟုတ် Google',
        google: 'Google ဖြင့် ဝင်ရန်',
        or: 'သို့မဟုတ်',
        email: 'အီးမေးလ်',
        password: 'စကားဝှက်',
        submit: 'အကောင့်ဝင်ရန်',
        noAccount: 'အကောင့်မရှိသေးပါသလား?',
        signUp: 'အကောင့်ဖွင့်ရန်',
        success: 'ဝင်ပြီးပါပြီ။ ဒက်ရှ်ဘုတ်သို့ ပို့နေသည်...',
        emptyEmail: 'အီးမေးလ် ရိုက်ထည့်ပါ',
        emptyPassword: 'စကားဝှက် ရိုက်ထည့်ပါ',
        failed: 'ဝင်၍မရပါ။ အချက်အလက် ပြန်စစ်ပါ',
      }
    : {
        title: 'Log in to Péthar',
        subtitle: 'Email and password, or Google',
        google: 'Continue with Google',
        or: 'or',
        email: 'Email',
        password: 'Password',
        submit: 'Log in',
        noAccount: 'No account yet?',
        signUp: 'Sign up',
        success: 'Signed in. Redirecting to dashboard…',
        emptyEmail: 'Enter your email',
        emptyPassword: 'Enter your password',
        failed: 'Could not sign in. Check your details.',
      }

  const finish = () => {
    setLoginSuccess(true)
    setTimeout(() => goToDashboard(lang, navigate), 300)
  }

  const handleGoogle = async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await signInWithGooglePopup()
      if (res?.user) {
        finish()
      } else {
        finish()
      }
    } catch (err: unknown) {
      console.warn('Google sign in note:', err)
      const code = (err as { code?: string })?.code
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg(ak ? 'Google ဝင်ရောက်မှု ပယ်ဖျက်လိုက်ပါသည်' : 'Google sign-in was cancelled')
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg(ak ? 'Browser Popup ပိတ်ထားပါသည် (Popup ဖွင့်ပေးပါ)' : 'Popup was blocked by your browser. Please allow popups.')
      } else {
        if (auth.currentUser) {
          finish()
        } else {
          setErrorMsg(ak ? 'ဝင်၍မရပါ။ အချက်အလက် ပြန်စစ်ပါ' : 'Sign in failed. Check your connection or retry.')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!email.trim()) {
      setErrorMsg(t.emptyEmail)
      return
    }
    if (!password) {
      setErrorMsg(t.emptyPassword)
      return
    }
    setIsLoading(true)
    try {
      await signInWithEmail(email.trim(), password)
      finish()
    } catch {
      setErrorMsg(t.failed)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col items-center justify-center px-4 py-12">
      <button type="button" onClick={() => (window.location.href = '/')} className="mb-8 flex items-center gap-2">
        <ArakanEmblem size={36} variant="badge" />
        <span className="font-extrabold text-lg">Péthar</span>
      </button>
      <div className="w-full max-w-md bg-white rounded-[1.75rem] border border-stone-200 p-7 shadow-sm">
        <h1 className="text-2xl font-extrabold text-center">{t.title}</h1>
        <p className="text-sm text-stone-500 text-center mt-1 mb-6">{t.subtitle}</p>

        {loginSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {t.success}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-700 text-sm font-semibold">{errorMsg}</div>
        )}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={isLoading || loginSuccess}
          className="w-full py-3 rounded-xl border border-stone-300 bg-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {t.google}
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase font-bold text-stone-400">
            <span className="bg-white px-2">{t.or}</span>
          </div>
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <label className="block text-xs font-bold text-stone-600">
            {t.email}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3.5 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium"
              autoComplete="email"
            />
          </label>
          <label className="block text-xs font-bold text-stone-600 relative">
            {t.password}
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3.5 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 bottom-3 text-stone-400"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </label>
          <button
            type="submit"
            disabled={isLoading || loginSuccess}
            className="w-full py-3 rounded-xl bg-[#111] text-white font-bold text-sm disabled:opacity-50"
          >
            {t.submit}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          {t.noAccount}{' '}
          <button type="button" onClick={() => goToAuth('signup')} className="font-bold text-slate-900">
            {t.signUp}
          </button>
        </p>
      </div>
    </div>
  )
}
