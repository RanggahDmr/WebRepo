import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, Link } from "@inertiajs/react";
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

export default function Show({
  epic,
  stories,
}: {
  epic: Epic;
  stories: Story[];
}) {
  const { canCreateStory } = useRole();

  // filters
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState<"" | Story["priority"]>("");
  const [status, setStatus] = useState<"" | Story["status"]>("");

  const filtered = useMemo(() => {
    const query = q.toLowerCase();

    return stories.filter((s) => {
      const okQuery =
        !query ||
        s.title.toLowerCase().includes(query) ||
        (s.description ?? "").toLowerCase().includes(query) ||
        (s.code ?? "").toLowerCase().includes(query);

      return (
        okQuery &&
        (!priority || s.priority === priority) &&
        (!status || s.status === status)
      );
    });
  }, [stories, q, priority, status]);

  // modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Story | undefined>();
   console.log("editing", editing)
  return (
    <AuthenticatedLayout
      header={
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Stories</h2>
          <Breadcrumbs
            items={[
              { label: "Home", href: route("dashboard") },
              { label: "Epics", href: route("dashboard") },
              { label: epic.code },
            ]}
          />
        </div>
      }
    >
      <Head title={`Stories - Epic #${epic.id}`} />

      <div className="space-y-4">
        <EpicSummary epic={epic} />

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold"></h3>
            
            {canCreateStory && (
              <button
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                onClick={() => setCreateOpen(true)}
              >
                + Create Story
              </button>
            )}
            
          </div>

          <StoryFilters
            q={q}
            setQ={setQ}
            priority={priority}
            setPriority={setPriority}
            status={status}
            setStatus={setStatus}
            total={stories.length}
            filtered={filtered.length}
            onClear={() => {
              setQ("");
              setPriority("");
              setStatus("");
            }}
          />

          <StoryTable
            stories={filtered}
          />
        </div>
      </div>

      <StoryCreateModal
        epicCode={epic.code}
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
