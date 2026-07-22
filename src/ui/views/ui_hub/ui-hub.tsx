import type { Link } from '../../../domain/models/link';
import LinkCard from '../../components/link_card';
import { RoutePaths } from '../../routing/routes';

/**
 * UiHubView — the navigation hub for the UI section. Groups the layout, styling,
 * and interaction screens so each is reachable from a single place under /ui.
 * Mirrors the home hub pattern (a Links grid), scoped to UI sub-screens.
 */
const items: Link[] = [
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
];

export default function UiHubView() {
    return (
        <div className="flex flex-col gap-md">
            <p className="text-[var(--text-body)] text-on-surface-variant">
                How UI is built and styled on the web — from page structure down
                to interactions. Each sub-screen builds on the shared design
                system.
            </p>
            <nav className="grid grid-cols-1 gap-md pb-md sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <LinkCard key={item.route} item={item} />
                ))}
            </nav>
        </div>
    );
}
