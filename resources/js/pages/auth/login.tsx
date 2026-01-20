import { Head, Link, useForm } from "@inertiajs/react";
import { FormEvent } from "react";
import route from "@/lib/route";
import toast from "react-hot-toast";
import { motion } from 'motion/react';
import TrueFocus from "@/components/TrueFocus";



export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  function submit(e: FormEvent) {
    e.preventDefault();

    post(route("login.store"), {
      onSuccess: () => toast.success("Login berhasil"),
      onError: () => toast.error("Email atau password salah"),
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
            Project management tool for developers. Track epics, stories, and tasks with clarity.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center bg-white px-6">
          <div className="w-full max-w-md border-2 border-black p-10 rounded-sm">
            <h2 className="text-2xl font-bold text-black">
              Login
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Masuk ke WebRepo
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2
                             focus:outline-none focus:ring-2 focus:ring-black"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2
                             focus:outline-none focus:ring-2 focus:ring-black"
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password}
                  </p>
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

              {/* Button */}
              <button
                disabled={processing}
                className="w-full rounded-md bg-black py-2.5 text-white
                           hover:bg-gray-900 transition
                           disabled:opacity-60"
              >
                {processing ? "Loading..." : "Login"}
              </button>

              {/* Register */}
              <p className="text-center text-sm text-gray-600">
                don't have account?{" "}
                <Link
                  href={route("register")}
                  className="font-medium text-black underline"
                >
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
