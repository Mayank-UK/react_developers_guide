- Requirements
    - I want to implement a react project following code architecture similar to Development/personal/flutter/flutter_developers_guide, separating ui, domain, data layer, error handling, state management, etc
    - Although I want similar implementation, but I prefer domain specificity, for example if something is done in react in standard way that is different from this, then better point it out and continue rather than just forcing it
    - As you keep getting done with the tasks, you can replace "Pending" with "✅"

- One time setup for application architecture (Remove this after implementation)
    - Most standard and optimium (for react) navigation and routing implementation ✅ (React Router v7 data router — createBrowserRouter + RouterProvider in src/app/app.tsx; a single shared RootLayout with <Outlet/> as parent route, per-page titles from route handle.title via useRouteTitle; paths in src/ui/routes.ts)
    - Most standard and optimum (for react) Full clean architecture pipeline implementation from fetching posts usecase, repository, dto's, dao's, remote, local, etc; check flutter developers guide for reference ✅ (domain/ + data/ + GetPostsUseCase + PostRepositoryImpl with remote→cache fallback; remote split into http-client + post-remote-data-source + dtos; local split into app-database + daos/post-dao — see src/domain, src/data)
    - Dependency management setup implementation ✅ (lightweight service locator in src/app/container.ts — React has no get_it/injectable standard; flagged in plan)
    - Exception handling implementation, take reference from flutter_developers_guide ✅
        - How it chains multiple exceptions, how it show in multiple ways like blocking, non-blocking, etc based on exception severity (src/core/error-handling: exceptions → guards → failures with chained cause + severity; src/ui/components/show-error.tsx blocking, src/ui/components/failure-snackbar.tsx non-blocking)
    - Design system implementation ✅
        - Implement the design system in the most standard way of react (Tailwind v4 + CSS-variable tokens, light/dark via ThemeProvider — src/ui/design-system)
        - Look for reference implementation in flutter_developers_guide
        - This has to be used through out the UI implementation
    - Web vs mobile cleanup ✅ (this is a web app, not a mobile app — dropped mobile-only patterns: removed responsive/useResponsive breakpoints, replaced the per-screen Flutter PageScaffold/Scaffold+AppBar with a single shared RootLayout; browser provides back/scroll)
    - Environments/flavours setup ✅ (Vite modes — .env.development / .env.staging / .env.production + dev:staging / build:staging scripts; differs from Flutter's separate main\_\*.dart entrypoints)
    - Testing infrastructure ✅ (Vitest + jsdom + Testing Library seeded; npm test; smoke + error-pipeline tests in src/ui/views/home.spec.tsx, src/core/error-handling/guards.spec.ts)

- Visual design / UX quality (polish pass) ✅
    - Palette overhauled: neutral slate base + a single indigo accent (#4f46e5 light / #818cf8 dark), replacing the busy Material purple/teal. Accent used sparingly (links, focus, hover, small marks). Tokens in src/ui/design-system/tokens.css (names unchanged, values swapped).
    - 3-tier layering for clear differentiation: gray canvas (bg-surface-tint page) → white section cards (bg-surface + border + shadow-button-card) → gray wells for code & examples (bg-surface-variant; CodeBlock solid border, Example dashed border with "↳ Live example" overline). New primitive src/ui/components/example.tsx.
    - Code is collapsible: CodeBlock defaults to collapsed (▸/▾ toggle + copy always visible) — pages must never become a wall of code.
    - Hierarchy + spacing: section title (accent bar + semibold) → ContentGroupWrapper overline label (uppercase, muted) → TextBlock body (leading-[1.7], on-surface-variant). Sections mb-lg apart; quiet header (surface + hairline border, accent only on logo); home rebuilt as clean white cards on gray canvas.
    - RULE for all screens going forward: every demonstrable concept ships a VISIBLE, interactive example (local function wrapped in <Example/>), not just a CodeBlock description; and verify the rendered screen by screenshotting (dev server + `playwright`) before marking done.

- A fix related to design system implementation:
    - I asked another AI that in my coding, for text, fonts, etc my css classes are a little complicated, and replied like below, I am not sure if that way if fine or not, you can decide:
    - Question asked with AI
        - I also see that text, etc are used like this in my css, not sure if it's fine or something not done properly
        - font-[var(--font-mono)] text-[var(--text-caption)]
    - Answer by AI
        - The Problem
            - Both of those are arbitrary value escapes — Tailwind's fallback syntax for unregistered tokens. They work, but they're a code smell in this context. They signal that your @theme inline block is incomplete.
        - Here's the breakdown:
            - font-[var(--font-mono)] — unnecessary. You already register --font-mono in @theme inline, so Tailwind already generates font-mono. You're doing extra work to get the same result.
            - text-[var(--text-caption)] — broken by design. --text-caption is a font-size token from your type scale, but it's never registered under the --text-\* namespace in @theme inline, so Tailwind never generates text-caption. The arbitrary syntax works around that gap, but it's hiding a missing registration.
        - Fix: Register your typography scale
            - Add your type scale tokens to @theme inline under the --text-_ namespace — that's what Tailwind v4 uses to generate text-_ size utilities:
                - @theme inline {
                  /_ --- existing tokens --- _/
                  --font-display: var(--font-display);
                  --font-body: var(--font-body);
                  --font-mono: var(--font-mono);
                  /_ --- type scale (drives text-_ size utilities) --- \*/
                  --text-display: var(--text-display);
                  --text-headline: var(--text-headline);
                  --text-title: var(--text-title);
                  --text-body: var(--text-body);
                  --text-label: var(--text-label);
                  --text-caption: var(--text-caption);
                  }
            - Now write it cleanly:
                - // Before — leaking implementation details into JSX
                  <code className="font-[var(--font-mono)] text-[var(--text-caption)]" />

                - // After — tokens are first-class Tailwind utilities
                  <code className="font-mono text-caption" />

            - The mental model
                - Think of @theme inline as your contract between tokens.css and Tailwind. Every token you want usable as a utility class needs an explicit entry there. Arbitrary value syntax [var(--x)] should only appear in JSX when you genuinely need a one-off value with no design token behind it — not as a workaround for missing registrations.
                - A useful audit rule: if [var(-- appears in your JSX, it almost always means a token is missing from @theme inline.

    - If that's the case, then we will have to fix it in our project

- Generic instructions:
    - You have to build UI using the design system implemented in the application
    - You have to follow the proper architecture that is followed in the application, for example, having use cases, repositories, repositoriesImpl, remote, DTOs, local, DAOs, exception handling, and so on
    - You have to check if existing components can be reused instead of creating new ones. If a component is to be used in a single file, then better to make it a function inside that view. If a component is to be used in multiple files, then create it inside the global ui/components
    - If feeling confused about how to do things, you are free to check how it's done in other parts of this app; the goal is to maintain consistency throughout the app

- Step by step instructions for screens
    - React fundamentals screen ✅ (single consolidated screen — src/ui/views/react-fundamentals.tsx; sections for mental model, JSX, components & props, useState, events, conditional rendering, lists & keys, composition; live interactive demos as local functions using design-system primitives; smoke + interaction spec in react-fundamentals.spec.tsx)
        - Include everything fundamental to react
        - Put all react fundamentals in a single screen instead of separate screens like flutter
    - Typescript/Javascript fundamentals screen ✅ (single consolidated screen — src/ui/views/ts-js-fundamentals.tsx; sections: JS vs TS, variables (let/const/var), primitives, type annotations & inference, objects/arrays/tuples, functions, control flow, operators (spread/destructure/nullish/optional-chaining), classes & interfaces, generics, async/await, modules, exceptions, utility types; live counter demo + smoke/interaction spec)
        - Include all things like variables, consts, lool, conditions, etc
        - Put all typescript/javascript fundamentals in a single screen instead of separate screens like flutter
    - UI section ✅ (/ui hub — src/ui/views/ui-hub.tsx; Links grid to the layout/styling/interaction sub-screens)
        - UI manipulation section
            - Layout and structure screen ✅ (Page structure — src/ui/views/layout-structure.tsx; component-tree → DOM, shared RootLayout+Outlet pattern, semantic HTML, box model, Flexbox, CSS Grid, the app's layout primitives; live demos for box model / flex direction / grid columns + spec)
            - Styling
                - CSS screen ✅ (src/ui/views/css.tsx — how CSS works, selectors, the cascade & specificity, units (px/%/rem/em/vh), pseudo-classes, custom properties/CSS variables with live demos + spec)
                - Bootstrap screen ✅ (src/ui/views/bootstrap.tsx — what Bootstrap is, the 12-column grid (live), ready-made components, utilities, vs Tailwind + spec)
                - Tailwind screen ✅ (src/ui/views/tailwind.tsx — utility-first model, how this app wires tokens via @theme inline, everyday utilities, responsive/dark variants, trade-offs + spec)
            - Interactive behaviours screen ✅ (src/ui/views/interactive.tsx — interactive states, hover/focus/focus-visible, transitions (live), @keyframes animations (live), accessibility incl. prefers-reduced-motion + spec)
                - Like click, hover, focus, etc
        - Responsive layout screen
            - How responsiveness is implemented in react in standard way like using bootstrap, tailwind, etc
        - Design system screen
    - Lifecyle screen (Pending)
        - Show how each and every lifecyle method is used
    - Navigation and routing screen (Pending)
    - State management section (Pending)
        - I don't know in detail how these state managment solutions are used, but I know that they are popular, maybe they are not even used for what I am asking, I will let you reason and inform me
        - Hooks screen
            - Implement a simple todo example
        - Redux screen
            - Implement a simple todo example
        - Zustand screen
            - Implement a simple todo example
        - TanStack query screen
            - Implement a simple todo example
    - API handling (Pending)
        - Implement a simple fetching of posts and displaying like done in flutter_developers_guide with full pipeline like usecase, repository, etc if it's done in react this way
        - Implement API handling screen where an example is implemented to fetch and show posts explaining how it's done
    - Database handling (Pending)
        - Although I assume that database handling is already implemented in the previous step while implementing API handling pipeline
        - Implement Database handling screen explaining how it's done
    - Exception handling (Pending)
        - Although I assume it's also done during the API handling
        - Implement Exception handling screen explaining how it's done
    - Dependency management (Pending)
        - Implement dependency management screen explaining how it's done in react
    - Architecture screen (Pending)
        - Explaining how code is architectured in react in most maintainale way
    - Testing (Pending)
        - Implement tests ✅ (Vitest infra + smoke/error-pipeline tests in place; expand per-layer coverage as each screen lands)
        - Impelement testing screen explaining how it's done in react (Pending)
    - Debugging screen (Pending)
        - Explaining how debugging is done in react
    - Environments/Flavours for dev, staging, and prod (Pending)
        - Implement different environments ✅ (Vite modes + .env.{development,staging,production} + dev:staging/build:staging scripts)
        - Implement evironment screen explaining how it's done in react (Pending)
    - Best practices screen (Pending)
        - Explaining how things are done in best way in react for performance, efficiency, maintainance, etc
