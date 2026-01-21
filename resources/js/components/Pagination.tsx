import { router } from "@inertiajs/react";

interface Props {
  links: any[];
}

export default function Pagination({ links }: Props) {
  if (links.length <= 3) return null;

  return (
    <div className="flex justify-center mt-6">
      <nav className="inline-flex items-center gap-1">
        {links.map((link, i) => {
          if (link.url === null) {
            return (
              <span
                key={i}
                className="px-3 py-1.5 text-sm text-gray-400"
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            );
          }

          return (
            <button
              key={i}
              onClick={() => router.get(link.url!, {}, { preserveState: true })}
              className={`px-3 py-1.5 text-sm rounded-md transition
                ${
                  link.active
                    ? "bg-black text-white"
                    : "border text-gray-700 hover:bg-gray-100"
                }`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          );
        })}
      </nav>
    </div>
  );
}
