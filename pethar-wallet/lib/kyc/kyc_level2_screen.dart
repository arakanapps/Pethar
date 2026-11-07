import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../data/address_data.dart';
import '../models/data.dart';
import '../core/services/supabase_service.dart';
import '../theme.dart';
import '../widgets/arakan_emblem.dart';

/// Opens the full KYC Level 2 flow (NRIC front/back, live selfie and
/// structured address).
Future<void> openKycLevel2Screen(BuildContext context, AppState appState) {
  return Navigator.of(context).push(
    MaterialPageRoute(
      builder: (_) => ChangeNotifierProvider<AppState>.value(
        value: appState,
        child: const KycLevel2Screen(),
      ),
    ),
  );
}

class KycLevel2Screen extends StatefulWidget {
  const KycLevel2Screen({super.key});

  @override
  State<KycLevel2Screen> createState() => _KycLevel2ScreenState();
}

class _KycLevel2ScreenState extends State<KycLevel2Screen> {
  final _picker = ImagePicker();

  final _fullNameCtrl = TextEditingController();
  final _nricCtrl = TextEditingController();
  final _houseNoCtrl = TextEditingController();
  final _streetCtrl = TextEditingController();
  final _dobCtrl = TextEditingController();

  Uint8List? _frontBytes;
  Uint8List? _backBytes;
  Uint8List? _selfieBytes;
  String? _frontExistingUrl;
  String? _backExistingUrl;
  String? _selfieExistingUrl;

  String _country = 'Myanmar';
  String? _province;
  String? _district;
  String? _township;
  String? _ward;
  String? _postalCode;

  bool _loadingExistingDocs = true;
  bool _submitting = false;
  bool _savingAddress = false;

  @override
  void initState() {
    super.initState();
    final profile = context.read<AppState>().profile;

    _fullNameCtrl.text = profile.effectiveFullName.isNotEmpty
        ? profile.effectiveFullName
        : profile.name;
    _nricCtrl.text = profile.nationalIdNo;
    _dobCtrl.text = profile.dob;
    _houseNoCtrl.text = profile.addressHouseNo;
    _streetCtrl.text = profile.addressStreet;

    _country = profile.addressCountry.isNotEmpty
        ? profile.addressCountry
        : 'Myanmar';
    _province = _validProvince(profile.addressProvince);
    _district = _validDistrict(profile.addressDistrict);
    _township = _validTownship(profile.addressSubDistrict);
    _ward = profile.addressWard.isNotEmpty ? profile.addressWard : null;
    _postalCode =
        profile.addressPostalCode.isNotEmpty ? profile.addressPostalCode : null;

    // Backfill the township from the saved postal code for older records.
    if (_township == null && _district != null) {
      final townships =
          AddressData.townshipsFor(_country, _province ?? '', _district!);
      if (townships.length == 1) _township = townships.first;
    }

    _loadExistingDocuments(profile);
  }

  String? _validProvince(String value) {
    if (value.isEmpty) {
      final provinces = AddressData.provincesFor(_country);
      return provinces.isNotEmpty ? provinces.first : null;
    }
    final provinces = AddressData.provincesFor(_country);
    return provinces.contains(value)
        ? value
        : (provinces.isNotEmpty ? provinces.first : null);
  }

  String? _validDistrict(String value) {
    if (_province == null) return null;
    final districts = AddressData.districtsFor(_country, _province!);
    if (value.isNotEmpty && districts.contains(value)) return value;
    return districts.isNotEmpty ? districts.first : null;
  }

  String? _validTownship(String value) {
    if (_province == null || _district == null) return null;
    final townships =
        AddressData.townshipsFor(_country, _province!, _district!);
    if (value.isNotEmpty && townships.contains(value)) return value;
    return townships.isNotEmpty ? townships.first : null;
  }

