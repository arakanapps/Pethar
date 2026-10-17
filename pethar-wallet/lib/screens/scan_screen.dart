import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../app_state.dart';
import '../theme.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({Key? key}) : super(key: key);

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  int _bottomTab = 0; // 0: Scan, 1: Pay
  bool _flashlightOn = false;
  String? _galleryResult;

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAk = appState.language == 'ak';

    return Scaffold(
      backgroundColor: _bottomTab == 0 ? const Color(0xFF52525B) : const Color(0xFFF8FAFC),
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Top Overlay Header: Back (<) | Scan | Flashlight Torch Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                    _bottomTab == 0
                        ? (isAk ? 'စကင်ဖတ်ရန်' : 'Scan')
                        : (isAk ? 'QR ဖြင့် ငွေပေးချေရန်' : 'Pay'),
                    style: TextStyle(
                      color: _bottomTab == 0 ? Colors.white : Colors.black87,
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
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
                          _flashlightOn ? Icons.flashlight_on_rounded : Icons.flashlight_off_outlined,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                    )
                  else
                    const SizedBox(width: 40),
                ],
              ),
            ),

            // Main Viewfinder or Pay QR Body
            Expanded(
              child: _bottomTab == 0
                  ? Stack(
                      alignment: Alignment.center,
                      children: [
                        if (_flashlightOn)
                          Container(
                            color: Colors.white.withValues(alpha: 0.16),
                          ),
                        // Horizontal glowing laser scan line matching photo 8.21.36
                        Padding(
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
                        if (_galleryResult != null)
                          Positioned(
                            top: 40,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                              decoration: BoxDecoration(
                                color: Colors.black87,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                _galleryResult!,
                                style: const TextStyle(color: Colors.white, fontSize: 12),
                              ),
                            ),
                          ),
                        // Bottom instruction & "Select from Gallery" pill button
                        Positioned(
                          bottom: 28,
                          left: 24,
                          right: 24,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                isAk
                                    ? 'QR ကုဒ် သို့မဟုတ် ဘားကုဒ်ကို ဘောင်အတွင်း ထားရှိပါ'
                                    : 'Place the QR code or barcode within the frame.',
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 16),
                              GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _galleryResult = isAk
                                        ? 'Gallery မှ QR ကုဒ်ကို ဖတ်ရှုပြီးပါပြီ'
                                        : 'QR Code loaded from Gallery';
                                  });
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.55),
                                    borderRadius: BorderRadius.circular(999),
                                    border: Border.all(color: Colors.white24),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.photo_library_outlined, color: Colors.white, size: 18),
                                      const SizedBox(width: 8),
                                      Text(
                                        isAk ? 'ပုံပြခန်းမှ ရွေးချယ်ရန်' : 'Select from Gallery',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 14,
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
                  : Center(
                      child: Container(
                        width: 280,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(28),
                          boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 24)],
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            QrImageView(
                              data: 'pethar://pay?user=${appState.profile.petharId}&cur=AKD',
                              version: QrVersions.auto,
                              size: 190,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              appState.profile.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.black87),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              appState.profile.petharId,
                              style: const TextStyle(fontSize: 12, color: Colors.black54, fontFamily: 'monospace'),
                            ),
                          ],
                        ),
                      ),
                    ),
            ),

            // Bottom White Scan / Pay Bar matching photo 8.21.36
            Container(
              height: 82,
              color: Colors.white,
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
                            isAk ? 'ငွေပေးချေ' : 'Pay',
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
