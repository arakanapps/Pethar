import { useState, useEffect } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  ShieldCheck,
  Lock,
  Key,
  Database,
  Trash2,
  CheckCircle2,
  Server,
  Cpu,
  UserCheck
} from 'lucide-react';

interface PrivacyPageProps {
  lang?: Language;
}

export const PrivacyPage = ({ lang: initialLang = 'en' }: PrivacyPageProps) => {
  const [lang, setLang] = useState<Language>(initialLang);

  useEffect(() => {
    // If URL has /ak or /en, sync lang
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/ak')) setLang('ak');
      else if (window.location.pathname.startsWith('/en')) setLang('en');
    }
  }, []);

  return (
    <BaseLayout
      title={lang === 'ak' ? 'ကိုယ်ရေးအချက်အလက်နှင့် လုံခြုံရေး မူဝါဒ (Privacy Policy)' : 'Privacy Policy & Data Security'}
      lang={lang}
      setLang={setLang}
    >
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official Regulatory & Compliance Disclosure</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              {lang === 'ak'
                ? 'PeThar ကိုယ်ရေးအချက်အလက်နှင့် လုံခြုံရေး မူဝါဒ'
                : 'PeThar Application Privacy Policy & Security'}
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              {lang === 'ak'
                ? 'PeThar (ဖေ့သာ) သည် သုံးစွဲသူများ၏ ကိုယ်ရေးအချက်အလက်နှင့် လုံခြုံရေးကို အမြင့်မားဆုံး ကာကွယ်ထားပါသည်။ ဤစာမျက်နှာတွင် PeThar ဝဘ်ဆိုက်နှင့် မိုဘိုင်းအက်ပ်မှ Google ဒေတာနှင့် အချက်အလက်များအား ရယူခြင်း၊ အသုံးပြုခြင်း၊ သိမ်းဆည်းခြင်းနှင့် ဖျက်သိမ်းခြင်းဆိုင်ရာ မူဝါဒများကို အသေးစိတ် ဖော်ပြထားပါသည်။'
                : 'PeThar ("PeThar Wallet", "PeThar Mobile", operated by PeThar Financial Technologies at pethar.co.uk) is committed to protecting user privacy, data confidentiality, and digital autonomy. This policy outlines how we access, collect, process, store, and delete Google user data and personal information in full compliance with Google API Services User Data Policy requirements.'}
            </p>

            {/* Quick Metadata Pill */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 border-t border-slate-100">
              <div><strong className="text-slate-800">Application:</strong> PeThar / PeThar Wallet</div>
              <div><strong className="text-slate-800">Entity:</strong> PeThar Financial Technologies</div>
              <div><strong className="text-slate-800">Domain:</strong> pethar.co.uk</div>
              <div><strong className="text-slate-800">Effective Date:</strong> October 13, 2026</div>
              <div><strong className="text-slate-800">Status:</strong> Active & Compliant</div>
            </div>
          </div>
        </div>

        {/* Mandatory Google Limited Use Statement Box */}
        <div className="bg-amber-500/10 rounded-2xl p-6 sm:p-8 border border-amber-500/30">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-xl font-black shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-amber-950">
                Google API Services User Data Policy Compliance Statement
              </h3>
              <p className="text-sm text-amber-900 leading-relaxed font-sans">
                <strong>PeThar's use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold text-amber-950 hover:text-amber-800"
                >
                  Google API Services User Data Policy
                </a>, including the Limited Use requirements.</strong>
              </p>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                PeThar strictly restricts the use of all Google user data to providing and improving user-facing digital wallet and authentication features. We do not transfer or disclose Google user data to third parties for advertising, data broker services, or non-personalized AI/ML model training.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Application Identity & Contact */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {lang === 'ak' ? 'အက်ပ်အချက်အလက်နှင့် ဆက်သွယ်ရန်' : '1. Application Identity & Data Controller'}
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            This Privacy Policy applies to the <strong>PeThar</strong> multi-currency digital financial application, including the web portal (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">pethar.co.uk</code> and all associated subdomains), the Android mobile application (<strong>PeThar Wallet</strong>), and backend services provided by <strong>PeThar Financial Technologies</strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-xs text-slate-400 font-bold uppercase">Data Controller</div>
              <div className="font-bold text-slate-800 text-sm mt-1">PeThar Financial Technologies</div>
              <div className="text-xs text-slate-500 mt-0.5">United Kingdom & Arakan</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-xs text-slate-400 font-bold uppercase">Privacy & Data Requests</div>
              <a href="mailto:privacy@pethar.co.uk" className="font-bold text-amber-700 hover:underline text-sm mt-1 block">
                privacy@pethar.co.uk
              </a>
              <div className="text-xs text-slate-500 mt-0.5">Response within 48 hours</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-xs text-slate-400 font-bold uppercase">Customer Support</div>
              <a href="mailto:contact@pethar.co.uk" className="font-bold text-slate-800 hover:underline text-sm mt-1 block">
                contact@pethar.co.uk
              </a>
              <div className="text-xs text-slate-500 mt-0.5">Telegram: @petharsupport</div>
            </div>
          </div>
        </section>

        {/* Section 2: What Google User Data is Accessed & Collected */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {lang === 'ak' ? 'ရယူစုဆောင်းသော Google ဒေတာနှင့် အချက်အလက်များ' : '2. What Google User Data We Access & Collect'}
            </h2>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Our application accesses and collects only the minimum necessary data required to create, authenticate, and maintain your user account. We may collect or process the following categories of data when you use or interact with our services:
          </p>

          <div className="space-y-4">
            {/* Google OAuth Data */}
            <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-3">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-base">
                <UserCheck className="w-5 h-5 text-sky-600" />
                <span>Google User Data (via Google Sign-In / OAuth 2.0)</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                <li>
                  <strong>Primary Email Address (<code className="text-xs bg-white px-1.5 py-0.5 rounded border border-sky-200">email</code> scope):</strong> Used as your unique account identifier, for sending critical transactional confirmations, security notifications, and password/PIN recovery links.
                </li>
                <li>
                  <strong>Profile Name and Display Info (<code className="text-xs bg-white px-1.5 py-0.5 rounded border border-sky-200">profile</code> scope):</strong> Your full name and profile avatar URL, used to personalize your dashboard interface and identify your account during peer-to-peer transfers.
                </li>
                <li>
                  <strong>Unique Google User ID (<code className="text-xs bg-white px-1.5 py-0.5 rounded border border-sky-200">sub</code> / UID):</strong> An immutable token issued by Google OAuth used to securely authenticate your session across devices without storing Google credentials.
                </li>
              </ul>
            </div>

            {/* Other Personal Data */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Database className="w-5 h-5 text-slate-700" />
                <span>User-Provided Authentication & Contact Details</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                <li>
                  <strong>Phone Number:</strong> Collected strictly when you select SMS Phone Authentication for sending one-time verification passcodes (OTP).
                </li>
                <li>
                  <strong>Email & Password:</strong> Salted and hashed using Argon2/bcrypt if you register using email/password authentication.
                </li>
              </ul>
            </div>

            {/* Financial Ledger & Wallet Data */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-base">
                <Key className="w-5 h-5 text-amber-700" />
                <span>Financial Ledger & Cryptographic Information</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                <li>
                  <strong>Public Wallet Address:</strong> Ed25519 public key used for sending and receiving digital transfers.
                </li>
                <li>
                  <strong>Transaction Records:</strong> Transfer amounts in Arakan Dollar (AKD), USD, and MMK, timestamps, counterparty public addresses, and cryptographic verification signatures.
                </li>
                <li>
                  <strong>Private Key Protection:</strong> <span className="font-semibold text-emerald-800">Your cryptographic private keys never leave your device.</span> They are generated and isolated inside Apple Secure Enclave / Android Keystore. PeThar servers NEVER access, store, or transmit your private keys.
                </li>
              </ul>
            </div>

            {/* Device & Technical Logs */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Server className="w-5 h-5 text-slate-700" />
                <span>Technical & Security Logs</span>
              </div>
              <p className="text-sm text-slate-700">
                IP address, device model, operating system version, client timestamps, and crash diagnostic logs collected automatically to maintain session security, prevent distributed denial-of-service (DDoS) attacks, enforce rate-limiting, and detect fraudulent transactions.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: How We Use Google User Data */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {lang === 'ak' ? 'Google ဒေတာအား မည်သို့ အသုံးပြုသနည်း' : '3. How We Use Google User Data'}
            </h2>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            We will use your data exclusively to provide, maintain, and protect the services you requested. Specifically:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                User Authentication & Session Management
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                To authenticate your identity, verify that you are the legitimate owner of the account, establish secure encrypted sessions, and enable seamless multi-device sign-in.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Service Provision & Ledger Sync
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                To bind your public wallet address to your authenticated identity, display account balances (AKD, USD, MMK), synchronize transaction receipts, and enable Arakan QR payments.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Transaction Alerts & Communications
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                To send you essential notifications regarding your transfers, deposit confirmations, security alerts regarding unusual login locations, and customer service responses.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Fraud Prevention & Regulatory Compliance
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                To detect and mitigate malicious attempts, unauthorized account takeover, phishing attacks, and enforce anti-money laundering (AML) transaction safeguards.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Strict Prohibitions on Data Use */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {lang === 'ak' ? 'ဒေတာ အသုံးပြုမှု တားမြစ်ချက်များ' : '4. Strict Prohibitions & Permitted Use Limits'}
            </h2>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            In strict compliance with Google OAuth and API Terms, our policy guarantees the following prohibitions:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            {[
              { title: 'No Sale to Data Brokers', desc: 'We do not sell, license, or trade Google user data to data brokers, marketing networks, or info resellers.' },
              { title: 'No Targeted Advertising', desc: 'We do not use Google user data for targeted ads, personalized advertisements, or retargeted campaigns.' },
              { title: 'No Credit Scoring / Lending', desc: 'We do not use Google user data to evaluate creditworthiness or for consumer lending purposes.' },
              { title: 'No Non-Personalized AI/ML Training', desc: 'Google Workspace APIs and user data are never used to train generalized or non-personalized AI/ML models.' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-red-50/50 border border-red-200/60 space-y-1">
                <div className="font-bold text-red-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {item.title}
                </div>
                <div className="text-red-900/80 text-xs leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: With Whom We Share, Transfer, or Disclose Data */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              5
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {lang === 'ak' ? 'ဒေတာ မျှဝေခြင်းနှင့် လွှဲပြောင်းခြင်း' : '5. Data Sharing, Transfer & Third-Party Disclosures'}
            </h2>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/70 text-emerald-950 text-sm font-semibold">
            "We do not transfer or disclose your information to third parties for purposes other than providing and maintaining the PeThar application services."
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            We share information only with trusted third-party service providers (sub-processors) who process data on our behalf under strict data processing agreements:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <div className="font-bold text-slate-900 text-sm">Google Cloud Platform & Google Firebase</div>
                <div className="text-xs text-slate-500">Authentication, Cloud Firestore, Cloud Storage, Hosting</div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-slate-700 w-fit">
                Primary Infrastructure
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <div className="font-bold text-slate-900 text-sm">Telecommunication / SMS Gateways</div>
                <div className="text-xs text-slate-500">Delivering one-time verification passcodes (OTP) for Phone Sign-in</div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-slate-700 w-fit">
                SMS Delivery Only
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <div className="font-bold text-slate-900 text-sm">Legal & Law Enforcement Authorities</div>
                <div className="text-xs text-slate-500">Only when mandated by binding judicial orders or applicable law</div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-slate-700 w-fit">
                Statutory Compliance
              </span>
            </div>
          </div>
        </section>

        {/* Section 6: Data Protection Mechanisms */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              6
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {lang === 'ak' ? 'လုံခြုံရေးနှင့် စာဝှက်စနစ် ကာကွယ်မှုများ' : '6. Data Protection & Cryptographic Security Mechanisms'}
            </h2>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Security procedures and state-of-the-art cryptographic safeguards are actively in place to ensure the confidentiality, integrity, and availability of all user data:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Lock className="w-4 h-4 text-amber-600" />
                Encryption in Transit (TLS 1.3 / HTTPS)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                All network communication between your device and our servers is strictly transmitted over HTTPS with Transport Layer Security (TLS 1.3) using authenticated cipher suites.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Server className="w-4 h-4 text-amber-600" />
                Encryption at Rest (AES-256)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                All cloud database records in Google Cloud and Firebase are protected with AES-256 hardware-accelerated encryption at rest. Client cache databases are encrypted with SQLCipher AES-256.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Cpu className="w-4 h-4 text-amber-600" />
                Hardware Security Enclave (Keystore / Enclave)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Private signing keys never leave your device. They are generated and isolated inside Apple Secure Enclave (iOS) and Android Keystore (Android), guarded by biometric Face ID / Fingerprint lock.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Firebase Security Rules & Tenant Isolation
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict granular security rules enforce complete row-level isolation in Cloud Firestore. No user can read, query, or mutate records belonging to another account.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7: Data Retention & Deletion Policy */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              7
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {lang === 'ak' ? 'ဒေတာ ထိန်းသိမ်းခြင်းနှင့် ဖျက်သိမ်းခြင်း မူဝါဒ' : '7. Data Retention & Deletion Policy'}
            </h2>
          </div>

          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>
              We store your personal information for a period of time consistent with our business purposes and applicable financial record-keeping standards. We retain your personal information for the length of time needed to fulfill the purposes outlined in this privacy policy unless a longer retention period is required or permitted by law.
            </p>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <Trash2 className="w-5 h-5 text-red-600" />
                User Rights & Step-by-Step Deletion Procedure
              </div>
              <p className="text-xs sm:text-sm text-slate-700">
                You have the full right to delete your account, withdraw consent, and purge your personal information at any time:
              </p>
              <ol className="space-y-2 text-xs sm:text-sm text-slate-700 list-decimal list-inside font-medium">
                <li>
                  <strong>Option A (In-App Deletion):</strong> In the PeThar application, navigate to <strong>Profile → Account Settings → Delete Account</strong>. Confirming deletion immediately terminates active sessions and queues account data for purging.
                </li>
                <li>
                  <strong>Option B (Email Deletion Request):</strong> Send an email to our Data Protection Officer at{' '}
                  <a href="mailto:privacy@pethar.co.uk" className="font-bold text-amber-700 underline">
                    privacy@pethar.co.uk
                  </a>{' '}
                  or{' '}
                  <a href="mailto:pethar-app@protonmail.com" className="font-bold text-amber-700 underline">
                    pethar-app@protonmail.com
                  </a>{' '}
                  with the subject line <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">"Data Deletion Request"</code> from your registered email address.
                </li>
              </ol>

              <div className="pt-2 text-xs text-slate-500 border-t border-slate-200">
                <strong className="text-slate-800">Deletion Timeline:</strong> Upon receiving your verified deletion request, all Google user profile data, credentials, and associated identifiers will be permanently destroyed and erased from our active Firebase Authentication and Firestore databases within <strong>thirty (30) days</strong>.
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Children's Privacy & Updates */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              8
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {lang === 'ak' ? 'မူဝါဒ အပြောင်းအလဲများနှင့် အတည်ပြုချက်' : '8. Policy Updates & Notifications'}
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect modifications in our operational practices, regulatory updates, or enhancements to Google API requirements. If any material changes are made regarding how we access or process Google user data, we will prominently notify users via email notification and in-app system alerts prior to implementation.
          </p>
          <div className="text-xs text-slate-500 pt-2 font-mono">
            Latest revision published: October 13, 2026 · Registered under PeThar Financial Technologies
          </div>
        </section>

      </div>
    </BaseLayout>
  );
};
