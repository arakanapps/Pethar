export type Language = 'ak' | 'en'

export interface TranslationStrings {
  appName: string
  appSubtitle: string
  currencyLabel: string
  currencySymbol: string
  currencyUnit: string
  navHome: string
  navAccount: string
  navServices: string
  navSend: string
  navReceive: string
  navScan: string
  navCashOut: string
  navInternational: string
  navCrypto: string
  navPos: string
  navSettings: string

  // Home Screen
  balanceTitle: string
  tierVerified: string
  quickActions: string
  recentTransactions: string
  seeAll: string
  reserveBacked: string

  // Send Screen
  sendTitle: string
  sendRecipientPlaceholder: string
  sendRecentContacts: string
  sendAmountLabel: string
  sendNotePlaceholder: string
  sendContinue: string
  sendConfirmTitle: string
  sendFeeLabel: string
  sendFeeFree: string
  sendEnterPin: string
  sendSuccess: string

  // Receive Screen
  receiveTitle: string
  receiveMyQr: string
  receiveCopyId: string
  receiveIdCopied: string
  receiveSetAmount: string
  receiveShareQr: string

  // Cash Out & Agents
  cashOutTitle: string
  cashOutSubtitle: string
  cashOutAgentCode: string
  cashOutNearbyAgents: string
  cashOutHighFloat: string
  cashOutMediumFloat: string
  cashOutLowFloat: string
  cashOutTokenLabel: string
  cashOutTokenValidFor: string

  // Banking
  intlTitle: string
  intlSubtitle: string
  intlRemittance: string
  intlSendAbroad: string
  intlTopUpCard: string
  intlDebitCard: string
  intlFreezeCard: string
  intlCardDetails: string

  // Crypto & Stablecoin
  cryptoTitle: string
  cryptoSubtitle: string
  cryptoBinanceConnect: string
  cryptoMexcConnect: string
  cryptoDepositUsdt: string
  cryptoSwapToAkd: string
  cryptoProofOfReserves: string
  cryptoSwapRate: string
  cryptoZeroSlippage: string

  // POS Merchant
  posTitle: string
  posSubtitle: string
  posChargeCustomer: string
  posAmountDue: string
  posScanToPay: string
  posPrintReceipt: string
  posDailySummary: string
  posQuickItems: string

  // Auto Save Slip
  autoSaveSlipSetting: string
  autoSaveSlipDesc: string
  slipSavedNotice: string

  // Account Settings & Profile
  accountSetting: string
  profileInfo: string
  editProfile: string
  saveChanges: string
  profileUpdated: string
  fullName: string
  emailAddress: string
  phoneNumber: string
  petharId: string
  locationTownship: string
  billingManagement: string
  languageSetting: string
  themeSetting: string
  darkMode: string
  lightMode: string
  securitySetting: string
  changePin: string
  twoFactorAuth: string

  // Legal
  legalTerms: string
  legalPrivacy: string
  legalGuidelines: string
  legalFxRates: string
  legalRegulatory: string
}

