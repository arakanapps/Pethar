import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../firebase_options.dart';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  FirebaseAuth get auth => _auth;
  FirebaseFirestore get firestore => _firestore;

  /// Current user
  User? get currentUser => _auth.currentUser;

  /// Current user ID
  String? get currentUid => _auth.currentUser?.uid;

  /// Auth state stream
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Is authenticated
  bool get isAuthenticated => _auth.currentUser != null;

  /// Initialize Firebase and plugins
  static Future<void> initialize() async {
    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      if (!kIsWeb) {
        await GoogleSignIn.instance.initialize();
      }
      debugPrint('Firebase initialized successfully for Péthar.');
    } catch (e) {
      debugPrint('Firebase initialization notice: $e');
    }
  }

  // ── 1. EMAIL / PASSWORD AUTHENTICATION ──

  /// Sign In with Email & Password
  Future<UserCredential> signInWithEmail({
    required String email,
    required String password,
  }) async {
    final credential = await _auth.signInWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
    if (credential.user != null) {
      await _syncUserProfile(credential.user!);
    }
    return credential;
  }

  /// Sign Up with Email & Password
  Future<UserCredential> signUpWithEmail({
    required String email,
    required String password,
    String? displayName,
  }) async {
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
    if (credential.user != null) {
      if (displayName != null && displayName.isNotEmpty) {
        await credential.user!.updateDisplayName(displayName);
      }
      await _syncUserProfile(credential.user!, displayName: displayName);
    }
    return credential;
  }

  /// Send Password Reset Email
  Future<void> sendPasswordResetEmail({required String email}) async {
    await _auth.sendPasswordResetEmail(email: email.trim());
  }

  // ── 2. GOOGLE SIGN-IN ──

  /// Sign In with Google (supporting both Mobile and Web platforms)
  Future<UserCredential?> signInWithGoogle() async {
    try {
      if (kIsWeb) {
        // Web uses popup to avoid DWDS hangs and manual client ID config
        final GoogleAuthProvider authProvider = GoogleAuthProvider();
        final userCredential = await _auth.signInWithPopup(authProvider);
        if (userCredential.user != null) {
          await _syncUserProfile(userCredential.user!);
        }
        return userCredential;
      } else {
        // Mobile uses standard GoogleSignIn flow
        final GoogleSignInAccount googleUser =
            await GoogleSignIn.instance.authenticate();
        final GoogleSignInAuthentication googleAuth = googleUser.authentication;

        final AuthCredential credential = GoogleAuthProvider.credential(
          idToken: googleAuth.idToken,
        );

        final userCredential = await _auth.signInWithCredential(credential);
        if (userCredential.user != null) {
          await _syncUserProfile(userCredential.user!);
        }
        return userCredential;
      }
    } catch (e) {
      debugPrint('Error during Google Sign-In: $e');
      rethrow;
    }
  }

  // ── 3. PHONE AUTHENTICATION ──

  /// Start phone number verification
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(PhoneAuthCredential) verificationCompleted,
    required Function(FirebaseAuthException) verificationFailed,
    required Function(String verificationId, int? resendToken) codeSent,
    required Function(String verificationId) codeAutoRetrievalTimeout,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: (PhoneAuthCredential credential) async {
        final result = await _auth.signInWithCredential(credential);
        if (result.user != null) {
          await _syncUserProfile(result.user!);
        }
        verificationCompleted(credential);
      },
      verificationFailed: verificationFailed,
      codeSent: codeSent,
      codeAutoRetrievalTimeout: codeAutoRetrievalTimeout,
    );
  }

  /// Confirm SMS Code
  Future<UserCredential> verifySmsCode({
    required String verificationId,
    required String smsCode,
  }) async {
    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode.trim(),
    );
    final userCredential = await _auth.signInWithCredential(credential);
    if (userCredential.user != null) {
      await _syncUserProfile(userCredential.user!);
    }
    return userCredential;
  }

  // ── 4. SIGN OUT ──

  /// Sign Out safely across all platforms
  Future<void> signOut() async {
    try {
      if (!kIsWeb) {
        await GoogleSignIn.instance.signOut();
      }
    } catch (e) {
      debugPrint('Google SignOut note: $e');
    }
    await _auth.signOut();
  }

  // ── 5. CLOUD FIRESTORE HELPERS ──

  /// Ensure user profile & default wallet exists in Firestore
  Future<void> _syncUserProfile(User user, {String? displayName}) async {
    try {
      final userDocRef = _firestore.collection('users').doc(user.uid);
      final userSnap = await userDocRef.get();

      final now = FieldValue.serverTimestamp();

      if (!userSnap.exists) {
        await userDocRef.set({
          'uid': user.uid,
          'email': user.email,
          'phoneNumber': user.phoneNumber,
          'displayName': user.displayName ?? displayName ?? '',
          'photoURL': user.photoURL,
          'currency': 'AKD',
          'language': 'ak',
          'createdAt': now,
          'updatedAt': now,
        });

        // Initialize user wallet
        final walletDocRef = _firestore.collection('wallets').doc(user.uid);
        await walletDocRef.set({
          'uid': user.uid,
          'balanceAKD': 0.00,
          'balanceUSD': 0.00,
          'balanceMMK': 0.00,
          'walletAddress': '0xAKD${user.uid.substring(0, user.uid.length >= 10 ? 10 : user.uid.length).toUpperCase()}',
          'tier': 'standard',
          'status': 'active',
          'createdAt': now,
          'updatedAt': now,
        });
      } else {
        await userDocRef.update({
          if (user.email != null) 'email': user.email,
          if (user.phoneNumber != null) 'phoneNumber': user.phoneNumber,
          if (displayName != null) 'displayName': displayName,
          'updatedAt': now,
        });
      }
    } catch (e) {
      debugPrint('Firestore profile sync note: $e');
    }
  }

  /// Get user wallet stream
  Stream<DocumentSnapshot<Map<String, dynamic>>> walletStream(String uid) {
    return _firestore.collection('wallets').doc(uid).snapshots();
  }

  /// Record a transaction in Firestore
  Future<DocumentReference<Map<String, dynamic>>> recordTransaction({
    required String senderUid,
    required String recipientUid,
    required double amount,
    required String currency,
    required String type,
    String? note,
  }) async {
    return await _firestore.collection('transactions').add({
      'senderUid': senderUid,
      'recipientUid': recipientUid,
      'amount': amount,
      'currency': currency,
      'type': type,
      'status': 'completed',
      'note': note ?? '',
      'createdAt': FieldValue.serverTimestamp(),
    });
  }

  /// Get transactions stream for user
  Stream<QuerySnapshot<Map<String, dynamic>>> transactionsStream(String uid) {
    return _firestore
        .collection('transactions')
        .where('senderUid', isEqualTo: uid)
        .orderBy('createdAt', descending: true)
        .limit(20)
        .snapshots();
  }
}
