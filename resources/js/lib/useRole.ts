import { usePage } from "@inertiajs/react";

export function useRole() {
  const { auth }: any = usePage().props;
  const role = auth?.user?.role;

  return {
    user: auth?.user,

    // existing (biar tidak breaking)
    isPM: role === "PM",

    // new helpers
    isSAD: role === "SAD",
    isProgrammer: role === "PROGRAMMER",

    // permissions (sinkron dengan backend)
    canCreateStory: role === "PM" || role === "SAD",
    canCreateTask: role === "PM" || role === "SAD" || role === "PROGRAMMER",
  };
}
