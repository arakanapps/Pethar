import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

enum BillRegionTab { myanmar, thailand }

class BillItem {
  final String id;
  final String name;
  final String category;
  final String section; // 'Dtac Bills', 'True Bills', 'Utility' for Thailand
  final String defaultAccount;
  final String accountLabel;
  final double defaultAmountMmk;
  final double defaultAmountThb;
  final Color primaryColor;
  final String initials;
  final bool hasKyoPhyae;

  const BillItem({
    required this.id,
    required this.name,
    required this.category,
    this.section = '',
    required this.defaultAccount,
    required this.accountLabel,
    this.defaultAmountMmk = 0.0,
    this.defaultAmountThb = 0.0,
    required this.primaryColor,
    required this.initials,
    this.hasKyoPhyae = false,
  });
}

class BillPaymentScreen extends StatefulWidget {
  const BillPaymentScreen({Key? key}) : super(key: key);

  @override
  State<BillPaymentScreen> createState() => _BillPaymentScreenState();
}

class _BillPaymentScreenState extends State<BillPaymentScreen> {
  BillRegionTab _activeRegion = BillRegionTab.myanmar;
  String _searchQuery = '';
  bool _showPromoBanner = true;

  // Selected biller for detail / payment flow (Screenshot 3)
  BillItem? _selectedBiller;
  final TextEditingController _accountCtrl = TextEditingController();
  bool _isBillFetched = false;

  static const double thbToMmkRate = 115.0;
  static const double akdToMmkRate = 4500.0;

  // ── 9 Myanmar Billers (Screenshot 2) ──────────────────────────────────
  final List<BillItem> _myanmarBillers = const [
    BillItem(
      id: 'mm_aia',
      name: 'AIA Myanmar Life Insurance',
      category: 'Insurance',
      defaultAccount: 'POL-982140021',
      accountLabel: 'Policy Number',
      defaultAmountMmk: 45000.0,
      primaryColor: Color(0xFFD91624),
      initials: 'AIA',
      hasKyoPhyae: true,
    ),
    BillItem(
      id: 'mm_alliance',
      name: 'Alliance Microfinance',
      category: 'Microfinance & Loans',
      defaultAccount: 'ALN-501923',
      accountLabel: 'Customer / Loan ID',
      defaultAmountMmk: 30000.0,
      primaryColor: Color(0xFF0D9488),
      initials: 'ALN',
    ),
    BillItem(
      id: 'mm_atom',
      name: 'ATOM Broadband & Smart Device',
      category: 'Broadband & Fiber',
      defaultAccount: '09795220917',
      accountLabel: 'Account ID / Mobile No',
      defaultAmountMmk: 32000.0,
      primaryColor: Color(0xFF0284C7),
      initials: 'ATOM',
    ),
    BillItem(
      id: 'mm_aya',
      name: 'AYA SOMPO Insurance',
      category: 'General Insurance',
      defaultAccount: 'AYS-771209',
      accountLabel: 'Policy No / Vehicle Reg',
      defaultAmountMmk: 50000.0,
      primaryColor: Color(0xFFE11D48),
      initials: 'AYA',
    ),
    BillItem(
      id: 'mm_moee',
      name: 'Electricity Bill (Bago)',
      category: 'Utilities & Power',
      defaultAccount: 'BGO-E-10294',
      accountLabel: 'Meter Box / Consumer No',
      defaultAmountMmk: 65600.0,
      primaryColor: Color(0xFF1D4ED8),
      initials: 'MOEE',
    ),
    BillItem(
      id: 'mm_capital',
      name: 'Capital Taiyo Life Insurance',
      category: 'Life Insurance',
      defaultAccount: 'CTL-441029',
      accountLabel: 'Policy Number',
      defaultAmountMmk: 28000.0,
      primaryColor: Color(0xFF2563EB),
      initials: 'CTL',
    ),
    BillItem(
      id: 'mm_city',
      name: 'City Rewards',
      category: 'Retail & Supermarket',
      defaultAccount: 'CR-889102',
      accountLabel: 'Member ID / Phone',
      defaultAmountMmk: 15000.0,
      primaryColor: Color(0xFF9333EA),
      initials: 'CR',
    ),
    BillItem(
      id: 'mm_excise',
      name: 'Excise Revenue (NayPyiTaw)',
      category: 'Government Tax & Revenue',
      defaultAccount: 'NPT-EX-3041',
      accountLabel: 'Assessment / Tax ID',
      defaultAmountMmk: 20000.0,
      primaryColor: Color(0xFFDC2626),
      initials: 'EXC',
    ),
    BillItem(
      id: 'mm_hana',
      name: 'Hana Microfinance Limited',
      category: 'Microfinance & Loans',
      defaultAccount: 'HNA-19283',
      accountLabel: 'Contract / Account No',
      defaultAmountMmk: 25000.0,
      primaryColor: Color(0xFF059669),
      initials: 'HNA',
    ),
  ];

