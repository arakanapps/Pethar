"""One-off palette transform for the Péthar true-black dark theme.

Skips files that another agent is actively editing when run with --safe.
"""
import re
import sys
from pathlib import Path

SKIP_ACTIVE = {
    'lib/home/home_screen.dart',
    'lib/main.dart',
    'lib/transfer/transfer_screen.dart',
}

TEXT = {
    '0xFF0F172A': '0xFFF4F4F5',
    '0xFF0B1220': '0xFFF4F4F5',
    '0xFF111827': '0xFFF4F4F5',
    '0xFF18181B': '0xFFFAFAFA',
    '0xFF1E293B': '0xFFE4E4E7',
    '0xFF1F2937': '0xFFE4E4E7',
    '0xFF334155': '0xFFD4D4D8',
    '0xFF3F3F46': '0xFFD4D4D8',
    '0xFF475569': '0xFFA1A1AA',
    '0xFF52525B': '0xFFA1A1AA',
    '0xFF4B5563': '0xFFA1A1AA',
    '0xFF64748B': '0xFFA1A1AA',
    '0xFF71717A': '0xFFA1A1AA',
    '0xFF7C8AA0': '0xFFA1A1AA',
    '0xFF8A98AC': '0xFFA1A1AA',
    '0xFF94A3B8': '0xFFA1A1AA',
    '0xFF9CA3AF': '0xFFA1A1AA',
    '0xFF6B7280': '0xFFA1A1AA',
    '0xFFA1A1AA': '0xFFD4D4D8',
}

SURFACE = {
    '0xFFFFFFFF': '0xFF000000',
    '0xFFFAFAFA': '0xFF0A0A0A',
    '0xFFF8FAFC': '0xFF000000',
    '0xFFF9FAFB': '0xFF0A0A0A',
    '0xFFF4F4F5': '0xFF111111',
    '0xFFF1F5F9': '0xFF0A0A0A',
    '0xFFF4F5F8': '0xFF000000',
    '0xFFF4F7FC': '0xFF000000',
    '0xFFF3F6FB': '0xFF000000',
    '0xFFF5FAFE': '0xFF000000',
    '0xFFF0F6FD': '0xFF000000',
    '0xFFEAF4FD': '0xFF000000',
    '0xFFFDF5F6': '0xFF1A0A0C',
    '0xFFFDF3F4': '0xFF0A0A0A',
    '0xFFFFEFF1': '0xFF1A0A0C',
    '0xFFF6FAFF': '0xFF0A0A0A',
    '0xFFF0FDFA': '0xFF0A0A0A',
    '0xFFEEF2FF': '0xFF0A0A0A',
    '0xFFEFF6FF': '0xFF0A0A0A',
    '0xFFE0F2FE': '0xFF0A0A0A',
    '0xFFE3F0FD': '0xFF0A0A0A',
    '0xFFCFE5FC': '0xFF0A0A0A',
    '0xFFE2EDF9': '0xFF262626',
    '0xFFF0F7FE': '0xFF0A0A0A',
    '0xFFF5F7FB': '0xFF0A0A0A',
    '0xFFF1F6FB': '0xFF0A0A0A',
    '0xFFEFF3FA': '0xFF0A0A0A',
    '0xFFF4F7FC': '0xFF000000',
    '0xFFF0FDF4': '0xFF0A0A0A',
    '0xFFFFFBEB': '0xFF1A1400',
    '0xFFFEF3C7': '0xFF1A1400',
    '0xFFFFF1F2': '0xFF1A0A0C',
    '0xFFFEF2F2': '0xFF1A0A0C',
    '0xFFFFE4E6': '0xFF2A0A0E',
    '0xFFFFE4E7': '0xFF2A0A0E',
    '0xFFFEE2E2': '0xFF2A0A0E',
    '0xFFDCEBFC': '0xFF0A0A0A',
    '0xFFDDEBFC': '0xFF0A0A0A',
    '0xFFE2EFFC': '0xFF0A0A0A',
    '0xFFE3EDF9': '0xFF0A0A0A',
    '0xFFE5F1FC': '0xFF0A0A0A',
    '0xFFE8EEF5': '0xFF0A0A0A',
    '0xFFE8EEF7': '0xFF0A0A0A',
    '0xFFEEF5FD': '0xFF0A0A0A',
    '0xFFEEF7FE': '0xFF0A0A0A',
    '0xFFEFF4FB': '0xFF000000',
    '0xFFF0F9FF': '0xFF0A0A0A',
    '0xFFF2F7FD': '0xFF0A0A0A',
    '0xFFF6F7FB': '0xFF0A0A0A',
    '0xFFF8FBFF': '0xFF0A0A0A',
    '0xFFF9FCFF': '0xFF0A0A0A',
    '0xFFFAFDFF': '0xFF0A0A0A',
    '0xFFFCF3F5': '0xFF0A0A0A',
    '0xFFFCFCFD': '0xFF000000',
    '0xFFF3DFB4': '0xFF1A1400',
    '0xFFF5D77A': '0xFF1A1400',
    '0xFFF5E6A3': '0xFF1A1400',
    '0xFFF6DFAE': '0xFF1A1400',
    '0xFFFCEBC4': '0xFF1A1400',
    '0xFFFFF7E8': '0xFF1A1400',
    '0xFFFFF9EC': '0xFF1A1400',
    '0xFFFBC5C9': '0xFF3F1D24',
    '0xFFFDECEE': '0xFF1A0A0C',
    '0xFFFDF2F8': '0xFF1A0A0C',
}

