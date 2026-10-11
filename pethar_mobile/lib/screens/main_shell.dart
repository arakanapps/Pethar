import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import 'home_screen.dart';
import 'account_screen.dart';
import 'scan_screen.dart';
import 'services_screen.dart';
import 'settings_screen.dart';
import 'send_screen.dart';
import 'receive_screen.dart';
import 'cashout_screen.dart';
import 'notifications_screen.dart';
import 'intl_screen.dart';
import 'crypto_screen.dart';
import 'offline_payment_screen.dart';

import 'pos_terminal_screen.dart';
import 'desktop_portal_screen.dart';

class MainShell extends StatelessWidget {
  const MainShell({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    // Sub-screens routing
    if (appState.currentScreen == Screen.desktop) return const DesktopPortalScreen();
    if (appState.currentScreen == Screen.pos) return const PosTerminalScreen();
    if (appState.currentScreen == Screen.send) return const SendScreen();
    if (appState.currentScreen == Screen.receive) return const ReceiveScreen();
    if (appState.currentScreen == Screen.cashout) return const CashOutScreen();
    if (appState.currentScreen == Screen.notifications) return const NotificationsScreen();
    if (appState.currentScreen == Screen.intl) return const IntlScreen();
    if (appState.currentScreen == Screen.crypto) return const CryptoScreen();
    if (appState.currentScreen == Screen.offlinePayment) return const OfflinePaymentScreen();

    int currentIndex = 0;
    switch (appState.currentScreen) {
      case Screen.home:
        currentIndex = 0;
        break;
      case Screen.account:
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
        body = const AccountScreen();
        break;
      case 2:
        body = const ScanScreen();
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

    return Scaffold(
      body: body,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.transparent,
        elevation: 8,
        onPressed: () => appState.navigate(Screen.scan),
        child: Container(
          width: 54,
          height: 54,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
              colors: [cyanNeon, Colors.blueAccent, Colors.indigoAccent],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            border: Border.all(
              color: isDark ? obsidian : Colors.white,
              width: 3.5,
            ),
            boxShadow: [
              BoxShadow(
                color: cyanNeon.withOpacity(0.4),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: const Icon(Icons.qr_code_scanner, color: Colors.white, size: 24),
        ),
      ),
      bottomNavigationBar: BottomAppBar(
        color: isDark ? obsidian : Colors.white,
        shape: const CircularNotchedRectangle(),
        notchMargin: 6,
        elevation: 12,
        child: SizedBox(
          height: 56,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                context: context,
                icon: Icons.home_filled,
                label: TranslationStrings.tr('navHome', lang),
                target: Screen.home,
                isSelected: currentIndex == 0,
              ),
              _buildNavItem(
                context: context,
                icon: Icons.credit_card,
                label: TranslationStrings.tr('navAccount', lang),
                target: Screen.account,
                isSelected: currentIndex == 1,
              ),
              const SizedBox(width: 48), // Gap for center FAB
              _buildNavItem(
                context: context,
                icon: Icons.grid_view_rounded,
                label: TranslationStrings.tr('navServices', lang),
                target: Screen.services,
                isSelected: currentIndex == 3,
              ),
              _buildNavItem(
                context: context,
                icon: Icons.settings,
                label: TranslationStrings.tr('navSettings', lang),
                target: Screen.settings,
                isSelected: currentIndex == 4,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required BuildContext context,
    required IconData icon,
    required String label,
    required Screen target,
    required bool isSelected,
  }) {
    final color = isSelected ? gold : Colors.grey;
    return InkWell(
      onTap: () {
        Provider.of<AppState>(context, listen: false).navigate(target);
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
