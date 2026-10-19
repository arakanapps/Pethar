import 'package:flutter/material.dart';
import 'models/data.dart';
import 'services/firebase_service.dart';
import 'services/supabase_service.dart';

enum Screen { home, account, services, settings, send, receive, scan, cashout, intl, crypto, pos, notifications, desktop, offlinePayment, pay, history, topup, billPayment, favourites }

class AppState extends ChangeNotifier {
  Screen currentScreen = Screen.home;
  List<Screen> navigationStack = [Screen.home];
  String language = 'en'; // Default English matching iOS MobileWalletPage
  ThemeMode themeMode = ThemeMode.light; // Strictly light theme matching iOS
  bool isAuthenticated = true;
  String financialSubView = 'wallet_main'; // 'wallet_main' | 'deposit' | 'withdraw' | 'tx_history' | 'spending' | 'wallet_security_phrase'
  UserProfile profile = initialUserProfile;
  WalletBalance wallet = akdWallet;
  double usdAccountBalance = 0.00;
  bool isVerified = true;
  bool balanceHidden = false;
  bool walletBalanceHidden = false;
  bool autoSaveSlip = true;
  bool twoFactorAuth = false;
  bool cardFrozen = false;
  bool showCardCvv = false;
  List<NotificationItem> notifications = List.from(sampleNotifications);
  List<Transaction> txList = List.from(transactions);
  List<String> recentUsdAddresses = [
    '0x71C829038baC1294817aAb8291048291a49B',
    '0x8F492C109bE742819aBcD8391048291045f22',
    '0x3E11049281a742819abcd8391048291045f201',
    '0x9A28C10892048291948291048291048290123',
  ];
  List<FavoriteContact> favoriteContactsList = List.from(favoriteContacts);
  List<Contact> contactsList = [];
  List<Agent> agentsList = [];
  List<Map<String, dynamic>> fxRatesList = [];
  List<Map<String, dynamic>> billProvidersList = [];
  List<Map<String, dynamic>> topupPackagesList = [];
  double offlinePocketBalance = 0.00; // Offline bearer cash
  List<String> offlineTokens = [];     // Stored bearer tokens
  Map<String, dynamic>? pendingPayContact;
  bool dontShowQuickScanDialog = false;
  bool isLoadingDb = false;

  AppState() {
    loadSupabaseData();
  }

