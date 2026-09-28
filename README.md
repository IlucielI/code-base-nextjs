# NextBase - Enterprise Next.js Boilerplate

A production-ready, highly modular **Next.js 16 (App Router)** and **React 19** foundation boilerplate designed for scalable enterprise applications. Built with a strict separation of concerns combining **Clean Architecture** on the server layer and **Atomic Design** on the frontend UI.

> 📖 **Architecture & System Design**: For C4 diagrams (Context, Container, Component), zero direct client API perimeter, Tailwind v4 design tokens, and step-by-step feature guides, read the [System Design Document](docs/SYSTEM_DESIGN.md).

---

## 🌟 Architecture Overview

```
src/
├── app/                  # Next.js App Router (Layouts, Actions, Route Handlers)
│   ├── api/health/       # Telemetry API endpoint (/api/health)
│   ├── health/           # Direct telemetry endpoint (/health)
│   ├── actions.ts        # Server Actions (zero direct client-to-API calls)
│   ├── globals.css       # Tailwind CSS v4 styles & design tokens
│   └── layout.tsx        # HTML root layout with Inter font
│
├── components/           # Atomic Design System (Domain-Agnostic)
│   ├── atoms/            # 42 modular atom primitives in kebab-case folders
│   ├── molecules/        # 8 compound components (stat-card, status-pill, callout, etc.)
│   ├── organisms/        # Complex layouts (navbar, sidebar, topbar)
│   └── templates/        # Page skeletons (app-layout, dashboard-layout)
│
├── lib/                  # Shared utilities
│   ├── api-client.ts     # Client-side typed fetcher for BFF / API endpoints
│   └── utils.ts          # Class merging helper (cn) using clsx and tailwind-merge
│
├── stores/               # Client Global State Management (Zustand v5)
│   ├── ui.store.ts       # Global UI state (sidebar, modals, devtools)
│   ├── use-hydrated-store.ts # SSR-safe hydration hook for Next.js App Router
│   └── index.ts          # Central barrel export
│
└── server/               # Clean Architecture Server Core
    ├── constants/        # System & domain constants (HealthStatus, ResponseStatus, etc.)
    ├── context/          # Request context & Correlation ID (x-request-id)
    ├── controllers/      # HTTP request/response handlers and status serialization
    ├── errors/           # AppError domain hierarchy & anti-leak error handler
    ├── middlewares/      # Modular edge/server middlewares (CORS, security, client-meta)
    ├── services/         # Business logic, use cases, and duration formatting
    ├── repositories/     # Data access layer (Interfaces, System, and Mocks)
    ├── dtos/             # Data Transfer Objects & strong type definitions
    ├── logger/           # Structured JSON Logger (ILogger interface & Pino auto-redact)
    └── di/               # Centralized Dependency Injection (DI) Registry
```

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16.3.4](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19.2.8](https://react.dev/)
- **State Management**: [Zustand v5](https://github.com/pmndrs/zustand) lightweight client global state with SSR hydration safety
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/postcss`
- **Observability**: [Pino](https://getpino.io/) high-performance structured JSON logger
- **Testing**: [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/) + JSDOM + V8 Coverage
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) with strict mode & `@/*` path aliases
- **Containerization**: Multi-stage standalone Dockerfile with non-root security user

---

## 🧩 Atomic Design System Components

### 1. Atoms (`src/components/atoms/`)
Each atom is housed in its own dedicated kebab-case folder with an `index.ts` re-export:
- **Form Controls & Inputs**: `button`, `checkbox`, `input`, `input-otp`, `label`, `radio-group`, `select`, `slider`, `switch`, `textarea`, `toggle`, `toggle-group`.
- **Navigation & Indicators**: `breadcrumb`, `menubar`, `navigation-menu`, `pagination`, `progress`, `status-dot`, `tabs`.
- **Overlays, Popovers & Modals**: `alert-dialog`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `hover-card`, `popover`, `sheet`, `sonner` (toast), `tooltip`.
- **Data Display & Layout**: `accordion`, `alert`, `aspect-ratio`, `avatar`, `badge`, `calendar`, `card`, `collapsible`, `command`, `scroll-area`, `separator`, `skeleton`, `table`.

### 2. Molecules (`src/components/molecules/`)
| Component | Description |
|-----------|-------------|
| `Breadcrumb` | Hierarchy navigation trail with customizable root and current page |
| `Callout` | Informational banners (`info`, `warning`, `success`, `danger`) |
| `EmptyState` | Empty state placeholder with graphic icon, title, description, and action button |
| `SearchInput` | Search input with icon and focus ring |
| `StatCard` | KPI / metric card with trend indicators (up/down/neutral) and icon styling |
| `StatusPill` | Pill badge displaying system health status (`online`, `busy`, `offline`, `warning`) |
| `StepTracker` | Multi-step wizard indicator for multi-page workflows |
| `UserChip` | User profile avatar chip with initials, name, and role description |

### 3. Organisms (`src/components/organisms/`)
| Component | Description |
|-----------|-------------|
| `Navbar` | Responsive top navigation bar with brand logo, links, status pill, and mobile toggle |
| `Sidebar` | Dashboard / CMS sidebar navigation with active route detection and user profile card |
| `Topbar` | Dashboard header with breadcrumb navigation and action controls |

### 4. Templates (`src/components/templates/`)
| Template | Description |
|----------|-------------|
| `AppLayout` | Customer / Web App layout with `Navbar`, dynamic content area, and footer |
| `DashboardLayout` | Admin / Backoffice layout with `Sidebar`, `Topbar`, and scrollable viewport |

---

## 📦 Client State Management (Zustand)

Global client-side interactive state is managed via **Zustand v5** under `src/stores/`:

- **Typed Contracts**: Explicit separation between `State` and `Actions` interfaces (e.g. `UiState`, `UiActions`).
- **DevTools Integration**: Enabled by default with action logging in browser Redux DevTools.
- **SSR-Safe Hydration**: `useHydratedStore` helper utilizes React 19 `useSyncExternalStore` to prevent hydration mismatches without cascading renders when working with persisted stores.

```tsx
'use client';

import { useUiStore } from '@/stores';

export function SidebarToggle() {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <button onClick={toggleSidebar}>
      {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
    </button>
  );
}
```

### Global Client Providers
- **Zero-Provider Zustand**: Zustand operates outside the React component tree and requires no Context Provider wrappers.
- **Provider Encapsulation**: For client-side React Context (`ThemeProvider`, `TooltipProvider`, `Toaster`), consolidate them in a dedicated `'use client'` provider component while keeping `src/app/layout.tsx` as a pure React Server Component (RSC).

---

## 🏛️ Clean Architecture Server Core

All server-side business logic and data access follow strict SOLID principles:

1. **Contracts First**: Define interfaces in `*.interface.ts` (e.g. `ISystemRepository`, `IHealthService`).
2. **Dependency Injection**: Services and repositories are registered as singletons in `src/server/di/registry.ts`.
3. **Environment-Driven Mocking**: Easily toggle between mock data and real APIs:
   ```env
   MOCK_CORE_API=true
   USE_MOCK_DATA=true
   ```

### Adding a New Feature Module (Step-by-Step)
1. **Define DTOs**: Create your data transfer types in `src/server/dtos/your-feature.dto.ts`.
2. **Define Repository Contract**: Create `src/server/repositories/your-feature.repository.interface.ts`.
3. **Implement Repositories**: Create both `your-feature.mock.repository.ts` and `your-feature.http.repository.ts`.
4. **Implement Service**: Create `src/server/services/your-feature.service.ts` encapsulating business rules.
5. **Register in DI**: Add the singleton factory to `src/server/di/registry.ts`.
6. **Expose via App Router**: Import your service directly into a Server Component or API Route handler.

---

## 🩺 Telemetry & Health Check

The repository includes a ready-to-use system telemetry endpoint designed for container orchestrators and enterprise monitoring systems:

- `GET /health` or `GET /api/health`
- **Sample Output**:
  ```json
  {
    "version": "0.1.0",
    "uptime": "12m45.120s",
    "git_hash": "a1b2c3d",
    "status": "ok",
    "timestamp": "2026-09-28T12:00:00.000Z"
  }
  ```

---

## 🛠️ Scripts & Commands

You can use standard `npm` commands or the convenient root `Makefile`:

```bash
# Run local development server
make dev        # or: npm run dev

# Run unit & component tests
make test       # or: npm test

# Run tests with coverage report
make test-cov   # or: npm run test:coverage

# Lint code with ESLint 9
make lint       # or: npm run lint

# Build standalone production bundle
make build      # or: npm run build

# Start production server
npm start
```

---

## 🐳 Docker Deployment & Two-Stage Build

The deployment setup follows the high-performance **two-stage Docker build strategy**:

```
[ package.json / lock ] ──► Dockerfile.base ──► code-base-nextjs-base:latest
                                                               │
[ App Source Code ] ──────► Dockerfile      ◄─────────────────┘
                                  │
                                  ▼
                     code-base-nextjs:latest
```

### Available Deployment Shell Scripts

| Script | Purpose |
|--------|---------|
| [`deployment/build-base.sh`](./deployment/build-base.sh) | Builds dependency base image (`Dockerfile.base`). Run when packages change. |
| [`deployment/build-app.sh`](./deployment/build-app.sh) | Builds Next.js application image using the pre-built base image. |
| [`deployment/build.sh`](./deployment/build.sh) | Smart build runner: builds base image if missing, then compiles application image. |
| [`deployment/build-multiarch.sh`](./deployment/build-multiarch.sh) | Multi-architecture builder (`linux/amd64`, `linux/arm64`) using `docker buildx`. |

### Quick Start via Make or Scripts
```bash
# Build Docker image (smart build runner)
make docker-build      # or: ./deployment/build.sh

# Run containerized application via Docker Compose
make docker-up         # or: docker compose -f deployment/docker-compose.yaml up -d

# Stop running containers
make docker-down       # or: docker compose -f deployment/docker-compose.yaml down
```

For full details, see the [`deployment/README.md`](./deployment/README.md) guide.

---

## 📄 License

MIT License. Open source and free for commercial or personal use.
