"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoadingSpinner from "../ui/LoadingSpinner";
import { api } from "@/lib/api";

export default function CreateRequest() {
  const [title, setTitle] = useState("");
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.requests.create({
        title,
        justification,
      });

      if (response.status === 201) {
        toast.success("Bucket created successfully!");
        setTitle("");
        setJustification("");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to create request";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-10 border-1 border-gray-900 shadow-[12px_12px_0px_0px_#f3f4f6] animate-in fade-in zoom-in-95 duration-500">
      <Toaster position="top-right" />

      {/* Header for the Form */}
      <div className="mb-8">
        <p className="text-[10px]   uppercase tracking-widest mt-1">
          Step 01: Define Purpose & Scope
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-[10px]   uppercase tracking-widest mb-2 ml-1">
            Bucket Title
          </label>
          <input
            type="text"
            placeholder="E.G., OFFICE HARDWARE UPGRADE"
            value={title}
            disabled={loading}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-100 focus:border-orange-500 outline-none transition-all text-gray-900 font-bold uppercase placeholder:text-gray-200 placeholder:font-black text-[10px] disabled:bg-gray-50"
            required
          />
        </div>

        <div>
          <label className="block text-[10px]   uppercase tracking-widest mb-2 ml-1">
            Justification
          </label>
          <textarea
            placeholder="DESCRIBE WHY THIS BUCKET IS BEING CREATED..."
            value={justification}
            disabled={loading}
            onChange={(e) => setJustification(e.target.value)}
            rows={5}
            className="w-full px-5 py-4 border-2 border-gray-100 focus:border-orange-500 outline-none transition-all text-gray-900 font-bold uppercase placeholder:text-gray-200 placeholder:font-black text-[10px] disabled:bg-gray-50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center py-5 font-black uppercase text-xs tracking-[0.2em] text-white transition-all shadow-lg active:scale-[0.98] ${
            loading
              ? "bg-gray-200 cursor-n "
              : "bg-orange-600 hover:bg-gray-900 shadow-orange-100 hover:shadow-gray-200"
          }`}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <LoadingSpinner />
              <span>Initializing...</span>
            </div>
          ) : (
            "Confirm & Create Bucket"
          )}
        </button>
      </form>
    </div>
  );
}
