import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

enum TopupTab { phoneTopup, packages }

enum TopupHeaderStyle { crossborder, royalBlue }

class TopupPackageItem {
  final String id;
  final String name;
  final String category; // 'Data Roaming', 'Super Pack', 'Data'
  final int mmkPrice;
  final double thbPrice;
  final bool isHot;
  final String validity;
  final String quota;

  const TopupPackageItem({
    required this.id,
    required this.name,
    required this.category,
    required this.mmkPrice,
    required this.thbPrice,
    this.isHot = false,
    required this.validity,
    required this.quota,
  });
}

class TopupScreen extends StatefulWidget {
  const TopupScreen({Key? key}) : super(key: key);

  @override
  State<TopupScreen> createState() => _TopupScreenState();
}

class _TopupScreenState extends State<TopupScreen> {
  final TextEditingController _phoneCtrl = TextEditingController(text: '09795220917');
  TopupTab _activeTab = TopupTab.phoneTopup;
  TopupHeaderStyle _headerStyle = TopupHeaderStyle.crossborder;
  String _selectedCategory = 'All';

  // Selected Amount for Phone Topup (Default 500 MMK matching Screenshot 4)
  int? _selectedAmount = 500;

  // Selected Package
  TopupPackageItem? _selectedPackage;

  // Exchange rate configuration (Screenshot 2-5: 1 THB = 115 MMK)
  static const double thbToMmkRate = 115.0;
  static const double akdToMmkRate = 4500.0;

  // Available amounts in MMK matching Screenshots 1, 2, 4
  final List<int> _amounts = const [
    500,
    1000,
    2000,
    2500,
    3000,
    5000,
    6000,
    7500,
    10000,
    15000,
    20000,
    30000,
    50000,
  ];

