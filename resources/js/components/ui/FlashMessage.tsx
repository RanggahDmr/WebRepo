import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import clsx from "clsx";

type Flash = {
  success?: string;
  error?: string;
};

export default function FlashMessage() {
  const { flash } = usePage().props as { flash?: Flash };
  const [visible, setVisible] = useState(true);

  const message = flash?.success || flash?.error;
  const type = flash?.success ? "success" : flash?.error ? "error" : null;

  useEffect(() => {
    if (message) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div
      className={clsx(
        "fixed right-6 top-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg transition",
        {
          "bg-black text-white": type === "success",
          "bg-red-600 text-white": type === "error",
        }
      )}
    >
      {message}
    </div>
  );
}
