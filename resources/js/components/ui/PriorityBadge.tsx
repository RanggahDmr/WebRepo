import Badge from "@/components/ui/Badge";

type Priority = "LOW" | "MEDIUM" | "HIGH";

export default function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  const variantMap: Record<Priority, string> = {
    LOW: "bg-green-300 text-gray-700",
    MEDIUM: "bg-orange-400 text-gray-800",
    HIGH: "bg-red-500 text-white",
  };

  return (
    <Badge variant={variantMap[priority]}>
      {priority}
    </Badge>
  );
}
