# Péthar User Flow Implementation Guide
## Sign In/Up with Email/Google + KYC Levels

---

## 🔐 Authentication Screens

### 1. Welcome Screen

```dart
// lib/screens/welcome_screen.dart

class WelcomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo
              Image.asset('assets/pethar_logo.png', height: 120),
              SizedBox(height: 20),
              Text(
                'Péthar',
                style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold),
              ),
              Text(
                'ဖေ့သာ - Digital Cash for Everyone',
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              ),
              SizedBox(height: 60),
              
              // Sign In Button
              ElevatedButton(
                onPressed: () {
                  Navigator.push(context, 
                    MaterialPageRoute(builder: (_) => SignInScreen()));
                },
                child: Text('Sign In'),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 56),
                  backgroundColor: Color(0xFFC8853F),
                ),
              ),
              SizedBox(height: 16),
              
              // Sign Up Button
              OutlinedButton(
                onPressed: () {
                  Navigator.push(context, 
                    MaterialPageRoute(builder: (_) => SignUpScreen()));
                },
                child: Text('Sign Up'),
                style: OutlinedButton.styleFrom(
                  minimumSize: Size(double.infinity, 56),
                  side: BorderSide(color: Color(0xFFC8853F)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

### 2. Sign In Screen

```dart
// lib/screens/signin_screen.dart

class SignInScreen extends StatefulWidget {
  @override
  _SignInScreenState createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Sign In')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Welcome Back',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 40),
            
            // Google Sign-In Button
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _signInWithGoogle,
              icon: Image.asset('assets/google_icon.png', height: 24),
              label: Text('Continue with Google'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black87,
                minimumSize: Size(double.infinity, 56),
                side: BorderSide(color: Colors.grey[300]!),
              ),
            ),
            SizedBox(height: 24),
            
            // Divider
            Row(
              children: [
                Expanded(child: Divider()),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text('OR', style: TextStyle(color: Colors.grey)),
                ),
                Expanded(child: Divider()),
              ],
            ),
            SizedBox(height: 24),
            
            // Email Field
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            SizedBox(height: 16),
            
            // Password Field
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(
                labelText: 'Password',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.lock),
              ),
              obscureText: true,
            ),
            SizedBox(height: 24),
            
            // Sign In Button
            ElevatedButton(
              onPressed: _isLoading ? null : _signInWithEmail,
              child: _isLoading 
                ? CircularProgressIndicator(color: Colors.white)
                : Text('Sign In'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 56),
                backgroundColor: Color(0xFFC8853F),
              ),
            ),
            SizedBox(height: 16),
            
            // Forgot Password
            TextButton(
              onPressed: () {
                // TODO: Implement password reset
              },
              child: Text('Forgot Password?'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _signInWithGoogle() async {
    setState(() => _isLoading = true);
    
    try {
      // Firebase Google Sign-In
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) {
        setState(() => _isLoading = false);
        return;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
      final user = userCredential.user!;

      // Check if user has PIN set
      final profile = await _checkUserProfile(user.uid);
      
      if (profile == null || profile['pin_hash'] == null) {
        // No PIN → This is a sign-up, redirect to sign-up screen
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please sign up first')),
        );
        await FirebaseAuth.instance.signOut();
        setState(() => _isLoading = false);
        return;
      }

      // User exists with PIN → Show PIN entry
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => EnterPINScreen(userId: user.uid)),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Sign-in failed: $e')),
      );
      setState(() => _isLoading = false);
    }
  }

  Future<void> _signInWithEmail() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter email and password')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Sign in with email/password
      final userCredential = await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );

      final user = userCredential.user!;

      // Check if user has PIN
      final profile = await _checkUserProfile(user.uid);
      
      if (profile == null || profile['pin_hash'] == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please sign up first')),
        );
        await FirebaseAuth.instance.signOut();
        setState(() => _isLoading = false);
        return;
      }

      // User exists → Show PIN entry
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => EnterPINScreen(userId: user.uid)),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Sign-in failed: ${e.toString()}')),
      );
      setState(() => _isLoading = false);
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

---

### 3. Sign Up Screen

