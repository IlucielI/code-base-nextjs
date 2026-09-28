# Deployment Guide (`code-base-nextjs`)

This directory contains containerization files, build automation scripts, and Docker Compose configurations optimized for rapid local development and production deployments.

---

## Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Two-Stage Docker Build Strategy](#two-stage-docker-build-strategy)
- [Infrastructure & Ports](#infrastructure--ports)
- [Quick Start](#quick-start)
- [Build Scripts Reference](#build-scripts-reference)
- [Multi-Architecture Builds (`build-multiarch.sh`)](#multi-architecture-builds-build-multiarchsh)

---

## Overview & Architecture

The container workflow is optimized using a **two-step Docker build strategy** that decouples heavy `node_modules` dependency installation from rapid Next.js application source code compilation:

```
[ package.json / lock ] ──► Dockerfile.base ──► code-base-nextjs-base:latest
                                                               │
[ App Source Code ] ──────► Dockerfile      ◄─────────────────┘
                                  │
                                  ▼
                     code-base-nextjs:latest
```

---

## Two-Stage Docker Build Strategy

1. **Base Image (`Dockerfile.base`)**:
   - Copies `package.json` and `package-lock.json`.
   - Runs `npm ci --legacy-peer-deps` to populate `node_modules`.
   - Generates image: `code-base-nextjs-base:latest`.
   - **Only rebuilds** when dependencies in `package.json` or `package-lock.json` change.
2. **Application Image (`Dockerfile`)**:
   - Uses the cached local base image (`code-base-nextjs-base:latest`).
   - Copies application source files (`src/`, `public/`, configs).
   - Injects build arguments (`APP_VERSION`, `GIT_HASH`).
   - Runs `npm run build` using Next.js Turbopack compiler.
   - Outputs an ultra-lightweight standalone Alpine runner with a non-root `app` user (`node server.js`).

---

## Infrastructure & Ports

When spinning up `docker compose -f deployment/docker-compose.yaml up -d`, the following service is orchestrated:

| Service | Container Name | Port | Description | Healthcheck |
|---------|----------------|------|-------------|-------------|
| **web** | `code-base-nextjs` | `3000` | Next.js Standalone Production Server | `wget -qO- http://127.0.0.1:3000/api/health` |

---

## Quick Start

### 1. Build and Run via Unified Script
Automatically builds the base image if missing, builds the application image, and launches the container:
```bash
./deployment/build.sh
docker compose -f deployment/docker-compose.yaml up -d
```

### 2. Run Step-by-Step
If you prefer explicit control:
```bash
# Step 1: Build dependency base image
./deployment/build-base.sh

# Step 2: Build Next.js application image
./deployment/build-app.sh

# Step 3: Start container in background
docker compose -f deployment/docker-compose.yaml up -d
```

### 3. Custom Versioning
You can pass custom version metadata:
```bash
APP_VERSION=1.0.0 ./deployment/build-app.sh
```
*Note: `GIT_HASH` is automatically extracted from `git rev-parse --short HEAD` (or defaults to `dev`).*

---

## Build Scripts Reference

| Script | Purpose |
|--------|---------|
| `build-base.sh` | Builds the npm dependencies base image (`Dockerfile.base`). Run when dependencies update. |
| `build-app.sh` | Compiles source code against base image and outputs standalone runtime Docker image (`Dockerfile`). |
| `build.sh` | Smart build runner: automatically builds base image if not found, then compiles app image. |
| `build-multiarch.sh` | Multi-architecture builder (`linux/amd64`, `linux/arm64`) using `docker buildx`. |

---

## Multi-Architecture Builds (`build-multiarch.sh`)

To build images compatible with both AMD64 and ARM64 (Apple Silicon, AWS Graviton) environments:

```bash
# Build locally using docker buildx
./deployment/build-multiarch.sh

# Build and push directly to a registry
ACTION="--push" IMAGE_TAG="your-registry/code-base-nextjs:latest" ./deployment/build-multiarch.sh
```
