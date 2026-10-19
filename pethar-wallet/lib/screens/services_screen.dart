import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({Key? key}) : super(key: key);

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final lang = appState.language;
    final isAk = lang == 'ak';

    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // ── Top Bar Header (Centered "Product & Service") ──
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
              ),
              child: Center(
                child: Text(
                  isAk ? 'ထုတ်ကုန်နှင့် ဝန်ဆောင်မှု' : 'Product & Service',
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 17,
                    color: Color(0xFF111827),
                    letterSpacing: -0.2,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),

            // ── Product & Service List (All Features Coming Soon) ──
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
                children: [
                  // 1. Agent Cash-Out (Coming Soon - Don't open page)
                  _buildProductCard(
                    context: context,
                    isAk: isAk,
                    icon: Icons.storefront_rounded,
                    color: const Color(0xFF059669),
                    title: isAk ? 'အေးဂျင့်မှ ငွေသားထုတ်ယူ' : 'Agent Cash-Out',
                    desc: null,
                  ),

                  // 2. Offline Pay (Coming Soon - Don't open page)
                  _buildProductCard(
                    context: context,
                    isAk: isAk,
                    icon: Icons.contactless_rounded,
                    color: const Color(0xFF0D9488),
                    title: isAk ? 'အော့ဖ်လိုင်း ငွေပေးချေမှု' : 'Offline Pay',
                    desc: isAk
                        ? 'အင်တာနက်မရှိဘဲ တိုက်ရိုက်ထိ၍ ငွေပေးချေပါ'
                        : 'Offline tap & mesh pay without internet',
                  ),

                  // 3. Gift Card (Coming Soon - Don't open page)
                  _buildProductCard(
                    context: context,
                    isAk: isAk,
                    icon: Icons.card_giftcard_rounded,
                    color: const Color(0xFF7C3AED),
                    title: isAk ? 'လက်ဆောင်ကတ်များ' : 'Gift Card',
                    desc: isAk
                        ? 'ဂိမ်း၊ iTunes၊ Viber Plus နှင့် ဒစ်ဂျစ်တယ်ကတ်များ ဖြည့်ရန်'
                        : 'Top up games, iTunes, Viber Plus & digital cards',
                  ),

                  // 4. Mini Apps (Coming Soon - Don't open page)
                  _buildProductCard(
                    context: context,
                    isAk: isAk,
                    icon: Icons.apps_rounded,
                    color: const Color(0xFF2563EB),
                    title: isAk ? 'မိတ်ဖက် မီနီအက်ပ်များ' : 'Mini Apps',
                    desc: isAk
                        ? 'မိတ်ဖက်ကုမ္ပဏီများအတွက် အက်ပ်ဖန်တီးနိုင်သော ပလက်ဖောင်း'
                        : 'Partner platform for companies to create apps',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductCard({
    required BuildContext context,
    required bool isAk,
    required IconData icon,
    required Color color,
    required String title,
    String? desc,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.025),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            ScaffoldMessenger.of(context).hideCurrentSnackBar();
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.info_outline_rounded, color: Color(0xFFFBBF24), size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        isAk
                            ? '$title - မကြာမီ လာမည်ဖြစ်ပါသည်'
                            : '$title is Coming Soon...',
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                    ),
                  ],
                ),
                backgroundColor: const Color(0xFF1E293B),
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                duration: const Duration(seconds: 2),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(13),
                  ),
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: desc == null
                      ? Row(
                          children: [
                            Expanded(
                              child: Text(
                                title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14.5,
                                  color: Color(0xFF1E293B),
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF3C7),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: const Color(0xFFFDE68A)),
                              ),
                              child: Text(
                                isAk ? 'မကြာမီ' : 'Coming Soon',
                                style: const TextStyle(
                                  color: Color(0xFFB45309),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        )
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    title,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14,
                                      color: Color(0xFF1E293B),
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFEF3C7),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFFFDE68A)),
                                  ),
                                  child: Text(
                                    isAk ? 'မကြာမီ' : 'Coming Soon',
                                    style: const TextStyle(
                                      color: Color(0xFFB45309),
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              desc,
                              style: const TextStyle(
                                fontSize: 11.5,
                                color: Color(0xFF94A3B8),
                                height: 1.3,
                              ),
                            ),
                          ],
                        ),
                ),
                const SizedBox(width: 8),
                const Icon(
                  Icons.chevron_right_rounded,
                  color: Color(0xFFCBD5E1),
                  size: 20,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
