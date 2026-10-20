import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pethar_mobile/services/auth_service.dart';
import 'package:pethar_mobile/models/data.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AuthService validation', () {
    late AuthService auth;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      auth = AuthService();
      await auth.initialize();
    });

    test('clean unauthenticated initial profile has no hardcoded personal data',
        () {
      final initial = initialUserProfile;
      expect(initial.name, isEmpty);
      expect(initial.firstName, isEmpty);
      expect(initial.lastName, isEmpty);
      expect(initial.nickname, isEmpty);
      expect(initial.nationalIdNo, isEmpty);
      expect(initial.dob, isEmpty);
      expect(initial.address, isEmpty);
      expect(initial.phone, isEmpty);
      expect(initial.email, isEmpty);
      expect(initial.pin, isEmpty);
      expect(initial.kycTier, 1);
      expect(initial.kycStatus, 'UNVERIFIED');
    });

    test('sign up rejects invalid email before contacting the backend',
        () async {
      final result = await auth.initiateSignUp(
        email: 'not-an-email',
        pin: '123456',
        confirmPin: '123456',
      );
      expect(result['success'], isFalse);
      expect(result['error'], contains('valid email'));
    });

    test('sign up rejects a PIN that is not six digits', () async {
      final result = await auth.initiateSignUp(
        email: 'user@pethar.io',
        pin: '12345',
        confirmPin: '12345',
      );
      expect(result['success'], isFalse);
      expect(result['error'], contains('6 numeric digits'));
    });

    test('sign up rejects mismatched PIN confirmation', () async {
      final result = await auth.initiateSignUp(
        email: 'user@pethar.io',
        pin: '123456',
        confirmPin: '654321',
      );
      expect(result['success'], isFalse);
      expect(result['error'], contains('do not match'));
    });

    test('login rejects malformed credentials without network access',
        () async {
      final result = await auth.loginWithEmailAndPin(
        email: 'user@pethar.io',
        pin: '123',
      );
      expect(result['success'], isFalse);
      expect(result['isPinOrEmailWrong'], isFalse);
    });

    test('KYC Level 2 cannot be submitted without a registered user', () async {
      final result = await auth.submitKycLevel2(
        email: 'missing@pethar.io',
        nationalIdNo: '12/ABC(N)123456',
        dob: '1990-01-01',
        fullName: 'Test User',
        address: 'Sittwe',
      );
      expect(result['success'], isFalse);
    });
  });
}
