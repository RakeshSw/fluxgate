#!/usr/bin/env bash
set -Eeuo pipefail
profile=/home/labuser/profile
browser=/opt/browser/chrome-linux64/chrome
extension=/opt/fluxgate/extension
mkdir -p "$profile" /tmp/.X11-unix
chown -R labuser:labuser "$profile"
chmod 1777 /tmp/.X11-unix
# Clean only this dedicated browser profile's stale singleton files.
rm -f "$profile"/SingletonLock "$profile"/SingletonSocket "$profile"/SingletonCookie
Xvfb :99 -screen 0 1440x900x24 -nolisten tcp >/tmp/xvfb.log 2>&1 &
fluxbox >/tmp/fluxbox.log 2>&1 &
# Ephemeral password is generated each startup. Read it from docker compose logs.
password="${FLUXGATE_VNC_PASSWORD:-$(od -An -N4 -tx1 /dev/urandom | tr -d '[:space:]')}"
# VNC protocol uses only first 8 chars. This is additional protection, NOT internet-grade auth.
install -d -m 700 -o labuser -g labuser /home/labuser/.vnc
x11vnc -storepasswd "$password" /home/labuser/.vnc/passwd >/dev/null 2>&1
chown labuser:labuser /home/labuser/.vnc/passwd
chmod 600 /home/labuser/.vnc/passwd
printf '\nFluxGate VNC password (first 8 chars): %.8s\n\n' "$password"
x11vnc -display :99 -rfbauth /home/labuser/.vnc/passwd -rfbport 5900 -localhost -forever -shared -quiet >/tmp/vnc.log 2>&1 &
websockify --web=/usr/share/novnc 6080 127.0.0.1:5900 >/tmp/novnc.log 2>&1 &
args=(--user-data-dir="$profile" --no-first-run --no-default-browser-check --disable-dev-shm-usage --disable-gpu --disable-extensions-except="$extension" --load-extension="$extension")
if [[ "${FLUXGATE_DISABLE_CHROME_SANDBOX:-true}" == true ]]; then
  echo 'NOTE: Chrome sandbox disabled inside this isolated test container; do not browse untrusted websites.'
  args+=(--no-sandbox)
fi
url="${START_URL:-http://demo:8080}"
echo "FluxGate opening: $url"
exec gosu labuser dbus-run-session -- "$browser" "${args[@]}" "$url"
