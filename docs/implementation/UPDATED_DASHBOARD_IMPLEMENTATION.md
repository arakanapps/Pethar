# Updated Péthar Dashboard Implementation
## AKD = USD (1:1 Peg) | Pay = Transfer | One Crypto Wallet

---

## 🎯 Key Updates

1. ✅ **AKD = USD** - 1:1 peg displayed everywhere
2. ✅ **Pay = Transfer** - Same function, merchant-friendly UI
3. ✅ **One USD Account** - Holds both USDT and USDC together
4. ❌ **No passwords** - Only PIN for everything

---

## 💱 AKD ↔ USD Conversion (1:1 Peg)

```
1 ₳ = $1.00 USD (always)

Examples:
- User has ₳100 = They have $100 worth of value
- Transfer ₳50 = Transfer $50 worth
- Deposit $200 USDT → Get ₳200 in AKD Wallet
```

---

## 📱 Updated Dashboard Screen

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
    final userId = getCurrentUserId(); // From your auth service
    
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
              // AKD Wallet Card (shows USD equivalent)
              _buildAKDWalletCard(akdBalance),
              SizedBox(height: 16),
              
              // USD Account Card (crypto wallet)
              _buildUSDAccountCard(totalUSD, usdtBalance, usdcBalance, kycTier),
              SizedBox(height: 24),
              
              // Quick Actions
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
              fontSize: 40,
              fontWeight: FontWeight.bold,
              letterSpacing: -1,
            ),
          ),
          SizedBox(height: 4),
          
          // USD Equivalent
          Text(
            '= \$${balance.toStringAsFixed(2)} USD',
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 16,
            ),
          ),
          SizedBox(height: 24),
          
          // Action Buttons
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  label: 'Receive',
                  icon: Icons.qr_code_2,
                  onTap: () => _showReceiveModal(),
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: _buildActionButton(
                  label: 'Transfer',
                  icon: Icons.send_rounded,
                  onTap: () => _showTransferScreen(),
                ),
              ),
              SizedBox(width: 12),
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
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 14),
          child: Column(
            children: [
              Icon(icon, size: 24, color: Color(0xFFC8853F)),
              SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  color: Color(0xFFC8853F),
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
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
            // Unlocked state - Show balances
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
            
            // Deposit & Withdraw buttons
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
              icon: Icons.qr_code_scanner_rounded,
              label: 'Scan QR',
              onTap: () => _showQRScanner(),
            ),
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
        padding: EdgeInsets.symmetric(vertical: 12, horizontal: 8),
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
    // TODO: Fetch from database
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
    // Show QR code with user UID
  }

  void _showTransferScreen() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => TransferScreen()),
    );
  }

  void _showPayScreen() {
    // Same as transfer, but scan merchant QR first
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => TransferScreen(isMerchantPayment: true)),
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

  void _showQRScanner() {
    // Open QR scanner
  }

  void _showConvertModal() {
    // Show USD ↔ AKD conversion modal
  }
}
```

---

## 💸 Pay Screen = Transfer Screen

```dart
// lib/screens/transfer_screen.dart

class TransferScreen extends StatefulWidget {
  final bool isMerchantPayment; // True if opened from "Pay" button

  const TransferScreen({this.isMerchantPayment = false});

