# KYC Level 2 Implementation Guide
## Complete Profile → Submit for Admin Approval → Unlock USD Account

---

## 🎯 KYC Level 2 Flow

```
User Dashboard (KYC Level 1)
        ↓
[Tap "Complete KYC Level 2" button]
        ↓
Step 1: Create Username
        ↓
Step 2: Personal Information
        ↓
Step 3: Upload National ID
        ↓
Step 4: Review & Submit
        ↓
Status: "Pending Admin Approval"
        ↓
[Admin reviews in admin.pethar.co.uk]
        ↓
   Approved? → Yes → Notification sent
        ↓
KYC Level 2 Unlocked!
        ↓
✅ USD Account accessible
✅ Deposit/Withdraw enabled
```

---

## 📱 KYC Level 2 Screen Implementation

### Step 1: Create Username

```dart
// lib/screens/kyc/create_username_screen.dart

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class CreateUsernameScreen extends StatefulWidget {
  @override
  _CreateUsernameScreenState createState() => _CreateUsernameScreenState();
}

class _CreateUsernameScreenState extends State<CreateUsernameScreen> {
  final _usernameController = TextEditingController();
  bool _isChecking = false;
  bool _isAvailable = false;
  String? _errorMessage;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Create Username'),
        leading: IconButton(
          icon: Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Progress indicator
            LinearProgressIndicator(value: 0.25, backgroundColor: Colors.grey[200]),
            SizedBox(height: 8),
            Text('Step 1 of 4', style: TextStyle(fontSize: 12, color: Colors.grey)),
            SizedBox(height: 32),
            
            Text(
              'Choose Your Username',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              'This will be your unique identifier for receiving money',
              style: TextStyle(color: Colors.grey[600]),
            ),
            SizedBox(height: 32),
            
            // Username input
            TextField(
              controller: _usernameController,
              decoration: InputDecoration(
                labelText: 'Username',
                hintText: '@username or AK123456',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.alternate_email),
                suffixIcon: _isChecking
                  ? Padding(
                      padding: EdgeInsets.all(12),
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                  : _isAvailable
                    ? Icon(Icons.check_circle, color: Colors.green)
                    : null,
                errorText: _errorMessage,
              ),
              onChanged: (value) => _checkUsernameAvailability(value),
            ),
            SizedBox(height: 16),
            
            // Rules
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Username rules:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                  SizedBox(height: 4),
                  Text('• 3-20 characters', style: TextStyle(fontSize: 12)),
                  Text('• Letters, numbers, underscore only', style: TextStyle(fontSize: 12)),
                  Text('• No spaces or special characters', style: TextStyle(fontSize: 12)),
                ],
              ),
            ),
            Spacer(),
            
            // Continue button
            ElevatedButton(
              onPressed: _isAvailable ? _continueToNextStep : null,
              child: Text('Continue'),
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

  Future<void> _checkUsernameAvailability(String username) async {
    if (username.isEmpty) {
      setState(() {
        _isAvailable = false;
        _errorMessage = null;
      });
      return;
    }

    // Validate format
    if (username.length < 3 || username.length > 20) {
      setState(() {
        _isAvailable = false;
        _errorMessage = 'Username must be 3-20 characters';
      });
      return;
    }

    if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(username)) {
      setState(() {
        _isAvailable = false;
        _errorMessage = 'Only letters, numbers, and underscore allowed';
      });
      return;
    }

    setState(() {
      _isChecking = true;
      _errorMessage = null;
    });

    try {
      // Check if username exists
      final response = await Supabase.instance.client
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      setState(() {
        _isChecking = false;
        _isAvailable = response == null;
        _errorMessage = response != null ? 'Username already taken' : null;
      });
    } catch (e) {
      setState(() {
        _isChecking = false;
        _isAvailable = false;
        _errorMessage = 'Failed to check availability';
      });
    }
  }

  void _continueToNextStep() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PersonalInfoScreen(
          username: _usernameController.text,
        ),
      ),
    );
  }
}
```

---

### Step 2: Personal Information

