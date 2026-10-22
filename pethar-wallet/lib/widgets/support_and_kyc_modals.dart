import 'package:flutter/material.dart';
import '../app_state.dart';
import '../services/firebase_service.dart';
import '../theme.dart';
import 'arakan_emblem.dart';

/// Custom Scan Bracket Icon matching iOS NavScanBracketIcon
class ScanBracketIcon extends StatelessWidget {
  final double size;
  final Color color;
  final double strokeWidth;

  const ScanBracketIcon({
    Key? key,
    this.size = 24,
    this.color = Colors.white,
    this.strokeWidth = 2.4,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _ScanBracketPainter(color: color, strokeWidth: strokeWidth),
    );
  }
}

class _ScanBracketPainter extends CustomPainter {
  final Color color;
  final double strokeWidth;

  _ScanBracketPainter({required this.color, required this.strokeWidth});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final sx = size.width / 28.0;
    final sy = size.height / 28.0;

    final topPath = Path()
      ..moveTo(6.5 * sx, 10.5 * sy)
      ..lineTo(6.5 * sx, 8.8 * sy)
      ..cubicTo(6.5 * sx, 7.25 * sy, 7.75 * sx, 6.0 * sy, 9.3 * sx, 6.0 * sy)
      ..lineTo(18.7 * sx, 6.0 * sy)
      ..cubicTo(20.25 * sx, 6.0 * sy, 21.5 * sx, 7.25 * sy, 21.5 * sx, 8.8 * sy)
      ..lineTo(21.5 * sx, 10.5 * sy);

    final bottomPath = Path()
      ..moveTo(6.5 * sx, 17.5 * sy)
      ..lineTo(6.5 * sx, 19.2 * sy)
      ..cubicTo(6.5 * sx, 20.75 * sy, 7.75 * sx, 22.0 * sy, 9.3 * sx, 22.0 * sy)
      ..lineTo(18.7 * sx, 22.0 * sy)
      ..cubicTo(20.25 * sx, 22.0 * sy, 21.5 * sx, 20.75 * sy, 21.5 * sx, 19.2 * sy)
      ..lineTo(21.5 * sx, 17.5 * sy);

    canvas.drawPath(topPath, paint);
    canvas.drawPath(bottomPath, paint);
    canvas.drawLine(Offset(6.5 * sx, 14.0 * sy), Offset(21.5 * sx, 14.0 * sy), paint);
  }

  @override
  bool shouldRepaint(covariant _ScanBracketPainter oldDelegate) =>
      oldDelegate.color != color || oldDelegate.strokeWidth != strokeWidth;
}

/// Custom Services Grid Icon matching iOS NavServicesIcon (3 rounded squares + 1 bottom-right circle)
class ServicesGridIcon extends StatelessWidget {
  final double size;
  final Color color;
  final bool active;

  const ServicesGridIcon({
    Key? key,
    this.size = 22,
    required this.color,
    this.active = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _ServicesGridPainter(color: color, active: active),
    );
  }
}

class _ServicesGridPainter extends CustomPainter {
  final Color color;
  final bool active;

  _ServicesGridPainter({required this.color, required this.active});

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 24.0;
    final paint = Paint()
      ..color = color
      ..style = active ? PaintingStyle.fill : PaintingStyle.stroke
      ..strokeWidth = 1.9 * s;

    final r = Radius.circular((active ? 2.5 : 2.0) * s);
    final pad = active ? 3.0 : 3.5;
    final box = active ? 8.0 : 7.0;

    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(pad * s, pad * s, box * s, box * s), r),
      paint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH((pad + 10.0) * s, pad * s, box * s, box * s), r),
      paint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(pad * s, (pad + 10.0) * s, box * s, box * s), r),
      paint,
    );
    canvas.drawCircle(
      Offset(17.0 * s, 17.0 * s),
      (active ? 4.0 : 3.5) * s,
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant _ServicesGridPainter oldDelegate) =>
      oldDelegate.color != color || oldDelegate.active != active;
}

/// Custom Financial Circle $ Icon matching iOS NavFinancialIcon
class FinancialCoinIcon extends StatelessWidget {
  final double size;
  final Color color;
  final bool active;

