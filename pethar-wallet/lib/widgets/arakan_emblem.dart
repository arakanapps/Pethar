import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

const String _petharLogoRedWhiteSvg = '''
<svg width="512" height="512" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="topWhiteGlass" x1="20" y1="16" x2="96" y2="54" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#D4D8DD" />
      <stop offset="28%" stop-color="#F8FAFC" />
      <stop offset="58%" stop-color="#FFFFFF" />
      <stop offset="82%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>
    <linearGradient id="topInnerSilver" x1="24" y1="22" x2="88" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#94A3B8" stop-opacity="0.65" />
      <stop offset="45%" stop-color="#F1F5F9" stop-opacity="0.9" />
      <stop offset="85%" stop-color="#CBD5E1" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#94A3B8" stop-opacity="0.7" />
    </linearGradient>
    <linearGradient id="redMainSweep" x1="96" y1="36" x2="24" y2="104" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="14%" stop-color="#FCA5A5" />
      <stop offset="28%" stop-color="#EF4444" />
      <stop offset="52%" stop-color="#DC2626" />
      <stop offset="78%" stop-color="#991B1B" />
      <stop offset="100%" stop-color="#5C0A0A" />
    </linearGradient>
    <linearGradient id="redDeepFold" x1="88" y1="54" x2="26" y2="104" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#B91C1C" />
      <stop offset="45%" stop-color="#991B1B" />
      <stop offset="80%" stop-color="#7F1D1D" />
      <stop offset="100%" stop-color="#450A0A" />
    </linearGradient>
    <linearGradient id="redBottomCurl" x1="26" y1="68" x2="48" y2="104" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#450A0A" />
      <stop offset="45%" stop-color="#991B1B" />
      <stop offset="80%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#FCA5A5" />
    </linearGradient>
    <linearGradient id="leafCrimsonBody" x1="28" y1="64" x2="50" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7F1D1D" />
      <stop offset="50%" stop-color="#DC2626" />
      <stop offset="88%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#FCA5A5" />
    </linearGradient>
    <linearGradient id="leafWhiteCrest" x1="30" y1="56" x2="49" y2="39" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#CBD5E1" />
      <stop offset="55%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F8FAFC" />
    </linearGradient>
  </defs>
  <g>
    <path d="M26 103C38.5 103 48 93.5 48 79.5V67H35C29 67 26 73 26 82V103Z" fill="url(#redBottomCurl)" />
    <path d="M27.5 101.5C37.5 100.5 45.5 92 46 79V69" stroke="#FECACA" stroke-opacity="0.65" stroke-width="1.4" stroke-linecap="round" />
    <path d="M28 65C30 51 38 43 49.5 39.5C50.5 48.5 46 55.5 36.5 59.5C32.5 61.2 30 63 28 65Z" fill="url(#leafCrimsonBody)" />
    <path d="M29 62C31.5 50.5 38.5 43.2 49.5 39.5C46.5 44 41.5 47.5 35.5 52C32.5 54.3 30.5 58 29 62Z" fill="url(#leafWhiteCrest)" />
    <path d="M28.5 64C31 51.5 38.5 43.5 49.5 39.5" stroke="#CBD5E1" stroke-opacity="0.9" stroke-width="1.2" stroke-linecap="round" />
    <path d="M24 17H66C85 17 97 27.5 97 44.5C97 53 93 60.5 86 65.5C89.5 59.5 90.5 52 88.5 45C85.5 35.5 76.5 32 65 32H43C31.5 32 25.5 26 24 17Z" fill="url(#topWhiteGlass)" stroke="#CBD5E1" stroke-width="0.9" />
    <path d="M28 19.5H65C80.5 19.5 91 28 92 42.5C92.5 49.5 89.5 56 84 61C85.5 55.5 85.5 49.5 83 44C79.5 36.5 72 34.5 63 34.5H43C34.5 34.5 29.5 28.5 28 19.5Z" fill="url(#topInnerSilver)" />
    <path d="M24.5 17.5H66C84.5 17.5 96 27.8 96.5 44" stroke="#FFFFFF" stroke-opacity="0.95" stroke-width="1.6" stroke-linecap="round" />
    <path d="M28.5 20.5C31 27.5 36.5 31.5 45 31.5H65C76 31.5 83 36.5 84.5 45" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="1.3" stroke-linecap="round" />
    <path d="M87 26C95 32.5 98.5 42 96.5 52.5C93.5 66.5 81.5 73 64.5 73H49C38.5 73 33.5 78.5 31.5 88.5L26 103V78C26 62.5 35.5 54.5 51 54.5H65.5C76.5 54.5 83.5 49.5 85.5 41C87 35 85.5 29.5 82 25L87 26Z" fill="url(#redMainSweep)" />
    <path d="M95.5 49C93.5 63.5 81.5 71.5 64.5 71.5H48.5C37.5 71.5 31.5 78 29.5 89.5L26 103V84C27.5 69.5 36.5 61.5 51.5 61.5H66.5C79.5 61.5 89.5 56.5 95.5 49Z" fill="url(#redDeepFold)" />
    <path d="M27.5 99V77.5C27.5 63.5 36.5 56 51.5 56H66C78 56 86.5 50.5 89.5 40.5" stroke="#FECACA" stroke-opacity="0.75" stroke-width="1.6" stroke-linecap="round" />
    <path d="M31 89C33.5 76 40.5 71 52 71H65.5C80.5 71 91.5 64.5 95.5 51" stroke="#FCA5A5" stroke-opacity="0.55" stroke-width="1.3" stroke-linecap="round" />
  </g>
</svg>
''';

class ArakanEmblem extends StatelessWidget {
  final double size;
  final Color? color;

  const ArakanEmblem({Key? key, this.size = 40.0, this.color}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: SvgPicture.string(
        _petharLogoRedWhiteSvg,
        width: size,
        height: size,
        fit: BoxFit.contain,
      ),
    );
  }
}
