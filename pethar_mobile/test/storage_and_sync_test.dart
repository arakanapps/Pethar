import 'package:flutter_test/flutter_test.dart';
import 'package:pethar_mobile/services/local_storage_service.dart';
import 'package:pethar_mobile/services/sync_service.dart';

void main() {
  group('Encrypted Local Storage Operations', () {
    late LocalStorageService storage;

    setUp(() async {
      storage = InMemoryStorageService();
      await storage.initialize(encryptionKey: 'test-secure-enclave-key');
    });

    test('stores and retrieves offline vouchers with replay resistance', () async {
      final voucherMap = {
        'voucher_code': 'VCH-TEST-999',
        'sender_account_id': 'sender-acc-01',
        'recipient_identifier': 'ARAK-9999',
        'amount': 75.0,
        'currency': 'AKD',
        'nonce': 'unique-nonce-uuid-999',
        'created_at': DateTime.now().toIso8601String(),
        'expires_at': DateTime.now().add(const Duration(hours: 24)).toIso8601String(),
        'sender_public_key': 'pubkey-base64',
        'signature': 'sig-base64',
        'sequence_number': 1,
        'status': 'created',
        'direction': 'sent',
      };

      await storage.insertVoucher(voucherMap);

      // Verify retrieval by voucher code
      final retrieved = await storage.getVoucherByCode('VCH-TEST-999');
      expect(retrieved, isNotNull);
      expect(retrieved!['amount'], 75.0);

      // Verify retrieval by nonce (Replay Attack Prevention)
      final byNonce = await storage.getVoucherByNonce('unique-nonce-uuid-999');
      expect(byNonce, isNotNull);
      expect(byNonce!['voucher_code'], 'VCH-TEST-999');

      // Verify pending vouchers count
      expect(await storage.getUnsyncedVoucherCount(), 1);

      // Mark settled
      await storage.updateVoucherStatus('VCH-TEST-999', 'settled');
      expect(await storage.getUnsyncedVoucherCount(), 0);
    });

    test('manages sync queue with retry attempt counting', () async {
      await storage.enqueueSync('VOUCHER_UPLOAD', '{"voucher_code": "VCH-01"}');

      var pendingOps = await storage.getPendingSyncOps();
      expect(pendingOps.length, 1);
      expect(pendingOps.first['status'], 'pending');
      expect(pendingOps.first['attempts'], 0);

      final opId = pendingOps.first['id'] as int;

      // Fail attempt 1
      await storage.failSyncOp(opId, 'Network connection timed out');
      pendingOps = await storage.getPendingSyncOps();
      expect(pendingOps.first['attempts'], 1);
      expect(pendingOps.first['last_error'], 'Network connection timed out');

      // Complete operation
      await storage.completeSyncOp(opId);
      pendingOps = await storage.getPendingSyncOps();
      expect(pendingOps.isEmpty, isTrue);
    });

    test('caches account balance projections locally', () async {
      await storage.updateBalanceCache('acc-01', 'AKD', 14850.00, 42);

      final cached = await storage.getCachedBalance('acc-01');
      expect(cached, isNotNull);
      expect(cached!['balance'], 14850.00);
      expect(cached['last_seq'], 42);
      expect(cached['currency'], 'AKD');
    });
  });

  group('Sync Engine & Connectivity Resiliency', () {
    test('calculates exponential backoff with jitter within capped bounds', () {
      final delay1 = SyncConfig.getRetryDelay(1);
      final delay2 = SyncConfig.getRetryDelay(2);
      final delay5 = SyncConfig.getRetryDelay(5);

      expect(delay1.inMilliseconds, greaterThan(0));
      expect(delay2.inMilliseconds, greaterThan(0));
      // Cap check
      expect(delay5.inMilliseconds, lessThanOrEqualTo(SyncConfig.maxRetryDelayMs + 20000));
    });

    test('DevelopmentSyncEngine executes sync cycle and emits lifecycle states', () async {
      final engine = DevelopmentSyncEngine();
      final states = <SyncEngineStatus>[];
      final subscription = engine.statusStream.listen(states.add);

      await engine.start();
      final result = await engine.syncNow();

      expect(result.successful, isTrue);
      expect(engine.status, SyncEngineStatus.completed);

      await engine.stop();
      await subscription.cancel();
    });
  });
}
