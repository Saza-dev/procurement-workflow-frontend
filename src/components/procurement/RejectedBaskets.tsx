"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api";
import { Toaster, toast } from "react-hot-toast";
import { RequestBasket } from "@/types/procurement";
import BasketDetailView from "./BasketDetailsView";

export default function RejectedBaskets() {
  const [requests, setRequests] = useState<RequestBasket[]>([]);
  const [loading, setLoading] = useState(true);

  // Track which basket is currently being edited
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchRejected = async () => {
    try {
      setLoading(true);
      const res = await api.requests.viewAllByStatus(
        "REJECTED_REVISION_REQUIRED",
      );
      setRequests(res.data?.data?.baskets || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejected();
  }, []);

  if (loading)
    return (
      <div className="p-10 sm:p-20 text-center animate-pulse text-gray-400 font-black/20 uppercase tracking-widest">
        Loading Rejected Requests...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white min-h-screen">
      <Toaster position="top-right" />

      {/* --- HEADER --- */}
      <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black/20 text-red-600 tracking-tighter uppercase leading-none">
            Revision Required
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 font-bold uppercase tracking-tight">
            Fix the issues mentioned in the feedback and resubmit your request.
          </p>
        </div>
        <div className="bg-red-50 px-4 py-2 border-2 border-red-600 shrink-0">
          <span className="text-red-600 font-black/20 text-[10px] sm:text-xs uppercase tracking-widest">
            {requests.length} Baskets Rejected
          </span>
        </div>
      </div>

      {/* --- LIST --- */}
      <div className="space-y-6 sm:space-y-10">
        {requests.length === 0 ? (
          <div className="text-center py-20 sm:py-32 bg-gray-50  border-dashed border-gray-200">
            <p className="text-gray-400 font-black/20 uppercase tracking-widest text-sm sm:text-lg">
              No rejected requests. Your workflow is clean!
            </p>
          </div>
        ) : (
          requests.map((basket) => (
            <div
              key={basket.id}
              className={`group bg-white border transition-all overflow-hidden ${
                expandedId === basket.id
                  ? "border-orange-500 shadow-[10px_10px_0px_0px_rgba(249,115,22,0.1)]"
                  : "border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] hover:border-red-600"
              }`}
            >
              <div className="p-5 sm:p-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[9px] font-black/20 bg-red-600 text-white px-3 py-1 uppercase tracking-widest">
                        Needs Revision
                      </span>
                      <span className="text-[10px] font-black/20 text-gray-400 uppercase tracking-widest">
                        ID #{basket.id}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-3xl font-black/20 text-gray-900 uppercase tracking-tight">
                      {basket.title}
                    </h3>
                  </div>
                  <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto border-gray-100">
                    <p className="text-[8px] sm:text-[10px] font-black/20 text-gray-400 uppercase tracking-widest mb-1 leading-none">
                      Total Value
                    </p>
                    <p className="text-2xl sm:text-3xl font-black/20 text-gray-900 leading-none">
                      ${Number(basket.totalValue).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* THE REJECTION REASON */}
                <div className="bg-red-50 border-2 border-red-600 p-5 sm:p-8 mb-8 relative">
                  <div className="absolute -top-3 left-6 bg-red-600 text-white text-[8px] sm:text-[9px] font-black/20 px-3 py-1 uppercase tracking-widest">
                    Feedback from Approver
                  </div>
                  <p className="text-xs sm:text-sm text-red-900 font-bold italic leading-relaxed uppercase tracking-tight">
                    "
                    {(basket as any).approvals?.find((a: any) => a.comment)
                      ?.comment ||
                      "No specific comment provided. Check item details for errors."}
                    "
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600"></div>
                    <p className="text-[9px] sm:text-[10px] font-black/20 text-red-600 uppercase tracking-widest">
                      Rejected by{" "}
                      {(basket as any).approvals?.find((a: any) => a.comment)
                        ?.role || "Manager"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-50">
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === basket.id ? null : basket.id)
                    }
                    className={`w-full py-4 font-black/20 text-[10px] sm:text-xs transition-all uppercase tracking-[0.2em] border-2 ${
                      expandedId === basket.id
                        ? "bg-orange-600 text-white border-orange-600 shadow-lg active:scale-95"
                        : "bg-white border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                    }`}
                  >
                    {expandedId === basket.id
                      ? "Close Editor"
                      : "Edit & Fix Items"}
                  </button>
                </div>

                {/* --- ITEM MANAGEMENT VIEW --- */}
                {expandedId === basket.id && (
                  <div className="mt-8 pt-8 border-t-4 border-dashed border-orange-100 animate-in slide-in-from-top-4 duration-500">
                    <div className="mb-6">
                      <h4 className="text-[10px] sm:text-xs font-black/20 text-orange-600 uppercase tracking-[0.3em]">
                        Editor Mode
                      </h4>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase mt-1">
                        Toggle warehouse stock or update prices/links below.
                      </p>
                    </div>
                    <div className="overflow-x-hidden">
                      <BasketDetailView
                        basket={basket}
                        onRefresh={fetchRejected}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
