import LinkCard from '../../components/link_card';
import { useUiHubNav } from './ui_hub_hooks';

/**
 * UiHubView — the navigation hub for the UI section. Groups the layout, styling,
 * and interaction screens so each is reachable from a single place under /ui.
 * Mirrors the home hub pattern (a Links grid), scoped to UI sub-screens.
 */

export default function UiHubView() {
    const { NAV_ITEMS } = useUiHubNav();

    return (
        <div className="flex flex-col gap-md p-md">
            <nav className="grid grid-cols-1 gap-md pb-md sm:grid-cols-2 lg:grid-cols-3">
                {NAV_ITEMS.map((item) => (
                    <LinkCard key={item.route} item={item} />
                ))}
            </nav>
        </div>
    );
}