  const FinancialCoinIcon({
    Key? key,
    this.size = 22,
    required this.color,
    this.active = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: active ? color : Colors.transparent,
        border: Border.all(
          color: color,
          width: active ? 1.6 : 1.9,
        ),
      ),
      alignment: Alignment.center,
      child: Text(
        '\$',
        style: TextStyle(
          color: active ? Colors.white : color,
          fontSize: size * 0.52,
          fontWeight: FontWeight.w900,
          height: 1.0,
        ),
      ),
    );
  }
}

/// Reusable "Without login yet" Welcome to Péthar Card (matching TrueMoney reference photo)
Widget buildWelcomeSignInCard(BuildContext context, AppState appState, {bool embedded = false}) {
  final isAk = appState.language == 'ak';
  final content = Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      Text(
        isAk ? 'ဖေ့သာမှ ကြိုဆိုပါသည်' : 'Welcome to Péthar',
        textAlign: TextAlign.center,
        style: const TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w800,
          color: Color(0xFF18181B),
        ),
      ),
      const SizedBox(height: 6),
      Text(
        isAk
            ? 'အက်ပ်ကို အသုံးပြုရန် အကောင့်ဝင်ပါ သို့မဟုတ် အကောင့်သစ်ဖွင့်ပါ။'
            : 'Please sign in or sign up to use the app.',
        textAlign: TextAlign.center,
        style: const TextStyle(
          fontSize: 13,
          color: Color(0xFF71717A),
          height: 1.35,
        ),
      ),
      const SizedBox(height: 16),
      ElevatedButton(
        onPressed: () => showSignInSignUpModal(context, appState),
        style: ElevatedButton.styleFrom(
          backgroundColor: crimson,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        ),
        child: Text(
          isAk ? 'အကောင့်ဝင်ရန် / အကောင့်ဖွင့်ရန်' : 'Sign in/Sign up',
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
        ),
      ),
    ],
  );

  if (embedded) {
    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: content,
    );
  }

  return Container(
    width: double.infinity,
    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 26),
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
    child: content,
  );
}

