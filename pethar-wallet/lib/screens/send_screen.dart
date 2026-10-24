import 'dart:ui' as ui;
import 'dart:io';
import 'package:flutter/rendering.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../app_state.dart';
import '../services/supabase_service.dart';
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
  final GlobalKey _receiptKey = GlobalKey();
  bool _isSavingSlip = false;
  bool _slipSaved = false;
  bool _hasAutoSaved = false;
  bool _isProcessing = false;
  String? _transferIdempotencyKey;
  String? _sendError;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onContactSelected(Contact contact) {
    setState(() {
      selectedContact = contact;
      step = 2;
      _sendError = null;
      _transferIdempotencyKey = null;
    });
  }

  void _onCustomRecipientSubmit() {
    final query = _searchCtrl.text.trim();
    if (query.isNotEmpty) {
      setState(() {
        selectedContact = Contact(
          name: query.startsWith('@') ? query.substring(1) : query,
          mm: '',
          // The server resolves this UID or username; do not fabricate a user ID.
          id: query.trim(),
          location: '',
          phone: '',
          initials: query.isNotEmpty ? query[0].toUpperCase() : 'U',
        );
        step = 2;
      });
    }
  }

  Future<void> _captureAndSaveReceipt({bool showToast = true}) async {
    if (_isSavingSlip) return;
    try {
      _isSavingSlip = true;
      final boundary = _receiptKey.currentContext?.findRenderObject()
          as RenderRepaintBoundary?;
      if (boundary == null) return;
      final image = await boundary.toImage(pixelRatio: 3.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) return;
      final bytes = byteData.buffer.asUint8List();

      Directory? targetDir;
      if (Platform.isAndroid) {
        final picturesDir = Directory('/storage/emulated/0/Pictures/Pethar');
        if (await picturesDir.exists()) {
          targetDir = picturesDir;
        } else {
          try {
            await picturesDir.create(recursive: true);
            targetDir = picturesDir;
          } catch (_) {
            targetDir = await getExternalStorageDirectory();
          }
        }
      } else {
        targetDir = await getApplicationDocumentsDirectory();
      }

      if (targetDir != null) {
        final file =
            File('${targetDir.path}/pethar-receipt-$_generatedRefId.png');
        await file.writeAsBytes(bytes);
        if (mounted) {
          setState(() {
            _slipSaved = true;
          });
          if (showToast) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Receipt saved to Phone Gallery ✓'),
                backgroundColor: emeraldSuccess,
                duration: Duration(seconds: 2),
              ),
            );
          }
        }
      }
    } catch (e) {
      debugPrint('Error saving receipt slip: $e');
    } finally {
      _isSavingSlip = false;
    }
  }

  void _onPinDigit(String digit, AppState appState) {
    if (_isProcessing || pin.length >= 6) return;
    setState(() {
      pin += digit;
      _sendError = null;
    });
    if (pin.length == 6) {
      Future.delayed(
          const Duration(milliseconds: 300), () => _submitTransfer(appState));
    }
  }

  Future<void> _submitTransfer(AppState appState) async {
    if (_isProcessing) return;

    final amt = double.tryParse(amount) ?? 0.0;
    final recipient = (selectedContact?.id ?? '').trim();

    if (recipient.isEmpty || amt <= 0) {
      setState(() {
        pin = '';
        _sendError = 'Enter a valid recipient UID and amount';
      });
      return;
    }

    setState(() => _isProcessing = true);

    final result = await SupabaseService().transferFunds(
      recipient: recipient,
      amount: amt,
      pin: pin,
      idempotencyKey: _transferIdempotencyKey ??=
          SupabaseService().createTransferIdempotencyKey(),
    );

    if (!mounted) return;

    if (result['success'] == true) {
      await appState.loadSupabaseData();
      if (!mounted) return;
      setState(() {
        _isProcessing = false;
        _transferIdempotencyKey = null;
        _generatedRefId =
            (result['transaction_id'] ?? result['reference_id'] ?? '')
                .toString();
        step = 4;
        _hasAutoSaved = false;
        _slipSaved = false;
      });
    } else {
      setState(() {
        _isProcessing = false;
        pin = '';
        // Retain this key after any failure: a response can be lost after the
        // database committed, and retrying with a fresh key could double-send.
        _transferIdempotencyKey ??=
            SupabaseService().createTransferIdempotencyKey();
        _sendError = result['message']?.toString() ?? 'Transfer failed';
      });
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
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_isProcessing) return;
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
                    hintText:
                        TranslationStrings.tr('sendRecipientPlaceholder', lang),
                    hintStyle:
                        const TextStyle(fontSize: 12, color: Colors.grey),
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
          style: const TextStyle(
              color: gold, fontSize: 12, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 10),
        if ((appState.contactsList.isNotEmpty
                ? appState.contactsList
                : contacts)
            .isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Text(
              lang == 'ak'
                  ? 'လတ်တလော ဆက်သွယ်သူ မရှိသေးပါ'
                  : 'No saved contacts yet',
              style: const TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 13,
              ),
            ),
          )
        else
          ...(appState.contactsList.isNotEmpty
                  ? appState.contactsList
                  : contacts)
              .map((c) {
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
                            gradient:
                                const LinearGradient(colors: [crimson, gold]),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Center(
                            child: Text(
                              c.initials,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13),
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
                                style: TextStyle(
                                    fontSize: 11, color: Colors.grey[500]),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.chevron_right,
                            color: Colors.grey, size: 18),
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
                backgroundColor: gold.withValues(alpha: 0.2),
                child: Text(
                  selectedContact?.initials ?? 'AK',
                  style: const TextStyle(
                      color: gold, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lang == 'ak'
                          ? (selectedContact?.mm ?? '')
                          : (selectedContact?.name ?? ''),
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 13),
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
                  color: emeraldSuccess.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text('VERIFIED',
                    style: TextStyle(
                        color: emeraldSuccess,
                        fontSize: 9,
                        fontWeight: FontWeight.bold)),
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
            const Text('₳ ',
                style: TextStyle(
                    color: gold, fontSize: 32, fontWeight: FontWeight.bold)),
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
              style: const TextStyle(
                  fontSize: 12,
                  color: emeraldSuccess,
                  fontWeight: FontWeight.bold),
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
                      side: BorderSide(
                          color: isDark ? Colors.white12 : Colors.grey[300]!),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      '₳ $v',
                      style: const TextStyle(
                          color: gold,
                          fontSize: 11,
                          fontWeight: FontWeight.bold),
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
            if (amount.isNotEmpty) {
              setState(() => amount = amount.substring(0, amount.length - 1));
            }
          },
        ),

        // Continue Button
        Padding(
          padding: const EdgeInsets.all(16),
          child: SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed:
                  (amount.isNotEmpty && (double.tryParse(amount) ?? 0) > 0)
                      ? () => setState(() => step = 3)
                      : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: gold,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
              child: Text(
                '${TranslationStrings.tr('sendContinue', lang)} (₳ ${amount.isEmpty ? '0' : amount})',
                style: const TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: 14),
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
            color: gold.withValues(alpha: 0.15),
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
        if (_isProcessing) ...[
          const SizedBox(height: 18),
          const SizedBox(
            width: 22,
            height: 22,
            child: CircularProgressIndicator(strokeWidth: 2.4, color: gold),
          ),
        ],
        if (_sendError != null) ...[
          const SizedBox(height: 14),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              _sendError!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 12, color: crimson, fontWeight: FontWeight.w600),
            ),
          ),
        ],
        const Spacer(),
        Keypad(
          onKeyPressed: (v) {
            if (v != '.') _onPinDigit(v, appState);
          },
          onDelete: () {
            if (!_isProcessing && pin.isNotEmpty) {
              setState(() => pin = pin.substring(0, pin.length - 1));
            }
          },
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  // ── STEP 4: SUCCESS ELECTRONIC SLIP (e-Slip) ─────────────────────────────
  Widget _buildStep4(bool isDark, String lang, AppState appState) {
    if (appState.autoSaveSlip && !_hasAutoSaved) {
      _hasAutoSaved = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Future.delayed(const Duration(milliseconds: 600), () {
          if (mounted) {
            _captureAndSaveReceipt(showToast: false);
          }
        });
      });
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          RepaintBoundary(
            key: _receiptKey,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                boxShadow: const [
                  BoxShadow(color: Colors.black38, blurRadius: 20)
                ],
              ),
              child: Column(
                children: [
                  // Auto saved badge
                  if (appState.autoSaveSlip || _slipSaved) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: emeraldSuccess.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.check_circle,
                              color: emeraldSuccess, size: 14),
                          const SizedBox(width: 6),
                          Text(
                            lang == 'ak'
                                ? 'ပြေစာကို ဖုန်း Gallery ထဲသို့ သိမ်းဆည်းပြီးပါပြီ ✓'
                                : 'Slip Auto-Saved to Phone Gallery ✓',
                            style: const TextStyle(
                                color: emeraldSuccess,
                                fontWeight: FontWeight.bold,
                                fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Bank header
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
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
                          style: TextStyle(
                              color: Colors.grey[500],
                              fontSize: 9,
                              letterSpacing: 1),
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
                          style: TextStyle(
                              color: emeraldSuccess,
                              fontSize: 10,
                              fontWeight: FontWeight.bold),
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
                          const Icon(Icons.arrow_circle_up,
                              color: Colors.blueAccent, size: 20),
                          Container(
                              width: 1, height: 30, color: Colors.grey[300]),
                          const Icon(Icons.arrow_circle_down,
                              color: emeraldSuccess, size: 20),
                        ],
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'From: ${appState.profile.name}',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.black87),
                            ),
                            Text(
                              appState.profile.uid,
                              style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.grey[500],
                                  fontFamily: 'monospace'),
                            ),
                            const SizedBox(height: 18),
                            Text(
                              'To: ${selectedContact?.name ?? ''}',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.black87),
                            ),
                            Text(
                              selectedContact?.id ?? '',
                              style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.grey[500],
                                  fontFamily: 'monospace'),
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
                          Text('REF NO',
                              style: TextStyle(
                                  color: Colors.grey[500], fontSize: 8)),
                          Text(
                            _generatedRefId,
                            style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87),
                          ),
                          const SizedBox(height: 4),
                          Text('DATE & TIME',
                              style: TextStyle(
                                  color: Colors.grey[500], fontSize: 8)),
                          const Text('Today · Just now',
                              style: TextStyle(
                                  fontSize: 10, color: Colors.black87)),
                        ],
                      ),
                      QrImageView(
                        data: 'pethar://verify?ref=$_generatedRefId',
                        version: QrVersions.auto,
                        size: 55,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Action Buttons: Save to Gallery & Done
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: OutlinedButton.icon(
                    onPressed: () => _captureAndSaveReceipt(showToast: true),
                    icon: Icon(
                      _slipSaved ? Icons.check_circle : Icons.download,
                      size: 16,
                      color: _slipSaved
                          ? emeraldSuccess
                          : (isDark ? Colors.white : Colors.black87),
                    ),
                    label: Text(
                      _slipSaved
                          ? (lang == 'ak' ? 'သိမ်းပြီး ✓' : 'Saved ✓')
                          : (lang == 'ak'
                              ? 'Gallery သိမ်းမည်'
                              : 'Save to Gallery'),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _slipSaved
                            ? emeraldSuccess
                            : (isDark ? Colors.white : Colors.black87),
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(
                          color: isDark ? Colors.white24 : Colors.grey[300]!),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Done Button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () => appState.navigate(Screen.home),
              style: ElevatedButton.styleFrom(
                backgroundColor: gold,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text(
                'Done',
                style: TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
