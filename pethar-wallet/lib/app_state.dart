import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
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
  intl,
  crypto,
  notifications,
  pay,
  history,
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
  List<Map<String, dynamic>> announcementsList = [];
  Map<String, dynamic>? pendingPayContact;
  bool dontShowQuickScanDialog = false;
  bool isLoadingDb = false;

  // ── Hardware Secure Storage Configuration ──
  // Forces hardware-level encryption:
  // - Android: EncryptedSharedPreferences backed by Android Keystore (AES-256 GCM)
  // - iOS: Hardware Keychain Services with kSecAttrAccessibleAfterFirstUnlock
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );

  static const String _keyAccessToken = 'pethar_secure_access_token_v1';
  static const String _keyRefreshToken = 'pethar_secure_refresh_token_v1';

  String? _accessToken;
  String? _refreshToken;

  /// Verified in-memory access token (Credential Obfuscated: never printed or logged)
  String? get accessToken => _accessToken;

  /// Verified in-memory refresh token (Credential Obfuscated: never printed or logged)
  String? get refreshToken => _refreshToken;

  /// Checks if a valid hardware-stored session token is active
  bool get hasSecureSession =>
      _accessToken != null && _accessToken!.trim().isNotEmpty;

  /// Standard Bearer authorization header for TLS 1.3 protected backend requests
  Map<String, String> get authenticatedHeaders => {
        'Content-Type': 'application/json',
        if (_accessToken != null && _accessToken!.isNotEmpty)
          'Authorization': 'Bearer $_accessToken',
      };

  /// Decodes JWT expiration claim locally without logging or exposing payload data
  bool _isJwtExpired(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return true;
      final normalized = base64Url.normalize(parts[1]);
      final payloadJson = utf8.decode(base64Url.decode(normalized));
      final payload = jsonDecode(payloadJson);
      if (payload is Map<String, dynamic> && payload['exp'] is int) {
        final expSeconds = payload['exp'] as int;
        final expiry = DateTime.fromMillisecondsSinceEpoch(
          expSeconds * 1000,
          isUtc: true,
        );
        // Include 30-second leeway to prevent mid-flight token expiration
        return DateTime.now().toUtc().isAfter(
              expiry.subtract(const Duration(seconds: 30)),
            );
      }
      return false;
    } catch (_) {
      return true;
    }
  }

  /// Encrypts and writes tokens immediately to the hardware vault.
  /// Enforces zero logging or plain-text exposure of credentials.
  Future<void> saveUserSession(
      String accessToken, String refreshToken) async {
    final cleanAccess = accessToken.trim();
    final cleanRefresh = refreshToken.trim();

    if (cleanAccess.isEmpty || cleanRefresh.isEmpty) {
      throw ArgumentError(
        'Tokens must not be empty when saving session to secure storage.',
      );
    }

    _accessToken = cleanAccess;
    _refreshToken = cleanRefresh;

    try {
      await _secureStorage.write(
        key: _keyAccessToken,
        value: cleanAccess,
      );
      await _secureStorage.write(
        key: _keyRefreshToken,
        value: cleanRefresh,
      );
    } catch (e) {
      // Credential Obfuscation: Log exception type only, never values
      debugPrint('[Security] Secure storage write error: ${e.runtimeType}');
      rethrow;
    }
    notifyListeners();
  }

  /// Checks whether the Supabase instance is initialized and accessible
  bool get _isSupabaseReady {
    try {
      Supabase.instance;
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Decrypts tokens securely during the mobile initialization phase to check session validity.
  /// Handles session renewal and purges stale keys if invalid.
  Future<bool> loadUserSession() async {
    try {
      final storedAccess = await _secureStorage.read(key: _keyAccessToken);
      final storedRefresh = await _secureStorage.read(key: _keyRefreshToken);

      if (storedAccess == null ||
          storedAccess.trim().isEmpty ||
          storedRefresh == null ||
          storedRefresh.trim().isEmpty) {
        _accessToken = null;
        _refreshToken = null;
        return false;
      }

      final access = storedAccess.trim();
      final refresh = storedRefresh.trim();

      if (_isSupabaseReady) {
        try {
          final auth = SupabaseService.client.auth;
          final existingSession = auth.currentSession;

          // If current session in client memory is valid and not expired
          if (existingSession != null && !existingSession.isExpired) {
            _accessToken = existingSession.accessToken;
            _refreshToken = existingSession.refreshToken ?? refresh;
            return true;
          }

          // If token has not expired based on local claims check
          if (!_isJwtExpired(access)) {
            _accessToken = access;
            _refreshToken = refresh;
            return true;
          }

          // Otherwise, refresh session server-side via Supabase GoTrue Auth
          final refreshResponse = await auth.setSession(refresh);
          if (refreshResponse.session != null &&
              !refreshResponse.session!.isExpired) {
            final newAccess = refreshResponse.session!.accessToken;
            final newRefresh =
                refreshResponse.session!.refreshToken ?? refresh;
            await saveUserSession(newAccess, newRefresh);
            return true;
          }
        } catch (authError) {
          // Credential Obfuscation: Strictly log error class, never tokens or secrets
          debugPrint(
            '[Security] Session refresh failed (${authError.runtimeType}). Purging invalid credentials.',
          );
          await clearUserSession();
          return false;
        }
      } else {
        // Fallback offline validation check
        if (!_isJwtExpired(access)) {
          _accessToken = access;
          _refreshToken = refresh;
          return true;
        }
      }

      // Expired and non-refreshable -> active cryptographic purge
      await clearUserSession();
      return false;
    } catch (e) {
      // Credential Obfuscation: Avoid logging sensitive stack traces with data
      debugPrint('[Security] Hardware vault read failure: ${e.runtimeType}');
      _accessToken = null;
      _refreshToken = null;
      return false;
    }
  }

  /// Performs an active cryptographic purge of keys upon logout or session invalidation events.
  Future<void> clearUserSession() async {
    try {
      await _secureStorage.delete(key: _keyAccessToken);
      await _secureStorage.delete(key: _keyRefreshToken);
    } catch (e) {
      debugPrint('[Security] Hardware vault purge error: ${e.runtimeType}');
    } finally {
      _accessToken = null;
      _refreshToken = null;
      notifyListeners();
    }
  }

  AppState() {
    _initializeAuthAndData();
  }

  Future<void> _initializeAuthAndData() async {
    await AuthService().initialize();

    // 1. Decrypt hardware-level tokens and check session validity
    final hasValidSession = await loadUserSession();
    if (hasValidSession && _isSupabaseReady) {
      final supaUser = SupabaseService().currentUser;
      if (supaUser?.email != null && supaUser!.email!.isNotEmpty) {
        final user = AuthService().getUser(supaUser.email!);
        if (user != null) {
          _applyAuthenticatedUser(user);
          return;
        }
      }
    }

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
    if (!_isSupabaseReady) return;
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
    // 1. Actively purge tokens from hardware vault (Keychain / EncryptedSharedPreferences)
    await clearUserSession();

    try {
      await AuthService().setActiveUserEmail(null);
      if (_isSupabaseReady) {
        await SupabaseService().signOut();
      }
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
      final session = SupabaseService().currentSession;
      if (session != null &&
          session.accessToken.isNotEmpty &&
          session.refreshToken != null) {
        await saveUserSession(session.accessToken, session.refreshToken!);
      }
      _applyAuthenticatedUser(res['user'] as StoredUser);
      return {'success': true};
    }
    return res;
  }

  /// 1b. Request Login OTP
  Future<Map<String, dynamic>> requestLoginOtp({
    required String email,
    required String pin,
  }) async {
    return await AuthService().requestLoginOtp(email: email, pin: pin);
  }

  /// 1c. Verify Login OTP and complete authentication -> routes directly to Home
  Future<Map<String, dynamic>> verifyLoginOtp({
    required String email,
    required String pin,
    required String otp,
  }) async {
    final res = await AuthService().verifyLoginOtp(email: email, pin: pin, otp: otp);
    if (res['success'] == true && res['user'] is StoredUser) {
      _applyAuthenticatedUser(res['user'] as StoredUser);
      return {'success': true};
    }
    return res;
  }

  /// 1d. Google Login with Access PIN entry -> routes directly to Home
  Future<Map<String, dynamic>> loginWithGoogleAndPin({
    required String email,
    required String pin,
    String? name,
  }) async {
    final res = await AuthService().loginWithGoogleAndPin(email: email, pin: pin, name: name);
    if (res['success'] == true && res['user'] is StoredUser) {
      _applyAuthenticatedUser(res['user'] as StoredUser);
      return {'success': true};
    }
    return res;
  }

  /// 1e. Google Signup with Create Access PIN -> routes directly to Home
  Future<Map<String, dynamic>> registerWithGoogleAndPin({
    required String email,
    required String pin,
    required String confirmPin,
    String? name,
  }) async {
    final res = await AuthService().registerWithGoogleAndPin(
      email: email,
      pin: pin,
      confirmPin: confirmPin,
      name: name,
    );
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
      final session = SupabaseService().currentSession;
      if (session != null &&
          session.accessToken.isNotEmpty &&
          session.refreshToken != null) {
        await saveUserSession(session.accessToken, session.refreshToken!);
      }
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

}
