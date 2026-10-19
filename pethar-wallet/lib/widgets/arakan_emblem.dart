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

/// SiAfterpay Icon matching simple-icons and react-icons/si
class AfterpayIcon extends StatelessWidget {
  final double size;
  final Color color;

  const AfterpayIcon({
    Key? key,
    this.size = 24.0,
    this.color = Colors.white,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final hex = '#${(color.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, '0')}';
    final svg = '''
<svg role="img" viewBox="0 0 24 24" width="$size" height="$size" xmlns="http://www.w3.org/2000/svg">
  <path fill="$hex" d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12Zm1.236 4.924a2.21 2.21 0 0 1 1.15.299l4.457 2.557c1.495.857 1.495 3.013 0 3.87l-4.457 2.558c-1.488.854-3.342-.22-3.342-1.935v-.34a.441.441 0 0 0-.66-.383L6.287 13.9a.441.441 0 0 0 0 .765l4.096 2.35a.44.44 0 0 0 .661-.382v-.685c0-.333.36-.542.649-.376l1.041.597a.441.441 0 0 1 .222.383v.29c0 1.715-1.854 2.789-3.342 1.935L5.157 16.22c-1.495-.857-1.495-3.013 0-3.87l4.457-2.558c1.488-.854 3.342.22 3.342 1.935v.34c0 .34.366.551.66.383l4.097-2.35a.441.441 0 0 0 0-.765l-4.096-2.351a.441.441 0 0 0-.661.382v.685c0 .333-.36.541-.649.375l-1.041-.597a.442.442 0 0 1-.222-.383v-.29c0-1.285 1.043-2.21 2.192-2.233z"/>
</svg>
''';
    return SizedBox(
      width: size,
      height: size,
      child: SvgPicture.string(
        svg,
        width: size,
        height: size,
        fit: BoxFit.contain,
      ),
    );
  }
}

/// WalletMinimal Icon matching Lucide and AnimateIcons
class WalletMinimalFlutterIcon extends StatelessWidget {
  final double size;
  final Color color;

  const WalletMinimalFlutterIcon({
    Key? key,
    this.size = 20.0,
    this.color = Colors.white,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final hex = '#${(color.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, '0')}';
    final svg = '''
<svg xmlns="http://www.w3.org/2000/svg" width="$size" height="$size" viewBox="0 0 24 24" fill="none" stroke="$hex" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14"/>
  <path d="M17 14h.01"/>
</svg>
''';
    return SizedBox(
      width: size,
      height: size,
      child: SvgPicture.string(
        svg,
        width: size,
        height: size,
        fit: BoxFit.contain,
      ),
    );
  }
}

/// Flag of Arakan (United League of Arakan)
class FlagArakan extends StatelessWidget {
  final double width;
  final double? height;

  const FlagArakan({Key? key, this.width = 22.0, this.height}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final h = height ?? (width * 2 / 3);
    return ClipRRect(
      borderRadius: BorderRadius.circular(3),
      child: Image.asset(
        'assets/flags/united-league-of-arakan-flag.png',
        width: width,
        height: h,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          width: width,
          height: h,
          color: const Color(0xFFD91624),
          alignment: Alignment.center,
          child: const Text('AK', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}

/// Great Britain / UK Flag for English language selector
class FlagGB extends StatelessWidget {
  final double width;
  final double? height;

  const FlagGB({Key? key, this.width = 22.0, this.height}) : super(key: key);

  static const String _gbSvg = '''
<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
  <clipPath id="gb-flag-clip">
    <path d="M0,0 v40 h60 v-40 z" />
  </clipPath>
  <clipPath id="gb-flag-diag">
    <path d="M30,20 L60,40 H0 z M30,20 L60,0 H0 z" />
  </clipPath>
  <g clipPath="url(#gb-flag-clip)">
    <path d="M0,0 v40 h60 v-40 z" fill="#012169" />
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="8" />
    <path d="M0,0 L60,40 M60,0 L0,40" clip-path="url(#gb-flag-diag)" stroke="#C8102E" stroke-width="4" />
    <path d="M30,0 v40 M0,20 h60" stroke="#fff" stroke-width="12" />
    <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" stroke-width="6" />
  </g>
</svg>
''';

  @override
  Widget build(BuildContext context) {
    final h = height ?? (width * 2 / 3);
    return ClipRRect(
      borderRadius: BorderRadius.circular(3),
      child: SizedBox(
        width: width,
        height: h,
        child: SvgPicture.string(_gbSvg, fit: BoxFit.cover),
      ),
    );
  }
}

/// Myanmar National Flag for MM language selector
class FlagMM extends StatelessWidget {
  final double width;
  final double? height;

  const FlagMM({Key? key, this.width = 22.0, this.height}) : super(key: key);

  static const String _mmSvg = '''
<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="13.33" fill="#FECB00" />
  <rect y="13.33" width="60" height="13.33" fill="#34B233" />
  <rect y="26.66" width="60" height="13.34" fill="#EA2839" />
  <polygon points="30,6 34.5,19 48,19 37.2,27 41.2,39.5 30,31.5 18.8,39.5 22.8,27 12,19 25.5,19" fill="#FFFFFF" />
</svg>
''';

  @override
  Widget build(BuildContext context) {
    final h = height ?? (width * 2 / 3);
    return ClipRRect(
      borderRadius: BorderRadius.circular(3),
      child: SizedBox(
        width: width,
        height: h,
        child: SvgPicture.string(_mmSvg, fit: BoxFit.cover),
      ),
    );
  }
}

/// Spring Development Bank 4-Finger Salute / Hand Emblem matching mobile screenshots
class SpringBankHandEmblem extends StatelessWidget {
  final double size;
  final Color color;

  const SpringBankHandEmblem({
    Key? key,
    this.size = 46.0,
    this.color = Colors.white,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final hex = '#${(color.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, '0')}';
    final svg = '''
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 4 Fingers -->
  <rect x="22" y="24" width="8" height="34" rx="4" fill="$hex" />
  <rect x="34" y="14" width="8" height="44" rx="4" fill="$hex" />
  <rect x="46" y="18" width="8" height="40" rx="4" fill="$hex" />
  <rect x="58" y="26" width="8" height="32" rx="4" fill="$hex" />
  <!-- Lower Ribbon / Palm Origami Chevron Fold -->
  <path d="M19 54 C19 66 26 75 36 83 L44 89 L52 83 C62 75 69 66 69 54" stroke="$hex" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M25 64 L44 79 L63 64" stroke="$hex" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M34 76 L44 84 L54 76" stroke="$hex" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
</svg>
''';
    return SizedBox(
      width: size,
      height: size,
      child: SvgPicture.string(
        svg,
        width: size,
        height: size,
        fit: BoxFit.contain,
      ),
    );
  }
}