/// Shows the Sign in / Sign up Modal when tapping "Sign in/Sign up" or a guarded feature while logged out
void showSignInSignUpModal(BuildContext context, AppState appState) {
  final isAk = appState.language == 'ak';
  final emailCtrl = TextEditingController();
  final passCtrl = TextEditingController();
  bool showPassword = false;
  bool isSignUp = false;
  bool isLoading = false;
  String? errorMsg;

  showDialog(
    context: context,
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setModalState) {
        Future<void> submitEmail() async {
          final email = emailCtrl.text.trim();
          final pass = passCtrl.text;
          if (email.isEmpty) {
            setModalState(() => errorMsg = isAk ? 'အီးမေးလ် ရိုက်ထည့်ပါ' : 'Enter your email');
            return;
          }
          if (pass.isEmpty) {
            setModalState(() => errorMsg = isAk ? 'စကားဝှက် ရိုက်ထည့်ပါ' : 'Enter your password');
            return;
          }
          setModalState(() {
            isLoading = true;
            errorMsg = null;
          });
          try {
            if (isSignUp) {
              await FirebaseService().signUpWithEmail(email: email, password: pass);
            } else {
              await FirebaseService().signInWithEmail(email: email, password: pass);
            }
          } catch (_) {}
          final derived = email.contains('@') ? email.split('@').first : '';
          final name = derived.isNotEmpty
              ? '${derived[0].toUpperCase()}${derived.substring(1)}'
              : '';
          appState.signIn(email: email, name: name);
          if (ctx.mounted) Navigator.pop(ctx);
        }

        Future<void> submitGoogle() async {
          setModalState(() {
            isLoading = true;
            errorMsg = null;
          });
          try {
            final cred = await FirebaseService().signInWithGoogle();
            if (cred?.user != null) {
              final fbEmail = cred!.user!.email ?? '';
              final fallbackName = fbEmail.contains('@') ? fbEmail.split('@').first : '';
              appState.signIn(
                email: fbEmail,
                name: cred.user!.displayName ?? fallbackName,
              );
              if (ctx.mounted) Navigator.pop(ctx);
              return;
            }
          } catch (e) {
            setModalState(() {
              isLoading = false;
              errorMsg = 'Google sign-in unavailable: $e';
            });
            return;
          }
          setModalState(() {
            isLoading = false;
            errorMsg = 'Google sign-in was cancelled.';
          });
        }

        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          backgroundColor: Colors.white,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const ArakanEmblem(size: 28),
                        const SizedBox(width: 8),
                        Text(
                          isSignUp
                              ? (isAk ? 'ဖေ့သာ အကောင့်သစ်ဖွင့်ရန်' : 'Create Péthar Account')
                              : (isAk ? 'ဖေ့သာ အကောင့်ဝင်ရန်' : 'Log in to Péthar'),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF18181B),
                          ),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => Navigator.pop(ctx),
                      child: Container(
                        width: 30,
                        height: 30,
                        decoration: const BoxDecoration(
                          color: Color(0xFFF4F4F5),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.close, size: 16, color: Color(0xFF71717A)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (errorMsg != null) ...[
                  Container(
                    padding: const EdgeInsets.all(10),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      errorMsg!,
                      style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
                OutlinedButton(
                  onPressed: isLoading ? null : submitGoogle,
                  style: OutlinedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF18181B),
                    side: const BorderSide(color: Color(0xFFD6D3D1)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
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
                        child: const Text('G', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900)),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        isAk ? 'Google ဖြင့် ဝင်ရန်' : 'Continue with Google',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  isAk ? 'အီးမေးလ်' : 'Email',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF57534E)),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w500, color: Color(0xFF18181B)),
                  decoration: InputDecoration(
                    hintText: 'name@email.com',
                    hintStyle: const TextStyle(color: Color(0xFFA8A29E), fontSize: 13),
                    filled: true,
                    fillColor: const Color(0xFFFAFAF9),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFFE7E5E4)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFFE7E5E4)),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  isAk ? 'စကားဝှက်' : 'Password',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF57534E)),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: passCtrl,
                  obscureText: !showPassword,
                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w500, color: Color(0xFF18181B)),
                  decoration: InputDecoration(
                    hintText: '••••••••',
                    hintStyle: const TextStyle(color: Color(0xFFA8A29E), fontSize: 13),
                    filled: true,
                    fillColor: const Color(0xFFFAFAF9),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    suffixIcon: IconButton(
                      onPressed: () => setModalState(() => showPassword = !showPassword),
                      icon: Icon(
                        showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        size: 18,
                        color: const Color(0xFFA8A29E),
                      ),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFFE7E5E4)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFFE7E5E4)),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: isLoading ? null : submitEmail,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: crimson,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                  ),
                  child: Text(
                    isSignUp ? (isAk ? 'အကောင့်ဖွင့်ရန်' : 'Sign up') : (isAk ? 'အကောင့်ဝင်ရန်' : 'Sign in'),
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      isSignUp
                          ? (isAk ? 'အကောင့်ရှိပြီးသားလား? ' : 'Already have an account? ')
                          : (isAk ? 'အကောင့်မရှိသေးပါသလား? ' : 'No account yet? '),
                      style: const TextStyle(fontSize: 12, color: Color(0xFF78716C)),
                    ),
                    GestureDetector(
                      onTap: () => setModalState(() {
                        isSignUp = !isSignUp;
                        errorMsg = null;
                      }),
                      child: Text(
                        isSignUp ? (isAk ? 'အကောင့်ဝင်ရန်' : 'Sign in') : (isAk ? 'အကောင့်ဖွင့်ရန်' : 'Sign up'),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: crimson),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    ),
  );
}

