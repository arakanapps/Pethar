import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pethar_mobile/app_state.dart';
import 'package:pethar_mobile/auth/app_lock_screen.dart';
import 'package:pethar_mobile/shell/main_shell.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    FlutterSecureStorage.setMockInitialValues({});
  });

  Future<void> enterPin(WidgetTester tester, String pin) async {
    for (final digit in pin.split('')) {
      await tester.tap(find.text(digit));
      await tester.pump(const Duration(milliseconds: 60));
    }
    await tester.pump(const Duration(milliseconds: 300));
  }

  group('App launch PIN lock', () {
    test('unlockWithPin accepts the vault PIN and clears the lock', () async {
      final appState = AppState();
      appState.isAuthenticated = true;
      await appState.saveSecurePinHash('135790');
      appState.lockApp();

      expect(appState.isAppLocked, isTrue);
      expect(await appState.unlockWithPin('135790'), isTrue);
      expect(appState.isAppLocked, isFalse);
    });

    test('unlockWithPin rejects a wrong PIN and stays locked', () async {
      final appState = AppState();
      appState.isAuthenticated = true;
      await appState.saveSecurePinHash('135790');
      appState.lockApp();

      expect(await appState.unlockWithPin('000000'), isFalse);
      expect(appState.isAppLocked, isTrue);
    });

    test('unlockWithPin falls back to the legacy profile PIN', () async {
      final appState = AppState();
      appState.isAuthenticated = true;
      appState.profile.pin = '246810';
      appState.lockApp();

      expect(await appState.unlockWithPin('246810'), isTrue);
      expect(appState.isAppLocked, isFalse);
      // The legacy PIN is migrated into the hardware vault.
      expect(await appState.verifySecurePin('246810'), isTrue);
    });
  });

  testWidgets('MainShell shows the PIN gate instead of the wallet when locked',
      (tester) async {
    tester.view.physicalSize = const Size(412, 892);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.reset);

    final errors = <FlutterErrorDetails>[];
    final previousOnError = FlutterError.onError;
    FlutterError.onError = (details) {
      // The test font renders glyphs wider than real fonts; ignore text
      // overflow reports only.
      if (details.exceptionAsString().contains('overflowed by')) return;
      errors.add(details);
    };
    addTearDown(() => FlutterError.onError = previousOnError);

    final appState = AppState();
    await appState.saveSecurePinHash('135790');
    appState.isAuthenticated = true;
    appState.lockApp();

    await tester.pumpWidget(
      ChangeNotifierProvider<AppState>.value(
        value: appState,
        child: const MaterialApp(home: MainShell()),
      ),
    );
    await tester.pump(const Duration(milliseconds: 1600));
    await tester.pump(const Duration(milliseconds: 300));

    // The wallet shell must not be reachable before the PIN is entered.
    expect(find.byType(AppLockScreen), findsOneWidget);
    expect(find.byKey(const ValueKey('main-bottom-nav')), findsNothing);

    await enterPin(tester, '135790');
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump(const Duration(milliseconds: 400));

    expect(errors, isEmpty);
    expect(appState.isAppLocked, isFalse);
    expect(find.byType(AppLockScreen), findsNothing);
    expect(find.byKey(const ValueKey('main-bottom-nav')), findsOneWidget);
  });
}
