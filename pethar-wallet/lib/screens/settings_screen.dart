import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../services/supabase_service.dart';
import '../theme.dart';
import '../widgets/arakan_emblem.dart';
import '../widgets/support_and_kyc_modals.dart';
import '../widgets/pin_keypad_screen.dart';
import '../services/native_security_service.dart';
import 'notifications_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String _subView = 'main';
  int _changePinStep = 0;
  String _tempOldPin = '';
  String _tempNewPin = '';
  int _forgotPinStep = 0;
  String _tempForgotNewPin = '';
  bool _isSubmittingForgotPin = false; // 'main' | 'personal_info' | 'app_settings' | 'privacy' | 'device_management' | 'pin_management' | 'change_pin' | 'forgot_pin'
  bool _showAllProfileInfo = true;
  bool _faceIdEnabled = true;
  bool _biometricLoginEnabled = true;
  bool _hideInfoToggle = true;
  bool _showReceivingProfileToggle = true;
  bool _biometricConsentToggle = true;
  bool _photosAccessAllowed = true;

  final _oldPinCtrl = TextEditingController();
  final _newPinCtrl = TextEditingController();
  final _confirmPinCtrl = TextEditingController();
  bool _showOldPin = false;
  bool _showNewPin = false;
  bool _showConfirmPin = false;
  String? _pinChangeError;
  String? _pinChangeSuccess;
  bool _isSubmittingPin = false;

  final _forgotOtpCtrl = TextEditingController();
  final _forgotNewPinCtrl = TextEditingController();
  final _forgotConfirmPinCtrl = TextEditingController();
  bool _showForgotNewPin = false;
  bool _showForgotConfirmPin = false;
  String? _forgotPinError;
  String? _forgotPinSuccess;
  Timer? _forgotOtpTimer;
  int _forgotOtpSecondsRemaining = 600; // 10 minutes

  String _streetAddress = '';

  @override
  void initState() {
    super.initState();
    _forgotOtpCtrl.addListener(_onForgotOtpChanged);
  }

  void _onForgotOtpChanged() {
    if (mounted) setState(() {});
  }

  void _startForgotOtpTimer() {
    _forgotOtpTimer?.cancel();
    _forgotOtpSecondsRemaining = 600;
    _forgotOtpTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_forgotOtpSecondsRemaining > 0) {
        setState(() => _forgotOtpSecondsRemaining--);
      } else {
        timer.cancel();
      }
    });
  }

  String _formatForgotOtpTimer(int totalSecs) {
    final m = (totalSecs ~/ 60).toString().padLeft(2, '0');
    final s = (totalSecs % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  void dispose() {
    _forgotOtpTimer?.cancel();
    _forgotOtpCtrl.removeListener(_onForgotOtpChanged);
    _oldPinCtrl.dispose();
    _newPinCtrl.dispose();
    _confirmPinCtrl.dispose();
    _forgotOtpCtrl.dispose();
    _forgotNewPinCtrl.dispose();
    _forgotConfirmPinCtrl.dispose();
    super.dispose();
  }

  void _showToast(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
        backgroundColor: const Color(0xFF1E293B),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE MUTATION & VERIFICATION MODALS
  // ═══════════════════════════════════════════════════════════════════════════

  ImageProvider? _buildAvatarImageProvider(String? avatarUrl) {
    if (avatarUrl == null || avatarUrl.trim().isEmpty) return null;
    final url = avatarUrl.trim();
    if (url.startsWith('data:image') || url.startsWith('data:application')) {
      try {
        final commaIdx = url.indexOf(',');
        final base64Str = commaIdx != -1 ? url.substring(commaIdx + 1) : url;
        return MemoryImage(base64Decode(base64Str));
      } catch (e) {
        debugPrint('Error decoding base64 avatar: $e');
        return null;
      }
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return NetworkImage(url);
    }
    if (!kIsWeb) {
      try {
        final file = File(url);
        if (file.existsSync()) {
          return FileImage(file);
        }
      } catch (_) {}
    }
    return null;
  }

  Future<void> _pickAvatarFromSource(
    BuildContext context,
    AppState appState,
    bool isAk,
    ImageSource source,
    BuildContext dialogCtx,
  ) async {
    try {
      final picker = ImagePicker();
      final XFile? picked = await picker.pickImage(
        source: source,
        maxWidth: 600,
        maxHeight: 600,
        imageQuality: 85,
      );
      if (picked != null) {
        final bytes = await picked.readAsBytes();
        final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';
        appState.profile.avatarUrl = base64Image;
        appState.notify();
        if (dialogCtx.mounted) Navigator.pop(dialogCtx);
        if (context.mounted) {
          _showToast(
            context,
            isAk ? 'ပရိုဖိုင်ဓာတ်ပုံ အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ' : 'Profile photo updated successfully!',
          );
        }
        try {
          await SupabaseService().updateAvatarUrl(
            profileId: appState.profile.uid,
            avatarUrl: base64Image,
          );
        } catch (_) {}
      }
    } catch (e) {
      debugPrint('Error picking avatar image: $e');
      if (context.mounted) _showToast(context, 'Unable to pick photo: $e');
    }
  }

  void _showEditAvatarModal(BuildContext context, AppState appState, bool isAk) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isAk ? 'ပရိုဖိုင်ပုံ ပြောင်းလဲရန်' : 'Change Profile Picture',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.close, size: 20, color: Color(0xFF71717A)),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Option 1: Choose from Gallery (Primary)
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () => _pickAvatarFromSource(context, appState, isAk, ImageSource.gallery, ctx),
                  icon: const Icon(Icons.photo_library_rounded, size: 20),
                  label: Text(
                    isAk ? 'ဖုန်းပြခန်းမှ ဓာတ်ပုံတင်မည်' : 'Upload from Phone Gallery',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Option 2: Take Photo with Camera
              SizedBox(
                width: double.infinity,
                height: 44,
                child: OutlinedButton.icon(
                  onPressed: () => _pickAvatarFromSource(context, appState, isAk, ImageSource.camera, ctx),
                  icon: const Icon(Icons.camera_alt_outlined, size: 18),
                  label: Text(
                    isAk ? 'ကင်မရာဖြင့် ဓာတ်ပုံရိုက်မည်' : 'Take a Photo',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF334155),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Cancel button
              SizedBox(
                width: double.infinity,
                height: 44,
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF64748B),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(
                    isAk ? 'ပယ်ဖျက်မည်' : 'Cancel',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showChangeEmailModal(BuildContext context, AppState appState, bool isAk) {
    final emailCtrl = TextEditingController();
    final otpCtrl = TextEditingController();
    int step = 1; // 1: request, 2: verify
    bool isLoading = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAk ? 'အီးမေးလ် ပြောင်းလဲရန်' : 'Change User Email',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
                ),
                const SizedBox(height: 12),
                Text(
                  isAk
                      ? 'လက်ရှိ အီးမေးလ်: ${appState.profile.email}'
                      : 'Current Email: ${appState.profile.email}',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF71717A)),
                ),
                const SizedBox(height: 14),
                if (step == 1) ...[
                  const Text('Enter New Email Address:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    decoration: InputDecoration(
                      hintText: 'e.g. newuser@email.com',
                      filled: true,
                      fillColor: const Color(0xFFF4F4F5),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: isLoading
                          ? null
                          : () async {
                              final newEmail = emailCtrl.text.trim();
                              if (newEmail.isEmpty || !newEmail.contains('@')) {
                                _showToast(context, 'Please enter a valid email address');
                                return;
                              }
                              setModalState(() => isLoading = true);
                              await SupabaseService().requestEmailChangeOtp(
                                profileId: appState.profile.uid,
                                newEmail: newEmail,
                              );
                              setModalState(() {
                                isLoading = false;
                                step = 2;
                              });
                            },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white),
                      child: isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Send Verification OTP', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF93C5FD)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.mark_email_read_outlined, size: 16, color: Color(0xFF1D4ED8)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'A 6-digit verification code has been sent to ${emailCtrl.text}',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text('Enter 6-digit OTP Code:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: otpCtrl,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 6),
                    textAlign: TextAlign.center,
                    decoration: InputDecoration(
                      counterText: '',
                      filled: true,
                      fillColor: const Color(0xFFF4F4F5),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: isLoading
                          ? null
                          : () async {
                              final code = otpCtrl.text.trim();
                              if (code.length != 6) {
                                _showToast(context, 'Please enter complete 6-digit OTP');
                                return;
                              }
                              setModalState(() => isLoading = true);
                              final res = await SupabaseService().verifyAndUpdateEmail(
                                profileId: appState.profile.uid,
                                newEmail: emailCtrl.text.trim(),
                                otpCode: code,
                              );
                              setModalState(() => isLoading = false);
                              if (res['success'] == true) {
                                appState.profile.email = emailCtrl.text.trim();
                                appState.notify();
                                if (ctx.mounted) Navigator.pop(ctx);
                                if (context.mounted) {
                                  _showToast(context, 'Email updated successfully to ${emailCtrl.text.trim()}');
                                }
                              } else {
                                if (context.mounted) {
                                  _showToast(context, res['message']?.toString() ?? 'OTP verification failed');
                                }
                              }
                            },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD91624), foregroundColor: Colors.white),
                      child: isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Verify & Update Email', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showChangePhoneModal(BuildContext context, AppState appState, bool isAk) {
    final phoneCtrl = TextEditingController();
    final otpCtrl = TextEditingController();
    int step = 1;
    bool isLoading = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAk ? 'ဖုန်းနံပါတ် ပြောင်းလဲရန်' : 'Change Phone Number',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
                ),
                const SizedBox(height: 12),
                Text(
                  'Current Phone: ${appState.profile.phone}\nSecurity code will be sent to registered email: ${appState.profile.email}',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF71717A), height: 1.4),
                ),
                const SizedBox(height: 14),
                if (step == 1) ...[
                  const Text('Enter New Phone Number:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: phoneCtrl,
                    keyboardType: TextInputType.phone,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    decoration: InputDecoration(
                      hintText: 'Enter phone number',
                      filled: true,
                      fillColor: const Color(0xFFF4F4F5),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: isLoading
                          ? null
                          : () async {
                              final newPhone = phoneCtrl.text.trim();
                              if (newPhone.length < 8) {
                                _showToast(context, 'Please enter a valid phone number');
                                return;
                              }
                              setModalState(() => isLoading = true);
                              await SupabaseService().requestPhoneChangeOtp(
                                profileId: appState.profile.uid,
                                newPhone: newPhone,
                              );
                              setModalState(() {
                                isLoading = false;
                                step = 2;
                              });
                            },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7), foregroundColor: Colors.white),
                      child: isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Send Email Verification OTP', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF93C5FD)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.mark_email_read_outlined, size: 16, color: Color(0xFF1D4ED8)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'A 6-digit verification code has been sent to your registered email: ${appState.profile.email}',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text('Enter 6-digit Email OTP:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: otpCtrl,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 6),
                    textAlign: TextAlign.center,
                    decoration: InputDecoration(
                      counterText: '',
                      filled: true,
                      fillColor: const Color(0xFFF4F4F5),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: isLoading
                          ? null
                          : () async {
                              final code = otpCtrl.text.trim();
                              if (code.length != 6) {
                                _showToast(context, 'Please enter complete 6-digit OTP');
                                return;
                              }
                              setModalState(() => isLoading = true);
                              final res = await SupabaseService().verifyAndUpdatePhone(
                                profileId: appState.profile.uid,
                                newPhone: phoneCtrl.text.trim(),
                                otpCode: code,
                              );
                              setModalState(() => isLoading = false);
                              if (res['success'] == true) {
                                appState.profile.phone = phoneCtrl.text.trim();
                                appState.notify();
                                if (ctx.mounted) Navigator.pop(ctx);
                                if (context.mounted) {
                                  _showToast(context, 'Phone number updated successfully to ${phoneCtrl.text.trim()}');
                                }
                              } else {
                                if (context.mounted) {
                                  _showToast(context, res['message']?.toString() ?? 'OTP verification failed');
                                }
                              }
                            },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD91624), foregroundColor: Colors.white),
                      child: isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Verify & Update Phone', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  void showChangePinModal(BuildContext context, AppState appState, bool isAk) {
    bool forgotMode = false;
    final currPinCtrl = TextEditingController();
    final newPinCtrl = TextEditingController();
    final confirmPinCtrl = TextEditingController();
    final otpCtrl = TextEditingController();
    bool isLoading = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  forgotMode ? 'Reset Forgotten PIN' : 'Change Security PIN',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
                ),
                const SizedBox(height: 14),
                if (!forgotMode) ...[
                  const Text('Enter Current PIN:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: currPinCtrl,
                    obscureText: true,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    decoration: InputDecoration(counterText: '', filled: true, fillColor: const Color(0xFFF4F4F5), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none)),
                  ),
                  const SizedBox(height: 10),
                  const Text('Enter New 6-Digit PIN:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: newPinCtrl,
                    obscureText: true,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    decoration: InputDecoration(counterText: '', filled: true, fillColor: const Color(0xFFF4F4F5), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none)),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      GestureDetector(
                        onTap: () async {
                          setModalState(() => isLoading = true);
                          await SupabaseService().requestPinResetOtp(profileId: appState.profile.uid);
                          setModalState(() {
                            isLoading = false;
                            forgotMode = true;
                          });
                        },
                        child: const Text('Forgot PIN? Reset with Email OTP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: isLoading
                          ? null
                          : () async {
                              final curr = currPinCtrl.text.trim();
                              final np = newPinCtrl.text.trim();
                              if (curr.length < 4 || np.length != 6) {
                                _showToast(context, 'Please enter current PIN and new 6-digit PIN');
                                return;
                              }
                              setModalState(() => isLoading = true);
                              final res = await SupabaseService().setUserPin(currentPin: curr, newPin: np);
                              setModalState(() => isLoading = false);
                              if (res['success'] == true) {
                                appState.profile.pin = np;
                                if (ctx.mounted) Navigator.pop(ctx);
                                if (context.mounted) {
                                  _showToast(context, 'Security PIN updated successfully');
                                }
                              } else {
                                if (context.mounted) {
                                  _showToast(context, res['message']?.toString() ?? 'Incorrect current PIN');
                                }
                              }
                            },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white),
                      child: const Text('Update PIN', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFF93C5FD))),
                    child: Text('A 6-digit reset code has been sent to your registered email: ${appState.profile.email}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF))),
                  ),
                  const SizedBox(height: 12),
                  const Text('Enter 6-digit Email OTP:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(controller: otpCtrl, keyboardType: TextInputType.number, maxLength: 6, textAlign: TextAlign.center, decoration: InputDecoration(counterText: '', filled: true, fillColor: const Color(0xFFF4F4F5), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
                  const SizedBox(height: 10),
                  const Text('Enter New 6-Digit PIN:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(controller: confirmPinCtrl, obscureText: true, keyboardType: TextInputType.number, maxLength: 6, decoration: InputDecoration(counterText: '', filled: true, fillColor: const Color(0xFFF4F4F5), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: isLoading
                          ? null
                          : () async {
                              final otp = otpCtrl.text.trim();
                              final np = confirmPinCtrl.text.trim();
                              if (otp.length != 6 || np.length != 6) {
                                _showToast(context, 'Enter 6-digit OTP and new 6-digit PIN');
                                return;
                              }
                              setModalState(() => isLoading = true);
                              final res = await SupabaseService().verifyAndResetPin(profileId: appState.profile.uid, otpCode: otp, newPin: np);
                              setModalState(() => isLoading = false);
                              if (res['success'] == true) {
                                appState.profile.pin = np;
                                if (ctx.mounted) Navigator.pop(ctx);
                                if (context.mounted) {
                                  _showToast(context, 'Security PIN reset successfully');
                                }
                              } else {
                                if (context.mounted) {
                                  _showToast(context, res['message']?.toString() ?? 'PIN reset failed');
                                }
                              }
                            },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD91624), foregroundColor: Colors.white),
                      child: const Text('Verify OTP & Reset PIN', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showChangeNameModal(BuildContext context, AppState appState, bool isAk) {
    final firstCtrl = TextEditingController(text: appState.profile.firstName);
    final lastCtrl = TextEditingController(text: appState.profile.lastName);
    final reasonCtrl = TextEditingController();
    final otpCtrl = TextEditingController();
    int step = 1;
    bool isLoading = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAk ? 'တရားဝင်အမည် ပြင်ဆင်ရန်' : 'Edit Full Name',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
                ),
                const SizedBox(height: 10),
                const Text('First name and Last name changes require administrative compliance review and verified email OTP.', style: TextStyle(fontSize: 11, color: Color(0xFF71717A), height: 1.4)),
                const SizedBox(height: 14),
                if (step == 1) ...[
                  const Text('First Name:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(controller: firstCtrl, decoration: InputDecoration(filled: true, fillColor: const Color(0xFFF4F4F5), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
                  const SizedBox(height: 10),
                  const Text('Last Name:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(controller: lastCtrl, decoration: InputDecoration(filled: true, fillColor: const Color(0xFFF4F4F5), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
                  const SizedBox(height: 10),
                  const Text('Reason for Update:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(controller: reasonCtrl, decoration: InputDecoration(hintText: 'e.g. Passport/National ID correction', filled: true, fillColor: const Color(0xFFF4F4F5), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: isLoading
                          ? null
                          : () async {
                              final fn = firstCtrl.text.trim();
                              final ln = lastCtrl.text.trim();
                              if (fn.isEmpty) {
                                _showToast(context, 'First name cannot be empty');
                                return;
                              }
                              setModalState(() => isLoading = true);
                              await SupabaseService().requestNameChangeOtp(profileId: appState.profile.uid, firstName: fn, lastName: ln, reason: reasonCtrl.text.trim());
                              setModalState(() {
                                isLoading = false;
                                step = 2;
                              });
                            },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7C3AED), foregroundColor: Colors.white),
                      child: const Text('Send Verification OTP', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFF93C5FD))),
                    child: Text('A 6-digit verification code has been sent to your registered email: ${appState.profile.email}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF))),
                  ),
                  const SizedBox(height: 12),
                  const Text('Enter 6-digit Email OTP to Confirm & Submit for Review:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(controller: otpCtrl, keyboardType: TextInputType.number, maxLength: 6, textAlign: TextAlign.center, decoration: InputDecoration(counterText: '', filled: true, fillColor: const Color(0xFFF4F4F5), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: isLoading
                          ? null
                          : () async {
                              final otp = otpCtrl.text.trim();
                              if (otp.length != 6) {
                                _showToast(context, 'Enter 6-digit OTP code');
                                return;
                              }
                              setModalState(() => isLoading = true);
                              final fn = firstCtrl.text.trim();
                              final ln = lastCtrl.text.trim();
                              final newFullName = '$fn $ln'.trim();
                              if (appState.profile.nickname.trim().isEmpty ||
                                  appState.profile.nickname.trim() == appState.profile.name.trim() ||
                                  appState.profile.nickname.trim() == appState.profile.effectiveFullName) {
                                appState.profile.nickname = '';
                              }
                              appState.profile.firstName = fn;
                              appState.profile.lastName = ln;
                              appState.profile.name = newFullName;
                              await SupabaseService().verifyAndSubmitNameChange(
                                profileId: appState.profile.uid,
                                firstName: fn,
                                lastName: ln,
                                otpCode: otp,
                                reason: reasonCtrl.text.trim(),
                              );
                              appState.notify();
                              setModalState(() => isLoading = false);
                              if (ctx.mounted) Navigator.pop(ctx);
                              if (context.mounted) {
                                _showToast(context, 'Name change submitted for administrative review (Status: PENDING_REVIEW)');
                              }
                            },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD91624), foregroundColor: Colors.white),
                      child: const Text('Submit Request for Review', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showEditNicknameModal(BuildContext context, AppState appState, bool isAk) {
    final nickCtrl = TextEditingController(text: appState.profile.effectiveNickname);
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAk ? 'အမည်ပြောင် ပြင်ဆင်ရန်' : 'Edit Nickname',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
              ),
              const SizedBox(height: 14),
              Text(
                isAk ? 'အမည်ပြောင်:' : 'Nickname:',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF71717A)),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: nickCtrl,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                decoration: InputDecoration(
                  hintText: isAk ? 'အမည်ပြောင် ထည့်ပါ' : 'Enter nickname',
                  filled: true,
                  fillColor: const Color(0xFFF4F4F5),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: Text(isAk ? 'မလုပ်တော့ပါ' : 'Cancel'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () async {
                        final nick = nickCtrl.text.trim();
                        appState.profile.nickname = nick;
                        await SupabaseService().updateNickname(profileId: appState.profile.uid, nickname: nick);
                        appState.notify();
                        if (ctx.mounted) Navigator.pop(ctx);
                        if (context.mounted) {
                          _showToast(context, isAk ? 'အမည်ပြောင် ပြင်ဆင်ပြီးပါပြီ' : 'Nickname updated to ${appState.profile.effectiveNickname}');
                        }
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7), foregroundColor: Colors.white),
                      child: Text(isAk ? 'သိမ်းမည်' : 'Save'),
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

  void _showEditAddressModal(BuildContext context, AppState appState, bool isAk) {
    final addrCtrl = TextEditingController(text: appState.profile.address.isNotEmpty ? appState.profile.address : _streetAddress);

    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAk ? 'လက်ရှိ နေရပ်လိပ်စာ ပြင်ဆင်ရန်' : 'Edit My Address',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
              ),
              const SizedBox(height: 16),
              const Text(
                'Full Residential Address',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF71717A)),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: addrCtrl,
                maxLines: 3,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF18181B)),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFFF4F4F5),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF3F3F46),
                        side: const BorderSide(color: Color(0xFFD4D4D8)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                      ),
                      child: const Text('Cancel', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () async {
                        final newAddr = addrCtrl.text.trim();
                        setState(() => _streetAddress = newAddr);
                        appState.profile.address = newAddr;
                        await SupabaseService().updateAddress(profileId: appState.profile.uid, address: newAddr);
                        appState.notify();
                        if (ctx.mounted) Navigator.pop(ctx);
                        if (context.mounted) {
                          _showToast(context, 'Address updated successfully');
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: crimson,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                      ),
                      child: const Text('Save Address', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
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

  void _showEditGenderModal(BuildContext context, AppState appState, bool isAk) {
    final genders = ['Male', 'Female', 'Other'];
    String selected = appState.profile.gender.isNotEmpty ? appState.profile.gender : 'Male';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAk ? 'ကျား/မ ရွေးချယ်ရန်' : 'Select Gender',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
                ),
                const SizedBox(height: 16),
                ...genders.map((g) {
                  final isSelected = selected == g;
                  return InkWell(
                    onTap: () => setModalState(() => selected = g),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFFEFF6FF) : const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
                          width: 1.5,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            g,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected ? const Color(0xFF1E40AF) : const Color(0xFF334155),
                            ),
                          ),
                          if (isSelected)
                            const Icon(Icons.check_circle_rounded, color: Color(0xFF2563EB), size: 20),
                        ],
                      ),
                    ),
                  );
                }).toList(),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx),
                        style: OutlinedButton.styleFrom(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('Cancel'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () async {
                          appState.profile.gender = selected;
                          appState.notify();
                          Navigator.pop(ctx);
                          _showToast(context, isAk ? 'ကျား/မ ပြင်ဆင်ပြီးပါပြီ' : 'Gender updated successfully');
                          try {
                            await SupabaseService.client
                                .from('user_profiles')
                                .update({'gender': selected})
                                .eq('id', appState.profile.uid);
                          } catch (_) {}
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('Save'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showEditIdTypeModal(BuildContext context, AppState appState, bool isAk) {
    final idTypes = ['National ID', 'Passport', 'Citizenship Card', 'Driver\'s License'];
    String selected = appState.profile.idType.isNotEmpty ? appState.profile.idType : 'National ID';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAk ? 'သက်သေခံကတ် အမျိုးအစား' : 'Select ID Type',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
                ),
                const SizedBox(height: 16),
                ...idTypes.map((t) {
                  final isSelected = selected == t;
                  return InkWell(
                    onTap: () => setModalState(() => selected = t),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFFEFF6FF) : const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
                          width: 1.5,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            t,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected ? const Color(0xFF1E40AF) : const Color(0xFF334155),
                            ),
                          ),
                          if (isSelected)
                            const Icon(Icons.check_circle_rounded, color: Color(0xFF2563EB), size: 20),
                        ],
                      ),
                    ),
                  );
                }).toList(),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx),
                        style: OutlinedButton.styleFrom(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('Cancel'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () async {
                          appState.profile.idType = selected;
                          appState.notify();
                          Navigator.pop(ctx);
                          _showToast(context, isAk ? 'အမျိုးအစား ပြင်ဆင်ပြီးပါပြီ' : 'ID Type updated successfully');
                          try {
                            await SupabaseService.client
                                .from('user_profiles')
                                .update({'id_type': selected})
                                .eq('id', appState.profile.uid);
                          } catch (_) {}
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('Save'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showEditIdNumberModal(BuildContext context, AppState appState, bool isAk) {
    final ctrl = TextEditingController(text: appState.profile.nationalIdNo);
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAk ? 'သက်သေခံကတ် အမှတ် ပြင်ဆင်ရန်' : 'Edit ID Number',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: ctrl,
                decoration: InputDecoration(
                  labelText: isAk ? 'ကတ်နံပါတ်' : 'ID Number',
                  hintText: 'Enter National ID or Passport number',
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () async {
                        final val = ctrl.text.trim();
                        if (val.isEmpty) return;
                        appState.profile.nationalIdNo = val;
                        appState.notify();
                        Navigator.pop(ctx);
                        _showToast(context, isAk ? 'ကတ်နံပါတ် ပြင်ဆင်ပြီးပါပြီ' : 'ID Number updated successfully');
                        try {
                          await SupabaseService.client
                              .from('user_profiles')
                              .update({'national_id_no': val})
                              .eq('id', appState.profile.uid);
                        } catch (_) {}
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Save'),
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

  Future<void> _showDatePickerModal(BuildContext context, AppState appState, bool isAk) async {
    DateTime initial = DateTime(1998, 5, 14);
    if (appState.profile.dob.isNotEmpty) {
      try {
        final parsed = DateTime.parse(appState.profile.dob);
        initial = parsed;
      } catch (_) {}
    }
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1920),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF2563EB),
              onPrimary: Colors.white,
              onSurface: Color(0xFF1E293B),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      final formatted = '${picked.year.toString().padLeft(4, '0')}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
      appState.profile.dob = formatted;
      appState.notify();
      if (context.mounted) {
        _showToast(context, isAk ? 'မွေးသက္ကရာဇ် ပြင်ဆင်ပြီးပါပြီ' : 'Date of Birth updated successfully');
      }
      try {
        await SupabaseService.client
            .from('user_profiles')
            .update({'dob': formatted})
            .eq('id', appState.profile.uid);
      } catch (_) {}
    }
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
                          foregroundColor: const Color(0xFF64748B),
                          side: const BorderSide(color: Color(0xFFCBD5E1)),
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
                        onPressed: () async {
                          Navigator.pop(ctx);
                          await appState.signOut();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFD91624),
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


  Widget _buildDeviceManagementView(BuildContext context, AppState appState, bool isAk, bool isAndroid) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, color: Colors.black87, size: 28),
          onPressed: () => setState(() => _subView = 'main'),
        ),
        centerTitle: true,
        title: Text(
          isAk ? 'စက်ပစ္စည်း စီမံခန့်ခွဲမှု' : 'Device Management',
          style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 16),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 8),
            child: Text(
              isAk ? 'လက်ရှိ အသုံးပြုနေသော စက်' : 'Current device',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B)),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE4E4E7)),
            ),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.smartphone_rounded, color: Color(0xFF71717A), size: 22),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isAndroid ? 'Android Device' : 'iOS Device',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF18181B)),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              const Icon(Icons.access_time_rounded, size: 13, color: Color(0xFF71717A)),
                              const SizedBox(width: 6),
                              Text(
                                isAk ? 'လက်ရှိ အသုံးပြုနေသော အကောင့်' : 'Current Active Session',
                                style: const TextStyle(fontSize: 12, color: Color(0xFF71717A)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.verified_user_outlined, size: 13, color: Color(0xFF71717A)),
                              const SizedBox(width: 6),
                              Text(
                                appState.profile.email.isNotEmpty ? appState.profile.email : '—',
                                style: const TextStyle(fontSize: 12, color: Color(0xFF71717A)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.fingerprint_rounded, size: 13, color: Color(0xFFD91624)),
                              const SizedBox(width: 6),
                              Text(
                                (isAndroid ? _biometricLoginEnabled : _faceIdEnabled)
                                    ? (isAk ? 'လက်ဗွေ စက်ပစ္စည်းတွင် အသုံးပြုနေသည်' : 'Biometrics Active & Enrolled')
                                    : (isAk ? 'လက်ဗွေ ပိတ်ထားပါသည်' : 'Biometrics Not Enrolled'),
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFD91624)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: GestureDetector(
                    onTap: () => _showSignOutDialog(context, appState, isAk),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          isAk ? 'အကောင့်ထွက်မည်' : 'Sign Out',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF2563EB)),
                        ),
                        const Icon(Icons.chevron_right_rounded, size: 16, color: Color(0xFF2563EB)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 8),
            child: Text(
              isAk ? 'အခြားစက်များမှ ဝင်ရောက်ထားမှု' : 'Active sign-in from other devices',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF52525B)),
            ),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 44, horizontal: 24),
            child: Column(
              children: [
                Icon(Icons.smartphone_rounded, size: 28, color: Color(0xFFD4D4D8)),
                SizedBox(height: 8),
                Text(
                  "No other devices are currently signed in. We'll notify you immediately and display the details here if we detect any new sign-in activity.",
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: Color(0xFFA1A1AA), height: 1.45),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalInfoView(BuildContext context, AppState appState, bool isAk) {
    final p = appState.profile;
    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, color: Colors.black87, size: 28),
          onPressed: () => setState(() => _subView = 'main'),
        ),
        centerTitle: true,
        title: Text(
          isAk ? 'ကျွန်ုပ်၏ ပရိုဖိုင်' : 'My Profile',
          style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 16),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 28),
        children: [
          // ── TOP AVATAR & HEADER SECTION ─────────────────────────────
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
            child: Column(
              children: [
                Center(
                  child: Stack(
                    children: [
                      CircleAvatar(
                        radius: 48,
                        backgroundColor: const Color(0xFFE2E8F0),
                        child: CircleAvatar(
                          radius: 45,
                          backgroundColor: const Color(0xFF0284C7),
                          backgroundImage: _buildAvatarImageProvider(p.avatarUrl),
                          child: (p.avatarUrl == null || p.avatarUrl!.isEmpty)
                              ? Text(
                                  p.effectiveNickname.isNotEmpty
                                      ? p.effectiveNickname[0].toUpperCase()
                                      : 'U',
                                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
                                )
                              : null,
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: GestureDetector(
                          onTap: () => _showEditAvatarModal(context, appState, isAk),
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: const Color(0xFF0284C7),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.15),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: const Icon(Icons.camera_alt, size: 16, color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                // User Nick Name (Tap to edit with >, no verified mark, no edit button)
                GestureDetector(
                  onTap: () => _showEditNicknameModal(context, appState, isAk),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        p.effectiveNickname,
                        style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800, color: Color(0xFF18181B)),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.chevron_right, size: 20, color: Color(0xFF64748B)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── MASKING / VISIBILITY TOGGLE ─────────────────────────────
          Container(
            color: Colors.white,
            margin: const EdgeInsets.only(top: 1),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      _showAllProfileInfo ? Icons.visibility : Icons.visibility_off,
                      size: 18,
                      color: const Color(0xFF64748B),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      isAk ? 'အချက်အလက်အားလုံး ဖော်ပြမည်' : 'Show sensitive details',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                    ),
                  ],
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

          // ── PROFILE DETAILS CARD (10 REQUESTED FIELDS, NO BALANCES, NO BADGES) ──
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
            child: Column(
              children: [
                // 1. Full Name (tappable to edit, has >)
                _buildProfileDetailRow(
                  label: 'Full Name',
                  value: p.effectiveFullName,
                  onTap: () => _showChangeNameModal(context, appState, isAk),
                  actionIcon: Icons.chevron_right,
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),

                // 2. username (click to copy, NO copy button, NO >)
                _buildProfileDetailRow(
                  label: 'username',
                  value: p.username.isNotEmpty ? p.username : 'user',
                  onTap: () {
                    final uname = p.username.isNotEmpty ? p.username : 'user';
                    Clipboard.setData(ClipboardData(text: uname));
                    _showToast(context, isAk ? 'အသုံးပြုသူအမည် ကူးယူပြီးပါပြီ' : 'Username copied to clipboard');
                  },
                  actionIcon: null,
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),

                // 3. Wallet Address (click to copy, NO copy button, NO >)
                _buildProfileDetailRow(
                  label: 'Wallet Address',
                  value: _showAllProfileInfo
                      ? (p.walletAddress.isNotEmpty ? p.walletAddress : p.uid)
                      : _truncateAddress(p.walletAddress.isNotEmpty ? p.walletAddress : p.uid),
                  onTap: () {
                    final addr = p.walletAddress.isNotEmpty ? p.walletAddress : p.uid;
                    Clipboard.setData(ClipboardData(text: addr));
                    _showToast(context, isAk ? 'ပိုက်ဆံအိတ်လိပ်စာ ကူးယူပြီးပါပြီ' : 'Wallet address copied to clipboard');
                  },
                  actionIcon: null,
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),

                // 4. Email (tappable to edit, has >)
                _buildProfileDetailRow(
                  label: 'Email',
                  value: _showAllProfileInfo
                      ? (p.email.isNotEmpty ? p.email : '—')
                      : _maskEmail(p.email.isNotEmpty ? p.email : '—'),
                  onTap: () => _showChangeEmailModal(context, appState, isAk),
                  actionIcon: Icons.chevron_right,
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),

                // 5. Mobile No (tappable to edit, has >)
                _buildProfileDetailRow(
                  label: 'Mobile No',
                  value: p.phone.isNotEmpty
                      ? (_showAllProfileInfo ? p.phone : _maskPhone(p.phone))
                      : (isAk ? 'ထည့်သွင်းထားခြင်း မရှိပါ' : 'Not Set'),
                  onTap: () => _showChangePhoneModal(context, appState, isAk),
                  actionIcon: Icons.chevron_right,
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),

                // 6. Gender (tappable to edit, has >)
                _buildProfileDetailRow(
                  label: 'Gender',
                  value: p.gender.isNotEmpty ? p.gender : 'Male',
                  onTap: () => _showEditGenderModal(context, appState, isAk),
                  actionIcon: Icons.chevron_right,
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),

                // 7. ID Type (tappable to edit, has >)
                _buildProfileDetailRow(
                  label: 'ID Type',
                  value: p.idType.isNotEmpty ? p.idType : 'National ID',
                  onTap: () => _showEditIdTypeModal(context, appState, isAk),
                  actionIcon: Icons.chevron_right,
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),

                // 8. ID Number (tappable to edit, has >)
                _buildProfileDetailRow(
                  label: 'ID Number',
                  value: _showAllProfileInfo
                      ? (p.nationalIdNo.isNotEmpty ? p.nationalIdNo : '---')
                      : '••••••••',
                  onTap: () => _showEditIdNumberModal(context, appState, isAk),
                  actionIcon: Icons.chevron_right,
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),

                // 9. Date of Birth (tappable to edit, has >)
                _buildProfileDetailRow(
                  label: 'Date of Birth',
                  value: _showAllProfileInfo
                      ? (p.dob.isNotEmpty ? p.dob : '---')
                      : '••••-••-••',
                  onTap: () => _showDatePickerModal(context, appState, isAk),
                  actionIcon: Icons.chevron_right,
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),

                // 10. My Address (tappable to edit, has >)
                _buildProfileDetailRow(
                  label: 'My Address',
                  value: p.address.isNotEmpty
                      ? p.address
                      : (_streetAddress.isNotEmpty ? _streetAddress : (isAk ? 'လိပ်စာ ထည့်သွင်းထားခြင်း မရှိပါ' : 'Not Set')),
                  onTap: () => _showEditAddressModal(context, appState, isAk),
                  actionIcon: Icons.chevron_right,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileDetailRow({
    required String label,
    required String value,
    VoidCallback? onTap,
    IconData? actionIcon,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              flex: 4,
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              flex: 6,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Flexible(
                    child: Text(
                      value,
                      textAlign: TextAlign.right,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ),
                  if (actionIcon != null) ...[
                    const SizedBox(width: 6),
                    Icon(actionIcon, size: 14, color: const Color(0xFF2563EB)),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _truncateAddress(String addr) {
    if (addr.length <= 12) return addr;
    return '${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}';
  }

  String _maskEmail(String email) {
    if (!email.contains('@')) return '••••••••';
    final parts = email.split('@');
    final name = parts[0];
    final domain = parts[1];
    if (name.length <= 2) {
      return '${name[0]}••••@$domain';
    }
    return '${name.substring(0, 2)}••••@$domain';
  }

  String _maskPhone(String phone) {
    if (phone.length <= 5) return '••••••';
    final start = phone.length > 7 ? phone.substring(0, 5) : phone.substring(0, 3);
    final end = phone.substring(phone.length - 3);
    return '$start •••• $end';
  }

  Widget _buildAppSettingsView(BuildContext context, AppState appState, bool isAk) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
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
                        isAk ? 'အာရက္ခ' : 'English',
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
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const NotificationsScreen(),
                      ),
                    );
                  },
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
        elevation: 0,
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
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
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
              subtitle: const Text('Mask account numbers on screen', style: TextStyle(fontSize: 12, color: Colors.black45)),
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

  Widget _buildPinManagementView(BuildContext context, bool isAk) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, color: Colors.black87, size: 28),
          onPressed: () => setState(() => _subView = 'main'),
        ),
        centerTitle: true,
        title: Text(
          isAk ? 'PIN စီမံခန့်ခွဲမှု' : 'PIN Management',
          style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 16),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 2)),
              ],
            ),
            child: Column(
              children: [
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  title: Text(
                    isAk ? 'PIN ပြောင်းလဲရန်' : 'Change PIN',
                    style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600, color: Colors.black87),
                  ),
                  trailing: const Icon(Icons.chevron_right, color: Colors.black38, size: 20),
                  onTap: () {
                    _oldPinCtrl.clear();
                    _newPinCtrl.clear();
                    _confirmPinCtrl.clear();
                    setState(() {
                      _showOldPin = false;
                      _showNewPin = false;
                      _showConfirmPin = false;
                      _pinChangeError = null;
                      _pinChangeSuccess = null;
                      _changePinStep = 0;
                      _tempOldPin = '';
                      _tempNewPin = '';
                      _pinChangeError = null;
                      _subView = 'change_pin';
                    });
                  },
                ),
                const Divider(height: 1, indent: 16, endIndent: 16, color: Color(0xFFF1F5F9)),
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  title: Text(
                    isAk ? 'PIN မေ့သွားပါသလား' : 'Forget PIN',
                    style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600, color: Colors.black87),
                  ),
                  trailing: const Icon(Icons.chevron_right, color: Colors.black38, size: 20),
                  onTap: () async {
                    final appState = Provider.of<AppState>(context, listen: false);
                    _forgotOtpCtrl.clear();
                    _forgotNewPinCtrl.clear();
                    _forgotConfirmPinCtrl.clear();
                    setState(() {
                      _showForgotNewPin = false;
                      _showForgotConfirmPin = false;
                      _forgotPinError = null;
                      _forgotPinSuccess = null;
                      _forgotPinStep = 0;
                      _tempForgotNewPin = '';
                      _subView = 'forgot_pin';
                    });
                    _startForgotOtpTimer();
                    final res = await SupabaseService().requestPinResetOtp(profileId: appState.profile.uid);
                    if (!mounted) return;
                    if (res['success'] != true) {
                      _forgotOtpTimer?.cancel();
                      setState(() {
                        _forgotPinError = res['message']?.toString() ??
                            (isAk ? 'OTP ကုဒ် ပို့ခြင်း မအောင်မြင်ပါ' : 'Could not send the OTP. Please try again.');
                      });
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChangePinView(BuildContext context, AppState appState, bool isAk) {
    if (_changePinStep == 0) {
      return PinKeypadScreen(
        title: isAk ? 'ယခင် PIN ရိုက်ထည့်ပါ' : 'Enter Old PIN',
        subtitle: isAk ? 'ဆက်လက်ဆောင်ရွက်ရန် ယခင် PIN နံပါတ် ၆ လုံး ရိုက်ထည့်ပါ' : 'Enter your current 6-digit PIN',
        isAk: isAk,
        errorMessage: _pinChangeError,
        isLoading: _isSubmittingPin,
        showBiometrics: false,
        onBack: () => setState(() {
          _pinChangeError = null;
          _subView = 'pin_management';
        }),
        onPinCompleted: (pin) {
          final currentPin = appState.profile.pin;
          if (currentPin.isNotEmpty && pin != currentPin) {
            setState(() {
              _pinChangeError = isAk ? 'ယခင် PIN နံပါတ် မှားယွင်းနေပါသည်' : 'Incorrect Old PIN. Please try again.';
            });
          } else {
            setState(() {
              _tempOldPin = pin;
              _changePinStep = 1;
              _pinChangeError = null;
            });
          }
        },
      );
    } else if (_changePinStep == 1) {
      return PinKeypadScreen(
        title: isAk ? 'PIN အသစ် သတ်မှတ်ပါ' : 'Create New PIN',
        subtitle: isAk ? 'ဂဏန်း ၆ လုံးပါသော PIN အသစ် ရိုက်ထည့်ပါ' : 'Enter a new 6-digit PIN',
        isAk: isAk,
        errorMessage: _pinChangeError,
        isLoading: _isSubmittingPin,
        showBiometrics: false,
        onBack: () => setState(() {
          _changePinStep = 0;
          _pinChangeError = null;
        }),
        onPinCompleted: (pin) {
          setState(() {
            _tempNewPin = pin;
            _changePinStep = 2;
            _pinChangeError = null;
          });
        },
      );
    } else {
      return PinKeypadScreen(
        title: isAk ? 'PIN အသစ် ထပ်မံအတည်ပြုပါ' : 'Confirm New PIN',
        subtitle: isAk ? 'အတည်ပြုရန် PIN အသစ်အား ထပ်မံရိုက်ထည့်ပါ' : 'Re-enter your new 6-digit PIN',
        isAk: isAk,
        errorMessage: _pinChangeError,
        isLoading: _isSubmittingPin,
        showBiometrics: false,
        onBack: () => setState(() {
          _changePinStep = 1;
          _pinChangeError = null;
        }),
        onPinCompleted: (pin) async {
          if (pin != _tempNewPin) {
            setState(() {
              _pinChangeError = isAk ? 'PIN အသစ်နှင့် အတည်ပြု PIN မတူညီပါ' : 'New PIN and Confirm PIN do not match.';
              _changePinStep = 1;
            });
            return;
          }

          setState(() {
            _isSubmittingPin = true;
            _pinChangeError = null;
          });

          final res = await SupabaseService().changeUserPin(
            profileId: appState.profile.uid,
            currentPin: _tempOldPin,
            newPin: _tempNewPin,
          );
          if (!mounted) return;
          setState(() => _isSubmittingPin = false);

          if (res['success'] == true) {
            appState.profile.pin = _tempNewPin;
            appState.notify();
            _showToast(context, isAk ? 'PIN နံပါတ် အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ' : 'PIN changed successfully!');
            setState(() => _subView = 'pin_management');
          } else {
            setState(() {
              _pinChangeError = res['message']?.toString() ??
                  (isAk ? 'PIN ပြောင်းလဲခြင်း မအောင်မြင်ပါ' : 'PIN change failed. Please verify current PIN.');
            });
          }
        },
      );
    }
  }

  void _submitForgotOtp(bool isAk) {
    final otp = _forgotOtpCtrl.text.trim();
    if (otp.length != 6) {
      setState(() {
        _forgotPinError = isAk ? '၆ လုံးပါ အတည်ပြုကုဒ် ရိုက်ထည့်ပါ' : 'Please enter the 6-digit OTP';
      });
      return;
    }
    setState(() {
      _forgotPinStep = 1;
      _tempForgotNewPin = '';
      _forgotPinError = null;
    });
  }

  Widget _buildForgotPinView(BuildContext context, AppState appState, bool isAk) {
    if (_forgotPinStep == 0) {
      // Step 1: Clean OTP Verification Page matching Attachment 3
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.chevron_left, color: Colors.black87, size: 28),
            onPressed: () {
              _forgotOtpTimer?.cancel();
              setState(() => _subView = 'pin_management');
            },
          ),
          centerTitle: true,
          title: Text(
            isAk ? 'PIN မေ့သွားပါသလား' : 'Forget PIN',
            style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 16),
          ),
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
          children: [
            // 1. Top Red/Blush Alert Banner (same as login OTP page)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFECDD3)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.check_circle_outline_rounded,
                    size: 20,
                    color: Color(0xFFD91624),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      isAk
                          ? '${appState.profile.email.isNotEmpty ? appState.profile.email : ""} သို့ ၆ လုံးပါ OTP ကုဒ် ပို့ပြီးပါပြီ'
                          : '6-digit OTP code sent to ${appState.profile.email.isNotEmpty ? appState.profile.email : ""}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF1E293B),
                        height: 1.35,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 2. White Card with Key Icon OTP Input
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFEEF0F4)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 2)),
                ],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Row(
                children: [
                  const Icon(Icons.vpn_key_outlined, color: Colors.black38, size: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _forgotOtpCtrl,
                      keyboardType: TextInputType.number,
                      textInputAction: TextInputAction.done,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(6),
                      ],
                      maxLength: 6,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, letterSpacing: 2),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        counterText: '',
                        hintText: isAk ? '၆ လုံးပါ Email OTP ရိုက်ထည့်ပါ' : 'Enter 6-digit Email OTP',
                        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14, letterSpacing: 0),
                      ),
                      onChanged: (_) {
                        if (_forgotPinError != null) setState(() => _forgotPinError = null);
                      },
                      onSubmitted: (_) => _submitForgotOtp(isAk),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Timer & Resend
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${isAk ? "သက်တမ်းကျန်ချိန်" : "Expires in"}: ${_formatForgotOtpTimer(_forgotOtpSecondsRemaining)}',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                ),
                TextButton(
                  onPressed: () async {
                    final res = await SupabaseService().requestPinResetOtp(profileId: appState.profile.uid);
                    if (!context.mounted) return;
                    if (res['success'] == true) {
                      _startForgotOtpTimer();
                      setState(() => _forgotPinError = null);
                      _showToast(context, isAk ? 'OTP ကုဒ် အသစ် ပို့ပြီးပါပြီ' : 'New OTP code dispatched!');
                    } else {
                      setState(() {
                        _forgotPinError = res['message']?.toString() ??
                            (isAk ? 'OTP ကုဒ် ပို့ခြင်း မအောင်မြင်ပါ' : 'Could not send a new OTP. Please try again.');
                      });
                    }
                  },
                  child: Text(
                    isAk ? 'ကုဒ် အသစ်ပြန်ပို့ပါ' : 'Resend Email OTP',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFFD91624)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            if (_forgotPinError != null)
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFECACA)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Color(0xFFDC2626), size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(_forgotPinError!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ),

            // Confirm Button (same as login OTP page)
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _forgotOtpCtrl.text.trim().length == 6 ? () => _submitForgotOtp(isAk) : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD91624),
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: const Color(0xFFD1D5DB),
                  disabledForegroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                child: Text(
                  isAk ? 'အတည်ပြုမည်' : 'Confirm',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Security note (same as login OTP page)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isAk ? 'မှတ်ချက်:' : 'Note:',
                    style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isAk ? '- သင်၏ လျှို့ဝှက် OTP ကုဒ်အား မည်သူ့ကိုမျှ မမျှဝေပါနှင့်။' : '- Please do not share your OTP with anyone.',
                    style: const TextStyle(color: Color(0xFFDC2626), fontSize: 11.5, height: 1.4),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isAk
                        ? '- မွေးသက္ကရာဇ်၊ မှတ်ပုံတင် သို့မဟုတ် ဖုန်းနံပါတ်ကဲ့သို့သော ကိုယ်ရေးအချက်အလက်များကို မမျှဝေပါနှင့်။'
                        : '- Please do not use your personal information such as Date of Birth, NRIC or Passport Number and Phone Number as PIN.',
                    style: const TextStyle(color: Color(0xFFDC2626), fontSize: 11.5, height: 1.4),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    } else if (_forgotPinStep == 1) {
      // Step 2a: Create New PIN
      return PinKeypadScreen(
        title: isAk ? 'PIN အသစ် သတ်မှတ်ပါ' : 'Create New PIN',
        subtitle: isAk ? 'ဂဏန်း ၆ လုံးပါသော PIN အသစ် ရိုက်ထည့်ပါ' : 'Enter a new 6-digit PIN',
        isAk: isAk,
        errorMessage: _forgotPinError,
        isLoading: _isSubmittingForgotPin,
        showBiometrics: false,
        onBack: () => setState(() {
          _forgotPinStep = 0;
          _forgotPinError = null;
        }),
        onPinCompleted: (pin) {
          setState(() {
            _tempForgotNewPin = pin;
            _forgotPinStep = 2;
            _forgotPinError = null;
          });
        },
      );
    } else {
      // Step 2b: Confirm New PIN
      return PinKeypadScreen(
        title: isAk ? 'PIN အသစ် ထပ်မံအတည်ပြုပါ' : 'Confirm New PIN',
        subtitle: isAk ? 'အတည်ပြုရန် PIN အသစ်အား ထပ်မံရိုက်ထည့်ပါ' : 'Re-enter your new 6-digit PIN',
        isAk: isAk,
        errorMessage: _forgotPinError,
        isLoading: _isSubmittingForgotPin,
        showBiometrics: false,
        onBack: () => setState(() {
          _forgotPinStep = 1;
          _forgotPinError = null;
        }),
        onPinCompleted: (pin) async {
          if (pin != _tempForgotNewPin) {
            setState(() {
              _forgotPinError = isAk ? 'PIN အသစ်နှင့် အတည်ပြု PIN မတူညီပါ' : 'New PIN and Confirm PIN do not match.';
              _forgotPinStep = 1;
            });
            return;
          }

          setState(() {
            _isSubmittingForgotPin = true;
            _forgotPinError = null;
          });

          final res = await SupabaseService().verifyAndResetPin(
            profileId: appState.profile.uid,
            otpCode: _forgotOtpCtrl.text.trim(),
            newPin: _tempForgotNewPin,
          );
          if (!mounted) return;
          setState(() => _isSubmittingForgotPin = false);

          if (res['success'] == true) {
            _forgotOtpTimer?.cancel();
            appState.profile.pin = _tempForgotNewPin;
            appState.notify();
            _showToast(context, isAk ? 'PIN နံပါတ် အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ' : 'PIN reset successfully!');
            setState(() => _subView = 'pin_management');
          } else {
            setState(() {
              _forgotPinError = res['error']?.toString() ??
                  (isAk ? 'PIN ပြောင်းလဲခြင်း မအောင်မြင်ပါ' : 'Failed to reset PIN. Please check OTP code.');
            });
          }
        },
      );
    }
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

    if (_subView == 'device_management') {
      return _buildDeviceManagementView(context, appState, isAk, isAndroid);
    }

    if (_subView == 'pin_management') {
      return _buildPinManagementView(context, isAk);
    }
    if (_subView == 'change_pin') {
      return _buildChangePinView(context, appState, isAk);
    }
    if (_subView == 'forgot_pin') {
      return _buildForgotPinView(context, appState, isAk);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF6F7FB),
      body: Stack(
        children: [
          const _SettingsGlassBackground(),
          SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
              children: [
                // Profile / welcome glass card
                if (appState.isAuthenticated)
                  _GlassCard(
                    radius: 28,
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        Center(
                          child: GestureDetector(
                            onTap: () => setState(() => _subView = 'personal_info'),
                            child: Container(
                              width: 78,
                              height: 78,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: const LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [Color(0xFF0B1220), Color(0xFF3A4152)],
                                ),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.9), width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF0B1B33).withValues(alpha: 0.18),
                                    blurRadius: 22,
                                    offset: const Offset(0, 10),
                                  ),
                                ],
                                image: _buildAvatarImageProvider(appState.profile.avatarUrl) != null
                                    ? DecorationImage(
                                        image: _buildAvatarImageProvider(appState.profile.avatarUrl)!,
                                        fit: BoxFit.cover,
                                      )
                                    : null,
                              ),
                              child: _buildAvatarImageProvider(appState.profile.avatarUrl) == null
                                  ? const Icon(Icons.person_rounded, size: 40, color: Colors.white)
                                  : null,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          appState.profile.effectiveNickname,
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 16),
                        Divider(height: 1, color: Colors.black.withValues(alpha: 0.06)),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                _tileIcon(Icons.verified_user_outlined),
                                const SizedBox(width: 10),
                                Text(
                                  isAk ? 'မှတ်ပုံတင် အတည်ပြုချက်' : 'ID Verification',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                                ),
                              ],
                            ),
                            GestureDetector(
                              onTap: () => showKycVerificationModal(context, appState),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: appState.isVerified
                                      ? Colors.white.withValues(alpha: 0.7)
                                      : const Color(0xFFFFF1F2).withValues(alpha: 0.92),
                                  borderRadius: BorderRadius.circular(999),
                                  border: Border.all(
                                    color: appState.isVerified
                                        ? Colors.black.withValues(alpha: 0.08)
                                        : const Color(0xFFFECDD3),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      appState.isVerified ? Icons.check_circle_rounded : Icons.error_outline_rounded,
                                      size: 14,
                                      color: appState.isVerified ? const Color(0xFF0F172A) : crimson,
                                    ),
                                    const SizedBox(width: 5),
                                    Text(
                                      appState.isVerified ? 'Verified' : 'Unverified',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: appState.isVerified ? const Color(0xFF0F172A) : crimson,
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
                  )
                else
                  buildWelcomeSignInCard(context, appState),
                const SizedBox(height: 22),

                // Account Setting
                _sectionLabel(isAk ? 'အကောင့် ဆက်တင်များ' : 'Account Setting'),
                _GlassCard(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Column(
                    children: [
                      _buildSettingTile(
                        icon: Icons.person_outline_rounded,
                        title: isAk ? 'ကျွန်ုပ်၏ ပရိုဖိုင်' : 'My Profile',
                        onTap: () => setState(() => _subView = 'personal_info'),
                      ),
                      _tileDivider(),
                      _buildSettingTile(
                        icon: Icons.notifications_none_rounded,
                        title: isAk ? 'အသိပေးချက်များ' : 'Notifications',
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const NotificationsScreen(),
                            ),
                          );
                        },
                      ),
                      _tileDivider(),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Row(
                          children: [
                            _tileIcon(Icons.language_rounded),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Text(
                                isAk ? 'ဘာသာစကား' : 'Language',
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.all(3),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.5),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.9)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  InkWell(
                                    onTap: () {
                                      if (!isAk) {
                                        appState.setLanguage('ak');
                                        _showToast(context, 'ရွေးချယ်ထားသော ဘာသာစကား - အာရက္ခ');
                                      }
                                    },
                                    borderRadius: BorderRadius.circular(8),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: isAk ? Colors.white : Colors.transparent,
                                        borderRadius: BorderRadius.circular(8),
                                        boxShadow: isAk
                                            ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 1))]
                                            : null,
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          FlagArakan(width: 20),
                                          SizedBox(width: 5),
                                          Text(
                                            'အာရက္ခ',
                                            style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 3),
                                  InkWell(
                                    onTap: () {
                                      if (isAk) {
                                        appState.setLanguage('en');
                                        _showToast(context, 'Language set to English');
                                      }
                                    },
                                    borderRadius: BorderRadius.circular(8),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: !isAk ? Colors.white : Colors.transparent,
                                        borderRadius: BorderRadius.circular(8),
                                        boxShadow: !isAk
                                            ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 1))]
                                            : null,
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          FlagGB(width: 20),
                                          SizedBox(width: 5),
                                          Text(
                                            'English',
                                            style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      _tileDivider(),
                      SwitchListTile(
                        secondary: _tileIcon(Icons.download_rounded),
                        title: Text(
                          isAk ? 'ပြေစာ အလိုအလျောက် သိမ်းဆည်းမည်' : 'Auto save receipt',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                        ),
                        value: appState.autoSaveSlip,
                        activeTrackColor: crimson,
                        onChanged: (_) => appState.toggleAutoSaveSlip(),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 22),

                // Security Settings
                _sectionLabel(isAk ? 'လုံခြုံရေး ဆက်တင်များ' : 'Security Settings'),
                _GlassCard(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Column(
                    children: [
                      SwitchListTile(
                        secondary: _tileIcon(Icons.fingerprint_rounded),
                        title: Text(
                          isAk ? 'မျက်နှာဖွင့် နှင့် လက်ဗွေ' : 'Face Unlock and Fingerprint',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                        ),
                        value: isAndroid ? _biometricLoginEnabled : _faceIdEnabled,
                        activeTrackColor: crimson,
                        onChanged: (val) async {
                          if (val) {
                            final authSuccess = await NativeSecurityService().authenticateBiometrics(
                              reason: isAk ? 'လက်ဗွေ / မျက်နှာ အတည်ပြုပါ' : 'Verify device biometrics',
                            );
                            if (authSuccess) {
                              setState(() {
                                if (isAndroid) {
                                  _biometricLoginEnabled = true;
                                } else {
                                  _faceIdEnabled = true;
                                }
                              });
                              if (context.mounted) {
                                _showToast(context, isAndroid
                                    ? (isAk ? 'လက်ဗွေ ဖွင့်ထားသည်' : 'Biometric login enabled')
                                    : (isAk ? 'Face ID ဖွင့်ထားသည်' : 'Face ID enabled'));
                              }
                            } else {
                              if (context.mounted) {
                                _showToast(context, isAk ? 'စက်ပစ္စည်း အတည်ပြုချက် မအောင်မြင်ပါ' : 'Device biometric verification failed');
                              }
                            }
                          } else {
                            setState(() {
                              if (isAndroid) {
                                _biometricLoginEnabled = false;
                              } else {
                                _faceIdEnabled = false;
                              }
                            });
                            _showToast(context, isAndroid
                                ? (isAk ? 'လက်ဗွေ ပိတ်ထားသည်' : 'Biometric login disabled')
                                : (isAk ? 'Face ID ပိတ်ထားသည်' : 'Face ID disabled'));
                          }
                        },
                      ),
                      _tileDivider(),
                      _buildSettingTile(
                        icon: Icons.lock_outline_rounded,
                        title: isAk ? 'PIN စီမံခန့်ခွဲမှု' : 'PIN Management',
                        onTap: () => setState(() => _subView = 'pin_management'),
                      ),
                      _tileDivider(),
                      _buildSettingTile(
                        icon: Icons.smartphone_rounded,
                        title: isAk ? 'စက်ပစ္စည်း စီမံခန့်ခွဲမှု' : 'Device Management',
                        onTap: () => setState(() => _subView = 'device_management'),
                      ),
                      _tileDivider(),
                      _buildSettingTile(
                        icon: Icons.headset_mic_outlined,
                        title: isAk ? 'Péthar အကူအညီနှင့် ချက်တင်' : 'Chat with Support',
                        onTap: () => showPetharSupportChatSheet(context, isAk),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 22),

                // Log Out
                if (appState.isAuthenticated) ...[
                  _GlassCard(
                    radius: 18,
                    padding: EdgeInsets.zero,
                    tint: crimson,
                    child: SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: TextButton.icon(
                        onPressed: () => _showSignOutDialog(context, appState, isAk),
                        icon: const Icon(Icons.logout_rounded, size: 18, color: crimson),
                        label: Text(
                          isAk ? 'အကောင့်မှ ထွက်မည်' : 'Log Out',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: crimson),
                        ),
                        style: TextButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                ],
                const Center(
                  child: Text.rich(
                    TextSpan(
                      text: '©Péthar App - Version: ',
                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                      children: [
                        TextSpan(
                          text: '1.0.0',
                          style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 6, bottom: 10),
      child: Text(
        text,
        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, letterSpacing: 0.3, color: Color(0xFF64748B)),
      ),
    );
  }

  Widget _tileIcon(IconData icon, {Color color = const Color(0xFF0F172A), double size = 36}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.55),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.9)),
      ),
      child: Icon(icon, color: color, size: size * 0.52),
    );
  }

  Widget _tileDivider() {
    return const Divider(height: 1, thickness: 1, indent: 66, endIndent: 16, color: Color(0x0F000000));
  }


  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: _tileIcon(icon),
      title: Text(
        title,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
      ),
      subtitle: subtitle != null
          ? Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)))
          : null,
      trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
      onTap: onTap,
    );
  }
}

