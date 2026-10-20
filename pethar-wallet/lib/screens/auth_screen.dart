import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../services/supabase_service.dart';
import '../widgets/arakan_emblem.dart';

enum AuthMode { login, signup, forgotPassword }

enum ForgotPasswordStep { enterEmail, enterOtp, createNewPin }

enum SignUpStep { enterCredentials, verifyOtp, createIdentity }

/// Custom Clipper creating the smooth parabolic downward curved bottom banner
class CurvedBannerClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.lineTo(0, size.height - 35);
    // Smooth quadratic curve dipping downward in the center
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
  AuthMode _mode = AuthMode.login;

  // Controllers - Login
  final TextEditingController _loginEmailCtrl = TextEditingController();
  final TextEditingController _loginPinCtrl = TextEditingController();
  bool _showLoginPin = false;
  String? _loginError;
  bool _isLoading = false;

  // Controllers - Forgot Password / PIN
  ForgotPasswordStep _forgotStep = ForgotPasswordStep.enterEmail;
  final TextEditingController _forgotEmailCtrl = TextEditingController();
  final TextEditingController _forgotOtpCtrl = TextEditingController();
  final TextEditingController _forgotNewPinCtrl = TextEditingController();
  final TextEditingController _forgotConfirmPinCtrl = TextEditingController();
  bool _showForgotNewPin = false;
  bool _showForgotConfirmPin = false;
  String? _forgotError;
  String? _forgotSuccessMessage;

  // Controllers - Sign Up
  SignUpStep _signUpStep = SignUpStep.enterCredentials;
  final TextEditingController _signUpEmailCtrl = TextEditingController();
  final TextEditingController _signUpPinCtrl = TextEditingController();
  final TextEditingController _signUpConfirmPinCtrl = TextEditingController();
  final TextEditingController _signUpOtpCtrl = TextEditingController();
  final TextEditingController _signUpNameCtrl = TextEditingController();
  final TextEditingController _signUpUsernameCtrl = TextEditingController();
  bool _showSignUpPin = false;
  bool _showSignUpConfirmPin = false;
  String? _signUpError;

  // 10-Minute Timer for OTP
  Timer? _countdownTimer;
  int _secondsRemaining = 600; // 10 minutes = 600 seconds

  @override
  void initState() {
    super.initState();
    _loginEmailCtrl.addListener(_onFieldChanged);
    _loginPinCtrl.addListener(_onFieldChanged);
    _signUpEmailCtrl.addListener(_onFieldChanged);
    _signUpPinCtrl.addListener(_onFieldChanged);
    _signUpConfirmPinCtrl.addListener(_onFieldChanged);
    _forgotEmailCtrl.addListener(_onFieldChanged);
  }

  void _onFieldChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _loginEmailCtrl.removeListener(_onFieldChanged);
    _loginPinCtrl.removeListener(_onFieldChanged);
    _signUpEmailCtrl.removeListener(_onFieldChanged);
    _signUpPinCtrl.removeListener(_onFieldChanged);
    _signUpConfirmPinCtrl.removeListener(_onFieldChanged);
    _forgotEmailCtrl.removeListener(_onFieldChanged);

    _loginEmailCtrl.dispose();
    _loginPinCtrl.dispose();
    _forgotEmailCtrl.dispose();
    _forgotOtpCtrl.dispose();
    _forgotNewPinCtrl.dispose();
    _forgotConfirmPinCtrl.dispose();
    _signUpEmailCtrl.dispose();
    _signUpPinCtrl.dispose();
    _signUpConfirmPinCtrl.dispose();
    _signUpOtpCtrl.dispose();
    _signUpNameCtrl.dispose();
    _signUpUsernameCtrl.dispose();
    super.dispose();
  }

  void _startTimer() {
    _countdownTimer?.cancel();
    setState(() => _secondsRemaining = 600); // strictly 10 minutes
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
  // LOGIN ACTION
  // ─────────────────────────────────────────────────────────────────────────
  Future<void> _handleLogin(AppState appState) async {
    final email = _loginEmailCtrl.text.trim();
    final pin = _loginPinCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (email.isEmpty) {
      setState(() {
        _loginError = isAk ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter your email address';
      });
      return;
    }
    if (pin.isEmpty || pin.length != 6) {
      setState(() {
        _loginError = isAk ? '၆ လုံးပါ ပင်နံပါတ် ရိုက်ထည့်ပါ' : 'Please enter your 6-digit PIN code';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _loginError = null;
    });

    final res = await appState.loginWithEmailAndPin(email: email, pin: pin);

    if (!mounted) return;

    if (res['success'] == true && res['requiresOtp'] == true) {
      final otp = await _promptLoginOtp(email, isAk);
      if (otp == null) {
        setState(() => _isLoading = false);
        return;
      }
      final verified = await SupabaseService().verifyEmailOtp(email, otp);
      if (verified) {
        final retry = await appState.loginWithEmailAndPin(email: email, pin: pin);
        if (!mounted) return;
        setState(() => _isLoading = false);
        if (retry['success'] == true) return;
      }
      setState(() {
        _isLoading = false;
        _loginError = isAk
            ? 'အတည်ပြုကုဒ် မှားယွင်းနေပါသည်'
            : 'Incorrect or expired verification code';
      });
      return;
    }

    setState(() => _isLoading = false);

    if (res['success'] == true) {
      // Successfully authenticated -> user taken into app!
    } else {
      setState(() {
        _loginError = isAk
            ? 'အီးမေးလ် သို့မဟုတ် ပင်နံပါတ် မှားယွင်းနေပါသည်'
            : 'Wrong email or PIN code';
      });
    }
  }

  Future<String?> _promptLoginOtp(String email, bool isAk) async {
    final controller = TextEditingController();
    final otp = await showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        title: Text(
          isAk ? 'အီးမေးလ် အတည်ပြုပါ' : 'Verify your email',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isAk
                  ? '$email သို့ ပို့ထားသော ၆ လုံး ကုဒ်ကို ထည့်ပါ။'
                  : 'Enter the 6-digit code sent to $email.',
              style: const TextStyle(fontSize: 12.5, color: Color(0xFF71717A), height: 1.4),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: controller,
              autofocus: true,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 22, letterSpacing: 8, fontWeight: FontWeight.w700),
              decoration: const InputDecoration(counterText: '', hintText: '••••••'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(null),
            child: Text(isAk ? 'မလုပ်တော့ပါ' : 'Cancel'),
          ),
          FilledButton(
            onPressed: () {
              final value = controller.text.trim();
              if (value.length == 6) {
                Navigator.of(dialogContext).pop(value);
              }
            },
            child: Text(isAk ? 'အတည်ပြုမည်' : 'Verify'),
          ),
        ],
      ),
    );
    controller.dispose();
    return otp;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD / PIN RESET FLOW
  // ─────────────────────────────────────────────────────────────────────────
  void _startForgotPasswordFlow({String? prefilledEmail}) {
    setState(() {
      _mode = AuthMode.forgotPassword;
      _forgotStep = ForgotPasswordStep.enterEmail;
      _forgotError = null;
      _forgotSuccessMessage = null;
      _forgotOtpCtrl.clear();
      _forgotNewPinCtrl.clear();
      _forgotConfirmPinCtrl.clear();
      if (prefilledEmail != null && prefilledEmail.isNotEmpty) {
        _forgotEmailCtrl.text = prefilledEmail;
      } else if (_loginEmailCtrl.text.trim().isNotEmpty) {
        _forgotEmailCtrl.text = _loginEmailCtrl.text.trim();
      }
    });
  }

  Future<void> _handleSendResetOtp(AppState appState) async {
    final email = _forgotEmailCtrl.text.trim();
    final isAk = appState.language == 'ak';
    if (email.isEmpty || !email.contains('@')) {
      setState(() {
        _forgotError = isAk ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter a valid email address';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _forgotError = null;
    });

    final res = await appState.requestPinResetOtp(email);
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      _startTimer();
      setState(() {
        _forgotStep = ForgotPasswordStep.enterOtp;
        _forgotSuccessMessage = isAk
            ? 'အတည်ပြုကုဒ် ၆ လုံးကို $email သို့ ပို့ပေးထားပါသည် (မိနစ် ၁၀ အတွင်း အကျုံးဝင်သည်)'
            : '6-digit OTP code sent to $email (Valid for 10 minutes)';
        _forgotOtpCtrl.clear();
      });
    } else {
      setState(() {
        _forgotError = res['error']?.toString() ?? 'Failed to send OTP. Please try again.';
      });
    }
  }

  Future<void> _handleVerifyResetOtp(AppState appState) async {
    final email = _forgotEmailCtrl.text.trim();
    final otp = _forgotOtpCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (otp.length != 6) {
      setState(() {
        _forgotError = isAk ? 'အတည်ပြုကုဒ် ၆ လုံး ရိုက်ထည့်ပါ' : 'Please enter the 6-digit OTP code';
      });
      return;
    }

    if (_secondsRemaining <= 0) {
      setState(() {
        _forgotError = isAk
            ? 'အတည်ပြုကုဒ် သက်တမ်းကုန်သွားပါပြီ။ အီးမေးလ် ပြန်လည်ပို့မည် ကို နှိပ်ပါ'
            : 'Verification code has expired. Please tap Resend Email.';
      });
      return;
    }

    setState(() => _isLoading = true);
    final res = await appState.verifyPinResetOtp(email, otp);
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (res['success'] == true) {
      _countdownTimer?.cancel();
      setState(() {
        _forgotStep = ForgotPasswordStep.createNewPin;
        _forgotError = null;
        _forgotSuccessMessage = isAk
            ? 'အီးမေးလ် အတည်ပြုပြီးပါပြီ။ ၆ လုံးပါ ပင်နံပါတ်အသစ် သတ်မှတ်ပါ'
            : 'Email verified. Please choose your new 6-digit PIN.';
      });
    } else {
      setState(() {
        _forgotError = isAk
            ? 'အတည်ပြုကုဒ် မှားယွင်းနေပါသည် သို့မဟုတ် သက်တမ်းကုန်သွားပါပြီ'
            : (res['error']?.toString() ?? 'Incorrect or expired OTP code.');
      });
    }
  }

  Future<void> _handleConfirmPinReset(AppState appState) async {
    final email = _forgotEmailCtrl.text.trim();
    final newPin = _forgotNewPinCtrl.text.trim();
    final confirmPin = _forgotConfirmPinCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (newPin.length != 6 || !RegExp(r'^\d{6}$').hasMatch(newPin)) {
      setState(() {
        _forgotError = isAk ? 'ပင်နံပါတ်အသစ်သည် ဂဏန်း ၆ လုံး ဖြစ်ရပါမည်' : 'New PIN must be exactly 6 digits';
      });
      return;
    }
    if (newPin != confirmPin) {
      setState(() {
        _forgotError = isAk ? 'ပင်နံပါတ် နှစ်ကြိမ်ရိုက်ထည့်မှု မကိုက်ညီပါ' : 'PIN confirmation does not match';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _forgotError = null;
    });

    final res = await appState.confirmPinReset(
      email: email,
      newPin: newPin,
      confirmPin: confirmPin,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      setState(() {
        _mode = AuthMode.login;
        _loginEmailCtrl.text = email;
        _loginPinCtrl.text = newPin;
        _loginError = null;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isAk
                ? 'ပင်နံပါတ် အသစ် ပြောင်းလဲပြီးပါပြီ။ ကျေးဇူးပြု၍ ဝင်ရောက်ပါ'
                : 'PIN reset successfully! Please log in with your new PIN.',
            style: const TextStyle(fontWeight: FontWeight.w700),
          ),
          backgroundColor: const Color(0xFF059669),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      );
    } else {
      setState(() {
        _forgotError = res['error']?.toString() ?? 'Failed to update PIN.';
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SIGN UP FLOW
  // ─────────────────────────────────────────────────────────────────────────
  Future<void> _handleSignUpStep1(AppState appState) async {
    final email = _signUpEmailCtrl.text.trim();
    final pin = _signUpPinCtrl.text.trim();
    final confirmPin = _signUpConfirmPinCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (email.isEmpty || !email.contains('@')) {
      setState(() {
        _signUpError = isAk ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter a valid email address';
      });
      return;
    }
    if (pin.length != 6 || !RegExp(r'^\d{6}$').hasMatch(pin)) {
      setState(() {
        _signUpError = isAk ? 'ပင်နံပါတ်သည် ဂဏန်း ၆ လုံး ဖြစ်ရပါမည်' : 'PIN must be exactly 6 digits';
      });
      return;
    }
    if (pin != confirmPin) {
      setState(() {
        _signUpError = isAk ? 'ပင်နံပါတ် နှစ်ကြိမ်ရိုက်ထည့်မှု မကိုက်ညီပါ' : 'PIN confirmation does not match';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _signUpError = null;
    });

    final res = await appState.initiateSignUp(
      email: email,
      pin: pin,
      confirmPin: confirmPin,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      _startTimer();
      setState(() {
        _signUpStep = SignUpStep.verifyOtp;
        _signUpOtpCtrl.clear();
      });
    } else {
      setState(() {
        _signUpError = res['error']?.toString() ?? 'Sign up initialization failed.';
      });
    }
  }

  Future<void> _handleSignUpStep2(AppState appState) async {
    final email = _signUpEmailCtrl.text.trim();
    final otp = _signUpOtpCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (otp.length != 6) {
      setState(() {
        _signUpError = isAk ? 'အတည်ပြုကုဒ် ၆ လုံး ရိုက်ထည့်ပါ' : 'Please enter the 6-digit OTP code';
      });
      return;
    }

    if (_secondsRemaining <= 0) {
      setState(() {
        _signUpError = isAk
            ? 'အတည်ပြုကုဒ် သက်တမ်းကုန်သွားပါပြီ။ အီးမေးလ် ပြန်လည်ပို့မည် ကို နှိပ်ပါ'
            : 'Verification code has expired. Please tap Resend Email.';
      });
      return;
    }

    setState(() => _isLoading = true);
    final res = await appState.verifySignUpOtp(email, otp);
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (res['success'] == true) {
      _countdownTimer?.cancel();
      final derivedUsername = email.split('@').first;
      setState(() {
        _signUpStep = SignUpStep.createIdentity;
        _signUpError = null;
        if (_signUpUsernameCtrl.text.isEmpty) {
          _signUpUsernameCtrl.text = '@$derivedUsername';
        }
        if (_signUpNameCtrl.text.isEmpty) {
          _signUpNameCtrl.text = derivedUsername.isNotEmpty
              ? '${derivedUsername[0].toUpperCase()}${derivedUsername.substring(1)}'
              : 'Citizen';
        }
      });
    } else {
      setState(() {
        _signUpError = isAk
            ? 'အတည်ပြုကုဒ် မှားယွင်းနေပါသည် သို့မဟုတ် သက်တမ်းကုန်သွားပါပြီ'
            : (res['error']?.toString() ?? 'Incorrect or expired OTP code.');
      });
    }
  }

  Future<void> _handleSignUpStep3(AppState appState) async {
    final email = _signUpEmailCtrl.text.trim();
    final name = _signUpNameCtrl.text.trim();
    final username = _signUpUsernameCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (name.isEmpty) {
      setState(() {
        _signUpError = isAk ? 'အမည် အပြည့်အစုံ ရိုက်ထည့်ပါ' : 'Please enter your full name';
      });
      return;
    }
    if (username.isEmpty) {
      setState(() {
        _signUpError = isAk ? 'အသုံးပြုသူ အမည် ရိုက်ထည့်ပါ' : 'Please enter a username';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _signUpError = null;
    });

    final res = await appState.completeSignUp(
      email: email,
      name: name,
      username: username,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      // Completed KYC Level 1 -> logs in directly to app!
    } else {
      setState(() {
        _signUpError = res['error']?.toString() ?? 'Failed to complete registration.';
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UI BUILD
  // ─────────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAk = appState.language == 'ak';

    return Scaffold(
      backgroundColor: Colors.white,
      body: _mode == AuthMode.forgotPassword
          ? _buildForgotPasswordScaffold(context, appState, isAk)
          : _buildStandardAuthScaffold(context, appState, isAk),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STANDARD AUTH SCAFFOLD (LOGIN & SIGN UP WITH CURVED HERO BANNER)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildStandardAuthScaffold(BuildContext context, AppState appState, bool isAk) {
    return SingleChildScrollView(
      physics: const ClampingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Curved Hero Banner
          _buildHeroBanner(context, appState, isAk),

          // 2. Main Page Content (Log In or Register)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            child: _mode == AuthMode.login
                ? _buildLoginView(context, appState, isAk)
                : _buildSignUpView(context, appState, isAk),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOP CURVED HERO BANNER (SPRING DEVELOPMENT BANK BRANDING & LANGUAGE PILL)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildHeroBanner(BuildContext context, AppState appState, bool isAk) {
    const double bannerHeight = 245.0;

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
              Color(0xFF280C48), // Deep purple
              Color(0xFF4C104B), // Plum
              Color(0xFF86163C), // Crimson wine
              Color(0xFFC72138), // Vibrant scarlet
              Color(0xFFDD3347), // Bright red
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
                    // Top Bar: Back Button (if sub-step in Sign Up) & Language Selector Pill
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (_mode == AuthMode.signup && _signUpStep != SignUpStep.enterCredentials)
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                if (_signUpStep == SignUpStep.createIdentity) {
                                  _signUpStep = SignUpStep.verifyOtp;
                                } else {
                                  _signUpStep = SignUpStep.enterCredentials;
                                }
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                            ),
                          )
                        else
                          const SizedBox(width: 36),

                        // Language Toggle Pill (MM / EN)
                        _buildLanguageTogglePill(appState, isAk),
                      ],
                    ),

                    const Spacer(),

                    // Centered Péthar Logo & Typography
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

  // Language Pill Widget [ 🇲🇲 MM | 🇬🇧 EN ]
  Widget _buildLanguageTogglePill(AppState appState, bool isAk) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF140D2B).withValues(alpha: 0.65),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
      ),
      padding: const EdgeInsets.all(3.5),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // AK (Arakan) Option
          GestureDetector(
            onTap: () => appState.setLanguage('ak'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: isAk ? const Color(0xFFF97316) : Colors.transparent,
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
                      color: Colors.white,
                      fontWeight: isAk ? FontWeight.w800 : FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
          // EN Option
          GestureDetector(
            onTap: () => appState.setLanguage('en'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: !isAk ? const Color(0xFFF97316) : Colors.transparent,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const FlagGB(width: 17),
                  const SizedBox(width: 5),
                  Text(
                    'EN',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: !isAk ? FontWeight.w800 : FontWeight.w600,
                      fontSize: 12,
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
  // 1. LOG IN VIEW (MATCHING IMAGE 3 & 4)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildLoginView(BuildContext context, AppState appState, bool isAk) {
    final email = _loginEmailCtrl.text.trim();
    final pin = _loginPinCtrl.text.trim();
    final bool canSubmit = email.isNotEmpty && pin.length == 6;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Heading
        Text(
          isAk ? 'အကောင့်ဝင်ရန်' : 'Log In',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: Color(0xFF111827),
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 6),
        // Subtitle
        Text(
          isAk ? 'ဖေ့သာ ဝေါလက်မှ ကြိုဆိုပါသည်' : 'Welcome to Pethar Wallet',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
          ),
        ),
        const SizedBox(height: 26),

        // Email Label
        Text(
          isAk ? 'အီးမေးလ်' : 'Email',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 8),
        // Email Input Field (Pill Shape)
        TextField(
          controller: _loginEmailCtrl,
          keyboardType: TextInputType.emailAddress,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: Color(0xFF111827)),
          decoration: InputDecoration(
            hintText: isAk ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email',
            hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14.5),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
            filled: true,
            fillColor: Colors.white,
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
              borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5),
            ),
          ),
        ),
        const SizedBox(height: 18),

        // PIN Label (Replaces Password per user request to match app using PIN)
        Text(
          isAk ? '၆ လုံးပါ ပင်နံပါတ်' : 'PIN',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 8),
        // PIN Input Field (Pill Shape with Eye Toggle)
        TextField(
          controller: _loginPinCtrl,
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: !_showLoginPin,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: Color(0xFF111827),
          ),
          decoration: InputDecoration(
            counterText: '',
            hintText: isAk ? 'ပင်နံပါတ် ၆ လုံး ရိုက်ထည့်ပါ' : 'Enter your PIN',
            hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14.5),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
            filled: true,
            fillColor: Colors.white,
            suffixIcon: IconButton(
              icon: Icon(
                _showLoginPin ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                size: 20,
                color: const Color(0xFF374151),
              ),
              onPressed: () => setState(() => _showLoginPin = !_showLoginPin),
            ),
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
              borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5),
            ),
          ),
        ),
        const SizedBox(height: 10),

        // Forget Password / PIN Link (Right Aligned)
        Align(
          alignment: Alignment.centerRight,
          child: GestureDetector(
            onTap: () => _startForgotPasswordFlow(prefilledEmail: _loginEmailCtrl.text.trim()),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Text(
                isAk ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forget Password?',
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFF97316), // Warm orange
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),

        // Error message banner if any
        if (_loginError != null) ...[
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFFECDD3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline_rounded, size: 18, color: Color(0xFFDC2626)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _loginError!,
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFB91C1C),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
        ],

        // Log In Button (Soft peach when incomplete, vibrant orange when ready)
        SizedBox(
          height: 52,
          child: ElevatedButton(
            onPressed: (_isLoading || !canSubmit) ? null : () => _handleLogin(appState),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF97316),
              disabledBackgroundColor: const Color(0xFFFED7AA), // Light peach matching screenshots
              foregroundColor: Colors.white,
              disabledForegroundColor: Colors.white.withValues(alpha: 0.9),
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
            ),
            child: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : Text(
                    isAk ? 'အကောင့်ဝင်မည်' : 'Log In',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
          ),
        ),
        const SizedBox(height: 26),

        // Don't have an account? Register
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
                  _mode = AuthMode.signup;
                  _signUpStep = SignUpStep.enterCredentials;
                  _signUpError = null;
                });
              },
              child: Text(
                isAk ? 'အကောင့်ဖွင့်မည်' : 'Register',
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFF97316),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. REGISTER YOUR ACCOUNT VIEW (MATCHING IMAGE 2)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildSignUpView(BuildContext context, AppState appState, bool isAk) {
    if (_signUpStep == SignUpStep.verifyOtp) {
      return _buildSignUpOtpStep(context, appState, isAk);
    }
    if (_signUpStep == SignUpStep.createIdentity) {
      return _buildSignUpIdentityStep(context, appState, isAk);
    }

    final email = _signUpEmailCtrl.text.trim();
    final pin = _signUpPinCtrl.text.trim();
    final confirmPin = _signUpConfirmPinCtrl.text.trim();

    final bool isPinLengthValid = pin.length == 6;
    final bool isPinNumeric = RegExp(r'^\d+$').hasMatch(pin);
    final bool isPinMatch = confirmPin.isNotEmpty && confirmPin == pin;
    final bool canSubmit = email.contains('@') && isPinLengthValid && isPinNumeric && isPinMatch;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Title
        Text(
          isAk ? 'အကောင့်သစ်ဖွင့်ရန်' : 'Register Your Account',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: Color(0xFF111827),
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 6),
        // Subtitle: Already have an account? Log In
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
                  _mode = AuthMode.login;
                  _loginError = null;
                });
              },
              child: Text(
                isAk ? 'အကောင့်ဝင်မည်' : 'Log In',
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFF97316),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Email Label
        Text(
          isAk ? 'အီးမေးလ်' : 'Email',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _signUpEmailCtrl,
          keyboardType: TextInputType.emailAddress,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: Color(0xFF111827)),
          decoration: InputDecoration(
            hintText: isAk ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email',
            hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14.5),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
            filled: true,
            fillColor: Colors.white,
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
              borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5),
            ),
          ),
        ),
        const SizedBox(height: 18),

        // PIN Label (Replaces Password per user request to match app using PIN)
        Text(
          isAk ? '၆ လုံးပါ ပင်နံပါတ်' : 'PIN',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _signUpPinCtrl,
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: !_showSignUpPin,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF111827)),
          decoration: InputDecoration(
            counterText: '',
            hintText: isAk ? 'ပင်နံပါတ် ၆ လုံး ရိုက်ထည့်ပါ' : 'Enter your PIN',
            hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14.5),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
            filled: true,
            fillColor: Colors.white,
            suffixIcon: IconButton(
              icon: Icon(
                _showSignUpPin ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                size: 20,
                color: const Color(0xFF374151),
              ),
              onPressed: () => setState(() => _showSignUpPin = !_showSignUpPin),
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(28),
              borderSide: BorderSide(
                color: pin.isEmpty ? const Color(0xFFE5E7EB) : (isPinLengthValid ? const Color(0xFF10B981) : const Color(0xFFEF4444)),
                width: 1.2,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(28),
              borderSide: BorderSide(
                color: pin.isEmpty ? const Color(0xFFE5E7EB) : (isPinLengthValid ? const Color(0xFF10B981) : const Color(0xFFEF4444)),
                width: 1.2,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(28),
              borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5),
            ),
          ),
        ),

        // Real-Time PIN Criteria Checklist (Matching Image 2 criteria styling)
        const SizedBox(height: 8),
        if (pin.isEmpty)
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 6),
            child: Text(
              isAk ? 'ပင်နံပါတ် လိုအပ်ပါသည်' : 'Required',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFEF4444)),
            ),
          ),
        _buildValidationCriteriaRow(
          label: isAk ? 'ဂဏန်း ၆ လုံး တိကျစွာ' : 'Exactly 6 digits',
          isMet: isPinLengthValid,
        ),
        const SizedBox(height: 4),
        _buildValidationCriteriaRow(
          label: isAk ? 'ဂဏန်းများသာ (0-9)' : 'Numbers only (0-9)',
          isMet: pin.isNotEmpty && isPinNumeric,
        ),
        const SizedBox(height: 18),

        // Confirm PIN Label
        Text(
          isAk ? 'ပင်နံပါတ် အတည်ပြုပါ' : 'Confirm PIN',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _signUpConfirmPinCtrl,
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: !_showSignUpConfirmPin,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF111827)),
          decoration: InputDecoration(
            counterText: '',
            hintText: isAk ? 'ပင်နံပါတ် အတည်ပြုပါ' : 'Confirm PIN',
            hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14.5),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
            filled: true,
            fillColor: Colors.white,
            suffixIcon: IconButton(
              icon: Icon(
                _showSignUpConfirmPin ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                size: 20,
                color: const Color(0xFF374151),
              ),
              onPressed: () => setState(() => _showSignUpConfirmPin = !_showSignUpConfirmPin),
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(28),
              borderSide: BorderSide(
                color: confirmPin.isEmpty
                    ? const Color(0xFFE5E7EB)
                    : (isPinMatch ? const Color(0xFF10B981) : const Color(0xFFEF4444)),
                width: 1.2,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(28),
              borderSide: BorderSide(
                color: confirmPin.isEmpty
                    ? const Color(0xFFE5E7EB)
                    : (isPinMatch ? const Color(0xFF10B981) : const Color(0xFFEF4444)),
                width: 1.2,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(28),
              borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5),
            ),
          ),
        ),
        if (confirmPin.isNotEmpty) ...[
          const SizedBox(height: 6),
          _buildValidationCriteriaRow(
            label: isAk ? 'ပင်နံပါတ် ကိုက်ညီပါသည်' : 'PINs match',
            isMet: isPinMatch,
          ),
        ],

        // Error message if any
        if (_signUpError != null) ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFFECDD3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline_rounded, size: 18, color: Color(0xFFDC2626)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _signUpError!,
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFB91C1C),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 28),

        // Register Button (Soft peach when disabled, vibrant orange when valid)
        SizedBox(
          height: 52,
          child: ElevatedButton(
            onPressed: (_isLoading || !canSubmit) ? null : () => _handleSignUpStep1(appState),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF97316),
              disabledBackgroundColor: const Color(0xFFFED7AA),
              foregroundColor: Colors.white,
              disabledForegroundColor: Colors.white.withValues(alpha: 0.9),
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
            ),
            child: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : Text(
                    isAk ? 'အကောင့်ဖွင့်မည်' : 'Register',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  // Row for criteria checklist (Cross in red or Checkmark in green)
  Widget _buildValidationCriteriaRow({required String label, required bool isMet}) {
    return Row(
      children: [
        Icon(
          isMet ? Icons.check_rounded : Icons.close_rounded,
          size: 14,
          color: isMet ? const Color(0xFF10B981) : const Color(0xFFEF4444),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w500,
            color: isMet ? const Color(0xFF10B981) : const Color(0xFF6B7280),
          ),
        ),
      ],
    );
  }

  // Sign Up Step 2: OTP Verification
  Widget _buildSignUpOtpStep(BuildContext context, AppState appState, bool isAk) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          isAk ? 'အီးမေးလ် အတည်ပြုရန်' : 'Verify Your Email',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF111827)),
        ),
        const SizedBox(height: 6),
        Text(
          isAk
              ? '${_signUpEmailCtrl.text.trim()} သို့ ပို့ထားသော ၆ လုံးပါ ကုဒ်ကို ရိုက်ထည့်ပါ'
              : 'Enter the 6-digit code sent to ${_signUpEmailCtrl.text.trim()}',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 13.5, color: Color(0xFF4B5563)),
        ),
        const SizedBox(height: 20),

        // 10-Minute Expiry Pill
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFFFFFBEB),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFFDE68A)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.timer_outlined, size: 16, color: Color(0xFFD97706)),
              const SizedBox(width: 6),
              Text(
                isAk ? 'သက်တမ်းကျန်ချိန်: ' : 'Expires in: ',
                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Color(0xFF92400E)),
              ),
              Text(
                _formatTimer(_secondsRemaining),
                style: TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w800,
                  fontFamily: 'monospace',
                  color: _secondsRemaining < 60 ? Colors.red : const Color(0xFFD97706),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // OTP Input Field
        TextField(
          controller: _signUpOtpCtrl,
          keyboardType: TextInputType.number,
          maxLength: 6,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: 8, fontFamily: 'monospace'),
          decoration: InputDecoration(
            counterText: '',
            hintText: '••••••',
            hintStyle: const TextStyle(fontSize: 22, letterSpacing: 8, color: Color(0xFFD1D5DB)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFE5E7EB), width: 1.2)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5)),
          ),
        ),
        if (_signUpError != null) ...[
          const SizedBox(height: 12),
          Text(_signUpError!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 12.5, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
        ],
        const SizedBox(height: 24),

        SizedBox(
          height: 52,
          child: ElevatedButton(
            onPressed: () => _handleSignUpStep2(appState),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF97316),
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
            ),
            child: Text(isAk ? 'ကုဒ် အတည်ပြုမည်' : 'Verify Code', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          ),
        ),
        const SizedBox(height: 16),

        TextButton(
          onPressed: _isLoading ? null : () => _handleSignUpStep1(appState),
          child: Text(
            isAk ? 'အီးမေးလ် ပြန်ပို့မည်' : 'Resend Email',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFFF97316)),
          ),
        ),
      ],
    );
  }

  // Sign Up Step 3: Identity & KYC Level 1
  Widget _buildSignUpIdentityStep(BuildContext context, AppState appState, bool isAk) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          isAk ? 'အမည်နှင့် အသုံးပြုသူအမည်' : 'Complete Your Profile',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF111827)),
        ),
        const SizedBox(height: 6),
        Text(
          isAk
              ? 'အီးမေးလ် အတည်ပြုပြီးပါပြီ။ KYC Level 1 အတွက် အမည်ဖြည့်စွက်ပါ'
              : 'Email verified! Complete your profile to activate KYC Level 1.',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 13.5, color: Color(0xFF4B5563)),
        ),
        const SizedBox(height: 24),

        Text(isAk ? 'အမည် အပြည့်အစုံ' : 'Full Name', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1F2937))),
        const SizedBox(height: 8),
        TextField(
          controller: _signUpNameCtrl,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            hintText: 'e.g. Kyaw Min',
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFE5E7EB), width: 1.2)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5)),
          ),
        ),
        const SizedBox(height: 18),

        Text(isAk ? 'အသုံးပြုသူအမည်' : 'Username', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1F2937))),
        const SizedBox(height: 8),
        TextField(
          controller: _signUpUsernameCtrl,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            hintText: '@username',
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFE5E7EB), width: 1.2)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5)),
          ),
        ),
        if (_signUpError != null) ...[
          const SizedBox(height: 12),
          Text(_signUpError!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 12.5, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
        ],
        const SizedBox(height: 28),

        SizedBox(
          height: 52,
          child: ElevatedButton(
            onPressed: _isLoading ? null : () => _handleSignUpStep3(appState),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF97316),
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
            ),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text(isAk ? 'အကောင့်ဖွင့်ခြင်း ပြီးစီးမည်' : 'Complete & Open Wallet', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          ),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. FORGET PASSWORD / PIN SCAFFOLD (MATCHING IMAGE 1)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildForgotPasswordScaffold(BuildContext context, AppState appState, bool isAk) {
    final email = _forgotEmailCtrl.text.trim();
    final bool canConfirmEmail = email.contains('@');

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Navigation Bar: Back Arrow on Left, "Log In" in orange on Right
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                GestureDetector(
                  onTap: () {
                    setState(() {
                      if (_forgotStep == ForgotPasswordStep.createNewPin) {
                        _forgotStep = ForgotPasswordStep.enterOtp;
                      } else if (_forgotStep == ForgotPasswordStep.enterOtp) {
                        _forgotStep = ForgotPasswordStep.enterEmail;
                      } else {
                        _mode = AuthMode.login;
                      }
                      _forgotError = null;
                    });
                  },
                  child: const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                    child: Icon(
                      Icons.arrow_back_rounded,
                      size: 24,
                      color: Color(0xFF111827),
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _mode = AuthMode.login;
                      _forgotError = null;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                    child: Text(
                      isAk ? 'အကောင့်ဝင်မည်' : 'Log In',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFF97316),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),

            // STEP 1: ENTER EMAIL (EXACTLY MATCHING IMAGE 1)
            if (_forgotStep == ForgotPasswordStep.enterEmail) ...[
              // Heading
              Text(
                isAk ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forget Password?',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF111827),
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 24),

              // Email Label
              Text(
                isAk ? 'အီးမေးလ်' : 'Email',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1F2937),
                ),
              ),
              const SizedBox(height: 8),
              // Email Input (Pill Shaped)
              TextField(
                controller: _forgotEmailCtrl,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: Color(0xFF111827)),
                decoration: InputDecoration(
                  hintText: isAk ? 'သင်၏ အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email',
                  hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14.5),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                  filled: true,
                  fillColor: Colors.white,
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
                    borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // Light Grey Rounded Info Box (Exact match to Image 1)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFF3F4F6)),
                ),
                child: Text(
                  isAk
                      ? 'စကားဝှက်/ပင်နံပါတ် ပြန်လည်သတ်မှတ်ရန် လင့်ခ်/ကုဒ် ရရှိရန် သင့်အကောင့်နှင့် ချိတ်ဆက်ထားသော အီးမေးလ်လိပ်စာကို ရိုက်ထည့်ပါ။'
                      : 'Enter the email address associated with your account to receive a link to reset your password.',
                  style: const TextStyle(
                    fontSize: 13.5,
                    color: Color(0xFF4B5563),
                    height: 1.45,
                  ),
                ),
              ),

              if (_forgotError != null) ...[
                const SizedBox(height: 16),
                Text(_forgotError!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13, fontWeight: FontWeight.w600)),
              ],
              const SizedBox(height: 32),

              // Confirm Button (Soft peach when empty, vibrant orange when typed)
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: (_isLoading || !canConfirmEmail) ? null : () => _handleSendResetOtp(appState),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF97316),
                    disabledBackgroundColor: const Color(0xFFFED7AA),
                    foregroundColor: Colors.white,
                    disabledForegroundColor: Colors.white.withValues(alpha: 0.9),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                  ),
                  child: _isLoading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(isAk ? 'အတည်ပြုမည်' : 'Confirm', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                ),
              ),
            ],

            // STEP 2: ENTER OTP (10 MIN TIMER)
            if (_forgotStep == ForgotPasswordStep.enterOtp) ...[
              Text(
                isAk ? 'အတည်ပြုကုဒ် ရိုက်ထည့်ပါ' : 'Enter Verification Code',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF111827), letterSpacing: -0.3),
              ),
              const SizedBox(height: 8),
              Text(
                isAk
                    ? '${_forgotEmailCtrl.text.trim()} သို့ ပို့ထားသော ၆ လုံးပါ ကုဒ်ကို ရိုက်ထည့်ပါ'
                    : 'Enter the 6-digit code sent to ${_forgotEmailCtrl.text.trim()}',
                style: const TextStyle(fontSize: 13.5, color: Color(0xFF4B5563)),
              ),
              if (_forgotSuccessMessage != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  margin: const EdgeInsets.only(bottom: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_outline_rounded, size: 16, color: Color(0xFF059669)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _forgotSuccessMessage!,
                          style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Color(0xFF065F46)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 20),

              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFBEB),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFFDE68A)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.timer_outlined, size: 16, color: Color(0xFFD97706)),
                    const SizedBox(width: 6),
                    Text(isAk ? 'သက်တမ်းကျန်ချိန်: ' : 'Expires in: ', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Color(0xFF92400E))),
                    Text(
                      _formatTimer(_secondsRemaining),
                      style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, fontFamily: 'monospace', color: _secondsRemaining < 60 ? Colors.red : const Color(0xFFD97706)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              TextField(
                controller: _forgotOtpCtrl,
                keyboardType: TextInputType.number,
                maxLength: 6,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: 8, fontFamily: 'monospace'),
                decoration: InputDecoration(
                  counterText: '',
                  hintText: '••••••',
                  hintStyle: const TextStyle(fontSize: 22, letterSpacing: 8, color: Color(0xFFD1D5DB)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFE5E7EB), width: 1.2)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5)),
                ),
              ),
              if (_forgotError != null) ...[
                const SizedBox(height: 12),
                Text(_forgotError!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
              ],
              const SizedBox(height: 28),

              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: () => _handleVerifyResetOtp(appState),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF97316),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                  ),
                  child: Text(isAk ? 'အတည်ပြုမည်' : 'Verify Code', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(height: 16),

              TextButton(
                onPressed: _isLoading ? null : () => _handleSendResetOtp(appState),
                child: Text(isAk ? 'အီးမေးလ် ပြန်ပို့မည်' : 'Resend Email', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFFF97316))),
              ),
            ],

            // STEP 3: CREATE NEW PIN
            if (_forgotStep == ForgotPasswordStep.createNewPin) ...[
              Text(
                isAk ? 'ပင်နံပါတ်အသစ် သတ်မှတ်ပါ' : 'Create New PIN',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF111827), letterSpacing: -0.3),
              ),
              const SizedBox(height: 8),
              Text(
                isAk ? 'သင်၏ အကောင့်အတွက် ပင်နံပါတ် ၆ လုံး သတ်မှတ်ပါ' : 'Choose a new 6-digit PIN for your account',
                style: const TextStyle(fontSize: 13.5, color: Color(0xFF4B5563)),
              ),
              const SizedBox(height: 24),

              Text(isAk ? 'ပင်နံပါတ်အသစ်' : 'New 6-Digit PIN', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1F2937))),
              const SizedBox(height: 8),
              TextField(
                controller: _forgotNewPinCtrl,
                keyboardType: TextInputType.number,
                maxLength: 6,
                obscureText: !_showForgotNewPin,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF111827)),
                decoration: InputDecoration(
                  counterText: '',
                  hintText: isAk ? 'ပင်နံပါတ် ၆ လုံး' : 'Enter 6-digit PIN',
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                  filled: true,
                  fillColor: Colors.white,
                  suffixIcon: IconButton(
                    icon: Icon(_showForgotNewPin ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 20, color: const Color(0xFF374151)),
                    onPressed: () => setState(() => _showForgotNewPin = !_showForgotNewPin),
                  ),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFE5E7EB), width: 1.2)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5)),
                ),
              ),
              const SizedBox(height: 18),

              Text(isAk ? 'ပင်နံပါတ် အတည်ပြုပါ' : 'Confirm New PIN', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1F2937))),
              const SizedBox(height: 8),
              TextField(
                controller: _forgotConfirmPinCtrl,
                keyboardType: TextInputType.number,
                maxLength: 6,
                obscureText: !_showForgotConfirmPin,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF111827)),
                decoration: InputDecoration(
                  counterText: '',
                  hintText: isAk ? 'ပင်နံပါတ် ပြန်လည်ရိုက်ထည့်ပါ' : 'Confirm 6-digit PIN',
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                  filled: true,
                  fillColor: Colors.white,
                  suffixIcon: IconButton(
                    icon: Icon(_showForgotConfirmPin ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 20, color: const Color(0xFF374151)),
                    onPressed: () => setState(() => _showForgotConfirmPin = !_showForgotConfirmPin),
                  ),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFE5E7EB), width: 1.2)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5)),
                ),
              ),
              if (_forgotError != null) ...[
                const SizedBox(height: 12),
                Text(_forgotError!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
              ],
              const SizedBox(height: 28),

              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : () => _handleConfirmPinReset(appState),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF97316),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                  ),
                  child: _isLoading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(isAk ? 'အတည်ပြုပြီး အကောင့်ဝင်မည်' : 'Confirm & Go to Login', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
