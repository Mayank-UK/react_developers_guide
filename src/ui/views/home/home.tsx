import type { Link as LinkModel } from '../../../domain/models/link';
import { RoutePaths } from '../../routing/routes';
import LinkCard from '../../components/link_card';

/**
 * Home — the top-level navigation hub. Mirrors the Flutter home screen: a grid
 * of cards linking to each section of the guide. The page title is rendered by
 * the shared RootLayout.
 */
const items: LinkModel[] = [
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
        title: 'Responsive layout',
        route: RoutePaths.responsive,
        description: 'How responsiveness is done the standard React way.',
    },
    {
        title: 'Design system',
        route: RoutePaths.designSystem,
        description: 'The token-driven system powering this whole app.',
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

export default function HomeView() {
    return (
        <div className="flex flex-col gap-lg p-lg">
            <nav className="grid grid-cols-1 gap-md pb-md sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <LinkCard key={item.route} item={item} />
                ))}
            </nav>
        </div>
    );
}
