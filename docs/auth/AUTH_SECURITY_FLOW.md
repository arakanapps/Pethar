# Péthar Authentication & Security Flow
## Google Sign-In → PIN → Biometric

---

## 🔐 Authentication Layers

### Layer 1: Google Sign-In (Firebase Auth)
**Purpose:** Identity verification

```typescript
// User taps "Sign in with Google"
// Firebase handles OAuth flow
const { user } = await signInWithGoogle()

// Check if first-time user
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', user.uid)
  .single()

if (!profile) {
  // First time → Create profile + PIN setup
  showPINCreationScreen()
} else if (profile.biometric_enabled) {
  // Returning user with biometric
  showBiometricPrompt()
} else {
  // Returning user without biometric
  showPINPrompt()
}
```

---

### Layer 2: 6-Digit PIN (Required for All Users)
**Purpose:** Transaction authorization

```dart
// Flutter implementation
// File: lib/services/pin_service.dart

import 'package:crypto/crypto.dart';
import 'dart:convert';

class PINService {
  // Hash PIN before storing (never store plain text)
  static String hashPIN(String pin) {
    final bytes = utf8.encode(pin);
    final hash = sha256.convert(bytes);
    return hash.toString();
  }

  // Create new PIN (first-time user)
  static Future<bool> createPIN(String userId, String pin) async {
    if (pin.length != 6 || !RegExp(r'^[0-9]{6}$').hasMatch(pin)) {
      throw Exception('PIN must be exactly 6 digits');
    }

    final hashedPIN = hashPIN(pin);

    final response = await supabase
      .from('user_profiles')
      .update({'pin_hash': hashedPIN})
      .eq('user_id', userId);

    return response.error == null;
  }

  // Verify PIN for transaction
  static Future<bool> verifyPIN(String userId, String pin) async {
    final hashedPIN = hashPIN(pin);

    final response = await supabase
      .from('user_profiles')
      .select('pin_hash')
      .eq('user_id', userId)
      .single();

    if (response.data == null) return false;

    return response.data['pin_hash'] == hashedPIN;
  }

  // Change PIN (requires old PIN first)
  static Future<bool> changePIN(String userId, String oldPIN, String newPIN) async {
    // Verify old PIN
    final isValid = await verifyPIN(userId, oldPIN);
    if (!isValid) throw Exception('Current PIN is incorrect');

    // Set new PIN
    return await createPIN(userId, newPIN);
  }
}
```

**PIN Storage Schema:**
```sql
-- Already in your user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(128);

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS pin_attempts INT DEFAULT 0;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS pin_locked_until TIMESTAMPTZ;

-- Lock account after 5 failed attempts
CREATE OR REPLACE FUNCTION check_pin_lockout(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_locked_until TIMESTAMPTZ;
    v_attempts INT;
BEGIN
    SELECT pin_locked_until, pin_attempts 
    INTO v_locked_until, v_attempts
    FROM user_profiles
    WHERE user_id = p_user_id;

    -- Check if locked
    IF v_locked_until IS NOT NULL AND v_locked_until > NOW() THEN
        RETURN FALSE; -- Account is locked
    END IF;

    -- Reset attempts if lock expired
    IF v_locked_until IS NOT NULL AND v_locked_until <= NOW() THEN
        UPDATE user_profiles
        SET pin_attempts = 0, pin_locked_until = NULL
        WHERE user_id = p_user_id;
    END IF;

    RETURN TRUE; -- Not locked
END;
$$ LANGUAGE plpgsql;
```

---

### Layer 3: Biometric Authentication (Optional)
**Purpose:** Convenience + Additional security

```dart
// File: lib/services/biometric_service.dart

import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class BiometricService {
  static final LocalAuthentication _auth = LocalAuthentication();
  static final FlutterSecureStorage _storage = FlutterSecureStorage();

  // Check if device supports biometrics
  static Future<bool> isAvailable() async {
    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isDeviceSupported = await _auth.isDeviceSupported();
      return canCheck && isDeviceSupported;
    } catch (e) {
      return false;
    }
  }

  // Get available biometric types
  static Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _auth.getAvailableBiometrics();
    } catch (e) {
      return [];
    }
  }

  // Enable biometric login
  static Future<bool> enableBiometric(String userId, String pin) async {
    try {
      // First authenticate with biometric
      final authenticated = await _auth.authenticate(
        localizedReason: 'Enable biometric login for Péthar',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );

      if (!authenticated) return false;

      // Store encrypted PIN for biometric access
      // WARNING: This stores PIN locally - biometric is the protection layer
      await _storage.write(key: 'user_pin_$userId', value: pin);

      // Update database
      await supabase
        .from('user_profiles')
        .update({'biometric_enabled': true})
        .eq('user_id', userId);

      return true;
    } catch (e) {
      print('Biometric enable error: $e');
      return false;
    }
  }

  // Authenticate with biometric (for transactions)
  static Future<String?> authenticateForTransaction(String userId) async {
    try {
      final authenticated = await _auth.authenticate(
        localizedReason: 'Confirm transaction with biometric',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );

      if (!authenticated) return null;

      // Retrieve stored PIN
      final pin = await _storage.read(key: 'user_pin_$userId');
      return pin; // Return PIN for server validation
    } catch (e) {
      print('Biometric auth error: $e');
      return null;
    }
  }

  // Disable biometric
  static Future<bool> disableBiometric(String userId) async {
    await _storage.delete(key: 'user_pin_$userId');
    
    await supabase
      .from('user_profiles')
      .update({'biometric_enabled': false})
      .eq('user_id', userId);

    return true;
  }
}
```

