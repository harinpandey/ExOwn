# ExOwn Responsive & Accessibility Rollout

## Safety strategy

This work is isolated on `responsive-foundation-phase1`. Do not merge to `main` or promote to production until the preview has been checked at the agreed viewport sizes and core flows pass. Keep changes small and reversible. Do not change database schemas, authentication, payments, listing APIs, or production environment variables as part of responsive UI work.

## Goals

- Support narrow phones from 320 CSS px through tablets, laptops, and wide desktops.
- Preserve the same shared header geometry and section navigation across Buy, Rent, Exchange, PG & Roommates, Tickets, and LPU News at a given breakpoint.
- Keep one global search UI and bind its results/suggestions to the active experience.
- Keep section-specific layouts and actions; never add duplicate search bars or duplicate buttons.
- Avoid horizontal page overflow, clipped card content, and controls hidden behind sticky navigation.
- Improve keyboard, touch, screen-reader, contrast, and reduced-motion support without changing business logic.

## Responsive rules

Use fluid Grid/Flexbox and a capped page container. Treat the breakpoints below as test targets, not rigid device classes:

- 320, 360, 390, 430 CSS px: mobile
- 600, 768, 820, 1024 CSS px: large mobile/tablet
- 1280, 1366, 1440, 1920 CSS px: laptop/desktop

Grid density must depend on the available card width and content complexity:
- Buy/Rent/Exchange: usually 2 columns on mobile when readable; 1 column at very narrow widths if needed.
- Housing/Roommates: favor readable detail cards; 1–2 columns on mobile.
- Tickets: event/ticket-specific card content.
- LPU News: editorial layout, not product cards.

## Implementation phases

### Phase 0 — Baseline and preview protection
- Record the current main commit and verify the existing production URL before changes.
- Create a branch and draft PR; no direct production changes.
- Capture baseline screenshots for home, Rent search, Housing, Roommates, Tickets, and LPU News.
- Record current header heights, route-specific search scope, and existing mobile dock behavior.

### Phase 1 — Shared structural foundation
- Inspect shared layout, Navbar, ExperienceSwitcher, MobileNav, global CSS, and page containers.
- Fix only demonstrated layout issues: overflow, inconsistent header row sizing, safe-area padding, and content width.
- Keep existing colors, typography, routes, database calls, and listing behavior unchanged.
- Do not add a new mobile dock until existing MobileNav is mapped and duplicate actions are ruled out.

### Phase 2 — Section-scoped search
- Preserve one existing search interface.
- Confirm query and filters remain scoped to the active section.
- Suggestions must be grounded in real inventory or clearly labeled category navigation.
- Add a cross-section nudge (e.g. Room -> PG & Roommates) without mixing result types.

### Phase 3 — Cards and filters
- Use fluid listing grids with non-fixed content heights and stable image ratios.
- Keep product, housing, roommate, ticket, and news cards appropriate to their content.
- Desktop filters may use a rail; below tablet use an accessible drawer/bottom sheet.
- Preserve query and selected filters when opening/closing filters.

### Phase 4 — Accessibility and forms
- Keyboard operation and visible focus; semantic controls and labels.
- Aim for 44x44 CSS px touch targets where practical.
- WCAG 2.2 AA contrast; reduced motion; screen-reader status announcements.
- Test posting, image upload, chat, and offer flows at narrow widths.

### Phase 5 — Performance and PWA (separate review)
- Optimize responsive images, loading states, and layout stability.
- Consider PWA only after core navigation/search/posting are stable and offline behavior is explicitly designed.

## Acceptance gates

- No unintended horizontal page scrolling at 320px.
- No shared header/hero vertical jump when switching experiences at the same viewport.
- No duplicate search UI or duplicate primary action.
- Search never returns unrelated section types.
- Filters preserve query and experience.
- Listing text/buttons are not clipped at tested widths.
- Fixed navigation does not cover content, keyboard, or form actions; account for `env(safe-area-inset-bottom)`.
- Keyboard, reduced-motion, focus, and contrast checks pass.
- Check preview deployment and production separately; never report production as fixed based only on a branch preview.

## Regression workflow

For each phase: change one small surface -> run type/lint/build checks available -> inspect preview at 320, 390, 768, 1024, 1366, and 1920 px -> test the core routes -> request review -> merge only after explicit approval.