  // ── Thailand / Crossborder Utility Billers (Screenshot 1) ─────────────
  final List<BillItem> _thailandBillers = const [
    BillItem(
      id: 'th_dtac',
      name: 'Dtac (Postpaid)',
      category: 'Telecom',
      section: 'Dtac Bills',
      defaultAccount: '0812345678',
      accountLabel: 'Mobile / Account No',
      defaultAmountThb: 599.0,
      primaryColor: Color(0xFF0284C7),
      initials: 'DTAC',
    ),
    BillItem(
      id: 'th_true',
      name: 'TrueMove H/Online/Visions/True Group',
      category: 'Telecom & TV',
      section: 'True Bills',
      defaultAccount: '0958765432',
      accountLabel: 'Subscriber / Service No',
      defaultAmountThb: 799.0,
      primaryColor: Color(0xFFEF4444),
      initials: 'TRUE',
    ),
    BillItem(
      id: 'th_mea',
      name: 'Metropolitan Electricity',
      category: 'Electricity',
      section: 'Utility',
      defaultAccount: 'CA-100293847',
      accountLabel: 'MEA CA / Account No',
      defaultAmountThb: 1250.0,
      primaryColor: Color(0xFFEA580C),
      initials: 'MEA',
    ),
    BillItem(
      id: 'th_pea',
      name: 'Provincial Electricity',
      category: 'Electricity',
      section: 'Utility',
      defaultAccount: 'PEA-9920145',
      accountLabel: 'PEA CA No',
      defaultAmountThb: 980.0,
      primaryColor: Color(0xFF7C3AED),
      initials: 'PEA',
    ),
    BillItem(
      id: 'th_mwa',
      name: 'Metropolitan Water Authority',
      category: 'Waterworks',
      section: 'Utility',
      defaultAccount: 'MWA-4412098',
      accountLabel: 'Customer Code',
      defaultAmountThb: 240.0,
      primaryColor: Color(0xFF0284C7),
      initials: 'MWA',
    ),
    BillItem(
      id: 'th_pwa',
      name: 'Provincial Waterworks',
      category: 'Waterworks',
      section: 'Utility',
      defaultAccount: 'PWA-6651203',
      accountLabel: 'User ID',
      defaultAmountThb: 185.0,
      primaryColor: Color(0xFF0369A1),
      initials: 'PWA',
    ),
    BillItem(
      id: 'th_dlt',
      name: 'Motor Vehicle Tax',
      category: 'Transport & Tax',
      section: 'Utility',
      defaultAccount: '9กก-8821',
      accountLabel: 'License Plate / Chassis No',
      defaultAmountThb: 1500.0,
      primaryColor: Color(0xFF9333EA),
      initials: 'DLT',
    ),
    BillItem(
      id: 'th_rd',
      name: 'Tax (Revenue Dept.)',
      category: 'Government Tax',
      section: 'Utility',
      defaultAccount: 'TAX-1102938475',
      accountLabel: 'Taxpayer ID / Ref No',
      defaultAmountThb: 2000.0,
      primaryColor: Color(0xFFD97706),
      initials: 'RD',
    ),
    BillItem(
      id: 'th_easypass',
      name: 'Easy Pass',
      category: 'Toll & Expressway',
      section: 'Utility',
      defaultAccount: 'OBU-88192039',
      accountLabel: 'Smart Card No / OBU ID',
      defaultAmountThb: 500.0,
      primaryColor: Color(0xFF1D4ED8),
      initials: 'PASS',
    ),
  ];

