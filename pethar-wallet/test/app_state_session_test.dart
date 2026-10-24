import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pethar_mobile/app_state.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  String createMockJwt({required int expirySecondsFromNow}) {
    final header = base64Url.encode(utf8.encode(jsonEncode({'alg': 'HS256', 'typ': 'JWT'}))).replaceAll('=', '');
    final exp = (DateTime.now().millisecondsSinceEpoch ~/ 1000) + expirySecondsFromNow;
    final payload = base64Url.encode(utf8.encode(jsonEncode({
      'sub': '87c6ab94-6efa-4625-8ef9-460cd1798965',
      'email': 'security-lead@pethar.co.uk',
      'exp': exp,
      'role': 'authenticated',
    }))).replaceAll('=', '');
    final signature = base64Url.encode(utf8.encode('mock-signature-bytes')).replaceAll('=', '');
    return '$header.$payload.$signature';
  }

  group('AppState Hardware-Encrypted Token Storage Lifecycle', () {
    setUp(() {
      FlutterSecureStorage.setMockInitialValues({});
    });

    test('saveUserSession writes tokens to secure vault and updates state', () async {
      final appState = AppState();
      final mockAccess = createMockJwt(expirySecondsFromNow: 3600);
      const mockRefresh = 'pethar_refresh_token_vault_secret_999';

      await appState.saveUserSession(mockAccess, mockRefresh);

      expect(appState.hasSecureSession, isTrue);
      expect(appState.accessToken, equals(mockAccess));
      expect(appState.refreshToken, equals(mockRefresh));
      expect(appState.authenticatedHeaders['Authorization'], equals('Bearer $mockAccess'));

      // Verify that values are persisted into the hardware vault mock
      const secureStorage = FlutterSecureStorage();
      final storedAccess = await secureStorage.read(key: 'pethar_secure_access_token_v1');
      final storedRefresh = await secureStorage.read(key: 'pethar_secure_refresh_token_v1');

      expect(storedAccess, equals(mockAccess));
      expect(storedRefresh, equals(mockRefresh));
    });

    test('loadUserSession restores valid unexpired session from vault', () async {
      final mockAccess = createMockJwt(expirySecondsFromNow: 7200);
      const mockRefresh = 'pethar_refresh_token_vault_secret_888';

      // Pre-populate mock secure storage
      const secureStorage = FlutterSecureStorage();
      await secureStorage.write(key: 'pethar_secure_access_token_v1', value: mockAccess);
      await secureStorage.write(key: 'pethar_secure_refresh_token_v1', value: mockRefresh);

      final appState = AppState();
      final restored = await appState.loadUserSession();

      expect(restored, isTrue);
      expect(appState.hasSecureSession, isTrue);
      expect(appState.accessToken, equals(mockAccess));
      expect(appState.refreshToken, equals(mockRefresh));
    });

    test('loadUserSession purges expired token and returns false', () async {
      // Mock an expired JWT (-100 seconds)
      final expiredAccess = createMockJwt(expirySecondsFromNow: -100);
      const mockRefresh = 'pethar_stale_refresh_token_777';

      const secureStorage = FlutterSecureStorage();
      await secureStorage.write(key: 'pethar_secure_access_token_v1', value: expiredAccess);
      await secureStorage.write(key: 'pethar_secure_refresh_token_v1', value: mockRefresh);

      final appState = AppState();
      final restored = await appState.loadUserSession();

      expect(restored, isFalse);
      expect(appState.hasSecureSession, isFalse);
      expect(appState.accessToken, isNull);
      expect(appState.refreshToken, isNull);

      // Verify active cryptographic purge removed stale keys from storage
      final storedAccess = await secureStorage.read(key: 'pethar_secure_access_token_v1');
      final storedRefresh = await secureStorage.read(key: 'pethar_secure_refresh_token_v1');
      expect(storedAccess, isNull);
      expect(storedRefresh, isNull);
    });

    test('clearUserSession purges vault immediately and clears memory', () async {
      final appState = AppState();
      final mockAccess = createMockJwt(expirySecondsFromNow: 3600);
      const mockRefresh = 'pethar_refresh_token_666';

      await appState.saveUserSession(mockAccess, mockRefresh);
      expect(appState.hasSecureSession, isTrue);

      await appState.clearUserSession();

      expect(appState.hasSecureSession, isFalse);
      expect(appState.accessToken, isNull);
      expect(appState.refreshToken, isNull);

      const secureStorage = FlutterSecureStorage();
      expect(await secureStorage.read(key: 'pethar_secure_access_token_v1'), isNull);
      expect(await secureStorage.read(key: 'pethar_secure_refresh_token_v1'), isNull);
    });

    test('signOut triggers active cryptographic purge of keys', () async {
      final appState = AppState();
      final mockAccess = createMockJwt(expirySecondsFromNow: 3600);
      const mockRefresh = 'pethar_refresh_token_555';

      await appState.saveUserSession(mockAccess, mockRefresh);
      expect(appState.hasSecureSession, isTrue);

      await appState.signOut();

      expect(appState.hasSecureSession, isFalse);
      expect(appState.isAuthenticated, isFalse);

      const secureStorage = FlutterSecureStorage();
      expect(await secureStorage.read(key: 'pethar_secure_access_token_v1'), isNull);
      expect(await secureStorage.read(key: 'pethar_secure_refresh_token_v1'), isNull);
    });
  });
}
