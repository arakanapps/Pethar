import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'supabase_service.dart';

/// Stored user identity record for email + 6-digit PIN auth and KYC
class StoredUser {
  final String email;
  String pin;
  String name;
  String username;
  String uid;
  int kycTier; // 1: Email Verified, 2: National ID Verified
  String kycStatus; // 'VERIFIED_LVL1', 'PENDING_REVIEW', 'VERIFIED_LVL2'
  String nationalIdNo;
  String dob;
  String address;
  String gender;
  String idType;

  StoredUser({
    required this.email,
    required this.pin,
    required this.name,
    required this.username,
    required this.uid,
    this.kycTier = 1,
    this.kycStatus = 'VERIFIED_LVL1',
    this.nationalIdNo = '',
    this.dob = '',
    this.address = '',
    this.gender = 'Male',
    this.idType = 'National ID',
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'pin': pin,
        'name': name,
        'username': username,
        'uid': uid,
        'kycTier': kycTier,
        'kycStatus': kycStatus,
        'nationalIdNo': nationalIdNo,
        'dob': dob,
        'address': address,
        'gender': gender,
        'idType': idType,
      };

  factory StoredUser.fromJson(Map<String, dynamic> map) => StoredUser(
        email: map['email']?.toString() ?? '',
        pin: map['pin']?.toString() ?? '',
        name: map['name']?.toString() ?? '',
        username: map['username']?.toString() ?? '',
        uid: map['uid']?.toString() ?? '',
        kycTier: (map['kycTier'] as num?)?.toInt() ?? 1,
        kycStatus: map['kycStatus']?.toString() ?? 'VERIFIED_LVL1',
        nationalIdNo: map['nationalIdNo']?.toString() ?? '',
        dob: map['dob']?.toString() ?? '',
        address: map['address']?.toString() ?? '',
        gender: map['gender']?.toString() ?? 'Male',
        idType: map['idType']?.toString() ?? 'National ID',
      );
}

/// OTP verification challenge with strictly 10 minutes expiry time
class OtpChallenge {
  final String email;
  final String code;
  final DateTime expiresAt;
  final String purpose; // 'PIN_RESET' | 'SIGN_UP'

  OtpChallenge({
    required this.email,
    required this.code,
    required this.expiresAt,
    required this.purpose,
  });

  bool get isExpired => DateTime.now().isAfter(expiresAt);

  int get secondsRemaining {
    final diff = expiresAt.difference(DateTime.now()).inSeconds;
    return diff > 0 ? diff : 0;
  }
}

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  static const String _usersPrefKey = 'pethar_stored_registered_users_v2';
  static const String _activeUserKey = 'pethar_active_user_email_v2';

  final Map<String, StoredUser> _users = {};
  OtpChallenge? _activePinResetOtp;
  OtpChallenge? _activeSignUpOtp;
  Map<String, dynamic>? _pendingSignUpData;
  bool _initialized = false;

