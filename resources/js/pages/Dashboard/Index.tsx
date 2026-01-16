import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import route from "@/lib/route";
import { Epic } from "@/types/epic";
import { useEpicFilters } from "./useEpicFilter";
import EpicTable from "@/components/epics/EpicTable";
import EpicFilters from "@/components/epics/EpicFilter";
import EpicCreateModal from "@/components/epics/EpicCreateModal";

export default function Dashboard({ epics }: { epics: Epic[] }) {
  const { auth }: any = usePage().props;
  const isPM = auth?.user?.role === "PM";

  const filter = useEpicFilters(epics);
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <AuthenticatedLayout
      header={
        <>
          <h2 className="text-2xl font-bold">Epics</h2>
          <Breadcrumbs
            items={[
              { label: "Home", href: route("dashboard") },
              { label: "Epics" },
            ]}
          />
        </>
      }
    >
      <Head title="Dashboard" />

      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Epics</h3>

          {isPM && (
            <button
              onClick={() => setOpenCreate(true)}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
            >
              + Create Epic
            </button>
          )}
        </div>

        <EpicFilters
          q={filter.q}
          setQ={filter.setQ}
          priority={filter.priority}
          setPriority={filter.setPriority}
          status={filter.status}
          setStatus={filter.setStatus}
          total={epics.length}
          filtered={filter.filtered.length}
          onClear={filter.reset}
        />

        <EpicTable epics={filter.filtered} />
      </div>

      {isPM && (
        <EpicCreateModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
        />
      )}
    </AuthenticatedLayout>
  );
}
