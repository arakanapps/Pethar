import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../app_state.dart';
import '../theme.dart';

/// Web3 USD Wallet Screen matching TrueMoney reference design
/// Replaces THBT with USD, and THB with AKD.
/// Strictly uses blue / slate fintech palette (no orange).
class WalletScreen extends StatefulWidget {
  final VoidCallback? onBack;

  const WalletScreen({Key? key, this.onBack}) : super(key: key);

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  int _activeTab = 0; // 0: Tokens, 1: History
  int _carouselIndex = 0;
  final PageController _pageController = PageController();
  bool _copied = false;

  // Controllers for sub-views
  final TextEditingController _issueAmountCtrl = TextEditingController();
  final TextEditingController _withdrawAmountCtrl = TextEditingController();
  final TextEditingController _sendAddressCtrl = TextEditingController();
  final TextEditingController _sendAmountCtrl = TextEditingController();
  final TextEditingController _swapSendAmountCtrl = TextEditingController();
  final TextEditingController _customNameCtrl = TextEditingController();

  String _selectedNetwork = 'Base';
  String _sendToken = 'USDT';
  String _swapFromToken = 'USDT';
  String _swapToToken = 'USDC';
  double _slippage = 0.5;
  bool _agreedToSwapTerms = true;

  @override
  void initState() {
    super.initState();
    _issueAmountCtrl.text = '10.00';
    _withdrawAmountCtrl.text = '10.00';
    _sendAmountCtrl.text = '0.00';
    _swapSendAmountCtrl.text = '0.00';
  }

  @override
  void dispose() {
    _pageController.dispose();
    _issueAmountCtrl.dispose();
    _withdrawAmountCtrl.dispose();
    _sendAddressCtrl.dispose();
    _sendAmountCtrl.dispose();
    _swapSendAmountCtrl.dispose();
    _customNameCtrl.dispose();
    super.dispose();
  }

