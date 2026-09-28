# AGENTS.md — AI Developer Guide for `code-base-nextjs`

This document defines the architectural invariants, conventions, and workflows for AI coding assistants working in this repository.

---

## 1. Tech Stack & Project Identity

- **Framework**: Next.js 16.3.4 (App Router, Turbopack, standalone output mode)
- **UI Library**: React 19.2.8
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` + Centralized Design Tokens (`globals.css`)
- **UI System**: Atomic Design System with 42 modular shadcn/ui atom primitives + molecules + organisms + templates
- **Server Architecture**: Clean Architecture (Controllers, Services, Repositories, DI, DTOs)
- **Observability**: Pino structured JSON logger with auto-redaction & Request Correlation (`x-request-id`)
- **State Management**: Zustand v5 (Client Global State, located under `src/stores/`)
- **Testing**: Vitest + React Testing Library + JSDOM + V8 Coverage
- **Language**: TypeScript 5 (Strict mode enabled, zero `any` policy)
- **Containerization**: Multi-stage standalone Dockerfile with non-root security user (`app:app`)

---

## 2. Architectural Invariants (Non-Negotiable Rules)

### 2.1. Backend-For-Frontend (BFF) Perimeter
- **Zero Direct Client-to-API Calls**: The client browser **MUST NEVER** communicate directly with external core APIs, databases, or third-party secret endpoints.
- All outbound traffic must be mediated by Next.js Server Actions (`src/app/actions.ts`) or Route Handlers (`src/app/**/route.ts`).
- Private secrets and backend URLs remain strictly encapsulated on the Node.js server.

### 2.2. Routing & App Router Conventions
- **Server-First by Default**: Pages in `src/app/` are React Server Components (RSC) unless client-side state/interactivity strictly requires `'use client'`.
- **Route Handlers**: API endpoints live under `src/app/api/**/route.ts` and delegate HTTP processing directly to controllers (`src/server/controllers/`).
- **Telemetry Endpoints**: System health and telemetry are exposed via `/health` and `/api/health`.

### 2.3. Server-Side Clean Architecture
- Server logic is strictly layered in `src/server/`:
  $$\text{Gatekeeper (src/middleware.ts)} \rightarrow \text{Route / Action} \rightarrow \text{Controller} \rightarrow \text{Service} \rightarrow \text{Repository} \rightarrow \text{DataSource}$$
- **Contracts First**: Services and Repositories **MUST** define and implement explicit TypeScript interfaces (e.g. `ISystemRepository`, `IHealthService`).
- **Decentralized Dependency Injection**: Controllers, Services, and Repositories are colocated with their default singleton instances in their respective feature files. Route handlers import controllers directly from `@/server/controllers`. Never instantiate dependencies ad-hoc inside route handler functions.
- **Standardized Response Envelopes**:
  - Use standard response envelopes defined in `src/server/dtos/response.dto.ts` (`ApiResponse<T>`, `PaginatedResponse<T>`, `BaseResponse`).
  - Use centralized constants from `src/server/constants/` (`ResponseStatus`, `ResponseCode`, `HealthStatus`).
- **Runtime Schema Validation & Anti-Corruption**:
  - Define feature-based runtime validation schemas in `src/server/schemas/`:
    - `common.schema.ts`: Shared cross-cutting pagination and standard response envelopes (`ApiResponse`, `PaginatedResponse`).
    - `<feature>.schema.ts`: Colocates all schemas for a specific domain feature (client request validation, outbound Core API payloads, Anti-Corruption mappers, and response contracts).
  - Validate boundaries and transform raw external API DTOs into clean internal domain models using `schema.parse()` or `validateSchema(schema, data)`.
- **Centralized DataSources (HTTP, DB, Cache)**:
  - Use `IHttpClient` (`src/server/datasources/http/`) inside repositories for external API communication.
  - Guarantees automated timeout protection, correlation ID propagation (`x-request-id`), status code mapping, and optional Zod schema validation.
- **Controller Base Inheritance**:
  - HTTP controllers must extend `BaseController` (`src/server/controllers/base.controller.ts`) to automate `x-request-id` extraction, caching headers, and anti-leak error handling.
  - Use `this.handle(req, action, handler)` to eliminate try/catch boilerplate.
  - Use `this.getBody(req, schema)` and `this.getQuery(req, schema)` for type-safe Zod request validation.
- **Server Action Safety**:
  - Wrap Server Actions with `createSafeAction(options?, handler)` (`src/server/actions/`) for safe exception masking and Zod validation.
- **Centralized Runtime Environment Configuration**:
  - Consume typed and validated environment variables from `src/server/config/env.ts` (`env`). Never use raw `process.env` in business logic.
- **Generic CRUD Repository Contract**:
  - Implement `IBaseRepository<T, ID, TQuery>` (`src/server/repositories/base.repository.interface.ts`) for standard CRUD operations.
- **Client-Side BFF Fetcher**:
  - Use `apiFetch<T>` and `apiFetchData<T>` (`src/lib/api-client.ts`) in Client Components to interact with internal API routes.

### 2.4. Edge Middleware Modularization
- Next.js requires the entry point file to be placed at `src/middleware.ts`.
- However, all concrete middleware logic **MUST** live modularly inside `src/server/middlewares/`:
  - `client-meta.middleware.ts`: Extracts `x-request-id` and `x-client-ip`.
  - `cors.middleware.ts`: Handles preflight `OPTIONS` requests (204 No Content).
  - `security.middleware.ts`: Injects enterprise security headers (`nosniff`, `DENY`, etc.).
  - `index.ts`: Orchestrates `runMiddlewares(request)`.
- `src/middleware.ts` must remain a lightweight dispatcher (~10 lines).

### 2.5. Observability & Information Leak Prevention
- **Structured Logging**: Use `PinoLogger` (`src/server/logger/`). Do not use raw `console.log`.
- **Sensitive Data Redaction**: Pino is configured to auto-redact fields matching `password`, `token`, `secret`, `authorization`, `cookie`, `apiKey`.
- **Anti-Leak Error Handling**:
  - Use `AppError` and its subclasses (`BadRequestError`, `UnauthorizedError`, `NotFoundError`, etc.) in `src/server/errors/app.error.ts`.
  - Wrap API execution in `handleApiError(error, options)` (`src/server/errors/error-handler.ts`).
  - Unexpected internal crashes (e.g. database connection errors, stack traces) **MUST NEVER** leak to the client in production. They must be masked as generic `INTERNAL_SERVER_ERROR` with a correlated `requestId`.

### 2.6. Atomic Design System Hierarchy
- Frontend components live in `src/components/` structured into 4 tiers:
  - `atoms/`: Fundamental primitives (`button`, `card`, `dialog`, `input`, etc.).
  - `molecules/`: Simple compound components (`stat-card`, `status-pill`, `callout`, etc.).
  - `organisms/`: Complex layouts (`navbar`, `sidebar`, `topbar`).
  - `templates/`: Page skeletons (`app-layout`, `dashboard-layout`).
- **Folder Convention**: Every component must have its own dedicated folder in `kebab-case` with the component file and an `index.ts` re-export.
- **Class Merging Utility**: Always import `cn` from `@/lib/utils` (`import { cn } from "@/lib/utils"`). Never install or import from an external `cn` package.

### 2.7. Client State Management (Zustand)
- Client stores live in `src/stores/` (e.g. `src/stores/ui.store.ts`).
- Explicitly split store contracts into `State` and `Actions` interfaces (e.g. `UiState`, `UiActions`).
- Use `devtools` middleware with descriptive action names for debuggability.
- All stores and helper utilities must be exported through the barrel file `src/stores/index.ts`.
- For stores with persisted state (`localStorage`) or SSR hydration risks, use `useHydratedStore` helper (`src/stores/use-hydrated-store.ts`) to avoid hydration mismatches.
- Zustand stores are external stores and **DO NOT** require a wrapping React Context Provider in `layout.tsx`.

### 2.8. Global Client Providers Architecture
- **Root Layout Server-First Rule**: `src/app/layout.tsx` **MUST** remain a React Server Component (RSC). Never add `'use client'` to `layout.tsx`.
- **Consolidated Providers**: When introducing client context providers (`ThemeProvider` from `next-themes`, `TooltipProvider` from Radix UI, `<Toaster />` from Sonner), wrap them inside a dedicated client component (e.g. `src/components/providers/` or similar) with `'use client'`, and mount that wrapper inside `src/app/layout.tsx`.
- **Hydration Warning Suppression**: When using `ThemeProvider` (dynamic theme attributes on `<html>`), ensure `<html lang="en" suppressHydrationWarning>` is declared on the root HTML tag.

---

## 3. Development Workflows for Agents

### 3.1. Adding a New Server Domain Feature
1. **Constants**: Define domain codes and statuses in `src/server/constants/`.
2. **DTOs & Schemas**: Define typed DTOs in `src/server/dtos/` and Zod validation schemas in `src/server/schemas/`.
3. **Repository**:
   - Define interface in `src/server/repositories/<name>.repository.interface.ts`.
   - Implement repository in `src/server/repositories/<name>.repository.ts` (use `IHttpClient` from `src/server/datasources/http/` for upstream API calls).
4. **Service**:
   - Define interface in `src/server/services/<name>.service.interface.ts`.
   - Implement business logic in `src/server/services/<name>.service.ts`.
5. **Controller**: Implement HTTP controller in `src/server/controllers/<name>.controller.ts` extending `BaseController`.
6. **DI Registration**: Register the new singletons in `src/server/di/registry.ts`.
7. **Route Handler / Server Action**:
   - For APIs: add `src/app/api/<name>/route.ts`.
   - For SSR actions: add method in `src/app/actions.ts`.
8. **Unit Tests**: Add tests alongside code (e.g. `<name>.service.test.ts`, `<name>.controller.test.ts`).

### 3.2. Adding a New Atomic UI Component
1. Choose the appropriate tier (`atoms/`, `molecules/`, `organisms/`, `templates/`).
2. Create folder: `src/components/<tier>/<component-name>/`.
3. Create implementation: `<component-name>.tsx` using Tailwind v4 tokens and `cn(...)`.
4. Create barrel file: `index.ts` exporting the component and its props type.
5. Export from tier barrel: `src/components/<tier>/index.ts`.
6. Add unit test: `<component-name>.test.tsx` using `@testing-library/react`.

### 3.3. Adding a New Zustand Store
1. Create store file: `src/stores/<name>.store.ts`.
2. Define typed state interface `<Name>State` and action interface `<Name>Actions`.
3. Implement `create<NameStore>()(devtools(...))` with proper action naming.
4. Export from barrel file: `src/stores/index.ts`.
5. Add unit test: `src/stores/<name>.store.test.ts`.

---

## 4. Development & Testing Commands

Always run the full test suite and quality checks before concluding any task:

```bash
# 1. Run all unit tests
npm test

# 2. Check strict TypeScript compilation
npx tsc --noEmit

# 3. Check code style and linting
npm run lint

# 4. Rebuild standalone application inside Docker
./deployment/build-app.sh
docker compose -f deployment/docker-compose.yaml up -d

# 5. Verify local healthcheck
curl -i http://localhost:3000/api/health
```

---

## 5. Git Hygiene & Commit Conventions
- Follow standard Conventional Commits formatting (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- Maintain minimal, focused, and cohesive commits.
- Keep the working directory completely clean (`working tree clean`) before concluding any task.
