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
const Color trueBlackSurface = Color(0xFF000000);
const Color trueBlackElevated = Color(0xFF0A0A0A);
const Color trueBlackBorder = Color(0xFF262626);
const Color darkPrimaryText = Color(0xFFFFFFFF);
const Color darkSecondaryText = Color(0xFFA1A1AA);
const Color darkTertiaryText = Color(0xFF71717A);

// ── Verification Semantic Accents ──
const Color verifiedBlue = Color(0xFF3B82F6);
const Color unverifiedRed = Color(0xFFEF4444);

ThemeData darkTheme() {
  final baseTextTheme = ThemeData.dark().textTheme.apply(
        bodyColor: darkPrimaryText,
        displayColor: darkPrimaryText,
      );
  return ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: trueBlack,
    canvasColor: trueBlack,
    primaryColor: Colors.white,
    colorScheme: const ColorScheme.dark(
      primary: Colors.white,
      onPrimary: Colors.black,
      secondary: Colors.white,
      onSecondary: Colors.black,
      surface: trueBlack,
      onSurface: darkPrimaryText,
      surfaceContainerHighest: trueBlackElevated,
      outline: trueBlackBorder,
      outlineVariant: Color(0xFF1F1F1F),
      error: unverifiedRed,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: trueBlack,
        foregroundColor: Colors.white,
        elevation: 0,
        side: const BorderSide(color: Color(0x26FFFFFF)),
      ),
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
      backgroundColor: trueBlack,
      surfaceTintColor: Colors.transparent,
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: trueBlack,
      modalBackgroundColor: trueBlack,
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
      fillColor: trueBlack,
      hintStyle: const TextStyle(color: darkTertiaryText),
      labelStyle: const TextStyle(color: darkSecondaryText),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: trueBlackBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Colors.white, width: 1.4),
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: trueBlackBorder),
      ),
    ),
    snackBarTheme: const SnackBarThemeData(
      backgroundColor: trueBlack,
      contentTextStyle: TextStyle(color: darkPrimaryText),
      behavior: SnackBarBehavior.floating,
    ),
    textTheme: GoogleFonts.notoSansMyanmarTextTheme(baseTextTheme),
    fontFamilyFallback: const ['Noto Sans Myanmar', 'Padauk', 'Pyidaungsu'],
    useMaterial3: true,
  );
}

ThemeData lightTheme() => darkTheme();
