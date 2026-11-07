"""Convert all Péthar screens to a monochrome true-black liquid-glass look.

- Removes every gradient (replaced with translucent glass / solid black).
- Surfaces become dark translucent glass.
- Borders become subtle translucent white.
- Text and icons become white / light grey.
- Scaffold backgrounds become true black.

Idempotent and safe to rerun.
"""
import re
import sys
from pathlib import Path

TARGET_SKIP = {
    'lib/app_state.dart',
    'lib/main.dart',
    'lib/theme.dart',
    'lib/i18n.dart',
    'lib/data/address_data.dart',
}
TARGET_SKIP_PREFIX = (
    'lib/models/',
    'lib/core/',
)

HEX_RE = re.compile(r'Color\(0x([0-9A-Fa-f]{8})\)')

BLOCKS = {
    'TextStyle': 'text',
    'Icon': 'text',
    'IconThemeData': 'text',
    'BoxDecoration': 'decoration',
    'BorderSide': 'border',
    'Border.all': 'border',
    'Border': 'border',
    'BoxShadow': 'shadow',
    'LinearGradient': 'gradient',
    'RadialGradient': 'gradient',
    'SweepGradient': 'gradient',
    'Scaffold': 'scaffold',
    'AppBar': 'surface',
}

ACCENT_IDENTIFIERS = (
    'crimson', 'crimsonDark', 'paynoBlue', 'paynoBlueLight', 'gold',
    'goldLight', 'cyanNeon', 'emeraldSuccess', 'obsidian', 'surfaceDark',
    'surfaceCard',
)
COLOR_IDENTIFIER_RE = re.compile(
    r'\b(?:' + '|'.join(ACCENT_IDENTIFIERS) + r')\b'
    r'|Colors\.(?:red|blue|green|orange|amber|yellow|teal|purple|pink|cyan|indigo|lime|brown|deepOrange|deepPurple|lightBlue|lightGreen|blueGrey)(?:\[\d+\]|\.shade\d+)?'
    r'|Colors\.black(?:\d+)?'
)

GLASS_SURFACE = 'Color(0x14FFFFFF)'
GLASS_STRONG = 'const Color(0x1FFFFFFF)'
GLASS_BORDER = 'Color(0x26FFFFFF)'
GLASS_SHADOW = 'Color(0x66000000)'
TRUE_BLACK = 'Color(0xFF000000)'
TEXT_PRIMARY = 'Color(0xFFF4F4F5)'
TEXT_SECONDARY = 'Color(0xFFD4D4D8)'
TEXT_WHITE = 'Colors.white'


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


def build_blocks(s):
    blocks = []
    for name, role in BLOCKS.items():
        for m in re.finditer(r'\b' + re.escape(name) + r'\s*\(', s):
            start = m.end() - 1
            end = matching_paren(s, start)
            if end != -1:
                blocks.append((start, end, role))
    return blocks


def rgb(hexval):
    return (int(hexval[2:4], 16) / 255.0,
            int(hexval[4:6], 16) / 255.0,
            int(hexval[6:8], 16) / 255.0)


def luma(c):
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def property_before(s, pos, window=100):
    chunk = s[max(0, pos - window):pos]
    m = re.search(r'([A-Za-z_]\w*)\s*:\s*(?:const\s*)?$', chunk)
    return m.group(1) if m else ''


def role_at(s, pos, blocks):
    candidates = [(e - b, b, e, r) for b, e, r in blocks if b <= pos <= e]
    if not candidates:
        return 'plain'
    candidates.sort()
    _, b, e, role = candidates[0]
    if role == 'decoration':
        prop = property_before(s, pos)
        if prop in ('border', 'borderSide'):
            return 'border'
        if prop == 'shadowColor':
            return 'shadow'
        if prop == 'gradient':
            return 'gradient'
        return 'surface'
    if role == 'scaffold':
        prop = property_before(s, pos)
        if prop in ('backgroundColor', 'scaffoldBackgroundColor'):
            return 'scaffold'
        return 'surface'
    return role