// LIQUID GLASS PRIMITIVES

class _SettingsGlassBackground extends StatelessWidget {
  const _SettingsGlassBackground();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Stack(
        children: [
          const Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFFFDF5F6),
                    Color(0xFFF4F7FC),
                    Color(0xFFEFF3FA),
                  ],
                ),
              ),
            ),
          ),
          Positioned(top: -120, left: -90, child: _blob(const Color(0xFFE11D2E), 300, 0.20)),
          Positioned(top: 140, right: -120, child: _blob(const Color(0xFF2563EB), 320, 0.15)),
          Positioned(bottom: 60, left: -120, child: _blob(const Color(0xFFD4AF37), 300, 0.14)),
          Positioned(bottom: -100, right: -70, child: _blob(const Color(0xFF0F172A), 260, 0.10)),
        ],
      ),
    );
  }

  Widget _blob(Color color, double size, double opacity) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            color.withValues(alpha: opacity),
            color.withValues(alpha: 0),
          ],
        ),
      ),
    );
  }
}

class _GlassCard extends StatelessWidget {
  const _GlassCard({
    required this.child,
    this.radius = 24,
    this.padding = const EdgeInsets.all(16),
    this.tint,
  });

  final Widget child;
  final double radius;
  final EdgeInsetsGeometry padding;
  final Color? tint;

  @override
  Widget build(BuildContext context) {
    final base = BorderRadius.circular(radius);
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: base,
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0B1B33).withValues(alpha: 0.06),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: base,
        child: BackdropFilter(
          filter: ui.ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              borderRadius: base,
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: tint == null
                    ? [
                        Colors.white.withValues(alpha: 0.80),
                        Colors.white.withValues(alpha: 0.46),
                      ]
                    : [
                        Colors.white.withValues(alpha: 0.84),
                        tint!.withValues(alpha: 0.12),
                        Colors.white.withValues(alpha: 0.50),
                      ],
              ),
              border: Border.all(color: Colors.white.withValues(alpha: 0.92), width: 1.3),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