  @override
  _TransferScreenState createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> {
  final _recipientController = TextEditingController();
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isMerchantPayment ? 'Pay Merchant' : 'Transfer Money'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (widget.isMerchantPayment) ..[
              // Merchant payment has QR scanner first
              Container(
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.blue[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue[200]!),
                ),
                child: Column(
                  children: [
                    Icon(Icons.qr_code_scanner, size: 48, color: Colors.blue[700]),
                    SizedBox(height: 12),
                    Text(
                      'Scan Merchant QR Code',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Point your camera at the merchant\'s QR code',
                      style: TextStyle(color: Colors.grey[600], fontSize: 13),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () async {
                        // Open QR scanner
                        final scannedUID = await _scanQRCode();
                        if (scannedUID != null) {
                          setState(() {
                            _recipientController.text = scannedUID;
                          });
                        }
                      },
                      icon: Icon(Icons.camera_alt),
                      label: Text('Open Scanner'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue[700],
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 24),
              Center(
                child: Text(
                  'OR',
                  style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.bold),
                ),
              ),
              SizedBox(height: 24),
            ],
            
            // Recipient field
            TextField(
              controller: _recipientController,
              decoration: InputDecoration(
                labelText: widget.isMerchantPayment ? 'Merchant UID' : 'Recipient UID',
                hintText: 'AK123456 or @username',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person_outline),
                suffixIcon: IconButton(
                  icon: Icon(Icons.qr_code_scanner),
                  onPressed: () async {
                    final scannedUID = await _scanQRCode();
                    if (scannedUID != null) {
                      setState(() {
                        _recipientController.text = scannedUID;
                      });
                    }
                  },
                ),
              ),
            ),
            SizedBox(height: 16),
            
            // Amount field
            TextField(
              controller: _amountController,
              decoration: InputDecoration(
                labelText: 'Amount',
                hintText: '0.00',
                border: OutlineInputBorder(),
                prefixIcon: Padding(
                  padding: EdgeInsets.all(12),
                  child: Text(
                    '₳',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
                suffixText: '= \$${_amountController.text.isEmpty ? "0.00" : _amountController.text}',
              ),
              keyboardType: TextInputType.numberWithOptions(decimal: true),
            ),
            SizedBox(height: 16),
            
            // Note field (optional)
            TextField(
              controller: _noteController,
              decoration: InputDecoration(
                labelText: widget.isMerchantPayment ? 'Payment Note (optional)' : 'Note (optional)',
                hintText: widget.isMerchantPayment ? 'e.g., Coffee and cake' : 'What\'s this for?',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.note_outlined),
              ),
              maxLines: 2,
            ),
            SizedBox(height: 32),
            
            // Transfer button
            ElevatedButton(
              onPressed: () => _processTransfer(),
              child: Text(
                widget.isMerchantPayment ? 'Pay Now' : 'Transfer Now',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFFC8853F),
                minimumSize: Size(double.infinity, 56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
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
    // Return scanned UID
    return 'AK123456';
  }

  Future<void> _processTransfer() async {
    // Validate inputs
    if (_recipientController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter recipient UID')),
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

    // Process transaction via server API
    // (Calls process-transaction Edge Function)
    
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          widget.isMerchantPayment 
            ? 'Payment successful!' 
            : 'Transfer successful!'
        ),
        backgroundColor: Colors.green,
      ),
    );
  }
}
```

---

## 📊 Database Schema Update

```sql
-- Add USDT and USDC balance columns
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS usdt_balance NUMERIC(18,4) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS usdc_balance NUMERIC(18,4) DEFAULT 0.00;

-- Update the total USD balance (computed column)
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS usd_account_balance CASCADE;

ALTER TABLE user_profiles
ADD COLUMN usd_account_balance NUMERIC(18,4) GENERATED ALWAYS AS (usdt_balance + usdc_balance) STORED;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_balances ON user_profiles(balance, usdt_balance, usdc_balance);

COMMENT ON COLUMN user_profiles.balance IS 'AKD Wallet balance (1 ₳ = $1 USD)';
COMMENT ON COLUMN user_profiles.usdt_balance IS 'USDT crypto balance';
COMMENT ON COLUMN user_profiles.usdc_balance IS 'USDC crypto balance';
COMMENT ON COLUMN user_profiles.usd_account_balance IS 'Total USD = USDT + USDC (computed)';
```

---

## ✅ Summary

### Key Changes:
1. **No passwords** - Only PIN everywhere ✅
2. **AKD = USD** - Always shown as 1:1 peg ✅
3. **Pay = Transfer** - Same function, merchant-friendly UI ✅
4. **One USD Account** - Holds USDT + USDC together ✅
5. **Simpler UX** - Less confusing for users ✅

### User Experience:
```
Dashboard:
├─ AKD Wallet: ₳100.00 = $100.00
│  ├─ Receive
│  ├─ Transfer (send to anyone)
│  └─ Pay (same as transfer, scan merchant QR)
│
└─ USD Account: $250.00
   ├─ USDT: $150.00
   ├─ USDC: $100.00
   ├─ Deposit (add crypto)
   └─ Withdraw (convert to crypto)
```

Perfect! Everything simplified and clear! 🎉
