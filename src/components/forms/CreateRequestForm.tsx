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
        toast.success("Bucket created successfully!"); // 2. Success toast
        setTitle("");
        setJustification("");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to create request";
      toast.error(errorMessage); // 3. Error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 -xl shadow-md border border-gray-200">
      {/* Toaster component can be here or in your layout.tsx */}
      <Toaster position="top-right" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bucket Title
          </label>
          <input
            type="text"
            placeholder="e.g., Office Hardware Upgrade"
            value={title}
            disabled={loading}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 disabled:bg-gray-50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Justification
          </label>
          <textarea
            placeholder="Describe why this bucket is being created..."
            value={justification}
            disabled={loading}
            onChange={(e) => setJustification(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 disabled:bg-gray-50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center py-2.5 -lg font-semibold text-white transition-all ${
            loading
              ? "bg-orange-300 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <>
              <LoadingSpinner />
            </>
          ) : (
            "Create Bucket"
          )}
        </button>
      </form>
    </div>
  );
}
