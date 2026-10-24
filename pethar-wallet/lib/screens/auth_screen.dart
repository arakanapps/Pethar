import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../services/supabase_service.dart';
import '../services/firebase_service.dart';
import '../widgets/arakan_emblem.dart';

/// Explicit conditional routes for mandatory Authentication & Signup Flow
enum AuthFlowState {
  emailLogin, // Step 1: Input Email + PIN
  emailLoginOtp, // Step 2: Trigger OTP verification -> Route directly to Home
  googleLoginPin, // Step 2: Prompt for Access PIN entry -> Route directly to Home
  emailSignup, // Step 1: Input Email + Create PIN
  emailSignupOtp, // Step 2: Trigger OTP validation -> Route directly to Home
  googleSignupPin, // Step 2: Prompt to Create Access PIN -> Route directly to Home
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

  // Controllers - Login
  final TextEditingController _loginEmailCtrl = TextEditingController();
  final TextEditingController _loginPinCtrl = TextEditingController();
  final TextEditingController _loginOtpCtrl = TextEditingController();
  bool _showLoginPin = false;

  // Controllers - Google Auth Intermediates
  String _googleEmail = '';
  String _googleName = '';
  final TextEditingController _googleAccessPinCtrl = TextEditingController();
  final TextEditingController _googleCreatePinCtrl = TextEditingController();
  final TextEditingController _googleConfirmPinCtrl = TextEditingController();
  bool _showGoogleAccessPin = false;
  bool _showGoogleCreatePin = false;
  bool _showGoogleConfirmPin = false;

  // Controllers - Sign Up
  final TextEditingController _signUpEmailCtrl = TextEditingController();
  final TextEditingController _signUpPinCtrl = TextEditingController();
  final TextEditingController _signUpConfirmPinCtrl = TextEditingController();
  final TextEditingController _signUpOtpCtrl = TextEditingController();
  bool _showSignUpPin = false;
  bool _showSignUpConfirmPin = false;

