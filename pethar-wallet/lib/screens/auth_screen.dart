import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../widgets/arakan_emblem.dart';

enum AuthMode { login, signup, forgotPassword }

enum ForgotPasswordStep { enterEmail, enterOtp, createNewPin }

enum SignUpStep { enterCredentials, verifyOtp, createIdentity }

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
  bool _showForgotUnderWarning = false;
  bool _isLoading = false;

  // Controllers - Forgot Password
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
  void dispose() {
    _countdownTimer?.cancel();
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
        _showForgotUnderWarning = false;
      });
      return;
    }
    if (pin.isEmpty || pin.length != 6) {
      setState(() {
        _loginError = isAk ? '၆ လုံးပါ ပင်နံပါတ် ရိုက်ထည့်ပါ' : 'Please enter your 6-digit PIN code';
        _showForgotUnderWarning = false;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _loginError = null;
      _showForgotUnderWarning = false;
    });

    final res = await appState.loginWithEmailAndPin(email: email, pin: pin);

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      // Successfully authenticated -> user taken into app!
    } else {
      setState(() {
        _loginError = isAk
            ? 'အီးမေးလ် သို့မဟုတ် ပင်နံပါတ် မှားယွင်းနေပါသည်'
            : 'Wrong email or PIN code';
        _showForgotUnderWarning = true;
      });
    }
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
        // Prefill simulated OTP if returned for demo ease
        if (res['code'] != null) {
          _forgotOtpCtrl.text = res['code'].toString();
        }
      });
    } else {
      setState(() {
        _forgotError = res['error']?.toString() ?? 'Failed to send OTP. Please try again.';
      });
    }
  }

  void _handleVerifyResetOtp(AppState appState) {
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

    final res = appState.verifyPinResetOtp(email, otp);
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
      // Go back to login page with pre-filled email and new pin
      setState(() {
        _mode = AuthMode.login;
        _loginEmailCtrl.text = email;
        _loginPinCtrl.text = newPin;
        _loginError = null;
        _showForgotUnderWarning = false;
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
        if (res['code'] != null) {
          _signUpOtpCtrl.text = res['code'].toString();
        }
      });
    } else {
      setState(() {
        _signUpError = res['error']?.toString() ?? 'Sign up initialization failed.';
      });
    }
  }

  void _handleSignUpStep2(AppState appState) {
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

    final res = appState.verifySignUpOtp(email, otp);
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
      backgroundColor: const Color(0xFFF4F1EA),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Top Brand & Language Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: const [
                        ArakanEmblem(size: 32),
                        SizedBox(width: 8),
                        Text(
                          'Péthar',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                            color: Color(0xFF18181B),
                          ),
                        ),
                      ],
                    ),
                    TextButton.icon(
                      onPressed: () => appState.setLanguage(isAk ? 'en' : 'ak'),
                      icon: const Icon(Icons.language_rounded, size: 16, color: Color(0xFF71717A)),
                      label: Text(
                        isAk ? 'EN' : 'အာရက္ခ',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF27272A),
                        ),
                      ),
                      style: TextButton.styleFrom(
                        backgroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(999),
                          side: const BorderSide(color: Color(0xFFE4E4E7)),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Main Auth Card
                Container(
                  width: double.infinity,
                  constraints: const BoxConstraints(maxWidth: 440),
                  padding: const EdgeInsets.all(26),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: const Color(0xFFE7E5E4)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 24,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Mode Segment Toggle (Only when not in forgot password)
                      if (_mode != AuthMode.forgotPassword) ...[
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF4F4F5),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _mode = AuthMode.login;
                                      _loginError = null;
                                      _showForgotUnderWarning = false;
                                    });
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    decoration: BoxDecoration(
                                      color: _mode == AuthMode.login ? Colors.white : Colors.transparent,
                                      borderRadius: BorderRadius.circular(12),
                                      boxShadow: _mode == AuthMode.login
                                          ? [
                                              BoxShadow(
                                                color: Colors.black.withValues(alpha: 0.05),
                                                blurRadius: 4,
                                                offset: const Offset(0, 2),
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Text(
                                      isAk ? 'အကောင့်ဝင်ရန်' : 'Log In',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: _mode == AuthMode.login ? FontWeight.w800 : FontWeight.w600,
                                        color: _mode == AuthMode.login ? const Color(0xFF18181B) : const Color(0xFF71717A),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _mode = AuthMode.signup;
                                      _signUpStep = SignUpStep.enterCredentials;
                                      _signUpError = null;
                                    });
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    decoration: BoxDecoration(
                                      color: _mode == AuthMode.signup ? Colors.white : Colors.transparent,
                                      borderRadius: BorderRadius.circular(12),
                                      boxShadow: _mode == AuthMode.signup
                                          ? [
                                              BoxShadow(
                                                color: Colors.black.withValues(alpha: 0.05),
                                                blurRadius: 4,
                                                offset: const Offset(0, 2),
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Text(
                                      isAk ? 'အကောင့်သစ်ဖွင့်ရန်' : 'Sign Up',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: _mode == AuthMode.signup ? FontWeight.w800 : FontWeight.w600,
                                        color: _mode == AuthMode.signup ? const Color(0xFF18181B) : const Color(0xFF71717A),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],

                      // Active View Switch
                      if (_mode == AuthMode.login)
                        _buildLoginView(context, appState, isAk)
                      else if (_mode == AuthMode.forgotPassword)
                        _buildForgotPasswordView(context, appState, isAk)
                      else if (_mode == AuthMode.signup)
                        _buildSignUpView(context, appState, isAk),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. LOGIN VIEW
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildLoginView(BuildContext context, AppState appState, bool isAk) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          isAk ? 'ဖေ့သာ အကောင့်ဝင်ရန်' : 'Welcome Back',
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: Color(0xFF18181B),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          isAk
              ? 'သင်၏ အီးမေးလ်နှင့် ၆ လုံးပါ ပင်နံပါတ်ကို ရိုက်ထည့်ပါ'
              : 'Enter your email address and 6-digit PIN code',
          style: const TextStyle(fontSize: 13, color: Color(0xFF71717A)),
        ),
        const SizedBox(height: 20),

        // Email Field
        Text(
          isAk ? 'အီးမေးလ် လိပ်စာ' : 'Email Address',
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B)),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: _loginEmailCtrl,
          keyboardType: TextInputType.emailAddress,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF18181B)),
          decoration: InputDecoration(
            hintText: 'name@example.com',
            hintStyle: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 13),
            prefixIcon: const Icon(Icons.mail_outline_rounded, size: 18, color: Color(0xFF71717A)),
            filled: true,
            fillColor: const Color(0xFFFAFAFA),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFE4E4E7)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFE4E4E7)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFF18181B), width: 1.5),
            ),
          ),
        ),
        const SizedBox(height: 14),

        // 6-digit PIN Field
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              isAk ? '၆ လုံးပါ ပင်နံပါတ်' : '6-Digit PIN Code',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B)),
            ),
            GestureDetector(
              onTap: () => _startForgotPasswordFlow(prefilledEmail: _loginEmailCtrl.text.trim()),
              child: Text(
                isAk ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forgot PIN?',
                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: crimson),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        TextField(
          controller: _loginPinCtrl,
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: !_showLoginPin,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            letterSpacing: 6,
            fontFamily: 'monospace',
            color: Color(0xFF18181B),
          ),
          decoration: InputDecoration(
            counterText: '',
            hintText: '••••••',
            hintStyle: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 18, letterSpacing: 4),
            prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18, color: Color(0xFF71717A)),
            suffixIcon: IconButton(
              icon: Icon(
                _showLoginPin ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                size: 18,
                color: const Color(0xFF71717A),
              ),
              onPressed: () => setState(() => _showLoginPin = !_showLoginPin),
            ),
            filled: true,
            fillColor: const Color(0xFFFAFAFA),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFE4E4E7)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFE4E4E7)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFF18181B), width: 1.5),
            ),
          ),
        ),
        const SizedBox(height: 14),

        // WARNING BANNER & FORGOT PASSWORD UNDER WARNING
        if (_loginError != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFFECDD3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
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
                if (_showForgotUnderWarning) ...[
                  const SizedBox(height: 8),
                  const Divider(color: Color(0xFFFECDD3), height: 1),
                  const SizedBox(height: 8),
                  InkWell(
                    onTap: () => _startForgotPasswordFlow(prefilledEmail: _loginEmailCtrl.text.trim()),
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.lock_reset_rounded, size: 16, color: crimson),
                          const SizedBox(width: 6),
                          Text(
                            isAk
                                ? 'စကားဝှက် / ပင်နံပါတ် ပြန်လည်ရယူမည် (Forgot Password)'
                                : 'Forgot Password? (Reset PIN via Email OTP)',
                            style: const TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w800,
                              color: crimson,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],

        // Submit Log In Button
        ElevatedButton(
          onPressed: _isLoading ? null : () => _handleLogin(appState),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF18181B),
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          child: _isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : Text(
                  isAk ? 'အကောင့်ဝင်ရန်' : 'Log In',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                ),
        ),
        const SizedBox(height: 16),

        // Quick sign up footer
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              isAk ? 'အကောင့်မရှိသေးပါသလား? ' : "Don't have an account? ",
              style: const TextStyle(fontSize: 12.5, color: Color(0xFF71717A)),
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
                isAk ? 'အကောင့်ဖွင့်ရန်' : 'Sign Up',
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w800,
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
  // 2. FORGOT PASSWORD VIEW (10 min OTP -> New PIN -> Back to Login)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildForgotPasswordView(BuildContext context, AppState appState, bool isAk) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            GestureDetector(
              onTap: () {
                setState(() {
                  _mode = AuthMode.login;
                  _forgotError = null;
                });
              },
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: Color(0xFFF4F4F5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_back_rounded, size: 18, color: Color(0xFF18181B)),
              ),
            ),
            const SizedBox(width: 10),
            Text(
              isAk ? 'ပင်နံပါတ် ပြန်လည်သတ်မှတ်ရန်' : 'Reset 6-Digit PIN',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
            ),
          ],
        ),
        const SizedBox(height: 16),

        if (_forgotError != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 14),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFFECDD3)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.error_outline_rounded, size: 18, color: Color(0xFFDC2626)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _forgotError!,
                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFFB91C1C)),
                  ),
                ),
              ],
            ),
          ),
        ],

        if (_forgotSuccessMessage != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 14),
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle_outline_rounded, size: 18, color: Color(0xFF059669)),
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

        // STEP 1: ENTER EMAIL
        if (_forgotStep == ForgotPasswordStep.enterEmail) ...[
          Text(
            isAk
                ? 'သင်၏ အကောင့်အီးမေးလ်ကို ရိုက်ထည့်ပါ။ အတည်ပြုကုဒ် ပို့ပေးပါမည်။'
                : 'Enter your registered email address. We will send a 6-digit OTP to reset your PIN.',
            style: const TextStyle(fontSize: 13, color: Color(0xFF71717A), height: 1.4),
          ),
          const SizedBox(height: 16),
          Text(
            isAk ? 'အီးမေးလ် လိပ်စာ' : 'Email Address',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B)),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _forgotEmailCtrl,
            keyboardType: TextInputType.emailAddress,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF18181B)),
            decoration: InputDecoration(
              hintText: 'name@example.com',
              prefixIcon: const Icon(Icons.mail_outline_rounded, size: 18, color: Color(0xFF71717A)),
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE4E4E7))),
            ),
          ),
          const SizedBox(height: 18),
          ElevatedButton(
            onPressed: _isLoading ? null : () => _handleSendResetOtp(appState),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF18181B),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text(isAk ? 'အတည်ပြုကုဒ် ပို့ရန်' : 'Send Verification OTP', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
          ),
        ],

        // STEP 2: ENTER OTP (10 MIN COUNTDOWN)
        if (_forgotStep == ForgotPasswordStep.enterOtp) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFFBEB),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFFDE68A)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.timer_outlined, size: 18, color: Color(0xFFD97706)),
                    const SizedBox(width: 6),
                    Text(
                      isAk ? 'သက်တမ်းကုန်ဆုံးရန်:' : 'Expires in:',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF92400E)),
                    ),
                  ],
                ),
                Text(
                  _formatTimer(_secondsRemaining),
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    fontFamily: 'monospace',
                    color: _secondsRemaining < 60 ? crimson : const Color(0xFFD97706),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            isAk ? 'အီးမေးလ်သို့ ပို့ထားသော ၆ လုံးပါ ကုဒ်' : '6-Digit Verification Code',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B)),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _forgotOtpCtrl,
            keyboardType: TextInputType.number,
            maxLength: 6,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: 8, fontFamily: 'monospace'),
            decoration: InputDecoration(
              counterText: '',
              hintText: '••••••',
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE4E4E7))),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _isLoading ? null : () => _handleSendResetOtp(appState),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFD4D4D8)),
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(
                    isAk ? 'အီးမေးလ် ပြန်လည်ပို့မည်' : 'Resend Email',
                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF27272A)),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _handleVerifyResetOtp(appState),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF18181B),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(
                    isAk ? 'အတည်ပြုမည်' : 'Verify Code',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                  ),
                ),
              ),
            ],
          ),
        ],

        // STEP 3: CREATE NEW PIN & CONFIRM
        if (_forgotStep == ForgotPasswordStep.createNewPin) ...[
          Text(
            isAk ? 'ပင်နံပါတ် အသစ် သတ်မှတ်ရန်' : 'Create New 6-Digit PIN',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B)),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _forgotNewPinCtrl,
            keyboardType: TextInputType.number,
            maxLength: 6,
            obscureText: !_showForgotNewPin,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: 6, fontFamily: 'monospace'),
            decoration: InputDecoration(
              counterText: '',
              hintText: '••••••',
              prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18, color: Color(0xFF71717A)),
              suffixIcon: IconButton(
                icon: Icon(_showForgotNewPin ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 18),
                onPressed: () => setState(() => _showForgotNewPin = !_showForgotNewPin),
              ),
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE4E4E7))),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            isAk ? 'ပင်နံပါတ် အသစ် ပြန်လည်ရိုက်ထည့်ပါ' : 'Confirm Re-enter PIN',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B)),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _forgotConfirmPinCtrl,
            keyboardType: TextInputType.number,
            maxLength: 6,
            obscureText: !_showForgotConfirmPin,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: 6, fontFamily: 'monospace'),
            decoration: InputDecoration(
              counterText: '',
              hintText: '••••••',
              prefixIcon: const Icon(Icons.lock_reset_rounded, size: 18, color: Color(0xFF71717A)),
              suffixIcon: IconButton(
                icon: Icon(_showForgotConfirmPin ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 18),
                onPressed: () => setState(() => _showForgotConfirmPin = !_showForgotConfirmPin),
              ),
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE4E4E7))),
            ),
          ),
          const SizedBox(height: 18),
          ElevatedButton(
            onPressed: _isLoading ? null : () => _handleConfirmPinReset(appState),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text(
                    isAk ? 'ပင်နံပါတ်အသစ် အတည်ပြုပြီး ဝင်မည်' : 'Confirm & Go to Login',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                  ),
          ),
        ],
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. SIGN UP VIEW (Email+PIN+Confirm -> OTP 10 min -> Name+Username -> KYC Level 1)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildSignUpView(BuildContext context, AppState appState, bool isAk) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              isAk ? 'ဖေ့သာ အကောင့်သစ်ဖွင့်ရန်' : 'Create Account',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: const Text(
                'KYC Level 1',
                style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Color(0xFF059669)),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          _signUpStep == SignUpStep.enterCredentials
              ? (isAk ? 'အဆင့် ၁: အီးမေးလ်နှင့် ၆ လုံးပါ ပင်နံပါတ်' : 'Step 1: Enter email and create 6-digit PIN')
              : (_signUpStep == SignUpStep.verifyOtp
                  ? (isAk ? 'အဆင့် ၂: အီးမေးလ် အတည်ပြုကုဒ် ရိုက်ထည့်ပါ' : 'Step 2: Enter 6-digit code sent to email')
                  : (isAk ? 'အဆင့် ၃: အမည်နှင့် အသုံးပြုသူအမည် သတ်မှတ်ပါ' : 'Step 3: Choose Name and Username')),
          style: const TextStyle(fontSize: 12.5, color: Color(0xFF71717A)),
        ),
        const SizedBox(height: 18),

        if (_signUpError != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 14),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFFECDD3)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.error_outline_rounded, size: 18, color: Color(0xFFDC2626)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _signUpError!,
                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFFB91C1C)),
                  ),
                ),
              ],
            ),
          ),
        ],

        // STEP 1: CREDENTIALS
        if (_signUpStep == SignUpStep.enterCredentials) ...[
          Text(isAk ? 'အီးမေးလ်' : 'Email Address', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B))),
          const SizedBox(height: 6),
          TextField(
            controller: _signUpEmailCtrl,
            keyboardType: TextInputType.emailAddress,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            decoration: InputDecoration(
              hintText: 'name@example.com',
              prefixIcon: const Icon(Icons.mail_outline_rounded, size: 18),
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE4E4E7))),
            ),
          ),
          const SizedBox(height: 12),
          Text(isAk ? '၆ လုံးပါ ပင်နံပါတ် သတ်မှတ်ပါ' : '6-Digit Security PIN', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B))),
          const SizedBox(height: 6),
          TextField(
            controller: _signUpPinCtrl,
            keyboardType: TextInputType.number,
            maxLength: 6,
            obscureText: !_showSignUpPin,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: 6, fontFamily: 'monospace'),
            decoration: InputDecoration(
              counterText: '',
              hintText: '••••••',
              prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18),
              suffixIcon: IconButton(
                icon: Icon(_showSignUpPin ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 18),
                onPressed: () => setState(() => _showSignUpPin = !_showSignUpPin),
              ),
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE4E4E7))),
            ),
          ),
          const SizedBox(height: 12),
          Text(isAk ? 'ပင်နံပါတ် ပြန်လည်ရိုက်ထည့်ပါ' : 'Confirm 6-Digit PIN', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B))),
          const SizedBox(height: 6),
          TextField(
            controller: _signUpConfirmPinCtrl,
            keyboardType: TextInputType.number,
            maxLength: 6,
            obscureText: !_showSignUpConfirmPin,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: 6, fontFamily: 'monospace'),
            decoration: InputDecoration(
              counterText: '',
              hintText: '••••••',
              prefixIcon: const Icon(Icons.lock_reset_rounded, size: 18),
              suffixIcon: IconButton(
                icon: Icon(_showSignUpConfirmPin ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 18),
                onPressed: () => setState(() => _showSignUpConfirmPin = !_showSignUpConfirmPin),
              ),
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE4E4E7))),
            ),
          ),
          const SizedBox(height: 18),
          ElevatedButton(
            onPressed: _isLoading ? null : () => _handleSignUpStep1(appState),
            style: ElevatedButton.styleFrom(
              backgroundColor: crimson,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text(isAk ? 'အီးမေးလ် အတည်ပြုရန် ဆက်သွားမည်' : 'Continue to Email Verification', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
          ),
        ],

        // STEP 2: VERIFY EMAIL OTP (10 MIN TIMER)
        if (_signUpStep == SignUpStep.verifyOtp) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFFBEB),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFFDE68A)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.timer_outlined, size: 18, color: Color(0xFFD97706)),
                    const SizedBox(width: 6),
                    Text(
                      isAk ? 'ကုဒ် သက်တမ်းကုန်ဆုံးရန်:' : 'Expires in:',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF92400E)),
                    ),
                  ],
                ),
                Text(
                  _formatTimer(_secondsRemaining),
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    fontFamily: 'monospace',
                    color: _secondsRemaining < 60 ? crimson : const Color(0xFFD97706),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Text(
            isAk
                ? '${_signUpEmailCtrl.text.trim()} သို့ ပို့ထားသော ၆ လုံးပါ ကုဒ်'
                : 'Enter 6-digit code sent to ${_signUpEmailCtrl.text.trim()}',
            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF52525B)),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _signUpOtpCtrl,
            keyboardType: TextInputType.number,
            maxLength: 6,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: 8, fontFamily: 'monospace'),
            decoration: InputDecoration(
              counterText: '',
              hintText: '••••••',
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE4E4E7))),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _isLoading ? null : () => _handleSignUpStep1(appState),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFD4D4D8)),
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(isAk ? 'အီးမေးလ် ပြန်ပို့မည်' : 'Resend Email', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _handleSignUpStep2(appState),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: crimson,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(isAk ? 'အတည်ပြုမည်' : 'Verify Email', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
                ),
              ),
            ],
          ),
        ],

        // STEP 3: CREATE NAME & USERNAME -> ISSUES UID & KYC LEVEL 1
        if (_signUpStep == SignUpStep.createIdentity) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified_user_rounded, size: 20, color: Color(0xFF059669)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    isAk
                        ? 'အီးမေးလ် အတည်ပြုပြီးပါပြီ (KYC အဆင့် ၁)။ အကောင့်အမည် သတ်မှတ်ပါ။'
                        : 'Email verified! Complete your profile to activate KYC Level 1 and generate your citizen UID.',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF065F46)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Text(isAk ? 'အမည် အပြည့်အစုံ' : 'Full Name', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B))),
          const SizedBox(height: 6),
          TextField(
            controller: _signUpNameCtrl,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            decoration: InputDecoration(
              hintText: 'e.g. Kyaw Min',
              prefixIcon: const Icon(Icons.person_outline_rounded, size: 18),
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE4E4E7))),
            ),
          ),
          const SizedBox(height: 12),
          Text(isAk ? 'အသုံးပြုသူအမည်' : 'Username (Unique)', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B))),
          const SizedBox(height: 6),
          TextField(
            controller: _signUpUsernameCtrl,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            decoration: InputDecoration(
              hintText: '@username',
              prefixIcon: const Icon(Icons.alternate_email_rounded, size: 18),
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE4E4E7))),
            ),
          ),
          const SizedBox(height: 18),
          ElevatedButton(
            onPressed: _isLoading ? null : () => _handleSignUpStep3(appState),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text(
                    isAk ? 'အကောင့်ဖွင့်ခြင်း အပြီးသတ်မည်' : 'Complete & Enter Wallet',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                  ),
          ),
        ],
      ],
    );
  }
}
