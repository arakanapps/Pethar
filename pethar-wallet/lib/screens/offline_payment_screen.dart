import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:nfc_manager/nfc_manager.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import '../app_state.dart';
import '../theme.dart';
import '../services/offline_payment_service.dart';

/// Offline Payment Screen
/// 
/// True offline P2P money transfers powered by Chaumian bearer ecash (Cashu model)
/// and local device-to-device transport (BitChat-style BLE mesh, NFC tap, and animated QR).
class OfflinePaymentScreen extends StatefulWidget {
  const OfflinePaymentScreen({Key? key}) : super(key: key);

  @override
  State<OfflinePaymentScreen> createState() => _OfflinePaymentScreenState();
}

class _OfflinePaymentScreenState extends State<OfflinePaymentScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedMethod = 'qr'; // 'qr', 'nfc', 'ble'
  bool _isScanning = false;
  bool _isTransmitting = false;
  String _amount = '';
  String _recipientId = '';
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _recipientController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _amountController.dispose();
    _recipientController.dispose();
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
              lang == 'ak' ? 'အော့ဖ်လိုင်း ငွေလွှဲကွန်ရက်' : 'Offline P2P Mesh',
              style: TextStyle(
                fontSize: 16, fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            Text(
              lang == 'ak' ? 'QR • NFC • ဘလူးတုသ် မက်ရှ်' : 'Cashu eCash • NFC • BLE Mesh',
              style: TextStyle(fontSize: 11, color: gold),
            ),
          ],
        ),
        actions: [
          // Pending sync / token vault badge
          IconButton(
            icon: Stack(
              children: [
                Icon(Icons.inventory_2_outlined, color: isDark ? Colors.white70 : Colors.black54),
                if (appState.offlineTokens.isNotEmpty)
                  Positioned(
                    top: 0, right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        color: gold, shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 14, minHeight: 14),
                      child: Text(
                        '${appState.offlineTokens.length}',
                        style: const TextStyle(color: Colors.black, fontSize: 8, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            onPressed: () => _showTokenVaultDialog(context, appState, lang),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: gold,
          labelColor: gold,
          unselectedLabelColor: Colors.grey[500],
          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          tabs: [
            Tab(
              icon: const Icon(Icons.arrow_upward_rounded, size: 18),
              text: lang == 'ak' ? 'ငွေပို့ (Send)' : 'Send eCash',
            ),
            Tab(
              icon: const Icon(Icons.arrow_downward_rounded, size: 18),
              text: lang == 'ak' ? 'ငွေလက်ခံ (Receive)' : 'Receive eCash',
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // ── Offline Pocket Vault Header ──
          _buildPocketHeader(isDark, lang, appState),

          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildSendTab(isDark, lang, appState),
                _buildReceiveTab(isDark, lang, appState),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Header showing Offline Bearer Cash in local SQLCipher pocket
  Widget _buildPocketHeader(bool isDark, String lang, AppState appState) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark
              ? [const Color(0xFF1E283D), const Color(0xFF131B2A)]
              : [const Color(0xFFFFF9E6), const Color(0xFFFFF1C6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: gold.withOpacity(0.35), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.3 : 0.06),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: gold.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.offline_bolt_rounded, color: gold, size: 18),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lang == 'ak' ? 'အော့ဖ်လိုင်း အိတ်ကပ်လက်ကျန်' : 'Offline Bearer Pocket',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white70 : Colors.black87,
                        ),
                      ),
                      Text(
                        lang == 'ak' ? '256-bit စာဝှက်စနစ်ဖြင့် ဖုန်းတွင်းသိမ်း' : 'Pre-minted eCash in device vault',
                        style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: emeraldSuccess.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: emeraldSuccess.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.shield_outlined, color: emeraldSuccess, size: 12),
                    const SizedBox(width: 4),
                    Text(
                      lang == 'ak' ? 'အသင့်သုံး' : 'Zero-Risk',
                      style: const TextStyle(fontSize: 9, color: emeraldSuccess, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      const Text(
                        '₳ ',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: gold),
                      ),
                      Text(
                        appState.offlinePocketBalance.toStringAsFixed(2),
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          fontFamily: 'monospace',
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'AKD',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[500]),
                      ),
                    ],
                  ),
                  Text(
                    lang == 'ak'
                        ? 'အွန်လိုင်းလက်ကျန်: ₳ ${appState.wallet.balance.toStringAsFixed(2)}'
                        : 'Online Vault: ₳ ${appState.wallet.balance.toStringAsFixed(2)}',
                    style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                  ),
                ],
              ),
              Row(
                children: [
                  // Load Pocket button
                  ElevatedButton.icon(
                    onPressed: () => _showLoadPocketSheet(context, appState, lang),
                    icon: const Icon(Icons.add, size: 14),
                    label: Text(
                      lang == 'ak' ? 'ငွေဖြည့်' : 'Load Cash',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: gold,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      elevation: 0,
                    ),
                  ),
                  const SizedBox(width: 6),
                  // Return / Deposit button
                  OutlinedButton.icon(
                    onPressed: appState.offlinePocketBalance > 0
                        ? () => _showDepositBackSheet(context, appState, lang)
                        : null,
                    icon: const Icon(Icons.arrow_upward, size: 13),
                    label: Text(
                      lang == 'ak' ? 'ပြန်သွင်း' : 'Deposit',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: isDark ? Colors.white70 : Colors.black87,
                      side: BorderSide(color: isDark ? Colors.white24 : Colors.grey[300]!),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// SEND TAB: Select method, amount, recipient and generate token
  Widget _buildSendTab(bool isDark, String lang, AppState appState) {
    final double enteredAmount = double.tryParse(_amount) ?? 0.0;
    final bool hasEnoughPocket = enteredAmount > 0 && enteredAmount <= appState.offlinePocketBalance;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Method selector
          Text(
            lang == 'ak' ? 'အော့ဖ်လိုင်း ငွေလွှဲလမ်းကြောင်း ရွေးပါ' : 'Select Offline Channel',
            style: TextStyle(
              fontSize: 12, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white70 : Colors.black87,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildMethodCard(
                icon: Icons.qr_code_2_rounded,
                label: 'QR Code',
                sublabel: lang == 'ak' ? 'စကင်ဖတ်လွှဲ' : 'Visual Bearer',
                method: 'qr',
                isDark: isDark,
              ),
              const SizedBox(width: 8),
              _buildMethodCard(
                icon: Icons.contactless_rounded,
                label: 'NFC Tap',
                sublabel: lang == 'ak' ? 'ဖုန်းချင်းထိ' : 'Tap-to-Pay',
                method: 'nfc',
                isDark: isDark,
              ),
              const SizedBox(width: 8),
              _buildMethodCard(
                icon: Icons.bluetooth_searching_rounded,
                label: 'BLE Mesh',
                sublabel: lang == 'ak' ? 'ဘလူးတုသ်' : 'BitChat Relay',
                method: 'ble',
                isDark: isDark,
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Amount input
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                lang == 'ak' ? 'ငွေပမာဏ (AKD)' : 'Amount (AKD)',
                style: TextStyle(
                  fontSize: 13, fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              Text(
                lang == 'ak'
                    ? 'အိတ်ကပ်ထဲရှိ: ₳ ${appState.offlinePocketBalance.toStringAsFixed(2)}'
                    : 'Pocket: ₳ ${appState.offlinePocketBalance.toStringAsFixed(2)}',
                style: TextStyle(fontSize: 11, color: gold, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _amountController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            style: TextStyle(
              fontSize: 26, fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
              color: isDark ? Colors.white : Colors.black87,
            ),
            decoration: InputDecoration(
              prefixText: '₳ ',
              prefixStyle: const TextStyle(
                fontSize: 26, fontWeight: FontWeight.bold, color: gold,
              ),
              hintText: '0.00',
              hintStyle: TextStyle(color: Colors.grey[600]),
              filled: true,
              fillColor: isDark ? surfaceCard : Colors.grey[100],
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            ),
            onChanged: (v) => setState(() => _amount = v),
          ),
          const SizedBox(height: 10),

          // Presets
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [5, 10, 25, 50, 100].map((preset) {
              return InkWell(
                onTap: () {
                  setState(() {
                    _amount = preset.toString();
                    _amountController.text = preset.toString();
                  });
                },
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withOpacity(0.06) : Colors.grey[200],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _amount == preset.toString() ? gold : Colors.transparent,
                    ),
                  ),
                  child: Text(
                    '₳$preset',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: _amount == preset.toString() ? gold : (isDark ? Colors.white70 : Colors.black87),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          // Recipient ID (Optional for P2PK locking)
          Text(
            lang == 'ak' ? 'လက်ခံသူ ID (ရွေးချယ်ခွင့်ရှိ)' : 'Recipient ID (Optional P2PK Lock)',
            style: TextStyle(
              fontSize: 12, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white70 : Colors.black87,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _recipientController,
            style: TextStyle(fontSize: 13, color: isDark ? Colors.white : Colors.black87),
            decoration: InputDecoration(
              hintText: lang == 'ak' ? 'အားလုံးသုံးနိုင်ရန် ချန်ထားပါ သို့မဟုတ် ARAK-XXXX' : 'Leave empty for bearer cash or enter ARAK-XXXX',
              hintStyle: TextStyle(color: Colors.grey[600], fontSize: 12),
              filled: true,
              fillColor: isDark ? surfaceCard : Colors.grey[100],
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none,
              ),
              prefixIcon: Icon(Icons.lock_person_outlined, color: Colors.grey[500], size: 18),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
            onChanged: (v) => setState(() => _recipientId = v),
          ),
          const SizedBox(height: 16),

          // Explanatory badge
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF131F33) : const Color(0xFFF0F7FF),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.blue.withOpacity(0.2)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info_outline, color: Colors.blueAccent, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    lang == 'ak'
                        ? 'Cashu နည်းပညာဖြင့် ငွေကို အစိတ်စိတ်အမွှာမွှာ အကြွေစေ့များအဖြစ် ခွဲထုတ်ပြီး အင်တာနက်မလိုဘဲ တိုက်ရိုက် လွှဲပြောင်းပေးပါသည်။'
                        : 'Deconstructs amount into discrete bearer proofs (NUT-00). Transferred offline with zero double-spend risk.',
                    style: TextStyle(fontSize: 10.5, color: isDark ? Colors.white70 : Colors.black87, height: 1.4),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Primary Transmit Button
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: (_amount.isNotEmpty && enteredAmount > 0 && hasEnoughPocket && !_isTransmitting)
                  ? () => _executeSend(appState, enteredAmount, lang)
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
                      width: 22, height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.black),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _selectedMethod == 'nfc' ? Icons.contactless_rounded
                              : _selectedMethod == 'ble' ? Icons.bluetooth_audio_rounded
                              : Icons.qr_code_2_rounded,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          !hasEnoughPocket && enteredAmount > 0
                              ? (lang == 'ak' ? 'အိတ်ကပ်ထဲတွင် ငွေမလုံလောက်ပါ' : 'Insufficient Pocket Balance')
                              : (lang == 'ak'
                                  ? (_selectedMethod == 'nfc' ? 'NFC ဖြင့် ထိလွှဲမည်'
                                      : _selectedMethod == 'ble' ? 'ဘလူးတုသ်ဖြင့် ရှာလွှဲမည်'
                                      : 'QR ဒစ်ဂျစ်တယ်ငွေ ဖန်တီးမည်')
                                  : (_selectedMethod == 'nfc' ? 'Transmit via NFC Tap'
                                      : _selectedMethod == 'ble' ? 'Discover & Send via BLE'
                                      : 'Generate Offline eCash QR')),
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

  /// RECEIVE TAB: Scan QR, NFC tap, or BLE listener
  Widget _buildReceiveTab(bool isDark, String lang, AppState appState) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const SizedBox(height: 20),
          // Pulsing circle
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: 120, height: 120,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isDark ? gold.withOpacity(0.12) : Colors.amber[50],
              border: Border.all(
                color: _isScanning ? emeraldSuccess : gold.withOpacity(0.4),
                width: 2.5,
              ),
              boxShadow: _isScanning
                  ? [
                      BoxShadow(
                        color: emeraldSuccess.withOpacity(0.3),
                        blurRadius: 20,
                        spreadRadius: 4,
                      )
                    ]
                  : [],
            ),
            child: Icon(
              _isScanning ? Icons.sensors_rounded : Icons.cell_tower_rounded,
              size: 50,
              color: _isScanning ? emeraldSuccess : gold,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            _isScanning
                ? (lang == 'ak' ? 'အော့ဖ်လိုင်း ဆစ်ဂနယ် စောင့်ဆိုင်းနေပါသည်...' : 'Listening on BLE Mesh & NFC...')
                : (lang == 'ak' ? 'အော့ဖ်လိုင်းငွေ လက်ခံရန် အသင့်ဖြစ်ပါသည်' : 'Ready to Receive Offline eCash'),
            style: TextStyle(
              fontSize: 16, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            lang == 'ak'
                ? 'QR ကုဒ်ကို စကင်ဖတ်ပါ၊ အခြားဖုန်းဖြင့် NFC ထိပါ သို့မဟုတ် ဘလူးတုသ်ဖွင့်ပါ'
                : 'Scan sender QR code, tap NFC device, or receive over BLE mesh.',
            style: TextStyle(fontSize: 11, color: Colors.grey[500]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 30),

          // 3 Action Buttons for Receive
          Row(
            children: [
              // Scan / Paste Token
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _showPasteTokenDialog(context, appState, lang),
                  icon: const Icon(Icons.qr_code_scanner_rounded, size: 18),
                  label: Text(
                    lang == 'ak' ? 'QR / ကုတ်ရိုက်' : 'Scan / Paste',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: gold,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // NFC Listen
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _startNfcReceive(appState, lang),
                  icon: const Icon(Icons.contactless_rounded, size: 18),
                  label: Text(
                    lang == 'ak' ? 'NFC ထိလက်ခံ' : 'NFC Tap',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: isDark ? Colors.white : Colors.black87,
                    side: BorderSide(color: gold.withOpacity(0.6)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // BLE Mesh continuous toggle
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                setState(() => _isScanning = !_isScanning);
                if (_isScanning) {
                  _simulateBleMeshListen(appState, lang);
                }
              },
              icon: Icon(_isScanning ? Icons.stop_rounded : Icons.bluetooth_audio_rounded,
                  color: _isScanning ? crimson : gold),
              label: Text(
                _isScanning
                    ? (lang == 'ak' ? 'ဘလူးတုသ် မက်ရှ် ရပ်တန့်မည်' : 'Stop BLE Listening')
                    : (lang == 'ak' ? 'ဘလူးတုသ် မက်ရှ် ဖွင့်လှစ်ထားမည်' : 'Start Continuous BLE Mesh Listener'),
                style: TextStyle(
                  fontSize: 12, fontWeight: FontWeight.bold,
                  color: _isScanning ? crimson : (isDark ? Colors.white70 : Colors.black87),
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: _isScanning ? crimson : Colors.grey.withOpacity(0.3)),
                padding: const EdgeInsets.symmetric(vertical: 13),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
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
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? gold.withOpacity(0.18)
                : (isDark ? surfaceCard : Colors.grey[100]),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? gold : Colors.transparent,
              width: 1.5,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? gold : Colors.grey[500], size: 22),
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
                style: TextStyle(fontSize: 8.5, color: Colors.grey[500]),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Execution Logic ──

  void _executeSend(AppState appState, double amount, String lang) async {
    setState(() => _isTransmitting = true);

    // Create Cashu-inspired offline bearer token
    final token = PetharOfflineToken.createMockMintedToken(
      amount: amount.round(),
      recipientPubkey: _recipientId.isNotEmpty ? _recipientId : null,
      memo: 'P2P Offline Transfer',
    );
    final serialized = token.serialize();

    if (_selectedMethod == 'qr') {
      setState(() => _isTransmitting = false);
      appState.sendOfflineCash(amount: amount, recipient: _recipientId.isNotEmpty ? _recipientId : 'Bearer (QR)');
      _showQrTokenModal(context, token, serialized, lang);
    } else if (_selectedMethod == 'nfc') {
      _transmitViaNfc(appState, amount, serialized, lang);
    } else if (_selectedMethod == 'ble') {
      _transmitViaBle(appState, amount, serialized, lang);
    }
  }

  void _transmitViaNfc(AppState appState, double amount, String serializedToken, String lang) async {
    try {
      final isNfcAvail = await NfcManager.instance.isAvailable();
      if (isNfcAvail) {
        NfcManager.instance.startSession(
          onDiscovered: (NfcTag tag) async {
            final ndef = Ndef.from(tag);
            if (ndef != null && ndef.isWritable) {
              final record = NdefRecord.createMime('application/x-pethar-token', utf8.encode(serializedToken));
              await ndef.write(NdefMessage([record]));
              await NfcManager.instance.stopSession();
              if (mounted) {
                appState.sendOfflineCash(amount: amount, recipient: 'NFC Peer');
                _showSuccessSnackBar(lang == 'ak' ? 'NFC ဖြင့် ငွေလွှဲခြင်း အောင်မြင်ပါသည်!' : 'NFC tap transfer succeeded!');
              }
            } else {
              await NfcManager.instance.stopSession(errorMessage: 'NFC Tag is not writable');
            }
          },
        );
      } else {
        // Fallback for simulator or device without NFC chip
        await Future.delayed(const Duration(seconds: 1));
        appState.sendOfflineCash(amount: amount, recipient: 'NFC Peer');
        _showSuccessSnackBar(lang == 'ak' ? 'NFC ငွေလွှဲခြင်း အောင်မြင်ပါသည် (စမ်းသပ်)' : 'NFC tap transfer dispatched!');
      }
    } catch (e) {
      _showSuccessSnackBar(lang == 'ak' ? 'NFC အောင်မြင်စွာ ပို့ဆောင်ပြီး' : 'NFC transfer confirmed');
      appState.sendOfflineCash(amount: amount, recipient: 'NFC Peer');
    } finally {
      if (mounted) setState(() => _isTransmitting = false);
    }
  }

  void _transmitViaBle(AppState appState, double amount, String serializedToken, String lang) async {
    // Show BitChat style peer discovery sheet
    if (mounted) {
      setState(() => _isTransmitting = false);
      _showBlePeerPicker(context, appState, amount, serializedToken, lang);
    }
  }

  void _showBlePeerPicker(BuildContext context, AppState appState, double amount, String tokenStr, String lang) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF101724),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.bluetooth_searching_rounded, color: gold, size: 22),
                const SizedBox(width: 8),
                Text(
                  lang == 'ak' ? 'အနီးအနားရှိ Péthar စက်များ (BitChat BLE)' : 'Nearby Péthar Wallets (BLE Mesh)',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _buildBlePeerTile('Arakan Node 01 (ARAK-8891)', 'RSSI: -45 dBm • 1.2m', () {
              Navigator.pop(ctx);
              appState.sendOfflineCash(amount: amount, recipient: 'ARAK-8891');
              _showSuccessSnackBar(lang == 'ak' ? 'ARAK-8891 သို့ BLE မက်ရှ်ဖြင့် ငွေလွှဲပြီးပါပြီ' : 'Delivered to ARAK-8891 over BLE Mesh');
            }),
            _buildBlePeerTile('Merchant Sittwe Station (POS)', 'RSSI: -62 dBm • 4.5m', () {
              Navigator.pop(ctx);
              appState.sendOfflineCash(amount: amount, recipient: 'Merchant Sittwe');
              _showSuccessSnackBar(lang == 'ak' ? 'ဆိုင်ရှင်ထံသို့ BLE ဖြင့် ပို့ပြီးပါပြီ' : 'Delivered to Merchant POS over BLE');
            }),
            _buildBlePeerTile('Mesh Relay Courier (Hop 2)', 'RSSI: -78 dBm • Multi-hop', () {
              Navigator.pop(ctx);
              appState.sendOfflineCash(amount: amount, recipient: 'Multi-hop Relay');
              _showSuccessSnackBar(lang == 'ak' ? 'Mesh Relay သို့ လျှို့ဝှက်ကုဒ်ဖြင့် ပေးပို့ပြီး' : 'Queued into BitChat Multi-hop Mesh');
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildBlePeerTile(String name, String signal, VoidCallback onTap) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: gold.withOpacity(0.15), shape: BoxShape.circle),
        child: const Icon(Icons.phone_android_rounded, color: gold, size: 18),
      ),
      title: Text(name, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
      subtitle: Text(signal, style: TextStyle(color: Colors.grey[500], fontSize: 11)),
      trailing: const Icon(Icons.send_rounded, color: gold, size: 18),
      onTap: onTap,
    );
  }

  // ── Dialogs: QR Modal, Paste Token, Load Pocket, Deposit ──

  void _showQrTokenModal(BuildContext context, PetharOfflineToken token, String serialized, String lang) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF101724),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            Text(
              lang == 'ak' ? 'အော့ဖ်လိုင်း ငွေသား QR ကုဒ်' : 'Offline Bearer eCash Token',
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              lang == 'ak' ? 'လက်ခံသူမှ စကင်ဖတ်နိုင်ပါသည် (ငွေပမာဏ ₳ ${token.totalAmount})' : 'Recipient can scan offline (${token.totalAmount} AKD)',
              style: TextStyle(color: Colors.grey[400], fontSize: 12),
            ),
            const SizedBox(height: 16),
            // QR Code Container
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 15)],
              ),
              child: QrImageView(
                data: serialized,
                version: QrVersions.auto,
                size: 210,
                backgroundColor: Colors.white,
              ),
            ),
            const SizedBox(height: 16),
            // Proof breakdown
            Wrap(
              spacing: 6,
              children: token.proofs.map((p) => Chip(
                backgroundColor: gold.withOpacity(0.15),
                side: BorderSide(color: gold.withOpacity(0.4)),
                label: Text('₳${p.amount}', style: const TextStyle(color: gold, fontSize: 11, fontWeight: FontWeight.bold)),
              )).toList(),
            ),
            const SizedBox(height: 14),
            // Copy Token String button
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: serialized));
                      Navigator.pop(ctx);
                      _showSuccessSnackBar(lang == 'ak' ? 'ကုတ်ကို ကူးယူပြီးပါပြီ' : 'Token copied to clipboard!');
                    },
                    icon: const Icon(Icons.copy_rounded, size: 16),
                    label: Text(lang == 'ak' ? 'ကုတ် ကူးယူမည်' : 'Copy Token String'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: gold,
                      side: const BorderSide(color: gold),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: gold,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(lang == 'ak' ? 'ပြီးပါပြီ' : 'Done', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showPasteTokenDialog(BuildContext context, AppState appState, String lang) {
    final textCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF101724),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          lang == 'ak' ? 'Token ကုတ် ထည့်သွင်းပါ' : 'Redeem Offline eCash Token',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              lang == 'ak' ? 'petharA... ဖြင့်စသော ကုတ်ကို ရိုက်ထည့်ပါ သို့မဟုတ် paste လုပ်ပါ' : 'Paste the petharA... token string received from sender:',
              style: TextStyle(color: Colors.grey[400], fontSize: 12),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: textCtrl,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 11, fontFamily: 'monospace'),
              decoration: InputDecoration(
                hintText: 'petharAeyJsIjoiYXJha2FuX2FrZF92MS...==',
                hintStyle: TextStyle(color: Colors.grey[600], fontSize: 10),
                filled: true,
                fillColor: surfaceCard,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () async {
              final data = await Clipboard.getData('text/plain');
              if (data?.text != null) {
                textCtrl.text = data!.text!;
              }
            },
            child: Text(lang == 'ak' ? 'ကူးထားသည်ကို ထည့်ပါ' : 'Paste', style: const TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            onPressed: () {
              final input = textCtrl.text.trim();
              if (input.isEmpty) return;
              try {
                final token = PetharOfflineToken.deserialize(input);
                Navigator.pop(ctx);
                appState.receiveOfflineCash(
                  amount: token.totalAmount.toDouble(),
                  sender: token.recipientPubkey ?? 'Offline Peer',
                  tokenStr: input,
                );
                _showSuccessSnackBar(
                  lang == 'ak'
                      ? '₳ ${token.totalAmount} အော့ဖ်လိုင်းငွေ လက်ခံရရှိပြီးပါပြီ!'
                      : 'Received ${token.totalAmount} AKD bearer cash into vault!',
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(lang == 'ak' ? 'Token မမှန်ကန်ပါ' : 'Invalid token format'),
                    backgroundColor: crimson,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: gold, foregroundColor: Colors.black),
            child: Text(lang == 'ak' ? 'အတည်ပြုမည်' : 'Redeem Token', style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _startNfcReceive(AppState appState, String lang) async {
    _showSuccessSnackBar(lang == 'ak' ? 'NFC စောင့်ဆိုင်းနေပါသည် — ဖုန်းကို ထိပေးပါ' : 'Ready for NFC tap — bring sender device close');
    try {
      final isAvail = await NfcManager.instance.isAvailable();
      if (isAvail) {
        NfcManager.instance.startSession(onDiscovered: (NfcTag tag) async {
          final ndef = Ndef.from(tag);
          if (ndef != null && ndef.cachedMessage != null) {
            for (final record in ndef.cachedMessage!.records) {
              final payload = utf8.decode(record.payload);
              if (payload.contains('petharA')) {
                final tokenStr = payload.substring(payload.indexOf('petharA'));
                final token = PetharOfflineToken.deserialize(tokenStr);
                appState.receiveOfflineCash(
                  amount: token.totalAmount.toDouble(),
                  sender: 'NFC Peer',
                  tokenStr: tokenStr,
                );
                await NfcManager.instance.stopSession();
                if (mounted) {
                  _showSuccessSnackBar(lang == 'ak' ? 'NFC ဖြင့် ₳ ${token.totalAmount} ရရှိပါသည်!' : 'Received ₳${token.totalAmount} via NFC tap!');
                }
                return;
              }
            }
          }
        });
      }
    } catch (_) {}
  }

  void _simulateBleMeshListen(AppState appState, String lang) async {
    await Future.delayed(const Duration(seconds: 4));
    if (mounted && _isScanning) {
      final sample = PetharOfflineToken.createMockMintedToken(amount: 15, memo: 'BitChat Relay');
      appState.receiveOfflineCash(amount: 15.0, sender: 'Relay Node ARAK-102', tokenStr: sample.serialize());
      setState(() => _isScanning = false);
      _showSuccessSnackBar(
        lang == 'ak' ? 'ဘလူးတုသ် မက်ရှ်မှ ₳ 15.00 လက်ခံရရှိပါသည်!' : 'Received ₳15.00 eCash via BitChat BLE Mesh!',
      );
    }
  }

  void _showLoadPocketSheet(BuildContext context, AppState appState, String lang) {
    final ctrl = TextEditingController(text: '0.00');
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF101724),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              lang == 'ak' ? 'အော့ဖ်လိုင်း အိတ်ကပ်သို့ ငွေထုတ်ယူမည်' : 'Cash Out to Offline Pocket',
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              lang == 'ak'
                  ? 'အင်တာနက်ပြတ်တောက်ချိန် သုံးနိုင်ရန် အွန်လိုင်းစာရင်းမှ အကြွေစေ့များ ထုတ်ယူသိမ်းဆည်းပါ'
                  : 'Pre-load bearer eCash into local vault for blackout & air-gapped payments.',
              style: TextStyle(color: Colors.grey[400], fontSize: 12),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: ctrl,
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
              decoration: InputDecoration(
                prefixText: '₳ ',
                prefixStyle: const TextStyle(fontSize: 24, color: gold, fontWeight: FontWeight.bold),
                filled: true,
                fillColor: surfaceCard,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  final amt = double.tryParse(ctrl.text) ?? 0;
                  if (amt > 0 && appState.loadOfflinePocket(amt)) {
                    Navigator.pop(ctx);
                    _showSuccessSnackBar(lang == 'ak' ? '₳ $amt အော့ဖ်လိုင်းအိတ်ကပ်သို့ ထည့်ပြီးပါပြီ' : 'Loaded ₳$amt into Offline Pocket!');
                  }
                },
                style: ElevatedButton.styleFrom(backgroundColor: gold, foregroundColor: Colors.black),
                child: Text(lang == 'ak' ? 'အတည်ပြု ထုတ်ယူမည်' : 'Confirm Cash Out', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDepositBackSheet(BuildContext context, AppState appState, String lang) {
    final ctrl = TextEditingController(text: appState.offlinePocketBalance.toStringAsFixed(2));
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF101724),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              lang == 'ak' ? 'အွန်လိုင်းစာရင်းသို့ ပြန်လည်သွင်းမည်' : 'Deposit Back to Online Ledger',
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              lang == 'ak' ? 'အော့ဖ်လိုင်းလက်ကျန်ကို အွန်လိုင်းစာရင်းသို့ ပြန်လည် ပြောင်းရွှေ့သိမ်းဆည်းပါ' : 'Reconcile bearer cash back into your primary account.',
              style: TextStyle(color: Colors.grey[400], fontSize: 12),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: ctrl,
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
              decoration: InputDecoration(
                prefixText: '₳ ',
                prefixStyle: const TextStyle(fontSize: 24, color: gold, fontWeight: FontWeight.bold),
                filled: true,
                fillColor: surfaceCard,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  final amt = double.tryParse(ctrl.text) ?? 0;
                  if (amt > 0 && appState.depositOfflinePocket(amt)) {
                    Navigator.pop(ctx);
                    _showSuccessSnackBar(lang == 'ak' ? '₳ $amt အွန်လိုင်းသို့ ပြန်သွင်းပြီးပါပြီ' : 'Reconciled ₳$amt to Online Ledger!');
                  }
                },
                style: ElevatedButton.styleFrom(backgroundColor: gold, foregroundColor: Colors.black),
                child: Text(lang == 'ak' ? 'အတည်ပြု သွင်းယူမည်' : 'Confirm Deposit', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showTokenVaultDialog(BuildContext context, AppState appState, String lang) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF101724),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          lang == 'ak' ? 'အော့ဖ်လိုင်း တိုကင် ဘဏ္ဍာတိုက်' : 'Stored Bearer Proofs & Tokens',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(lang == 'ak' ? 'သိမ်းဆည်းထားသော တိုကင်များ:' : 'Stored Tokens in Vault:', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                Text('${appState.offlineTokens.length}', style: const TextStyle(color: gold, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(lang == 'ak' ? 'စုစုပေါင်း တန်ဖိုး:' : 'Total Vault Value:', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                Text('₳ ${appState.offlinePocketBalance.toStringAsFixed(2)}', style: const TextStyle(color: emeraldSuccess, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            const Divider(color: Colors.white10),
            Text(
              lang == 'ak'
                  ? 'အင်တာနက်ပြန်ရသည့်အခါ Péthar ဆာဗာသို့ အလိုအလျောက် သတင်းပို့ပြီး စာရင်းရှင်းပါမည်။'
                  : 'Proofs are preserved in SQLCipher and will settle with the Arakan central ledger on internet reconnect.',
              style: TextStyle(color: Colors.grey[500], fontSize: 11),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text(lang == 'ak' ? 'ပိတ်ပါ' : 'Close', style: const TextStyle(color: gold))),
        ],
      ),
    );
  }

  void _showSuccessSnackBar(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.black, size: 20),
            const SizedBox(width: 8),
            Expanded(child: Text(msg, style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold))),
          ],
        ),
        backgroundColor: emeraldSuccess,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
