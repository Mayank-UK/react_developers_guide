import type { Link as LinkModel } from '../../../domain/models/link';
import { RoutePaths } from '../../routing/routes';

// Module-scoped constant — a single stable array shared by every render.
export const STATE_MANAGEMENT_NAV_ITEMS: readonly LinkModel[] = [
    {
        title: 'Hooks',
        route: RoutePaths.hooks,
        description:
            'useState / useReducer / Context — built-in state, no library.',
    },
    {
        title: 'Redux',
        route: RoutePaths.redux,
        description:
            'Redux Toolkit — a single global store for large, predictable apps.',
    },
    {
        title: 'Zustand',
        route: RoutePaths.zustand,
        description:
            'A tiny hook-based store — the sweet spot for most apps that need global state.',
    },
    {
        title: 'TanStack Query',
        route: RoutePaths.tanstackQuery,
        description:
            'Server state — caching, loading/error, invalidation. Not a UI-state replacement.',
    },
];
