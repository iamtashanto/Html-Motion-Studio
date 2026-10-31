#!/usr/bin/env python3
import os
import subprocess
import shutil
from PIL import Image

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    svg_path = os.path.join(script_dir, "icon.svg")
    master_png = os.path.join(script_dir, "icon.png")
    iconset_dir = os.path.join(script_dir, "icon.iconset")
    icns_path = os.path.join(script_dir, "icon.icns")
    ico_path = os.path.join(script_dir, "icon.ico")

    print("Step 1: Rendering 1024x1024 master icon.png with macOS sips...")
    subprocess.run(["sips", "-s", "format", "png", svg_path, "--out", master_png], check=True)
    subprocess.run(["sips", "-z", "1024", "1024", master_png], check=True)

    print("Step 2: Generating icon.iconset folder...")
    if os.path.exists(iconset_dir):
        shutil.rmtree(iconset_dir)
    os.makedirs(iconset_dir, exist_ok=True)

    sizes = [
        ("icon_16x16.png", 16),
        ("icon_16x16@2x.png", 32),
        ("icon_32x32.png", 32),
        ("icon_32x32@2x.png", 64),
        ("icon_128x128.png", 128),
        ("icon_128x128@2x.png", 256),
        ("icon_256x256.png", 256),
        ("icon_256x256@2x.png", 512),
        ("icon_512x512.png", 512),
        ("icon_512x512@2x.png", 1024),
    ]

    master_img = Image.open(master_png).convert("RGBA")

    for name, sz in sizes:
        dest = os.path.join(iconset_dir, name)
        resized = master_img.resize((sz, sz), Image.Resampling.LANCZOS)
        resized.save(dest, "PNG")

    print("Step 3: Compiling icon.icns via macOS iconutil...")
    subprocess.run(["iconutil", "-c", "icns", iconset_dir, "-o", icns_path], check=True)

    print("Step 4: Compiling Windows icon.ico...")
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    master_img.save(ico_path, format="ICO", sizes=ico_sizes)

    # Clean up iconset folder
    shutil.rmtree(iconset_dir)

    print("Done! Generated:")
    print(f" - {master_png} (1024x1024)")
    print(f" - {icns_path} (Native Apple ICNS with Retina support)")
    print(f" - {ico_path} (Windows ICO with multi-resolution assets)")

if __name__ == "__main__":
    main()

