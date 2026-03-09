"use client";

import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "react-hot-toast";

export default function ProfilePage() {
  const { user, isLoading } = useAuth(); 

  // 1. Handle the initial session check loading state
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 -full animate-spin"></div>
        <p className="text-gray-500 animate-pulse">Verifying session...</p>
      </div>
    );
  }

  // 2. Handle the case where the cookie is invalid/expired
  if (!user) {
    return (
      <div className="max-w-md mx-auto p-8 bg-red-50 border border-red-100 -2xl text-center">
        <h2 className="text-red-700 font-bold mb-2">Session Expired</h2>
        <p className="text-red-600 text-sm mb-4">
          Please log in again to view your profile.
        </p>
        <a href="/login" className="text-sm font-bold underline text-red-700">
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white -3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />

      <div className="flex items-center space-x-6 mb-8">
        {/* Profile Avatar Placeholder */}
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 -2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-orange-100">
          {user.email.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2 className="text-2xl font-black text-gray-900">User Profile</h2>
          <p className="text-gray-400 text-sm">
            Manage your account details and role
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Card */}
        <div className="p-4 bg-gray-50 -2xl border border-gray-100">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Email Address
          </label>
          <p className="text-gray-800 font-medium break-all">{user.email}</p>
        </div>

        {/* Role Card */}
        <div className="p-4 bg-gray-50 -2xl border border-gray-100">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Assigned Role
          </label>
          <div className="flex items-center mt-1">
            <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold -md mr-2">
              {user.role}
            </span>
            <p className="text-gray-800 font-medium">
              {user.role === "DH" ? "Department Head" : user.role}
            </p>
          </div>
        </div>

        {/* Account ID / Metadata */}
        <div className="p-4 bg-gray-50 -2xl border border-gray-100 md:col-span-2">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            System Status
          </label>
          <div className="flex items-center text-green-600 text-sm font-bold">
            <div className="w-2 h-2 bg-green-500 -full mr-2 animate-pulse"></div>
            Verified Secure Session (Cookie-based)
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
        <button
          onClick={() => window.location.reload()}
          className="text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors flex items-center"
        >
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Sync with Server
        </button>
      </div>
    </div>
  );
}