```dart
// lib/screens/signup_screen.dart

class SignUpScreen extends StatefulWidget {
  @override
  _SignUpScreenState createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _needsEmailVerification = false;
  String? _verificationUserId;

  @override
  Widget build(BuildContext context) {
    if (_needsEmailVerification) {
      return EmailVerificationScreen(
        userId: _verificationUserId!,
        email: _emailController.text,
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text('Sign Up')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Create Account',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 40),
            
            // Google Sign-Up
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _signUpWithGoogle,
              icon: Image.asset('assets/google_icon.png', height: 24),
              label: Text('Continue with Google'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black87,
                minimumSize: Size(double.infinity, 56),
                side: BorderSide(color: Colors.grey[300]!),
              ),
            ),
            SizedBox(height: 24),
            
            // Divider
            Row(
              children: [
                Expanded(child: Divider()),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text('OR', style: TextStyle(color: Colors.grey)),
                ),
                Expanded(child: Divider()),
              ],
            ),
            SizedBox(height: 24),
            
            // Email Field
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            SizedBox(height: 16),
            
            // Password Field
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(
                labelText: 'Password (min 6 characters)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.lock),
              ),
              obscureText: true,
            ),
            SizedBox(height: 24),
            
            // Sign Up Button
            ElevatedButton(
              onPressed: _isLoading ? null : _signUpWithEmail,
              child: _isLoading
                ? CircularProgressIndicator(color: Colors.white)
                : Text('Sign Up'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 56),
                backgroundColor: Color(0xFFC8853F),
              ),
            ),
            SizedBox(height: 16),
            
            // Terms
            Text(
              'By signing up, you agree to our Terms of Service and Privacy Policy',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _signUpWithGoogle() async {
    setState(() => _isLoading = true);
    
    try {
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) {
        setState(() => _isLoading = false);
        return;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
      final user = userCredential.user!;

      // Check if user already exists
      final existingProfile = await _checkUserProfile(user.uid);
      
      if (existingProfile != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Account already exists. Please sign in.')),
        );
        await FirebaseAuth.instance.signOut();
        setState(() => _isLoading = false);
        return;
      }

      // Create user profile in Supabase
      await _createUserProfile(user.uid, user.email!, user.displayName ?? '');

      // Navigate to PIN creation
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => CreatePINScreen(userId: user.uid)),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Sign-up failed: $e')),
      );
      setState(() => _isLoading = false);
    }
  }

  Future<void> _signUpWithEmail() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter email and password')),
      );
      return;
    }

    if (_passwordController.text.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Password must be at least 6 characters')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Create Firebase Auth account
      final userCredential = await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );

      final user = userCredential.user!;

      // Send email verification
      await user.sendEmailVerification();

      // Create user profile
      await _createUserProfile(user.uid, user.email!, '');

      // Show email verification screen
      setState(() {
        _needsEmailVerification = true;
        _verificationUserId = user.uid;
        _isLoading = false;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Sign-up failed: ${e.toString()}')),
      );
      setState(() => _isLoading = false);
    }
  }

  Future<void> _createUserProfile(String userId, String email, String name) async {
    // Generate unique UID
    final uid = 'AK${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

    await supabase.from('user_profiles').insert({
      'user_id': userId,
      'uid': uid,
      'email': email,
      'name': name,
      'balance': 0.0,
      'usd_account_balance': 0.0,
      'kyc_tier': 1, // Default to Level 1
      'created_at': DateTime.now().toIso8601String(),
    });

    // Create default AKD account
    await supabase.from('accounts').insert({
      'user_id': userId,
      'currency': 'AKD',
      'balance': 0.0,
    });
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

---

### 4. Email Verification Screen

```dart
// lib/screens/email_verification_screen.dart

class EmailVerificationScreen extends StatefulWidget {
  final String userId;
  final String email;

  const EmailVerificationScreen({required this.userId, required this.email});

  @override
  _EmailVerificationScreenState createState() => _EmailVerificationScreenState();
}

class _EmailVerificationScreenState extends State<EmailVerificationScreen> {
  final _otpController = TextEditingController();
  bool _isVerifying = false;
  Timer? _timer;
  int _secondsRemaining = 60;

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
    return Scaffold(
      appBar: AppBar(title: Text('Verify Email')),
      body: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.email, size: 80, color: Color(0xFFC8853F)),
            SizedBox(height: 24),
            Text(
              'Check Your Email',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            Text(
              'We sent a verification code to',
              style: TextStyle(color: Colors.grey[600]),
            ),
            Text(
              widget.email,
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 40),
            
            // OTP Field
            TextField(
              controller: _otpController,
              decoration: InputDecoration(
                labelText: 'Verification Code',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.pin),
              ),
              keyboardType: TextInputType.number,
              maxLength: 6,
            ),
            SizedBox(height: 24),
            
            // Verify Button
            ElevatedButton(
              onPressed: _isVerifying ? null : _verifyEmail,
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
            _secondsRemaining > 0
              ? Text(
                  'Resend code in $_secondsRemaining seconds',
                  style: TextStyle(color: Colors.grey[600]),
                )
              : TextButton(
                  onPressed: _resendCode,
                  child: Text('Resend Code'),
                ),
          ],
        ),
      ),
    );
  }

  Future<void> _verifyEmail() async {
    setState(() => _isVerifying = true);

    try {
      // Check if email is verified
      await FirebaseAuth.instance.currentUser?.reload();
      final isVerified = FirebaseAuth.instance.currentUser?.emailVerified ?? false;

      if (isVerified) {
        // Email verified → Go to PIN creation
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => CreatePINScreen(userId: widget.userId)),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please verify your email first')),
        );
        setState(() => _isVerifying = false);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Verification failed: $e')),
      );
      setState(() => _isVerifying = false);
    }
  }

  Future<void> _resendCode() async {
    try {
      await FirebaseAuth.instance.currentUser?.sendEmailVerification();
      setState(() {
        _secondsRemaining = 60;
      });
      _startTimer();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Verification email sent')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to resend: $e')),
      );
    }
  }
}
```

---

## 🏠 **Dashboard Implementation (KYC Levels)**

### Dashboard Layout:

```dart
// lib/screens/dashboard_screen.dart

class DashboardScreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? userProfile;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    final userId = FirebaseAuth.instance.currentUser?.uid;
    if (userId == null) return;

    final response = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    setState(() {
      userProfile = response.data;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final kycTier = userProfile!['kyc_tier'] ?? 1;
    final akdBalance = userProfile!['balance'] ?? 0.0;
    final usdBalance = userProfile!['usd_account_balance'] ?? 0.0;

    return Scaffold(
      appBar: AppBar(
        title: Text('Péthar'),
        actions: [
          IconButton(
            icon: Icon(Icons.person),
            onPressed: () {
              // Navigate to profile
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // AKD Wallet Card
            _buildAKDWalletCard(akdBalance, kycTier),
            SizedBox(height: 16),
            
            // USD Account Card
            _buildUSDAccountCard(usdBalance, kycTier),
            SizedBox(height: 24),
            
            // Quick Actions
            _buildQuickActions(kycTier),
            SizedBox(height: 24),
            
            // Recent Transactions
            Text(
              'Recent Transactions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            // TODO: Add transaction list
          ],
        ),
      ),
    );
  }

  Widget _buildAKDWalletCard(double balance, int kycTier) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFC8853F), Color(0xFFA86B2C)],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'AKD Wallet',
            style: TextStyle(color: Colors.white70, fontSize: 14),
          ),
          SizedBox(height: 8),
          Text(
            '₳ ${balance.toStringAsFixed(2)}',
            style: TextStyle(
              color: Colors.white,
              fontSize: 36,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _showReceiveQR(),
                  icon: Icon(Icons.qr_code, size: 18),
                  label: Text('Receive'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Color(0xFFC8853F),
                  ),
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _showTransferScreen(),
                  icon: Icon(Icons.send, size: 18),
                  label: Text('Transfer'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Color(0xFFC8853F),
                  ),
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _showPayScreen(),
                  icon: Icon(Icons.payment, size: 18),
                  label: Text('Pay'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Color(0xFFC8853F),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildUSDAccountCard(double balance, int kycTier) {
    final isLocked = kycTier < 2;

    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isLocked ? Colors.grey[300] : Colors.blue[50],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isLocked ? Colors.grey[400]! : Colors.blue[200]!,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'USD Account',
                style: TextStyle(
                  color: isLocked ? Colors.grey[600] : Colors.blue[900],
                  fontSize: 14,
                ),
              ),
              SizedBox(width: 8),
              if (isLocked)
                Icon(Icons.lock, size: 16, color: Colors.grey[600]),
            ],
          ),
          SizedBox(height: 8),
          Text(
            isLocked ? '🔒 Complete KYC Level 2' : '\$ ${balance.toStringAsFixed(2)}',
            style: TextStyle(
              color: isLocked ? Colors.grey[700] : Colors.blue[900],
              fontSize: isLocked ? 18 : 36,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 20),
          if (isLocked)
            ElevatedButton(
              onPressed: () => _navigateToKYC(),
              child: Text('Complete KYC Level 2'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 48),
                backgroundColor: Color(0xFFC8853F),
              ),
            )
          else
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _showDepositScreen(),
                    child: Text('Deposit'),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _showWithdrawScreen(),
                    child: Text('Withdraw'),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(int kycTier) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildActionButton(
              icon: Icons.qr_code_scanner,
              label: 'Scan QR',
              onTap: () {},
            ),
            _buildActionButton(
              icon: Icons.history,
              label: 'History',
              onTap: () {},
            ),
            _buildActionButton(
              icon: Icons.settings,
              label: 'Settings',
              onTap: () {},
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Color(0xFFF0E3D0),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 28, color: Color(0xFFC8853F)),
          ),
          SizedBox(height: 8),
          Text(label, style: TextStyle(fontSize: 12)),
        ],
      ),
    );
  }

  void _showReceiveQR() {
    // Show QR code with user UID
  }

  void _showTransferScreen() {
    // Navigate to transfer screen
  }

  void _showPayScreen() {
    // Navigate to pay screen (scan merchant QR)
  }

  void _navigateToKYC() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => KYCLevel2Screen()),
    );
  }

  void _showDepositScreen() {
    // Show deposit (disabled for KYC Level 1)
  }

  void _showWithdrawScreen() {
    // Show withdraw (disabled for KYC Level 1)
  }
}
```

---

This comprehensive guide shows the exact flow you described. Want me to continue with the KYC Level 2 implementation screens?
