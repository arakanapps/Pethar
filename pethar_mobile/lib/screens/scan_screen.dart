import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import '../widgets/arakan_emblem.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({Key? key}) : super(key: key);

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> with SingleTickerProviderStateMixin {
  int _selectedTab = 0; // 0: Scan, 1: My QR, 2: QR to Pay
  bool _flashlightOn = false;
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    final tabs = [
      {'label': lang == 'arak' ? 'စကင်ဖတ်' : 'Scan', 'icon': Icons.qr_code_scanner},
      {'label': lang == 'arak' ? 'မိမိ QR' : 'My QR', 'icon': Icons.qr_code},
      {'label': lang == 'arak' ? 'QR ဖြင့် ငွေပေးချေ' : 'QR to Pay', 'icon': Icons.payment},
    ];

    return Scaffold(
      backgroundColor: _selectedTab == 0 ? Colors.black : (isDark ? obsidian : paper),
      appBar: AppBar(
        title: Text(
          TranslationStrings.tr('navScan', lang),
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: _selectedTab == 0 ? Colors.black : (isDark ? surfaceDark : Colors.white),
        elevation: 0,
        centerTitle: true,
      ),
      body: Column(
        children: [
          // ── Segmented Tab Selector ──────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: _selectedTab == 0
                    ? Colors.white.withOpacity(0.12)
                    : (isDark ? surfaceCard : Colors.grey[200]),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: List.generate(tabs.length, (idx) {
                  final active = _selectedTab == idx;
                  final item = tabs[idx];
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedTab = idx),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: active ? gold : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: active
                              ? [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 4)]
                              : null,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              item['icon'] as IconData,
                              size: 14,
                              color: active ? Colors.black : Colors.grey,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              item['label'] as String,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: active ? Colors.black : Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),

          // ── TAB 0: SCAN VIEW ──────────────────────────────────────────
          if (_selectedTab == 0) ...[
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: gold.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: gold.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: gold, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      lang == 'arak'
                          ? 'ငွေပေးချေရန်၊ ငွေလွှဲရန် သို့မဟုတ် ငွေထုတ်ရန်သာ စကင်ဖတ်ပါ။'
                          : 'Scan to pay, transfer, or withdraw only.',
                      style: const TextStyle(color: goldLight, fontSize: 10, height: 1.3),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Viewfinder box
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 240,
                          height: 240,
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.white24, width: 1),
                            borderRadius: BorderRadius.circular(24),
                          ),
                        ),
                        // Corner brackets
                        Positioned(
                          top: 0,
                          left: 0,
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: const BoxDecoration(
                              border: Border(
                                top: BorderSide(color: gold, width: 4),
                                left: BorderSide(color: gold, width: 4),
                              ),
                              borderRadius: BorderRadius.only(topLeft: Radius.circular(24)),
                            ),
                          ),
                        ),
                        Positioned(
                          top: 0,
                          right: 0,
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: const BoxDecoration(
                              border: Border(
                                top: BorderSide(color: gold, width: 4),
                                right: BorderSide(color: gold, width: 4),
                              ),
                              borderRadius: BorderRadius.only(topRight: Radius.circular(24)),
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          left: 0,
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: const BoxDecoration(
                              border: Border(
                                bottom: BorderSide(color: gold, width: 4),
                                left: BorderSide(color: gold, width: 4),
                              ),
                              borderRadius: BorderRadius.only(bottomLeft: Radius.circular(24)),
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: const BoxDecoration(
                              border: Border(
                                bottom: BorderSide(color: gold, width: 4),
                                right: BorderSide(color: gold, width: 4),
                              ),
                              borderRadius: BorderRadius.only(bottomRight: Radius.circular(24)),
                            ),
                          ),
                        ),
                        // Animated Scanning Line
                        AnimatedBuilder(
                          animation: _animController,
                          builder: (ctx, child) {
                            return Positioned(
                              top: 20 + (200 * _animController.value),
                              left: 20,
                              right: 20,
                              child: Container(
                                height: 2,
                                decoration: BoxDecoration(
                                  color: gold,
                                  boxShadow: [
                                    BoxShadow(
                                      color: gold.withOpacity(0.8),
                                      blurRadius: 8,
                                      spreadRadius: 1,
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                        const Icon(Icons.qr_code_scanner, color: Colors.white24, size: 54),
                      ],
                    ),
                    const SizedBox(height: 30),
                    // Controls (Flashlight, Gallery)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          onPressed: () => setState(() => _flashlightOn = !_flashlightOn),
                          icon: Icon(
                            _flashlightOn ? Icons.flash_on : Icons.flash_off,
                            color: _flashlightOn ? gold : Colors.white70,
                          ),
                          style: IconButton.styleFrom(
                            backgroundColor: Colors.white12,
                            padding: const EdgeInsets.all(12),
                          ),
                        ),
                        const SizedBox(width: 24),
                        IconButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(lang == 'arak' ? 'ပုံပြခန်းမှ QR ရွေးပါ' : 'Select QR from Gallery'),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                          icon: const Icon(Icons.photo_library, color: Colors.white70),
                          style: IconButton.styleFrom(
                            backgroundColor: Colors.white12,
                            padding: const EdgeInsets.all(12),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],

          // ── TAB 1: MY QR CARD ─────────────────────────────────────────
          if (_selectedTab == 1)
            Expanded(
              child: Center(
                child: Container(
                  width: 270,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 20)],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Header
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: const BoxDecoration(
                          color: Color(0xFF17679A),
                          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                        ),
                        child: Row(
                          children: const [
                            ArakanEmblem(size: 26),
                            SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'ARAKAN QR PAYMENT',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 11,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                Text(
                                  'Arakan Digital Wallet',
                                  style: TextStyle(color: Colors.white70, fontSize: 9),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      // QR Code
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: QrImageView(
                          data: 'pethar://receive?id=${appState.profile.petharId}&cur=AKD',
                          version: QrVersions.auto,
                          size: 180,
                        ),
                      ),
                      Text(
                        'Scan QR to transfer to account',
                        style: TextStyle(color: Colors.teal[700], fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Name: ${appState.profile.name}',
                        style: const TextStyle(color: Colors.black87, fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        'Account: ${appState.profile.petharId}',
                        style: TextStyle(color: Colors.grey[600], fontSize: 10, fontFamily: 'monospace'),
                      ),
                      const SizedBox(height: 16),
                      // Footer actions
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: const BorderRadius.vertical(bottom: Radius.circular(24)),
                          border: Border(top: BorderSide(color: Colors.grey[200]!)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: TextButton.icon(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('QR Code saved to Gallery'),
                                      behavior: SnackBarBehavior.floating,
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.download, size: 16, color: Colors.teal),
                                label: const Text('Save', style: TextStyle(color: Colors.black87, fontSize: 11)),
                              ),
                            ),
                            Container(width: 1, height: 30, color: Colors.grey[300]),
                            Expanded(
                              child: TextButton.icon(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Sharing QR code...'),
                                      behavior: SnackBarBehavior.floating,
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.share, size: 16, color: Colors.teal),
                                label: const Text('Share', style: TextStyle(color: Colors.black87, fontSize: 11)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // ── TAB 2: QR TO PAY ─────────────────────────────────────────
          if (_selectedTab == 2)
            Expanded(
              child: Center(
                child: Container(
                  width: 270,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 20)],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: const BoxDecoration(
                          color: Color(0xFF17679A),
                          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: const [
                            Text('Pay at', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                            Text('Arakan Merchant', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: QrImageView(
                          data: 'pethar://pay?merchant=ARAKAN&curr=AKD',
                          version: QrVersions.auto,
                          size: 180,
                        ),
                      ),
                      Text(
                        'ARAKAN QR PAYMENT',
                        style: TextStyle(color: Colors.teal[700], fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Scan to pay with ₳',
                        style: TextStyle(color: Colors.grey[500], fontSize: 10),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
