import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../services/firebase_service.dart';
import '../theme.dart';

class FirebaseAuthDialog extends StatefulWidget {
  final String language;

  const FirebaseAuthDialog({Key? key, required this.language}) : super(key: key);

  static void show(BuildContext context, String language) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => FirebaseAuthDialog(language: language),
    );
  }

  @override
  State<FirebaseAuthDialog> createState() => _FirebaseAuthDialogState();
}

class _FirebaseAuthDialogState extends State<FirebaseAuthDialog> {
  final FirebaseService _fbService = FirebaseService();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController(text: '+959');
  final _otpCtrl = TextEditingController();

  int _selectedTab = 0; // 0: Email, 1: Phone, 2: Google
  bool _isSignUpMode = false;
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  // Phone OTP
  String? _verificationId;
  bool _isOtpSent = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _phoneCtrl.dispose();
    _otpCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleEmailAuth() async {
    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text.trim();

    if (email.isEmpty || pass.isEmpty) {
      setState(() => _errorMessage = widget.language == 'ak' ? 'အီးမေးလ်နှင့် စကားဝှက် ရိုက်ထည့်ပါ' : 'Please enter email and password');
      return;
    }
    if (_isSignUpMode && pass.length < 8) {
      setState(() => _errorMessage = widget.language == 'ak' ? 'စကားဝှက် အနည်းဆုံး ၈ လုံး ရှိရပါမည်' : 'Password must be at least 8 characters');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      if (_isSignUpMode) {
        await _fbService.signUpWithEmail(email: email, password: pass);
        setState(() => _successMessage = widget.language == 'ak' ? 'အကောင့်သစ် ဖွင့်လှစ်ပြီးပါပြီ!' : 'Account registered successfully!');
      } else {
        await _fbService.signInWithEmail(email: email, password: pass);
        setState(() => _successMessage = widget.language == 'ak' ? 'အကောင့်ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်!' : 'Signed in successfully!');
      }
      Future.delayed(const Duration(milliseconds: 900), () {
        if (mounted) Navigator.pop(context);
      });
    } on FirebaseAuthException catch (e) {
      setState(() => _errorMessage = e.message ?? e.code);
    } catch (e) {
      setState(() => _errorMessage = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final userCred = await _fbService.signInWithGoogle();
      if (userCred != null) {
        setState(() => _successMessage = widget.language == 'ak' ? 'Google ဖြင့် အကောင့်ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်!' : 'Signed in with Google successfully!');
        Future.delayed(const Duration(milliseconds: 900), () {
          if (mounted) Navigator.pop(context);
        });
      }
    } catch (e) {
      setState(() => _errorMessage = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleSendPhoneOtp() async {
    final phone = _phoneCtrl.text.trim();
    if (phone.isEmpty) {
      setState(() => _errorMessage = widget.language == 'ak' ? 'ဖုန်းနံပါတ် ရိုက်ထည့်ပါ' : 'Please enter phone number');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      await _fbService.verifyPhoneNumber(
        phoneNumber: phone,
        verificationCompleted: (cred) {
          setState(() {
            _successMessage = widget.language == 'ak' ? 'ဖုန်းအလိုအလျောက် အတည်ပြုပြီးပါပြီ!' : 'Phone verified automatically!';
            _isLoading = false;
          });
          Navigator.pop(context);
        },
        verificationFailed: (e) {
          setState(() {
            _errorMessage = e.message ?? e.code;
            _isLoading = false;
          });
        },
        codeSent: (verificationId, resendToken) {
          setState(() {
            _verificationId = verificationId;
            _isOtpSent = true;
            _isLoading = false;
            _successMessage = widget.language == 'ak' ? 'SMS ကုဒ် ပေးပို့ပြီးပါပြီ' : 'SMS verification code sent';
          });
        },
        codeAutoRetrievalTimeout: (verificationId) {
          _verificationId = verificationId;
        },
      );
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _handleVerifyPhoneOtp() async {
    final code = _otpCtrl.text.trim();
    if (code.length < 6 || _verificationId == null) {
      setState(() => _errorMessage = widget.language == 'ak' ? '၆ လုံးကုဒ် ရိုက်ထည့်ပါ' : 'Please enter 6-digit SMS code');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await _fbService.verifySmsCode(verificationId: _verificationId!, smsCode: code);
      setState(() => _successMessage = widget.language == 'ak' ? 'ဖုန်းဖြင့် ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်!' : 'Phone signed in successfully!');
      Future.delayed(const Duration(milliseconds: 900), () {
        if (mounted) Navigator.pop(context);
      });
    } catch (e) {
      setState(() => _errorMessage = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentUser = _fbService.currentUser;
    final lang = widget.language;

    return Container(
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: BoxDecoration(
        color: isDark ? surfaceDark : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 20)],
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.cloud_done, color: gold, size: 22),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          lang == 'ak' ? 'ဖေ့သာ Firebase ဘဏ္ဍာရေးအကောင့်' : 'PeThar Firebase Backend',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        const Text(
                          'Project: pe-thar (Auth & Firestore)',
                          style: TextStyle(fontSize: 11, fontFamily: 'monospace', color: Colors.grey),
                        ),
                      ],
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Active User Status Card
            if (currentUser != null)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: emeraldSuccess.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: emeraldSuccess.withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: emeraldSuccess, size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            lang == 'ak' ? 'အကောင့်ဝင်ရောက်ထားပြီးပါသည်' : 'Authenticated via Firebase',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: emeraldSuccess),
                          ),
                          Text(
                            currentUser.email ?? currentUser.phoneNumber ?? currentUser.uid,
                            style: const TextStyle(fontSize: 11, fontFamily: 'monospace'),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: () async {
                        await _fbService.signOut();
                        setState(() {});
                      },
                      child: Text(lang == 'ak' ? 'ထွက်မည်' : 'Sign Out', style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                    ),
                  ],
                ),
              ),

            // Error / Success Banners
            if (_errorMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.red.withOpacity(0.3)),
                ),
                child: Text(_errorMessage!, style: const TextStyle(color: Colors.red, fontSize: 11)),
              ),
            if (_successMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.green.withOpacity(0.3)),
                ),
                child: Text(_successMessage!, style: const TextStyle(color: Colors.green, fontSize: 11)),
              ),

            // Tabs: 0 = Email, 1 = Phone, 2 = Google
            Row(
              children: [
                _buildTabButton(0, Icons.email_outlined, lang == 'ak' ? 'အီးမေးလ်' : 'Email'),
                const SizedBox(width: 8),
                _buildTabButton(1, Icons.phone_android, lang == 'ak' ? 'ဖုန်းနံပါတ်' : 'Phone OTP'),
                const SizedBox(width: 8),
                _buildTabButton(2, Icons.g_mobiledata, 'Google'),
              ],
            ),
            const SizedBox(height: 16),

            // Tab Content
            if (_selectedTab == 0) ...[
              // Email/Password
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: lang == 'ak' ? 'အီးမေးလ်လိပ်စာ' : 'Email Address',
                  prefixIcon: const Icon(Icons.email, size: 20),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _passCtrl,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: lang == 'ak' ? 'လျှို့ဝှက်စကားဝှက်' : 'Password',
                  prefixIcon: const Icon(Icons.lock, size: 20),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleEmailAuth,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber[700],
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _isLoading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(
                          _isSignUpMode
                              ? (lang == 'ak' ? 'အကောင့်သစ်ဖွင့်မည် (Register)' : 'Create Account')
                              : (lang == 'ak' ? 'အကောင့်ဝင်မည် (Sign In)' : 'Sign In with Email'),
                          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: TextButton(
                  onPressed: () => setState(() => _isSignUpMode = !_isSignUpMode),
                  child: Text(
                    _isSignUpMode
                        ? (lang == 'ak' ? 'အကောင့်ရှိပြီးပါက ဝင်ရောက်ရန်' : 'Already have an account? Sign In')
                        : (lang == 'ak' ? 'အကောင့်သစ် ဖွင့်လှစ်လိုပါသလား?' : "Don't have an account? Sign Up"),
                    style: const TextStyle(fontSize: 12, color: Colors.amber),
                  ),
                ),
              ),
            ] else if (_selectedTab == 1) ...[
              // Phone Auth
              if (!_isOtpSent) ...[
                TextField(
                  controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    labelText: lang == 'ak' ? 'ဖုန်းနံပါတ် (+95...)' : 'Phone Number (+95...)',
                    prefixIcon: const Icon(Icons.phone, size: 20),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleSendPhoneOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber[700],
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: _isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : Text(
                            lang == 'ak' ? 'SMS ၆ လုံးကုဒ် ရယူမည်' : 'Send SMS Verification Code',
                            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ] else ...[
                TextField(
                  controller: _otpCtrl,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: 8),
                  decoration: InputDecoration(
                    labelText: lang == 'ak' ? 'SMS ကုဒ် ၆ လုံး' : 'Enter 6-digit Code',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleVerifyPhoneOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green[700],
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: _isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : Text(
                            lang == 'ak' ? 'အတည်ပြုပြီး အကောင့်ဝင်မည်' : 'Verify & Sign In',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            ] else if (_selectedTab == 2) ...[
              // Google Sign-In
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100],
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.account_circle, size: 48, color: Colors.amber),
                    const SizedBox(height: 10),
                    Text(
                      lang == 'ak'
                          ? 'Google အကောင့်ဖြင့် တစ်ချက်နှိပ် အမြန်ဝင်ရောက်ပါ'
                          : 'One-click sign-in with your Google Account',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.login, color: Colors.black),
                        label: Text(
                          lang == 'ak' ? 'Google ဖြင့် ဝင်ရောက်မည်' : 'Sign In with Google',
                          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                        ),
                        onPressed: _isLoading ? null : _handleGoogleSignIn,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.black,
                          elevation: 2,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTabButton(int index, IconData icon, String label) {
    final isSelected = _selectedTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() {
          _selectedTab = index;
          _errorMessage = null;
          _successMessage = null;
        }),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? Colors.amber.withOpacity(0.2) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? Colors.amber : Colors.grey.withOpacity(0.3),
              width: 1.5,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, size: 18, color: isSelected ? Colors.amber : Colors.grey),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? Colors.amber : Colors.grey,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
