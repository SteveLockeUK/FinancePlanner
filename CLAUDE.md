# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinancePlanner is a full-stack personal finance application with an ASP.NET Core 10 backend and a React + TypeScript frontend. It supports offline-first operation via IndexedDB and real-time sync via SignalR.

## Commands

### Backend (from `API/` directory)

```bash
dotnet build                          # Build all projects
dotnet run --project FinancePlanner.AppHost   # Run via Aspire orchestration (starts both API + React)
dotnet run --project FinancePlanner.API       # Run API only
dotnet ef migrations add <Name> --project FinancePlanner.Data --startup-project FinancePlanner.API
dotnet ef database update --project FinancePlanner.Data --startup-project FinancePlanner.API
```

### Frontend (from `React/` directory)

```bash
npm run dev       # Start Vite dev server on port 5173
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Architecture

### Backend (`API/`)

Five projects in `FinancePlanner.sln`:

- **FinancePlanner.API** — Minimal API host. All endpoints are registered as extension methods on `IEndpointRouteBuilder` (e.g. `MapAuthEndpoints()`, `MapAccountEndpoints()`). Uses cookie-based authentication with ASP.NET Identity. CORS allows the React dev ports (3000, 5173).
- **FinancePlanner.Data** — EF Core `DbContext`, migrations, and `EntityTypeConfiguration` classes (FluentAPI). SQLite database at `API/FinancePlanner.API/financeplanner.db`.
- **FinancePlanner.Domain** — Plain domain entities (`ApplicationUser`, `Account`, `Transaction`, `RecurringPayment`).
- **FinancePlanner.AppHost** — .NET Aspire orchestration. Runs both API and React together; the React app receives service URLs via `VITE_*` environment variables.
- **FinancePlanner.ServiceDefaults** — Shared OpenTelemetry, health checks, and service discovery defaults wired into both the API and AppHost.

**Key backend patterns:**
- All data endpoints call `RequireAuthorization()` and extract the user ID from claims to scope data.
- SignalR hub at `/hubs/sync` broadcasts changes to the authenticated user's other connections.
- Bulk sync endpoint at `POST /sync` accepts a list of client changes and returns server changes since a given timestamp.

### Frontend (`React/src/`)

```
components/     # UI organised by feature: auth, accounts, transactions, recurring-payments, dashboard
data/
  models/       # TypeScript interfaces mirroring domain entities
  services/     # API call layer (AuthService, AccountService, TransactionService, etc.)
  stores/       # Local state backed by IndexedDB (offline-first)
routing/        # ProtectedRoute wrapper
utils/          # Shared utilities
```

**Key frontend patterns:**
- **Offline-first**: `IndexedDBService` is the source of truth; services write to IndexedDB and sync to the API in the background.
- **Real-time sync**: `SignalRService` connects to `/hubs/sync` and pushes server-side changes into the local stores.
- **Services → Stores → Components**: services handle API calls and IndexedDB writes; stores expose reactive state; components read from stores.
- **Routing**: React Router v7 with `ProtectedRoute` guarding all authenticated pages.
- **Path alias**: `@` maps to `src/`.
- **Vite proxy**: `/api/*` requests are proxied to the backend URL resolved from `VITE_services__financeplannerapi__https__0` (or the `http` variant).

### Data Model

| Entity | Key fields |
|---|---|
| `Account` | name, type (Current/Savings), currency, startingBalance |
| `Transaction` | description, type, amount, fromAccountId, toAccountId, recurrenceId, date |
| `RecurringPayment` | amount, type, frequency, accountId |

All entities are scoped to the authenticated `ApplicationUser` (extends `IdentityUser`).
