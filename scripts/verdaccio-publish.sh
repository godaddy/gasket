#!/usr/bin/env bash
set -euo pipefail

REGISTRY="http://localhost:4873"
CONFIG="verdaccio/config.yaml"
SNAPSHOT_TAG="${1:-local}"

VERDACCIO_NPMRC="$(pwd)/.verdaccio/.npmrc"

check_verdaccio() {
  curl -sf "$REGISTRY/-/ping" > /dev/null 2>&1
}

start_verdaccio() {
  # Always kill any existing instance and wipe storage for a clean publish
  lsof -ti:4873 | xargs kill -9 2>/dev/null || true
  rm -rf .verdaccio/storage
  sleep 1

  echo "Starting Verdaccio (fresh)..."
  pnpm exec verdaccio --config "$CONFIG" --listen 4873 > /tmp/verdaccio-gasket.log 2>&1 &

  for i in {1..30}; do
    if check_verdaccio; then
      echo "Verdaccio started"
      return 0
    fi
    sleep 1
  done

  echo "ERROR: Verdaccio failed to start within 30s"
  cat /tmp/verdaccio-gasket.log
  exit 1
}

is_pre_mode() {
  [ -f ".changeset/pre.json" ] && node -e "
    const f = JSON.parse(require('fs').readFileSync('.changeset/pre.json','utf8'));
    process.exit(f.mode === 'pre' ? 0 : 1);
  " 2>/dev/null
}

cleanup_versions() {
  echo "Restoring package.json files..."
  git checkout -- 'packages/*/package.json' package.json 2>/dev/null || true
  rm -f .changeset/*-snap-*.md 2>/dev/null || true
}

setup_auth() {
  mkdir -p "$(dirname "$VERDACCIO_NPMRC")"
  echo "//localhost:4873/:_authToken=local-dev-token" > "$VERDACCIO_NPMRC"
  export npm_config_userconfig="$VERDACCIO_NPMRC"
}

start_verdaccio
setup_auth

echo ""
echo "Building packages..."
pnpm run build

if is_pre_mode; then
  echo ""
  echo "Pre-release mode detected -- publishing current versions directly (skipping snapshot versioning)"
  echo "Publishing to $REGISTRY..."
  npm_config_registry="$REGISTRY" pnpm -r publish --tag "$SNAPSHOT_TAG" --no-git-checks --force 2>&1
else
  trap cleanup_versions EXIT

  echo ""
  echo "Versioning with snapshot tag: $SNAPSHOT_TAG"
  pnpm changeset version --snapshot "$SNAPSHOT_TAG"

  echo ""
  echo "Publishing to $REGISTRY..."
  npm_config_registry="$REGISTRY" pnpm changeset publish --tag "$SNAPSHOT_TAG" --no-git-tag
fi

echo ""
echo "============================================"
echo "Published to local Verdaccio ($REGISTRY)"
echo ""
echo "Install in your test app:"
echo "  npm install @gasket/core@$SNAPSHOT_TAG --registry $REGISTRY"
echo ""
echo "Or set registry globally for the shell session:"
echo "  export npm_config_registry=$REGISTRY"
echo "  npm install @gasket/core@$SNAPSHOT_TAG"
echo "============================================"
