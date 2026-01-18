import { Link, usePage } from "@inertiajs/react";
import { PropsWithChildren, ReactNode } from "react";
import route from "@/lib/route";
import FlashMessage from "@/components/ui/FlashMessage";
export default function AuthenticatedLayout({
  header,
  children,
  
}: PropsWithChildren<{ header?: ReactNode }>) {
  const { auth }: any = usePage().props;
  const epicActive =
  route().current("dashboard") ||
  route().current("epics.show") ||
  route().current("stories.show")||
  route().current("tasks.index");


  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col overflow-hidden">
      <FlashMessage/>
      {/* TOPBAR */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-black">WebRepo</div>

          <div className="text-sm text-gray-600">
            {auth?.user?.name} ({auth?.user?.role})
          </div>
        </div>
      </div>

      {/* BODY (mengisi sisa tinggi layar) */}
      <div className="flex-1 min-h-0">
        <div className="mx-auto max-w-7xl px-4 py-6 h-full">
          <div className="flex gap-6 h-full min-h-0">
            {/* SIDEBAR (tinggi tetap layar, bisa scroll sendiri kalau menunya panjang) */}
            <aside className="w-64 shrink-0 h-full">
              <div
                className="h-full flex flex-col justify-between
                           rounded-lg bg-white p-4 shadow-sm"
              >
                {/* NAV */}
              <nav className="flex flex-col gap-1 overflow-y-auto">
                    {(() => {
                        const epicActive =
                        route().current("dashboard") ||
                        route().current("epics.show") ||
                        route().current("stories.show")||
                        route().current("tasks.index");

                        return (
                        <Link
                            href={route("dashboard")}
                            className={`rounded-md px-3 py-2 text-sm font-medium transition
                            ${epicActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
                        >
                            Epic
                        </Link>
                        );
                    })()}

                    <div className="rounded-md px-3 py-2 text-sm text-gray-400">
                        History (later)
                    </div>

                    <div className="rounded-md px-3 py-2 text-sm text-gray-400">
                        Task (later)
                    </div>
                    </nav>

                {/* LOGOUT */}
                <div className="pt-4 border-t">
                  <Link
                    href={route("logout")}
                    method="post"
                    as="button"
                    className="w-full rounded-md px-3 py-2 text-left text-sm font-medium
                               text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </Link>
                </div>
              </div>
            </aside>

            {/* CONTENT (yang scroll cuma area ini) */}
            <main className="min-w-0 flex-1 h-full min-h-0 overflow-y-auto">
              <div className="pb-6">
                {header && <div className="mb-4">{header}</div>}
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
