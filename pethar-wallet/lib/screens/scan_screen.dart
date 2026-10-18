import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import 'receive_screen.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({Key? key}) : super(key: key);

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  int _bottomTab = 0; // 0: Scan, 1: MyQR (Receive function)
  bool _flashlightOn = false;
  bool _sharedQr = false;
  String? _galleryResult;

  void _shareMyQr(BuildContext context, AppState appState, bool isAk) {
    final username =
        '@${appState.profile.name.toLowerCase().replaceAll(RegExp(r'\s+'), '')}';
    Clipboard.setData(
      ClipboardData(
        text: '${appState.profile.name} ($username) · UID: 000000000000',
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

  void _fetchQrAndGoToPay(AppState appState, {String? name, String? uid, String? username}) {
    HapticFeedback.mediumImpact();
    final targetName = name ?? 'Zaw Myo Htet';
    final targetUid = uid ?? '882194012345';
    final targetUsername = username ?? '@zawmyo';

    appState.startPayForContact(
      name: targetName,
      id: 'REC-1',
      initials: 'ZM',
      colorValue: 0xFF10B981,
      username: targetUsername,
      uid: targetUid,
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAk = appState.language == 'ak';

    return Scaffold(
      backgroundColor:
          _bottomTab == 0 ? const Color(0xFF52525B) : const Color(0xFFF8FAFC),
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Top Overlay Header: Back (<) | Scan/MyQR | Flashlight Torch or Share Button
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: _bottomTab == 0 ? Colors.transparent : Colors.white,
                border: _bottomTab == 0
                    ? null
                    : const Border(bottom: BorderSide(color: Color(0xFFE4E4E7))),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: () => appState.navigate(Screen.home),
                    icon: Icon(
                      Icons.chevron_left,
                      color: _bottomTab == 0 ? Colors.white : Colors.black87,
                      size: 30,
                    ),
                  ),
                  Text(
                    'Scan/MyQR',
                    style: TextStyle(
                      color: _bottomTab == 0 ? Colors.white : Colors.black87,
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  if (_bottomTab == 0)
                    GestureDetector(
                      onTap: () => setState(() => _flashlightOn = !_flashlightOn),
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _flashlightOn ? crimson : Colors.black26,
                          border: Border.all(color: Colors.white, width: 1.4),
                          boxShadow: _flashlightOn
                              ? [
                                  BoxShadow(
                                    color: crimson.withValues(alpha: 0.8),
                                    blurRadius: 16,
                                  ),
                                ]
                              : null,
                        ),
                        child: Icon(
                          _flashlightOn
                              ? Icons.flashlight_on_rounded
                              : Icons.flashlight_off_outlined,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                    )
                  else
                    GestureDetector(
                      onTap: () => _shareMyQr(context, appState, isAk),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 6,
                        ),
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

            // Main Viewfinder or MyQR (Receive Function) Body
            Expanded(
              child: _bottomTab == 0
                  ? Stack(
                      alignment: Alignment.center,
                      children: [
                        if (_flashlightOn)
                          Container(
                            color: Colors.white.withValues(alpha: 0.16),
                          ),
                        // Tappable Viewfinder area to scan and fetch QR
                        Positioned.fill(
                          child: GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: () => _fetchQrAndGoToPay(appState),
                          ),
                        ),
                        // Horizontal glowing laser scan line
                        IgnorePointer(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 32),
                            child: Container(
                              height: 2.5,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                boxShadow: [
                                  BoxShadow(
                                    color: crimson.withValues(alpha: 0.9),
                                    blurRadius: 12,
                                    spreadRadius: 2,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        if (_galleryResult != null)
                          Positioned(
                            top: 40,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 10,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.black87,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                _galleryResult!,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                        // Bottom instruction, Quick Scan button & "Select from Gallery" pill button
                        Positioned(
                          bottom: 24,
                          left: 20,
                          right: 20,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                isAk
                                    ? 'QR ကုဒ် သို့မဟုတ် ဘားကုဒ်ကို ဘောင်အတွင်း ထားရှိပါ'
                                    : 'Align recipient QR code in frame to scan instantly',
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 14),
                              // Instant Fetch QR & Go To Pay Action Button
                              GestureDetector(
                                onTap: () => _fetchQrAndGoToPay(appState),
                                child: Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [Color(0xFFFF2A38), crimson],
                                    ),
                                    borderRadius: BorderRadius.circular(14),
                                    boxShadow: [
                                      BoxShadow(
                                        color: crimson.withValues(alpha: 0.4),
                                        blurRadius: 14,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(Icons.bolt_rounded, color: Colors.white, size: 20),
                                      const SizedBox(width: 8),
                                      Text(
                                        isAk
                                            ? 'QR ကုဒ်ဖတ်ပြီး ငွေလွှဲမည် (@zawmyo)'
                                            : 'Fetch Recipient QR (@zawmyo • 882194012345)',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 13,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(height: 10),
                              GestureDetector(
                                onTap: () {
                                  _fetchQrAndGoToPay(appState);
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 20,
                                    vertical: 10,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.55),
                                    borderRadius: BorderRadius.circular(999),
                                    border: Border.all(color: Colors.white24),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.photo_library_outlined,
                                        color: Colors.white,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        isAk
                                            ? 'ပုံပြခန်းမှ ရွေးချယ်ရန်'
                                            : 'Select from Gallery',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    )
                  : const ReceiveScreen(embedded: true),
            ),

            // Bottom White Scan / MyQR Bar
            Container(
              height: 82,
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFE4E4E7))),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => setState(() => _bottomTab = 0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.qr_code_scanner_rounded,
                            color: _bottomTab == 0 ? crimson : Colors.black87,
                            size: 24,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            isAk ? 'စကင်ဖတ်' : 'Scan',
                            style: TextStyle(
                              color: _bottomTab == 0 ? crimson : Colors.black87,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            width: 36,
                            height: 3,
                            decoration: BoxDecoration(
                              color: _bottomTab == 0 ? crimson : Colors.transparent,
                              borderRadius: BorderRadius.circular(99),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => setState(() => _bottomTab = 1),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.qr_code_2_rounded,
                            color: _bottomTab == 1 ? crimson : Colors.black87,
                            size: 24,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'MyQR',
                            style: TextStyle(
                              color: _bottomTab == 1 ? crimson : Colors.black87,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            width: 36,
                            height: 3,
                            decoration: BoxDecoration(
                              color: _bottomTab == 1 ? crimson : Colors.transparent,
                              borderRadius: BorderRadius.circular(99),
                            ),
                          ),
                        ],
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
  }
}
