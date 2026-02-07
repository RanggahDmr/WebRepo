import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import route from "@/lib/route";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Epic } from "@/types/epic";
import { Story } from "@/types/story";
import EpicSummary from "@/components/epics/EpicSumary";
import StoryFilters from "@/components/epics/StoryFilters";
import StoryTable from "@/components/epics/StoryTable";
import StoryCreateModal from "@/components/epics/StoryCreateModal";
import StoryEditModal from "@/components/epics/StoryEditModal";
import { useRole } from "@/lib/useRole";
import { pickDefaultId, normalizeText } from "@/lib/master";

type MasterItem = {
  id: number;
  key?: string;
  name: string;
  is_default?: boolean;
  is_done?: boolean;
  color?: string | null;
};

export default function Show({
  epic,
  stories,
}: {
  epic: Epic;
  stories: Story[];
}) {
  const { canCreateStory } = useRole();
  const page: any = usePage().props;

  const storyStatuses: MasterItem[] = page.storyStatuses ?? [];
  const storyPriorities: MasterItem[] = page.storyPriorities ?? [];

  // default master ids (kalau kamu pengen default ke backlog, keep. kalau mau ALL, set null)
  const defaultStatusId = pickDefaultId(storyStatuses, "backlog"); // bisa null kalau tidak ketemu
  const defaultPriorityId = pickDefaultId(storyPriorities); // bisa null

  // FILTER STATE (master-based)
  const [q, setQ] = useState("");
  const [statusId, setStatusId] = useState<number | null>(null); //  default ALL biar ga ngunci backlog
  const [priorityId, setPriorityId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const qq = normalizeText(q);

    return (stories ?? []).filter((s: any) => {
      const okQuery =
        !qq ||
        normalizeText(s.title).includes(qq) ||
        normalizeText(s.description ?? "").includes(qq) ||
        normalizeText(s.code ?? "").includes(qq);

      const sStatusId = s.status_id ?? s.statusMaster?.id ?? null;
      const sPriorityId = s.priority_id ?? s.priorityMaster?.id ?? null;

      const okStatus = statusId == null ? true : sStatusId === statusId;
      const okPriority = priorityId == null ? true : sPriorityId === priorityId;

      return okQuery && okStatus && okPriority;
    });
  }, [stories, q, statusId, priorityId]);

  // MODALS
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Story | undefined>(undefined);

  return (
    <AuthenticatedLayout
      header={
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Stories</h2>
          <Breadcrumbs
            items={[
              { label: "Board", href: route("dashboard") },
              { label: "Epics", href: route("dashboard") },
              { label: epic.code ?? "Epic" },
            ]}
          />
        </div>
      }
    >
      <Head title={`Stories - ${epic.code ?? epic.uuid}`} />

      <div className="space-y-4">
        <EpicSummary epic={epic} />

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold"></h3>

            {canCreateStory && (
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 sm:w-auto"
                onClick={() => setCreateOpen(true)}
              >
                + Create Story
              </button>
            )}
          </div>

          <StoryFilters
            q={q}
            setQ={setQ}
            statusId={statusId}
            setStatusId={setStatusId}
            priorityId={priorityId}
            setPriorityId={setPriorityId}
            statuses={storyStatuses}
            priorities={storyPriorities}
            total={stories?.length ?? 0}
            filtered={filtered.length}
            onClear={() => {
              setQ("");
              setStatusId(null); //  reset ke ALL
              setPriorityId(null);
            }}
          />

          {/* NOTE: StoryTable kamu sudah pakai inline select master, jadi aman */}
          <StoryTable stories={filtered as any} />
        </div>
      </div>

      <StoryCreateModal
        epicUuid={epic.uuid}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {editing && (
        <StoryEditModal
          story={editing}
          onClose={() => setEditing(undefined)}
        />
      )}
    </AuthenticatedLayout>
  );
}
