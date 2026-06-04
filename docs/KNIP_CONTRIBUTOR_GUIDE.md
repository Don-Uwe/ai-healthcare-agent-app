# Knip Contributor Guide

Use Knip before opening PRs that touch dependencies, exports, shared utilities, routes, screens, hooks, services, or project structure.

## Before Opening a PR

1. Install dependencies:

   ```bash
   cd frontend
   pnpm install
   ```

2. Run the quality check:

   ```bash
   pnpm quality
   ```

3. If you only need dead-code analysis:

   ```bash
   pnpm knip
   ```

4. Review each finding and either fix it or explain why it is a false positive in the PR description.

## Reviewing Findings

For unused dependencies, remove the package when no source, config, native project, or script still needs it.

For unused files, check that the file is not loaded by a framework convention. If it is not reachable, delete it.

For unused exports, prefer making helpers private to the file or deleting the unused symbol. Keep exported APIs only when they are part of an intentional public module boundary.

For missing dependencies, add the package to `dependencies` when runtime code imports it, or `devDependencies` when only tooling/tests import it.

## Updating `knip.json`

Update `frontend/knip.json` when you add a new framework convention, new source root, generated folder, or tool that Knip cannot discover automatically.

Add to `entry` for files that are loaded by convention. Add to `project` for files Knip should analyze. Add to `ignore` for generated output. Add to `ignoreDependencies` only for packages used outside normal imports.

## Examples

Remove an unused dependency:

```bash
cd frontend
pnpm remove package-name
pnpm knip:deps
```

Check only unused files:

```bash
cd frontend
pnpm knip:files
```

Check only unused exports:

```bash
cd frontend
pnpm knip:exports
```

Run the CI-style command:

```bash
cd frontend
pnpm knip:check
```

## DOs

- Do run Knip after moving files or deleting imports.
- Do remove unused code in small, focused commits.
- Do explain framework-driven false positives in PR notes.
- Do keep `frontend/pnpm-lock.yaml` updated when changing dependencies.
- Do prefer explicit entry points over broad ignores.

## DON'Ts

- Do not ignore a dependency just because it is inconvenient to investigate.
- Do not delete route, middleware, app config, native config, or generated type files without checking framework behavior.
- Do not run `knip:fix` without reviewing the diff.
- Do not mix large dead-code cleanup with unrelated feature work.
