export default function formatDateTime(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  // contoh output: "15/01/2026, 14.17" tergantung locale browser
  return d.toLocaleString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
