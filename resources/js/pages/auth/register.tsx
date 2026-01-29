import { Head, Link, useForm } from "@inertiajs/react";
import route from "@/lib/route";

export default function Register() {
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(route("register.store"));
  }

  return (
    <>
      <Head title="Register" />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Register</h1>

          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm">Name</label>
              <input
                className="mt-1 w-full rounded-md border p-2"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
              />
              {errors.name && (
                <div className="text-sm text-red-600">{errors.name}</div>
              )}
            </div>

            <div>
              <label className="text-sm">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border p-2"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
              />
              {errors.email && (
                <div className="text-sm text-red-600">{errors.email}</div>
              )}
            </div>

            <div>
              <label className="text-sm">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border p-2"
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
              />
              {errors.password && (
                <div className="text-sm text-red-600">{errors.password}</div>
              )}
            </div>

            <div>
              <label className="text-sm">Confirm Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border p-2"
                value={data.password_confirmation}
                onChange={(e) => setData("password_confirmation", e.target.value)}
              />
              {errors.password_confirmation && (
                <div className="text-sm text-red-600">
                  {errors.password_confirmation}
                </div>
              )}
            </div>

            <button
              disabled={processing}
              className="w-full rounded-md bg-black py-2 text-white disabled:opacity-60"
            >
              Register
            </button>

            <div className="text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link className="underline" href={route("login")}>
                Login
              </Link>
            </div>

            <div className="text-xs text-gray-500">
              Setelah register, akun kamu harus di-assign role oleh PM sebelum bisa login.
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
