import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import '../widgets/arakan_emblem.dart';

class PosTerminalScreen extends StatefulWidget {
  const PosTerminalScreen({Key? key}) : super(key: key);

  @override
  State<PosTerminalScreen> createState() => _PosTerminalScreenState();
}

class _PosTerminalScreenState extends State<PosTerminalScreen> {
  final Map<String, int> _cart = {
    'Arakan Fragrant Rice': 1,
  };
  final TextEditingController _customAmtCtrl = TextEditingController();
  String _viewState = 'checkout'; // 'checkout', 'waiting', 'paid', 'receipt'
  String _paidTxnId = '';

  final posItems = [
    {'id': '1', 'name': 'Arakan Fragrant Rice (1 Bag)', 'mm': 'အာရက္ခပေါ်ဆန်းမွှေးဆန် ၁ အိတ်', 'price': 28.0, 'cat': 'Food', 'icon': Icons.rice_bowl},
    {'id': '2', 'name': 'Diesel / Generator Fuel (5 Gal)', 'mm': 'ဒီဇယ် / မီးစက်ဆီ ၅ ဂါလံ', 'price': 22.5, 'cat': 'Fuel', 'icon': Icons.local_gas_station},
    {'id': '3', 'name': 'Solar Storage Battery (100Ah)', 'mm': 'ဆိုလာ ဘက်ထရီအိုး ၁၀၀Ah', 'price': 110.0, 'cat': 'Solar', 'icon': Icons.battery_charging_full},
    {'id': '4', 'name': 'Essential Antibiotics & Care Kit', 'mm': 'အခြေခံဆေးဝါးနှင့် ရှေးဦးသူနာပြုစုစုံ', 'price': 15.0, 'cat': 'Pharma', 'icon': Icons.medication},
    {'id': '5', 'name': 'Starlink / High-Speed Satellite Data', 'mm': 'ဂြိုဟ်တု အင်တာနက် လစဉ်ဒေတာ', 'price': 45.0, 'cat': 'Telecom', 'icon': Icons.satellite_alt},
    {'id': '6', 'name': 'Cooking Oil & Kitchen Staples', 'mm': 'စားသုံးဆီနှင့် အခြေခံမီးဖိုချောင်သုံး', 'price': 12.0, 'cat': 'Groceries', 'icon': Icons.shopping_basket},
  ];

  double get _totalAmount {
    double sum = 0.0;
    _cart.forEach((name, qty) {
      final itm = posItems.firstWhere((i) => i['name'] == name);
      sum += (itm['price'] as double) * qty;
    });
    final customVal = double.tryParse(_customAmtCtrl.text) ?? 0.0;
    return sum + customVal;
  }

  void _addItem(String name) {
    setState(() {
      _cart[name] = (_cart[name] ?? 0) + 1;
    });
  }

  void _removeItem(String name) {
    setState(() {
      if ((_cart[name] ?? 0) > 1) {
        _cart[name] = _cart[name]! - 1;
      } else {
        _cart.remove(name);
      }
    });
  }

