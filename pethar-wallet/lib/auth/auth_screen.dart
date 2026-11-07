import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../core/services/native_security_service.dart';
import '../core/services/supabase_service.dart';
import '../widgets/arakan_emblem.dart';
import '../widgets/pin_keypad_screen.dart';

/// Explicit conditional routes for Authentication & Signup Flow:
/// Step 1: Enter Email OR Login/Sign up with Google (dispatches 6-digit OTP email)
/// Step 2: Verify 6-digit Email OTP
/// Step 3: Enter 6-digit PIN OR Authenticate with Device Fingerprint / Face ID -> Homepage
enum AuthFlowState {
  emailLogin, // Step 1 (Login): Enter Email or Login with Google
  loginOtp, // Step 2 (Login): Verify 6-digit Email OTP
  loginPinOrBiometric, // Step 3 (Login): Enter 6-digit PIN or Fingerprint / Face ID -> Home
  emailSignup, // Step 1 (Sign Up): Enter Email or Sign up with Google
  signupOtp, // Step 2 (Sign Up): Verify 6-digit Email OTP
  signupPinOrBiometric, // Step 3 (Sign Up): Set 6-digit PIN or Fingerprint / Face ID -> Home
  forgotPasswordEmail,
  forgotPasswordOtp,
  forgotPasswordNewPin,
}

/// Custom Clipper creating the smooth parabolic downward curved bottom banner
class CurvedBannerClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.lineTo(0, size.height - 35);
    path.quadraticBezierTo(
      size.width / 2,
      size.height + 25,
      size.width,
      size.height - 35,
    );
    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}

class AuthScreen extends StatefulWidget {
  const AuthScreen({Key? key}) : super(key: key);

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  AuthFlowState _flowState = AuthFlowState.emailLogin;

  // Active email & optional Google display name for current flow
  String _activeEmail = '';
  String _googleName = '';

  // Controllers - Login
  final TextEditingController _loginEmailCtrl = TextEditingController();
  final TextEditingController _loginOtpCtrl = TextEditingController();
  final TextEditingController _loginPinCtrl = TextEditingController();
  bool _showLoginPin = false;

  // Controllers - Sign Up
  final TextEditingController _signUpEmailCtrl = TextEditingController();
  final TextEditingController _signUpOtpCtrl = TextEditingController();
  final TextEditingController _signUpPinCtrl = TextEditingController();
  final TextEditingController _signUpConfirmPinCtrl = TextEditingController();
  bool _showSignUpPin = false;
  bool _showSignUpConfirmPin = false;

  // Controllers - Forgot PIN
  final TextEditingController _forgotEmailCtrl = TextEditingController();
  final TextEditingController _forgotOtpCtrl = TextEditingController();
  final TextEditingController _forgotNewPinCtrl = TextEditingController();
  final TextEditingController _forgotConfirmPinCtrl = TextEditingController();
  bool _showForgotNewPin = false;
  bool _showForgotConfirmPin = false;

  // Multi-step keypad states for Sign Up (Create PIN -> Confirm PIN)
  String _signUpCreatedPin = '';
  bool _isConfirmingSignUpPin = false;

  // Multi-step keypad states for Forgot PIN (Create New PIN -> Confirm New PIN)
  String _forgotCreatedPin = '';
  bool _isConfirmingForgotPin = false;

  // Feedback & Loading
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  // 10-Minute Timer for OTP
  Timer? _countdownTimer;
  int _secondsRemaining = 600; // 10 minutes = 600 seconds

  @override
  void initState() {
    super.initState();
    _loginEmailCtrl.addListener(_onFieldChanged);
    _loginOtpCtrl.addListener(_onFieldChanged);
    _loginPinCtrl.addListener(_onFieldChanged);
    _signUpEmailCtrl.addListener(_onFieldChanged);
    _signUpOtpCtrl.addListener(_onFieldChanged);
    _signUpPinCtrl.addListener(_onFieldChanged);
    _signUpConfirmPinCtrl.addListener(_onFieldChanged);
    _forgotEmailCtrl.addListener(_onFieldChanged);
    _forgotOtpCtrl.addListener(_onFieldChanged);
    _forgotNewPinCtrl.addListener(_onFieldChanged);
    _forgotConfirmPinCtrl.addListener(_onFieldChanged);
  }

