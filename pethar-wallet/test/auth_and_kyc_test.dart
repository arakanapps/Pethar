import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pethar_mobile/services/auth_service.dart';
import 'package:pethar_mobile/models/data.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AuthService PIN & KYC Workflow Tests', () {
    late AuthService auth;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      auth = AuthService();
      await auth.initialize();
    });

    test('clean unauthenticated initial profile has no hardcoded default personal data', () {
      final initial = initialUserProfile;
      expect(initial.name, isEmpty);
      expect(initial.firstName, isEmpty);
      expect(initial.lastName, isEmpty);
      expect(initial.nickname, isEmpty);
      expect(initial.nationalIdNo, isEmpty);
      expect(initial.dob, isEmpty);
      expect(initial.address, isEmpty);
      expect(initial.phone, isEmpty);
      expect(initial.email, 'user@pethar.com');
      expect(initial.pin, isEmpty);
      expect(initial.kycTier, 1);
      expect(initial.kycStatus, 'UNVERIFIED');
    });

    test('sign up flow: credentials -> 10-min OTP -> Identity -> KYC Level 1', () async {
      const email = 'newuser@pethar.io';
      const pin = '654321';

      // 1. Initiate sign up
      final step1 = await auth.initiateSignUp(
        email: email,
        pin: pin,
        confirmPin: pin,
      );
      expect(step1['success'], isTrue);
      expect(step1['code'], isNotNull);
      final otp = step1['code'] as String;

      // Check 10-minute expiry
      final challenge = auth.activeSignUpChallenge;
      expect(challenge, isNotNull);
      expect(challenge!.isExpired, isFalse);
      expect(challenge.secondsRemaining, greaterThan(590)); // ~600 seconds (10 min)

      // Test wrong OTP
      final wrongRes = auth.verifySignUpOtp(email: email, otp: '000000');
      expect(wrongRes['success'], isFalse);

      // Verify correct OTP
      final verifyRes = auth.verifySignUpOtp(email: email, otp: otp);
      expect(verifyRes['success'], isTrue);

      // Complete registration with Name and Username
      final compRes = await auth.completeSignUp(
        email: email,
        name: 'Ko Min Min',
        username: '@minmin',
      );
      expect(compRes['success'], isTrue);
      final user = compRes['user'] as StoredUser;
      expect(user.email, email);
      expect(user.name, 'Ko Min Min');
      expect(user.username, '@minmin');
      expect(user.kycTier, 1); // KYC Level 1
      expect(user.kycStatus, 'VERIFIED_LVL1');
      expect(user.uid, isNotEmpty);
    });

    test('login with email and 6-digit PIN validates correctly', () async {
      // Wrong credentials
      final wrongRes = await auth.loginWithEmailAndPin(
        email: 'newuser@pethar.io',
        pin: '111111',
      );
      expect(wrongRes['success'], isFalse);
      expect(wrongRes['error'], 'Wrong email or PIN code');
      expect(wrongRes['isPinOrEmailWrong'], isTrue);

      // Correct credentials
      final successRes = await auth.loginWithEmailAndPin(
        email: 'newuser@pethar.io',
        pin: '654321',
      );
      expect(successRes['success'], isTrue);
      final user = successRes['user'] as StoredUser;
      expect(user.email, 'newuser@pethar.io');
    });

    test('forgot password flow with 10-minute OTP and new PIN confirmation', () async {
      const email = 'newuser@pethar.io';

      // Request OTP
      final reqRes = await auth.requestPinResetOtp(email: email);
      expect(reqRes['success'], isTrue);
      final otp = reqRes['code'] as String;

      // Verify OTP
      final verify = auth.verifyPinResetOtp(email: email, otp: otp);
      expect(verify['success'], isTrue);

      // Reset PIN
      final reset = await auth.confirmPinReset(
        email: email,
        newPin: '888999',
        confirmPin: '888999',
      );
      expect(reset['success'], isTrue);

      // Login with old PIN fails
      final oldPinLogin = await auth.loginWithEmailAndPin(email: email, pin: '654321');
      expect(oldPinLogin['success'], isFalse);

      // Login with new PIN succeeds
      final newPinLogin = await auth.loginWithEmailAndPin(email: email, pin: '888999');
      expect(newPinLogin['success'], isTrue);
    });

    test('KYC Level 2 upgrade: National ID and personal info with pending review', () async {
      const email = 'newuser@pethar.io';

      final sub = await auth.submitKycLevel2(
        email: email,
        nationalIdNo: 'ARAK-NAT-88210',
        dob: '1998-07-20',
        fullName: 'Ko Min Min',
        address: 'Bogyoke Rd, Sittwe',
      );
      expect(sub['success'], isTrue);
      final user = sub['user'] as StoredUser;
      expect(user.kycStatus, 'PENDING_REVIEW');
      expect(user.kycTier, 1); // Remains at 1 while waiting for review

      // Administrative Review approval
      final app = await auth.approveKycLevel2(email: email);
      expect(app['success'], isTrue);
      final approvedUser = app['user'] as StoredUser;
      expect(approvedUser.kycTier, 2); // Upgraded to KYC Level 2
      expect(approvedUser.kycStatus, 'VERIFIED_LVL2');
    });
  });
}
