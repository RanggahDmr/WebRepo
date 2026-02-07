export default function Badge({
  children,
  variant,
  color = null,
}: {
  children: React.ReactNode;
  variant: string;
  color?: string | null;
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

  const className =
    styles[variant] ?? "bg-gray-100 text-gray-700";

  // ✅ kalau color dari DB ada, override background
  const style = color
    ? {
        backgroundColor: color,
        // text auto: kalau warnanya gelap -> putih, kalau terang -> hitam
        color: isDark(color) ? "#fff" : "#111",
      }
    : undefined;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${className}`}
      style={style}
      title={variant}
    >
      {children}
    </span>
  );
}

// helper kecil untuk deteksi warna gelap
function isDark(hex: string) {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return false;

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  // luminance
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l < 0.55;
}
