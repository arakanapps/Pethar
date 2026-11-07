import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../core/services/native_security_service.dart';
import '../widgets/pin_keypad_screen.dart';

/// Full-screen security gate shown on cold start whenever a saved session is
/// restored, so the wallet is never opened without re-entering the PIN.
class AppLockScreen extends StatefulWidget {
  const AppLockScreen({Key? key}) : super(key: key);

  @override
  State<AppLockScreen> createState() => _AppLockScreenState();
}

class _AppLockScreenState extends State<AppLockScreen> {
  bool _isUnlocking = false;
  String? _errorMessage;

  Future<void> _submitPin(AppState appState, bool isAk, String pin) async {
    setState(() {
      _isUnlocking = true;
      _errorMessage = null;
    });

    final unlocked = await appState.unlockWithPin(pin);
    if (!mounted) return;

    setState(() {
      _isUnlocking = false;
      if (!unlocked) {
        _errorMessage = isAk
            ? 'PIN မှားယွင်းနေပါသည်။ ထပ်မံကြိုးစားပါ'
            : 'Incorrect PIN. Please try again.';
      }
    });
  }

  Future<void> _unlockWithBiometrics(AppState appState, bool isAk) async {
    setState(() {
      _isUnlocking = true;
      _errorMessage = null;
    });

    final verified = await NativeSecurityService().authenticateBiometrics(
      reason: isAk
          ? 'Péthar ပိုက်ဆံအိတ်ကို ဖွင့်ရန် လက်ဗွေ သို့မဟုတ် Face ID ဖြင့် အတည်ပြုပါ'
          : 'Authenticate with Fingerprint or Face ID to unlock Péthar',
    );
    if (!mounted) return;

    if (verified) {
      // The shell listens to AppState and switches to the wallet immediately.
      appState.unlockWithBiometrics();
      return;
    }

    setState(() {
      _isUnlocking = false;
      _errorMessage = isAk
          ? 'လက်ဗွေ / Face ID အတည်ပြုချက် မအောင်မြင်ပါ။ PIN ဖြင့် ဝင်ရောက်ပါ။'
          : 'Fingerprint / Face ID failed. Enter your PIN instead.';
    });
  }

  Future<void> _handleForgotPin(AppState appState, bool isAk) async {
    final shouldSignOut = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(isAk ? 'PIN ပြန်လည်သတ်မှတ်မလား?' : 'Reset your PIN?'),
        content: Text(
          isAk
              ? 'PIN အသစ် သတ်မှတ်ရန် အကောင့်မှ ထွက်ပြီး အီးမေးလ်နှင့် ပြန်လည်ဝင်ရောက်ပါ။'
              : 'You will be signed out and can log in again with your email and OTP to set a new PIN.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: Text(isAk ? 'မလုပ်တော့ပါ' : 'Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: Text(isAk ? 'ထွက်မည်' : 'Sign out'),
          ),
        ],
      ),
    );

    if (shouldSignOut == true) {
      await appState.signOut();
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAk = appState.language == 'ak';
    final customerName = appState.profile.username.trim().isNotEmpty
        ? appState.profile.username.trim()
        : appState.profile.name.trim();

    return PinKeypadScreen(
      title: isAk ? 'PIN ရိုက်ထည့်ပါ' : 'Enter PIN',
      subtitle: customerName.isNotEmpty
          ? (isAk
              ? 'ပြန်လည်ကြိုဆိုပါသည်၊ $customerName'
              : 'Welcome back, $customerName')
          : (isAk
              ? 'သင့်ပိုက်ဆံအိတ်ကို ဖွင့်ရန် PIN ၆ လုံး ရိုက်ထည့်ပါ'
              : 'Enter your 6-digit PIN to unlock your wallet'),
      isAk: isAk,
      errorMessage: _errorMessage,
      isLoading: _isUnlocking,
      showBiometrics: true,
      versionText: 'Version 1.0.0',
      onPinCompleted: (pin) => _submitPin(appState, isAk, pin),
      onBiometricPressed: () => _unlockWithBiometrics(appState, isAk),
      onForgotPassword: () => _handleForgotPin(appState, isAk),
    );
  }
}
