import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import '../widgets/arakan_emblem.dart';
import '../widgets/support_and_kyc_modals.dart';
import '../home/home_screen.dart';
import '../wallet/account_screen.dart';
import '../scan/scan_screen.dart';
import '../transfer/transfer_screen.dart';
import '../services/services_screen.dart';
import '../settings/settings_screen.dart';
import '../receive/receive_screen.dart';
import '../wallet/crypto_screen.dart';
import '../history/history_screen.dart';
import '../favourites/favourites_screen.dart';
import '../auth/auth_screen.dart';
import '../auth/app_lock_screen.dart';
import '../wallet/wallet_screen.dart';
import '../services/topup_screen.dart';
import '../services/bill_payment_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({Key? key}) : super(key: key);

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  bool _showSplash = true;

  /// Set once the logo has been shown long enough. Even if session restore is
  /// still blocked on a platform channel, the shell stops waiting on it.
  bool _startupWaitExpired = false;
  Timer? _splashTimer;
  Timer? _startupTimer;
  final String _selectedDepositToken = 'USDT';
  final String _selectedSendToken = 'USDT';

  // Wallet address and recovery phrase are sourced from the authenticated user profile — not stored locally

  @override
  void initState() {
    super.initState();
    // Resolve the saved session only AFTER the first frame is on screen. This
    // keeps Keychain / Keystore / Supabase work off the frame that dismisses
    // the native (Android 12+) splash logo.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Provider.of<AppState>(context, listen: false).bootstrap();
    });
    // Short branded splash only — the first frame is rendered immediately.
    _splashTimer = Timer(const Duration(milliseconds: 250), () {
      if (mounted) {
        setState(() => _showSplash = false);
      }
    });
    // Hard cap: never hold the logo longer than this, whatever startup does.
    _startupTimer = Timer(const Duration(seconds: 4), () {
      if (mounted) {
        setState(() => _startupWaitExpired = true);
      }
    });
  }

  @override
  void dispose() {
    _splashTimer?.cancel();
    _startupTimer?.cancel();
    super.dispose();
  }

  Widget _buildSplashScreen() {
    return Scaffold(
      backgroundColor: trueBlack,
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
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    'Péthar',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      height: 1.0,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.8,
                    ),
                  ),
                  SizedBox(width: 8),
                  Text(
                    'ဖေ့သာ',
                    style: TextStyle(
                      color: Color(0xFFF4F4F5),
                      fontSize: 36,
                      height: 1.0,
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
    final appState = Provider.of<AppState>(context);

    // Keep the branded splash up while the saved session is restored, so the
    // login screen never flashes before the PIN lock is applied. The wait is
    // bounded: once [_startupWaitExpired] is set we render the app even if the
    // restore is still pending. An already-authenticated session never waits.
    if (_showSplash ||
        (appState.isInitializing &&
            !appState.isAuthenticated &&
            !_startupWaitExpired)) {
      return _buildSplashScreen();
    }

    if (!appState.isAuthenticated) {
      return const AuthScreen();
    }

    final lang = appState.language;

    const systemOverlay = SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
      systemNavigationBarColor: trueBlack,
      systemNavigationBarIconBrightness: Brightness.light,
      systemNavigationBarDividerColor: trueBlack,
      systemNavigationBarContrastEnforced: false,
    );

    // Security gate: a restored session must be unlocked with the PIN before
    // any wallet screen (or the navigation shell) is rendered.
    if (appState.isAppLocked) {
      return const AnnotatedRegion<SystemUiOverlayStyle>(
        value: systemOverlay,
        child: AppLockScreen(),
      );
    }

    // Sub-screens routing with explicit SystemUiOverlayStyle
    Widget? subScreen;
    if (appState.currentScreen == Screen.receive) {
      subScreen = const ReceiveScreen();
    }
    if (appState.currentScreen == Screen.crypto) {
      subScreen = CryptoScreen(
        initialTab: appState.financialSubView == 'withdraw' ? 1 : 0,
        initialToken: appState.financialSubView == 'withdraw'
            ? _selectedSendToken
            : _selectedDepositToken,
      );
    }
    if (appState.currentScreen == Screen.scan) subScreen = const ScanScreen();
    if (appState.currentScreen == Screen.transfer) {
      subScreen = const TransferScreen();
    }
    if (appState.currentScreen == Screen.history) {
      subScreen = const HistoryScreen();
    }
    if (appState.currentScreen == Screen.favourites) {
      subScreen = const FavouritesScreen();
    }
    if (appState.currentScreen == Screen.account) {
      subScreen = const AccountScreen();
    }
    if (appState.currentScreen == Screen.topup) {
      subScreen = const TopupScreen();
    }
    if (appState.currentScreen == Screen.bills) {
      subScreen = const BillPaymentScreen();
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
        // Docked navigation bar: the page body stops above it so content is
        // never rendered underneath the bar.
        resizeToAvoidBottomInset: true,
        backgroundColor: trueBlack,
        body: AnimatedSwitcher(
          duration: const Duration(milliseconds: 180),
          switchInCurve: Curves.easeOutCubic,
          switchOutCurve: Curves.easeInCubic,
          transitionBuilder: (child, animation) => FadeTransition(
            opacity: animation,
            child: SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, 0.015),
                end: Offset.zero,
              ).animate(animation),
              child: child,
            ),
          ),
          child: KeyedSubtree(
            key: ValueKey<int>(currentIndex),
            child: body,
          ),
        ),
        bottomNavigationBar: Container(
          key: const ValueKey('main-bottom-nav'),
          decoration: const BoxDecoration(
            color: trueBlackElevated,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [
              BoxShadow(
                color: const Color(0x66000000),
                blurRadius: 20,
                offset: Offset(0, -6),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            minimum: const EdgeInsets.only(bottom: 6),
            child: SizedBox(
              height: 64,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
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
                              ? Colors.white
                              : const Color(0xFFD4D4D8),
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
                              ? Colors.white
                              : const Color(0xFFD4D4D8),
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
                            color: const Color(0xFF000000),
                            border: Border.all(
                              color: const Color(0x26FFFFFF),
                              width: 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0x66000000),
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
                              ? Colors.white
                              : const Color(0xFFD4D4D8),
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
                              ? Colors.white
                              : const Color(0xFFD4D4D8),
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
    final color = isSelected ? Colors.white : const Color(0xFFA1A1AA);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 5),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(999),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () {
            HapticFeedback.selectionClick();
            if (onCustomTap != null) {
              onCustomTap();
            } else {
              Provider.of<AppState>(context, listen: false).navigate(target);
            }
          },
          splashColor: Colors.white.withValues(alpha: 0.10),
          highlightColor: Colors.white.withValues(alpha: 0.05),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeOut,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(999),
              color: isSelected ? const Color(0xFF000000) : Colors.transparent,
              border: Border.all(
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.20)
                    : Colors.transparent,
                width: 1,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                AnimatedScale(
                  scale: isSelected ? 1.06 : 1.0,
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeOut,
                  child: SizedBox(
                    width: 24,
                    height: 24,
                    child: Center(child: iconWidget),
                  ),
                ),
                const SizedBox(height: 2),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: AnimatedDefaultTextStyle(
                      duration: const Duration(milliseconds: 200),
                      style: TextStyle(
                        color: color,
                        fontSize: 10.5,
                        fontWeight:
                            isSelected ? FontWeight.w700 : FontWeight.w600,
                      ),
                      child: Text(label, maxLines: 1),
                    ),
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
