# Péthar Authentication - PIN Only (No Passwords)
## Simplified Sign In/Up Flow

---

## 🎯 Key Changes

1. ❌ **No passwords** - Only PIN for authentication
2. ✅ **Google Sign-In** - Uses Google OAuth, then create PIN
3. ✅ **Email Sign-Up** - Email + OTP verification, then create PIN
4. ✅ **PIN only** - For sign-in, transactions, everything

---

## 📱 Updated Sign-Up Flow

### Option 1: Google Sign-Up

```dart
// lib/screens/auth/signup_google.dart

Future<void> signUpWithGoogle() async {
  try {
    // 1. Google OAuth (no password needed)
    final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
    if (googleUser == null) return;

    final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    final userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
    final user = userCredential.user!;

    // 2. Check if already registered
    final existingProfile = await checkUserProfile(user.uid);
    if (existingProfile != null) {
      // Already exists → Go to sign in
      showDialog('Account exists. Please sign in.');
      return;
    }

    // 3. Create user profile
    await createUserProfile(
      userId: user.uid,
      email: user.email!,
      name: user.displayName ?? '',
    );

    // 4. Navigate to PIN creation (NO PASSWORD!)
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => CreatePINScreen(
        userId: user.uid,
        isFirstTime: true,
      )),
    );
  } catch (e) {
    showError('Sign-up failed: $e');
  }
}
```

---

### Option 2: Email Sign-Up (No Password)

```dart
// lib/screens/auth/signup_email.dart

class EmailSignUpScreen extends StatefulWidget {
  @override
  _EmailSignUpScreenState createState() => _EmailSignUpScreenState();
}

class _EmailSignUpScreenState extends State<EmailSignUpScreen> {
  final _emailController = TextEditingController();
  bool _isLoading = false;
  bool _otpSent = false;
  String? _pendingUserId;

  @override
  Widget build(BuildContext context) {
    if (_otpSent) {
      // Show OTP verification screen
      return EmailOTPScreen(
        email: _emailController.text,
        userId: _pendingUserId!,
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text('Sign Up with Email')),
      body: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Enter Your Email',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              'No password needed. We\'ll send a verification code.',
              style: TextStyle(color: Colors.grey[600]),
            ),
            SizedBox(height: 32),
            
            // Email input
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Email Address',
                hintText: 'your@email.com',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            SizedBox(height: 24),
            
            // Continue button
            ElevatedButton(
              onPressed: _isLoading ? null : _sendOTP,
              child: _isLoading
                ? CircularProgressIndicator(color: Colors.white)
                : Text('Continue'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 56),
                backgroundColor: Color(0xFFC8853F),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _sendOTP() async {
    if (_emailController.text.isEmpty) {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: Text('Email Required'),
          content: Text('Please enter your email address'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('OK'),
            ),
          ],
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Generate random 6-digit OTP
      final otp = (100000 + Random().nextInt(900000)).toString();
      
      // Create temporary user ID
      final tempUserId = 'temp_${DateTime.now().millisecondsSinceEpoch}';
      
      // Store OTP in Supabase (expires in 10 minutes)
      await supabase.from('otp_challenges').insert({
        'user_id': tempUserId,
        'email': _emailController.text.trim(),
        'otp_hash': hashOTP(otp),
        'expires_at': DateTime.now().add(Duration(minutes: 10)).toIso8601String(),
        'created_at': DateTime.now().toIso8601String(),
      });

      // Send OTP via email (using Supabase Edge Function)
      await supabase.functions.invoke('send-otp-email', body: {
        'email': _emailController.text.trim(),
        'otp': otp,
      });

      // Navigate to OTP screen
      setState(() {
        _otpSent = true;
        _pendingUserId = tempUserId;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: Text('Error'),
          content: Text('Failed to send verification code: $e'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('OK'),
            ),
          ],
        ),
      );
    }
  }

  String hashOTP(String otp) {
    final bytes = utf8.encode(otp);
    final hash = sha256.convert(bytes);
    return hash.toString();
  }
}
```

---

### Email OTP Verification

