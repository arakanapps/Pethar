import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import '../models/data.dart';
import '../widgets/arakan_emblem.dart';

class DesktopPortalScreen extends StatefulWidget {
  const DesktopPortalScreen({Key? key}) : super(key: key);

  @override
  State<DesktopPortalScreen> createState() => _DesktopPortalScreenState();
}

class _DesktopPortalScreenState extends State<DesktopPortalScreen> {
  String _selectedCategory = 'all';
  String _searchQuery = '';
  final TextEditingController _quickAmtCtrl = TextEditingController(text: '150');
  String _selectedContactId = '';
  bool _quickSentSuccess = false;

  final List<Map<String, dynamic>> _defaultFxRates = [
    {'pair': 'AKD / USD', 'rate': '1.00', 'change': '+0.00%', 'up': true},
    {'pair': 'AKD / USDT', 'rate': '1.00', 'change': '+0.00%', 'up': true},
    {'pair': 'AKD / THB', 'rate': '35.80', 'change': '+0.42%', 'up': true},
    {'pair': 'AKD / MYR', 'rate': '4.72', 'change': '-0.15%', 'up': false},
    {'pair': 'AKD / SGD', 'rate': '1.34', 'change': '+0.08%', 'up': true},
    {'pair': 'AKD / EUR', 'rate': '0.92', 'change': '-0.21%', 'up': false},
    {'pair': 'BTC / AKD', 'rate': '64,500', 'change': '+2.85%', 'up': true},
  ];

