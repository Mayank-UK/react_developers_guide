import { Link } from 'react-router';
import type { Link as LinkModel } from '../../domain/models/link';

interface LinkCardProps {
    item: LinkModel;
}

export default function LinkCard({ item }: LinkCardProps) {
    return (
        <Link
            to={item.route}
            className="group block rounded-lg border border-outline bg-surface p-lg transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-button-card-hover"
        >
            <h3 className="flex items-center gap-sm text-title font-semibold text-on-surface transition-colors group-hover:text-primary">
                {item.title}
                <span className="text-on-surface-variant transition-transform group-hover:translate-x-1 group-hover:text-primary">
                    →
                </span>
            </h3>

            {item.description && (
                <p className="mt-sm text-body-sm leading-relaxed text-on-surface-variant">
                    {item.description}
                </p>
            )}
        </Link>
    );
}
