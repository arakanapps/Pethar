import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pethar_mobile/app_state.dart';
import 'package:pethar_mobile/settings/settings_screen.dart';

Future<void> _loadFont() async {
  final bytes = File('C:/Windows/Fonts/segoeui.ttf').readAsBytesSync();
  final loader = FontLoader('Roboto')
    ..addFont(Future.value(ByteData.view(bytes.buffer)));
  await loader.load();
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('render forgot pin otp page', (tester) async {
    await _loadFont();
    SharedPreferences.setMockInitialValues({});
    FlutterSecureStorage.setMockInitialValues({});
    tester.view.physicalSize = const Size(412, 892);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.reset);

    final previousOnError = FlutterError.onError;
    FlutterError.onError = (details) {
      final msg = details.exceptionAsString();
      if (msg.contains('ListTile background color') ||
          msg.contains('You must initialize the supabase instance')) {
        return;
      }
    };
    addTearDown(() => FlutterError.onError = previousOnError);

    final appState = AppState();
    appState.isAuthenticated = true;
    appState.profile.email = 'realjackhalder@gmail.com';
    appState.profile.username = '@realjackhalder';
    appState.profile.name = 'realjackhalder';

    await tester.pumpWidget(
      ChangeNotifierProvider<AppState>.value(
        value: appState,
        child: const MaterialApp(home: SettingsScreen()),
      ),
    );
    await tester.pump(const Duration(milliseconds: 400));

    await tester.scrollUntilVisible(find.text('PIN Management'), 250,
        scrollable: find.byType(Scrollable).first);
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('PIN Management'));
    await tester.pump(const Duration(milliseconds: 400));

    await tester.tap(find.text('Forget PIN'));
    await tester.pump(const Duration(milliseconds: 900));
    await tester.pump(const Duration(milliseconds: 900));

    await expectLater(
      find.byType(MaterialApp),
      matchesGoldenFile('otp_page_preview.png'),
    );
  });
}
