/// PeThar Local Encrypted Storage Service
/// 
/// Provides encrypted SQLite storage for:
///   - Offline vouchers (pending sync)
///   - Local transaction cache
///   - Device keypair metadata
///   - User preferences and session data
///
/// Uses sqflite with SQLCipher encryption for data-at-rest protection.
/// The encryption key is derived from the user's biometric-protected
/// keychain entry (iOS) or Android Keystore.
///
/// Dependencies required in pubspec.yaml:
///   - sqflite_sqlcipher: ^3.1.0+1 (encrypted SQLite)
///   - path: ^1.9.0
///   - flutter_secure_storage: ^9.2.4
library;

/// Database schema version - increment on schema changes
const int kDatabaseVersion = 1;

/// SQL statements for creating the local encrypted database
const String kCreateVouchersTable = '''
CREATE TABLE IF NOT EXISTS offline_vouchers (
  voucher_code TEXT PRIMARY KEY,
  sender_account_id TEXT NOT NULL,
  recipient_identifier TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AKD',
  nonce TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  sender_public_key TEXT NOT NULL,
  signature TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  transport TEXT,
  chain_hash TEXT,
  sync_attempted_at TEXT,
  sync_error TEXT,
  direction TEXT NOT NULL DEFAULT 'sent'
)
''';

const String kCreateTransactionCacheTable = '''
CREATE TABLE IF NOT EXISTS transaction_cache (
  id TEXT PRIMARY KEY,
  reference_id TEXT UNIQUE NOT NULL,
  transaction_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AKD',
  counterparty_name TEXT,
  counterparty_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL,
  synced_at TEXT,
  is_local_only INTEGER NOT NULL DEFAULT 1
)
''';

const String kCreateKeypairMetaTable = '''
CREATE TABLE IF NOT EXISTS device_keypairs (
  key_id TEXT PRIMARY KEY,
  public_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  registered_with_server INTEGER NOT NULL DEFAULT 0,
  last_used_at TEXT
)
''';

const String kCreateSyncQueueTable = '''
CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  operation_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  last_attempt_at TEXT,
  last_error TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
)
''';

const String kCreateBalanceCacheTable = '''
CREATE TABLE IF NOT EXISTS balance_cache (
  account_id TEXT PRIMARY KEY,
  currency TEXT NOT NULL,
  balance REAL NOT NULL,
  last_seq INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
)
''';

/// Abstract interface for local storage operations
/// This allows testing with in-memory implementations
abstract class LocalStorageService {
  /// Initialize the encrypted database
  Future<void> initialize({required String encryptionKey});

  /// Close the database connection
  Future<void> close();

  // ── Voucher Operations ──

  /// Store a new offline voucher
  Future<void> insertVoucher(Map<String, dynamic> voucher);

  /// Get all vouchers pending sync
  Future<List<Map<String, dynamic>>> getPendingVouchers();

  /// Get all received vouchers
  Future<List<Map<String, dynamic>>> getReceivedVouchers();

  /// Update voucher status
  Future<void> updateVoucherStatus(String voucherCode, String status, {String? error});

  /// Get voucher by code (for replay detection)
  Future<Map<String, dynamic>?> getVoucherByCode(String voucherCode);

  /// Get voucher by nonce (for replay detection)  
  Future<Map<String, dynamic>?> getVoucherByNonce(String nonce);

  /// Count unsynced vouchers
  Future<int> getUnsyncedVoucherCount();

  /// Delete expired vouchers
  Future<int> deleteExpiredVouchers();

  // ── Transaction Cache ──

  /// Cache a transaction locally
  Future<void> cacheTransaction(Map<String, dynamic> transaction);

  /// Get cached transactions
  Future<List<Map<String, dynamic>>> getCachedTransactions({int limit = 50});

  /// Mark transaction as synced
  Future<void> markTransactionSynced(String id);

  // ── Keypair Metadata ──

  /// Store keypair metadata (NOT the private key itself)
  Future<void> storeKeypairMeta(Map<String, dynamic> meta);

  /// Get keypair metadata
  Future<Map<String, dynamic>?> getKeypairMeta(String keyId);

  // ── Sync Queue ──

  /// Add operation to sync queue
  Future<void> enqueueSync(String operationType, String payload);

  /// Get pending sync operations
  Future<List<Map<String, dynamic>>> getPendingSyncOps();

  /// Mark sync operation as completed
  Future<void> completeSyncOp(int id);

  /// Record sync attempt failure
  Future<void> failSyncOp(int id, String error);

  // ── Balance Cache ──

  /// Update cached balance
  Future<void> updateBalanceCache(String accountId, String currency, double balance, int seq);

  /// Get cached balance
  Future<Map<String, dynamic>?> getCachedBalance(String accountId);
}

/// Placeholder implementation using in-memory maps for development.
/// 
/// TODO(production): Replace with sqflite_sqlcipher implementation:
/// ```dart
/// final db = await openDatabase(
///   join(await getDatabasesPath(), 'pethar_secure.db'),
///   password: encryptionKey, // from Keychain/Keystore
///   version: kDatabaseVersion,
///   onCreate: (db, version) async {
///     await db.execute(kCreateVouchersTable);
///     await db.execute(kCreateTransactionCacheTable);
///     await db.execute(kCreateKeypairMetaTable);
///     await db.execute(kCreateSyncQueueTable);
///     await db.execute(kCreateBalanceCacheTable);
///   },
/// );
/// ```
class InMemoryStorageService implements LocalStorageService {
  final List<Map<String, dynamic>> _vouchers = [];
  final List<Map<String, dynamic>> _transactions = [];
  final Map<String, Map<String, dynamic>> _keypairs = {};
  final List<Map<String, dynamic>> _syncQueue = [];
  final Map<String, Map<String, dynamic>> _balanceCache = {};
  int _syncQueueId = 0;

