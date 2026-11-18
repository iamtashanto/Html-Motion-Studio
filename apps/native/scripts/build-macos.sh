#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="HTML Motion Studio.app"
DIST_DIR="$ROOT_DIR/dist/macos"
APP_BUNDLE="$DIST_DIR/$APP_NAME"
ICON_SRC="$ROOT_DIR/../desktop/build/icon.icns"

echo "==> 1/3 Building shared Rust core static library (libhms_ffi.a)..."
cd "$ROOT_DIR"
cargo build --release -p hms-ffi

echo "==> 2/3 Building native macOS SwiftUI app (HTMLMotionStudioMac)..."
cd "$ROOT_DIR/macos"
swift build -c release

BIN_PATH="$ROOT_DIR/macos/.build/release/HTMLMotionStudioMac"
if [ ! -f "$BIN_PATH" ]; then
  BIN_PATH="$(find "$ROOT_DIR/macos/.build" -type f -name HTMLMotionStudioMac -perm +111 | grep -i release | head -n 1)"
fi

echo "==> 3/3 Packaging native macOS .app bundle at $APP_BUNDLE..."
rm -rf "$APP_BUNDLE"
mkdir -p "$APP_BUNDLE/Contents/MacOS" "$APP_BUNDLE/Contents/Resources"
cp "$BIN_PATH" "$APP_BUNDLE/Contents/MacOS/HTMLMotionStudioMac"
if [ -f "$ICON_SRC" ]; then
  cp "$ICON_SRC" "$APP_BUNDLE/Contents/Resources/AppIcon.icns"
fi

cat > "$APP_BUNDLE/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleDisplayName</key>
  <string>HTML Motion Studio</string>
  <key>CFBundleExecutable</key>
  <string>HTMLMotionStudioMac</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>CFBundleIdentifier</key>
  <string>com.htmlmotionstudio.native.macos</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>HTML Motion Studio</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>2.0.0</string>
  <key>CFBundleVersion</key>
  <string>200</string>
  <key>LSMinimumSystemVersion</key>
  <string>14.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
EOF

echo "✓ Built native macOS bundle: $APP_BUNDLE"