  Future<void> _loadExistingDocuments(UserProfile profile) async {
    final supa = SupabaseService();
    final urls = await Future.wait([
      supa.kycDocumentSignedUrl(profile.nricFrontUrl),
      supa.kycDocumentSignedUrl(profile.nricBackUrl),
      supa.kycDocumentSignedUrl(profile.selfieUrl),
    ]);
    if (!mounted) return;
    setState(() {
      _frontExistingUrl = urls[0];
      _backExistingUrl = urls[1];
      _selfieExistingUrl = urls[2];
      _loadingExistingDocs = false;
    });
  }

  bool get _isPending => _statusUpper == 'PENDING_REVIEW';
  bool get _isVerified => _statusUpper == 'VERIFIED' || _statusUpper == 'VERIFIED_LVL2';
  bool get _isRejected => _statusUpper == 'REJECTED';
  bool get _isLocked => _isPending || _isVerified;

  String get _statusUpper {
    final value = context.read<AppState>().profile.kycStatus.toUpperCase();
    if (value == 'VERIFIED_LVL2') return 'VERIFIED';
    if (value == 'PENDING') return 'PENDING_REVIEW';
    return value;
  }

  @override
  void dispose() {
    _fullNameCtrl.dispose();
    _nricCtrl.dispose();
    _houseNoCtrl.dispose();
    _streetCtrl.dispose();
    _dobCtrl.dispose();
    super.dispose();
  }

  bool get _isAk => context.read<AppState>().language == 'ak';

  String get _composedAddress => [
        _houseNoCtrl.text.trim(),
        _streetCtrl.text.trim(),
        _ward ?? '',
        _township ?? '',
        _district ?? '',
        _province ?? '',
        _country,
        _postalCode ?? '',
      ].where((part) => part.isNotEmpty).join(', ');

  void _onCountryChanged(String? value, AppState appState) {
    if (value == null) return;
    setState(() {
      _country = value;
      final provinces = AddressData.provincesFor(_country);
      _province = provinces.isNotEmpty ? provinces.first : null;
      _district = null;
      _township = null;
      _ward = null;
      _postalCode = null;
      _syncLocationDefaults();
    });
  }

  void _onProvinceChanged(String? value) {
    if (value == null) return;
    setState(() {
      _province = value;
      final districts = AddressData.districtsFor(_country, _province!);
      _district = districts.isNotEmpty ? districts.first : null;
      _township = null;
      _ward = null;
      _postalCode = null;
      _syncLocationDefaults();
    });
  }

  void _onDistrictChanged(String? value) {
    if (value == null || _province == null) return;
    setState(() {
      _district = value;
      final townships =
          AddressData.townshipsFor(_country, _province!, value);
      _township = townships.isNotEmpty ? townships.first : null;
      _ward = null;
      _postalCode = null;
      _syncLocationDefaults();
    });
  }

  void _onTownshipChanged(String? value) {
    if (value == null || _province == null || _district == null) return;
    setState(() {
      _township = value;
      final wards =
          AddressData.wardsFor(_country, _province!, _district!, value);
      _ward = wards.isNotEmpty ? wards.first : null;
      _postalCode = AddressData.postalCodeFor(
            _country,
            _province!,
            _district!,
            value,
          ) ??
          _postalCode;
    });
  }

  void _syncLocationDefaults() {
    if (_province == null) return;
    if (_district == null) {
      final districts = AddressData.districtsFor(_country, _province!);
      _district = districts.isNotEmpty ? districts.first : null;
    }
    if (_district == null) return;
    if (_township == null) {
      final townships =
          AddressData.townshipsFor(_country, _province!, _district!);
      _township = townships.isNotEmpty ? townships.first : null;
    }
    if (_township == null) return;
    if (_ward == null) {
      final wards =
          AddressData.wardsFor(_country, _province!, _district!, _township!);
      _ward = wards.isNotEmpty ? wards.first : null;
    }
    _postalCode ??= AddressData.postalCodeFor(
      _country,
      _province!,
      _district!,
      _township!,
    );
  }

