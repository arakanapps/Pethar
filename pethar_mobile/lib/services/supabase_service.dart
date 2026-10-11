import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

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

  /// Sign out
  Future<void> signOut() async {
    await client.auth.signOut();
  }
}
