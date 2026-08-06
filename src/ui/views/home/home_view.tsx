import LinkCard from '../../components/link_card';
import { HOME_NAV_ITEMS } from './home_hooks';

/**
 * Home — the top-level navigation hub. Mirrors the Flutter home screen: a grid
 * of cards linking to each section of the guide. The page title is rendered by
 * the shared RootLayout.
 */

export default function HomeView() {
    return (
        <div className="flex flex-col gap-md p-md">
            <nav className="grid grid-cols-1 gap-md pb-md sm:grid-cols-2 lg:grid-cols-3">
                {HOME_NAV_ITEMS.map((item) => (
                    <LinkCard key={item.route} item={item} />
                ))}
            </nav>
        </div>
    );
}