/// Shows the iOS KYC Account Verification Modal (Level 1: Email Verified, Level 2: National ID Verified)
void showKycVerificationModal(BuildContext context, AppState appState) {
  final isAk = appState.language == 'ak';
  final nameCtrl = TextEditingController(text: appState.profile.name);
  final nrcCtrl = TextEditingController(text: appState.profile.nationalIdNo);
  final dobCtrl = TextEditingController(text: appState.profile.dob.isNotEmpty ? appState.profile.dob : '2000-01-01');
  final addrCtrl = TextEditingController(text: appState.profile.address);
  bool isSubmitting = false;

  showDialog(
    context: context,
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setModalState) {
        final isLvl2 = appState.profile.kycTier >= 2;
        final isPending = appState.profile.kycStatus == 'PENDING_REVIEW';

        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          backgroundColor: Colors.white,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
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
                        const ArakanEmblem(size: 26),
                        const SizedBox(width: 8),
                        Text(
                          isAk ? 'အကောင့် အတည်ပြုချက် (KYC)' : 'Account Verification',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF18181B),
                          ),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => Navigator.pop(ctx),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Color(0xFFF4F4F5),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.close, size: 16, color: Color(0xFF71717A)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // KYC Level 1 Status Card (Email Verified)
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(
                          color: Color(0xFF10B981),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check, size: 14, color: Colors.white),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isAk ? 'KYC အဆင့် ၁ : အီးမေးလ် အတည်ပြုပြီး' : 'KYC Level 1: Email Verified',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF065F46),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              appState.profile.email.isNotEmpty
                                  ? appState.profile.email
                                  : (isAk ? 'အီးမေးလ် အတည်ပြုပြီးပါပြီ' : 'Email verified upon sign up'),
                              style: const TextStyle(fontSize: 11.5, color: Color(0xFF047857)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // KYC Level 2 Section (National ID Verification)
                Text(
                  isAk ? 'KYC အဆင့် ၂ : နိုင်ငံသားကတ် စိစစ်အတည်ပြုခြင်း' : 'KYC Level 2: National ID Verification',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF18181B),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isAk
                      ? 'အဆင့် ၂ သို့ တိုးမြှင့်ရန် နိုင်ငံသားကတ်နှင့် ကိုယ်ရေးအချက်အလက်များ တင်သွင်းပြီး စိစစ်အတည်ပြုချက်ကို စောင့်ဆိုင်းရမည်ဖြစ်ပါသည်။'
                      : 'To upgrade to KYC Level 2, enter your National ID and personal info and wait for administrative review.',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF71717A), height: 1.4),
                ),
                const SizedBox(height: 14),

                if (isLvl2) ...[
                  // Level 2 Approved State
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDF4),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF86EFAC)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.verified_rounded, color: Color(0xFF16A34A), size: 20),
                            const SizedBox(width: 8),
                            Text(
                              isAk ? 'အဆင့် ၂ အတည်ပြုပြီးပါပြီ' : 'Level 2 Verified',
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF166534)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${isAk ? 'နိုင်ငံသားကတ်နံပါတ်:' : 'National ID:'} ${appState.profile.nationalIdNo.isNotEmpty ? appState.profile.nationalIdNo : "ARAK-NAT-VERIFIED"}',
                          style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, fontFamily: 'monospace', color: Color(0xFF14532D)),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${isAk ? 'အမည်:' : 'Legal Name:'} ${appState.profile.name}',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF166534)),
                        ),
                      ],
                    ),
                  ),
                ] else if (isPending) ...[
                  // Pending Review State
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFFBEB),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFFDE68A)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.hourglass_top_rounded, color: Color(0xFFD97706), size: 20),
                            const SizedBox(width: 8),
                            Text(
                              isAk ? 'စိစစ်အတည်ပြုချက် စောင့်ဆိုင်းနေဆဲ (Pending Review)' : 'Pending Administrative Review',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF92400E)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          isAk
                              ? 'သင်၏ နိုင်ငံသားကတ် အချက်အလက်များကို တင်သွင်းပြီးပါပြီ။ စီမံခန့်ခွဲရေးအဖွဲ့မှ စစ်ဆေးအတည်ပြုပြီးသည်နှင့် အဆင့် ၂ သို့ အလိုအလျောက် ရောက်ရှိပါမည်။'
                              : 'Your personal info and National ID have been submitted and are under review. Once approved, your account will be upgraded to KYC Level 2.',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF78350F), height: 1.4),
                        ),
                        const SizedBox(height: 12),
                        // Test approval button
                        OutlinedButton.icon(
                          onPressed: () async {
                            setModalState(() => isSubmitting = true);
                            await appState.approveKycLevel2();
                            setModalState(() => isSubmitting = false);
                          },
                          icon: const Icon(Icons.check_circle_outline_rounded, size: 16, color: Color(0xFF059669)),
                          label: Text(
                            isAk ? 'အတည်ပြုမှု စမ်းသပ်ရန် (Approve Review)' : 'Approve Review (Dev/Admin)',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF065F46)),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFFA7F3D0)),
                            backgroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  // Submit Level 2 Form
                  Text(isAk ? 'တရားဝင် အမည်အပြည့်အစုံ' : 'Full Legal Name', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF71717A))),
                  const SizedBox(height: 6),
                  TextField(
                    controller: nameCtrl,
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Color(0xFF18181B)),
                    decoration: InputDecoration(
                      hintText: 'e.g. U Kyaw Min',
                      filled: true,
                      fillColor: const Color(0xFFF4F4F5),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 10),

                  Text(isAk ? 'နိုင်ငံသားကတ် / မှတ်ပုံတင် အမှတ်' : 'National ID Number', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF71717A))),
                  const SizedBox(height: 6),
                  TextField(
                    controller: nrcCtrl,
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Color(0xFF18181B)),
                    decoration: InputDecoration(
                      hintText: 'e.g. ARAK-NAT-091823',
                      filled: true,
                      fillColor: const Color(0xFFF4F4F5),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 10),

                  Text(isAk ? 'မွေးသက္ကရာဇ် (DOB)' : 'Date of Birth (YYYY-MM-DD)', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF71717A))),
                  const SizedBox(height: 6),
                  TextField(
                    controller: dobCtrl,
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Color(0xFF18181B)),
                    decoration: InputDecoration(
                      hintText: '2000-01-01',
                      filled: true,
                      fillColor: const Color(0xFFF4F4F5),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 10),

                  Text(isAk ? 'နေရပ်လိပ်စာနှင့် မြို့နယ်' : 'Residential Address & Township', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF71717A))),
                  const SizedBox(height: 6),
                  TextField(
                    controller: addrCtrl,
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Color(0xFF18181B)),
                    decoration: InputDecoration(
                      hintText: isAk ? 'နေရပ်လိပ်စာ အပြည့်အစုံ ရိုက်ထည့်ပါ' : 'Enter residential address',
                      filled: true,
                      fillColor: const Color(0xFFF4F4F5),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: isSubmitting
                          ? null
                          : () async {
                              final name = nameCtrl.text.trim();
                              final nrc = nrcCtrl.text.trim();
                              final dob = dobCtrl.text.trim();
                              final addr = addrCtrl.text.trim();
                              if (name.isEmpty || nrc.isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(isAk ? 'အမည်နှင့် မှတ်ပုံတင်နံပါတ် ဖြည့်သွင်းပါ' : 'Please fill in Name and National ID'),
                                    backgroundColor: crimson,
                                  ),
                                );
                                return;
                              }
                              setModalState(() => isSubmitting = true);
                              await appState.submitKycLevel2(
                                nationalIdNo: nrc,
                                dob: dob,
                                fullName: name,
                                address: addr,
                              );
                              setModalState(() => isSubmitting = false);
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF18181B),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: isSubmitting
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text(
                              isAk ? 'အဆင့် ၂ အတွက် တင်သွင်းမည် (Submit for Review)' : 'Submit for Level 2 Review',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                            ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    ),
  );
}

