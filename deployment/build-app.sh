#!/usr/bin/env sh
set -eu

APP_VERSION="${APP_VERSION:-0.1.0}"
GIT_HASH="${GIT_HASH:-$(git rev-parse --short HEAD 2>/dev/null || printf dev)}"
IMAGE_TAG="${IMAGE_TAG:-code-base-nextjs:latest}"

echo "==> Building Next.js application image with tag: ${IMAGE_TAG}..."
docker build \
  --build-arg APP_VERSION="$APP_VERSION" \
  --build-arg GIT_HASH="$GIT_HASH" \
  -f deployment/Dockerfile \
  -t "$IMAGE_TAG" \
  .
