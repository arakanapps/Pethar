import 'package:flutter/material.dart';
import 'models/data.dart';

enum Screen { home, account, services, settings, send, receive, scan, cashout, intl, crypto, pos, notifications, desktop, offlinePayment }

class AppState extends ChangeNotifier {
  Screen currentScreen = Screen.home;
  List<Screen> navigationStack = [Screen.home];
  String language = 'ak'; // Default Arakanese (ak)
  ThemeMode themeMode = ThemeMode.dark;
  UserProfile profile = initialUserProfile;
  WalletBalance wallet = akdWallet;
  bool isVerified = true;
  bool balanceHidden = false;
  bool autoSaveSlip = true;
  bool twoFactorAuth = true;
  bool cardFrozen = false;
  bool showCardCvv = false;
  List<NotificationItem> notifications = List.from(sampleNotifications);
  List<Transaction> txList = List.from(transactions);
  double offlinePocketBalance = 150.0; // Pre-loaded offline bearer cash
  List<String> offlineTokens = [];     // Stored bearer tokens

  int get unreadNotificationsCount => notifications.where((n) => !n.read).length;

  void navigate(Screen screen) {
    if (currentScreen != screen) {
      navigationStack.add(screen);
      currentScreen = screen;
      notifyListeners();
    }
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
    themeMode = themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
  }

  void setTheme(ThemeMode mode) {
    themeMode = mode;
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

  void updateProfile({required String name, required String email, required String phone, required String petharId, required String location}) {
    profile.name = name;
    profile.email = email;
    profile.phone = phone;
    profile.petharId = petharId;
    profile.location = location;
    notifyListeners();
  }

  void recordTransfer({required double amount, required String recipientName, required String recipientId}) {
    wallet.balance -= amount;
    wallet.totalBalance -= amount;
    txList.insert(
      0,
      Transaction(
        id: 'TX-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        refId: 'ARAK-P2P-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        title: 'Transfer to $recipientName',
        titleMm: '$recipientName သို့ ငွေလွှဲခြင်း',
        category: 'p2p',
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
        refId: 'ARAK-OFFLINE-P2P-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        title: 'Offline P2P to $recipient',
        titleMm: '$recipient သို့ အော့ဖ်လိုင်းငွေလွှဲခြင်း',
        category: 'offline_p2p',
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
        title: 'Offline P2P from $sender',
        titleMm: '$sender ထံမှ အော့ဖ်လိုင်းငွေလက်ခံခြင်း',
        category: 'offline_p2p',
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
}