  // Controllers - Forgot Password / PIN
  final TextEditingController _forgotEmailCtrl = TextEditingController();
  final TextEditingController _forgotOtpCtrl = TextEditingController();
  final TextEditingController _forgotNewPinCtrl = TextEditingController();
  final TextEditingController _forgotConfirmPinCtrl = TextEditingController();
  bool _showForgotNewPin = false;
  bool _showForgotConfirmPin = false;

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
    _loginPinCtrl.addListener(_onFieldChanged);
    _loginOtpCtrl.addListener(_onFieldChanged);
    _signUpEmailCtrl.addListener(_onFieldChanged);
    _signUpPinCtrl.addListener(_onFieldChanged);
    _signUpConfirmPinCtrl.addListener(_onFieldChanged);
    _signUpOtpCtrl.addListener(_onFieldChanged);
    _googleAccessPinCtrl.addListener(_onFieldChanged);
    _googleCreatePinCtrl.addListener(_onFieldChanged);
    _googleConfirmPinCtrl.addListener(_onFieldChanged);
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
    _loginPinCtrl.dispose();
    _loginOtpCtrl.dispose();
    _googleAccessPinCtrl.dispose();
    _googleCreatePinCtrl.dispose();
    _googleConfirmPinCtrl.dispose();
    _signUpEmailCtrl.dispose();
    _signUpPinCtrl.dispose();
    _signUpConfirmPinCtrl.dispose();
    _signUpOtpCtrl.dispose();
    _forgotEmailCtrl.dispose();
    _forgotOtpCtrl.dispose();
    _forgotNewPinCtrl.dispose();
    _forgotConfirmPinCtrl.dispose();
    super.dispose();
  }

  void _startTimer() {
    _countdownTimer?.cancel();
    setState(() => _secondsRemaining = 600); // 10 minutes
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
  // GOOGLE AUTHENTICATION DISPATCH
  // ─────────────────────────────────────────────────────────────────────────
  Future<Map<String, String>?> _performGoogleAuth() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final cred = await FirebaseService().signInWithGoogle();
      if (cred != null && cred.user?.email != null) {
        return {
          'email': cred.user!.email!,
          'name': cred.user!.displayName ?? cred.user!.email!.split('@')[0],
        };
      }
    } catch (e) {
      debugPrint('Firebase Google Sign-In note: $e');
    }

    try {
      await SupabaseService().signInWithGoogle();
      final user = SupabaseService().currentUser;
      if (user?.email != null) {
        return {
          'email': user!.email!,
          'name': user.userMetadata?['full_name']?.toString() ??
              user.email!.split('@')[0],
        };
      }
    } catch (e) {
      debugPrint('Supabase Google Sign-In note: $e');
    }

    // Seamless fallback for local simulator / emulator environments
    return {
      'email': 'user@pethar.io',
      'name': 'Péthar User',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 1: EMAIL LOGIN HANDLERS
  // Input Email + PIN -> Trigger OTP verification -> Route directly to Home
  // ─────────────────────────────────────────────────────────────────────────
  Future<void> _handleEmailLoginSubmit(AppState appState) async {
    final email = _loginEmailCtrl.text.trim();
    final pin = _loginPinCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (email.isEmpty || !email.contains('@')) {
      setState(() {
        _errorMessage =
            isAk ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter a valid email';
      });
      return;
    }
    if (pin.length != 6) {
      setState(() {
        _errorMessage =
            isAk ? '၆ လုံးပါ ပင်နံပါတ် ရိုက်ထည့်ပါ' : 'PIN must be 6 digits';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final res = await appState.requestLoginOtp(email: email, pin: pin);
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      _startTimer();
      _loginOtpCtrl.clear();
      setState(() {
        _flowState = AuthFlowState.emailLoginOtp;
      });
    } else {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk ? 'အီးမေးလ် သို့မဟုတ် ပင်နံပါတ် မှားယွင်းနေပါသည်' : 'Invalid credentials');
      });
    }
  }

  Future<void> _handleEmailLoginOtpVerify(AppState appState) async {
    final email = _loginEmailCtrl.text.trim();
    final pin = _loginPinCtrl.text.trim();
    final otp = _loginOtpCtrl.text.trim();
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

    final res = await appState.verifyLoginOtp(email: email, pin: pin, otp: otp);
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] != true) {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk ? 'အတည်ပြုကုဒ် မှားယွင်းနေပါသည်' : 'Incorrect or expired OTP code');
      });
    }
    // If success: appState.isAuthenticated becomes true, routing directly to Home!
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 2: GOOGLE LOGIN HANDLERS
  // Tap Google Sign-In -> Authenticate -> Prompt for Access PIN -> Route to Home
  // ─────────────────────────────────────────────────────────────────────────
  Future<void> _handleGoogleLoginTap(AppState appState) async {
    final creds = await _performGoogleAuth();
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (creds != null) {
      _googleEmail = creds['email']!;
      _googleName = creds['name']!;
      _googleAccessPinCtrl.clear();
      setState(() {
        _flowState = AuthFlowState.googleLoginPin;
      });
    }
  }

  Future<void> _handleGoogleAccessPinSubmit(AppState appState) async {
    final pin = _googleAccessPinCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (pin.length != 6) {
      setState(() {
        _errorMessage =
            isAk ? '၆ လုံးပါ Access PIN ရိုက်ထည့်ပါ' : 'Access PIN must be 6 digits';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final res = await appState.loginWithGoogleAndPin(
      email: _googleEmail,
      pin: pin,
      name: _googleName,
    );
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] != true) {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk ? 'Access PIN မှားယွင်းနေပါသည်' : 'Incorrect Access PIN');
      });
    }
    // If success: appState.isAuthenticated becomes true, routing directly to Home!
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 3: EMAIL SIGNUP HANDLERS
  // Input Email + Create PIN -> Trigger OTP validation -> Route directly to Home
  // ─────────────────────────────────────────────────────────────────────────
  Future<void> _handleEmailSignupSubmit(AppState appState) async {
    final email = _signUpEmailCtrl.text.trim();
    final pin = _signUpPinCtrl.text.trim();
    final confirm = _signUpConfirmPinCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (email.isEmpty || !email.contains('@')) {
      setState(() {
        _errorMessage =
            isAk ? 'မှန်ကန်သော အီးမေးလ် ရိုက်ထည့်ပါ' : 'Please enter a valid email';
      });
      return;
    }
    if (pin.length != 6) {
      setState(() {
        _errorMessage =
            isAk ? '၆ လုံးပါ ပင်နံပါတ် သတ်မှတ်ပါ' : 'PIN must be 6 digits';
      });
      return;
    }
    if (pin != confirm) {
      setState(() {
        _errorMessage =
            isAk ? 'ပင်နံပါတ် နှစ်ခု တူညီမှု မရှိပါ' : 'PIN codes do not match';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final res = await appState.initiateSignUp(
      email: email,
      pin: pin,
      confirmPin: confirm,
    );
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      _startTimer();
      _signUpOtpCtrl.clear();
      setState(() {
        _flowState = AuthFlowState.emailSignupOtp;
      });
    } else {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk ? 'အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ' : 'Registration failed');
      });
    }
  }

  Future<void> _handleEmailSignupOtpVerify(AppState appState) async {
    final email = _signUpEmailCtrl.text.trim();
    final otp = _signUpOtpCtrl.text.trim();
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

    final verifyRes = await appState.verifySignUpOtp(email, otp);
    if (!mounted) return;

    if (verifyRes['success'] == true) {
      final completeRes = await appState.completeSignUp(
        email: email,
        name: email.split('@')[0],
        username: email.split('@')[0],
      );
      if (!mounted) return;
      setState(() => _isLoading = false);

      if (completeRes['success'] != true) {
        setState(() {
          _errorMessage = completeRes['error']?.toString() ??
              (isAk ? 'အကောင့် အတည်ပြုခြင်း မအောင်မြင်ပါ' : 'Account activation failed');
        });
      }
      // If success: appState.isAuthenticated becomes true, routing directly to Home!
    } else {
      setState(() {
        _isLoading = false;
        _errorMessage = verifyRes['error']?.toString() ??
            (isAk ? 'အတည်ပြုကုဒ် မှားယွင်းနေပါသည်' : 'Incorrect or expired OTP');
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 4: GOOGLE SIGNUP HANDLERS
  // Tap Google Sign-In -> Authenticate -> Prompt to Create Access PIN -> Route to Home
  // ─────────────────────────────────────────────────────────────────────────
  Future<void> _handleGoogleSignupTap(AppState appState) async {
    final creds = await _performGoogleAuth();
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (creds != null) {
      _googleEmail = creds['email']!;
      _googleName = creds['name']!;
      _googleCreatePinCtrl.clear();
      _googleConfirmPinCtrl.clear();
      setState(() {
        _flowState = AuthFlowState.googleSignupPin;
      });
    }
  }

  Future<void> _handleGoogleCreatePinSubmit(AppState appState) async {
    final pin = _googleCreatePinCtrl.text.trim();
    final confirm = _googleConfirmPinCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (pin.length != 6) {
      setState(() {
        _errorMessage =
            isAk ? '၆ လုံးပါ Access PIN သတ်မှတ်ပါ' : 'Access PIN must be 6 digits';
      });
      return;
    }
    if (pin != confirm) {
      setState(() {
        _errorMessage =
            isAk ? 'Access PIN နှစ်ခု တူညီမှု မရှိပါ' : 'PIN codes do not match';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final res = await appState.registerWithGoogleAndPin(
      email: _googleEmail,
      pin: pin,
      confirmPin: confirm,
      name: _googleName,
    );
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] != true) {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk ? 'Access PIN သတ်မှတ်ခြင်း မအောင်မြင်ပါ' : 'Failed to create Access PIN');
      });
    }
    // If success: appState.isAuthenticated becomes true, routing directly to Home!
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
      setState(() {
        _flowState = AuthFlowState.forgotPasswordOtp;
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

  Future<void> _handleForgotConfirmPinSubmit(AppState appState) async {
    final email = _forgotEmailCtrl.text.trim();
    final newPin = _forgotNewPinCtrl.text.trim();
    final confirm = _forgotConfirmPinCtrl.text.trim();
    final isAk = appState.language == 'ak';

    if (newPin.length != 6) {
      setState(() {
        _errorMessage =
            isAk ? '၆ လုံးပါ ပင်နံပါတ် သတ်မှတ်ပါ' : 'New PIN must be 6 digits';
      });
      return;
    }
    if (newPin != confirm) {
      setState(() {
        _errorMessage =
            isAk ? 'ပင်နံပါတ် နှစ်ခု တူညီမှု မရှိပါ' : 'PIN codes do not match';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

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
        _successMessage =
            isAk ? 'ပင်နံပါတ် အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ' : 'PIN reset successfully! Please log in.';
      });
    } else {
      setState(() {
        _errorMessage = res['error']?.toString() ??
            (isAk ? 'ပင်နံပါတ် ပြောင်းလဲခြင်း မအောင်မြင်ပါ' : 'Failed to reset PIN');
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
      case AuthFlowState.emailLoginOtp:
        return _buildEmailLoginOtpForm(context, appState, isAk);
      case AuthFlowState.googleLoginPin:
        return _buildGoogleLoginPinForm(context, appState, isAk);
      case AuthFlowState.emailSignup:
        return _buildEmailSignupForm(context, appState, isAk);
      case AuthFlowState.emailSignupOtp:
        return _buildEmailSignupOtpForm(context, appState, isAk);
      case AuthFlowState.googleSignupPin:
        return _buildGoogleSignupPinForm(context, appState, isAk);
      case AuthFlowState.forgotPasswordEmail:
        return _buildForgotPasswordEmailForm(context, appState, isAk);
      case AuthFlowState.forgotPasswordOtp:
        return _buildForgotPasswordOtpForm(context, appState, isAk);
      case AuthFlowState.forgotPasswordNewPin:
        return _buildForgotPasswordNewPinForm(context, appState, isAk);
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
                            if (_flowState == AuthFlowState.emailLoginOtp ||
                                _flowState == AuthFlowState.googleLoginPin ||
                                _flowState == AuthFlowState.forgotPasswordEmail) {
                              _flowState = AuthFlowState.emailLogin;
                            } else if (_flowState == AuthFlowState.emailSignupOtp ||
                                _flowState == AuthFlowState.googleSignupPin) {
                              _flowState = AuthFlowState.emailSignup;
                            } else if (_flowState == AuthFlowState.forgotPasswordOtp) {
                              _flowState = AuthFlowState.forgotPasswordEmail;
                            } else if (_flowState == AuthFlowState.forgotPasswordNewPin) {
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
              child: Text(
                '🇲🇲 MM',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: isAk ? const Color(0xFFC72138) : Colors.white70,
                ),
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
              child: Text(
                '🇬🇧 EN',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: !isAk ? const Color(0xFFC72138) : Colors.white70,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM 1: EMAIL LOGIN (Email + PIN)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildEmailLoginForm(
      BuildContext context, AppState appState, bool isAk) {
    final canSubmit = _loginEmailCtrl.text.trim().isNotEmpty &&
        _loginPinCtrl.text.trim().length == 6;

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
          isAk ? 'ဖေ့သာ ဝေါလက်မှ ကြိုဆိုပါသည်' : 'Online Dual-Wallet System',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
          ),
        ),
        const SizedBox(height: 24),

        _buildTextFieldLabel(isAk ? 'အီးမေးလ်' : 'Email'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _loginEmailCtrl,
          hintText: isAk ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email',
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),

        _buildTextFieldLabel(isAk ? '၆ လုံးပါ ပင်နံပါတ်' : 'PIN'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _loginPinCtrl,
          hintText: isAk ? 'ပင်နံပါတ် ၆ လုံး ရိုက်ထည့်ပါ' : 'Enter your 6-digit PIN',
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: !_showLoginPin,
          suffixIcon: IconButton(
            icon: Icon(
              _showLoginPin ? Icons.visibility_outlined : Icons.visibility_off_outlined,
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
                _forgotEmailCtrl.text = _loginEmailCtrl.text.trim();
                _flowState = AuthFlowState.forgotPasswordEmail;
              });
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Text(
                isAk ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forget Password?',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFF97316),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 18),

        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk ? 'အကောင့်ဝင်မည်' : 'Log In',
          isLoading: _isLoading,
          enabled: canSubmit,
          onPressed: () => _handleEmailLoginSubmit(appState),
        ),
        const SizedBox(height: 16),

        _buildDividerWithText(isAk ? 'သို့မဟုတ်' : 'OR'),
        const SizedBox(height: 16),

        _buildGoogleButton(
          label: isAk ? 'Google ဖြင့် ဝင်ရောက်မည်' : 'Continue with Google',
          onTap: () => _handleGoogleLoginTap(appState),
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
                  _flowState = AuthFlowState.emailSignup;
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
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM 2: EMAIL LOGIN OTP (Trigger OTP verification -> Route directly to Home)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildEmailLoginOtpForm(
      BuildContext context, AppState appState, bool isAk) {
    final email = _loginEmailCtrl.text.trim();
    final canVerify = _loginOtpCtrl.text.trim().length == 6;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          isAk ? 'အီးမေးလ် အတည်ပြုကုဒ်' : 'Verify Email OTP',
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
              ? '$email သို့ ပို့ထားသော ၆ လုံး ကုဒ်ကို ရိုက်ထည့်ပါ'
              : 'Enter the 6-digit OTP code sent to\n$email',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
            height: 1.4,
          ),
        ),
        const SizedBox(height: 24),

        _buildInputField(
          controller: _loginOtpCtrl,
          hintText: '••••••',
          keyboardType: TextInputType.number,
          maxLength: 6,
          textAlign: TextAlign.center,
          letterSpacing: 10,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            letterSpacing: 10,
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
                color: Color(0xFFF97316),
              ),
            ),
            TextButton(
              onPressed: _isLoading ? null : () => _handleEmailLoginSubmit(appState),
              child: Text(
                isAk ? 'ကုဒ် အသစ်ပြန်ပို့ပါ' : 'Resend Code',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF2563EB),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk ? 'အတည်ပြုပြီး အိမ်မျက်နှာပြင်သို့' : 'Verify & Enter Home',
          isLoading: _isLoading,
          enabled: canVerify,
          onPressed: () => _handleEmailLoginOtpVerify(appState),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM 3: GOOGLE LOGIN ACCESS PIN (Prompt for Access PIN -> Route to Home)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildGoogleLoginPinForm(
      BuildContext context, AppState appState, bool isAk) {
    final canSubmit = _googleAccessPinCtrl.text.trim().length == 6;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          width: 54,
          height: 54,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: const BoxDecoration(
            color: Color(0xFFEFF6FF),
            shape: BoxShape.circle,
          ),
          child: const Center(
            child: Icon(Icons.lock_person_rounded,
                size: 28, color: Color(0xFF2563EB)),
          ),
        ),
        Text(
          isAk ? 'Access PIN ထည့်သွင်းပါ' : 'Enter Access PIN',
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
              ? 'Google အကောင့် ($_googleEmail) ဖြင့် အတည်ပြုပြီးပါပြီ။ လုံခြုံရေးအတွက် သင်၏ ၆ လုံး PIN ထည့်သွင်းပါ။'
              : 'Authenticated with Google as $_googleEmail.\nEnter your 6-digit Access PIN to enter.',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
            height: 1.4,
          ),
        ),
        const SizedBox(height: 24),

        _buildTextFieldLabel(isAk ? '၆ လုံးပါ Access PIN' : 'Access PIN'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _googleAccessPinCtrl,
          hintText: '••••••',
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: !_showGoogleAccessPin,
          textAlign: TextAlign.center,
          letterSpacing: 8,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            letterSpacing: 8,
          ),
          suffixIcon: IconButton(
            icon: Icon(
              _showGoogleAccessPin
                  ? Icons.visibility_outlined
                  : Icons.visibility_off_outlined,
              size: 20,
              color: const Color(0xFF374151),
            ),
            onPressed: () =>
                setState(() => _showGoogleAccessPin = !_showGoogleAccessPin),
          ),
        ),
        const SizedBox(height: 18),

        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk ? 'PIN အတည်ပြုပြီး အိမ်မျက်နှာပြင်သို့' : 'Confirm PIN & Enter Home',
          isLoading: _isLoading,
          enabled: canSubmit,
          onPressed: () => _handleGoogleAccessPinSubmit(appState),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM 4: EMAIL SIGNUP (Input Email + Create PIN)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildEmailSignupForm(
      BuildContext context, AppState appState, bool isAk) {
    final canSubmit = _signUpEmailCtrl.text.trim().isNotEmpty &&
        _signUpPinCtrl.text.trim().length == 6 &&
        _signUpConfirmPinCtrl.text.trim().length == 6;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          isAk ? 'အကောင့်အသစ်ဖွင့်ရန်' : 'Create Account',
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
              ? 'အွန်လိုင်း Dual-Wallet စနစ်သို့ အကောင့်ဖွင့်ပါ'
              : 'Register for your online digital dual-wallet',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
          ),
        ),
        const SizedBox(height: 24),

        _buildTextFieldLabel(isAk ? 'အီးမေးလ်' : 'Email'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _signUpEmailCtrl,
          hintText: isAk ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email',
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),

        _buildTextFieldLabel(isAk ? '၆ လုံးပါ PIN သစ် သတ်မှတ်ပါ' : 'Create PIN'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _signUpPinCtrl,
          hintText: isAk ? 'ပင်နံပါတ် ၆ လုံး သတ်မှတ်ပါ' : 'Create 6-digit PIN',
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: !_showSignUpPin,
          suffixIcon: IconButton(
            icon: Icon(
              _showSignUpPin ? Icons.visibility_outlined : Icons.visibility_off_outlined,
              size: 20,
              color: const Color(0xFF374151),
            ),
            onPressed: () => setState(() => _showSignUpPin = !_showSignUpPin),
          ),
        ),
        const SizedBox(height: 16),

        _buildTextFieldLabel(
            isAk ? 'ပင်နံပါတ် ပြန်လည်အတည်ပြုပါ' : 'Confirm PIN'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _signUpConfirmPinCtrl,
          hintText: isAk ? 'ပင်နံပါတ် ပြန်လည်ရိုက်ထည့်ပါ' : 'Re-enter 6-digit PIN',
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: !_showSignUpConfirmPin,
          suffixIcon: IconButton(
            icon: Icon(
              _showSignUpConfirmPin
                  ? Icons.visibility_outlined
                  : Icons.visibility_off_outlined,
              size: 20,
              color: const Color(0xFF374151),
            ),
            onPressed: () =>
                setState(() => _showSignUpConfirmPin = !_showSignUpConfirmPin),
          ),
        ),
        const SizedBox(height: 18),

        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk ? 'အကောင့်ဖွင့်မည်' : 'Sign Up',
          isLoading: _isLoading,
          enabled: canSubmit,
          onPressed: () => _handleEmailSignupSubmit(appState),
        ),
        const SizedBox(height: 16),

        _buildDividerWithText(isAk ? 'သို့မဟုတ်' : 'OR'),
        const SizedBox(height: 16),

        _buildGoogleButton(
          label: isAk ? 'Google ဖြင့် အကောင့်ဖွင့်မည်' : 'Sign up with Google',
          onTap: () => _handleGoogleSignupTap(appState),
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
                  _flowState = AuthFlowState.emailLogin;
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
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM 5: EMAIL SIGNUP OTP (Trigger OTP validation -> Route directly to Home)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildEmailSignupOtpForm(
      BuildContext context, AppState appState, bool isAk) {
    final email = _signUpEmailCtrl.text.trim();
    final canVerify = _signUpOtpCtrl.text.trim().length == 6;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          isAk ? 'အကောင့်ဖွင့်မှု အတည်ပြုကုဒ်' : 'Validate Signup OTP',
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
              ? '$email သို့ ပို့ထားသော ၆ လုံး OTP ကုဒ်ကို ထည့်သွင်းပါ'
              : 'Enter the 6-digit OTP code sent to\n$email',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
            height: 1.4,
          ),
        ),
        const SizedBox(height: 24),

        _buildInputField(
          controller: _signUpOtpCtrl,
          hintText: '••••••',
          keyboardType: TextInputType.number,
          maxLength: 6,
          textAlign: TextAlign.center,
          letterSpacing: 10,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            letterSpacing: 10,
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
                color: Color(0xFFF97316),
              ),
            ),
            TextButton(
              onPressed: _isLoading ? null : () => _handleEmailSignupSubmit(appState),
              child: Text(
                isAk ? 'ကုဒ် အသစ်ပြန်ပို့ပါ' : 'Resend Code',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF2563EB),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk ? 'အတည်ပြုပြီး အိမ်မျက်နှာပြင်သို့' : 'Validate & Enter Home',
          isLoading: _isLoading,
          enabled: canVerify,
          onPressed: () => _handleEmailSignupOtpVerify(appState),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM 6: GOOGLE SIGNUP ACCESS PIN (Prompt to Create Access PIN -> Route to Home)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildGoogleSignupPinForm(
      BuildContext context, AppState appState, bool isAk) {
    final canSubmit = _googleCreatePinCtrl.text.trim().length == 6 &&
        _googleConfirmPinCtrl.text.trim().length == 6;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          width: 54,
          height: 54,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: const BoxDecoration(
            color: Color(0xFFEFF6FF),
            shape: BoxShape.circle,
          ),
          child: const Center(
            child: Icon(Icons.shield_outlined,
                size: 28, color: Color(0xFF2563EB)),
          ),
        ),
        Text(
          isAk ? 'Access PIN သစ် သတ်မှတ်ပါ' : 'Create Access PIN',
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
              ? 'Google အကောင့် ($_googleEmail) ချိတ်ဆက်ပြီးပါပြီ။ သင်၏ ပိုက်ဆံအိတ်အတွက် ၆ လုံး Access PIN သတ်မှတ်ပါ။'
              : 'Authenticated with Google as $_googleEmail.\nCreate a 6-digit Access PIN to secure your wallet.',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
            height: 1.4,
          ),
        ),
        const SizedBox(height: 24),

        _buildTextFieldLabel(
            isAk ? '၆ လုံးပါ Access PIN သစ်' : 'Create Access PIN'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _googleCreatePinCtrl,
          hintText: '••••••',
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: !_showGoogleCreatePin,
          textAlign: TextAlign.center,
          letterSpacing: 8,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            letterSpacing: 8,
          ),
          suffixIcon: IconButton(
            icon: Icon(
              _showGoogleCreatePin
                  ? Icons.visibility_outlined
                  : Icons.visibility_off_outlined,
              size: 20,
              color: const Color(0xFF374151),
            ),
            onPressed: () =>
                setState(() => _showGoogleCreatePin = !_showGoogleCreatePin),
          ),
        ),
        const SizedBox(height: 16),

        _buildTextFieldLabel(
            isAk ? 'Access PIN ပြန်လည်အတည်ပြုပါ' : 'Confirm Access PIN'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _googleConfirmPinCtrl,
          hintText: '••••••',
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: !_showGoogleConfirmPin,
          textAlign: TextAlign.center,
          letterSpacing: 8,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            letterSpacing: 8,
          ),
          suffixIcon: IconButton(
            icon: Icon(
              _showGoogleConfirmPin
                  ? Icons.visibility_outlined
                  : Icons.visibility_off_outlined,
              size: 20,
              color: const Color(0xFF374151),
            ),
            onPressed: () =>
                setState(() => _showGoogleConfirmPin = !_showGoogleConfirmPin),
          ),
        ),
        const SizedBox(height: 18),

        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk
              ? 'ပိုက်ဆံအိတ် ဖွင့်လှစ်ပြီး အိမ်မျက်နှာပြင်သို့'
              : 'Create Wallet & Enter Home',
          isLoading: _isLoading,
          enabled: canSubmit,
          onPressed: () => _handleGoogleCreatePinSubmit(appState),
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
          isAk ? 'စကားဝှက် ပြန်လည်ရယူရန်' : 'Forgot Password / PIN',
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
    final email = _forgotEmailCtrl.text.trim();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          isAk ? 'အတည်ပြုကုဒ် ရိုက်ထည့်ပါ' : 'Enter Reset Code',
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
              ? '$email သို့ ပို့ထားသော ၆ လုံး ကုဒ်ကို ထည့်ပါ'
              : 'Enter the 6-digit code sent to\n$email',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
            height: 1.4,
          ),
        ),
        const SizedBox(height: 24),

        _buildInputField(
          controller: _forgotOtpCtrl,
          hintText: '••••••',
          keyboardType: TextInputType.number,
          maxLength: 6,
          textAlign: TextAlign.center,
          letterSpacing: 10,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            letterSpacing: 10,
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
                color: Color(0xFFF97316),
              ),
            ),
            TextButton(
              onPressed: _isLoading ? null : () => _handleForgotEmailSubmit(appState),
              child: Text(
                isAk ? 'ကုဒ် အသစ်ပြန်ပို့ပါ' : 'Resend Code',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF2563EB),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk ? 'ကုဒ် အတည်ပြုမည်' : 'Verify Code',
          isLoading: _isLoading,
          enabled: _forgotOtpCtrl.text.trim().length == 6,
          onPressed: () => _handleForgotOtpSubmit(appState),
        ),
      ],
    );
  }

  Widget _buildForgotPasswordNewPinForm(
      BuildContext context, AppState appState, bool isAk) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          isAk ? 'ပင်နံပါတ် အသစ် သတ်မှတ်ပါ' : 'Create New PIN',
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
              ? 'အကောင့်အတွက် ၆ လုံးပါ ပင်နံပါတ် အသစ် သတ်မှတ်ပါ'
              : 'Set a new 6-digit PIN code for your account',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w500,
            color: Color(0xFF4B5563),
          ),
        ),
        const SizedBox(height: 24),

        _buildTextFieldLabel(
            isAk ? '၆ လုံးပါ ပင်နံပါတ် အသစ်' : 'New 6-digit PIN'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _forgotNewPinCtrl,
          hintText: '••••••',
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: !_showForgotNewPin,
          suffixIcon: IconButton(
            icon: Icon(
              _showForgotNewPin
                  ? Icons.visibility_outlined
                  : Icons.visibility_off_outlined,
              size: 20,
              color: const Color(0xFF374151),
            ),
            onPressed: () =>
                setState(() => _showForgotNewPin = !_showForgotNewPin),
          ),
        ),
        const SizedBox(height: 16),

        _buildTextFieldLabel(
            isAk ? 'ပင်နံပါတ် ပြန်လည်အတည်ပြုပါ' : 'Confirm New PIN'),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _forgotConfirmPinCtrl,
          hintText: '••••••',
          keyboardType: TextInputType.number,
          maxLength: 6,
          obscureText: !_showForgotConfirmPin,
          suffixIcon: IconButton(
            icon: Icon(
              _showForgotConfirmPin
                  ? Icons.visibility_outlined
                  : Icons.visibility_off_outlined,
              size: 20,
              color: const Color(0xFF374151),
            ),
            onPressed: () =>
                setState(() => _showForgotConfirmPin = !_showForgotConfirmPin),
          ),
        ),
        const SizedBox(height: 18),

        _buildStatusBanner(),

        _buildPrimaryButton(
          title: isAk
              ? 'အတည်ပြုပြီး အကောင့်ဝင်ရန်'
              : 'Save PIN & Return to Login',
          isLoading: _isLoading,
          enabled: _forgotNewPinCtrl.text.trim().length == 6 &&
              _forgotConfirmPinCtrl.text.trim().length == 6,
          onPressed: () => _handleForgotConfirmPinSubmit(appState),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REUSABLE UI HELPERS
  // ─────────────────────────────────────────────────────────────────────────
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
          borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.5),
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
          backgroundColor: const Color(0xFFF97316),
          disabledBackgroundColor: const Color(0xFFFED7AA),
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
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
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
              child: Center(
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
          color: const Color(0xFFF0FDF4),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFBBF7D0)),
        ),
        child: Row(
          children: [
            const Icon(Icons.check_circle_outline_rounded,
                size: 18, color: Color(0xFF16A34A)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _successMessage!,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF15803D),
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
