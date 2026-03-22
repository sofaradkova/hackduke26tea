Agent Workflow Rules

These rules are auto-loaded every session. Follow them exactly.

## 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

## 2. Subagent Strategy
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution
- Keep the main context window clean

## 3. Task Management
- **Plan First**: Write plan to `tasks/todo.md` with checkable items
- **Verify Plan**: Check in with user before starting implementation
- **Track Progress**: Mark items complete as you go
- **Explain Changes**: High-level summary at each step
- **Document Results**: Add review notes to `tasks/todo.md`
- **Capture Lessons**: Update `tasks/lessons.md` after corrections

## 4. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant context

## 5. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

## 6. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

## 7. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests → then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Core Principles
- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

---

## Project Conventions

### Monorepo Structure
```
nod/
├── apps/web/                 # Next.js 15 app
├── packages/
│   ├── db/                   # Supabase client, schema, migrations, types
│   ├── inngest/              # Event definitions, workflow functions
│   ├── ai/                   # Claude prompts, personality analysis, brief generation
│   ├── scraping/             # ScrapFly client, LinkedIn parser, web search
│   ├── calendar/             # Google + Outlook API clients, sync logic
│   └── shared/               # Types, utils, constants
├── tasks/                    # todo.md, lessons.md
```

### Modularity — Hard Rule
The frontend (`apps/web/`) is built externally on v0 and cloned in. This means:
- **Packages NEVER import from `apps/web/`** — dependency flows one way: app → packages
- **API routes are the contract** — frontend talks to backend only through API routes in `apps/web/app/api/`
- **Shared types are the interface** — `packages/shared` defines request/response types that both frontend and backend use
- **Packages must work without the frontend** — testable and usable independently
- When building backend packages, pretend the frontend doesn't exist. Expose clean functions + types.

### File Organization
- Feature code lives in the appropriate package, not in the app
- App routes are thin — they call package functions
- Shared types go in `packages/shared`, not duplicated across packages
- Each package has its own `tsconfig.json` extending a root config

### Naming Conventions
- Files: `kebab-case.ts` (e.g., `calendar-sync.ts`)
- React components: `PascalCase.tsx` (e.g., `BriefCard.tsx`)
- Inngest functions: `kebab-case` IDs (e.g., `research-linkedin`)
- Database: `snake_case` tables and columns
- Environment variables: `SCREAMING_SNAKE_CASE`

### Commits
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`
- Keep commits focused — one logical change per commit
- Never commit secrets or `.env` files

### Environment Variables
- All secrets in `.env.local` (gitignored)
- Document required vars in `.env.example`
- Prefix client-side vars with `NEXT_PUBLIC_`
- Required services: Supabase, ScrapFly, Anthropic, Google OAuth, Upstash Redis

### Key Tech Decisions
- **TypeScript strict mode** everywhere
- **Zod** for runtime validation at system boundaries
- **JSONB** for brief content (format evolves rapidly)
- **Inngest** for all async workflows (not cron jobs or raw queues)
- **No BERT** — Claude handles all intelligence (personality, analysis, generation)
- **No Nylas** — direct Google Calendar API + Microsoft Graph API
