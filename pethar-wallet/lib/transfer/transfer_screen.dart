import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../core/services/supabase_service.dart';
import '../widgets/pin_prompt.dart';

enum TransferStep {
  input, // Screen 1 (Pic 1): From, To, Next, Recent Transfers + Filters + Search
  detail, // Screen 2 (Pic 2): Recipient Header, Amount, Mandatory Notes, Quick Chips, Pay Button, Warning
  success, // Payment Transaction Success Slip
}

class RecentPayContact {
  final String id;
  final String name;
  final String username;
  final String uid;
  final String category; // 'Family' | 'Friends' | 'other'
  final String initials;
  final Color avatarColor;

  RecentPayContact({
    required this.id,
    required this.name,
    required this.username,
    required this.uid,
    required this.category,
    required this.initials,
    required this.avatarColor,
  });
}

class TransferScreen extends StatefulWidget {
  const TransferScreen({Key? key}) : super(key: key);

  @override
  State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> {
  TransferStep _step = TransferStep.input;

  // Controllers & Inputs
  final TextEditingController _toInputCtrl = TextEditingController();
  final TextEditingController _amountCtrl = TextEditingController();
  final TextEditingController _noteCtrl = TextEditingController();
  final TextEditingController _searchCtrl = TextEditingController();

  // Selected Recipient
  late RecentPayContact _selectedRecipient;

  // Recent Transfers Filter & Delete Mode
  String _selectedCategoryTab = 'All'; // 'All' | 'Family' | 'Friends' | 'other'
  bool _deleteMode = false;
  String? _errorMessage;

  // List of Recent Transfer Contacts
  late List<RecentPayContact> _recentContacts;

  // True while the server is confirming that the recipient account exists.
  bool _isResolvingRecipient = false;

  // Success Transaction Details
  String? _successTxId;
  DateTime? _successTxTime;
  double _successAmount = 0.0;
  String _successNote = '';
  bool _isProcessing = false;
  String? _transferIdempotencyKey;

  @override
  void initState() {
    super.initState();
    final appState = Provider.of<AppState>(context, listen: false);
    _recentContacts = appState.favoriteContactsList.map((f) {
      return RecentPayContact(
        id: f.id,
        name: f.name,
        username: f.phone.startsWith('@')
            ? f.phone
            : '@${f.name.toLowerCase().replaceAll(' ', '_')}',
        uid: f.id,
        category: f.category,
        initials: f.initials,
        avatarColor: Color(f.colorValue),
      );
    }).toList();
    if (_recentContacts.isNotEmpty) {
      _selectedRecipient = _recentContacts.first;
    } else {
      _selectedRecipient = RecentPayContact(
        id: '',
        name: '',
        username: '',
        uid: '',
        category: 'Friends',
        initials: 'U',
        avatarColor: const Color(0xFF0284C7),
      );
    }

    _amountCtrl.addListener(() {
      if (mounted) setState(() {});
    });

    // Check if user navigated from Favourites or Scanner
    _applyPendingPayContactSynchronous(appState);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final appState = Provider.of<AppState>(context, listen: false);
    _applyPendingPayContactSynchronous(appState);
  }

  void _applyPendingPayContactSynchronous(AppState appState) {
    if (appState.pendingPayContact != null) {
      final pending = appState.pendingPayContact!;
      final name = pending['name'] as String;
      final initials = pending['initials'] as String;
      final colorVal = pending['colorValue'] as int? ?? 0xFF0284C7;
      final customUsername = pending['username'] as String?;
      final customUid = pending['uid'] as String?;

      WidgetsBinding.instance.addPostFrameCallback((_) {
        appState.clearPendingPayContact();
      });

      final match = _recentContacts.firstWhere(
        (c) =>
            (customUid != null && c.uid == customUid) ||
            c.name.toLowerCase() == name.toLowerCase(),
        orElse: () {
          // Only real DB contacts are stored. If the pending contact has no
          // wallet UID we keep it empty and let the server resolve the
          // username instead of inventing an identifier.
          final newContact = RecentPayContact(
            id: 'REC-${name.toLowerCase().replaceAll(' ', '')}',
            name: name,
            username:
                customUsername ?? '@${name.toLowerCase().replaceAll(' ', '_')}',
            uid: customUid ?? '',
            category: 'Friends',
            initials: initials,
            avatarColor: Color(colorVal),
          );
          _recentContacts.insert(0, newContact);
          return newContact;
        },
      );
      _selectedRecipient = match;
      _toInputCtrl.text = match.uid.isNotEmpty ? match.uid : match.username;
      _errorMessage = null;
      _step = TransferStep.detail;
      _verifySelectedRecipient();
    }
  }

  @override
  void dispose() {
    _toInputCtrl.dispose();
    _amountCtrl.dispose();
    _noteCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _navigateToDetailWithContact(RecentPayContact contact) {
    setState(() {
      _selectedRecipient = contact;
      _toInputCtrl.text =
          contact.uid.isNotEmpty ? contact.uid : contact.username;
      _errorMessage = null;
      _step = TransferStep.detail;
    });
    _verifySelectedRecipient();
  }

  String _initialsFor(String name) {
    final parts = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .toList();
    if (parts.isEmpty) return 'U';
    if (parts.length == 1) {
      return parts.first.length >= 2
          ? parts.first.substring(0, 2).toUpperCase()
          : parts.first.toUpperCase();
    }
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  /// Build the recipient shown on the confirmation card from the server's
  /// lookup response. Only the name and wallet address are displayed; the
  /// username / nickname never reach the UI.
  RecentPayContact _contactFromLookup(
    Map<String, dynamic> resolved, {
    RecentPayContact? fallback,
  }) {
    final wallet = (resolved['wallet_address'] ?? '').toString().trim();
    final name = (resolved['name'] ?? '').toString().trim();
    final displayName =
        name.isNotEmpty ? name : (fallback?.name ?? 'Péthar User');
    return RecentPayContact(
      id: wallet.isNotEmpty ? wallet : (fallback?.id ?? ''),
      name: displayName,
      username: fallback?.username ?? '',
      uid: wallet.isNotEmpty ? wallet : (fallback?.uid ?? ''),
      category: fallback?.category ?? 'other',
      initials: _initialsFor(displayName),
      avatarColor: fallback?.avatarColor ?? const Color(0xFF0284C7),
    );
  }

  /// Re-check a contact that was opened from favourites / QR / recent list so
  /// the card always shows the authoritative name and wallet address.
  Future<void> _verifySelectedRecipient() async {
    final identifier = _selectedRecipient.uid.isNotEmpty
        ? _selectedRecipient.uid
        : _selectedRecipient.username;
    if (identifier.isEmpty) return;
    try {
      final resolved =
          await SupabaseService().lookupTransferRecipient(identifier);
      if (!mounted || resolved['found'] != true) return;
      setState(() {
        _selectedRecipient =
            _contactFromLookup(resolved, fallback: _selectedRecipient);
      });
    } catch (_) {
      // Keep the locally cached contact when the lookup is temporarily
      // unavailable; the transfer endpoint still validates the recipient.
    }
  }

  Future<void> _onNextPressed() async {
    if (_isResolvingRecipient) return;

    final appState = Provider.of<AppState>(context, listen: false);
    final isAk = appState.language == 'ak';
    final query = _toInputCtrl.text.trim();
    if (query.isEmpty) {
      setState(() => _errorMessage = isAk
          ? '12-digit ID သို့မဟုတ် username ထည့်ပါ'
          : 'Enter a valid 12-digit ID or username');
      return;
    }

    setState(() {
      _isResolvingRecipient = true;
      _errorMessage = null;
    });

    try {
      final resolved = await SupabaseService().lookupTransferRecipient(query);
      if (!mounted) return;

      if (resolved['found'] != true) {
        final reason = (resolved['reason'] ?? '').toString();
        setState(() {
          _isResolvingRecipient = false;
          if (reason == 'unauthenticated') {
            _errorMessage = isAk
                ? 'ဆက်လုပ်ဆောင်ရန် အကောင့်ပြန်လည်ဝင်ရောက်ပါ'
                : 'Please sign in again to continue';
          } else if (reason == 'unavailable') {
            _errorMessage = isAk
                ? 'လက်ခံသူရှာဖွေမှု ယာယီမရနိုင်ပါ။ ခဏနေရင် ပြန်စမ်းပါ'
                : 'Recipient lookup is unavailable right now. Please try again.';
          } else {
            _errorMessage = isAk
                ? 'No User Found — ဤ ID သို့မဟုတ် username ဖြင့် အကောင့် မတွေ့ပါ'
                : 'No User Found';
          }
        });
        return;
      }

      if (resolved['is_self'] == true) {
        setState(() {
          _isResolvingRecipient = false;
          _errorMessage = isAk
              ? 'မိမိကိုယ်တိုင်၏ အကောင့်သို့ ငွေလွှဲ၍ မရပါ'
              : 'You cannot transfer funds to yourself';
        });
        return;
      }

      final cleanQuery = query.replaceAll(' ', '').toLowerCase();
      final fallback = _recentContacts.firstWhere(
        (c) =>
            c.username.toLowerCase() == query.toLowerCase() ||
            c.uid.replaceAll(' ', '').toLowerCase() == cleanQuery ||
            c.name.toLowerCase() == query.toLowerCase(),
        orElse: () => RecentPayContact(
          id: '',
          name: query.startsWith('@') ? query.substring(1) : query,
          username: query.startsWith('@') ? query : '@$query',
          uid: '',
          category: 'other',
          initials: _initialsFor(query),
          avatarColor: const Color(0xFF0284C7),
        ),
      );

      final contact = _contactFromLookup(resolved, fallback: fallback);
      setState(() {
        _selectedRecipient = contact;
        _toInputCtrl.text = contact.uid;
        _isResolvingRecipient = false;
        _step = TransferStep.detail;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isResolvingRecipient = false;
        _errorMessage = isAk
            ? 'လက်ခံသူကို အတည်ပြု၍ မရပါ။ အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။'
            : 'Unable to verify recipient. Check your connection and try again.';
      });
    }
  }

  Future<void> _onProcessTransfer(AppState appState) async {
    if (_isProcessing) return;

    final amount = double.tryParse(_amountCtrl.text.trim()) ?? 0.0;
    final note = _noteCtrl.text.trim();

    final isAk = appState.language == 'ak';
    if (amount <= 0 || amount < 0.01) {
      setState(() => _errorMessage = isAk
          ? 'အနည်းဆုံး 0.01 AKD လွှဲရပါမည် (At least 0.01)'
          : 'Amount must be at least 0.01 AKD');
      return;
    }

    if (amount > appState.wallet.balance) {
      setState(() => _errorMessage = isAk
          ? 'လက်ကျန်ငွေထက် ကျော်လွန်နေပါသည် (Over balance)'
          : 'Over balance: Transfer amount exceeds available balance');
      return;
    }

    if (note.isEmpty) {
      setState(() =>
          _errorMessage = 'Add Notes is mandatory. Please provide a note');
      return;
    }

    final recipient = _selectedRecipient.uid.isNotEmpty
        ? _selectedRecipient.uid
        : _selectedRecipient.username.replaceAll('@', '').trim();

    if (recipient.isEmpty) {
      setState(() => _errorMessage = isAk
          ? 'လက်ခံသူ၏ UID သို့မဟုတ် username ထည့်ပါ'
          : 'Enter the recipient UID or username');
      return;
    }

    final pin = await showPinPrompt(context, isAk: isAk);
    if (pin == null || !mounted) return;

    setState(() {
      _isProcessing = true;
      _errorMessage = null;
    });

    final key = _transferIdempotencyKey ??=
        SupabaseService().createTransferIdempotencyKey();
    final result = await SupabaseService().transferFunds(
      recipient: recipient,
      amount: amount,
      pin: pin,
      idempotencyKey: key,
      note: note,
    );

    if (!mounted) return;

    if (result['success'] == true) {
      await appState.loadSupabaseData();
      if (!mounted) return;
      setState(() {
        _isProcessing = false;
        _transferIdempotencyKey = null;
        _successTxId =
            (result['transaction_id'] ?? result['reference_id'] ?? '')
                .toString();
        _successTxTime = DateTime.now();
        _successAmount = amount;
        _successNote = note;
        _step = TransferStep.success;
      });
    } else {
      setState(() {
        _isProcessing = false;
        // Retain key for safe retry after ambiguous network failures.
        _transferIdempotencyKey = key;
        _errorMessage = result['message']?.toString() ?? 'Transfer failed';
      });
    }
  }

  void _openScanInNavbar() {
    final appState = Provider.of<AppState>(context, listen: false);
    appState.navigate(Screen.scan);
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAk = appState.language == 'ak';
    _applyPendingPayContactSynchronous(appState);

    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      body: Stack(
        fit: StackFit.expand,
        children: [
          const _GlassBackdrop(),
          SafeArea(
            bottom: true,
            child: Column(
              children: [
                _buildTopBar(appState, isAk),
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 280),
                    switchInCurve: Curves.easeOutCubic,
                    switchOutCurve: Curves.easeInCubic,
                    child: _step == TransferStep.input
                        ? _buildScreen1Input(appState, isAk)
                        : _step == TransferStep.detail
                            ? _buildScreen2Detail(appState, isAk)
                            : _buildScreenSuccess(appState, isAk),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOP APP BAR: < Back | Transfer | [History]
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildTopBar(AppState appState, bool isAk) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
      child: _GlassSurface(
        radius: 999,
        blur: 24,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        child: Row(
          children: [
            _GlassIconCircle(
              icon: Icons.arrow_back_ios_new_rounded,
              onTap: () {
                if (_step == TransferStep.detail) {
                  setState(() {
                    _step = TransferStep.input;
                    _errorMessage = null;
                  });
                } else if (_step == TransferStep.success) {
                  setState(() {
                    _step = TransferStep.input;
                    _amountCtrl.clear();
                    _noteCtrl.clear();
                  });
                } else {
                  appState.navigate(Screen.home);
                }
              },
            ),
            Expanded(
              child: Center(
                child: Text(
                  isAk ? 'ငွေလွှဲ' : 'Transfer',
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: _inkStrong,
                    letterSpacing: -0.2,
                  ),
                ),
              ),
            ),
            _GlassPill(
              icon: Icons.history_rounded,
              label: isAk ? 'မှတ်တမ်း' : 'History',
              onTap: () => appState.navigate(Screen.history),
            ),
          ],
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 1 (Pic 1): From Card, To Card (UID/username + [Scan] + [Next]),
  // Recent Transfers (Delete, Categories, Search, Contact List)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildScreen1Input(AppState appState, bool isAk) {
    final query = _searchCtrl.text.trim().toLowerCase();
    final filteredContacts = _recentContacts.where((c) {
      final matchesTab = _selectedCategoryTab == 'All' ||
          c.category.toLowerCase() == _selectedCategoryTab.toLowerCase();
      final matchesQuery = query.isEmpty ||
          c.name.toLowerCase().contains(query) ||
          c.username.toLowerCase().contains(query) ||
          c.uid.toLowerCase().contains(query);
      return matchesTab && matchesQuery;
    }).toList();

    return SingleChildScrollView(
      key: const ValueKey('screen1'),
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── 1. FROM CARD ──
          _GlassSurface(
            radius: 26,
            blur: 22,
            padding: const EdgeInsets.all(16),
            tint: _accentBlue,
            child: Row(
              children: [
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.65),
                      width: 1.6,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: _accentBlue.withValues(alpha: 0.28),
                        blurRadius: 14,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      appState.profile.name.isNotEmpty
                          ? appState.profile.name[0].toUpperCase()
                          : 'U',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 18,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isAk ? 'လွှဲပို့သူ (FROM)' : 'FROM',
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: _inkFaint,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        appState.profile.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 15.5,
                          fontWeight: FontWeight.w900,
                          color: _inkStrong,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Row(
                        children: [
                          const Icon(Icons.account_balance_wallet_rounded,
                              size: 12, color: _inkSoft),
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              '${isAk ? 'လက်ကျန်ငွေ' : 'Balance'}: ${NumberFormat('#,##0.00').format(appState.wallet.balance)} AKD',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: _inkSoft,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(999),
                    border:
                        Border.all(color: Colors.white.withValues(alpha: 0.9)),
                  ),
                  child: const Text(
                    'AKD',
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w900,
                      color: _accentBlue,
                      letterSpacing: 0.6,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // ── 2. TO CARD (enter UID or username + [Scan] + [Next]) ──
          _GlassSurface(
            radius: 26,
            blur: 22,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAk ? 'လက်ခံသူ (TO)' : 'TO',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: _inkFaint,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 9),

                // Input Field with [Scan] Trailing Button
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.58),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.95),
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF1E3A5F).withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(left: 12),
                        child: Icon(Icons.alternate_email_rounded,
                            size: 17, color: _inkFaint),
                      ),
                      Expanded(
                        child: TextField(
                          controller: _toInputCtrl,
                          cursorColor: _accentBlue,
                          decoration: InputDecoration(
                            hintText: isAk
                                ? '12-digit ID သို့မဟုတ် username ရိုက်ထည့်ပါ'
                                : '12-digit ID or username',
                            hintStyle: const TextStyle(
                                color: _inkFaint,
                                fontSize: 13,
                                fontWeight: FontWeight.w500),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 15),
                          ),
                          style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: _inkStrong),
                          onSubmitted: (_) => _onNextPressed(),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onTap: _openScanInNavbar,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF1F2D45), Color(0xFF0B1220)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(13),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.18),
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: _inkStrong.withValues(alpha: 0.25),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.qr_code_scanner_rounded,
                                    size: 14, color: Colors.white),
                                const SizedBox(width: 4),
                                Text(
                                  isAk ? 'စကင်' : 'Scan',
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                if (_errorMessage != null) ...[
                  const SizedBox(height: 10),
                  Container(
                    width: double.infinity,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                    decoration: BoxDecoration(
                      color: const Color(0xFF000000),
                      borderRadius: BorderRadius.circular(14),
                      border:
                          Border.all(color: const Color(0xFF3F1D24), width: 1),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded,
                            size: 15, color: Color(0xFFDC2626)),
                        const SizedBox(width: 7),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(
                                color: Color(0xFFDC2626),
                                fontSize: 12,
                                fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 14),

                // [Next] Button
                _GlassPrimaryButton(
                  height: 52,
                  onPressed: _isResolvingRecipient ? null : _onNextPressed,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_isResolvingRecipient)
                        const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      else
                        const Icon(Icons.arrow_forward_rounded,
                            size: 17, color: Colors.white),
                      const SizedBox(width: 7),
                      Text(
                        _isResolvingRecipient
                            ? (isAk ? 'စစ်ဆေးနေသည်…' : 'Checking…')
                            : (isAk ? 'ရှေ့သို့' : 'Next'),
                        style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: 0.1),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 22),

          // ── 3. RECENT TRANSFERS SECTION ──
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isAk ? 'မကြာသေးမီက လွှဲပြောင်းမှုများ' : 'Recent Transfers',
                style: const TextStyle(
                  fontSize: 16.5,
                  fontWeight: FontWeight.w900,
                  color: _inkStrong,
                  letterSpacing: -0.2,
                ),
              ),
              GestureDetector(
                onTap: () => setState(() => _deleteMode = !_deleteMode),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
                  decoration: BoxDecoration(
                    color: _deleteMode
                        ? const Color(0xFF000000)
                        : Colors.white.withValues(alpha: 0.58),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: _deleteMode
                          ? const Color(0xFF3F1D24)
                          : Colors.white.withValues(alpha: 0.95),
                      width: 1.1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _deleteMode
                            ? Icons.check_rounded
                            : Icons.delete_outline_rounded,
                        size: 14,
                        color: _deleteMode ? const Color(0xFFDC2626) : _inkSoft,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _deleteMode
                            ? (isAk ? 'ပြီးပါပြီ' : 'Done')
                            : (isAk ? 'ဖျက်မည်' : 'Delete'),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color:
                              _deleteMode ? const Color(0xFFDC2626) : _inkSoft,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Category Filter Tabs: All | Family | Friends | Other
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['All', 'Family', 'Friends', 'other'].map((tab) {
                final isSelected = _selectedCategoryTab == tab;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: _GlassChip(
                    label: tab == 'other' ? 'Other' : tab,
                    selected: isSelected,
                    onTap: () => setState(() => _selectedCategoryTab = tab),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 12),

          // Search Bar
          Container(
            height: 46,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.58),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.95),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF1E3A5F).withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, size: 19, color: _inkFaint),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _searchCtrl,
                    cursorColor: _accentBlue,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: isAk ? 'ရှာဖွေရန်...' : 'Search recipients',
                      hintStyle: const TextStyle(
                          color: _inkFaint,
                          fontSize: 13,
                          fontWeight: FontWeight.w500),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                    style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: _inkStrong),
                  ),
                ),
                if (_searchCtrl.text.isNotEmpty)
                  GestureDetector(
                    onTap: () => setState(() => _searchCtrl.clear()),
                    child: const Icon(Icons.cancel_rounded,
                        size: 17, color: _inkFaint),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          if (filteredContacts.isEmpty)
            _GlassSurface(
              radius: 26,
              blur: 18,
              padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 22),
              child: Column(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.white.withValues(alpha: 0.95),
                          _accentBlue.withValues(alpha: 0.12),
                        ],
                      ),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.95),
                        width: 1.2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: _accentBlue.withValues(alpha: 0.12),
                          blurRadius: 18,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.person_add_alt_1_rounded,
                      size: 26,
                      color: _accentBlue,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    isAk
                        ? 'လတ်တလော လွှဲပြောင်းသူ မရှိသေးပါ'
                        : 'No saved recipients yet',
                    style: const TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w900,
                      color: _inkStrong,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    isAk
                        ? 'အထက်တွင် ID သို့မဟုတ် Username ရိုက်ထည့်၍ လွှဲနိုင်ပါသည်'
                        : 'Enter a recipient username or 12-digit ID above to transfer.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: _inkSoft,
                      fontSize: 12,
                      height: 1.45,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filteredContacts.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (_, index) {
                final contact = filteredContacts[index];
                return GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () {
                    if (_deleteMode) {
                      setState(() {
                        _recentContacts.removeWhere((c) => c.id == contact.id);
                      });
                    } else {
                      _navigateToDetailWithContact(contact);
                    }
                  },
                  child: _GlassSurface(
                    radius: 20,
                    blur: 16,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 11),
                    shadow: false,
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                contact.avatarColor,
                                Color.lerp(
                                    contact.avatarColor, Colors.black, 0.22)!,
                              ],
                            ),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.55),
                              width: 1.4,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              contact.initials,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 15,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      contact.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w800,
                                        color: _inkStrong,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 7, vertical: 2),
                                    decoration: BoxDecoration(
                                      color:
                                          Colors.white.withValues(alpha: 0.62),
                                      borderRadius: BorderRadius.circular(999),
                                      border: Border.all(
                                        color:
                                            Colors.white.withValues(alpha: 0.9),
                                      ),
                                    ),
                                    child: Text(
                                      contact.category,
                                      style: const TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.w800,
                                        color: _inkSoft,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(
                                contact.uid.isNotEmpty ? contact.uid : '—',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: _inkFaint,
                                  fontWeight: FontWeight.w600,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),
                        if (_deleteMode)
                          Container(
                            width: 34,
                            height: 34,
                            decoration: BoxDecoration(
                              color: const Color(0xFF000000),
                              shape: BoxShape.circle,
                              border:
                                  Border.all(color: const Color(0xFF3F1D24)),
                            ),
                            child: const Icon(Icons.delete_rounded,
                                size: 16, color: Color(0xFFDC2626)),
                          )
                        else
                          Container(
                            width: 30,
                            height: 30,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.5),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.9),
                              ),
                            ),
                            child: const Icon(Icons.chevron_right_rounded,
                                color: _inkFaint, size: 19),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 2 (Pic 2): Recipient Header, Amount (AKD), Notes (Mandatory)
  // + Quick Chips + [Transfer] Button, Warning Security Box
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildScreen2Detail(AppState appState, bool isAk) {
    final noteChips = ['Salary', 'Payment', 'Bill', 'Family & Friends'];
    final enteredAmount = double.tryParse(_amountCtrl.text.trim());
    final isOverBalance =
        enteredAmount != null && enteredAmount > appState.wallet.balance;
    final isUnderMin =
        enteredAmount != null && enteredAmount > 0 && enteredAmount < 0.01;

    return SingleChildScrollView(
      key: const ValueKey('screen2'),
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // ── Recipient Profile Header ──
          _GlassSurface(
            radius: 28,
            blur: 22,
            padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 16),
            child: Column(
              children: [
                Container(
                  width: 76,
                  height: 76,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        _selectedRecipient.avatarColor,
                        Color.lerp(_selectedRecipient.avatarColor, Colors.black,
                            0.25)!,
                      ],
                    ),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.65),
                      width: 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: _selectedRecipient.avatarColor
                            .withValues(alpha: 0.30),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      _selectedRecipient.initials,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 27,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 13),
                Text(
                  _selectedRecipient.name,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 18.5,
                    fontWeight: FontWeight.w900,
                    color: _inkStrong,
                    letterSpacing: -0.2,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.55),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.95),
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        isAk ? 'ပိုက်ဆံအိတ်လိပ်စာ' : 'WALLET ADDRESS',
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: _inkFaint,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        _selectedRecipient.uid.isNotEmpty
                            ? _selectedRecipient.uid
                            : '—',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: _inkSoft,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // ── Main Card: Amount, Notes, Quick Chips, Transfer Button ──
          _GlassSurface(
            radius: 26,
            blur: 22,
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAk ? 'လွှဲမည့်ပမာဏ' : 'AMOUNT',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: _inkFaint,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 9),

                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.58),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.95),
                      width: 1.2,
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _amountCtrl,
                          cursorColor: _accentBlue,
                          keyboardType: const TextInputType.numberWithOptions(
                              decimal: true),
                          decoration: const InputDecoration(
                            hintText: '0.00',
                            hintStyle:
                                TextStyle(color: _inkFaint, fontSize: 22),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: EdgeInsets.symmetric(
                                horizontal: 16, vertical: 15),
                          ),
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: _inkStrong,
                            letterSpacing: -0.4,
                          ),
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.only(right: 10),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: _accentBlue.withValues(alpha: 0.10),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Text(
                          'AKD',
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w900,
                            color: _accentBlue,
                            letterSpacing: 0.6,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${isAk ? 'လက်ကျန်ငွေ' : 'Balance'}: ${NumberFormat('#,##0.00').format(appState.wallet.balance)} AKD',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: _inkSoft,
                      ),
                    ),
                    if (isOverBalance)
                      const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.error_outline_rounded,
                              size: 13, color: Color(0xFFDC2626)),
                          SizedBox(width: 3),
                          Text(
                            'Over balance',
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFDC2626),
                            ),
                          ),
                        ],
                      )
                    else if (isUnderMin)
                      const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.info_outline_rounded,
                              size: 13, color: crimson),
                          SizedBox(width: 3),
                          Text(
                            'At least 0.01',
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w800,
                              color: crimson,
                            ),
                          ),
                        ],
                      ),
                  ],
                ),

                const SizedBox(height: 18),

                Row(
                  children: [
                    Text(
                      isAk ? 'မှတ်စုရေးရန်' : 'Add Notes',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: _inkFaint,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: const Color(0xFF000000),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Text(
                        'Required',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFFDC2626),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 9),

                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.58),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.95),
                      width: 1.2,
                    ),
                  ),
                  child: TextField(
                    controller: _noteCtrl,
                    cursorColor: _accentBlue,
                    decoration: InputDecoration(
                      hintText: isAk
                          ? 'ငွေလွှဲရသည့် အကြောင်းအရင်း ရိုက်ထည့်ပါ...'
                          : 'Enter note for this transfer...',
                      hintStyle: const TextStyle(
                          color: _inkFaint,
                          fontSize: 13,
                          fontWeight: FontWeight.w500),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 14),
                    ),
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: _inkStrong),
                  ),
                ),

                const SizedBox(height: 11),

                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: noteChips.map((chip) {
                    final isCurrent = _noteCtrl.text.trim() == chip;
                    return _GlassChip(
                      label: chip,
                      selected: isCurrent,
                      onTap: () {
                        setState(() {
                          _noteCtrl.text = chip;
                        });
                      },
                    );
                  }).toList(),
                ),

                if (_errorMessage != null) ...[
                  const SizedBox(height: 14),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(11),
                    decoration: BoxDecoration(
                      color: const Color(0xFF000000),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF3F1D24)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded,
                            color: Color(0xFFDC2626), size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(
                              color: Color(0xFFDC2626),
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                if (isOverBalance) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF000000),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF3F1D24)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded,
                            color: Color(0xFFDC2626), size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            isAk
                                ? 'လက်ကျန်ငွေထက် ကျော်လွန်နေပါသည် (Over balance)'
                                : 'Over balance: Amount exceeds available balance',
                            style: const TextStyle(
                              color: Color(0xFFDC2626),
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                if (isUnderMin) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF000000),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF3F1D24)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline_rounded,
                            color: crimson, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            isAk
                                ? 'အနည်းဆုံး 0.01 AKD လွှဲရပါမည် (At least 0.01)'
                                : 'At least 0.01: Minimum transfer amount is 0.01 AKD',
                            style: const TextStyle(
                              color: crimson,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 20),

                // [Transfer] Button
                _GlassPrimaryButton(
                  height: 54,
                  danger: isOverBalance,
                  onPressed: (isOverBalance || _isProcessing)
                      ? null
                      : () => _onProcessTransfer(appState),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_isProcessing)
                        const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      else
                        const Icon(Icons.north_east_rounded,
                            size: 19, color: Colors.white),
                      const SizedBox(width: 8),
                      Text(
                        _isProcessing
                            ? (isAk ? 'လုပ်ဆောင်နေသည်…' : 'Processing…')
                            : isOverBalance
                                ? (isAk
                                    ? 'လက်ကျန်ထက် ကျော်လွန်ပါသည်'
                                    : 'Over Balance')
                                : (isAk ? 'ငွေလွှဲမည်' : 'Transfer'),
                        style: const TextStyle(
                            fontSize: 15.5,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: 0.1),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          _buildSecurityNotice(isAk),
        ],
      ),
    );
  }

  Widget _buildSecurityNotice(bool isAk) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF000000).withValues(alpha: 0.82),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFF78350F), width: 1.1),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1A0A0C).withValues(alpha: 0.10),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 26,
                height: 26,
                decoration: BoxDecoration(
                  color: const Color(0xFF1A1400),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF78350F)),
                ),
                child: const Icon(Icons.shield_outlined,
                    size: 14, color: Color(0xFFB45309)),
              ),
              const SizedBox(width: 8),
              Text(
                isAk ? 'အရေးကြီး သတိပေးချက်' : 'Important Warning',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF92400E),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _buildWarningBullet(
            isAk
                ? 'ငွေမလွှဲမီ လက်ခံသူ၏ အမည်နှင့် ပိုက်ဆံအိတ်လိပ်စာ (Wallet Address) ကို သေချာစွာ စစ်ဆေးပါ။ အတည်ပြုပြီးသော ငွေလွှဲမှုများကို ပြန်လည်ဖျက်သိမ်း၍ မရပါ။'
                : 'Verify the recipient\'s name and wallet address before sending. Transactions on Péthar cannot be reversed once confirmed.',
          ),
          const SizedBox(height: 7),
          _buildWarningBullet(
            isAk
                ? 'လုံခြုံရေးစည်းမျဉ်းနှင့် စာရင်းစစ်မှတ်တမ်းများအတွက် မှတ်စု (Add Notes) ရေးသားရန် မဖြစ်မနေ လိုအပ်ပါသည်။'
                : 'Adding a clear note is required for compliance, audit trails, and payment verification.',
          ),
        ],
      ),
    );
  }

  Widget _buildWarningBullet(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(top: 5, right: 8),
          child: Icon(Icons.circle, size: 5, color: Color(0xFFB45309)),
        ),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 11.5,
              height: 1.45,
              color: Color(0xFF92400E),
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUCCESS RECEIPT SLIP
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildScreenSuccess(AppState appState, bool isAk) {
    return SingleChildScrollView(
      key: const ValueKey('screen_success'),
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      child: Column(
        children: [
          _GlassSurface(
            radius: 28,
            blur: 22,
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Container(
                  width: 68,
                  height: 68,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF34D399), Color(0xFF059669)],
                    ),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.6),
                      width: 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0A140A).withValues(alpha: 0.30),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(Icons.check_rounded,
                        color: Colors.white, size: 34),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  isAk
                      ? 'ငွေလွှဲပြောင်းမှု အောင်မြင်ပါသည်'
                      : 'Transfer Successful',
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: _inkStrong,
                  ),
                ),
                const SizedBox(height: 7),
                Text(
                  '-${NumberFormat('#,##0.00').format(_successAmount)} AKD',
                  style: const TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.w900,
                    color: _inkStrong,
                    letterSpacing: -0.8,
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  height: 1,
                  color: Colors.white.withValues(alpha: 0.85),
                ),
                const SizedBox(height: 14),
                _buildReceiptRow('Recipient', _selectedRecipient.name),
                _buildReceiptRow('Wallet Address', _selectedRecipient.uid),
                _buildReceiptRow('Note', _successNote),
                _buildReceiptRow('Tx ID', _successTxId ?? '-'),
                _buildReceiptRow(
                  'Date',
                  _successTxTime != null
                      ? DateFormat('MMM dd, yyyy · hh:mm a')
                          .format(_successTxTime!)
                      : '-',
                ),
                _buildReceiptRow('Status', 'Completed'),
              ],
            ),
          ),
          const SizedBox(height: 18),
          _GlassPrimaryButton(
            height: 52,
            onPressed: () {
              setState(() {
                _step = TransferStep.input;
                _toInputCtrl.clear();
                _amountCtrl.clear();
                _noteCtrl.clear();
                _errorMessage = null;
              });
            },
            child: Text(
              isAk ? 'ပြီးပါပြီ' : 'Done',
              style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                  color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(
                  color: _inkSoft,
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600)),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 12.5,
                color: _inkStrong,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── LIQUID GLASS DESIGN KIT ────────────────────────────────────────────────

const Color _inkStrong = Color(0xFF0B1220);
const Color _inkSoft = Color(0xFF5B6B82);
const Color _inkFaint = Color(0xFF94A3B8);
const Color _accentBlue = Color(0xFF2563EB);

/// Ambient sky backdrop with soft light blooms that the glass refracts.
class _GlassBackdrop extends StatelessWidget {
  const _GlassBackdrop();

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
              stops: [0.0, 0.5, 1.0],
            ),
          ),
        ),
        Positioned(
          top: -150,
          right: -100,
          child: _GlowBlob(size: 360, color: Color(0xFF60A5FA), opacity: 0.38),
        ),
        Positioned(
          top: 170,
          left: -140,
          child: _GlowBlob(size: 380, color: Color(0xFFF87171), opacity: 0.14),
        ),
        Positioned(
          bottom: -160,
          right: -90,
          child: _GlowBlob(size: 430, color: Color(0xFF7DD3FC), opacity: 0.40),
        ),
        Positioned(
          bottom: 80,
          left: -90,
          child: _GlowBlob(size: 270, color: Color(0xFFF5D77A), opacity: 0.20),
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

/// Frosted translucent panel with a bright rim, top gloss and soft shadow.
class _GlassSurface extends StatelessWidget {
  const _GlassSurface({
    required this.child,
    this.radius = 22,
    this.blur = 20,
    this.padding = EdgeInsets.zero,
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
                  color: const Color(0xFF1E3A5F).withValues(alpha: 0.08),
                  blurRadius: 26,
                  offset: const Offset(0, 12),
                ),
                BoxShadow(
                  color: Colors.white.withValues(alpha: 0.55),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ]
            : null,
      ),
      child: ClipRRect(
        borderRadius: borderRadius,
        child: BackdropFilter(
          filter: ui.ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Stack(
            children: [
              Container(
                width: double.infinity,
                padding: padding,
                decoration: BoxDecoration(
                  borderRadius: borderRadius,
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: tint == null
                        ? [
                            Colors.white.withValues(alpha: 0.82),
                            Colors.white.withValues(alpha: 0.56),
                            Colors.white.withValues(alpha: 0.42),
                          ]
                        : [
                            Colors.white.withValues(alpha: 0.88),
                            tint!.withValues(alpha: 0.10),
                            Colors.white.withValues(alpha: 0.44),
                          ],
                    stops: const [0.0, 0.55, 1.0],
                  ),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.92),
                    width: 1.2,
                  ),
                ),
                child: child,
              ),
              // Top gloss highlight
              Positioned(
                top: 0,
                left: 14,
                right: 14,
                height: 46,
                child: IgnorePointer(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.white.withValues(alpha: 0.42),
                          Colors.white.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Dark ink pill button with a glassy rim highlight.
class _GlassPrimaryButton extends StatelessWidget {
  const _GlassPrimaryButton({
    required this.child,
    required this.onPressed,
    this.height = 52,
    this.danger = false,
  });

  final Widget child;
  final VoidCallback? onPressed;
  final double height;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null;
    return AnimatedOpacity(
      duration: const Duration(milliseconds: 200),
      opacity: enabled ? 1 : 0.55,
      child: Material(
        color: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        clipBehavior: Clip.antiAlias,
        child: Ink(
          width: double.infinity,
          height: height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: danger
                  ? const [Color(0xFFEF4444), Color(0xFFB91C1C)]
                  : const [Color(0xFF22314D), Color(0xFF0B1220)],
            ),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.18),
              width: 1.1,
            ),
            boxShadow: [
              BoxShadow(
                color: (danger ? const Color(0xFFDC2626) : _inkStrong)
                    .withValues(alpha: 0.28),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Stack(
            fit: StackFit.expand,
            children: [
              Positioned(
                top: 0,
                left: 20,
                right: 20,
                height: 24,
                child: IgnorePointer(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.white.withValues(alpha: 0.24),
                          Colors.white.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: onPressed,
                  child: Center(child: child),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Small translucent pill used for the History action.
class _GlassPill extends StatelessWidget {
  const _GlassPill({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      shape: const StadiumBorder(),
      clipBehavior: Clip.antiAlias,
      child: Ink(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white.withValues(alpha: 0.85),
              Colors.white.withValues(alpha: 0.45),
            ],
          ),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.95),
            width: 1.1,
          ),
        ),
        child: InkWell(
          customBorder: const StadiumBorder(),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 14, color: _inkSoft),
                const SizedBox(width: 5),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w800,
                    color: _inkSoft,
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

/// Frosted circular icon button.
class _GlassIconCircle extends StatelessWidget {
  const _GlassIconCircle({required this.icon, required this.onTap});

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
              Colors.white.withValues(alpha: 0.88),
              Colors.white.withValues(alpha: 0.42),
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
            child: Icon(icon, color: _inkStrong, size: 16),
          ),
        ),
      ),
    );
  }
}

/// Category / quick-note chip with a glass or ink state.
class _GlassChip extends StatelessWidget {
  const _GlassChip({
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
          padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: selected
                  ? const [Color(0xFF22314D), Color(0xFF0B1220)]
                  : [
                      Colors.white.withValues(alpha: 0.72),
                      Colors.white.withValues(alpha: 0.40),
                    ],
            ),
            border: Border.all(
              color: selected
                  ? Colors.white.withValues(alpha: 0.20)
                  : Colors.white.withValues(alpha: 0.92),
              width: 1.1,
            ),
            boxShadow: [
              BoxShadow(
                color: selected
                    ? _inkStrong.withValues(alpha: 0.22)
                    : const Color(0xFF1E3A5F).withValues(alpha: 0.05),
                blurRadius: selected ? 14 : 8,
                offset: Offset(0, selected ? 6 : 3),
              ),
            ],
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: selected ? FontWeight.w800 : FontWeight.w700,
              color: selected ? Colors.white : _inkSoft,
              letterSpacing: 0.1,
            ),
          ),
        ),
      ),
    );
  }
}
