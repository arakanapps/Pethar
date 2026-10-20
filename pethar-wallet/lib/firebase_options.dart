// Firebase client settings are supplied per build using --dart-define values.
// These are public client configuration values, not server credentials.
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

String _requiredFirebaseValue(String key) {
  const values = <String, String>{
    'apiKey': String.fromEnvironment('FIREBASE_API_KEY'),
    'appId': String.fromEnvironment('FIREBASE_APP_ID'),
    'messagingSenderId': String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID'),
    'projectId': String.fromEnvironment('FIREBASE_PROJECT_ID'),
    'authDomain': String.fromEnvironment('FIREBASE_AUTH_DOMAIN'),
    'storageBucket': String.fromEnvironment('FIREBASE_STORAGE_BUCKET'),
    'measurementId': String.fromEnvironment('FIREBASE_MEASUREMENT_ID'),
    'iosBundleId': String.fromEnvironment('FIREBASE_IOS_BUNDLE_ID'),
  };
  final value = values[key] ?? '';
  if (value.isEmpty && key == 'measurementId') return '';
  if (value.isEmpty && key == 'iosBundleId') return '';
  if (value.isEmpty) {
    throw StateError('Missing required Firebase build setting: FIREBASE_${key.replaceAllMapped(RegExp(r'[A-Z]'), (m) => '_${m[0]}').toUpperCase()}');
  }
  return value;
}

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) return web;
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
      case TargetPlatform.linux:
        throw UnsupportedError('Firebase is not configured for this platform.');
      default:
        return android;
    }
  }

  static FirebaseOptions get web => FirebaseOptions(
        apiKey: _requiredFirebaseValue('apiKey'),
        appId: _requiredFirebaseValue('appId'),
        messagingSenderId: _requiredFirebaseValue('messagingSenderId'),
        projectId: _requiredFirebaseValue('projectId'),
        authDomain: _requiredFirebaseValue('authDomain'),
        storageBucket: _requiredFirebaseValue('storageBucket'),
        measurementId: const String.fromEnvironment('FIREBASE_MEASUREMENT_ID'),
      );

  static FirebaseOptions get android => FirebaseOptions(
        apiKey: _requiredFirebaseValue('apiKey'),
        appId: _requiredFirebaseValue('appId'),
        messagingSenderId: _requiredFirebaseValue('messagingSenderId'),
        projectId: _requiredFirebaseValue('projectId'),
        storageBucket: _requiredFirebaseValue('storageBucket'),
      );

  static FirebaseOptions get ios => FirebaseOptions(
        apiKey: _requiredFirebaseValue('apiKey'),
        appId: _requiredFirebaseValue('appId'),
        messagingSenderId: _requiredFirebaseValue('messagingSenderId'),
        projectId: _requiredFirebaseValue('projectId'),
        storageBucket: _requiredFirebaseValue('storageBucket'),
        iosBundleId: _requiredFirebaseValue('iosBundleId'),
      );

  static FirebaseOptions get macos => FirebaseOptions(
        apiKey: _requiredFirebaseValue('apiKey'),
        appId: _requiredFirebaseValue('appId'),
        messagingSenderId: _requiredFirebaseValue('messagingSenderId'),
        projectId: _requiredFirebaseValue('projectId'),
        storageBucket: _requiredFirebaseValue('storageBucket'),
        iosBundleId: _requiredFirebaseValue('iosBundleId'),
      );
}