  void _onFieldChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _loginEmailCtrl.dispose();
    _loginOtpCtrl.dispose();
    _loginPinCtrl.dispose();
    _signUpEmailCtrl.dispose();
    _signUpOtpCtrl.dispose();
    _signUpPinCtrl.dispose();
    _signUpConfirmPinCtrl.dispose();
    _forgotEmailCtrl.dispose();
    _forgotOtpCtrl.dispose();
    _forgotNewPinCtrl.dispose();
    _forgotConfirmPinCtrl.dispose();
    super.dispose();
  }

  void _startTimer() {
    _countdownTimer?.cancel();
    setState(() => _secondsRemaining = 600);
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        timer.cancel();
      }
    });
  }

  String _formatTimer(int totalSecs) {
    final m = (totalSecs ~/ 60).toString().padLeft(2, '0');
    final s = (totalSecs % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1A: EMAIL SUBMIT (LOGIN & SIGN UP) -> SEND OTP EMAIL -> GO TO OTP PAGE
  // ─────────────────────────────────────────────────────────────────────────
  Future<void> _handleEmailSubmit(AppState appState, {required bool isSignUp}) async {
    final rawEmail = isSignUp
        ? _signUpEmailCtrl.text.trim()
        : _loginEmailCtrl.text.trim();
    final email = rawEmail.toLowerCase();
    final isAk = appState.language == 'ak';

    if (email.isEmpty || !email.contains('@') || !email.contains('.')) {
      setState(() {
        _errorMessage = isAk
            ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ'
            : 'Please enter a valid email address';
        _successMessage = null;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    final res = await appState.requestAuthEmailOtp(
      email: email,
      isSignUp: isSignUp,
    );
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      _activeEmail = email;
      _googleName = '';
      _startTimer();
      if (isSignUp) {
        _signUpOtpCtrl.clear();
        setState(() {
          _flowState = AuthFlowState.signupOtp;
          _successMessage = isAk
              ? '$email သို့ ၆ လုံးပါ OTP ကုဒ် ပို့ပြီးပါပြီ'
              : '6-digit OTP code sent to $email';
        });
      } else {
        _loginOtpCtrl.clear();
        setState(() {
          _flowState = AuthFlowState.loginOtp;
          _successMessage = isAk
              ? '$email သို့ ၆ လုံးပါ OTP ကုဒ် ပို့ပြီးပါပြီ'
              : '6-digit OTP code sent to $email';
        });
      }
    } else {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk
                ? 'အတည်ပြုကုဒ် ပို့ခြင်း မအောင်မြင်ပါ'
                : 'Failed to send verification email');
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1B: GOOGLE LOGIN / SIGN UP -> SEND OTP EMAIL -> GO TO OTP PAGE
  // ─────────────────────────────────────────────────────────────────────────
  Future<void> _handleGoogleAuthTap(
    BuildContext context,
    AppState appState, {
    required bool isSignUp,
  }) async {
    final isAk = appState.language == 'ak';
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    String? googleEmail;
    String? googleName;

    try {
      if (SupabaseService.isInitialized) {
        await SupabaseService().signInWithGoogle();
        final user = SupabaseService().currentUser;
        if (user?.email != null && user!.email!.trim().isNotEmpty) {
          googleEmail = user.email!.trim().toLowerCase();
          googleName = user.userMetadata?['full_name']?.toString() ??
              user.userMetadata?['name']?.toString() ??
              '';
        }
      }
    } catch (e) {
      debugPrint('Supabase Google Sign-In note: $e');
    }

    if (!mounted) return;
    setState(() => _isLoading = false);

    // If the user already typed their email in the input field, use it if OAuth browser redirect hasn't returned yet
    if (googleEmail == null || googleEmail.isEmpty) {
      final typed = (isSignUp ? _signUpEmailCtrl.text : _loginEmailCtrl.text)
          .trim()
          .toLowerCase();
      if (typed.isNotEmpty && typed.contains('@') && typed.contains('.')) {
        googleEmail = typed;
      }
    }

    // If still empty, prompt the user to enter their Google email address (never use any fake/demo email)
    if (googleEmail == null || googleEmail.isEmpty) {
      if (!context.mounted) return;
      googleEmail = await _promptGoogleEmailDialog(context, isAk);
      if (googleEmail == null || googleEmail.isEmpty) {
        return;
      }
    }

    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final res = await appState.requestAuthEmailOtp(
      email: googleEmail,
      isSignUp: isSignUp,
    );
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      _activeEmail = googleEmail;
      _googleName = googleName ?? '';
      if (isSignUp) {
        _signUpEmailCtrl.text = googleEmail;
        _signUpOtpCtrl.clear();
      } else {
        _loginEmailCtrl.text = googleEmail;
        _loginOtpCtrl.clear();
      }
      _startTimer();
      setState(() {
        _flowState =
            isSignUp ? AuthFlowState.signupOtp : AuthFlowState.loginOtp;
        _successMessage = isAk
            ? '$googleEmail သို့ ၆ လုံးပါ OTP ကုဒ် ပို့ပြီးပါပြီ'
            : '6-digit OTP code sent to $googleEmail';
      });
    } else {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk
                ? 'အတည်ပြုကုဒ် ပို့ခြင်း မအောင်မြင်ပါ'
                : 'Failed to send verification email');
      });
    }
  }

  Future<String?> _promptGoogleEmailDialog(
      BuildContext context, bool isAk) async {
    final emailCtrl = TextEditingController();
    String? dialogError;

    return showDialog<String>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Dialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Center(
                        child: Text(
                          'G',
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 18,
                            color: Color(0xFF4285F4),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        isAk
                            ? 'Google အီးမေးလ် ထည့်သွင်းပါ'
                            : 'Continue with Google',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF111827),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  isAk
                      ? 'သင်၏ Google အီးမေးလ်သို့ ၆ လုံးပါ အတည်ပြုကုဒ် (OTP) ပေးပို့ပါမည်။'
                      : 'Enter your Google email address to receive your 6-digit verification OTP.',
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF4B5563),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  autofocus: true,
                  decoration: InputDecoration(
                    hintText:
                        isAk ? 'သင့် Google အီးမေးလ်' : 'yourname@gmail.com',
                    filled: true,
                    fillColor: const Color(0xFFF9FAFB),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                    ),
                  ),
                ),
                if (dialogError != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    dialogError!,
                    style: const TextStyle(
                      color: Color(0xFFDC2626),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20)),
                        ),
                        child: Text(isAk ? 'ပယ်ဖျက်မည်' : 'Cancel'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          final val = emailCtrl.text.trim().toLowerCase();
                          if (val.isEmpty ||
                              !val.contains('@') ||
                              !val.contains('.')) {
                            setModalState(() {
                              dialogError = isAk
                                  ? 'မှန်ကန်သော အီးမေးလ် ထည့်ပါ'
                                  : 'Please enter a valid email address';
                            });
                            return;
                          }
                          Navigator.pop(ctx, val);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: crimson,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20)),
                        ),
                        child: Text(
                          isAk ? 'OTP ပို့မည်' : 'Send OTP',
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: VERIFY 6-DIGIT EMAIL OTP -> NEXT PAGE (PIN OR BIOMETRICS)
  // ─────────────────────────────────────────────────────────────────────────
  Future<void> _handleOtpVerify(AppState appState, {required bool isSignUp}) async {
    final otp = isSignUp
        ? _signUpOtpCtrl.text.trim()
        : _loginOtpCtrl.text.trim();
    final email = _activeEmail.isNotEmpty
        ? _activeEmail
        : (isSignUp
            ? _signUpEmailCtrl.text.trim().toLowerCase()
            : _loginEmailCtrl.text.trim().toLowerCase());
    final isAk = appState.language == 'ak';

    if (otp.length != 6) {
      setState(() {
        _errorMessage = isAk
            ? '၆ လုံးပါ အတည်ပြုကုဒ် ရိုက်ထည့်ပါ'
            : 'Please enter the 6-digit OTP code';
        _successMessage = null;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    final res = await appState.verifyAuthEmailOtp(
      email: email,
      otp: otp,
      isSignUp: isSignUp,
    );
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      _activeEmail = email;
      if (isSignUp) {
        _signUpPinCtrl.clear();
        _signUpConfirmPinCtrl.clear();
        setState(() {
          _flowState = AuthFlowState.signupPinOrBiometric;
          _successMessage = isAk
              ? 'အီးမေးလ် အတည်ပြုပြီးပါပြီ။ ၆ လုံး PIN သို့မဟုတ် လက်ဗွေ / Face ID ဖြင့် ဆက်သွားပါ။'
              : 'Email verified! Enter a 6-digit PIN or use Fingerprint / Face ID.';
        });
      } else {
        _loginPinCtrl.clear();
        setState(() {
          _flowState = AuthFlowState.loginPinOrBiometric;
          _successMessage = isAk
              ? 'အီးမေးလ် အတည်ပြုပြီးပါပြီ။ ၆ လုံး PIN သို့မဟုတ် လက်ဗွေ / Face ID ဖြင့် ဝင်ရောက်ပါ။'
              : 'Email verified! Enter your 6-digit PIN or use Fingerprint / Face ID.';
        });
      }
    } else {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk
                ? 'အတည်ပြုကုဒ် မှားယွင်းနေပါသည်'
                : 'Incorrect or expired OTP code');
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3A: SUBMIT 6-DIGIT PIN -> SUCCESS TO HOMEPAGE
  // ─────────────────────────────────────────────────────────────────────────
  Future<void> _handlePinSubmit(
    AppState appState, {
    required bool isSignUp,
    String? explicitPin,
    String? explicitConfirmPin,
  }) async {
    final isAk = appState.language == 'ak';
    final email = _activeEmail.isNotEmpty
        ? _activeEmail
        : (isSignUp
            ? _signUpEmailCtrl.text.trim().toLowerCase()
            : _loginEmailCtrl.text.trim().toLowerCase());
    final pin = explicitPin ??
        (isSignUp
            ? _signUpPinCtrl.text.trim()
            : _loginPinCtrl.text.trim());
    final confirmPin =
        explicitConfirmPin ?? (isSignUp ? _signUpConfirmPinCtrl.text.trim() : null);

    if (pin.length != 6 || !RegExp(r'^\d{6}$').hasMatch(pin)) {
      setState(() {
        _errorMessage = isAk
            ? '၆ လုံးပါ ပင်နံပါတ် ရိုက်ထည့်ပါ'
            : 'PIN must be exactly 6 digits';
        _successMessage = null;
      });
      return;
    }

    if (isSignUp && pin != confirmPin) {
      setState(() {
        _errorMessage = isAk
            ? 'ပင်နံပါတ် နှစ်ခု တူညီမှု မရှိပါ'
            : 'PIN and Confirm PIN do not match';
        _successMessage = null;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    final res = await appState.completeAuthWithPin(
      email: email,
      pin: pin,
      confirmPin: confirmPin,
      isSignUp: isSignUp,
      displayName: _googleName.isNotEmpty ? _googleName : null,
    );
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] != true) {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk
                ? 'ပင်နံပါတ် အတည်ပြုခြင်း မအောင်မြင်ပါ'
                : 'Failed to verify 6-digit PIN');
      });
    }
    // On success: appState.isAuthenticated becomes true and routes directly to Homepage!
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3B: AUTHENTICATE WITH DEVICE FINGERPRINT OR FACE ID -> HOMEPAGE
  // ─────────────────────────────────────────────────────────────────────────
  Future<void> _handleBiometricAuth(
    AppState appState, {
    required bool isSignUp,
  }) async {
    final isAk = appState.language == 'ak';
    final email = _activeEmail.isNotEmpty
        ? _activeEmail
        : (isSignUp
            ? _signUpEmailCtrl.text.trim().toLowerCase()
            : _loginEmailCtrl.text.trim().toLowerCase());

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    final verified = await NativeSecurityService().authenticateBiometrics(
      reason: isAk
          ? 'Péthar အကောင့်သို့ လက်ဗွေ သို့မဟုတ် Face ID ဖြင့် ဝင်ရောက်ရန် အတည်ပြုပါ'
          : 'Authenticate with Fingerprint or Face ID to access your Péthar Wallet',
    );

    if (!mounted) return;

    if (!verified) {
      setState(() {
        _isLoading = false;
        _errorMessage = isAk
            ? 'လက်ဗွေ / Face ID အတည်ပြုချက် မအောင်မြင်ပါ။ ၆ လုံး PIN ဖြင့် ဝင်ရောက်နိုင်ပါသည်။'
            : 'Fingerprint / Face ID verification cancelled or unavailable. You may enter your 6-digit PIN.';
      });
      return;
    }

    final res = await appState.completeAuthWithBiometrics(
      email: email,
      isSignUp: isSignUp,
      displayName: _googleName.isNotEmpty ? _googleName : null,
    );
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] != true) {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk
                ? 'အကောင့်ဝင်ရောက်ခြင်း မအောင်မြင်ပါ'
                : 'Biometric authentication failed');
      });
    }
    // On success: appState.isAuthenticated becomes true and routes directly to Homepage!
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD / PIN FLOW HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  Future<void> _handleForgotEmailSubmit(AppState appState) async {
    final email = _forgotEmailCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (email.isEmpty || !email.contains('@')) {
      setState(() {
        _errorMessage =
            isAk ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter a valid email';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final res = await appState.requestPinResetOtp(email);
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      _startTimer();
      _forgotOtpCtrl.clear();
      _forgotNewPinCtrl.clear();
      _forgotConfirmPinCtrl.clear();
      setState(() {
        _flowState = AuthFlowState.forgotPasswordNewPin;
      });
    } else {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk ? 'အီးမေးလ်ပို့ခြင်း မအောင်မြင်ပါ' : 'Failed to send reset email');
      });
    }
  }

  Future<void> _handleForgotOtpSubmit(AppState appState) async {
    final email = _forgotEmailCtrl.text.trim();
    final otp = _forgotOtpCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (otp.length != 6) {
      setState(() {
        _errorMessage =
            isAk ? '၆ လုံးပါ အတည်ပြုကုဒ် ရိုက်ထည့်ပါ' : 'Please enter the 6-digit OTP';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final res = await appState.verifyPinResetOtp(email, otp);
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      _forgotNewPinCtrl.clear();
      _forgotConfirmPinCtrl.clear();
      setState(() {
        _flowState = AuthFlowState.forgotPasswordNewPin;
      });
    } else {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk ? 'အတည်ပြုကုဒ် မှားယွင်းနေပါသည်' : 'Incorrect or expired OTP');
      });
    }
  }

  Future<void> _handleForgotConfirmPinSubmit(
    AppState appState, {
    String? explicitNewPin,
    String? explicitConfirmPin,
  }) async {
    final email = _forgotEmailCtrl.text.trim().isNotEmpty
        ? _forgotEmailCtrl.text.trim()
        : _activeEmail;
    final otp = _forgotOtpCtrl.text.trim();
    final newPin = explicitNewPin ?? _forgotNewPinCtrl.text.trim();
    final confirm = explicitConfirmPin ?? _forgotConfirmPinCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (otp.length != 6) {
      setState(() {
        _errorMessage =
            isAk ? '၆ လုံးပါ အတည်ပြုကုဒ် ရိုက်ထည့်ပါ' : 'Please enter the 6-digit Email OTP';
      });
      return;
    }
    if (newPin.length != 6) {
      setState(() {
        _errorMessage =
            isAk ? '၆ လုံးပါ ပင်နံပါတ် သတ်မှတ်ပါ' : 'New PIN must be exactly 6 digits';
      });
      return;
    }
    if (newPin != confirm) {
      setState(() {
        _errorMessage =
            isAk ? 'ပင်နံပါတ် နှစ်ခု တူညီမှု မရှိပါ' : 'PIN and Confirm PIN do not match';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    // 1. Verify OTP first
    final otpRes = await appState.verifyPinResetOtp(email, otp);
    if (!mounted) return;
    if (otpRes['success'] != true) {
      setState(() {
        _isLoading = false;
        _errorMessage = otpRes['error']?.toString() ??
            (isAk ? 'အတည်ပြုကုဒ် မှားယွင်းနေပါသည်' : 'Incorrect or expired OTP code');
      });
      return;
    }

    // 2. Save New PIN
    final res = await appState.confirmPinReset(
      email: email,
      newPin: newPin,
      confirmPin: confirm,
    );
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      setState(() {
        _flowState = AuthFlowState.emailLogin;
        _successMessage = isAk
            ? 'ပင်နံပါတ် အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။ အကောင့်ဝင်ရောက်နိုင်ပါပြီ။'
            : 'PIN reset successfully! Please log in.';
      });
    } else {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk ? 'PIN ပြောင်းလဲခြင်း မအောင်မြင်ပါ' : 'Failed to update PIN');
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UI BUILD & DYNAMIC SCREEN / FORM BLOCK SWITCHING
  // ─────────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAk = appState.language == 'ak';

    // ── STEP 3 (LOGIN): ENTER PIN SCREEN (Matching Reference Card Style) ──
    if (_flowState == AuthFlowState.loginPinOrBiometric) {
      return _buildEnterPinScreen(context, appState, isAk);
    }

    // ── STEP 3 (SIGN UP): SET UP PIN SCREEN (Matching Reference Card Style) ──
    if (_flowState == AuthFlowState.signupPinOrBiometric) {
      return _buildSetupPinScreen(context, appState, isAk);
    }

    // ── FORGOT PIN / RESET PIN VIEW (Image 2) ──
    if (_flowState == AuthFlowState.forgotPasswordNewPin) {
      return _buildForgotPasswordNewPinScreen(context, appState, isAk);
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        physics: const ClampingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Curved Hero Banner
            _buildHeroBanner(context, appState, isAk),

            // 2. Dynamic Form Block based on exact AuthFlowState
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: _buildDynamicFlowBlock(context, appState, isAk),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDynamicFlowBlock(
      BuildContext context, AppState appState, bool isAk) {
    switch (_flowState) {
      case AuthFlowState.emailLogin:
        return _buildEmailLoginForm(context, appState, isAk);
      case AuthFlowState.loginOtp:
        return _buildOtpForm(context, appState, isAk, isSignUp: false);
      case AuthFlowState.loginPinOrBiometric:
        return _buildPinOrBiometricForm(context, appState, isAk, isSignUp: false);
      case AuthFlowState.emailSignup:
        return _buildEmailSignupForm(context, appState, isAk);
      case AuthFlowState.signupOtp:
        return _buildOtpForm(context, appState, isAk, isSignUp: true);
      case AuthFlowState.signupPinOrBiometric:
        return _buildPinOrBiometricForm(context, appState, isAk, isSignUp: true);
      case AuthFlowState.forgotPasswordEmail:
        return _buildForgotPasswordEmailForm(context, appState, isAk);
      case AuthFlowState.forgotPasswordOtp:
        return _buildForgotPasswordOtpForm(context, appState, isAk);
      case AuthFlowState.forgotPasswordNewPin:
        return _buildForgotPasswordNewPinScreen(context, appState, isAk);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HERO BANNER & BRANDING
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildHeroBanner(BuildContext context, AppState appState, bool isAk) {
    const double bannerHeight = 245.0;

    final canGoBack = _flowState != AuthFlowState.emailLogin &&
        _flowState != AuthFlowState.emailSignup;

    return ClipPath(
      clipper: CurvedBannerClipper(),
      child: Container(
        height: bannerHeight,
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF280C48),
              Color(0xFF4C104B),
              Color(0xFF86163C),
              Color(0xFFC72138),
              Color(0xFFDD3347),
            ],
            stops: [0.0, 0.28, 0.58, 0.84, 1.0],
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (canGoBack)
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _errorMessage = null;
                            _successMessage = null;
                            if (_flowState == AuthFlowState.loginOtp ||
                                _flowState == AuthFlowState.forgotPasswordEmail) {
                              _flowState = AuthFlowState.emailLogin;
                            } else if (_flowState ==
                                AuthFlowState.loginPinOrBiometric) {
                              _flowState = AuthFlowState.loginOtp;
                            } else if (_flowState == AuthFlowState.signupOtp) {
                              _flowState = AuthFlowState.emailSignup;
                            } else if (_flowState ==
                                AuthFlowState.signupPinOrBiometric) {
                              _flowState = AuthFlowState.signupOtp;
                            } else if (_flowState ==
                                AuthFlowState.forgotPasswordOtp) {
                              _flowState = AuthFlowState.forgotPasswordEmail;
                            } else if (_flowState ==
                                AuthFlowState.forgotPasswordNewPin) {
                              _flowState = AuthFlowState.forgotPasswordOtp;
                            }
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.15),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.arrow_back_rounded,
                              color: Colors.white, size: 20),
                        ),
                      )
                    else
                      const SizedBox(width: 36),
                    _buildLanguageTogglePill(appState, isAk),
                  ],
                ),
                const Spacer(),
                const Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    ArakanEmblem(size: 44),
                    SizedBox(width: 14),
                    Text(
                      'Péthar',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 30,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 34),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLanguageTogglePill(AppState appState, bool isAk) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.25),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: () => appState.setLanguage('ak'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: isAk ? Colors.white : Colors.transparent,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const FlagArakan(width: 18),
                  const SizedBox(width: 5),
                  Text(
                    'AK',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: isAk ? const Color(0xFFC72138) : Colors.white70,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 3),
          GestureDetector(
            onTap: () => appState.setLanguage('en'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: !isAk ? Colors.white : Colors.transparent,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const FlagGB(width: 18),
                  const SizedBox(width: 5),
                  Text(
                    'EN',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: !isAk ? const Color(0xFFC72138) : Colors.white70,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 (LOGIN): ENTER EMAIL OR LOGIN WITH GOOGLE
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildEmailLoginForm(
      BuildContext context, AppState appState, bool isAk) {
    final canSubmit = _loginEmailCtrl.text.trim().isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          isAk ? 'အကောင့်ဝင်ရန်' : 'Log In',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: Color(0xFF111827),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          isAk
              ? 'အီးမေးလ် ရိုက်ထည့်ပါ သို့မဟုတ် Google ဖြင့် ဝင်ရောက်ပါ'
              : 'Enter your email or log in with Google',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
          ),
        ),
        const SizedBox(height: 24),

        _buildTextFieldLabel(isAk ? 'အီးမေးလ်' : 'Email Address'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _loginEmailCtrl,
          hintText: isAk ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email',
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 20),

        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk ? 'ရှေ့သို့ ဆက်သွားမည်' : 'Continue',
          isLoading: _isLoading,
          enabled: canSubmit,
          onPressed: () => _handleEmailSubmit(appState, isSignUp: false),
        ),
        const SizedBox(height: 16),

        _buildDividerWithText(isAk ? 'သို့မဟုတ်' : 'OR'),
        const SizedBox(height: 16),

        _buildGoogleButton(
          label: isAk ? 'Google ဖြင့် ဝင်ရောက်မည်' : 'Log in with Google',
          onTap: () => _handleGoogleAuthTap(context, appState, isSignUp: false),
        ),
        const SizedBox(height: 24),

        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              isAk ? 'အကောင့်မရှိသေးပါသလား? ' : "Don't have an account? ",
              style: const TextStyle(fontSize: 13.5, color: Color(0xFF4B5563)),
            ),
            GestureDetector(
              onTap: () {
                setState(() {
                  _errorMessage = null;
                  _successMessage = null;
                  _flowState = AuthFlowState.emailSignup;
                });
              },
              child: Text(
                isAk ? 'အကောင့်ဖွင့်မည်' : 'Sign Up',
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w700,
                  color: crimson,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 (SIGN UP): ENTER EMAIL OR SIGN UP WITH GOOGLE
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildEmailSignupForm(
      BuildContext context, AppState appState, bool isAk) {
    final canSubmit = _signUpEmailCtrl.text.trim().isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          isAk ? 'အကောင့်အသစ်ဖွင့်ရန်' : 'Sign Up',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: Color(0xFF111827),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          isAk
              ? 'အီးမေးလ် ရိုက်ထည့်ပါ သို့မဟုတ် Google ဖြင့် အကောင့်ဖွင့်ပါ'
              : 'Enter your email or sign up with Google',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
          ),
        ),
        const SizedBox(height: 24),

        _buildTextFieldLabel(isAk ? 'အီးမေးလ်' : 'Email Address'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _signUpEmailCtrl,
          hintText: isAk ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email',
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 20),

        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk ? 'ရှေ့သို့ ဆက်သွားမည်' : 'Continue',
          isLoading: _isLoading,
          enabled: canSubmit,
          onPressed: () => _handleEmailSubmit(appState, isSignUp: true),
        ),
        const SizedBox(height: 16),

        _buildDividerWithText(isAk ? 'သို့မဟုတ်' : 'OR'),
        const SizedBox(height: 16),

        _buildGoogleButton(
          label: isAk ? 'Google ဖြင့် အကောင့်ဖွင့်မည်' : 'Sign up with Google',
          onTap: () => _handleGoogleAuthTap(context, appState, isSignUp: true),
        ),
        const SizedBox(height: 24),

        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              isAk ? 'အကောင့်ရှိပြီးသားလား? ' : 'Already have an account? ',
              style: const TextStyle(fontSize: 13.5, color: Color(0xFF4B5563)),
            ),
            GestureDetector(
              onTap: () {
                setState(() {
                  _errorMessage = null;
                  _successMessage = null;
                  _flowState = AuthFlowState.emailLogin;
                });
              },
              child: Text(
                isAk ? 'အကောင့်ဝင်မည်' : 'Log In',
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w700,
                  color: crimson,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: VERIFY 6-DIGIT EMAIL OTP PAGE
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildOtpForm(
    BuildContext context,
    AppState appState,
    bool isAk, {
    required bool isSignUp,
  }) {
    final ctrl = isSignUp ? _signUpOtpCtrl : _loginOtpCtrl;
    final email = _activeEmail.isNotEmpty
        ? _activeEmail
        : (isSignUp
            ? _signUpEmailCtrl.text.trim()
            : _loginEmailCtrl.text.trim());
    final canVerify = ctrl.text.trim().length == 6;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Top Red/Blush Alert Banner matching Reference Design (replacing yellow box)
        Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFFFFF1F2),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFFECDD3)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Icon(
                Icons.check_circle_outline_rounded,
                size: 20,
                color: Color(0xFFD91624),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  isAk
                      ? '$email သို့ ၆ လုံးပါ OTP ကုဒ် ပို့ပြီးပါပြီ'
                      : '6-digit OTP code sent to $email',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1E293B),
                    height: 1.35,
                  ),
                ),
              ),
            ],
          ),
        ),

        // 2. White Card with Key Icon Input matching Image 2
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: Row(
            children: [
              const Icon(Icons.vpn_key_outlined, color: Colors.black38, size: 22),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: ctrl,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 2,
                  ),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    counterText: '',
                    hintText: isAk ? '၆ လုံးပါ Email OTP ရိုက်ထည့်ပါ' : 'Enter 6-digit Email OTP',
                    hintStyle: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 14,
                      letterSpacing: 0,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${isAk ? 'သက်တမ်းကျန်ချိန်' : 'Expires in'}: ${_formatTimer(_secondsRemaining)}',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Color(0xFF64748B),
              ),
            ),
            TextButton(
              onPressed: _isLoading
                  ? null
                  : () => _handleEmailSubmit(appState, isSignUp: isSignUp),
              child: Text(
                isAk ? 'ကုဒ် အသစ်ပြန်ပို့ပါ' : 'Resend Email OTP',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFD91624),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        if (_errorMessage != null)
          Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFFECACA)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline, color: Color(0xFFDC2626), size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(
                      color: Color(0xFFDC2626),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

        // Confirm Button (Red #D91624)
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton(
            onPressed: canVerify && !_isLoading
                ? () => _handleOtpVerify(appState, isSignUp: isSignUp)
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD91624),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text(isAk ? 'အတည်ပြုမည်' : 'Confirm', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          ),
        ),
        const SizedBox(height: 20),

        // Security Note matching Image 1 & Image 2
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAk ? 'မှတ်ချက်:' : 'Note:',
                style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.bold, fontSize: 12),
              ),
              const SizedBox(height: 4),
              Text(
                isAk ? '- သင်၏ လျှို့ဝှက် OTP ကုဒ်အား မည်သူ့ကိုမျှ မမျှဝေပါနှင့်။' : '- Please do not share your OTP with anyone.',
                style: const TextStyle(color: Color(0xFFDC2626), fontSize: 11.5, height: 1.4),
              ),
              const SizedBox(height: 2),
              Text(
                isAk
                    ? '- မွေးသက္ကရာဇ်၊ မှတ်ပုံတင် သို့မဟုတ် ဖုန်းနံပါတ်ကဲ့သို့သော ကိုယ်ရေးအချက်အလက်များကို မမျှဝေပါနှင့်။'
                    : '- Please do not use your personal information such as Date of Birth, NRIC or Passport Number and Phone Number as PIN.',
                style: const TextStyle(color: Color(0xFFDC2626), fontSize: 11.5, height: 1.4),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: 6-DIGIT PIN OR DEVICE FINGERPRINT / FACE ID -> HOMEPAGE
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildPinOrBiometricForm(
    BuildContext context,
    AppState appState,
    bool isAk, {
    required bool isSignUp,
  }) {
    final isAndroid = Theme.of(context).platform == TargetPlatform.android;
    final canSubmitPin = isSignUp
        ? (_signUpPinCtrl.text.trim().length == 6 &&
            _signUpConfirmPinCtrl.text.trim().length == 6)
        : (_loginPinCtrl.text.trim().length == 6);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          isSignUp
              ? (isAk
                  ? '၆ လုံး PIN သို့မဟုတ် လက်ဗွေ / Face ID'
                  : 'Set 6-Digit PIN or Biometrics')
              : (isAk
                  ? '၆ လုံး PIN သို့မဟုတ် လက်ဗွေ / Face ID'
                  : 'Enter 6-Digit PIN or Biometrics'),
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: Color(0xFF111827),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          isSignUp
              ? (isAk
                  ? 'သင်၏ ပိုက်ဆံအိတ်အတွက် ဂဏန်း ၆ လုံး PIN သတ်မှတ်ပါ သို့မဟုတ် စက်ပစ္စည်း လက်ဗွေ / Face ID အသုံးပြုပါ'
                  : 'Create a 6-digit PIN or authenticate with your device Fingerprint or Face ID to enter Homepage')
              : (isAk
                  ? 'ဂဏန်း ၆ လုံး PIN ရိုက်ထည့်ပါ သို့မဟုတ် စက်ပစ္စည်း လက်ဗွေ / Face ID ဖြင့် ဝင်ရောက်ပါ'
                  : 'Enter your 6-digit PIN or unlock with device Fingerprint or Face ID to enter Homepage'),
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
            height: 1.4,
          ),
        ),
        const SizedBox(height: 22),

        if (!isSignUp) ...[
          _buildTextFieldLabel(isAk ? '၆ လုံးပါ ပင်နံပါတ်' : '6-Digit PIN'),
          const SizedBox(height: 8),
          _buildInputField(
            controller: _loginPinCtrl,
            hintText: '••••••',
            keyboardType: TextInputType.number,
            maxLength: 6,
            obscureText: !_showLoginPin,
            textAlign: TextAlign.center,
            letterSpacing: 8,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: 8,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _showLoginPin
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                size: 20,
                color: const Color(0xFF374151),
              ),
              onPressed: () => setState(() => _showLoginPin = !_showLoginPin),
            ),
          ),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerRight,
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _errorMessage = null;
                  _successMessage = null;
                  _forgotEmailCtrl.text = _activeEmail;
                  _flowState = AuthFlowState.forgotPasswordEmail;
                });
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Text(
                  isAk ? 'PIN မေ့နေပါသလား?' : 'Forgot PIN?',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: crimson,
                  ),
                ),
              ),
            ),
          ),
        ] else ...[
          _buildTextFieldLabel(
              isAk ? '၆ လုံးပါ PIN အသစ် သတ်မှတ်ပါ' : 'Create 6-Digit PIN'),
          const SizedBox(height: 8),
          _buildInputField(
            controller: _signUpPinCtrl,
            hintText: '••••••',
            keyboardType: TextInputType.number,
            maxLength: 6,
            obscureText: !_showSignUpPin,
            textAlign: TextAlign.center,
            letterSpacing: 8,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: 8,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _showSignUpPin
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                size: 20,
                color: const Color(0xFF374151),
              ),
              onPressed: () =>
                  setState(() => _showSignUpPin = !_showSignUpPin),
            ),
          ),
          const SizedBox(height: 14),
          _buildTextFieldLabel(
              isAk ? 'ပင်နံပါတ် ပြန်လည်အတည်ပြုပါ' : 'Confirm 6-Digit PIN'),
          const SizedBox(height: 8),
          _buildInputField(
            controller: _signUpConfirmPinCtrl,
            hintText: '••••••',
            keyboardType: TextInputType.number,
            maxLength: 6,
            obscureText: !_showSignUpConfirmPin,
            textAlign: TextAlign.center,
            letterSpacing: 8,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: 8,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _showSignUpConfirmPin
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                size: 20,
                color: const Color(0xFF374151),
              ),
              onPressed: () => setState(
                  () => _showSignUpConfirmPin = !_showSignUpConfirmPin),
            ),
          ),
        ],

        const SizedBox(height: 18),
        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk
              ? 'PIN ဖြင့် အိမ်မျက်နှာပြင်သို့ ဝင်မည်'
              : 'Continue with 6-Digit PIN',
          isLoading: _isLoading,
          enabled: canSubmitPin,
          onPressed: () => _handlePinSubmit(appState, isSignUp: isSignUp),
        ),
        const SizedBox(height: 16),

        _buildDividerWithText(isAk ? 'သို့မဟုတ်' : 'OR'),
        const SizedBox(height: 16),

        // Device Fingerprint or Face ID Button
        SizedBox(
          height: 54,
          child: OutlinedButton(
            onPressed: _isLoading
                ? null
                : () => _handleBiometricAuth(appState, isSignUp: isSignUp),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFC72138), width: 1.4),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(28)),
              backgroundColor: const Color(0xFFFFF1F2),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  isAndroid
                      ? Icons.fingerprint_rounded
                      : Icons.face_unlock_outlined,
                  color: const Color(0xFFC72138),
                  size: 24,
                ),
                const SizedBox(width: 10),
                Text(
                  isAk
                      ? 'လက်ဗွေ သို့မဟုတ် Face ID ဖြင့် ဝင်မည်'
                      : 'Use Device Fingerprint or Face ID',
                  style: const TextStyle(
                    color: Color(0xFFC72138),
                    fontSize: 14.5,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD / PIN VIEW BLOCKS
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildForgotPasswordEmailForm(
      BuildContext context, AppState appState, bool isAk) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          isAk ? 'ပင်နံပါတ် ပြန်လည်ရယူရန်' : 'Forgot 6-Digit PIN',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: Color(0xFF111827),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          isAk
              ? 'မှတ်ပုံတင်ထားသော အီးမေးလ် ထည့်သွင်းပါ'
              : 'Enter your registered email address to receive a verification code',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
          ),
        ),
        const SizedBox(height: 24),

        _buildTextFieldLabel(isAk ? 'အီးမေးလ်' : 'Email'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _forgotEmailCtrl,
          hintText: isAk ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email',
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 18),

        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk ? 'အတည်ပြုကုဒ် ပို့မည်' : 'Send Verification Code',
          isLoading: _isLoading,
          enabled: _forgotEmailCtrl.text.trim().isNotEmpty,
          onPressed: () => _handleForgotEmailSubmit(appState),
        ),
      ],
    );
  }

  Widget _buildForgotPasswordOtpForm(
      BuildContext context, AppState appState, bool isAk) {
    final email = _forgotEmailCtrl.text.trim().isNotEmpty
        ? _forgotEmailCtrl.text.trim()
        : _activeEmail;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Top Red/Blush Alert Container matching Reference Design
        Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFFFFF1F2),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFFECDD3)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Icon(
                Icons.check_circle_outline_rounded,
                size: 20,
                color: Color(0xFFD91624),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  isAk
                      ? '$email သို့ ၆ လုံးပါ OTP ကုဒ် ပို့ပြီးပါပြီ'
                      : '6-digit OTP code sent to $email',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1E293B),
                    height: 1.35,
                  ),
                ),
              ),
            ],
          ),
        ),

        // 2. White Card with Key Icon Input
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: Row(
            children: [
              const Icon(Icons.vpn_key_outlined, color: Colors.black38, size: 22),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _forgotOtpCtrl,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 2,
                  ),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    counterText: '',
                    hintText: isAk ? '၆ လုံးပါ Email OTP ရိုက်ထည့်ပါ' : 'Enter 6-digit Email OTP',
                    hintStyle: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 14,
                      letterSpacing: 0,
                    ),
                  ),
                  onChanged: (_) {
                    if (_errorMessage != null) setState(() => _errorMessage = null);
                  },
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${isAk ? "သက်တမ်းကျန်ချိန်" : "Expires in"}: ${_formatTimer(_secondsRemaining)}',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Color(0xFF64748B),
              ),
            ),
            TextButton(
              onPressed: _isLoading
                  ? null
                  : () => _handleForgotEmailSubmit(appState),
              child: Text(
                isAk ? 'ကုဒ် အသစ်ပြန်ပို့ပါ' : 'Resend Code',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFD91624),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk ? 'အတည်ပြုမည်' : 'Verify Code',
          isLoading: _isLoading,
          enabled: _forgotOtpCtrl.text.trim().length == 6,
          onPressed: () => _handleForgotOtpSubmit(appState),
        ),
      ],
    );
  }

  Widget _buildForgotPasswordNewPinScreen(
      BuildContext context, AppState appState, bool isAk) {
    if (!_isConfirmingForgotPin) {
      return PinKeypadScreen(
        title: isAk ? 'PIN အသစ် သတ်မှတ်ပါ' : 'Create New PIN',
        subtitle: isAk ? 'ဂဏန်း ၆ လုံးပါသော PIN အသစ် ရိုက်ထည့်ပါ' : 'Enter a new 6-digit PIN',
        isAk: isAk,
        errorMessage: _errorMessage,
        isLoading: _isLoading,
        showBiometrics: false,
        onBack: () {
          setState(() {
            _errorMessage = null;
            _flowState = AuthFlowState.forgotPasswordOtp;
          });
        },
        onPinCompleted: (pin) {
          setState(() {
            _forgotCreatedPin = pin;
            _isConfirmingForgotPin = true;
            _errorMessage = null;
          });
        },
      );
    } else {
      return PinKeypadScreen(
        title: isAk ? 'PIN အသစ် ထပ်မံအတည်ပြုပါ' : 'Confirm New PIN',
        subtitle: isAk ? 'အတည်ပြုရန် PIN အသစ်အား ထပ်မံရိုက်ထည့်ပါ' : 'Re-enter your new 6-digit PIN',
        isAk: isAk,
        errorMessage: _errorMessage,
        isLoading: _isLoading,
        showBiometrics: false,
        onBack: () {
          setState(() {
            _isConfirmingForgotPin = false;
            _errorMessage = null;
          });
        },
        onPinCompleted: (pin) {
          if (pin != _forgotCreatedPin) {
            setState(() {
              _errorMessage = isAk
                  ? 'PIN နံပါတ် မတူညီပါ။ ပြန်လည်ရိုက်ထည့်ပါ'
                  : 'PIN does not match. Please try again.';
              _isConfirmingForgotPin = false;
            });
          } else {
            _handleForgotConfirmPinSubmit(
              appState,
              explicitNewPin: _forgotCreatedPin,
              explicitConfirmPin: pin,
            );
          }
        },
      );
    }
  }

  Widget _buildEnterPinScreen(
      BuildContext context, AppState appState, bool isAk) {
    return PinKeypadScreen(
      title: isAk ? 'PIN နံပါတ် ရိုက်ထည့်ပါ' : 'Enter PIN',
      subtitle: isAk ? 'ဆက်လက်ဆောင်ရွက်ရန် သင်၏ PIN နံပါတ် ၆ လုံး ရိုက်ထည့်ပါ' : 'Enter your 6-digit PIN',
      isAk: isAk,
      errorMessage: _errorMessage,
      isLoading: _isLoading,
      showBiometrics: true,
      onBack: () {
        setState(() {
          _errorMessage = null;
          _flowState = AuthFlowState.loginOtp;
        });
      },
      onBiometricPressed: () => _handleBiometricAuth(appState, isSignUp: false),
      onPinCompleted: (pin) {
        _handlePinSubmit(appState, isSignUp: false, explicitPin: pin);
      },
      onForgotPassword: () {
        setState(() {
          _errorMessage = null;
          _successMessage = null;
          _forgotEmailCtrl.text = _activeEmail;
          _flowState = AuthFlowState.forgotPasswordEmail;
        });
      },
    );
  }

  Widget _buildSetupPinScreen(
      BuildContext context, AppState appState, bool isAk) {
    if (!_isConfirmingSignUpPin) {
      return PinKeypadScreen(
        title: isAk ? 'PIN အသစ် သတ်မှတ်ပါ' : 'Create PIN',
        subtitle: isAk ? 'ဂဏန်း ၆ လုံးပါသော PIN အသစ် ရိုက်ထည့်ပါ' : 'Enter a 6-digit PIN',
        isAk: isAk,
        errorMessage: _errorMessage,
        isLoading: _isLoading,
        showBiometrics: false,
        onBack: () {
          setState(() {
            _errorMessage = null;
            _flowState = AuthFlowState.signupOtp;
          });
        },
        onPinCompleted: (pin) {
          setState(() {
            _signUpCreatedPin = pin;
            _isConfirmingSignUpPin = true;
            _errorMessage = null;
          });
        },
      );
    } else {
      return PinKeypadScreen(
        title: isAk ? 'PIN နံပါတ် အတည်ပြုပါ' : 'Confirm PIN',
        subtitle: isAk ? 'အတည်ပြုရန် PIN အား ထပ်မံရိုက်ထည့်ပါ' : 'Re-enter your 6-digit PIN',
        isAk: isAk,
        errorMessage: _errorMessage,
        isLoading: _isLoading,
        showBiometrics: false,
        onBack: () {
          setState(() {
            _isConfirmingSignUpPin = false;
            _errorMessage = null;
          });
        },
        onPinCompleted: (pin) {
          if (pin != _signUpCreatedPin) {
            setState(() {
              _errorMessage = isAk
                  ? 'PIN နံပါတ် မတူညီပါ။ ပြန်လည်ရိုက်ထည့်ပါ'
                  : 'PIN does not match. Please try again.';
              _isConfirmingSignUpPin = false;
            });
          } else {
            _handlePinSubmit(
              appState,
              isSignUp: true,
              explicitPin: _signUpCreatedPin,
              explicitConfirmPin: pin,
            );
          }
        },
      );
    }
  }

  Widget _buildTextFieldLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: Color(0xFF1F2937),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String hintText,
    TextInputType keyboardType = TextInputType.text,
    int? maxLength,
    bool obscureText = false,
    Widget? suffixIcon,
    TextAlign textAlign = TextAlign.start,
    double? letterSpacing,
    TextStyle? style,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLength: maxLength,
      obscureText: obscureText,
      textAlign: textAlign,
      style: style ??
          const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: Color(0xFF111827),
          ),
      decoration: InputDecoration(
        counterText: '',
        hintText: hintText,
        hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14.5),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        filled: true,
        fillColor: Colors.white,
        suffixIcon: suffixIcon,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(28),
          borderSide: const BorderSide(color: Color(0xFFE5E7EB), width: 1.2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(28),
          borderSide: const BorderSide(color: Color(0xFFE5E7EB), width: 1.2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(28),
          borderSide: const BorderSide(color: crimson, width: 1.5),
        ),
      ),
    );
  }

  Widget _buildPrimaryButton({
    required String title,
    required bool isLoading,
    required bool enabled,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      height: 52,
      child: ElevatedButton(
        onPressed: (isLoading || !enabled) ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: crimson,
          disabledBackgroundColor: crimson.withValues(alpha: 0.35),
          foregroundColor: Colors.white,
          disabledForegroundColor: Colors.white.withValues(alpha: 0.9),
          elevation: 0,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        ),
        child: isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: Colors.white),
              )
            : Text(
                title,
                style:
                    const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
      ),
    );
  }

  Widget _buildGoogleButton({
    required String label,
    required VoidCallback onTap,
  }) {
    return SizedBox(
      height: 50,
      child: OutlinedButton(
        onPressed: _isLoading ? null : onTap,
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Color(0xFFE5E7EB), width: 1.2),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          backgroundColor: Colors.white,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 22,
              height: 22,
              decoration: const BoxDecoration(shape: BoxShape.circle),
              child: const Center(
                child: Text(
                  'G',
                  style: TextStyle(
                    fontFamily: 'Roboto',
                    fontWeight: FontWeight.w900,
                    fontSize: 18,
                    color: Color(0xFF4285F4),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Text(
              label,
              style: const TextStyle(
                color: Color(0xFF374151),
                fontSize: 14.5,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDividerWithText(String text) {
    return Row(
      children: [
        const Expanded(
            child: Divider(color: Color(0xFFE5E7EB), thickness: 1)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF9CA3AF),
            ),
          ),
        ),
        const Expanded(
            child: Divider(color: Color(0xFFE5E7EB), thickness: 1)),
      ],
    );
  }

  Widget _buildStatusBanner() {
    if (_errorMessage != null) {
      return Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
        decoration: BoxDecoration(
          color: const Color(0xFFFEF2F2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFFECDD3)),
        ),
        child: Row(
          children: [
            const Icon(Icons.error_outline_rounded,
                size: 18, color: Color(0xFFDC2626)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _errorMessage!,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFB91C1C),
                ),
              ),
            ),
          ],
        ),
      );
    }
    if (_successMessage != null) {
      return Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
        decoration: BoxDecoration(
          color: const Color(0xFFFFF1F2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFFECDD3)),
        ),
        child: Row(
          children: [
            const Icon(Icons.check_circle_outline_rounded,
                size: 18, color: crimson),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _successMessage!,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1E293B),
                ),
              ),
            ),
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }
}