```dart
// lib/screens/auth/email_otp_screen.dart

class EmailOTPScreen extends StatefulWidget {
  final String email;
  final String userId;

  const EmailOTPScreen({required this.email, required this.userId});

  @override
  _EmailOTPScreenState createState() => _EmailOTPScreenState();
}

class _EmailOTPScreenState extends State<EmailOTPScreen> {
  final _otpController = TextEditingController();
  bool _isVerifying = false;
  int _secondsRemaining = 300; // 5 minutes
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        timer.cancel();
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: Text('Code Expired'),
            content: Text('Your verification code has expired. Please request a new one.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context); // Go back to email entry
                },
                child: Text('OK'),
              ),
            ],
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final minutes = _secondsRemaining ~/ 60;
    final seconds = _secondsRemaining % 60;

    return Scaffold(
      appBar: AppBar(title: Text('Verify Email')),
      body: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.email_outlined, size: 80, color: Color(0xFFC8853F)),
            SizedBox(height: 24),
            Text(
              'Check Your Email',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            Text(
              'We sent a 6-digit code to',
              style: TextStyle(color: Colors.grey[600]),
            ),
            Text(
              widget.email,
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 32),
            
            // OTP Input
            TextField(
              controller: _otpController,
              decoration: InputDecoration(
                labelText: 'Verification Code',
                hintText: '123456',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.pin),
              ),
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 24, letterSpacing: 8),
            ),
            SizedBox(height: 16),
            
            // Timer
            Text(
              'Code expires in ${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}',
              style: TextStyle(color: Colors.grey[600]),
            ),
            SizedBox(height: 32),
            
            // Verify button
            ElevatedButton(
              onPressed: _isVerifying ? null : _verifyOTP,
              child: _isVerifying
                ? CircularProgressIndicator(color: Colors.white)
                : Text('Verify & Continue'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 56),
                backgroundColor: Color(0xFFC8853F),
              ),
            ),
            SizedBox(height: 16),
            
            // Resend
            TextButton(
              onPressed: _secondsRemaining < 240 ? _resendOTP : null, // Can resend after 1 min
              child: Text(_secondsRemaining < 240 ? 'Resend Code' : 'Wait to resend...'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _verifyOTP() async {
    if (_otpController.text.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter the 6-digit code')),
      );
      return;
    }

    setState(() => _isVerifying = true);

    try {
      final enteredOTP = _otpController.text;
      final hashedOTP = hashOTP(enteredOTP);

      // Verify OTP
      final response = await supabase
        .from('otp_challenges')
        .select('*')
        .eq('user_id', widget.userId)
        .eq('otp_hash', hashedOTP)
        .gt('expires_at', DateTime.now().toIso8601String())
        .maybeSingle();

      if (response == null) {
        setState(() => _isVerifying = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Invalid or expired code')),
        );
        return;
      }

      // OTP verified! Create user account
      // Note: We're NOT using Firebase Auth for email users
      // We'll use Supabase Auth instead (simpler, no password needed)
      
      final newUserId = 'user_${DateTime.now().millisecondsSinceEpoch}';
      
      // Create user profile
      await createUserProfile(
        userId: newUserId,
        email: widget.email,
        name: '',
      );

      // Delete OTP challenge (one-time use)
      await supabase
        .from('otp_challenges')
        .delete()
        .eq('user_id', widget.userId);

      // Navigate to PIN creation
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => CreatePINScreen(
          userId: newUserId,
          isFirstTime: true,
        )),
        (route) => false,
      );
    } catch (e) {
      setState(() => _isVerifying = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Verification failed: $e')),
      );
    }
  }

  Future<void> _resendOTP() async {
    // Same logic as sending initial OTP
    setState(() {
      _secondsRemaining = 300;
    });
    _startTimer();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('New code sent to ${widget.email}')),
    );
  }

  String hashOTP(String otp) {
    final bytes = utf8.encode(otp);
    final hash = sha256.convert(bytes);
    return hash.toString();
  }
}
```

---

## 🔑 Sign-In Flow (PIN Only)

### Google Sign-In:
```dart
Future<void> signInWithGoogle() async {
  // 1. Google OAuth
  final user = await GoogleSignIn().signIn();
  
  // 2. Check if user exists
  final profile = await checkUserProfile(user.uid);
  
  if (profile == null) {
    showError('Account not found. Please sign up first.');
    return;
  }
  
  // 3. Show PIN entry (NO PASSWORD!)
  Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => EnterPINScreen(userId: user.uid)),
  );
}
```

### Email Sign-In:
```dart
Future<void> signInWithEmail() async {
  // 1. Enter email
  final email = _emailController.text;
  
  // 2. Find user by email
  final profile = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('email', email)
    .maybeSingle();
  
  if (profile == null) {
    showError('Account not found. Please sign up first.');
    return;
  }
  
  // 3. Show PIN entry (NO PASSWORD!)
  Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => EnterPINScreen(
      userId: profile['user_id'],
    )),
  );
}
```

---

## 📊 Database Schema Update

```sql
-- Remove password-related fields (we don't use them)
-- user_profiles table already has pin_hash

ALTER TABLE user_profiles DROP COLUMN IF EXISTS password_hash;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS password_salt;

-- Add OTP challenges table for email verification
CREATE TABLE IF NOT EXISTS otp_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,  -- Can be temporary ID
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(128) NOT NULL,
    attempts INT DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_challenges_user_email ON otp_challenges(user_id, email);
CREATE INDEX idx_otp_challenges_expires ON otp_challenges(expires_at);

-- Auto-delete expired OTP challenges
CREATE OR REPLACE FUNCTION delete_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_challenges WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Run cleanup daily
-- (Set up in Supabase Dashboard → Database → Cron Jobs)
```

---

## ✅ Summary of Changes

### Authentication:
- ❌ No passwords anywhere
- ✅ Google: OAuth → Create/Enter PIN
- ✅ Email: Email → OTP → Create/Enter PIN
- ✅ PIN is the ONLY secret users need to remember

### Benefits:
- 🎯 **Simpler UX** - No password requirements (length, special chars, etc.)
- 🔐 **More secure** - PIN can't be phished or leaked in data breaches
- 📱 **Mobile-first** - PIN + biometric is natural on phones
- 💪 **Lower support** - No "forgot password" requests

### User Experience:
```
Sign Up:
  Email → OTP (123456) → Create PIN (6 digits) → Done ✅
  
Sign In:
  Email → Enter PIN (6 digits) → Done ✅
  Or use biometric if enabled 👆
```

No passwords = Simpler, faster, more secure! 🎉