  /// Fetch live data from Supabase tables
  Future<void> loadSupabaseData() async {
    isLoadingDb = true;
    notifyListeners();
    try {
      final supa = SupabaseService();
      // 1. Fetch transactions from Supabase
      final remoteTxs = await supa.fetchTransactions();
      if (remoteTxs.isNotEmpty) {
        txList = remoteTxs;
        transactions = txList;
      }

      // 2. Fetch User Profile & Balance from Supabase
      final profileMap = await supa.fetchUserProfile();
      if (profileMap != null) {
        if (profileMap['username'] != null && profileMap['username'].toString().isNotEmpty) {
          profile.username = profileMap['username'].toString();
        }
        if (profileMap['uid'] != null && profileMap['uid'].toString().isNotEmpty) {
          profile.uid = profileMap['uid'].toString();
          profile.walletAddress = profile.uid;
        }
        if (profileMap['wallet_address'] != null && profileMap['wallet_address'].toString().isNotEmpty) {
          profile.walletAddress = profileMap['wallet_address'].toString();
        }
        if (profileMap['usd_account_wallet_address'] != null && profileMap['usd_account_wallet_address'].toString().isNotEmpty) {
          profile.usdAccountWalletAddress = profileMap['usd_account_wallet_address'].toString();
        }
        if (profileMap['first_name'] != null) profile.firstName = profileMap['first_name'].toString();
        if (profileMap['last_name'] != null) profile.lastName = profileMap['last_name'].toString();
        if (profileMap['name'] != null) profile.name = profileMap['name'].toString();
        if (profileMap['nickname'] != null) profile.nickname = profileMap['nickname'].toString();
        if (profileMap['email'] != null) profile.email = profileMap['email'].toString();
        if (profileMap['phone'] != null) profile.phone = profileMap['phone'].toString();
        if (profileMap['national_id_no'] != null) profile.nationalIdNo = profileMap['national_id_no'].toString();
        if (profileMap['dob'] != null) profile.dob = profileMap['dob'].toString();
        if (profileMap['address'] != null) profile.address = profileMap['address'].toString();
        if (profileMap['avatar_url'] != null && profileMap['avatar_url'].toString().isNotEmpty) {
          profile.avatarUrl = profileMap['avatar_url'].toString();
        }
        if (profileMap['balance'] != null) {
          final bal = double.tryParse(profileMap['balance'].toString()) ?? wallet.balance;
          profile.akdWalletBalance = bal;
          wallet.balance = bal;
          wallet.totalBalance = bal;
        }
        if (profileMap['usd_account_balance'] != null) {
          final usdBal = double.tryParse(profileMap['usd_account_balance'].toString()) ?? usdAccountBalance;
          profile.usdAccountBalance = usdBal;
          usdAccountBalance = usdBal;
        }
      }

      // 3. Fetch Favorite Contacts from Supabase
      final remoteFavs = await supa.fetchFavoriteContacts();
      if (remoteFavs.isNotEmpty) {
        favoriteContactsList = remoteFavs;
        favoriteContacts = favoriteContactsList;
        contactsList = remoteFavs.map((f) => Contact(
          name: f.name,
          mm: f.mm,
          id: f.id,
          location: f.category,
          phone: f.phone,
          initials: f.initials,
        )).toList();
        contacts = contactsList;
      }

      // 4. Fetch Physical Agents from Supabase
      final remoteAgents = await supa.fetchAgents();
      if (remoteAgents.isNotEmpty) {
        agentsList = remoteAgents;
        agents = agentsList;
      }

      // 5. Fetch FX Rates from Supabase
      final remoteFx = await supa.fetchFxRates();
      if (remoteFx.isNotEmpty) {
        fxRatesList = remoteFx;
      }

      // 6. Fetch Bill Providers from Supabase
      final remoteBills = await supa.fetchBillProviders();
      if (remoteBills.isNotEmpty) {
        billProvidersList = remoteBills;
      }

      // 7. Fetch Topup Packages from Supabase
      final remoteTopups = await supa.fetchTopupPackages();
      if (remoteTopups.isNotEmpty) {
        topupPackagesList = remoteTopups;
      }
    } catch (e) {
      debugPrint('Supabase data fetch notice: $e');
    } finally {
      isLoadingDb = false;
      notifyListeners();
    }
  }

  void _addTransaction(Transaction tx) {
    txList.insert(0, tx);
    SupabaseService().insertTransaction(tx);
    SupabaseService().updateUserBalance(usdAccountBalance);
    notifyListeners();
  }

  void addFavoriteContact(FavoriteContact contact) {
    favoriteContactsList.add(contact);
    SupabaseService().insertFavoriteContact(contact);
    notifyListeners();
  }

  void updateFavoriteContact(int index, FavoriteContact updated) {
    if (index >= 0 && index < favoriteContactsList.length) {
      favoriteContactsList[index] = updated;
      SupabaseService().updateFavoriteContact(updated);
      notifyListeners();
    }
  }

  void deleteFavoriteContact(int index) {
    if (index >= 0 && index < favoriteContactsList.length) {
      final item = favoriteContactsList.removeAt(index);
      SupabaseService().deleteFavoriteContact(item.id);
      notifyListeners();
    }
  }

  int get unreadNotificationsCount => notifications.where((n) => !n.read).length;

  void setDontShowQuickScanDialog(bool val) {
    dontShowQuickScanDialog = val;
    notifyListeners();
  }

  void startPayForContact({
    required String name,
    required String id,
    required String initials,
    required int colorValue,
    String? username,
    String? uid,
  }) {
    pendingPayContact = {
      'name': name,
      'id': id,
      'initials': initials,
      'colorValue': colorValue,
      'username': username,
      'uid': uid,
    };
    navigate(Screen.pay);
  }

  void clearPendingPayContact() {
    pendingPayContact = null;
  }

  void navigate(Screen screen, {String? financialView}) {
    if (financialView != null) {
      financialSubView = financialView;
    } else if (screen == Screen.notifications && currentScreen != Screen.notifications) {
      financialSubView = 'wallet_main';
    }
    if (currentScreen != screen) {
      navigationStack.add(screen);
      currentScreen = screen;
    }
    notifyListeners();
  }

  void setFinancialSubView(String view) {
    financialSubView = view;
    notifyListeners();
  }

  void goBack() {
    if (navigationStack.length > 1) {
      navigationStack.removeLast();
      currentScreen = navigationStack.last;
      notifyListeners();
    } else {
      currentScreen = Screen.home;
      notifyListeners();
    }
  }

