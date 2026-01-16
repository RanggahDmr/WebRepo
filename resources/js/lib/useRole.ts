import { usePage } from "@inertiajs/react";

export function useRole() {
  const { auth }: any = usePage().props;
  return {
    user: auth?.user,
    isPM: auth?.user?.role === "PM",
  };
}
