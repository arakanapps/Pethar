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
  String _selectedCorridor = 'USD';
  final TextEditingController _amountCtrl = TextEditingController(text: '0.00');

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
      {'code': 'USD', 'name': 'US Dollar (အမေရိကန်ဒေါ်လာ)', 'rate': 1.0},
      {'code': 'USDT', 'name': 'Tether (USDT)', 'rate': 1.0},
      {'code': 'USDC', 'name': 'USD Coin (USDC)', 'rate': 1.0},
    ];

    final currentRate = corridors.firstWhere((c) => c['code'] == _selectedCorridor)['rate'] as double;
    final inputVal = double.tryParse(_amountCtrl.text) ?? 0.0;
    final akdVal = currentRate > 0 ? (inputVal / currentRate) : 0.0;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      appBar: AppBar(
        title: Text(
          TranslationStrings.tr('intlTitle', lang),
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A)),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
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
                color: const Color(0xFFE0F2FE),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFBAE6FD)),
              ),
              child: Text(
                TranslationStrings.tr('intlSubtitle', lang),
                style: const TextStyle(color: Color(0xFF0284C7), fontSize: 11, fontWeight: FontWeight.w600, height: 1.4),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              lang == 'ak' ? 'ငွေလွှဲပေးပို့မည့် နိုင်ငံနှင့် ငွေကြေး' : 'Select Remittance Corridor',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF475569),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedCorridor,
                  isExpanded: true,
                  dropdownColor: Colors.white,
                  items: corridors.map((c) {
                    return DropdownMenuItem<String>(
                      value: c['code'] as String,
                      child: Text(
                        '${c['code']} - ${c['name']}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A),
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
              '${lang == 'ak' ? 'နိုင်ငံခြားငွေပမာဏ' : 'Foreign Amount'} ($_selectedCorridor)',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF475569),
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _amountCtrl,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A)),
              decoration: InputDecoration(
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.5),
                ),
                prefixIcon: const Icon(Icons.monetization_on_outlined, color: Color(0xFFD4AF37)),
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 20),
            // Converted AKD box
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Text(
                    lang == 'ak' ? 'ရရှိမည့် အာရက္ခဒေါ်လာ (AKD)' : 'Estimated Arakan Dollar (AKD)',
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '₳ ${akdVal.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFD4AF37),
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
                        lang == 'ak'
                            ? 'နိုင်ငံတကာငွေလွှဲစနစ် စတင်လုပ်ဆောင်နေပါသည်...'
                            : 'Initiated Global Remittance...',
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
                  lang == 'ak' ? 'ငွေလွှဲအတည်ပြုမည်' : 'Confirm Global Remittance',
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
