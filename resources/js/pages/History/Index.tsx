import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head } from "@inertiajs/react";
import HistoryTimeline from "@/components/History/HistoryTimeline";

export default function HistoryPage({ activities }: any) {
  return (
    <AuthenticatedLayout
      header={
        <div>
          <h2 className="text-2xl font-bold text-gray-900">History</h2>
          <p className="text-sm text-gray-500">
            All system activities
          </p>
        </div>
      }
    >
      <Head title="History" />

      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <HistoryTimeline activities={activities} />
      </div>
    </AuthenticatedLayout>
  );
}
