import { useEffect, useState } from 'react'
import { ArakanEmblem } from '../../components/ArakanEmblem'
import type { Language } from '../../i18n'

interface PrivacyPageProps {
  lang?: Language
}

export const PrivacyPage = ({ lang: initialLang = 'en' }: PrivacyPageProps) => {
  const [lang, setLang] = useState<Language>(initialLang)
  const ak = lang === 'ak'

  useEffect(() => {
    if (window.location.pathname.startsWith('/ak')) setLang('ak')
    else if (window.location.pathname.startsWith('/en')) setLang('en')
    document.title = ak
      ? 'ကိုယ်ရေးအချက်အလက်နှင့် လုံခြုံရေး — Péthar'
      : 'Privacy and security — Péthar'
  }, [ak])

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-slate-900">
      <header className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <ArakanEmblem size={32} variant="badge" />
          <span className="font-extrabold">Péthar</span>
        </a>
        <button
          type="button"
          onClick={() => setLang(ak ? 'en' : 'ak')}
          className="text-sm font-semibold text-stone-600"
        >
          {ak ? 'EN' : 'AK'}
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-20 space-y-8">
        <div>
          <p className="text-xs font-semibold text-stone-500 mb-2">pethar.co.uk · Google Cloud / Firebase</p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {ak ? 'ကိုယ်ရေးအချက်အလက်နှင့် လုံခြုံရေး' : 'Privacy and security'}
          </h1>
          <p className="mt-4 text-stone-600 leading-relaxed">
            {ak
              ? 'ဤစာမျက်နှာသည် သုံးစွဲသူများအတွက်ဖြစ်ပြီး၊ Google Cloud Console တွင် Péthar အက်ပ်အမည်၊ ဒိုမိန်းနှင့် ကိုယ်ရေးမူဝါဒ URL နှင့် ကိုက်ညီစေရန် ရေးထားသည်။'
              : 'This page is for customers. It is also the privacy policy URL for Péthar on Google Cloud Console (OAuth branding): app name Péthar, homepage pethar.co.uk.'}
          </p>
        </div>

        <section className="rounded-3xl bg-white border border-stone-200 p-6 space-y-3">
          <h2 className="font-bold text-lg">{ak ? 'ဘယ်သူလဲ' : 'Who we are'}</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {ak
              ? 'Péthar (ဖေ့သာ) သည် AKD ပိုက်ဆံအိတ်ဖြစ်သည်။ ဝက်ဘ်ဆိုက် pethar.co.uk။ အကောင့်ဝင်ခြင်းကို Firebase Authentication (Google Cloud) ဖြင့် လုပ်သည်။'
              : 'Péthar (ဖေ့သာ) is an AKD wallet at pethar.co.uk. Sign-in is Firebase Authentication on Google Cloud.'}
          </p>
        </section>

        <section className="rounded-3xl bg-white border border-stone-200 p-6 space-y-3">
          <h2 className="font-bold text-lg">{ak ? 'Google မှ ဘာယူသလဲ' : 'What we get from Google'}</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {ak
              ? 'Google Sign-In သုံးလျှင် နာမည်၊ အီးမေးလ်၊ Google အသုံးပြုသူအိုင်ဒီ (openid / email / profile) သာ။ ပြက္ခဒိန်၊ ဒရိုက်၊ ဂျီမေးလ် မယူ။'
              : 'If you use Google Sign-In we receive your name, email, and Google user id (openid, email, profile scopes only). We do not request Gmail, Drive, or Calendar.'}
          </p>
        </section>

        <section className="rounded-3xl bg-white border border-stone-200 p-6 space-y-3">
          <h2 className="font-bold text-lg">{ak ? 'ဘာကြောင့်' : 'How we use it'}</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {ak
              ? 'အကောင့်ဖွင့်ရန်၊ ပိုက်ဆံအိတ် ခွဲခြားရန်၊ လုံခြုံရေးသတိပေးရန်။ ကြော်ငြာ မလုပ်။ ဒေတာ မရောင်း။'
              : 'To create your account, identify your wallet, and send security notices. We do not sell personal data. We do not use Google data for ads.'}
          </p>
        </section>

        <section className="rounded-3xl bg-white border border-stone-200 p-6 space-y-3">
          <h2 className="font-bold text-lg">{ak ? 'ပိုက်ဆံအိတ် ဒေတာ' : 'Wallet data'}</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {ak
              ? 'AKD လက်ကျန်၊ လွှဲပမာဏ၊ အချိန်။ အော့ဖ်လိုင်း လွှဲမှုသည် စက်ပေါ်တွင် သိမ်းပြီး အွန်လိုင်းပြန်ရလျှင် စင့်ခ်ဖြစ်သည်။'
              : 'AKD balances, transfer amounts, and timestamps. Offline transfers stay on the device until they can sync.'}
          </p>
        </section>

        <section className="rounded-3xl bg-white border border-stone-200 p-6 space-y-3">
          <h2 className="font-bold text-lg">{ak ? 'ဖျက်ပိုင်ခွင့်' : 'Delete your data'}</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {ak
              ? 'အကောင့်နှင့် ကိုယ်ရေးဒေတာ ဖျက်ခိုင်းနိုင်သည်။ privacy@pethar.co.uk သို့ ရေးပါ။'
              : 'You can ask us to delete your account and personal data. Email privacy@pethar.co.uk.'}
          </p>
        </section>
      </main>
    </div>
  )
}