  @override
  void dispose() {
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

    // If a biller is selected, show Screenshot 3 layout
    if (_selectedBiller != null) {
      return _buildBillerDetailScreen(context, appState, _selectedBiller!);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Column(
          children: [
            // Region Selector Pill Bar
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _activeRegion = BillRegionTab.myanmar),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _activeRegion == BillRegionTab.myanmar ? const Color(0xFF9E1B32) : Colors.transparent,
                            borderRadius: BorderRadius.circular(999),
                            boxShadow: _activeRegion == BillRegionTab.myanmar
                                ? [BoxShadow(color: const Color(0xFF9E1B32).withOpacity(0.3), blurRadius: 6, offset: const Offset(0, 2))]
                                : null,
                          ),
                          child: Text(
                            'Myanmar Bills',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: _activeRegion == BillRegionTab.myanmar ? Colors.white : const Color(0xFF64748B),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _activeRegion = BillRegionTab.thailand),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _activeRegion == BillRegionTab.thailand ? const Color(0xFF9E1B32) : Colors.transparent,
                            borderRadius: BorderRadius.circular(999),
                            boxShadow: _activeRegion == BillRegionTab.thailand
                                ? [BoxShadow(color: const Color(0xFF9E1B32).withOpacity(0.3), blurRadius: 6, offset: const Offset(0, 2))]
                                : null,
                          ),
                          child: Text(
                            'Crossborder (Thailand)',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: _activeRegion == BillRegionTab.thailand ? Colors.white : const Color(0xFF64748B),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Content Area depending on region
            Expanded(
              child: _activeRegion == BillRegionTab.myanmar
                  ? _buildMyanmarBillsView(context, appState)
                  : _buildThailandUtilityView(context, appState),
            ),
          ],
        ),
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // VIEW 1: MYANMAR BILLS (MATCHING SCREENSHOT 2)
  // ═════════════════════════════════════════════════════════════════════════
  Widget _buildMyanmarBillsView(BuildContext context, AppState appState) {
    return Column(
      children: [
        // Clean White Header
        Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(
              bottom: BorderSide(color: Color(0xFFE2E8F0), width: 0.8),
            ),
          ),
          padding: const EdgeInsets.fromLTRB(12, 12, 16, 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A), size: 24),
                    onPressed: () => appState.navigate(Screen.home),
                  ),
                  const Text(
                    'Bills Payment',
                    style: TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.3,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () => appState.navigate(Screen.history),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
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
            ],
          ),
        ),

        // List of Myanmar Billers
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            itemCount: _myanmarBillers.length,
            separatorBuilder: (ctx, i) => const SizedBox(height: 10),
            itemBuilder: (ctx, i) {
              final b = _myanmarBillers[i];
              return InkWell(
                onTap: () => _openBillerDetail(b),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.02),
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

                      // Name
                      Expanded(
                        child: Text(
                          b.name,
                          style: const TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF18181B),
                          ),
                        ),
                      ),

                      // Floating pill on AIA (Screenshot 2)
                      if (b.hasKyoPhyae) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0284C7),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.receipt_rounded, size: 12, color: Colors.white),
                              SizedBox(width: 3),
                              Text(
                                'Kyo Phyae >',
                                style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),
                      ],

                      const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 22),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // VIEW 2: THAILAND UTILITY BILLS (MATCHING SCREENSHOT 1)
  // ═════════════════════════════════════════════════════════════════════════
  Widget _buildThailandUtilityView(BuildContext context, AppState appState) {
    final filtered = _thailandBillers.where((b) {
      if (_searchQuery.isEmpty) return true;
      return b.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          b.section.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    // Group by sections: 'Dtac Bills', 'True Bills', 'Utility'
    final dtacItems = filtered.where((b) => b.section == 'Dtac Bills').toList();
    final trueItems = filtered.where((b) => b.section == 'True Bills').toList();
    final utilityItems = filtered.where((b) => b.section == 'Utility').toList();

    return Column(
      children: [
        // Clean White Header matching Screenshot 1
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF334155), size: 20),
                onPressed: () => appState.navigate(Screen.home),
              ),
              const Expanded(
                child: Text(
                  'Pay Utility Bills',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1E293B),
                  ),
                ),
              ),
              const SizedBox(width: 44), // Balances the back icon
            ],
          ),
        ),

        // Search Bar matching Screenshot 1
        Container(
          color: Colors.white,
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    onChanged: (v) => setState(() => _searchQuery = v),
                    decoration: const InputDecoration(
                      hintText: 'Search utility bill',
                      hintStyle: TextStyle(fontSize: 14, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                if (_searchQuery.isNotEmpty)
                  GestureDetector(
                    onTap: () => setState(() => _searchQuery = ''),
                    child: const Icon(Icons.close_rounded, size: 18, color: Color(0xFF64748B)),
                  ),
              ],
            ),
          ),
        ),

        // Scrollable content
        Expanded(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              // Promo / Charity Banner matching Screenshot 1
              if (_showPromoBanner && _searchQuery.isEmpty)
                Container(
                  margin: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFBEB),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: const BoxDecoration(
                          color: Color(0xFFEF4444),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.favorite_rounded, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'ร่วมสมทบทุน สภากาชาดไทย',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFFB45309)),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'ช่วยเหลือผู้ป่วยปลูกถ่ายอวัยวะและดวงตา',
                              style: TextStyle(fontSize: 11, color: Color(0xFF92400E)),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 18, color: Color(0xFF92400E)),
                        onPressed: () => setState(() => _showPromoBanner = false),
                      ),
                    ],
                  ),
                ),

              // Dtac Bills Section
              if (dtacItems.isNotEmpty) ...[
                _buildSectionHeader('Dtac Bills'),
                ...dtacItems.map((b) => _buildThailandBillTile(b)),
              ],

              // True Bills Section
              if (trueItems.isNotEmpty) ...[
                _buildSectionHeader('True Bills'),
                ...trueItems.map((b) => _buildThailandBillTile(b)),
              ],

              // Utility Section
              if (utilityItems.isNotEmpty) ...[
                _buildSectionHeader('Utility'),
                ...utilityItems.map((b) => _buildThailandBillTile(b)),
              ],

              const SizedBox(height: 24),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Container(
      width: double.infinity,
      color: const Color(0xFFEFEFEF),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 12.5,
          fontWeight: FontWeight.w700,
          color: Color(0xFF64748B),
        ),
      ),
    );
  }

  Widget _buildThailandBillTile(BillItem b) {
    return InkWell(
      onTap: () => _openBillerDetail(b),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
        ),
        child: Row(
          children: [
            _buildBillerLogo(b),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                b.name,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1E293B),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // VIEW 3: BILLER DETAIL & 3-STEP GUIDE (MATCHING SCREENSHOT 3)
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
                              color: Color(0xFF10B981), // Vibrant green matching Screenshot 3
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
                  // Instruction Title with Info Icon matching Screenshot 3
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

                  // 3-Step Instruction Card matching Screenshot 3
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'STEP 1',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                        SizedBox(height: 3),
                        Text(
                          'Please enter Customer Policy Number and click "Next".',
                          style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.3),
                        ),
                        SizedBox(height: 16),
                        Text(
                          'STEP 2',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                        SizedBox(height: 3),
                        Text(
                          'Choose bill you would like to pay.',
                          style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.3),
                        ),
                        SizedBox(height: 16),
                        Text(
                          'STEP 3',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                        SizedBox(height: 3),
                        Text(
                          'Click "Pay" and enter PIN to complete the payment.',
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
                          _buildDetailRow('Account / Policy', _accountCtrl.text),
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
                                '≈ ${thbEquiv.toStringAsFixed(2)} THB',
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
            color: b.primaryColor.withOpacity(0.12),
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
