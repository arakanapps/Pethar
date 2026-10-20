# Péthar Final Simplified Dashboard
## Only Receive & Pay | No Transfer Button | AKD = USD

---

## 🎯 Final Simplification

1. ✅ **Only 2 buttons:** Receive & Pay
2. ✅ **Pay = Transfer** (works for both users and merchants)
3. ✅ **AKD = USD** (1:1 peg)
4. ✅ **One USD Account** (USDT + USDC)
5. ❌ **No separate Transfer button** (merged into Pay)

---

## 📱 Final Dashboard Screen

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
    final userId = getCurrentUserId();
    
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
    final usdtBalance = userProfile!['usdt_balance'] ?? 0.0;
    final usdcBalance = userProfile!['usdc_balance'] ?? 0.0;
    final totalUSD = usdtBalance + usdcBalance;

    return Scaffold(
      appBar: AppBar(
        title: Text('Péthar'),
        actions: [
          IconButton(
            icon: Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: Icon(Icons.person_outline),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => ProfileScreen()),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadUserProfile,
        child: SingleChildScrollView(
          physics: AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // AKD Wallet Card - Only Receive & Pay
              _buildAKDWalletCard(akdBalance),
              SizedBox(height: 16),
              
              // USD Account Card
              _buildUSDAccountCard(totalUSD, usdtBalance, usdcBalance, kycTier),
              SizedBox(height: 24),
              
              // Quick Actions (no transfer here either)
              _buildQuickActions(),
              SizedBox(height: 24),
              
              // Recent Transactions
              Text(
                'Recent Transactions',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 12),
              _buildTransactionsList(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAKDWalletCard(double balance) {
    return Container(
      padding: EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFC8853F), Color(0xFFA86B2C)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Color(0xFFC8853F).withOpacity(0.3),
            blurRadius: 20,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'AKD Wallet',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '1 ₳ = \$1',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 16),
          
          // Balance
          Text(
            '₳ ${balance.toStringAsFixed(2)}',
            style: TextStyle(
              color: Colors.white,
              fontSize: 42,
              fontWeight: FontWeight.bold,
              letterSpacing: -1.5,
            ),
          ),
          SizedBox(height: 4),
          
          // USD Equivalent
          Text(
            '= \$${balance.toStringAsFixed(2)} USD',
            style: TextStyle(
              color: Colors.white.withOpacity(0.85),
              fontSize: 16,
            ),
          ),
          SizedBox(height: 28),
          
          // Only 2 Buttons: Receive & Pay
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  label: 'Receive',
                  icon: Icons.qr_code_2_rounded,
                  onTap: () => _showReceiveModal(),
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: _buildActionButton(
                  label: 'Pay',
                  icon: Icons.payment_rounded,
                  onTap: () => _showPayScreen(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String label,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 16),
          child: Column(
            children: [
              Icon(icon, size: 28, color: Color(0xFFC8853F)),
              SizedBox(height: 8),
              Text(
                label,
                style: TextStyle(
                  color: Color(0xFFC8853F),
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUSDAccountCard(
    double totalUSD,
    double usdtBalance,
    double usdcBalance,
    int kycTier,
  ) {
    final isLocked = kycTier < 2;

    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isLocked ? Colors.grey[100] : Colors.blue[50],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isLocked ? Colors.grey[300]! : Colors.blue[200]!,
          width: 1.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isLocked ? Icons.lock_rounded : Icons.account_balance_wallet_rounded,
                color: isLocked ? Colors.grey[600] : Colors.blue[700],
                size: 20,
              ),
              SizedBox(width: 8),
              Text(
                'USD Account',
                style: TextStyle(
                  color: isLocked ? Colors.grey[700] : Colors.blue[900],
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Spacer(),
              if (!isLocked)
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'Verified',
                    style: TextStyle(
                      color: Colors.green[800],
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          SizedBox(height: 16),
          
          if (isLocked) ..[
            // Locked state
            Text(
              '🔒 Complete KYC Level 2',
              style: TextStyle(
                color: Colors.grey[700],
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Unlock your crypto wallet to deposit and withdraw USDT/USDC',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 13,
              ),
            ),
            SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => KYCLevel2Screen()),
              ),
              icon: Icon(Icons.verified_user, size: 18),
              label: Text('Complete KYC Level 2'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFFC8853F),
                foregroundColor: Colors.white,
                minimumSize: Size(double.infinity, 48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ] else ..[
            // Unlocked state
            Text(
              '\$${totalUSD.toStringAsFixed(2)}',
              style: TextStyle(
                color: Colors.blue[900],
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 12),
            
            // USDT + USDC breakdown
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                color: Colors.green[100],
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  'T',
                                  style: TextStyle(
                                    color: Colors.green[800],
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(width: 8),
                            Text(
                              'USDT',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 8),
                        Text(
                          '\$${usdtBalance.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                color: Colors.blue[100],
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  'C',
                                  style: TextStyle(
                                    color: Colors.blue[800],
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(width: 8),
                            Text(
                              'USDC',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 8),
                        Text(
                          '\$${usdcBalance.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 16),
            
            // Deposit & Withdraw
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showDepositScreen(),
                    icon: Icon(Icons.add_circle_outline, size: 18),
                    label: Text('Deposit'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.blue[700],
                      side: BorderSide(color: Colors.blue[300]!),
                      padding: EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showWithdrawScreen(),
                    icon: Icon(Icons.remove_circle_outline, size: 18),
                    label: Text('Withdraw'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.blue[700],
                      side: BorderSide(color: Colors.blue[300]!),
                      padding: EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
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
            _buildQuickActionItem(
              icon: Icons.history_rounded,
              label: 'History',
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => TransactionHistoryScreen()),
              ),
            ),
            _buildQuickActionItem(
              icon: Icons.swap_horiz_rounded,
              label: 'Convert',
              onTap: () => _showConvertModal(),
            ),
            _buildQuickActionItem(
              icon: Icons.settings_rounded,
              label: 'Settings',
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => SettingsScreen()),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        child: Column(
          children: [
            Container(
              padding: EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Color(0xFFF0E3D0),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 26, color: Color(0xFFC8853F)),
            ),
            SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionsList() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Text(
          'No transactions yet',
          style: TextStyle(color: Colors.grey[600]),
        ),
      ),
    );
  }

  // Action handlers
  void _showReceiveModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ReceiveMoneyModal(userProfile: userProfile!),
    );
  }

  void _showPayScreen() {
    // Pay screen = Enter recipient + amount
    // Can scan QR or enter UID
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => PayScreen()),
    );
  }

  void _showDepositScreen() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => DepositScreen()),
    );
  }

  void _showWithdrawScreen() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => WithdrawScreen()),
    );
  }

  void _showConvertModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => ConvertModal(),
    );
  }
}
```

---

## 💸 Pay Screen (Replaces Transfer)

```dart
// lib/screens/pay_screen.dart

class PayScreen extends StatefulWidget {
  @override
  _PayScreenState createState() => _PayScreenState();
}

class _PayScreenState extends State<PayScreen> {
  final _recipientController = TextEditingController();
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Pay'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Scan QR section
            Container(
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Color(0xFFF0E3D0),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Icon(
                    Icons.qr_code_scanner_rounded,
                    size: 56,
                    color: Color(0xFFC8853F),
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Scan QR Code',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Scan to pay a person or merchant',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 13,
                    ),
                  ),
                  SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () async {
                      final scannedUID = await _scanQRCode();
                      if (scannedUID != null) {
                        setState(() {
                          _recipientController.text = scannedUID;
                        });
                      }
                    },
                    icon: Icon(Icons.camera_alt_rounded),
                    label: Text('Open Camera'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(0xFFC8853F),
                      padding: EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 32),
            
            Center(
              child: Text(
                'OR ENTER MANUALLY',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                ),
              ),
            ),
            SizedBox(height: 24),
            
            // Recipient field
            TextField(
              controller: _recipientController,
              decoration: InputDecoration(
                labelText: 'Pay to',
                hintText: 'AK123456 or @username',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                prefixIcon: Icon(Icons.person_outline),
              ),
            ),
            SizedBox(height: 16),
            
            // Amount field
            TextField(
              controller: _amountController,
              decoration: InputDecoration(
                labelText: 'Amount',
                hintText: '0.00',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                prefixIcon: Padding(
                  padding: EdgeInsets.all(12),
                  child: Text(
                    '₳',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
                suffixText: _amountController.text.isEmpty 
                  ? '' 
                  : '= \$${_amountController.text}',
              ),
              keyboardType: TextInputType.numberWithOptions(decimal: true),
              onChanged: (value) {
                setState(() {}); // Refresh to show USD equivalent
              },
            ),
            SizedBox(height: 16),
            
            // Note (optional)
            TextField(
              controller: _noteController,
              decoration: InputDecoration(
                labelText: 'Note (optional)',
                hintText: 'What\'s this payment for?',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                prefixIcon: Icon(Icons.note_outlined),
              ),
              maxLines: 2,
            ),
            SizedBox(height: 32),
            
            // Pay button
            ElevatedButton(
              onPressed: () => _processPayment(),
              child: Text(
                'Pay Now',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFFC8853F),
                minimumSize: Size(double.infinity, 56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<String?> _scanQRCode() async {
    // TODO: Implement QR scanner
    return null;
  }

  Future<void> _processPayment() async {
    // Validate
    if (_recipientController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter recipient')),
      );
      return;
    }

    if (_amountController.text.isEmpty || double.tryParse(_amountController.text) == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter a valid amount')),
      );
      return;
    }

    // Show PIN confirmation
    final pinConfirmed = await showDialog<bool>(
      context: context,
      builder: (_) => PINConfirmationDialog(),
    );

    if (pinConfirmed != true) return;

    // Process via server API
    // ...

    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Payment successful!'),
        backgroundColor: Colors.green,
      ),
    );
  }
}
```

---

## 📊 Visual Summary

### Dashboard Layout:

```
┌─────────────────────────────────────────┐
│  AKD Wallet                             │
│  ₳100.00 = $100.00                      │
│                                         │
│  ┌──────────┐    ┌──────────┐          │
│  │ Receive  │    │   Pay    │          │
│  └──────────┘    └──────────┘          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  USD Account 🔒 (KYC Level 1)           │
│  Complete KYC Level 2 to unlock         │
│  [Complete KYC Level 2]                 │
└─────────────────────────────────────────┘

Quick Actions:
[History] [Convert] [Settings]
```

### After KYC Level 2:

```
┌─────────────────────────────────────────┐
│  USD Account ✅                          │
│  $250.00                                │
│  USDT: $150.00  │  USDC: $100.00       │
│  [Deposit]  [Withdraw]                  │
└─────────────────────────────────────────┘
```

---

## ✅ Final Summary

### What Changed:
- ❌ **Removed Transfer button** - "Pay" does everything
- ✅ **Only 2 buttons:** Receive & Pay
- ✅ **Pay works for:**
  - Sending to friends (enter UID)
  - Paying merchants (scan QR)
  - Any person-to-person payment

### User Experience:
```
Receive Money:
  Tap "Receive" → Show QR code → Done

Pay Money:
  Tap "Pay" → Scan QR or Enter UID → Amount → PIN → Done
```

**Simplest possible UX! Perfect for mobile wallet.** 🎉
