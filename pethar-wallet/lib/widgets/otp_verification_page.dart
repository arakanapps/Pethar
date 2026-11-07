import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme.dart';

/// Full-screen OTP verification page matching the "Forgot PIN" OTP design:
/// soft glass background, email pill, delivery status, glass OTP card with
/// six rounded code boxes, timer, resend link and security reminder.
///
/// Used by the login and sign-up flows so all OTP steps share one look.
class OtpVerificationPage extends StatefulWidget {
  const OtpVerificationPage({
    Key? key,
    required this.isAk,
    required this.title,
    required this.email,
    required this.controller,
    required this.timerText,
    required this.onBack,
    required this.onResend,
    required this.onConfirm,
    this.errorMessage,
    this.isBusy = false,
    this.isTimerExpiring = false,
    this.verifyLabel,
  }) : super(key: key);

  final bool isAk;
  final String title;
  final String email;
  final TextEditingController controller;
  final String timerText;
  final VoidCallback onBack;
  final VoidCallback onResend;
  final VoidCallback onConfirm;
  final String? errorMessage;
  final bool isBusy;
  final bool isTimerExpiring;
  final String? verifyLabel;

  @override
  State<OtpVerificationPage> createState() => _OtpVerificationPageState();
}

class _OtpVerificationPageState extends State<OtpVerificationPage> {
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onCodeChanged);
  }

  @override
  void didUpdateWidget(covariant OtpVerificationPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller) {
      oldWidget.controller.removeListener(_onCodeChanged);
      widget.controller.addListener(_onCodeChanged);
    }
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onCodeChanged);
    _focusNode.dispose();
    super.dispose();
  }

  void _onCodeChanged() {
    if (mounted) setState(() {});
  }

  bool get _canConfirm =>
      widget.controller.text.trim().length == 6 && !widget.isBusy;

  @override
  Widget build(BuildContext context) {
    final isAk = widget.isAk;
    final email = widget.email;

    return Scaffold(
      backgroundColor: trueBlack,
      body: Stack(
        children: [
          const _OtpGlassBackground(),
          SafeArea(
            child: Column(
              children: [
                // ── Glass header ──
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 10, 16, 2),
                  child: Row(
                    children: [
                      _buildGlassIconButton(
                        icon: Icons.chevron_left_rounded,
                        onTap: widget.onBack,
                      ),
                      Expanded(
                        child: Text(
                          widget.title,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFFF4F4F5),
                            letterSpacing: -0.3,
                          ),
                        ),
                      ),
                      const SizedBox(width: 44),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView(
                    keyboardDismissBehavior:
                        ScrollViewKeyboardDismissBehavior.onDrag,
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
                    children: [
                      // ── Hero mail orb ──
                      Center(
                        child: Container(
                          width: 92,
                          height: 92,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFF000000),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.65),
                              width: 2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.white.withValues(alpha: 0.32),
                                blurRadius: 28,
                                offset: const Offset(0, 14),
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.mark_email_read_rounded,
                              color: Colors.white,
                              size: 40,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        isAk ? 'အီးမေးလ်ကို စစ်ဆေးပါ' : 'Check your email',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 23,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFFF4F4F5),
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        isAk
                            ? 'သင့်အကောင့် လုံခြုံရေးကုဒ် ၆ လုံးကို ဤအီးမေးလ်သို့ ပို့ထားပါသည်'
                            : 'We sent a 6-digit security code to',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 13,
                          height: 1.45,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFFF4F4F5),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF000000),
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(
                              color: const Color(0x26FFFFFF),
                              width: 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0x66000000)
                                    .withValues(alpha: 0.06),
                                blurRadius: 14,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.alternate_email_rounded,
                                size: 15,
                                color: Color(0xFFF4F4F5),
                              ),
                              const SizedBox(width: 6),
                              Flexible(
                                child: Text(
                                  email.isEmpty ? '—' : email,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFFF4F4F5),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),

                      // ── Delivery status ──
                      if (widget.isBusy)
                        _buildGlassStatusBanner(
                          isAk
                              ? 'လုံခြုံရေးကုဒ် ပို့နေသည်...'
                              : 'Sending your security code...',
                          busy: true,
                        )
                      else
                        _buildGlassStatusBanner(
                          isAk
                              ? 'ကုဒ် ပို့ပြီးပါပြီ။ ၁၀ မိနစ်အတွင်း သက်တမ်းကုန်ပါမည်။'
                              : 'Code sent. It expires in 10 minutes.',
                          success: true,
                        ),
                      if (widget.errorMessage != null)
                        Container(
                          margin: const EdgeInsets.only(top: 10),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color:
                                const Color(0xFF000000).withValues(alpha: 0.92),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                                color: const Color(0x26FFFFFF), width: 1.2),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.error_outline_rounded,
                                  color: Color(0xFFF4F4F5), size: 19),
                              const SizedBox(width: 9),
                              Expanded(
                                child: Text(
                                  widget.errorMessage!,
                                  style: const TextStyle(
                                    color: Color(0xFFD4D4D8),
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w600,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 16),

                      // ── Glass OTP card ──
                      _GlassCard(
                        radius: 26,
                        padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 30,
                                  height: 30,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: Colors.white.withValues(alpha: 0.10),
                                  ),
                                  child: const Icon(
                                    Icons.lock_outline_rounded,
                                    size: 16,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 9),
                                Expanded(
                                  child: Text(
                                    isAk
                                        ? '၆ လုံးပါ လုံခြုံရေးကုဒ်'
                                        : '6-digit security code',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFFF4F4F5),
                                    ),
                                  ),
                                ),
                                Text(
                                  widget.timerText,
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w800,
                                    color: widget.isTimerExpiring
                                        ? const Color(0xFFF4F4F5)
                                        : const Color(0xFFF4F4F5),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            _buildOtpBoxes(),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                const Icon(Icons.schedule_rounded,
                                    size: 14, color: Color(0xFFF4F4F5)),
                                const SizedBox(width: 5),
                                Expanded(
                                  child: Text(
                                    isAk
                                        ? 'ကုဒ် မရပါသလား?'
                                        : "Didn't receive the code?",
                                    style: const TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFFF4F4F5),
                                    ),
                                  ),
                                ),
                                TextButton(
                                  onPressed:
                                      widget.isBusy ? null : widget.onResend,
                                  style: TextButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8),
                                    minimumSize: const Size(0, 34),
                                    tapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                  ),
                                  child: Text(
                                    isAk ? 'ကုဒ် ပြန်ပို့ပါ' : 'Resend code',
                                    style: const TextStyle(
                                      fontSize: 12.5,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            // ── Confirm gradient button ──
                            AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              height: 54,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(18),
                                color: const Color(0xFF000000),
                                boxShadow: _canConfirm
                                    ? [
                                        BoxShadow(
                                          color:
                                              Colors.white.withValues(alpha: 0.32),
                                          blurRadius: 20,
                                          offset: const Offset(0, 10),
                                        ),
                                      ]
                                    : null,
                              ),
                              child: Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(18),
                                  onTap: _canConfirm ? widget.onConfirm : null,
                                  child: Center(
                                    child: widget.isBusy
                                        ? const SizedBox(
                                            width: 22,
                                            height: 22,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2.4,
                                              valueColor:
                                                  AlwaysStoppedAnimation<Color>(
                                                      Colors.white),
                                            ),
                                          )
                                        : Text(
                                            widget.verifyLabel ??
                                                (isAk
                                                    ? 'အတည်ပြုမည်'
                                                    : 'Confirm'),
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w800,
                                              fontSize: 15.5,
                                              letterSpacing: 0.3,
                                            ),
                                          ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),

                      // ── Security notes ──
                      _GlassCard(
                        radius: 22,
                        padding: const EdgeInsets.all(16),
                        tint: Colors.white,
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white.withValues(alpha: 0.10),
                              ),
                              child: const Icon(Icons.shield_outlined,
                                  size: 17, color: Colors.white),
                            ),
                            const SizedBox(width: 11),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    isAk
                                        ? 'လုံခြုံရေးအတွက် မှတ်ချက်'
                                        : 'Security reminder',
                                    style: const TextStyle(
                                      fontSize: 12.5,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFFF4F4F5),
                                    ),
                                  ),
                                  const SizedBox(height: 5),
                                  Text(
                                    isAk
                                        ? 'OTP ကုဒ်ကို မည်သူ့ကိုမျှ မမျှဝေပါနှင့်။ မွေးသက္ကရာဇ်၊ မှတ်ပုံတင် သို့မဟုတ် ဖုန်းနံပါတ်ကို PIN အဖြစ် မသုံးပါနှင့်။'
                                        : 'Never share this code with anyone. Avoid using your date of birth, NRIC/passport number or phone number as your PIN.',
                                    style: const TextStyle(
                                      fontSize: 11.5,
                                      height: 1.5,
                                      fontWeight: FontWeight.w500,
                                      color: Color(0xFFF4F4F5),
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
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOtpBoxes() {
    final value = widget.controller.text;
    final hasFocus = _focusNode.hasFocus;

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => _focusNode.requestFocus(),
      child: Stack(
        children: [
          Row(
            children: List.generate(6, (index) {
              final filled = index < value.length;
              final active =
                  index == value.length && (hasFocus || value.isNotEmpty);
              return Expanded(
                child: Padding(
                  padding: EdgeInsets.only(right: index == 5 ? 0 : 8),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 160),
                    curve: Curves.easeOut,
                    height: 58,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      color: const Color(0x0DFFFFFF),
                      border: Border.all(
                        color: active
                            ? const Color(0x33FFFFFF)
                            : const Color(0x26FFFFFF),
                        width: active ? 1.8 : 1.2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0x66000000)
                              .withValues(alpha: active ? 0.12 : 0.05),
                          blurRadius: 14,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Text(
                      filled ? value[index] : '',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFFF4F4F5),
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
          // Invisible field that owns the text input / keyboard.
          Positioned.fill(
            child: Opacity(
              opacity: 0.01,
              child: TextField(
                controller: widget.controller,
                focusNode: _focusNode,
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.done,
                maxLength: 6,
                autofocus: true,
                showCursor: false,
                style: const TextStyle(fontSize: 1, color: Colors.transparent),
                cursorColor: Colors.transparent,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(6),
                ],
                decoration: const InputDecoration(
                  counterText: '',
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                ),
                onSubmitted: (_) {
                  if (widget.controller.text.trim().length == 6) {
                    widget.onConfirm();
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassIconButton({
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: const Color(0xFF000000),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(
            color: const Color(0x26FFFFFF),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0x66000000).withValues(alpha: 0.07),
              blurRadius: 14,
              offset: const Offset(0, 7),
            ),
          ],
        ),
        child: Icon(icon, size: 26, color: const Color(0xFFF4F4F5)),
      ),
    );
  }

  Widget _buildGlassStatusBanner(
    String text, {
    bool success = false,
    bool busy = false,
  }) {
    final Color accent =
        success ? const Color(0xFF059669) : const Color(0xFFD4D4D8);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF000000),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x26FFFFFF)),
        boxShadow: [
          BoxShadow(
            color: const Color(0x66000000).withValues(alpha: 0.05),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          if (busy)
            const SizedBox(
              width: 17,
              height: 17,
              child: CircularProgressIndicator(
                strokeWidth: 2.2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
          else
            Icon(
              success ? Icons.verified_rounded : Icons.error_outline_rounded,
              size: 18,
              color: accent,
            ),
          const SizedBox(width: 9),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
                color: Color(0xFFF4F4F5),
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OtpGlassBackground extends StatelessWidget {
  const _OtpGlassBackground();

  @override
  Widget build(BuildContext context) {
    return const ColoredBox(color: Colors.black);
  }
}

class _GlassCard extends StatelessWidget {
  const _GlassCard({
    required this.child,
    this.radius = 24,
    this.padding = const EdgeInsets.all(16),
    this.tint,
  });

  final Widget child;
  final double radius;
  final EdgeInsetsGeometry padding;
  final Color? tint;

  @override
  Widget build(BuildContext context) {
    final base = BorderRadius.circular(radius);
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: base,
        boxShadow: [
          BoxShadow(
            color: const Color(0x66000000).withValues(alpha: 0.06),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: base,
        child: BackdropFilter(
          filter: ui.ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              borderRadius: base,
              color: const Color(0xFF000000),
              border: Border.all(
                  color: const Color(0x26FFFFFF), width: 1.3),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
