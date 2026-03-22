# PRD — ClassWatch MentraOS Live Glasses App

## 1. Overview

Build a MentraOS smart-glasses app that displays live classroom monitoring data from the existing ClassWatch dashboard APIs in `/Users/pierce/Documents/hackdukeglasses`.

The app will be a Bun + TypeScript + `@mentra/sdk` cloud app that:
- connects to MentraOS sessions,
- polls the existing ClassWatch G1 REST endpoints,
- renders glanceable live class information on smart glasses,
- prioritizes active student alerts,
- optionally resolves a flagged student through the existing backend endpoint.

This app should follow the proven architectural style used in `main`:
- `AppServer` subclass as the entrypoint,
- extracted config/service modules,
- session state manager,
- display formatting service,
- lightweight operational/debug HTTP endpoints.

## 2. Problem

Teachers need a low-friction way to glance at live student status while moving around the classroom.

The existing ClassWatch dashboard already exposes teacher-facing classroom data and a G1-specific API shaped for compact text displays, but there is no MentraOS app yet that turns that live data into a wearable classroom assistant.

## 3. Goals

### Primary goals
- Show live classroom data on MentraOS glasses using the existing ClassWatch G1 API.
- Reuse the existing backend contract instead of reimplementing business logic.
- Prioritize active alerts so teachers can quickly identify struggling students.
- Keep the display compact, readable, and robust on monochrome smart-glasses text layouts.
- Provide a maintainable internal architecture that mirrors the successful `main` structure.

### Secondary goals
- Minimize API load using ETag-aware polling.
- Support multiple connected glasses sessions cleanly.
- Provide debug endpoints for health, session visibility, and demo/testing actions.

## 4. Non-Goals

- No direct Supabase integration from the Mentra app.
- No duplication of ClassWatch domain logic already implemented in the Next.js app.
- No custom web UI inside this repo.
- No attempt to replace the main dashboard.
- No realtime websocket/subscription integration for MVP; polling is sufficient.

## 5. Users

### Primary user
- Teacher wearing smart glasses during class.

### Secondary users
- Demo operators or developers validating the wearable experience.

## 6. Source of Truth

### Contract sources reviewed
- `/Users/pierce/Documents/hackdukeglasses/API_CONTRACT.md`
- `/Users/pierce/Documents/hackdukeglasses/src/app/api/g1/_lib/types.ts`
- `/Users/pierce/Documents/hackdukeglasses/src/app/api/g1/_lib/format.ts`
- `/Users/pierce/Documents/hackdukeglasses/src/app/api/g1/classes/**/route.ts`
- `/Users/pierce/Documents/hackdukeglasses/main/src/index.ts`
- `/Users/pierce/Documents/hackdukeglasses/main/src/config/index.ts`
- `/Users/pierce/Documents/hackdukeglasses/main/src/services/displayService.ts`

### Source-of-truth rule
For implementation behavior, the actual Next.js G1 route files are the source of truth over prose docs if there is any mismatch.

## 7. Functional Requirements

### FR1. Connect to Mentra session
When a glasses session starts, the app must:
- register the session,
- initialize session state,
- show a ready/loading message,
- begin rendering data once available.

### FR2. Fetch available classes
The app must fetch from:
- `GET /api/g1/classes`

The app must support:
- showing class list if no class is selected,
- auto-selecting a class when only one class exists,
- optional default class selection via environment variable.

### FR3. Show class summary
The app must fetch from:
- `GET /api/g1/classes/:classId/summary`

The display should show:
- class name,
- struggling percent,
- completion percent,
- most common problem,
- flagged vs total students.

### FR4. Show active alerts
The app must fetch from:
- `GET /api/g1/classes/:classId/alerts`

The display should:
- prioritize flagged students,
- show at least one active alert clearly,
- include student name, reason, progress, and category if useful,
- support alert rotation when multiple flagged students exist.

### FR5. Show roster snapshot
The app must fetch from:
- `GET /api/g1/classes/:classId/students`

The display should:
- show a paginated compact roster,
- include status and progress,
- allow quick awareness of overall classroom state.

### FR6. Resolve student flag
The app must support sending:
- `POST /api/g1/classes/:classId/students/:studentId/resolve`

For MVP, this may be triggered via:
- a debug/demo HTTP endpoint in the Mentra app,
- or a future direct interaction path if the SDK supports a suitable input flow.

### FR7. Poll live data efficiently
The app must:
- poll G1 endpoints on intervals,
- send `If-None-Match` when an ETag is available,
- avoid duplicate polling loops per session where possible,
- reuse shared cached responses across sessions.

### FR8. Handle failures gracefully
The app must show useful fallback states for:
- API unavailable,
- class not found,
- no active alerts,
- no classes returned,
- stale data.

### FR9. Provide operational endpoints
The app should expose HTTP endpoints for:
- health check,
- active session listing,
- demo/debug actions,
- optionally current cached state inspection.

## 8. UX Requirements

## Display constraints
The upstream G1 API is designed for:
- 640x200 monochrome display,
- roughly 40 characters per line,
- compact text-oriented presentation.

