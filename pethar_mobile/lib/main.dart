import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'app_state.dart';
import 'theme.dart';
import 'screens/main_shell.dart';

void main() async {
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

  // TODO(production): Initialize Supabase
  // Uncomment when SUPABASE_URL and SUPABASE_ANON_KEY are configured:
  //
  // await PeTharSupabaseService.instance.initialize(
  //   url: const String.fromEnvironment('SUPABASE_URL'),
  //   anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY'),
  // );

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