/// Shows the iOS Verification Required Guard Dialog (or Sign in/Sign up modal if logged out)
void showVerificationRequiredDialog(BuildContext context, AppState appState, String featureName) {
  if (!appState.isAuthenticated) {
    showSignInSignUpModal(context, appState);
    return;
  }
  final isAk = appState.language == 'ak';
  showDialog(
    context: context,
    builder: (ctx) => Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      backgroundColor: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFFECDD3)),
              ),
              child: const Icon(Icons.error_outline_rounded, color: crimson, size: 30),
            ),
            const SizedBox(height: 16),
            Text(
              isAk ? 'အကောင့် အတည်ပြုရန် လိုအပ်ပါသည်' : 'Identity Verification Required',
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Colors.black87),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              isAk
                  ? 'သင်၏ အကောင့်သည် အတည်မပြုရသေးပါ (Unverified)။ "$featureName" နှင့် ငွေကြေးလုပ်ဆောင်ချက်များကို အသုံးပြုရန် အကောင့်အတည်ပြုပေးပါ။'
                  : 'Your account is currently Unverified. Please verify your identity to unlock "$featureName" and all wallet functions.',
              style: const TextStyle(fontSize: 12, color: Colors.black54, height: 1.4),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.black87,
                      side: const BorderSide(color: Colors.black26),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                    ),
                    child: Text(isAk ? 'နောက်မှ' : 'Later'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      showKycVerificationModal(context, appState);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: crimson,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                    ),
                    child: Text(isAk ? 'ယခု အတည်ပြုမည်' : 'Verify Now'),
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

/// Interactive Support Chat & Help Sheet matching iOS MobileWalletPage
void showPetharSupportChatSheet(BuildContext context, bool isAk) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => _SupportChatSheet(isAk: isAk),
  );
}

class _SupportChatSheet extends StatefulWidget {
  final bool isAk;
  const _SupportChatSheet({Key? key, required this.isAk}) : super(key: key);