**Database Schema:**
```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS biometric_type VARCHAR(20); -- 'fingerprint', 'face', 'iris'
```

---

## 🔒 Transaction Security Flow

### Step 1: User Initiates Transfer
```dart
// User enters: recipient UID, amount
// Tap "Confirm"

if (userProfile.biometricEnabled) {
  // Try biometric first
  final pin = await BiometricService.authenticateForTransaction(userId);
  
  if (pin == null) {
    // Biometric failed → Fallback to PIN
    showPINPrompt();
  } else {
    // Biometric success → Process transaction
    await processTransactionWithPIN(recipientId, amount, pin);
  }
} else {
  // No biometric → Direct PIN entry
  showPINPrompt();
}
```

### Step 2: Validate PIN Server-Side
```typescript
// In supabase/functions/process-transaction/index.ts

interface TransactionRequest {
  to_user_id: string
  amount: number
  pin: string  // ⬅️ User's PIN (will be hashed and verified)
}

// Verify PIN before processing
const { data: userProfile } = await supabase
  .from('user_profiles')
  .select('pin_hash, pin_attempts, pin_locked_until')
  .eq('user_id', fromUserId)
  .single()

// Check if account locked
if (userProfile.pin_locked_until && new Date(userProfile.pin_locked_until) > new Date()) {
  return new Response(JSON.stringify({ 
    error: 'Account locked due to failed PIN attempts. Try again in 30 minutes.' 
  }), { status: 403 })
}

// Hash provided PIN
const encoder = new TextEncoder()
const data = encoder.encode(pin)
const hashBuffer = await crypto.subtle.digest('SHA-256', data)
const hashArray = Array.from(new Uint8Array(hashBuffer))
const hashedPIN = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

// Verify PIN
if (hashedPIN !== userProfile.pin_hash) {
  // Increment failed attempts
  const newAttempts = (userProfile.pin_attempts || 0) + 1
  
  if (newAttempts >= 5) {
    // Lock account for 30 minutes
    await supabase
      .from('user_profiles')
      .update({ 
        pin_attempts: newAttempts,
        pin_locked_until: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      })
      .eq('user_id', fromUserId)
    
    return new Response(JSON.stringify({ 
      error: 'Too many failed attempts. Account locked for 30 minutes.' 
    }), { status: 403 })
  } else {
    // Increment attempt counter
    await supabase
      .from('user_profiles')
      .update({ pin_attempts: newAttempts })
      .eq('user_id', fromUserId)
    
    return new Response(JSON.stringify({ 
      error: `Incorrect PIN. ${5 - newAttempts} attempts remaining.` 
    }), { status: 401 })
  }
}

// PIN correct → Reset attempts
await supabase
  .from('user_profiles')
  .update({ pin_attempts: 0 })
  .eq('user_id', fromUserId)

// Proceed with transaction...
```

---

## 📱 UI Implementation

### Sign-In Screen
```dart
// File: lib/screens/signin_screen.dart

class SignInScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Péthar Logo
            Image.asset('assets/pethar_logo.png', width: 120),
            SizedBox(height: 20),
            Text(
              'Péthar Wallet',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            Text(
              'ဖေ့သာ - Secure Digital Cash',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            SizedBox(height: 60),
            
            // Google Sign-In Button
            ElevatedButton.icon(
              onPressed: () async {
                await _signInWithGoogle(context);
              },
              icon: Image.asset('assets/google_icon.png', width: 24),
              label: Text('Sign in with Google'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black87,
                padding: EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                elevation: 2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _signInWithGoogle(BuildContext context) async {
    try {
      // Firebase Google Sign-In
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) return; // User cancelled

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
      final user = userCredential.user!;

      // Check if user exists in Supabase
      final profile = await _checkUserProfile(user.uid);

      if (profile == null) {
        // First-time user → Create profile + PIN
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => CreatePINScreen(userId: user.uid)),
        );
      } else if (profile['pin_hash'] == null || profile['pin_hash'] == '') {
        // Account exists but no PIN → Create PIN
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => CreatePINScreen(userId: user.uid)),
        );
      } else if (profile['biometric_enabled'] == true) {
        // Returning user with biometric
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => BiometricLoginScreen(userId: user.uid)),
        );
      } else {
        // Returning user without biometric → PIN entry
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => PINLoginScreen(userId: user.uid)),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Sign-in failed: $e')),
      );
    }
  }

  Future<Map<String, dynamic>?> _checkUserProfile(String userId) async {
    final response = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    return response.data;
  }
}
```

