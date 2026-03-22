# `chasi-stats-preview.html` — Description

This file is a **single-page static HTML preview** for a Chasi-branded stats/marketing section. It combines HTML and inline CSS to present an animated landing-style layout with a navbar, hero headline, and four stat cards.

## What it contains

- **Navigation bar**
  - Brand/logo block (`Chasi`) with a custom geometric icon
  - Links: `Home`, `Solutions` (with dropdown chevron), `About Us`, `Careers`
- **Hero section**
  - Main message:
    - “Your *best people* are drowning”
    - “in the least valuable work”
  - Uses staggered word-level entrance animations
- **Stats grid (2x2 desktop)**
  - Four cards highlighting operational/sales inefficiencies:
    1. 2+ hours lost per rep per day
    2. Slow response times hurting deals
    3. 10–20% of quotes dying without follow-up
    4. 40% of clients receiving fewer than one touch

## Visual style

- Clean, modern layout with a light gray page background (`#fafafa`)
- White cards with soft border/shadow
- Accent color: **orange** (`#e85a17`) used in icons and highlight text
- System font stack for a neutral SaaS look
- Hero emphasis via italic serif styling for the phrase “best people”

## Animation behavior

- Navbar slides in from top (`slideDown`)
- Nav links fade in one-by-one (`fadeIn`)
- Hero words animate upward with staggered delays (`fadeUp`)
- Cards reveal sequentially with translate/scale (`cardReveal`)
- Hover effects:
  - Card lift + stronger shadow
  - Icon box scales/rotates slightly
- Two decorative background gradient particles float continuously (`float`)

## Responsive behavior

At widths under `768px`:

- Stats grid switches from 2 columns to 1 column
- Navbar stacks vertically
- Nav link spacing is reduced

## Technical notes

- Entire implementation is in one file (HTML + CSS; no JavaScript)
- Uses inline SVG icons for each stat card
- Suitable as a visual prototype or quick concept preview rather than a production componentized implementation
