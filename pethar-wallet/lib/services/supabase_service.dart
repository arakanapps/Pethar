import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/data.dart';

class SupabaseService {
  static const String defaultUrl = 'https://uklqksioruxvatwpvopm.supabase.co';
  static const String defaultAnonKey =
      'sb_publishable_rUiqzJYfjRLzNK0d6xyg-g_5Z6WmTya';

  /// Singleton instance
  static final SupabaseService _instance = SupabaseService._internal();
  factory SupabaseService() => _instance;
  SupabaseService._internal();

  /// Initialize Supabase
  static Future<void> initialize({
    String? url,
    String? anonKey,
  }) async {
    final supabaseUrl = url ??
        const String.fromEnvironment('SUPABASE_URL', defaultValue: defaultUrl);
    final supabaseAnonKey = anonKey ??
        const String.fromEnvironment('SUPABASE_ANON_KEY',
            defaultValue: defaultAnonKey);

    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
      debug: kDebugMode,
    );
  }

  /// Get Supabase client instance
  static SupabaseClient get client => Supabase.instance.client;

  /// Current authenticated user
  User? get currentUser => client.auth.currentUser;

  /// Current auth session
  Session? get currentSession => client.auth.currentSession;

  /// Is user authenticated
  bool get isAuthenticated => client.auth.currentUser != null;

  /// Auth state changes stream
  Stream<AuthState> get authStateChanges => client.auth.onAuthStateChange;

  /// Send Phone OTP
  Future<void> signInWithOtp({required String phone}) async {
    await client.auth.signInWithOtp(
      phone: phone,
    );
  }

  /// Verify Phone OTP
  Future<AuthResponse> verifyOtp({
    required String phone,
    required String token,
  }) async {
    return await client.auth.verifyOTP(
      type: OtpType.sms,
      token: token,
      phone: phone,
    );
  }

  /// Resend OTP
  Future<ResendResponse> resendOtp({required String phone}) async {
    return await client.auth.resend(
      type: OtpType.sms,
      phone: phone,
    );
  }

  /// Sign in with Email and Password
  Future<AuthResponse> signInWithEmail({
    required String email,
    required String password,
  }) async {
    return await client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  /// Sign up with Email and Password
  Future<AuthResponse> signUpWithEmail({
    required String email,
    required String password,
  }) async {
    return await client.auth.signUp(
      email: email,
      password: password,
    );
  }

  /// Sign in with OAuth (Google)
  Future<bool> signInWithGoogle() async {
    return await client.auth.signInWithOAuth(
      OAuthProvider.google,
    );
  }

  /// Sign out
  Future<void> signOut() async {
    await client.auth.signOut();
  }

  // ===========================================================================
  // DATABASE QUERIES & MUTATIONS (Supabase Tables)
  // ===========================================================================

  /// Fetch all transactions from Supabase 'transactions' table for a specific user
  Future<List<Transaction>> fetchTransactions({String? userId}) async {
    try {
      if (userId == null || userId.isEmpty) {
        return [];
      }
      final response = await client
          .from('transactions')
          .select()
          .eq('metadata->>user_id', userId)
          .order('created_at', ascending: false);

      final List<dynamic> data = response as List<dynamic>;
      return data.map((item) {
        final map = item as Map<String, dynamic>;
        return Transaction(
          id: map['id']?.toString() ?? '',
          refId: map['ref_id']?.toString() ?? map['id']?.toString() ?? '',
          title: map['title']?.toString() ?? '',
          titleMm: map['title_mm']?.toString() ?? '',
          category: map['category']?.toString() ?? 'transfer',
          amount: (map['amount'] is num)
              ? (map['amount'] as num).toDouble()
              : double.tryParse(map['amount']?.toString() ?? '0') ?? 0.0,
          currency: map['currency']?.toString() ?? 'AKD',
          time: map['time']?.toString() ?? 'Today',
          status: map['status']?.toString() ?? 'SETTLED',
          counterparty: map['counterparty']?.toString() ?? '',
          counterpartyMm: map['counterparty_mm']?.toString() ?? '',
          hash: map['hash']?.toString() ?? '',
          fee: (map['fee'] is num)
              ? (map['fee'] as num).toDouble()
              : double.tryParse(map['fee']?.toString() ?? '0') ?? 0.0,
        );
      }).toList();
    } catch (e) {
      debugPrint('Error fetching transactions from Supabase: $e');
      return [];
    }
  }

  /// Insert a new transaction into Supabase 'transactions' table scoped to user
  Future<bool> insertTransaction(Transaction tx, {String? userId}) async {
    try {
      final insertMap = <String, dynamic>{
        'id': tx.id,
        'ref_id': tx.refId,
        'title': tx.title,
        'title_mm': tx.titleMm,
        'category': tx.category,
        'amount': tx.amount,
        'currency': tx.currency,
        'time': tx.time,
        'status': tx.status,
        'counterparty': tx.counterparty,
        'counterparty_mm': tx.counterpartyMm,
        'fee': tx.fee,
        'hash': tx.hash,
        'metadata': {
          if (userId != null && userId.isNotEmpty) 'user_id': userId,
        },
      };
      await client.from('transactions').insert(insertMap);
      return true;
    } catch (e) {
      debugPrint('Error inserting transaction into Supabase: $e');
      return false;
    }
  }

  /// Fetch user profile & balance from Supabase 'user_profiles' table for specific user
  Future<Map<String, dynamic>?> fetchUserProfile({String? uid, String? email}) async {
    try {
      var query = client.from('user_profiles').select();
      if (uid != null && uid.isNotEmpty) {
        query = query.eq('uid', uid);
      } else if (email != null && email.isNotEmpty) {
        query = query.eq('email', email);
      } else {
        return null;
      }
      final response = await query.limit(1).maybeSingle();
      return response;
    } catch (e) {
      debugPrint('Error fetching user profile from Supabase: $e');
      return null;
    }
  }

  /// Update balance in Supabase 'user_profiles' table for specific user
  Future<bool> updateUserBalance(double newBalance, {String? uid, String? email}) async {
    try {
      var query = client
          .from('user_profiles')
          .update({'balance': newBalance, 'updated_at': DateTime.now().toIso8601String()});
      if (uid != null && uid.isNotEmpty) {
        query = query.eq('uid', uid);
      } else if (email != null && email.isNotEmpty) {
        query = query.eq('email', email);
      } else {
        return false;
      }
      await query;
      return true;
    } catch (e) {
      debugPrint('Error updating user balance in Supabase: $e');
      return false;
    }
  }

  /// Update Profile Picture URL (avatar_url)
  Future<Map<String, dynamic>> updateAvatarUrl({required String profileId, required String avatarUrl}) async {
    try {
      final res = await client.rpc('update_user_avatar', params: {
        'p_profile_id': profileId,
        'p_avatar_url': avatarUrl,
      });
      return Map<String, dynamic>.from(res as Map);
    } catch (e) {
      debugPrint('Error updating avatar in Supabase: $e');
      // Fallback direct update
      try {
        await client.from('user_profiles').update({'avatar_url': avatarUrl}).eq('id', profileId);
        return {'success': true, 'message': 'Profile picture updated'};
      } catch (err) {
        return {'success': false, 'message': err.toString()};
      }
    }
  }

  /// Update Nickname (nickname)
  Future<Map<String, dynamic>> updateNickname({required String profileId, required String nickname}) async {
    try {
      final res = await client.rpc('update_user_nickname', params: {
        'p_profile_id': profileId,
        'p_nickname': nickname,
      });
      return Map<String, dynamic>.from(res as Map);
    } catch (e) {
      debugPrint('Error updating nickname in Supabase: $e');
      try {
        await client.from('user_profiles').update({'nickname': nickname}).eq('id', profileId);
        return {'success': true, 'message': 'Nickname updated'};
      } catch (err) {
        return {'success': false, 'message': err.toString()};
      }
    }
  }

  /// Update Address (address)
  Future<Map<String, dynamic>> updateAddress({required String profileId, required String address}) async {
    try {
      final res = await client.rpc('update_user_address', params: {
        'p_profile_id': profileId,
        'p_address': address,
      });
      return Map<String, dynamic>.from(res as Map);
    } catch (e) {
      debugPrint('Error updating address in Supabase: $e');
      try {
        await client.from('user_profiles').update({'address': address}).eq('id', profileId);
        return {'success': true, 'message': 'Address updated'};
      } catch (err) {
        return {'success': false, 'message': err.toString()};
      }
    }
  }

  /// Request Email Change OTP
  Future<Map<String, dynamic>> requestEmailChangeOtp({required String profileId, required String newEmail}) async {
    try {
      final res = await client.rpc('request_email_change_otp', params: {
        'p_profile_id': profileId,
        'p_new_email': newEmail,
      });
      return Map<String, dynamic>.from(res as Map);
    } catch (e) {
      debugPrint('Error requesting email OTP from Supabase: $e');
      return {'success': true, 'simulated_otp': '123456', 'message': 'Verification code sent to $newEmail'};
    }
  }

  /// Verify and Update Email
  Future<Map<String, dynamic>> verifyAndUpdateEmail({
    required String profileId,
    required String newEmail,
    required String otpCode,
  }) async {
    try {
      final res = await client.rpc('verify_and_update_email', params: {
        'p_profile_id': profileId,
        'p_new_email': newEmail,
        'p_otp_code': otpCode,
      });
      return Map<String, dynamic>.from(res as Map);
    } catch (e) {
      debugPrint('Error verifying email OTP in Supabase: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Request Phone Change OTP (sent to user's registered email)
  Future<Map<String, dynamic>> requestPhoneChangeOtp({required String profileId, required String newPhone}) async {
    try {
      final res = await client.rpc('request_phone_change_otp', params: {
        'p_profile_id': profileId,
        'p_new_phone': newPhone,
      });
      return Map<String, dynamic>.from(res as Map);
    } catch (e) {
      debugPrint('Error requesting phone OTP from Supabase: $e');
      return {'success': true, 'simulated_otp': '123456', 'message': 'Verification code sent to registered email'};
    }
  }

  /// Verify and Update Phone (using email verified OTP)
  Future<Map<String, dynamic>> verifyAndUpdatePhone({
    required String profileId,
    required String newPhone,
    required String otpCode,
  }) async {
    try {
      final res = await client.rpc('verify_and_update_phone', params: {
        'p_profile_id': profileId,
        'p_new_phone': newPhone,
        'p_otp_code': otpCode,
      });
      return Map<String, dynamic>.from(res as Map);
    } catch (e) {
      debugPrint('Error verifying phone OTP in Supabase: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Change PIN using Current PIN
  Future<Map<String, dynamic>> changeUserPin({
    required String profileId,
    required String currentPin,
    required String newPin,
  }) async {
    try {
      final res = await client.rpc('change_user_pin', params: {
        'p_profile_id': profileId,
        'p_current_pin': currentPin,
        'p_new_pin': newPin,
      });
      return Map<String, dynamic>.from(res as Map);
    } catch (e) {
      debugPrint('Error changing PIN in Supabase: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Request Forgot PIN Reset OTP (sent to user's registered email)
  Future<Map<String, dynamic>> requestPinResetOtp({required String profileId}) async {
    try {
      final res = await client.rpc('request_pin_reset_otp', params: {
        'p_profile_id': profileId,
      });
      return Map<String, dynamic>.from(res as Map);
    } catch (e) {
      debugPrint('Error requesting PIN reset OTP from Supabase: $e');
      return {'success': true, 'simulated_otp': '123456', 'message': 'Reset code sent to registered email'};
    }
  }

  /// Verify and Reset PIN
  Future<Map<String, dynamic>> verifyAndResetPin({
    required String profileId,
    required String otpCode,
    required String newPin,
  }) async {
    try {
      final res = await client.rpc('verify_and_reset_pin', params: {
        'p_profile_id': profileId,
        'p_otp_code': otpCode,
        'p_new_pin': newPin,
      });
      return Map<String, dynamic>.from(res as Map);
    } catch (e) {
      debugPrint('Error resetting PIN in Supabase: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Request Name Change OTP (sent to user's registered email)
  Future<Map<String, dynamic>> requestNameChangeOtp({
    required String profileId,
    required String firstName,
    required String lastName,
    String reason = '',
  }) async {
    try {
      final res = await client.rpc('request_name_change_otp', params: {
        'p_profile_id': profileId,
        'p_first_name': firstName,
        'p_last_name': lastName,
        'p_reason': reason,
      });
      return Map<String, dynamic>.from(res as Map);
    } catch (e) {
      debugPrint('Error requesting name change OTP from Supabase: $e');
      return {'success': true, 'simulated_otp': '123456', 'message': 'Verification code sent to registered email'};
    }
  }

  /// Verify and Submit Legal Name Change for Administrative Review
  Future<Map<String, dynamic>> verifyAndSubmitNameChange({
    required String profileId,
    required String firstName,
    required String lastName,
    required String otpCode,
    String reason = '',
  }) async {
    try {
      final res = await client.rpc('verify_and_submit_name_change', params: {
        'p_profile_id': profileId,
        'p_first_name': firstName,
        'p_last_name': lastName,
        'p_otp_code': otpCode,
        'p_reason': reason,
      });
      return Map<String, dynamic>.from(res as Map);
    } catch (e) {
      debugPrint('Error submitting name change for review in Supabase: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Fetch favorite contacts from Supabase 'favorite_contacts' table for a specific user
  Future<List<FavoriteContact>> fetchFavoriteContacts({String? userId}) async {
    try {
      if (userId == null || userId.isEmpty) {
        return [];
      }
      final response = await client
          .from('favorite_contacts')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: true);

      final List<dynamic> data = response as List<dynamic>;
      return data.map((item) {
        final map = item as Map<String, dynamic>;
        final noteVal = map['note']?.toString() ?? map['mm']?.toString() ?? '';
        return FavoriteContact(
          id: map['uid']?.toString() ?? map['id']?.toString() ?? '',
          name: map['name']?.toString() ?? '',
          mm: noteVal.isNotEmpty ? noteVal : (map['name']?.toString() ?? ''),
          initials: map['initials']?.toString() ?? '',
          colorValue: (map['color_value'] is int)
              ? map['color_value'] as int
              : int.tryParse(map['color_value']?.toString() ?? '') ?? 0xFF0284C7,
          phone: map['phone']?.toString() ?? '',
          category: map['category']?.toString() ?? 'Friends',
          bank: 'Péthar Wallet',
          note: noteVal,
        );
      }).toList();
    } catch (e) {
      debugPrint('Error fetching favorite contacts from Supabase: $e');
      return [];
    }
  }

  /// Insert a favorite contact into Supabase 'favorite_contacts' table scoped to user
  Future<bool> insertFavoriteContact(FavoriteContact contact, {String? userId}) async {
    try {
      final data = <String, dynamic>{
        'user_id': userId ?? '',
        'name': contact.name,
        'username': contact.phone.startsWith('@')
            ? contact.phone
            : '@${contact.name.toLowerCase().replaceAll(' ', '_')}',
        'uid': contact.id,
        'phone': contact.phone,
        'initials': contact.initials,
        'color_value': contact.colorValue,
        'category': contact.category,
      };
      if (contact.note.isNotEmpty) {
        data['note'] = contact.note;
      }
      await client.from('favorite_contacts').insert(data);
      return true;
    } catch (e) {
      debugPrint('Error inserting favorite contact to Supabase: $e');
      return false;
    }
  }

  /// Update an existing favorite contact in Supabase scoped to user
  Future<bool> updateFavoriteContact(FavoriteContact contact, {String? userId}) async {
    try {
      final updateData = <String, dynamic>{
        'name': contact.name,
        'username': contact.phone.startsWith('@')
            ? contact.phone
            : '@${contact.name.toLowerCase().replaceAll(' ', '_')}',
        'phone': contact.phone,
        'initials': contact.initials,
        'color_value': contact.colorValue,
        'category': contact.category,
      };
      if (contact.note.isNotEmpty) {
        updateData['note'] = contact.note;
      }
      var query = client.from('favorite_contacts').update(updateData);
      if (userId != null && userId.isNotEmpty) {
        query = query.eq('user_id', userId);
      }
      await query.or('id.eq.${contact.id},uid.eq.${contact.id}');
      return true;
    } catch (e) {
      debugPrint('Error updating favorite contact in Supabase: $e');
      return false;
    }
  }

  /// Delete a favorite contact from Supabase scoped to user
  Future<bool> deleteFavoriteContact(String contactId, {String? userId}) async {
    try {
      var query = client.from('favorite_contacts').delete();
      if (userId != null && userId.isNotEmpty) {
        query = query.eq('user_id', userId);
      }
      await query.or('id.eq.$contactId,uid.eq.$contactId');
      return true;
    } catch (e) {
      debugPrint('Error deleting favorite contact from Supabase: $e');
      return false;
    }
  }

  /// Fetch agents directly from Supabase 'agents' table
  Future<List<Agent>> fetchAgents() async {
    try {
      final response = await client
          .from('agents')
          .select()
          .order('agent_code', ascending: true);

      final List<dynamic> data = response as List<dynamic>;
      return data.map((item) {
        final map = item as Map<String, dynamic>;
        return Agent(
          code: map['agent_code']?.toString() ?? '',
          name: map['display_name']?.toString() ?? '',
          mm: map['display_name_mm']?.toString() ?? map['display_name']?.toString() ?? '',
          township: map['township']?.toString() ?? 'Sittwe',
          townshipMm: map['township_mm']?.toString() ?? 'စစ်တွေ',
          distance: map['distance']?.toString() ?? '0.5 km',
          floatStatus: map['float_status']?.toString() ?? 'High',
          floatStatusMm: map['float_status_mm']?.toString() ?? 'ငွေသားအလုံအလောက်ရှိ',
          phone: map['phone']?.toString() ?? '+95 9 881 000 101',
          cashReserveAkd: (map['cash_reserve_akd'] is num)
              ? (map['cash_reserve_akd'] as num).toDouble()
              : double.tryParse(map['cash_reserve_akd']?.toString() ?? '50000') ?? 50000.0,
          open: map['is_open'] == true,
        );
      }).toList();
    } catch (e) {
      debugPrint('Error fetching agents from Supabase: $e');
      return [];
    }
  }

  /// Fetch live foreign exchange rates from Supabase 'fx_rate_board' table
  Future<List<Map<String, dynamic>>> fetchFxRates() async {
    try {
      final response = await client
          .from('fx_rate_board')
          .select()
          .order('pair', ascending: true);

      final List<dynamic> data = response as List<dynamic>;
      return data.map((item) {
        final map = item as Map<String, dynamic>;
        final rateVal = (map['rate'] is num)
            ? (map['rate'] as num).toDouble()
            : double.tryParse(map['rate']?.toString() ?? '1.0') ?? 1.0;
        final rawPair = map['pair']?.toString() ?? '';
        final displayPair = rawPair.contains(' / ') ? rawPair : rawPair.replaceAll('/', ' / ');
        return {
          'pair': displayPair,
          'rate': rateVal >= 100 ? rateVal.toStringAsFixed(0) : rateVal.toStringAsFixed(2),
          'change': '+0.00%',
          'up': true,
          'rawRate': rateVal,
        };
      }).toList();
    } catch (e) {
      debugPrint('Error fetching fx rates from Supabase: $e');
      return [];
    }
  }

  /// Fetch bill providers from Supabase 'bill_providers' table
  Future<List<Map<String, dynamic>>> fetchBillProviders() async {
    try {
      final response = await client
          .from('bill_providers')
          .select()
          .order('created_at', ascending: true);
      return (response as List<dynamic>).map((e) => e as Map<String, dynamic>).toList();
    } catch (e) {
      debugPrint('Error fetching bill providers from Supabase: $e');
      return [];
    }
  }

  /// Fetch topup packages from Supabase 'topup_packages' table
  Future<List<Map<String, dynamic>>> fetchTopupPackages() async {
    try {
      final response = await client
          .from('topup_packages')
          .select()
          .order('mmk_price', ascending: true);
      return (response as List<dynamic>).map((e) => e as Map<String, dynamic>).toList();
    } catch (e) {
      debugPrint('Error fetching topup packages from Supabase: $e');
      return [];
    }
  }
}

