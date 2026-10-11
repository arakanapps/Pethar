import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';

/// Offline Payment Screen
/// 
/// Provides P2P and P2M payment via NFC and Bluetooth
/// when internet connectivity is unavailable.
///
/// Flow:
///   1. Sender selects amount and recipient
///   2. Device creates signed voucher (Ed25519)
///   3. Voucher is transmitted via NFC tap or BLE
///   4. Recipient device stores voucher locally
///   5. When online, voucher syncs to server ledger
///
/// NFC and BLE platform integration status:
///   - Android NFC: Requires nfc_manager plugin + AndroidManifest.xml config
///   - iOS NFC: Requires nfc_manager plugin + entitlements + Info.plist
///   - Android BLE: Requires flutter_blue_plus + location permission
///   - iOS BLE: Requires flutter_blue_plus + Info.plist NSBluetoothAlwaysUsageDescription
///
/// TODO(real-device): Test on physical devices with NFC and BLE hardware
class OfflinePaymentScreen extends StatefulWidget {
  const OfflinePaymentScreen({Key? key}) : super(key: key);

  @override
  State<OfflinePaymentScreen> createState() => _OfflinePaymentScreenState();
}

class _OfflinePaymentScreenState extends State<OfflinePaymentScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedMethod = 'nfc'; // 'nfc', 'ble', 'qr'
  bool _isScanning = false;
  bool _isTransmitting = false;
  String _amount = '';
  String _recipientId = '';
  int _pendingVoucherCount = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    return Scaffold(
      backgroundColor: isDark ? obsidian : paper,
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF0E1522) : Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, size: 18,
            color: isDark ? Colors.white : Colors.black87),
          onPressed: () => appState.goBack(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              lang == 'arak' ? 'အော့ဖ်လိုင်း ငွေပေးချေမှု' : 'Offline Payment',
              style: TextStyle(
                fontSize: 16, fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            Text(
              lang == 'arak' ? 'NFC / ဘလူးတုသ်' : 'NFC / Bluetooth',
              style: TextStyle(fontSize: 11, color: Colors.grey[500]),
            ),
          ],
        ),
        actions: [
          // Pending sync badge
          Stack(
            children: [
              IconButton(
                icon: Icon(Icons.sync, color: isDark ? Colors.white70 : Colors.black54),
                onPressed: () => _showPendingSyncDialog(context, lang),
              ),
              if (_pendingVoucherCount > 0)
                Positioned(
                  top: 8, right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: const BoxDecoration(
                      color: Colors.orange, shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Center(
                      child: Text(
                        '$_pendingVoucherCount',
                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: gold,
          labelColor: gold,
          unselectedLabelColor: Colors.grey[500],
          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          tabs: [
            Tab(text: lang == 'arak' ? 'ငွေပို့' : 'Send'),
            Tab(text: lang == 'arak' ? 'ငွေလက်ခံ' : 'Receive'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildSendTab(isDark, lang, appState),
          _buildReceiveTab(isDark, lang),
        ],
      ),
    );
  }

  Widget _buildSendTab(bool isDark, String lang, AppState appState) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Connectivity warning banner
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.orange.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.orange.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.wifi_off, color: Colors.orange, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    lang == 'arak'
                        ? 'အော့ဖ်လိုင်း မုဒ်: ဘောက်ချာများသည် အင်တာနက် ပြန်ရပါက အလိုအလျောက် sync ပြုလုပ်ပါမည်။'
                        : 'Offline mode: Vouchers will auto-sync when connectivity returns.',
                    style: TextStyle(fontSize: 11, color: isDark ? Colors.white70 : Colors.black87),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Transport method selector
          Text(
            lang == 'arak' ? 'ငွေလွှဲနည်း ရွေးပါ' : 'Select Transfer Method',
            style: TextStyle(
              fontSize: 13, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildMethodCard(
                icon: Icons.contactless,
                label: 'NFC',
                sublabel: lang == 'arak' ? 'ထိ၍ပို့' : 'Tap to Pay',
                method: 'nfc',
                isDark: isDark,
              ),
              const SizedBox(width: 8),
              _buildMethodCard(
                icon: Icons.bluetooth,
                label: 'Bluetooth',
                sublabel: lang == 'arak' ? 'ဘလူးတုသ်' : 'BLE Transfer',
                method: 'ble',
                isDark: isDark,
              ),
              const SizedBox(width: 8),
              _buildMethodCard(
                icon: Icons.qr_code_2,
                label: 'QR',
                sublabel: lang == 'arak' ? 'QR ကုဒ်' : 'QR Code',
                method: 'qr',
                isDark: isDark,
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Amount input
          Text(
            lang == 'arak' ? 'ငွေပမာဏ (AKD)' : 'Amount (AKD)',
            style: TextStyle(
              fontSize: 13, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            keyboardType: TextInputType.number,
            style: TextStyle(
              fontSize: 28, fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
              color: isDark ? Colors.white : Colors.black87,
            ),
            decoration: InputDecoration(
              prefixText: '₳ ',
              prefixStyle: const TextStyle(
                fontSize: 28, fontWeight: FontWeight.bold, color: gold,
              ),
              hintText: '0.00',
              hintStyle: TextStyle(color: Colors.grey[600]),
              filled: true,
              fillColor: isDark ? surfaceCard : Colors.grey[100],
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
            ),
            onChanged: (v) => setState(() => _amount = v),
          ),
          const SizedBox(height: 16),

          // Recipient input
          Text(
            lang == 'arak' ? 'လက်ခံသူ ID' : 'Recipient ID',
            style: TextStyle(
              fontSize: 13, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            style: TextStyle(
              fontSize: 14,
              color: isDark ? Colors.white : Colors.black87,
            ),
            decoration: InputDecoration(
              hintText: lang == 'arak' ? 'ARAK-XXXX သို့မဟုတ် ဖုန်းနံပါတ်' : 'ARAK-XXXX or phone number',
              hintStyle: TextStyle(color: Colors.grey[600], fontSize: 13),
              filled: true,
              fillColor: isDark ? surfaceCard : Colors.grey[100],
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              prefixIcon: Icon(Icons.person_outline, color: Colors.grey[500]),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            ),
            onChanged: (v) => setState(() => _recipientId = v),
          ),
          const SizedBox(height: 24),

          // Security info card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? emeraldSuccess.withOpacity(0.08) : Colors.green[50],
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: emeraldSuccess.withOpacity(0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.verified_user, color: emeraldSuccess, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      lang == 'arak' ? 'ကာကွယ်ထားသော ငွေလွှဲခြင်း' : 'Secured Transfer',
                      style: const TextStyle(
                        fontSize: 12, fontWeight: FontWeight.bold, color: emeraldSuccess,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  lang == 'arak'
                      ? '• Ed25519 ဒစ်ဂျစ်တယ် လက်မှတ်ဖြင့် ကာကွယ်ထားသည်\n'
                        '• Replay attack ကို nonce ဖြင့် တားဆီးသည်\n'
                        '• ၂၄ နာရီ သက်တမ်းရှိ (ပြန်လည်ကောင်းသည့်အခါ sync ပြုလုပ်ပါ)\n'
                        '• ငွေပမာဏကို ယာယီ suspense account တွင် ထားရှိသည်'
                      : '• Protected with Ed25519 digital signatures\n'
                        '• Replay attacks prevented with unique nonce\n'
                        '• 24-hour expiry (auto-sync when connectivity returns)\n'
                        '• Funds held in suspense account until settlement',
                  style: TextStyle(fontSize: 10, color: isDark ? Colors.white60 : Colors.black54, height: 1.5),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Send button
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton(
              onPressed: _amount.isNotEmpty && _recipientId.isNotEmpty && !_isTransmitting
                  ? () => _initiateOfflinePayment(lang)
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: gold,
                foregroundColor: Colors.black,
                disabledBackgroundColor: isDark ? Colors.grey[800] : Colors.grey[300],
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              child: _isTransmitting
                  ? const SizedBox(
                      width: 20, height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _selectedMethod == 'nfc' ? Icons.contactless
                              : _selectedMethod == 'ble' ? Icons.bluetooth
                              : Icons.qr_code_2,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          lang == 'arak'
                              ? (_selectedMethod == 'nfc' ? 'ထိ၍ ငွေပို့ပါ' : 'ဘောက်ချာ ဖန်တီးပါ')
                              : (_selectedMethod == 'nfc' ? 'Tap to Send' : 'Create Voucher'),
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReceiveTab(bool isDark, String lang) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120, height: 120,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isDark ? gold.withOpacity(0.1) : Colors.amber[50],
              border: Border.all(color: gold.withOpacity(0.3), width: 2),
            ),
            child: Icon(
              _isScanning ? Icons.contactless : Icons.nfc,
              size: 48,
              color: _isScanning ? gold : Colors.grey[500],
            ),
          ),
          const SizedBox(height: 20),
          Text(
            _isScanning
                ? (lang == 'arak' ? 'စကင်ဖတ်နေပါသည်...' : 'Scanning...')
                : (lang == 'arak' ? 'ငွေလက်ခံရန် အသင့် ရှိပါသည်' : 'Ready to Receive'),
            style: TextStyle(
              fontSize: 16, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            lang == 'arak'
                ? 'ပေးပို့သူ၏ ဖုန်းဖြင့် ထိပါ (NFC) သို့မဟုတ် ဘလူးတုသ် ဖွင့်ပါ'
                : 'Tap sender\'s phone (NFC) or enable Bluetooth',
            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              setState(() => _isScanning = !_isScanning);
              if (_isScanning) {
                _startReceiveScanning();
              }
            },
            icon: Icon(_isScanning ? Icons.stop : Icons.play_arrow),
            label: Text(
              _isScanning
                  ? (lang == 'arak' ? 'ရပ်ပါ' : 'Stop')
                  : (lang == 'arak' ? 'လက်ခံစတင်ပါ' : 'Start Receiving'),
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: _isScanning ? crimson : gold,
              foregroundColor: _isScanning ? Colors.white : Colors.black,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMethodCard({
    required IconData icon,
    required String label,
    required String sublabel,
    required String method,
    required bool isDark,
  }) {
    final isSelected = _selectedMethod == method;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedMethod = method),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: isSelected
                ? gold.withOpacity(0.15)
                : (isDark ? surfaceCard : Colors.grey[100]),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? gold : Colors.transparent,
              width: isSelected ? 1.5 : 0,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? gold : Colors.grey[500], size: 24),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11, fontWeight: FontWeight.bold,
                  color: isSelected ? gold : (isDark ? Colors.white70 : Colors.black87),
                ),
              ),
              Text(
                sublabel,
                style: TextStyle(fontSize: 9, color: Colors.grey[500]),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _initiateOfflinePayment(String lang) async {
    setState(() => _isTransmitting = true);

    // TODO(real-device): Implement actual NFC/BLE voucher transmission
    // 
    // For NFC:
    //   1. Create OfflineVoucher with signed payload
    //   2. Use NfcManager.instance.startSession()
    //   3. Write NDEF record with voucher data
    //   4. Wait for tap confirmation
    //
    // For BLE:
    //   1. Create OfflineVoucher with signed payload
    //   2. Start BLE advertising with voucher service UUID
    //   3. Wait for recipient to connect and read characteristic
    //   4. Confirm transfer via write-back
    //
    // For QR:
    //   1. Create OfflineVoucher with signed payload
    //   2. Encode as compact JSON
    //   3. Display QR code for recipient to scan

    await Future.delayed(const Duration(seconds: 2)); // Simulate

    setState(() {
      _isTransmitting = false;
      _pendingVoucherCount++;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            lang == 'arak'
                ? 'ဘောက်ချာ ဖန်တီးပြီးပါပြီ — အင်တာနက် ပြန်ရပါက sync ပြုလုပ်ပါမည်'
                : 'Voucher created — will sync when connectivity returns',
          ),
          backgroundColor: emeraldSuccess,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  void _startReceiveScanning() {
    // TODO(real-device): Implement NFC/BLE receive scanning
    //
    // For NFC:
    //   NfcManager.instance.startSession(onDiscovered: (NfcTag tag) {
    //     final ndef = Ndef.from(tag);
    //     final voucherData = ndef?.cachedMessage?.records.first;
    //     // Parse and validate voucher...
    //   });
    //
    // For BLE:
    //   FlutterBluePlus.startScan(
    //     withServices: [Guid(OfflinePaymentConfig.bleServiceUuid)],
    //   );
  }

  void _showPendingSyncDialog(BuildContext context, String lang) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: const Color(0xFF101724),
        title: Text(
          lang == 'arak' ? 'Sync အခြေအနေ' : 'Sync Status',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  lang == 'arak' ? 'စောင့်ဆိုင်းဆဲ ဘောက်ချာ' : 'Pending Vouchers',
                  style: TextStyle(color: Colors.grey[400], fontSize: 13),
                ),
                Text(
                  '$_pendingVoucherCount',
                  style: const TextStyle(
                    color: gold, fontWeight: FontWeight.bold,
                    fontSize: 18, fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Divider(color: Colors.white10),
            const SizedBox(height: 12),
            Text(
              lang == 'arak'
                  ? 'အင်တာနက် ချိတ်ဆက်မှုရရှိပါက ဘောက်ချာများ အလိုအလျောက် sync ပြုလုပ်ပါမည်။'
                  : 'Vouchers will automatically sync when internet connectivity is restored.',
              style: TextStyle(color: Colors.grey[500], fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(lang == 'arak' ? 'ပိတ်ပါ' : 'Close',
              style: const TextStyle(color: gold)),
          ),
        ],
      ),
    );
  }
}