  Future<void> _pickDocument({
    required bool front,
    required bool selfie,
    ImageSource source = ImageSource.camera,
  }) async {
    try {
      final picked = await _picker.pickImage(
        source: source,
        preferredCameraDevice: selfie ? CameraDevice.front : CameraDevice.rear,
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 82,
      );
      if (picked == null) return;
      final bytes = await picked.readAsBytes();
      if (!mounted) return;
      setState(() {
        if (selfie) {
          _selfieBytes = bytes;
        } else if (front) {
          _frontBytes = bytes;
        } else {
          _backBytes = bytes;
        }
      });
    } catch (e) {
      if (mounted) _snack('Unable to capture photo: $e', isError: true);
    }
  }

  Future<void> _chooseDocumentSource({
    required bool front,
    required bool selfie,
  }) async {
    if (selfie) {
      await _pickDocument(front: false, selfie: true);
      return;
    }
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      backgroundColor: trueBlack,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            ListTile(
              leading: const Icon(Icons.photo_camera_rounded, color: crimson),
              title: const Text(
                'Take a photo',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              onTap: () => Navigator.pop(ctx, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_rounded, color: crimson),
              title: const Text(
                'Choose from gallery',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              onTap: () => Navigator.pop(ctx, ImageSource.gallery),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
    if (source != null) {
      await _pickDocument(front: front, selfie: false, source: source);
    }
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final initial = DateTime.tryParse(_dobCtrl.text) ??
        DateTime(now.year - 20, now.month, now.day);
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1900),
      lastDate: DateTime(now.year - 18, now.month, now.day),
    );
    if (picked == null) return;
    setState(() {
      _dobCtrl.text =
          '${picked.year.toString().padLeft(4, '0')}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
    });
  }

  Future<void> _saveAddress(AppState appState) async {
    if (!_validateAddress()) return;
    setState(() => _savingAddress = true);
    final res = await SupabaseService().updateKycAddress(
      houseNo: _houseNoCtrl.text.trim(),
      street: _streetCtrl.text.trim(),
      ward: _ward ?? '',
      subDistrict: _township ?? '',
      district: _district ?? '',
      province: _province ?? '',
      country: _country,
      postalCode: _postalCode ?? '',
    );
    if (!mounted) return;
    setState(() => _savingAddress = false);
    if (res['success'] == true) {
      appState.profile.addressHouseNo = _houseNoCtrl.text.trim();
      appState.profile.addressStreet = _streetCtrl.text.trim();
      appState.profile.addressWard = _ward ?? '';
      appState.profile.addressSubDistrict = _township ?? '';
      appState.profile.addressDistrict = _district ?? '';
      appState.profile.addressProvince = _province ?? '';
      appState.profile.addressCountry = _country;
      appState.profile.addressPostalCode = _postalCode ?? '';
      appState.profile.address = _composedAddress;
      appState.notify();
      _snack(_isAk ? 'လိပ်စာ သိမ်းဆည်းပြီးပါပြီ' : 'Address saved successfully');
    } else {
      _snack(
        res['message']?.toString() ??
            (_isAk ? 'လိပ်စာ သိမ်းဆည်း၍ မရပါ' : 'Could not save address'),
        isError: true,
      );
    }
  }

  Future<void> _submit(AppState appState) async {
    if (!_validateIdentity()) return;
    if (!_validateAddress()) return;

    if (_frontBytes == null && _frontExistingUrl == null) {
      _snack('Please capture the NRIC front side', isError: true);
      return;
    }
    if (_backBytes == null && _backExistingUrl == null) {
      _snack('Please capture the NRIC back side', isError: true);
      return;
    }
    if (_selfieBytes == null && _selfieExistingUrl == null) {
      _snack('Please take a live selfie photo', isError: true);
      return;
    }

    setState(() => _submitting = true);
    final supa = SupabaseService();

    String? frontPath = appState.profile.nricFrontUrl;
    String? backPath = appState.profile.nricBackUrl;
    String? selfiePath = appState.profile.selfieUrl;

    try {
      if (_frontBytes != null) {
        frontPath =
            await supa.uploadKycDocument(kind: 'nric_front', bytes: _frontBytes!);
        if (frontPath == null) throw Exception('NRIC front upload failed');
      }
      if (_backBytes != null) {
        backPath =
            await supa.uploadKycDocument(kind: 'nric_back', bytes: _backBytes!);
        if (backPath == null) throw Exception('NRIC back upload failed');
      }
      if (_selfieBytes != null) {
        selfiePath =
            await supa.uploadKycDocument(kind: 'selfie', bytes: _selfieBytes!);
        if (selfiePath == null) throw Exception('Selfie upload failed');
      }

      final res = await appState.submitKycLevel2(
        nationalIdNo: _nricCtrl.text.trim(),
        dob: _dobCtrl.text.trim(),
        fullName: _fullNameCtrl.text.trim(),
        address: _composedAddress,
        nricFrontUrl: frontPath,
        nricBackUrl: backPath,
        selfieUrl: selfiePath,
        houseNo: _houseNoCtrl.text.trim(),
        street: _streetCtrl.text.trim(),
        ward: _ward,
        subDistrict: _township,
        district: _district,
        province: _province,
        country: _country,
        postalCode: _postalCode,
      );

      if (!mounted) return;
      setState(() => _submitting = false);
      if (res['success'] == true) {
        await _showSubmittedDialog();
        if (mounted) Navigator.of(context).pop(true);
      } else {
        _snack(
          res['message']?.toString() ??
              res['error']?.toString() ??
              'Could not submit KYC',
          isError: true,
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _submitting = false);
      _snack('$e', isError: true);
    }
  }

  bool _validateIdentity() {
    if (_fullNameCtrl.text.trim().isEmpty) {
      _snack('Enter your full legal name', isError: true);
      return false;
    }
    if (_nricCtrl.text.trim().isEmpty) {
      _snack('Enter your NRIC / National ID number', isError: true);
      return false;
    }
    if (DateTime.tryParse(_dobCtrl.text.trim()) == null) {
      _snack('Select your date of birth', isError: true);
      return false;
    }
    return true;
  }

  bool _validateAddress() {
    if (_ward == null || _ward!.isEmpty) {
      _snack('Select your ward', isError: true);
      return false;
    }
    if (_township == null || _township!.isEmpty) {
      _snack('Select your sub-district / township', isError: true);
      return false;
    }
    if (_district == null || _district!.isEmpty) {
      _snack('Select your district', isError: true);
      return false;
    }
    if (_province == null || _province!.isEmpty) {
      _snack('Select your province / state', isError: true);
      return false;
    }
    if (_country.isEmpty) {
      _snack('Select your country', isError: true);
      return false;
    }
    return true;
  }

  void _snack(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5),
        ),
        backgroundColor: isError ? crimson : const Color(0xFF065F46),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    );
  }

  Future<void> _showSubmittedDialog() {
    return showDialog<void>(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: Color(0xFF0A0A0A),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF059669),
                  size: 36,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Submitted for review',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Text(
                _isAk
                    ? 'သင်၏ KYC အဆင့် ၂ အချက်အလက်များကို တင်သွင်းပြီးပါပြီ။ စီမံခန့်ခွဲရေးအဖွဲ့ စစ်ဆေးပြီးသည်နှင့် အတည်ပြုခံရပါမည်။'
                    : 'Your KYC Level 2 details were submitted. An administrator will review your NRIC and live selfie shortly.',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 12.5,
                  color: Color(0xFFD4D4D8),
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF18181B),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'Done',
                    style: TextStyle(fontWeight: FontWeight.w800),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = context.watch<AppState>();
    final profile = appState.profile;

    return Scaffold(
      backgroundColor: trueBlack,
      appBar: AppBar(
        backgroundColor: trueBlack,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFFF4F4F5)),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: Row(
          children: [
            const ArakanEmblem(size: 22),
            const SizedBox(width: 8),
            Text(
              _isAk ? 'KYC အဆင့် ၂ အတည်ပြုခြင်း' : 'KYC Level 2 Verification',
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Color(0xFFF4F4F5),
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
          children: [
            _buildStatusCard(profile),
            const SizedBox(height: 16),
            _buildSection(
              title: _isAk ? 'ကိုယ်ရေးအချက်အလက်' : 'Identity details',
              subtitle: _isAk
                  ? 'မှတ်ပုံတင်ပေါ်ရှိ အမည်နှင့် အချက်အလက်အတိုင်း ဖြည့်ပါ'
                  : 'Enter the details exactly as shown on your NRIC',
              icon: Icons.badge_rounded,
              children: [
                _buildLabel('Full legal name'),
                TextField(
                  controller: _fullNameCtrl,
                  enabled: !_isLocked,
                  textCapitalization: TextCapitalization.words,
                  style: _inputStyle,
                  decoration: _inputDecoration(
                    hint: 'As printed on your NRIC',
                    icon: Icons.person_outline_rounded,
                  ),
                ),
                const SizedBox(height: 12),
                _buildLabel('NRIC / National ID number'),
                TextField(
                  controller: _nricCtrl,
                  enabled: !_isLocked,
                  style: _inputStyle,
                  decoration: _inputDecoration(
                    hint: 'e.g. 12/ABC(N)123456',
                    icon: Icons.credit_card_rounded,
                  ),
                ),
                const SizedBox(height: 12),
                _buildLabel('Date of birth'),
                GestureDetector(
                  onTap: _isLocked ? null : _pickDateOfBirth,
                  child: AbsorbPointer(
                    child: TextField(
                      controller: _dobCtrl,
                      enabled: !_isLocked,
                      style: _inputStyle,
                      decoration: _inputDecoration(
                        hint: 'Select date of birth',
                        icon: Icons.calendar_today_rounded,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: _isAk ? 'နေရပ်လိပ်စာ' : 'Residential address',
              subtitle: _isAk
                  ? 'အိမ်အမှတ်မှ စာပို့သင်္ကေတအထိ အချက်အလက်များ ရွေးချယ်ပါ'
                  : 'House number through postal code — select each location field',
              icon: Icons.location_on_rounded,
              children: [
                _buildLabel('House No.'),
                TextField(
                  controller: _houseNoCtrl,
                  style: _inputStyle,
                  decoration: _inputDecoration(
                    hint: 'House / building number',
                    icon: Icons.home_rounded,
                  ),
                ),
                const SizedBox(height: 12),
                _buildLabel('Street'),
                TextField(
                  controller: _streetCtrl,
                  style: _inputStyle,
                  decoration: _inputDecoration(
                    hint: 'Street / road name',
                    icon: Icons.signpost_outlined,
                  ),
                ),
                const SizedBox(height: 12),
                _buildLabel('Country'),
                _buildDropdown(
                  value: _country,
                  items: AddressData.countries,
                  onChanged: (value) => _onCountryChanged(value, appState),
                ),
                const SizedBox(height: 12),
                _buildLabel('Province / State'),
                _buildDropdown(
                  value: _province,
                  items: AddressData.provincesFor(_country),
                  onChanged: _onProvinceChanged,
                ),
                const SizedBox(height: 12),
                _buildLabel('District'),
                _buildDropdown(
                  value: _district,
                  items: _province == null
                      ? const []
                      : AddressData.districtsFor(_country, _province!),
                  onChanged: _onDistrictChanged,
                ),
                const SizedBox(height: 12),
                _buildLabel('Sub-district / Township'),
                _buildDropdown(
                  value: _township,
                  items: (_province == null || _district == null)
                      ? const []
                      : AddressData.townshipsFor(
                          _country,
                          _province!,
                          _district!,
                        ),
                  onChanged: _onTownshipChanged,
                ),
                const SizedBox(height: 12),
                _buildLabel('Ward'),
                _buildDropdown(
                  value: _ward,
                  items: (_province == null ||
                          _district == null ||
                          _township == null)
                      ? const []
                      : AddressData.wardsFor(
                          _country,
                          _province!,
                          _district!,
                          _township!,
                        ),
                  onChanged: (value) => setState(() => _ward = value),
                ),
                const SizedBox(height: 12),
                _buildLabel('Postal code'),
                _buildDropdown(
                  value: _postalCode,
                  items: (_province == null ||
                          _district == null ||
                          _township == null)
                      ? const []
                      : AddressData.postalCodesFor(
                          _country,
                          _province!,
                          _district!,
                          _township!,
                        ),
                  onChanged: (value) => setState(() => _postalCode = value),
                ),
                if (_composedAddress.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0A0A0A),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.map_outlined,
                          size: 16,
                          color: Color(0xFFD4D4D8),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _composedAddress,
                            style: const TextStyle(
                              fontSize: 11.5,
                              color: Color(0xFFD4D4D8),
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: _isAk ? 'မှတ်ပုံတင်နှင့် ဓာတ်ပုံ' : 'NRIC & live photo',
              subtitle: _isLocked
                  ? (_isVerified
                      ? 'Your submitted documents are on file'
                      : 'Documents submitted — awaiting administrative review')
                  : 'Capture both sides of your NRIC and take a live selfie',
              icon: Icons.camera_alt_rounded,
              children: [
                _DocumentCard(
                  label: 'NRIC front side',
                  hint: 'All text must be clearly visible',
                  icon: Icons.credit_card_rounded,
                  imageBytes: _frontBytes,
                  existingUrl: _frontExistingUrl,
                  loadingExisting: _loadingExistingDocs,
                  onTap: _isLocked
                      ? null
                      : () => _chooseDocumentSource(front: true, selfie: false),
                  onRetake: _isLocked
                      ? null
                      : () => _chooseDocumentSource(front: true, selfie: false),
                ),
                const SizedBox(height: 12),
                _DocumentCard(
                  label: 'NRIC back side',
                  hint: 'Include the barcode / registration details',
                  icon: Icons.credit_card_off_rounded,
                  imageBytes: _backBytes,
                  existingUrl: _backExistingUrl,
                  loadingExisting: _loadingExistingDocs,
                  onTap: _isLocked
                      ? null
                      : () => _chooseDocumentSource(front: false, selfie: false),
                  onRetake: _isLocked
                      ? null
                      : () => _chooseDocumentSource(front: false, selfie: false),
                ),
                const SizedBox(height: 12),
                _DocumentCard(
                  label: 'Live selfie',
                  hint: 'Camera only — gallery uploads are disabled',
                  icon: Icons.person_pin_circle_rounded,
                  imageBytes: _selfieBytes,
                  existingUrl: _selfieExistingUrl,
                  loadingExisting: _loadingExistingDocs,
                  cameraOnly: true,
                  onTap: _isLocked
                      ? null
                      : () => _pickDocument(
                            front: false,
                            selfie: true,
                            source: ImageSource.camera,
                          ),
                  onRetake: _isLocked
                      ? null
                      : () => _pickDocument(
                            front: false,
                            selfie: true,
                            source: ImageSource.camera,
                          ),
                ),
                if (_isRejected && profile.kycRejectionReason.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A0A0C),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF3F1D24)),
                    ),
                    child: Text(
                      'Rejection reason: ${profile.kycRejectionReason}',
                      style: const TextStyle(
                        color: Color(0xFF9F1239),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 22),
            if (_isLocked)
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: _savingAddress ? null : () => _saveAddress(appState),
                  style: _primaryButtonStyle,
                  child: _savingAddress
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          _isAk ? 'လိပ်စာ သိမ်းဆည်းမည်' : 'Save address changes',
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 13.5,
                          ),
                        ),
                ),
              )
            else
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: _submitting ? null : () => _submit(appState),
                  style: _primaryButtonStyle,
                  child: _submitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          _isAk
                              ? 'KYC အဆင့် ၂ အတွက် တင်သွင်းမည်'
                              : 'Submit for Level 2 review',
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 13.5,
                          ),
                        ),
                ),
              ),
            const SizedBox(height: 12),
            const Text(
              'Your NRIC images and live selfie are stored in a private bucket and are only reviewed by authorised operators.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 10.5,
                color: Color(0xFFD4D4D8),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  final TextStyle _inputStyle = const TextStyle(
    fontSize: 13.5,
    fontWeight: FontWeight.w700,
    color: Color(0xFFF4F4F5),
  );

  final ButtonStyle _primaryButtonStyle = ElevatedButton.styleFrom(
    backgroundColor: const Color(0xFF18181B),
    foregroundColor: Colors.white,
    elevation: 0,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
  );

  InputDecoration _inputDecoration({
    required String hint,
    required IconData icon,
  }) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(
        fontSize: 12.5,
        color: Color(0xFFD4D4D8),
        fontWeight: FontWeight.w500,
      ),
      prefixIcon: Icon(icon, size: 19, color: const Color(0xFFD4D4D8)),
      filled: true,
      fillColor: const Color(0xFF0A0A0A),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide.none,
      ),
      disabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide.none,
      ),
    );
  }

  Widget _buildDropdown({
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    final effectiveItems = <String>[...items];
    if (value != null && value.isNotEmpty && !effectiveItems.contains(value)) {
      effectiveItems.insert(0, value);
    }
    final selected =
        (value != null && effectiveItems.contains(value))
            ? value
            : (effectiveItems.isNotEmpty ? effectiveItems.first : null);
    return DropdownButtonFormField<String>(
      key: ValueKey<String>('${value ?? ''}|${effectiveItems.join('|')}'),
      initialValue: selected,
      isExpanded: true,
      icon: const Icon(Icons.keyboard_arrow_down_rounded),
      decoration: InputDecoration(
        filled: true,
        fillColor: const Color(0xFF0A0A0A),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
      ),
      style: _inputStyle,
      items: effectiveItems
          .map(
            (item) => DropdownMenuItem<String>(
              value: item,
              child: Text(item, overflow: TextOverflow.ellipsis),
            ),
          )
          .toList(),
      onChanged: effectiveItems.isEmpty ? null : onChanged,
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 11.5,
          fontWeight: FontWeight.w700,
          color: Color(0xFFD4D4D8),
        ),
      ),
    );
  }

  Widget _buildStatusCard(UserProfile profile) {
    late final Color bg;
    late final Color border;
    late final Color fg;
    late final IconData icon;
    late final String title;
    late final String subtitle;

    if (_isVerified) {
      bg = const Color(0xFF0A0A0A);
      border = const Color(0xFF86EFAC);
      fg = const Color(0xFF166534);
      icon = Icons.verified_rounded;
      title = _isAk ? 'KYC အဆင့် ၂ အတည်ပြုပြီး' : 'KYC Level 2 verified';
      subtitle = _isAk
          ? 'သင်၏ မှတ်ပုံတင်နှင့် ကိုယ်ရေးအချက်အလက်များ အတည်ပြုပြီးပါပြီ။'
          : 'Your identity documents have been approved.';
    } else if (_isPending) {
      bg = const Color(0xFF1A1400);
      border = const Color(0xFF78350F);
      fg = const Color(0xFF92400E);
      icon = Icons.hourglass_top_rounded;
      title = _isAk ? 'စိစစ်အတည်ပြုချက် စောင့်ဆိုင်းနေသည်' : 'Pending administrative review';
      subtitle = _isAk
          ? 'အချက်အလက်များ တင်သွင်းပြီးပါပြီ။ အတည်ပြုချက်ကို စောင့်ဆိုင်းပါ။'
          : 'Your documents are under review. You can still update your address.';
    } else if (_isRejected) {
      bg = const Color(0xFF1A0A0C);
      border = const Color(0xFF3F1D24);
      fg = const Color(0xFF9F1239);
      icon = Icons.error_outline_rounded;
      title = _isAk ? 'တင်သွင်းမှု ပယ်ချခံရသည်' : 'Submission rejected';
      subtitle = _isAk
          ? 'အချက်အလက်များ ပြန်လည်စစ်ဆေးပြီး ပြန်လည်တင်သွင်းပါ။'
          : 'Review the rejection reason and resubmit your documents.';
    } else {
      bg = const Color(0xFF0A0A0A);
      border = const Color(0xFF262626);
      fg = const Color(0xFF3F3F46);
      icon = Icons.shield_outlined;
      title = _isAk ? 'KYC အဆင့် ၂ မတည်ပြုရသေးပါ' : 'Level 2 not verified yet';
      subtitle = _isAk
          ? 'NRIC နှစ်ဖက်နှင့် တိုက်ရိုက်ဓာတ်ပုံတင်သွင်းပါ။'
          : 'Submit both NRIC sides and a live selfie to upgrade.';
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: fg, size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: fg,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 11.5,
                    color: fg.withValues(alpha: 0.85),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF27272A)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 14,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF1A0A0C),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 17, color: crimson),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFFF4F4F5),
                      ),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 10.5,
                        color: Color(0xFFD4D4D8),
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }
}

