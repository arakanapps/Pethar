// File generated for PeThar Firebase Project (pe-thar)
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        return android;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAy-e6MbSsYNNxvNxjJweepuTszhX4odyU',
    appId: '1:895411020406:web:0cb9516ba0356b70fb3557',
    messagingSenderId: '895411020406',
    projectId: 'pe-thar',
    authDomain: 'pe-thar.firebaseapp.com',
    storageBucket: 'pe-thar.firebasestorage.app',
    measurementId: 'G-0L8V1028JD',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAy-e6MbSsYNNxvNxjJweepuTszhX4odyU',
    appId: '1:895411020406:android:e93f80c55fbfeb4b0b0f14',
    messagingSenderId: '895411020406',
    projectId: 'pe-thar',
    storageBucket: 'pe-thar.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAy-e6MbSsYNNxvNxjJweepuTszhX4odyU',
    appId: '1:895411020406:ios:0cb9516ba0356b70fb3557',
    messagingSenderId: '895411020406',
    projectId: 'pe-thar',
    storageBucket: 'pe-thar.firebasestorage.app',
    iosBundleId: 'com.example.petharMobile',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyAy-e6MbSsYNNxvNxjJweepuTszhX4odyU',
    appId: '1:895411020406:ios:0cb9516ba0356b70fb3557',
    messagingSenderId: '895411020406',
    projectId: 'pe-thar',
    storageBucket: 'pe-thar.firebasestorage.app',
    iosBundleId: 'com.example.petharMobile',
  );
}
