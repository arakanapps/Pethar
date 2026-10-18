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

  final List<String> _banks = const [
    'Péthar Wallet',
    'KBZPay',
    'Wave Money',
    'AYA Pay',
    'CB Pay',
    'CIMB Bank',
    'Other',
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
                  // Verify PIN (Accept 123456 or default test PINs)
                  if (enteredPin == '123456' || enteredPin == '000000') {
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
                      pinError = 'Incorrect PIN. Try 123456';
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
                  ] else ...[
                    const SizedBox(height: 10),
                    const Text(
                      'Default PIN: 123456',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFF94A3B8),
                        fontWeight: FontWeight.w500,
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
  void _openAddOrEditContactModal({
    required BuildContext context,
    required AppState appState,
    FavoriteContact? existingContact,
    int? contactIndex,
  }) {
    final bool isEdit = existingContact != null && contactIndex != null;
    final isAk = appState.language == 'ak';

    final nameCtrl = TextEditingController(text: existingContact?.name ?? '');
    final mmCtrl = TextEditingController(text: existingContact?.mm ?? '');
    final phoneOrIdCtrl = TextEditingController(
      text: existingContact?.phone.isNotEmpty == true
          ? existingContact!.phone
          : (existingContact?.id ?? ''),
    );
    String selectedBank = existingContact?.bank ?? 'Péthar Wallet';
    String selectedCategory = existingContact?.category ?? 'Friends';
    int selectedColor = existingContact?.colorValue ?? _avatarColors[0];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalCtx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
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
                                  ? 'အပြောင်းအလဲ ပြုလုပ်ရန် PIN နံပါတ် လိုအပ်သည်'
                                  : 'PIN verification required to save changes',
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
                    const SizedBox(height: 20),

                    // Avatar Preview & Color Palette
                    Center(
                      child: Column(
                        children: [
                          Container(
                            width: 60,
                            height: 60,
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
                              nameCtrl.text.trim().isNotEmpty
                                  ? nameCtrl.text.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join('').toUpperCase()
                                  : 'U',
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
                    const SizedBox(height: 20),

                    // Full Name Input
                    Text(
                      isAk ? 'အမည် (အင်္ဂလိပ်)' : 'Recipient Name',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF334155),
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: nameCtrl,
                      onChanged: (_) => setModalState(() {}),
                      textCapitalization: TextCapitalization.words,
                      decoration: InputDecoration(
                        hintText: 'e.g. Myat Soe',
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
                          borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.6),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Burmese Name / Note
                    Text(
                      isAk ? 'မြန်မာအမည် / မှတ်ချက်' : 'Burmese Name / Note (Optional)',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF334155),
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: mmCtrl,
                      decoration: InputDecoration(
                        hintText: 'e.g. မြတ်စိုး',
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
                          borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.6),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Phone or Arakan ID
                    Text(
                      isAk ? 'ဖုန်းနံပါတ် သို့မဟုတ် Péthar ID' : 'Phone Number or Account ID',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF334155),
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: phoneOrIdCtrl,
                      keyboardType: TextInputType.text,
                      decoration: InputDecoration(
                        hintText: 'e.g. 09951234567 or ARAK-1024',
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
                          borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.6),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Bank / Payment Network
                    Text(
                      isAk ? 'ဘဏ် / ငွေပေးချေမှုစနစ်' : 'Bank / Payment Method',
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
                      children: _banks.map((b) {
                        final isSelected = b == selectedBank;
                        return ChoiceChip(
                          label: Text(
                            b,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                              color: isSelected ? Colors.white : const Color(0xFF475569),
                            ),
                          ),
                          selected: isSelected,
                          selectedColor: const Color(0xFF2563EB),
                          backgroundColor: const Color(0xFFF1F5F9),
                          onSelected: (val) {
                            if (val) setModalState(() => selectedBank = b);
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    // Category Chips
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

                    // Submit Button -> Triggers PIN verification!
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: nameCtrl.text.trim().isEmpty || phoneOrIdCtrl.text.trim().isEmpty
                            ? null
                            : () {
                                final name = nameCtrl.text.trim();
                                final mm = mmCtrl.text.trim().isNotEmpty ? mmCtrl.text.trim() : name;
                                final phoneOrId = phoneOrIdCtrl.text.trim();
                                final initials = name.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join('').toUpperCase();

                                final newContact = FavoriteContact(
                                  name: name,
                                  mm: mm,
                                  id: phoneOrId.startsWith('ARAK') ? phoneOrId : 'ARAK-${name.hashCode.abs() % 9000 + 1000}',
                                  phone: phoneOrId,
                                  initials: initials.isNotEmpty ? initials : 'U',
                                  colorValue: selectedColor,
                                  category: selectedCategory,
                                  bank: selectedBank,
                                );

                                // Close input sheet first
                                Navigator.pop(modalCtx);

                                // Then prompt for 6-digit PIN code to commit the change
                                _askPinAndExecute(
                                  context: context,
                                  actionTitle: isEdit ? 'Authorize Edit Contact' : 'Authorize Add Contact',
                                  actionDescription: isEdit
                                      ? 'Enter PIN to update recipient "$name"'
                                      : 'Enter PIN to save recipient "$name"',
                                  onAuthorized: () {
                                    if (isEdit) {
                                      appState.updateFavoriteContact(contactIndex, newContact);
                                    } else {
                                      appState.addFavoriteContact(newContact);
                                    }
                                  },
                                  successMessage: isEdit
                                      ? 'Recipient "$name" updated successfully'
                                      : 'Recipient "$name" added to favourites',
                                );
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
                        child: Text(
                          isEdit
                              ? (isAk ? 'ပြင်ဆင်မှု သိမ်းဆည်းရန် (PIN စစ်မည်)' : 'Save Changes (Verify PIN)')
                              : (isAk ? 'အသစ်ထည့်ရန် (PIN စစ်မည်)' : 'Add Contact (Verify PIN)'),
                          style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
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

    // Filter by category and search query
    final query = _searchCtrl.text.trim().toLowerCase();
    final filteredContacts = contacts.asMap().entries.where((entry) {
      final contact = entry.value;
      final matchesCategory = _selectedCategory == 'All' ||
          contact.category.toLowerCase() == _selectedCategory.toLowerCase();
      final matchesQuery = query.isEmpty ||
          contact.name.toLowerCase().contains(query) ||
          contact.mm.toLowerCase().contains(query) ||
          contact.id.toLowerCase().contains(query) ||
          contact.phone.toLowerCase().contains(query) ||
          contact.bank.toLowerCase().contains(query);
      return matchesCategory && matchesQuery;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
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
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
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
      // Floating "+ Add Favourite" button
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openAddOrEditContactModal(
          context: context,
          appState: appState,
        ),
        backgroundColor: crimson,
        foregroundColor: Colors.white,
        elevation: 4,
        icon: const Icon(Icons.person_add_alt_1_rounded, size: 20),
        label: Text(
          isAk ? 'အသစ်ထည့်မည်' : 'Add Favourite',
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
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
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
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
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isAk ? 'စိတ်ကြိုက် လွှဲသူများ' : 'Favourites',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  Text(
                    isAk
                        ? 'အချက်အလက် ပြင်ဆင်ရန်နှင့် အသစ်ထည့်ရန်'
                        : 'Manage recipients & quick contacts',
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF64748B),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),
          // Top Action Button
          GestureDetector(
            onTap: () => _openAddOrEditContactModal(
              context: context,
              appState: appState,
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: const Color(0xFFFEE2E2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.add_rounded, size: 16, color: crimson),
                  SizedBox(width: 4),
                  Text(
                    'Add New',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: crimson,
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
                    ? 'အမည် သို့မဟုတ် ဖုန်းနံပါတ်ဖြင့် ရှာဖွေပါ...'
                    : 'Search by name, phone or Arakan ID...',
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
                      cat == 'All' ? 'All ($totalCount)' : cat,
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
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Avatar
              Container(
                width: 48,
                height: 48,
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
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
              ),
              const SizedBox(width: 12),

              // Contact Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            contact.name,
                            style: const TextStyle(
                              fontSize: 14.5,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF0F172A),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        // Category Pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: catColor.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            contact.category,
                            style: TextStyle(
                              fontSize: 9.5,
                              fontWeight: FontWeight.w800,
                              color: catColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    if (contact.mm.isNotEmpty && contact.mm != contact.name)
                      Text(
                        contact.mm,
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.account_balance_rounded, size: 12, color: Color(0xFF94A3B8)),
                        const SizedBox(width: 4),
                        Text(
                          contact.bank,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF475569),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '·  ${contact.phone.isNotEmpty ? contact.phone : contact.id}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          const Divider(height: 18, color: Color(0xFFF1F5F9)),

          // Actions Row: Pay Shortcut, Edit Button, Delete Button
          Row(
            children: [
              // Pay Shortcut
              Expanded(
                child: SizedBox(
                  height: 34,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      appState.startPayForContact(
                        name: contact.name,
                        id: contact.id,
                        initials: contact.initials,
                        colorValue: contact.colorValue,
                      );
                    },
                    icon: const Icon(Icons.send_rounded, size: 14),
                    label: Text(
                      isAk ? 'ငွေလွှဲမည်' : 'Quick Pay',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: EdgeInsets.zero,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Edit Button (pencil)
              GestureDetector(
                onTap: () => _openAddOrEditContactModal(
                  context: context,
                  appState: appState,
                  existingContact: contact,
                  contactIndex: index,
                ),
                child: Container(
                  width: 36,
                  height: 34,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
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
                onTap: () => _confirmDeleteContact(
                  context: context,
                  appState: appState,
                  contact: contact,
                  index: index,
                ),
                child: Container(
                  width: 36,
                  height: 34,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.delete_outline_rounded,
                    size: 17,
                    color: crimson,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── EMPTY STATE ──────────────────────────────────────────────────────────
  Widget _buildEmptyState(BuildContext context, AppState appState, bool isAk) {
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
              child: const Icon(
                Icons.person_search_rounded,
                size: 36,
                color: Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              isAk ? 'ရှာဖွေမှု မတွေ့ရှိပါ' : 'No Favourites Found',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              isAk
                  ? 'အခြားအချက်အလက်ဖြင့် ရှာဖွေပါ သို့မဟုတ် အသစ်ထည့်ပါ'
                  : 'Try adjusting your search query or add a new favourite recipient.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 18),
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
            ),
          ],
        ),
      ),
    );
  }
}
