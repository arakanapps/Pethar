import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:pethar_mobile/app_state.dart';
import 'package:pethar_mobile/models/data.dart';
import 'package:pethar_mobile/kyc/kyc_level2_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('KYC Level 2 screen renders identity, NRIC/selfie and address fields',
      (tester) async {
    SharedPreferences.setMockInitialValues({});
    final appState = AppState();
    appState.profile = UserProfile(
      email: 'member@example.com',
      name: 'Test Member',
      firstName: 'Test',
      lastName: 'Member',
      uid: '123456789012',
      kycTier: 1,
      kycStatus: 'UNVERIFIED',
    );

    await tester.pumpWidget(
      ChangeNotifierProvider<AppState>.value(
        value: appState,
        child: const MaterialApp(home: KycLevel2Screen()),
      ),
    );
    await tester.pump();

    expect(find.text('KYC Level 2 Verification'), findsOneWidget);
    expect(find.text('Identity details'), findsOneWidget);

    await tester.scrollUntilVisible(
      find.text('Residential address'),
      300,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pump();
    expect(find.text('Residential address'), findsOneWidget);

    await tester.scrollUntilVisible(
      find.text('Live selfie'),
      300,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pump();
    expect(find.text('NRIC front side'), findsOneWidget);
    expect(find.text('NRIC back side'), findsOneWidget);
    expect(find.text('Live selfie'), findsOneWidget);

    await tester.scrollUntilVisible(
      find.text('Submit for Level 2 review'),
      300,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pump();
    expect(find.text('Submit for Level 2 review'), findsOneWidget);
  });
}
