import 'dart:ui' as ui;

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
    0xFF475569, // Slate
    0xFFDC2626, // Crimson
    0xFF0891B2, // Cyan
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
                                color: crimson,
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
                color: const Color(0xFF0A0A0A),
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
                      color: const Color(0xFF262626),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Lock / Shield Icon
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A0A0C),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: const Color(0xFF2A0A0E),
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
                      color: Color(0xFFF4F4F5),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    actionDescription,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: Color(0xFFD4D4D8),
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
                        color: Color(0xFFD4D4D8),
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
    String selectedCategory = existingContact?.category ?? 'Personal';
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
                color: const Color(0xFF0A0A0A),
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              padding: EdgeInsets.fromLTRB(
                20,
                16,
                20,
                MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: SingleChildScrollView(
                physics: const ClampingScrollPhysics(),
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
                          color: const Color(0xFF262626),
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
                                  color: Color(0xFFF4F4F5),
                                  letterSpacing: -0.2,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                isAk
                                    ? 'အောက်ပါ အချက်အလက်များကို ဖြည့်စွက်ပါ'
                                    : 'Fill in recipient information below',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFFD4D4D8),
                                ),
                              ),
                            ],
                          ),
                          GestureDetector(
                            onTap: () => Navigator.pop(modalCtx),
                            child: Container(
                              width: 34,
                              height: 34,
                              decoration: BoxDecoration(
                                color: const Color(0xFF0A0A0A),
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFF262626)),
                              ),
                              child: const Icon(
                                Icons.close_rounded,
                                size: 17,
                                color: Color(0xFFD4D4D8),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Avatar Preview & Color Palette
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [Color(0xFF161616), Color(0xFF0A0A0A)],
                          ),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFF262626)),
                        ),
                        child: Column(
                          children: [
                            AnimatedContainer(
                              duration: const Duration(milliseconds: 180),
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                color: Color(selectedColor),
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFF0A0A0A), width: 3),
                                boxShadow: [
                                  BoxShadow(
                                    color: Color(selectedColor).withValues(alpha: 0.35),
                                    blurRadius: 18,
                                    offset: const Offset(0, 6),
                                  ),
                                ],
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                initials.isNotEmpty ? initials : 'U',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 21,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Wrap(
                              alignment: WrapAlignment.center,
                              spacing: 12,
                              runSpacing: 12,
                              children: _avatarColors.map((c) {
                                final isSelected = c == selectedColor;
                                return GestureDetector(
                                  onTap: () => setModalState(() => selectedColor = c),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 160),
                                    width: 30,
                                    height: 30,
                                    decoration: BoxDecoration(
                                      color: Color(c),
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: isSelected ? Colors.white : Colors.transparent,
                                        width: 2,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Color(c).withValues(
                                            alpha: isSelected ? 0.5 : 0.22,
                                          ),
                                          blurRadius: isSelected ? 0 : 6,
                                          spreadRadius: isSelected ? 3 : 0,
                                          offset: isSelected ? Offset.zero : const Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: isSelected
                                        ? const Icon(
                                            Icons.check_rounded,
                                            size: 15,
                                            color: Colors.white,
                                          )
                                        : null,
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Favourite Name
                      _buildFieldLabel(isAk ? 'စိတ်ကြိုက်အမည်' : 'Favourite Name'),
                      const SizedBox(height: 8),
                      TextField(
                        controller: favNameCtrl,
                        onChanged: (_) => setModalState(() {}),
                        textCapitalization: TextCapitalization.words,
                        style: _fieldTextStyle,
                        cursorColor: crimson,
                        decoration: _fieldDecoration(
                          hint: isAk ? 'စိတ်ကြိုက် အမည် ရိုက်ထည့်ပါ' : 'Enter favourite name',
                          icon: Icons.person_outline_rounded,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Péthar wallet username or UID
                      _buildFieldLabel(
                        isAk
                            ? 'Péthar Wallet အသုံးပြုသူအမည် သို့မဟုတ် UID'
                            : 'Péthar Wallet Username or UID',
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: usernameOrUidCtrl,
                        onChanged: (_) => setModalState(() {}),
                        keyboardType: TextInputType.text,
                        style: _fieldTextStyle,
                        cursorColor: crimson,
                        decoration: _fieldDecoration(
                          hint: isAk ? 'အသုံးပြုသူအမည် သို့မဟုတ် UID' : 'Username or UID',
                          icon: Icons.alternate_email_rounded,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Note optional
                      _buildFieldLabel(
                        isAk ? 'မှတ်ချက်' : 'Note',
                        trailing: isAk ? 'စိတ်ကြိုက်' : 'OPTIONAL',
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: noteCtrl,
                        style: _fieldTextStyle,
                        cursorColor: crimson,
                        decoration: _fieldDecoration(
                          hint: isAk ? 'မှတ်ချက်ရေးရန် (စိတ်ကြိုက်)' : 'Add note (optional)',
                          icon: Icons.sticky_note_2_outlined,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Category
                      _buildFieldLabel(isAk ? 'အမျိုးအစား' : 'Category'),
                      const SizedBox(height: 10),
                      _buildCategoryGrid(
                        selected: selectedCategory,
                        onSelect: (cat) => setModalState(() => selectedCategory = cat),
                      ),
                      const SizedBox(height: 24),

                      // Button: Next
                      SizedBox(
                        width: double.infinity,
                        height: 52,
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
                            disabledBackgroundColor: const Color(0xFF0A0A0A),
                            disabledForegroundColor: const Color(0xFF9AA9BC),
                            shadowColor: crimson.withValues(alpha: 0.35),
                            elevation: 6,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                isAk ? 'ရှေ့သို့' : 'Next',
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.2,
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
                                    color: const Color(0xFF0A0A0A),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(
                                    Icons.arrow_back_ios_new_rounded,
                                    size: 15,
                                    color: Color(0xFFD4D4D8),
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
                                      color: Color(0xFFF4F4F5),
                                    ),
                                  ),
                                  Text(
                                    isAk
                                        ? 'လက်ခံသူ အချက်အလက်ကို စစ်ဆေးပါ'
                                        : 'Please verify recipient information',
                                    style: const TextStyle(
                                      fontSize: 11.5,
                                      color: Color(0xFFD4D4D8),
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
                                color: Color(0xFF0A0A0A),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.close_rounded,
                                size: 18,
                                color: Color(0xFFD4D4D8),
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
                            border: Border.all(color: const Color(0xFF0A0A0A), width: 2.5),
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
                          color: const Color(0xFF000000),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFF262626)),
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
                            const Divider(height: 18, color: Color(0xFF262626)),

                            // User Name
                            _buildConfirmDetailRow(
                              label: isAk ? 'အသုံးပြုသူ အမည်ရင်း' : 'User Name',
                              value: userName,
                              isBold: true,
                            ),
                            const Divider(height: 18, color: Color(0xFF262626)),

                            // Username
                            _buildConfirmDetailRow(
                              label: 'Username',
                              value: username,
                              isMono: true,
                              valueColor: crimson,
                            ),
                            const Divider(height: 18, color: Color(0xFF262626)),

                            // UID
                            _buildConfirmDetailRow(
                              label: 'UID',
                              value: uid,
                              isMono: true,
                            ),

                            if (note.isNotEmpty) ...[
                              const Divider(height: 18, color: Color(0xFF262626)),
                              _buildConfirmDetailRow(
                                label: isAk ? 'မှတ်ချက်' : 'Note',
                                value: note,
                              ),
                            ],

                            const Divider(height: 18, color: Color(0xFF262626)),
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

  static const TextStyle _fieldTextStyle = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: Color(0xFFF4F4F5),
  );

  Widget _buildFieldLabel(String text, {String? trailing}) {
    return Row(
      children: [
        Flexible(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w800,
              color: Color(0xFFD4D4D8),
              letterSpacing: 0.1,
            ),
          ),
        ),
        if (trailing != null) ...[
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
            decoration: BoxDecoration(
              color: const Color(0xFF0A0A0A),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              trailing,
              style: const TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.4,
                color: Color(0xFFD4D4D8),
              ),
            ),
          ),
        ],
      ],
    );
  }

  InputDecoration _fieldDecoration({required String hint, required IconData icon}) {
    OutlineInputBorder border(Color color, double width) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: color, width: width),
        );

    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(
        color: Color(0xFFD4D4D8),
        fontSize: 13,
        fontWeight: FontWeight.w500,
      ),
      prefixIcon: Icon(icon, size: 18, color: const Color(0xFFD4D4D8)),
      prefixIconConstraints: const BoxConstraints(minWidth: 44, minHeight: 44),
      filled: true,
      fillColor: const Color(0xFF0A0A0A),
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: border(const Color(0xFF262626), 1),
      enabledBorder: border(const Color(0xFF262626), 1),
      focusedBorder: border(crimson, 1.6),
    );
  }

  IconData _categoryIcon(String category) {
    switch (category) {
      case 'Personal':
        return Icons.person_rounded;
      case 'Family':
        return Icons.family_restroom_rounded;
      case 'Friends':
        return Icons.favorite_rounded;
      case 'Business':
        return Icons.work_rounded;
      default:
        return Icons.label_outline_rounded;
    }
  }

  Widget _buildCategoryGrid({
    required String selected,
    required ValueChanged<String> onSelect,
  }) {
    final cats = _categories.where((c) => c != 'All').toList();
    final rows = <Widget>[];

    for (var i = 0; i < cats.length; i += 2) {
      final pair = cats.skip(i).take(2).toList();
      if (i > 0) rows.add(const SizedBox(height: 10));
      rows.add(
        Row(
          children: [
            Expanded(
              child: _buildCategoryTile(
                label: pair[0],
                isSelected: pair[0] == selected,
                onTap: () => onSelect(pair[0]),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: pair.length > 1
                  ? _buildCategoryTile(
                      label: pair[1],
                      isSelected: pair[1] == selected,
                      onTap: () => onSelect(pair[1]),
                    )
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      );
    }

    return Column(children: rows);
  }

  Widget _buildCategoryTile({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        height: 46,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF111111) : const Color(0xFF000000),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFF111111) : const Color(0xFF262626),
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF111111).withValues(alpha: 0.18),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            Icon(
              _categoryIcon(label),
              size: 16,
              color: isSelected ? Colors.white : const Color(0xFFD4D4D8),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w700,
                  color: isSelected ? Colors.white : const Color(0xFFD4D4D8),
                ),
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle_rounded,
                size: 15,
                color: Colors.white,
              ),
          ],
        ),
      ),
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
              color: Color(0xFFD4D4D8),
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
                color: valueColor ?? const Color(0xFFF4F4F5),
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
                color: Color(0xFF1A0A0C),
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
          style: const TextStyle(fontSize: 13, color: Color(0xFFD4D4D8)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: Text(
              isAk ? 'မလုပ်တော့ပါ' : 'Cancel',
              style: const TextStyle(color: Color(0xFFD4D4D8), fontWeight: FontWeight.w700),
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

    // The empty state already renders its own "Add New Favourite" button,
    // so the floating "+" is hidden while that button is on screen.
    final bool showEmptyAddButton =
        filteredContacts.isEmpty && query.isEmpty && _selectedCategory == 'All';

    return Scaffold(
      backgroundColor: trueBlack,
      extendBody: true,
      floatingActionButton:
          showEmptyAddButton ? null : _buildAddButton(appState, isAk),
      body: Stack(
        children: [
          const _LiquidBackdrop(),
          SafeArea(
            child: Column(
              children: [
                _buildAppBar(appState, isAk),
                _buildSearchAndFilters(isAk),
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 260),
                    switchInCurve: Curves.easeOutCubic,
                    switchOutCurve: Curves.easeInCubic,
                    transitionBuilder: (child, animation) {
                      final slide = Tween<Offset>(
                        begin: const Offset(0, 0.025),
                        end: Offset.zero,
                      ).animate(animation);
                      return FadeTransition(
                        opacity: animation,
                        child: SlideTransition(position: slide, child: child),
                      );
                    },
                    child: filteredContacts.isEmpty
                        ? KeyedSubtree(
                            key: const ValueKey('favourites-empty'),
                            child: _buildEmptyState(context, appState, isAk),
                          )
                        : KeyedSubtree(
                            key: const ValueKey('favourites-list'),
                            child: ListView.builder(
                              physics: const ClampingScrollPhysics(),
                              padding: const EdgeInsets.fromLTRB(16, 4, 16, 112),
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
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── FLOATING ADD BUTTON ──────────────────────────────────────────────────
  Widget _buildAddButton(AppState appState, bool isAk) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: crimson.withValues(alpha: 0.38),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
          BoxShadow(
            color: crimsonDark.withValues(alpha: 0.18),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        shape: const CircleBorder(),
        clipBehavior: Clip.antiAlias,
        child: Ink(
          width: 60,
          height: 60,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFFE31B2B), crimson, crimsonDark],
            ),
          ),
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: () {
              if (appState.favoriteContactsList.length >= 50) {
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
            child: Stack(
              alignment: Alignment.center,
              children: [
                Positioned(
                  top: 5,
                  left: 12,
                  right: 12,
                  child: Container(
                    height: 16,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.white.withValues(alpha: 0.40),
                          Colors.white.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
                const Icon(Icons.add_rounded, color: Colors.white, size: 30),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── APP BAR ──────────────────────────────────────────────────────────────
  Widget _buildAppBar(AppState appState, bool isAk) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
      child: _LiquidGlass(
        radius: 24,
        blur: 22,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        child: Row(
          children: [
            _GlassIconButton(
              icon: Icons.arrow_back_ios_new_rounded,
              onTap: () => appState.goBack(),
            ),

            // Centered title
            Expanded(
              child: Center(
                child: Text(
                  isAk ? 'ကျွန်ုပ်၏ စိတ်ကြိုက်များ' : 'My Favourites',
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFFF4F4F5),
                    letterSpacing: -0.2,
                  ),
                ),
              ),
            ),

            // Edit / Done pill
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () {
                setState(() {
                  _isEditMode = !_isEditMode;
                });
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 240),
                curve: Curves.easeOutCubic,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(999),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: _isEditMode
                        ? [const Color(0xFFE31B2B), crimson]
                        : [
                            Colors.white.withValues(alpha: 0.72),
                            Colors.white.withValues(alpha: 0.38),
                          ],
                  ),
                  border: Border.all(
                    color: _isEditMode
                        ? Colors.white.withValues(alpha: 0.35)
                        : Colors.white.withValues(alpha: 0.9),
                    width: 1.2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: _isEditMode
                          ? crimson.withValues(alpha: 0.25)
                          : const Color(0xFF0F2A4A).withValues(alpha: 0.06),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Icon(
                      _isEditMode ? Icons.check_rounded : Icons.edit_outlined,
                      size: 15,
                      color: _isEditMode ? Colors.white : const Color(0xFFD4D4D8),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      _isEditMode
                          ? (isAk ? 'ပြီးပြီ' : 'Done')
                          : (isAk ? 'ပြင်ဆင်ရန်' : 'Edit'),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: _isEditMode ? Colors.white : const Color(0xFFD4D4D8),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── SEARCH & FILTER ROW ──────────────────────────────────────────────────
  Widget _buildSearchAndFilters(bool isAk) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 8),
      child: _LiquidGlass(
        radius: 24,
        blur: 20,
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 13),
        child: Column(
          children: [
            // Search input
            Container(
              height: 46,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.white.withValues(alpha: 0.72),
                    Colors.white.withValues(alpha: 0.40),
                  ],
                ),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.92),
                  width: 1.1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F2A4A).withValues(alpha: 0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: TextField(
                controller: _searchCtrl,
                style: const TextStyle(fontSize: 13.5, color: Color(0xFFF4F4F5)),
                decoration: InputDecoration(
                  hintText: isAk
                      ? 'အမည်ဖြင့် ရှာဖွေပါ...'
                      : 'Search by name...',
                  hintStyle: const TextStyle(fontSize: 12.5, color: Color(0xFFD4D4D8)),
                  prefixIcon: const Icon(Icons.search_rounded, size: 20, color: Color(0xFFD4D4D8)),
                  suffixIcon: _searchCtrl.text.isNotEmpty
                      ? GestureDetector(
                          onTap: () => _searchCtrl.clear(),
                          child: const Padding(
                            padding: EdgeInsets.only(right: 4),
                            child: Icon(
                              Icons.cancel_rounded,
                              size: 18,
                              color: Color(0xFFD4D4D8),
                            ),
                          ),
                        )
                      : null,
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Category filter chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const ClampingScrollPhysics(),
              child: Row(
                children: _categories.map((cat) {
                  final isSelected = cat == _selectedCategory;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _GlassFilterChip(
                      label: cat == 'All' ? (isAk ? 'အားလုံး' : 'All') : cat,
                      selected: isSelected,
                      onTap: () => setState(() => _selectedCategory = cat),
                    ),
                  );
                }).toList(),
              ),
            ),

            // Edit mode hint
            if (_isEditMode) ...[
              const SizedBox(height: 12),
              _LiquidGlass(
                radius: 14,
                blur: 12,
                tint: crimson,
                shadow: false,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                child: Row(
                  children: [
                    const Icon(
                      Icons.info_outline_rounded,
                      size: 15,
                      color: crimson,
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
                          color: Color(0xFFD4D4D8),
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
          return const Color(0xFFE11D48);
        case 'business':
          return const Color(0xFF0284C7);
        default:
          return const Color(0xFFD4D4D8);
      }
    }

    final catColor = getCategoryColor(contact.category);
    final baseColor = Color(contact.colorValue);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: _LiquidGlass(
        radius: 20,
        blur: 16,
        tint: catColor,
        padding: EdgeInsets.zero,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(20),
            splashColor: catColor.withValues(alpha: 0.08),
            highlightColor: Colors.white.withValues(alpha: 0.14),
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
              padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Glassy gradient avatar
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Color.lerp(baseColor, Colors.white, 0.18)!,
                          baseColor,
                          Color.lerp(baseColor, Colors.black, 0.20)!,
                        ],
                      ),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.70),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: baseColor.withValues(alpha: 0.28),
                          blurRadius: 12,
                          offset: const Offset(0, 5),
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

                  // Name + category pill
                  Expanded(
                    child: Row(
                      children: [
                        Flexible(
                          child: Text(
                            contact.name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFF4F4F5),
                              letterSpacing: -0.1,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                catColor.withValues(alpha: 0.15),
                                catColor.withValues(alpha: 0.08),
                              ],
                            ),
                            border: Border.all(
                              color: catColor.withValues(alpha: 0.22),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            contact.category,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: catColor,
                              letterSpacing: 0.15,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Edit & delete actions
                  if (_isEditMode) ...[
                    const SizedBox(width: 8),
                    _GlassMiniButton(
                      icon: Icons.edit_outlined,
                      onTap: () => _openAddOrEditContactModal(
                        context: context,
                        appState: appState,
                        existingContact: contact,
                        contactIndex: index,
                      ),
                    ),
                    const SizedBox(width: 6),
                    _GlassMiniButton(
                      icon: Icons.delete_outline_rounded,
                      color: crimson,
                      tint: crimson,
                      onTap: () => _confirmDeleteContact(
                        context: context,
                        appState: appState,
                        contact: contact,
                        index: index,
                      ),
                    ),
                  ],
                ],
              ),
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
      child: SingleChildScrollView(
        physics: const ClampingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 120),
        child: _LiquidGlass(
          radius: 28,
          blur: 22,
          padding: const EdgeInsets.symmetric(horizontal: 26, vertical: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 78,
                height: 78,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      const Color(0xFF1A1A1A),
                      const Color(0xFF0A0A0A),
                    ],
                  ),
                  border: Border.all(
                    color: const Color(0xFF333333),
                    width: 1.2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF2B6CB0).withValues(alpha: 0.10),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Icon(
                  hasSearch ? Icons.person_search_rounded : Icons.star_outline_rounded,
                  size: 36,
                  color: const Color(0xFFD4D4D8),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                hasSearch
                    ? (isAk ? 'ရှာဖွေမှု မတွေ့ရှိပါ' : 'No Favourites Found')
                    : (isAk ? 'စိတ်ကြိုက်စာရင်း မရှိသေးပါ' : 'No Favourites Yet'),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFFF4F4F5),
                ),
                textAlign: TextAlign.center,
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
                style: const TextStyle(
                  fontSize: 12.5,
                  color: Color(0xFFD4D4D8),
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 20),
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
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
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
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── LIQUID GLASS COMPONENTS ────────────────────────────────────────────────

/// Ambient sky backdrop with soft light blooms that the glass can refract.
class _LiquidBackdrop extends StatelessWidget {
  const _LiquidBackdrop();

  @override
  Widget build(BuildContext context) {
    return const Stack(
      fit: StackFit.expand,
      children: [
        DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF000000),
                Color(0xFF050505),
                Color(0xFF000000),
              ],
              stops: [0.0, 0.52, 1.0],
            ),
          ),
        ),
        Positioned(
          top: -140,
          right: -90,
          child: _GlowBlob(size: 340, color: Color(0xFF60A5FA), opacity: 0.34),
        ),
        Positioned(
          top: 150,
          left: -150,
          child: _GlowBlob(size: 380, color: Color(0xFFF87171), opacity: 0.13),
        ),
        Positioned(
          bottom: -160,
          right: -80,
          child: _GlowBlob(size: 420, color: Color(0xFF7DD3FC), opacity: 0.36),
        ),
        Positioned(
          bottom: 70,
          left: -80,
          child: _GlowBlob(size: 260, color: Color(0xFF1A1400), opacity: 0.16),
        ),
      ],
    );
  }
}

class _GlowBlob extends StatelessWidget {
  const _GlowBlob({
    required this.size,
    required this.color,
    required this.opacity,
  });

  final double size;
  final Color color;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [
              color.withValues(alpha: opacity),
              color.withValues(alpha: opacity * 0.35),
              color.withValues(alpha: 0),
            ],
            stops: const [0.0, 0.5, 1.0],
          ),
        ),
      ),
    );
  }
}

/// Frosted, translucent surface with a bright rim and soft ambient shadow.
class _LiquidGlass extends StatelessWidget {
  const _LiquidGlass({
    required this.child,
    this.radius = 20,
    this.blur = 18,
    this.padding = const EdgeInsets.all(12),
    this.tint,
    this.shadow = true,
  });

  final Widget child;
  final double radius;
  final double blur;
  final EdgeInsetsGeometry padding;
  final Color? tint;
  final bool shadow;

  @override
  Widget build(BuildContext context) {
    final borderRadius = BorderRadius.circular(radius);
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: borderRadius,
        boxShadow: shadow
            ? [
                BoxShadow(
                  color: const Color(0xFF0F2A4A).withValues(alpha: 0.07),
                  blurRadius: 24,
                  offset: const Offset(0, 10),
                ),
              ]
            : null,
      ),
      child: ClipRRect(
        borderRadius: borderRadius,
        child: BackdropFilter(
          filter: ui.ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              borderRadius: borderRadius,
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: tint == null
                    ? [
                        Colors.white.withValues(alpha: 0.78),
                        Colors.white.withValues(alpha: 0.54),
                        Colors.white.withValues(alpha: 0.40),
                      ]
                    : [
                        Colors.white.withValues(alpha: 0.82),
                        tint!.withValues(alpha: 0.16),
                        Colors.white.withValues(alpha: 0.46),
                      ],
                stops: const [0.0, 0.55, 1.0],
              ),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.88),
                width: 1.2,
              ),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

class _GlassIconButton extends StatelessWidget {
  const _GlassIconButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      child: Ink(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white.withValues(alpha: 0.80),
              Colors.white.withValues(alpha: 0.40),
            ],
          ),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.95),
            width: 1.1,
          ),
        ),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onTap,
          child: Center(
            child: Icon(icon, color: const Color(0xFFD4D4D8), size: 16),
          ),
        ),
      ),
    );
  }
}