  // Available packages matching Screenshots 1 & 5
  final List<TopupPackageItem> _allPackages = const [
    TopupPackageItem(
      id: 'pkg_1',
      name: 'Shal Suboo 195 MB (7Days)',
      category: 'Data',
      mmkPrice: 799,
      thbPrice: 6.95,
      validity: '7 Days',
      quota: '195 MB',
    ),
    TopupPackageItem(
      id: 'pkg_2',
      name: 'Shal Suboo 263 MB (10Days)',
      category: 'Data',
      mmkPrice: 999,
      thbPrice: 8.69,
      validity: '10 Days',
      quota: '263 MB',
    ),
    TopupPackageItem(
      id: 'pkg_3',
      name: 'Shal Suboo 421 MB (30Days)',
      category: 'Data',
      mmkPrice: 1599,
      thbPrice: 13.90,
      validity: '30 Days',
      quota: '421 MB',
    ),
    TopupPackageItem(
      id: 'pkg_4',
      name: 'Shal Suboo 526 MB (30Days)',
      category: 'Data',
      mmkPrice: 1999,
      thbPrice: 17.38,
      validity: '30 Days',
      quota: '526 MB',
    ),
    TopupPackageItem(
      id: 'pkg_5',
      name: 'Asia 9 Countries 1200MB (3 Days)',
      category: 'Data Roaming',
      mmkPrice: 14599,
      thbPrice: 126.95,
      isHot: true,
      validity: '3 Days',
      quota: '1200 MB',
    ),
    TopupPackageItem(
      id: 'pkg_6',
      name: 'Asia 5 Data Saver (2.5 GB) (5 Days)',
      category: 'Data Roaming',
      mmkPrice: 19997,
      thbPrice: 173.88,
      isHot: true,
      validity: '5 Days',
      quota: '2.5 GB',
    ),
    TopupPackageItem(
      id: 'pkg_7',
      name: 'Super Pack 1.5GB (30 Days)',
      category: 'Super Pack',
      mmkPrice: 3500,
      thbPrice: 30.43,
      validity: '30 Days',
      quota: '1.5 GB',
    ),
    TopupPackageItem(
      id: 'pkg_8',
      name: 'Super Pack 3.0GB (30 Days)',
      category: 'Super Pack',
      mmkPrice: 6500,
      thbPrice: 56.52,
      validity: '30 Days',
      quota: '3.0 GB',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _phoneCtrl.addListener(() {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _phoneCtrl.dispose();
    super.dispose();
  }

  // Operator Detection from prefix
  String _detectOperator(String phone) {
    final clean = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (clean.length < 3) return '';
    if (clean.startsWith('097')) return 'ATOM';
    if (clean.startsWith('092') ||
        clean.startsWith('094') ||
        clean.startsWith('095') ||
        clean.startsWith('098')) {
      return 'MPT';
    }
    if (clean.startsWith('096')) return 'mytel';
    if (clean.startsWith('099') || clean.startsWith('093')) return 'U9';
    return 'ATOM';
  }

  void _selectOperatorManual(String op) {
    if (op == 'ATOM') {
      _phoneCtrl.text = '09795220917';
    } else if (op == 'MPT') {
      _phoneCtrl.text = '09251998791';
    } else if (op == 'mytel') {
      _phoneCtrl.text = '09691234567';
    } else if (op == 'U9') {
      _phoneCtrl.text = '09971234567';
    }
  }

  double _getCalculatedThb() {
    if (_activeTab == TopupTab.phoneTopup) {
      if (_selectedAmount == null) return 0.0;
      return _selectedAmount! / thbToMmkRate;
    } else {
      if (_selectedPackage == null) return 0.0;
      return _selectedPackage!.thbPrice;
    }
  }

  double _getCalculatedAkd() {
    if (_activeTab == TopupTab.phoneTopup) {
      if (_selectedAmount == null) return 0.0;
      return _selectedAmount! / akdToMmkRate;
    } else {
      if (_selectedPackage == null) return 0.0;
      return _selectedPackage!.mmkPrice / akdToMmkRate;
    }
  }

  void _showContactsPicker(BuildContext context) {
    final sampleContacts = [
      {'name': 'User (Self)', 'phone': '09795220917', 'op': 'ATOM'},
      {'name': 'Ko Min Aung', 'phone': '09251998791', 'op': 'MPT'},
      {'name': 'Daw Hla Hla', 'phone': '09691234567', 'op': 'mytel'},
      {'name': 'Mg Zaw Myo', 'phone': '09971234567', 'op': 'U9'},
    ];

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      backgroundColor: Colors.white,
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Select Saved Contact',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 20),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ...sampleContacts.map((c) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(
                      backgroundColor: const Color(0xFFEFF6FF),
                      child: Text(
                        c['name']!.substring(0, 1),
                        style: const TextStyle(color: Color(0xFF1D4ED8), fontWeight: FontWeight.bold),
                      ),
                    ),
                    title: Text(c['name']!, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    subtitle: Text('${c['phone']} • ${c['op']}', style: const TextStyle(fontSize: 12, color: Color(0xFF71717A))),
                    onTap: () {
                      _phoneCtrl.text = c['phone']!;
                      Navigator.pop(ctx);
                    },
                  )),
            ],
          ),
        ),
      ),
    );
  }

  void _showReviewModal(BuildContext context, AppState appState) {
    final operatorName = _detectOperator(_phoneCtrl.text);
    final thbTotal = _getCalculatedThb();
    final akdTotal = _getCalculatedAkd();
    final isAk = appState.language == 'ak';

    final productTitle = _activeTab == TopupTab.phoneTopup
        ? '${NumberFormat("#,###").format(_selectedAmount ?? 0)} MMK Phone Topup'
        : (_selectedPackage?.name ?? 'Data Package');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFE4E4E7),
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
            const SizedBox(height: 18),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isAk ? 'ငွေဖြည့်အချက်အလက် စစ်ဆေးရန်' : 'Review Topup Details',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF18181B),
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(ctx),
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF4F4F5),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close_rounded, size: 18, color: Color(0xFF71717A)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Recipient & Operator Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        isAk ? 'ဖုန်းနံပါတ်' : 'Mobile Number',
                        style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                      ),
                      Text(
                        _phoneCtrl.text,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                      ),
                    ],
                  ),
                  const Divider(height: 22, color: Color(0xFFE2E8F0)),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        isAk ? 'အော်ပရေတာ' : 'Operator',
                        style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                      ),
                      Row(
                        children: [
                          _buildMiniOperatorBadge(operatorName),
                          const SizedBox(width: 6),
                          Text(
                            '$operatorName ${_activeTab == TopupTab.phoneTopup ? "Eload" : "DataPack"}',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Divider(height: 22, color: Color(0xFFE2E8F0)),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        isAk ? 'ပစ္စည်း / ပမာဏ' : 'Product / Plan',
                        style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                      ),
                      Flexible(
                        child: Text(
                          productTitle,
                          textAlign: TextAlign.end,
                          style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 22, color: Color(0xFFE2E8F0)),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        isAk ? 'လဲလှယ်နှုန်း' : 'Exchange Rate',
                        style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                      ),
                      const Text(
                        '1 THB = 115 MMK',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF2563EB)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Total Amount Box
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF7ED),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFED7AA)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isAk ? 'စုစုပေါင်း ပေးချေရမည့်ငွေ' : 'Total Amount to Pay',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFC2410C)),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${thbTotal.toStringAsFixed(2)} THB',
                        style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w900, color: Color(0xFFEA580C)),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: const Color(0xFFFDBA74)),
                    ),
                    child: Text(
                      '≈ ${akdTotal.toStringAsFixed(3)} AKD',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFFC2410C)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Confirm Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  _executeTopup(context, appState, operatorName, productTitle, thbTotal, akdTotal);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF7A00),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                ),
                child: Text(
                  isAk ? 'အတည်ပြုပြီး ငွေဖြည့်မည်' : 'Confirm & Pay',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _executeTopup(
    BuildContext context,
    AppState appState,
    String operatorName,
    String productTitle,
    double thbTotal,
    double akdTotal,
  ) {
    appState.processTopup(
      operatorName: operatorName,
      phone: _phoneCtrl.text,
      productTitle: productTitle,
      thbTotal: thbTotal,
      akdTotal: akdTotal,
    );

    // Show Success Dialog
    showDialog(
      context: context,
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
                'Top Up Successful!',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF18181B)),
              ),
              const SizedBox(height: 8),
              Text(
                'Successfully sent $productTitle to ${_phoneCtrl.text} ($operatorName).',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: Color(0xFF71717A), height: 1.4),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Charged:', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    Text(
                      '${thbTotal.toStringAsFixed(2)} THB (${akdTotal.toStringAsFixed(3)} AKD)',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    appState.goBack();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF7A00),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text('Back to Home', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMiniOperatorBadge(String op) {
    if (op == 'ATOM') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
        decoration: BoxDecoration(color: const Color(0xFFE0F2FE), borderRadius: BorderRadius.circular(4)),
        child: const Text('>> ATOM', style: TextStyle(color: Color(0xFF0284C7), fontWeight: FontWeight.w900, fontSize: 10)),
      );
    } else if (op == 'MPT') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
        decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(4)),
        child: const Text('MPT', style: TextStyle(color: Color(0xFF1E3A8A), fontWeight: FontWeight.w900, fontSize: 10)),
      );
    } else if (op == 'mytel') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
        decoration: BoxDecoration(color: const Color(0xFFFFEDD5), borderRadius: BorderRadius.circular(4)),
        child: const Text('mytel', style: TextStyle(color: Color(0xFFEA580C), fontWeight: FontWeight.w900, fontSize: 10)),
      );
    } else {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
        decoration: BoxDecoration(color: const Color(0xFFFEF9C3), borderRadius: BorderRadius.circular(4)),
        child: const Text('U9', style: TextStyle(color: Color(0xFFCA8A04), fontWeight: FontWeight.w900, fontSize: 10)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAk = appState.language == 'ak';
    final operatorName = _detectOperator(_phoneCtrl.text);
    final hasInput = _phoneCtrl.text.trim().length >= 4;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        top: _headerStyle != TopupHeaderStyle.royalBlue,
        child: Column(
          children: [
            // Header: Crossborder or Royal Blue
            if (_headerStyle == TopupHeaderStyle.royalBlue)
              _buildRoyalBlueHeader(context, appState, operatorName)
            else
              _buildCrossborderHeader(context, appState),

            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(18, 14, 18, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Mobile No Input Field (Screenshots 2-5)
                    Text(
                      isAk ? 'ဖုန်းနံပါတ်' : 'Mobile No',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF374151),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFD1D5DB)),
                      ),
                      child: TextField(
                        controller: _phoneCtrl,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF111827),
                          letterSpacing: 0.5,
                        ),
                        decoration: InputDecoration(
                          hintText: '09...',
                          hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontWeight: FontWeight.normal),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                          suffixIcon: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (_phoneCtrl.text.isNotEmpty)
                                GestureDetector(
                                  onTap: () => _phoneCtrl.clear(),
                                  child: const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 6),
                                    child: Icon(Icons.cancel_rounded, size: 18, color: Color(0xFF9CA3AF)),
                                  ),
                                ),
                              GestureDetector(
                                onTap: () => _showContactsPicker(context),
                                child: Container(
                                  margin: const EdgeInsets.only(right: 8),
                                  padding: const EdgeInsets.all(7),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF007AFF),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(Icons.contacts_rounded, size: 17, color: Colors.white),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Operator Detection Label (e.g. ATOM Eload / MPT Eload)
                    if (hasInput && operatorName.isNotEmpty) ...[
                      Row(
                        children: [
                          _buildOperatorSmallIcon(operatorName),
                          const SizedBox(width: 8),
                          Text(
                            '$operatorName ${_activeTab == TopupTab.phoneTopup ? "Eload" : "DataPack"}',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF111827),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                    ] else
                      const SizedBox(height: 4),

                    // Segmented Control: Phone Topup vs Packages (Screenshots 2-5)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _activeTab = TopupTab.phoneTopup),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 180),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: _activeTab == TopupTab.phoneTopup ? const Color(0xFFFF7A00) : Colors.transparent,
                                  borderRadius: BorderRadius.circular(999),
                                  boxShadow: _activeTab == TopupTab.phoneTopup
                                      ? [BoxShadow(color: const Color(0xFFFF7A00).withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 2))]
                                      : null,
                                ),
                                child: Text(
                                  isAk ? 'ဖုန်းဘေလ်ဖြည့်ရန်' : 'Phone Topup',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: _activeTab == TopupTab.phoneTopup ? Colors.white : const Color(0xFF6B7280),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _activeTab = TopupTab.packages),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 180),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: _activeTab == TopupTab.packages ? const Color(0xFFFF7A00) : Colors.transparent,
                                  borderRadius: BorderRadius.circular(999),
                                  boxShadow: _activeTab == TopupTab.packages
                                      ? [BoxShadow(color: const Color(0xFFFF7A00).withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 2))]
                                      : null,
                                ),
                                child: Text(
                                  isAk ? 'ပက်ကေ့ချ်များ' : 'Packages',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: _activeTab == TopupTab.packages ? Colors.white : const Color(0xFF6B7280),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // TAB 1: PHONE TOPUP
                    if (_activeTab == TopupTab.phoneTopup) ...[
                      Text(
                        isAk ? 'ပမာဏ ရွေးချယ်ပါ (MMK)' : 'Select Amount (MMK)',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF111827),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // 3-Column Amount Grid (Screenshots 1, 2, 4)
                      GridView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        shrinkWrap: true,
                        itemCount: _amounts.length,
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3,
                          childAspectRatio: 2.1,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                        ),
                        itemBuilder: (context, idx) {
                          final amt = _amounts[idx];
                          final isSelected = _selectedAmount == amt;
                          return GestureDetector(
                            onTap: () => setState(() => _selectedAmount = amt),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFFFF7A00) : Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isSelected ? const Color(0xFFFF7A00) : const Color(0xFFE5E7EB),
                                  width: 1.2,
                                ),
                                boxShadow: isSelected
                                    ? [
                                        BoxShadow(
                                          color: const Color(0xFFFF7A00).withValues(alpha: 0.25),
                                          blurRadius: 6,
                                          offset: const Offset(0, 2),
                                        ),
                                      ]
                                    : null,
                              ),
                              child: Text(
                                NumberFormat("#,###").format(amt),
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: isSelected ? Colors.white : const Color(0xFF374151),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ] else ...[
                      // TAB 2: PACKAGES (Screenshots 1 & 5)
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        child: Row(
                          children: [
                            _buildCategoryPill('All', Icons.apps_rounded),
                            _buildCategoryPill('Data Roaming', Icons.wifi_rounded),
                            _buildCategoryPill('Super Pack', Icons.bolt_rounded),
                            _buildCategoryPill('Data', Icons.language_rounded),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        isAk ? 'ပက်ကေ့ချ် ရွေးချယ်ပါ (MMK)' : 'Select Package (MMK)',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF111827),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Package List (Screenshot 5 & 1)
                      ..._allPackages
                          .where((p) => _selectedCategory == 'All' || p.category == _selectedCategory)
                          .map(_buildPackageCard),
                    ],

                    const SizedBox(height: 14),

                    // Exchange Rate Banner (Screenshots 2-5)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F2FF),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Exchange rate: 1 THB = 115 MMK',
                        style: TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF1E3A8A),
                        ),
                      ),
                    ),

                    // "Your total is 4.35 THB for 500 MMK" dynamic subtext (Screenshot 4)
                    if (_activeTab == TopupTab.phoneTopup && _selectedAmount != null) ...[
                      const SizedBox(height: 12),
                      Center(
                        child: RichText(
                          text: TextSpan(
                            style: const TextStyle(fontSize: 14, color: Color(0xFF111827)),
                            children: [
                              const TextSpan(text: 'Your total is '),
                              TextSpan(
                                text: '${_getCalculatedThb().toStringAsFixed(2)} THB',
                                style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFFEA580C)),
                              ),
                              TextSpan(
                                text: ' for ${NumberFormat("#,###").format(_selectedAmount)} MMK',
                                style: const TextStyle(fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ] else if (_activeTab == TopupTab.packages && _selectedPackage != null) ...[
                      const SizedBox(height: 12),
                      Center(
                        child: RichText(
                          text: TextSpan(
                            style: const TextStyle(fontSize: 14, color: Color(0xFF111827)),
                            children: [
                              const TextSpan(text: 'Selected package: '),
                              TextSpan(
                                text: '${_selectedPackage!.thbPrice.toStringAsFixed(2)} THB',
                                style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFFEA580C)),
                              ),
                              TextSpan(
                                text: ' (${NumberFormat("#,###").format(_selectedPackage!.mmkPrice)} MMK)',
                                style: const TextStyle(fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],

                    const SizedBox(height: 24),

                    // Review Topup Details Button (Orange, Screenshots 2, 3, 4)
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: hasInput
                            ? () => _showReviewModal(context, appState)
                            : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFF7A00),
                          foregroundColor: Colors.white,
                          disabledBackgroundColor: const Color(0xFFCBD5E1),
                          disabledForegroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                        ),
                        child: Text(
                          isAk ? 'အချက်အလက် စစ်ဆေးမည်' : 'Review Topup Details',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ),

                    const SizedBox(height: 28),

                    // Operator Logos Row (ATOM, MPT, mytel, U9) matching Screenshots 2, 3, 4
                    Row(
                      children: [
                        Expanded(child: _buildOperatorCard('ATOM', operatorName == 'ATOM')),
                        const SizedBox(width: 8),
                        Expanded(child: _buildOperatorCard('MPT', operatorName == 'MPT')),
                        const SizedBox(width: 8),
                        Expanded(child: _buildOperatorCard('mytel', operatorName == 'mytel')),
                        const SizedBox(width: 8),
                        Expanded(child: _buildOperatorCard('U9', operatorName == 'U9')),
                      ],
                    ),

                    const SizedBox(height: 32),

                    // Copyright Footer (Screenshots 2-5)
                    Center(
                      child: Text(
                        'Copyright © TrueMoney / Péthar Myanmar 2026',
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey.shade400,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Crossborder Header (Screenshots 2, 3, 4, 5)
  Widget _buildCrossborderHeader(BuildContext context, AppState appState) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9), width: 1)),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => appState.goBack(),
            child: const Padding(
              padding: EdgeInsets.all(4),
              child: Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: Color(0xFF1E293B)),
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'Péthar Myanmar | Crossborder',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15.5,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
          ),
          // Style Toggle to Switch to Royal Blue View (Screenshot 1)
          GestureDetector(
            onTap: () {
              setState(() {
                _headerStyle = _headerStyle == TopupHeaderStyle.crossborder
                    ? TopupHeaderStyle.royalBlue
                    : TopupHeaderStyle.crossborder;
              });
            },
            child: Container(
              padding: const EdgeInsets.all(5),
              decoration: const BoxDecoration(
                color: Color(0xFFEFF6FF),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.style_rounded, size: 17, color: Color(0xFF2563EB)),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => appState.navigate(Screen.home),
            child: const Padding(
              padding: EdgeInsets.all(4),
              child: Icon(Icons.close_rounded, size: 22, color: Color(0xFF64748B)),
            ),
          ),
        ],
      ),
    );
  }

  // Clean White Header
  Widget _buildRoyalBlueHeader(BuildContext context, AppState appState, String operatorName) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: Color(0xFFE2E8F0), width: 0.8),
        ),
      ),
      padding: EdgeInsets.fromLTRB(16, MediaQuery.of(context).padding.top + 8, 16, 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  GestureDetector(
                    onTap: () => appState.goBack(),
                    child: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 18),
                  ),
                  const SizedBox(width: 14),
                  const Text(
                    'Top Up',
                    style: TextStyle(color: Color(0xFF0F172A), fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _headerStyle = TopupHeaderStyle.crossborder;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.swap_horiz_rounded, size: 14, color: Color(0xFF0F172A)),
                          SizedBox(width: 4),
                          Text('Crossborder', style: TextStyle(color: Color(0xFF0F172A), fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.more_horiz_rounded, color: Color(0xFF0F172A), size: 18),
                        SizedBox(width: 6),
                        Icon(Icons.lens_blur_rounded, color: Color(0xFF0F172A), size: 18),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(
            operatorName.toUpperCase(),
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Color(0xFF64748B),
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _phoneCtrl.text,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                  letterSpacing: 0.5,
                ),
              ),
              GestureDetector(
                onTap: () => _showContactsPicker(context),
                child: Container(
                  padding: const EdgeInsets.all(7),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.contacts_rounded, size: 18, color: Color(0xFF0F172A)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPackageCard(TopupPackageItem pkg) {
    final isSelected = _selectedPackage?.id == pkg.id;
    return GestureDetector(
      onTap: () => setState(() => _selectedPackage = pkg),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFFFF7A00) : const Color(0xFFE5E7EB),
            width: isSelected ? 1.8 : 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: isSelected
                  ? const Color(0xFFFF7A00).withValues(alpha: 0.12)
                  : Colors.black.withValues(alpha: 0.02),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          pkg.name,
                          style: const TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF111827),
                          ),
                        ),
                      ),
                      if (pkg.isHot) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEF4444),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'HOT',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Validity: ${pkg.validity} • Quota: ${pkg.quota}',
                    style: const TextStyle(fontSize: 11.5, color: Color(0xFF6B7280)),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${NumberFormat("#,###").format(pkg.mmkPrice)} MMK',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF111827),
                  ),
                ),
                const SizedBox(height: 5),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: const Color(0xFFF97316)),
                  ),
                  child: Text(
                    '${pkg.thbPrice.toStringAsFixed(2)} THB',
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFFEA580C),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryPill(String title, IconData icon) {
    final isSelected = _selectedCategory == title;
    return GestureDetector(
      onTap: () => setState(() => _selectedCategory = title),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0052CC) : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: isSelected ? const Color(0xFF0052CC) : const Color(0xFFE5E7EB),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: isSelected ? Colors.white : const Color(0xFF6B7280)),
            const SizedBox(width: 6),
            Text(
              title,
              style: TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
                color: isSelected ? Colors.white : const Color(0xFF374151),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOperatorSmallIcon(String op) {
    if (op == 'ATOM') {
      return Container(
        width: 18,
        height: 18,
        decoration: const BoxDecoration(
          color: Color(0xFF00A3E0),
          shape: BoxShape.circle,
        ),
        child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 12),
      );
    } else if (op == 'MPT') {
      return Container(
        width: 18,
        height: 18,
        decoration: const BoxDecoration(
          color: Color(0xFF003399),
          shape: BoxShape.circle,
        ),
        child: const Center(
          child: Text('M', style: TextStyle(color: Color(0xFFFDB913), fontWeight: FontWeight.w900, fontSize: 10)),
        ),
      );
    } else if (op == 'mytel') {
      return Container(
        width: 18,
        height: 18,
        decoration: const BoxDecoration(
          color: Color(0xFFFF6600),
          shape: BoxShape.circle,
        ),
        child: const Icon(Icons.all_inclusive_rounded, color: Colors.white, size: 11),
      );
    } else {
      return Container(
        width: 18,
        height: 18,
        decoration: const BoxDecoration(
          color: Color(0xFFE5A823),
          shape: BoxShape.circle,
        ),
        child: const Center(
          child: Text('9', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 10)),
        ),
      );
    }
  }

  Widget _buildOperatorCard(String op, bool isSelected) {
    Color brandColor = const Color(0xFF00A3E0);
    Widget logoWidget;

    if (op == 'ATOM') {
      brandColor = const Color(0xFF00A3E0);
      logoWidget = const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.fast_forward_rounded, color: Color(0xFF00A3E0), size: 16),
          SizedBox(width: 3),
          Text('ATOM', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF00A3E0))),
        ],
      );
    } else if (op == 'MPT') {
      brandColor = const Color(0xFF003399);
      logoWidget = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: const Color(0xFFFDB913),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFF003399), width: 1.5),
            ),
          ),
          const SizedBox(width: 3),
          const Text('MPT', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF003399))),
        ],
      );
    } else if (op == 'mytel') {
      brandColor = const Color(0xFFFF6600);
      logoWidget = const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.all_inclusive_rounded, color: Color(0xFFFF6600), size: 14),
          SizedBox(width: 3),
          Text('mytel', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFFFF6600))),
        ],
      );
    } else {
      brandColor = const Color(0xFFE5A823);
      logoWidget = const Text(
        'U9',
        style: TextStyle(
          fontWeight: FontWeight.w900,
          fontSize: 16,
          color: Color(0xFFD97706),
          letterSpacing: 1,
        ),
      );
    }

    return GestureDetector(
      onTap: () => _selectOperatorManual(op),
      child: Container(
        height: 52,
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? brandColor : const Color(0xFFE5E7EB),
            width: isSelected ? 1.6 : 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: isSelected ? brandColor.withValues(alpha: 0.12) : Colors.black.withValues(alpha: 0.02),
              blurRadius: 4,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: logoWidget,
      ),
    );
  }
}
