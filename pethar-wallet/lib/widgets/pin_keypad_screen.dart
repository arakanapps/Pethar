import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import '../theme.dart';

enum BiometricKind {
  faceId,        // iOS Face ID
  touchId,       // iOS Touch ID
  androidFace,   // Android Face Unlock
  androidFingerprint, // Android Fingerprint
  androidBoth,   // Android Face & Fingerprint
  generic,
  none,
}

/// Custom Face ID bracket icon matching Image 3: [ • ◡ • ]
class FaceIdIcon extends StatelessWidget {
  final double size;
  final Color color;

  const FaceIdIcon({
    Key? key,
    this.size = 28,
    this.color = const Color(0xFF64748B),
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _FaceIdPainter(color),
    );
  }
}

class _FaceIdPainter extends CustomPainter {
  final Color color;
  _FaceIdPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;

    final w = size.width;
    final h = size.height;
    final b = w * 0.28; // bracket length
    final r = w * 0.12; // corner radius

    // 4 Corner Brackets
    // Top-left
    final tl = Path()
      ..moveTo(0, b)
      ..lineTo(0, r)
      ..quadraticBezierTo(0, 0, r, 0)
      ..lineTo(b, 0);
    canvas.drawPath(tl, paint);

    // Top-right
    final tr = Path()
      ..moveTo(w - b, 0)
      ..lineTo(w - r, 0)
      ..quadraticBezierTo(w, 0, w, r)
      ..lineTo(w, b);
    canvas.drawPath(tr, paint);

    // Bottom-left
    final bl = Path()
      ..moveTo(0, h - b)
      ..lineTo(0, h - r)
      ..quadraticBezierTo(0, h, r, h)
      ..lineTo(b, h);
    canvas.drawPath(bl, paint);

    // Bottom-right
    final br = Path()
      ..moveTo(w - b, h)
      ..lineTo(w - r, h)
      ..quadraticBezierTo(w, h, w, h - r)
      ..lineTo(w, h - b);
    canvas.drawPath(br, paint);

