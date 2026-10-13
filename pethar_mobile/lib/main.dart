import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'services/firebase_service.dart';
import 'app_state.dart';
import 'theme.dart';
import 'screens/main_shell.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait for mobile-first UX
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF0B0F14),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  // Initialize Firebase (Project: pe-thar)
  await FirebaseService.initialize();

  // Initialize Supabase fallback
  try {
    await Supabase.initialize(
      url: 'https://uklqksioruxvatwpvopm.supabase.co',
      anonKey: 'sb_publishable_rUiqzJYfjRLzNK0d6xyg-g_5Z6WmTya',
    );
  } catch (e) {
    debugPrint('Supabase initialization notice: $e');
  }

  runApp(
    ChangeNotifierProvider(
      create: (context) => AppState(),
      child: const PeTharApp(),
    ),
  );
}

class PeTharApp extends StatelessWidget {
  const PeTharApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, appState, child) {
        return MaterialApp(
          title: 'PeThar (ဖေ့သာ)',
          debugShowCheckedModeBanner: false,
          theme: lightTheme(),
          darkTheme: darkTheme(),
          themeMode: appState.themeMode,
          home: const MainShell(),
        );
      },
    );
  }
}
