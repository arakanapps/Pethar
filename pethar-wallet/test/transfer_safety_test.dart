import 'package:flutter_test/flutter_test.dart';
import 'package:pethar_mobile/app_state.dart';
import 'package:pethar_mobile/services/supabase_service.dart';

void main() {
  group('AKD transfer safety', () {
    test('legacy client-side financial mutations are inert', () {
      final state = AppState();
      final balance = state.wallet.balance;
      final usdBalance = state.usdAccountBalance;
      final transactionCount = state.txList.length;

      state.convertStablecoin(amount: 10, fromToken: 'USDT', toToken: 'AKD');
      state.transferBetweenAccounts(amount: 10, usdToAkd: true);
      state.recordTransfer(
          amount: 10, recipientName: 'Recipient', recipientId: 'recipient');
      state.recordUsdTransfer(
          amount: 10, recipientAddress: '0x123', token: 'USDT');

      expect(state.wallet.balance, balance);
      expect(state.usdAccountBalance, usdBalance);
      expect(state.txList, hasLength(transactionCount));
    });

    test('idempotency keys are distinct RFC 4122 version 4 UUIDs', () {
      final service = SupabaseService();
      final first = service.createTransferIdempotencyKey();
      final second = service.createTransferIdempotencyKey();
      final uuidV4 = RegExp(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
      );

      expect(uuidV4.hasMatch(first), isTrue);
      expect(uuidV4.hasMatch(second), isTrue);
      expect(first, isNot(second));
    });
  });
}
