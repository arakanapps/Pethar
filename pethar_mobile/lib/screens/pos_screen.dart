import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';

class PosScreen extends StatefulWidget {
  const PosScreen({Key? key}) : super(key: key);

  @override
  State<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends State<PosScreen> {
  final Map<String, int> _cart = {};
  bool _chargeRequested = false;

  final items = [
    {'name': 'Arakan Fragrant Rice', 'mm': 'အာရက္ခပေါ်ဆန်းမွှေးဆန်', 'price': 28.0, 'icon': Icons.rice_bowl},
    {'name': 'Diesel Fuel (5 Gal)', 'mm': 'ဒီဇယ် ၅ ဂါလံ', 'price': 22.5, 'icon': Icons.local_gas_station},
    {'name': 'Solar Battery 100Ah', 'mm': 'ဆိုလာ ဘက်ထရီအိုး', 'price': 110.0, 'icon': Icons.battery_charging_full},
    {'name': 'Essential Antibiotics', 'mm': 'အခြေခံဆေးဝါးစုံ', 'price': 15.0, 'icon': Icons.medication},
    {'name': 'Starlink Satellite Data', 'mm': 'ဂြိုဟ်တု အင်တာနက်', 'price': 45.0, 'icon': Icons.satellite_alt},
    {'name': 'Cooking Oil Staples', 'mm': 'စားသုံးဆီ', 'price': 12.0, 'icon': Icons.shopping_basket},
  ];

  double get _totalPrice {
    double sum = 0.0;
    _cart.forEach((name, qty) {
      final itm = items.firstWhere((i) => i['name'] == name);
      sum += (itm['price'] as double) * qty;
    });
    return sum;
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    return Scaffold(
      backgroundColor: isDark ? obsidian : paper,
      appBar: AppBar(
        title: Text(
          TranslationStrings.tr('posTitle', lang),
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: isDark ? surfaceDark : Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_chargeRequested) {
              setState(() => _chargeRequested = false);
            } else {
              appState.goBack();
            }
          },
        ),
      ),
      body: _chargeRequested
          ? Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(28),
                        boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 20)],
                      ),
                      child: Column(
                        children: [
                          Text(
                            TranslationStrings.tr('posAmountDue', lang),
                            style: TextStyle(color: Colors.grey[600], fontSize: 11),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '₳ ${_totalPrice.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 34,
                              fontWeight: FontWeight.w900,
                              fontFamily: 'monospace',
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 20),
                          QrImageView(
                            data: 'pethar://pay?amount=$_totalPrice&merchant=${appState.profile.petharId}',
                            version: QrVersions.auto,
                            size: 190,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            TranslationStrings.tr('posScanToPay', lang),
                            style: TextStyle(color: Colors.teal[700], fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _cart.clear();
                            _chargeRequested = false;
                          });
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Payment Received! Receipt Printed.'),
                              backgroundColor: emeraldSuccess,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: emeraldSuccess,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: const Text('Complete Sale & Print Receipt', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.15,
                    ),
                    itemCount: items.length,
                    itemBuilder: (ctx, idx) {
                      final itm = items[idx];
                      final name = itm['name'] as String;
                      final qty = _cart[name] ?? 0;

                      return Material(
                        color: isDark ? surfaceCard : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(20),
                          onTap: () {
                            setState(() {
                              _cart[name] = qty + 1;
                            });
                          },
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
                                        decoration: BoxDecoration(
                                          color: gold,
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          '$qty',
                                          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11),
                                        ),
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
                                        fontSize: 12,
                                        color: isDark ? Colors.white : Colors.black87,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '₳ ${(itm['price'] as double).toStringAsFixed(2)}',
                                      style: const TextStyle(
                                        color: gold,
                                        fontWeight: FontWeight.w900,
                                        fontFamily: 'monospace',
                                        fontSize: 13,
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
                // Bottom charge bar
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? surfaceDark : Colors.white,
                    border: Border(top: BorderSide(color: isDark ? Colors.white12 : Colors.grey[200]!)),
                  ),
                  child: Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('TOTAL DUE', style: TextStyle(fontSize: 10, color: Colors.grey[500])),
                          Text(
                            '₳ ${_totalPrice.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              fontFamily: 'monospace',
                              color: gold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _totalPrice > 0 ? () => setState(() => _chargeRequested = true) : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: gold,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          child: Text(
                            lang == 'arak' ? 'QR ဖြင့် ငွေတောင်းခံမည်' : 'Charge with QR',
                            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
