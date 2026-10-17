import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import '../widgets/arakan_emblem.dart';
import 'home_screen.dart';
import 'account_screen.dart';
import 'scan_screen.dart';
import 'services_screen.dart';
import 'settings_screen.dart';
import 'send_screen.dart';
import 'receive_screen.dart';
import 'cashout_screen.dart';
import 'notifications_screen.dart';
import 'intl_screen.dart';
import 'crypto_screen.dart';
import 'offline_payment_screen.dart';
import 'pos_terminal_screen.dart';
import 'desktop_portal_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({Key? key}) : super(key: key);

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  bool _showSplash = true;
  int _walletSubTab = 0; // 0: Tokens (No NFT), 1: Activity (History), 2: Refund

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1400), () {
      if (mounted) {
        setState(() => _showSplash = false);
      }
    });
  }

  void _showSecurityRecoveryPhraseSheet(BuildContext context, bool isAk) {
    const recoveryWords = [
      'sovereign', 'arakan', 'crimson', 'harbor',
      'shield', 'ledger', 'velvet', 'anchor',
      'crystal', 'beacon', 'meadow', 'fortune',
    ];
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 36),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isAk ? 'လုံခြုံရေးနှင့် လျှို့ဝှက်စကားစု' : 'Security & Privacy (Secret Recovery Phrase)',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.black87),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(ctx),
                  icon: const Icon(Icons.close, color: Colors.black54),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              isAk
                  ? 'ဤစကားလုံး ၁၂ လုံးသည် သင်၏ USD Account ၏ မာစတာသော့ချက်ဖြစ်သည်။ မည်သူ့ကိုမျှ မမျှဝေပါနှင့်။'
                  : 'Your 12-word Secret Recovery Phrase grants full access to your USD Account. Never share it with anyone.',
              style: const TextStyle(fontSize: 12, color: Colors.black54),
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: List.generate(recoveryWords.length, (i) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.black12),
                  ),
                  child: Text(
                    '${i + 1}. ${recoveryWords[i]}',
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSplashScreen() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => setState(() => _showSplash = false),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const SizedBox(height: 48),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(
                  width: 108,
                  height: 108,
                  child: Center(child: ArakanEmblem(size: 88)),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Text(
                      'péthar',
                      style: TextStyle(
                        color: crimson,
                        fontSize: 34,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.8,
                      ),
                    ),
                    SizedBox(width: 2),
                    Text(
                      'wallet',
                      style: TextStyle(
                        color: Color(0xFF18181B),
                        fontSize: 34,
                        fontWeight: FontWeight.w300,
                        letterSpacing: -0.8,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFF1E3A8A), width: 1.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'AK Pay',
                        style: TextStyle(
                          color: Color(0xFF1E3A8A),
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Text(
                      'VISA',
                      style: TextStyle(
                        color: Color(0xFF1434CB),
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Text(
                      'USDT | USDC | USD1',
                      style: TextStyle(
                        color: Color(0xFF00A0E9),
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Container(
                  width: 120,
                  height: 5,
                  decoration: BoxDecoration(
                    color: Colors.black87,
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  height: 8,
                  color: crimson,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSingleAccountUsdCryptoWallet(BuildContext context, AppState appState, String lang) {
    final isAk = lang == 'ak';
    final usdTokens = [
      {'symbol': 'USDT', 'name': 'Tether USD', 'price': '\$0.9985', 'balance': '12,500 USDT', 'usd': '\$12,500.00', 'color': const Color(0xFF26A17B), 'badge': '₮'},
      {'symbol': 'USDC', 'name': 'USD Coin', 'price': '\$1.00', 'balance': '0 USDC', 'usd': '\$0.00', 'color': const Color(0xFF2775CA), 'badge': '\$'},
      {'symbol': 'USD1', 'name': 'World Liberty USD1', 'price': '\$0.999', 'balance': '0 USD1', 'usd': '\$0.00', 'color': const Color(0xFFD4AF37), 'badge': '1'},
      {'symbol': 'FDUSD', 'name': 'First Digital USD', 'price': '\$1.00', 'balance': '0 FDUSD', 'usd': '\$0.00', 'color': const Color(0xFF00C389), 'badge': 'F'},
      {'symbol': 'PYUSD', 'name': 'PayPal USD', 'price': '\$1.00', 'balance': '0 PYUSD', 'usd': '\$0.00', 'color': const Color(0xFF003087), 'badge': 'P'},
      {'symbol': 'DAI', 'name': 'Multi-Collateral DAI', 'price': '\$1.00', 'balance': '0 DAI', 'usd': '\$0.00', 'color': const Color(0xFFF5AC37), 'badge': '◈'},
    ];

    void guardVerified(String feature, VoidCallback action) {
      if (!appState.isVerified) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isAk
                  ? 'သင်၏အကောင့်သည် Unverified ဖြစ်နေပါသည်။ "$feature" သုံးရန် အတည်ပြုပေးပါ။'
                  : 'Your account is Unverified. Please verify your identity on Home to use $feature.',
            ),
            backgroundColor: crimson,
            behavior: SnackBarBehavior.floating,
          ),
        );
        return;
      }
      action();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 100),
          children: [
            // Top Bar: Clean Péthar Logo Only on Left (No Bell, No Live Chat, No Black Box on Logo)
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: const [
                SizedBox(
                  width: 40,
                  height: 40,
                  child: Center(child: ArakanEmblem(size: 36)),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // USD Account Header Row:
            // - Left: USD symbol ($) + "USD Account" (dropped "USD-Backed" text)
            // - Right: ONLY Refresh button & Setting button (for Security & Privacy with Secret Recovery Phrase)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    CircleAvatar(
                      radius: 15,
                      backgroundColor: crimson,
                      child: Text('\$', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14)),
                    ),
                    SizedBox(width: 8),
                    Text('USD Account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.black87)),
                  ],
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: () => setState(() {}),
                      icon: const Icon(Icons.refresh_rounded, color: Colors.black87, size: 20),
                    ),
                    IconButton(
                      onPressed: () => guardVerified(
                        'Security & Secret Recovery Phrase',
                        () => _showSecurityRecoveryPhraseSheet(context, isAk),
                      ),
                      icon: const Icon(Icons.settings_outlined, color: Colors.black87, size: 20),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Main USD Account Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 24, offset: const Offset(0, 8)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Text('0x36...5f19', style: TextStyle(fontFamily: 'monospace', fontSize: 13, color: Colors.black54)),
                      SizedBox(width: 6),
                      Icon(Icons.copy_rounded, size: 15, color: Colors.black45),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Text(
                        appState.balanceHidden ? '••••••' : '\$12,500.00',
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, fontFamily: 'monospace', color: Colors.black),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => appState.toggleBalance(),
                        child: Icon(
                          appState.balanceHidden ? Icons.visibility_off : Icons.visibility,
                          size: 18,
                          color: Colors.black45,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  // 4 Functions Below Amount: Receive | Send | Convert | Transfer
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildWalletAction(
                        label: isAk ? 'လက်ခံရန်' : 'Receive',
                        icon: Icons.arrow_downward_rounded,
                        onTap: () => guardVerified('Receive', () => appState.navigate(Screen.receive)),
                      ),
                      _buildWalletAction(
                        label: isAk ? 'ပေးပို့ရန်' : 'Send',
                        icon: Icons.arrow_upward_rounded,
                        onTap: () => guardVerified('Send', () => appState.navigate(Screen.send)),
                      ),
                      _buildWalletAction(
                        label: isAk ? 'လဲလှယ်ရန်' : 'Convert',
                        icon: Icons.autorenew_rounded,
                        onTap: () => guardVerified('Convert', () => appState.navigate(Screen.crypto)),
                      ),
                      _buildWalletAction(
                        label: isAk ? 'လွှဲပြောင်း' : 'Transfer',
                        icon: Icons.swap_horiz_rounded,
                        onTap: () => guardVerified('Transfer', () => appState.navigate(Screen.send)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Sub-Tabs: Tokens | Activity | Refund (Strictly NO NFT tab!)
            Row(
              children: [
                _buildSubTab('Tokens', 0),
                const SizedBox(width: 24),
                _buildSubTab('Activity', 1),
                const SizedBox(width: 24),
                _buildSubTab('Refund', 2),
              ],
            ),
            const Divider(height: 1),
            const SizedBox(height: 12),

            if (_walletSubTab == 0)
              ...usdTokens.map((t) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: t['color'] as Color,
                            child: Text(
                              t['badge'] as String,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(t['symbol'] as String, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.black87)),
                              const SizedBox(height: 2),
                              Text('${t['price']} · ${t['name']}', style: const TextStyle(fontSize: 12, color: Colors.black45)),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(t['balance'] as String, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.black87)),
                          const SizedBox(height: 2),
                          Text(t['usd'] as String, style: const TextStyle(fontSize: 12, color: Colors.black45)),
                        ],
                      ),
                    ],
                  ),
                );
              })
            else if (_walletSubTab == 1)
              ...appState.txList.map((tx) {
                final isPos = tx.amount > 0;
                return ListTile(
                  tileColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  title: Text(isAk ? tx.titleMm : tx.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87)),
                  subtitle: Text(tx.time, style: const TextStyle(fontSize: 11, color: Colors.black45)),
                  trailing: Text(
                    '${isPos ? '+' : '-'}\$${tx.amount.abs().toStringAsFixed(2)}',
                    style: TextStyle(fontWeight: FontWeight.w800, color: isPos ? emeraldSuccess : Colors.black87),
                  ),
                );
              })
            else
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 40),
                child: Center(
                  child: Text('No pending USD stablecoin refunds', style: TextStyle(color: Colors.black45, fontSize: 12)),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildWalletAction({required String label, required IconData icon, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: const Color(0xFFFFF1F2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: crimson, size: 20),
          ),
          const SizedBox(height: 6),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87)),
        ],
      ),
    );
  }

  Widget _buildSubTab(String title, int index) {
    final active = _walletSubTab == index;
    return GestureDetector(
      onTap: () => setState(() => _walletSubTab = index),
      child: Container(
        padding: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(color: active ? crimson : Colors.transparent, width: 2.5),
          ),
        ),
        child: Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: active ? crimson : Colors.black54,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_showSplash) {
      return _buildSplashScreen();
    }

    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    // Sub-screens routing
    if (appState.currentScreen == Screen.desktop) return const DesktopPortalScreen();
    if (appState.currentScreen == Screen.pos) return const PosTerminalScreen();
    if (appState.currentScreen == Screen.send) return const SendScreen();
    if (appState.currentScreen == Screen.receive) return const ReceiveScreen();
    if (appState.currentScreen == Screen.cashout) return const CashOutScreen();
    if (appState.currentScreen == Screen.intl) return const IntlScreen();
    if (appState.currentScreen == Screen.crypto) return const CryptoScreen();
    if (appState.currentScreen == Screen.offlinePayment) return const OfflinePaymentScreen();
    if (appState.currentScreen == Screen.scan) return const ScanScreen();

    int currentIndex = 0;
    switch (appState.currentScreen) {
      case Screen.home:
        currentIndex = 0;
        break;
      case Screen.notifications:
        currentIndex = 1;
        break;
      case Screen.scan:
        currentIndex = 2;
        break;
      case Screen.services:
        currentIndex = 3;
        break;
      case Screen.settings:
      case Screen.account:
        currentIndex = 4;
        break;
      default:
        currentIndex = 0;
    }

    Widget body;
    switch (currentIndex) {
      case 0:
        body = const HomeScreen();
        break;
      case 1:
        body = _buildSingleAccountUsdCryptoWallet(context, appState, lang);
        break;
      case 3:
        body = const ServicesScreen();
        break;
      case 4:
        body = appState.currentScreen == Screen.account
            ? const AccountScreen()
            : const SettingsScreen();
        break;
      default:
        body = const HomeScreen();
    }

    return Scaffold(
      extendBody: true,
      body: body,
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
              child: Container(
                height: 68,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF121620).withValues(alpha: 0.82)
                      : Colors.white.withValues(alpha: 0.84),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.16)
                        : Colors.white.withValues(alpha: 0.92),
                    width: 1.2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: isDark
                          ? Colors.black.withValues(alpha: 0.65)
                          : const Color(0xFF0F172A).withValues(alpha: 0.14),
                      blurRadius: 30,
                      offset: const Offset(0, 12),
                    ),
                    BoxShadow(
                      color: crimson.withValues(alpha: isDark ? 0.16 : 0.08),
                      blurRadius: 18,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // 1. Home
                    Expanded(
                      child: _buildLiquidGlassNavItem(
                        context: context,
                        icon: currentIndex == 0 ? Icons.home_rounded : Icons.home_outlined,
                        label: TranslationStrings.tr('navHome', lang),
                        target: Screen.home,
                        isSelected: currentIndex == 0,
                        isDark: isDark,
                      ),
                    ),
                    // 2. Financial (USD Account)
                    Expanded(
                      child: _buildLiquidGlassNavItem(
                        context: context,
                        icon: Icons.attach_money_rounded,
                        label: lang == 'ak' ? 'ဘဏ္ဍာရေး' : 'Financial',
                        target: Screen.notifications,
                        isSelected: currentIndex == 1,
                        isDark: isDark,
                      ),
                    ),
                    // 3. Center Red Scan Button
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: GestureDetector(
                        onTap: () => appState.navigate(Screen.scan),
                        child: Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(
                              colors: [
                                Color(0xFFFF2A38),
                                crimson,
                                Color(0xFFB00E1A),
                              ],
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                            ),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.4),
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: crimson.withValues(alpha: 0.55),
                                blurRadius: 20,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.qr_code_scanner_rounded,
                            color: Colors.white,
                            size: 26,
                          ),
                        ),
                      ),
                    ),
                    // 4. Services
                    Expanded(
                      child: _buildLiquidGlassNavItem(
                        context: context,
                        icon: currentIndex == 3 ? Icons.grid_view_rounded : Icons.grid_view_outlined,
                        label: TranslationStrings.tr('navServices', lang),
                        target: Screen.services,
                        isSelected: currentIndex == 3,
                        isDark: isDark,
                      ),
                    ),
                    // 5. Account
                    Expanded(
                      child: _buildLiquidGlassNavItem(
                        context: context,
                        icon: currentIndex == 4 ? Icons.person_rounded : Icons.person_outline_rounded,
                        label: lang == 'ak' ? 'အကောင့်' : 'Account',
                        target: Screen.settings,
                        isSelected: currentIndex == 4,
                        isDark: isDark,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLiquidGlassNavItem({
    required BuildContext context,
    required IconData icon,
    required String label,
    required Screen target,
    required bool isSelected,
    required bool isDark,
  }) {
    final activeRed = isDark ? const Color(0xFFFF3B47) : crimson;
    final inactiveColor = isDark ? const Color(0xFFD4D4D8) : const Color(0xFF27272A);
    final color = isSelected ? activeRed : inactiveColor;

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        Provider.of<AppState>(context, listen: false).navigate(target);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 54,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          gradient: isSelected
              ? LinearGradient(
                  colors: [
                    crimson.withValues(alpha: isDark ? 0.26 : 0.15),
                    crimson.withValues(alpha: isDark ? 0.10 : 0.06),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                )
              : null,
          border: isSelected
              ? Border.all(
                  color: crimson.withValues(alpha: isDark ? 0.38 : 0.22),
                  width: 1,
                )
              : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 2),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: color,
                fontSize: 10.5,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
