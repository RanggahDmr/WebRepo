import { Link } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import route from "@/lib/route";
import CreateBoardModal from "@/pages/Boards/CreateBoardModal";
import { can, canAny } from "@/lib/can";
import { useRole } from "@/lib/useRole";

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

  // split admin users flags
  adminUsersActive,
  adminUsersPendingActive,

  adminRolesActive,

  // dropdown state user management
  adminUsersOpen,
  setAdminUsersOpen,

  // badge pending users
  pendingUsersCount = 0,

  canManageBoards,
  canManageRoles,
  canViewMonitoring,

  openCreateBoard,
  setOpenCreateBoard,
  onNavigate,

  //  optional: global masters flags/state (kalau belum dipass dari layout, auto fallback)
  adminGlobalStatusesActive,
  adminGlobalPrioritiesActive,
  adminGlobalDefaultsActive,

  adminMastersOpen,
  setAdminMastersOpen,
}: any) {
  const userManagementActive = !!adminUsersActive || !!adminUsersPendingActive;
  const { canManageSettings } = useRole();

  // ====== Global Masters active fallback ======
  const gmStatusesActive = adminGlobalStatusesActive ?? route().current("admin.global-statuses.*");
  const gmPrioritiesActive = adminGlobalPrioritiesActive ?? route().current("admin.global-priorities.*");
  const gmDefaultsActive = adminGlobalDefaultsActive ?? route().current("admin.global-defaults.*");

  const globalMastersActive = !!(gmStatusesActive || gmPrioritiesActive || gmDefaultsActive);

  // ====== Global Masters open state (fallback to local state if not provided) ======
  const [localMastersOpen, setLocalMastersOpen] = useState<boolean>(globalMastersActive);
  const mastersOpen = adminMastersOpen ?? localMastersOpen;
  const setMastersOpen = setAdminMastersOpen ?? setLocalMastersOpen;

  // auto-open masters dropdown when inside masters pages
  useEffect(() => {
    if (globalMastersActive) setMastersOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalMastersActive]);

  const canManageGlobalStatuses = can(auth, "manage_global_statuses");
  const canManageGlobalPriorities = can(auth, "manage_global_priorities");
  const canManageGlobalDefaults = can(auth, "manage_global_defaults");

  const canSeeGlobalMasters = useMemo(
    () =>
      canAny(auth, [
        "manage_global_statuses",
        "manage_global_priorities",
        "manage_global_defaults",
      ]),
    [auth]
  );

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

              {/* Board Settings (current board) */}
              {currentBoardUuid && canManageSettings && (
                <>
                  <div className="mt-1 border-t border-gray-200 pt-1" />
                  <Link
                    href={route("boards.settings", { board: currentBoardUuid })}
                    onClick={onNavigate}
                    className={[
                      "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                      route().current("boards.settings")
                        ? "bg-gray-200 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-200/70",
                    ].join(" ")}
                  >
                    <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-gray-500 group-hover:bg-gray-700" />
                    <span className="truncate">Board Settings</span>
                  </Link>
                </>
              )}

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

              <CreateBoardModal open={openCreateBoard} onClose={() => setOpenCreateBoard(false)} />
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

      {/* GLOBAL MASTERS */}
      {canSeeGlobalMasters && (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setMastersOpen((v: boolean) => !v)}
            className={[
              "rounded-md px-3 py-2 text-sm font-medium transition flex items-center justify-between",
              globalMastersActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100",
            ].join(" ")}
          >
            <span>Global Masters</span>
            <span className={`transition-transform ${mastersOpen ? "rotate-180" : ""}`}>▾</span>
          </button>

          {mastersOpen && (
            <div className="mt-2 rounded-md border border-gray-200 bg-gray-100/80 p-1.5">
              <div className="flex flex-col gap-1">
                {canManageGlobalStatuses && (
                  <Link
                    href={route("admin.global-statuses.index")}
                    onClick={onNavigate}
                    className={[
                      "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                      gmStatusesActive
                        ? "bg-gray-200 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-200/70",
                    ].join(" ")}
                  >
                    <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-gray-500 group-hover:bg-gray-700" />
                    <span className="truncate">Statuses</span>
                  </Link>
                )}

                {canManageGlobalPriorities && (
                  <Link
                    href={route("admin.global-priorities.index")}
                    onClick={onNavigate}
                    className={[
                      "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                      gmPrioritiesActive
                        ? "bg-gray-200 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-200/70",
                    ].join(" ")}
                  >
                    <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-gray-500 group-hover:bg-gray-700" />
                    <span className="truncate">Priorities</span>
                  </Link>
                )}

                {canManageGlobalDefaults && (
                  <Link
                    href={route("admin.global-defaults.index")}
                    onClick={onNavigate}
                    className={[
                      "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                      gmDefaultsActive
                        ? "bg-gray-200 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-200/70",
                    ].join(" ")}
                  >
                    <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-gray-500 group-hover:bg-gray-700" />
                    <span className="truncate">Defaults</span>
                  </Link>
                )}
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
