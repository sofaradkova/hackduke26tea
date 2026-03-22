# ClassWatch — Teacher Dashboard

An AI-powered classroom monitoring platform that gives teachers live visibility into student work, surfaces alerts when students are struggling, and provides class-wide analytics.

**Built with Next.js 15, Material 3, React 19, and Supabase.**

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

<!-- AUTO-GENERATED -->
## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Production build with type checking |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the Supabase credentials:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (from project settings) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (from API settings) |

Both are public (safe to commit) and used for browser-side Supabase client initialization.
<!-- END AUTO-GENERATED -->

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home — Class List screen
│   ├── class/[classId]/            # Live Class Dashboard
│   └── api/g1/                     # Even G1 Smart Glasses REST API
│       ├── _lib/                   # Shared types, formatting, ETag utils
│       └── classes/                # GET /classes, [classId]/alerts|summary|students, resolve
├── components/
│   ├── layout/                     # AppShell, Sidebar, TopBar, NotificationPanel
│   ├── class-list/                 # ClassListGrid, ClassCard
│   ├── dashboard/                  # StudentGrid, StudentCard
│   ├── student-modal/              # StudentDetailModal
│   └── analytics/                  # AnalyticsHeader (inline metrics bar), AnalyticsView, MetricCard
├── context/                        # ClassContext, SessionContext (React Context providers)
├── hooks/                          # Custom React hooks
│   ├── use-student-polling.ts      # Poll for student updates (fallback when realtime unavailable)
│   └── use-realtime-flags.ts       # Supabase Postgres Changes subscription
└── lib/
    ├── types.ts                    # TypeScript interfaces (Student, Class, Notification, AIFlag)
    ├── theme.ts                    # Material 3 custom theme and colors
    ├── supabase.ts                 # Supabase client singleton
    └── services/
        ├── class-service.ts        # Interface (getClasses, getStudents, getAnalytics, resolveStudent)
        ├── mock-class-service.ts   # Mock implementation with seeded flag rotation
        ├── supabase-class-service.ts # Supabase implementation (falls back to mock)
        └── index.ts                # Service singleton export
```

## Even G1 Smart Glasses API

REST API at `/api/g1/` for the Even G1 companion app. All GET responses include pre-formatted `g1_text` fields (40 chars/line for the 640x200 monochrome display) and ETag headers for efficient polling.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/g1/classes` | List all classes |
| GET | `/api/g1/classes/:classId/alerts` | Active flags sorted by recency |
| GET | `/api/g1/classes/:classId/summary` | Class analytics (% struggling, completion, top issue) |
| GET | `/api/g1/classes/:classId/students` | Full student roster with status |
| POST | `/api/g1/classes/:classId/students/:studentId/resolve` | Clear a student's flag |

**Polling recommendations:** alerts every 5s, summary every 10s, students every 15s, classes once at launch. Send `If-None-Match: <data_hash>` to get `304 Not Modified` when data hasn't changed.

## Data Sources & Service Layer

**Active implementation:** `SupabaseClassService` with fallback to `MockClassService`.

The service reads from two Supabase tables:

- **`student_snapshots`** — Latest AI analysis for each student per class
  - `class_id`, `student_id`, `name`, `status` (`'ok'` or `'flagged'`)
  - `current_flag_id` (FK to `ai_flags`), `storage_path`, `thumbnail_url`
  - `problem_set_title`, `progress_percent`, `last_checked_at`, `captured_at`

- **`ai_flags`** — AI-generated flag details
  - `id`, `reason` (human-readable), `category` (wrong-approach, stuck, off-topic, calculation-error, success, unsure)
  - `confidence_score` (0.0–1.0), `confusion_highlights` (array)
  - `triggered_at` (timestamp)

**Real-time updates via Supabase Postgres Changes:**
The `useRealtimeFlags()` hook subscribes to `INSERT` and `UPDATE` events on `student_snapshots`, pushing notifications to the dashboard when students transition to flagged state.

**Thumbnail storage:**
Screenshots are stored in Supabase Storage bucket `student_snapshots` and retrieved via signed URLs (1-hour expiry). Fallback: generated SVG whiteboard if storage is unavailable.

**Fallback behavior:**
For classes without Supabase data, the service falls back to seeded mock data. This allows development and testing without live Supabase data.

**To add a new data source:**
1. Implement `ClassService` interface in `src/lib/services/class-service.ts`
2. Update the service selection in `src/lib/services/index.ts`

## Real-Time Notifications

Supabase Postgres Changes streams AI flags to the dashboard in near real-time via `useRealtimeFlags()` hook (in `src/hooks/use-realtime-flags.ts`).

**Flow:**
1. Backend inserts or updates a row in `student_snapshots` with `status='flagged'`
2. Supabase broadcasts the change to the subscribed client
3. The hook receives the payload, converts it to a `Student` object, and updates ClassContext
4. If transitioning from `'ok'` to `'flagged'`, a notification is added to the session
5. Notification panel renders the alert immediately; student card turns red

**Key features:**
- Listens to `INSERT` and `UPDATE` events on `student_snapshots` filtered by `class_id`
- Fetches full AI flag details asynchronously (from `ai_flags` table)
- Prevents duplicate notifications via `flaggedRef` Set tracking
- Handles Postgres Changes cleanup on component unmount

## Tech Stack

- **Next.js 16** — App Router with dynamic routes
- **React 19** — Latest React with server components
- **Material UI 7** — Material 3 components and tokens
- **TypeScript 5** — Strict mode
- **Supabase** — PostgreSQL database, Postgres Changes (real-time), Storage (thumbnails)
- **Emotion** — CSS-in-JS styling
- **Fontsource** — Self-hosted Inter font

### Key Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.99.3 | Supabase client (database, storage, realtime) |
| `@mui/material` | ^7.3.9 | Material 3 UI components |
| `@mui/icons-material` | ^7.3.9 | Material Design icons |
| `next` | 16.2.1 | React framework |
| `react` | 19.2.4 | React library |
| `typescript` | ^5 | Type safety |
| `eslint` | ^9 | Code linting |
