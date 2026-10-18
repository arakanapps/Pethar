import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../widgets/arakan_emblem.dart';

class AccountScreen extends StatefulWidget {
  const AccountScreen({Key? key}) : super(key: key);

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  bool _hideBalances = false;

  void _showTransferDialog(BuildContext context, AppState appState) {
    double transferAmt = 100.0;
    bool usdToAkd = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          final isDark = Theme.of(ctx).brightness == Brightness.dark;
          return Container(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
              top: 20,
              left: 20,
              right: 20,
            ),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E2638) : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      appState.language == 'ak'
                        ? 'အကောင့်များအကြား ငွေလွှဲပြောင်းရန်'
                        : 'Transfer Between Accounts',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withOpacity(0.06) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () => setModalState(() => usdToAkd = true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: usdToAkd ? const Color(0xFF9E1B32) : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Center(
                              child: Text(
                                'USD → AKD Wallet',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: usdToAkd ? Colors.white : Colors.grey,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: InkWell(
                          onTap: () => setModalState(() => usdToAkd = false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: !usdToAkd ? const Color(0xFF9E1B32) : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Center(
                              child: Text(
                                'AKD Wallet → USD',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: !usdToAkd ? Colors.white : Colors.grey,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  'Amount',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withOpacity(0.06) : Colors.grey[100],
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.withOpacity(0.2)),
                  ),
                  child: Row(
                    children: [
                      Text(
                        usdToAkd ? '\$ ' : '₳ ',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF9E1B32)),
                      ),
                      Expanded(
                        child: TextFormField(
                          initialValue: transferAmt.toStringAsFixed(0),
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          decoration: const InputDecoration(border: InputBorder.none),
                          onChanged: (val) {
                            transferAmt = double.tryParse(val) ?? 0.0;
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () {
                      if (transferAmt <= 0) return;
                      appState.transferBetweenAccounts(amount: transferAmt, usdToAkd: usdToAkd);
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Successfully transferred ${usdToAkd ? "\$$transferAmt to AKD Wallet" : "₳$transferAmt to USD Account"}!',
                          ),
                          backgroundColor: emeraldSuccess,
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF9E1B32),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text(
                      'Confirm Instant Transfer',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    final double akdBalance = appState.wallet.balance;
    final double usdBalance = appState.usdAccountBalance;
    // Parity: 1 AKD = 1 USD; 1 USD/AKD = 4,500 MMK; 1 THB = 115 MMK
    final double totalUsd = akdBalance + usdBalance;
    final double totalMmk = totalUsd * 4500.0;
    final double totalThb = totalMmk / 115.0;

    final double akdPercent = totalUsd > 0 ? (akdBalance / totalUsd) : 0.5;
    final double usdPercent = totalUsd > 0 ? (usdBalance / totalUsd) : 0.5;

    return Scaffold(
      backgroundColor: isDark ? obsidian : const Color(0xFFF4F5F8),
      appBar: AppBar(
        title: Text(
          lang == 'ak' ? 'ငွေစာရင်းများ စီမံခန့်ခွဲမှု' : 'Accounts & Balances',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => appState.navigate(Screen.home),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _hideBalances ? Icons.visibility_off : Icons.visibility,
              color: isDark ? Colors.white70 : Colors.black87,
            ),
            tooltip: _hideBalances ? 'Show balances' : 'Hide balances',
            onPressed: () => setState(() => _hideBalances = !_hideBalances),
          ),
        ],
        backgroundColor: isDark ? surfaceDark : Colors.white,
        elevation: 0,
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ═════════════════════════════════════════════════════════════════
            // 1. FIRST OVERVIEW TOTAL AMOUNT CARD
            // ═════════════════════════════════════════════════════════════════
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                gradient: const LinearGradient(
                  colors: [Color(0xFF0B192C), Color(0xFF1E2A38), Color(0xFF101726)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border.all(color: Colors.blueAccent.withOpacity(0.35), width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF9E1B32).withOpacity(0.3),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.pie_chart, size: 16, color: Colors.amberAccent),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            lang == 'ak' ? 'စုစုပေါင်း ပိုင်ဆိုင်မှု အကျဉ်းချုပ်' : 'Total Portfolio Overview',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white.withOpacity(0.15)),
                        ),
                        child: const Text(
                          '2 ACCOUNTS',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  _hideBalances
                      ? const Text(
                          '••••••••',
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: 4,
                          ),
                        )
                      : Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            const Text(
                              '\$ ',
                              style: TextStyle(color: Colors.lightBlueAccent, fontSize: 24, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              totalUsd.toStringAsFixed(2),
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 32,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              'USD',
                              style: TextStyle(color: Colors.white60, fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                  const SizedBox(height: 6),
                  if (!_hideBalances)
                    Text(
                      '≈ ₳ ${totalUsd.toStringAsFixed(2)} AKD  ·  ≈ ${totalMmk.toStringAsFixed(0)} MMK  ·  ≈ ${totalThb.toStringAsFixed(2)} THB',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.white.withOpacity(0.65),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  const SizedBox(height: 18),

                  // Allocation Progress Bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: Row(
                      children: [
                        Expanded(
                          flex: (akdPercent * 100).toInt(),
                          child: Container(
                            height: 7,
                            color: const Color(0xFFE11D48), // Rose/Crimson for AKD Wallet
                          ),
                        ),
                        const SizedBox(width: 2),
                        Expanded(
                          flex: (usdPercent * 100).toInt(),
                          child: Container(
                            height: 7,
                            color: const Color(0xFF10B981), // Emerald for USD Account
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Overview Legend
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFFE11D48), shape: BoxShape.circle)),
                          const SizedBox(width: 6),
                          Text(
                            'Wallet: ${(akdPercent * 100).toStringAsFixed(1)}%',
                            style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                          const SizedBox(width: 6),
                          Text(
                            'USD Account: ${(usdPercent * 100).toStringAsFixed(1)}%',
                            style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Quick Transfer Button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => _showTransferDialog(context, appState),
                      icon: const Icon(Icons.swap_horiz, size: 16, color: Colors.white),
                      label: Text(
                        lang == 'ak' ? 'အကောင့်များအကြား အပြန်အလှန်လွှဲမည်' : 'Transfer Between Accounts',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white.withOpacity(0.08),
                        side: BorderSide(color: Colors.white.withOpacity(0.2)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        padding: const EdgeInsets.symmetric(vertical: 11),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),

            // ═════════════════════════════════════════════════════════════════
            // 2. WALLET ACCOUNT CARD (WITH SMALL PIE CHART & BALANCES)
            // ═════════════════════════════════════════════════════════════════
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? surfaceCard : Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: isDark ? Colors.white.withOpacity(0.08) : Colors.grey[200]!,
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const ArakanEmblem(size: 26),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                lang == 'ak' ? 'ဖေ့သာ ပိုက်ဆံအိတ်' : 'Péthar Wallet (AKD)',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: isDark ? Colors.white : Colors.black87,
                                ),
                              ),
                              Text(
                                appState.profile.petharId,
                                style: const TextStyle(fontFamily: 'monospace', fontSize: 10, color: Colors.grey),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: emeraldSuccess.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: emeraldSuccess.withOpacity(0.3)),
                        ),
                        child: const Text(
                          'ACTIVE',
                          style: TextStyle(color: emeraldSuccess, fontWeight: FontWeight.bold, fontSize: 10),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Middle Row: Balances on Left, Small Pie Chart on Right
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Available Balance',
                              style: TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w500),
                            ),
                            const SizedBox(height: 4),
                            _hideBalances
                                ? const Text(
                                    '••••••••',
                                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                                  )
                                : Row(
                                    children: [
                                      const Text(
                                        '₳ ',
                                        style: TextStyle(color: Color(0xFFD91624), fontSize: 22, fontWeight: FontWeight.w900),
                                      ),
                                      Text(
                                        akdBalance.toStringAsFixed(2),
                                        style: TextStyle(
                                          fontFamily: 'monospace',
                                          fontSize: 24,
                                          fontWeight: FontWeight.w900,
                                          color: isDark ? Colors.white : Colors.black87,
                                        ),
                                      ),
                                    ],
                                  ),
                            const SizedBox(height: 3),
                            if (!_hideBalances)
                              Text(
                                '≈ \$${akdBalance.toStringAsFixed(2)} USD  ·  ${(akdBalance * 4500).toStringAsFixed(0)} MMK',
                                style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Small Pie/Donut Chart for Wallet (75% Liquid, 25% Gold Reserve Vault)
                      CustomMiniPieChart(
                        values: const [0.75, 0.25],
                        colors: const [Color(0xFFE11D48), Color(0xFFF59E0B)],
                        size: 64,
                        strokeWidth: 9,
                        centerWidget: const Text(
                          '₳',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFFD91624),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Legend for Wallet slices
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withOpacity(0.04) : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFFE11D48), shape: BoxShape.circle)),
                            const SizedBox(width: 6),
                            Text(
                              'Liquid (75%): ₳ ${(akdBalance * 0.75).toStringAsFixed(2)}',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : Colors.black87),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFFF59E0B), shape: BoxShape.circle)),
                            const SizedBox(width: 6),
                            Text(
                              'Gold Vault (25%): ₳ ${(akdBalance * 0.25).toStringAsFixed(2)}',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : Colors.black87),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Quick Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => appState.navigate(Screen.send),
                          icon: const Icon(Icons.arrow_outward, size: 14, color: Colors.white),
                          label: Text(
                            lang == 'ak' ? 'ငွေလွှဲ' : 'Send',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFD91624),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            elevation: 0,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => appState.navigate(Screen.receive),
                          icon: Icon(Icons.qr_code, size: 14, color: isDark ? Colors.white : Colors.black87),
                          label: Text(
                            lang == 'ak' ? 'လက်ခံ' : 'Receive',
                            style: TextStyle(
                              color: isDark ? Colors.white : Colors.black87,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: isDark ? Colors.white24 : Colors.grey[300]!),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // ═════════════════════════════════════════════════════════════════
            // 3. USD ACCOUNT CARD (WITH SMALL PIE CHART & BALANCES)
            // ═════════════════════════════════════════════════════════════════
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? surfaceCard : Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: isDark ? Colors.white.withOpacity(0.08) : Colors.grey[200]!,
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withOpacity(0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Center(
                              child: Text(
                                '\$',
                                style: TextStyle(
                                  color: Color(0xFF10B981),
                                  fontWeight: FontWeight.w900,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                lang == 'ak' ? 'ယူအက်စ်ဒီ အကောင့် (တည်ငြိမ်ဒင်္ဂါး)' : 'USD Account (Stablecoins)',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: isDark ? Colors.white : Colors.black87,
                                ),
                              ),
                              Row(
                                children: [
                                  const Text(
                                    '0x36...5f19',
                                    style: TextStyle(fontFamily: 'monospace', fontSize: 10, color: Colors.grey),
                                  ),
                                  const SizedBox(width: 4),
                                  InkWell(
                                    onTap: () {
                                      Clipboard.setData(const ClipboardData(text: '0x36a8F492C109bE742819aBcD8391048291045f19'));
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Address copied to clipboard!'), duration: Duration(seconds: 1)),
                                      );
                                    },
                                    child: const Icon(Icons.copy, size: 11, color: Colors.grey),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.blue.withOpacity(0.3)),
                        ),
                        child: const Text(
                          'ON-CHAIN',
                          style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold, fontSize: 10),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Middle Row: Balances on Left, Small Pie Chart on Right
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Total USD Value',
                              style: TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w500),
                            ),
                            const SizedBox(height: 4),
                            _hideBalances
                                ? const Text(
                                    '••••••••',
                                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                                  )
                                : Row(
                                    children: [
                                      const Text(
                                        '\$ ',
                                        style: TextStyle(color: Color(0xFF10B981), fontSize: 22, fontWeight: FontWeight.w900),
                                      ),
                                      Text(
                                        usdBalance.toStringAsFixed(2),
                                        style: TextStyle(
                                          fontFamily: 'monospace',
                                          fontSize: 24,
                                          fontWeight: FontWeight.w900,
                                          color: isDark ? Colors.white : Colors.black87,
                                        ),
                                      ),
                                    ],
                                  ),
                            const SizedBox(height: 3),
                            if (!_hideBalances)
                              Text(
                                '≈ ₳ ${usdBalance.toStringAsFixed(2)} AKD  ·  ${(usdBalance * 4500).toStringAsFixed(0)} MMK',
                                style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Small Pie/Donut Chart for USD Tokens (70% USDT, 20% USDC, 10% USD1)
                      CustomMiniPieChart(
                        values: const [0.70, 0.20, 0.10],
                        colors: const [Color(0xFF10B981), Color(0xFF2563EB), Color(0xFFF59E0B)],
                        size: 64,
                        strokeWidth: 9,
                        centerWidget: const Text(
                          '\$',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF10B981),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Legend for USD Token slices
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withOpacity(0.04) : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                            const SizedBox(width: 4),
                            Text(
                              'USDT: \$${(usdBalance * 0.7).toStringAsFixed(0)}',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : Colors.black87),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFF2563EB), shape: BoxShape.circle)),
                            const SizedBox(width: 4),
                            Text(
                              'USDC: \$${(usdBalance * 0.2).toStringAsFixed(0)}',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : Colors.black87),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFFF59E0B), shape: BoxShape.circle)),
                            const SizedBox(width: 4),
                            Text(
                              'USD1: \$${(usdBalance * 0.1).toStringAsFixed(0)}',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : Colors.black87),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Quick Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => appState.navigate(Screen.crypto),
                          icon: const Icon(Icons.arrow_downward, size: 14, color: Colors.white),
                          label: Text(
                            lang == 'ak' ? 'ငွေသွင်း' : 'Deposit',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF10B981),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            elevation: 0,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => appState.navigate(Screen.cashout),
                          icon: Icon(Icons.account_balance, size: 14, color: isDark ? Colors.white : Colors.black87),
                          label: Text(
                            lang == 'ak' ? 'ငွေထုတ်' : 'Cash Out',
                            style: TextStyle(
                              color: isDark ? Colors.white : Colors.black87,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: isDark ? Colors.white24 : Colors.grey[300]!),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),

            // ═════════════════════════════════════════════════════════════════
            // 4. VISA DEBIT CARD SECTION
            // ═════════════════════════════════════════════════════════════════
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.credit_card, size: 16, color: gold),
                    const SizedBox(width: 8),
                    Text(
                      lang == 'ak' ? 'ဖေ့သာ ဒစ်ဂျစ်တယ်ကတ်' : 'Péthar Debit Card',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                  ],
                ),
                const Text(
                  'VISA DEBIT',
                  style: TextStyle(fontFamily: 'monospace', fontSize: 11, fontWeight: FontWeight.bold, color: gold),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Realistic Card Container
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(22),
                gradient: appState.cardFrozen
                    ? LinearGradient(
                        colors: [Colors.grey[850]!, Colors.grey[900]!],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : const LinearGradient(
                        colors: [Color(0xFF730A12), Color(0xFFA8131F), Color(0xFF3B0206)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                border: Border.all(
                  color: appState.cardFrozen ? Colors.grey[700]! : gold.withOpacity(0.6),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.35),
                    blurRadius: 14,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const ArakanEmblem(size: 28),
                          const SizedBox(width: 8),
                          const Text(
                            'PETHAR',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'VISA',
                        style: TextStyle(
                          color: goldLight,
                          fontWeight: FontWeight.w900,
                          fontSize: 18,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    '4219 •••• •••• 9924',
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 18,
                      letterSpacing: 3,
                      fontWeight: FontWeight.bold,
                      color: Colors.white.withOpacity(0.95),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'CARDHOLDER',
                            style: TextStyle(color: goldLight.withOpacity(0.7), fontSize: 8, letterSpacing: 1),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            appState.profile.name.toUpperCase(),
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'EXP',
                                style: TextStyle(color: goldLight.withOpacity(0.7), fontSize: 8, letterSpacing: 1),
                              ),
                              const SizedBox(height: 2),
                              const Text('09/30', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                            ],
                          ),
                          const SizedBox(width: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'CVV',
                                style: TextStyle(color: goldLight.withOpacity(0.7), fontSize: 8, letterSpacing: 1),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                appState.showCardCvv ? '418' : '•••',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12, fontFamily: 'monospace'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Card Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => appState.toggleCardFreeze(),
                    icon: Icon(
                      appState.cardFrozen ? Icons.lock_open : Icons.lock,
                      size: 15,
                      color: appState.cardFrozen ? emeraldSuccess : Colors.orangeAccent,
                    ),
                    label: Text(
                      appState.cardFrozen ? 'Unfreeze Card' : 'Freeze Card',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white70 : Colors.black87,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      side: BorderSide(color: isDark ? Colors.white24 : Colors.grey[300]!),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => appState.toggleCardCvv(),
                    icon: Icon(
                      appState.showCardCvv ? Icons.visibility_off : Icons.visibility,
                      size: 15,
                      color: gold,
                    ),
                    label: Text(
                      appState.showCardCvv ? 'Hide CVV' : 'View CVV',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white70 : Colors.black87,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      side: BorderSide(color: isDark ? Colors.white24 : Colors.grey[300]!),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // ═════════════════════════════════════════════════════════════════
            // 5. RECENT ACTIVITY
            // ═════════════════════════════════════════════════════════════════
            Text(
              lang == 'ak' ? 'လတ်တလော ငွေစာရင်းမှတ်တမ်း' : 'Recent Transactions',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 12),
            ...appState.txList.take(4).map((tx) {
              final isNegative = tx.amount < 0;
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? surfaceCard : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[200]!),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: (isNegative ? crimson : emeraldSuccess).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        isNegative ? Icons.arrow_outward : Icons.arrow_downward,
                        color: isNegative ? crimson : emeraldSuccess,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            lang == 'ak' ? tx.titleMm : tx.title,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            tx.time,
                            style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '${isNegative ? '-' : '+'} ₳ ${tx.amount.abs().toStringAsFixed(2)}',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
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
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// CUSTOM MINI PIE / DONUT CHART WIDGET
// ═════════════════════════════════════════════════════════════════════════════
class CustomMiniPieChart extends StatelessWidget {
  final List<double> values;
  final List<Color> colors;
  final double size;
  final double strokeWidth;
  final Widget? centerWidget;

  const CustomMiniPieChart({
    Key? key,
    required this.values,
    required this.colors,
    this.size = 64,
    this.strokeWidth = 9,
    this.centerWidget,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(size, size),
            painter: _PieChartPainter(
              values: values,
              colors: colors,
              strokeWidth: strokeWidth,
            ),
          ),
          if (centerWidget != null) centerWidget!,
        ],
      ),
    );
  }
}

class _PieChartPainter extends CustomPainter {
  final List<double> values;
  final List<Color> colors;
  final double strokeWidth;

  _PieChartPainter({
    required this.values,
    required this.colors,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final double total = values.fold(0.0, (sum, val) => sum + val);
    if (total <= 0) return;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    double startAngle = -math.pi / 2;

    for (int i = 0; i < values.length; i++) {
      final sweepAngle = (values[i] / total) * 2 * math.pi;
      final paint = Paint()
        ..color = colors[i % colors.length]
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle - 0.08, // small gap between slices
        false,
        paint,
      );

      startAngle += sweepAngle;
    }
  }

  @override
  bool shouldRepaint(covariant _PieChartPainter oldDelegate) => true;
}
