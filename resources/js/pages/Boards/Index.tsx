import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Link, usePage } from "@inertiajs/react";
import route from "@/lib/route";

type Board = {
  id: number;
  squad: string;
  title: string;
};

export default function Index({ boards }: { boards: Board[] }) {
  const { auth }: any = usePage().props;
  const isPM = auth?.user?.role === "PM";

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">Boards</div>

          {/* Optional: tombol create kalau PM (kalau belum bikin modal/form, hide dulu) */}
          {isPM ? (
            <div className="text-sm text-gray-500">
              
            </div>
          ) : null}
        </div>
      }
    >
      <div className="mx-auto max-w-7xl px-4 py-6">
        {!boards?.length ? (
          <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
            No boards yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {boards.map((b) => (
              <Link
                key={b.id}
                href={route("epics.index", b.squad)} // pakai b.id kalau kamu belum pakai getRouteKeyName()
                className="block rounded-xl border bg-white p-4 shadow-sm hover:shadow transition"
              >
                <div className="font-semibold text-gray-900">{b.title}</div>
                <div className="mt-1 text-sm text-gray-500">Board: {b.squad}</div>
                <div className="mt-3 text-sm text-blue-600">Epic Total : </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
