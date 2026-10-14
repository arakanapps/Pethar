import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';

class ReceiveScreen extends StatefulWidget {
  const ReceiveScreen({Key? key}) : super(key: key);

  @override
  State<ReceiveScreen> createState() => _ReceiveScreenState();
}

class _ReceiveScreenState extends State<ReceiveScreen> {
  bool _copied = false;

  void _copyId(String id) {
    Clipboard.setData(ClipboardData(text: id));
    setState(() => _copied = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copied = false);
    });
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
          TranslationStrings.tr('receiveTitle', lang),
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: isDark ? surfaceDark : Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => appState.goBack(),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 20)],
                ),
                child: QrImageView(
                  data: 'pethar://pay?to=${appState.profile.petharId}&curr=AKD',
                  version: QrVersions.auto,
                  size: 200.0,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                appState.profile.name,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                appState.profile.petharId,
                style: const TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: gold,
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Text(
                  lang == 'ak'
                      ? 'ဤ QR ကုဒ်ကို ပေးပို့သူအား ပြသ၍ အာရက္ခဒေါ်လာ တိုက်ရိုက်လက်ခံပါ'
                      : 'Scan with Péthar Mobile to send Arakan Dollars instantly',
                  style: TextStyle(fontSize: 12, color: Colors.grey[500], height: 1.4),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 24),
              OutlinedButton.icon(
                icon: Icon(
                  _copied ? Icons.check : Icons.copy,
                  size: 16,
                  color: _copied ? emeraldSuccess : gold,
                ),
                label: Text(
                  _copied
                      ? TranslationStrings.tr('receiveIdCopied', lang)
                      : TranslationStrings.tr('receiveCopyId', lang),
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: _copied ? emeraldSuccess : (isDark ? Colors.white : Colors.black87),
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  side: BorderSide(color: _copied ? emeraldSuccess : gold.withOpacity(0.5)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: () => _copyId(appState.profile.petharId),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
