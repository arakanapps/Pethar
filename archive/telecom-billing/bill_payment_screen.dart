import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../theme.dart';

/// Bill directory.
///
/// Billers are read from `public.bill_providers`. No bundled account numbers,
/// amounts or placeholder merchants are used.
class BillPaymentScreen extends StatefulWidget {
  const BillPaymentScreen({Key? key}) : super(key: key);

  @override
  State<BillPaymentScreen> createState() => _BillPaymentScreenState();
}

class _BillPaymentScreenState extends State<BillPaymentScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Color _parseColor(String? value) {
    final hex = (value ?? '').replaceAll('#', '').trim();
    if (hex.length == 6) {
      final parsed = int.tryParse('FF$hex', radix: 16);
      if (parsed != null) return Color(parsed);
    }
    return crimson;
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAk = appState.language == 'ak';
    final providers = appState.billProvidersList.where((provider) {
      if (_query.trim().isEmpty) return true;
      final needle = _query.toLowerCase();
      return (provider['name'] ?? '').toString().toLowerCase().contains(needle) ||
          (provider['name_mm'] ?? '').toString().toLowerCase().contains(needle) ||
          (provider['category'] ?? '').toString().toLowerCase().contains(needle);
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          isAk ? 'ဘေလ်ဆောင်ခြင်း' : 'Bill payment',
          style: const TextStyle(
            color: Color(0xFF18181B),
            fontWeight: FontWeight.w800,
            fontSize: 17,
          ),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF18181B)),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (value) => setState(() => _query = value),
              decoration: InputDecoration(
                hintText: isAk ? 'ဘေလ်ဝန်ဆောင်မှု ရှာရန်' : 'Search billers',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 14),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFE4E4E7)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFE4E4E7)),
                ),
              ),
            ),
          ),
          Expanded(
            child: providers.isEmpty
                ? ListView(
                    padding: const EdgeInsets.all(24),
                    children: [
                      const SizedBox(height: 80),
                      const Icon(Icons.receipt_long_rounded, size: 52, color: Color(0xFFA1A1AA)),
                      const SizedBox(height: 16),
                      Text(
                        _query.isEmpty
                            ? (isAk ? 'ဘေလ်ဝန်ဆောင်မှု မရှိသေးပါ' : 'No billers available yet')
                            : (isAk ? 'ရှာဖွေမှု မတွေ့ပါ' : 'No matching billers'),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF3F3F46),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        isAk
                            ? 'ဘေလ်ဝန်ဆောင်မှုများ ထည့်သွင်းပြီးပါက ဤနေရာတွင် ပေါ်လာပါမည်။'
                            : 'Billers published by Péthar will appear here automatically.',
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 13, color: Color(0xFF71717A), height: 1.4),
                      ),
                    ],
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                    itemCount: providers.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final provider = providers[index];
                      final name = (provider['name'] ?? '').toString();
                      final category = (provider['category'] ?? '').toString();
                      final initials = (provider['initials'] ?? name).toString();
                      final color = _parseColor(provider['primary_color']?.toString());

                      return Material(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(18),
                          onTap: () => _showBiller(context, provider, isAk),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: const Color(0xFFE4E4E7)),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: color.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    initials.length > 4 ? initials.substring(0, 4) : initials,
                                    style: TextStyle(
                                      color: color,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        name,
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                          color: Color(0xFF18181B),
                                        ),
                                      ),
                                      if (category.isNotEmpty) ...[
                                        const SizedBox(height: 2),
                                        Text(
                                          category,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: Color(0xFF71717A),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                                const Icon(Icons.chevron_right_rounded, color: Color(0xFFA1A1AA)),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  void _showBiller(
    BuildContext context,
    Map<String, dynamic> provider,
    bool isAk,
  ) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.fromLTRB(24, 12, 24, 32),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: const Color(0xFFE4E4E7),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Text(
              (provider['name'] ?? '').toString(),
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(
              (provider['category'] ?? '').toString(),
              style: const TextStyle(fontSize: 13, color: Color(0xFF71717A)),
            ),
            const SizedBox(height: 20),
            Text(
              isAk
                  ? 'ဘေလ်ဆောင်ခြင်းကို မကြာမီ ဖွင့်လှစ်ပါမည်။'
                  : 'Bill payment is not enabled yet.',
              style: const TextStyle(fontSize: 14, color: Color(0xFF3F3F46), height: 1.5),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pop(context),
                child: Text(isAk ? 'ပိတ်မည်' : 'Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
