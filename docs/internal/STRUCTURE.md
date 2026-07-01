# Repository Structure

## Layout

```
UltimateHealth/
├── frontend/                 # Expo React Native application (TypeScript)
│   ├── src/
│   │   ├── components/       # Reusable UI
│   │   ├── screens/          # Route-level views
│   │   ├── hooks/            # Data fetching and mutations
│   │   ├── services/         # API clients, monitoring, storage helpers
│   │   ├── store/            # Redux slices
│   │   ├── config/           # Runtime configuration helpers
│   │   ├── navigations/      # Stack and tab navigators
│   │   ├── helper/           # Shared utilities
│   │   └── types/            # Ambient module declarations
│   ├── assets/               # Images, fonts, sounds
│   └── app.config.js         # Dynamic Expo configuration
├── packages/
│   └── persistence/          # Optional Redis cache layer
├── docs/
│   ├── internal/             # Maintainer documentation (audit, structure)
│   └── *.md                  # Contributor guides (Knip, architecture)
├── .github/workflows/        # CI/CD and automation
└── README.md                 # Project overview and onboarding
```

## Design Decisions

- **Monorepo workspaces** — `frontend` and `packages/persistence` share tooling while keeping mobile and Node concerns separated.
- **External backend** — REST and WebSocket APIs remain in separate repositories; the mobile app consumes them via environment-configured URLs.
- **Optional Redis** — Persistence package supports local development caching without coupling Redis into the mobile runtime.
