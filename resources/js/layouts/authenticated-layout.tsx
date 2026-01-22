import { Link, usePage } from "@inertiajs/react";
import { PropsWithChildren, ReactNode } from "react";
import route from "@/lib/route";
import FlashMessage from "@/components/ui/FlashMessage";

export default function AuthenticatedLayout({
  header,
  children,
  rightSidebar,
  rightSidebarOpen = false,
}: PropsWithChildren<{ header?: ReactNode; rightSidebar?: ReactNode; rightSidebarOpen?: boolean }>) {

  const { auth }: any = usePage().props;

  // ===== ACTIVE STATE =====
  const projectActive =
    route().current("dashboard") ||
    route().current("epics.show") ||
    route().current("stories.show") ||
    route().current("tasks.index");

  const historyActive = route().current("history.index");
  const monitoringActive = route().current("monitoring.index");

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col overflow-hidden">
      <FlashMessage />

      {/* TOPBAR */}
      <div className="border-b bg-white">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="font-semibold text-black">WebRepo</div>

          <div className="text-sm text-gray-600">
            {auth?.user?.name} ({auth?.user?.role})
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 min-h-0">
        {/* Full width container */}
        <div className="w-full px-6 py-6 h-full">
          <div className="flex gap-6 h-full min-h-0">
            {/* LEFT SIDEBAR */}
            <aside className="w-64 shrink-0 h-full">
              <div className="h-full flex flex-col justify-between rounded-lg bg-white p-4 shadow-sm">
                {/* NAV */}
                <nav className="flex flex-col gap-1 overflow-y-auto">
                  {/* PROJECT */}
                  <Link
                    href={route("dashboard")}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition
                      ${
                        projectActive
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    Project
                  </Link>

                  {/* HISTORY */}
                  <Link
                    href={route("history.index")}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition
                      ${
                        historyActive
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    History
                  </Link>

                  {/* MONITORING */}
                  <Link
                    href={route("monitoring.index")}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition
                      ${
                        monitoringActive
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    Monitoring
                  </Link>
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

            {/* MAIN CONTENT */}
            <main className="min-w-0 flex-1 h-full min-h-0 overflow-y-auto">
              <div className="pb-6">
                {header && <div className="mb-4">{header}</div>}
                {children}
              </div>
            </main>

            {/* RIGHT SIDEBAR */}
               <div
            className={[
              "hidden xl:block shrink-0 h-full transition-all duration-300 ease-in-out",
              rightSidebarOpen ? "w-[360px]" : "w-0",
            ].join(" ")}
          >
            {/* Inner wrapper supaya konten ikut slide + fade */}
            <div
              className={[
                "h-full overflow-y-auto transition-all duration-300 ease-in-out",
                rightSidebarOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-4 pointer-events-none",
              ].join(" ")}
            >
              <div className="sticky top-0">
                {/* render content only when provided */}
                {rightSidebar}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}





  //  <aside className="hidden xl:block w-[360px] shrink-0 h-full">
  //             <div className="h-full overflow-y-auto">
  //               <div className="sticky top-0">
  //                 {/* Default card / slot */}
  //                 {rightSidebar ? (
  //                   rightSidebar
  //                 ) : (
  //                   <div className="rounded-lg bg-white p-4 shadow-sm border">
  //                     <div className="text-sm font-semibold text-gray-900">
  //                       Task Detail
  //                     </div>
  //                     <div className="mt-2 text-xs text-gray-500">
  //                       Click task on board/table for details at here.
  //                     </div>

  //                     <div className="mt-4 space-y-3">
  //                       <div className="rounded-md bg-gray-50 p-3">
  //                         <div className="text-xs text-gray-500">Title</div>
  //                         <div className="text-sm text-gray-900 font-medium">
  //                           -
  //                         </div>
  //                       </div>

  //                       <div className="rounded-md bg-gray-50 p-3">
  //                         <div className="text-xs text-gray-500">Status</div>
  //                         <div className="text-sm text-gray-900 font-medium">
  //                           -
  //                         </div>
  //                       </div>

  //                       <div className="rounded-md bg-gray-50 p-3">
  //                         <div className="text-xs text-gray-500">
  //                           Description
  //                         </div>
  //                         <div className="text-sm text-gray-700">-</div>
  //                       </div>
  //                       <div className="rounded-md bg-gray-50 p-3">
  //                         <div className="text-xs text-gray-500">
  //                           Created At
  //                         </div>
  //                         <div className="text-sm text-gray-700">-</div>
  //                       </div>
  //                       <div className="rounded-md bg-gray-50 p-3">
  //                         <div className="text-xs text-gray-500">
  //                           Created By
  //                         </div>
  //                         <div className="text-sm text-gray-700">-</div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 )}
  //               </div>
  //             </div>
  //           </aside>