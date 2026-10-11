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
  bool balanceHidden = false;
  bool autoSaveSlip = true;
  bool twoFactorAuth = true;
  bool cardFrozen = false;
  bool showCardCvv = false;
  List<NotificationItem> notifications = List.from(sampleNotifications);
  List<Transaction> txList = List.from(transactions);

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
}
