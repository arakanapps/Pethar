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
        content: Text(
          isAk ? 'ပိုက်ဆံအိတ်လိပ်စာ ကူးယူပြီးပါပြီ' : 'Wallet address copied to clipboard',
        ),
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
        text: '${appState.profile.name} ($username) · Wallet Address: $uid',
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

    final content = Align(
      alignment: Alignment.topCenter,
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 48, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // 1. App Logo + App Name (No background container)
            const ArakanEmblem(size: 44),
            const SizedBox(height: 6),
            const Text(
              'Péthar',
              style: TextStyle(
                fontSize: 14.5,
                fontWeight: FontWeight.w800,
                color: Color(0xFF18181B),
              ),
            ),
            const SizedBox(height: 14),

            // 2. User Name & @username
            Text(
              appState.profile.name,
              style: const TextStyle(
                fontSize: 18,
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
            const SizedBox(height: 16),

            // 3. QR Code Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFE4E4E7), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.06),
                    blurRadius: 22,
                    offset: const Offset(0, 7),
                  ),
                ],
              ),
              child: QrImageView(
                data: 'pethar://pay?uid=$uidNumber&user=$usernameHandle&curr=AKD',
                version: QrVersions.auto,
                size: 170.0,
              ),
            ),
            const SizedBox(height: 16),

            // 4. Wallet Address
            Text(
              isAk ? 'ပိုက်ဆံအိတ် လိပ်စာ' : 'Wallet Address',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Color(0xFFA1A1AA),
                letterSpacing: 0.6,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              uidNumber,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 16.5,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.8,
                color: Color(0xFF18181B),
              ),
            ),
            const SizedBox(height: 16),

            // 5. Bottom Action Buttons: [ Copy ] & [ Save ]
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
                        _copiedUid
                            ? (isAk ? 'ကူးယူပြီး' : 'Copied')
                            : (isAk ? 'ကူးယူရန်' : 'Copy'),
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: _copiedUid ? emeraldSuccess : const Color(0xFF18181B),
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10.5),
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
                        padding: const EdgeInsets.symmetric(vertical: 10.5),
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
            // Top Bar: < | Receive (centered) | (Share)
            Container(
              height: 52,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: Color(0xFFE4E4E7))),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: GestureDetector(
                      onTap: () => appState.goBack(),
                      child: Container(
                        width: 36,
                        height: 36,
                        alignment: Alignment.center,
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
                  ),
                  Center(
                    child: Text(
                      isAk ? 'ငွေလက်ခံရန်' : 'Receive',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF18181B),
                      ),
                    ),
                  ),
                  Align(
                    alignment: Alignment.centerRight,
                    child: GestureDetector(
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
