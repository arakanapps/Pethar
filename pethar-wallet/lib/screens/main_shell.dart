import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import '../widgets/arakan_emblem.dart';
import '../widgets/support_and_kyc_modals.dart';
import 'home_screen.dart';
import 'account_screen.dart';
import 'scan_screen.dart';
import 'pay_screen.dart';
import 'services_screen.dart';
import 'settings_screen.dart';
import 'send_screen.dart';
import 'receive_screen.dart';
import 'intl_screen.dart';
import 'crypto_screen.dart';
import 'history_screen.dart';
import 'favourites_screen.dart';
import 'auth_screen.dart';
import 'wallet_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({Key? key}) : super(key: key);

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  bool _showSplash = true;
  final String _selectedDepositToken = 'USDT';
  final String _selectedSendToken = 'USDT';

  // Wallet address and recovery phrase are sourced from the authenticated user profile — not stored locally

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1400), () {
      if (mounted) {
        setState(() => _showSplash = false);
      }
    });
  }

  Widget _buildSplashScreen() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => setState(() => _showSplash = false),
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 112,
                height: 112,
                child: Center(child: ArakanEmblem(size: 96)),
              ),
              SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Péthar',
                    style: TextStyle(
                      color: crimson,
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.8,
                    ),
                  ),
                  SizedBox(width: 8),
                  Text(
                    'ဖေ့သာ',
                    style: TextStyle(
                      color: Color(0xFF18181B),
                      fontSize: 36,
                      fontWeight: FontWeight.w300,
                      letterSpacing: -0.8,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSingleAccountUsdCryptoWallet(
      BuildContext context, AppState appState, String lang) {
    return const WalletScreen();
  }

  @override
  Widget build(BuildContext context) {
    if (_showSplash) {
      return _buildSplashScreen();
    }

    final appState = Provider.of<AppState>(context);

    if (!appState.isAuthenticated) {
      return const AuthScreen();
    }

    final lang = appState.language;

    const systemOverlay = SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.dark,
      systemNavigationBarDividerColor: Colors.transparent,
      systemNavigationBarContrastEnforced: false,
    );

    // Sub-screens routing with explicit SystemUiOverlayStyle
    Widget? subScreen;
    if (appState.currentScreen == Screen.send) subScreen = const SendScreen();
    if (appState.currentScreen == Screen.receive) {
      subScreen = const ReceiveScreen();
    }
    if (appState.currentScreen == Screen.intl) subScreen = const IntlScreen();
    if (appState.currentScreen == Screen.crypto) {
      subScreen = CryptoScreen(
        initialTab: appState.financialSubView == 'withdraw' ? 1 : 0,
        initialToken: appState.financialSubView == 'withdraw'
            ? _selectedSendToken
            : _selectedDepositToken,
      );
    }
    if (appState.currentScreen == Screen.scan) subScreen = const ScanScreen();
    if (appState.currentScreen == Screen.pay) subScreen = const PayScreen();
    if (appState.currentScreen == Screen.history) {
      subScreen = const HistoryScreen();
    }
    if (appState.currentScreen == Screen.favourites) {
      subScreen = const FavouritesScreen();
    }
    if (appState.currentScreen == Screen.account) {
      subScreen = const AccountScreen();
    }

    if (subScreen != null) {
      return AnnotatedRegion<SystemUiOverlayStyle>(
        value: systemOverlay,
        child: subScreen,
      );
    }

    int currentIndex = 0;
    switch (appState.currentScreen) {
      case Screen.home:
        currentIndex = 0;
        break;
      case Screen.notifications:
        currentIndex = 1;
        break;
      case Screen.scan:
        currentIndex = 2;
        break;
      case Screen.services:
        currentIndex = 3;
        break;
      case Screen.settings:
        currentIndex = 4;
        break;
      default:
        currentIndex = 0;
    }

    Widget body;
    switch (currentIndex) {
      case 0:
        body = const HomeScreen();
        break;
      case 1:
        body = _buildSingleAccountUsdCryptoWallet(context, appState, lang);
        break;
      case 3:
        body = const ServicesScreen();
        break;
      case 4:
        body = const SettingsScreen();
        break;
      default:
        body = const HomeScreen();
    }

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: systemOverlay,
      child: Scaffold(
        extendBody: true,
        backgroundColor: const Color(0xFFF4F5F8),
        body: body,
        bottomNavigationBar: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
                child: Container(
                  height: 68,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.95),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: Colors.white,
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.06),
                        blurRadius: 18,
                        offset: const Offset(0, 4),
                      ),
                      BoxShadow(
                        color: crimson.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // 1. Home
                      Expanded(
                        child: _buildLiquidGlassNavItem(
                          context: context,
                          iconWidget: Icon(
                            currentIndex == 0
                                ? Icons.home_rounded
                                : Icons.home_outlined,
                            color: currentIndex == 0
                                ? crimson
                                : const Color(0xFF64748B),
                            size: 22,
                          ),
                          label: TranslationStrings.tr('navHome', lang),
                          target: Screen.home,
                          isSelected: currentIndex == 0,
                        ),
                      ),
                      // 2. Wallet (USD Web3 Wallet)
                      Expanded(
                        child: _buildLiquidGlassNavItem(
                          context: context,
                          iconWidget: Icon(
                            currentIndex == 1
                                ? Icons.account_balance_wallet_rounded
                                : Icons.account_balance_wallet_outlined,
                            color: currentIndex == 1
                                ? crimson
                                : const Color(0xFF64748B),
                            size: 21,
                          ),
                          label: TranslationStrings.tr('navWallet', lang),
                          target: Screen.notifications,
                          isSelected: currentIndex == 1,
                          onCustomTap: () => appState.navigate(
                              Screen.notifications,
                              financialView: 'wallet_main'),
                        ),
                      ),
                      // 3. Center Red Liquid Glass Scan Button matching iOS
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: GestureDetector(
                          onTap: () {
                            if (!appState.isVerified) {
                              showVerificationRequiredDialog(
                                  context, appState, 'QR Scanner');
                              return;
                            }
                            appState.navigate(Screen.scan);
                          },
                          child: Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                colors: [
                                  Color(0xFFFF2A38),
                                  crimson,
                                  Color(0xFFB00E1A),
                                ],
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                              ),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.4),
                                width: 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: crimson.withValues(alpha: 0.55),
                                  blurRadius: 20,
                                  offset: const Offset(0, 6),
                                ),
                              ],
                            ),
                            child: const Center(
                              child: ScanBracketIcon(
                                  size: 26,
                                  color: Colors.white,
                                  strokeWidth: 2.5),
                            ),
                          ),
                        ),
                      ),
                      // 4. Services
                      Expanded(
                        child: _buildLiquidGlassNavItem(
                          context: context,
                          iconWidget: ServicesGridIcon(
                            size: 21,
                            color: currentIndex == 3
                                ? crimson
                                : const Color(0xFF64748B),
                            active: currentIndex == 3,
                          ),
                          label: TranslationStrings.tr('navServices', lang),
                          target: Screen.services,
                          isSelected: currentIndex == 3,
                        ),
                      ),
                      // 5. Account
                      Expanded(
                        child: _buildLiquidGlassNavItem(
                          context: context,
                          iconWidget: Icon(
                            currentIndex == 4
                                ? Icons.settings_rounded
                                : Icons.settings_outlined,
                            color: currentIndex == 4
                                ? crimson
                                : const Color(0xFF64748B),
                            size: 22,
                          ),
                          label: TranslationStrings.tr('navSettings', lang),
                          target: Screen.settings,
                          isSelected: currentIndex == 4,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLiquidGlassNavItem({
    required BuildContext context,
    required Widget iconWidget,
    required String label,
    required Screen target,
    required bool isSelected,
    VoidCallback? onCustomTap,
  }) {
    final color = isSelected ? crimson : const Color(0xFF64748B);

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onCustomTap ??
          () {
            Provider.of<AppState>(context, listen: false).navigate(target);
          },
      child: Container(
        height: 54,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          gradient: isSelected
              ? LinearGradient(
                  colors: [
                    crimson.withValues(alpha: 0.14),
                    crimson.withValues(alpha: 0.06),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                )
              : null,
          border: Border.all(
            color: isSelected
                ? crimson.withValues(alpha: 0.20)
                : Colors.transparent,
            width: 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 24,
              height: 24,
              child: Center(child: iconWidget),
            ),
            const SizedBox(height: 2),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  label,
                  maxLines: 1,
                  style: TextStyle(
                    color: color,
                    fontSize: 10.5,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
