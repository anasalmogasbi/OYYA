#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_SOURCE="$SOURCE_DIR/public"
LIVE_ROOT="/home4/novanetl/public_html/oyya"

if [[ ! -d "$PUBLIC_SOURCE" ]]; then
  echo "ERROR: missing public directory: $PUBLIC_SOURCE" >&2
  exit 1
fi

mkdir -p "$LIVE_ROOT"

# Shared hosting fallback: deploy public files without rsync.
# Runtime uploads/media are preserved and source secrets/.git are never exposed.
find "$LIVE_ROOT" -mindepth 1 -maxdepth 1 \
  ! -name 'uploads' \
  ! -name 'media' \
  -exec rm -rf -- {} +

cp -a "$PUBLIC_SOURCE"/. "$LIVE_ROOT"/

rm -f "$LIVE_ROOT/oyya-test.txt"

echo "OYYA DEPLOY: PASS"
echo "Source: $PUBLIC_SOURCE"
echo "Live:   $LIVE_ROOT"