  void setLanguage(String lang) {
    language = lang;
    notifyListeners();
  }

  void toggleTheme() {
    themeMode = ThemeMode.light;
    notifyListeners();
  }

  void setTheme(ThemeMode mode) {
    themeMode = ThemeMode.light;
    notifyListeners();
  }

  void setVerified(bool value) {
    isVerified = value;
    notifyListeners();
  }

  void toggleBalance() {
    balanceHidden = !balanceHidden;
    notifyListeners();
  }

  void toggleWalletBalance() {
    walletBalanceHidden = !walletBalanceHidden;
    notifyListeners();
  }

  void toggleAutoSaveSlip() {
    autoSaveSlip = !autoSaveSlip;
    notifyListeners();
  }

  void toggle2FA() {
    twoFactorAuth = !twoFactorAuth;
    notifyListeners();
  }

  void toggleCardFreeze() {
    cardFrozen = !cardFrozen;
    notifyListeners();
  }

  void toggleCardCvv() {
    showCardCvv = !showCardCvv;
    notifyListeners();
  }

  Future<void> signOut() async {
    try {
      await SupabaseService().signOut();
    } catch (_) {}
    try {
      await FirebaseService().signOut();
    } catch (e) {
      debugPrint('Sign out notice: $e');
    }
    isAuthenticated = false;
    currentScreen = Screen.home;
    navigationStack = [Screen.home];
    financialSubView = 'wallet_main';
    notifyListeners();
  }

  void signIn({String? email, String? name}) {
    if (email != null && email.trim().isNotEmpty) {
      profile.email = email.trim();
    }
    if (name != null && name.trim().isNotEmpty) {
      profile.name = name.trim();
    }
    isAuthenticated = true;
    currentScreen = Screen.home;
    navigationStack = [Screen.home];
    notifyListeners();
  }

  void markAllNotificationsRead() {
    for (var n in notifications) {
      n.read = true;
    }
    notifyListeners();
  }

  void markNotificationRead(String id) {
    final idx = notifications.indexWhere((n) => n.id == id);
    if (idx != -1) {
      notifications[idx].read = true;
      notifyListeners();
    }
  }

  void deleteNotification(String id) {
    notifications.removeWhere((n) => n.id == id);
    notifyListeners();
  }

  void clearAllNotifications() {
    notifications.clear();
    notifyListeners();
  }

  void resetDemoNotifications() {
    notifications = List.from(sampleNotifications);
    notifyListeners();
  }

  void updateProfile({required String name, required String email, required String phone, required String petharId, required String location}) {
    profile.name = name;
    profile.email = email;
    profile.phone = phone;
    profile.petharId = petharId;
    profile.location = location;
    notifyListeners();
  }

  void notify() => notifyListeners();

  void convertStablecoin({required double amount, required String fromToken, required String toToken}) {
    if (amount <= 0) return;
    if (toToken == 'AKD') {
      usdAccountBalance = (usdAccountBalance - amount).clamp(0.0, double.infinity);
      wallet.balance += amount;
      wallet.totalBalance += amount;
    } else if (fromToken == 'AKD') {
      wallet.balance = (wallet.balance - amount).clamp(0.0, double.infinity);
      wallet.totalBalance = (wallet.totalBalance - amount).clamp(0.0, double.infinity);
      usdAccountBalance += amount;
    }
    _addTransaction(
      Transaction(
        id: 'TX-CONV-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        refId: 'ARAK-CONV-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        title: 'Converted $fromToken to $toToken',
        titleMm: '$fromToken မှ $toToken သို့ လဲလှယ်ခြင်း',
        category: 'crypto',
        currency: toToken,
        time: 'Just now',
        status: 'SETTLED',
        counterparty: 'Péthar 1:1 Liquidity Pool',
        counterpartyMm: 'ဖေ့သာ ၁:၁ လဲလှယ်ရေးစနစ်',
        hash: '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}...conv',
        amount: amount,
        fee: 0.0,
      ),
    );
  }

