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

## Integration Notes

- The dashboard is built against a service interface (`ClassService`). Swapping mock for real is a **single file change**.
- Match the TypeScript shapes above exactly and no component code needs to change.
- Source of truth for types: `src/lib/types.ts`
