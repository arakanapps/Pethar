import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Archived Telecom Recharge and Utility Billing APIs
/// Extracted from active online-only dual-wallet core.
class TelecomBillingService {
  final SupabaseClient client;

  TelecomBillingService(this.client);

  /// Fetch bill providers from Supabase 'bill_providers' table
  Future<List<Map<String, dynamic>>> fetchBillProviders() async {
    try {
      final response = await client
          .from('bill_providers')
          .select()
          .order('created_at', ascending: true);
      return (response as List<dynamic>)
          .map((e) => e as Map<String, dynamic>)
          .toList();
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
          .order('price_akd', ascending: true);
      return (response as List<dynamic>)
          .map((e) => e as Map<String, dynamic>)
          .toList();
    } catch (e) {
      debugPrint('Error fetching topup packages from Supabase: $e');
      return [];
    }
  }
}
