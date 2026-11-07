import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../app_state.dart';
import '../models/crypto_wallet.dart';
import '../theme.dart';
import '../widgets/pin_prompt.dart';
import '../widgets/support_and_kyc_modals.dart';

/// Multi-chain custodial USDT / USDC wallet screen supporting 5 networks:
/// Tron (TRC-20), Ethereum (ERC-20), BNB Smart Chain (BEP-20),
/// Polygon PoS (ERC-20), and Solana (SPL).
class CryptoScreen extends StatefulWidget {
  final bool embedded;
  final int initialTab;
  final String initialToken;
  final VoidCallback? onBack;

  const CryptoScreen({
    Key? key,
    this.embedded = false,
    this.initialTab = 0,
    this.initialToken = 'USDT',
    this.onBack,
  }) : super(key: key);

  @override
  State<CryptoScreen> createState() => _CryptoScreenState();
}

class _CryptoScreenState extends State<CryptoScreen> {
  late int _activeTab; // 0: Receive, 1: Withdraw, 2: Activity
  late String _selectedToken; // 'USDT' | 'USDC'
  String _selectedNetworkCode = 'TRON';
  bool _attemptedAutoProvision = false;
  bool _submittingWithdrawal = false;
  bool _copiedAddress = false;

  final TextEditingController _addressCtrl = TextEditingController();
  final TextEditingController _amountCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _activeTab = widget.initialTab.clamp(0, 2);
    _selectedToken =
        widget.initialToken.toUpperCase() == 'USDC' ? 'USDC' : 'USDT';
    if (_selectedToken == 'USDC' && _selectedNetworkCode == 'TRON') {
      _selectedNetworkCode = 'ETHEREUM';
    }
    WidgetsBinding.instance.addPostFrameCallback((_) => _initWallet());
  }

  Future<void> _initWallet() async {
    if (!mounted) return;
    final appState = Provider.of<AppState>(context, listen: false);
    await appState.refreshCryptoWallet();
    if (!mounted) return;
    if ((appState.isVerified || appState.cryptoWallet.kycTier >= 2) &&
        !appState.cryptoWallet.isProvisioned &&
        !_attemptedAutoProvision) {
      _attemptedAutoProvision = true;
      await appState.provisionCryptoAddresses();
    }
  }

  @override
  void dispose() {
    _addressCtrl.dispose();
    _amountCtrl.dispose();
    super.dispose();
  }

  Color _networkAccent(String code) {
    switch (code.toUpperCase()) {
      case 'TRON':
        return const Color(0xFFEF0027);
      case 'ETHEREUM':
        return const Color(0xFF627EEA);
      case 'BSC':
        return const Color(0xFFF0B90B);
      case 'POLYGON':
        return const Color(0xFF8247E5);
      case 'SOLANA':
        return const Color(0xFF14F195);
      default:
        return paynoBlue;
    }
  }

  String _networkBadgeText(String code) {
    switch (code.toUpperCase()) {
      case 'TRON':
        return 'TRX';
      case 'ETHEREUM':
        return 'ETH';
      case 'BSC':
        return 'BNB';
      case 'POLYGON':
        return 'POL';
      case 'SOLANA':
        return 'SOL';
      default:
        return code;
    }
  }

  String _addressHintForFamily(String family) {
    switch (family.toUpperCase()) {
      case 'TRON':
        return 'T... (Tron TRC-20 address)';
      case 'SOLANA':
        return 'Solana SPL wallet address';
      default:
        return '0x... (EVM wallet address)';
    }
  }

  void _copyText(BuildContext context, String value, String message) {
    Clipboard.setData(ClipboardData(text: value));
    setState(() => _copiedAddress = true);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: emeraldSuccess,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copiedAddress = false);
    });
  }

  Future<void> _handleProvisionAddresses(
      BuildContext context, AppState appState, bool isAk) async {
    final res = await appState.provisionCryptoAddresses();
    if (!context.mounted) return;
    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isAk
                ? 'ကွန်ရက် ၅ ခုလုံးအတွက် ငွေသွင်းလိပ်စာများ ထုတ်ပေးပြီးပါပြီ'
                : 'Deposit addresses assigned for all 5 networks',
          ),
          backgroundColor: emeraldSuccess,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            res['message']?.toString() ??
                (isAk
                    ? 'လိပ်စာ ထုတ်ပေးရာတွင် အမှားရှိနေပါသည်'
                    : 'Unable to assign deposit addresses'),
          ),
          backgroundColor: crimson,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _handleSubmitWithdrawal(
    BuildContext context,
    AppState appState,
    CryptoNetworkInfo network,
    CryptoTokenConfig tokenCfg,
    bool isAk,
  ) async {
    if (_submittingWithdrawal) return;
    final messenger = ScaffoldMessenger.of(context);
    final toAddr = _addressCtrl.text.trim();
    final rawAmt = double.tryParse(_amountCtrl.text.trim()) ?? 0.0;
    final available = appState.cryptoWallet.balanceFor(_selectedToken);

    if (!isValidChainAddressFormat(network.family, toAddr)) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            isAk
                ? '${network.name} လိပ်စာ ပုံစံ မမှန်ကန်ပါ'
                : 'Enter a valid ${network.name} (${network.standard}) address',
          ),
          backgroundColor: crimson,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    if (rawAmt < tokenCfg.minWithdrawal) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            isAk
                ? 'အနည်းဆုံး ငွေထုတ်ပမာဏမှာ ${tokenCfg.minWithdrawal.toStringAsFixed(2)} $_selectedToken ဖြစ်ပါသည်'
                : 'Minimum withdrawal on ${network.name} is ${tokenCfg.minWithdrawal.toStringAsFixed(2)} $_selectedToken',
          ),
          backgroundColor: crimson,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final totalDebit = rawAmt + tokenCfg.withdrawalFee;
    if (totalDebit > available) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            isAk
                ? '$_selectedToken လက်ကျန်ငွေ မလုံလောက်ပါ (ပမာဏ + ကွန်ရက်ကြေး ${tokenCfg.withdrawalFee} $_selectedToken)'
                : 'Insufficient $_selectedToken balance (requires ${totalDebit.toStringAsFixed(2)} $_selectedToken including ${tokenCfg.withdrawalFee} fee)',
          ),
          backgroundColor: crimson,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final pin = await showPinPrompt(
      context,
      isAk: isAk,
      title: isAk ? 'ငွေထုတ်ခြင်း အတည်ပြုပါ' : 'Confirm Withdrawal',
      subtitle: isAk
          ? '${rawAmt.toStringAsFixed(2)} $_selectedToken (${network.name}) ထုတ်ယူရန် ၆ လုံး PIN ထည့်ပါ။'
          : 'Withdraw ${rawAmt.toStringAsFixed(2)} $_selectedToken on ${network.name} (${network.standard}). Fee: ${tokenCfg.withdrawalFee} $_selectedToken.',
    );
    if (pin == null || pin.length != 6 || !context.mounted) return;

    setState(() => _submittingWithdrawal = true);
    try {
      final result = await appState.requestCryptoWithdrawal(
        network: network.code,
        token: _selectedToken,
        toAddress: toAddr,
        amount: rawAmt,
        pin: pin,
      );
      if (!context.mounted) return;
      if (result['success'] == true) {
        _amountCtrl.clear();
        _addressCtrl.clear();
        setState(() => _activeTab = 2);
        messenger.showSnackBar(
          SnackBar(
            content: Text(
              isAk
                  ? 'ငွေထုတ်ယူမှု တင်သွင်းပြီးပါပြီ (PENDING_REVIEW)'
                  : 'Withdrawal submitted for review (PENDING_REVIEW)',
            ),
            backgroundColor: emeraldSuccess,
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else {
        messenger.showSnackBar(
          SnackBar(
            content: Text(
              result['message']?.toString() ??
                  (isAk ? 'ငွေထုတ်ယူမှု မအောင်မြင်ပါ' : 'Withdrawal failed'),
            ),
            backgroundColor: crimson,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _submittingWithdrawal = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAk = appState.language == 'ak';
    final wallet = appState.cryptoWallet;
    final networks =
        wallet.networks.isNotEmpty ? wallet.networks : defaultCryptoNetworks;
    final selectedNetwork = networks.firstWhere(
      (n) => n.code == _selectedNetworkCode,
      orElse: () => networks.first,
    );
    final tokenCfg = selectedNetwork.token(_selectedToken);
    final unlocked = appState.isVerified || wallet.kycTier >= 2;
    final fmt = NumberFormat('#,##0.00', 'en_US');

    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      appBar: AppBar(
        backgroundColor: trueBlack,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        automaticallyImplyLeading: !widget.embedded || widget.onBack != null,
        leading: (widget.embedded && widget.onBack == null)
            ? null
            : IconButton(
                icon: const Icon(Icons.arrow_back, color: Color(0xFF111111)),
                onPressed: widget.onBack ?? () => appState.goBack(),
              ),
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: crimson,
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: const Text(
                '\$',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 15,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Text(
              isAk ? 'USDT / USDC ပိုက်ဆံအိတ်' : 'USDT · USDC Wallet',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF111111),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: isAk ? 'ပြန်လည်ရယူရန်' : 'Refresh',
            onPressed: appState.isLoadingCryptoWallet
                ? null
                : () => appState.refreshCryptoWallet(),
            icon: appState.isLoadingCryptoWallet
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh_rounded, color: Color(0xFF3F3F46)),
          ),
        ],
      ),
      body: ListView(
          padding: EdgeInsets.fromLTRB(
            16,
            16,
            16,
            widget.embedded ? 110 : 32,
          ),
          children: [
            _buildBalanceOverviewCard(context, appState, wallet, fmt, isAk),
            const SizedBox(height: 14),
            _buildModeTabs(isAk),
            const SizedBox(height: 14),
            if (_activeTab == 0)
              _buildReceiveSection(
                context,
                appState,
                networks,
                selectedNetwork,
                tokenCfg,
                unlocked,
                isAk,
              )
            else if (_activeTab == 1)
              _buildWithdrawSection(
                context,
                appState,
                networks,
                selectedNetwork,
                tokenCfg,
                unlocked,
                fmt,
                isAk,
              )
            else
              _buildActivitySection(context, wallet, fmt, isAk),
          ],
        ),
    );
  }

  Widget _buildBalanceOverviewCard(
    BuildContext context,
    AppState appState,
    CryptoWalletState wallet,
    NumberFormat fmt,
    bool isAk,
  ) {
    final hidden = appState.walletBalanceHidden;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF262626)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF111111).withValues(alpha: 0.04),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isAk
                    ? 'စုစုပေါင်း Stablecoin လက်ကျန် (၅ ကွန်ရက်)'
                    : 'Total Stablecoin Balance · 5 Networks',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFD4D4D8),
                ),
              ),
              GestureDetector(
                onTap: () => appState.toggleWalletBalance(),
                child: Icon(
                  hidden
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  size: 18,
                  color: const Color(0xFFD4D4D8),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            hidden ? '••••••' : '\$${fmt.format(wallet.totalUsdBalance)}',
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
              color: Color(0xFF09090B),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _buildTokenBalanceTile(
                  symbol: 'USDT',
                  subtitle: 'Tether USD',
                  badge: '₮',
                  color: const Color(0xFF26A17B),
                  balance: wallet.usdtBalance,
                  hidden: hidden,
                  selected: _selectedToken == 'USDT',
                  fmt: fmt,
                  onTap: () => setState(() => _selectedToken = 'USDT'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildTokenBalanceTile(
                  symbol: 'USDC',
                  subtitle: 'USD Coin',
                  badge: '\$',
                  color: const Color(0xFF2775CA),
                  balance: wallet.usdcBalance,
                  hidden: hidden,
                  selected: _selectedToken == 'USDC',
                  fmt: fmt,
                  onTap: () {
                    setState(() {
                      _selectedToken = 'USDC';
                      if (_selectedNetworkCode == 'TRON') {
                        _selectedNetworkCode = 'ETHEREUM';
                      }
                    });
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
            decoration: BoxDecoration(
              color: const Color(0xFF1A0A0C),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified_user_outlined,
                    size: 15, color: crimson),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    isAk
                        ? '၁.၀၀ ₳ = ၁.၀၀ USD · ETH, TRON, BSC, Polygon, Solana ကွန်ရက် ၅ ခု'
                        : '1.00 AKD = 1.00 USD · Unified ledger across ETH, Tron, BSC, Polygon & Solana',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: crimson,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTokenBalanceTile({
    required String symbol,
    required String subtitle,
    required String badge,
    required Color color,
    required double balance,
    required bool hidden,
    required bool selected,
    required NumberFormat fmt,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: selected
              ? color.withValues(alpha: 0.08)
              : const Color(0xFF0A0A0A),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? color : const Color(0xFF27272A),
            width: selected ? 1.8 : 1,
          ),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 15,
              backgroundColor: color,
              child: Text(
                badge,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                ),
              ),
            ),
            const SizedBox(width: 9),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    symbol,
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0A0A0A),
                    ),
                  ),
                  Text(
                    hidden ? '••••' : fmt.format(balance),
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      fontFamily: 'monospace',
                      color: Color(0xFF09090B),
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 10,
                      color: Color(0xFFD4D4D8),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModeTabs(bool isAk) {
    final labels = [
      isAk ? 'လက်ခံရန် (Receive)' : 'Receive',
      isAk ? 'ထုတ်ယူရန် (Withdraw)' : 'Withdraw',
      isAk ? 'မှတ်တမ်း (Activity)' : 'Activity',
    ];
    final icons = [
      Icons.qr_code_2_rounded,
      Icons.north_east_rounded,
      Icons.receipt_long_rounded,
    ];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF262626)),
      ),
      child: Row(
        children: List.generate(labels.length, (i) {
          final active = _activeTab == i;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _activeTab = i),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: active ? crimson : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      icons[i],
                      size: 15,
                      color: active ? Colors.white : const Color(0xFFD4D4D8),
                    ),
                    const SizedBox(width: 5),
                    Flexible(
                      child: Text(
                        labels[i],
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color:
                              active ? Colors.white : const Color(0xFFD4D4D8),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildNetworkPicker(
    List<CryptoNetworkInfo> networks,
    CryptoNetworkInfo selected,
    bool isAk, {
    required bool forWithdrawal,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFF262626)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isAk
                    ? 'ကွန်ရက် ရွေးချယ်ပါ (၅ ခု)'
                    : 'Select Network (5 Networks)',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0A0A0A),
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF111111),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '${selected.standard} · ${selected.family}',
                  style: const TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w800,
                    fontFamily: 'monospace',
                    color: Color(0xFF3F3F46),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: networks.map((net) {
              final isSelected = net.code == selected.code;
              final tok = net.token(_selectedToken);
              final enabled = forWithdrawal
                  ? (tok?.withdrawalEnabled ?? false)
                  : (tok?.depositEnabled ?? false);
              final accent = _networkAccent(net.code);
              return GestureDetector(
                onTap: () => setState(() => _selectedNetworkCode = net.code),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 160),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 11,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? accent.withValues(alpha: 0.12)
                        : (enabled
                            ? const Color(0xFF0A0A0A)
                            : const Color(0xFF111111)),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isSelected ? accent : const Color(0xFF27272A),
                      width: isSelected ? 1.8 : 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          color: enabled ? accent : const Color(0xFF3F3F46),
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          _networkBadgeText(net.code),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 8.5,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      const SizedBox(width: 7),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            net.name,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: enabled
                                  ? const Color(0xFF0A0A0A)
                                  : const Color(0xFF3F3F46),
                            ),
                          ),
                          Text(
                            !enabled
                                ? '${net.standard} · Disabled'
                                : (forWithdrawal && tok != null
                                    ? '${net.standard} · Fee ${tok.withdrawalFee} $_selectedToken'
                                    : net.standard),
                            style: const TextStyle(
                              fontSize: 10,
                              fontFamily: 'monospace',
                              color: Color(0xFFD4D4D8),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildReceiveSection(
    BuildContext context,
    AppState appState,
    List<CryptoNetworkInfo> networks,
    CryptoNetworkInfo selectedNetwork,
    CryptoTokenConfig? tokenCfg,
    bool unlocked,
    bool isAk,
  ) {
    if (!unlocked) {
      return _buildKycLockedCard(context, appState, isAk);
    }

    final depositAllowed = tokenCfg?.depositEnabled == true;
    final address = selectedNetwork.address?.trim() ?? '';

    return Column(
      children: [
        _buildNetworkPicker(
          networks,
          selectedNetwork,
          isAk,
          forWithdrawal: false,
        ),
        const SizedBox(height: 14),
        if (!depositAllowed)
          _buildDisabledTokenNetworkBanner(selectedNetwork, isAk)
        else if (address.isEmpty)
          _buildProvisionAddressCard(context, appState, isAk)
        else
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF0A0A0A),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF262626)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 14,
                          backgroundColor: _selectedToken == 'USDC'
                              ? const Color(0xFF2775CA)
                              : const Color(0xFF26A17B),
                          child: Text(
                            _selectedToken == 'USDC' ? '\$' : '₮',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '$_selectedToken on ${selectedNetwork.name}',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0A0A0A),
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0A0A0A),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        selectedNetwork.standard,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF27272A),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0A0A0A),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF27272A)),
                  ),
                  child: QrImageView(
                    data: address,
                    version: QrVersions.auto,
                    size: 196,
                  ),
                ),
                const SizedBox(height: 14),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF000000),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF262626)),
                  ),
                  child: SelectableText(
                    address,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF111111),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton.icon(
                    onPressed: () => _copyText(
                      context,
                      address,
                      isAk
                          ? '${selectedNetwork.name} လိပ်စာ ကူးယူပြီးပါပြီ'
                          : '${selectedNetwork.name} deposit address copied',
                    ),
                    icon: Icon(
                      _copiedAddress ? Icons.check : Icons.copy_rounded,
                      size: 17,
                    ),
                    label: Text(
                      _copiedAddress
                          ? (isAk ? 'ကူးယူပြီးပါပြီ' : 'Copied!')
                          : (isAk ? 'လိပ်စာ ကူးယူရန်' : 'Copy Deposit Address'),
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: crimson,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A1400),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF78350F)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildInfoRow(
                        isAk ? 'အနည်းဆုံး ငွေသွင်းပမာဏ' : 'Minimum deposit',
                        '${tokenCfg!.minDeposit.toStringAsFixed(2)} $_selectedToken',
                      ),
                      const SizedBox(height: 4),
                      _buildInfoRow(
                        isAk ? 'အတည်ပြုချက် အရေအတွက်' : 'Required confirmations',
                        selectedNetwork.confirmations == 0
                            ? 'Finalized (~15s)'
                            : '${selectedNetwork.confirmations} blocks',
                      ),
                      if (selectedNetwork.family == 'EVM') ...[
                        const SizedBox(height: 4),
                        _buildInfoRow(
                          isAk ? 'EVM လိပ်စာ တူညီမှု' : 'Shared EVM address',
                          'Ethereum · BSC · Polygon',
                        ),
                      ],
                      const SizedBox(height: 8),
                      Text(
                        isAk
                            ? 'သတိပြုရန် — ဤလိပ်စာသို့ ${selectedNetwork.name} (${selectedNetwork.standard}) ကွန်ရက်ဖြင့် $_selectedToken ကိုသာ ပေးပို့ပါ။ အခြား ဒင်္ဂါး သို့မဟုတ် ကွန်ရက်မှားယွင်းပေးပို့ပါက ဆုံးရှုံးနိုင်ပါသည်။'
                            : 'Send only $_selectedToken on ${selectedNetwork.name} (${selectedNetwork.standard}) to this address. Deposits below ${tokenCfg.minDeposit.toStringAsFixed(2)} $_selectedToken are not credited.',
                        style: const TextStyle(
                          fontSize: 11.5,
                          height: 1.4,
                          color: Color(0xFF92400E),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildWithdrawSection(
    BuildContext context,
    AppState appState,
    List<CryptoNetworkInfo> networks,
    CryptoNetworkInfo selectedNetwork,
    CryptoTokenConfig? tokenCfg,
    bool unlocked,
    NumberFormat fmt,
    bool isAk,
  ) {
    if (!unlocked) {
      return _buildKycLockedCard(context, appState, isAk);
    }

    final withdrawAllowed = tokenCfg?.withdrawalEnabled == true;
    final available = appState.cryptoWallet.balanceFor(_selectedToken);
    final enteredAmount = double.tryParse(_amountCtrl.text.trim()) ?? 0.0;
    final fee = tokenCfg?.withdrawalFee ?? 0.0;
    final totalDebit = enteredAmount > 0 ? enteredAmount + fee : 0.0;

    return Column(
      children: [
        _buildNetworkPicker(
          networks,
          selectedNetwork,
          isAk,
          forWithdrawal: true,
        ),
        const SizedBox(height: 14),
        if (!withdrawAllowed)
          _buildDisabledTokenNetworkBanner(selectedNetwork, isAk)
        else
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF0A0A0A),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF262626)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAk
                      ? '${selectedNetwork.name} (${selectedNetwork.standard}) လက်ခံမည့် လိပ်စာ'
                      : 'Recipient ${selectedNetwork.name} (${selectedNetwork.standard}) Address',
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0A0A0A),
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _addressCtrl,
                  onChanged: (_) => setState(() {}),
                  style: const TextStyle(
                    fontSize: 13,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w700,
                  ),
                  decoration: InputDecoration(
                    hintText: _addressHintForFamily(selectedNetwork.family),
                    hintStyle: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF3F3F46),
                    ),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 13,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFF262626)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFF262626)),
                    ),
                    suffixIcon: IconButton(
                      tooltip: isAk ? 'Paste' : 'Paste',
                      icon: const Icon(Icons.content_paste_rounded, size: 18),
                      onPressed: () async {
                        final data = await Clipboard.getData('text/plain');
                        if (data?.text != null) {
                          setState(() => _addressCtrl.text = data!.text!.trim());
                        }
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isAk
                          ? 'ထုတ်ယူမည့် ပမာဏ ($_selectedToken)'
                          : 'Withdrawal Amount ($_selectedToken)',
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0A0A0A),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        final maxSend =
                            (available - fee).clamp(0.0, double.infinity);
                        setState(
                          () => _amountCtrl.text = maxSend.toStringAsFixed(2),
                        );
                      },
                      child: Text(
                        '${isAk ? "လက်ကျန်" : "Available"}: ${fmt.format(available)} $_selectedToken (Max)',
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.w800,
                          color: crimson,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _amountCtrl,
                  onChanged: (_) => setState(() {}),
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  style: const TextStyle(
                    fontSize: 17,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w800,
                  ),
                  decoration: InputDecoration(
                    hintText:
                        'Min ${tokenCfg!.minWithdrawal.toStringAsFixed(2)} $_selectedToken',
                    suffixText: _selectedToken,
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 13,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFF262626)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFF262626)),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF000000),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF262626)),
                  ),
                  child: Column(
                    children: [
                      _buildInfoRow(
                        isAk ? 'ကွန်ရက်' : 'Network',
                        '${selectedNetwork.name} (${selectedNetwork.standard})',
                      ),
                      const SizedBox(height: 4),
                      _buildInfoRow(
                        isAk ? 'အနည်းဆုံး ထုတ်ယူပမာဏ' : 'Minimum withdrawal',
                        '${tokenCfg.minWithdrawal.toStringAsFixed(2)} $_selectedToken',
                      ),
                      const SizedBox(height: 4),
                      _buildInfoRow(
                        isAk ? 'ကွန်ရက်ကြေး' : 'Network fee',
                        '${fee.toStringAsFixed(2)} $_selectedToken',
                      ),
                      const Divider(height: 14),
                      _buildInfoRow(
                        isAk ? 'စုစုပေါင်း နှုတ်ယူမည့်ပမာဏ' : 'Total debit',
                        '${totalDebit.toStringAsFixed(2)} $_selectedToken',
                        bold: true,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _submittingWithdrawal
                        ? null
                        : () => _handleSubmitWithdrawal(
                              context,
                              appState,
                              selectedNetwork,
                              tokenCfg,
                              isAk,
                            ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: crimson,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: _submittingWithdrawal
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            isAk
                                ? '$_selectedToken ထုတ်ယူမည် (PIN အတည်ပြု)'
                                : 'Withdraw $_selectedToken',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildActivitySection(
    BuildContext context,
    CryptoWalletState wallet,
    NumberFormat fmt,
    bool isAk,
  ) {
    final hasAny =
        wallet.deposits.isNotEmpty || wallet.withdrawals.isNotEmpty;
    if (!hasAny) {
      return Container(
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: const Color(0xFF0A0A0A),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: const Color(0xFF262626)),
        ),
        child: Column(
          children: [
            const Icon(
              Icons.receipt_long_outlined,
              size: 40,
              color: Color(0xFF3F3F46),
            ),
            const SizedBox(height: 10),
            Text(
              isAk
                  ? 'USDT / USDC ငွေသွင်း・ငွေထုတ် မှတ်တမ်း မရှိသေးပါ'
                  : 'No on-chain deposits or withdrawals yet',
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w700,
                color: Color(0xFFD4D4D8),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (wallet.withdrawals.isNotEmpty) ...[
          Text(
            isAk ? 'ငွေထုတ်ယူမှုများ (Withdrawals)' : 'Withdrawals',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0A0A0A),
            ),
          ),
          const SizedBox(height: 8),
          ...wallet.withdrawals.map((w) => _buildWithdrawalItem(context, w, fmt)),
          const SizedBox(height: 16),
        ],
        if (wallet.deposits.isNotEmpty) ...[
          Text(
            isAk ? 'ငွေသွင်းမှုများ (Deposits)' : 'On-Chain Deposits',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0A0A0A),
            ),
          ),
          const SizedBox(height: 8),
          ...wallet.deposits.map((d) => _buildDepositItem(context, d, fmt)),
        ],
      ],
    );
  }

  Widget _buildWithdrawalItem(
    BuildContext context,
    CryptoWithdrawalRecord w,
    NumberFormat fmt,
  ) {
    final isConfirmed = w.status == 'CONFIRMED';
    final isRejected = w.status == 'REJECTED' || w.status == 'FAILED';
    final badgeColor = isConfirmed
        ? emeraldSuccess
        : (isRejected ? crimson : const Color(0xFFD97706));
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF262626)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      '${w.tokenSymbol} · ${w.networkCode}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0A0A0A),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 7,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: badgeColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        w.status,
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w800,
                          color: badgeColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'To: ${w.toAddress}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: Color(0xFFD4D4D8),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '-${fmt.format(w.amount)} ${w.tokenSymbol}',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  fontFamily: 'monospace',
                  color: Color(0xFF0A0A0A),
                ),
              ),
              Text(
                'Fee ${w.fee} ${w.tokenSymbol}',
                style: const TextStyle(
                  fontSize: 10.5,
                  fontFamily: 'monospace',
                  color: Color(0xFF3F3F46),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDepositItem(
    BuildContext context,
    CryptoDepositRecord d,
    NumberFormat fmt,
  ) {
    final credited = d.status == 'CREDITED';
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF262626)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${d.tokenSymbol} · ${d.networkCode}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0A0A0A),
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  'Tx: ${d.txHash}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: Color(0xFFD4D4D8),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '+${fmt.format(d.amount)} ${d.tokenSymbol}',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  fontFamily: 'monospace',
                  color: credited ? emeraldSuccess : const Color(0xFFD97706),
                ),
              ),
              Text(
                d.status,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFD4D4D8),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKycLockedCard(
      BuildContext context, AppState appState, bool isAk) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFF262626)),
      ),
      child: Column(
        children: [
          const Icon(Icons.lock_outline_rounded,
              size: 40, color: Color(0xFF3F3F46)),
          const SizedBox(height: 12),
          Text(
            isAk ? 'KYC Level 2 လိုအပ်ပါသည်' : 'KYC Level 2 Required',
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0A0A0A),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isAk
                ? 'ကွန်ရက် ၅ ခုလုံးတွင် USDT နှင့် USDC လက်ခံနိုင်၊ ထုတ်ယူနိုင်ရန် KYC Level 2 အတည်ပြုချက် ရယူပါ။'
                : 'Complete KYC Level 2 verification to unlock deposit addresses and withdrawals across Ethereum, Tron, BNB Smart Chain, Polygon, and Solana.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12.5,
              height: 1.45,
              color: Color(0xFFD4D4D8),
            ),
          ),
          const SizedBox(height: 14),
          ElevatedButton(
            onPressed: () => showVerificationRequiredDialog(
              context,
              appState,
              'USDT / USDC Wallet',
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: crimson,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(999),
              ),
            ),
            child: Text(
              isAk ? 'KYC အတည်ပြုရန်' : 'Complete KYC Level 2',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProvisionAddressCard(
      BuildContext context, AppState appState, bool isAk) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFF262626)),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.account_balance_wallet_outlined,
            size: 38,
            color: crimson,
          ),
          const SizedBox(height: 10),
          Text(
            isAk
                ? 'ကွန်ရက် ၅ ခုအတွက် ငွေသွင်းလိပ်စာ ရယူရန်'
                : 'Activate Your 5-Network Deposit Addresses',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14.5,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0A0A0A),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            isAk
                ? 'Ethereum, Tron, BNB Smart Chain, Polygon နှင့် Solana တို့အတွက် သီးသန့် ငွေသွင်းလိပ်စာများ ထုတ်ပေးပါမည်။'
                : 'Assigns your dedicated EVM (Ethereum, BSC, Polygon), Tron (TRC-20), and Solana (SPL) deposit addresses.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              height: 1.4,
              color: Color(0xFFD4D4D8),
            ),
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton(
              onPressed: appState.isLoadingCryptoWallet
                  ? null
                  : () => _handleProvisionAddresses(context, appState, isAk),
              style: ElevatedButton.styleFrom(
                backgroundColor: crimson,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: Text(
                isAk ? 'လိပ်စာများ ရယူမည်' : 'Generate Deposit Addresses',
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDisabledTokenNetworkBanner(
      CryptoNetworkInfo network, bool isAk) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1400),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF78350F)),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.info_outline_rounded,
            color: Color(0xFFD97706),
            size: 28,
          ),
          const SizedBox(height: 8),
          Text(
            isAk
                ? '$_selectedToken ကို ${network.name} တွင် ပိတ်ထားပါသည်'
                : '$_selectedToken on ${network.name} (${network.standard}) is Disabled',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 13.5,
              fontWeight: FontWeight.w800,
              color: Color(0xFF92400E),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            isAk
                ? 'Circle သည် ၂၀၂၄ ခုနှစ်တွင် Tron ပေါ်ရှိ USDC ကို ရပ်ဆိုင်းခဲ့သဖြင့် USDC အတွက် Ethereum, BNB Smart Chain, Polygon သို့မဟုတ် Solana ကို ရွေးချယ်ပါ။'
                : 'Circle discontinued native USDC on Tron in 2024. Please select Ethereum, BNB Smart Chain, Polygon, or Solana for USDC, or switch to USDT on Tron.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              height: 1.4,
              color: Color(0xFFB45309),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool bold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: bold ? FontWeight.w800 : FontWeight.w600,
            color: const Color(0xFFD4D4D8),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 11.5,
            fontFamily: 'monospace',
            fontWeight: bold ? FontWeight.w900 : FontWeight.w700,
            color: const Color(0xFF0A0A0A),
          ),
        ),
      ],
    );
  }
}
