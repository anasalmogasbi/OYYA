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

# Deploy only web-safe public files. Never expose .git, runtime config, or secrets.
rsync -a --delete \
  --exclude='uploads/' \
  --exclude='media/' \
  "$PUBLIC_SOURCE/" "$LIVE_ROOT/"

echo "OYYA DEPLOY: PASS"
echo "Source: $PUBLIC_SOURCE"
echo "Live:   $LIVE_ROOT"
