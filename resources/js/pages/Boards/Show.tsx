import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Link } from "@inertiajs/react";
import route from "@/lib/route";

type Board = {
  id: number;
  squad: string; // uuid
  title: string;
};

type Epic = {
  id: number;
  title: string;
  // kalau ada field lain, aman diabaikan
};

export default function Show({
  board,
  epics,
}: {
  board: Board;
  epics: Epic[];
}) {
  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">{board.title}</div>
            <div className="text-sm text-gray-500">Board: {board.squad}</div>
          </div>

          <Link
            href={route("dashboard")}
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            ← Back to Boards
          </Link>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Epics in this Board
          </h2>
          <div className="text-sm text-gray-500">{epics?.length ?? 0} epic(s)</div>
        </div>

        {!epics?.length ? (
          <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
            No epics in this board yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {epics.map((epic) => (
              <div key={epic.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="font-semibold text-gray-900 line-clamp-2">
                  {epic.title}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">Epic #{epic.id}</div>

                 
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