```dart
// lib/screens/kyc/personal_info_screen.dart

class PersonalInfoScreen extends StatefulWidget {
  final String username;

  const PersonalInfoScreen({required this.username});

  @override
  _PersonalInfoScreenState createState() => _PersonalInfoScreenState();
}

class _PersonalInfoScreenState extends State<PersonalInfoScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _nationalIdController = TextEditingController();
  final _addressController = TextEditingController();
  DateTime? _selectedDate;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Personal Information'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Progress
              LinearProgressIndicator(value: 0.5, backgroundColor: Colors.grey[200]),
              SizedBox(height: 8),
              Text('Step 2 of 4', style: TextStyle(fontSize: 12, color: Colors.grey)),
              SizedBox(height: 32),
              
              Text(
                'Complete Your Profile',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 32),
              
              // Full Name
              TextFormField(
                controller: _fullNameController,
                decoration: InputDecoration(
                  labelText: 'Full Name',
                  hintText: 'As shown on National ID',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your full name';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),
              
              // National ID
              TextFormField(
                controller: _nationalIdController,
                decoration: InputDecoration(
                  labelText: 'National ID Number',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.credit_card),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your National ID number';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),
              
              // Date of Birth
              InkWell(
                onTap: _selectDate,
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: 'Date of Birth',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.calendar_today),
                  ),
                  child: Text(
                    _selectedDate == null
                      ? 'Select date'
                      : '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}',
                  ),
                ),
              ),
              SizedBox(height: 16),
              
              // Address
              TextFormField(
                controller: _addressController,
                decoration: InputDecoration(
                  labelText: 'Full Address',
                  hintText: 'Street, City, State, Country',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.home),
                ),
                maxLines: 3,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your address';
                  }
                  return null;
                },
              ),
              SizedBox(height: 32),
              
              // Continue Button
              ElevatedButton(
                onPressed: _continue,
                child: Text('Continue'),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 56),
                  backgroundColor: Color(0xFFC8853F),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(2000),
      firstDate: DateTime(1940),
      lastDate: DateTime.now().subtract(Duration(days: 365 * 18)), // 18+ years
    );

    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  void _continue() {
    if (_formKey.currentState!.validate() && _selectedDate != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => UploadNationalIDScreen(
            username: widget.username,
            fullName: _fullNameController.text,
            nationalId: _nationalIdController.text,
            dateOfBirth: _selectedDate!,
            address: _addressController.text,
          ),
        ),
      );
    } else if (_selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select your date of birth')),
      );
    }
  }
}
```

---

### Step 3: Upload National ID

```dart
// lib/screens/kyc/upload_national_id_screen.dart

import 'dart:io';
import 'package:image_picker/image_picker.dart';

class UploadNationalIDScreen extends StatefulWidget {
  final String username;
  final String fullName;
  final String nationalId;
  final DateTime dateOfBirth;
  final String address;

  const UploadNationalIDScreen({
    required this.username,
    required this.fullName,
    required this.nationalId,
    required this.dateOfBirth,
    required this.address,
  });

  @override
  _UploadNationalIDScreenState createState() => _UploadNationalIDScreenState();
}

class _UploadNationalIDScreenState extends State<UploadNationalIDScreen> {
  File? _frontImage;
  File? _backImage;
  final _picker = ImagePicker();
  bool _isUploading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Upload National ID'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Progress
            LinearProgressIndicator(value: 0.75, backgroundColor: Colors.grey[200]),
            SizedBox(height: 8),
            Text('Step 3 of 4', style: TextStyle(fontSize: 12, color: Colors.grey)),
            SizedBox(height: 32),
            
            Text(
              'Upload Your National ID',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              'Take clear photos of both sides of your National ID card',
              style: TextStyle(color: Colors.grey[600]),
            ),
            SizedBox(height: 32),
            
            // Front side
            Text('Front Side', style: TextStyle(fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            _buildImagePicker(
              image: _frontImage,
              label: 'Tap to upload front side',
              onTap: () => _pickImage(true),
            ),
            SizedBox(height: 24),
            
            // Back side
            Text('Back Side', style: TextStyle(fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            _buildImagePicker(
              image: _backImage,
              label: 'Tap to upload back side',
              onTap: () => _pickImage(false),
            ),
            SizedBox(height: 32),
            
            // Tips
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.amber[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.lightbulb, size: 20, color: Colors.amber[700]),
                      SizedBox(width: 8),
                      Text(
                        'Tips for best results:',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text('• Ensure all text is clearly visible', style: TextStyle(fontSize: 12)),
                  Text('• No glare or shadows', style: TextStyle(fontSize: 12)),
                  Text('• Place ID on a flat surface', style: TextStyle(fontSize: 12)),
                  Text('• Good lighting', style: TextStyle(fontSize: 12)),
                ],
              ),
            ),
            SizedBox(height: 32),
            
            // Submit button
            ElevatedButton(
              onPressed: (_frontImage != null && _backImage != null && !_isUploading)
                ? _submitKYC
                : null,
              child: _isUploading
                ? CircularProgressIndicator(color: Colors.white)
                : Text('Submit for Review'),
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

  Widget _buildImagePicker({
    required File? image,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        height: 200,
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[300]!, width: 2, strokeAlign: BorderSide.strokeAlignInside),
          borderRadius: BorderRadius.circular(12),
          color: Colors.grey[50],
        ),
        child: image == null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add_photo_alternate, size: 48, color: Colors.grey[400]),
                  SizedBox(height: 8),
                  Text(label, style: TextStyle(color: Colors.grey[600])),
                ],
              ),
            )
          : Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.file(image, fit: BoxFit.cover, width: double.infinity),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: CircleAvatar(
                    backgroundColor: Colors.white,
                    child: Icon(Icons.check, color: Colors.green),
                  ),
                ),
              ],
            ),
      ),
    );
  }

  Future<void> _pickImage(bool isFront) async {
    final pickedFile = await _picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 1920,
      maxHeight: 1080,
      imageQuality: 85,
    );

    if (pickedFile != null) {
      setState(() {
        if (isFront) {
          _frontImage = File(pickedFile.path);
        } else {
          _backImage = File(pickedFile.path);
        }
      });
    }
  }

  Future<void> _submitKYC() async {
    setState(() => _isUploading = true);

    try {
      final userId = FirebaseAuth.instance.currentUser!.uid;
      final supabase = Supabase.instance.client;

      // Upload images to Supabase Storage
      final frontPath = 'kyc/$userId/national_id_front.jpg';
      final backPath = 'kyc/$userId/national_id_back.jpg';

      await supabase.storage.from('kyc-documents').upload(
        frontPath,
        _frontImage!,
        fileOptions: FileOptions(contentType: 'image/jpeg'),
      );

      await supabase.storage.from('kyc-documents').upload(
        backPath,
        _backImage!,
        fileOptions: FileOptions(contentType: 'image/jpeg'),
      );

      // Update user profile
      await supabase.from('user_profiles').update({
        'username': widget.username,
        'full_name': widget.fullName,
        'national_id_no': widget.nationalId,
        'dob': widget.dateOfBirth.toIso8601String(),
        'address': widget.address,
        'kyc_status': 'PENDING',
        'kyc_documents': {
          'national_id_front': frontPath,
          'national_id_back': backPath,
        },
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('user_id', userId);

      // Create approval request
      await supabase.from('pending_approvals').insert({
        'user_id': userId,
        'transaction_type': 'KYC_UPGRADE',
        'status': 'PENDING',
        'metadata': {
          'kyc_tier': 2,
          'submitted_at': DateTime.now().toIso8601String(),
        },
      });

      // Navigate to success screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => KYCSubmittedScreen()),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Upload failed: $e')),
      );
      setState(() => _isUploading = false);
    }
  }
}
```

