import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';
import '../widgets/firebase_auth_dialog.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String _subView = 'main'; // 'main' | 'personal_info' | 'app_settings' | 'privacy'
  bool _showAllProfileInfo = true;
  bool _faceIdEnabled = true;
  bool _biometricLoginEnabled = true;
  bool _hideInfoToggle = true;
  bool _showReceivingProfileToggle = true;
  bool _biometricConsentToggle = true;
  bool _photosAccessAllowed = true;

  final String _subdistrict = 'Sanam Bin Don Mueang, Bangkok 10210';
  final String _streetAddress = '6/64, Building C, Den Vibhavadi, Vibhavadi Rangsit Rd';

  void _showPassportEditModal(BuildContext context, bool isAk) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 78,
                    height: 108,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E3A8A),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'PASSPORT',
                          style: TextStyle(
                            color: Color(0xFFFDE68A),
                            fontSize: 8,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const Icon(Icons.public, color: Color(0xFFFDE68A), size: 32),
                        Container(
                          width: 18,
                          height: 8,
                          decoration: BoxDecoration(
                            border: Border.all(color: const Color(0xFFFDE68A)),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    width: 126,
                    height: 108,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0F9FF),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: emeraldSuccess, width: 2),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text(
                          'PASSPORT · VERIFIED',
                          style: TextStyle(
                            fontSize: 7,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF1E3A8A),
                          ),
                        ),
                        Text(
                          'MYAT SOE PAING\nNO: MJ310666\nDOB: 13 MAY 2003',
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                            height: 1.35,
                          ),
                        ),
                        Text(
                          'P<MMR<PAING<<MYAT<SOE<<<<',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 6,
                            color: Colors.black45,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Text(
                isAk ? 'ကိုယ်ရေးအချက်အလက် ပြင်ဆင်နည်း' : 'How to edit your personal information',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                isAk
                    ? 'ဤအချက်အလက်များသည် သင်၏ နိုင်ငံကူးလက်မှတ်မှ ဖြစ်ပါသည်။ ပြင်ဆင်လိုပါက Document Update စာမျက်နှာသို့ သွား၍ သင်၏ ပတ်စ်ပို့ကို စကင်ဖတ်ပေးပါ။'
                    : 'This info is from your passport. To edit it, please go to the Document Update page and scan your passport. Once approved, your details will be updated automatically.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, color: Colors.black54, height: 1.45),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Document Update scanner ready'),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF97316),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                    elevation: 0,
                  ),
                  child: Text(
                    isAk ? 'စာရွက်စာတမ်း အသစ်တင်ရန်' : 'Go to Document Update',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFF97316),
                    side: const BorderSide(color: Color(0xFFF97316)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                  ),
                  child: Text(
                    isAk ? 'ပိတ်မည်' : 'Close',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSignOutDialog(BuildContext context, AppState appState, bool isAk) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                isAk ? 'အကောင့်မှ ထွက်လိုပါသလား?' : 'Do you want to sign out?',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                isAk
                    ? 'နောက်တစ်ကြိမ် ဝန်ဆောင်မှုများကို အသုံးပြုလိုသည့်အခါ အကောင့်ပြန်လည်ဝင်ရောက်ရပါမည်။'
                    : "The next time you want to use our services, you'll have to sign in again.",
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: Colors.black54, height: 1.4),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 44,
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFFF97316),
                          side: const BorderSide(color: Color(0xFFF97316)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                        ),
                        child: Text(
                          isAk ? 'မထွက်ပါ' : 'Cancel',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: SizedBox(
                      height: 44,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          appState.navigate(Screen.home);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFF97316),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                          elevation: 0,
                        ),
                        child: Text(
                          isAk ? 'ထွက်မည်' : 'Sign Out',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPersonalInfoView(BuildContext context, AppState appState, bool isAk) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, color: Colors.black87, size: 28),
          onPressed: () => setState(() => _subView = 'main'),
        ),
        centerTitle: true,
        title: Text(
          isAk ? 'ပရိုဖိုင်' : 'Profile',
          style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 16),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 100),
        children: [
          Container(
            color: const Color(0xFFF1F2F4),
            padding: const EdgeInsets.symmetric(vertical: 28),
            child: Center(
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 46,
                    backgroundColor: Colors.white,
                    child: CircleAvatar(
                      radius: 42,
                      backgroundColor: const Color(0xFF0284C7),
                      child: Text(
                        appState.profile.name.isNotEmpty ? appState.profile.name[0] : 'M',
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.black12),
                      ),
                      child: const Icon(Icons.camera_alt_outlined, size: 16, color: Colors.black87),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isAk ? 'အချက်အလက်အားလုံး ဖော်ပြမည်' : 'Show all information',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.black87),
                ),
                Switch(
                  value: _showAllProfileInfo,
                  activeTrackColor: const Color(0xFF2563EB),
                  onChanged: (v) => setState(() => _showAllProfileInfo = v),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAk ? 'အခြေခံ အချက်အလက်' : 'Basic information',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.black87),
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.phone_outlined, size: 16, color: Colors.black45),
                        const SizedBox(width: 6),
                        Text(
                          isAk ? 'ဖုန်းနံပါတ်' : 'Mobile number',
                          style: const TextStyle(fontSize: 13, color: Colors.black54),
                        ),
                      ],
                    ),
                    Text(
                      _showAllProfileInfo ? '095-126-8295' : '095-***-8295',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isAk ? 'ကိုယ်ရေး အချက်အလက်' : 'Personal information',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.black87),
                    ),
                    GestureDetector(
                      onTap: () => _showPassportEditModal(context, isAk),
                      child: Text(
                        isAk ? 'ပြင်ဆင်ရန်' : 'Edit',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0284C7)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildInfoRow(isAk ? 'အမည်' : 'Name', 'MYAT SOE'),
                const SizedBox(height: 14),
                _buildInfoRow(isAk ? 'မျိုးရိုးအမည်' : 'Last name', 'PAING'),
                const SizedBox(height: 14),
                _buildInfoRow(
                  isAk ? 'နိုင်ငံကူးလက်မှတ် အမှတ်' : 'Passport number',
                  _showAllProfileInfo ? 'MJ310666' : 'MJ3***66',
                ),
                const SizedBox(height: 14),
                _buildInfoRow(
                  isAk ? 'မွေးသက္ကရာဇ်' : 'Date of birth',
                  _showAllProfileInfo ? '13 May 2003' : '** May 2003',
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isAk ? 'လက်ရှိ နေရပ်လိပ်စာ' : 'Current address',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.black87),
                    ),
                    Text(
                      isAk ? 'ပြင်ဆင်ရန်' : 'Edit',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0284C7)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildInfoRow('Subdistrict, district, province, postal code', _subdistrict),
                const SizedBox(height: 14),
                _buildInfoRow(isAk ? 'လိပ်စာ' : 'Address', _streetAddress),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          flex: 4,
          child: Text(label, style: const TextStyle(fontSize: 13, color: Colors.black54)),
        ),
        const SizedBox(width: 12),
        Expanded(
          flex: 5,
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.black87),
          ),
        ),
      ],
    );
  }

  Widget _buildAppSettingsView(BuildContext context, AppState appState, bool isAk) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, color: Colors.black87, size: 28),
          onPressed: () => setState(() => _subView = 'main'),
        ),
        centerTitle: true,
        title: Text(
          isAk ? 'အက်ပ် ဆက်တင်များ' : 'Application Settings',
          style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 16),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 10),
            child: Text(
              isAk ? 'အက်ပ် စိတ်ကြိုက်ပြင်ဆင်မှု' : 'Customize app',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.black54),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.language, color: Colors.black87),
                  title: Text(
                    isAk ? 'ဘာသာစကား' : 'Language',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
                  ),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        isAk ? 'ရခိုင်' : 'English',
                        style: const TextStyle(fontSize: 13, color: Colors.black54),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.chevron_right, color: Colors.black38),
                    ],
                  ),
                  onTap: () => appState.setLanguage(isAk ? 'en' : 'ak'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.notifications_none_rounded, color: Colors.black87),
                  title: Text(
                    isAk ? 'အသိပေးချက်များ' : 'Notification',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
                  ),
                  trailing: const Icon(Icons.chevron_right, color: Colors.black38),
                  onTap: () {},
                ),
                const Divider(height: 1),
                SwitchListTile(
                  secondary: const Icon(Icons.download_rounded, color: Colors.black87),
                  title: Text(
                    isAk ? 'ပြေစာ အလိုအလျောက် သိမ်းဆည်းမည်' : 'Auto-save receipt',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
                  ),
                  subtitle: Text(
                    isAk
                        ? 'ငွေလွှဲပြီးတိုင်း ပြေစာကို အလိုအလျောက် သိမ်းဆည်းပေးမည်'
                        : 'Allow automatic receipt saving after transfers and payments',
                    style: const TextStyle(fontSize: 12, color: Colors.black45),
                  ),
                  value: appState.autoSaveSlip,
                  activeTrackColor: const Color(0xFF2563EB),
                  onChanged: (_) => appState.toggleAutoSaveSlip(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrivacyView(BuildContext context, bool isAk) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, color: Colors.black87, size: 28),
          onPressed: () => setState(() => _subView = 'main'),
        ),
        centerTitle: true,
        title: Text(
          isAk ? 'ကိုယ်ရေးလုံခြုံမှု' : 'Privacy',
          style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 16),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: [
          const Padding(
            padding: EdgeInsets.only(left: 4, bottom: 8),
            child: Text('Manage display setting', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.black54)),
          ),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
            child: SwitchListTile(
              secondary: const Icon(Icons.password_rounded, color: Colors.black87),
              title: const Text('Hide information', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87)),
              subtitle: const Text('Example: ***-***-1234', style: TextStyle(fontSize: 12, color: Colors.black45)),
              value: _hideInfoToggle,
              activeTrackColor: const Color(0xFF3B82F6),
              onChanged: (v) => setState(() => _hideInfoToggle = v),
            ),
          ),
          const SizedBox(height: 18),
          const Padding(
            padding: EdgeInsets.only(left: 4, bottom: 8),
            child: Text('Manage receiving profile info', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.black54)),
          ),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
            child: Column(
              children: [
                const ListTile(
                  leading: Icon(Icons.storefront_outlined, color: Colors.black87),
                  title: Text('My Receiving Profile', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87)),
                  subtitle: Text('See More ›', style: TextStyle(fontSize: 12, color: Color(0xFF2563EB))),
                  trailing: Icon(Icons.chevron_right, color: Colors.black38),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  secondary: const Icon(Icons.local_offer_outlined, color: Colors.black87),
                  title: const Text('Show receiving profile info', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87)),
                  subtitle: const Text(
                    'Enable to show your account age & number of people who sent money to you on the transfer page.',
                    style: TextStyle(fontSize: 12, color: Colors.black45),
                  ),
                  value: _showReceivingProfileToggle,
                  activeTrackColor: const Color(0xFF3B82F6),
                  onChanged: (v) => setState(() => _showReceivingProfileToggle = v),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const Padding(
            padding: EdgeInsets.only(left: 4, bottom: 8),
            child: Text('Manage consents', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.black54)),
          ),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
            child: Column(
              children: [
                SwitchListTile(
                  secondary: const Icon(Icons.description_outlined, color: Colors.black87),
                  title: const Text(
                    'Allow Péthar to collect, process, and use your biometric data.',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
                  ),
                  subtitle: const Text('See More ›', style: TextStyle(fontSize: 12, color: Color(0xFF2563EB))),
                  value: _biometricConsentToggle,
                  activeTrackColor: const Color(0xFF3B82F6),
                  onChanged: (v) => setState(() => _biometricConsentToggle = v),
                ),
                const Divider(height: 1),
                const ListTile(
                  leading: Icon(Icons.description_outlined, color: Colors.black87),
                  title: Text('Services I consent to use my personal data', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.black87)),
                  trailing: Icon(Icons.chevron_right, color: Colors.black38),
                ),
                const Divider(height: 1),
                const ListTile(
                  leading: Icon(Icons.description_outlined, color: Colors.black87),
                  title: Text('Data use consent for analytics and marketing purposes', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.black87)),
                  trailing: Icon(Icons.chevron_right, color: Colors.black38),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const Padding(
            padding: EdgeInsets.only(left: 4, bottom: 8),
            child: Text('Manage access', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.black54)),
          ),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
            child: Column(
              children: [
                const ListTile(
                  leading: Icon(Icons.near_me_outlined, color: Colors.black87),
                  title: Text('Location', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.black87)),
                  trailing: Text('Only while usin... ›', style: TextStyle(fontSize: 13, color: Colors.black45)),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.photo_outlined, color: Colors.black87),
                  title: const Text('Photos', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.black87)),
                  trailing: Text(_photosAccessAllowed ? 'Allow ›' : 'Ask ›', style: const TextStyle(fontSize: 13, color: Colors.black45)),
                  onTap: () => setState(() => _photosAccessAllowed = !_photosAccessAllowed),
                ),
                const Divider(height: 1),
                const ListTile(
                  leading: Icon(Icons.contacts_outlined, color: Colors.black87),
                  title: Text('Contacts', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.black87)),
                  trailing: Text('Do not allow ›', style: TextStyle(fontSize: 13, color: Colors.black45)),
                ),
                const Divider(height: 1),
                const ListTile(
                  leading: Icon(Icons.mic_none_rounded, color: Colors.black87),
                  title: Text('Microphone', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.black87)),
                  trailing: Text('Do not allow ›', style: TextStyle(fontSize: 13, color: Colors.black45)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final lang = appState.language;
    final isAk = lang == 'ak';
    final isAndroid = Theme.of(context).platform == TargetPlatform.android;

    if (_subView == 'personal_info') {
      return _buildPersonalInfoView(context, appState, isAk);
    }
    if (_subView == 'app_settings') {
      return _buildAppSettingsView(context, appState, isAk);
    }
    if (_subView == 'privacy') {
      return _buildPrivacyView(context, isAk);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        centerTitle: true,
        title: Text(
          isAk ? 'ပရိုဖိုင်နှင့် ဆက်တင်' : 'Profile',
          style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 17),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 110),
        children: [
          // ── Top Profile Card (No Switch Account icon, No Show QR Code button) ──
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(26),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 20,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              children: [
                Center(
                  child: GestureDetector(
                    onTap: () => setState(() => _subView = 'personal_info'),
                    child: Stack(
                      children: [
                        const CircleAvatar(
                          radius: 38,
                          backgroundColor: Color(0xFF0288D1),
                          child: Icon(Icons.person, size: 44, color: Colors.white),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            width: 26,
                            height: 26,
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                            child: const Icon(Icons.edit, size: 13, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      appState.profile.name,
                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.black87),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Text(
                        'User',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.black54),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  appState.profile.email.isNotEmpty ? appState.profile.email : 'realjackhalder@gmail.com',
                  style: const TextStyle(fontSize: 13, color: Colors.black45),
                ),
                const SizedBox(height: 14),
                const Divider(height: 1),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          decoration: const BoxDecoration(
                            color: Color(0xFFECFDF5),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.verified_rounded, color: Color(0xFF10B981), size: 16),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          isAk ? 'မှတ်ပုံတင် အတည်ပြုချက်' : 'ID Verification',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.black87),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => appState.setVerified(!appState.isVerified),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                        decoration: BoxDecoration(
                          color: appState.isVerified ? const Color(0xFFECFDF5) : const Color(0xFFFFF1F2),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              appState.isVerified ? Icons.verified_rounded : Icons.error_outline_rounded,
                              size: 14,
                              color: appState.isVerified ? const Color(0xFF059669) : crimson,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              appState.isVerified ? 'Verified' : 'Unverified',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: appState.isVerified ? const Color(0xFF059669) : crimson,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // ── Wallet Settings (Dropped Supported QR Code & Credit/Debit Cards) ──
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 8),
            child: Text(
              isAk ? 'ပိုက်ဆံအိတ် ဆက်တင်များ' : 'Wallet Settings',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.black54),
            ),
          ),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
            child: Column(
              children: [
                _buildSettingTile(
                  icon: Icons.receipt_long_rounded,
                  title: isAk ? 'ငွေလွှဲ မှတ်တမ်းများ' : 'Transaction History',
                  onTap: () => appState.navigate(Screen.notifications),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // ── Security Settings (Change PIN + Face ID on iPhone / Biometric Login on Android) ──
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 8),
            child: Text(
              isAk ? 'လုံခြုံရေး ဆက်တင်များ' : 'Security Settings',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.black54),
            ),
          ),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
            child: Column(
              children: [
                _buildSettingTile(
                  icon: Icons.lock_outline_rounded,
                  title: isAk ? 'လျှို့ဝှက် PIN ပြောင်းရန်' : 'Change PIN',
                  subtitle: 'Last changed NA',
                  onTap: () {},
                ),
                const Divider(height: 1),
                if (isAndroid)
                  SwitchListTile(
                    secondary: const CircleAvatar(
                      backgroundColor: Color(0xFFF0FDFA),
                      child: Icon(Icons.fingerprint_rounded, color: Color(0xFF0D9488), size: 20),
                    ),
                    title: Text(
                      isAk ? 'လက်ဗွေဖြင့် ဝင်ရောက်မှု' : 'Biometric Login',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.black87),
                    ),
                    subtitle: Text(_biometricLoginEnabled ? 'Enabled' : 'Disabled', style: const TextStyle(fontSize: 12, color: Colors.black45)),
                    value: _biometricLoginEnabled,
                    activeTrackColor: const Color(0xFF10B981),
                    onChanged: (v) => setState(() => _biometricLoginEnabled = v),
                  )
                else
                  SwitchListTile(
                    secondary: const CircleAvatar(
                      backgroundColor: Color(0xFFF0FDFA),
                      child: Icon(Icons.vpn_key_outlined, color: Color(0xFF0D9488), size: 20),
                    ),
                    title: const Text('Face ID', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.black87)),
                    subtitle: Text(_faceIdEnabled ? 'Enabled' : 'Disabled', style: const TextStyle(fontSize: 12, color: Colors.black45)),
                    value: _faceIdEnabled,
                    activeTrackColor: const Color(0xFF10B981),
                    onChanged: (v) => setState(() => _faceIdEnabled = v),
                  ),
                const Divider(height: 1),
                _buildSettingTile(
                  icon: Icons.verified_user_outlined,
                  title: isAk ? 'နှစ်ဆင့်ခံ လုံခြုံရေး (2FA)' : 'Two Factor Authentication',
                  subtitle: appState.twoFactorAuth ? 'Enabled' : 'Disabled',
                  onTap: () => appState.toggle2FA(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // ── Account Settings (Dropped Dark Mode) ──
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 8),
            child: Text(
              isAk ? 'အကောင့် ဆက်တင်များ' : 'Account Settings',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.black54),
            ),
          ),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
            child: Column(
              children: [
                _buildSettingTile(
                  icon: Icons.person_outline_rounded,
                  title: isAk ? 'ကိုယ်ရေးအချက်အလက်နှင့် လိပ်စာ' : 'Personal Information',
                  onTap: () => setState(() => _subView = 'personal_info'),
                ),
                const Divider(height: 1),
                _buildSettingTile(
                  icon: Icons.settings_outlined,
                  title: isAk ? 'အက်ပ် ဆက်တင်များ' : 'Application Settings',
                  onTap: () => setState(() => _subView = 'app_settings'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFF0FDFA),
                    child: Icon(Icons.language_rounded, color: Color(0xFF0D9488), size: 20),
                  ),
                  title: Text(
                    isAk ? 'ဘာသာစကား' : 'Language',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.black87),
                  ),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        isAk ? 'ရခိုင်' : 'English',
                        style: const TextStyle(fontSize: 13, color: Colors.black54),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.chevron_right, color: Colors.black45),
                    ],
                  ),
                  onTap: () => appState.setLanguage(isAk ? 'en' : 'ak'),
                ),
                const Divider(height: 1),
                _buildSettingTile(
                  icon: Icons.support_agent_rounded,
                  title: isAk ? 'Péthar အကူအညီနှင့် ချက်တင်' : 'Chat with Support',
                  onTap: () => FirebaseAuthDialog.show(context, lang),
                ),
                const Divider(height: 1),
                _buildSettingTile(
                  icon: Icons.shield_outlined,
                  title: isAk ? 'စည်းကမ်းချက်နှင့် ကိုယ်ရေးလုံခြုံမှု' : 'TOS & Data Privacy',
                  onTap: () => setState(() => _subView = 'privacy'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // ── Bottom Log Out Button (Dropped Switch Account) ──
          SizedBox(
            width: double.infinity,
            height: 48,
            child: TextButton.icon(
              onPressed: () => _showSignOutDialog(context, appState, isAk),
              icon: const Icon(Icons.logout_rounded, size: 18, color: crimson),
              label: Text(
                isAk ? 'အကောင့်မှ ထွက်မည်' : 'Log Out',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: crimson),
              ),
              style: TextButton.styleFrom(
                backgroundColor: const Color(0xFFFDECEC),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Center(
            child: Text.rich(
              TextSpan(
                text: '©Péthar Super App - Version: ',
                style: TextStyle(fontSize: 12, color: Colors.black45, fontWeight: FontWeight.w500),
                children: [
                  TextSpan(
                    text: '3.3.2',
                    style: TextStyle(color: Color(0xFF2A8B9D), fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: const Color(0xFFF0FDFA),
        child: Icon(icon, color: const Color(0xFF0D9488), size: 20),
      ),
      title: Text(
        title,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.black87),
      ),
      subtitle: subtitle != null
          ? Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.black45))
          : null,
      trailing: const Icon(Icons.chevron_right, color: Colors.black45),
      onTap: onTap,
    );
  }
}
