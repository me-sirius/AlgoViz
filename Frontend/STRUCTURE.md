# Frontend Structure Guide

Last updated: 2026-04-06

## Scope

This document applies to AlgoViz Frontend only.

When this document says DSA, it means the algorithm-visualization feature inside AlgoViz at src/features/dsa.
It does not refer to the separate DSA workspace folder in your multi-root workspace.

## Source Layout

src/
- App.jsx
- main.jsx
- components/
- core/
  - constants/
  - context/
  - hooks/
  - utils/
- features/
  - admin/
  - auth/
  - dsa/
  - interview/
  - mentor/
  - practice/
  - resources/
  - user/
- layouts/
- pages/
  - about/
  - coming-soon/
  - home/
  - ide/
  - leaderboard/
  - legal/
  - not-found/
- styles/

## Ownership Rules

- pages/: Route-level entry points and page composition.
- features/: Domain modules. Keep business logic and domain-specific screens here.
- core/: App-wide primitives (constants, contexts, hooks, and generic utilities).
- components/: Cross-feature reusable UI and interaction components.
- layouts/: Shared layout shells used by routes.
- styles/: Global style assets.

## Naming Conventions

- Use kebab-case for folders.
- Keep React component filenames in PascalCase.
- Prefer folder-based pages: pages/<page-name>/<PageName>.jsx.
- Add pages/<page-name>/index.js for folder-level imports.
- Add features/<feature>/index.js as a barrel for local feature exports.

## Import Conventions

- Prefer folder-level imports for pages in route wiring.
  - Example: import("./pages/about")
- Keep lazy route imports direct from feature component files unless intentional chunk grouping is needed.
- Keep core imports explicit and stable.
  - Example: ../../core/context/ThemeContext

## Archive Policy

Unused source files are archived, not deleted.

Archive location pattern:
- backup(old)/unused-src-YYYY-MM-DD/

## Validation Checklist

After any structural change:

1. Run build:
   npm --prefix Frontend run build
2. Run orphan check:
   npx --yes madge --extensions js,jsx Frontend/src --orphans
3. Confirm no broken imports in App routes and Error fallback paths.

## Recent Normalization (2026-04-06)

- Page folders normalized to kebab-case.
- Standalone page files moved into dedicated page folders.
- Page folder index.js entry files added.
- Feature barrel index.js files added for non-dsa feature modules.
