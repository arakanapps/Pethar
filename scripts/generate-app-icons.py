import os
import subprocess
import tempfile
from PIL import Image, ImageDraw, ImageFilter

def create_icons():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Target directory paths across the project
    web_public_dir = os.path.join(base_dir, "archive", "platforms", "web-wallet", "public")
    web_flutter_dir = os.path.join(base_dir, "archive", "platforms", "web-wallet", "flutter-web")
    web_public_flutter_dir = os.path.join(web_public_dir, "flutter")
    
    mobile_ios_dir = os.path.join(base_dir, "pethar-wallet", "ios", "Runner", "Assets.xcassets", "AppIcon.appiconset")
    mobile_android_res = os.path.join(base_dir, "pethar-wallet", "android", "app", "src", "main", "res")
    desktop_macos_dir = os.path.join(base_dir, "archive", "platforms", "desktop-client", "macos", "Runner", "Assets.xcassets", "AppIcon.appiconset")
    
    # 0. Source of truth SVG
    src_svg_path = os.path.join(web_public_dir, "pethar-logo-red-white.svg")
    if not os.path.exists(src_svg_path):
        raise FileNotFoundError(f"Source SVG logo not found at: {src_svg_path}")

    print(f"Loading source vector SVG emblem from: {src_svg_path}")
    
    # Render SVG at 2048x2048 for master scaling using sips
    with tempfile.NamedTemporaryFile(suffix=".svg", delete=False) as tmp_svg:
        tmp_svg_path = tmp_svg.name
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_png:
        tmp_png_path = tmp_png.name

    try:
        with open(src_svg_path, "r", encoding="utf-8") as f:
            svg_content = f.read()
            
        # Ensure 2048x2048 rendering dimensions
        svg_2048 = svg_content.replace('width="512" height="512"', 'width="2048" height="2048"')
        with open(tmp_svg_path, "w", encoding="utf-8") as f:
            f.write(svg_2048)
            
        subprocess.run(["sips", "-s", "format", "png", tmp_svg_path, "--out", tmp_png_path], check=True, capture_output=True)
        raw_logo = Image.open(tmp_png_path).convert("RGBA")
    finally:
        if os.path.exists(tmp_svg_path):
            os.remove(tmp_svg_path)
        if os.path.exists(tmp_png_path):
            os.remove(tmp_png_path)
            
    # Also render 512x512 transparent PNG master for direct public use
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_512_png:
        tmp_512_png_path = tmp_512_png.name
    try:
        subprocess.run(["sips", "-s", "format", "png", src_svg_path, "--out", tmp_512_png_path], check=True, capture_output=True)
        master_512 = Image.open(tmp_512_png_path).convert("RGBA")
        
        # Save transparent 512x512 versions
        master_512.save(os.path.join(web_public_dir, "pethar-logo-red-white.png"), "PNG")
        master_512.save(os.path.join(web_public_dir, "logo.png"), "PNG")
        master_512.save(os.path.join(web_public_dir, "apple-touch-icon-removebg-preview.png"), "PNG")
        print("Updated transparent master logos (pethar-logo-red-white.png, logo.png, apple-touch-icon-removebg-preview.png)")
    finally:
        if os.path.exists(tmp_512_png_path):
            os.remove(tmp_512_png_path)

    # Precise crop to bounding box
    bbox = raw_logo.getbbox()
    cropped_logo = raw_logo.crop(bbox)
    w_crop, h_crop = cropped_logo.size
    print(f"Emblem bounds: {w_crop}x{h_crop}")
    
    SIZE = 1024
    # Sizing: Logo width should be ~62% of icon width for iOS standard safe margins
    target_width = int(SIZE * 0.62)
    scale_factor = target_width / w_crop
    target_height = int(h_crop * scale_factor)
    
    # Ultra-sharp lanczos scaling
    logo_resized = cropped_logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
    logo_alpha = logo_resized.split()[3]
    
    lx = (SIZE - target_width) // 2
    ly = (SIZE - target_height) // 2
    
    # -------------------------------------------------------------
    # 1. LIGHT MODE ICON (Square 1024x1024)
    # Pure clean white background, vibrant crimson logo
    # -------------------------------------------------------------
    light_sq = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255))
    light_sq.paste(logo_resized, (lx, ly), logo_resized)
    
    # -------------------------------------------------------------
    # 2. DARK MODE ICON (Square 1024x1024)
    # Deep matte obsidian background (#17181C), razor-sharp crimson logo
    # -------------------------------------------------------------
    dark_sq = Image.new("RGBA", (SIZE, SIZE), (23, 24, 28, 255))
    draw_dark = ImageDraw.Draw(dark_sq)
    for y in range(SIZE):
        t = y / SIZE
        # Subtle top-to-bottom shading from #1C1D22 to #141518
        r = int(28 - t * 8)
        g = int(29 - t * 8)
        b = int(34 - t * 10)
        draw_dark.line([(0, y), (SIZE, y)], fill=(r, g, b, 255))
    dark_sq.paste(logo_resized, (lx, ly), logo_resized)
    
    # -------------------------------------------------------------
    # 3. TINTED / MONOCHROME ICON (Square 1024x1024)
    # Deep slate graphite background with metallic silver-grey luminance gradient
    # matching iOS 18 Tinted reference
    # -------------------------------------------------------------
    tinted_sq = Image.new("RGBA", (SIZE, SIZE), (34, 35, 45, 255))
    draw_tinted = ImageDraw.Draw(tinted_sq)
    for y in range(SIZE):
        t = y / SIZE
        # Gradient #262735 to #1c1d27
        r = int(38 - t * 10)
        g = int(39 - t * 10)
        b = int(53 - t * 14)
        draw_tinted.line([(0, y), (SIZE, y)], fill=(r, g, b, 255))
        
    # Metallic luminance gradient for the emblem
    mono_glyph = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
    draw_mono = ImageDraw.Draw(mono_glyph)
    for y in range(target_height):
        t = y / target_height
        # Top highlight is silver-white #F8FAFC down to slate #94A3B8
        val_r = int(250 - t * 100)
        val_g = int(252 - t * 90)
        val_b = int(255 - t * 75)
        draw_mono.line([(0, y), (target_width, y)], fill=(val_r, val_g, val_b, 255))
    mono_glyph.putalpha(logo_alpha)
    tinted_sq.paste(mono_glyph, (lx, ly), mono_glyph)
    
    # -------------------------------------------------------------
    # 4. MONOCHROME GLYPH (1024x1024 Transparent)
    # For Android Material You & iOS Tinted Asset Catalog
    # -------------------------------------------------------------
    monochrome_glyph_1024 = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    white_glyph = Image.new("RGBA", (target_width, target_height), (255, 255, 255, 255))
    white_glyph.putalpha(logo_alpha)
    monochrome_glyph_1024.paste(white_glyph, (lx, ly), white_glyph)

    # -------------------------------------------------------------
    # 5. SQUIRCLE MASK GENERATOR (iOS Continuous Curvature)
    # -------------------------------------------------------------
    def apply_squircle(img_sq, dim=512, add_border=True, border_color=(255, 255, 255, 30)):
        resized = img_sq.resize((dim, dim), Image.Resampling.LANCZOS)
        # 4x supersampling for ultra smooth antialiased curvature
        scale = 4
        s_dim = dim * scale
        mask = Image.new("L", (s_dim, s_dim), 0)
        draw = ImageDraw.Draw(mask)
        # iOS squircle corner radius is 22.37%
        r = int(s_dim * 0.2237)
        draw.rounded_rectangle([0, 0, s_dim - 1, s_dim - 1], radius=r, fill=255)
        smooth_mask = mask.resize((dim, dim), Image.Resampling.LANCZOS)
        
        out = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
        out.paste(resized, (0, 0), smooth_mask)
        
        if add_border:
            border_img = Image.new("RGBA", (s_dim, s_dim), (0, 0, 0, 0))
            draw_b = ImageDraw.Draw(border_img)
            draw_b.rounded_rectangle([3, 3, s_dim - 4, s_dim - 4], radius=r, outline=border_color, width=4)
            border_scaled = border_img.resize((dim, dim), Image.Resampling.LANCZOS)
            out = Image.alpha_composite(out, border_scaled)
            
        return out

    # Generate presentation squircles
    squircle_light = apply_squircle(light_sq, dim=512, add_border=True, border_color=(226, 232, 240, 200))
    squircle_dark = apply_squircle(dark_sq, dim=512, add_border=True, border_color=(255, 255, 255, 28))
    squircle_tinted = apply_squircle(tinted_sq, dim=512, add_border=True, border_color=(255, 255, 255, 32))
    
    # -------------------------------------------------------------
    # 6. DYNAMIC ACCENT TINTS (Amber Gold, Cyber Blue, Emerald, Violet)
    # -------------------------------------------------------------
    def generate_accent_tint(accent_rgb, dim=512):
        ar, ag, ab = accent_rgb
        # Background: dark tinted graphite
        bg_r = int(18 + ar * 0.08)
        bg_g = int(18 + ag * 0.08)
        bg_b = int(22 + ab * 0.08)
        
        t_sq = Image.new("RGBA", (SIZE, SIZE), (bg_r, bg_g, bg_b, 255))
        draw_t = ImageDraw.Draw(t_sq)
        for y in range(SIZE):
            t = y / SIZE
            cr = max(0, int(bg_r + 6 - t * 10))
            cg = max(0, int(bg_g + 6 - t * 10))
            cb = max(0, int(bg_b + 8 - t * 12))
            draw_t.line([(0, y), (SIZE, y)], fill=(cr, cg, cb, 255))
            
        # Vibrant accent glyph
        accent_glyph = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
        draw_ag = ImageDraw.Draw(accent_glyph)
        for y in range(target_height):
            t = y / target_height
            gr = int(min(255, ar * 1.25 - t * 45))
            gg = int(min(255, ag * 1.25 - t * 45))
            gb = int(min(255, ab * 1.25 - t * 45))
            draw_ag.line([(0, y), (target_width, y)], fill=(gr, gg, gb, 255))
        accent_glyph.putalpha(logo_alpha)
        t_sq.paste(accent_glyph, (lx, ly), accent_glyph)
        
        return apply_squircle(t_sq, dim=dim, add_border=True, border_color=(ar, ag, ab, 70))

    squircle_tint_amber = generate_accent_tint((245, 158, 11), dim=512)    # Gold / Amber
    squircle_tint_blue = generate_accent_tint((59, 130, 246), dim=512)     # Cyber Blue
    squircle_tint_emerald = generate_accent_tint((16, 185, 129), dim=512)  # Emerald
    squircle_tint_purple = generate_accent_tint((168, 85, 247), dim=512)   # Purple

    # -------------------------------------------------------------
    # 7. SAVE TO WEB WALLET PUBLIC
    # -------------------------------------------------------------
    print(f"Writing assets to {web_public_dir}...")
    light_sq.save(os.path.join(web_public_dir, "icon-light-1024.png"), "PNG")
    dark_sq.save(os.path.join(web_public_dir, "icon-dark-1024.png"), "PNG")
    tinted_sq.save(os.path.join(web_public_dir, "icon-tinted-1024.png"), "PNG")
    monochrome_glyph_1024.save(os.path.join(web_public_dir, "icon-monochrome-1024.png"), "PNG")
    
    squircle_light.save(os.path.join(web_public_dir, "icon-light.png"), "PNG")
    squircle_dark.save(os.path.join(web_public_dir, "icon-dark.png"), "PNG")
    squircle_tinted.save(os.path.join(web_public_dir, "icon-tinted.png"), "PNG")
    squircle_tint_amber.save(os.path.join(web_public_dir, "icon-tinted-amber.png"), "PNG")
    squircle_tint_blue.save(os.path.join(web_public_dir, "icon-tinted-blue.png"), "PNG")
    squircle_tint_emerald.save(os.path.join(web_public_dir, "icon-tinted-emerald.png"), "PNG")
    squircle_tint_purple.save(os.path.join(web_public_dir, "icon-tinted-purple.png"), "PNG")
    
    # Touch icons & Android Chrome PWA
    apply_squircle(dark_sq, dim=180, add_border=False).save(os.path.join(web_public_dir, "apple-touch-icon.png"), "PNG")
    apply_squircle(light_sq, dim=180, add_border=False).save(os.path.join(web_public_dir, "apple-touch-icon-light.png"), "PNG")
    apply_squircle(dark_sq, dim=180, add_border=False).save(os.path.join(web_public_dir, "apple-touch-icon-dark.png"), "PNG")
    apply_squircle(dark_sq, dim=192, add_border=False).save(os.path.join(web_public_dir, "android-chrome-192x192.png"), "PNG")
    apply_squircle(dark_sq, dim=512, add_border=False).save(os.path.join(web_public_dir, "android-chrome-512x512.png"), "PNG")

    # Favicons (transparent crisp emblem)
    def make_fav(dim):
        fav = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
        pad = max(1, dim // 16)
        content_size = dim - 2 * pad
        scaled_w = content_size
        scale = scaled_w / w_crop
        scaled_h = int(h_crop * scale)
        if scaled_h > content_size:
            scaled_h = content_size
            scale = scaled_h / h_crop
            scaled_w = int(w_crop * scale)
        resized = cropped_logo.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)
        fx = (dim - scaled_w) // 2
        fy = (dim - scaled_h) // 2
        fav.paste(resized, (fx, fy), resized)
        return fav

    fav16 = make_fav(16)
    fav32 = make_fav(32)
    fav48 = make_fav(48)
    fav16.save(os.path.join(web_public_dir, "favicon-16x16.png"), "PNG")
    fav32.save(os.path.join(web_public_dir, "favicon-32x32.png"), "PNG")
    fav48.save(os.path.join(web_public_dir, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

    # -------------------------------------------------------------
    # 8. GENERATE SIDE-BY-SIDE DEVICE THEMES SHOWCASE BANNER
    # -------------------------------------------------------------
    banner_w, banner_h = 1200, 520
    banner = Image.new("RGBA", (banner_w, banner_h), (11, 15, 25, 255))
    draw_ban = ImageDraw.Draw(banner)
    
    # Ambient wallpaper background
    for y in range(banner_h):
        t = y / banner_h
        r = int(12 + t * 8)
        g = int(16 + t * 10)
        b = int(28 + t * 14)
        draw_ban.line([(0, y), (banner_w, y)], fill=(r, g, b, 255))
        
    icon_display_size = 200
    sq_l_small = squircle_light.resize((icon_display_size, icon_display_size), Image.Resampling.LANCZOS)
    sq_d_small = squircle_dark.resize((icon_display_size, icon_display_size), Image.Resampling.LANCZOS)
    sq_t_small = squircle_tinted.resize((icon_display_size, icon_display_size), Image.Resampling.LANCZOS)
    
    # Drop shadow function
    def add_drop_shadow(icon_img):
        shadow_canvas = Image.new("RGBA", (icon_display_size + 40, icon_display_size + 40), (0, 0, 0, 0))
        s_mask = icon_img.split()[3].filter(ImageFilter.GaussianBlur(14))
        shadow = Image.new("RGBA", (icon_display_size, icon_display_size), (0, 0, 0, 160))
        shadow_canvas.paste(shadow, (20, 26), s_mask)
        shadow_canvas.paste(icon_img, (20, 20), icon_img)
        return shadow_canvas

    col_positions = [
        ("Light Theme", "Default & Daylight", sq_l_small, 200),
        ("Dark Theme", "OLED Dark Mode", sq_d_small, 600),
        ("Tinted Theme", "iOS 18 & Material You", sq_t_small, 1000),
    ]
    
    for title, subtitle, img, cx in col_positions:
        comp = add_drop_shadow(img)
        banner.paste(comp, (cx - (icon_display_size + 40) // 2, 80), comp)
        
    banner.save(os.path.join(web_public_dir, "adaptive-icons-showcase.png"), "PNG")
    print("Saved adaptive-icons-showcase.png")

    # -------------------------------------------------------------
    # 9. FLUTTER WEB ICONS & FAVICONS
    # -------------------------------------------------------------
    for f_dir in [web_flutter_dir, web_public_flutter_dir]:
        if os.path.exists(f_dir):
            icons_sub = os.path.join(f_dir, "icons")
            os.makedirs(icons_sub, exist_ok=True)
            fav32.save(os.path.join(f_dir, "favicon.png"), "PNG")
            apply_squircle(dark_sq, dim=192, add_border=False).save(os.path.join(icons_sub, "Icon-192.png"), "PNG")
            apply_squircle(dark_sq, dim=512, add_border=False).save(os.path.join(icons_sub, "Icon-512.png"), "PNG")
            dark_sq.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(icons_sub, "Icon-maskable-192.png"), "PNG")
            dark_sq.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(icons_sub, "Icon-maskable-512.png"), "PNG")
            print(f"Updated Flutter web icons in {f_dir}")

    # -------------------------------------------------------------
    # 10. UPDATE iOS ASSETS (Contents.json & icons)
    # -------------------------------------------------------------
    if os.path.exists(mobile_ios_dir):
        print("Writing iOS Xcode 16 / iOS 18 Asset Catalog...")
        light_sq.save(os.path.join(mobile_ios_dir, "Icon-App-1024x1024@1x.png"), "PNG")
        dark_sq.save(os.path.join(mobile_ios_dir, "Icon-App-Dark-1024x1024@1x.png"), "PNG")
        tinted_sq.save(os.path.join(mobile_ios_dir, "Icon-App-Tinted-1024x1024@1x.png"), "PNG")
        
        ios_sizes = [
            ("Icon-App-20x20@1x.png", 20),
            ("Icon-App-20x20@2x.png", 40),
            ("Icon-App-20x20@3x.png", 60),
            ("Icon-App-29x29@1x.png", 29),
            ("Icon-App-29x29@2x.png", 58),
            ("Icon-App-29x29@3x.png", 87),
            ("Icon-App-40x40@1x.png", 40),
            ("Icon-App-40x40@2x.png", 80),
            ("Icon-App-40x40@3x.png", 120),
            ("Icon-App-60x60@2x.png", 120),
            ("Icon-App-60x60@3x.png", 180),
            ("Icon-App-76x76@1x.png", 76),
            ("Icon-App-76x76@2x.png", 152),
            ("Icon-App-83.5x83.5@2x.png", 167),
        ]
        for filename, sz in ios_sizes:
            light_sq.resize((sz, sz), Image.Resampling.LANCZOS).save(os.path.join(mobile_ios_dir, filename), "PNG")

    # -------------------------------------------------------------
    # 11. UPDATE ANDROID MIPMAPS
    # -------------------------------------------------------------
    if os.path.exists(mobile_android_res):
        print("Updating Android launcher mipmaps...")
        android_sizes = {
            "mipmap-mdpi": 48,
            "mipmap-hdpi": 72,
            "mipmap-xhdpi": 96,
            "mipmap-xxhdpi": 144,
            "mipmap-xxxhdpi": 192,
        }
        for folder, sz in android_sizes.items():
            fpath = os.path.join(mobile_android_res, folder)
            if os.path.exists(fpath):
                apply_squircle(dark_sq, dim=sz, add_border=False).save(os.path.join(fpath, "ic_launcher.png"), "PNG")
                r_mask = Image.new("L", (sz * 4, sz * 4), 0)
                ImageDraw.Draw(r_mask).ellipse([0, 0, sz * 4 - 1, sz * 4 - 1], fill=255)
                r_mask_small = r_mask.resize((sz, sz), Image.Resampling.LANCZOS)
                round_icon = Image.new("RGBA", (sz, sz), (0, 0, 0, 0))
                round_icon.paste(dark_sq.resize((sz, sz), Image.Resampling.LANCZOS), (0, 0), r_mask_small)
                round_icon.save(os.path.join(fpath, "ic_launcher_round.png"), "PNG")

    # -------------------------------------------------------------
    # 12. UPDATE DESKTOP MACOS APPICONS
    # -------------------------------------------------------------
    if os.path.exists(desktop_macos_dir):
        print("Updating Desktop macOS AppIcon.appiconset...")
        desktop_sizes = [16, 32, 64, 128, 256, 512, 1024]
        for sz in desktop_sizes:
            apply_squircle(dark_sq, dim=sz, add_border=False).save(os.path.join(desktop_macos_dir, f"app_icon_{sz}.png"), "PNG")

    print("\nSUCCESS: All logos and icons have been regenerated from pethar-logo-red-white.svg across Web, Mobile (iOS/Android), and Desktop!")

if __name__ == "__main__":
    create_icons()
