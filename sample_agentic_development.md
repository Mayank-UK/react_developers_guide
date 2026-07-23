# sample_agentic_development.md
#
# This is a TEMPLATE showing a tighter way to structure this guide. It is not a
# replacement for the real file — copy the shape, fill with live status. The
# goal: every new chat gets the stable project facts in one place, invariants in
# one block, and per-task acceptance criteria — so nothing has to be re-derived.
#
# Improvements over the current file, in order of impact:
#   1. PROJECT SNAPSHOT up top — path, stack, commands, canonical file map.
#      (Removes the #1 source of re-discovery every chat.)
#   2. INVARIANTS block — the rules that apply to EVERY task, stated once,
#      prominently (architecture, design-system, reuse, verification).
#   3. CONVENTIONS — file naming, where shared vs local components live, the
#      no-[var(-- token rule, etc.
#   4. DECISION LOG — pasted AI dialogs collapse to one-line decisions + why.
#      (Keeps history without the bloat.)
#   5. BACKLOG — screens with a consistent status marker + a 3-bullet
#      Definition of Done each, so "done" is unambiguous.
#   6. Setup section is removed once complete (or moved into Decision Log) —
#      no lingering "Remove this" + all-✅ mixed signals.

- Project snapshot
    - Path: /Users/mak/Development/personal/react/react_developers_guide
    - Stack: React 19 + TypeScript + Vite + Tailwind v4 (CSS-variable tokens, @theme inline)
    - Routing: React Router data-router (createBrowserRouter + RouterProvider), shared RootLayout with <Outlet/>
    - Data: clean architecture — domain/ (models, repositories, usecases) + data/ (remote: http-client + remote-data-source + dtos + interceptors; local: app-database + daos) + core/ (config, container, error-handling, result, scenario)
    - Local DB: Dexie. HTTP: axios. Server cache: TanStack Query (available).
    - Commands: npm run dev | npm test | npm run build | npm run dev:staging | npm run build:staging
    - Modes: .env.{development,staging,production}
    - Canonical file map (AUTHORITATIVE — trust this over memory):
        - Routes & paths ......... src/ui/routing/routes.ts (RoutePaths), router in src/ui/routing/router.tsx
        - Shared layout .......... src/ui/components/root-layout.tsx
        - Design tokens .......... src/ui/design-system/tokens.css  | registered to utilities in src/index.css (@theme inline)
        - UI primitives .......... src/ui/components/{section-wrapper,content-group-wrapper,text-block,code-block,example,link_card,show-error,failure-snackbar}.tsx
        - Screens ................. src/ui/views/<area>/<screen>_view.tsx (+ _viewmodel, .spec)
        - Container/DI ........... src/core/container.ts
        - Error handling ......... src/core/error-handling/{exceptions,failures,guards}.ts

- Invariants (apply to EVERY task — read first)
    - Build UI only with the design system (tokens via Tailwind utilities). No raw hex/px when a token exists.
    - Token rule: every token is registered under its @theme inline namespace → write `text-body`, `font-mono`, `bg-primary`. If `[var(--` appears in JSX, a token is missing from @theme inline — register it instead.
    - Architecture: features flow view → viewmodel/hook → usecase → repository(interface) → repositoryImpl → remote/dtos/dao. Don't skip layers; don't put data logic in views.
    - Reuse: check existing components first. Used in one file → local function in that view. Used in ≥2 files → src/ui/components.
    - Consistency: when unsure, look at how an existing screen does it (e.g. tailwind_view.tsx) and match it.
    - Domain specificity: prefer the React-standard way; if it differs from Flutter, point it out and continue — don't force the Flutter pattern.
    - Verification (definition of done for any UI task):
        1. Every demonstrable concept ships a VISIBLE, interactive example (local fn wrapped in <Example/>), not only a CodeBlock.
        2. `npm run build` + `npm test` pass.
        3. Screenshot the rendered screen (dev server + playwright) and confirm new utilities actually generated in built CSS before marking done.

- Conventions
    - Files: snake_case (react_fundamentals_view.tsx). Co-locate a screen's spec next to it.
    - Section anatomy: SectionWrapper (title + accent bar) → ContentGroupWrapper (uppercase overline label) → TextBlock body + CodeBlock (collapsed by default) + Example (dashed "↳ Live example").
    - Status markers in this file: ✅ done · 🚧 in progress · ⏳ pending.

- Decision log (past decisions, compressed — replaces pasted AI dialogs)
    - Typography tokens: registered the full type scale under `--text-*` in @theme inline so font-size tokens are first-class utilities. No `[var(--` in JSX. (Why: arbitrary escapes are a code smell signalling an unregistered token.)
    - Layout tokens: `--content-max-width` exposed via `--container-content` → `max-w-content`; `--header-height` via a one-line `@utility h-header`. (Why: height has no token namespace in Tailwind v4.)
    - DI: lightweight service locator (src/core/container.ts). (Why: React has no get_it/injectable equivalent; flagged as deliberate divergence from Flutter.)
    - Web not mobile: dropped per-screen Scaffold/AppBar + responsive breakpoints; one shared RootLayout, browser handles back/scroll.

- Backlog (status · screen · DoD)
    - ⏳ Responsive layout screen — /ui/responsive
        - DoD: how responsiveness is done in React (Tailwind sm/md/lg + Bootstrap grid), with a live resize demo; spec; screenshot.
    - ⏳ Design system screen — /ui/design-system
        - DoD: walkthrough of tokens.css + @theme inline wiring, light/dark, live token swatches; spec; screenshot.
    - ⏳ Lifecycle screen — /lifecycle
        - DoD: every lifecycle method (class) + hook equivalent (effects/cleanup), each with a live demo; spec; screenshot.
    - ⏳ Navigation & routing screen — /navigation-routing
        - DoD: data-router, nested routes, handles, <Outlet/>, links vs useNavigate, live nav demo; spec; screenshot.
    - ⏳ State management section — /state-management
        - Hooks / Redux / Zustand / TanStack Query: each a working todo example. Note: reason per option whether it actually fits the use case (local UI state vs server cache vs global) and say so — don't imply all four are interchangeable.
    - ⏳ API handling — /api-handling: live fetch+display of posts through the full pipeline (usecase→repo→remote/dtos, cache fallback to local/dao); spec; screenshot.
    - ⏳ Database handling — /database-handling: explain Dexie dao layer (mostly already built in API pipeline); spec; screenshot.
    - ⏳ Exception handling — /exception-handling: explain exceptions→guards→failures (cause chain + severity), blocking vs non-blocking UI; spec; screenshot.
    - ⏳ Dependency management — /dependency-management: explain the service-locator container; spec; screenshot.
    - ⏳ Architecture screen — /architecture: how the code is layered for maintainability; spec; screenshot.
    - ⏳ Testing screen — /testing: Vitest + Testing Library patterns; spec; screenshot.
    - ⏳ Debugging screen — /debugging: React DevTools, error overlays, source maps; spec; screenshot.
    - ⏳ Environments screen — /environments: Vite modes + .env files + dev:staging/build:staging; spec; screenshot.
    - ⏳ Best practices screen — /best-practices: performance/memoization/code-splitting/accessibility; spec; screenshot.
    - ⏳ Drawer — navigation drawer (if still desired over the current top-bar nav).

# Handoff note for the next chat (optional — delete after use):
#   Start at the first ⏳ in Backlog. Read this section + one existing screen
#   (tailwind_view.tsx) as the template. Everything else you need is in the
#   Project snapshot + Invariants above.
