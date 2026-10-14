import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../i18n.dart';
import '../widgets/firebase_auth_dialog.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  void _showEditProfileDialog(BuildContext context, AppState appState) {
    final nameCtrl = TextEditingController(text: appState.profile.name);
    final emailCtrl = TextEditingController(text: appState.profile.email);
    final phoneCtrl = TextEditingController(text: appState.profile.phone);
    final idCtrl = TextEditingController(text: appState.profile.petharId);
    final locCtrl = TextEditingController(text: appState.profile.location);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: EdgeInsets.only(
            top: 20,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          decoration: BoxDecoration(
            color: isDark ? surfaceDark : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    TranslationStrings.tr('editProfile', lang),
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: nameCtrl,
                decoration: InputDecoration(
                  labelText: TranslationStrings.tr('fullName', lang),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: emailCtrl,
                decoration: InputDecoration(
                  labelText: TranslationStrings.tr('emailAddress', lang),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: phoneCtrl,
                decoration: InputDecoration(
                  labelText: TranslationStrings.tr('phoneNumber', lang),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: idCtrl,
                decoration: InputDecoration(
                  labelText: TranslationStrings.tr('petharId', lang),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: locCtrl,
                decoration: InputDecoration(
                  labelText: TranslationStrings.tr('locationTownship', lang),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    appState.updateProfile(
                      name: nameCtrl.text.trim(),
                      email: emailCtrl.text.trim(),
                      phone: phoneCtrl.text.trim(),
                      petharId: idCtrl.text.trim(),
                      location: locCtrl.text.trim(),
                    );
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(TranslationStrings.tr('profileUpdated', lang)),
                        backgroundColor: emeraldSuccess,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange[700],
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(
                    TranslationStrings.tr('saveChanges', lang),
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showPolicyDialog(BuildContext context, String title, String content) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Text(content, style: const TextStyle(fontSize: 13, height: 1.5)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold, color: gold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    return Scaffold(
      backgroundColor: isDark ? obsidian : paper,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // ── Top Hero Profile Banner ──────────────────────────────────
            Container(
              padding: const EdgeInsets.only(top: 50, bottom: 24, left: 20, right: 20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF2D1B69), Color(0xFFD83A56), Color(0xFFFF6B35)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(color: Colors.black38, blurRadius: 10, offset: Offset(0, 4)),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withOpacity(0.5), width: 2.5),
                      boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 8)],
                    ),
                    child: ClipOval(
                      child: Image.network(
                        appState.profile.avatarUrl ?? '',
                        fit: BoxFit.cover,
                        errorBuilder: (ctx, _, __) => Container(
                          color: const Color(0xFF32195F),
                          child: const Icon(Icons.person, color: Colors.white, size: 36),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          appState.profile.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          appState.profile.email,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.85),
                            fontSize: 12,
                            fontFamily: 'monospace',
                          ),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white.withOpacity(0.4)),
                          ),
                          child: Text(
                            appState.profile.accountTier,
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ── Settings Sections ────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // SECTION 1: ACCOUNT SETTING
                  Text(
                    TranslationStrings.tr('accountSetting', lang).toUpperCase(),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                      color: isDark ? Colors.grey[400] : Colors.grey[700],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: isDark ? surfaceCard : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[200]!),
                    ),
                    child: Material(
                      type: MaterialType.transparency,
                      child: Column(
                      children: [
                        // Firebase Cloud Account & Authentication
                        ListTile(
                          leading: Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: Colors.amber.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.cloud_sync, color: gold, size: 22),
                          ),
                          title: Text(
                            lang == 'ak' ? 'Firebase အကောင့်နှင့် Cloud Sync' : 'Firebase Auth & Cloud Sync',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          subtitle: const Text(
                            'Email, Phone OTP, Google (pe-thar)',
                            style: TextStyle(fontSize: 11, color: goldLight, fontFamily: 'monospace'),
                          ),
                          trailing: const Icon(Icons.chevron_right, size: 20),
                          onTap: () => FirebaseAuthDialog.show(context, lang),
                        ),
                        Divider(height: 1, color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100]),

                        // Profile Info
                        ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Color(0x20FF5722),
                            child: Icon(Icons.person, color: Color(0xFFFF5722), size: 20),
                          ),
                          title: Text(
                            TranslationStrings.tr('profileInfo', lang),
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text(
                            '${appState.profile.petharId} · ${appState.profile.phone}',
                            style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                          ),
                          trailing: const Icon(Icons.chevron_right, size: 20),
                          onTap: () => _showEditProfileDialog(context, appState),
                        ),
                        Divider(height: 1, color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100]),

                        // Language Selection
                        ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Color(0x20FF5722),
                            child: Icon(Icons.language, color: Color(0xFFFF5722), size: 20),
                          ),
                          title: Text(
                            TranslationStrings.tr('languageSetting', lang),
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          trailing: Container(
                            decoration: BoxDecoration(
                              color: isDark ? Colors.black45 : Colors.grey[100],
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: isDark ? Colors.white12 : Colors.grey[300]!),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                GestureDetector(
                                  onTap: () => appState.setLanguage('en'),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: lang == 'en' ? Colors.blue[900] : Colors.transparent,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      'English',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: lang == 'en' ? Colors.white : Colors.grey,
                                      ),
                                    ),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => appState.setLanguage('ak'),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: lang == 'ak' ? crimson : Colors.transparent,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      'ရခိုင်',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: lang == 'ak' ? Colors.white : Colors.grey,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Divider(height: 1, color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100]),

                        // Auto Save Slip Toggle
                        ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Color(0x20FF5722),
                            child: Icon(Icons.download, color: Color(0xFFFF5722), size: 20),
                          ),
                          title: Text(
                            TranslationStrings.tr('autoSaveSlipSetting', lang),
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text(
                            TranslationStrings.tr('autoSaveSlipDesc', lang),
                            style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                          ),
                          trailing: Switch(
                            value: appState.autoSaveSlip,
                            activeThumbColor: const Color(0xFFFF5722),
                            onChanged: (_) => appState.toggleAutoSaveSlip(),
                          ),
                        ),
                        Divider(height: 1, color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100]),

                        // Dark / Light Mode
                        ListTile(
                          leading: CircleAvatar(
                            backgroundColor: const Color(0x20FF5722),
                            child: Icon(isDark ? Icons.dark_mode : Icons.light_mode, color: const Color(0xFFFF5722), size: 20),
                          ),
                          title: Text(
                            TranslationStrings.tr('themeSetting', lang),
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text(
                            isDark ? TranslationStrings.tr('darkMode', lang) : TranslationStrings.tr('lightMode', lang),
                            style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                          ),
                          trailing: IconButton(
                            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode, color: gold),
                            onPressed: () => appState.toggleTheme(),
                          ),
                        ),
                        Divider(height: 1, color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100]),

                        // Billing Management
                        ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Color(0x20FF5722),
                            child: Icon(Icons.credit_card, color: Color(0xFFFF5722), size: 20),
                          ),
                          title: Text(
                            TranslationStrings.tr('billingManagement', lang),
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          trailing: const Icon(Icons.chevron_right, size: 20),
                          onTap: () => appState.navigate(Screen.account),
                        ),
                      ],
                    ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // SECTION 2: SECURITY
                  Text(
                    TranslationStrings.tr('securitySetting', lang).toUpperCase(),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                      color: isDark ? Colors.grey[400] : Colors.grey[700],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: isDark ? surfaceCard : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[200]!),
                    ),
                    child: Material(
                      type: MaterialType.transparency,
                      child: Column(
                      children: [
                        ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Color(0x20FF5722),
                            child: Icon(Icons.lock_reset, color: Color(0xFFFF5722), size: 20),
                          ),
                          title: Text(
                            TranslationStrings.tr('changePin', lang),
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          trailing: const Icon(Icons.chevron_right, size: 20),
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  lang == 'ak'
                                      ? '၆ လုံး လျှို့ဝှက်ကုဒ် (PIN) အသစ် ပြောင်းလဲရန် ညွှန်ကြားချက် ပို့ပြီးပါပြီ'
                                      : 'Instructions sent to reset your 6-digit transaction PIN',
                                ),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                        ),
                        Divider(height: 1, color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100]),
                        ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Color(0x20FF5722),
                            child: Icon(Icons.verified_user, color: Color(0xFFFF5722), size: 20),
                          ),
                          title: Text(
                            TranslationStrings.tr('twoFactorAuth', lang),
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          trailing: GestureDetector(
                            onTap: () => appState.toggle2FA(),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: appState.twoFactorAuth
                                    ? Colors.red.withOpacity(0.15)
                                    : Colors.grey.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: appState.twoFactorAuth ? Colors.redAccent : Colors.grey,
                                ),
                              ),
                              child: Text(
                                appState.twoFactorAuth ? 'ON' : 'OFF',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                  color: appState.twoFactorAuth ? Colors.redAccent : Colors.grey,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // SECTION 3: LEGAL & POLICIES
                  Text(
                    (lang == 'ak' ? 'ဥပဒေနှင့် စည်းမျဉ်းများ' : 'Legal & Policies').toUpperCase(),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                      color: isDark ? Colors.grey[400] : Colors.grey[700],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: isDark ? surfaceCard : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[200]!),
                    ),
                    child: Material(
                      type: MaterialType.transparency,
                      child: Column(
                      children: [
                        ListTile(
                          leading: const Icon(Icons.description, color: gold, size: 20),
                          title: Text(
                            TranslationStrings.tr('legalTerms', lang),
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                          trailing: const Icon(Icons.chevron_right, size: 18),
                          onTap: () => _showPolicyDialog(
                            context,
                            TranslationStrings.tr('legalTerms', lang),
                            lang == 'ak'
                                ? 'ဖေ့သာသည် အာရက္ခပြည်သူများအတွက် ဖွဲ့စည်းတည်ထောင်ထားသော ဒစ်ဂျစ်တယ်ဘဏ္ဍာရေးကွန်ရက်ဖြစ်ပါသည်။ တရားဝင်ငွေကြေးမှာ အာရက္ခဒေါ်လာ (AKD) ဖြစ်ပြီး အမေရိကန်ဒေါ်လာနှင့် ရွှေအာမခံဘဏ္ဍာတိုက်ဖြင့် ကျောထောက်နောက်ခံပြုထားပါသည်။'
                                : 'Péthar is the institutional national financial technology infrastructure for Arakan. The official unit of account is the Arakan Dollar (AKD), pegged 1:1 against USD value reserves with double-entry cryptographic ledger.',
                          ),
                        ),
                        Divider(height: 1, color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100]),
                        ListTile(
                          leading: const Icon(Icons.shield, color: emeraldSuccess, size: 20),
                          title: Text(
                            TranslationStrings.tr('legalPrivacy', lang),
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                          trailing: const Icon(Icons.chevron_right, size: 18),
                          onTap: () => _showPolicyDialog(
                            context,
                            TranslationStrings.tr('legalPrivacy', lang),
                            lang == 'ak'
                                ? 'အသုံးပြုသူများ၏ ကိုယ်ရေးအချက်အလက်များကို AES-256 ဖြင့် စာဝှက်စနစ် ချိတ်ပိတ်ထားပြီး မည်သည့်ပြင်ပအဖွဲ့အစည်းထံသို့မျှ ရောင်းချပေါက်ကြားခြင်းမရှိစေရန် အာမခံပါသည်။'
                                : 'User identity records, phone numbers, and proofs are protected with AES-256-GCM encryption. Zero data is shared or sold to advertising brokers or external authorities.',
                          ),
                        ),
                        Divider(height: 1, color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100]),
                        ListTile(
                          leading: const Icon(Icons.help_outline, color: Colors.blueAccent, size: 20),
                          title: Text(
                            TranslationStrings.tr('legalGuidelines', lang),
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                          trailing: const Icon(Icons.chevron_right, size: 18),
                          onTap: () => _showPolicyDialog(
                            context,
                            TranslationStrings.tr('legalGuidelines', lang),
                            lang == 'ak'
                                ? 'သင်၏ ၆ လုံး လျှို့ဝှက် PIN ကို မည်သူ့ကိုမျှ မပြောပြပါနှင့်။ အရေးပေါ်အကျပ်အတည်းကြုံပါက Panic PIN (၉၉၉၉၉၉) ကို ရိုက်ထည့်နိုင်ပါသည်။'
                                : 'Never share your 6-digit PIN with anyone. In emergencies under duress, entering the Panic PIN (999999) displays a decoy balance of 25 AKD and sends a silent community alert.',
                          ),
                        ),
                        Divider(height: 1, color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100]),
                        ListTile(
                          leading: const Icon(Icons.trending_up, color: Colors.cyanAccent, size: 20),
                          title: Text(
                            TranslationStrings.tr('legalFxRates', lang),
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                          trailing: const Icon(Icons.chevron_right, size: 18),
                          onTap: () => _showPolicyDialog(
                            context,
                            TranslationStrings.tr('legalFxRates', lang),
                            '1.00 AKD = 1.00 USD\n1.00 AKD = 1.00 USDT\n1.00 AKD = 35.80 THB\n1.00 AKD = 4.72 MYR\n1.00 AKD = 1.34 SGD\n1.00 AKD = 0.92 EUR',
                          ),
                        ),
                        Divider(height: 1, color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100]),
                        ListTile(
                          leading: const Icon(Icons.mail_outline, color: gold, size: 20),
                          title: Text(
                            TranslationStrings.tr('supportContact', lang),
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                          trailing: const Icon(Icons.chevron_right, size: 18),
                          onTap: () => _showPolicyDialog(
                            context,
                            TranslationStrings.tr('supportContact', lang),
                            lang == 'ak'
                                ? 'တရားဝင် အကူအညီနှင့် သတင်းပို့ဆက်သွယ်ရန် -\n\n• Email: pethar-app@protonmail.com\n• Telegram: @petharsupport\n• Website: https://www.pethar.co.uk'
                                : 'For customer support, security disclosures, and official inquiries:\n\n• Email: pethar-app@protonmail.com\n• Telegram: @petharsupport\n• Website: https://www.pethar.co.uk',
                          ),
                        ),
                      ],
                    ),
                    ),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
