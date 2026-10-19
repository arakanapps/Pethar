import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../widgets/support_and_kyc_modals.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({Key? key}) : super(key: key);

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  String _selectedCategory = 'all';
  final TextEditingController _searchCtrl = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final lang = appState.language;
    final isAk = lang == 'ak';

    final categories = [
      {
        'id': 'payments',
        'titleEn': 'PAYMENTS & TRANSFERS',
        'titleMm': 'ငွေလွှဲနှင့် ငွေပေးချေမှုစနစ်များ',
        'items': [
          {
            'screen': Screen.send,
            'nameEn': 'Send Money (Transfer)',
            'nameMm': 'ငွေလွှဲမည် (Transfer)',
            'descEn': 'Send instantly to phone, Account ID, or Arakan UID',
            'descMm': 'ဖုန်းနံပါတ် သို့မဟုတ် ရခိုင် UID သို့ ချက်ချင်းငွေလွှဲပါ',
            'icon': Icons.arrow_outward_rounded,
            'color': const Color(0xFF059669),
            'tag': isAk ? 'ချက်ချင်း' : 'Instant',
          },
          {
            'screen': Screen.receive,
            'nameEn': 'Receive Money & QR',
            'nameMm': 'ငွေလက်ခံမည် (Receive & QR)',
            'descEn': 'Generate personal QR code & payment address',
            'descMm': 'ကိုယ်ပိုင် QR ကုဒ် သို့မဟုတ် ငွေလက်ခံလိပ်စာ ထုတ်ယူပါ',
            'icon': Icons.qr_code_2_rounded,
            'color': const Color(0xFF2563EB),
            'tag': isAk ? 'QR ကုဒ်' : 'QR & Link',
          },
          {
            'screen': Screen.pay,
            'nameEn': 'Scan & Merchant Pay',
            'nameMm': 'စကင်ဖတ်၍ ငွေချေမည် (Scan & Pay)',
            'descEn': 'Scan store QR codes, bill invoices, or merchant counters',
            'descMm': 'ဆိုင်များနှင့် မိတ်ဆွေများ၏ QR ကုဒ်ကို စကင်ဖတ်၍ ငွေချေပါ',
            'icon': Icons.qr_code_scanner_rounded,
            'color': const Color(0xFFDC2626),
            'tag': isAk ? 'ဆိုင်ငွေချေ' : 'Merchant Pay',
          },
          {
            'screen': Screen.favourites,
            'nameEn': 'Saved Recipients',
            'nameMm': 'စိတ်ကြိုက် စာရင်းများ (Favourites)',
            'descEn': 'Fast 1-tap transfers to frequent friends & merchants',
            'descMm': 'ပုံမှန်ငွေလွှဲနေကျ စာရင်းများသို့ အမြန်ငွေလွှဲပါ',
            'icon': Icons.favorite_border_rounded,
            'color': const Color(0xFFE11D48),
            'tag': isAk ? 'အမြန်လွှဲ' : 'Quick Send',
          },
        ],
      },
      {
        'id': 'bills',
        'titleEn': 'AIRTIME & UTILITY BILLS',
        'titleMm': 'ဖုန်းဘေလ်ဖြည့်နှင့် အသုံးစရိတ်ပေးဆောင်မှု',
        'items': [
          {
            'screen': Screen.topup,
            'nameEn': 'Mobile Top-Up & Data',
            'nameMm': 'ဖုန်းဘေလ်နှင့် ဒေတာဖြည့်ရန်',
            'descEn': 'MPT, ATOM, Ooredoo, MyTel airtime and data packs',
            'descMm': 'MPT, ATOM, Ooredoo, MyTel ဖုန်းဘေလ်နှင့် ဒေတာဖြည့်ပါ',
            'icon': Icons.phone_android_rounded,
            'color': const Color(0xFF7C3AED),
            'tag': isAk ? 'လိုင်းအားလုံး' : 'All Telcos',
          },
          {
            'screen': Screen.billPayment,
            'nameEn': 'Utility & Bill Payments',
            'nameMm': 'ဘေလ်ပေးဆောင်ရန် (Bills)',
            'descEn': 'Electricity, water, fiber internet, and TV bills',
            'descMm': 'လျှပ်စစ်မီးဘေလ်၊ ရေဘေလ်နှင့် ဖိုင်ဘာအင်တာနက် ဘေလ်ဆောင်ပါ',
            'icon': Icons.receipt_long_rounded,
            'color': const Color(0xFFD97706),
            'tag': isAk ? 'အခမဲ့' : 'Zero Fee',
          },
        ],
      },
      {
        'id': 'banking',
        'titleEn': 'GLOBAL BANKING & CASH',
        'titleMm': 'နိုင်ငံတကာငွေလွှဲနှင့် ငွေသားဝန်ဆောင်မှု',
        'items': [
          {
            'screen': Screen.intl,
            'nameEn': 'Global Banking Remittance',
            'nameMm': 'နိုင်ငံတကာ ဘဏ်ငွေလွှဲစနစ်',
            'descEn': 'Payoneer, PayPal, Swift & direct international rails',
            'descMm': 'Payoneer၊ PayPal နှင့် တိုက်ရိုက်နိုင်ငံတကာငွေလွှဲ',
            'icon': Icons.public_rounded,
            'color': const Color(0xFF0284C7),
            'tag': isAk ? 'ကမ္ဘာလုံးဆိုင်ရာ' : 'Global',
          },
          {
            'screen': Screen.cashout,
            'nameEn': 'Agent Cash-Out',
            'nameMm': 'အေးဂျင့်မှ ငွေသားထုတ်ယူ',
            'descEn': 'Physical cash withdrawal at Sittwe, Mrauk-U, Kyaukpyu',
            'descMm': 'စစ်တွေ၊ မြောက်ဦး၊ ကျောက်ဖြူ ငွေသားထုတ်ယူရန်',
            'icon': Icons.storefront_rounded,
            'color': const Color(0xFF059669),
            'tag': isAk ? 'ငွေသားထုတ်' : 'Cash Out',
          },
        ],
      },
      {
        'id': 'crypto_pos',
        'titleEn': 'DIGITAL ASSETS & OFFLINE RAILS',
        'titleMm': 'ဒစ်ဂျစ်တယ်ဒင်္ဂါးနှင့် အော့ဖ်လိုင်း စနစ်များ',
        'items': [
          {
            'screen': Screen.crypto,
            'nameEn': 'Crypto Bridge (USDT / USDC)',
            'nameMm': 'Crypto ချိတ်ဆက်မှု (USDT / USDC)',
            'descEn': 'Direct 0-fee cryptocurrency deposit & withdrawal',
            'descMm': 'အခမဲ့ USDT / USDC တိုက်ရိုက်သွင်း/ထုတ်',
            'icon': Icons.currency_bitcoin_rounded,
            'color': const Color(0xFF9333EA),
            'tag': isAk ? 'ဒစ်ဂျစ်တယ်' : 'Crypto',
          },
          {
            'screen': Screen.offlinePayment,
            'nameEn': 'Offline NFC & Bluetooth Mesh',
            'nameMm': 'အော့ဖ်လိုင်း NFC / ဘလူးတုသ် ငွေပေးချေမှု',
            'descEn': 'Zero-internet tap-to-pay & mesh rails during blackout',
            'descMm': 'အင်တာနက်မရှိဘဲ NFC ဖြင့် ထိ၍ ငွေပေးချေပါ',
            'icon': Icons.contactless_rounded,
            'color': const Color(0xFF0D9488),
            'tag': isAk ? 'အော့ဖ်လိုင်း' : 'Offline',
          },
        ],
      },
    ];

    // Filter categories
    final filteredCategories = categories.where((cat) {
      if (_selectedCategory != 'all' && cat['id'] != _selectedCategory) {
        return false;
      }
      return true;
    }).map((cat) {
      final items = (cat['items'] as List<Map<String, dynamic>>).where((item) {
        if (_searchQuery.isEmpty) return true;
        final q = _searchQuery.toLowerCase();
        final nameEn = (item['nameEn'] as String).toLowerCase();
        final nameMm = (item['nameMm'] as String).toLowerCase();
        final descEn = (item['descEn'] as String).toLowerCase();
        return nameEn.contains(q) || nameMm.contains(q) || descEn.contains(q);
      }).toList();

      return {
        'id': cat['id'],
        'titleEn': cat['titleEn'],
        'titleMm': cat['titleMm'],
        'items': items,
      };
    }).where((cat) => (cat['items'] as List).isNotEmpty).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Bar
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 14),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isAk ? 'ဘဏ္ဍာရေး ဝန်ဆောင်မှုများ' : 'All Financial Services',
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                              color: Color(0xFF111827),
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Péthar Financial Hub',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFFD97706),
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFFDE68A)),
                        ),
                        child: Text(
                          isAk
                              ? '${categories.fold<int>(0, (acc, c) => acc + (c['items'] as List).length)} ဝန်ဆောင်မှု'
                              : '${categories.fold<int>(0, (acc, c) => acc + (c['items'] as List).length)} Services',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFB45309)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Search Field
                  Container(
                    height: 40,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: TextField(
                      controller: _searchCtrl,
                      onChanged: (val) => setState(() => _searchQuery = val.trim()),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        prefixIcon: const Icon(Icons.search, size: 20, color: Color(0xFF94A3B8)),
                        hintText: isAk ? 'ဝန်ဆောင်မှုများ ရှာဖွေပါ...' : 'Search services, transfer, bills...',
                        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                        contentPadding: const EdgeInsets.symmetric(vertical: 10),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear, size: 16, color: Color(0xFF94A3B8)),
                                onPressed: () {
                                  _searchCtrl.clear();
                                  setState(() => _searchQuery = '');
                                },
                              )
                            : null,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Category Filter Pills
            Container(
              height: 46,
              color: Colors.white,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                children: [
                  _buildCategoryChip('all', isAk ? 'အားလုံး' : 'All'),
                  _buildCategoryChip('payments', isAk ? 'ငွေလွှဲ' : 'Payments'),
                  _buildCategoryChip('bills', isAk ? 'ဘေလ်ဆောင်' : 'Bills & Top-Up'),
                  _buildCategoryChip('banking', isAk ? 'နိုင်ငံတကာ' : 'Banking'),
                  _buildCategoryChip('crypto_pos', isAk ? 'ဒစ်ဂျစ်တယ် / အော့ဖ်လိုင်း' : 'Crypto & Offline'),
                ],
              ),
            ),

            const Divider(height: 1, color: Color(0xFFE2E8F0)),

            // Content List
            Expanded(
              child: filteredCategories.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.search_off_rounded, size: 48, color: Colors.grey[400]),
                          const SizedBox(height: 10),
                          Text(
                            isAk ? 'ကိုက်ညီသော ဝန်ဆောင်မှု မရှိပါ' : 'No matching services found',
                            style: TextStyle(color: Colors.grey[600], fontSize: 14),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 14, 16, 110),
                      itemCount: filteredCategories.length,
                      itemBuilder: (context, catIdx) {
                        final cat = filteredCategories[catIdx];
                        final items = cat['items'] as List<Map<String, dynamic>>;

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: EdgeInsets.only(left: 4, bottom: 8, top: catIdx == 0 ? 0 : 16),
                              child: Text(
                                (isAk ? cat['titleMm'] : cat['titleEn']) as String,
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.6,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            ),
                            ...items.map((item) {
                              final name = (isAk ? item['nameMm'] : item['nameEn']) as String;
                              final desc = (isAk ? item['descMm'] : item['descEn']) as String;
                              final color = item['color'] as Color;
                              final tag = item['tag'] as String;

                              return Container(
                                margin: const EdgeInsets.only(bottom: 9),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.02),
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
                                      final screen = item['screen'] as Screen;
                                      if (!appState.isVerified) {
                                        showVerificationRequiredDialog(context, appState, name);
                                        return;
                                      }
                                      appState.navigate(screen);
                                    },
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 44,
                                            height: 44,
                                            decoration: BoxDecoration(
                                              color: color.withOpacity(0.12),
                                              borderRadius: BorderRadius.circular(13),
                                            ),
                                            child: Icon(
                                              item['icon'] as IconData,
                                              color: color,
                                              size: 22,
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  children: [
                                                    Expanded(
                                                      child: Text(
                                                        name,
                                                        style: const TextStyle(
                                                          fontWeight: FontWeight.w700,
                                                          fontSize: 13.5,
                                                          color: Color(0xFF1E293B),
                                                        ),
                                                      ),
                                                    ),
                                                    Container(
                                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                                      decoration: BoxDecoration(
                                                        color: color.withOpacity(0.09),
                                                        borderRadius: BorderRadius.circular(6),
                                                        border: Border.all(color: color.withOpacity(0.25)),
                                                      ),
                                                      child: Text(
                                                        tag,
                                                        style: TextStyle(
                                                          color: color,
                                                          fontSize: 10,
                                                          fontWeight: FontWeight.bold,
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                const SizedBox(height: 3),
                                                Text(
                                                  desc,
                                                  style: const TextStyle(
                                                    fontSize: 11,
                                                    color: Color(0xFF94A3B8),
                                                    height: 1.3,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          const Icon(
                                            Icons.chevron_right_rounded,
                                            color: Color(0xFF94A3B8),
                                            size: 19,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }),
                          ],
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String id, String label) {
    final isSelected = _selectedCategory == id;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: InkWell(
        onTap: () => setState(() => _selectedCategory = id),
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFD91624) : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? Colors.white : const Color(0xFF475569),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
