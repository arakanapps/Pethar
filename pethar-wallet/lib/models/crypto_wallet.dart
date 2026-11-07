/// Multi-chain custodial USDT / USDC wallet models across 5 networks:
/// Ethereum (ERC-20), Tron (TRC-20), BNB Smart Chain (BEP-20),
/// Polygon PoS (ERC-20), and Solana (SPL).
class CryptoTokenConfig {
  final String symbol;
  final String contract;
  final int decimals;
  final double minDeposit;
  final double minWithdrawal;
  final double withdrawalFee;
  final bool depositEnabled;
  final bool withdrawalEnabled;

  const CryptoTokenConfig({
    required this.symbol,
    required this.contract,
    required this.decimals,
    required this.minDeposit,
    required this.minWithdrawal,
    required this.withdrawalFee,
    required this.depositEnabled,
    required this.withdrawalEnabled,
  });

  factory CryptoTokenConfig.fromJson(Map<String, dynamic> json) {
    return CryptoTokenConfig(
      symbol: (json['symbol'] ?? 'USDT').toString(),
      contract: (json['contract'] ?? '').toString(),
      decimals: int.tryParse(json['decimals']?.toString() ?? '6') ?? 6,
      minDeposit: double.tryParse(json['min_deposit']?.toString() ?? '1') ?? 1.0,
      minWithdrawal:
          double.tryParse(json['min_withdrawal']?.toString() ?? '10') ?? 10.0,
      withdrawalFee:
          double.tryParse(json['withdrawal_fee']?.toString() ?? '1') ?? 1.0,
      depositEnabled: json['deposit_enabled'] != false,
      withdrawalEnabled: json['withdrawal_enabled'] != false,
    );
  }
}

class CryptoNetworkInfo {
  final String code;
  final String name;
  final String family;
  final String standard;
  final int confirmations;
  final String explorerTxUrl;
  final String? address;
  final List<CryptoTokenConfig> tokens;

  const CryptoNetworkInfo({
    required this.code,
    required this.name,
    required this.family,
    required this.standard,
    required this.confirmations,
    required this.explorerTxUrl,
    this.address,
    this.tokens = const [],
  });

  bool get hasAddress => address != null && address!.trim().isNotEmpty;

  CryptoTokenConfig? token(String symbol) {
    for (final t in tokens) {
      if (t.symbol.toUpperCase() == symbol.toUpperCase()) return t;
    }
    return null;
  }

