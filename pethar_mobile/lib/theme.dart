import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

const Color crimson = Color(0xFFD91624);
const Color crimsonDark = Color(0xFF990000);
const Color crimsonDeep = Color(0xFF590000);
const Color crimsonMuted = Color(0xFF2D0A0E);
const Color gold = Color(0xFFD4AF37);
const Color goldLight = Color(0xFFF5E6A3);
const Color goldDark = Color(0xFF9E7812);
const Color obsidian = Color(0xFF090D14);
const Color surfaceDark = Color(0xFF101724);
const Color surfaceCard = Color(0xFF172235);
const Color slateBorder = Color(0xFF283852);
const Color slateLight = Color(0xFF475569);
const Color paper = Color(0xFFF8FAFC);
const Color paperCard = Color(0xFFFFFFFF);
const Color cyanNeon = Color(0xFF00F0FF);
const Color emeraldSuccess = Color(0xFF10B981);

ThemeData darkTheme() {
  final baseTextTheme = ThemeData.dark().textTheme;
  return ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: obsidian,
    primaryColor: gold,
    colorScheme: const ColorScheme.dark(
      primary: gold,
      secondary: crimson,
      surface: surfaceCard,
    ),
    cardColor: surfaceCard,
    textTheme: GoogleFonts.notoSansMyanmarTextTheme(baseTextTheme),
    fontFamilyFallback: const ['Noto Sans Myanmar', 'Padauk', 'Pyidaungsu'],
    useMaterial3: true,
  );
}

ThemeData lightTheme() {
  final baseTextTheme = ThemeData.light().textTheme;
  return ThemeData(
    brightness: Brightness.light,
    scaffoldBackgroundColor: paper,
    primaryColor: gold,
    colorScheme: const ColorScheme.light(
      primary: gold,
      secondary: crimson,
      surface: paperCard,
    ),
    cardColor: paperCard,
    textTheme: GoogleFonts.notoSansMyanmarTextTheme(baseTextTheme),
    fontFamilyFallback: const ['Noto Sans Myanmar', 'Padauk', 'Pyidaungsu'],
    useMaterial3: true,
  );
}