export const translations: Record<Language, TranslationStrings> = {
  ak: {
    appName: 'ဖေ့သာ',
    appSubtitle: 'အာရက္ခအမျိုးသား ဒစ်ဂျစ်တယ်ဘဏ္ဍာရေးကွန်ရက်',
    currencyLabel: 'အာရက္ခဒေါ်လာ',
    currencySymbol: '₳',
    currencyUnit: '₳',
    navHome: 'ပင်မ',
    navAccount: 'ငွေစာရင်း',
    navServices: 'ထုတ်ကုန်နှင့် ဝန်ဆောင်မှု',
    navSend: 'ငွေလွှဲရန်',
    navReceive: 'ငွေလက်ခံရန်',
    navScan: 'Scan/MyQR',
    navCashOut: 'ငွေထုတ်ရန်',
    navInternational: 'နိုင်ငံတကာငွေလွှဲ',
    navCrypto: 'ဒစ်ဂျစ်တယ်ဒင်္ဂါး',
    navPos: 'ကုန်သည် POS',
    navSettings: 'ဆက်တင်',

    // Home Screen
    balanceTitle: 'အာရက္ခဒေါ်လာ လက်ကျန်ငွေ',
    tierVerified: 'နိုင်ငံသား အဆင့် ၂ အတည်ပြုပြီး ✓',
    quickActions: 'အဓိကလုပ်ဆောင်ချက်များ',
    recentTransactions: 'လတ်တလော ငွေစာရင်းမှတ်တမ်း',
    seeAll: 'အားလုံးကြည့်ရန်',
    reserveBacked: '၁၀၀% အာရက္ခရွှေနှင့် တင်းပြည့်ဒေါ်လာဖြင့် အာမခံထားပါသည်',

    // Send Screen
    sendTitle: 'ငွေလွှဲပို့ရန်',
    sendRecipientPlaceholder: 'ဖုန်းနံပါတ် သို့မဟုတ် ဖေ့သာ ID ရိုက်ထည့်ပါ',
    sendRecentContacts: 'မကြာခဏလွှဲလေ့ရှိသူများ',
    sendAmountLabel: 'လွှဲမည့်ငွေပမာဏ',
    sendNotePlaceholder: 'ငွေလွှဲရသည့်အကြောင်းအရင်း မှတ်စု (ချန်လှပ်နိုင်ပါသည်)',
    sendContinue: 'ဆက်လက်လုပ်ဆောင်ရန်',
    sendConfirmTitle: 'ငွေလွှဲအတည်ပြုခြင်း',
    sendFeeLabel: 'ဝန်ဆောင်ခ',
    sendFeeFree: 'အခမဲ့ (၀.၀၀ ₳)',
    sendEnterPin: 'အတည်ပြုရန် လုံခြုံရေး PIN နံပါတ် ၆ လုံးရိုက်ထည့်ပါ',
    sendSuccess: 'ငွေလွှဲခြင်း အောင်မြင်ပါသည်!',

    // Receive Screen
    receiveTitle: 'ငွေလက်ခံရန်',
    receiveMyQr: 'မိမိ၏ ဖေ့သာ Arakan QR ကုဒ် (AK QR)',
    receiveCopyId: 'ဖေ့သာ ID ကူးယူရန်',
    receiveIdCopied: 'ဖေ့သာ ID ကို ကူးယူပြီးပါပြီ!',
    receiveSetAmount: 'လက်ခံမည့်ပမာဏ သတ်မှတ်ရန်',
    receiveShareQr: 'QR ကုဒ် မျှဝေရန်',

    // Cash Out & Agents
    cashOutTitle: 'အေးဂျင့်မှ ငွေသားထုတ်ယူရန်',
    cashOutSubtitle: 'မြန်မာငွေစက္ကူဟောင်း/ပြတ်လပ်မှု မလိုဘဲ အာရက္ခဒေါ်လာငွေသား အလွယ်တကူထုတ်ယူနိုင်ပါသည်',
    cashOutAgentCode: 'အေးဂျင့်ဆိုင်ကုဒ် ရိုက်ထည့်ပါ',
    cashOutNearbyAgents: 'အနီးဆုံး အာရက္ခတရားဝင် အေးဂျင့်ဆိုင်များ',
    cashOutHighFloat: 'ငွေသားအလုံအလောက်ရှိ',
    cashOutMediumFloat: 'ငွေသားသင့်တင့်စွာရှိ',
    cashOutLowFloat: 'ငွေသားအနည်းငယ်သာရှိ',
    cashOutTokenLabel: 'ငွေထုတ် တစ်ခါသုံး လျှို့ဝှက်ကုဒ် (TOTP)',
    cashOutTokenValidFor: 'သက်တမ်းကျန်ချိန် စက္ကန့်',

    // Banking
    intlTitle: 'နိုင်ငံတကာဘဏ်နှင့် ငွေလွှဲစနစ်',
    intlSubtitle: 'Payoneer, PayPal, Visa, Mastercard, AMEX တို့မှ တိုက်ရိုက်ငွေသွင်း/ငွေလွှဲနိုင်ပါသည်',
    intlRemittance: 'ပြည်ပနိုင်ငံများမှ ငွေလွှဲလက်ခံမှု (အမေရိကန်နှင့် နိုင်ငံတကာ)',
    intlSendAbroad: 'ပြည်ပသို့ ငွေလွှဲပို့ရန်',
    intlTopUpCard: 'နိုင်ငံတကာ ကတ်များဖြင့် ငွေသွင်းရန် (Visa / Master / AMEX)',
    intlDebitCard: 'ဖေ့သာ နိုင်ငံတကာ ဒစ်ဂျစ်တယ်ဒက်ဘစ်ကတ်',
    intlFreezeCard: 'ကတ်ယာယီပိတ်ရန်',
    intlCardDetails: 'ကတ်အချက်အလက်ကြည့်ရန်',

    // Crypto & Stablecoin
    cryptoTitle: 'ဒစ်ဂျစ်တယ်ဒင်္ဂါးနှင့် Stablecoin ဘဏ္ဍာတိုက်',
    cryptoSubtitle: 'Binance, MEXC, On-Chain USDT/USDC တို့ဖြင့် အချိန်မရွေး ဖလှယ်နိုင်ပါသည်',
    cryptoBinanceConnect: 'Binance Pay ချိတ်ဆက်ပြီး ဝန်ဆောင်ခမဲ့ ငွေသွင်းရန်',
    cryptoMexcConnect: 'MEXC Exchange တိုက်ရိုက်ချိတ်ဆက်ရန်',
    cryptoDepositUsdt: 'USDT (TRC20 / ERC20 / TON) ငွေသွင်းလိပ်စာ',
    cryptoSwapToAkd: 'USDT မှ အာရက္ခဒေါ်လာသို့ ချက်ချင်းလဲလှယ်ရန်',
    cryptoProofOfReserves: '၁၀၀% အာမခံထားရှိမှု ပွင့်လင်းမြင်သာစွာ စစ်ဆေးရန် (Proof of Reserves)',
    cryptoSwapRate: 'လဲလှယ်နှုန်း: ၁ USDT = ၁.၀၀ ₳',
    cryptoZeroSlippage: 'စျေးနှုန်းကွာဟမှုမရှိ တိကျသော လဲလှယ်မှုနှုန်း',

    // POS Merchant
    posTitle: 'ကုန်သည်လက်လီ POS စနစ်',
    posSubtitle: 'အာရက္ခပြည်တွင်း ဆိုင်များ၊ ကုန်စုံဆိုင်များနှင့် ကုန်သည်ကြီးများအတွက် အရောင်းစနစ်',
    posChargeCustomer: 'ဝယ်ယူသူထံမှ ငွေတောင်းခံရန်',
    posAmountDue: 'ကျသင့်ငွေပမာဏ',
    posScanToPay: 'ဝယ်ယူသူ စကင်ဖတ်ပေးချေရန် QR ကုဒ်',
    posPrintReceipt: 'အရောင်းပြေစာ ထုတ်ယူရန်',
    posDailySummary: 'ယနေ့ အရောင်းစာရင်းနှင့် စာရင်းချုပ်',
    posQuickItems: 'အမြန်ရွေးချယ်စရာ ပစ္စည်းများ',

    // Auto Save Slip
    autoSaveSlipSetting: 'ငွေလွှဲဖြတ်ပိုင်းများကို ဖုန်းထဲသို့ အလိုအလျောက်သိမ်းဆည်းရန်',
    autoSaveSlipDesc: 'ငွေလွှဲအောင်မြင်တိုင်း e-Slip ဖြတ်ပိုင်းကို Photos / Gallery သို့ အလိုအလျောက် သိမ်းပေးပါမည်',
    slipSavedNotice: 'ဖြတ်ပိုင်းကို Photos သို့ သိမ်းဆည်းပြီးပါပြီ',

    // Account Settings & Profile
    accountSetting: 'အကောင့်ဆက်တင်များ',
    profileInfo: 'ကိုယ်ရေးအချက်အလက်',
    editProfile: 'ကိုယ်ရေးအချက်အလက် ပြင်ဆင်ရန်',
    saveChanges: 'အချက်အလက် သိမ်းဆည်းမည်',
    profileUpdated: 'ကိုယ်ရေးအချက်အလက်များ အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ',
    fullName: 'အမည်အပြည့်အစုံ',
    emailAddress: 'အီးမေးလ်လိပ်စာ',
    phoneNumber: 'ဖုန်းနံပါတ်',
    petharId: 'ဖေ့သာ အိုင်ဒီ (Péthar ID)',
    locationTownship: 'နေရပ်မြို့နယ်',
    billingManagement: 'ဘေလ်နှင့် ကတ်များ စီမံခန့်ခွဲမှု',
    languageSetting: 'ဘာသာစကား ရွေးချယ်မှု',
    themeSetting: 'အလင်း / အမှောင် ရွေးချယ်မှု',
    darkMode: 'အမှောင်စနစ် (Dark)',
    lightMode: 'အလင်းစနစ် (Light)',
    securitySetting: 'လုံခြုံရေးဆက်တင်များ',
    changePin: '၆ လုံး လျှို့ဝှက်ကုဒ် (PIN) ပြောင်းရန်',
    twoFactorAuth: 'အဆင့်နှစ်ဆင့် လုံခြုံရေး (2FA)',

    // Legal
    legalTerms: 'အသုံးပြုမှု စည်းမျဉ်းနှင့် သဘောတူညီချက်များ',
    legalPrivacy: 'ကိုယ်ရေးအချက်အလက် ကာကွယ်ရေး မူဝါဒ',
    legalGuidelines: 'အက်ပ်အသုံးပြုနည်းနှင့် လုံခြုံရေး လမ်းညွှန်ချက်',
    legalFxRates: 'အာရက္ခဒေါ်လာ အထူးနိုင်ငံခြားငွေလဲလှယ်နှုန်းများ',
    legalRegulatory: 'အာရက္ခဒစ်ဂျစ်တယ်ဘဏ္ဍာရေး စည်းမျဉ်းကြီးကြပ်ရေးအဖွဲ့ လိုင်စင်ရ',
  },

  en: {
    appName: 'Péthar',
    appSubtitle: 'Arakan Financial Infrastructure',
    currencyLabel: 'Arakan Dollar',
    currencySymbol: '₳',
    currencyUnit: '₳',
    navHome: 'Home',
    navAccount: 'Account',
    navServices: 'Service',
    navSend: 'Send',
    navReceive: 'Receive',
    navScan: 'Scan/MyQR',
    navCashOut: 'Cash Out',
    navInternational: 'Global Wire',
    navCrypto: 'Crypto & Vault',
    navPos: 'Merchant POS',
    navSettings: 'Settings',

    // Home Screen
    balanceTitle: 'Arakan Dollar Balance',
    tierVerified: 'Citizen Tier 2 Verified ✓',
    quickActions: 'Quick Financial Actions',
    recentTransactions: 'Recent Ledger Postings',
    seeAll: 'View All',
    reserveBacked: 'Fixed 1:1 peg to the US dollar',

    // Send Screen
    sendTitle: 'Send Money',
    sendRecipientPlaceholder: 'Enter Phone or Péthar ID',
    sendRecentContacts: 'Frequent Recipients',
    sendAmountLabel: 'Transfer Amount',
    sendNotePlaceholder: 'Transaction memo / reference (optional)',
    sendContinue: 'Continue Transfer',
    sendConfirmTitle: 'Transfer Review & Authorization',
    sendFeeLabel: 'Network Fee',
    sendFeeFree: 'Free (0.00 ₳)',
    sendEnterPin: 'Enter 6-digit Secure Authorization PIN',
    sendSuccess: 'Transfer Settled Successfully!',

    // Receive Screen
    receiveTitle: 'Receive Money',
    receiveMyQr: 'My Arakan QR (AK QR)',
    receiveCopyId: 'Copy Péthar ID',
    receiveIdCopied: 'Péthar ID Copied to Clipboard!',
    receiveSetAmount: 'Specify Amount to Request',
    receiveShareQr: 'Share Payment QR',

    // Cash Out & Agents
    cashOutTitle: 'Agent Cash-Out & Branch Access',
    cashOutSubtitle: 'Overcome worn and scarce banknotes by accessing verified Arakan physical cash at authorized agents',
    cashOutAgentCode: 'Enter Agent Counter Code',
    cashOutNearbyAgents: 'Verified Arakan Physical Agent Network',
    cashOutHighFloat: 'High Cash Float',
    cashOutMediumFloat: 'Medium Cash Float',
    cashOutLowFloat: 'Low Cash Float',
    cashOutTokenLabel: 'One-Time Cash-Out Authorization Code (TOTP)',
    cashOutTokenValidFor: 'Valid for seconds',

    // Banking
    intlTitle: 'Global Banking & Cross-Border Remittance',
    intlSubtitle: 'Direct incoming and outgoing rails for Payoneer, PayPal, Visa, Mastercard, and AMEX',
    intlRemittance: 'Global Inward Corridors (USA & International)',
    intlSendAbroad: 'Send Outward Wire',
    intlTopUpCard: 'Top Up with Global Cards (Visa / Mastercard / AMEX)',
    intlDebitCard: 'Péthar Multi-Currency Debit Card',
    intlFreezeCard: 'Freeze Card Instantly',
    intlCardDetails: 'View Card Credentials',

    // Crypto & Stablecoin
    cryptoTitle: 'Crypto & Fiat Stablecoin Gateway',
    cryptoSubtitle: 'Seamless bridge to Binance, MEXC, and On-Chain USDT/USDC with 0-fee settlement',
    cryptoBinanceConnect: 'Binance Pay Direct Connect (0% Fee)',
    cryptoMexcConnect: 'MEXC Exchange Gateway',
    cryptoDepositUsdt: 'Deposit USDT (TRC-20 / ERC-20 / TON / Polygon)',
    cryptoSwapToAkd: 'Instant Swap: USDT / USDC',
    cryptoProofOfReserves: 'On-Chain Real-Time Proof of Reserves (105% Coverage)',
    cryptoSwapRate: 'Rate: 1.00 USDT = 1.00 ₳',
    cryptoZeroSlippage: 'Guaranteed 0% Slippage Liquidity',

    // POS Merchant
    posTitle: 'Merchant POS Terminal',
    posSubtitle: 'Touchscreen checkout for Arakan retailers, pharmacies, grocery stores, and wholesalers',
    posChargeCustomer: 'Charge Customer',
    posAmountDue: 'Total Amount Due',
    posScanToPay: 'Customer Scan-to-Pay Arakan QR (AK QR)',
    posPrintReceipt: 'Print Thermal Receipt',
    posDailySummary: 'Daily End-of-Day Cashier Reconciliation',
    posQuickItems: 'Fast Inventory Presets',

    // Auto Save Slip
    autoSaveSlipSetting: 'Auto Save Receipt',
    autoSaveSlipDesc: 'Automatically saves e-Slip to device gallery upon successful transfer',
    slipSavedNotice: 'Slip auto-saved to Photos',

    // Account Settings & Profile
    accountSetting: 'Account Setting',
    profileInfo: 'Profile Information',
    editProfile: 'Edit Personal Profile',
    saveChanges: 'Save Changes',
    profileUpdated: 'Personal details updated successfully',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    petharId: 'Péthar Citizen ID',
    locationTownship: 'Township / Region',
    billingManagement: 'Billing Management',
    languageSetting: 'Language',
    themeSetting: 'Dark / Light Mode',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    securitySetting: 'Security',
    changePin: 'Change PIN',
    twoFactorAuth: 'Two-Factor Authentication',

    // Legal
    legalTerms: 'Terms & Conditions of Financial Services',
    legalPrivacy: 'Personal Data Protection & Privacy Charter',
    legalGuidelines: 'Safe Banking Guidelines & Fraud Prevention',
    legalFxRates: 'Official Arakan Foreign Exchange Special Board',
    legalRegulatory: 'Licensed by Arakan Digital Financial Regulatory Authority',
  },
}
