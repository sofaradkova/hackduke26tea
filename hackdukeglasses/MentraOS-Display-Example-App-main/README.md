# ClassWatch MentraOS Live App

Smart-glasses companion app for the ClassWatch teacher dashboard.

This MentraOS app connects to the existing ClassWatch G1 API and shows:
- live flagged-student alerts,
- class summary metrics,
- roster snapshots,
- simple debug actions for class selection and resolving flags.

It is built as a thin client over the existing ClassWatch backend so we do not duplicate business logic like maniacs.

## What it talks to

This app expects the ClassWatch dashboard app to be running and exposing:
- `GET /api/g1/classes`
- `GET /api/g1/classes/:classId/alerts`
- `GET /api/g1/classes/:classId/summary`
- `GET /api/g1/classes/:classId/students`
- `POST /api/g1/classes/:classId/students/:studentId/resolve`

The app also serves a tiny `/webview` route so the Mentra console's default webview URL does not show a 404.

## Architecture

The app follows the same basic architectural style used in `main`:
- `src/index.ts` — Mentra app server + HTTP routes
- `src/config/index.ts` — environment loading and validation
- `src/services/classwatch-api.ts` — typed API client with ETag support
- `src/services/polling-coordinator.ts` — shared polling/cache layer
- `src/services/session-manager.ts` — per-session state
- `src/services/display-service.ts` — smart-glasses text rendering
- `src/utils/logger.ts` — tiny structured logger
- `docs/PRD.md` — product requirements doc
- `docs/MENTRA_CONSOLE_SETUP.md` — exact Mentra console field guidance
- `tasks/todo.md` — tracked build checklist

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in at least:

```bash
PORT=3001
PACKAGE_NAME=com.yourname.classwatchmentra
MENTRAOS_API_KEY=your_mentra_api_key
CLASSWATCH_BASE_URL=http://localhost:3000
```

Notes:
- `PORT=3001` is intentional so it does not collide with the local Next.js ClassWatch app on `3000`.
- Later you can swap `CLASSWATCH_BASE_URL` to your Vercel deployment URL.

### 3. Run the ClassWatch dashboard app

From `/Users/pierce/Documents/hackdukeglasses`:

```bash
npm install
npm run dev
```

### 4. Run this Mentra app

```bash
bun run dev
```

### 5. Expose the Mentra app publicly

Use ngrok or another public tunnel for the Mentra app port:

```bash
ngrok http 3001
```

Register that public URL in the MentraOS developer console.

Important: the Mentra console `Server URL` must point to this Mentra app's public URL, not directly to the ClassWatch Vercel deployment. The Vercel URL belongs in `CLASSWATCH_BASE_URL` inside your `.env`.

## Smart-glasses behavior

### Default display behavior
- If exactly one class exists, it auto-selects it.
- If `DEFAULT_CLASS_ID` is set and exists, it auto-selects it.
- If alerts exist, the app defaults to the alerts screen.
- If no alerts exist, it defaults to the summary screen.
- Student roster pages rotate automatically.

### Voice commands
The app listens to final transcription events and supports simple commands like:
- `next screen`
- `show alerts`
- `show summary`
- `show students`
- `show roster`
- `class <class-id>`

These are MVP-level convenience commands, not a full assistant brain. Let’s stay humble.

## HTTP endpoints

### Health
```bash
GET /api/health
```

### Webview placeholder
```bash
GET /webview
```

### Session debug
```bash
GET /api/session/list
```

### Cache debug
```bash
GET /api/cache
```

### Force a rerender
```bash
POST /api/render
Content-Type: application/json

{
  "sessionId": "..."
}
```

### Select class for a session
```bash
POST /api/action/select-class
Content-Type: application/json

{
  "sessionId": "...",
  "classId": "class-demo"
}
```

### Switch screen
```bash
POST /api/action/screen
Content-Type: application/json

{
  "sessionId": "...",
  "screen": "alerts"
}
```

### Resolve a flagged student
```bash
POST /api/action/resolve
Content-Type: application/json

{
  "sessionId": "...",
  "classId": "class-demo",
  "studentId": "student-123"
}
```

## Development checks

```bash
bun run typecheck
bun run dev
```

The Mentra SDK also exposes its own basic `/health` route. Use `/api/health` for this app's richer custom health payload.

## Notes

- The real implementation source of truth is the ClassWatch Next.js route code under `src/app/api/g1/`.
- The app prefers upstream `g1_text` formatting rather than recomputing display lines.
- Polling uses ETag headers so unchanged responses can return `304 Not Modified`.
