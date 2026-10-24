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

    // ── 4-Route Authentication & Test OTP Flow Tests ──

    test('Flow 1: Email Login with test email realjackhalder@gmail.com receives and verifies test OTP', () async {
      const email = 'realjackhalder@gmail.com';
      const pin = '123456';

      // Step 1: Request OTP
      final reqResult = await auth.requestLoginOtp(email: email, pin: pin);
      expect(reqResult['success'], isTrue);
      expect(reqResult['message'], contains('realjackhalder@gmail.com'));

      // Step 2: Verify OTP with designated test code
      final verifyResult = await auth.verifyLoginOtp(email: email, pin: pin, otp: '123456');
      expect(verifyResult['success'], isTrue);
      expect(verifyResult['user'], isNotNull);
      expect((verifyResult['user'] as StoredUser).email, equals(email));
    });

    test('Flow 2: Google Login with PIN verifies credentials and returns authenticated user', () async {
      const email = 'realjackhalder@gmail.com';
      const pin = '123456';

      final result = await auth.loginWithGoogleAndPin(
        email: email,
        pin: pin,
        name: 'Jack Halder',
      );
      expect(result['success'], isTrue);
      expect(result['user'], isNotNull);
      expect((result['user'] as StoredUser).email, equals(email));
    });

    test('Flow 3: Email Signup with test email initiates OTP and verifies into active identity', () async {
      const email = 'realjackhalder@gmail.com';
      const pin = '112233';

      // Step 1: Initiate sign up
      final initResult = await auth.initiateSignUp(
        email: email,
        pin: pin,
        confirmPin: pin,
      );
      expect(initResult['success'], isTrue);

      // Step 2: Verify OTP
      final otpResult = await auth.verifySignUpOtp(email: email, otp: '123456');
      expect(otpResult['success'], isTrue);

      // Step 3: Complete identity creation
      final completeResult = await auth.completeSignUp(
        email: email,
        name: 'Real Jack',
        username: 'realjack',
      );
      expect(completeResult['success'], isTrue);
      expect(completeResult['user'], isNotNull);
    });

    test('Flow 4: Google Signup with Create PIN registers new active user', () async {
      const email = 'google.user@example.com';
      const pin = '334455';

      final result = await auth.registerWithGoogleAndPin(
        email: email,
        pin: pin,
        confirmPin: pin,
        name: 'New Google Citizen',
      );
      expect(result['success'], isTrue);
      expect(result['user'], isNotNull);
      expect((result['user'] as StoredUser).email, equals(email));
    });
  });
}