Mentra rendering should stay text-first and conservative.

### UX priorities
1. Glanceability over completeness.
2. Active alerts over passive summaries.
3. Minimal cognitive load.
4. Stable layouts over flashy updates.

### Proposed screen model
Per session, the app will maintain an active screen state:
- `classes`
- `alerts`
- `summary`
- `students`

### Default experience
- On first connect:
  - show loading/connecting state.
- If only one class is available or a default class is configured:
  - auto-enter that class.
- If alerts exist:
  - default to alert-first display.
- If no alerts exist:
  - default to summary view.
- Students view should rotate or paginate in compact chunks.

### Text composition strategy
Use upstream `g1_text` whenever practical instead of re-deriving formatting.

Mentra-side rendering will add only lightweight framing such as:
- app header,
- class name,
- stale/error indicator,
- page or rotation status.

## 9. Technical Requirements

### Runtime
- Bun
- TypeScript
- `@mentra/sdk`
- Express via SDK’s app server integration

### Architecture
The app should be split into cohesive modules:
- `src/index.ts` — app server and HTTP routes
- `src/config/index.ts` — env/config loading
- `src/types/*.ts` — response/session types
- `src/services/classwatch-api.ts` — typed HTTP client for G1 APIs
- `src/services/polling-coordinator.ts` — shared polling + ETag reuse
- `src/services/session-manager.ts` — per-session UI/navigation state
- `src/services/display-service.ts` — text rendering for glasses
- `src/utils/logger.ts` — small structured logger

### State model
The app will maintain:
- active sessions,
- selected class per session,
- current screen per session,
- current alert index / student page per session,
- shared cached G1 responses keyed by class + resource,
- ETags and last-success metadata per resource.

### Polling strategy
Recommended initial cadence:
- classes: every 60s
- alerts: every 5s
- summary: every 10s
- students: every 15s

Notes:
- intervals should be configurable via env,
- requests should be staggered slightly to avoid bursts,
- 304 responses should not trigger unnecessary rerenders.

### Networking
The app must support a configurable base URL for the ClassWatch app, e.g.:
- `CLASSWATCH_BASE_URL=http://localhost:3000`

The Mentra app itself should default to a different port, e.g.:
- `PORT=3001`

This avoids stepping on the Next.js app during local dev.

## 10. Data Contracts Used

### Required upstream endpoints
- `GET /api/g1/classes`
- `GET /api/g1/classes/:classId/alerts`
- `GET /api/g1/classes/:classId/summary`
- `GET /api/g1/classes/:classId/students`
- `POST /api/g1/classes/:classId/students/:studentId/resolve`

### Important upstream fields
From the G1 API, the Mentra app should rely on:
- `g1_text`
- `data_hash`
- `timestamp`
- `alerts`
- `students`
- `total_flagged`
- `total_students`
- `class_name`
- `computed_at`

## 11. Environment Variables

Required:
- `PACKAGE_NAME`
- `MENTRAOS_API_KEY`
- `CLASSWATCH_BASE_URL`

Recommended:
- `PORT`
- `DEFAULT_CLASS_ID`
- `POLL_CLASSES_MS`
- `POLL_ALERTS_MS`
- `POLL_SUMMARY_MS`
- `POLL_STUDENTS_MS`
- `MENTRA_VIEW_TYPE`
- `REQUEST_TIMEOUT_MS`
- `LOG_LEVEL`

## 12. Success Criteria

The MVP is successful if:
- the app starts and connects to MentraOS,
- a connected session displays live class data from ClassWatch,
- alerts update live without restarting the app,
- summary and roster information remain readable,
- stale/error states are understandable,
- resolving a student flag works via the existing backend route,
- multiple sessions do not multiply upstream polling wastefully.

## 13. Risks

### Risk: contract drift
Mitigation:
- use actual route files as implementation truth,
- keep response typing centralized.

### Risk: duplicated polling per session
Mitigation:
- shared polling coordinator keyed by class/resource,
- ETag support.

### Risk: glasses text truncation or SDK view quirks
Mitigation:
- compact render strategy,
- configurable `ViewType`,
- conservative line counts.

### Risk: unclear direct user input support on glasses
Mitigation:
- ship MVP as read-first,
- use debug HTTP action for resolve if needed,
- add future interaction layer only when validated.

## 14. Phased Delivery

### Phase 1
- PRD
- skeleton architecture
- typed API client
- session management
- basic rendering
- health/session endpoints

### Phase 2
- shared polling coordinator
- stale indicators
- alert rotation
- roster paging
- resolve action endpoint

### Phase 3
- refinement of interaction model
- optional direct controls if supported by SDK
- stronger testing and docs polish

## 15. Build Decision

The Mentra app should be implemented as a thin, typed client over the existing ClassWatch G1 API.

This is the most maintainable path because it:
- avoids logic duplication,
- reuses the already-designed text contract,
- reduces drift risk,
- respects DRY and YAGNI,
- keeps the glasses app focused on delivery, not domain recomputation.
