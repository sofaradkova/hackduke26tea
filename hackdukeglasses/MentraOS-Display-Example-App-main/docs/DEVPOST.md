# ClassWatch Live for MentraOS

## What it does

ClassWatch Live brings real-time classroom awareness to smart glasses.

We built a MentraOS MiniApp that connects to our existing ClassWatch teacher dashboard and displays:
- live class summaries,
- flagged student alerts,
- roster snapshots,
- lightweight voice-driven navigation,

all on the Even Realities G1 smart glasses.

The idea is simple: instead of forcing teachers to keep looking down at a laptop dashboard, ClassWatch Live lets them glance at key classroom insights directly on their glasses while walking around the room.

The app uses the existing ClassWatch G1 API and renders compact text optimized for the G1’s 640x200 monochrome display.

## Inspiration

Teachers already juggle a lot in real time: monitoring engagement, spotting who is stuck, checking progress, and deciding where to intervene first.

We wanted to make classroom analytics more ambient and less intrusive. The dashboard view is useful, but glasses make the experience more immediate: important information appears where the teacher is already looking.

Our inspiration was to turn classroom intelligence from a "go check the dashboard" workflow into a "see what matters right now" workflow.

## How we built it

We had two major pieces:

### 1. The existing ClassWatch backend/dashboard
This provided:
- the teacher dashboard,
- the G1-specific REST API,
- class summaries,
- student roster data,
- alert data,
- a Supabase-backed data model with mock fallback.

### 2. The new MentraOS smart-glasses app
We built a new Bun + TypeScript + `@mentra/sdk` app that:
- connects to MentraOS sessions,
- polls the ClassWatch G1 API,
- caches shared responses across sessions,
- renders live classroom info to the glasses,
- supports voice navigation like:
  - `show alerts`
  - `show summary`
  - `show students`
  - `next screen`
  - `class <class-id>`

We also built:
- a webview route to avoid Mentra console/webview 404 issues,
- debug endpoints for health and cache inspection,
- a modular architecture with config, API client, polling coordinator, session manager, and display service.

## Challenges we ran into

### Mentra configuration and URL confusion
One of the trickiest parts was separating:
- the ClassWatch backend URL,
- the Mentra MiniApp Server URL,
- and the default webview URL.

At one point, the webhook path worked but the webview still showed 404s because the console configuration was effectively pointing at the wrong thing. We had to debug that through ngrok logs and make sure both `/webhook` and `/webview` were actually served correctly.

### Smart-glasses display constraints
The Even Realities G1 has a very compact monochrome display, so we had to design around:
- limited line count,
- fixed-width-style text constraints,
- clarity over completeness.

That forced us to keep the UI text-first, concise, and glanceable.

### Mixing live and fallback data sources
The backend uses a `SupabaseClassService` with mock fallback behavior, which is great for reliability but means the data path is hybrid:
- class definitions come from seeded data,
- student snapshots may come from Supabase,
- analytics are computed on top of that.

We had to trace carefully where the displayed data actually came from.

### Mentra SDK / device behavior quirks
We also hit SDK/version and display-view quirks while testing on real glasses. Getting from "session connects" to "text reliably appears where we want it" was more finicky than just making the server boot.

## Accomplishments that we're proud of

- We successfully connected a live MentraOS MiniApp to our deployed ClassWatch backend.
- We got the Even Realities G1 glasses to display live class summary information.
- We built a clean, modular smart-glasses app architecture instead of stuffing everything into one file.
- We added voice-triggered screen navigation on top of the classroom data flow.
- We debugged webhook/webview/ngrok issues all the way down to working `/api/health`, `/webview`, and `/webhook` flows.
- We reused the existing ClassWatch API instead of duplicating business logic, which kept the system much more maintainable.

## What we learned

- Smart-glasses apps are as much about operational plumbing as they are about product design.
- The difference between a backend data URL and a wearable app webhook URL matters a lot.
- A tiny display forces much stronger UX discipline.
- Good architecture matters even in a hackathon — especially when integrating multiple systems under time pressure.
- ngrok logs are brutally honest and extremely useful.

## What's next for ClassWatch Live

We’d love to take this further by:
- improving the glasses-side UI to reduce repeated headings and optimize readability,
- surfacing more meaningful alerts in real time,
- enabling reliable flag resolution from the glasses,
- improving class selection and navigation,
- adding richer teacher workflows beyond passive monitoring,
- and connecting more fully to live classroom data instead of relying on seeded class definitions where fallback is still in use.

## Built with

- MentraOS
- Even Realities G1
- Bun
- TypeScript
- `@mentra/sdk`
- Next.js
- Supabase
- ngrok
- Express

## One-line project summary

ClassWatch Live turns classroom analytics into a real-time smart-glasses experience, helping teachers see alerts, summaries, and student progress without looking away from the room.