  void transferBetweenAccounts({required double amount, required bool usdToAkd}) {
    if (amount <= 0) return;
    if (usdToAkd) {
      if (usdAccountBalance < amount) return;
      usdAccountBalance -= amount;
      wallet.balance += amount;
      wallet.totalBalance += amount;
    } else {
      if (wallet.balance < amount) return;
      wallet.balance -= amount;
      wallet.totalBalance -= amount;
      usdAccountBalance += amount;
    }
    _addTransaction(
      Transaction(
        id: 'TX-XFER-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        refId: 'ARAK-XFER-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        title: usdToAkd ? 'USD Account → AKD Wallet' : 'AKD Wallet → USD Account',
        titleMm: usdToAkd ? 'USD အကောင့်မှ AKD ပိုက်ဆံအိတ်သို့' : 'AKD ပိုက်ဆံအိတ်မှ USD အကောင့်သို့',
        category: 'transfer',
        currency: 'AKD',
        time: 'Just now',
        status: 'SETTLED',
        counterparty: 'Internal Account Transfer',
        counterpartyMm: 'မိမိအကောင့်အတွင်း လွှဲပြောင်းမှု',
        hash: '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}...xfer',
        amount: usdToAkd ? amount : -amount,
        fee: 0.0,
      ),
    );
  }

  void recordTransfer({required double amount, required String recipientName, required String recipientId}) {
    wallet.balance -= amount;
    wallet.totalBalance -= amount;
    _addTransaction(
      Transaction(
        id: 'TX-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        refId: 'ARAK-TRANSFER-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        title: 'Transfer to $recipientName',
        titleMm: '$recipientName သို့ ငွေလွှဲခြင်း',
        category: 'transfer',
        currency: 'AKD',
        time: 'Just now',
        status: 'SETTLED',
        counterparty: '$recipientName ($recipientId)',
        counterpartyMm: recipientName,
        hash: '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}...901',
        amount: -amount,
        fee: 0.0,
      ),
    );
    notifications.insert(
      0,
      NotificationItem(
        id: 'N-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
        titleEn: 'Transfer Sent',
        titleMm: 'ငွေလွှဲခြင်း အောင်မြင်ပါသည်',
        bodyEn: 'Sent ${amount.toStringAsFixed(2)} AKD to $recipientName.',
        bodyMm: '$recipientName ထံသို့ ₳ ${amount.toStringAsFixed(2)} ပို့ပြီးပါပြီ။',
        time: 'Just now',
        dateGroup: 'Today',
        type: 'transaction',
        read: false,
      ),
    );
    notifyListeners();
  }

  List<Transaction> get usdAccountTxList {
    return txList.where((tx) {
      final cur = tx.currency.toUpperCase();
      final cat = tx.category.toLowerCase();
      return cat == 'usd_account' ||
          cat == 'usd' ||
          cur == 'USDT' ||
          cur == 'USDC' ||
          cur == 'USD' ||
          tx.title.contains('USD') ||
          tx.title.contains('USDT') ||
          tx.title.contains('USDC') ||
          tx.titleMm.contains('USD');
    }).toList();
  }

  void recordUsdTransfer({
    required double amount,
    required String recipientAddress,
    String token = 'USDT',
  }) {
    if (amount <= 0) return;
    usdAccountBalance = (usdAccountBalance - amount).clamp(0.0, double.infinity);
    final shortAddr = recipientAddress.length > 14
        ? '${recipientAddress.substring(0, 6)}...${recipientAddress.substring(recipientAddress.length - 4)}'
        : recipientAddress;
    final tx = Transaction(
      id: 'TX-USD-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      refId: 'ARAK-USD-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      title: 'Send $token to $shortAddr',
      titleMm: '$shortAddr သို့ $token ပေးပို့ခြင်း',
      category: 'usd_account',
      currency: token,
      time: 'Just now',
      status: 'SETTLED',
      counterparty: recipientAddress,
      counterpartyMm: recipientAddress,
      hash: '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}...usd',
      amount: -amount,
      fee: 0.0,
    );
    _addTransaction(tx);
    if (recipientAddress.isNotEmpty && !recentUsdAddresses.contains(recipientAddress)) {
      recentUsdAddresses.insert(0, recipientAddress);
      if (recentUsdAddresses.length > 8) {
        recentUsdAddresses.removeLast();
      }
    }
    notifications.insert(
      0,
      NotificationItem(
        id: 'N-USD-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
        titleEn: 'USD Transfer Sent',
        titleMm: 'USD ငွေလွှဲခြင်း အောင်မြင်ပါသည်',
        bodyEn: 'Sent \$${amount.toStringAsFixed(2)} $token to $shortAddr.',
        bodyMm: '$shortAddr ထံသို့ \$${amount.toStringAsFixed(2)} $token ပို့ပြီးပါပြီ။',
        time: 'Just now',
        dateGroup: 'Today',
        type: 'transaction',
        read: false,
      ),
    );
    notifyListeners();
  }

