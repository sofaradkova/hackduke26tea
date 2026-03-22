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
  reason: string               // e.g. "Wrong formula applied in step 2"
  category: 'wrong-approach' | 'stuck' | 'off-topic' | 'calculation-error'
  confidenceScore: number      // 0–1
  triggeredAt: string          // ISO timestamp
  confusionHighlights: string[] // Regions/text the student marked as confusing
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

## Open Questions (Blocking)

These must be answered before we can wire the real API.

1. **Whiteboard thumbnails** — Is `thumbnailUrl` a URL we fetch, or a base64 blob embedded in the response? We poll every 5–10s so payload size matters.

2. **Flag resolution** — Does `currentFlag` go `null` automatically when AI clears it, or does a teacher action (e.g. "Mark as resolved") clear it on your end?

3. **Polling vs WebSocket** — Should we poll `GET /classes/:id/students` every 5s, or will you push updates via WebSocket or SSE?

4. **confusionHighlights format** — What does the student mark? An array of text strings, bounding boxes, step numbers, or something else?

5. **Class IDs** — Are they UUIDs, integers, or slugs? This affects our URL routing.

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
  flag_category: 'wrong-approach' | 'stuck' | 'off-topic' | 'calculation-error'
  confidence: number           // 0–1
  triggered_at: string         // ISO timestamp
  progress_percent: number     // 0–100
  g1_text: string              // e.g. "! Jamie Chen: wrong formula  45%"
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
