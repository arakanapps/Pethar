class UserProfile {
  // Immutable Fields (cant change)
  String username; // cant change
  String uid; // user_id = wallet address = uid (cant change)
  String walletAddress; // same as uid (cant change)
  String usdAccountWalletAddress; // usd account wallet address (cant change)
  String nationalIdNo; // national id no (cant change)
  String dob; // dob (cant change)

  // Mutable Fields (with OTP / Review / Direct)
  String firstName; // can change (needs review and email OTP)
  String lastName; // can change (needs review and email OTP)
  String name; // full name
  String nickname; // can change
  String email; // can change (needs verified OTP)
  String phone; // can change (needs email verified OTP)
  String pin; // can change (needs current pin, or if forgot pin needs email OTP)
  String address; // can change
  String? avatarUrl; // can change (user profile pic)

  // Balances (ledger governed)
  double akdWalletBalance; // AKD Wallet balance (cant change via profile edit)
  double usdAccountBalance; // USD account balance (cant change via profile edit)
  double get totalBalance => akdWalletBalance + usdAccountBalance; // total balance change (auto-calculated)

  // App Metadata
  String petharId;
  String location;
  String accountTier;
  String currency;
  int kycTier;

  UserProfile({
    this.username = '@user',
    this.uid = '202610190001',
    String? walletAddress,
    this.usdAccountWalletAddress = '0x36a8F492C109bE742819aBcD8391048291045f19',
    this.nationalIdNo = 'MJ310666',
    this.dob = '13 May 2003',
    this.firstName = 'User',
    this.lastName = 'PAING',
    String? name,
    this.nickname = 'Jack',
    required this.email,
    required this.phone,
    this.pin = '123456',
    this.address = '6/64, Building C, Den Vibhavadi, Vibhavadi Rangsit Rd, Sanam Bin Don Mueang, Bangkok 10210',
    this.avatarUrl,
    this.akdWalletBalance = 0.00,
    this.usdAccountBalance = 0.00,
    required this.petharId,
    required this.location,
    required this.accountTier,
    this.currency = 'AKD',
    this.kycTier = 2,
  })  : walletAddress = walletAddress ?? uid,
        name = name ?? (firstName.isNotEmpty ? '$firstName ${lastName.trim()}'.trim() : 'User');
}

/// Generates a standardized UID in format: yearmmddusercount (e.g. 202610190001)
String generateUserUid({int userCount = 1, DateTime? date}) {
  final now = date ?? DateTime.now();
  final y = now.year.toString().padLeft(4, '0');
  final m = now.month.toString().padLeft(2, '0');
  final d = now.day.toString().padLeft(2, '0');
  final count = userCount.toString().padLeft(4, '0');
  return '$y$m$d$count';
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
  username: '@user',
  uid: '202610190001',
  walletAddress: '202610190001',
  usdAccountWalletAddress: '0x36a8F492C109bE742819aBcD8391048291045f19',
  nationalIdNo: 'MJ310666',
  dob: '13 May 2003',
  firstName: 'User',
  lastName: 'PAING',
  name: 'User',
  nickname: 'Jack',
  email: 'example@email.com',
  phone: '09795220917',
  pin: '123456',
  address: '6/64, Building C, Den Vibhavadi, Vibhavadi Rangsit Rd, Sanam Bin Don Mueang, Bangkok 10210',
  petharId: '202610190001',
  location: 'Sittwe · စစ်တွေ',
  accountTier: 'Tier 2 Verified',
  akdWalletBalance: 0.00,
  usdAccountBalance: 0.00,
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
);

WalletBalance akdWallet = WalletBalance(
  currency: 'Arakan Dollar', code: 'AKD', symbol: '₳', labelEn: 'Arakan Dollar Balance', labelMm: 'အာရက္ခဒေါ်လာ လက်ကျန်ငွေ', totalLabelEn: 'Total Balance', totalLabelMm: 'စုစုပေါင်း လက်ကျန်ငွေ', balance: 0.00, totalBalance: 0.00, pendingBalance: 0.00, usdEquivalent: 0.00, isReserveBacked: true
);

// Live data: All contacts are fetched dynamically from Supabase 'favorite_contacts' table
List<Contact> contacts = [];

// Live data: All physical agents are fetched dynamically from Supabase 'agents' table
List<Agent> agents = [];

