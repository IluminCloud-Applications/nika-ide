#!/usr/bin/env bash
# Installs the Nika IDE icon + .desktop entry into the user's local share so
# that Linux docks/taskbars (X11 and Wayland/COSMIC/GNOME) show the logo.
#
# On Wayland the BrowserWindow({ icon }) option is ignored by the compositor:
# the dock matches the window's app_id (WM_CLASS) against an installed .desktop
# file and pulls the icon from the icon theme. The Electron main process sets
# the app_id to "nika-ide" (see src/main/index.ts), so StartupWMClass must match.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ICON_SRC="$PROJECT_DIR/build/icon.png"
APP_ID="nika-ide"

ICON_BASE="$HOME/.local/share/icons/hicolor"
APPS_DIR="$HOME/.local/share/applications"

mkdir -p "$APPS_DIR"

# Install the icon at the standard theme sizes.
for size in 512 256 128 64 48 32; do
  dest="$ICON_BASE/${size}x${size}/apps"
  mkdir -p "$dest"
  convert "$ICON_SRC" -resize "${size}x${size}" "$dest/$APP_ID.png"
done

# Desktop entry. Exec launches dev mode; StartupWMClass must equal the app_id.
cat > "$APPS_DIR/$APP_ID.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Nika IDE
Comment=Premium Dark Electron Low-Code IDE
Exec=sh -c 'cd "$PROJECT_DIR" && npm run dev'
Icon=$APP_ID
Terminal=false
Categories=Development;IDE;
StartupWMClass=$APP_ID
EOF

# Refresh caches (best-effort).
gtk-update-icon-cache -f "$ICON_BASE" >/dev/null 2>&1 || true
update-desktop-database "$APPS_DIR" >/dev/null 2>&1 || true

echo "Installed Nika IDE icon and desktop entry (app_id=$APP_ID)."