  @override
  Future<void> initialize({required String encryptionKey}) async {
    // In-memory: nothing to initialize
  }

  @override
  Future<void> close() async {
    // In-memory: nothing to close
  }

  // ── Voucher Operations ──

  @override
  Future<void> insertVoucher(Map<String, dynamic> voucher) async {
    _vouchers.add(Map.from(voucher));
  }

  @override
  Future<List<Map<String, dynamic>>> getPendingVouchers() async {
    return _vouchers
        .where((v) => v['status'] == 'created' || v['status'] == 'transmitted' || v['status'] == 'pendingSync')
        .toList();
  }

  @override
  Future<List<Map<String, dynamic>>> getReceivedVouchers() async {
    return _vouchers.where((v) => v['direction'] == 'received').toList();
  }

  @override
  Future<void> updateVoucherStatus(String voucherCode, String status, {String? error}) async {
    final idx = _vouchers.indexWhere((v) => v['voucher_code'] == voucherCode);
    if (idx != -1) {
      _vouchers[idx]['status'] = status;
      if (error != null) _vouchers[idx]['sync_error'] = error;
    }
  }

  @override
  Future<Map<String, dynamic>?> getVoucherByCode(String voucherCode) async {
    try {
      return _vouchers.firstWhere((v) => v['voucher_code'] == voucherCode);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<Map<String, dynamic>?> getVoucherByNonce(String nonce) async {
    try {
      return _vouchers.firstWhere((v) => v['nonce'] == nonce);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<int> getUnsyncedVoucherCount() async {
    return _vouchers.where((v) => v['status'] != 'settled' && v['status'] != 'expired').length;
  }

  @override
  Future<int> deleteExpiredVouchers() async {
    final now = DateTime.now().toIso8601String();
    final before = _vouchers.length;
    _vouchers.removeWhere((v) {
      final expiresAt = v['expires_at'] as String;
      return expiresAt.compareTo(now) < 0 && v['status'] != 'settled';
    });
    return before - _vouchers.length;
  }

  // ── Transaction Cache ──

  @override
  Future<void> cacheTransaction(Map<String, dynamic> transaction) async {
    _transactions.add(Map.from(transaction));
  }

  @override
  Future<List<Map<String, dynamic>>> getCachedTransactions({int limit = 50}) async {
    return _transactions.take(limit).toList();
  }

  @override
  Future<void> markTransactionSynced(String id) async {
    final idx = _transactions.indexWhere((t) => t['id'] == id);
    if (idx != -1) {
      _transactions[idx]['is_local_only'] = 0;
      _transactions[idx]['synced_at'] = DateTime.now().toIso8601String();
    }
  }

  // ── Keypair Metadata ──

  @override
  Future<void> storeKeypairMeta(Map<String, dynamic> meta) async {
    _keypairs[meta['key_id'] as String] = Map.from(meta);
  }

  @override
  Future<Map<String, dynamic>?> getKeypairMeta(String keyId) async {
    return _keypairs[keyId];
  }

  // ── Sync Queue ──

  @override
  Future<void> enqueueSync(String operationType, String payload) async {
    _syncQueue.add({
      'id': ++_syncQueueId,
      'operation_type': operationType,
      'payload': payload,
      'created_at': DateTime.now().toIso8601String(),
      'attempts': 0,
      'max_attempts': 5,
      'status': 'pending',
    });
  }

  @override
  Future<List<Map<String, dynamic>>> getPendingSyncOps() async {
    return _syncQueue.where((s) => s['status'] == 'pending').toList();
  }

  @override
  Future<void> completeSyncOp(int id) async {
    final idx = _syncQueue.indexWhere((s) => s['id'] == id);
    if (idx != -1) _syncQueue[idx]['status'] = 'completed';
  }

  @override
  Future<void> failSyncOp(int id, String error) async {
    final idx = _syncQueue.indexWhere((s) => s['id'] == id);
    if (idx != -1) {
      _syncQueue[idx]['attempts'] = (_syncQueue[idx]['attempts'] as int) + 1;
      _syncQueue[idx]['last_error'] = error;
      _syncQueue[idx]['last_attempt_at'] = DateTime.now().toIso8601String();
      if ((_syncQueue[idx]['attempts'] as int) >= (_syncQueue[idx]['max_attempts'] as int)) {
        _syncQueue[idx]['status'] = 'failed';
      }
    }
  }

  // ── Balance Cache ──

  @override
  Future<void> updateBalanceCache(String accountId, String currency, double balance, int seq) async {
    _balanceCache[accountId] = {
      'account_id': accountId,
      'currency': currency,
      'balance': balance,
      'last_seq': seq,
      'updated_at': DateTime.now().toIso8601String(),
    };
  }

  @override
  Future<Map<String, dynamic>?> getCachedBalance(String accountId) async {
    return _balanceCache[accountId];
  }
}
