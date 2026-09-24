// ── PeThar Arakan Design Tokens & Core Data ─────────────────────

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
  category: 'p2p' | 'cashout' | 'crypto' | 'remittance' | 'pos' | 'card'
  amount: number
  currency: string
  time: string
  status: 'SETTLED' | 'VERIFIED' | 'PENDING'
  counterparty: string
  counterpartyMm: string
  fee: number
  hash: string
}

export const transactions: Txn[] = [
  {
    id: 'TX-9014',
    refId: 'ARAK-P2P-2026-9014',
    title: 'P2P Transfer to Ko Min Aung',
    titleMm: 'ကိုမင်းအောင် သို့ ငွေလွှဲခြင်း',
    category: 'p2p',
    amount: -350.0,
    currency: 'AKD',
    time: 'Today · 14:22',
    status: 'SETTLED',
    counterparty: 'Ko Min Aung (ARAK-8891)',
    counterpartyMm: 'ကိုမင်းအောင် (စစ်တွေ)',
    fee: 0.0,
    hash: '0x8f2a...c891',
  },
  {
    id: 'TX-9013',
    refId: 'ARAK-BN-2026-9013',
    title: 'Binance Pay USDT Inflow',
    titleMm: 'Binance မှ USDT ငွေသွင်းခြင်း',
    category: 'crypto',
    amount: 1500.0,
    currency: 'AKD',
    time: 'Today · 11:05',
    status: 'SETTLED',
    counterparty: 'Binance Pay Connect (1500 USDT inflow)',
    counterpartyMm: 'Binance ဒစ်ဂျစ်တယ်ငွေသွင်း',
    fee: 0.0,
    hash: '0x3e11...904b',
  },
  {
    id: 'TX-9012',
    refId: 'ARAK-POS-2026-9012',
    title: 'Merchant POS · Mrauk-U Solar Supplies',
    titleMm: 'မြောက်ဦးဆိုလာ အရောင်းဆိုင်တွင် ရှင်းပြီး',
    category: 'pos',
    amount: -125.5,
    currency: 'AKD',
    time: 'Yesterday · 16:40',
    status: 'SETTLED',
    counterparty: 'Mrauk-U Solar POS Terminal #04',
    counterpartyMm: 'မြောက်ဦးဆိုလာ အရောင်းဆိုင်',
    fee: 0.0,
    hash: '0xaa42...b712',
  },
  {
    id: 'TX-9011',
    refId: 'ARAK-AGT-2026-9011',
    title: 'Physical Cash-Out at Sittwe Main Agent',
    titleMm: 'စစ်တွေ အဓိကအေးဂျင့်တွင် ငွေသားထုတ်ယူမှု',
    category: 'cashout',
    amount: -500.0,
    currency: 'AKD',
    time: 'Yesterday · 10:18',
    status: 'SETTLED',
    counterparty: 'Agent #AK-001 · Sittwe Strand Road',
    counterpartyMm: 'အေးဂျင့် #AK-001 (စစ်တွေ ကမ်းနားလမ်း)',
    fee: 2.5,
    hash: '0xd714...fe09',
  },
  {
    id: 'TX-9010',
    refId: 'ARAK-WISE-2026-9010',
    title: 'Wise Global Wire from Bangkok (THB Corridor)',
    titleMm: 'Wise မှ ထိုင်း-အာရက္ခ နယ်စပ်ဖြတ်ကျော်ငွေလွှဲ',
    category: 'remittance',
    amount: 820.0,
    currency: 'AKD',
    time: '21 Sep · 09:30',
    status: 'SETTLED',
    counterparty: 'Daw Saw Mya (Bangkok, Wise Wire)',
    counterpartyMm: 'ဒေါ်စောမြ (ဘန်ကောက်)',
    fee: 1.0,
    hash: '0x718a...2214',
  },
  {
    id: 'TX-9009',
    refId: 'ARAK-VSA-2026-9009',
    title: 'International Visa Card Top-Up',
    titleMm: 'Visa ကတ်ဖြင့် အကောင့်အတွင်း ငွေသွင်းခြင်း',
    category: 'card',
    amount: 400.0,
    currency: 'AKD',
    time: '20 Sep · 19:15',
    status: 'SETTLED',
    counterparty: 'Visa Intl (Card ending in 4109)',
    counterpartyMm: 'နိုင်ငံတကာ Visa ကတ်',
    fee: 3.2,
    hash: '0x12c9...560a',
  },
]

