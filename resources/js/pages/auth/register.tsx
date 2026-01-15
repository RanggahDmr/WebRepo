import { Head, Link, useForm } from "@inertiajs/react";
import route from '@/lib/route';
export default function Register() {
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email: "",
    role: "PROGRAMMER" as "PM" | "SAD" | "PROGRAMMER",
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
              <input className="mt-1 w-full rounded-md border p-2"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
              />
              {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
            </div>

            <div>
              <label className="text-sm">Email</label>
              <input className="mt-1 w-full rounded-md border p-2"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
              />
              {errors.email && <div className="text-sm text-red-600">{errors.email}</div>}
            </div>

            <div>
              <label className="text-sm">Role</label>
              <select
                className="mt-1 w-full rounded-md border p-2"
                value={data.role}
                onChange={(e) => setData("role", e.target.value as any)}
              >
                <option value="PM">PM</option>
                <option value="SAD">SAD</option>
                <option value="PROGRAMMER">PROGRAMMER</option>
              </select>
              {errors.role && <div className="text-sm text-red-600">{errors.role}</div>}
            </div>

            <div>
              <label className="text-sm">Password</label>
              <input type="password" className="mt-1 w-full rounded-md border p-2"
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
              />
              {errors.password && <div className="text-sm text-red-600">{errors.password}</div>}
            </div>

            <div>
              <label className="text-sm">Confirm Password</label>
              <input type="password" className="mt-1 w-full rounded-md border p-2"
                value={data.password_confirmation}
                onChange={(e) => setData("password_confirmation", e.target.value)}
              />
            </div>

            <button disabled={processing} className="w-full rounded-md bg-black py-2 text-white disabled:opacity-60">
              Register
            </button>

            <div className="text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link className="underline" href={route("login")}>
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
