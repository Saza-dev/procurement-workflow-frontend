"use client";

import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "react-hot-toast";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  // 1. Loading State (Brutalist Style)
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-8 flex flex-col items-center justify-center space-y-4 border-4 border-gray-100 mt-10">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent animate-spin"></div>
        <p className="text-[10px] font-black/20 uppercase tracking-widest text-gray-500 animate-pulse">
          Verifying session...
        </p>
      </div>
    );
  }

  // 2. Error State
  if (!user) {
    return (
      <div className="max-w-md mx-auto p-8 bg-red-50 border-4 border-red-600 text-center mt-10">
        <h2 className="text-red-700 font-black/20 uppercase tracking-tighter text-xl mb-2">
          Session Expired
        </h2>
        <p className="text-red-600 text-xs font-bold mb-6 uppercase">
          Please log in again to view your profile.
        </p>
        <a
          href="/login"
          className="inline-block bg-red-600 text-white px-6 py-3 text-xs font-black/20 uppercase tracking-widest hover:bg-red-700 transition-all"
        >
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border-4 border-gray-900 shadow-[10px_10px_0px_0px_#f3f4f6] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 sm:p-10 border-b-4 border-gray-100">
        {/* Profile Avatar (Square) */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-900 flex items-center justify-center text-white text-4xl font-black/20 shrink-0 border-4 border-orange-500">
          {user.email.charAt(0).toUpperCase()}
        </div>

        <div className="text-center sm:text-left">
          <p className="text-[10px] font-black/20 text-orange-500 uppercase tracking-[0.3em] mb-1">
            Verified User
          </p>
          <h2 className="text-3xl sm:text-4xl font-black/20 text-gray-900 uppercase tracking-tighter leading-none">
            User Profile
          </h2>
          <p className="text-gray-400 text-xs font-bold uppercase mt-2">
            Manage your account details and role
          </p>
        </div>
      </div>

      {/* --- INFO GRID --- */}
      <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Card */}
        <div className="p-5 bg-gray-50 border-2 border-gray-100">
          <label className="block text-[10px] font-black/20 text-gray-400 uppercase tracking-widest mb-2">
            Email Address
          </label>
          <p className="text-gray-900 font-bold break-all text-sm sm:text-base">
            {user.email}
          </p>
        </div>

        {/* Role Card */}
        <div className="p-5 bg-gray-50 border-2 border-gray-100">
          <label className="block text-[10px] font-black/20 text-gray-400 uppercase tracking-widest mb-2">
            Assigned Role
          </label>
          <div className="flex items-center">
            <span className="px-2 py-1 bg-gray-900 text-white text-[10px] font-black/20 uppercase mr-3">
              {user.role}
            </span>
            <p className="text-gray-900 font-bold text-sm uppercase">
              {user.role === "DH" ? "Dept. Head" : user.role}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="p-5 bg-gray-50 border-2 border-gray-100 md:col-span-2">
          <label className="block text-[10px] font-black/20 text-gray-400 uppercase tracking-widest mb-2">
            System Connectivity
          </label>
          <div className="flex items-center text-green-600 text-xs font-black/20 uppercase">
            <div className="w-3 h-3 bg-green-500 mr-3 animate-pulse"></div>
            Verified Secure Session (Cookie-based)
          </div>
        </div>
      </div>

      {/* --- FOOTER SECTION --- */}
      <div className="p-6 bg-gray-50 border-t-4 border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[9px] font-black/20 text-gray-400 uppercase tracking-widest">
          Procurement ID: #USR-{user.id || "N/A"}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="text-[10px] font-black/20 text-gray-900 hover:text-orange-500 transition-colors flex items-center uppercase tracking-widest group"
        >
          <svg
            className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
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
