import { Head, Link, useForm } from "@inertiajs/react";
import { FormEvent, useEffect } from "react";
import route from "@/lib/route";
import toast from "react-hot-toast";
import TrueFocus from "@/components/TrueFocus";

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  // Optional: kalau backend pakai withErrors(['auth' => '...']),
  // kita tampilkan sebagai toast (dan tidak mengganggu field errors)
  useEffect(() => {
    const authMsg = (errors as any)?.auth;
    if (authMsg) toast.error(authMsg);
  }, [(errors as any)?.auth]);

  function submit(e: FormEvent) {
    e.preventDefault();

    post(route("login.store"), {
      preserveScroll: true,

      onStart: () => {
        // optional: bersihin toast lama biar ga numpuk
        toast.dismiss();
      },

      onSuccess: () => {
        toast.success("Login success");
      },

      onError: (errs) => {
        // 1) Role / forbidden message dari backend (recommended: withErrors(['auth' => '...']))
        const authMsg = (errs as any)?.auth;
        if (authMsg) {
          toast.error(authMsg);
          return;
        }

        // 2) Validation / wrong credential (umumnya email/password ada)
        if ((errs as any)?.email || (errs as any)?.password) {
          toast.error("Email atau password salah");
          return;
        }

        // 3) Fallback
        const msg =
          (errs as any)?.message ||
          (errs as any)?.error ||
          "Login gagal. Coba lagi.";
        toast.error(msg);
      },
    });
  }

  return (
    <>
      <Head title="Login" />

      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col justify-center items-center bg-black px-12 text-white">
          <TrueFocus
            sentence="Web Repo"
            manualMode={false}
            blurAmount={5}
            borderColor="red"
            animationDuration={2}
            pauseBetweenAnimations={1}
          />
          <p className="mt-6 max-w-md text-gray-300 text-2xl">
            Project management tool for developers. Track epics, stories, and tasks
            with clarity.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center bg-white px-6">
          <div className="w-full max-w-md border-2 border-black p-10 rounded-sm">
            <h2 className="text-2xl font-bold text-black">Login</h2>
            <p className="mt-1 text-sm text-gray-500">Login ke WebRepo</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {/* Global auth error (optional show inline too) */}
              {(errors as any)?.auth && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {(errors as any).auth}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2
                             focus:outline-none focus:ring-2 focus:ring-black"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2
                             focus:outline-none focus:ring-2 focus:ring-black"
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember */}
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) => setData("remember", e.target.checked)}
                />
                Remember me
              </label>

              <button
                disabled={processing}
                className="w-full rounded-md bg-black py-2.5 text-white
                           hover:bg-gray-900 transition disabled:opacity-60"
              >
                {processing ? "Loading..." : "Login"}
              </button>

              <p className="text-center text-sm text-gray-600">
                don't have account?{" "}
                <Link href={route("register")} className="font-medium text-black underline">
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