  factory CryptoNetworkInfo.fromJson(Map<String, dynamic> json) {
    final rawTokens = json['tokens'];
    final parsedTokens = rawTokens is List
        ? rawTokens
            .whereType<Map>()
            .map((e) => CryptoTokenConfig.fromJson(Map<String, dynamic>.from(e)))
            .toList()
        : <CryptoTokenConfig>[];
    final rawAddr = json['address']?.toString().trim();
    return CryptoNetworkInfo(
      code: (json['code'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      family: (json['family'] ?? 'EVM').toString(),
      standard: (json['standard'] ?? '').toString(),
      confirmations:
          int.tryParse(json['confirmations']?.toString() ?? '12') ?? 12,
      explorerTxUrl: (json['explorer_tx_url'] ?? '').toString(),
      address: (rawAddr != null && rawAddr.isNotEmpty) ? rawAddr : null,
      tokens: parsedTokens,
    );
  }
}

class CryptoDepositRecord {
  final String id;
  final String networkCode;
  final String tokenSymbol;
  final String txHash;
  final String? fromAddress;
  final String toAddress;
  final double amount;
  final String status;
  final int? blockNumber;
  final String createdAt;

  const CryptoDepositRecord({
    required this.id,
    required this.networkCode,
    required this.tokenSymbol,
    required this.txHash,
    this.fromAddress,
    required this.toAddress,
    required this.amount,
    required this.status,
    this.blockNumber,
    required this.createdAt,
  });

  factory CryptoDepositRecord.fromJson(Map<String, dynamic> json) {
    return CryptoDepositRecord(
      id: (json['id'] ?? '').toString(),
      networkCode: (json['network_code'] ?? '').toString(),
      tokenSymbol: (json['token_symbol'] ?? 'USDT').toString(),
      txHash: (json['tx_hash'] ?? '').toString(),
      fromAddress: json['from_address']?.toString(),
      toAddress: (json['to_address'] ?? '').toString(),
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0,
      status: (json['status'] ?? 'CREDITED').toString(),
      blockNumber: json['block_number'] != null
          ? int.tryParse(json['block_number'].toString())
          : null,
      createdAt: (json['created_at'] ?? '').toString(),
    );
  }
}

class CryptoWithdrawalRecord {
  final String id;
  final String networkCode;
  final String tokenSymbol;
  final String toAddress;
  final double amount;
  final double fee;
  final double totalDebit;
  final String status;
  final String? txHash;
  final String? reviewNote;
  final String? failureReason;
  final String createdAt;

  const CryptoWithdrawalRecord({
    required this.id,
    required this.networkCode,
    required this.tokenSymbol,
    required this.toAddress,
    required this.amount,
    required this.fee,
    required this.totalDebit,
    required this.status,
    this.txHash,
    this.reviewNote,
    this.failureReason,
    required this.createdAt,
  });

  factory CryptoWithdrawalRecord.fromJson(Map<String, dynamic> json) {
    final amt = double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0;
    final fee = double.tryParse(json['fee']?.toString() ?? '0') ?? 0.0;
    return CryptoWithdrawalRecord(
      id: (json['id'] ?? '').toString(),
      networkCode: (json['network_code'] ?? '').toString(),
      tokenSymbol: (json['token_symbol'] ?? 'USDT').toString(),
      toAddress: (json['to_address'] ?? '').toString(),
      amount: amt,
      fee: fee,
      totalDebit:
          double.tryParse(json['total_debit']?.toString() ?? '') ?? (amt + fee),
      status: (json['status'] ?? 'PENDING_REVIEW').toString(),
      txHash: json['tx_hash']?.toString(),
      reviewNote: json['review_note']?.toString(),
      failureReason: json['failure_reason']?.toString(),
      createdAt: (json['created_at'] ?? '').toString(),
    );
  }
}

class CryptoWalletState {
  final int kycTier;
  final double usdtBalance;
  final double usdcBalance;
  final List<CryptoNetworkInfo> networks;
  final List<CryptoDepositRecord> deposits;
  final List<CryptoWithdrawalRecord> withdrawals;

  const CryptoWalletState({
    this.kycTier = 1,
    this.usdtBalance = 0.0,
    this.usdcBalance = 0.0,
    this.networks = const [],
    this.deposits = const [],
    this.withdrawals = const [],
  });

  CryptoWalletState copyWith({
    int? kycTier,
    double? usdtBalance,
    double? usdcBalance,
    List<CryptoNetworkInfo>? networks,
    List<CryptoDepositRecord>? deposits,
    List<CryptoWithdrawalRecord>? withdrawals,
  }) {
    return CryptoWalletState(
      kycTier: kycTier ?? this.kycTier,
      usdtBalance: usdtBalance ?? this.usdtBalance,
      usdcBalance: usdcBalance ?? this.usdcBalance,
      networks: networks ?? this.networks,
      deposits: deposits ?? this.deposits,
      withdrawals: withdrawals ?? this.withdrawals,
    );
  }

  double get totalUsdBalance => usdtBalance + usdcBalance;

  double balanceFor(String symbol) =>
      symbol.toUpperCase() == 'USDC' ? usdcBalance : usdtBalance;

  bool get isProvisioned => networks.any((n) => n.hasAddress);

  CryptoNetworkInfo? networkByCode(String code) {
    for (final n in networks) {
      if (n.code.toUpperCase() == code.toUpperCase()) return n;
    }
    return networks.isNotEmpty ? networks.first : null;
  }

  String? get primaryEvmAddress {
    for (final n in networks) {
      if (n.family == 'EVM' && n.hasAddress) return n.address;
    }
    for (final n in networks) {
      if (n.hasAddress) return n.address;
    }
    return null;
  }

  factory CryptoWalletState.fromJson(Map<String, dynamic> json) {
    final balances = json['balances'] is Map
        ? Map<String, dynamic>.from(json['balances'] as Map)
        : const <String, dynamic>{};
    final rawNetworks = json['networks'];
    final parsedNetworks = rawNetworks is List
        ? rawNetworks
            .whereType<Map>()
            .map((e) => CryptoNetworkInfo.fromJson(Map<String, dynamic>.from(e)))
            .toList()
        : <CryptoNetworkInfo>[];
    final rawDeposits = json['deposits'];
    final parsedDeposits = rawDeposits is List
        ? rawDeposits
            .whereType<Map>()
            .map((e) =>
                CryptoDepositRecord.fromJson(Map<String, dynamic>.from(e)))
            .toList()
        : <CryptoDepositRecord>[];
    final rawWithdrawals = json['withdrawals'];
    final parsedWithdrawals = rawWithdrawals is List
        ? rawWithdrawals
            .whereType<Map>()
            .map((e) =>
                CryptoWithdrawalRecord.fromJson(Map<String, dynamic>.from(e)))
            .toList()
        : <CryptoWithdrawalRecord>[];

    return CryptoWalletState(
      kycTier: int.tryParse(json['kyc_tier']?.toString() ?? '1') ?? 1,
      usdtBalance: double.tryParse(balances['USDT']?.toString() ?? '0') ?? 0.0,
      usdcBalance: double.tryParse(balances['USDC']?.toString() ?? '0') ?? 0.0,
      networks:
          parsedNetworks.isNotEmpty ? parsedNetworks : defaultCryptoNetworks,
      deposits: parsedDeposits,
      withdrawals: parsedWithdrawals,
    );
  }

  static CryptoWalletState fallback() =>
      const CryptoWalletState(networks: defaultCryptoNetworks);
}

/// Default 5-network catalog matching `20261105000001_multichain_stablecoin_wallet.sql`.
const List<CryptoNetworkInfo> defaultCryptoNetworks = [
  CryptoNetworkInfo(
    code: 'TRON',
    name: 'Tron',
    family: 'TRON',
    standard: 'TRC-20',
    confirmations: 20,
    explorerTxUrl: 'https://tronscan.org/#/transaction/',
    tokens: [
      CryptoTokenConfig(
        symbol: 'USDT',
        contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        decimals: 6,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 1.5,
        depositEnabled: true,
        withdrawalEnabled: true,
      ),
      CryptoTokenConfig(
        symbol: 'USDC',
        contract: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
        decimals: 6,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 1.5,
        depositEnabled: false,
        withdrawalEnabled: false,
      ),
    ],
  ),
  CryptoNetworkInfo(
    code: 'ETHEREUM',
    name: 'Ethereum',
    family: 'EVM',
    standard: 'ERC-20',
    confirmations: 12,
    explorerTxUrl: 'https://etherscan.io/tx/',
    tokens: [
      CryptoTokenConfig(
        symbol: 'USDT',
        contract: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        decimals: 6,
        minDeposit: 10,
        minWithdrawal: 20,
        withdrawalFee: 5.0,
        depositEnabled: true,
        withdrawalEnabled: true,
      ),
      CryptoTokenConfig(
        symbol: 'USDC',
        contract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
        minDeposit: 10,
        minWithdrawal: 20,
        withdrawalFee: 5.0,
        depositEnabled: true,
        withdrawalEnabled: true,
      ),
    ],
  ),
  CryptoNetworkInfo(
    code: 'BSC',
    name: 'BNB Smart Chain',
    family: 'EVM',
    standard: 'BEP-20',
    confirmations: 15,
    explorerTxUrl: 'https://bscscan.com/tx/',
    tokens: [
      CryptoTokenConfig(
        symbol: 'USDT',
        contract: '0x55d398326f99059ff775485246999027b3197955',
        decimals: 18,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 0.3,
        depositEnabled: true,
        withdrawalEnabled: true,
      ),
      CryptoTokenConfig(
        symbol: 'USDC',
        contract: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        decimals: 18,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 0.3,
        depositEnabled: true,
        withdrawalEnabled: true,
      ),
    ],
  ),
  CryptoNetworkInfo(
    code: 'POLYGON',
    name: 'Polygon PoS',
    family: 'EVM',
    standard: 'ERC-20',
    confirmations: 64,
    explorerTxUrl: 'https://polygonscan.com/tx/',
    tokens: [
      CryptoTokenConfig(
        symbol: 'USDT',
        contract: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        decimals: 6,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 0.3,
        depositEnabled: true,
        withdrawalEnabled: true,
      ),
      CryptoTokenConfig(
        symbol: 'USDC',
        contract: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        decimals: 6,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 0.3,
        depositEnabled: true,
        withdrawalEnabled: true,
      ),
    ],
  ),
  CryptoNetworkInfo(
    code: 'SOLANA',
    name: 'Solana',
    family: 'SOLANA',
    standard: 'SPL',
    confirmations: 0,
    explorerTxUrl: 'https://solscan.io/tx/',
    tokens: [
      CryptoTokenConfig(
        symbol: 'USDT',
        contract: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        decimals: 6,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 0.5,
        depositEnabled: true,
        withdrawalEnabled: true,
      ),
      CryptoTokenConfig(
        symbol: 'USDC',
        contract: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        decimals: 6,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 0.5,
        depositEnabled: true,
        withdrawalEnabled: true,
      ),
    ],
  ),
];

/// Client-side format check before calling the server-side EIP-55/Base58check validator.
bool isValidChainAddressFormat(String family, String address) {
  final trimmed = address.trim();
  switch (family.toUpperCase()) {
    case 'EVM':
      if (!RegExp(r'^0x[0-9a-fA-F]{40}$').hasMatch(trimmed)) return false;
      return !RegExp(r'^0x0+$').hasMatch(trimmed);
    case 'TRON':
      return RegExp(r'^T[1-9A-HJ-NP-Za-km-z]{33}$').hasMatch(trimmed);
    case 'SOLANA':
      return RegExp(r'^[1-9A-HJ-NP-Za-km-z]{32,44}$').hasMatch(trimmed);
    default:
      return false;
  }
}
