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
  name: 'User', email: 'example@email.com', phone: '+95 9 881 204 991',
  petharId: 'ARAK-8891-USER', location: 'Sittwe · စစ်တွေ', accountTier: 'Normal',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
);

WalletBalance akdWallet = WalletBalance(
  currency: 'Arakan Dollar', code: 'AKD', symbol: '₳', labelEn: 'Arakan Dollar Balance', labelMm: 'အာရက္ခဒေါ်လာ လက်ကျန်ငွေ', totalLabelEn: 'Total Balance', totalLabelMm: 'စုစုပေါင်း လက်ကျန်ငွေ', balance: 14850.00, totalBalance: 15200.00, pendingBalance: 350.00, usdEquivalent: 14850.00, isReserveBacked: true
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
    titleEn: 'P2P Transfer Sent',
    titleMm: 'ငွေလွှဲပို့ခြင်း အောင်မြင်ပါသည်',
    bodyEn: 'You sent ₳350.00 to Ko Min Aung (ARAK-8891). Settled instantly with zero fee.',
    bodyMm: 'ကိုမင်းအောင် (ARAK-8891) ထံ ₳350.00 ပို့လွှဲခြင်း ချက်ချင်းပြီးစီးပါသည်။',
    time: '2:22 PM',
    dateGroup: 'Today',
    read: false,
  ),
  NotificationItem(
    id: 'N-002',
    type: 'transaction',
    titleEn: 'Binance Pay USDT Inflow Received',
    titleMm: 'Binance မှ USDT ငွေသွင်း ရရှိပါသည်',
    bodyEn: '1,500 USDT converted 1:1 to ₳1,500.00 and credited to your vault.',
    bodyMm: 'USDT 1,500 ကို ၁:၁ နှုန်းဖြင့် ₳1,500.00 အဖြစ် သင့်စာရင်းသို့ သွင်းပြီးပါပြီ။',
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

  String get phone => _phone ?? '';
  set phone(String val) => _phone = val;

  String get category => (_category != null && _category!.isNotEmpty) ? _category! : 'Friends';
  set category(String val) => _category = val;

  String get bank => (_bank != null && _bank!.isNotEmpty) ? _bank! : 'Péthar Wallet';
  set bank(String val) => _bank = val;

  FavoriteContact({
    required this.name,
    required this.mm,
    required this.id,
    required this.initials,
    required this.colorValue,
    String phone = '',
    String category = 'Friends',
    String bank = 'Péthar Wallet',
  })  : _phone = phone,
        _category = category,
        _bank = bank;
}

// Live data: Favorite contacts are fetched dynamically from Supabase 'favorite_contacts' table
List<FavoriteContact> favoriteContacts = [];


