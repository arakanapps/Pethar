import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'models/crypto_wallet.dart';
import 'models/data.dart';
import 'core/services/auth_service.dart';
import 'core/services/supabase_service.dart';
import 'core/services/telecom_billing_service.dart';

enum Screen {
  home,
  account,
  services,
  settings,
  receive,
  scan,
  crypto,
  notifications,
  pay,
  history,
  favourites,
  topup,
  bills
}

class AppState extends ChangeNotifier {
  Screen currentScreen = Screen.home;
  List<Screen> navigationStack = [Screen.home];
  String language = 'en'; // Default English matching iOS MobileWalletPage
  ThemeMode themeMode = ThemeMode.light; // Strictly light theme matching iOS
  bool isAuthenticated =
      false; // Pre-authenticated for immediate testing on emulator

  /// True while the saved session is being restored on cold start. The shell
  /// keeps showing the splash until this flips to false, so the login screen
  /// never flashes before the PIN lock is applied.
  bool isInitializing = true;

  /// True when a restored session must be unlocked with the PIN gate before
  /// any wallet UI is shown (cold app start security lock).
  bool isAppLocked = false;
  String financialSubView =
      'wallet_main'; // 'wallet_main' | 'deposit' | 'withdraw' | 'tx_history' | 'spending' | 'wallet_security_phrase'
  UserProfile profile = initialUserProfile;
  WalletBalance wallet = akdWallet;
  double usdAccountBalance = 0.00;
  CryptoWalletState cryptoWallet = CryptoWalletState.fallback();
  bool isLoadingCryptoWallet = false;
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
  List<Map<String, dynamic>> topupPackagesList = [];
  List<Map<String, dynamic>> billProvidersList = [];
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
  static const String _keyPinHash = 'pethar_secure_pin_hash_v1';

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
  Future<void> saveUserSession(String accessToken, String refreshToken) async {
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
            final newRefresh = refreshResponse.session!.refreshToken ?? refresh;
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

  /// Securely encrypts and persists PIN hash in Hardware Keychain / Keystore vault
  Future<void> saveSecurePinHash(String pin) async {
    final cleanPin = pin.trim();
    if (cleanPin.isEmpty) return;
    try {
      final bytes = utf8.encode(cleanPin);
      final hash = sha256.convert(bytes).toString();
      await _secureStorage.write(key: _keyPinHash, value: hash);
    } catch (e) {
      debugPrint(
          '[Security] Hardware vault PIN write failure: ${e.runtimeType}');
    }
  }

  /// Cryptographically verifies candidate PIN against Hardware Keychain / Keystore vault hash
  Future<bool> verifySecurePin(String pin) async {
    final cleanPin = pin.trim();
    if (cleanPin.isEmpty) return false;
    try {
      final storedHash = await _secureStorage.read(key: _keyPinHash);
      if (storedHash == null || storedHash.isEmpty) return false;
      final bytes = utf8.encode(cleanPin);
      final candidateHash = sha256.convert(bytes).toString();
      return storedHash == candidateHash;
    } catch (e) {
      debugPrint(
          '[Security] Hardware vault PIN read failure: ${e.runtimeType}');
      return false;
    }
  }

  /// Cryptographically purges PIN hash from Hardware Keychain / Keystore vault
  Future<void> clearSecurePinHash() async {
    try {
      await _secureStorage.delete(key: _keyPinHash);
    } catch (e) {
      debugPrint(
          '[Security] Hardware vault PIN purge failure: ${e.runtimeType}');
    }
  }

  /// Locks the app behind the PIN gate. Used when a saved session is restored
  /// on cold start so the wallet is never opened without re-authentication.
  void lockApp() {
    if (!isAuthenticated || isAppLocked) return;
    isAppLocked = true;
    notifyListeners();
  }

  /// Verifies [pin] against the hardware vault hash and unlocks the app.
  /// Falls back to the locally stored profile PIN for sessions created before
  /// the vault hash existed, migrating that PIN into the vault on success.
  Future<bool> unlockWithPin(String pin) async {
    final cleanPin = pin.trim();
    if (!RegExp(r'^\d{6}$').hasMatch(cleanPin)) return false;

    bool isValid = false;
    try {
      final storedHash = await _secureStorage.read(key: _keyPinHash);
      if (storedHash != null && storedHash.isNotEmpty) {
        isValid = await verifySecurePin(cleanPin);
      } else if (profile.pin.trim().isNotEmpty) {
        isValid = cleanPin == profile.pin.trim();
        if (isValid) await saveSecurePinHash(cleanPin);
      }
    } catch (e) {
      debugPrint('[Security] App unlock failure: ${e.runtimeType}');
      isValid = false;
    }

    if (isValid) {
      isAppLocked = false;
      notifyListeners();
    }
    return isValid;
  }

  /// Unlocks the app after a successful fingerprint / Face ID prompt.
  void unlockWithBiometrics() {
    if (!isAppLocked) return;
    isAppLocked = false;
    notifyListeners();
  }

  /// Performs an active cryptographic purge of keys upon logout or session invalidation events.
  Future<void> clearUserSession() async {
    try {
      await _secureStorage.delete(key: _keyAccessToken);
      await _secureStorage.delete(key: _keyRefreshToken);
      await _secureStorage.delete(key: _keyPinHash);
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
    try {
      await AuthService().initialize();

      // 1. Decrypt hardware-level tokens and check session validity
      final hasValidSession = await loadUserSession();
      if (hasValidSession && _isSupabaseReady) {
        final supaUser = SupabaseService().currentUser;
        if (supaUser?.email != null && supaUser!.email!.isNotEmpty) {
          final user = AuthService().getUser(supaUser.email!);
          if (user != null) {
            _applyAuthenticatedUser(user);
            lockApp();
            return;
          }
        }
      }

      final activeEmail = await AuthService().getSavedActiveUserEmail();
      if (activeEmail != null && activeEmail.isNotEmpty) {
        final user = AuthService().getUser(activeEmail);
        if (user != null) {
          _applyAuthenticatedUser(user);
          lockApp();
          return; // _applyAuthenticatedUser triggers loadSupabaseData()
        }
      }
      await loadSupabaseData();
    } catch (e) {
      debugPrint('[Startup] Session restore failed: ${e.runtimeType}');
    } finally {
      isInitializing = false;
      notifyListeners();
    }
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
              profileMap['first_name'].toString().isNotEmpty) {
            profile.firstName = profileMap['first_name'].toString();
          }
          if (profileMap['last_name'] != null &&
              profileMap['last_name'].toString().isNotEmpty) {
            profile.lastName = profileMap['last_name'].toString();
          }
          if (profileMap['name'] != null &&
              profileMap['name'].toString().isNotEmpty) {
            profile.name = profileMap['name'].toString();
          }
          if (profileMap['nickname'] != null &&
              profileMap['nickname'].toString().isNotEmpty) {
            profile.nickname = profileMap['nickname'].toString();
          }
          if (profileMap['email'] != null &&
              profileMap['email'].toString().isNotEmpty) {
            profile.email = profileMap['email'].toString();
          }
          if (profileMap['phone'] != null &&
              profileMap['phone'].toString().isNotEmpty) {
            profile.phone = profileMap['phone'].toString();
          }
          if (profileMap['national_id_no'] != null &&
              profileMap['national_id_no'].toString().isNotEmpty) {
            profile.nationalIdNo = profileMap['national_id_no'].toString();
          }
          if (profileMap['dob'] != null &&
              profileMap['dob'].toString().isNotEmpty) {
            profile.dob = profileMap['dob'].toString();
          }
          if (profileMap['address'] != null &&
              profileMap['address'].toString().isNotEmpty) {
            profile.address = profileMap['address'].toString();
          }
          profile.addressHouseNo =
              profileMap['address_house_no']?.toString() ?? profile.addressHouseNo;
          profile.addressStreet =
              profileMap['address_street']?.toString() ?? profile.addressStreet;
          profile.addressWard =
              profileMap['address_ward']?.toString() ?? profile.addressWard;
          profile.addressSubDistrict =
              profileMap['address_sub_district']?.toString() ??
                  profile.addressSubDistrict;
          profile.addressDistrict =
              profileMap['address_district']?.toString() ??
                  profile.addressDistrict;
          profile.addressProvince =
              profileMap['address_province']?.toString() ??
                  profile.addressProvince;
          profile.addressCountry =
              profileMap['address_country']?.toString() ??
                  profile.addressCountry;
          profile.addressPostalCode =
              profileMap['address_postal_code']?.toString() ??
                  profile.addressPostalCode;
          profile.nricFrontUrl =
              profileMap['nric_front_url']?.toString() ?? profile.nricFrontUrl;
          profile.nricBackUrl =
              profileMap['nric_back_url']?.toString() ?? profile.nricBackUrl;
          profile.selfieUrl =
              profileMap['selfie_url']?.toString() ?? profile.selfieUrl;
          profile.kycRejectionReason =
              profileMap['kyc_rejection_reason']?.toString() ?? '';
          profile.kycSubmittedAt =
              profileMap['kyc_submitted_at']?.toString() ??
                  profile.kycSubmittedAt;
          if (profileMap['kyc_status'] != null &&
              profileMap['kyc_status'].toString().isNotEmpty) {
            profile.kycStatus = profileMap['kyc_status'].toString();
          }
          if (profileMap['kyc_tier'] != null) {
            final tier = int.tryParse(profileMap['kyc_tier'].toString());
            if (tier != null) {
              profile.kycTier = tier;
              isVerified = tier >= 2;
            }
          }
          profile.accountTier = profile.kycTier >= 2
              ? 'Level 2: National ID Verified'
              : (profile.kycStatus == 'PENDING_REVIEW'
                  ? 'Level 2: Pending Review'
                  : (profile.kycStatus == 'REJECTED'
                      ? 'Level 2: Rejected'
                      : 'Level 1: Email Verified'));
          if (profileMap['gender'] != null &&
              profileMap['gender'].toString().isNotEmpty) {
            profile.gender = profileMap['gender'].toString();
          }
          if (profileMap['id_type'] != null &&
              profileMap['id_type'].toString().isNotEmpty) {
            profile.idType = profileMap['id_type'].toString();
          }
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

      // 5. Fetch Multi-Chain USDT/USDC Crypto Wallet State
      if (isAuthenticated) {
        final remoteCrypto = await supa.fetchCryptoWallet();
        if (remoteCrypto != null) {
          _applyCryptoWalletState(remoteCrypto);
        }
      }

      // 6. Top-up catalogue & bill providers (public tables, migrated from
      // the archived telecom-billing module)
      final billing = TelecomBillingService(SupabaseService.client);
      topupPackagesList = await billing.fetchTopupPackages();
      billProvidersList = await billing.fetchBillProviders();
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
    profile = initialUserProfile;
    isAuthenticated = false;
    isAppLocked = false;
    isVerified = false;
    favoriteContactsList = [];
    favoriteContacts = [];
    contactsList = [];
    contacts = [];
    txList = [];
    transactions = [];
    cryptoWallet = CryptoWalletState.fallback();
    usdAccountBalance = 0.00;
    currentScreen = Screen.home;
    navigationStack = [Screen.home];
    financialSubView = 'wallet_main';
    notifyListeners();
  }

  /// Apply authenticated user identity to state
  void _applyAuthenticatedUser(StoredUser user) {
    final validUid =
        RegExp(r'^\d{12}$').hasMatch(user.uid) ? user.uid : generateUserUid();
    user.uid = validUid;
    profile.email = user.email;
    profile.name = user.name;
    profile.username = user.username;
    profile.uid = validUid;
    profile.walletAddress = validUid;
    profile.petharId = validUid;
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
    final cleanEmail = email.trim().toLowerCase();
    final cleanPin = pin.trim();

    if (cleanEmail.isEmpty || !cleanEmail.contains('@')) {
      return {
        'success': false,
        'error': 'Please enter a valid email address',
        'isPinOrEmailWrong': false,
      };
    }
    if (cleanPin.length != 6 || !RegExp(r'^\d{6}$').hasMatch(cleanPin)) {
      return {
        'success': false,
        'error': 'PIN code must be exactly 6 digits',
        'isPinOrEmailWrong': false,
      };
    }

    // Route PIN verification: online -> Supabase verify_user_pin RPC, offline -> hardware secure storage
    if (SupabaseService().authUserId != null) {
      final rpcRes = await SupabaseService().verifyUserPin(cleanPin);
      if (rpcRes['valid'] != true) {
        return {
          'success': false,
          'error': rpcRes['message']?.toString() ?? 'Wrong PIN code',
          'isPinOrEmailWrong': true,
        };
      }
    } else {
      final storedHash = await _secureStorage.read(key: _keyPinHash);
      if (storedHash != null && storedHash.isNotEmpty) {
        final isMatch = await verifySecurePin(cleanPin);
        if (!isMatch) {
          return {
            'success': false,
            'error': 'Wrong PIN code',
            'isPinOrEmailWrong': true,
          };
        }
      }
    }

    final res = await AuthService()
        .loginWithEmailAndPin(email: cleanEmail, pin: cleanPin);
    if (res['success'] == true && res['user'] is StoredUser) {
      await saveSecurePinHash(pin);
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

  /// Step 1 (Unified Login & Sign Up): Send 6-Digit Email OTP
  Future<Map<String, dynamic>> requestAuthEmailOtp({
    required String email,
    required bool isSignUp,
  }) async {
    return await AuthService().requestAuthEmailOtp(
      email: email,
      isSignUp: isSignUp,
    );
  }

  /// Step 2 (Unified Login & Sign Up): Verify 6-Digit Email OTP
  Future<Map<String, dynamic>> verifyAuthEmailOtp({
    required String email,
    required String otp,
    required bool isSignUp,
  }) async {
    return await AuthService().verifyAuthEmailOtp(
      email: email,
      otp: otp,
      isSignUp: isSignUp,
    );
  }

  /// Step 3A (After OTP Verified): Enter 6-Digit PIN -> Homepage
  Future<Map<String, dynamic>> completeAuthWithPin({
    required String email,
    required String pin,
    String? confirmPin,
    required bool isSignUp,
    String? displayName,
  }) async {
    final cleanPin = pin.trim();
    if (!isSignUp) {
      final storedHash = await _secureStorage.read(key: _keyPinHash);
      if (storedHash != null && storedHash.isNotEmpty) {
        final storedEmail = await AuthService().getSavedActiveUserEmail();
        if (storedEmail == email.trim().toLowerCase()) {
          final isMatch = await verifySecurePin(cleanPin);
          if (!isMatch) {
            return {
              'success': false,
              'error': 'Incorrect 6-digit PIN code.',
              'isPinOrEmailWrong': true,
            };
          }
        }
      }
    }

    final res = await AuthService().completeAuthWithPin(
      email: email,
      pin: cleanPin,
      confirmPin: confirmPin,
      isSignUp: isSignUp,
      displayName: displayName,
    );
    if (res['success'] == true && res['user'] is StoredUser) {
      await saveSecurePinHash(cleanPin);
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

  /// Step 3B (After OTP Verified): Authenticate with Device Fingerprint or Face ID -> Homepage
  Future<Map<String, dynamic>> completeAuthWithBiometrics({
    required String email,
    required bool isSignUp,
    String? displayName,
  }) async {
    final res = await AuthService().completeAuthWithBiometrics(
      email: email,
      isSignUp: isSignUp,
      displayName: displayName,
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
    final res =
        await AuthService().verifyLoginOtp(email: email, pin: pin, otp: otp);
    if (res['success'] == true && res['user'] is StoredUser) {
      await saveSecurePinHash(pin);
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

  /// 1d. Google Login with Access PIN entry -> routes directly to Home
  Future<Map<String, dynamic>> loginWithGoogleAndPin({
    required String email,
    required String pin,
    String? name,
  }) async {
    final res = await AuthService()
        .loginWithGoogleAndPin(email: email, pin: pin, name: name);
    if (res['success'] == true && res['user'] is StoredUser) {
      await saveSecurePinHash(pin);
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
      await saveSecurePinHash(pin);
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
    final res = await AuthService().confirmPinReset(
      email: email,
      newPin: newPin,
      confirmPin: confirmPin,
    );
    if (res['success'] == true) {
      await saveSecurePinHash(newPin);
    }
    return res;
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
      final user = res['user'] as StoredUser;
      if (user.pin.isNotEmpty) {
        await saveSecurePinHash(user.pin);
      }
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
    String? nricFrontUrl,
    String? nricBackUrl,
    String? selfieUrl,
    String? houseNo,
    String? street,
    String? ward,
    String? subDistrict,
    String? district,
    String? province,
    String? country,
    String? postalCode,
  }) async {
    final res = await AuthService().submitKycLevel2(
      email: profile.email,
      nationalIdNo: nationalIdNo,
      dob: dob,
      fullName: fullName,
      address: address,
      nricFrontUrl: nricFrontUrl,
      nricBackUrl: nricBackUrl,
      selfieUrl: selfieUrl,
      houseNo: houseNo,
      street: street,
      ward: ward,
      subDistrict: subDistrict,
      district: district,
      province: province,
      country: country,
      postalCode: postalCode,
    );
    if (res['success'] == true) {
      profile.nricFrontUrl = nricFrontUrl ?? profile.nricFrontUrl;
      profile.nricBackUrl = nricBackUrl ?? profile.nricBackUrl;
      profile.selfieUrl = selfieUrl ?? profile.selfieUrl;
      profile.addressHouseNo = houseNo ?? profile.addressHouseNo;
      profile.addressStreet = street ?? profile.addressStreet;
      profile.addressWard = ward ?? profile.addressWard;
      profile.addressSubDistrict = subDistrict ?? profile.addressSubDistrict;
      profile.addressDistrict = district ?? profile.addressDistrict;
      profile.addressProvince = province ?? profile.addressProvince;
      profile.addressCountry = country ?? profile.addressCountry;
      profile.addressPostalCode = postalCode ?? profile.addressPostalCode;
      profile.kycStatus = 'PENDING_REVIEW';
      notifyListeners();
    }
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

  void _applyCryptoWalletState(CryptoWalletState next) {
    cryptoWallet = next;
    final total = next.totalUsdBalance;
    usdAccountBalance = total;
    profile.usdAccountBalance = total;
    if (next.kycTier >= 2) {
      isVerified = true;
      profile.kycTier = next.kycTier;
    }
    final evmAddr = next.primaryEvmAddress;
    if (evmAddr != null && evmAddr.isNotEmpty) {
      profile.usdAccountWalletAddress = evmAddr;
    }
    final recent = <String>{...recentUsdAddresses};
    for (final w in next.withdrawals) {
      if (w.toAddress.trim().isNotEmpty) {
        recent.add(w.toAddress.trim());
      }
    }
    recentUsdAddresses = recent.take(10).toList();
  }

  Future<void> refreshCryptoWallet() async {
    if (!_isSupabaseReady || !isAuthenticated) return;
    isLoadingCryptoWallet = true;
    notifyListeners();
    try {
      final remote = await SupabaseService().fetchCryptoWallet();
      if (remote != null) {
        _applyCryptoWalletState(remote);
      }
    } finally {
      isLoadingCryptoWallet = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> provisionCryptoAddresses() async {
    if (!_isSupabaseReady || !isAuthenticated) {
      return {'success': false, 'message': 'Sign in required.'};
    }
    isLoadingCryptoWallet = true;
    notifyListeners();
    try {
      final res = await SupabaseService().provisionCryptoAddresses();
      if (res['success'] == true && res['wallet'] is CryptoWalletState) {
        _applyCryptoWalletState(res['wallet'] as CryptoWalletState);
      }
      return res;
    } finally {
      isLoadingCryptoWallet = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> requestCryptoWithdrawal({
    required String network,
    required String token,
    required String toAddress,
    required double amount,
    required String pin,
  }) async {
    final supa = SupabaseService();
    final key = supa.createTransferIdempotencyKey();
    final res = await supa.requestCryptoWithdrawal(
      network: network,
      token: token,
      toAddress: toAddress,
      amount: amount,
      pin: pin,
      idempotencyKey: key,
    );
    if (res['success'] == true) {
      await refreshCryptoWallet();
      await loadSupabaseData();
    }
    return res;
  }

  List<Transaction> get usdAccountTxList {
    return txList.where((tx) {
      final cur = tx.currency.toUpperCase();
      final cat = tx.category.toLowerCase();
      return cat == 'usd_account' ||
          cat == 'usd' ||
          cat == 'crypto_deposit' ||
          cat == 'crypto_withdrawal' ||
          cur == 'USDT' ||
          cur == 'USDC' ||
          cur == 'USD' ||
          tx.title.contains('USD') ||
          tx.title.contains('USDT') ||
          tx.title.contains('USDC') ||
          tx.titleMm.contains('USD');
    }).toList();
  }

  String get effectiveUsdWalletAddress {
    if (profile.usdAccountWalletAddress.trim().isNotEmpty) {
      return profile.usdAccountWalletAddress.trim();
    }
    final evm = cryptoWallet.primaryEvmAddress;
    if (evm != null && evm.isNotEmpty) return evm;
    return '0x7d785a6e4eaba2627e1f9a5b2c6953496b2c2837';
  }

  Map<String, dynamic> issueUsd(double amount) {
    if (amount <= 0) {
      return {
        'success': false,
        'message': 'Please enter an amount greater than 0.'
      };
    }
    if (wallet.balance < amount) {
      return {
        'success': false,
        'message':
            'Insufficient AKD balance (Available: ${wallet.balance.toStringAsFixed(2)} AKD)'
      };
    }
    wallet.balance -= amount;
    wallet.totalBalance = wallet.balance;
    profile.akdWalletBalance = wallet.balance;
    usdAccountBalance += amount;
    profile.usdAccountBalance = usdAccountBalance;
    cryptoWallet = cryptoWallet.copyWith(
      usdtBalance: cryptoWallet.usdtBalance + amount,
    );

    final nowStr = DateFormat('d MMM yy - HH:mm').format(DateTime.now());
    final tx = Transaction(
      id: 'tx_issue_${DateTime.now().millisecondsSinceEpoch}',
      refId: 'ISSUE-${DateTime.now().millisecondsSinceEpoch}',
      title: 'Issued USD',
      titleMm: 'USD ထုတ်ယူခြင်း',
      category: 'usd_account',
      currency: 'USD',
      time: nowStr,
      status: 'COMPLETED',
      counterparty: 'Arakan Reserve Vault',
      counterpartyMm: 'အာရက္ခ ရံပုံငွေဘဏ္ဍာတိုက်',
      hash: '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}',
      amount: amount,
      fee: 0.0,
    );
    txList.insert(0, tx);
    notifyListeners();
    return {'success': true, 'amount': amount};
  }

  Map<String, dynamic> withdrawUsd(double amount) {
    if (amount <= 0) {
      return {
        'success': false,
        'message': 'Please enter an amount greater than 0.'
      };
    }
    final totalUsd =
        usdAccountBalance + cryptoWallet.usdtBalance + cryptoWallet.usdcBalance;
    if (totalUsd < amount) {
      return {
        'success': false,
        'message':
            'Insufficient USD balance (Available: ${totalUsd.toStringAsFixed(2)} USD)'
      };
    }
    usdAccountBalance =
        (usdAccountBalance - amount).clamp(0.0, double.infinity);
    profile.usdAccountBalance = usdAccountBalance;
    if (cryptoWallet.usdtBalance >= amount) {
      cryptoWallet = cryptoWallet.copyWith(
        usdtBalance: cryptoWallet.usdtBalance - amount,
      );
    } else {
      final rem = amount - cryptoWallet.usdtBalance;
      cryptoWallet = cryptoWallet.copyWith(
        usdtBalance: 0.0,
        usdcBalance:
            (cryptoWallet.usdcBalance - rem).clamp(0.0, double.infinity),
      );
    }
    wallet.balance += amount;
    wallet.totalBalance = wallet.balance;
    profile.akdWalletBalance = wallet.balance;

    final nowStr = DateFormat('d MMM yy - HH:mm').format(DateTime.now());
    final tx = Transaction(
      id: 'tx_wd_${DateTime.now().millisecondsSinceEpoch}',
      refId: 'WD-${DateTime.now().millisecondsSinceEpoch}',
      title: 'Withdraw USD',
      titleMm: 'USD ငွေထုတ်ယူခြင်း',
      category: 'usd_account',
      currency: 'USD',
      time: nowStr,
      status: 'COMPLETED',
      counterparty: 'Péthar Central Pool',
      counterpartyMm: 'ဖေ့သာ ဗဟိုငွေစာရင်း',
      hash: '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}',
      amount: -amount,
      fee: 0.0,
    );
    txList.insert(0, tx);
    notifyListeners();
    return {'success': true, 'amount': amount};
  }

  Map<String, dynamic> sendWalletToken({
    required String token,
    required double amount,
    required String toAddress,
    required String network,
  }) {
    if (amount <= 0) {
      return {
        'success': false,
        'message': 'Please enter an amount greater than 0.'
      };
    }
    if (toAddress.trim().isEmpty) {
      return {
        'success': false,
        'message': 'Please enter recipient wallet address.'
      };
    }
    if (token == 'USDT' && cryptoWallet.usdtBalance < amount) {
      return {'success': false, 'message': 'Insufficient USDT balance.'};
    }
    if (token == 'USDC' && cryptoWallet.usdcBalance < amount) {
      return {'success': false, 'message': 'Insufficient USDC balance.'};
    }
    if (token == 'USD' && usdAccountBalance < amount) {
      return {'success': false, 'message': 'Insufficient USD balance.'};
    }
    if (token == 'USDT') {
      cryptoWallet = cryptoWallet.copyWith(
        usdtBalance:
            (cryptoWallet.usdtBalance - amount).clamp(0.0, double.infinity),
      );
    } else if (token == 'USDC') {
      cryptoWallet = cryptoWallet.copyWith(
        usdcBalance:
            (cryptoWallet.usdcBalance - amount).clamp(0.0, double.infinity),
      );
    } else if (token == 'USD') {
      usdAccountBalance -= amount;
      profile.usdAccountBalance = usdAccountBalance;
    }

    final nowStr = DateFormat('d MMM yy - HH:mm').format(DateTime.now());
    final cleanAddr = toAddress.trim();
    final shortAddr = cleanAddr.length > 10
        ? '${cleanAddr.substring(0, 6)}...${cleanAddr.substring(cleanAddr.length - 4)}'
        : cleanAddr;
    final tx = Transaction(
      id: 'tx_send_${DateTime.now().millisecondsSinceEpoch}',
      refId: 'TX-${DateTime.now().millisecondsSinceEpoch}',
      title: 'Sent $token to $shortAddr',
      titleMm: '$token $shortAddr သို့ လွှဲပို့သည်',
      category: 'usd_account',
      currency: token,
      time: nowStr,
      status: 'COMPLETED',
      counterparty: cleanAddr,
      counterpartyMm: cleanAddr,
      hash: '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}',
      amount: -amount,
      fee: 0.001,
    );
    txList.insert(0, tx);
    notifyListeners();
    return {'success': true, 'amount': amount};
  }

  Map<String, dynamic> swapWalletToken({
    required String fromToken,
    required String toToken,
    required double fromAmount,
    required double toAmount,
  }) {
    if (fromAmount <= 0) {
      return {
        'success': false,
        'message': 'Please enter an amount greater than 0.'
      };
    }
    if (fromToken == 'USDT' && cryptoWallet.usdtBalance < fromAmount) {
      return {'success': false, 'message': 'Insufficient USDT balance.'};
    }
    if (fromToken == 'USDC' && cryptoWallet.usdcBalance < fromAmount) {
      return {'success': false, 'message': 'Insufficient USDC balance.'};
    }
    if (fromToken == 'USD' && usdAccountBalance < fromAmount) {
      return {'success': false, 'message': 'Insufficient $fromToken balance.'};
    }

    double nextUsdt = cryptoWallet.usdtBalance;
    double nextUsdc = cryptoWallet.usdcBalance;
    if (fromToken == 'USDT') nextUsdt -= fromAmount;
    if (fromToken == 'USDC') nextUsdc -= fromAmount;
    if (fromToken == 'USD') {
      usdAccountBalance -= fromAmount;
      profile.usdAccountBalance = usdAccountBalance;
    }

    if (toToken == 'USDT') nextUsdt += toAmount;
    if (toToken == 'USDC') nextUsdc += toAmount;
    if (toToken == 'USD') {
      usdAccountBalance += toAmount;
      profile.usdAccountBalance = usdAccountBalance;
    }
    cryptoWallet = cryptoWallet.copyWith(
      usdtBalance: nextUsdt.clamp(0.0, double.infinity),
      usdcBalance: nextUsdc.clamp(0.0, double.infinity),
    );

    final nowStr = DateFormat('d MMM yy - HH:mm').format(DateTime.now());
    final txPaid = Transaction(
      id: 'tx_swap_paid_${DateTime.now().millisecondsSinceEpoch}',
      refId: 'SWAP-${DateTime.now().millisecondsSinceEpoch}',
      title: 'Paid $fromToken for Swap',
      titleMm: 'လဲလှယ်ရန် $fromToken ပေးချေသည်',
      category: 'usd_account',
      currency: fromToken,
      time: nowStr,
      status: 'COMPLETED',
      counterparty: 'Uniswap Liquidity Pool',
      counterpartyMm: 'Uniswap အရည်အသွေးကန်',
      hash: '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}',
      amount: -fromAmount,
      fee: 0.0,
    );
    final txRecv = Transaction(
      id: 'tx_swap_recv_${DateTime.now().millisecondsSinceEpoch + 1}',
      refId: 'SWAP-${DateTime.now().millisecondsSinceEpoch + 1}',
      title: 'Received $toToken',
      titleMm: '$toToken လက်ခံရရှိသည်',
      category: 'usd_account',
      currency: toToken,
      time: nowStr,
      status: 'COMPLETED',
      counterparty: 'Uniswap Liquidity Pool',
      counterpartyMm: 'Uniswap အရည်အသွေးကန်',
      hash:
          '0x${(DateTime.now().millisecondsSinceEpoch + 1).toRadixString(16)}',
      amount: toAmount,
      fee: 0.0,
    );
    txList.insert(0, txPaid);
    txList.insert(0, txRecv);
    notifyListeners();
    return {'success': true};
  }
}