  void _simulatePaid(AppState appState) {
    final txId = 'ARAK-POS-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    setState(() {
      _paidTxnId = txId;
      _viewState = 'paid';
    });
  }

  void _resetRegister() {
    setState(() {
      _cart.clear();
      _customAmtCtrl.clear();
      _viewState = 'checkout';
    });
  }

  @override
  void dispose() {
    _customAmtCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    return Scaffold(
      backgroundColor: isDark ? obsidian : paper,
      body: Column(
        children: [
          // ── POS Register Header ─────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              gradient: isDark
                  ? const LinearGradient(colors: [Color(0xFF1C2530), Color(0xFF090D14)])
                  : null,
              color: isDark ? null : Colors.white,
              border: Border(bottom: BorderSide(color: isDark ? slateBorder : Colors.grey[200]!)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: crimson.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: crimson.withOpacity(0.4)),
                      ),
                      child: const Icon(Icons.store, color: Colors.redAccent, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              TranslationStrings.tr('posTitle', lang),
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.white12,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'TERMINAL #AK-092',
                                style: TextStyle(fontFamily: 'monospace', fontSize: 9, color: gold),
                              ),
                            ),
                          ],
                        ),
                        Text(
                          lang == 'arak' ? 'မြောက်ဦးတော်ဝင် ကုန်မာနှင့် စတိုးဆိုင်' : 'Mrauk-U Royal Merchant Register',
                          style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                        ),
                      ],
                    ),
                  ],
                ),
                Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(lang == 'arak' ? 'ယနေ့ရောင်းရငွေ' : 'Daily Sales', style: TextStyle(fontSize: 9, color: Colors.grey[500])),
                        const Text('₳ 4,890.50', style: TextStyle(fontFamily: 'monospace', fontSize: 13, fontWeight: FontWeight.bold, color: emeraldSuccess)),
                      ],
                    ),
                    const SizedBox(width: 16),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => appState.goBack(),
                      tooltip: 'Exit Register',
                    ),
                  ],
                ),
              ],
            ),
          ),

          // ── POS Body: Split Pane or Overlay States ───────────────────────
          Expanded(
            child: _viewState == 'waiting'
                ? _buildWaitingCustomerView(isDark, lang, appState)
                : _viewState == 'paid'
                    ? _buildPaidView(isDark, lang)
                    : _viewState == 'receipt'
                        ? _buildThermalReceiptView(isDark, lang)
                        : _buildRegisterSplitPane(isDark, lang),
          ),
        ],
      ),
    );
  }

  // ── Split Pane: Items Catalog (Left) + Cart Drawer (Right) ───────────────
  Widget _buildRegisterSplitPane(bool isDark, String lang) {
    return Row(
      children: [
        // Left Column: Catalog & Custom Amount
        Expanded(
          flex: 6,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  TranslationStrings.tr('posQuickItems', lang).toUpperCase(),
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: gold, letterSpacing: 0.5),
                ),
              ),
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.1,
                  ),
                  itemCount: posItems.length,
                  itemBuilder: (ctx, idx) {
                    final itm = posItems[idx];
                    final name = itm['name'] as String;
                    final qty = _cart[name] ?? 0;

                    return Material(
                      color: isDark ? surfaceCard : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () => _addItem(name),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Icon(itm['icon'] as IconData, color: gold, size: 24),
                                  if (qty > 0)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(color: gold, borderRadius: BorderRadius.circular(8)),
                                      child: Text('$qty', style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10)),
                                    ),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    lang == 'arak' ? (itm['mm'] as String) : name,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11,
                                      color: isDark ? Colors.white : Colors.black87,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '₳ ${(itm['price'] as double).toStringAsFixed(2)}',
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontWeight: FontWeight.w900,
                                      fontSize: 13,
                                      color: gold,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              // Custom Amount Input
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? surfaceDark : Colors.white,
                  border: Border(top: BorderSide(color: isDark ? slateBorder : Colors.grey[200]!)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _customAmtCtrl,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          hintText: 'Add custom charge amount (₳)...',
                          prefixText: '₳ ',
                          filled: true,
                          fillColor: isDark ? surfaceCard : Colors.grey[100],
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton(
                      onPressed: () => setState(() {}),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: gold,
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Add to Bill', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Right Column: Cart Drawer & Checkout Bar
        Container(
          width: 320,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF101724) : Colors.grey[50],
            border: Border(left: BorderSide(color: isDark ? slateBorder : Colors.grey[200]!)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Current Order', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    if (_cart.isNotEmpty)
                      GestureDetector(
                        onTap: () => setState(() => _cart.clear()),
                        child: const Text('Clear All', style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                  ],
                ),
              ),
              Expanded(
                child: _cart.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.shopping_cart_outlined, size: 36, color: Colors.grey[600]),
                            const SizedBox(height: 8),
                            Text('Cart is empty', style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                          ],
                        ),
                      )
                    : ListView(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        children: _cart.entries.map((e) {
                          final itm = posItems.firstWhere((i) => i['name'] == e.key);
                          final subtotal = (itm['price'] as double) * e.value;
                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isDark ? surfaceCard : Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: isDark ? Colors.white.withOpacity(0.04) : Colors.grey[200]!),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        lang == 'arak' ? (itm['mm'] as String) : itm['name'] as String,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      Text(
                                        '₳ ${subtotal.toStringAsFixed(2)}',
                                        style: const TextStyle(fontFamily: 'monospace', color: gold, fontSize: 12, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                ),
                                Row(
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.remove, size: 14),
                                      onPressed: () => _removeItem(e.key),
                                    ),
                                    Text('${e.value}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                    IconButton(
                                      icon: const Icon(Icons.add, size: 14),
                                      onPressed: () => _addItem(e.key),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
              ),
              // Cart Total & Charge Button
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? surfaceDark : Colors.white,
                  border: Border(top: BorderSide(color: isDark ? slateBorder : Colors.grey[200]!)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Total Amount Due', style: TextStyle(fontSize: 11, color: Colors.grey[400])),
                        Text(
                          '₳ ${_totalAmount.toStringAsFixed(2)}',
                          style: const TextStyle(fontFamily: 'monospace', fontSize: 24, fontWeight: FontWeight.w900, color: gold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        onPressed: _totalAmount > 0 ? () => setState(() => _viewState = 'waiting') : null,
                        icon: const Icon(Icons.qr_code, color: Colors.black, size: 18),
                        label: Text(
                          lang == 'arak' ? 'QR ဖြင့် ငွေတောင်းခံမည်' : 'Charge with QR',
                          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: gold,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── Customer Scan View (Waiting for Scan) ─────────────────────────────────
  Widget _buildWaitingCustomerView(bool isDark, String lang, AppState appState) {
    return Center(
      child: Container(
        width: 380,
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
          boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 24)],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const ArakanEmblem(size: 32),
            const SizedBox(height: 10),
            const Text(
              'ARAKAN MERCHANT REGISTER',
              style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w900, letterSpacing: 1.5, fontSize: 13),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(16)),
              child: Column(
                children: [
                  Text('AMOUNT DUE', style: TextStyle(color: Colors.grey[600], fontSize: 10)),
                  Text(
                    '₳ ${_totalAmount.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w900, fontFamily: 'monospace', color: Colors.black87),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            QrImageView(
              data: 'pethar://pos_pay?amt=$_totalAmount&terminal=AK-092',
              version: QrVersions.auto,
              size: 190,
            ),
            const SizedBox(height: 12),
            Text(
              TranslationStrings.tr('posScanToPay', lang),
              style: TextStyle(color: Colors.teal[700], fontSize: 12, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _viewState = 'checkout'),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _simulatePaid(appState),
                    style: ElevatedButton.styleFrom(backgroundColor: emeraldSuccess),
                    child: const Text('Simulate Scan', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ── Paid Success View ───────────────────────────────────────────────────
  Widget _buildPaidView(bool isDark, String lang) {
    return Center(
      child: Container(
        width: 360,
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: isDark ? surfaceCard : Colors.white,
          borderRadius: BorderRadius.circular(28),
          boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 20)],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(color: emeraldSuccess.withOpacity(0.15), shape: BoxShape.circle),
              child: const Icon(Icons.check_circle, color: emeraldSuccess, size: 36),
            ),
            const SizedBox(height: 16),
            const Text('Payment Received!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text(
              '₳ ${_totalAmount.toStringAsFixed(2)} settled into terminal account',
              style: TextStyle(fontSize: 12, color: Colors.grey[400]),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => setState(() => _viewState = 'receipt'),
                icon: const Icon(Icons.receipt, color: Colors.black),
                label: const Text('View & Print Thermal Receipt', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(backgroundColor: gold),
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: _resetRegister,
              child: const Text('Next Transaction'),
            ),
          ],
        ),
      ),
    );
  }

  // ── Thermal Paper Receipt View ──────────────────────────────────────────
  Widget _buildThermalReceiptView(bool isDark, String lang) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Container(
          width: 320,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFFFAF9F6),
            borderRadius: BorderRadius.circular(16),
            boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 16)],
            border: Border.all(color: Colors.grey[300]!),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const ArakanEmblem(size: 28),
              const SizedBox(height: 8),
              const Text(
                'PETHAR MERCHANT REGISTER',
                style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black),
              ),
              const Text('Terminal #AK-092 · Sittwe-Mrauk-U Highway', style: TextStyle(fontFamily: 'monospace', fontSize: 9, color: Colors.black54)),
              const Text('TAX ID: ARAK-REG-2026-9921', style: TextStyle(fontFamily: 'monospace', fontSize: 9, color: Colors.black54)),
              const SizedBox(height: 12),
              const Text('----------------------------------------', style: TextStyle(fontFamily: 'monospace', fontSize: 10, color: Colors.black38)),
              ..._cart.entries.map((e) {
                final itm = posItems.firstWhere((i) => i['name'] == e.key);
                final sub = (itm['price'] as double) * e.value;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${e.value}x ${itm['name']}', style: const TextStyle(fontFamily: 'monospace', fontSize: 10, color: Colors.black)),
                      Text('₳ ${sub.toStringAsFixed(2)}', style: const TextStyle(fontFamily: 'monospace', fontSize: 10, color: Colors.black, fontWeight: FontWeight.bold)),
                    ],
                  ),
                );
              }),
              const Text('----------------------------------------', style: TextStyle(fontFamily: 'monospace', fontSize: 10, color: Colors.black38)),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('TOTAL PAID:', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w900, fontSize: 13, color: Colors.black)),
                  Text('₳ ${_totalAmount.toStringAsFixed(2)}', style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w900, fontSize: 14, color: Colors.black)),
                ],
              ),
              const SizedBox(height: 12),
              Text('REF: $_paidTxnId', style: const TextStyle(fontFamily: 'monospace', fontSize: 9, color: Colors.black54)),
              const Text('SETTLEMENT: INSTANT DOUBLE-ENTRY', style: TextStyle(fontFamily: 'monospace', fontSize: 8, color: Colors.black54)),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Receipt sent to thermal printer ✓'), backgroundColor: emeraldSuccess),
                    );
                    _resetRegister();
                  },
                  icon: const Icon(Icons.print, color: Colors.black),
                  label: const Text('Print Receipt', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(backgroundColor: gold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
