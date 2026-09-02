#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_SOURCE="$SOURCE_DIR/public"
LIVE_ROOT="/home4/novanetl/home4/novanetl/public_html/oyya"

if [[ ! -d "$PUBLIC_SOURCE" ]]; then
  echo "ERROR: missing public directory: $PUBLIC_SOURCE" >&2
  exit 1
fi

# cPanel currently points oyya.nova.net.ly to this real directory.
if [[ -L "$LIVE_ROOT" ]]; then
  rm -f "$LIVE_ROOT"
fi
mkdir -p "$LIVE_ROOT"

# Preserve all runtime state that must survive code deployments.
RUNTIME_TMP="$(mktemp -d)"
trap 'rm -rf "$RUNTIME_TMP"' EXIT
for item in uploads media data; do
  if [[ -e "$LIVE_ROOT/$item" ]]; then
    cp -a "$LIVE_ROOT/$item" "$RUNTIME_TMP/$item"
  fi
done

find "$LIVE_ROOT" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a "$PUBLIC_SOURCE"/. "$LIVE_ROOT"/

for item in uploads media data; do
  if [[ -e "$RUNTIME_TMP/$item" ]]; then
    rm -rf "$LIVE_ROOT/$item"
    cp -a "$RUNTIME_TMP/$item" "$LIVE_ROOT/$item"
  fi
done

mkdir -p "$LIVE_ROOT/data" "$LIVE_ROOT/uploads" "$LIVE_ROOT/media"
chmod 755 "$LIVE_ROOT"
find "$LIVE_ROOT" -type d -exec chmod 755 {} +
find "$LIVE_ROOT" -type f -exec chmod 644 {} +
chmod 775 "$LIVE_ROOT/data" "$LIVE_ROOT/uploads" "$LIVE_ROOT/media"

rm -f "$LIVE_ROOT/oyya-test.txt"

echo "OYYA DEPLOY: PASS"
echo "Source: $PUBLIC_SOURCE"
echo "Live:   $LIVE_ROOT"
echo "Runtime data preserved: data uploads media"
