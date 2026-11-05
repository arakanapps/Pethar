import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
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
  final GlobalKey _qrCardKey = GlobalKey();
  bool _copiedUid = false;
  bool _savedQr = false;
  bool _sharedQr = false;
  bool _isSavingQr = false;

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

  Future<void> _saveQr(BuildContext context, bool isAk) async {
    if (_isSavingQr) return;
    final messenger = ScaffoldMessenger.of(context);
    try {
      _isSavingQr = true;
      final boundary = _qrCardKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
      if (boundary == null) return;
      final image = await boundary.toImage(pixelRatio: 3.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) return;
      final bytes = byteData.buffer.asUint8List();

      Directory? targetDir;
      if (Platform.isAndroid) {
        final picturesDir = Directory('/storage/emulated/0/Pictures/Pethar');
        if (await picturesDir.exists()) {
          targetDir = picturesDir;
        } else {
          try {
            await picturesDir.create(recursive: true);
            targetDir = picturesDir;
          } catch (_) {
            targetDir = await getExternalStorageDirectory();
          }
        }
      } else {
        targetDir = await getApplicationDocumentsDirectory();
      }

      if (targetDir != null) {
        final file = File('${targetDir.path}/pethar-qr-${DateTime.now().millisecondsSinceEpoch}.png');
        await file.writeAsBytes(bytes);
        if (mounted) {
          setState(() => _savedQr = true);
          messenger.showSnackBar(
            SnackBar(
              content: Text(
                isAk
                    ? 'QR ကုဒ်ကို ဖုန်းပြခန်းထဲတွင် သိမ်းဆည်းပြီးပါပြီ ✓'
                    : 'QR code saved to Phone Gallery ✓',
              ),
              backgroundColor: emeraldSuccess,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 2),
            ),
          );
          Future.delayed(const Duration(seconds: 2), () {
            if (mounted) setState(() => _savedQr = false);
          });
        }
      }
    } catch (e) {
      debugPrint('Save QR error: $e');
    } finally {
      _isSavingQr = false;
    }
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
    final uidNumber = appState.profile.uid;

    final content = Align(
      alignment: Alignment.topCenter,
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 28, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // RenderRepaintBoundary wraps entire QR card so Save saves image to device
            RepaintBoundary(
              key: _qrCardKey,
              child: Container(
                width: 300,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: const Color(0xFFE4E4E7), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.07),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const ArakanEmblem(size: 44),
                    const SizedBox(height: 6),
                    const Text(
                      'Péthar',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF18181B),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      appState.profile.name.isNotEmpty ? appState.profile.name : 'Péthar User',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF18181B),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      usernameHandle,
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF71717A),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE4E4E7)),
                      ),
                      child: QrImageView(
                        data: 'pethar://pay?uid=$uidNumber&user=$usernameHandle&curr=AKD',
                        version: QrVersions.auto,
                        size: 170.0,
                      ),
                    ),
                    const SizedBox(height: 14),
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
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Bottom Action Buttons: [ Copy ] & [ Save ]
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
                        padding: const EdgeInsets.symmetric(vertical: 11),
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
                            : (isAk ? 'သိမ်းဆည်းရန်' : 'Save'),
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: _savedQr ? emeraldSuccess : const Color(0xFF18181B),
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 11),
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
            const SizedBox(height: 12),

            // Share Button
            SizedBox(
              width: 280,
              child: ElevatedButton.icon(
                onPressed: () => _shareQr(context, appState, uidNumber, isAk),
                icon: Icon(
                  _sharedQr ? Icons.check_rounded : Icons.share_rounded,
                  size: 16,
                  color: Colors.white,
                ),
                label: Text(
                  _sharedQr
                      ? (isAk ? 'မျှဝေပြီး' : 'Shared')
                      : (isAk ? 'မျှဝေရန်' : 'Share'),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: crimson,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );

    if (widget.embedded) {
      return content;
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF18181B), size: 20),
          onPressed: () => appState.goBack(),
        ),
        title: Text(
          isAk ? 'ငွေလက်ခံရန် QR ကုဒ်' : 'Receive Payment',
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: Color(0xFF18181B),
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(child: content),
    );
  }
}
