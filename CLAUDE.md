# ClassWatch — Teacher Dashboard PRD
**Version:** 1.0 — Draft
**Date:** March 21, 2026
**Status:** In Review
**Framework:** Next.js + Material 3
**Author:** Product Team

---

## Table of Contents
1. [Introduction & Overview](#1-introduction--overview)
2. [Goals & Objectives](#2-goals--objectives)
3. [Target Audience & User Personas](#3-target-audience--user-personas)
4. [User Stories & Use Cases](#4-user-stories--use-cases)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Design Considerations](#7-design-considerations)
8. [Success Metrics](#8-success-metrics)
9. [Open Questions & Future Considerations](#9-open-questions--future-considerations)

---

## 1. Introduction & Overview

ClassWatch is an AI-powered classroom monitoring platform designed to help teachers support students in real time during problem-solving sessions.

This PRD covers the **Teacher Dashboard** — a Next.js web application that gives teachers live visibility into each student's work, surfaces AI-generated alerts when a student is struggling, and provides class-wide analytics to inform in-the-moment instruction. The Teacher Dashboard will be built against seeded mock data and later rewired to a live student API.

### 1.1 Background & Problem Statement

In a typical classroom setting, a teacher has limited visibility into each student's problem-solving progress simultaneously. Students who are struggling may go unnoticed until they fall significantly behind, while teachers lack the data needed to decide when to pause and address a concept with the whole class.

ClassWatch solves this by using AI to monitor each student's whiteboard in near real-time, flagging struggling students immediately so teachers can intervene, and surfacing aggregated patterns to guide whole-class instruction.

---

## 2. Goals & Objectives

### 2.1 Primary Goals

- Enable teachers to actively triage student struggles in real time during a live class session.
- Surface AI-generated alerts at the moment a student goes off track, so the teacher can physically walk over and help.
- Provide class-wide analytics so teachers can identify when to pause and reteach a concept to the whole group.
- Build a clean, wirable architecture so that the mock data layer can be swapped for a live API with minimal rework.

### 2.2 SMART Success Goals

| Goal | Metric | Target |
|---|---|---|
| Alert visibility | Time from AI flag to alert appearing in UI | < 1 second (mock), < 2s (live) |
| Dashboard legibility | Teacher identifies a flagged student at a glance | < 3 seconds per scan |
| Thumbnail freshness | Student card thumbnail refresh interval | Every 5–10 seconds |
| Panel load time | Notification stream renders on dashboard load | < 500ms |
| Usability | Navigate from class list to student detail without training | 0 support calls needed |

### 2.3 Non-Goals (MVP)

- No teacher authentication or login system.
- No multi-teacher shared dashboards.
- No persistent data storage or session history.

---

## 3. Target Audience & User Personas

### 3.1 Primary Persona — The Classroom Teacher

| Attribute | Detail |
|---|---|
| Name | Ms. Rivera *(representative persona)* |
| Role | High school or university-level instructor |
| Tech Comfort | Moderate — comfortable with web apps, not a developer |
| Device | Laptop or desktop browser during class |
| Primary Need | Know immediately which students are struggling so she can walk over and help |
| Secondary Need | See whether the whole class is confused, to decide whether to reteach |
| Pain Point | Currently must walk around to check each student's work individually |
| Usage Context | Active, high-stress environment — standing, moving, making rapid decisions |

### 3.2 Usage Context & Constraints

- The teacher is in **active triage mode** — she responds to every alert, not just glances passively.
- The dashboard is used during a live class session, typically 45–90 minutes.
- The teacher may be moving around the room; the UI must be readable at a glance from a distance.
- Single teacher per session for MVP — no shared or multi-seat access required.
- No login required for MVP — the app opens directly to the class list.

---

## 4. User Stories & Use Cases

### 4.1 Core User Stories

| # | As a teacher... | I want to... | So that... |
|---|---|---|---|
| US-1 | opening the app | See all my classes on a home screen | I can quickly select the class I'm currently teaching |
| US-2 | in a live session | See a thumbnail of every student's whiteboard in a card grid | I have ambient awareness of all students at once |
| US-3 | in a live session | See a student's card turn red when they are flagged by AI | I know immediately who needs help without reading every card |
| US-4 | receiving an alert | See a notification appear in the right panel with student name and flag reason | I have a running log of who has been flagged this session |
| US-5 | investigating a student | Click on any student card to open a full detail modal | I can see their whiteboard, AI flag reason, confusion highlights, and progress |
| US-6 | mid-session | Toggle to the analytics tab to see class-wide stats | I can decide whether to pause and reteach a concept to the whole class |
| US-7 | needing focus | Collapse the right notification panel | The card grid takes up more screen space on smaller displays |

### 4.2 Key Use Case Flow — Responding to an AI Alert

1. Teacher opens app and lands on the **Class List** screen.
2. Teacher selects the active class and enters the **Live Class Dashboard**.
3. Student card grid loads with mock thumbnails; right panel shows the notification stream.
4. AI detects a student (e.g., Jamie) is off track → Jamie's card turns red with a warning message.
5. A new entry appears at the top of the notification panel: *"Jamie Chen — off track: wrong formula applied."*
6. Teacher clicks Jamie's card → **Student Detail Modal** opens.
7. Teacher reviews large whiteboard thumbnail, AI flag reason, confusion highlights, and progress indicator.
8. Teacher closes modal and walks over to help Jamie in person.
9. Teacher optionally toggles to the **Analytics Tab** to check if other students share the same confusion.

---

## 5. Functional Requirements

### 5.1 Screen 1 — Class List (Home Screen)

| ID | Requirement | Description | Priority |
|---|---|---|---|
| FR-1.1 | Class cards | Display all teacher's classes as cards with class name, subject, and student count. | Must Have |
| FR-1.2 | Class navigation | Clicking a class card navigates to the Live Class Dashboard for that class. | Must Have |
| FR-1.3 | Mock data | Class list is populated from seeded mock data (3–5 classes). | Must Have |
| FR-1.4 | No auth | App opens directly to Class List; no login screen required for MVP. | Must Have |

### 5.2 Screen 2 — Live Class Dashboard

| ID | Requirement | Description | Priority |
|---|---|---|---|
| FR-2.1 | Student card grid | Display all students in the selected class as cards in a responsive grid layout. | Must Have |
| FR-2.2 | Card content | Each card shows: student name, whiteboard thumbnail, and current AI status (OK or flagged). | Must Have |
| FR-2.3 | Thumbnail refresh | Card thumbnails update every 5–10 seconds from mock data. | Must Have |
| FR-2.4 | AI flag — red state | Flagged student cards turn red and display a short warning message (e.g., *"Off track: wrong approach"*). | Must Have |
| FR-2.5 | Notification panel | A persistent right-side panel displays a chronological stream of AI alert notifications for the current session. | Must Have |
| FR-2.6 | Panel collapse | The right notification panel can be collapsed and re-expanded to save screen space. | Must Have |
| FR-2.7 | Analytics tab | A tab or toggle switches between the Student Grid view and the Aggregated Analytics view. | Must Have |
| FR-2.8 | Back navigation | Teacher can navigate back to the Class List from the dashboard. | Must Have |

### 5.3 Screen 3 — Student Detail Modal

| ID | Requirement | Description | Priority |
|---|---|---|---|
| FR-3.1 | Modal trigger | Clicking any student card opens a modal overlay on top of the dashboard. | Must Have |
| FR-3.2 | Large thumbnail | Modal displays a large, current screenshot of the student's whiteboard. | Must Have |
| FR-3.3 | AI flag reason | If flagged, display the full AI flag reason (e.g., *"Off track: incorrect formula applied in step 2"*). | Must Have |
| FR-3.4 | Confusion highlights | Display any areas the student has self-highlighted as confusing or uncertain. | Must Have |
| FR-3.5 | Timestamp | Show the timestamp of the most recent AI check. | Must Have |
| FR-3.6 | Problem set | Show the name/title of the problem set the student is currently working on. | Must Have |
| FR-3.7 | Progress indicator | Show a visual indicator of how far through the problem the student has progressed. | Must Have |
| FR-3.8 | Modal close | Modal can be closed via an X button or by clicking outside the modal. | Must Have |

### 5.4 Screen 4 — Aggregated Analytics View

| ID | Requirement | Description | Priority |
|---|---|---|---|
| FR-4.1 | Struggle percentage | Display the percentage of students currently flagged as struggling. | Must Have |
| FR-4.2 | Common problem | Display the most common problem or question causing difficulty across flagged students. | Must Have |
| FR-4.3 | Completion rate | Display what percentage of students have completed the current problem. | Must Have |
| FR-4.4 | Mock data | All analytics values are derived from the same seeded mock data as the student cards. | Must Have |
| FR-4.5 | Refresh cadence | Analytics values update in sync with the student card refresh (every 5–10 seconds). | Should Have |

### 5.5 Notification Panel — Detailed Requirements

| ID | Requirement | Description | Priority |
|---|---|---|---|
| FR-5.1 | Entry content | Each notification entry shows: student name, flag reason, and timestamp. | Must Have |
| FR-5.2 | Chronological order | Newest notifications appear at the top of the panel. | Must Have |
| FR-5.3 | Persistence | Notifications persist for the duration of the session. | Must Have |
| FR-5.4 | Clickable entries | Clicking a notification entry opens that student's detail modal. | Should Have |
| FR-5.5 | State persistence | Collapsed/expanded panel state persists during navigation within the session. | Should Have |

### 5.6 Mock Data Layer

| ID | Requirement | Description | Priority |
|---|---|---|---|
| FR-6.1 | Seeded classes | Mock data includes 3–5 classes with names, subjects, and student rosters. | Must Have |
| FR-6.2 | Seeded students | Each class has 10–25 mock students with names, avatar placeholders, and thumbnail images. | Must Have |
| FR-6.3 | Simulated flags | Mock data includes pre-defined AI flag states that simulate mid-session flagging. | Must Have |
| FR-6.4 | Abstracted layer | All mock data is behind a service interface so it can be replaced by a real API without changing component logic. | Must Have |

---

## 6. Non-Functional Requirements

### 6.1 Performance

- Dashboard initial load time: **< 2 seconds** on a standard broadband connection.
- Student card thumbnail refresh: every 5–10 seconds with no perceptible UI jank or layout shift.
- Notification panel entry render time: **< 500ms** from alert trigger.
- Student detail modal open time: **< 300ms**.

### 6.2 Usability

- The UI must be learnable without training — a new user should navigate from class list to student detail within 60 seconds.
- Flagged students must be immediately visually distinct from non-flagged students at a glance (high contrast red state).
- The notification panel must be readable at arm's length on a 13-inch laptop screen at standard resolution.
- All interactive elements must have clear affordances (hover states, cursor changes).

### 6.3 Responsiveness & Browser Support

- Optimized for **desktop/laptop browsers (1280px+ width)** as the primary use case.
- Must be functional on modern evergreen browsers: Chrome, Firefox, Safari, Edge.
- Tablet support (landscape iPad) is a nice-to-have for MVP, not a hard requirement.

### 6.4 Accessibility

- Minimum **WCAG 2.1 AA** compliance for color contrast on all text elements.
- All interactive elements must be keyboard navigable.
- Alert states (red card) must not rely on color alone — include a text or icon indicator.

### 6.5 Security (MVP)

- No authentication required for MVP.
- No real student data is stored or transmitted — all data is seeded mock data.
- No external API calls involving personal information for MVP.

### 6.6 Maintainability & Architecture

- Mock data layer must be abstracted behind a service interface for clean API swap-out.
- Component structure should follow **Next.js App Router** conventions.
- **Material 3** components used throughout — no custom component library mixing.
- **TypeScript interfaces** must be defined for `Student`, `Class`, `Notification`, and `AIFlag` objects to ensure the real API can be wired without component changes.

---

## 7. Design Considerations

### 7.1 Design Reference

> **Dribbble Reference:** The provided Dribbble reference (`your.education` dashboard) establishes the visual language for the Teacher Dashboard. Key elements to carry over: left icon-only navigation sidebar, warm off-white/cream background, soft pastel card colors, rounded card corners, right-side persistent panel, bold category labels on cards, and clean sans-serif typography with large display headings.

### 7.2 Component Library

- **Material 3 (Material Design 3)** is the designated component library.
- Use Material 3 tokens for color, elevation, shape, and typography to maintain consistency.
- The warm cream/pastel palette from the Dribbble reference should be mapped to Material 3 custom color schemes — do not use the default blue/purple Material 3 defaults.

### 7.3 Layout Structure

| Zone | Contents |
|---|---|
| Left sidebar *(icon-only, narrow)* | App logo, navigation icons for: Home (Class List), current Class, Settings |
| Main content area | Student card grid (default) OR Analytics view (toggled) |
| Right panel *(collapsible)* | Live notification/alert stream, teacher profile summary at top |
| Top bar | Class name, tab toggle (Students \| Analytics), panel collapse button |

### 7.4 Card States

| State | Visual Treatment |
|---|---|
| Default / OK | Soft pastel background (cream/white), student name, thumbnail, subtle border |
| AI Flagged / Struggling | Red background highlight, warning icon, short warning message below student name |
| Loading / No data | Skeleton placeholder state while thumbnail loads |

### 7.5 Typography & Color Palette

- **Primary background:** Warm off-white (`#FAF9F6` or equivalent).
- **Sidebar background:** Slightly darker warm tone.
- **Card accent colors:** Soft pastels mapped per class/subject (coral, sage, lavender, amber).
- **Alert red:** High-contrast red that signals urgency without being alarming.
- **Font:** Clean sans-serif (Inter or Roboto via Material 3 defaults).
- **Display headings:** Bold and large — the class name is the dominant heading on the dashboard.

### 7.6 Mockup Status

Formal wireframes for the Teacher Dashboard have not yet been created and should be produced before development begins. The Dribbble reference image provided during PRD elicitation is the primary visual reference in the interim.

---

## 8. Success Metrics

| Metric | How to Measure | Target |
|---|---|---|
| Alert-to-UI latency | Time from mock flag trigger to card turning red and notification appearing | < 1 second |
| Thumbnail refresh reliability | % of refresh cycles completing without error or blank state | > 99% |
| Time to spot flagged student | Usability test: new user locates a flagged student from dashboard load | < 3 seconds |
| Time to read student detail | Usability test: open and read student detail modal | < 10 seconds total |
| Navigation completion | Usability test: Class → Dashboard → Detail → Analytics flow unaided | 100% task completion |
| Dashboard load time | Lighthouse measurement of initial page load | < 2 seconds |
| Data layer swap readiness | Engineering review: mock replaced by real API by changing only the service file | Yes — single file swap |

---

## 9. Open Questions & Future Considerations

### 9.1 Open Questions — Require Decisions Before Development

| # | Question | Notes |
|---|---|---|
| OQ-1 | What is the exact data contract for the student API? | Define TypeScript interfaces now so the mock layer mirrors the real shape: student state, AI flag payload, thumbnail URL/blob format. |
| OQ-2 | How are whiteboard thumbnails transmitted? | Will the real API return image URLs, base64 blobs, or a WebSocket stream? This affects mock data design. |
| OQ-3 | What is the AI flag payload structure? | Agree on flag reason format (free text vs. enum), confidence score inclusion, and whether multiple flags can be active simultaneously. |
| OQ-4 | What triggers an alert to resolve? | Does a flagged card return to default when AI clears it, or only on teacher action? |
| OQ-5 | How many students per class? | Affects card grid layout. Optimise for 10–25 for MVP; define breakpoint layouts for larger classes. |
| OQ-6 | Is there a session concept? | Does the teacher start/end a class session, or is the dashboard always live? Impacts notification persistence logic. |

### 9.2 Future Considerations (Post-MVP)

- **Authentication:** Implement real teacher login (NextAuth or Clerk) with per-teacher class rosters.
- **Multi-teacher support:** Allow multiple teachers to share a dashboard view for co-taught classes.
- **Session history:** Persist session data so teachers can review class performance after the session ends.
- **Problem set management:** Allow teachers to upload and assign problem sets (PDF) directly from the Teacher Dashboard.
- **Notification filtering:** Allow teachers to filter/sort the notification panel by time, student, or flag type.
- **Mobile teacher view:** Lightweight mobile view for teachers who want to monitor from a phone while walking around.

