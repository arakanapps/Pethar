import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class HistoryItem {
  final String id;
  final String title;
  final String time;
  final double amount; // negative for outflow, positive for inflow
  final String type; // 'bill' or 'transfer'
  final String? category;
  final String? refNo;

  const HistoryItem({
    required this.id,
    required this.title,
    required this.time,
    required this.amount,
    required this.type,
    this.category,
    this.refNo,
  });

  bool get isInflow => amount > 0;
}

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({Key? key}) : super(key: key);

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  int _activeTab = 0; // 0: All, 1: Inflow, 2: Outflow
  String _selectedMonth = 'October – 2026';
  String _selectedCategoryFilter = 'all'; // 'all', 'transfer', 'bill'

  // Standard transactions matching the screenshot reference
  final List<HistoryItem> _items = const [
    HistoryItem(
      id: 'tx_01',
      title: 'Bills: YESC',
      time: '14/10 19:11:38',
      amount: -65600.00,
      type: 'bill',
      category: 'Electricity Bill',
      refNo: '202610141911388829104',
    ),
    HistoryItem(
      id: 'tx_02',
      title: 'Bills: ATOM Myanmar Limited',
      time: '14/10 19:10:49',
      amount: -32000.00,
      type: 'bill',
      category: 'Telecom & Internet',
      refNo: '202610141910497120349',
    ),
    HistoryItem(
      id: 'tx_03',
      title: 'Transfer From Daw Than Nwe',
      time: '14/10 19:09:11',
      amount: 200000.00,
      type: 'transfer',
      category: 'P2P Receive',
      refNo: '202610141909115598124',
    ),
    HistoryItem(
      id: 'tx_04',
      title: 'Transfer To Hsu Hnin Wutt Yee',
      time: '10/10 17:44:46',
      amount: -100000.00,
      type: 'transfer',
      category: 'P2P Transfer',
      refNo: '202610101744469901452',
    ),
    HistoryItem(
      id: 'tx_05',
      title: 'Transfer To HNIN THANDAR PHYO',
      time: '03/10 12:38:14',
      amount: -900000.00,
      type: 'transfer',
      category: 'P2P Transfer',
      refNo: '202610031238148819203',
    ),
    HistoryItem(
      id: 'tx_06',
      title: 'Transfer From Daw Than Nwe',
      time: '02/10 14:39:47',
      amount: 1000000.00,
      type: 'transfer',
      category: 'P2P Receive',
      refNo: '202610021439474412908',
    ),
    HistoryItem(
      id: 'tx_07',
      title: 'Transfer To Myo Min Paing',
      time: '01/10 09:37:13',
      amount: -100000.00,
      type: 'transfer',
      category: 'P2P Transfer',
      refNo: '202610010937133378901',
    ),
  ];

  String _formatAmount(double amount) {
    final formatter = NumberFormat("#,##0.00", "en_US");
    if (amount > 0) {
      return '+${formatter.format(amount)}';
    } else {
      return '–${formatter.format(amount.abs())}';
    }
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Filter Transactions',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 16),
              _buildFilterOption('all', 'All Categories', Icons.list_alt_rounded),
              _buildFilterOption('transfer', 'Transfers (P2P)', Icons.sync_alt_rounded),
              _buildFilterOption('bill', 'Utility & Bills', Icons.receipt_long_rounded),
            ],
          ),
        );
      },
    );
  }

  Widget _buildFilterOption(String key, String title, IconData icon) {
    final isSelected = _selectedCategoryFilter == key;
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE8F2FE) : const Color(0xFFF1F5F9),
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          size: 20,
          color: isSelected ? const Color(0xFF0B57CF) : const Color(0xFF64748B),
        ),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 15,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          color: isSelected ? const Color(0xFF0B57CF) : const Color(0xFF1E293B),
        ),
      ),
      trailing: isSelected
          ? const Icon(Icons.check_circle_rounded, color: Color(0xFF0B57CF), size: 22)
          : null,
      onTap: () {
        setState(() => _selectedCategoryFilter = key);
        Navigator.pop(context);
      },
    );
  }

  void _showMonthPicker() {
    final months = [
      'October – 2026',
      'September – 2026',
      'August – 2026',
      'July – 2026',
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Select Statement Month',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 16),
              ...months.map((m) {
                final isSelected = _selectedMonth == m;
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.calendar_today_rounded, size: 20, color: Color(0xFF64748B)),
                  title: Text(
                    m,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      color: isSelected ? const Color(0xFF0B57CF) : const Color(0xFF1E293B),
                    ),
                  ),
                  trailing: isSelected
                      ? const Icon(Icons.check_circle_rounded, color: Color(0xFF0B57CF), size: 22)
                      : null,
                  onTap: () {
                    setState(() => _selectedMonth = m);
                    Navigator.pop(context);
                  },
                );
              }),
            ],
          ),
        );
      },
    );
  }

  void _exportStatement() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Exported e-Statement for $_selectedMonth (PDF)',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF0B57CF),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showTransactionDetail(HistoryItem item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Status Icon
              Container(
                width: 56,
                height: 56,
                decoration: const BoxDecoration(
                  color: Color(0xFFE0F2FE),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF0B57CF),
                  size: 32,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Transaction Successful',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                '${_formatAmount(item.amount)} Ks',
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 24),

              // Detail List
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
                ),
                child: Column(
                  children: [
                    _buildSlipRow('Recipient / Source', item.title),
                    const Divider(height: 20, color: Color(0xFFE2E8F0)),
                    _buildSlipRow('Category', item.category ?? (item.type == 'bill' ? 'Bill Payment' : 'P2P Transfer')),
                    const Divider(height: 20, color: Color(0xFFE2E8F0)),
                    _buildSlipRow('Date & Time', item.time),
                    const Divider(height: 20, color: Color(0xFFE2E8F0)),
                    _buildSlipRow('Reference No.', item.refNo ?? '202610141911388829', canCopy: true),
                    const Divider(height: 20, color: Color(0xFFE2E8F0)),
                    _buildSlipRow('Fee', '0.00 Ks'),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Close / Share
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0B57CF),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Close',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSlipRow(String label, String value, {bool canCopy = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            color: Color(0xFF64748B),
            fontWeight: FontWeight.w500,
          ),
        ),
        Row(
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Color(0xFF0F172A),
              ),
            ),
            if (canCopy) ...[
              const SizedBox(width: 6),
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: value));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Reference number copied'),
                      duration: Duration(seconds: 1),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
                child: const Icon(Icons.copy_rounded, size: 14, color: Color(0xFF0B57CF)),
              ),
            ],
          ],
        ),
      ],
    );
  }

  // Custom Receipt Icon matching screenshot
  Widget _buildReceiptIcon() {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: const Color(0xFFF0F9FF),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFBAE6FD).withValues(alpha: 0.8), width: 1),
      ),
      child: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            const Icon(
              Icons.receipt_long_rounded,
              size: 24,
              color: Color(0xFF0284C7),
            ),
            Positioned(
              bottom: 6,
              right: 6,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF0284C7),
                  borderRadius: BorderRadius.circular(2),
                ),
                child: const Text(
                  '\$',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 7,
                    fontWeight: FontWeight.w900,
                    height: 1.0,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Custom Transfer Icon matching screenshot: [ < ($) > ]
  Widget _buildTransferIcon() {
    return Container(
      width: 40,
      height: 40,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        color: Color(0xFF0B57CF),
      ),
      child: Center(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.arrow_left_rounded, color: Colors.white, size: 12),
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 1.1),
              ),
              alignment: Alignment.center,
              child: const Text(
                '\$',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 7,
                  fontWeight: FontWeight.w900,
                  height: 1.0,
                ),
              ),
            ),
            const Icon(Icons.arrow_right_rounded, color: Colors.white, size: 12),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);

    // Calculate Inflow & Outflow for summary
    double totalInflow = 1300000.00;
    double totalOutflow = 1197600.00;

    // Filter list
    final filtered = _items.where((item) {
      if (_activeTab == 1 && !item.isInflow) return false;
      if (_activeTab == 2 && item.isInflow) return false;
      if (_selectedCategoryFilter != 'all' && item.type != _selectedCategoryFilter) return false;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B57CF), // Deep primary blue matching reference
        elevation: 0,
        centerTitle: true,
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Color(0xFF0B57CF),
          statusBarIconBrightness: Brightness.light,
          statusBarBrightness: Brightness.dark,
        ),
        leading: IconButton(
          icon: const Icon(
            Icons.chevron_left_rounded,
            color: Colors.white,
            size: 28,
          ),
          onPressed: () => appState.goBack(),
        ),
        title: const Text(
          'History',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
            letterSpacing: 0.1,
          ),
        ),
      ),
      body: Column(
        children: [
          // ── SUBHEADER: TABS & ACTION BUTTONS ───────────────────────────────
          Container(
            height: 52,
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                bottom: BorderSide(color: Color(0xFFE2E8F0), width: 0.8),
              ),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                // Tabs: All | Inflow | Outflow
                _buildSubTab(0, 'All'),
                const SizedBox(width: 24),
                _buildSubTab(1, 'Inflow'),
                const SizedBox(width: 24),
                _buildSubTab(2, 'Outflow'),

                const Spacer(),

                // Filter Funnel
                _buildActionButton(
                  icon: Icons.filter_alt_outlined,
                  onTap: _showFilterSheet,
                ),
                const SizedBox(width: 10),

                // Calendar
                _buildActionButton(
                  icon: Icons.calendar_today_outlined,
                  onTap: _showMonthPicker,
                ),
                const SizedBox(width: 10),

                // Download
                _buildActionButton(
                  icon: Icons.file_download_outlined,
                  onTap: _exportStatement,
                ),
              ],
            ),
          ),

          // ── SCROLLABLE BODY ────────────────────────────────────────────────
          Expanded(
            child: ListView(
              padding: const EdgeInsets.only(bottom: 40),
              children: [
                // MONTHLY SUMMARY BANNER CARD
                Container(
                  margin: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFE8F1FC), Color(0xFFF1F6FE)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0B57CF).withValues(alpha: 0.04),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      // Subtle watermark circle in top right
                      Positioned(
                        right: -30,
                        top: -30,
                        child: Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFF0B57CF).withValues(alpha: 0.05),
                          ),
                        ),
                      ),

                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _selectedMonth,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF0F172A),
                              letterSpacing: -0.2,
                            ),
                          ),
                          const SizedBox(height: 14),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              // Inflow
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Inflow',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF64748B),
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${NumberFormat("#,##0.00", "en_US").format(totalInflow)} (Ks)',
                                    style: const TextStyle(
                                      fontSize: 15.5,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF0F172A),
                                      letterSpacing: -0.2,
                                    ),
                                  ),
                                ],
                              ),

                              // Outflow
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  const Text(
                                    'Outflow',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF64748B),
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '–${NumberFormat("#,##0.00", "en_US").format(totalOutflow)} (Ks)',
                                    style: const TextStyle(
                                      fontSize: 15.5,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF0F172A),
                                      letterSpacing: -0.2,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // TRANSACTION LIST CARD
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.02),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      for (int i = 0; i < filtered.length; i++) ...[
                        _buildTransactionRow(filtered[i]),
                        if (i < filtered.length - 1)
                          const Divider(
                            height: 1,
                            thickness: 1,
                            color: Color(0xFFF1F5F9),
                            indent: 64,
                            endIndent: 16,
                          ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubTab(int index, String label) {
    final isActive = _activeTab == index;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => setState(() => _activeTab = index),
      child: SizedBox(
        height: 52,
        child: Stack(
          alignment: Alignment.bottomCenter,
          children: [
            Center(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isActive ? const Color(0xFF0F172A) : const Color(0xFF64748B),
                ),
              ),
            ),
            if (isActive)
              Container(
                height: 3,
                width: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF0B57CF),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Container(
        width: 34,
        height: 34,
        decoration: const BoxDecoration(
          color: Color(0xFFF1F5F9),
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          size: 18,
          color: const Color(0xFF64748B),
        ),
      ),
    );
  }

  Widget _buildTransactionRow(HistoryItem item) {
    return InkWell(
      onTap: () => _showTransactionDetail(item),
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        child: Row(
          children: [
            // Left Category Icon
            item.type == 'bill' ? _buildReceiptIcon() : _buildTransferIcon(),
            const SizedBox(width: 14),

            // Middle: Title and Date/Time
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1E293B),
                      height: 1.25,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    item.time,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF94A3B8),
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),

            // Right: Amount
            Text(
              _formatAmount(item.amount),
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Color(0xFF0F172A),
                letterSpacing: -0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
