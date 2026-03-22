# API Contract — ClassWatch Teacher Dashboard

## Endpoints (4 total)

| What | Method | Returns |
|---|---|---|
| List all classes | `GET /classes` | Array of classes |
| Get one class | `GET /classes/:id` | Class + student roster |
| Get students (polling) | `GET /classes/:id/students` | Student array with live status |
| Get analytics | `GET /classes/:id/analytics` | Aggregated stats |

---

## Data Shapes

### Student

```typescript
{
  id: string
  name: string
  avatarUrl: string | null
  thumbnailUrl: string         // HOW is this delivered? (URL vs base64 blob)
  status: 'ok' | 'flagged' | 'loading'
  currentFlag: AIFlag | null
  problemSetTitle: string
  progressPercent: number      // 0–100
  lastCheckedAt: string        // ISO timestamp
}
```

### AIFlag

```typescript
{
  id: string
  reason: string               // Full AI-generated explanation (may be a long sentence)
  category: 'wrong-approach' | 'stuck' | 'off-topic' | 'calculation-error' | 'success' | 'unsure'
  confidenceScore: number      // 0–1
  triggeredAt: string          // ISO timestamp
  confusionHighlights: string[] // AI-identified problem areas, e.g. ["no algebraic work shown", "image unrelated to problem"]
}
```

### ClassData

```typescript
{
  id: string
  name: string
  subject: string
  studentCount: number
  students: Student[]
}
```

### AnalyticsSnapshot

```typescript
{
  strugglingPercent: number
  completionPercent: number
  mostCommonProblem: string
  totalFlagged: number
  totalStudents: number
  computedAt: string           // ISO timestamp
}
```

---

## Integration Status

These questions were blocking. All are now resolved.

1. **Whiteboard thumbnails** — Images stored in Supabase Storage bucket (`student_snapshots`). The service generates signed URLs (1-hour expiry). Falls back to SVG placeholders when no image is present.

2. **Flag resolution** — The AI writes new snapshots with updated status; the dashboard polls every 7s and detects transitions. Teacher "Mark as resolved" is UI-only for now (clears the flag locally in mock mode; Supabase update pending).

3. **Real-time updates** — Supabase Postgres Changes via `useRealtimeFlags()` hook streams AI flags in near real-time. Fallback polling is available via `useStudentPolling` hook for resilience.

4. **confusionHighlights format** — Array of short AI-generated text strings identifying specific issues (e.g. `["no algebraic work shown", "image unrelated to problem"]`). Stored as `jsonb` in `ai_flags.confusion_highlights`.

5. **Class IDs** — String slugs (e.g. `class-demo`, `class-algebra-ii`). Defined in mock data; Supabase rows must use matching `class_id` values.

---

## Even G1 Smart Glasses API (5 endpoints)

REST API at `/api/g1/` for the Even G1 companion app. Designed for a 640x200 monochrome text display.

| What | Method | Path | Returns |
|---|---|---|---|
| List classes | `GET` | `/api/g1/classes` | Class list with `g1_text` per entry |
| Active alerts | `GET` | `/api/g1/classes/:classId/alerts` | Flagged students sorted by recency |
| Class summary | `GET` | `/api/g1/classes/:classId/summary` | Analytics snapshot (% struggling, completion) |
| Student roster | `GET` | `/api/g1/classes/:classId/students` | All students with status + progress |
| Resolve flag | `POST` | `/api/g1/classes/:classId/students/:studentId/resolve` | Clears student flag |

### G1 Response Conventions

All GET responses include:
- **`g1_text`** — Pre-formatted plain text (40 chars/line) ready for the monochrome display
- **`data_hash`** + `ETag` header — Send `If-None-Match: <data_hash>` to get `304 Not Modified`
- **`timestamp`** — ISO 8601

### G1 Alert Entry

```typescript
{
  student_id: string
  student_name: string
  flag_reason: string
  flag_category: 'wrong-approach' | 'stuck' | 'off-topic' | 'calculation-error' | 'success' | 'unsure'
  confidence: number           // 0–1
  triggered_at: string         // ISO timestamp
  progress_percent: number     // 0–100
  confusion_highlights: string[] // AI-identified problem areas
  g1_text: string              // e.g. "! Jamie Chen: wrong formula  45%"
}
```

### G1 Student Entry

```typescript
{
  id: string
  name: string
  status: 'ok' | 'flagged' | 'loading'
  progress_percent: number     // 0–100
  flag_reason: string | null
  flag_category: 'wrong-approach' | 'stuck' | 'off-topic' | 'calculation-error' | 'success' | 'unsure' | null
  problem_set: string
  last_checked_at: string      // ISO timestamp
  g1_text: string
}
```

### G1 Resolve Response

```typescript
{
  success: boolean
  student_id: string
  student_name: string
  g1_text: string              // e.g. "Resolved: Jamie Chen"
  timestamp: string
}
```

Source of truth for G1 types: `src/app/api/g1/_lib/types.ts`

---

## Integration Notes

- The dashboard is built against a service interface (`ClassService`). Swapping mock for real is a **single file change**.
- Match the TypeScript shapes above exactly and no component code needs to change.
- The G1 API and web dashboard share the same `ClassService` singleton — resolving a student via G1 is reflected on the web dashboard at the next poll.
- Source of truth for types: `src/lib/types.ts` (core) and `src/app/api/g1/_lib/types.ts` (G1-specific)
