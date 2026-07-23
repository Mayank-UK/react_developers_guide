# Architecture

This app is a **teaching artifact**: it is itself a small, production-shaped
React app whose job is to demonstrate how a React codebase can be structured.
It mirrors a sibling Flutter guide concept-for-concept. The hard part —
layering, error handling, dependency wiring — is done the way it is on purpose,
and this document records *why*.

## Layering

```
domain/        ← pure business models + contracts. No framework, no I/O.
  models/         value objects (Post, Link)
  repositories/   interfaces (PostRepository) — the seam data implements
  usecases/       application logic (GetPostsUseCase)

data/          ← implements the domain contracts. Talks to the outside world.
  remote/         HTTP (axios) + DTOs + interceptors
  local/          IndexedDB (Dexie) + DAOs
  repositories/   PostRepositoryImpl — orchestrates remote + local, offline-first
  fake/           in-memory fakes for dev + tests

core/          ← cross-cutting infra shared by every layer.
  result.ts       Result<T> — the domain return type for fallible work
  error-handling/ AppException (data) → Failure (domain) pipeline
  container.ts    service locator (hand-rolled, getIt-equivalent)
  config/         AppConfig from Vite env vars
  scenario/       dev-only failure-injection knobs

ui/            ← presentation. Reads domain + core, never data internals.
  routing/        React Router data router (route table as data)
  components/     shared presentational primitives
  hooks/          useReducer state machines, media queries, snackbar
  design-system/  tokens (CSS vars) → Tailwind via @theme inline
  views/          one folder per topic screen; hub → sub-screens
```

**Invariant:** dependencies point inward/downward. `domain` depends on nothing
but `core/result`. `data` depends on `domain` + `core`. `ui` depends on
`domain` + `core`, and on `data` *only* through the container. A view never
imports a DTO, a DAO, or axios.

## The error pipeline

This is the part most teams get wrong, so it is the spine of the app.

```
engine error (axios / IndexedDB / JSON)
   │  guardedApiCall / DAO catch
   ▼
AppException   (data-layer only; typed, chained via .cause)
   │  mapExceptionToFailure   (recursive over the cause chain)
   ▼
Failure        (domain/presentation; kind + severity + user message)
   │  safeRepositoryCall       (with optional per-error fallbacks)
   ▼
Result<T>      (Success<T, warning?> | Failed)  — the value the UI consumes
```

- **Two stages, not one.** `AppException` is technical (what broke: network,
  server, db). `Failure` is semantic (what to show the user, how loudly). They
  are decoupled so the UI reasons only about `Failure.kind`/`severity` and
  never imports HTTP concepts.
- **Causality is preserved.** Both `AppException.cause` and `Failure.cause`
  chain, so a compound failure ("served stale cache *because* the network
  failed *because* the request timed out") reconstructs the whole story for
  logs (`Failure.chain`).
- **Severity drives presentation.** Critical → full-screen `<ShowError/>`;
  Warning/Info → non-blocking snackbar. `Result.Success` may carry a
  non-blocking `warning` (stale data + network failure in one value) — the
  offline-first pattern.

## Key decisions

- **`Result<T>` instead of exceptions across the domain boundary.** Forces every
  fallible call site to acknowledge failure at the type level; no forgotten
  `try/catch`. Exceptions still exist *inside* `data/` (typed `AppException`s)
  but are converted to `Result` before crossing into the domain.
- **Const-object + literal union instead of `enum`.** The project compiles with
  `erasableSyntaxOnly`; enums aren't erasable. `const Foo = {...} as const;
  type Foo = (typeof Foo)[keyof typeof Foo]` gives runtime values + a literal
  union with no syntax that survives compilation.
- **Hand-rolled service locator (`container.ts`).** React has no standard DI
  (unlike Flutter's `get_it` + codegen). A small explicit registry keeps wiring
  in one debuggable place and lets screens resolve dependencies without
  prop-drilling or a global per service. Dev builds swap in fakes via the same
  knob.
- **Token-driven design system.** CSS custom properties are the single source
  of truth; `@theme inline` bridges them to Tailwind utilities (`bg-surface`,
  `text-on-surface-variant`). Dark mode is a `[data-theme]` attribute flip.
- **Strict TypeScript, type-aware lint.** `strict` + `noUncheckedIndexedAccess`
  and `typescript-eslint` `strictTypeChecked` are enforced; only the two rules
  that conflict with idiomatic React / teaching prose are relaxed (with
  comments explaining why).

## Testing posture

Specs render the **real** provider + router + DI tree (integration-style smoke
tests) rather than a mock shell, plus unit tests for the pure core (`guards`,
`result`, `config`, `container`). Shared setup (matchMedia polyfill, container
init) lives in `src/test/setup.ts` so individual specs stay focused on behavior.
