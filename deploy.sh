#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_SOURCE="$SOURCE_DIR/public"
LIVE_ROOT="/home4/novanetl/home4/novanetl/public_html/oyya"

if [[ ! -d "$PUBLIC_SOURCE" ]]; then
  echo "ERROR: missing public directory: $PUBLIC_SOURCE" >&2
  exit 1
fi

# cPanel currently points oyya.nova.net.ly to LIVE_ROOT above.
# Use the real directory instead of a symlink because some shared-hosting
# security layers deny PHP execution through symlinked document roots (403).
if [[ -L "$LIVE_ROOT" ]]; then
  rm -f "$LIVE_ROOT"
fi
mkdir -p "$LIVE_ROOT"

find "$LIVE_ROOT" -mindepth 1 -maxdepth 1 \
  ! -name 'uploads' \
  ! -name 'media' \
  -exec rm -rf -- {} +

cp -a "$PUBLIC_SOURCE"/. "$LIVE_ROOT"/
chmod 755 "$LIVE_ROOT"
find "$LIVE_ROOT" -type d -exec chmod 755 {} +
find "$LIVE_ROOT" -type f -exec chmod 644 {} +

rm -f "$LIVE_ROOT/oyya-test.txt"

echo "OYYA DEPLOY: PASS"
echo "Source: $PUBLIC_SOURCE"
echo "Live:   $LIVE_ROOT"
