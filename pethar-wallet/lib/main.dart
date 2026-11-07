import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'app_state.dart';
import 'theme.dart';
import 'shell/main_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait for mobile-first UX. These are fire-and-forget so the
  // first Flutter frame is never blocked on platform channels.
  unawaited(SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]));

  // True-black edge-to-edge system UI with light status/navigation icons.
  unawaited(SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge));
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: trueBlack,
    systemNavigationBarIconBrightness: Brightness.light,
    systemNavigationBarDividerColor: trueBlack,
    systemNavigationBarContrastEnforced: false,
  ));

  // Render immediately. Supabase is initialized in the background by AppState
  // so the splash never waits on network / auth-session recovery.
  runApp(
    ChangeNotifierProvider(
      create: (context) => AppState(),
      child: const PetharApp(),
    ),
  );
}

/// Disables the Android/iOS overscroll "stretch" and the glow effect so
/// screens stay fixed when dragged past their edges.
class _NoOverscrollScrollBehavior extends MaterialScrollBehavior {
  const _NoOverscrollScrollBehavior();

  @override
  ScrollPhysics getScrollPhysics(BuildContext context) =>
      const ClampingScrollPhysics(parent: AlwaysScrollableScrollPhysics());

  @override
  Widget buildOverscrollIndicator(
    BuildContext context,
    Widget child,
    ScrollableDetails details,
  ) =>
      child;
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
          theme: darkTheme(),
          darkTheme: darkTheme(),
          themeMode: ThemeMode.dark,
          scrollBehavior: const _NoOverscrollScrollBehavior(),
          home: const MainShell(),
        );
      },
    );
  }
}
