import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

// ── Payno & Péthar Modern Sky-Blue Light Fintech Design Tokens ──
const Color paynoSkyTop = Color(0xFF0A0A0A);
const Color paynoSkyMid = Color(0xFF0A0A0A);
const Color paynoSkyBottom = Color(0xFF000000);
const Color paynoBlue = Color(0xFF2563EB);
const Color paynoBlueLight = Color(0xFF60A5FA);

// Arakan Royal Accents
const Color crimson = Color(0xFFD91624);
const Color crimsonDark = Color(0xFF990000);
const Color gold = Color(0xFFD4AF37);
const Color goldLight = Color(0xFF1A1400);

// Surfaces & Accents
const Color obsidian = Color(0xFF090D14);
const Color surfaceDark = Color(0xFF101724);
const Color surfaceCard = Color(0xFF172235);
const Color slateBorder = Color(0xFF27272A);
const Color cyanNeon = Color(0xFF00F0FF);
const Color paper = Color(0xFF000000);
const Color paperCard = Color(0xFF000000);
const Color emeraldSuccess = Color(0xFF27272A);

// ── True-black dark palette (OLED-first) ──
const Color trueBlack = Color(0xFF000000);
const Color trueBlackSurface = Color(0xFF0A0A0A);
const Color trueBlackElevated = Color(0xFF111111);
const Color trueBlackBorder = Color(0xFF262626);
const Color darkPrimaryText = Color(0xFFFFFFFF);
const Color darkSecondaryText = Color(0xFFA1A1AA);
const Color darkTertiaryText = Color(0xFF71717A);

ThemeData darkTheme() {
  final baseTextTheme = ThemeData.dark().textTheme.apply(
        bodyColor: darkPrimaryText,
        displayColor: darkPrimaryText,
      );
  return ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: trueBlack,
    canvasColor: trueBlack,
    primaryColor: paynoBlue,
    colorScheme: const ColorScheme.dark(
      primary: paynoBlueLight,
      onPrimary: Colors.white,
      secondary: gold,
      onSecondary: Colors.black,
      surface: trueBlack,
      onSurface: darkPrimaryText,
      surfaceContainerHighest: trueBlackElevated,
      outline: trueBlackBorder,
      outlineVariant: Color(0xFF1F1F1F),
      error: Color(0xFFFF5A65),
    ),
    cardTheme: CardThemeData(
      color: trueBlackSurface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: trueBlackBorder, width: 1),
      ),
    ),
    dialogTheme: const DialogThemeData(
      backgroundColor: trueBlackElevated,
      surfaceTintColor: Colors.transparent,
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: trueBlackElevated,
      modalBackgroundColor: trueBlackElevated,
      surfaceTintColor: Colors.transparent,
    ),
    dividerColor: trueBlackBorder,
    iconTheme: const IconThemeData(color: darkPrimaryText),
    appBarTheme: const AppBarTheme(
      backgroundColor: trueBlack,
      elevation: 0,
      iconTheme: IconThemeData(color: darkPrimaryText),
      titleTextStyle: TextStyle(
        color: darkPrimaryText,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
      systemOverlayStyle: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemNavigationBarColor: trueBlack,
        systemNavigationBarIconBrightness: Brightness.light,
        systemNavigationBarDividerColor: trueBlack,
        systemNavigationBarContrastEnforced: false,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: trueBlackElevated,
      hintStyle: const TextStyle(color: darkTertiaryText),
      labelStyle: const TextStyle(color: darkSecondaryText),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: trueBlackBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: paynoBlueLight, width: 1.4),
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: trueBlackBorder),
      ),
    ),
    snackBarTheme: const SnackBarThemeData(
      backgroundColor: trueBlackElevated,
      contentTextStyle: TextStyle(color: darkPrimaryText),
      behavior: SnackBarBehavior.floating,
    ),
    textTheme: GoogleFonts.notoSansMyanmarTextTheme(baseTextTheme),
    fontFamilyFallback: const ['Noto Sans Myanmar', 'Padauk', 'Pyidaungsu'],
    useMaterial3: true,
  );
}

ThemeData lightTheme() {
  final baseTextTheme = ThemeData.light().textTheme;
  return ThemeData(
    brightness: Brightness.light,
    scaffoldBackgroundColor: const Color(0xFF0A0A0A),
    primaryColor: paynoBlue,
    colorScheme: const ColorScheme.light(
      primary: paynoBlue,
      secondary: gold,
      surface: paperCard,
      surfaceContainerHighest: Color(0xFF0A0A0A),
    ),
    cardTheme: CardThemeData(
      color: Colors.white.withValues(alpha: 0.9),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: Color(0xFF262626), width: 1),
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      iconTheme: IconThemeData(color: Color(0xFF111111)),
      titleTextStyle: TextStyle(
        color: Color(0xFFF4F4F5),
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
      systemOverlayStyle: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
        systemNavigationBarColor: Colors.transparent,
        systemNavigationBarIconBrightness: Brightness.dark,
        systemNavigationBarDividerColor: Colors.transparent,
        systemNavigationBarContrastEnforced: false,
      ),
    ),
    textTheme: GoogleFonts.notoSansMyanmarTextTheme(baseTextTheme),
    fontFamilyFallback: const ['Noto Sans Myanmar', 'Padauk', 'Pyidaungsu'],
    useMaterial3: true,
  );
}
