#!/usr/bin/env sh
set -eu

BASE_IMAGE="${BASE_IMAGE:-code-base-nextjs-base:latest}"

echo "==> Building dependency base image with tag: ${BASE_IMAGE}..."
docker build \
  -f deployment/Dockerfile.base \
  -t "$BASE_IMAGE" \
  .
