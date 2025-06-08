#!/usr/bin/env bash

set -e

LOCKFILE="/tmp/install.lock"

if [ -e "$LOCKFILE" ]; then
    echo "Install already in progress."
    exit 1
fi

trap 'rm -f "$LOCKFILE"' EXIT
touch "$LOCKFILE"

INVOKER="$(basename "$0")"
case "$INVOKER" in
bun | npm | pnpm | yarn)
    MANAGER="$INVOKER"
    ;;
*)
    if command -v bun &>/dev/null; then
        MANAGER="bun"
    else
        MANAGER="npm"
    fi
    ;;
esac

cd packages/sdk && "$MANAGER" install --ignore-scripts
cd ../.. && "$MANAGER" install --ignore-scripts

if [ "$MANAGER" = "bun" ]; then
    bun x turbo build --filter=@saitamafun/sdk
else
    npx turbo build --filter=@saitamafun/sdk
fi
