import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../app_state.dart';
import '../theme.dart';

/// USD account (USDT + USDC).
///
/// The wallet address is read from the signed-in user's profile. Nothing is
/// bundled: if the account is not unlocked (KYC Level 2) no address is shown.
class CryptoScreen extends StatelessWidget {
  const CryptoScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAk = appState.language == 'ak';
    final address = appState.profile.usdAccountWalletAddress.trim();
    final unlocked = address.isNotEmpty && appState.isVerified;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        title: Text(
          isAk ? 'USD အကောင့်' : 'USD account',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
          onPressed: () => appState.goBack(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.currency_exchange_rounded, color: emeraldSuccess, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isAk ? 'USD လက်ကျန်ငွေ' : 'USD balance',
                            style: const TextStyle(fontSize: 12, color: Color(0xFF71717A)),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            NumberFormat('#,##0.00').format(appState.usdAccountBalance),
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF18181B)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF1F2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    isAk ? '၁.၀၀ ₳ = ၁.၀၀ ဒေါ်လာ (ပုံသေငွေလဲနှုန်း)' : '1.00 AKD = 1.00 USD (1.00 ₳ = \$1.00)',
                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: crimson),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (!unlocked)
            _LockedCard(isAk: isAk)
          else
            _AddressCard(address: address, isAk: isAk),
        ],
      ),
    );
  }
}

class _LockedCard extends StatelessWidget {
  final bool isAk;
  const _LockedCard({required this.isAk});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          const Icon(Icons.lock_outline_rounded, size: 40, color: Color(0xFFA1A1AA)),
          const SizedBox(height: 12),
          Text(
            isAk ? 'USD အကောင့် မဖွင့်ရသေးပါ' : 'USD account is locked',
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
          ),
          const SizedBox(height: 8),
          Text(
            isAk
                ? 'KYC Level 2 အတည်ပြုချက် ရရှိပြီးပါက USDT နှင့် USDC လက်ခံနိုင်၊ လွှဲနိုင်ပါမည်။'
                : 'Complete KYC Level 2 to receive and send USDT and USDC.',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12.5, height: 1.45, color: Color(0xFF71717A)),
          ),
        ],
      ),
    );
  }
}

class _AddressCard extends StatelessWidget {
  final String address;
  final bool isAk;
  const _AddressCard({required this.address, required this.isAk});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Text(
            isAk ? 'USDT / USDC လက်ခံရန် လိပ်စာ' : 'USDT / USDC deposit address',
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF18181B)),
          ),
          const SizedBox(height: 16),
          QrImageView(data: address, version: QrVersions.auto, size: 170),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    address,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 10.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF0F172A),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.copy_rounded, size: 18, color: Color(0xFF2563EB)),
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: address));
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(isAk ? 'လိပ်စာ ကူးယူပြီးပါပြီ' : 'Address copied'),
                        backgroundColor: emeraldSuccess,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
