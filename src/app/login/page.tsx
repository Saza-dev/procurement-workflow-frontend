"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.auth.login({ email, password });
      const user = response.data.data.user;

      await login(user);
      toast.success("Login successful!");

      // Route based on role
      const roleRoutes: Record<string, string> = {
        DH: "/dh",
        CEO: "/ceo",
        HR: "/hr",
        PE: "/procurement",
        FM: "/finance",
        OM: "/operations",
      };

      router.push(roleRoutes[user.role] || "/dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Invalid credentials";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      {/* Main Container: Full width on mobile, constrained on desktop */}
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl uppercase">
            Welcome Back
          </h2>
          <p className="mt-3 text-sm text-gray-500 font-medium">
            Please enter your credentials to access the portal.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-white p-6 sm:p-10 shadow-xl border border-gray-100"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black/20 uppercase tracking-widest mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="block w-full px-5 py-4 text-gray-900 border-2 border-gray-100  placeholder-gray-300 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all disabled:bg-gray-50 text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black/20 uppercase tracking-widest mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full px-5 py-4 text-gray-900 border-2 border-gray-100  placeholder-gray-300 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all disabled:bg-gray-50 text-sm font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full mt-10 flex justify-center py-4 px-4 border border-transparent text-xs font-black uppercase tracking-widest  text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Secure Login"
            )}
          </button>

          <p className="mt-6 text-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            Procurement Workflow System v3.0
          </p>
        </form>
      </div>
    </div>
  );
}
