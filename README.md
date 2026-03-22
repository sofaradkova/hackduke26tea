# ClassWatch — Teacher Dashboard

An AI-powered classroom monitoring platform that gives teachers live visibility into student work, surfaces alerts when students are struggling, and provides class-wide analytics.

## Quick Start

```bash
npm install
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

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | `eyJ...` |

Copy `.env.example` to `.env.local` and fill in values.
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
│   └── analytics/                  # AnalyticsView, MetricCard
├── context/                        # ClassContext, SessionContext
├── hooks/                          # useStudentPolling
└── lib/
    ├── types.ts                    # TypeScript interfaces (Student, Class, Notification, AIFlag)
    ├── theme.ts                    # Material 3 custom theme
    └── services/
        ├── class-service.ts        # Interface (getClasses, getStudents, resolveStudent, etc.)
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

## Swapping Mock Data for a Real API

All data access is behind the service interface in `src/lib/services/class-service.ts`. To wire up a live API:

1. Create a new implementation of `ClassService` (e.g., `api-class-service.ts`)
2. Update `src/lib/services/index.ts` to export the new implementation
3. No component changes required — both the web dashboard and G1 API use the same service

## Tech Stack

- **Next.js 15** — App Router
- **Material UI 7** — Material 3 components
- **TypeScript 5** — Strict mode
- **React 19**
- **Supabase** — Database + storage (with mock fallback)