---

### Step 4: Submitted Screen

```dart
// lib/screens/kyc/kyc_submitted_screen.dart

class KYCSubmittedScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Success icon
              Container(
                padding: EdgeInsets.all(32),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.green[50],
                ),
                child: Icon(
                  Icons.check_circle,
                  size: 80,
                  color: Colors.green,
                ),
              ),
              SizedBox(height: 32),
              
              Text(
                'Submitted for Review',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 16),
              
              Text(
                'Your KYC Level 2 application has been submitted successfully. Our team will review your documents within 24-48 hours.',
                style: TextStyle(color: Colors.grey[600], fontSize: 16),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 32),
              
              // Status indicator
              Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.amber[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.amber[200]!),
                ),
                child: Row(
                  children: [
                    Icon(Icons.pending, color: Colors.amber[700]),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Status: Pending Review',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text(
                            'You will receive a notification when approved',
                            style: TextStyle(fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 48),
              
              // Back to dashboard
              ElevatedButton(
                onPressed: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => DashboardScreen()),
                    (route) => false,
                  );
                },
                child: Text('Back to Dashboard'),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 56),
                  backgroundColor: Color(0xFFC8853F),
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

## 🗄️ Database Schema Updates

```sql
-- Add KYC fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'NONE' CHECK (kyc_status IN ('NONE', 'PENDING', 'APPROVED', 'REJECTED')),
ADD COLUMN IF NOT EXISTS kyc_documents JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS kyc_approved_at TIMESTAMPTZ;

-- Create index on username
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- Update pending_approvals to support KYC_UPGRADE
ALTER TABLE public.pending_approvals
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

COMMENT ON COLUMN public.pending_approvals.metadata IS 'Additional data for approval (e.g., kyc_tier, documents)';
```

---

## 📧 Notification System

### When Admin Approves:

```typescript
// supabase/functions/notify-kyc-approval/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { user_id, approval_id } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Update user profile to KYC Level 2
  await supabase
    .from('user_profiles')
    .update({
      kyc_tier: 2,
      kyc_status: 'APPROVED',
      kyc_approved_at: new Date().toIso8601String(),
    })
    .eq('user_id', user_id)

  // Send push notification (if implemented)
  // Send email notification
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

This complete implementation gives you the exact KYC flow you described! Want me to create the admin approval interface next?
