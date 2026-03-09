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
      const response = await api.auth.login({
        email,
        password,
      });

      const user = response.data.data.user;

      await login(user);

      toast.success("Login successful!");

      switch (user.role) {
        case "DH":
          router.push("/dh");
          break;
        case "CEO":
          router.push("/ceo");
          break;
        case "HR":
          router.push("/hr");
          break;
        case "PE":
          router.push("/procurement");
          break;
        case "FM":
          router.push("/finance");
          break;
        case "OM":
          router.push("/operations");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Invalid credentials";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Toaster position="top-right" />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 -xl shadow-lg w-full max-w-sm border border-gray-200"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-2">
            Please enter your details
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-orange-500 text-white py-2.5 -lg font-bold hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center disabled:bg-orange-300"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent -full animate-spin mr-2"></div>
          ) : null}
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
