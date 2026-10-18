import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../widgets/arakan_emblem.dart';

enum PayStep {
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

class PayScreen extends StatefulWidget {
  const PayScreen({Key? key}) : super(key: key);

  @override
  State<PayScreen> createState() => _PayScreenState();
}

class _PayScreenState extends State<PayScreen> {
  PayStep _step = PayStep.input;

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

  // Success Transaction Details
  String? _successTxId;
  DateTime? _successTxTime;
  double _successAmount = 0.0;
  String _successNote = '';

  @override
  void initState() {
    super.initState();
    _recentContacts = [
      RecentPayContact(
        id: 'REC-1',
        name: 'Zaw Myo Htet',
        username: '@zawmyo',
        uid: '882194012345',
        category: 'Friends',
        initials: 'ZM',
        avatarColor: const Color(0xFF10B981),
      ),
      RecentPayContact(
        id: 'REC-2',
        name: 'Ma Hnin Nu',
        username: '@hninnu',
        uid: '440211987654',
        category: 'Family',
        initials: 'HN',
        avatarColor: const Color(0xFFF43F5E),
      ),
      RecentPayContact(
        id: 'REC-3',
        name: 'Ko Min Aung',
        username: '@minaung',
        uid: '198273560912',
        category: 'Friends',
        initials: 'MA',
        avatarColor: const Color(0xFF3B82F6),
      ),
      RecentPayContact(
        id: 'REC-4',
        name: 'Daw Saw Mya',
        username: '@sawmya',
        uid: '771902345678',
        category: 'Family',
        initials: 'SM',
        avatarColor: const Color(0xFFF59E0B),
      ),
      RecentPayContact(
        id: 'REC-5',
        name: 'Kyaukpyu Merchant Service',
        username: '@kyaukpyu_biz',
        uid: '330549123456',
        category: 'other',
        initials: 'KM',
        avatarColor: const Color(0xFF8B5CF6),
      ),
    ];
    _selectedRecipient = _recentContacts.first;

    _amountCtrl.addListener(() {
      if (mounted) setState(() {});
    });

    // Check if user navigated from Favourites or Scanner
    final appState = Provider.of<AppState>(context, listen: false);
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
          final hash12 = customUid ?? ('${name.hashCode.abs()}987654321000').substring(0, 12);
          final newContact = RecentPayContact(
            id: 'REC-${name.toLowerCase().replaceAll(' ', '')}',
            name: name,
            username: customUsername ?? '@${name.toLowerCase().replaceAll(' ', '_')}',
            uid: hash12,
            category: 'Friends',
            initials: initials,
            avatarColor: Color(colorVal),
          );
          _recentContacts.insert(0, newContact);
          return newContact;
        },
      );
      _selectedRecipient = match;
      _toInputCtrl.text = match.username;
      _errorMessage = null;
      _step = PayStep.detail;
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
      _toInputCtrl.text = contact.username;
      _errorMessage = null;
      _step = PayStep.detail;
    });
  }

  void _onNextPressed() {
    final query = _toInputCtrl.text.trim();
    if (query.isEmpty) {
      setState(() => _errorMessage = 'Please enter a valid 12-digit ID or username');
      return;
    }

    // Check if matching contact in recent list, or create dynamic recipient
    final cleanQuery = query.replaceAll(' ', '').toLowerCase();
    final matched = _recentContacts.firstWhere(
      (c) =>
          c.username.toLowerCase() == query.toLowerCase() ||
          c.uid.replaceAll(' ', '').toLowerCase() == cleanQuery ||
          c.name.toLowerCase() == query.toLowerCase(),
      orElse: () {
        final hash12 = ('${query.replaceAll(' ', '').hashCode.abs()}102938475612').substring(0, 12);
        return RecentPayContact(
          id: 'REC-CUSTOM',
          name: query.startsWith('@') ? query.substring(1) : query,
          username: query.startsWith('@') ? query : '@$query',
          uid: hash12,
          category: 'other',
          initials: query.isNotEmpty ? query[0].toUpperCase() : 'U',
          avatarColor: const Color(0xFF0284C7),
        );
      },
    );

    setState(() {
      _selectedRecipient = matched;
      _errorMessage = null;
      _step = PayStep.detail;
    });
  }

  void _onProcessPay(AppState appState) {
    final amount = double.tryParse(_amountCtrl.text.trim()) ?? 0.0;
    final note = _noteCtrl.text.trim();

    final isAk = appState.language == 'ak';
    if (amount <= 0 || amount < 1.0) {
      setState(() => _errorMessage = isAk
          ? 'အနည်းဆုံး 1.00 AKD လွှဲရပါမည် (At least 1.00)'
          : 'Amount must be at least 1.00 AKD');
      return;
    }

    if (amount > appState.wallet.balance) {
      setState(() => _errorMessage = isAk
          ? 'လက်ကျန်ငွေထက် ကျော်လွန်နေပါသည် (Over balance)'
          : 'Over balance: Transfer amount exceeds available balance');
      return;
    }

    if (note.isEmpty) {
      setState(() => _errorMessage = 'Add Notes is mandatory. Please provide a note');
      return;
    }

    // Deduct balance and record transaction
    appState.recordTransfer(
      amount: amount,
      recipientName: _selectedRecipient.name,
      recipientId: _selectedRecipient.uid,
    );

    final txId = 'TX-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}';
    final now = DateTime.now();

    setState(() {
      _errorMessage = null;
      _successTxId = txId;
      _successTxTime = now;
      _successAmount = amount;
      _successNote = note;
      _step = PayStep.success;
    });
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
      backgroundColor: const Color(0xFFF4F5F8),
      body: SafeArea(
        bottom: true,
        child: Column(
          children: [
            // Top Bar: < Back | Pay | [History]
            _buildTopBar(appState, isAk),

            // Body depending on _step
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                child: _step == PayStep.input
                    ? _buildScreen1Input(appState, isAk)
                    : _step == PayStep.detail
                        ? _buildScreen2Detail(appState, isAk)
                        : _buildScreenSuccess(appState, isAk),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOP APP BAR: < Back | Pay | [History]
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildTopBar(AppState appState, bool isAk) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: const Color(0xFFF4F5F8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Left: < Back button
          GestureDetector(
            onTap: () {
              if (_step == PayStep.detail) {
                setState(() {
                  _step = PayStep.input;
                  _errorMessage = null;
                });
              } else if (_step == PayStep.success) {
                setState(() {
                  _step = PayStep.input;
                  _amountCtrl.clear();
                  _noteCtrl.clear();
                });
              } else {
                appState.navigate(Screen.home);
              }
            },
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Center(
                child: Icon(Icons.chevron_left_rounded, color: Colors.black87, size: 24),
              ),
            ),
          ),

          // Center: Title "Pay"
          Text(
            isAk ? 'ငွေပေးချေ' : 'Pay',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0F172A),
              letterSpacing: -0.2,
            ),
          ),

          // Right: [History] Pill Button
          GestureDetector(
            onTap: () => appState.navigate(Screen.history),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: const Color(0xFFCBD5E1), width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.history_rounded, size: 14, color: Color(0xFF334155)),
                  const SizedBox(width: 4),
                  Text(
                    isAk ? 'မှတ်တမ်း' : 'History',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF334155),
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

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 1 (Pic 1): From Card, To Card (UID/username + [Scan] + [Next]),
  // Recent Transfers (Delete, Categories, Search, Contact List)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildScreen1Input(AppState appState, bool isAk) {
    // Filter contacts by Category Tab and Search Query
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
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── 1. FROM CARD ──
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              children: [
                // Sender Avatar
                Container(
                  width: 44,
                  height: 44,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      appState.profile.name.isNotEmpty
                          ? appState.profile.name[0].toUpperCase()
                          : 'U',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
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
                        isAk ? 'လွှဲပို့သူ (FROM)' : 'From',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF94A3B8),
                          letterSpacing: 0.3,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            appState.profile.name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0284C7).withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.check_circle_rounded, size: 11, color: Color(0xFF0284C7)),
                                const SizedBox(width: 3),
                                Text(
                                  isAk ? 'အတည်ပြုပြီး' : 'Verified',
                                  style: const TextStyle(
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0284C7),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${isAk ? 'လက်ကျန်ငွေ' : 'Balance'}: ${NumberFormat('#,##0.00').format(appState.wallet.balance)} AKD',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // ── 2. TO CARD (enter UID or username + [Scan] + [Next]) ──
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAk ? 'လက်ခံသူ (TO)' : 'To',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF94A3B8),
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 8),

                // Input Field with [Scan] Trailing Button
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _toInputCtrl,
                          decoration: InputDecoration(
                            hintText: isAk ? '12-digit ID သို့မဟုတ် username ရိုက်ထည့်ပါ' : 'enter 12-digit ID or username',
                            hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                          ),
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
                          onSubmitted: (_) => _onNextPressed(),
                        ),
                      ),
                      // [Scan] Button
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onTap: _openScanInNavbar,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                            decoration: BoxDecoration(
                              color: Colors.black,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.qr_code_scanner_rounded, size: 14, color: Colors.white),
                                const SizedBox(width: 4),
                                Text(
                                  isAk ? 'စကင်' : 'Scan',
                                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
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
                  const SizedBox(height: 8),
                  Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],

                const SizedBox(height: 14),

                // [Next] Button -> Navigates to Screen 2
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                    ),
                    onPressed: _onNextPressed,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          isAk ? 'ရှေ့သို့' : 'Next',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.arrow_forward_rounded, size: 16),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // ── 3. RECENT TRANSFERS SECTION ──
          // Header Row: Recent Transfers + [Delete] Button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isAk ? 'မကြာသေးမီက လွှဲပြောင်းမှုများ' : 'Recent Transfers',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                ),
              ),
              GestureDetector(
                onTap: () => setState(() => _deleteMode = !_deleteMode),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: _deleteMode ? Colors.red.shade50 : Colors.white,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: _deleteMode ? Colors.red.shade300 : const Color(0xFFCBD5E1),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _deleteMode ? Icons.check_rounded : Icons.delete_outline_rounded,
                        size: 13,
                        color: _deleteMode ? Colors.red.shade700 : const Color(0xFF64748B),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _deleteMode
                            ? (isAk ? 'ပြီးပါပြီ' : 'Done')
                            : (isAk ? 'ဖျက်မည်' : 'Delete'),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: _deleteMode ? Colors.red.shade700 : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Category Filter Tabs: All | Family | Friends | other
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['All', 'Family', 'Friends', 'other'].map((tab) {
                final isSelected = _selectedCategoryTab == tab;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedCategoryTab = tab),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: isSelected ? Colors.black : Colors.white,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                          color: isSelected ? Colors.black : const Color(0xFFE2E8F0),
                        ),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.15),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ]
                            : null,
                      ),
                      child: Text(
                        tab == 'other' ? 'Other' : tab,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                          color: isSelected ? Colors.white : const Color(0xFF475569),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 12),

          // Search Bar: "search"
          Container(
            height: 42,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, size: 18, color: Color(0xFF94A3B8)),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _searchCtrl,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: isAk ? 'ရှာဖွေရန်...' : 'search',
                      hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ),
                if (_searchCtrl.text.isNotEmpty)
                  GestureDetector(
                    onTap: () => setState(() => _searchCtrl.clear()),
                    child: const Icon(Icons.cancel_rounded, size: 16, color: Color(0xFF94A3B8)),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Contact List: [Profile Pic] User Name >
          if (filteredContacts.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(28),
              alignment: Alignment.center,
              child: Text(
                isAk ? 'မှတ်တမ်း မတွေ့ပါ' : 'No transfers found',
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filteredContacts.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, index) {
                final contact = filteredContacts[index];
                return GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  // When clicked, navigate immediately to Screen 2 (Pic 2)!
                  onTap: () {
                    if (_deleteMode) {
                      setState(() {
                        _recentContacts.removeWhere((c) => c.id == contact.id);
                      });
                    } else {
                      _navigateToDetailWithContact(contact);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // Avatar
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: contact.avatarColor,
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              contact.initials,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Name and Handle
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    contact.name,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFF0F172A),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF1F5F9),
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Text(
                                      contact.category,
                                      style: const TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF64748B),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${contact.username} • ${contact.uid}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF64748B),
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Right: > or Delete Icon
                        if (_deleteMode)
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(Icons.delete_rounded, size: 16, color: Colors.red.shade700),
                          )
                        else
                          const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 22),
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
  // SCREEN 2 (Pic 2): Recipient Header, Amount (AKD) + MAX, Notes (Mandatory)
  // + Quick Chips + [Pay] Button, Warning Security Box
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildScreen2Detail(AppState appState, bool isAk) {
    final noteChips = ['Salary', 'Payment', 'Bill', 'Family & Friends'];
    final enteredAmount = double.tryParse(_amountCtrl.text.trim());
    final isOverBalance = enteredAmount != null && enteredAmount > appState.wallet.balance;
    final isUnderMin = enteredAmount != null && enteredAmount > 0 && enteredAmount < 1.0;

    return SingleChildScrollView(
      key: const ValueKey('screen2'),
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // ── Recipient Profile Header (Pic 2) ──
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              children: [
                // Recipient Avatar
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: _selectedRecipient.avatarColor,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: _selectedRecipient.avatarColor.withValues(alpha: 0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      _selectedRecipient.initials,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 26,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  _selectedRecipient.name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 5),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle_rounded, size: 12, color: Color(0xFF059669)),
                      const SizedBox(width: 4),
                      Text(
                        isAk ? 'အတည်ပြုထားသော အကောင့်' : 'Verified Recipient',
                        style: const TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF059669),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  _selectedRecipient.username,
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B),
                    fontFamily: 'monospace',
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  _selectedRecipient.uid,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B),
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // ── Main Card: Amount (AKD), Mandatory Notes, Quick Chips, Pay Button ──
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Label: Amount
                Text(
                  isAk ? 'လွှဲမည့်ပမာဏ' : 'Amount',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF334155),
                  ),
                ),
                const SizedBox(height: 8),

                // Amount Input Box (no AKD inside, no MAX button)
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: TextField(
                    controller: _amountCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      hintText: '0.00',
                      hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 18),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    ),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                ),
                const SizedBox(height: 6),

                // Under that: show balance and "At least" / "Over balance" dynamic text
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${isAk ? 'လက်ကျန်ငွေ' : 'Balance'}: ${NumberFormat('#,##0.00').format(appState.wallet.balance)}',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF64748B),
                      ),
                    ),
                    if (isOverBalance)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.error_outline_rounded, size: 12, color: Color(0xFFDC2626)),
                          const SizedBox(width: 3),
                          Text(
                            isAk ? 'လက်ကျန်ထက် ကျော်လွန်ပါသည်' : 'Over balance',
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFDC2626),
                            ),
                          ),
                        ],
                      )
                    else if (isUnderMin)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.info_outline_rounded, size: 12, color: Color(0xFFEA580C)),
                          const SizedBox(width: 3),
                          Text(
                            isAk ? 'အနည်းဆုံး 1.00' : 'At least 1.00',
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFEA580C),
                            ),
                          ),
                        ],
                      )
                    else
                      Text(
                        isAk ? 'အနည်းဆုံး: 1.00' : 'At least: 1.00',
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                  ],
                ),

                const SizedBox(height: 16),

                // Label: Add Notes (Mandatory)
                Row(
                  children: [
                    Text(
                      isAk ? 'မှတ်စုရေးရန် (မဖြစ်မနေ)' : 'Add Notes',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF334155),
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      '(Mandatory)',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFFEF4444),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Notes Input Field
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: TextField(
                    controller: _noteCtrl,
                    decoration: InputDecoration(
                      hintText: isAk ? 'ငွေလွှဲရသည့် အကြောင်းအရင်း ရိုက်ထည့်ပါ...' : 'Enter note for this transfer...',
                      hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
                  ),
                ),

                const SizedBox(height: 10),

                // Quick Note Chips: [Salary], [Payment], [Bill], [Family & Friends]
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: noteChips.map((chip) {
                    final isCurrent = _noteCtrl.text.trim() == chip;
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _noteCtrl.text = chip;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: isCurrent ? Colors.black : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: isCurrent ? Colors.black : const Color(0xFFE2E8F0),
                          ),
                        ),
                        child: Text(
                          chip,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: isCurrent ? FontWeight.w800 : FontWeight.w600,
                            color: isCurrent ? Colors.white : const Color(0xFF475569),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),

                if (_errorMessage != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline_rounded, color: Colors.red.shade700, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: TextStyle(
                              color: Colors.red.shade700,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
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
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFFCA5A5)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded, color: Color(0xFFDC2626), size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            isAk
                                ? 'လက်ကျန်ငွေထက် ကျော်လွန်နေပါသည် (Over balance)'
                                : 'Over balance: Amount exceeds available balance',
                            style: const TextStyle(
                              color: Color(0xFFDC2626),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
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
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF7ED),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFFDBA74)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline_rounded, color: Color(0xFFEA580C), size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            isAk
                                ? 'အနည်းဆုံး 1.00 AKD လွှဲရပါမည် (At least 1.00)'
                                : 'At least 1.00: Minimum transfer amount is 1.00 AKD',
                            style: const TextStyle(
                              color: Color(0xFFEA580C),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 20),

                // [Pay] Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isOverBalance ? const Color(0xFFDC2626) : Colors.black,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                    ),
                    onPressed: isOverBalance ? null : () => _onProcessPay(appState),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const WalletMinimalFlutterIcon(size: 20, color: Colors.white),
                        const SizedBox(width: 8),
                        Text(
                          isOverBalance
                              ? (isAk ? 'လက်ကျန်ထက် ကျော်လွန်ပါသည် (Over Balance)' : 'Over Balance')
                              : (isAk ? 'ငွေပေးချေမည်' : 'Pay'),
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // ── Warning / Security Info Box ──
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
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.warning_amber_rounded, size: 16, color: Color(0xFFD97706)),
              const SizedBox(width: 6),
              Text(
                isAk ? 'အရေးကြီး သတိပေးချက်' : 'Important Warning',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF92400E),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _buildWarningBullet(
            isAk
                ? 'ငွေမလွှဲမီ လက်ခံသူ၏ 12-digit ID သာမက username နှင့် Name of user (အမည်) ကိုပါ သေချာစွာ စစ်ဆေးပါ။ အတည်ပြုပြီးသော ငွေလွှဲမှုများကို ပြန်လည်ဖျက်သိမ်း၍ မရပါ။'
                : 'Verify not only the recipient\'s 12-digit ID, but also username and Name of user before sending. Transactions on Péthar cannot be reversed once confirmed.',
          ),
          const SizedBox(height: 6),
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
          padding: EdgeInsets.only(top: 4, right: 8),
          child: Icon(Icons.circle, size: 5, color: Color(0xFFD97706)),
        ),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 11.5,
              height: 1.4,
              color: Color(0xFF92400E),
              fontWeight: FontWeight.w500,
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
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(Icons.check_rounded, color: Color(0xFF059669), size: 36),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  isAk ? 'ငွေလွှဲပြောင်းမှု အောင်မြင်ပါသည်' : 'Payment Successful!',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '-${NumberFormat('#,##0.00').format(_successAmount)} AKD',
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 20),
                const Divider(),
                const SizedBox(height: 14),
                _buildReceiptRow('Recipient', _selectedRecipient.name),
                _buildReceiptRow('Username', _selectedRecipient.username),
                _buildReceiptRow('Recipient ID', _selectedRecipient.uid),
                _buildReceiptRow('Note', _successNote),
                _buildReceiptRow('Tx ID', _successTxId ?? '-'),
                _buildReceiptRow(
                  'Date',
                  _successTxTime != null
                      ? DateFormat('MMM dd, yyyy · hh:mm a').format(_successTxTime!)
                      : '-',
                ),
                _buildReceiptRow('Status', 'Completed (Settled on-chain)'),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
              ),
              onPressed: () {
                setState(() {
                  _step = PayStep.input;
                  _toInputCtrl.clear();
                  _amountCtrl.clear();
                  _noteCtrl.clear();
                  _errorMessage = null;
                });
              },
              child: Text(
                isAk ? 'နောက်ထပ် လွှဲမည်' : 'Done',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
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
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 13,
              color: Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }
}
