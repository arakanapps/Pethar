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

  /// Fetch all transactions from Supabase 'transactions' table
  Future<List<Transaction>> fetchTransactions() async {
    try {
      final response = await client
          .from('transactions')
          .select()
          .order('created_at', ascending: false);

      final List<dynamic> data = response as List<dynamic>;
      return data.map((item) {
        final map = item as Map<String, dynamic>;
        return Transaction(
          id: map['id']?.toString() ?? '',
          refId: map['ref_id']?.toString() ?? map['id']?.toString() ?? '',
          title: map['title']?.toString() ?? '',
          titleMm: map['title_mm']?.toString() ?? '',
          category: map['category']?.toString() ?? 'p2p',
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

  /// Insert a new transaction into Supabase 'transactions' table
  Future<bool> insertTransaction(Transaction tx) async {
    try {
      await client.from('transactions').insert({
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
      });
      return true;
    } catch (e) {
      debugPrint('Error inserting transaction into Supabase: $e');
      return false;
    }
  }

  /// Fetch user profile & balance from Supabase 'user_profiles' table
  Future<Map<String, dynamic>?> fetchUserProfile() async {
    try {
      final response = await client
          .from('user_profiles')
          .select()
          .limit(1)
          .maybeSingle();
      return response;
    } catch (e) {
      debugPrint('Error fetching user profile from Supabase: $e');
      return null;
    }
  }

  /// Update balance in Supabase 'user_profiles' table
  Future<bool> updateUserBalance(double newBalance) async {
    try {
      await client
          .from('user_profiles')
          .update({'balance': newBalance, 'updated_at': DateTime.now().toIso8601String()})
          .neq('id', '');
      return true;
    } catch (e) {
      debugPrint('Error updating user balance in Supabase: $e');
      return false;
    }
  }

  /// Fetch favorite contacts from Supabase 'favorite_contacts' table
  Future<List<FavoriteContact>> fetchFavoriteContacts() async {
    try {
      final response = await client
          .from('favorite_contacts')
          .select()
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

  /// Insert a favorite contact into Supabase 'favorite_contacts' table
  Future<bool> insertFavoriteContact(FavoriteContact contact) async {
    try {
      final data = <String, dynamic>{
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

  /// Update an existing favorite contact in Supabase
  Future<bool> updateFavoriteContact(FavoriteContact contact) async {
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
      await client
          .from('favorite_contacts')
          .update(updateData)
          .or('id.eq.${contact.id},uid.eq.${contact.id}');
      return true;
    } catch (e) {
      debugPrint('Error updating favorite contact in Supabase: $e');
      return false;
    }
  }

  /// Delete a favorite contact from Supabase
  Future<bool> deleteFavoriteContact(String contactId) async {
    try {
      await client
          .from('favorite_contacts')
          .delete()
          .or('id.eq.$contactId,uid.eq.$contactId');
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

