import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../services/supabase_service.dart';
import '../theme.dart';
import '../widgets/arakan_emblem.dart';
import '../widgets/support_and_kyc_modals.dart';
import 'notifications_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final PageController _adsPageController = PageController();
  int _currentAdIndex = 0;
  Timer? _adsTimer;

  final List<Map<String, dynamic>> _promoAds = const [
    {
      'titleEn': 'Péthar Zero-Fee Global Remittance',
      'titleAk': 'ဖေ့သာ ၀% ဝန်ဆောင်ခ အထူးအစီအစဉ်',
      'descEn': 'Instant transfers & zero network gas fees',
      'descAk': 'နယ်စပ်ဖြတ်ကျော် ငွေလွှဲခမဲ့နှင့် လက်ငင်းလွှဲပို့ခြင်း',
      'bgGradient': [Color(0xFFFFFFFF), Color(0xFFFFF1F2)],
      'borderColor': Color(0xFFFECDD3),
      'icon': Icons.bolt_rounded,
      'iconColor': Color(0xFFE11D48),
      'iconBg': Color(0xFFFFE4E6),
    },
    {
      'titleEn': 'Arakan Merchant 5% Cashback',
      'titleAk': 'ကုန်သည်ဆိုင်များတွင် ၅% ပြန်အမ်းငွေ',
      'descEn': 'Earn 5% cashback at verified partner merchants',
      'descAk': 'အတည်ပြုစတိုးဆိုင်များတွင် QR ဖြင့် ပေးချေပါ',
      'bgGradient': [Color(0xFFFFFFFF), Color(0xFFECFDF5)],
      'borderColor': Color(0xFFA7F3D0),
      'icon': Icons.redeem_rounded,
      'iconColor': Color(0xFF059669),
      'iconBg': Color(0xFFD1FAE5),
    },
    {
      'titleEn': 'Péthar Offline Bearer eCash',
      'titleAk': 'အင်တာနက်မလိုဘဲ ငွေသားကဲ့သို့ ပေးချေခြင်း',
      'descEn': 'NFC & soundwave offline tap-to-pay anywhere',
      'descAk': 'အသံလှိုင်းနှင့် NFC ဖြင့် အင်တာနက်မဲ့ သုံးစွဲနိုင်သည်',
      'bgGradient': [Color(0xFFFFFFFF), Color(0xFFEEF2FF)],
      'borderColor': Color(0xFFC7D2FE),
      'icon': Icons.wifi_tethering_off_rounded,
      'iconColor': Color(0xFF4F46E5),
      'iconBg': Color(0xFFE0E7FF),
    },
    {
      'titleEn': '100% Gold-Backed AKD Vault',
      'titleAk': 'ရွှေအာမခံ ၁၀၀% အပြည့်ဖြင့် ထိန်းသိမ်းထားသော ငွေကြေး',
      'descEn': 'Audited reserve backed 1:1 by gold',
      'descAk': 'ရုပ်ပိုင်းဆိုင်ရာ ရွှေနှင့် ဒေါ်လာဖြင့် အပြည့်အဝ အာမခံထားသည်',
      'bgGradient': [Color(0xFFFFFFFF), Color(0xFFFEFCE8)],
      'borderColor': Color(0xFFFDE68A),
      'icon': Icons.shield_rounded,
      'iconColor': Color(0xFFD97706),
      'iconBg': Color(0xFFFEF3C7),
    },
  ];

  @override
  void initState() {
    super.initState();
    _adsTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_adsPageController.hasClients) {
        final nextPage = (_currentAdIndex + 1) % _promoAds.length;
        _adsPageController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _adsTimer?.cancel();
    _adsPageController.dispose();
    super.dispose();
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
                isAk ? 'ပရိုဖိုင်ဓာတ်ပုံ အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ' : 'Profile photo updated successfully!',
              ),
              backgroundColor: const Color(0xFF10B981),
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

  void _showChangeProfilePhotoModal(BuildContext context, AppState appState, bool isAk) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (modalCtx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
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
                    color: const Color(0xFFE4E4E7),
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
                        isAk ? 'ပရိုဖိုင်ဓာတ်ပုံ ပြောင်းရန်' : 'Change profile photo',
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF18181B),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        isAk ? 'ကင်မရာ သို့မဟုတ် ဖုန်းပြခန်းမှ ရွေးချယ်ပါ' : 'Take a photo or choose from gallery',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF71717A)),
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(modalCtx),
                    icon: const Icon(Icons.close, size: 20, color: Color(0xFF71717A)),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Option 1: Take Photo
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFF4F4F5)),
                ),
                tileColor: const Color(0xFFFAFAFA),
                leading: Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFE4E6),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.camera_alt_rounded, color: crimson, size: 20),
                ),
                title: Text(
                  isAk ? 'ကင်မရာဖြင့် ဓာတ်ပုံရိုက်မည်' : 'Take Photo',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF18181B),
                  ),
                ),
                subtitle: Text(
                  isAk ? 'ဖုန်းကင်မရာ ဖွင့်ရန်' : 'Open camera to capture',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF71717A)),
                ),
                trailing: const Icon(Icons.chevron_right, size: 20, color: Color(0xFFA1A1AA)),
                onTap: () => _pickAvatarFromSource(context, appState, isAk, ImageSource.camera, modalCtx),
              ),
              const SizedBox(height: 10),

              // Option 2: Choose Photo
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFF4F4F5)),
                ),
                tileColor: const Color(0xFFFAFAFA),
                leading: Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE0F2FE),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.photo_library_rounded, color: Color(0xFF0284C7), size: 20),
                ),
                title: Text(
                  isAk ? 'ဖုန်းပြခန်းမှ ဓာတ်ပုံရွေးမည်' : 'Choose Photo',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF18181B),
                  ),
                ),
                subtitle: Text(
                  isAk ? 'ပြခန်းမှ ဓာတ်ပုံ ရွေးချယ်ရန်' : 'Select from photo library',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF71717A)),
                ),
                trailing: const Icon(Icons.chevron_right, size: 20, color: Color(0xFFA1A1AA)),
                onTap: () => _pickAvatarFromSource(context, appState, isAk, ImageSource.gallery, modalCtx),
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
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Text(
                    isAk ? 'မလုပ်တော့ပါ' : 'Cancel',
                    style: const TextStyle(
                      color: Color(0xFF52525B),
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
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF1F2),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFFECDD3)),
                ),
                child: const Icon(Icons.power_settings_new_rounded, color: crimson, size: 26),
              ),
              const SizedBox(height: 16),
              Text(
                isAk ? 'အက်ပ်မှ ထွက်လိုပါသလား?' : 'Quit Péthar App?',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF18181B),
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
                  color: Color(0xFF71717A),
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
                        foregroundColor: const Color(0xFF71717A),
                        side: const BorderSide(color: Color(0xFFE4E4E7)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                      child: Text(
                        isAk ? 'မထွက်ပါ' : 'Cancel',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
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
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
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


  Widget _buildLandmarkArrowIcon({required bool isDown}) {
    return SizedBox(
      width: 24,
      height: 24,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.center,
        children: [
          const Icon(Icons.account_balance_rounded, color: crimson, size: 20),
          Positioned(
            right: -2,
            bottom: -2,
            child: Container(
              width: 12,
              height: 12,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: Icon(
                isDown ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                color: crimson,
                size: 9,
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

    // 3. Primary 4-Action Row: Pay | Receive | Deposit | Withdraw
    final homeActions = [
      {
        'label': isAk ? 'ငွေပေးချေ' : 'Pay',
        'iconWidget': const WalletMinimalFlutterIcon(size: 21, color: Colors.black),
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေပေးချေရန် (Pay)' : 'Pay',
              () => appState.navigate(Screen.pay),
            ),
      },
      {
        'label': isAk ? 'ငွေလက်ခံ' : 'Receive',
        'iconWidget': const Icon(Icons.qr_code_2_rounded, color: crimson, size: 22),
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

    // 5. Secondary 4-Service Row: Topup | Bill payment | Account | History
    final secondaryActions = [
      {
        'label': isAk ? 'ငွေဖြည့်' : 'Topup',
        'iconWidget': const Icon(Icons.add_rounded, color: crimson, size: 22),
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ငွေဖြည့်ရန် (Topup)' : 'Topup',
              () => appState.navigate(Screen.topup),
            ),
      },
      {
        'label': isAk ? 'ဘေလ်ဆောင်' : 'Bill payment',
        'iconWidget': const Icon(Icons.receipt_long_rounded, color: crimson, size: 20),
        'onTap': () => _runVerifiedAction(
              context,
              appState,
              isAk ? 'ဘေလ်ဆောင်ရန် (Bill payment)' : 'Bill payment',
              () => appState.navigate(Screen.billPayment),
            ),
      },
      {
        'label': isAk ? 'ငွေစာရင်း' : 'Account',
        'iconWidget': const Icon(Icons.credit_card_rounded, color: crimson, size: 20),
        'onTap': () => appState.navigate(Screen.account),
      },
      {
        'label': isAk ? 'မှတ်တမ်း' : 'History',
        'iconWidget': const Icon(Icons.history_rounded, color: crimson, size: 21),
        'onTap': () => appState.navigate(Screen.history),
      },
    ];

    final favUsers = appState.favoriteContactsList;

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
                // 1. TOP HEADER BAR: (User Photo) | (App Logo) | (Noti Bell) | (Logout and Close)
                SizedBox(
                  height: 44,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Left: Circular User Photo - Change Profile Photo Popup
                          GestureDetector(
                            onTap: () => _showChangeProfilePhotoModal(context, appState, isAk),
                            child: Container(
                              width: 42,
                              height: 42,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: const LinearGradient(
                                  colors: [Color(0xFF38BDF8), Color(0xFF0284C7)],
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                ),
                                border: Border.all(
                                  color: crimson.withValues(alpha: 0.3),
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.05),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                                image: _buildAvatarImageProvider(appState.profile.avatarUrl) != null
                                    ? DecorationImage(
                                        image: _buildAvatarImageProvider(appState.profile.avatarUrl)!,
                                        fit: BoxFit.cover,
                                      )
                                    : null,
                              ),
                              alignment: Alignment.center,
                              child: _buildAvatarImageProvider(appState.profile.avatarUrl) == null
                                  ? Text(
                                      appState.profile.name.isNotEmpty
                                          ? appState.profile.name[0].toUpperCase()
                                          : 'U',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w900,
                                        fontSize: 16,
                                      ),
                                    )
                                  : null,
                            ),
                          ),

                          // Right: (Noti Bell) + (Logout and Close)
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              GestureDetector(
                                behavior: HitTestBehavior.opaque,
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => const NotificationsScreen(),
                                    ),
                                  );
                                },
                                child: Stack(
                                  clipBehavior: Clip.none,
                                  children: [
                                    Container(
                                      width: 40,
                                      height: 40,
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        shape: BoxShape.circle,
                                        border: Border.all(color: const Color(0xFFE4E4E7)),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withValues(alpha: 0.03),
                                            blurRadius: 6,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: const Icon(
                                        Icons.notifications_none_rounded,
                                        size: 20,
                                        color: Color(0xFF27272A),
                                      ),
                                    ),
                                    if (appState.unreadNotificationsCount > 0)
                                      Positioned(
                                        right: -2,
                                        top: -2,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 5,
                                            vertical: 1.5,
                                          ),
                                          decoration: BoxDecoration(
                                            color: crimson,
                                            borderRadius: BorderRadius.circular(999),
                                            border: Border.all(color: Colors.white, width: 1.5),
                                          ),
                                          child: Text(
                                            '${appState.unreadNotificationsCount}',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 9,
                                              fontWeight: FontWeight.w900,
                                            ),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              GestureDetector(
                                onTap: () => _showQuitAppModal(context, isAk),
                                child: Container(
                                  width: 40,
                                  height: 40,
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: const Color(0xFFE4E4E7)),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.03),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: const Icon(Icons.power_settings_new_rounded, size: 19, color: crimson),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),

                      // Center: App Logo (Transparent, without white background or border)
                      GestureDetector(
                        onTap: () => appState.navigate(Screen.home),
                        child: const SizedBox(
                          width: 42,
                          height: 42,
                          child: Center(child: ArakanEmblem(size: 34)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // 2. WELCOME BACK CARD: Welcome back + User name (left) | Verified pill (right)
                if (appState.isAuthenticated) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: const Color(0xFFE4E4E7)),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                          blurRadius: 20,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isAk ? 'ပြန်လည်ကြိုဆိုပါသည်' : 'Welcome back',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF71717A),
                                  fontWeight: FontWeight.w600,
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
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () => showKycVerificationModal(context, appState),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: appState.isVerified
                                  ? const Color(0xFFF0F9FF)
                                  : const Color(0xFFFFF1F2),
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
                                  appState.isVerified
                                      ? Icons.check_circle_rounded
                                      : Icons.error_outline_rounded,
                                  size: 15,
                                  color: appState.isVerified
                                      ? const Color(0xFF0284C7)
                                      : crimson,
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  appState.isVerified
                                      ? (isAk ? 'အတည်ပြုပြီး' : 'Verified')
                                      : (isAk ? 'အတည်မပြုရသေး' : 'Unverified'),
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: appState.isVerified
                                        ? const Color(0xFF0284C7)
                                        : crimson,
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
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF1F2),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFFFECDD3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline_rounded, color: crimson, size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              isAk
                                  ? 'ငွေပေးချေခြင်း၊ လက်ခံခြင်း၊ ငွေသွင်း/ငွေထုတ် လုပ်ဆောင်ချက်များကို အသုံးပြုရန် သင့်အကောင့်ကို အတည်ပြုပေးပါ။'
                                  : 'Please verify your identity to unlock Pay, Receive, Deposit, and Withdraw.',
                              style: const TextStyle(
                                fontSize: 11.5,
                                color: Color(0xFF27272A),
                                height: 1.35,
                              ),
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
                ] else ...[
                  buildWelcomeSignInCard(context, appState, embedded: false),
                ],
                const SizedBox(height: 14),

                // 3. PRIMARY 4-ACTION BOX: (Pay) | (Receive) | (Deposit) | (Withdraw)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: const Color(0xFFE4E4E7)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
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
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFFFECDD3)),
                              ),
                              child: Center(child: act['iconWidget'] as Widget),
                            ),
                            const SizedBox(height: 8),
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
                const SizedBox(height: 14),

                // 4. WALLET BALANCE BOX: Wallet Balance (AKD) + Eye Icon | ₳ 0.00
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: const Color(0xFFE4E4E7)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text(
                                isAk
                                    ? 'ပိုက်ဆံအိတ် လက်ကျန်ငွေ (AKD)'
                                    : 'Wallet Balance (AKD)',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF52525B),
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(width: 8),
                              GestureDetector(
                                onTap: () => appState.toggleBalance(),
                                child: Icon(
                                  appState.balanceHidden
                                      ? Icons.visibility_off_outlined
                                      : Icons.visibility_outlined,
                                  size: 16,
                                  color: const Color(0xFF71717A),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (appState.balanceHidden)
                        const Text(
                          '••••••••',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF18181B),
                            fontFamily: 'monospace',
                            letterSpacing: 3,
                          ),
                        )
                      else
                        Builder(
                          builder: (context) {
                            final double bal = appState.isAuthenticated ? appState.wallet.balance : 0.0;
                            final double fontSize = bal >= 1000000000
                                ? 20.0
                                : (bal >= 1000000
                                    ? 24.0
                                    : (bal >= 100000 ? 26.0 : 28.0));
                            return FittedBox(
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
                                      fontSize: fontSize * 0.85,
                                      fontWeight: FontWeight.w900,
                                      color: crimson,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                  Text(
                                    currencyFmt.format(bal),
                                    style: TextStyle(
                                      fontSize: fontSize,
                                      fontWeight: FontWeight.w900,
                                      color: const Color(0xFF09090B),
                                      fontFamily: 'monospace',
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // 5. FAVORITES SECTION (MOVED TO MIDDLE): My Favourites + view all
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        isAk ? 'ကျွန်ုပ်၏ စိတ်ကြိုက်များ' : 'My Favourites',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF27272A),
                        ),
                      ),
                      GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTap: () => _runVerifiedAction(
                          context,
                          appState,
                          isAk ? 'ကျွန်ုပ်၏ စိတ်ကြိုက်များ' : 'My Favourites',
                          () => appState.navigate(Screen.favourites),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                          child: Text(
                            isAk ? 'အားလုံးကြည့်ရန်' : 'view all',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: crimson,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      ...favUsers.map((fav) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 14),
                          child: GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: () => _runVerifiedAction(
                              context,
                              appState,
                              isAk ? 'ငွေပေးချေရန်' : 'Pay',
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
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: Color(fav.colorValue),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.06),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
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
                                const SizedBox(height: 6),
                                SizedBox(
                                  width: 54,
                                  child: Text(
                                    isAk ? fav.mm : fav.name,
                                    textAlign: TextAlign.center,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF3F3F46),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                      // (+) Add Favourite Button -> Go to Favorites
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
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: const Color(0xFFD4D4D8),
                                  width: 1.5,
                                ),
                              ),
                              alignment: Alignment.center,
                              child: const Icon(
                                Icons.add_rounded,
                                color: Color(0xFF52525B),
                                size: 20,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              isAk ? 'ထည့်ရန်' : 'Add',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF71717A),
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (favUsers.isEmpty) ...[
                        const SizedBox(width: 10),
                        GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onTap: () => _runVerifiedAction(
                            context,
                            appState,
                            isAk ? 'ကျွန်ုပ်၏ စိတ်ကြိုက်များ' : 'My Favourites',
                            () => appState.navigate(Screen.favourites),
                          ),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.person_add_alt_1_rounded, size: 16, color: crimson),
                                const SizedBox(width: 8),
                                Text(
                                  isAk
                                      ? 'စိတ်ကြိုက်လက်ခံသူ အသစ်ထည့်ပါ'
                                      : 'Add your first favourite recipient',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // 6. SECONDARY 4-SERVICE BOX: (+) Topup | (Bill) Bill payment | (Card) Account | (Clock) History
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: const Color(0xFFE4E4E7)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: secondaryActions.map((act) {
                      final label = act['label'] as String;
                      return GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTap: act['onTap'] as VoidCallback,
                        child: Column(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: const Color(0xFFFAFAFA),
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFFE4E4E7)),
                              ),
                              child: Center(child: act['iconWidget'] as Widget),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              label,
                              style: const TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF27272A),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 16),

                // 7. 4 MOVING ADS BANNER CAROUSEL (NO "ADS" TEXT)
                Column(
                  children: [
                    SizedBox(
                      height: 76,
                      child: PageView.builder(
                        controller: _adsPageController,
                        onPageChanged: (idx) {
                          setState(() {
                            _currentAdIndex = idx;
                          });
                        },
                        itemCount: _promoAds.length,
                        itemBuilder: (context, index) {
                          final ad = _promoAds[index];
                          return Container(
                            width: double.infinity,
                            margin: const EdgeInsets.symmetric(horizontal: 2),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: ad['bgGradient'] as List<Color>,
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                              ),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(
                                color: ad['borderColor'] as Color,
                                width: 1.1,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                                  blurRadius: 12,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 38,
                                  height: 38,
                                  decoration: BoxDecoration(
                                    color: ad['iconBg'] as Color,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: (ad['iconColor'] as Color).withValues(alpha: 0.25),
                                      width: 1.2,
                                    ),
                                  ),
                                  alignment: Alignment.center,
                                  child: Icon(
                                    ad['icon'] as IconData,
                                    color: ad['iconColor'] as Color,
                                    size: 19,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        isAk ? ad['titleAk'] : ad['titleEn'],
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          color: Color(0xFF0F172A),
                                          fontSize: 13,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        isAk ? ad['descAk'] : ad['descEn'],
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          color: Color(0xFF64748B),
                                          fontSize: 11.5,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Moving Indicator Dots
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(_promoAds.length, (idx) {
                        final isActive = idx == _currentAdIndex;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          width: isActive ? 18 : 6,
                          height: 5,
                          decoration: BoxDecoration(
                            color: isActive ? crimson : const Color(0xFFE2E8F0),
                            borderRadius: BorderRadius.circular(999),
                          ),
                        );
                      }),
                    ),
                  ],
                ),
                // Breathing space above floating navigation bar
                const SizedBox(height: 100),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