  bool loadOfflinePocket(double amount) {
    if (wallet.balance < amount) return false;
    wallet.balance -= amount;
    wallet.totalBalance -= amount;
    offlinePocketBalance += amount;
    txList.insert(
      0,
      Transaction(
        id: 'TX-OFF-LOAD-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        refId: 'ARAK-POCKET-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        title: 'Loaded to Offline Pocket',
        titleMm: 'အော့ဖ်လိုင်းအိတ်ကပ်သို့ ငွေထည့်ခြင်း',
        category: 'pocket',
        currency: 'AKD',
        time: 'Just now',
        status: 'HELD_IN_SUSPENSE',
        counterparty: 'Offline Vault (Encrypted SQLite)',
        counterpartyMm: 'အော့ဖ်လိုင်း ဘဏ္ဍာတိုက်',
        hash: '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}...offline',
        amount: -amount,
        fee: 0.0,
      ),
    );
    notifications.insert(
      0,
      NotificationItem(
        id: 'N-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
        titleEn: 'Offline Pocket Loaded',
        titleMm: 'အော့ဖ်လိုင်းငွေ ထည့်သွင်းပြီးပါပြီ',
        bodyEn: 'Allocated ${amount.toStringAsFixed(2)} AKD for offline transfers.',
        bodyMm: 'အော့ဖ်လိုင်းသုံးရန် ₳ ${amount.toStringAsFixed(2)} ထည့်ပြီးပါပြီ။',
        time: 'Just now',
        dateGroup: 'Today',
        type: 'system',
        read: false,
      ),
    );
    notifyListeners();
    return true;
  }

  bool depositOfflinePocket(double amount) {
    if (offlinePocketBalance < amount) return false;
    offlinePocketBalance -= amount;
    wallet.balance += amount;
    wallet.totalBalance += amount;
    txList.insert(
      0,
      Transaction(
        id: 'TX-OFF-DEP-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        refId: 'ARAK-RECON-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        title: 'Returned from Offline Pocket',
        titleMm: 'အော့ဖ်လိုင်းအိတ်ကပ်မှ ပြန်လည်သွင်းယူခြင်း',
        category: 'rebalance',
        currency: 'AKD',
        time: 'Just now',
        status: 'SETTLED',
        counterparty: 'Péthar Online Ledger',
        counterpartyMm: 'ဖေ့သာ အွန်လိုင်းစာရင်း',
        hash: '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}...reconcile',
        amount: amount,
        fee: 0.0,
      ),
    );
    notifyListeners();
    return true;
  }

  bool sendOfflineCash({required double amount, required String recipient}) {
    if (offlinePocketBalance < amount) return false;
    offlinePocketBalance -= amount;
    txList.insert(
      0,
      Transaction(
        id: 'TX-OFF-SEND-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        refId: 'ARAK-OFFLINE-TRANSFER-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        title: 'Offline Transfer to $recipient',
        titleMm: '$recipient သို့ အော့ဖ်လိုင်းငွေလွှဲခြင်း',
        category: 'offline_transfer',
        currency: 'AKD',
        time: 'Just now',
        status: 'PENDING_MESH_SYNC',
        counterparty: recipient,
        counterpartyMm: recipient,
        hash: '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}...mesh',
        amount: -amount,
        fee: 0.0,
      ),
    );
    notifyListeners();
    return true;
  }

  void receiveOfflineCash({required double amount, required String sender, required String tokenStr}) {
    offlinePocketBalance += amount;
    offlineTokens.add(tokenStr);
    txList.insert(
      0,
      Transaction(
        id: 'TX-OFF-REC-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        refId: 'ARAK-OFFLINE-REC-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        title: 'Offline Transfer from $sender',
        titleMm: '$sender ထံမှ အော့ဖ်လိုင်းငွေလက်ခံခြင်း',
        category: 'offline_transfer',
        currency: 'AKD',
        time: 'Just now',
        status: 'HELD_IN_VAULT',
        counterparty: sender,
        counterpartyMm: sender,
        hash: '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}...token',
        amount: amount,
        fee: 0.0,
      ),
    );
    notifications.insert(
      0,
      NotificationItem(
        id: 'N-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
        titleEn: 'Offline Payment Received',
        titleMm: 'အော့ဖ်လိုင်းငွေ လက်ခံရရှိပါသည်',
        bodyEn: 'Received ${amount.toStringAsFixed(2)} AKD offline from $sender.',
        bodyMm: '$sender ထံမှ ₳ ${amount.toStringAsFixed(2)} အော့ဖ်လိုင်း ရရှိပါသည်။',
        time: 'Just now',
        dateGroup: 'Today',
        type: 'transaction',
        read: false,
      ),
    );
    notifyListeners();
  }

