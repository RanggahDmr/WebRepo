import { usePage } from "@inertiajs/react";
import { can, canAny } from "@/lib/can";

export function useRole() {
  const { auth }: any = usePage().props;

  return {
    canManageBoards: can(auth, "manage_boards"),
    canManageMembers: can(auth, "manage_members"),
    canManageRoles: can(auth, "manage_roles"),
    canCreateEpic: can(auth, "create_epic"),
    canUpdateEpic: can(auth, "update_epic"),
    canCreateStory: can(auth, "create_story"),
    canUpdateStory: can(auth, "update_story"),
    canCreateTask: can(auth, "create_task"),
    canUpdateTask: can(auth, "update_task"),
    canViewHistory: can(auth, "view_history"),
    canViewMonitoring: can(auth, "view_monitoring"),
    canAny,
  };
}
