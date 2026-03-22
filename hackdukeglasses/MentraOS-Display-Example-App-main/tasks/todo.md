# Tasks — ClassWatch MentraOS Live Glasses App

## Plan

- [x] Read the full existing Mentra example repo
- [x] Read `/Users/pierce/Documents/hackdukeglasses/API_CONTRACT.md`
- [x] Read the existing `main` implementation before building
- [x] Read the real ClassWatch `/api/g1/*` implementation and shared types
- [x] Create product requirements document before implementation
- [x] Confirm plan with user before implementation
- [x] Update package metadata/docs for the new ClassWatch Mentra app
- [x] Build config module for environment loading and validation
- [x] Build shared type definitions for G1 API responses and session state
- [x] Build structured logger utility
- [x] Build typed ClassWatch API client with ETag support and timeouts
- [x] Build polling coordinator with shared cache per class/resource
- [x] Build session manager for active screen/class/page state
- [x] Build display service for smart-glasses text rendering
- [x] Replace template `src/index.ts` with full Mentra app server
- [x] Add health/debug/session endpoints
- [x] Add resolve-alert debug/action path
- [x] Update README with setup and run instructions
- [x] Run validation checks and smoke-test the implementation
- [x] Add review notes to this file

## Architecture Notes

- Build as a thin client over the existing ClassWatch G1 API.
- Treat Next.js route files under `src/app/api/g1/` as the behavior source of truth.
- Reuse `g1_text` whenever possible instead of rebuilding formatting logic.
- Avoid one polling loop per glasses session; share cached polling by `classId + resource`.
- Default Mentra app port should differ from the Next.js app port to avoid collisions.

## Open Decisions

- Whether class selection should be auto-rotated when multiple classes exist and no `DEFAULT_CLASS_ID` is set.
- Whether the final app should expose only HTTP debug controls or also attempt direct voice-command-based navigation in MVP.

## Review Notes

- Implemented a modular MentraOS app that polls the existing ClassWatch G1 API instead of duplicating dashboard logic.
- Added shared polling cache keyed by class/resource with ETag reuse to avoid per-session polling waste.
- Added session-specific screen state, voice-command screen switching, class selection, and rotating alerts/roster pages.
- Added debug endpoints for session inspection, cache inspection, class selection, screen switching, manual rerender, and resolve action.
- Added `tsconfig.json` and verified `bun run typecheck` passes.
- Smoke-tested local boot with a temporary `.env`; server started cleanly on port `3001`.
- Observed expected upstream connection failure in `/api/cache` because local ClassWatch server was not running during smoke test.
- Discovered Mentra SDK already owns `/health`; moved custom app health route to `/api/health`.
