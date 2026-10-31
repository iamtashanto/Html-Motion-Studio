#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw

def create_store_assets():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    master_icon_path = os.path.join(script_dir, "icon.png")
    appx_dir = os.path.join(script_dir, "appx")
    store_assets_dir = os.path.join(script_dir, "store-assets")

    os.makedirs(appx_dir, exist_ok=True)
    os.makedirs(store_assets_dir, exist_ok=True)

    master = Image.open(master_icon_path).convert("RGBA")

    # 1. Generate AppX Package Assets
    # StoreLogo: 50x50
    master.resize((50, 50), Image.Resampling.LANCZOS).save(os.path.join(appx_dir, "StoreLogo.png"), "PNG")
    # Square44x44Logo: 44x44
    master.resize((44, 44), Image.Resampling.LANCZOS).save(os.path.join(appx_dir, "Square44x44Logo.png"), "PNG")
    # Square150x150Logo: 150x150
    master.resize((150, 150), Image.Resampling.LANCZOS).save(os.path.join(appx_dir, "Square150x150Logo.png"), "PNG")
    # LargeTile: 310x310
    master.resize((310, 310), Image.Resampling.LANCZOS).save(os.path.join(appx_dir, "LargeTile.png"), "PNG")
    # BadgeLogo: 24x24
    master.resize((24, 24), Image.Resampling.LANCZOS).save(os.path.join(appx_dir, "BadgeLogo.png"), "PNG")

    # Wide310x150Logo: 310x150 (centered icon on dark background #070a16)
    wide_img = Image.new("RGBA", (310, 150), (7, 10, 22, 255))
    icon_sub = master.resize((120, 120), Image.Resampling.LANCZOS)
    wide_img.paste(icon_sub, ((310 - 120) // 2, (150 - 120) // 2), icon_sub)
    wide_img.save(os.path.join(appx_dir, "Wide310x150Logo.png"), "PNG")

    # 2. Store Listing Assets for Microsoft Partner Center
    # App Tile Icon: 300x300
    master.resize((300, 300), Image.Resampling.LANCZOS).save(os.path.join(store_assets_dir, "AppTile-300x300.png"), "PNG")

    # Store Logo: 50x50
    master.resize((50, 50), Image.Resampling.LANCZOS).save(os.path.join(store_assets_dir, "StoreLogo-50x50.png"), "PNG")

    # Hero Art / Header Banner: 1920x1080 (16:9)
    # Create high-end dark studio banner
    hero_img = Image.new("RGBA", (1920, 1080), (7, 10, 22, 255))
    # We can center a large high-res logo
    hero_logo = master.resize((450, 450), Image.Resampling.LANCZOS)
    hero_img.paste(hero_logo, ((1920 - 450) // 2, 220), hero_logo)
    hero_img.save(os.path.join(store_assets_dir, "HeroArt-1920x1080.png"), "PNG")

    print("Store assets generated successfully!")
    print(f"AppX package icons in: {appx_dir}")
    print(f"Store listing marketing assets in: {store_assets_dir}")

if __name__ == "__main__":
    create_store_assets()
