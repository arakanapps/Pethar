import os
from PIL import Image, ImageDraw, ImageFilter

def create_icons():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, "pethar-wallet", "public")
    mobile_ios_dir = os.path.join(base_dir, "pethar-wallet", "ios", "Runner", "Assets.xcassets", "AppIcon.appiconset")
    mobile_android_res = os.path.join(base_dir, "pethar-wallet", "android", "app", "src", "main", "res")
    
    src_logo_path = os.path.join(public_dir, "pethar-logo-red-white.png")
    if not os.path.exists(src_logo_path):
        src_logo_path = os.path.join(public_dir, "logo.png")
        
    print(f"Loading emblem from: {src_logo_path}")
    raw_logo = Image.open(src_logo_path).convert("RGBA")
    
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
    # matching iOS 18 Tinted Gmail reference (media_1791973206223_c3274f14.jpg)
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

    # Save to public
    print("Writing assets to pethar-wallet/public...")
    light_sq.save(os.path.join(public_dir, "icon-light-1024.png"), "PNG")
    dark_sq.save(os.path.join(public_dir, "icon-dark-1024.png"), "PNG")
    tinted_sq.save(os.path.join(public_dir, "icon-tinted-1024.png"), "PNG")
    monochrome_glyph_1024.save(os.path.join(public_dir, "icon-monochrome-1024.png"), "PNG")
    
    squircle_light.save(os.path.join(public_dir, "icon-light.png"), "PNG")
    squircle_dark.save(os.path.join(public_dir, "icon-dark.png"), "PNG")
    squircle_tinted.save(os.path.join(public_dir, "icon-tinted.png"), "PNG")
    squircle_tint_amber.save(os.path.join(public_dir, "icon-tinted-amber.png"), "PNG")
    squircle_tint_blue.save(os.path.join(public_dir, "icon-tinted-blue.png"), "PNG")
    squircle_tint_emerald.save(os.path.join(public_dir, "icon-tinted-emerald.png"), "PNG")
    squircle_tint_purple.save(os.path.join(public_dir, "icon-tinted-purple.png"), "PNG")
    
    # Touch icons
    apply_squircle(dark_sq, dim=180, add_border=False).save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")
    apply_squircle(light_sq, dim=180, add_border=False).save(os.path.join(public_dir, "apple-touch-icon-light.png"), "PNG")
    apply_squircle(dark_sq, dim=180, add_border=False).save(os.path.join(public_dir, "apple-touch-icon-dark.png"), "PNG")
    apply_squircle(dark_sq, dim=192, add_border=False).save(os.path.join(public_dir, "android-chrome-192x192.png"), "PNG")
    apply_squircle(dark_sq, dim=512, add_border=False).save(os.path.join(public_dir, "android-chrome-512x512.png"), "PNG")

    # -------------------------------------------------------------
    # 7. GENERATE SIDE-BY-SIDE DEVICE THEMES SHOWCASE BANNER
    # (Matches user's 3 Gmail reference screenshots)
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
        
    banner.save(os.path.join(public_dir, "adaptive-icons-showcase.png"), "PNG")
    print("Saved adaptive-icons-showcase.png")

    # -------------------------------------------------------------
    # 8. UPDATE iOS Assets (Contents.json & icons)
    # -------------------------------------------------------------
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
    # 9. UPDATE ANDROID MIPMAPS
    # -------------------------------------------------------------
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

    print("Success: Generated all Light, Dark, Tinted, and Showcase icon sets!")

if __name__ == "__main__":
    create_icons()
