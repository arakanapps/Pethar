import 'package:flutter/material.dart';
import 'models/data.dart';
import 'services/auth_service.dart';
import 'services/firebase_service.dart';
import 'services/supabase_service.dart';

enum Screen {
  home,
  account,
  services,
  settings,
  send,
  receive,
  scan,
  cashout,
  intl,
  crypto,
  pos,
  notifications,
  desktop,
  offlinePayment,
  pay,
  history,
  topup,
  billPayment,
  favourites
}

class AppState extends ChangeNotifier {
  Screen currentScreen = Screen.home;
  List<Screen> navigationStack = [Screen.home];
  String language = 'en'; // Default English matching iOS MobileWalletPage
  ThemeMode themeMode = ThemeMode.light; // Strictly light theme matching iOS
  bool isAuthenticated = false; // Fresh download/launch shows Login or Sign Up
  String financialSubView =
      'wallet_main'; // 'wallet_main' | 'deposit' | 'withdraw' | 'tx_history' | 'spending' | 'wallet_security_phrase'
  UserProfile profile = initialUserProfile;
  WalletBalance wallet = akdWallet;
  double usdAccountBalance = 0.00;
  bool isVerified = false; // Verified when Level 2 National ID approved
  bool balanceHidden = false;
  bool walletBalanceHidden = false;
  bool autoSaveSlip = true;
  bool twoFactorAuth = false;
  bool cardFrozen = false;
  bool showCardCvv = false;
  List<NotificationItem> notifications = [];
  List<Transaction> txList = [];
  List<String> recentUsdAddresses = [];
  List<FavoriteContact> favoriteContactsList = [];
  List<Contact> contactsList = [];
  List<Agent> agentsList = [];
  List<Map<String, dynamic>> fxRatesList = [];
  List<Map<String, dynamic>> billProvidersList = [];
  List<Map<String, dynamic>> topupPackagesList = [];
  List<Map<String, dynamic>> announcementsList = [];
  double offlinePocketBalance = 0.00; // Offline bearer cash
  List<String> offlineTokens = []; // Stored bearer tokens
  Map<String, dynamic>? pendingPayContact;
  bool dontShowQuickScanDialog = false;
  bool isLoadingDb = false;

  AppState() {
    _initializeAuthAndData();
  }

  Future<void> _initializeAuthAndData() async {
    await AuthService().initialize();
    final activeEmail = await AuthService().getSavedActiveUserEmail();
    if (activeEmail != null && activeEmail.isNotEmpty) {
      final user = AuthService().getUser(activeEmail);
      if (user != null) {
        _applyAuthenticatedUser(user);
        return; // _applyAuthenticatedUser triggers loadSupabaseData()
      }
    }
    await loadSupabaseData();
  }

