import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import '../widgets/arakan_emblem.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    return Scaffold(
      backgroundColor: isDark ? obsidian : paper,
      appBar: AppBar(
        title: Text(
          lang == 'arak' ? 'မိမိ ငွေစာရင်းများနှင့် ကတ်များ' : 'My Accounts & Cards',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: isDark ? surfaceDark : Colors.white,
        elevation: 0,
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Primary Account Card ──────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                gradient: const LinearGradient(
                  colors: [Color(0xFF2D0A0E), Color(0xFF1A1218), Color(0xFF111A28)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border.all(color: gold.withOpacity(0.4), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.4),
                    blurRadius: 15,
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
                          const Icon(Icons.account_balance_wallet, size: 16, color: gold),
                          const SizedBox(width: 8),
                          Text(
                            lang == 'arak' ? 'အာရက္ခဒေါ်လာ အဓိကစာရင်း' : 'Arakan Dollar Account',
                            style: const TextStyle(color: goldLight, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: emeraldSuccess.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: emeraldSuccess.withOpacity(0.4)),
                        ),
                        child: const Text(
                          'ACTIVE',
                          style: TextStyle(color: emeraldSuccess, fontWeight: FontWeight.bold, fontSize: 10),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    appState.profile.petharId,
                    style: TextStyle(fontFamily: 'monospace', color: Colors.grey[400], fontSize: 11),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Text('₳ ', style: TextStyle(color: gold, fontSize: 26, fontWeight: FontWeight.bold)),
                      Text(
                        appState.wallet.balance.toStringAsFixed(2),
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 30,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'AKD',
                        style: TextStyle(color: gold.withOpacity(0.8), fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Container(
                    height: 1,
                    color: Colors.white.withOpacity(0.1),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => appState.navigate(Screen.send),
                          icon: const Icon(Icons.arrow_outward, size: 16, color: Colors.black),
                          label: Text(
                            lang == 'arak' ? 'ငွေလွှဲမည်' : 'Send Money',
                            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: gold,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => appState.navigate(Screen.receive),
                          icon: const Icon(Icons.arrow_downward, size: 16, color: Colors.white),
                          label: Text(
                            lang == 'arak' ? 'ငွေလက်ခံမည်' : 'Deposit',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                          style: OutlinedButton.styleFrom(
                            backgroundColor: Colors.white.withOpacity(0.08),
                            side: BorderSide(color: Colors.white.withOpacity(0.2)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Visa Debit Card Section ──────────────────────────────────
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.credit_card, size: 16, color: gold),
                    const SizedBox(width: 8),
                    Text(
                      lang == 'arak' ? 'ဖေ့သာ ဒစ်ဂျစ်တယ်ကတ်' : 'PeThar Debit Card',
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

            // ── Recent Activity ──────────────────────────────────────────
            Text(
              lang == 'arak' ? 'လတ်တလော ငွေစာရင်းမှတ်တမ်း' : 'Recent Transactions',
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
                            lang == 'arak' ? tx.titleMm : tx.title,
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
