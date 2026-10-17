import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../widgets/arakan_emblem.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  void _showVerificationRequiredDialog(BuildContext context, AppState appState, String featureName) {
    final isAk = appState.language == 'ak';
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        backgroundColor: Colors.white,
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFFECDD3)),
              ),
              child: const Icon(Icons.error_outline_rounded, color: crimson, size: 30),
            ),
            const SizedBox(height: 16),
            Text(
              isAk ? 'အကောင့် အတည်ပြုရန် လိုအပ်ပါသည်' : 'Identity Verification Required',
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Colors.black87),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              isAk
                  ? 'သင်၏ အကောင့်သည် အတည်မပြုရသေးပါ (Unverified)။ "$featureName" နှင့် ငွေကြေးလုပ်ဆောင်ချက်များကို အသုံးပြုရန် အကောင့်အတည်ပြုပေးပါ။'
                  : 'Your account is currently Unverified. Please verify your identity to unlock "$featureName" and all wallet functions.',
              style: const TextStyle(fontSize: 12, color: Colors.black54, height: 1.4),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.black87,
                      side: const BorderSide(color: Colors.black26),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                    ),
                    child: Text(isAk ? 'နောက်မှ' : 'Later'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      appState.setVerified(true);
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(isAk ? 'အကောင့် အတည်ပြုပြီးပါပြီ (Verified)' : 'Account Verified Successfully!'),
                          backgroundColor: emeraldSuccess,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: crimson,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                    ),
                    child: Text(isAk ? 'အတည်ပြုမည်' : 'Verify Now'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showChatSupportSheet(BuildContext context, bool isAk) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.headset_mic_rounded, color: crimson),
                    const SizedBox(width: 8),
                    Text(
                      isAk ? 'Péthar တိုက်ရိုက် အကူအညီ' : 'Péthar Live Support',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.black87),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(ctx),
                  icon: const Icon(Icons.close, color: Colors.black54),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Text(
                isAk
                    ? 'မင်္ဂလာပါ! သင်၏ AKD ပိုက်ဆံအိတ် သို့မဟုတ် USD Account နှင့် ပတ်သက်၍ မည်သည့်အကူအညီ လိုအပ်ပါသလဲ?'
                    : 'Mingalaba! How can we help with your AKD Wallet or USD Account today?',
                style: const TextStyle(fontSize: 13, color: Colors.black87),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _runVerifiedAction(BuildContext context, AppState appState, String label, VoidCallback onAllowed) {
    if (!appState.isVerified) {
      _showVerificationRequiredDialog(context, appState, label);
      return;
    }
    onAllowed();
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final lang = appState.language;
    final isAk = lang == 'ak';

    final homeActions = [
      {'label': isAk ? 'ငွေပေးချေ' : 'Pay', 'icon': Icons.qr_code_scanner_rounded, 'target': Screen.scan},
      {'label': isAk ? 'ငွေလက်ခံ' : 'Receive', 'icon': Icons.qr_code_2_rounded, 'target': Screen.receive},
      {'label': isAk ? 'ငွေသွင်း' : 'Deposit', 'icon': Icons.account_balance_rounded, 'target': Screen.intl},
      {'label': isAk ? 'ငွေထုတ်' : 'Withdraw', 'icon': Icons.outbox_rounded, 'target': Screen.cashout},
    ];

    final fxRates = [
      {'code': 'AKD', 'buy': '1.00', 'sell': '1.00'},
      {'code': 'USD', 'buy': '1.00', 'sell': '1.00'},
      {'code': 'USDT', 'buy': '0.9985', 'sell': '1.0000'},
      {'code': 'SGD', 'buy': '0.7420', 'sell': '0.7485'},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Row: Clean Péthar Logo on Left + Live Chat Button on Right (No Notification Bell, No Black Box on Logo)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const SizedBox(
                    width: 40,
                    height: 40,
                    child: Center(child: ArakanEmblem(size: 36)),
                  ),
                  GestureDetector(
                    onTap: () => _showChatSupportSheet(context, isAk),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: Colors.black12),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.headset_mic_rounded, size: 16, color: crimson),
                          const SizedBox(width: 6),
                          Text(
                            isAk ? 'ချက်တင်' : 'Chat',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Welcome Back Card with Verified / Unverified Pill
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(26),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20, offset: const Offset(0, 6)),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: const Color(0xFF0284C7),
                          child: Text(
                            appState.profile.name.isNotEmpty ? appState.profile.name[0] : 'M',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isAk ? 'ပြန်လည်ကြိုဆိုပါသည်၊' : 'Welcome back,',
                              style: const TextStyle(fontSize: 12, color: Colors.black45, fontWeight: FontWeight.w500),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              appState.profile.name,
                              style: const TextStyle(fontSize: 16, color: Colors.black87, fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => appState.setVerified(!appState.isVerified),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: appState.isVerified ? const Color(0xFFF0F9FF) : const Color(0xFFFFF1F2),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: appState.isVerified ? const Color(0xFF0284C7) : crimson,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              appState.isVerified ? Icons.verified_rounded : Icons.error_outline_rounded,
                              size: 15,
                              color: appState.isVerified ? const Color(0xFF0284C7) : crimson,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              appState.isVerified
                                  ? (isAk ? 'အတည်ပြုပြီး' : 'Verified')
                                  : (isAk ? 'အတည်မပြုရသေး' : 'Unverified'),
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: appState.isVerified ? const Color(0xFF0284C7) : crimson,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Unified 4-Action Card (Pay | Receive | Deposit | Withdraw) + AKD Balance (₳)
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 24, offset: const Offset(0, 8)),
                  ],
                ),
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 20, 16, 18),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: homeActions.map((act) {
                          final label = act['label'] as String;
                          return GestureDetector(
                            onTap: () => _runVerifiedAction(context, appState, label, () {
                              appState.navigate(act['target'] as Screen);
                            }),
                            child: Column(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFF1F2),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Icon(act['icon'] as IconData, color: crimson, size: 22),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  label,
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.black87),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const Divider(height: 1),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    isAk ? 'ပိုက်ဆံအိတ် လက်ကျန်ငွေ (AKD)' : 'Wallet Balance (AKD)',
                                    style: const TextStyle(fontSize: 12, color: Colors.black54, fontWeight: FontWeight.w600),
                                  ),
                                  const SizedBox(width: 6),
                                  GestureDetector(
                                    onTap: () => appState.toggleBalance(),
                                    child: Icon(
                                      appState.balanceHidden ? Icons.visibility_off : Icons.visibility,
                                      size: 15,
                                      color: Colors.black45,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                appState.balanceHidden ? '******' : '₳ ${appState.wallet.balance.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.black,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                          GestureDetector(
                            onTap: () => appState.navigate(Screen.notifications),
                            child: Text(
                              isAk ? 'အသေးစိတ် ›' : 'View more ›',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: crimson),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Exchange Rates Section
              Text(
                isAk ? 'ငွေလဲလှယ်နှုန်းများ' : 'Exchange rates',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.black87),
              ),
              const SizedBox(height: 10),
              ...fxRates.map((fx) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(fx['code']!, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.black87)),
                      Text('Buy: ${fx['buy']}', style: const TextStyle(fontFamily: 'monospace', fontSize: 13, color: Colors.black87)),
                      Text('Sell: ${fx['sell']}', style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87)),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}