  @override
  void dispose() {
    _quickAmtCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    final filteredTxns = appState.txList.where((tx) {
      final matchesCat = _selectedCategory == 'all' || tx.category == _selectedCategory;
      final q = _searchQuery.toLowerCase();
      final matchesSearch = tx.title.toLowerCase().contains(q) ||
          tx.titleMm.toLowerCase().contains(q) ||
          tx.counterparty.toLowerCase().contains(q);
      return matchesCat && matchesSearch;
    }).toList();

    return Scaffold(
      backgroundColor: isDark ? obsidian : paper,
      body: Column(
        children: [
          // ── Top Ticker Bar ───────────────────────────────────────────────
          Container(
            height: 38,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            color: const Color(0xFF121A28),
            child: Row(
              children: [
                const Icon(Icons.trending_up, color: gold, size: 14),
                const SizedBox(width: 6),
                Text(
                  lang == 'ak' ? 'တရားဝင်ငွေလဲနှုန်း' : 'Arakan FX Ticker:',
                  style: const TextStyle(color: gold, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Builder(
                    builder: (ctx) {
                      final fxList = appState.fxRatesList.isNotEmpty ? appState.fxRatesList : _defaultFxRates;
                      return ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: fxList.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 16),
                        itemBuilder: (ctx, i) {
                          final item = fxList[i];
                          final isUp = item['up'] as bool? ?? true;
                          return Center(
                            child: Row(
                              children: [
                                Text(
                                  item['pair'] as String? ?? '',
                                  style: const TextStyle(color: Colors.grey, fontSize: 11, fontFamily: 'monospace'),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  item['rate']?.toString() ?? '',
                                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  item['change'] as String? ?? '+0.00%',
                                  style: TextStyle(
                                    color: isUp ? emeraldSuccess : Colors.redAccent,
                                    fontSize: 10,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // ── Desktop App Bar ──────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: isDark ? surfaceDark : Colors.white,
              border: Border(bottom: BorderSide(color: isDark ? slateBorder : Colors.grey[200]!)),
            ),
            child: Row(
              children: [
                const ArakanEmblem(size: 32),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          TranslationStrings.tr('appName', lang),
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: crimson.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: crimson.withOpacity(0.4)),
                          ),
                          child: const Text(
                            'DESKTOP CONSOLE',
                            style: TextStyle(color: crimson, fontSize: 8, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    Text(
                      TranslationStrings.tr('appSubtitle', lang),
                      style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                    ),
                  ],
                ),
                const Spacer(),
                // Platform Switcher Button in Header
                OutlinedButton.icon(
                  onPressed: () => appState.navigate(Screen.home),
                  icon: const Icon(Icons.phone_iphone, size: 14, color: gold),
                  label: const Text('Mobile View', style: TextStyle(fontSize: 11, color: gold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: gold),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(width: 8),
                OutlinedButton.icon(
                  onPressed: () => appState.navigate(Screen.pos),
                  icon: const Icon(Icons.point_of_sale, size: 14, color: Colors.orangeAccent),
                  label: const Text('POS Terminal', style: TextStyle(fontSize: 11, color: Colors.orangeAccent)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.orangeAccent),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(width: 12),
                // Language Toggle
                TextButton(
                  onPressed: () => appState.setLanguage(lang == 'ak' ? 'en' : 'ak'),
                  child: Text(
                    lang == 'ak' ? 'EN' : 'ရခိုင်',
                    style: const TextStyle(color: gold, fontWeight: FontWeight.bold),
                  ),
                ),
                IconButton(
                  icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode, color: gold),
                  onPressed: () => appState.toggleTheme(),
                ),
              ],
            ),
          ),

          // ── Main Dashboard Content ───────────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hero Balance Banner (Desktop wide)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Balance Card
                      Expanded(
                        flex: 2,
                        child: Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF2D0A0E), Color(0xFF1A1218), Color(0xFF111A28)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: gold.withOpacity(0.4)),
                            boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 16)],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: gold.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      TranslationStrings.tr('currencyLabel', lang),
                                      style: const TextStyle(color: gold, fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text('Total Net Worth (USD Eq.)', style: TextStyle(color: Colors.grey[400], fontSize: 10)),
                                      const Text(
                                        '\$ 21,526.00',
                                        style: TextStyle(
                                          fontFamily: 'monospace',
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: emeraldSuccess,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.baseline,
                                textBaseline: TextBaseline.alphabetic,
                                children: [
                                  const Text('₳ ', style: TextStyle(color: gold, fontSize: 32, fontWeight: FontWeight.bold)),
                                  Text(
                                    appState.wallet.balance.toStringAsFixed(2),
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 42,
                                      fontWeight: FontWeight.w900,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Text('AKD', style: TextStyle(color: gold, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  const Icon(Icons.verified_user, color: emeraldSuccess, size: 14),
                                  const SizedBox(width: 6),
                                  Text(
                                    TranslationStrings.tr('reserveBacked', lang),
                                    style: const TextStyle(color: goldLight, fontSize: 11),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 20),
                              // Quick module shortcuts
                              Wrap(
                                spacing: 10,
                                runSpacing: 8,
                                children: [
                                  ElevatedButton.icon(
                                    onPressed: () => appState.navigate(Screen.send),
                                    icon: const Icon(Icons.arrow_outward, size: 14, color: Colors.black),
                                    label: const Text('Send Money', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                                    style: ElevatedButton.styleFrom(backgroundColor: gold),
                                  ),
                                  OutlinedButton.icon(
                                    onPressed: () => appState.navigate(Screen.receive),
                                    icon: const Icon(Icons.arrow_downward, size: 14, color: Colors.white),
                                    label: const Text('Deposit / Receive', style: TextStyle(color: Colors.white, fontSize: 11)),
                                    style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.white30)),
                                  ),
                                  OutlinedButton.icon(
                                    onPressed: () => appState.navigate(Screen.cashout),
                                    icon: const Icon(Icons.store, size: 14, color: emeraldSuccess),
                                    label: const Text('Agent Cash Out', style: TextStyle(color: Colors.white, fontSize: 11)),
                                    style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.white30)),
                                  ),
                                  OutlinedButton.icon(
                                    onPressed: () => appState.navigate(Screen.intl),
                                    icon: const Icon(Icons.public, size: 14, color: Colors.cyanAccent),
                                    label: const Text('Wise Remittance', style: TextStyle(color: Colors.white, fontSize: 11)),
                                    style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.white30)),
                                  ),
                                  OutlinedButton.icon(
                                    onPressed: () => appState.navigate(Screen.crypto),
                                    icon: const Icon(Icons.currency_bitcoin, size: 14, color: Colors.purpleAccent),
                                    label: const Text('Crypto Vault', style: TextStyle(color: Colors.white, fontSize: 11)),
                                    style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.white30)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 20),
                      // Quick Send Mini Card
                      Expanded(
                        flex: 1,
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isDark ? surfaceCard : Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: isDark ? slateBorder : Colors.grey[200]!),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: const [
                                  Icon(Icons.flash_on, color: gold, size: 18),
                                  SizedBox(width: 6),
                                  Text('Quick Transfer', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                ],
                              ),
                              const SizedBox(height: 14),
                              Builder(
                                builder: (ctx) {
                                  final currentContacts = appState.contactsList.isNotEmpty ? appState.contactsList : contacts;
                                  final validSelection = currentContacts.any((c) => c.id == _selectedContactId)
                                      ? _selectedContactId
                                      : (currentContacts.isNotEmpty ? currentContacts.first.id : null);
                                  return DropdownButtonFormField<String>(
                                    value: validSelection,
                                    decoration: InputDecoration(
                                      labelText: 'Recipient',
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    ),
                                    items: currentContacts.map((c) {
                                      return DropdownMenuItem(
                                        value: c.id,
                                        child: Text('${c.name} (${c.id})', style: const TextStyle(fontSize: 12)),
                                      );
                                    }).toList(),
                                    onChanged: (v) {
                                      if (v != null) setState(() => _selectedContactId = v);
                                    },
                                  );
                                },
                              ),
                              const SizedBox(height: 10),
                              TextField(
                                controller: _quickAmtCtrl,
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  labelText: 'Amount (AKD)',
                                  prefixText: '₳ ',
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                ),
                              ),
                              const SizedBox(height: 14),
                              SizedBox(
                                width: double.infinity,
                                height: 42,
                                child: ElevatedButton(
                                  onPressed: () {
                                    final amt = double.tryParse(_quickAmtCtrl.text) ?? 0.0;
                                    final currentContacts = appState.contactsList.isNotEmpty ? appState.contactsList : contacts;
                                    final contact = currentContacts.firstWhere(
                                      (c) => c.id == _selectedContactId,
                                      orElse: () => currentContacts.isNotEmpty
                                          ? currentContacts.first
                                          : Contact(name: 'Arakan Network', mm: 'အာရက္ခ', id: 'ARAK-001', location: 'Sittwe', phone: '', initials: 'AK'),
                                    );
                                    if (amt > 0) {
                                      appState.recordTransfer(
                                        amount: amt,
                                        recipientName: contact.name,
                                        recipientId: contact.id,
                                      );
                                      setState(() => _quickSentSuccess = true);
                                      Future.delayed(const Duration(seconds: 3), () {
                                        if (mounted) setState(() => _quickSentSuccess = false);
                                      });
                                    }
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: gold,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                  child: Text(
                                    _quickSentSuccess ? 'Transfer Sent! ✓' : 'Send Immediately',
                                    style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),

                  // ── Searchable Transaction Ledger ────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        TranslationStrings.tr('recentTransactions', lang),
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      // Search box
                      SizedBox(
                        width: 260,
                        height: 38,
                        child: TextField(
                          decoration: InputDecoration(
                            hintText: 'Search ledger records...',
                            hintStyle: const TextStyle(fontSize: 11),
                            prefixIcon: const Icon(Icons.search, size: 16),
                            filled: true,
                            fillColor: isDark ? surfaceCard : Colors.white,
                            contentPadding: const EdgeInsets.symmetric(vertical: 0),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: isDark ? slateBorder : Colors.grey[300]!),
                            ),
                          ),
                          onChanged: (v) => setState(() => _searchQuery = v),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Category filter pills
                  Row(
                    children: [
                      {'id': 'all', 'label': 'All Ledger'},
                      {'id': 'p2p', 'label': 'P2P Wire'},
                      {'id': 'crypto', 'label': 'Crypto'},
                      {'id': 'pos', 'label': 'Merchant POS'},
                      {'id': 'cashout', 'label': 'Agent Cash'},
                      {'id': 'remittance', 'label': 'Global Wire'},
                      {'id': 'card', 'label': 'Cards'},
                    ].map((cat) {
                      final active = _selectedCategory == cat['id'];
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(
                            cat['label']!,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: active ? Colors.black : (isDark ? Colors.white70 : Colors.black87),
                            ),
                          ),
                          selected: active,
                          selectedColor: gold,
                          backgroundColor: isDark ? surfaceCard : Colors.grey[200],
                          onSelected: (_) => setState(() => _selectedCategory = cat['id']!),
                          showCheckmark: false,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 14),

                  // Ledger Table
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: isDark ? surfaceCard : Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: isDark ? slateBorder : Colors.grey[200]!),
                    ),
                    child: DataTable(
                      headingRowColor: MaterialStateProperty.all(isDark ? Colors.black26 : Colors.grey[100]),
                      columns: const [
                        DataColumn(label: Text('REFERENCE / HASH', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('DESCRIPTION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('COUNTERPARTY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('TIME', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('STATUS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('AMOUNT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                      ],
                      rows: filteredTxns.map((tx) {
                        final isNeg = tx.amount < 0;
                        return DataRow(
                          cells: [
                            DataCell(
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(tx.refId, style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 11)),
                                  Text(tx.hash, style: TextStyle(fontFamily: 'monospace', fontSize: 9, color: Colors.grey[500])),
                                ],
                              ),
                            ),
                            DataCell(Text(lang == 'ak' ? tx.titleMm : tx.title, style: const TextStyle(fontSize: 12))),
                            DataCell(Text(tx.counterparty, style: TextStyle(fontSize: 11, color: Colors.grey[400]))),
                            DataCell(Text(tx.time, style: const TextStyle(fontSize: 11))),
                            DataCell(
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: emeraldSuccess.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(tx.status, style: const TextStyle(color: emeraldSuccess, fontSize: 9, fontWeight: FontWeight.bold)),
                              ),
                            ),
                            DataCell(
                              Text(
                                '${isNeg ? '-' : '+'} ₳ ${tx.amount.abs().toStringAsFixed(2)}',
                                style: TextStyle(
                                  fontFamily: 'monospace',
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: isNeg ? Colors.redAccent : emeraldSuccess,
                                ),
                              ),
                            ),
                          ],
                        );
                      }).toList(),
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
}
