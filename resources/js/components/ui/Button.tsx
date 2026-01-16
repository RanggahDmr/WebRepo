import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({
  variant = "primary",
  className,
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60",
        {
          primary: "bg-black text-white hover:bg-gray-900",
          secondary: "border text-gray-700 hover:bg-gray-50",
          danger: "bg-red-600 text-white hover:bg-red-700",
        }[variant],
        className
      )}
    />
  );
}
