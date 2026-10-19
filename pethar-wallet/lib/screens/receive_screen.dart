import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../app_state.dart';
import '../theme.dart';
import '../widgets/arakan_emblem.dart';

class ReceiveScreen extends StatefulWidget {
  final bool embedded;

  const ReceiveScreen({Key? key, this.embedded = false}) : super(key: key);

  @override
  State<ReceiveScreen> createState() => _ReceiveScreenState();
}

class _ReceiveScreenState extends State<ReceiveScreen> {
  bool _copiedUid = false;
  bool _savedQr = false;
  bool _sharedQr = false;

  void _copyUid(BuildContext context, String uid, bool isAk) {
    Clipboard.setData(ClipboardData(text: uid));
    setState(() => _copiedUid = true);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(isAk ? 'UID ကူးယူပြီးပါပြီ' : 'UID copied to clipboard'),
        backgroundColor: emeraldSuccess,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copiedUid = false);
    });
  }

  void _saveQr(BuildContext context, bool isAk) {
    setState(() => _savedQr = true);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(isAk ? 'QR ပုံ သိမ်းဆည်းပြီးပါပြီ' : 'QR code saved to device'),
        backgroundColor: emeraldSuccess,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _savedQr = false);
    });
  }

  void _shareQr(BuildContext context, AppState appState, String uid, bool isAk) {
    final username =
        '@${appState.profile.name.toLowerCase().replaceAll(RegExp(r'\s+'), '')}';
    Clipboard.setData(
      ClipboardData(
        text: '${appState.profile.name} ($username) · UID: $uid',
      ),
    );
    setState(() => _sharedQr = true);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          isAk ? 'မျှဝေရန် လင့်ခ် ကူးယူပြီးပါပြီ' : 'Receive details copied to share',
        ),
        backgroundColor: emeraldSuccess,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _sharedQr = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final lang = appState.language;
    final isAk = lang == 'ak';
    final usernameHandle =
        '@${appState.profile.name.toLowerCase().replaceAll(RegExp(r'\s+'), '')}';
    final uidNumber =
        appState.profile.uid.isNotEmpty ? appState.profile.uid : '202610190001';

    final content = Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // 1. App Logo + App Name (No background container)
            const ArakanEmblem(size: 46),
            const SizedBox(height: 6),
            const Text(
              'Péthar',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: Color(0xFF18181B),
              ),
            ),
            const SizedBox(height: 16),

            // 2. User Name & @username
            Text(
              appState.profile.name,
              style: const TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w800,
                color: Color(0xFF18181B),
              ),
            ),
            const SizedBox(height: 3),
            Text(
              usernameHandle,
              style: const TextStyle(
                fontSize: 12.5,
                fontFamily: 'monospace',
                fontWeight: FontWeight.w600,
                color: Color(0xFF71717A),
              ),
            ),
            const SizedBox(height: 18),

            // 3. QR Code Box
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(26),
                border: Border.all(color: const Color(0xFFE4E4E7), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.06),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: QrImageView(
                data: 'pethar://pay?uid=$uidNumber&user=$usernameHandle&curr=AKD',
                version: QrVersions.auto,
                size: 190.0,
              ),
            ),
            const SizedBox(height: 18),

            // 4. UID Number
            const Text(
              'UID Number',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Color(0xFFA1A1AA),
                letterSpacing: 0.6,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              uidNumber,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 17,
                fontWeight: FontWeight.w900,
                letterSpacing: 2.0,
                color: Color(0xFF18181B),
              ),
            ),
            const SizedBox(height: 22),

            // 5. Bottom Action Buttons: [ copy UID ] & [ Save ]
            SizedBox(
              width: 280,
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _copyUid(context, uidNumber, isAk),
                      icon: Icon(
                        _copiedUid ? Icons.check_rounded : Icons.copy_rounded,
                        size: 16,
                        color: _copiedUid ? emeraldSuccess : const Color(0xFF27272A),
                      ),
                      label: Text(
                        _copiedUid ? (isAk ? 'ကူးယူပြီး' : 'Copied') : 'copy UID',
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: _copiedUid ? emeraldSuccess : const Color(0xFF18181B),
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: BorderSide(
                          color: _copiedUid ? emeraldSuccess : const Color(0xFFD4D4D8),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _saveQr(context, isAk),
                      icon: Icon(
                        _savedQr ? Icons.check_rounded : Icons.download_rounded,
                        size: 16,
                        color: _savedQr ? emeraldSuccess : const Color(0xFF27272A),
                      ),
                      label: Text(
                        _savedQr
                            ? (isAk ? 'သိမ်းပြီး' : 'Saved')
                            : (isAk ? 'သိမ်းမည်' : 'Save'),
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: _savedQr ? emeraldSuccess : const Color(0xFF18181B),
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: BorderSide(
                          color: _savedQr ? emeraldSuccess : const Color(0xFFD4D4D8),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
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
    );

    if (widget.embedded) {
      return Container(
        color: const Color(0xFFF8FAFC),
        child: content,
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar: < | Receive | (Share)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: Color(0xFFE4E4E7))),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                    onTap: () => appState.goBack(),
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.transparent,
                      ),
                      child: const Icon(
                        Icons.chevron_left_rounded,
                        size: 28,
                        color: Color(0xFF18181B),
                      ),
                    ),
                  ),
                  Text(
                    isAk ? 'ငွေလက်ခံရန်' : 'Receive',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF18181B),
                    ),
                  ),
                  GestureDetector(
                    onTap: () => _shareQr(context, appState, uidNumber, isAk),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: const Color(0xFFD4D4D8)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.share_outlined, size: 14, color: crimson),
                          const SizedBox(width: 5),
                          Text(
                            _sharedQr
                                ? (isAk ? 'မျှဝေပြီး' : 'Shared')
                                : (isAk ? 'မျှဝေရန်' : 'Share'),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF18181B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(child: content),
          ],
        ),
      ),
    );
  }
}