  /// Initialize and load saved users
  Future<void> initialize() async {
    if (_initialized) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final usersRaw = prefs.getString(_usersPrefKey);
      if (usersRaw != null && usersRaw.isNotEmpty) {
        final Map<String, dynamic> decoded = jsonDecode(usersRaw);
        decoded.forEach((key, val) {
          if (val is Map<String, dynamic>) {
            _users[key.toLowerCase()] = StoredUser.fromJson(val);
          }
        });
      }
    } catch (e) {
      debugPrint('AuthService storage init notice: $e');
    }
    _initialized = true;
  }

  Future<void> _saveUsers() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final Map<String, dynamic> raw = {};
      _users.forEach((key, user) {
        raw[key] = user.toJson();
      });
      await prefs.setString(_usersPrefKey, jsonEncode(raw));
    } catch (e) {
      debugPrint('AuthService save error: $e');
    }
  }

  /// Dispatches OTP verification email via Gmail SMTP relay
  Future<void> _dispatchOtpEmail({
    required String email,
    required String code,
    required String purpose,
  }) async {
    final hosts = ['10.0.2.2', '127.0.0.1', 'localhost'];
    for (final host in hosts) {
      try {
        final uri = Uri.parse('http://$host:3001/api/send-otp');
        final response = await http
            .post(
              uri,
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode({
                'email': email,
                'code': code,
                'purpose': purpose,
              }),
            )
            .timeout(const Duration(seconds: 4));
        if (response.statusCode == 200) {
          debugPrint('✅ [AuthService] OTP email dispatched via $uri to $email');
          return;
        }
      } catch (_) {}
    }
  }

  /// Dispatches profile sync to MongoDB API relay
  Future<void> _dispatchProfileToMongo({
    required String email,
    required String uid,
    required String name,
    required String username,
  }) async {
    final hosts = ['10.0.2.2', '127.0.0.1', 'localhost'];
    for (final host in hosts) {
      try {
        final uri = Uri.parse('http://$host:3001/api/profile');
        final response = await http
            .post(
              uri,
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode({
                'email': email,
                'action': 'save',
                'profile': {
                  'id': 'user_$uid',
                  'email': email,
                  'name': name,
                  'username': username,
                  'uid': uid,
                  'kyc_tier': 1,
                  'balance': 0.00,
                  'currency': 'AKD',
                },
              }),
            )
            .timeout(const Duration(seconds: 4));
        if (response.statusCode == 200) {
          debugPrint('✅ [AuthService] Profile synced to MongoDB via $uri');
          return;
        }
      } catch (_) {}
    }
  }

  /// Get active user email if remembered
  Future<String?> getSavedActiveUserEmail() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_activeUserKey);
    } catch (_) {
      return null;
    }
  }

  Future<void> setActiveUserEmail(String? email) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (email != null && email.isNotEmpty) {
        await prefs.setString(_activeUserKey, email);
      } else {
        await prefs.remove(_activeUserKey);
      }
    } catch (_) {}
  }

  /// 1. Log In with Email and 6-digit PIN code
  Future<Map<String, dynamic>> loginWithEmailAndPin({
    required String email,
    required String pin,
  }) async {
    await initialize();
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

    // Check stored registered users
    StoredUser? user = _users[cleanEmail];

    if (user != null && user.pin != cleanPin) {
      return {
        'success': false,
        'error': 'Wrong email or PIN code',
        'isPinOrEmailWrong': true,
      };
    }

    // The PIN unlocks the app locally, but database access requires a live
    // Supabase session (auth.uid()). If the refresh token has expired we send
    // a one-time code instead of failing silently.
    if (SupabaseService().authUserId == null) {
      try {
        await SupabaseService().sendEmailOtp(cleanEmail);
      } catch (e) {
        debugPrint('Supabase login OTP dispatch failed: $e');
        return {
          'success': false,
          'error': 'Could not start a secure session. Check your connection and try again.',
          'isPinOrEmailWrong': false,
        };
      }
      return {
        'success': true,
        'requiresOtp': true,
        'user': user,
        'message': 'Enter the verification code sent to $cleanEmail',
      };
    }

    // Fresh install or new device: no local record yet. Verify the PIN against
    // the server hash and rebuild the local identity from the profile row.
    if (user == null) {
      final pinResult = await SupabaseService().verifyUserPin(cleanPin);
      if (pinResult['valid'] != true) {
        return {
          'success': false,
          'error': pinResult['message']?.toString() ?? 'Wrong PIN code',
          'isPinOrEmailWrong': true,
        };
      }

      final profileMap = await SupabaseService().fetchMyProfile();
      if (profileMap == null) {
        return {
          'success': false,
          'error': 'No wallet profile found for this account',
          'isPinOrEmailWrong': false,
        };
      }

      user = StoredUser(
        email: cleanEmail,
        pin: cleanPin,
        name: profileMap['name']?.toString() ?? cleanEmail.split('@').first,
        username: profileMap['username']?.toString() ?? '@${cleanEmail.split('@').first}',
        uid: profileMap['uid']?.toString() ?? '',
        kycTier: (profileMap['kyc_tier'] is num)
            ? (profileMap['kyc_tier'] as num).toInt()
            : 1,
        kycStatus: (profileMap['kyc_tier'] is num) && (profileMap['kyc_tier'] as num).toInt() >= 2
            ? 'VERIFIED_LVL2'
            : 'VERIFIED_LVL1',
      );
      _users[cleanEmail] = user;
      await _saveUsers();
    }

    await setActiveUserEmail(cleanEmail);
    return {
      'success': true,
      'user': user,
    };
  }

  /// 2. Request Forgot Password / PIN Reset OTP (10 minute expiry)
  Future<Map<String, dynamic>> requestPinResetOtp({required String email}) async {
    await initialize();
    final cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.isEmpty || !cleanEmail.contains('@')) {
      return {
        'success': false,
        'error': 'Please enter a valid email address',
      };
    }

    try {
      await SupabaseService().sendEmailOtp(cleanEmail);
    } catch (e) {
      debugPrint('Supabase PIN reset OTP failed: $e');
      return {
        'success': false,
        'error': 'Could not send the verification code. Check your connection and try again.',
      };
    }

    final expiresAt = DateTime.now().add(const Duration(minutes: 10));

    _activePinResetOtp = OtpChallenge(
      email: cleanEmail,
      code: '',
      expiresAt: expiresAt,
      purpose: 'PIN_RESET',
    );

    return {
      'success': true,
      'expiresAt': expiresAt,
      'message': '6-digit verification code sent to $cleanEmail (expires in 10 minutes)',
    };
  }

  OtpChallenge? get activePinResetChallenge => _activePinResetOtp;

  /// 3. Verify PIN Reset OTP
  Future<Map<String, dynamic>> verifyPinResetOtp({
    required String email,
    required String otp,
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    final cleanOtp = otp.trim();

    if (_activePinResetOtp == null || _activePinResetOtp!.email != cleanEmail) {
      return {
        'success': false,
        'expired': false,
        'error': 'No active reset request found for this email. Please request a new code.',
      };
    }

    if (_activePinResetOtp!.isExpired) {
      return {
        'success': false,
        'expired': true,
        'error': 'Verification code has expired. Please tap Resend Email to get a new code.',
      };
    }

    try {
      final verified = await SupabaseService().verifyEmailOtp(cleanEmail, cleanOtp);
      if (!verified) {
        return {
          'success': false,
          'expired': false,
          'error': 'Incorrect or expired verification code.',
        };
      }
    } catch (e) {
      debugPrint('Supabase PIN reset verification failed: $e');
      return {
        'success': false,
        'expired': false,
        'error': 'Incorrect or expired verification code.',
      };
    }

    return {'success': true};
  }

  /// 4. Confirm New 6-digit PIN and save
  Future<Map<String, dynamic>> confirmPinReset({
    required String email,
    required String newPin,
    required String confirmPin,
  }) async {
    await initialize();
    final cleanEmail = email.trim().toLowerCase();
    final p1 = newPin.trim();
    final p2 = confirmPin.trim();

    if (p1.length != 6 || !RegExp(r'^\d{6}$').hasMatch(p1)) {
      return {'success': false, 'error': 'New PIN must be exactly 6 numeric digits.'};
    }
    if (p1 != p2) {
      return {'success': false, 'error': 'PIN confirmation does not match.'};
    }

    var user = _users[cleanEmail];
    if (user != null) {
      user.pin = p1;
    } else {
      // The email was verified by Supabase, so the profile may exist remotely
      // even if this device has no local record.
      final profileMap = await SupabaseService().fetchMyProfile();
      if (profileMap == null) {
        return {
          'success': false,
          'error': 'No wallet profile found for this email.',
        };
      }
      user = StoredUser(
        email: cleanEmail,
        pin: p1,
        name: profileMap['name']?.toString() ?? cleanEmail.split('@').first,
        username: profileMap['username']?.toString() ?? '@${cleanEmail.split('@').first}',
        uid: profileMap['uid']?.toString() ?? '',
        kycTier: (profileMap['kyc_tier'] is num)
            ? (profileMap['kyc_tier'] as num).toInt()
            : 1,
        kycStatus: 'VERIFIED_LVL1',
      );
      _users[cleanEmail] = user;
    }

    // Persist the new bcrypt hash server-side.
    try {
      final result = await SupabaseService.client.rpc(
        'reset_user_pin',
        params: {'p_new_pin': p1},
      );
      if (result is Map && result['success'] == false) {
        return {
          'success': false,
          'error': result['message']?.toString() ?? 'Could not reset PIN.',
        };
      }
    } catch (e) {
      debugPrint('Error resetting PIN on the server: $e');
      return {
        'success': false,
        'error': 'Could not reset PIN. Please try again.',
      };
    }

    await _saveUsers();
    _activePinResetOtp = null;

    return {
      'success': true,
      'message': 'PIN successfully reset. Please log in with your new PIN.',
    };
  }

  /// 5. Sign Up Step 1: Initialize credentials and send 10-minute Email OTP
  Future<Map<String, dynamic>> initiateSignUp({
    required String email,
    required String pin,
    required String confirmPin,
  }) async {
    await initialize();
    final cleanEmail = email.trim().toLowerCase();
    final p1 = pin.trim();
    final p2 = confirmPin.trim();

    if (cleanEmail.isEmpty || !cleanEmail.contains('@')) {
      return {'success': false, 'error': 'Please enter a valid email address.'};
    }
    if (p1.length != 6 || !RegExp(r'^\d{6}$').hasMatch(p1)) {
      return {'success': false, 'error': 'PIN must be exactly 6 numeric digits.'};
    }
    if (p1 != p2) {
      return {'success': false, 'error': 'PIN and confirmation PIN do not match.'};
    }

    try {
      await SupabaseService().sendEmailOtp(cleanEmail);
    } catch (e) {
      debugPrint('Supabase OTP dispatch failed: $e');
      return {
        'success': false,
        'error': 'Could not send the verification code. Check your connection and try again.',
      };
    }

    final expiresAt = DateTime.now().add(const Duration(minutes: 10));

    _activeSignUpOtp = OtpChallenge(
      email: cleanEmail,
      code: '',
      expiresAt: expiresAt,
      purpose: 'SIGN_UP',
    );

    _pendingSignUpData = {
      'email': cleanEmail,
      'pin': p1,
    };

    return {
      'success': true,
      'expiresAt': expiresAt,
      'message': 'Verification code sent to $cleanEmail (expires in 10 minutes)',
    };
  }

  OtpChallenge? get activeSignUpChallenge => _activeSignUpOtp;

  /// 6. Sign Up Step 2: Verify Email OTP
  Future<Map<String, dynamic>> verifySignUpOtp({
    required String email,
    required String otp,
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    final cleanOtp = otp.trim();

    if (_activeSignUpOtp == null || _activeSignUpOtp!.email != cleanEmail) {
      return {
        'success': false,
        'expired': false,
        'error': 'No active verification found. Please restart sign up.',
      };
    }

    if (_activeSignUpOtp!.isExpired) {
      return {
        'success': false,
        'expired': true,
        'error': 'Verification code has expired. Please tap Resend Email to get a new code.',
      };
    }

    if (cleanOtp.length != 6) {
      return {
        'success': false,
        'expired': false,
        'error': 'Enter the 6-digit verification code.',
      };
    }

    try {
      final verified = await SupabaseService().verifyEmailOtp(cleanEmail, cleanOtp);
      if (!verified) {
        return {
          'success': false,
          'expired': false,
          'error': 'Incorrect or expired verification code.',
        };
      }
    } catch (e) {
      debugPrint('Supabase OTP verification failed: $e');
      return {
        'success': false,
        'expired': false,
        'error': 'Incorrect or expired verification code.',
      };
    }

    return {'success': true};
  }

  /// 7. Sign Up Step 3: Complete Identity (Name & Username) -> Issues UID & KYC Level 1
  Future<Map<String, dynamic>> completeSignUp({
    required String email,
    required String name,
    required String username,
  }) async {
    await initialize();
    final cleanEmail = email.trim().toLowerCase();
    final cleanName = name.trim();
    var cleanUsername = username.trim();

    if (cleanName.isEmpty) {
      return {'success': false, 'error': 'Please enter your full name.'};
    }
    if (cleanUsername.isEmpty) {
      return {'success': false, 'error': 'Please enter a username.'};
    }
    if (!cleanUsername.startsWith('@')) {
      cleanUsername = '@$cleanUsername';
    }

    final pendingPin = _pendingSignUpData?['pin']?.toString() ?? '';
    if (pendingPin.length != 6) {
      return {'success': false, 'error': 'Security PIN is required to complete registration.'};
    }

    final nameParts = cleanName.split(RegExp(r'\s+'));
    final firstName = nameParts.first;
    final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';

    final profileMap = await SupabaseService().ensureUserProfile(
      email: cleanEmail,
      firstName: firstName,
      lastName: lastName,
      username: cleanUsername.replaceAll('@', ''),
      pin: pendingPin,
    );

    if (profileMap == null) {
      return {
        'success': false,
        'error': 'Could not create your wallet profile. Please check your connection and try again.',
      };
    }

    final uid = profileMap['uid']?.toString() ?? '';

    final newUser = StoredUser(
      email: cleanEmail,
      pin: pendingPin,
      name: cleanName,
      username: cleanUsername,
      uid: uid,
      kycTier: 1, // Level 1: Email Verified
      kycStatus: 'VERIFIED_LVL1',
    );

    _users[cleanEmail] = newUser;
    await _saveUsers();
    await setActiveUserEmail(cleanEmail);

    _activeSignUpOtp = null;
    _pendingSignUpData = null;

    return {
      'success': true,
      'user': newUser,
      'message': 'Account created successfully! Welcome to Péthar.',
    };
  }

  /// 8. Submit KYC Level 2 (National ID Verification) -> Status: PENDING_REVIEW
  Future<Map<String, dynamic>> submitKycLevel2({
    required String email,
    required String nationalIdNo,
    required String dob,
    required String fullName,
    required String address,
  }) async {
    await initialize();
    final cleanEmail = email.trim().toLowerCase();
    final user = _users[cleanEmail];
    if (user == null) {
      return {'success': false, 'error': 'User record not found.'};
    }

    user.nationalIdNo = nationalIdNo.trim();
    user.dob = dob.trim();
    user.name = fullName.trim();
    user.address = address.trim();
    user.kycStatus = 'PENDING_REVIEW';
    // User remains at Level 1 until reviewed and approved

    await _saveUsers();

    // Persist the KYC submission and open an administrator review.
    final remote = await SupabaseService().submitKycLevel2(
      nationalId: nationalIdNo.trim(),
      dob: dob.trim(),
      fullName: fullName.trim(),
      address: address.trim(),
    );

    if (remote['success'] != true) {
      return {
        'success': false,
        'error': remote['message']?.toString() ?? 'Could not submit KYC. Please try again.',
      };
    }

    return {
      'success': true,
      'user': user,
      'message': 'National ID submitted successfully. Your account is pending administrative review for KYC Level 2.',
    };
  }

  /// 9. Administrative / Test Approval to KYC Level 2
  Future<Map<String, dynamic>> approveKycLevel2({required String email}) async {
    await initialize();
    final cleanEmail = email.trim().toLowerCase();
    final user = _users[cleanEmail];
    if (user == null) {
      return {'success': false, 'error': 'User record not found.'};
    }

    user.kycTier = 2; // Upgraded to Level 2
    user.kycStatus = 'VERIFIED_LVL2';
    await _saveUsers();

    return {
      'success': true,
      'user': user,
      'message': 'Account successfully upgraded to KYC Level 2 (National ID Verified).',
    };
  }

  /// Get user by email
  StoredUser? getUser(String email) => _users[email.trim().toLowerCase()];
}
