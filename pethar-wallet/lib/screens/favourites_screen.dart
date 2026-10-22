import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../models/data.dart';
import '../theme.dart';
import '../widgets/keypad.dart';
import '../widgets/otp_dots.dart';

class FavouritesScreen extends StatefulWidget {
  const FavouritesScreen({Key? key}) : super(key: key);

  @override
  State<FavouritesScreen> createState() => _FavouritesScreenState();
}

class _FavouritesScreenState extends State<FavouritesScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  String _selectedCategory = 'All';
  bool _isEditMode = false;

  final List<String> _categories = const [
    'All',
    'Personal',
    'Family',
    'Friends',
    'Business',
  ];

  final List<int> _avatarColors = const [
    0xFF0284C7, // Blue
    0xFF2563EB, // Royal Blue
    0xFF059669, // Emerald
    0xFFDC2626, // Crimson
    0xFFD97706, // Amber
    0xFF7C3AED, // Purple
    0xFF0D9488, // Teal
  ];


  @override
  void initState() {
    super.initState();
    _searchCtrl.addListener(() {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  // ── PIN CODE VERIFICATION MODAL ──────────────────────────────────────────
  // Mandatory requirement: Must ask 6-digit PIN before adding, editing, or deleting
  Future<void> _askPinAndExecute({
    required BuildContext context,
    required String actionTitle,
    required String actionDescription,
    required VoidCallback onAuthorized,
    required String successMessage,
  }) async {
    String enteredPin = '';
    String? pinError;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (bottomSheetContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            void onDigitPressed(String digit) {
              if (digit == '.') return;
              if (enteredPin.length < 6) {
                setModalState(() {
                  enteredPin += digit;
                  pinError = null;
                });
                HapticFeedback.lightImpact();

                if (enteredPin.length == 6) {
                  // Verify PIN strictly against user profile PIN
                  final currentPin = Provider.of<AppState>(context, listen: false).profile.pin;
                  final isPinValid = currentPin.isNotEmpty && enteredPin == currentPin;
                  if (isPinValid) {
                    Navigator.pop(bottomSheetContext);
                    HapticFeedback.mediumImpact();
                    onAuthorized();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        behavior: SnackBarBehavior.floating,
                        backgroundColor: const Color(0xFF0F172A),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        margin: const EdgeInsets.all(16),
                        content: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: const BoxDecoration(
                                color: Color(0xFF10B981),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.check_rounded,
                                color: Colors.white,
                                size: 16,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                successMessage,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  } else {
                    HapticFeedback.heavyImpact();
                    setModalState(() {
                      pinError = 'Incorrect PIN. Please try again.';
                      enteredPin = '';
                    });
                  }
                }
              }
            }

            void onDeletePressed() {
              if (enteredPin.isNotEmpty) {
                HapticFeedback.selectionClick();
                setModalState(() {
                  enteredPin = enteredPin.substring(0, enteredPin.length - 1);
                  pinError = null;
                });
              }
            }

            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              padding: EdgeInsets.fromLTRB(
                20,
                16,
                20,
                MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Drag Handle
                  Container(
                    width: 42,
                    height: 5,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Lock / Shield Icon
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: const Color(0xFFFEE2E2),
                        width: 2,
                      ),
                    ),
                    child: const Icon(
                      Icons.shield_outlined,
                      color: crimson,
                      size: 28,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Title
                  Text(
                    actionTitle,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    actionDescription,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // PIN Dots
                  OtpDots(length: 6, filledCount: enteredPin.length),

                  if (pinError != null) ...[
                    const SizedBox(height: 10),
                    Text(
                      pinError!,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: crimson,
                      ),
                    ),
                  ],

                  const SizedBox(height: 14),

                  // Numeric Keypad
                  Keypad(
                    onKeyPressed: onDigitPressed,
                    onDelete: onDeletePressed,
                  ),
                  const SizedBox(height: 8),

                  // Cancel Button
                  TextButton(
                    onPressed: () => Navigator.pop(bottomSheetContext),
                    child: const Text(
                      'Cancel',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // ── ADD / EDIT CONTACT MODAL ─────────────────────────────────────────────
  // ── ADD / EDIT CONTACT MODAL ─────────────────────────────────────────────
  void _openAddOrEditContactModal({
    required BuildContext context,
    required AppState appState,
    FavoriteContact? existingContact,
    int? contactIndex,
  }) {
    final bool isEdit = existingContact != null && contactIndex != null;
    final isAk = appState.language == 'ak';

    if (!isEdit && appState.favoriteContactsList.length >= 50) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isAk
                ? 'စိတ်ကြိုက်စာရင်း အများဆုံး ၅၀ ထိသာ ထည့်နိုင်ပါသည်'
                : 'Maximum limit of 50 favourites reached',
          ),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final favNameCtrl = TextEditingController(text: existingContact?.name ?? '');
    final usernameOrUidCtrl = TextEditingController(
      text: existingContact?.phone.isNotEmpty == true
          ? existingContact!.phone
          : (existingContact?.id ?? ''),
    );
    final noteCtrl = TextEditingController(
      text: existingContact?.note.isNotEmpty == true
          ? existingContact!.note
          : (existingContact?.mm != existingContact?.name ? (existingContact?.mm ?? '') : ''),
    );
    String selectedCategory = existingContact?.category ?? 'Friends';
    int selectedColor = existingContact?.colorValue ?? _avatarColors[0];
    int modalStep = 1; // 1: Input Form, 2: Confirm Details

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalCtx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final favName = favNameCtrl.text.trim();
            final rawInput = usernameOrUidCtrl.text.trim();
            final note = noteCtrl.text.trim();

            // Resolve the 4 details: Nickname, User Name, Username, UID
            final nickname = favName;
            String username = '';
            String uid = '';
            String userName = '';

            if (rawInput.startsWith('@')) {
              username = rawInput;
              final handle = rawInput.substring(1);
              userName = handle
                  .split(RegExp(r'[_.]'))
                  .where((s) => s.isNotEmpty)
                  .map((s) => '${s[0].toUpperCase()}${s.substring(1)}')
                  .join(' ');
              if (userName.isEmpty) userName = favName;
              uid = existingContact?.id ??
                  generateUserUid(userCount: appState.favoriteContactsList.length + 1);
            } else if (RegExp(r'^[0-9]+$').hasMatch(rawInput)) {
              uid = rawInput;
              final slug = favName
                  .toLowerCase()
                  .replaceAll(RegExp(r'[^a-z0-9]'), '_')
                  .replaceAll(RegExp(r'_+'), '_')
                  .replaceAll(RegExp(r'^_|_$'), '');
              username = slug.isNotEmpty
                  ? '@$slug'
                  : (uid.isNotEmpty ? '@$uid' : '');
              userName = favName;
            } else if (rawInput.startsWith('ARAK-') ||
                rawInput.startsWith('PTR-') ||
                rawInput.startsWith('0x')) {
              uid = rawInput;
              final slug = favName.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '_');
              username = slug.isNotEmpty ? '@$slug' : (uid.isNotEmpty ? '@$uid' : '');
              userName = favName;
            } else {
              username = rawInput.isNotEmpty ? '@$rawInput' : '';
              userName = rawInput
                  .split(RegExp(r'[_.]'))
                  .where((s) => s.isNotEmpty)
                  .map((s) => '${s[0].toUpperCase()}${s.substring(1)}')
                  .join(' ');
              if (userName.isEmpty) userName = favName;
              uid = existingContact?.id ??
                  generateUserUid(userCount: appState.favoriteContactsList.length + 1);
            }

            final initials = (favName.isNotEmpty ? favName : 'U')
                .split(' ')
                .where((e) => e.isNotEmpty)
                .map((e) => e[0])
                .take(2)
                .join('')
                .toUpperCase();

            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              padding: EdgeInsets.fromLTRB(
                20,
                16,
                20,
                MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Drag Handle
                    Center(
                      child: Container(
                        width: 42,
                        height: 5,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE2E8F0),
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    // ══════════════════════════════════════════════════════
                    // STEP 1: INPUT FORM
                    // ══════════════════════════════════════════════════════
                    if (modalStep == 1) ...[
                      // Header Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isEdit
                                    ? (isAk ? 'အချက်အလက် ပြင်ဆင်ရန်' : 'Edit Favourite')
                                    : (isAk ? 'စိတ်ကြိုက်အသစ် ထည့်ရန်' : 'Add New Favourite'),
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                isAk
                                    ? 'အောက်ပါ အချက်အလက်များကို ဖြည့်စွက်ပါ'
                                    : 'Fill in recipient information below',
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                          GestureDetector(
                            onTap: () => Navigator.pop(modalCtx),
                            child: Container(
                              width: 32,
                              height: 32,
                              decoration: const BoxDecoration(
                                color: Color(0xFFF1F5F9),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.close_rounded,
                                size: 18,
                                color: Color(0xFF64748B),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Avatar Preview & Color Palette
                      Center(
                        child: Column(
                          children: [
                            Container(
                              width: 58,
                              height: 58,
                              decoration: BoxDecoration(
                                color: Color(selectedColor),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Color(selectedColor).withValues(alpha: 0.3),
                                    blurRadius: 10,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                initials.isNotEmpty ? initials : 'U',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                            Wrap(
                              spacing: 8,
                              children: _avatarColors.map((c) {
                                final isSelected = c == selectedColor;
                                return GestureDetector(
                                  onTap: () => setModalState(() => selectedColor = c),
                                  child: Container(
                                    width: 26,
                                    height: 26,
                                    decoration: BoxDecoration(
                                      color: Color(c),
                                      shape: BoxShape.circle,
                                      border: isSelected
                                          ? Border.all(color: const Color(0xFF0F172A), width: 2.5)
                                          : null,
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),

                      // Favourite Name
                      Text(
                        isAk ? 'စိတ်ကြိုက်အမည်' : 'Favourite Name',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF334155),
                        ),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: favNameCtrl,
                        onChanged: (_) => setModalState(() {}),
                        textCapitalization: TextCapitalization.words,
                        decoration: InputDecoration(
                          hintText: isAk ? 'စိတ်ကြိုက် အမည် ရိုက်ထည့်ပါ' : 'Enter favourite name',
                          hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: crimson, width: 1.6),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Péthar wallet username or UID
                      Text(
                        isAk ? 'Péthar Wallet အသုံးပြုသူအမည် သို့မဟုတ် UID' : 'Péthar Wallet Username or UID',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF334155),
                        ),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: usernameOrUidCtrl,
                        onChanged: (_) => setModalState(() {}),
                        keyboardType: TextInputType.text,
                        decoration: InputDecoration(
                          hintText: isAk ? 'အသုံးပြုသူအမည် သို့မဟုတ် UID' : 'Username or UID',
                          hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: crimson, width: 1.6),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Note optional
                      Text(
                        isAk ? 'မှတ်ချက် (စိတ်ကြိုက်)' : 'Note (Optional)',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF334155),
                        ),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: noteCtrl,
                        decoration: InputDecoration(
                          hintText: isAk ? 'မှတ်ချက်ရေးရန် (စိတ်ကြိုက်)' : 'Add note (optional)',
                          hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: crimson, width: 1.6),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Category
                      Text(
                        isAk ? 'အမျိုးအစား' : 'Category',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF334155),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _categories.where((c) => c != 'All').map((cat) {
                          final isSelected = cat == selectedCategory;
                          return ChoiceChip(
                            label: Text(
                              cat,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                color: isSelected ? Colors.white : const Color(0xFF475569),
                              ),
                            ),
                            selected: isSelected,
                            selectedColor: const Color(0xFF0F172A),
                            backgroundColor: const Color(0xFFF1F5F9),
                            onSelected: (val) {
                              if (val) setModalState(() => selectedCategory = cat);
                            },
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 24),

                      // Button: Next
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: favNameCtrl.text.trim().isEmpty ||
                                  usernameOrUidCtrl.text.trim().isEmpty
                              ? null
                              : () {
                                  setModalState(() {
                                    modalStep = 2;
                                  });
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: crimson,
                            foregroundColor: Colors.white,
                            disabledBackgroundColor: const Color(0xFFE2E8F0),
                            disabledForegroundColor: const Color(0xFF94A3B8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            elevation: 0,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                isAk ? 'ရှေ့သို့' : 'Next',
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Icon(Icons.arrow_forward_rounded, size: 18),
                            ],
                          ),
                        ),
                      ),
                    ]

                    // ══════════════════════════════════════════════════════
                    // STEP 2: CONFIRM DETAILS PAGE
                    // ══════════════════════════════════════════════════════
                    else if (modalStep == 2) ...[
                      // Header Row with Back Button
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              GestureDetector(
                                onTap: () => setModalState(() => modalStep = 1),
                                child: Container(
                                  width: 34,
                                  height: 34,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(
                                    Icons.arrow_back_ios_new_rounded,
                                    size: 15,
                                    color: Color(0xFF1E293B),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    isAk ? 'အချက်အလက် အတည်ပြုပါ' : 'Confirm Details',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w900,
                                      color: Color(0xFF0F172A),
                                    ),
                                  ),
                                  Text(
                                    isAk
                                        ? 'လက်ခံသူ အချက်အလက်ကို စစ်ဆေးပါ'
                                        : 'Please verify recipient information',
                                    style: const TextStyle(
                                      fontSize: 11.5,
                                      color: Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          GestureDetector(
                            onTap: () => Navigator.pop(modalCtx),
                            child: Container(
                              width: 32,
                              height: 32,
                              decoration: const BoxDecoration(
                                color: Color(0xFFF1F5F9),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.close_rounded,
                                size: 18,
                                color: Color(0xFF64748B),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Avatar Center
                      Center(
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: Color(selectedColor),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2.5),
                            boxShadow: [
                              BoxShadow(
                                color: Color(selectedColor).withValues(alpha: 0.28),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            initials.isNotEmpty ? initials : 'U',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),

                      // Confirm Details Card (1. Nickname, 2. User Name, 3. Username, 4. UID)
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        child: Column(
                          children: [
                            // Nickname
                            _buildConfirmDetailRow(
                              label: isAk ? 'အမည်ပြောင်' : 'Nickname',
                              value: nickname,
                              isBold: true,
                            ),
                            const Divider(height: 18, color: Color(0xFFE2E8F0)),

                            // User Name
                            _buildConfirmDetailRow(
                              label: isAk ? 'အသုံးပြုသူ အမည်ရင်း' : 'User Name',
                              value: userName,
                              isBold: true,
                            ),
                            const Divider(height: 18, color: Color(0xFFE2E8F0)),

                            // Username
                            _buildConfirmDetailRow(
                              label: 'Username',
                              value: username,
                              isMono: true,
                              valueColor: crimson,
                            ),
                            const Divider(height: 18, color: Color(0xFFE2E8F0)),

                            // UID
                            _buildConfirmDetailRow(
                              label: 'UID',
                              value: uid,
                              isMono: true,
                            ),

                            if (note.isNotEmpty) ...[
                              const Divider(height: 18, color: Color(0xFFE2E8F0)),
                              _buildConfirmDetailRow(
                                label: isAk ? 'မှတ်ချက်' : 'Note',
                                value: note,
                              ),
                            ],

                            const Divider(height: 18, color: Color(0xFFE2E8F0)),
                            _buildConfirmDetailRow(
                              label: isAk ? 'အမျိုးအစား' : 'Category',
                              value: selectedCategory,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Confirm Button -> Asks for PIN number!
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: () {
                            // Close modal first
                            Navigator.pop(modalCtx);

                            final newContact = FavoriteContact(
                              name: nickname,
                              mm: note.isNotEmpty ? note : userName,
                              id: uid,
                              phone: username,
                              initials: initials.isNotEmpty ? initials : 'U',
                              colorValue: selectedColor,
                              category: selectedCategory,
                              bank: 'Péthar Wallet',
                              note: note,
                            );

                            // Then prompt for 6-digit PIN code to commit
                            _askPinAndExecute(
                              context: context,
                              actionTitle: isEdit
                                  ? (isAk ? 'ပြင်ဆင်မှု အတည်ပြုရန်' : 'Authorize Edit Contact')
                                  : (isAk ? 'အသစ်ထည့်ရန် အတည်ပြုပါ' : 'Authorize Add Contact'),
                              actionDescription: isEdit
                                  ? (isAk
                                      ? '"$nickname" အား ပြင်ဆင်ရန် PIN ၆-လုံး ရိုက်ထည့်ပါ'
                                      : 'Enter 6-digit PIN to update recipient "$nickname"')
                                  : (isAk
                                      ? '"$nickname" အား စိတ်ကြိုက်ထည့်ရန် PIN ၆-လုံး ရိုက်ထည့်ပါ'
                                      : 'Enter 6-digit PIN to save recipient "$nickname"'),
                              onAuthorized: () {
                                if (isEdit) {
                                  appState.updateFavoriteContact(contactIndex, newContact);
                                } else {
                                  appState.addFavoriteContact(newContact);
                                }
                              },
                              successMessage: isEdit
                                  ? (isAk
                                      ? 'စိတ်ကြိုက် "$nickname" ပြင်ဆင်ပြီးပါပြီ'
                                      : 'Recipient "$nickname" updated successfully')
                                  : (isAk
                                      ? 'စိတ်ကြိုက် "$nickname" အသစ်ထည့်ပြီးပါပြီ'
                                      : 'Recipient "$nickname" added to favourites'),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: crimson,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            elevation: 0,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.check_circle_rounded, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                isAk ? 'အတည်ပြုမည် (PIN နှိပ်မည်)' : 'Confirm',
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
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
            );
          },
        );
      },
    );
  }

  Widget _buildConfirmDetailRow({
    required String label,
    required String value,
    bool isBold = false,
    bool isMono = false,
    Color? valueColor,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: Color(0xFF64748B),
            ),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
                fontFamily: isMono ? 'monospace' : null,
                color: valueColor ?? const Color(0xFF0F172A),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── DELETE CONFIRMATION FLOW ─────────────────────────────────────────────
  void _confirmDeleteContact({
    required BuildContext context,
    required AppState appState,
    required FavoriteContact contact,
    required int index,
  }) {
    final isAk = appState.language == 'ak';

    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: Color(0xFFFEF2F2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.delete_outline_rounded, color: crimson, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                isAk ? 'စိတ်ကြိုက်စာရင်းမှ ဖျက်ရန်' : 'Delete Favourite',
                style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
        content: Text(
          isAk
              ? '"${contact.name}" ကို စိတ်ကြိုက်စာရင်းမှ ဖျက်ပစ်ရန် သေချာပါသလား? အတည်ပြုရန် လျှို့ဝှက်နံပါတ် ရိုက်ထည့်ရပါမည်။'
              : 'Are you sure you want to remove "${contact.name}" from your favourites? You will need to enter your 6-digit PIN to confirm.',
          style: const TextStyle(fontSize: 13, color: Color(0xFF475569)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: Text(
              isAk ? 'မလုပ်တော့ပါ' : 'Cancel',
              style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w700),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogCtx);
              // Open PIN verification before deleting!
              _askPinAndExecute(
                context: context,
                actionTitle: 'Authorize Delete',
                actionDescription: 'Enter your 6-digit PIN to delete "${contact.name}"',
                onAuthorized: () {
                  appState.deleteFavoriteContact(index);
                },
                successMessage: 'Removed "${contact.name}" from favourites',
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: crimson,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text(
              isAk ? 'ဖျက်မည်' : 'Delete',
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAk = appState.language == 'ak';
    final contacts = appState.favoriteContactsList;

    // Filter by category and search query (name or category)
    final query = _searchCtrl.text.trim().toLowerCase();
    final filteredContacts = contacts.asMap().entries.where((entry) {
      final contact = entry.value;
      final matchesCategory = _selectedCategory == 'All' ||
          contact.category.toLowerCase() == _selectedCategory.toLowerCase();
      final matchesQuery = query.isEmpty ||
          contact.name.toLowerCase().contains(query) ||
          contact.category.toLowerCase().contains(query);
      return matchesCategory && matchesQuery;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      floatingActionButton: FloatingActionButton(
        heroTag: 'add_fav_fab',
        backgroundColor: crimson,
        elevation: 3,
        shape: const CircleBorder(),
        onPressed: () {
          if (contacts.length >= 50) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  isAk
                      ? 'စိတ်ကြိုက်စာရင်း အများဆုံး ၅၀ ထိသာ ထည့်နိုင်ပါသည်'
                      : 'Maximum limit of 50 favourites reached',
                ),
                behavior: SnackBarBehavior.floating,
              ),
            );
            return;
          }
          _openAddOrEditContactModal(
            context: context,
            appState: appState,
          );
        },
        child: const Icon(Icons.add_rounded, color: Colors.white, size: 28),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildAppBar(context, appState, isAk),

            // Search Bar & Filter Chips
            _buildSearchAndFilters(context, isAk, contacts.length),

            // Contact List
            Expanded(
              child: filteredContacts.isEmpty
                  ? _buildEmptyState(context, appState, isAk)
                  : ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 88),
                      itemCount: filteredContacts.length,
                      itemBuilder: (ctx, i) {
                        final entry = filteredContacts[i];
                        final contact = entry.value;
                        final originalIndex = entry.key;
                        return _buildContactCard(
                          context,
                          appState,
                          contact,
                          originalIndex,
                          isAk,
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  // ── APP BAR ──────────────────────────────────────────────────────────────
  Widget _buildAppBar(BuildContext context, AppState appState, bool isAk) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: Color(0xFFE2E8F0), width: 1),
        ),
      ),
      child: Row(
        children: [
          // Back Button
          GestureDetector(
            onTap: () => appState.goBack(),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.arrow_back_ios_new_rounded,
                color: Color(0xFF1E293B),
                size: 16,
              ),
            ),
          ),

          // Centered Title in the Middle
          Expanded(
            child: Center(
              child: Text(
                isAk ? 'ကျွန်ုပ်၏ စိတ်ကြိုက်များ' : 'My Favourites',
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                ),
              ),
            ),
          ),

          // Top Action Button: Edit / Done
          GestureDetector(
            onTap: () {
              setState(() {
                _isEditMode = !_isEditMode;
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
              decoration: BoxDecoration(
                color: _isEditMode ? crimson : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(
                  color: _isEditMode ? crimson : const Color(0xFFE2E8F0),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _isEditMode ? Icons.check_rounded : Icons.edit_outlined,
                    size: 15,
                    color: _isEditMode ? Colors.white : const Color(0xFF1E293B),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    _isEditMode
                        ? (isAk ? 'ပြီးပြီ' : 'Done')
                        : (isAk ? 'ပြင်ဆင်ရန်' : 'Edit'),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: _isEditMode ? Colors.white : const Color(0xFF1E293B),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── SEARCH & FILTER ROW ──────────────────────────────────────────────────
  Widget _buildSearchAndFilters(BuildContext context, bool isAk, int totalCount) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Column(
        children: [
          // Search Input
          Container(
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: TextField(
              controller: _searchCtrl,
              style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A)),
              decoration: InputDecoration(
                hintText: isAk
                    ? 'အမည်ဖြင့် ရှာဖွေပါ...'
                    : 'Search by name...',
                hintStyle: const TextStyle(fontSize: 12.5, color: Color(0xFF94A3B8)),
                prefixIcon: const Icon(Icons.search_rounded, size: 20, color: Color(0xFF64748B)),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? GestureDetector(
                        onTap: () => _searchCtrl.clear(),
                        child: const Icon(Icons.cancel_rounded, size: 18, color: Color(0xFF94A3B8)),
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Category Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _categories.map((cat) {
                final isSelected = cat == _selectedCategory;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(
                      cat == 'All' ? (isAk ? 'အားလုံး' : 'All') : cat,
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                        color: isSelected ? Colors.white : const Color(0xFF475569),
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: const Color(0xFF0F172A),
                    backgroundColor: const Color(0xFFF8FAFC),
                    side: BorderSide(
                      color: isSelected ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    onSelected: (val) {
                      if (val) setState(() => _selectedCategory = cat);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Small info banner under category filter when Edit mode is active
          if (_isEditMode) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8.5),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.info_outline_rounded,
                    size: 15,
                    color: Color(0xFF64748B),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      isAk
                          ? 'ပင်မစာမျက်နှာတွင် စိတ်ကြိုက် ၅၀ ထိ နေရာရွှေ့ခြင်း၊ ဖျက်ခြင်း သို့မဟုတ် ထည့်သွင်းခြင်း ပြုလုပ်နိုင်ပါသည်'
                          : 'You can reorder, remove or add up to 50 favourites on Home screen.',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF64748B),
                        height: 1.35,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ── CONTACT CARD ─────────────────────────────────────────────────────────
  Widget _buildContactCard(
    BuildContext context,
    AppState appState,
    FavoriteContact contact,
    int index,
    bool isAk,
  ) {
    Color getCategoryColor(String cat) {
      switch (cat.toLowerCase()) {
        case 'personal':
          return const Color(0xFF6366F1);
        case 'family':
          return const Color(0xFF10B981);
        case 'business':
          return const Color(0xFFF59E0B);
        default:
          return const Color(0xFF0284C7);
      }
    }

    final catColor = getCategoryColor(contact.category);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _isEditMode ? const Color(0xFFCBD5E1) : const Color(0xFFE2E8F0),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            if (_isEditMode) {
              _openAddOrEditContactModal(
                context: context,
                appState: appState,
                existingContact: contact,
                contactIndex: index,
              );
            } else {
              appState.startPayForContact(
                name: contact.name,
                id: contact.id,
                initials: contact.initials,
                colorValue: contact.colorValue,
              );
            }
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // User photo / Avatar
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: Color(contact.colorValue),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: Color(contact.colorValue).withValues(alpha: 0.25),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: contact.initials == 'U'
                      ? const Icon(Icons.person_outline_rounded, color: Colors.white, size: 22)
                      : Text(
                          contact.initials,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                ),
                const SizedBox(width: 14),

                // User Name and Category badge ONLY (no red hover, no arrow, no UID, no note)
                Expanded(
                  child: Row(
                    children: [
                      Flexible(
                        child: Text(
                          contact.name,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Category Pill
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: catColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          contact.category,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: catColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Edit & Delete Action Buttons (shown only in Edit mode)
                if (_isEditMode) ...[
                  const SizedBox(width: 8),
                  // Edit Button (pencil)
                  GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => _openAddOrEditContactModal(
                      context: context,
                      appState: appState,
                      existingContact: contact,
                      contactIndex: index,
                    ),
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: const Icon(
                        Icons.edit_outlined,
                        size: 16,
                        color: Color(0xFF334155),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  // Delete Button (trash)
                  GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => _confirmDeleteContact(
                      context: context,
                      appState: appState,
                      contact: contact,
                      index: index,
                    ),
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFFEE2E2)),
                      ),
                      child: const Icon(
                        Icons.delete_outline_rounded,
                        size: 16,
                        color: crimson,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── EMPTY STATE ──────────────────────────────────────────────────────────
  Widget _buildEmptyState(BuildContext context, AppState appState, bool isAk) {
    final hasSearch = _searchCtrl.text.isNotEmpty || _selectedCategory != 'All';
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: const BoxDecoration(
                color: Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: Icon(
                hasSearch ? Icons.person_search_rounded : Icons.star_outline_rounded,
                size: 36,
                color: const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              hasSearch
                  ? (isAk ? 'ရှာဖွေမှု မတွေ့ရှိပါ' : 'No Favourites Found')
                  : (isAk ? 'စိတ်ကြိုက်စာရင်း မရှိသေးပါ' : 'No Favourites Yet'),
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              hasSearch
                  ? (isAk
                      ? 'အခြားအချက်အလက်ဖြင့် ရှာဖွေပါ သို့မဟုတ် အသစ်ထည့်ပါ'
                      : 'Try adjusting your search query or add a new favourite recipient.')
                  : (isAk
                      ? 'ငွေလွှဲမြန်ဆန်စေရန် သင်ယုံကြည်ရသော လက်ခံသူများကို စိတ်ကြိုက်စာရင်းတွင် ထည့်သွင်းပါ'
                      : 'Add your trusted recipients here for quick and instant one-tap transfers.'),
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 18),
            if (hasSearch)
              ElevatedButton.icon(
                onPressed: () {
                  _searchCtrl.clear();
                  setState(() => _selectedCategory = 'All');
                },
                icon: const Icon(Icons.refresh_rounded, size: 16),
                label: Text(isAk ? 'မူလအတိုင်း ပြန်ကြည့်မည်' : 'Clear Filter'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              )
            else
              ElevatedButton.icon(
                onPressed: () => _openAddOrEditContactModal(
                  context: context,
                  appState: appState,
                ),
                icon: const Icon(Icons.add_rounded, size: 18),
                label: Text(isAk ? 'စိတ်ကြိုက်အသစ် ထည့်မည်' : 'Add New Favourite'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: crimson,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
