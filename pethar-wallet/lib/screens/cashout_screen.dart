import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import '../models/data.dart';

class CashOutScreen extends StatefulWidget {
  const CashOutScreen({Key? key}) : super(key: key);

  @override
  State<CashOutScreen> createState() => _CashOutScreenState();
}

class _CashOutScreenState extends State<CashOutScreen> {
  Agent? _selectedAgent;
  int _secondsLeft = 30;
  String _totpCode = '719 402';
  Timer? _timer;

  void _startTimer() {
    _secondsLeft = 30;
    _generateTotp();
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsLeft <= 1) {
        setState(() {
          _secondsLeft = 30;
          _generateTotp();
        });
      } else {
        setState(() {
          _secondsLeft--;
        });
      }
    });
  }

  void _generateTotp() {
    final r = Random();
    final c1 = 100 + r.nextInt(900);
    final c2 = 100 + r.nextInt(900);
    _totpCode = '$c1 $c2';
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
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
          TranslationStrings.tr('cashOutTitle', lang),
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: isDark ? surfaceDark : Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_selectedAgent != null) {
              setState(() => _selectedAgent = null);
              _timer?.cancel();
            } else {
              appState.goBack();
            }
          },
        ),
      ),
      body: _selectedAgent == null
          ? ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Info banner
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: gold.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: gold.withOpacity(0.3)),
                  ),
                  child: Text(
                    TranslationStrings.tr('cashOutSubtitle', lang),
                    style: const TextStyle(color: goldLight, fontSize: 11, height: 1.4),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  TranslationStrings.tr('cashOutNearbyAgents', lang),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.grey[400] : Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 10),
                ...(appState.agentsList.isNotEmpty ? appState.agentsList : agents).map((agt) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: Material(
                      color: isDark ? surfaceCard : Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(18),
                        onTap: () {
                          setState(() => _selectedAgent = agt);
                          _startTimer();
                        },
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [crimson.withOpacity(0.2), gold.withOpacity(0.2)],
                                  ),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: gold.withOpacity(0.3)),
                                ),
                                child: const Icon(Icons.store, color: gold, size: 22),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      lang == 'ak' ? agt.mm : agt.name,
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                        color: isDark ? Colors.white : Colors.black87,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${agt.code} • ${lang == 'ak' ? agt.townshipMm : agt.township}',
                                      style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${agt.distance} • ${lang == 'ak' ? agt.floatStatusMm : '${agt.floatStatus} Cash Float'}',
                                      style: const TextStyle(fontSize: 10, color: goldLight, fontFamily: 'monospace'),
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
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1C2530), Color(0xFF101724)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: gold.withOpacity(0.4)),
                  boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 20)],
                ),
                child: Column(
                  children: [
                    Text(
                      lang == 'ak' ? _selectedAgent!.mm : _selectedAgent!.name,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 18),
                    Text(
                      TranslationStrings.tr('cashOutTokenLabel', lang),
                      style: TextStyle(fontSize: 11, color: Colors.grey[400]),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _totpCode,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 38,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 4,
                        color: gold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.access_time, color: gold, size: 14),
                        const SizedBox(width: 6),
                        Text(
                          '${TranslationStrings.tr('cashOutTokenValidFor', lang)}: $_secondsLeft s',
                          style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: QrImageView(
                        data: 'pethar://cashout?agent=${_selectedAgent!.code}&totp=$_totpCode',
                        version: QrVersions.auto,
                        size: 160,
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      lang == 'ak'
                          ? 'အေးဂျင့်ထံ ဤကုဒ်ပြသ၍ ငွေသားထုတ်ယူပါ။ တစ်ခါသုံးကုဒ်ဖြစ်သဖြင့် လုံခြုံစိတ်ချရပါသည်'
                          : 'Show dynamic code to agent counter to withdraw physical Arakan banknotes',
                      style: const TextStyle(color: Colors.white70, fontSize: 11, height: 1.4),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                lang == 'ak' ? 'ငွေသားထုတ်ယူမှု အောင်မြင်ပါသည်!' : 'Cash-out withdrawal settled!',
                              ),
                              backgroundColor: emeraldSuccess,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                          appState.goBack();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: gold,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: Text(
                          lang == 'ak' ? 'ငွေသားလက်ခံရရှိပါပြီ' : 'Confirm Cash Received',
                          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
