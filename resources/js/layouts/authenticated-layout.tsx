import { Link, usePage, router } from "@inertiajs/react";
import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import route from "@/lib/route";
import FlashMessage from "@/components/ui/FlashMessage";
import CreateBoardModal from "@/pages/Boards/CreateBoardModal";
import { useAlert } from "@/components/alert/AlertProvider";
import { can } from "@/lib/can";

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
  const { alert, confirm } = useAlert();

  const dashboardActive = route().current("dashboard");

  const boardActive =
    route().current("boards.index") ||
    route().current("boards.show") ||
    route().current("epics.index") ||
    route().current("epics.show") ||
    route().current("stories.show") ||
    route().current("tasks.index");

  const historyActive =
    route().current("history.index") ||
    route().current("monitoring.epics") ||
    route().current("monitoring.stories");

  const adminUsersActive = route().current("admin.users.index");
  const adminRolesActive = route().current("admin.roles.index");
  const adminActive = adminUsersActive || adminRolesActive;

  const monitoringActive = route().current("monitoring.index");

  const canManageBoards = can(auth, "manage_boards");
  const canManageRoles = can(auth, "manage_roles");

  const [openCreateBoard, setOpenCreateBoard] = useState(false);
  const [boardOpen, setBoardOpen] = useState<boolean>(!!boardActive);

  // current board uuid dari props (kalau halaman epics/show/story/tasks ngirim 'board')
  const currentBoardUuid = board?.uuid ?? null;

  // auto-open dropdown saat lagi di halaman board-related
  useEffect(() => {
    if (boardActive) setBoardOpen(true);
  }, [boardActive]);

  // global inertia exception handler
  useEffect(() => {
    const handler = (event: any) => {
      const status = event?.detail?.response?.status;

      if (status === 401) {
        alert({
          title: "Unauthorized (401)",
          description: "Sesi kamu mungkin habis. Silakan login ulang.",
          confirmText: "OK",
        });
      }

      if (status === 403) {
        alert({
          title: "Akses ditolak (403)",
          description: "Kamu tidak punya izin untuk melakukan aksi ini.",
          confirmText: "OK",
        });
      }

      if (status === 419) {
        alert({
          title: "Sesi habis (419)",
          description: "CSRF/session expired. Silakan refresh halaman.",
          confirmText: "Refresh",
          onConfirm: () => window.location.reload(),
        });
      }

      if (typeof status === "number" && status >= 500) {
        alert({
          title: "Server error",
          description: "Terjadi masalah di server. Coba lagi sebentar.",
          confirmText: "OK",
        });
      }
    };

    document.addEventListener("inertia:exception", handler as any);
    return () => document.removeEventListener("inertia:exception", handler as any);
  }, [alert]);

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
        <div className="w-full px-6 py-6 h-full">
          <div className="flex gap-6 h-full min-h-0">
            {/* LEFT SIDEBAR */}
            <aside className="w-64 shrink-0 h-full">
              <div className="h-full flex flex-col justify-between rounded-lg bg-white p-4 shadow-sm">
                {/* NAV */}
                <nav className="flex flex-col gap-1 overflow-y-auto">
                  {/* BOARD (klik toggle dropdown) */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => setBoardOpen((v) => !v)}
                      className={[
                        "rounded-md px-3 py-2 text-sm font-medium transition flex items-center justify-between",
                        boardActive
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100",
                      ].join(" ")}
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

                    {/* Dropdown list board */}
                    {boardOpen && (
                      <div className="mt-2 rounded-md border border-gray-200 bg-gray-100/80 p-1.5">
                        <div className="flex flex-col gap-1">
                          {(navBoards ?? []).map((b: any) => {
                            const uuid = b.uuid ?? null;
                            const squadCode = b.squad_code ?? null;
                            const isCurrent =
                              !!currentBoardUuid && uuid === currentBoardUuid;

                            return (
                              <Link
                                key={uuid}
                                href={route("epics.index", { board: uuid })}
                                title={squadCode ?? ""}
                                className={[
                                  "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                                  isCurrent
                                    ? "bg-gray-200 text-gray-900 font-semibold"
                                    : "text-gray-700 hover:bg-gray-200/70",
                                ].join(" ")}
                              >
                                {/* dot */}
                                <span
                                  className={[
                                    "h-1.5 w-1.5 rounded-full shrink-0",
                                    isCurrent
                                      ? "bg-gray-900"
                                      : "bg-gray-500 group-hover:bg-gray-700",
                                  ].join(" ")}
                                />
                                <span className="truncate">{b.title}</span>
                              </Link>
                            );
                          })}

                          {/* ADD BOARD */}
                          <div className="mt-1 border-t border-gray-200 pt-1">
                            <button
                              type="button"
                              onClick={() => setOpenCreateBoard(true)}
                              disabled={!canManageBoards}
                              className={[
                                "w-full rounded-md px-3 py-2 text-left text-sm transition flex items-center justify-between",
                                canManageBoards
                                  ? "text-gray-700 hover:bg-gray-200/70"
                                  : "text-gray-400 cursor-not-allowed",
                              ].join(" ")}
                              title={canManageBoards ? "Create board" : "PM only"}
                            >
                              <span className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                Add Board
                              </span>
                              <span className="text-lg leading-none">+</span>
                            </button>
                          </div>

                          <CreateBoardModal
                            open={openCreateBoard}
                            onClose={() => setOpenCreateBoard(false)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* HISTORY */}
                  <Link
                    href={route("history.index")}
                    className={[
                      "rounded-md px-3 py-2 text-sm font-medium transition",
                      historyActive
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    History
                  </Link>

                  {/* MONITORING */}
                  <Link
                    href={route("monitoring.index")}
                    className={[
                      "rounded-md px-3 py-2 text-sm font-medium transition",
                      monitoringActive
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    Monitoring
                  </Link>

                  {/* ADMIN MENU */}
                  {can(auth, "manage_boards") && (
                    <Link
                      href={route("admin.users.index")}
                      className={[
                        "rounded-md px-3 py-2 text-sm font-medium transition",
                        adminUsersActive
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      User Management
                    </Link>
                  )}

                  {canManageRoles && (
                    <Link
                      href={route("admin.roles.index")}
                      className={[
                        "rounded-md px-3 py-2 text-sm font-medium transition",
                        adminRolesActive
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      Roles
                    </Link>
                  )}
                </nav>

                <div className="pt-4 border-t">
                  <button
                    type="button"
                    onClick={() =>
                      confirm({
                        title: "Logout?",
                        description: " Are you sure want to logout??",
                        confirmText: "Logout",
                        cancelText: "Cancle",
                        onConfirm: () => router.post(route("logout")),
                      })
                    }
                    className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
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
              <div
                className={[
                  "h-full overflow-y-auto transition-all duration-300 ease-in-out",
                  rightSidebarOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-4 pointer-events-none",
                ].join(" ")}
              >
                <div className="sticky top-0">{rightSidebar}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
