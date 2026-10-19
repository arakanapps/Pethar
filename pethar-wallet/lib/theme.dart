import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// ── Payno & Péthar Modern Sky-Blue Light Fintech Design Tokens ──
const Color paynoSkyTop = Color(0xFFCFE5FC);
const Color paynoSkyMid = Color(0xFFE3F0FD);
const Color paynoSkyBottom = Color(0xFFF5FAFE);
const Color paynoBlue = Color(0xFF2563EB);
const Color paynoBlueLight = Color(0xFF60A5FA);

// Arakan Royal Accents
const Color crimson = Color(0xFFD91624);
const Color crimsonDark = Color(0xFF990000);
const Color gold = Color(0xFFD4AF37);
const Color goldLight = Color(0xFFF5E6A3);

// Surfaces & Accents
const Color obsidian = Color(0xFF090D14);
const Color surfaceDark = Color(0xFF101724);
const Color surfaceCard = Color(0xFF172235);
const Color slateBorder = Color(0xFF1E293B);
const Color cyanNeon = Color(0xFF00F0FF);
const Color paper = Color(0xFFF0F6FD);
const Color paperCard = Color(0xFFFFFFFF);
const Color emeraldSuccess = Color(0xFF10B981);

ThemeData darkTheme() {
  // App is strictly designed for light theme across Android and iOS
  return lightTheme();
}

ThemeData lightTheme() {
  final baseTextTheme = ThemeData.light().textTheme;
  return ThemeData(
    brightness: Brightness.light,
    scaffoldBackgroundColor: const Color(0xFFEAF4FD),
    primaryColor: paynoBlue,
    colorScheme: const ColorScheme.light(
      primary: paynoBlue,
      secondary: gold,
      surface: paperCard,
      surfaceContainerHighest: Color(0xFFF0F7FE),
    ),
    cardTheme: CardThemeData(
      color: Colors.white.withValues(alpha: 0.9),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: Color(0xFFE2EDF9), width: 1),
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      iconTheme: IconThemeData(color: Color(0xFF0F172A)),
      titleTextStyle: TextStyle(
        color: Color(0xFF0F172A),
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    ),
    textTheme: GoogleFonts.notoSansMyanmarTextTheme(baseTextTheme),
    fontFamilyFallback: const ['Noto Sans Myanmar', 'Padauk', 'Pyidaungsu'],
    useMaterial3: true,
  );
}
