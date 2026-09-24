class UserProfile {
  String name, email, phone, petharId, location, accountTier;
  String? avatarUrl;
  UserProfile({required this.name, required this.email, required this.phone, required this.petharId, required this.location, required this.accountTier, this.avatarUrl});
}

class WalletBalance {
  String currency, code, symbol, labelEn, labelMm, totalLabelEn, totalLabelMm;
  double balance, totalBalance, pendingBalance, usdEquivalent;
  bool isReserveBacked;
  WalletBalance({required this.currency, required this.code, required this.symbol, required this.labelEn, required this.labelMm, required this.totalLabelEn, required this.totalLabelMm, required this.balance, required this.totalBalance, required this.pendingBalance, required this.usdEquivalent, required this.isReserveBacked});
}

class Contact {
  String name, mm, id, location, phone, initials;
  Contact({required this.name, required this.mm, required this.id, required this.location, required this.phone, required this.initials});
}

class Agent {
  String code, name, mm, township, townshipMm, distance, floatStatusMm, phone;
  String floatStatus; // 'High', 'Medium', 'Low'
  double cashReserveAkd;
  bool open;
  Agent({required this.code, required this.name, required this.mm, required this.township, required this.townshipMm, required this.distance, required this.floatStatusMm, required this.phone, required this.floatStatus, required this.cashReserveAkd, required this.open});
}

class Transaction {
  String id, refId, title, titleMm, category, currency, time, status, counterparty, counterpartyMm, hash;
  double amount, fee;
  Transaction({required this.id, required this.refId, required this.title, required this.titleMm, required this.category, required this.currency, required this.time, required this.status, required this.counterparty, required this.counterpartyMm, required this.hash, required this.amount, required this.fee});
}

UserProfile initialUserProfile = UserProfile(
  name: 'Jack', email: 'realjackhalder@gmail.com', phone: '+95 9 881 204 991',
  petharId: 'ARAK-8891-JACK', location: 'Sittwe · စစ်တွေ', accountTier: 'Normal',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
);

WalletBalance akdWallet = WalletBalance(
  currency: 'Arakan Dollar', code: 'AKD', symbol: '₳', labelEn: 'Arakan Dollar Balance', labelMm: 'အာရက္ခဒေါ်လာ လက်ကျန်ငွေ', totalLabelEn: 'Total Balance', totalLabelMm: 'စုစုပေါင်း လက်ကျန်ငွေ', balance: 14850.00, totalBalance: 15200.00, pendingBalance: 350.00, usdEquivalent: 14850.00, isReserveBacked: true
);

List<Contact> contacts = [
  Contact(name: 'Ko Min Aung', mm: 'ကိုမင်းအောင်', id: 'ARAK-8891', location: 'Sittwe', phone: '09xxxxxxxxx', initials: 'MA'),
  Contact(name: 'Ma Hnin Nu', mm: 'မနှင်းနု', id: 'ARAK-4402', location: 'Mrauk-U', phone: '09xxxxxxxxx', initials: 'HN'),
  Contact(name: 'U Ba Thein', mm: 'ဦးဘသိန်း', id: 'ARAK-1982', location: 'Kyaukpyu', phone: '09xxxxxxxxx', initials: 'BT'),
  Contact(name: 'Daw Saw Mya', mm: 'ဒေါ်စောမြ', id: 'ARAK-7719', location: 'Thandwe', phone: '09xxxxxxxxx', initials: 'SM'),
  Contact(name: 'Ko Kyaw Sein', mm: 'ကိုကျော်စိန်', id: 'ARAK-3305', location: 'Ramree', phone: '09xxxxxxxxx', initials: 'KS'),
];

List<Agent> agents = [
  Agent(code: 'AK-001', name: 'Shwe Sittwe', mm: 'ရွှေစစ်တွေ', township: 'Sittwe', townshipMm: 'စစ်တွေ', distance: '0.5 km', floatStatusMm: 'ငွေသားအလုံအလောက်ရှိ', phone: '09xxxxxxxxx', floatStatus: 'High', cashReserveAkd: 85000, open: true),
  Agent(code: 'AK-042', name: 'Mrauk-U', mm: 'မြောက်ဦး', township: 'Mrauk-U', townshipMm: 'မြောက်ဦး', distance: '1.2 km', floatStatusMm: 'ငွေသားအလုံအလောက်ရှိ', phone: '09xxxxxxxxx', floatStatus: 'High', cashReserveAkd: 54000, open: true),
  Agent(code: 'AK-088', name: 'Kyaukpyu', mm: 'ကျောက်ဖြူ', township: 'Kyaukpyu', townshipMm: 'ကျောက်ဖြူ', distance: '3.4 km', floatStatusMm: 'ငွေသားသင့်တင့်စွာရှိ', phone: '09xxxxxxxxx', floatStatus: 'Medium', cashReserveAkd: 28000, open: true),
  Agent(code: 'AK-115', name: 'Thandwe', mm: 'သံတွဲ', township: 'Thandwe', townshipMm: 'သံတွဲ', distance: '5.1 km', floatStatusMm: 'ငွေသားသင့်တင့်စွာရှိ', phone: '09xxxxxxxxx', floatStatus: 'Medium', cashReserveAkd: 32000, open: true),
  Agent(code: 'AK-204', name: 'Ramree', mm: 'ရမ်းဗြဲ', township: 'Ramree', townshipMm: 'ရမ်းဗြဲ', distance: '12 km', floatStatusMm: 'ငွေသားအနည်းငယ်သာရှိ', phone: '09xxxxxxxxx', floatStatus: 'Low', cashReserveAkd: 9500, open: true),
];

