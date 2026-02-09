import { router, usePage } from "@inertiajs/react";
import { PropsWithChildren, ReactNode, useEffect, useMemo, useState } from "react";
import route from "@/lib/route";
import FlashMessage from "@/components/ui/FlashMessage";
import { useAlert } from "@/components/alert/AlertProvider";
import { can } from "@/lib/can";

import MobileSidebar from "./MobileSidebar";
import SidebarNav from "./SidebarNav";

type RoleLite = {
  id: number;
  slug: string;
  name?: string;
};

type UserOption = {
  id: number;
  name: string;
  email?: string;
  roles?: RoleLite[];
};

const roleLabel = (u?: UserOption | null) => {
  const slugs = (u?.roles ?? []).map((r) => r.slug);
  return slugs.length ? slugs.join(", ") : "-";
};

export default function AuthenticatedLayout({
  header,
  children,
  rightSidebar,
  rightSidebarOpen = false,
  onCloseRightSidebar,
}: PropsWithChildren<{
  header?: ReactNode;
  rightSidebar?: ReactNode;
  rightSidebarOpen?: boolean;
  onCloseRightSidebar?: () => void;
}>) {
  const { auth, navBoards, board, flash, pendingCount }: any = usePage().props;
  const { alert, confirm, toast } = useAlert();

  // Active states
  const dashboardActive = route().current("dashboard");

  const boardActive =
    route().current("boards.index") ||
    route().current("boards.show") ||
    route().current("epics.index") ||
    route().current("epics.show") ||
    route().current("stories.show") ||
    route().current("tasks.index");

  const historyActive = route().current("history.index");
  const monitoringActive = route().current("monitoring.index");

  // admin flags
  const adminUsersActive = route().current("admin.users.active");
  const adminUsersPendingActive = route().current("admin.users.pending");
  const adminRolesActive = route().current("admin.roles.index");

  //  Global masters flags
  const adminGlobalStatusesActive = route().current("admin.global-statuses.*");
  const adminGlobalPrioritiesActive = route().current("admin.global-priorities.*");
  const adminGlobalDefaultsActive = route().current("admin.global-defaults.*");

  // Permissions
  const canManageBoards = can(auth, "manage_boards");
  const canManageRoles = can(auth, "manage_roles");
  const canViewMonitoring = can(auth, "view_monitoring");

  // UI state
  const [openCreateBoard, setOpenCreateBoard] = useState(false);
  const [boardOpen, setBoardOpen] = useState<boolean>(!!boardActive);

  const [adminUsersOpen, setAdminUsersOpen] = useState<boolean>(
    !!(adminUsersActive || adminUsersPendingActive)
  );

  //  Masters dropdown state
  const [adminMastersOpen, setAdminMastersOpen] = useState<boolean>(
    !!(adminGlobalStatusesActive || adminGlobalPrioritiesActive || adminGlobalDefaultsActive)
  );

  // Mobile hamburger state
  const [mobileOpen, setMobileOpen] = useState(false);

  // current board uuid from props
  const currentBoardUuid = board?.uuid ?? null;

  // auto-open dropdown when on board related pages
  useEffect(() => {
    if (boardActive) setBoardOpen(true);
  }, [boardActive]);

  // auto-open admin users dropdown when inside users pages
  useEffect(() => {
    if (adminUsersActive || adminUsersPendingActive) setAdminUsersOpen(true);
  }, [adminUsersActive, adminUsersPendingActive]);

  //  auto-open masters dropdown when inside masters pages
  useEffect(() => {
    if (adminGlobalStatusesActive || adminGlobalPrioritiesActive || adminGlobalDefaultsActive) {
      setAdminMastersOpen(true);
    }
  }, [adminGlobalStatusesActive, adminGlobalPrioritiesActive, adminGlobalDefaultsActive]);

  // toast from flash alert
  useEffect(() => {
    const a = flash?.alert;
    if (!a?.message) return;

    toast({
      type: a.type ?? "info",
      message: a.message,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash?.alert]);

  // Global inertia exception handler
  useEffect(() => {
    const handler = (event: any) => {
      const status = event?.detail?.response?.status;

      if (status === 401) {
        alert({
          title: "Unauthorized (401)",
          description: "Your session has ended. Please log in again.",
          confirmText: "OK",
        });
      }

      if (status === 403) {
        alert({
          title: "Access denied (403)",
          description: "You don't have permission to perform this action.",
          confirmText: "OK",
        });
      }

      if (status === 419) {
        alert({
          title: "Session expired (419)",
          description: "CSRF/session expired. Please refresh the page.",
          confirmText: "Refresh",
          onConfirm: () => window.location.reload(),
        });
      }

      if (status === 404) {
        alert({
          title: "Page not found (404)",
          description: "The page you are looking for was not found or has been moved.",
          confirmText: "OK",
        });
      }

      if (typeof status === "number" && status >= 500) {
        alert({
          title: "Server error",
          description: "There was a server problem. Please try again.",
          confirmText: "OK",
        });
      }
    };

    document.addEventListener("inertia:exception", handler as any);
    return () => document.removeEventListener("inertia:exception", handler as any);
  }, [alert]);

  const onLogout = () =>
    confirm({
      title: "Logout?",
      description: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      onConfirm: () => router.post(route("logout")),
    });

  const onNavigate = () => {
    setMobileOpen(false);
  };

  // SidebarNav props (desktop + mobile)
  const sidebarProps = useMemo(
    () => ({
      auth,
      navBoards: navBoards ?? [],
      currentBoardUuid,

      boardActive,
      boardOpen,
      setBoardOpen,

      dashboardActive,
      historyActive,
      monitoringActive,

      adminUsersActive,
      adminUsersPendingActive,
      adminRolesActive,

      adminUsersOpen,
      setAdminUsersOpen,

      pendingUsersCount: pendingCount ?? 0,

      canManageBoards,
      canManageRoles,
      canViewMonitoring,

      openCreateBoard,
      setOpenCreateBoard,

      onNavigate,

      //  Global masters props
      adminGlobalStatusesActive,
      adminGlobalPrioritiesActive,
      adminGlobalDefaultsActive,

      adminMastersOpen,
      setAdminMastersOpen,
    }),
    [
      auth,
      navBoards,
      currentBoardUuid,
      boardActive,
      boardOpen,
      dashboardActive,
      historyActive,
      monitoringActive,
      adminUsersActive,
      adminUsersPendingActive,
      adminRolesActive,
      adminUsersOpen,
      pendingCount,
      canManageBoards,
      canManageRoles,
      canViewMonitoring,
      openCreateBoard,

      adminGlobalStatusesActive,
      adminGlobalPrioritiesActive,
      adminGlobalDefaultsActive,
      adminMastersOpen,
    ]
  );

  // ESC to close right sidebar
  useEffect(() => {
    if (!rightSidebarOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRightSidebar?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [rightSidebarOpen, onCloseRightSidebar]);

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col overflow-hidden">
      <FlashMessage />

      <MobileSidebar
        open={mobileOpen}
        setOpen={setMobileOpen}
        sidebarProps={sidebarProps}
        onLogout={onLogout}
      />

      {/* TOPBAR */}
      <div className="border-b bg-white">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="font-semibold text-black">WebRepo</div>
          <div className="text-sm text-gray-600">
            {auth?.user?.name} ({roleLabel(auth?.user)})
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 min-h-0">
        <div className="w-full px-6 py-6 h-full">
          <div className="flex gap-6 h-full min-h-0">
            {/* LEFT SIDEBAR (desktop only) */}
            <aside className="hidden lg:block w-64 shrink-0 h-full">
              <div className="h-full flex flex-col justify-between rounded-lg bg-white p-4 shadow-sm">
                <SidebarNav {...sidebarProps} />

                <div className="pt-4 border-t">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </aside>

            <div className="relative flex min-w-0 flex-1 h-full min-h-0">
              {/* MAIN CONTENT */}
              <main className="min-w-0 flex-1 h-full min-h-0 overflow-y-auto">
                <div className="pb-6">
                  {header && <div className="mb-4">{header}</div>}
                  {children}
                </div>
              </main>

              {/* RIGHT SIDEBAR (desktop xl) */}
              <aside
                className={[
                  "hidden xl:flex h-full shrink-0 transition-[width] duration-300 ease-in-out",
                  rightSidebarOpen ? "w-[360px]" : "w-0",
                ].join(" ")}
                aria-hidden={!rightSidebarOpen}
              >
                <div
                  className={[
                    "h-full w-[360px] overflow-y-auto border-l bg-white",
                    "transition-all duration-300 ease-in-out",
                    rightSidebarOpen
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-4 pointer-events-none",
                  ].join(" ")}
                >
                  {rightSidebar}
                </div>
              </aside>

              {/* RIGHT SIDEBAR OVERLAY (mobile/tablet) */}
              <div
                className={[
                  "xl:hidden fixed inset-0 z-50",
                  rightSidebarOpen ? "" : "pointer-events-none",
                ].join(" ")}
              >
                <div
                  className={[
                    "absolute inset-0 bg-black/40 transition-opacity duration-300",
                    rightSidebarOpen ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                  onClick={() => onCloseRightSidebar?.()}
                />

                <div
                  className={[
                    "absolute right-0 top-0 h-full w-[92%] max-w-[420px] bg-white shadow-xl",
                    "transition-transform duration-300 ease-in-out",
                    rightSidebarOpen ? "translate-x-0" : "translate-x-full",
                  ].join(" ")}
                >
                  <div className="h-full p-3">{rightSidebar}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optional: spacing for floating button on mobile */}
      <div className="lg:hidden h-16" />
    </div>
  );
}
