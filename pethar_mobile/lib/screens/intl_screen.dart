import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';

class IntlScreen extends StatefulWidget {
  const IntlScreen({Key? key}) : super(key: key);

  @override
  State<IntlScreen> createState() => _IntlScreenState();
}

class _IntlScreenState extends State<IntlScreen> {
  String _selectedCorridor = 'THB';
  final TextEditingController _amountCtrl = TextEditingController(text: '3580');

  @override
  void dispose() {
    _amountCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    final corridors = [
      {'code': 'THB', 'name': 'Thai Baht (ထိုင်းဘတ်)', 'rate': 35.8},
      {'code': 'MYR', 'name': 'Malaysian Ringgit (မလေးရှားရင်းဂစ်)', 'rate': 4.72},
      {'code': 'SGD', 'name': 'Singapore Dollar (စင်ကာပူဒေါ်လာ)', 'rate': 1.34},
      {'code': 'USD', 'name': 'US Dollar (အမေရိကန်ဒေါ်လာ)', 'rate': 1.0},
    ];

    final currentRate = corridors.firstWhere((c) => c['code'] == _selectedCorridor)['rate'] as double;
    final inputVal = double.tryParse(_amountCtrl.text) ?? 0.0;
    final akdVal = currentRate > 0 ? (inputVal / currentRate) : 0.0;

    return Scaffold(
      backgroundColor: isDark ? obsidian : paper,
      appBar: AppBar(
        title: Text(
          TranslationStrings.tr('intlTitle', lang),
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: isDark ? surfaceDark : Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => appState.goBack(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.cyan.withOpacity(0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.cyan.withOpacity(0.3)),
              ),
              child: Text(
                TranslationStrings.tr('intlSubtitle', lang),
                style: const TextStyle(color: Colors.cyanAccent, fontSize: 11, height: 1.4),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              lang == 'arak' ? 'ငွေလွှဲပေးပို့မည့် နိုင်ငံနှင့် ငွေကြေး' : 'Select Remittance Corridor',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.grey[400] : Colors.grey[700],
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: isDark ? surfaceCard : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? slateBorder : Colors.grey[300]!),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedCorridor,
                  isExpanded: true,
                  dropdownColor: isDark ? surfaceDark : Colors.white,
                  items: corridors.map((c) {
                    return DropdownMenuItem<String>(
                      value: c['code'] as String,
                      child: Text(
                        '${c['code']} - ${c['name']}',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedCorridor = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              '${lang == 'arak' ? 'နိုင်ငံခြားငွေပမာဏ' : 'Foreign Amount'} ($_selectedCorridor)',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.grey[400] : Colors.grey[700],
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _amountCtrl,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              decoration: InputDecoration(
                filled: true,
                fillColor: isDark ? surfaceCard : Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                prefixIcon: const Icon(Icons.monetization_on_outlined, color: gold),
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 20),
            // Converted AKD box
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? surfaceCard : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: gold.withOpacity(0.4)),
              ),
              child: Column(
                children: [
                  Text(
                    lang == 'arak' ? 'ရရှိမည့် အာရက္ခဒေါ်လာ (AKD)' : 'Estimated Arakan Dollar (AKD)',
                    style: TextStyle(color: Colors.grey[500], fontSize: 11),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '₳ ${akdVal.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      color: gold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Rate: 1 AKD = $currentRate $_selectedCorridor (Zero Intermediary Fee)',
                    style: const TextStyle(color: emeraldSuccess, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        lang == 'arak'
                            ? 'Wise နိုင်ငံတကာငွေလွှဲစနစ် စတင်လုပ်ဆောင်နေပါသည်...'
                            : 'Initiated Wise Global Remittance...',
                      ),
                      backgroundColor: emeraldSuccess,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                  appState.goBack();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: gold,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Text(
                  lang == 'arak' ? 'ငွေလွှဲအတည်ပြုမည်' : 'Confirm Global Remittance',
                  style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
