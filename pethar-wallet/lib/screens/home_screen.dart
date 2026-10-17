import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../widgets/arakan_emblem.dart';
import '../widgets/support_and_kyc_modals.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  void _runVerifiedAction(BuildContext context, AppState appState, String label, VoidCallback onAllowed) {
    if (!appState.isAuthenticated) {
      showSignInSignUpModal(context, appState);
      return;
    }
    if (!appState.isVerified) {
      showVerificationRequiredDialog(context, appState, label);
      return;
    }
    onAllowed();
  }

  Widget _buildLandmarkArrowIcon({required bool isDown}) {
    return SizedBox(
      width: 26,
      height: 26,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.center,
        children: [
          const Icon(Icons.account_balance_rounded, color: crimson, size: 22),
          Positioned(
            right: -2,
            bottom: -2,
            child: Container(
              width: 13,
              height: 13,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: Icon(
                isDown ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                color: crimson,
                size: 10,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final lang = appState.language;
    final isAk = lang == 'ak';
    final currencyFmt = NumberFormat('#,##0.00', 'en_US');

    final homeActions = [
      {
        'label': isAk ? 'ငွေပေးချေ' : 'Pay',
        'iconWidget': const ScanBracketIcon(size: 23, color: crimson, strokeWidth: 2.5),
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေပေးချေရန် (Pay)' : 'Pay',
              () => appState.navigate(Screen.scan),
            ),
      },
      {
        'label': isAk ? 'ငွေလက်ခံ' : 'Receive',
        'iconWidget': const Icon(Icons.qr_code_2_rounded, color: crimson, size: 24),
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေလက်ခံရန် (Receive)' : 'Receive',
              () => appState.navigate(Screen.receive),
            ),
      },
      {
        'label': isAk ? 'ငွေသွင်း' : 'Deposit',
        'iconWidget': _buildLandmarkArrowIcon(isDown: true),
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေသွင်းရန် (Deposit)' : 'Deposit',
              () => appState.navigate(Screen.notifications, financialView: 'deposit'),
            ),
      },
      {
        'label': isAk ? 'ငွေထုတ်' : 'Withdraw',
        'iconWidget': _buildLandmarkArrowIcon(isDown: false),
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေထုတ်ရန် (Withdraw)' : 'Withdraw',
              () => appState.navigate(Screen.notifications, financialView: 'withdraw'),
            ),
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Container(
        constraints: const BoxConstraints.expand(),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFFFF5F5), Color(0xFFF8FAFC), Color(0xFFF4F6F9)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 110),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header: Clean Péthar "P" Logo on Left + Live Chat Button on Right
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    GestureDetector(
                      onTap: () => appState.navigate(Screen.home),
                      child: const SizedBox(
                        width: 40,
                        height: 40,
                        child: Center(child: ArakanEmblem(size: 38)),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => showPetharSupportChatSheet(context, isAk),
                      child: Container(
                        height: 38,
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: const Color(0xFFE4E4E7)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.03),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.headset_mic_rounded, size: 16, color: crimson),
                            const SizedBox(width: 6),
                            Text(
                              isAk ? 'ချက်တင်' : 'Chat',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF27272A),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Logged-in Welcome Back Card (only shown when authenticated)
                if (appState.isAuthenticated) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(26),
                      border: Border.all(color: const Color(0xFFF4F4F5)),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0F172A).withValues(alpha: 0.05),
                          blurRadius: 26,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: LinearGradient(
                                    colors: [Color(0xFF38BDF8), Color(0xFF0284C7)],
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                  ),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  appState.profile.name.isNotEmpty ? appState.profile.name[0].toUpperCase() : 'J',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 18,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      isAk ? 'ပြန်လည်ကြိုဆိုပါသည်၊' : 'Welcome back,',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Color(0xFFA1A1AA),
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      appState.profile.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        color: Color(0xFF18181B),
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () => showKycVerificationModal(context, appState),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 6),
                            decoration: BoxDecoration(
                              color: appState.isVerified ? const Color(0xFFF0F9FF) : const Color(0xFFFFF1F2),
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(
                                color: appState.isVerified
                                    ? const Color(0xFF0284C7).withValues(alpha: 0.5)
                                    : crimson,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  appState.isVerified ? Icons.check_circle_rounded : Icons.error_outline_rounded,
                                  size: 15,
                                  color: appState.isVerified ? const Color(0xFF0284C7) : crimson,
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  appState.isVerified
                                      ? (isAk ? 'အတည်ပြုပြီး' : 'Verified')
                                      : (isAk ? 'အတည်မပြုရသေး' : 'Unverified'),
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
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
                  if (!appState.isVerified) ...[
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF1F2),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFFFECDD3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline_rounded, color: crimson, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isAk ? 'အကောင့်အတည်ပြုရန် လိုအပ်ပါသည်' : 'Account Verification Required',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                    color: crimson,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  isAk
                                      ? 'ငွေပေးချေခြင်း၊ လက်ခံခြင်း၊ ငွေသွင်း/ငွေထုတ် လုပ်ဆောင်ချက်များကို အသုံးပြုရန် သင့်အကောင့်ကို အတည်ပြုပေးပါ။'
                                      : 'Please verify your identity to unlock Pay, Receive, Deposit, and Withdraw.',
                                  style: const TextStyle(fontSize: 11.5, color: Color(0xFF27272A), height: 1.35),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () => showKycVerificationModal(context, appState),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: crimson,
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                isAk ? 'အတည်ပြုမည်' : 'Verify',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 18),
                ],

                // Unified 4-Action Card (Pay | Receive | Deposit | Withdraw) + AKD Balance OR "Welcome to Péthar / Sign in/Sign up"
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: const Color(0xFFF4F4F5)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.06),
                        blurRadius: 32,
                        offset: const Offset(0, 12),
                      ),
                    ],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 22, 16, 20),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: homeActions.map((act) {
                            final label = act['label'] as String;
                            return GestureDetector(
                              behavior: HitTestBehavior.opaque,
                              onTap: act['onTap'] as VoidCallback,
                              child: Column(
                                children: [
                                  Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFFF1F2),
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Center(child: act['iconWidget'] as Widget),
                                  ),
                                  const SizedBox(height: 9),
                                  Text(
                                    label,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF18181B),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      const Divider(height: 1, color: Color(0xFFF4F4F5)),
                      if (appState.isAuthenticated)
                        Container(
                          width: double.infinity,
                          color: const Color(0xFFFAFAFA),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    isAk ? 'ပိုက်ဆံအိတ် လက်ကျန်ငွေ (AKD)' : 'Wallet Balance (AKD)',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF71717A),
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  GestureDetector(
                                    onTap: () => appState.toggleBalance(),
                                    child: Icon(
                                      appState.balanceHidden ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                      size: 16,
                                      color: const Color(0xFF71717A),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              if (appState.balanceHidden)
                                const Text(
                                  '******',
                                  style: TextStyle(
                                    fontSize: 26,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF18181B),
                                    fontFamily: 'monospace',
                                    letterSpacing: 3,
                                  ),
                                )
                              else
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.baseline,
                                  textBaseline: TextBaseline.alphabetic,
                                  children: [
                                    const Text(
                                      '₳ ',
                                      style: TextStyle(
                                        fontSize: 24,
                                        fontWeight: FontWeight.w900,
                                        color: crimson,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                    Text(
                                      currencyFmt.format(appState.wallet.balance),
                                      style: const TextStyle(
                                        fontSize: 30,
                                        fontWeight: FontWeight.w900,
                                        color: Color(0xFF09090B),
                                        fontFamily: 'monospace',
                                        letterSpacing: -0.5,
                                      ),
                                    ),
                                  ],
                                ),
                            ],
                          ),
                        )
                      else
                        buildWelcomeSignInCard(context, appState, embedded: true),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
