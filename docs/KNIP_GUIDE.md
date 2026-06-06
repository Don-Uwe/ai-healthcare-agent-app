# Knip Guide

Knip detects unused dependencies, files, exports, and missing dependencies. It helps keep UltimateHealth easier to maintain by finding code paths that are no longer connected to the application.

The Knip setup for this repository lives in `frontend/knip.json` because the app package and scripts live in `frontend/package.json`.

## Local Setup

From the repository root:

```bash
cd frontend
pnpm install
pnpm knip --version
```

The dependency is tracked as a dev dependency in `frontend/package.json` and locked in `frontend/pnpm-lock.yaml`.

## Commands

Run these from `frontend/`:

```bash
pnpm knip
pnpm knip:deps
pnpm knip:files
pnpm knip:exports
pnpm knip:fix
pnpm knip:check
pnpm quality
```

Use `pnpm knip` for a complete local check. Use `pnpm knip:check` in automation because it disables progress output. Use `pnpm knip:fix` only after reviewing the proposed changes.

## Understanding Output

Knip groups findings by type:

- Unused dependencies: packages listed in `package.json` that Knip cannot trace from source, config, or scripts.
- Unlisted dependencies: packages imported in code but missing from `package.json`.
- Unused files: source files that are not reachable from configured entry points.
- Unused exports: exported symbols that are not imported anywhere.
- Unused binaries: command-line tools that are installed but not referenced by scripts or config.

Treat Knip findings as review prompts. Remove code only when you confirm it is truly unused.

## Configuration

`frontend/knip.json` includes:

- `entry`: files Knip should always treat as application entry points, including Expo app files and Next.js-compatible patterns for app router, pages router, middleware, config, instrumentation, and type definitions.
- `project`: source files Knip should analyze, including `src/`, top-level `hooks/`, `constants/`, `plugins/`, and `scripts/`.
- `ignore`: generated output, platform folders, static assets, tests, and build folders.
- `ignoreBinaries`: command-line tools that are invoked through framework scripts.
- `ignoreDependencies`: packages used by Expo, Metro, native linking, test setup, or other non-standard runtime paths.

## Common False Positives

Next.js route files, metadata exports, middleware, and instrumentation can look unused because frameworks load them by convention. Add those paths to `entry` instead of deleting them.

Expo and React Native packages can be used through native configuration, Metro, app config plugins, or platform builds. Keep those in `ignoreDependencies` only when there is a clear framework-level reason.

Generated folders such as `.next/`, `.expo/`, `.tamagui/`, native build outputs, and coverage reports should stay ignored because they are not source.

Dynamic imports, feature flags, or registry-style exports may need an explicit entry path or a short comment in the PR explaining why the export is intentionally retained.

## Best Practices

Run `pnpm knip` before opening a PR that adds, removes, or moves files. Remove unused dependencies in the same PR that makes them unused. Prefer deleting unreachable files over adding ignores. Keep `ignoreDependencies` small and documented through PR context.

When Knip reports many findings, split cleanup into a dedicated PR so functional changes stay easy to review.

## Troubleshooting

If `pnpm install --frozen-lockfile` fails, make sure `frontend/pnpm-lock.yaml` is committed after changing dependencies.

If Knip reports framework files as unused, add the convention-loaded file or glob to `entry`.

If a package is loaded by native tooling or app config, add it to `ignoreDependencies` and explain the reason in the PR.

If CI reports different results than local runs, use Node.js 20 and run from `frontend/`.

## References

- Knip documentation: https://knip.dev/
- Knip configuration: https://knip.dev/docs/configuration
- Knip Next.js guide: https://knip.dev/docs/guides/next-js
- GitHub Actions documentation: https://docs.github.com/en/actions
