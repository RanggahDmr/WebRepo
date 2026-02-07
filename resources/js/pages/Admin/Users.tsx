import { Link } from "@inertiajs/react";
import route from "@/lib/route";
import CreateBoardModal from "@/pages/Boards/CreateBoardModal";
import { can } from "@/lib/can";

export default function SidebarNav({
  auth,
  navBoards,
  currentBoardUuid,
  boardActive,
  boardOpen,
  setBoardOpen,
  dashboardActive,
  historyActive,
  monitoringActive,

  //  admin active flags (saran: bikin 2 flag)
  adminUsersActive,          // untuk active users page
  adminUsersPendingActive,   // untuk pending users page
  adminRolesActive,

  //  dropdown state
  adminUsersOpen,
  setAdminUsersOpen,

  //  badge count pending
  pendingUsersCount = 0,

  canManageBoards,
  canManageRoles,
  canViewMonitoring,
  openCreateBoard,
  setOpenCreateBoard,
  onNavigate,
}: any) {
  const userManagementActive = !!adminUsersActive || !!adminUsersPendingActive;

  return (
    <nav className="flex flex-col gap-1 overflow-y-auto">
      {/* BOARD */}
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setBoardOpen((v: boolean) => !v)}
          className={[
            "rounded-md px-3 py-2 text-sm font-medium transition flex items-center justify-between",
            boardActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100",
          ].join(" ")}
        >
          <span>Board</span>
          <span className={`transition-transform ${boardOpen ? "rotate-180" : ""}`}>▾</span>
        </button>

        {boardOpen && (
          <div className="mt-2 rounded-md border border-gray-200 bg-gray-100/80 p-1.5">
            <div className="flex flex-col gap-1">
              {/* All Boards */}
              <Link
                href={route("dashboard")}
                onClick={onNavigate}
                className={[
                  "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                  dashboardActive
                    ? "bg-gray-200 text-gray-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-200/70",
                ].join(" ")}
              >
                <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-gray-500 group-hover:bg-gray-700" />
                <span className="truncate">All Boards</span>
              </Link>

              <div className="mt-1 border-t border-gray-200 pt-1" />

              {(navBoards ?? []).map((b: any) => {
                const uuid = b.uuid ?? null;
                const isCurrent = !!currentBoardUuid && uuid === currentBoardUuid;

                return (
                  <Link
                    key={uuid}
                    href={route("epics.index", { board: uuid })}
                    onClick={onNavigate}
                    className={[
                      "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                      isCurrent
                        ? "bg-gray-200 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-200/70",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        isCurrent ? "bg-gray-900" : "bg-gray-500 group-hover:bg-gray-700",
                      ].join(" ")}
                    />
                    <span className="truncate">{b.title}</span>
                  </Link>
                );
              })}

              {/* Add Board */}
              <div className="mt-1 border-t border-gray-200 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate?.();
                    setOpenCreateBoard(true);
                  }}
                  disabled={!canManageBoards}
                  className={[
                    "w-full rounded-md px-3 py-2 text-left text-sm transition flex items-center justify-between",
                    canManageBoards
                      ? "text-gray-700 hover:bg-gray-200/70"
                      : "text-gray-400 cursor-not-allowed",
                  ].join(" ")}
                >
                  <span>Add Board</span>
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
        onClick={onNavigate}
        className={[
          "rounded-md px-3 py-2 text-sm font-medium transition",
          historyActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100",
        ].join(" ")}
      >
        History
      </Link>

      {/* MONITORING */}
      {canViewMonitoring && (
        <Link
          href={route("monitoring.index")}
          onClick={onNavigate}
          className={[
            "rounded-md px-3 py-2 text-sm font-medium transition",
            monitoringActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100",
          ].join(" ")}
        >
          Monitoring
        </Link>
      )}

      {/* ADMIN - USER MANAGEMENT DROPDOWN */}
      {can(auth, "manage_boards") && (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setAdminUsersOpen((v: boolean) => !v)}
            className={[
              "rounded-md px-3 py-2 text-sm font-medium transition flex items-center justify-between",
              userManagementActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100",
            ].join(" ")}
          >
            <span className="flex items-center gap-2">
              <span>User Management</span>

              {/*  badge kecil di parent (total pending) */}
              {pendingUsersCount > 0 && (
                <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                  {pendingUsersCount}
                </span>
              )}
            </span>

            <span className={`transition-transform ${adminUsersOpen ? "rotate-180" : ""}`}>▾</span>
          </button>

          {adminUsersOpen && (
            <div className="mt-2 rounded-md border border-gray-200 bg-gray-100/80 p-1.5">
              <div className="flex flex-col gap-1">
                {/* Active Users */}
                <Link
                  href={route("admin.users.active")}
                  onClick={onNavigate}
                  className={[
                    "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                    adminUsersActive
                      ? "bg-gray-200 text-gray-900 font-semibold"
                      : "text-gray-700 hover:bg-gray-200/70",
                  ].join(" ")}
                >
                  <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-gray-500 group-hover:bg-gray-700" />
                  <span className="truncate">Active Users</span>
                </Link>

                {/* Pending Users */}
                <Link
                  href={route("admin.users.pending")}
                  onClick={onNavigate}
                  className={[
                    "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition",
                    adminUsersPendingActive
                      ? "bg-gray-200 text-gray-900 font-semibold"
                      : "text-gray-700 hover:bg-gray-200/70",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-gray-500 group-hover:bg-gray-700" />
                    <span className="truncate">Pending Users</span>
                  </span>

                  {/*  badge juga di item pending */}
                  {pendingUsersCount > 0 && (
                    <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                      {pendingUsersCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROLES */}
      {canManageRoles && (
        <Link
          href={route("admin.roles.index")}
          onClick={onNavigate}
          className={[
            "rounded-md px-3 py-2 text-sm font-medium transition",
            adminRolesActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100",
          ].join(" ")}
        >
          Roles
        </Link>
      )}
    </nav>
  );
}
