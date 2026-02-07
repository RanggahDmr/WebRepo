import SidebarNav from "./SidebarNav";

export default function MobileSidebar({
  open,
  setOpen,
  sidebarProps,
  onLogout,
}: any) {
  const close = () => setOpen(false);

  return (
    <>
      {/* Floating hamburger (mobile only) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed left-4 bottom-4 z-[9997] rounded-full bg-black text-white shadow-lg px-4 py-3 flex items-center gap-2"
        aria-label="Open menu"
        title="Menu"
      >
        <span className="text-lg leading-none">☰</span>
        <span className="text-sm font-medium">Menu</span>
      </button>

      {/* Overlay */}
      <div
        className={[
          "lg:hidden fixed inset-0 z-[9998] bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={[
          "lg:hidden fixed left-0 top-0 z-[9999] h-screen w-[290px] bg-white shadow-xl transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="h-full flex flex-col justify-between p-4">
          {/* header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold">Menu</div>
            <button
              type="button"
              onClick={close}
              className="rounded-md p-2 hover:bg-gray-100"
              aria-label="Close menu"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* nav */}
          <div className="flex-1 min-h-0">
            <SidebarNav {...sidebarProps} onNavigate={close} />
          </div>

          {/* logout */}
          <div className="pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                close();
                onLogout();
              }}
              className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
