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

  // Set clean light edge-to-edge system UI overlay style matching iOS
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
    systemNavigationBarColor: Colors.transparent,
    systemNavigationBarIconBrightness: Brightness.dark,
    systemNavigationBarDividerColor: Colors.transparent,
    systemNavigationBarContrastEnforced: false,
  ));

  // Initialize Firebase (Project: pe-thar)
  await FirebaseService.initialize();

  // Initialize Supabase fallback
  try {
    await Supabase.initialize(
      url: 'https://uklqksioruxvatwpvopm.supabase.co',
      publishableKey: 'sb_publishable_rUiqzJYfjRLzNK0d6xyg-g_5Z6WmTya',
    );
  } catch (e) {
    debugPrint('Supabase initialization notice: $e');
  }

  runApp(
    ChangeNotifierProvider(
      create: (context) => AppState(),
      child: const PetharApp(),
    ),
  );
}

class PetharApp extends StatelessWidget {
  const PetharApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, appState, child) {
        return MaterialApp(
          title: 'Péthar',
          debugShowCheckedModeBanner: false,
          theme: lightTheme(),
          darkTheme: lightTheme(),
          themeMode: ThemeMode.light,
          home: const MainShell(),
        );
      },
    );
  }
}