export const contacts = [
  { name: 'Ko Min Aung', mm: 'ကိုမင်းအောင်', id: 'ARAK-8891', location: 'Sittwe · စစ်တွေ', phone: '+95 9 881 204 991', initials: 'MA' },
  { name: 'Ma Hnin Nu', mm: 'မနှင်းနု', id: 'ARAK-4402', location: 'Mrauk-U · မြောက်ဦး', phone: '+95 9 791 443 821', initials: 'HN' },
  { name: 'U Ba Thein', mm: 'ဦးဘသိန်း', id: 'ARAK-1982', location: 'Kyaukpyu · ကျောက်ဖြူ', phone: '+95 9 440 918 203', initials: 'BT' },
  { name: 'Daw Saw Mya', mm: 'ဒေါ်စောမြ', id: 'ARAK-7719', location: 'Thandwe · သံတွဲ', phone: '+95 9 961 882 109', initials: 'SM' },
  { name: 'Ko Kyaw Sein', mm: 'ကိုကျော်စိန်', id: 'ARAK-3305', location: 'Ramree · ရမ်းဗြဲ', phone: '+95 9 250 119 443', initials: 'KS' },
]

export interface UserProfile {
  name: string
  email: string
  phone: string
  petharId: string
  location: string
  accountTier: string
  avatarUrl?: string
}