  @override
  State<_SupportChatSheet> createState() => _SupportChatSheetState();
}

class _SupportChatSheetState extends State<_SupportChatSheet> {
  String _view = 'hub';
  String _topic = 'General Support';
  String _searchQuery = '';
  final TextEditingController _chatCtrl = TextEditingController();
  final List<Map<String, String>> _messages = [
    {
      'sender': 'bot',
      'text': 'Hi there! Welcome to Péthar Support. Our AI Agent and team are here 24/7 — how can we help you today?',
    },
  ];

  @override
  void dispose() {
    _chatCtrl.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _chatCtrl.text.trim();
    if (text.isEmpty) return;
    _chatCtrl.clear();
    setState(() {
      _messages.add({'sender': 'user', 'text': text});
      _messages.add({
        'sender': 'bot',
        'text': widget.isAk
            ? 'သင်၏ မက်ဆေ့ချ်ကို လက်ခံရရှိပါသည်။ Péthar Support အဖွဲ့မှ ချက်ချင်း စစ်ဆေးပေးနေပါသည်။'
            : 'Thanks for reaching out! Our specialist team has received your message under "$_topic" and is reviewing your account now.',
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final isAk = widget.isAk;
    final faqs = [
      {
        'q': 'How to verify my passport (KYC)?',
        'a': 'Go to Profile > ID Verification or Personal Information > Edit to scan your passport and unlock all wallet functions.',
      },
      {
        'q': 'How do Scan to Pay and Receive QR work?',
        'a': 'Tap the center Scan button or Pay on Home to scan any merchant or peer QR code with zero fees.',
      },
      {
        'q': 'How does the 1:1 USD / AKD parity work?',
        'a': '1 AKD (₳) is backed 1:1 by USD stablecoins (USDT, USDC, USD1) and can be converted or transferred anytime.',
      },
    ].where((item) {
      if (_searchQuery.trim().isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return item['q']!.toLowerCase().contains(q) || item['a']!.toLowerCase().contains(q);
    }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.vertical(top: Radius.circular(34)),
        color: Color(0xFFF8FAFC),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 20, 18, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (_view != 'hub')
                  GestureDetector(
                    onTap: () => setState(() => _view = 'hub'),
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4, offset: const Offset(0, 2)),
                        ],
                      ),
                      child: const Icon(Icons.chevron_left, color: Color(0xFF0F172A), size: 26),
                    ),
                  )
                else
                  const ArakanEmblem(size: 34),
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFFE0F2FE),
                        border: Border.all(color: const Color(0xFFBAE6FD), width: 1.5),
                      ),
                      child: const Icon(Icons.support_agent_rounded, color: Color(0xFF0284C7), size: 22),
                    ),
                    const SizedBox(width: 10),
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4, offset: const Offset(0, 2)),
                          ],
                        ),
                        child: const Icon(Icons.close, color: Color(0xFF0F172A), size: 20),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (_view == 'hub')
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 8, 18, 36),
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isAk ? 'မင်္ဂလာပါ 👋' : 'Hi there 👋',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          isAk ? 'မည်သို့ ကူညီပေးရမလဲ?' : 'How can we help?',
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 3)),
                      ],
                    ),
                    child: Column(
                      children: [
                        ListTile(
                          title: Text(
                            isAk ? 'မက်ဆေ့ချ်များ (Messages)' : 'Messages',
                            style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          trailing: const Icon(Icons.chat_bubble_rounded, color: Color(0xFF2563EB), size: 19),
                          onTap: () => setState(() {
                            _topic = 'Direct Messages';
                            _view = 'chat';
                          }),
                        ),
                        const Divider(height: 1, color: Color(0xFFF1F5F9)),
                        ListTile(
                          title: Text(
                            isAk ? 'အကူအညီ (Help)' : 'Help',
                            style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          trailing: const Icon(Icons.help_rounded, color: Color(0xFF2563EB), size: 20),
                          onTap: () => setState(() => _view = 'help'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 3)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                          child: Text(
                            isAk ? 'အကူအညီ လက်မှတ်ဖွင့်ရန်' : 'Create a ticket',
                            style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w800, fontSize: 16),
                          ),
                        ),
                        ...[
                          {'label': isAk ? 'ဆုလာဘ်နှင့် မစ်ရှင်များ' : 'Mission Rewards', 'icon': Icons.confirmation_number_rounded},
                          {'label': isAk ? 'QR စကင် ငွေပေးချေမှု ပြဿနာ' : 'Scan to Pay Issues', 'icon': Icons.error_rounded},
                          {'label': isAk ? 'အကောင့် အတည်ပြုချက် (KYC) ပြဿနာ' : 'KYC Issues', 'icon': Icons.badge_rounded},
                          {'label': isAk ? 'စနစ်ချို့ယွင်းချက်နှင့် အကြံပြုချက်' : 'Bug Report - Enhancement', 'icon': Icons.bug_report_rounded},
                        ].asMap().entries.map((entry) {
                          final idx = entry.key;
                          final item = entry.value;
                          final label = item['label'] as String;
                          return Column(
                            children: [
                              if (idx > 0) const Divider(height: 1, color: Color(0xFFF1F5F9)),
                              ListTile(
                                title: Text(label, style: const TextStyle(color: Color(0xFF0F172A), fontSize: 15)),
                                trailing: Icon(item['icon'] as IconData, color: const Color(0xFF2563EB), size: 19),
                                onTap: () {
                                  setState(() {
                                    _topic = label;
                                    _messages.add({
                                      'sender': 'bot',
                                      'text': 'Ticket category selected: "$label". Please describe your issue below and our specialist team will resolve it promptly.',
                                    });
                                    _view = 'chat';
                                  });
                                },
                              ),
                            ],
                          );
                        }),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 3)),
                      ],
                    ),
                    child: ListTile(
                      title: Text(
                        isAk ? 'အကူအညီ ရှာဖွေရန်' : 'Search for help',
                        style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      trailing: const Icon(Icons.search_rounded, color: Color(0xFF2563EB), size: 20),
                      onTap: () => setState(() => _view = 'help'),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 3)),
                      ],
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: ListTile(
                      title: Text(
                        isAk ? 'မက်ဆေ့ချ် ပေးပို့ရန်' : 'Send us a message',
                        style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      subtitle: Text(
                        isAk ? 'AI အေးဂျင့်နှင့် အဖွဲ့မှ ကူညီပေးပါမည်' : 'AI Agent and team can help',
                        style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                      ),
                      trailing: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircleAvatar(
                            radius: 15,
                            backgroundColor: Color(0xFF2563EB),
                            child: Text('AI', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900)),
                          ),
                          SizedBox(width: 6),
                          Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
                        ],
                      ),
                      onTap: () => setState(() {
                        _topic = 'Live Concierge';
                        _view = 'chat';
                      }),
                    ),
                  ),
                ],
              ),
            )
          else if (_view == 'help')
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 8, 18, 36),
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: TextField(
                      style: const TextStyle(color: Color(0xFF0F172A), fontSize: 14),
                      onChanged: (v) => setState(() => _searchQuery = v),
                      decoration: const InputDecoration(
                        icon: Icon(Icons.search, color: Color(0xFF2563EB), size: 18),
                        hintText: 'Search help articles (KYC, QR Pay, USD)...',
                        hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 3)),
                      ],
                    ),
                    child: Column(
                      children: faqs.map((item) {
                        return Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item['q']!,
                                style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                item['a']!,
                                style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, height: 1.4),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            )
          else
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 4, 18, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _topic,
                      style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w800, fontSize: 15),
                    ),
                    const Text(
                      'AI Agent & Specialist Team · Online',
                      style: TextStyle(color: Color(0xFF059669), fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: ListView.builder(
                          itemCount: _messages.length,
                          itemBuilder: (ctx, i) {
                            final msg = _messages[i];
                            final isUser = msg['sender'] == 'user';
                            return Align(
                              alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                constraints: const BoxConstraints(maxWidth: 260),
                                decoration: BoxDecoration(
                                  color: isUser ? const Color(0xFF2563EB) : const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Text(
                                  msg['text']!,
                                  style: TextStyle(
                                    color: isUser ? Colors.white : const Color(0xFF0F172A),
                                    fontSize: 12.5,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: TextField(
                              controller: _chatCtrl,
                              style: const TextStyle(color: Color(0xFF0F172A), fontSize: 13),
                              onSubmitted: (_) => _sendMessage(),
                              decoration: InputDecoration(
                                hintText: isAk ? 'မက်ဆေ့ချ် ရိုက်ထည့်ပါ...' : 'Type your message...',
                                hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                                border: InputBorder.none,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: _sendMessage,
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: const BoxDecoration(
                              color: Color(0xFF2563EB),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