  void _copy(String text, String message) {
    Clipboard.setData(ClipboardData(text: text));
    setState(() => _copied = true);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: const Color(0xFF1E293B),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(milliseconds: 1800),
      ),
    );
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final lang = appState.language;
    final isAk = lang == 'ak';

    // Route between sub-views based on appState.financialSubView
    switch (appState.financialSubView) {
      case 'issue':
      case 'deposit':
        return _buildIssueScreen(context, appState, isAk);
      case 'withdraw':
        return _buildWithdrawScreen(context, appState, isAk);
      case 'send':
      case 'transfer':
        return _buildSendScreen(context, appState, isAk);
      case 'swap':
        return _buildSwapScreen(context, appState, isAk);
      case 'receive':
        return _buildReceiveScreen(context, appState, isAk);
      case 'mission':
        return _buildMissionScreen(context, appState, isAk);
      case 'wallet_security_phrase':
        return _buildSecurityPhraseScreen(context, appState, isAk);
      case 'processing':
        return _buildProcessingScreen(context, appState, isAk);
      default:
        return _buildDashboard(context, appState, isAk);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. DASHBOARD VIEW (Matching photo_2026-11-06_19-51-21.jpg)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildDashboard(BuildContext context, AppState appState, bool isAk) {
    final currencyFmt = NumberFormat('#,##0.00', 'en_US');
    final rawAddress = appState.effectiveUsdWalletAddress;
    final shortAddr = rawAddress.length > 12
        ? '${rawAddress.substring(0, 6)}...${rawAddress.substring(rawAddress.length - 4)}'
        : rawAddress;
    final usdBal = appState.usdAccountBalance +
        appState.cryptoWallet.usdtBalance +
        appState.cryptoWallet.usdcBalance;
    final akdEquivalent = usdBal * 1.0; // 1 USD = 1 AKD parity

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          // Custom App Bar & Hero Card
          SliverToBoxAdapter(
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                // Top Backdrop with Royal Blue Fintech Gradient (No Orange)
                Container(
                  padding: EdgeInsets.fromLTRB(
                    16,
                    MediaQuery.of(context).padding.top + 8,
                    16,
                    64,
                  ),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Color(0xFF1E3A8A), // Deep sapphire blue
                        Color(0xFF2563EB), // Payno blue
                        Color(0xFF3B82F6), // Vibrant blue
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(32),
                      bottomRight: Radius.circular(32),
                    ),
                  ),
                  child: Column(
                    children: [
                      // Header: Centered title without < and cross button
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Center(
                          child: Text(
                            isAk ? 'USD ပိုက်ဆံအိတ်' : 'USD Web3 Wallet',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 17,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.3,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Wallet Address pill + Receive button
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          GestureDetector(
                            onTap: () => _copy(rawAddress,
                                isAk ? 'လိပ်စာ ကူးယူပြီးပါပြီ' : 'Wallet address copied!'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.16),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.3),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  // Base Network Symbol
                                  _buildBaseNetworkBadge(size: 14),
                                  const SizedBox(width: 6),
                                  Text(
                                    shortAddr,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontFamily: 'monospace',
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Icon(
                                    _copied ? Icons.check : Icons.copy_rounded,
                                    color: Colors.white,
                                    size: 13,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          // QR Code Receive Action
                          GestureDetector(
                            onTap: () =>
                                appState.setFinancialSubView('receive'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.22),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.35),
                                  width: 1,
                                ),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.qr_code_rounded,
                                      color: Colors.white, size: 16),
                                  SizedBox(width: 5),
                                  Text(
                                    'Receive',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 12.5,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                    ],
                  ),
                ),

                // Floating Main Balance Card
                Positioned(
                  left: 16,
                  right: 16,
                  bottom: -48,
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0F172A).withValues(alpha: 0.08),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            // USD Coin Badge (Blue & Gold, NOT orange)
                            _buildUsdCoinIcon(size: 34),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                appState.walletBalanceHidden
                                    ? '••••••'
                                    : '${currencyFmt.format(usdBal)} USD',
                                style: const TextStyle(
                                  fontSize: 27,
                                  fontWeight: FontWeight.w900,
                                  fontFamily: 'monospace',
                                  color: Color(0xFF0F172A),
                                  letterSpacing: -0.6,
                                ),
                              ),
                            ),
                            GestureDetector(
                              onTap: () => appState.toggleWalletBalance(),
                              child: Icon(
                                appState.walletBalanceHidden
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                size: 20,
                                color: const Color(0xFF94A3B8),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Text(
                              appState.walletBalanceHidden
                                  ? 'portfolio value ≈ ••••'
                                  : 'portfolio value ≈ ${currencyFmt.format(akdEquivalent)} AKD',
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xFF64748B),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFF1F2),
                                borderRadius: BorderRadius.circular(999),
                                border: Border.all(color: const Color(0xFFFECDD3), width: 1),
                              ),
                              child: const Text(
                                '1.00 ₳ = \$1.00',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: crimson,
                                  letterSpacing: 0.2,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Space for floating card
          const SliverToBoxAdapter(child: SizedBox(height: 64)),

          // 4 Action Buttons: Issue | Withdraw | Send | Swap
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  _buildActionButton(
                    iconWidget: _buildCircledIcon(
                      Icons.south_west_rounded,
                      const Color(0xFF2563EB),
                      const Color(0xFFEFF6FF),
                    ),
                    label: isAk ? 'ထုတ်ယူရန်' : 'Issue',
                    onTap: () => appState.setFinancialSubView('issue'),
                  ),
                  const SizedBox(width: 10),
                  _buildActionButton(
                    iconWidget: _buildCircledIcon(
                      Icons.north_east_rounded,
                      const Color(0xFF0F172A),
                      const Color(0xFFF1F5F9),
                    ),
                    label: isAk ? 'ငွေထုတ်ရန်' : 'Withdraw',
                    onTap: () => appState.setFinancialSubView('withdraw'),
                  ),
                  const SizedBox(width: 10),
                  _buildActionButton(
                    iconWidget: _buildCircledIcon(
                      Icons.sync_alt_rounded,
                      const Color(0xFF0D9488),
                      const Color(0xFFF0FDFA),
                    ),
                    label: isAk ? 'ငွေလွှဲရန်' : 'Send',
                    onTap: () => appState.setFinancialSubView('send'),
                  ),
                  const SizedBox(width: 10),
                  _buildActionButton(
                    iconWidget: _buildCircledIcon(
                      Icons.swap_horiz_rounded,
                      const Color(0xFF4F46E5),
                      const Color(0xFFEEF2FF),
                    ),
                    label: isAk ? 'လဲလှယ်ရန်' : 'Swap',
                    onTap: () => appState.setFinancialSubView('swap'),
                  ),
                ],
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 18)),

          // Promo Carousel Banners
          SliverToBoxAdapter(
            child: Column(
              children: [
                SizedBox(
                  height: 125,
                  child: PageView(
                    controller: _pageController,
                    onPageChanged: (i) => setState(() => _carouselIndex = i),
                    children: [
                      // Slide 1: Mission
                      _buildPromoCard(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF1E3A8A), Color(0xFF3B82F6)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        title: 'USD Mission',
                        subtitle: 'Use more, Earn more!\nTotal Prize Pool 100,000 USD',
                        buttonLabel: 'Check Out',
                        onTap: () => appState.setFinancialSubView('mission'),
                        badgeText: 'Airdrop',
                      ),
                      // Slide 2: Swap
                      _buildPromoCard(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0F172A), Color(0xFF334155)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        title: 'Swap USD',
                        subtitle: 'USDT, USDC, EURC, XSGD, AUDD\nGuaranteed 0% Slippage',
                        buttonLabel: 'Swap Now!',
                        onTap: () => appState.setFinancialSubView('swap'),
                        badgeText: 'Base Chain',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(2, (index) {
                    final isSel = _carouselIndex == index;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      width: isSel ? 18 : 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: isSel ? paynoBlue : const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(999),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 14)),

          // Subtabs: Tokens | History
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Color(0xFFE2E8F0), width: 1.2),
                ),
              ),
              child: Row(
                children: [
                  _buildSubTabItem('Tokens', 0),
                  const SizedBox(width: 24),
                  _buildSubTabItem('History', 1),
                ],
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 12)),

          // Tab Content
          if (_activeTab == 0)
            _buildTokensListSliver(context, appState, isAk)
          else
            _buildHistoryListSliver(context, appState, isAk),

          const SliverToBoxAdapter(child: SizedBox(height: 110)),
        ],
      ),
    );
  }

  Widget _buildSubTabItem(String label, int index) {
    final isSel = _activeTab == index;
    return GestureDetector(
      onTap: () => setState(() => _activeTab = index),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isSel ? paynoBlue : Colors.transparent,
              width: 2.5,
            ),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 15,
            fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
            color: isSel ? const Color(0xFF0F172A) : const Color(0xFF64748B),
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required Widget iconWidget,
    required String label,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 4),
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
            mainAxisSize: MainAxisSize.min,
            children: [
              iconWidget,
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1E293B),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCircledIcon(IconData icon, Color color, Color bg) {
    return Container(
      width: 42,
      height: 42,
      decoration: BoxDecoration(
        color: bg,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Icon(icon, color: color, size: 22),
    );
  }

  Widget _buildPromoCard({
    required Gradient gradient,
    required String title,
    required String subtitle,
    required String buttonLabel,
    required VoidCallback onTap,
    required String badgeText,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.1),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        badgeText,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.9),
                    fontSize: 11.5,
                    height: 1.25,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          ElevatedButton(
            onPressed: onTap,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF1E3A8A),
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
            child: Text(
              buttonLabel,
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  // Tokens Tab (USDT & USDC starting from 0, showing = with USD)
  Widget _buildTokensListSliver(
      BuildContext context, AppState appState, bool isAk) {
    final fmt = NumberFormat('#,##0.00', 'en_US');
    final usdtBal = appState.cryptoWallet.usdtBalance;
    final usdcBal = appState.cryptoWallet.usdcBalance;

    final tokens = [
      {
        'symbol': 'USDT',
        'name': 'Tether USD',
        'balance': fmt.format(usdtBal),
        'unit': 'USDT',
        'valueUsd': '= ${fmt.format(usdtBal)} USD',
        'color': const Color(0xFF26A17B),
        'glyph': '₮',
      },
      {
        'symbol': 'USDC',
        'name': 'USD Coin',
        'balance': fmt.format(usdcBal),
        'unit': 'USDC',
        'valueUsd': '= ${fmt.format(usdcBal)} USD',
        'color': const Color(0xFF2775CA),
        'glyph': '\$',
      },
    ];

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final t = tokens[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  // Icon with Base Network Badge
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: t['color'] as Color,
                        child: Text(
                          t['glyph'] as String,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      Positioned(
                        right: -2,
                        bottom: -2,
                        child: _buildBaseNetworkBadge(size: 13),
                      ),
                    ],
                  ),
                  const SizedBox(width: 12),
                  // Name and Symbol
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          t['symbol'] as String,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          t['name'] as String,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Balance & USD Value
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        appState.walletBalanceHidden
                            ? '••••'
                            : '${t['balance']} ${t['unit']}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          fontFamily: 'monospace',
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        appState.walletBalanceHidden
                            ? '••••'
                            : (t['valueUsd'] as String),
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
          childCount: tokens.length,
        ),
      ),
    );
  }

  // History Tab
  Widget _buildHistoryListSliver(
      BuildContext context, AppState appState, bool isAk) {
    final liveTx = appState.usdAccountTxList;

    // Standard demo transactions matching photo_2026-11-06_19-51-21.jpg if empty
    final fallbackTx = [
      {
        'title': 'Received USDT',
        'time': '6 Nov 26 - 13:07',
        'amount': '+0.30 USDT',
        'isPositive': true,
      },
      {
        'title': 'Paid USD for Swap',
        'time': '6 Nov 26 - 13:07',
        'amount': '-10.00 USD',
        'isPositive': false,
      },
      {
        'title': 'Issued USD',
        'time': '6 Nov 26 - 13:06',
        'amount': '+10.00 USD',
        'isPositive': true,
      },
      {
        'title': 'Connect Wallet',
        'time': '6 Nov 26 - 05:30',
        'amount': '',
        'isPositive': null,
      },
    ];

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildListDelegate([
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isAk ? 'မှတ်တမ်း' : 'History',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                ),
              ),
              GestureDetector(
                onTap: () => appState.navigate(Screen.history),
                child: Text(
                  isAk ? 'အားလုံး' : 'See All',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: paynoBlue,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (liveTx.isNotEmpty)
            ...liveTx.map((tx) {
              final isPos = tx.amount > 0;
              final amountStr = tx.amount != 0
                  ? '${isPos ? '+' : ''}${tx.amount.toStringAsFixed(2)} ${tx.currency}'
                  : '';
              return _buildHistoryRow(
                title: isAk ? tx.titleMm : tx.title,
                time: tx.time,
                amount: amountStr,
                isPositive: tx.amount == 0 ? null : isPos,
              );
            })
          else
            ...fallbackTx.map((f) => _buildHistoryRow(
                  title: f['title'] as String,
                  time: f['time'] as String,
                  amount: f['amount'] as String,
                  isPositive: f['isPositive'] as bool?,
                )),
        ]),
      ),
    );
  }

  Widget _buildHistoryRow({
    required String title,
    required String time,
    required String amount,
    required bool? isPositive,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 4),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9), width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 3),
              Text(
                time,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
          if (amount.isNotEmpty)
            Text(
              amount,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                fontFamily: 'monospace',
                color: isPositive == true
                    ? emeraldSuccess
                    : const Color(0xFF0F172A),
              ),
            ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. ISSUE USD SCREEN (Matching photo_2026-11-06_19-52-51.jpg)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildIssueScreen(BuildContext context, AppState appState, bool isAk) {
    final currencyFmt = NumberFormat('#,##0.00', 'en_US');
    final akdBal = appState.wallet.balance;
    final enteredVal = double.tryParse(_issueAmountCtrl.text.trim()) ?? 0.0;
    final toUsdVal = enteredVal * 1.0; // 1 AKD = 1 USD
    final rawAddress = appState.effectiveUsdWalletAddress;
    final shortAddr = rawAddress.length > 12
        ? '${rawAddress.substring(0, 6)}...${rawAddress.substring(rawAddress.length - 4)}'
        : rawAddress;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF0F172A), size: 20),
          onPressed: () => appState.setFinancialSubView('wallet_main'),
        ),
        title: Text(
          isAk ? 'USD ထုတ်ယူခြင်း' : 'Issue USD',
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F172A),
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.close_rounded,
                color: Color(0xFF0F172A), size: 24),
            onPressed: () => appState.setFinancialSubView('wallet_main'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'From',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 8),

          // From Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                _buildAkdCoinIcon(size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _issueAmountCtrl,
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      fontFamily: 'monospace',
                    ),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      hintText: '0.00',
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
                const Text(
                  'AKD',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Monthly USD issue limit 0/10,000',
                style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
              ),
              Text(
                'Available: ${currencyFmt.format(akdBal)} AKD',
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  color: paynoBlue,
                ),
              ),
            ],
          ),

          // Preset amount chips
          const SizedBox(height: 10),
          Row(
            children: [
              _buildPresetChip('10', () => _setIssueAmount(10)),
              const SizedBox(width: 8),
              _buildPresetChip('50', () => _setIssueAmount(50)),
              const SizedBox(width: 8),
              _buildPresetChip('100', () => _setIssueAmount(100)),
              const SizedBox(width: 8),
              _buildPresetChip('Max', () => _setIssueAmount(akdBal)),
            ],
          ),

          const SizedBox(height: 18),
          // Down arrow & exchange rate
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: Color(0xFFF1F5F9),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_downward_rounded,
                    color: Color(0xFF64748B), size: 18),
              ),
              const SizedBox(width: 10),
              const Text(
                'Exchange Rate: 1 AKD = 1 USD',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF475569),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          const Text(
            'To',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 8),

          // To Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                _buildUsdCoinIcon(size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    currencyFmt.format(toUsdVal),
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      fontFamily: 'monospace',
                      color: Color(0xFF0F172A),
                    ),
                  ),
                ),
                const Text(
                  'USD',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Notice of receiving wallet
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'USD will be credited to your wallet',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF475569),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  shortAddr,
                  style: const TextStyle(
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 36),

          // Issue USD Button (Blue gradient, NOT orange)
          _buildPrimaryButton(
            label: isAk ? 'USD ထုတ်ယူမည်' : 'Issue USD',
            onTap: () => _handleIssueUsd(context, appState, enteredVal, isAk),
          ),
        ],
      ),
    );
  }

  void _setIssueAmount(double val) {
    setState(() {
      _issueAmountCtrl.text = val.toStringAsFixed(2);
    });
  }

  void _handleIssueUsd(
      BuildContext context, AppState appState, double amount, bool isAk) {
    if (amount <= 0) {
      _showToast(isAk ? 'ပမာဏ ထည့်သွင်းပါ' : 'Please enter an amount.');
      return;
    }
    // If not authenticated or has 0 AKD, provide demo credit or perform directly
    if (appState.wallet.balance < amount) {
      // Allow user in demo mode to top up or issue
      _showInsufficientAkdDialog(context, appState, amount, isAk);
      return;
    }

    final res = appState.issueUsd(amount);
    if (res['success'] == true) {
      appState.setFinancialSubView('processing');
    } else {
      _showToast(res['message']?.toString() ?? 'Error issuing USD');
    }
  }

  void _showInsufficientAkdDialog(
      BuildContext context, AppState appState, double amount, bool isAk) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(isAk ? 'လက်ကျန်ငွေ မလုံလောက်ပါ' : 'Insufficient AKD Balance'),
        content: Text(
          isAk
              ? 'သင့် AKD လက်ကျန်ငွေ နည်းပါးနေပါသည်။ စမ်းသပ်ရန် 100 AKD ထည့်ပေးမည်လား?'
              : 'Your AKD balance is insufficient. Would you like to add 100 AKD for demo testing?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(isAk ? 'ပယ်ဖျက်' : 'Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: paynoBlue),
            onPressed: () {
              Navigator.pop(ctx);
              appState.wallet.balance += 100.0;
              appState.wallet.totalBalance = appState.wallet.balance;
              appState.notify();
              _handleIssueUsd(context, appState, amount, isAk);
            },
            child: Text(isAk ? '၁၀၀ AKD ထည့်မည်' : 'Add 100 AKD',
                style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. WITHDRAW USD SCREEN (Matching photo_2026-11-06_19-52-58.jpg)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildWithdrawScreen(
      BuildContext context, AppState appState, bool isAk) {
    final currencyFmt = NumberFormat('#,##0.00', 'en_US');
    final usdBal = appState.usdAccountBalance;
    final enteredVal = double.tryParse(_withdrawAmountCtrl.text.trim()) ?? 0.0;
    final toAkdVal = enteredVal * 1.0; // 1 USD = 1 AKD
    final rawAddress = appState.effectiveUsdWalletAddress;
    final shortAddr = rawAddress.length > 12
        ? '${rawAddress.substring(0, 6)}...${rawAddress.substring(rawAddress.length - 4)}'
        : rawAddress;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF0F172A), size: 20),
          onPressed: () => appState.setFinancialSubView('wallet_main'),
        ),
        title: Text(
          isAk ? 'USD ငွေထုတ်ယူခြင်း' : 'Withdraw USD',
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F172A),
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.close_rounded,
                color: Color(0xFF0F172A), size: 24),
            onPressed: () => appState.setFinancialSubView('wallet_main'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'Withdraw',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 8),

          // Withdraw Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    _buildUsdCoinIcon(size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _withdrawAmountCtrl,
                        keyboardType: const TextInputType.numberWithOptions(
                            decimal: true),
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          fontFamily: 'monospace',
                        ),
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          hintText: '0.00',
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    const Text(
                      'USD',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 18, color: Color(0xFFF1F5F9)),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Wallet: $shortAddr',
                      style: const TextStyle(
                        fontSize: 12,
                        fontFamily: 'monospace',
                        color: Color(0xFF64748B),
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(Icons.account_balance_wallet_outlined,
                            size: 15, color: Color(0xFF64748B)),
                        const SizedBox(width: 4),
                        Text(
                          currencyFmt.format(usdBal),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            fontFamily: 'monospace',
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              _withdrawAmountCtrl.text =
                                  usdBal.toStringAsFixed(2);
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: paynoBlue.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Max',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: paynoBlue,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Exchange rate & gas note
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: Color(0xFFF1F5F9),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_downward_rounded,
                    color: Color(0xFF64748B), size: 18),
              ),
              const SizedBox(width: 10),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Exchange Rate: 1 USD = 1 AKD in Péthar Wallet',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF475569),
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'No gas fee',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: emeraldSuccess,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 18),

          const Text(
            "You'll Receive",
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 8),

          // You'll Receive Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                _buildAkdCoinIcon(size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    currencyFmt.format(toAkdVal),
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      fontFamily: 'monospace',
                      color: Color(0xFF0F172A),
                    ),
                  ),
                ),
                const Text(
                  'AKD',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Note
          const Text(
            'Note: Please ensure that the Wallet you are transacting with and the one you registered is the same Wallet Address.',
            style: TextStyle(
              fontSize: 12,
              color: Color(0xFF94A3B8),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 36),

          // Withdraw USD Button (NOT orange)
          _buildPrimaryButton(
            label: isAk ? 'USD ငွေထုတ်ယူမည်' : 'Withdraw USD',
            onTap: () =>
                _handleWithdrawUsd(context, appState, enteredVal, isAk),
          ),
        ],
      ),
    );
  }

  void _handleWithdrawUsd(
      BuildContext context, AppState appState, double amount, bool isAk) {
    if (amount <= 0) {
      _showToast(isAk ? 'ပမာဏ ထည့်သွင်းပါ' : 'Please enter an amount.');
      return;
    }
    if (appState.usdAccountBalance < amount) {
      _showToast(isAk ? 'USD လက်ကျန်ငွေ မလုံလောက်ပါ' : 'Insufficient USD balance.');
      return;
    }

    final res = appState.withdrawUsd(amount);
    if (res['success'] == true) {
      appState.setFinancialSubView('processing');
    } else {
      _showToast(res['message']?.toString() ?? 'Withdrawal failed');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. SEND / TRANSFER SCREEN (Matching photo_2026-11-06_19-52-59.jpg)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildSendScreen(BuildContext context, AppState appState, bool isAk) {
    final rawAddress = appState.effectiveUsdWalletAddress;
    final shortAddr = rawAddress.length > 12
        ? '${rawAddress.substring(0, 6)}...${rawAddress.substring(rawAddress.length - 4)}'
        : rawAddress;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF0F172A), size: 20),
          onPressed: () => appState.setFinancialSubView('wallet_main'),
        ),
        title: Text(
          isAk ? 'ငွေလွှဲရန်' : 'Transfer',
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F172A),
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.close_rounded,
                color: Color(0xFF0F172A), size: 24),
            onPressed: () => appState.setFinancialSubView('wallet_main'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'Select Tokens and Networks',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 12),

          // From Row & Network Selector
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'From',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF475569),
                ),
              ),
              Row(
                children: [
                  const Text('Networks',
                      style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () => _showSelectNetworkSheet(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          _buildBaseNetworkBadge(size: 14),
                          const SizedBox(width: 6),
                          Text(
                            _selectedNetwork,
                            style: const TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.keyboard_arrow_down_rounded,
                              size: 16, color: Color(0xFF64748B)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Token Input Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _sendAmountCtrl,
                        keyboardType: const TextInputType.numberWithOptions(
                            decimal: true),
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          fontFamily: 'monospace',
                        ),
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          hintText: '0.00',
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _showSelectTokenSheet(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            Text(
                              _sendToken,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(Icons.keyboard_arrow_down_rounded,
                                size: 16, color: Color(0xFF64748B)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                // Percentages
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    _buildPercentChip('25%', () => _setSendPercent(appState, 0.25)),
                    const SizedBox(width: 6),
                    _buildPercentChip('50%', () => _setSendPercent(appState, 0.50)),
                    const SizedBox(width: 6),
                    _buildPercentChip('75%', () => _setSendPercent(appState, 0.75)),
                    const SizedBox(width: 6),
                    _buildPercentChip('Max%', () => _setSendPercent(appState, 1.00)),
                  ],
                ),
                const Divider(height: 20, color: Color(0xFFF1F5F9)),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Wallet: $shortAddr',
                      style: const TextStyle(
                        fontSize: 12,
                        fontFamily: 'monospace',
                        color: Color(0xFF64748B),
                      ),
                    ),
                    const Icon(Icons.account_balance_wallet_outlined,
                        size: 16, color: Color(0xFF64748B)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Down arrow
          Center(
            child: Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.arrow_downward_rounded,
                  color: Color(0xFF64748B), size: 18),
            ),
          ),
          const SizedBox(height: 16),

          const Text(
            'To',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 8),

          // Recipient Address Box
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _sendAddressCtrl,
                    style: const TextStyle(
                      fontSize: 14,
                      fontFamily: 'monospace',
                    ),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      hintText: 'Enter recipient wallet address (0x...)',
                      hintStyle:
                          TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () async {
                    final data = await Clipboard.getData('text/plain');
                    if (data?.text != null) {
                      setState(() => _sendAddressCtrl.text = data!.text!.trim());
                    }
                  },
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'Paste',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF475569),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 40),

          // Transfer Button (Payno Blue, NOT orange)
          _buildPrimaryButton(
            label: isAk ? 'လွှဲပြောင်းမည်' : 'Transfer',
            onTap: () => _showConfirmTransactionSheet(context, appState, isAk),
          ),
        ],
      ),
    );
  }

  void _setSendPercent(AppState appState, double pct) {
    final bal = _sendToken == 'USDT'
        ? appState.cryptoWallet.usdtBalance
        : appState.cryptoWallet.usdcBalance;
    setState(() {
      _sendAmountCtrl.text = (bal * pct).toStringAsFixed(2);
    });
  }

  // Confirm Transaction Modal matching photo_2026-11-06_19-52-56.jpg
  void _showConfirmTransactionSheet(
      BuildContext context, AppState appState, bool isAk) {
    final amt = double.tryParse(_sendAmountCtrl.text.trim()) ?? 0.0;
    if (amt <= 0) {
      _showToast('Please enter an amount.');
      return;
    }
    final dest = _sendAddressCtrl.text.trim().isNotEmpty
        ? _sendAddressCtrl.text.trim()
        : '0xdC7b9A41819E8687b1c41E4c...2c5F';
    final shortDest = dest.length > 14
        ? '${dest.substring(0, 6)}...${dest.substring(dest.length - 4)}'
        : dest;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(width: 24),
                const Text(
                  'Confirm Transaction',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded,
                      color: Color(0xFF64748B), size: 22),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              "You're nearly done! Confirm transaction to proceed.",
              style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),

            // Card details
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _buildConfirmRow('Interacting with', shortDest, isMono: true),
                  const Divider(height: 18, color: Color(0xFFE2E8F0)),
                  _buildConfirmRow(
                    'Network',
                    _selectedNetwork,
                    trailingWidget: Row(
                      children: [
                        Text(_selectedNetwork,
                            style: const TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 13)),
                        const SizedBox(width: 6),
                        _buildBaseNetworkBadge(size: 14),
                      ],
                    ),
                  ),
                  const Divider(height: 18, color: Color(0xFFE2E8F0)),
                  _buildConfirmRow('Network Fee', '<\$0.01'),
                  const Divider(height: 18, color: Color(0xFFE2E8F0)),
                  _buildConfirmRow('Total', '<\$0.01', isBold: true),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Buttons: Cancel | Confirm
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      side: const BorderSide(color: Color(0xFFCBD5E1)),
                    ),
                    child: const Text('Cancel',
                        style: TextStyle(
                            color: Color(0xFF475569),
                            fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      appState.sendWalletToken(
                        token: _sendToken,
                        amount: amt,
                        toAddress: dest,
                        network: _selectedNetwork,
                      );
                      appState.setFinancialSubView('processing');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: paynoBlue,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: const Text('Confirm',
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 15)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConfirmRow(String label, String value,
      {bool isMono = false, bool isBold = false, Widget? trailingWidget}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
        ),
        trailingWidget ??
            Text(
              value,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isBold ? FontWeight.w900 : FontWeight.w700,
                fontFamily: isMono ? 'monospace' : null,
                color: const Color(0xFF0F172A),
              ),
            ),
      ],
    );
  }

  void _showSelectNetworkSheet(BuildContext context) {
    final networks = [
      {'name': 'Base', 'color': paynoBlue},
      {'name': 'Ethereum', 'color': const Color(0xFF627EEA)},
      {'name': 'Optimism', 'color': const Color(0xFFFF0420)},
      {'name': 'Arbitrum', 'color': const Color(0xFF28A0F0)},
      {'name': 'Polygon', 'color': const Color(0xFF8247E5)},
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(width: 24),
                const Text(
                  'Select Network',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 22),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...networks.map((net) {
              final isSel = _selectedNetwork == net['name'];
              return ListTile(
                leading: CircleAvatar(
                  radius: 16,
                  backgroundColor: net['color'] as Color,
                  child: Text(
                    (net['name'] as String)[0],
                    style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                title: Text(net['name'] as String,
                    style: const TextStyle(fontWeight: FontWeight.w700)),
                trailing: isSel
                    ? const Icon(Icons.check_rounded, color: paynoBlue)
                    : null,
                onTap: () {
                  setState(() => _selectedNetwork = net['name'] as String);
                  Navigator.pop(ctx);
                },
              );
            }),
          ],
        ),
      ),
    );
  }

  void _showSelectTokenSheet(BuildContext context) {
    final appState = Provider.of<AppState>(context, listen: false);
    final fmt = NumberFormat('#,##0.00', 'en_US');
    final usdtBal = appState.cryptoWallet.usdtBalance;
    final usdcBal = appState.cryptoWallet.usdcBalance;

    final tokens = [
      {
        'symbol': 'USDT',
        'name': 'Tether USD',
        'balance': '${fmt.format(usdtBal)} USDT',
        'fiat': '= ${fmt.format(usdtBal)} USD',
        'color': const Color(0xFF26A17B),
      },
      {
        'symbol': 'USDC',
        'name': 'USD Coin',
        'balance': '${fmt.format(usdcBal)} USDC',
        'fiat': '= ${fmt.format(usdcBal)} USD',
        'color': const Color(0xFF2775CA),
      },
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(width: 24),
                const Text(
                  'Select Token',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 22),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Search input
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const TextField(
                decoration: InputDecoration(
                  border: InputBorder.none,
                  hintText: 'Search by token contract address (0x...)',
                  hintStyle: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                ),
              ),
            ),
            const SizedBox(height: 12),
            ...tokens.map((t) {
              return ListTile(
                leading: CircleAvatar(
                  radius: 18,
                  backgroundColor: t['color'] as Color,
                  child: Text(
                    t['symbol'] == 'USDT' ? '₮' : '\$',
                    style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
                title: Text(t['symbol'] as String,
                    style: const TextStyle(fontWeight: FontWeight.w800)),
                subtitle: Text(t['name'] as String,
                    style: const TextStyle(fontSize: 12)),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(t['balance'] as String,
                        style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontFamily: 'monospace',
                            fontSize: 12.5)),
                    Text(t['fiat'] as String,
                        style: const TextStyle(
                            fontSize: 11, color: Color(0xFF94A3B8))),
                  ],
                ),
                onTap: () {
                  setState(() => _sendToken = t['symbol'] as String);
                  Navigator.pop(ctx);
                },
              );
            }),
          ],
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. SWAP SCREEN (Matching photo_2026-11-06_19-52-55.jpg)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildSwapScreen(BuildContext context, AppState appState, bool isAk) {
    final fmt = NumberFormat('#,##0.00', 'en_US');
    final sendVal = double.tryParse(_swapSendAmountCtrl.text.trim()) ?? 0.0;
    // Calculate receive estimate: 1:1 for stablecoins (USDT <-> USDC)
    final receiveVal = sendVal * 1.0;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF0F172A), size: 20),
          onPressed: () => appState.setFinancialSubView('wallet_main'),
        ),
        title: Text(
          isAk ? 'USD လဲလှယ်မှု' : 'USD Swap',
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F172A),
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.close_rounded,
                color: Color(0xFF0F172A), size: 24),
            onPressed: () => appState.setFinancialSubView('wallet_main'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Sub-notice
          Row(
            children: [
              const Icon(Icons.language_rounded,
                  size: 14, color: Color(0xFF64748B)),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  isAk
                      ? 'ဤဝန်ဆောင်မှုကို Péthar DEX & Uniswap Liquidity မှ ပံ့ပိုးသည်'
                      : 'This service is powered by Péthar DEX & Uniswap Liquidity.',
                  style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Title & settings
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Swap',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.settings_outlined,
                    color: Color(0xFF64748B), size: 20),
                onPressed: () => _showSlippageSheet(context),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // You Send Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('You Send',
                        style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF64748B))),
                    Row(
                      children: [
                        _buildPercentChip('25%', () => _setSwapPercent(appState, 0.25)),
                        const SizedBox(width: 4),
                        _buildPercentChip('50%', () => _setSwapPercent(appState, 0.50)),
                        const SizedBox(width: 4),
                        _buildPercentChip('75%', () => _setSwapPercent(appState, 0.75)),
                        const SizedBox(width: 4),
                        _buildPercentChip('Max%', () => _setSwapPercent(appState, 1.00)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    _buildTokenGlyphCircle(_swapFromToken),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _swapSendAmountCtrl,
                        keyboardType: const TextInputType.numberWithOptions(
                            decimal: true),
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          fontFamily: 'monospace',
                        ),
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          hintText: '0.00',
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    Text(
                      _swapFromToken,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    'Balance ${fmt.format(_swapFromToken == 'USDT' ? appState.cryptoWallet.usdtBalance : appState.cryptoWallet.usdcBalance)} $_swapFromToken',
                    style: const TextStyle(
                      fontSize: 11.5,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Invert swap button
          Center(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  final tmp = _swapFromToken;
                  _swapFromToken = _swapToToken;
                  _swapToToken = tmp;
                });
              },
              child: Container(
                margin: const EdgeInsets.symmetric(vertical: 8),
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                ),
                child: const Icon(Icons.swap_vert_rounded,
                    color: Color(0xFF475569), size: 20),
              ),
            ),
          ),

          // You Receive Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('You Receive',
                    style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF64748B))),
                const SizedBox(height: 10),
                Row(
                  children: [
                    _buildTokenGlyphCircle(_swapToToken),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        fmt.format(receiveVal),
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          fontFamily: 'monospace',
                          color: Color(0xFF0F172A),
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Text(
                            _swapToToken,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const Icon(Icons.keyboard_arrow_down_rounded,
                              size: 16),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    'Balance ${fmt.format(_swapToToken == 'USDT' ? appState.cryptoWallet.usdtBalance : appState.cryptoWallet.usdcBalance)} $_swapToToken',
                    style: const TextStyle(
                      fontSize: 11.5,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),
          const Text(
            'Swap USD to other tokens for up to 10,000 this month',
            style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 14),

          // Gas fee note
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.local_gas_station_rounded,
                    size: 16, color: Color(0xFF64748B)),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'The USD Swap service covers the gas fees for your transactions. If you use the tokens outside of this service, gas fees may apply.',
                    style: TextStyle(
                      fontSize: 11.5,
                      color: Color(0xFF475569),
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Agree checkbox
          Row(
            children: [
              Checkbox(
                value: _agreedToSwapTerms,
                activeColor: paynoBlue,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4)),
                onChanged: (v) =>
                    setState(() => _agreedToSwapTerms = v ?? false),
              ),
              const Expanded(
                child: Text.rich(
                  TextSpan(
                    text: 'I agree to Péthar DEX ',
                    style:
                        TextStyle(fontSize: 12, color: Color(0xFF475569)),
                    children: [
                      TextSpan(
                        text: 'Terms and Conditions',
                        style: TextStyle(
                          color: paynoBlue,
                          fontWeight: FontWeight.w700,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Swap Button (Payno Blue, NOT orange)
          _buildPrimaryButton(
            label: isAk ? 'လဲလှယ်မည်' : 'Swap',
            onTap: () {
              if (!_agreedToSwapTerms) {
                _showToast('Please agree to terms to proceed.');
                return;
              }
              if (sendVal <= 0) {
                _showToast('Please enter an amount.');
                return;
              }
              appState.swapWalletToken(
                fromToken: _swapFromToken,
                toToken: _swapToToken,
                fromAmount: sendVal,
                toAmount: receiveVal,
              );
              appState.setFinancialSubView('processing');
            },
          ),
          const SizedBox(height: 16),

          // Partnership footer
          const Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Partnership with Uniswap',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF64748B),
                  ),
                ),
                SizedBox(width: 6),
                Text('🦄', style: TextStyle(fontSize: 16)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _setSwapPercent(AppState appState, double pct) {
    final bal = _swapFromToken == 'USDT'
        ? appState.cryptoWallet.usdtBalance
        : appState.cryptoWallet.usdcBalance;
    setState(() {
      _swapSendAmountCtrl.text = (bal * pct).toStringAsFixed(2);
    });
  }

  void _showSlippageSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Slippage Tolerance',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
            const SizedBox(height: 12),
            Row(
              children: [0.1, 0.5, 1.0].map((s) {
                final isSel = _slippage == s;
                return GestureDetector(
                  onTap: () {
                    setState(() => _slippage = s);
                    Navigator.pop(ctx);
                  },
                  child: Container(
                    margin: const EdgeInsets.only(right: 10),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSel ? paynoBlue : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '$s%',
                      style: TextStyle(
                        color: isSel ? Colors.white : const Color(0xFF0F172A),
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. RECEIVE SCREEN (Matching photo_2026-11-06_19-53-09.jpg)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildReceiveScreen(
      BuildContext context, AppState appState, bool isAk) {
    final rawAddress = appState.effectiveUsdWalletAddress;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF0F172A), size: 20),
          onPressed: () => appState.setFinancialSubView('wallet_main'),
        ),
        title: Text(
          isAk ? 'ငွေလက်ခံလိပ်စာ' : 'Receive Address',
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F172A),
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.close_rounded,
                color: Color(0xFF0F172A), size: 24),
            onPressed: () => appState.setFinancialSubView('wallet_main'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SizedBox(height: 10),
          // QR Card
          Center(
            child: Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.05),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  QrImageView(
                    data: rawAddress,
                    version: QrVersions.auto,
                    size: 210,
                    backgroundColor: Colors.white,
                    eyeStyle: const QrEyeStyle(
                      eyeShape: QrEyeShape.square,
                      color: Color(0xFF0F172A),
                    ),
                    dataModuleStyle: const QrDataModuleStyle(
                      dataModuleShape: QrDataModuleShape.square,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  _buildBaseNetworkBadge(size: 28),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),

          // Address Card with Copy
          GestureDetector(
            onTap: () => _copy(rawAddress, 'Receive address copied!'),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Receive address',
                        style:
                            TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(width: 6),
                      Icon(
                        _copied ? Icons.check : Icons.copy_rounded,
                        size: 14,
                        color: _copied ? emeraldSuccess : const Color(0xFF64748B),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    rawAddress,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Use address on Base
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Use this address to receive tokens on ',
                  style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              _buildBaseNetworkBadge(size: 13),
              const SizedBox(width: 4),
              const Text('Base',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 18),

          // To swap with USD banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Text(
              'To swap with USD, receive supported tokens (USDT, USDC, EURC, XSGD, AUDD) on Base network only.',
              style: TextStyle(
                fontSize: 12,
                color: Color(0xFF475569),
                height: 1.35,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 32),

          // Share QR Button (Payno Blue, NOT orange)
          _buildPrimaryButton(
            label: isAk ? 'QR ကုဒ် မျှဝေမည်' : 'Share QR Code',
            onTap: () => _copy(rawAddress, 'Receive address copied!'),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. USD MISSION SCREEN (Matching photo_2026-11-06_19-52-57.jpg)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildMissionScreen(
      BuildContext context, AppState appState, bool isAk) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF0F172A), size: 20),
          onPressed: () => appState.setFinancialSubView('wallet_main'),
        ),
        title: Text(
          isAk ? 'USD ဆုလာဘ် အစီအစဉ်' : 'USD Airdrop Mission',
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F172A),
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.close_rounded,
                color: Color(0xFF0F172A), size: 24),
            onPressed: () => appState.setFinancialSubView('wallet_main'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Prize Pool Card (Sleek Blue Gradient, NOT orange)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E3A8A), Color(0xFF2563EB)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: paynoBlue.withValues(alpha: 0.25),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'USD Airdrop Mission',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'The more you do, the more you earn!',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.9),
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 14),
                const Text(
                  '100,000* USD',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Flip Clock Countdown (Navy slate, NOT orange)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildCountdownBox('24', 'DAYS'),
                _buildCountdownBox('10', 'HRS'),
                _buildCountdownBox('52', 'MINS'),
                _buildCountdownBox('00', 'SECS'),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Points and Rank Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: const Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Your Points',
                        style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF64748B))),
                    Text('0',
                        style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A))),
                  ],
                ),
                Divider(height: 20, color: Color(0xFFF1F5F9)),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Estimated USD Reward',
                        style:
                            TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
                    Text('0.00 USD',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            fontFamily: 'monospace')),
                  ],
                ),
                SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Rank',
                        style:
                            TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
                    Text('1018 / 1,017',
                        style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: paynoBlue)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          _buildPrimaryButton(
            label: isAk ? 'အစီအစဉ်တွင် ပါဝင်မည်' : 'Participate Now',
            onTap: () {
              _showToast('Registered in USD Mission!');
              appState.setFinancialSubView('wallet_main');
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCountdownBox(String value, String unit) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          unit,
          style: const TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 10,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. PROCESSING SCREEN (Matching photo_2026-11-06_19-52-53.jpg)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildProcessingScreen(
      BuildContext context, AppState appState, bool isAk) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.close_rounded, color: Color(0xFF0F172A)),
            onPressed: () => appState.setFinancialSubView('wallet_main'),
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Illustration placeholder
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFBFDBFE), width: 2),
                ),
                child: const Icon(
                  Icons.hourglass_top_rounded,
                  color: paynoBlue,
                  size: 54,
                ),
              ),
              const SizedBox(height: 28),

              Text(
                isAk
                    ? 'လုပ်ငန်းစဉ်ကို Blockchain တွင် ဆောင်ရွက်နေပါသည်...'
                    : 'Transaction Processing on Blockchain',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                isAk
                    ? 'ပင်မစာမျက်နှာတွင် အခြေအနေနှင့် USD လက်ကျန်ငွေကို စစ်ဆေးနိုင်ပါသည်။ အချက်အလက် မွမ်းမံမတွေ့ရှိပါက မိနစ်အနည်းငယ်အတွင်း ထပ်မံစစ်ဆေးပါ။'
                    : 'You can check status and USD balance on the wallet page. If not updated, please check again within a few moments.',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF64748B),
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 40),

              // Back to Wallet Button (Payno Blue, NOT orange)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => appState.setFinancialSubView('wallet_main'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: paynoBlue,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    isAk ? 'ပိုက်ဆံအိတ်သို့ ပြန်သွားမည်' : 'Back to Wallet',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. SECURITY PHRASE SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildSecurityPhraseScreen(
      BuildContext context, AppState appState, bool isAk) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF0F172A), size: 20),
          onPressed: () => appState.setFinancialSubView('wallet_main'),
        ),
        title: Text(
          isAk ? 'လုံခြုံရေးနှင့် လျှို့ဝှက်စကားစု' : 'Security & Recovery Phrase',
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F172A),
          ),
        ),
        centerTitle: true,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.shield_outlined, size: 64, color: paynoBlue),
              const SizedBox(height: 16),
              const Text(
                'Self-Custodial Security',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              const Text(
                'Your Web3 USD wallet is secured by MPC (Multi-Party Computation) and biometric hardware keystore.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 24),
              _buildPrimaryButton(
                label: 'Back to Wallet',
                onTap: () => appState.setFinancialSubView('wallet_main'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON HELPER WIDGETS
  // ═══════════════════════════════════════════════════════════════════════════

  Widget _buildBaseNetworkBadge({double size = 16}) {
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        color: Color(0xFF0052FF), // Base official blue
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Container(
        width: size * 0.5,
        height: size * 0.16,
        color: Colors.white,
      ),
    );
  }

  Widget _buildUsdCoinIcon({double size = 32}) {
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Text(
        '\$',
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w900,
          fontSize: size * 0.55,
        ),
      ),
    );
  }

  Widget _buildAkdCoinIcon({double size = 32}) {
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [crimson, Color(0xFF990000)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Text(
        '₳',
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w900,
          fontSize: size * 0.55,
        ),
      ),
    );
  }

  Widget _buildTokenGlyphCircle(String symbol) {
    Color c = paynoBlue;
    String g = '\$';
    if (symbol == 'USDT') {
      c = const Color(0xFF26A17B);
      g = '₮';
    } else if (symbol == 'ETH') {
      c = const Color(0xFF627EEA);
      g = 'Ξ';
    } else if (symbol == 'USDC') {
      c = const Color(0xFF2775CA);
      g = '\$';
    }
    return CircleAvatar(
      radius: 14,
      backgroundColor: c,
      child: Text(
        g,
        style: const TextStyle(
            color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildPresetChip(String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFCBD5E1)),
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Color(0xFF475569),
          ),
        ),
      ),
    );
  }

  Widget _buildPercentChip(String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: Color(0xFF475569),
          ),
        ),
      ),
    );
  }

  Widget _buildPrimaryButton({
    required String label,
    required VoidCallback onTap,
  }) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: paynoBlue, // Strictly paynoBlue, never orange!
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          elevation: 0,
        ),
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }

  void _showToast(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: const Color(0xFF1E293B),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