    // Eyes
    final eyePaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(w * 0.36, h * 0.44), 1.8, eyePaint);
    canvas.drawCircle(Offset(w * 0.64, h * 0.44), 1.8, eyePaint);

    // Smile
    final smilePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.8
      ..strokeCap = StrokeCap.round;
    final smilePath = Path()
      ..moveTo(w * 0.38, h * 0.62)
      ..quadraticBezierTo(w * 0.5, h * 0.74, w * 0.62, h * 0.62);
    canvas.drawPath(smilePath, smilePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _PinWatermarkPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Subtle crimson chevron geometry matching Péthar brand
    final strokePaint = Paint()
      ..color = crimson.withValues(alpha: 0.04)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 38
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final path = Path()
      ..moveTo(size.width * -0.15, size.height * 0.72)
      ..lineTo(size.width * 0.75, size.height * 0.38)
      ..lineTo(size.width * 1.15, size.height * 0.58);

    canvas.drawPath(path, strokePaint);

    // Subtle soft glow behind bottom-right corner
    final glowPaint = Paint()
      ..color = crimson.withValues(alpha: 0.03)
      ..style = PaintingStyle.fill;

    canvas.drawCircle(Offset(size.width * 0.75, size.height * 0.68), 55, glowPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Standalone Full-Page PIN Keypad Screen matching Image 3 design
class PinKeypadScreen extends StatefulWidget {
  final String title;
  final String? subtitle;
  final bool isAk;
  final ValueChanged<String> onPinCompleted;
  final VoidCallback? onBiometricPressed;
  final VoidCallback? onBack;
  final VoidCallback? onExit;
  final VoidCallback? onLanguageToggle;
  final VoidCallback? onForgotPassword;
  final String? errorMessage;
  final bool isLoading;
  final bool showBiometrics;
  final String versionText;

  const PinKeypadScreen({
    Key? key,
    required this.title,
    this.subtitle,
    this.isAk = false,
    required this.onPinCompleted,
    this.onBiometricPressed,
    this.onBack,
    this.onExit,
    this.onLanguageToggle,
    this.onForgotPassword,
    this.errorMessage,
    this.isLoading = false,
    this.showBiometrics = true,
    this.versionText = 'Version 4.23.0',
  }) : super(key: key);

  @override
  State<PinKeypadScreen> createState() => _PinKeypadScreenState();
}

class _PinKeypadScreenState extends State<PinKeypadScreen> {
  String _enteredPin = '';
  final LocalAuthentication _localAuth = LocalAuthentication();
  BiometricKind _biometricKind = BiometricKind.none;

  @override
  void initState() {
    super.initState();
    _checkBiometricSupport();
  }

  Future<void> _checkBiometricSupport() async {
    if (kIsWeb) return;
    try {
      final bool canCheck = await _localAuth.canCheckBiometrics;
      final bool isDeviceSupported = await _localAuth.isDeviceSupported();
      if (!canCheck && !isDeviceSupported) {
        setState(() => _biometricKind = BiometricKind.none);
        return;
      }

      final List<BiometricType> available = await _localAuth.getAvailableBiometrics();
      if (Platform.isIOS) {
        if (available.contains(BiometricType.face)) {
          setState(() => _biometricKind = BiometricKind.faceId);
        } else if (available.contains(BiometricType.fingerprint)) {
          setState(() => _biometricKind = BiometricKind.touchId);
        } else {
          setState(() => _biometricKind = BiometricKind.faceId);
        }
      } else if (Platform.isAndroid) {
        final bool hasFace = available.contains(BiometricType.face);
        final bool hasFingerprint = available.contains(BiometricType.fingerprint);
        if (hasFace && hasFingerprint) {
          setState(() => _biometricKind = BiometricKind.androidBoth);
        } else if (hasFace) {
          setState(() => _biometricKind = BiometricKind.androidFace);
        } else if (hasFingerprint) {
          setState(() => _biometricKind = BiometricKind.androidFingerprint);
        } else {
          setState(() => _biometricKind = BiometricKind.androidFingerprint);
        }
      } else {
        setState(() => _biometricKind = BiometricKind.generic);
      }
    } catch (_) {
      setState(() => _biometricKind = BiometricKind.generic);
    }
  }

  void _onDigit(String digit) {
    if (widget.isLoading || _enteredPin.length >= 6) return;
    setState(() {
      _enteredPin += digit;
    });

    if (_enteredPin.length == 6) {
      widget.onPinCompleted(_enteredPin);
    }
  }

  void _onDelete() {
    if (widget.isLoading || _enteredPin.isEmpty) return;
    setState(() {
      _enteredPin = _enteredPin.substring(0, _enteredPin.length - 1);
    });
  }

  void clearPin() {
    setState(() {
      _enteredPin = '';
    });
  }

  @override
  void didUpdateWidget(PinKeypadScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.errorMessage != null && widget.errorMessage != oldWidget.errorMessage) {
      setState(() {
        _enteredPin = '';
      });
    }
  }

  Widget _buildPadlock() {
    const double size = 48.0;
    return SizedBox(
      width: size,
      height: size * 1.25,
      child: Stack(
        alignment: Alignment.topCenter,
        children: [
          // Shackle
          Positioned(
            top: 2,
            child: Container(
              width: size * 0.58,
              height: size * 0.58,
              decoration: BoxDecoration(
                color: Colors.transparent,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
                border: Border.all(
                  color: const Color(0xFFCBD5E1),
                  width: 4.0,
                ),
              ),
            ),
          ),
          // Padlock Body
          Positioned(
            bottom: 0,
            child: Container(
              width: size * 0.90,
              height: size * 0.72,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0xFFFF2A38), crimson],
                ),
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: crimson.withValues(alpha: 0.28),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 5.5,
                      height: 5.5,
                      decoration: const BoxDecoration(
                        color: Color(0xFF86163C),
                        shape: BoxShape.circle,
                      ),
                    ),
                    Container(
                      width: 3.2,
                      height: 5.5,
                      decoration: BoxDecoration(
                        color: const Color(0xFF86163C),
                        borderRadius: BorderRadius.circular(1),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKeyButton({
    required Widget child,
    required VoidCallback onTap,
    bool isCircleBorder = true,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      child: Material(
        color: Colors.transparent,
        shape: isCircleBorder
            ? const CircleBorder(side: BorderSide(color: Color(0xFFE2E8F0), width: 1.2))
            : null,
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onTap,
          splashColor: crimson.withValues(alpha: 0.12),
          highlightColor: const Color(0xFFF1F5F9),
          child: Container(
            width: 70,
            height: 70,
            alignment: Alignment.center,
            child: child,
          ),
        ),
      ),
    );
  }

  Widget _buildBiometricKey() {
    if (!widget.showBiometrics || _biometricKind == BiometricKind.none) {
      return const SizedBox(width: 70, height: 70);
    }

    Widget iconWidget;
    switch (_biometricKind) {
      case BiometricKind.faceId:
      case BiometricKind.androidFace:
      case BiometricKind.androidBoth:
        iconWidget = const FaceIdIcon(size: 30, color: Color(0xFF475569));
        break;
      case BiometricKind.touchId:
      case BiometricKind.androidFingerprint:
      case BiometricKind.generic:
      default:
        iconWidget = const Icon(Icons.fingerprint_rounded, size: 32, color: Color(0xFF475569));
        break;
    }

    return _buildKeyButton(
      isCircleBorder: false,
      child: iconWidget,
      onTap: widget.onBiometricPressed ?? () {},
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCFCFD),
      body: Stack(
        children: [
          // Background Watermark Chevron & Geometry matching Image 3
          Positioned.fill(
            child: IgnorePointer(
              child: CustomPaint(
                painter: _PinWatermarkPainter(),
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                // ── Top Navigation Row ──
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    children: [
                      if (widget.onBack != null)
                        IconButton(
                          icon: const Icon(Icons.chevron_left, color: Color(0xFF18181B), size: 28),
                          onPressed: widget.onBack,
                        )
                      else
                        const SizedBox(width: 48),
                      const Spacer(),
                      // Top Right Language & Exit Row matching Image 3
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (widget.onLanguageToggle != null)
                            GestureDetector(
                              onTap: widget.onLanguageToggle,
                              behavior: HitTestBehavior.opaque,
                              child: Padding(
                                padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.language_rounded, size: 16, color: Color(0xFF475569)),
                                    const SizedBox(width: 5),
                                    Text(
                                      widget.isAk ? 'အာရက္ခဘာသာ' : 'English',
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: Color(0xFF334155),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          if (widget.onExit != null) ...[
                            const SizedBox(width: 8),
                            Container(
                              width: 1,
                              height: 14,
                              color: const Color(0xFFCBD5E1),
                            ),
                            const SizedBox(width: 4),
                            GestureDetector(
                              onTap: widget.onExit,
                              behavior: HitTestBehavior.opaque,
                              child: const Padding(
                                padding: EdgeInsets.all(6),
                                child: Icon(Icons.logout_rounded, color: Color(0xFF475569), size: 19),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),

            const Spacer(flex: 1),

            // ── Green Padlock Icon ──
            _buildPadlock(),
            const SizedBox(height: 18),

            // ── Screen Title ──
            Text(
              widget.title,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
                letterSpacing: -0.3,
              ),
            ),
            const SizedBox(height: 6),

            // Subtitle or Error Message
            if (widget.errorMessage != null && widget.errorMessage!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Text(
                  widget.errorMessage!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFDC2626),
                  ),
                ),
              )
            else if (widget.subtitle != null && widget.subtitle!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Text(
                  widget.subtitle!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF64748B),
                  ),
                ),
              )
            else
              const SizedBox(height: 18),

            const SizedBox(height: 16),

            // ── 6 Round Dot Indicators ──
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(6, (index) {
                final bool isFilled = index < _enteredPin.length;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  margin: const EdgeInsets.symmetric(horizontal: 7),
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isFilled ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                    border: Border.all(
                      color: isFilled ? const Color(0xFF1E293B) : const Color(0xFFCBD5E1),
                      width: 1,
                    ),
                  ),
                );
              }),
            ),

            const Spacer(flex: 2),

            // ── Keypad Grid ──
            Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildKeyButton(
                      child: const Text('1', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w500, color: Color(0xFF0F172A))),
                      onTap: () => _onDigit('1'),
                    ),
                    _buildKeyButton(
                      child: const Text('2', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w500, color: Color(0xFF0F172A))),
                      onTap: () => _onDigit('2'),
                    ),
                    _buildKeyButton(
                      child: const Text('3', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w500, color: Color(0xFF0F172A))),
                      onTap: () => _onDigit('3'),
                    ),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildKeyButton(
                      child: const Text('4', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w500, color: Color(0xFF0F172A))),
                      onTap: () => _onDigit('4'),
                    ),
                    _buildKeyButton(
                      child: const Text('5', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w500, color: Color(0xFF0F172A))),
                      onTap: () => _onDigit('5'),
                    ),
                    _buildKeyButton(
                      child: const Text('6', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w500, color: Color(0xFF0F172A))),
                      onTap: () => _onDigit('6'),
                    ),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildKeyButton(
                      child: const Text('7', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w500, color: Color(0xFF0F172A))),
                      onTap: () => _onDigit('7'),
                    ),
                    _buildKeyButton(
                      child: const Text('8', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w500, color: Color(0xFF0F172A))),
                      onTap: () => _onDigit('8'),
                    ),
                    _buildKeyButton(
                      child: const Text('9', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w500, color: Color(0xFF0F172A))),
                      onTap: () => _onDigit('9'),
                    ),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildBiometricKey(),
                    _buildKeyButton(
                      child: const Text('0', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w500, color: Color(0xFF0F172A))),
                      onTap: () => _onDigit('0'),
                    ),
                    _buildKeyButton(
                      isCircleBorder: false,
                      child: const Icon(Icons.backspace_rounded, size: 26, color: Color(0xFF475569)),
                      onTap: _onDelete,
                    ),
                  ],
                ),
              ],
            ),

            if (widget.onForgotPassword != null) ...[
              const SizedBox(height: 12),
              GestureDetector(
                onTap: widget.onForgotPassword,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Text(
                    widget.isAk ? 'PIN မေ့နေပါသလား?' : 'Forgot PIN?',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFDC2626),
                    ),
                  ),
                ),
              ),
            ],

            const Spacer(flex: 1),

            // ── Version Footer ──
            Text(
              widget.versionText,
              style: const TextStyle(
                fontSize: 11,
                color: Color(0xFF94A3B8),
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
        ],
      ),
    );
  }
}
