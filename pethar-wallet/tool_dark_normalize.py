"""Role-aware true-black palette normalizer for Péthar Flutter screens.

Idempotent: safe to run repeatedly. It classifies each hardcoded colour by
whether it is used as text, a surface, or a border, then maps it into the
true-black palette while preserving brand accents and gradients.
"""
import re
import sys
from pathlib import Path

SKIP_ACTIVE = {
    'lib/theme.dart',
}

HEX_RE = re.compile(r'Color\(0x([0-9A-Fa-f]{8})\)')

BLOCKS = {
    'TextStyle': 'text',
    'Icon': 'text',
    'foregroundColor': 'text',
    'BoxDecoration': 'decoration',
    'BorderSide': 'border',
    'Border.all': 'border',
    'Border': 'border',
    'LinearGradient': 'gradient',
    'RadialGradient': 'gradient',
    'SweepGradient': 'gradient',
}


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
    return (int(hexval[4:6], 16) / 255.0,
            int(hexval[6:8], 16) / 255.0,
            int(hexval[8:10], 16) / 255.0)


def luma(c):
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def sat(c):
    mx, mn = max(c), min(c)
    if mx == 0:
        return 0.0
    return (mx - mn) / mx


def tint_dark(c):
    r, g, b = c
    if r > g + 0.08 and r > b + 0.08:
        return '0xFF1A0A0C'
    if min(r, g) > b + 0.06:
        return '0xFF1A1400'
    if g > r + 0.05:
        return '0xFF0A140A'
    return '0xFF000000'


def tint_border(c):
    r, g, b = c
    if r > g + 0.08 and r > b + 0.08:
        return '0xFF3F1D24'
    if b > r + 0.08:
        return '0xFF1E3A8A'
    if g > r + 0.05:
        return '0xFF14532D'
    if min(r, g) > b + 0.06:
        return '0xFF78350F'
    return '0xFF262626'


def map_text(hexval, c):
    l, s = luma(c), sat(c)
    if s >= 0.40 and l > 0.16:
        return hexval  # brand accent (red, blue, green, gold...)
    if l < 0.12:
        return '0xFFF4F4F5'
    if l < 0.30:
        return '0xFFD4D4D8'
    if l < 0.55:
        return '0xFFA1A1AA'
    if s < 0.35 and l < 0.72:
        return '0xFFA1A1AA'
    return hexval


def map_surface(hexval, c):
    l, s = luma(c), sat(c)
    if l > 0.55:
        return tint_dark(c)
    if 0.15 < l < 0.55 and s < 0.35:
        return '0xFF000000'
    return hexval


def map_border(hexval, c):
    l, s = luma(c), sat(c)
    if l > 0.50:
        return tint_border(c)
    if l > 0.25 and s < 0.25:
        return '0xFF262626'
    return hexval


def property_before(s, pos):
    chunk = s[max(0, pos - 80):pos]
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
        if prop in ('shadowColor',):
            return 'shadow'
        if prop in ('color', 'gradient'):
            return 'surface' if prop == 'color' else 'gradient'
        return 'surface'
    return role


def transform(src):
    blocks = build_blocks(src)
    out = []
    last = 0
    for m in HEX_RE.finditer(src):
        pos = m.start()
        hexval = '0x' + m.group(1).upper()
        c = rgb(hexval)
        role = role_at(src, pos, blocks)
        prop = property_before(src, pos)
        if prop in ('backgroundColor', 'fillColor', 'tileColor',
                    'scaffoldBackgroundColor', 'surfaceTintColor'):
            role = 'surface'
        elif prop in ('foregroundColor', 'hintStyle', 'labelStyle',
                      'iconColor', 'statusBarColor', 'systemNavigationBarColor'):
            role = 'text' if prop in ('foregroundColor', 'iconColor') else role
        elif prop in ('shadowColor',):
            role = 'shadow'

        new = hexval
        if role == 'text':
            new = map_text(hexval, c)
        elif role == 'surface':
            new = map_surface(hexval, c)
        elif role == 'border':
            new = map_border(hexval, c)
        # gradient/shadow/plain are left untouched

        out.append(src[last:pos])
        out.append('Color(' + new + ')')
        last = m.end()
    out.append(src[last:])
    return ''.join(out)


def main():
    root = Path('.')
    safe = '--safe' in sys.argv
    for p in sorted((root / 'lib').rglob('*.dart')):
        rel = p.as_posix()
        if safe and rel in SKIP_ACTIVE:
            print('skip', rel)
            continue
        src = p.read_text(encoding='utf-8')
        new = transform(src)
        if new != src:
            p.write_text(new, encoding='utf-8')
            print('normalized', rel)


if __name__ == '__main__':
    main()
