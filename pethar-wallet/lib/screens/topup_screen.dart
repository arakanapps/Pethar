import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../theme.dart';

/// Mobile top-up catalogue.
///
/// The screen renders only packages published in `public.topup_packages`.
/// It never falls back to bundled prices or demo operators.
class TopupScreen extends StatelessWidget {
  const TopupScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAk = appState.language == 'ak';
    final packages = appState.topupPackagesList;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          isAk ? 'ငွေဖြည့်' : 'Top-up',
          style: const TextStyle(
            color: Color(0xFF18181B),
            fontWeight: FontWeight.w800,
            fontSize: 17,
          ),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF18181B)),
      ),
      body: RefreshIndicator(
        onRefresh: appState.loadSupabaseData,
        child: packages.isEmpty
            ? ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  const SizedBox(height: 80),
                  const Icon(Icons.inbox_rounded, size: 52, color: Color(0xFFA1A1AA)),
                  const SizedBox(height: 16),
                  Text(
                    isAk
                        ? 'ငွေဖြည့် ပက်ကေ့ချ်များ မရှိသေးပါ'
                        : 'No top-up packages available yet',
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
                        ? 'အော်ပရေတာများမှ ပက်ကေ့ချ်များ ထည့်သွင်းပြီးပါက ဤနေရာတွင် ပေါ်လာပါမည်။'
                        : 'Packages published by operators will appear here automatically.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF71717A), height: 1.4),
                  ),
                ],
              )
            : ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                itemCount: packages.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final item = packages[index];
                  final name = (item['name'] ?? '').toString();
                  final quota = (item['quota'] ?? '').toString();
                  final validity = (item['validity'] ?? '').toString();
                  final category = (item['category'] ?? '').toString();
                  final price = double.tryParse((item['price_akd'] ?? '0').toString()) ?? 0;

                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFE4E4E7)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF1F2),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(Icons.sim_card_rounded, color: crimson, size: 22),
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
                              const SizedBox(height: 2),
                              Text(
                                [quota, validity, category]
                                    .where((value) => value.isNotEmpty)
                                    .join(' • '),
                                style: const TextStyle(fontSize: 12, color: Color(0xFF71717A)),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          '₳ ${NumberFormat('#,##0.00').format(price)}',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF18181B),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}
