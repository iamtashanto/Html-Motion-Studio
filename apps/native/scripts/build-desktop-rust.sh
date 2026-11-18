#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist/desktop-rust"

echo "==> Building native Rust UI (Slint) + hms-core for Windows / Linux..."
cd "$ROOT_DIR"
cargo build --release -p hms-desktop-rust

mkdir -p "$DIST_DIR"
if [ -f "$ROOT_DIR/target/release/hms-desktop-rust.exe" ]; then
  cp "$ROOT_DIR/target/release/hms-desktop-rust.exe" "$DIST_DIR/"
  echo "✓ Built Windows binary: $DIST_DIR/hms-desktop-rust.exe"
else
  cp "$ROOT_DIR/target/release/hms-desktop-rust" "$DIST_DIR/"
  echo "✓ Built native binary: $DIST_DIR/hms-desktop-rust"
fi
