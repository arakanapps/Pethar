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

    test('clean unauthenticated initial profile has no hardcoded personal data', () {
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

    test('sign up rejects invalid email before contacting the backend', () async {
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
        email: 'member@example.com',
        pin: '12345',
        confirmPin: '12345',
      );
      expect(result['success'], isFalse);
      expect(result['error'], contains('6 numeric digits'));
    });

    test('sign up rejects mismatched PIN confirmation', () async {
      final result = await auth.initiateSignUp(
        email: 'member@example.com',
        pin: '123456',
        confirmPin: '654321',
      );
      expect(result['success'], isFalse);
      expect(result['do not match'], isNull);
      expect(result['error'], contains('do not match'));
    });

    test('login rejects malformed credentials without network access', () async {
      final result = await auth.loginWithEmailAndPin(
        email: 'member@example.com',
        pin: '123',
      );
      expect(result['success'], isFalse);
      expect(result['isPinOrEmailWrong'], isFalse);
    });

    test('KYC Level 2 cannot be submitted without a registered user', () async {
      final result = await auth.submitKycLevel2(
        email: 'missing@example.com',
        nationalIdNo: '12/ABC(N)123456',
        dob: '1990-01-01',
        fullName: 'Test User',
        address: 'Sittwe',
      );
      expect(result['success'], isFalse);
    });

    test('plaintext PIN is never stored in SharedPreferences JSON', () {
      final uid = generateUserUid();
      final user = StoredUser(
        email: 'secure@example.com',
        pin: '654321',
        name: 'Secure User',
        username: '@secure',
        uid: uid,
      );

      final jsonMap = user.toJson();
      expect(jsonMap.containsKey('pin'), isFalse, reason: 'PIN field must not exist in toJson');

      final restored = StoredUser.fromJson({
        'email': 'secure@example.com',
        'pin': '654321',
        'name': 'Secure User',
        'username': '@secure',
        'uid': uid,
      });
      expect(restored.pin, isEmpty, reason: 'PIN must not be restored from JSON');
    });

    test('generateUserUid produces random 12-digit numeric strings', () {
      final uid1 = generateUserUid();
      final uid2 = generateUserUid();
      final twelveDigitPattern = RegExp(r'^[1-9]\d{11}$');

      expect(twelveDigitPattern.hasMatch(uid1), isTrue);
      expect(twelveDigitPattern.hasMatch(uid2), isTrue);
      expect(uid1, isNot(equals(uid2)));
    });

    test('3-step auth flow validates email, OTP, and 6-digit PIN / biometrics', () async {
      final invalidEmailResult = await auth.requestAuthEmailOtp(
        email: 'invalid-email',
        isSignUp: true,
      );
      expect(invalidEmailResult['success'], isFalse);

      final invalidOtpResult = await auth.verifyAuthEmailOtp(
        email: 'member@example.com',
        otp: '123',
        isSignUp: true,
      );
      expect(invalidOtpResult['success'], isFalse);

      final pinCompleteResult = await auth.completeAuthWithPin(
        email: 'member@example.com',
        pin: '123456',
        confirmPin: '123456',
        isSignUp: true,
      );
      expect(pinCompleteResult['success'], isTrue);
      final createdUser = pinCompleteResult['user'] as StoredUser;
      expect(RegExp(r'^[1-9]\d{11}$').hasMatch(createdUser.uid), isTrue);

      final biometricResult = await auth.completeAuthWithBiometrics(
        email: 'member@example.com',
        isSignUp: false,
      );
      expect(biometricResult['success'], isTrue);
    });
  });
}
