import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:device_preview/device_preview.dart';
import 'app_state.dart';
import 'theme.dart';
import 'screens/main_shell.dart';

void main() {
  runApp(
    DevicePreview(
      enabled: true,
      builder: (context) => ChangeNotifierProvider(
        create: (context) => AppState(),
        child: const PeTharApp(),
      ),
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
          title: 'PeThar',
          debugShowCheckedModeBanner: false,
          locale: DevicePreview.locale(context),
          builder: DevicePreview.appBuilder,
          theme: lightTheme(),
          darkTheme: darkTheme(),
          themeMode: appState.themeMode,
          home: const MainShell(),
        );
      },
    );
  }
}
