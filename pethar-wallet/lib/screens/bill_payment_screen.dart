import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class BillItem {
  final String id;
  final String name;
  final String category;
  final String defaultAccount;
  final String accountLabel;
  final double defaultAmountMmk;
  final double defaultAmountThb;
  final Color primaryColor;
  final String initials;

  const BillItem({
    required this.id,
    required this.name,
    required this.category,
    required this.defaultAccount,
    required this.accountLabel,
    this.defaultAmountMmk = 0.0,
    this.defaultAmountThb = 0.0,
    required this.primaryColor,
    required this.initials,
  });
}

class BillPaymentScreen extends StatefulWidget {
  const BillPaymentScreen({Key? key}) : super(key: key);

  @override
  State<BillPaymentScreen> createState() => _BillPaymentScreenState();
}

class _BillPaymentScreenState extends State<BillPaymentScreen> {
  String _searchQuery = '';
  final TextEditingController _searchCtrl = TextEditingController();

  // Selected biller for detail / payment flow
  BillItem? _selectedBiller;
  final TextEditingController _accountCtrl = TextEditingController();
  bool _isBillFetched = false;

  static const double thbToMmkRate = 115.0;
  static const double akdToMmkRate = 4500.0;

  // ── Combined Billers List (Sorted A to Z) ─────────────────────────────────
  static final List<BillItem> _allBillers = [
    const BillItem(
      id: 'mm_aia',
      name: 'AIA Myanmar Life Insurance',
      category: 'Insurance',
      defaultAccount: 'POL-982140021',
      accountLabel: 'Policy Number',
      defaultAmountMmk: 45000.0,
      primaryColor: Color(0xFFD91624),
      initials: 'AIA',
    ),
    const BillItem(
      id: 'ak_arakhanet',
      name: 'Arakhanet',
      category: 'Internet & Fiber',
      defaultAccount: 'ANET-20849',
      accountLabel: 'User ID / Account No',
      defaultAmountMmk: 25000.0,
      primaryColor: Color(0xFF0284C7),
      initials: 'ANET',
    ),
    const BillItem(
      id: 'ak_arakkha_comm',
      name: 'Arakkha Public Communication Service',
      category: 'Communication Service',
      defaultAccount: 'APCS-78192',
      accountLabel: 'Customer ID / Service No',
      defaultAmountMmk: 20000.0,
      primaryColor: Color(0xFF1E3A8A),
      initials: 'APCS',
    ),
    const BillItem(
      id: 'mm_atom',
      name: 'ATOM Broadband & Smart Device',
      category: 'Broadband & Fiber',
      defaultAccount: '09795220917',
      accountLabel: 'Account ID / Mobile No',
      defaultAmountMmk: 32000.0,
      primaryColor: Color(0xFF0284C7),
      initials: 'ATOM',
    ),
    const BillItem(
      id: 'ak_fda',
      name: 'FDA Arakan',
      category: 'Public Health & Food Dept',
      defaultAccount: 'FDA-AR-10492',
      accountLabel: 'Registration / License No',
      defaultAmountMmk: 15000.0,
      primaryColor: Color(0xFF059669),
      initials: 'FDA',
    ),
    const BillItem(
      id: 'ak_hdco',
      name: 'HDCO Arakan',
      category: 'Humanitarian & Development',
      defaultAccount: 'HDCO-88319',
      accountLabel: 'Reference / ID No',
      defaultAmountMmk: 10000.0,
      primaryColor: Color(0xFF7C3AED),
      initials: 'HDCO',
    ),
    const BillItem(
      id: 'ak_mega_ftth',
      name: 'Mega Network FTTH',
      category: 'Broadband & FTTH',
      defaultAccount: 'MEGA-FTTH-4402',
      accountLabel: 'Customer Code / User ID',
      defaultAmountMmk: 28000.0,
      primaryColor: Color(0xFFEA580C),
      initials: 'MEGA',
    ),
    const BillItem(
      id: 'th_mea',
      name: 'Metropolitian Electricity',
      category: 'Electricity & Power',
      defaultAccount: 'CA-100293847',
      accountLabel: 'MEA CA / Account No',
      defaultAmountThb: 1250.0,
      primaryColor: Color(0xFFEA580C),
      initials: 'MEA',
    ),
    const BillItem(
      id: 'th_mwa',
      name: 'Metropolitian Water Authority',
      category: 'Waterworks',
      defaultAccount: 'MWA-4412098',
      accountLabel: 'Customer Code',
      defaultAmountThb: 240.0,
      primaryColor: Color(0xFF0284C7),
      initials: 'MWA',
    ),
    const BillItem(
      id: 'th_pwa',
      name: 'Metropolitian Waterworks',
      category: 'Waterworks',
      defaultAccount: 'MWW-6651203',
      accountLabel: 'User ID / Account No',
      defaultAmountThb: 185.0,
      primaryColor: Color(0xFF0369A1),
      initials: 'MWW',
    ),
    const BillItem(
      id: 'mm_mytel_ftth',
      name: 'Mytel FTTH',
      category: 'Broadband & FTTH',
      defaultAccount: 'MYT-90218',
      accountLabel: 'Customer ID / CID',
      defaultAmountMmk: 30000.0,
      primaryColor: Color(0xFFF97316),
      initials: 'MYTEL',
    ),
    const BillItem(
      id: 'th_pea',
      name: 'Provincial Electricity',
      category: 'Electricity & Power',
      defaultAccount: 'PEA-9920145',
      accountLabel: 'PEA CA No',
      defaultAmountThb: 980.0,
      primaryColor: Color(0xFF7C3AED),
      initials: 'PEA',
    ),
    const BillItem(
      id: 'ak_rakhine_link',
      name: 'Rakhine Link',
      category: 'Broadband & Fiber',
      defaultAccount: 'RL-552103',
      accountLabel: 'Account No / User ID',
      defaultAmountMmk: 22000.0,
      primaryColor: Color(0xFF2563EB),
      initials: 'RLINK',
    ),
    const BillItem(
      id: 'ak_tlink_ftth',
      name: 'T-Link FTTH',
      category: 'Broadband & FTTH',
      defaultAccount: 'TL-99412',
      accountLabel: 'Subscriber ID',
      defaultAmountMmk: 26000.0,
      primaryColor: Color(0xFF0D9488),
      initials: 'TLINK',
    ),
  ];

