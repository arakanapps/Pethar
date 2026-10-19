// ── Péthar Arakan Design Tokens & Core Data ─────────────────────

export const colors = {
  // Arakan Royal Crimson & Ruby
  crimson: '#D91624',
  crimsonDark: '#990000',
  crimsonDeep: '#590000',
  crimsonMuted: '#2D0A0E',

  // Arakan Royal Gold & Mrauk-U Heritage
  gold: '#D4AF37',
  goldLight: '#F5E6A3',
  goldDark: '#9E7812',

  // Obsidian & Cyber Security Surfaces
  obsidian: '#090D14',
  surfaceDark: '#101724',
  surfaceCard: '#172235',
  slateBorder: '#283852',
  slateLight: '#475569',

  // Clean Paper & Highlights
  paper: '#F8FAFC',
  paperCard: '#FFFFFF',
  cyanNeon: '#00F0FF',
  emeraldSuccess: '#10B981',
}

export interface Txn {
  id: string
  refId: string
  title: string
  titleMm: string
  category: 'transfer' | 'p2p' | 'cashout' | 'crypto' | 'remittance' | 'pos' | 'card' | 'Bills' | string
  amount: number
  currency: string
  time: string
  status: 'SETTLED' | 'VERIFIED' | 'PENDING'
  counterparty: string
  counterpartyMm: string
  fee: number
  hash: string
}

// Live data: All transactions are fetched dynamically from Supabase
export const transactions: Txn[] = []

// Live data: Contacts are fetched dynamically from Supabase 'favorite_contacts'
export const contacts: { name: string; mm: string; id: string; location: string; phone: string; initials: string }[] = []

export interface UserProfile {
  username: string // cant change
  uid: string // user_id = wallet address = uid (cant change)
  walletAddress: string // cant change
  usdAccountWalletAddress: string // cant change
  nationalIdNo: string // cant change
  dob: string // cant change
  firstName: string // can change (needs review + email OTP)
  lastName: string // can change (needs review + email OTP)
  name: string
  nickname: string // can change
  email: string // can change (needs verified OTP)
  phone: string // can change (needs email verified OTP)
  pin?: string // can change (needs current pin or email OTP)
  address: string // can change
  avatarUrl?: string // can change (user profile pic)
  akdWalletBalance: number // cant change directly
  usdAccountBalance: number // cant change directly
  totalBalance: number // total balance change
  petharId: string
  location: string
  gender?: string
  idType?: string
  accountTier: string
  kycTier?: 1 | 2
  kycStatus?: 'unverified' | 'email_verified' | 'pending_review' | 'verified'
}

export const initialUserProfile: UserProfile = {
  username: '',
  uid: '',
  walletAddress: '',
  usdAccountWalletAddress: '',
  nationalIdNo: '',
  dob: '',
  firstName: '',
  lastName: '',
  name: '',
  nickname: '',
  email: '',
  phone: '',
  pin: '',
  gender: 'Male',
  idType: 'National ID',
  address: '',
  avatarUrl: '',
  akdWalletBalance: 0.00,
  usdAccountBalance: 0.00,
  totalBalance: 0.00,
  petharId: '',
  location: 'Sittwe · စစ်တွေ',
  accountTier: 'KYC Level 1',
  kycTier: 1,
  kycStatus: 'unverified',
}

/**
 * Generates a standardized UID in format: yearmmddusercount (e.g. 202610190001)
 */
