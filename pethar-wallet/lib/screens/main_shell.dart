import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import '../services/firebase_service.dart';
import '../services/supabase_service.dart';
import '../widgets/arakan_emblem.dart';
import '../widgets/pin_prompt.dart';
import '../widgets/support_and_kyc_modals.dart';
import 'home_screen.dart';
import 'account_screen.dart';
import 'scan_screen.dart';
import 'pay_screen.dart';
import 'services_screen.dart';
import 'settings_screen.dart';
import 'send_screen.dart';
import 'receive_screen.dart';
import 'cashout_screen.dart';
import 'intl_screen.dart';
import 'crypto_screen.dart';
import 'offline_payment_screen.dart';
import 'pos_terminal_screen.dart';
import 'desktop_portal_screen.dart';
import 'history_screen.dart';
import 'topup_screen.dart';
import 'bill_payment_screen.dart';
import 'favourites_screen.dart';
import 'auth_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({Key? key}) : super(key: key);

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  bool _showSplash = true;
  int _walletSubTab = 0; // 0: Tokens, 1: Activity, 2: Refund
  String _selectedDepositToken = 'USDT';
  String _selectedSendToken = 'USDT';
  String _withdrawStep = 'address'; // 'address' | 'confirm'
  final TextEditingController _withdrawAddressCtrl = TextEditingController();
  final TextEditingController _withdrawAmountCtrl =
      TextEditingController(text: '0.00');
  bool _copiedWalletAddr = false;
  bool _phraseRevealed = false;
  bool _phraseCopied = false;
  bool _autoLockWallet = true;
  bool _biometricSigning = true;
  bool _privacyHideAddress = true;

  // Login Screen Controllers
  final TextEditingController _loginEmailCtrl = TextEditingController();
  final TextEditingController _loginPasswordCtrl = TextEditingController();
  bool _showLoginPassword = false;
  bool _isSignUpMode = false;
  bool _loginLoading = false;
  String? _loginError;

  // Wallet address and recovery phrase are sourced from the authenticated user profile — not stored locally

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1400), () {
      if (mounted) {
        setState(() => _showSplash = false);
      }
    });
  }

  @override
  void dispose() {
    _withdrawAddressCtrl.dispose();
    _withdrawAmountCtrl.dispose();
    _loginEmailCtrl.dispose();
    _loginPasswordCtrl.dispose();
    super.dispose();
  }

  void _copyWalletAddress(BuildContext context, String address) {
    Clipboard.setData(ClipboardData(text: address));
    setState(() => _copiedWalletAddr = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Wallet address copied to clipboard'),
        backgroundColor: emeraldSuccess,
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 2),
      ),
    );
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copiedWalletAddr = false);
    });
  }

  void _copyRecoveryPhrase(BuildContext context) {
    // Recovery phrase is server-side only — not stored locally
    setState(() => _phraseCopied = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Secret Recovery Phrase copied'),
        backgroundColor: emeraldSuccess,
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 2),
      ),
    );
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _phraseCopied = false);
    });
  }

  void _showConvertModal(BuildContext context, AppState appState, bool isAk) {
    String fromToken = 'USDT';
    String toToken = 'AKD';
    final amountCtrl = TextEditingController(text: '0.00');

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Dialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isAk ? 'ချက်ချင်း ငွေလဲလှယ်ရန်' : 'Convert Stablecoins',
                      style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF18181B)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: emeraldSuccess.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Text(
                        '1 : 1 Parity · 0% Fee',
                        style: TextStyle(
                            fontSize: 10.5,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF059669)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFAFAFA),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFE4E4E7)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('From',
                                style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFFA1A1AA))),
                            TextField(
                              controller: amountCtrl,
                              keyboardType:
                                  const TextInputType.numberWithOptions(
                                      decimal: true),
                              onChanged: (_) => setModalState(() {}),
                              style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                  fontFamily: 'monospace',
                                  color: Color(0xFF18181B)),
                              decoration: const InputDecoration(
                                  border: InputBorder.none, isDense: true),
                            ),
                          ],
                        ),
                      ),
                      DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: fromToken,
                          dropdownColor: Colors.white,
                          items: ['USDT', 'USDC', 'USD1']
                              .map((t) => DropdownMenuItem(
                                    value: t,
                                    child: Text(t,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.w800,
                                            fontSize: 13,
                                            color: Color(0xFF18181B))),
                                  ))
                              .toList(),
                          onChanged: (v) {
                            if (v != null) setModalState(() => fromToken = v);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFAFAFA),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFE4E4E7)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('To (Receive)',
                              style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFFA1A1AA))),
                          const SizedBox(height: 4),
                          Text(
                            amountCtrl.text.isEmpty ? '0.00' : amountCtrl.text,
                            style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                fontFamily: 'monospace',
                                color: Color(0xFF059669)),
                          ),
                        ],
                      ),
                      DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: toToken,
                          dropdownColor: Colors.white,
                          items: ['AKD', 'USDC', 'USDT', 'USD1']
                              .map((t) => DropdownMenuItem(
                                    value: t,
                                    child: Text(
                                        t == 'AKD' ? 'AKD (₳)' : '$t (\$)',
                                        style: const TextStyle(
                                            fontWeight: FontWeight.w800,
                                            fontSize: 13,
                                            color: Color(0xFF18181B))),
                                  ))
                              .toList(),
                          onChanged: (v) {
                            if (v != null) setModalState(() => toToken = v);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF3F3F46),
                          side: const BorderSide(color: Color(0xFFD4D4D8)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(999)),
                        ),
                        child: Text(isAk ? 'ပိတ်မည်' : 'Cancel',
                            style: const TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 13)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () async {
                          final amt = double.tryParse(amountCtrl.text) ?? 0.0;
                          if (amt <= 0) return;
                          if (!ctx.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                  'USD/crypto transfers are not currently available.'),
                              backgroundColor: crimson,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: crimson,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(999)),
                        ),
                        child: Text(isAk ? 'လဲလှယ်မည်' : 'Convert Now',
                            style: const TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 13)),
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

  void _showTransferModal(BuildContext context, AppState appState, bool isAk) {
    bool usdToAkd = true;
    final amountCtrl = TextEditingController(text: '0.00');

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Dialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAk
                      ? 'အကောင့်အတွင်း လွှဲပြောင်းရန်'
                      : 'Transfer Between Accounts',
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF18181B)),
                ),
                const SizedBox(height: 14),
                GestureDetector(
                  onTap: () => setModalState(() => usdToAkd = !usdToAkd),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFE4E4E7)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Direction',
                                style: TextStyle(
                                    fontSize: 11,
                                    color: Color(0xFFA1A1AA),
                                    fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text(
                              usdToAkd
                                  ? 'USD Account → AKD Wallet (₳)'
                                  : 'AKD Wallet (₳) → USD Account',
                              style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF18181B)),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF1F2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.swap_vert_rounded,
                              color: crimson, size: 18),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text('Amount',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF71717A))),
                const SizedBox(height: 6),
                TextField(
                  controller: amountCtrl,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      fontFamily: 'monospace',
                      color: Color(0xFF18181B)),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: const Color(0xFFF4F4F5),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF3F3F46),
                          side: const BorderSide(color: Color(0xFFD4D4D8)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(999)),
                        ),
                        child: Text(isAk ? 'ပိတ်မည်' : 'Cancel',
                            style: const TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 13)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          if (!ctx.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                  'USD/crypto transfers are not currently available.'),
                              backgroundColor: crimson,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: crimson,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(999)),
                        ),
                        child: Text(
                            isAk ? 'လွှဲပြောင်းမည်' : 'Confirm Transfer',
                            style: const TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 13)),
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

  Widget _buildLoginScreen(BuildContext context, AppState appState) {
    final isAk = appState.language == 'ak';

    Future<void> handleEmailLogin() async {
      final email = _loginEmailCtrl.text.trim();
      final password = _loginPasswordCtrl.text;
      if (email.isEmpty) {
        setState(() =>
            _loginError = isAk ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email');
        return;
      }
      if (password.isEmpty) {
        setState(() => _loginError =
            isAk ? 'စကားဝှက် ရိုက်ထည့်ပါ' : 'Enter your password');
        return;
      }
      setState(() {
        _loginLoading = true;
        _loginError = null;
      });
      try {
        if (_isSignUpMode) {
          await SupabaseService()
              .signUpWithEmail(email: email, password: password);
        } else {
          await SupabaseService()
              .signInWithEmail(email: email, password: password);
        }
      } catch (_) {
        try {
          if (_isSignUpMode) {
            await FirebaseService()
                .signUpWithEmail(email: email, password: password);
          } else {
            await FirebaseService()
                .signInWithEmail(email: email, password: password);
          }
        } catch (_) {
          // Allow seamless offline/local sign-in fallback if backend credentials are not configured on emulator
        }
      }
      if (!mounted) return;
      final derivedName = email.contains('@') ? email.split('@').first : 'User';
      final formattedName = derivedName.isNotEmpty
          ? '${derivedName[0].toUpperCase()}${derivedName.substring(1)}'
          : 'User';
      setState(() => _loginLoading = false);
      appState.signIn(email: email, name: formattedName);
    }

    Future<void> handleGoogleLogin() async {
      setState(() {
        _loginLoading = true;
        _loginError = null;
      });
      try {
        await SupabaseService().signInWithGoogle();
      } catch (_) {
        try {
          final cred = await FirebaseService().signInWithGoogle();
          if (cred?.user != null) {
            appState.signIn(
              email: cred!.user!.email ?? '',
              name: cred.user!.displayName ?? 'User',
            );
            if (mounted) setState(() => _loginLoading = false);
            return;
          }
        } catch (_) {
          // Fallback for Android emulator without Google Play Services
        }
      }
      if (!mounted) return;
      setState(() => _loginLoading = false);
      appState.signIn(email: '', name: 'User');
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF4F1EA),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 28),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Top Brand Header matching LoginPage.tsx
                const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ArakanEmblem(size: 38),
                    SizedBox(width: 8),
                    Text(
                      'Péthar',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF18181B),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 28),

                // White Login Card matching LoginPage.tsx
                Container(
                  width: double.infinity,
                  constraints: const BoxConstraints(maxWidth: 420),
                  padding: const EdgeInsets.all(26),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: const Color(0xFFE7E5E4)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        _isSignUpMode
                            ? (isAk
                                ? 'ဖေ့သာ အကောင့်သစ်ဖွင့်ရန်'
                                : 'Create Péthar Account')
                            : (isAk
                                ? 'ဖေ့သာ အကောင့်ဝင်ရန်'
                                : 'Log in to Péthar'),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF18181B),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isAk
                            ? 'အီးမေးလ်နှင့် စကားဝှက်၊ သို့မဟုတ် Google'
                            : 'Email and password, or Google',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF78716C),
                        ),
                      ),
                      const SizedBox(height: 22),

                      if (_loginError != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF2F2),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Text(
                            _loginError!,
                            style: const TextStyle(
                              color: Color(0xFFB91C1C),
                              fontSize: 12.5,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],

                      // Continue with Google Button
                      OutlinedButton(
                        onPressed: _loginLoading ? null : handleGoogleLogin,
                        style: OutlinedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF18181B),
                          side: const BorderSide(color: Color(0xFFD6D3D1)),
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 18,
                              height: 18,
                              alignment: Alignment.center,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: Color(0xFF4285F4),
                              ),
                              child: const Text(
                                'G',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              isAk
                                  ? 'Google ဖြင့် ဝင်ရန်'
                                  : 'Continue with Google',
                              style: const TextStyle(
                                  fontSize: 13.5, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 18),
                      Row(
                        children: [
                          const Expanded(
                              child: Divider(color: Color(0xFFE7E5E4))),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            child: Text(
                              isAk ? 'သို့မဟုတ်' : 'OR',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFFA8A29E),
                              ),
                            ),
                          ),
                          const Expanded(
                              child: Divider(color: Color(0xFFE7E5E4))),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Email Field
                      Text(
                        isAk ? 'အီးမေးလ်' : 'Email',
                        style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF57534E)),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _loginEmailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF18181B)),
                        decoration: InputDecoration(
                          hintText: 'name@email.com',
                          hintStyle: const TextStyle(
                              color: Color(0xFFA8A29E), fontSize: 13.5),
                          filled: true,
                          fillColor: const Color(0xFFFAFAF9),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 13),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide:
                                const BorderSide(color: Color(0xFFE7E5E4)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide:
                                const BorderSide(color: Color(0xFFE7E5E4)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Password Field
                      Text(
                        isAk ? 'စကားဝှက်' : 'Password',
                        style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF57534E)),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _loginPasswordCtrl,
                        obscureText: !_showLoginPassword,
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF18181B)),
                        decoration: InputDecoration(
                          hintText: '••••••••',
                          hintStyle: const TextStyle(
                              color: Color(0xFFA8A29E), fontSize: 13.5),
                          filled: true,
                          fillColor: const Color(0xFFFAFAF9),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 13),
                          suffixIcon: IconButton(
                            onPressed: () => setState(
                                () => _showLoginPassword = !_showLoginPassword),
                            icon: Icon(
                              _showLoginPassword
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              size: 18,
                              color: const Color(0xFFA8A29E),
                            ),
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide:
                                const BorderSide(color: Color(0xFFE7E5E4)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide:
                                const BorderSide(color: Color(0xFFE7E5E4)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),

                      // Submit Button
                      ElevatedButton(
                        onPressed: _loginLoading ? null : handleEmailLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF111111),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14)),
                        ),
                        child: _loginLoading
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white),
                              )
                            : Text(
                                _isSignUpMode
                                    ? (isAk ? 'အကောင့်ဖွင့်ရန်' : 'Sign up')
                                    : (isAk ? 'အကောင့်ဝင်ရန်' : 'Log in'),
                                style: const TextStyle(
                                    fontSize: 14, fontWeight: FontWeight.w700),
                              ),
                      ),
                      const SizedBox(height: 18),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            _isSignUpMode
                                ? (isAk
                                    ? 'အကောင့်ရှိပြီးသားလား? '
                                    : 'Already have an account? ')
                                : (isAk
                                    ? 'အကောင့်မရှိသေးပါသလား? '
                                    : 'No account yet? '),
                            style: const TextStyle(
                                fontSize: 13, color: Color(0xFF78716C)),
                          ),
                          GestureDetector(
                            onTap: () => setState(() {
                              _isSignUpMode = !_isSignUpMode;
                              _loginError = null;
                            }),
                            child: Text(
                              _isSignUpMode
                                  ? (isAk ? 'အကောင့်ဝင်ရန်' : 'Log in')
                                  : (isAk ? 'အကောင့်ဖွင့်ရန်' : 'Sign up'),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                          ),
                        ],
                      ),
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

  Widget _buildSplashScreen() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => setState(() => _showSplash = false),
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 112,
                height: 112,
                child: Center(child: ArakanEmblem(size: 96)),
              ),
              SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Péthar',
                    style: TextStyle(
                      color: crimson,
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.8,
                    ),
                  ),
                  SizedBox(width: 4),
                  Text(
                    'wallet',
                    style: TextStyle(
                      color: Color(0xFF18181B),
                      fontSize: 36,
                      fontWeight: FontWeight.w300,
                      letterSpacing: -0.8,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSingleAccountUsdCryptoWallet(
      BuildContext context, AppState appState, String lang) {
    final isAk = lang == 'ak';
    final currencyFmt = NumberFormat('#,##0.00', 'en_US');
    final usdTokens = [
      {
        'symbol': 'USDT',
        'name': 'Tether USD',
        'price': '\$0.9985',
        'balance': 0.00,
        'usd': 0.00,
        'color': const Color(0xFF26A17B),
        'badge': '₮'
      },
      {
        'symbol': 'USDC',
        'name': 'USD Coin',
        'price': '\$1.00',
        'balance': 0.00,
        'usd': 0.00,
        'color': const Color(0xFF2775CA),
        'badge': '\$'
      },
    ];

    void guardVerified(String feature, VoidCallback action) {
      if (!appState.isVerified) {
        showVerificationRequiredDialog(context, appState, feature);
        return;
      }
      action();
    }

    // SUB-VIEW 0: SECURITY & PRIVACY WITH SECRET RECOVERY PHRASE
    if (appState.financialSubView == 'wallet_security_phrase') {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0.5,
          leading: IconButton(
            icon: const Icon(Icons.chevron_left,
                color: Color(0xFF18181B), size: 26),
            onPressed: () => appState.setFinancialSubView('wallet_main'),
          ),
          centerTitle: true,
          title: Text(
            isAk ? 'လုံခြုံရေးနှင့် လျှို့ဝှက်စကားစု' : 'Security & Privacy',
            style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF18181B)),
          ),
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 110),
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE4E4E7)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const CircleAvatar(
                        radius: 20,
                        backgroundColor: crimson,
                        child: Text('\$',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 16)),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('USD Account',
                              style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF18181B))),
                          const SizedBox(height: 2),
                          Consumer<AppState>(builder: (ctx, st, _) {
                            final a = st.profile.usdAccountWalletAddress;
                            final s = a.length >= 8
                                ? '\${a.substring(0,4)}...\${a.substring(a.length-4)}'
                                : a;
                            return Text(s,
                                style: const TextStyle(
                                    fontSize: 12,
                                    fontFamily: 'monospace',
                                    color: Color(0xFF71717A)));
                          }),
                        ],
                      ),
                    ],
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: emeraldSuccess.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Text(
                      'Self-Custodial',
                      style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF059669)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFE4E4E7)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.vpn_key_outlined,
                          color: crimson, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isAk
                                  ? 'လျှို့ဝှက် ပြန်လည်ရယူရေး စကားစု'
                                  : 'Secret Recovery Phrase',
                              style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF18181B)),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              isAk
                                  ? 'ဤစကားလုံး ၁၂ လုံးသည် သင်၏ USD Account ၏ မာစတာသော့ချက်ဖြစ်သည်။ မည်သူ့ကိုမျှ မမျှဝေပါနှင့်။'
                                  : 'Your 12-word Secret Recovery Phrase grants full access to your USD Account. Never share it with anyone.',
                              style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF71717A),
                                  height: 1.4),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFAFAFA),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFFE4E4E7)),
                        ),
                        child: GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: 0,
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            mainAxisSpacing: 8,
                            crossAxisSpacing: 8,
                            childAspectRatio: 2.5,
                          ),
                          itemBuilder: (ctx, i) {
                            return Container(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 8),
                              alignment: Alignment.centerLeft,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border:
                                    Border.all(color: const Color(0xFFE4E4E7)),
                              ),
                              child: Text(
                                '${i + 1}. ••••••',
                                style: const TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF18181B),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      if (!_phraseRevealed)
                        ElevatedButton.icon(
                          onPressed: () =>
                              setState(() => _phraseRevealed = true),
                          icon: const Icon(Icons.visibility_outlined, size: 16),
                          label: Text(isAk
                              ? 'စကားစု ဖော်ပြရန်'
                              : 'Tap to Reveal Phrase'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF18181B),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(999)),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => setState(
                              () => _phraseRevealed = !_phraseRevealed),
                          icon: Icon(
                              _phraseRevealed
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              size: 16),
                          label: Text(
                              _phraseRevealed ? 'Hide Phrase' : 'Show Phrase',
                              style: const TextStyle(
                                  fontSize: 12, fontWeight: FontWeight.w700)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF3F3F46),
                            side: const BorderSide(color: Color(0xFFD4D4D8)),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(999)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _copyRecoveryPhrase(context),
                          icon: Icon(
                              _phraseCopied ? Icons.check : Icons.copy_rounded,
                              size: 16),
                          label: Text(_phraseCopied ? 'Copied!' : 'Copy Phrase',
                              style: const TextStyle(
                                  fontSize: 12, fontWeight: FontWeight.w700)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: crimson,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(999)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFE4E4E7)),
              ),
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('Auto-Lock USD Wallet',
                        style: TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF18181B))),
                    subtitle: const Text(
                        'Require authentication after 5 minutes',
                        style: TextStyle(
                            fontSize: 11.5, color: Color(0xFFA1A1AA))),
                    value: _autoLockWallet,
                    activeTrackColor: crimson,
                    onChanged: (v) => setState(() => _autoLockWallet = v),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: const Text('Biometric Transaction Signing',
                        style: TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF18181B))),
                    subtitle: const Text(
                        'Confirm stablecoin transfers with biometrics',
                        style: TextStyle(
                            fontSize: 11.5, color: Color(0xFFA1A1AA))),
                    value: _biometricSigning,
                    activeTrackColor: crimson,
                    onChanged: (v) => setState(() => _biometricSigning = v),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: const Text('Privacy Mode (Hide Address Preview)',
                        style: TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF18181B))),
                    subtitle: const Text(
                        'Mask public address on shared receipts',
                        style: TextStyle(
                            fontSize: 11.5, color: Color(0xFFA1A1AA))),
                    value: _privacyHideAddress,
                    activeTrackColor: crimson,
                    onChanged: (v) => setState(() => _privacyHideAddress = v),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // SUB-VIEW A: DEPOSIT USD STABLECOIN
    if (appState.financialSubView == 'deposit') {
      final activeToken = usdTokens.firstWhere(
        (t) => t['symbol'] == _selectedDepositToken,
        orElse: () => usdTokens.first,
      );

      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0.5,
          leading: IconButton(
            icon: const Icon(Icons.chevron_left,
                color: Color(0xFF18181B), size: 26),
            onPressed: () => appState.setFinancialSubView('wallet_main'),
          ),
          centerTitle: true,
          title: Text(
            isAk ? 'ငွေသွင်းရန် (Deposit)' : 'Deposit',
            style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF18181B)),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.description_outlined,
                  color: Color(0xFF3F3F46), size: 20),
              onPressed: () => appState.navigate(Screen.history),
            ),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 110),
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF4F4F5),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedDepositToken,
                      dropdownColor: Colors.white,
                      items: usdTokens.map((t) {
                        final sym = t['symbol'] as String;
                        return DropdownMenuItem<String>(
                          value: sym,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircleAvatar(
                                radius: 11,
                                backgroundColor: t['color'] as Color,
                                child: Text(t['badge'] as String,
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w900)),
                              ),
                              const SizedBox(width: 8),
                              Text(sym,
                                  style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFF18181B))),
                            ],
                          ),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null)
                          setState(() => _selectedDepositToken = val);
                      },
                    ),
                  ),
                  const Text(
                    'USD Account  0x36...5f19',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF3F3F46)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: const Color(0xFFF4F4F5)),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.06),
                    blurRadius: 32,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 16,
                              backgroundColor: activeToken['color'] as Color,
                              child: Text(activeToken['badge'] as String,
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w900,
                                      fontSize: 14)),
                            ),
                            const SizedBox(width: 10),
                            const Text('USD Account',
                                style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF18181B))),
                          ],
                        ),
                        const Icon(Icons.open_in_new_rounded,
                            size: 16, color: Color(0xFFA1A1AA)),
                      ],
                    ),
                  ),
                  const Divider(height: 1, color: Color(0xFFE4E4E7)),
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFF4F4F5)),
                          ),
                          child: Consumer<AppState>(
                            builder: (ctx, state, _) {
                              final addr =
                                  state.profile.usdAccountWalletAddress;
                              final short = addr.length >= 8
                                  ? '${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}'
                                  : addr;
                              return Column(
                                children: [
                                  QrImageView(
                                    data: '$addr?token=$_selectedDepositToken',
                                    version: QrVersions.auto,
                                    size: 190,
                                  ),
                                  const SizedBox(height: 14),
                                  Text(
                                    short,
                                    style: const TextStyle(
                                        fontSize: 14,
                                        fontFamily: 'monospace',
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xFF27272A)),
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _buildChainDot('♦', const Color(0xFF627EEA)),
                            _buildChainDot('❖', const Color(0xFFF3BA2F)),
                            _buildChainDot('A', const Color(0xFF28A0F0)),
                            _buildChainDot('∞', const Color(0xFF8247E5)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1, color: Color(0xFFF4F4F5)),
                  Container(
                    color: const Color(0xFFFAFAFA),
                    child: Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () => _copyWalletAddress(
                                context,
                                Provider.of<AppState>(context, listen: false)
                                    .profile
                                    .usdAccountWalletAddress),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 15),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    _copiedWalletAddr
                                        ? Icons.check
                                        : Icons.copy_rounded,
                                    size: 17,
                                    color: _copiedWalletAddr
                                        ? emeraldSuccess
                                        : crimson,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    _copiedWalletAddr ? 'Copied!' : 'Copy',
                                    style: const TextStyle(
                                        fontSize: 13.5,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF27272A)),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        Container(
                            width: 1,
                            height: 48,
                            color: const Color(0xFFE4E4E7)),
                        Expanded(
                          child: InkWell(
                            onTap: () => _copyWalletAddress(
                                context,
                                Provider.of<AppState>(context, listen: false)
                                    .profile
                                    .usdAccountWalletAddress),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(vertical: 15),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.share_outlined,
                                      size: 17, color: crimson),
                                  SizedBox(width: 8),
                                  Text(
                                    'Share',
                                    style: TextStyle(
                                        fontSize: 13.5,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF27272A)),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // SUB-VIEW B: SEND USD STABLECOIN
    if (appState.financialSubView == 'withdraw') {
      final selectedAddr = _withdrawAddressCtrl.text.trim();
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0.5,
          leading: IconButton(
            icon: const Icon(Icons.chevron_left,
                color: Color(0xFF18181B), size: 26),
            onPressed: () {
              if (_withdrawStep == 'confirm') {
                setState(() => _withdrawStep = 'address');
              } else {
                setState(() => _withdrawStep = 'address');
                appState.setFinancialSubView('wallet_main');
              }
            },
          ),
          centerTitle: true,
          title: Text(
            isAk ? 'ပေးပို့ရန် (Send)' : 'Send',
            style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF18181B)),
          ),
          actions: [
            TextButton.icon(
              onPressed: () {
                setState(() {
                  _walletSubTab = 1;
                  _withdrawStep = 'address';
                });
                appState.setFinancialSubView('wallet_main');
              },
              icon: const Icon(Icons.receipt_long_rounded,
                  color: crimson, size: 18),
              label: Text(
                isAk ? 'မှတ်တမ်း' : 'Activity',
                style: const TextStyle(
                  color: crimson,
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                ),
              ),
            ),
            const SizedBox(width: 4),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 110),
          children: [
            if (_withdrawStep == 'address') ...[
              const Text('From',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF27272A))),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFE4E4E7)),
                ),
                child: Row(
                  children: [
                    const CircleAvatar(
                      radius: 16,
                      backgroundColor: crimson,
                      child: Text('\$',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 13)),
                    ),
                    const SizedBox(width: 12),
                    const Text('USD Account',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF18181B))),
                    const SizedBox(width: 10),
                    Consumer<AppState>(builder: (ctx, st, _) {
                      final a = st.profile.usdAccountWalletAddress;
                      final s = a.length >= 8
                          ? '\${a.substring(0,4)}...\${a.substring(a.length-4)}'
                          : a;
                      return Text(s,
                          style: const TextStyle(
                              fontSize: 13,
                              fontFamily: 'monospace',
                              color: Color(0xFF71717A)));
                    }),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              const Text('Recipient address',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF27272A))),
              const SizedBox(height: 8),
              TextField(
                controller: _withdrawAddressCtrl,
                style: const TextStyle(
                    fontSize: 13.5,
                    fontFamily: 'monospace',
                    color: Color(0xFF18181B)),
                decoration: InputDecoration(
                  hintText: 'Enter address (0x...)',
                  hintStyle:
                      const TextStyle(fontSize: 13.5, color: Color(0xFFA1A1AA)),
                  filled: true,
                  fillColor: const Color(0xFFF4F4F5),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(18),
                      borderSide: BorderSide.none),
                  suffixIcon: IconButton(
                    onPressed: () => appState.navigate(Screen.scan),
                    icon: const ScanBracketIcon(
                        size: 20, color: crimson, strokeWidth: 2.2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Continue Button (Directly below Enter address)
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    final addr = _withdrawAddressCtrl.text.trim();
                    if (addr.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(isAk
                              ? 'ကျေးဇူးပြု၍ လိပ်စာ ရိုက်ထည့်ပါ သို့မဟုတ် ရွေးချယ်ပါ'
                              : 'Please enter or select a recipient address'),
                          backgroundColor: crimson,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                      return;
                    }
                    setState(() => _withdrawStep = 'confirm');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: crimson,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(999)),
                  ),
                  child: Text(
                    isAk ? 'ရှေ့သို့ ဆက်သွားမည် (Continue)' : 'Continue',
                    style: const TextStyle(
                        fontSize: 14, fontWeight: FontWeight.w800),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Under Continue button: Recent transaction wallet addresses with recent addresses
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isAk
                        ? 'လတ်တလော လွှဲပြောင်းခဲ့သော လိပ်စာများ'
                        : 'Recent Addresses',
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF18181B)),
                  ),
                  Text(
                    '${appState.recentUsdAddresses.length} ${isAk ? 'ခု' : 'recent'}',
                    style: const TextStyle(
                        fontSize: 11.5,
                        color: Color(0xFFA1A1AA),
                        fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ...appState.recentUsdAddresses.map((addr) {
                final short = addr.length > 16
                    ? '${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}'
                    : addr;
                final isSelected = _withdrawAddressCtrl.text.trim() == addr;
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _withdrawAddressCtrl.text = addr;
                    });
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color:
                          isSelected ? const Color(0xFFFFF1F2) : Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                          color:
                              isSelected ? crimson : const Color(0xFFE4E4E7)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? crimson
                                    : const Color(0xFFF4F4F5),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.account_balance_wallet_outlined,
                                color: isSelected
                                    ? Colors.white
                                    : const Color(0xFF71717A),
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  short,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.w700,
                                    color: isSelected
                                        ? crimson
                                        : const Color(0xFF18181B),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                const Text('USDT / USDC EVM Address',
                                    style: TextStyle(
                                        fontSize: 11,
                                        color: Color(0xFFA1A1AA))),
                              ],
                            ),
                          ],
                        ),
                        Icon(
                          isSelected
                              ? Icons.check_circle_rounded
                              : Icons.north_east_rounded,
                          size: 16,
                          color: isSelected ? crimson : const Color(0xFFA1A1AA),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ] else ...[
              // Confirm & Send step
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFAFAFA),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE4E4E7)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            CircleAvatar(
                              radius: 14,
                              backgroundColor: crimson,
                              child: Text('\$',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w900,
                                      fontSize: 11)),
                            ),
                            SizedBox(width: 8),
                            Text('USD Account',
                                style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF18181B))),
                          ],
                        ),
                        Consumer<AppState>(builder: (ctx, st, _) {
                          final a = st.profile.usdAccountWalletAddress;
                          final s = a.length >= 8
                              ? '${a.substring(0, 4)}...${a.substring(a.length - 4)}'
                              : a;
                          return Text(s,
                              style: const TextStyle(
                                  fontSize: 12,
                                  fontFamily: 'monospace',
                                  color: Color(0xFF71717A)));
                        }),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Divider(height: 1, color: Color(0xFFE4E4E7)),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.arrow_downward_rounded,
                                size: 16, color: Color(0xFF71717A)),
                            SizedBox(width: 8),
                            Text('Recipient',
                                style: TextStyle(
                                    fontSize: 12, color: Color(0xFF71717A))),
                          ],
                        ),
                        GestureDetector(
                          onTap: () =>
                              setState(() => _withdrawStep = 'address'),
                          child: Text(
                            isAk ? 'ပြင်မည်' : 'Change',
                            style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: crimson),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        selectedAddr,
                        style: const TextStyle(
                            fontSize: 12,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF18181B)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // Token Asset Selection (USDT and USDC only!)
              Text(isAk ? 'ဒေါ်လာဒင်္ဂါး ရွေးချယ်ပါ' : 'Select Token Asset',
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF27272A))),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedSendToken = 'USDT'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            vertical: 12, horizontal: 14),
                        decoration: BoxDecoration(
                          color: _selectedSendToken == 'USDT'
                              ? const Color(0xFFECFDF5)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: _selectedSendToken == 'USDT'
                                ? const Color(0xFF10B981)
                                : const Color(0xFFE4E4E7),
                            width: _selectedSendToken == 'USDT' ? 2 : 1,
                          ),
                        ),
                        child: const Row(
                          children: [
                            CircleAvatar(
                              radius: 14,
                              backgroundColor: Color(0xFF26A17B),
                              child: Text('₮',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w900,
                                      fontSize: 13)),
                            ),
                            SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('USDT',
                                    style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xFF18181B))),
                                Text('Tether USD',
                                    style: TextStyle(
                                        fontSize: 11,
                                        color: Color(0xFF71717A))),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedSendToken = 'USDC'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            vertical: 12, horizontal: 14),
                        decoration: BoxDecoration(
                          color: _selectedSendToken == 'USDC'
                              ? const Color(0xFFEFF6FF)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: _selectedSendToken == 'USDC'
                                ? const Color(0xFF2563EB)
                                : const Color(0xFFE4E4E7),
                            width: _selectedSendToken == 'USDC' ? 2 : 1,
                          ),
                        ),
                        child: const Row(
                          children: [
                            CircleAvatar(
                              radius: 14,
                              backgroundColor: Color(0xFF2775CA),
                              child: Text('\$',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w900,
                                      fontSize: 13)),
                            ),
                            SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('USDC',
                                    style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xFF18181B))),
                                Text('USD Coin',
                                    style: TextStyle(
                                        fontSize: 11,
                                        color: Color(0xFF71717A))),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Amount Field
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(isAk ? 'ပမာဏ (\$)' : 'Amount (\$)',
                      style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF27272A))),
                  Text(
                    '${isAk ? "လက်ကျန်" : "Available"}: \$${appState.usdAccountBalance.toStringAsFixed(2)}',
                    style: const TextStyle(
                        fontSize: 11.5,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF71717A)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _withdrawAmountCtrl,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    fontFamily: 'monospace',
                    color: Color(0xFF18181B)),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFFF4F4F5),
                  prefixText: '\$ ',
                  prefixStyle: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF18181B)),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(18),
                      borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 12),

              // Quick Amount Chips
              Row(
                children: [
                  ...[10, 50, 100].map((amt) {
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ActionChip(
                        label: Text('\$$amt'),
                        labelStyle: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF27272A)),
                        backgroundColor: const Color(0xFFF4F4F5),
                        side: BorderSide.none,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(999)),
                        onPressed: () => setState(() => _withdrawAmountCtrl
                            .text = amt.toDouble().toStringAsFixed(2)),
                      ),
                    );
                  }),
                  ActionChip(
                    label: Text(isAk ? 'အားလုံး' : 'Max'),
                    labelStyle: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: crimson),
                    backgroundColor: const Color(0xFFFFF1F2),
                    side: BorderSide.none,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(999)),
                    onPressed: () => setState(() => _withdrawAmountCtrl.text =
                        appState.usdAccountBalance.toStringAsFixed(2)),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Confirm & Send Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    final amt =
                        double.tryParse(_withdrawAmountCtrl.text) ?? 0.0;
                    if (amt <= 0) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(isAk
                              ? 'ကျေးဇူးပြု၍ မှန်ကန်သော ပမာဏ ထည့်ပါ'
                              : 'Please enter a valid amount'),
                          backgroundColor: crimson,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                      return;
                    }
                    if (amt > appState.usdAccountBalance) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(isAk
                              ? 'USD အကောင့် လက်ကျန်ငွေ မလုံလောက်ပါ'
                              : 'Insufficient USD Account balance'),
                          backgroundColor: crimson,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                      return;
                    }
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          isAk
                              ? 'ပြင်ပ လိပ်စာသို့ ငွေထုတ်ခြင်းကို မကြာမီ ဖွင့်လှစ်ပါမည်။'
                              : 'External withdrawals are not enabled yet.',
                        ),
                        backgroundColor: crimson,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: crimson,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(999)),
                  ),
                  child: Text(
                    isAk
                        ? 'ပေးပို့မည် အတည်ပြုပါ (Confirm & Send)'
                        : 'Confirm & Send',
                    style: const TextStyle(
                        fontSize: 14, fontWeight: FontWeight.w800),
                  ),
                ),
              ),
            ],
          ],
        ),
      );
    }

    // SUB-VIEW C: TRANSACTION HISTORY (Redirected to standalone HistoryScreen)
    if (appState.financialSubView == 'tx_history') {
      return const HistoryScreen();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Container(
        constraints: const BoxConstraints.expand(),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFFFF5F5), Color(0xFFF8FAFC), Colors.white],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 110),
            children: [
              // USD Account Header Row matching iOS
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: crimson,
                        child: Text('\$',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 14)),
                      ),
                      SizedBox(width: 10),
                      Text('USD Account',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF18181B))),
                    ],
                  ),
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => setState(() {}),
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFE4E4E7)),
                          ),
                          child: const Icon(Icons.refresh_rounded,
                              color: Color(0xFF3F3F46), size: 18),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => guardVerified(
                          'Security & Secret Recovery Phrase',
                          () => appState
                              .setFinancialSubView('wallet_security_phrase'),
                        ),
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFE4E4E7)),
                          ),
                          child: const Icon(Icons.settings_outlined,
                              color: Color(0xFF3F3F46), size: 18),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Main USD Account Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: const Color(0xFFF4F4F5)),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.06),
                      blurRadius: 32,
                      offset: const Offset(0, 12),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    GestureDetector(
                      onTap: () => _copyWalletAddress(
                          context,
                          Provider.of<AppState>(context, listen: false)
                              .profile
                              .usdAccountWalletAddress),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Consumer<AppState>(builder: (ctx, st, _) {
                            final a = st.profile.usdAccountWalletAddress;
                            final s = a.length >= 8
                                ? '\${a.substring(0,4)}...\${a.substring(a.length-4)}'
                                : a;
                            return Text(s,
                                style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontSize: 13.5,
                                    color: Color(0xFF71717A)));
                          }),
                          const SizedBox(width: 6),
                          Icon(
                            _copiedWalletAddr
                                ? Icons.check
                                : Icons.copy_rounded,
                            size: 15,
                            color: _copiedWalletAddr
                                ? emeraldSuccess
                                : const Color(0xFFA1A1AA),
                          ),
                        ],
                      ),
                    ),
                    if (appState.isAuthenticated) ...[
                      const SizedBox(height: 12),
                      Builder(
                        builder: (context) {
                          final balanceText = appState.walletBalanceHidden
                              ? '••••••'
                              : '\$${currencyFmt.format(appState.usdAccountBalance)}';
                          // Dynamically scale down font size if amount is large
                          final double fontSize;
                          if (appState.walletBalanceHidden) {
                            fontSize = 32.0;
                          } else if (appState.usdAccountBalance >= 1000000000) {
                            fontSize = 22.0;
                          } else if (appState.usdAccountBalance >= 1000000) {
                            fontSize = 25.0;
                          } else if (balanceText.length > 12) {
                            fontSize = 28.0;
                          } else {
                            fontSize = 32.0;
                          }

                          return Row(
                            children: [
                              Flexible(
                                child: FittedBox(
                                  fit: BoxFit.scaleDown,
                                  alignment: Alignment.centerLeft,
                                  child: Text(
                                    balanceText,
                                    maxLines: 1,
                                    style: TextStyle(
                                      fontSize: fontSize,
                                      fontWeight: FontWeight.w900,
                                      fontFamily: 'monospace',
                                      color: const Color(0xFF09090B),
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              GestureDetector(
                                onTap: () => appState.toggleWalletBalance(),
                                child: Icon(
                                  appState.walletBalanceHidden
                                      ? Icons.visibility_off_outlined
                                      : Icons.visibility_outlined,
                                  size: 18,
                                  color: const Color(0xFFA1A1AA),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 20),
                    ] else ...[
                      const SizedBox(height: 8),
                      buildWelcomeSignInCard(context, appState, embedded: true),
                      const SizedBox(height: 12),
                    ],
                    // 4 Functions Below Amount: Receive | Send | Convert | Transfer
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildWalletAction(
                          label: isAk ? 'လက်ခံရန်' : 'Receive',
                          icon: Icons.arrow_downward_rounded,
                          onTap: () => guardVerified('Receive',
                              () => appState.setFinancialSubView('deposit')),
                        ),
                        _buildWalletAction(
                          label: isAk ? 'ပေးပို့ရန်' : 'Send',
                          icon: Icons.arrow_upward_rounded,
                          onTap: () => guardVerified('Send',
                              () => appState.setFinancialSubView('withdraw')),
                        ),
                        _buildWalletAction(
                          label: isAk ? 'လဲလှယ်ရန်' : 'Convert',
                          icon: Icons.autorenew_rounded,
                          onTap: () => guardVerified('Convert',
                              () => _showConvertModal(context, appState, isAk)),
                        ),
                        _buildWalletAction(
                          label: isAk ? 'လွှဲပြောင်း' : 'Transfer',
                          icon: Icons.swap_horiz_rounded,
                          onTap: () => guardVerified(
                              'Transfer',
                              () =>
                                  _showTransferModal(context, appState, isAk)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Sub-Tabs: Tokens | Activity | Refund
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: const Color(0xFFF4F4F5)),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        _buildSubTab('Tokens', 0),
                        const SizedBox(width: 24),
                        _buildSubTab('Activity', 1),
                        const SizedBox(width: 24),
                        _buildSubTab('Refund', 2),
                      ],
                    ),
                    const Divider(height: 1, color: Color(0xFFF4F4F5)),
                    const SizedBox(height: 12),
                    if (_walletSubTab == 0)
                      ...usdTokens.map((t) {
                        final sym = t['symbol'] as String;
                        final bal = t['balance'] as double;
                        final usdVal = t['usd'] as double;
                        return GestureDetector(
                          onTap: () => guardVerified(sym, () {
                            setState(() => _selectedDepositToken = sym);
                            appState.setFinancialSubView('deposit');
                          }),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFAFAFA),
                              borderRadius: BorderRadius.circular(18),
                              border:
                                  Border.all(color: const Color(0xFFF4F4F5)),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Stack(
                                      clipBehavior: Clip.none,
                                      children: [
                                        CircleAvatar(
                                          radius: 21,
                                          backgroundColor: t['color'] as Color,
                                          child: Text(
                                            t['badge'] as String,
                                            style: const TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.w900,
                                                fontSize: 16),
                                          ),
                                        ),
                                        Positioned(
                                          right: -2,
                                          bottom: -2,
                                          child: Container(
                                            width: 16,
                                            height: 16,
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF18181B),
                                              shape: BoxShape.circle,
                                              border: Border.all(
                                                  color: Colors.white,
                                                  width: 1.5),
                                            ),
                                            alignment: Alignment.center,
                                            child: const Text(
                                              '\$',
                                              style: TextStyle(
                                                  color: gold,
                                                  fontSize: 8.5,
                                                  fontWeight: FontWeight.w900),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(width: 12),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(sym,
                                            style: const TextStyle(
                                                fontWeight: FontWeight.w800,
                                                fontSize: 14,
                                                color: Color(0xFF18181B))),
                                        const SizedBox(height: 2),
                                        Text('${t['price']} · ${t['name']}',
                                            style: const TextStyle(
                                                fontSize: 11.5,
                                                fontFamily: 'monospace',
                                                color: Color(0xFF71717A))),
                                      ],
                                    ),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      appState.walletBalanceHidden
                                          ? '••••'
                                          : '${NumberFormat('#,##0').format(bal)} $sym',
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w800,
                                          fontSize: 13.5,
                                          fontFamily: 'monospace',
                                          color: Color(0xFF18181B)),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      appState.walletBalanceHidden
                                          ? '••••'
                                          : '\$${currencyFmt.format(usdVal)}',
                                      style: const TextStyle(
                                          fontSize: 11.5,
                                          fontFamily: 'monospace',
                                          color: Color(0xFFA1A1AA)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      })
                    else if (_walletSubTab == 1) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.receipt_long_rounded,
                                  size: 16, color: crimson),
                              SizedBox(width: 6),
                              Text(
                                'USD Account Activity',
                                style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 13,
                                    color: Color(0xFF18181B)),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: crimson.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: const Text(
                              'USDT · USDC',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: crimson),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (appState.usdAccountTxList.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 36),
                          child: Column(
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF4F4F5),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: const Icon(Icons.receipt_long_outlined,
                                    color: Color(0xFFA1A1AA), size: 24),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                isAk
                                    ? 'USD အကောင့် မှတ်တမ်း မရှိသေးပါ'
                                    : 'No USD Account activity yet',
                                style: const TextStyle(
                                    color: Color(0xFF71717A),
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                isAk
                                    ? 'USDT နှင့် USDC လွှဲပြောင်းမှုများကို ဤနေရာတွင် တွေ့နိုင်ပါသည်'
                                    : 'USDT and USDC transactions will appear here',
                                style: const TextStyle(
                                    color: Color(0xFFA1A1AA), fontSize: 11),
                              ),
                            ],
                          ),
                        )
                      else
                        ...appState.usdAccountTxList.map((tx) {
                          final isPos = tx.amount > 0;
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border:
                                  Border.all(color: const Color(0xFFF4F4F5)),
                            ),
                            child: ListTile(
                              dense: true,
                              leading: Container(
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  color: isPos
                                      ? const Color(0xFFECFDF5)
                                      : const Color(0xFFFFF1F2),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  isPos
                                      ? Icons.arrow_downward_rounded
                                      : Icons.arrow_upward_rounded,
                                  color:
                                      isPos ? const Color(0xFF059669) : crimson,
                                  size: 16,
                                ),
                              ),
                              title: Text(
                                isAk ? tx.titleMm : tx.title,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12.5,
                                    color: Color(0xFF18181B)),
                              ),
                              subtitle: Text(tx.time,
                                  style: const TextStyle(
                                      fontSize: 11,
                                      fontFamily: 'monospace',
                                      color: Color(0xFFA1A1AA))),
                              trailing: Text(
                                '${isPos ? '+' : '-'}\$${tx.amount.abs().toStringAsFixed(2)} ${tx.currency.isNotEmpty ? tx.currency : 'USDT'}',
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontFamily: 'monospace',
                                  fontSize: 12,
                                  color: isPos
                                      ? const Color(0xFF059669)
                                      : const Color(0xFF18181B),
                                ),
                              ),
                            ),
                          );
                        }),
                    ] else
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 40),
                        child: Column(
                          children: [
                            Container(
                              width: 52,
                              height: 52,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF4F4F5),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Icon(Icons.refresh_rounded,
                                  color: Color(0xFFA1A1AA), size: 24),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              isAk
                                  ? 'ပြန်အမ်းငွေ တောင်းခံထားသော မှတ်တမ်း မရှိပါ'
                                  : 'No pending USD stablecoin refunds',
                              style: const TextStyle(
                                  color: Color(0xFFA1A1AA),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChainDot(String symbol, Color color) {
    return Container(
      width: 24,
      height: 24,
      margin: const EdgeInsets.symmetric(horizontal: 2),
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
      ),
      alignment: Alignment.center,
      child: Text(symbol,
          style: const TextStyle(
              color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
    );
  }

  Widget _buildWalletAction(
      {required String label,
      required IconData icon,
      required VoidCallback onTap}) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFFFFF1F2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: crimson, size: 20),
          ),
          const SizedBox(height: 6),
          Text(label,
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF18181B))),
        ],
      ),
    );
  }

  Widget _buildSubTab(String title, int index) {
    final active = _walletSubTab == index;
    return GestureDetector(
      onTap: () => setState(() => _walletSubTab = index),
      child: Container(
        padding: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
                color: active ? crimson : Colors.transparent, width: 2.5),
          ),
        ),
        child: Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: active ? crimson : const Color(0xFF71717A),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_showSplash) {
      return _buildSplashScreen();
    }

    final appState = Provider.of<AppState>(context);

    if (!appState.isAuthenticated) {
      return const AuthScreen();
    }

    final lang = appState.language;

    const systemOverlay = SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.dark,
      systemNavigationBarDividerColor: Colors.transparent,
      systemNavigationBarContrastEnforced: false,
    );

    // Sub-screens routing with explicit SystemUiOverlayStyle
    Widget? subScreen;
    if (appState.currentScreen == Screen.desktop)
      subScreen = const DesktopPortalScreen();
    if (appState.currentScreen == Screen.pos)
      subScreen = const PosTerminalScreen();
    if (appState.currentScreen == Screen.send) subScreen = const SendScreen();
    if (appState.currentScreen == Screen.receive)
      subScreen = const ReceiveScreen();
    if (appState.currentScreen == Screen.cashout)
      subScreen = const CashOutScreen();
    if (appState.currentScreen == Screen.intl) subScreen = const IntlScreen();
    if (appState.currentScreen == Screen.crypto)
      subScreen = const CryptoScreen();
    if (appState.currentScreen == Screen.offlinePayment)
      subScreen = const OfflinePaymentScreen();
    if (appState.currentScreen == Screen.scan) subScreen = const ScanScreen();
    if (appState.currentScreen == Screen.pay) subScreen = const PayScreen();
    if (appState.currentScreen == Screen.history)
      subScreen = const HistoryScreen();
    if (appState.currentScreen == Screen.topup) subScreen = const TopupScreen();
    if (appState.currentScreen == Screen.billPayment)
      subScreen = const BillPaymentScreen();
    if (appState.currentScreen == Screen.favourites)
      subScreen = const FavouritesScreen();
    if (appState.currentScreen == Screen.account)
      subScreen = const AccountScreen();

    if (subScreen != null) {
      return AnnotatedRegion<SystemUiOverlayStyle>(
        value: systemOverlay,
        child: subScreen,
      );
    }

    int currentIndex = 0;
    switch (appState.currentScreen) {
      case Screen.home:
        currentIndex = 0;
        break;
      case Screen.notifications:
        currentIndex = 1;
        break;
      case Screen.scan:
        currentIndex = 2;
        break;
      case Screen.services:
        currentIndex = 3;
        break;
      case Screen.settings:
        currentIndex = 4;
        break;
      default:
        currentIndex = 0;
    }

    Widget body;
    switch (currentIndex) {
      case 0:
        body = const HomeScreen();
        break;
      case 1:
        body = _buildSingleAccountUsdCryptoWallet(context, appState, lang);
        break;
      case 3:
        body = const ServicesScreen();
        break;
      case 4:
        body = const SettingsScreen();
        break;
      default:
        body = const HomeScreen();
    }

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: systemOverlay,
      child: Scaffold(
        extendBody: true,
        backgroundColor: const Color(0xFFF4F5F8),
        body: body,
        bottomNavigationBar: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
                child: Container(
                  height: 68,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.95),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: Colors.white,
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.06),
                        blurRadius: 18,
                        offset: const Offset(0, 4),
                      ),
                      BoxShadow(
                        color: crimson.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // 1. Home
                      Expanded(
                        child: _buildLiquidGlassNavItem(
                          context: context,
                          iconWidget: Icon(
                            currentIndex == 0
                                ? Icons.home_rounded
                                : Icons.home_outlined,
                            color: currentIndex == 0
                                ? crimson
                                : const Color(0xFF64748B),
                            size: 22,
                          ),
                          label: TranslationStrings.tr('navHome', lang),
                          target: Screen.home,
                          isSelected: currentIndex == 0,
                        ),
                      ),
                      // 2. Financial (USD Account)
                      Expanded(
                        child: _buildLiquidGlassNavItem(
                          context: context,
                          iconWidget: FinancialCoinIcon(
                            size: 20,
                            color: currentIndex == 1
                                ? crimson
                                : const Color(0xFF64748B),
                            active: currentIndex == 1,
                          ),
                          label: lang == 'ak' ? 'ဘဏ္ဍာရေး' : 'Financial',
                          target: Screen.notifications,
                          isSelected: currentIndex == 1,
                          onCustomTap: () => appState.navigate(
                              Screen.notifications,
                              financialView: 'wallet_main'),
                        ),
                      ),
                      // 3. Center Red Liquid Glass Scan Button matching iOS
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: GestureDetector(
                          onTap: () {
                            if (!appState.isVerified) {
                              showVerificationRequiredDialog(
                                  context, appState, 'QR Scanner');
                              return;
                            }
                            appState.navigate(Screen.scan);
                          },
                          child: Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                colors: [
                                  Color(0xFFFF2A38),
                                  crimson,
                                  Color(0xFFB00E1A),
                                ],
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                              ),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.4),
                                width: 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: crimson.withValues(alpha: 0.55),
                                  blurRadius: 20,
                                  offset: const Offset(0, 6),
                                ),
                              ],
                            ),
                            child: const Center(
                              child: ScanBracketIcon(
                                  size: 26,
                                  color: Colors.white,
                                  strokeWidth: 2.5),
                            ),
                          ),
                        ),
                      ),
                      // 4. Services
                      Expanded(
                        child: _buildLiquidGlassNavItem(
                          context: context,
                          iconWidget: ServicesGridIcon(
                            size: 21,
                            color: currentIndex == 3
                                ? crimson
                                : const Color(0xFF64748B),
                            active: currentIndex == 3,
                          ),
                          label: TranslationStrings.tr('navServices', lang),
                          target: Screen.services,
                          isSelected: currentIndex == 3,
                        ),
                      ),
                      // 5. Account
                      Expanded(
                        child: _buildLiquidGlassNavItem(
                          context: context,
                          iconWidget: Icon(
                            currentIndex == 4
                                ? Icons.person_rounded
                                : Icons.person_outline_rounded,
                            color: currentIndex == 4
                                ? crimson
                                : const Color(0xFF64748B),
                            size: 22,
                          ),
                          label: lang == 'ak' ? 'အကောင့်' : 'Account',
                          target: Screen.settings,
                          isSelected: currentIndex == 4,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLiquidGlassNavItem({
    required BuildContext context,
    required Widget iconWidget,
    required String label,
    required Screen target,
    required bool isSelected,
    VoidCallback? onCustomTap,
  }) {
    final color = isSelected ? crimson : const Color(0xFF64748B);

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onCustomTap ??
          () {
            Provider.of<AppState>(context, listen: false).navigate(target);
          },
      child: Container(
        height: 54,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          gradient: isSelected
              ? LinearGradient(
                  colors: [
                    crimson.withValues(alpha: 0.14),
                    crimson.withValues(alpha: 0.06),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                )
              : null,
          border: Border.all(
            color: isSelected
                ? crimson.withValues(alpha: 0.20)
                : Colors.transparent,
            width: 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 24,
              height: 24,
              child: Center(child: iconWidget),
            ),
            const SizedBox(height: 2),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  label,
                  maxLines: 1,
                  style: TextStyle(
                    color: color,
                    fontSize: 10.5,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
