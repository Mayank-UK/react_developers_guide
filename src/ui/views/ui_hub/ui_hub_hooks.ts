import type { Link as LinkModel } from '../../../domain/models/link';
import { RoutePaths } from '../../routing/routes';

// Defining items inside the hook function body means the array is recreated on every render. For a static constant that never changes, this is pure waste.
const NAV_ITEMS: readonly LinkModel[] = [
    {
        title: 'Layout and structure',
        route: RoutePaths.layoutStructure,
        description:
            'Component trees, the shared layout, box model, Flexbox, Grid.',
    },
    {
        title: 'CSS',
        route: RoutePaths.css,
        description:
            'Selectors, the cascade, specificity, units, custom properties.',
    },
    {
        title: 'Bootstrap',
        route: RoutePaths.bootstrap,
        description:
            'The component framework, its 12-column grid, vs Tailwind.',
    },
    {
        title: 'Tailwind',
        route: RoutePaths.tailwind,
        description: 'Utility-first styling — the approach this app uses.',
    },
    {
        title: 'Interactive behaviours',
        route: RoutePaths.interactive,
        description: 'Hover, focus, active, transitions, animations.',
    },
    {
        title: 'Responsive layout',
        route: RoutePaths.responsive,
        description: 'Mobile-first, breakpoints, container queries, useMediaQuery.',
    },
    {
        title: 'Design system',
        route: RoutePaths.designSystem,
        description: 'Tokens (color/type/spacing/radius/shadow), @theme inline, light/dark.',
    },
];

export function useUiHubNav() {
    return { NAV_ITEMS };
}