List<Transaction> transactions = [
  Transaction(
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
  ),
  Transaction(
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
  ),
  Transaction(
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
  ),
  Transaction(
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
  ),
  Transaction(
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
  ),
  Transaction(
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
  ),
];

class NotificationItem {
  String id;
  String titleEn;
  String titleMm;
  String bodyEn;
  String bodyMm;
  String time;
  String dateGroup;
  String type; // 'transaction' | 'system' | 'promotion'
  bool read;

  NotificationItem({
    required this.id,
    required this.titleEn,
    required this.titleMm,
    required this.bodyEn,
    required this.bodyMm,
    required this.time,
    required this.dateGroup,
    required this.type,
    this.read = false,
  });
}

List<NotificationItem> sampleNotifications = [
  NotificationItem(
    id: 'N-004',
    titleEn: 'Transfer Sent Successfully',
    titleMm: 'ငွေလွှဲခြင်း အောင်မြင်ပါသည်',
    bodyEn: 'Sent 350.00 AKD to Ko Min Aung (ARAK-8891). Zero network fees charged.',
    bodyMm: 'ကိုမင်းအောင် (ARAK-8891) ထံသို့ ₳ ၃၅၀.၀၀ ပို့ပြီးပါပြီ။ ဝန်ဆောင်ခ မရှိပါ။',
    time: 'Today · 14:22',
    dateGroup: 'Today',
    type: 'transaction',
    read: false,
  ),
  NotificationItem(
    id: 'N-003',
    titleEn: 'Binance Pay Deposit Received',
    titleMm: 'Binance Pay မှ ငွေလက်ခံရရှိပါသည်',
    bodyEn: '1,500.00 USDT credited as 1,500.00 AKD at 1:1 parity.',
    bodyMm: 'USDT ၁,၅၀၀.၀၀ ကို ₳ ၁,၅၀၀.၀၀ အဖြစ် စာရင်းသွင်းပြီးပါပြီ။',
    time: 'Today · 11:05',
    dateGroup: 'Today',
    type: 'transaction',
    read: false,
  ),
  NotificationItem(
    id: 'N-002',
    titleEn: 'Bank of Arakan Scheduled Upgrade',
    titleMm: 'အာရက္ခဗဟိုဘဏ် စနစ်အဆင့်မြှင့်တင်မှု အသိပေးချက်',
    bodyEn: 'Scheduled ledger maintenance on 24 Sep, 01:00-06:00 AM. Offline vouchers remain active.',
    bodyMm: 'စက်တင်ဘာ ၂၄ ရက် နံနက် ၀၁:၀၀-၀၆:၀၀ တွင် စာရင်းစနစ် အဆင့်မြှင့်ပါမည်။',
    time: 'Yesterday · 18:00',
    dateGroup: 'Yesterday',
    type: 'system',
    read: true,
  ),
  NotificationItem(
    id: 'N-001',
    titleEn: 'Zero-Fee Cross-Border Week',
    titleMm: 'နိုင်ငံတကာငွေလွှဲ ဝန်ဆောင်ခမဲ့ အထူးရက်သတ္တပတ်',
    bodyEn: 'Enjoy zero intermediary fees on remittances from Thailand and Malaysia.',
    bodyMm: 'ထိုင်းနှင့် မလေးရှားမှ ငွေလွှဲမှုများတွင် ဝန်ဆောင်ခ ကင်းလွတ်ခွင့် ရရှိပါမည်။',
    time: '20 Sep · 09:00',
    dateGroup: 'Earlier',
    type: 'promotion',
    read: true,
  ),
];

class FavoriteContact {
  String name;
  String mm;
  String id;
  String initials;
  int colorValue;
  FavoriteContact({required this.name, required this.mm, required this.id, required this.initials, required this.colorValue});
}

List<FavoriteContact> favoriteContacts = [
  FavoriteContact(name: 'MYAT SOE', mm: 'မြတ်စိုး', id: 'ARAK-1024', initials: 'MS', colorValue: 0xFF2563EB),
  FavoriteContact(name: 'TONY', mm: 'တိုနီ', id: 'ARAK-9921', initials: 'TN', colorValue: 0xFF059669),
  FavoriteContact(name: 'CIMB WIRE', mm: 'စီအိုင်အမ်ဘီ', id: 'ARAK-5501', initials: 'CB', colorValue: 0xFFDC2626),
  FavoriteContact(name: 'KO MIN AUNG', mm: 'မင်းအောင်', id: 'ARAK-8891', initials: 'MA', colorValue: 0xFFD97706),
];

