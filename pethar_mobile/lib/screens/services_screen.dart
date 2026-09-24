import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';

class ServicesScreen extends StatelessWidget {
  const ServicesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    final categories = [
      {
        'titleEn': 'Money Movement & Cash',
        'titleMm': 'ငွေလွှဲနှင့် ငွေသားဝန်ဆောင်မှုများ',
        'items': [
          {
            'screen': Screen.send,
            'nameEn': 'P2P Transfer',
            'nameMm': 'ဖေ့သာအချင်းချင်း ငွေလွှဲ',
            'descEn': 'Instant 0-fee domestic transfers',
            'descMm': 'အခမဲ့ ချက်ချင်း ပြည်တွင်းငွေလွှဲ',
            'icon': Icons.arrow_outward,
            'color': Colors.blueAccent,
          },
          {
            'screen': Screen.cashout,
            'nameEn': 'Agent Cash-Out',
            'nameMm': 'အေးဂျင့်မှ ငွေသားထုတ်ယူ',
            'descEn': 'Physical cash at Sittwe, Mrauk-U, Kyaukpyu',
            'descMm': 'စစ်တွေ၊ မြောက်ဦး၊ ကျောက်ဖြူ ငွေသားထုတ်ယူ',
            'icon': Icons.storefront,
            'color': emeraldSuccess,
          },
          {
            'screen': Screen.receive,
            'nameEn': 'My ArakanPay QR',
            'nameMm': 'မိမိ QR ဖြင့် ငွေလက်ခံ',
            'descEn': 'Personal and merchant receiving code',
            'descMm': 'မိမိ၏ ငွေလက်ခံ QR ကုဒ်',
            'icon': Icons.qr_code,
            'color': gold,
          },
        ],
      },
      {
        'titleEn': 'Global Banking & Remittance',
        'titleMm': 'နိုင်ငံတကာငွေလွှဲနှင့် ဘဏ်လုပ်ငန်း',
        'items': [
          {
            'screen': Screen.intl,
            'nameEn': 'Wise Global Wire',
            'nameMm': 'Wise ပြည်ပငွေလွှဲ',
            'descEn': 'Thailand, Malaysia, Singapore, USA, Europe',
            'descMm': 'ထိုင်း၊ မလေး၊ စင်ကာပူ၊ အမေရိကန်',
            'icon': Icons.public,
            'color': Colors.cyanAccent,
          },
          {
            'screen': Screen.intl,
            'nameEn': 'Visa / Mastercard Top-Up',
            'nameMm': 'နိုင်ငံတကာကတ်ဖြင့် ငွေသွင်း',
            'descEn': 'Top up with Visa, Master, AMEX, PayPal',
            'descMm': 'Visa, Master, AMEX ဖြင့် ငွေသွင်းရန်',
            'icon': Icons.credit_card,
            'color': Colors.redAccent,
          },
        ],
      },
      {
        'titleEn': 'Digital Assets & Arakan Retail',
        'titleMm': 'ဒစ်ဂျစ်တယ်ဒင်္ဂါးနှင့် အရောင်းစနစ်',
        'items': [
          {
            'screen': Screen.crypto,
            'nameEn': 'Binance & MEXC Bridge',
            'nameMm': 'Binance / MEXC ချိတ်ဆက်မှု',
            'descEn': 'Direct 0-fee crypto deposit and withdrawal',
            'descMm': 'အခမဲ့ USDT တိုက်ရိုက်သွင်း/ထုတ်',
            'icon': Icons.currency_bitcoin,
            'color': Colors.purpleAccent,
          },
          {
            'screen': Screen.crypto,
            'nameEn': 'Instant Swap',
            'nameMm': 'USDT မှ ချက်ချင်းလဲလှယ်',
            'descEn': '1:1 Guaranteed liquidity parity',
            'descMm': '၁:၁ တိကျသော လဲလှယ်နှုန်းထား',
            'icon': Icons.swap_horiz,
            'color': gold,
          },
          {
            'screen': Screen.pos,
            'nameEn': 'Merchant POS Terminal',
            'nameMm': 'ကုန်သည် POS အရောင်းစနစ်',
            'descEn': 'Register with dynamic QR and thermal receipt',
            'descMm': 'အရောင်းဆိုင်သုံး POS စနစ်',
            'icon': Icons.point_of_sale,
            'color': Colors.orangeAccent,
          },
        ],
      },
    ];

    return Scaffold(
      backgroundColor: isDark ? obsidian : paper,
      appBar: AppBar(
        title: Text(
          lang == 'arak' ? 'ဘဏ္ဍာရေး ဝန်ဆောင်မှုများ' : 'All Financial Services',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: isDark ? surfaceDark : Colors.white,
        elevation: 0,
        centerTitle: false,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: categories.length,
        itemBuilder: (context, catIdx) {
          final cat = categories[catIdx];
          final items = cat['items'] as List<Map<String, dynamic>>;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(left: 4, bottom: 10, top: catIdx == 0 ? 0 : 16),
                child: Text(
                  (lang == 'arak' ? cat['titleMm'] : cat['titleEn']) as String,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                    color: gold,
                  ),
                ),
              ),
              ...items.map((item) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Material(
                    color: isDark ? surfaceCard : Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(18),
                      onTap: () {
                        final screen = item['screen'] as Screen;
                        appState.navigate(screen);
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: (item['color'] as Color).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Icon(
                                item['icon'] as IconData,
                                color: item['color'] as Color,
                                size: 22,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    (lang == 'arak' ? item['nameMm'] : item['nameEn']) as String,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      color: isDark ? Colors.white : Colors.black87,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    (lang == 'arak' ? item['descMm'] : item['descEn']) as String,
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.grey[500],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Icon(
                              Icons.chevron_right,
                              color: Colors.grey[600],
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
    );
  }
}
