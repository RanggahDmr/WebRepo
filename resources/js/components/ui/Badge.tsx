export default function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: string;
}) {
  const styles: Record<string, string> = {
    LOW: "bg-green-300 text-gray-700",
    MEDIUM: "bg-orange-400 text-gray-800",
    HIGH: "bg-red-500 text-white",
    TODO: "bg-red-500 text-white",
    IN_PROGRESS: "bg-green-300 text-gray-800",
    IN_REVIEW: "bg-green-500 text-white",
    DONE: "bg-black text-white",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        styles[variant] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {children}
    </span>
  );

  
}
