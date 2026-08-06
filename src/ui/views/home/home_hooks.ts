import type { Link as LinkModel } from '../../../domain/models/link';
import { RoutePaths } from '../../routing/routes';

// Module-scoped constant — a single stable array shared by every render.
export const HOME_NAV_ITEMS: readonly LinkModel[] = [
    {
        title: 'React fundamentals',
        route: RoutePaths.reactFundamentals,
        description:
            'Components, JSX, props, hooks basics — the core mental model.',
    },
    {
        title: 'TypeScript / JavaScript fundamentals',
        route: RoutePaths.tsJsFundamentals,
        description: 'Variables, types, control flow, async, modules.',
    },
    {
        title: 'UI',
        route: RoutePaths.ui,
        description:
            'Layout, styling (CSS / Bootstrap / Tailwind), interactions.',
    },
    {
        title: 'Lifecycle',
        route: RoutePaths.lifecycle,
        description: 'Mount, update, unmount — effects and cleanup.',
    },
    {
        title: 'Navigation and routing',
        route: RoutePaths.navigation,
        description: 'React Router, route trees, params, guards.',
    },
    {
        title: 'State management',
        route: RoutePaths.stateManagement,
        description: 'Hooks, Redux, Zustand, TanStack Query — with todos.',
    },
    {
        title: 'API handling',
        route: RoutePaths.apiHandling,
        description: 'The full clean-arch posts pipeline, end to end.',
    },
    {
        title: 'Database handling',
        route: RoutePaths.databaseHandling,
        description: 'Local persistence with Dexie / IndexedDB + DAOs.',
    },
    {
        title: 'Exception handling',
        route: RoutePaths.exceptionHandling,
        description: 'Exceptions → Failures, severity-driven UI, chaining.',
    },
    {
        title: 'Dependency management',
        route: RoutePaths.dependencyManagement,
        description: 'The service-locator container and wiring.',
    },
    {
        title: 'Architecture',
        route: RoutePaths.architecture,
        description: 'Domain / Data / UI layers and maintainability.',
    },
    {
        title: 'Testing',
        route: RoutePaths.testing,
        description: 'Vitest + Testing Library for layers and components.',
    },
    {
        title: 'Debugging',
        route: RoutePaths.debugging,
        description: 'DevTools, source maps, React DevTools.',
    },
    {
        title: 'Environments / Flavours',
        route: RoutePaths.environments,
        description: 'dev / staging / prod via Vite modes.',
    },
    {
        title: 'Best practices',
        route: RoutePaths.bestPractices,
        description: 'Performance, efficiency, maintainability.',
    },
];