def text_color(hexval):
    c = rgb(hexval)
    l = luma(c)
    if l < 0.55:
        return TEXT_PRIMARY
    if l < 0.78:
        return TEXT_SECONDARY
    return TEXT_PRIMARY


def remove_gradients(s):
    """Replace each gradient: expression with a solid glass color."""
    out = []
    i = 0
    while True:
        m = re.search(r'\bgradient\s*:\s*', s[i:])
        if not m:
            out.append(s[i:])
            break
        start = i + m.start()
        expr_start = i + m.end()
        # Find the end of the expression: top-level comma or the closing
        # parenthesis of the enclosing argument list.
        depth = 0
        in_str = None
        esc = False
        j = expr_start
        end = len(s)
        while j < len(s):
            ch = s[j]
            if in_str:
                if esc:
                    esc = False
                elif ch == '\\':
                    esc = True
                elif ch == in_str:
                    in_str = None
            else:
                if ch in "'\"":
                    in_str = ch
                elif ch in '([{':
                    depth += 1
                elif ch in ')]}':
                    if depth == 0:
                        end = j
                        break
                    depth -= 1
                elif ch == ',' and depth == 0:
                    end = j
                    break
            j += 1
        expr = s[expr_start:end]
        out.append(s[i:start])
        if 'isSelected' in expr or 'active' in expr:
            out.append('color: isSelected ? const Color(0x1FFFFFFF) : Colors.transparent')
        else:
            out.append('color: ' + GLASS_SURFACE)
        i = end
    return ''.join(out)


def transform(src):
    src = remove_gradients(src)
    blocks = build_blocks(src)
    out = []
    last = 0
    for m in HEX_RE.finditer(src):
        pos = m.start()
        hexval = '0x' + m.group(1).upper()
        role = role_at(src, pos, blocks)
        prop = property_before(src, pos)
        if prop in ('backgroundColor', 'fillColor', 'tileColor',
                    'scaffoldBackgroundColor', 'surfaceTintColor'):
            role = 'scaffold' if prop == 'scaffoldBackgroundColor' else 'surface'
        elif prop in ('foregroundColor', 'iconColor', 'hintStyle', 'labelStyle'):
            role = 'text'
        elif prop == 'shadowColor':
            role = 'shadow'

        if role == 'text':
            new = 'Color(0x' + text_color(hexval)[8:] if False else text_color(hexval)
            out.append(src[last:pos])
            out.append(new)
        elif role == 'scaffold':
            out.append(src[last:pos])
            out.append(TRUE_BLACK)
        elif role == 'surface':
            out.append(src[last:pos])
            out.append(GLASS_SURFACE)
        elif role == 'border':
            out.append(src[last:pos])
            out.append(GLASS_BORDER)
        elif role == 'shadow':
            out.append(src[last:pos])
            out.append(GLASS_SHADOW)
        else:
            out.append(src[last:m.end()])
        last = m.end()
    out.append(src[last:])
    s = ''.join(out)

    # Colored text/icon identifiers -> white, outside of gradients (which are gone).
    # Only touch occurrences that are plain color expressions, not backgrounds.
    lines = []
    for line in s.split('\n'):
        stripped = line.strip()
        if 'backgroundColor:' in line or 'fillColor:' in line or 'tileColor:' in line:
            lines.append(line)
            continue
        if COLOR_IDENTIFIER_RE.search(line):
            line = COLOR_IDENTIFIER_RE.sub('Colors.white', line)
        lines.append(line)
    return '\n'.join(lines)


def main():
    root = Path('.')
    for p in sorted((root / 'lib').rglob('*.dart')):
        rel = p.as_posix()
        if rel in TARGET_SKIP or rel.startswith(TARGET_SKIP_PREFIX):
            continue
        src = p.read_text(encoding='utf-8')
        new = transform(src)
        if new != src:
            p.write_text(new, encoding='utf-8')
            print('glass', rel)


if __name__ == '__main__':
    main()
