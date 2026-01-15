import { Link } from '@inertiajs/react';

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-sm text-gray-600">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={idx} className="flex items-center gap-1">
              {idx !== 0 && <span className="text-gray-400">/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:underline hover:text-gray-900">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-gray-900">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
