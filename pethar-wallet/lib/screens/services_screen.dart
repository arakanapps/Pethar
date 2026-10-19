import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../widgets/support_and_kyc_modals.dart';

class ServicesScreen extends StatelessWidget {
  const ServicesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final lang = appState.language;

    final categories = [
      {
        'titleEn': 'MONEY MOVEMENT & CASH',
        'titleMm': 'ငွေလွှဲနှင့် ငွေသားဝန်ဆောင်မှုများ',
        'items': [
          {
            'screen': Screen.cashout,
            'nameEn': 'Agent Cash-Out',
            'nameMm': 'အေးဂျင့်မှ ငွေသားထုတ်ယူ',
            'descEn': 'Physical cash at Sittwe, Mrauk-U, Kyaukpyu',
            'descMm': 'စစ်တွေ၊ မြောက်ဦး၊ ကျောက်ဖြူ ငွေသားထုတ်ယူ',
            'icon': Icons.storefront_rounded,
            'color': emeraldSuccess,
          },
        ],
      },
      {
        'titleEn': 'GLOBAL BANKING & REMITTANCE',
        'titleMm': 'နိုင်ငံတကာငွေလွှဲနှင့် ဘဏ်လုပ်ငန်း',
        'items': [
          {
            'screen': Screen.intl,
            'nameEn': 'Wise Global Wire',
            'nameMm': 'Wise ပြည်ပငွေလွှဲ',
            'descEn': 'Thailand, Malaysia, Singapore, USA, Europe',
            'descMm': 'ထိုင်း၊ မလေး၊ စင်ကာပူ၊ အမေရိကန်',
            'icon': Icons.public_rounded,
            'color': const Color(0xFF06B6D4),
          },
        ],
      },
      {
        'titleEn': 'DIGITAL ASSETS & ARAKAN RETAIL',
        'titleMm': 'ဒစ်ဂျစ်တယ်ဒင်္ဂါးနှင့် အရောင်းစနစ်',
        'items': [
          {
            'screen': Screen.crypto,
            'nameEn': 'Binance & MEXC Bridge',
            'nameMm': 'Binance / MEXC ချိတ်ဆက်မှု',
            'descEn': 'Direct 0-fee crypto deposit and withdrawal',
            'descMm': 'အခမဲ့ USDT တိုက်ရိုက်သွင်း/ထုတ်',
            'icon': Icons.monetization_on_outlined,
            'color': const Color(0xFFA855F7),
          },
        ],
      },
      {
        'titleEn': 'RESILIENT & OFFLINE PAYMENT RAILS',
        'titleMm': 'အော့ဖ်လိုင်း ဆက်သွယ်ရေးပြတ်တောက်မှု ကာကွယ်ရေး',
        'items': [
          {
            'screen': Screen.offlinePayment,
            'nameEn': 'Offline NFC & Bluetooth Mesh',
            'nameMm': 'အော့ဖ်လိုင်း NFC / ဘလူးတုသ် ငွေပေးချေမှု',
            'descEn': 'Tap-to-pay & BLE mesh during blackout',
            'descMm': 'အင်တာနက်မရှိဘဲ NFC ဖြင့် ထိ၍ ငွေပေးချေပါ',
            'icon': Icons.contactless_rounded,
            'color': const Color(0xFF0284C7),
          },
        ],
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Shared Header matching iOS ScreenHeader
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 12),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lang == 'ak' ? 'ဘဏ္ဍာရေး ဝန်ဆောင်မှုများ' : 'All Financial Services',
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                      color: Color(0xFF111827),
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Péthar Platform Directory',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFFD97706),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 110),
                itemCount: categories.length,
                itemBuilder: (context, catIdx) {
                  final cat = categories[catIdx];
                  final items = cat['items'] as List<Map<String, dynamic>>;

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: EdgeInsets.only(left: 4, bottom: 8, top: catIdx == 0 ? 0 : 14),
                        child: Text(
                          (lang == 'ak' ? cat['titleMm'] : cat['titleEn']) as String,
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.6,
                            fontFamily: 'monospace',
                            color: Color(0xFF6B7280),
                          ),
                        ),
                      ),
                      ...items.map((item) {
                        final name = (lang == 'ak' ? item['nameMm'] : item['nameEn']) as String;
                        final color = item['color'] as Color;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.02),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            borderRadius: BorderRadius.circular(18),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(18),
                              onTap: () {
                                final screen = item['screen'] as Screen;
                                if (!appState.isVerified) {
                                  showVerificationRequiredDialog(context, appState, name);
                                  return;
                                }
                                appState.navigate(screen);
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(13),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 42,
                                      height: 42,
                                      decoration: BoxDecoration(
                                        color: color.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                      child: Icon(
                                        item['icon'] as IconData,
                                        color: color,
                                        size: 20,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            name,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w700,
                                              fontSize: 13,
                                              color: Color(0xFF111827),
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            (lang == 'ak' ? item['descMm'] : item['descEn']) as String,
                                            style: const TextStyle(
                                              fontSize: 10.5,
                                              color: Color(0xFF9CA3AF),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const Icon(
                                      Icons.chevron_right_rounded,
                                      color: Color(0xFF6B7280),
                                      size: 18,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      }),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
