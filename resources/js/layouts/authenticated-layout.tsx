import { Link, usePage } from "@inertiajs/react";
import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import route from "@/lib/route";
import FlashMessage from "@/components/ui/FlashMessage";
import CreateBoardModal from "@/pages/Boards/CreateBoardModal";

export default function AuthenticatedLayout({
  header,
  children,
  rightSidebar,
  rightSidebarOpen = false,
}: PropsWithChildren<{
  header?: ReactNode;
  rightSidebar?: ReactNode;
  rightSidebarOpen?: boolean;
}>) {
  const { auth, navBoards, board }: any = usePage().props;

  // ===== ACTIVE STATE =====
  const dashboardActive = route().current("dashboard");

  const boardActive =
  route().current("dashboard") ||
  route().current("boards.index") ||
  route().current("boards.show") ||
  route().current("epics.index") ||   
  route().current("epics.show") ||
  route().current("stories.show") ||
  route().current("tasks.index");



  const historyActive = route().current("history.index");
  const monitoringActive = route().current("monitoring.index");

  //boards
  const isPM = auth?.user?.role==="PM";
  const [openCreateBoard, setOpenCreateBoard] = useState(false);

  // Dropdown open/close
  const [boardOpen, setBoardOpen] = useState<boolean>(!!boardActive);

  const currentSquad = board?.squad ?? null;

  
  // Auto-open dropdown when user is in board/epic/story/task pages
  useEffect(() => {
    if (boardActive) setBoardOpen(true);
  }, [boardActive]);

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
                  {/* BOARD (Dropdown) */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => setBoardOpen((v) => !v)}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition flex items-center justify-between
                        ${
                          boardActive
                            ? "bg-black text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <span>Board</span>
                      <span
                        className={`transition-transform ${
                          boardOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                      
                    {/* Dropdown items */}
                    {boardOpen && (
                <div className="mt-1 ml-2 flex flex-col gap-1">
                  <Link
                    href={route("dashboard")}
                    className={`rounded-md px-3 py-2 text-sm transition
                      ${
                        route().current("dashboard")
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    All Boards
                  </Link>

                 {(navBoards ?? []).map((b: any) => {
                  const squad = b.squad ?? null;
                  const isCurrent = !!currentSquad && squad === currentSquad;

                  return (
                    <Link
                      key={squad ?? b.id}
                      href={route("epics.index", squad ?? b.id)}
                      className={[
                        "rounded-md px-3 py-2 text-sm transition",
                        isCurrent
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "hover:bg-gray-50 text-gray-700",
                      ].join(" ")}
                      title={squad}
                    >
                      <div className="font-medium">{b.title}</div>
                      <div className="text-xs text-gray-500 truncate">{squad}</div>
                    </Link>
                  );
                })}


                  {/* ADD SQUAD (PM only) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setOpenCreateBoard(true)}
                      disabled={!isPM}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition flex items-center justify-between
                        ${
                          isPM
                            ? "text-gray-700 hover:bg-gray-50"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      title={isPM ? "Create squad" : "PM only"}
                    >
                      <span>Add Squad</span>
                      <span className="text-lg leading-none">+</span>
                    </button>
                  </div>

                  <CreateBoardModal
                    open={openCreateBoard}
                    onClose={() => setOpenCreateBoard(false)}
                  />
                </div>
              )}

                  </div>

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