class _DocumentCard extends StatelessWidget {
  final String label;
  final String hint;
  final IconData icon;
  final Uint8List? imageBytes;
  final String? existingUrl;
  final bool loadingExisting;
  final bool cameraOnly;
  final VoidCallback? onTap;
  final VoidCallback? onRetake;

  const _DocumentCard({
    required this.label,
    required this.hint,
    required this.icon,
    this.imageBytes,
    this.existingUrl,
    this.loadingExisting = false,
    this.cameraOnly = false,
    this.onTap,
    this.onRetake,
  });

  @override
  Widget build(BuildContext context) {
    final hasImage = imageBytes != null || existingUrl != null;
    final isLocked = onTap == null;

    Widget preview;
    if (imageBytes != null) {
      preview = Image.memory(imageBytes!, fit: BoxFit.cover, height: 150);
    } else if (existingUrl != null) {
      preview = Image.network(
        existingUrl!,
        fit: BoxFit.cover,
        height: 150,
        errorBuilder: (_, __, ___) => _placeholder(),
      );
    } else if (loadingExisting) {
      preview = const SizedBox(
        height: 150,
        child: Center(
          child: SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ),
      );
    } else {
      preview = _placeholder();
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0A0A0A),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: hasImage ? const Color(0xFF14532D) : const Color(0xFF27272A),
            width: hasImage ? 1.4 : 1,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                SizedBox(width: double.infinity, height: 150, child: preview),
                if (hasImage && !isLocked)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Material(
                      color: Colors.white,
                      shape: const CircleBorder(),
                      child: InkWell(
                        customBorder: const CircleBorder(),
                        onTap: onRetake,
                        child: const Padding(
                          padding: EdgeInsets.all(7),
                          child: Icon(
                            Icons.refresh_rounded,
                            size: 17,
                            color: Color(0xFFF4F4F5),
                          ),
                        ),
                      ),
                    ),
                  ),
                if (isLocked && hasImage)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(
                        color: Color(0xFF059669),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.lock_rounded,
                        size: 13,
                        color: Colors.white,
                      ),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Row(
                children: [
                  Icon(icon, size: 16, color: const Color(0xFFD4D4D8)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          label,
                          style: const TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFFF4F4F5),
                          ),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          hint,
                          style: const TextStyle(
                            fontSize: 10.5,
                            color: Color(0xFFD4D4D8),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (cameraOnly)
                    const Icon(
                      Icons.camera_front_rounded,
                      size: 18,
                      color: crimson,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholder() {
    return Container(
      color: const Color(0xFF111111),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 30, color: const Color(0xFFD4D4D8)),
            const SizedBox(height: 6),
            const Text(
              'Tap to capture',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Color(0xFFD4D4D8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