  List<BillItem> get _sortedAndFilteredBillers {
    final list = List<BillItem>.from(_allBillers)
      ..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));

    if (_searchQuery.trim().isEmpty) return list;

    final query = _searchQuery.trim().toLowerCase();
    return list.where((b) {
      return b.name.toLowerCase().contains(query) ||
          b.category.toLowerCase().contains(query);
    }).toList();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _accountCtrl.dispose();
    super.dispose();
  }

  void _openBillerDetail(BillItem item) {
    setState(() {
      _selectedBiller = item;
      _accountCtrl.text = item.defaultAccount;
      _isBillFetched = true;
    });
  }

  void _closeBillerDetail() {
    setState(() {
      _selectedBiller = null;
      _isBillFetched = false;
    });
  }

  void _executePayment(BuildContext context, AppState appState, BillItem biller) {
    double mmk = biller.defaultAmountMmk;
    double thb = biller.defaultAmountThb;
    double akd = 0.0;

    if (mmk > 0) {
      akd = mmk / akdToMmkRate;
      thb = mmk / thbToMmkRate;
    } else {
      akd = (thb * thbToMmkRate) / akdToMmkRate;
      mmk = thb * thbToMmkRate;
    }

    appState.processBillPayment(
      billerName: biller.name,
      billerCategory: biller.category,
      accountNo: _accountCtrl.text,
      mmkAmount: mmk,
      thbAmount: thb,
      akdAmount: akd,
    );

    // Show Success Dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: Color(0xFFECFDF5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 38),
              ),
              const SizedBox(height: 16),
              const Text(
                'Bill Paid Successfully!',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF18181B)),
              ),
              const SizedBox(height: 8),
              Text(
                'Payment for ${biller.name} has been processed.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: Color(0xFF71717A)),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Account / Ref', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                        Text(_accountCtrl.text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Amount Paid', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                        Text(
                          mmk > 0 ? '${NumberFormat("#,###").format(mmk)} MMK' : '${thb.toStringAsFixed(2)} THB',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Charged', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                        Text(
                          '≈ ${akd.toStringAsFixed(3)} AKD',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFFEA580C)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    _closeBillerDetail();
                    appState.navigate(Screen.home);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF9E1B32),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                  ),
                  child: const Text('Back to Home', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
                ),
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

    // If a biller is selected, show detail & payment flow
    if (_selectedBiller != null) {
      return _buildBillerDetailScreen(context, appState, _selectedBiller!);
    }

    final billers = _sortedAndFilteredBillers;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Column(
          children: [
            // Header: Centered "Bill Payment", Back on left, History on right corner
            Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(
                  bottom: BorderSide(color: Color(0xFFE2E8F0), width: 0.8),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    height: 52,
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Centered Title in Middle
                        const Positioned.fill(
                          child: Center(
                            child: Text(
                              'Bill Payment',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF0F172A),
                                letterSpacing: -0.3,
                              ),
                            ),
                          ),
                        ),

                        // Back Button on Left
                        Positioned(
                          left: 4,
                          child: IconButton(
                            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 20),
                            onPressed: () => appState.navigate(Screen.home),
                          ),
                        ),

                        // History Button in Right Corner
                        Positioned(
                          right: 16,
                          child: GestureDetector(
                            onTap: () => appState.navigate(Screen.history),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: const Text(
                                'History',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Search Bar Under Header with "Search Bill Payment" Text
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: _searchCtrl,
                              onChanged: (v) => setState(() => _searchQuery = v),
                              decoration: const InputDecoration(
                                hintText: 'Search Bill Payment',
                                hintStyle: TextStyle(
                                  fontSize: 14,
                                  color: Color(0xFF94A3B8),
                                  fontWeight: FontWeight.w500,
                                ),
                                border: InputBorder.none,
                                isDense: true,
                                contentPadding: EdgeInsets.symmetric(vertical: 12),
                              ),
                            ),
                          ),
                          if (_searchQuery.isNotEmpty)
                            GestureDetector(
                              onTap: () {
                                _searchCtrl.clear();
                                setState(() => _searchQuery = '');
                              },
                              child: const Icon(Icons.close_rounded, size: 18, color: Color(0xFF64748B)),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Billers List (Sorted A to Z, No Kyo Phyae Button)
            Expanded(
              child: billers.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.search_off_rounded, size: 48, color: Colors.grey.shade400),
                          const SizedBox(height: 12),
                          Text(
                            'No billers found for "$_searchQuery"',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      itemCount: billers.length,
                      separatorBuilder: (ctx, i) => const SizedBox(height: 10),
                      itemBuilder: (ctx, i) {
                        final b = billers[i];
                        return InkWell(
                          onTap: () => _openBillerDetail(b),
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.02),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                // Logo Badge
                                _buildBillerLogo(b),
                                const SizedBox(width: 14),

                                // Biller Name & Category
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        b.name,
                                        style: const TextStyle(
                                          fontSize: 14.5,
                                          fontWeight: FontWeight.w700,
                                          color: Color(0xFF18181B),
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        b.category,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                          color: Color(0xFF64748B),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),

                                const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 22),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // BILLER DETAIL & PAYMENT FLOW
  // ═════════════════════════════════════════════════════════════════════════
  Widget _buildBillerDetailScreen(BuildContext context, AppState appState, BillItem biller) {
    final isMmk = biller.defaultAmountMmk > 0;
    final amountText = isMmk
        ? '${NumberFormat("#,###").format(biller.defaultAmountMmk)} MMK'
        : '${biller.defaultAmountThb.toStringAsFixed(2)} THB';

    final thbEquiv = isMmk ? (biller.defaultAmountMmk / thbToMmkRate) : biller.defaultAmountThb;
    final akdEquiv = isMmk
        ? (biller.defaultAmountMmk / akdToMmkRate)
        : ((biller.defaultAmountThb * thbToMmkRate) / akdToMmkRate);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Column(
          children: [
            // Clean White Header with Embedded Input Pill
            Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(
                  bottom: BorderSide(color: Color(0xFFE2E8F0), width: 0.8),
                ),
              ),
              padding: const EdgeInsets.fromLTRB(8, 8, 16, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A), size: 24),
                        onPressed: _closeBillerDetail,
                      ),
                      Expanded(
                        child: Text(
                          biller.name,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Input Pill with light background and border
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _accountCtrl,
                            style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: Color(0xFF1E293B)),
                            decoration: InputDecoration(
                              hintText: 'Enter ${biller.accountLabel}',
                              hintStyle: const TextStyle(fontSize: 14, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500),
                              border: InputBorder.none,
                              isDense: true,
                              contentPadding: const EdgeInsets.symmetric(vertical: 10),
                            ),
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            setState(() => _isBillFetched = true);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Bill statement fetched successfully'),
                                duration: Duration(seconds: 1),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.search_rounded, color: Colors.white, size: 19),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Scrollable Content
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Instruction Title with Info Icon
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.info_rounded, color: Color(0xFF64748B), size: 19),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'How to make bill payment for ${biller.name}',
                          style: const TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // 3-Step Instruction Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'STEP 1',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'Please enter ${biller.accountLabel} and click the search icon.',
                          style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.3),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'STEP 2',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 3),
                        const Text(
                          'Review outstanding bill statement and payment details.',
                          style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.3),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'STEP 3',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 3),
                        const Text(
                          'Click "Confirm & Pay Bill" to complete the payment.',
                          style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.3),
                        ),
                      ],
                    ),
                  ),

                  // Live Bill Enquiry Card (when fetched)
                  if (_isBillFetched) ...[
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x06000000),
                            blurRadius: 10,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Bill Statement (Oct 2026)',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEF3C7),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: const Text(
                                  'Due in 7 days',
                                  style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: Color(0xFFD97706)),
                                ),
                              ),
                            ],
                          ),
                          const Divider(height: 22, color: Color(0xFFE2E8F0)),
                          _buildDetailRow('Customer Name', 'User'),
                          _buildDetailRow(biller.accountLabel, _accountCtrl.text),
                          _buildDetailRow('Billing Cycle', '01/10/2026 - 31/10/2026'),
                          _buildDetailRow('Service Fee', '0.00 (Free)'),
                          const Divider(height: 22, color: Color(0xFFE2E8F0)),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Outstanding Bill',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                                  ),
                                  SizedBox(height: 2),
                                ],
                              ),
                              Text(
                                amountText,
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFFEA580C)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                isMmk ? '≈ ${thbEquiv.toStringAsFixed(2)} THB' : '≈ ${NumberFormat("#,###").format(biller.defaultAmountThb * thbToMmkRate)} MMK',
                                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                              ),
                              Text(
                                '≈ ${akdEquiv.toStringAsFixed(3)} AKD',
                                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: Color(0xFFC2410C)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Pay Button
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: () => _executePayment(context, appState, biller),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFF7A00),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                        ),
                        child: Text(
                          'Confirm & Pay Bill (${akdEquiv.toStringAsFixed(3)} AKD)',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
        ],
      ),
    );
  }

  // Logo rendering helper
  Widget _buildBillerLogo(BillItem b) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Center(
        child: Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: b.primaryColor.withValues(alpha: 0.12),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              b.initials,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                color: b.primaryColor,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
