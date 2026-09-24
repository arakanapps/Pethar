import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import '../models/data.dart';
import '../widgets/arakan_emblem.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _bannerVisible = true;

  void _showLogoutDialog(BuildContext context, AppState appState) {
    final lang = appState.language;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: const Color(0xFF101724),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: crimson.withOpacity(0.2),
                shape: BoxShape.circle,
                border: Border.all(color: crimson.withOpacity(0.4)),
              ),
              child: const Icon(Icons.logout, color: Colors.redAccent, size: 24),
            ),
            const SizedBox(height: 16),
            Text(
              lang == 'arak' ? 'အကောင့်မှ ထွက်မည်လား?' : 'Log out of PeThar?',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(
              lang == 'arak'
                  ? 'လုံခြုံရေးအရ သင်၏ စက်တွင်း session အား ပိတ်သိမ်းပါမည်။'
                  : 'Your active session will be ended securely.',
              style: TextStyle(fontSize: 12, color: Colors.grey[400]),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white70,
                      side: const BorderSide(color: Colors.white24),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(lang == 'arak' ? 'မထွက်ပါ' : 'Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(lang == 'arak' ? 'အကောင့်ထွက်ပြီးပါပြီ' : 'Logged out securely'),
                          backgroundColor: crimson,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: crimson,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(lang == 'arak' ? 'ထွက်မည်' : 'Log Out'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    final quickServices = [
      {
        'id': Screen.send,
        'label': lang == 'arak' ? 'ငွေလွှဲ' : 'Transfer',
        'icon': Icons.arrow_outward,
        'color': Colors.blue.withOpacity(0.2),
        'iconColor': Colors.blueAccent,
      },
      {
        'id': Screen.intl,
        'label': lang == 'arak' ? 'ငွေဖြည့်' : 'Top Up',
        'icon': Icons.add,
        'color': Colors.amber.withOpacity(0.2),
        'iconColor': gold,
      },
      {
        'id': Screen.pos,
        'label': lang == 'arak' ? 'ဘေလ်ဆောင်' : 'Pay Bills',
        'icon': Icons.receipt,
        'color': Colors.red.withOpacity(0.2),
        'iconColor': Colors.redAccent,
      },
      {
        'id': Screen.cashout,
        'label': lang == 'arak' ? 'ငွေသားထုတ်' : 'Cash Out',
        'icon': Icons.store,
        'color': emeraldSuccess.withOpacity(0.2),
        'iconColor': emeraldSuccess,
      },
      {
        'id': Screen.crypto,
        'label': lang == 'arak' ? 'ဒင်္ဂါးဘဏ္ဍာ' : 'Crypto Vault',
        'icon': Icons.currency_bitcoin,
        'color': Colors.purple.withOpacity(0.2),
        'iconColor': Colors.purpleAccent,
      },
      {
        'id': Screen.account,
        'label': lang == 'arak' ? 'ငွေစာရင်း' : 'Account',
        'icon': Icons.account_balance_wallet,
        'color': Colors.cyan.withOpacity(0.2),
        'iconColor': Colors.cyanAccent,
      },
      {
        'id': Screen.pos,
        'label': lang == 'arak' ? 'ကုန်သည် POS' : 'Merchant POS',
        'icon': Icons.point_of_sale,
        'color': Colors.orange.withOpacity(0.2),
        'iconColor': Colors.orangeAccent,
      },
      {
        'id': Screen.receive,
        'label': lang == 'arak' ? 'မိမိ QR' : 'My QR',
        'icon': Icons.qr_code,
        'color': Colors.pink.withOpacity(0.2),
        'iconColor': Colors.pinkAccent,
      },
    ];

    return Scaffold(
      backgroundColor: isDark ? obsidian : paper,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // ── TOP HEADER CARD (Krungthai NEXT Style with Rounded Bottom) ──
            Container(
              padding: const EdgeInsets.only(top: 45, bottom: 24, left: 20, right: 20),
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
                gradient: isDark
                    ? const LinearGradient(
                        colors: [Color(0xFF2A080C), Color(0xFF1A0A10), Color(0xFF0E1522)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      )
                    : const LinearGradient(
                        colors: [Color(0xFF7A1020), Color(0xFFA31220), Color(0xFFC2252F)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                boxShadow: const [
                  BoxShadow(color: Colors.black45, blurRadius: 16, offset: Offset(0, 6)),
                ],
              ),
              child: Column(
                children: [
                  // Top bar: Avatar, Emblem, Bell & Logout
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Avatar
                      GestureDetector(
                        onTap: () => appState.navigate(Screen.settings),
                        child: Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: gold.withOpacity(0.8), width: 2),
                          ),
                          child: ClipOval(
                            child: Image.network(
                              appState.profile.avatarUrl ?? '',
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Icon(Icons.person, color: gold),
                            ),
                          ),
                        ),
                      ),
                      // Center Emblem
                      const ArakanEmblem(size: 38),
                      // Actions: Notification & Logout
                      Row(
                        children: [
                          Stack(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.notifications_outlined, color: Colors.white, size: 22),
                                onPressed: () => appState.navigate(Screen.notifications),
                              ),
                              if (appState.unreadNotificationsCount > 0)
                                Positioned(
                                  top: 8,
                                  right: 8,
                                  child: Container(
                                    padding: const EdgeInsets.all(3),
                                    decoration: const BoxDecoration(
                                      color: Colors.redAccent,
                                      shape: BoxShape.circle,
                                    ),
                                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                                    child: Center(
                                      child: Text(
                                        '${appState.unreadNotificationsCount}',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          IconButton(
                            icon: const Icon(Icons.logout, color: Colors.white70, size: 20),
                            onPressed: () => _showLogoutDialog(context, appState),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // Available Balance Display
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        lang == 'arak' ? appState.wallet.labelMm : appState.wallet.labelEn,
                        style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 11),
                      ),
                      const SizedBox(width: 6),
                      GestureDetector(
                        onTap: () => appState.toggleBalance(),
                        child: Icon(
                          appState.balanceHidden ? Icons.visibility_off : Icons.visibility,
                          color: Colors.white70,
                          size: 15,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      const Text(
                        '₳ ',
                        style: TextStyle(color: gold, fontSize: 26, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        appState.balanceHidden
                            ? '• • • • • •'
                            : appState.wallet.balance.toStringAsFixed(2),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          fontFamily: 'monospace',
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        appState.wallet.code,
                        style: TextStyle(color: gold.withOpacity(0.9), fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),

                  // Total Balance Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '${lang == 'arak' ? appState.wallet.totalLabelMm : appState.wallet.totalLabelEn}: ',
                        style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 11),
                      ),
                      Text(
                        appState.balanceHidden
                            ? '• • • •'
                            : '₳ ${appState.wallet.totalBalance.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: goldLight,
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        ),
                      ),
                      if (!appState.balanceHidden && appState.wallet.pendingBalance > 0) ...[
                        const SizedBox(width: 4),
                        Text(
                          '(${lang == 'arak' ? 'စောင့်ဆိုင်းဆဲ' : 'incl. pending'} ₳ ${appState.wallet.pendingBalance.toStringAsFixed(2)})',
                          style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 10),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),

            // ── Announcement Banner ──────────────────────────────────────
            if (_bannerVisible)
              Container(
                margin: const EdgeInsets.only(left: 16, right: 16, top: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? gold.withOpacity(0.12) : const Color(0xFFFFFBEB),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: gold.withOpacity(0.35)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.auto_awesome, color: gold, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            lang == 'arak' ? 'အာရက္ခဗဟိုဘဏ် အသိပေးချက်' : 'Bank of Arakan Notice',
                            style: const TextStyle(
                              color: gold,
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            lang == 'arak'
                                ? 'စက်တင်ဘာ ၂၄ ရက် နံနက် ၀၁:၀၀-၀၆:၀၀ တွင် စာရင်းစနစ် အဆင့်မြှင့်ပါမည်။ အော့ဖ်လိုင်းဘောက်ချာများ အသုံးပြုနိုင်ပါသည်။'
                                : 'PeThar will undergo an Arakan ledger upgrade on 24 Sep 2026. Offline vouchers remain active.',
                            style: TextStyle(
                              color: isDark ? Colors.white70 : Colors.black87,
                              fontSize: 10,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () => setState(() => _bannerVisible = false),
                      child: const Icon(Icons.close, size: 16, color: Colors.grey),
                    ),
                  ],
                ),
              ),

            // ── 8 Quick Services Grid ─────────────────────────────────────
            Padding(
              padding: const EdgeInsets.all(16),
              child: GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 4,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.9,
                ),
                itemCount: quickServices.length,
                itemBuilder: (ctx, idx) {
                  final qs = quickServices[idx];
                  return InkWell(
                    borderRadius: BorderRadius.circular(18),
                    onTap: () {
                      final screen = qs['id'] as Screen;
                      appState.navigate(screen);
                    },
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: qs['color'] as Color,
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 4),
                            ],
                          ),
                          child: Icon(
                            qs['icon'] as IconData,
                            color: qs['iconColor'] as Color,
                            size: 22,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          qs['label'] as String,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white70 : Colors.black87,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // ── Favorites Row ─────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        lang == 'arak' ? 'စိတ်ကြိုက် လွှဲသူများ' : 'Favorites',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                      GestureDetector(
                        onTap: () => appState.navigate(Screen.send),
                        child: Text(
                          lang == 'arak' ? 'အားလုံး' : 'View all',
                          style: const TextStyle(color: gold, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 84,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        ...favoriteContacts.map((fav) {
                          return GestureDetector(
                            onTap: () => appState.navigate(Screen.send),
                            child: Container(
                              margin: const EdgeInsets.only(right: 14),
                              child: Column(
                                children: [
                                  Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(
                                      color: Color(fav.colorValue),
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: isDark ? surfaceCard : Colors.white,
                                        width: 2,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Color(fav.colorValue).withOpacity(0.35),
                                          blurRadius: 6,
                                          offset: const Offset(0, 3),
                                        ),
                                      ],
                                    ),
                                    child: Center(
                                      child: Text(
                                        fav.initials,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  SizedBox(
                                    width: 60,
                                    child: Text(
                                      lang == 'arak' ? fav.mm : fav.name,
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600,
                                        color: isDark ? Colors.white70 : Colors.black87,
                                      ),
                                      textAlign: TextAlign.center,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),
                        // Add Favorite Button
                        GestureDetector(
                          onTap: () => appState.navigate(Screen.send),
                          child: Column(
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: isDark ? Colors.white.withOpacity(0.06) : Colors.grey[200],
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white24, style: BorderStyle.solid),
                                ),
                                child: const Icon(Icons.add, color: gold, size: 22),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Add',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ── Recent Ledger Postings ────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    TranslationStrings.tr('recentTransactions', lang),
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 10),
                  ...appState.txList.take(5).map((t) {
                    final isNegative = t.amount < 0;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark ? surfaceCard : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: isDark ? Colors.white.withOpacity(0.04) : Colors.grey[200]!),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: (isNegative ? crimson : emeraldSuccess).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              isNegative ? Icons.arrow_outward : Icons.arrow_downward,
                              color: isNegative ? crimson : emeraldSuccess,
                              size: 18,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  lang == 'arak' ? t.titleMm : t.title,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                    color: isDark ? Colors.white : Colors.black87,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  t.time,
                                  style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${isNegative ? '-' : '+'} ₳ ${t.amount.abs().toStringAsFixed(2)}',
                            style: TextStyle(
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                              color: isNegative ? Colors.redAccent : emeraldSuccess,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}