// Live data: All transactions are fetched dynamically from Supabase 'transactions' table
List<Transaction> transactions = [];

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

// Live notifications: Fetched dynamically or generated from transactions
List<NotificationItem> sampleNotifications = [
  NotificationItem(
    id: 'N-001',
    type: 'transaction',
    titleEn: 'Transfer Sent',
    titleMm: 'ငွေလွှဲပို့ခြင်း အောင်မြင်ပါသည်',
    bodyEn: 'You sent ₳0.00 to Ko Min Aung (202610190002). Settled instantly with zero fee.',
    bodyMm: 'ကိုမင်းအောင် (202610190002) ထံ ₳0.00 ပို့လွှဲခြင်း ချက်ချင်းပြီးစီးပါသည်။',
    time: '2:22 PM',
    dateGroup: 'Today',
    read: false,
  ),
  NotificationItem(
    id: 'N-002',
    type: 'transaction',
    titleEn: 'Binance Pay USDT Inflow Received',
    titleMm: 'Binance မှ USDT ငွေသွင်း ရရှိပါသည်',
    bodyEn: '0.00 USDT converted 1:1 to ₳0.00 and credited to your vault.',
    bodyMm: 'USDT 0.00 ကို ၁:၁ နှုန်းဖြင့် ₳0.00 အဖြစ် သင့်စာရင်းသို့ သွင်းပြီးပါပြီ။',
    time: '11:05 AM',
    dateGroup: 'Today',
    read: false,
  ),
  NotificationItem(
    id: 'N-003',
    type: 'system',
    titleEn: 'Arakan Ledger Upgrade Window',
    titleMm: 'ဗဟိုစာရင်းစနစ် အဆင့်မြှင့်တင်ချိန်',
    bodyEn: 'Scheduled maintenance 24 Sep, 01:00–06:00 AM. Offline vouchers remain fully active.',
    bodyMm: 'စက်တင်ဘာ ၂၄ ရက် နံနက် ၀၁:၀၀–၀၆:၀၀ ထိန်းသိမ်းချိန်။ အော့ဖ်လိုင်းဘောက်ချာများ အသုံးပြုနိုင်ပါသည်။',
    time: 'Yesterday, 9:00 AM',
    dateGroup: 'Yesterday',
    read: true,
  ),
  NotificationItem(
    id: 'N-004',
    type: 'promotion',
    titleEn: 'Zero-Fee THB Remittance Week',
    titleMm: 'ထိုင်းဘတ် ငွေလွှဲ အခမဲ့အပတ်စဉ်',
    bodyEn: 'Send THB corridor remittances with 0% markup until 30 Sep. Special FX rate locked.',
    bodyMm: 'စက်တင်ဘာ ၃၀ ရက်အထိ ထိုင်းဘတ်လမ်းကြောင်း ငွေလွှဲများ အခမဲ့။ အထူးငွေလဲနှုန်း သော့ခတ်ထားပါသည်။',
    time: '20 Sep, 8:15 AM',
    dateGroup: 'Earlier',
    read: true,
  ),
];

class FavoriteContact {
  String name;
  String mm;
  String id;
  String initials;
  int colorValue;
  String? _phone;
  String? _category;
  String? _bank;
  String? _note;

  String get phone => _phone ?? '';
  set phone(String val) => _phone = val;

  String get category => (_category != null && _category!.isNotEmpty) ? _category! : 'Friends';
  set category(String val) => _category = val;

  String get bank => (_bank != null && _bank!.isNotEmpty) ? _bank! : 'Péthar Wallet';
  set bank(String val) => _bank = val;

  String get note => _note ?? (mm.isNotEmpty && mm != name ? mm : '');
  set note(String val) {
    _note = val;
    mm = val;
  }

  FavoriteContact({
    required this.name,
    required this.mm,
    required this.id,
    required this.initials,
    required this.colorValue,
    String phone = '',
    String category = 'Friends',
    String bank = 'Péthar Wallet',
    String note = '',
  })  : _phone = phone,
        _category = category,
        _bank = bank,
        _note = note.isNotEmpty ? note : (mm.isNotEmpty && mm != name ? mm : '');
}

// Live data: Favorite contacts are fetched dynamically from Supabase 'favorite_contacts' table
List<FavoriteContact> favoriteContacts = [];