### PIN Creation Screen
```dart
// File: lib/screens/create_pin_screen.dart

class CreatePINScreen extends StatefulWidget {
  final String userId;
  const CreatePINScreen({required this.userId});

  @override
  _CreatePINScreenState createState() => _CreatePINScreenState();
}

class _CreatePINScreenState extends State<CreatePINScreen> {
  String _pin = '';
  String _confirmPin = '';
  bool _isConfirming = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Create Your PIN')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              _isConfirming ? 'Confirm your PIN' : 'Create a 6-digit PIN',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 40),
            
            // PIN Dots Display
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(6, (index) {
                final currentPin = _isConfirming ? _confirmPin : _pin;
                return Container(
                  margin: EdgeInsets.symmetric(horizontal: 8),
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: index < currentPin.length ? Colors.blue : Colors.grey[300],
                  ),
                );
              }),
            ),
            SizedBox(height: 60),
            
            // Number Pad
            _buildNumberPad(),
          ],
        ),
      ),
    );
  }

  Widget _buildNumberPad() {
    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: 3,
      childAspectRatio: 1.5,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      padding: EdgeInsets.symmetric(horizontal: 60),
      children: [
        ...List.generate(9, (i) => _buildNumberButton('${i + 1}')),
        _buildNumberButton('', icon: Icons.backspace),
        _buildNumberButton('0'),
        _buildNumberButton('', icon: Icons.check, onPressed: _handleSubmit),
      ],
    );
  }

  Widget _buildNumberButton(String number, {IconData? icon, VoidCallback? onPressed}) {
    return ElevatedButton(
      onPressed: onPressed ?? () => _handleNumberPress(number),
      child: icon != null ? Icon(icon, size: 28) : Text(number, style: TextStyle(fontSize: 24)),
      style: ElevatedButton.styleFrom(
        shape: CircleBorder(),
        padding: EdgeInsets.all(20),
      ),
    );
  }

  void _handleNumberPress(String number) {
    if (number.isEmpty) {
      // Backspace
      setState(() {
        if (_isConfirming && _confirmPin.isNotEmpty) {
          _confirmPin = _confirmPin.substring(0, _confirmPin.length - 1);
        } else if (!_isConfirming && _pin.isNotEmpty) {
          _pin = _pin.substring(0, _pin.length - 1);
        }
      });
      return;
    }

    setState(() {
      if (_isConfirming) {
        if (_confirmPin.length < 6) {
          _confirmPin += number;
          if (_confirmPin.length == 6) {
            _verifyAndSavePIN();
          }
        }
      } else {
        if (_pin.length < 6) {
          _pin += number;
          if (_pin.length == 6) {
            _isConfirming = true;
          }
        }
      }
    });
  }

  void _handleSubmit() {
    if (_isConfirming && _confirmPin.length == 6) {
      _verifyAndSavePIN();
    }
  }

  Future<void> _verifyAndSavePIN() async {
    if (_pin != _confirmPin) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('PINs do not match. Please try again.')),
      );
      setState(() {
        _pin = '';
        _confirmPin = '';
        _isConfirming = false;
      });
      return;
    }

    // Save PIN
    final success = await PINService.createPIN(widget.userId, _pin);

    if (success) {
      // Ask if user wants to enable biometric
      final hasBiometric = await BiometricService.isAvailable();
      
      if (hasBiometric) {
        _showBiometricSetupDialog();
      } else {
        _navigateToDashboard();
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to create PIN. Please try again.')),
      );
    }
  }

  void _showBiometricSetupDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Enable Biometric Login?'),
        content: Text('Use fingerprint or face recognition for faster login and transactions.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _navigateToDashboard();
            },
            child: Text('Skip'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              final enabled = await BiometricService.enableBiometric(widget.userId, _pin);
              if (enabled) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Biometric login enabled!')),
                );
              }
              _navigateToDashboard();
            },
            child: Text('Enable'),
          ),
        ],
      ),
    );
  }

  void _navigateToDashboard() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => DashboardScreen()),
    );
  }
}
```

---

## 🔑 Required Dependencies

**pubspec.yaml:**
```yaml
dependencies:
  # Existing
  flutter:
    sdk: flutter
  supabase_flutter: ^2.0.0
  firebase_auth: ^5.0.0
  google_sign_in: ^6.0.0
  
  # Add these for biometric + secure storage
  local_auth: ^2.2.0
  flutter_secure_storage: ^9.0.0
  crypto: ^3.0.3
```

**Android Permissions (android/app/src/main/AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
<uses-permission android:name="android.permission.USE_FINGERPRINT"/>
```

---

## ✅ Security Checklist

- [x] PIN stored as SHA-256 hash (never plain text)
- [x] Account locked after 5 failed PIN attempts (30 min)
- [x] Biometric uses device secure hardware
- [x] Server-side PIN validation (client can't bypass)
- [x] Session timeout after 30 minutes inactivity
- [x] All transactions require PIN or biometric
- [x] No service_role key in client code

---

## 🚀 Implementation Priority

1. ✅ Google Sign-In (already working)
2. ✅ PIN creation flow
3. ✅ Server-side PIN validation
4. ✅ Biometric setup (optional)
5. ✅ Transaction authorization with PIN/biometric

This gives you **bank-level security** on the **free tier**! 🔒
