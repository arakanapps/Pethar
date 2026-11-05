import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pethar_mobile/app_state.dart';
import 'package:pethar_mobile/models/crypto_wallet.dart';
import 'package:pethar_mobile/screens/crypto_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    FlutterSecureStorage.setMockInitialValues({});
  });

  group('Multi-chain USDT/USDC wallet models & validation', () {
    test('default 5 networks include ETH, TRON, BSC, POLYGON, SOLANA and disable USDC on TRON', () {
      expect(
        defaultCryptoNetworks.map((n) => n.code).toList(),
        equals(['TRON', 'ETHEREUM', 'BSC', 'POLYGON', 'SOLANA']),
      );

      final tron = defaultCryptoNetworks.firstWhere((n) => n.code == 'TRON');
      expect(tron.token('USDT')?.depositEnabled, isTrue);
      expect(tron.token('USDC')?.depositEnabled, isFalse);
      expect(tron.token('USDC')?.withdrawalEnabled, isFalse);

      for (final code in ['ETHEREUM', 'BSC', 'POLYGON', 'SOLANA']) {
        final net = defaultCryptoNetworks.firstWhere((n) => n.code == code);
        expect(net.token('USDT')?.depositEnabled, isTrue);
        expect(net.token('USDC')?.depositEnabled, isTrue);
      }
    });

    test('address format validator checks EVM, TRON, and SOLANA addresses', () {
      expect(
        isValidChainAddressFormat(
            'EVM', '0x9858effd232b4033e47d90003d41ec34ecaeda94'),
        isTrue,
      );
      expect(
        isValidChainAddressFormat(
            'EVM', '0x0000000000000000000000000000000000000000'),
        isFalse,
      );
      expect(
        isValidChainAddressFormat(
            'TRON', 'TUEZSdKsoDHQMeZwihtdoBiN46zxhGWYdH'),
        isTrue,
      );
      expect(
        isValidChainAddressFormat(
            'SOLANA', 'HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk'),
        isTrue,
      );
      expect(isValidChainAddressFormat('TRON', '0x1234'), isFalse);
    });

    test('CryptoWalletState.fromJson parses balances, networks, deposits, and withdrawals', () {
      final state = CryptoWalletState.fromJson({
        'kyc_tier': 2,
        'balances': {'USDT': '125.50', 'USDC': '40.25'},
        'networks': [
          {
            'code': 'TRON',
            'name': 'Tron',
            'family': 'TRON',
            'standard': 'TRC-20',
            'confirmations': 20,
            'explorer_tx_url': 'https://tronscan.org/#/transaction/',
            'address': 'TUEZSdKsoDHQMeZwihtdoBiN46zxhGWYdH',
            'tokens': [
              {
                'symbol': 'USDT',
                'contract': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
                'decimals': 6,
                'min_deposit': 1,
                'min_withdrawal': 10,
                'withdrawal_fee': 1.5,
                'deposit_enabled': true,
                'withdrawal_enabled': true,
              }
            ],
          }
        ],
        'deposits': [
          {
            'id': 'dep-1',
            'network_code': 'TRON',
            'token_symbol': 'USDT',
            'tx_hash': 'abc123',
            'to_address': 'TUEZSdKsoDHQMeZwihtdoBiN46zxhGWYdH',
            'amount': '50.00',
            'status': 'CREDITED',
            'created_at': '2026-11-05T10:00:00Z',
          }
        ],
        'withdrawals': [
          {
            'id': 'wd-1',
            'network_code': 'TRON',
            'token_symbol': 'USDC'.replaceFirst('C', 'T'),
            'to_address': 'TUEZSdKsoDHQMeZwihtdoBiN46zxhGWYdH',
            'amount': '20.00',
            'fee': '1.50',
            'total_debit': '21.50',
            'status': 'PENDING_REVIEW',
            'created_at': '2026-11-05T11:00:00Z',
          }
        ],
      });

      expect(state.kycTier, 2);
      expect(state.usdtBalance, 125.50);
      expect(state.usdcBalance, 40.25);
      expect(state.totalUsdBalance, 165.75);
      expect(state.isProvisioned, isTrue);
      expect(state.deposits, hasLength(1));
      expect(state.withdrawals, hasLength(1));
    });

    testWidgets('CryptoScreen renders 5 networks and provisioned deposit address',
        (WidgetTester tester) async {
      final appState = AppState();
      appState.isVerified = true;
      appState.cryptoWallet = CryptoWalletState(
        kycTier: 2,
        usdtBalance: 100.0,
        usdcBalance: 50.0,
        networks: defaultCryptoNetworks
            .map((n) => CryptoNetworkInfo(
                  code: n.code,
                  name: n.name,
                  family: n.family,
                  standard: n.standard,
                  confirmations: n.confirmations,
                  explorerTxUrl: n.explorerTxUrl,
                  address: n.family == 'TRON'
                      ? 'TUEZSdKsoDHQMeZwihtdoBiN46zxhGWYdH'
                      : (n.family == 'SOLANA'
                          ? 'HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk'
                          : '0x9858effd232b4033e47d90003d41ec34ecaeda94'),
                  tokens: n.tokens,
                ))
            .toList(),
      );

      await tester.pumpWidget(
        ChangeNotifierProvider<AppState>.value(
          value: appState,
          child: const MaterialApp(
            home: CryptoScreen(),
          ),
        ),
      );
      await tester.pump();

      expect(find.text('Tron'), findsOneWidget);
      expect(find.text('Ethereum'), findsOneWidget);
      expect(find.text('BNB Smart Chain'), findsOneWidget);
      expect(find.text('Polygon PoS'), findsOneWidget);
      expect(find.text('Solana'), findsOneWidget);
      expect(
        find.text('TUEZSdKsoDHQMeZwihtdoBiN46zxhGWYdH'),
        findsOneWidget,
      );
    });
  });
}