  void processTopup({
    required String operatorName,
    required String phone,
    required String productTitle,
    double? thbTotal,
    required double akdTotal,
  }) {
    wallet.balance = (wallet.balance - akdTotal).clamp(0.0, double.infinity);
    wallet.totalBalance = (wallet.totalBalance - akdTotal).clamp(0.0, double.infinity);
    final now = DateTime.now();
    _addTransaction(
      Transaction(
        id: 'TX-TOPUP-${now.millisecondsSinceEpoch.toString().substring(7)}',
        refId: 'REF-TOP-${now.millisecondsSinceEpoch.toString().substring(8)}',
        title: '$operatorName Top Up $phone',
        titleMm: '$operatorName ဖုန်းငွေဖြည့်ခြင်း $phone',
        category: 'Top Up',
        currency: 'AKD',
        time: 'Just now',
        status: 'Completed',
        counterparty: '$operatorName Myanmar',
        counterpartyMm: '$operatorName မြန်မာ',
        hash: '0x9b7a...${now.millisecondsSinceEpoch.toString().substring(8)}',
        amount: -akdTotal,
        fee: 0.0,
      ),
    );
    notifications.insert(
      0,
      NotificationItem(
        id: 'N-TOP-${now.millisecondsSinceEpoch.toString().substring(8)}',
        titleEn: '$operatorName Top Up Successful',
        titleMm: '$operatorName ဖုန်းငွေဖြည့်ခြင်း အောင်မြင်ပါသည်',
        bodyEn: 'Sent $productTitle to $phone. Charged ${akdTotal.toStringAsFixed(3)} AKD.',
        bodyMm: '$phone သို့ $productTitle ဖြည့်သွင်းပြီးပါပြီ။ ကျသင့်ငွေ ₳ ${akdTotal.toStringAsFixed(3)} ဖြစ်ပါသည်။',
        time: 'Just now',
        dateGroup: 'Today',
        type: 'transaction',
        read: false,
      ),
    );
    notifyListeners();
  }

  void processBillPayment({
    required String billerName,
    required String billerCategory,
    required String accountNo,
    required double mmkAmount,
    required double thbAmount,
    required double akdAmount,
  }) {
    wallet.balance = (wallet.balance - akdAmount).clamp(0.0, double.infinity);
    wallet.totalBalance = (wallet.totalBalance - akdAmount).clamp(0.0, double.infinity);
    final now = DateTime.now();
    _addTransaction(
      Transaction(
        id: 'TX-BILL-${now.millisecondsSinceEpoch.toString().substring(7)}',
        refId: 'REF-BILL-${now.millisecondsSinceEpoch.toString().substring(8)}',
        title: 'Bill: $billerName',
        titleMm: 'ဘေလ်: $billerName',
        category: 'Bills',
        currency: 'AKD',
        time: 'Just now',
        status: 'Completed',
        counterparty: billerName,
        counterpartyMm: billerName,
        hash: '0x3c8e...${now.millisecondsSinceEpoch.toString().substring(8)}',
        amount: -akdAmount,
        fee: 0.0,
      ),
    );
    notifications.insert(
      0,
      NotificationItem(
        id: 'N-BILL-${now.millisecondsSinceEpoch.toString().substring(8)}',
        titleEn: '$billerName Bill Paid',
        titleMm: '$billerName ဘေလ်ပေးဆောင်ပြီးပါပြီ',
        bodyEn: 'Account $accountNo paid ${akdAmount.toStringAsFixed(3)} AKD (${mmkAmount > 0 ? "${mmkAmount.toStringAsFixed(0)} MMK" : "${thbAmount.toStringAsFixed(2)} THB"}).',
        bodyMm: 'အကောင့် $accountNo အတွက် ₳ ${akdAmount.toStringAsFixed(3)} ပေးချေပြီးပါပြီ။',
        time: 'Just now',
        dateGroup: 'Today',
        type: 'transaction',
        read: false,
      ),
    );
    notifyListeners();
  }
}
