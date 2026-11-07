import 'dart:async';
import 'dart:convert';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../models/data.dart';
import '../core/services/supabase_service.dart';
import '../theme.dart';
import '../widgets/arakan_emblem.dart';
import '../widgets/support_and_kyc_modals.dart';
import '../notifications/notifications_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  static const int _bannerAdCount = 4;
  int _bannerIndex = 0;
  final PageController _bannerController = PageController();
  Timer? _bannerTimer;

  @override
  void initState() {
    super.initState();
    _bannerTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!mounted || !_bannerController.hasClients) return;
      final next = (_bannerIndex + 1) % _bannerAdCount;
      _bannerController.animateToPage(
        next,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _bannerTimer?.cancel();
    _bannerController.dispose();
    super.dispose();
  }

  void _showComingSoon(BuildContext context, bool isAk, String title) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.info_outline_rounded,
                color: Color(0xFFD91624), size: 18),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                isAk
                    ? '$title - မကြာမီ လာမည်ဖြစ်ပါသည်'
                    : '$title is Coming Soon...',
                style:
                    const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1E293B),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _runVerifiedAction(
    BuildContext context,
    AppState appState,
    String label,
    VoidCallback onAllowed,
  ) {
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

  ImageProvider? _buildAvatarImageProvider(String? avatarUrl) {
    if (avatarUrl == null || avatarUrl.trim().isEmpty) return null;
    final url = avatarUrl.trim();
    if (url.startsWith('data:image') || url.startsWith('data:application')) {
      try {
        final commaIdx = url.indexOf(',');
        final base64Str = commaIdx != -1 ? url.substring(commaIdx + 1) : url;
        return MemoryImage(base64Decode(base64Str));
      } catch (e) {
        return null;
      }
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return NetworkImage(url);
    }
    return null;
  }

  Future<void> _pickAvatarFromSource(
    BuildContext context,
    AppState appState,
    bool isAk,
    ImageSource source,
    BuildContext dialogCtx,
  ) async {
    try {
      final picker = ImagePicker();
      final XFile? picked = await picker.pickImage(
        source: source,
        maxWidth: 600,
        maxHeight: 600,
        imageQuality: 85,
      );
      if (picked != null) {
        final bytes = await picked.readAsBytes();
        final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';
        appState.profile.avatarUrl = base64Image;
        appState.notify();
        if (dialogCtx.mounted) {
          Navigator.pop(dialogCtx);
        }
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                isAk
                    ? 'ပရိုဖိုင်ဓာတ်ပုံ အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ'
                    : 'Profile photo updated successfully!',
              ),
              backgroundColor: const Color(0xFF18181B),
              duration: const Duration(seconds: 2),
            ),
          );
        }
        try {
          await SupabaseService().updateAvatarUrl(
            profileId: appState.profile.uid,
            avatarUrl: base64Image,
          );
        } catch (_) {}
      }
    } catch (e) {
      debugPrint('Error picking avatar image: $e');
    }
  }

  void _showChangeProfilePhotoModal(
      BuildContext context, AppState appState, bool isAk) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (modalCtx) {
        return Container(
          decoration: const BoxDecoration(
            color: const Color(0xFF0A0A0A),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Grab handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF27272A),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Title Header: Change profile photo + Close
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isAk
                            ? 'ပရိုဖိုင်ဓာတ်ပုံ ပြောင်းရန်'
                            : 'Change profile photo',
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFFFAFAFA),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        isAk
                            ? 'ကင်မရာ သို့မဟုတ် ဖုန်းပြခန်းမှ ရွေးချယ်ပါ'
                            : 'Take a photo or choose from gallery',
                        style: const TextStyle(
                            fontSize: 12, color: Color(0xFFA1A1AA)),
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(modalCtx),
                    icon: const Icon(Icons.close,
                        size: 20, color: Color(0xFFA1A1AA)),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Option 1: Take Photo
              ListTile(
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFF111111)),
                ),
                tileColor: const Color(0xFFFAFAFA),
                leading: Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A0A0E),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.camera_alt_rounded,
                      color: crimson, size: 20),
                ),
                title: Text(
                  isAk ? 'ကင်မရာဖြင့် ဓာတ်ပုံရိုက်မည်' : 'Take Photo',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFFAFAFA),
                  ),
                ),
                subtitle: Text(
                  isAk ? 'ဖုန်းကင်မရာ ဖွင့်ရန်' : 'Open camera to capture',
                  style:
                      const TextStyle(fontSize: 12, color: Color(0xFFA1A1AA)),
                ),
                trailing: const Icon(Icons.chevron_right,
                    size: 20, color: Color(0xFFD4D4D8)),
                onTap: () => _pickAvatarFromSource(
                    context, appState, isAk, ImageSource.camera, modalCtx),
              ),
              const SizedBox(height: 10),

              // Option 2: Choose Photo
              ListTile(
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFF111111)),
                ),
                tileColor: const Color(0xFFFAFAFA),
                leading: Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0A0A0A),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.photo_library_rounded,
                      color: Color(0xFF0284C7), size: 20),
                ),
                title: Text(
                  isAk ? 'ဖုန်းပြခန်းမှ ဓာတ်ပုံရွေးမည်' : 'Choose Photo',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFFAFAFA),
                  ),
                ),
                subtitle: Text(
                  isAk
                      ? 'ပြခန်းမှ ဓာတ်ပုံ ရွေးချယ်ရန်'
                      : 'Select from photo library',
                  style:
                      const TextStyle(fontSize: 12, color: Color(0xFFA1A1AA)),
                ),
                trailing: const Icon(Icons.chevron_right,
                    size: 20, color: Color(0xFFD4D4D8)),
                onTap: () => _pickAvatarFromSource(
                    context, appState, isAk, ImageSource.gallery, modalCtx),
              ),
              const SizedBox(height: 16),

              // Option 3: Cancel
              SizedBox(
                width: double.infinity,
                height: 46,
                child: TextButton(
                  onPressed: () => Navigator.pop(modalCtx),
                  style: TextButton.styleFrom(
                    backgroundColor: const Color(0xFFF4F4F5),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Text(
                    isAk ? 'မလုပ်တော့ပါ' : 'Cancel',
                    style: const TextStyle(
                      color: Color(0xFFA1A1AA),
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showQuitAppModal(BuildContext context, bool isAk) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        backgroundColor: trueBlack,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: const Color(0xFF1A0A0C),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF3F1D24)),
                ),
                child: const Icon(Icons.power_settings_new_rounded,
                    color: crimson, size: 26),
              ),
              const SizedBox(height: 16),
              Text(
                isAk ? 'အက်ပ်မှ ထွက်လိုပါသလား?' : 'Quit Péthar App?',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFFFAFAFA),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                isAk
                    ? 'အက်ပ်ကို ပိတ်ပြီး ထွက်ခွာပါမည်။ သင့်အကောင့် ဆက်လက်ဝင်ရောက်ထားမည်ဖြစ်ပါသည်။'
                    : 'Are you sure you want to exit and quit the app? Your account will remain logged in.',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 12.5,
                  color: Color(0xFFA1A1AA),
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 22),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFA1A1AA),
                        side: const BorderSide(color: Color(0xFF27272A)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                      child: Text(
                        isAk ? 'မထွက်ပါ' : 'Cancel',
                        style: const TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 13),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        SystemNavigator.pop();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: crimson,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                      child: Text(
                        isAk ? 'ထွက်မည်' : 'Quit App',
                        style: const TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 13),
                      ),
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

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final lang = appState.language;
    final isAk = lang == 'ak';
    final currencyFmt = NumberFormat('#,##0.00', 'en_US');

    // Primary 4-Action Row: Transfer | Receive | Deposit | Withdraw
    final homeActions = <Map<String, Object>>[
      {
        'label': isAk ? 'ငွေလွှဲ' : 'Transfer',
        'iconWidget':
            const Icon(Icons.swap_horiz_rounded, color: crimson, size: 23),
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေလွှဲရန် (Transfer)' : 'Transfer',
              () => appState.navigate(Screen.transfer),
            ),
      },
      {
        'label': isAk ? 'ငွေလက်ခံ' : 'Receive',
        'iconWidget':
            const Icon(Icons.qr_code_2_rounded, color: crimson, size: 22),
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေလက်ခံရန် (Receive)' : 'Receive',
              () => appState.navigate(Screen.receive),
            ),
      },
      {
        'label': isAk ? 'ငွေသွင်း' : 'Deposit',
        'iconWidget': const Icon(Icons.south_rounded, color: crimson, size: 21),
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေသွင်းရန် (Deposit)' : 'Deposit',
              () => appState.navigate(
                Screen.notifications,
                financialView: 'issue',
              ),
            ),
      },
      {
        'label': isAk ? 'ငွေထုတ်' : 'Withdraw',
        'iconWidget': const Icon(Icons.north_rounded, color: crimson, size: 21),
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေထုတ်ရန် (Withdraw)' : 'Withdraw',
              () => appState.navigate(
                Screen.notifications,
                financialView: 'withdraw',
              ),
            ),
      },
    ];

    // Quick Services: Top Up | Bill Payment | Gift Card | Mini Apps
    //                 Refer & Earn | Accounts | History | See All
    final secondaryActions = <Map<String, Object>>[
      {
        'label': isAk ? 'ငွေဖြည့်' : 'Top Up',
        'iconWidget': const Icon(Icons.add_rounded, color: crimson, size: 21),
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေဖြည့်ရန် (Top Up)' : 'Top Up',
              () => appState.navigate(Screen.topup),
            ),
      },
      {
        'label': isAk ? 'ဘေလ်ဆောင်' : 'Bill Payment',
        'iconWidget':
            const Icon(Icons.receipt_long_rounded, color: crimson, size: 19),
        'onTap': () => appState.navigate(Screen.bills),
      },
      {
        'label': isAk ? 'လက်ဆောင်ကတ်' : 'Gift Card',
        'iconWidget':
            const Icon(Icons.card_giftcard_rounded, color: crimson, size: 20),
        'onTap': () => _showComingSoon(
            context, isAk, isAk ? 'လက်ဆောင်ကတ်များ' : 'Gift Card'),
      },
      {
        'label': isAk ? 'မီနီအက်ပ်' : 'Mini Apps',
        'iconWidget': const Icon(Icons.apps_rounded, color: crimson, size: 20),
        'onTap': () => _showComingSoon(
            context, isAk, isAk ? 'မိတ်ဖက် မီနီအက်ပ်များ' : 'Mini Apps'),
      },
      {
        'label': isAk ? 'မိတ်ဆက်ရယူ' : 'Refer & Earn',
        'iconWidget':
            const Icon(Icons.group_add_rounded, color: crimson, size: 20),
        'onTap': () => _showComingSoon(context, isAk, 'Refer & Earn'),
      },
      {
        'label': isAk ? 'ငွေစာရင်း' : 'Accounts',
        'iconWidget':
            const Icon(Icons.credit_card_rounded, color: crimson, size: 19),
        'onTap': () => appState.navigate(Screen.account),
      },
      {
        'label': isAk ? 'မှတ်တမ်း' : 'History',
        'iconWidget':
            const Icon(Icons.history_rounded, color: crimson, size: 20),
        'onTap': () => appState.navigate(Screen.history),
      },
      {
        'label': isAk ? 'အားလုံး' : 'See All',
        'iconWidget':
            const Icon(Icons.grid_view_rounded, color: crimson, size: 20),
        'onTap': () => appState.navigate(Screen.services),
      },
    ];

    final favUsers = appState.favoriteContactsList;
    final double bal = appState.isAuthenticated ? appState.wallet.balance : 0.0;
    final double balFontSize = bal >= 1000000000
        ? 30.0
        : (bal >= 1000000 ? 34.0 : (bal >= 100000 ? 38.0 : 42.0));

    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      body: Stack(
        children: [
          const _LiquidGlassBackground(),
          SafeArea(
            bottom: false,
            child: SingleChildScrollView(
              physics: const ClampingScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildTopBar(appState, isAk),
                  const SizedBox(height: 18),
                  _buildBalanceCard(
                      appState, isAk, currencyFmt, bal, balFontSize),
                  const SizedBox(height: 18),
                  _buildPrimaryActions(homeActions),
                  const SizedBox(height: 18),
                  _buildSecondaryActions(isAk, secondaryActions),
                  const SizedBox(height: 18),
                  _buildFavourites(context, appState, isAk, favUsers),
                  const SizedBox(height: 18),
                  _buildBannerAds(context, appState, isAk),
                  if (appState.announcementsList.isNotEmpty) ...[
                    const SizedBox(height: 18),
                    _buildAnnouncements(appState, isAk),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────── TOP BAR ───────────────────────────

  Widget _buildTopBar(AppState appState, bool isAk) {
    final avatar = _buildAvatarImageProvider(appState.profile.avatarUrl);
    final name = appState.profile.name.trim();
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'U';

    return SizedBox(
      height: 46,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Restored user photo (left)
          Align(
            alignment: Alignment.centerLeft,
            child: GestureDetector(
              onTap: () =>
                  _showChangeProfilePhotoModal(context, appState, isAk),
              child: Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFFFFE4E7), Color(0xFFF6FAFF)],
                  ),
                  border:
                      Border.all(color: const Color(0xFF0A0A0A), width: 1.8),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0B1B33).withValues(alpha: 0.10),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                  image: avatar != null
                      ? DecorationImage(image: avatar, fit: BoxFit.cover)
                      : null,
                ),
                alignment: Alignment.center,
                child: avatar == null
                    ? Text(
                        initial,
                        style: const TextStyle(
                          color: crimson,
                          fontWeight: FontWeight.w900,
                          fontSize: 17,
                        ),
                      )
                    : null,
              ),
            ),
          ),
          // Centred app logo, no background
          const ArakanEmblem(size: 40),
          Align(
            alignment: Alignment.centerRight,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _glassIconButton(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                          builder: (_) => const NotificationsScreen()),
                    );
                  },
                  icon: const Icon(Icons.notifications_none_rounded,
                      size: 20, color: Color(0xFFE4E4E7)),
                  badge: appState.unreadNotificationsCount > 0
                      ? Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 5, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: crimson,
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(
                                color: const Color(0xFF0A0A0A), width: 1.5),
                          ),
                          child: Text(
                            '${appState.unreadNotificationsCount}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 8),
                _glassIconButton(
                  onTap: () => _showQuitAppModal(context, isAk),
                  icon: const Icon(Icons.power_settings_new_rounded,
                      size: 19, color: crimson),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _glassIconButton({
    required Widget icon,
    required VoidCallback onTap,
    Widget? badge,
  }) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white.withValues(alpha: 0.92),
              Colors.white.withValues(alpha: 0.55),
            ],
          ),
          border: Border.all(
              color: Colors.white.withValues(alpha: 0.95), width: 1.3),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF0B1B33).withValues(alpha: 0.07),
              blurRadius: 14,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Stack(
          alignment: Alignment.center,
          clipBehavior: Clip.none,
          children: [
            icon,
            if (badge != null) Positioned(right: -4, top: -4, child: badge),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────── WALLET BALANCE ───────────────────────────

  Widget _buildBalanceCard(
    AppState appState,
    bool isAk,
    NumberFormat currencyFmt,
    double bal,
    double balFontSize,
  ) {
    return _GlassSurface(
      radius: 32,
      padding: const EdgeInsets.fromLTRB(20, 18, 16, 18),
      tint: crimson,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          const Positioned(
            right: -16,
            bottom: -28,
            child: Opacity(opacity: 0.07, child: ArakanEmblem(size: 132)),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.55),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.9)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.account_balance_wallet_rounded,
                            size: 13, color: crimson),
                        const SizedBox(width: 6),
                        Text(
                          isAk
                              ? 'ရရှိနိုင်သော လက်ကျန်ငွေ'
                              : 'Available Balance',
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFFA1A1AA),
                            letterSpacing: 0.1,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => appState.toggleBalance(),
                    child: Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.6),
                        border: Border.all(
                            color: Colors.white.withValues(alpha: 0.95)),
                      ),
                      alignment: Alignment.center,
                      child: Icon(
                        appState.balanceHidden
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        size: 16,
                        color: const Color(0xFFA1A1AA),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (appState.balanceHidden)
                const Text(
                  '••••••••',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFFF4F4F5),
                    fontFamily: 'monospace',
                    letterSpacing: 3,
                  ),
                )
              else
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        '₳ ',
                        style: TextStyle(
                          fontSize: balFontSize * 0.72,
                          fontWeight: FontWeight.w900,
                          color: crimson,
                          fontFamily: 'monospace',
                        ),
                      ),
                      Text(
                        currencyFmt.format(bal),
                        style: TextStyle(
                          fontSize: balFontSize,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFFF4F4F5),
                          fontFamily: 'monospace',
                          letterSpacing: -1,
                          height: 1.05,
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 10),
              _buildBalanceStatusStrip(appState, isAk),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBalanceStatusStrip(AppState appState, bool isAk) {
    if (!appState.isAuthenticated) {
      return GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => showSignInSignUpModal(context, appState),
        child: Row(
          children: [
            const Icon(Icons.lock_outline_rounded,
                size: 14, color: Color(0xFFA1A1AA)),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                isAk
                    ? 'သင့်လက်ကျန်ငွေကို ကြည့်ရန် အကောင့်ဝင်ပါ'
                    : 'Sign in to see your balance',
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFA1A1AA),
                ),
              ),
            ),
            _glassPill(
              label: isAk ? 'ဝင်ရန်' : 'Sign in',
              color: crimson,
            ),
          ],
        ),
      );
    }

    if (appState.isVerified) {
      // Verified badge and AKD wallet label are intentionally not shown.
      return const SizedBox.shrink();
    }

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => showKycVerificationModal(context, appState),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded, size: 14, color: crimson),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              isAk
                  ? 'ငွေပေးချေမှုများ အသုံးပြုရန် အတည်ပြုပါ'
                  : 'Verify your identity to unlock payments',
              maxLines: 2,
              style: const TextStyle(
                fontSize: 11.5,
                height: 1.3,
                fontWeight: FontWeight.w600,
                color: Color(0xFFA1A1AA),
              ),
            ),
          ),
          const SizedBox(width: 8),
          _glassPill(
            label: isAk ? 'အတည်ပြုမည်' : 'Verify',
            color: crimson,
          ),
        ],
      ),
    );
  }

  Widget _glassPill({required String label, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: color,
        ),
      ),
    );
  }

  // ─────────────────────────── PRIMARY ACTIONS ───────────────────────────

  Widget _buildPrimaryActions(List<Map<String, Object>> actions) {
    return _GlassSurface(
      radius: 28,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
      child: Row(
        children: actions
            .map((act) => Expanded(child: _quickActionItem(act)))
            .toList(),
      ),
    );
  }

  // ─────────────────────── QUICK ACTION ITEM (SHARED) ───────────────────────

  Widget _quickActionItem(Map<String, Object> act) {
    final label = act['label'] as String;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: act['onTap'] as VoidCallback,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFFFFFFFF),
                  Color(0xFFFFEFF1),
                  Color(0xFFFDF3F4)
                ],
              ),
              border: Border.all(color: const Color(0xFF0A0A0A), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: crimson.withValues(alpha: 0.14),
                  blurRadius: 14,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Center(child: act['iconWidget'] as Widget),
          ),
          const SizedBox(height: 9),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.w700,
              color: Color(0xFFE4E4E7),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────── SECONDARY SERVICES ───────────────────────────

  Widget _buildSecondaryActions(bool isAk, List<Map<String, Object>> actions) {
    return _GlassSurface(
      radius: 28,
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionLabel(isAk ? 'အမြန်ဝန်ဆောင်မှုများ' : 'Quick Services'),
          const SizedBox(height: 16),
          Row(
            children: actions
                .sublist(0, 4)
                .map((act) => Expanded(child: _quickActionItem(act)))
                .toList(),
          ),
          const SizedBox(height: 18),
          Row(
            children: actions
                .sublist(4, 8)
                .map((act) => Expanded(child: _quickActionItem(act)))
                .toList(),
          ),
        ],
      ),
    );
  }

  Widget _sectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 2),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: Color(0xFFA1A1AA),
          letterSpacing: 0.4,
        ),
      ),
    );
  }

  // ─────────────────────────── FAVOURITES ───────────────────────────

  Widget _buildFavourites(
    BuildContext context,
    AppState appState,
    bool isAk,
    List<FavoriteContact> favUsers,
  ) {
    return _GlassSurface(
      radius: 28,
      padding: const EdgeInsets.fromLTRB(16, 15, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _sectionLabel(
                  isAk ? 'ကျွန်ုပ်၏ စိတ်ကြိုက်များ' : 'My Favourites'),
              GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () => _runVerifiedAction(
                  context,
                  appState,
                  isAk ? 'ကျွန်ုပ်၏ စိတ်ကြိုက်များ' : 'My Favourites',
                  () => appState.navigate(Screen.favourites),
                ),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.65),
                    borderRadius: BorderRadius.circular(999),
                    border:
                        Border.all(color: Colors.white.withValues(alpha: 0.95)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        isAk ? 'အားလုံး' : 'View all',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: crimson,
                        ),
                      ),
                      const SizedBox(width: 2),
                      const Icon(Icons.chevron_right_rounded,
                          size: 14, color: crimson),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const ClampingScrollPhysics(),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ...favUsers.map((fav) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 14),
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => _runVerifiedAction(
                        context,
                        appState,
                        isAk ? 'ငွေလွှဲရန်' : 'Transfer',
                        () => appState.startPayForContact(
                          name: fav.name,
                          id: fav.id,
                          initials: fav.initials,
                          colorValue: fav.colorValue,
                        ),
                      ),
                      child: Column(
                        children: [
                          Container(
                            width: 46,
                            height: 46,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(fav.colorValue),
                              border: Border.all(
                                  color: const Color(0xFF0A0A0A), width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: Color(fav.colorValue)
                                      .withValues(alpha: 0.28),
                                  blurRadius: 12,
                                  offset: const Offset(0, 5),
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: fav.initials == 'U'
                                ? const Icon(Icons.person_outline_rounded,
                                    color: Colors.white, size: 20)
                                : Text(
                                    fav.initials,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                          ),
                          const SizedBox(height: 7),
                          SizedBox(
                            width: 56,
                            child: Text(
                              isAk ? fav.mm : fav.name,
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFFA1A1AA),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
                GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => _runVerifiedAction(
                    context,
                    appState,
                    isAk ? 'ကျွန်ုပ်၏ စိတ်ကြိုက်များ' : 'My Favourites',
                    () => appState.navigate(Screen.favourites),
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 46,
                        height: 46,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withValues(alpha: 0.55),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.95),
                            width: 1.5,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: const Icon(
                          Icons.add_rounded,
                          color: Color(0xFFA1A1AA),
                          size: 20,
                        ),
                      ),
                      const SizedBox(height: 7),
                      SizedBox(
                        width: 56,
                        child: Text(
                          isAk ? 'ထည့်ရန်' : 'Add',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFFA1A1AA),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                if (favUsers.isEmpty) ...[
                  const SizedBox(width: 12),
                  Container(
                    height: 46,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.55),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.95)),
                    ),
                    alignment: Alignment.center,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.person_add_alt_1_rounded,
                            size: 15, color: crimson),
                        const SizedBox(width: 7),
                        Text(
                          isAk
                              ? 'ပထမဆုံး လက်ခံသူ ထည့်ပါ'
                              : 'Add your first recipient',
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFFA1A1AA),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────── BANNER ADS ───────────────────────────

  Widget _buildBannerAds(BuildContext context, AppState appState, bool isAk) {
    final banners = <Map<String, Object>>[
      {
        'title':
            isAk ? 'စက္ကန့်ပိုင်းအတွင်း ငွေလွှဲပါ' : 'Send Money in Seconds',
        'subtitle': isAk
            ? 'ပထမဆုံး ငွေလွှဲ ၃ ခုအတွက် အခမဲ့'
            : 'Zero fees on your first 3 transfers this week',
        'cta': isAk ? 'ငွေလွှဲမည်' : 'Transfer now',
        'icon': Icons.bolt_rounded,
        'colors': const <Color>[Color(0xFFD91624), Color(0xFFF97316)],
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေလွှဲရန် (Transfer)' : 'Transfer',
              () => appState.navigate(Screen.transfer),
            ),
      },
      {
        'title': isAk ? 'ငွေဖြည့်ပါ ဘောနပ်စ် ရယူပါ' : 'Top Up & Get Bonus Data',
        'subtitle': isAk
            ? 'မိုဘိုင်းငွေဖြည့်တိုင်း အထူးဒေတာ ပက်ကေ့ချ်များ'
            : 'Instant mobile reloads with exclusive data bundles',
        'cta': isAk ? 'ငွေဖြည့်မည်' : 'Top up',
        'icon': Icons.smartphone_rounded,
        'colors': const <Color>[Color(0xFF2563EB), Color(0xFF06B6D4)],
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေဖြည့်ရန် (Top Up)' : 'Top Up',
              () => appState.navigate(Screen.topup),
            ),
      },
      {
        'title':
            isAk ? 'သူငယ်ချင်းဖိတ်ပါ ဆုယူပါ' : 'Invite Friends, Earn Rewards',
        'subtitle': isAk
            ? 'ဖိတ်ကြားသည့် သူငယ်ချင်းတိုင်းအတွက် ၅,၀၀၀ AKD ရယူပါ'
            : 'Earn 5,000 AKD for every friend who joins Péthar',
        'cta': isAk ? 'မိတ်ဆက်မည်' : 'Refer now',
        'icon': Icons.group_add_rounded,
        'colors': const <Color>[Color(0xFF7C3AED), Color(0xFFDB2777)],
        'onTap': () => _showComingSoon(context, isAk, 'Refer & Earn'),
      },
      {
        'title': isAk ? 'ဘေလ်များ တစ်နေရာတည်းတွင်' : 'Pay Bills in One Place',
        'subtitle': isAk
            ? 'မီတာ၊ အင်တာနက်၊ TV နှင့် အခြားဘေလ်များကို လွယ်ကူစွာ ပေးချေပါ'
            : 'Electricity, internet, TV and more in just a few taps',
        'cta': isAk ? 'ဘေလ်ဆောင်မည်' : 'Pay bills',
        'icon': Icons.receipt_long_rounded,
        'colors': const <Color>[Color(0xFF0F766E), Color(0xFF14B8A6)],
        'onTap': () => appState.navigate(Screen.bills),
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 132,
          child: PageView.builder(
            controller: _bannerController,
            itemCount: banners.length,
            onPageChanged: (index) {
              if (mounted) setState(() => _bannerIndex = index);
            },
            itemBuilder: (context, index) => _bannerAdCard(banners[index]),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(banners.length, (index) {
            final active = index == _bannerIndex;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: active ? 18 : 6,
              height: 6,
              decoration: BoxDecoration(
                color: active ? crimson : const Color(0xFF3F3F46),
                borderRadius: BorderRadius.circular(999),
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _bannerAdCard(Map<String, Object> banner) {
    final colors = banner['colors'] as List<Color>;
    final title = banner['title'] as String;
    final subtitle = banner['subtitle'] as String;
    final cta = banner['cta'] as String;

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: banner['onTap'] as VoidCallback,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: colors,
          ),
          boxShadow: [
            BoxShadow(
              color: colors.first.withValues(alpha: 0.25),
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Stack(
            children: [
              Positioned(
                right: -26,
                top: -34,
                child: Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withValues(alpha: 0.10),
                  ),
                ),
              ),
              Positioned(
                right: 34,
                bottom: -55,
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withValues(alpha: 0.08),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(18, 12, 16, 12),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: -0.2,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            subtitle,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11,
                              height: 1.3,
                              fontWeight: FontWeight.w500,
                              color: Colors.white.withValues(alpha: 0.85),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.22),
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.30)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  cta,
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 2),
                                const Icon(Icons.arrow_forward_rounded,
                                    size: 12, color: Colors.white),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Center(
                      child: Container(
                        width: 54,
                        height: 54,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withValues(alpha: 0.16),
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.24)),
                        ),
                        child: Icon(
                          banner['icon'] as IconData,
                          color: Colors.white,
                          size: 27,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─────────────────────────── ANNOUNCEMENTS ───────────────────────────

  Widget _buildAnnouncements(AppState appState, bool isAk) {
    final items = appState.announcementsList
        .where((item) =>
            (item['title_en']?.toString().isNotEmpty ?? false) ||
            (item['title_mm']?.toString().isNotEmpty ?? false))
        .take(2)
        .toList();
    if (items.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionLabel(isAk ? 'ကြေညာချက်များ' : 'Announcements'),
        const SizedBox(height: 10),
        ...items.map((item) {
          final titleMm = item['title_mm']?.toString() ?? '';
          final bodyMm = item['body_mm']?.toString() ?? '';
          final titleEn = item['title_en']?.toString() ?? '';
          final bodyEn = item['body_en']?.toString() ?? '';
          final title = isAk && titleMm.isNotEmpty ? titleMm : titleEn;
          final body = isAk && bodyMm.isNotEmpty ? bodyMm : bodyEn;
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _GlassSurface(
              radius: 24,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF1A0A0C).withValues(alpha: 0.95),
                      border: Border.all(
                          color: const Color(0xFF0A0A0A), width: 1.2),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.campaign_rounded,
                        color: crimson, size: 19),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFFF4F4F5),
                          ),
                        ),
                        if (body.isNotEmpty) ...[
                          const SizedBox(height: 3),
                          Text(
                            body,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 11.5,
                              height: 1.4,
                              color: Color(0xFFA1A1AA),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}

// ─────────────────────────── LIQUID GLASS PRIMITIVES ───────────────────────────

class _LiquidGlassBackground extends StatelessWidget {
  const _LiquidGlassBackground();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Stack(
        children: [
          const Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFFFCF3F5),
                    Color(0xFFF4F7FC),
                    Color(0xFFEFF4FB)
                  ],
                ),
              ),
            ),
          ),
          Positioned(
              top: -110,
              left: -80,
              child: _blob(const Color(0xFFE11D2E), 280, 0.22)),
          Positioned(
              top: 180,
              right: -120,
              child: _blob(const Color(0xFF2563EB), 320, 0.16)),
          Positioned(
              bottom: 80,
              left: -110,
              child: _blob(const Color(0xFF14B8A6), 300, 0.14)),
          Positioned(
              bottom: -80,
              right: -60,
              child: _blob(const Color(0xFFD4AF37), 260, 0.16)),
        ],
      ),
    );
  }

  Widget _blob(Color color, double size, double opacity) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            color.withValues(alpha: opacity),
            color.withValues(alpha: 0),
          ],
        ),
      ),
    );
  }
}

class _GlassSurface extends StatelessWidget {
  const _GlassSurface({
    required this.child,
    this.radius = 28,
    this.padding = const EdgeInsets.all(16),
    this.tint,
  });

  final Widget child;
  final double radius;
  final EdgeInsetsGeometry padding;
  final Color? tint;

  @override
  Widget build(BuildContext context) {
    final base = BorderRadius.circular(radius);
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: base,
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0B1B33).withValues(alpha: 0.07),
            blurRadius: 26,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: base,
        child: BackdropFilter(
          filter: ui.ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              borderRadius: base,
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: tint == null
                    ? [
                        Colors.white.withValues(alpha: 0.78),
                        Colors.white.withValues(alpha: 0.42),
                      ]
                    : [
                        Colors.white.withValues(alpha: 0.82),
                        tint!.withValues(alpha: 0.13),
                        Colors.white.withValues(alpha: 0.48),
                      ],
              ),
              border: Border.all(
                  color: Colors.white.withValues(alpha: 0.9), width: 1.3),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
