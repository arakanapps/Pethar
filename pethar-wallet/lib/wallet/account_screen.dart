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
  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    final double akdBalance = appState.wallet.balance;
    final double akdPending = appState.wallet.pendingBalance;
    final double akdTotal = akdBalance + akdPending;

    final double usdBalance = appState.usdAccountBalance;
    const double usdPending = 0.00;
    final double usdTotal = usdBalance + usdPending;

    // Total Amount across both accounts
    final double totalBalance = akdBalance + usdBalance;

    final double akdPercent =
        totalBalance > 0 ? (akdBalance / totalBalance) : 0.5;
    final double usdPercent =
        totalBalance > 0 ? (usdBalance / totalBalance) : 0.5;

    final String userUid = appState.profile.uid;
    final String usdWalletAddress = appState.profile.usdAccountWalletAddress;
    final String usdWalletShort = usdWalletAddress.length >= 8
        ? '${usdWalletAddress.substring(0, 4)}...${usdWalletAddress.substring(usdWalletAddress.length - 4)}'
        : usdWalletAddress;

    return Scaffold(
      backgroundColor: isDark ? obsidian : const Color(0x14FFFFFF),
      appBar: AppBar(
        title: Text(
          lang == 'ak' ? 'Accounts & Balances' : 'Accounts & Balances',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => appState.navigate(Screen.home),
        ),
        actions: [
          IconButton(
            icon: Icon(
              Icons.history_rounded,
              color: isDark ? Colors.white70 : Colors.white,
            ),
            tooltip: lang == 'ak' ? 'မှတ်တမ်း' : 'History',
            onPressed: () => appState.navigate(Screen.history),
          ),
        ],
        backgroundColor: isDark ? surfaceDark : Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ═════════════════════════════════════════════════════════════════
            // 1. OVERVIEW CARD (TOTAL AMOUNT & RED/YELLOW PIE CHART)
            // ═════════════════════════════════════════════════════════════════
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                color: const Color(0x14FFFFFF),
                border: Border.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.35)
                      : const Color(0x26FFFFFF),
                  width: 1.2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.white.withValues(alpha: isDark ? 0.3 : 0.04),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Overview Heading
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: isDark
                              ? const Color(0x14FFFFFF).withValues(alpha: 0.3)
                              : const Color(0x14FFFFFF),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.pie_chart,
                          size: 16,
                          color: isDark
                              ? Colors.white
                              : const Color(0xFFF4F4F5),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        lang == 'ak' ? 'အကျဉ်းချုပ် (Overview)' : 'Overview',
                        style: TextStyle(
                          color:
                              isDark ? Colors.white70 : const Color(0xFFF4F4F5),
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Total Amount Label
                  Text(
                    lang == 'ak'
                        ? 'စုစုပေါင်း ပမာဏ (Total Amount)'
                        : 'Total Amount',
                    style: TextStyle(
                      color: isDark ? Colors.white60 : const Color(0xFFF4F4F5),
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Total Balance with AKD symbol
                  FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        const Text(
                          '₳ ',
                          style: TextStyle(
                            color: Color(0xFFF4F4F5),
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          totalBalance.toStringAsFixed(2),
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            color:
                                isDark ? Colors.white : const Color(0xFFF4F4F5),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Pie Chart with Red (Wallet) & Yellow (USD)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.04)
                          : const Color(0x14FFFFFF),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.06)
                            : const Color(0x26FFFFFF),
                      ),
                    ),
                    child: Row(
                      children: [
                        CustomMiniPieChart(
                          values: (akdBalance <= 0 && usdBalance <= 0)
                              ? const [0.5, 0.5]
                              : [
                                  akdBalance > 0 ? akdBalance : 0.0001,
                                  usdBalance > 0 ? usdBalance : 0.0001,
                                ],
                          colors: const [
                            const Color(0x14FFFFFF), // Red for Wallet
                            const Color(0x14FFFFFF), // Yellow for USD
                          ],
                          size: 78,
                          strokeWidth: 12,
                          centerWidget: const ArakanEmblem(size: 24),
                        ),
                        const SizedBox(width: 18),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 10,
                                    height: 10,
                                    decoration: const BoxDecoration(
                                      color: const Color(0x14FFFFFF),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      'Wallet: ₳ ${akdBalance.toStringAsFixed(2)} (${(akdPercent * 100).toStringAsFixed(1)}%)',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: isDark
                                            ? Colors.white
                                            : const Color(0xFFF4F4F5),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  Container(
                                    width: 10,
                                    height: 10,
                                    decoration: const BoxDecoration(
                                      color: const Color(0x14FFFFFF),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      'USD: \$ ${usdBalance.toStringAsFixed(2)} (${(usdPercent * 100).toStringAsFixed(1)}%)',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: isDark
                                            ? Colors.white
                                            : const Color(0xFFF4F4F5),
                                      ),
                                    ),
                                  ),
                                ],
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
            const SizedBox(height: 20),

            // ═════════════════════════════════════════════════════════════════
            // 2. PETHAR WALLET (AKD) CARD
            // ═════════════════════════════════════════════════════════════════
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? Colors.white : Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.08)
                      : Colors.grey[200]!,
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.white.withValues(alpha: 0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header with Arakan Emblem, Title and Copyable UID
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const ArakanEmblem(size: 26),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                lang == 'ak'
                                    ? 'ဖေ့သာ ပိုက်ဆံအိတ်'
                                    : 'Pethar wallet',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: isDark ? Colors.white : Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  Text(
                                    userUid,
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 11,
                                      color: Colors.grey,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  InkWell(
                                    onTap: () {
                                      Clipboard.setData(
                                          ClipboardData(text: userUid));
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        const SnackBar(
                                          content:
                                              Text('UID copied to clipboard!'),
                                          duration: Duration(seconds: 1),
                                        ),
                                      );
                                    },
                                    child: const Padding(
                                      padding: EdgeInsets.all(2.0),
                                      child: Icon(Icons.copy_rounded,
                                          size: 13, color: Colors.grey),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.3)),
                        ),
                        child: const Text(
                          'ACTIVE',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 10),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // Middle Row: Available Balance on Left, Mini Pie Chart on Right
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              lang == 'ak'
                                  ? 'ရရှိနိုင်သော လက်ကျန်ငွေ'
                                  : 'Available Balance',
                              style: const TextStyle(
                                  fontSize: 11,
                                  color: Colors.grey,
                                  fontWeight: FontWeight.w500),
                            ),
                            const SizedBox(height: 4),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              alignment: Alignment.centerLeft,
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Text(
                                    '₳ ',
                                    style: TextStyle(
                                      color: Color(0xFFF4F4F5),
                                      fontSize: 22,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                  Text(
                                    akdBalance.toStringAsFixed(2),
                                    style: TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 24,
                                      fontWeight: FontWeight.w900,
                                      color: isDark
                                          ? Colors.white
                                          : Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Mini Pie Chart with Green (Available), Yellow (Pending), Blue (Total)
                      CustomMiniPieChart(
                        values: (akdBalance <= 0 && akdPending <= 0)
                            ? const [0.70, 0.15, 0.15]
                            : [
                                akdBalance > 0 ? akdBalance : 0.0001,
                                akdPending > 0 ? akdPending : 0.0001,
                                (akdTotal > 0 ? akdTotal : 1.0) * 0.15,
                              ],
                        colors: const [
                          Colors.white, // Crimson: Available
                          const Color(0x14FFFFFF), // Slate: Pending
                          const Color(0x14FFFFFF), // Charcoal: Total
                        ],
                        size: 64,
                        strokeWidth: 9,
                        centerWidget: const Text(
                          '₳',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Legend for Crimson (Available), Slate (Pending), Charcoal (Total)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.04)
                          : const Color(0x14FFFFFF),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.06)
                            : const Color(0x26FFFFFF),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                    color: Colors.white, shape: BoxShape.circle)),
                            const SizedBox(width: 5),
                            Text(
                              'Available: ₳ ${akdBalance.toStringAsFixed(2)}',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: isDark
                                      ? Colors.white70
                                      : const Color(0xFFF4F4F5)),
                            ),
                          ],
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                    color: const Color(0x14FFFFFF),
                                    shape: BoxShape.circle)),
                            const SizedBox(width: 5),
                            Text(
                              'Pending: ₳ ${akdPending.toStringAsFixed(2)}',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: isDark
                                      ? Colors.white70
                                      : const Color(0xFFF4F4F5)),
                            ),
                          ],
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                    color: const Color(0x14FFFFFF),
                                    shape: BoxShape.circle)),
                            const SizedBox(width: 5),
                            Text(
                              'Total: ₳ ${akdTotal.toStringAsFixed(2)}',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: isDark
                                      ? Colors.white
                                      : const Color(0xFFF4F4F5)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // ═════════════════════════════════════════════════════════════════
            // 3. USD ACCOUNT CARD
            // ═════════════════════════════════════════════════════════════════
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? Colors.white : Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.08)
                      : Colors.grey[200]!,
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.white.withValues(alpha: 0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header with USD Icon, Title, and Copyable Wallet Address
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.12),
                              shape: BoxShape.circle,
                            ),
                            child: const Center(
                              child: Text(
                                '\$',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                lang == 'ak'
                                    ? 'ယူအက်စ်ဒီ အကောင့်'
                                    : 'USD Account',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: isDark ? Colors.white : Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  Text(
                                    usdWalletShort,
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 11,
                                      color: Colors.grey,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  InkWell(
                                    onTap: () {
                                      Clipboard.setData(ClipboardData(
                                          text: usdWalletAddress));
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        const SnackBar(
                                          content: Text(
                                              'USD wallet address copied to clipboard!'),
                                          duration: Duration(seconds: 1),
                                        ),
                                      );
                                    },
                                    child: const Padding(
                                      padding: EdgeInsets.all(2.0),
                                      child: Icon(Icons.copy_rounded,
                                          size: 13, color: Colors.grey),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.3)),
                        ),
                        child: const Text(
                          'ON-CHAIN',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 10),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // Middle Row: Available Balance on Left, Mini Pie Chart on Right
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              lang == 'ak'
                                  ? 'ရရှိနိုင်သော လက်ကျန်ငွေ'
                                  : 'Available Balance',
                              style: const TextStyle(
                                  fontSize: 11,
                                  color: Colors.grey,
                                  fontWeight: FontWeight.w500),
                            ),
                            const SizedBox(height: 4),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              alignment: Alignment.centerLeft,
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Text(
                                    '\$ ',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 22,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                  Text(
                                    usdBalance.toStringAsFixed(2),
                                    style: TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: usdBalance >= 1000000 ? 20 : 24,
                                      fontWeight: FontWeight.w900,
                                      color: isDark
                                          ? Colors.white
                                          : Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Mini Pie Chart with Crimson (Available), Slate (Pending), Charcoal (Total)
                      CustomMiniPieChart(
                        values: (usdBalance <= 0 && usdPending <= 0)
                            ? const [0.70, 0.15, 0.15]
                            : [
                                usdBalance > 0 ? usdBalance : 0.0001,
                                usdPending > 0 ? usdPending : 0.0001,
                                (usdTotal > 0 ? usdTotal : 1.0) * 0.15,
                              ],
                        colors: const [
                          Colors.white, // Crimson: Available
                          const Color(0x14FFFFFF), // Slate: Pending
                          const Color(0x14FFFFFF), // Charcoal: Total
                        ],
                        size: 64,
                        strokeWidth: 9,
                        centerWidget: const Text(
                          '\$',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Legend for Crimson (Available), Slate (Pending), Charcoal (Total)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.04)
                          : const Color(0x14FFFFFF),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.06)
                            : const Color(0x26FFFFFF),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                    color: Colors.white, shape: BoxShape.circle)),
                            const SizedBox(width: 5),
                            Text(
                              'Available: \$ ${usdBalance.toStringAsFixed(2)}',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: isDark
                                      ? Colors.white70
                                      : const Color(0xFFF4F4F5)),
                            ),
                          ],
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                    color: const Color(0x14FFFFFF),
                                    shape: BoxShape.circle)),
                            const SizedBox(width: 5),
                            Text(
                              'Pending: \$ ${usdPending.toStringAsFixed(2)}',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: isDark
                                      ? Colors.white70
                                      : const Color(0xFFF4F4F5)),
                            ),
                          ],
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                    color: const Color(0x14FFFFFF),
                                    shape: BoxShape.circle)),
                            const SizedBox(width: 5),
                            Text(
                              'Total: \$ ${usdTotal.toStringAsFixed(2)}',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: isDark
                                      ? Colors.white
                                      : const Color(0xFFF4F4F5)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
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
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    if (total <= 0) {
      final paint = Paint()
        ..color = colors.isNotEmpty
            ? colors.first.withValues(alpha: 0.3)
            : Colors.grey.withValues(alpha: 0.2)
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth;
      canvas.drawCircle(center, radius, paint);
      return;
    }

    double startAngle = -math.pi / 2;
    final gap = values.where((v) => v > 0).length > 1 ? 0.08 : 0.0;

    for (int i = 0; i < values.length; i++) {
      if (values[i] <= 0) continue;
      final sweepAngle = (values[i] / total) * 2 * math.pi;
      final paint = Paint()
        ..color = colors[i % colors.length]
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle > gap ? sweepAngle - gap : sweepAngle,
        false,
        paint,
      );

      startAngle += sweepAngle;
    }
  }

  @override
  bool shouldRepaint(covariant _PieChartPainter oldDelegate) => true;
}