class _GlassFilterChip extends StatelessWidget {
  const _GlassFilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: selected
                  ? [const Color(0xFF1C2A44), const Color(0xFF0F172A)]
                  : [
                      Colors.white.withValues(alpha: 0.66),
                      Colors.white.withValues(alpha: 0.34),
                    ],
            ),
            border: Border.all(
              color: selected
                  ? Colors.white.withValues(alpha: 0.22)
                  : Colors.white.withValues(alpha: 0.90),
              width: 1.1,
            ),
            boxShadow: [
              BoxShadow(
                color: selected
                    ? const Color(0xFF111111).withValues(alpha: 0.20)
                    : const Color(0xFF0F2A4A).withValues(alpha: 0.04),
                blurRadius: selected ? 14 : 8,
                offset: Offset(0, selected ? 6 : 3),
              ),
            ],
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
              color: selected ? Colors.white : const Color(0xFFD4D4D8),
              letterSpacing: 0.1,
            ),
          ),
        ),
      ),
    );
  }
}

class _GlassMiniButton extends StatelessWidget {
  const _GlassMiniButton({
    required this.icon,
    required this.onTap,
    this.color = const Color(0xFF3F3F46),
    this.tint,
  });

  final IconData icon;
  final VoidCallback onTap;
  final Color color;
  final Color? tint;

  @override
  Widget build(BuildContext context) {
    final borderRadius = BorderRadius.circular(11);
    return Material(
      color: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: borderRadius),
      clipBehavior: Clip.antiAlias,
      child: Ink(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          borderRadius: borderRadius,
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white.withValues(alpha: 0.74),
              (tint ?? Colors.white).withValues(alpha: tint == null ? 0.34 : 0.13),
            ],
          ),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.92),
            width: 1.1,
          ),
        ),
        child: InkWell(
          borderRadius: borderRadius,
          onTap: onTap,
          child: Icon(icon, size: 16, color: color),
        ),
      ),
    );
  }
}