BORDER = {
    '0xFFE2E8F0': '0xFF262626',
    '0xFFE5E7EB': '0xFF262626',
    '0xFFE4E4E7': '0xFF27272A',
    '0xFFCBD5E1': '0xFF3F3F46',
    '0xFFD4D4D8': '0xFF3F3F46',
    '0xFFFECDD3': '0xFF3F1D24',
    '0xFFFECACA': '0xFF3F1D24',
    '0xFFBFDBFE': '0xFF1E3A8A',
    '0xFF93C5FD': '0xFF1D4ED8',
    '0xFFBBF7D0': '0xFF14532D',
    '0xFFFDE68A': '0xFF78350F',
    '0xFFDBEAFE': '0xFF172554',
}

ALL = {**TEXT, **SURFACE, **BORDER}


def matching_paren(s, start):
    depth = 0
    in_str = None
    esc = False
    i = start
    while i < len(s):
        c = s[i]
        if in_str:
            if esc:
                esc = False
            elif c == '\\':
                esc = True
            elif c == in_str:
                in_str = None
        else:
            if c in "'\"":
                in_str = c
            elif c == '(':
                depth += 1
            elif c == ')':
                depth -= 1
                if depth == 0:
                    return i
        i += 1
    return -1


def transform_decoration_text(block):
    block = re.sub(r'color:\s*Colors\.white,',
                   'color: const Color(0xFF0A0A0A),', block)
    block = re.sub(r'color:\s*Colors\.white\)',
                   'color: const Color(0xFF0A0A0A))', block)
    block = re.sub(r'(BorderSide\(\s*color:\s*)Colors\.white(?!\.withValues)',
                   r'\1const Color(0xFF262626)', block)
    block = re.sub(r'(Border\.all\(\s*color:\s*)Colors\.white(?!\.withValues)',
                   r'\1const Color(0xFF262626)', block)
    return block


def transform(src):
    # Colour properties that should stay dark in dark mode.
    protected_props = (
        'backgroundColor:', 'fillColor:', 'tileColor:', 'scaffoldBackgroundColor:',
        'systemNavigationBarColor:', 'systemNavigationBarDividerColor:',
        'statusBarColor:', 'selectionColor:', 'cursorColor:',
    )

    out_lines = []
    in_colors_list = False
    for line in src.split('\n'):
        stripped = line.strip()
        if stripped.startswith('colors:'):
            in_colors_list = True
        if in_colors_list:
            out_lines.append(line)
            if ']' in line:
                in_colors_list = False
            continue
        if any(p in line for p in protected_props):
            out_lines.append(line)
            continue

        def repl(m):
            hexval = m.group(1).upper()
            key = '0x' + hexval
            if key in ALL:
                return 'Color(0x' + ALL[key][2:] + ')'
            return m.group(0)

        line = re.sub(r'Color\(0x([0-9A-Fa-f]{8})\)', repl, line)
        out_lines.append(line)

    s = '\n'.join(out_lines)

    # Surfaces declared as a whole-widget background.
    s = s.replace('backgroundColor: Colors.white', 'backgroundColor: trueBlack')
    s = s.replace('backgroundColor: Colors.white,', 'backgroundColor: trueBlack,')
    s = s.replace('scaffoldBackgroundColor: Colors.white', 'scaffoldBackgroundColor: trueBlack')
    s = s.replace('fillColor: Colors.white', 'fillColor: trueBlackElevated')
    s = s.replace('tileColor: Colors.white', 'tileColor: trueBlackElevated')

    # Replace solid white fills/borders inside BoxDecoration blocks only.
    i = 0
    chunks = []
    while True:
        idx = s.find('BoxDecoration(', i)
        if idx == -1:
            chunks.append(s[i:])
            break
        end = matching_paren(s, idx + len('BoxDecoration(') - 1)
        if end == -1:
            chunks.append(s[i:])
            break
        chunks.append(s[i:idx])
        chunks.append(transform_decoration_text(s[idx:end + 1]))
        i = end + 1
    s = ''.join(chunks)

    return s


def main():
    root = Path('.')
    safe = '--safe' in sys.argv
    files = sorted((root / 'lib').rglob('*.dart'))
    for p in files:
        rel = p.as_posix()
        if safe and rel in SKIP_ACTIVE:
            print('skip', rel)
            continue
        src = p.read_text(encoding='utf-8')
        new = transform(src)
        if new != src:
            p.write_text(new, encoding='utf-8')
            print('dark', rel)


if __name__ == '__main__':
    main()
