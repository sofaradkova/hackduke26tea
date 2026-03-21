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
| `NEXT_PUBLIC_API_URL` | No | URL for live student data API (future) | `https://api.classwatch.io` |

Copy `.env.example` to `.env.local` and fill in values.
<!-- END AUTO-GENERATED -->

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home — Class List screen
│   └── class/[classId]/    # Live Class Dashboard
├── components/             # React components
│   ├── layout/             # AppShell, Sidebar, TopBar, NotificationPanel
│   ├── class-list/         # ClassListGrid, ClassCard
│   ├── dashboard/          # StudentGrid, StudentCard
│   ├── student-modal/      # StudentDetailModal
│   └── analytics/          # AnalyticsView, MetricCard
├── context/                # ClassContext, SessionContext
├── hooks/                  # useStudentPolling
└── lib/
    ├── types.ts            # TypeScript interfaces (Student, Class, Notification, AIFlag)
    ├── theme.ts            # Material 3 custom theme
    └── services/           # Abstracted data layer
        ├── class-service.ts        # Interface
        └── mock-class-service.ts   # Mock implementation
```

## Swapping Mock Data for a Real API

All data access is behind the service interface in `src/lib/services/class-service.ts`. To wire up a live API:

1. Create a new implementation of `ClassService` (e.g., `api-class-service.ts`)
2. Update `src/lib/services/index.ts` to export the new implementation
3. No component changes required

## Tech Stack

- **Next.js 15** — App Router
- **Material UI 7** — Material 3 components
- **TypeScript 5** — Strict mode
- **React 19**
