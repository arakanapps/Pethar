import { useState } from 'react'
import { ArakanEmblem } from '../components/ArakanEmblem'
import {
  Shield, Zap, Globe, Smartphone, Monitor, CreditCard,
  ArrowRight, Download, Apple, Eye, EyeOff, Lock,
  QrCode, Users, TrendingUp, ChevronDown, ExternalLink,
  Wallet, BadgeCheck, Fingerprint, Send
} from 'lucide-react'

interface LandingPageProps {
  onEnterApp: () => void
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const [showLogin, setShowLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginId, setLoginId] = useState('')
  const [loginPin, setLoginPin] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    onEnterApp()
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#050810]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArakanEmblem size={32} variant="badge" />
            <div>
              <span className="text-lg font-black tracking-wider">PeThar</span>
              <span className="text-xs text-amber-400 font-mono ml-2">ဖေ့သာ</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#about" className="hover:text-white transition">About Arakan</a>
            <a href="#download" className="hover:text-white transition">Download</a>
            <a href="#security" className="hover:text-white transition">Security</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogin(true)}
              className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition"
            >
              Sign In
            </button>
            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-red-700 to-amber-600 rounded-xl hover:from-red-600 hover:to-amber-500 transition shadow-lg shadow-red-900/30"
            >
              Open App
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-red-900/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-900/8 blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-900/5 blur-[80px]" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '80px 80px'
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-red-800/40 bg-red-950/30 text-red-300 text-xs font-semibold backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Arakan National Financial Infrastructure
          </div>

          {/* Hero emblem */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600/30 to-amber-500/20 blur-3xl scale-150" />
              <ArakanEmblem size={100} variant="badge" className="relative drop-shadow-2xl" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              The Future of
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-500 via-amber-400 to-amber-300 bg-clip-text text-transparent">
              Arakan Finance
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            PeThar (ဖေ့သာ) is the sovereign digital wallet for Arakan communities worldwide.
            Send, receive, and manage your Arakan Dollars (AKD) — backed by USD reserves and secured with military-grade encryption.
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-10 font-medium">
            အာရက္ခပြည်သူတိုင်းအတွက် လုံခြုံ၊ ရိုးရှင်းပြီး ယုံကြည်စိတ်ချရသော ဒစ်ဂျစ်တယ် ငွေကြေးစနစ်
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterApp}
              className="group flex items-center gap-2 px-8 py-4 text-base font-bold bg-gradient-to-r from-red-700 via-red-600 to-amber-600 rounded-2xl hover:from-red-600 hover:via-red-500 hover:to-amber-500 transition-all shadow-2xl shadow-red-900/40 hover:shadow-red-800/50 hover:scale-[1.02]"
            >
              Launch Web Wallet
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#download"
              className="flex items-center gap-2 px-8 py-4 text-base font-bold border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition backdrop-blur-sm"
            >
              <Download size={18} />
              Download App
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Active Wallets', value: '12,400+' },
              { label: 'AKD in Circulation', value: '₳ 2.4M' },
              { label: 'Agent Network', value: '320+' },
              { label: 'Countries Served', value: '18' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex justify-center">
            <ChevronDown size={24} className="text-gray-600 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ABOUT ARAKAN
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/5 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-amber-800/30 bg-amber-950/20 text-amber-400 text-xs font-semibold">
                <Globe size={14} />
                Our Story
              </div>
              <h2 className="text-4xl font-black mb-6 leading-tight">
                Built for the
                <br />
                <span className="bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">
                  Arakan People
                </span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Arakan (Rakhine) is a historic nation on the Bay of Bengal with a rich heritage of maritime trade,
                the Mrauk-U kingdom, and a vibrant diaspora spanning Thailand, Malaysia, Japan, and beyond.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                PeThar was created because Arakan communities deserve financial tools that are
                <span className="text-white font-semibold"> sovereign, accessible, and dignified</span>.
                Whether you're sending money home from Bangkok, paying a merchant in Sittwe, or saving for
                your family's future — PeThar serves you.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                အာရက္ခပြည်သူတွေ ကမ္ဘာ့ဘယ်နေရာမှာပဲ ရှိနေနေ ငွေကြေးလုံခြုံမှုနှင့် လွတ်လပ်မှုကို ရရှိထိုက်ပါသည်။
                ဖေ့သာသည် ထိုမျှော်လင့်ချက်ကို ဖြစ်မြောက်စေရန် တည်ဆောက်ထားခြင်းဖြစ်ပါသည်။
              </p>
            </div>

            {/* Right side — info cards */}
            <div className="space-y-4">
              {[
                {
                  icon: <Wallet size={20} className="text-amber-400" />,
                  title: 'Arakan Dollar (AKD)',
                  desc: 'Our unit of account pegged 1:1 to USD, backed by audited reserves with double-entry cryptographic ledger.',
                },
                {
                  icon: <Users size={20} className="text-cyan-400" />,
                  title: 'Global Diaspora Connected',
                  desc: 'From Sittwe to Bangkok, KL to Tokyo — send and receive across borders with transparent FX rates.',
                },
                {
                  icon: <Shield size={20} className="text-emerald-400" />,
                  title: 'Sovereign & Community-Owned',
                  desc: 'Not a bank product. Built by Arakan engineers for Arakan people. Your data stays yours.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/10 transition group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{card.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-28 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-cyan-800/30 bg-cyan-950/20 text-cyan-400 text-xs font-semibold">
              <Zap size={14} />
              Platform Features
            </div>
            <h2 className="text-4xl font-black mb-4">
              Everything You Need,{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Nothing You Don't
              </span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From everyday transfers to international remittances — PeThar does it all in one secure wallet.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Send size={22} />,
                title: 'Instant P2P Transfers',
                desc: 'Send AKD to anyone using phone number, PeThar ID, or QR code. Zero fees for domestic transfers.',
                color: 'from-red-500 to-red-700',
                glow: 'shadow-red-900/20',
              },
              {
                icon: <QrCode size={22} />,
                title: 'QR Scan & Pay',
                desc: 'Point your camera and pay. Works offline with signed vouchers that reconcile when you reconnect.',
                color: 'from-cyan-500 to-blue-600',
                glow: 'shadow-cyan-900/20',
              },
              {
                icon: <CreditCard size={22} />,
                title: 'Virtual Debit Card',
                desc: 'International Visa/Mastercard for online shopping. Freeze instantly from your wallet.',
                color: 'from-amber-500 to-amber-700',
                glow: 'shadow-amber-900/20',
              },
              {
                icon: <Globe size={22} />,
                title: 'International Remittance',
                desc: 'Send money to Thailand, Malaysia, Singapore, and 15+ countries. Transparent FX with zero hidden fees.',
                color: 'from-emerald-500 to-teal-600',
                glow: 'shadow-emerald-900/20',
              },
              {
                icon: <TrendingUp size={22} />,
                title: 'Crypto & Stablecoin Bridge',
                desc: 'Swap USDT to AKD through Binance and MEXC integrations. Proof of reserves verified on-chain.',
                color: 'from-purple-500 to-indigo-600',
                glow: 'shadow-purple-900/20',
              },
              {
                icon: <Monitor size={22} />,
                title: 'Merchant POS Terminal',
                desc: 'Accept payments with a full cashier register. Preset amounts, thermal receipts, daily settlement.',
                color: 'from-orange-500 to-red-600',
                glow: 'shadow-orange-900/20',
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className={`group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all hover:-translate-y-1 shadow-xl ${feat.glow}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feat.icon}
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECURITY
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="security" className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-emerald-800/30 bg-emerald-950/20 text-emerald-400 text-xs font-semibold">
              <Fingerprint size={14} />
              Security First
            </div>
            <h2 className="text-4xl font-black mb-4">
              Bank-Grade Security,{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                No Compromises
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Lock size={20} />, title: 'AES-256-GCM Encryption', desc: 'All identity and transaction data encrypted at rest and in transit.' },
              { icon: <Fingerprint size={20} />, title: 'Biometric Auth', desc: 'Face ID, fingerprint, and 6-digit PIN with hardware-backed keystore.' },
              { icon: <Shield size={20} />, title: 'Panic PIN (999999)', desc: 'Shows a decoy 25 AKD balance and silently alerts your community under duress.' },
              { icon: <BadgeCheck size={20} />, title: 'KYC/AML Compliant', desc: 'Identity verification, sanctions screening, and transaction monitoring built-in.' },
            ].map((sec) => (
              <div key={sec.title} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] text-center hover:bg-white/[0.04] transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                  {sec.icon}
                </div>
                <h3 className="font-bold text-sm text-white mb-1">{sec.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{sec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          DOWNLOAD SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="download" className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/5 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-amber-800/30 bg-amber-950/20 text-amber-400 text-xs font-semibold">
              <Download size={14} />
              Get PeThar
            </div>
            <h2 className="text-4xl font-black mb-4">
              Download for{' '}
              <span className="bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">
                Every Platform
              </span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Available on Android, iOS, Windows, macOS, Linux, and the Web. One wallet, everywhere.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Android */}
            <a
              href="#"
              className="group relative flex items-center gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-emerald-950/20 hover:border-emerald-800/30 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Smartphone size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Download for</div>
                <div className="text-lg font-bold text-white">Android</div>
                <div className="text-xs text-gray-500">APK • Google Play</div>
              </div>
              <ExternalLink size={16} className="absolute top-5 right-5 text-gray-600 group-hover:text-emerald-400 transition" />
            </a>

            {/* iOS */}
            <a
              href="#"
              className="group relative flex items-center gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-blue-950/20 hover:border-blue-800/30 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-black shadow-lg shrink-0">
                <Apple size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Download for</div>
                <div className="text-lg font-bold text-white">iOS (iPhone / iPad)</div>
                <div className="text-xs text-gray-500">App Store • TestFlight</div>
              </div>
              <ExternalLink size={16} className="absolute top-5 right-5 text-gray-600 group-hover:text-blue-400 transition" />
            </a>

            {/* macOS */}
            <a
              href="#"
              className="group relative flex items-center gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-purple-950/20 hover:border-purple-800/30 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Monitor size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Download for</div>
                <div className="text-lg font-bold text-white">macOS</div>
                <div className="text-xs text-gray-500">Apple Silicon & Intel</div>
              </div>
              <ExternalLink size={16} className="absolute top-5 right-5 text-gray-600 group-hover:text-purple-400 transition" />
            </a>

            {/* Windows */}
            <a
              href="#"
              className="group relative flex items-center gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-cyan-950/20 hover:border-cyan-800/30 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Monitor size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Download for</div>
                <div className="text-lg font-bold text-white">Windows</div>
                <div className="text-xs text-gray-500">Windows 10+ (64-bit)</div>
              </div>
              <ExternalLink size={16} className="absolute top-5 right-5 text-gray-600 group-hover:text-cyan-400 transition" />
            </a>

            {/* Linux */}
            <a
              href="#"
              className="group relative flex items-center gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-orange-950/20 hover:border-orange-800/30 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Monitor size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Download for</div>
                <div className="text-lg font-bold text-white">Linux</div>
                <div className="text-xs text-gray-500">AppImage • .deb • .rpm</div>
              </div>
              <ExternalLink size={16} className="absolute top-5 right-5 text-gray-600 group-hover:text-orange-400 transition" />
            </a>

            {/* Web App */}
            <button
              onClick={onEnterApp}
              className="group relative flex items-center gap-4 p-6 rounded-2xl border border-amber-700/30 bg-amber-950/10 hover:bg-amber-950/30 hover:border-amber-600/40 transition-all hover:-translate-y-1 text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Globe size={24} />
              </div>
              <div>
                <div className="text-xs text-amber-500 mb-0.5 font-semibold">Open Now</div>
                <div className="text-lg font-bold text-white">Web App</div>
                <div className="text-xs text-gray-500">No download required</div>
              </div>
              <ArrowRight size={16} className="absolute top-5 right-5 text-amber-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FX RATES TICKER
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Live Exchange Rates</h3>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm">
            {[
              { pair: 'AKD / USD', rate: '1.00', flag: '🇺🇸' },
              { pair: 'AKD / THB', rate: '35.80', flag: '🇹🇭' },
              { pair: 'AKD / MYR', rate: '4.72', flag: '🇲🇾' },
              { pair: 'AKD / SGD', rate: '1.34', flag: '🇸🇬' },
              { pair: 'AKD / EUR', rate: '0.92', flag: '🇪🇺' },
              { pair: 'AKD / USDT', rate: '1.00', flag: '💎' },
            ].map((fx) => (
              <div key={fx.pair} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-lg">{fx.flag}</span>
                <div>
                  <div className="text-xs text-gray-500 font-mono">{fx.pair}</div>
                  <div className="font-bold text-white font-mono">{fx.rate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA + LOGIN SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="login" className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-red-950/10 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left CTA */}
            <div>
              <h2 className="text-4xl font-black mb-4 leading-tight">
                Ready to Join the{' '}
                <span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
                  Arakan Network?
                </span>
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Create your wallet in under 60 seconds. No bank account needed.
                Just your phone number and a 6-digit PIN.
              </p>
              <ul className="space-y-3 text-sm text-gray-400">
                {[
                  'Free domestic transfers — zero fees forever',
                  'USD-backed AKD with transparent reserves',
                  'Works offline with signed vouchers',
                  'Arakanese-first, plain-language interface',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Login Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-amber-600/10 rounded-3xl blur-2xl" />
              <div className="relative p-8 rounded-3xl border border-white/10 bg-[#0A0E17]/90 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <ArakanEmblem size={28} variant="badge" />
                  <div>
                    <h3 className="font-bold text-white">Sign In to PeThar</h3>
                    <p className="text-xs text-gray-500">Access your Arakan wallet</p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-semibold">PeThar ID or Phone</label>
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="ARAK-XXXX or +66..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 outline-none transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-semibold">6-Digit PIN</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPin}
                        onChange={(e) => setLoginPin(e.target.value)}
                        placeholder="● ● ● ● ● ●"
                        maxLength={6}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 outline-none transition text-sm tracking-[0.3em] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold text-sm hover:from-red-600 hover:to-amber-500 transition shadow-lg shadow-red-900/30 active:scale-[0.98]"
                  >
                    Sign In
                  </button>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex-1 h-px bg-white/5" />
                    <span>or</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>

                  <button
                    type="button"
                    onClick={onEnterApp}
                    className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 font-semibold text-sm hover:bg-white/10 transition flex items-center justify-center gap-2"
                  >
                    <QrCode size={16} />
                    Scan QR to Login
                  </button>

                  <p className="text-center text-xs text-gray-600 mt-2">
                    Don't have an account?{' '}
                    <button type="button" onClick={onEnterApp} className="text-amber-500 font-semibold hover:text-amber-400 transition">
                      Create Wallet
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ArakanEmblem size={24} variant="badge" />
                <span className="font-black text-white">PeThar</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Arakan National Financial Infrastructure.
                Sovereign digital wallet for the Arakan people.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Product</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <a href="#features" className="block hover:text-white transition">Features</a>
                <a href="#download" className="block hover:text-white transition">Download</a>
                <a href="#security" className="block hover:text-white transition">Security</a>
                <button onClick={onEnterApp} className="block hover:text-white transition">Web App</button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Company</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <a href="#about" className="block hover:text-white transition">About</a>
                <a href="#" className="block hover:text-white transition">Careers</a>
                <a href="#" className="block hover:text-white transition">Press</a>
                <a href="#" className="block hover:text-white transition">Contact</a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Legal</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <a href="#" className="block hover:text-white transition">Terms of Service</a>
                <a href="#" className="block hover:text-white transition">Privacy Policy</a>
                <a href="#" className="block hover:text-white transition">AML/KYC Policy</a>
                <a href="#" className="block hover:text-white transition">FX Rate Disclosure</a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">
              © 2026 PeThar (ဖေ့သာ). All rights reserved.
            </p>
            <p className="text-xs text-gray-700">
              Made with ❤️ for the Arakan people · အာရက္ခပြည်သူများအတွက်
            </p>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════
          LOGIN MODAL (triggered from nav)
      ═══════════════════════════════════════════════════════════════════ */}
      {showLogin && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="relative w-full max-w-md p-8 rounded-3xl border border-white/10 bg-[#0A0E17] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition text-xl"
            >
              ×
            </button>

            <div className="flex items-center gap-3 mb-6">
              <ArakanEmblem size={36} variant="badge" />
              <div>
                <h3 className="text-xl font-black text-white">Welcome Back</h3>
                <p className="text-xs text-gray-500">Sign in to your PeThar wallet</p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setShowLogin(false); onEnterApp(); }} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-semibold">PeThar ID or Phone</label>
                <input
                  type="text"
                  placeholder="ARAK-XXXX or +66..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-semibold">6-Digit PIN</label>
                <input
                  type="password"
                  placeholder="● ● ● ● ● ●"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 outline-none transition text-sm tracking-[0.3em] font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold text-sm hover:from-red-600 hover:to-amber-500 transition shadow-lg shadow-red-900/30"
              >
                Sign In
              </button>
              <p className="text-center text-xs text-gray-600">
                New user?{' '}
                <button type="button" onClick={() => { setShowLogin(false); onEnterApp(); }} className="text-amber-500 font-semibold hover:text-amber-400">
                  Create Wallet
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