export const initialUserProfile: UserProfile = {
  name: 'Jack',
  email: 'realjackhalder@gmail.com',
  phone: '+95 9 881 204 991',
  petharId: 'ARAK-8891-JACK',
  location: 'Sittwe · စစ်တွေ',
  accountTier: 'Normal',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
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

export const agents: Agent[] = [
  {
    code: 'AK-001',
    name: 'Shwe Sittwe Central Merchant Point',
    mm: 'ရွှေစစ်တွေ အဓိကဘဏ္ဍာရေးအေးဂျင့်',
    township: 'Sittwe Strand Road',
    townshipMm: 'စစ်တွေမြို့၊ ကမ်းနားလမ်း',
    distance: '180 m',
    floatStatus: 'High',
    floatStatusMm: 'ငွေသားအပြည့်ရှိ (High Float)',
    phone: '+95 9 881 000 101',
    cashReserveAkd: 85000,
    open: true,
  },
  {
    code: 'AK-042',
    name: 'Mrauk-U Ancient City Express Agent',
    mm: 'မြောက်ဦး မြို့လယ် အေးဂျင့်ဆိုင်',
    township: 'Mrauk-U Palace Road',
    townshipMm: 'မြောက်ဦး နန်းရာလမ်း',
    distance: '420 m',
    floatStatus: 'High',
    floatStatusMm: 'ငွေသားအပြည့်ရှိ (High Float)',
    phone: '+95 9 791 000 042',
    cashReserveAkd: 54000,
    open: true,
  },
  {
    code: 'AK-088',
    name: 'Kyaukpyu Deep Port Financial Center',
    mm: 'ကျောက်ဖြူ ဆိပ်ကမ်းကြီး ဘဏ္ဍာရေးကောင်တာ',
    township: 'Kyaukpyu Port Road',
    townshipMm: 'ကျောက်ဖြူ သင်္ဘောဆိပ်လမ်း',
    distance: '950 m',
    floatStatus: 'Medium',
    floatStatusMm: 'ငွေသားသင့်တင့်စွာရှိ (Medium)',
    phone: '+95 9 440 000 088',
    cashReserveAkd: 28000,
    open: true,
  },
  {
    code: 'AK-115',
    name: 'Thandwe Beach Gateway Agent',
    mm: 'သံတွဲ ကမ်းခြေလမ်းဆုံ ငွေသားကောင်တာ',
    township: 'Thandwe Main Market',
    townshipMm: 'သံတွဲမြို့မဈေးကြီး',
    distance: '1.4 km',
    floatStatus: 'Medium',
    floatStatusMm: 'ငွေသားသင့်တင့်စွာရှိ (Medium)',
    phone: '+95 9 961 000 115',
    cashReserveAkd: 32000,
    open: true,
  },
  {
    code: 'AK-204',
    name: 'Ramree Island Agricultural Service',
    mm: 'ရမ်းဗြဲကျွန်း စိုက်ပျိုးရေးနှင့်ငွေထုတ်အေးဂျင့်',
    township: 'Ramree Bogyoke Road',
    townshipMm: 'ရမ်းဗြဲ ဗိုလ်ချုပ်လမ်း',
    distance: '2.1 km',
    floatStatus: 'Low',
    floatStatusMm: 'ငွေသားအနည်းငယ်သာရှိ (Low)',
    phone: '+95 9 250 000 204',
    cashReserveAkd: 9500,
    open: true,
  },
]

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
    balance: 14850.0,
    totalBalance: 15200.0,
    pendingBalance: 350.0,
    labelEn: 'Available Balance',
    labelMm: 'ရရှိနိုင်သော လက်ကျန်ငွေ',
    totalLabelEn: 'Total Balance',
    totalLabelMm: 'စုစုပေါင်း လက်ကျန်ငွေ',
    isReserveBacked: true,
    usdEquivalent: 14850.0,
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

export const liveFxRates: FxRateItem[] = [
  { pair: 'AKD / USD', name: 'Arakan Dollar to US Dollar', nameMm: 'အာရက္ခဒေါ်လာ နှင့် အမေရိကန်ဒေါ်လာ', rate: 1.0, change24h: '+0.00%', high24h: 1.0, low24h: 1.0, trend: 'flat' },
  { pair: 'AKD / USDT', name: 'Arakan Dollar to Tether', nameMm: 'အာရက္ခဒေါ်လာ နှင့် USDT', rate: 1.0, change24h: '+0.00%', high24h: 1.0, low24h: 1.0, trend: 'flat' },
  { pair: 'AKD / THB', name: 'Arakan Dollar to Thai Baht', nameMm: 'အာရက္ခဒေါ်လာ နှင့် ထိုင်းဘတ်', rate: 35.8, change24h: '+0.42%', high24h: 36.1, low24h: 35.6, trend: 'up' },
  { pair: 'AKD / MYR', name: 'Arakan Dollar to Malaysian Ringgit', nameMm: 'အာရက္ခဒေါ်လာ နှင့် မလေးရှားရင်းဂစ်', rate: 4.72, change24h: '-0.15%', high24h: 4.75, low24h: 4.7, trend: 'down' },
  { pair: 'AKD / SGD', name: 'Arakan Dollar to Singapore Dollar', nameMm: 'အာရက္ခဒေါ်လာ နှင့် စင်ကာပူဒေါ်လာ', rate: 1.34, change24h: '+0.08%', high24h: 1.35, low24h: 1.33, trend: 'up' },
  { pair: 'AKD / EUR', name: 'Arakan Dollar to Euro', nameMm: 'အာရက္ခဒေါ်လာ နှင့် ဥရောပယူရို', rate: 0.92, change24h: '-0.21%', high24h: 0.93, low24h: 0.91, trend: 'down' },
  { pair: 'BTC / AKD', name: 'Bitcoin to Arakan Dollar', nameMm: 'ဘစ်ကွိုင် နှင့် အာရက္ခဒေါ်လာ', rate: 64500.0, change24h: '+2.85%', high24h: 65200.0, low24h: 63100.0, trend: 'up' },
]

export const quickPosItems = [
  { id: '1', name: 'Arakan Fragrant Rice (1 Bag)', nameMm: 'အာရက္ခပေါ်ဆန်းမွှေးဆန် ၁ အိတ်', price: 28.0, category: 'Food' },
  { id: '2', name: 'Diesel / Generator Fuel (5 Gal)', nameMm: 'ဒီဇယ် / မီးစက်ဆီ ၅ ဂါလံ', price: 22.5, category: 'Fuel' },
  { id: '3', name: 'Solar Storage Battery (100Ah)', nameMm: 'ဆိုလာ ဘက်ထရီအိုး ၁၀၀Ah', price: 110.0, category: 'Solar' },
  { id: '4', name: 'Essential Antibiotics & Care Kit', nameMm: 'အခြေခံဆေးဝါးနှင့် ရှေးဦးသူနာပြုစုစုံ', price: 15.0, category: 'Pharma' },
  { id: '5', name: 'Starlink / High-Speed Satellite Data', nameMm: 'ဂြိုဟ်တု အင်တာနက် လစဉ်ဒေတာ', price: 45.0, category: 'Telecom' },
  { id: '6', name: 'Cooking Oil & Kitchen Staples', nameMm: 'စားသုံးဆီနှင့် အခြေခံမီးဖိုချောင်သုံး', price: 12.0, category: 'Groceries' },
]

export const legalDocs = {
  terms: {
    titleEn: 'Terms and Conditions of Financial Operations',
    titleMm: 'အာရက္ခငွေကြေးဝန်ဆောင်မှု စည်းမျဉ်းနှင့် သဘောတူညီချက်များ',
    sections: [
      {
        hEn: '1. Legal Status & Arakan Currency',
        hMm: '၁။ ဥပဒေရေးရာ အဆင့်အတန်းနှင့် အချုပ်အခြာအာဏာပိုင် ငွေကြေး',
        pEn: 'PeThar is the institutional national financial technology infrastructure for the Arakan nation. The platform operates under the authority of the Arakan Digital Financial Regulatory Commission. The official unit of account is the Arakan Dollar, pegged 1:1 against USD value reserves. Myanmar Kyat (MMK) is completely deprecated and non-circulating on this ledger.',
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
        pEn: 'Authorized PeThar Agents must maintain physical currency liquidity and adhere to anti-gouging fee ceilings (maximum 0.5% fee on cash-out). All agent withdrawals require dynamic 6-digit cryptographic Time-based One-Time Passwords (TOTP) from the consumer.',
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
        pEn: 'Never share your 6-digit PIN with anyone, including individuals claiming to be PeThar customer support or official agents. PeThar staff will never ask for your PIN, seed phrase, or OTP.',
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