  /// Fetch live data from Supabase tables scoped to current user
  Future<void> loadSupabaseData() async {
    isLoadingDb = true;
    notifyListeners();
    try {
      final supa = SupabaseService();
      final currentUid =
          (isAuthenticated && profile.uid.isNotEmpty) ? profile.uid : null;

      // 1. Fetch transactions from Supabase for this authenticated user
      if (currentUid != null) {
        final remoteTxs = await supa.fetchTransactions(userId: currentUid);
        txList = remoteTxs;
        transactions = txList;
      } else {
        txList = [];
        transactions = [];
      }

      // 2. Fetch User Profile & Balance from Supabase only if authenticated
      if (isAuthenticated && currentUid != null) {
        final profileMap =
            await supa.fetchUserProfile(uid: currentUid, email: profile.email);
        if (profileMap != null) {
          if (profileMap['username'] != null &&
              profileMap['username'].toString().isNotEmpty) {
            profile.username = profileMap['username'].toString();
          }
          if (profileMap['uid'] != null &&
              profileMap['uid'].toString().isNotEmpty) {
            profile.uid = profileMap['uid'].toString();
            profile.walletAddress = profile.uid;
            profile.petharId = profile.uid;
          }
          if (profileMap['wallet_address'] != null &&
              profileMap['wallet_address'].toString().isNotEmpty) {
            profile.walletAddress = profileMap['wallet_address'].toString();
          }
          if (profileMap['usd_account_wallet_address'] != null &&
              profileMap['usd_account_wallet_address'].toString().isNotEmpty) {
            profile.usdAccountWalletAddress =
                profileMap['usd_account_wallet_address'].toString();
          }
          if (profileMap['first_name'] != null &&
              profileMap['first_name'].toString().isNotEmpty)
            profile.firstName = profileMap['first_name'].toString();
          if (profileMap['last_name'] != null &&
              profileMap['last_name'].toString().isNotEmpty)
            profile.lastName = profileMap['last_name'].toString();
          if (profileMap['name'] != null &&
              profileMap['name'].toString().isNotEmpty)
            profile.name = profileMap['name'].toString();
          if (profileMap['nickname'] != null &&
              profileMap['nickname'].toString().isNotEmpty)
            profile.nickname = profileMap['nickname'].toString();
          if (profileMap['email'] != null &&
              profileMap['email'].toString().isNotEmpty)
            profile.email = profileMap['email'].toString();
          if (profileMap['phone'] != null &&
              profileMap['phone'].toString().isNotEmpty)
            profile.phone = profileMap['phone'].toString();
          if (profileMap['national_id_no'] != null &&
              profileMap['national_id_no'].toString().isNotEmpty)
            profile.nationalIdNo = profileMap['national_id_no'].toString();
          if (profileMap['dob'] != null &&
              profileMap['dob'].toString().isNotEmpty)
            profile.dob = profileMap['dob'].toString();
          if (profileMap['address'] != null &&
              profileMap['address'].toString().isNotEmpty)
            profile.address = profileMap['address'].toString();
          if (profileMap['gender'] != null &&
              profileMap['gender'].toString().isNotEmpty)
            profile.gender = profileMap['gender'].toString();
          if (profileMap['id_type'] != null &&
              profileMap['id_type'].toString().isNotEmpty)
            profile.idType = profileMap['id_type'].toString();
          if (profileMap['avatar_url'] != null &&
              profileMap['avatar_url'].toString().isNotEmpty) {
            profile.avatarUrl = profileMap['avatar_url'].toString();
          }
          if (profileMap['balance'] != null) {
            final bal = double.tryParse(profileMap['balance'].toString()) ??
                wallet.balance;
            profile.akdWalletBalance = bal;
            wallet.balance = bal;
            wallet.totalBalance = bal;
          }
          if (profileMap['usd_account_balance'] != null) {
            final usdBal =
                double.tryParse(profileMap['usd_account_balance'].toString()) ??
                    usdAccountBalance;
            profile.usdAccountBalance = usdBal;
            usdAccountBalance = usdBal;
          }
        }
      }

      // 3. Fetch Favorite Contacts from Supabase for this authenticated user
      if (currentUid != null) {
        final remoteFavs = await supa.fetchFavoriteContacts(userId: currentUid);
        favoriteContactsList = remoteFavs;
        favoriteContacts = favoriteContactsList;
        contactsList = remoteFavs
            .map((f) => Contact(
                  name: f.name,
                  mm: f.mm,
                  id: f.id,
                  location: f.category,
                  phone: f.phone,
                  initials: f.initials,
                ))
            .toList();
        contacts = contactsList;
      } else {
        favoriteContactsList = [];
        favoriteContacts = [];
        contactsList = [];
        contacts = [];
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

  void addTransaction(Transaction tx) {
    txList.insert(0, tx);
    transactions = txList;
    final uid = profile.uid.isNotEmpty ? profile.uid : profile.email;
    if (uid.isNotEmpty) {
      SupabaseService().insertTransaction(tx, userId: uid);
      SupabaseService().updateUserBalance(wallet.balance,
          uid: profile.uid, email: profile.email);
    }
    notifyListeners();
  }

  void addFavoriteContact(FavoriteContact contact) {
    favoriteContactsList.add(contact);
    favoriteContacts = favoriteContactsList;
    contactsList = favoriteContactsList
        .map((f) => Contact(
              name: f.name,
              mm: f.mm,
              id: f.id,
              location: f.category,
              phone: f.phone,
              initials: f.initials,
            ))
        .toList();
    contacts = contactsList;
    final uid = profile.uid.isNotEmpty ? profile.uid : profile.email;
    if (uid.isNotEmpty) {
      SupabaseService().insertFavoriteContact(contact, userId: uid);
    }
    notifyListeners();
  }

  void updateFavoriteContact(int index, FavoriteContact updated) {
    if (index >= 0 && index < favoriteContactsList.length) {
      favoriteContactsList[index] = updated;
      favoriteContacts = favoriteContactsList;
      contactsList = favoriteContactsList
          .map((f) => Contact(
                name: f.name,
                mm: f.mm,
                id: f.id,
                location: f.category,
                phone: f.phone,
                initials: f.initials,
              ))
          .toList();
      contacts = contactsList;
      final uid = profile.uid.isNotEmpty ? profile.uid : profile.email;
      if (uid.isNotEmpty) {
        SupabaseService().updateFavoriteContact(updated, userId: uid);
      }
      notifyListeners();
    }
  }

  void deleteFavoriteContact(int index) {
    if (index >= 0 && index < favoriteContactsList.length) {
      final item = favoriteContactsList.removeAt(index);
      favoriteContacts = favoriteContactsList;
      contactsList = favoriteContactsList
          .map((f) => Contact(
                name: f.name,
                mm: f.mm,
                id: f.id,
                location: f.category,
                phone: f.phone,
                initials: f.initials,
              ))
          .toList();
      contacts = contactsList;
      final uid = profile.uid.isNotEmpty ? profile.uid : profile.email;
      if (uid.isNotEmpty) {
        SupabaseService().deleteFavoriteContact(item.id, userId: uid);
      }
      notifyListeners();
    }
  }

  int get unreadNotificationsCount =>
      notifications.where((n) => !n.read).length;

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
    } else if (screen == Screen.notifications &&
        currentScreen != Screen.notifications) {
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
      await AuthService().setActiveUserEmail(null);
      await SupabaseService().signOut();
    } catch (_) {}
    try {
      await FirebaseService().signOut();
    } catch (e) {
      debugPrint('Sign out notice: $e');
    }
    profile = initialUserProfile;
    isAuthenticated = false;
    isVerified = false;
    favoriteContactsList = [];
    favoriteContacts = [];
    contactsList = [];
    contacts = [];
    txList = [];
    transactions = [];
    currentScreen = Screen.home;
    navigationStack = [Screen.home];
    financialSubView = 'wallet_main';
    notifyListeners();
  }

  /// Apply authenticated user identity to state
  void _applyAuthenticatedUser(StoredUser user) {
    profile.email = user.email;
    profile.name = user.name;
    profile.username = user.username;
    profile.uid = user.uid;
    profile.walletAddress = user.uid;
    profile.petharId = user.uid;
    profile.pin = user.pin;
    profile.kycTier = user.kycTier;
    profile.kycStatus = user.kycStatus;
    profile.accountTier = user.kycTier == 2
        ? 'Level 2: National ID Verified'
        : (user.kycStatus == 'PENDING_REVIEW'
            ? 'Level 2: Pending Review'
            : 'Level 1: Email Verified');
    profile.nationalIdNo = user.nationalIdNo;
    profile.dob = user.dob;
    profile.address = user.address;
    profile.gender = user.gender;
    profile.idType = user.idType;
    isVerified = user.kycTier >= 2;
    isAuthenticated = true;
    currentScreen = Screen.home;
    navigationStack = [Screen.home];
    notifyListeners();
    // Load this specific user's data from Supabase
    loadSupabaseData();
  }

  /// 1. Log in with Email and 6-digit PIN
  Future<Map<String, dynamic>> loginWithEmailAndPin({
    required String email,
    required String pin,
  }) async {
    final res =
        await AuthService().loginWithEmailAndPin(email: email, pin: pin);
    if (res['success'] == true && res['user'] is StoredUser) {
      _applyAuthenticatedUser(res['user'] as StoredUser);
      return {'success': true};
    }
    return res;
  }

  /// 2. Request Forgot Password / PIN Reset OTP (10 minute expiry)
  Future<Map<String, dynamic>> requestPinResetOtp(String email) async {
    return await AuthService().requestPinResetOtp(email: email);
  }

  /// 3. Verify PIN Reset OTP
  Future<Map<String, dynamic>> verifyPinResetOtp(
      String email, String otp) async {
    return await AuthService().verifyPinResetOtp(email: email, otp: otp);
  }

  /// 4. Confirm and save New 6-digit PIN
  Future<Map<String, dynamic>> confirmPinReset({
    required String email,
    required String newPin,
    required String confirmPin,
  }) async {
    return await AuthService().confirmPinReset(
      email: email,
      newPin: newPin,
      confirmPin: confirmPin,
    );
  }

  /// 5. Sign up Step 1: Credentials and send 10-minute Email OTP
  Future<Map<String, dynamic>> initiateSignUp({
    required String email,
    required String pin,
    required String confirmPin,
  }) async {
    return await AuthService().initiateSignUp(
      email: email,
      pin: pin,
      confirmPin: confirmPin,
    );
  }

  /// 6. Sign up Step 2: Verify Email OTP
  Future<Map<String, dynamic>> verifySignUpOtp(String email, String otp) async {
    return await AuthService().verifySignUpOtp(email: email, otp: otp);
  }

  /// 7. Sign up Step 3: Complete Identity -> Issues UID and KYC Level 1
  Future<Map<String, dynamic>> completeSignUp({
    required String email,
    required String name,
    required String username,
  }) async {
    final res = await AuthService().completeSignUp(
      email: email,
      name: name,
      username: username,
    );
    if (res['success'] == true && res['user'] is StoredUser) {
      _applyAuthenticatedUser(res['user'] as StoredUser);
      return {'success': true};
    }
    return res;
  }

  /// 8. Submit KYC Level 2 (National ID Verification) -> Pending Review
  Future<Map<String, dynamic>> submitKycLevel2({
    required String nationalIdNo,
    required String dob,
    required String fullName,
    required String address,
  }) async {
    final res = await AuthService().submitKycLevel2(
      email: profile.email,
      nationalIdNo: nationalIdNo,
      dob: dob,
      fullName: fullName,
      address: address,
    );
    if (res['success'] == true && res['user'] is StoredUser) {
      _applyAuthenticatedUser(res['user'] as StoredUser);
      return {'success': true, 'message': res['message']};
    }
    return res;
  }

  /// 9. Approve KYC Level 2 (Upgrade to Level 2)
  Future<Map<String, dynamic>> approveKycLevel2() async {
    final res = await AuthService().approveKycLevel2(email: profile.email);
    if (res['success'] == true && res['user'] is StoredUser) {
      _applyAuthenticatedUser(res['user'] as StoredUser);
      return {'success': true, 'message': res['message']};
    }
    return res;
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

  // Notifications are fetched from the database — no local demo reset

  void updateProfile(
      {required String name,
      required String email,
      required String phone,
      required String petharId,
      required String location}) {
    profile.name = name;
    profile.email = email;
    profile.phone = phone;
    profile.petharId = petharId;
    profile.location = location;
    notifyListeners();
  }

  void notify() => notifyListeners();

  @Deprecated('Currency conversion is disabled for the first release.')
  void convertStablecoin(
      {required double amount,
      required String fromToken,
      required String toToken}) {}

  @Deprecated('Account conversions are disabled for the first release.')
  void transferBetweenAccounts(
      {required double amount, required bool usdToAkd}) {}

  @Deprecated('Use the authenticated, idempotent AKD transfer service.')
  void recordTransfer(
      {required double amount,
      required String recipientName,
      required String recipientId}) {}

  @Deprecated('USD/crypto withdrawals are disabled for the first release.')
  void recordUsdTransfer(
      {required double amount,
      required String recipientAddress,
      String token = 'USDT'}) {}

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

  @Deprecated(
      'Offline wallet funding is disabled until server settlement exists.')
  bool loadOfflinePocket(double amount) => false;

  @Deprecated(
      'Offline wallet reconciliation is disabled until server settlement exists.')
  bool depositOfflinePocket(double amount) => false;

  @Deprecated('Offline transfers are disabled until server settlement exists.')
  bool sendOfflineCash({required double amount, required String recipient}) =>
      false;

  @Deprecated(
      'Offline token redemption is disabled until server settlement exists.')
  void receiveOfflineCash({
    required double amount,
    required String sender,
    required String tokenStr,
  }) {}

  @Deprecated('Top-ups are disabled until server-side settlement is available.')
  void processTopup({
    required String operatorName,
    required String phone,
    required String productTitle,
    required double akdTotal,
  }) {}

  @Deprecated(
      'Bill payments are disabled until server-side settlement is available.')
  void processBillPayment({
    required String billerName,
    required String billerCategory,
    required String accountNo,
    required double akdAmount,
  }) {}
}
