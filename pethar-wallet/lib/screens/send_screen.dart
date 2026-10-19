import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import '../models/data.dart';
import '../widgets/keypad.dart';
import '../widgets/otp_dots.dart';
import '../widgets/arakan_emblem.dart';

class SendScreen extends StatefulWidget {
  const SendScreen({Key? key}) : super(key: key);

  @override
  State<SendScreen> createState() => _SendScreenState();
}

class _SendScreenState extends State<SendScreen> {
  int step = 1; // 1: Recipient, 2: Amount, 3: PIN, 4: Receipt
  Contact? selectedContact;
  final TextEditingController _searchCtrl = TextEditingController();
  String amount = '';
  String pin = '';
  String _generatedRefId = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onContactSelected(Contact contact) {
    setState(() {
      selectedContact = contact;
      step = 2;
    });
  }

  void _onCustomRecipientSubmit() {
    final query = _searchCtrl.text.trim();
    if (query.isNotEmpty) {
      setState(() {
        selectedContact = Contact(
          name: query,
          mm: query,
          id: query.startsWith('ARAK') ? query : 'ARAK-8899',
          location: 'Arakan Network',
          phone: query,
          initials: 'AK',
        );
        step = 2;
      });
    }
  }

  void _onPinDigit(String digit, AppState appState) {
    if (pin.length < 6) {
      setState(() => pin += digit);
      if (pin.length == 6) {
        Future.delayed(const Duration(milliseconds: 400), () {
          final amt = double.tryParse(amount) ?? 0.0;
          _generatedRefId = 'ARAK-P2P-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
          appState.recordTransfer(
            amount: amt,
            recipientName: selectedContact?.name ?? 'Ko Min Aung',
            recipientId: selectedContact?.id ?? 'ARAK-8891',
          );
          setState(() => step = 4);
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    return Scaffold(
      backgroundColor: isDark ? obsidian : paper,
      appBar: AppBar(
        title: Text(
          step == 1
              ? TranslationStrings.tr('sendTitle', lang)
              : step == 2
                  ? TranslationStrings.tr('sendAmountLabel', lang)
                  : step == 3
                      ? TranslationStrings.tr('sendEnterPin', lang)
                      : TranslationStrings.tr('sendSuccess', lang),
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: isDark ? surfaceDark : Colors.white,
        elevation: 0,
        actions: [
          if (step == 1)
            TextButton.icon(
              onPressed: () => appState.navigate(Screen.offlinePayment),
              icon: const Icon(Icons.offline_bolt_rounded, color: gold, size: 16),
              label: Text(
                lang == 'ak' ? 'အော့ဖ်လိုင်း' : 'Offline',
                style: const TextStyle(color: gold, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
        ],
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (step == 4) {
              appState.navigate(Screen.home);
            } else if (step > 1) {
              setState(() {
                step--;
                if (step == 2) pin = '';
              });
            } else {
              appState.goBack();
            }
          },
        ),
      ),
      body: step == 1
          ? _buildStep1(isDark, lang, appState)
          : step == 2
              ? _buildStep2(isDark, lang)
              : step == 3
                  ? _buildStep3(isDark, lang, appState)
                  : _buildStep4(isDark, lang, appState),
    );
  }

  // ── STEP 1: SELECT RECIPIENT ─────────────────────────────────────────────
  Widget _buildStep1(bool isDark, String lang, AppState appState) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Offline P2P banner shortcut
        InkWell(
          onTap: () => appState.navigate(Screen.offlinePayment),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? gold.withOpacity(0.12) : const Color(0xFFFFF9E6),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: gold.withOpacity(0.35)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: gold.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.offline_bolt_rounded, color: gold, size: 18),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lang == 'ak' ? 'အင်တာနက်မရှိဘဲ ငွေလွှဲမည်လား?' : 'Need to send money offline?',
                        style: TextStyle(
                          fontSize: 12, fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                      Text(
                        lang == 'ak' ? 'QR၊ NFC သို့မဟုတ် ဘလူးတုသ် မက်ရှ်ဖြင့် တိုက်ရိုက်လွှဲပါ' : 'Use Bearer eCash via NFC, BLE mesh or QR',
                        style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios, size: 12, color: gold),
              ],
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: BoxDecoration(
            color: isDark ? surfaceCard : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? slateBorder : Colors.grey[300]!),
          ),
          child: Row(
            children: [
              const Icon(Icons.search, color: Colors.grey, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _searchCtrl,
                  decoration: InputDecoration(
                    hintText: TranslationStrings.tr('sendRecipientPlaceholder', lang),
                    hintStyle: const TextStyle(fontSize: 12, color: Colors.grey),
                    border: InputBorder.none,
                  ),
                  onSubmitted: (_) => _onCustomRecipientSubmit(),
                ),
              ),
              if (_searchCtrl.text.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.arrow_forward, color: gold, size: 20),
                  onPressed: _onCustomRecipientSubmit,
                ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Text(
          TranslationStrings.tr('sendRecentContacts', lang),
          style: const TextStyle(color: gold, fontSize: 12, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 10),
        ...(appState.contactsList.isNotEmpty ? appState.contactsList : contacts).map((c) {
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            child: Material(
              color: isDark ? surfaceCard : Colors.white,
              borderRadius: BorderRadius.circular(18),
              child: InkWell(
                borderRadius: BorderRadius.circular(18),
                onTap: () => _onContactSelected(c),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [crimson, gold]),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Center(
                          child: Text(
                            c.initials,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              lang == 'ak' ? c.mm : c.name,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${c.id} • ${c.location}',
                              style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, color: Colors.grey, size: 18),
                    ],
                  ),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  // ── STEP 2: ENTER AMOUNT ────────────────────────────────────────────────
  Widget _buildStep2(bool isDark, String lang) {
    return Column(
      children: [
        // Recipient Pill
        Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? surfaceCard : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? slateBorder : Colors.grey[300]!),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: gold.withOpacity(0.2),
                child: Text(
                  selectedContact?.initials ?? 'AK',
                  style: const TextStyle(color: gold, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lang == 'ak' ? (selectedContact?.mm ?? '') : (selectedContact?.name ?? ''),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    Text(
                      selectedContact?.id ?? '',
                      style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: emeraldSuccess.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text('VERIFIED', style: TextStyle(color: emeraldSuccess, fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),

        // Amount Display
        const Spacer(),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            const Text('₳ ', style: TextStyle(color: gold, fontSize: 32, fontWeight: FontWeight.bold)),
            Text(
              amount.isEmpty ? '0.00' : amount,
              style: TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.w900,
                fontFamily: 'monospace',
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '${TranslationStrings.tr('sendFeeLabel', lang)}: ',
              style: TextStyle(fontSize: 12, color: Colors.grey[500]),
            ),
            Text(
              TranslationStrings.tr('sendFeeFree', lang),
              style: const TextStyle(fontSize: 12, color: emeraldSuccess, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const Spacer(),

        // Quick Preset Chips
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          child: Row(
            children: [25, 50, 100, 500].map((v) {
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: OutlinedButton(
                    onPressed: () => setState(() => amount = v.toString()),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      side: BorderSide(color: isDark ? Colors.white12 : Colors.grey[300]!),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      '₳ $v',
                      style: const TextStyle(color: gold, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),

        // Keypad
        Keypad(
          onKeyPressed: (v) {
            if (v == '.' && amount.contains('.')) return;
            if (amount.length < 9) setState(() => amount += v);
          },
          onDelete: () {
            if (amount.isNotEmpty) setState(() => amount = amount.substring(0, amount.length - 1));
          },
        ),

        // Continue Button
        Padding(
          padding: const EdgeInsets.all(16),
          child: SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: (amount.isNotEmpty && (double.tryParse(amount) ?? 0) > 0)
                  ? () => setState(() => step = 3)
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: gold,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: Text(
                '${TranslationStrings.tr('sendContinue', lang)} (₳ ${amount.isEmpty ? '0' : amount})',
                style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ── STEP 3: PIN AUTHORIZATION ───────────────────────────────────────────
  Widget _buildStep3(bool isDark, String lang, AppState appState) {
    return Column(
      children: [
        const SizedBox(height: 30),
        Container(
          width: 54,
          height: 54,
          decoration: BoxDecoration(
            color: gold.withOpacity(0.15),
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Icon(Icons.fingerprint, color: gold, size: 30),
        ),
        const SizedBox(height: 16),
        Text(
          TranslationStrings.tr('sendEnterPin', lang),
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        Text(
          'Transfer ₳ $amount to ${selectedContact?.name}',
          style: TextStyle(fontSize: 12, color: Colors.grey[500]),
        ),
        const SizedBox(height: 24),
        OtpDots(length: 6, filledCount: pin.length),
        const Spacer(),
        Keypad(
          onKeyPressed: (v) {
            if (v != '.') _onPinDigit(v, appState);
          },
          onDelete: () {
            if (pin.isNotEmpty) setState(() => pin = pin.substring(0, pin.length - 1));
          },
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  // ── STEP 4: SUCCESS ELECTRONIC SLIP (e-Slip) ─────────────────────────────
  Widget _buildStep4(bool isDark, String lang, AppState appState) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
          boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 20)],
        ),
        child: Column(
          children: [
            // Auto saved badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: emeraldSuccess.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle, color: emeraldSuccess, size: 14),
                  SizedBox(width: 6),
                  Text(
                    'Slip Auto-Saved to Photos ✓',
                    style: TextStyle(color: emeraldSuccess, fontWeight: FontWeight.bold, fontSize: 10),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Bank header
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                ArakanEmblem(size: 28),
                SizedBox(width: 8),
                Text(
                  'BANK OF ARAKAN',
                  style: TextStyle(
                    color: Colors.black87,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.5,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Electronic Transaction Slip',
              style: TextStyle(color: Colors.grey[600], fontSize: 10),
            ),
            const SizedBox(height: 20),

            // Amount Box
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Column(
                children: [
                  Text(
                    'TRANSFER AMOUNT',
                    style: TextStyle(color: Colors.grey[500], fontSize: 9, letterSpacing: 1),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '₳ $amount',
                    style: const TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.w900,
                      color: Colors.black87,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Fee: 0.00 ₳ (Network Free)',
                    style: TextStyle(color: emeraldSuccess, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Routing
            Row(
              children: [
                Column(
                  children: [
                    const Icon(Icons.arrow_circle_up, color: Colors.blueAccent, size: 20),
                    Container(width: 1, height: 30, color: Colors.grey[300]),
                    const Icon(Icons.arrow_circle_down, color: emeraldSuccess, size: 20),
                  ],
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'From: ${appState.profile.name}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black87),
                      ),
                      Text(
                        appState.profile.petharId,
                        style: TextStyle(fontSize: 10, color: Colors.grey[500], fontFamily: 'monospace'),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'To: ${selectedContact?.name ?? 'Ko Min Aung'}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black87),
                      ),
                      Text(
                        selectedContact?.id ?? 'ARAK-8891',
                        style: TextStyle(fontSize: 10, color: Colors.grey[500], fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Divider
            Divider(color: Colors.grey[200]),
            const SizedBox(height: 8),

            // Reference and micro QR
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('REF NO', style: TextStyle(color: Colors.grey[500], fontSize: 8)),
                    Text(
                      _generatedRefId,
                      style: const TextStyle(fontFamily: 'monospace', fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black87),
                    ),
                    const SizedBox(height: 4),
                    Text('DATE & TIME', style: TextStyle(color: Colors.grey[500], fontSize: 8)),
                    const Text('Today · Just now', style: TextStyle(fontSize: 10, color: Colors.black87)),
                  ],
                ),
                QrImageView(
                  data: 'pethar://verify?ref=$_generatedRefId',
                  version: QrVersions.auto,
                  size: 55,
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Done Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () => appState.navigate(Screen.home),
                style: ElevatedButton.styleFrom(
                  backgroundColor: gold,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text(
                  'Done',
                  style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