export function generateUserUid(userCount: number = 1, date: Date = new Date()): string {
  const y = date.getFullYear().toString().padStart(4, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const count = userCount.toString().padStart(4, '0')
  return `${y}${m}${d}${count}`
}

export interface Agent {
  code: string
  name: string
  mm: string
  township: string
  townshipMm: string
  distance: string
  floatStatus: 'High' | 'Medium' | 'Low'
  floatStatusMm: string
  phone: string
  cashReserveAkd: number
  open: boolean
}

// Live data: Agents are fetched dynamically from Supabase 'agents'
export const agents: Agent[] = []

export interface WalletBalance {
  currency: string
  code: string
  symbol: string
  balance: number
  totalBalance: number
  pendingBalance: number
  labelEn: string
  labelMm: string
  totalLabelEn: string
  totalLabelMm: string
  isReserveBacked?: boolean
  usdEquivalent: number
}

export const wallets: WalletBalance[] = [
  {
    currency: 'AKD',
    code: 'AKD',
    symbol: '₳',
    balance: 0.00,
    totalBalance: 0.00,
    pendingBalance: 0.0,
    labelEn: 'Available Balance',
    labelMm: 'ရရှိနိုင်သော လက်ကျန်ငွေ',
    totalLabelEn: 'Total Balance',
    totalLabelMm: 'စုစုပေါင်း လက်ကျန်ငွေ',
    isReserveBacked: true,
    usdEquivalent: 0.00,
  },
]

export interface FxRateItem {
  pair: string
  name: string
  nameMm: string
  rate: number
  change24h: string
  high24h: number
  low24h: number
  trend: 'up' | 'down' | 'flat'
}

// Live data: FX rates are fetched dynamically from Supabase 'fx_rate_board'
export const liveFxRates: FxRateItem[] = []

export interface QuickPosItem {
  id: string
  name: string
  nameMm: string
  price: number
  category: string
}

export const quickPosItems: QuickPosItem[] = []

export const legalDocs = {
  terms: {
    titleEn: 'Terms and Conditions of Financial Operations',
    titleMm: 'အာရက္ခငွေကြေးဝန်ဆောင်မှု စည်းမျဉ်းနှင့် သဘောတူညီချက်များ',
    sections: [
      {
        hEn: '1. Legal Status & Arakan Currency',
        hMm: '၁။ ဥပဒေရေးရာ အဆင့်အတန်းနှင့် အမျိုးသားဒစ်ဂျစ်တယ် ငွေကြေး',
        pEn: 'Péthar is the institutional financial technology infrastructure for the Arakan nation. The platform operates under the authority of the Arakan Digital Financial Regulatory Commission. The official unit of account is the Arakan Dollar, pegged 1:1 against USD value reserves. Myanmar Kyat (MMK) is completely deprecated and non-circulating on this ledger.',
        pMm: 'ဖေ့သာသည် အာရက္ခပြည်သူများအတွက် ဖွဲ့စည်းတည်ထောင်ထားသော အမျိုးသားအဆင့် ဒစ်ဂျစ်တယ်ဘဏ္ဍာရေးကွန်ရက်ဖြစ်ပါသည်။ တရားဝင်သုံးစွဲငွေကြေးမှာ "အာရက္ခဒေါ်လာ" ဖြစ်ပြီး ၁၀၀% အမေရိကန်ဒေါ်လာနှင့် ရွှေအာမခံဘဏ္ဍာတိုက်ဖြင့် ကျောထောက်နောက်ခံပြုထားပါသည်။ မြန်မာကျပ်ငွေ (MMK) အဟောင်း/ပြတ်လပ်မှုများကို လုံးဝအသုံးမပြုတော့ဘဲ စာရင်းစနစ်မှ ဖယ်ထုတ်ထားပြီးဖြစ်ပါသည်။',
      },
      {
        hEn: '2. Ledger Invariants & Double-Entry Integrity',
        hMm: '၂။ စာရင်းအင်း မပြောင်းလဲနိုင်သော လုံခြုံရေးသမာဓိ',
        pEn: 'All transactions are strictly double-entry, append-only, and signed cryptographically with Ed25519 signatures. No balance is ever mutable directly; balances are calculated through verified cryptographic hash chains. The platform enforces 100% reserve safeguarding with zero fractional reserve lending.',
        pMm: 'ငွေလွှဲ၊ ငွေသွင်း၊ ငွေထုတ် အားလုံးသည် စာရင်းနှစ်ထပ်စနစ် (Double-Entry) ဖြင့် စစ်ဆေးပြီး ဖျက်ပစ်ခြင်း၊ ပြင်ဆင်ခြင်း မပြုလုပ်နိုင်သော Append-Only စာရင်းစနစ်ဖြင့် မှတ်တမ်းတင်ပါသည်။ စနစ်အတွင်းရှိ ငွေကြေးအားလုံးသည် တကယ့်လက်တွေ့ ငွေသားအာမခံ ၁၀၀% အပြည့်အဝ ရှိပါသည်။',
      },
      {
        hEn: '3. Agent Network & Physical Cash Operations',
        hMm: '၃။ တရားဝင် အေးဂျင့်ဆိုင်များနှင့် ငွေသားကိုင်တွယ်မှု စည်းကမ်းများ',
        pEn: 'Authorized Péthar Agents must maintain physical currency liquidity and adhere to anti-gouging fee ceilings (maximum 0.5% fee on cash-out). All agent withdrawals require dynamic 6-digit cryptographic Time-based One-Time Passwords (TOTP) from the consumer.',
        pMm: 'တရားဝင် အာရက္ခဖေ့သာအေးဂျင့်များသည် သတ်မှတ်ထားသော ဝန်ဆောင်ခ နှုန်းထားထက် ပိုမိုတောင်းခံခြင်းမပြုရပါ။ စားသုံးသူများ ငွေထုတ်ယူရာတွင် မိမိဖုန်းထဲရှိ တစ်ခါသုံး လျှို့ဝှက်ကုဒ် (TOTP) ကို အေးဂျင့်အား ပြသ၍သာ ထုတ်ယူရမည်ဖြစ်သဖြင့် မသမာသူများ ခိုးယူထုတ်ယူနိုင်ခြင်းမရှိပါ။',
      },
    ],
  },
  privacy: {
    titleEn: 'Personal Data Protection Charter',
    titleMm: 'ကိုယ်ရေးအချက်အလက် ကာကွယ်ရေးနှင့် လုံခြုံရေး ပဋိညာဉ်',
    sections: [
      {
        hEn: '1. Zero Surveillance & Anonymized Enclaves',
        hMm: '၁။ အသုံးပြုသူများ၏ အချက်အလက်ကို မည်သည့်နိုင်ငံခြားအဖွဲ့အစည်းထံမှ မရောင်းချခြင်း',
        pEn: 'User identity records, phone numbers, and biometric proofs are encrypted using AES-256-GCM and zero-knowledge commitments. Under no circumstances is user data shared or sold to advertising brokers, foreign intelligence services, or hostile state entities.',
        pMm: 'အသုံးပြုသူများ၏ ဖုန်းနံပါတ်၊ ကိုယ်ရေးအချက်အလက်နှင့် လက်ဗွေ/မျက်နှာ အချက်အလက်များကို အဆင့်မြင့် လျှို့ဝှက်ကုဒ်စနစ် (AES-256) ဖြင့် ချိတ်ပိတ်ထားပါသည်။ မည်သည့်နိုင်ငံခြားကုမ္ပဏီ သို့မဟုတ် ပြင်ပရန်သူအဖွဲ့အစည်းထံသို့မျှ ပေါက်ကြားရောင်းချခြင်း လုံးဝမရှိစေရန် တာဝန်ယူပါသည်။',
      },
      {
        hEn: '2. Offline Voucher Data Protection',
        hMm: '၂။ အင်တာနက်လိုင်းမရှိချိန် အော့ဖ်လိုင်း ငွေလွှဲချက်များ၏ ကိုယ်ပိုင်လုံခြုံခွင့်',
        pEn: 'When transacting offline during telecom blackouts, transaction vouchers reside strictly on user devices in encrypted cryptographic containers until connectivity is restored, ensuring complete privacy even during air-gapped operations.',
        pMm: 'အင်တာနက်နှင့် ဖုန်းလိုင်းများ ဖြတ်တောက်ခံရချိန်တွင် ဖေ့သာ အော့ဖ်လိုင်းဘောက်ချာများသည် သင့်ဖုန်းအတွင်း၌သာ လုံခြုံစွာကိန်းအောင်းနေမည်ဖြစ်ပြီး အင်တာနက်ပြန်လည်ရရှိမှသာ စာရင်းချုပ်စနစ်သို့ လုံခြုံစွာ ပို့ဆောင်ပေးမည်ဖြစ်ပါသည်။',
      },
    ],
  },
  guidelines: {
    titleEn: 'Application Safety Guidelines & Anti-Scam Manual',
    titleMm: 'အက်ပ်အသုံးပြုနည်းနှင့် ငွေကြေးလိမ်လည်မှု ကာကွယ်ရေး လမ်းညွှန်',
    sections: [
      {
        hEn: '1. How to Protect Your 6-Digit PIN',
        hMm: '၁။ မိမိ၏ လုံခြုံရေး PIN နံပါတ် ၆ လုံးကို မည်သူ့ကိုမျှ မပြောပြရန်',
        pEn: 'Never share your 6-digit PIN with anyone, including individuals claiming to be Péthar customer support or official agents. Péthar staff will never ask for your PIN, seed phrase, or OTP.',
        pMm: 'ဖေ့သာဝန်ထမ်း သို့မဟုတ် အေးဂျင့်ဟု ပြောဆိုသူများ အပါအဝင် မည်သူ့ကိုမျှ သင်၏ လျှို့ဝှက် PIN နံပါတ် (၆) လုံးကို ပေးမသိပါနှင့်။ အမှန်တကယ် ပြဿနာဖြစ်ပါက အက်ပ်အတွင်းရှိ အတည်ပြုထားသော Support Chat တွင်သာ ဆက်သွယ်ပါ။',
      },
      {
        hEn: '2. Verifying Official Arakan Agents',
        hMm: '၂။ တရားဝင် အာရက္ခအေးဂျင့်ဆိုင် ဟုတ်မဟုတ် စစ်ဆေးနည်း',
        pEn: 'Always verify the Agent QR badge and check the Agent ID against the in-app verified directory before handing over physical cash or authorizing withdrawals.',
        pMm: 'ငွေသားမသွင်းမီ သို့မဟုတ် မထုတ်မီ ဆိုင်တွင် တရားဝင် ဖေ့သာ အေးဂျင့်တံဆိပ်ပြား (Arakan Royal Emblem ပါရှိသော QR) ရှိမရှိ စစ်ဆေးပါ။ အက်ပ်အတွင်းရှိ "အေးဂျင့်များ" စာရင်းတွင် ထိုဆိုင်ကုဒ် ပါဝင်မှုကို အတည်ပြုပါ။',
      },
      {
        hEn: '3. Emergency Duress PIN Instructions',
        hMm: '၃။ အရေးပေါ် အကျပ်အတည်းကြုံချိန် Panic PIN အသုံးပြုနည်း',
        pEn: 'If forced under duress to unlock your wallet, enter your pre-configured Duress PIN (default: 999999). The wallet will display a decoy balance of $25 and automatically transmit an encrypted silent alert to the community emergency registry.',
        pMm: 'မလိုလားအပ်သော အကျပ်ကိုင် ခြိမ်းခြောက်မှုကြုံရပါက မိမိ၏ အရေးပေါ် Panic PIN (ပုံမှန်အားဖြင့် ၉၉၉၉၉၉) ကို ရိုက်ထည့်နိုင်ပါသည်။ အက်ပ်သည် အတုအယောင်လက်ကျန်ငွေ ၂၅ ဒေါ်လာသာ ပြသပေးမည်ဖြစ်ပြီး အသံတိတ် အရေးပေါ်အချက်ပြစနစ်ကို အလိုအလျောက် ပေးပို့မည်ဖြစ်ပါသည်။',
      },
    ],
  },
}
